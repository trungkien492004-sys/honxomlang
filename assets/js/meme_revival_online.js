// A revival owned by the other human asks that player for the position.
// Unconfirmed choices cancel and never pause the shared turn clock.
(() => {
 let pending=null,incoming=null;const allowed=c=>c&&(c.traits?.includes('chimera')||['anime_reborn','premature','de_fusion'].includes(c.effect_code));
 function clearIncoming(){if(!incoming)return;clearTimeout(incoming.timer);incoming=null;window.memeAnime?.cancelChoice();}
 function settle(position=null,close=true,abort=false){const p=pending;if(!p)return;pending=null;clearTimeout(p.timer);if(close&&memeRoom===p.room)memeSend('MEME_REVIVAL_POSITION_CLOSE',{targetId:p.room.peerId,requestId:p.id,round:p.round});p.resolve(abort?null:['atk','def'].includes(position)?position:null);}
 function request({sourceId,cardId}){if(!window.memeOnlineIsPlaying?.()||pending)return Promise.resolve(null);const room=memeRoom,round=duel.round,id=memeMyId()+'-revive-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),timeout=Math.max(0,Math.min(12000,window.memeTurnClock?.remaining()??12000));return new Promise(resolve=>{pending={room,round,id,resolve,timer:setTimeout(()=>settle(null),timeout)};memeSend('MEME_REVIVAL_POSITION_REQUEST',{targetId:room.peerId,requestId:id,round,sourceId,cardId,timeout});});}
 const receive=window.memeOnlineReceive;window.memeOnlineReceive=msg=>{const room=memeRoom,valid=room?.playing&&msg?.roomId===room.code&&msg.id===room.peerId&&msg.targetId===memeMyId();if(valid){
  if(msg.type==='MEME_ROOM_STATE'&&msg.state?.round>duel?.round){settle(null,true,true);clearIncoming();window.memeAnime.cancelChoice();window.memeFx?.skip();}
  if(msg.type==='MEME_REVIVAL_POSITION_RESULT'){if(pending?.id===msg.requestId&&pending.round===msg.round)settle(msg.position,false);return;}
  if(msg.type==='MEME_REVIVAL_POSITION_CLOSE'){if(incoming?.id===msg.requestId)clearIncoming();return;}
  if(msg.type==='MEME_REVIVAL_POSITION_REQUEST'){
   if(duel?.finished||duel?.turn!=='enemy'||msg.round!==duel.round||!allowed(card(msg.sourceId))||card(msg.cardId)?.card_type!=='Monster'||card(msg.cardId)?.uncollectible)return;
   if(incoming||window.memeAnime.choosing){memeSend('MEME_REVIVAL_POSITION_RESULT',{targetId:room.peerId,requestId:msg.requestId,round:msg.round,position:null});return;}
   const record={id:msg.requestId,round:msg.round,timer:null};incoming=record;record.timer=setTimeout(()=>{if(incoming===record)window.memeAnime.cancelChoice();},Math.min(12000,Math.max(0,Number(msg.timeout)||12000))+500);
   window.memeAnime.revivalPosition('player',card(msg.sourceId),msg.cardId,{remote:true}).then(position=>{if(incoming!==record)return;clearTimeout(record.timer);incoming=null;if(memeRoom===room&&duel?.round===record.round)memeSend('MEME_REVIVAL_POSITION_RESULT',{targetId:room.peerId,requestId:record.id,round:record.round,position:position||null});}).catch(error=>{clearIncoming();console.error('Revival position:',error);});return;
  }
 }return receive(msg);};
 const leave=window.memeOnlineLeave;window.memeOnlineLeave=()=>{settle(null,true,true);clearIncoming();return leave();};window.memeRevivalChoice={request,cancel:()=>settle(null),get pending(){return !!pending;},get incoming(){return !!incoming;}};
})();
