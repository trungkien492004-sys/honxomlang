// Multiplayer transport for the standalone Yu-Gi-Oh! duel.
// The parent page owns Firebase Auth and the Firestore event channel.
let memeRoom = null;
let memeApplyingRemoteState = false;
const MEME_RULES_VERSION = 'tcg-equip-chain-v20-rematch';
let memeReactionPending=null,memeRemoteReaction=null;
function memeMergeReaction(incoming){
  // Keep live side/slot references used by an action awaiting the remote choice.
  for(const name of ['player','enemy']){
    const current=duel[name],next=incoming[name];
    for(const key of ['monsters','spells'])next[key]=next[key].map((slot,i)=>{
      const old=current[key][i];if(slot&&old&&slot.id===old.id&&(!slot.uid||slot.uid===old.uid)){for(const k of Object.keys(old))if(!(k in slot))delete old[k];return Object.assign(old,slot);}return slot;
    });
    Object.assign(current,next);incoming[name]=current;
  }
  const local={mode:duel.mode,pending:duel.pending,selected:duel.selected};Object.assign(duel,incoming,local);
}
window.memeOnlineAskReaction=intent=>new Promise(resolve=>{
  if(!memeRoom?.playing)return resolve(false);
  const requestId=memeMyId()+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
  const timer=setTimeout(()=>{if(memeReactionPending?.requestId!==requestId)return;memeReactionPending=null;memeSend('MEME_ROOM_REACTION_CLOSE',{targetId:memeRoom.peerId,requestId});log('Đối thủ hết thời gian phản ứng.');resolve(false);},45000);
  memeReactionPending={requestId,resolve,timer};
  memeSend('MEME_ROOM_REACTION_REQUEST',{targetId:memeRoom.peerId,requestId,intent,state:memeSnapshot(),version:++memeRoom.version});
});

function memeParent() {
  try {
    return window.parent !== window && window.parent.currentFirebaseUser &&
      window.parent.pvpChannel ? window.parent : null;
  } catch (_) {
    return null;
  }
}

