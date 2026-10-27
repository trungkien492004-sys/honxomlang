const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

const publicDir = path.resolve('dist');
const server = http.createServer((request, response) => {
  if (request.url === '/fixture') {
    response.setHeader('Content-Type', 'text/html');
    return response.end('<meta name="viewport" content="width=device-width,initial-scale=1"><div id="host"></div>');
  }
  const file = path.resolve(publicDir, '.' + new URL(request.url, 'http://local').pathname);
  if (!file.startsWith(publicDir + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return response.writeHead(404).end();
    response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    response.end(bytes);
  });
});

async function mountFixture(page, documents, { uid, name = 'Đấu sĩ Test', blockPlayerWrites = false } = {}) {
  await page.evaluateOnNewDocument(() => {
    const native = fetch;
    window.fetch = (url, ...args) => String(url).includes('runAggregationQuery') ? Promise.resolve({ ok: true, json: async () => [{ result: { aggregateFields: { total: { integerValue: '1' } } } }] }) : native(url, ...args);
  });
  await page.exposeFunction('readDb', async key => documents.get(key) || null);
  await page.exposeFunction('writeDb', async (key, data, merge) => {
    if (blockPlayerWrites && key.startsWith('duel_players/')) throw Error('permission-denied (mock rules)');
    documents.set(key, merge ? { ...documents.get(key), ...data } : data);
  });
  await page.exposeFunction('listDb', async key =>
    [...documents].filter(([k]) => k.startsWith(key + '/')).map(([k, data]) => ({ id: k.slice(key.length + 1), data }))
  );

  await page.goto(`http://127.0.0.1:${server.address().port}/fixture`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ uid, name, origin }) => {
    const subscriptions = [];
    window.__subscriptions = subscriptions;
    window.__notifySubs = async key => {
      for (const sub of subscriptions) {
        if (!sub.field) {
          if (key === sub.key) {
            const data = await readDb(key);
            sub.callback({ exists: !!data, data: () => data });
          }
          continue;
        }
        if (!key.startsWith(sub.key + '/')) continue;
        const rows = await listDb(sub.key);
        const docs = rows.filter(r => r.data && r.data[sub.field] === sub.value).map(r => ({ id: r.id, data: () => r.data }));
        sub.callback({ docs });
      }
    };
    class ServerTimestamp { toMillis() { return Date.now(); } }
    const resolve = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value instanceof ServerTimestamp ? Date.now() : value]));
    const snap = data => ({ exists: !!data, data: () => data });
    const doc = key => ({
      path: key,
      get: async () => snap(await readDb(key)),
      set: (data, options) => writeDb(key, resolve(data), !!options?.merge),
      update: data => writeDb(key, resolve(data), true),
      onSnapshot(callback) { const entry = { key, callback }; subscriptions.push(entry); readDb(key).then(data => callback(snap(data))); return () => subscriptions.splice(subscriptions.indexOf(entry), 1); }
    });
    const db = {
      doc,
      runTransaction: async action => action({ get: ref => ref.get(), update: (ref, data) => ref.update(data), set: (ref, data, options) => ref.set(data, options) }),
      collection: key => ({
        orderBy() { return this; },
        limit() { return this; },
        async get() {
          const rows = await listDb(key);
          const docs = rows.map(d => ({ id: d.id, data: () => d.data }));
          return { empty: !docs.length, docs, forEach: callback => docs.forEach(callback) };
        },
        where: (field, op, value) => ({ onSnapshot(callback) { const entry = { key, field, value, callback }; subscriptions.push(entry); return () => subscriptions.splice(subscriptions.indexOf(entry), 1); } })
      })
    };
    const user = uid ? { uid, displayName: name, metadata: { creationTime: new Date(Date.now() - 30 * 86400000).toISOString() }, getIdToken: async () => 'test-token' } : null;
    window._testAllowed = true;
    window._legacyAuthReady = true;
    window.siteIdentity = { user, ready: true, db, whenReady: Promise.resolve(), subscribe(callback) { callback({ user, ready: true }); return () => {}; } };
    if (user) window.currentFirebaseUser = user;
    window.myNetworkId = uid || '';
    window.player = { name };
    const firestore = () => db;
    firestore.FieldValue = { serverTimestamp: () => new ServerTimestamp() };
    window.firebase = { firestore };
    const frame = document.createElement('iframe');
    frame.id = 'memecardFrame';
    frame.src = origin + '/memecard.html';
    frame.style = 'position:fixed;inset:0;width:100%;height:100%;border:0';
    document.getElementById('host').appendChild(frame);
  }, { uid: uid || null, name, origin: `http://127.0.0.1:${server.address().port}` });

  await page.waitForFunction(() => document.querySelector('iframe')?.contentWindow.memeIdDuel, { timeout: 30000 });
  const frame = page.frames().find(f => f.parentFrame());

  await frame.evaluate(() => {
    window._testAllowed = true;
    memeMusic.setEnabled(false);
    memeFx.setMode('minimal');
    memeOpening.create = () => ({ face: 'heads', first: 'player', readyAt: Date.now() - 1 });
    memeAnime.setAuto(false);
    document.getElementById('rankPromoOverlay')?.remove();
  });
  return frame;
}

