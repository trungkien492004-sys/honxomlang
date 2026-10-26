const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const browserPath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: browserPath, args: ['--no-sandbox'] });
  const checks = [];
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent(`<!doctype html><html class="auth-pending"><head><style>
      html.auth-pending body>#app,html.auth-pending body>.screen,html.auth-pending body>#mobileCardActions{visibility:hidden;pointer-events:none}
      #siteAuthGate[hidden]{display:none}
    </style></head><body><section id="loginScreen" class="screen active">Old login</section><section id="gameModeScreen" class="screen">Game lobby</section></body></html>`);
    await page.evaluate(() => {
      const listeners = new Set();
      window.currentFirebaseUser = null;
      window._legacyAuthReady = false;
      window.switchScreen = id => {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(id)?.classList.add('active');
      };
      window.siteIdentity = {
        user: null,
        ready: false,
        subscribe(fn) { listeners.add(fn); fn({ user: null, ready: false }); return () => listeners.delete(fn); },
        set(user, ready) { this.user = user; this.ready = ready; listeners.forEach(fn => fn({ user, ready })); }
      };
    });
    await page.addScriptTag({ path: path.join(root, 'assets/js/site_access.js') });
    assert.equal(await page.$eval('#loginScreen', node => getComputedStyle(node).visibility), 'hidden');
    await page.evaluate(() => siteIdentity.set(null, true));
    assert.equal(await page.$eval('#siteAuthGate', node => node.hidden), false);
    assert.equal(await page.$eval('#loginScreen', node => getComputedStyle(node).visibility), 'hidden');
    await page.evaluate(() => {
      const user = { uid: 'login-test', displayName: 'Người chơi' };
      siteIdentity.set(user, true);
      currentFirebaseUser = user;
      switchScreen('gameModeScreen');
    });
    assert.equal(await page.$eval('#siteAuthGate', node => node.hidden), false);
    assert.equal(await page.$eval('#gameModeScreen', node => getComputedStyle(node).visibility), 'hidden');
    await page.evaluate(() => {
      window._legacyAuthReady = true;
      window.dispatchEvent(new Event('legacy-auth-ready'));
    });
    assert.equal(await page.$eval('#siteAuthGate', node => node.hidden), true);
    assert.equal(await page.$eval('#gameModeScreen', node => getComputedStyle(node).visibility), 'visible');
    assert.equal(await page.$eval('.screen.active', node => node.id), 'gameModeScreen');
    checks.push('login stays behind one stable gate until Firebase restores the account and finishes lobby initialization');

    const identityPage = await browser.newPage();
    identityPage.on('pageerror', error => errors.push(error.message));
    await identityPage.evaluate(() => {
      const documents = new Map();
      const listeners = [];
      const ref = path => ({
        path,
        async get() { return { exists: documents.has(path), data: () => documents.get(path) }; },
        async set(value, options = {}) { documents.set(path, options.merge ? { ...documents.get(path), ...value } : value); },
        async update(value) { documents.set(path, { ...documents.get(path), ...value }); }
      });
      const auth = {
        async setPersistence() {},
        onAuthStateChanged(fn) { listeners.push(fn); setTimeout(() => fn(null), 0); return () => {}; },
        async signInWithPopup() {}, async signOut() { listeners.forEach(fn => fn(null)); }
      };
      auth.Auth = { Persistence: { LOCAL: 'local', SESSION: 'session' } };
      auth.GoogleAuthProvider = function GoogleAuthProvider() {};
      const store = {
        doc: ref,
        async runTransaction(callback) {
          await callback({
            get: async document => ({ exists: documents.has(document.path), data: () => documents.get(document.path) }),
            set: (document, value) => documents.set(document.path, value),
            update: (document, value) => documents.set(document.path, { ...documents.get(document.path), ...value })
          });
        }
      };
      const authFactory = () => auth;
      authFactory.Auth = auth.Auth;
      authFactory.GoogleAuthProvider = auth.GoogleAuthProvider;
      const firestore = () => store;
      firestore.FieldValue = { serverTimestamp: () => Date.now() };
      window.firebase = { apps: [{}], auth: authFactory, firestore };
      window.__setAuthUser = user => listeners.map(fn => fn(user));
      window.__authListenerCount = () => listeners.length;
      window.__documents = documents;
    });
    await identityPage.addScriptTag({ path: path.join(root, 'assets/js/site_identity.js') });
    await identityPage.waitForFunction(() => window.siteIdentity?.ready);
    await identityPage.evaluate(() => __setAuthUser({
      uid: 'presence-test', displayName: 'Người mới', isAnonymous: false,
      providerData: [{ providerId: 'google.com' }], metadata: { creationTime: new Date().toISOString() }
    }));
    await identityPage.waitForFunction(() => __documents.get('duel_directory/presence-test')?.online === true, { timeout: 5000 }).catch(async error => {
      console.log('Presence fixture state:', JSON.stringify(await identityPage.evaluate(() => ({ user: siteIdentity?.user?.uid || null, ready: siteIdentity?.ready, error: siteIdentity?.error, listeners: __authListenerCount(), docs: [...__documents.keys()] }))));
      throw error;
    });
    await identityPage.waitForFunction(() => __documents.has('site_members/presence-test'));
    assert.ok(await identityPage.evaluate(() => __documents.get('duel_directory/presence-test').lastSeen > 0));
    await identityPage.evaluate(() => __setAuthUser(null));
    await identityPage.waitForFunction(() => __documents.get('duel_directory/presence-test')?.online === false);
    checks.push('Google login publishes public online presence, account participation, and immediate sign-out status');

    const rankPage = await browser.newPage();
    rankPage.on('pageerror', error => errors.push(error.message));
    await rankPage.setContent('<div id="rankOverlay"><section class="rank-sheet"><table><tbody id="rankRows"></tbody></table><p id="rankEmpty"></p></section></div>');
    await rankPage.evaluate(() => {
      window.siteIdentity = { user: { uid: 'viewer' } };
      window.siteRank = { close() { window.__closed = true; } };
      window.memeIdDuel = { async challenge(uid) { window.__challenged = uid; } };
      window.__players = [
        { uid: 'alice', name: 'Alice', online: true, lastSeen: Date.now() },
        { uid: 'bob', name: 'Bob', online: false, lastSeen: Date.now() }
      ];
      window.__notifyPresence = null;
      window.__store = { collection() { return { orderBy() { return { limit() { return {
        async get() { return { docs: window.__players.map(player => ({ id: player.uid, data: () => player })) }; },
        onSnapshot(callback) { window.__notifyPresence = callback; callback({ docs: window.__players.map(player => ({ id: player.uid, data: () => player })) }); return () => {}; }
      }; } }; } }; } };
    });
    await rankPage.addScriptTag({ path: path.join(root, 'assets/js/site_rank_players.js') });
    await rankPage.evaluate(() => siteRankPlayers.render(__store, document.getElementById('rankOverlay'), { docs: [] }));
    assert.match(await rankPage.$eval('#rankRows', node => node.textContent), /Online.*Alice/s);
    assert.match(await rankPage.$eval('#rankRows', node => node.textContent), /Offline.*Bob/s);
    await rankPage.click('[data-player-uid="alice"]');
    assert.match(await rankPage.$eval('#rankOpponentPresence', node => node.textContent), /Đang online/);
    await rankPage.evaluate(() => {
      __players[1] = { ...__players[1], online: true, lastSeen: Date.now() };
      __notifyPresence({ docs: __players.map(player => ({ id: player.uid, data: () => player })) });
    });
    assert.match(await rankPage.$eval('[data-presence-uid="bob"]', node => node.textContent), /Online/);
    await rankPage.click('[data-player-uid="bob"]');
    await rankPage.click('#rankChallenge');
    await rankPage.waitForFunction(() => window.__closed === true);
    assert.equal(await rankPage.evaluate(() => window.__challenged), 'bob');
    checks.push('rank board labels online/offline players and live-updates presence before challenge');
    await rankPage.evaluate(() => siteRankPlayers.stop());

    assert.deepEqual(errors, []);
    const resultPath = path.join(root, 'outputs/auth-presence/test-results.json');
    fs.mkdirSync(path.dirname(resultPath), { recursive: true });
    fs.writeFileSync(resultPath, JSON.stringify({
      status: 'passed',
      checks,
      scope: 'Local browser fixtures with controlled Firebase identity, Firestore presence and rank snapshots.'
    }, null, 2));
    console.log('Auth and rank presence:', checks.length, 'checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
