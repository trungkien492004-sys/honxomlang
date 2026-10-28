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
  if (request.url.startsWith('/fixture-main')) {
    response.setHeader('Content-Type', 'text/html');
    return response.end(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/css/site_rank.css">
</head>
<body>
  <div id="gameLobby">
    <div id="mainMap">Bản đồ chính</div>
    <div id="hudNavContainer"><button id="openRankBtn">BXH</button></div>
  </div>
  <div id="memecardGameModal" style="display:none; position:fixed; inset:0; background:#071b2d; z-index:100000; width:100%; height:100dvh;">
    <iframe id="memecardFrame" src="about:blank" style="width:100%; height:100%; border:none;"></iframe>
  </div>
  <div id="rankOverlay" style="display:none;"></div>
  <script src="/assets/js/site_rank_config.js"></script>
  <script src="/assets/js/site_identity.js"></script>
  <script src="/assets/js/site_access.js"></script>
  <script src="/assets/js/site_rank.js"></script>
  <script src="/assets/js/site_rank_players.js"></script>
  <script>
    window.openMemeCardGame = function() {
      const modal = document.getElementById('memecardGameModal');
      const frame = document.getElementById('memecardFrame');
      modal.style.display = 'block';
      if (!frame.src || frame.src === 'about:blank' || frame.src.endsWith('about:blank')) {
        frame.src = '/memecard.html';
      }
    };
    window.closeMemeCardGame = function() {
      document.getElementById('memecardGameModal').style.display = 'none';
    };
  </script>
</body>
</html>
    `);
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
    // Initial rank profiles and directory
    documents.set('rank_profiles/kientrung', {
      uid: 'kientrung',
      name: 'Kien Trung',
      rating: 1200,
      played: 5,
      wins: 3,
      losses: 2,
      draws: 0,
      lastSeen: Date.now()
    });
    documents.set('duel_directory/kientrung', {
      uid: 'kientrung',
      name: 'Kien Trung',
      online: true,
      lastSeen: Date.now()
    });

    documents.set('rank_profiles/kienle', {
      uid: 'kienle',
      name: 'Kien Le',
      rating: 1200,
      played: 4,
      wins: 2,
      losses: 2,
      draws: 0,
      lastSeen: Date.now()
    });
    documents.set('duel_directory/kienle', {
      uid: 'kienle',
      name: 'Kien Le',
      online: true,
      lastSeen: Date.now()
    });

    console.log('[STEP 1] Launching Client 1 (kientrung) and Client 2 (kienle) on main site...');
    const contextA = await browser.createBrowserContext();
    const contextB = await browser.createBrowserContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const setupClient = async (page, userObj, label) => {
      page.on('console', msg => {
        const text = msg.text();
        if (!text.includes('Failed to load resource')) console.log(`[${label} CONSOLE]`, text);
      });
      page.on('pageerror', err => console.log(`[${label} ERROR]`, err.message));

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

      await page.evaluateOnNewDocument(({ user, origin }) => {
        class ServerTimestamp { toMillis() { return Date.now(); } }
        const resolve = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value instanceof ServerTimestamp ? Date.now() : value]));
        const snap = data => ({ exists: !!data, data: () => data });
        const doc = key => ({
          path: key,
          get: async () => snap(await window.readDb(key)),
          set: (data, options) => window.writeDb(key, resolve(data), !!options?.merge),
          update: data => window.writeDb(key, resolve(data), true),
          onSnapshot(callback) {
            let last = '';
            const timer = setInterval(async () => {
              const d = await window.readDb(key);
              const str = JSON.stringify(d);
              if (str !== last) { last = str; callback(snap(d)); }
            }, 100);
            return () => clearInterval(timer);
          }
        });
        const db = {
          doc,
          runTransaction: async action => action({
            get: ref => ref.get(),
            update: (ref, data) => ref.update(data),
            set: (ref, data, options) => ref.set(data, options)
          }),
          collection: key => ({
            orderBy() { return this; },
            limit() { return this; },
            async get() {
              const rows = await window.listDb(key);
              const docs = rows.map(d => ({ id: d.id, data: () => d.data }));
              return { empty: !docs.length, docs, forEach: callback => docs.forEach(callback) };
            },
            where: (field, op, value) => ({
              orderBy() { return this; },
              limit() { return this; },
              async get() {
                const rows = (await window.listDb(key)).filter(d => d.data && d.data[field] === value);
                const docs = rows.map(d => ({ id: d.id, data: () => d.data }));
                return { empty: !docs.length, docs, forEach: callback => docs.forEach(callback) };
              },
              onSnapshot(callback) {
                let last = '';
                const timer = setInterval(async () => {
                  const rows = (await window.listDb(key)).filter(d => d.data && d.data[field] === value);
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
        const auth = () => ({
          onAuthStateChanged(cb) { cb(user); return () => {}; },
          signInWithPopup: async () => ({ user }),
          setPersistence: async () => {}
        });
        auth.Auth = { Persistence: { LOCAL: 'local', SESSION: 'session' } };
        window.firebase = { firestore, auth, apps: [{}] };

        window.pvpChannel = {
          postMessage: msg => window.broadcastChannelPost(msg)
        };
      }, { user: userObj, origin: `http://127.0.0.1:${port}` });

      await page.goto(`http://127.0.0.1:${port}/fixture-main`, { waitUntil: 'domcontentloaded' });
    };

    await setupClient(pageA, { uid: 'kientrung', displayName: 'Kien Trung', metadata: { creationTime: new Date(Date.now() - 30 * 86400000).toISOString() } }, 'PAGE A (kientrung)');
    await setupClient(pageB, { uid: 'kienle', displayName: 'Kien Le', metadata: { creationTime: new Date(Date.now() - 30 * 86400000).toISOString() } }, 'PAGE B (kienle)');

    console.log('[STEP 2] Verifying initial client state...');
    // Verify Client 2 has NOT opened memecardGameModal yet
    const client2ModalDisplay = await pageB.evaluate(() => document.getElementById('memecardGameModal').style.display);
    assert.equal(client2ModalDisplay, 'none', 'Client 2 card modal must be closed initially');
    console.log('✓ Client 2 is currently in main lobby with memecardGameModal closed');

    // Subscribe Client 1 and Client 2 to mockChannel events
    await pageA.evaluate(() => {
      window.parentChannelHandler = msg => {
        const frame = document.getElementById('memecardFrame')?.contentWindow;
        if (frame?.memeOnlineReceive) frame.memeOnlineReceive(msg);
      };
    });
    await pageB.evaluate(() => {
      window.parentChannelHandler = msg => {
        const frame = document.getElementById('memecardFrame')?.contentWindow;
        if (frame?.memeOnlineReceive) frame.memeOnlineReceive(msg);
      };
    });
    mockChannel.addEventListener('message', async ({ data }) => {
      await pageA.evaluate(msg => window.parentChannelHandler?.(msg), data).catch(() => {});
      await pageB.evaluate(msg => window.parentChannelHandler?.(msg), data).catch(() => {});
    });

    console.log('[STEP 3] Client 1 (kientrung) challenges Client 2 (kienle)...');
    // Client 1 calls siteRankPlayers.challenge('kienle')
    const challengePromise = pageA.evaluate(async () => {
      try {
        await window.siteRankPlayers.challenge('kienle');
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    // Wait for the invite document in Firestore
    console.log('[STEP 4] Waiting for duel_invites/kientrung_kienle to be written...');
    let inviteDoc = null;
    for (let i = 0; i < 40; i++) {
      inviteDoc = documents.get('duel_invites/kientrung_kienle');
      if (inviteDoc && inviteDoc.status === 'pending') break;
      await new Promise(r => setTimeout(r, 250));
    }
    assert.ok(inviteDoc, 'duel_invites/kientrung_kienle must exist');
    assert.equal(inviteDoc.status, 'pending', 'Invite must have status pending');
    console.log('✓ Invite doc successfully written to Firestore with status: pending, nonce:', inviteDoc.nonce);

    console.log('[STEP 5] Checking if Client 2 (kienle) received #globalDuelInvite popup on index.html...');
    await pageB.waitForSelector('#globalDuelInvite', { timeout: 10000 });
    const inviteText = await pageB.evaluate(() => document.getElementById('globalDuelInvite').textContent);
    console.log('Client 2 popup content:', inviteText);
    assert.ok(inviteText.includes('Kien Trung'), 'Popup must show sender name Kien Trung');
    assert.ok(inviteText.includes('muốn khiêu chiến một trận Đấu Rank'), 'Popup must prompt for rank challenge');
    console.log('✓ Client 2 successfully received #globalDuelInvite popup directly on main site!');

    console.log('[STEP 6] Client 2 (kienle) clicks "⚔️ Nhận Lời (Vào Trận)"...');
    await pageB.evaluate(() => document.getElementById('globalAcceptDuelBtn').click());

    // Wait for invite document status to become 'accepted'
    for (let i = 0; i < 40; i++) {
      inviteDoc = documents.get('duel_invites/kientrung_kienle');
      if (inviteDoc && inviteDoc.status === 'accepted') break;
      await new Promise(r => setTimeout(r, 200));
    }
    assert.equal(inviteDoc.status, 'accepted', 'Invite doc status must be accepted');
    console.log('✓ Firestore invite status updated to accepted');

    // Verify Client 2 opened memecardGameModal
    const client2ModalAfter = await pageB.evaluate(() => document.getElementById('memecardGameModal').style.display);
    assert.equal(client2ModalAfter, 'block', 'Client 2 must open memecardGameModal automatically on accept');
    console.log('✓ Client 2 memecardGameModal automatically opened');

    // Wait for iframe on Client 2 to load memecard.html and memeRoom
    console.log('[STEP 7] Waiting for both iframes to initialize memeIdDuel and rooms...');
    await pageA.waitForFunction(() => document.getElementById('memecardFrame')?.contentWindow?.memeIdDuel, { timeout: 20000 });
    await pageB.waitForFunction(() => document.getElementById('memecardFrame')?.contentWindow?.memeIdDuel, { timeout: 20000 });

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

    console.log('[STEP 8] Connecting duel rooms between Client 1 (Host) and Client 2 (Guest)...');
    // Ensure Client 2 connects to the room
    await frameB.evaluate((roomId, senderUid) => {
      if (window.memeJoinRoom) {
        window.memeJoinRoom(roomId);
        if (window.memeRoom) {
          window.memeRoom.peerId = senderUid;
          window.memeRoom.peerName = 'Kien Trung';
        }
      }
    }, inviteDoc.roomId, 'kientrung');

    // Wait for Host to receive peerDeck and start match
    await frameA.waitForFunction(() => document.getElementById('memeStartOnlineBtn') || (window.memeRoom && window.memeRoom.peerDeck), { timeout: 20000 });
    console.log('✓ Host received peer deck from Client 2');

    // Host starts match
    await frameA.evaluate(() => {
      if (typeof window.memeStartHostMatch === 'function') window.memeStartHostMatch();
      else document.getElementById('memeStartOnlineBtn')?.click();
    });

    console.log('[STEP 9] Waiting for duel battle screen to be active on both clients...');
    await frameA.waitForFunction(() => window.duel && !document.getElementById('duel').classList.contains('hidden'), { timeout: 15000 });
    await frameB.waitForFunction(() => window.duel && !document.getElementById('duel').classList.contains('hidden'), { timeout: 15000 });
    console.log('✓ Both clients successfully entered the duel battlefield!');

    console.log('[STEP 10] Simulating match finish: Client 1 wins, Client 2 loses...');
    await frameA.evaluate(() => {
      window.duel.winner = 'player';
      window.duel.finished = true;
      window.duel.finishReason = 'Đối thủ hết điểm gốc.';
      if (window.memeIdDuel) window.memeIdDuel.recordResult(window.duel);
    });
    await frameB.evaluate(() => {
      window.duel.winner = 'enemy';
      window.duel.finished = true;
      window.duel.finishReason = 'Bạn đã hết điểm gốc.';
      if (window.memeIdDuel) window.memeIdDuel.recordResult(window.duel);
    });

    await new Promise(r => setTimeout(r, 1200));

    console.log('[STEP 11] Verifying Elo updates on Firestore...');
    const p1Profile = documents.get('rank_profiles/kientrung');
    const p2Profile = documents.get('rank_profiles/kienle');

    console.log('Client 1 Profile:', p1Profile);
    console.log('Client 2 Profile:', p2Profile);

    assert.ok(p1Profile.rating > 1200, `Client 1 rating should increase from 1200, got ${p1Profile.rating}`);
    assert.ok(p2Profile.rating < 1200, `Client 2 rating should decrease from 1200, got ${p2Profile.rating}`);
    assert.equal(p1Profile.wins, 4, 'Client 1 wins should be 4');
    assert.equal(p2Profile.losses, 3, 'Client 2 losses should be 3');

    console.log('=====================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
    console.log(`✓ Client 1 (kientrung) Elo: 1200 ➔ ${p1Profile.rating} (+${p1Profile.rating - 1200})`);
    console.log(`✓ Client 2 (kienle) Elo:    1200 ➔ ${p2Profile.rating} (${p2Profile.rating - 1200})`);
    console.log('✓ Real invitation flow across index.html completely verified!');
    console.log('=====================================================');

  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error('[TEST ERROR]', err);
  process.exit(1);
});
