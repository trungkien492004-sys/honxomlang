// ===== 🐸 MEMECARD.JS — Engine "ĐẤU TRƯỜNG MEME XÓM" (Speed Duel) =====
// LP=4000 | Deck 20-30 lá | 3 ô quái + 3 ô phép/bẫy + 1 ô môi trường
// + 1 ô Extra Zone (Dung Hợp/Nghi Lễ) + 1 ô mộ mỗi bên

// Resolve getMyNetworkId() from global window (set by game.js)
function getMyNetworkId() { return window.myNetworkId || ''; }

// ────────────────── HẰNG SỐ ──────────────────
const MC_LP_START   = 4000;
const MC_DECK_MIN   = 20;
const MC_DECK_MAX   = 30;
const MC_HAND_START = 4;
const MC_ZONES      = 3;   // số ô quái / phép-bẫy mỗi bên
// Giới hạn số lá trong deck (mặc định 3 bản, ngoại lệ ghi ở đây theo id)
const MC_LIMITS     = { 'trung_tang_bat_ngo': 1 };

// ────────────────── STATE ──────────────────
const mcGame = {
  duel: null,      // đối tượng trận đấu; null khi không đấu
  deckList: []     // mảng id lá bài player đã xây
};

// ────────────────── HELPERS ──────────────────
function mcLog(msg) {
  const d = mcGame.duel;
  if (!d) return;
  d.logs.unshift(msg);
  if (d.logs.length > 60) d.logs.length = 60;
  const el = document.getElementById('mcDuelLog');
  if (el) el.innerHTML = d.logs.map(l => `<div class="mc-log-line">${l}</div>`).join('');
}

function mcCardById(id) {
  return (window.MEME_CARDS || []).find(c => c.id === id) || null;
}

function mcShuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function mcDrawCard(who) {
  const d = mcGame.duel;
  const deck = who === 'player' ? d.playerDeck : d.oppDeck;
  const hand = who === 'player' ? d.playerHand : d.oppHand;
  if (deck.length === 0) {
    mcLog(`💀 ${who === 'player' ? 'Bạn' : 'Đối thủ'} hết bài — thua!`);
    mcEndGame(who === 'player' ? 'opponent' : 'player');
    return false;
  }
  hand.push(deck.shift());
  return true;
}

function mcUpdateLP() {
  const d = mcGame.duel;
  if (!d) return;
  const pEl = document.getElementById('mcPlayerLP');
  const oEl = document.getElementById('mcOppLP');
  if (pEl) pEl.textContent = Math.max(0, d.playerLP);
  if (oEl) oEl.textContent = Math.max(0, d.oppLP);
}

function mcUpdateDeckCounts() {
  const d = mcGame.duel;
  if (!d) return;
  const pe = document.getElementById('mcPlayerDeckCount');
  const oe = document.getElementById('mcOppDeckCount');
  if (pe) pe.textContent = d.playerDeck.length;
  if (oe) oe.textContent = d.oppDeck.length;
}

// ────────────────── CARD ART HTML ──────────────────
function mcCardArtHTML(card, size) {
  size = size || 60;
  if (card.custom_image) {
    return '<img src="' + card.custom_image + '" style="width:' + size + 'px;height:' + size + 'px;object-fit:cover;border-radius:4px;">';
  }
  const a = card.art || { emoji: '🃏', c1: '#374151', c2: '#111827' };
  const fs = Math.round(size * 0.45);
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:4px;background:linear-gradient(135deg,' + a.c1 + ',' + a.c2 + ');display:flex;align-items:center;justify-content:center;font-size:' + fs + 'px;flex-shrink:0;">' + a.emoji + '</div>';
}

function mcCardTypeIcon(card) {
  if (card.card_type === 'Monster') {
    if (card.monster_category === 'Đồng Bộ') return '🌀';
    if (card.monster_category === 'Nghi Lễ') return '🕯️';
    if (card.monster_category === 'Hiệu Ứng') return '⚡';
    return '⬛';
  }
  if (card.card_type === 'Spell') return '💚';
  return '🔴';
}

function mcStarsHTML(n) {
  if (!n) return '';
  return '⭐'.repeat(Math.min(n, 12));
}

// ────────────────── RENDER HAND ──────────────────
function mcRenderHand() {
  const d = mcGame.duel;
  if (!d) return;
  const ph = document.getElementById('mcPlayerHand');
  if (ph) {
    ph.innerHTML = '';
    d.playerHand.forEach(function(cardId, idx) {
      const card = mcCardById(cardId);
      if (!card) return;
      const div = document.createElement('div');
      div.className = 'mc-hand-card mc-type-' + card.card_type.toLowerCase();
      if (d.selectedHandIndex === idx) div.classList.add('mc-selected');
      div.title = card.name + '\n' + (card.description || '');
      div.innerHTML = mcCardArtHTML(card, 52) + '<div class="mc-card-name-tiny">' + card.name + '</div>';
      div.onclick = (function(i) { return function() { mcSelectHandCard(i); }; })(idx);
      ph.appendChild(div);
    });
  }
  const oh = document.getElementById('mcOppHand');
  if (oh) {
    oh.innerHTML = '';
    d.oppHand.forEach(function() {
      const div = document.createElement('div');
      div.className = 'mc-hand-card mc-card-back';
      div.innerHTML = '<div style="font-size:26px;">🎴</div>';
      oh.appendChild(div);
    });
  }
}

// ────────────────── RENDER MONSTER ZONE ──────────────────
function mcRenderMonsterZone(who, idx, zoneEl) {
  const d = mcGame.duel;
  const slot = (who === 'player' ? d.playerMonsters : d.oppMonsters)[idx];
  zoneEl.innerHTML = '';
  zoneEl.className = 'mc-zone mc-zone-monster';
  zoneEl.onclick = null;

  if (!slot) {
    zoneEl.innerHTML = '<span class="mc-zone-empty">' + (idx + 1) + '</span>';
    if (who === 'opponent' && d.mode === 'attack_target') {
      zoneEl.classList.add('mc-zone-target');
      zoneEl.onclick = (function(i) { return function() { mcResolveAttack(i); }; })(idx);
    }
    return;
  }

  const card = mcCardById(slot.id);
  if (!card) return;

  if (slot.position === 'def_down') {
    zoneEl.innerHTML = '<div class="mc-card-back-zone" title="Bài úp">🎴<div class="mc-zone-pos-label">DEF úp</div></div>';
  } else {
    const atkVal = mcGetEffectiveAtk(who, idx);
    const posLabel = slot.position === 'atk' ? 'ATK' : 'DEF';
    const statVal = slot.position === 'atk' ? atkVal : (card.def || 0);
    let html = mcCardArtHTML(card, 48)
      + '<div class="mc-card-name-tiny">' + card.name + '</div>'
      + '<div class="mc-card-stats">' + (slot.position === 'atk' ? '⚔️' : '🛡️') + ' ' + statVal + '</div>';
    if (slot.equipBonus) html += '<div class="mc-equip-badge">+' + slot.equipBonus + '</div>';
    zoneEl.innerHTML = html;
  }

  if (who === 'opponent' && d.mode === 'attack_target') {
    zoneEl.classList.add('mc-zone-target');
    zoneEl.onclick = (function(i) { return function() { mcResolveAttack(i); }; })(idx);
  } else if (who === 'player' && d.mode === 'tribute') {
    zoneEl.classList.add('mc-zone-target');
    zoneEl.onclick = (function(i) { return function() { mcSelectTribute(i); }; })(idx);
  } else if (who === 'player' && d.mode === 'equip_target') {
    zoneEl.classList.add('mc-zone-target');
    zoneEl.onclick = (function(i) { return function() { mcApplyEquip(i); }; })(idx);
  } else if (who === 'player' && d.mode === null && d.phase === 'BATTLE' && d.turn === 'player') {
    if (slot && !slot.hasAttacked && slot.position === 'atk') {
      zoneEl.classList.add('mc-zone-can-attack');
    }
  }

  // Nếu ô không có tác vụ nào khác và là quái ngửa (hoặc quái úp của phe ta), bấm vào xem chi tiết bài
  if (!zoneEl.onclick && slot && (slot.position !== 'def_down' || who === 'player')) {
    zoneEl.onclick = function() { mcShowFieldCardDetails(slot.id, who, idx, false); };
  }
}

// ────────────────── RENDER SPELL/TRAP ZONE ──────────────────
function mcRenderSpellZone(who, idx, zoneEl) {
  const d = mcGame.duel;
  const slot = (who === 'player' ? d.playerSpells : d.oppSpells)[idx];
  zoneEl.innerHTML = '';
  zoneEl.className = 'mc-zone mc-zone-spell';
  zoneEl.onclick = null;

  if (!slot) {
    zoneEl.innerHTML = '<span class="mc-zone-empty">' + (idx + 1) + '</span>';
    return;
  }

  const card = mcCardById(slot.id);
  if (!card) return;

  if (slot.faceDown) {
    zoneEl.innerHTML = '<div class="mc-card-back-zone" title="Bài úp">🎴</div>';
    if (who === 'player') {
      zoneEl.onclick = function() { mcShowFieldCardDetails(slot.id, 'player', idx, false); };
    }
  } else {
    zoneEl.innerHTML = mcCardArtHTML(card, 42) + '<div class="mc-card-name-tiny">' + card.name + '</div>';
    zoneEl.onclick = function() { mcShowFieldCardDetails(who, idx, slot.id, false); };
  }
}

// ────────────────── RENDER FIELD ──────────────────
function mcRenderField() {
  const d = mcGame.duel;
  if (!d) return;

  for (let i = 0; i < MC_ZONES; i++) {
    const pz = document.getElementById('mcPMon' + i);
    const oz = document.getElementById('mcOMon' + i);
    if (pz) mcRenderMonsterZone('player', i, pz);
    if (oz) mcRenderMonsterZone('opponent', i, oz);
  }
  for (let i = 0; i < MC_ZONES; i++) {
    const pz = document.getElementById('mcPST' + i);
    const oz = document.getElementById('mcOST' + i);
    if (pz) mcRenderSpellZone('player', i, pz);
    if (oz) mcRenderSpellZone('opponent', i, oz);
  }

  // Field spell zones
  const pfEl = document.getElementById('mcPlayerField');
  if (pfEl) {
    pfEl.innerHTML = '';
    pfEl.onclick = null;
    if (d.playerField) {
      const c = mcCardById(d.playerField.id);
      if (c) {
        pfEl.innerHTML = mcCardArtHTML(c, 42) + '<div class="mc-card-name-tiny">' + c.name + '</div>';
        pfEl.onclick = function() { mcShowFieldCardDetails(d.playerField.id, 'player', -1, false); };
      }
    } else { pfEl.innerHTML = '<span class="mc-zone-empty">Môi Trường</span>'; }
  }
  const ofEl = document.getElementById('mcOppField');
  if (ofEl) {
    ofEl.innerHTML = '';
    ofEl.onclick = null;
    if (d.oppField) {
      const c = mcCardById(d.oppField.id);
      if (c) {
        ofEl.innerHTML = mcCardArtHTML(c, 42) + '<div class="mc-card-name-tiny">' + c.name + '</div>';
        ofEl.onclick = function() { mcShowFieldCardDetails(d.oppField.id, 'opponent', -1, false); };
      }
    } else { ofEl.innerHTML = '<span class="mc-zone-empty">Môi Trường</span>'; }
  }

  // Extra zones
  const peEl = document.getElementById('mcPlayerExtra');
  if (peEl) {
    peEl.innerHTML = '';
    peEl.onclick = null;
    if (d.playerExtraZone) {
      const c = mcCardById(d.playerExtraZone.id);
      if (c) {
        const atkVal = mcGetEffectiveAtk('player', -1, true);
        peEl.innerHTML = mcCardArtHTML(c, 42)
          + '<div class="mc-card-name-tiny">' + c.name + '</div>'
          + '<div class="mc-card-stats">⚔️ ' + atkVal + '</div>';
      }
      if (d.mode === null && d.phase === 'BATTLE' && d.turn === 'player'
          && !d.playerExtraZone.hasAttacked) {
        peEl.classList.add('mc-zone-can-attack');
      }
      peEl.onclick = function() { mcShowFieldCardDetails(d.playerExtraZone.id, 'player', -1, true); };
    } else {
      peEl.innerHTML = '<span class="mc-zone-empty">Extra</span>';
    }
  }
  const oeEl = document.getElementById('mcOppExtra');
  if (oeEl) {
    oeEl.innerHTML = '';
    oeEl.onclick = null;
    if (d.oppExtraZone) {
      const c = mcCardById(d.oppExtraZone.id);
      if (c) {
        const atkVal = mcGetEffectiveAtk('opponent', -1, true);
        oeEl.innerHTML = mcCardArtHTML(c, 42)
          + '<div class="mc-card-name-tiny">' + c.name + '</div>'
          + '<div class="mc-card-stats">⚔️ ' + atkVal + '</div>';
      }
    } else { oeEl.innerHTML = '<span class="mc-zone-empty">Extra</span>'; }
    if (d.mode === 'attack_target') {
      oeEl.classList.add('mc-zone-target');
      oeEl.onclick = function() { mcResolveAttack('extra'); };
    }
    if (!oeEl.onclick && d.oppExtraZone) {
      oeEl.onclick = function() { mcShowFieldCardDetails(d.oppExtraZone.id, 'opponent', -1, true); };
    }
  }

  // GY counts
  const pgEl = document.getElementById('mcPlayerGY');
  const ogEl = document.getElementById('mcOppGY');
  if (pgEl) pgEl.textContent = '🪦 ' + d.playerGY.length;
  if (ogEl) ogEl.textContent = '🪦 ' + d.oppGY.length;

  mcUpdateDeckCounts();
}

function mcRenderAll() {
  mcRenderHand();
  mcRenderField();
  mcUpdateLP();
  mcRenderPhaseButtons();

  const adminPanel = document.getElementById('mcAdminTestPanel');
  if (adminPanel) {
    if (mcIsAdmin() && mcGame.duel) {
      adminPanel.style.display = 'flex';
      mcRenderAdminTestPanel();
    } else {
      adminPanel.style.display = 'none';
    }
  }
}

// ────────────────── PHASE BUTTONS ──────────────────
function mcRenderPhaseButtons() {
  const d = mcGame.duel;
  const phaseEl = document.getElementById('mcPhaseText');
  if (phaseEl) {
    const names = { DRAW: 'RÚT BÀI', STANDBY: 'CHUẨN BỊ', MAIN1: 'MAIN 1', BATTLE: 'CHIẾN ĐẤU', MAIN2: 'MAIN 2', END: 'KẾT THÚC' };
    phaseEl.textContent = (d.turn === 'player' ? '🟢 Lượt bạn — ' : '🔴 Lượt đối thủ — ') + (names[d.phase] || d.phase);
  }
  const actEl = document.getElementById('mcActionMenu');
  if (!actEl) return;
  actEl.innerHTML = '';
  if (d.turn !== 'player') return;

  if (d.mode === 'tribute' || d.mode === 'attack_target' || d.mode === 'equip_target') {
    const btn = document.createElement('button');
    btn.className = 'mc-btn mc-btn-danger';
    btn.textContent = '❌ Huỷ';
    btn.onclick = mcCancelMode;
    actEl.appendChild(btn);
    return;
  }
  if (d.phase === 'MAIN1') {
    const b1 = document.createElement('button');
    b1.className = 'mc-btn';
    b1.textContent = '⚔️ Chuyển CHIẾN ĐẤU';
    b1.onclick = function() { mcAdvancePhase('BATTLE'); };
    actEl.appendChild(b1);
    const b2 = document.createElement('button');
    b2.className = 'mc-btn mc-btn-secondary';
    b2.textContent = '⏭️ Kết thúc lượt';
    b2.onclick = mcEndPlayerTurn;
    actEl.appendChild(b2);
  }
  if (d.phase === 'BATTLE') {
    const b1 = document.createElement('button');
    b1.className = 'mc-btn mc-btn-secondary';
    b1.textContent = '➡️ Sang MAIN 2';
    b1.onclick = function() { mcAdvancePhase('MAIN2'); };
    actEl.appendChild(b1);
  }
  if (d.phase === 'MAIN2') {
    const b1 = document.createElement('button');
    b1.className = 'mc-btn mc-btn-secondary';
    b1.textContent = '⏭️ Kết thúc lượt';
    b1.onclick = mcEndPlayerTurn;
    actEl.appendChild(b1);
  }
}

