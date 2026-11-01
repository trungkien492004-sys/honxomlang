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
  const outDir = path.join(root, 'outputs/gd3-audio');
  const userDownloadsDir = 'C:/Users/Kien/Downloads/gd3-audio';
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
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

    for (const [w, h] of [[1366, 768], [390, 844]]) {
      await page.setViewport({ width: w, height: h });
      await page.goto(base + '/memecard.html', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.memeAnime && window.memeFx && window.memeAudioSfx && window.memeAnimeDialogue);

      // 1. Snapshot: Yugi Ace Summon Dialogue (Dark Magician)
      await page.evaluate(() => {
        if (!duel) {
          memeOpening.create = () => ({ face: 'heads', first: 'player', readyAt: Date.now() - 1 });
          startGame();
        }
        clearTimeout(aiTimer);
        duel.phase = 'MAIN1';
        duel.turn = 'player';
        duel.round = 3;
        $('lobby').classList.add('hidden');
        $('duel').classList.remove('hidden');
        render();

        window.memeAnimeDialogue.show('player', 'Người cận vệ trung thành nhất của ta — Phù Thủy Áo Đen!', 0);
      });

      await page.waitForSelector('.anime-dialogue-banner.player-dialogue');
      await new Promise(r => setTimeout(r, 180));
      const dialogueFile = `dialogue-yugi-ace-${w}x${h}.png`;
      await page.screenshot({ path: path.join(outDir, dialogueFile) });
      fs.copyFileSync(path.join(outDir, dialogueFile), path.join(userDownloadsDir, dialogueFile));

      // 2. Snapshot: Kaiba Opponent Ace Dialogue (Blue-Eyes White Dragon)
      await page.evaluate(() => {
        document.querySelectorAll('.anime-dialogue-banner').forEach(el => el.remove());
        window.memeAnimeDialogue.show('enemy', 'Chiêm ngưỡng tạo vật hoàn mỹ và bất bại — Rồng Trắng Mắt Xanh!', 1);
      });

      await page.waitForSelector('.anime-dialogue-banner.enemy-dialogue');
      await new Promise(r => setTimeout(r, 180));
      const kaibaFile = `dialogue-kaiba-ace-${w}x${h}.png`;
      await page.screenshot({ path: path.join(outDir, kaibaFile) });
      fs.copyFileSync(path.join(outDir, kaibaFile), path.join(userDownloadsDir, kaibaFile));

      console.log(`Successfully captured GĐ3 screenshots for ${w}x${h}`);
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
