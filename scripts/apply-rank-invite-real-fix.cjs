const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const norm = s => s.replace(/\r\n/g, '\n');

// 1. Patch assets/js/meme_online.js
{
  const filePath = path.join(root, 'assets/js/meme_online.js');
  let code = fs.readFileSync(filePath, 'utf8');

  if (code.includes('const channel = parent?.pvpChannel || window.pvpChannel;')) {
    console.log('✓ assets/js/meme_online.js already patched');
  } else {
    const target = `function memeParent() {
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
}`;

    const replacement = `function memeParent() {
  try {
    const p = (window.parent && window.parent !== window) ? window.parent : window;
    const u = p.currentFirebaseUser || p.siteIdentity?.user || window.currentFirebaseUser || window.siteIdentity?.user;
    if (u) {
      if (!p.currentFirebaseUser) p.currentFirebaseUser = u;
      if (!window.currentFirebaseUser) window.currentFirebaseUser = u;
      if (!p.myNetworkId) p.myNetworkId = window.myNetworkId || ('P_' + String(u.uid).slice(0, 10));
      if (!window.myNetworkId) window.myNetworkId = p.myNetworkId;
      if (!p.pvpChannel && window.pvpChannel) p.pvpChannel = window.pvpChannel;
      return p;
    }
    return (window.parent !== window) ? window.parent : null;
  } catch (_) {
    return null;
  }
}

function memeMyId() {
  const p = memeParent();
  return p?.myNetworkId || window.myNetworkId || p?.currentFirebaseUser?.uid || window.currentFirebaseUser?.uid || window.siteIdentity?.user?.uid || '';
}

function memeMyName() {
  const p = memeParent();
  return p?.player?.name || p?.currentFirebaseUser?.displayName || p?.siteIdentity?.user?.displayName || window.player?.name || window.currentFirebaseUser?.displayName || 'Người chơi';
}

function memeRoomCode(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32); }
function memeSend(type, data = {}) {
  const parent = memeParent();
  const channel = parent?.pvpChannel || window.pvpChannel;
  if (!channel || !memeRoom) return;
  const jsonParser = parent?.JSON || JSON;
  const payload = jsonParser.parse(jsonParser.stringify({ type, id: memeMyId(), roomId: memeRoom.code, rulesVersion:MEME_RULES_VERSION, sentAt:Date.now(), ...data }));
  channel.postMessage(payload);
}`;

    if (!norm(code).includes(norm(target))) {
      throw new Error('Target not found in meme_online.js');
    }
    code = norm(code).replace(norm(target), norm(replacement));
    fs.writeFileSync(filePath, code.replace(/\n/g, '\r\n'), 'utf8');
    console.log('✓ assets/js/meme_online.js patched');
  }
}