// ────────────────── OPEN / CLOSE / SCREENS ──────────────────
window.openMemeCardGame = function openMemeCardGame() {
  const modal = document.getElementById('memecardGameModal');
  if (!modal) { console.error('[memecard] #memecardGameModal not found'); return; }
  modal.style.display = 'flex';
  mcShowScreen('mcLobbyScreen');
  window.mcUpdateAdminBtnUI();
}

function mcShowScreen(id) {
  ['mcLobbyScreen', 'mcDeckScreen', 'mcDuelScreen', 'mcAdminCardsScreen'].forEach(function(s) {
    const el = document.getElementById(s);
    if (el) el.style.display = (s === id) ? 'flex' : 'none';
  });
  const res = document.getElementById('mcResultScreen');
  if (res) res.style.display = 'none';
}

function mcCloseGame() {
  const modal = document.getElementById('memecardGameModal');
  if (modal) modal.style.display = 'none';
  
  if (window.mcOnlineRoomId) {
    db.collection('active_players').doc('mcroom_' + window.mcOnlineRoomId).delete().catch(() => {});
    if (window.mcRoomUnsubscribe) {
      window.mcRoomUnsubscribe();
      window.mcRoomUnsubscribe = null;
    }
    window.mcOnlineRoomId = null;
    window.mcOnlineRole = null;
  }
  mcGame.duel = null;
}

window.mcShowScreen = mcShowScreen;
window.mcCloseGame = mcCloseGame;
window.mcIsAdmin = mcIsAdmin;
window.mcOpenDeckBuilder = mcOpenDeckBuilder;
window.mcRenderDeckBuilder = mcRenderDeckBuilder;
window.mcAddToDeck = mcAddToDeck;
window.mcRemoveFromDeck = mcRemoveFromDeck;
window.mcQuickDeck = mcQuickDeck;
window.mcStartDuel = mcStartDuel;
window.mcEndPlayerTurn = mcEndPlayerTurn;
window.mcPlayAgain = mcPlayAgain;
window.mcCancelMode = mcCancelMode;

// ────────────────── ADMIN: CHỈNH SỬA HIỆU ỨNG THẺ BÀI ──────────────────
const MC_ADMIN_EMAIL = 'trungkien492004@gmail.com';
function mcIsAdmin() {
    const isPlayerAdmin = (window.player && window.player.name && window.player.name.toLowerCase() === 'admin');
    const isLocalUserAdmin = (localStorage.getItem('username') && localStorage.getItem('username').toLowerCase() === 'admin');
    return !!(window.currentFirebaseUser && window.currentFirebaseUser.email === MC_ADMIN_EMAIL) || 
           localStorage.getItem('mc_admin_mode') === 'true' || 
           isPlayerAdmin || 
           isLocalUserAdmin;
}

window.mcUpdateAdminBtnUI = function() {
  const btn = document.getElementById('mcAdminToggleBtn');
  const cardsBtn = document.getElementById('mcAdminCardsBtn');
  if (!btn) return;
  const isAdmin = mcIsAdmin();
  if (isAdmin) {
    btn.textContent = '⚙️ Admin Mode: ĐANG BẬT';
    btn.style.background = '#10b981'; 
    btn.style.borderColor = '#059669';
    btn.style.color = '#fff';
    if (cardsBtn) cardsBtn.style.display = 'inline-block';
  } else {
    btn.textContent = '⚙️ Admin Mode: ĐANG TẮT';
    btn.style.background = '#f59e0b'; 
    btn.style.borderColor = '#d97706';
    btn.style.color = '#1c1a26';
    if (cardsBtn) cardsBtn.style.display = 'none';
  }
};

window.mcToggleAdminMode = function() {
  const current = localStorage.getItem('mc_admin_mode') === 'true';
  localStorage.setItem('mc_admin_mode', !current ? 'true' : 'false');
  if (typeof showToast === 'function') {
    showToast(!current ? '⚙️ Đã kích hoạt Admin Mode!' : '⚙️ Đã tắt Admin Mode.');
  } else {
    alert(!current ? '⚙️ Đã kích hoạt Admin Mode!' : '⚙️ Đã tắt Admin Mode.');
  }
  window.mcUpdateAdminBtnUI();
  // Refresh deck builder if open
  const deckScreen = document.getElementById('mcDeckScreen');
  if (deckScreen && deckScreen.style.display !== 'none') {
    mcRenderDeckBuilder();
  }
};

function mcOpenAdminCardEditor(cardId) {
    let card = mcCardById(cardId);
    if (!card) return;
    document.querySelectorAll('.mc-admin-edit-modal').forEach(el => el.remove());

    let modal = document.createElement('div');
    modal.className = 'mc-admin-edit-modal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100030; display:flex; align-items:center; justify-content:center;';

    let box = document.createElement('div');
    box.style.cssText = 'background:#1c1a26; border:2px solid #ff9eb5; border-radius:14px; width:min(92vw,420px); padding:16px; display:flex; flex-direction:column; gap:10px;';

    let fields = [
        { key: 'name', label: 'Tên bài', type: 'text' },
        { key: 'description', label: 'Mô tả / câu thoại hiệu ứng', type: 'textarea' },
        { key: 'effect_value', label: 'Giá trị hiệu ứng (effect_value)', type: 'number' }
    ];
    if (card.card_type === 'Monster') {
        fields.push({ key: 'atk', label: 'ATK', type: 'number' }, { key: 'def', label: 'DEF', type: 'number' });
    }

    box.innerHTML = `<div style="font-weight:800; color:#ffb3c6;">🛠️ ADMIN — Sửa thẻ: ${card.name}</div>`;
    let inputs = {};
    fields.forEach(f => {
        let row = document.createElement('div');
        row.innerHTML = `<label style="font-size:0.78rem; color:#cbd5e1; display:block; margin-bottom:3px;">${f.label}</label>`;
        let input = document.createElement(f.type === 'textarea' ? 'textarea' : 'input');
        if (f.type !== 'textarea') input.type = f.type;
        input.value = card[f.key] !== undefined && card[f.key] !== null ? card[f.key] : '';
        input.style.cssText = 'width:100%; padding:6px 8px; border-radius:6px; border:1px solid #4d4566; background:#2c2840; color:#fff; font-family:inherit;';
        if (f.type === 'textarea') input.rows = 3;
        row.appendChild(input);
        box.appendChild(row);
        inputs[f.key] = input;
    });

    let btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:8px; margin-top:4px;';
    let saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Lưu';
    saveBtn.style.cssText = 'flex:1; padding:8px; background:#7bd9a8; border:none; border-radius:6px; font-weight:bold; cursor:pointer;';
    saveBtn.onclick = () => {
        let patch = {};
        fields.forEach(f => {
            let v = inputs[f.key].value;
            patch[f.key] = f.type === 'number' ? Number(v) : v;
        });
        let raw = localStorage.getItem(window.MC_ADMIN_OVERRIDE_KEY);
        let overrides = {};
        try { overrides = raw ? JSON.parse(raw) : {}; } catch (e) {}
        overrides[cardId] = Object.assign(overrides[cardId] || {}, patch);
        localStorage.setItem(window.MC_ADMIN_OVERRIDE_KEY, JSON.stringify(overrides));
        window.applyMemeCardAdminOverrides();
        modal.remove();
        mcRenderDeckBuilder();
        showToast(`🛠️ Đã lưu chỉnh sửa cho thẻ "${card.name}"`);
    };
    let resetBtn = document.createElement('button');
    resetBtn.textContent = '↩️ Bỏ chỉnh sửa (về gốc)';
    resetBtn.style.cssText = 'padding:8px 10px; background:#4b5563; border:none; border-radius:6px; color:#fff; cursor:pointer;';
    resetBtn.onclick = () => {
        let raw = localStorage.getItem(window.MC_ADMIN_OVERRIDE_KEY);
        let overrides = {};
        try { overrides = raw ? JSON.parse(raw) : {}; } catch (e) {}
        delete overrides[cardId];
        localStorage.setItem(window.MC_ADMIN_OVERRIDE_KEY, JSON.stringify(overrides));
        modal.remove();
        showToast(`↩️ Đã bỏ chỉnh sửa admin cho "${card.name}" — cần tải lại trang để về đúng dữ liệu gốc.`);
    };
    let cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Đóng';
    cancelBtn.style.cssText = 'padding:8px 10px; background:#374151; border:none; border-radius:6px; color:#fff; cursor:pointer;';
    cancelBtn.onclick = () => modal.remove();
    btnRow.appendChild(saveBtn);
    btnRow.appendChild(resetBtn);
    btnRow.appendChild(cancelBtn);
    box.appendChild(btnRow);

    modal.appendChild(box);
    document.body.appendChild(modal);
}
window.mcOpenAdminCardEditor = mcOpenAdminCardEditor;

// ────────────────── DECK BUILDER ──────────────────
function mcOpenDeckBuilder() {
  mcShowScreen('mcDeckScreen');
  mcRenderDeckBuilder();
}

function mcRenderDeckBuilder() {
  const allCards = window.MEME_CARDS || [];
  const deckList = mcGame.deckList;
  const deckCount = {};
  deckList.forEach(function(id) { deckCount[id] = (deckCount[id] || 0) + 1; });

  const collEl = document.getElementById('mcCollectionPanel');
  if (collEl) {
    collEl.innerHTML = '<h3 class="mc-panel-title">📚 Kho Bài</h3>';
    allCards.forEach(function(card) {
      const inDeck = deckCount[card.id] || 0;
      const limit = MC_LIMITS[card.id] || 3;
      const div = document.createElement('div');
      div.className = 'mc-db-card mc-type-' + card.card_type.toLowerCase();
      div.title = card.name + '\n' + (card.description || '');
      const subLine = card.card_type === 'Monster'
        ? '<div class="mc-db-card-sub">' + mcStarsHTML(card.stars) + ' ' + card.monster_category + ' | ATK ' + card.atk + ' DEF ' + card.def + '</div>'
        : '<div class="mc-db-card-sub">' + (card.spell_category || card.trap_category || '') + '</div>';
      const desc = (card.description || '').slice(0, 55) + ((card.description || '').length > 55 ? '…' : '');
      div.innerHTML = mcCardArtHTML(card, 40)
        + '<div class="mc-db-card-info">'
        +   '<div class="mc-db-card-name">' + mcCardTypeIcon(card) + ' ' + card.name + '</div>'
        +   subLine
        +   '<div class="mc-db-card-desc">' + desc + '</div>'
        + '</div>'
        + '<div class="mc-db-card-actions">'
        +   '<span class="mc-db-count">' + inDeck + '/' + limit + '</span>'
        +   '<button onclick="mcAddToDeck(\'' + card.id + '\')" ' + (inDeck >= limit ? 'disabled' : '') + '>+</button>'
        +   '<button onclick="mcRemoveFromDeck(\'' + card.id + '\')" ' + (inDeck <= 0 ? 'disabled' : '') + '>−</button>'
        +   (mcIsAdmin() ? '<button title="Admin: sửa hiệu ứng thẻ" style="background:#ffb3c6;color:#2c2840;" onclick="mcOpenAdminCardEditor(\'' + card.id + '\')">✏️</button>' : '')
        + '</div>';
      collEl.appendChild(div);
    });
  }
  mcRenderDeckPanel();
}

function mcRenderDeckPanel() {
  const deckEl = document.getElementById('mcDeckPanel');
  if (!deckEl) return;
  const deckList = mcGame.deckList;
  const deckCount = {};
  deckList.forEach(function(id) { deckCount[id] = (deckCount[id] || 0) + 1; });
  const total = deckList.length;
  const ok = total >= MC_DECK_MIN && total <= MC_DECK_MAX;

  deckEl.innerHTML = '<h3 class="mc-panel-title">🗂️ Deck của bạn (' + total + '/' + MC_DECK_MAX + ')</h3>';
  const statusDiv = document.createElement('div');
  statusDiv.className = 'mc-deck-status ' + (ok ? 'mc-deck-ok' : 'mc-deck-err');
  statusDiv.textContent = ok
    ? '✅ Hợp lệ — ' + total + ' lá'
    : (total < MC_DECK_MIN ? '⚠️ Cần thêm ' + (MC_DECK_MIN - total) + ' lá nữa' : '⚠️ Tối đa ' + MC_DECK_MAX + ' lá');
  deckEl.appendChild(statusDiv);

  Object.keys(deckCount).forEach(function(id) {
    const card = mcCardById(id);
    if (!card) return;
    const div = document.createElement('div');
    div.className = 'mc-deck-entry';
    div.innerHTML = mcCardTypeIcon(card) + ' ' + card.name + ' <span class="mc-deck-entry-count">x' + deckCount[id] + '</span>';
    deckEl.appendChild(div);
  });

  const startBtn = document.createElement('button');
  startBtn.className = 'mc-btn mc-btn-start';
  startBtn.textContent = '⚔️ Bắt Đầu Đấu!';
  startBtn.disabled = !ok;
  startBtn.onclick = mcShowDuelModeChoice;
  deckEl.appendChild(startBtn);

  const quickBtn = document.createElement('button');
  quickBtn.className = 'mc-btn mc-btn-secondary';
  quickBtn.textContent = '🎲 Deck Ngẫu Nhiên';
  quickBtn.onclick = mcQuickDeck;
  deckEl.appendChild(quickBtn);

  const backBtn = document.createElement('button');
  backBtn.className = 'mc-btn mc-btn-danger';
  backBtn.textContent = '🔙 Quay Lại';
  backBtn.onclick = function() { mcShowScreen('mcLobbyScreen'); };
  deckEl.appendChild(backBtn);
}

function mcAddToDeck(id) {
  const limit = MC_LIMITS[id] || 3;
  if (mcGame.deckList.filter(function(x) { return x === id; }).length >= limit) return;
  if (mcGame.deckList.length >= MC_DECK_MAX) return;
  mcGame.deckList.push(id);
  mcRenderDeckBuilder();
}

function mcRemoveFromDeck(id) {
  const idx = mcGame.deckList.lastIndexOf(id);
  if (idx >= 0) { mcGame.deckList.splice(idx, 1); mcRenderDeckBuilder(); }
}

function mcQuickDeck() {
  const allCards = window.MEME_CARDS || [];
  const deck = [];
  allCards.forEach(function(card) {
    const limit = MC_LIMITS[card.id] || 3;
    const copies = Math.min(limit, 2);
    for (let i = 0; i < copies; i++) deck.push(card.id);
  });
  mcShuffleArray(deck);
  mcGame.deckList = deck.slice(0, Math.min(deck.length, 24));
  if (mcGame.deckList.length < MC_DECK_MIN) {
    // pad with random cards
    while (mcGame.deckList.length < MC_DECK_MIN && allCards.length > 0) {
      const pick = allCards[Math.floor(Math.random() * allCards.length)];
      const limit = MC_LIMITS[pick.id] || 3;
      if (mcGame.deckList.filter(function(x) { return x === pick.id; }).length < limit) {
        mcGame.deckList.push(pick.id);
      }
    }
  }
  mcRenderDeckBuilder();
}

