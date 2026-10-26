// Canonical effect handlers are developed against the same serialized duel context.
// The candidate catalogue stays disabled until its conversion audit passes.
(() => {
 const core=window.memeAnime.tcgCore,handlers=new Map(),active=()=>!!window.MEME_TCG_CATALOG;
 const {S,E,face,uid,free,pick,choices,fx,enqueue,stat,remove,clearSpell,spellList,targetList,allFields,drawCards,takeDiscard,postSummon}=core;
 const C=id=>card(id),A=n=>'AN-'+n.replaceAll(' ','_'),H=n=>'MGX-elemental_hero_'+n;
 const isHero=c=>/\bHERO\b/.test(c?.name_en||''),isElemental=c=>/^Elemental HERO /.test(c?.name_en||'');
 const ownSlot=(n,slot)=>E(n).find(e=>e.slot===slot),entryId=e=>e.id||e.slot?.id;
 function addTemp(slot,atk=0,def=0){if(slot.tcgTempRound!==duel.round){slot.tcgTempAtk=0;slot.tcgTempDef=0;}slot.tcgTempRound=duel.round;slot.tcgTempAtk=(slot.tcgTempAtk||0)+atk;slot.tcgTempDef=(slot.tcgTempDef||0)+def;}
 async function chooseMany(n,title,list,max,{optional=false}={}){return await core.pickMany(n,title,list,{min:optional?0:1,max,optional})||[];}
 function returnToHand(n,e){const c=C(entryId(e)),s=S(n);if(e.zone==='grave'){if(s.grave[e.index]!==c.id)return false;s.grave.splice(e.index,1);}else if(e.slot){if(!ownSlot(n,e.slot))return false;if(e.extra)s.extra=null;else s.monsters[e.index]=null;onLeave(n,e.slot,'return',false);}else return false;(c.deck_zone==='Extra'?s.extraDeck:s.hand).push(c.id);return true;}
 async function effect(n,c,ctx,kind,targets,fn,extra={}){return fx(n,c,kind,targets,async()=>{if(ctx.fromHand||ctx.fromSet){if(!core.commitSpellSource(n,c,ctx))return;}if(ctx.markSlot)ctx.markSlot.effectUsedRound=duel.round;await fn();},extra);}
 function register(id,fn){handlers.set(id,fn);}
 async function ocean(n,c,ctx){const source=ctx.source;if(!source||!face(source)||!ownSlot(n,source))return false;const list=[...targetList(n,(s,c)=>face(s)&&isHero(c)),...choices(S(n).grave,'grave').filter(e=>isHero(C(e.id)))],t=await pick(n,'Đại Dương: đưa 1 HERO về tay',list,{optional:true});if(!t)return false;return effect(n,c,ctx,'recover',[t],()=>returnToHand(n,t));}
 register(H('ocean'),ocean);
 register(H('stratos'),async(n,c,ctx)=>{const source=ctx.source,s=S(n),foe=other(n),heroCount=E(n).filter(e=>e.slot!==source&&face(e.slot)&&isHero(C(e.slot.id))).length,search=choices(s.deck,'deck').filter(e=>isHero(C(e.id))),spells=[...spellList(foe),...spellList(n)],modes=[];if(search.length)modes.push({id:c.id,mode:'search',label:'Lấy 1 HERO từ Deck'});if(heroCount&&spells.length)modes.push({id:c.id,mode:'destroy',label:`Phá tối đa ${heroCount} Phép/Bẫy`});const mode=await pick(n,'Thiên Không: chọn hiệu ứng',modes,{optional:true});if(!mode)return false;if(mode.mode==='search'){const t=await pick(n,'Thiên Không: chọn HERO',search);if(!t)return false;return effect(n,c,ctx,'search',[],()=>{s.hand.push(s.deck.splice(t.index,1)[0]);s.deck=shuffle(s.deck);});}const targets=await chooseMany(n,'Thiên Không: chọn Phép/Bẫy để phá',spells.map(e=>({...e,hidden:e.name!==n&&e.slot.faceDown})),heroCount);if(!targets.length)return false;return effect(n,c,ctx,'destroy',targets,()=>{for(const t of targets)clearSpell(t.name,t.index);});});
 register(H('gaia'),async(n,c,ctx)=>{if(ctx.kind!=='fusion'&&!ctx.source?.fusionSummoned)return false;const t=await pick(n,'Gaia: hấp thu một nửa ATK',targetList(other(n),face));if(!t)return false;return effect(n,c,ctx,'boost',[t],()=>{const amount=Math.floor(stat(other(n),t.slot)/2);addTemp(t.slot,-amount);addTemp(ctx.source,amount);});});
 register(H('great_tornado'),async(n,c,ctx)=>{if(ctx.kind!=='fusion'&&!ctx.source?.fusionSummoned)return false;const targets=targetList(other(n),face);return effect(n,c,ctx,'boost',targets,()=>{for(const t of targets){t.slot.tcgAtkDelta=(t.slot.tcgAtkDelta||0)-Math.floor(stat(other(n),t.slot)/2);t.slot.tcgDefDelta=(t.slot.tcgDefDelta||0)-Math.floor(stat(other(n),t.slot,'def')/2);}});});
 register(H('terra_firma'),async(n,c,ctx)=>{const t=await pick(n,'Đại Địa: hiến tế 1 HERO Nguyên Tố',targetList(n,(s,c)=>face(s)&&isElemental(c)));if(!t)return false;return effect(n,c,ctx,'boost',[t],()=>{const value=stat(n,t.slot);if(remove(n,t,'effect_cost')&&ownSlot(n,ctx.source))addTemp(ctx.source,value);},{materials:[entryId(t)]});});
 register('MGX-umi',async(n,c,ctx)=>effect(n,c,ctx,'spell',[],()=>{}));
 const attackFees=new Map(['AN-blue_eyes_toon_dragon','AN-toon_summoned_skull','AN-toon_mermaid','AN-manga_ryu_ran'].map(id=>[id,500]));
 function attackProblem(n,slot){const fee=attackFees.get(slot.id);return active()&&fee&&!window.memeLpCosts.canPay(n,fee)?`Cần hơn ${window.memeLpCosts.fixed(fee)} LP để trả phí tấn công.`:'';}
 async function payAttackFee(n,slot){if(!active()||!attackFees.has(slot.id))return true;const fee=attackFees.get(slot.id);if(!window.memeLpCosts.canPay(n,fee))return false;let paid=false;await fx(n,C(slot.id),'cost',[{name:n,type:'lp'}],()=>{paid=window.memeLpCosts.pay(n,fee,slot.id);},{text:`Trả ${window.memeLpCosts.fixed(fee)} LP để tuyên bố tấn công.`});return paid;}
 register('AN-the_winged_dragon_of_ra',async(n,c,ctx)=>{if(!ctx.source||!ownSlot(n,ctx.source)||!window.memeLpCosts.canPay(n,1000))return false;const t=await pick(n,'Ra · trả 500 LP: chọn quái để phá',allFields().map(e=>({...e,hidden:e.name!==n&&!face(e.slot)})));if(!t)return false;let paid=false;await fx(n,c,'cost',[{name:n,type:'lp'}],()=>{paid=window.memeLpCosts.pay(n,1000,c.id);},{text:'Trả 500 LP để kích hoạt hiệu ứng Ra.'});if(!paid)return false;return effect(n,c,ctx,'destroy',[t],()=>remove(t.name,t,'effect'));});
 register('MGX-masked_hero_blast',async(n,c,ctx)=>{if(!ctx.source||!ownSlot(n,ctx.source)||ctx.source.effectUsedRound===duel.round||!window.memeLpCosts.canPay(n,500))return false;const t=await pick(n,'Phong Bạo · trả 250 LP: đưa Phép/Bẫy về tay',spellList(other(n)).map(e=>({...e,hidden:!!e.slot.faceDown})));if(!t)return false;let paid=false;await fx(n,c,'cost',[{name:n,type:'lp'}],()=>{paid=window.memeLpCosts.pay(n,500,c.id);if(paid)ctx.source.effectUsedRound=duel.round;},{text:'Trả 250 LP để kích hoạt Phong Bạo.'});if(!paid)return false;return effect(n,c,ctx,'recover',[t],()=>{const s=S(t.name),slot=t.index===-1?s.field:s.spells[t.index];if(slot!==t.slot)return;if(t.index===-1)s.field=null;else s.spells[t.index]=null;const owner=S(slot.originalOwner||t.name);(C(slot.id).deck_zone==='Extra'?owner.extraDeck:owner.hand).push(slot.id);});});
 async function onSummon(n,slot,kind){if(!active())return;const c=C(slot.id);if(c.id==='AN-the_winged_dragon_of_ra'&&kind==='normal'&&S(n).lp>100){const yes=await pick(n,'Ra: trả LP để còn 100, tăng ATK và DEF',[{id:c.id,label:`Trả ${S(n).lp-100} LP · còn 100 LP`}],{optional:true});if(yes&&ownSlot(n,slot))await fx(n,c,'god',[{name:n,type:'lp'}],()=>{const paid=window.memeLpCosts.payToRemaining(n,100,c.id);if(paid){slot.tcgAtkDelta=(slot.tcgAtkDelta||0)+paid;slot.tcgDefDelta=(slot.tcgDefDelta||0)+paid;}});}if(c.id==='MGX-masked_hero_blast'&&kind==='special'){const t=await pick(n,'Phong Bạo: giảm một nửa ATK quái đối thủ',targetList(other(n),face),{optional:true});if(t)await fx(n,c,'boost',[t],()=>{t.slot.tcgAtkDelta=(t.slot.tcgAtkDelta||0)-Math.floor(stat(other(n),t.slot)/2);});}}
 async function shiningRecovery(n,c){const s=S(n),list=choices(s.banished,'banished').filter(e=>isElemental(C(e.id))),targets=await chooseMany(n,'Ánh Sáng Rực Rỡ: lấy tối đa 2 HERO về tay',list,2,{optional:true});if(!targets.length)return false;return fx(n,c,'recover',[],()=>{for(const t of targets.sort((a,b)=>b.index-a.index)){if(s.banished[t.index]!==t.id)continue;s.banished.splice(t.index,1);(C(t.id).deck_zone==='Extra'?s.extraDeck:s.hand).push(t.id);}});}
 function onLeave(n,slot,reason,toGrave){const c=C(slot.id);if(c.id===H('absolute_zero'))enqueue(()=>fx(n,c,'destroy',targetList(other(n)),()=>{for(const e of [...E(other(n))])remove(other(n),e,'effect');}));if(c.id===H('the_shining')&&toGrave)enqueue(()=>shiningRecovery(slot.originalOwner||slot.homeOwner||n,c));}
 function statValue(n,slot,kind='atk'){
  const c=C(slot.id),s=S(n),f=S(other(n));if(!c)return 0;let value=Math.max(0,Number(kind==='atk'?slot.statAtk??c.atk:slot.statDef??c.def)||0);
  if(c.id==='AN-slifer_the_sky_dragon')value=s.hand.length*1000;
  if(['AN-relinquished','AN-thousand_eyes_restrict'].includes(c.id))value=kind==='atk'?slot.absorbAtk||0:slot.absorbDef||0;
  if(c.id==='AN-chimeratech_overdragon')value=(slot.materialCount||0)*800;
  if(kind==='atk'){
   if(['AN-dark_magician_girl','AN-toon_dark_magician_girl'].includes(c.id))value+=300*[...s.grave,...f.grave].filter(id=>['AN-dark_magician','AN-magician_of_black_chaos'].includes(id)).length;
   if(c.id==='AN-buster_blader')value+=500*[...E(other(n)).map(e=>e.slot.id),...f.grave].filter(id=>C(id)?.tribe==='Rồng').length;
   if(c.id==='AN-dark_paladin')value+=500*[...allFields().map(e=>entryId(e)),...s.grave,...f.grave].filter(id=>C(id)?.tribe==='Rồng').length;
   if(c.id==='AN-blue_eyes_shining_dragon')value+=300*s.grave.filter(id=>C(id)?.tribe==='Rồng').length;
   if(c.id==='AN-dragon_master_knight')value+=500*E(n).filter(e=>e.slot!==slot&&face(e.slot)&&C(e.slot.id)?.tribe==='Rồng').length;
   if(c.id==='AN-elemental_hero_shining_flare_wingman')value+=300*s.grave.filter(id=>isElemental(C(id))).length;
   if(c.id==='AN-neo_spacian_flare_scarab')value+=400*spellList(other(n)).length;
   if(c.id==='AN-elemental_hero_flare_neos')value+=400*(spellList(n).length+spellList(other(n)).length);
   if(c.id==='AN-elemental_hero_air_neos')value+=Math.max(0,f.lp-s.lp);
   if(c.id==='AN-cyberdark_dragon')value+=100*s.grave.filter(id=>C(id)?.card_type==='Monster').length;
   if(c.id===H('absolute_zero'))value+=500*allFields().filter(e=>face(e.slot)&&C(entryId(e))?.element==='Thủy'&&C(entryId(e))?.name_en!=='Elemental HERO Absolute Zero').length;
   if(c.id===H('the_shining'))value+=300*s.banished.filter(id=>isElemental(C(id))).length;
   if(c.id===H('escuridao'))value+=100*s.grave.filter(id=>isElemental(C(id))).length;
   if(c.id==='MGX-masked_hero_koga')value+=500*E(other(n)).length;
  }
  for(const e of [...spellList(n),...spellList(other(n))]){const x=C(entryId(e));if(e.slot.faceDown)continue;if(x.id==='MGX-umi'){if(['Cá','Hải Long','Sấm','Thủy Tộc'].includes(c.tribe))value+=200;if(['Máy','Hỏa Tộc'].includes(c.tribe))value-=200;}if(e.slot.equippedTo&&e.slot.equippedTo===slot.uid){if(x.id==='AN-megamorph'&&kind==='atk'){}else if(kind==='atk')value+=e.slot.equipValue??x.effect_value??0;else value+=e.slot.equipDef||0;}}
  if(kind==='atk')value+=window.memeEquipRules?.megamorphDelta(n,slot)||0;
  value+=kind==='atk'?(slot.tcgAtkDelta||0)+(slot.powerAtk||0)+(slot.attackBonus||0)+(slot.equip||0):(slot.tcgDefDelta||0)+(slot.equipDef||0);
  if(slot.tcgTempRound===duel.round)value+=kind==='atk'?slot.tcgTempAtk||0:slot.tcgTempDef||0;
  if(slot.tempRound===duel.round&&kind==='atk')value+=slot.tempAtk||0;
  return Math.max(0,Math.round(value));
 }
 window.memeTcgEngine={handles:id=>active()&&handlers.has(id),resolveEffect:(n,c,ctx)=>handlers.get(c.id)(n,c,ctx),stat:statValue,onLeave,onSummon,attackProblem,payAttackFee,register,handlers,active,helpers:{effect,addTemp,chooseMany,returnToHand,isHero,isElemental,ownSlot}};
})();
