// Hiệu ứng bài của Marik, Jack, Shark, Chazz. Dữ liệu lá ở meme_roster2_catalog.js.
(() => {
  if (!window.memeAnime?.tcgCore || !window.memeDlHandlers) return;
  const core = window.memeAnime.tcgCore;
  const { S, E, face, has, uid, free, allFields, choices, pick, fx, remove, damage, stat, postSummon, sentToGrave } = core;
  const H = window.memeDlHandlers, other = n => (n === 'player' ? 'enemy' : 'player'), C = id => card(id);
  const alive = (n, slot) => E(n).some(e => e.slot === slot);
  // Bot luôn nhắm quái đối thủ nếu có; người chơi được chọn mọi mục tiêu lá bài cho phép.
  const botTargets = (n, list) => { if (n !== 'enemy') return list; const foe = list.filter(e => e.name !== n); return foe.length ? foe : list; };

  function place(n, id, position = 'atk') {
    const s = S(n), zone = s.monsters.indexOf(null);
    if (zone < 0) return null;
    const slot = monsterSlot(id, position); uid(slot); slot.summonedRound = duel.round; s.monsters[zone] = slot;
    return slot;
  }
  function take(s, zone, id) { const pool = zone === 'hand' ? s.hand : zone === 'deck' ? s.deck : s.grave, i = pool.indexOf(id); if (i < 0) return false; pool.splice(i, 1); if (zone === 'deck') s.deck = shuffle(s.deck); return true; }
  async function summonFrom(n, c, zone, id, position = 'atk') {
    const s = S(n); let slot = null;
    const ok = await fx(n, C(id), 'special', [], () => { if (free(n) < 0 || !take(s, zone, id)) return; slot = place(n, id, position); log(`✦ ${c.name}: Triệu hồi Đặc biệt ${C(id).name}.`); });
    if (slot) await postSummon(n, slot);
    return ok;
  }
  // Đưa 1 quái từ tay vào Mộ làm chi phí. Trả về ATK của lá đó.
  async function discardMonster(n, title) {
    const s = S(n), list = choices(s.hand, 'hand').filter(e => C(e.id)?.card_type === 'Monster');
    if (!list.length) return null;
    const t = await pick(n, title, list, { optional: true });
    if (!t) return null;
    if (!take(s, 'hand', t.id)) return null;
    s.grave.push(t.id); sentToGrave(n, t.id, false, 'cost');
    return { id: t.id, atk: C(t.id).atk || 0 };
  }

  // ----- Marik -----
  H.set('r2_newdoria', async (n, c) => {
    const list = botTargets(n, allFields()); if (!list.length) return false;
    const t = await pick(n, 'Newdoria: chọn 1 quái trên sân để phá hủy', list);
    if (!t) return false;
    return fx(n, c, 'destroy', [t], () => { if (alive(t.name, t.slot)) remove(t.name, t, 'effect'); });
  });
  H.set('r2_tomato', async (n, c) => {
    const s = S(n); if (free(n) < 0) return false;
    const list = choices(s.deck, 'deck').filter(e => { const x = C(e.id); return x?.card_type === 'Monster' && x.element === 'Ám' && (x.atk || 0) <= 1500 && !x.special_only; });
    if (!list.length) return false;
    const t = await pick(n, 'Cà Chua Thần Bí: chọn quái ÁM ATK ≤1500 từ Bộ bài', list, { optional: true });
    return t ? summonFrom(n, c, 'deck', t.id) : false;
  });
  H.set('r2_germ', async (n, c) => {
    await fx(n, c, 'damage', [{ name: other(n), type: 'lp' }], () => damage(other(n), 500), { text: 'Gây 500 sát thương cho đối thủ.' });
    const s = S(n);
    while (free(n) >= 0 && s.deck.includes(c.id) && !duel.finished) {
      const t = await pick(n, 'Vi Khuẩn Khổng Lồ: Triệu hồi thêm 1 lá từ Bộ bài?', [{ id: c.id, label: 'Triệu hồi ' + c.name }], { optional: true });
      if (!t) break;
      await summonFrom(n, c, 'deck', c.id);
    }
    return true;
  });
  H.set('r2_mask', async (n, c) => {
    const s = S(n), list = choices(s.grave, 'grave').filter(e => C(e.id)?.card_type === 'Trap');
    if (!list.length) return false;
    const t = await pick(n, 'Mặt Nạ Bóng Tối: chọn 1 Bẫy trong Mộ', list);
    if (!t) return false;
    return fx(n, c, 'search', [], () => { if (take(s, 'grave', t.id)) s.hand.push(t.id); });
  });

  // ----- Jack -----
  H.set('r2_red_reso', async (n, c, ctx = {}) => {
    const s = S(n);
    if (ctx.kind === 'normal') {
      if (free(n) < 0) return false;
      const list = choices(s.hand, 'hand').filter(e => { const x = C(e.id); return x?.card_type === 'Monster' && (x.stars || 0) <= 4 && !x.rank && !x.special_only; });
      if (!list.length) return false;
      const t = await pick(n, 'Cộng Hưởng Đỏ: Triệu hồi Đặc biệt quái Cấp 4 trở xuống từ tay', list, { optional: true });
      return t ? summonFrom(n, c, 'hand', t.id) : false;
    }
    if (s.redResoRound === duel.round) return false;
    const list = allFields().filter(e => face(e.slot)); if (!list.length) return false;
    const t = await pick(n, 'Cộng Hưởng Đỏ: nhận LP bằng ATK của 1 quái ngửa', list, { optional: true });
    if (!t) return false;
    const gain = stat(t.name, t.slot);
    return fx(n, c, 'heal', [], () => { s.redResoRound = duel.round; core.heal(n, gain); });
  });
  const powerInvader = () => {
    const c = C('AN-power_invader'); if (!c || Object.getOwnPropertyDescriptor(c, 'tribute_count')?.get) return;
    Object.defineProperty(c, 'tribute_count', { configurable: true, enumerable: false, get() { const n = typeof duel !== 'undefined' && duel?.turn; return n && E(other(n)).length >= 2 ? 0 : 1; } });
  };
  powerInvader();

  // ----- Shark -----
  H.set('r2_hammer', async (n, c, ctx = {}) => {
    const s = S(n), src = ctx.source; if (!src || !alive(n, src) || free(n) < 0) return false;
    const lv = src.levelFixed ?? c.stars; if (lv <= 1) return false;
    const list = choices(s.hand, 'hand').filter(e => { const x = C(e.id); return x?.card_type === 'Monster' && x.element === 'Thủy' && (x.stars || 0) <= 3 && !x.special_only; });
    if (!list.length) { if (n === 'player') window.showActionNotice?.('Cần 1 quái THỦY Cấp 3 trở xuống trên tay.', 'Chưa đủ điều kiện'); return false; }
    const t = await pick(n, 'Cá Mập Búa: chọn quái THỦY Cấp 3 trở xuống từ tay', list, { optional: true });
    if (!t) return false;
    src.levelFixed = lv - 1; src.effectUsedRound = duel.round;
    return summonFrom(n, c, 'hand', t.id);
  });
  H.set('r2_lancer', async (n, c, ctx = {}) => {
    const s = S(n), src = ctx.source; if (!src || !alive(n, src) || !(src.materials || []).length) return false;
    const list = botTargets(n, allFields().filter(e => face(e.slot) && e.slot !== src)); if (!list.length) return false;
    const t = await pick(n, 'Thương Thủ Cá Đuối Đen: chọn quái để vô hiệu hóa', list, { optional: true });
    if (!t) return false;
    return fx(n, c, 'negate', [t], () => { s.grave.push(src.materials.pop()); src.effectUsedRound = duel.round; t.slot.negatedUntil = duel.round; log(`✦ ${C(t.slot.id).name} bị vô hiệu hóa hiệu ứng đến End Phase.`); });
  });
  async function onSummon(n, slot) {
    try {
      const c = C(slot?.id), s = S(n), id = 'AN-shark_stickers';
      if (!c || !['Cá', 'Hải Long', 'Thủy'].includes(c.tribe) || !s.hand.includes(id) || free(n) < 0) return;
      const t = await pick(n, 'Cá Bám: Triệu hồi Đặc biệt lá này từ tay?', [{ id, label: 'Triệu hồi Cá Bám' }], { optional: true });
      if (t) await summonFrom(n, C(id), 'hand', id);
    } catch (e) { console.warn('roster2:', e); }
  }

  // ----- Chazz -----
  H.set('r2_lv5', async (n, c, ctx = {}) => {
    const src = ctx.source, foe = other(n); if (!src || !alive(n, src) || !E(foe).length) return false;
    const cost = await discardMonster(n, 'Rồng Vũ Trang LV5: đưa 1 quái từ tay vào Mộ');
    if (!cost) return false;
    const list = E(foe).filter(e => face(e.slot) && stat(foe, e.slot) <= cost.atk).map(e => ({ ...e, id: e.slot.id, name: foe, type: e.extra ? 'extra' : 'monster' }));
    if (!list.length) return true;
    const t = await pick(n, `Rồng Vũ Trang LV5: phá quái có ATK ≤ ${cost.atk}`, list);
    if (!t) return true;
    return fx(n, c, 'destroy', [t], () => { if (alive(foe, t.slot)) remove(foe, t, 'effect'); });
  });
  H.set('r2_lv7', async (n, c, ctx = {}) => {
    const src = ctx.source, foe = other(n); if (!src || !alive(n, src) || !E(foe).length) return false;
    const cost = await discardMonster(n, 'Rồng Vũ Trang LV7: đưa 1 quái từ tay vào Mộ');
    if (!cost) return false;
    const hit = E(foe).filter(e => face(e.slot) && stat(foe, e.slot) <= cost.atk).map(e => ({ ...e, name: foe, type: e.extra ? 'extra' : 'monster' }));
    if (!hit.length) return true;
    return fx(n, c, 'destroy', hit, () => { for (const e of hit) if (alive(foe, e.slot)) remove(foe, e, 'effect'); });
  });
  async function levelUp(n, c, id, title) {
    const s = S(n), zone = s.hand.includes(id) ? 'hand' : s.deck.includes(id) ? 'deck' : null;
    if (!zone) return false;
    const entry = E(n).find(e => e.slot.id === c.id && face(e.slot)); if (!entry) return false;
    const t = await pick(n, title, [{ id, label: 'Tiến hóa thành ' + C(id).name }], { optional: true });
    if (!t) return false;
    await fx(n, c, 'cost', [], () => { if (entry.extra) s.extra = null; else s.monsters[entry.index] = null; s.grave.push(c.id); sentToGrave(n, c.id, false, 'cost'); });
    return summonFrom(n, c, zone, id);
  }

  // ----- Móc vào chiến đấu -----
  function beforeBattle(owner, attacker, defender) {
    if (!defender) return null;
    if (has(defender, 'r2_mad') && face(defender) && defender.position === 'atk') { defender.position = 'def'; log(`✦ ${C(defender.id).name} chuyển sang thế thủ.`); }
    return { defWasDef: defender.position !== 'atk', foeLp: S(other(owner)).lp, defId: defender.id };
  }
  async function afterBattle(owner, attacker, defender, ctx) {
    if (!ctx || !attacker) return;
    const foe = other(owner), destroyed = !alive(foe, defender);
    if (destroyed && S(foe).grave.includes(ctx.defId)) {
      attacker.destroyedBattleRound = duel.round;
      if (has(defender, 'r2_chthonian')) {
        const taken = ctx.foeLp - S(foe).lp;
        if (taken > 0 && !duel.finished) await fx(foe, C(ctx.defId), 'damage', [{ name: owner, type: 'lp' }], () => damage(owner, taken), { text: `Trả lại ${taken} sát thương.` });
      }
      if (has(attacker, 'r2_drake') && alive(owner, attacker) && attacker.drakeRound !== duel.round && (attacker.materials || []).length && free(foe) >= 0) {
        const c = C(attacker.id), t = await pick(owner, 'Số 32: tách 1 nguyên liệu để hồi sinh quái bị phá lên sân đối thủ và tấn công lần nữa?', [{ id: ctx.defId, label: 'Tách nguyên liệu' }], { optional: true });
        if (t) await fx(owner, c, 'special', [], () => {
          const g = S(foe).grave, i = g.lastIndexOf(ctx.defId); if (i < 0 || free(foe) < 0) return;
          g.splice(i, 1); const slot = place(foe, ctx.defId, 'atk'); if (!slot) return;
          slot.statAtk = Math.max(0, (C(ctx.defId).atk || 0) - 1000);
          S(owner).grave.push(attacker.materials.pop()); attacker.drakeRound = duel.round; attacker.attacksUsed = Math.max(0, (attacker.attacksUsed || 1) - 1); attacker.attacked = false;
        });
      }
    }
    if (has(attacker, 'r2_rda') && ctx.defWasDef && alive(owner, attacker) && face(attacker) && !duel.finished) {
      const hit = E(foe).filter(e => e.slot.position !== 'atk').map(e => ({ ...e, name: foe, type: e.extra ? 'extra' : 'monster' }));
      if (hit.length) await fx(owner, C(attacker.id), 'destroy', hit, () => { for (const e of hit) if (alive(foe, e.slot)) remove(foe, e, 'effect'); });
    }
  }

  // ----- Đầu lượt / cuối lượt -----
  const prevStart = window.memeAnime.onStartTurn, prevEnd = window.memeAnime.onEndTurn;
  window.memeAnime.onStartTurn = async function (n) {
    if (prevStart) await prevStart.call(this, n);
    for (const e of [...E(n)]) if (has(e.slot, 'r2_lv3') && face(e.slot) && !duel.finished) await levelUp(n, C(e.slot.id), 'AN-armed_dragon_lv5', 'Rồng Vũ Trang LV3: tiến hóa thành LV5?');
  };
  window.memeAnime.onEndTurn = async function (n) {
    for (const e of [...E(n)]) {
      if (!alive(n, e.slot) || duel.finished) continue;
      if (has(e.slot, 'r2_big_jaws') && (e.slot.attacksUsed || 0) > 0) await fx(n, C(e.slot.id), 'destroy', [{ ...e, name: n, type: 'monster' }], () => { e.slot.banishOnLeave = true; remove(n, e, 'effect'); });
      else if (has(e.slot, 'r2_lv5') && e.slot.destroyedBattleRound === duel.round && face(e.slot)) await levelUp(n, C(e.slot.id), 'AN-armed_dragon_lv7', 'Rồng Vũ Trang LV5: tiến hóa thành LV7?');
    }
    const rda = E(n).find(e => has(e.slot, 'r2_rda') && face(e.slot));
    if (rda && !duel.finished) {
      const hit = E(n).filter(e => e.slot !== rda.slot && !(e.slot.attacksUsed > 0)).map(e => ({ ...e, name: n, type: e.extra ? 'extra' : 'monster' }));
      if (hit.length) await fx(n, C(rda.slot.id), 'destroy', hit, () => { for (const e of hit) if (alive(n, e.slot)) remove(n, e, 'effect'); });
    }
    if (prevEnd) await prevEnd.call(this, n);
  };
  for (const code of ['r2_newdoria', 'r2_tomato', 'r2_germ', 'r2_mask', 'r2_red_reso', 'r2_hammer', 'r2_lancer', 'r2_lv5', 'r2_lv7']) window.memeRules?.supported?.add(code);
  window.memeRoster2 = { onSummon, beforeBattle, afterBattle, powerInvader };
})();
