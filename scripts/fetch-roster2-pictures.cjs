// Fetch official cropped card art for Roster 2 (Marik, Jack, Shark, Chazz) cards from YGOPRODeck API.
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
const artDir = path.join(root, 'assets/memecard/art');

fs.mkdirSync(picturesDir, { recursive: true });
fs.mkdirSync(thumbsDir, { recursive: true });
fs.mkdirSync(artDir, { recursive: true });

const sandbox = { window: {}, console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/meme_roster2_catalog.js'), 'utf8'), sandbox);
const cards = (sandbox.MEME_CARDS || []).filter(c => c.catalogue_version === 'roster2-v1');

console.log(`Processing ${cards.length} cards...`);

const fetchBuffer = url => new Promise((resolve, reject) => {
  https.get(url, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return fetchBuffer(res.headers.location).then(resolve, reject);
    }
    if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => resolve(Buffer.concat(chunks)));
  }).on('error', reject);
});

(async () => {
  let done = 0;
  for (const c of cards) {
    const apiRes = await fetchBuffer('https://db.ygoprodeck.com/api/v7/cardinfo.php?name=' + encodeURIComponent(c.name_en));
    const apiJson = JSON.parse(apiRes.toString());
    const cardData = apiJson.data?.[0];
    if (!cardData?.card_images?.length) {
      console.warn(`[WARNING] No API card image for ${c.name_en} (${c.id})`);
      continue;
    }
    const croppedUrl = cardData.card_images[0].image_url_cropped || cardData.card_images[0].image_url;
    const imgBuffer = await fetchBuffer(croppedUrl);

    // 256x256 webp for full view
    await sharp(imgBuffer).resize(256, 256, { fit: 'cover' }).webp({ quality: 90 }).toFile(path.join(picturesDir, c.id + '.webp'));
    // 144x144 webp for thumb view
    await sharp(imgBuffer).resize(144, 144, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(thumbsDir, c.id + '.webp'));
    // Also save PNG into artDir
    await sharp(imgBuffer).resize(400, 400, { fit: 'contain', background: { r: 15, g: 28, b: 51, alpha: 1 } }).png().toFile(path.join(artDir, c.id + '.png'));

    done++;
    process.stdout.write(`\r  Fetched [${done}/${cards.length}] ${c.id}: ${c.name_en}`);
    // Tiny delay to be gentle to the API
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`\n\nAll ${done}/${cards.length} card pictures fetched and generated successfully!`);
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