function memeMyId() { return memeParent()?.myNetworkId || ''; }
function memeMyName() { return memeParent()?.player?.name || memeParent()?.currentFirebaseUser?.displayName || 'Người chơi'; }
function memeRoomCode(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32); }
function memeSend(type, data = {}) {
  const parent = memeParent();
  if (!parent || !memeRoom) return;
  // Firestore rejects arrays and objects created in a different window realm.
  // Parse in the parent window so the whole payload uses its native prototypes.
  const payload = parent.JSON.parse(parent.JSON.stringify({ type, id: memeMyId(), roomId: memeRoom.code, rulesVersion:MEME_RULES_VERSION, sentAt:Date.now(), ...data }));
  parent.pvpChannel.postMessage(payload);
}
function memeSnapshot() {
  if (!duel) return null;
  return JSON.parse(JSON.stringify({ ...duel, mode: null, pending: null, selected: null, animePublishTurnEnd:false, battleContext:null }));
}
function memeMirror(state) {
  const copy = JSON.parse(JSON.stringify(state));
  if(copy.openingCoin)copy.openingCoin.first=copy.openingCoin.first==='player'?'enemy':'player';
  if(copy.reactionTrace)copy.reactionTrace=copy.reactionTrace.map(e=>({...e,owner:e.owner==='player'?'enemy':'player'}));
  if(copy.cardMovements)copy.cardMovements=copy.cardMovements.map(m=>({...m,owner:m.owner==='player'?'enemy':'player'}));
  if(copy.lastEffect){copy.lastEffect.owner=copy.lastEffect.owner==='player'?'enemy':'player';copy.lastEffect.targets=copy.lastEffect.targets.map(t=>({...t,name:t.name==='player'?'enemy':'player'}));}
  if(copy.animeEvents)copy.animeEvents=copy.animeEvents.map(e=>({...e,owner:e.owner==='player'?'enemy':'player',targets:(e.targets||[]).map(t=>({...t,name:t.name==='player'?'enemy':'player'}))}));
  for(const side of [copy.player,copy.enemy])for(const slot of [...side.monsters,...side.spells,side.extra,side.field].filter(Boolean))for(const key of ['homeOwner','originalOwner'])if(slot[key])slot[key]=slot[key]==='player'?'enemy':'player';
  if(copy.lastSkill)copy.lastSkill.owner=copy.lastSkill.owner==='player'?'enemy':'player';
  if(copy.lastRandom)copy.lastRandom.owner=copy.lastRandom.owner==='player'?'enemy':'player';
  if(copy.attackContext)copy.attackContext.attackerSide=copy.attackContext.attackerSide==='player'?'enemy':'player';
  return {
    ...copy,
    animePublishTurnEnd:false,
    player: copy.enemy,
    enemy: copy.player,
    turn: copy.turn === 'player' ? 'enemy' : 'player',
    winner: copy.winner ? (copy.winner === 'player' ? 'enemy' : 'player') : null,
    mode: null,
    pending: null,
    selected: null
  };
}
function memeShowResult() {
  const match=duel,won = duel?.winner === 'player';
  Promise.race([window.memeFx?.whenLpSettles()||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,1200))]).then(()=>{if(duel!==match)return;$('duel').classList.add('match-finished');window.memeShowMatchResult?.(won,match?.finishReason||'Trận đấu đã kết thúc.',match);});
}
function memeShowWaiting() {
  if (!memeRoom) return;
  const host = memeRoom.role === 'host';
  const status = host
    ? (memeRoom.peerId ? `Đã có ${esc(memeRoom.peerName)} vào phòng.` : 'Đang chờ bạn bè vào phòng...')
    : (memeRoom.peerId ? `Đã kết nối với ${esc(memeRoom.peerName)}. Chờ chủ phòng bắt đầu.` : (memeRoom.waitingLong ? 'Chưa tìm thấy phòng. Kiểm tra mã và nhờ chủ phòng giữ game đang mở.' : 'Đang tìm chủ phòng...'));
  showModal(`<h2>🌐 Phòng bài Yu-Gi-Oh!</h2><p>Mã phòng: <strong>${esc(memeRoom.code)}</strong></p><p>${status}</p>${host && memeRoom.peerId ? '<button class="primary-btn" id="memeStartOnlineBtn">Bắt đầu trận đấu</button>' : ''}${!host ? '<button class="secondary-btn" id="memeChangeCodeBtn">Đổi mã phòng</button>' : ''}<button class="secondary-btn" id="memeCancelOnlineBtn">Rời phòng</button>`);
  $('memeCancelOnlineBtn').onclick = () => { window.memeOnlineLeave(); closeModal(); };
  const change = $('memeChangeCodeBtn');
  if (change) change.onclick = () => { window.memeOnlineLeave(); memeShowRoomEntry('guest'); };
  const start = $('memeStartOnlineBtn');
  if (start) start.onclick = memeStartHostMatch;
}

window.memeOnlineChooseMode = function() {
  showModal('<h2>Chọn cách chơi</h2><button class="primary-btn" id="memeRankQuickBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);font-weight:900;border:1px solid #fde68a;margin-bottom:8px">⚔️ Đấu Rank nhanh (Ưu tiên Online 15s ➔ Máy)</button><button class="primary-btn" id="memeVsBotBtn">🆚 Đấu thường với máy</button><button class="primary-btn" id="memeHostBtn">🌐 Tạo phòng online</button><button class="primary-btn" id="memeJoinBtn">🤝 Vào phòng online</button>');
  $('memeRankQuickBtn').onclick = () => { closeModal(); window.siteRank?.find?.(); };
  $('memeVsBotBtn').onclick = startGame;
  $('memeHostBtn').onclick = () => memeShowRoomEntry('host');
  $('memeJoinBtn').onclick = () => memeShowRoomEntry('guest');
};
window.memeOnlineIsPlaying = () => !!memeRoom?.playing;
window.memeOnlineNames = () => memeRoom?.playing ? {player:memeMyName(),enemy:memeRoom.peerName} : null;
window.memeOnlineAction = action => {if(memeRoom?.playing)memeSend('MEME_ROOM_ACTION',{targetId:memeRoom.peerId,action});};

