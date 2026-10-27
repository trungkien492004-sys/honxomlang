(() => {
  const identity = window.siteIdentity, cfg = window.SITE_RANK_CONFIG;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const tiers = [{ name: 'Tân Binh', min: 0 }, { name: 'Đồng', min: 1000 }, { name: 'Bạc', min: 1200 }, { name: 'Vàng', min: 1400 }, { name: 'Bạch Kim', min: 1600 }, { name: 'Kim Cương', min: 1800 }, { name: 'Cao Thủ', min: 2000 }];
  let profile = null, poll = null, searching = false, queueBusy = false, unwatchProfile = null, unwatchStats = null;

  function localTier(rating) {
    let current = tiers[0], next = null;
    for (const tier of tiers) { if (rating >= tier.min) current = tier; else { next = tier; break; } }
    const span = next ? next.min - current.min : 0;
    return { current: current.name, next: next?.name, nextMin: next?.min, missing: next ? Math.max(0, next.min - rating) : 0,
      progress: next ? Math.max(0, Math.min(100, Math.floor((rating - current.min) * 100 / span))) : 100 };
  }
  function badge(until) { return Date.now() < until ? '<span class="newbie-badge">NEWBIE</span>' : ''; }
  async function api(type, data = {}) {
    if (!identity.user) throw Error('Cần đăng nhập Google.');
    const token = await identity.user.getIdToken();
    const response = await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ data: { type, ...data } }) });
    const body = await response.json();
    if (!response.ok || body.error) throw Error(body.error?.message || 'Không kết nối được đấu xếp hạng.');
    return body.result || body.data;
  }
  async function db() {
    await identity.whenReady;
    if (!identity.db) throw Error('Không kết nối được bảng xếp hạng.');
    return identity.db;
  }
  async function participantCount() {
    const token = await identity.user?.getIdToken();
    const response = await fetch('https://firestore.googleapis.com/v1/projects/honxomlang-e6974/databases/(default)/documents:runAggregationQuery', { method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: JSON.stringify({ structuredAggregationQuery: { structuredQuery: { from: [{ collectionId: 'site_members' }] }, aggregations: [{ alias: 'total', count: {} }] } }) });
    if (!response.ok) throw Error('Chưa tải được số người tham gia.');
    const rows = await response.json();
    return Number(rows.find(row => row.result?.aggregateFields?.total)?.result.aggregateFields.total.integerValue || 0);
  }
  function paintProgress() {
    const summary = document.getElementById('rankProgress');
    if (!summary) return;
    if (!identity.user) {
      summary.innerHTML = `<div class="rank-login-callout">
        <p>💡 Đăng nhập Google để lưu điểm Elo, xem tiến độ leo Rank và ghi danh trên Bảng Xếp Hạng!</p>
        <button type="button" class="rank-top-login-btn" id="rankModalLoginBtn">🔑 Đăng nhập Google</button>
      </div>`;
      const btn = document.getElementById('rankModalLoginBtn');
      if (btn) btn.onclick = () => identity.login();
      return;
    }
    const safeProfile = profile || {};
    const rating = Number.isFinite(Number(safeProfile.rating)) ? Number(safeProfile.rating) : 1000;
    const tier = localTier(rating);
    const newbie = safeProfile.newbie || identity.newbie || Date.now() < Number(safeProfile.newbieUntil || 0) || !safeProfile.played;
    const wins = Number(safeProfile.wins) || 0, losses = Number(safeProfile.losses) || 0, draws = Number(safeProfile.draws) || 0, played = Number(safeProfile.played) || (wins + losses + draws);
    const winrate = played > 0 ? Math.round((wins / played) * 100) : 0;
    const progress = tier.next ? `${tier.missing} Elo nữa lên ${tier.next}` : 'Đã đạt bậc cao nhất';
    summary.innerHTML = `<div class="rank-progress-top">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="tier-pill tier-${tier.current === 'Vàng' ? 'gold' : tier.current === 'Bạc' ? 'silver' : tier.current === 'Đồng' ? 'bronze' : tier.current === 'Bạch Kim' ? 'plat' : tier.current === 'Kim Cương' ? 'diamond' : 'king'}" style="font-size:13px;padding:3px 10px;">${esc(tier.current)}</span>
        <b>${rating} Elo</b>
        ${newbie ? '<span class="newbie-badge">NEWBIE x2</span>' : ''}
      </div>
      <span style="font-weight:800;color:#67e8f9;">Tỉ lệ thắng: ${winrate}%</span>
    </div>
    <div class="rank-progress-track"><i style="width:${tier.progress}%"></i></div>
    <div class="rank-progress-bottom"><span>${esc(progress)}</span><span>${wins} thắng · ${losses} thua · ${draws} hòa (${played} trận)</span></div>`;
  }
  function close() {
    window.siteRankPlayers?.stop();
    unwatchProfile?.(); unwatchStats?.(); unwatchProfile = unwatchStats = null;
    document.getElementById('rankOverlay')?.remove();
  }
  function setStatus(message) { const node = document.querySelector('#rankOverlay .rank-status'); if (node) node.textContent = message; }
  async function show(message = '') {
    close();
    const overlay = document.createElement('div'); overlay.id = 'rankOverlay'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'rankTitle');
    overlay.innerHTML = `<section class="rank-sheet">
      <header>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:26px;">🏆</span>
          <div>
            <h2 id="rankTitle" style="margin:0;font-size:20px;color:#fde047;">BẢNG XẾP HẠNG DUEL RANK</h2>
            <small style="color:#94a3b8;font-size:12px;">Đấu Sĩ Anime DM / GX · Tích lũy Elo</small>
          </div>
        </div>
        <button type="button" id="closeRank" style="padding:6px 14px;border-radius:8px;font-weight:900;">✕ Đóng</button>
      </header>
      <div class="rank-progress" id="rankProgress"></div>
      <div class="rank-table-wrap">
        <table>
          <thead>
            <tr>
              <th style="text-align:center;width:60px;">Hạng</th>
              <th>Đấu sĩ</th>
              <th>Bậc</th>
              <th>Elo</th>
              <th>Thắng / Thua</th>
              <th>Tỉ lệ</th>
              <th style="text-align:center;">Thách đấu</th>
            </tr>
          </thead>
          <tbody id="rankRows"></tbody>
        </table>
        <p id="rankEmpty" class="rank-empty">Đang tải bảng xếp hạng…</p>
      </div>
    </section>`;
    overlay.onclick = event => { if (event.target === overlay) close(); };
    overlay.onkeydown = event => { if (event.key === 'Escape') close(); };
    document.body.appendChild(overlay); document.getElementById('closeRank').onclick = close;
    try { paintProgress(); } catch (e) { console.warn('paintProgress:', e); }
    try {
      const store = await db(), profileQuery = store.collection('rank_profiles').orderBy('rating', 'desc').limit(100);
      const players = await profileQuery.get().catch(() => ({ docs: [], empty: true }));
      if (!overlay.isConnected) return;
      if (identity.user) {
        const mine = store.doc('rank_profiles/' + identity.user.uid);
        if (typeof mine.onSnapshot === 'function') unwatchProfile = mine.onSnapshot(snapshot => { profile = snapshot.exists ? { ...profile, ...snapshot.data() } : profile; paintProgress(); });
      }
      await window.siteRankPlayers.render(store, overlay, players, profileQuery);
    } catch (error) { if (overlay.isConnected) document.getElementById('rankEmpty').textContent = error.message; }
  }
  function paint() {
    const node = document.getElementById('rankIdentity');
    if (node) {
      const user = identity.user;
      const rating = Number.isFinite(Number(profile?.rating)) ? profile.rating : 1000;
      const tier = localTier(rating);
      if (user) {
        node.style.cursor = 'pointer';
        node.onclick = () => show();
        node.title = 'Bấm để xem Bảng Xếp Hạng Rank';
        node.innerHTML = `👑 <b>${esc(user.displayName || 'Đấu sĩ')}</b> <span class="tier-pill tier-${tier.current === 'Vàng' ? 'gold' : tier.current === 'Bạc' ? 'silver' : tier.current === 'Đồng' ? 'bronze' : tier.current === 'Bạch Kim' ? 'plat' : tier.current === 'Kim Cương' ? 'diamond' : 'king'}">${esc(tier.current)}</span> ${identity.newbie ? '<span class="newbie-badge">NEWBIE</span>' : ''} · <b>${rating} Elo</b>`;
      } else {
        node.style.cursor = 'default';
        node.onclick = null;
        node.innerHTML = `<button type="button" class="rank-top-login-btn" id="rankTopLoginBtn">🔑 Đăng nhập Google để tính Rank</button>`;
        const btn = document.getElementById('rankTopLoginBtn');
        if (btn) btn.onclick = (e) => { e.stopPropagation(); identity.login(); };
      }
    }
    paintProgress();
    if (typeof duel !== 'undefined' && duel?.rank) {
      const players = duel.rank.members, own = players.find(player => player.uid === identity.user?.uid), enemy = players.find(player => player.uid !== identity.user?.uid);
      for (const [name, player] of [['player', own], ['enemy', enemy]]) {
        const host = document.getElementById(name + 'Name'); if (!host || !player) continue;
        host.querySelector('.rank-player-tag')?.remove(); const tag = document.createElement('span'); tag.className = 'rank-player-tag';
        tag.innerHTML = esc(player.name) + ' · ' + player.rating + ' Elo' + badge(player.newbieUntil); host.appendChild(tag);
      }
    }
  }
  function prefs() { return { deck: [...deckList], extra: [...extraDeckList], heroId: chosenHero, policy: window.memePhase2?.settings.policy || 'balanced' }; }
  function stop() { clearInterval(poll); poll = null; searching = false; }
  async function enter(code) { stop(); close(); await window.memeAuthoritative.connect('get', code); }
  async function cancel() {
    if (queueBusy) return; queueBusy = true;
    try { const result = await api('cancel'); if (result.state === 'matched') return await enter(result.code); stop(); close(); }
    catch (error) { setStatus(error.message); } finally { queueBusy = false; }
  }
  let matchmakingTimer = null;
  let matchmakingCountdown = 15;
  let searchingMatch = false;

  function setLocalProfile(receipt) {
    if (!receipt) return;
    profile = {
      ...(profile || {}),
      rating: receipt.ratingAfter,
      wins: receipt.wins,
      losses: receipt.losses,
      draws: receipt.draws,
      played: receipt.played,
      lastMatchId: receipt.matchId
    };
    paint();
  }

  async function find() {
    if (searchingMatch) return;
    if (!identity.user) {
      await identity.login();
      if (!identity.user) return;
    }
    try { await window.memeIdDuel?.publish?.(true); } catch (_) {}

    if (typeof duel !== 'undefined' && duel && !duel.finished && document.getElementById('duel') && !document.getElementById('duel').classList.contains('hidden')) {
      return window.notify ? window.notify('Bạn đang trong một trận đấu. Hãy hoàn thành trận hiện tại trước.') : alert('Bạn đang trong một trận đấu.');
    }

    close();
    searchingMatch = true;
    matchmakingCountdown = 15;

    document.getElementById('rankMatchOverlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'rankMatchOverlay';
    overlay.className = 'rank-match-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="rank-match-modal">
        <div class="rank-match-radar">
          <div class="rank-match-pulse"></div>
          <div class="rank-match-icon">⚔️</div>
        </div>
        <h2 class="rank-match-title">Ghép Trận Rank Nhanh</h2>
        <div class="rank-match-timer">
          <span id="rankMatchSec">15</span><small>s</small>
        </div>
        <p class="rank-match-status" id="rankMatchStatus">🔍 Đang quét tìm đối thủ Online cùng đẳng cấp...</p>
        <div class="rank-match-bar">
          <div class="rank-match-bar-fill" id="rankMatchBarFill" style="width:100%"></div>
        </div>
        <p class="rank-match-hint">Ưu tiên người chơi Online trong 15 giây. Nếu không ai sẵn sàng, hệ thống sẽ tự động ghép với Đấu Sĩ Máy Huyền Thoại để tính điểm Rank!</p>
        <div class="rank-match-actions">
          <button type="button" class="secondary-btn" id="rankMatchCancelBtn">❌ Hủy tìm trận</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cancelMatchmaking = () => {
      clearInterval(matchmakingTimer);
      matchmakingTimer = null;
      searchingMatch = false;
      document.getElementById('rankMatchOverlay')?.remove();
      try { window.memeIdDuel?.cancelInvite?.(); } catch (_) {}
      if (window.notify) window.notify('Đã hủy tìm trận Rank.');
    };

    document.getElementById('rankMatchCancelBtn').onclick = cancelMatchmaking;

    // Scan duel_directory for online opponent
    try {
      const store = await db();
      const myUid = identity.user.uid;
      const snap = await store.collection('duel_directory').limit(30).get();
      const onlinePlayers = [];
      const now = Date.now();
      snap.forEach(doc => {
        const d = doc.data();
        if (d && d.uid !== myUid) {
          const seen = typeof d.lastSeen?.toMillis === 'function' ? d.lastSeen.toMillis() : (Date.parse(d.lastSeen) || Number(d.lastSeen) || 0);
          if (d.online === true && (now - seen < 90000)) {
            onlinePlayers.push(d);
          }
        }
      });

      if (onlinePlayers.length > 0) {
        const candidate = onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)];
        const statusEl = document.getElementById('rankMatchStatus');
        if (statusEl) statusEl.textContent = `🎯 Đã tìm thấy ${candidate.name}! Đang gửi lời mời thách đấu...`;
        try {
          const target = await window.memeIdDuel?.lookup?.(candidate.uid);
          if (target && window.memeIdDuel?.online?.(target)) {
            window.memeIdDuel?.invite?.(target).catch(() => {});
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Matchmaking directory scan:', e);
    }

    matchmakingTimer = setInterval(() => {
      matchmakingCountdown--;
      const secEl = document.getElementById('rankMatchSec');
      const barEl = document.getElementById('rankMatchBarFill');
      if (secEl) secEl.textContent = matchmakingCountdown;
      if (barEl) barEl.style.width = ((matchmakingCountdown / 15) * 100) + '%';

      if (window.memeOnlineIsPlaying?.()) {
        clearInterval(matchmakingTimer);
        matchmakingTimer = null;
        searchingMatch = false;
        document.getElementById('rankMatchOverlay')?.remove();
        return;
      }

      if (matchmakingCountdown <= 0) {
        clearInterval(matchmakingTimer);
        matchmakingTimer = null;
        searchingMatch = false;

        try { window.memeIdDuel?.cancelInvite?.(); } catch (_) {}

        const statusEl = document.getElementById('rankMatchStatus');
        if (statusEl) statusEl.textContent = '⏱️ Không có đối thủ Online. Đang ghép với Đấu Sĩ Máy Huyền Thoại...';

        const LEGEND_BOTS = [
          { name: 'Joey Wheeler', preset: 'Joey · Rồng Đen Bất Diệt', elo: 1150 },
          { name: 'Pegasus', preset: 'Pegasus · Vương Quốc Hoạt Hình', elo: 1250 },
          { name: 'Jaden Yuki', preset: 'Jaden · Anh Hùng Tối Thượng', elo: 1350 },
          { name: 'Zane Truesdale', preset: 'Zane · Rồng Máy Tận Diệt', elo: 1450 },
          { name: 'Seto Kaiba', preset: 'Kaiba · Đỉnh Cao Mắt Xanh', elo: 1550 },
          { name: 'Yugi Muto', preset: 'Yugi · Ma Thuật Tối Thượng', elo: 1600 }
        ];

        const myRating = Number(profile?.rating) || 1000;
        let chosenBot = LEGEND_BOTS.find(b => myRating <= b.elo) || LEGEND_BOTS[LEGEND_BOTS.length - 1];

        setTimeout(() => {
          document.getElementById('rankMatchOverlay')?.remove();
          if (window.notify) window.notify(`⚔️ Ghép thành công! Đối thủ: ${chosenBot.name} (${chosenBot.elo} Elo)`);
          if (typeof startGame === 'function') {
            startGame({ customBotDeck: chosenBot.preset });
          }
        }, 700);
      }
    }, 1000);
  }

  const footer = document.querySelector('#lobby .lobby-footer');
  if (footer) {
    footer.classList.add('rank-actions');
    for (const [id, text, action] of [['rankPlayBtn', '⚔️ Đấu Rank nhanh', find], ['rankBoardBtn', '🏆 Bảng Xếp Hạng', show]]) {
      const button = document.createElement('button'); button.type = 'button'; button.id = id;
      button.className = id === 'rankPlayBtn' ? 'rank-quick-btn' : 'secondary-btn';
      button.textContent = text; button.onclick = action; footer.appendChild(button);
    }
    const pill = document.createElement('div'); pill.id = 'rankIdentity'; pill.className = 'rank-identity'; document.querySelector('#lobby .topbar').after(pill);
  } else for (const selector of ['#gameModeScreen', '#loginScreen .login-box']) {
    const host = document.querySelector(selector);
    if (host) { const bar = document.createElement('div'); bar.className = 'rank-parent-actions'; const button = document.createElement('button'); button.textContent = 'RANK'; button.onclick = show; bar.appendChild(button); host.appendChild(bar); }
  }

  async function loadProfile(user) {
    profile = null;
    if (!user) { paint(); return; }
    if (cfg.enabled) {
      try { profile = (await api('register')).profile; }
      catch (error) { console.warn('Rank profile:', error.message); }
    } else {
      try { const store = await db(), snapshot = await store.doc('rank_profiles/' + user.uid).get(); if (snapshot.exists) profile = snapshot.data(); }
      catch { /* The public board remains usable when no profile exists yet. */ }
    }
    paint();
  }
  identity.subscribe(async ({ user, ready }) => { if (!ready) return; if (!user) { stop(); profile = null; paint(); return; } await loadProfile(user); });
  if (typeof render === 'function') { const before = render; render = () => { before(); paint(); }; }
  if (typeof memeShowResult === 'function') {
    const before = memeShowResult;
    memeShowResult = (...args) => { before(...args); if (!duel?.rankResult) return; const host = document.getElementById('modalContent');
      if (host && !host.querySelector('.rank-result')) { const box = document.createElement('div'); box.className = 'rank-result'; box.innerHTML = duel.rankResult.players.map(player => `${esc(player.name)}: <b>${player.delta >= 0 ? '+' : ''}${player.delta} Elo</b> · ${player.after} Elo`).join('<br>'); host.appendChild(box); }
    };
  }
  function showRankPromo() {
    document.getElementById('rankPromoOverlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'rankPromoOverlay';
    overlay.className = 'rank-promo-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'rankPromoTitle');
    overlay.innerHTML = `
      <div class="rank-promo-card">
        <button type="button" class="rank-promo-close" id="closeRankPromo" aria-label="Đóng">✕</button>
        <div class="rank-promo-badge">🔥 KHỞI TRANH MÙA GIẢI XẾP HẠNG (RANK) 🔥</div>
        <h2 id="rankPromoTitle">Đấu Trí Đỉnh Cao · Tranh Đoạt Ngôi Vua Xóm Anh Hùng</h2>
        <p class="rank-promo-subtitle">Hệ thống Rank & Elo đã chính thức mở toàn diện cho tất cả Đấu Sĩ!</p>
        <div class="rank-promo-features">
          <div class="rank-promo-item">
            <span class="rank-promo-icon">🤖⚔️</span>
            <div>
              <b>Đấu Với Máy & Online Đều Tính Rank</b>
              <p>Mỗi trận thắng trước Kaiba, Yugi, Joey, Pegasus, Jaden, Zane... hay đối thủ online đều được ghi nhận trực tiếp vào <b>Elo & BXH</b>!</p>
            </div>
          </div>
          <div class="rank-promo-item">
            <span class="rank-promo-icon">🔰⚡</span>
            <div>
              <b>Đặc Quyền Tân Binh (Newbie 7 Ngày Đầu)</b>
              <p>Thắng nhận <b>x2 Elo (+32 Elo/trận)</b> · Thua <b>KHÔNG bị trừ Elo</b> · Không giới hạn số trận mỗi ngày. Tha hồ cọ xát và thử nghiệm bộ bài!</p>
            </div>
          </div>
          <div class="rank-promo-item">
            <span class="rank-promo-icon">🏆📈</span>
            <div>
              <b>Hệ Thống Phân Hạng Elo Chuẩn</b>
              <p>Tân Binh ➔ Đồng (1000) ➔ Bạc (1200) ➔ Vàng (1400) ➔ Bạch Kim (1600) ➔ Kim Cương (1800) ➔ Cao Thủ (2000+).</p>
            </div>
          </div>
        </div>
        <div class="rank-promo-actions">
          <button type="button" class="primary-btn" id="promoPlayBtn">⚔️ Vào trận ngay</button>
          <button type="button" class="secondary-btn" id="promoBoardBtn">🏆 Xem Bảng Xếp Hạng</button>
          <button type="button" class="secondary-btn" id="promoDismissBtn">Đã hiểu</button>
        </div>
      </div>
    `;
    const dismiss = () => {
      try { sessionStorage.setItem('rank-promo-dismissed', '1'); } catch {}
      overlay.remove();
    };
    overlay.onclick = event => { if (event.target === overlay) dismiss(); };
    overlay.onkeydown = event => { if (event.key === 'Escape') dismiss(); };
    document.body.appendChild(overlay);
    document.getElementById('closeRankPromo').onclick = dismiss;
    document.getElementById('promoDismissBtn').onclick = dismiss;
    document.getElementById('promoBoardBtn').onclick = () => { dismiss(); show(); };
    document.getElementById('promoPlayBtn').onclick = () => {
      dismiss();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.click();
    };
  }

  function tryAutoPromo() {
    try {
      if (sessionStorage.getItem('rank-promo-dismissed')) return;
      if (document.getElementById('duel') && !document.getElementById('duel').classList.contains('hidden')) return;
      showRankPromo();
    } catch {}
  }
  setTimeout(tryAutoPromo, 900);

  window.siteRank = { show, find, close, paint, setLocalProfile, showPromo: showRankPromo, refresh: async () => {
    if (identity.user) await loadProfile(identity.user);
    const overlay = document.getElementById('rankOverlay');
    if (overlay && identity.db) {
      try {
        const store = await db(), profileQuery = store.collection('rank_profiles').orderBy('rating', 'desc').limit(100);
        const players = await profileQuery.get();
        if (overlay.isConnected && window.siteRankPlayers?.render) await window.siteRankPlayers.render(store, overlay, players, profileQuery);
      } catch (_) {}
    }
  }, get profile() { return profile; } };
})();
