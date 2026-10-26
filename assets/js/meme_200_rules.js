// Explicit handlers for the 13 strategy families in the supplied 200-card workbook.
// Cell text is display data; every action below is code, never evaluated text.
(() => {
  const base=window.memeRules, families=new Set(CARDS.map(c=>c.family));
  const queue=[];let busy=0,flushing=false,choiceCancel=null,auto=false,depth=0;
  const E=name=>base.entries(name), low=c=>c&&['N','R'].includes(c.rarity), normal=c=>c?.rarity==='N'&&c.card_type==='Monster';
  const enabled=slot=>slot&&slot.position!=='def_down'&&!slot.faceDown&&!slot.effectsNegated&&(slot.negatedUntil??-1)<duel.round;
  const rareRank=c=>({N:0,R:1,SR:2,UR:3}[c?.rarity]??0);
  function S(name){const s=side(name);s.banished??=[];s.uses??={};s.materialHistory??=[];s.spellCount??={};s.milled??={};return s;}
  function used(name,c,key='main'){return S(name).uses[c.id+':'+key]===duel.round;}
  function mark(name,c,key='main'){S(name).uses[c.id+':'+key]=duel.round;}
  function activeSources(name,family){return [...E(name).map(e=>e.slot),...S(name).spells].filter(s=>enabled(s)&&card(s.id)?.family===family&&[1,7,10].includes(card(s.id).role_index));}
  function sameHand(name,c,exclude=[]){return S(name).hand.map((id,index)=>({id,index})).filter(e=>!exclude.includes(e.index)&&card(e.id)?.tribe===c.tribe);}
  function ownsN(name){return E(name).some(e=>normal(card(e.slot.id)));}
  function skillDrawBlocked(name){return S(name).drawLockRound===duel.round;}
  function drawEffect(name,n=1){if(skillDrawBlocked(name)){log('⛔ Không thể rút thêm bằng hiệu ứng trong lượt này.');return 0;}let count=0;while(count<n&&!duel.finished){if(!draw(name))break;count++;}return count;}
  function emit(name,c,targets=[],text=''){
    duel.effectSerial=(duel.effectSerial||0)+1;duel.lastEffect={serial:duel.effectSerial,owner:name,cardId:c.id,targets:targets.map(e=>({name:e.name||other(name),type:e.type||(e.extra?'extra':'monster'),index:e.index})),text};
    log(`✦ ${c.name}${text?': '+text:': kích hoạt hiệu ứng.'}`);
  }
  function ensureUid(slot){slot.uid??='xa-'+((duel.uidSeq=(duel.uidSeq||0)+1));return slot.uid;}
  function findSlot(name,slot){return E(name).find(e=>e.slot===slot);}
  function fieldOptions(name,predicate=()=>true){return E(name).filter(e=>predicate(e.slot,card(e.slot.id))).map(e=>({...e,id:e.slot.id,name,type:e.extra?'extra':'monster'}));}
  function candidates(ids){return ids.map((id,index)=>({id,index}));}
  async function choose(name,title,options,{optional=false,pick='strong',text=''}={}){
    if(!options.length||duel?.finished)return null;
    if(name!=='player'||auto){
      const sorted=[...options].sort((a,b)=>pick==='cheap'?(rareRank(card(a.id))-rareRank(card(b.id))||(card(a.id)?.atk||0)-(card(b.id)?.atk||0)):(card(b.id)?.atk||0)-(card(a.id)?.atk||0));return sorted[0];
    }
    return new Promise(resolve=>{
      let done=false;const finish=value=>{if(done)return;done=true;choiceCancel=null;closeModal();resolve(value);};choiceCancel=()=>finish(null);
      showModal(`<h2>${esc(title)}</h2><p>${esc(text||'Chọn một lá để tiếp tục.')}</p><div class="arcana-choice-list" id="arcanaOptions"></div><div class="arcana-choice-actions">${optional?'<button class="secondary-btn" id="arcanaSkip">Bỏ qua</button>':''}<button class="secondary-btn" id="arcanaAuto">Chọn gợi ý</button></div>`);
      $('modal').querySelector('.modal-card').classList.add('arcana-choice');
      options.forEach((option,i)=>{const c=card(option.id),hidden=option.hidden;const b=document.createElement('button');b.className='arcana-option';b.dataset.choice=String(i);b.innerHTML=`${hidden?'<span class="pile-art">🂠</span>':artHTML(option.id,'pile-art')}<span><b>${esc(hidden?'Bài úp':option.label||c?.name||option.id)}</b><small>${hidden?'Nội dung đang được giữ kín':`${c?.id||''} · ${c?.rarity||''} ${c?.card_type==='Monster'?`· ★${c.stars} · ${c.atk}/${c.def}`:''}`}</small></span>`;b.onclick=()=>finish(option);$('arcanaOptions').appendChild(b);});
      if($('arcanaSkip'))$('arcanaSkip').onclick=()=>finish(null);
      $('arcanaAuto').onclick=()=>finish(options[pick==='cheap'?options.reduce((best,e,i)=>rareRank(card(e.id))<rareRank(card(options[best].id))?i:best,0):0]);
    });
  }
  async function yes(name,title){if(name!=='player'||auto)return true;return !!(await choose(name,title,[{id:S(name).hand[0]||CARDS[0].id,label:'Đồng ý'}],{optional:true,text:'Đây là phần hiệu ứng tùy chọn.'}));}
  async function flush(){if(flushing)return;flushing=true;try{let count=0;while(queue.length&&duel&&!duel.finished&&count++<100)await queue.shift()();if(count>=100){queue.length=0;log('Đã dừng chuỗi hiệu ứng lặp.');}}finally{flushing=false;}}
  async function run(action){if(busy)return false;const match=duel;busy++;try{const value=await action();await flush();if(duel===match&&!duel.finished)checkWin();return value;}finally{busy--;if(duel===match)render();}}
  function specialAllowed(name,c){const s=S(name);return !(s.specialLock?.round===duel.round&&s.specialLock.tribe!==c.tribe);}
  function canRevive(name,id){return card(id)?.card_type==='Monster'&&!card(id).is_boss&&specialAllowed(name,card(id))&&S(name).monsters.includes(null);}
  function reviveNow(name,id,flags={}){
    const s=S(name),i=s.grave.indexOf(id),free=s.monsters.indexOf(null);if(i<0||free<0||!canRevive(name,id))return null;
    s.grave.splice(i,1);const slot={...monsterSlot(id,'def'),...flags};ensureUid(slot);s.monsters[free]=slot;log(`♻ Hồi sinh ${card(id).name} ở thế thủ.`);queue.push(()=>onSummon(name,slot,'special','grave'));return slot;
  }
  function weakestCost(name,c,spellOnly=false){return sameHand(name,c).filter(e=>!spellOnly||card(e.id)?.card_type==='Spell').sort((a,b)=>rareRank(card(a.id))-rareRank(card(b.id))||(card(a.id)?.atk||0)-(card(b.id)?.atk||0))[0];}
  function negateSlot(slot){if(slot)slot.negatedUntil=duel.round;}
  function findTrap(name,role,family,predicate=()=>true){
    const s=S(name);let found=s.spells.map((slot,index)=>({slot,index,c:card(slot?.id),zone:'spell'})).find(e=>e.slot?.faceDown&&e.slot.setRound<duel.round&&e.c?.role_index===role&&(!family||e.c.family===family)&&!used(name,e.c)&&predicate(e));
    if(!found&&s.handTrapRound!==duel.round&&E(name).some(e=>enabled(e.slot)&&card(e.slot.id)?.is_boss&&card(e.slot.id).family==='ambush'))found=s.hand.map((id,index)=>({slot:{id},index,c:card(id),zone:'hand'})).find(e=>e.c?.card_type==='Trap'&&e.c.role_index===role&&(!family||e.c.family===family)&&!used(name,e.c)&&E(name).some(b=>enabled(b.slot)&&card(b.slot.id)?.is_boss&&card(b.slot.id).family==='ambush'&&card(b.slot.id).archetype===e.c.archetype)&&predicate(e));
    return found;
  }
  function consumeTrap(name,entry){
    const s=S(name);if(entry.zone==='hand'){s.hand.splice(entry.index,1);s.handTrapRound=duel.round;}else s.spells[entry.index]=null;
    if(entry.slot.banishOnLeave)s.banished.push(entry.c.id);else s.grave.push(entry.c.id);mark(name,entry.c);emit(name,entry.c);
    for(const slot of activeSources(name,'ambush'))slot.ambushAtk=Math.min(600,(slot.ambushAtk||0)+300);
    if(entry.c.role_index===8&&ownsN(name))base.heal(name,400);
  }
  function suppressTargets(name,c){const foe=other(name);return [...fieldOptions(foe,s=>s.position!=='def_down'),...S(foe).spells.map((slot,index)=>({slot,index,id:slot?.id,name:foe,type:'spell'})).filter(e=>e.slot&&!e.slot.faceDown),...(S(foe).field?[{slot:S(foe).field,id:S(foe).field.id,index:-1,name:foe,type:'field'}]:[])];}
  function leave(name,entry,reason='effect',context={}){
    if(!entry?.slot)return false;const s=S(name),slot=entry.slot,c=card(slot.id),by=context.by||other(name);
    if(reason==='battle'&&slot.protectRound===duel.round){log(`🛡 ${c.name} được bảo vệ khỏi phá hủy chiến đấu.`);return false;}
    if(['battle','effect'].includes(reason)&&c.is_boss){const guard=findTrap(name,8,'mark');const cost=guard&&weakestCost(name,guard.c);if(guard&&cost){s.hand.splice(cost.index,1);s.grave.push(cost.id);consumeTrap(name,guard);log(`🛡 Gửi ${card(cost.id).name} để bảo vệ Boss.`);return false;}}
    if(entry.extra)s.extra=null;else s.monsters[entry.index]=null;
    if(!slot.token)(slot.banishOnLeave?s.banished:s.grave).push(slot.id);
    if(context.materialTarget&&c.role_index===1&&card(context.materialTarget)?.tribe===c.tribe&&!used(name,c,'material')){mark(name,c,'material');base.heal(name,300);log(`💚 Nguyên liệu ${c.name}: hồi 300 LP.`);}
    for(let i=0;i<s.spells.length;i++){const e=s.spells[i];if(e?.equippedTo&&e.equippedTo===slot.uid)removeSpell(name,i,'destroy');}
    if(c.is_boss){const id=s.grave.find(id=>normal(card(id))&&card(id).tribe===c.tribe&&canRevive(name,id));if(id&&!used(name,c,'leave')){mark(name,c,'leave');reviveNow(name,id);}}
    if(['battle','effect'].includes(reason)&&by!==name){
      const trap=reason==='effect'&&findTrap(name,9,null,e=>e.c.tribe===c.tribe);if(trap){consumeTrap(name,trap);const foe=suppressTargets(name,trap.c).sort((a,b)=>(card(b.id)?.atk||0)-(card(a.id)?.atk||0))[0];if(foe)negateSlot(foe.slot);const id=s.grave.find(id=>normal(card(id))&&card(id).tribe===trap.c.tribe&&canRevive(name,id));if(id)reviveNow(name,id,{effectsNegated:true});}
      const replacement=findTrap(name,8,'swarm');if(replacement&&low(c)){consumeTrap(name,replacement);const id=s.grave.find(id=>normal(card(id))&&card(id).name!==c.name&&canRevive(name,id));if(id)reviveNow(name,id,{effectsNegated:true});}
      const extraTrap=findTrap(name,8,'extra');if(extraTrap&&slot.summonFromExtra){consumeTrap(name,extraTrap);const id=s.grave.find(id=>low(card(id))&&s.materialHistory.includes(id)&&canRevive(name,id));if(id)reviveNow(name,id);}
    }
    if(reason==='battle'){const burn=findTrap(by,8,'power');if(burn){consumeTrap(by,burn);base.damage(name,500);}}
    return true;
  }
  function removeSpell(name,index,reason='effect'){
    const s=S(name),slot=index===-1?s.field:s.spells[index];if(!slot)return;const c=card(slot.id);if(index===-1)s.field=null;else s.spells[index]=null;(slot.banishOnLeave?s.banished:s.grave).push(slot.id);
    if(slot.equippedTo){const owner=E(name).find(e=>e.slot.uid===slot.equippedTo);if(owner)owner.slot.equipCount=Math.max(0,(owner.slot.equipCount||0)-1);}
    if(slot.equippedTo)queue.push(async()=>{if(drawEffect(name,1)){const x=await choose(name,'Trang bị rời sân: bỏ 1 lá',candidates(S(name).hand),{pick:'cheap'});if(x){S(name).hand.splice(x.index,1);S(name).grave.push(x.id);}}});
    if(reason==='destroy'&&c.card_type==='Trap'){const trap=findTrap(name,8,'ambush');if(trap){const id=s.grave.find(id=>card(id)?.card_type==='Trap'&&card(id).name!==c.name&&card(id).name!==trap.c.name);if(id){consumeTrap(name,trap);const free=s.spells.indexOf(null);if(free>=0){s.grave.splice(s.grave.indexOf(id),1);s.spells[free]={id,faceDown:true,setRound:duel.round,banishOnLeave:true};}}}}
  }
  function stat(name,slot,kind='atk'){
    let value=base.stat(name,slot,kind),c=card(slot?.id);if(!slot||!c)return value;
    value+=kind==='atk'?(slot.bonusAtk||0)+(slot.ambushAtk||0)+(slot.millAtk||0)+(slot.damageStepAtk||0)-500*(slot.marks||0):(slot.bonusDef||0)+(slot.tempDefRound===duel.round?slot.tempDef||0:0);
    if(slot.position!=='def_down')for(const source of [...E(name).map(e=>e.slot),...S(name).spells]){
      if(!enabled(source))continue;const p=card(source.id);if(!p||![1,7,10].includes(p.role_index))continue;
      if(p.family==='swarm'&&low(c))value+=300;
      if(p.family==='defense'&&kind==='def'&&slot.position==='def'&&(source===slot||p.role_index===7&&p.tribe===c.tribe))value+=Math.min(1500,E(name).filter(e=>low(card(e.slot.id))).length*500);
      if(p.family==='ambush'&&kind==='def'&&S(name).spells.some(t=>t?.faceDown&&card(t.id)?.card_type==='Trap')&&(source===slot||p.role_index===7&&p.tribe===c.tribe))value+=500;
      if(p.family==='equip'&&slot.equipCount>0&&(source===slot||p.role_index===7&&p.tribe===c.tribe)){if(kind==='atk')value+=600;else if(low(c))value+=300;}
    }
    if(enabled(slot)&&c.is_boss&&c.family==='equip'&&kind==='atk')value+=350*Math.min(3,slot.equipCount||0);
    return Math.max(0,value);
  }
  function damage(name,amount){
    const s=S(name),potential=Math.max(0,amount-(s.shield||0));const trap=potential>0&&s.lp-potential<2000?findTrap(name,8,'comeback'):null;
    if(trap){consumeTrap(name,trap);const id=s.grave.find(id=>normal(card(id))&&canRevive(name,id));if(id)reviveNow(name,id);log('🛡 Vô hiệu sát thương làm LP xuống dưới 2000.');return 0;}
    return base.damage(name,amount);
  }
  function sendTop(name,n,by=name){
    const s=S(name),sent=s.deck.splice(0,n);s.grave.push(...sent);s.milled[duel.round]=(s.milled[duel.round]||0)+sent.length;
    if(s.milled[duel.round]>=2)for(const e of E(other(name))){const c=card(e.slot.id);if(enabled(e.slot)&&c?.is_boss&&c.family==='mill'&&e.slot.millBuffRound!==duel.round){e.slot.millBuffRound=duel.round;e.slot.millAtk=Math.min(900,(e.slot.millAtk||0)+300);}}
    log(`🪦 ${name==='player'?'Bạn':'Đối thủ'} gửi ${sent.length} lá đầu Deck xuống Mộ.`);return sent;
  }
  function buff(slot,atk=0,def=0){if(atk){slot.tempAtk=(slot.tempRound===duel.round?slot.tempAtk||0:0)+atk;slot.tempRound=duel.round;}if(def){slot.tempDef=(slot.tempDefRound===duel.round?slot.tempDef||0:0)+def;slot.tempDefRound=duel.round;}}
  async function ownTarget(name,title,predicate=()=>true,optional=false){return choose(name,title,fieldOptions(name,(s,c)=>s.position!=='def_down'&&predicate(s,c)),{optional});}
  async function passiveAction(name,c,slot){
    const s=S(name),family=c.family;
    if(family==='coin'){
      const heads=Math.random()<.5;duel.randomSerial=(duel.randomSerial||0)+1;duel.lastRandom={serial:duel.randomSerial,value:heads?'NGỬA':'SẤP',owner:name};log(`🪙 ${c.name}: ${heads?'NGỬA → rút 1':'SẤP → gửi 1 lá, tăng 400 ATK'}.`);
      if(heads)drawEffect(name,1);else{sendTop(name,1);const t=await ownTarget(name,'Chọn quái N/R nhận 400 ATK',(_,x)=>low(x));if(t){t.slot.bonusAtk=(t.slot.bonusAtk||0)+400;}}
    }else if(family==='mark'){
      const t=await choose(name,'Đặt dấu ấn: quái đối thủ −500 ATK',fieldOptions(other(name)).map(e=>({...e,hidden:e.slot.position==='def_down'})));if(t)t.slot.marks=(t.slot.marks||0)+1;
    }else if(family==='stance'){
      const t=await choose(name,'Đổi tư thế một quái',[...fieldOptions(name),...fieldOptions(other(name))].map(e=>({...e,hidden:e.name!==name&&e.slot.position==='def_down'})));if(t){t.slot.position=t.slot.position==='atk'?'def':'atk';if(low(card(t.id)))buff(t.slot,500);}
    }else if(family==='grave'){
      const t=await choose(name,'Gửi 1 lá cùng tộc từ Deck xuống Mộ',candidates(s.deck).filter(e=>card(e.id).tribe===c.tribe));if(t){s.deck.splice(t.index,1);s.grave.push(t.id);if(slot?.position)slot.noAttackRound=duel.round;}
    }else if(family==='mill'){
      const sent=sendTop(other(name),2,name);if(sent.some(id=>card(id).card_type==='Spell'))drawEffect(other(name),1);
    }else if(family==='comeback'&&c.role_index===7&&side(other(name)).lp-s.lp>=1500){
      const t=await choose(name,'Triệu hồi quái N/R cùng tộc từ tay',candidates(s.hand).filter(e=>card(e.id).card_type==='Monster'&&low(card(e.id))&&card(e.id).tribe===c.tribe&&specialAllowed(name,card(e.id))));if(t&&s.monsters.includes(null)){s.hand.splice(t.index,1);const x=monsterSlot(t.id,'def');x.effectsNegated=true;ensureUid(x);s.monsters[s.monsters.indexOf(null)]=x;await onSummon(name,x,'special','hand');}
    }else if(family==='extra'&&slot?.position){slot.syncMarks=(slot.syncMarks||0)+1;}
  }
  async function searchNormal(name,c,source){
    const s=S(name),nameToExclude=source?.aliasRound===duel.round?source.aliasName:c.name;
    const t=await choose(name,'Lấy quái N cùng tộc khác tên',candidates(s.deck).filter(e=>normal(card(e.id))&&card(e.id).tribe===c.tribe&&card(e.id).name!==nameToExclude));
    if(t){s.deck.splice(t.index,1);s.hand.push(t.id);s.deck=shuffle(s.deck);}else{const e=await ownTarget(name,'Không có mục tiêu: quái N/R +400 DEF',(_,x)=>low(x));if(e)e.slot.bonusDef=(e.slot.bonusDef||0)+400;}
    s.specialLock={tribe:c.tribe,round:duel.round};
  }
  async function onSummon(name,slot,kind='special',from='hand'){
    if(!duel||duel.finished||depth>10)return;depth++;try{
      const s=S(name),c=card(slot.id);ensureUid(slot);
      if(enabled(slot)&&((c.role_index===1&&kind==='normal')||c.role_index===10)&&!used(name,c,'summon')){mark(name,c,'summon');emit(name,c);if(!(await askReaction(name,{type:'monster_effect',sourceId:c.id})))await passiveAction(name,c,slot);}
      if(enabled(slot)&&c.role_index===4&&!used(name,c,'summon')){mark(name,c,'summon');emit(name,c);if(!(await askReaction(name,{type:'monster_effect',sourceId:c.id})))await searchNormal(name,c,slot);}
      if(normal(c))for(const id of [...s.grave]){const g=card(id);if(g?.role_index===3&&g.tribe===c.tribe&&!used(name,g,'revive')&&canRevive(name,id)){mark(name,g,'revive');reviveNow(name,id,{banishOnLeave:true});}}
      for(const p of s.spells){const x=card(p?.id);if(p&&!p.faceDown&&enabled(p)&&x?.role_index===7&&x.tribe===c.tribe&&['mark','extra'].includes(x.family)&&!used(name,x,'summon')){mark(name,x,'summon');emit(name,x);if(x.family==='extra')slot.syncMarks=(slot.syncMarks||0)+1;else await passiveAction(name,x,p);}}
      if(from==='grave'){
        const t=findTrap(other(name),8,'grave');if(t&&s.grave.some(id=>card(id).card_type==='Monster')){consumeTrap(other(name),t);const target=s.grave.find(id=>card(id).card_type==='Monster');s.grave.splice(s.grave.indexOf(target),1);s.banished.push(target);base.heal(other(name),500);}
      }
    }finally{depth--;}
  }
  async function discard(name,title,filter=()=>true,optional=false){const s=S(name),t=await choose(name,title,candidates(s.hand).filter(e=>filter(card(e.id),e)),{pick:'cheap',optional});if(t){s.hand.splice(t.index,1);s.grave.push(t.id);}return t;}
  async function nDiscardBonus(name,id){if(card(id)?.rarity==='N'&&drawEffect(name,1)){const s=S(name),t=await choose(name,'Đặt 1 lá trên tay xuống đáy Deck',candidates(s.hand),{pick:'cheap'});if(t){s.hand.splice(t.index,1);s.deck.push(t.id);}}}
  function mainCan(name,c,slot=null){
    const s=S(name),f=c.family;if(c.role_index===10)return sameHand(name,c).length>0&&suppressTargets(name,c).length>0;
    if(c.role_index===5)return duel.turn!==name&&sameHand(name,c).length>0&&[...E(name),...E(other(name))].some(e=>e.slot.position!=='def_down');
    if(c.role_index===7)return !used(name,c,'cycle')&&sameHand(name,c).length>0&&!skillDrawBlocked(name)||f==='spell'&&(slot?.spellCounters||0)>=2&&!skillDrawBlocked(name)||['coin','stance','mark','grave','mill','comeback'].includes(f)&&!used(name,c,'main');
    if(c.role_index===2&&!s.hand.length)return false;
    if(['coin','comeback'].includes(f)&&skillDrawBlocked(name))return false;
    if(f==='coin')return s.deck.length>0;
    if(f==='defense')return E(name).some(e=>e.slot.position!=='def_down');
    if(f==='mark')return E(name).some(e=>low(card(e.slot.id)))&&s.deck.some(id=>card(id).tribe===c.tribe&&card(id).id!==c.id);
    if(f==='stance')return s.lp>500&&s.grave.some(id=>card(id).card_type==='Monster'&&card(id).tribe===c.tribe);
    if(f==='power')return E(name).length>=2;
    if(f==='comeback')return E(name).length<E(other(name)).length&&s.deck.length>0;
    if(f==='grave')return s.grave.filter(id=>card(id).tribe===c.tribe).length>=3&&s.grave.some(id=>low(card(id))&&canRevive(name,id)&&card(id).tribe===c.tribe);
    if(f==='mill')return S(other(name)).deck.length>0;
    if(f==='spell')return s.grave.some(id=>card(id).card_type==='Spell')&&s.deck.some(id=>card(id).card_type==='Spell'&&card(id).archetype===c.archetype);
    if(f==='equip')return s.spells.includes(null)&&E(name).some(e=>e.slot!==slot&&card(e.slot.id).tribe===c.tribe&&e.slot.position!=='def_down');
    if(f==='swarm')return s.monsters.includes(null)&&s.hand.some(id=>normal(card(id))&&specialAllowed(name,card(id)));
    if(f==='ambush')return s.spells.includes(null)&&s.hand.length>0&&s.deck.some(id=>card(id).card_type==='Trap'&&card(id).archetype===c.archetype);
    if(f==='extra')return s.monsters.includes(null)&&s.grave.some(id=>normal(card(id))&&card(id).tribe===c.tribe&&specialAllowed(name,card(id)));
    return false;
  }
  async function equipSource(name,c,source){
    const s=S(name),t=await ownTarget(name,'Trang bị cho quái cùng tộc',(slot,x)=>x.tribe===c.tribe&&slot!==source);if(!t)return false;const free=s.spells.indexOf(null);if(free<0)return false;
    if(source?.position){const entry=findSlot(name,source);if(!entry)return false;if(entry.extra)s.extra=null;else s.monsters[entry.index]=null;}else{const i=s.hand.indexOf(c.id);if(i>=0)s.hand.splice(i,1);else{const old=s.grave.lastIndexOf(c.id);if(old>=0)s.grave.splice(old,1);}}
    ensureUid(t.slot);s.spells[free]={id:c.id,faceDown:false,equippedTo:t.slot.uid,setRound:duel.round};t.slot.equipCount=(t.slot.equipCount||0)+1;
    return true;
  }
  async function mainAction(name,c,source,context={}){
    const s=S(name),f=c.family;
    if(f==='coin'){
      const top=s.deck.slice(0,3),t=await choose(name,'Xem 3 lá: chọn 1 lên tay',candidates(top));if(t){s.deck.splice(0,top.length);s.hand.push(t.id);s.deck=shuffle([...s.deck,...top.filter((_,i)=>i!==t.index)]);context.lockDraw=true;}
    }else if(f==='defense'){
      const t=await ownTarget(name,'Chọn quái không bị phá hủy bởi chiến đấu');if(t){t.slot.protectRound=duel.round;t.slot.thorns=300;}
    }else if(f==='mark'){
      const tribute=await ownTarget(name,'Hy sinh 1 quái N/R để tìm bài',(_,x)=>low(x));if(!tribute)return false;leave(name,tribute,'cost',{by:name});
      const t=await choose(name,'Tìm 1 lá cùng tộc khác tên',candidates(s.deck).filter(e=>card(e.id).tribe===c.tribe&&card(e.id).name!==c.name));if(t){s.deck.splice(t.index,1);s.hand.push(t.id);s.deck=shuffle(s.deck);}
    }else if(f==='stance'){
      const t=await choose(name,'Chọn tên quái cùng tộc trong Mộ',candidates(s.grave).filter(e=>card(e.id).card_type==='Monster'&&card(e.id).tribe===c.tribe));if(t){s.lp-=500;if(source?.position){source.aliasName=card(t.id).name;source.aliasRound=duel.round;}else{const monster=await ownTarget(name,'Chọn quái cùng tộc nhận tên mới',(_,x)=>x.tribe===c.tribe);if(monster){monster.slot.aliasName=card(t.id).name;monster.slot.aliasRound=duel.round;}}}
    }else if(f==='power'){
      const victim=await ownTarget(name,'Phá 1 quái của bạn làm chi phí');if(!victim)return false;leave(name,victim,'cost',{by:name});const t=await ownTarget(name,'Quái khác +1000 ATK đến cuối lượt');if(t){buff(t.slot,1000);t.slot.singleAttackRound=duel.round;}
    }else if(f==='comeback'){
      drawEffect(name,2);await discard(name,'Bỏ 1 lá sau khi rút 2');s.extraLockRound=duel.round;
    }else if(f==='grave'){
      const options=candidates(s.grave).filter(e=>card(e.id).tribe===c.tribe),cost1=await choose(name,'Trục xuất chi phí thứ nhất trong Mộ',options,{pick:'cheap'});if(!cost1)return false;
      const cost2=await choose(name,'Trục xuất chi phí thứ hai',options.filter(e=>e.index!==cost1.index),{pick:'cheap'});if(!cost2)return false;
      const targets=candidates(s.grave).filter(e=>e.index!==cost1.index&&e.index!==cost2.index&&low(card(e.id))&&card(e.id).tribe===c.tribe&&canRevive(name,e.id));const target=await choose(name,'Chọn quái N/R cùng tộc để hồi sinh',targets);if(!target)return false;
      for(const e of [cost1,cost2].sort((a,b)=>b.index-a.index)){s.grave.splice(e.index,1);s.banished.push(e.id);}reviveNow(name,target.id);
    }else if(f==='mill'){
      const foe=S(other(name)),top=foe.deck.splice(0,3),bottom=await choose(name,'Xem 3 lá đối thủ: chọn lá xuống đáy',candidates(top));if(bottom){const rest=top.filter((_,i)=>i!==bottom.index);const first=rest.length>1?await choose(name,'Chọn lá nằm trên cùng',candidates(rest)):null;const ordered=first?[first.id,...rest.filter((_,i)=>i!==first.index)]:rest;foe.deck=[...ordered,...foe.deck,bottom.id];}else foe.deck=[...top,...foe.deck];
    }else if(f==='spell'){
      const old=await choose(name,'Đưa 1 Phép trong Mộ về đáy Deck',candidates(s.grave).filter(e=>card(e.id).card_type==='Spell'));if(!old)return false;
      const t=await choose(name,'Tìm Phép khác tên cùng bộ',candidates(s.deck).filter(e=>card(e.id).card_type==='Spell'&&card(e.id).archetype===c.archetype&&card(e.id).name!==card(old.id).name));if(!t)return false;
      s.grave.splice(old.index,1);s.deck.splice(t.index,1);s.hand.push(t.id);s.deck.push(old.id);s.blockedCards??={};s.blockedCards[t.id]=duel.round;
    }else if(f==='equip')return equipSource(name,c,source);
    else if(f==='swarm'){
      const t=await choose(name,'Triệu hồi Đặc biệt quái N từ tay',candidates(s.hand).filter(e=>normal(card(e.id))&&specialAllowed(name,card(e.id))));if(t&&s.monsters.includes(null)){s.hand.splice(t.index,1);const slot=monsterSlot(t.id);ensureUid(slot);s.monsters[s.monsters.indexOf(null)]=slot;await onSummon(name,slot,'special','hand');s.nrAttackRound=duel.round;}
    }else if(f==='ambush'){
      const t=await choose(name,'Úp 1 Bẫy cùng bộ từ Deck',candidates(s.deck).filter(e=>card(e.id).card_type==='Trap'&&card(e.id).archetype===c.archetype));if(t&&s.spells.includes(null)){s.deck.splice(t.index,1);s.spells[s.spells.indexOf(null)]={id:t.id,faceDown:true,setRound:duel.round};s.deck=shuffle(s.deck);await discard(name,'Bỏ 1 lá sau khi úp Bẫy');}
    }else if(f==='extra'){
      const t=await choose(name,'Hồi sinh quái N làm nguyên liệu Extra',candidates(s.grave).filter(e=>normal(card(e.id))&&card(e.id).tribe===c.tribe&&canRevive(name,e.id)));if(t)reviveNow(name,t.id,{materialOnlyRound:duel.round});
    }
    return true;
  }
  async function cycleContinuous(name,c,slot){
    if(c.family==='spell'&&(slot.spellCounters||0)>=2&&!skillDrawBlocked(name)&&await yes(name,'Bỏ 2 dấu Chú để rút 1 lá?')){slot.spellCounters-=2;drawEffect(name,1);}
    if(!used(name,c,'cycle')&&sameHand(name,c).length&&!skillDrawBlocked(name)&&await yes(name,'Gửi 1 lá cùng tộc để rút 1 lá?')){const cost=await discard(name,'Chọn lá cùng tộc gửi xuống Mộ',x=>x.tribe===c.tribe);if(cost){mark(name,c,'cycle');drawEffect(name,1);}}
  }
  async function spellEvent(name){
    const s=S(name),count=(s.spellCount[duel.round]||0)+1;s.spellCount[duel.round]=count;
    for(const source of activeSources(name,'spell')){if(source.chantRound!==duel.round){source.chantRound=duel.round;source.chantsThisRound=0;}if(source.chantsThisRound<2){source.chantsThisRound++;source.spellCounters=(source.spellCounters||0)+1;}const c=card(source.id);if(c.is_boss&&count===3)base.heal(name,700);}
  }
  function spendCounters(sel){if(!mainPhase())return;const s=S('player'),slot=sel.type==='spell'?s.spells[sel.index]:sel.type==='extra'?s.extra:s.monsters[sel.index];if(!enabled(slot)||card(slot.id).family!=='spell'||(slot.spellCounters||0)<2||skillDrawBlocked('player')||used('player',card(slot.id),'counters'))return;return run(()=>{mark('player',card(slot.id),'counters');slot.spellCounters-=2;drawEffect('player',1);emit('player',card(slot.id));});}
  async function playSpellFor(name,index){
    const s=S(name),id=s.hand[index],c=card(id);if(!c||c.card_type!=='Spell'||used(name,c,'main')||s.blockedCards?.[id]===duel.round)return false;
    if(c.role_index!==7&&!mainCan(name,c))return false;if(['Liên Tục','Trang Bị'].includes(c.spell_category)&&!s.spells.includes(null))return false;
    if(name==='player'&&window.memeFx)await window.memeFx.cardActivation(index);
    if(await askReaction(name,{type:'spell',sourceId:id})){s.hand.splice(s.hand.indexOf(id),1);s.grave.push(id);mark(name,c);await spellEvent(name);return true;}
    mark(name,c);emit(name,c);let source=null,context={};
    if(c.role_index===7){s.hand.splice(s.hand.indexOf(id),1);source={id,faceDown:false,setRound:duel.round};s.spells[s.spells.indexOf(null)]=source;
      if(['coin','stance','grave','mill','comeback'].includes(c.family))await passiveAction(name,c,source);await spellEvent(name);await cycleContinuous(name,c,source);
    }else{
      if(c.family!=='equip'){s.hand.splice(s.hand.indexOf(id),1);s.grave.push(id);}
      await mainAction(name,c,source,context);await spellEvent(name);
      if(E(name).filter(e=>low(card(e.slot.id))&&card(e.slot.id).tribe===c.tribe).length>=2){const target=await ownTarget(name,'Combo 2 quái N/R cùng tộc: +400 ATK');if(target)buff(target.slot,400);}
    }
    if(context.lockDraw)s.drawLockRound=duel.round;return true;
  }
  async function activateFor(name,index,extra=false){
    const s=S(name),slot=extra?s.extra:s.monsters[index],c=card(slot?.id);if(!enabled(slot)||!c||![2,5,10].includes(c.role_index)||used(name,c,c.is_boss?'boss':'main')||!mainCan(name,c,slot))return false;
    if(c.role_index===5)return false;
    let cost;
    if(c.is_boss){cost=await discard(name,'Gửi 1 lá cùng tộc để vô hiệu',x=>x.tribe===c.tribe,true);if(!cost)return false;const t=await choose(name,'Vô hiệu 1 lá ngửa đối thủ đến hết lượt',suppressTargets(name,c));if(!t)return false;mark(name,c,'boss');if(!(await askReaction(name,{type:'monster_effect',sourceId:c.id,index,extra}))){negateSlot(t.slot);emit(name,c,[t]);}return true;}
    cost=await discard(name,'Chi phí: bỏ 1 lá trên tay',()=>true,true);if(!cost)return false;mark(name,c);emit(name,c);
    if(await askReaction(name,{type:'monster_effect',sourceId:c.id,index,extra}))return true;
    const context={};await mainAction(name,c,slot,context);await nDiscardBonus(name,cost.id);if(context.lockDraw)s.drawLockRound=duel.round;return true;
  }
  function validMaterials(name,c,extra=false){
    const pool=E(name).filter(e=>card(e.slot.id).tribe===c.tribe&&e.slot.position!=='def_down'&&(extra||e.slot.materialOnlyRound!==duel.round));const groups=[];
    const count=!extra&&c.family==='comeback'&&S(other(name)).lp-S(name).lp>=2000?1:2;
    for(let mask=1;mask<(1<<pool.length);mask++){const chosen=pool.filter((_,i)=>mask&(1<<i));if(chosen.length!==count)continue;if(extra?chosen.reduce((n,e)=>n+card(e.slot.id).stars,0)<6:!chosen.some(e=>low(card(e.slot.id))))continue;groups.push(chosen);}
    return groups;
  }
  async function summonBoss(name,id,extra=false){
    const s=S(name),c=card(id);if(!c?.is_boss||!specialAllowed(name,c)||extra&&s.extraLockRound===duel.round)return false;
    const sets=validMaterials(name,c,extra);if(!sets.length)return false;let materials=[];
    if(name==='player'&&!auto){let pool=[...new Set(sets.flat())];while(materials.length<sets[0].length){const t=await choose(name,`Chọn nguyên liệu ${materials.length+1}/${sets[0].length} cùng tộc`,pool.map(e=>({...e,id:e.slot.id})),{optional:materials.length===0});if(!t)return false;materials.push(t);pool=pool.filter(e=>e.slot!==t.slot);}if(!sets.some(set=>set.every(e=>materials.some(x=>x.slot===e.slot)))){log('Nguyên liệu chưa đúng điều kiện in trên Boss.');return false;}}
    else materials=sets[0];
    const free=s.monsters.findIndex((slot,i)=>!slot||materials.some(e=>!e.extra&&e.index===i));if(free<0)return false;
    if(window.memeFx)await window.memeFx.summon(extra?-1:s.hand.indexOf(id),free,false,name,extra?id:null);
    for(const e of materials){s.materialHistory.push(e.slot.id);leave(name,e,'material',{by:name,materialTarget:id});}
    const list=extra?s.extraDeck:s.hand;list.splice(list.indexOf(id),1);const slot={...monsterSlot(id),properlySummoned:true,summonFromExtra:extra,materials:materials.map(e=>e.slot.id)};ensureUid(slot);s.monsters[free]=slot;
    log(`🌟 Triệu hồi đặc biệt ${c.name}.`);await onSummon(name,slot,'special',extra?'extra':'hand');return true;
  }
  async function normalSummon(name,index,position='atk',tributes=[]){
    const s=S(name),id=s.hand[index],c=card(id);if(!c||c.card_type!=='Monster'||c.is_boss)return false;const free=s.monsters.findIndex((slot,i)=>!slot||tributes.includes(i));if(free<0)return false;
    if(window.memeFx)await window.memeFx.summon(index,free,position==='def_down',name);
    for(const i of tributes)leave(name,{slot:s.monsters[i],index:i,extra:false},'tribute',{by:name,materialTarget:id});s.hand.splice(index,1);const slot=monsterSlot(id,position);ensureUid(slot);s.monsters[free]=slot;if(name==='player')duel.normalSummoned=true;
    duel.mode=null;duel.pending=null;log(`✨ Triệu hồi ${c.name}${position==='def_down'?' (úp thủ)':''}.`);if(position!=='def_down')await onSummon(name,slot,'normal');return true;
  }
  async function specialComeback(name,index){const s=S(name),id=s.hand[index],c=card(id);if(c?.role_index!==1||c.family!=='comeback'||S(other(name)).lp-s.lp<1500||!s.monsters.includes(null)||!specialAllowed(name,c)||used(name,c,'selfSpecial'))return false;
    mark(name,c,'selfSpecial');s.hand.splice(index,1);const slot={...monsterSlot(id),effectsNegated:true};ensureUid(slot);s.monsters[s.monsters.indexOf(null)]=slot;await onSummon(name,slot,'special');return true;}
  async function quickResponse(name,intent){
    const stance=activeSources(name,'stance').filter(slot=>[1,7,10].includes(card(slot.id).role_index)&&!used(name,card(slot.id),'quick'));
    if(stance.length){const picked=await choose(name,'Hiệu ứng nhanh: đổi tư thế quái?',stance.map(slot=>({id:slot.id,slot})),{optional:true});if(picked){mark(name,card(picked.id),'quick');await passiveAction(name,card(picked.id),picked.slot);}}
    const sources=E(name).filter(e=>enabled(e.slot)&&card(e.slot.id)?.role_index===5&&!used(name,card(e.slot.id))&&mainCan(name,card(e.slot.id),e.slot));
    if(sources.length){const picked=await choose(name,'Phản ứng nhanh: giảm ATK đối thủ?',sources.map(e=>({...e,id:e.slot.id})),{optional:true});if(picked){const c=card(picked.id),cost=await discard(name,'Bỏ 1 lá cùng tộc để giảm 800 ATK',x=>x.tribe===c.tribe,true);if(cost){const target=await choose(name,'Chọn quái ngửa: −800 ATK',[...fieldOptions(other(name),x=>x.position!=='def_down'),...fieldOptions(name,x=>x.position!=='def_down')]);if(target){mark(name,c);buff(target.slot,-800,card(cost.id).rarity==='N'?-300:0);emit(name,c,[target]);}}}}
    if(intent.type==='spell'){
      const trap=findTrap(name,8,'spell');const cost=trap&&S(name).hand.map((id,index)=>({id,index})).find(e=>card(e.id).card_type==='Spell');if(trap&&cost){S(name).hand.splice(cost.index,1);S(name).grave.push(cost.id);consumeTrap(name,trap);log('🔒 Đã trả chi phí 1 Phép để vô hiệu Phép đối thủ.');return true;}
    }
    if(intent.type==='monster_effect'&&(S(other(name)).milled[duel.round]||0)>=3){const trap=findTrap(name,8,'mill');if(trap){consumeTrap(name,trap);return true;}}
    return false;
  }
  async function askReaction(name,intent){
    if(window.memeOnlineIsPlaying?.()&&name==='player')return window.memeOnlineAskReaction?window.memeOnlineAskReaction(intent):false;
    return quickResponse(other(name),intent);
  }
  function legalTargets(name){const foe=other(name),all=E(foe),guard=all.find(e=>enabled(e.slot)&&card(e.slot.id)?.is_boss&&card(e.slot.id).family==='defense'&&e.slot.position==='def');return guard?all.filter(e=>e===guard||card(e.slot.id)?.rarity!=='N'):all;}
  function counter(name,attackerSide,index,extra){
    const ctx=duel.attackContext||{},s=S(name),target=ctx.targetExtra?s.extra:s.monsters[ctx.targetIndex],attacker=extra?S(attackerSide).extra:S(attackerSide).monsters[index];
    let trap=findTrap(name,8,'coin');if(trap){consumeTrap(name,trap);const tails=Math.random()>=.5;log(`🪙 Bẫy tung đồng xu: ${tails?'SẤP':'NGỬA'}.`);if(tails){base.heal(name,600);return true;}}
    trap=findTrap(name,8,'defense');if(trap&&target&&target.position!=='atk'){consumeTrap(name,trap);if(attacker)attacker.position='def';duel.phase='MAIN2';return true;}
    for(const family of ['stance','equip']){trap=findTrap(name,8,family);if(trap&&target&&(family!=='equip'||target.equipCount>0)){const next=E(name).find(e=>e.slot!==target&&low(card(e.slot.id)));if(next){consumeTrap(name,trap);duel.arcanaRedirect={index:next.index,extra:next.extra};break;}}}
    return false;
  }
  function beforeDamage(attackerSide,attacker,defender){
    if(defender?.protectRound===duel.round){damage(attackerSide,defender.thorns||300);log('🛡 Quái được bảo vệ: người tấn công chịu 300 sát thương.');}
    if(!attacker||!defender)return;const c=card(attacker.id),supported=enabled(attacker)&&c?.family==='power'&&[1,10].includes(c.role_index)||activeSources(attackerSide,'power').some(s=>card(s.id)?.role_index===7&&card(s.id).tribe===c.tribe);
    if(supported&&!used(attackerSide,c,'damage')&&stat(attackerSide,attacker)<stat(other(attackerSide),defender)){mark(attackerSide,c,'damage');attacker.damageStepAtk=800;attacker.recoilRound=duel.round;}
  }
  function afterDamage(attackerSide,attacker){if(attacker?.recoilRound===duel.round){attacker.damageStepAtk=0;delete attacker.recoilRound;damage(attackerSide,400);log('🔥 Sức mạnh Damage Step kết thúc: nhận 400 sát thương.');}}
  const legacyAttack=resolveAttack;
  async function attackFlow(targetIndex,targetExtra=false){
    if(!duel?.pending||busy||window.memeFx?.busy)return;const ctx=duel.pending,owner=duel.turn,attacker=ctx.isExtra?S(owner).extra:S(owner).monsters[ctx.index];
    if(!canAttack(attacker))return;const legal=legalTargets(owner);if(legal.length&&(targetIndex===null&&!targetExtra||!legal.some(e=>e.index===targetIndex&&e.extra===targetExtra))){log('Boss thế thủ đang bảo vệ quái N; hãy chọn mục tiêu hợp lệ.');return;}
    return run(async()=>{duel.attackContext={attackerSide:owner,index:ctx.index,extra:ctx.isExtra,targetIndex,targetExtra};await askReaction(owner,{type:'attack',index:ctx.index,extra:ctx.isExtra,targetIndex,targetExtra});if(!attacker||!findSlot(owner,attacker))return;await legacyAttack(targetIndex,targetExtra);afterDamage(owner,attacker);});
  }
  function canAttack(slot){if(!slot)return false;const c=card(slot.id),owner=E('player').some(e=>e.slot===slot)?'player':'enemy',s=S(owner);return base.canAttack(slot)&&slot.noAttackRound!==duel.round&&slot.materialOnlyRound!==duel.round&&!(s.nrAttackRound===duel.round&&!low(c))&&!(slot.singleAttackRound===duel.round&&(slot.attacksUsed||0)>=1);}
  function beginTurn(name){for(const e of E(name)){e.slot.attacked=false;e.slot.attacksUsed=0;}S(name);}
  async function aiTurn200(){
    if(!duel||duel.finished||duel.turn!=='enemy'||window.memeOnlineIsPlaying?.())return;const match=duel,s=S('enemy');beginTurn('enemy');if(!draw('enemy'))return;
    await run(async()=>{
      for(const e of [...E('enemy')]){const c=card(e.slot.id);if(c?.role_index===2&&mainCan('enemy',c,e.slot)&&!used('enemy',c)){await activateFor('enemy',e.index,e.extra);break;}}
      for(const id of [...s.hand]){const c=card(id);if(c.card_type==='Spell'&&!used('enemy',c)&&((c.role_index===7&&s.spells.includes(null))||mainCan('enemy',c))){await playSpellFor('enemy',s.hand.indexOf(id));break;}}
      const boss=s.hand.find(id=>card(id).is_boss&&validMaterials('enemy',card(id)).length);if(boss)await summonBoss('enemy',boss,false);
      const normalCards=s.hand.map((id,index)=>({id,index,c:card(id)})).filter(e=>e.c.card_type==='Monster'&&!e.c.is_boss).sort((a,b)=>b.c.atk-a.c.atk);if(normalCards.length&&s.monsters.includes(null))await normalSummon('enemy',normalCards[0].index,'atk');
      const ex=s.extraDeck.find(id=>validMaterials('enemy',card(id),true).length);if(ex)await summonBoss('enemy',ex,true);
      const trap=s.hand.find(id=>card(id).card_type==='Trap');if(trap&&s.spells.includes(null)){s.hand.splice(s.hand.indexOf(trap),1);s.spells[s.spells.indexOf(null)]={id:trap,faceDown:true,setRound:duel.round};}
      if(!heroSkillProblem('enemy')){const h=getHero(s.heroId);if(h.code!=='heal'||s.lp<=3300)useHeroSkill('enemy');}
    });
    if(duel!==match||duel.finished)return;duel.phase='BATTLE';render();
    for(const e of [...E('enemy')]){if(duel!==match||duel.finished||duel.phase!=='BATTLE')break;if(!canAttack(e.slot))continue;const targets=legalTargets('enemy'),target=targets.find(t=>stat('enemy',e.slot)>(t.slot.position==='atk'?stat('player',t.slot):stat('player',t.slot,'def')));if(targets.length&&!target)continue;duel.pending={index:e.index,isExtra:e.extra};await attackFlow(target?.index??null,target?.extra||false);}
    if(duel!==match||duel.finished)return;while(s.hand.length>6)s.grave.push(s.hand.pop());duel.turn='player';duel.phase='MAIN1';duel.round++;duel.normalSummoned=false;beginTurn('player');if(draw('player'))log('🟢 Lượt của bạn: rút 1 lá.');render();
  }
  // Runtime adapters retain the existing board, animation and network transport.
  const legacySummon=summon,legacySet=setTrap;
  summon=function(index,position){const c=card(S('player').hand[index]);if(!mainPhase()||duel.mode)return;if(c?.is_boss)return run(()=>summonBoss('player',c.id));return legacySummon(index,position);};
  placeSummon=(index,position,tributes)=>run(()=>normalSummon('player',index,position,tributes));
  summonExtra=index=>{if(!mainPhase()||duel.mode)return;const id=S('player').extraDeck[index];if(!id)return;closeModal();return run(()=>summonBoss('player',id,true));};
  playSpell=index=>{if(!mainPhase()||duel.mode)return;return run(()=>playSpellFor('player',index));};
  activateMonsterEffect=(index,extra=false)=>{if(!mainPhase()||duel.mode)return;return run(()=>activateFor('player',index,extra));};
  activateTrap=()=>log('Bẫy phản ứng tự động khi đúng điều kiện in trên lá; cần úp từ lượt trước.');
  resolveAttack=attackFlow;aiTurn=aiTurn200;
  window.memeRules={...base,stat,remove:leave,damage,canAttack,beginTurn,counter,negateSpell:()=>false,aiSpecialSummon:()=>{},supported:new Set(CARDS.map(c=>c.effect_code)),targetCodes:[],targetEntries:()=>[],canExecute:(name,c)=>!used(name,c,c.is_boss?'boss':'main')&&mainCan(name,c),execute:(name,c)=>{queue.push(()=>passiveAction(name,c,null));},onSummon};
  window.arcana200={get busy(){return busy>0;},get choosing(){return !!choiceCancel;},setAuto(value){auto=!!value;},cancelChoice(){choiceCancel?.();},run,flush,choose,enabled,used,mark,drawEffect,drawBlocked:skillDrawBlocked,mainCan,spendCounters,playSpellFor,activateFor,normalSummon,summonBoss,specialComeback,validMaterials,legalTargets,quickResponse,askReaction,onSummon,beforeDamage,afterDamage,removeSpell,spellEvent,displayName:slot=>slot.aliasRound===duel.round?slot.aliasName:card(slot.id).name,activateContinuous:index=>{if(!mainPhase())return;const s=S('player'),slot=s.spells[index],c=card(slot?.id);if(!slot||slot.faceDown||c.role_index!==7||!enabled(slot))return;return run(async()=>{emit('player',c);if(!used('player',c)&&['coin','stance','grave','mill','comeback'].includes(c.family)){mark('player',c);await passiveAction('player',c,slot);}await cycleContinuous('player',c,slot);});},families};
})();
