const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../assets/js/meme_game.js');
let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// 1. chooseHero - add quick button to equip character's supreme deck
const oldChoose = `  const h=getHero(id);$('selectedHeroSummary').innerHTML=\`\${heroFigure(h,'hero-portrait')}<div><small>\${esc(h.name)} · KỸ NĂNG ĐẤU SĨ</small><strong>\${h.icon} \${esc(h.skill)}</strong><p>\${esc(h.description)}</p><span>Mọi bộ bài · MAIN của bạn · 1 lần/trận</span></div>\`;`;

const newChoose = `  const h=getHero(id);
  const supremeDeckName={yugi:'Yugi · Ma Thuật Tối Thượng',kaiba:'Kaiba · Đỉnh Cao Mắt Xanh',joey:'Joey · Rồng Đen Bất Diệt',pegasus:'Pegasus · Vương Quốc Hoạt Hình',jaden:'Jaden · Anh Hùng Tối Thượng',zane:'Zane · Rồng Máy Tận Diệt'}[h.code];
  $('selectedHeroSummary').innerHTML=\`\${heroFigure(h,'hero-portrait')}<div><small>\${esc(h.name)} · KỸ NĂNG ĐẤU SĨ</small><strong>\${h.icon} \${esc(h.skill)}</strong><p>\${esc(h.description)}</p><span>Mọi bộ bài · MAIN của bạn · 1 lần/trận</span>\${supremeDeckName?\`<div style="margin-top:6px;"><button type="button" class="secondary-btn" id="equipHeroSupremeBtn" style="font-size:0.8rem;padding:3px 10px;">⭐ Dùng Bộ Tối Thượng \${esc(h.name)}</button></div>\`:''}</div>\`;
  const equipBtn=$('equipHeroSupremeBtn');
  if(equipBtn&&supremeDeckName&&window.MEME_DECK_PRESETS?.[supremeDeckName]){
    equipBtn.onclick=()=>{
      deckList=[...window.MEME_DECK_PRESETS[supremeDeckName]];
      extraDeckList=[...(window.MEME_EXTRA_PRESETS?.[supremeDeckName]||defaultExtraDeck())];
      saveDeck();
      notify(\`Đã trang bị bộ bài: \${supremeDeckName}!\`);
    };
  }`;

if (!code.includes(oldChoose)) throw Error('oldChoose not found');
code = code.replace(oldChoose, newChoose);

// 2. startGame - Bot uses Supreme decks by default ('hard' / default), balanced on 'normal', basic on 'easy'
const oldStartGame = `  const presets=Object.keys(window.MEME_DECK_PRESETS||{}),preset=presets[Math.floor(Math.random()*presets.length)],botDeck=preset?[...MEME_DECK_PRESETS[preset]]:defaultDeck(),botHero=HEROES.find(h=>preset?.startsWith(h.group+' ·'));
  duel={player:blankSide(deckList,extraDeckList,chosenHero),enemy:blankSide(botDeck,preset?MEME_EXTRA_PRESETS[preset]:defaultExtraDeck(),botHero?.id||0),turn:'player',phase:'MAIN1',round:1,normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};`;

