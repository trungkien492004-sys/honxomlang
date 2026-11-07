// Sinh assets/tutien/js/tutien_bundle.js từ audio.js + renderer.js + tutien_engine.js.
// tutien.html chạy bundle; ba file nguồn là bản gốc. Chạy: node scripts/sync-tutien.cjs
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'tutien', 'js');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

const bundle = read('tutien_bundle.js');
const marker = '// --- 2. 60FPS CANVAS 2D RENDERER ---';
const head = bundle.slice(0, bundle.indexOf(marker));
const renderer = read('renderer.js').replace(/^[\s\S]*?(?=export class GameRenderer)/, '').replace('export class', 'class');
let engine = read('tutien_engine.js')
  .replace(/^[\s\S]*?(?=\/\/ CẤU HÌNH CẢNH GIỚI)/, '')
  .replace(/^export (const|function|class) /gm, '$1 ');
const out = head + marker + '\n' + renderer.trimEnd() + '\n\n// --- 3. GAME ENGINE ---\n' + engine;
fs.writeFileSync(path.join(dir, 'tutien_bundle.js'), out);
console.log('tutien_bundle.js regenerated:', out.split('\n').length, 'lines');
