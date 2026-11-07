// Kiểm tra từng lá đợt anime + meta của Marik, Jack, Shark, Chazz, gồm cả trường hợp KHÔNG được kích hoạt.
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
    const { E, stat } = memeAnime.tcgCore, A = memeAnime, Rules = window.memeRules;
    const reset = () => {
      clearTimeout(aiTimer); memeFx.reset(); closeModal();
      duel = { player: blankSide(MEME_DECK_PRESETS['Marik · Kinh điển'], [], 0), enemy: blankSide(MEME_DECK_PRESETS['Kaiba · Kinh điển'], [], 1), turn: 'player', phase: 'MAIN1', round: 3, normalSummoned: false, mode: null, pending: null, selected: null, logs: [], finished: false };
      for (const n of ['player', 'enemy']) { const s = duel[n]; s.hand = []; s.grave = []; s.banished = []; s.deck = []; s.monsters = [null, null, null]; s.spells = [null, null, null]; s.field = null; s.extra = null; s.extraDeck = []; }
      $('lobby')?.classList.add('hidden'); $('duel')?.classList.remove('hidden');
      return duel.player;
    };
    const put = (n, i, id, pos = 'atk') => { const s = monsterSlot(id, pos); s.summonedRound = 1; A.tcgCore.uid?.(s); duel[n].monsters[i] = s; return s; };
    const run = fn => A.perform(fn), play = (i = 0) => run(() => A.playSpellFor('player', i));
    const has = id => duel.player.monsters.some(s => s?.id === id);

    for (const name of ['Marik · Kinh điển', 'Marik · Meta', 'Jack · Kinh điển', 'Jack · Meta', 'Shark · Kinh điển', 'Shark · Meta', 'Chazz · Kinh điển', 'Chazz · Meta']) { const p = deckProblem(MEME_DECK_PRESETS[name], MEME_EXTRA_PRESETS[name]); ok(!p, 'bộ bài hợp lệ ' + name + ' (' + MEME_DECK_PRESETS[name].length + ')' + (p ? ': ' + p : '')); }
    const st = { 'AN-bowganian': [3, 1300, 1000], 'AN-drillago': [4, 1600, 1100], 'AN-legendary_fiend': [6, 1500, 1800], 'AN-worm_drake': [4, 1400, 1500], 'AN-humanoid_slime': [4, 800, 2000], 'AN-humanoid_worm_drake': [7, 2200, 2000], 'AN-red_sprinter': [4, 1700, 1200], 'AN-creation_resonator': [3, 800, 600], 'AN-hot_red_dragon_archfiend': [8, 3000, 2000], 'AN-spear_shark': [4, 1600, 1400], 'AN-double_shark': [4, 1200, 1600], 'AN-deep_sea_diva': [2, 200, 400], 'AN-armed_dragon_lv10': [10, 3000, 2000], 'AN-v_tiger_jet': [4, 1600, 1800] };
    ok(Object.entries(st).every(([id, [l, a, d]]) => { const c = card(id); return c && c.stars === l && c.atk === a && c.def === d; }), 'chỉ số lá mới khớp TCG');

    // Marik
    let P = reset(); put('player', 0, 'AN-bowganian'); let lp = duel.enemy.lp; await run(() => A.onStartTurn('player'));
    ok(duel.enemy.lp === lp - 600, 'Cung Thủ Máy: 600 sát thương ở Standby');
    P = reset(); const v = put('player', 0, 'AN-bowganian'); v.negatedUntil = duel.round; lp = duel.enemy.lp; await run(() => A.onStartTurn('player'));
    ok(duel.enemy.lp === lp, 'Cung Thủ Máy: bị vô hiệu thì không gây sát thương');
    P = reset(); const lf = put('player', 0, 'AN-legendary_fiend'); await run(() => A.onStartTurn('player')); await run(() => A.onStartTurn('player'));
    ok(stat('player', lf) === 2900, 'Quỷ Huyền Thoại: +700 mỗi Standby, cộng dồn: ' + stat('player', lf));
    P = reset(); const dg = put('player', 0, 'AN-drillago'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); ok(A.tcgCore.directAllowed('player', dg), 'Drillago: đối thủ chỉ có quái ATK ≥1600 thì đánh trực tiếp được');
    put('enemy', 1, 'AN-bowganian'); ok(!A.tcgCore.directAllowed('player', dg), 'Drillago: có quái ATK <1600 thì không');
    duel.enemy.monsters[1] = null; duel.enemy.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 1 }; ok(!A.tcgCore.directAllowed('player', dg), 'Drillago: đối thủ có Phép/Bẫy thì không');
    P = reset(); P.hand = ['AN-tribute_to_the_doomed', 'AN-gil_garth']; put('enemy', 0, 'AN-blue_eyes_white_dragon');
    await play(); ok(!E('enemy').length && P.grave.includes('AN-gil_garth') && P.grave.includes('AN-tribute_to_the_doomed') && !P.hand.length, 'Vật Tế: bỏ 1 lá, phá 1 quái');
    P = reset(); P.hand = ['AN-tribute_to_the_doomed']; put('enemy', 0, 'AN-blue_eyes_white_dragon');
    await play(); ok(E('enemy').length === 1 && P.hand.length === 1, 'Vật Tế: không có lá để bỏ thì từ chối, không mất lá');
    P = reset(); P.extraDeck = ['AN-humanoid_worm_drake']; P.hand = ['AN-polymerization', 'AN-worm_drake', 'AN-humanoid_slime'];
    await play(); ok(P.extra?.id === 'AN-humanoid_worm_drake' || has('AN-humanoid_worm_drake'), 'Giun Rồng Hình Người: Dung Hợp được');

    // Jack
    P = reset(); P.deck = ['AN-gil_garth', 'AN-red_resonator']; P.hand = ['AN-resonator_call'];
    await play(); ok(P.hand.includes('AN-red_resonator') && P.deck.length === 1, 'Tiếng Gọi Cộng Hưởng: chỉ lấy quái Resonator');
    P = reset(); P.deck = ['AN-gil_garth']; P.hand = ['AN-resonator_call'];
    await play(); ok(P.hand.includes('AN-resonator_call'), 'Tiếng Gọi Cộng Hưởng: không có quái thì từ chối');
    P = reset(); P.hand = ['AN-scarlet_security']; duel.enemy.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 1 };
    await play(); ok(P.hand.length === 1 && duel.enemy.spells[0], 'Hàng Rào Đỏ Thẫm: không có Rồng Quỷ Đỏ thì từ chối');
    put('player', 0, 'AN-red_dragon_archfiend'); await play(); ok(!duel.enemy.spells[0] && !P.hand.length, 'Hàng Rào Đỏ Thẫm: phá hết Phép/Bẫy đối thủ');
    P = reset(); P.hand = ['AN-red_sprinter']; P.grave = ['AN-dark_resonator', 'AN-gil_garth'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); await A.tcgCore.flush();
    ok(has('AN-dark_resonator') && P.grave.includes('AN-gil_garth'), 'Quỷ Đỏ Nước Rút: gọi Tuner Quỷ từ Mộ');
    P = reset(); put('player', 1, 'AN-gil_garth'); P.hand = ['AN-red_sprinter']; P.grave = ['AN-dark_resonator'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); await A.tcgCore.flush();
    ok(!has('AN-dark_resonator'), 'Quỷ Đỏ Nước Rút: có quái khác thì không kích hoạt');
    P = reset(); P.hand = ['AN-creation_resonator']; ok(!A.specialMode('player', card('AN-creation_resonator')), 'Cộng Hưởng Sáng Tạo: chưa có Đồng Bộ Cấp 8 thì không gọi được');
    put('player', 0, 'AN-red_dragon_archfiend'); await run(() => A.specialSummon('player', 0)); ok(has('AN-creation_resonator') && !P.hand.length, 'Cộng Hưởng Sáng Tạo: có Đồng Bộ Cấp 8 thì gọi từ tay');
    P = reset(); const hr = put('player', 0, 'AN-hot_red_dragon_archfiend'), mate = put('player', 1, 'AN-gil_garth', 'def'), own = put('player', 2, 'AN-gil_garth'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); const fd = put('enemy', 1, 'AN-gil_garth', 'def');
    await run(() => A.resolveEffect('player', card('AN-hot_red_dragon_archfiend'), { source: hr }));
    ok(E('enemy').length === 1 && E('enemy')[0].slot === fd && !E('player').some(e => e.slot === own) && E('player').some(e => e.slot === hr), 'Rồng Quỷ Đỏ Rực: phá quái thế tấn công cả hai bên, trừ chính nó');
    ok(!Rules.canAttack(mate) && Rules.canAttack(hr), 'Rồng Quỷ Đỏ Rực: quái khác không tấn công được');
    P = reset(); duel.phase = 'MAIN2'; const hr2 = put('player', 0, 'AN-hot_red_dragon_archfiend'); put('enemy', 0, 'AN-gil_garth');
    await run(() => A.resolveEffect('player', card('AN-hot_red_dragon_archfiend'), { source: hr2 })); ok(E('enemy').length === 1, 'Rồng Quỷ Đỏ Rực: chỉ dùng trong Main Phase 1');

    // Shark
    P = reset(); P.extraDeck = ['AN-number_47_nightmare_shark']; const ba = put('player', 0, 'AN-bahamut_shark'); ba.materials = ['AN-big_jaws'];
    await run(() => A.resolveEffect('player', card('AN-bahamut_shark'), { source: ba }));
    ok(has('AN-number_47_nightmare_shark') && !P.extraDeck.length && !ba.materials.length && !Rules.canAttack(ba), 'Cá Mập Bahamut: tách nguyên liệu, gọi Xyz THỦY Bậc ≤3, không tấn công được');
    P = reset(); P.extraDeck = ['AN-number_32_shark_drake', 'AN-black_ray_lancer']; const bb = put('player', 0, 'AN-bahamut_shark'); bb.materials = ['AN-big_jaws'];
    await run(() => A.resolveEffect('player', card('AN-bahamut_shark'), { source: bb })); ok(bb.materials.length === 1, 'Cá Mập Bahamut: không gọi Xyz Bậc 4 hay Xyz hệ ÁM');
    P = reset(); const n47 = put('player', 0, 'AN-number_47_nightmare_shark'); P.hand = ['AN-big_jaws']; n47.materials = [];
    await run(() => A.postSummon('player', n47, 'special')); ok(n47.materials.includes('AN-big_jaws') && !P.hand.length, 'Số 47: gắn quái THỦY Cấp 3 khi Triệu hồi Đặc biệt');
    const fish = put('player', 1, 'AN-big_jaws'), other2 = put('player', 2, 'AN-gil_garth'); put('enemy', 0, 'AN-blue_eyes_white_dragon');
    await run(() => A.resolveEffect('player', card('AN-number_47_nightmare_shark'), { source: n47 }));
    const directed = [n47, fish].find(s => s.directRound === duel.round); ok(directed && A.tcgCore.directAllowed('player', directed) && !n47.materials.length && !Rules.canAttack(other2), 'Số 47: quái THỦY đánh trực tiếp, quái khác không tấn công');
    P = reset(); const b1 = put('player', 0, 'AN-big_jaws'); P.hand = ['AN-spear_shark'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); await A.tcgCore.flush(); ok(b1.levelFixed === 4 && card('AN-spear_shark').traits.includes('piercing'), 'Cá Mập Giáo: tăng Cấp quái Cá Cấp 3');
    P = reset(); const b2 = put('player', 0, 'AN-spear_shark'); P.hand = ['AN-double_shark'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); await A.tcgCore.flush(); ok(b2.levelFixed === 3 && P.monsters.find(s => s?.id === 'AN-double_shark')?.levelFixed === 3, 'Cá Mập Kép: giảm Cấp mọi quái Cá Cấp 4, kể cả chính nó');
    P = reset(); P.hand = ['AN-deep_sea_diva']; P.deck = ['AN-deep_sea_diva', 'AN-big_jaws'];
    await run(() => A.normalSummon('player', 0, 'atk', [])); await A.tcgCore.flush(); ok(P.monsters.filter(s => s?.id === 'AN-deep_sea_diva').length === 2 && P.deck.includes('AN-big_jaws'), 'Ca Sĩ Biển Sâu: chỉ gọi quái Hải Long Cấp ≤3');
    P = reset(); P.hand = ['AN-moray_of_greed', 'AN-big_jaws', 'AN-hammer_shark']; P.deck = ['AN-gil_garth', 'AN-gil_garth', 'AN-gil_garth'];
    await play(); ok(P.hand.length === 3 && P.grave.includes('AN-moray_of_greed') && P.deck.length === 2, 'Lươn Tham Lam: xáo 2, rút 3: tay ' + P.hand.length);
    P = reset(); P.hand = ['AN-moray_of_greed', 'AN-big_jaws']; await play(); ok(P.hand.length === 2, 'Lươn Tham Lam: thiếu quái THỦY thì từ chối');
    P = reset(); const aj = put('player', 0, 'AN-big_jaws'); P.hand = ['AN-aqua_jet']; await play(); duel.round += 1; ok(stat('player', aj) === 2800, 'Tên Lửa Nước: +1000 ATK lâu dài: ' + stat('player', aj));
    P = reset(); put('player', 0, 'AN-gil_garth'); P.hand = ['AN-aqua_jet']; await play(); ok(P.hand.length === 1, 'Tên Lửa Nước: quái khác tộc thì từ chối');

    // Chazz
    P = reset(); put('player', 0, 'AN-armed_dragon_lv7'); P.hand = ['AN-armed_dragon_lv10'];
    await run(() => A.specialSummon('player', 0)); await A.tcgCore.flush();
    ok(has('AN-armed_dragon_lv10') && !has('AN-armed_dragon_lv7') && !P.hand.length, 'LV10: Hiến tế LV7 để gọi từ tay');
    P = reset(); P.hand = ['AN-armed_dragon_lv10']; ok(!A.specialMode('player', card('AN-armed_dragon_lv10')), 'LV10: không có LV7 thì không gọi được');
    await run(() => A.normalSummon('player', 0, 'atk', [])); ok(!has('AN-armed_dragon_lv10'), 'LV10: không Triệu hồi Thường');
    P = reset(); const l10 = put('player', 0, 'AN-armed_dragon_lv10'); put('enemy', 0, 'AN-blue_eyes_white_dragon'); const down = put('enemy', 1, 'AN-gil_garth', 'def_down'); P.hand = ['AN-ojama_black'];
    await run(() => A.resolveEffect('player', card('AN-armed_dragon_lv10'), { source: l10 })); ok(E('enemy').length === 1 && E('enemy')[0].slot === down && P.grave.includes('AN-ojama_black'), 'LV10: bỏ 1 lá, phá mọi quái ngửa, chừa quái úp');
    P = reset(); put('player', 0, 'AN-armed_dragon_lv3'); P.hand = ['AN-level_up']; P.deck = ['AN-armed_dragon_lv5'];
    await play(); ok(has('AN-armed_dragon_lv5') && P.grave.includes('AN-armed_dragon_lv3') && P.grave.includes('AN-level_up'), 'Lên Cấp!: LV3 thành LV5');
    P = reset(); put('player', 0, 'AN-armed_dragon_lv5'); P.hand = ['AN-level_up', 'AN-armed_dragon_lv7'];
    await play(); ok(has('AN-armed_dragon_lv7') && !P.hand.includes('AN-armed_dragon_lv7'), 'Lên Cấp!: bỏ qua điều kiện, gọi LV7 từ tay');
    P = reset(); put('player', 0, 'AN-gil_garth'); P.hand = ['AN-level_up']; await play(); ok(P.hand.length === 1, 'Lên Cấp!: không có quái LV thì từ chối');
    P = reset(); P.hand = ['AN-level_modulation']; P.grave = ['AN-armed_dragon_lv7']; duel.enemy.deck = ['AN-gil_garth', 'AN-gil_garth']; const eh = duel.enemy.hand.length;
    await play(); const mod = P.monsters.find(s => s?.id === 'AN-armed_dragon_lv7'); ok(mod && duel.enemy.hand.length === eh + 2 && !Rules.canAttack(mod) && mod.negatedUntil === duel.round, 'Điều Biến Cấp: đối thủ rút 2, hồi sinh LV nhưng không tấn công được');
    P = reset(); P.hand = ['AN-ojama_delta_hurricane']; put('player', 0, 'AN-ojama_green'); put('player', 1, 'AN-ojama_yellow'); put('enemy', 0, 'AN-blue_eyes_white_dragon');
    await play(); ok(E('enemy').length === 1 && P.hand.length === 1, 'Cuồng Phong Ojama: thiếu 1 Ojama thì từ chối');
    put('player', 2, 'AN-ojama_black'); duel.enemy.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 1 };
    await play(); ok(!E('enemy').length && !duel.enemy.spells[0], 'Cuồng Phong Ojama: phá toàn bộ sân đối thủ');
    P = reset(); P.hand = ['AN-ojamagic']; P.deck = ['AN-ojama_yellow', 'AN-ojama_green', 'AN-ojama_black', 'AN-gil_garth'];
    await run(async () => { A.tcgCore.takeDiscard('player', { id: 'AN-ojamagic', index: 0 }); await A.tcgCore.flush(); });
    ok(P.hand.length === 3 && P.deck.length === 1, 'Ojamagic: bị bỏ từ tay thì lấy 3 Ojama: tay ' + P.hand.length);
    P = reset(); P.hand = ['AN-ojamagic']; P.deck = ['AN-ojama_yellow']; const rr = await play(); ok(P.deck.length === 1, 'Ojamagic: không tự kích hoạt để lấy bài');
    return R;
  });
  let bad = 0; for (const [c, m] of out) { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; }
  if (errs.length) { bad++; console.log('pageerrors', errs.slice(0, 5)); }
  console.log(bad ? 'FAILED ' + bad : 'test-roster3: OK (' + out.length + ')');
  await b.close(); server.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(2); });
