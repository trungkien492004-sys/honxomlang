// ===== 🔥 FIREBASE.JS v2 — Redirect Auth + Firestore =====
// Dùng signInWithRedirect thay popup (không bị trình duyệt chặn)

const firebaseConfig = {
    apiKey: "AIzaSyAmDg8G0HBEAYoCoEGrIoh8skR6oi-Za1I",
    authDomain: "honxomlang-e6974.firebaseapp.com",
    projectId: "honxomlang-e6974",
    storageBucket: "honxomlang-e6974.firebasestorage.app",
    messagingSenderId: "163191088062",
    appId: "1:163191088062:web:daa4fca2521f3dcd0ccfef",
    measurementId: "G-7JGTL5WDGS"
};

// ── Init ─────────────────────────────────────────────────────
firebase.initializeApp(firebaseConfig);
const auth           = firebase.auth();
const db             = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

window.currentFirebaseUser = null;
window._cloudSaveEnabled   = false;
window._cloudSaveData      = null;

// ── Auth State (theo dõi đăng nhập sẵn có) ───────────────────
auth.onAuthStateChanged(async (user) => {
    window.currentFirebaseUser = user;
    if (!user) return;

    window._cloudSaveEnabled = true;
    const saved = await loadGameFromCloud(user.uid);

    const inp    = document.getElementById('usernameInp');
    const notice = document.getElementById('saveNotice');

    if (saved && saved.classId) {
        window._cloudSaveData = saved;
        if (inp) inp.value = saved.name;
        if (notice) {
            notice.style.display = 'block';
            notice.innerHTML = `☁️ <b>${user.displayName}</b> — Save: ${saved.name} Lv.${saved.level} · 💰${saved.gold} vàng<br><small style="color:#94a3b8">Nhấn "Vào Xóm" để tiếp tục hoặc chờ tự động...</small>`;
        }
        // Auto vào game nếu đã có save
        setTimeout(() => { if(typeof submitLogin==='function') submitLogin(); }, 2000);
    } else {
        if (inp && user.displayName) inp.value = user.displayName.split(' ')[0];
        if (notice) {
            notice.style.display = 'block';
            notice.innerHTML = `✅ Đã đăng nhập: <b>${user.displayName}</b><br><small style="color:#94a3b8">Nhấn "Vào Xóm" để chọn nghề.</small>`;
        }
    }

    _showSignOutBtn(user.displayName);
});

// ── loginWithGoogle — dùng POPUP ────────────
window.loginWithGoogle = async function() {
    _fbToast('⏳ Đang mở cửa sổ đăng nhập...', '#4fc3f7');
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        window.currentFirebaseUser = user;
        window._cloudSaveEnabled = true;

        _fbToast(`✅ Đăng nhập thành công! Xin chào ${user.displayName} 🎉`, '#22c55e');
        _showSignOutBtn(user.displayName);

        const saved = await loadGameFromCloud(user.uid);
        if (saved && saved.classId) {
            window._cloudSaveData = saved;
            const inp = document.getElementById('usernameInp');
            if (inp) inp.value = saved.name;
            _fbToast(`☁️ Tải save: ${saved.name} Lv.${saved.level}`, '#fbbf24');
            setTimeout(() => { if(typeof submitLogin==='function') submitLogin(); }, 1500);
        } else {
            const inp = document.getElementById('usernameInp');
            if (inp && user.displayName) inp.value = user.displayName.split(' ')[0];
            _fbToast('🎮 Tài khoản mới — chọn nghề để bắt đầu!', '#a78bfa');
        }
    } catch (err) {
        console.error('[Firebase] Popup error:', err);
        if (err.code === 'auth/popup-blocked') {
            alert('⚠️ Trình duyệt chặn Popup! Vui lòng cho phép popup trên trang này (nút trên thanh địa chỉ).');
            _fbToast('⚠️ Trình duyệt chặn Popup!', '#ef4444');
        } else {
            _fbToast(`❌ Lỗi: ${err.message}`, '#ef4444');
        }
    }
};

