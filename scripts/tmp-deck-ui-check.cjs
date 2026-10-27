const fs = require('fs'), http = require('http'), path = require('path'), puppeteer = require('puppeteer');
const pub = path.resolve('dist'), out = path.resolve('outputs/deck-ui');
const server = http.createServer((q, r) => {
  const u = new URL(q.url, 'http://local'), f = path.resolve(pub, '.' + u.pathname);
  if (!f.startsWith(pub + path.sep)) return r.writeHead(403).end();
  fs.readFile(f, (e, b) => {
    if (e) return r.writeHead(404).end();
    r.setHeader('Content-Type', f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    r.end(b);
  });
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  try {
    fs.mkdirSync(out, { recursive: true });
    const p = await browser.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.evaluateOnNewDocument(() => {
      localStorage.setItem('meme-auth-bypass', '1');
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const [width, height, tag] of [[1366, 768, 'desktop'], [390, 844, 'mobile'], [667, 375, 'landscape']]) {
      await p.setViewport({ width, height });
      await p.goto(base + '/memecard.html');
      await p.waitForFunction(() => document.getElementById('lobbyDeckBtn'));
      await p.evaluate(() => {
        document.querySelectorAll('#siteAuthGate,#rankOverlay,#rankPromoOverlay,.rank-promo-overlay').forEach(n => n.remove());
        document.body.classList.remove('auth-pending');
        document.getElementById('lobby')?.classList.remove('hidden');
      });
      await p.evaluate(() => document.getElementById('lobbyDeckBtn').click());
      await p.waitForSelector('#deckGrid .deck-item');
      await p.evaluate(() => document.querySelector('#deckGrid .deck-item .library-preview').click());
      await new Promise(r => setTimeout(r, 250));
      const info = await p.evaluate(() => {
        const modal = document.getElementById('modal');
        const card = modal.querySelector('.modal-card');
        const m = modal.getBoundingClientRect(), c = card.getBoundingClientRect();
        const footer = document.querySelector('#lobby .lobby-footer');
        const fr = footer ? footer.getBoundingClientRect() : null;
        const hit = [];
        if (fr) {
          hit.push({ footerZ: getComputedStyle(footer).zIndex, modalZ: getComputedStyle(modal).zIndex });
          // Which element is on top at the footer button centres?
          for (const b of footer.querySelectorAll('button')) {
            const br = b.getBoundingClientRect();
            if (!br.width) continue;
            const el = document.elementFromPoint(br.x + br.width / 2, br.y + br.height / 2);
            hit.push({ btn: b.id, topEl: el ? (el.id || el.className || el.tagName) : null, insideModal: !!(el && el.closest('#modal')) });
          }
        }
        const insp = document.getElementById('deckInspector');
        const ir = insp.getBoundingClientRect();
        return {
          modal: { x: m.x, y: m.y, w: m.width, h: m.height, z: getComputedStyle(modal).zIndex },
          card: { x: c.x, y: c.y, w: c.width, h: c.height },
          footer: fr ? { y: fr.y, h: fr.height, z: getComputedStyle(footer).zIndex, top: footer.getBoundingClientRect().top } : null,
          hit,
          inspector: { x: ir.x, y: ir.y, w: ir.width, h: ir.height, hasClose: !!insp.querySelector('.inspect-close') },
          closeVisible: (() => { const b = modal.querySelector('.modal-close'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()
        };
      });
      console.log(tag, JSON.stringify(info, null, 2));
      await p.screenshot({ path: path.join(out, `deck-${tag}.png`) });
    }
    console.log('errors', errors);
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); server.close(); process.exitCode = 1; });
