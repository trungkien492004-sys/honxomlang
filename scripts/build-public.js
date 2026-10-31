const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
if(path.dirname(out)!==root||path.basename(out)!=='dist')throw Error('Build output must stay in this workspace dist directory.');
try {
  fs.rmSync(out, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch (e) {}
fs.mkdirSync(out, { recursive: true });
for (const file of ['index.html', 'memecard.html', 'tutien.html']) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
console.log(`Built public game in ${out}`);
