const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Batch 1 (Joey Deck) Comprehensive Test Suite...\n');

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
  // CARD 1: AN-gearfried_the_iron_knight
  // =========================================================================
  console.log('--- Testing AN-gearfried_the_iron_knight ---');
  {
    const ctx = createDuelContext();
    const { memeAnime, memeRules } = ctx;

    // Scenario 1.1: Auto-destroys equip card via cleanEquipment()
    setDuel(ctx, {
      round: 1,
      turn: 'player',
      phase: 'MAIN1',
      uidSeq: 10,
      player: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: [],
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-gearfried_the_iron_knight', position: 'atk', uid: 'gear-1' },
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

    // Attach an equip spell to Gearfried
    ctx.duel.player.spells[0] = { id: 'AN-axe_of_despair', faceDown: false, equippedTo: 'gear-1' };
    memeAnime.tcgCore.flush();
    ctx.render();

    assert.strictEqual(ctx.duel.player.spells[0], null, 'Equip spell on Gearfried must be destroyed and removed from backrow');
    assert(ctx.duel.player.grave.includes('AN-axe_of_despair'), 'Destroyed equip spell must be sent to graveyard');
    pass('AN-gearfried_the_iron_knight', 'Auto-destroys equip card attached to it and sends to GY');

    // Scenario 1.2: Normal monster without equip is untouched
    ctx.duel.player.monsters[1] = { id: 'AN-celtic_guardian', position: 'atk', uid: 'celtic-1' };
    ctx.duel.player.spells[1] = { id: 'AN-axe_of_despair', faceDown: false, equippedTo: 'celtic-1' };
    ctx.render();
    assert.notStrictEqual(ctx.duel.player.spells[1], null, 'Equip on Celtic Guardian must not be destroyed');
    pass('AN-gearfried_the_iron_knight', 'Does not destroy equips on other monsters');
  }

  // =========================================================================
  // CARD 2: AN-rocket_warrior
  // =========================================================================
  console.log('\n--- Testing AN-rocket_warrior ---');
  {
    const ctx = createDuelContext();
    const { memeAnime, memeRules } = ctx;

    setDuel(ctx, {
      round: 2,
      turn: 'player',
      phase: 'BATTLE',
      uidSeq: 20,
      player: {
        lp: 4000,
        hand: [],
        deck: [],
        grave: [],
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-rocket_warrior', position: 'atk', uid: 'rocket-1' },
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
        monsters: [
          { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 'bewd-1' },
          null, null
        ],
        extra: null
      }
    });

    // Scenario 2.1: Rocket Warrior attacks higher ATK monster (Blue-Eyes 3000)
    const initialPlayerLp = ctx.duel.player.lp;
    await memeAnime.battle('player', 0, false, 0, false);
    await memeAnime.flush();

    assert.strictEqual(ctx.duel.player.lp, initialPlayerLp, 'Rocket Warrior takes 0 battle damage during its attack');
    assert.notStrictEqual(ctx.duel.player.monsters[0], null, 'Rocket Warrior is not destroyed by battle during its attack');
    
    // Check Blue-Eyes ATK reduction: 3000 - 500 = 2500 in round 2
    const bewdSlot = ctx.duel.enemy.monsters[0];
    const bewdAtkRound2 = memeRules.stat('enemy', bewdSlot, 'atk');
    assert.strictEqual(bewdAtkRound2, 2500, `Blue-Eyes ATK should be 2500, got ${bewdAtkRound2}`);
    pass('AN-rocket_warrior', 'Takes 0 battle damage, survives battle, and weakens target ATK by 500');

    // Scenario 2.2: Weaken expires at end of turn (in round 3)
    ctx.duel.round = 3;
    const bewdAtkRound3 = memeRules.stat('enemy', bewdSlot, 'atk');
    assert.strictEqual(bewdAtkRound3, 3000, `Blue-Eyes ATK should return to 3000 in round 3, got ${bewdAtkRound3}`);
    pass('AN-rocket_warrior', '500 ATK debuff expires at the end of turn');
  }

  // =========================================================================
  // CARD 3: DL-gearfried_the_red_eyes_iron_knight
  // =========================================================================
  console.log('\n--- Testing DL-gearfried_the_red_eyes_iron_knight ---');
  {
    const ctx = createDuelContext();
    const { memeAnime, memeRules } = ctx;

    const setupGearfried = () => {
      setDuel(ctx, {
        round: 1,
        turn: 'player',
        phase: 'MAIN1',
        uidSeq: 30,
        player: {
          lp: 4000,
          hand: [],
          deck: [],
          grave: ['AN-red_eyes_black_dragon'], // Level 7 Red-Eyes
          banished: [],
          spells: [
            { id: 'AN-axe_of_despair', faceDown: false, equippedTo: 'redgear-1' },
            null, null
          ],
          monsters: [
            { id: 'DL-gearfried_the_red_eyes_iron_knight', position: 'atk', uid: 'redgear-1' },
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
    };

    // Scenario 3.1: Valid activation - send equip to GY -> Revive Level 7 Red-Eyes
    setupGearfried();
    const gearSlot = ctx.duel.player.monsters[0];
    const cGear = ctx.card('DL-gearfried_the_red_eyes_iron_knight');

    const res = await memeAnime.resolveEffect('player', cGear, { source: gearSlot });
    await memeAnime.flush();

    assert(res, 'Gearfried Effect 2 must resolve successfully');
    assert.strictEqual(ctx.duel.player.spells[0], null, 'Equip spell must be sent to GY');
    assert(ctx.duel.player.grave.includes('AN-axe_of_despair'), 'Equip spell must be in GY');
    assert.strictEqual(ctx.duel.player.monsters[1]?.id, 'AN-red_eyes_black_dragon', 'Red-Eyes Black Dragon must be revived on field');
    pass('DL-gearfried_the_red_eyes_iron_knight', 'Sends equipped card to GY and Special Summons Level <= 7 Red-Eyes from GY');

    // Scenario 3.2: Once per turn constraint
    const secondTry = await memeAnime.resolveEffect('player', cGear, { source: gearSlot });
    assert.strictEqual(secondTry, false, 'Cannot activate Gearfried effect twice in same turn');
    pass('DL-gearfried_the_red_eyes_iron_knight', 'Strict once per turn constraint enforced');

    // Scenario 3.3: Invalid activation - Monster zones full
    setupGearfried();
    ctx.duel.player.monsters[1] = { id: 'AN-celtic_guardian', position: 'atk', uid: 'cg-1' };
    ctx.duel.player.monsters[2] = { id: 'AN-feral_imp', position: 'atk', uid: 'fi-1' };
    const fullRes = await memeAnime.resolveEffect('player', cGear, { source: ctx.duel.player.monsters[0] });
    assert.strictEqual(fullRes, false, 'Cannot activate when monster zones are completely full');
    pass('DL-gearfried_the_red_eyes_iron_knight', 'Fails activation gracefully when field is full');

    // Scenario 3.4: Invalid activation - No Level <= 7 Red-Eyes in GY
    setupGearfried();
    ctx.duel.player.grave = ['AN-blue_eyes_white_dragon']; // Not a Red-Eyes
    const noTargetRes = await memeAnime.resolveEffect('player', cGear, { source: ctx.duel.player.monsters[0] });
    assert.strictEqual(noTargetRes, false, 'Cannot activate when no valid Red-Eyes in GY');
    pass('DL-gearfried_the_red_eyes_iron_knight', 'Fails activation when no valid Level <= 7 Red-Eyes in GY');
  }

  // =========================================================================
  // CARD 4: DL-red_eyes_baby_dragon
  // =========================================================================
  console.log('\n--- Testing DL-red_eyes_baby_dragon ---');
  {
    const ctx = createDuelContext();
    const { memeAnime, memeRules } = ctx;

    // Scenario 4.1: Destroyed by battle -> summons Level <= 7 Red-Eyes from Deck and equips Baby Dragon (+300 ATK)
    setDuel(ctx, {
      round: 2,
      turn: 'enemy',
      phase: 'BATTLE',
      uidSeq: 40,
      player: {
        lp: 4000,
        hand: [],
        deck: ['AN-red_eyes_black_dragon'],
        grave: [],
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'DL-red_eyes_baby_dragon', position: 'atk', uid: 'baby-1' },
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
        monsters: [
          { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 'bewd-1' },
          null, null
        ],
        extra: null
      }
    });

    // Enemy attacks Baby Dragon
    await memeAnime.battle('enemy', 0, false, 0, false);
    await memeAnime.flush();

    // Check summoned monster
    const summonedSlot = ctx.duel.player.monsters[0];
    assert(summonedSlot, 'Red-Eyes Black Dragon must be summoned from deck');
    assert.strictEqual(summonedSlot.id, 'AN-red_eyes_black_dragon');
    assert(summonedSlot.equippedCards?.includes('DL-red_eyes_baby_dragon'), 'Baby Dragon must be equipped to summoned Red-Eyes');
    assert.strictEqual(summonedSlot.babyEquipAtk, 300, 'Equipped Baby Dragon must give +300 ATK');

    // Total ATK: 2400 + 300 = 2700
    const totalAtk = memeRules.stat('player', summonedSlot, 'atk');
    assert.strictEqual(totalAtk, 2700, `Red-Eyes ATK with Baby Dragon should be 2700, got ${totalAtk}`);
    pass('DL-red_eyes_baby_dragon', 'Battle destruction summons Red-Eyes from Deck and equips Baby Dragon (+300 ATK)');

    // Scenario 4.2: Sent to GY while equipped -> search Level 1 Dragon to hand
    ctx.duel.player.deck.push('DL-black_metal_dragon'); // Level 1 Dragon
    // Destroy the equipped monster
    memeAnime.remove('player', { slot: summonedSlot, index: 0, extra: false }, 'battle');
    await memeAnime.flush();

    assert(ctx.duel.player.hand.includes('DL-black_metal_dragon'), 'Level 1 Dragon must be added to hand when Baby Dragon leaves field while equipped');
    pass('DL-red_eyes_baby_dragon', 'When sent to GY while equipped, searches Level 1 Dragon from Deck/GY');
  }

  // =========================================================================
  // CARD 5: DL-red_eyes_retro_dragon
  // =========================================================================
  console.log('\n--- Testing DL-red_eyes_retro_dragon ---');
  {
    const ctx = createDuelContext();
    const { memeAnime, memeRules } = ctx;

    // Scenario 5.1: Level <= 7 Red-Eyes destroyed by battle while Retro Dragon in hand
    setDuel(ctx, {
      round: 2,
      turn: 'enemy',
      phase: 'BATTLE',
      uidSeq: 50,
      player: {
        lp: 4000,
        hand: ['DL-red_eyes_retro_dragon'],
        deck: [],
        grave: [],
        banished: [],
        spells: [null, null, null],
        monsters: [
          { id: 'AN-red_eyes_black_dragon', position: 'atk', uid: 'rebd-1' },
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
        monsters: [
          { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 'bewd-1' },
          null, null
        ],
        extra: null
      }
    });

    // Enemy attacks Red-Eyes Black Dragon
    await memeAnime.battle('enemy', 0, false, 0, false);
    await memeAnime.flush();

    // Retro Dragon should be Special Summoned in DEF and Red-Eyes revived in DEF
    const retroMonster = ctx.duel.player.monsters.find(m => m?.id === 'DL-red_eyes_retro_dragon');
    const redEyesMonster = ctx.duel.player.monsters.find(m => m?.id === 'AN-red_eyes_black_dragon');

    assert(retroMonster, 'Retro Dragon must be Special Summoned on field');
    assert.strictEqual(retroMonster.position, 'def', 'Retro Dragon must be summoned in DEF position');
    assert(redEyesMonster, 'Destroyed Red-Eyes must be revived on field');
    assert.strictEqual(redEyesMonster.position, 'def', 'Revived Red-Eyes must be in DEF position');
    assert(!ctx.duel.player.hand.includes('DL-red_eyes_retro_dragon'), 'Retro Dragon should no longer be in hand');
    pass('DL-red_eyes_retro_dragon', 'Triggers from hand to Special Summon itself in DEF and revive destroyed Red-Eyes in DEF');

    // Scenario 5.2: Does not trigger if destroyed monster is not Red-Eyes
    ctx.duel.player.monsters[0] = { id: 'AN-celtic_guardian', position: 'atk', uid: 'cg-2' };
    ctx.duel.player.hand = ['DL-red_eyes_retro_dragon'];
    memeAnime.remove('player', { slot: ctx.duel.player.monsters[0], index: 0, extra: false }, 'battle');
    await memeAnime.flush();

    assert(ctx.duel.player.hand.includes('DL-red_eyes_retro_dragon'), 'Retro Dragon must stay in hand when non-Red-Eyes destroyed');
    pass('DL-red_eyes_retro_dragon', 'Does not trigger when non-Red-Eyes monster is destroyed');
  }

  // =========================================================================
  // CARD 6: DL-red_eyes_slash_dragon
  // =========================================================================
  console.log('\n--- Testing DL-red_eyes_slash_dragon ---');
  {
    const ctx = createDuelContext();
    const { memeAnime, memeRules } = ctx;

    const setupSlash = () => {
      setDuel(ctx, {
        round: 2,
        turn: 'player',
        phase: 'BATTLE',
        uidSeq: 60,
        player: {
          lp: 4000,
          hand: [],
          deck: [],
          grave: ['AN-celtic_guardian'], // Warrior in GY
          banished: [],
          spells: [null, null, null],
          monsters: [
            { id: 'DL-red_eyes_slash_dragon', position: 'atk', uid: 'slash-1' },
            null, null
          ],
          extra: null
        },
        enemy: {
          lp: 4000,
          hand: ['AN-raigeki'],
          deck: [],
          grave: [],
          banished: [],
          spells: [null, null, null],
          monsters: [
            { id: 'AN-mystical_elf', position: 'def', uid: 'elf-1' },
            null, null
          ],
          extra: null
        }
      });
    };

    // Scenario 6.1: Attack declaration -> Equips Warrior from GY (+200 ATK continuous)
    setupSlash();
    const slashSlot = ctx.duel.player.monsters[0];
    const initialAtk = memeRules.stat('player', slashSlot, 'atk'); // 2800 base
    assert.strictEqual(initialAtk, 2800);

    await memeAnime.battle('player', 0, false, 0, false);
    await memeAnime.flush();

    assert(slashSlot.equippedCards?.includes('AN-celtic_guardian'), 'Celtic Guardian must be equipped to Slash Dragon');
    assert(!ctx.duel.player.grave.includes('AN-celtic_guardian'), 'Celtic Guardian should be taken from GY');

    const boostedAtk = memeRules.stat('player', slashSlot, 'atk');
    assert.strictEqual(boostedAtk, 3000, `Slash Dragon ATK should be 3000 (2800 + 200), got ${boostedAtk}`);
    pass('DL-red_eyes_slash_dragon', 'Attack declaration equips Warrior from GY and grants +200 ATK');

    // Scenario 6.2: Quick effect negate targeting spell
    const spell = ctx.card('AN-mystical_space_typhoon');
    const negated = await memeAnime.tcgCore.negateSpell('enemy', spell);
    await memeAnime.flush();

    assert(negated, 'Slash Dragon Quick Effect must negate the spell');
    assert.strictEqual(slashSlot.equippedCards.length, 0, 'Equipped card must be consumed for negate cost');
    assert(ctx.duel.player.grave.includes('AN-celtic_guardian'), 'Equipped Warrior sent to GY as cost');
    pass('DL-red_eyes_slash_dragon', 'Sends equipped card to GY to negate and destroy spell');

    // Scenario 6.3: Destruction float -> revives all equipped monster cards from GY
    setupSlash();
    const slash2 = ctx.duel.player.monsters[0];
    slash2.equippedCards = ['AN-celtic_guardian'];
    ctx.duel.player.grave = ['AN-celtic_guardian'];

    memeAnime.remove('player', { slot: slash2, index: 0, extra: false }, 'battle');
    await memeAnime.flush();

    const revivedCeltic = ctx.duel.player.monsters.find(m => m?.id === 'AN-celtic_guardian');
    assert(revivedCeltic, 'Equipped Celtic Guardian must be revived when Slash Dragon is destroyed');
    pass('DL-red_eyes_slash_dragon', 'When destroyed, revives equipped monsters from GY');
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n======================================================');
  console.log('BATCH 1 PER-CARD SCENARIO COVERAGE SUMMARY:');
  console.log('======================================================');
  for (const [cardId, count] of Object.entries(scenarioPasses)) {
    console.log(`  - ${cardId}: ${count} scenarios passed`);
  }
  console.log('\n🎉 ALL BATCH 1 TESTS PASSED!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ BATCH 1 TEST FAILED:', err);
  process.exit(1);
});
