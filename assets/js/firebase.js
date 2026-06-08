// ===== 🔥 FIREBASE.JS — Auth + Firestore Cloud Save =====
// Load TRƯỚC game.js trong index.html

// ── Config ───────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyAmDg8G0HBEAYoCoEGrIoh8skR6oi-Za1I",
    authDomain: "honxomlang-e6974.firebaseapp.com",
    projectId: "honxomlang-e6974",
    storageBucket: "honxomlang-e6974.firebasestorage.app",
    messagingSenderId: "163191088062",
    appId: "1:163191088062:web:daa4fca2521f3dcd0ccfef",
    measurementId: "G-7JGTL5WDGS"
};

// ── Initialize ───────────────────────────────────────────────
firebase.initializeApp(firebaseConfig);
const auth    = firebase.auth();
const db      = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

window.currentFirebaseUser = null;
window._cloudSaveEnabled   = false;

// ── Auth State Listener ──────────────────────────────────────
auth.onAuthStateChanged(async (user) => {
    window.currentFirebaseUser = user;
    if (!user) return;

    // Thử load save cũ từ cloud
    const saved = await loadGameFromCloud(user.uid);
    const inp   = document.getElementById('usernameInp');
    const notice = document.getElementById('saveNotice');

    if (saved && saved.classId) {
        if (inp) inp.value = saved.name || user.displayName?.split(' ')[0] || 'Hero';
        if (notice) {
            notice.style.display = 'block';
            notice.innerHTML = `☁️ Tìm thấy save cloud của <b>${saved.name}</b> (Lv.${saved.level}) — Nhấn vào Xóm để tiếp tục!`;
        }
        // Lưu save vào window để submitLogin có thể dùng
        window._cloudSaveData = saved;
    } else {
        if (inp && user.displayName) inp.value = user.displayName.split(' ')[0];
        if (notice) {
            notice.style.display = 'block';
            notice.innerHTML = `✅ Đăng nhập Google thành công! Chọn nghề để bắt đầu.`;
        }
    }
    window._cloudSaveEnabled = true;
});

// ── loginWithGoogle ──────────────────────────────────────────
window.loginWithGoogle = async function() {
    try {
        _showLoginToast('⏳ Đang mở cửa sổ đăng nhập Google...', '#4fc3f7');
        const result = await auth.signInWithPopup(googleProvider);
        const user   = result.user;
        window.currentFirebaseUser = user;
        _showLoginToast(`✅ Xin chào ${user.displayName}! Đang tải dữ liệu...`, '#22c55e');

        const saved = await loadGameFromCloud(user.uid);
        const inp   = document.getElementById('usernameInp');

        if (saved && saved.classId) {
            window._cloudSaveData = saved;
            if (inp) inp.value = saved.name;
            _showLoginToast(`☁️ Đã tải save: ${saved.name} Lv.${saved.level} 💰${saved.gold}`, '#fbbf24');
        } else {
            if (inp && user.displayName) inp.value = user.displayName.split(' ')[0];
            window._cloudSaveData = null;
            _showLoginToast(`🎮 Tài khoản mới! Chọn nghề để bắt đầu.`, '#22c55e');
        }
        window._cloudSaveEnabled = true;

    } catch (err) {
        console.error('[Firebase] Login error:', err);
        if (err.code === 'auth/popup-blocked') {
            _showLoginToast('⚠️ Trình duyệt chặn popup! Hãy cho phép popup cho trang này.', '#f97316');
        } else if (err.code === 'auth/unauthorized-domain') {
            _showLoginToast('⚠️ Domain chưa được cấp phép trong Firebase Console!', '#ef4444');
        } else if (err.code !== 'auth/cancelled-popup-request') {
            _showLoginToast(`❌ Lỗi: ${err.message}`, '#ef4444');
        }
    }
};

// ── signOutUser ──────────────────────────────────────────────
window.signOutUser = async function() {
    await auth.signOut();
    window.currentFirebaseUser = null;
    window._cloudSaveEnabled   = false;
    window._cloudSaveData      = null;
    location.reload();
};