// 2. Patch assets/js/site_identity.js
{
  const filePath = path.join(root, 'assets/js/site_identity.js');
  let code = fs.readFileSync(filePath, 'utf8');

  const targetPreserve = `  try {
    if (parent !== window && parent.siteIdentity) {
      window.siteIdentity = parent.siteIdentity;
      return;
    }
  } catch {}`;

  const replPreserve = `  try {
    if (window.siteIdentity && window.siteIdentity.db && window.siteIdentity.user) {
      return;
    }
    if (parent !== window && parent.siteIdentity) {
      window.siteIdentity = parent.siteIdentity;
      return;
    }
  } catch {}`;

  if (!code.includes('if (window.siteIdentity && window.siteIdentity.db && window.siteIdentity.user)')) {
    if (norm(code).includes(norm(targetPreserve))) {
      code = norm(code).replace(norm(targetPreserve), norm(replPreserve));
      fs.writeFileSync(filePath, code.replace(/\n/g, '\r\n'), 'utf8');
      console.log('✓ assets/js/site_identity.js preserve identity patched');
    }
  }

  if (code.includes('const starterDeck = [')) {
    console.log('✓ assets/js/site_identity.js already patched');
  } else {
    const targetPublish = `    // The public directory contains no deck data. Keep the owner's saved deck
    // presence fresh too, so a real online challenge reaches the invitation flow.
    const playerRef = db.doc('duel_players/' + uid);
    try {
      const snapshot = await playerRef.get();
      if (!snapshot.exists) return;
      const player = snapshot.data() || {};
      const seen = typeof player.lastSeen?.toMillis === 'function'
        ? player.lastSeen.toMillis()
        : typeof player.lastSeen === 'string' ? Date.parse(player.lastSeen) : Number(player.lastSeen) || 0;
      const stale = Date.now() - seen > 90000;
      await playerRef.update({
        online,
        lastSeen: timestamp(),
        ...(online && stale && player.busy ? { busy: false } : {})
      });
    } catch (error) {
      // A first-time account may not have a saved duel deck yet.
      if (error?.code !== 'permission-denied') console.warn('Duel presence:', error.code || error.message);
    }`;

    const replacementPublish = `    // The public directory contains no deck data. Keep the owner's saved deck
    // presence fresh too, so a real online challenge reaches the invitation flow.
    const playerRef = db.doc('duel_players/' + uid);
    try {
      const snapshot = await playerRef.get();
      if (!snapshot.exists) {
        if (online) {
          const starterDeck = [
            'trau_tre_len_doi','trau_tre_len_doi','co_mat_job','ech_xanh_triet_ly','ech_xanh_triet_ly',
            'cua_dong_bat_khuat','meo_map_lan_long','thanh_chui_binh_luan','ninja_luon_dem','ninja_luon_dem',
            'ba_hoa_dam_drama','anh_grab_da_nhiem','hiep_si_tra_sua','kiem_lam_bao_ve',
            'thuy_quai_lay_loi','trum_cuoi_bi_an','phap_su_bang_tra',
            'hot_via','dinh_cua_chop','vong_tay_ban_than'
          ];
          await playerRef.set({
            uid,
            name: profile.name,
            main: starterDeck,
            extra: [],
            heroId: 0,
            networkId: window.myNetworkId || uid,
            protocol: 'tcg-equip-chain-v20-rematch',
            online: true,
            busy: false,
            lastSeen: stamp
          });
        }
        return;
      }
      const player = snapshot.data() || {};
      const seen = typeof player.lastSeen?.toMillis === 'function'
        ? player.lastSeen.toMillis()
        : typeof player.lastSeen === 'string' ? Date.parse(player.lastSeen) : Number(player.lastSeen) || 0;
      const stale = Date.now() - seen > 90000;
      await playerRef.update({
        online,
        lastSeen: timestamp(),
        ...(online && stale && player.busy ? { busy: false } : {})
      });
    } catch (error) {
      // A first-time account may not have a saved duel deck yet.
      if (error?.code !== 'permission-denied') console.warn('Duel presence:', error.code || error.message);
    }`;

    if (!norm(code).includes(norm(targetPublish))) {
      throw new Error('Target publishPresence not found in site_identity.js');
    }
    code = norm(code).replace(norm(targetPublish), norm(replacementPublish));

    const targetAuth = `      if (user) {
        startPresence(user);
        registerMember(user).catch(error => console.warn('Site membership:', error.code || error.message));
      } else if (previous) {`;

    const replacementAuth = `      if (user) {
        window.currentFirebaseUser = window.currentFirebaseUser || user;
        window.myNetworkId = window.myNetworkId || ('P_' + user.uid.slice(0, 10));
        startPresence(user);
        registerMember(user).catch(error => console.warn('Site membership:', error.code || error.message));
        if (typeof window.startNetworkListeners === 'function') window.startNetworkListeners();
      } else if (previous) {`;

    if (!norm(code).includes(norm(targetAuth))) {
      throw new Error('Target auth observer not found in site_identity.js');
    }
    code = norm(code).replace(norm(targetAuth), norm(replacementAuth));
    fs.writeFileSync(filePath, code.replace(/\n/g, '\r\n'), 'utf8');
    console.log('✓ assets/js/site_identity.js patched');
  }
}

