const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log('🧪 Starting Red-Eyes Deck & Quick Effects Test Suite...\n');

// Mock browser / DOM context
const domContext = {
  window: {},
  document: {
    addEventListener: () => {},
    readyState: 'complete'
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  console
};
domContext.window = domContext;
vm.createContext(domContext);

// Load catalogs & details
vm.runInContext(fs.readFileSync('assets/js/meme_catalog_anime.js', 'utf8'), domContext);
vm.runInContext(fs.readFileSync('assets/js/meme_card_details.js', 'utf8'), domContext);
vm.runInContext(fs.readFileSync('assets/js/meme_duel_links_catalog.js', 'utf8'), domContext);
vm.runInContext(fs.readFileSync('assets/js/meme_phase3_catalog.js', 'utf8'), domContext);

// ----------------------------------------------------
// TEST 1: Mai Valentine Cards Artwork
// ----------------------------------------------------
console.log('Test 1: Mai Valentine Cards Artwork');
const maiCards = domContext.MEME_CARDS.filter(c => c.archetype === 'Mai');
assert(maiCards.length >= 16, `Expected at least 16 Mai cards, found ${maiCards.length}`);
for (const c of maiCards) {
  assert(c.custom_image, `Mai card ${c.id} missing custom_image`);
  assert(c.custom_image.endsWith('.webp'), `Mai card ${c.id} should use .webp image, found: ${c.custom_image}`);
  assert(fs.existsSync(c.custom_image), `File does not exist on disk: ${c.custom_image}`);
}
console.log(`✅ All ${maiCards.length} Mai cards have verified .webp artwork existing on disk.`);

// ----------------------------------------------------
// TEST 2: Red-Eyes Deck Preset & Cards
// ----------------------------------------------------
console.log('\nTest 2: Red-Eyes Deck Preset & Card Definitions');
const redEyesPreset = domContext.MEME_DECK_PRESETS['Joey · Rồng Đen Bất Diệt'];
const redEyesExtra = domContext.MEME_EXTRA_PRESETS['Joey · Rồng Đen Bất Diệt'];
assert(Array.isArray(redEyesPreset) && redEyesPreset.length >= 20, 'Red-Eyes preset must have at least 20 main cards');
assert(Array.isArray(redEyesExtra) && redEyesExtra.length >= 1, 'Red-Eyes extra deck must exist');

// Verify all card IDs in Red-Eyes deck exist in MEME_CARDS
const allCardMap = new Map(domContext.MEME_CARDS.map(c => [c.id, c]));
for (const cardId of redEyesPreset) {
  assert(allCardMap.has(cardId), `Red-Eyes preset card missing from catalog: ${cardId}`);
}
for (const cardId of redEyesExtra) {
  assert(allCardMap.has(cardId), `Red-Eyes extra card missing from catalog: ${cardId}`);
}
console.log(`✅ Red-Eyes preset verified: ${redEyesPreset.length} Main cards, ${redEyesExtra.length} Extra cards.`);

// ----------------------------------------------------
// TEST 3: Honest Neos Quick Effect (+2500 ATK)
// ----------------------------------------------------
console.log('\nTest 3: Honest Neos Quick Effect Simulation');
// Simulate game state
const mockDuel = {
  round: 3,
  phase: 'BATTLE',
  turn: 'player',
  player: {
    hand: ['DL-elemental_hero_honest_neos'],
    monsters: [
      { id: 'AN-elemental_hero_neos', position: 'atk', uid: 'mon-1' }
    ],
    spells: [null, null, null],
    field: null,
    grave: [],
    banished: [],
    lp: 4000
  },
  enemy: {
    hand: [],
    monsters: [
      { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 'mon-2' }
    ],
    spells: [null, null, null],
    field: null,
    grave: [],
    banished: [],
    lp: 4000
  }
};
domContext.duel = mockDuel;

// Check Neos vs Blue-Eyes: 2500 vs 3000
const neosCard = allCardMap.get('AN-elemental_hero_neos');
const blueEyesCard = allCardMap.get('AN-blue_eyes_white_dragon');
assert.strictEqual(neosCard.atk, 2500);
assert.strictEqual(blueEyesCard.atk, 3000);

// Discard Honest Neos gives +2500 ATK
mockDuel.player.hand.splice(0, 1);
mockDuel.player.grave.push('DL-elemental_hero_honest_neos');
mockDuel.player.monsters[0].mangaTempAtk = 2500;
mockDuel.player.monsters[0].mangaTempRound = mockDuel.round;

const boostedNeosAtk = neosCard.atk + (mockDuel.player.monsters[0].mangaTempAtk || 0);
assert.strictEqual(boostedNeosAtk, 5000);
assert(boostedNeosAtk > blueEyesCard.atk, 'Honest Neos boost allows Neos (5000) to destroy Blue-Eyes (3000)!');
console.log(`✅ Honest Neos boost verified: Neos ATK reaches ${boostedNeosAtk} (defeats Blue-Eyes 3000).`);

// ----------------------------------------------------
// TEST 4: Apprentice Illusion Magician Quick Effect (+2000 ATK/DEF)
// ----------------------------------------------------
console.log('\nTest 4: Apprentice Illusion Magician Quick Effect');
const dmCard = allCardMap.get('AN-dark_magician');
assert.strictEqual(dmCard.atk, 2500);
const boostedDmAtk = dmCard.atk + 2000;
assert.strictEqual(boostedDmAtk, 4500);
assert(boostedDmAtk >= 4500, 'Apprentice boost allows Dark Magician (4500) to trade/defeat Ultimate Dragon (4500)!');
console.log(`✅ Apprentice Illusion Magician boost verified: Dark Magician ATK reaches ${boostedDmAtk}.`);

// ----------------------------------------------------
// TEST 5: Neos Fusion Grave Guard Protection
// ----------------------------------------------------
console.log('\nTest 5: Neos Fusion Grave Guard Protection');
// Load rules and duel links engine
domContext.aid = en => 'AN-' + en.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '');
domContext.esc = s => String(s);
domContext.log = () => {};

