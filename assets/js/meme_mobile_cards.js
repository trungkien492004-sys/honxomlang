// Hand previews stay over the field, leaving the hand and action row available.
(() => {
 const media=matchMedia('(max-width:900px), (max-height:500px) and (max-width:1100px)');
 const selector='#hand>.card,.field-slot,.special-zone,#opponentHand>span,.deck-item,.pile-card,[data-related],#animeChoices .arcana-option';
 let press=null,suppressed=null,returnFocus=null;
 const bar=document.createElement('div');bar.id='mobileCardActions';bar.setAttribute('aria-label','Thao tác lá bài');document.querySelector('.duel-bottom').before(bar);
 const hint=document.createElement('small');hint.className='mobile-hold-hint';hint.textContent=' · Chạm bài để xem';document.querySelector('.hand-title>span').appendChild(hint);
 let previewKey=null,dismissedKey=null,previewRequested=false;
 function closeHandPreview(){document.getElementById('mobileHandPreview')?.remove();previewKey=null;}
 function syncHandPreview(){
  const sel=duel?.selected,id=sel?.name==='player'&&sel.type==='hand'?duel.player.hand[sel.index]:null;
  const key=id?`${sel.index}:${id}`:null;
  if(!previewRequested||!media.matches||!key||duel.finished||duel.mode||$('duel').classList.contains('hidden')){closeHandPreview();dismissedKey=null;return;}
  if(dismissedKey===key)return;
  if(previewKey===key&&$('mobileHandPreview'))return;
  closeHandPreview();const c=card(id),board=document.querySelector('.board-frame');if(!c||!board)return;
  previewKey=key;const panel=document.createElement('section');panel.id='mobileHandPreview';panel.setAttribute('aria-label','Thông tin bài trên tay');
  panel.innerHTML=`<header><h2>${esc(c.name)}</h2><button type="button" aria-label="Đóng thông tin bài">Đóng ✕</button></header><div class="mobile-hand-effect" tabindex="0">${c.card_type==='Monster'?`<p class="mobile-detail-stats">★ ${c.stars} · ATK ${c.atk} / DEF ${c.def}</p>`:''}<p>${esc(c.description||'Quái thường. Không có hiệu ứng.')}</p>${c.fusion_materials?`<p class="mobile-hand-materials">Nguyên liệu: ${esc(c.fusion_materials.map(id=>card(id)?.name||id).join(' + '))}</p>`:''}</div>`;
  panel.querySelector('button').onclick=()=>{dismissedKey=key;closeHandPreview();};board.appendChild(panel);
 }
 // Run after the card's normal click handler has selected it. No extra action is fired.
 document.addEventListener('click',event=>{if(!media.matches)return;if(event.target.closest('#hand>.card')&&!(suppressed&&Date.now()<suppressed.until)){dismissedKey=null;previewRequested=true;}},true);
 function syncActions(){bar.replaceChildren();bar.hidden=true;if(!media.matches)return;const buttons=[...document.querySelectorAll('#inspectActions>button')];if(!buttons.length)return;bar.hidden=false;for(const source of buttons){const button=document.createElement('button');button.type='button';button.className=source.className;button.textContent=source.textContent;button.disabled=source.disabled;button.title=source.title;button.onclick=()=>{previewRequested=false;closeHandPreview();if(source.isConnected&&!source.disabled)source.click();};bar.appendChild(button);}}
 function resolve(node){
  if(node.matches('#hand>.card'))return {id:duel?.player.hand[[...node.parentElement.children].indexOf(node)]};
  if(node.matches('#opponentHand>span'))return {hidden:true};
  if(node.matches('.field-slot')){const {side:name,zone:type,index}=node.dataset,slot=duel?.[name]?.[type==='monster'?'monsters':'spells']?.[Number(index)];return slot?name==='enemy'&&(slot.faceDown||slot.position==='def_down')?{hidden:true}:{id:slot.id,name,slot}:null;}
  if(node.matches('.special-zone')){const name=node.id.startsWith('enemy')?'enemy':'player',slot=duel?.[name]?.[node.id.endsWith('Extra')?'extra':'field'];return slot?name==='enemy'&&(slot.faceDown||slot.position==='def_down')?{hidden:true}:{id:slot.id,name,slot}:null;}
  if(node.dataset.cardId||node.dataset.related)return {id:node.dataset.cardId||node.dataset.related};
  if(node.matches('.arcana-option')){const label=node.querySelector('.art-surface')?.getAttribute('aria-label'),c=CARDS.find(c=>c.name===label);return c?{id:c.id}:{hidden:true};}
  return null;
 }
 function close(){const overlay=$('mobileCardDetail');if(!overlay)return;overlay.remove();suppressed=null;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;}
 function show(info){
  close();const c=card(info.id);if(!c&&!info.hidden)return;returnFocus=document.activeElement;
  const overlay=document.createElement('div');overlay.id='mobileCardDetail';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','mobileCardDetailTitle');
  const stat=c?.card_type==='Monster'?`<p class="mobile-detail-stats">★ ${c.stars} · ATK ${info.slot?effectiveAtk(info.name,info.slot):c.atk} / DEF ${info.slot?effectiveDef(info.name,info.slot):c.def}</p>`:'';
  overlay.innerHTML=`<section class="mobile-card-sheet"><header><h2 id="mobileCardDetailTitle">${info.hidden?'Bài đối thủ đang úp':esc(c.name)}</h2><button type="button" id="closeMobileCardDetail" aria-label="Đóng thông tin bài">Đóng ✕</button></header><div class="mobile-card-detail-body">${info.hidden?'<div class="mobile-hidden-card">🂠</div><p>Nội dung lá bài được giữ kín cho tới khi lật ngửa.</p>':`${artHTML(c.id,'mobile-detail-art')}<p class="mobile-detail-kind">${esc(c.monster_category||c.spell_category||c.trap_category||'')} · ${esc(c.tribe||c.card_type)}</p>${stat}<h3>Hiệu ứng</h3><p class="mobile-detail-effect">${esc(c.description||'Quái thường. Không có hiệu ứng.')}</p>${c.activation_rules?`<details><summary>Điều kiện sử dụng</summary><p>${esc(c.activation_rules)}</p></details>`:''}${c.fusion_materials?`<h3>Nguyên liệu Dung Hợp</h3><p>${esc(c.fusion_materials.map(id=>card(id)?.name||id).join(' + '))}</p>`:''}${c.card_type==='Trap'?`<h3>Bẫy trong H5</h3><p>Chỉ kích hoạt từ lượt sau khi úp. Bẫy tự phản ứng khi đủ điều kiện; bạn vẫn chọn mục tiêu và chi phí.${['dust_tornado','haunted','waboku'].includes(c.effect_code)?' Lá này cũng có thể chủ động kích hoạt trong lượt của bạn.':' Bẫy phản đòn vẫn cần đúng điều kiện ghi trên lá.'}</p>`:''}`}</div></section>`;
  overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('#closeMobileCardDetail'))close();});overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}if(e.key==='Tab'){e.preventDefault();$('closeMobileCardDetail').focus();}});document.body.appendChild(overlay);$('closeMobileCardDetail').focus({preventScroll:true});
 }
 function cancel(){if(press)clearTimeout(press.timer);press=null;}
 document.addEventListener('pointerdown',event=>{
  cancel();suppressed=null;if(!media.matches||event.button!==0||!event.isPrimary||$('mobileCardDetail'))return;const node=event.target.closest(selector);if(!node||event.target.closest('.deck-item-actions,.draft-minus,.attack-card-actions'))return;const info=resolve(node);if(!info?.id&&!info?.hidden)return;
  const record={node,info,id:event.pointerId,x:event.clientX,y:event.clientY,timer:null};press=record;record.timer=setTimeout(()=>{if(press!==record||!node.isConnected)return;const current=resolve(node);if(!current||current.id!==info.id||!!current.hidden!==!!info.hidden)return;suppressed={node,until:Date.now()+1400};show(current);},450);
 },true);
 document.addEventListener('pointermove',event=>{if(press&&(event.pointerId!==press.id||Math.hypot(event.clientX-press.x,event.clientY-press.y)>10))cancel();},{capture:true,passive:true});
 document.addEventListener('pointerup',()=>{if(suppressed)suppressed.until=Date.now()+1000;cancel();},true);document.addEventListener('pointercancel',cancel,true);window.addEventListener('blur',cancel);
 document.addEventListener('click',event=>{if(suppressed&&Date.now()<suppressed.until){event.preventDefault();event.stopImmediatePropagation();suppressed=null;}},true);
 document.addEventListener('contextmenu',event=>{if(media.matches&&event.target.closest(selector)){event.preventDefault();}},true);
 document.addEventListener('keydown',event=>{if(!$('mobileCardDetail'))return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}else if(event.key==='Tab'){event.preventDefault();event.stopImmediatePropagation();$('closeMobileCardDetail').focus();}},true);
 const inspector=renderInspector;renderInspector=()=>{inspector();syncActions();};
 const renderBefore=render;render=()=>{renderBefore();syncActions();syncHandPreview();};
 media.addEventListener('change',()=>{cancel();close();closeHandPreview();syncActions();});$('backBtn').addEventListener('click',()=>{cancel();close();closeHandPreview();});
 window.memeMobileCards={get active(){return media.matches;},close(){close();closeHandPreview();dismissedKey=null;previewRequested=false;}};
 syncActions();
})();
