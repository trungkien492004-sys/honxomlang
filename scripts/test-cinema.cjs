// Kiểm tra: che bài úp đối thủ trong bảng chọn, bài vỡ + bụi, cut-in mắt, lá core tấn công, giọng chỉ tiếng Nhật.
const path = require('path'), fs = require('fs'), http = require('http'), puppeteer = require('puppeteer');
const pub = path.resolve(__dirname, '..', 'dist'), shots = process.argv.includes('--shots');
const server = http.createServer((req, res) => { const f = path.resolve(pub, '.' + new URL(req.url, 'http://l').pathname.replace(/^\/$/, '/memecard.html')); fs.readFile(f, (e, d) => { if (e) return res.writeHead(404).end(); res.end(d); }); });
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const b = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const page = await b.newPage(); const errs = [], reqs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('request', r => { if (/assets\/audio\/voices\//.test(r.url())) reqs.push(r.url().replace(/.*voices\//, '')); });
  await page.setViewport({ width: 1100, height: 800 });
  await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
  await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
  await page.waitForFunction(() => window.memeFxCinema && window.memeJaVoice && window.memeFx?.__cinemaWrapped, { timeout: 30000 });
  await page.evaluate(() => { memeMusic.setEnabled(false); [...document.querySelectorAll('button')].filter(x => /Đã hiểu/.test(x.textContent)).forEach(x => x.click()); });
  const setup = () => page.evaluate(() => {
    clearTimeout(aiTimer); memeFx.reset(); memeAnime.setAuto(false); closeModal();
    duel = { player: blankSide(MEME_DECK_PRESETS['Yugi · Kinh điển'], [], 0), enemy: blankSide(MEME_DECK_PRESETS['Kaiba · Kinh điển'], [], 1), turn: 'player', phase: 'MAIN1', round: 3, normalSummoned: false, mode: null, pending: null, selected: null, logs: [], finished: false };
    for (const n of ['player', 'enemy']) { const s = duel[n]; s.hand = []; s.grave = []; s.banished = []; s.monsters = [null, null, null]; s.spells = [null, null, null]; s.field = null; s.extra = null; s.extraDeck = []; }
    $('lobby')?.classList.add('hidden'); $('duel')?.classList.remove('hidden');
    duel.enemy.monsters[0] = Object.assign(monsterSlot('AN-blue_eyes_white_dragon', 'def_down'), { summonedRound: 1 });
    duel.enemy.monsters[1] = Object.assign(monsterSlot('AN-battle_ox', 'atk'), { summonedRound: 1 });
    duel.enemy.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 1 };
    duel.player.monsters[0] = Object.assign(monsterSlot('AN-dark_magician', 'atk'), { summonedRound: 1 });
    render();
  });
  let bad = 0; const chk = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };

  // 1. Che bài úp
  await setup();
  const hide = await page.evaluate(async () => {
    const { targetList, spellList, pick, pickMany } = memeAnime.tcgCore;
    const opts = () => [...targetList('enemy'), ...spellList('enemy')];
    const o1 = opts(); pick('player', 'test', o1, { optional: true });
    await new Promise(r => setTimeout(r, 200));
    const m = document.querySelector('.modal-card'), txt = m?.innerText || '', html = m?.innerHTML || '';
    const a = { leakMirror: /Mirror Force|Vòng Phản|mirror_force/i.test(html), leakBE: /blue_eyes_white_dragon/.test(html), showsUp: /battle_ox/.test(html), hiddenFlags: o1.map(o => !!o.hidden), count: (txt.match(/Bài úp/g) || []).length };
    closeModal();
    return a;
  });
  chk(!hide.leakMirror && !hide.leakBE, 'bảng chọn không lộ tên/ảnh bài úp đối thủ ' + JSON.stringify(hide));
  chk(hide.showsUp && hide.hiddenFlags.filter(Boolean).length === 2, 'quái ngửa vẫn thấy, đúng 2 lá bị che');
  await page.reload(); await page.waitForFunction(() => window.memeFx?.__cinemaWrapped, { timeout: 30000 });
  await page.evaluate(() => { memeMusic.setEnabled(false); [...document.querySelectorAll('button')].filter(x => /Đã hiểu/.test(x.textContent)).forEach(x => x.click()); });

  // 2. Bài vỡ
  await setup();
  const sh = await page.evaluate(async () => {
    const { remove, E, clearSpell } = memeAnime.tcgCore;
    const hostLive = () => ({ s: document.querySelectorAll('#fxCinema .cin-shard').length, d: document.querySelectorAll('#fxCinema .cin-dust').length, c: document.querySelectorAll('#fxCinema .cin-crack').length });
    const e = E('enemy').find(x => x.slot.id === 'AN-battle_ox');
    remove('enemy', e, 'effect'); await new Promise(r => setTimeout(r, 90));
    return { after: hostLive(), grave: duel.enemy.grave.includes('AN-battle_ox') };
  });
  chk(sh.after.s === 12 && sh.after.d >= 10 && sh.after.c === 1 && sh.grave, 'quái bị phá: nứt, 12 mảnh, bụi và vào Mộ ' + JSON.stringify(sh));
  if (shots) { await new Promise(r => setTimeout(r, 240)); await page.screenshot({ path: 'scratch/fx-shatter.png' }); }
  await new Promise(r => setTimeout(r, 2000)); // hạt bụi lâu nhất sống ~1,76 giây
  const clean = await page.evaluate(() => document.querySelectorAll('#fxCinema > *').length);
  chk(clean === 0, 'lớp hiệu ứng tự dọn sạch (' + clean + ')');

  // 3. Spell vỡ
  await setup();
  const sp = await page.evaluate(async () => { memeAnime.tcgCore.clearSpell('enemy', 0); await new Promise(r => setTimeout(r, 60)); return document.querySelectorAll('#fxCinema .cin-shard').length; });
  chk(sp === 12, 'phép/bẫy bị phá cũng vỡ');

  // 4. Cut-in
  await setup();
  const cut = await page.evaluate(async () => {
    const f = memeFxCinema.cutFor;
    return {
      trap: f({ owner: 'player', cardId: 'AN-mirror_force', kind: 'trap' })?.action, set: f({ owner: 'player', cardId: 'AN-mirror_force', kind: 'set' }),
      boss: f({ owner: 'enemy', cardId: 'AN-blue_eyes_white_dragon', kind: 'summon' })?.action, small: f({ owner: 'player', cardId: 'AN-kuriboh', kind: 'summon' })
    };
  });
  chk(cut.trap === 'trap' && !cut.set && cut.boss === 'summon' && !cut.small, 'cut-in đúng ngữ cảnh ' + JSON.stringify(cut));
  await page.evaluate(() => { memeFxCinema.cutIn(1, '召喚！', 'Rồng Trắng Mắt Xanh'); });
  await new Promise(r => setTimeout(r, 300));
  const c2 = await page.evaluate(() => { const e = document.querySelector('.cin-eyes'); return e ? { bg: getComputedStyle(e).backgroundImage.slice(-24), h: document.querySelector('.cin-strip').getBoundingClientRect().height } : null; });
  chk(c2 && /kaiba\.webp/.test(c2.bg) && c2.h > 80, 'dải mắt Kaiba hiện ' + JSON.stringify(c2));
  if (shots) await page.screenshot({ path: 'scratch/fx-cutin.png' });
  await new Promise(r => setTimeout(r, 900));

  // 5. Lá core tấn công
  await setup();
  await page.evaluate(() => { memeFxCinema.impact({ x: 550, y: 300 }, '#ffe89a', false); });
  await new Promise(r => setTimeout(r, 60));
  chk(await page.evaluate(() => document.querySelectorAll('#fxCinema .cin-flash').length === 1), 'lóe sáng khi lá core tấn công');
  if (shots) { await new Promise(r => setTimeout(r, 200)); await page.screenshot({ path: 'scratch/fx-impact.png' }); }

  // 6. Giọng: chỉ tiếng Nhật, không gọi clip cũ
  const voice = await page.evaluate(() => {
    const L = memeJaVoice.LINES, codes = Object.keys(L), latin = /[A-Za-zÀ-ỹ]/;
    const badLines = codes.flatMap(c => Object.values(L[c]).filter(x => latin.test(x) || !/[\u3040-\u30ff\u4e00-\u9fff]/.test(x)));
    window.memeDialogue?.show?.('player', 'x', 1, 'AN-blue_eyes_white_dragon', 'AN-blue_eyes_white_dragon');
    memeJaVoice.say(1, 'trap');
    return { codes: codes.length, full: codes.every(c => ['skill', 'summon', 'trap', 'attack', 'victory', 'defeat'].every(k => L[c][k])), badLines };
  });
  await new Promise(r => setTimeout(r, 300));
  chk(voice.codes === 13 && voice.full && !voice.badLines.length, 'đủ 13 nhân vật, 6 ngữ cảnh, toàn tiếng Nhật ' + JSON.stringify(voice.badLines));
  chk(!reqs.some(u => !u.startsWith('ja/')), 'không gọi clip giọng cũ: ' + JSON.stringify(reqs.slice(0, 4)));

  if (errs.length) { bad++; console.log('pageerrors', errs.slice(0, 4)); }
  console.log(bad ? 'FAILED ' + bad : 'test-cinema: OK');
  await b.close(); server.close(); process.exit(bad ? 1 : 0);
})();
