// Speed Duel adaptation of the Meme Xóm cards and rules in the Antigravity project.
// Card definitions are loaded unchanged from meme-data.js. Artwork is linked online.
const $ = id => document.getElementById(id);
const CARDS = window.MEME_CARDS || [];
const CARD_BY_ID = new Map(CARDS.map(card => [card.id, card]));
const HERO_NAMES = ['Hỏa Kiếm','Mira','Luna','Thuyền Trưởng','Huyết Ảnh'];
const PHASES = ['MAIN1','BATTLE','MAIN2'];
const PHASE_NAME = {MAIN1:'MAIN 1',BATTLE:'CHIẾN ĐẤU',MAIN2:'MAIN 2'};
const DECK_KEY = 'hai-trinh-meme-deck-v1';
let chosenHero = 0;
let deckList = loadDeck();
let duel = null;
let aiTimer = null;
let deckFilter = 'All';

function esc(value){return String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function card(id){return CARD_BY_ID.get(id);}
function imageInfo(id){return (window.MEME_IMAGE_LINKS||{})[id]||null;}
function art(id){return card(id)?.custom_image||imageInfo(id)?.url||'';}
function artHTML(id,className='card-image'){
  const c=card(id);if(!c)return '';
  const url=art(id);
  return `<span class="${className}" style="background:linear-gradient(145deg,${esc(c.art?.c1||'#42616e')},${esc(c.art?.c2||'#1a2938')})"><span class="art-emoji">${esc(c.art?.emoji||'🃏')}</span>${url?`<img src="${esc(url)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:''}</span>`;
}
function shuffle(list){const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function defaultDeck(){
  return [
    'trau_tre_len_doi','trau_tre_len_doi','co_mat_job','ech_xanh_triet_ly','ech_xanh_triet_ly',
    'cua_dong_bat_khuat','meo_map_lan_long','thanh_chui_binh_luan','ninja_luon_dem','ninja_luon_dem',
    'ba_hoa_dam_drama','anh_grab_da_nhiem','hiep_si_tra_sua','kiem_lam_bao_ve',
    'thuy_quai_lay_loi','trum_cuoi_bi_an','dai_de_trau_tre_toi_thuong',
    'hot_via','dinh_cua_chop','vong_tay_ban_than','trung_tang_bat_ngo',
    'dung_do_dung_di_dau','gay_ong_dap_lung_ong','tam_ly_vung_nhu_be_tong'
  ];
}
function loadDeck(){try{const saved=JSON.parse(localStorage.getItem(DECK_KEY));if(Array.isArray(saved)&&saved.length>=20&&saved.length<=30&&saved.every(id=>CARD_BY_ID.has(id)))return saved;}catch{}return defaultDeck();}
function saveDeck(){localStorage.setItem(DECK_KEY,JSON.stringify(deckList));}
function showModal(html,wide=false){$('modalContent').innerHTML=html;$('modal').classList.remove('hidden');$('modal').querySelector('.modal-card').classList.toggle('deck-modal',wide);}
function closeModal(){$('modal').classList.add('hidden');}
function notify(text){$('message').textContent=text;}
function log(text){if(!duel)return;duel.logs.unshift(text);duel.logs=duel.logs.slice(0,50);notify(text);}
function side(name){return duel[name];}
function other(name){return name==='player'?'enemy':'player';}
function putGrave(name,slot){if(slot)side(name).grave.push(slot.id);}
function draw(name){const s=side(name);if(!s.deck.length){finish(other(name),`${name==='player'?'Bạn':'Đối thủ'} hết bài để rút.`);return false;}s.hand.push(s.deck.shift());return true;}
function blankSide(deck){return{lp:4000,deck:shuffle(deck),hand:[],monsters:[null,null,null],spells:[null,null,null],field:null,extra:null,grave:[]};}
function startGame(){
  clearTimeout(aiTimer);closeModal();
  let botDeck=defaultDeck();botDeck[2]='lat_mat_khong_bao_truoc';botDeck[8]='lat_mat_khong_bao_truoc';
  duel={player:blankSide(deckList),enemy:blankSide(botDeck),turn:'player',phase:'MAIN1',round:1,normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};
  for(let i=0;i<4;i++){draw('player');draw('enemy');}
  $('lobby').classList.add('hidden');$('duel').classList.remove('hidden');$('playerName').textContent=HERO_NAMES[chosenHero];
  log('🎮 Đấu Trường Meme Xóm bắt đầu! Bạn đi trước.');render();window.scrollTo(0,0);
}
function finish(winner,reason=''){
  if(!duel||duel.finished)return;duel.finished=true;clearTimeout(aiTimer);
  render();const won=winner==='player';showModal(`<span class="result-icon">${won?'🏆':'💀'}</span><h2>${won?'Chiến thắng!':'Thất bại!'}</h2><p>${esc(reason|| (won?'Bạn đã làm chủ đấu trường meme!':'Thử một chiến thuật khác nhé.'))}</p><button class="primary-btn" id="againBtn">Đấu lại</button>`);
  $('againBtn').addEventListener('click',startGame);
}
function checkWin(){if(duel.enemy.lp<=0)finish('player');else if(duel.player.lp<=0)finish('enemy');return duel.finished;}
function effectiveAtk(name,slot){
  if(!slot)return 0;const c=card(slot.id);if(!c)return 0;
  let value=(c.atk||0)+(slot.equip||0);
  for(const permanent of [...side(name).spells,side(name).field]){
    if(!permanent||permanent.faceDown)continue;
    const pc=card(permanent.id);if(pc?.effect_code==='continuous_tribe_boost'&&pc.target_tribe===c.tribe)value+=pc.effect_value||0;
  }
  return value;
}
function effect(name,c){
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
function canAct(){return duel&&!duel.finished&&duel.turn==='player';}
function mainPhase(){return canAct()&&(duel.phase==='MAIN1'||duel.phase==='MAIN2');}
function select(item){if(!duel||duel.finished)return;duel.selected=item;render();}
function clearMode(){if(!duel)return;duel.mode=null;duel.pending=null;log('Đã huỷ thao tác.');render();}
function removeHand(index){return side('player').hand.splice(index,1)[0];}
function monsterSlot(id,position='atk'){return{id,position,attacked:false,equip:0,summonedRound:duel.round};}
function summon(index,position){
  if(!mainPhase())return log('Chỉ triệu hồi ở MAIN 1 hoặc MAIN 2.');
  if(duel.normalSummoned)return log('Bạn đã triệu hồi thường trong lượt này.');
  const id=side('player').hand[index],c=card(id);if(!c||c.card_type!=='Monster')return;
  if(c.monster_category==='Đồng Bộ')return summonExtra(index);
  if(c.monster_category==='Nghi Lễ')return summonRitual(index);
  const need=c.stars>=7?2:c.stars>=5?1:0;
  const occupied=side('player').monsters.map((slot,i)=>slot?i:-1).filter(i=>i>=0);
  if(occupied.length<need)return log(`Cần ${need} quái trên sân để hiến tế.`);
  if(need){duel.mode='tribute';duel.pending={index,position,needed:need,chosen:[]};log(`Chọn ${need} quái của bạn để hiến tế cho ${c.name}.`);render();return;}
  placeSummon(index,position,[]);
}
function placeSummon(handIndex,position,tributes){
  const s=side('player');for(const index of tributes){putGrave('player',s.monsters[index]);s.monsters[index]=null;}
  const free=s.monsters.indexOf(null);if(free<0)return log('Sân đã đầy 3 quái thú.');
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
function summonExtra(index){
  const c=card(side('player').hand[index]),req=c.fusion_requirement||{count:2,minStars:0};
  const available=side('player').monsters.map((slot,i)=>slot?i:-1).filter(i=>i>=0);
  if(available.length<req.count)return log(`Cần ${req.count} quái trên sân để Đồng Bộ.`);
  duel.mode='extra';duel.pending={index,needed:req.count,minStars:req.minStars,chosen:[]};log(`Chọn ${req.count} quái, tổng ít nhất ${req.minStars} sao.`);render();
}
function chooseExtraMaterial(index){
  const p=duel.pending;if(!side('player').monsters[index])return;
  if(p.chosen.includes(index))p.chosen=p.chosen.filter(i=>i!==index);else p.chosen.push(index);
  if(p.chosen.length<p.needed){log(`Đã chọn ${p.chosen.length}/${p.needed} nguyên liệu.`);render();return;}
  const stars=p.chosen.reduce((n,i)=>n+(card(side('player').monsters[i].id)?.stars||0),0);
  if(stars<p.minStars){log(`Chưa đủ sao (${stars}/${p.minStars}). Chọn lại.`);p.chosen=[];render();return;}
  const s=side('player');p.chosen.forEach(i=>{putGrave('player',s.monsters[i]);s.monsters[i]=null;});
  const id=removeHand(p.index);const slot=monsterSlot(id);if(!s.extra)s.extra=slot;else s.monsters[s.monsters.indexOf(null)]=slot;
  duel.mode=null;duel.pending=null;log(`🌀 Đồng Bộ thành công: ${card(id).name}!`);render();
}
function summonRitual(index){
  const s=side('player'),c=card(s.hand[index]),req=c.ritual_requirement;
  if(!req||!s.hand.includes(req.spellId))return log('Cần bài Phép Nghi Lễ trên tay.');
  const stars=s.monsters.reduce((n,slot)=>n+(slot?card(slot.id)?.stars||0:0),0);
  if(stars<req.minStars)return log(`Cần tổng ít nhất ${req.minStars} sao trên sân để Nghi Lễ.`);
  duel.mode='ritual';duel.pending={index,minStars:req.minStars,spellId:req.spellId,chosen:[]};log(`Chọn quái hiến tế, tổng ít nhất ${req.minStars} sao.`);render();
}
function chooseRitualMaterial(index){
  const p=duel.pending,s=side('player');if(!s.monsters[index])return;
  if(p.chosen.includes(index))p.chosen=p.chosen.filter(i=>i!==index);else p.chosen.push(index);
  const stars=p.chosen.reduce((n,i)=>n+(card(s.monsters[i].id)?.stars||0),0);
  if(stars<p.minStars){log(`Đã chọn ${stars}/${p.minStars} sao.`);render();return;}
  const ritualId=s.hand[p.index];p.chosen.forEach(i=>{putGrave('player',s.monsters[i]);s.monsters[i]=null;});
  s.hand.splice(s.hand.indexOf(p.spellId),1);s.grave.push(p.spellId);s.hand.splice(s.hand.indexOf(ritualId),1);
  const slot=monsterSlot(ritualId);if(!s.extra)s.extra=slot;else s.monsters[s.monsters.indexOf(null)]=slot;
  duel.mode=null;duel.pending=null;log(`🕯️ Nghi Lễ thành công: ${card(ritualId).name}!`);render();
}
function playSpell(index){
  if(!mainPhase())return log('Chỉ dùng Phép trong MAIN 1 hoặc MAIN 2.');
  const s=side('player'),id=s.hand[index],c=card(id);if(!c||c.card_type!=='Spell')return;
  if(c.spell_category==='Nghi Lễ')return log('Chọn quái Nghi Lễ trên tay để dùng bài này.');
  if(c.spell_category==='Trang Bị'){if(!s.monsters.some(Boolean)&&!s.extra)return log('Cần có quái để trang bị.');duel.mode='equip';duel.pending={index};log('Chọn một quái của bạn để trang bị.');render();return;}
  if(c.spell_category==='Môi Trường'){if(s.field)putGrave('player',s.field);s.field={id};removeHand(index);log(`🌍 Môi trường: ${c.name}.`);render();return;}
  if(c.spell_category==='Liên Tục'){const free=s.spells.indexOf(null);if(free<0)return log('Không còn ô Phép/Bẫy trống.');s.spells[free]={id,faceDown:false,setRound:duel.round};removeHand(index);log(`🔗 Kích hoạt ${c.name}.`);render();return;}
  removeHand(index);s.grave.push(id);log(`💚 Kích hoạt ${c.name}.`);effect('player',c);render();
}
function chooseEquip(index,isExtra=false){const s=side('player'),slot=isExtra?s.extra:s.monsters[index];if(!slot)return;const id=removeHand(duel.pending.index),c=card(id);slot.equip=(slot.equip||0)+(c.effect_value||0);s.grave.push(id);duel.mode=null;duel.pending=null;log(`🧿 ${c.name} trang bị, ATK +${c.effect_value}.`);render();}
function setTrap(index){if(!mainPhase())return log('Chỉ úp Bẫy trong MAIN 1 hoặc MAIN 2.');const s=side('player'),free=s.spells.indexOf(null);if(free<0)return log('Không còn ô Phép/Bẫy trống.');const id=removeHand(index);s.spells[free]={id,faceDown:true,setRound:duel.round};log(`🔴 Đã úp một lá Bẫy.`);render();}
function activateTrap(index){
  if(!mainPhase())return log('Chỉ lật Bẫy trong phase chính.');const s=side('player'),slot=s.spells[index],c=card(slot?.id);if(!slot||!c||!slot.faceDown)return;
  if(slot.setRound===duel.round)return log('Bẫy vừa úp phải chờ tới lượt sau.');
  if(['negate_attack','destroy_attacker'].includes(c.effect_code))return log('Bẫy phản đòn sẽ tự kích hoạt khi bị tấn công.');
  slot.faceDown=false;log(`🔴 Kích hoạt Bẫy: ${c.name}.`);
  if(c.effect_code==='continuous_tribe_boost'){render();return;}
  s.spells[index]=null;s.grave.push(c.id);effect('player',c);render();
}
function declareAttack(index,isExtra=false){
  if(!canAct()||duel.phase!=='BATTLE')return log('Chuyển sang phase CHIẾN ĐẤU trước.');
  const slot=isExtra?side('player').extra:side('player').monsters[index];if(!slot||slot.position!=='atk'||slot.attacked)return;
  duel.mode='attack';duel.pending={index,isExtra};
  if(!side('enemy').monsters.some(Boolean)&&!side('enemy').extra){resolveAttack(null,false);return;}
  log(`⚔️ ${card(slot.id).name} sẵn sàng tấn công. Chọn quái đối thủ.`);render();
}
function counterTrap(defender,attackerSide,attackerIndex,attackerExtra){
  const s=side(defender);const trapIndex=s.spells.findIndex(slot=>slot&&slot.faceDown&&slot.setRound<duel.round&&['negate_attack','destroy_attacker'].includes(card(slot.id)?.effect_code));
  if(trapIndex<0)return false;const trap=s.spells[trapIndex],c=card(trap.id);s.spells[trapIndex]=null;s.grave.push(trap.id);
  log(`🚨 ${defender==='player'?'Bạn':'Đối thủ'} lật Bẫy ${c.name}!`);
  if(c.effect_code==='destroy_attacker'){const a=side(attackerSide);const slot=attackerExtra?a.extra:a.monsters[attackerIndex];putGrave(attackerSide,slot);if(attackerExtra)a.extra=null;else a.monsters[attackerIndex]=null;}
  return true;
}
function resolveAttack(targetIndex,targetExtra=false){
  const p=duel.pending;if(!p)return;const attackerSide=duel.turn,defenderSide=other(attackerSide);
  const a=side(attackerSide),d=side(defenderSide);const attacking=p.isExtra?a.extra:a.monsters[p.index];if(!attacking)return;
  const attackerCard=card(attacking.id),atk=effectiveAtk(attackerSide,attacking);
  duel.mode=null;duel.pending=null;attacking.attacked=true;
  if(counterTrap(defenderSide,attackerSide,p.index,p.isExtra)){render();return;}
  const defending=targetExtra?d.extra:targetIndex===null?null:d.monsters[targetIndex];
  if(!defending){d.lp-=atk;log(`💥 ${attackerCard.name} tấn công trực tiếp: ${atk} sát thương!`);}
  else{
    const defCard=card(defending.id);if(defending.position==='def_down'){defending.position='def';log(`🔍 Lật bài úp: ${defCard.name}.`);}
    const destroyDefender=()=>{putGrave(defenderSide,defending);if(targetExtra)d.extra=null;else d.monsters[targetIndex]=null;};
    const destroyAttacker=()=>{putGrave(attackerSide,attacking);if(p.isExtra)a.extra=null;else a.monsters[p.index]=null;};
    if(defending.position==='atk'){
      const defenseAtk=effectiveAtk(defenderSide,defending);
      if(atk>defenseAtk){destroyDefender();d.lp-=atk-defenseAtk;log(`💥 ${attackerCard.name} hạ ${defCard.name}, gây ${atk-defenseAtk} sát thương!`);}
      else if(atk<defenseAtk){destroyAttacker();a.lp-=defenseAtk-atk;log(`🛡️ ${attackerCard.name} thất bại, chịu ${defenseAtk-atk} sát thương!`);}
      else{destroyDefender();destroyAttacker();log('⚖️ Hai quái thú cùng bị phá hủy!');}
    }else{
      if(atk>defCard.def){destroyDefender();log(`💥 ${attackerCard.name} phá thủ ${defCard.name}!`);}
      else if(atk<defCard.def){a.lp-=defCard.def-atk;log(`🛡️ Phòng thủ vững! ${attackerSide==='player'?'Bạn':'Đối thủ'} chịu ${defCard.def-atk} sát thương.`);}
      else log('⚖️ Công và thủ ngang nhau.');
    }
  }
  if(attackerCard.effect_trigger==='on_attack')effect(attackerSide,attackerCard);
  checkWin();render();
}
function nextPhase(){
  if(!canAct())return;
  if(duel.mode){log('Hoàn tất hoặc huỷ thao tác đang chọn trước.');return;}
  if(duel.phase==='MAIN1'){duel.phase='BATTLE';log('⚔️ Bắt đầu phase CHIẾN ĐẤU.');render();return;}
  if(duel.phase==='BATTLE'){duel.phase='MAIN2';log('➡️ MAIN 2: tiếp tục dùng bài.');render();return;}
  endPlayerTurn();
}
function endPlayerTurn(){
  const s=side('player');while(s.hand.length>6){const id=s.hand.pop();s.grave.push(id);log(`🗑️ Bỏ ${card(id)?.name} do quá 6 lá trên tay.`);}
  duel.turn='enemy';duel.phase='MAIN1';duel.round++;duel.selected=null;log('🤖 Đến lượt đối thủ...');render();aiTimer=setTimeout(aiTurn,650);
}
function aiTurn(){
  if(!duel||duel.finished||duel.turn!=='enemy')return;
  const s=side('enemy');if(!draw('enemy'))return;
  log('🤖 Đối thủ rút một lá.');
  // Use a useful spell before summoning.
  for(const id of [...s.hand]){
    const c=card(id);if(c?.card_type!=='Spell'||c.spell_category==='Nghi Lễ')continue;
    if(c.spell_category==='Trang Bị'&&!s.monsters.some(Boolean))continue;
    if(c.spell_category==='Liên Tục'&&s.spells.indexOf(null)<0)continue;
    if(c.spell_category==='Môi Trường'&&s.field)continue;
    if(c.effect_code==='destroy_all_opponent_monsters'&&!side('player').monsters.some(Boolean)&&!side('player').extra)continue;
    s.hand.splice(s.hand.indexOf(id),1);
    if(c.spell_category==='Môi Trường')s.field={id};
    else if(c.spell_category==='Liên Tục')s.spells[s.spells.indexOf(null)]={id,faceDown:false,setRound:duel.round};
    else if(c.spell_category==='Trang Bị'){const target=s.monsters.find(Boolean)||s.extra;target.equip=(target.equip||0)+(c.effect_value||0);s.grave.push(id);}
    else{s.grave.push(id);effect('enemy',c);}
    log(`🤖 Đối thủ dùng ${c.name}.`);if(duel.finished)return;
    break;
  }
  // Summon strongest affordable normal monster.
  const candidates=s.hand.map((id,index)=>({id,index,c:card(id)})).filter(x=>x.c?.card_type==='Monster'&&!['Đồng Bộ','Nghi Lễ'].includes(x.c.monster_category));
  candidates.sort((a,b)=>b.c.atk-a.c.atk);
  for(const x of candidates){const need=x.c.stars>=7?2:x.c.stars>=5?1:0;const occupied=s.monsters.map((slot,i)=>slot?i:-1).filter(i=>i>=0);if(occupied.length<need)continue;
    for(const i of occupied.sort((a,b)=>effectiveAtk('enemy',s.monsters[a])-effectiveAtk('enemy',s.monsters[b])).slice(0,need)){putGrave('enemy',s.monsters[i]);s.monsters[i]=null;}
    const free=s.monsters.indexOf(null);if(free<0)continue;s.monsters[free]=monsterSlot(x.id,'atk');s.hand.splice(s.hand.indexOf(x.id),1);log(`🤖 Đối thủ triệu hồi ${x.c.name}!`);if(x.c.effect_trigger==='on_summon')effect('enemy',x.c);break;
  }
  // Set one trap.
  const trap=s.hand.find(id=>card(id)?.card_type==='Trap');const freeSpell=s.spells.indexOf(null);
  if(trap&&freeSpell>=0){s.hand.splice(s.hand.indexOf(trap),1);s.spells[freeSpell]={id:trap,faceDown:true,setRound:duel.round};log('🤖 Đối thủ úp một lá Bẫy.');}
  if(duel.finished)return;
  duel.phase='BATTLE';render();
  aiTimer=setTimeout(()=>{
    if(!duel||duel.finished)return;
    for(let i=0;i<3;i++){if(!s.monsters[i]||s.monsters[i].position!=='atk')continue;aiAttack(i,false);if(duel.finished)return;}
    if(s.extra){aiAttack(-1,true);if(duel.finished)return;}
    duel.turn='player';duel.phase='MAIN1';duel.round++;duel.normalSummoned=false;duel.player.monsters.forEach(slot=>{if(slot)slot.attacked=false;});if(duel.player.extra)duel.player.extra.attacked=false;
    if(!draw('player'))return;log(`🟢 Lượt ${duel.round}: bạn rút một lá.`);render();
  },650);
}
function aiAttack(index,isExtra){
  const attacking=isExtra?side('enemy').extra:side('enemy').monsters[index];if(!attacking)return;
  const defender=side('player');const targets=defender.monsters.map((slot,i)=>slot?i:-1).filter(i=>i>=0);
  if(defender.extra)targets.push('extra');
  let target=null;
  if(targets.length){
    const beatable=targets.filter(i=>{const slot=i==='extra'?defender.extra:defender.monsters[i];return attacking&&effectiveAtk('enemy',attacking)>(slot.position==='atk'?effectiveAtk('player',slot):card(slot.id)?.def||0);});
    if(!beatable.length)return;
    target=beatable[0];
  }
  duel.pending={index,isExtra};resolveAttack(target==='extra'?null:target,target==='extra');
}
function handleZone(name,type,index){
  if(!duel||duel.finished)return;const s=side(name);const slot=type==='extra'?s.extra:type==='field'?s.field:type==='monster'?s.monsters[index]:s.spells[index];
  if(name==='player'&&duel.mode==='tribute'&&type==='monster')return chooseTribute(index);
  if(name==='player'&&duel.mode==='extra'&&type==='monster')return chooseExtraMaterial(index);
  if(name==='player'&&duel.mode==='ritual'&&type==='monster')return chooseRitualMaterial(index);
  if(name==='player'&&duel.mode==='equip'&&(type==='monster'||type==='extra'))return chooseEquip(index,type==='extra');
  if(name==='enemy'&&duel.mode==='attack'&&(type==='monster'||type==='extra')&&slot)return resolveAttack(type==='extra'?null:index,type==='extra');
  if(slot)select({name,type,index});
}
function addAction(host,label,fn,secondary=false){const b=document.createElement('button');b.className=secondary?'secondary-btn':'primary-btn';b.textContent=label;b.addEventListener('click',fn);host.appendChild(b);}
function renderInspector(){
  const host=$('cardInspector'),sel=duel.selected;if(!sel){host.innerHTML='<div class="inspector-empty">🃏<span>Chọn một lá bài để xem ảnh, hiệu ứng và thao tác.</span></div>';return;}
  const s=side(sel.name);let id=sel.type==='hand'?s.hand[sel.index]:sel.type==='extra'?s.extra?.id:sel.type==='field'?s.field?.id:sel.type==='monster'?s.monsters[sel.index]?.id:s.spells[sel.index]?.id;
  const c=card(id);if(!c){duel.selected=null;renderInspector();return;}
  const slot=sel.type==='extra'?s.extra:sel.type==='monster'?s.monsters[sel.index]:sel.type==='spell'?s.spells[sel.index]:null;
  if(sel.name==='enemy'&&(slot?.faceDown||slot?.position==='def_down')){host.innerHTML='<div class="inspector-empty">🂠<span>Bài đối thủ đang úp. Nội dung được giữ bí mật.</span></div>';return;}
  const info=imageInfo(id),kind=c.card_type==='Monster'?`Quái thú · ${esc(c.monster_category)} · ${'★'.repeat(c.stars||0)}`:c.card_type==='Spell'?`Bài Phép · ${esc(c.spell_category)}`:`Bài Bẫy · ${esc(c.trap_category)}`;
  host.innerHTML=`${artHTML(id,'inspect-art-wrap')}<h3 class="inspect-name">${esc(c.name)}</h3><div class="inspect-meta">${kind}</div>${c.card_type==='Monster'?`<div class="inspect-stats">⚔️ ATK ${effectiveAtk(sel.name,slot||{id})} · 🛡️ DEF ${c.def}</div>`:''}<p class="inspect-description">${esc(c.description)}</p>${info?`<a class="inspect-source" href="${esc(info.source)}" target="_blank" rel="noopener">Ảnh: ${esc(info.creator)} · ${esc(info.license.toUpperCase())}</a>`:''}<div class="inspect-actions" id="inspectActions"></div>`;
  const wrap=host.querySelector('.inspect-art-wrap');wrap.style.background=`linear-gradient(145deg,${c.art?.c1||'#42616e'},${c.art?.c2||'#1a2938'})`;wrap.innerHTML=`<span>${esc(c.art?.emoji||'🃏')}</span>${art(id)?`<img src="${esc(art(id))}" alt="${esc(c.name)}" referrerpolicy="no-referrer" onerror="this.remove()">`:''}`;
  const actions=$('inspectActions');if(!canAct()||sel.name!=='player')return;
  if(sel.type==='hand'&&mainPhase()){
    if(c.card_type==='Monster'){
      if(c.monster_category==='Đồng Bộ')addAction(actions,'🌀 Đồng Bộ',()=>summon(sel.index,'atk'));
      else if(c.monster_category==='Nghi Lễ')addAction(actions,'🕯️ Nghi Lễ',()=>summon(sel.index,'atk'));
      else{addAction(actions,'⚔️ Triệu hồi thế công',()=>summon(sel.index,'atk'));addAction(actions,'🛡️ Úp thế thủ',()=>summon(sel.index,'def_down'),true);}
    }else if(c.card_type==='Spell')addAction(actions,'💚 Kích hoạt Phép',()=>playSpell(sel.index));
    else addAction(actions,'🔴 Úp Bẫy',()=>setTrap(sel.index));
  }
  if((sel.type==='monster'||sel.type==='extra')&&slot){
    if(duel.phase==='BATTLE'&&slot.position==='atk'&&!slot.attacked)addAction(actions,'⚔️ Tấn công',()=>declareAttack(sel.index,sel.type==='extra'));
    if(mainPhase()&&slot.summonedRound<duel.round){addAction(actions,slot.position==='atk'?'🛡️ Đổi thế thủ':'⚔️ Đổi thế công',()=>{slot.position=slot.position==='atk'?'def':'atk';log(`🔄 ${c.name} đổi tư thế.`);render();},true);}
  }
  if(sel.type==='spell'&&slot?.faceDown)addAction(actions,'🔴 Lật Bẫy',()=>activateTrap(sel.index));
}
function renderZones(name,type,hostId){
  const host=$(hostId),s=side(name);host.innerHTML='';const slots=type==='monster'?s.monsters:s.spells;
  slots.forEach((slot,index)=>{
    const b=document.createElement('button');const c=card(slot?.id),hidden=name==='enemy'&&(slot?.faceDown||slot?.position==='def_down');
    b.className=`field-slot ${slot?'occupied':''} ${c?.card_type==='Spell'?'spell-card':''} ${c?.card_type==='Trap'?'trap-card':''} ${hidden?'face-down':''} ${slot?.position==='def'||slot?.position==='def_down'?'defense':''} ${slot?.attacked?'exhausted':''} ${duel.selected?.name===name&&duel.selected?.type===type&&duel.selected?.index===index?'selected':''}`;
    if(!slot)b.innerHTML=type==='monster'?'✧':'◇';
    else if(hidden)b.innerHTML='<span class="slot-emoji">🂠</span>';
    else b.innerHTML=`${artHTML(slot.id,'zone-art')}<span class="slot-label">${esc(c.name)}</span>${type==='monster'?`<span class="slot-stats">${slot.position==='atk'?'⚔'+effectiveAtk(name,slot):'🛡'+c.def}</span>`:''}`;
    b.title=hidden?'Bài úp':slot?`${c.name} · ${c.description}`:'Ô trống';b.addEventListener('click',()=>handleZone(name,type,index));host.appendChild(b);
  });
}
function renderSpecial(name,type,hostId){
  const host=$(hostId),slot=type==='field'?side(name).field:side(name).extra,c=card(slot?.id);
  host.classList.toggle('has-card',!!slot);host.innerHTML=slot?`${artHTML(slot.id,'special-art')}<small>${esc(c.name)}</small>`:`${type==='field'?'🌍':'✦'}<small>${type==='field'?'Môi trường':'Extra'}</small>`;
  host.onclick=()=>handleZone(name,type,-1);
}
function renderHand(){
  const host=$('hand');host.innerHTML='';side('player').hand.forEach((id,index)=>{
    const c=card(id);if(!c)return;const b=document.createElement('button');b.className=`card ${c.card_type}${duel.selected?.type==='hand'&&duel.selected.index===index?' selected':''}`;
    b.innerHTML=`<span class="card-name">${esc(c.name)}</span>${c.card_type==='Monster'?`<span class="stars">${'★'.repeat(c.stars||0)}</span>`:''}<span class="card-art">${artHTML(id,'hand-art')}</span><span class="card-stats">${c.card_type==='Monster'?`ATK ${c.atk} / DEF ${c.def}`:esc(c.spell_category||c.trap_category)}</span>`;
    b.title=c.description;b.addEventListener('click',()=>{if(duel.mode)return;select({name:'player',type:'hand',index});});host.appendChild(b);
  });
}
function render(){
  if(!duel)return;const p=side('player'),e=side('enemy');
  $('playerLife').textContent=`${Math.max(0,p.lp)} LP`;$('enemyLife').textContent=`${Math.max(0,e.lp)} LP`;
  $('playerLifeBar').style.width=`${Math.max(0,Math.min(100,p.lp/40))}%`;$('enemyLifeBar').style.width=`${Math.max(0,Math.min(100,e.lp/40))}%`;
  $('playerDeck').textContent=p.deck.length;$('enemyDeck').textContent=e.deck.length;$('playerGY').textContent=p.grave.length;$('enemyGY').textContent=e.grave.length;
  $('handCount').textContent=p.hand.length;$('summonStatus').textContent=duel.normalSummoned?'Đã triệu hồi thường':'Có thể triệu hồi thường';
  const phase=duel.turn==='player'?PHASE_NAME[duel.phase]:'LƯỢT ĐỐI THỦ';$('turnBanner').textContent=`Lượt ${duel.round} · ${phase}`;$('phaseLabel').textContent=phase;
  $('phaseTrack').innerHTML=PHASES.map(p=>`<span class="${duel.phase===p&&duel.turn==='player'?'active':''}">${PHASE_NAME[p]}</span>`).join('');
  $('nextPhaseBtn').textContent=duel.phase==='MAIN1'?'⚔️ Sang chiến đấu ➜':duel.phase==='BATTLE'?'➡️ Sang MAIN 2':'⏭️ Kết thúc lượt';
  $('nextPhaseBtn').disabled=duel.turn!=='player'||duel.finished;$('cancelModeBtn').classList.toggle('hidden',!duel.mode);
  $('battleLog').innerHTML=duel.logs.map(line=>`<div class="log-line">${esc(line)}</div>`).join('');
  $('opponentHand').innerHTML=e.hand.map(()=>'<span title="Bài trên tay đối thủ"></span>').join('');
  renderZones('enemy','spell','enemySpells');renderZones('enemy','monster','enemyMonsters');renderZones('player','monster','playerMonsters');renderZones('player','spell','playerSpells');
  renderSpecial('enemy','field','enemyFieldSpell');renderSpecial('enemy','extra','enemyExtra');renderSpecial('player','field','playerFieldSpell');renderSpecial('player','extra','playerExtra');
  renderHand();renderInspector();
}
function showRules(){showModal('<h2>Luật Đấu Trường Meme Xóm</h2><ul><li>Mỗi bên bắt đầu với <b>4000 LP</b>, bộ bài 20–30 lá và 4 lá trên tay.</li><li>Vòng lượt: <b>MAIN 1 → CHIẾN ĐẤU → MAIN 2</b>. Từ lượt 2, mỗi lượt tự rút 1 lá.</li><li>Mỗi lượt triệu hồi thường hoặc úp 1 quái. Quái 5–6 sao cần 1 hiến tế; từ 7 sao cần 2.</li><li>Sân có 3 ô quái, 3 ô Phép/Bẫy, ô Môi trường và ô Extra.</li><li>Phép có thể kích hoạt trong phase chính. Bẫy cần úp từ lượt trước; Bẫy phản đòn tự lật khi bị tấn công.</li><li>Chọn quái thế công rồi bấm Tấn công và chọn mục tiêu. Đánh vào thế thủ dùng DEF; khi đối thủ trống sân sẽ tấn công trực tiếp.</li></ul>');}
function openDeckBuilder(){deckFilter='All';renderDeckBuilder();}
function renderDeckBuilder(){
  const count=deckList.length;showModal(`<h2>🃏 Bộ bài Meme Xóm</h2><div class="deck-summary">${count}/30 lá · tối thiểu 20 lá để đấu</div><div class="deck-filters" id="deckFilters"></div><div class="deck-builder"><div class="deck-grid" id="deckGrid"></div></div><div class="deck-controls"><button class="secondary-btn" id="quickDeck">Bộ bài mẫu</button><button class="secondary-btn" id="imageSources">Nguồn ảnh</button><button class="primary-btn" id="saveDeck">Lưu bộ bài</button></div>`,true);
  for(const [value,label] of [['All','Tất cả'],['Monster','Quái'],['Spell','Phép'],['Trap','Bẫy']]){const b=document.createElement('button');b.textContent=label;b.className=deckFilter===value?'active':'';b.addEventListener('click',()=>{deckFilter=value;renderDeckBuilder();});$('deckFilters').appendChild(b);}
  for(const c of CARDS.filter(c=>deckFilter==='All'||c.card_type===deckFilter)){
    const item=document.createElement('div');item.className='deck-item';const n=deckList.filter(id=>id===c.id).length;
    item.innerHTML=`${artHTML(c.id,'deck-art')}<b>${esc(c.name)}</b><small>${esc(c.card_type)} · ${c.card_type==='Monster'?`ATK ${c.atk}`:esc(c.spell_category||c.trap_category)}</small><div class="deck-item-actions"><button class="secondary-btn" data-action="minus">−</button><span class="count">${n}/3</span><button class="secondary-btn" data-action="plus">+</button></div>`;
    item.querySelector('[data-action="minus"]').addEventListener('click',()=>{const i=deckList.indexOf(c.id);if(i>=0){deckList.splice(i,1);renderDeckBuilder();}});
    item.querySelector('[data-action="plus"]').addEventListener('click',()=>{const limit=c.id==='trung_tang_bat_ngo'?1:3;if(deckList.length>=30||n>=limit)return;deckList.push(c.id);renderDeckBuilder();});$('deckGrid').appendChild(item);
  }
  $('quickDeck').addEventListener('click',()=>{deckList=defaultDeck();renderDeckBuilder();});
  $('imageSources').addEventListener('click',showCredits);
  $('saveDeck').addEventListener('click',()=>{if(deckList.length<20){$('modalContent').querySelector('.deck-summary').textContent=`${deckList.length}/30 lá · cần ít nhất 20 lá`;return;}saveDeck();closeModal();});
}
function showCredits(){const links=Object.entries(window.MEME_IMAGE_LINKS||{});showModal(`<h2>Nguồn ảnh lá bài</h2><p>Ảnh được tải bằng liên kết từ Openverse khi bạn mở game. Các ảnh đã chọn mang giấy phép CC0; chọn tên lá để xem nguồn gốc.</p><ol class="source-list">${links.map(([id,info])=>`<li>${esc(card(id)?.name||id)} — <a href="${esc(info.source)}" target="_blank" rel="noopener">${esc(info.title)}</a> (${esc(info.creator)})</li>`).join('')}</ol>`,true);}
document.querySelectorAll('[data-hero]').forEach(button=>button.addEventListener('click',()=>{chosenHero=Number(button.dataset.hero);document.querySelectorAll('.hero-tag').forEach(tag=>tag.classList.remove('selected'));button.classList.add('selected');}));
document.querySelectorAll('[data-modal]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.modal==='Bộ bài')openDeckBuilder();else showModal(`<h2>${esc(button.dataset.modal)}</h2><p>Tính năng này sẽ mở ở phiên bản tiếp theo. Hãy thử Đấu Trường Meme Xóm trước nhé!</p>`);}));
$('playBtn').addEventListener('click',()=>{if(deckList.length<20)return openDeckBuilder();startGame();});$('helpBtn').addEventListener('click',showRules);$('rulesBtn').addEventListener('click',showRules);
$('closeModal').addEventListener('click',closeModal);$('modal').addEventListener('click',event=>{if(event.target===$('modal'))closeModal();});
$('backBtn').addEventListener('click',()=>{clearTimeout(aiTimer);$('duel').classList.add('hidden');$('lobby').classList.remove('hidden');closeModal();duel=null;window.scrollTo(0,0);});
$('nextPhaseBtn').addEventListener('click',nextPhase);$('cancelModeBtn').addEventListener('click',clearMode);
