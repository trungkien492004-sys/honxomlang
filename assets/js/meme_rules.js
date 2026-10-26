// Shared effect resolver. The UI, AI and online snapshot all use the same state.
(() => {
  const counterCodes = ['negate_attack','destroy_attacker','reflect_attack','weaken_attacker','destroy_attack_position'];
  const targetCodes=['destroy_monster_target','destroy_spell_target'];
  const supported = new Set(['draw_n','heal_n','burn_n','destroy_all_opponent_monsters','destroy_strongest','destroy_spell','bounce_strongest','revive','search_monster','search_spell','mill_n','discard_n','recover_grave','boost_all','weaken_all','freeze_all','shield_n','swap_stats','summon_tokens','equip_atk_n','equip_def_n','equip_pierce','equip_double','equip_lifesteal','continuous_tribe_boost','field_boost_all','continuous_heal','continuous_draw','continuous_burn',...counterCodes,'negate_spell']);
  let depth=0;
  targetCodes.forEach(code=>supported.add(code));
  function announce(name,c,targets=[]){duel.effectSerial=(duel.effectSerial||0)+1;duel.lastEffect={serial:duel.effectSerial,owner:name,cardId:c.id,targets:targets.map(e=>({name:e.name||other(name),type:e.type||(e.extra?'extra':'monster'),index:e.index}))};}
  function targetEntries(name,c){
    if(!c)return [];const foe=other(name);
    if(c.effect_code==='destroy_monster_target')return entries(foe).map(e=>({...e,name:foe,type:e.extra?'extra':'monster'}));
    if(c.effect_code==='destroy_spell_target'){const s=side(foe);return [...s.spells.map((slot,index)=>({slot,index,name:foe,type:'spell'})),{slot:s.field,index:-1,name:foe,type:'field'}].filter(e=>e.slot);}
    return [];
  }
  function entries(name){const s=side(name);return [...s.monsters.map((slot,index)=>({slot,index,extra:false})),{slot:s.extra,index:-1,extra:true}].filter(e=>e.slot);}
  function trait(slot,key){return !!slot&&(card(slot.id)?.traits?.includes(key)||slot[key]===true);}
  function stat(name,slot,kind='atk'){
    if(!slot)return 0;const c=card(slot.id);if(!c)return 0;
    let value=Number(c[slot.swapped?(kind==='atk'?'def':'atk'):kind])||0;
    value+=kind==='atk'?(slot.equip||0)+(slot.tempRound===duel.round?(slot.tempAtk||0):0):(slot.equipDef||0);
    if(kind==='atk')for(const permanent of [...side(name).spells,side(name).field]){
      if(!permanent||permanent.faceDown)continue;const p=card(permanent.id);
      if(p?.effect_code==='field_boost_all'||p?.effect_code==='continuous_tribe_boost'&&p.target_tribe===c.tribe)value+=p.effect_value||0;
    }
    return Math.max(0,value);
  }
  function strongest(name,predicate=()=>true){return entries(name).filter(e=>predicate(e.slot)).sort((a,b)=>stat(name,b.slot)-stat(name,a.slot))[0]||null;}
  function remove(name,entry,reason='effect'){
    if(!entry?.slot)return false;const {slot,index,extra}=entry;
    if(reason==='battle'&&trait(slot,'battle_resist')&&slot.protectedRound!==duel.round){slot.protectedRound=duel.round;log(`🛡️ ${card(slot.id).name} chặn một lần phá hủy trong chiến đấu.`);return false;}
    if(extra)side(name).extra=null;else side(name).monsters[index]=null;
    putGrave(name,slot);
    const c=card(slot.id);if(!slot.token&&c?.effect_trigger==='on_destroy')execute(name,c,{sourceId:c.id});
    return true;
  }
  function damage(name,amount){
    const s=side(name);amount=Math.max(0,Math.round(amount));const blocked=Math.min(s.shield||0,amount);s.shield=(s.shield||0)-blocked;
    if(blocked)log(`💎 Khiên của ${name==='player'?'bạn':'đối thủ'} hấp thụ ${blocked} sát thương.`);
    const actual=Math.min(Math.max(0,s.lp),amount-blocked);s.lp=Math.max(0,s.lp-actual);return actual;
  }
  function heal(name,amount){const s=side(name);s.lp=Math.min(8000,s.lp+Math.max(0,amount));}
  function canExecute(name,c){
    const code=c.effect_code,self=side(name),foe=other(name);
    if(targetCodes.includes(code))return targetEntries(name,c).length>0;
    if(['destroy_strongest','bounce_strongest','freeze_all','weaken_all','destroy_all_opponent_monsters'].includes(code))return entries(foe).length>0;
    if(code==='destroy_spell')return side(foe).spells.some(Boolean)||!!side(foe).field;
    if(code==='revive')return self.monsters.includes(null)&&self.grave.some(id=>card(id)?.card_type==='Monster'&&card(id).stars<=4);
    if(code==='search_monster')return self.deck.some(id=>card(id)?.card_type==='Monster'&&card(id).stars<=4);
    if(code==='search_spell')return self.deck.some(id=>card(id)?.card_type==='Spell');
    if(code==='recover_grave')return self.grave.some(id=>id!==c.id&&card(id)?.card_type==='Spell');
    if(['swap_stats','boost_all'].includes(code)||code?.startsWith('equip_'))return entries(name).length>0;
    if(code==='summon_tokens')return self.monsters.includes(null);
    if(code==='discard_n')return side(foe).hand.length>0;
    if(code==='mill_n')return side(foe).deck.length>0;
    return true;
  }
  function execute(name,c,context={}){
    if(!c?.effect_code||depth>12||!duel||duel.finished)return;
    depth++;
    try{
      const self=side(name),foe=side(other(name)),amount=c.effect_value||0,code=c.effect_code;
      if(targetCodes.includes(code)){
        const targets=targetEntries(name,c),picked=context.target?targets.find(e=>e.name===context.target.name&&e.type===context.target.type&&e.index===context.target.index):code==='destroy_monster_target'?targets.sort((a,b)=>stat(other(name),b.slot)-stat(other(name),a.slot))[0]:targets[0];
        if(!picked)return;announce(name,c,[picked]);
        if(code==='destroy_monster_target')remove(other(name),{slot:picked.slot,index:picked.index,extra:picked.type==='extra'});
        else{putGrave(other(name),picked.slot);if(picked.type==='field')foe.field=null;else foe.spells[picked.index]=null;}
        log(`💥 ${c.name} phá hủy ${card(picked.slot.id).name}!`);checkWin();return;
      }
      const destructive=code==='destroy_all_opponent_monsters'?entries(other(name)):code==='destroy_strongest'?[strongest(other(name))].filter(Boolean):[];
      if(c.card_type!=='Monster'||destructive.length)announce(name,c,destructive);
      if(code==='draw_n')for(let i=0;i<amount&&!duel.finished;i++)draw(name);
      else if(code==='heal_n')heal(name,amount);
      else if(code==='burn_n')damage(other(name),amount);
      else if(code==='shield_n')self.shield=(self.shield||0)+amount;
      else if(code==='destroy_all_opponent_monsters')for(const e of entries(other(name)))remove(other(name),e);
      else if(code==='destroy_strongest')remove(other(name),strongest(other(name)));
      else if(code==='destroy_spell'){
        const i=foe.spells.findIndex(Boolean);if(i>=0){putGrave(other(name),foe.spells[i]);foe.spells[i]=null;}else if(foe.field){putGrave(other(name),foe.field);foe.field=null;}
      }else if(code==='bounce_strongest'){
        const e=strongest(other(name));if(e){if(!e.slot.token){if(isExtraCard(e.slot.id))foe.extraDeck.push(e.slot.id);else foe.hand.push(e.slot.id);}if(e.extra)foe.extra=null;else foe.monsters[e.index]=null;}
      }else if(code==='revive'){
        const free=self.monsters.indexOf(null);const candidates=self.grave.map((id,index)=>({id,index,c:card(id)})).filter(x=>x.c?.card_type==='Monster'&&x.c.stars<=4).sort((a,b)=>b.c.atk-a.c.atk);
        if(free>=0&&candidates.length){const x=candidates[0];self.grave.splice(x.index,1);self.monsters[free]=monsterSlot(x.id,'def');}
      }else if(code==='search_monster'||code==='search_spell'){
        let candidates=self.deck.map((id,index)=>({id,index,c:card(id)})).filter(x=>code==='search_spell'?x.c?.card_type==='Spell':x.c?.card_type==='Monster'&&x.c.stars<=4);
        if(code==='search_monster')candidates.sort((a,b)=>b.c.atk-a.c.atk);
        if(candidates.length){const x=candidates[0];self.deck.splice(x.index,1);self.hand.push(x.id);self.deck=shuffle(self.deck);}
      }else if(code==='mill_n')for(let i=0;i<amount&&foe.deck.length;i++)foe.grave.push(foe.deck.shift());
      else if(code==='discard_n')for(let i=0;i<amount&&foe.hand.length;i++){let best=0;foe.hand.forEach((id,j)=>{if((card(id)?.atk||0)>(card(foe.hand[best])?.atk||0))best=j;});foe.grave.push(foe.hand.splice(best,1)[0]);}
      else if(code==='recover_grave'){
        const i=self.grave.findLastIndex(id=>id!==c.id&&card(id)?.card_type==='Spell');if(i>=0)self.hand.push(self.grave.splice(i,1)[0]);
      }else if(code==='boost_all'||code==='weaken_all'){
        const target=code==='boost_all'?name:other(name);for(const e of entries(target)){e.slot.tempAtk=(e.slot.tempRound===duel.round?e.slot.tempAtk||0:0)+(code==='boost_all'?amount:-amount);e.slot.tempRound=duel.round;}
      }else if(code==='freeze_all')for(const e of entries(other(name)))e.slot.frozenUntil=duel.round+1;
      else if(code==='swap_stats'){const e=strongest(name);if(e)e.slot.swapped=!e.slot.swapped;}
      else if(code==='summon_tokens')for(let i=0;i<amount;i++){const free=self.monsters.indexOf(null);if(free<0)break;self.monsters[free]={...monsterSlot('linh_gac_giay','def'),token:true};}
      log(`✦ ${c.name}: ${code==='shield_n'?`khiên +${amount}`:code==='heal_n'?`hồi ${amount} LP`:code==='burn_n'?`${amount} sát thương`:code==='draw_n'?`rút ${amount} lá`:'hiệu ứng đã xử lý'}.`);
      checkWin();
    }finally{depth--;}
  }
  function equip(slot,c){
    if(c.effect_code==='equip_def_n')slot.equipDef=(slot.equipDef||0)+c.effect_value;
    else if(c.effect_code==='equip_pierce')slot.piercing=true;
    else if(c.effect_code==='equip_double')slot.double_attack=true;
    else if(c.effect_code==='equip_lifesteal')slot.lifesteal=true;
    else slot.equip=(slot.equip||0)+(c.effect_value||0);
  }
  function canAttack(slot){return !!slot&&slot.position==='atk'&&(slot.frozenUntil??-1)<duel.round&&(slot.attacksUsed||0)<(trait(slot,'double_attack')?2:1)&&(!slot.attacked||trait(slot,'double_attack')&&(slot.attacksUsed||0)<2);}
  function beginTurn(name){
    for(const e of entries(name)){e.slot.attacked=false;e.slot.attacksUsed=0;}
    for(const p of [...side(name).spells,side(name).field]){
      if(!p||p.faceDown||duel.finished)continue;const c=card(p.id);if(!c)continue;
      const code={continuous_heal:'heal_n',continuous_draw:'draw_n',continuous_burn:'burn_n'}[c.effect_code];
      if(code)execute(name,{...c,effect_code:code});
    }
    for(const e of entries(name)){const c=card(e.slot.id);if(c?.effect_trigger==='on_turn_start')execute(name,c);}
  }
  function negateSpell(name){
    const s=side(other(name));const i=s.spells.findIndex(p=>p?.faceDown&&p.setRound<duel.round&&card(p.id)?.effect_code==='negate_spell');
    if(i<0)return false;const trap=s.spells[i];announce(other(name),card(trap.id));s.spells[i]=null;s.grave.push(trap.id);log(`🔒 ${card(trap.id).name} vô hiệu hóa Phép!`);return true;
  }
  function counter(defender,attackerSide,index,extra){
    const s=side(defender),i=s.spells.findIndex(p=>p?.faceDown&&p.setRound<duel.round&&counterCodes.includes(card(p.id)?.effect_code));
    if(i<0)return false;const trap=s.spells[i],c=card(trap.id);s.spells[i]=null;s.grave.push(trap.id);log(`🚨 ${c.name} phản đòn!`);
    const slot=extra?side(attackerSide).extra:side(attackerSide).monsters[index];
    const victims=c.effect_code==='destroy_attack_position'?entries(attackerSide).filter(e=>e.slot.position==='atk'):[{slot,index,extra}].filter(e=>e.slot);
    announce(defender,c,victims);
    if(c.effect_code==='destroy_attack_position')for(const entry of victims)remove(attackerSide,entry);
    if(c.effect_code==='destroy_attacker')remove(attackerSide,{slot,index,extra});
    if(c.effect_code==='reflect_attack'){damage(attackerSide,c.effect_value);checkWin();}
    if(c.effect_code==='weaken_attacker'&&slot){slot.tempAtk=(slot.tempRound===duel.round?slot.tempAtk||0:0)-c.effect_value;slot.tempRound=duel.round;return false;}
    return true;
  }
  function aiSpecialSummon(name){
    const s=side(name);
    for(const id of [...s.extraDeck,...s.hand.filter(id=>card(id)?.monster_category==='Nghi Lễ')]){
      const c=card(id);if(!['Đồng Bộ','Nghi Lễ'].includes(c?.monster_category))continue;
      const pool=s.monsters.map((slot,index)=>({slot,index,extra:false})).filter(e=>e.slot).sort((a,b)=>card(b.slot.id).stars-card(a.slot.id).stars);
      let chosen=[];
      if(c.monster_category==='Đồng Bộ'){
        chosen=synchroOptions(name,id)[0];if(!chosen)continue;
      }else{
        const req=c.ritual_requirement;if(!req||!s.hand.includes(req.spellId))continue;let total=0;for(const e of pool){chosen.push(e);total+=card(e.slot.id).stars;if(total>=req.minStars)break;}if(total<req.minStars)continue;
        s.hand.splice(s.hand.indexOf(req.spellId),1);s.grave.push(req.spellId);if(negateSpell(name))return;
      }
      const free=s.monsters.findIndex((slot,i)=>!slot||chosen.some(e=>!e.extra&&e.index===i));if(free<0)continue;
      chosen.forEach(e=>{putGrave(name,e.slot);if(e.extra)s.extra=null;else s.monsters[e.index]=null;});if(isExtraCard(id))s.extraDeck.splice(s.extraDeck.indexOf(id),1);else s.hand.splice(s.hand.indexOf(id),1);
      s.monsters[free]={...monsterSlot(id),properlySummoned:true};
      log(`🌀 Đối thủ triệu hồi đặc biệt ${c.name}!`);if(c.effect_trigger==='on_summon')execute(name,c);break;
    }
  }
  window.memeRules={supported,entries,trait,stat,remove,damage,heal,execute,canExecute,equip,canAttack,beginTurn,negateSpell,counter,aiSpecialSummon,targetCodes,targetEntries,counterCodes:[...counterCodes,'negate_spell']};
})();
