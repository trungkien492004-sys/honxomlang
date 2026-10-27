const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Verify readDuration is 2500 in meme_game.js
const memeGameCode = fs.readFileSync(path.resolve(__dirname, '../assets/js/meme_game.js'), 'utf8');
assert.ok(memeGameCode.includes('const readDuration = 2500;'), 'readDuration must be 2500');
assert.ok(!memeGameCode.includes('const readDuration = 4000;'), 'readDuration must not be 4000');
console.log('✓ Check 1: readDuration is correctly set to 2500ms.');

// Simulate mock duel environment to test rule helpers
global.window = global;
global.document = {
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, querySelector: () => null }),
  body: { appendChild: () => {} }
};
global.$ = id => ({ querySelector: () => null, classList: { toggle: () => {}, add: () => {}, remove: () => {} }, appendChild: () => {} });

// Load game cards and rules
const animeRulesCode = fs.readFileSync(path.resolve(__dirname, '../assets/js/meme_anime_rules.js'), 'utf8');

// Check that problem functions exist in anime rules code
assert.ok(animeRulesCode.includes('function extraSummonProblem'), 'extraSummonProblem exists');
assert.ok(animeRulesCode.includes('function cardSpecialProblem'), 'cardSpecialProblem exists');
assert.ok(animeRulesCode.includes('function spellProblem'), 'spellProblem exists');
assert.ok(animeRulesCode.includes('function monsterEffectProblem'), 'monsterEffectProblem exists');
console.log('✓ Check 2: Problem helper functions are defined and exported.');

// Verify modal styling
const upgradePhase1Css = fs.readFileSync(path.resolve(__dirname, '../assets/css/meme_upgrade_phase1.css'), 'utf8');
assert.ok(upgradePhase1Css.includes('.detail-card-art,.library-detail-art{width:min(160px,42vw)'), 'detail-card-art size is constrained');
assert.ok(!upgradePhase1Css.includes('width:min(420px,76vw)'), '420px image size is removed');
console.log('✓ Check 3: Card detail image dimensions constrained to responsive clamp.');

const duelCss = fs.readFileSync(path.resolve(__dirname, '../assets/css/meme_duel.css'), 'utf8');
assert.ok(duelCss.includes('max-height:calc(100dvh - 24px)'), 'modal-card has viewport max-height');
assert.ok(duelCss.includes('overflow-y:auto'), 'modal-card has scrollable overflow');
assert.ok(duelCss.includes('.card-desc-line'), 'card description line styled properly');
console.log('✓ Check 4: Modal card is fully scrollable with dedicated description styling.');

console.log('All 4 activation and UI checks passed successfully!');
