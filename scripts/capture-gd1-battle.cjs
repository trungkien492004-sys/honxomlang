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
  const outDir = path.join(root, 'outputs/gd1-battle');
  const userDownloadsDir = 'C:/Users/Kien/Downloads/gd1-battle';
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(userDownloadsDir, { recursive: true });

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

      // Snapshot 1: Lobby
      const lobbyFile = `lobby-${w}x${h}.png`;
      await page.screenshot({ path: path.join(outDir, lobbyFile) });
      fs.copyFileSync(path.join(outDir, lobbyFile), path.join(userDownloadsDir, lobbyFile));

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
          null,
          null
        ];
        duel.enemy.monsters = [null, null, null]; // Open field -> Direct Attack
        $('lobby').classList.add('hidden');
        $('duel').classList.remove('hidden');
        render();
      });

      // Snapshot 2: Board with Crisis pulse (LP 800)
      await new Promise(r => setTimeout(r, 250));
      const crisisFile = `board-crisis-${w}x${h}.png`;
      await page.screenshot({ path: path.join(outDir, crisisFile) });
      fs.copyFileSync(path.join(outDir, crisisFile), path.join(userDownloadsDir, crisisFile));

      // Trigger Direct Attack
      await page.evaluate(() => {
        memeFx.attack('player', 0, false, null, false, async () => {
          duel.enemy.lp -= 2500;
          render();
        });
      });

      // Give Direct Attack badge a moment to appear
      await new Promise(r => setTimeout(r, 120));
      const directFile = `direct-attack-${w}x${h}.png`;
      await page.screenshot({ path: path.join(outDir, directFile) });
      fs.copyFileSync(path.join(outDir, directFile), path.join(userDownloadsDir, directFile));

      console.log(`Successfully captured GĐ1 screenshots for ${w}x${h}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  server.close();
  process.exit(1);
});
