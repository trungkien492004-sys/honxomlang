const crypto = require('crypto');
const policy = require('./rank-policy.cjs');
const fail = (code, message) => { const error = Error(message); error.code = code; throw error; };
const cleanName = name => String(name || 'Đấu sĩ').trim().slice(0, 48) || 'Đấu sĩ';
const dayKey = now => new Date(now).toISOString().slice(0, 10);
const dailyPath = (uid, now) => `rank_daily/${uid}_${dayKey(now)}`;
const usedToday = snapshot => Number(snapshot?.data()?.rankedMatches) || 0;

function quota(profile, count, now) {
  const isNewbie = policy.newbie(profile, now);
  return { newbie: isNewbie, rankedMatchesToday: count, rankedLimit: isNewbie ? null : policy.DAILY_RANK_LIMIT,
    rankedRemaining: isNewbie ? null : Math.max(0, policy.DAILY_RANK_LIMIT - count), tier: policy.tier(profile.rating || 0) };
}

async function register(db, uid, name, authCreatedAt, now) {
  if (!Number.isFinite(authCreatedAt) || authCreatedAt > now) fail('failed-precondition', 'Không xác minh được ngày tạo tài khoản.');
  return db.runTransaction(async tx => {
    const profileRef = db.doc(`rank_profiles/${uid}`), old = await tx.get(profileRef);
    const profile = old.exists ? { ...old.data(), name: cleanName(name), lastSeen: now } : {
      uid, name: cleanName(name), authCreatedAt, newbieUntil: authCreatedAt + policy.WEEK,
      rating: policy.START, played: 0, wins: 0, losses: 0, draws: 0, registeredAt: now, lastSeen: now, activeRoom: null
    };
    const statsRef = db.doc('rank_stats/global');
    const stats = old.exists ? null : (await tx.get(statsRef)).data() || {};
    const daily = await tx.get(db.doc(dailyPath(uid, now)));
    tx.set(profileRef, profile);
    if (!old.exists) tx.set(statsRef, { ...stats, rankPlayers: (stats.rankPlayers || 0) + 1, updatedAt: now });
    return { ...profile, ...quota(profile, usedToday(daily), now) };
  });
}