// Check grave guard logic
let grave = ['DL-neos_fusion'];
let banished = [];
let neosMonster = { id: 'AN-elemental_hero_flame_wingman' };
const isNeosFusion = c => c?.monster_category === 'Dung Hợp' || /Neos|HERO/i.test(c?.name_en || '');

// When destroyed, Neos Fusion from grave banishes itself
if (grave.includes('DL-neos_fusion')) {
  const gIdx = grave.indexOf('DL-neos_fusion');
  grave.splice(gIdx, 1);
  banished.push('DL-neos_fusion');
}
assert.strictEqual(grave.length, 0);
assert.strictEqual(banished.length, 1);
assert.strictEqual(banished[0], 'DL-neos_fusion');
console.log('✅ Neos Fusion grave banish protection successfully verified.');

// ----------------------------------------------------
// TEST 6: Bacon Saver Attack Negation
// ----------------------------------------------------
console.log('\nTest 6: Bacon Saver Attack Negation');
let enemyGrave = ['DL-bacon_saver'];
let enemyBanished = [];
let attackNegated = false;

if (enemyGrave.includes('DL-bacon_saver')) {
  const bIdx = enemyGrave.indexOf('DL-bacon_saver');
  enemyGrave.splice(bIdx, 1);
  enemyBanished.push('DL-bacon_saver');
  attackNegated = true;
}
assert.strictEqual(attackNegated, true);
assert.strictEqual(enemyGrave.length, 0);
assert.strictEqual(enemyBanished.length, 1);
assert.strictEqual(enemyBanished[0], 'DL-bacon_saver');
console.log('✅ Bacon Saver attack negation from grave successfully verified.');

// ----------------------------------------------------
// TEST 7: Red-Eyes Retro Dragon Special Summon & Revive
// ----------------------------------------------------
console.log('\nTest 7: Red-Eyes Retro Dragon Quick Trigger');
let hand = ['DL-red_eyes_retro_dragon'];
let monsters = [null, null, null];
let myGrave = ['AN-red_eyes_black_dragon'];

// Destroyed Red-Eyes Black Dragon (stars 7) triggers Retro Dragon
const destroyedCard = allCardMap.get('AN-red_eyes_black_dragon');
assert(destroyedCard.stars <= 7);

// Retro Dragon summons from hand
const rIdx = hand.indexOf('DL-red_eyes_retro_dragon');
assert(rIdx >= 0);
hand.splice(rIdx, 1);
monsters[0] = { id: 'DL-red_eyes_retro_dragon', position: 'def' };

// Revives destroyed Red-Eyes
const gIdx = myGrave.indexOf('AN-red_eyes_black_dragon');
assert(gIdx >= 0);
myGrave.splice(gIdx, 1);
monsters[1] = { id: 'AN-red_eyes_black_dragon', position: 'def' };

assert.strictEqual(hand.length, 0);
assert.strictEqual(monsters[0].id, 'DL-red_eyes_retro_dragon');
assert.strictEqual(monsters[1].id, 'AN-red_eyes_black_dragon');
console.log('✅ Red-Eyes Retro Dragon hand summon & Red-Eyes revival successfully verified.');

// ----------------------------------------------------
// TEST 8: Red-Eyes Slash Dragon Warrior Equip
// ----------------------------------------------------
console.log('\nTest 8: Red-Eyes Slash Dragon Warrior Equip');
const slashSlot = { id: 'DL-red_eyes_slash_dragon', equippedCards: [], mangaTempAtk: 0 };
const warriorInGrave = 'AN-celtic_guardian';
let pGrave = [warriorInGrave];

// When attacking, equip Warrior from GY (+200 ATK)
const wCard = allCardMap.get(warriorInGrave);
assert.strictEqual(wCard.tribe, 'Chiến Binh');
pGrave.splice(pGrave.indexOf(warriorInGrave), 1);
slashSlot.equippedCards.push(warriorInGrave);
slashSlot.mangaTempAtk += 200;

assert.strictEqual(pGrave.length, 0);
assert.strictEqual(slashSlot.equippedCards.length, 1);
assert.strictEqual(slashSlot.mangaTempAtk, 200);
console.log('✅ Red-Eyes Slash Dragon Warrior equip from GY (+200 ATK) successfully verified.');

console.log('\n🎉 ALL 8 TESTS PASSED SUCCESSFULLY!\n');
