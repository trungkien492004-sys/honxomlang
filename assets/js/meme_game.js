// Speed Duel runtime. Card data, extended effects and visual playback are separate
// classic scripts so the same state can be mirrored by the online room.
const $ = id => document.getElementById(id);
const CARDS = (window.MEME_CARDS || []).filter(c=>!c.uncollectible);
const CARD_BY_ID = new Map((window.MEME_CARDS||CARDS).map(card => [card.id, card]));
const HEROES = window.MEME_HEROES;
const HERO_NAMES = HEROES.map(h=>h.name);
const HERO_KEY = 'xom-arcana-duelist-v1';
const PHASES = ['MAIN1','BATTLE','MAIN2'];
const PHASE_NAME = {MAIN1:'MAIN 1',BATTLE:'CHIẾN ĐẤU',MAIN2:'MAIN 2'};
const CATALOGUE = window.ARCANA_CATALOGUE || {mainSize:30,extraLimit:15};
const MAIN_SIZE = CATALOGUE.mainSize;
const EXTRA_LIMIT = CATALOGUE.extraLimit;
const DECK_KEY = CATALOGUE.storageVersion?'xom-arcana-main-'+CATALOGUE.storageVersion:CATALOGUE.cardCount===200?'xom-arcana-main-200-v1':'hai-trinh-meme-deck-v1';
const DECK_LIBRARY_KEY = CATALOGUE.storageVersion?'xom-arcana-decks-'+CATALOGUE.storageVersion:CATALOGUE.cardCount===200?'xom-arcana-decks-200-v1':'xom-arcana-decks-v1';
const EXTRA_KEY = CATALOGUE.storageVersion?'xom-arcana-extra-'+CATALOGUE.storageVersion:CATALOGUE.cardCount===200?'xom-arcana-extra-200-v1':'xom-arcana-extra-v1';
let chosenHero = loadHero();
let extraDeckList = defaultExtraDeck();
let deckList = loadDeck();
let deckLibrary = loadDeckLibrary();
let deckDraft = null;
let deckView = 'all';
let duel = null;
let aiTimer = null;
let deckFilter = 'All';
let deckSearch = '';
let pileView = null;
let skillView = null;
let deckInspectedId = CARDS[0]?.id;
let deckArchetype = '';
let deckRarity = '';

function validHero(id){return Number.isInteger(id)&&id>=0&&id<HEROES.length;}
function getHero(id){return HEROES[validHero(id)?id:0];}
function loadHero(){try{const id=JSON.parse(localStorage.getItem(HERO_KEY));if(validHero(id))return id;}catch{}return 0;}
function heroStyle(hero){return `--hero-color:${hero.color};--hero-pos:${hero.position}`;}
function heroFigure(hero,className='hero-figure'){return `<span class="${className}" style="${heroStyle(hero)}" aria-hidden="true"></span>`;}
function chooseHero(id){
  if(!validHero(id))return;chosenHero=id;try{localStorage.setItem(HERO_KEY,JSON.stringify(id));}catch{}
  document.querySelectorAll('[data-hero]').forEach(b=>{const selected=Number(b.dataset.hero)===id;b.classList.toggle('selected',selected);b.setAttribute('aria-checked',String(selected));});
  const h=getHero(id);
  const supremeDeckName={yugi:'Yugi · Ma Thuật Tối Thượng',kaiba:'Kaiba · Đỉnh Cao Mắt Xanh',joey:'Joey · Rồng Đen Bất Diệt',pegasus:'Pegasus · Vương Quốc Hoạt Hình',jaden:'Jaden · Anh Hùng Tối Thượng',zane:'Zane · Rồng Máy Tận Diệt'}[h.code];
  $('selectedHeroSummary').innerHTML=`${heroFigure(h,'hero-portrait')}<div><small>${esc(h.name)} · KỸ NĂNG ĐẤU SĨ</small><strong>${h.icon} ${esc(h.skill)}</strong><p>${esc(h.description)}</p><span>Mọi bộ bài · MAIN của bạn · 1 lần/trận</span>${supremeDeckName?`<div style="margin-top:6px;"><button type="button" class="secondary-btn" id="equipHeroSupremeBtn" style="font-size:0.8rem;padding:3px 10px;">⭐ Dùng Bộ Tối Thượng ${esc(h.name)}</button></div>`:''}</div>`;
  const equipBtn=$('equipHeroSupremeBtn');
  if(equipBtn&&supremeDeckName&&window.MEME_DECK_PRESETS?.[supremeDeckName]){
    equipBtn.onclick=()=>{
      deckList=[...window.MEME_DECK_PRESETS[supremeDeckName]];
      extraDeckList=[...(window.MEME_EXTRA_PRESETS?.[supremeDeckName]||defaultExtraDeck())];
      saveDeck();
      notify(`Đã trang bị bộ bài: ${supremeDeckName}!`);
    };
  }
}
function renderHeroRoster(){
  $('heroRoster').innerHTML=HEROES.map(h=>`<button class="hero-tag" data-hero="${h.id}" role="radio" aria-checked="false" style="${heroStyle(h)}" aria-label="Chọn ${esc(h.name)}. ${esc(h.skill)}: ${esc(h.description)}">${heroFigure(h)}<b>${esc(h.name)}</b><small>${h.icon} ${esc(h.skill)}</small></button>`).join('');
  document.querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>chooseHero(Number(b.dataset.hero)));chooseHero(chosenHero);
}
function heroSkillProblem(name){
  if(!duel||duel.finished)return 'Trận đấu đã kết thúc.';
  const s=side(name),h=getHero(s.heroId);
  if(s.skillUsed)return 'Đã dùng kỹ năng trong trận này.';
  if(duel.turn!==name)return 'Chờ đến lượt của bạn.';
  if(!['MAIN1','MAIN2'].includes(duel.phase))return 'Chỉ dùng trong MAIN 1 hoặc MAIN 2.';
  if(duel.mode)return 'Hoàn tất hoặc hủy thao tác chọn bài trước.';
  if(window.memeFx?.busy||name==='player'&&window.arcana200?.busy)return 'Chờ hiệu ứng hiện tại hoàn tất.';
  if(h.code==='draw'&&window.arcana200?.drawBlocked(name))return 'Lượt này không thể rút thêm bằng hiệu ứng.';
  if(h.code==='inspire'&&!window.memeRules.entries(name).some(e=>e.slot.position!=='def_down'))return 'Cần ít nhất 1 quái đang ngửa trên sân.';
  if(h.code==='draw'&&!s.deck.length)return 'Main Deck đã hết bài để rút.';
  if(h.code==='heal'&&s.lp>=8000)return 'LP đã đạt tối đa 8000.';
  return '';
}
function useHeroSkill(name='player'){
  const problem=heroSkillProblem(name);if(problem){if(name==='player')notify(problem);return false;}
  const s=side(name),h=getHero(s.heroId);s.skillUsed=true;
  if(h.code==='inspire')for(const e of window.memeRules.entries(name)){if(e.slot.position==='def_down')continue;e.slot.tempAtk=(e.slot.tempRound===duel.round?e.slot.tempAtk||0:0)+h.value;e.slot.tempRound=duel.round;}
  else if(h.code==='shield')s.shield=(s.shield||0)+h.value;
  else if(h.code==='heal')window.memeRules.heal(name,h.value);
  else if(h.code==='draw'){if(window.arcana200)window.arcana200.drawEffect(name,1);else draw(name);}
  else if(h.code==='burn')dealDamage(other(name),h.value);
  duel.skillSerial=(duel.skillSerial||0)+1;duel.lastSkill={serial:duel.skillSerial,owner:name,heroId:h.id};
  log(`${h.icon} ${h.name} dùng kỹ năng ${h.skill}!`);checkWin();render();return true;
}
function showHeroSkill(name='player'){
  if(!duel)return;skillView=name;const s=side(name),h=getHero(s.heroId),problem=heroSkillProblem(name);
  showModal(`<div class="hero-skill-detail" style="${heroStyle(h)}">${heroFigure(h)}<div><small>THẺ KỸ NĂNG ĐẤU SĨ</small><h2>${esc(h.name)}</h2><strong>${h.icon} ${esc(h.skill)}</strong><p>${esc(h.description)}</p><span>Kỹ năng riêng của nhân vật · MAIN · 1 lần/trận</span><p class="hero-skill-status" role="status">${name==='enemy'?(s.skillUsed?'Đối thủ đã dùng kỹ năng.':'Đối thủ chưa dùng kỹ năng.'):esc(problem||'Sẵn sàng kích hoạt.')}</p>${name==='player'?`<button id="activateHeroSkillBtn" class="primary-btn" ${problem?'disabled':''}>${s.skillUsed?'Đã sử dụng':'✦ Kích hoạt kỹ năng'}</button>`:''}</div></div>`);
  $('modal').querySelector('.modal-card').classList.add('hero-skill-modal');
  if(name==='player')$('activateHeroSkillBtn').onclick=()=>{if(!heroSkillProblem('player')){closeModal();useHeroSkill('player');}};
}
function renderHeroSkills(){
  for(const name of ['player','enemy']){
    const s=side(name),h=getHero(s.heroId),ready=!heroSkillProblem(name),host=$(name+'SkillCard');
    host.style.cssText=heroStyle(h);host.classList.toggle('skill-used',!!s.skillUsed);host.classList.toggle('skill-ready',ready);host.title=`${h.name} · ${h.skill}: ${h.description}`;
    host.innerHTML=`${heroFigure(h)}<span class="corner-skill-icon">${h.icon}</span><strong>${esc(h.skill)}</strong><small>${s.skillUsed?'ĐÃ DÙNG':ready?'SẴN SÀNG':'1 LẦN/TRẬN'}</small>`;host.setAttribute('aria-label',`${name==='player'?'Kỹ năng của bạn':'Kỹ năng đối thủ'}: ${h.name}, ${h.skill}. ${s.skillUsed?'Đã dùng.':ready?'Sẵn sàng.':'Chưa dùng.'}`);
    const avatar=$(name+'Avatar');avatar.style.cssText=heroStyle(h);avatar.innerHTML=heroFigure(h,'hero-portrait');avatar.title=`${h.name} · ${h.skill}`;
  }
  if($('modal').querySelector('.hero-skill-modal')&&!$('modal').classList.contains('hidden'))showHeroSkill(skillView);
}

