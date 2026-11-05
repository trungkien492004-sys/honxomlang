// Hiệu ứng cho 5 lá Duel Links trước đây chỉ có chữ: Twin Burst, Toon BLS, Golden Eyes Idol, Rampage Dragon, Cyber Dragon Vier.
// Twin Burst: trait battle_indestructible + banish_survivor (xử lý trong meme_anime_rules.js: remove() và battle()).
(() => {
  if (!window.memeAnime?.tcgCore || !window.memeDlHandlers) return;
  const { S, E, free, pick, fx, remove, spellList, clearSpell } = window.memeAnime.tcgCore;
  const other = n => (n === 'player' ? 'enemy' : 'player');
  const C = id => card(id);
  const isCyberDragon = c => !!c && (c.name_en === 'Cyber Dragon' || c.id === 'AN-cyber_dragon' || c.id === 'DL-cyber_dragon_vier');
  const H = window.memeDlHandlers;

  // Toon Black Luster Soldier: 1 lần/lượt trục xuất 1 lá trên sân.
  async function toonBls(n, c, ctx = {}) {
    const src = ctx.source;
    if (!src || !E(n).some(e => e.slot === src) || src.blsRound === duel.round) return false;
    const list = [
      ...E(n).map(e => ({ ...e, name: n })), ...E(other(n)).map(e => ({ ...e, name: other(n) })),
      ...spellList(n), ...spellList(other(n))
    ].filter(e => e.slot !== src).map(e => ({ ...e, hidden: e.name !== n && !!e.slot.faceDown }));
    if (!list.length) return false;
    const t = await pick(n, 'Chiến Binh Ánh Sáng Hoạt Hình: trục xuất 1 lá trên sân', list);
    if (!t) return false;
    return fx(n, c, 'destroy', [t], () => {
      src.blsRound = duel.round;
      const owner = S(t.name);
      if (t.index != null && t.index >= 0 && owner.spells?.[t.index] === t.slot) { owner.spells[t.index] = null; owner.banished.push(t.slot.id); }
      else if (t.index === -1 && owner.field === t.slot) { owner.field = null; owner.banished.push(t.slot.id); }
      else { t.slot.banishOnLeave = true; remove(t.name, t, 'effect'); }
      log(`🌌 ${c.name} trục xuất ${C(t.slot.id)?.name || 'một lá'}.`);
    });
  }

  // Golden Eyes Idol: xem tay đối thủ.
  async function goldenEyes(n, c, ctx = {}) {
    const foe = S(other(n));
    if (!foe.hand.length) { log('Đối thủ không có bài trên tay.'); return false; }
    return fx(n, c, 'spell', [], () => {
      const names = foe.hand.map(id => C(id)?.name || id).join(', ');
      log(`👁 ${c.name}: tay đối thủ — ${names}`);
      window.showActionNotice?.(names, 'Tay đối thủ');
      if (ctx.source) ctx.source.idolRound = duel.round;
    });
  }

  // Chimeratech Rampage Dragon: khi triệu hồi, phá Phép/Bẫy đối thủ bằng số nguyên liệu.
  async function rampage(n, c, ctx = {}) {
    const count = Math.max(1, ctx.source?.materialCount || 2);
    const list = spellList(other(n)).map(e => ({ ...e, hidden: !!e.slot.faceDown }));
    if (!list.length) return false;
    const picks = [];
    const total = Math.min(count, list.length);
    for (let i = 0; i < total; i++) {
      const rest = list.filter(e => !picks.includes(e));
      const t = rest.length === 1 ? rest[0] : await pick(n, `Rampage Dragon: phá Phép/Bẫy (${i + 1}/${total})`, rest);
      if (!t) break;
      picks.push(t);
    }
    if (!picks.length) return false;
    return fx(n, c, 'destroy', picks, () => { for (const t of picks) clearSpell(t.name, t.index); });
  }

  // Cyber Dragon Vier: khi bạn triệu hồi Rồng Máy, gọi đặc biệt lá này từ tay thế thủ.
  async function onSummon(n, slot) {
    try {
      const c = C(slot?.id), s = S(n);
      if (!isCyberDragon(c) || c.id === 'DL-cyber_dragon_vier' || !s.hand.includes('DL-cyber_dragon_vier') || free(n) < 0) return;
      await fx(n, C('DL-cyber_dragon_vier'), 'spell', [], () => {
        const i = s.hand.indexOf('DL-cyber_dragon_vier');
        if (i < 0 || free(n) < 0) return;
        s.hand.splice(i, 1);
        const vs = monsterSlot('DL-cyber_dragon_vier', 'def'); vs.summonedRound = duel.round; const zone = s.monsters.indexOf(null); if (zone < 0) { s.hand.push('DL-cyber_dragon_vier'); return; } s.monsters[zone] = vs;
        log('🤖 Rồng Máy Vier tự gọi đặc biệt ở thế thủ.');
      });
    } catch (e) { console.warn('Vier:', e); }
  }

  H.set('DL-toon_black_luster_soldier', toonBls);
  H.set('dl_toon_bls', toonBls);
  H.set('DL-golden_eyes_idol', goldenEyes);
  H.set('dl_golden_eyes', goldenEyes);
  H.set('DL-chimeratech_rampage_dragon', rampage);
  H.set('dl_rampage_dragon', rampage);

  window.memeDlMissing = { onSummon, toonBls, goldenEyes, rampage, isCyberDragon };
})();
