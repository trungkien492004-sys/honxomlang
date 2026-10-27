// Readable card states and attack controls at the selected card.
(() => {
 const down=slot=>!!slot&&(slot.faceDown===true||slot.position==='def_down');
 const available=()=>!duel||duel.finished||duel.turn!=='player'||duel.phase!=='BATTLE'?[]:window.memeRules.entries('player').filter(e=>canAttackSlot(e.slot));
 const remaining=slot=>window.memeAnime?window.memeAnime.attacksRemaining(slot):Math.max(0,(window.memeRules.trait(slot,'double_attack')?2:1)-(slot.attacksUsed||0));
 function stateText(slot,type){return down(slot)?type==='monster'||type==='extra'?'ÚP THỦ':'ÚP':type==='monster'||type==='extra'?slot.position==='atk'?'NGỬA CÔNG':'NGỬA THỦ':'NGỬA';}
 function decorate(node,name,type,index,slot){
  if(!slot){node.removeAttribute('data-face');node.removeAttribute('aria-label');node.classList.remove('attack-ready','attack-spent','attacking-selected','own-set-card','face-down');return;}
  const c=card(slot.id),isDown=down(slot),secret=name==='enemy'&&isDown,isMonster=['monster','extra'].includes(type),label=stateText(slot,type);
  node.dataset.face=isDown?'down':'up';node.classList.toggle('face-down',isDown);node.classList.toggle('own-set-card',isDown&&name==='player');
  if(secret){node.classList.remove('spell-card','trap-card');node.innerHTML='<span class="card-back-art" aria-hidden="true"><i>✦</i></span>';}
  else if(isDown){node.innerHTML=`<span class="card-back-art" aria-hidden="true"><i>✦</i></span>${artHTML(slot.id,'own-set-peek')}<span class="slot-label">${esc(c.name)}</span>${isMonster?`<span class="slot-stats">🛡${effectiveDef(name,slot)}</span>`:''}`;}
  node.querySelector('.face-state')?.remove();const chip=document.createElement('span');chip.className='face-state '+(isDown?'is-down':'is-up');chip.textContent=label;node.appendChild(chip);
  node.title=secret?'Bài úp của đối thủ · Nội dung được giữ kín':`${c.name} · ${label}${isDown?' · Chỉ bạn xem được nội dung':''} · ${c.description}`;
  node.setAttribute('aria-label',secret?`Bài úp của đối thủ, ${label}`:`${c.name}, ${label}${isDown?', chỉ bạn xem được nội dung':''}`);
  const ownBattle=name==='player'&&isMonster&&duel.turn==='player'&&duel.phase==='BATTLE'&&!duel.finished,canAttack=ownBattle&&canAttackSlot(slot),interactive=canAct()&&!duel.mode;
  const attacking=ownBattle&&duel.mode==='attack'&&duel.pending?.index===index&&!!duel.pending?.isExtra===(type==='extra'),selected=ownBattle&&duel.selected?.name===name&&duel.selected?.type===type&&(type==='extra'||duel.selected.index===index);
  node.classList.toggle('attack-ready',!!canAttack&&interactive);node.classList.toggle('attack-spent',ownBattle&&!isDown&&(slot.attacksUsed||0)>0&&!canAttack);
  node.classList.toggle('attacking-selected',ownBattle&&duel.mode==='attack'&&duel.pending?.index===index&&!!duel.pending?.isExtra===(type==='extra'));
  node.querySelector('.attack-cue')?.remove();node.querySelector('.attack-spent-label')?.remove();node.querySelector('.attack-card-actions')?.remove();node.classList.remove('attack-menu-open');
  if(canAttack&&(interactive||attacking)){const cue=document.createElement('span');cue.className='attack-cue';cue.setAttribute('aria-hidden','true');cue.innerHTML=`<svg viewBox="0 0 32 40" class="attack-sword"><path class="sword-blade" d="M16 2 22 10 19 27 13 27 10 10Z"/><path class="sword-edge" d="M16 4V27"/><path class="sword-hilt" d="M7 27H25V31H18V37H14V31H7Z"/></svg><small>${remaining(slot)}</small>`;node.appendChild(cue);node.setAttribute('aria-label',node.getAttribute('aria-label')+`, có thể tấn công, còn ${remaining(slot)} đòn`);}
  else if(node.classList.contains('attack-spent')){const done=document.createElement('span');done.className='attack-spent-label';done.textContent='✓ ĐÃ ĐÁNH';node.appendChild(done);}
  if(canAttack&&canAct()&&(selected&&interactive||attacking)){
   node.classList.add('attack-menu-open');node.setAttribute('role','group');
   const menu=document.createElement('div');menu.className='attack-card-actions';menu.setAttribute('role','group');menu.setAttribute('aria-label','Tấn công bằng '+c.name);
   const button=(text,action,disabled=false)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.disabled=disabled;b.addEventListener('click',event=>{event.stopPropagation();event.preventDefault();if(!canAct())return;const current=type==='extra'?side(name).extra:side(name).monsters[index];if(current!==slot)return;action();});menu.appendChild(b);return b;};
   if(!attacking)button('Tấn công',()=>declareAttack(index,type==='extra'));
   else if(window.memeAnime.directAllowed(name,slot))button('Đánh LP',()=>resolveAttack(null));
   else{const hint=document.createElement('span');hint.className='attack-target-hint';hint.textContent='Chọn mục tiêu';menu.appendChild(hint);}
   button('Hủy',()=>{if(duel.mode==='attack'){duel.mode=null;duel.pending=null;}duel.selected=null;render();});node.appendChild(menu);
  }else if(type==='monster')node.setAttribute('role','button');
 }
 const zones=renderZones;renderZones=function(name,type,host){zones(name,type,host);const slots=type==='monster'?side(name).monsters:side(name).spells;[...$(host).children].forEach((node,i)=>decorate(node,name,type,i,slots[i]));};
 const special=renderSpecial;renderSpecial=function(name,type,host){special(name,type,host);const slot=type==='extra'?side(name).extra:side(name).field;if(slot)decorate($(host),name,type,-1,slot);else{const node=$(host);if(!node)return;delete node.dataset.face;node.classList.remove('attack-ready','attack-spent','attacking-selected','own-set-card','face-down');node.removeAttribute('aria-label');}};
 const inspector=renderInspector;renderInspector=function(){
  inspector();
  const sel=duel?.selected;
  if(!sel||sel.type==='hand'||sel.name!=='player')return;
  const s=side(sel.name),slot=sel.type==='monster'?s.monsters[sel.index]:sel.type==='extra'?s.extra:sel.type==='spell'?s.spells[sel.index]:s.field;
  if(!slot)return;
  const text=down(slot)?'🂠 ĐANG ÚP · Chỉ bạn xem được nội dung':'◈ ĐANG NGỬA · Đối thủ xem được';
  const banner=document.createElement('span');
  banner.className='inspector-face-state '+(down(slot)?'is-down':'is-up');
  banner.textContent=text;
  $('cardInspector').querySelector('.inspect-description')?.prepend(banner);
  if(sel.type==='spell'&&down(slot)){
    const flip=[...document.querySelectorAll('#inspectActions button')].find(b=>b.textContent.includes('Lật Bẫy'));
    if(flip){flip.textContent='🂠 Bẫy tự lật khi đủ điều kiện';flip.disabled=true;}
  }
  if((sel.type==='monster'||sel.type==='extra')&&slot){
    const actions=$('inspectActions');
    if(actions&&canAct()&&!duel.mode){
      if(duel.phase==='BATTLE'){
        if(canAttackSlot(slot)){
          const btn=addAction(actions,'⚔️ Tấn công',()=>declareAttack(sel.index,sel.type==='extra'));
          btn.className='primary-btn attack-inspector-btn';
        }else{
          const btn=addAction(actions,'⚔️ Không thể tấn công',()=>window.showActionNotice(window.attackProblem(slot),'Chưa thể tấn công'),true);
          btn.className='secondary-btn btn-cant-attack';
        }
      }else{
        const btn=addAction(actions,'⚔️ Tấn công (Cần BATTLE Phase)',()=>{
          if(duel.round<=1)window.showActionNotice('Người đi trước không thể tấn công trong Lượt 1!');
          else window.showActionNotice('Hãy bấm "Sang chiến đấu" (Phase BATTLE) ở góc phải để tấn công!');
        },true);
        btn.className='secondary-btn btn-phase-locked';
      }
    }
  }
};
 function refresh(){
  if(!duel)return;
  for(const name of ['player','enemy'])for(const type of ['monster','spell']){const slots=type==='monster'?side(name).monsters:side(name).spells;[...$(name+(type==='monster'?'Monsters':'Spells')).children].forEach((node,i)=>decorate(node,name,type,i,slots[i]));}
  for(const name of ['player','enemy'])if(side(name).extra)decorate($(name+'Extra'),name,'extra',-1,side(name).extra);
  $('battleGuide')?.remove();
 }
 window.memeBattleUX={down,available,remaining,refresh};
})();