function memeShowRoomEntry(role) {
  if (!memeParent()) {
    showModal('<h2>Cần đăng nhập Google</h2><p>Hãy mở game từ trang chính và đăng nhập Google trước khi chơi online.</p><button class="secondary-btn" id="memeBackModeBtn">Quay lại</button>');
    $('memeBackModeBtn').onclick = window.memeOnlineChooseMode;
    return;
  }
  const host = role === 'host';
  const suggested = host ? 'DUEL-' + Math.random().toString(36).slice(2, 7).toUpperCase() : '';
  showModal(`<h2>${host ? 'Tạo phòng online' : 'Vào phòng online'}</h2><label class="room-code-label" for="memeRoomCodeInput">Mã phòng</label><input id="memeRoomCodeInput" class="room-code-input" type="text" maxlength="32" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ví dụ: DUEL-ABCDE" value="${suggested}"><p id="memeRoomError" class="room-code-error" role="alert"></p><button class="primary-btn" id="memeConfirmRoomBtn">${host ? 'Tạo phòng' : 'Vào phòng'}</button><button class="secondary-btn" id="memeBackModeBtn">Quay lại</button>`);
  const input = $('memeRoomCodeInput');
  const confirm = () => {
    const code = memeRoomCode(input.value);
    if (!code) { $('memeRoomError').textContent = 'Nhập mã phòng để tiếp tục.'; input.focus(); return; }
    if (host) memeHostRoom(code); else memeJoinRoom(code);
  };
  $('memeConfirmRoomBtn').onclick = confirm;
  $('memeBackModeBtn').onclick = window.memeOnlineChooseMode;
  input.onkeydown = event => { if (event.key === 'Enter') confirm(); };
  input.focus();
  if (host) input.select();
}
function memeHostRoom(code) {
  window.memeOnlineLeave();
  memeRoom = { code, role: 'host', playing: false, peerId: null, peerUid: null, peerName: '', peerDeck: null, version: 0, lastRemoteVersion: 0 };
  const ping = () => { if (memeRoom?.role === 'host' && !memeRoom.playing) memeSend('MEME_ROOM_PING', { hostName: memeMyName() }); };
  ping();
  memeRoom.pingTimer = setInterval(ping, 3000);
  memeShowWaiting();
}
function memeJoinRoom(code) {
  window.memeOnlineLeave();
  memeRoom = { code, role: 'guest', playing: false, peerId: null, peerName: '', version: 0, lastRemoteVersion: 0 };
  const join = () => {
    if (memeRoom?.role === 'guest' && !memeRoom.playing && !memeRoom.peerId)
      memeSend('MEME_ROOM_JOIN', { guestName: memeMyName(), deck: [...deckList], extraDeck:[...extraDeckList],heroId:chosenHero });
  };
  join();
  memeRoom.joinTimer = setInterval(join, 5000);
  memeRoom.waitTimer = setTimeout(() => {
    if (memeRoom?.role === 'guest' && !memeRoom.peerId && !memeRoom.playing) {
      memeRoom.waitingLong = true;
      memeShowWaiting();
    }
  }, 12000);
  memeShowWaiting();
}
function memeStartHostMatch() {
  if (!memeRoom || memeRoom.role !== 'host' || !memeRoom.peerId || !memeRoom.peerDeck) return;
  const challengeBaseId=memeRoom.challengeBaseId||memeRoom.challengeId||('online-'+crypto.randomUUID().replaceAll('-','').slice(0,16));
  memeRoom.challengeBaseId=challengeBaseId;
  const matchId=crypto.randomUUID();
  clearInterval(memeRoom.pingTimer);
  clearTimeout(aiTimer);
  window.memeFx?.reset();
  $('duel').classList.remove('match-finished');
  document.querySelector('.duel-layout').classList.add('inspector-collapsed');
  memeApplyingRemoteState = true;
  duel = { player: blankSide(deckList,extraDeckList,chosenHero), enemy: blankSide(memeRoom.peerDeck,memeRoom.peerExtraDeck||[],memeRoom.peerHeroId), turn: 'player', phase: 'MAIN1', round: 1, normalSummoned: false, mode: null, pending: null, selected: null, logs: [], finished: false };
  duel.onlineMatchId=matchId;
  duel.rankChallengeId=challengeBaseId.slice(0,32)+'_'+matchId.replaceAll('-','').slice(0,24);
  duel.rankChallengeOpponentUid=memeRoom.rankOpponentUid||('guest-'+(memeRoom.peerId||'player'));
  memeRoom.challengeId=duel.rankChallengeId;
  for (let i = 0; i < 4; i++) { draw('player'); draw('enemy'); }
  $('lobby').classList.add('hidden'); $('duel').classList.remove('hidden');
  $('playerName').textContent = HERO_NAMES[chosenHero];
  duel.openingCoin=window.memeOpening?.create();duel.turn=duel.openingCoin?.first||'player';
  memeRoom.playing = true;
  memeRoom.currentMatchId=matchId;
  memeRoom.rematchRequested=false;memeRoom.rematchRequestId=null;memeRoom.incomingRematchId=null;
  log(`🪙 Tung xu: ${duel.openingCoin?.face==='tails'?'sấp':'ngửa'} · ${duel.turn==='player'?memeMyName():memeRoom.peerName} đi lượt 1. Người còn lại đi lượt 2.`);
  render();
  window.memeTurnClock?.start();
  memeSend('MEME_ROOM_START', { targetId: memeRoom.peerId, hostName: memeMyName(), hostUid: (window.siteIdentity?.user?.uid || null), matchId, challengeBaseId, rankChallengeId:duel.rankChallengeId||null, state: memeSnapshot() });
  memeApplyingRemoteState = false;
  closeModal();
}

