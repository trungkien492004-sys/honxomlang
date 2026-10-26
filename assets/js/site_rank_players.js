// Public rank list, live presence, and private friend requests.
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const timeOf = value => typeof value?.toMillis === 'function' ? value.toMillis()
    : typeof value === 'string' ? Date.parse(value) || 0 : Number(value) || 0;
  const online = player => player?.online === true && timeOf(player.lastSeen) > 0 && Date.now() - timeOf(player.lastSeen) <= 90000;
  let stopLive = null;

  function timestamp() {
    try { return window.firebase.firestore.FieldValue.serverTimestamp(); }
    catch { return new Date(); }
  }

  async function challenge(uid) {
    const identity = window.siteIdentity;
    if (!identity.user) await identity.login();
    if (window.memeIdDuel) return window.memeIdDuel.challenge(uid);
    if (typeof window.openMemeCardGame !== 'function') throw Error('Hãy mở đấu bài từ sảnh để khiêu chiến.');
    window.openMemeCardGame();
    for (let i = 0; i < 100; i++) {
      const child = document.getElementById('memecardFrame')?.contentWindow;
      if (child?.memeIdDuel) return child.memeIdDuel.challenge(uid);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw Error('Chưa mở được đấu bài. Hãy thử lại.');
  }

  async function getDocs(query) {
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
  }

  async function render(store, overlay, rankedSnapshot, rankedQuery) {
    stopLive?.();
    const directoryQuery = store.collection('duel_directory').orderBy('name').limit(100);
    const [directory, ranked] = await Promise.all([
      getDocs(directoryQuery).catch(() => []),
      rankedSnapshot?.docs ? Promise.resolve(rankedSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))) : getDocs(rankedQuery).catch(() => [])
    ]);
    if (!overlay.isConnected) return;

    const LEGEND_BOTS = [
      { uid: 'bot-yugi', name: 'Yugi Muto / Atem', bot: true, heroId: 0, rating: 1600, wins: 15, losses: 2, draws: 0, played: 17, online: true, title: 'Vua Trò Chơi · Thần Osiris' },
      { uid: 'bot-kaiba', name: 'Seto Kaiba', bot: true, heroId: 1, rating: 1550, wins: 14, losses: 3, draws: 0, played: 17, online: true, title: 'Đỉnh Cao Mắt Xanh · Obelisk' },
      { uid: 'bot-zane', name: 'Zane Truesdale', bot: true, heroId: 5, rating: 1450, wins: 12, losses: 4, draws: 0, played: 16, online: true, title: 'Rồng Máy Tận Diệt · Cyber' },
      { uid: 'bot-jaden', name: 'Jaden Yuki', bot: true, heroId: 4, rating: 1350, wins: 10, losses: 5, draws: 0, played: 15, online: true, title: 'Anh Hùng Tối Thượng · HERO' },
      { uid: 'bot-pegasus', name: 'Pegasus J. Crawford', bot: true, heroId: 3, rating: 1250, wins: 8, losses: 6, draws: 0, played: 14, online: true, title: 'Vương Quốc Hoạt Hình · Toon' },
      { uid: 'bot-joey', name: 'Joey Wheeler', bot: true, heroId: 2, rating: 1150, wins: 7, losses: 7, draws: 0, played: 14, online: true, title: 'Rồng Đen Bất Diệt · May Mắn' }
    ];
    const people = new Map();
    for (const b of LEGEND_BOTS) people.set(b.uid, { ...b });
    for (const { id, data } of directory) people.set(data.uid || id, { ...data, uid: data.uid || id });
    for (const { id, data } of ranked) people.set(data.uid || id, { ...people.get(data.uid || id), ...data, uid: data.uid || id });

    const sheet = overlay.querySelector('.rank-sheet');
    const friendArea = document.createElement('section');
    friendArea.className = 'rank-friends';
    friendArea.innerHTML = '<h3>Bạn bè</h3><p class="rank-friend-note">Thách đấu bạn bè không giới hạn lượt.</p><div id="rankFriendRows" class="rank-friend-rows"></div><div id="rankFriendRequests" class="rank-friend-requests"></div><p id="rankFriendError" role="alert"></p>';
    sheet.insertBefore(friendArea, sheet.querySelector('.rank-table-wrap'));

    const tbody = overlay.querySelector('#rankRows');
    const panel = document.createElement('div');
    panel.id = 'rankOpponentPanel';
    panel.className = 'rank-opponent-panel';
    panel.hidden = true;
    panel.innerHTML = '<strong id="rankOpponentName"></strong><p id="rankOpponentPresence"></p><div class="rank-panel-actions"><button type="button" class="secondary-btn" id="rankFriendAction">Kết bạn</button><button type="button" class="primary-btn" id="rankChallenge">Khiêu chiến</button></div><p id="rankChallengeError" role="alert"></p>';
    sheet.appendChild(panel);

    let selectedUid = null, challengeBusy = false, friendBusy = false;
    const me = window.siteIdentity.user?.uid;
    const friends = new Set(), outgoing = new Map(), incoming = new Map();
    const sortedPair = (a, b) => [a, b].sort((x, y) => x.localeCompare(y));
    const friendId = (a, b) => sortedPair(a, b).join('__');
    const requestId = (from, to) => `${from}_${to}`;
    const showError = message => { const node = overlay.querySelector('#rankFriendError'); if (node) node.textContent = message || ''; };

    function ordered() {
      return [...people.values()].sort((a, b) => {
        const ratingA = Number.isFinite(Number(a.rating)) ? Number(a.rating) : 1000;
        const ratingB = Number.isFinite(Number(b.rating)) ? Number(b.rating) : 1000;
        if (ratingB !== ratingA) return ratingB - ratingA;
        const winsA = Number(a.wins) || 0, winsB = Number(b.wins) || 0;
        if (winsB !== winsA) return winsB - winsA;
        const playedA = Number(a.played) || 0, playedB = Number(b.played) || 0;
        if (playedB !== playedA) return playedB - playedA;
        const activeA = (a.bot || online(a)) ? 1 : 0, activeB = (b.bot || online(b)) ? 1 : 0;
        if (activeB !== activeA) return activeB - activeA;
        return String(a.name || '').localeCompare(String(b.name || ''), 'vi');
      });
    }
    function paintPresence() {
      overlay.querySelectorAll('[data-presence-uid]').forEach(node => {
        const player = people.get(node.dataset.presenceUid);
        if (!player) return;
        const active = online(player);
        node.classList.toggle('is-online', active);
        node.classList.toggle('is-offline', !active);
        node.lastChild.textContent = active ? 'Online' : 'Offline';
      });
      if (selectedUid) paintSelected();
    }
    function paint() {
      const rows = ordered();
      tbody.innerHTML = rows.map((player, index) => {
        const active = player.bot || online(player);
        const rating = Number.isFinite(Number(player.rating)) ? Number(player.rating) : 1000;
        const newbie = !player.bot && (Date.now() < (Number(player.newbieUntil) || 0) || !player.played) ? '<span class="newbie-badge">NEWBIE</span>' : '';
        const botTag = player.bot ? '<span class="rank-bot-badge">BOSS</span>' : '';
        const rankIcon = index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : ('#' + (index + 1));
        return `<tr>
          <td class="rank-num">${rankIcon}</td>
          <td>
            <button type="button" class="rank-player-open" data-player-uid="${esc(player.uid)}">
              <span class="rank-presence ${active ? 'is-online' : 'is-offline'}" data-presence-uid="${esc(player.uid)}">
                <i aria-hidden="true"></i>${player.bot ? 'Sẵn sàng' : (active ? 'Online' : 'Offline')}
              </span>
              <span>${esc(player.name)}</span>
              ${botTag}${newbie}
            </button>
          </td>
          <td><b>${rating}</b> <small style="opacity:0.75">Elo</small></td>
          <td style="color:#4ade80;font-weight:800;">${Number(player.wins) || 0}</td>
          <td style="color:#f87171;">${Number(player.losses) || 0}</td>
          <td style="opacity:0.75;">${Number(player.draws) || 0}</td>
          <td><b>${Number(player.played) || 0}</b></td>
        </tr>`;
      }).join('');
      overlay.querySelector('#rankEmpty').textContent = rows.length ? '' : 'Chưa có người chơi lưu bộ bài. Mở đấu bài để xuất hiện trong danh sách.';
      paintFriends();
      paintPresence();
    }
    function paintSelected() {
      const selected = people.get(selectedUid);
      if (!selected || panel.hidden) return;
      const isBot = !!selected.bot;
      const active = isBot || online(selected), isFriend = !isBot && friends.has(selectedUid);
      panel.querySelector('#rankOpponentName').textContent = (selected.name || 'Đấu sĩ') + (selected.title ? ' · ' + selected.title : '') + ' · ' + (Number.isFinite(Number(selected.rating)) ? selected.rating : 1000) + ' Elo';
      panel.querySelector('#rankOpponentPresence').textContent = isBot ? '⚔️ Đấu Sĩ Huyền Thoại — Bấm khiêu chiến để đấu Rank ngay!' : (active ? '🟢 Đang online — có thể gửi lời mời đấu online.' : '⚪ Offline — máy sẽ dùng bộ bài đã lưu để đấu.');
      const challengeButton = panel.querySelector('#rankChallenge');
      challengeButton.disabled = challengeBusy || (!isBot && selected.uid === me);
      challengeButton.textContent = isBot ? `⚔️ Thách đấu ${selected.name}` : (isFriend ? 'Thách đấu bạn · không giới hạn' : 'Khiêu chiến');
      const friendButton = panel.querySelector('#rankFriendAction');
      friendButton.hidden = isBot || !me || selected.uid === me || isFriend;
      friendButton.disabled = friendBusy || outgoing.has(selectedUid) || incoming.has(selectedUid);
      friendButton.textContent = friends.has(selectedUid) ? 'Bạn bè' : incoming.has(selectedUid) ? 'Đang có lời mời từ người này' : outgoing.has(selectedUid) ? 'Đã gửi lời mời' : 'Kết bạn';
    }
    function paintFriends() {
      const rows = overlay.querySelector('#rankFriendRows'), requests = overlay.querySelector('#rankFriendRequests');
      if (!me) {
        rows.innerHTML = '<p>Đăng nhập Google để kết bạn và thách đấu riêng.</p>'; requests.innerHTML = '';
        return;
      }
      const list = [...friends].map(uid => people.get(uid) || { uid, name: 'Đấu sĩ' }).sort((a, b) => String(a.name).localeCompare(String(b.name), 'vi'));
      rows.innerHTML = list.length ? list.map(player => `<div class="rank-friend-row"><button type="button" class="rank-friend-name" data-player-uid="${esc(player.uid)}"><span class="rank-presence ${online(player) ? 'is-online' : 'is-offline'}" data-presence-uid="${esc(player.uid)}"><i aria-hidden="true"></i>${online(player) ? 'Online' : 'Offline'}</span>${esc(player.name)}</button><button type="button" class="rank-friend-challenge" data-challenge-uid="${esc(player.uid)}">Thách đấu · ∞</button></div>`).join('') : '<p>Chưa có bạn bè. Chọn người chơi trong BXH rồi bấm Kết bạn.</p>';
      const pending = [...incoming.entries()];
      requests.innerHTML = pending.length ? `<h4>Lời mời kết bạn</h4>${pending.map(([uid]) => `<div class="rank-friend-row"><span>${esc(people.get(uid)?.name || uid)}</span><span><button type="button" data-accept-uid="${esc(uid)}">Chấp nhận</button><button type="button" data-decline-uid="${esc(uid)}">Từ chối</button></span></div>`).join('')}` : '';
    }

    async function sendFriendRequest(uid) {
      if (!me) return window.siteIdentity.login();
      if (uid === me || friends.has(uid) || outgoing.has(uid)) return;
      friendBusy = true; showError(''); paintSelected();
      try {
        // The inbox query is permission-safe; probing a missing reverse-request
        // document is denied by Firestore rules because it has no resource.data.
        if (incoming.has(uid)) return acceptFriend(uid, requestId(uid, me));
        const from = requestId(me, uid);
        await store.doc(`rank_friend_requests/${from}`).set({ from: me, to: uid, status: 'pending', createdAt: timestamp(), updatedAt: timestamp() });
        outgoing.set(uid, { from: me, to: uid, status: 'pending' });
        paintFriends(); paintSelected();
      } catch (error) { showError(error.message || 'Không gửi được lời mời kết bạn.'); }
      finally { friendBusy = false; paintSelected(); }
    }
    async function acceptFriend(uid, id = requestId(uid, me)) {
      if (!me) return;
      friendBusy = true; showError(''); paintSelected();
      try {
        const requestRef = store.doc(`rank_friend_requests/${id}`), uids = sortedPair(me, uid);
        await store.runTransaction(async tx => {
          const current = await tx.get(requestRef);
          if (!current.exists || current.data().status !== 'pending' || current.data().to !== me) throw Error('Lời mời không còn hiệu lực.');
          tx.update(requestRef, { status: 'accepted', updatedAt: timestamp() });
          tx.set(store.doc(`rank_friendships/${friendId(me, uid)}`), { uids, createdAt: timestamp() });
        });
        incoming.delete(uid); friends.add(uid); paintFriends(); paintSelected();
      } catch (error) { showError(error.message || 'Không chấp nhận được lời mời.'); }
      finally { friendBusy = false; paintSelected(); }
    }
    async function declineFriend(uid) {
      const id = requestId(uid, me), requestRef = store.doc(`rank_friend_requests/${id}`);
      try { await requestRef.update({ status: 'declined', updatedAt: timestamp() }); incoming.delete(uid); paintFriends(); }
      catch (error) { showError(error.message || 'Không xử lý được lời mời.'); }
    }
    async function loadFriends() {
      if (!me) return;
      try {
        const [friendDocs, incomingDocs, outgoingDocs] = await Promise.all([
          getDocs(store.collection('rank_friendships').where('uids', 'array-contains', me)),
          getDocs(store.collection('rank_friend_requests').where('to', '==', me)),
          getDocs(store.collection('rank_friend_requests').where('from', '==', me))
        ]);
        friendDocs.forEach(({ data }) => { const other = data.uids.find(uid => uid !== me); if (other) friends.add(other); });
        incomingDocs.forEach(({ data }) => { if (data.status === 'pending') incoming.set(data.from, data); });
        outgoingDocs.forEach(({ data }) => { if (data.status === 'pending') outgoing.set(data.to, data); });
        paintFriends();
      } catch (error) { showError(error.message || 'Không tải được danh sách bạn bè.'); }
    }

    paint();
    await loadFriends();
    tbody.onclick = event => {
      const button = event.target.closest('[data-player-uid]');
      if (!button) return;
      selectedUid = button.dataset.playerUid;
      panel.hidden = false;
      panel.querySelector('#rankChallengeError').textContent = '';
      paintSelected();
    };
    friendArea.onclick = async event => {
      const challengeButton = event.target.closest('[data-challenge-uid]');
      if (challengeButton) {
        const uid = challengeButton.dataset.challengeUid;
        try { await challenge(uid); window.siteRank.close(); }
        catch (error) { showError(error.message); }
        return;
      }
      const playerButton = event.target.closest('[data-player-uid]');
      if (playerButton) { selectedUid = playerButton.dataset.playerUid; panel.hidden = false; paintSelected(); return; }
      const accepted = event.target.closest('[data-accept-uid]');
      if (accepted) return acceptFriend(accepted.dataset.acceptUid);
      const declined = event.target.closest('[data-decline-uid]');
      if (declined) return declineFriend(declined.dataset.declineUid);
    };
    panel.querySelector('#rankFriendAction').onclick = () => selectedUid && sendFriendRequest(selectedUid);
    panel.querySelector('#rankChallenge').onclick = async () => {
      if (!selectedUid || challengeBusy) return;
      challengeBusy = true; panel.querySelector('#rankChallenge').disabled = true;
      try {
        const selected = people.get(selectedUid);
        if (selected?.bot) {
          window.siteRank.close();
          const presets = {
            'bot-yugi': 'Yugi · Ma Thuật Tối Thượng',
            'bot-kaiba': 'Kaiba · Đỉnh Cao Mắt Xanh',
            'bot-joey': 'Joey · Rồng Đen Bất Diệt',
            'bot-pegasus': 'Pegasus · Vương Quốc Hoạt Hình',
            'bot-jaden': 'Jaden · Anh Hùng Tối Thượng',
            'bot-zane': 'Zane · Rồng Máy Tận Diệt'
          };
          const preset = presets[selectedUid];
          if (typeof startGame === 'function') {
            startGame({ customBotDeck: preset, ghost: null });
          } else {
            await challenge(selectedUid);
          }
        } else {
          await challenge(selectedUid);
          window.siteRank.close();
        }
      } catch (error) { panel.querySelector('#rankChallengeError').textContent = error.message; challengeBusy = false; paintSelected(); }
    };

    const subscriptions = [];
    function listen(query, onRows) {
      if (typeof query.onSnapshot !== 'function') return;
      subscriptions.push(query.onSnapshot(snapshot => onRows(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })), snapshot), error => console.warn('Rank live update:', error.code || error.message)));
    }
    listen(directoryQuery, latest => {
      for (const { id, data } of latest) people.set(data.uid || id, { ...people.get(data.uid || id), ...data, uid: data.uid || id });
      paint();
    });
    listen(rankedQuery, (latest, snapshot) => {
      for (const { id, data } of latest) people.set(data.uid || id, { ...people.get(data.uid || id), ...data, uid: data.uid || id });
      if (snapshot.docs.length === 0 && !ranked.length) { paint(); return; }
      paint();
    });
    if (me) {
      listen(store.collection('rank_friendships').where('uids', 'array-contains', me), latest => {
        friends.clear(); latest.forEach(({ data }) => { const other = data.uids.find(uid => uid !== me); if (other) friends.add(other); }); paintFriends(); paintSelected();
      });
      listen(store.collection('rank_friend_requests').where('to', '==', me), latest => {
        incoming.clear(); latest.forEach(({ data }) => { if (data.status === 'pending') incoming.set(data.from, data); }); paintFriends(); paintSelected();
      });
      listen(store.collection('rank_friend_requests').where('from', '==', me), latest => {
        outgoing.clear(); latest.forEach(({ data }) => { if (data.status === 'pending') outgoing.set(data.to, data); }); paintSelected();
      });
    }
    const refresh = setInterval(paintPresence, 15000);
    stopLive = () => { subscriptions.forEach(unsubscribe => unsubscribe?.()); clearInterval(refresh); stopLive = null; };
  }

  window.siteRankPlayers = { render, challenge, stop() { stopLive?.(); } };
})();
