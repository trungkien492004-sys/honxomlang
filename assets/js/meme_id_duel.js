// Saved opponent profiles, direct challenges, and client-side challenge results.
(() => {
 if(!document.getElementById('lobby')||!window.siteIdentity)return;
 const identity=window.siteIdentity;let store=null,uid=null,unsub=null,timer=null,saving=null,lastSaved='',pending=null,incoming=null,generation=0,lastDirectory='';
  const stamp=()=>{
    try{
      if(typeof firebase!=='undefined'&&firebase.firestore?.FieldValue?.serverTimestamp)return firebase.firestore.FieldValue.serverTimestamp();
      if(typeof parent!=='undefined'&&parent.firebase?.firestore?.FieldValue?.serverTimestamp)return parent.firebase.firestore.FieldValue.serverTimestamp();
      if(store?.constructor?.FieldValue?.serverTimestamp)return store.constructor.FieldValue.serverTimestamp();
      if(identity?.db?.constructor?.FieldValue?.serverTimestamp)return identity.db.constructor.FieldValue.serverTimestamp();
    }catch{}
    return new Date();
  };
 const native=v=>{try{return parent.JSON.parse(JSON.stringify(v));}catch{return JSON.parse(JSON.stringify(v));}};
 const stamped=v=>Object.assign(native(v),{lastSeen:stamp()});
 const ms=t=>typeof t?.toMillis==='function'?t.toMillis():typeof t==='string'?Date.parse(t)||0:Number(t)||0;
 const valid=p=>p&&Array.isArray(p.main)&&Array.isArray(p.extra)&&!deckProblem(p.main,p.extra)&&validHero(p.heroId);
 const online=p=>p?.online===true&&Date.now()-ms(p.lastSeen)<90000;
 const busy=()=>!!memeRoom||!!duel&&!duel.finished&&!$('duel').classList.contains('hidden');
 function error(e){
  const n=$('idDuelError');
  if(n)n.textContent=e.message||'Không kết nối được. Hãy thử lại.';
  else notify(e.message||'Không kết nối được.');
  if (typeof window.showRankError === 'function') window.showRankError(e, 'Hệ thống Rank');
  else if (typeof window.parent?.showRankError === 'function') window.parent.showRankError(e, 'Hệ thống Rank');
}
 async function publish(force=false){
  if(!uid||!store)return;const p={uid,name:String(identity.user?.displayName||'Đấu sĩ').slice(0,48),main:[...deckList],extra:[...extraDeckList],heroId:chosenHero,networkId:memeMyId(),online:true,busy:busy(),protocol:MEME_RULES_VERSION};
  const prob = deckProblem(p.main, p.extra);
  if(prob) throw Error('Bộ bài đang dùng chưa hợp lệ: ' + prob);
  if(!valid(p)) throw Error('Bộ bài đang dùng chưa hợp lệ (nhân vật hoặc số lượng bài sai).');const key=JSON.stringify(p);if(!force&&lastSaved===key)return;if(saving){await saving;if(uid)return publish(force);return;}
  const owner=uid; const created=Date.parse(identity.user?.metadata?.creationTime),directory={uid:owner,name:p.name,newbieUntil:Number.isFinite(created)?created+7*86400000:0,online:true},directoryKey=JSON.stringify(directory);saving=Promise.all([store.doc('duel_players/'+owner).set(stamped(p)),...(lastDirectory===directoryKey?[]:[store.doc('duel_directory/'+owner).set(Object.assign(native(directory),{lastSeen:stamp(),updatedAt:stamp()})).then(()=>{lastDirectory=directoryKey;})])]);try{await saving;if(uid===owner)lastSaved=key;}finally{saving=null;}
 }
 function label(){$('duelPlayerId')?.remove();}
 function stopPending(){pending?.unsub?.();if(pending?.timer)clearTimeout(pending.timer);pending=null;}
 async function cancelInvite(){const old=pending;stopPending();if(old)await store.doc('duel_invites/'+old.id).update(native({status:'cancelled'})).catch(()=>{});window.memeOnlineLeave();closeModal();}
  function updateResultUI(receipt){
    const host=$('modalContent');if(!host||!receipt)return;
    host.querySelector('.rank-challenge-result')?.remove();
    const note=document.createElement('p');note.className='rank-challenge-result';
    if(receipt.unauthenticated){
      note.style.color='#f59e0b';note.style.fontWeight='bold';
      note.innerHTML='⚠️ Bạn chưa đăng nhập Google — Điểm Elo chưa được lưu lên BXH.<br><button type="button" class="primary-btn" id="postMatchLoginBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);margin-top:8px;font-size:0.95rem;cursor:pointer;">🔑 Đăng nhập Google để lưu Elo trận này</button>';
      setTimeout(()=>{
        const btn=document.getElementById('postMatchLoginBtn');
        if(btn)btn.onclick=async()=>{
          btn.disabled=true;btn.textContent='Đang mở đăng nhập...';
          try{
            await (window.siteIdentity?.login?.()||window.parent?.siteIdentity?.login?.());
            btn.textContent='Đang lưu Elo...';
            if(duel)delete duel._recordResultPromise;
            const res=await recordResult(duel);
            if(res&&!res.unauthenticated)updateResultUI(res);
          }catch(err){btn.disabled=false;btn.textContent='Thử đăng nhập lại';}
        };
      },50);
    }else if(receipt.error){
      note.style.color='#ef4444';
      note.style.fontWeight='bold';
      note.innerHTML=`⚠️ Chưa đồng bộ BXH: ${esc(receipt.error)} <button type="button" class="rank-error-copy-btn" id="retrySyncEloBtn" style="margin-left:8px;padding:3px 8px;font-size:11px;background:#b91c1c;color:#fff;border:1px solid #ef4444;border-radius:6px;cursor:pointer;">🔄 Thử lưu lại</button>`;
      setTimeout(()=>{
        const retryBtn = document.getElementById('retrySyncEloBtn');
        if (retryBtn) retryBtn.onclick = async () => {
          retryBtn.disabled = true; retryBtn.textContent = 'Đang thử lại...';
          if (duel) delete duel._recordResultPromise;
          const res = await recordResult(duel);
          if (res && !res.error) updateResultUI(res);
          else { retryBtn.disabled = false; retryBtn.textContent = 'Thử lại thất bại'; }
        };
      }, 50);
    }else{
      note.style.color='#4ade80';note.style.fontWeight='bold';
      note.textContent=`🏆 BXH ĐÃ CẬP NHẬT: ${receipt.outcome==='win'?'Thắng':receipt.outcome==='loss'?'Thua':'Hòa'} · ${receipt.delta>0?'+':''}${receipt.delta} Elo (${receipt.ratingAfter} Elo) · ${receipt.wins} thắng / ${receipt.losses} thua`;
    }
    const actions=host.querySelector('.result-actions');if(actions)host.insertBefore(note,actions);else host.appendChild(note);
  }
  async function recordResult(match){
    if(match?._recordResultPromise)return match._recordResultPromise;
    const run=async()=>{
      const currentUid=uid||identity?.user?.uid||window.parent?.siteIdentity?.user?.uid;
      const currentStore=store||identity?.db||window.parent?.siteIdentity?.db;
      const currentIdentity=(identity?.user?identity:(window.parent?.siteIdentity||identity));
      if(!currentUid)return{unauthenticated:true};
      let rawMatchId=match?.rankChallengeId||memeRoom?.challengeId;
      let opponentUid=match?.rankChallengeOpponentUid||memeRoom?.rankOpponentUid||match?.ghostOpponent?.uid;
      if (!rawMatchId) {
        const botGroup = (typeof HEROES !== 'undefined' && HEROES[match?.enemy?.heroId]?.group || 'kaiba').toLowerCase();
        rawMatchId = 'bot-' + crypto.randomUUID().replaceAll('-', '').slice(0, 24);
        opponentUid = opponentUid || ('bot-' + botGroup);
        if (match) {
          match.rankChallengeId = rawMatchId;
          match.rankChallengeOpponentUid = opponentUid;
        }
      }
      if (!opponentUid) {
        const botGroup = (typeof HEROES !== 'undefined' && HEROES[match?.enemy?.heroId]?.group || 'kaiba').toLowerCase();
        opponentUid = 'bot-' + botGroup;
        if (match) match.rankChallengeOpponentUid = opponentUid;
      }
      if(!match?.finished||!rawMatchId||!opponentUid||opponentUid===currentUid||!currentStore)return null;
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
        const LEGEND_BOT_ELOS = { 'bot-kaiba': 1550, 'bot-yugi': 1600, 'bot-zane': 1450, 'bot-jaden': 1350, 'bot-pegasus': 1250, 'bot-joey': 1150 };
        const rating=Math.max(0,Math.round(Number(mine.rating)||1000)),opponentRating=isBot?(match?.botOpponent?.elo||LEGEND_BOT_ELOS[opponentUid]||1200):Math.max(0,Math.round(Number(opponent.rating)||1000));
        const outcome=match.winner==='draw'?'draw':match.winner==='player'?'win':'loss';
        const ownCreated=Date.parse(currentIdentity?.user?.metadata?.creationTime),ownNewbie=Number.isFinite(ownCreated)&&Date.now()<ownCreated+7*86400000;
        const opponentNewbie=isBot?false:(Date.now()<Number(directory.newbieUntil||opponent.newbieUntil||0));
        let delta=0;
        if(outcome!=='draw'){
          const winnerRating=outcome==='win'?rating:opponentRating,loserRating=outcome==='win'?opponentRating:rating;
          const base=Math.max(1,Math.round(32*(1-1/(1+10**((loserRating-winnerRating)/400)))));
          delta=outcome==='win'?(ownNewbie?base*2:opponentNewbie?1:base):(ownNewbie?0:-Math.min(base,rating));
        }
        delta=Math.round(delta);
        const counts={played:Math.round((Number(mine.played)||0)+1),wins:Math.round((Number(mine.wins)||0)+(outcome==='win'?1:0)),losses:Math.round((Number(mine.losses)||0)+(outcome==='loss'?1:0)),draws:Math.round((Number(mine.draws)||0)+(outcome==='draw'?1:0))};
        const nextRating=Math.max(0,Math.round(rating+delta)),createdUntil=Number.isFinite(ownCreated)?ownCreated+7*86400000:0;
        const s=stamp();
        const result={uid:currentUid,matchId,opponentUid,outcome,delta,ratingBefore:Math.round(rating),ratingAfter:Math.round(nextRating),createdAt:s};
        const profileName=String(currentIdentity?.user?.displayName||mine.name||'Đấu sĩ').slice(0,48);
        tx.set(resultRef,result);
        if(!mineSnap.exists){
          const newProfile={uid:currentUid,name:profileName,rating:Math.round(nextRating),...counts,newbieUntil:createdUntil,lastMatchId:matchId,lastSeen:s};
          tx.set(mineRef,newProfile);
        }else{
          const updateProfile={name:profileName,rating:Math.round(nextRating),...counts,lastMatchId:matchId,lastSeen:s};
          tx.update(mineRef,updateProfile);
        }
        receipt={...result,...counts};
      });
      if(receipt){
        match.rankChallengeResult=receipt;
        if(window.siteRank){
          window.siteRank.setLocalProfile?.(receipt);
          window.siteRank.paint?.();
          window.siteRank.refresh?.().catch(()=>{});
        }
        updateResultUI(receipt);
      }
      return receipt;
    };
    const promise=run().catch(e=>{
      console.error('Không cập nhật được kết quả khiêu chiến:',e);
      const errObj={error:e.message||'Lỗi lưu BXH'};
      if (match) match.rankChallengeResult = errObj;
      updateResultUI(errObj);
      if (typeof window.showRankError === 'function') window.showRankError(e, 'Lưu kết quả Rank lên BXH');
      else if (typeof window.parent?.showRankError === 'function') window.parent.showRankError(e, 'Lưu kết quả Rank lên BXH');
      return errObj;
    });
    if(match)match._recordResultPromise=promise;
    return promise;
  }
  function trackResult(match){if(!match?.rankChallengeId&&!memeRoom?.challengeId)return;recordResult(match);}
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
 async function lookup(value){const id=String(value||'').trim();if(!/^[A-Za-z0-9_-]{1,128}$/.test(id))throw Error('Không tìm thấy người chơi.');if(uid&&id===uid)throw Error('Bạn không thể khiêu chiến chính mình.');try{if(uid)await publish();}catch(_){}let snap=null;try{if(store)snap=await store.doc('duel_players/'+id).get();}catch(e){console.warn('Lookup player doc error:',e);}if(!snap||!snap.exists){return {uid:id,name:'Đấu sĩ #'+id.slice(0,5),main:[...defaultDeck()],extra:[...defaultExtraDeck()],heroId:0,protocol:MEME_RULES_VERSION};}const p=snap.data();if(!valid(p)){p.main=[...defaultDeck()];p.extra=[...defaultExtraDeck()];p.heroId=validHero(p.heroId)?p.heroId:0;}return p;}
 function ghost(p){if(!valid(p)){p.main=[...defaultDeck()];p.extra=[...defaultExtraDeck()];p.heroId=validHero(p.heroId)?p.heroId:0;}startGame({ghost:p});}
  async function challenge(id){
    if(!identity.user){try{if(typeof identity.login==='function'&&!identity.signing)await Promise.race([identity.login(),new Promise(r=>setTimeout(r,1200))]);}catch(_){}}if(busy())throw Error('Hãy kết thúc hoặc rời trận hiện tại trước khi khiêu chiến.');const p=await lookup(id);if(uid&&online(p)&&memeParent()&&memeMyId())return invite(p);ghost(p);
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
  if($('rankPlayBtn'))$('rankPlayBtn').onclick=()=>window.siteRank?.find?.();
  $('playBtn').textContent='⚔️ Vào trận';
 const save=commitDeckDraft;commitDeckDraft=(...args)=>{const r=save(...args);publish().catch(error);return r;};
 const hero=chooseHero;chooseHero=(...args)=>{const r=hero(...args);publish().catch(error);return r;};
 const names=window.memeOnlineNames;window.memeOnlineNames=()=>duel?.ghostOpponent?{player:identity.user?.displayName||'Bạn',enemy:duel.ghostOpponent.name+' · Máy đại diện'}:names();
  const receive=window.memeOnlineReceive;window.memeOnlineReceive=msg=>{const r=receive(msg);if(pending&&memeRoom?.role==='host'&&memeRoom.peerDeck&&!memeRoom.playing){stopPending();memeStartHostMatch();if(memeRoom?.challengeId&&duel)duel.rankChallengeId=memeRoom.challengeId;}trackResult(duel);return r;};
 const beforeRender=render;render=()=>{beforeRender();publish().catch(error);};
 $('backBtn').addEventListener('click',()=>publish().catch(error));
 identity.subscribe(async({user,ready})=>{const token=++generation;clearInterval(timer);unsub?.();unsub=null;stopPending();incoming=null;$('directDuelInvite')?.remove();uid=user?.uid||null;store=identity.db;lastSaved='';lastDirectory='';label();if(!ready||!uid||!store)return;try{const saved=(await store.doc('duel_players/'+uid).get()).data();if(token!==generation)return;if(valid(saved)&&localStorage.getItem('duel-profile-owner')!==uid){deckList=[...saved.main];extraDeckList=[...saved.extra];chosenHero=saved.heroId;saveDeck();localStorage.setItem(HERO_KEY,JSON.stringify(chosenHero));const active=deckLibrary.decks.find(d=>d.id===deckLibrary.activeId);if(active){active.cards=[...deckList];active.extra=[...extraDeckList];localStorage.setItem(DECK_LIBRARY_KEY,JSON.stringify(deckLibrary));}hero(chosenHero);}localStorage.setItem('duel-profile-owner',uid);await publish(true);if(token!==generation)return;unsub=store.collection('duel_invites').where('to','==',uid).onSnapshot(s=>{if(incoming&&!s.docs.some(d=>d.id===incoming.id&&d.data().nonce===incoming.nonce&&d.data().status==='pending')){incoming=null;$('directDuelInvite')?.remove();}for(const d of s.docs){const v=d.data();if(v.status==='pending'&&ms(v.expiresAt)>Date.now())showIncoming(d.id,v).catch(error);}},error);timer=setInterval(()=>publish(true).catch(error),60000);}catch(e){error(e);}});
 window.addEventListener('pagehide',()=>{clearInterval(timer);unsub?.();stopPending();});
  window.memeIdDuel={updateResultUI,challenge,lookup,publish,online,ghost,recordResult,invite,cancelInvite,get id(){return uid;}};
})();
