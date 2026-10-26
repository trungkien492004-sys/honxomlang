const fs = require('fs');
const BS = String.fromCharCode(92), Q = String.fromCharCode(34);
function loadArray(file, marker) {
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf(marker) + marker.length;
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (inStr) { if (esc) esc = false; else if (ch === BS) esc = true; else if (ch === Q) inStr = false; continue; }
    if (ch === Q) inStr = true;
    else if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  return JSON.parse(src.slice(start, end));
}
const cards = loadArray('assets/js/meme_catalog_anime.js', 'window.MEME_CARDS=');
const ids = process.argv.slice(2);
for (const id of ids) {
  const c = cards.find(x => x.id === id);
  console.log(id, c ? JSON.stringify({name_en:c.name_en, element:c.element, stars:c.stars, atk:c.atk, def:c.def, cat:c.monster_category, zone:c.deck_zone, mats:c.fusion_materials, contact:c.contact, code:c.effect_code, type:c.card_type, sc:c.spell_category}) : 'MISSING');
}
