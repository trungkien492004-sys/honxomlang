// The host alone rolls online; the mirrored snapshot carries the same result.
(() => {
 const DURATION=2800;let shown=null,timer=null;
 const now=()=>Date.now()+(window.memeOnlineIsPlaying?.()&&(memeRoom?.role==='guest'||window.memeAuthoritative?.active())?(memeRoom.clockOffset||0):0);
 function create(){const bit=crypto.getRandomValues(new Uint8Array(1))[0]&1;return {face:bit?'tails':'heads',first:bit?'enemy':'player',readyAt:Date.now()+DURATION};}
 const pending=()=>!!duel?.openingCoin&&now()<duel.openingCoin.readyAt;
 function clear(){clearTimeout(timer);timer=null;document.getElementById('openingCoinStage')?.remove();shown=null;}
 function show(){
  if(!duel?.openingCoin||duel.round!==1||!pending())return;
  if(shown===duel)return;
  clear();const match=duel;shown=match;const result=match.openingCoin,first=result.first==='player',names=window.memeOnlineNames?.(),winner=first?(names?.player||'Bạn'):(names?.enemy||'Máy');
  const stage=document.createElement('div');stage.id='openingCoinStage';stage.setAttribute('role','dialog');stage.setAttribute('aria-modal','true');stage.setAttribute('aria-labelledby','openingCoinTitle');
  stage.innerHTML=`<div class="opening-coin-panel"><h2 id="openingCoinTitle">Tung xu chọn lượt</h2><p>Ngửa: bạn đi trước · Sấp: đối thủ đi trước</p><div class="opening-coin ${result.face}" aria-hidden="true"><span>★</span></div><div class="opening-coin-result" role="status"><strong>${result.face==='heads'?'Mặt ngửa':'Mặt sấp'}</strong><b>${esc(winner)} đi lượt 1</b><p>${first?'Bạn đi lượt 1 · Đối thủ đi lượt 2':'Đối thủ đi lượt 1 · Bạn đi lượt 2'}</p><small>Lượt 1 không rút thêm bài và không được tấn công.</small></div></div>`;
  // The shared face is host-relative, while each screen labels its own turn.
  stage.querySelector('.opening-coin-panel>p').textContent=names?'Ngửa: chủ phòng đi trước · Sấp: khách đi trước':'Ngửa: bạn đi trước · Sấp: máy đi trước';
  document.body.appendChild(stage);
  const elapsed=Math.max(0,DURATION-(result.readyAt-now()));stage.style.setProperty('--coin-delay',`-${elapsed}ms`);
  timer=setTimeout(()=>{stage.remove();timer=null;if(duel!==match||duel.finished)return;render();if(!window.memeOnlineIsPlaying?.()&&duel.turn==='enemy')aiTimer=setTimeout(aiTurn,100);},Math.max(0,result.readyAt-now()));
 }
 window.memeOpening={create,pending,show,clear};
 const renderBefore=render;render=()=>{renderBefore();show();if(pending())$('nextPhaseBtn').disabled=true;};
 $('backBtn').addEventListener('click',clear);
})();