function memeShowRematchWaiting(){
  showModal('<h2>⚔️ Đấu lại</h2><p id="memeRematchWaitText">Đã gửi lời mời. Đang chờ đối thủ đồng ý…</p><button class="secondary-btn" id="memeCancelRematch">Hủy chờ</button><button class="secondary-btn" id="memeLeaveAfterResult">Về sảnh</button>');
  $('memeCancelRematch').onclick=()=>{const requestId=memeRoom?.rematchRequestId||memeRoom?.incomingRematchId;if(requestId)memeSend('MEME_ROOM_REMATCH_CANCEL',{targetId:memeRoom.peerId,requestId});if(memeRoom){clearTimeout(memeRoom.rematchTimer);memeRoom.rematchRequested=false;memeRoom.rematchRequestId=null;memeRoom.incomingRematchId=null;}memeShowResult();};
  $('memeLeaveAfterResult').onclick=()=>$('backBtn').click();
}
function memeWatchRematch(requestId){
  clearTimeout(memeRoom?.rematchTimer);
  if(!memeRoom)return;
  memeRoom.rematchTimer=setTimeout(()=>{if((memeRoom?.rematchRequestId!==requestId&&memeRoom?.incomingRematchId!==requestId)||!duel?.finished)return;const text=$('memeRematchWaitText');if(text)text.textContent='Đối thủ chưa phản hồi. Hãy nhờ họ tải lại game rồi thử lại.';},15000);
}
function memeShowRematchInvite(requestId){
  showModal('<h2>⚔️ Đối thủ muốn đấu lại</h2><p>Hai bộ bài và nhân vật hiện tại sẽ được giữ nguyên.</p><button class="primary-btn" id="memeAcceptRematch">Đồng ý đấu lại</button><button class="secondary-btn" id="memeDeclineRematch">Để sau</button><button class="secondary-btn" id="memeLeaveAfterResult">Về sảnh</button>');
  $('memeAcceptRematch').onclick=()=>{
    if(!memeRoom||!duel?.finished)return;
    memeRoom.incomingRematchId=requestId;
    memeRoom.rematchRequestId=requestId;
    memeSend('MEME_ROOM_REMATCH_ACCEPT',{targetId:memeRoom.peerId,requestId});
    memeRoom.rematchRequested=true;
    if(memeRoom.role==='host')memeStartHostMatch();else{memeShowRematchWaiting();memeWatchRematch(requestId);}
  };
  $('memeDeclineRematch').onclick=()=>{if(memeRoom)memeSend('MEME_ROOM_REMATCH_CANCEL',{targetId:memeRoom.peerId,requestId});memeRoom.incomingRematchId=null;memeShowResult();};
  $('memeLeaveAfterResult').onclick=()=>$('backBtn').click();
}
window.memeOnlineRequestRematch=()=>{
  if(!memeRoom?.playing||!duel?.finished)return false;
  if(memeRoom.protocol==='authoritative-v1'){notify('Đấu lại chưa được hỗ trợ trong phòng máy chủ này. Hãy về sảnh để tạo phòng mới.');return true;}
  if(!memeRoom.peerId){notify('Không còn kết nối với đối thủ.');return true;}
  if(memeRoom.rematchRequested){memeShowRematchWaiting();return true;}
  const requestId=crypto.randomUUID();memeRoom.rematchRequested=true;memeRoom.rematchRequestId=requestId;
  memeSend('MEME_ROOM_REMATCH_REQUEST',{targetId:memeRoom.peerId,requestId});memeShowRematchWaiting();memeWatchRematch(requestId);return true;
};

