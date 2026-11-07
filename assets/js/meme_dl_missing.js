// Hiệu ứng cho các lá Duel Links trước đây chỉ có chữ: Toon BLS, Golden Eyes Idol.
// Twin Burst: trait battle_indestructible + banish_survivor (xử lý trong meme_anime_rules.js: remove() và battle()).
// Rampage Dragon + Cyber Dragon Vier: handler trong meme_duel_links_engine.js.
(() => {
  if (!window.memeAnime?.tcgCore || !window.memeDlHandlers) return;
  const { S, E, pick, fx, remove, spellList } = window.memeAnime.tcgCore;
  const other = n => (n === 'player' ? 'enemy' : 'player');
  const C = id => card(id);
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

  // Chimeratech Rampage Dragon và Cyber Dragon Vier đã có handler đầy đủ trong
  // meme_duel_links_engine.js (đếm nguyên liệu, 1 lần/lượt, hào quang ATK/DEF theo tên đã đổi).

  H.set('DL-toon_black_luster_soldier', toonBls);
  H.set('dl_toon_bls', toonBls);
  H.set('DL-golden_eyes_idol', goldenEyes);
  H.set('dl_golden_eyes', goldenEyes);

  window.memeDlMissing = { toonBls, goldenEyes };
})();
