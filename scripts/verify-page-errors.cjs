const http = require('http');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  let pathname = decodeURIComponent(u.pathname);
  if (pathname === '/') pathname = '/memecard.html';
  const filePath = path.join(root, pathname);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.cjs': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  console.log(`Test server running at http://127.0.0.1:${port}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-background-timer-throttling']
  });

  const pageErrors = [];
  const consoleErrors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', err => {
      console.error('❌ PAGE ERROR:', err.message);
      pageErrors.push(err.message);
    });
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ CONSOLE ERROR:', msg.text());
        consoleErrors.push(msg.text());
      }
    });

    console.log('Navigating to memecard.html...');
    await page.goto(`http://127.0.0.1:${port}/memecard.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.memeAnime?.chooseMany, { timeout: 15000 });

    console.log('Page loaded successfully. Checking engine state...');
    const engineState = await page.evaluate(() => {
      return {
        cardsLoaded: (window.MEME_CARDS || []).length,
        animeRulesLoaded: typeof window.memeAnime !== 'undefined',
        dlHandlersLoaded: typeof window.memeDlHandlers !== 'undefined',
        presetsLoaded: typeof window.MEME_DECK_PRESETS !== 'undefined'
      };
    });
    console.log('Engine state:', engineState);

    // Give time for any delayed errors
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n======================================================');
    console.log(`RESULTS: Page Errors: ${pageErrors.length}, Console Errors: ${consoleErrors.length}`);
    console.log('======================================================');

    if (pageErrors.length === 0) {
      console.log('🎉 ZERO pageerror verified! Web client runs cleanly without errors.');
      process.exitCode = 0;
    } else {
      console.error('❌ Found pageerror(s)!');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test run failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
