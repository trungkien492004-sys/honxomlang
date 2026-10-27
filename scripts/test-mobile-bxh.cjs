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
    console.log('🧪 Testing Mobile Responsive Leaderboard (390x844 iPhone Viewport)...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await page.goto(`http://127.0.0.1:${port}/memecard.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!document.getElementById('playBtn'));

    // Open Leaderboard on mobile
    await page.evaluate(() => {
      window.siteRank.show();
    });
    await page.waitForSelector('#rankOverlay', { timeout: 3000 });
    await page.waitForSelector('[data-challenge-uid="bot-kaiba"]', { timeout: 10000 });

    const layout = await page.evaluate(() => {
      const table = document.querySelector('.rank-sheet table');
      const tableWrap = document.querySelector('.rank-table-wrap');
      const sheet = document.querySelector('.rank-sheet');
      const subinfo = document.querySelector('.rank-mobile-subinfo');
      const tierCol = document.querySelector('.rank-col-tier');
      const recordCol = document.querySelector('.rank-col-record');

      return {
        tableWidth: table.offsetWidth,
        tableWrapClientWidth: tableWrap.clientWidth,
        tableWrapScrollWidth: tableWrap.scrollWidth,
        sheetWidth: sheet.offsetWidth,
        subinfoVisible: subinfo && getComputedStyle(subinfo).display !== 'none',
        tierColHidden: tierCol && getComputedStyle(tierCol).display === 'none',
        recordColHidden: recordCol && getComputedStyle(recordCol).display === 'none',
        overflowX: getComputedStyle(tableWrap).overflowX
      };
    });

    console.log('Mobile layout metrics:', layout);
    assert.equal(layout.subinfoVisible, true, 'Subinfo line under duelist name must be visible on mobile');
    assert.equal(layout.tierColHidden, true, 'Desktop tier column must be hidden on mobile');
    assert.equal(layout.recordColHidden, true, 'Desktop record column must be hidden on mobile');
    assert.equal(layout.overflowX, 'hidden', 'Table wrap overflow-x must be hidden to prevent horizontal scroll on mobile');

    // Test permission error suppression:
    console.log('Testing permission error suppression...');
    await page.evaluate(() => {
      window.showRankError(new Error('Missing or insufficient permissions.'), 'Hệ thống Rank');
    });
    const hasPermissionBanner = await page.evaluate(() => !!document.getElementById('rankErrorBanner'));
    assert.equal(hasPermissionBanner, false, 'Red error banner must NEVER pop up for Missing or insufficient permissions');
    console.log('✅ Permission error banner successfully suppressed!');

    // Test that the red button "🚨 Mở lỗi đỏ" is NOT present for permission error
    const hasRedButton = await page.evaluate(() => {
      const btn = document.querySelector('.rank-last-error-notice button');
      return !!(btn && btn.textContent.includes('lỗi đỏ'));
    });
    assert.equal(hasRedButton, false, 'Red button for errors must be removed');
    console.log('✅ Red button successfully removed!');

    console.log('🎉 ALL MOBILE RESPONSIVE LEADERBOARD TESTS PASSED!');
  } finally {
    await browser.close();
    server.close();
  }
})();
