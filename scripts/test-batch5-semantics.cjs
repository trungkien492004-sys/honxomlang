const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Batch 5 (Semantic Fixes) Comprehensive Test Suite...\n');

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
      extra: null,
      maxMonsters: 3,
      maxSpells: 3
    },
    enemy: {
      heroId: 'joey',
      lp: 4000,
      hand: [],
      deck: [],
      monsters: [null, null, null],
      spells: [null, null, null],
      grave: [],
      banished: [],
      extra: null,
      maxMonsters: 3,
      maxSpells: 3
    }
  };
  return setDuel(ctx, duelState);
}

const scenarioStats = {};
function trackScenario(cardId, scenarioName, passed) {
  if (!scenarioStats[cardId]) scenarioStats[cardId] = { passed: 0, total: 0, scenarios: [] };
  scenarioStats[cardId].total++;
  if (passed) scenarioStats[cardId].passed++;
  scenarioStats[cardId].scenarios.push({ name: scenarioName, passed });
}

function makeSlot(id, position = 'atk', uid = 1) {
  return { id, position, uid, faceDown: false, turnSummoned: 1 };
}

async function runTests() {
  // =========================================================================
  // CARD 1: AN-alligators_sword_dragon (Rồng Kiếm Cá Sấu)
  // =========================================================================
  console.log('--- Testing AN-alligators_sword_dragon ---');
  {
    const CARD_ID = 'AN-alligators_sword_dragon';

    // 1.1 Direct attack allowed when foe has no monsters
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.monsters[0] = makeSlot(CARD_ID, 'atk', 1);
      ctx.duel.enemy.monsters = [null, null, null];
      const allowed = ctx.memeAnime.tcgCore.directAllowed('player', ctx.duel.player.monsters[0]);
      assert.strictEqual(allowed, true, 'Should allow direct attack when opponent has no monsters');
      console.log('  ✓ 1.1 Direct attack when opponent has no monsters');
      trackScenario(CARD_ID, 'Direct attack when opponent has no monsters', true);
    }

    // 1.2 Direct attack allowed when foe only controls EARTH / WATER / FIRE face-up monsters
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.monsters[0] = makeSlot(CARD_ID, 'atk', 1);
      // Enemy controls Celtic Guardian (EARTH)
      ctx.duel.enemy.monsters[0] = makeSlot('AN-celtic_guardian', 'def', 2);
      const allowed = ctx.memeAnime.tcgCore.directAllowed('player', ctx.duel.player.monsters[0]);
      assert.strictEqual(allowed, true, 'Should allow direct attack when opponent controls only EARTH/WATER/FIRE');
      console.log('  ✓ 1.2 Direct attack when opponent controls only EARTH/WATER/FIRE');
      trackScenario(CARD_ID, 'Direct attack when opponent controls only EARTH/WATER/FIRE', true);
    }

    // 1.3 Direct attack NOT allowed when foe controls DARK / LIGHT / WIND face-up monster
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.monsters[0] = makeSlot(CARD_ID, 'atk', 1);
      // Enemy controls Dark Magician (DARK)
      ctx.duel.enemy.monsters[0] = makeSlot('AN-dark_magician', 'atk', 2);
      const allowed = ctx.memeAnime.tcgCore.directAllowed('player', ctx.duel.player.monsters[0]);
      assert.strictEqual(allowed, false, 'Should not allow direct attack when opponent has DARK monster');
      console.log('  ✓ 1.3 Direct attack blocked when opponent has DARK/LIGHT/WIND monster');
      trackScenario(CARD_ID, 'Direct attack blocked when opponent has DARK/LIGHT/WIND monster', true);
    }

    // 1.4 Direct attack NOT allowed when foe controls a face-down monster
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.monsters[0] = makeSlot(CARD_ID, 'atk', 1);
      // Enemy controls face-down monster
      const defSlot = makeSlot('AN-celtic_guardian', 'def', 2);
      defSlot.faceDown = true;
      ctx.duel.enemy.monsters[0] = defSlot;
      const allowed = ctx.memeAnime.tcgCore.directAllowed('player', ctx.duel.player.monsters[0]);
      assert.strictEqual(allowed, false, 'Should not allow direct attack when opponent controls a face-down monster');
      console.log('  ✓ 1.4 Direct attack blocked when opponent controls face-down monster');
      trackScenario(CARD_ID, 'Direct attack blocked when opponent controls face-down monster', true);
    }
  }

  // =========================================================================
  // CARD 2: DL-black_metal_dragon (Rồng Đen Thép Mắt Đỏ)
  // =========================================================================
  console.log('\n--- Testing DL-black_metal_dragon ---');
  {
    const CARD_ID = 'DL-black_metal_dragon';

    // 2.1 Equip from hand to face-up Red-Eyes monster (+600 ATK)
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      const reSlot = makeSlot('AN-red_eyes_black_dragon', 'atk', 1);
      ctx.duel.player.monsters[0] = reSlot;
      ctx.duel.player.hand = ['DL-black_metal_dragon'];
      ctx.memeServerChoice = (n, title, options) => options[0];

      const res = await ctx.window.equipBlackMetal('player', { type: 'hand', index: 0 });
      await ctx.memeAnime.flush();
      assert.strictEqual(res, true, 'equipBlackMetal should succeed');
      assert.strictEqual(ctx.duel.player.monsters[0].blackMetalEquipped, true, 'Monster should have blackMetalEquipped flag');
      assert.strictEqual(ctx.duel.player.monsters[0].tempAtk, 600, 'Monster should gain 600 ATK');
      assert.strictEqual(ctx.duel.player.hand.length, 0, 'Card should leave hand');
      console.log('  ✓ 2.1 Equip to Red-Eyes monster (+600 ATK)');
      trackScenario(CARD_ID, 'Equip to Red-Eyes monster (+600 ATK)', true);
    }

    // 2.2 When equipped monster is destroyed/sent to GY -> triggers Red-Eyes card search from Deck
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      const reSlot = makeSlot('AN-red_eyes_black_dragon', 'atk', 1);
      reSlot.blackMetalEquipped = true;
      ctx.duel.player.monsters[0] = reSlot;
      ctx.duel.player.deck = ['DL-red_eyes_fusion', 'AN-celtic_guardian'];
      ctx.memeServerChoice = (n, title, options) => options.find(o => o.id === 'DL-red_eyes_fusion') || options[0];

      // Remove the monster (destroyed by battle)
      await ctx.memeAnime.tcgCore.remove('player', { slot: ctx.duel.player.monsters[0], index: 0 }, 'battle');
      await ctx.memeAnime.flush();

      assert.strictEqual(ctx.duel.player.grave.includes('DL-black_metal_dragon'), true, 'Black Metal Dragon should be in GY');
      assert.strictEqual(ctx.duel.player.hand.includes('DL-red_eyes_fusion'), true, 'Should search Red-Eyes card to hand');
      console.log('  ✓ 2.2 Equipped monster destroyed -> searches Red-Eyes card from Deck');
      trackScenario(CARD_ID, 'Equipped monster destroyed -> searches Red-Eyes card from Deck', true);
    }

    // 2.3 When Black Metal Dragon itself (as monster) is sent to GY -> triggers search
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      const bmdSlot = makeSlot('DL-black_metal_dragon', 'atk', 1);
      ctx.duel.player.monsters[0] = bmdSlot;
      ctx.duel.player.deck = ['DL-red_eyes_insight'];
      ctx.memeServerChoice = (n, title, options) => options[0];

      await ctx.memeAnime.tcgCore.remove('player', { slot: ctx.duel.player.monsters[0], index: 0 }, 'effect');
      await ctx.memeAnime.flush();

      assert.strictEqual(ctx.duel.player.grave.includes('DL-black_metal_dragon'), true, 'Should be in grave');
      assert.strictEqual(ctx.duel.player.hand.includes('DL-red_eyes_insight'), true, 'Should search Red-Eyes card to hand');
      console.log('  ✓ 2.3 Black Metal Dragon sent to GY as monster -> searches Red-Eyes card');
      trackScenario(CARD_ID, 'Black Metal Dragon sent to GY as monster -> searches Red-Eyes card', true);
    }
  }

  // =========================================================================
  // CARD 3: DL-eternal_soul (Linh Hồn Vĩnh Cửu)
  // =========================================================================
  console.log('\n--- Testing DL-eternal_soul ---');
  {
    const CARD_ID = 'DL-eternal_soul';

    // 3.1 Revive Dark Magician once per turn
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.grave = ['AN-dark_magician'];
      ctx.duel.player.spells[0] = { id: CARD_ID, faceDown: false, kind: 'trap' };
      ctx.memeServerChoice = (n, title, options) => {
        const mode = options.find(o => o.mode === 'revive');
        if (mode) return mode;
        return options[0];
      };

      const cardObj = ctx.card('DL-eternal_soul');
      const res = await ctx.memeAnime.resolveEffect('player', cardObj, { source: ctx.duel.player.spells[0] });
      await ctx.memeAnime.flush();

      assert.strictEqual(res, true, 'Should successfully resolve revival');
      assert.strictEqual(ctx.duel.player.monsters.some(m => m && m.id === 'AN-dark_magician'), true, 'Dark Magician should be revived to field');
      assert.strictEqual(ctx.duel.player.eternalSoulRound, ctx.duel.round, 'eternalSoulRound should be set');
      console.log('  ✓ 3.1 Revive Dark Magician from GY');
      trackScenario(CARD_ID, 'Revive Dark Magician from GY', true);
    }

    // 3.2 Second activation in same turn is blocked (once per turn)
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.eternalSoulRound = ctx.duel.round; // already used
      ctx.duel.player.spells[0] = { id: CARD_ID, faceDown: false, kind: 'trap' };

      const cardObj = ctx.card('DL-eternal_soul');
      const res = await ctx.memeAnime.resolveEffect('player', cardObj, { source: ctx.duel.player.spells[0] });
      assert.strictEqual(res, false, 'Should be rejected due to once-per-turn limit');
      console.log('  ✓ 3.2 Blocked on second activation in same turn');
      trackScenario(CARD_ID, 'Blocked on second activation in same turn', true);
    }

    // 3.3 Guard removal: Dark Magician immune to opponent card effects under face-up Eternal Soul
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.spells[0] = { id: CARD_ID, faceDown: false, kind: 'trap' };
      ctx.duel.player.monsters[0] = makeSlot('AN-dark_magician', 'atk', 1);
      // Opponent attempts removal by effect
      vm.runInContext(`origin = { owner: 'enemy' };`, ctx);
      const guarded = ctx.memeAnime.tcgCore.guardRemoval('player', ctx.duel.player.monsters[0], 'effect');
      assert.strictEqual(guarded, true, 'Dark Magician should be immune to opponent effects');
      console.log('  ✓ 3.3 Dark Magician immune to enemy card effects under Eternal Soul');
      trackScenario(CARD_ID, 'Dark Magician immune to enemy card effects under Eternal Soul', true);
    }

    // 3.4 When Eternal Soul leaves the field -> destroys all monsters player controls
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.spells[0] = { id: CARD_ID, faceDown: false, kind: 'trap' };
      ctx.duel.player.monsters[0] = makeSlot('AN-dark_magician', 'atk', 1);
      ctx.duel.player.monsters[1] = makeSlot('AN-celtic_guardian', 'atk', 2);

      // Clear the spell (leaves the field)
      ctx.memeAnime.tcgCore.clearSpell('player', 0);

      assert.strictEqual(ctx.duel.player.monsters[0], null, 'Monster 0 should be destroyed');
      assert.strictEqual(ctx.duel.player.monsters[1], null, 'Monster 1 should be destroyed');
      console.log('  ✓ 3.4 Eternal Soul leaves field -> wipes all player monsters');
      trackScenario(CARD_ID, 'Eternal Soul leaves field -> wipes all player monsters', true);
    }
  }

  // =========================================================================
  // CARD 4: DL-magician_navigation (Điều Hướng Phù Thủy)
  // =========================================================================
  console.log('\n--- Testing DL-magician_navigation ---');
  {
    const CARD_ID = 'DL-magician_navigation';

    // 4.1 Summon Dark Magician from hand and level <= 7 DARK Spellcaster from Deck (freeCount >= 2)
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.hand = ['AN-dark_magician'];
      ctx.duel.player.deck = ['AN-dark_magician_girl', 'AN-celtic_guardian'];
      ctx.duel.player.spells[0] = { id: CARD_ID, faceDown: false, kind: 'trap' };
      ctx.memeServerChoice = (n, title, options) => options[0];

      const cardObj = ctx.card('DL-magician_navigation');
      const res = await ctx.memeAnime.resolveEffect('player', cardObj, { fromSet: { index: 0 }, source: ctx.duel.player.spells[0] });
      await ctx.memeAnime.flush();

      assert.strictEqual(res, true, 'Should successfully resolve Navigation');
      assert.strictEqual(ctx.duel.player.monsters[0].id, 'AN-dark_magician', 'First slot should be Dark Magician');
      assert.strictEqual(ctx.duel.player.monsters[1].id, 'AN-dark_magician_girl', 'Second slot should be DMG from deck');
      console.log('  ✓ 4.1 Summon Dark Magician from hand and Dark Spellcaster <= 7 from Deck');
      trackScenario(CARD_ID, 'Summon Dark Magician from hand and Dark Spellcaster <= 7 from Deck', true);
    }

    // 4.2 When only 1 monster zone is available, summon only Dark Magician
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.monsters[0] = makeSlot('AN-celtic_guardian', 'atk', 1);
      ctx.duel.player.monsters[1] = makeSlot('AN-celtic_guardian', 'atk', 2);
      // Only slot 2 is free
      ctx.duel.player.hand = ['AN-dark_magician'];
      ctx.duel.player.deck = ['AN-dark_magician_girl'];
      ctx.duel.player.spells[0] = { id: CARD_ID, faceDown: false, kind: 'trap' };
      ctx.memeServerChoice = (n, title, options) => options[0];

      const cardObj = ctx.card('DL-magician_navigation');
      const res = await ctx.memeAnime.resolveEffect('player', cardObj, { fromSet: { index: 0 }, source: ctx.duel.player.spells[0] });
      await ctx.memeAnime.flush();

      assert.strictEqual(res, true, 'Should resolve with 1 slot free');
      assert.strictEqual(ctx.duel.player.monsters[2].id, 'AN-dark_magician', 'Only DM should be summoned to slot 2');
      assert.strictEqual(ctx.duel.player.deck.includes('AN-dark_magician_girl'), true, 'DMG remains in deck');
      console.log('  ✓ 4.2 Only 1 zone free -> summons only Dark Magician');
      trackScenario(CARD_ID, 'Only 1 zone free -> summons only Dark Magician', true);
    }

    // 4.3 GY Effect: Banish self to negate opponent face-up Spell/Trap if Dark Magician is on field
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.grave = ['DL-magician_navigation'];
      ctx.duel.player.monsters[0] = makeSlot('AN-dark_magician', 'atk', 1);
      ctx.duel.enemy.spells[0] = { id: 'AN-swords_of_revealing_light', faceDown: false, kind: 'spell' };
      ctx.memeServerChoice = (n, title, options) => options[0];

      const cardObj = ctx.card('DL-magician_navigation');
      const res = await ctx.memeAnime.resolveEffect('player', cardObj, { fromGY: true, source: 'grave' });
      await ctx.memeAnime.flush();

      assert.strictEqual(res, true, 'GY banish negate should succeed');
      assert.strictEqual(ctx.duel.player.banished.includes('DL-magician_navigation'), true, 'Navigation should be banished');
      assert.strictEqual(ctx.duel.enemy.spells[0].negatedUntil, ctx.duel.round, 'Opponent spell should be negated until end of round');
      console.log('  ✓ 4.3 GY effect banishes self to negate opponent face-up Spell/Trap');
      trackScenario(CARD_ID, 'GY effect banishes self to negate opponent face-up Spell/Trap', true);
    }

    // 4.4 GY Effect blocked if player controls no Dark Magician
    {
      const ctx = createDuelContext();
      initDuel(ctx);
      ctx.duel.player.grave = ['DL-magician_navigation'];
      ctx.duel.player.monsters[0] = makeSlot('AN-celtic_guardian', 'atk', 1); // Not DM
      ctx.duel.enemy.spells[0] = { id: 'AN-swords_of_revealing_light', faceDown: false, kind: 'spell' };

      const cardObj = ctx.card('DL-magician_navigation');
      const res = await ctx.memeAnime.resolveEffect('player', cardObj, { fromGY: true, source: 'grave' });
      assert.strictEqual(res, false, 'GY effect should fail without Dark Magician on field');
      console.log('  ✓ 4.4 GY effect blocked without Dark Magician on field');
      trackScenario(CARD_ID, 'GY effect blocked without Dark Magician on field', true);
    }
  }

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n======================================================');
  console.log('📊 BATCH 5 TEST RESULTS SUMMARY:');
  console.log('======================================================');
  let totalPassed = 0;
  let totalScenarios = 0;
  for (const [cardId, stats] of Object.entries(scenarioStats)) {
    console.log(`Card: ${cardId.padEnd(35)} | Passed: ${stats.passed}/${stats.total}`);
    totalPassed += stats.passed;
    totalScenarios += stats.total;
  }
  console.log('------------------------------------------------------');
  console.log(`TOTAL SCENARIOS: ${totalPassed}/${totalScenarios} PASSED`);
  console.log('======================================================\n');

  if (totalPassed === totalScenarios) {
    console.log('🎉 ALL BATCH 5 TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME BATCH 5 TESTS FAILED!');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
