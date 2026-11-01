const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'memecard.html');
let s = fs.readFileSync(target, 'utf8');

const cssToInsert = [
  '  <link rel="stylesheet" href="assets/css/meme_vfx_battle.css?v=20261101-b1" />',
  '  <link rel="stylesheet" href="assets/css/meme_vfx_summon.css?v=20261101-s1" />',
  '  <link rel="stylesheet" href="assets/css/meme_anime_dialogue.css?v=20261101-d1" />'
];

for (const css of cssToInsert) {
  if (!s.includes(css.trim())) {
    s = s.replace('</head>', css + '\r\n</head>');
  }
}

const jsToInsert = [
  '  <script src="assets/js/meme_vfx_battle.js?v=20261101-b1"></script>',
  '  <script src="assets/js/meme_vfx_summon.js?v=20261101-s1"></script>',
  '  <script src="assets/js/meme_audio_sfx.js?v=20261101-a1"></script>',
  '  <script src="assets/js/meme_anime_dialogue.js?v=20261101-d1"></script>'
];

for (const js of jsToInsert) {
  if (!s.includes(js.trim())) {
    s = s.replace('</body>', js + '\r\n</body>');
  }
}

fs.writeFileSync(target, s, 'utf8');
console.log('memecard.html verified with all 7 GĐ1-GĐ3 tags.');
