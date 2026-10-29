// Fetch official cropped card art for the ZEXAL / Yuma cards, matching the anime picture pipeline.
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const vm = require('node:vm');

let sharp;
try {
  sharp = require('sharp');
} catch {
  sharp = require('C:/Users/Kien/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
}

const root = path.resolve(__dirname, '..');
const picturesDir = path.join(root, 'assets/memecard/pictures');
const thumbsDir = path.join(picturesDir, 'thumbs');
fs.mkdirSync(thumbsDir, { recursive: true });

const sandbox = { window: {}, console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/meme_zexal_catalog.js'), 'utf8'), sandbox);
const cards = sandbox.MEME_CARDS;

const fetchBuffer = url => new Promise((resolve, reject) => {
  https.get(url, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return fetchBuffer(res.headers.location).then(resolve, reject);
    }
    if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => resolve(Buffer.concat(chunks)));
  }).on('error', reject);
});

(async () => {
  let done = 0;
  for (const c of cards) {
    const api = JSON.parse((await fetchBuffer('https://db.ygoprodeck.com/api/v7/cardinfo.php?name=' + encodeURIComponent(c.name_en))).toString());
    const card = api.data?.[0];
    if (!card?.card_images?.length) {
      console.warn(`[WARNING] No API card image for ${c.name_en} (${c.id})`);
      continue;
    }
    const image = card.card_images[0].image_url_cropped || card.card_images[0].image_url;
    const buffer = await fetchBuffer(image);
    await sharp(buffer).resize(256, 256, { fit: 'cover' }).webp({ quality: 90 }).toFile(path.join(picturesDir, c.id + '.webp'));
    await sharp(buffer).resize(144, 144, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(thumbsDir, c.id + '.webp'));
    done++;
    process.stdout.write(`\r  Fetched ${done}/${cards.length} (${c.name_en})`);
  }
  console.log(`\nZEXAL pictures ready: ${done}/${cards.length}.`);
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