// 3. Patch assets/js/meme_id_duel.js
{
  const filePath = path.join(root, 'assets/js/meme_id_duel.js');
  let code = fs.readFileSync(filePath, 'utf8');

  if (code.includes('checkPendingJoin')) {
    console.log('✓ assets/js/meme_id_duel.js already patched');
  } else {
    const targetLookup = ` async function lookup(value){const id=String(value||'').trim();if(!/^[A-Za-z0-9_-]{1,128}$/.test(id))throw Error('Không tìm thấy người chơi.');if(uid&&id===uid)throw Error('Bạn không thể khiêu chiến chính mình.');try{if(uid)await publish();}catch(_){}let snap=null;try{if(store)snap=await store.doc('duel_players/'+id).get();}catch(e){console.warn('Lookup player doc error:',e);}if(!snap||!snap.exists){return {uid:id,name:'Đấu sĩ #'+id.slice(0,5),main:[...defaultDeck()],extra:[...defaultExtraDeck()],heroId:0,protocol:MEME_RULES_VERSION};}const p=snap.data();if(!valid(p)){p.main=[...defaultDeck()];p.extra=[...defaultExtraDeck()];p.heroId=validHero(p.heroId)?p.heroId:0;}return p;}`;

    const replacementLookup = ` async function lookup(value){
  const id=String(value||'').trim();
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(id))throw Error('Không tìm thấy người chơi.');
  if(uid&&id===uid)throw Error('Bạn không thể khiêu chiến chính mình.');
  try{if(uid)await publish();}catch(_){}
  let snap=null, dirSnap=null;
  try{
    if(store){
      [snap, dirSnap] = await Promise.all([
        store.doc('duel_players/'+id).get().catch(()=>null),
        store.doc('duel_directory/'+id).get().catch(()=>null)
      ]);
    }
  }catch(e){console.warn('Lookup player doc error:',e);}
  const dir = dirSnap?.exists ? dirSnap.data() : null;
  const isDirOnline = dir?.online === true && (Date.now() - ms(dir.lastSeen) < 90000);
  if(!snap||!snap.exists){
    return {
      uid: id,
      name: dir?.name || ('Đấu sĩ #'+id.slice(0,5)),
      main: [...defaultDeck()],
      extra: [...defaultExtraDeck()],
      heroId: 0,
      protocol: MEME_RULES_VERSION,
      online: isDirOnline,
      lastSeen: dir?.lastSeen || null,
      networkId: dir?.uid || id
    };
  }
  const p=snap.data();
  if(isDirOnline){
    p.online = true;
    p.lastSeen = dir.lastSeen;
  }
  if(dir?.name && !p.name) p.name = dir.name;
  if(!valid(p)){p.main=[...defaultDeck()];p.extra=[...defaultExtraDeck()];p.heroId=validHero(p.heroId)?p.heroId:0;}
  return p;
 }`;

    if (!norm(code).includes(norm(targetLookup))) {
      throw new Error('Target lookup not found in meme_id_duel.js');
    }
    code = norm(code).replace(norm(targetLookup), norm(replacementLookup));

    const targetInit = ` window.addEventListener('pagehide',()=>{clearInterval(timer);unsub?.();stopPending();});
  window.memeIdDuel={updateResultUI,challenge,lookup,publish,online,ghost,recordResult,invite,cancelInvite,loginToSaveResult,get id(){return uid;},get hasPendingInvite(){return !!pending;}};
})();`;

    const replacementInit = ` function checkPendingJoin() {
  try {
    const pendingJoin = window.parent?.pendingInviteJoin || window.pendingInviteJoin;
    if (pendingJoin && pendingJoin.roomId) {
      if (window.parent) window.parent.pendingInviteJoin = null;
      window.pendingInviteJoin = null;
      memeJoinRoom(pendingJoin.roomId);
      if (memeRoom) {
        memeRoom.peerId = pendingJoin.peerId;
        memeRoom.peerName = pendingJoin.peerName;
        memeRoom.challengeId = pendingJoin.challengeId;
        memeRoom.rankOpponentUid = pendingJoin.rankOpponentUid;
      }
    }
  } catch (e) { console.warn('Check pending join error:', e); }
 }
 setTimeout(checkPendingJoin, 250);
 window.addEventListener('pagehide',()=>{clearInterval(timer);unsub?.();stopPending();});
 window.memeIdDuel={updateResultUI,challenge,lookup,publish,online,ghost,recordResult,invite,cancelInvite,loginToSaveResult,get id(){return uid;},get hasPendingInvite(){return !!pending;}};
})();`;

    if (!norm(code).includes(norm(targetInit))) {
      throw new Error('Target init not found in meme_id_duel.js');
    }
    code = norm(code).replace(norm(targetInit), norm(replacementInit));
    fs.writeFileSync(filePath, code.replace(/\n/g, '\r\n'), 'utf8');
    console.log('✓ assets/js/meme_id_duel.js patched');
  }
}

