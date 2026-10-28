const fs = require('fs');
const assert = require('assert');

// Mock browser environment
global.window = {
  MEME_CARDS: [],
  MEME_CARD_PICTURES: {},
  MEME_CARD_DETAILS: {},
  MEME_DECK_PRESETS: {},
  MEME_EXTRA_PRESETS: {},
  ARCANA_CATALOGUE: {}
};

eval(fs.readFileSync('assets/js/meme_catalog_anime.js', 'utf8'));
eval(fs.readFileSync('assets/js/meme_phase3_catalog.js', 'utf8'));
eval(fs.readFileSync('assets/js/meme_duel_links_catalog.js', 'utf8'));
eval(fs.readFileSync('assets/js/meme_fusion_recipes.js', 'utf8'));

console.log('🧪 Testing Elemental HERO Gaia Fusion Recipes & Attribute Matching...');

const gaia = window.MEME_CARDS.find(c => c.id === 'MGX-elemental_hero_gaia');
assert(gaia, 'MGX-elemental_hero_gaia should exist');
console.log('✓ Gaia exists:', gaia.name, gaia.fusion_recipe);

const cardById = id => window.MEME_CARDS.find(c => c.id === id);

// Case 1: Sparkman (LIGHT Elemental HERO) + Clayman (EARTH Elemental HERO)
const sparkman = cardById('AN-elemental_hero_sparkman');
const clayman = cardById('AN-elemental_hero_clayman');
assert(sparkman && clayman, 'Sparkman and Clayman should exist');

const pool1 = [{ id: sparkman.id, zone: 'hand' }, { id: clayman.id, zone: 'hand' }];
const combos1 = window.memeFusionRecipes.combinations(gaia.fusion_recipe, pool1, e => cardById(e.id));
assert(combos1.length > 0, 'Should find at least 1 combination for Sparkman + Clayman');
console.log('✓ Case 1 passed: Sparkman + Clayman -> Gaia combos:', combos1.length);

// Case 2: Stratos (WIND Elemental HERO) + Woodsman (EARTH Elemental HERO)
const stratos = cardById('MGX-elemental_hero_stratos');
const woodsman = cardById('MGX-elemental_hero_woodsman');
assert(stratos && woodsman, 'Stratos and Woodsman should exist');

const pool2 = [{ id: stratos.id, zone: 'hand' }, { id: woodsman.id, zone: 'field' }];
const combos2 = window.memeFusionRecipes.combinations(gaia.fusion_recipe, pool2, e => cardById(e.id));
assert(combos2.length > 0, 'Should find at least 1 combination for Stratos + Woodsman');
console.log('✓ Case 2 passed: Stratos + Woodsman -> Gaia combos:', combos2.length);

// Case 3: Neos (LIGHT Elemental HERO) + Giant Soldier of Stone (EARTH Non-HERO)
const neos = cardById('AN-elemental_hero_neos');
const stone = cardById('AN-giant_soldier_of_stone');
assert(neos && stone, 'Neos and Giant Soldier of Stone should exist');

const pool3 = [{ id: neos.id, zone: 'hand' }, { id: stone.id, zone: 'field' }];
const combos3 = window.memeFusionRecipes.combinations(gaia.fusion_recipe, pool3, e => cardById(e.id));
assert(combos3.length > 0, 'Should find combination for Neos (HERO) + Stone (EARTH)');
console.log('✓ Case 3 passed: Neos + Stone -> Gaia combos:', combos3.length);

// Case 4: Non-matching monsters (Avian + Burstinatrix) should NOT make Gaia
const avian = cardById('AN-elemental_hero_avian');
const burstinatrix = cardById('AN-elemental_hero_burstinatrix');
const pool4 = [{ id: avian.id, zone: 'hand' }, { id: burstinatrix.id, zone: 'hand' }];
const combos4 = window.memeFusionRecipes.combinations(gaia.fusion_recipe, pool4, e => cardById(e.id));
assert.strictEqual(combos4.length, 0, 'Avian + Burstinatrix should NOT make Gaia');
console.log('✓ Case 4 passed: Avian + Burstinatrix correctly produces 0 Gaia combos');

console.log('=========================================');
console.log('🎉 ALL GAIA FUSION TESTS PASSED!');
console.log('=========================================');
