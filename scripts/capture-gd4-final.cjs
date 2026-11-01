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
  const outDir = 'C:/Users/Kien/Downloads/gd4-final';
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
      await page.waitForFunction(() => window.memeAnime && window.memeFx && window.memeAudioSfx && window.memeAnimeDialogue);

      // 1. Snapshot: Sân đấu tĩnh dịu (Field Slots Calm - Không giật nhấp nháy)
      await page.evaluate(() => {
        if (!duel) {
          memeOpening.create = () => ({ face: 'heads', first: 'player', readyAt: Date.now() - 1 });
          startGame();
        }
        clearTimeout(aiTimer);
        duel.phase = 'BATTLE';
        duel.turn = 'player';
        duel.round = 3;
        duel.player.lp = 800; // LP Crisis
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
      const calmFile = path.join(outDir, `01-field-slots-calm-${w}x${h}.png`);
      await page.screenshot({ path: calmFile });
      console.log('Saved:', calmFile);

      // 2. Snapshot: Banner Thoại Kaiba với Card Art Huy hiệu Rồng Trắng Mắt Xanh
      await page.evaluate(() => {
        document.querySelectorAll('.anime-dialogue-banner').forEach(el => el.remove());
        window.memeAnimeDialogue.show('enemy', 'Chiêm ngưỡng tạo vật hoàn mỹ và bất bại - Rồng Trắng Mắt Xanh!', 1);
      });

      await page.waitForSelector('.anime-dialogue-banner.enemy-dialogue');
      await new Promise(r => setTimeout(r, 200));
      const kaibaFile = path.join(outDir, `02-kaiba-ace-art-badge-${w}x${h}.png`);
      await page.screenshot({ path: kaibaFile });
      console.log('Saved:', kaibaFile);

      // 3. Snapshot: Banner Thoại Yugi với Card Art Huy hiệu Phù Thủy Áo Đen
      await page.evaluate(() => {
        document.querySelectorAll('.anime-dialogue-banner').forEach(el => el.remove());
        window.memeAnimeDialogue.show('player', 'Người cận vệ trung thành nhất của ta - Phù Thủy Áo Đen!', 0);
      });

      await page.waitForSelector('.anime-dialogue-banner.player-dialogue');
      await new Promise(r => setTimeout(r, 200));
      const yugiFile = path.join(outDir, `03-yugi-ace-art-badge-${w}x${h}.png`);
      await page.screenshot({ path: yugiFile });
      console.log('Saved:', yugiFile);
    }
  } finally {
    await browser.close();
    server.close();
  }
})();
