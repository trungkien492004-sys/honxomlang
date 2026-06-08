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
    _showSignOutBtn(user.displayName);
    await openCharacterSelection(user);
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
        
        await openCharacterSelection(user);
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

// ── Màn hình Chọn Nhân Vật (3 Slots) ─────────────────────────
window.openCharacterSelection = async function(user) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('characterSelectScreen').classList.add('active');
    
    const container = document.getElementById('characterSlotsContainer');
    container.innerHTML = '<div style="color:#94a3b8; width:100%; text-align:center;">Đang tải dữ liệu Cloud...</div>';

    // Đọc 3 slot
    const slotIDs = [user.uid, `${user.uid}_2`, `${user.uid}_3`];
    const slotsData = await Promise.all(slotIDs.map(id => loadGameFromCloud(id)));

    container.innerHTML = '';
    slotsData.forEach((data, index) => {
        const docId = slotIDs[index];
        const slotName = `Slot ${index + 1}`;
        
        const card = document.createElement('div');
        card.className = 'class-card ' + (data ? (data.classId || 'cop') : '');
        card.style.position = 'relative';
        
        if(data && data.classId) {
            // Đã có nhân vật
            let emoji = '🏃';
            if(data.classId === 'cop') emoji = '👮‍♂️';
            if(data.classId === 'teacher') emoji = '👩‍🏫';
            if(data.classId === 'merchant') emoji = '🧳';
            if(data.classId === 'engineer') emoji = '👷‍♂️';
            
            card.innerHTML = `
                <div style="position:absolute;top:8px;right:12px;font-size:0.7rem;color:#94a3b8;font-weight:bold;">${slotName}</div>
                <div class="class-emoji">${emoji}</div>
                <div class="class-name">${data.name}</div>
                <div class="class-desc" style="color:#fbbf24;font-weight:bold;margin-bottom:4px;">Cấp độ: ${data.level || 1}</div>
                <div class="class-desc">💰 ${data.gold || 0} vàng</div>
            `;
            card.onclick = () => selectExistingCharacter(docId, data);
        } else {
            // Trống
            card.style.background = 'rgba(255,255,255,0.02)';
            card.style.border = '2px dashed rgba(255,255,255,0.1)';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            card.style.flexDirection = 'column';
            card.innerHTML = `
                <div style="position:absolute;top:8px;right:12px;font-size:0.7rem;color:#94a3b8;font-weight:bold;">${slotName}</div>
                <div style="font-size:2.5rem;color:#475569;margin-bottom:10px;">➕</div>
                <div style="color:#94a3b8;font-weight:bold;">Tạo Nhân Vật</div>
            `;
            card.onclick = () => createNewCharacter(docId);
        }
        container.appendChild(card);
    });
};

window.selectExistingCharacter = function(docId, data) {
    window.currentSlotId = docId;
    window._cloudSaveData = data;
    
    // Inject the data into the game player object directly!
    Object.assign(window.player, data);
    
    // Đảm bảo có init class stats
    if(typeof CLASS_DATA !== 'undefined' && data.classId) {
        let t = CLASS_DATA[data.classId];
        if(!window.player.skills || window.player.skills.length === 0) window.player.skills = JSON.parse(JSON.stringify(t.skills));
    }

    _fbToast(`☁️ Tải save: ${data.name} Lv.${data.level}`, '#fbbf24');
    
    // Hide screens and start the game!
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('gameScreen').classList.add('active');
    
    if (typeof spawnInitialMonsters === 'function') spawnInitialMonsters();
    if (typeof mainGameLoop === 'function') requestAnimationFrame(mainGameLoop);
    if (typeof rebuildQuickSkillBarUI === 'function') rebuildQuickSkillBarUI();
    if (typeof refreshHudDisplay === 'function') refreshHudDisplay();
    
    try { audio.play('levelup'); } catch(e){}
    try { window.currentScreen = 'gameScreen'; } catch(e){}
};

window.createNewCharacter = function(docId) {
    window.currentSlotId = docId;
    window._cloudSaveData = null; // Bắt đầu mới
    
    const inp = document.getElementById('usernameInp');
    if (inp && window.currentFirebaseUser && window.currentFirebaseUser.displayName) {
        inp.value = window.currentFirebaseUser.displayName.split(' ')[0];
    }
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('loginScreen').classList.add('active');
    
    // Ẩn nút Google vì đã login rồi
    const btnGoogle = document.querySelector('.btn-google');
    if(btnGoogle) btnGoogle.style.display = 'none';
};

// ── signOutUser ───────────────────────────────────────────────
window.signOutUser = async function() {
    await auth.signOut();
    window.currentFirebaseUser = null;
    window._cloudSaveEnabled   = false;
    window._cloudSaveData      = null;
    window.currentSlotId       = null;
    location.reload();
};

// ── saveGameToCloud ───────────────────────────────────────────
window.saveGameToCloud = async function(playerData) {
    if (!window.currentFirebaseUser || !playerData || !window.currentSlotId) return false;
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
        await db.collection('players').doc(window.currentSlotId).set(data, { merge: true });
        return true;
    } catch (err) {
        console.error('[Firebase] Save error:', err);
        return false;
    }
};

// ── loadGameFromCloud ─────────────────────────────────────────
window.loadGameFromCloud = async function(docId) {
    try {
        const doc = await db.collection('players').doc(docId).get();
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
