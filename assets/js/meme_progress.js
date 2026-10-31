// Local-first collection and progression store. Cloud sync arrives in a later phase.
(function () {
  'use strict';

  const KEY = 'xom-progress-v1';
  const LEGACY_KEY = /^(xom-arcana-(main|decks|extra)-|hai-trinh-meme-deck-)/;
  const CARDS = window.MEME_CARDS || [];
  const CARD_BY_ID = new Map(CARDS.map(c => [c.id, c]));

  function cardLimit(id) {
    const c = CARD_BY_ID.get(id);
    return Math.max(1, Number(c?.max_copies) || (id === 'trung_tang_bat_ngo' ? 1 : 3));
  }

  function emptyState() {
    const now = Date.now();
    return {
      v: 1, createdAt: now, updatedAt: now,
      xp: 0, level: 1, xu: 0, dust: 0,
      tickets: { p1: 0, p2: 0, p3: 0 },
      pity: { p1: 0, p2: 0, p3: 0 },
      owned: {},
      login: { streak: 0, lastDay: '' },
      quests: {}, story: {}, tower: {},
      migrated: false, legacyChecked: true
    };
  }

  function normalize(raw) {
    const state = emptyState();
    if (!raw || typeof raw !== 'object') return state;
    state.createdAt = Number(raw.createdAt) || state.createdAt;
    state.updatedAt = Number(raw.updatedAt) || state.updatedAt;
    state.xp = Math.max(0, Number(raw.xp) || 0);
    state.level = Math.min(40, Math.max(1, Number(raw.level) || 1));
    state.xu = Math.max(0, Number(raw.xu) || 0);
    state.dust = Math.max(0, Number(raw.dust) || 0);
    for (const k of ['p1', 'p2', 'p3']) {
      state.tickets[k] = Math.max(0, Number(raw.tickets?.[k]) || 0);
      state.pity[k] = Math.max(0, Number(raw.pity?.[k]) || 0);
    }
    state.migrated = raw.migrated === true;
    state.legacyChecked = raw.legacyChecked === true;
    state.login = { streak: Math.max(0, Number(raw.login?.streak) || 0), lastDay: String(raw.login?.lastDay || '') };
    state.quests = raw.quests && typeof raw.quests === 'object' ? raw.quests : {};
    state.story = raw.story && typeof raw.story === 'object' ? raw.story : {};
    state.tower = raw.tower && typeof raw.tower === 'object' ? raw.tower : {};
    if (raw.owned && typeof raw.owned === 'object') {
      for (const [id, count] of Object.entries(raw.owned)) {
        if (!CARD_BY_ID.has(id)) continue;
        const copies = Math.min(cardLimit(id), Math.floor(Number(count) || 0));
        if (copies > 0) state.owned[id] = copies;
      }
    }
    return state;
  }

  function readRaw() {
    try {
      const text = localStorage.getItem(KEY);
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }

  function save() {
    if (!state) return false;
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  function raise(id, copies) {
    if (!CARD_BY_ID.has(id)) return false;
    const cap = cardLimit(id), next = Math.min(cap, Math.max(state.owned[id] || 0, Math.floor(Number(copies) || 0)));
    if (next <= (state.owned[id] || 0)) return false;
    state.owned[id] = next;
    return true;
  }

  function starterCards() {
    const first = Object.values(window.MEME_DECK_PRESETS || {})[0];
    const main = Array.isArray(first) ? first : [];
    const extra = window.ARCANA_CATALOGUE?.defaultExtra || [];
    return [...main, ...extra];
  }

  function ensureStarter() {
    let changed = false;
    for (const group of [starterCards()]) {
      const counts = new Map();
      for (const id of group) counts.set(id, (counts.get(id) || 0) + 1);
      for (const [id, n] of counts) if (raise(id, n)) changed = true;
    }
    return changed;
  }

  function legacyCounts() {
    const counts = new Map();
    let length = 0;
    try {
      length = localStorage.length;
    } catch {
      return counts;
    }
    const addArray = list => {
      if (!Array.isArray(list)) return;
      const seen = new Map();
      for (const id of list) {
        if (!CARD_BY_ID.has(id)) continue;
        const n = (seen.get(id) || 0) + 1;
        seen.set(id, n);
        if (n > (counts.get(id) || 0)) counts.set(id, n);
      }
    };
    for (let i = 0; i < length; i++) {
      let key;
      try {
        key = localStorage.key(i);
      } catch {
        break;
      }
      if (!key || !LEGACY_KEY.test(key)) continue;
      let value;
      try {
        value = JSON.parse(localStorage.getItem(key));
      } catch {
        continue;
      }
      if (Array.isArray(value)) {
        addArray(value);
      } else if (value && Array.isArray(value.decks)) {
        for (const deck of value.decks) addArray([...(deck?.cards || []), ...(deck?.extra || [])]);
      }
    }
    return counts;
  }

  const stored = readRaw();
  let state = stored ? normalize(stored) : emptyState();
  let changed = ensureStarter();
  if (!stored) {
    const legacy = legacyCounts();
    if (legacy.size) {
      for (const [id, n] of legacy) raise(id, n);
      state.level = 5;
      state.xu = 1000;
      state.tickets.p2 = 1;
      state.migrated = true;
      changed = true;
    }
    state.legacyChecked = true;
  }
  if (changed) save();

  function copies(id) {
    return state.owned[id] || 0;
  }

  function owns(id) {
    return copies(id) > 0;
  }

  function grant(ids, count = 1) {
    const list = Array.isArray(ids) ? ids : [ids];
    let changed = false;
    for (const id of list) {
      const next = (state.owned[id] || 0) + Math.max(1, Math.floor(Number(count) || 1));
      if (raise(id, next)) changed = true;
    }
    if (changed) save();
    return changed;
  }

  function grantDeck(cards, extra = []) {
    const need = new Map();
    for (const id of [...(cards || []), ...(extra || [])]) need.set(id, (need.get(id) || 0) + 1);
    let changed = false;
    for (const [id, n] of need) if (raise(id, n)) changed = true;
    if (changed) save();
    return changed;
  }

  function ownedProblem(cards, extra = []) {
    const need = new Map();
    for (const id of [...(cards || []), ...(extra || [])]) need.set(id, (need.get(id) || 0) + 1);
    const missing = [...need].filter(([id, n]) => copies(id) < n);
    if (!missing.length) return '';
    const names = missing.slice(0, 3).map(([id]) => CARD_BY_ID.get(id)?.name || id).join(', ');
    return `Còn ${missing.length} lá chưa sở hữu: ${names}${missing.length > 3 ? '…' : ''}. Mở pack để nhận thẻ.`;
  }

  window.memeProgress = {
    KEY,
    get state() { return state; },
    get ready() { return true; },
    knows(id) { return CARD_BY_ID.has(id); },
    copies,
    owns,
    grant,
    grantDeck,
    ownedProblem,
    starterCards,
    save,
    reset() {
      state = emptyState();
      ensureStarter();
      save();
    }
  };
})();
