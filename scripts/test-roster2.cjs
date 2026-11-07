// Kiểm tra từng lá đợt nhân vật mới (Marik, Jack, Shark, Chazz) theo đúng văn bản TCG, cùng bộ bài và kỹ năng.
const path = require('path'), fs = require('fs'), http = require('http'), puppeteer = require('puppeteer');
const pub = path.resolve(__dirname, '..', 'dist');
const server = http.createServer((req, res) => { const f = path.resolve(pub, '.' + new URL(req.url, 'http://l').pathname.replace(/^\/$/, '/memecard.html')); fs.readFile(f, (e, d) => { if (e) return res.writeHead(404).end(); res.end(d); }); });
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const b = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const page = await b.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
  await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
  await page.waitForFunction(() => window.memeRoster2 && window.memeAnime?.tcgCore, { timeout: 30000 });
  const out = await page.evaluate(async () => {
    const R = [], ok = (c, m) => R.push([!!c, m]);
    memeMusic.setEnabled(false); memeAnime.setAuto(true);
    const { E, stat, remove } = memeAnime.tcgCore, A = memeAnime;
    const reset = (hp = 'Marik · Kinh điển') => {
      clearTimeout(aiTimer); memeFx.reset(); closeModal();
      duel = { player: blankSide(MEME_DECK_PRESETS[hp], [], 0), enemy: blankSide(MEME_DECK_PRESETS['Kaiba · Kinh điển'], [], 1), turn: 'player', phase: 'MAIN1', round: 3, normalSummoned: false, mode: null, pending: null, selected: null, logs: [], finished: false };
      for (const n of ['player', 'enemy']) { const s = duel[n]; s.hand = []; s.grave = []; s.banished = []; s.deck = []; s.monsters = [null, null, null]; s.spells = [null, null, null]; s.field = null; s.extra = null; s.extraDeck = []; }
      $('lobby')?.classList.add('hidden'); $('duel')?.classList.remove('hidden');
      return duel.player;
    };
    const put = (n, i, id, pos = 'atk') => { const s = monsterSlot(id, pos); s.summonedRound = 1; memeAnime.tcgCore.uid?.(s); duel[n].monsters[i] = s; return s; };
    const fight = async (o, i, t) => { await A.perform(() => A.battle(o, i, false, t)); await A.tcgCore.flush(); };
    const run = fn => A.perform(fn);

    // Dữ liệu: khớp TCG
    const stats = { 'AN-gil_garth': [4, 1800, 1200], 'AN-newdoria': [4, 1200, 800], 'AN-mystic_tomato': [4, 1400, 1100], 'AN-giant_germ': [2, 1000, 100], 'AN-mask_of_darkness': [2, 900, 400], 'AN-red_resonator': [2, 600, 200], 'AN-dark_resonator': [3, 1300, 300], 'AN-mad_archfiend': [4, 1800, 0], 'AN-power_invader': [5, 2200, 0], 'AN-big_jaws': [3, 1800, 300], 'AN-hammer_shark': [4, 1700, 1500], 'AN-shark_stickers': [3, 200, 1000], 'AN-armed_dragon_lv3': [3, 1200, 900], 'AN-armed_dragon_lv5': [5, 2400, 1700], 'AN-armed_dragon_lv7': [7, 2800, 1000], 'AN-chthonian_soldier': [4, 1200, 1400] };
    ok(Object.entries(stats).every(([id, [l, a, d]]) => { const c = card(id); return c && c.stars === l && c.atk === a && c.def === d; }), 'chỉ số 16 lá khớp TCG');
    ok(HEROES.length === 13 && validHero(12), 'có 13 nhân vật: ' + HEROES.length);
    for (const name of ['Marik · Kinh điển', 'Jack · Kinh điển', 'Shark · Kinh điển', 'Chazz · Kinh điển']) { const p = deckProblem(MEME_DECK_PRESETS[name], MEME_EXTRA_PRESETS[name]); ok(!p, 'bộ bài hợp lệ ' + name + (p ? ': ' + p : '')); }

    // Newdoria
    let P = reset(); let n1 = put('player', 0, 'AN-newdoria'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); put('enemy', 1, 'AN-gil_garth'); duel.turn = 'enemy';
    await fight('enemy', 0, 0);
    ok(P.grave.includes('AN-newdoria') && E('enemy').length + E('player').length === 1, 'Newdoria: chết trong chiến đấu phá 1 quái trên sân');
    // Tomato
    P = reset(); put('player', 0, 'AN-mystic_tomato'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); P.deck = ['AN-gil_garth', 'AN-giant_germ', 'AN-newdoria']; duel.turn = 'enemy';
    await fight('enemy', 0, 0);
    const tm = P.monsters.filter(Boolean)[0]; ok(tm && ['AN-giant_germ', 'AN-newdoria'].includes(tm.id) && tm.position === 'atk' && P.deck.length === 2, 'Cà Chua: gọi quái ÁM ATK ≤1500, không gọi Gil Garth');
    // Tomato: phá bằng hiệu ứng thì không kích hoạt
    P = reset(); const t2 = put('player', 0, 'AN-mystic_tomato'); P.deck = ['AN-newdoria'];
    await run(async () => { remove('player', E('player')[0], 'effect'); await A.tcgCore.flush(); });
    ok(!P.monsters.some(Boolean) && P.deck.length === 1, 'Cà Chua: bị phá bằng hiệu ứng thì không kích hoạt');
    // Germ
    P = reset(); put('player', 0, 'AN-giant_germ'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); P.deck = ['AN-giant_germ', 'AN-giant_germ', 'AN-gil_garth']; duel.turn = 'enemy'; let elp = duel.enemy.lp;
    await fight('enemy', 0, 0);
    ok(duel.enemy.lp === elp - 500 && P.monsters.filter(s => s?.id === 'AN-giant_germ').length === 2, 'Vi Khuẩn: 500 sát thương, gọi thêm từ Bộ bài');
    // Mask
    P = reset(); const mk = put('player', 0, 'AN-mask_of_darkness', 'def_down'); P.grave = ['AN-mirror_force', 'AN-gil_garth'];
    await run(async () => { mk.position = 'def'; await A.postSummon('player', mk, 'flip'); });
    ok(P.hand.includes('AN-mirror_force') && !P.grave.includes('AN-mirror_force'), 'Mặt Nạ: LẬT lấy Bẫy từ Mộ');

    // Red Resonator
    P = reset(); P.hand = ['AN-red_resonator', 'AN-mad_archfiend', 'AN-power_invader'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); await A.tcgCore.flush();
    ok(P.monsters.some(s => s?.id === 'AN-mad_archfiend') && P.hand.includes('AN-power_invader'), 'Cộng Hưởng Đỏ: Triệu hồi Thường gọi quái Cấp ≤4, không gọi Cấp 5');
    P = reset(); const rr = put('player', 0, 'AN-red_resonator'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); let lp0 = P.lp;
    await run(() => A.postSummon('player', rr, 'special'));
    ok(P.lp === lp0 + 3000, 'Cộng Hưởng Đỏ: Triệu hồi Đặc biệt nhận LP bằng ATK cao nhất đã chọn: +' + (P.lp - lp0));
    // Dark Resonator
    P = reset(); const dr = put('player', 0, 'AN-dark_resonator'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); duel.turn = 'enemy';
    await fight('enemy', 0, 0);
    ok(E('player').some(e => e.slot === dr), 'Cộng Hưởng Bóng Tối: sống sót lần đầu');
    // Mad Archfiend
    P = reset(); const ma = put('player', 0, 'AN-mad_archfiend'); put('enemy', 0, 'AN-gil_garth'); const lpm = P.lp; duel.turn = 'enemy';
    await fight('enemy', 0, 0);
    ok(ma.position === 'def' && P.lp === lpm, 'Quỷ Điên: bị tấn công chuyển thế thủ, không mất LP (ATK 1800 vs DEF 0 chỉ phá lá): LP ' + P.lp);
    P = reset(); put('player', 0, 'AN-mad_archfiend'); put('enemy', 0, 'AN-giant_germ', 'def'); let e0 = duel.enemy.lp;
    await fight('player', 0, 0);
    ok(duel.enemy.lp === e0 - 1700, 'Quỷ Điên: xuyên giáp 1700: ' + (e0 - duel.enemy.lp));
    // Power Invader
    P = reset(); put('enemy', 0, 'AN-gil_garth'); put('enemy', 1, 'AN-gil_garth'); P.hand = ['AN-power_invader'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); ok(P.monsters.some(s => s?.id === 'AN-power_invader'), 'Kẻ Xâm Lăng: đối thủ ≥2 quái thì không cần Hiến tế');
    P = reset(); put('enemy', 0, 'AN-gil_garth'); P.hand = ['AN-power_invader'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); ok(!P.monsters.some(Boolean), 'Kẻ Xâm Lăng: đối thủ 1 quái thì vẫn cần Hiến tế');
    // Red Dragon Archfiend
    P = reset(); const rda = put('player', 0, 'AN-red_dragon_archfiend'); put('enemy', 0, 'AN-giant_germ', 'def'); put('enemy', 1, 'AN-gil_garth', 'def'); put('enemy', 2, 'AN-blue_eyes_white_dragon', 'atk');
    await fight('player', 0, 0);
    ok(!E('enemy').some(e => e.slot.position !== 'atk') && E('enemy').length === 1, 'Rồng Quỷ Đỏ: tấn công thế thủ phá mọi quái thế thủ, còn ' + E('enemy').length);
    P = reset(); const rd2 = put('player', 0, 'AN-red_dragon_archfiend'); const idle = put('player', 1, 'AN-gil_garth'); const atkd = put('player', 2, 'AN-newdoria'); atkd.attacksUsed = 1; rd2.attacksUsed = 1;
    await run(() => A.onEndTurn('player'));
    ok(!E('player').some(e => e.slot === idle) && E('player').some(e => e.slot === atkd) && E('player').some(e => e.slot === rd2), 'Rồng Quỷ Đỏ: End Phase phá quái không tấn công, giữ quái đã tấn công');

    // Big Jaws
    P = reset('Shark · Kinh điển'); const bj = put('player', 0, 'AN-big_jaws'); bj.attacksUsed = 1; const bj2 = put('player', 1, 'AN-big_jaws');
    await run(() => A.onEndTurn('player'));
    ok(P.banished.includes('AN-big_jaws') && E('player').some(e => e.slot === bj2) && !P.grave.includes('AN-big_jaws'), 'Hàm Lớn: đã tấn công thì bị trục xuất, chưa tấn công thì ở lại');
    // Hammer Shark
    P = reset('Shark · Kinh điển'); const hs = put('player', 0, 'AN-hammer_shark'); P.hand = ['AN-gil_garth', 'AN-big_jaws'];
    await run(() => A.resolveEffect('player', card('AN-hammer_shark'), { source: hs }));
    ok(P.monsters.some(s => s?.id === 'AN-big_jaws') && hs.levelFixed === 3 && P.hand.includes('AN-gil_garth'), 'Cá Mập Búa: giảm Cấp, gọi quái THỦY Cấp ≤3');
    // Stickers
    P = reset('Shark · Kinh điển'); P.hand = ['AN-big_jaws', 'AN-shark_stickers'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); await A.tcgCore.flush();
    ok(P.monsters.some(s => s?.id === 'AN-shark_stickers') && P.hand.length === 0, 'Cá Bám: gọi từ tay khi quái Cá được triệu hồi');
    // Xyz
    P = reset('Shark · Kinh điển'); P.extraDeck = ['AN-black_ray_lancer']; const a1 = put('player', 0, 'AN-big_jaws'), a2 = put('player', 1, 'AN-gil_garth');
    a2.levelFixed = 3; ok(A.xyzOptions ? A.xyzOptions('player', 'AN-black_ray_lancer').length === 0 : true, 'Thương Thủ: quái Cấp 3 không phải THỦY không làm nguyên liệu');
    put('player', 1, 'AN-shark_stickers'); ok(A.xyzOptions ? A.xyzOptions('player', 'AN-black_ray_lancer').length === 1 : true, 'Thương Thủ: 2 quái THỦY Cấp 3 thì Xyz được');
    P = reset('Shark · Kinh điển'); const la = put('player', 0, 'AN-black_ray_lancer'); la.materials = ['AN-big_jaws', 'AN-big_jaws']; const v = put('enemy', 0, 'AN-gil_garth');
    await run(() => A.resolveEffect('player', card('AN-black_ray_lancer'), { source: la }));
    ok(la.materials.length === 1 && P.grave.includes('AN-big_jaws') && v.negatedUntil === duel.round, 'Thương Thủ: tách nguyên liệu, vô hiệu hóa mục tiêu');
    // Number 32
    P = reset('Shark · Kinh điển'); const dk = put('player', 0, 'AN-number_32_shark_drake'); dk.materials = ['AN-big_jaws']; put('enemy', 0, 'AN-gil_garth');
    await fight('player', 0, 0);
    const back = duel.enemy.monsters.find(Boolean);
    ok(back?.id === 'AN-gil_garth' && back.position === 'atk' && stat('enemy', back) === 800 && dk.materials.length === 0 && window.memeRules.canAttack(dk), 'Số 32: hồi sinh quái mất 1000 ATK, được đánh tiếp: ATK ' + (back ? stat('enemy', back) : '-'));
    duel.round += 1; ok(back && stat('enemy', back) === 800, 'Số 32: quái vẫn mất 1000 ATK ở lượt sau: ' + (back ? stat('enemy', back) : '-'));

    // Armed Dragon
    P = reset('Chazz · Kinh điển'); const l3 = put('player', 0, 'AN-armed_dragon_lv3'); P.deck = ['AN-armed_dragon_lv5', 'AN-gil_garth'];
    await run(() => A.onStartTurn('player'));
    ok(P.monsters.some(s => s?.id === 'AN-armed_dragon_lv5') && P.grave.includes('AN-armed_dragon_lv3'), 'LV3: Standby tiến hóa thành LV5');
    P = reset('Chazz · Kinh điển'); const l5 = put('player', 0, 'AN-armed_dragon_lv5'); put('enemy', 0, 'AN-gil_garth'); const big = put('enemy', 1, 'AN-blue_eyes_white_dragon'); P.hand = ['AN-gil_garth'];
    await run(() => A.resolveEffect('player', card('AN-armed_dragon_lv5'), { source: l5 }));
    ok(E('enemy').length === 1 && E('enemy')[0].slot === big && P.grave.includes('AN-gil_garth'), 'LV5: bỏ quái ATK 1800, phá quái ATK ≤1800, không phá 3000');
    P = reset('Chazz · Kinh điển'); const l5b = put('player', 0, 'AN-armed_dragon_lv5'); l5b.destroyedBattleRound = duel.round; P.deck = ['AN-armed_dragon_lv7'];
    await run(() => A.onEndTurn('player'));
    ok(P.monsters.some(s => s?.id === 'AN-armed_dragon_lv7'), 'LV5: phá quái trong chiến đấu thì End Phase tiến hóa LV7');
    P = reset('Chazz · Kinh điển'); P.hand = ['AN-armed_dragon_lv7'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); ok(!P.monsters.some(Boolean), 'LV7: không thể Triệu hồi Thường');
    P = reset('Chazz · Kinh điển'); const l7 = put('player', 0, 'AN-armed_dragon_lv7'); put('enemy', 0, 'AN-gil_garth'); put('enemy', 1, 'AN-giant_germ'); const b2 = put('enemy', 2, 'AN-blue_eyes_white_dragon'); P.hand = ['AN-power_invader'];
    await run(() => A.resolveEffect('player', card('AN-armed_dragon_lv7'), { source: l7 }));
    ok(E('enemy').length === 1 && E('enemy')[0].slot === b2, 'LV7: bỏ quái ATK 2200, phá hết quái ATK ≤2200');
    // Chthonian
    P = reset('Chazz · Kinh điển'); put('player', 0, 'AN-chthonian_soldier'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); duel.turn = 'enemy'; const pl = P.lp, en = duel.enemy.lp;
    await fight('enemy', 0, 0);
    ok(pl - P.lp === 1800 && en - duel.enemy.lp === 1800, 'Chiến Sĩ Âm Phủ: trả lại 1800 sát thương cho đối thủ: ' + (en - duel.enemy.lp));

    // Kỹ năng
    P = reset('Marik · Kinh điển'); P.heroId = 9; P.deck = ['AN-mystic_tomato']; P.hand = ['AN-gil_garth']; const lps = P.lp;
    await run(() => A.skillFor('player'));
    ok(P.hand.includes('AN-mystic_tomato') && P.lp < lps, 'Kỹ năng Marik: trả LP, đổi bài');
    return R;
  });
  let bad = 0; for (const [c, m] of out) { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; }
  if (errs.length) { bad++; console.log('pageerrors', errs.slice(0, 5)); }
  console.log(bad ? 'FAILED ' + bad : 'test-roster2: OK (' + out.length + ')');
  await b.close(); server.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(2); });
