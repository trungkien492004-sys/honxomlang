const fs = require('fs'), vm = require('vm');
global.window = { MEME_CARDS: [] };
vm.runInThisContext(fs.readFileSync('assets/js/meme_duel_links_catalog.js', 'utf8'));
const cards = window.MEME_DUEL_LINKS_GROUP.cards;
const ids = process.argv.slice(2);
for (const id of ids) {
  const c = cards.find(x => x.id === id);
  if (!c) { console.log(id, 'MISSING'); continue; }
  console.log(id, JSON.stringify({name_en:c.name_en, element:c.element, stars:c.stars, atk:c.atk, def:c.def, cat:c.monster_category, zone:c.deck_zone, mats:c.fusion_materials, distinct:c.distinct_element, type:c.card_type, sc:c.spell_category, code:c.effect_code, summon_type:c.summon_type, hand_action:c.hand_action, special_only:c.special_only}));
}