// ────────────────── DUEL INIT ──────────────────
function mcStartDuel() {
  if (mcGame.deckList.length < MC_DECK_MIN) return;

  const playerDeck = mcShuffleArray([].concat(mcGame.deckList));

  // Bot deck: 2 copies of each card (respecting limits), shuffled, trimmed
  const allCards = window.MEME_CARDS || [];
  const botDeckRaw = [];
  allCards.forEach(function(card) {
    const limit = MC_LIMITS[card.id] || 3;
    const copies = Math.min(limit, 2);
    for (let i = 0; i < copies; i++) botDeckRaw.push(card.id);
  });
  mcShuffleArray(botDeckRaw);
  const botDeck = botDeckRaw.slice(0, Math.max(MC_DECK_MIN, Math.min(botDeckRaw.length, MC_DECK_MAX)));

  mcGame.duel = {
    playerLP: MC_LP_START, oppLP: MC_LP_START,
    playerHand: [], oppHand: [],
    playerDeck: playerDeck, oppDeck: botDeck,
    playerGY: [], oppGY: [],
    playerMonsters: [null, null, null],
    oppMonsters:    [null, null, null],
    playerSpells:   [null, null, null],
    oppSpells:      [null, null, null],
    playerField: null, oppField: null,
    playerExtraZone: null, oppExtraZone: null,
    turn: 'player', phase: 'DRAW', turnCount: 1,
    hasNormalSummoned: false,
    selectedHandIndex: null,
    mode: null,           // null | 'tribute' | 'attack_target' | 'equip_target'
    tributeNeeded: 0,
    tributeSelectedIndices: [],
    tributeSummonCard: null,   // { handIdx, cardId, position }
    pendingAttackFrom: null,   // { isExtra, idx }
    pendingEquipCard: null,    // { handIdx, cardId }
    logs: []
  };

  for (let i = 0; i < MC_HAND_START; i++) {
    mcDrawCard('player');
    mcDrawCard('opponent');
  }

  mcShowScreen('mcDuelScreen');
  mcLog('🎮 Đấu Trường Meme Xóm — bắt đầu! LP: Bạn ' + MC_LP_START + ' | Đối thủ ' + MC_LP_START);
  setTimeout(function() { mcRunPhase(); }, 300);
}

// ────────────────── PHASE MACHINE ──────────────────
function mcRunPhase() {
  const d = mcGame.duel;
  if (!d) return;
  if (d.turn === 'player') mcRunPlayerPhase();
  else mcRunBotPhase();
}

function mcRunPlayerPhase() {
  const d = mcGame.duel;
  if (d.phase === 'DRAW') {
    if (d.turnCount > 1) {
      if (!mcDrawCard('player')) return;
      mcLog('🃏 Bạn rút 1 lá (tay: ' + d.playerHand.length + ')');
    }
    d.phase = 'STANDBY';
    mcRunPhase();
    return;
  }
  if (d.phase === 'STANDBY') {
    d.phase = 'MAIN1';
    d.hasNormalSummoned = false;
    mcRenderAll();
    return;
  }
  // MAIN1, BATTLE, MAIN2: wait for player input
  mcRenderAll();
}

function mcAdvancePhase(next) {
  const d = mcGame.duel;
  if (!d || d.turn !== 'player') return;
  d.phase = next;
  mcLog('▶️ ' + next);
  mcRenderAll();
}

function mcEndPlayerTurn() {
  const d = mcGame.duel;
  if (!d) return;
  // Hand limit 6
  while (d.playerHand.length > 6) {
    const discarded = d.playerHand.pop();
    d.playerGY.push(discarded);
    const c = mcCardById(discarded);
    mcLog('🗑️ Bỏ bài (quá 6): ' + (c ? c.name : discarded));
  }
  d.playerMonsters.forEach(function(s) { if (s) s.hasAttacked = false; });
  if (d.playerExtraZone) d.playerExtraZone.hasAttacked = false;

  d.selectedHandIndex = null;
  d.mode = null;
  mcHideCardMenu();

  if (window.mcOnlineRoomId) {
    d.turn = 'opponent';
    d.phase = 'DRAW';
    d.turnCount++;
    mcLog('🔴 Đã kết thúc lượt. Đang chờ đối thủ hành động...');
    mcUpdateAndSync();
    return;
  }

  d.turn = 'opponent';
  d.phase = 'DRAW';
  d.turnCount++;
  mcLog('🔴 Lượt ' + d.turnCount + ' — Đối thủ');
  mcRenderAll();
  setTimeout(function() { mcRunPhase(); }, 700);
}

// ────────────────── BOT PHASE ──────────────────
function mcRunBotPhase() {
  const d = mcGame.duel;
  if (d.phase === 'DRAW') {
    if (!mcDrawCard('opponent')) return;
    mcLog('🤖 Đối thủ rút 1 lá');
    d.phase = 'STANDBY';
    setTimeout(function() { mcRunPhase(); }, 500);
    return;
  }
  if (d.phase === 'STANDBY') {
    d.phase = 'MAIN1';
    d.hasNormalSummoned = false;
    setTimeout(function() { mcRunPhase(); }, 400);
    return;
  }
  if (d.phase === 'MAIN1') { mcBotDoMain(); return; }
  if (d.phase === 'BATTLE') { mcBotDoBattle(); return; }
  if (d.phase === 'MAIN2') {
    d.phase = 'END';
    setTimeout(function() { mcRunPhase(); }, 300);
    return;
  }
  if (d.phase === 'END') { mcBotEndTurn(); return; }
}

function mcBotDoMain() {
  const d = mcGame.duel;

  // 1. Activate spells from hand (snapshot to avoid mutating while iterating)
  const handSnapshot = [].concat(d.oppHand);
  handSnapshot.forEach(function(id) {
    const card = mcCardById(id);
    if (!card || card.card_type !== 'Spell' || card.spell_category === 'Nghi Lễ') return;
    const hIdx = d.oppHand.indexOf(id);
    if (hIdx < 0) return;

    mcPlayCardZoomVFX(card.id, 'spell');

    if (card.spell_category === 'Môi Trường') {
      if (!d.oppField) {
        d.oppField = { id: card.id };
        d.oppHand.splice(hIdx, 1);
        mcLog('🌍 Đối thủ kích hoạt môi trường: ' + card.name);
      }
    } else if (card.spell_category === 'Liên Tục') {
      const emptySlot = d.oppSpells.indexOf(null);
      if (emptySlot >= 0) {
        d.oppSpells[emptySlot] = { id: card.id, faceDown: false };
        d.oppHand.splice(hIdx, 1);
        mcLog('🔗 Đối thủ kích hoạt liên tục: ' + card.name);
      }
    } else if (card.spell_category === 'Trang Bị') {
      const mIdx = d.oppMonsters.findIndex(function(s) { return s !== null && s.position === 'atk'; });
      if (mIdx >= 0) {
        d.oppMonsters[mIdx].equipBonus = (d.oppMonsters[mIdx].equipBonus || 0) + (card.effect_value || 0);
        d.oppHand.splice(hIdx, 1);
        d.oppGY.push(id);
        mcLog('🧿 Đối thủ trang bị ' + card.name);
      }
    } else {
      // Normal / Quick
      const hi = d.oppHand.indexOf(id);
      if (hi >= 0) { d.oppHand.splice(hi, 1); d.oppGY.push(id); }
      mcLog('💚 Đối thủ dùng: ' + card.name);
      mcExecuteEffect('opponent', card);
    }
  });

  // 2. Normal summon best available monster
  if (!d.hasNormalSummoned) {
    const candidates = d.oppHand
      .map(function(id) { return mcCardById(id); })
      .filter(function(c) { return c && c.card_type === 'Monster' && c.monster_category !== 'Đồng Bộ' && c.monster_category !== 'Nghi Lễ'; })
      .sort(function(a, b) { return (b.atk || 0) - (a.atk || 0); });

    for (let ci = 0; ci < candidates.length; ci++) {
      const card = candidates[ci];
      const stars = card.stars || 0;
      const tNeeded = stars >= 7 ? 2 : stars >= 5 ? 1 : 0;
      const haveMons = d.oppMonsters.filter(function(s) { return s !== null; }).length;
      if (tNeeded > haveMons) continue;
      const emptySlot = d.oppMonsters.indexOf(null);
      if (emptySlot < 0) break;

      // Tribute
      let tributed = 0;
      for (let j = 0; j < MC_ZONES && tributed < tNeeded; j++) {
        if (d.oppMonsters[j]) {
          const tc = mcCardById(d.oppMonsters[j].id);
          d.oppGY.push(d.oppMonsters[j].id);
          d.oppMonsters[j] = null;
          tributed++;
          mcLog('🤖 Đối thủ hiến tế: ' + (tc ? tc.name : ''));
        }
      }
      const newSlot = d.oppMonsters.indexOf(null);
      if (newSlot < 0) break;
      d.oppMonsters[newSlot] = { id: card.id, position: 'atk', hasAttacked: false, equipBonus: 0 };
      const hi = d.oppHand.indexOf(card.id);
      if (hi >= 0) d.oppHand.splice(hi, 1);
      d.hasNormalSummoned = true;
      mcLog('🤖 Đối thủ triệu hồi: ' + card.name + ' (ATK ' + card.atk + ')');
      if (card.stars >= 5) {
        mcPlayCardZoomVFX(card.id, 'summon');
      }
      if (card.monster_category === 'Hiệu Ứng' && card.effect_trigger === 'on_summon') {
        mcExecuteEffect('opponent', card);
      }
      break;
    }
  }

  // 3. Set traps face-down
  const handSnap2 = [].concat(d.oppHand);
  handSnap2.forEach(function(id) {
    const card = mcCardById(id);
    if (!card || card.card_type !== 'Trap') return;
    const emptySlot = d.oppSpells.indexOf(null);
    if (emptySlot < 0) return;
    const hi = d.oppHand.indexOf(id);
    if (hi < 0) return;
    d.oppHand.splice(hi, 1);
    d.oppSpells[emptySlot] = { id: card.id, faceDown: true, turnSet: d.turnCount };
    mcLog('🤖 Đối thủ úp 1 lá bẫy');
  });

  d.phase = 'BATTLE';
  mcRenderAll();
  setTimeout(function() { mcRunPhase(); }, 700);
}

function mcBotDoBattle() {
  const d = mcGame.duel;
  const attackers = [];
  d.oppMonsters.forEach(function(slot, idx) {
    if (slot && !slot.hasAttacked && slot.position === 'atk') attackers.push({ idx: idx, isExtra: false });
  });
  if (d.oppExtraZone && !d.oppExtraZone.hasAttacked) attackers.push({ idx: -1, isExtra: true });

  let delay = 0;
  attackers.forEach(function(att) {
    setTimeout(function() {
      if (!mcGame.duel) return;
      const d = mcGame.duel;
      const attackerSlot = att.isExtra ? d.oppExtraZone : d.oppMonsters[att.idx];
      if (!attackerSlot) return;
      const attackerCard = mcCardById(attackerSlot.id);
      if (!attackerCard) return;
      const attackerATK = att.isExtra ? mcGetEffectiveAtk('opponent', -1, true) : mcGetEffectiveAtk('opponent', att.idx);

      // Check player counter-traps
      const ctIdx = mcFindCounterTrap('player');
      if (ctIdx !== null) {
        const trapCard = mcCardById(d.playerSpells[ctIdx].id);
        if (trapCard && confirm('🪤 Kích hoạt bẫy "' + trapCard.name + '"?\n' + (trapCard.description || ''))) {
          mcActivateCounterTrap('player', ctIdx, att.idx, att.isExtra);
          attackerSlot.hasAttacked = true;
          mcRenderAll();
          return;
        }
      }

      const hasPlayerMons = d.playerMonsters.some(function(s) { return s !== null; }) || d.playerExtraZone !== null;

      if (!hasPlayerMons) {
        // Direct
        mcPlayAttackVFX('opponent', att.idx, att.isExtra, -1, false);
        d.playerLP -= attackerATK;
        mcLog('💥 Đối thủ tấn công trực tiếp! ' + attackerCard.name + ' → Bạn mất ' + attackerATK + ' LP');
        mcUpdateLP();
        attackerSlot.hasAttacked = true;
        if (attackerCard.monster_category === 'Hiệu Ứng' && attackerCard.effect_trigger === 'on_attack') {
          mcExecuteEffect('opponent', attackerCard);
        }
        mcCheckWin();
        mcRenderAll();
        return;
      }

      // Find target: prefer DEF monsters (easier to beat), else lowest-ATK monster
      let targetIdx = null;
      let targetIsExtra = false;
      const defTargets = d.playerMonsters.map(function(s, i) { return { s: s, i: i }; })
        .filter(function(x) { return x.s && x.s.position !== 'atk'; });
      const atkTargets = d.playerMonsters.map(function(s, i) { return { s: s, i: i }; })
        .filter(function(x) { return x.s && x.s.position === 'atk'; });

      if (defTargets.length > 0) {
        defTargets.sort(function(a, b) { return (mcCardById(a.s.id)?.def || 0) - (mcCardById(b.s.id)?.def || 0); });
        targetIdx = defTargets[0].i;
      } else if (atkTargets.length > 0) {
        atkTargets.sort(function(a, b) { return mcGetEffectiveAtk('player', a.i) - mcGetEffectiveAtk('player', b.i); });
        targetIdx = atkTargets[0].i;
      } else if (d.playerExtraZone) {
        targetIsExtra = true;
      }

      if (targetIsExtra) {
        mcPlayAttackVFX('opponent', att.idx, att.isExtra, -1, true);
        const defCard = mcCardById(d.playerExtraZone.id);
        const defAtk = mcGetEffectiveAtk('player', -1, true);
        if (attackerATK > defAtk) {
          d.playerGY.push(d.playerExtraZone.id);
          d.playerExtraZone = null;
          mcLog('💥 ' + attackerCard.name + ' phá huỷ quái Extra của bạn!');
        } else {
          const diff = defAtk - attackerATK;
          if (diff > 0) { d.oppLP -= diff; mcLog('🛡️ Extra Zone phản công! Đối thủ mất ' + diff + ' LP'); mcUpdateLP(); }
        }
      } else if (targetIdx !== null) {
        mcResolveBotAttack(attackerCard, attackerSlot, attackerATK, att.idx, att.isExtra, targetIdx);
      }

      attackerSlot.hasAttacked = true;
      mcCheckWin();
      mcRenderAll();
    }, delay);
    delay += 900;
  });

  setTimeout(function() {
    if (!mcGame.duel) return;
    mcGame.duel.phase = 'MAIN2';
    mcRenderAll();
    setTimeout(function() { mcRunPhase(); }, 400);
  }, delay + 300);
}

function mcResolveBotAttack(attackerCard, attackerSlot, attackerATK, attackerIdx, attackerIsExtra, targetIdx) {
  const d = mcGame.duel;
  mcPlayAttackVFX('opponent', attackerIdx, attackerIsExtra, targetIdx, false);
  const target = d.playerMonsters[targetIdx];
  if (!target) return;
  const targetCard = mcCardById(target.id);

  if (target.position === 'def_down') {
    d.playerMonsters[targetIdx].position = 'def';
    mcLog('🔍 Lật bài: ' + (targetCard ? targetCard.name : ''));
  }

  if (target.position === 'atk' || target.position === 'def_down') {
    // Treat revealed as ATK
    const targetATK = mcGetEffectiveAtk('player', targetIdx);
    if (attackerATK > targetATK) {
      const diff = attackerATK - targetATK;
      d.playerLP -= diff;
      d.playerGY.push(target.id);
      d.playerMonsters[targetIdx] = null;
      mcLog('💥 ' + attackerCard.name + ' phá huỷ ' + (targetCard ? targetCard.name : '') + '! Bạn mất ' + diff + ' LP');
      mcUpdateLP();
    } else if (attackerATK === targetATK) {
      d.playerGY.push(target.id);
      d.playerMonsters[targetIdx] = null;
      d.oppGY.push(attackerSlot.id);
      if (attackerIsExtra) d.oppExtraZone = null; else d.oppMonsters[attackerIdx] = null;
      mcLog('⚖️ Đồng điểm — cả hai phá huỷ');
    } else {
      const diff = targetATK - attackerATK;
      d.oppLP -= diff;
      d.oppGY.push(attackerSlot.id);
      if (attackerIsExtra) d.oppExtraZone = null; else d.oppMonsters[attackerIdx] = null;
      mcLog('🛡️ ' + (targetCard ? targetCard.name : '') + ' phản công! Đối thủ mất ' + diff + ' LP');
      mcUpdateLP();
    }
  } else {
    // DEF position
    const defVal = targetCard ? (targetCard.def || 0) : 0;
    if (attackerATK > defVal) {
      d.playerGY.push(target.id);
      d.playerMonsters[targetIdx] = null;
      mcLog('💥 ' + attackerCard.name + ' phá huỷ ' + (targetCard ? targetCard.name : '') + ' (DEF)');
    } else {
      const diff = defVal - attackerATK;
      if (diff > 0) {
        d.oppLP -= diff;
        mcLog('🛡️ Phòng thủ! Đối thủ mất ' + diff + ' LP');
        mcUpdateLP();
      }
    }
  }

  if (attackerCard.monster_category === 'Hiệu Ứng' && attackerCard.effect_trigger === 'on_attack') {
    mcExecuteEffect('opponent', attackerCard);
  }
}

