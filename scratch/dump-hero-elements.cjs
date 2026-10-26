const fs = require('fs');
function extract(file) {
  const t = fs.readFileSync(file, 'utf8');
  const start = t.indexOf('const data=') + 'const data='.length;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return JSON.parse(t.slice(start, i + 1));
    }
  }
  throw new Error('no end');
}
const data = extract('assets/js/meme_phase3_catalog.js');
const rows = data.cards
  .filter(c => /Elemental HERO/i.test(c.name_en || ''))
  .map(c => [c.id, c.name_en, c.element, c.source_attribute, c.stars, c.deck_zone, JSON.stringify(c.fusion_materials || c.fusion_recipe || null)]);
for (const r of rows) console.log(r.join(' | '));
console.log('total', data.cards.length);
