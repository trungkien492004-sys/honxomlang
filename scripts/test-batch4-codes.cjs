const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Batch 4 (Missing Effect Codes & Fixes) Comprehensive Test Suite...\n');

function createDuelContext() {
  const makeEl = () => {
    const el = {
      innerHTML: '',
      textContent: '',
      appendChild: () => {},
      querySelectorAll: () => [],
      querySelector: () => null,
      closest: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      style: {},
      dataset: {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
      append: () => {},
      prepend: () => {},
      remove: () => {},
      children: []
    };
    el.children = [
      { dataset: {}, classList: { add: () => {}, remove: () => {} }, style: {}, querySelectorAll: () => [], appendChild: () => {} },
      { dataset: {}, classList: { add: () => {}, remove: () => {} }, style: {}, querySelectorAll: () => [], appendChild: () => {} },
      { dataset: {}, classList: { add: () => {}, remove: () => {} }, style: {}, querySelectorAll: () => [], appendChild: () => {} }
    ];
    return el;
  };

  const domContext = {
    window: {},
    document: {
      body: makeEl(),
      addEventListener: () => {},
      readyState: 'complete',
      querySelector: (sel = '') => (sel.includes('modal') ? null : makeEl()),
      querySelectorAll: () => [],
      getElementById: () => makeEl(),
      createElement: () => makeEl()
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    console
  };
  domContext.window = domContext;
  vm.createContext(domContext);

  // Load catalogs & engine dependencies in manifest order
  vm.runInContext(fs.readFileSync('assets/js/meme_catalog_anime.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_card_details.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_anime_heroes.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_phase3_catalog.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_duel_links_catalog.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_lp_costs.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_game.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_rules.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_anime_rules.js', 'utf8'), domContext);
  vm.runInContext(fs.readFileSync('assets/js/meme_duel_links_engine.js', 'utf8'), domContext);

  domContext.memeAnime.setAuto(true);
  domContext.memeServerChoice = (n, title, options, cfg = {}) => {
    if (cfg.multiple) return options.slice(0, cfg.max || 1);
    return options[0];
  };

  return domContext;
}

function setDuel(ctx, d) {
  if (!d.player.heroId) d.player.heroId = 'yugi';
  if (!d.enemy.heroId) d.enemy.heroId = 'kaiba';
  if (!d.logs) d.logs = [];
  ctx.window._duelToSet = d;
  vm.runInContext('duel = window._duelToSet;', ctx);
  ctx.duel = d;
  return d;
}

function initDuel(ctx) {
  const duelState = {
    round: 2,
    turn: 'player',
    phase: 'MAIN1',
    mode: null,
    pending: null,
    selected: null,
    finished: false,
    logs: [],
    player: {
      heroId: 'yugi',
      lp: 4000,
      hand: [],
      deck: [],
      monsters: [null, null, null],
      spells: [null, null, null],
      grave: [],
      banished: [],
      extraDeck: [],
      field: null
    },
    enemy: {
      heroId: 'kaiba',
      lp: 4000,
      hand: [],
      deck: [],
      monsters: [null, null, null],
      spells: [null, null, null],
      grave: [],
      banished: [],
      extraDeck: [],
      field: null
    }
  };

  return setDuel(ctx, duelState);
}

const scenarioCounts = {
  'DL-illusion_magic': 0,
  'DL-magicians_rod': 0,
  'DL-red_eyes_fang_with_chain': 0,
  'DL-red_eyes_fusion': 0,
  'DL-red_eyes_insight': 0,
  'DL-red_eyes_spirit': 0,
  'DL-return_of_the_red_eyes': 0,
  'DL-the_eye_of_timaeus': 0
};

async function runTests() {
  // =========================================================================
  // 1. DL-illusion_magic (Ma Thuật Ảo Ảnh)
  // =========================================================================
  console.log('--- Testing DL-illusion_magic ---');
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.monsters[0] = { id: 'AN-dark_magician', position: 'atk', uid: 1 };
    duel.player.deck = ['AN-dark_magician', 'AN-celtic_guardian'];
    duel.player.grave = ['AN-dark_magician'];
    duel.player.hand = ['DL-illusion_magic'];

    // Verify effect_code is in supported
    assert.ok(ctx.memeRules.supported.has('dl_illusion_magic'), 'dl_illusion_magic must be in supported');

    // Tribute monster and search 2 Dark Magicians (1 from deck, 1 from grave)
    const cardObj = ctx.card('DL-illusion_magic');
    const res = await ctx.memeAnime.resolveEffect('player', cardObj, { fromHand: true, handIndex: 0 });

    assert.ok(res, 'Illusion Magic must resolve successfully');
    assert.strictEqual(duel.player.monsters[0], null, 'Tributed Spellcaster removed from field');
    assert.strictEqual(duel.player.hand.filter(id => id === 'AN-dark_magician').length, 2, 'Added 2 Dark Magician to hand');
    scenarioCounts['DL-illusion_magic']++;
    console.log('  ✓ [DL-illusion_magic] Tributes Spellcaster, adds up to 2 Dark Magician from Deck/GY to hand');
  }

  // =========================================================================
  // 2. DL-magicians_rod (Gậy Phép Phù Thủy Áo Đen)
  // =========================================================================
  console.log('\n--- Testing DL-magicians_rod ---');
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.deck = ['DL-dark_magical_circle'];
    duel.player.hand = [];

    assert.ok(ctx.memeRules.supported.has('dl_magicians_rod'), 'dl_magicians_rod must be in supported');

    // Normal Summon triggers search
    const slot = { id: 'DL-magicians_rod', position: 'atk', uid: 2 };
    duel.player.monsters[0] = slot;
    await ctx.memeAnime.postSummon('player', slot, 'normal');

    assert.ok(duel.player.hand.includes('DL-dark_magical_circle'), 'Normal Summon searches DM Spell/Trap to hand');
    scenarioCounts['DL-magicians_rod']++;
    console.log('  ✓ [DL-magicians_rod] Normal Summon searches Dark Magician Spell/Trap from Deck');

    // Special Summon DOES NOT trigger search
    duel.player.hand = [];
    duel.player.deck = ['DL-eternal_soul'];
    const slotSpecial = { id: 'DL-magicians_rod', position: 'atk', uid: 3 };
    duel.player.monsters[1] = slotSpecial;
    await ctx.memeAnime.postSummon('player', slotSpecial, 'special');

    assert.strictEqual(duel.player.hand.includes('DL-eternal_soul'), false, 'Special Summon must NOT trigger search');
    scenarioCounts['DL-magicians_rod']++;
    console.log('  ✓ [DL-magicians_rod] Special Summon does NOT trigger search effect');
  }

  // =========================================================================
  // 3. DL-red_eyes_fang_with_chain (Nanh Xích Mắt Đỏ)
  // =========================================================================
  console.log('\n--- Testing DL-red_eyes_fang_with_chain ---');
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    assert.ok(ctx.memeRules.supported.has('dl_fang_with_chain'), 'dl_fang_with_chain must be in supported');

    // Setup: Red-Eyes monster on field, Fang with Chain set
    const reSlot = { id: 'AN-red_eyes_black_dragon', position: 'atk', uid: 10 };
    duel.player.monsters[0] = reSlot;
    const fangSlot = { id: 'DL-red_eyes_fang_with_chain', faceDown: true, setRound: 1 };
    duel.player.spells[0] = fangSlot;

    // Check trapProblem passes with Red-Eyes on field
    const prob = ctx.memeAnime.trapProblem(0);
    assert.strictEqual(prob, '', 'trapProblem should allow activation with Red-Eyes on field');

    // Activate Fang with Chain from set
    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-red_eyes_fang_with_chain'), { fromSet: { index: 0, slot: fangSlot } });
    assert.ok(res, 'Fang with Chain resolves');
    assert.strictEqual(fangSlot.faceDown, false, 'Fang with Chain flips face-up');
    assert.strictEqual(fangSlot.equippedTo, 10, 'Equips to Red-Eyes monster');
    scenarioCounts['DL-red_eyes_fang_with_chain']++;
    console.log('  ✓ [DL-red_eyes_fang_with_chain] Equips to face-up Red-Eyes monster on field');
  }

  // =========================================================================
  // 4. DL-red_eyes_fusion (Dung Hợp Mắt Đỏ)
  // =========================================================================
  console.log('\n--- Testing DL-red_eyes_fusion ---');
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    assert.ok(ctx.memeRules.supported.has('dl_red_eyes_fusion'), 'dl_red_eyes_fusion must be in supported');

    duel.player.hand = ['DL-red_eyes_fusion'];
    duel.player.deck = ['AN-red_eyes_black_dragon', 'AN-celtic_guardian']; // Dragon + Warrior for Slash Dragon
    duel.player.extraDeck = ['DL-red_eyes_slash_dragon'];

    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-red_eyes_fusion'), { fromHand: true, handIndex: 0 });
    assert.ok(res, 'Red-Eyes Fusion resolves');
    const summoned = duel.player.extra || duel.player.monsters.find(m => m?.id === 'DL-red_eyes_slash_dragon');
    assert.strictEqual(summoned?.id, 'DL-red_eyes_slash_dragon', 'Red-Eyes Slash Dragon summoned');
    assert.ok(duel.player.grave.includes('AN-red_eyes_black_dragon'), 'Material 1 sent to GY');
    assert.ok(duel.player.grave.includes('AN-celtic_guardian'), 'Material 2 sent to GY');
    assert.strictEqual(duel.player.noSpecialRound, duel.round, 'noSpecialRound locked');
    assert.strictEqual(duel.player.normalUsed, true, 'normalUsed locked');
    assert.strictEqual(duel.player.redEyesFusionRound, duel.round, 'redEyesFusionRound recorded');
    scenarioCounts['DL-red_eyes_fusion']++;
    console.log('  ✓ [DL-red_eyes_fusion] Fusion Summons using materials from Deck, locks normal/special summons');

    // Strict once per turn
    const resSecond = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-red_eyes_fusion'), { fromHand: true });
    assert.strictEqual(resSecond, false, 'Red-Eyes Fusion cannot be activated twice in the same turn');
    scenarioCounts['DL-red_eyes_fusion']++;
    console.log('  ✓ [DL-red_eyes_fusion] Enforces strict once-per-turn limit');
  }

  // =========================================================================
  // 5. DL-red_eyes_insight (Cái Nhìn Thấu Mắt Đỏ)
  // =========================================================================
  console.log('\n--- Testing DL-red_eyes_insight ---');
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    assert.ok(ctx.memeRules.supported.has('dl_red_eyes_insight'), 'dl_red_eyes_insight must be in supported');

    duel.player.hand = ['DL-red_eyes_insight'];
    duel.player.deck = ['AN-red_eyes_black_dragon', 'DL-red_eyes_spirit'];

    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-red_eyes_insight'), { fromHand: true, handIndex: 0 });
    assert.ok(res, 'Insight resolves');
    assert.ok(duel.player.grave.includes('AN-red_eyes_black_dragon'), 'Red-Eyes sent from deck as cost');
    assert.ok(duel.player.hand.includes('DL-red_eyes_spirit'), 'Searched Red-Eyes Spell/Trap added to hand');
    scenarioCounts['DL-red_eyes_insight']++;
    console.log('  ✓ [DL-red_eyes_insight] Sends Red-Eyes monster to GY and searches Red-Eyes Spell/Trap');
  }

  // =========================================================================
  // 6. DL-red_eyes_spirit (Linh Hồn Mắt Đỏ)
  // =========================================================================
  console.log('\n--- Testing DL-red_eyes_spirit ---');
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    assert.ok(ctx.memeRules.supported.has('dl_red_eyes_spirit'), 'dl_red_eyes_spirit must be in supported');

    duel.player.grave = ['AN-red_eyes_black_dragon'];
    const spiritSlot = { id: 'DL-red_eyes_spirit', faceDown: true, setRound: 1 };
    duel.player.spells[0] = spiritSlot;

    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-red_eyes_spirit'), { fromSet: { index: 0, slot: spiritSlot } });
    assert.ok(res, 'Spirit resolves');
    assert.strictEqual(duel.player.spells[0], null, 'Spirit trap cleared from spell zone');
    assert.ok(duel.player.monsters.some(m => m?.id === 'AN-red_eyes_black_dragon' && m.position === 'atk'), 'Red-Eyes revived in ATK');
    scenarioCounts['DL-red_eyes_spirit']++;
    console.log('  ✓ [DL-red_eyes_spirit] Revives Red-Eyes monster from GY');
  }

  // =========================================================================
  // 7. DL-return_of_the_red_eyes (Sự Trở Lại Của Mắt Đỏ)
  // =========================================================================
  console.log('\n--- Testing DL-return_of_the_red_eyes ---');
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    assert.ok(ctx.memeRules.supported.has('dl_return_red_eyes'), 'dl_return_red_eyes must be in supported');

    duel.player.monsters[0] = { id: 'DL-red_eyes_slash_dragon', position: 'atk', uid: 30 };
    duel.player.grave = ['AN-red_eyes_black_dragon'];
    const returnSlot = { id: 'DL-return_of_the_red_eyes', faceDown: true, setRound: 1 };
    duel.player.spells[0] = returnSlot;

    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-return_of_the_red_eyes'), { fromSet: { index: 0, slot: returnSlot } });
    assert.ok(res, 'Return of the Red-Eyes resolves');
    assert.ok(duel.player.monsters.some(m => m?.id === 'AN-red_eyes_black_dragon' && m.position === 'def'), 'Red-Eyes Black Dragon revived in DEF');
    scenarioCounts['DL-return_of_the_red_eyes']++;
    console.log('  ✓ [DL-return_of_the_red_eyes] Revives Red-Eyes Black Dragon in DEF while Red-Eyes is on field');
  }

  // =========================================================================
  // 8. DL-the_eye_of_timaeus (Con Mắt Timaeus)
  // =========================================================================
  console.log('\n--- Testing DL-the_eye_of_timaeus ---');
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    assert.ok(ctx.memeRules.supported.has('dl_eye_of_timaeus'), 'dl_eye_of_timaeus must be in supported');

    duel.player.monsters[0] = { id: 'AN-dark_magician', position: 'atk', uid: 40 };
    duel.player.hand = ['DL-the_eye_of_timaeus'];
    duel.player.extraDeck = ['DL-dark_cavalry'];

    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-the_eye_of_timaeus'), { fromHand: true, handIndex: 0 });
    assert.ok(res, 'The Eye of Timaeus resolves');
    const cavalry = duel.player.extra || duel.player.monsters.find(m => m?.id === 'DL-dark_cavalry');
    assert.strictEqual(cavalry?.id, 'DL-dark_cavalry', 'Dark Cavalry summoned onto field');
    assert.ok(duel.player.grave.includes('AN-dark_magician'), 'Dark Magician sent to GY as material');
    scenarioCounts['DL-the_eye_of_timaeus']++;
    console.log('  ✓ [DL-the_eye_of_timaeus] Targets Dark Magician on field and Fusion Summons Dark Cavalry');
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n======================================================');
  console.log('BATCH 4 PER-CARD SCENARIO COVERAGE SUMMARY:');
  console.log('======================================================');
  for (const [cardId, count] of Object.entries(scenarioCounts)) {
    console.log(`  - ${cardId}: ${count} scenarios passed`);
  }

  console.log('\n🎉 ALL BATCH 4 TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('\n❌ BATCH 4 TEST FAILED:', err);
  process.exit(1);
});
