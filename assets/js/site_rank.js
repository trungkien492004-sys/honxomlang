(() => {
  const identity = window.siteIdentity, cfg = window.SITE_RANK_CONFIG;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const tiers = [{ name: 'Tân Binh', min: 0 }, { name: 'Đồng', min: 1000 }, { name: 'Bạc', min: 1200 }, { name: 'Vàng', min: 1400 }, { name: 'Bạch Kim', min: 1600 }, { name: 'Kim Cương', min: 1800 }, { name: 'Cao Thủ', min: 2000 }];
  let profile = null, poll = null, searching = false, queueBusy = false, unwatchProfile = null, unwatchStats = null;

  function showRankError(error, context = 'Đấu Rank') {
    const rawMsg = typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error) || 'Lỗi không xác định');
    const msgStr = String(rawMsg);
    if (msgStr.includes('Missing or insufficient permissions') || (msgStr.includes('permission-denied') && (context === 'Hệ thống Rank' || context.includes('Đồng bộ nền')))) {
      console.warn(`[Hệ thống Rank · ${context}]:`, error);
      return;
    }
    const duelEl = document.getElementById('duel');
    if (duelEl && !duelEl.classList.contains('hidden') && (context === 'Hệ thống Rank' || context.includes('Đồng bộ nền'))) {
      console.warn(`[Hệ thống Rank · ${context} (Đang trong trận đấu, bỏ qua banner)]:`, error);
      return;
    }
    const stack = error?.stack || '';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    const errObj = { message: rawMsg, stack, context, time: now.toISOString(), timeStr };
    try { localStorage.setItem('last_rank_error', JSON.stringify(errObj)); } catch {}
    window.lastRankError = errObj;
    if (window.parent && window.parent !== window) {
      try { window.parent.lastRankError = errObj; } catch {}
    }
    console.error(`[LỖI ĐẤU RANK · ${context}]:`, error);

    document.getElementById('rankErrorBanner')?.remove();
    const banner = document.createElement('div');
    banner.id = 'rankErrorBanner';
    banner.className = 'rank-error-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <div class="rank-error-content">
        <div class="rank-error-header">
          <span class="rank-error-icon">🚨</span>
          <strong>LỖI ĐẤU RANK · ${esc(context)}</strong>
          <span class="rank-error-time">[${timeStr}]</span>
          <button type="button" class="rank-error-close" id="closeRankErrorBtn" aria-label="Đóng">✕</button>
        </div>
        <div class="rank-error-msg">${esc(rawMsg)}</div>
        <div class="rank-error-actions">
          <button type="button" class="rank-error-copy-btn" id="copyRankErrorBtn">📋 Sao chép lỗi để gửi dev</button>
          <span class="rank-error-tip">Đã lưu lỗi vào bộ nhớ để kiểm tra</span>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    const closeBtn = document.getElementById('closeRankErrorBtn');
    if (closeBtn) closeBtn.onclick = () => banner.remove();
    const copyBtn = document.getElementById('copyRankErrorBtn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const text = `[LỖI ĐẤU RANK · ${context}]\nThời gian: ${timeStr}\nChi tiết: ${rawMsg}${stack ? '\nStack: ' + stack : ''}`;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = '✅ Đã sao chép!';
            setTimeout(() => { if (copyBtn) copyBtn.textContent = '📋 Sao chép lỗi để gửi dev'; }, 2000);
          }).catch(() => prompt('Sao chép thông tin lỗi:', text));
        } else {
          prompt('Sao chép thông tin lỗi:', text);
        }
      };
    }
  }
  window.showRankError = showRankError;
  if (window.parent && window.parent !== window) {
    try { window.parent.showRankError = showRankError; } catch {}
  }

  function appendLastErrorNotice(summary) {
    if (!summary) return;
    try {
      summary.querySelector('.rank-last-error-notice')?.remove();
      const savedErr = localStorage.getItem('last_rank_error');
      if (savedErr) {
        const errData = JSON.parse(savedErr);
        const msg = String(errData?.message || '');
        if (msg.includes('Missing or insufficient permissions') || (msg.includes('permission-denied') && (errData?.context === 'Hệ thống Rank' || errData?.context?.includes('Đồng bộ nền')))) {
          localStorage.removeItem('last_rank_error');
          return;
        }
        const errDiv = document.createElement('div');
        errDiv.className = 'rank-last-error-notice';
        errDiv.style.cssText = 'margin-top:7px;display:flex;align-items:center;justify-content:space-between;background:rgba(239,68,68,0.18);border:1px solid #ef4444;border-radius:6px;padding:5px 8px;font-size:11.5px;color:#fee2e2;gap:6px;';
        errDiv.innerHTML = `<span>⚠️ Lỗi Rank gần nhất: <b>${esc(errData.context || 'Đấu Rank')}</b> (${esc(errData.timeStr || '')})</span><button type="button" style="background:#1e3a5f;border:1px solid #38bdf8;color:#e0f2fe;border-radius:4px;padding:2px 7px;font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;">Chi tiết lỗi</button>`;
        errDiv.querySelector('button').onclick = () => showRankError(errData.message, errData.context);
        summary.appendChild(errDiv);
      }
    } catch {}
  }

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
      appendLastErrorNotice(summary);
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
    appendLastErrorNotice(summary);
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
              <th class="rank-col-num" style="text-align:center;">Hạng</th>
              <th class="rank-col-player-head">Đấu sĩ</th>
              <th class="rank-col-tier">Bậc</th>
              <th class="rank-col-elo" style="text-align:center;">Elo</th>
              <th class="rank-col-record">Thắng / Thua</th>
              <th class="rank-col-winrate">Tỉ lệ</th>
              <th class="rank-col-action" style="text-align:center;">Thách đấu</th>
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
    } catch (error) {
      if (overlay.isConnected) document.getElementById('rankEmpty').textContent = error.message;
      showRankError(error, 'Tải Bảng Xếp Hạng');
    }
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
  let matchmakingCountdown = 60;
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

    function showRankLoginPrompt() {
    document.getElementById('rankLoginPromptModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'rankLoginPromptModal';
    modal.className = 'rank-match-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="rank-match-modal" style="max-width:390px;padding:22px 18px;">
        <div style="font-size:38px;line-height:1;margin-bottom:10px;">👑</div>
        <h3 style="margin:0 0 8px;color:#fde047;font-size:19px;">Đăng Nhập Google Leo Rank</h3>
        <p style="font-size:12.5px;color:#c0e0ee;line-height:1.45;margin:0 0 16px;">
          Để bảo lưu điểm Elo, xem thứ hạng trên <b>Bảng Xếp Hạng</b> và nhận thưởng mùa giải, bạn cần đăng nhập tài khoản Google.
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button type="button" class="primary-btn" id="rankPromptLoginBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);font-size:13.5px;padding:10px;">🔑 Đăng nhập Google</button>
          <button type="button" class="secondary-btn" id="rankPromptGuestBtn" style="font-size:13px;padding:9px;">⚔️ Đấu với Máy (Không tính Rank)</button>
          <button type="button" class="secondary-btn" id="rankPromptCloseBtn" style="font-size:12px;padding:6px;background:transparent;border-color:#475569;">Đóng</button>
        </div>
      </div>
    `;
    const dismiss = () => modal.remove();
    modal.onclick = e => { if (e.target === modal) dismiss(); };
    document.body.appendChild(modal);
    document.getElementById('rankPromptCloseBtn').onclick = dismiss;
    document.getElementById('rankPromptGuestBtn').onclick = () => {
      dismiss();
      if (typeof startGame === 'function') startGame();
    };
    document.getElementById('rankPromptLoginBtn').onclick = async () => {
      const btn = document.getElementById('rankPromptLoginBtn');
      if (btn) { btn.disabled = true; btn.textContent = 'Đang mở đăng nhập...'; }
      try {
        await identity.login();
        if (identity.user) {
          dismiss();
          find();
        }
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = 'Thử lại Google Login'; }
      }
    };
  }

  async function find() {
    if (searchingMatch) {
      if (!document.getElementById('rankMatchOverlay')) {
        searchingMatch = false;
      } else {
        return;
      }
    }

    const quickPlayBtn = document.getElementById('rankPlayBtn');
    if (quickPlayBtn) quickPlayBtn.classList.add('rank-btn-searching');

    const pMain = typeof deckList !== 'undefined' ? deckList : [];
    const pExtra = typeof extraDeckList !== 'undefined' ? extraDeckList : [];
    if (typeof deckProblem === 'function') {
      const prob = deckProblem(pMain, pExtra);
      if (prob) {
        quickPlayBtn?.classList.remove('rank-btn-searching');
        showRankError(new Error('Bộ bài đang dùng chưa hợp lệ: ' + prob), 'Xác thực bộ bài leo Rank');
        return;
      }
    }

    if (!identity.user) {
      try {
        if (typeof identity.login === 'function' && !identity.signing) {
          await Promise.race([
            identity.login(),
            new Promise(res => setTimeout(() => res(null), 1200))
          ]);
        }
      } catch (err) {
        console.warn('Rank identity login error:', err);
      }
      // If user remains unauthenticated, continue matchmaking as Guest
      // (Guest Elo starts at 1000 and can be synced to Google after the match!)
      if (!identity.user) {
        if (window.notify) window.notify('⚔️ Đang ghép Rank Khách (Điểm sẽ được lưu sau khi đăng nhập Google)');
      }
    }
    try {
      if (identity.user) {
        await window.memeIdDuel?.publish?.(true);
      }
    } catch (pubErr) {
      console.warn('Rank publish error (matchmaking proceeds):', pubErr);
    }

    if (typeof duel !== 'undefined' && duel && !duel.finished && document.getElementById('duel') && !document.getElementById('duel').classList.contains('hidden')) {
      quickPlayBtn?.classList.remove('rank-btn-searching');
      return window.notify ? window.notify('Bạn đang trong một trận đấu. Hãy hoàn thành trận hiện tại trước.') : alert('Bạn đang trong một trận đấu.');
    }

    close();
    searchingMatch = true;
    matchmakingCountdown = 60;

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
          <span id="rankMatchSec">60</span><small>s</small>
        </div>
        <p class="rank-match-status" id="rankMatchStatus">🔍 Đang quét tìm đối thủ Online cùng đẳng cấp...</p>
        <div class="rank-match-bar">
          <div class="rank-match-bar-fill" id="rankMatchBarFill" style="width:100%"></div>
        </div>
        <p class="rank-match-hint">Đang tìm người chơi Online trong tối đa 60 giây. Nếu không ai sẵn sàng, hệ thống sẽ ghép với Đấu Sĩ Máy Huyền Thoại.</p>
        <div class="rank-match-actions">
          <button type="button" class="secondary-btn" id="rankMatchCancelBtn">❌ Hủy tìm trận</button>
        </div>
      </div>
    `;

    const cancelMatchmaking = () => {
      window.removeEventListener('keydown', onEsc);
      clearInterval(matchmakingTimer);
      matchmakingTimer = null;
      searchingMatch = false;
      quickPlayBtn?.classList.remove('rank-btn-searching');
      document.getElementById('rankMatchOverlay')?.remove();
      try { window.memeIdDuel?.cancelInvite?.(); } catch (_) {}
      if (window.notify) window.notify('Đã hủy tìm trận Rank.');
    };

    const onEsc = event => { if (event.key === 'Escape') cancelMatchmaking(); };
    window.addEventListener('keydown', onEsc);
    overlay.onclick = event => { if (event.target === overlay) cancelMatchmaking(); };
    document.body.appendChild(overlay);
    document.getElementById('rankMatchCancelBtn').onclick = cancelMatchmaking;

    // Scan duel_directory for online opponents, retrying every few seconds
    const triedPlayers = new Set();
    let candidateScanBusy = false;
    const scanCandidates = async () => {
      if (!searchingMatch || candidateScanBusy || window.memeOnlineIsPlaying?.() || window.memeIdDuel?.hasPendingInvite) return;
      candidateScanBusy = true;
      const statusEl = document.getElementById('rankMatchStatus');
      try {
        const store = await db();
        const myUid = identity.user?.uid;
        if (!myUid) return;
        const snapshot = await store.collection('duel_directory').limit(100).get();
        const now = Date.now(), candidates = [];
        snapshot.forEach(doc => {
          const player = doc.data();
          const seen = typeof player?.lastSeen?.toMillis === 'function' ? player.lastSeen.toMillis() : (Date.parse(player?.lastSeen) || Number(player?.lastSeen) || 0);
          if (player?.uid && player.uid !== myUid && !triedPlayers.has(player.uid) && player.online === true && now - seen < 90000) candidates.push(player);
        });
        candidates.sort(() => Math.random() - 0.5);
        for (const candidate of candidates) {
          if (!searchingMatch) return;
          const target = await window.memeIdDuel?.lookup?.(candidate.uid);
          if (!searchingMatch) return;
          if (!target || !window.memeIdDuel?.online?.(target)) continue;
          triedPlayers.add(candidate.uid);
          if (statusEl) statusEl.textContent = `🎯 Đã tìm thấy ${candidate.name || 'đấu thủ'}! Đang gửi lời mời...`;
          try {
            await window.memeIdDuel?.invite?.(target, { silent: true, shouldCancel: () => searchingMatch });
            if (!searchingMatch) return;
            if (window.memeIdDuel?.hasPendingInvite) {
              if (statusEl) statusEl.textContent = `📨 Đã mời ${candidate.name || 'đấu thủ'}. Đang chờ phản hồi...`;
              return;
            }
          } catch (inviteError) {
            console.warn('Rank matchmaking invite skipped:', inviteError?.message || inviteError);
            if (statusEl) statusEl.textContent = `🔍 Chưa gửi được lời mời tới ${candidate.name || 'đấu thủ'}. Đang thử người khác...`;
          }
        }
        if (!window.memeIdDuel?.hasPendingInvite && statusEl) statusEl.textContent = '🔍 Chưa có đối thủ phù hợp. Đang tiếp tục tìm kiếm...';
      } catch (error) {
        console.warn('Rank matchmaking directory scan:', error?.message || error);
        if (statusEl) statusEl.textContent = '🔍 Chưa tải được danh sách đối thủ. Đang thử lại...';
      } finally {
        candidateScanBusy = false;
      }
    };
    scanCandidates();

    matchmakingTimer = setInterval(() => {
      matchmakingCountdown--;
      const secEl = document.getElementById('rankMatchSec');
      const barEl = document.getElementById('rankMatchBarFill');
      if (secEl) secEl.textContent = matchmakingCountdown;
      if (barEl) barEl.style.width = ((matchmakingCountdown / 60) * 100) + '%';

      if (window.memeOnlineIsPlaying?.()) {
        window.removeEventListener('keydown', onEsc);
        clearInterval(matchmakingTimer);
        matchmakingTimer = null;
        searchingMatch = false;
        quickPlayBtn?.classList.remove('rank-btn-searching');
        document.getElementById('rankMatchOverlay')?.remove();
        return;
      }

      if (matchmakingCountdown > 0 && matchmakingCountdown % 4 === 0) scanCandidates();

      if (matchmakingCountdown <= 0) {
        window.removeEventListener('keydown', onEsc);
        clearInterval(matchmakingTimer);
        matchmakingTimer = null;
        searchingMatch = false;
        quickPlayBtn?.classList.remove('rank-btn-searching');

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
          try {
            if (typeof startGame === 'function') {
              startGame({ customBotDeck: chosenBot.preset });
            } else if (typeof window.parent?.startGame === 'function') {
              window.parent.startGame({ customBotDeck: chosenBot.preset });
            } else {
              const frame = document.getElementById('memecardFrame')?.contentWindow;
              if (typeof frame?.startGame === 'function') {
                frame.startGame({ customBotDeck: chosenBot.preset });
              } else {
                throw Error('Hàm khởi tạo trận đấu startGame chưa sẵn sàng.');
              }
            }
          } catch (startErr) {
            showRankError(startErr, 'Khởi tạo trận đấu Rank');
          }
        }, 600);
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
  let globalInviteUnsub = null;
  let globalIncoming = null;
  let globalInviteTimer = null;

  function stopGlobalInvite() {
    if (globalInviteTimer) clearInterval(globalInviteTimer);
    globalInviteTimer = null;
    globalIncoming = null;
    document.getElementById('globalDuelInvite')?.remove();
  }

  function showGlobalInvite(inviteId, v, sender) {
    if (globalIncoming?.nonce === v.nonce) return;
    stopGlobalInvite();
    globalIncoming = { id: inviteId, nonce: v.nonce };

    const modal = document.createElement('div');
    modal.id = 'globalDuelInvite';
    modal.className = 'global-duel-invite-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Lời mời khiêu chiến Đấu Rank');

    const senderName = String(sender?.name || 'Đấu sĩ').slice(0, 48);
    const expiresAt = typeof v.expiresAt?.toMillis === 'function' ? v.expiresAt.toMillis() : (Number(v.expiresAt) || (Date.now() + 60000));
    let remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

    modal.innerHTML = `
      <div class="global-invite-card">
        <div class="global-invite-badge">⚔️ LỜI MỜI ĐẤU RANK YU-GI-OH!</div>
        <h3>Đấu Sĩ Khiêu Chiến!</h3>
        <p class="global-invite-sender"><strong style="color:#fde047;font-size:16px;">${esc(senderName)}</strong> muốn khiêu chiến một trận Đấu Rank với bạn!</p>
        <p class="global-invite-timer">Thời gian phản hồi: <b id="globalInviteTimerVal" style="color:#f59e0b;font-size:16px;">${remaining}</b>s</p>
        <div class="global-invite-actions">
          <button type="button" class="primary-btn" id="globalAcceptDuelBtn" style="background:linear-gradient(135deg,#16a34a,#15803d);border:1.5px solid #86efac;color:#fff;font-weight:900;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:14px;">⚔️ Nhận Lời (Vào Trận)</button>
          <button type="button" class="secondary-btn" id="globalDeclineDuelBtn" style="background:#334155;border:1px solid #64748b;color:#f1f5f9;font-weight:800;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:14px;">Từ Chối</button>
        </div>
        <p class="id-invite-error" id="globalInviteError" role="status" style="color:#ef4444;margin-top:8px;font-size:13px;font-weight:700;"></p>
      </div>
    `;

    document.body.appendChild(modal);

    const timerVal = modal.querySelector('#globalInviteTimerVal');
    globalInviteTimer = setInterval(() => {
      remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      if (timerVal) timerVal.textContent = String(remaining);
      if (remaining <= 0) {
        stopGlobalInvite();
      }
    }, 1000);

    const respond = async accept => {
      for (const btn of modal.querySelectorAll('button')) btn.disabled = true;
      const statusEl = modal.querySelector('#globalInviteError');
      if (statusEl) statusEl.textContent = accept ? 'Đang vào trận đấu...' : 'Đang từ chối...';
      try {
        const store = identity.db;
        await store.runTransaction(async tx => {
          const ref = store.doc('duel_invites/' + inviteId);
          const snap = await tx.get(ref);
          if (!snap.exists) throw Error('Lời mời không còn tồn tại.');
          const latest = snap.data();
          const exp = typeof latest.expiresAt?.toMillis === 'function' ? latest.expiresAt.toMillis() : (Number(latest.expiresAt) || 0);
          if (latest.nonce !== v.nonce || latest.status !== 'pending' || (exp > 0 && exp <= Date.now())) {
            throw Error('Lời mời đã hết hạn hoặc bị hủy.');
          }
          tx.update(ref, { status: accept ? 'accepted' : 'declined' });
        });

        if (accept) {
          stopGlobalInvite();
          window.pendingInviteJoin = {
            roomId: v.roomId,
            peerId: sender?.networkId || v.from,
            peerName: senderName,
            challengeId: v.nonce,
            rankOpponentUid: v.from
          };
          if (typeof window.openMemeCardGame === 'function') {
            window.openMemeCardGame();
          }
          for (let i = 0; i < 50; i++) {
            const frame = document.getElementById('memecardFrame')?.contentWindow;
            if (frame && typeof frame.memeJoinRoom === 'function') {
              frame.memeJoinRoom(v.roomId);
              if (frame.memeRoom) {
                frame.memeRoom.peerId = sender?.networkId || v.from;
                frame.memeRoom.peerName = senderName;
                frame.memeRoom.challengeId = v.nonce;
                frame.memeRoom.rankOpponentUid = v.from;
              }
              window.pendingInviteJoin = null;
              break;
            }
            await new Promise(r => setTimeout(r, 100));
          }
        } else {
          stopGlobalInvite();
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = err.message || 'Lỗi xử lý lời mời';
        for (const btn of modal.querySelectorAll('button')) btn.disabled = false;
      }
    };

    modal.querySelector('#globalAcceptDuelBtn').onclick = () => respond(true);
    modal.querySelector('#globalDeclineDuelBtn').onclick = () => respond(false);
  }

  function startGlobalInviteListener(user) {
    if (globalInviteUnsub) { globalInviteUnsub(); globalInviteUnsub = null; }
    stopGlobalInvite();
    if (!user?.uid || !identity?.db) return;
    const isMainSite = !!document.getElementById('memecardFrame');
    if (!isMainSite) return;

    const store = identity.db;
    const expMs = val => typeof val?.toMillis === 'function' ? val.toMillis() : (Number(val) || 0);
    const inviteExpiry = val => val?.createdAt ? (expMs(val.createdAt) + 60000) : expMs(val?.expiresAt);

    globalInviteUnsub = store.collection('duel_invites').where('to', '==', user.uid).onSnapshot(async snap => {
      const pendingDoc = snap.docs.find(d => {
        const val = d.data();
        return val && val.status === 'pending' && inviteExpiry(val) > Date.now();
      });
      if (!pendingDoc) {
        stopGlobalInvite();
        return;
      }
      const invVal = pendingDoc.data();
      const cardModal = document.getElementById('memecardGameModal');
      const isCardOpen = cardModal && cardModal.style.display !== 'none' && cardModal.style.display !== '';
      if (isCardOpen) {
        return;
      }
      try {
        let sender = null;
        const [pSnap, dSnap] = await Promise.all([
          store.doc('duel_players/' + invVal.from).get().catch(() => null),
          store.doc('duel_directory/' + invVal.from).get().catch(() => null)
        ]);
        if (pSnap?.exists) sender = pSnap.data();
        else if (dSnap?.exists) sender = dSnap.data();
        showGlobalInvite(pendingDoc.id, invVal, sender || { name: 'Đấu sĩ' });
      } catch (err) {
        console.warn('Global invite listener sender lookup error:', err);
      }
    }, err => {
      console.warn('Global invite listener error:', err?.message || err);
    });
  }

  identity.subscribe(async ({ user, ready }) => {
    if (!ready) return;
    if (!user) {
      stop();
      if (globalInviteUnsub) { globalInviteUnsub(); globalInviteUnsub = null; }
      stopGlobalInvite();
      profile = null;
      paint();
      return;
    }
    startGlobalInviteListener(user);
    await loadProfile(user);
  });
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
      try { sessionStorage.setItem('rank-promo-dismissed', '1'); localStorage.setItem('rank-promo-dismissed', '1'); } catch {}
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
      if (playBtn) {
        playBtn.click();
      } else if (typeof window.openMemeCardGame === 'function') {
        window.openMemeCardGame();
        setTimeout(() => {
          const frame = document.getElementById('memecardFrame')?.contentWindow;
          if (frame?.siteRank?.find) frame.siteRank.find();
          else if (frame?.document?.getElementById('rankPlayBtn')) frame.document.getElementById('rankPlayBtn').click();
          else if (frame?.document?.getElementById('playBtn')) frame.document.getElementById('playBtn').click();
        }, 600);
      }
    };
  }

  function tryAutoPromo() {
    try {
      if (sessionStorage.getItem('rank-promo-dismissed') || localStorage.getItem('rank-promo-dismissed')) return;
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