function esc(value){return String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function card(id){return CARD_BY_ID.get(id);}
function imageInfo(id){return card(id)?.custom_image?.startsWith('assets/memecard/art/')?null:(window.MEME_IMAGE_LINKS||{})[id]||null;}
function art(id){
  const pic=window.MEME_CARD_PICTURES?.[id]?.full||window.MEME_CARD_PICTURES?.[id]?.thumb;
  if(pic)return pic;
  const c=card(id);
  if(c?.custom_image&&!c.custom_image.endsWith('.svg'))return c.custom_image;
  return c?.custom_image||imageInfo(id)?.url||'';
}
function artHTML(id,className='card-image'){
  const c=card(id);if(!c)return '';
  if(c.art_atlas){const cols=c.art_cols,rows=c.art_rows,col=c.art_tile%cols,row=Math.floor(c.art_tile/cols);return `<span class="${className} anime-monster-art atlas-picture" role="img" aria-label="${esc(c.name)}" style="background-image:url('${esc(c.custom_image)}')"><img src="${esc(c.art_atlas)}" alt="" loading="lazy" decoding="async" style="position:absolute;width:${cols*100}%;height:${rows*100}%;left:${-col*100}%;top:${-row*100}%;object-fit:fill;max-width:none;max-height:none" onerror="this.remove()"></span>`;}
  if(c.art_tile!=null)return `<span class="${className} anime-monster-art" role="img" aria-label="${esc(c.name)}" style="background-image:url('assets/memecard/anime-monsters-v1.png');background-size:600% 400%;background-position:${c.art_tile%6/5*100}% ${Math.floor(c.art_tile/6)/3*100}%"></span>`;
  const url=art(id);
  return `<span class="${className}" style="background:linear-gradient(145deg,${esc(c.art?.c1||'#42616e')},${esc(c.art?.c2||'#1a2938')})"><span class="art-emoji">${esc(c.art?.emoji||'🃏')}</span>${url?`<img src="${esc(url)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:''}</span>`;
}
function shuffle(list){const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function defaultDeck(){
  if(window.MEME_DECK_PRESETS)return [...Object.values(window.MEME_DECK_PRESETS)[0]];
  return [
    'trau_tre_len_doi','trau_tre_len_doi','co_mat_job','ech_xanh_triet_ly','ech_xanh_triet_ly',
    'cua_dong_bat_khuat','meo_map_lan_long','thanh_chui_binh_luan','ninja_luon_dem','ninja_luon_dem',
    'ba_hoa_dam_drama','anh_grab_da_nhiem','hiep_si_tra_sua','kiem_lam_bao_ve',
    'thuy_quai_lay_loi','trum_cuoi_bi_an','phap_su_bang_tra',
    'hot_via','dinh_cua_chop','vong_tay_ban_than','trung_tang_bat_ngo',
    'dung_do_dung_di_dau','gay_ong_dap_lung_ong','tam_ly_vung_nhu_be_tong'
  ];
}
function deckLimit(id){return card(id)?.max_copies??(id==='trung_tang_bat_ngo'?1:3);}
function isExtraCard(id){return card(id)?.deck_zone==='Extra';}
function extraEligible(id){return isExtraCard(id)||card(id)?.extra_eligible===true;}
function defaultExtraDeck(){if(CATALOGUE.defaultExtra)return [...CATALOGUE.defaultExtra];return CARDS.filter(c=>c.deck_zone==='Extra').map(c=>c.id);}
function migrateDeck(cards,extra){
  if(!Array.isArray(cards)||cards.some(id=>!CARD_BY_ID.has(id)))return null;
  const main=cards.filter(id=>!isExtraCard(id)),extras=Array.isArray(extra)?[...extra]:[...new Set([...cards.filter(isExtraCard),...defaultExtraDeck()])];
  if(main.length<20)for(const id of defaultDeck()){if(main.length>=20)break;if(!isExtraCard(id)&&main.filter(x=>x===id).length<deckLimit(id))main.push(id);}
  return {cards:main,extra:extras};
}
function deckProblem(cards,extra=[]){
  if(!Array.isArray(cards)||cards.some(id=>(!CARD_BY_ID.has(id)||card(id)?.uncollectible)))return 'Bộ bài chứa lá không hợp lệ.';
  if(cards.some(isExtraCard))return 'Quái Dung Hợp phải nằm trong Extra Deck.';
  if(cards.length<20)return `Cần thêm ${20-cards.length} lá để đủ 20.`;
  if(cards.length>MAIN_SIZE)return `Main Deck phải có ${MAIN_SIZE} lá.`;
  if(!Array.isArray(extra)||extra.length>EXTRA_LIMIT||extra.some(id=>!extraEligible(id)))return `Extra Deck chỉ gồm lá đủ điều kiện, tối đa ${EXTRA_LIMIT} lá.`;
  const counts=new Map();for(const id of [...cards,...extra]){counts.set(id,(counts.get(id)||0)+1);if(counts.get(id)>deckLimit(id))return `${card(id).name}: tối đa ${deckLimit(id)} bản.`;}
  return '';
}
function loadDeck(){try{const saved=migrateDeck(JSON.parse(localStorage.getItem(DECK_KEY)),JSON.parse(localStorage.getItem(EXTRA_KEY)));if(saved&&!deckProblem(saved.cards,saved.extra)){extraDeckList=saved.extra;return saved.cards;}}catch{}return defaultDeck();}
function loadDeckLibrary(){
  try{const saved=JSON.parse(localStorage.getItem(DECK_LIBRARY_KEY));if(Array.isArray(saved?.decks)){
    const ids=new Set(),decks=saved.decks.map(d=>{const migrated=migrateDeck(d?.cards,d?.extra);return migrated?{...d,...migrated}:null;}).filter(d=>d&&typeof d.id==='string'&&d.id&&typeof d.name==='string'&&d.name.trim()&&!deckProblem(d.cards,d.extra)&&!ids.has(d.id)&&ids.add(d.id));
    if(decks.length){const active=decks.find(d=>d.id===saved.activeId)||decks[0];deckList=[...active.cards];extraDeckList=[...active.extra];return {activeId:active.id,decks};}
  }}catch{}
  return {activeId:'starter',decks:[{id:'starter',name:'Bộ bài của tôi',cards:[...deckList],extra:[...extraDeckList]}]};
}
function saveDeck(){localStorage.setItem(DECK_KEY,JSON.stringify(deckList));localStorage.setItem(EXTRA_KEY,JSON.stringify(extraDeckList));}
function showModal(html,wide=false){$('modalContent').innerHTML=html;$('modal').classList.remove('hidden');$('modal').querySelector('.modal-card').classList.remove('pile-modal','hero-skill-modal','arcana-choice','confirm-choice-modal');$('modal').querySelector('.modal-card').classList.toggle('deck-modal',wide);}
function closeModal(){if(window.memeAnime?.choosing){window.memeAnime.cancelChoice();return;}if(window.memeClassic?.choosing){window.memeClassic.cancelChoice();return;}if(window.arcana200?.choosing){window.arcana200.cancelChoice();return;}$('modal').classList.add('hidden');}
function notify(text){$('message').textContent=text;}
window.showActionNotice = function(text, title = 'Không thể thực hiện') {
  if (!text) return;
  document.querySelectorAll('.mini-action-toast').forEach(n => n.remove());
  const toast = document.createElement('div');
  toast.className = 'mini-action-toast';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span class="mini-toast-icon">⚠️</span><div class="mini-toast-body"><strong>${esc(title)}</strong>: ${esc(text)}</div>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2400);
};
window.showEffectNotice = function({ cardId, title, text, owner = 'player', icon = '✨', fromRemote = false }) {
  const c = typeof card === 'function' ? card(cardId) : null;
  const name = title || c?.name || 'Hiệu ứng bài';
  const desc = text || c?.description || '';
  document.querySelectorAll('.card-effect-banner').forEach(n => n.remove());
  const banner = document.createElement('div');
  banner.className = 'card-effect-banner';
  banner.innerHTML = `
    <button type="button" class="effect-banner-close" aria-label="Đóng">✕</button>
    <div class="effect-banner-inner">
      <div class="effect-banner-art">${c ? artHTML(c.id, 'effect-art-mini') : `<span style="font-size:32px;">${icon}</span>`}</div>
      <div class="effect-banner-info">
        <div class="effect-banner-tag">${owner === 'player' ? 'BẠN KÍCH HOẠT' : 'ĐỐI THỦ KÍCH HOẠT'} · ${icon} <span class="effect-banner-hint">(Chạm để đóng)</span></div>
        <strong class="effect-banner-name">${esc(name)}</strong>
        <p class="effect-banner-text">${esc(desc)}</p>
      </div>
    </div>
  `;
  const layer = document.getElementById('memeFxLayer') || document.body;
  layer.appendChild(banner);
  try { window.memeFx?.sound?.('charge'); } catch (_) {}
  if (!fromRemote && typeof duel === 'object' && duel) {
    duel.effectNoticeSerial = (duel.effectNoticeSerial || 0) + 1;
    duel.lastNotice = { serial: duel.effectNoticeSerial, cardId, title: name, text: desc, owner, icon };
  }
  window.memeTurnClock?.bannerStart?.();
  let timer = null;
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(timer);
    window.memeTurnClock?.bannerEnd?.();
    banner.classList.add('fade-out');
    setTimeout(() => banner.remove(), 300);
  };
  banner.onclick = dismiss;
  const closeBtn = banner.querySelector('.effect-banner-close');
  if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); dismiss(); };
  const readDuration = 1500;
  timer = setTimeout(dismiss, readDuration);
};
window.attackProblem = function(slot) {
  if (!duel) return 'Trận đấu chưa bắt đầu.';
  if (duel.finished) return 'Trận đấu đã kết thúc.';
  if (duel.turn !== 'player') return 'Đang là lượt của đối thủ!';
  if (duel.round <= 1) return 'Người đi trước không thể tấn công trong Lượt 1!';
  if (duel.phase !== 'BATTLE') return 'Hãy bấm "Sang chiến đấu" (Phase BATTLE) để tấn công!';
  if (!slot) return 'Không tìm thấy quái thú.';
  if (slot.position !== 'atk' && !(slot.id && card(slot.id)?.traits?.includes('rampart') && slot.position === 'def')) {
    return 'Quái thú đang ở thế thủ (DEF), không thể tấn công!';
  }
  if ((slot.frozenUntil ?? -1) >= duel.round) return 'Quái thú đang bị phong ấn/đóng băng, không thể tấn công!';
  if (side('enemy').spells.some(p => p && !p.faceDown && p.turnsLeft > 0 && card(p.id)?.effect_code === 'swords')) {
    return 'Kiếm Ánh Sáng của đối thủ đang khóa tấn công!';
  }
  const limit = window.memeAnime?.attacksRemaining ? (slot.attacksUsed || 0) >= (slot.attackAllLimit || 1) : (slot.attacked);
  if (limit) return 'Quái thú này đã hết số lần tấn công trong lượt này!';
  return 'Quái thú chưa đủ điều kiện tấn công.';
};
function log(text){if(!duel)return;duel.logs.unshift(text);duel.logs=duel.logs.slice(0,50);notify(text);}
function side(name){return duel[name];}
function other(name){return name==='player'?'enemy':'player';}
function putGrave(name,slot){if(slot&&!slot.token)side(name).grave.push(slot.id);}
function draw(name){const s=side(name);if(!s.deck.length){finish(other(name),`${name==='player'?'Bạn':'Đối thủ'} hết bài để rút.`);return false;}s.hand.push(s.deck.shift());return true;}
function blankSide(deck,extras=defaultExtraDeck(),heroId=0){return{lp:4000,shield:0,heroId:getHero(heroId).id,skillUsed:false,deck:shuffle(deck.filter(id=>!isExtraCard(id))),extraDeck:[...extras],hand:[],monsters:[null,null,null],spells:[null,null,null],field:null,extra:null,grave:[]};}
function startGame(options={}){
  const ghost=options?.ghost;
  if(ghost&&(!Array.isArray(ghost.main)||!Array.isArray(ghost.extra)||deckProblem(ghost.main,ghost.extra)||!validHero(ghost.heroId)))throw Error('Bộ bài của đối thủ chưa hợp lệ.');
  window.memeOnlineLeave?.();window.memeFx?.reset();clearTimeout(aiTimer);closeModal();
  document.querySelector('.duel-layout').classList.add('inspector-collapsed');
  const p2Settings = window.memePhase2?.settings || {};
  const diff = p2Settings.difficulty || 'hard';
  const customBotDeck = options?.customBotDeck || p2Settings.botDeck;
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
  duel={player:blankSide(deckList,extraDeckList,chosenHero),enemy:blankSide(ghost?ghost.main:botDeck,ghost?ghost.extra:botExtras,ghost?ghost.heroId:botHeroId),turn:'player',phase:'MAIN1',round:1,normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};
  if(ghost){
    duel.ghostOpponent={uid:ghost.uid,name:ghost.name,main:[...ghost.main],extra:[...ghost.extra],heroId:ghost.heroId};
    duel.rankChallengeId='offline-'+crypto.randomUUID().replaceAll('-','').slice(0,24);
    duel.rankChallengeOpponentUid=ghost.uid;
  }else{
    const botGroup=(typeof HEROES!=='undefined'&&HEROES[botHeroId]?.group||'kaiba').toLowerCase();
    duel.rankChallengeId='bot-'+crypto.randomUUID().replaceAll('-','').slice(0,24);
    duel.rankChallengeOpponentUid='bot-'+botGroup;
    duel.botOpponent={uid:duel.rankChallengeOpponentUid,name:typeof HEROES!=='undefined'&&HEROES[botHeroId]?.name||'Seto Kaiba'};
  }
  for(let i=0;i<4;i++){draw('player');draw('enemy');}
  $('lobby').classList.add('hidden');$('duel').classList.remove('hidden');$('duel').classList.remove('match-finished');$('playerName').textContent=HERO_NAMES[chosenHero];$('enemyName').textContent=HEROES[botHeroId]?.name || 'Seto Kaiba';
  duel.openingCoin=window.memeOpening?.create();duel.turn=duel.openingCoin?.first||'player';
  log(`🪙 Tung xu: ${duel.openingCoin?.face==='tails'?'sấp':'ngửa'} · ${duel.turn==='player'?'Bạn':'Máy'} đi lượt 1. Người còn lại đi lượt 2.`);render();window.scrollTo(0,0);
}
function finish(winner,reason=''){
  if(!duel||duel.finished)return;duel.finished=true;duel.winner=winner;duel.finishReason=reason;clearTimeout(aiTimer);
  render();const won=winner==='player',match=duel;
  const rankPromise = window.memeIdDuel?.recordResult?.(match)?.catch(e => {
    console.warn('Rank record error:', e);
    return { error: e.message || 'Lỗi đồng bộ BXH' };
  });
  Promise.race([
    Promise.all([window.memeFx?.whenLpSettles() || Promise.resolve(), rankPromise || Promise.resolve()]),
    new Promise(resolve=>setTimeout(resolve, 1500))
  ]).then(()=>{
    if(duel!==match)return;
    $('duel').classList.add('match-finished');
    showMatchResult(won,reason|| (won?'Bạn đã làm chủ đấu trường meme!':'Thử một chiến thuật khác nhé.'),match);
  });
}
function showMatchResult(won,reason,match=duel){
  const online=!!window.memeOnlineIsPlaying?.();
  const receipt=match?.rankChallengeResult;
  let rankText = '';
  if (receipt?.unauthenticated) {
    rankText = `<p class="rank-challenge-result" style="color:#f59e0b;font-weight:bold;">⚠️ Bạn chưa đăng nhập Google — Điểm Rank không được tích lũy vào Bảng Xếp Hạng.<br><button type="button" class="primary-btn" id="postMatchLoginBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);margin-top:8px;font-size:0.95rem;cursor:pointer;">🔑 Đăng nhập Google để lưu Elo trận này</button></p>`;
  } else if (receipt?.error) {
    rankText = `<p class="rank-challenge-result" style="color:#ef4444;font-weight:bold;">⚠️ Chưa đồng bộ BXH: ${esc(receipt.error)} <button type="button" class="rank-error-copy-btn" id="retrySyncEloBtn" style="margin-left:8px;padding:3px 8px;font-size:11px;background:#b91c1c;color:#fff;border:1px solid #ef4444;border-radius:6px;cursor:pointer;">🔄 Thử lưu lại</button></p>`;
  } else if (receipt) {
    rankText = `<p class="rank-challenge-result" style="color:#4ade80;font-weight:bold;">🏆 BXH ĐÃ CẬP NHẬT: ${receipt.outcome==='win'?'Thắng':receipt.outcome==='loss'?'Thua':'Hòa'} · <span style="font-size:1.15em;color:#fbbf24;">${receipt.delta>0?'+':''}${receipt.delta} Elo</span> (${receipt.ratingAfter} Elo) · ${receipt.wins} thắng / ${receipt.losses} thua</p>`;
  }
  showModal(`<span class="result-icon">${won?'🏆':'💀'}</span><h2>${won?'Chiến thắng!':'Thất bại!'}</h2><p>${esc(reason||'Trận đấu đã kết thúc.')}</p>${rankText}<div class="result-actions" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap"><button class="primary-btn" id="againBtn">⚔️ Đấu lại</button><button class="secondary-btn" id="resultLobbyBtn">🏠 Về sảnh</button></div>`);
  const retryBtn = document.getElementById('retrySyncEloBtn');
  if (retryBtn) {
    retryBtn.onclick = async () => {
      retryBtn.disabled = true;
      retryBtn.textContent = 'Đang thử lại...';
      if (match) delete match._recordResultPromise;
      const res = await window.memeIdDuel?.recordResult?.(match);
      if (res && !res.error) {
        window.memeIdDuel?.updateResultUI?.(res);
      } else {
        retryBtn.disabled = false;
        retryBtn.textContent = 'Thử lại thất bại';
      }
    };
  }
  const loginBtn = document.getElementById('postMatchLoginBtn');
  if (loginBtn) {
    loginBtn.onclick = async () => {
      loginBtn.disabled = true;
      loginBtn.textContent = 'Đang mở đăng nhập...';
      const res = await window.memeIdDuel?.loginToSaveResult?.(match);
      if (res && !res.unauthenticated && !res.error) {
        loginBtn.textContent = 'Đã lưu Elo ✅';
      } else {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Thử đăng nhập lại';
      }
    };
  }
  $('againBtn').onclick=()=>{
    if(online){
      if(window.memeOnlineRequestRematch?.())return;
      notify('Phòng này chưa hỗ trợ đấu lại. Hãy về sảnh để tạo phòng mới.');
      return;
    }
    if(match?.ghostOpponent){
      startGame({ghost:match.ghostOpponent});
    }else startGame();
  };
  $('resultLobbyBtn').onclick=()=>$('backBtn').click();
}
window.memeShowMatchResult=showMatchResult;
function checkWin(){if(duel.enemy.lp<=0)finish('player');else if(duel.player.lp<=0)finish('enemy');return duel.finished;}
function effectiveAtk(name,slot){
  if(window.memeRules)return window.memeRules.stat(name,slot,'atk');
  if(!slot)return 0;const c=card(slot.id);if(!c)return 0;
  let value=(c.atk||0)+(slot.equip||0);
  for(const permanent of [...side(name).spells,side(name).field]){
    if(!permanent||permanent.faceDown)continue;
    const pc=card(permanent.id);if(pc?.effect_code==='continuous_tribe_boost'&&pc.target_tribe===c.tribe)value+=pc.effect_value||0;
  }
  return value;
}
function effectiveDef(name,slot){return window.memeRules?window.memeRules.stat(name,slot,'def'):card(slot?.id)?.def||0;}
function canAttackSlot(slot){return window.memeRules?window.memeRules.canAttack(slot):!!slot&&slot.position==='atk'&&!slot.attacked;}
function dealDamage(name,amount){if(window.memeRules)return window.memeRules.damage(name,amount);side(name).lp-=amount;return amount;}
function effect(name,c,context={}){
  window.showEffectNotice?.({
    cardId: c.id,
    title: c.name,
    text: c.description,
    owner: name,
    icon: c.card_type === 'Trap' ? '🔴' : (c.card_type === 'Spell' ? '💚' : '✦')
  });
  if(window.memeRules)return window.memeRules.execute(name,c,context);
  const self=side(name),foe=side(other(name)),amount=c.effect_value||0;
  if(c.effect_code==='draw_n'){for(let i=0;i<amount;i++){if(!draw(name))break;}log(`🃏 ${name==='player'?'Bạn':'Đối thủ'} rút ${amount} lá.`);}
  if(c.effect_code==='heal_n'){self.lp=Math.min(8000,self.lp+amount);log(`💚 ${name==='player'?'Bạn':'Đối thủ'} hồi ${amount} LP.`);}
  if(c.effect_code==='burn_n'){foe.lp-=amount;log(`🔥 ${c.name} gây ${amount} sát thương!`);}
  if(c.effect_code==='destroy_all_opponent_monsters'){
    let count=0;foe.monsters.forEach((slot,i)=>{if(slot){putGrave(other(name),slot);foe.monsters[i]=null;count++;}});
    if(foe.extra){putGrave(other(name),foe.extra);foe.extra=null;count++;}
    log(`⚡ ${c.name} phá hủy ${count} quái của ${name==='player'?'đối thủ':'bạn'}!`);
  }
  checkWin();
}
function canAct(){if(window.memeAuthoritative?.active())return window.memeAuthoritative.canAct();return !window.memeCardMotion?.busy&&!window.memeOpening?.pending()&&!window.memeTurnClock?.expired()&&duel&&!duel.finished&&duel.turn==='player'&&!window.memeFx?.busy&&!window.arcana200?.busy&&!window.memeClassic?.busy&&!window.memeAnime?.busy;}
function mainPhase(){return canAct()&&(duel.phase==='MAIN1'||duel.phase==='MAIN2');}
function select(item){if(!duel||duel.finished)return;duel.selected=item;document.querySelector('.duel-layout').classList.remove('inspector-collapsed');render();}
function clearMode(){if(!duel)return;duel.mode=null;duel.pending=null;log('Đã huỷ thao tác.');render();}
function removeHand(index){return side('player').hand.splice(index,1)[0];}
function monsterSlot(id,position='atk'){return{id,position,attacked:false,attacksUsed:0,equip:0,summonedRound:duel.round};}
function summon(index,position){
  if(duel?.turn!=='player'){window.showActionNotice('Đang là lượt của đối thủ!');return;}
  if(!['MAIN1','MAIN2'].includes(duel?.phase)){
    const msg = duel?.phase === 'BATTLE' ? 'Không thể Triệu hồi trong Phase Chiến Đấu! Hãy quay về Main 2 hoặc sang lượt sau.' : 'Chỉ có thể Triệu hồi ở phase MAIN 1 hoặc MAIN 2.';
    window.showActionNotice(msg);
    return log(msg);
  }
  if(!canAct())return;
  const id=side('player').hand[index],c=card(id);if(!c||c.card_type!=='Monster')return;
  if(isExtraCard(id)){
    window.showActionNotice('Quái Extra chỉ được gọi từ Extra Deck.');
    return log('Quái Extra chỉ được gọi từ Extra Deck.');
  }
  if(c.monster_category==='Nghi Lễ')return summonRitual(index);
  if(duel.normalSummoned){
    window.showActionNotice('Bạn đã triệu hồi thường trong lượt này rồi! (Mỗi lượt chỉ được 1 lần)');
    return log('Bạn đã triệu hồi thường trong lượt này.');
  }
  const need=c.stars>=7?2:c.stars>=5?1:0;
  const occupied=side('player').monsters.map((slot,i)=>slot?i:-1).filter(i=>i>=0);
  if(occupied.length<need){
    const msg = `Cần ${need} quái trên sân để hiến tế cho ${c.name} (${c.stars}★)!`;
    window.showActionNotice(msg);
    return log(msg);
  }
  const freeSlot=side('player').monsters.findIndex((slot,i)=>!slot);
  if(freeSlot<0 && need === 0){
    window.showActionNotice('Khu vực quái thú đã đầy (Tối đa 3 ô trên sân)!');
    return log('Sân đã đầy 3 quái thú.');
  }
  if(need){duel.mode='tribute';duel.pending={index,position,needed:need,chosen:[]};log(`Chọn ${need} quái của bạn để hiến tế cho ${c.name}.`);render();return;}
  placeSummon(index,position,[]);
}
async function placeSummon(handIndex,position,tributes){
  const match=duel,s=side('player');const free=s.monsters.findIndex((slot,i)=>!slot||tributes.includes(i));
  if(free<0){
    window.showActionNotice('Khu vực quái thú đã đầy (Tối đa 3 ô)!');
    return log('Sân đã đầy 3 quái thú.');
  }
  if(window.memeFx){await window.memeFx.summon(handIndex,free,position==='def_down');if(duel!==match||!canAct())return;}
  for(const index of tributes){putGrave('player',s.monsters[index]);s.monsters[index]=null;}
  const id=removeHand(handIndex),c=card(id);s.monsters[free]=monsterSlot(id,position);duel.normalSummoned=true;duel.mode=null;duel.pending=null;
  log(`✨ Triệu hồi ${c.name} ${position==='atk'?'thế công':'úp thế thủ'}!`);
  if(c.effect_trigger==='on_summon')effect('player',c);render();
}
function chooseTribute(index){
  const pending=duel.pending;if(!pending||!side('player').monsters[index])return;
  if(pending.chosen.includes(index))pending.chosen=pending.chosen.filter(i=>i!==index);else pending.chosen.push(index);
  if(pending.chosen.length>=pending.needed){placeSummon(pending.index,pending.position,pending.chosen);return;}
  log(`Đã chọn ${pending.chosen.length}/${pending.needed} quái hiến tế.`);render();
}
function synchroValid(c,materials){return !!c?.synchro_requirement&&materials.length>=2&&materials.every(e=>e.slot&&e.slot.position!=='def_down')&&materials.filter(e=>card(e.slot.id)?.is_tuner).length===1&&materials.reduce((n,e)=>n+(card(e.slot.id)?.stars||0),0)===c.stars;}
function synchroOptions(name,id){
  const pool=window.memeRules.entries(name).filter(e=>e.slot.position!=='def_down'),c=card(id),options=[];
  for(let mask=1;mask<(1<<pool.length);mask++){const chosen=pool.filter((e,i)=>mask&(1<<i));if(c?.extra_requirement?chosen.length===2&&chosen.every(e=>card(e.slot.id)?.tribe===c.tribe)&&chosen.reduce((n,e)=>n+card(e.slot.id).stars,0)>=c.extra_requirement.minStars:synchroValid(c,chosen))options.push(chosen);}
  return options;
}
function summonExtra(index){
  if(!mainPhase()||duel.mode)return;
  const id=side('player').extraDeck?.[index],c=card(id);if(!c?.synchro_requirement)return;
  if(!synchroOptions('player',id).length){
    const msg = `Cần 1 Tuner + quái không Tuner đang ngửa, tổng đúng ${c.stars} sao để gọi ${c.name}.`;
    window.showActionNotice(msg);
    return log(msg);
  }
  closeModal();duel.mode='extra';duel.pending={index,id,chosen:[]};log(`🌀 ${c.name}: chọn 1 Tuner + quái không Tuner, tổng đúng ${c.stars} sao. Nhấn lại để bỏ chọn.`);render();
}
async function chooseExtraMaterial(index,isExtra=false){
  if(!mainPhase()||duel.mode!=='extra')return;
  const p=duel.pending,s=side('player'),key=isExtra?-1:index,slot=isExtra?s.extra:s.monsters[index];
  if(!slot||slot.position==='def_down'){
    window.showActionNotice('Nguyên liệu Đồng Bộ phải đang ở tư thế ngửa!');
    return log('Nguyên liệu Đồng Bộ phải đang ngửa.');
  }
  if(p.chosen.includes(key))p.chosen=p.chosen.filter(i=>i!==key);else p.chosen.push(key);
  const materials=p.chosen.map(i=>({slot:i===-1?s.extra:s.monsters[i],index:i,extra:i===-1})),c=card(p.id),stars=materials.reduce((n,e)=>n+(card(e.slot?.id)?.stars||0),0);
  if(!synchroValid(c,materials)){log(`Đã chọn ${stars}/${c.stars} sao · ${materials.filter(e=>card(e.slot.id)?.is_tuner).length}/1 Tuner. Cần tổng sao chính xác.`);render();return;}
  const match=duel,extraFree=!s.extra||p.chosen.includes(-1),freeMain=s.monsters.findIndex((slot,i)=>!slot||p.chosen.includes(i));
  if(!extraFree&&freeMain<0){
    window.showActionNotice('Cần ít nhất 1 ô quái thường trống sau khi gửi nguyên liệu.');
    return log('Cần ô quái thường trống sau khi gửi nguyên liệu.');
  }
  const dest=extraFree?'extra':freeMain;
  if(window.memeFx){await window.memeFx.summon(-1,dest==='extra'?'extra':dest,false,'player',p.id);if(duel!==match||duel.pending!==p)return;}
  for(const e of materials){putGrave('player',e.slot);if(e.extra)s.extra=null;else s.monsters[e.index]=null;}
  s.extraDeck.splice(p.index,1);
  const summoned={...monsterSlot(p.id),properlySummoned:true};
  if(dest==='extra')s.extra=summoned;else s.monsters[dest]=summoned;
  duel.mode=null;duel.pending=null;log(`🌀 Đồng Bộ thành công: ${c.name}!`);render();
  if(c.effect_trigger==='on_summon'){effect('player',c);render();}
}
function summonRitual(index){
  const s=side('player'),c=card(s.hand[index]),req=c.ritual_requirement;
  if(!req||!s.hand.includes(req.spellId)){
    const msg = 'Cần lá bài Phép Nghi Lễ tương ứng trên tay!';
    window.showActionNotice(msg);
    return log(msg);
  }
  const stars=s.monsters.reduce((n,slot)=>n+(slot?card(slot.id)?.stars||0:0),0);
  if(stars<req.minStars){
    const msg = `Cần tổng ít nhất ${req.minStars} sao trên sân để hiến tế Nghi Lễ.`;
    window.showActionNotice(msg);
    return log(msg);
  }
  duel.mode='ritual';duel.pending={index,minStars:req.minStars,spellId:req.spellId,chosen:[]};log(`Chọn quái hiến tế, tổng ít nhất ${req.minStars} sao.`);render();
}
async function chooseRitualMaterial(index){
  const p=duel.pending,s=side('player');if(!s.monsters[index])return;
  if(p.chosen.includes(index))p.chosen=p.chosen.filter(i=>i!==index);else p.chosen.push(index);
  const stars=p.chosen.reduce((n,i)=>n+(card(s.monsters[i].id)?.stars||0),0);
  if(stars<p.minStars){log(`Đã chọn ${stars}/${p.minStars} sao.`);render();return;}
  if(window.memeRules?.negateSpell('player')){s.hand.splice(s.hand.indexOf(p.spellId),1);s.grave.push(p.spellId);duel.mode=null;duel.pending=null;render();return;}
  const match=duel,target=s.monsters.findIndex((slot,i)=>!slot||p.chosen.includes(i));
  if(window.memeFx){await window.memeFx.summon(p.index,target,false);if(duel!==match||!canAct())return;}
  const ritualId=s.hand[p.index];p.chosen.forEach(i=>{putGrave('player',s.monsters[i]);s.monsters[i]=null;});
  s.hand.splice(s.hand.indexOf(p.spellId),1);s.grave.push(p.spellId);s.hand.splice(s.hand.indexOf(ritualId),1);
  s.monsters[target]={...monsterSlot(ritualId),properlySummoned:true};
  duel.mode=null;duel.pending=null;log(`🕯️ Nghi Lễ thành công: ${card(ritualId).name}!`);render();
  if(card(ritualId).effect_trigger==='on_summon'){effect('player',card(ritualId));render();}
}
async function playSpell(index){
  if(!mainPhase()||duel.mode){
    const msg = duel.mode ? 'Hãy hoàn tất hoặc bấm Hủy thao tác chọn bài trước!' : 'Chỉ kích hoạt Phép trong phase MAIN 1 hoặc MAIN 2!';
    window.showActionNotice(msg);
    return log(msg);
  }
  const match=duel,s=side('player'),id=s.hand[index],c=card(id);if(!c||c.card_type!=='Spell')return;
  if(c.spell_category==='Nghi Lễ'){
    window.showActionNotice('Chọn quái Nghi Lễ tương ứng trên tay để dùng bài này.');
    return log('Chọn quái Nghi Lễ trên tay để dùng bài này.');
  }
  if(window.memeRules&&!window.memeRules.canExecute('player',c)){
    const msg = c.effect_code === 'fusion_summon' ? 'Chưa đủ nguyên liệu trên Tay hoặc Sân để Dung Hợp!' : (c.effect_code === 'miracle_fusion' ? 'Chưa đủ nguyên liệu trên Sân hoặc Mộ để Dung Hợp Anh Hùng!' : 'Chưa có mục tiêu hợp lệ cho hiệu ứng này.');
    window.showActionNotice(msg);
    return log(msg);
  }
  if(c.spell_category==='Liên Tục'&&!s.spells.includes(null)){
    window.showActionNotice('Khu vực Phép/Bẫy đã đầy (Tối đa 3 ô)!');
    return log('Không còn ô Phép/Bẫy trống.');
  }
  if(window.memeRules?.targetCodes.includes(c.effect_code)){duel.mode='effect_target';duel.pending={index,id,source:'hand'};log(`✦ ${c.name}: chọn 1 ${c.effect_code==='destroy_spell_target'?'Phép/Bẫy':'quái'} đối thủ để phá hủy.`);render();return;}
  if(window.memeRules?.negateSpell('player')){removeHand(index);s.grave.push(id);render();return;}
  if(c.spell_category==='Trang Bị'){
    if(!s.monsters.some(Boolean)&&!s.extra){
      window.showActionNotice('Cần có quái thú trên sân để trang bị!');
      return log('Cần có quái để trang bị.');
    }
    duel.mode='equip';duel.pending={index};log('Chọn một quái của bạn để trang bị.');render();return;
  }
  if(window.memeFx){await window.memeFx.cardActivation(index);if(duel!==match||!mainPhase())return;window.memeFx.banner(c.name);}
  if(c.spell_category==='Môi Trường'){if(s.field)putGrave('player',s.field);s.field={id};removeHand(index);log(`🌍 Môi trường: ${c.name}.`);render();return;}
  if(c.spell_category==='Liên Tục'){const free=s.spells.indexOf(null);if(free<0){window.showActionNotice('Khu vực Phép/Bẫy đã đầy (Tối đa 3 ô)!');return log('Không còn ô Phép/Bẫy trống.');}s.spells[free]={id,faceDown:false,setRound:duel.round};removeHand(index);log(`🔗 Kích hoạt ${c.name}.`);render();return;}
  removeHand(index);s.grave.push(id);log(`💚 Kích hoạt ${c.name}.`);effect('player',c);render();
}
async function chooseEquip(index,isExtra=false){const match=duel,s=side('player'),slot=isExtra?s.extra:s.monsters[index];if(!slot)return;const handIndex=duel.pending.index;if(window.memeFx){await window.memeFx.cardActivation(handIndex);if(duel!==match||!duel?.pending)return;}const id=removeHand(handIndex),c=card(id);if(window.memeRules)window.memeRules.equip(slot,c);else slot.equip=(slot.equip||0)+(c.effect_value||0);s.grave.push(id);duel.mode=null;duel.pending=null;log(`🧿 ${c.name} trang bị cho ${card(slot.id).name}.`);render();}
async function setTrap(index){
  if(!mainPhase()){
    window.showActionNotice('Chỉ úp Bẫy trong MAIN 1 hoặc MAIN 2.');
    return log('Chỉ úp Bẫy trong MAIN 1 hoặc MAIN 2.');
  }
  const match=duel,s=side('player'),free=s.spells.indexOf(null);
  if(free<0){
    window.showActionNotice('Khu vực Phép/Bẫy đã đầy (Tối đa 3 ô)!');
    return log('Không còn ô Phép/Bẫy trống.');
  }
  if(window.memeFx){await window.memeFx.cardActivation(index,'trap');if(duel!==match||!mainPhase())return;}
  const id=removeHand(index);s.spells[free]={id,faceDown:true,setRound:duel.round};log(`🔴 Đã úp một lá Bẫy.`);render();
}
async function activateTrap(index){
  if(!mainPhase()||duel.mode){
    window.showActionNotice('Chỉ lật Bẫy trong phase chính, khi không đang chọn bài.');
    return log('Chỉ lật Bẫy trong phase chính, khi không đang chọn bài.');
  }
  const s=side('player'),slot=s.spells[index],c=card(slot?.id);if(!slot||!c||!slot.faceDown)return;
  if(slot.setRound===duel.round){
    window.showActionNotice('Bẫy vừa úp trong lượt này! Phải chờ sang lượt sau mới kích hoạt được.');
    return log('Bẫy vừa úp phải chờ tới lượt sau.');
  }
  if((window.memeRules?.counterCodes||['negate_attack','destroy_attacker']).includes(c.effect_code)){
    window.showActionNotice('Bẫy phản đòn sẽ tự động kích hoạt khi đối thủ tấn công!');
    return log('Bẫy phản đòn sẽ tự kích hoạt đúng điều kiện.');
  }
  if(window.memeRules&&!window.memeRules.canExecute('player',c)){
    window.showActionNotice('Chưa có mục tiêu hợp lệ cho hiệu ứng này!');
    return log('Chưa có mục tiêu hợp lệ cho hiệu ứng này.');
  }
  if(window.memeRules?.targetCodes.includes(c.effect_code)){duel.mode='effect_target';duel.pending={index,id:c.id,source:'trap'};log(`🔴 ${c.name}: chọn 1 quái đối thủ để phá hủy.`);render();return;}
  const match=duel;if(window.memeFx){await window.memeFx.flipTrap('player',index);if(duel!==match||!mainPhase())return;window.memeFx.banner(c.name);}
  slot.faceDown=false;log(`🔴 Kích hoạt Bẫy: ${c.name}.`);
  if(c.trap_category==='Liên Tục'){render();return;}
  s.spells[index]=null;s.grave.push(c.id);effect('player',c);render();
}
function effectTargetValid(name,type,index){
  if(duel?.mode!=='effect_target'||name!=='enemy')return false;const c=card(duel.pending?.id);
  return window.memeRules.targetEntries('player',c).some(e=>e.type===type&&e.index===index);
}
async function resolveEffectTarget(name,type,index){
  if(!mainPhase()||!effectTargetValid(name,type,index))return;
  const match=duel,p=duel.pending,c=card(p.id),s=side('player'),target={name,type,index};
  if(window.memeFx){if(p.source==='trap')await window.memeFx.flipTrap('player',p.index);else await window.memeFx.cardActivation(p.index);if(duel!==match||duel.pending!==p)return;}
  const negated=p.source==='hand'&&window.memeRules.negateSpell('player');
  if(p.source==='hand')s.hand.splice(p.index,1);else s.spells[p.index]=null;
  s.grave.push(p.id);duel.mode=null;duel.pending=null;
  if(!negated)effect('player',c,{target});render();
}
function declareAttack(index,isExtra=false){
  if(!canAct()||duel.phase!=='BATTLE'){
    const msg = duel.round <= 1 ? 'Người đi trước không thể tấn công trong Lượt 1!' : 'Chuyển sang phase CHIẾN ĐẤU (BATTLE) trước!';
    window.showActionNotice(msg);
    return log(msg);
  }
  const slot=isExtra?side('player').extra:side('player').monsters[index];
  if(!canAttackSlot(slot)){
    const prob = window.attackProblem(slot);
    window.showActionNotice(prob);
    return log(prob);
  }
  duel.mode='attack';duel.pending={index,isExtra};
  if(!side('enemy').monsters.some(Boolean)&&!side('enemy').extra){resolveAttack(null,false);return;}
  log(`⚔️ ${card(slot.id).name} sẵn sàng tấn công. Chọn quái đối thủ.`);render();
}
function counterTrap(defender,attackerSide,attackerIndex,attackerExtra){
  if(window.memeRules)return window.memeRules.counter(defender,attackerSide,attackerIndex,attackerExtra);
  const s=side(defender);const trapIndex=s.spells.findIndex(slot=>slot&&slot.faceDown&&slot.setRound<duel.round&&['negate_attack','destroy_attacker'].includes(card(slot.id)?.effect_code));
  if(trapIndex<0)return false;const trap=s.spells[trapIndex],c=card(trap.id);s.spells[trapIndex]=null;s.grave.push(trap.id);
  log(`🚨 ${defender==='player'?'Bạn':'Đối thủ'} lật Bẫy ${c.name}!`);
  if(c.effect_code==='destroy_attacker'){const a=side(attackerSide);const slot=attackerExtra?a.extra:a.monsters[attackerIndex];putGrave(attackerSide,slot);if(attackerExtra)a.extra=null;else a.monsters[attackerIndex]=null;}
  return true;
}
async function resolveAttack(targetIndex,targetExtra=false){
  if(window.memeFx){
    if(window.memeFx.busy||!duel?.pending)return;
    const p=duel.pending;
    if(duel.turn==='player')window.memeOnlineAction?.({type:'attack',index:p.index,isExtra:!!p.isExtra,targetIndex,targetExtra});
    const result=await window.memeFx.attack(duel.turn,p.index,p.isExtra,targetIndex,targetExtra,()=>resolveAttackNow(targetIndex,targetExtra));
    if(duel){$('nextPhaseBtn').disabled=duel.turn!=='player'||duel.finished;renderInspector();}
    return result;
  }
  return resolveAttackNow(targetIndex,targetExtra);
}
function resolveAttackNow(targetIndex,targetExtra=false){
  const p=duel?.pending;if(!p)return;const attackerSide=duel.turn,defenderSide=other(attackerSide);
  const a=side(attackerSide),d=side(defenderSide);const attacking=p.isExtra?a.extra:a.monsters[p.index];if(!attacking)return;
  const attackerCard=card(attacking.id);
  if(counterTrap(defenderSide,attackerSide,p.index,p.isExtra)){
    duel.mode=null;duel.pending=null;attacking.attacksUsed=(attacking.attacksUsed||0)+1;attacking.attacked=attacking.attacksUsed>=(window.memeRules?.trait(attacking,'double_attack')?2:1);
    render();return;
  }
  if(duel.arcanaRedirect){targetIndex=duel.arcanaRedirect.index;targetExtra=duel.arcanaRedirect.extra;delete duel.arcanaRedirect;}
  const defending=targetExtra?d.extra:targetIndex===null?null:d.monsters[targetIndex];
  if(targetIndex!==null && !defending){
    duel.mode=null;duel.pending=null;
    log(`🔄 ${attackerCard.name}: Mục tiêu đã rời sân — Kích hoạt Đánh Lại (Replay)!`);
    window.showEffectNotice?.({
      cardId: attacking.id,
      title: '🔄 ĐÁNH LẠI (REPLAY)',
      text: `Mục tiêu ban đầu đã rời sân. ${attackerCard.name} được quyền chọn lại mục tiêu tấn công mới!`,
      owner: attackerSide,
      icon: '🔄'
    });
    render();
    return;
  }
  duel.mode=null;duel.pending=null;attacking.attacksUsed=(attacking.attacksUsed||0)+1;attacking.attacked=attacking.attacksUsed>=(window.memeRules?.trait(attacking,'double_attack')?2:1);
  window.arcana200?.beforeDamage(attackerSide,attacking,defending);
  let atk=effectiveAtk(attackerSide,attacking),battleDamage=0;
  if(!defending){battleDamage=dealDamage(defenderSide,atk);log(`💥 ${attackerCard.name} tấn công trực tiếp: ${battleDamage} sát thương!`);}
  else{
    const defCard=card(defending.id);if(defending.position==='def_down'){defending.position='def';log(`🔍 Lật bài úp: ${defCard.name}.`);if(defCard.effect_trigger==='on_flip')effect(defenderSide,defCard);if(duel.finished){render();return;}atk=effectiveAtk(attackerSide,attacking);}
    const destroyDefender=()=>{if(window.memeRules)return window.memeRules.remove(defenderSide,{slot:defending,index:targetIndex,extra:targetExtra},'battle');putGrave(defenderSide,defending);if(targetExtra)d.extra=null;else d.monsters[targetIndex]=null;};
    const destroyAttacker=()=>{if(window.memeRules)return window.memeRules.remove(attackerSide,{slot:attacking,index:p.index,extra:p.isExtra},'battle');putGrave(attackerSide,attacking);if(p.isExtra)a.extra=null;else a.monsters[p.index]=null;};
    if(defending.position==='atk'){
      const defenseAtk=effectiveAtk(defenderSide,defending);
      if(atk>defenseAtk){destroyDefender();battleDamage=dealDamage(defenderSide,atk-defenseAtk);log(`💥 ${attackerCard.name} thắng giao chiến, gây ${battleDamage} sát thương!`);}
      else if(atk<defenseAtk){destroyAttacker();dealDamage(attackerSide,defenseAtk-atk);log(`🛡️ ${attackerCard.name} thua giao chiến, chịu ${defenseAtk-atk} sát thương!`);}
      else{destroyDefender();destroyAttacker();log('⚖️ Hai quái thú cùng bị phá hủy!');}
    }else{
      const def=effectiveDef(defenderSide,defending);
      if(atk>def){destroyDefender();if(window.memeRules?.trait(attacking,'piercing'))battleDamage=dealDamage(defenderSide,atk-def);log(`💥 ${attackerCard.name} thắng thế thủ${battleDamage?`, xuyên ${battleDamage} LP`:''}!`);}
      else if(atk<def){dealDamage(attackerSide,def-atk);log(`🛡️ Phòng thủ vững! ${attackerSide==='player'?'Bạn':'Đối thủ'} chịu ${def-atk} sát thương.`);}
      else log('⚖️ Công và thủ ngang nhau.');
    }
  }
  if(battleDamage&&window.memeRules?.trait(attacking,'lifesteal')){window.memeRules.heal(attackerSide,battleDamage);log(`🩸 Hút sinh lực: hồi ${battleDamage} LP.`);}
  if(attackerCard.effect_trigger==='on_attack')effect(attackerSide,attackerCard);
  checkWin();render();
}
function nextPhase(){
  if(!canAct()){
    if(duel?.turn!=='player')window.showActionNotice('Đang là lượt của đối thủ!');
    else window.showActionNotice('Đang giải quyết hiệu ứng bài, vui lòng đợi...');
    return;
  }
  if(duel.mode){
    window.showActionNotice('Hãy hoàn tất hoặc bấm Hủy thao tác đang chọn trước!');
    return log('Hoàn tất hoặc huỷ thao tác đang chọn trước.');
  }
  if(duel.round===1){
    window.showActionNotice('Người đi trước không thể tấn công trong Lượt 1 (Tự động chuyển lượt)!', 'Lượt 1');
    return endPlayerTurn();
  }
  if(duel.phase==='MAIN1'){duel.phase='BATTLE';log('⚔️ Bắt đầu phase CHIẾN ĐẤU.');render();return;}
  if(duel.phase==='BATTLE'){duel.phase='MAIN2';log('➡️ MAIN 2: tiếp tục dùng bài.');render();return;}
  endPlayerTurn();
}
function endPlayerTurn(){
  const s=side('player');while(s.hand.length>6){const id=s.hand.pop();s.grave.push(id);log(`🗑️ Bỏ ${card(id)?.name} do quá 6 lá trên tay.`);}
  duel.turn='enemy';duel.phase='MAIN1';duel.round++;duel.selected=null;
  if(window.memeOnlineIsPlaying?.()){log('🌐 Đến lượt đối thủ...');render();return;}
  log('🤖 Đến lượt đối thủ...');render();aiTimer=setTimeout(aiTurn,650);
}
async function aiTurn(){
  if(!duel||duel.finished||duel.turn!=='enemy')return;
  const match=duel;
  window.memeRules?.beginTurn('enemy');if(duel.finished){render();return;}
  const s=side('enemy');if(!draw('enemy'))return;
  log('🤖 Đối thủ rút một lá.');
  if(window.memeRules){
    for(let i=0;i<s.spells.length;i++){const p=s.spells[i],c=card(p?.id);if(!p?.faceDown||p.setRound>=duel.round||window.memeRules.counterCodes.includes(c?.effect_code)||!window.memeRules.canExecute('enemy',c))continue;p.faceDown=false;if(c.trap_category!=='Liên Tục'){s.spells[i]=null;s.grave.push(c.id);effect('enemy',c);}if(duel.finished){render();return;}}
    for(const e of window.memeRules.entries('enemy')){const c=card(e.slot.id);if(c?.effect_trigger==='activated'&&e.slot.effectUsedRound!==duel.round&&window.memeRules.canExecute('enemy',c)){e.slot.effectUsedRound=duel.round;effect('enemy',c);if(duel.finished){render();return;}}}
  }
  // Prioritize spells that change the board, draw/search, or prevent lethal damage.
  async function playUsefulSpells(limit){
    let used=0;
    while(used<limit&&!duel.finished){
      const options=s.hand.map((id,index)=>({id,index,c:card(id)})).filter(x=>{
        const c=x.c;if(c?.card_type!=='Spell'||c.spell_category==='Nghi Lễ')return false;
        if(c.spell_category==='Trang Bị'&&!s.monsters.some(Boolean)&&!s.extra)return false;
        if(c.spell_category==='Liên Tục'&&s.spells.indexOf(null)<0)return false;
        if(c.spell_category==='Môi Trường'&&s.field)return false;
        if(window.memeRules&&!window.memeRules.canExecute('enemy',c))return false;
        if(c.effect_code==='destroy_all_opponent_monsters'&&!side('player').monsters.some(Boolean)&&!side('player').extra)return false;
        return true;
      });
      const score=x=>window.memePhase2?.spellScore('enemy',x.c)??1000;
      options.sort((a,b)=>score(b)-score(a));
      const best=options[0];if(!best||score(best)<=0)return;
      const {id,c}=best;s.hand.splice(s.hand.indexOf(id),1);used++;
      if(window.memeRules?.negateSpell('enemy')){s.grave.push(id);log(`🤖 ${c.name} bị vô hiệu.`);continue;}
      if(c.spell_category==='Môi Trường')s.field={id};
      else if(c.spell_category==='Liên Tục')s.spells[s.spells.indexOf(null)]={id,faceDown:false,setRound:duel.round};
      else if(c.spell_category==='Trang Bị'){const target=s.monsters.find(Boolean)||s.extra;if(window.memeRules)window.memeRules.equip(target,c);else target.equip=(target.equip||0)+(c.effect_value||0);s.grave.push(id);}
      else{s.grave.push(id);effect('enemy',c);}
      log(`🤖 Đối thủ dùng ${c.name}.`);if(duel.finished)return;
    }
  }
  await playUsefulSpells(2);
  if(duel!==match||duel.finished)return;
  window.memeRules?.aiSpecialSummon('enemy');
  if(duel.finished){render();return;}render();
  // Summon strongest affordable normal monster.
  let candidates=s.hand.map((id,index)=>({id,index,c:card(id)})).filter(x=>x.c?.card_type==='Monster'&&!x.c.special_only&&!['Đồng Bộ','Nghi Lễ','Dung Hợp','Dung hợp','Fusion'].includes(x.c.monster_category));
  if(window.memePhase2?.normalCandidates)candidates=window.memePhase2.normalCandidates('enemy',candidates);
  else candidates.sort((a,b)=>b.c.atk-a.c.atk);
  for(const x of candidates){const need=x.c.stars>=7?2:x.c.stars>=5?1:0;const occupied=s.monsters.map((slot,i)=>slot?i:-1).filter(i=>i>=0);if(occupied.length<need)continue;
    const tributes=occupied.sort((a,b)=>effectiveAtk('enemy',s.monsters[a])-effectiveAtk('enemy',s.monsters[b])).slice(0,need),free=s.monsters.findIndex((slot,i)=>!slot||tributes.includes(i));if(free<0)continue;
    if(window.memeFx)await window.memeFx.summon(0,free,false,'enemy');if(duel!==match||duel.finished)return;
    for(const i of tributes){putGrave('enemy',s.monsters[i]);s.monsters[i]=null;}
    s.monsters[free]=monsterSlot(x.id,'atk');s.hand.splice(s.hand.indexOf(x.id),1);log(`🤖 Đối thủ triệu hồi ${x.c.name}!`);if(x.c.effect_trigger==='on_summon')effect('enemy',x.c);break;
  }
  window.memeRules?.aiSpecialSummon('enemy');
  if(duel!==match||duel.finished)return;
  // Set a stronger defensive trap first when the board makes it useful.
  await playUsefulSpells(1);
  if(duel!==match||duel.finished)return;
  const aiHero=getHero(s.heroId);if(aiHero.code!=='heal'||s.lp<=3300)useHeroSkill('enemy');if(duel.finished)return;
  const trapPriority={destroy_attack_position:100,trap_hole:85,torrential:80,magic_cylinder:70,negate_attack:60,destroy_attacker:55,waboku:45,magic_jammer:40,seven_tools:35};
  const traps=s.hand.filter(id=>card(id)?.card_type==='Trap').sort((a,b)=>(trapPriority[card(b)?.effect_code]||20)-(trapPriority[card(a)?.effect_code]||20));
  const trap=traps[0],freeSpell=s.spells.indexOf(null);
  if(trap&&freeSpell>=0){s.hand.splice(s.hand.indexOf(trap),1);s.spells[freeSpell]={id:trap,faceDown:true,setRound:duel.round};log('🤖 Đối thủ úp một lá Bẫy.');}
  if(duel.finished)return;
  duel.phase='BATTLE';render();
  aiTimer=setTimeout(async()=>{
    if(duel!==match||duel.finished)return;
    for(let i=0;i<3;i++){for(let n=0;n<2&&canAttackSlot(s.monsters[i]);n++){const before=s.monsters[i]?.attacksUsed||0;await aiAttack(i,false);if(duel!==match||duel.finished)return;if((s.monsters[i]?.attacksUsed||0)===before)break;}}
    if(s.extra){for(let n=0;n<2&&canAttackSlot(s.extra);n++){const before=s.extra?.attacksUsed||0;await aiAttack(-1,true);if(duel!==match||duel.finished)return;if((s.extra?.attacksUsed||0)===before)break;}}
    duel.turn='player';duel.phase='MAIN1';duel.round++;duel.normalSummoned=false;duel.player.monsters.forEach(slot=>{if(slot)slot.attacked=false;});if(duel.player.extra)duel.player.extra.attacked=false;
    window.memeRules?.beginTurn('player');if(duel.finished){render();return;}
    if(!draw('player'))return;log(`🟢 Lượt ${duel.round}: bạn rút một lá.`);render();
  },650);
}
async function aiAttack(index,isExtra){
  const attacking=isExtra?side('enemy').extra:side('enemy').monsters[index];if(!canAttackSlot(attacking))return;
  const defender=side('player');const targets=defender.monsters.map((slot,i)=>slot?i:-1).filter(i=>i>=0);
  if(defender.extra)targets.push('extra');
  let target=null;
  if(targets.length){
    const options=targets.map(i=>({index:i==='extra'?-1:i,extra:i==='extra',slot:i==='extra'?defender.extra:defender.monsters[i]}));
    const picked=window.memePhase2?.attack('enemy',attacking,options);
    if(picked===null)return;
    target=picked?.extra?'extra':picked?.index;
  }
  duel.pending={index,isExtra};await resolveAttack(target==='extra'?null:target,target==='extra');
}
function handleZone(name,type,index){
  if(!duel||duel.finished||window.memeFx?.busy||window.arcana200?.busy||window.memeClassic?.busy||window.memeAnime?.busy)return;const s=side(name);const slot=type==='extra'?s.extra:type==='field'?s.field:type==='monster'?s.monsters[index]:s.spells[index];
  if(duel.mode==='effect_target')return resolveEffectTarget(name,type,index);
  if(name==='player'&&duel.mode==='tribute'&&type==='monster')return chooseTribute(index);
  if(name==='player'&&duel.mode==='extra'&&(type==='monster'||type==='extra'))return chooseExtraMaterial(index,type==='extra');
  if(name==='player'&&duel.mode==='ritual'&&type==='monster')return chooseRitualMaterial(index);
  if(name==='player'&&duel.mode==='equip'&&(type==='monster'||type==='extra'))return chooseEquip(index,type==='extra');
  if(name==='enemy'&&duel.mode==='attack'&&(type==='monster'||type==='extra')&&slot)return resolveAttack(type==='extra'?null:index,type==='extra');
  if(slot)select({name,type,index});
}
function addAction(host,label,fn,secondary=false){const b=document.createElement('button');b.type='button';b.className=secondary?'secondary-btn':'primary-btn';b.textContent=label;b.onclick=e=>{if(b.disabled)return;return fn(e);};host.appendChild(b);return b;}
async function activateMonsterEffect(index,isExtra=false){
  if(!mainPhase())return;const match=duel,slot=isExtra?side('player').extra:side('player').monsters[index],c=card(slot?.id);
  if(!slot||slot.position==='def_down'||c?.effect_trigger!=='activated'||slot.effectUsedRound===duel.round||!window.memeRules?.canExecute('player',c))return;
  slot.effectUsedRound=duel.round;
  if(window.memeFx?.activateSlot)await window.memeFx.activateSlot('player',index,isExtra,c);
  if(duel!==match)return;effect('player',c);render();
}
function renderInspector(){
  const host=$('cardInspector'),sel=duel.selected;if(!sel){host.innerHTML='<div class="inspector-empty">🃏<span>Chọn một lá bài để xem ảnh, hiệu ứng và thao tác.</span></div>';return;}
  const s=side(sel.name);let id=sel.type==='hand'?s.hand[sel.index]:sel.type==='extra'?s.extra?.id:sel.type==='field'?s.field?.id:sel.type==='monster'?s.monsters[sel.index]?.id:s.spells[sel.index]?.id;
  const c=card(id);if(!c){duel.selected=null;renderInspector();return;}
  const slot=sel.type==='extra'?s.extra:sel.type==='monster'?s.monsters[sel.index]:sel.type==='spell'?s.spells[sel.index]:null;
  if(sel.name==='enemy'&&(slot?.faceDown||slot?.position==='def_down')){host.innerHTML='<div class="inspector-empty">🂠<span>Bài đối thủ đang úp. Nội dung được giữ bí mật.</span></div>';return;}
  const info=imageInfo(id),kind=c.card_type==='Monster'?`Quái thú · ${c.is_tuner?'Tuner · ':''}${esc(c.monster_category)} · ${'★'.repeat(c.stars||0)}`:c.card_type==='Spell'?`Bài Phép · ${esc(c.spell_category)}`:`Bài Bẫy · ${esc(c.trap_category)}`;
  host.innerHTML=`${artHTML(id,'inspect-art-wrap')}<h3 class="inspect-name">${esc(c.name)}</h3><div class="inspect-meta">${kind}</div>${c.card_type==='Monster'?`<div class="inspect-stats">⚔️ ATK ${effectiveAtk(sel.name,slot||{id})} · 🛡️ DEF ${effectiveDef(sel.name,slot||{id})}</div>`:''}<p class="inspect-description">${esc(c.description)}</p>${info?`<a class="inspect-source" href="${esc(info.source)}" target="_blank" rel="noopener">Ảnh: ${esc(info.creator)} · ${esc(info.license.toUpperCase())}</a>`:''}<div class="inspect-actions" id="inspectActions"></div>`;
  const wrap=host.querySelector('.inspect-art-wrap');if(c.art_tile==null){wrap.style.background=`linear-gradient(145deg,${c.art?.c1||'#42616e'},${c.art?.c2||'#1a2938'})`;wrap.innerHTML=`<span>${esc(c.art?.emoji||'🃏')}</span>${art(id)?`<img src="${esc(art(id))}" alt="${esc(c.name)}" referrerpolicy="no-referrer" onerror="this.remove()">`:''}`;}
  wrap.setAttribute('role','button');wrap.setAttribute('tabindex','0');wrap.setAttribute('aria-label',`Xem đầy đủ lá ${c.name}`);
  const showCardDetails=()=>showModal(`<h2>${esc(c.name)}</h2><div class="detail-card-art">${artHTML(id,'inspect-art-wrap')}</div><p class="card-meta-line">${kind}${c.card_type==='Monster'?` · ⚔️ ATK ${effectiveAtk(sel.name,slot||{id})} · 🛡️ DEF ${effectiveDef(sel.name,slot||{id})}`:''}</p><p class="card-desc-line">${esc(c.description)}</p>${info?`<a class="inspect-source" href="${esc(info.source)}" target="_blank" rel="noopener">Ảnh: ${esc(info.creator)} · ${esc(info.license.toUpperCase())}</a>`:''}`);
  wrap.addEventListener('click',showCardDetails);wrap.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showCardDetails();}});
  const actions=$('inspectActions');if(!canAct()||sel.name!=='player'||duel.mode)return;
  if(sel.type==='hand'&&mainPhase()){
    if(c.card_type==='Monster'){
      if(c.role_index===1&&c.family==='comeback'&&side('enemy').lp-s.lp>=1500)addAction(actions,'✦ Gọi đặc biệt từ tay',()=>window.arcana200.run(()=>window.arcana200.specialComeback('player',sel.index)));
      if(isExtraCard(id))return;
      else if(c.is_boss)addAction(actions,'🌟 Triệu hồi Boss',()=>summon(sel.index,'atk'));
      else if(c.monster_category==='Nghi Lễ')addAction(actions,'🕯️ Nghi Lễ',()=>summon(sel.index,'atk'));
      else{addAction(actions,'⚔️ Triệu hồi thế công',()=>summon(sel.index,'atk'));addAction(actions,'🛡️ Úp thế thủ',()=>summon(sel.index,'def_down'),true);}
    }else if(c.card_type==='Spell'){addAction(actions,'💚 Kích hoạt Phép',()=>playSpell(sel.index));addAction(actions,'🂠 Úp Phép',()=>window.memeSetSpell(sel.index),true);}
    else addAction(actions,'🔴 Úp Bẫy',()=>setTrap(sel.index));
  }
  if((sel.type==='monster'||sel.type==='extra')&&slot){
    if(mainPhase()&&(c.effect_trigger==='activated'||c.is_boss)){
      const effectProblem = typeof window.monsterEffectProblem === 'function' ? window.monsterEffectProblem('player', slot, c) : (slot.position==='def_down'?'Quái thú đang úp mặt!':slot.effectUsedRound===duel.round&&(!c.tcg||c.tcg_once!==false)?'Hiệu ứng đã dùng trong lượt này!':!window.memeRules?.canExecute('player',c)?'Chưa đủ điều kiện kích hoạt!':null);
      if(!effectProblem) addAction(actions,'✦ Kích hoạt hiệu ứng',()=>activateMonsterEffect(sel.index,sel.type==='extra'));
      else addAction(actions,'✦ Kích hoạt hiệu ứng',()=>window.showActionNotice(effectProblem,'Chưa thể kích hoạt'),true);
    }
    if(mainPhase()&&slot.summonedRound<duel.round){addAction(actions,slot.position==='atk'?'🛡️ Đổi thế thủ':'⚔️ Đổi thế công',()=>{slot.position=slot.position==='atk'?'def':'atk';log(`🔄 ${c.name} đổi tư thế.`);render();},true);}
  }
  if(slot&&mainPhase()&&window.arcana200?.enabled(slot)&&c.family==='spell'&&(slot.spellCounters||0)>=2)addAction(actions,'✦ Dùng 2 dấu Chú: rút 1',()=>window.arcana200.spendCounters(sel));
  if(sel.type==='spell'&&slot&&!slot.faceDown&&c.role_index===7)addAction(actions,'✦ Hiệu ứng Phép liên tục',()=>window.arcana200.activateContinuous(sel.index));
  if(sel.type==='spell'&&slot?.faceDown){if(c.card_type==='Spell'&&mainPhase())addAction(actions,'💚 Lật Phép',()=>window.memeActivateSetSpell(sel.index));else if(c.card_type==='Trap')addAction(actions,'🔴 Lật Bẫy',()=>activateTrap(sel.index));}
}
function renderZones(name,type,hostId){
  const host=$(hostId),s=side(name);host.innerHTML='';const slots=type==='monster'?s.monsters:s.spells;
  slots.forEach((slot,index)=>{
    const b=document.createElement('div');b.tabIndex=0;b.setAttribute('role','button');const c=card(slot?.id),hidden=name==='enemy'&&(slot?.faceDown||slot?.position==='def_down');
    const validTarget = effectTargetValid(name,type,index)||(duel.mode==='attack'&&name==='enemy'&&type==='monster'&&!!slot) ||
      (['tribute','extra','ritual'].includes(duel.mode)&&name==='player'&&type==='monster'&&!!slot&&(duel.mode!=='extra'||slot.position!=='def_down'));
    b.className=`field-slot ${slot?'occupied':''} ${slot?.position==='atk'?'attack-position':''} ${validTarget?'valid-target':''} ${c?.card_type==='Spell'?'spell-card':''} ${c?.card_type==='Trap'?'trap-card':''} ${hidden?'face-down':''} ${slot?.position==='def'||slot?.position==='def_down'?'defense':''} ${slot?.attacked?'exhausted':''} ${duel.selected?.name===name&&duel.selected?.type===type&&duel.selected?.index===index?'selected':''}`;
    b.dataset.side=name;b.dataset.zone=type;b.dataset.index=index;
    b.classList.toggle('material-chosen',duel.mode==='extra'&&name==='player'&&type==='monster'&&duel.pending?.chosen.includes(index));
    if(!slot)b.innerHTML=type==='monster'?'✧':'◇';
    else if(hidden)b.innerHTML='<span class="slot-emoji">🂠</span>';
    else b.innerHTML=`${artHTML(slot.id,'zone-art')}<span class="slot-label">${esc(window.arcana200?.displayName(slot)||c.name)}</span>${window.arcana200&&!hidden?`<span class="slot-effect-tag">${slot.effectsNegated||(slot.negatedUntil??-1)>=duel.round?'⛔ ':''}${slot.marks?'◆'+slot.marks+' ':''}${slot.spellCounters?'✦'+slot.spellCounters+' ':''}${slot.banishOnLeave?'↗':''}</span>`:''}${type==='monster'?`<span class="slot-stats">${slot.position==='atk'?'⚔'+effectiveAtk(name,slot):'🛡'+effectiveDef(name,slot)}</span>${(slot.frozenUntil??-1)>=duel.round?'<span class="slot-status">❄ KHÓA</span>':window.memeRules?.trait(slot,'double_attack')?`<span class="slot-status">${Math.max(0,2-(slot.attacksUsed||0))}×</span>`:''}`:''}`;
    b.title=hidden?'Bài úp':slot?`${c.name} · ${c.description}`:'Ô trống';b.addEventListener('click',()=>handleZone(name,type,index));b.addEventListener('keydown',event=>{if(event.target===b&&['Enter',' '].includes(event.key)){event.preventDefault();handleZone(name,type,index);}});host.appendChild(b);
  });
}
function renderSpecial(name,type,hostId){
  const host=$(hostId),slot=type==='field'?side(name).field:side(name).extra,c=card(slot?.id),monster=type==='extra'&&slot&&c?.card_type==='Monster';
  host.classList.toggle('has-card',!!slot);host.innerHTML=slot?`${artHTML(slot.id,'special-art')}<small>${esc(c.name)}</small>${monster?`<b class="special-stats">${slot.position==='atk'?'⚔':'🛡'}${slot.position==='atk'?effectiveAtk(name,slot):effectiveDef(name,slot)}</b>`:''}`:`${type==='field'?'🌍':'✦'}<small>${type==='field'?'Môi trường':'Ô quái Extra'}</small>`;
  host.classList.toggle('valid-target',effectTargetValid(name,type,-1)||!!slot&&((name==='enemy'&&type==='extra'&&duel.mode==='attack')||(name==='player'&&type==='extra'&&duel.mode==='extra'&&slot.position!=='def_down')));
  host.classList.toggle('material-chosen',duel.mode==='extra'&&name==='player'&&type==='extra'&&duel.pending?.chosen.includes(-1));
  host.onclick=()=>handleZone(name,type,-1);
}
function renderHand(){
  const host=$('hand');host.innerHTML='';side('player').hand.forEach((id,index)=>{
    const c=card(id);if(!c)return;const b=document.createElement('button');b.className=`card ${c.card_type}${duel.selected?.type==='hand'&&duel.selected.index===index?' selected':''}`;
    b.innerHTML=`<span class="card-name">${esc(c.name)}</span><span class="card-rank"><span class="rarity-text">${esc(c.rarity||'N')}${c.is_tuner?' · TUNER':''}</span>${c.card_type==='Monster'?`<span class="stars">${'★'.repeat(c.stars||0)}</span>`:`<span>${esc(c.element||'')}</span>`}</span><span class="card-art">${artHTML(id,'hand-art')}</span><span class="card-stats">${c.card_type==='Monster'?`ATK ${c.atk} / DEF ${c.def}`:esc(c.spell_category||c.trap_category)}</span>`;
    b.title=c.description;b.addEventListener('click',()=>{if(duel.mode)return;select({name:'player',type:'hand',index});});host.appendChild(b);
  });
}
function render(){
  if(!duel)return;const oldElements=window.memeFx?.beforeRender(),p=side('player'),e=side('enemy');
  if(window.memeFx){window.memeFx.setLp('player',p.lp);window.memeFx.setLp('enemy',e.lp);}
  else {$('playerLife').textContent=`${Math.max(0,p.lp)} LP`;$('enemyLife').textContent=`${Math.max(0,e.lp)} LP`;$('playerLifeBar').style.width=`${Math.max(0,Math.min(100,p.lp/40))}%`;$('enemyLifeBar').style.width=`${Math.max(0,Math.min(100,e.lp/40))}%`;}
  $('playerDeck').textContent=p.deck.length;$('enemyDeck').textContent=e.deck.length;$('playerGY').textContent=p.grave.length;$('enemyGY').textContent=e.grave.length;
  for(const name of ['player','enemy']){const node=$(name+'Banished');if(node)node.textContent=(side(name).banished||[]).length;}
  for(const name of ['player','enemy'])$(name+'ExtraCount').textContent=side(name).extraDeck?.length||0;
  for(const name of ['player','enemy']){const node=$(name+'Shield');if(node)node.textContent=`💎 ${side(name).shield||0}`;}
  const names=window.memeOnlineNames?.();$('playerName').textContent=names?.player||getHero(p.heroId).name;$('enemyName').textContent=names?.enemy||getHero(e.heroId).name+' · Máy';
  $('handCount').textContent=p.hand.length;$('summonStatus').textContent=duel.normalSummoned?'Đã triệu hồi thường':'Có thể triệu hồi thường';
  const phase=duel.turn==='player'?PHASE_NAME[duel.phase]:'LƯỢT ĐỐI THỦ';$('turnBanner').textContent=`Lượt ${duel.round} · ${phase}`;$('phaseLabel').textContent=phase;
  $('phaseTrack').innerHTML=(duel.round===1?['MAIN1']:PHASES).map(p=>`<span class="${duel.phase===p&&duel.turn==='player'?'active':''}">${PHASE_NAME[p]}</span>`).join('')+(duel.round===1?'<span title="Người đi trước không có Battle Phase trong lượt đầu">⛔ BATTLE</span>':'');
  if(duel.round===1)$('turnBanner').textContent='🔒 LƯỢT ĐẦU · CẤM BATTLE';
  $('nextPhaseBtn').textContent=duel.round===1?'⏭️ Kết thúc lượt':duel.phase==='MAIN1'?'⚔️ Sang chiến đấu ➜':duel.phase==='BATTLE'?'➡️ Sang MAIN 2':'⏭️ Kết thúc lượt';
  $('nextPhaseBtn').disabled=duel.turn!=='player'||duel.finished||!!window.memeFx?.busy||!!window.arcana200?.busy||!!window.memeClassic?.busy&&!window.memeAnime?.busy;$('cancelModeBtn').classList.toggle('hidden',!duel.mode);
  $('battleLog').innerHTML=duel.logs.map(line=>`<div class="log-line">${esc(line)}</div>`).join('');
  $('opponentHand').innerHTML=e.hand.map(()=>'<span title="Bài trên tay đối thủ"></span>').join('');
  renderZones('enemy','spell','enemySpells');renderZones('enemy','monster','enemyMonsters');renderZones('player','monster','playerMonsters');renderZones('player','spell','playerSpells');
  renderSpecial('enemy','field','enemyFieldSpell');renderSpecial('enemy','extra','enemyExtra');renderSpecial('player','field','playerFieldSpell');renderSpecial('player','extra','playerExtra');
  renderHand();renderInspector();renderHeroSkills();
  window.memeBattleUX?.refresh();
  window.memeFx?.afterRender(duel,oldElements);
  if($('modal').querySelector('.pile-modal')&&!$('modal').classList.contains('hidden'))renderPile();
  window.memeOnlineOnRender?.();
}
function openPile(name,kind){if(!duel)return;pileView={name,kind};renderPile();}
function renderPile(){
  if(!duel||!pileView)return;const {name,kind}=pileView,s=side(name),extra=kind==='extra',banished=kind==='banished',hidden=extra&&name==='enemy',list=extra?(s.extraDeck||[]):[...(banished?s.banished||[]:s.grave)].reverse();
  showModal(`<h2>${extra?'✦ Extra Deck':banished?'↗ Trục xuất':'⚰ Mộ'} · ${name==='player'?'của bạn':'đối thủ'} <small>(${list.length} lá)</small></h2><p class="pile-hint">${hidden?'Extra Deck đối thủ được giữ kín. Chỉ xem được số lá còn lại.':extra?'Dung Hợp: Phép Dung Hợp và đúng nguyên liệu ghi trên lá, lấy từ tay hoặc sân. Không dùng lượt triệu hồi thường.':'Lá mới xuống mộ nằm trước. Bấm một lá để đọc toàn bộ hiệu ứng.'}</p><div id="pileCards" class="pile-cards"></div>`);
  $('modal').querySelector('.modal-card').classList.add('pile-modal');
  if(!extra){const toggle=addAction($('modalContent'),banished?'⚰ Xem Mộ':'↗ Xem bài trục xuất',()=>openPile(name,banished?'grave':'banished'),true);toggle.classList.add('pile-toggle');}
  if(hidden)return;
  if(!list.length){$('pileCards').innerHTML='<p class="pile-empty">Chưa có lá bài.</p>';return;}
  list.forEach((id,index)=>{const c=card(id);if(!c)return;const item=document.createElement('article');item.className='pile-card';item.dataset.cardId=id;
    item.innerHTML=`<button class="pile-preview">${artHTML(id,'pile-art')}<span><b>${esc(c.name)}</b><small>${extra?'EXTRA · ':''}${c.is_tuner?'TUNER · ':''}${c.card_type==='Monster'?`★${c.stars} · ${c.atk}/${c.def}`:esc(c.spell_category||c.trap_category)}</small></span></button>`;
    item.querySelector('button').onclick=()=>{showModal(`<h2>${esc(c.name)}</h2><div class="library-detail-art">${artHTML(id,'inspect-art-wrap')}</div><p class="card-meta-line">${esc(c.monster_category||c.spell_category||c.trap_category)}${c.card_type==='Monster'?` · ★${c.stars} · ATK ${c.atk} / DEF ${c.def}`:''}</p><p class="card-desc-line">${esc(c.description)}</p><button id="backToPile" class="secondary-btn">← ${extra?'Extra Deck':'Mộ'}</button>`);$('backToPile').onclick=renderPile;};
    if(extra){
      const prob = typeof window.extraSummonProblem === 'function' ? window.extraSummonProblem('player', id) : (!synchroOptions('player',id).length ? 'Cần đúng nguyên liệu / Phép phù hợp' : null);
      const ready = !prob && mainPhase() && !duel.mode;
      const label = ready ? (c.summon_type==='transformation'?'◈ Biến Đổi':c.contact?'🌀 Hợp thể từ sân':'🌀 Dung Hợp') : (prob && prob.includes('cấm') ? '⛔ Bị cấm Triệu hồi' : '🌀 Chưa đủ điều kiện ⓘ');
      addAction(item, label, ()=>summonExtra(index), !ready);
    }
    $('pileCards').appendChild(item);
  });
}
function showRules(){showModal('<h2>Luật Xóm Arcana · 200 lá</h2><ul><li>4000 LP · rút 4 lá đầu · Main đúng 20 lá · Extra tối đa 5 lá.</li><li>Mỗi tên: N/R tối đa 3 bản, SR 2 bản, UR 1 bản, tính cả Main và Extra.</li><li>MAIN 1 → CHIẾN ĐẤU → MAIN 2. Mỗi lượt triệu hồi thường/úp 1 quái; 5–6 sao hiến tế 1, từ 7 sao hiến tế 2.</li><li>Boss chỉ triệu hồi đặc biệt theo điều kiện ghi trên lá. Boss Extra dùng 2 quái ngửa cùng tộc, tổng sao từ 6.</li><li>Bẫy phải úp từ lượt trước, tự phản ứng khi đủ điều kiện. Hiệu ứng nhanh sẽ hỏi ở lượt đối thủ.</li><li>Hiệu ứng chủ động có chi phí và mục tiêu để chọn. Mỗi hiệu ứng theo tên lá chỉ dùng 1 lần/lượt trừ phần liên tục.</li><li>Bấm Mộ để xem bài đã dùng và bài trục xuất. Chọn avatar để xem kỹ năng dùng chung cho mọi bộ bài, 1 lần/trận.</li></ul>');}
function openDeckBuilder(){
  deckFilter='All';deckSearch='';deckView='all';deckArchetype='';deckRarity='';
  const active=deckLibrary.decks.find(d=>d.id===deckLibrary.activeId);
  deckDraft={id:active.id,name:active.name,cards:[...active.cards],extra:[...active.extra]};renderDeckBuilder();
}
function freshDeckId(){return 'deck-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
function commitDeckDraft(){
  const problem=deckProblem(deckDraft.cards,deckDraft.extra);if(problem)return;
  const name=deckDraft.name.trim().slice(0,40);if(!name){$('deckStatus').textContent='Hãy đặt tên cho bộ bài.';$('deckNameInput').focus();return;}
  const saved={id:deckDraft.id,name,cards:[...deckDraft.cards],extra:[...deckDraft.extra]};
  const library={activeId:saved.id,decks:[...deckLibrary.decks.filter(d=>d.id!==saved.id),saved]};
  try{localStorage.setItem(DECK_LIBRARY_KEY,JSON.stringify(library));}catch{$('deckStatus').textContent='Không lưu được trên trình duyệt này. Kiểm tra dung lượng lưu trữ rồi thử lại.';return;}
  deckLibrary=library;deckList=[...saved.cards];extraDeckList=[...saved.extra];try{saveDeck();}catch{}closeModal();
}
function renderDeckBuilder(){
  if(!deckDraft)return openDeckBuilder();
  const count=deckDraft.cards.length,problem=deckProblem(deckDraft.cards,deckDraft.extra),counts={Monster:0,Spell:0,Trap:0};
  for(const id of deckDraft.cards)counts[card(id).card_type]++;
  showModal(`<h2>🃏 Chỉnh sửa bộ bài</h2>
    <div class="deck-profile"><select id="savedDecks" aria-label="Chọn bộ bài đã lưu">${deckLibrary.decks.map(d=>`<option value="${esc(d.id)}" ${d.id===deckDraft.id?'selected':''}>${esc(d.name)}${d.id===deckLibrary.activeId?' · đang dùng':''}</option>`).join('')}${!deckLibrary.decks.some(d=>d.id===deckDraft.id)?'<option value="" selected>Bộ mới chưa lưu</option>':''}</select><button class="secondary-btn" id="newDeck">＋ Tạo mới</button><button class="secondary-btn" id="cloneDeck">Nhân bản</button></div>
    <label class="deck-name">Tên bộ bài<input id="deckNameInput" maxlength="40" value="${esc(deckDraft.name)}" placeholder="Đặt tên bộ bài…"></label>
    <div class="deck-summary"><b>Main ${count}/${MAIN_SIZE} · Extra ${deckDraft.extra.length}/${EXTRA_LIMIT}</b><span>⚔ ${counts.Monster} Quái</span><span>✦ ${counts.Spell} Phép</span><span>◈ ${counts.Trap} Bẫy</span></div>
    <div class="deck-tabs" role="tablist" aria-label="Xem bài"><button id="allCardsTab" role="tab" aria-selected="${deckView==='all'}">Kho ${CARDS.length} lá</button><button id="selectedCardsTab" role="tab" aria-selected="${deckView==='selected'}">Main (${count})</button><button id="extraCardsTab" role="tab" aria-selected="${deckView==='extra'}">Extra (${deckDraft.extra.length})</button><a id="downloadCardExcel" class="deck-excel" href="assets/exports/${CATALOGUE.excelFilename||`xom-arcana-${CARDS.length}-la.xlsx`}" download="YuGiOh-DMGX-${CARDS.length}-la-VietHoa.xlsx" title="Tải danh mục và hiệu ứng đầy đủ">↓ Excel · ${CARDS.length} lá</a></div>
    <div class="library-tools"><input id="deckSearchInput" type="search" placeholder="Tìm tên, tộc, hiệu ứng…" aria-label="Tìm lá bài" value="${esc(deckSearch)}"><select id="deckPreset" aria-label="Chọn bộ bài mẫu"><option value="">Áp dụng bộ bài mẫu…</option><optgroup label="⭐ Bộ Tối Thượng (Duel Links Meta)">${['Kaiba · Đỉnh Cao Mắt Xanh','Yugi · Ma Thuật Tối Thượng','Joey · Rồng Đen Bất Diệt','Pegasus · Vương Quốc Hoạt Hình','Jaden · Anh Hùng Tối Thượng','Zane · Rồng Máy Tận Diệt'].filter(n=>window.MEME_DECK_PRESETS?.[n]).map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}</optgroup><optgroup label="⚔️ Bộ Cân Bằng (Phản công & Thần)">${Object.keys(window.MEME_DECK_PRESETS||{}).filter(n=>!['Kaiba · Đỉnh Cao Mắt Xanh','Yugi · Ma Thuật Tối Thượng','Joey · Rồng Đen Bất Diệt','Pegasus · Vương Quốc Hoạt Hình','Jaden · Anh Hùng Tối Thượng','Zane · Rồng Máy Tận Diệt'].includes(n)&&!n.includes('Kinh điển')).map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}</optgroup><optgroup label="🛡️ Bộ Cơ Bản (Kinh điển)">${Object.keys(window.MEME_DECK_PRESETS||{}).filter(n=>n.includes('Kinh điển')).map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}</optgroup></select></div>
    <div class="catalog-filters"><div class="deck-filters" id="deckFilters"></div><select id="deckArchetype" aria-label="Lọc theo bộ"><option value="">Tất cả bộ / tộc</option>${Object.keys(window.MEME_DECK_PRESETS||{}).map(name=>`<option ${name===deckArchetype?'selected':''}>${esc(name)}</option>`).join('')}</select><select id="deckRarity" aria-label="Lọc độ hiếm"><option value="">N / R / SR / UR</option>${['N','R','SR','UR'].map(r=>`<option ${r===deckRarity?'selected':''}>${r}</option>`).join('')}</select></div>
    <div class="deck-workspace"><div class="deck-builder"><div class="deck-grid" id="deckGrid"></div></div><aside id="deckInspector" class="deck-inspector" aria-label="Thông tin lá bài" aria-live="polite"></aside></div>
    <div id="deckStatus" role="status" class="deck-status ${problem?'invalid':''}">${esc(problem||`Hợp lệ · Main ${MAIN_SIZE} lá · N/R: 3 · SR: 2 · UR: 1 bản/tên`)}</div>
    <div class="deck-controls"><button class="secondary-btn" id="quickDeck">Bộ bài gốc</button><button class="secondary-btn" id="clearDeck">Làm trống</button><button class="secondary-btn" id="imageSources">Nguồn ảnh</button><button class="primary-btn" id="saveDeck" ${problem?'disabled':''}>Lưu & dùng bộ này</button></div>
    <small class="deck-local-note">Bộ đã lưu dùng cho cả đấu máy và online trên trình duyệt này. Đóng để bỏ thay đổi chưa lưu.</small>`,true);
  for(const [value,label] of [['All','Tất cả'],['Monster','Quái'],['Spell','Phép'],['Trap','Bẫy']]){const b=document.createElement('button');b.textContent=label;b.className=deckFilter===value?'active':'';b.addEventListener('click',()=>{deckFilter=value;renderDeckBuilder();});$('deckFilters').appendChild(b);}
  renderDeckCards();
  renderDeckInspector();
  $('deckArchetype').onchange=e=>{deckArchetype=e.target.value;renderDeckCards();};$('deckRarity').onchange=e=>{deckRarity=e.target.value;renderDeckCards();};
  $('deckNameInput').oninput=e=>{deckDraft.name=e.target.value;};
  $('savedDecks').onchange=e=>{const saved=deckLibrary.decks.find(d=>d.id===e.target.value);if(saved){deckDraft={...saved,cards:[...saved.cards],extra:[...saved.extra]};renderDeckBuilder();}};
  $('newDeck').onclick=()=>{deckDraft={id:freshDeckId(),name:'Bộ bài mới',cards:[],extra:[]};deckView='all';renderDeckBuilder();};
  $('cloneDeck').onclick=()=>{deckDraft={id:freshDeckId(),name:(deckDraft.name+' · bản sao').slice(0,40),cards:[...deckDraft.cards],extra:[...deckDraft.extra]};renderDeckBuilder();};
  $('allCardsTab').onclick=()=>{deckView='all';renderDeckBuilder();};
  $('selectedCardsTab').onclick=()=>{deckView='selected';renderDeckBuilder();};
  $('extraCardsTab').onclick=()=>{deckView='extra';renderDeckBuilder();};
  $('deckSearchInput').oninput=e=>{deckSearch=e.target.value;renderDeckCards();};
  $('deckPreset').onchange=e=>{if(window.MEME_DECK_PRESETS?.[e.target.value]){deckDraft.cards=[...window.MEME_DECK_PRESETS[e.target.value]];deckDraft.extra=[...(window.MEME_EXTRA_PRESETS?.[e.target.value]||defaultExtraDeck())];renderDeckBuilder();}};
  $('quickDeck').addEventListener('click',()=>{deckDraft.cards=defaultDeck();deckDraft.extra=defaultExtraDeck();renderDeckBuilder();});
  $('clearDeck').onclick=()=>{if(deckView==='extra')deckDraft.extra=[];else deckDraft.cards=[];renderDeckBuilder();};
  $('imageSources').addEventListener('click',showCredits);
  $('saveDeck').addEventListener('click',commitDeckDraft);
}
function renderDeckCards(){
  $('deckGrid').innerHTML='';const query=deckSearch.toLocaleLowerCase('vi');
  for(const c of CARDS.filter(c=>(deckView!=='selected'||deckDraft.cards.includes(c.id))&&(deckView!=='extra'||extraEligible(c.id))&&(!deckArchetype||c.archetype===deckArchetype)&&(!deckRarity||c.rarity===deckRarity)&&(deckFilter==='All'||c.card_type===deckFilter)&&`${c.id} ${c.name} ${c.name_en||''} ${c.name_vi||''} ${c.description} ${c.archetype||''} ${c.tribe||''} ${c.element||''} ${c.monster_category||''} ${c.spell_category||''} ${c.trap_category||''}`.toLocaleLowerCase('vi').includes(query))){
    const useExtra=deckView==='extra'||isExtraCard(c.id),pool=useExtra?deckDraft.extra:deckDraft.cards,max=useExtra?EXTRA_LIMIT:MAIN_SIZE;
    const item=document.createElement('div');item.className='deck-item';item.dataset.cardId=c.id;const n=pool.filter(id=>id===c.id).length,total=[...deckDraft.cards,...deckDraft.extra].filter(id=>id===c.id).length;
    item.classList.toggle('in-deck',n>0);
    item.classList.toggle('preview-selected',deckInspectedId===c.id);
    const limitBadge=(c.max_copies&&c.max_copies<3)?`<span class="limit-badge limit-${c.max_copies}" title="Giới hạn ${c.max_copies} bản">${c.max_copies}</span>`:'';
    item.innerHTML=`<button class="library-preview" aria-label="Xem ${esc(c.name)}">${artHTML(c.id,'deck-art')}<span class="rarity ${esc(c.rarity)}">${esc(c.rarity)}</span>${limitBadge}</button><b>${esc(c.name)}</b><small>${useExtra?'EXTRA · ':''}${c.id} · ${c.card_type==='Monster'?`★${c.stars} · ${c.atk}/${c.def}`:esc(c.spell_category||c.trap_category)}</small><div class="deck-item-actions"><button class="secondary-btn" data-action="minus" aria-label="Bớt ${esc(c.name)}" ${n?'':'disabled'}>−</button><span class="count">${n}/${deckLimit(c.id)}</span><button class="secondary-btn" data-action="plus" aria-label="Thêm ${esc(c.name)}" ${pool.length>=max||total>=deckLimit(c.id)?'disabled':''}>+</button></div>`;
    item.querySelector('.library-preview').onclick=()=>showLibraryCard(c);
    const refresh=()=>{const top=document.querySelector('.deck-builder').scrollTop;renderDeckBuilder();document.querySelector('.deck-builder').scrollTop=top;};
    item.querySelector('[data-action="minus"]').addEventListener('click',()=>{const i=pool.indexOf(c.id);if(i>=0){pool.splice(i,1);refresh();}});
    item.querySelector('[data-action="plus"]').addEventListener('click',()=>{if(pool.length>=max||total>=deckLimit(c.id))return;pool.push(c.id);refresh();});item.addEventListener('click',e=>{if(!e.target.closest('button'))showLibraryCard(c);});$('deckGrid').appendChild(item);
  }
  if(!$('deckGrid').children.length)$('deckGrid').innerHTML='<p class="deck-empty">Chưa có lá phù hợp. Chọn Kho bài để thêm lá hoặc đổi bộ lọc.</p>';
}
function showLibraryCard(c){deckInspectedId=c.id;renderDeckInspector();document.querySelectorAll('#deckGrid .deck-item').forEach(n=>n.classList.toggle('preview-selected',n.dataset.cardId===c.id));}
function renderDeckInspector(){
  const host=$('deckInspector');if(!host)return;const c=card(deckInspectedId)||CARDS[0],main=deckDraft.cards.filter(id=>id===c.id).length,extra=deckDraft.extra.filter(id=>id===c.id).length;
  host.innerHTML=`<div class="deck-inspect-head">${artHTML(c.id,'deck-inspect-art')}<div><small>${c.id} · ${c.rarity} · tối đa ${deckLimit(c.id)}</small><h3>${esc(c.name)}</h3><span>${esc(c.monster_category||c.spell_category||c.trap_category)}</span>${c.card_type==='Monster'?`<b>★${c.stars} · ATK ${c.atk} / DEF ${c.def}</b>`:''}</div></div><div class="deck-inspect-body"><p class="inspect-archetype">${esc(c.archetype||'')} · ${esc(c.tribe||'')}</p><h4>Hiệu ứng</h4><p id="deckEffectText">${esc(c.description)}</p>${c.activation_rules?`<h4>Kích hoạt & giới hạn</h4><p>${esc(c.activation_rules)}</p>`:''}${c.interactions?`<h4>Tương tác</h4><p>${esc(c.interactions)}</p>`:''}${c.balance_note?`<h4>Cân bằng</h4><p>${esc(c.balance_note)}</p>`:''}${c.engine_notes?`<h4>Cách áp dụng trong game</h4><p>${esc(c.engine_notes)}</p>`:''}<p>${esc(c.role||'')} · ${esc(c.play_style||'')}${c.extra_eligible?' · Có thể đặt ở Main hoặc Extra':''}</p></div><div class="deck-inspect-actions"><small>Đang dùng: Main ${main} · Extra ${extra}</small><button id="inspectAddMain" class="secondary-btn" ${isExtraCard(c.id)||deckDraft.cards.length>=MAIN_SIZE||main+extra>=deckLimit(c.id)?'disabled':''}>＋ Main</button>${extraEligible(c.id)?`<button id="inspectAddExtra" class="secondary-btn" ${deckDraft.extra.length>=EXTRA_LIMIT||main+extra>=deckLimit(c.id)?'disabled':''}>＋ Extra</button>`:''}</div>`;
  const add=toExtra=>{if(!toExtra&&isExtraCard(c.id))return;const pool=toExtra?deckDraft.extra:deckDraft.cards,max=toExtra?EXTRA_LIMIT:MAIN_SIZE;if(pool.length>=max||main+extra>=deckLimit(c.id))return;pool.push(c.id);const top=document.querySelector('.deck-builder').scrollTop;renderDeckBuilder();document.querySelector('.deck-builder').scrollTop=top;};
  $('inspectAddMain').onclick=()=>add(false);if($('inspectAddExtra'))$('inspectAddExtra').onclick=()=>add(true);
}
function showCredits(){showModal('<h2>Hình ảnh Xóm Arcana</h2><p>Bộ tranh vector gốc của bộ Cổ Điển được tạo riêng cho game, lưu cục bộ và tải cùng bản phát hành. Phong cách hoạt hình, fantasy và manga.</p><button class="secondary-btn" id="backToLibrary">← Kho bài</button>');$('backToLibrary').onclick=renderDeckBuilder;}
renderHeroRoster();
document.querySelectorAll('[data-modal]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.modal==='Bộ bài')openDeckBuilder();else showModal(`<h2>${esc(button.dataset.modal)}</h2><p>Tính năng này sẽ mở ở phiên bản tiếp theo. Hãy thử Yu-Gi-Oh! DM / GX trước nhé!</p>`);}));
$('playBtn').addEventListener('click',()=>{if(deckList.length<20)return openDeckBuilder();if(window.memeOnlineChooseMode)window.memeOnlineChooseMode();else startGame();});$('helpBtn').addEventListener('click',showRules);$('rulesBtn').addEventListener('click',showRules);
$('closeModal').addEventListener('click',closeModal);$('modal').addEventListener('click',event=>{if(event.target===$('modal'))closeModal();});
$('backBtn').addEventListener('click',()=>{window.memeOnlineLeave?.();window.memeFx?.reset();clearTimeout(aiTimer);$('duel').classList.add('hidden');$('lobby').classList.remove('hidden');closeModal();duel=null;window.scrollTo(0,0);});
$('nextPhaseBtn').addEventListener('click',nextPhase);$('cancelModeBtn').addEventListener('click',clearMode);
$('inspectorToggleBtn').addEventListener('click',()=>document.querySelector('.duel-layout').classList.toggle('inspector-collapsed'));
for(const name of ['player','enemy']){$(name+'GraveBtn').onclick=()=>openPile(name,'grave');if($(name+'BanishedBtn'))$(name+'BanishedBtn').onclick=()=>openPile(name,'banished');$(name+'ExtraDeckBtn').onclick=()=>openPile(name,'extra');$(name+'SkillCard').onclick=()=>showHeroSkill(name);$(name+'Avatar').onclick=()=>showHeroSkill(name);}
