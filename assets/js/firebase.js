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

// 🎨 Hàm vẽ nhân vật chibi RPG chất lượng cao bằng đồ họa vector 🎨
window.drawBeautifulRPGChibi = function(ctx, x, y, classId, isMoving = false, scale = 1, faceDirection = 'right', isBlinking = false) {
    ctx.save();
    
    // Animation tick
    let tick = Date.now() / 150;
    let bob = isMoving ? Math.sin(tick) * 4 * scale : Math.sin(Date.now() / 400) * 1.5 * scale;
    let legSwing = isMoving ? Math.sin(tick) * 8 * scale : 0;
    
    // 1. Soft Shadow
    ctx.beginPath();
    ctx.ellipse(x, y + 30 * scale, 18 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fill();
    
    // Offset for bobbing
    let cy = y + bob;
    
    // 2. Legs / Feet
    ctx.fillStyle = '#1e293b'; // Shoes color
    if (isMoving) {
        // Left foot
        ctx.beginPath();
        ctx.arc(x - 8 * scale + legSwing, cy + 28 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Right foot
        ctx.beginPath();
        ctx.arc(x + 8 * scale - legSwing, cy + 28 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Standing feet
        ctx.beginPath();
        ctx.arc(x - 7 * scale, cy + 28 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.arc(x + 7 * scale, cy + 28 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 3. Body / Outfit
    let outfitColor = '#3b82f6'; // Default blue
    let detailColor = '#ffffff';
    if (classId === 'cop') {
        outfitColor = '#1e40af'; // Police Blue
        detailColor = '#eab308'; // Gold badge
    } else if (classId === 'teacher') {
        outfitColor = '#a21caf'; // Purple
        detailColor = '#f472b6'; // Pink ribbon
    } else if (classId === 'merchant') {
        outfitColor = '#ea580c'; // Orange vest
        detailColor = '#b45309'; // Brown pants
    } else if (classId === 'engineer') {
        outfitColor = '#047857'; // Green overalls
        detailColor = '#fbbf24'; // Yellow shirt
    }
    
    ctx.fillStyle = outfitColor;
    ctx.beginPath();
    ctx.roundRect(x - 12 * scale, cy + 8 * scale, 24 * scale, 18 * scale, 6 * scale);
    ctx.fill();
    
    // Body details
    ctx.fillStyle = detailColor;
    if (classId === 'cop') {
        ctx.beginPath();
        ctx.arc(x + (faceDirection === 'left' ? -4 : 4) * scale, cy + 13 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else if (classId === 'teacher') {
        ctx.beginPath();
        ctx.arc(x, cy + 10 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else if (classId === 'merchant') {
        ctx.beginPath();
        ctx.arc(x, cy + 12 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.arc(x, cy + 17 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else if (classId === 'engineer') {
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x - 8 * scale, cy + 8 * scale, 3 * scale, 6 * scale);
        ctx.fillRect(x + 5 * scale, cy + 8 * scale, 3 * scale, 6 * scale);
    }
    
    // 4. Head
    ctx.fillStyle = '#ffedd5'; // Light peach skin tone
    ctx.beginPath();
    ctx.arc(x, cy - 6 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // 5. Hair & Headwear
    ctx.fillStyle = '#451a03'; // Default dark brown hair
    if (classId === 'cop') {
        ctx.fillStyle = '#7c2d12'; // Red-brown hair
        ctx.beginPath();
        ctx.arc(x, cy - 10 * scale, 16 * scale, Math.PI, 0); // Hair top
        ctx.fill();
        
        // Police Cap
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(x, cy - 11 * scale, 15 * scale, Math.PI * 1.15, Math.PI * 1.85);
        ctx.lineTo(x + (faceDirection === 'left' ? -20 : 20) * scale, cy - 13 * scale);
        ctx.closePath();
        ctx.fill();
        // Cap badge
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(x + (faceDirection === 'left' ? -4 : 4) * scale, cy - 14 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else if (classId === 'teacher') {
        ctx.fillStyle = '#18181b'; // Black hair
        ctx.beginPath();
        ctx.arc(x, cy - 7 * scale, 17 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 17 * scale, cy - 7 * scale, 34 * scale, 20 * scale);
        ctx.fillStyle = '#ffedd5'; // Redraw face skin
        ctx.beginPath();
        ctx.arc(x, cy - 4 * scale, 13 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Bangs
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(x, cy - 10 * scale, 15 * scale, Math.PI * 1.1, Math.PI * 1.9);
        ctx.closePath();
        ctx.fill();
        // Red bow
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(x - 12 * scale, cy - 18 * scale, 6 * scale, 4 * scale, Math.PI/4, 0, Math.PI*2);
        ctx.ellipse(x + 12 * scale, cy - 18 * scale, 6 * scale, 4 * scale, -Math.PI/4, 0, Math.PI*2);
        ctx.fill();
    } else if (classId === 'merchant') {
        ctx.fillStyle = '#eab308'; // Blonde hair
        ctx.beginPath();
        ctx.arc(x - 5 * scale, cy - 5 * scale, 14 * scale, 0, Math.PI*2);
        ctx.arc(x + 5 * scale, cy - 5 * scale, 14 * scale, 0, Math.PI*2);
        ctx.fill();
        // Brown hat
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(x, cy - 14 * scale, 20 * scale, 4 * scale, 0, 0, Math.PI * 2); // Brim
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x - 11 * scale, cy - 24 * scale, 22 * scale, 11 * scale, 4 * scale); // Crown
        ctx.fill();
    } else if (classId === 'engineer') {
        ctx.fillStyle = '#27272a'; // Black hair
        ctx.beginPath();
        ctx.arc(x, cy - 7 * scale, 16 * scale, Math.PI, 0);
        ctx.fill();
        // Helmet
        ctx.fillStyle = '#fbbf24'; // Yellow
        ctx.beginPath();
        ctx.arc(x, cy - 12 * scale, 15 * scale, Math.PI * 1.1, Math.PI * 1.9);
        ctx.lineTo(x + 18 * scale, cy - 12 * scale);
        ctx.lineTo(x - 18 * scale, cy - 12 * scale);
        ctx.closePath();
        ctx.fill();
        // Goggles on helmet
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 10 * scale, cy - 10 * scale, 20 * scale, 4 * scale);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x - 8 * scale, cy - 9 * scale, 7 * scale, 3 * scale);
        ctx.fillRect(x + 1 * scale, cy - 9 * scale, 7 * scale, 3 * scale);
    }
    
    // 6. Eyes & Face expression
    let eyeOffsetX = (faceDirection === 'left' ? -4 : 4) * scale;
    let eyeSpacing = 4 * scale;
    ctx.fillStyle = '#0f172a'; // Eye color
    
    let blinkCycle = Date.now() % 4000;
    let blinking = isBlinking || (blinkCycle > 3850);
    
    if (blinking) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(x + eyeOffsetX - eyeSpacing - 2*scale, cy - 6 * scale);
        ctx.lineTo(x + eyeOffsetX - eyeSpacing + 2*scale, cy - 6 * scale);
        ctx.moveTo(x + eyeOffsetX + eyeSpacing - 2*scale, cy - 6 * scale);
        ctx.lineTo(x + eyeOffsetX + eyeSpacing + 2*scale, cy - 6 * scale);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX - eyeSpacing, cy - 6 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX + eyeSpacing, cy - 6 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Eye sparkles
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX - eyeSpacing - 1 * scale, cy - 7 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX + eyeSpacing - 1 * scale, cy - 7 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Mouth (Smile)
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(x + eyeOffsetX, cy - 2 * scale, 2.5 * scale, 0, Math.PI);
    ctx.stroke();
    
    ctx.restore();
};

window.switchScreenState = function(sId) {
    window.currentScreen = sId;
    if (typeof window.switchScreen === 'function') {
        window.switchScreen(sId);
    } else {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(sId);
        if(el) el.classList.add('active');
    }
};

window.loginAsLocalUser = function(username) {
    let localUser = {
        uid: 'local_' + username.toLowerCase(),
        displayName: username,
        email: username.toLowerCase() + '@local.com'
    };
    
    localStorage.setItem('xom_logged_local_user', JSON.stringify(localUser));
    
    window.currentFirebaseUser = localUser;
    window._cloudSaveEnabled = true;
    
    _showSignOutBtn(username);
    
    let savedServer = localStorage.getItem('xom_saved_server');
    if(savedServer) {
        window.currentServerId = savedServer;
        window.openCharacterSelection(localUser);
    } else {
        window.openServerSelection();
    }
};

// 🌟 Auth State
auth.onAuthStateChanged(async (user) => {
    if (user) {
        window.currentFirebaseUser = user;
        window._cloudSaveEnabled = true;
        _showSignOutBtn(user.email ? user.email.split('@')[0] : 'Người chơi');
        
        let savedServer = localStorage.getItem('xom_saved_server');
        if(savedServer) {
            window.currentServerId = savedServer;
            await openCharacterSelection(user);
        } else {
            openServerSelection();
        }
    } else {
        // Kiểm tra xem có session đăng nhập local trước đó không
        let localUserStr = localStorage.getItem('xom_logged_local_user');
        if (localUserStr) {
            try {
                let localUser = JSON.parse(localUserStr);
                window.currentFirebaseUser = localUser;
                window._cloudSaveEnabled = true;
                _showSignOutBtn(localUser.displayName);
                
                let savedServer = localStorage.getItem('xom_saved_server');
                if(savedServer) {
                    window.currentServerId = savedServer;
                    await openCharacterSelection(localUser);
                } else {
                    openServerSelection();
                }
                return;
            } catch(e){}
        }
        
        window.currentFirebaseUser = null;
        window._cloudSaveEnabled = false;
        window.switchScreenState('loginScreen');
    }
});

window.submitClassicLogin = async function(mode) {
    let un = document.getElementById('usernameInp').value.trim();
    let pw = document.getElementById('passwordInp').value.trim();
    let errBox = document.getElementById('loginErrorMsg');
    
    if(un.length < 3 || pw.length < 6) {
        errBox.textContent = "Tài khoản >= 3 ký tự, mật khẩu >= 6 ký tự!";
        errBox.style.display = 'block';
        return;
    }
    
    errBox.style.display = 'none';
    let btnId = mode === 'login' ? 'classicLoginBtn' : 'classicRegisterBtn';
    let originalText = document.getElementById(btnId).textContent;
    document.getElementById(btnId).textContent = "Đang kết nối...";
    
    let userKey = un.toLowerCase();

    // Đồng bộ Local & Cloud
    let accountsStr = localStorage.getItem('xom_local_accounts');
    let localAccounts = {};
    if (accountsStr) {
        try { localAccounts = JSON.parse(accountsStr); } catch(e){}
    }

    try {
        if (mode === 'register') {
            // Kiểm tra trên Cloud Firestore
            let cloudDoc = await db.collection('local_accounts').doc(userKey).get().catch(() => null);
            let existsInCloud = cloudDoc && cloudDoc.exists;
            let existsLocally = !!localAccounts[userKey];

            if (existsInCloud || existsLocally) {
                errBox.textContent = "Tài khoản đã tồn tại, vui lòng Đăng nhập!";
                errBox.style.display = 'block';
                document.getElementById(btnId).textContent = originalText;
                return;
            }

            // Đăng ký mới
            let accountData = {
                username: un,
                password: pw,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Lưu lên Cloud
            let cloudSuccess = false;
            try {
                await db.collection('local_accounts').doc(userKey).set(accountData);
                cloudSuccess = true;
            } catch (err) {
                console.warn('[Firebase] Đăng ký cloud lỗi (có thể do rules), chuyển lưu local:', err);
            }

            // Lưu local dự phòng
            localAccounts[userKey] = pw;
            localStorage.setItem('xom_local_accounts', JSON.stringify(localAccounts));

            _fbToast(cloudSuccess ? `🎉 Đăng ký thành công (Đã đồng bộ Cloud)!` : `🎉 Đăng ký thành công (Lưu thiết bị)!`, '#22c55e');
            window.loginAsLocalUser(un);

        } else {
            // Đăng nhập
            let cloudDoc = await db.collection('local_accounts').doc(userKey).get().catch(() => null);
            let passwordInCloud = cloudDoc && cloudDoc.exists ? cloudDoc.data().password : null;
            let passwordInLocal = localAccounts[userKey];

            if (!passwordInCloud && !passwordInLocal) {
                errBox.textContent = "Tài khoản không tồn tại, vui lòng Đăng ký!";
                errBox.style.display = 'block';
                document.getElementById(btnId).textContent = originalText;
                return;
            }

            let correctPassword = passwordInCloud || passwordInLocal;
            if (correctPassword !== pw) {
                errBox.textContent = "Sai mật khẩu!";
                errBox.style.display = 'block';
                document.getElementById(btnId).textContent = originalText;
                return;
            }

            // Đăng nhập thành công, đồng bộ lại local nếu chưa có
            if (passwordInCloud && !passwordInLocal) {
                localAccounts[userKey] = passwordInCloud;
                localStorage.setItem('xom_local_accounts', JSON.stringify(localAccounts));
            }

            _fbToast(`✅ Đăng nhập thành công!`, '#22c55e');
            window.loginAsLocalUser(un);
        }
    } catch (e) {
        console.error(e);
        errBox.textContent = "Lỗi kết nối: " + e.message;
        errBox.style.display = 'block';
    }
    document.getElementById(btnId).textContent = originalText;
};

// 🌟 loginWithGoogle — dùng POPUP 🌟🌟🌟🌟🌟🌟
window.loginWithGoogle = async function() {
    _fbToast('⏳ Đang mở cửa sổ đăng nhập...', '#4fc3f7');
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        window.currentFirebaseUser = user;
        window._cloudSaveEnabled = true;

        _fbToast(`✅ Đăng nhập thành công! Xin chào ${user.displayName} 🎉`, '#22c55e');
        _showSignOutBtn(user.displayName);
        
        let savedServer = localStorage.getItem('xom_saved_server');
        if(savedServer) {
            window.currentServerId = savedServer;
            await openCharacterSelection(user);
        } else {
            openServerSelection();
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

window.openServerSelection = function() {
    window.switchScreenState('serverScreen');
};

window.selectServer = async function(serverId) {
    window.currentServerId = serverId;
    localStorage.setItem('xom_saved_server', serverId);
    _fbToast(`Đã chọn máy chủ: ${serverId}`, '#4fc3f7');
    if(window.currentFirebaseUser) {
        await openCharacterSelection(window.currentFirebaseUser);
    }
};

// ── Màn hình Chọn Nhân Vật (3 Slots) ─────────────────────────
window.openCharacterSelection = async function(user) {
    window.switchScreenState('characterSelectScreen');
    
    const container = document.getElementById('characterSlotsContainer');
    container.innerHTML = '<div style="color:#94a3b8; width:100%; text-align:center;">Đang tải dữ liệu Cloud...</div>';

    // Đọc 3 slot (Lưu ý: Thêm prefix ServerId để phân biệt nhân vật giữa các Server)
    const serverPrefix = window.currentServerId ? window.currentServerId + "_" : "S1_";
    const slotIDs = [`${serverPrefix}${user.uid}_1`, `${serverPrefix}${user.uid}_2`, `${serverPrefix}${user.uid}_3`];
    const slotsData = await Promise.all(slotIDs.map(id => loadGameFromCloud(id)));

    container.innerHTML = '';
    slotsData.forEach((data, index) => {
        const docId = slotIDs[index];
        const slotName = `Slot ${index + 1}`;
        
        const card = document.createElement('div');
        card.className = 'class-card ' + (data ? (data.classId || 'cop') : '');
        card.style.position = 'relative';
        
        if(data && data.classId) {
            // Đã có nhân vật: Vẽ bằng Canvas vector sắc nét
            card.innerHTML = `
                <div style="position:absolute;top:8px;right:12px;font-size:0.7rem;color:#94a3b8;font-weight:bold;">${slotName}</div>
                <canvas id="canvas_slot_${index}" width="100" height="100" style="width:100px; height:100px; display:block; margin: 0 auto 8px; image-rendering: -webkit-optimize-contrast;"></canvas>
                <div class="class-name" style="margin-bottom:4px;">${data.name}</div>
                <div class="class-desc" style="color:#fbbf24;font-weight:bold;margin-bottom:2px;min-height:unset;">Cấp độ: ${data.level || 1}</div>
                <div class="class-desc" style="min-height:unset;color:#cbd5e1;">💰 ${data.gold || 0} vàng</div>
            `;
            card.onclick = () => selectExistingCharacter(docId, data);
            
            // Bắt sự kiện vẽ sau khi thẻ đã được đưa vào DOM
            setTimeout(() => {
                const canv = document.getElementById(`canvas_slot_${index}`);
                if (canv && window.drawBeautifulRPGChibi) {
                    const cctx = canv.getContext('2d');
                    // Tăng độ phân giải cho canvas sắc nét
                    window.drawBeautifulRPGChibi(cctx, 50, 48, data.classId, false, 1.3, 'right');
                }
            }, 50);
        } else {
            // Trống
            card.style.background = 'rgba(255,255,255,0.02)';
            card.style.border = '2px dashed rgba(255,255,255,0.1)';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            card.style.flexDirection = 'column';
            card.style.minHeight = '198px';
            card.innerHTML = `
                <div style="position:absolute;top:8px;right:12px;font-size:0.7rem;color:#94a3b8;font-weight:bold;">${slotName}</div>
                <div style="font-size:2.2rem;color:#475569;margin-bottom:8px;">➕</div>
                <div style="color:#94a3b8;font-weight:bold;font-size:0.95rem;">Tạo Nhân Vật</div>
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
    window.switchScreenState('gameScreen');
    
    if (typeof spawnInitialMonsters === 'function') spawnInitialMonsters();
    if (typeof mainGameLoop === 'function') requestAnimationFrame(mainGameLoop);
    if (typeof rebuildQuickSkillBarUI === 'function') rebuildQuickSkillBarUI();
    if (typeof refreshHudDisplay === 'function') refreshHudDisplay();
    
    try { audio.play('levelup'); } catch(e){}
};

window.createNewCharacter = function(docId) {
    window.currentSlotId = docId;
    window._cloudSaveData = null; // Bắt đầu mới
    
    // Gán tên tài khoản làm tên mặc định
    if(window.currentFirebaseUser && window.currentFirebaseUser.email) {
        window.player = window.player || {};
        window.player.name = window.currentFirebaseUser.email.split('@')[0];
    }
    
    // Chuyển thẳng sang classScreen (Bỏ qua loginScreen)
    window.switchScreenState('classScreen');
    
    // Ẩn nút Google vì đã login rồi
    const btnGoogle = document.querySelector('.btn-google');
    if(btnGoogle) btnGoogle.style.display = 'none';
};

// ── signOutUser ───────────────────────────────────────────────
window.signOutUser = async function() {
    localStorage.removeItem('xom_logged_local_user');
    try { await auth.signOut(); } catch(e){}
    window.currentFirebaseUser = null;
    window._cloudSaveEnabled   = false;
    window._cloudSaveData      = null;
    window.currentSlotId       = null;
    location.reload();
};

// ── saveGameToCloud ───────────────────────────────────────────
window.saveGameToCloud = async function(playerData) {
    if (!window.currentFirebaseUser || !playerData || !window.currentSlotId) return false;
    
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
        lastSaved:   new Date().toISOString()
    };

    // Luôn lưu bản sao cục bộ vào LocalStorage làm dự phòng
    localStorage.setItem('xom_char_' + window.currentSlotId, JSON.stringify(data));

    try {
        data.lastSaved = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('players').doc(window.currentSlotId).set(data, { merge: true });
        return true;
    } catch (err) {
        console.error('[Firebase] Cloud Save error, but backed up in LocalStorage:', err);
        return true; // Trả về true để game tiếp tục hoạt động dựa trên LocalStorage
    }
};

// ── loadGameFromCloud ─────────────────────────────────────────
window.loadGameFromCloud = async function(docId) {
    try {
        const doc = await db.collection('players').doc(docId).get();
        if (doc.exists) {
            let data = doc.data();
            // Cập nhật lại bản sao cục bộ để sử dụng khi offline
            localStorage.setItem('xom_char_' + docId, JSON.stringify(data));
            return data;
        }
    } catch (err) {
        console.error('[Firebase] Cloud Load error, checking LocalStorage backup:', err);
    }

    // Backup: Đọc từ LocalStorage nếu Firestore lỗi hoặc không có mạng
    let backupData = localStorage.getItem('xom_char_' + docId);
    if (backupData) {
        try { return JSON.parse(backupData); } catch(e){}
    }
    return null;
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
