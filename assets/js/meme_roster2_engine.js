// Hiệu ứng bài của Marik, Jack, Shark, Chazz. Dữ liệu lá ở meme_roster2_catalog.js.
(() => {
  if (!window.memeAnime?.tcgCore || !window.memeDlHandlers) return;
  const core = window.memeAnime.tcgCore;
  const { S, E, face, has, uid, free, allFields, choices, pick, pickMany, fx, remove, damage, stat, postSummon, sentToGrave, spellList, clearSpell, drawCards, commitSpellSource } = core;
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
      if (c && ['Cá', 'Hải Long', 'Thủy'].includes(c.tribe) && s.hand.includes(id) && free(n) >= 0) {
        const t = await pick(n, 'Cá Bám: Triệu hồi Đặc biệt lá này từ tay?', [{ id, label: 'Triệu hồi Cá Bám' }], { optional: true });
        if (t) await summonFrom(n, C(id), 'hand', id);
      }
      await onSummon47(n, slot);
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

  // ----- Đợt lá anime + meta -----
  const useSpell = (n, c, ctx) => commitSpellSource(n, c, ctx);
  // Lá trên tay trừ chính lá phép đang dùng (nó còn nằm trên tay cho tới lúc commit).
  function otherHand(n, c, ctx = {}) {
    const list = choices(S(n).hand, 'hand'); if (ctx.fromSet) return list;
    const i = list.findIndex(e => e.id === c.id); if (i >= 0) list.splice(i, 1); return list;
  }
  const isFishKin = x => ['Cá', 'Hải Long', 'Thủy'].includes(x?.tribe);
  const fieldLevel = slot => slot.levelFixed ?? C(slot.id)?.stars ?? 0;
  const ojamas = ['AN-ojama_green', 'AN-ojama_yellow', 'AN-ojama_black'];
  const lvNext = { 'AN-armed_dragon_lv3': 'AN-armed_dragon_lv5', 'AN-armed_dragon_lv5': 'AN-armed_dragon_lv7' };

  H.set('r2_tribute_to_the_doomed', async (n, c, ctx = {}) => {
    const hand = otherHand(n, c, ctx), list = botTargets(n, allFields());
    if (!hand.length || !list.length) { if (n === 'player') window.showActionNotice?.('Cần 1 lá trên tay để bỏ và 1 quái trên sân.', 'Chưa đủ điều kiện'); return false; }
    const cost = await pick(n, 'Vật Tế Kẻ Bị Kết Án: bỏ 1 lá', hand, { optional: true, cheap: true }); if (!cost) return false;
    const t = await pick(n, 'Vật Tế Kẻ Bị Kết Án: chọn quái để phá hủy', list, { optional: true }); if (!t) return false;
    return fx(n, c, 'destroy', [t], () => { if (!useSpell(n, c, ctx)) return; const s = S(n); if (take(s, 'hand', cost.id)) { s.grave.push(cost.id); sentToGrave(n, cost.id, true, 'cost'); } if (alive(t.name, t.slot)) remove(t.name, t, 'effect'); });
  });
  H.set('r2_resonator_call', async (n, c, ctx = {}) => {
    const s = S(n), list = choices(s.deck, 'deck').filter(e => C(e.id)?.card_type === 'Monster' && /Resonator/.test(C(e.id)?.name_en || ''));
    if (!list.length) return false;
    const t = await pick(n, 'Tiếng Gọi Cộng Hưởng: chọn quái Cộng Hưởng từ Bộ bài', list); if (!t) return false;
    return fx(n, c, 'search', [], () => { if (!useSpell(n, c, ctx)) return; if (take(s, 'deck', t.id)) { window.memeCardMotion?.record('search', n, t.id); s.hand.push(t.id); } });
  });
  H.set('r2_scarlet_security', async (n, c, ctx = {}) => {
    const foe = other(n), list = spellList(foe);
    if (!E(n).some(e => face(e.slot) && e.slot.id === 'AN-red_dragon_archfiend') || !list.length) { if (n === 'player') window.showActionNotice?.('Cần Rồng Quỷ Đỏ ngửa trên sân và đối thủ có Phép/Bẫy.', 'Chưa đủ điều kiện'); return false; }
    return fx(n, c, 'destroy', list, () => { if (!useSpell(n, c, ctx)) return; for (const e of [...spellList(foe)]) clearSpell(foe, e.index); });
  });
  H.set('r2_sprinter', async (n, c, ctx = {}) => {
    const s = S(n); if (E(n).length !== 1 || s.sprinterRound === duel.round || free(n) < 0) return false;
    const ok = e => { const x = C(e.id); return x?.card_type === 'Monster' && x.is_tuner && x.tribe === 'Quỷ' && (x.stars || 0) <= 3; };
    const list = [...choices(s.hand, 'hand').filter(ok), ...choices(s.grave, 'grave').filter(ok)]; if (!list.length) return false;
    const t = await pick(n, 'Quỷ Đỏ Nước Rút: gọi Tuner tộc Quỷ Cấp 3 trở xuống', list, { optional: true }); if (!t) return false;
    s.sprinterRound = duel.round;
    return summonFrom(n, c, t.zone === 'grave' ? 'grave' : 'hand', t.id);
  });
  H.set('r2_hot_red', async (n, c, ctx = {}) => {
    const src = ctx.source; if (!src || !alive(n, src) || duel.phase !== 'MAIN1') return false;
    const hit = allFields().filter(e => e.slot !== src && face(e.slot) && e.slot.position === 'atk');
    return fx(n, c, 'destroy', hit, () => {
      src.effectUsedRound = duel.round;
      for (const e of hit) if (alive(e.name, e.slot)) remove(e.name, e, 'effect');
      for (const e of E(n)) if (e.slot !== src) e.slot.frozenUntil = duel.round;
    });
  });
  H.set('r2_bahamut', async (n, c, ctx = {}) => {
    const s = S(n), src = ctx.source; if (!src || !alive(n, src) || !(src.materials || []).length || free(n) < 0) return false;
    const list = choices(s.extraDeck, 'extra').filter(e => { const x = C(e.id); return x?.rank && x.rank <= 3 && x.element === 'Thủy'; });
    if (!list.length) { if (n === 'player') window.showActionNotice?.('Bộ bài phụ không có quái Xyz THỦY Bậc 3 trở xuống.', 'Chưa đủ điều kiện'); return false; }
    const t = await pick(n, 'Cá Mập Bahamut: chọn quái Xyz THỦY Bậc 3 trở xuống', list, { optional: true }); if (!t) return false;
    let slot = null;
    await fx(n, C(t.id), 'special', [], () => {
      const i = s.extraDeck.indexOf(t.id); if (i < 0) return;
      s.extraDeck.splice(i, 1); s.grave.push(src.materials.pop()); src.effectUsedRound = duel.round; src.frozenUntil = duel.round;
      slot = place(n, t.id, 'atk'); if (slot) { slot.materials = []; slot.xyzSummoned = true; }
    });
    if (slot) await postSummon(n, slot);
    return true;
  });
  H.set('r2_n47', async (n, c, ctx = {}) => {
    const s = S(n), src = ctx.source; if (!src || !alive(n, src) || !(src.materials || []).length) return false;
    const list = E(n).filter(e => face(e.slot) && C(e.slot.id)?.element === 'Thủy').map(e => ({ ...e, id: e.slot.id, name: n, type: e.extra ? 'extra' : 'monster' })); if (!list.length) return false;
    const t = await pick(n, 'Số 47: chọn quái THỦY được tấn công trực tiếp', list, { optional: true }); if (!t) return false;
    return fx(n, c, 'boost', [t], () => {
      s.grave.push(src.materials.pop()); src.effectUsedRound = duel.round; t.slot.directRound = duel.round;
      for (const e of E(n)) if (e.slot !== t.slot) e.slot.frozenUntil = duel.round;
    });
  });
  const relevel = (n, c, from, delta, ctx) => {
    if (ctx.kind !== 'normal') return false;
    const hit = E(n).filter(e => face(e.slot) && C(e.slot.id)?.tribe === 'Cá' && fieldLevel(e.slot) === from); if (!hit.length) return false;
    return fx(n, c, 'boost', [], () => { for (const e of hit) e.slot.levelFixed = from + delta; });
  };
  H.set('r2_spear', (n, c, ctx = {}) => relevel(n, c, 3, 1, ctx));
  H.set('r2_double', (n, c, ctx = {}) => relevel(n, c, 4, -1, ctx));
  H.set('r2_diva', async (n, c, ctx = {}) => {
    if (ctx.kind !== 'normal' || free(n) < 0) return false;
    const list = choices(S(n).deck, 'deck').filter(e => { const x = C(e.id); return x?.card_type === 'Monster' && x.tribe === 'Hải Long' && (x.stars || 0) <= 3 && !x.rank; }); if (!list.length) return false;
    const t = await pick(n, 'Ca Sĩ Biển Sâu: gọi quái Hải Long Cấp 3 trở xuống từ Bộ bài', list, { optional: true });
    return t ? summonFrom(n, c, 'deck', t.id) : false;
  });
  H.set('r2_moray_of_greed', async (n, c, ctx = {}) => {
    const s = S(n), list = otherHand(n, c, ctx).filter(e => { const x = C(e.id); return x?.card_type === 'Monster' && x.element === 'Thủy'; });
    if (list.length < 2) { if (n === 'player') window.showActionNotice?.('Cần 2 quái THỦY trên tay.', 'Chưa đủ điều kiện'); return false; }
    const picked = await pickMany(n, 'Lươn Tham Lam: chọn 2 quái THỦY để xáo vào Bộ bài', list, { min: 2, max: 2, optional: true }); if (!picked || picked.length !== 2) return false;
    return fx(n, c, 'draw', [], () => { if (!useSpell(n, c, ctx)) return; for (const p of picked) if (take(s, 'hand', p.id)) s.deck.push(p.id); s.deck = shuffle(s.deck); drawCards(n, 3); });
  });
  H.set('r2_aqua_jet', async (n, c, ctx = {}) => {
    const list = E(n).filter(e => face(e.slot) && isFishKin(C(e.slot.id))).map(e => ({ ...e, id: e.slot.id, name: n, type: e.extra ? 'extra' : 'monster' }));
    if (!list.length) { if (n === 'player') window.showActionNotice?.('Cần 1 quái ngửa tộc Cá, Hải Long hoặc Thủy.', 'Chưa đủ điều kiện'); return false; }
    const t = await pick(n, 'Tên Lửa Nước: chọn quái nhận 1000 ATK', list); if (!t) return false;
    return fx(n, c, 'boost', [t], () => { if (!useSpell(n, c, ctx)) return; t.slot.statAtk = (t.slot.statAtk ?? C(t.slot.id).atk ?? 0) + 1000; });
  });
  H.set('r2_lv10', async (n, c, ctx = {}) => {
    const s = S(n), src = ctx.source, foe = other(n); if (!src || !alive(n, src)) return false;
    const hit = E(foe).filter(e => face(e.slot)).map(e => ({ ...e, name: foe, type: e.extra ? 'extra' : 'monster' }));
    if (!hit.length || !s.hand.length) return false;
    const cost = await pick(n, 'Rồng Vũ Trang LV10: đưa 1 lá từ tay vào Mộ', choices(s.hand, 'hand'), { optional: true, cheap: true }); if (!cost) return false;
    return fx(n, c, 'destroy', hit, () => { src.effectUsedRound = duel.round; if (take(s, 'hand', cost.id)) { s.grave.push(cost.id); sentToGrave(n, cost.id, true, 'cost'); } for (const e of hit) if (alive(foe, e.slot)) remove(foe, e, 'effect'); });
  });
  H.set('r2_level_up', async (n, c, ctx = {}) => {
    const s = S(n), list = E(n).filter(e => face(e.slot) && lvNext[e.slot.id] && (s.hand.includes(lvNext[e.slot.id]) || s.deck.includes(lvNext[e.slot.id]))).map(e => ({ ...e, id: e.slot.id, name: n, type: 'monster' }));
    if (!list.length) { if (n === 'player') window.showActionNotice?.('Cần quái LV ngửa và lá tiến hóa của nó trên tay hoặc trong Bộ bài.', 'Chưa đủ điều kiện'); return false; }
    const t = await pick(n, 'Lên Cấp!: chọn quái LV', list); if (!t) return false;
    const next = lvNext[t.id], zone = s.hand.includes(next) ? 'hand' : 'deck'; let slot = null;
    await fx(n, C(next), 'special', [], () => {
      if (!useSpell(n, c, ctx) || !alive(n, t.slot)) return;
      if (t.extra) s.extra = null; else s.monsters[t.index] = null; s.grave.push(t.id); sentToGrave(n, t.id, false, 'cost');
      if (take(s, zone, next)) slot = place(n, next, 'atk');
    });
    if (slot) await postSummon(n, slot);
    return true;
  });
  H.set('r2_level_modulation', async (n, c, ctx = {}) => {
    const s = S(n), list = choices(s.grave, 'grave').filter(e => /\bLV\d+/.test(C(e.id)?.name_en || ''));
    if (!list.length || free(n) < 0) { if (n === 'player') window.showActionNotice?.('Cần 1 quái LV trong Mộ và 1 ô quái trống.', 'Chưa đủ điều kiện'); return false; }
    const t = await pick(n, 'Điều Biến Cấp: chọn quái LV từ Mộ', list); if (!t) return false;
    return fx(n, C(t.id), 'special', [], () => {
      if (!useSpell(n, c, ctx)) return; drawCards(other(n), 2);
      if (!take(s, 'grave', t.id)) return; const slot = place(n, t.id, 'atk'); if (slot) { slot.frozenUntil = duel.round; slot.negatedUntil = duel.round; }
    });
  });
  H.set('r2_ojama_delta_hurricane', async (n, c, ctx = {}) => {
    const foe = other(n);
    if (!ojamas.every(id => E(n).some(e => face(e.slot) && e.slot.id === id))) { if (n === 'player') window.showActionNotice?.('Cần đủ Ojama Xanh, Vàng và Đen ngửa trên sân.', 'Chưa đủ điều kiện'); return false; }
    const mons = E(foe).map(e => ({ ...e, name: foe, type: e.extra ? 'extra' : 'monster' })), sp = spellList(foe);
    if (!mons.length && !sp.length) return false;
    return fx(n, c, 'destroy', [...mons, ...sp], () => { if (!useSpell(n, c, ctx)) return; for (const e of mons) if (alive(foe, e.slot)) remove(foe, e, 'effect'); for (const e of [...spellList(foe)]) clearSpell(foe, e.index); });
  });
  // Ojamagic không có hiệu ứng khi kích hoạt: chỉ chạy khi bị đưa từ tay hoặc sân vào Mộ.
  const prevGrave = window.memeAnime.onSentToGrave;
  window.memeAnime.onSentToGrave = async function (n, id, byEffect, reason) {
    if (prevGrave) await prevGrave.call(this, n, id, byEffect, reason);
    if (id !== 'AN-ojamagic' || duel.finished) return;
    const s = S(n), found = ojamas.filter(x => s.deck.includes(x)); if (!found.length) return;
    await fx(n, C(id), 'search', [], () => { for (const x of found) if (take(s, 'deck', x)) { window.memeCardMotion?.record('search', n, x); s.hand.push(x); } });
  };
  // Triệu hồi từ tay. Trả về chế độ cho specialMode() của engine.
  function specialModeFor(n, c) {
    if (c.id === 'AN-creation_resonator') return free(n) >= 0 && E(n).some(e => { const x = C(e.slot.id); return face(e.slot) && x?.synchro_requirement && (x.stars || 0) >= 8; }) ? 'free' : null;
    if (c.id === 'AN-armed_dragon_lv10') return E(n).some(e => face(e.slot) && e.slot.id === 'AN-armed_dragon_lv7') ? 'r2_lv10' : null;
    return null;
  }
  // Tấn công trực tiếp có điều kiện.
  function directOk(n, slot) {
    if (slot.directRound === duel.round) return true;
    if (!has(slot, 'r2_drillago')) return false;
    const foe = other(n), list = E(foe);
    return !!list.length && !spellList(foe).length && list.every(e => face(e.slot) && stat(foe, e.slot) >= 1600);
  }
  async function onSummon47(n, slot) {
    if (slot?.id !== 'AN-number_47_nightmare_shark' || !alive(n, slot)) return;
    const s = S(n), ok = x => x?.card_type === 'Monster' && x.element === 'Thủy' && !x.rank;
    const list = [...choices(s.hand, 'hand').filter(e => ok(C(e.id)) && C(e.id).stars === 3), ...E(n).filter(e => e.slot !== slot && face(e.slot) && ok(C(e.slot.id)) && fieldLevel(e.slot) === 3).map(e => ({ ...e, id: e.slot.id, name: n, type: 'monster', zone: 'field' }))];
    if (!list.length) return;
    const t = await pick(n, 'Số 47: gắn 1 quái THỦY Cấp 3 làm nguyên liệu?', list, { optional: true }); if (!t) return;
    await fx(n, C(slot.id), 'boost', [], () => {
      if (t.zone === 'field') { if (!alive(n, t.slot)) return; if (t.extra) s.extra = null; else s.monsters[t.index] = null; } else if (!take(s, 'hand', t.id)) return;
      slot.materials = [...(slot.materials || []), t.id];
    });
  }
  async function startEffects(n) {
    for (const e of [...E(n)]) {
      if (duel.finished || !alive(n, e.slot) || !face(e.slot) || (e.slot.negatedUntil ?? -1) >= duel.round) continue;
      if (has(e.slot, 'r2_bowganian')) await fx(n, C(e.slot.id), 'damage', [{ name: other(n), type: 'lp' }], () => damage(other(n), 600), { text: 'Gây 600 sát thương cho đối thủ.' });
      if (has(e.slot, 'r2_legend')) await fx(n, C(e.slot.id), 'boost', [], () => { e.slot.statAtk = (e.slot.statAtk ?? C(e.slot.id).atk ?? 0) + 700; });
    }
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
    await startEffects(n);
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
  for (const code of ['r2_newdoria', 'r2_tomato', 'r2_germ', 'r2_mask', 'r2_red_reso', 'r2_hammer', 'r2_lancer', 'r2_lv5', 'r2_lv7', 'r2_tribute_to_the_doomed', 'r2_resonator_call', 'r2_scarlet_security', 'r2_sprinter', 'r2_hot_red', 'r2_bahamut', 'r2_n47', 'r2_spear', 'r2_double', 'r2_diva', 'r2_moray_of_greed', 'r2_aqua_jet', 'r2_lv10', 'r2_level_up', 'r2_level_modulation', 'r2_ojama_delta_hurricane']) window.memeRules?.supported?.add(code);
  window.memeRoster2 = { onSummon, beforeBattle, afterBattle, powerInvader, specialMode: specialModeFor, directOk };
})();
