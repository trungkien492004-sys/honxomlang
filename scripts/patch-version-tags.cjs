const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '../memecard.html');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/meme_polish\.css\?v=[^"'\s]+/g, 'meme_polish.css?v=20261101-calm-v3');
content = content.replace(/meme_battle_guide\.css\?v=[^"'\s]+/g, 'meme_battle_guide.css?v=20261101-calm-v3');
content = content.replace(/meme_card_polish\.css\?v=[^"'\s]+/g, 'meme_card_polish.css?v=20261101-calm-v3');
content = content.replace(/meme_vfx_battle\.css\?v=[^"'\s]+/g, 'meme_vfx_battle.css?v=20261101-calm-v3');
content = content.replace(/meme_vfx_summon\.css\?v=[^"'\s]+/g, 'meme_vfx_summon.css?v=20261101-calm-v3');
content = content.replace(/meme_anime_dialogue\.css\?v=[^"'\s]+/g, 'meme_anime_dialogue.css?v=20261101-calm-v3');

content = content.replace(/meme_vfx_battle\.js\?v=[^"'\s]+/g, 'meme_vfx_battle.js?v=20261101-calm-v3');
content = content.replace(/meme_vfx_summon\.js\?v=[^"'\s]+/g, 'meme_vfx_summon.js?v=20261101-calm-v3');
content = content.replace(/meme_audio_sfx\.js\?v=[^"'\s]+/g, 'meme_audio_sfx.js?v=20261101-calm-v3');
content = content.replace(/meme_anime_dialogue\.js\?v=[^"'\s]+/g, 'meme_anime_dialogue.js?v=20261101-calm-v3');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated cache-busting versions in memecard.html');
