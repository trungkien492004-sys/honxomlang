const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.setViewport({ width: 1365, height: 850 });
    await page.goto('https://honxomlang-e6974.web.app/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.siteIdentity?.ready && window._legacyAuthReady === true, { timeout: 45000 });
    const gate = await page.evaluate(() => ({
      pending: document.documentElement.classList.contains('auth-pending'),
      appVisibility: getComputedStyle(document.querySelector('body>.screen') || document.getElementById('app')).visibility,
      visible: !document.getElementById('siteAuthGate').hidden,
      loginButton: !!document.getElementById('siteGoogleLogin')
    }));
    assert.deepEqual(gate, { pending: true, appVisibility: 'hidden', visible: true, loginButton: true });
    await page.click('#siteGuestLeaderboard');
    await page.waitForFunction(() => document.querySelectorAll('#rankRows .rank-presence').length > 0, { timeout: 45000 });
    const board = await page.evaluate(() => ({
      rows: document.querySelectorAll('#rankRows tr').length,
      statuses: [...document.querySelectorAll('#rankRows .rank-presence')].map(item => item.textContent.trim()),
      modal: document.getElementById('rankOverlay')?.getAttribute('role')
    }));
    assert.ok(board.rows > 0, 'The public rank board should show participants.');
    assert.equal(board.statuses.length, board.rows, 'Every participant should show a presence label.');
    assert.ok(board.statuses.every(value => value === 'Online' || value === 'Offline'));
    await page.click('#rankRows [data-player-uid]');
    assert.ok(await page.$eval('#rankOpponentPresence', node => /online|offline/i.test(node.textContent)));
    const visual = await page.evaluate(() => {
      const overlay = document.getElementById('rankOverlay');
      const sheet = overlay?.querySelector('.rank-sheet');
      const rect = sheet?.getBoundingClientRect();
      const style = overlay && getComputedStyle(overlay);
      return { display: style?.display, visibility: style?.visibility, zIndex: style?.zIndex, sheet: rect && { width: rect.width, height: rect.height }, topElement: document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.id };
    });
    console.log('Live rank visual:', JSON.stringify(visual));
    assert.deepEqual(errors, []);
    const output = path.resolve('outputs/auth-presence/live-results.json');
    fs.writeFileSync(output, JSON.stringify({ status: 'passed', gate, board, scope: 'Anonymous browser check against the deployed public site; no real account was signed in.' }, null, 2));
    await page.screenshot({ path: path.resolve('outputs/auth-presence/live-rank.png') });
    console.log(`Live login gate and rank presence passed: ${board.rows} participants show Online/Offline.`);
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