window.memeOnlineOnRender = function() {
  if(window.memeOpening?.pending())return;
  if (window.memeAnime?.busy||duel?.turn!=='player'&&!duel?.animePublishTurnEnd)return;
  if (!memeRoom?.playing || memeApplyingRemoteState || memeRemoteReaction || memeReactionPending || !duel) return;
  memeSend('MEME_ROOM_STATE', { targetId: memeRoom.peerId, version: ++memeRoom.version, state: memeSnapshot() });
};

window.memeOnlineReceive = function(msg) {
  if (!memeRoom || !msg || msg.roomId !== memeRoom.code || msg.id === memeMyId()) return;
  if(memeRoom.playing&&msg.id===memeRoom.peerId&&msg.targetId===memeMyId()){
    if(msg.type==='MEME_ROOM_REMATCH_REQUEST'&&typeof msg.requestId==='string'&&duel?.finished){
      memeRoom.incomingRematchId=msg.requestId;
      if(memeRoom.rematchRequested){if(memeRoom.role==='host')memeStartHostMatch();else memeShowRematchWaiting();}
      else memeShowRematchInvite(msg.requestId);
      return;
    }
    if(msg.type==='MEME_ROOM_REMATCH_ACCEPT'&&memeRoom.role==='host'&&duel?.finished&&(msg.requestId===memeRoom.rematchRequestId||msg.requestId===memeRoom.incomingRematchId)){
      memeStartHostMatch();return;
    }
    if(msg.type==='MEME_ROOM_REMATCH_CANCEL'&&msg.requestId===memeRoom.rematchRequestId){
      clearTimeout(memeRoom.rematchTimer);memeRoom.rematchRequested=false;memeRoom.rematchRequestId=null;if(duel?.finished)memeShowResult();return;
    }
    if(msg.type==='MEME_ROOM_REMATCH_CANCEL'&&msg.requestId===memeRoom.incomingRematchId){
      memeRoom.incomingRematchId=null;if(duel?.finished&&!memeRoom.rematchRequested)memeShowResult();return;
    }
    if(msg.type==='MEME_ROOM_REACTION_REQUEST'&&msg.state&&typeof msg.requestId==='string'&&!memeRemoteReaction&&duel?.turn==='enemy'){
      memeRemoteReaction=msg.requestId;memeRoom.lastRemoteVersion=Math.max(memeRoom.lastRemoteVersion,msg.version||0);
      memeApplyingRemoteState=true;duel=memeMirror(msg.state);render();memeApplyingRemoteState=false;
      const room=memeRoom,requestId=msg.requestId;
      window.arcana200.run(async()=>{const cancel=await window.arcana200.quickResponse('player',msg.intent);await window.arcana200.flush();if(memeRoom!==room||memeRemoteReaction!==requestId)return;memeSend('MEME_ROOM_REACTION_RESULT',{targetId:msg.id,requestId,cancel,state:memeSnapshot(),version:++memeRoom.version});}).finally(()=>{if(memeRemoteReaction===requestId)memeRemoteReaction=null;});return;
    }
    if(msg.type==='MEME_ROOM_REACTION_RESULT'&&memeReactionPending?.requestId===msg.requestId&&msg.state){
      const pending=memeReactionPending;clearTimeout(pending.timer);memeReactionPending=null;memeRoom.lastRemoteVersion=Math.max(memeRoom.lastRemoteVersion,msg.version||0);memeMergeReaction(memeMirror(msg.state));pending.resolve(!!msg.cancel);return;
    }
    if(msg.type==='MEME_ROOM_REACTION_CLOSE'&&memeRemoteReaction===msg.requestId){memeRemoteReaction=null;window.arcana200.cancelChoice();return;}
  }
  if(!memeRoom.playing&&['MEME_ROOM_PING','MEME_ROOM_JOIN'].includes(msg.type)&&(!msg.targetId||msg.targetId===memeMyId())&&msg.rulesVersion!==MEME_RULES_VERSION){
    window.memeOnlineLeave();showModal('<h2>Hai người đang dùng khác phiên bản</h2><p>Cả hai hãy tải lại trang game để dùng bản kỹ năng đấu sĩ mới, rồi tạo lại phòng.</p><button class="secondary-btn" id="memeVersionBack">Về sảnh</button>');$('memeVersionBack').onclick=closeModal;return;
  }
  if (msg.type === 'MEME_ROOM_PING' && memeRoom.role === 'guest' && !memeRoom.playing) {
    memeRoom.peerId = msg.id;
    memeRoom.peerName = msg.hostName || 'Chủ phòng';
    clearInterval(memeRoom.joinTimer);
    clearTimeout(memeRoom.waitTimer);
    memeSend('MEME_ROOM_JOIN', { targetId: msg.id, guestName: memeMyName(), guestUid: (window.siteIdentity?.user?.uid || null), deck: [...deckList], extraDeck:[...extraDeckList],heroId:chosenHero });
    memeShowWaiting();
    return;
  }
  if (msg.type === 'MEME_ROOM_JOIN' && memeRoom.role === 'host' && !memeRoom.playing &&
      (!msg.targetId || msg.targetId === memeMyId()) &&
      !deckProblem(msg.deck,msg.extraDeck||[]) &&
      validHero(msg.heroId) &&
      (!memeRoom.peerId || memeRoom.peerId === msg.id)) {
    memeRoom.peerId = msg.id;
    memeRoom.peerName = msg.guestName || 'Khách';
    memeRoom.peerDeck = [...msg.deck];
    memeRoom.peerExtraDeck = [...(msg.extraDeck||[])];
    memeRoom.peerHeroId = msg.heroId;
    memeShowWaiting();
    return;
  }
  const newMatchStart=(!memeRoom.playing&&!duel?.finished)||(duel?.finished&&typeof msg.matchId==='string'&&msg.matchId!==memeRoom.currentMatchId);
  if (msg.type === 'MEME_ROOM_START' && memeRoom.role === 'guest' && newMatchStart &&
      msg.targetId === memeMyId() && (!memeRoom.peerId || msg.id === memeRoom.peerId) && msg.state) {
    memeApplyingRemoteState = true;
    clearInterval(memeRoom.joinTimer);
    clearTimeout(memeRoom.waitTimer);
    memeRoom.peerId = msg.id;
    memeRoom.peerUid = msg.hostUid || null;
    memeRoom.rankOpponentUid = msg.hostUid || null;
    memeRoom.peerName = msg.hostName || memeRoom.peerName || 'Chủ phòng';
    memeRoom.playing = true;
    memeRoom.currentMatchId=msg.matchId||memeRoom.currentMatchId||null;
    memeRoom.challengeBaseId=msg.challengeBaseId||memeRoom.challengeBaseId||null;
    memeRoom.challengeId=msg.rankChallengeId||memeRoom.challengeId||null;
  clearTimeout(memeRoom.rematchTimer);memeRoom.rematchRequested=false;memeRoom.rematchRequestId=null;memeRoom.incomingRematchId=null;
    window.memeFx?.reset();
    document.querySelector('.duel-layout').classList.add('inspector-collapsed');
    duel = memeMirror(msg.state);
    duel.onlineMatchId = msg.matchId || null;
    duel.rankChallengeId = memeRoom.challengeId;
    duel.rankChallengeOpponentUid = msg.hostUid || ('host-' + (msg.id || 'player'));
    $('lobby').classList.add('hidden'); $('duel').classList.remove('hidden');
    $('playerName').textContent = HERO_NAMES[chosenHero];
    render(); closeModal();
    memeApplyingRemoteState = false;
    return;
  }
  if (msg.type === 'MEME_ROOM_STATE' && !memeRemoteReaction&&!memeReactionPending&&memeRoom.playing && msg.id === memeRoom.peerId &&
      msg.targetId === memeMyId() && msg.state && Number.isSafeInteger(msg.version) &&
      msg.version > memeRoom.lastRemoteVersion) {
    memeRoom.lastRemoteVersion = msg.version;
    const hadTurn = duel?.turn === 'player';
    const priorRound=duel?.round,priorClock=duel?.turnClock;
    let drewCard = false;
    memeApplyingRemoteState = true;
    duel = memeMirror(msg.state);
    // Keep the host's deadline across actions; a handoff gets a fresh host clock.
    if(memeRoom.role==='host')duel.turnClock=duel.round===priorRound?priorClock:null;
    if (!hadTurn && duel.turn === 'player' && !duel.finished) {
      duel.normalSummoned = false;
      window.memeRules?.beginTurn('player');
      duel.player.monsters.forEach(slot => { if (slot) slot.attacked = false; });
      if (duel.player.extra) duel.player.extra.attacked = false;
      if (!duel.finished&&draw('player')) { drewCard = true; log(`🟢 Lượt ${duel.round}: bạn rút một lá.`); }
    }
    render();
    if (duel.finished) memeShowResult();
    memeApplyingRemoteState = false;
    if (duel.turn === 'player' && (!hadTurn || drewCard)) window.memeOnlineOnRender();
    return;
  }
  if(msg.type==='MEME_ROOM_ACTION'&&memeRoom.playing&&msg.id===memeRoom.peerId&&msg.targetId===memeMyId()&&duel?.turn==='enemy'&&!window.memeFx?.busy){
    const a=msg.action;if(a?.type==='attack'&&(a.index===-1||Number.isInteger(a.index)&&a.index>=0&&a.index<3)&&(a.targetIndex===null||Number.isInteger(a.targetIndex)&&a.targetIndex>=0&&a.targetIndex<3))window.memeFx?.attack('enemy',a.index,!!a.isExtra,a.targetIndex,!!a.targetExtra,()=>{});
    return;
  }
  if (msg.type === 'MEME_ROOM_LEAVE' && msg.id === memeRoom.peerId) {
    clearInterval(memeRoom.pingTimer);
    clearInterval(memeRoom.joinTimer);
    clearTimeout(memeRoom.waitTimer);
    if (memeRoom.playing) {
      showModal('<h2>Đối thủ đã rời trận</h2><button class="primary-btn" id="memeReturnBtn">Về sảnh</button>');
      $('memeReturnBtn').onclick = () => $('backBtn').click();
    } else {
      memeRoom.peerId = null;
      memeRoom.peerName = '';
      memeRoom.peerDeck = null;
      memeShowWaiting();
    }
  }
};

window.memeOnlineLeave = function() {
  if(memeReactionPending){clearTimeout(memeReactionPending.timer);memeReactionPending.resolve(false);memeReactionPending=null;}memeRemoteReaction=null;window.arcana200?.cancelChoice();
  if (!memeRoom) return;
  memeSend('MEME_ROOM_LEAVE', { targetId: memeRoom.peerId });
  clearInterval(memeRoom.pingTimer);
  clearInterval(memeRoom.joinTimer);
  clearTimeout(memeRoom.waitTimer);
  memeRoom = null;
};