// 4. Patch assets/js/site_rank.js (Global Duel Invite Listener on index.html)
{
  const filePath = path.join(root, 'assets/js/site_rank.js');
  let code = fs.readFileSync(filePath, 'utf8');

  if (code.includes('startGlobalInviteListener')) {
    console.log('✓ assets/js/site_rank.js already patched');
  } else {

  const replacementRankEnd = `  let globalInviteUnsub = null;
  let globalIncoming = null;
  let globalInviteTimer = null;

  function stopGlobalInvite() {
    if (globalInviteTimer) clearInterval(globalInviteTimer);
    globalInviteTimer = null;
    globalIncoming = null;
    document.getElementById('globalDuelInvite')?.remove();
  }

  function showGlobalInvite(inviteId, v, sender) {
    if (globalIncoming?.nonce === v.nonce) return;
    stopGlobalInvite();
    globalIncoming = { id: inviteId, nonce: v.nonce };

    const modal = document.createElement('div');
    modal.id = 'globalDuelInvite';
    modal.className = 'global-duel-invite-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Lời mời khiêu chiến Đấu Rank');

    const senderName = String(sender?.name || 'Đấu sĩ').slice(0, 48);
    const expiresAt = typeof v.expiresAt?.toMillis === 'function' ? v.expiresAt.toMillis() : (Number(v.expiresAt) || (Date.now() + 60000));
    let remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

    modal.innerHTML = \`
      <div class="global-invite-card">
        <div class="global-invite-badge">⚔️ LỜI MỜI ĐẤU RANK YU-GI-OH!</div>
        <h3>Đấu Sĩ Khiêu Chiến!</h3>
        <p class="global-invite-sender"><strong style="color:#fde047;font-size:16px;">\${esc(senderName)}</strong> muốn khiêu chiến một trận Đấu Rank với bạn!</p>
        <p class="global-invite-timer">Thời gian phản hồi: <b id="globalInviteTimerVal" style="color:#f59e0b;font-size:16px;">\${remaining}</b>s</p>
        <div class="global-invite-actions">
          <button type="button" class="primary-btn" id="globalAcceptDuelBtn" style="background:linear-gradient(135deg,#16a34a,#15803d);border:1.5px solid #86efac;color:#fff;font-weight:900;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:14px;">⚔️ Nhận Lời (Vào Trận)</button>
          <button type="button" class="secondary-btn" id="globalDeclineDuelBtn" style="background:#334155;border:1px solid #64748b;color:#f1f5f9;font-weight:800;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:14px;">Từ Chối</button>
        </div>
        <p class="id-invite-error" id="globalInviteError" role="status" style="color:#ef4444;margin-top:8px;font-size:13px;font-weight:700;"></p>
      </div>
    \`;

    document.body.appendChild(modal);

    const timerVal = modal.querySelector('#globalInviteTimerVal');
    globalInviteTimer = setInterval(() => {
      remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      if (timerVal) timerVal.textContent = String(remaining);
      if (remaining <= 0) {
        stopGlobalInvite();
      }
    }, 1000);

    const respond = async accept => {
      for (const btn of modal.querySelectorAll('button')) btn.disabled = true;
      const statusEl = modal.querySelector('#globalInviteError');
      if (statusEl) statusEl.textContent = accept ? 'Đang vào trận đấu...' : 'Đang từ chối...';
      try {
        const store = identity.db;
        await store.runTransaction(async tx => {
          const ref = store.doc('duel_invites/' + inviteId);
          const snap = await tx.get(ref);
          if (!snap.exists) throw Error('Lời mời không còn tồn tại.');
          const latest = snap.data();
          const exp = typeof latest.expiresAt?.toMillis === 'function' ? latest.expiresAt.toMillis() : (Number(latest.expiresAt) || 0);
          if (latest.nonce !== v.nonce || latest.status !== 'pending' || (exp > 0 && exp <= Date.now())) {
            throw Error('Lời mời đã hết hạn hoặc bị hủy.');
          }
          tx.update(ref, { status: accept ? 'accepted' : 'declined' });
        });

        if (accept) {
          stopGlobalInvite();
          window.pendingInviteJoin = {
            roomId: v.roomId,
            peerId: sender?.networkId || v.from,
            peerName: senderName,
            challengeId: v.nonce,
            rankOpponentUid: v.from
          };
          if (typeof window.openMemeCardGame === 'function') {
            window.openMemeCardGame();
          }
          for (let i = 0; i < 50; i++) {
            const frame = document.getElementById('memecardFrame')?.contentWindow;
            if (frame && typeof frame.memeJoinRoom === 'function') {
              frame.memeJoinRoom(v.roomId);
              if (frame.memeRoom) {
                frame.memeRoom.peerId = sender?.networkId || v.from;
                frame.memeRoom.peerName = senderName;
                frame.memeRoom.challengeId = v.nonce;
                frame.memeRoom.rankOpponentUid = v.from;
              }
              window.pendingInviteJoin = null;
              break;
            }
            await new Promise(r => setTimeout(r, 100));
          }
        } else {
          stopGlobalInvite();
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = err.message || 'Lỗi xử lý lời mời';
        for (const btn of modal.querySelectorAll('button')) btn.disabled = false;
      }
    };

    modal.querySelector('#globalAcceptDuelBtn').onclick = () => respond(true);
    modal.querySelector('#globalDeclineDuelBtn').onclick = () => respond(false);
  }

  function startGlobalInviteListener(user) {
    if (globalInviteUnsub) { globalInviteUnsub(); globalInviteUnsub = null; }
    stopGlobalInvite();
    if (!user?.uid || !identity?.db) return;
    const isMainSite = !!document.getElementById('memecardFrame');
    if (!isMainSite) return;

    const store = identity.db;
    const expMs = val => typeof val?.toMillis === 'function' ? val.toMillis() : (Number(val) || 0);
    const inviteExpiry = val => val?.createdAt ? (expMs(val.createdAt) + 60000) : expMs(val?.expiresAt);

    globalInviteUnsub = store.collection('duel_invites').where('to', '==', user.uid).onSnapshot(async snap => {
      const pendingDoc = snap.docs.find(d => {
        const val = d.data();
        return val && val.status === 'pending' && inviteExpiry(val) > Date.now();
      });
      if (!pendingDoc) {
        stopGlobalInvite();
        return;
      }
      const invVal = pendingDoc.data();
      const cardModal = document.getElementById('memecardGameModal');
      const isCardOpen = cardModal && cardModal.style.display !== 'none' && cardModal.style.display !== '';
      if (isCardOpen) {
        return;
      }
      try {
        let sender = null;
        const [pSnap, dSnap] = await Promise.all([
          store.doc('duel_players/' + invVal.from).get().catch(() => null),
          store.doc('duel_directory/' + invVal.from).get().catch(() => null)
        ]);
        if (pSnap?.exists) sender = pSnap.data();
        else if (dSnap?.exists) sender = dSnap.data();
        showGlobalInvite(pendingDoc.id, invVal, sender || { name: 'Đấu sĩ' });
      } catch (err) {
        console.warn('Global invite listener sender lookup error:', err);
      }
    }, err => {
      console.warn('Global invite listener error:', err?.message || err);
    });
  }

  identity.subscribe(async ({ user, ready }) => {
    if (!ready) return;
    if (!user) {
      stop();
      if (globalInviteUnsub) { globalInviteUnsub(); globalInviteUnsub = null; }
      stopGlobalInvite();
      profile = null;
      paint();
      return;
    }
    startGlobalInviteListener(user);
    await loadProfile(user);
  });`;

  if (!norm(code).includes(norm(targetRankEnd))) {
    throw new Error('Target rank identity.subscribe not found in site_rank.js');
  }
  code = norm(code).replace(norm(targetRankEnd), norm(replacementRankEnd));
  fs.writeFileSync(filePath, code.replace(/\n/g, '\r\n'), 'utf8');
  console.log('✓ assets/js/site_rank.js patched');
  }
}

