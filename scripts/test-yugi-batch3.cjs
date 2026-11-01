const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Batch 3 (Yugi DL Spells & Monsters) Comprehensive Test Suite...\n');

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
  'DL-dark_magical_circle': 0,
  'DL-apprentice_illusion_magician': 0,
  'DL-magician_of_chaos': 0,
  'DL-magicians_souls': 0
};

async function runTests() {
  // =========================================================================
  // 1. DL-dark_magical_circle (Ma Pháp Trận Phù Thủy Áo Đen)
  // =========================================================================
  console.log('--- Testing DL-dark_magical_circle ---');

  // Scenario 1: Activation searches top 3 cards for Dark Magician or DM Spell/Trap
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.hand = ['DL-dark_magical_circle'];
    duel.player.deck = ['AN-dark_magician', 'AN-celtic_guardian', 'AN-beaver_warrior'];

    const cardObj = ctx.card('DL-dark_magical_circle');
    await ctx.memeAnime.resolveEffect('player', cardObj, { fromHand: true, handIndex: 0 });

    assert.ok(duel.player.hand.includes('AN-dark_magician'), 'Dark Magician should be added to hand from top 3');
    assert.strictEqual(duel.player.hand.includes('DL-dark_magical_circle'), false, 'Circle removed from hand');
    assert.ok(duel.player.spells.some(s => s?.id === 'DL-dark_magical_circle' && !s.faceDown), 'Circle placed face-up in spell zone');
    scenarioCounts['DL-dark_magical_circle']++;
    console.log('  ✓ [DL-dark_magical_circle] Activation looks at top 3 and adds Dark Magician to hand, staying on field');
  }

  // Scenario 2: Triggers banish effect when Dark Magician is summoned
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.spells[0] = { id: 'DL-dark_magical_circle', faceDown: false, setRound: 1 };
    duel.enemy.monsters[0] = { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 99 };
    duel.enemy.spells[0] = { id: 'AN-axe_of_despair', faceDown: false };

    // Summon Dark Magician to player field
    const dmSlot = { id: 'AN-dark_magician', position: 'atk', uid: 101 };
    duel.player.monsters[0] = dmSlot;

    // Pick enemy monster to banish
    ctx.window.memeAnime.choose = async (n, title, options) => {
      return options.find(o => o.id === 'AN-blue_eyes_white_dragon') || options[0];
    };

    await ctx.memeAnime.postSummon('player', dmSlot, 'special');

    assert.strictEqual(duel.enemy.monsters[0], null, 'Enemy Blue-Eyes should be removed from field');
    assert.ok(duel.enemy.banished.includes('AN-blue_eyes_white_dragon'), 'Enemy Blue-Eyes should be banished, NOT in GY');
    assert.strictEqual(duel.enemy.grave.includes('AN-blue_eyes_white_dragon'), false, 'Enemy Blue-Eyes should NOT be in grave');
    scenarioCounts['DL-dark_magical_circle']++;
    console.log('  ✓ [DL-dark_magical_circle] Normal/Special Summon of Dark Magician banishes opponent card');
  }

  // Scenario 3: Enforces once-per-turn on banish effect
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    const circleSlot = { id: 'DL-dark_magical_circle', faceDown: false, setRound: 1, circleBanishRound: duel.round };
    duel.player.spells[0] = circleSlot;
    duel.enemy.monsters[0] = { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 99 };

    let pickCalled = false;
    ctx.window.memeAnime.choose = async (n, title, options) => {
      pickCalled = true;
      return options[0];
    };

    const dmSlot = { id: 'AN-dark_magician', position: 'atk', uid: 102 };
    duel.player.monsters[0] = dmSlot;

    await ctx.memeAnime.postSummon('player', dmSlot, 'special');

    assert.strictEqual(pickCalled, false, 'Circle should NOT trigger banish if already used this turn');
    assert.notStrictEqual(duel.enemy.monsters[0], null, 'Enemy monster remains unaffected');
    scenarioCounts['DL-dark_magical_circle']++;
    console.log('  ✓ [DL-dark_magical_circle] Strict once-per-turn limit enforced for banish effect');
  }

  // Scenario 4: Does not trigger when circle is face-down or opponent has no cards
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.spells[0] = { id: 'DL-dark_magical_circle', faceDown: true, setRound: 1 };
    duel.enemy.monsters[0] = { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 99 };

    let pickCalled = false;
    ctx.window.memeAnime.choose = async () => { pickCalled = true; return null; };

    const dmSlot = { id: 'AN-dark_magician', position: 'atk', uid: 103 };
    duel.player.monsters[0] = dmSlot;

    await ctx.memeAnime.postSummon('player', dmSlot, 'special');
    assert.strictEqual(pickCalled, false, 'Face-down Circle must not trigger');
    scenarioCounts['DL-dark_magical_circle']++;
    console.log('  ✓ [DL-dark_magical_circle] Face-down Circle does not trigger banish');
  }

  // =========================================================================
  // 2. DL-apprentice_illusion_magician (Đồ Đệ Ảo Ảnh Phù Thủy Áo Đen)
  // =========================================================================
  console.log('\n--- Testing DL-apprentice_illusion_magician ---');

  // Scenario 1: Special Summon from hand by discarding 1 card
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.hand = ['DL-apprentice_illusion_magician', 'AN-dark_magician'];
    duel.player.deck = ['AN-dark_magician'];

    // Pick discard cost
    ctx.window.memeAnime.choose = async (n, title, options) => {
      const cost = options.find(o => o.id === 'AN-dark_magician');
      if (cost) return cost;
      return options[0];
    };

    const cardObj = ctx.card('DL-apprentice_illusion_magician');
    await ctx.memeAnime.resolveEffect('player', cardObj, { fromHand: true });

    assert.ok(duel.player.monsters.some(m => m?.id === 'DL-apprentice_illusion_magician'), 'Apprentice summoned to field');
    assert.ok(duel.player.grave.includes('AN-dark_magician'), 'Discarded card sent to GY');
    scenarioCounts['DL-apprentice_illusion_magician']++;
    console.log('  ✓ [DL-apprentice_illusion_magician] Special Summons from hand by discarding 1 card');
  }

  // Scenario 2: Search Dark Magician when summoned
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.deck = ['AN-dark_magician', 'AN-celtic_guardian'];
    duel.player.hand = [];

    const slot = { id: 'DL-apprentice_illusion_magician', position: 'atk', uid: 201 };
    duel.player.monsters[0] = slot;

    ctx.window.memeAnime.choose = async (n, title, options) => {
      return options.find(o => o.id === 'AN-dark_magician') || options[0];
    };

    await ctx.memeAnime.postSummon('player', slot, 'normal');

    assert.ok(duel.player.hand.includes('AN-dark_magician'), 'Dark Magician searched to hand');
    assert.strictEqual(duel.player.deck.includes('AN-dark_magician'), false, 'Dark Magician removed from Deck');
    scenarioCounts['DL-apprentice_illusion_magician']++;
    console.log('  ✓ [DL-apprentice_illusion_magician] Searches Dark Magician from Deck to hand on summon');
  }

  // Scenario 3: Once per turn constraint on hand special summon
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.apprenticeSpecialRound = duel.round;
    duel.player.hand = ['DL-apprentice_illusion_magician', 'AN-beaver_warrior'];

    const mode = ctx.memeAnime.specialMode('player', ctx.card('DL-apprentice_illusion_magician'));
    assert.strictEqual(mode, null, 'specialMode should return null when already used this turn');

    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-apprentice_illusion_magician'), { fromHand: true });
    assert.strictEqual(res, false, 'resolveEffect must fail when already summoned this turn');
    scenarioCounts['DL-apprentice_illusion_magician']++;
    console.log('  ✓ [DL-apprentice_illusion_magician] Strict once-per-turn limit enforced for special summon');
  }

  // Scenario 4: Damage calculation hand trap (+2000 ATK/DEF)
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.hand = ['DL-apprentice_illusion_magician'];
    const dmSlot = { id: 'AN-dark_magician', position: 'atk', uid: 202 };
    duel.player.monsters[0] = dmSlot;

    const foeSlot = { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 203 };
    duel.enemy.monsters[0] = foeSlot;

    // Pick Apprentice to discard for +2000 ATK
    ctx.window.memeAnime.choose = async (n, title, options) => {
      return options.find(o => o.id === 'DL-apprentice_illusion_magician');
    };

    // Simulate battle
    await ctx.memeAnime.battle('player', 0, false, 0, false);

    assert.ok(duel.player.grave.includes('DL-apprentice_illusion_magician'), 'Apprentice discarded to GY');
    assert.strictEqual(dmSlot.mangaTempAtk, 2000, 'Dark Magician gains +2000 ATK during battle');
    scenarioCounts['DL-apprentice_illusion_magician']++;
    console.log('  ✓ [DL-apprentice_illusion_magician] Quick Effect discards from hand to give +2000 ATK/DEF to Dark Spellcaster');
  }

  // =========================================================================
  // 3. DL-magician_of_chaos (Phù Thủy Hỗn Mang)
  // =========================================================================
  console.log('\n--- Testing DL-magician_of_chaos ---');

  // Scenario 1: Ritual Summon with Black Magic Ritual
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.hand = ['AN-black_magic_ritual', 'DL-magician_of_chaos'];
    // Material: Level 7 in hand or field
    duel.player.monsters[0] = { id: 'AN-gaia_the_fierce_knight', position: 'atk', uid: 301 };

    ctx.window.memeAnime.choose = async (n, title, options) => options[0];
    ctx.window.memeAnime.chooseMany = async (n, title, options) => [options[0]];

    await ctx.memeAnime.playSpellFor('player', 0);

    assert.ok(duel.player.monsters.some(m => m?.id === 'DL-magician_of_chaos'), 'Magician of Chaos Ritual Summoned');
    assert.ok(duel.player.grave.includes('AN-gaia_the_fierce_knight'), 'Tribute sent to GY');
    scenarioCounts['DL-magician_of_chaos']++;
    console.log('  ✓ [DL-magician_of_chaos] Ritual Summoned properly using Black Magic Ritual');
  }

  // Scenario 2: Name becomes Dark Magician on field (satisfies Dark Magic Attack)
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.hand = ['AN-dark_magic_attack'];
    duel.player.monsters[0] = { id: 'DL-magician_of_chaos', position: 'atk', uid: 302 };
    duel.enemy.spells[0] = { id: 'AN-swords_of_revealing_light', faceDown: false };
    duel.enemy.spells[1] = { id: 'AN-mirror_force', faceDown: true };

    const prob = ctx.spellProblem('player', ctx.card('AN-dark_magic_attack'));
    assert.strictEqual(prob, '', 'Dark Magic Attack should have no problem activating with Magician of Chaos on field');

    await ctx.memeAnime.playSpellFor('player', 0);
    assert.strictEqual(duel.enemy.spells[0], null, 'Opponent spell 1 destroyed');
    assert.strictEqual(duel.enemy.spells[1], null, 'Opponent spell 2 destroyed');
    scenarioCounts['DL-magician_of_chaos']++;
    console.log('  ✓ [DL-magician_of_chaos] Name treated as Dark Magician on field (activates Dark Magic Attack)');
  }

  // Scenario 3: Name becomes Dark Magician in GY (boosts Dark Magician Girl)
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    const dmgSlot = { id: 'AN-dark_magician_girl', position: 'atk', uid: 303 };
    duel.player.monsters[0] = dmgSlot;

    duel.player.grave = ['DL-magician_of_chaos'];
    duel.enemy.grave = [];

    const atk = ctx.memeAnime.tcgCore.stat('player', dmgSlot, 'atk');
    assert.strictEqual(atk, 2300, 'Dark Magician Girl gains +300 ATK from Magician of Chaos in GY (2000 + 300 = 2300)');
    scenarioCounts['DL-magician_of_chaos']++;
    console.log('  ✓ [DL-magician_of_chaos] Name treated as Dark Magician in GY (+300 ATK for Dark Magician Girl)');
  }

  // Scenario 4: Destroys 1 card on field when a Spell/Trap is activated
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    const chaosSlot = { id: 'DL-magician_of_chaos', position: 'atk', uid: 304 };
    duel.player.monsters[0] = chaosSlot;
    duel.enemy.monsters[0] = { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 305 };
    duel.player.hand = ['AN-pot_of_greed'];
    duel.player.deck = ['AN-beaver_warrior', 'AN-celtic_guardian'];

    ctx.window.memeAnime.choose = async (n, title, options) => {
      return options.find(o => o.id === 'AN-blue_eyes_white_dragon') || options[0];
    };

    // Activate Pot of Greed
    await ctx.memeAnime.playSpellFor('player', 0);
    await ctx.memeAnime.flush();

    assert.strictEqual(duel.enemy.monsters[0], null, 'Enemy monster destroyed by Magician of Chaos effect');
    assert.strictEqual(chaosSlot.chaosDestroyRound, duel.round, 'Effect marked once per turn');
    scenarioCounts['DL-magician_of_chaos']++;
    console.log('  ✓ [DL-magician_of_chaos] Triggers when Spell/Trap activates to destroy 1 card on field');
  }

  // Scenario 5: Destruction float: Special Summons Chaos / BLS Ritual Monster from hand
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    const chaosSlot = { id: 'DL-magician_of_chaos', position: 'atk', uid: 306, properlySummoned: true };
    duel.player.monsters[0] = chaosSlot;
    duel.player.hand = ['AN-magician_of_black_chaos'];

    ctx.window.memeAnime.choose = async (n, title, options) => {
      return options.find(o => o.id === 'AN-magician_of_black_chaos') || options[0];
    };

    // Destroy Magician of Chaos by battle
    ctx.memeAnime.remove('player', { slot: chaosSlot, index: 0, extra: false }, 'battle');
    await ctx.memeAnime.flush();

    assert.ok(duel.player.monsters.some(m => m?.id === 'AN-magician_of_black_chaos'), 'Magician of Black Chaos summoned from hand on destruction float');
    assert.strictEqual(duel.player.hand.includes('AN-magician_of_black_chaos'), false, 'Summoned monster removed from hand');
    scenarioCounts['DL-magician_of_chaos']++;
    console.log('  ✓ [DL-magician_of_chaos] Float triggers upon destruction to summon Chaos Ritual Monster from hand');
  }

  // =========================================================================
  // 4. DL-magicians_souls (Linh Hồn Phù Thủy Áo Đen)
  // =========================================================================
  console.log('\n--- Testing DL-magicians_souls ---');

  // Scenario 1: Hand Effect (Option A) - Sends Level 6+ Spellcaster to GY, summons Souls
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.hand = ['DL-magicians_souls'];
    duel.player.deck = ['AN-dark_magician']; // Level 7 Spellcaster

    ctx.window.memeAnime.choose = async (n, title, options) => {
      const dm = options.find(o => o.id === 'AN-dark_magician');
      if (dm) return dm;
      const selfMode = options.find(o => o.id === 'summon_self');
      if (selfMode) return selfMode;
      return options[0];
    };

    const cardObj = ctx.card('DL-magicians_souls');
    await ctx.memeAnime.resolveEffect('player', cardObj, { fromHand: true });

    assert.ok(duel.player.monsters.some(m => m?.id === 'DL-magicians_souls'), 'Souls summoned to field');
    assert.ok(duel.player.grave.includes('AN-dark_magician'), 'Dark Magician sent from Deck to GY as cost');
    scenarioCounts['DL-magicians_souls']++;
    console.log('  ✓ [DL-magicians_souls] Hand effect: Sends Level 6+ Spellcaster from Deck to GY and Special Summons itself');
  }

  // Scenario 2: Hand Effect (Option B) - Sends Souls to GY and revives Dark Magician
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.hand = ['DL-magicians_souls'];
    duel.player.deck = ['AN-dark_magician']; // Level 7 Spellcaster sent to GY
    duel.player.grave = [];

    ctx.window.memeServerChoice = async (n, title, options) => {
      const dm = options.find(o => o.id === 'AN-dark_magician');
      if (dm) return dm;
      const reviveMode = options.find(o => o.id === 'revive_dm');
      if (reviveMode) return reviveMode;
      return options[0];
    };

    const cardObj = ctx.card('DL-magicians_souls');
    await ctx.memeAnime.resolveEffect('player', cardObj, { fromHand: true });

    assert.ok(duel.player.grave.includes('DL-magicians_souls'), 'Souls sent to GY');
    assert.ok(duel.player.monsters.some(m => m?.id === 'AN-dark_magician'), 'Dark Magician revived to field');
    scenarioCounts['DL-magicians_souls']++;
    console.log('  ✓ [DL-magicians_souls] Hand effect: Sends Souls to GY and revives Dark Magician from GY');
  }

  // Scenario 3: Fails when no Level 6+ Spellcaster in Deck or field full
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    duel.player.hand = ['DL-magicians_souls'];
    duel.player.deck = ['AN-beaver_warrior', 'AN-celtic_guardian']; // No Level 6+ Spellcaster

    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-magicians_souls'), { fromHand: true });
    assert.strictEqual(res, false, 'Must fail when no Level 6+ Spellcaster in deck');

    // Also check when field is full
    duel.player.deck = ['AN-dark_magician'];
    duel.player.monsters = [
      { id: 'AN-beaver_warrior', position: 'atk' },
      { id: 'AN-celtic_guardian', position: 'atk' },
      { id: 'AN-gaia_the_fierce_knight', position: 'atk' }
    ];
    const resFull = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-magicians_souls'), { fromHand: true });
    assert.strictEqual(resFull, false, 'Must fail when field is full');

    scenarioCounts['DL-magicians_souls']++;
    console.log('  ✓ [DL-magicians_souls] Gracefully fails when no valid targets or when zones are full');
  }

  // Scenario 4: Field Effect - Sends up to 2 Spells/Traps to GY and draws that many cards
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    const soulsSlot = { id: 'DL-magicians_souls', position: 'atk', uid: 401 };
    duel.player.monsters[0] = soulsSlot;
    duel.player.hand = ['AN-pot_of_greed'];
    duel.player.spells[0] = { id: 'AN-axe_of_despair', faceDown: false };
    duel.player.deck = ['AN-card_1', 'AN-card_2', 'AN-card_3'];

    ctx.window.memeAnime.chooseMany = async (n, title, options, cfg) => {
      return options.slice(0, 2); // Pick 2 spells
    };

    const cardObj = ctx.card('DL-magicians_souls');
    await ctx.memeAnime.resolveEffect('player', cardObj, { source: soulsSlot });

    assert.strictEqual(duel.player.spells[0], null, 'Spell on field sent to GY');
    assert.strictEqual(duel.player.hand.includes('AN-pot_of_greed'), false, 'Spell in hand sent to GY');
    assert.ok(duel.player.grave.includes('AN-axe_of_despair'), 'Axe of Despair in GY');
    assert.ok(duel.player.grave.includes('AN-pot_of_greed'), 'Pot of Greed in GY');
    assert.ok(duel.player.hand.includes('AN-card_1') && duel.player.hand.includes('AN-card_2'), 'Drew 2 cards');
    scenarioCounts['DL-magicians_souls']++;
    console.log('  ✓ [DL-magicians_souls] Field effect: Sends 2 Spells/Traps to GY and draws 2 cards');
  }

  // Scenario 5: Field Effect enforces once per turn
  {
    const ctx = createDuelContext();
    const duel = initDuel(ctx);

    const soulsSlot = { id: 'DL-magicians_souls', position: 'atk', uid: 402 };
    duel.player.monsters[0] = soulsSlot;
    duel.player.soulsDrawRound = duel.round;
    duel.player.hand = ['AN-pot_of_greed'];

    const res = await ctx.memeAnime.resolveEffect('player', ctx.card('DL-magicians_souls'), { source: soulsSlot });
    assert.strictEqual(res, false, 'Must fail when field draw effect already used this turn');
    scenarioCounts['DL-magicians_souls']++;
    console.log('  ✓ [DL-magicians_souls] Field effect enforces once-per-turn limit');
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n======================================================');
  console.log('BATCH 3 PER-CARD SCENARIO COVERAGE SUMMARY:');
  console.log('======================================================');
  for (const [cardId, count] of Object.entries(scenarioCounts)) {
    console.log(`  - ${cardId}: ${count} scenarios passed`);
  }

  console.log('\n🎉 ALL BATCH 3 TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('\n❌ BATCH 3 TEST FAILED:', err);
  process.exit(1);
});
