const WEEK = 7 * 24 * 60 * 60 * 1000;
const START = 1000;
const K = 32;
const DAILY_RANK_LIMIT = 20;
const TIERS = [
  { name: 'Tân Binh', min: 0 },
  { name: 'Đồng', min: 1000 },
  { name: 'Bạc', min: 1200 },
  { name: 'Vàng', min: 1400 },
  { name: 'Bạch Kim', min: 1600 },
  { name: 'Kim Cương', min: 1800 },
  { name: 'Cao Thủ', min: 2000 }
];

function newbie(profile, at) {
  return Number.isFinite(profile?.authCreatedAt) && at >= profile.authCreatedAt && at < profile.authCreatedAt + WEEK;
}

function tier(rating) {
  let current = TIERS[0], next = null;
  for (let i = 0; i < TIERS.length; i++) {
    if (rating >= TIERS[i].min) current = TIERS[i];
    else { next = TIERS[i]; break; }
  }
  const span = next ? next.min - current.min : 0;
  return {
    name: current.name,
    min: current.min,
    next: next?.name || null,
    nextMin: next?.min ?? null,
    missing: next ? Math.max(0, next.min - rating) : 0,
    progress: next ? Math.max(0, Math.min(100, Math.floor((rating - current.min) * 100 / span))) : 100
  };
}

function deltas(a, b, winner, at, offlineSeat = null) {
  if (![0, 1, null].includes(offlineSeat)) throw Error('Invalid server offline seat');
  if (![0, 1, null].includes(winner)) throw Error('Invalid canonical winner');
  if (winner === null) return [0, 0];
  const loser = 1 - winner, players = [a, b];
  const base = Math.max(1, Math.round(K * (1 - 1 / (1 + 10 ** ((players[loser].rating - players[winner].rating) / 400)))));
  const result = [0, 0];
  result[winner] = newbie(players[winner], at) ? 2 * base : newbie(players[loser], at) ? 1 : base;
  result[loser] = newbie(players[loser], at) ? 0 : -Math.min(offlineSeat === loser ? Math.ceil(base / 2) : base, players[loser].rating);
  return result;
}

module.exports = { WEEK, START, K, DAILY_RANK_LIMIT, TIERS, newbie, tier, deltas };
