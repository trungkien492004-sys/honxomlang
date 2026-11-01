// Incoming rank challenges must reach the invited player in every game state.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

const publicDir = path.resolve('dist');
const documents = new Map();

const server = http.createServer((request, response) => {
  if (request.url.startsWith('/fixture')) {
    response.setHeader('Content-Type', 'text/html');
    return response.end('<meta name="viewport" content="width=device-width,initial-scale=1"><div id="host"></div>');
  }
  const file = path.resolve(publicDir, '.' + new URL(request.url, 'http://local').pathname);
  if (!file.startsWith(publicDir + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return response.writeHead(404).end();
    const ext = path.extname(file);
    response.setHeader('Content-Type', ext === '.html' ? 'text/html' : ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream');
    response.end(bytes);
  });
});

documents.set('duel_players/SenderID', {
  uid: 'SenderID', name: 'Kien Sender', main: Array.from({ length: 20 }, (_, i) => 'hot_via_' + i),
  extra: [], heroId: 0, networkId: 'P_sender', online: true, busy: false, protocol: 'tcg-equip-chain-v20-rematch',
  lastSeen: Date.now()
});
documents.set('rank_profiles/SenderID', { uid: 'SenderID', name: 'Kien Sender', rating: 1200, played: 3, wins: 2, losses: 1, draws: 0 });

const invite = (n, extra = {}) => ({
  from: 'SenderID', to: 'RecipID', nonce: 'nonce-' + n, roomId: 'ID-ROOM-' + n, status: 'pending',
  createdAt: Date.now(), expiresAt: Date.now() + 60000, ...extra
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const pageErrors = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.evaluateOnNewDocument(() => {
      const native = fetch;
      window.fetch = (url, ...args) => String(url).includes('runAggregationQuery')
        ? Promise.resolve({ ok: true, json: async () => [{ result: { aggregateFields: { total: { integerValue: '1' } } } }] })
        : native(url, ...args);
    });
    await page.exposeFunction('readDb', async key => documents.get(key) || null);
    await page.exposeFunction('writeDb', async (key, data, merge) => { documents.set(key, merge ? { ...documents.get(key), ...data } : data); });
    await page.exposeFunction('listDb', async key => [...documents].filter(([k]) => k.startsWith(key + '/')).map(([k, data]) => ({ id: k.slice(key.length + 1), data })));

    const user = { uid: 'RecipID', displayName: 'Bob Player', metadata: { creationTime: new Date(Date.now() - 40 * 86400000).toISOString() } };
    documents.set('rank_profiles/RecipID', { uid: 'RecipID', name: 'Bob Player', rating: 1200, played: 2, wins: 1, losses: 1, draws: 0 });
    await page.goto(`http://127.0.0.1:${port}/fixture`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(({ user, origin }) => {
      class ServerTimestamp { toMillis() { return Date.now(); } }
      const resolve = data => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v instanceof ServerTimestamp ? Date.now() : v]));
      const snap = data => ({ exists: !!data, data: () => data });
      const doc = key => ({
        path: key,
        get: async () => snap(await readDb(key)),
        set: (data, options) => writeDb(key, resolve(data), !!options?.merge),
        update: data => writeDb(key, resolve(data), true),
        onSnapshot(callback) {
          let last = '';
          const timer = setInterval(async () => { const d = await readDb(key); const str = JSON.stringify(d); if (str !== last) { last = str; callback(snap(d)); } }, 100);
          return () => clearInterval(timer);
        }
      });
      const query = (key, field, value) => ({
        orderBy() { return this; }, limit() { return this; },
        async get() { const rows = (await listDb(key)).filter(d => d.data && d.data[field] === value); return { empty: !rows.length, docs: rows.map(d => ({ id: d.id, data: () => d.data })), forEach(cb) { cb && this.docs.forEach(d => cb(d)); } }; },
        onSnapshot(callback) {
          let last = '';
          const timer = setInterval(async () => {
            const rows = (await listDb(key)).filter(d => d.data && d.data[field] === value);
            const str = JSON.stringify(rows);
            if (str === last) return;
            last = str;
            callback({ empty: !rows.length, docs: rows.map(d => ({ id: d.id, data: () => d.data })), forEach(cb) { cb && rows.forEach(r => cb({ id: r.id, data: () => r.data })); } });
          }, 100);
          return () => clearInterval(timer);
        }
      });
      const db = {
        doc,
        runTransaction: async action => action({ get: ref => ref.get(), update: (ref, data) => ref.update(data), set: (ref, data, options) => ref.set(data, options) }),
        collection: key => ({ orderBy: () => ({ limit: () => ({ get: async () => ({ empty: true, docs: [] }) }) }), limit: () => ({ get: async () => ({ empty: true, docs: [] }) }), get: async () => ({ empty: true, docs: [] }), where: (field, op, value) => query(key, field, value) })
      };
      window._testAllowed = true;
      window.currentFirebaseUser = user;
      window.myNetworkId = user.uid;
      window.player = { name: user.displayName };
      window.siteIdentity = { user, ready: true, db, whenReady: Promise.resolve(), subscribe(cb) { cb({ user, ready: true }); return () => {}; } };
      const firestore = () => db;
      firestore.FieldValue = { serverTimestamp: () => new ServerTimestamp() };
      firestore.Timestamp = { fromMillis: ms => ({ toMillis: () => ms, toDate: () => new Date(ms) }) };
      window.firebase = { firestore };
      window.pvpChannel = { postMessage: () => {} };
      const frame = document.createElement('iframe');
      frame.id = 'memecardFrame';
      frame.src = origin + '/memecard.html';
      frame.style = 'position:fixed;inset:0;width:100%;height:100%;border:0';
      document.getElementById('host').appendChild(frame);
    }, { user, origin: `http://127.0.0.1:${port}` });

    await page.waitForFunction(() => !!document.querySelector('iframe')?.contentWindow?.memeIdDuel, { timeout: 40000 });
    const frame = page.frames().find(f => f.parentFrame());
    await frame.evaluate(() => {
      window._testAllowed = true;
      document.getElementById('rankPromoOverlay')?.remove();
      if (window.memeMusic) memeMusic.setEnabled(false);
      if (window.memeFx) memeFx.setMode('minimal');
    });

    console.log('[A] idle at the duel lobby: the challenge box must appear and accept must be enabled');
    documents.set('duel_invites/SenderID_RecipID', invite('A'));
    await frame.waitForFunction(() => !!document.getElementById('directDuelInvite'), { timeout: 15000 });
    const idleBox = await frame.$eval('#directDuelInvite', el => ({ text: el.textContent.replace(/\s+/g, ' ').trim(), acceptDisabled: el.querySelector('#idAcceptInvite')?.disabled === true }));
    assert.ok(idleBox.text.includes('Kien Sender'), 'box must name the challenger: ' + idleBox.text);
    assert.equal(idleBox.acceptDisabled, false, 'accept must be enabled while idle');
    await frame.evaluate(() => document.getElementById('idDeclineInvite').click());
    await new Promise(r => setTimeout(r, 400));

    console.log('[B] mid-duel: the challenge box must still appear, accept waits until the duel ends');
    await frame.evaluate(() => { const start = window.startGame || window.parent?.startGame; start && start({}); });
    await frame.waitForFunction(() => !!window.duel && !window.duel.finished && !document.getElementById('duel').classList.contains('hidden'), { timeout: 20000 });
    assert.equal(await frame.evaluate(() => !!window.memeRoom || (!!window.duel && !window.duel.finished && !document.getElementById('duel').classList.contains('hidden'))), true, 'fixture duel must be busy');
    documents.set('duel_invites/SenderID_RecipID', invite('B'));
    await frame.waitForFunction(() => !!document.getElementById('directDuelInvite'), { timeout: 15000 })
      .catch(() => { throw Error('Người đang đánh trận không nhận được lời mời (thiếu #directDuelInvite).'); });
    const busyBox = await frame.$eval('#directDuelInvite', el => ({
      text: el.textContent.replace(/\s+/g, ' ').trim(),
      acceptDisabled: el.querySelector('#idAcceptInvite')?.disabled === true,
      declineDisabled: el.querySelector('#idDeclineInvite')?.disabled === true
    }));
    assert.ok(busyBox.text.includes('Kien Sender'), 'busy box must name the challenger: ' + busyBox.text);
    assert.equal(busyBox.acceptDisabled, true, 'accept must be blocked during a duel: ' + busyBox.text);
    assert.equal(busyBox.declineDisabled, false, 'decline must stay available');

    console.log('[C] the duel ends: accept becomes available again without reloading');
    await frame.evaluate(() => {
      window.duel && (window.duel.finished = true);
      document.getElementById('duel')?.classList.add('hidden');
      window.memeRoom = null;
    });
    await frame.waitForFunction(() => document.getElementById('idAcceptInvite')?.disabled === false, { timeout: 15000 })
      .catch(() => { throw Error('Lời mời không mở lại nút nhận lời sau khi kết thúc trận.'); });
    console.log('ok accept re-enabled');

    console.log('[D] challenging a busy player still creates the invitation');
    documents.set('duel_players/BusyID', { uid: 'BusyID', name: 'Busy Player', main: Array.from({ length: 20 }, (_, i) => 'card_' + i), extra: [], heroId: 0, networkId: 'P_busy', online: true, busy: true, protocol: 'tcg-equip-chain-v20-rematch', lastSeen: Date.now() });
    const sent = await frame.evaluate(async () => {
      try {
        await window.memeIdDuel.invite({ uid: 'BusyID', name: 'Busy Player', networkId: 'P_busy', protocol: 'tcg-equip-chain-v20-rematch', online: true, busy: true }, { silent: true });
        return { ok: true };
      } catch (error) { return { ok: false, error: error.message }; }
    });
    assert.equal(sent.ok, true, 'invite must not be blocked by the target busy flag: ' + (sent.error || ''));
    assert.equal(documents.get('duel_invites/RecipID_BusyID')?.status, 'pending', 'pending invitation must reach Firestore');
    console.log('[E] challenging a player whose saved rules version is stale still sends the invitation');
    documents.set('duel_players/StaleID', { uid: 'StaleID', name: 'Stale Player', main: Array.from({ length: 20 }, (_, i) => 'card_' + i), extra: [], heroId: 0, networkId: 'P_stale', online: false, busy: false, protocol: 'tcg-very-old-version', lastSeen: Date.now() - 40 * 60000 });
    const staleSent = await frame.evaluate(async () => {
      try {
        await window.memeIdDuel.invite({ uid: 'StaleID', name: 'Stale Player', networkId: 'P_stale', protocol: 'tcg-very-old-version', online: false, busy: false, lastSeen: Date.now() - 40 * 60000 }, { silent: true });
        return { ok: true };
      } catch (error) { return { ok: false, error: error.message }; }
    });
    assert.equal(staleSent.ok, true, 'a stale saved protocol must not block the invitation: ' + (staleSent.error || ''));
    assert.equal(documents.get('duel_invites/RecipID_StaleID')?.status, 'pending', 'pending invitation must reach Firestore');
    assert.deepEqual(pageErrors, [], 'page errors: ' + pageErrors.join(' | '));

    console.log('\n=== INVITE DELIVERY CHECKS PASSED ===\n');
    fs.mkdirSync('outputs/invite-delivery', { recursive: true });
    fs.writeFileSync('outputs/invite-delivery/results.json', JSON.stringify({ status: 'passed', pageErrors, checks: ['idle box', 'busy box queues accept', 'accept re-enabled after the duel', 'busy target can still be invited'] }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error('TEST FAILED:', error.message); process.exitCode = 1; });