// ── signOutUser ───────────────────────────────────────────────
window.signOutUser = async function() {
    await auth.signOut();
    window.currentFirebaseUser = null;
    window._cloudSaveEnabled   = false;
    window._cloudSaveData      = null;
    location.reload();
};

// ── saveGameToCloud ───────────────────────────────────────────
window.saveGameToCloud = async function(playerData) {
    if (!window.currentFirebaseUser || !playerData) return false;
    try {
        const data = {
            name:      playerData.name,
            classId:   playerData.classId,
            level:     playerData.level    || 1,
            exp:       playerData.exp      || 0,
            maxExp:    playerData.maxExp   || 100,
            hp:        playerData.hp       || 100,
            maxHp:     playerData.maxHp    || 100,
            mp:        playerData.mp       || 50,
            maxMp:     playerData.maxMp    || 50,
            gold:      playerData.gold     || 0,
            baseAtk:   playerData.baseAtk  || 10,
            baseDef:   playerData.baseDef  || 5,
            inventory: JSON.parse(JSON.stringify(playerData.inventory || [])),
            equipment: JSON.parse(JSON.stringify(playerData.equipment || {})),
            quests:    JSON.parse(JSON.stringify(
                (playerData.quests || []).map(q => ({
                    id: q.id, title: q.title, type: q.type,
                    target: q.target, req: q.req,
                    progress: q.progress, done: q.done
                }))
            )),
            uid:         window.currentFirebaseUser.uid,
            displayName: window.currentFirebaseUser.displayName || playerData.name,
            email:       window.currentFirebaseUser.email || '',
            lastSaved:   firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('players').doc(window.currentFirebaseUser.uid).set(data, { merge: true });
        return true;
    } catch (err) {
        console.error('[Firebase] Save error:', err);
        return false;
    }
};

// ── loadGameFromCloud ─────────────────────────────────────────
window.loadGameFromCloud = async function(uid) {
    try {
        const doc = await db.collection('players').doc(uid).get();
        return doc.exists ? doc.data() : null;
    } catch (err) {
        console.error('[Firebase] Load error:', err);
        return null;
    }
};

// ── Patch save functions sau khi game.js load ─────────────────
window._patchCloudSave = function() {
    const origSave = window.triggerManualSave;
    window.triggerManualSave = async function() {
        if (origSave) origSave();
        if (window._cloudSaveEnabled && window.player && window.currentFirebaseUser) {
            const ok = await window.saveGameToCloud(window.player);
            if (ok && typeof showToast === 'function') showToast('☁️ Đã lưu lên cloud!');
        }
    };
    console.log('[Firebase] ✅ triggerManualSave patched for cloud sync');
};

// ── Auto cloud-save mỗi 5 phút ───────────────────────────────
setInterval(async () => {
    if (window._cloudSaveEnabled && window.currentFirebaseUser &&
        window.player && window.player.classId) {
        await window.saveGameToCloud(window.player);
    }
}, 5 * 60 * 1000);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window._patchCloudSave?.(), 1200);
});

// ── UI Helpers ────────────────────────────────────────────────
function _fbToast(msg, color) {
    const old = document.getElementById('_fbToast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = '_fbToast';
    el.style.cssText = [
        'position:fixed', 'top:20px', 'left:50%',
        'transform:translateX(-50%)',
        `background:rgba(10,12,28,0.97)`,
        `color:${color || '#fbbf24'}`,
        'padding:13px 24px', 'border-radius:14px', 'z-index:999999',
        'font-size:0.9rem', 'font-weight:700', 'font-family:inherit',
        `border:1px solid ${(color||'#fbbf24')}55`,
        'box-shadow:0 8px 32px rgba(0,0,0,0.6)',
        'text-align:center', 'max-width:92vw',
        'transition:opacity 0.4s', 'pointer-events:none'
    ].join(';');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
    }, 4500);
}

function _showSignOutBtn(displayName) {
    const btn = document.getElementById('signOutBtn');
    if (btn) {
        btn.style.display = 'block';
        btn.textContent = `🚪 Đăng xuất (${displayName})`;
    }
}

console.log('🔥 [firebase.js v2] Redirect Auth ready — honxomlang');
