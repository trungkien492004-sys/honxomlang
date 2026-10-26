// One shared deadline for the whole online turn. The host resolves timeouts.
(() => {
 const LIMIT=60000;let forcing=null,requested=null;
 const online=()=>!!window.memeOnlineIsPlaying?.()&&duel&&!duel.finished;
 const now=()=>Date.now()+(memeRoom?.role==='guest'?(memeRoom.clockOffset||0):0);
 function start(){if(!online())return;if(!duel.turnClock||duel.turnClock.round!==duel.round){const at=Math.max(now(),duel.round===1?(duel.openingCoin?.readyAt||0):0);duel.turnClock={round:duel.round,startedAt:at,deadline:at+LIMIT,ownerId:duel.turn==='player'?memeMyId():memeRoom.peerId};}return duel.turnClock;}
 const remaining=()=>window.memeAuthoritative?.active()?window.memeAuthoritative.remaining():online()&&duel.turnClock?Math.min(LIMIT,Math.max(0,duel.turnClock.deadline-now())):LIMIT;
 const expired=()=>!!online()&&duel.turn==='player'&&remaining()<=0;
 function paint(){let node=$('turnClock');if(!node){const host=document.querySelector('.field-divider');if(!host)return;node=document.createElement('span');node.id='turnClock';node.setAttribute('role','timer');host.appendChild(node);}node.hidden=!online();if(node.hidden)return;const seconds=Math.ceil(remaining()/1000);node.textContent=`⏱ ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;node.classList.toggle('clock-urgent',seconds<=10);node.classList.toggle('clock-enemy',duel.turn==='enemy');node.setAttribute('aria-label',`${duel.turn==='player'?'Lượt của bạn':'Lượt đối thủ'} còn ${seconds} giây`);node.title='60 giây cho toàn bộ lượt · Hết giờ tự kết thúc lượt';if(!seconds)$('nextPhaseBtn').disabled=true;}
 async function timeout(){const match=duel,n=duel.turn;window.memeAnime.cancelChoice();closeModal();duel.mode=null;duel.pending=null;duel.selected=null;
  return window.memeAnime.perform(async()=>{log(`⌛ Hết 60 giây: ${n==='player'?'bạn':'đối thủ'} tự kết thúc lượt.`);await window.memeAnime.endTurn(n);if(duel!==match||duel.finished)return;duel.turn=other(n);duel.phase='MAIN1';duel.round++;duel.normalSummoned=false;start();if(duel.turn==='player'){window.memeRules.beginTurn('player');await window.memeAnime.fx('player',null,'draw',[],()=>draw('player'),{title:'Lượt của bạn',text:'Rút 1 lá từ Deck.'});}});
 }
 function tick(){if(window.memeAuthoritative?.active()){window.memeAuthoritative.tick();return Promise.resolve(false);}if(forcing){paint();if(remaining()<=0)window.memeFx?.skip();return forcing;}if(!online()){paint();return Promise.resolve(false);}start();paint();if(remaining()>0)return Promise.resolve(false);
  // Cancelling pending choices also unblocks actions waiting on a player's modal.
  window.memeAnime.cancelChoice();window.memeDecision?.cancel();window.memeRevivalChoice?.cancel();window.memeFx?.skip();
  if(memeRoom.role!=='host'){if(requested!==duel.turnClock.deadline){requested=duel.turnClock.deadline;memeSend('MEME_TURN_TIMEOUT',{targetId:memeRoom.peerId,round:duel.round});}return Promise.resolve(false);}
  if(forcing)return forcing;if(window.memeAnime.busy||window.memeFx?.busy)return Promise.resolve(false);
  forcing=Promise.resolve().then(timeout).finally(()=>{forcing=null;paint();});return forcing;
 }
 const renderBefore=render;render=()=>{start();renderBefore();paint();};
 const receive=window.memeOnlineReceive;window.memeOnlineReceive=msg=>{if(memeRoom&&msg?.roomId===memeRoom.code&&msg.targetId===memeMyId()&&msg.id===memeRoom.peerId){if(memeRoom.role==='guest'&&Number.isFinite(msg.sentAt))memeRoom.clockOffset=msg.sentAt-Date.now();if(msg.type==='MEME_TURN_TIMEOUT'){if(memeRoom.role==='host'&&msg.round===duel?.round)return tick();return;}}return receive(msg);};
 window.memeTurnClock={start,tick,paint,remaining,expired,get forcing(){return !!forcing;},limitMs:LIMIT};
 setInterval(()=>{tick().catch(error=>console.error('Turn clock:',error));},250);
 document.addEventListener('visibilitychange',()=>{tick().catch(error=>console.error('Turn clock:',error));});
 window.addEventListener('focus',()=>{tick().catch(error=>console.error('Turn clock:',error));});
})();
