// ===== DOWNLOAD & PROCESS CARD AVATARS FOR 60 DUEL LINKS CARDS =====
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

// Load cards
const dlContent = fs.readFileSync(path.join(root, 'assets/js/meme_duel_links_catalog.js'), 'utf8');
const sandbox = { window: {}, MEME_CARDS: [], MEME_DECK_PRESETS: {}, MEME_EXTRA_PRESETS: {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(dlContent, sandbox);
const cards = sandbox.MEME_DUEL_LINKS_GROUP.cards;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve, reject);
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

const nameFixes = {
  'Toon Page-Flipper': 'Toon Page-Flip'
};

const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const symbol = { Hỏa: '火', Thủy: '水', Phong: '風', Quang: '光', Ám: '影', Cơ: '機' };

function generateFallbackSvg(c, index) {
  const hash = [...c.id].reduce((n, x) => (n * 31 + x.charCodeAt(0)) >>> 0, 0), variant = hash % 5;
  const color = c.art?.c1 || '#38bdf8', dark = c.art?.c2 || '#0c4a6e', flip = hash % 2 ? -1 : 1;
  const rays = Array.from({ length: 24 }, (_, i) => {
    const angle = i * Math.PI / 12, x = 180 + 310 * Math.cos(angle), y = 220 + 310 * Math.sin(angle);
    return `<path d="M${x} ${y} L${180 + (70 + hash % 40) * Math.cos(angle)} ${220 + (70 + hash % 40) * Math.sin(angle)}"/>`;
  }).join('');
  const hair = ['M-65-82L-79-137-36-119-27-157 5-130 45-151 42-113 79-122 63-77 37-104 12-92-9-113-35-88Z', 'M-68-87Q-96-162-28-162Q51-194 78-98L46-108 25-137 1-101-17-133-43-93Z', 'M-69-80L-60-150-20-131 3-168 30-131 66-143 71-71 38-104 11-90-17-110-40-83Z', 'M-70-78Q-75-164 5-155Q92-170 73-70L46-103 25-118 2-88-23-118-48-96Z', 'M-69-76L-82-125-48-112-40-165 1-131 38-166 44-118 81-126 67-78 39-108 12-95-8-114-33-88Z'][variant];
  let subject;
  if (c.card_type === 'Monster') {
    const dragon = /long|rồng|dragon/i.test(c.name_en || '') && (c.stars >= 6 || c.tribe === 'Rồng');
    subject = dragon ? `<g transform="translate(180 245)"><path d="M-28 70Q-148 58-149-49L-94-15-119-117-47-64-12-103 11-57 73-114 54-37 132-82 113 28 51 77Z" fill="${dark}"/><path d="M-9 105Q-47 48-44-13L-78-67-31-55-9-108 23-71 61-77 38-27 57 28 20 91Z" fill="url(#armor)"/><path d="M-44-63L-62-126-10-94 18-137 27-88 59-121 42-63" fill="${color}"/><path d="M-38-32L-10-40-19-22Z M16-40L40-32 22-22Z" fill="#fff4bf"/><path d="M-8-8L14-7 7 6Z" fill="#081425"/><path d="M-20 30L9 43 30 22M-14 54L9 64 26 49M-9 77L9 86 18 73" fill="none" stroke="#fff4bf" stroke-width="5"/><path d="M-44 43L-110 99-63 91-87 125-18 76M44 39L106 101 59 88 86 124 19 77" fill="${color}"/></g>` :
      `<g transform="translate(180 250) scale(${flip} 1)"><path d="M-49 5Q-87 51-100 116L-43 93-10 135 15 92 79 119Q75 47 39 7Z" fill="${dark}"/>
      <path d="M-47 10L-72 55-54 82-22 54-3 85 25 54 55 84 72 52 45 11 20 26-23 26Z" fill="url(#armor)"/><path d="M-45 10L-19 2 0 29 20 2 46 10 27 44-29 44Z" fill="${color}"/>
      <path d="M-53-84Q-68-45-34-15L-18 4 21 4 43-23Q65-52 51-91Z" fill="#f8d1ac"/><path d="${hair}" fill="${dark}"/>
      <path d="M-43-65L-11-61-25-50Z M12-61L43-65 27-49Z" fill="#fff"/><path d="M-26-61L-22-51M25-61L29-51" stroke="#13263d" stroke-width="7"/><path d="M-14-26L13-28" stroke="#774653" stroke-width="3"/>
      <path d="M-28 89L-36 145-8 145 1 100 12 145 41 145 29 86Z" fill="#18263d"/>
      <path d="M55 66L97-76 109-73 68 75Z" fill="#f4faff"/><path d="M82-70L111-100 111-73Z" fill="${color}"/><path d="M48 59L79 68" stroke="#ffe59a" stroke-width="10"/>
      <path d="M-70 49L-107 14-108 53-91 78-58 76Z" fill="${color}"/><circle cx="0" cy="49" r="12" fill="#fff3bd"/><path d="M-4 42L5 49-4 56" fill="${dark}"/></g>`;
  } else if (c.card_type === 'Spell') {
    subject = `<g transform="translate(180 235)"><circle r="97" fill="#07192c" stroke="${color}" stroke-width="5"/><path d="M0-123L27-40 112-40 43 11 70 96 0 44-70 96-43 11-112-40-27-40Z" fill="${dark}" stroke="#ffeca9" stroke-width="4"/><circle r="49" fill="url(#armor)"/><path d="M-18 22L5-38 23-8 0 41 4 4Z" fill="#fff3bd"/><path d="M-110 82Q-32 46 0 82Q36 47 110 83L91 119Q25 91 0 123Q-35 92-94 117Z" fill="#e0e8e4" stroke="#30485c" stroke-width="6"/></g>`;
  } else {
    subject = `<g transform="translate(180 235)"><path d="M0-125L110-62 110 63 0 126-110 63-110-62Z" fill="${dark}" stroke="#edc7ff" stroke-width="6"/><path d="M-90-54L0-105 90-54 90 54 0 106-90 54Z" fill="#0b182c" stroke="${color}" stroke-width="3"/><path d="M-70-9Q0-87 70-9Q0 66-70-9Z" fill="#f2caff"/><path d="M0-38L22-9 0 24-22-9Z" fill="${dark}"/><path d="M-104 69L-66 39M-84 91L-46 61M104-70L65-39M83-93L45-62" stroke="#ffeaa0" stroke-width="16" stroke-linecap="round"/></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440"><title>${escape(c.name)} — Duel Links Meta</title><defs><linearGradient id="bg" x2=".8" y2="1"><stop stop-color="${dark}"/><stop offset="1" stop-color="#07172d"/></linearGradient><linearGradient id="armor" x2="1" y2="1"><stop stop-color="#f7ebc5"/><stop offset=".32" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient><radialGradient id="aura"><stop stop-color="${color}" stop-opacity=".8"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><path fill="url(#bg)" d="M0 0H360V440H0Z"/><circle cx="180" cy="215" r="209" fill="url(#aura)"/><g stroke="${color}" stroke-width="2" opacity=".28">${rays}</g><g fill="none" stroke="#ffe6a0" opacity=".32"><circle cx="180" cy="215" r="126"/><circle cx="180" cy="215" r="137"/><path d="M45 215H315M180 78V352M82 117L278 313M82 313L278 117"/></g><path d="M0 35L104 0H0ZM360 355L256 440H360Z" fill="${color}" opacity=".25"/>${subject}<g fill="#fff0bd" font-family="serif" font-weight="bold"><text x="20" y="43" font-size="29">${symbol[c.element] || '✦'}</text><text x="338" y="418" text-anchor="end" font-family="sans-serif" font-size="13">DL · ${String(index + 1).padStart(3, '0')}</text></g><path d="M13 62V13H63M297 13H347V62M347 378V427H297M63 427H13V378" fill="none" stroke="${color}" stroke-width="3"/></svg>`;
}

(async () => {
  console.log('Fetching card database from YGOPRODeck API...');
  const apiData = await fetchJson('https://db.ygoprodeck.com/api/v7/cardinfo.php');
  const apiMap = new Map();
  for (const item of apiData.data) {
    apiMap.set(item.name.toLowerCase(), item);
  }

  console.log(`Processing pictures for ${cards.length} Duel Links cards...`);
  let successCount = 0;

  for (const [idx, c] of cards.entries()) {
    const queryName = nameFixes[c.name_en] || c.name_en;
    const apiCard = apiMap.get(queryName.toLowerCase());

    // Generate fallback SVG
    const svgPath = path.join(artDir, c.id + '.svg');
    fs.writeFileSync(svgPath, generateFallbackSvg(c, idx));

    if (!apiCard || !apiCard.card_images || !apiCard.card_images.length) {
      console.warn(`[WARNING] No API card image found for: ${c.name_en} (${c.id})`);
      continue;
    }

    const cropUrl = apiCard.card_images[0].image_url_cropped;
    const fullWebpPath = path.join(picturesDir, c.id + '.webp');
    const thumbWebpPath = path.join(thumbsDir, c.id + '.webp');

    try {
      const buffer = await fetchBuffer(cropUrl);
      await sharp(buffer).resize(362, 362, { fit: 'cover' }).webp({ quality: 90 }).toFile(fullWebpPath);
      await sharp(buffer).resize(144, 144, { fit: 'cover' }).webp({ quality: 80 }).toFile(thumbWebpPath);
      successCount++;
      process.stdout.write(`\r  Downloaded & processed: ${successCount}/${cards.length} (${c.name_en})`);
    } catch (e) {
      console.error(`\nFailed to process image for ${c.name_en}:`, e.message);
    }
  }

  console.log(`\n\n🎉 Successfully generated avatars for ${successCount}/${cards.length} cards!`);
})();
