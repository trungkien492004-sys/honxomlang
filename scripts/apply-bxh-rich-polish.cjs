const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function replaceInFile(relativePath, findStr, replaceStr) {
  const filePath = path.join(root, relativePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const normContent = content.replace(/\r\n/g, '\n');
  const normFind = findStr.replace(/\r\n/g, '\n');
  const normReplace = replaceStr.replace(/\r\n/g, '\n');
  if (!normContent.includes(normFind)) {
    throw new Error(`Could not find target string in ${relativePath}`);
  }
  const updatedNorm = normContent.replace(normFind, normReplace);
  fs.writeFileSync(filePath, updatedNorm, 'utf8');
  console.log(`Successfully updated ${relativePath}`);
}

// 1. Update site_rank_players.js
console.log('--- Updating site_rank_players.js ---');
const srpPath = path.join(root, 'assets/js/site_rank_players.js');
let srpContent = fs.readFileSync(srpPath, 'utf8').replace(/\r\n/g, '\n');

// Target people map setup
const peopleTarget = `    const people = new Map();
    for (const { id, data } of directory) people.set(data.uid || id, { ...data, uid: data.uid || id });
    for (const { id, data } of ranked) people.set(data.uid || id, { ...people.get(data.uid || id), ...data, uid: data.uid || id });`;

const peopleReplace = `    const LEGEND_BOTS = [
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
    for (const { id, data } of ranked) people.set(data.uid || id, { ...people.get(data.uid || id), ...data, uid: data.uid || id });`;

srpContent = srpContent.replace(peopleTarget, peopleReplace);

// Target ordered()
const orderedTarget = `    function ordered() {
      return [...people.values()].sort((a, b) => (Number.isFinite(b.rating) ? b.rating : -1) - (Number.isFinite(a.rating) ? a.rating : -1) || String(a.name).localeCompare(String(b.name), 'vi'));
    }`;

const orderedReplace = `    function ordered() {
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
    }`;

srpContent = srpContent.replace(orderedTarget, orderedReplace);

// Target paint()
const paintTarget = `    function paint() {
      const rows = ordered();
      tbody.innerHTML = rows.map((player, index) => {
        const active = online(player);
        const newbie = Date.now() < (Number(player.newbieUntil) || 0) ? '<span class="newbie-badge">NEWBIE</span>' : '';
        return \`<tr><td>\${Number.isFinite(player.rating) ? index + 1 : '—'}</td><td><button type="button" class="rank-player-open" data-player-uid="\${esc(player.uid)}"><span class="rank-presence \${active ? 'is-online' : 'is-offline'}" data-presence-uid="\${esc(player.uid)}"><i aria-hidden="true"></i>\${active ? 'Online' : 'Offline'}</span><span>\${esc(player.name)}</span>\${newbie}</button></td><td>\${Number.isFinite(player.rating) ? player.rating : '—'}</td><td>\${Number(player.wins) || 0}</td><td>\${Number(player.losses) || 0}</td><td>\${Number(player.draws) || 0}</td><td>\${Number(player.played) || 0}</td></tr>\`;
      }).join('');
      overlay.querySelector('#rankEmpty').textContent = rows.length ? '' : 'Chưa có người chơi lưu bộ bài. Mở đấu bài để xuất hiện trong danh sách.';
      paintFriends();
      paintPresence();
    }`;

const paintReplace = `    function paint() {
      const rows = ordered();
      tbody.innerHTML = rows.map((player, index) => {
        const active = player.bot || online(player);
        const rating = Number.isFinite(Number(player.rating)) ? Number(player.rating) : 1000;
        const newbie = !player.bot && (Date.now() < (Number(player.newbieUntil) || 0) || !player.played) ? '<span class="newbie-badge">NEWBIE</span>' : '';
        const botTag = player.bot ? '<span class="rank-bot-badge">BOSS</span>' : '';
        const rankIcon = index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : ('#' + (index + 1));
        return \`<tr>
          <td class="rank-num">\${rankIcon}</td>
          <td>
            <button type="button" class="rank-player-open" data-player-uid="\${esc(player.uid)}">
              <span class="rank-presence \${active ? 'is-online' : 'is-offline'}" data-presence-uid="\${esc(player.uid)}">
                <i aria-hidden="true"></i>\${player.bot ? 'Sẵn sàng' : (active ? 'Online' : 'Offline')}
              </span>
              <span>\${esc(player.name)}</span>
              \${botTag}\${newbie}
            </button>
          </td>
          <td><b>\${rating}</b> <small style="opacity:0.75">Elo</small></td>
          <td style="color:#4ade80;font-weight:800;">\${Number(player.wins) || 0}</td>
          <td style="color:#f87171;">\${Number(player.losses) || 0}</td>
          <td style="opacity:0.75;">\${Number(player.draws) || 0}</td>
          <td><b>\${Number(player.played) || 0}</b></td>
        </tr>\`;
      }).join('');
      overlay.querySelector('#rankEmpty').textContent = rows.length ? '' : 'Chưa có người chơi lưu bộ bài. Mở đấu bài để xuất hiện trong danh sách.';
      paintFriends();
      paintPresence();
    }`;

srpContent = srpContent.replace(paintTarget, paintReplace);

// Target paintSelected()
const selectedTarget = `    function paintSelected() {
      const selected = people.get(selectedUid);
      if (!selected || panel.hidden) return;
      const active = online(selected), isFriend = friends.has(selectedUid);
      panel.querySelector('#rankOpponentName').textContent = selected.name || 'Đấu sĩ';
      panel.querySelector('#rankOpponentPresence').textContent = active ? '🟢 Đang online — có thể gửi lời mời.' : '⚪ Offline — máy sẽ dùng bộ bài đã lưu để đấu.';
      const challengeButton = panel.querySelector('#rankChallenge');
      challengeButton.disabled = challengeBusy || selected.uid === me;
      challengeButton.textContent = isFriend ? 'Thách đấu bạn · không giới hạn' : 'Khiêu chiến';
      const friendButton = panel.querySelector('#rankFriendAction');
      friendButton.hidden = !me || selected.uid === me || isFriend;
      friendButton.disabled = friendBusy || outgoing.has(selectedUid) || incoming.has(selectedUid);
      friendButton.textContent = friends.has(selectedUid) ? 'Bạn bè' : incoming.has(selectedUid) ? 'Đang có lời mời từ người này' : outgoing.has(selectedUid) ? 'Đã gửi lời mời' : 'Kết bạn';
    }`;

const selectedReplace = `    function paintSelected() {
      const selected = people.get(selectedUid);
      if (!selected || panel.hidden) return;
      const isBot = !!selected.bot;
      const active = isBot || online(selected), isFriend = !isBot && friends.has(selectedUid);
      panel.querySelector('#rankOpponentName').textContent = (selected.name || 'Đấu sĩ') + (selected.title ? ' · ' + selected.title : '') + ' · ' + (Number.isFinite(Number(selected.rating)) ? selected.rating : 1000) + ' Elo';
      panel.querySelector('#rankOpponentPresence').textContent = isBot ? '⚔️ Đấu Sĩ Huyền Thoại — Bấm khiêu chiến để đấu Rank ngay!' : (active ? '🟢 Đang online — có thể gửi lời mời đấu online.' : '⚪ Offline — máy sẽ dùng bộ bài đã lưu để đấu.');
      const challengeButton = panel.querySelector('#rankChallenge');
      challengeButton.disabled = challengeBusy || (!isBot && selected.uid === me);
      challengeButton.textContent = isBot ? \`⚔️ Thách đấu \${selected.name}\` : (isFriend ? 'Thách đấu bạn · không giới hạn' : 'Khiêu chiến');
      const friendButton = panel.querySelector('#rankFriendAction');
      friendButton.hidden = isBot || !me || selected.uid === me || isFriend;
      friendButton.disabled = friendBusy || outgoing.has(selectedUid) || incoming.has(selectedUid);
      friendButton.textContent = friends.has(selectedUid) ? 'Bạn bè' : incoming.has(selectedUid) ? 'Đang có lời mời từ người này' : outgoing.has(selectedUid) ? 'Đã gửi lời mời' : 'Kết bạn';
    }`;

srpContent = srpContent.replace(selectedTarget, selectedReplace);

// Target challenge click handler in site_rank_players.js
const challengeTarget = `    panel.querySelector('#rankChallenge').onclick = async () => {
      if (!selectedUid || challengeBusy) return;
      challengeBusy = true; panel.querySelector('#rankChallenge').disabled = true;
      try { await challenge(selectedUid); window.siteRank.close(); }
      catch (error) { panel.querySelector('#rankChallengeError').textContent = error.message; challengeBusy = false; paintSelected(); }
    };`;

const challengeReplace = `    panel.querySelector('#rankChallenge').onclick = async () => {
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
    };`;

srpContent = srpContent.replace(challengeTarget, challengeReplace);

fs.writeFileSync(srpPath, srpContent, 'utf8');
console.log('Successfully updated assets/js/site_rank_players.js');

// 2. Update meme_id_duel.js recordResult write logic
console.log('--- Updating meme_id_duel.js recordResult ---');
const midPath = path.join(root, 'assets/js/meme_id_duel.js');
let midContent = fs.readFileSync(midPath, 'utf8').replace(/\r\n/g, '\n');

const recordTarget = `     const result={uid:currentUid,matchId,opponentUid,outcome,delta,ratingBefore:rating,ratingAfter:nextRating,createdAt:stamp()};
     const profile={uid:currentUid,name:String(currentIdentity?.user?.displayName||mine.name||'Đấu sĩ').slice(0,48),rating:nextRating,...counts,lastMatchId:matchId,lastSeen:stamp(),...(!mineSnap.exists?{newbieUntil:createdUntil}:{})};
     tx.set(resultRef,result);tx.set(mineRef,profile,{merge:true});receipt={...result,...counts};`;

const recordReplace = `     const result={uid:currentUid,matchId,opponentUid,outcome,delta,ratingBefore:rating,ratingAfter:nextRating,createdAt:stamp()};
     const profileName=String(currentIdentity?.user?.displayName||mine.name||'Đấu sĩ').slice(0,48);
     tx.set(resultRef,result);
     if(!mineSnap.exists){
       const newProfile={uid:currentUid,name:profileName,rating:nextRating,...counts,newbieUntil:createdUntil,lastMatchId:matchId,lastSeen:stamp()};
       tx.set(mineRef,newProfile);
     }else{
       const updateProfile={name:profileName,rating:nextRating,...counts,lastMatchId:matchId,lastSeen:stamp()};
       tx.update(mineRef,updateProfile);
     }
     receipt={...result,...counts};`;

midContent = midContent.replace(recordTarget, recordReplace);
fs.writeFileSync(midPath, midContent, 'utf8');
console.log('Successfully updated assets/js/meme_id_duel.js');

// 3. Update CSS in assets/css/site_rank.css
console.log('--- Updating site_rank.css ---');
const cssPath = path.join(root, 'assets/css/site_rank.css');
let currentCss = fs.readFileSync(cssPath, 'utf8');
const extraCss = `
.rank-num { font-weight: 900; font-size: 13.5px; text-align: center; }
.rank-bot-badge { display: inline-block; vertical-align: middle; padding: 2px 5px; border-radius: 5px; background: #f59e0b; color: #451a03; border: 1px solid #fde68a; font: 900 10px/1.3 'Nunito', sans-serif; margin-left: 5px; white-space: nowrap; }
`;
if (!currentCss.includes('rank-bot-badge')) {
  fs.writeFileSync(cssPath, currentCss.trim() + '\n' + extraCss, 'utf8');
  console.log('Successfully appended rank bot badge CSS to site_rank.css');
}

// 4. Update cache-busters to v=20261027-bxh-live2
console.log('--- Updating cache-busters to v=20261027-bxh-live2 ---');
function bumpVersion(file, oldV, newV) {
  const p = path.join(root, file);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replaceAll(oldV, newV);
  fs.writeFileSync(p, c, 'utf8');
  console.log(`Bumped version in ${file}`);
}

bumpVersion('assets/js/memecard.js', '20261027-bxh-promo1', '20261027-bxh-live2');
bumpVersion('index.html', '20261027-bxh-promo1', '20261027-bxh-live2');
bumpVersion('memecard.html', '20261027-bxh-promo1', '20261027-bxh-live2');
bumpVersion('scripts/test-bot-duel-bxh.cjs', '20261027-bxh-promo1', '20261027-bxh-live2');

console.log('ALL BXH RICH POLISH UPDATES APPLIED SUCCESSFULLY!');
