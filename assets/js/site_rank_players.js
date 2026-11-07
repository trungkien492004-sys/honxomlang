// Public rank list, live presence, and private friend requests.
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const timeOf = value => typeof value?.toMillis === 'function' ? value.toMillis()
    : typeof value === 'string' ? Date.parse(value) || 0 : Number(value) || 0;
  const online = player => player?.online === true && timeOf(player.lastSeen) > 0 && Date.now() - timeOf(player.lastSeen) <= 90000;
  const withoutPresence = data => { const copy = { ...(data || {}) }; delete copy.online; delete copy.lastSeen; return copy; };
  let stopLive = null;

  function timestamp() {
    try { return window.firebase.firestore.FieldValue.serverTimestamp(); }
    catch { return new Date(); }
  }

  async function challenge(uid) {
    const identity = window.siteIdentity;
    if (!identity?.user) {
      try {
        if (typeof identity?.login === 'function' && !identity.signing) {
          await Promise.race([identity.login(), new Promise(r => setTimeout(r, 1200))]);
        }
      } catch(e) { console.warn('Challenge login:', e); }
    }
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
    const directoryQuery = store.collection('duel_directory').limit(100);
    const [directory, ranked] = await Promise.all([
      getDocs(directoryQuery).catch(() => []),
      rankedSnapshot?.docs ? Promise.resolve(rankedSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))) : getDocs(rankedQuery)
    ]);
    if (!overlay.isConnected) return;

    const LEGEND_BOTS = [
      { uid: 'bot-yugi', name: 'Yugi Muto / Atem', bot: true, heroId: 0, rating: 1600, wins: 15, losses: 2, draws: 0, played: 17, online: true, title: 'Vua Trò Chơi · Thần Osiris' },
      { uid: 'bot-kaiba', name: 'Seto Kaiba', bot: true, heroId: 1, rating: 1550, wins: 14, losses: 3, draws: 0, played: 17, online: true, title: 'Đỉnh Cao Mắt Xanh · Obelisk' },
      { uid: 'bot-zane', name: 'Zane Truesdale', bot: true, heroId: 5, rating: 1450, wins: 12, losses: 4, draws: 0, played: 16, online: true, title: 'Rồng Máy Tận Diệt · Cyber' },
      { uid: 'bot-jaden', name: 'Jaden Yuki', bot: true, heroId: 4, rating: 1350, wins: 10, losses: 5, draws: 0, played: 15, online: true, title: 'Anh Hùng Tối Thượng · HERO' },
      { uid: 'bot-pegasus', name: 'Pegasus J. Crawford', bot: true, heroId: 3, rating: 1250, wins: 8, losses: 6, draws: 0, played: 14, online: true, title: 'Vương Quốc Hoạt Hình · Toon' },
      { uid: 'bot-joey', name: 'Joey Wheeler', bot: true, heroId: 2, rating: 1150, wins: 7, losses: 7, draws: 0, played: 14, online: true, title: 'Rồng Đen Bất Diệt · May Mắn' },
      // Đợt mở rộng: Đấu Sĩ Máy luôn có người "ngồi sảnh" để bảng xếp hạng không bao giờ vắng. Vẫn ghi rõ là AI Máy.
      { uid: 'bot-mai', name: 'Mai Valentine', bot: true, heroId: 6, rating: 1500, wins: 13, losses: 4, draws: 0, played: 17, title: 'Vũ Điệu Yêu Điểu · Harpie', deck: 'Mai · Kinh điển' },
      { uid: 'bot-yusei', name: 'Yusei Fudo', bot: true, heroId: 8, rating: 1480, wins: 12, losses: 4, draws: 0, played: 16, title: 'Rồng Tinh Tú · Đồng Bộ', deck: 'Yusei · Kinh điển' },
      { uid: 'bot-yuma', name: 'Yuma Tsukumo', bot: true, heroId: 7, rating: 1300, wins: 9, losses: 6, draws: 0, played: 15, title: 'Kattobingu · XYZ', deck: 'Yuma · Kinh điển' },
      { uid: 'bot-yugi2', name: 'Yugi · Đấu Sĩ Phản Công', bot: true, heroId: 0, rating: 1420, wins: 11, losses: 5, draws: 0, played: 16, title: 'Phản Công Ma Thuật', deck: 'Yugi · Phản công' },
      { uid: 'bot-kaiba2', name: 'Kaiba · Đấu Sĩ Phản Công', bot: true, heroId: 1, rating: 1390, wins: 11, losses: 6, draws: 0, played: 17, title: 'Phản Công Mắt Xanh', deck: 'Kaiba · Phản công' },
      { uid: 'bot-zane2', name: 'Zane · Đấu Sĩ Phản Công', bot: true, heroId: 5, rating: 1330, wins: 9, losses: 6, draws: 0, played: 15, title: 'Phản Công Rồng Máy', deck: 'Zane · Phản công' },
      { uid: 'bot-jaden2', name: 'Jaden · Đấu Sĩ Phản Công', bot: true, heroId: 4, rating: 1260, wins: 8, losses: 6, draws: 0, played: 14, title: 'Phản Công HERO', deck: 'Jaden · Phản công' },
      { uid: 'bot-joey2', name: 'Joey · Đấu Sĩ Phản Công', bot: true, heroId: 2, rating: 1100, wins: 6, losses: 7, draws: 0, played: 13, title: 'Phản Công May Mắn', deck: 'Joey · Phản công' },
      { uid: 'bot-pegasus2', name: 'Pegasus · Đấu Sĩ Phản Công', bot: true, heroId: 3, rating: 1050, wins: 5, losses: 7, draws: 0, played: 12, title: 'Phản Công Hoạt Hình', deck: 'Pegasus · Phản công' },
      { uid: 'bot-yugi3', name: 'Yugi · Tập Sự', bot: true, heroId: 0, rating: 980, wins: 4, losses: 6, draws: 0, played: 10, title: 'Bộ Kinh Điển', deck: 'Yugi · Kinh điển' },
      { uid: 'bot-kaiba3', name: 'Kaiba · Tập Sự', bot: true, heroId: 1, rating: 960, wins: 4, losses: 7, draws: 0, played: 11, title: 'Bộ Kinh Điển', deck: 'Kaiba · Kinh điển' },
      { uid: 'bot-mai2', name: 'Mai · Phản Công', bot: true, heroId: 6, rating: 1210, wins: 8, losses: 7, draws: 0, played: 15, title: 'Phản Công Yêu Điểu', deck: 'Mai · Phản công' },
      { uid: 'bot-yusei2', name: 'Yusei · Phản Công', bot: true, heroId: 8, rating: 1240, wins: 8, losses: 6, draws: 0, played: 14, title: 'Phản Công Đồng Bộ', deck: 'Yusei · Phản công' },
      { uid: 'bot-zane3', name: 'Zane · Cyberdark', bot: true, heroId: 5, rating: 1360, wins: 10, losses: 6, draws: 0, played: 16, title: 'Cyberdark Hắc Ám', deck: 'Zane · Cyberdark' }
    ];
    // Trạng thái hiện diện giả lập, đổi liên tục theo thời gian (xác định theo uid + đồng hồ nên không giật khi vẽ lại).
    const botHash = text => { let h = 2166136261; for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619); return h >>> 0; };
    function botStatus(bot, now = Date.now()) {
      const slot = Math.floor(now / 45000), h = botHash(bot.uid + ':' + slot) % 100;
      if (h < 62) return 'online';
      if (h < 86) return 'dueling';
      return 'away';
    }
    const BOT_STATUS_TEXT = { online: 'AI Máy · Online', dueling: 'AI Máy · Đang đấu', away: 'AI Máy · Vừa rời' };
    const botMap = new Map();
    for (const b of LEGEND_BOTS) botMap.set(b.uid, { ...b });

    const people = new Map();
    for (const { id, data } of ranked) {
      const pUid = data?.uid || id;
      if (!pUid || data?.bot || data?.isBot === true || String(pUid).startsWith('bot-') || botMap.has(pUid)) continue;
      people.set(pUid, { ...withoutPresence(data), uid: pUid });
    }
    for (const { id, data } of directory) {
      const pUid = data?.uid || id;
      if (people.has(pUid)) {
        people.set(pUid, { ...data, ...people.get(pUid), uid: pUid });
      }
    }

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
      return [...people.values()].filter(p => !p.bot && p.isBot !== true && !String(p.uid).startsWith('bot-') && !botMap.has(p.uid)).sort((a, b) => {
        const ratingA = Number.isFinite(Number(a.rating)) ? Number(a.rating) : 1000;
        const ratingB = Number.isFinite(Number(b.rating)) ? Number(b.rating) : 1000;
        if (ratingB !== ratingA) return ratingB - ratingA;
        const winsA = Number(a.wins) || 0, winsB = Number(b.wins) || 0;
        if (winsB !== winsA) return winsB - winsA;
        const timeA = timeOf(a.lastSeen) || Number(a.registeredAt) || 0;
        const timeB = timeOf(b.lastSeen) || Number(b.registeredAt) || 0;
        if (timeB !== timeA) return timeB - timeA;
        const playedA = Number(a.played) || 0, playedB = Number(b.played) || 0;
        if (playedB !== playedA) return playedB - playedA;
        return String(a.uid || '').localeCompare(String(b.uid || ''));
      });
    }

    // Ensure dedicated legend bots section exists below table
    let botSection = overlay.querySelector('#rankLegendBotsSection');
    if (!botSection) {
      const tableWrap = overlay.querySelector('.rank-table-wrap');
      if (tableWrap) {
        botSection = document.createElement('div');
        botSection.id = 'rankLegendBotsSection';
        botSection.className = 'rank-legend-bots-section';
        botSection.style.cssText = 'margin-top:24px;border-top:1px dashed rgba(255,255,255,0.2);padding-top:16px;';
        botSection.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 4px;">
            <div>
              <h3 style="margin:0;font-size:15px;color:#fde047;font-weight:800;display:flex;align-items:center;gap:6px;">
                <span>🤖</span> Huyền thoại đối kháng · Đấu máy luyện tập
              </h3>
              <p style="margin:2px 0 0 0;font-size:11.5px;color:#94a3b8;">
                Đấu Sĩ AI huyền thoại mô phỏng đối kháng anime DM/GX. Trận đấu máy là đấu tập, <b>KHÔNG</b> cộng/trừ điểm Elo Rank chính thức.
              </p>
            </div>
            <span style="font-size:11px;background:#1e293b;border:1px solid rgba(253,224,71,0.4);color:#fde047;padding:3px 10px;border-radius:12px;font-weight:700;"><span id="rankBotCount">${LEGEND_BOTS.length} Đấu Sĩ Máy</span></span>
          </div>
          <table class="rank-table" style="margin-top:8px;">
            <thead>
              <tr>
                <th class="rank-col-num" style="text-align:center;">Boss</th>
                <th class="rank-col-player-head">Đấu sĩ máy</th>
                <th class="rank-col-tier">Bậc</th>
                <th class="rank-col-elo" style="text-align:center;">Chuẩn Elo</th>
                <th class="rank-col-record">Thành tích</th>
                <th class="rank-col-winrate">Tỉ lệ</th>
                <th class="rank-col-action" style="text-align:center;">Đấu tập</th>
              </tr>
            </thead>
            <tbody id="rankBotRows"></tbody>
          </table>
        `;
        tableWrap.appendChild(botSection);
      }
    }

    function paint() {
      const rows = ordered();
      tbody.innerHTML = rows.map((player, index) => {
        const active = online(player);
        const rating = Number.isFinite(Number(player.rating)) ? Number(player.rating) : 1000;
        const tierName = getTier(rating);
        const tierClass = tierName === 'Tân Binh' ? 'tier-newbie' : tierName === 'Đồng' ? 'tier-bronze' : tierName === 'Bạc' ? 'tier-silver' : tierName === 'Vàng' ? 'tier-gold' : tierName === 'Bạch Kim' ? 'tier-plat' : tierName === 'Kim Cương' ? 'tier-diamond' : 'tier-king';
        const newbie = (Date.now() < (Number(player.newbieUntil) || 0) || !player.played) ? '<span class="newbie-badge">NEWBIE</span>' : '';
        const rankIcon = index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : ('#' + (index + 1));
        const wins = Number(player.wins) || 0, losses = Number(player.losses) || 0, played = Number(player.played) || (wins + losses);
        const winrate = played > 0 ? Math.round((wins / played) * 100) + '%' : '0%';
        const isMe = me && player.uid === me;
        const challengeBtn = !isMe ? `<button type="button" class="rank-table-challenge-btn" data-challenge-uid="${esc(player.uid)}"><span class="btn-full-text">⚔️ Khiêu chiến</span><span class="btn-short-text">⚔️ Đấu</span></button>` : '<span style="color:#67e8f9;font-size:12px;font-weight:900;">(Bạn)</span>';

        return `<tr class="${isMe ? 'is-me' : ''}">
          <td class="rank-num" style="text-align:center;">${rankIcon}</td>
          <td class="rank-col-player">
            <div class="rank-player-row-top">
              <span class="rank-presence ${active ? 'is-online' : 'is-offline'}">
                <i aria-hidden="true"></i><span class="rank-presence-label">${active ? 'Online' : 'Offline'}</span>
              </span>
              <span class="rank-player-name">${esc(player.name)}</span>
              ${newbie}
            </div>
            <div class="rank-mobile-subinfo">
              <span class="tier-pill ${tierClass}">${esc(tierName)}</span>
              <span class="rank-mobile-record">${wins}W - ${losses}L</span>
              <span class="rank-mobile-rate">(${winrate})</span>
            </div>
          </td>
          <td class="rank-col-tier"><span class="tier-pill ${tierClass}">${esc(tierName)}</span></td>
          <td class="rank-col-elo"><b class="rank-elo-val">${rating}</b> <small class="rank-elo-lbl">Elo</small></td>
          <td class="rank-col-record"><span class="rank-wins">${wins}W</span> - <span class="rank-losses">${losses}L</span></td>
          <td class="rank-col-winrate" style="font-weight:800;color:#e2e8f0;">${winrate}</td>
          <td class="rank-col-action">${challengeBtn}</td>
        </tr>`;
      }).join('');
      const emptyNode = overlay.querySelector('#rankEmpty');
      if (emptyNode) emptyNode.textContent = rows.length ? '' : 'Chưa có người chơi trên bảng xếp hạng.';

      // Render legend bots in separate section
      const botTbody = overlay.querySelector('#rankBotRows');
      if (botTbody) {
        botTbody.innerHTML = LEGEND_BOTS.map((bot, index) => {
          const rating = bot.rating;
          const tierName = getTier(rating);
          const tierClass = tierName === 'Tân Binh' ? 'tier-newbie' : tierName === 'Đồng' ? 'tier-bronze' : tierName === 'Bạc' ? 'tier-silver' : tierName === 'Vàng' ? 'tier-gold' : tierName === 'Bạch Kim' ? 'tier-plat' : tierName === 'Kim Cương' ? 'tier-diamond' : 'tier-king';
          const wins = bot.wins, losses = bot.losses, played = bot.played;
          const winrate = played > 0 ? Math.round((wins / played) * 100) + '%' : '0%';
          const challengeBtn = `<button type="button" class="rank-table-challenge-btn" data-challenge-uid="${esc(bot.uid)}" style="background:linear-gradient(135deg,#b45309,#78350f);border-color:#fde047;"><span class="btn-full-text">⚔️ Đấu tập AI</span><span class="btn-short-text">⚔️ Tập</span></button>`;

          return `<tr>
            <td class="rank-num" style="text-align:center;"><span class="rank-bot-badge">BOSS #${index + 1}</span></td>
            <td class="rank-col-player">
              <div class="rank-player-row-top">
                <span class="rank-presence ${botStatus(bot) === 'away' ? 'is-offline' : 'is-online'}">
                  <i aria-hidden="true"></i><span class="rank-presence-label">${BOT_STATUS_TEXT[botStatus(bot)]}</span>
                </span>
                <span class="rank-player-name" style="color:#fde047;font-weight:800;">${esc(bot.name)}</span>
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${esc(bot.title || '')}</div>
              <div class="rank-mobile-subinfo">
                <span class="tier-pill ${tierClass}">${esc(tierName)}</span>
                <span class="rank-mobile-record">${wins}W - ${losses}L</span>
                <span class="rank-mobile-rate">(${winrate})</span>
              </div>
            </td>
            <td class="rank-col-tier"><span class="tier-pill ${tierClass}">${esc(tierName)}</span></td>
            <td class="rank-col-elo"><b class="rank-elo-val" style="color:#fde047;">${rating}</b> <small class="rank-elo-lbl">Elo</small></td>
            <td class="rank-col-record"><span class="rank-wins">${wins}W</span> - <span class="rank-losses">${losses}L</span></td>
            <td class="rank-col-winrate" style="font-weight:800;color:#e2e8f0;">${winrate}</td>
            <td class="rank-col-action">${challengeBtn}</td>
          </tr>`;
        }).join('');
        const countNode = overlay.querySelector('#rankBotCount');
        if (countNode) {
          const live = LEGEND_BOTS.filter(bot => botStatus(bot) !== 'away').length;
          countNode.textContent = `🟢 ${live}/${LEGEND_BOTS.length} Đấu Sĩ Máy online`;
        }
      }
    }

    const handleChallengeClick = async event => {
      const challengeButton = event.target.closest('[data-challenge-uid]');
      if (!challengeButton || challengeBusy) return;
      const targetUid = challengeButton.dataset.challengeUid;
      const selected = botMap.get(targetUid) || people.get(targetUid);
      challengeBusy = true; challengeButton.disabled = true; challengeButton.textContent = 'Đang gọi...';
      try {
        if (selected?.bot || botMap.has(targetUid)) {
          window.siteRank.close();
          const presets = {
            'bot-yugi': 'Yugi · Ma Thuật Tối Thượng',
            'bot-kaiba': 'Kaiba · Đỉnh Cao Mắt Xanh',
            'bot-joey': 'Joey · Rồng Đen Bất Diệt',
            'bot-pegasus': 'Pegasus · Vương Quốc Hoạt Hình',
            'bot-jaden': 'Jaden · Anh Hùng Tối Thượng',
            'bot-zane': 'Zane · Rồng Máy Tận Diệt'
          };
          const preset = presets[targetUid] || botMap.get(targetUid)?.deck || 'Kaiba · Đỉnh Cao Mắt Xanh';
          if (typeof startGame === 'function') {
            startGame({ customBotDeck: preset, ghost: null, isPractice: true });
          } else {
            if (typeof window.openMemeCardGame !== 'function') throw Error('Hãy mở đấu bài từ sảnh để khiêu chiến.');
            window.openMemeCardGame();
            let started = false;
            for (let i = 0; i < 100; i++) {
              const child = document.getElementById('memecardFrame')?.contentWindow;
              if (typeof child?.startGame === 'function') {
                child.startGame({ customBotDeck: preset, ghost: null, isPractice: true });
                started = true;
                break;
              }
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (!started) throw Error('Chưa mở được đấu bài. Hãy thử lại.');
          }
        } else {
          await challenge(targetUid);
          window.siteRank.close();
        }
      } catch (error) {
        if (typeof window.showRankError === 'function') {
          window.showRankError(error, 'Khiêu chiến đối thủ');
        } else if (typeof window.parent?.showRankError === 'function') {
          window.parent.showRankError(error, 'Khiêu chiến đối thủ');
        } else if (window.showActionNotice) {
          window.showActionNotice('⚠️ ' + (error.message || 'Không thể khiêu chiến đối thủ.'));
        } else {
          alert(error.message || 'Không thể khiêu chiến đối thủ.');
        }
      } finally {
        challengeBusy = false;
        if (challengeButton && challengeButton.isConnected) {
          challengeButton.disabled = false;
          challengeButton.textContent = (selected?.bot || botMap.has(targetUid)) ? '⚔️ Đấu tập AI' : '⚔️ Khiêu chiến';
        }
      }
    };

    tbody.onclick = handleChallengeClick;
    const botSectionEl = overlay.querySelector('#rankLegendBotsSection');
    if (botSectionEl) botSectionEl.onclick = handleChallengeClick;
    paint();
    // Máy ra/vào sảnh liên tục: vẽ lại danh sách máy mỗi 15 giây khi bảng xếp hạng còn mở.
    const botTimer = setInterval(() => { if (!overlay.isConnected) { clearInterval(botTimer); return; } paint(); }, 15000);

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
      for (const { id, data } of latest) people.set(data.uid || id, { ...people.get(data.uid || id), ...withoutPresence(data), uid: data.uid || id });
      if (snapshot.docs.length === 0 && !ranked.length) { paint(); return; }
      paint();
    });
    stopLive = () => { clearInterval(botTimer); subscriptions.forEach(unsubscribe => unsubscribe?.()); stopLive = null; };
  }

  window.siteRankPlayers = { render, challenge, stop() { stopLive?.(); } };
})();
