// ===== 🐸 MEMECARD.JS — Engine "ĐẤU TRƯỜNG MEME XÓM" (Speed Duel) =====
// LP=4000 | Deck 20-30 lá | 3 ô quái + 3 ô phép/bẫy + 1 ô môi trường
// + 1 ô Extra Zone (Dung Hợp/Nghi Lễ) + 1 ô mộ mỗi bên

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
    if (card.monster_category === 'Dung Hợp') return '🌀';
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
      zoneEl.onclick = (function(i) { return function() { mcDeclareAttack(i, false); }; })(idx);
    }
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
      zoneEl.onclick = (function(i) { return function() { mcActivateFaceDownSpellTrap(i); }; })(idx);
    }
  } else {
    zoneEl.innerHTML = mcCardArtHTML(card, 42) + '<div class="mc-card-name-tiny">' + card.name + '</div>';
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
      if (c) pfEl.innerHTML = mcCardArtHTML(c, 42) + '<div class="mc-card-name-tiny">' + c.name + '</div>';
    } else { pfEl.innerHTML = '<span class="mc-zone-empty">Môi Trường</span>'; }
  }
  const ofEl = document.getElementById('mcOppField');
  if (ofEl) {
    ofEl.innerHTML = '';
    if (d.oppField) {
      const c = mcCardById(d.oppField.id);
      if (c) ofEl.innerHTML = mcCardArtHTML(c, 42) + '<div class="mc-card-name-tiny">' + c.name + '</div>';
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
        peEl.onclick = function() { mcDeclareAttack(-1, true); };
      }
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
function openMemeCardGame() {
  const modal = document.getElementById('memecardGameModal');
  if (!modal) { console.error('[memecard] #memecardGameModal not found'); return; }
  modal.style.display = 'flex';
  mcShowScreen('mcLobbyScreen');
}

function mcShowScreen(id) {
  ['mcLobbyScreen', 'mcDeckScreen', 'mcDuelScreen'].forEach(function(s) {
    const el = document.getElementById(s);
    if (el) el.style.display = (s === id) ? 'flex' : 'none';
  });
  const res = document.getElementById('mcResultScreen');
  if (res) res.style.display = 'none';
}

function mcCloseGame() {
  const modal = document.getElementById('memecardGameModal');
  if (modal) modal.style.display = 'none';
  mcGame.duel = null;
}

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
  startBtn.onclick = mcStartDuel;
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
  d.turn = 'opponent';
  d.phase = 'DRAW';
  d.turnCount++;
  d.selectedHandIndex = null;
  d.mode = null;
  mcHideCardMenu();
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
      .filter(function(c) { return c && c.card_type === 'Monster' && c.monster_category !== 'Dung Hợp' && c.monster_category !== 'Nghi Lễ'; })
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
    d.oppSpells[emptySlot] = { id: card.id, faceDown: true };
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
  if (!d || d.turn !== 'player') return;
  if (d.mode !== null) return;
  if (d.phase !== 'MAIN1' && d.phase !== 'MAIN2') return;

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
  menuEl.innerHTML = '<div class="mc-card-menu-title">' + mcCardTypeIcon(card) + ' ' + card.name + '</div>';
  menuEl.style.display = 'flex';

  const addBtn = function(text, cls, fn) {
    const b = document.createElement('button');
    b.className = 'mc-btn ' + (cls || '');
    b.textContent = text;
    b.onclick = fn;
    menuEl.appendChild(b);
  };

  if (card.card_type === 'Monster') {
    const cat = card.monster_category;
    if (cat !== 'Dung Hợp' && cat !== 'Nghi Lễ') {
      addBtn('⬛ Triệu Hồi (Tấn Công)', '', function() { mcInitSummon(idx, 'atk'); });
      addBtn('🛡️ Úp (Phòng Thủ)', 'mc-btn-secondary', function() { mcInitSummon(idx, 'def_down'); });
    } else if (cat === 'Dung Hợp') {
      addBtn('🌀 Triệu Hồi Dung Hợp', '', function() { mcInitFusion(idx); });
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
    if (card && card.monster_category === 'Hiệu Ứng' && card.effect_trigger === 'on_summon') {
      mcExecuteEffect('player', card);
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
  d.playerSpells[emptySlot] = { id: cardId, faceDown: true };
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
  if (!card || card.monster_category !== 'Dung Hợp') return;
  if (d.playerExtraZone) { mcLog('⚠️ Extra Zone đã có quái!'); mcRenderAll(); return; }

  const req = card.fusion_requirement || { count: 2, minStars: 0 };
  const available = d.playerMonsters.map(function(s, i) { return { s: s, i: i }; }).filter(function(x) { return x.s !== null; });
  const totalStars = available.reduce(function(sum, x) { return sum + (mcCardById(x.s.id) ? (mcCardById(x.s.id).stars || 0) : 0); }, 0);

  if (available.length < req.count || totalStars < req.minStars) {
    mcLog('⚠️ Dung Hợp cần ' + req.count + ' quái, tổng sao ≥' + req.minStars + ' (hiện: ' + available.length + ' quái, ' + totalStars + ' sao)');
    mcRenderAll();
    return;
  }

  const used = available.slice(0, req.count);
  used.forEach(function(x) { d.playerGY.push(x.s.id); d.playerMonsters[x.i] = null; });
  d.playerExtraZone = { id: cardId, position: 'atk', hasAttacked: false, equipBonus: 0 };
  d.playerHand.splice(handIdx, 1);
  mcLog('🌀 Triệu hồi Dung Hợp: ' + card.name + ' (ATK ' + card.atk + ')');
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
  if (d.playerExtraZone) { mcLog('⚠️ Extra Zone đã có quái!'); mcRenderAll(); return; }

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

  d.playerExtraZone = { id: cardId, position: 'atk', hasAttacked: false, equipBonus: 0 };
  mcLog('🕯️ Triệu hồi Nghi Lễ: ' + card.name + ' (ATK ' + card.atk + ')');
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

  if (card.card_type === 'Trap' && card.trap_category === 'Phản Đòn') {
    mcLog('⚠️ Bẫy Phản Đòn chỉ kích hoạt khi đối thủ tấn công!');
    return;
  }

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

console.log('🐸 [memecard.js] Engine Đấu Trường Meme Xóm đã nạp thành công!');
