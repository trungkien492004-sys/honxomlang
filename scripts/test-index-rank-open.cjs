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
    console.log('🧪 Testing index.html parent -> memecard modal integration...');
    const page = await browser.newPage();
    
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });

    // Open game modal via openMemeCardGame
    await page.evaluate(() => {
      window.openMemeCardGame();
    });

    // Check modal display is block
    await page.waitForFunction(() => {
      const modal = document.getElementById('memecardGameModal');
      return modal && modal.style.display === 'block';
    }, { timeout: 3000 });
    console.log('✅ Check 1: openMemeCardGame displays modal');

    // Wait for iframe to load memecard.html
    const frame = await page.waitForFunction(() => {
      const f = document.getElementById('memecardFrame')?.contentWindow;
      return f && f.siteRank ? true : false;
    }, { timeout: 10000 });
    console.log('✅ Check 2: memecardFrame loaded with siteRank inside');

    console.log('🎉 Parent to child modal test passed cleanly!');
  } finally {
    await browser.close();
    server.close();
  }
})();
