const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

const publicDir = path.resolve('dist');
const documents = new Map();
const channelMessages = [];
const channelListeners = new Set();

const mockChannel = {
  postMessage(msg) {
    channelMessages.push(msg);
    channelListeners.forEach(listener => listener({ data: msg }));
  },
  addEventListener(event, listener) {
    if (event === 'message') channelListeners.add(listener);
  },
  removeEventListener(event, listener) {
    if (event === 'message') channelListeners.delete(listener);
  }
};

const server = http.createServer((request, response) => {
  if (request.url.startsWith('/fixture')) {
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

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`[TEST] HTTP Server listening on http://127.0.0.1:${port}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });

  try {
    // Pre-populate rank profile for Player 1 and Player 2
    documents.set('rank_profiles/player-1', {
      uid: 'player-1',
      name: 'Kien Trung 1',
      rating: 1200,
      played: 5,
      wins: 3,
      losses: 2,
      draws: 0,
      lastSeen: Date.now()
    });
    documents.set('rank_profiles/player-2', {
      uid: 'player-2',
      name: 'Kien Trung 2',
      rating: 1200,
      played: 4,
      wins: 2,
      losses: 2,
      draws: 0,
      lastSeen: Date.now()
    });

    console.log('[STEP 1] Launching Page A (Player 1) and Page B (Player 2)...');
    const contextA = await browser.createBrowserContext();
    const contextB = await browser.createBrowserContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const setupClient = async (page, userObj, label) => {
      page.on('console', msg => console.log(`[${label} CONSOLE]`, msg.text()));
      page.on('pageerror', err => console.log(`[${label} ERROR]`, err.message));

      await page.evaluateOnNewDocument(() => {
        const native = fetch;
        window.fetch = (url, ...args) => String(url).includes('runAggregationQuery') ? Promise.resolve({ ok: true, json: async () => [{ result: { aggregateFields: { total: { integerValue: '1' } } } }] }) : native(url, ...args);
      });

      await page.exposeFunction('readDb', async key => documents.get(key) || null);
      await page.exposeFunction('writeDb', async (key, data, merge) => {
        documents.set(key, merge ? { ...documents.get(key), ...data } : data);
      });
      await page.exposeFunction('listDb', async key =>
        [...documents].filter(([k]) => k.startsWith(key + '/')).map(([k, data]) => ({ id: k.slice(key.length + 1), data }))
      );
      await page.exposeFunction('broadcastChannelPost', async msg => {
        mockChannel.postMessage(msg);
      });

      await page.goto(`http://127.0.0.1:${port}/fixture`, { waitUntil: 'domcontentloaded' });

      await page.evaluate(({ user, origin }) => {
        class ServerTimestamp { toMillis() { return Date.now(); } }
        const resolve = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value instanceof ServerTimestamp ? Date.now() : value]));
        const snap = data => ({ exists: !!data, data: () => data });
        const doc = key => ({
          path: key,
          get: async () => snap(await readDb(key)),
          set: (data, options) => writeDb(key, resolve(data), !!options?.merge),
          update: data => writeDb(key, resolve(data), true),
          onSnapshot(callback) {
            let last = '';
            const timer = setInterval(async () => {
              const d = await readDb(key);
              const str = JSON.stringify(d);
              if (str !== last) { last = str; callback(snap(d)); }
            }, 100);
            return () => clearInterval(timer);
          }
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
            where: (field, op, value) => ({
              orderBy() { return this; },
              limit() { return this; },
              async get() {
                const rows = (await listDb(key)).filter(d => d.data && d.data[field] === value);
                const docs = rows.map(d => ({ id: d.id, data: () => d.data }));
                return { empty: !docs.length, docs, forEach: callback => docs.forEach(callback) };
              },
              onSnapshot(callback) {
                let last = '';
                const timer = setInterval(async () => {
                  const rows = (await listDb(key)).filter(d => d.data && d.data[field] === value);
                  const str = JSON.stringify(rows);
                  if (str !== last) {
                    last = str;
                    const docs = rows.map(d => ({ id: d.id, data: () => d.data }));
                    callback({ empty: !docs.length, docs, forEach: cb => docs.forEach(cb) });
                  }
                }, 100);
                return () => clearInterval(timer);
              }
            })
          })
        };

        window._testAllowed = true;
        window._legacyAuthReady = true;
        window.currentFirebaseUser = user;
        window.myNetworkId = user.uid;
        window.player = { name: user.displayName };
        window.siteIdentity = {
          user,
          ready: true,
          db,
          whenReady: Promise.resolve(),
          subscribe(cb) { cb({ user, ready: true }); return () => {}; }
        };
        const firestore = () => db;
        firestore.FieldValue = { serverTimestamp: () => new ServerTimestamp() };
        firestore.Timestamp = { fromMillis: ms => ({ toMillis: () => ms, toDate: () => new Date(ms) }) };
        window.firebase = { firestore };

        window.pvpChannel = {
          postMessage: msg => window.broadcastChannelPost(msg)
        };

        const frame = document.createElement('iframe');
        frame.id = 'memecardFrame';
        frame.src = origin + '/memecard.html';
        frame.style = 'position:fixed;inset:0;width:100%;height:100%;border:0';
        document.getElementById('host').appendChild(frame);
      }, { user: userObj, origin: `http://127.0.0.1:${port}` });
    };

    await setupClient(pageA, { uid: 'player-1', displayName: 'Kien Trung 1', metadata: { creationTime: new Date(Date.now() - 30 * 86400000).toISOString() } }, 'PAGE A');
    await setupClient(pageB, { uid: 'player-2', displayName: 'Kien Trung 2', metadata: { creationTime: new Date(Date.now() - 30 * 86400000).toISOString() } }, 'PAGE B');

    console.log('[STEP 2] Waiting for iframes to load memeIdDuel on both pages...');
    await pageA.waitForFunction(() => document.querySelector('iframe')?.contentWindow?.memeIdDuel, { timeout: 30000 });
    await pageB.waitForFunction(() => document.querySelector('iframe')?.contentWindow?.memeIdDuel, { timeout: 30000 });
    console.log('✓ Both iframes loaded memeIdDuel successfully!');

    const frameA = pageA.frames().find(f => f.parentFrame());
    const frameB = pageB.frames().find(f => f.parentFrame());

    // Disable music and FX for testing
    for (const f of [frameA, frameB]) {
      await f.evaluate(() => {
        window._testAllowed = true;
        if (window.memeMusic) memeMusic.setEnabled(false);
        if (window.memeFx) memeFx.setMode('minimal');
        if (window.memeOpening) memeOpening.create = () => ({ face: 'heads', first: 'player', readyAt: Date.now() - 1 });
        if (window.memeAnime) memeAnime.setAuto(false);
        document.getElementById('rankPromoOverlay')?.remove();
      });
    }

    console.log('[STEP 3] Verifying player publishing in duel_players & duel_directory...');
    await frameA.evaluate(() => window.memeIdDuel.publish(true));
    await frameB.evaluate(() => window.memeIdDuel.publish(true));

    await new Promise(r => setTimeout(r, 600));

    const p1Doc = documents.get('duel_players/player-1');
    const p2Doc = documents.get('duel_players/player-2');
    assert.ok(p1Doc, 'Player 1 duel_players doc must exist');
    assert.ok(p2Doc, 'Player 2 duel_players doc must exist');
    console.log('✓ Player 1 & Player 2 profiles published successfully');

    // TEST: Player 1 challenges Player 2
    console.log('[STEP 4] Player 1 challenges Player 2 (calling memeIdDuel.invite)...');
    const challengeResult = await frameA.evaluate(async () => {
      try {
        const p2 = await window.memeIdDuel.lookup('player-2');
        await window.memeIdDuel.invite(p2, { silent: false });
        return { success: true, pending: window.memeIdDuel.hasPendingInvite };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    console.log('Challenge result from Player 1:', challengeResult);
    assert.equal(challengeResult.success, true, 'Player 1 invite() should succeed without error');

    // Verify duel_invites document was created
    const inviteKey = 'duel_invites/player-1_player-2';
    const inviteDoc = documents.get(inviteKey);
    assert.ok(inviteDoc, 'duel_invites/player-1_player-2 must exist in Firestore');
    assert.equal(inviteDoc.status, 'pending', 'Invite status must be pending');
    assert.equal(inviteDoc.from, 'player-1');
    assert.equal(inviteDoc.to, 'player-2');
    console.log('✓ duel_invites/player-1_player-2 created successfully with status "pending"');

    // Wait for Player 2 to receive the incoming invite popup
    console.log('[STEP 5] Checking if Player 2 receives incoming invite dialog (#directDuelInvite)...');
    await frameB.waitForSelector('#directDuelInvite', { timeout: 10000 });
    const inviteDialogText = await frameB.$eval('#directDuelInvite', el => el.textContent);
    console.log('Player 2 dialog text:', inviteDialogText);
    assert.ok(inviteDialogText.includes('Kien Trung 1'), 'Dialog must show challenger name Kien Trung 1');
    console.log('✓ Player 2 received incoming challenge notification modal');

    // TEST: Player 2 accepts the invite
    console.log('[STEP 6] Player 2 clicks "Nhận lời" (#idAcceptInvite)...');
    await frameB.$eval('#idAcceptInvite', btn => btn.click());
    await new Promise(r => setTimeout(r, 600));

    const acceptedDoc = documents.get(inviteKey);
    console.log('Invite document after accept:', acceptedDoc?.status);
    assert.equal(acceptedDoc.status, 'accepted', 'Invite status should be updated to "accepted"');
    console.log('✓ Invite accepted in Firestore');

    // TEST: Match concludes & Elo recorded
    console.log('[STEP 7] Simulating match finish and Elo recording for Player 1 (Winner)...');
    const receiptA = await frameA.evaluate(async () => {
      const match = {
        finished: true,
        winner: 'player',
        finishReason: 'Chiến thắng bởi hạ gục đối thủ!',
        enemy: { heroId: 0 }
      };
      const receipt = await window.memeIdDuel.recordResult(match, 'test-match-123', 'player-2');
      return receipt;
    });

    console.log('Player 1 Elo Receipt:', receiptA);
    assert.ok(receiptA, 'recordResult must return receipt');
    assert.equal(receiptA.outcome, 'win');
    assert.equal(receiptA.ratingBefore, 1200);
    assert.equal(receiptA.delta, 16, 'Base Elo delta between two 1200 players is 16');
    assert.equal(receiptA.ratingAfter, 1216, 'Rating after win should be 1216');
    assert.equal(receiptA.wins, 4, 'Wins should increment to 4');

    // Check Player 1 rank profile in database
    const updatedProfileA = documents.get('rank_profiles/player-1');
    console.log('Updated Player 1 Rank Profile in DB:', updatedProfileA);
    assert.equal(updatedProfileA.rating, 1216);
    assert.equal(updatedProfileA.wins, 4);
    assert.equal(updatedProfileA.played, 6);
    console.log('✓ Player 1 profile updated with +16 Elo in database');

    // Simulate Player 2 recording loss
    console.log('[STEP 8] Simulating match finish and Elo recording for Player 2 (Loser)...');
    const receiptB = await frameB.evaluate(async () => {
      const match = {
        finished: true,
        winner: 'enemy',
        finishReason: 'Thất bại!',
        enemy: { heroId: 0 }
      };
      const receipt = await window.memeIdDuel.recordResult(match, 'test-match-123', 'player-1');
      return receipt;
    });

    console.log('Player 2 Elo Receipt:', receiptB);
    assert.ok(receiptB, 'recordResult must return receipt');
    assert.equal(receiptB.outcome, 'loss');
    assert.equal(receiptB.ratingBefore, 1200);
    assert.ok(receiptB.delta <= -15 && receiptB.delta >= -16, 'Elo loss is around -15 or -16');
    assert.equal(receiptB.ratingAfter, 1200 + receiptB.delta);
    assert.equal(receiptB.losses, 3, 'Losses should increment to 3');

    const updatedProfileB = documents.get('rank_profiles/player-2');
    console.log('Updated Player 2 Rank Profile in DB:', updatedProfileB);
    assert.equal(updatedProfileB.rating, 1200 + receiptB.delta);
    assert.equal(updatedProfileB.losses, 3);
    assert.equal(updatedProfileB.played, 5);
    console.log('✓ Player 2 profile updated with Elo loss in database');

    console.log('\n=========================================');
    console.log('🎉 ALL TWO-CLIENT CHALLENGE & ELO TESTS PASSED!');
    console.log('=========================================\n');

  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