function mcBotEndTurn() {
  const d = mcGame.duel;
  while (d.oppHand.length > 6) {
    d.oppGY.push(d.oppHand.pop());
  }
  d.oppMonsters.forEach(function(s) { if (s) s.hasAttacked = false; });
  if (d.oppExtraZone) d.oppExtraZone.hasAttacked = false;
  d.turn = 'player';
  d.phase = 'DRAW';
  d.turnCount++;
  d.mode = null;
  mcLog('🟢 Lượt ' + d.turnCount + ' — Bạn');
  mcRenderAll();
  setTimeout(function() { mcRunPhase(); }, 500);
}

// ────────────────── PLAYER ACTIONS ──────────────────
function mcSelectHandCard(idx) {
  const d = mcGame.duel;
  if (!d) return;

  if (d.selectedHandIndex === idx) {
    d.selectedHandIndex = null;
    mcHideCardMenu();
    mcRenderAll();
    return;
  }
  d.selectedHandIndex = idx;
  mcRenderAll();
  mcShowCardMenu(idx);
}

function mcShowCardMenu(idx) {
  const d = mcGame.duel;
  const cardId = d.playerHand[idx];
  const card = mcCardById(cardId);
  if (!card) return;

  const menuEl = document.getElementById('mcCardMenu');
  if (!menuEl) return;
  
  let detailsHTML = `
    <div class="mc-card-menu-details" style="display:flex; gap:10px; margin-bottom:8px; border-bottom:1px solid #1e3a2f; padding-bottom:8px; align-items:flex-start;">
      ${mcCardArtHTML(card, 64)}
      <div style="flex:1; display:flex; flex-direction:column; gap:2px; font-size:0.75rem; text-align:left;">
        <div style="color:#d4af37; font-weight:800;">${card.name} (Trên tay)</div>
        <div style="color:#86efac; font-size:0.7rem;">
          ${card.card_type === 'Monster' 
            ? `👾 Monster [${card.monster_category}] | ${'⭐'.repeat(card.stars || 0)}` 
            : card.card_type === 'Spell' 
            ? `💚 Spell [${card.spell_category || 'Thường'}]` 
            : `🔴 Trap [${card.trap_category || 'Thường'}]`}
        </div>
        ${card.card_type === 'Monster' 
          ? `<div style="font-weight:700; color:#fbbf24;">⚔️ ATK: ${card.atk || 0} | 🛡️ DEF: ${card.def || 0}</div>` 
          : ''}
        <div style="color:#eae1d4; font-size:0.7rem; margin-top:4px; font-style:italic; line-height:1.25;">${card.description || ''}</div>
      </div>
    </div>
  `;
  
  menuEl.innerHTML = detailsHTML;
  menuEl.style.display = 'flex';

  const addBtn = function(text, cls, fn) {
    const b = document.createElement('button');
    b.className = 'mc-btn ' + (cls || '');
    b.textContent = text;
    b.onclick = fn;
    menuEl.appendChild(b);
  };

  // Chỉ cho phép kích hoạt / triệu hồi nếu đang trong lượt chính của phe mình
  const canPlay = (d.turn === 'player' && (d.phase === 'MAIN1' || d.phase === 'MAIN2') && d.mode === null);
  
  if (canPlay) {
    if (card.card_type === 'Monster') {
      const cat = card.monster_category;
      if (cat !== 'Đồng Bộ' && cat !== 'Nghi Lễ') {
        addBtn('⬛ Triệu Hồi (Tấn Công)', '', function() { mcInitSummon(idx, 'atk'); });
        addBtn('🛡️ Úp (Phòng Thủ)', 'mc-btn-secondary', function() { mcInitSummon(idx, 'def_down'); });
      } else if (cat === 'Đồng Bộ') {
        addBtn('🌀 Triệu Hồi Đồng Bộ', '', function() { mcInitFusion(idx); });
      } else if (cat === 'Nghi Lễ') {
        addBtn('🕯️ Triệu Hồi Nghi Lễ', '', function() { mcInitRitual(idx); });
      }
    } else if (card.card_type === 'Spell') {
      if (card.spell_category !== 'Nghi Lễ') {
        addBtn('💚 Kích Hoạt Bài Phép', '', function() { mcActivateSpell(idx); });
      } else {
        addBtn('🕯️ Kích Hoạt Nghi Lễ', '', function() { mcActivateSpell(idx); });
      }
    } else if (card.card_type === 'Trap') {
      addBtn('🔴 Úp Bài Bẫy', 'mc-btn-secondary', function() { mcSetTrap(idx); });
    }
  }

  addBtn('❌ Đóng', 'mc-btn-danger', function() {
    d.selectedHandIndex = null;
    mcHideCardMenu();
    mcRenderAll();
  });
}

function mcHideCardMenu() {
  const el = document.getElementById('mcCardMenu');
  if (el) el.style.display = 'none';
}

// ── SUMMON ──
function mcInitSummon(handIdx, position) {
  const d = mcGame.duel;
  mcHideCardMenu();
  if (d.hasNormalSummoned) {
    mcLog('⚠️ Đã triệu hồi/úp thường rồi!');
    d.selectedHandIndex = null;
    mcRenderAll();
    return;
  }
  const cardId = d.playerHand[handIdx];
  const card = mcCardById(cardId);
  const stars = card.stars || 0;
  const tNeeded = stars >= 7 ? 2 : stars >= 5 ? 1 : 0;
  const haveMons = d.playerMonsters.filter(function(s) { return s !== null; }).length;

  if (tNeeded > haveMons) {
    mcLog('⚠️ Cần ' + tNeeded + ' quái hiến tế, hiện có ' + haveMons);
    d.selectedHandIndex = null;
    mcRenderAll();
    return;
  }
  const emptySlot = d.playerMonsters.indexOf(null);
  if (emptySlot < 0) {
    mcLog('⚠️ Không còn ô quái trống!');
    d.selectedHandIndex = null;
    mcRenderAll();
    return;
  }

  if (tNeeded === 0) {
    d.playerMonsters[emptySlot] = { id: cardId, position: position, hasAttacked: false, equipBonus: 0 };
    d.playerHand.splice(handIdx, 1);
    d.hasNormalSummoned = true;
    d.selectedHandIndex = null;
    mcLog('✅ Triệu hồi: ' + card.name + (position === 'atk' ? ' (Tấn Công)' : ' (Phòng Thủ úp)'));
    if (card.monster_category === 'Hiệu Ứng' && card.effect_trigger === 'on_summon') {
      mcExecuteEffect('player', card);
    }
    mcRenderAll();
  } else {
    d.mode = 'tribute';
    d.tributeNeeded = tNeeded;
    d.tributeSelectedIndices = [];
    d.tributeSummonCard = { handIdx: handIdx, cardId: cardId, position: position };
    mcLog('🔄 Chọn ' + tNeeded + ' quái để hiến tế → ' + card.name);
    mcRenderAll();
  }
}

function mcSelectTribute(monsterIdx) {
  const d = mcGame.duel;
  if (d.mode !== 'tribute') return;
  if (d.tributeSelectedIndices.indexOf(monsterIdx) >= 0) return;
  if (!d.playerMonsters[monsterIdx]) return;
  d.tributeSelectedIndices.push(monsterIdx);
  const tc = mcCardById(d.playerMonsters[monsterIdx].id);
  mcLog('→ Hiến tế: ' + (tc ? tc.name : ''));

  if (d.tributeSelectedIndices.length >= d.tributeNeeded) {
    d.tributeSelectedIndices.forEach(function(i) {
      d.playerGY.push(d.playerMonsters[i].id);
      d.playerMonsters[i] = null;
    });
    const { handIdx, cardId, position } = d.tributeSummonCard;
    const card = mcCardById(cardId);
    const newSlot = d.playerMonsters.indexOf(null);
    if (newSlot >= 0) {
      d.playerMonsters[newSlot] = { id: cardId, position: position, hasAttacked: false, equipBonus: 0 };
    }
    d.playerHand.splice(handIdx, 1);
    d.hasNormalSummoned = true;
    d.mode = null;
    d.tributeNeeded = 0;
    d.tributeSelectedIndices = [];
    d.tributeSummonCard = null;
    d.selectedHandIndex = null;
    mcLog('✅ Triệu hồi hiến tế: ' + (card ? card.name : ''));
    if (card && card.stars >= 5) {
      mcPlayCardZoomVFX(cardId, 'summon');
    }
    if (card && card.monster_category === 'Hiệu Ứng' && card.effect_trigger === 'on_summon') {
      if (card.stars >= 5) {
        setTimeout(() => {
          mcExecuteEffect('player', card);
        }, 1200);
      } else {
        mcExecuteEffect('player', card);
      }
    }
    mcRenderAll();
  } else {
    mcRenderAll();
  }
}

// ── SET TRAP ──
function mcSetTrap(handIdx) {
  const d = mcGame.duel;
  mcHideCardMenu();
  const emptySlot = d.playerSpells.indexOf(null);
  if (emptySlot < 0) {
    mcLog('⚠️ Không còn ô Phép/Bẫy trống!');
    d.selectedHandIndex = null;
    mcRenderAll();
    return;
  }
  const cardId = d.playerHand[handIdx];
  d.playerSpells[emptySlot] = { id: cardId, faceDown: true, turnSet: d.turnCount };
  d.playerHand.splice(handIdx, 1);
  d.selectedHandIndex = null;
  mcLog('🔴 Úp 1 bài bẫy (ẩn)');
  mcRenderAll();
}

// ── ACTIVATE SPELL ──
function mcActivateSpell(handIdx) {
  const d = mcGame.duel;
  mcHideCardMenu();
  d.selectedHandIndex = null;
  const cardId = d.playerHand[handIdx];
  const card = mcCardById(cardId);
  if (!card) return;

  mcPlayCardZoomVFX(cardId, 'spell');

  if (card.spell_category === 'Nghi Lễ') {
    const ritualMonsterCard = MEME_CARDS.find(function(c) {
      return c.card_type === 'Monster' && c.monster_category === 'Nghi Lễ' && c.ritual_requirement && c.ritual_requirement.spellId === cardId;
    });
    if (!ritualMonsterCard) {
      mcLog('⚠️ Không tìm thấy quái vật Nghi Lễ tương ứng cho bài phép này!');
      mcRenderAll();
      return;
    }
    const monsterHandIdx = d.playerHand.indexOf(ritualMonsterCard.id);
    if (monsterHandIdx < 0) {
      mcLog('⚠️ Bạn cần có quái vật Nghi Lễ [' + ritualMonsterCard.name + '] trên tay để kích hoạt phép Nghi Lễ này!');
      mcRenderAll();
      return;
    }
    
    const req = ritualMonsterCard.ritual_requirement || { minStars: 0 };
    const available = d.playerMonsters.map(function(s, i) { return { s: s, i: i }; }).filter(function(x) { return x.s !== null; });
    const totalStars = available.reduce(function(sum, x) { return sum + (mcCardById(x.s.id) ? (mcCardById(x.s.id).stars || 0) : 0); }, 0);
    if (totalStars < req.minStars) {
      mcLog('⚠️ Cần tổng sao của quái thú hiến tế trên sân ≥ ' + req.minStars + ' (hiện có: ' + totalStars + ' sao)!');
      mcRenderAll();
      return;
    }
    
    setTimeout(() => {
      mcInitRitual(monsterHandIdx);
    }, 1000);
    return;
  }

  if (card.spell_category === 'Môi Trường') {
    if (d.playerField) d.playerGY.push(d.playerField.id);
    d.playerField = { id: cardId };
    d.playerHand.splice(handIdx, 1);
    mcLog('🌍 Kích hoạt môi trường: ' + card.name);
    mcRenderAll();
    return;
  }
  if (card.spell_category === 'Liên Tục') {
    const emptySlot = d.playerSpells.indexOf(null);
    if (emptySlot < 0) { mcLog('⚠️ Không còn ô trống!'); mcRenderAll(); return; }
    d.playerSpells[emptySlot] = { id: cardId, faceDown: false };
    d.playerHand.splice(handIdx, 1);
    mcLog('🔗 Kích hoạt liên tục: ' + card.name);
    mcRenderAll();
    return;
  }
  if (card.spell_category === 'Trang Bị') {
    const hasMon = d.playerMonsters.some(function(s) { return s !== null; });
    if (!hasMon) { mcLog('⚠️ Không có quái để trang bị!'); mcRenderAll(); return; }
    d.pendingEquipCard = { handIdx: handIdx, cardId: cardId };
    d.mode = 'equip_target';
    mcLog('🧿 Chọn quái để trang bị: ' + card.name);
    mcRenderAll();
    return;
  }
  // Normal / Quick / Ritual
  d.playerHand.splice(handIdx, 1);
  d.playerGY.push(cardId);
  mcLog('💚 Kích hoạt: ' + card.name);
  mcExecuteEffect('player', card);
  mcRenderAll();
}

function mcApplyEquip(monsterIdx) {
  const d = mcGame.duel;
  if (d.mode !== 'equip_target' || !d.pendingEquipCard) return;
  const { handIdx, cardId } = d.pendingEquipCard;
  const card = mcCardById(cardId);
  if (!d.playerMonsters[monsterIdx]) return;
  d.playerMonsters[monsterIdx].equipBonus = (d.playerMonsters[monsterIdx].equipBonus || 0) + (card.effect_value || 0);
  d.playerHand.splice(handIdx, 1);
  d.playerGY.push(cardId);
  const target = mcCardById(d.playerMonsters[monsterIdx].id);
  mcLog('🧿 ' + (card.name) + ' trang bị → ' + (target ? target.name : '') + ' (+' + card.effect_value + ' ATK)');
  d.mode = null;
  d.pendingEquipCard = null;
  mcRenderAll();
}

