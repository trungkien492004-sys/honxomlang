const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const pub = path.resolve('dist');
const server = http.createServer((q, r) => {
  const f = path.resolve(pub, '.' + new URL(q.url, 'http://l').pathname);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    r.setHeader('Content-Type', f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    r.end(fs.readFileSync(f));
  } else {
    r.writeHead(404).end();
  }
});

(async () => {
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const port = server.address().port;
  const browser = await puppeteer.launch({headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox']});
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('rank-promo-dismissed', '1');
    localStorage.setItem('rank-promo-dismissed', '1');
  });

  // 1. PC 1366x768
  await page.setViewport({width: 1366, height: 768});
  await page.goto(`http://127.0.0.1:${port}/memecard.html`, {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'outputs/new-pc-lobby.png'});

  // 2. Mobile 390x844 (iPhone 12/13/14)
  await page.setViewport({width: 390, height: 844, isMobile: true, hasTouch: true});
  await page.goto(`http://127.0.0.1:${port}/memecard.html`, {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'outputs/new-mobile-lobby.png'});

  // 3. Small Mobile 375x667 (iPhone SE)
  await page.setViewport({width: 375, height: 667, isMobile: true, hasTouch: true});
  await page.screenshot({path: 'outputs/new-mobile-small.png'});

  console.log('New screenshots captured successfully!');
  await browser.close();
  server.close();
})();
