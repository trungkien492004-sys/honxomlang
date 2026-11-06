// Cửa hàng nền sân đấu + mặt sau bài: mua, thiếu Xu, trang bị, áp dụng trong trận, không phá giao diện sân cũ.
const path = require('path'), fs = require('fs'), http = require('http'), puppeteer = require('puppeteer');
const pub = path.resolve(__dirname, '..', 'dist'), T = { '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.css': 'text/css', '.js': 'text/javascript', '.html': 'text/html' };
const server = http.createServer((req, res) => { const f = path.resolve(pub, '.' + new URL(req.url, 'http://l').pathname.replace(/^\/$/, '/memecard.html')); fs.readFile(f, (e, d) => { if (e) return res.writeHead(404).end(); res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); res.end(d); }); });
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const b = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const page = await b.newPage(); const errs = [], miss = []; page.on('pageerror', e => errs.push(e.message)); page.on('response', r => { if (r.status() === 404 && /memecard\/(arenas|backs)/.test(r.url())) miss.push(r.url().replace(/.*memecard\//, '')); });
  await page.setViewport({ width: 1100, height: 800 });
  await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
  await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
  await page.waitForFunction(() => window.memeCosmetics && window.memeShop && window.memeHeroStage, { timeout: 30000 });
  const out = await page.evaluate(async () => {
    const R = [], ok = (c, m) => R.push([!!c, m]), P = memeProgress, C = memeCosmetics, root = () => getComputedStyle(document.documentElement);
    const load = f => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth > 0); i.onerror = () => r(false); i.src = f; });
    ok(C.ARENAS.length === 25 && C.BACKS.length === 18, `đủ hàng: ${C.ARENAS.length} nền, ${C.BACKS.length} mặt sau`);
    ok(new Set([...C.ARENAS, ...C.BACKS].map(x => x.id)).size === 43, 'không trùng mã');
    const res = await Promise.all([...C.ARENAS, ...C.BACKS].map(x => load(x.file))); ok(res.every(Boolean), 'mọi ảnh tải được: ' + res.filter(Boolean).length);
    P.state.xu = 0; const poor = C.buy('arena:s_moon'); ok(!poor.ok && !P.ownsTheme('arena:s_moon'), 'thiếu Xu thì không mua được');
    ok(!C.equip('arena:s_moon').ok, 'chưa mua thì không dùng được');
    P.state.xu = 5000; const x0 = P.state.xu; ok(C.buy('arena:s_moon').ok && P.state.xu === x0 - 600, 'mua nền trừ đúng Xu'); ok(!C.buy('arena:s_moon').ok && P.state.xu === x0 - 600, 'không mua trùng, không trừ thêm');
    clearTimeout(aiTimer); memeFx.reset(); closeModal();
    duel = { player: blankSide(MEME_DECK_PRESETS['Jack · Meta'], [], 10), enemy: blankSide(MEME_DECK_PRESETS['Shark · Meta'], [], 11), turn: 'player', phase: 'MAIN1', round: 3, normalSummoned: false, mode: null, pending: null, selected: null, logs: [], finished: false };
    $('lobby')?.classList.add('hidden'); $('duel')?.classList.remove('hidden'); memeHeroStage.applyDuelArt();
    ok(/arenas\/jack\.webp/.test(root().getPropertyValue('--arena-img')) && /backs\/fire\.webp/.test(root().getPropertyValue('--back-player')), 'mặc định theo đấu sĩ');
    C.equip('arena:s_moon'); ok(/arenas\/s_moon\.webp/.test(root().getPropertyValue('--arena-img')) && !$('duel').dataset.theme, 'dùng nền đã mua, áp dụng ngay');
    ok(C.buy('back:wings').ok && C.equip('back:wings').ok && /backs\/wings\.webp/.test(root().getPropertyValue('--back-player')), 'mua và dùng mặt sau bài');
    ok(/backs\/ice\.webp/.test(root().getPropertyValue('--back-enemy')), 'đối thủ giữ mặt sau riêng');
    ok(P.state.themes.active === 'arena:s_moon' && P.state.themes.owned.includes('backon:wings'), 'lựa chọn nằm trong dữ liệu lưu');
    P.state.themes.owned.push('ankh'); P.setTheme('ankh'); memeThemes.apply();
    ok($('duel').dataset.theme === 'ankh' && getComputedStyle($('duel').querySelector('.board-frame'), '::before').content === 'none' || getComputedStyle($('duel').querySelector('.board-frame'), '::before').backgroundImage === 'none', 'giao diện sân cũ không bị nền ảnh che');
    C.equip('arena:auto'); memeHeroStage.applyDuelArt(); ok(/arenas\/jack\.webp/.test(root().getPropertyValue('--arena-img')) && P.state.themes.active === 'default', 'quay về Theo đấu sĩ');
    C.equipBackAuto(); memeHeroStage.applyDuelArt(); ok(/backs\/fire\.webp/.test(root().getPropertyValue('--back-player')) && !C.activeBack() && P.ownsTheme('back:wings'), 'bỏ mặt sau, vẫn còn sở hữu');
    closeModal(); $('duel')?.classList.add('hidden'); $('lobby')?.classList.remove('hidden'); memeShop.open();
    const secs = [...document.querySelectorAll('.cos-section')]; secs[0].open = true;
    ok(secs.length === 2 && document.querySelectorAll('.cos-item.cos-arena').length === 26 && document.querySelectorAll('.cos-item.cos-back').length === 19, 'cửa hàng hiện đủ 2 mục');
    const buyBtn = document.querySelector('[data-cos-buy="arena:s_isles"]'), xu = P.state.xu; buyBtn.click();
    ok(P.ownsTheme('arena:s_isles') && P.state.xu === xu - 600 && C.activeArena() === 's_isles' && document.querySelectorAll('.cos-section')[0].open, 'bấm mua trong cửa hàng: mua, dùng luôn, giữ mục đang mở');
    return R;
  });
  let bad = 0; for (const [c, m] of out) { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; }
  if (process.argv.includes('--shots')) { await page.evaluate(() => { [...document.querySelectorAll('button')].filter(x => /Đã hiểu/.test(x.textContent)).forEach(x => x.click()); memeShop.open(); const s = document.querySelectorAll('.cos-section'); s[0].open = true; s[1].open = true; document.querySelector('.cos-section').scrollIntoView(); }); await new Promise(r => setTimeout(r, 1200)); await page.screenshot({ path: 'scratch/shop.png' }); await page.setViewport({ width: 390, height: 780 }); await new Promise(r => setTimeout(r, 900)); await page.screenshot({ path: 'scratch/shop-m.png' }); }
  if (errs.length || miss.length) { bad++; console.log('errors', errs.slice(0, 4), miss.slice(0, 4)); }
  console.log(bad ? 'FAILED ' + bad : 'test-cosmetics: OK (' + out.length + ')');
  await b.close(); server.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(2); });
