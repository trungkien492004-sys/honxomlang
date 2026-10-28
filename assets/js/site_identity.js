// One Firebase identity shared by the lobby and the duel iframe.
(() => {
  try {
    if (window.siteIdentity && window.siteIdentity.db && window.siteIdentity.user) {
      return;
    }
    if (parent !== window && parent.siteIdentity) {
      window.siteIdentity = parent.siteIdentity;
      return;
    }
  } catch {}

  const listeners = new Set();
  let user = null;
  let ready = false;
  let auth = null;
  let db = null;
  let signing = false;
  let presenceTimer = null;

  const config = {
    apiKey: 'AIzaSyAmDg8G0HBEAYoCoEGrIoh8skR6oi-Za1I',
    authDomain: 'honxomlang-e6974.firebaseapp.com',
    projectId: 'honxomlang-e6974',
    appId: '1:163191088062:web:daa4fca2521f3dcd0ccfef'
  };
  const isGoogle = value => !!value && !value.isAnonymous;
  const emit = () => listeners.forEach(listener => listener({ user, ready }));
  const timestamp = () => firebase.firestore.FieldValue.serverTimestamp();
  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(Error('Không tải được đăng nhập. Hãy tải lại trang.'));
    document.head.appendChild(script);
  });

  async function publishPresence(account, online) {
    if (!db || !account?.uid) return;
    const uid = account.uid;
    const stamp = timestamp();
    const created = Date.parse(account.metadata?.creationTime);
    const profile = {
      uid,
      name: String(account.displayName || 'Đấu sĩ').slice(0, 48),
      newbieUntil: Number.isFinite(created) ? created + 7 * 86400000 : 0,
      online,
      lastSeen: stamp,
      updatedAt: stamp
    };
    await db.doc('duel_directory/' + uid).set(profile, { merge: true });

    // The public directory contains no deck data. Keep the owner's saved deck
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
    }
  }

  async function registerMember(account) {
    const ref = db.doc('site_members/' + account.uid);
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      const stamp = timestamp();
      if (snapshot.exists) transaction.update(ref, { lastSeen: stamp });
      else transaction.set(ref, { uid: account.uid, joinedAt: stamp, lastSeen: stamp });
    });
  }

  function startPresence(account) {
    clearInterval(presenceTimer);
    if (!account) return;
    const tick = () => {
      if (user?.uid !== account.uid) return;
      publishPresence(account, true).catch(error => console.warn('Presence update:', error.code || error.message));
    };
    tick();
    presenceTimer = setInterval(tick, 25000);
  }

  const boot = (async () => {
    if (!window.firebase?.apps) {
      await load('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
      await load('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js');
      await load('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');
    }
    if (!firebase.apps.length) firebase.initializeApp(config);
    auth = firebase.auth();
    db = firebase.firestore();
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch(() => auth.setPersistence(firebase.auth.Auth.Persistence.SESSION))
      .catch(() => {});
    auth.onAuthStateChanged(async value => {
      const previous = user;
      user = isGoogle(value) ? value : null;
      ready = true;
      emit();
      clearInterval(presenceTimer);
      if (user) {
        window.currentFirebaseUser = window.currentFirebaseUser || user;
        window.myNetworkId = window.myNetworkId || ('P_' + user.uid.slice(0, 10));
        startPresence(user);
        registerMember(user).catch(error => console.warn('Site membership:', error.code || error.message));
        if (typeof window.startNetworkListeners === 'function') window.startNetworkListeners();
      } else if (previous) {
        publishPresence(previous, false).catch(error => console.warn('Presence sign-out:', error.code || error.message));
      }
    });
  })().catch(error => {
    ready = true;
    window.siteIdentity.error = error.message;
    emit();
  });

  window.siteIdentity = {
    whenReady: boot,
    get user() { return user; },
    get ready() { return ready; },
    get db() { return db; },
    get signing() { return signing; },
    get newbie() {
      const created = Date.parse(user?.metadata?.creationTime);
      return Number.isFinite(created) && Date.now() < created + 7 * 86400000;
    },
    subscribe(listener) {
      listeners.add(listener);
      listener({ user, ready });
      return () => listeners.delete(listener);
    },
    async login() {
      await boot;
      if (!auth) throw Error('Đăng nhập chưa sẵn sàng. Hãy tải lại trang.');
      if (signing) return;
      if (user) return user;
      signing = true;
      try {
        return (await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())).user;
      } finally {
        signing = false;
      }
    },
    async logout() {
      await boot;
      await auth?.signOut();
    }
  };
})();