// ── FUSION ──
function mcInitFusion(handIdx) {
  const d = mcGame.duel;
  mcHideCardMenu();
  d.selectedHandIndex = null;
  const cardId = d.playerHand[handIdx];
  const card = mcCardById(cardId);
  if (!card || card.monster_category !== 'Đồng Bộ') return;

  const req = card.fusion_requirement || { count: 2, minStars: 0 };
  const available = d.playerMonsters.map(function(s, i) { return { s: s, i: i }; }).filter(function(x) { return x.s !== null; });
  const totalStars = available.reduce(function(sum, x) { return sum + (mcCardById(x.s.id) ? (mcCardById(x.s.id).stars || 0) : 0); }, 0);

  if (available.length < req.count || totalStars < req.minStars) {
    mcLog('⚠️ Đồng Bộ cần ' + req.count + ' quái, tổng sao ≥' + req.minStars + ' (hiện: ' + available.length + ' quái, ' + totalStars + ' sao)');
    mcRenderAll();
    return;
  }

  const used = available.slice(0, req.count);
  used.forEach(function(x) { d.playerGY.push(x.s.id); d.playerMonsters[x.i] = null; });

  let summonZone = null;
  if (!d.playerExtraZone) {
    summonZone = 'extra';
  } else {
    const emptySlot = d.playerMonsters.indexOf(null);
    if (emptySlot >= 0) {
      summonZone = emptySlot;
    }
  }

  if (summonZone === null) {
    mcLog('⚠️ Sân đã đầy, không còn ô trống để triệu hồi!');
    mcRenderAll();
    return;
  }

  if (summonZone === 'extra') {
    d.playerExtraZone = { id: cardId, position: 'atk', hasAttacked: false, equipBonus: 0 };
  } else {
    d.playerMonsters[summonZone] = { id: cardId, position: 'atk', hasAttacked: false, equipBonus: 0 };
  }

  d.playerHand.splice(handIdx, 1);
  mcLog('🌀 Triệu hồi Đồng Bộ: ' + card.name + ' (ATK ' + card.atk + ')');
  mcPlayCardZoomVFX(cardId, 'summon');
  mcRenderAll();
}

// ── RITUAL ──
function mcInitRitual(handIdx) {
  const d = mcGame.duel;
  mcHideCardMenu();
  d.selectedHandIndex = null;
  const cardId = d.playerHand[handIdx];
  const card = mcCardById(cardId);
  if (!card || card.monster_category !== 'Nghi Lễ') return;

  const req = card.ritual_requirement || { spellId: null, minStars: 0 };
  const spellHIdx = d.playerHand.findIndex(function(id) { return id === req.spellId; });
  if (spellHIdx < 0) {
    const spellCard = mcCardById(req.spellId);
    mcLog('⚠️ Cần bài Nghi Lễ [' + (spellCard ? spellCard.name : req.spellId) + '] trong tay!');
    mcRenderAll();
    return;
  }

  const available = d.playerMonsters.map(function(s, i) { return { s: s, i: i }; }).filter(function(x) { return x.s !== null; });
  const totalStars = available.reduce(function(sum, x) { return sum + (mcCardById(x.s.id) ? (mcCardById(x.s.id).stars || 0) : 0); }, 0);
  if (totalStars < req.minStars) {
    mcLog('⚠️ Cần tổng sao ≥' + req.minStars + ' để hiến tế (hiện: ' + totalStars + ')');
    mcRenderAll();
    return;
  }

  // Use ritual spell
  d.playerGY.push(d.playerHand[spellHIdx]);
  d.playerHand.splice(spellHIdx, 1);
  // Recalculate handIdx after splice
  const newHandIdx = d.playerHand.indexOf(cardId);
  const finalHandIdx = newHandIdx >= 0 ? newHandIdx : handIdx - (spellHIdx < handIdx ? 1 : 0);

  // Tribute monsters up to minStars
  let starsUsed = 0;
  for (let j = 0; j < MC_ZONES && starsUsed < req.minStars; j++) {
    if (d.playerMonsters[j]) {
      const mc2 = mcCardById(d.playerMonsters[j].id);
      d.playerGY.push(d.playerMonsters[j].id);
      d.playerMonsters[j] = null;
      starsUsed += mc2 ? (mc2.stars || 0) : 0;
    }
  }

  if (d.playerHand[finalHandIdx] === cardId) d.playerHand.splice(finalHandIdx, 1);
  else { const fi2 = d.playerHand.indexOf(cardId); if (fi2 >= 0) d.playerHand.splice(fi2, 1); }

  let summonZone = null;
  if (!d.playerExtraZone) {
    summonZone = 'extra';
  } else {
    const emptySlot = d.playerMonsters.indexOf(null);
    if (emptySlot >= 0) {
      summonZone = emptySlot;
    }
  }

  if (summonZone === null) {
    mcLog('⚠️ Sân đã đầy, không còn ô trống để triệu hồi!');
    mcRenderAll();
    return;
  }

  if (summonZone === 'extra') {
    d.playerExtraZone = { id: cardId, position: 'atk', hasAttacked: false, equipBonus: 0 };
  } else {
    d.playerMonsters[summonZone] = { id: cardId, position: 'atk', hasAttacked: false, equipBonus: 0 };
  }

  mcLog('🕯️ Triệu hồi Nghi Lễ: ' + card.name + ' (ATK ' + card.atk + ')');
  mcPlayCardZoomVFX(cardId, 'summon');
  mcRenderAll();
}

// ────────────────── ACTIVATE FACE-DOWN SPELL/TRAP ──────────────────
function mcActivateFaceDownSpellTrap(slotIdx) {
  const d = mcGame.duel;
  if (!d || d.turn !== 'player') return;
  const slot = d.playerSpells[slotIdx];
  if (!slot || !slot.faceDown) return;
  const card = mcCardById(slot.id);
  if (!card) return;

  if (card.card_type === 'Trap' && slot.turnSet === d.turnCount) {
    mcLog('⚠️ Thẻ bẫy vừa úp ở lượt này, phải chờ sang lượt sau mới được mở!');
    return;
  }

  if (card.card_type === 'Trap' && card.trap_category === 'Phản Đòn') {
    mcLog('⚠️ Bẫy Phản Đòn chỉ kích hoạt khi đối thủ tấn công!');
    return;
  }

  mcPlayTrapRevealVFX('player', slotIdx, card);

  if (card.card_type === 'Trap' && card.trap_category === 'Liên Tục') {
    d.playerSpells[slotIdx] = { id: card.id, faceDown: false };
    mcLog('🔗 Kích hoạt liên tục: ' + card.name);
    mcExecuteEffect('player', card);
    mcRenderAll();
    return;
  }

  // Normal trap or face-down spell
  d.playerSpells[slotIdx] = null;
  d.playerGY.push(card.id);
  mcLog('🔴 Kích hoạt: ' + card.name);
  mcExecuteEffect('player', card);
  mcRenderAll();
}

// ────────────────── BATTLE ──────────────────
function mcDeclareAttack(attackerIdx, isExtra) {
  const d = mcGame.duel;
  if (!d || d.turn !== 'player' || d.phase !== 'BATTLE') return;
  if (d.turnCount === 1) {
    mcLog('⚠️ Lượt đầu tiên (Lượt 1) của trận đấu không được phép tấn công!');
    return;
  }
  let attackerSlot = isExtra ? d.playerExtraZone : d.playerMonsters[attackerIdx];
  if (!attackerSlot || attackerSlot.hasAttacked) return;
  if (!isExtra && attackerSlot.position !== 'atk') return;

  const hasOppMons = d.oppMonsters.some(function(s) { return s !== null; }) || d.oppExtraZone !== null;
  d.pendingAttackFrom = { idx: attackerIdx, isExtra: isExtra };

  if (!hasOppMons) {
    d.mode = null;
    mcResolveAttack(-1);
    return;
  }
  d.mode = 'attack_target';
  mcLog('⚔️ Chọn mục tiêu...');
  mcRenderAll();
}

function mcResolveAttack(targetIdx) {
  const d = mcGame.duel;
  if (!d || !d.pendingAttackFrom) return;

  const { idx: attackerIdx, isExtra: attackerIsExtra } = d.pendingAttackFrom;
  const attackerSlot = attackerIsExtra ? d.playerExtraZone : d.playerMonsters[attackerIdx];
  if (!attackerSlot) { d.mode = null; d.pendingAttackFrom = null; mcRenderAll(); return; }

  const attackerCard = mcCardById(attackerSlot.id);
  const attackerATK = attackerIsExtra ? mcGetEffectiveAtk('player', -1, true) : mcGetEffectiveAtk('player', attackerIdx);

  d.mode = null;
  d.pendingAttackFrom = null;

  mcPlayAttackVFX('player', attackerIdx, attackerIsExtra, targetIdx, targetIdx === 'extra');

  // Check opponent counter-traps
  const ctIdx = mcFindCounterTrap('opponent');
  if (ctIdx !== null) {
    const trapCard = mcCardById(d.oppSpells[ctIdx].id);
    if (trapCard) {
      mcLog('🤖 Đối thủ kích hoạt bẫy: ' + trapCard.name);
      const blocked = mcActivateCounterTrap('opponent', ctIdx, attackerIdx, attackerIsExtra);
      if (blocked) {
        attackerSlot.hasAttacked = true;
        mcRenderAll();
        return;
      }
    }
  }

  if (targetIdx === -1) {
    // Direct attack
    d.oppLP -= attackerATK;
    mcLog('💥 Tấn công trực tiếp! ' + (attackerCard ? attackerCard.name : '') + ' → Đối thủ mất ' + attackerATK + ' LP');
    mcUpdateLP();
    attackerSlot.hasAttacked = true;
    if (attackerCard && attackerCard.monster_category === 'Hiệu Ứng' && attackerCard.effect_trigger === 'on_attack') {
      mcExecuteEffect('player', attackerCard);
    }
    mcCheckWin();
    mcRenderAll();
    return;
  }

  // Attack Extra Zone
  if (targetIdx === 'extra') {
    const defSlot = d.oppExtraZone;
    if (!defSlot) { mcRenderAll(); return; }
    const defCard = mcCardById(defSlot.id);
    const defATK = mcGetEffectiveAtk('opponent', -1, true);
    if (attackerATK > defATK) {
      d.oppGY.push(defSlot.id);
      d.oppExtraZone = null;
      const diff = attackerATK - defATK;
      d.oppLP -= diff;
      mcLog('💥 ' + (attackerCard ? attackerCard.name : '') + ' phá huỷ ' + (defCard ? defCard.name : '') + '! Đối thủ mất ' + diff + ' LP');
      mcUpdateLP();
    } else if (attackerATK === defATK) {
      d.oppGY.push(defSlot.id);
      d.oppExtraZone = null;
      d.playerGY.push(attackerSlot.id);
      if (attackerIsExtra) d.playerExtraZone = null; else d.playerMonsters[attackerIdx] = null;
      mcLog('⚖️ Đồng điểm — cả hai phá huỷ');
    } else {
      const diff = defATK - attackerATK;
      d.playerLP -= diff;
      d.playerGY.push(attackerSlot.id);
      if (attackerIsExtra) d.playerExtraZone = null; else d.playerMonsters[attackerIdx] = null;
      mcLog('🛡️ ' + (defCard ? defCard.name : '') + ' phản công! Bạn mất ' + diff + ' LP');
      mcUpdateLP();
    }
    if (attackerCard && attackerCard.monster_category === 'Hiệu Ứng' && attackerCard.effect_trigger === 'on_attack') {
      mcExecuteEffect('player', attackerCard);
    }
    attackerSlot.hasAttacked = true;
    mcCheckWin();
    mcRenderAll();
    return;
  }

  // Attack opponent monster zone
  const targetSlot = d.oppMonsters[targetIdx];
  if (!targetSlot) { mcRenderAll(); return; }
  const targetCard = mcCardById(targetSlot.id);

  if (targetSlot.position === 'def_down') {
    d.oppMonsters[targetIdx].position = 'def';
    mcLog('🔍 Lật bài mặt úp: ' + (targetCard ? targetCard.name : ''));
  }

  if (targetSlot.position === 'atk') {
    const targetATK = mcGetEffectiveAtk('opponent', targetIdx);
    if (attackerATK > targetATK) {
      const diff = attackerATK - targetATK;
      d.oppLP -= diff;
      d.oppGY.push(targetSlot.id);
      d.oppMonsters[targetIdx] = null;
      mcLog('💥 ' + (attackerCard ? attackerCard.name : '') + ' phá huỷ ' + (targetCard ? targetCard.name : '') + '! Đối thủ mất ' + diff + ' LP');
      mcUpdateLP();
    } else if (attackerATK === targetATK) {
      d.oppGY.push(targetSlot.id);
      d.oppMonsters[targetIdx] = null;
      d.playerGY.push(attackerSlot.id);
      if (attackerIsExtra) d.playerExtraZone = null; else d.playerMonsters[attackerIdx] = null;
      mcLog('⚖️ Đồng điểm — cả hai phá huỷ');
    } else {
      const diff = targetATK - attackerATK;
      d.playerLP -= diff;
      d.playerGY.push(attackerSlot.id);
      if (attackerIsExtra) d.playerExtraZone = null; else d.playerMonsters[attackerIdx] = null;
      mcLog('🛡️ ' + (targetCard ? targetCard.name : '') + ' phản công! Bạn mất ' + diff + ' LP');
      mcUpdateLP();
    }
  } else {
    // DEF position
    const defVal = targetCard ? (targetCard.def || 0) : 0;
    if (attackerATK > defVal) {
      d.oppGY.push(targetSlot.id);
      d.oppMonsters[targetIdx] = null;
      mcLog('💥 ' + (attackerCard ? attackerCard.name : '') + ' phá huỷ ' + (targetCard ? targetCard.name : '') + ' (DEF)');
    } else if (attackerATK < defVal) {
      const diff = defVal - attackerATK;
      d.playerLP -= diff;
      mcLog('🛡️ Phòng thủ! Bạn mất ' + diff + ' LP (ATK vào DEF)');
      mcUpdateLP();
    } else {
      mcLog('⚖️ Không đủ phá vỡ phòng thủ');
    }
  }

  if (attackerCard && attackerCard.monster_category === 'Hiệu Ứng' && attackerCard.effect_trigger === 'on_attack') {
    mcExecuteEffect('player', attackerCard);
  }
  attackerSlot.hasAttacked = true;
  mcCheckWin();
  mcRenderAll();
}

// ────────────────── COUNTER-TRAP HELPERS ──────────────────
function mcFindCounterTrap(who) {
  const d = mcGame.duel;
  const spells = who === 'player' ? d.playerSpells : d.oppSpells;
  for (let i = 0; i < MC_ZONES; i++) {
    if (spells[i] && spells[i].faceDown) {
      if (spells[i].turnSet === d.turnCount) continue;
      const c = mcCardById(spells[i].id);
      if (c && c.card_type === 'Trap' && c.trap_category === 'Phản Đòn') return i;
    }
  }
  return null;
}

function mcActivateCounterTrap(who, slotIdx, attackerIdx, attackerIsExtra) {
  const d = mcGame.duel;
  const spells  = who === 'player' ? d.playerSpells  : d.oppSpells;
  const gy      = who === 'player' ? d.playerGY      : d.oppGY;
  const oppMons = who === 'player' ? d.oppMonsters    : d.playerMonsters;
  const oppGY   = who === 'player' ? d.oppGY          : d.playerGY;
  const isOppExtra = attackerIsExtra;

  const card = mcCardById(spells[slotIdx].id);
  if (!card) return false;

  mcPlayTrapRevealVFX(who, slotIdx, card);

  gy.push(card.id);
  spells[slotIdx] = null;
  mcLog('🪤 ' + (who === 'player' ? 'Bạn' : 'Đối thủ') + ' kích hoạt bẫy: ' + card.name);

  if (card.effect_code === 'negate_attack') {
    mcLog('✋ Đòn tấn công bị vô hiệu hoá!');
    return true;
  }
  if (card.effect_code === 'destroy_attacker') {
    if (isOppExtra) {
      const oppExtraRef = who === 'player' ? 'oppExtraZone' : 'playerExtraZone';
      if (d[oppExtraRef]) { oppGY.push(d[oppExtraRef].id); d[oppExtraRef] = null; }
    } else if (attackerIdx >= 0 && oppMons[attackerIdx]) {
      oppGY.push(oppMons[attackerIdx].id);
      oppMons[attackerIdx] = null;
    }
    mcLog('💥 Quái tấn công bị phá huỷ!');
    return true;
  }
  return false;
}

