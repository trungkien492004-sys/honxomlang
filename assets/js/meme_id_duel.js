// Saved opponent profiles, direct challenges, and client-side challenge results.
(() => {
 if(!document.getElementById('lobby')||!window.siteIdentity)return;
 const identity=window.siteIdentity;let store=null,uid=null,unsub=null,timer=null,saving=null,lastSaved='',pending=null,incoming=null,generation=0,lastDirectory='';
 const stamp=()=>{try{const s=store||identity?.db||window.parent?.siteIdentity?.db;if(s&&typeof firebase!=='undefined'&&firebase.firestore?.FieldValue?.serverTimestamp)return firebase.firestore.FieldValue.serverTimestamp();if(typeof parent!=='undefined'&&parent.firebase?.firestore?.FieldValue?.serverTimestamp)return parent.firebase.firestore.FieldValue.serverTimestamp();if(typeof firebase!=='undefined'&&firebase.firestore?.FieldValue?.serverTimestamp)return firebase.firestore.FieldValue.serverTimestamp();}catch{}return null;};
 const native=v=>{try{return parent.JSON.parse(JSON.stringify(v));}catch{return JSON.parse(JSON.stringify(v));}};
 const stamped=v=>Object.assign(native(v),{lastSeen:stamp()});
 const ms=t=>typeof t?.toMillis==='function'?t.toMillis():typeof t==='string'?Date.parse(t)||0:Number(t)||0;
 const valid=p=>p&&Array.isArray(p.main)&&Array.isArray(p.extra)&&!deckProblem(p.main,p.extra)&&validHero(p.heroId);
 const online=p=>p?.online===true&&Date.now()-ms(p.lastSeen)<90000;
 const busy=()=>!!memeRoom||!!duel&&!duel.finished&&!$('duel').classList.contains('hidden');
 function error(e){const n=$('idDuelError');if(n)n.textContent=e.message||'Không kết nối được. Hãy thử lại.';else notify(e.message||'Không kết nối được.');}
 async function publish(force=false){
  if(!uid||!store)return;const p={uid,name:String(identity.user?.displayName||'Đấu sĩ').slice(0,48),main:[...deckList],extra:[...extraDeckList],heroId:chosenHero,networkId:memeMyId(),online:true,busy:busy(),protocol:MEME_RULES_VERSION};
  if(!valid(p))throw Error('Bộ bài đang dùng chưa hợp lệ.');const key=JSON.stringify(p);if(!force&&lastSaved===key)return;if(saving){await saving;if(uid)return publish(force);return;}
  const owner=uid; const created=Date.parse(identity.user?.metadata?.creationTime),directory={uid:owner,name:p.name,newbieUntil:Number.isFinite(created)?created+7*86400000:0,online:true},directoryKey=JSON.stringify(directory);saving=Promise.all([store.doc('duel_players/'+owner).set(stamped(p)),...(lastDirectory===directoryKey?[]:[store.doc('duel_directory/'+owner).set(Object.assign(native(directory),{lastSeen:stamp(),updatedAt:stamp()})).then(()=>{lastDirectory=directoryKey;})])]);try{await saving;if(uid===owner)lastSaved=key;}finally{saving=null;}
 }
 function label(){$('duelPlayerId')?.remove();}
 function stopPending(){pending?.unsub?.();if(pending?.timer)clearTimeout(pending.timer);pending=null;}
 async function cancelInvite(){const old=pending;stopPending();if(old)await store.doc('duel_invites/'+old.id).update(native({status:'cancelled'})).catch(()=>{});window.memeOnlineLeave();closeModal();}
  function updateResultUI(receipt){
    const host=$('modalContent');if(!host||!receipt)return;
    host.querySelector('.rank-challenge-result')?.remove();
    const note=document.createElement('p');note.className='rank-challenge-result';
    note.textContent=`BXH đã cập nhật: ${receipt.outcome==='win'?'Thắng':receipt.outcome==='loss'?'Thua':'Hòa'} · ${receipt.delta>0?'+':''}${receipt.delta} Elo (${receipt.ratingAfter} Elo) · ${receipt.wins} thắng / ${receipt.losses} thua`;
    const actions=host.querySelector('.result-actions');if(actions)host.insertBefore(note,actions);else host.appendChild(note);
   }
   async function recordResult(match){
    const currentUid=uid||identity?.user?.uid||window.parent?.siteIdentity?.user?.uid;
    const currentStore=store||identity?.db||window.parent?.siteIdentity?.db;
    const currentIdentity=(identity?.user?identity:(window.parent?.siteIdentity||identity));
    const rawMatchId=match?.rankChallengeId||memeRoom?.challengeId,opponentUid=match?.rankChallengeOpponentUid||memeRoom?.rankOpponentUid||match?.ghostOpponent?.uid;
    if(!match?.finished||!rawMatchId||!opponentUid||opponentUid===currentUid||!currentUid||!currentStore)return null;
    const isBot=String(opponentUid).startsWith('bot-');
    const matchId=String(rawMatchId).slice(0,75);
    const resultId=matchId+'_'+currentUid,resultRef=currentStore.doc('rank_challenge_results/'+resultId),mineRef=currentStore.doc('rank_profiles/'+currentUid);
    const opponentRef=isBot?null:currentStore.doc('rank_profiles/'+opponentUid),directoryRef=isBot?null:currentStore.doc('duel_directory/'+opponentUid);let receipt=null;
    await currentStore.runTransaction(async tx=>{
     const reads=[tx.get(resultRef),tx.get(mineRef)];
     if(opponentRef&&directoryRef)reads.push(tx.get(opponentRef),tx.get(directoryRef));
     const [prior,mineSnap,opponentSnap,directorySnap]=await Promise.all(reads);
     if(prior.exists){receipt=prior.data();return;}
     const mine=mineSnap.exists?mineSnap.data():{},opponent=opponentSnap?.exists?opponentSnap.data():{},directory=directorySnap?.exists?directorySnap.data():{};
     const rating=Math.max(0,Math.round(Number(mine.rating)||1000)),opponentRating=isBot?1000:Math.max(0,Math.round(Number(opponent.rating)||1000));
     const outcome=match.winner==='draw'?'draw':match.winner==='player'?'win':'loss';
     const ownCreated=Date.parse(currentIdentity?.user?.metadata?.creationTime),ownNewbie=Number.isFinite(ownCreated)&&Date.now()<ownCreated+7*86400000;
     const opponentNewbie=isBot?false:(Date.now()<Number(directory.newbieUntil||opponent.newbieUntil||0));
     let delta=0;
     if(outcome!=='draw'){
      const winnerRating=outcome==='win'?rating:opponentRating,loserRating=outcome==='win'?opponentRating:rating;
      const base=Math.max(1,Math.round(32*(1-1/(1+10**((loserRating-winnerRating)/400)))));
      delta=outcome==='win'?(ownNewbie?base*2:opponentNewbie?1:base):(ownNewbie?0:-Math.min(base,rating));
     }
     const counts={played:(Number(mine.played)||0)+1,wins:(Number(mine.wins)||0)+(outcome==='win'?1:0),losses:(Number(mine.losses)||0)+(outcome==='loss'?1:0),draws:(Number(mine.draws)||0)+(outcome==='draw'?1:0)};
     const nextRating=Math.max(0,Math.round(rating+delta)),createdUntil=Number.isFinite(ownCreated)?ownCreated+7*86400000:0;
     const result={uid:currentUid,matchId,opponentUid,outcome,delta,ratingBefore:rating,ratingAfter:nextRating,createdAt:stamp()};
     const profile={uid:currentUid,name:String(currentIdentity?.user?.displayName||mine.name||'Đấu sĩ').slice(0,48),rating:nextRating,...counts,lastMatchId:matchId,lastSeen:stamp(),...(!mineSnap.exists?{newbieUntil:createdUntil}:{})};
     tx.set(resultRef,result);tx.set(mineRef,profile,{merge:true});receipt={...result,...counts};
    });
    if(receipt){match.rankChallengeResult=receipt;window.siteRank?.refresh?.();updateResultUI(receipt);}
    return receipt;
   }
   function trackResult(match){if(!match?.rankChallengeId&&!memeRoom?.challengeId)return;recordResult(match).catch(e=>{console.error('Không cập nhật được kết quả khiêu chiến:',e);notify('Không lưu được kết quả BXH. Hãy giữ màn hình mở và thử tải lại trang.');});}
  const finishDuel=finish;finish=(...args)=>{const match=duel,result=finishDuel(...args);trackResult(match);return result;};
  const showDuelResult=window.memeShowResult;window.memeShowResult=(...args)=>{const result=showDuelResult?.(...args);trackResult(duel);return result;};
 async function invite(p){
  if(!memeParent()||!memeMyId())throw Error('Hãy mở đấu bài từ trang chính để nhận lời mời online.');await publish(true);if(p.protocol!==MEME_RULES_VERSION)throw Error('Hai người cần tải lại game để dùng cùng phiên bản.');if(p.busy)throw Error('Người này đang trong trận đấu. Hãy thử lại sau.');
   await cancelInvite();const roomId='ID-'+crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase(),id=uid+'_'+p.uid,nonce=crypto.randomUUID();memeHostRoom(roomId);memeRoom.peerId=p.networkId;memeRoom.peerName=p.name;memeRoom.challengeId=nonce;memeRoom.rankOpponentUid=p.uid;
  try{await store.doc('duel_invites/'+id).set(Object.assign(native({from:uid,to:p.uid,nonce,roomId,status:'pending'}),{createdAt:stamp(),expiresAt:new parent.Date(Date.now()+60000)}));}catch(e){window.memeOnlineLeave();showModal('<h2>Không gửi được lời mời</h2><p>'+esc(e.message)+'</p><button type="button" class="secondary-btn" id="idRetryInvite">Quay lại</button>');$('idRetryInvite').onclick=()=>window.siteRank?.show();throw e;}
  pending={id,nonce,timer:null,unsub:null};showModal('<h2>Đã gửi lời mời</h2><p>Đang chờ '+esc(p.name)+' nhận lời (60 giây).</p><p id="idInviteStatus"></p><button type="button" class="secondary-btn" id="idCancelInvite">Hủy lời mời</button>');$('idCancelInvite').onclick=cancelInvite;
  pending.unsub=store.doc('duel_invites/'+id).onSnapshot(s=>{const v=s.data();if(!v||v.nonce!==nonce||!pending)return;if(v.status==='declined'){$('idInviteStatus')&&($('idInviteStatus').textContent='Đối thủ đã từ chối.');window.memeOnlineLeave();stopPending();}else if(v.status==='accepted'){if($('idInviteStatus'))$('idInviteStatus').textContent='Đã nhận lời. Đang kết nối phòng…';}},error);
  pending.timer=setTimeout(()=>{if(pending?.nonce===nonce){cancelInvite();notify('Lời mời hết hạn. Bạn có thể gửi lại.');}},60000);
 }
 async function showIncoming(id,v){
  if(incoming||busy()||ms(v.expiresAt)<=Date.now())return;const snap=await store.doc('duel_players/'+v.from).get(),p=snap.data();if(!snap.exists||!p||incoming||busy())return;
  incoming={id,nonce:v.nonce};const box=document.createElement('section');box.id='directDuelInvite';box.className='direct-duel-invite';box.setAttribute('role','dialog');box.setAttribute('aria-label','Lời mời đấu');box.innerHTML='<h3>Lời mời đấu bài</h3><p>'+esc(p.name)+' muốn đấu với bạn.</p><button type="button" class="primary-btn" id="idAcceptInvite">Nhận lời</button><button type="button" class="secondary-btn" id="idDeclineInvite">Từ chối</button><p class="id-invite-error" role="status"></p>';document.body.appendChild(box);
  const clear=()=>{if(incoming?.nonce===v.nonce)incoming=null;box.remove();};
   const respond=async accept=>{for(const b of box.querySelectorAll('button'))b.disabled=true;try{if(accept&&(busy()||p.protocol!==MEME_RULES_VERSION))throw Error('Bạn đang bận hoặc hai người khác phiên bản.');await publish(true);await store.runTransaction(async tx=>{const ref=store.doc('duel_invites/'+id),latest=(await tx.get(ref)).data();if(!latest||latest.nonce!==v.nonce||latest.status!=='pending'||ms(latest.expiresAt)<=Date.now())throw Error('Lời mời đã hết hạn hoặc bị hủy.');tx.update(ref,native({status:accept?'accepted':'declined'}));});if(accept){memeJoinRoom(v.roomId);memeRoom.peerId=p.networkId;memeRoom.peerName=p.name;memeRoom.challengeId=v.nonce;memeRoom.rankOpponentUid=p.uid;}clear();}catch(e){box.querySelector('.id-invite-error').textContent=e.message;for(const b of box.querySelectorAll('button'))b.disabled=false;}};
  box.querySelector('#idAcceptInvite').onclick=()=>respond(true);box.querySelector('#idDeclineInvite').onclick=()=>respond(false);setTimeout(clear,Math.max(0,ms(v.expiresAt)-Date.now()));
 }
 async function lookup(value){if(!uid)throw Error('Hãy đăng nhập Google.');const id=String(value||'').trim();if(!/^[A-Za-z0-9_-]{1,128}$/.test(id))throw Error('Không tìm thấy người chơi.');if(id===uid)throw Error('Bạn không thể khiêu chiến chính mình.');await publish();const snap=await store.doc('duel_players/'+id).get();if(!snap.exists)throw Error('Người này chưa lưu bộ bài. Hãy nhờ họ mở đấu bài một lần.');const p=snap.data();if(!valid(p))throw Error('Bộ bài của người này chưa hợp lệ với phiên bản hiện tại.');return p;}
 function ghost(p){if(!valid(p))throw Error('Bộ bài không hợp lệ.');startGame({ghost:p});}
  async function challenge(id){
    if(!identity.user){await identity.login();await identity.whenReady;}if(busy())throw Error('Hãy kết thúc hoặc rời trận hiện tại trước khi khiêu chiến.');const p=await lookup(id);if(online(p))return invite(p);ghost(p);
  }
  const baseStartGame=startGame;startGame=(options={})=>{
    const res=baseStartGame(options);
    if(duel){
      if(options?.ghost){
        duel.rankChallengeId='offline-'+crypto.randomUUID().replaceAll('-','');
        duel.rankChallengeOpponentUid=options.ghost.uid;
      }else if(!duel.rankChallengeId){
        const botGroup=(typeof HEROES!=='undefined'&&HEROES[duel.enemy?.heroId]?.group||'kaiba').toLowerCase();
        duel.rankChallengeId='bot-'+crypto.randomUUID().replaceAll('-','');
        duel.rankChallengeOpponentUid='bot-'+botGroup;
        duel.botOpponent={uid:duel.rankChallengeOpponentUid,name:typeof HEROES!=='undefined'&&HEROES[duel.enemy?.heroId]?.name||'Seto Kaiba'};
      }
    }
    return res;
  };
 const rank=$('rankPlayBtn');if(rank)rank.remove();$('playBtn').textContent='⚔️ Vào trận';
 const save=commitDeckDraft;commitDeckDraft=(...args)=>{const r=save(...args);publish().catch(error);return r;};
 const hero=chooseHero;chooseHero=(...args)=>{const r=hero(...args);publish().catch(error);return r;};
 const names=window.memeOnlineNames;window.memeOnlineNames=()=>duel?.ghostOpponent?{player:identity.user?.displayName||'Bạn',enemy:duel.ghostOpponent.name+' · Máy đại diện'}:names();
  const receive=window.memeOnlineReceive;window.memeOnlineReceive=msg=>{const r=receive(msg);if(pending&&memeRoom?.role==='host'&&memeRoom.peerDeck&&!memeRoom.playing){stopPending();memeStartHostMatch();if(memeRoom?.challengeId&&duel)duel.rankChallengeId=memeRoom.challengeId;}trackResult(duel);return r;};
 const beforeRender=render;render=()=>{beforeRender();publish().catch(error);};
 $('backBtn').addEventListener('click',()=>publish().catch(error));
 identity.subscribe(async({user,ready})=>{const token=++generation;clearInterval(timer);unsub?.();unsub=null;stopPending();incoming=null;$('directDuelInvite')?.remove();uid=user?.uid||null;store=identity.db;lastSaved='';lastDirectory='';label();if(!ready||!uid||!store)return;try{const saved=(await store.doc('duel_players/'+uid).get()).data();if(token!==generation)return;if(valid(saved)&&localStorage.getItem('duel-profile-owner')!==uid){deckList=[...saved.main];extraDeckList=[...saved.extra];chosenHero=saved.heroId;saveDeck();localStorage.setItem(HERO_KEY,JSON.stringify(chosenHero));const active=deckLibrary.decks.find(d=>d.id===deckLibrary.activeId);if(active){active.cards=[...deckList];active.extra=[...extraDeckList];localStorage.setItem(DECK_LIBRARY_KEY,JSON.stringify(deckLibrary));}hero(chosenHero);}localStorage.setItem('duel-profile-owner',uid);await publish(true);if(token!==generation)return;unsub=store.collection('duel_invites').where('to','==',uid).onSnapshot(s=>{if(incoming&&!s.docs.some(d=>d.id===incoming.id&&d.data().nonce===incoming.nonce&&d.data().status==='pending')){incoming=null;$('directDuelInvite')?.remove();}for(const d of s.docs){const v=d.data();if(v.status==='pending'&&ms(v.expiresAt)>Date.now())showIncoming(d.id,v).catch(error);}},error);timer=setInterval(()=>publish(true).catch(error),60000);}catch(e){error(e);}});
 window.addEventListener('pagehide',()=>{clearInterval(timer);unsub?.();stopPending();});
  window.memeIdDuel={challenge,lookup,publish,online,ghost,recordResult,get id(){return uid;}};
})();