async function handle(db, engine, uid, name, authCreatedAt, data, now = Date.now()) {
  if (!uid) fail('unauthenticated', 'Cần đăng nhập Google.');
  const type = data?.type;
  if (type === 'register') return { profile: await register(db, uid, name, authCreatedAt, now) };
  const ownRef = db.doc(`rank_queue/${uid}`);
  if (type === 'status') {
    const q = await ownRef.get();
    return q.exists ? { state: q.data().state, code: q.data().code || null, expiresAt: q.data().expiresAt } : { state: 'idle' };
  }
  if (type === 'cancel') return db.runTransaction(async tx => {
    const q = await tx.get(ownRef);
    if (q.exists && q.data().state === 'matched') return { state: 'matched', code: q.data().code };
    tx.set(ownRef, { uid, state: 'cancelled', expiresAt: now });
    return { state: 'idle' };
  });
  if (type !== 'queue') fail('invalid-argument', 'Thao tác rank không hợp lệ.');

  const duel = require('./duel-service.cjs');
  duel.validateDeck(data.deck, data.extra || []);
  await register(db, uid, name, authCreatedAt, now);
  return db.runTransaction(async tx => {
    const profileRef = db.doc(`rank_profiles/${uid}`), profileSnapshot = await tx.get(profileRef);
    if (!profileSnapshot.exists) fail('failed-precondition', 'Thiếu hồ sơ rank.');
    const profile = profileSnapshot.data();
    if (profile.activeRoom) {
      const room = await tx.get(db.doc(`duel_private/${profile.activeRoom}`));
      if (room.exists && room.data().status !== 'finished') return { state: 'matched', code: profile.activeRoom };
    }

    const ownDailyRef = db.doc(dailyPath(uid, now)), ownDailySnapshot = await tx.get(ownDailyRef);
    const ownUsed = usedToday(ownDailySnapshot);
    if (!policy.newbie(profile, now) && ownUsed >= policy.DAILY_RANK_LIMIT) {
      fail('resource-exhausted', 'Bạn đã dùng hết 20 trận rank hôm nay. Hãy đấu với bạn bè; lượt này không giới hạn.');
    }

    const candidates = await tx.get(db.collection('rank_queue').where('state', '==', 'waiting').where('expiresAt', '>', now).orderBy('expiresAt').limit(20));
    let candidate = null, opponent = null, opponentDailyRef = null, opponentDailySnapshot = null;
    for (const doc of candidates.docs.sort((a, b) => a.data().createdAt - b.data().createdAt)) {
      const queue = doc.data();
      if (queue.uid === uid || queue.expiresAt <= now) continue;
      const candidateProfile = await tx.get(db.doc(`rank_profiles/${queue.uid}`));
      if (!candidateProfile.exists || candidateProfile.data().activeRoom) continue;
      const opponentProfile = candidateProfile.data();
      const candidateDailyRef = db.doc(dailyPath(queue.uid, now));
      const candidateDaily = await tx.get(candidateDailyRef);
      if (!policy.newbie(opponentProfile, now) && usedToday(candidateDaily) >= policy.DAILY_RANK_LIMIT) continue;
      candidate = queue; opponent = opponentProfile; opponentDailyRef = candidateDailyRef; opponentDailySnapshot = candidateDaily;
      break;
    }

    const prefs = { deck: [...data.deck], extra: [...(data.extra || [])], heroId: data.heroId, policy: data.policy };
    if (!candidate) {
      tx.set(ownRef, { uid, name: profile.name, ...prefs, state: 'waiting', createdAt: now, expiresAt: now + 120000 });
      return { state: 'waiting', expiresAt: now + 120000, ...quota(profile, ownUsed, now) };
    }

    const code = 'DUEL-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const roomRef = db.doc(`duel_private/${code}`), collision = await tx.get(roomRef);
    if (collision.exists) fail('aborted', 'Vui lòng tìm trận lại.');
    const statsRef = db.doc('rank_stats/global'), stats = (await tx.get(statsRef)).data() || {};
    const room = await duel.createRankedRoom(engine, code, [
      { ...candidate, profile: opponent }, { uid, name: profile.name, ...prefs, profile }
    ], now);
    const incrementDaily = (oldSnapshot, targetUid) => ({ uid: targetUid, day: dayKey(now), rankedMatches: usedToday(oldSnapshot) + 1, updatedAt: now });
    tx.set(profileRef, { ...profile, activeRoom: code });
    tx.set(db.doc(`rank_profiles/${candidate.uid}`), { ...opponent, activeRoom: code });
    tx.set(ownDailyRef, incrementDaily(ownDailySnapshot, uid));
    tx.set(opponentDailyRef, incrementDaily(opponentDailySnapshot, candidate.uid));
    tx.set(ownRef, { uid, state: 'matched', code, expiresAt: now + 120000 });
    tx.set(db.doc(`rank_queue/${candidate.uid}`), { uid: candidate.uid, state: 'matched', code, expiresAt: now + 120000 });
    tx.set(statsRef, { ...stats, matchesStarted: (stats.matchesStarted || 0) + 1, updatedAt: now });
    duel.saveRankedRoom(tx, db, room, now);
    return { state: 'matched', code, ...quota(profile, ownUsed + 1, now) };
  });
}

async function settle(tx, db, room, now) {
  if (room.mode !== 'ranked' || room.rankSettled || !room.state?.finished) return;
  if (!['player', 'enemy', 'draw'].includes(room.state.winner)) fail('failed-precondition', 'Chưa có kết quả hợp lệ.');
  const refs = room.players.map(player => db.doc(`rank_profiles/${player.uid}`)), profiles = [];
  for (const ref of refs) { const snapshot = await tx.get(ref); if (!snapshot.exists) fail('failed-precondition', 'Thiếu hồ sơ rank.'); profiles.push(snapshot.data()); }
  const statsRef = db.doc('rank_stats/global'), stats = (await tx.get(statsRef)).data() || {};
  const winner = room.state.winner === 'draw' ? null : room.state.winner === 'player' ? 0 : 1;
  const delta = policy.deltas(room.rank.members[0], room.rank.members[1], winner, room.rank.startedAt, room.rank.offlineSeat ?? null);
  const players = profiles.map((profile, i) => ({ uid: profile.uid, name: profile.name, before: profile.rating, delta: delta[i],
    after: Math.max(0, profile.rating + delta[i]), newbie: policy.newbie(room.rank.members[i], room.rank.startedAt) }));
  for (let i = 0; i < 2; i++) {
    const profile = profiles[i];
    tx.set(refs[i], { ...profile, rating: players[i].after, played: (profile.played || 0) + 1,
      wins: (profile.wins || 0) + (winner === i ? 1 : 0), losses: (profile.losses || 0) + (winner !== null && winner !== i ? 1 : 0),
      draws: (profile.draws || 0) + (winner === null ? 1 : 0), activeRoom: null, lastSeen: now });
  }
  room.rankSettled = true;
  room.rankResult = { players, winner, at: now };
  tx.set(db.doc(`rank_matches/${room.code}`), { code: room.code, players, winner, at: now, reason: String(room.state.finishReason || '').slice(0, 200) });
  tx.set(statsRef, { ...stats, matchesCompleted: (stats.matchesCompleted || 0) + 1, updatedAt: now });
}

module.exports = { handle, register, settle, dayKey };
