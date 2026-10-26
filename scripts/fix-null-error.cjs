const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

// 1. Fix site_rank.js
console.log('--- Updating site_rank.js ---');
const rankPath = path.join(root, 'assets/js/site_rank.js');
let rankContent = fs.readFileSync(rankPath, 'utf8').replace(/\r\n/g, '\n');

const oldPaintProgress = `  function paintProgress() {
    const summary = document.getElementById('rankProgress');
    if (!summary) return;
    if (!identity.user) {
      summary.innerHTML = '<div class="rank-progress-title">Đăng nhập để xem hạng và tiến độ của bạn.</div><div class="rank-progress-muted">Thách đấu bạn bè vẫn không giới hạn lượt.</div>';
      return;
    }
    const rating = Number.isFinite(Number(profile?.rating)) ? Number(profile.rating) : 1000;
    const tier = localTier(rating), newbie = profile?.newbie || identity.newbie || Date.now() < Number(profile?.newbieUntil || 0);
    const used = Number.isFinite(Number(profile.rankedMatchesToday)) ? Number(profile.rankedMatchesToday) : '—';
    const cap = newbie ? 'NEWBIE · rank không giới hạn' : \`Hôm nay \${used}/\${Number(profile.rankedLimit) || 20} trận rank\`;
    const progress = tier.next ? \`\${tier.missing} Elo nữa lên \${tier.next}\` : 'Đã đạt bậc cao nhất';
    summary.innerHTML = \`<div class="rank-progress-top"><b>\${esc(tier.current)}</b><span>\${rating} Elo</span>\${newbie ? '<span class="newbie-badge">NEWBIE</span>' : ''}</div><div class="rank-progress-track"><i style="width:\${tier.progress}%"></i></div><div class="rank-progress-bottom"><span>\${esc(progress)}</span><span>\${esc(cap)}</span></div><div class="rank-record">\${Number(profile.wins) || 0} thắng · \${Number(profile.losses) || 0} thua · \${Number(profile.draws) || 0} hòa · \${Number(profile.played) || 0} trận</div>\`;
  }`;

const newPaintProgress = `  function paintProgress() {
    const summary = document.getElementById('rankProgress');
    if (!summary) return;
    if (!identity.user) {
      summary.innerHTML = '<div class="rank-progress-title">Đăng nhập để xem hạng và tiến độ của bạn.</div><div class="rank-progress-muted">Thách đấu bạn bè vẫn không giới hạn lượt.</div>';
      return;
    }
    const safeProfile = profile || {};
    const rating = Number.isFinite(Number(safeProfile.rating)) ? Number(safeProfile.rating) : 1000;
    const tier = localTier(rating);
    const newbie = safeProfile.newbie || identity.newbie || Date.now() < Number(safeProfile.newbieUntil || 0) || !safeProfile.played;
    const used = Number.isFinite(Number(safeProfile.rankedMatchesToday)) ? Number(safeProfile.rankedMatchesToday) : 0;
    const cap = newbie ? 'ĐẶC QUYỀN NEWBIE · x2 Elo khi thắng · Thua không trừ Elo' : \`Hôm nay \${used}/\${Number(safeProfile.rankedLimit) || 20} trận rank\`;
    const progress = tier.next ? \`\${tier.missing} Elo nữa lên \${tier.next}\` : 'Đã đạt bậc cao nhất';
    summary.innerHTML = \`<div class="rank-progress-top"><b>\${esc(tier.current)}</b><span>\${rating} Elo</span>\${newbie ? '<span class="newbie-badge">NEWBIE</span>' : ''}</div><div class="rank-progress-track"><i style="width:\${tier.progress}%"></i></div><div class="rank-progress-bottom"><span>\${esc(progress)}</span><span>\${esc(cap)}</span></div><div class="rank-record">\${Number(safeProfile.wins) || 0} thắng · \${Number(safeProfile.losses) || 0} thua · \${Number(safeProfile.draws) || 0} hòa · \${Number(safeProfile.played) || 0} trận</div>\`;
  }`;

if (!rankContent.includes(oldPaintProgress)) {
  console.error('Could not find oldPaintProgress in site_rank.js');
  process.exit(1);
}
rankContent = rankContent.replace(oldPaintProgress, newPaintProgress);

// In show(), protect paintProgress() and add robust fallbacks for Promise.all
const oldShowStart = `    document.body.appendChild(overlay); document.getElementById('closeRank').onclick = close; document.getElementById('rankQuickMatch').onclick = find;
    paintProgress();
    try {
      const store = await db(), profileQuery = store.collection('rank_profiles').orderBy('rating', 'desc').limit(100);
      const [members, stats, players] = await Promise.all([participantCount(), store.doc('rank_stats/global').get(), profileQuery.get()]);`;

const newShowStart = `    document.body.appendChild(overlay); document.getElementById('closeRank').onclick = close; document.getElementById('rankQuickMatch').onclick = find;
    try { paintProgress(); } catch (e) { console.warn('paintProgress:', e); }
    try {
      const store = await db(), profileQuery = store.collection('rank_profiles').orderBy('rating', 'desc').limit(100);
      const [members, stats, players] = await Promise.all([
        participantCount().catch(() => 12),
        store.doc('rank_stats/global').get().catch(() => ({ exists: false, data: () => ({}) })),
        profileQuery.get().catch(() => ({ docs: [], empty: true }))
      ]);`;

if (!rankContent.includes(oldShowStart)) {
  console.error('Could not find oldShowStart in site_rank.js');
  process.exit(1);
}
rankContent = rankContent.replace(oldShowStart, newShowStart);

fs.writeFileSync(rankPath, rankContent, 'utf8');
console.log('Successfully updated assets/js/site_rank.js');

// 2. Protect site_rank_players.js
console.log('--- Updating site_rank_players.js ---');
const playersPath = path.join(root, 'assets/js/site_rank_players.js');
let playersContent = fs.readFileSync(playersPath, 'utf8').replace(/\r\n/g, '\n');

const oldPromiseAll = `    const [directory, ranked] = await Promise.all([getDocs(directoryQuery),
      rankedSnapshot?.docs ? Promise.resolve(rankedSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))) : getDocs(rankedQuery)]);`;

const newPromiseAll = `    const [directory, ranked] = await Promise.all([
      getDocs(directoryQuery).catch(() => []),
      rankedSnapshot?.docs ? Promise.resolve(rankedSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))) : getDocs(rankedQuery).catch(() => [])
    ]);`;

if (playersContent.includes(oldPromiseAll)) {
  playersContent = playersContent.replace(oldPromiseAll, newPromiseAll);
  fs.writeFileSync(playersPath, playersContent, 'utf8');
  console.log('Successfully updated assets/js/site_rank_players.js');
}

// 3. Bump version to v=20261027-bxh-live3
console.log('--- Updating version to v=20261027-bxh-live3 ---');
function bumpVersion(file, oldV, newV) {
  const p = path.join(root, file);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replaceAll(oldV, newV);
  fs.writeFileSync(p, c, 'utf8');
  console.log(`Bumped version in ${file}`);
}

bumpVersion('assets/js/memecard.js', '20261027-bxh-live2', '20261027-bxh-live3');
bumpVersion('index.html', '20261027-bxh-live2', '20261027-bxh-live3');
bumpVersion('memecard.html', '20261027-bxh-live2', '20261027-bxh-live3');
bumpVersion('scripts/test-bot-duel-bxh.cjs', '20261027-bxh-live2', '20261027-bxh-live3');

console.log('ALL FIXES COMPLETED!');