const newStartGame = `  const p2Settings = window.memePhase2?.settings || {};
  const diff = p2Settings.difficulty || 'hard';
  const customBotDeck = p2Settings.botDeck;
  const supremePresets = [
    'Kaiba · Đỉnh Cao Mắt Xanh',
    'Yugi · Ma Thuật Tối Thượng',
    'Joey · Rồng Đen Bất Diệt',
    'Pegasus · Vương Quốc Hoạt Hình',
    'Jaden · Anh Hùng Tối Thượng',
    'Zane · Rồng Máy Tận Diệt'
  ];
  const normalPresets = [
    'Kaiba · Phản công', 'Kaiba · Obelisk',
    'Yugi · Phản công', 'Yugi · Thần Osiris',
    'Joey · Phản công', 'Joey · Thời gian',
    'Pegasus · Phản công',
    'Jaden · Phản công', 'Jaden · Neo-Spacian',
    'Zane · Phản công', 'Zane · Cyberdark'
  ];
  const easyPresets = [
    'Kaiba · Kinh điển',
    'Yugi · Kinh điển',
    'Joey · Kinh điển',
    'Pegasus · Kinh điển',
    'Jaden · Kinh điển',
    'Zane · Kinh điển'
  ];
  let preset = null;
  if (customBotDeck && customBotDeck !== 'auto' && window.MEME_DECK_PRESETS?.[customBotDeck]) {
    preset = customBotDeck;
  } else {
    let pool = supremePresets;
    if (diff === 'easy') pool = easyPresets;
    else if (diff === 'normal') pool = normalPresets;
    else pool = supremePresets;
    preset = pool[Math.floor(Math.random() * pool.length)];
  }
  const botDeck = preset && window.MEME_DECK_PRESETS?.[preset] ? [...window.MEME_DECK_PRESETS[preset]] : defaultDeck();
  const botHero = HEROES.find(h => preset?.startsWith(h.group + ' ·'));
  const botHeroId = botHero ? botHero.id : (HEROES.length ? Math.floor(Math.random() * HEROES.length) : 0);
  const botExtras = (preset && window.MEME_EXTRA_PRESETS?.[preset]) ? [...window.MEME_EXTRA_PRESETS[preset]] : defaultExtraDeck();
  duel={player:blankSide(deckList,extraDeckList,chosenHero),enemy:blankSide(botDeck,botExtras,botHeroId),turn:'player',phase:'MAIN1',round:1,normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};`;

if (!code.includes(oldStartGame)) throw Error('oldStartGame not found');
code = code.replace(oldStartGame, newStartGame);

// 3. enemyName in startGame
const oldPlayerName = `$('playerName').textContent=HERO_NAMES[chosenHero];`;
const newPlayerName = `$('playerName').textContent=HERO_NAMES[chosenHero];$('enemyName').textContent=HEROES[botHeroId]?.name || 'Seto Kaiba';`;
if (!code.includes(oldPlayerName)) throw Error('oldPlayerName not found');
code = code.replace(oldPlayerName, newPlayerName);

// 4. deckPreset dropdown in renderDeckBuilder
const oldDeckPreset = `<select id="deckPreset" aria-label="Chọn bộ bài mẫu"><option value="">Áp dụng bộ bài mẫu…</option>\${Object.keys(window.MEME_DECK_PRESETS||{}).map(name=>\`<option value="\${esc(name)}">\${esc(name)}</option>\`).join('')}</select>`;

const newDeckPreset = `<select id="deckPreset" aria-label="Chọn bộ bài mẫu"><option value="">Áp dụng bộ bài mẫu…</option><optgroup label="⭐ Bộ Tối Thượng (Duel Links Meta)">\${['Kaiba · Đỉnh Cao Mắt Xanh','Yugi · Ma Thuật Tối Thượng','Joey · Rồng Đen Bất Diệt','Pegasus · Vương Quốc Hoạt Hình','Jaden · Anh Hùng Tối Thượng','Zane · Rồng Máy Tận Diệt'].filter(n=>window.MEME_DECK_PRESETS?.[n]).map(name=>\`<option value="\${esc(name)}">\${esc(name)}</option>\`).join('')}</optgroup><optgroup label="⚔️ Bộ Cân Bằng (Phản công & Thần)">\${Object.keys(window.MEME_DECK_PRESETS||{}).filter(n=>!['Kaiba · Đỉnh Cao Mắt Xanh','Yugi · Ma Thuật Tối Thượng','Joey · Rồng Đen Bất Diệt','Pegasus · Vương Quốc Hoạt Hình','Jaden · Anh Hùng Tối Thượng','Zane · Rồng Máy Tận Diệt'].includes(n)&&!n.includes('Kinh điển')).map(name=>\`<option value="\${esc(name)}">\${esc(name)}</option>\`).join('')}</optgroup><optgroup label="🛡️ Bộ Cơ Bản (Kinh điển)">\${Object.keys(window.MEME_DECK_PRESETS||{}).filter(n=>n.includes('Kinh điển')).map(name=>\`<option value="\${esc(name)}">\${esc(name)}</option>\`).join('')}</optgroup></select>`;

if (!code.includes(oldDeckPreset)) throw Error('oldDeckPreset not found');
code = code.replace(oldDeckPreset, newDeckPreset);

fs.writeFileSync(file, code.replace(/\n/g, '\r\n'));
console.log('Successfully updated assets/js/meme_game.js!');
