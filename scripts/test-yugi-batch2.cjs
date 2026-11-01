const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Batch 2 (Yugi Monsters & Bosses) Comprehensive Test Suite...\n');

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

const scenarioPasses = {};
function pass(cardId, scenarioName) {
  scenarioPasses[cardId] = (scenarioPasses[cardId] || 0) + 1;
  console.log(`  ✓ [${cardId}] ${scenarioName}`);
}

async function runTests() {
  // =========================================================================
  // CARD 1: AN-buster_blader
  // =========================================================================
  console.log('--- Testing AN-buster_blader ---');
  {
    const ctx = createDuelContext();
    const { memeRules } = ctx;

    // Scenario 1.1: Base ATK is 2600
    setDuel(ctx, {
      round: 1,
      turn: 'player',
      phase: 'MAIN1',
      uidSeq: 10,
      player: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: ['AN-blue_eyes_white_dragon'], // Dragon in player's GY -> should NOT boost Buster Blader
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-buster_blader', position: 'atk', uid: 'bb-1' },
          null, null
        ],
        extra: null
      },
      enemy: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: [],
        banished: [],
        spells: [null, null, null],
        monsters: [null, null, null],
        extra: null
      }
    });

    const slot = ctx.duel.player.monsters[0];
    const baseAtk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(baseAtk, 2600, `Buster Blader should have base 2600 ATK (not boosted by player GY), got ${baseAtk}`);
    pass('AN-buster_blader', 'Does not gain ATK from Dragons in player own GY/field');

    // Scenario 1.2: Gains +500 ATK for each Dragon on opponent's field and opponent's GY
    ctx.duel.enemy.monsters[0] = { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 'bewd-1' };
    ctx.duel.enemy.grave.push('AN-red_eyes_black_dragon'); // 1 on field + 1 in GY = +1000 ATK
    const boostedAtk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(boostedAtk, 3600, `Buster Blader should have 3600 ATK (2600 + 1000), got ${boostedAtk}`);
    pass('AN-buster_blader', 'Gains 500 ATK for each Dragon monster opponent controls or is in opponent GY');

    // Scenario 1.3: Face-down Dragon on opponent field is not counted
    ctx.duel.enemy.monsters[0].position = 'def_down';
    const facedownAtk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(facedownAtk, 3100, `Face-down Dragon should not be counted (2600 + 500 from GY), got ${facedownAtk}`);
    pass('AN-buster_blader', 'Face-down Dragon on opponent field does not grant ATK boost');
  }

  // =========================================================================
  // CARD 2: AN-dark_magician_girl
  // =========================================================================
  console.log('\n--- Testing AN-dark_magician_girl ---');
  {
    const ctx = createDuelContext();
    const { memeRules } = ctx;

    // Scenario 2.1: Base ATK is 2000
    setDuel(ctx, {
      round: 1,
      turn: 'player',
      phase: 'MAIN1',
      uidSeq: 20,
      player: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: [],
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-dark_magician_girl', position: 'atk', uid: 'dmg-1' },
          null, null
        ],
        extra: null
      },
      enemy: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: [],
        banished: [],
        spells: [null, null, null],
        monsters: [null, null, null],
        extra: null
      }
    });

    const slot = ctx.duel.player.monsters[0];
    const baseAtk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(baseAtk, 2000, `Dark Magician Girl should have base 2000 ATK, got ${baseAtk}`);
    pass('AN-dark_magician_girl', 'Has base 2000 ATK with empty GYs');

    // Scenario 2.2: Gains +300 ATK for each Dark Magician or Magician of Black Chaos in either GY
    ctx.duel.player.grave.push('AN-dark_magician'); // 1 in player GY
    ctx.duel.enemy.grave.push('AN-dark_magician'); // 1 in enemy GY
    const boostedAtk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(boostedAtk, 2600, `Dark Magician Girl should have 2600 ATK (2000 + 600), got ${boostedAtk}`);
    pass('AN-dark_magician_girl', 'Gains 300 ATK for each Dark Magician in either GY');
  }

  // =========================================================================
  // CARD 3: AN-dark_paladin
  // =========================================================================
  console.log('\n--- Testing AN-dark_paladin ---');
  {
    const ctx = createDuelContext();
    const { memeRules, memeAnime } = ctx;

    setDuel(ctx, {
      round: 1,
      turn: 'player',
      phase: 'MAIN1',
      uidSeq: 30,
      player: {
        lp: 4000,
        hand: ['AN-celtic_guardian'], // Discard fodder
        deck: [],
        grave: ['AN-blue_eyes_white_dragon'], // 1 Dragon in player GY
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-dark_paladin', position: 'atk', uid: 'dp-1' },
          null, null
        ],
        extra: null
      },
      enemy: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: ['AN-red_eyes_black_dragon'], // 1 Dragon in enemy GY
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-baby_dragon', position: 'atk', uid: 'baby-1' }, // 1 Dragon on enemy field
          null, null
        ],
        extra: null
      }
    });

    const slot = ctx.duel.player.monsters[0];
    // Base 2900 + 3 Dragons * 500 = 4400 ATK
    const atk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(atk, 4400, `Dark Paladin ATK should be 4400 (2900 + 3*500), got ${atk}`);
    pass('AN-dark_paladin', 'Gains 500 ATK for each Dragon on either field and in either GY');

    // Scenario 3.2: Discards 1 card to negate and destroy spell
    // Opponent activates Raigeki
    const spell = ctx.card('AN-raigeki');
    const negated = await memeAnime.tcgCore.negateSpell('enemy', spell);
    await memeAnime.flush();

    assert(negated, 'Dark Paladin must negate opponent spell card');
    assert(!ctx.duel.player.hand.includes('AN-celtic_guardian'), 'Card from hand must be discarded as cost');
    assert(ctx.duel.player.grave.includes('AN-celtic_guardian'), 'Discarded card must be in GY');
    pass('AN-dark_paladin', 'Quick Effect discards 1 card to negate and destroy opponent spell');

    // Scenario 3.3: Cannot negate if hand is empty
    assert.strictEqual(ctx.duel.player.hand.length, 0);
    const secondSpell = ctx.card('AN-pot_of_greed');
    const negatedEmpty = await memeAnime.tcgCore.negateSpell('enemy', secondSpell);
    assert.strictEqual(negatedEmpty, false, 'Cannot negate spell when hand is empty');
    pass('AN-dark_paladin', 'Cannot activate negate effect when hand has no discard cost');
  }

  // =========================================================================
  // CARD 4: AN-dragon_master_knight
  // =========================================================================
  console.log('\n--- Testing AN-dragon_master_knight ---');
  {
    const ctx = createDuelContext();
    const { memeRules } = ctx;

    // Base ATK is 5000
    setDuel(ctx, {
      round: 1,
      turn: 'player',
      phase: 'MAIN1',
      uidSeq: 40,
      player: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: ['AN-blue_eyes_white_dragon'], // In GY -> should NOT boost
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-dragon_master_knight', position: 'atk', uid: 'dmk-1' },
          { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 'bewd-1' }, // Other Dragon controller controls (+500)
          null
        ],
        extra: null
      },
      enemy: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: [],
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-red_eyes_black_dragon', position: 'atk', uid: 'rebd-1' }, // Enemy Dragon -> should NOT boost
          null, null
        ],
        extra: null
      }
    });

    const slot = ctx.duel.player.monsters[0];
    const boostedAtk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(boostedAtk, 5500, `Dragon Master Knight ATK should be 5500 (5000 + 500), got ${boostedAtk}`);
    pass('AN-dragon_master_knight', 'Gains 500 ATK for each other Dragon monster controller controls');

    // Face-down dragon controller controls does not boost
    ctx.duel.player.monsters[1].position = 'def_down';
    const facedownAtk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(facedownAtk, 5000, `Face-down Dragon should not grant boost, got ${facedownAtk}`);
    pass('AN-dragon_master_knight', 'Face-down Dragon does not grant ATK boost');
  }

  // =========================================================================
  // CARD 5: DL-dark_cavalry
  // =========================================================================
  console.log('\n--- Testing DL-dark_cavalry ---');
  {
    const ctx = createDuelContext();
    const { memeRules, memeAnime } = ctx;

    setDuel(ctx, {
      round: 2,
      turn: 'player',
      phase: 'BATTLE',
      uidSeq: 50,
      player: {
        lp: 4000,
        hand: ['AN-celtic_guardian'], // Discard fodder for negate
        deck: [],
        grave: ['AN-pot_of_greed', 'AN-mirror_force'], // 2 Spells/Traps in player GY
        banished: [],
        spells: [
          { id: 'AN-axe_of_despair', faceDown: false, equippedTo: 'cav-1' }, // 1 Spell on field
          null, null
        ],
        monsters: [
          { id: 'DL-dark_cavalry', position: 'atk', uid: 'cav-1' },
          null, null
        ],
        extra: null
      },
      enemy: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: ['AN-raigeki'], // 1 Spell in enemy GY
        banished: [],
        spells: [
          { id: 'AN-waboku', faceDown: true }, // 1 Trap on enemy field
          null, null
        ],
        monsters: [
          { id: 'AN-giant_soldier_of_stone', position: 'def', uid: 'stone-1' }, // 2000 DEF
          null, null
        ],
        extra: null
      }
    });

    const slot = ctx.duel.player.monsters[0];
    // Base 2800 + Axe 1000 + 5 Spells/Traps * 100 = 4300 ATK
    const atk = memeRules.stat('player', slot, 'atk');
    assert.strictEqual(atk, 4300, `Dark Cavalry ATK should be 4300 (2800 base + 1000 axe + 5*100), got ${atk}`);
    pass('DL-dark_cavalry', 'Gains 100 ATK for each Spell/Trap on field and in both GYs');

    // Scenario 5.2: Piercing battle damage against DEF position monster
    // Dark Cavalry 4300 ATK attacks Giant Soldier of Stone 2000 DEF -> 4300 - 2000 = 2300 piercing damage to enemy LP!
    const initialEnemyLp = ctx.duel.enemy.lp; // 4000
    await memeAnime.battle('player', 0, false, 0, false);
    await memeAnime.flush();

    assert.strictEqual(ctx.duel.enemy.lp, initialEnemyLp - 2300, `Enemy should take 2300 piercing damage (4000 - 2300 = 1700), got ${ctx.duel.enemy.lp}`);
    pass('DL-dark_cavalry', 'Inflicts piercing battle damage against Defense Position monsters');

    // Scenario 5.3: Discards 1 card to negate and destroy spell
    const spell = ctx.card('AN-mystical_space_typhoon');
    const negated = await memeAnime.tcgCore.negateSpell('enemy', spell);
    await memeAnime.flush();

    assert(negated, 'Dark Cavalry Quick Effect must negate spell');
    assert(!ctx.duel.player.hand.includes('AN-celtic_guardian'), 'Card must be discarded from hand');
    assert(ctx.duel.player.grave.includes('AN-celtic_guardian'), 'Discarded card in GY');
    pass('DL-dark_cavalry', 'Quick Effect discards 1 card to negate and destroy opponent spell');

    // Scenario 5.4: Cannot negate when hand is empty
    const secondSpell = ctx.card('AN-swords_of_revealing_light');
    const emptyNegate = await memeAnime.tcgCore.negateSpell('enemy', secondSpell);
    assert.strictEqual(emptyNegate, false, 'Cannot negate spell when hand is empty');
    pass('DL-dark_cavalry', 'Cannot activate negate effect when hand is empty');
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n======================================================');
  console.log('BATCH 2 PER-CARD SCENARIO COVERAGE SUMMARY:');
  console.log('======================================================');
  for (const [cardId, count] of Object.entries(scenarioPasses)) {
    console.log(`  - ${cardId}: ${count} scenarios passed`);
  }
  console.log('\n🎉 ALL BATCH 2 TESTS PASSED!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ BATCH 2 TEST FAILED:', err);
  process.exit(1);
});
