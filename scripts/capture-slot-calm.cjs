const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'dist');

const server = http.createServer((req, res) => {
  const f = path.resolve(pub, '.' + new URL(req.url, 'http://localhost').pathname.replace(/^\/$/, '/index.html'));
  if (!f.startsWith(pub + path.sep)) return res.writeHead(403).end();
  fs.readFile(f, (e, b) => {
    if (e) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.png': 'image/png'
    })[path.extname(f)] || 'application/octet-stream');
    res.end(b);
  });
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const outDir = 'C:/Users/Kien/Downloads/slot-calm';
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });

    for (const [w, h] of [[1366, 768], [390, 844]]) {
      await page.setViewport({ width: w, height: h });
      await page.goto(base + '/memecard.html', { waitUntil: 'domcontentloaded' });

      await page.waitForFunction(() => window.memeAnime && window.memeFx);

      // Start game cleanly
      await page.evaluate(() => {
        if (!duel) {
          memeOpening.create = () => ({ face: 'heads', first: 'player', readyAt: Date.now() - 1 });
          startGame();
        }
        clearTimeout(aiTimer);
        duel.phase = 'BATTLE';
        duel.turn = 'player';
        duel.round = 3;
        duel.player.lp = 800; // Trigger Crisis Mode
        duel.enemy.lp = 2500;
        duel.player.monsters = [
          monsterSlot('AN-dark_magician', 'atk'),
          monsterSlot('AN-celtic_guardian', 'atk'),
          null
        ];
        duel.enemy.monsters = [
          monsterSlot('AN-blue_eyes_white_dragon', 'atk'),
          monsterSlot('AN-vorse_raider', 'atk'),
          null
        ];
        $('lobby').classList.add('hidden');
        $('duel').classList.remove('hidden');
        render();
      });

      await new Promise(r => setTimeout(r, 600));

      const scPath = path.join(outDir, `battle-slots-calm-${w}x${h}.png`);
      await page.screenshot({ path: scPath });
      console.log('Saved screenshot:', scPath);
    }
  } finally {
    await browser.close();
    server.close();
  }
})();
