const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

const publicDir = path.resolve('dist');
const server = http.createServer((req, res) => {
  const file = path.resolve(publicDir, '.' + new URL(req.url, 'http://local').pathname);
  if (!file.startsWith(publicDir + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (err, bytes) => {
    if (err) return res.writeHead(404).end();
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    res.end(bytes);
  });
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });

  try {
    console.log('🧪 Testing Live Guest Matchmaking & Leaderboard Challenge...');
    const page = await browser.newPage();
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGEERR:', err.message));

    await page.goto(`http://127.0.0.1:${port}/memecard.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!document.getElementById('playBtn') && !!document.getElementById('rankPlayBtn'));

    // Check 1: Play button and Rank button are NOT blocked by siteAuthGate
    const gateHidden = await page.evaluate(() => {
      const g = document.getElementById('siteAuthGate');
      return !g || g.hidden;
    });
    assert.ok(gateHidden, 'Auth gate must not block duel lobby for guests');
    console.log('✅ Check 1: Auth gate does not block lobby');

    // Check 2: Clicking "Đấu Rank nhanh" starts matchmaking overlay
    await page.evaluate(() => {
      document.getElementById('rankPromoOverlay')?.remove();
      document.getElementById('rankPlayBtn').click();
    });
    await page.waitForSelector('#rankMatchOverlay', { timeout: 3000 });
    const isSearching = await page.evaluate(() => !!document.getElementById('rankMatchOverlay'));
    assert.ok(isSearching, 'Matchmaking overlay must appear on rankPlayBtn click');
    console.log('✅ Check 2: Quick Rank matchmaking overlay appears');

    // Cancel search to test Leaderboard challenge
    await page.evaluate(() => {
      document.getElementById('rankMatchCancelBtn').click();
    });
    await page.waitForFunction(() => !document.getElementById('rankMatchOverlay'));

    // Check 3: Leaderboard challenge Boss starts duel
    await page.evaluate(() => {
      window.siteRank.show();
    });
    await page.waitForSelector('#rankOverlay', { timeout: 3000 });
    
    // Wait for Boss button to be painted in table
    await page.waitForSelector('[data-challenge-uid="bot-kaiba"]', { timeout: 10000 });
    await page.evaluate(() => {
      const b = document.querySelector('[data-challenge-uid="bot-kaiba"]');
      if (b) b.click();
    });

    // Wait for duel screen to appear (class hidden removed from #duel)
    await page.waitForFunction(() => {
      const d = document.getElementById('duel');
      return d && !d.classList.contains('hidden');
    }, { timeout: 5000 });

    const inDuel = await page.evaluate(() => typeof duel !== 'undefined' && duel !== null && !duel.finished);
    assert.ok(inDuel, 'Duel must be active after challenging Boss');
    console.log('✅ Check 3: Boss challenge starts duel successfully');

    // Exit back to lobby
    await page.evaluate(() => {
      document.getElementById('backBtn')?.click();
    });
    await page.waitForFunction(() => {
      const d = document.getElementById('duel');
      return d && d.classList.contains('hidden');
    });

    // Check 4: Leaderboard challenge Offline player starts ghost duel without throwing
    await page.evaluate(() => {
      window.siteRank.show();
    });
    await page.waitForSelector('#rankOverlay', { timeout: 3000 });

    // Challenge an offline player via memeIdDuel.challenge
    await page.evaluate(async () => {
      await window.memeIdDuel.challenge('test-offline-player-uid');
    });

    await page.waitForFunction(() => {
      const d = document.getElementById('duel');
      return d && !d.classList.contains('hidden');
    }, { timeout: 5000 });

    const inGhostDuel = await page.evaluate(() => typeof duel !== 'undefined' && duel !== null && duel.ghostOpponent);
    assert.ok(inGhostDuel, 'Ghost duel must start when challenging offline player');
    console.log('✅ Check 4: Offline player challenge starts ghost duel cleanly');

    console.log('🎉 ALL LIVE GUEST TESTS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
    server.close();
  }
})();
