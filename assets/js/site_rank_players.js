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

    const tbody = overlay.querySelector('#rankRows');
    let challengeBusy = false;
    const me = window.siteIdentity.user?.uid;
    const tiers = [{ name: 'Tân Binh', min: 0 }, { name: 'Đồng', min: 1000 }, { name: 'Bạc', min: 1200 }, { name: 'Vàng', min: 1400 }, { name: 'Bạch Kim', min: 1600 }, { name: 'Kim Cương', min: 1800 }, { name: 'Vua Trò Chơi', min: 2000 }];
    function getTier(rating) {
      let current = tiers[0];
      for (const t of tiers) { if (rating >= t.min) current = t; else break; }
      return current.name;
    }

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

    function paint() {
      const rows = ordered();
      tbody.innerHTML = rows.map((player, index) => {
        const isBot = !!player.bot;
        const active = isBot || online(player);
        const rating = Number.isFinite(Number(player.rating)) ? Number(player.rating) : 1000;
        const tierName = getTier(rating);
        const tierClass = tierName === 'Tân Binh' ? 'tier-newbie' : tierName === 'Đồng' ? 'tier-bronze' : tierName === 'Bạc' ? 'tier-silver' : tierName === 'Vàng' ? 'tier-gold' : tierName === 'Bạch Kim' ? 'tier-plat' : tierName === 'Kim Cương' ? 'tier-diamond' : 'tier-king';
        const newbie = !isBot && (Date.now() < (Number(player.newbieUntil) || 0) || !player.played) ? '<span class="newbie-badge">NEWBIE</span>' : '';
        const botTag = isBot ? '<span class="rank-bot-badge">BOSS</span>' : '';
        const rankIcon = index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : ('#' + (index + 1));
        const wins = Number(player.wins) || 0, losses = Number(player.losses) || 0, played = Number(player.played) || (wins + losses);
        const winrate = played > 0 ? Math.round((wins / played) * 100) + '%' : '0%';
        const isMe = me && player.uid === me;
        const challengeBtn = !isMe ? `<button type="button" class="rank-table-challenge-btn" data-challenge-uid="${esc(player.uid)}">⚔️ ${isBot ? 'Đấu Boss' : 'Khiêu chiến'}</button>` : '<span style="color:#67e8f9;font-size:12px;font-weight:900;">(Bạn)</span>';

        return `<tr class="${isMe ? 'is-me' : ''}">
          <td class="rank-num" style="text-align:center;">${rankIcon}</td>
          <td>
            <div style="display:inline-flex;align-items:center;gap:6px;font-weight:800;">
              <span class="rank-presence ${active ? 'is-online' : 'is-offline'}">
                <i aria-hidden="true"></i>${isBot ? 'Sẵn sàng' : (active ? 'Online' : 'Offline')}
              </span>
              <span>${esc(player.name)}</span>
              ${botTag}${newbie}
            </div>
          </td>
          <td><span class="tier-pill ${tierClass}">${esc(tierName)}</span></td>
          <td><b style="color:#fbbf24;font-size:14px;">${rating}</b> <small style="opacity:0.7">Elo</small></td>
          <td><span style="color:#4ade80;font-weight:800;">${wins}W</span> - <span style="color:#f87171;">${losses}L</span></td>
          <td style="font-weight:800;color:#e2e8f0;">${winrate}</td>
          <td style="text-align:center;">${challengeBtn}</td>
        </tr>`;
      }).join('');
      const emptyNode = overlay.querySelector('#rankEmpty');
      if (emptyNode) emptyNode.textContent = rows.length ? '' : 'Chưa có người chơi trên bảng xếp hạng.';
    }

    tbody.onclick = async event => {
      const challengeButton = event.target.closest('[data-challenge-uid]');
      if (!challengeButton || challengeBusy) return;
      const targetUid = challengeButton.dataset.challengeUid;
      challengeBusy = true; challengeButton.disabled = true; challengeButton.textContent = 'Đang gọi...';
      try {
        const selected = people.get(targetUid);
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
          const preset = presets[targetUid];
          if (typeof startGame === 'function') {
            startGame({ customBotDeck: preset, ghost: null });
          } else {
            await challenge(targetUid);
          }
        } else {
          await challenge(targetUid);
          window.siteRank.close();
        }
      } catch (error) {
        alert(error.message || 'Không thể khiêu chiến đối thủ.');
        challengeBusy = false;
        challengeButton.disabled = false;
        challengeButton.textContent = '⚔️ Khiêu chiến';
      }
    };

    paint();

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
    stopLive = () => { subscriptions.forEach(unsubscribe => unsubscribe?.()); stopLive = null; };
  }

  window.siteRankPlayers = { render, challenge, stop() { stopLive?.(); } };
})();