// ── saveGameToCloud ──────────────────────────────────────────
window.saveGameToCloud = async function(playerData) {
    if (!window.currentFirebaseUser || !playerData) return false;
    try {
        const saveData = {
            name:      playerData.name,
            classId:   playerData.classId,
            level:     playerData.level      || 1,
            exp:       playerData.exp        || 0,
            maxExp:    playerData.maxExp     || 100,
            hp:        playerData.hp         || 100,
            maxHp:     playerData.maxHp      || 100,
            mp:        playerData.mp         || 50,
            maxMp:     playerData.maxMp      || 50,
            gold:      playerData.gold       || 0,
            baseAtk:   playerData.baseAtk    || 10,
            baseDef:   playerData.baseDef    || 5,
            inventory: JSON.parse(JSON.stringify(playerData.inventory  || [])),
            equipment: JSON.parse(JSON.stringify(playerData.equipment  || {})),
            quests:    JSON.parse(JSON.stringify(
                (playerData.quests || []).map(q => ({
                    id: q.id, title: q.title, type: q.type,
                    target: q.target, req: q.req,
                    progress: q.progress, done: q.done
                }))
            )),
            displayName: window.currentFirebaseUser.displayName || playerData.name,
            email:       window.currentFirebaseUser.email || '',
            lastSaved:   firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('players').doc(window.currentFirebaseUser.uid).set(saveData, { merge: true });
        console.log('[Firebase] ☁️ Game saved to cloud!');
        return true;
    } catch (err) {
        console.error('[Firebase] Save error:', err);
        return false;
    }
};

// ── loadGameFromCloud ────────────────────────────────────────
window.loadGameFromCloud = async function(uid) {
    try {
        const doc = await db.collection('players').doc(uid).get();
        return doc.exists ? doc.data() : null;
    } catch (err) {
        console.error('[Firebase] Load error:', err);
        return null;
    }
};

// ── Patch auto-save để sync cloud ───────────────────────────
// Được gọi sau khi game.js load xong
window._patchCloudSave = function() {
    // Patch triggerManualSave
    const origSave = window.triggerManualSave;
    window.triggerManualSave = async function() {
        if(origSave) origSave();
        if(window._cloudSaveEnabled && window.player && window.currentFirebaseUser) {
            const ok = await window.saveGameToCloud(window.player);
            if(ok) showToast('☁️ Đã lưu lên cloud thành công!');
        }
    };

    // Patch submitLogin để load cloud save nếu có
    const origLogin = window.submitLogin;
    window.submitLogin = function(forcedSave) {
        const saved = forcedSave || window._cloudSaveData;
        if(saved && saved.classId) {
            // Có cloud save → apply vào game
            window._pendingCloudRestore = saved;
        }
        if(origLogin) origLogin(forcedSave);
    };

    console.log('[Firebase] ✅ Auto-save patch applied!');
};

// ── Helper: apply cloud save vào player object ───────────────
window.applyCloudSaveToPlayer = function(playerObj, savedData) {
    if (!savedData || !playerObj) return;
    const fields = ['level','exp','maxExp','gold','baseAtk','baseDef',
                    'inventory','equipment','quests','hp','maxHp','mp','maxMp'];
    fields.forEach(f => {
        if (savedData[f] !== undefined) playerObj[f] = savedData[f];
    });
    // Also restore name & class
    if (savedData.name)    playerObj.name    = savedData.name;
    if (savedData.classId) playerObj.classId = savedData.classId;
};

// ── UI Toast for login screen ─────────────────────────────────
function _showLoginToast(msg, color = '#fbbf24') {
    const old = document.getElementById('_fbToast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = '_fbToast';
    el.style.cssText = [
        'position:fixed', 'top:20px', 'left:50%', 'transform:translateX(-50%)',
        `background:rgba(10,10,25,0.95)`, `color:${color}`,
        'padding:12px 24px', 'border-radius:12px', 'z-index:999999',
        'font-size:0.9rem', 'font-weight:700', 'font-family:inherit',
        `border:1px solid ${color}44`, 'box-shadow:0 4px 20px rgba(0,0,0,0.5)',
        'text-align:center', 'max-width:90vw', 'transition:opacity 0.3s'
    ].join(';');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; setTimeout(()=>el.remove(), 300); }, 4000);
}

// ── Periodic cloud auto-save every 5 minutes ─────────────────
setInterval(async () => {
    if(window._cloudSaveEnabled && window.currentFirebaseUser && window.player && window.player.classId) {
        await window.saveGameToCloud(window.player);
        console.log('[Firebase] ⏰ Auto cloud save triggered');
    }
}, 5 * 60 * 1000);

// ── Wait for game.js to load then apply patches ───────────────
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window._patchCloudSave?.(), 1000);
});

console.log('🔥 [firebase.js] Auth + Firestore initialized for honxomlang!');
