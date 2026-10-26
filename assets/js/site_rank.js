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
      summary.innerHTML = '<div class="rank-progress-title">Đăng nhập để xem hạng và tiến độ của bạn.</div><div class="rank-progress-muted">Thách đấu bạn bè vẫn không giới hạn lượt.</div>';
      return;
    }
    if (!profile || !Number.isFinite(Number(profile.rating))) {
      summary.innerHTML = `<div class="rank-progress-title">${cfg.enabled ? 'Đang tải hạng của bạn…' : 'Hồ sơ xếp hạng chưa được khởi tạo'}</div><div class="rank-progress-muted">${cfg.enabled ? 'Chờ đồng bộ hồ sơ rank.' : 'Khiêu chiến trên BXH để tạo hồ sơ Elo và ghi nhận thắng thua.'}</div>`;
      return;
    }
    const rating = Number(profile.rating), tier = localTier(rating), newbie = profile.newbie || Date.now() < Number(profile.newbieUntil || 0);
    const used = Number.isFinite(Number(profile.rankedMatchesToday)) ? Number(profile.rankedMatchesToday) : '—';
    const cap = newbie ? 'NEWBIE · rank không giới hạn' : `Hôm nay ${used}/${Number(profile.rankedLimit) || 20} trận rank`;
    const progress = tier.next ? `${tier.missing} Elo nữa lên ${tier.next}` : 'Đã đạt bậc cao nhất';
    summary.innerHTML = `<div class="rank-progress-top"><b>${esc(tier.current)}</b><span>${rating} Elo</span>${newbie ? '<span class="newbie-badge">NEWBIE</span>' : ''}</div><div class="rank-progress-track"><i style="width:${tier.progress}%"></i></div><div class="rank-progress-bottom"><span>${esc(progress)}</span><span>${esc(cap)}</span></div><div class="rank-record">${Number(profile.wins) || 0} thắng · ${Number(profile.losses) || 0} thua · ${Number(profile.draws) || 0} hòa · ${Number(profile.played) || 0} trận</div>`;
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
    overlay.innerHTML = `<section class="rank-sheet"><header><h2 id="rankTitle">RANK</h2><button type="button" id="closeRank">Đóng ✕</button></header><div class="rank-progress" id="rankProgress"></div><button type="button" class="rank-quick-btn" id="rankQuickMatch">⚔ Đấu Rank nhanh</button><div class="rank-metrics"><span id="rankMembers">Người tham gia: —</span><span id="rankMatches">Trận rank: —</span></div><p class="rank-rules">NEWBIE dưới 7 ngày: không giới hạn trận rank, thua không mất Elo và thắng nhận x2. Sau đó tối đa 20 trận rank mỗi ngày. Đấu bạn bè không giới hạn.</p><p class="rank-status">${esc(message || (cfg.enabled ? 'Elo và thống kê cập nhật sau mỗi trận.' : 'Khiêu chiến trên BXH cập nhật Elo và thống kê. Ghép trận rank nhanh cần máy chủ rank.'))}</p><div class="rank-table-wrap"><table><thead><tr><th>Hạng</th><th>Người chơi · bấm để chọn</th><th>Elo</th><th>Thắng</th><th>Thua</th><th>Hòa</th><th>Trận</th></tr></thead><tbody id="rankRows"></tbody></table><p id="rankEmpty" class="rank-empty">Đang tải bảng xếp hạng…</p></div></section>`;
    overlay.onclick = event => { if (event.target === overlay) close(); };
    overlay.onkeydown = event => { if (event.key === 'Escape') close(); };
    document.body.appendChild(overlay); document.getElementById('closeRank').onclick = close; document.getElementById('rankQuickMatch').onclick = find;
    paintProgress();
    try {
      const store = await db(), profileQuery = store.collection('rank_profiles').orderBy('rating', 'desc').limit(100);
      const [members, stats, players] = await Promise.all([participantCount(), store.doc('rank_stats/global').get(), profileQuery.get()]);
      if (!overlay.isConnected) return;
      document.getElementById('rankMembers').textContent = 'Người tham gia: ' + members;
      document.getElementById('rankMatches').textContent = 'Trận rank: ' + (stats.data()?.matchesCompleted || 0);
      if (typeof store.doc('rank_stats/global').onSnapshot === 'function') unwatchStats = store.doc('rank_stats/global').onSnapshot(snapshot => {
        if (overlay.isConnected) document.getElementById('rankMatches').textContent = 'Trận rank: ' + (snapshot.data()?.matchesCompleted || 0);
      });
      if (identity.user) {
        const mine = store.doc('rank_profiles/' + identity.user.uid);
        if (typeof mine.onSnapshot === 'function') unwatchProfile = mine.onSnapshot(snapshot => { profile = snapshot.exists ? { ...profile, ...snapshot.data() } : profile; paintProgress(); });
      }
      await window.siteRankPlayers.render(store, overlay, players, profileQuery);
    } catch (error) { if (overlay.isConnected) document.getElementById('rankEmpty').textContent = error.message; }
  }
  function paint() {
    const node = document.getElementById('rankIdentity');
    if (node) { const user = identity.user; node.innerHTML = user ? esc(user.displayName || 'Đấu sĩ') + (identity.newbie ? '<span class="newbie-badge">NEWBIE</span>' : '') + (profile ? ' · ' + profile.rating + ' Elo' : '') : ''; }
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
  async function find() {
    if (!identity.user) return identity.login();
    if (!cfg.enabled) return show('Đấu Rank nhanh đang chờ máy chủ xếp hạng. Bảng RANK và đấu bạn bè vẫn dùng được.');
    if (searching) return;
    queueBusy = true;
    try {
      const result = await api('queue', prefs());
      if (result.state === 'matched') return enter(result.code);
      profile = { ...profile, ...result }; searching = true; close();
      const overlay = document.createElement('div'); overlay.id = 'rankOverlay';
      overlay.innerHTML = '<section class="rank-sheet"><header><h2>Đang tìm đối thủ</h2></header><p class="rank-status">Đang ghép trận rank…</p><div class="rank-queue-actions"><button id="cancelRankQueue">Hủy tìm trận</button></div></section>';
      document.body.appendChild(overlay); document.getElementById('cancelRankQueue').onclick = cancel;
      poll = setInterval(async () => {
        if (queueBusy || !searching) return; queueBusy = true;
        try { const status = await api('status'); if (status.state === 'matched') await enter(status.code); else if (status.state !== 'waiting' || Date.now() > status.expiresAt) { stop(); setStatus('Chưa tìm được đối thủ. Hãy thử lại.'); } }
        catch (error) { setStatus(error.message); } finally { queueBusy = false; }
      }, 3000);
    } catch (error) { window.notify?.(error.message); }
    finally { queueBusy = false; }
  }

  const footer = document.querySelector('#lobby .lobby-footer');
  if (footer) {
    footer.classList.add('rank-actions');
    for (const [id, text, action] of [['rankPlayBtn', 'Đấu Rank nhanh', find], ['rankBoardBtn', 'RANK', show]]) {
      const button = document.createElement('button'); button.type = 'button'; button.id = id; button.className = 'secondary-btn'; button.textContent = text; button.onclick = action; footer.appendChild(button);
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
  window.siteRank = { show, find, close, paint, refresh: async () => {
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
