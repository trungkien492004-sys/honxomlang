const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

const publicDir = path.resolve('dist');
const server = http.createServer((request, response) => {
  const file = path.resolve(publicDir, '.' + new URL(request.url, 'http://local').pathname);
  if (!file.startsWith(publicDir + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return response.writeHead(404).end();
    const ext = path.extname(file);
    response.setHeader('Content-Type', ext === '.html' ? 'text/html' : ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : ext === '.json' ? 'application/json' : 'application/octet-stream');
    response.end(bytes);
  });
});

const STUB = () => {
  // Minimal cross-realm Firestore double; the real page scripts stay untouched.
  class Ts { constructor(ms) { this.ms = ms; } toMillis() { return this.ms; } toDate() { return new Date(this.ms); } }
  const documents = {};
  const docListeners = new Map();
  const queryListeners = new Map();
  const fire = key => {
    const data = documents[key];
    (docListeners.get(key) || []).forEach(fn => fn({ exists: !!data, data: () => data, id: key }));
    for (const [id, entry] of [...queryListeners]) {
      const rows = Object.entries(documents)
        .filter(([k, v]) => k.startsWith(entry.collection + '/') && v && v[entry.field] === entry.value)
        .map(([k, v]) => ({ id: k.slice(entry.collection.length + 1), data: () => v }));
      entry.fn({ empty: !rows.length, docs: rows, forEach: cb => rows.forEach(cb) });
    }
  };
  const doc = key => ({
    path: key,
    get: async () => ({ exists: !!documents[key], data: () => documents[key], id: key }),
    set: async (data, options) => { documents[key] = options?.merge ? { ...documents[key], ...data } : { ...data }; fire(key); },
    update: async data => { documents[key] = { ...documents[key], ...data }; fire(key); },
    onSnapshot: fn => { (docListeners.has(key) || docListeners.set(key, new Map())).set(fn, fn); fn({ exists: !!documents[key], data: () => documents[key], id: key }); return () => docListeners.get(key)?.delete(fn); }
  });
  const store = {
    doc,
    _documents: documents,
    _write: (key, data) => { documents[key] = data; fire(key); },
    _delete: key => { delete documents[key]; fire(key); },
    runTransaction: async action => action({ get: ref => ref.get(), set: (ref, data, options) => ref.set(data, options), update: (ref, data) => ref.update(data) }),
    collection: key => ({
      orderBy: () => ({ limit: () => ({ get: async () => ({ empty: true, docs: [], forEach: () => {} }) }), get: async () => ({ empty: true, docs: [], forEach: () => {} }) }),
      limit: () => ({ get: async () => ({ empty: true, docs: [], forEach: () => {} }) }),
      get: async () => ({ empty: true, docs: [], forEach: () => {} }),
      where: (field, op, value) => ({
        orderBy: () => this,
        limit: () => this,
        get: async () => ({ empty: true, docs: [], forEach: () => {} }),
        onSnapshot: fn => { queryListeners.set(field + ':' + value, { collection: key, field, value, fn }); return () => queryListeners.delete(field + ':' + value); }
      })
    })
  };
  const user = { uid: 'BobID', displayName: 'Bob Player', metadata: { creationTime: new Date(Date.now() - 40 * 86400000).toISOString() }, getIdToken: async () => 'fixture-token' };
  window.__ts = ms => new Ts(ms);
  window.siteIdentity = {
    user, ready: true, db: store, signing: false, newbie: false,
    whenReady: Promise.resolve(),
    subscribe(cb) { cb({ user, ready: true }); return () => {}; },
    login: async () => user, logout: async () => {}
  };
  window.currentFirebaseUser = user;
  window.myNetworkId = 'P_bob';
};

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const pageErrors = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    page.on('pageerror', e => pageErrors.push(e.message));
    await page.evaluateOnNewDocument(STUB);
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(() => !!window.siteRank, { timeout: 30000 });
    const started = await page.evaluate(() => ({
      hasFrame: !!document.getElementById('memecardFrame'),
      modalDisplay: document.getElementById('memecardGameModal')?.style.display ?? null
    }));
    assert.ok(started.hasFrame, 'main page must expose #memecardFrame for the global invite listener');

    console.log('[STEP 1] lobby closed on the main site: pending invite must raise #globalDuelInvite');
    await page.evaluate(() => {
      window.siteIdentity.db._write('duel_players/KienSender', {
        uid: 'KienSender', name: 'Kien Sender', networkId: 'P_kien', protocol: 'tcg-equip-chain-v20-rematch',
        main: ['hot_via'], extra: [], heroId: 0, online: true, busy: false, lastSeen: window.__ts(Date.now())
      });
      window.siteIdentity.db._write('duel_invites/KienSender_BobID', {
        from: 'KienSender', to: 'BobID', nonce: 'nonce-lobby-1', roomId: 'ID-LOBBY-1', status: 'pending',
        createdAt: window.__ts(Date.now()), expiresAt: window.__ts(Date.now() + 60000)
      });
    });
    await page.waitForFunction(() => !!document.getElementById('globalDuelInvite'), { timeout: 10000 })
      .catch(() => { throw Error('Lời mời không hiển thị trên sảnh (thiếu #globalDuelInvite).'); });
    const popup = await page.$eval('#globalDuelInvite', el => ({ text: el.textContent, buttons: [...el.querySelectorAll('button')].map(b => b.id) }));
    assert.ok(popup.text.includes('Kien Sender'), 'popup must name the challenger: ' + popup.text.slice(0, 80));
    assert.deepEqual(popup.buttons, ['globalAcceptDuelBtn', 'globalDeclineDuelBtn']);
    console.log('OK popup:', popup.text.replace(/\s+/g, ' ').slice(0, 90));

    const sendInvite = async nonce => {
      await page.evaluate(nonce => {
        const store = window.siteIdentity.db;
        for (const key of Object.keys(store._documents)) if (key.startsWith('duel_invites/')) store._delete(key);
        store._write('duel_invites/KienSender_BobID', {
          from: 'KienSender', to: 'BobID', nonce, roomId: 'ID-' + nonce, status: 'pending',
          createdAt: window.__ts(Date.now()), expiresAt: window.__ts(Date.now() + 60000)
        });
      }, nonce);
    };

    console.log('[STEP 2] accepting the lobby popup must accept the invite and open the duel');
    await page.evaluate(() => document.getElementById('globalAcceptDuelBtn')?.click());
    await page.waitForFunction(() => window.siteIdentity.db._documents['duel_invites/KienSender_BobID']?.status === 'accepted', { timeout: 10000 });
    await page.waitForFunction(() => {
      const modal = document.getElementById('memecardGameModal');
      return modal && modal.style.display !== 'none' && modal.style.display !== '';
    }, { timeout: 10000 }).catch(() => { throw Error('Chấp nhận lời mời mà không mở được đấu bài.'); });
    console.log('ok invite accepted and the duel screen opened');

    console.log('[STEP 3] duel screen open but the duel iframe is dead: the lobby popup must still appear');
    await page.evaluate(() => {
      document.getElementById('globalDuelInvite')?.remove();
      document.getElementById('memecardFrame').src = 'about:blank';
    });
    await new Promise(r => setTimeout(r, 600));
    await sendInvite('nonce-dead-frame');
    await page.waitForFunction(() => !!document.getElementById('globalDuelInvite'), { timeout: 10000 })
      .catch(() => { throw Error('Khi khung đấu bài chưa sẵn sàng, lời mời phải hiện trên trang chủ.'); });
    console.log('ok popup rescued by the lobby listener');

    console.log('[STEP 4] duel iframe alive with the modal open: the lobby popup stays hidden');
    await page.evaluate(() => {
      document.getElementById('globalDuelInvite')?.remove();
      document.getElementById('memecardFrame').contentWindow.memeIdDuel = {};
      document.getElementById('memecardGameModal').style.display = 'flex';
    });
    await sendInvite('nonce-frame-alive');
    await new Promise(r => setTimeout(r, 1500));
    assert.equal(await page.$('#globalDuelInvite'), null, 'the duel iframe owns the invite box when it is alive');
    console.log('ok no duplicate popup while the duel module owns it');

    fs.mkdirSync('outputs/global-invite', { recursive: true });
    fs.writeFileSync('outputs/global-invite/results.json', JSON.stringify({ status: 'passed', pageErrors, checks: ['lobby invite popup appears', 'accept writes accepted and opens the duel', 'popup shows when the duel iframe is dead', 'no duplicate popup while the duel iframe is alive'] }, null, 2));
    assert.deepEqual(pageErrors, [], 'page errors: ' + pageErrors.join(' | '));
    console.log('Global lobby invite listener: passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error('TEST FAILED:', error.message); process.exitCode = 1; });
