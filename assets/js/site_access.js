(() => {
  const isFixture = (() => { try { return parent && parent.location && parent.location.pathname === '/fixture'; } catch(e) { return false; } })();
  const duelPage = !!document.getElementById('lobby'), identity = window.siteIdentity;
  const devDirect = (location.hostname === '127.0.0.1' || location.hostname === 'localhost') && !isFixture;
  const legacyBoot = !duelPage && (typeof window._legacyAuthReady === 'boolean' || typeof window.initUserSession === 'function');
  let allowed = duelPage || !!window._testAllowed || devDirect, guestMode = false, legacyForced = false, lastUid = null, lastState = { user: null, ready: false };

  const gate = document.createElement('section');
  gate.id = 'siteAuthGate';
  gate.hidden = true;
  gate.setAttribute('aria-label', 'Đăng nhập để chơi');
  gate.innerHTML = '<div class="site-auth-card"><b>YU-GI-OH! DM / GX</b><h1>Đăng nhập để vào game</h1><p>Đăng nhập Google một lần để lưu thứ hạng Elo và thi đấu trên BXH.</p><button id="siteGoogleLogin" type="button">Đăng nhập Google</button><button id="siteGuestContinue" type="button" style="background:#2563eb;color:#fff;margin-top:6px;border-radius:8px;padding:8px 16px;font-weight:bold;cursor:pointer;border:none;">Chơi dạng Khách (Guest)</button><button id="siteGuestLeaderboard" type="button">BXH Rank</button><p id="siteAuthStatus" role="status">Đang khôi phục đăng nhập…</p></div>';
  document.body.appendChild(gate);

  const status = gate.querySelector('#siteAuthStatus'), login = gate.querySelector('#siteGoogleLogin');
  const emit = () => document.dispatchEvent(new CustomEvent('site-identity-changed'));
  login.onclick = async () => {
    login.disabled = true; status.textContent = 'Đang đăng nhập…';
    try { await identity.login(); }
    catch(e) { status.textContent = e.code === 'auth/popup-closed-by-user' ? 'Bạn đã đóng cửa sổ đăng nhập.' : e.message || 'Không đăng nhập được.'; }
    finally { login.disabled = false; }
  };
  gate.querySelector('#siteGuestLeaderboard').onclick = () => window.siteRank?.show();
  gate.querySelector('#siteGuestContinue').onclick = () => {
    guestMode = true; allowed = true; open();
    document.querySelectorAll('#gameModeScreen [onclick*="signOutUser"]').forEach(button => { button.hidden = true; });
    if (document.getElementById('loginScreen')?.classList.contains('active')) window.switchScreen?.('gameModeScreen');
    emit();
  };

  function block() {
    if (duelPage) return; // Do not lock the duel page for guests
    document.documentElement.classList.add('auth-pending');
    gate.hidden = false;
  }
  function hold() {
    if (duelPage) return;
    document.documentElement.classList.add('auth-pending');
    gate.hidden = true;
  }
  function open() {
    document.documentElement.classList.remove('auth-pending');
    gate.hidden = true;
    if (!duelPage && !guestMode && lastState.user) {
      const active = document.querySelector('.screen.active')?.id;
      if (!active || active === 'loginScreen') window.switchScreen?.('gameModeScreen');
    }
  }
  function legacyReady() {
    if (duelPage || !legacyBoot) return true;
    return window._legacyAuthReady === true || legacyForced;
  }
  function repaint(state) {
    lastState = state;
    const { user, ready } = state;
    const bypass = !!window._testAllowed || devDirect;
    allowed = duelPage || (!!user && legacyReady()) || bypass || guestMode;
    if (duelPage || bypass || guestMode) {
      open();
      if (duelPage) lastUid = user?.uid || null;
      emit();
      return;
    }
    // Keep the boot splash until both auth systems settle: showing the login card (or the legacy
    // #loginScreen) while Firebase is still restoring is what made the gate flicker.
    if (!ready || !legacyReady()) { hold(); return; }
    if (!user) {
      block();
      status.textContent = identity.error || 'Đăng nhập Google để vào game.';
    } else {
      open();
    }
    emit();
  }
  identity.subscribe(repaint);
  window.memeAccess = { get allowed() { return allowed; }, require() { return true; } };
  window.addEventListener('legacy-auth-ready', () => repaint(lastState));
  try { if (parent !== window) parent.addEventListener('legacy-auth-ready', () => repaint(lastState)); } catch {}
  if (legacyBoot) setTimeout(() => {
    if (window._legacyAuthReady !== true) { legacyForced = true; repaint(lastState); }
  }, 10000);

  if (duelPage) {
    open();
  } else {
    const screen = window.switchScreen;
    if (screen) window.switchScreen = (id, ...args) => screen(id !== 'loginScreen' && lastState.ready && legacyReady() && !allowed && !window._testAllowed && !devDirect ? 'loginScreen' : id, ...args);
    let autoOpened = false;
    const auto = () => {
      if (autoOpened || !allowed || new URLSearchParams(location.search).get('play') !== 'duel' || !window._pendingCharFlow || !window.currentFirebaseUser) return;
      autoOpened = true;
      window.openMemeCardGame?.();
    };
    window.addEventListener('site-session-ready', auto);
    window.addEventListener('legacy-auth-ready', auto);
    identity.subscribe(auto);
  }
})();
