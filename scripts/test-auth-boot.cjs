const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const stubIdentity = `(() => {
  let user = null, ready = false;
  const subs = [];
  const state = () => ({ user, ready, newbie: false });
  window.siteIdentity = {
    get user(){ return user; }, get ready(){ return ready; }, get db(){ return null; },
    get newbie(){ return false; }, error: null,
    subscribe(fn){ subs.push(fn); fn(state()); },
    login(){}, whenReady(){ return Promise.resolve(); }
  };
  setTimeout(() => { ready = true; subs.forEach(fn => fn(state())); }, 300);
})();`;
const recorder = () => {
  const vis = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
  const snap = () => {
    const gate = document.getElementById('siteAuthGate');
    return {
      pending: document.documentElement.classList.contains('auth-pending'),
      active: document.querySelector('.screen.active')?.id || null,
      gateVisible: !!gate && !gate.hidden && vis(gate),
      status: gate?.querySelector('#siteAuthStatus')?.textContent.trim() || null,
      identityReady: !!window.siteIdentity?.ready,
      promo: !!document.getElementById('rankPromoOverlay')
    };
  };
  const events = []; let prev = null;
  const tick = () => {
    try { const s = snap(); const key = JSON.stringify(s); if (key !== prev) { events.push({ t: Math.round(performance.now()), ...s }); prev = key; } } catch {}
    requestAnimationFrame(tick);
  };
  document.addEventListener('DOMContentLoaded', tick);
  window.__bootEvents = () => events;
};

(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://local').pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (error, buffer) => {
      if (error) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
      res.end(buffer);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://boot.test:${server.address().port}`;
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--host-resolver-rules=MAP boot.test 127.0.0.1'] });
  const errors = [];
  const out = path.join(root, 'outputs/auth-boot');
  fs.mkdirSync(out, { recursive: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    page.on('pageerror', error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on('request', request => request.url().includes('site_identity.js')
      ? request.respond({ status: 200, contentType: 'text/javascript', body: stubIdentity })
      : request.continue());
    await page.evaluateOnNewDocument(recorder);
    await page.goto(origin + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__bootEvents().some(event => event.gateVisible), { timeout: 20000 });
    await new Promise(resolve => setTimeout(resolve, 1600));
    const gate = await page.evaluate(() => ({
      pending: document.documentElement.classList.contains('auth-pending'),
      visible: !document.getElementById('siteAuthGate').hidden,
      status: document.getElementById('siteAuthStatus').textContent.trim(),
      active: document.querySelector('.screen.active')?.id,
      promo: !!document.getElementById('rankPromoOverlay'),
      transitions: window.__bootEvents()
    }));
    assert.equal(gate.visible, true);
    assert.equal(gate.pending, true);
    assert.equal(gate.status, 'Đăng nhập Google để vào game.', 'The gate must appear once, already showing its final message');
    assert.equal(gate.active, 'loginScreen');
    assert.equal(gate.promo, false, 'The rank promo must not pop over the landing page login gate');
    const rawLogin = gate.transitions.filter(event => !event.pending && event.active === 'loginScreen' && !event.gateVisible);
    assert.deepEqual(rawLogin, [], 'The bare #loginScreen must never be exposed without the splash or the gate');
    const firstGate = gate.transitions.find(event => event.gateVisible);
    assert.equal(firstGate.identityReady, true, 'The gate must wait for identity recovery');
    assert.equal(firstGate.status, 'Đăng nhập Google để vào game.', 'No placeholder status text may flash inside the gate');
    await page.screenshot({ path: path.join(out, 'index-gate-1366.png') });

    await page.click('#siteGuestContinue');
    await page.waitForFunction(() => document.querySelector('.screen.active')?.id === 'gameModeScreen');
    const guest = await page.evaluate(() => ({
      pending: document.documentElement.classList.contains('auth-pending'),
      gateHidden: document.getElementById('siteAuthGate').hidden,
      active: document.querySelector('.screen.active')?.id,
      promo: !!document.getElementById('rankPromoOverlay'),
      signOutHidden: [...document.querySelectorAll('#gameModeScreen [onclick*="signOutUser"]')].every(button => button.hidden)
    }));
    assert.deepEqual(guest, { pending: false, gateHidden: true, active: 'gameModeScreen', promo: false, signOutHidden: true });
    await page.screenshot({ path: path.join(out, 'index-guest-1366.png') });
    await page.close();

    const duel = await browser.newPage();
    await duel.setViewport({ width: 1366, height: 768 });
    duel.on('pageerror', error => errors.push(error.message));
    await duel.setRequestInterception(true);
    duel.on('request', request => request.url().includes('site_identity.js')
      ? request.respond({ status: 200, contentType: 'text/javascript', body: stubIdentity })
      : request.continue());
    await duel.evaluateOnNewDocument(recorder);
    await duel.goto(origin + '/memecard.html', { waitUntil: 'domcontentloaded' });
    await duel.waitForFunction(() => window.__bootEvents().length > 0);
    await duel.waitForSelector('#rankPromoOverlay', { timeout: 8000 });
    const lobby = await duel.evaluate(() => {
      const gate = document.getElementById('siteAuthGate');
      return {
        gateHidden: gate.hidden,
        pending: document.documentElement.classList.contains('auth-pending'),
        lobbyVisible: getComputedStyle(document.getElementById('lobby')).display !== 'none',
        transitions: window.__bootEvents()
      };
    });
    assert.equal(lobby.gateHidden, true, 'The duel lobby must stay open to guests');
    assert.equal(lobby.pending, false);
    assert.equal(lobby.lobbyVisible, true);
    assert.deepEqual(lobby.transitions.filter(event => event.gateVisible), [], 'The login gate must never cover the duel lobby');
    await duel.evaluate(() => document.getElementById('promoDismissBtn')?.click());
    await duel.screenshot({ path: path.join(out, 'lobby-after-promo-1366.png') });
    await duel.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 2600));
    assert.equal(await duel.evaluate(() => !!document.getElementById('rankPromoOverlay')), false, 'A dismissed promo stays dismissed');
    await duel.screenshot({ path: path.join(out, 'lobby-clean-1366.png') });
    await duel.close();

    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ status: 'passed', gate, guest, lobbyTransitions: lobby.transitions.length, errors }, null, 2));
    console.log('Auth boot: splash holds until identity+legacy settle, one stable gate with final copy, no bare login flash, no promo over the landing gate, guest reaches the lobby, duel lobby never gated.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