// 5. Patch assets/css/site_rank.css
{
  const filePath = path.join(root, 'assets/css/site_rank.css');
  let code = fs.readFileSync(filePath, 'utf8');

  const extraStyles = `
/* Global Duel Invite Overlay for index.html */
.global-duel-invite-overlay {
  position: fixed;
  inset: 0;
  z-index: 280000;
  background: rgba(4, 15, 24, 0.85);
  backdrop-filter: blur(5px);
  display: grid;
  place-items: center;
  padding: 16px;
  box-sizing: border-box;
  font-family: 'Nunito', system-ui, sans-serif;
  animation: rankFadeIn .25s ease-out;
}
.global-invite-card {
  position: relative;
  width: min(440px, 100%);
  box-sizing: border-box;
  background: linear-gradient(160deg, #133a54, #0a1f30);
  border: 2px solid #f59e0b;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 16px 50px rgba(0,0,0,0.8), 0 0 35px rgba(245, 158, 11, 0.3);
  text-align: center;
  color: #edf9ff;
}
.global-invite-badge {
  display: inline-block;
  padding: 4px 14px;
  background: linear-gradient(90deg, #b91c1c, #d97706);
  border: 1px solid #fbbf24;
  border-radius: 999px;
  color: #fff;
  font-size: 11.5px;
  font-weight: 900;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.global-invite-card h3 {
  margin: 0 0 8px;
  color: #fde68a;
  font-size: 20px;
}
.global-invite-sender {
  margin: 10px 0;
  font-size: 15px;
  line-height: 1.4;
  color: #e2e8f0;
}
.global-invite-timer {
  margin: 6px 0 18px;
  font-size: 13.5px;
  color: #94a3b8;
}
.global-invite-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.global-invite-actions button {
  min-height: 44px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 900;
  border-radius: 12px;
  cursor: pointer;
  flex: 1 1 140px;
}
.global-invite-actions .primary-btn {
  background: linear-gradient(135deg, #16a34a, #15803d);
  border: 1.5px solid #86efac;
  color: #fff;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.4);
}
.global-invite-actions .secondary-btn {
  background: #334155;
  border: 1.5px solid #64748b;
  color: #f1f5f9;
}
@media(max-width: 600px) {
  .global-invite-card { padding: 18px 14px; border-radius: 16px; }
  .global-invite-card h3 { font-size: 18px; }
  .global-invite-sender { font-size: 14px; }
  .global-invite-actions button { width: 100%; min-height: 42px; font-size: 13.5px; }
}
`;

  if (!code.includes('global-duel-invite-overlay')) {
    code += extraStyles;
    fs.writeFileSync(filePath, code.replace(/\n/g, '\r\n'), 'utf8');
    console.log('✓ assets/css/site_rank.css patched');
  }
}

console.log('All patches applied successfully!');