// ────────────────── EFFECT EXECUTOR ──────────────────
// Continuous effects (continuous_tribe_boost) are passive — handled in mcGetEffectiveAtk.
// This function handles one-time / triggered effects only.
function mcExecuteEffect(who, card) {
  const d = mcGame.duel;
  if (!d || !card || !card.effect_code) return;
  
  if (card.card_type === 'Monster') {
    mcPlayCardZoomVFX(card.id, 'effect');
  }

  const code = card.effect_code;
  const val  = card.effect_value || 0;

  if (code === 'draw_n') {
    const whoLabel = who === 'player' ? 'Bạn' : 'Đối thủ';
    for (let i = 0; i < val; i++) { if (!mcDrawCard(who)) break; }
    mcLog('🃏 ' + whoLabel + ' rút ' + val + ' lá bài');
    mcRenderHand();
    return;
  }
  if (code === 'burn_n') {
    if (who === 'player') {
      d.oppLP -= val;
      mcLog('🔥 Gây ' + val + ' sát thương cho đối thủ');
    } else {
      d.playerLP -= val;
      mcLog('🔥 Đối thủ gây ' + val + ' sát thương cho bạn');
    }
    mcUpdateLP();
    mcCheckWin();
    return;
  }
  if (code === 'heal_n') {
    if (who === 'player') {
      d.playerLP = Math.min(d.playerLP + val, MC_LP_START * 2);
      mcLog('💚 Hồi ' + val + ' LP');
    } else {
      d.oppLP = Math.min(d.oppLP + val, MC_LP_START * 2);
      mcLog('🤖 Đối thủ hồi ' + val + ' LP');
    }
    mcUpdateLP();
    return;
  }
  if (code === 'destroy_all_opponent_monsters') {
    const targets    = who === 'player' ? d.oppMonsters   : d.playerMonsters;
    const targetGY   = who === 'player' ? d.oppGY          : d.playerGY;
    const extraKey   = who === 'player' ? 'oppExtraZone'   : 'playerExtraZone';
    let count = 0;
    for (let i = 0; i < MC_ZONES; i++) {
      if (targets[i]) { targetGY.push(targets[i].id); targets[i] = null; count++; }
    }
    if (d[extraKey]) { targetGY.push(d[extraKey].id); d[extraKey] = null; count++; }
    mcLog('⚰️ Phá huỷ ' + count + ' quái của ' + (who === 'player' ? 'đối thủ' : 'bạn') + '!');
    mcRenderField();
    return;
  }
}

// ────────────────── EFFECTIVE ATK (passive continuous boosts) ──────────────────
// idx = -1 means Extra Zone monster
function mcGetEffectiveAtk(who, idx, isExtra) {
  const d = mcGame.duel;
  if (!d) return 0;
  const slot = isExtra
    ? (who === 'player' ? d.playerExtraZone : d.oppExtraZone)
    : (who === 'player' ? d.playerMonsters : d.oppMonsters)[idx];
  if (!slot) return 0;
  const card = mcCardById(slot.id);
  if (!card) return 0;

  let atk = (card.atk || 0) + (slot.equipBonus || 0);
  const tribe = card.tribe;

  // Check S/T zones + Field zone for continuous tribe boosts
  const spells   = who === 'player' ? d.playerSpells   : d.oppSpells;
  const fieldSlot = who === 'player' ? d.playerField   : d.oppField;
  const checkSlots = spells.slice();
  if (fieldSlot) checkSlots.push(fieldSlot);

  checkSlots.forEach(function(s) {
    if (!s || s.faceDown) return;
    const sc = mcCardById(s.id);
    if (!sc) return;
    if (sc.effect_code === 'continuous_tribe_boost' && sc.target_tribe === tribe) {
      atk += sc.effect_value || 0;
    }
  });

  return atk;
}

// ────────────────── WIN CONDITIONS ──────────────────
function mcCheckWin() {
  const d = mcGame.duel;
  if (!d) return;
  if (d.playerLP <= 0) { mcEndGame('opponent'); return; }
  if (d.oppLP <= 0)    { mcEndGame('player');   return; }
}

function mcEndGame(winner) {
  const d = mcGame.duel;
  const playerWon = (winner === 'player');
  mcLog(playerWon ? '🏆 BẠN THẮNG!' : '💀 BẠN THUA!');

  if (playerWon && window.player) {
    const reward = 80;
    window.player.gold = (window.player.gold || 0) + reward;
    if (typeof savePlayer === 'function') savePlayer();
    if (typeof showToast === 'function') showToast('🏆 Thắng! +' + reward + ' gold!');
  }

  mcGame.duel = null;

  setTimeout(function() {
    let resEl = document.getElementById('mcResultScreen');
    if (!resEl) {
      resEl = document.createElement('div');
      resEl.id = 'mcResultScreen';
      resEl.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:20;';
      const duelScreen = document.getElementById('mcDuelScreen');
      if (duelScreen) duelScreen.appendChild(resEl);
    }
    resEl.style.display = 'flex';
    resEl.innerHTML = '<div class="mc-result-box">'
      + '<div class="mc-result-emoji">' + (playerWon ? '🏆' : '💀') + '</div>'
      + '<div class="mc-result-title">' + (playerWon ? 'CHIẾN THẮNG!' : 'THẤT BẠI!') + '</div>'
      + '<div class="mc-result-sub">' + (playerWon ? 'Bạn đã chinh phục Đấu Trường Meme Xóm!<br>+80 gold' : 'Đối thủ đã hạ gục bạn. Cố lên lần sau!') + '</div>'
      + '<button class="mc-btn mc-btn-start" onclick="mcPlayAgain()">🔄 Chơi Lại</button>'
      + '<button class="mc-btn mc-btn-secondary" onclick="mcCloseGame()">🚪 Thoát</button>'
      + '</div>';
  }, 800);
}

function mcPlayAgain() {
  const resEl = document.getElementById('mcResultScreen');
  if (resEl) resEl.style.display = 'none';
  mcShowScreen('mcLobbyScreen');
}

function mcCancelMode() {
  const d = mcGame.duel;
  if (!d) return;
  d.mode = null;
  d.tributeNeeded = 0;
  d.tributeSelectedIndices = [];
  d.tributeSummonCard = null;
  d.pendingAttackFrom = null;
  d.pendingEquipCard = null;
  d.selectedHandIndex = null;
  mcHideCardMenu();
  mcRenderAll();
}

window.mcShowFieldCardDetails = function(cardId, who = 'player', idx = -1, isExtra = false) {
  const d = mcGame.duel;
  if (!d) return;
  const card = mcCardById(cardId);
  if (!card) return;

  const menuEl = document.getElementById('mcCardMenu');
  if (!menuEl) return;

  let detailsHTML = `
    <div class="mc-card-menu-details" style="display:flex; gap:10px; margin-bottom:8px; border-bottom:1px solid #1e3a2f; padding-bottom:8px; align-items:flex-start;">
      ${mcCardArtHTML(card, 64)}
      <div style="flex:1; display:flex; flex-direction:column; gap:2px; font-size:0.75rem; text-align:left;">
        <div style="color:#d4af37; font-weight:800;">${card.name} (${who === 'player' ? 'Phe Ta' : 'Đối Thủ'})</div>
        <div style="color:#86efac; font-size:0.7rem;">
          ${card.card_type === 'Monster' 
            ? `👾 Monster [${card.monster_category}] | ${'⭐'.repeat(card.stars || 0)}` 
            : card.card_type === 'Spell' 
            ? `💚 Spell [${card.spell_category || 'Thường'}]` 
            : `🔴 Trap [${card.trap_category || 'Thường'}]`}
        </div>
        ${card.card_type === 'Monster' 
          ? `<div style="font-weight:700; color:#fbbf24;">⚔️ ATK: ${card.atk || 0} | 🛡️ DEF: ${card.def || 0}</div>` 
          : ''}
        <div style="color:#eae1d4; font-size:0.7rem; margin-top:4px; font-style:italic; line-height:1.25;">${card.description || ''}</div>
      </div>
    </div>
  `;

  menuEl.innerHTML = detailsHTML;
  menuEl.style.display = 'flex';

  const addBtn = function(text, cls, fn, disabled = false) {
    const b = document.createElement('button');
    b.className = 'mc-btn ' + (cls || '');
    b.textContent = text;
    b.onclick = fn;
    if (disabled) {
      b.disabled = true;
      b.style.opacity = '0.5';
      b.style.cursor = 'not-allowed';
    }
    menuEl.appendChild(b);
  };

  // Hiển thị nút hành động nếu là bài của phe ta và đang trong lượt của ta
  if (who === 'player' && d.turn === 'player' && d.mode === null) {
    if (card.card_type === 'Monster') {
      const slot = isExtra ? d.playerExtraZone : d.playerMonsters[idx];
      if (slot) {
        if (d.phase === 'BATTLE' && slot.position === 'atk' && !slot.hasAttacked) {
          if (d.turnCount > 1) {
            addBtn('⚔️ Tấn Công', 'mc-btn-success', function() {
              mcHideCardMenu();
              mcDeclareAttack(idx, isExtra);
            });
          } else {
            addBtn('⚔️ Lượt 1 Không Được Tấn Công', 'mc-btn-secondary', function() {}, true);
          }
        }
      }
    } else if (card.card_type === 'Trap' || card.card_type === 'Spell') {
      const slot = d.playerSpells[idx];
      if (slot && slot.faceDown) {
        addBtn('⚡ Kích Hoạt Lật Ngửa', '', function() {
          mcHideCardMenu();
          mcActivateFaceDownSpellTrap(idx);
        });
      }
    }
  }

  // Nút Đóng Chi Tiết
  addBtn('❌ Đóng Chi Tiết', 'mc-btn-danger', function() {
    mcHideCardMenu();
  });
};

console.log('🐸 [memecard.js] Engine Đấu Trường Meme Xóm đã nạp thành công!');

// ────────────────── CSS ANIMATION INJECTION ──────────────────
(function() {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes mcShake {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -2px) rotate(-1deg); }
      20% { transform: translate(-3px, 0px) rotate(1deg); }
      30% { transform: translate(0px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      55% { transform: translate(-1px, 2px) rotate(-1deg); }
      60% { transform: translate(-3px, 1px) rotate(0deg); }
      70% { transform: translate(2px, 1px) rotate(-1deg); }
      80% { transform: translate(-1px, -1px) rotate(1deg); }
      90% { transform: translate(2px, 2px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(0deg); }
    }
    .mc-anim-shake {
      animation: mcShake 0.4s ease-in-out !important;
    }
    @keyframes mcSlash {
      0% { width: 0%; opacity: 0; }
      50% { width: 100%; opacity: 1; }
      100% { width: 120%; opacity: 0; }
    }
    .mc-slash-effect {
      position: absolute;
      top: 50%; left: -10%;
      height: 6px; background: #fca5a5;
      box-shadow: 0 0 12px #ef4444, 0 0 20px #dc2626;
      transform: rotate(-35deg);
      transform-origin: left center;
      pointer-events: none;
      z-index: 1000;
      animation: mcSlash 0.5s ease-out forwards;
    }
    @keyframes mcFlash {
      0% { box-shadow: 0 0 0px #60a5fa; }
      50% { box-shadow: 0 0 25px #3b82f6, inset 0 0 15px #3b82f6; }
      100% { box-shadow: 0 0 0px #60a5fa; }
    }
    .mc-anim-flash {
      animation: mcFlash 0.6s ease-in-out !important;
    }
  `;
  document.head.appendChild(styleEl);
})();

// ────────────────── VFX ANIMATION TRIGGERS ──────────────────
window.mcPlayAttackVFX = function(attackerSide, attackerIdx, attackerIsExtra, defenderIdx, defenderIsExtra) {
  let attId = '';
  if (attackerSide === 'player') {
    attId = attackerIsExtra ? 'mcPlayerExtra' : 'mcPMon' + attackerIdx;
  } else {
    attId = attackerIsExtra ? 'mcOppExtra' : 'mcOMon' + attackerIdx;
  }
  
  let defId = '';
  if (defenderIdx === -1 || defenderIdx === null || defenderIdx === undefined) {
    defId = attackerSide === 'player' ? 'mcOppLP' : 'mcPlayerLP';
  } else {
    if (attackerSide === 'player') {
      defId = defenderIsExtra ? 'mcOppExtra' : 'mcOMon' + defenderIdx;
    } else {
      defId = defenderIsExtra ? 'mcPlayerExtra' : 'mcPMon' + defenderIdx;
    }
  }

  const attEl = document.getElementById(attId);
  const defEl = document.getElementById(defId);

  if (attEl) {
    attEl.style.transition = 'transform 0.15s ease-out';
    const directionY = attackerSide === 'player' ? -35 : 35;
    attEl.style.transform = `translateY(${directionY}px)`;
    setTimeout(() => {
      attEl.style.transform = 'translateY(0px)';
    }, 180);
  }

  if (defEl) {
    setTimeout(() => {
      defEl.classList.add('mc-anim-shake');
      const slash = document.createElement('div');
      slash.className = 'mc-slash-effect';
      defEl.appendChild(slash);

      setTimeout(() => {
        defEl.classList.remove('mc-anim-shake');
        slash.remove();
      }, 500);
    }, 150);
  }
};

window.mcPlayCardZoomVFX = function(cardId, actionType) {
  const card = mcCardById(cardId);
  if (!card) return;

  let titleText = '⚡ KÍCH HOẠT THẺ BÀI ⚡';
  let emoji = '🃏';
  let glowColor = '#6366f1'; 
  let gradient = 'linear-gradient(135deg, #1e1b4b, #311042)';

  if (actionType === 'summon') {
    titleText = card.monster_category === 'Đồng Bộ' ? '🌀 TRIỆU HỒI ĐỒNG BỘ 🌀' : 
                card.monster_category === 'Nghi Lễ' ? '🕯️ TRIỆU HỒI NGHI LỄ 🕯️' : 
                '✨ TRIỆU HỒI CẤP CAO ✨';
    emoji = '👾';
    glowColor = '#fbbf24'; 
    gradient = 'linear-gradient(135deg, #451a03, #78350f)';
  } else if (actionType === 'spell') {
    titleText = '💚 KÍCH HOẠT PHÉP THUẬT 💚';
    emoji = '💚';
    glowColor = '#10b981'; 
    gradient = 'linear-gradient(135deg, #064e3b, #022c22)';
  } else if (actionType === 'trap') {
    titleText = '⚡ KÍCH HOẠT BẪY MA THUẬT ⚡';
    emoji = '🪤';
    glowColor = '#ec4899'; 
    gradient = 'linear-gradient(135deg, #500724, #1f0310)';
  } else if (actionType === 'effect') {
    titleText = '🔥 HIỆU ỨNG QUÁI THÚ 🔥';
    emoji = '⚡';
    glowColor = '#f97316'; 
    gradient = 'linear-gradient(135deg, #431407, #2c0e05)';
  }

  let overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.68); z-index:100050; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; opacity:0; transition:opacity 0.25s ease-out; font-family:inherit;';
  overlay.innerHTML = `
    <div style="background:${gradient}; border:3px solid ${glowColor}; border-radius:16px; padding:22px; text-align:center; min-width:280px; max-width:80%; box-shadow:0 0 35px ${glowColor}; transform:scale(0.85); transition:transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
      <div style="font-size:0.8rem; font-weight:800; color:${glowColor}; letter-spacing:3px; text-transform:uppercase; margin-bottom:6px;">${titleText}</div>
      <div style="font-size:2rem; margin:10px 0;">${emoji}</div>
      <div style="font-size:1.25rem; font-weight:bold; color:#fff; margin-bottom:8px;">${card.name}</div>
      <div style="font-size:0.75rem; color:#cbd5e1; font-style:italic; line-height:1.4;">${card.description || ''}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    overlay.style.opacity = '1';
    overlay.children[0].style.transform = 'scale(1)';
  }, 10);
  
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.children[0].style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 250);
  }, 2000);
};