const waitForDoc = async (documents, key, predicate, tries = 30) => {
  for (let i = 0; i < tries; i++) {
    const doc = documents.get(key);
    if (doc && (!predicate || predicate(doc))) return doc;
    await new Promise(r => setTimeout(r, 100));
  }
  return documents.get(key);
};

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const checks = [];

  try {
    // ================= MAIN PAGE (signed-in player) =================
    const documents = new Map();
    const page = await browser.newPage();
    const frame = await mountFixture(page, documents, { uid: 'RankTester123', name: 'Đấu sĩ Test Lỗi' });

    // TEST 1: showRankError renders red banner with required details & saves error
    console.log('[TEST 1] Testing showRankError red banner UI and persistence');
    await frame.evaluate(() => {
      window.showRankError(new Error('Test lỗi Firestore: permission-denied khi ghi điểm Elo'), 'Ghi nhận kết quả');
    });
    await frame.waitForSelector('#rankErrorBanner', { timeout: 3000 });
    const bannerInfo = await frame.evaluate(() => {
      const b = document.getElementById('rankErrorBanner');
      const cs = window.getComputedStyle(b);
      const msg = b.querySelector('.rank-error-msg')?.textContent;
      const header = b.querySelector('.rank-error-header')?.textContent;
      const saved = localStorage.getItem('last_rank_error');
      return {
        exists: !!b,
        bgColor: cs.backgroundColor,
        msg,
        header,
        savedJson: saved ? JSON.parse(saved) : null
      };
    });
    assert.ok(bannerInfo.exists, 'Red error banner exists');
    assert.ok(bannerInfo.header.includes('LỖI ĐẤU RANK · Ghi nhận kết quả'), 'Banner header has correct title');
    assert.ok(bannerInfo.msg.includes('Test lỗi Firestore: permission-denied khi ghi điểm Elo'), 'Banner message matches');
    assert.ok(bannerInfo.savedJson && bannerInfo.savedJson.message.includes('permission-denied'), 'Error saved to localStorage');
    checks.push('TEST 1: Red error banner renders prominently with exact error details and persists to storage');

    // Close banner
    await frame.evaluate(() => document.getElementById('closeRankErrorBtn')?.click());
    const isClosed = await frame.evaluate(() => !document.getElementById('rankErrorBanner'));
    assert.ok(isClosed, 'Banner can be closed via close button');
    checks.push('TEST 1b: Red error banner close button functions properly');

    // TEST 2: Invalid deck triggers red error banner on rank find()
    console.log('[TEST 2] Testing invalid deck triggers red error banner on quick rank matchmaking');
    await frame.evaluate(async () => {
      deckList = [1, 2, 3]; // Only 3 cards, invalid!
      await window.siteRank.find();
    });
    await frame.waitForSelector('#rankErrorBanner', { timeout: 3000 });
    const invalidDeckMsg = await frame.evaluate(() => document.querySelector('.rank-error-msg')?.textContent);
    assert.ok(invalidDeckMsg.includes('Cần thêm 17 lá') || invalidDeckMsg.includes('chưa hợp lệ'), 'Error message states deck deficiency: ' + invalidDeckMsg);
    checks.push('TEST 2: Invalid deck aborts matchmaking immediately and displays clear red error banner');
    await frame.evaluate(() => document.getElementById('closeRankErrorBtn')?.click());

    // Restore valid deck
    await frame.evaluate(() => {
      deckList = defaultDeck();
      extraDeckList = defaultExtraDeck();
    });

    // TEST 3: Leaderboard modal surfaces "Xem lỗi gần nhất" button if an error occurred
    console.log('[TEST 3] Testing Leaderboard displays recent error recall button');
    await frame.evaluate(() => window.siteRank.show());
    await frame.waitForSelector('#rankOverlay', { timeout: 3000 });
    const hasErrorPill = await frame.evaluate(() => {
      const text = document.getElementById('rankProgress')?.textContent || '';
      return text.includes('Lỗi Rank gần nhất');
    });
    assert.ok(hasErrorPill, 'Leaderboard progress area shows recent rank error notice');
    checks.push('TEST 3: Leaderboard displays recent rank error for user inspection');
    await frame.evaluate(() => window.siteRank.close());

    // TEST 4: Match vs Kaiba awards proper Elo (Kaiba Elo 1550)
    console.log('[TEST 4] Testing Legend Bot Kaiba duel calculates Elo based on Kaiba 1550 Elo');
    await frame.evaluate(() => {
      startGame({ customBotDeck: 'Kaiba · Đỉnh Cao Mắt Xanh' });
    });
    const botOpponentInfo = await frame.evaluate(() => ({
      hasDuel: !!duel,
      rankChallengeId: duel.rankChallengeId,
      rankChallengeOpponentUid: duel.rankChallengeOpponentUid
    }));
    assert.ok(botOpponentInfo.rankChallengeId.startsWith('bot-'));
    assert.equal(botOpponentInfo.rankChallengeOpponentUid, 'bot-kaiba');

    // Player wins vs Kaiba
    await frame.evaluate(() => finish('player', 'Đánh bại Kaiba!'));
    const profile = await waitForDoc(documents, 'rank_profiles/RankTester123');
    assert.ok(profile, 'Profile saved after victory');
    assert.ok(profile.rating >= 1016, 'Elo increased substantially against 1550 Kaiba: ' + profile.rating);
    checks.push('TEST 4: Victory against Boss Kaiba (1550 Elo) properly calculated and recorded');

    // TEST 5: If Firestore fails during result save, red error banner displays and retry button appears
    console.log('[TEST 5] Testing error banner on result sync failure and retry mechanism');
    await frame.evaluate(() => {
      document.getElementById('modal').classList.add('hidden');
      startGame({ customBotDeck: 'Joey · Rồng Đen Bất Diệt' });
    });
    // Break runTransaction temporarily
    await frame.evaluate(() => {
      window.siteIdentity.db._originalRunTx = window.siteIdentity.db.runTransaction;
      window.siteIdentity.db.runTransaction = () => Promise.reject(new Error('Mạng chập chờn (Firestore Unavailable)'));
    });
    await frame.evaluate(() => finish('player', 'Thắng Joey nhưng mạng lỗi!'));
    await frame.waitForSelector('#rankErrorBanner', { timeout: 5000 });
    const resultSyncError = await frame.evaluate(() => document.querySelector('.rank-error-msg')?.textContent);
    assert.ok(resultSyncError.includes('Mạng chập chờn'), 'Error banner surfaced transaction error: ' + resultSyncError);

    // Verify victory modal displays retry button
    const retryBtnExists = await frame.evaluate(() => !!document.getElementById('retrySyncEloBtn'));
    assert.ok(retryBtnExists, 'Victory modal has retry button #retrySyncEloBtn');

    // Restore runTransaction and click retry
    await frame.evaluate(() => {
      window.siteIdentity.db.runTransaction = window.siteIdentity.db._originalRunTx;
      document.getElementById('closeRankErrorBtn')?.click();
      document.getElementById('retrySyncEloBtn')?.click();
    });
    await waitForDoc(documents, 'rank_profiles/RankTester123', p => p?.wins === 2);
    const finalProfile = documents.get('rank_profiles/RankTester123');
    assert.equal(finalProfile.wins, 2, 'Retry successfully saved second win');
    checks.push('TEST 5: Transaction failure surfaces red banner, provides retry button which successfully syncs on retry');

    // ================= TEST 6: GUEST win shows why no Elo was added + login-to-save button =================
    console.log('[TEST 6] Testing guest victory shows unauthenticated notice with login-to-save button');
    const guestDocs = new Map();
    const guestPage = await browser.newPage();
    const guestFrame = await mountFixture(guestPage, guestDocs, { uid: null, name: 'Khách Test' });
    await guestFrame.evaluate(() => {
      startGame({ customBotDeck: 'Kaiba · Đỉnh Cao Mắt Xanh' });
    });
    await guestFrame.evaluate(() => finish('player', 'Đánh bại Kaiba!'));
    await guestFrame.waitForFunction(() => document.getElementById('postMatchLoginBtn'), { timeout: 5000 });
    const guestResult = await guestFrame.evaluate(() => ({
      unauthenticated: !!duel?.rankChallengeResult?.unauthenticated,
      note: document.querySelector('#modalContent .rank-challenge-result')?.textContent || '',
      hasLoginBtn: !!document.getElementById('postMatchLoginBtn')
    }));
    assert.ok(guestResult.unauthenticated, 'Guest match receipt flagged as unauthenticated');
    assert.ok(guestResult.note.includes('chưa đăng nhập Google'), 'Result modal explains why no Elo was added: ' + guestResult.note);
    assert.ok(guestResult.hasLoginBtn, 'Result modal offers login-to-save button');
    assert.ok(![...guestDocs.keys()].some(k => k.startsWith('rank_profiles/')), 'No rank profile written for guest');
    checks.push('TEST 6: Guest victory displays unauthenticated notice + login-to-save button and writes no profile');
    await guestPage.close();

    // ================= TEST 7: receiver with FAILING publish still displays incoming invite =================
    console.log('[TEST 7] Testing invite box displays even when receiver publish is permission-denied');
    const inviteDocs = new Map();
    const receiverPage = await browser.newPage();
    const receiverFrame = await mountFixture(receiverPage, inviteDocs, { uid: 'ReceiverBBB', name: 'Người Nhận', blockPlayerWrites: true });
    const subCount = await receiverPage.evaluate(() => window.__subscriptions.filter(s => s.field === 'to' && s.key === 'duel_invites').length);
    assert.ok(subCount >= 1, 'Invite listener installed despite failing publish');
    assert.ok(!inviteDocs.has('duel_players/ReceiverBBB'), 'Receiver publish is indeed blocked (no duel_players doc)');
    const version = await receiverFrame.evaluate(() => MEME_RULES_VERSION);
    inviteDocs.set('duel_players/InviterAAA', { uid: 'InviterAAA', name: 'Người Mời', main: [], extra: [], heroId: 0, networkId: 'InviterAAA', online: true, busy: false, protocol: version, lastSeen: Date.now() });
    inviteDocs.set('duel_invites/InviterAAA_ReceiverBBB', { from: 'InviterAAA', to: 'ReceiverBBB', nonce: 'nonce-1', roomId: 'ID-1234567890ABCDEF', status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + 60000 });
    await receiverPage.evaluate(() => window.__notifySubs('duel_invites/InviterAAA_ReceiverBBB'));
    await receiverFrame.waitForSelector('#directDuelInvite', { timeout: 5000 });
    const box = await receiverFrame.evaluate(() => {
      const b = document.getElementById('directDuelInvite');
      return { text: b?.textContent || '', hasAccept: !!document.getElementById('idAcceptInvite'), hasDecline: !!document.getElementById('idDeclineInvite') };
    });
    assert.ok(box.text.includes('Người Mời') && box.text.includes('muốn đấu với bạn'), 'Invite box shows sender name: ' + box.text);
    assert.ok(box.hasAccept && box.hasDecline, 'Invite box has accept/decline buttons');
    checks.push('TEST 7: Invitation displays on receiver side even when their own publish fails');
    await receiverPage.close();

    // ================= TEST 8: healthy receiver accepts invite; box clears and status flips =================
    console.log('[TEST 8] Testing invite accept clears the box and marks the invite accepted');
    const acceptDocs = new Map();
    const acceptPage = await browser.newPage();
    const acceptFrame = await mountFixture(acceptPage, acceptDocs, { uid: 'ReceiverCCC', name: 'Người Nhận 2' });
    const version2 = await acceptFrame.evaluate(() => MEME_RULES_VERSION);
    acceptDocs.set('duel_players/InviterDDD', { uid: 'InviterDDD', name: 'Người Mời 2', main: [], extra: [], heroId: 0, networkId: 'InviterDDD', online: true, busy: false, protocol: version2, lastSeen: Date.now() });
    acceptDocs.set('duel_invites/InviterDDD_ReceiverCCC', { from: 'InviterDDD', to: 'ReceiverCCC', nonce: 'nonce-2', roomId: 'ID-ABCDEF1234567890', status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + 60000 });
    await acceptPage.evaluate(() => window.__notifySubs('duel_invites/InviterDDD_ReceiverCCC'));
    await acceptFrame.waitForSelector('#directDuelInvite', { timeout: 5000 });
    await acceptFrame.evaluate(() => document.getElementById('idAcceptInvite')?.click());
    await acceptFrame.waitForFunction(() => !document.getElementById('directDuelInvite'), { timeout: 5000 });
    assert.equal(acceptDocs.get('duel_invites/InviterDDD_ReceiverCCC')?.status, 'accepted', 'Accept updates invite status to accepted');
    assert.ok(acceptDocs.has('duel_players/ReceiverCCC'), 'Receiver publish succeeded when accepting');
    checks.push('TEST 8: Accepting the invite clears the box and marks the invite accepted');
    await acceptPage.close();

    // ================= TEST 9: pre-finish record attempts must not swallow the finished-match save =================
    console.log('[TEST 9] Testing online duel win records Elo even after pre-finish recordResult attempts');
    await frame.evaluate(() => startGame({ customBotDeck: 'Joey · Rồng Đen Bất Diệt' }));
    await frame.evaluate(() => {
      duel.rankChallengeId = 'online-' + crypto.randomUUID().replaceAll('-', '').slice(0, 24);
      duel.rankChallengeOpponentUid = 'bot-joey';
    });
    const earlyAttempt = await frame.evaluate(() => memeIdDuel.recordResult(duel));
    assert.equal(earlyAttempt, null, 'recordResult before finish returns null without caching a stale promise');
    await frame.evaluate(() => finish('player', 'Thắng online!'));
    for (let i = 0; i < 40 && documents.get('rank_profiles/RankTester123')?.wins !== 3; i++) await new Promise(r => setTimeout(r, 50));
    assert.equal(documents.get('rank_profiles/RankTester123')?.wins, 3, 'Finished online match records the win despite the earlier unfinished attempt');
    checks.push('TEST 9: Pre-finish recordResult attempts no longer swallow the finished-match Elo save');

    console.log('All Rank error handling & fix tests passed:', checks.length, 'checks verified.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {
  console.error('Test failed:', error);
  server.close();
  process.exitCode = 1;
});
