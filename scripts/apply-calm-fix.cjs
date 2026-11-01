const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

// 1. Update meme_battle_guide.css
const bgPath = path.join(root, 'assets/css/meme_battle_guide.css');
let bg = fs.readFileSync(bgPath, 'utf8');
bg = bg.replace(/animation:attackReadyGlow 1\.7s ease-in-out infinite/g, 'animation:none!important');
bg = bg.replace(/animation:attackArrowFloat 1s ease-in-out infinite/g, 'animation:none!important');
bg = bg.replace(/animation:attackSwordAdvance 1\.15s ease-in-out infinite/g, 'animation:none!important');
bg = bg.replace(/@keyframes attackSwordAdvance\{[^}]*\}/g, '@keyframes attackSwordAdvance{0%,100%{transform:none}}');
bg = bg.replace(/@keyframes attackArrowFloat\{[^}]*\}/g, '@keyframes attackArrowFloat{0%,100%{transform:none}}');
fs.writeFileSync(bgPath, bg, 'utf8');
console.log('Updated meme_battle_guide.css');

// 2. Update meme_polish.css
const polPath = path.join(root, 'assets/css/meme_polish.css');
let pol = fs.readFileSync(polPath, 'utf8');
pol = pol.replace(/animation:memeTargetPulse 1\.4s ease-in-out infinite/g, 'animation:none!important');
pol = pol.replace(/transform:translateY\(-4px\)/g, 'transform:none!important');
pol = pol.replace(/\.field-slot\.fx-land\{animation:memeLand \.36s ease-out\}/g, '.field-slot.fx-land{animation:none!important;transform:none!important}');
pol = pol.replace(/@keyframes memeLand\{[^}]*\}/g, '@keyframes memeLand{0%,100%{filter:none;transform:none;scale:1}}');
pol = pol.replace(/@keyframes memeTargetPulse\{[^}]*\}/g, '@keyframes memeTargetPulse{0%,100%{filter:none}}');
fs.writeFileSync(polPath, pol, 'utf8');
console.log('Updated meme_polish.css');

// 3. Update meme_card_polish.css
const cpPath = path.join(root, 'assets/css/meme_card_polish.css');
let cp = fs.readFileSync(cpPath, 'utf8');
cp = cp.replace(/\.soft-land\{[^}]*\}/g, '.soft-land{animation:none!important;transform:none!important}');
cp = cp.replace(/@keyframes softLand\{[^}]*\}/g, '@keyframes softLand{0%,100%{opacity:1;transform:none}}');
fs.writeFileSync(cpPath, cp, 'utf8');
console.log('Updated meme_card_polish.css');

// 4. Update meme_anime_dialogue.css (Remove bounce from dialogue pop)
const diaPath = path.join(root, 'assets/css/meme_anime_dialogue.css');
let dia = fs.readFileSync(diaPath, 'utf8');
dia = dia.replace(/@keyframes dialogueCenterPop\s*\{[\s\S]*?\n\}/, `@keyframes dialogueCenterPop {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%);
  }
  12%, 88% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%);
  }
}`);
fs.writeFileSync(diaPath, dia, 'utf8');
console.log('Updated meme_anime_dialogue.css');

// 5. Update meme_vfx_battle.css (Remove bounce from direct attack pop)
const batPath = path.join(root, 'assets/css/meme_vfx_battle.css');
let bat = fs.readFileSync(batPath, 'utf8');
bat = bat.replace(/@keyframes directAttackPop\s*\{[\s\S]*?\n\}/, `@keyframes directAttackPop {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%);
  }
  15%, 85% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%);
  }
}`);
fs.writeFileSync(batPath, bat, 'utf8');
console.log('Updated meme_vfx_battle.css');
