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
  const outDir = path.join(root, 'outputs/gd2-summon');
  const userDownloadsDir = 'C:/Users/Kien/Downloads/gd2-summon';
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
      await page.waitForFunction(() => window.memeAnime && window.memeFx && window.memeSummonVfx);

      // Start game cleanly
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
      });

      // 1. Snapshot: Fusion Summon with Vortex
      await page.evaluate(() => {
        window.fusionTask = memeFx.resolveCard({
          kind: 'fusion',
          owner: 'player',
          cardId: 'AN-elemental_hero_flame_wingman',
          title: 'HERO Flame Wingman',
          text: 'Nguyên liệu hội tụ — Dung Hợp!',
          materials: ['AN-elemental_hero_avian', 'AN-elemental_hero_burstinatrix']
        }, () => {});
      });

      await page.waitForSelector('.fusion-vortex-stage');
      await new Promise(r => setTimeout(r, 150));
      const fusionFile = `fusion-vortex-${w}x${h}.png`;
      await page.screenshot({ path: path.join(outDir, fusionFile) });
      fs.copyFileSync(path.join(outDir, fusionFile), path.join(userDownloadsDir, fusionFile));
      await page.evaluate(() => memeFx.skip());

      // 2. Snapshot: Synchro Tuning Rings
      await page.evaluate(() => {
        window.synchroTask = memeFx.resolveCard({
          kind: 'synchro',
          owner: 'player',
          cardId: 'AN-stardust_dragon',
          title: 'Triệu Hồi Đồng Bộ · Rồng Tinh Tú',
          text: 'Tụ họp vì sao hy vọng — Stardust Dragon!',
          materials: ['AN-junk_synchron', 'AN-speed_warrior']
        }, () => {});
      });

      await page.waitForSelector('.synchro-tuning-stage');
      await new Promise(r => setTimeout(r, 150));
      const synchroFile = `synchro-rings-${w}x${h}.png`;
      await page.screenshot({ path: path.join(outDir, synchroFile) });
      fs.copyFileSync(path.join(outDir, synchroFile), path.join(userDownloadsDir, synchroFile));
      await page.evaluate(() => memeFx.skip());

      // 3. Snapshot: Counter Trap Shield Ripple
      await page.evaluate(() => {
        window.counterTask = memeFx.resolveCard({
          kind: 'trap',
          owner: 'player',
          cardId: 'AN-mirror_force',
          title: 'Gương Phản Chiếu (Mirror Force)',
          text: 'Phản chiếu toàn bộ đòn tấn công của đối thủ!'
        }, () => {});
      });

      await page.waitForSelector('.counter-clash-shield');
      await new Promise(r => setTimeout(r, 150));
      const counterFile = `counter-barrier-${w}x${h}.png`;
      await page.screenshot({ path: path.join(outDir, counterFile) });
      fs.copyFileSync(path.join(outDir, counterFile), path.join(userDownloadsDir, counterFile));
      await page.evaluate(() => memeFx.skip());

      console.log(`Successfully captured GĐ2 screenshots for ${w}x${h}`);
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
