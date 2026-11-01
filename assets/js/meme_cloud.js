// Cloud sync for the local progression store: pull on sign-in, push when the local copy changes.
(function () {
  'use strict';

  const P = window.memeProgress;
  if (!P) return;

  const PATH = 'player_progress/';
  const DEBOUNCE = 4000;
  const FETCH_TIMEOUT = 8000;
  const LABEL = {
    off: 'Không dùng',
    guest: 'Khách',
    loading: 'Đang tải…',
    syncing: 'Đang lưu…',
    synced: 'Đã lưu',
    loaded: 'Đã tải',
    error: 'Lỗi lưu'
  };

  const $id = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('vi-VN');
  const clock = ms => {
    const d = new Date(Number(ms) || 0);
    return Number.isFinite(d.getTime()) && d.getTime() ? d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—';
  };

  let uid = null, store = null, status = 'off', lastError = '', lastSyncedAt = 0;
  let dirty = false, timer = null, flight = null;

  function serverStamp() {
    try {
      const fv = window.firebase?.firestore?.FieldValue;
      if (fv?.serverTimestamp) return fv.serverTimestamp();
    } catch { /* the compat SDK may still be loading */ }
    return Date.now();
  }

  function docRef() {
    return store && uid ? store.doc(PATH + uid) : null;
  }

  function payload() {
    return { v: 1, uid, savedAt: P.state.updatedAt, state: P.snapshot() };
  }

  function setStatus(next, message) {
    status = next;
    lastError = message ? String(message) : '';
    if (next === 'synced' || next === 'loaded') lastSyncedAt = Date.now();
    paint();
  }

  function title() {
    if (status === 'guest') return 'Đăng nhập Google để lưu tiến trình lên cloud';
    if (status === 'error') return `Không đồng bộ được: ${lastError || 'lỗi mạng'} · Tiến trình vẫn an toàn trên máy này`;
    if (status === 'loading') return 'Đang tải tiến trình đã lưu trên cloud…';
    if (status === 'syncing') return 'Đang gửi tiến trình lên cloud…';
    return `Đã đồng bộ lúc ${clock(lastSyncedAt)} · Bấm để mở hồ sơ`;
  }

  function paint() {
    ensureChip();
    const label = $id('cloudState');
    if (label) label.textContent = LABEL[status] || LABEL.off;
    const chip = $id('cloudBtn');
    if (chip) {
      chip.dataset.state = status;
      chip.title = title();
    }
  }

  function ensureChip() {
    if ($id('cloudBtn')) return;
    const chips = document.querySelector('.progress-chips');
    if (!chips) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'cloudBtn';
    btn.className = 'progress-chip cloud';
    btn.innerHTML = '☁️ <b id="cloudState">Khách</b>';
    btn.onclick = () => window.memeProfile?.open();
    chips.appendChild(btn);
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      Promise.resolve(promise),
      new Promise((resolve, reject) => setTimeout(() => reject(Error('Hết thời gian chờ cloud')), ms))
    ]);
  }

  function send(body) {
    const ref = docRef();
    if (!ref) return Promise.reject(Error('Chưa đăng nhập'));
    return withTimeout(ref.set({ ...body, syncedAt: serverStamp() }), FETCH_TIMEOUT);
  }

  async function pushNow() {
    if (!uid || !store) return { ok: false, error: 'Chưa đăng nhập' };
    if (flight) { try { await flight; } catch { /* reported by the original caller */ } }
    dirty = false;
    const body = payload();
    setStatus('syncing');
    flight = send(body).then(() => {
      flight = null;
      setStatus('synced');
      return { ok: true };
    }).catch(error => {
      flight = null;
      dirty = true;
      setStatus('error', error?.message || error?.code);
      return { ok: false, error: error?.message || error?.code || 'lỗi' };
    });
    return flight;
  }

  async function pull(options = {}) {
    if (!uid || !store) return { ok: false, error: 'Chưa đăng nhập' };
    const ref = docRef();
    setStatus('loading');
    let cloud = null;
    try {
      const snap = await withTimeout(ref.get(), FETCH_TIMEOUT);
      cloud = snap && snap.exists ? snap.data() : null;
    } catch (error) {
      setStatus('error', error?.message || error?.code);
      return { ok: false, error: error?.message || error?.code || 'lỗi' };
    }
    const cloudAt = Number(cloud?.savedAt) || 0;
    if (!cloud || !cloud.state) {
      const pushed = await pushNow();
      return { ok: pushed.ok, adopted: false, error: pushed.error };
    }
    if (cloudAt > P.state.updatedAt || options.force) {
      P.adoptCloud(cloud.state);
      window.memePacks?.refresh?.();
      setStatus('loaded');
      return { ok: true, adopted: true };
    }
    setStatus('synced');
    if (options.force) return { ok: true, adopted: false };
    schedule();
    return { ok: true, adopted: false };
  }

  function schedule() {
    if (!uid || !store) return;
    dirty = true;
    clearTimeout(timer);
    timer = setTimeout(() => { if (dirty) pushNow(); }, DEBOUNCE);
  }

  function onIdentity(next) {
    if (!next?.ready) return;
    const nextUid = next.user?.uid || null;
    const nextStore = window.siteIdentity?.db || null;
    if (nextUid === uid && nextStore === store) return;
    uid = nextUid;
    store = nextStore;
    if (!uid || !store) {
      clearTimeout(timer);
      timer = null;
      setStatus('guest');
      return;
    }
    pull();
  }

  window.memeCloud = {
    DEBOUNCE, PATH,
    onLocalSave() { schedule(); },
    pushNow, pull, paint,
    get status() { return status; },
    get account() { return uid; },
    get error() { return lastError; },
    get pending() { return dirty; }
  };

  if (window.siteIdentity?.subscribe) window.siteIdentity.subscribe(onIdentity);
  else setStatus('off');

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && dirty) pushNow();
  });
  window.addEventListener('pagehide', () => {
    if (dirty) pushNow();
  });
})();