window.mcPlayTrapRevealVFX = function(who, slotIdx, card) {
  const zoneId = who === 'player' ? 'mcPST' + slotIdx : 'mcOST' + slotIdx;
  const zoneEl = document.getElementById(zoneId);
  if (zoneEl) {
    zoneEl.classList.add('mc-anim-flash');
    setTimeout(() => {
      zoneEl.classList.remove('mc-anim-flash');
    }, 800);
  }
  
  window.mcPlayCardZoomVFX(card.id, card.card_type === 'Spell' ? 'spell' : 'trap');
};

// ────────────────── ADMIN TEST PANEL RENDERING ──────────────────
window.mcRenderAdminTestPanel = function() {
  const actionsEl = document.getElementById('mcAdminTestActions');
  if (!actionsEl) return;
  actionsEl.innerHTML = '';

  const addTestBtn = function(text, color, onClick) {
    const b = document.createElement('button');
    b.className = 'mc-btn';
    b.style.cssText = `padding:4px 8px; font-size:0.7rem; background:${color}; color:#1c1a26; border:none; border-radius:4px; font-weight:bold; cursor:pointer;`;
    b.textContent = text;
    b.onclick = onClick;
    actionsEl.appendChild(b);
  };

  addTestBtn('🌀 Test Đồng Bộ', '#c084fc', function() {
    const d = mcGame.duel;
    if (!d) return;
    d.playerMonsters[0] = { id: 'trau_tre_len_doi', position: 'atk', hasAttacked: false, equipBonus: 0 };
    d.playerMonsters[1] = { id: 'meo_map_lan_long', position: 'atk', hasAttacked: false, equipBonus: 0 };
    if (d.playerHand.indexOf('dai_de_trau_tre_toi_thuong') < 0) {
      d.playerHand.push('dai_de_trau_tre_toi_thuong');
    }
    mcLog('🛠️ [Test] Đã chuẩn bị quái trên sân (sao >= 5) và bài Đồng Bộ trong tay!');
    mcRenderAll();
  });

  addTestBtn('🕯️ Test Nghi Lễ', '#fcd34d', function() {
    const d = mcGame.duel;
    if (!d) return;
    d.playerMonsters[0] = { id: 'meo_map_lan_long', position: 'atk', hasAttacked: false, equipBonus: 0 };
    d.playerMonsters[1] = { id: 'meo_map_lan_long', position: 'atk', hasAttacked: false, equipBonus: 0 };
    if (d.playerHand.indexOf('than_linh_hon_trau') < 0) {
      d.playerHand.push('than_linh_hon_trau');
    }
    if (d.playerHand.indexOf('nghi_le_goi_hon_trau_tre') < 0) {
      d.playerHand.push('nghi_le_goi_hon_trau_tre');
    }
    mcLog('🛠️ [Test] Đã chuẩn bị tế phẩm (8 sao) và bài Nghi Lễ + Phép Nghi Lễ trong tay!');
    mcRenderAll();
  });

  addTestBtn('🔋 Hồi 4000 LP', '#4ade80', function() {
    const d = mcGame.duel;
    if (!d) return;
    d.playerLP = 4000;
    mcLog('🛠️ [Test] Hồi LP của bạn về 4000');
    mcUpdateLP();
  });

  addTestBtn('💥 Trừ Opp 100 LP', '#f87171', function() {
    const d = mcGame.duel;
    if (!d) return;
    d.oppLP = 100;
    mcLog('🛠️ [Test] Đặt LP của đối thủ về 100');
    mcUpdateLP();
  });

  addTestBtn('🃏 Rút 3 Lá', '#60a5fa', function() {
    mcDrawCard('player');
    mcDrawCard('player');
    mcDrawCard('player');
    mcRenderAll();
  });

  addTestBtn('🧟 Spawns Quái Opp', '#f472b6', function() {
    const d = mcGame.duel;
    if (!d) return;
    d.oppMonsters[0] = { id: 'ech_xanh_triet_ly', position: 'atk', hasAttacked: false, equipBonus: 0 };
    d.oppMonsters[1] = { id: 'co_mat_job', position: 'def', hasAttacked: false, equipBonus: 0 };
    mcLog('🛠️ [Test] Đã triệu hồi quái đối thủ lên sân để bạn test tấn công!');
    mcRenderAll();
  });

  addTestBtn('🧹 Dọn Sạch Sân', '#9ca3af', function() {
    const d = mcGame.duel;
    if (!d) return;
    d.playerMonsters = [null, null, null];
    d.oppMonsters = [null, null, null];
    d.playerExtraZone = null;
    d.oppExtraZone = null;
    d.playerSpells = [null, null, null];
    d.oppSpells = [null, null, null];
    d.playerField = null;
    d.oppField = null;
    mcLog('🛠️ [Test] Đã dọn sạch toàn bộ bàn đấu');
    mcRenderAll();
  });
};

// ────────────────── ADMIN CARD MANAGER LOGIC ──────────────────
window.mcOpenAdminCardsManager = function() {
  mcShowScreen('mcAdminCardsScreen');
  mcResetAdminForm();
  mcRenderAdminCardsList();
};

window.mcRenderAdminCardsList = function() {
  const listEl = document.getElementById('mcAdminCardsList');
  if (!listEl) return;
  listEl.innerHTML = '';
  
  const query = (document.getElementById('mcAdminSearch')?.value || '').toLowerCase();
  
  MEME_CARDS.forEach(function(c) {
    if (query && c.name.toLowerCase().indexOf(query) < 0 && c.id.toLowerCase().indexOf(query) < 0) return;
    
    const item = document.createElement('div');
    item.style.cssText = 'display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); border:1px solid #334155; border-radius:6px; padding:6px; cursor:pointer; font-size:0.75rem; transition:background 0.2s;';
    item.onclick = function() { mcSelectAdminCard(c.id); };
    item.onmouseenter = function() { item.style.background = 'rgba(255,255,255,0.08)'; };
    item.onmouseleave = function() { item.style.background = 'rgba(255,255,255,0.03)'; };
    
    const emoji = c.art ? c.art.emoji : '🃏';
    const typeLabel = c.card_type === 'Monster' ? `👾 ${c.monster_category}` : c.card_type === 'Spell' ? `💚 Phép` : `🔴 Bẫy`;
    const stats = c.card_type === 'Monster' ? ` ATK ${c.atk}/DEF ${c.def}` : '';
    
    item.innerHTML = `
      <div style="font-size:1.2rem;">${emoji}</div>
      <div style="flex:1;">
        <div style="font-weight:bold; color:#eae1d4;">${c.name} <span style="font-size:0.65rem; color:#6b7280; font-weight:normal;">(${c.id})</span></div>
        <div style="font-size:0.65rem; color:#94a3b8;">${typeLabel}${stats}</div>
      </div>
    `;
    listEl.appendChild(item);
  });
};

window.mcSelectAdminCard = function(cardId) {
  const card = mcCardById(cardId);
  if (!card) return;
  
  document.getElementById('mcFormId').value = card.id;
  document.getElementById('mcFormId').disabled = true; 
  document.getElementById('mcFormName').value = card.name;
  document.getElementById('mcFormCardType').value = card.card_type;
  document.getElementById('mcFormStars').value = card.stars || 1;
  document.getElementById('mcFormAtk').value = card.atk || 0;
  document.getElementById('mcFormDef').value = card.def || 0;
  document.getElementById('mcFormEmoji').value = card.art ? (card.art.emoji || '🃏') : '🃏';
  document.getElementById('mcFormTribe').value = card.tribe || '';
  
  document.getElementById('mcFormMonsterCat').value = card.monster_category || 'Thường';
  document.getElementById('mcFormSpellCat').value = card.spell_category || 'Thường';
  document.getElementById('mcFormTrapCat').value = card.trap_category || 'Thường';
  
  document.getElementById('mcFormEffectCode').value = card.effect_code || '';
  document.getElementById('mcFormEffectValue').value = card.effect_value || 0;
  document.getElementById('mcFormEffectTrigger').value = card.effect_trigger || '';
  
  document.getElementById('mcFormDescription').value = card.description || '';
  
  mcOnFormCardTypeChange();
  
  document.getElementById('mcAdminFormTitle').textContent = '📝 Sửa Thẻ Bài: ' + card.name;
  
  const overrides = JSON.parse(localStorage.getItem(window.MC_ADMIN_OVERRIDE_KEY) || '{}');
  if (overrides[cardId]) {
    document.getElementById('mcFormDeleteBtn').style.display = 'block';
  } else {
    document.getElementById('mcFormDeleteBtn').style.display = 'none';
  }
};

window.mcResetAdminForm = function() {
  document.getElementById('mcFormId').value = '';
  document.getElementById('mcFormId').disabled = false;
  document.getElementById('mcFormName').value = '';
  document.getElementById('mcFormCardType').value = 'Monster';
  document.getElementById('mcFormStars').value = '1';
  document.getElementById('mcFormAtk').value = '0';
  document.getElementById('mcFormDef').value = '0';
  document.getElementById('mcFormEmoji').value = '🃏';
  document.getElementById('mcFormTribe').value = 'Tộc Trẩu';
  
  document.getElementById('mcFormMonsterCat').value = 'Thường';
  document.getElementById('mcFormSpellCat').value = 'Thường';
  document.getElementById('mcFormTrapCat').value = 'Thường';
  
  document.getElementById('mcFormEffectCode').value = '';
  document.getElementById('mcFormEffectValue').value = '0';
  document.getElementById('mcFormEffectTrigger').value = '';
  
  document.getElementById('mcFormDescription').value = '';
  
  mcOnFormCardTypeChange();
  
  document.getElementById('mcAdminFormTitle').textContent = '➕ Thêm Thẻ Bài Mới';
  document.getElementById('mcFormDeleteBtn').style.display = 'none';
};

window.mcOnFormCardTypeChange = function() {
  const type = document.getElementById('mcFormCardType').value;
  document.getElementById('mcFormMonsterCatRow').style.display = (type === 'Monster') ? 'flex' : 'none';
  document.getElementById('mcFormSpellCatRow').style.display = (type === 'Spell') ? 'flex' : 'none';
  document.getElementById('mcFormTrapCatRow').style.display = (type === 'Trap') ? 'flex' : 'none';
};

window.mcSaveAdminForm = function() {
  const id = document.getElementById('mcFormId').value.trim();
  const name = document.getElementById('mcFormName').value.trim();
  if (!id || !name) { alert('⚠️ Vui lòng nhập đầy đủ ID và Tên thẻ bài!'); return; }
  
  const type = document.getElementById('mcFormCardType').value;
  
  let card = {
    id: id,
    name: name,
    card_type: type,
    stars: parseInt(document.getElementById('mcFormStars').value) || 1,
    atk: parseInt(document.getElementById('mcFormAtk').value) || 0,
    def: parseInt(document.getElementById('mcFormDef').value) || 0,
    tribe: document.getElementById('mcFormTribe').value.trim(),
    description: document.getElementById('mcFormDescription').value.trim(),
    art: {
      emoji: document.getElementById('mcFormEmoji').value.trim() || '🃏',
      c1: '#374151',
      c2: '#111827'
    },
    custom_image: null
  };
  
  if (type === 'Monster') {
    card.monster_category = document.getElementById('mcFormMonsterCat').value;
  } else if (type === 'Spell') {
    card.spell_category = document.getElementById('mcFormSpellCat').value;
  } else if (type === 'Trap') {
    card.trap_category = document.getElementById('mcFormTrapCat').value;
  }
  
  const effectCode = document.getElementById('mcFormEffectCode').value;
  if (effectCode) {
    card.effect_code = effectCode;
    card.effect_value = parseInt(document.getElementById('mcFormEffectValue').value) || 0;
    card.effect_trigger = document.getElementById('mcFormEffectTrigger').value;
  }
  
  let overrides = JSON.parse(localStorage.getItem(window.MC_ADMIN_OVERRIDE_KEY) || '{}');
  overrides[id] = card;
  localStorage.setItem(window.MC_ADMIN_OVERRIDE_KEY, JSON.stringify(overrides));
  
  window.applyMemeCardAdminOverrides();
  
  alert('💾 Đã lưu thành công lá bài "' + name + '"!');
  mcResetAdminForm();
  mcRenderAdminCardsList();
};

window.mcDeleteAdminCard = function() {
  const id = document.getElementById('mcFormId').value.trim();
  if (!id) return;
  if (!confirm('🗑️ Bạn có chắc chắn muốn xoá lá bài này khỏi hệ thống?')) return;
  
  let overrides = JSON.parse(localStorage.getItem(window.MC_ADMIN_OVERRIDE_KEY) || '{}');
  if (overrides[id]) {
    delete overrides[id];
    localStorage.setItem(window.MC_ADMIN_OVERRIDE_KEY, JSON.stringify(overrides));
  }
  
  const idx = MEME_CARDS.findIndex(c => c.id === id);
  if (idx >= 0) {
    MEME_CARDS.splice(idx, 1);
  }
  
  window.applyMemeCardAdminOverrides();
  
  alert('🗑️ Đã xoá lá bài thành công!');
  mcResetAdminForm();
  mcRenderAdminCardsList();
};

window.mcImportAdminCsv = function() {
  const text = document.getElementById('mcAdminCsvInput').value.trim();
  if (!text) { alert('⚠️ Vui lòng dán dữ liệu CSV vào ô nhập!'); return; }
  
  const lines = text.split('\n');
  if (lines.length < 2) { alert('⚠️ Định dạng dữ liệu không hợp lệ!'); return; }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  let count = 0;
  
  let overrides = JSON.parse(localStorage.getItem(window.MC_ADMIN_OVERRIDE_KEY) || '{}');
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = line.split(',').map(c => c.trim());
    let card = {
      art: { emoji: '🃏', c1: '#374151', c2: '#111827' },
      custom_image: null
    };
    
    headers.forEach((h, idx) => {
      let val = cols[idx] || '';
      if (h === 'stars' || h === 'atk' || h === 'def' || h === 'effect_value') {
        val = parseInt(val) || 0;
      }
      
      if (h === 'emoji') {
        card.art.emoji = val || '🃏';
      } else {
        card[h] = val;
      }
    });
    
    if (card.id && card.name && card.card_type) {
      overrides[card.id] = card;
      count++;
    }
  }
  
  localStorage.setItem(window.MC_ADMIN_OVERRIDE_KEY, JSON.stringify(overrides));
  window.applyMemeCardAdminOverrides();
  
  alert('📥 Nhập thành công ' + count + ' lá bài từ Excel/CSV!');
  document.getElementById('mcAdminCsvInput').value = '';
  mcRenderAdminCardsList();
};

window.mcImportAdminCsvFile = function(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    document.getElementById('mcAdminCsvInput').value = text;
    window.mcImportAdminCsv();
  };
  reader.readAsText(file);
};

window.mcExportAdminCsv = function() {
  const headers = ['id', 'name', 'card_type', 'stars', 'atk', 'def', 'description', 'emoji', 'tribe', 'monster_category', 'spell_category', 'trap_category', 'effect_code', 'effect_value', 'effect_trigger'];
  let csvContent = headers.join(',') + '\n';
  
  MEME_CARDS.forEach(function(c) {
    const row = headers.map(function(h) {
      let val = '';
      if (h === 'emoji') {
        val = c.art ? (c.art.emoji || '') : '';
      } else {
        val = c[h] !== undefined ? c[h] : '';
      }
      
      let strVal = String(val).replace(/"/g, '""');
      if (strVal.indexOf(',') >= 0 || strVal.indexOf('\n') >= 0 || strVal.indexOf('"') >= 0) {
        strVal = '"' + strVal + '"';
      }
      return strVal;
    });
    csvContent += row.join(',') + '\n';
  });
  
};

// ────────────────── ONLINE MULTIPLAYER SYSTEM ──────────────────
window.mcOnlineRole = null;
window.mcOnlineRoomId = null;
window.mcRoomUnsubscribe = null;

window.mcShowDuelModeChoice = function() {
  let choiceEl = document.getElementById('mcDuelModeChoiceOverlay');
  if (!choiceEl) {
    choiceEl = document.createElement('div');
    choiceEl.id = 'mcDuelModeChoiceOverlay';
    choiceEl.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:100060; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; font-family:inherit; color:#fff;';
    document.body.appendChild(choiceEl);
  }
  choiceEl.style.display = 'flex';
  choiceEl.innerHTML = `
    <div style="background:linear-gradient(135deg, #1e293b, #0f172a); border:3px solid #4ade80; border-radius:12px; padding:24px; text-align:center; min-width:280px; box-shadow:0 0 25px rgba(74,222,128,0.3); display:flex; flex-direction:column; gap:12px;">
      <div style="font-size:2.5rem; margin-bottom:10px;">⚔️</div>
      <div style="font-weight:bold; font-size:1.1rem; margin-bottom:8px;">CHỌN CHẾ ĐỘ ĐẤU BÀI</div>
      <button class="mc-btn mc-btn-start" onclick="mcCloseDuelModeChoice(); mcStartDuel();" style="margin:0; width:100%;">🆚 Đấu Với Máy (AI Bot)</button>
      <button class="mc-btn mc-btn-start" onclick="mcCloseDuelModeChoice(); mcHostOnlineRoom();" style="margin:0; width:100%; background:#10b981; border-color:#059669;">🌐 Tạo Phòng Đấu Online</button>
      <button class="mc-btn mc-btn-start" onclick="mcCloseDuelModeChoice(); mcJoinOnlineRoom();" style="margin:0; width:100%; background:#818cf8; border-color:#6366f1;">🤝 Vào Phòng Đấu Online</button>
      <button class="mc-btn mc-btn-danger" onclick="mcCloseDuelModeChoice();" style="margin:0; width:100%; font-size:0.8rem; padding:6px;">❌ Quay Lại</button>
    </div>
  `;
};

window.mcCloseDuelModeChoice = function() {
  const el = document.getElementById('mcDuelModeChoiceOverlay');
  if (el) el.style.display = 'none';
};

window.mcShowOnlineStatus = function(msg, onCancel) {
  let el = document.getElementById('mcOnlineOverlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'mcOnlineOverlay';
    el.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:100060; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; font-family:inherit; color:#fff;';
    document.body.appendChild(el);
  }
  el.style.display = 'flex';
  el.innerHTML = `
    <div style="background:linear-gradient(135deg, #1e293b, #0f172a); border:2px solid #3b82f6; border-radius:12px; padding:24px; text-align:center; min-width:280px; box-shadow:0 0 25px rgba(59,130,246,0.3);">
      <div style="font-size:2.5rem; margin-bottom:10px;">🌐</div>
      <div style="font-weight:bold; font-size:1.1rem; margin-bottom:12px;">ĐẤU TRƯỜNG ONLINE</div>
      <div id="mcOnlineStatusText" style="font-size:0.85rem; color:#cbd5e1; margin-bottom:20px; line-height:1.5;">${msg}</div>
      <button class="mc-btn mc-btn-danger" id="mcOnlineCancelBtn" style="margin:0; padding:6px 16px; font-size:0.8rem;">❌ Hủy</button>
    </div>
  `;
  const cancelBtn = el.querySelector('#mcOnlineCancelBtn');
  if (cancelBtn) {
    cancelBtn.onclick = function() {
      el.style.display = 'none';
      if (onCancel) onCancel();
    };
  }
};

window.mcHideOnlineStatus = function() {
  const el = document.getElementById('mcOnlineOverlay');
  if (el) el.style.display = 'none';
};

window.mcOnlineRole = null;
window.mcOnlineRoomId = null;
window.mcRoomPingInterval = null;

window.mcHostOnlineRoom = async function() {
  const defaultRoomName = 'room_' + (window.player && window.player.name ? window.player.name : Math.floor(Math.random() * 1000));
  const roomId = prompt('🔑 Nhập mã phòng của bạn (hoặc giữ mặc định):', defaultRoomName);
  if (!roomId) return;

  const name = window.player && window.player.name ? window.player.name : 'Host';
  
  window.mcOnlineRole = 'host';
  window.mcOnlineRoomId = roomId;

  // Clear existing interval just in case
  if (window.mcRoomPingInterval) clearInterval(window.mcRoomPingInterval);

  // Set interval to ping
  window.mcRoomPingInterval = setInterval(() => {
    if (!window.mcOnlineRoomId || window.mcOnlineRole !== 'host') return;
    if (typeof window.pvpChannel !== 'undefined') {
      window.pvpChannel.postMessage({
        type: 'MC_ROOM_PING',
        id: getMyNetworkId(),
        roomId: window.mcOnlineRoomId,
        hostId: getMyNetworkId(),
        hostName: name
      });
    }
  }, 1500);

  mcShowOnlineStatus(`Đang tạo phòng "${roomId}" và chờ đối thủ tham gia...`, function() {
    if (window.mcRoomPingInterval) {
      clearInterval(window.mcRoomPingInterval);
      window.mcRoomPingInterval = null;
    }
    window.mcOnlineRoomId = null;
    window.mcOnlineRole = null;
    mcHideOnlineStatus();
  });
};

window.mcJoinOnlineRoom = async function() {
  const roomId = prompt('🔑 Nhập mã phòng bạn muốn tham gia:');
  if (!roomId) return;

  window.mcOnlineRole = 'guest';
  window.mcOnlineRoomId = roomId;

  mcShowOnlineStatus(`Đang tìm kiếm phòng "${roomId}"...`, function() {
    window.mcOnlineRoomId = null;
    window.mcOnlineRole = null;
    mcHideOnlineStatus();
  });
};

window.mcRegisterNetworkMessage = function(msg) {
  if (!msg) return;

  // Guest hears host ping, replies with join request
  if (msg.type === 'MC_ROOM_PING' && window.mcOnlineRoomId === msg.roomId && window.mcOnlineRole === 'guest') {
    if (typeof window.pvpChannel !== 'undefined') {
      window.pvpChannel.postMessage({
        type: 'MC_ROOM_JOIN',
        id: getMyNetworkId(),
        roomId: window.mcOnlineRoomId,
        guestId: getMyNetworkId(),
        guestName: window.player && window.player.name ? window.player.name : 'Guest'
      });
    }
  }

  // Host receives guest join, starts the duel and broadcasts mcroom_start
  if (msg.type === 'MC_ROOM_JOIN' && window.mcOnlineRoomId === msg.roomId && window.mcOnlineRole === 'host') {
    if (window.mcRoomPingInterval) {
      clearInterval(window.mcRoomPingInterval);
      window.mcRoomPingInterval = null;
    }
    mcHideOnlineStatus();

    const name = window.player && window.player.name ? window.player.name : 'Host';
    const room = {
      status: 'playing',
      hostName: name,
      guestName: msg.guestName
    };

    mcStartOnlineDuel('host', room);

    // Prepare initial state payload
    const d = mcGame.duel;
    let initialPayload = {
      lastActionBy: 'host',
      hostLP: d.playerLP,
      guestLP: d.oppLP,
      hostHand: d.playerHand,
      guestHand: d.oppHand,
      hostMonsters: d.playerMonsters,
      guestMonsters: d.oppMonsters,
      hostSpells: d.playerSpells,
      guestSpells: d.oppSpells,
      hostExtraZone: d.playerExtraZone,
      guestExtraZone: d.oppExtraZone,
      hostGY: d.playerGY,
      guestGY: d.oppGY,
      hostField: d.playerField,
      guestField: d.oppField,
      turn: 'host',
      phase: d.phase,
      turnCount: d.turnCount,
      mode: d.mode,
      pendingAttackFrom: d.pendingAttackFrom,
      hasNormalSummoned: d.hasNormalSummoned,
      logs: mcGame.logs
    };

    if (typeof window.pvpChannel !== 'undefined') {
      window.pvpChannel.postMessage({
        type: 'MC_ROOM_START',
        id: getMyNetworkId(),
        roomId: window.mcOnlineRoomId,
        guestId: msg.guestId,
        hostName: name,
        guestName: msg.guestName,
        duelState: initialPayload
      });
    }
  }

  // Guest receives start event, starts the duel
  if (msg.type === 'MC_ROOM_START' && window.mcOnlineRoomId === msg.roomId && window.mcOnlineRole === 'guest') {
    if (msg.guestId !== getMyNetworkId()) return;
    mcHideOnlineStatus();

    const room = {
      status: 'playing',
      hostName: msg.hostName,
      guestName: msg.guestName,
      duelState: msg.duelState
    };

    mcStartOnlineDuel('guest', room);
  }

  // Both sync state during the duel
  if (msg.type === 'MC_ROOM_STATE' && window.mcOnlineRoomId === msg.roomId) {
    if (msg.lastActionBy === window.mcOnlineRole) return;

    const room = {
      duelState: msg.duelState
    };
    mcSyncOnlineState(room);
  }
};

window.mcStartOnlineDuel = function(role, room) {
  mcGame.duel = {
    playerLP: MC_LP_START,
    oppLP: MC_LP_START,
    playerHand: [],
    oppHand: [],
    playerMonsters: [null, null, null],
    oppMonsters: [null, null, null],
    playerSpells: [null, null, null],
    oppSpells: [null, null, null],
    playerExtraZone: null,
    oppExtraZone: null,
    playerGY: [],
    oppGY: [],
    playerField: null,
    oppField: null,
    turnCount: 1,
    phase: 'DRAW',
    turn: (role === 'host') ? 'player' : 'opponent',
    mode: null,
    pendingAttackFrom: null,
    hasNormalSummoned: false
  };

  const deck = [].concat(mcGame.deckList);
  mcShuffle(deck);
  mcGame.duel.playerDeck = deck;
  
  for (let i = 0; i < MC_HAND_START; i++) {
    mcDrawCard('player');
  }

  mcGame.opponentName = (role === 'host') ? (room.guestName || 'Guest') : (room.hostName || 'Host');
  mcGame.logs = [`🎮 Trận đấu online bắt đầu! Bạn là ${role.toUpperCase()}.`];
  mcRenderLog();

  mcShowScreen('mcDuelScreen');
  mcUpdateAndSync();
};

window.mcPushOnlineState = function() {
  if (!window.mcOnlineRole || !window.mcOnlineRoomId) return;
  const d = mcGame.duel;
  if (!d) return;

  let payload = {
    lastActionBy: window.mcOnlineRole,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (window.mcOnlineRole === 'host') {
    payload.hostLP = d.playerLP;
    payload.guestLP = d.oppLP;
    payload.hostHand = d.playerHand;
    payload.guestHand = d.oppHand;
    payload.hostMonsters = d.playerMonsters;
    payload.guestMonsters = d.oppMonsters;
    payload.hostSpells = d.playerSpells;
    payload.guestSpells = d.oppSpells;
    payload.hostExtraZone = d.playerExtraZone;
    payload.guestExtraZone = d.oppExtraZone;
    payload.hostGY = d.playerGY;
    payload.guestGY = d.oppGY;
    payload.hostField = d.playerField;
    payload.guestField = d.oppField;
    payload.turn = (d.turn === 'player') ? 'host' : 'guest';
  } else {
    payload.guestLP = d.playerLP;
    payload.hostLP = d.oppLP;
    payload.guestHand = d.playerHand;
    payload.hostHand = d.oppHand;
    payload.guestMonsters = d.playerMonsters;
    payload.hostMonsters = d.oppMonsters;
    payload.guestSpells = d.playerSpells;
    payload.hostSpells = d.oppSpells;
    payload.guestExtraZone = d.playerExtraZone;
    payload.hostExtraZone = d.oppExtraZone;
    payload.guestGY = d.playerGY;
    payload.hostGY = d.oppGY;
    payload.guestField = d.playerField;
    payload.hostField = d.oppField;
    payload.turn = (d.turn === 'player') ? 'guest' : 'host';
  }

  payload.phase = d.phase;
  payload.turnCount = d.turnCount;
  payload.mode = d.mode;
  payload.pendingAttackFrom = d.pendingAttackFrom;
  payload.hasNormalSummoned = d.hasNormalSummoned;
  payload.logs = mcGame.logs;

  if (typeof window.pvpChannel !== 'undefined') {
    window.pvpChannel.postMessage({
      type: 'MC_ROOM_STATE',
      roomId: window.mcOnlineRoomId,
      lastActionBy: window.mcOnlineRole,
      duelState: payload
    });
  }
};

window.mcSyncOnlineState = function(room) {
  const ds = room.duelState;
  if (!ds) return;
  if (ds.lastActionBy === window.mcOnlineRole) return;

  const d = mcGame.duel;
  if (!d) return;

  const activeTurnBefore = d.turn;

  if (window.mcOnlineRole === 'host') {
    d.playerLP = ds.hostLP;
    d.oppLP = ds.guestLP;
    d.playerHand = ds.hostHand;
    d.oppHand = ds.guestHand;
    d.playerMonsters = ds.hostMonsters;
    d.oppMonsters = ds.guestMonsters;
    d.playerSpells = ds.hostSpells;
    d.oppSpells = ds.guestSpells;
    d.playerExtraZone = ds.hostExtraZone;
    d.oppExtraZone = ds.guestExtraZone;
    d.playerGY = ds.hostGY;
    d.oppGY = ds.guestGY;
    d.playerField = ds.hostField;
    d.oppField = ds.guestField;
    d.turn = (ds.turn === 'host') ? 'player' : 'opponent';
  } else {
    d.playerLP = ds.guestLP;
    d.oppLP = ds.hostLP;
    d.playerHand = ds.guestHand;
    d.oppHand = ds.hostHand;
    d.playerMonsters = ds.guestMonsters;
    d.oppMonsters = ds.hostMonsters;
    d.playerSpells = ds.guestSpells;
    d.oppSpells = ds.hostSpells;
    d.playerExtraZone = ds.guestExtraZone;
    d.oppExtraZone = ds.hostExtraZone;
    d.playerGY = ds.guestGY;
    d.oppGY = ds.hostGY;
    d.playerField = ds.guestField;
    d.oppField = ds.hostField;
    d.turn = (ds.turn === 'guest') ? 'player' : 'opponent';
  }

  d.phase = ds.phase;
  d.turnCount = ds.turnCount;
  d.mode = ds.mode;
  d.pendingAttackFrom = ds.pendingAttackFrom;
  d.hasNormalSummoned = ds.hasNormalSummoned;

  if (ds.logs) {
    mcGame.logs = ds.logs;
    mcRenderLog();
  }

  mcRenderAll();

  // If turn switched to us
  if (d.turn === 'player' && activeTurnBefore === 'opponent') {
    d.phase = 'DRAW';
    if (d.turnCount > 1) {
      mcDrawCard('player');
      mcLog(`🃏 Lượt ${d.turnCount} — Đến lượt bạn! Bạn rút 1 lá.`);
    } else {
      mcLog(`🃏 Lượt ${d.turnCount} — Đến lượt bạn!`);
    }
    d.phase = 'MAIN1';
    mcUpdateAndSync();
  }
};

window.mcUpdateAndSync = function() {
  mcRenderAll();
  if (window.mcOnlineRoomId) {
    mcPushOnlineState();
  }
};

// Hook state-changing actions dynamically
const syncActions = [
  'mcInitSummon', 'mcSelectTribute', 'mcSetTrap', 'mcActivateSpell',
  'mcApplyEquip', 'mcInitFusion', 'mcInitRitual',
  'mcActivateFaceDownSpellTrap', 'mcResolveAttack', 'mcEndPlayerTurn',
  'mcDeclareAttack'
];
syncActions.forEach(name => {
  const orig = window[name];
  if (typeof orig === 'function') {
    window[name] = function() {
      const res = orig.apply(this, arguments);
      if (window.mcOnlineRoomId) {
        mcPushOnlineState();
      }
      return res;
    };
  }
});


