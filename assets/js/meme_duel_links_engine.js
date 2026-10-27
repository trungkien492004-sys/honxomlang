// ===== ⚔️ MEME_DUEL_LINKS_ENGINE.JS — Xử lý hiệu ứng 60 lá Duel Links Meta =====
(()=>{
  if (typeof window.memeAnime === 'undefined') return;
  const core = window.memeAnime.tcgCore;
  const {
    S, E, face, has, uid, free, allFields, extraOpen, placeOnField, targetList, spellList, choices,
    pick, pickMany, enqueue, fx, flush, stat, remove, clearSpell, revive, revivalPosition,
    takeDiscard, drawCards, damage, spendSpellSource, commitSpellSource,
    negateSpell, postSummon, specialSummon, normalSummon, fuse, sentToGrave
  } = core;

  // Extra Deck summons prefer the Extra Monster Zone; fall back to a free main zone.
  function summonExtra(n, slot, extraDeckId) {
    if (placeOnField(n, slot)) return true;
    if (extraDeckId != null) S(n).extraDeck.push(extraDeckId);
    log('Không còn ô trống cho quái Extra.');
    return false;
  }

  const C = id => card(id);
  const isHero = c => /\bHERO\b/.test(c?.name_en || '');
  const isBlueEyes = c => /Blue-Eyes/i.test(c?.name_en || '') || c?.id === 'DL-dragon_spirit_of_white';
  const isDarkMagician = c => /Dark Magician/i.test(c?.name_en || '') || c?.id === 'AN-dark_magician';
  const isRedEyes = c => /Red-Eyes/i.test(c?.name_en || '') || c?.id === 'AN-red_eyes_black_dragon';
  const isToon = c => c?.traits?.includes('toon') || /Toon/i.test(c?.name_en || '');
  const isCyber = c => /Cyber/i.test(c?.name_en || '') || c?.id === 'AN-cyber_dragon';
  const isSameEntry = (a, b) => a && b && a.zone === b.zone && (a.zone === 'field' ? a.slot === b.slot : a.index === b.index);

  // Handler map for all DL cards
  const handlers = new Map();
  window.memeDlHandlers = handlers;

  function register(id, fn) {
    handlers.set(id, fn);
  }

  // ─────────────────────────────────────────────────────────────
  // 1. KAIBA HANDLERS
  // ─────────────────────────────────────────────────────────────
  // Alternative White Dragon - Destroy monster
  register('DL-blue_eyes_alternative_white_dragon', async (n, c, ctx) => {
    const foe = other(n);
    const targets = targetList(foe);
    if (!targets.length) return false;
    const t = await pick(n, 'Rồng Trắng Thay Thế: chọn quái đối thủ để phá hủy', targets);
    if (!t) return false;
    return fx(n, c, 'destroy', [t], () => {
      remove(foe, t, 'effect');
      if (ctx.source) {
        ctx.source.attacksUsed = 99; // Không thể tấn công lượt này
      }
    });
  });

  // The Melody of Awakening Dragon - Discard 1, add up to 2 Dragons at once via multi-select
  register('DL-the_melody_of_awakening_dragon', async (n, c, ctx) => {
    const s = S(n);
    const costOptions = choices(s.hand, 'hand').filter(e => e.index !== ctx.handIndex);
    if (!costOptions.length) return false;
    const cost = await pick(n, 'Giai Điệu Thức Tỉnh: bỏ 1 lá làm chi phí', costOptions, { cheap: true });
    if (!cost) return false;
    const dragons = choices(s.deck, 'deck').filter(e => {
      const x = C(e.id);
      return x?.tribe === 'Rồng' && x.atk >= 3000 && x.def <= 2500;
    });
    if (!dragons.length) return false;
    const maxPicks = Math.min(2, dragons.length);
    const multiFn = core.pickMany || window.memeAnime.chooseMany;
    let picked = null;
    if (multiFn) {
      picked = await multiFn(n, 'Giai Điệu Thức Tỉnh Rồng: chọn tối đa 2 Rồng từ Deck', dragons, {
        min: 1,
        max: maxPicks,
        text: 'Chọn 1 hoặc 2 lá Rồng (Blue-Eyes / Alternative), rồi bấm Xác nhận.'
      });
    }
    if (!picked || !picked.length) {
      const single = await pick(n, 'Giai Điệu: chọn Rồng', dragons);
      if (!single) return false;
      picked = [single];
    }

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      takeDiscard(n, cost);
      for (const p of picked) {
        const idx = s.deck.indexOf(p.id);
        if (idx >= 0) {
          window.memeCardMotion?.record('search', n, p.id);
          s.hand.push(s.deck.splice(idx, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
      log(`✦ Giai Điệu Thức Tỉnh Rồng lấy ${picked.map(p => C(p.id).name).join(', ')} lên tay.`);
    });
  });

  // Cards of Consonance - Discard Level 1 Dragon Tuner <= 1000 ATK, draw 2
  register('DL-cards_of_consonance', async (n, c, ctx) => {
    const s = S(n);
    const costOptions = choices(s.hand, 'hand').filter(e => {
      const x = C(e.id);
      return e.index !== ctx.handIndex && x?.tribe === 'Rồng' && x.stars === 1 && x.atk <= 1000;
    });
    if (!costOptions.length) return false;
    const cost = await pick(n, 'Lá Bài Hòa Điệu: bỏ 1 Bạch Thạch làm chi phí', costOptions, { cheap: true });
    if (!cost) return false;

    return fx(n, c, 'draw', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      takeDiscard(n, cost);
      drawCards(n, 2);
    });
  });

  // Silver's Cry - Revive Normal Dragon
  register('DL-silvers_cry', async (n, c, ctx) => {
    const s = S(n);
    if (free(n) < 0) return false;
    const targets = choices(s.grave, 'grave').filter(e => {
      const x = C(e.id);
      return x?.tribe === 'Rồng' && (x.monster_category === 'Thường' || x.id === 'DL-dragon_spirit_of_white' || x.id === 'AN-blue_eyes_white_dragon' || x.traits?.includes('blue_eyes_name'));
    });
    if (!targets.length) return false;
    const t = await pick(n, 'Tiếng Gầm Bạc: chọn Rồng hồi sinh', targets);
    if (!t) return false;
    const pos = await revivalPosition(n, c, t.id);
    if (!pos) return false;

    return fx(n, c, 'revive', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      const slot = revive(n, n, t.id, pos);
      if (slot) enqueue(() => postSummon(n, slot));
    });
  });

  // Bingo Machine, Go!!!
  register('DL-bingo_machine_go', async (n, c, ctx) => {
    const s = S(n);
    const pool = choices(s.deck, 'deck').filter(e => isBlueEyes(C(e.id)));
    if (!pool.length) return false;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      window.memeCardMotion?.record('search', n, chosen.id);
      s.hand.push(s.deck.splice(chosen.index, 1)[0]);
      s.deck = shuffle(s.deck);
    });
  });

  // Sage with Eyes of Blue (Hiền Nhân Mắt Xanh)
  // Mode 1: Khi triệu hồi thường (on_summon) -> Lấy 1 quái Ánh Sáng Cấp 1 (Bạch Thạch Cổ Đại, Bạch Thạch Truyền Thuyết) từ Deck lên tay
  // Mode 2: Hiệu ứng từ tay (hand_action) -> Bỏ Sage từ tay và gửi 1 quái trên sân vào Mộ -> Gọi đặc biệt 1 Rồng Trắng từ Deck
  const handleSageBlue = async (n, c, ctx = {}) => {
    const s = S(n);
    const isSummon = Boolean(ctx.source || ctx.kind === 'normal');

    if (isSummon) {
      const pool = choices(s.deck, 'deck').filter(e => {
        const x = C(e.id);
        return x && x.card_type === 'Monster' && x.stars === 1 && (x.element === 'Quang' || x.element === 'Ánh Sáng' || x.element === 'Light') && x.id !== 'DL-sage_with_eyes_of_blue';
      });
      if (!pool.length) return false;
      const picked = await pick(n, 'Hiền Nhân Mắt Xanh: lấy 1 quái Ánh Sáng Cấp 1 lên tay', pool, { optional: true });
      if (!picked) return false;

      return fx(n, c, 'search', [], () => {
        if (s.deck[picked.index] === picked.id) {
          window.memeCardMotion?.record('search', n, picked.id);
          s.hand.push(s.deck.splice(picked.index, 1)[0]);
          s.deck = shuffle(s.deck);
          log(`✦ Hiền Nhân Mắt Xanh: lấy ${C(picked.id).name} lên tay.`);
        }
      });
    }

    // Hand effect:
    if (!s.hand.includes(c.id)) return false;
    const fieldMonsters = E(n).filter(e => !e.extra);
    if (!fieldMonsters.length) return false;
    const beCards = choices(s.deck, 'deck').filter(e => isBlueEyes(C(e.id)));
    if (!beCards.length) return false;

    const target = await pick(n, 'Hiền Nhân Mắt Xanh: chọn quái trên sân gửi vào Mộ', fieldMonsters);
    if (!target) return false;
    const be = await pick(n, 'Chọn Rồng Trắng từ Deck để triệu hồi', beCards);
    if (!be) return false;

    return fx(n, c, 'summon', [], () => {
      takeDiscard(n, { id: c.id });
      const targetSlotIndex = target.index;
      remove(n, target, 'cost');
      if (s.deck[be.index] === be.id) {
        const id = s.deck.splice(be.index, 1)[0];
        s.deck = shuffle(s.deck);
        const slot = monsterSlot(id, 'atk');
        uid(slot);
        const destIndex = free(n) >= 0 ? free(n) : targetSlotIndex;
        s.monsters[destIndex] = slot;
        log(`✦ Hiền Nhân Mắt Xanh gọi đặc biệt ${C(id).name} từ Deck.`);
        enqueue(() => postSummon(n, slot));
      }
    });
  };
  register('DL-sage_with_eyes_of_blue', handleSageBlue);
  register('dl_sage_blue', handleSageBlue);

  // The White Stone of Legend (Bạch Thạch Truyền Thuyết) - Sent to GY -> add Blue-Eyes White Dragon
  const handleStoneLegend = async (n, c, ctx) => {
    const s = S(n);
    const be = choices(s.deck, 'deck').find(e => e.id === 'AN-blue_eyes_white_dragon');
    if (!be) return false;
    return fx(n, c, 'search', [], () => {
      const idx = s.deck.indexOf('AN-blue_eyes_white_dragon');
      if (idx >= 0) {
        window.memeCardMotion?.record('search', n, 'AN-blue_eyes_white_dragon');
        s.hand.push(s.deck.splice(idx, 1)[0]);
        s.deck = shuffle(s.deck);
        log(`✦ Bạch Thạch Truyền Thuyết lấy Rồng Trắng Mắt Xanh lên tay.`);
      }
    });
  };
  register('DL-the_white_stone_of_legend', handleStoneLegend);
  register('dl_stone_legend', handleStoneLegend);

  // The White Stone of Ancients (Bạch Thạch Cổ Đại) - Banish from grave -> add Blue-Eyes from grave to hand
  const handleStoneAncients = async (n, c, ctx) => {
    const s = S(n);
    const beGrave = choices(s.grave, 'grave').filter(e => isBlueEyes(C(e.id)));
    if (!beGrave.length) return false;
    const picked = await pick(n, 'Bạch Thạch Cổ Đại: lấy 1 Rồng Trắng từ Mộ về tay', beGrave);
    if (!picked) return false;
    return fx(n, c, 'search', [], () => {
      const stoneIdx = s.grave.indexOf('DL-the_white_stone_of_ancients');
      if (stoneIdx >= 0) s.banished.push(s.grave.splice(stoneIdx, 1)[0]);
      const graveIdx = s.grave.indexOf(picked.id);
      if (graveIdx >= 0) {
        s.hand.push(s.grave.splice(graveIdx, 1)[0]);
        log(`✦ Bạch Thạch Cổ Đại thu hồi ${C(picked.id).name} từ Mộ.`);
      }
    });
  };
  register('DL-the_white_stone_of_ancients', handleStoneAncients);
  register('dl_stone_ancients', handleStoneAncients);

  // ─────────────────────────────────────────────────────────────
  // 2. YUGI HANDLERS
  // ─────────────────────────────────────────────────────────────
  // Dark Magical Circle
  register('DL-dark_magical_circle', async (n, c, ctx) => {
    const s = S(n);
    const top3 = s.deck.slice(0, 3).map((id, index) => ({ id, index, zone: 'deck' }));
    const dmCards = top3.filter(e => isDarkMagician(C(e.id)) || ['DL-magicians_rod', 'DL-dark_magical_circle', 'DL-magician_navigation', 'DL-eternal_soul', 'AN-dark_magic_attack'].includes(e.id));
    const picked = dmCards.length ? await pick(n, 'Ma Pháp Trận Đen: lấy 1 lá lên tay', dmCards, { optional: true }) : null;

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      if (picked) {
        const idx = s.deck.indexOf(picked.id);
        if (idx >= 0) {
          window.memeCardMotion?.record('search', n, picked.id);
          s.hand.push(s.deck.splice(idx, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
    });
  });

  // Magician Navigation
  register('DL-magician_navigation', async (n, c, ctx) => {
    const s = S(n);
    if (free(n) < 0) return false;
    const dmInHand = choices(s.hand, 'hand').filter(e => e.id === 'AN-dark_magician');
    if (!dmInHand.length) return false;
    const dmPick = await pick(n, 'Điều Hướng: chọn Phù Thủy Áo Đen từ tay để gọi', dmInHand);
    if (!dmPick) return false;
    const deckSpellcasters = choices(s.deck, 'deck').filter(e => {
      const x = C(e.id);
      return x?.tribe === 'Pháp Sư' && x.element === 'Ám' && x.stars <= 7;
    });
    const second = deckSpellcasters.length && free(n) >= 1 ? await pick(n, 'Điều Hướng: chọn Pháp Sư từ Deck để gọi tiếp', deckSpellcasters, { optional: true }) : null;

    return fx(n, c, 'summon', [], () => {
      clearSpell(n, ctx.fromSet?.index ?? s.spells.indexOf(ctx.source));
      // Summon DM
      const dmId = s.hand.splice(dmPick.index, 1)[0];
      const slot1 = monsterSlot(dmId, 'atk');
      uid(slot1);
      s.monsters[free(n)] = slot1;
      enqueue(() => postSummon(n, slot1));

      // Summon second
      if (second && free(n) >= 0) {
        const idx = s.deck.indexOf(second.id);
        if (idx >= 0) {
          const id2 = s.deck.splice(idx, 1)[0];
          s.deck = shuffle(s.deck);
          const slot2 = monsterSlot(id2, 'atk');
          uid(slot2);
          s.monsters[free(n)] = slot2;
          enqueue(() => postSummon(n, slot2));
        }
      }
    });
  });

  // Eternal Soul
  register('DL-eternal_soul', async (n, c, ctx) => {
    const s = S(n);
    const options = [
      { id: 'AN-dark_magician', mode: 'revive', label: 'Gọi Phù Thủy Áo Đen từ tay hoặc Mộ' },
      { id: 'AN-dark_magic_attack', mode: 'search', label: 'Tìm Ma Thuật Hắc Ám từ Deck' }
    ];
    const mode = await pick(n, 'Linh Hồn Bất Tử: chọn hiệu ứng', options);
    if (!mode) return false;

    if (mode.mode === 'revive') {
      const pool = [
        ...choices(s.hand, 'hand').filter(e => e.id === 'AN-dark_magician').map(e => ({ ...e, zone: 'hand' })),
        ...choices(s.grave, 'grave').filter(e => e.id === 'AN-dark_magician').map(e => ({ ...e, zone: 'grave' }))
      ];
      if (!pool.length || free(n) < 0) return false;
      const target = await pick(n, 'Chọn Phù Thủy Áo Đen để gọi', pool);
      if (!target) return false;

      return fx(n, c, 'revive', [], () => {
        if (target.zone === 'hand') {
          s.hand.splice(target.index, 1);
          const slot = monsterSlot('AN-dark_magician', 'atk');
          uid(slot);
          s.monsters[free(n)] = slot;
          enqueue(() => postSummon(n, slot));
        } else {
          const slot = revive(n, n, 'AN-dark_magician', 'atk');
          if (slot) enqueue(() => postSummon(n, slot));
        }
      });
    } else {
      const dma = choices(s.deck, 'deck').find(e => e.id === 'AN-dark_magic_attack');
      if (!dma) return false;
      return fx(n, c, 'search', [], () => {
        const idx = s.deck.indexOf('AN-dark_magic_attack');
        if (idx >= 0) {
          window.memeCardMotion?.record('search', n, 'AN-dark_magic_attack');
          s.hand.push(s.deck.splice(idx, 1)[0]);
          s.deck = shuffle(s.deck);
        }
      });
    }
  });

  // The Eye of Timaeus
  register('DL-the_eye_of_timaeus', async (n, c, ctx) => {
    const s = S(n);
    const dmOnField = E(n).filter(e => face(e.slot) && isDarkMagician(C(e.slot.id)));
    if (!dmOnField.length) return false;
    const target = await pick(n, 'Con Mắt Timaeus: chọn Phù Thủy Áo Đen trên sân', dmOnField);
    if (!target) return false;
    const fusions = choices(s.extraDeck, 'extra').filter(e => ['DL-dark_cavalry', 'AN-dark_paladin'].includes(e.id));
    if (!fusions.length) return false;
    const fusionChoice = await pick(n, 'Chọn quái Dung Hợp để gọi', fusions);
    if (!fusionChoice) return false;

    return fx(n, c, 'fusion', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      remove(n, target, 'material');
      s.extraDeck.splice(fusionChoice.index, 1);
      const slot = { ...monsterSlot(fusionChoice.id, 'atk'), fusionSummoned: true };
      uid(slot);
      if (!summonExtra(n, slot, fusionChoice.id)) return;
      enqueue(() => postSummon(n, slot));
    });
  });

  // Illusion Magic - tribute a Spellcaster, add up to 2 Dark Magician from Deck and/or GY
  register('DL-illusion_magic', async (n, c, ctx) => {
    const s = S(n);
    const spellcasters = E(n).filter(e => face(e.slot) && C(e.slot.id)?.tribe === 'Pháp Sư');
    if (!spellcasters.length) return false;
    const tribute = await pick(n, 'Ảo Ảnh Ma Pháp: hiến tế 1 Pháp Sư', spellcasters);
    if (!tribute) return false;
    const options = [...choices(s.deck, 'deck'), ...choices(s.grave, 'grave')].filter(e => e.id === 'AN-dark_magician');
    if (!options.length) return false;
    const picked = await pickMany(n, 'Ảo Ảnh Ma Pháp: lấy tối đa 2 Phù Thủy Áo Đen', options, {
      min: 1, max: Math.min(2, options.length), text: 'Chọn Phù Thủy Áo Đen từ Bộ bài và/hoặc Mộ.'
    });
    if (!picked || !picked.length) return false;

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      remove(n, tribute, 'tribute');
      for (const p of picked) {
        const pool = p.zone === 'deck' ? s.deck : s.grave;
        const idx = pool.indexOf(p.id);
        if (idx < 0) continue;
        window.memeCardMotion?.record(p.zone === 'deck' ? 'search' : 'recover', n, p.id);
        s.hand.push(pool.splice(idx, 1)[0]);
      }
      s.deck = shuffle(s.deck);
    });
  });

  // Magician's Rod (Trượng Ma Thuật) - On Normal Summon: Search Dark Magician Spell/Trap
  const handleMagiciansRod = async (n, c, ctx) => {
    const s = S(n);
    const targets = choices(s.deck, 'deck').filter(e => {
      return ['DL-dark_magical_circle', 'DL-magician_navigation', 'DL-eternal_soul', 'DL-illusion_magic', 'DL-the_eye_of_timaeus', 'AN-dark_magic_attack'].includes(e.id);
    });
    if (!targets.length) return false;
    const picked = await pick(n, 'Trượng Ma Thuật: lấy 1 Phép/Bẫy Phù Thủy Áo Đen lên tay', targets, { optional: true });
    if (!picked) return false;
    return fx(n, c, 'search', [], () => {
      if (s.deck[picked.index] === picked.id) {
        window.memeCardMotion?.record('search', n, picked.id);
        s.hand.push(s.deck.splice(picked.index, 1)[0]);
        s.deck = shuffle(s.deck);
        log(`✦ Trượng Ma Thuật lấy ${C(picked.id).name} lên tay.`);
      }
    });
  };
  register('DL-magicians_rod', handleMagiciansRod);
  register('dl_magicians_rod', handleMagiciansRod);

  // ─────────────────────────────────────────────────────────────
  // 3. JOEY HANDLERS
  // ─────────────────────────────────────────────────────────────
  // Red-Eyes Fusion - Fusion Summon from Hand, Field or DECK with material choice!
  register('DL-red_eyes_fusion', async (n, c, ctx) => {
    const s = S(n);
    const fusions = choices(s.extraDeck, 'extra').filter(e => ['DL-red_eyes_slash_dragon', 'AN-black_skull_dragon'].includes(e.id));
    if (!fusions.length || !extraOpen(n)) return false;
    const fusionTarget = await pick(n, 'Dung Hợp Mắt Đỏ: chọn quái Extra', fusions);
    if (!fusionTarget) return false;

    // Red-Eyes materials pool (Deck, Hand, Field)
    const isSlash = fusionTarget.id === 'DL-red_eyes_slash_dragon';
    let rePool = [
      ...choices(s.deck, 'deck').filter(e => e.id === 'AN-red_eyes_black_dragon'),
      ...choices(s.hand, 'hand').filter(e => e.id === 'AN-red_eyes_black_dragon' && e.index !== ctx.handIndex),
      ...E(n).filter(e => face(e.slot) && e.slot.id === 'AN-red_eyes_black_dragon').map(e => ({ ...e, zone: 'field' }))
    ];
    if (!rePool.length) {
      rePool = [
        ...choices(s.deck, 'deck').filter(e => isRedEyes(C(e.id))),
        ...choices(s.hand, 'hand').filter(e => isRedEyes(C(e.id)) && e.index !== ctx.handIndex),
        ...E(n).filter(e => face(e.slot) && isRedEyes(C(e.slot.id))).map(e => ({ ...e, zone: 'field' }))
      ];
    }
    if (!rePool.length) {
      log('Không có quái Mắt Đỏ nào trên Tay, Sân hoặc trong Bộ bài.');
      return false;
    }
    const reCard = await pick(n, 'Dung Hợp Mắt Đỏ: chọn quái Mắt Đỏ làm nguyên liệu', rePool);
    if (!reCard) return false;

    // Second material pool (Warrior or Summoned Skull)
    const secondPool = isSlash ? [
      ...choices(s.deck, 'deck').filter(e => C(e.id)?.tribe === 'Chiến Binh' && !isSameEntry(e, reCard)),
      ...choices(s.hand, 'hand').filter(e => C(e.id)?.tribe === 'Chiến Binh' && e.index !== ctx.handIndex && !isSameEntry(e, reCard)),
      ...E(n).filter(e => face(e.slot) && C(e.slot.id)?.tribe === 'Chiến Binh' && !isSameEntry(e, reCard)).map(e => ({ ...e, zone: 'field' }))
    ] : [
      ...choices(s.deck, 'deck').filter(e => e.id === 'AN-summoned_skull' && !isSameEntry(e, reCard)),
      ...choices(s.hand, 'hand').filter(e => e.id === 'AN-summoned_skull' && e.index !== ctx.handIndex && !isSameEntry(e, reCard)),
      ...E(n).filter(e => face(e.slot) && e.slot.id === 'AN-summoned_skull' && !isSameEntry(e, reCard)).map(e => ({ ...e, zone: 'field' }))
    ];

    if (!secondPool.length) {
      log(isSlash ? 'Không có quái Chiến Binh nào trên Tay, Sân hoặc Bộ bài.' : 'Không có Quỷ Triệu Hồi trên Tay, Sân hoặc Bộ bài.');
      return false;
    }
    const secondCard = await pick(n, isSlash ? 'Dung Hợp Mắt Đỏ: chọn quái Chiến Binh làm nguyên liệu' : 'Dung Hợp Mắt Đỏ: chọn Quỷ Triệu Hồi làm nguyên liệu', secondPool);
    if (!secondCard) return false;
    if (!extraOpen(n) && ![reCard, secondCard].some(m => m.zone === 'field')) {
      log('Không còn ô trống cho quái Dung Hợp.');
      return false;
    }

    return fx(n, c, 'fusion', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      // Send both materials
      for (const m of [reCard, secondCard]) {
        if (m.zone === 'field') {
          remove(n, m, 'material');
        } else {
          const pool = m.zone === 'deck' ? s.deck : s.hand;
          const idx = pool.indexOf(m.id);
          if (idx >= 0) s.grave.push(pool.splice(idx, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
      s.extraDeck.splice(fusionTarget.index, 1);
      const slot = { ...monsterSlot(fusionTarget.id, 'atk'), fusionSummoned: true };
      uid(slot);
      if (!summonExtra(n, slot, fusionTarget.id)) return;
      enqueue(() => postSummon(n, slot));
      log(`🌀 Dung Hợp Mắt Đỏ gọi ${C(fusionTarget.id).name} từ Bộ bài phụ!`);
    });
  });

  // Red-Eyes Insight
  register('DL-red_eyes_insight', async (n, c, ctx) => {
    const s = S(n);
    const reMonsters = [
      ...choices(s.hand, 'hand').filter(e => e.index !== ctx.handIndex && isRedEyes(C(e.id))),
      ...choices(s.deck, 'deck').filter(e => isRedEyes(C(e.id)))
    ];
    if (!reMonsters.length) return false;
    const cost = await pick(n, 'Thấu Thị Mắt Đỏ: gửi 1 quái Mắt Đỏ vào Mộ', reMonsters, { cheap: true });
    if (!cost) return false;
    const reSpells = choices(s.deck, 'deck').filter(e => isRedEyes(C(e.id)) && ['Spell', 'Trap'].includes(C(e.id)?.card_type));
    if (!reSpells.length) return false;
    const target = await pick(n, 'Chọn Phép/Bẫy Mắt Đỏ từ Deck', reSpells);
    if (!target) return false;

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      // Discard cost
      const pool = cost.zone === 'deck' ? s.deck : s.hand;
      const cIdx = pool.indexOf(cost.id);
      if (cIdx >= 0) s.grave.push(pool.splice(cIdx, 1)[0]);
      // Search
      const tIdx = s.deck.indexOf(target.id);
      if (tIdx >= 0) {
        window.memeCardMotion?.record('search', n, target.id);
        s.hand.push(s.deck.splice(tIdx, 1)[0]);
      }
      s.deck = shuffle(s.deck);
    });
  });

  // Red-Eyes Spirit
  register('DL-red_eyes_spirit', async (n, c, ctx) => {
    const s = S(n);
    if (free(n) < 0) return false;
    const targets = choices(s.grave, 'grave').filter(e => isRedEyes(C(e.id)));
    if (!targets.length) return false;
    const t = await pick(n, 'Linh Hồn Mắt Đỏ: chọn quái hồi sinh', targets);
    if (!t) return false;

    return fx(n, c, 'revive', [], () => {
      clearSpell(n, ctx.fromSet?.index ?? s.spells.indexOf(ctx.source));
      const slot = revive(n, n, t.id, 'atk');
      if (slot) enqueue(() => postSummon(n, slot));
    });
  });

  // Return of the Red-Eyes
  register('DL-return_of_the_red_eyes', async (n, c, ctx) => {
    const s = S(n);
    if (free(n) < 0) return false;
    const targets = choices(s.grave, 'grave').filter(e => e.id === 'AN-red_eyes_black_dragon');
    if (!targets.length) return false;
    const t = await pick(n, 'Sự Trở Lại: hồi sinh Rồng Đen Mắt Đỏ', targets);
    if (!t) return false;

    return fx(n, c, 'revive', [], () => {
      const slot = revive(n, n, t.id, 'def');
      if (slot) enqueue(() => postSummon(n, slot));
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Red-Eyes Fang with Chain (Nanh Xích Mắt Đỏ) Full Implementation
  // ─────────────────────────────────────────────────────────────
  async function handleFangWithChain(n, index) {
    const s = S(n);
    const slot = s.spells[index];
    if (!slot || !slot.faceDown) return false;
    const reList = targetList(n, (slot, c) => face(slot) && isRedEyes(c));
    if (!reList.length) {
      log('Cần có quái Mắt Đỏ trên sân để trang bị Nanh Xích Mắt Đỏ.');
      return false;
    }
    const target = await pick(n, 'Nanh Xích Mắt Đỏ: chọn quái Mắt Đỏ để trang bị', reList);
    if (!target) return false;

    const c = card('DL-red_eyes_fang_with_chain');
    return fx(n, c, 'trap', [target], () => {
      slot.faceDown = false;
      slot.equippedTo = target.slot.uid;
      slot.equipTargetName = C(target.slot.id).name;
      target.slot.tempAtk = (target.slot.tempAtk || 0) + 500;
      target.slot.tempDef = (target.slot.tempDef || 0) + 500;
      target.slot.double_attack = true;
      target.slot.maxAttacks = 2;
      target.slot.equippedCards = target.slot.equippedCards || [];
      target.slot.equippedCards.push('DL-red_eyes_fang_with_chain');
      log(`✦ Nanh Xích Mắt Đỏ trang bị cho ${C(target.slot.id).name} (+500 ATK/DEF, tấn công 2 quái mỗi lượt)!`);
    });
  }

  async function handleFangSteal(n, index) {
    const s = S(n);
    const slot = s.spells[index];
    if (!slot || slot.faceDown) return false;
    const foe = other(n);
    const foeMonsters = targetList(foe, (slot, c) => face(slot) && (c.monster_category === 'Hiệu Ứng' || !c.normal));
    if (!foeMonsters.length) {
      log('Đối thủ không có quái thú hiệu ứng ngửa trên sân để cướp.');
      return false;
    }
    const target = await pick(n, 'Nanh Xích Mắt Đỏ: chọn 1 quái hiệu ứng của đối thủ để cướp', foeMonsters);
    if (!target) return false;

    let reMonster = E(n).find(e => e.slot.uid === slot.equippedTo);
    if (!reMonster) reMonster = E(n).find(e => face(e.slot) && isRedEyes(C(e.slot.id)));
    if (!reMonster) {
      log('Không tìm thấy quái Mắt Đỏ tương ứng trên sân.');
      return false;
    }

    const c = card('DL-red_eyes_fang_with_chain');
    return fx(n, c, 'equip', [target], () => {
      clearSpell(n, index);

      const stolenCard = C(target.id);
      const stolenAtk = stolenCard?.atk || 0;
      const stolenDef = stolenCard?.def || 0;
      remove(foe, target, 'effect');

      reMonster.slot.tempAtk = (reMonster.slot.tempAtk || 0) + stolenAtk;
      reMonster.slot.tempDef = (reMonster.slot.tempDef || 0) + stolenDef;
      log(`✦ Nanh Xích Mắt Đỏ gửi xuống Mộ, cướp ${stolenCard?.name || 'quái đối thủ'} (ATK +${stolenAtk}, DEF +${stolenDef}) trang bị cho ${C(reMonster.slot.id).name}!`);
    });
  }

  register('DL-red_eyes_fang_with_chain', async (n, c, ctx) => {
    if (ctx.fromSet) {
      return handleFangWithChain(n, ctx.fromSet.index);
    }
    return false;
  });

  // Black Metal Dragon (Rồng Đen Thép Mắt Đỏ) - Sent to GY -> Search Red-Eyes card
  const handleBlackMetalGY = async (n) => {
    const s = S(n);
    const targets = choices(s.deck, 'deck').filter(e => isRedEyes(C(e.id)));
    if (!targets.length) return false;
    const picked = await pick(n, 'Rồng Đen Thép Mắt Đỏ: lấy 1 lá Mắt Đỏ từ Bộ bài lên tay', targets, { optional: true });
    if (!picked) return false;
    return fx(n, card('DL-black_metal_dragon'), 'search', [], () => {
      const idx = s.deck.indexOf(picked.id);
      if (idx >= 0) {
        window.memeCardMotion?.record('search', n, picked.id);
        s.hand.push(s.deck.splice(idx, 1)[0]);
        s.deck = shuffle(s.deck);
        log(`✦ Rồng Đen Thép Mắt Đỏ lấy ${C(picked.id).name} lên tay.`);
      }
    });
  };
  register('DL-black_metal_dragon', async (n, c, ctx) => {
    if (ctx && (ctx.fromGY || ctx.sentToGrave)) return handleBlackMetalGY(n);
    log('Rồng Đen Thép Mắt Đỏ chỉ lấy bài từ Bộ bài khi được gửi xuống Mộ.');
    return false;
  });
  register('dl_black_metal', async (n, c, ctx) => {
    if (ctx && (ctx.fromGY || ctx.sentToGrave)) return handleBlackMetalGY(n);
    return false;
  });

  // Equip Black Metal Dragon to Red-Eyes monster on field
  async function equipBlackMetal(n, sel) {
    const s = S(n);
    const reList = targetList(n, (slot, c) => face(slot) && isRedEyes(c));
    if (!reList.length) return false;
    const target = await pick(n, 'Hắc Kim Long: chọn quái Red-Eyes để trang bị', reList);
    if (!target) return false;
    const c = card('DL-black_metal_dragon');
    return fx(n, c, 'equip', [target], () => {
      if (sel.type === 'hand') {
        const idx = s.hand.indexOf('DL-black_metal_dragon');
        if (idx >= 0) s.hand.splice(idx, 1);
      } else if (sel.type === 'monster') {
        s.monsters[sel.index] = null;
      }
      target.slot.tempAtk = (target.slot.tempAtk || 0) + 600;
      target.slot.blackMetalEquipped = true;
      log(`✦ Hắc Kim Long trang bị cho ${C(target.slot.id).name} (+600 ATK).`);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 4. PEGASUS HANDLERS
  // ─────────────────────────────────────────────────────────────
  // Toon Kingdom
  register('DL-toon_kingdom', async (n, c, ctx) => {
    const s = S(n);
    return fx(n, c, 'spell', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      // Banish top 3 cards face down
      for (let i = 0; i < 3 && s.deck.length; i++) {
        s.banished.push(s.deck.shift());
      }
    });
  });

  // Toon Bookmark
  register('DL-toon_bookmark', async (n, c, ctx) => {
    const s = S(n);
    const pool = choices(s.deck, 'deck').filter(e => ['AN-toon_world', 'DL-toon_kingdom', 'DL-toon_table_of_contents', 'DL-toon_bookmark', 'DL-toon_page_flipper', 'DL-toon_terror'].includes(e.id) || isToon(C(e.id)));
    if (!pool.length) return false;
    const t = await pick(n, 'Đánh Dấu Trang Hoạt Hình: chọn bài Toon từ Deck', pool);
    if (!t) return false;

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      const idx = s.deck.indexOf(t.id);
      if (idx >= 0) {
        window.memeCardMotion?.record('search', n, t.id);
        s.hand.push(s.deck.splice(idx, 1)[0]);
        s.deck = shuffle(s.deck);
      }
    });
  });

  // Toon Table of Contents
  register('DL-toon_table_of_contents', async (n, c, ctx) => {
    const s = S(n);
    const pool = choices(s.deck, 'deck').filter(e => isToon(C(e.id)) || e.id.includes('toon'));
    if (!pool.length) return false;
    const t = await pick(n, 'Mục Lục Hoạt Hình: chọn 1 lá Toon từ Deck', pool);
    if (!t) return false;

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      const idx = s.deck.indexOf(t.id);
      if (idx >= 0) {
        window.memeCardMotion?.record('search', n, t.id);
        s.hand.push(s.deck.splice(idx, 1)[0]);
        s.deck = shuffle(s.deck);
      }
    });
  });

  // Toon Page-Flipper - reveal 3 differently named Toon monsters, opponent randomly picks 1 to Special Summon
  register('DL-toon_page_flipper', async (n, c, ctx) => {
    const s = S(n);
    if (!spellList(n).some(e => !e.slot.faceDown && ['AN-toon_world', 'DL-toon_kingdom'].includes(C(e.id)?.id))) {
      log('Cần Thế Giới Hoạt Hình đang ngửa trên sân để dùng Lật Trang Hoạt Hình.');
      return false;
    }
    if (free(n) < 0) return false;
    const seen = new Set();
    const pool = [];
    for (const e of choices(s.deck, 'deck')) {
      const x = C(e.id);
      const key = x?.name_en || e.id;
      if (!x || x.card_type !== 'Monster' || !isToon(x) || seen.has(key)) continue;
      seen.add(key);
      pool.push(e);
    }
    if (pool.length < 3) {
      log('Cần ít nhất 3 quái Hoạt Hình khác tên trong Bộ bài.');
      return false;
    }
    const revealed = shuffle(pool).slice(0, 3);
    const chosen = revealed[Math.floor(Math.random() * 3)];

    return fx(n, c, 'summon', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      for (const i of revealed.map(e => e.index).sort((a, b) => b - a)) s.deck.splice(i, 1);
      for (const e of revealed) if (e !== chosen) s.deck.push(e.id);
      s.deck = shuffle(s.deck);
      const slot = { ...monsterSlot(chosen.id), specialSummoned: true };
      uid(slot);
      s.monsters[free(n)] = slot;
      enqueue(() => postSummon(n, slot, 'special'));
      log(`📑 Lật Trang Hoạt Hình: đối thủ chọn ${C(chosen.id).name} — triệu hồi đặc biệt!`);
    });
  });

  // Relinquished Fusion - materials from hand, field or GY (GY materials are banished)
  register('DL-relinquished_fusion', async (n, c, ctx) => {
    const s = S(n);
    const fusions = choices(s.extraDeck, 'extra').filter(e => ['DL-millennium_eyes_restrict', 'AN-thousand_eyes_restrict'].includes(e.id));
    if (!fusions.length || !extraOpen(n)) return false;
    const target = await pick(n, 'Dung Hợp Quỷ Hy Sinh: chọn quái Extra', fusions);
    if (!target) return false;

    const requireIdol = target.id === 'AN-thousand_eyes_restrict';
    const otherOk = x => x?.card_type === 'Monster' && (requireIdol
      ? x.id === 'AN-thousand_eyes_idol'
      : x.id !== 'AN-relinquished' && x.monster_category !== 'Thường');
    const zones = [
      ...choices(s.hand, 'hand').filter(e => e.index !== ctx.handIndex),
      ...E(n).filter(e => face(e.slot)).map(e => ({ ...e, id: e.slot.id, zone: 'field' })),
      ...choices(s.grave, 'grave')
    ];
    const reliqPool = zones.filter(e => e.id === 'AN-relinquished');
    if (!reliqPool.length) return false;
    const reliq = await pick(n, 'Dung Hợp Quỷ Hy Sinh: chọn Quỷ Hy Sinh', reliqPool);
    if (!reliq) return false;
    const otherPool = zones.filter(e => !(e.zone === reliq.zone && e.index === reliq.index) && otherOk(C(e.id)));
    if (!otherPool.length) return false;
    const otherMat = await pick(n, requireIdol ? 'Dung Hợp Quỷ Hy Sinh: chọn Tượng Ngàn Mắt' : 'Dung Hợp Quỷ Hy Sinh: chọn Quái Hiệu Ứng', otherPool);
    if (!otherMat) return false;
    if (!extraOpen(n) && ![reliq, otherMat].some(m => m.zone === 'field')) {
      log('Không còn ô trống cho quái Dung Hợp.');
      return false;
    }

    return fx(n, c, 'fusion', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      for (const m of [reliq, otherMat]) {
        if (m.zone === 'field') { remove(n, m, 'material'); continue; }
        if (m.zone === 'grave') {
          const idx = s.grave.indexOf(m.id);
          if (idx >= 0) {
            s.banished.push(s.grave.splice(idx, 1)[0]);
            if (window.memeAnime?.onBanished) enqueue(() => window.memeAnime.onBanished(n, m.id));
          }
          continue;
        }
        const idx = s.hand.indexOf(m.id);
        if (idx >= 0) {
          const id = s.hand.splice(idx, 1)[0];
          s.grave.push(id);
          sentToGrave(n, id, true, 'material');
        }
      }
      const at = s.extraDeck.indexOf(target.id);
      if (at < 0) return;
      s.extraDeck.splice(at, 1);
      const slot = { ...monsterSlot(target.id, 'atk'), fusionSummoned: true };
      uid(slot);
      if (!summonExtra(n, slot, target.id)) return;
      enqueue(() => postSummon(n, slot));
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. JADEN HANDLERS
  // ─────────────────────────────────────────────────────────────
  // Neos Fusion - Special Summon any 2-material Fusion that lists Elemental HERO Neos
  const matReq = (req, id) => {
    const x = C(id);
    if (!x) return false;
    if (typeof req === 'string') return id === req;
    if (x.card_type !== 'Monster') return false;
    if (req.name && x.name_en !== req.name) return false;
    if (req.hero && !isHero(x)) return false;
    if (req.levelMax && (x.stars || 0) > req.levelMax) return false;
    if (req.effectMonster && x.monster_category === 'Thường') return false;
    return true;
  };
  const neosFusionTargets = s => choices(s.extraDeck, 'extra').filter(e => {
    const x = C(e.id);
    const mats = x?.card_type === 'Monster' && x.deck_zone === 'Extra' ? x.fusion_materials : null;
    if (!Array.isArray(mats) || mats.length !== 2) return false;
    return mats.some(m => typeof m === 'string' ? m === 'AN-elemental_hero_neos' : m.name === 'Elemental HERO Neos');
  });
  register('DL-neos_fusion', async (n, c, ctx) => {
    const s = S(n);
    const fusions = neosFusionTargets(s);
    if (!fusions.length) return false;
    const target = await pick(n, 'Dung Hợp Tân Vũ: chọn quái Dung Hợp ghi Tân Vũ', fusions);
    if (!target) return false;
    const tc = C(target.id), mats = tc.fusion_materials.slice();
    const neosIndex = mats.findIndex(m => typeof m === 'string' ? m === 'AN-elemental_hero_neos' : m.name === 'Elemental HERO Neos');
    const secondReq = mats[neosIndex === 0 ? 1 : 0];

    const pool = req => [
      ...choices(s.deck, 'deck').filter(e => matReq(req, e.id)),
      ...choices(s.hand, 'hand').filter(e => matReq(req, e.id) && e.index !== ctx.handIndex),
      ...E(n).filter(e => face(e.slot) && matReq(req, e.slot.id))
        .map(e => ({ ...e, id: e.slot.id, zone: 'field' }))
    ];
    const neosPool = pool('AN-elemental_hero_neos');
    if (!neosPool.length) {
      log('Không có Anh Hùng Nguyên Tố Tân Vũ trên Tay, Sân hoặc Bộ bài.');
      return false;
    }
    const neosCard = await pick(n, 'Dung Hợp Tân Vũ: chọn Tân Vũ Neos làm nguyên liệu', neosPool);
    if (!neosCard) return false;
    const secondPool = pool(secondReq).filter(e => neosCard.zone === 'field'
      ? !(e.zone === 'field' && e.slot === neosCard.slot)
      : !(e.zone === neosCard.zone && e.index === neosCard.index));
    if (!secondPool.length) {
      log('Không có nguyên liệu thứ hai hợp lệ cho quái Dung Hợp Tân Vũ này.');
      return false;
    }
    const secondCard = await pick(n, 'Dung Hợp Tân Vũ: chọn nguyên liệu còn lại', secondPool);
    if (!secondCard) return false;
    const chosen = [neosCard, secondCard];
    if (!extraOpen(n) && !chosen.some(m => m.zone === 'field')) return false;

    return fx(n, c, 'fusion', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      for (const m of chosen) {
        if (m.zone === 'field') {
          remove(n, m, 'material');
        } else {
          const src = m.zone === 'deck' ? s.deck : s.hand;
          const idx = src.indexOf(m.id);
          if (idx >= 0) s.grave.push(src.splice(idx, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
      s.extraDeck.splice(s.extraDeck.indexOf(target.id), 1);
      const slot = { ...monsterSlot(target.id, 'atk'), fusionSummoned: true };
      uid(slot);
      if (!summonExtra(n, slot, target.id)) return;
      s.noSpecialRound = duel.round;
      enqueue(() => postSummon(n, slot));
      log(`🌀 Dung Hợp Tân Vũ gọi ${tc.name} từ Bộ bài phụ!`);
    });
  });

  // A Hero Lives - Pay half LP, Special Summon level 4 Elemental HERO from Deck
  register('DL-a_hero_lives', async (n, c, ctx) => {
    const s = S(n);
    if (E(n).some(e => face(e.slot)) || free(n) < 0) return false;
    const heros = choices(s.deck, 'deck').filter(e => {
      const x = C(e.id);
      return /^Elemental HERO /.test(x?.name_en || '') && x.stars <= 4 && x.card_type === 'Monster' && !x.special_only;
    });
    if (!heros.length) return false;
    const target = await pick(n, 'Anh Hùng Tái Xuất: chọn HERO Cấp ≤ 4 từ Deck', heros);
    if (!target) return false;

    return fx(n, c, 'summon', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      s.lp = Math.floor(s.lp / 2);
      const idx = s.deck.indexOf(target.id);
      if (idx >= 0) {
        const id = s.deck.splice(idx, 1)[0];
        s.deck = shuffle(s.deck);
        const slot = monsterSlot(id, 'atk');
        uid(slot);
        s.monsters[free(n)] = slot;
        enqueue(() => postSummon(n, slot));
      }
    });
  });

  // Elemental HERO Solid Soldier (HERO Thiết Binh)
  // Mode 1: Khi triệu hồi thường -> Gọi đặc biệt 1 HERO Cấp <= 4 từ tay
  const handleSolidSoldier = async (n, c, ctx = {}) => {
    const s = S(n);
    if (ctx.kind === 'normal') {
      const heroHand = choices(s.hand, 'hand').filter(e => {
        const x = C(e.id);
        return isHero(x) && x?.stars <= 4 && x?.card_type === 'Monster' && e.id !== 'DL-elemental_hero_solid_soldier';
      });
      if (heroHand.length && free(n) >= 0) {
        const picked = await pick(n, 'HERO Thiết Binh: gọi đặc biệt 1 HERO Cấp ≤ 4 từ tay', heroHand, { optional: true });
        if (picked && free(n) >= 0) {
          return fx(n, c, 'summon', [], () => {
            const idx = s.hand.indexOf(picked.id);
            if (idx >= 0) {
              const mId = s.hand.splice(idx, 1)[0];
              const slot = monsterSlot(mId, 'atk');
              uid(slot);
              s.monsters[free(n)] = slot;
              enqueue(() => postSummon(n, slot));
              log(`✦ HERO Thiết Binh gọi đặc biệt ${C(mId).name} từ tay.`);
            }
          });
        }
      }
    }
    return false;
  };
  register('DL-elemental_hero_solid_soldier', handleSolidSoldier);
  register('dl_solid_soldier', handleSolidSoldier);

  // Solid Soldier GY Trigger: Khi bị gửi vào Mộ bởi hiệu ứng Phép -> Hồi sinh 1 HERO từ Mộ ở thế thủ
  const handleSolidSoldierGY = async (n, byEffect) => {
    const s = S(n);
    const heroGrave = choices(s.grave, 'grave').filter(e => {
      const x = C(e.id);
      return isHero(x) && x?.card_type === 'Monster' && e.id !== 'DL-elemental_hero_solid_soldier';
    });
    if (heroGrave.length && free(n) >= 0) {
      const picked = await pick(n, 'HERO Thiết Binh: hồi sinh 1 HERO từ Mộ ở thế thủ', heroGrave, { optional: true });
      if (picked && free(n) >= 0) {
        return fx(n, card('DL-elemental_hero_solid_soldier'), 'revive', [], () => {
          const slot = revive(n, n, picked.id, 'def');
          if (slot) enqueue(() => postSummon(n, slot));
          log(`✦ HERO Thiết Binh hồi sinh ${C(picked.id).name} từ Mộ ở thế thủ.`);
        });
      }
    }
  };

  // Elemental HERO Liquid Soldier (HERO Thủy Binh)
  // Mode 1: Khi triệu hồi thường -> Hồi sinh 1 HERO Cấp <= 4 từ Mộ
  const handleLiquidSoldier = async (n, c, ctx = {}) => {
    const s = S(n);
    if (ctx.kind === 'normal') {
      const heroGrave = choices(s.grave, 'grave').filter(e => {
        const x = C(e.id);
        return isHero(x) && x?.stars <= 4 && x?.card_type === 'Monster' && e.id !== 'DL-elemental_hero_liquid_soldier';
      });
      if (heroGrave.length && free(n) >= 0) {
        const picked = await pick(n, 'HERO Thủy Binh: hồi sinh 1 HERO Cấp ≤ 4 từ Mộ', heroGrave, { optional: true });
        if (picked && free(n) >= 0) {
          return fx(n, c, 'revive', [], () => {
            const slot = revive(n, n, picked.id, 'atk');
            if (slot) enqueue(() => postSummon(n, slot));
            log(`✦ HERO Thủy Binh hồi sinh ${C(picked.id).name} từ Mộ.`);
          });
        }
      }
    }
    return false;
  };
  register('DL-elemental_hero_liquid_soldier', handleLiquidSoldier);
  register('dl_liquid_soldier', handleLiquidSoldier);

  // Liquid Soldier Fusion Trigger: Dùng làm nguyên liệu Dung Hợp -> Rút 2 bỏ 1
  const handleLiquidSoldierFusionMat = async (n) => {
    const s = S(n);
    return fx(n, card('DL-elemental_hero_liquid_soldier'), 'draw', [], async () => {
      drawCards(n, 2);
      await window.memeCardMotion?.flush();
      if (s.hand.length) {
        const discardTarget = await pick(n, 'HERO Thủy Binh: bỏ 1 lá trên tay làm chi phí', choices(s.hand, 'hand'), { cheap: true });
        if (discardTarget) takeDiscard(n, discardTarget);
      }
      log(`✦ HERO Thủy Binh kích hoạt: Rút 2 lá và bỏ 1 lá.`);
    });
  };

  // Elemental HERO Sunrise - On Special Summon: add 1 "Miracle Fusion"
  register('DL-elemental_hero_sunrise', async (n, c, ctx = {}) => {
    const s = S(n), slot = ctx.source;
    if (!slot || slot.sunriseSearchRound === duel.round) return false;
    const pool = choices(s.deck, 'deck').filter(e => e.id === 'AN-miracle_fusion');
    if (!pool.length) return false;
    const t = await pick(n, 'Thái Dương: lấy 1 "Dung Hợp Kỳ Tích" từ Bộ bài', pool, { optional: true });
    if (!t) return false;
    return fx(n, c, 'search', [], () => {
      if (!E(n).some(e => e.slot === slot) || slot.sunriseSearchRound === duel.round) return;
      slot.sunriseSearchRound = duel.round;
      const i = s.deck.indexOf('AN-miracle_fusion');
      if (i < 0) return;
      window.memeCardMotion?.record('search', n, 'AN-miracle_fusion');
      s.hand.push(s.deck.splice(i, 1)[0]);
      s.deck = shuffle(s.deck);
      log('✦ Thái Dương lấy Dung Hợp Kỳ Tích lên tay.');
    });
  });

  // Elemental HERO Honest Neos - Quick Effect discard modes
  register('DL-elemental_hero_honest_neos', async (n, c, ctx = {}) => {
    const s = S(n), foe = other(n);
    const bump = (slot, amount) => {
      if (slot.mangaTempRound !== duel.round) slot.mangaTempAtk = 0;
      slot.mangaTempAtk = (slot.mangaTempAtk || 0) + amount;
      slot.mangaTempRound = duel.round;
    };
    if (ctx.fromHand) {
      if (s.honestDiscardRound === duel.round || !s.hand.includes(c.id)) return false;
      const targets = [
        ...targetList(n, (slot, x) => face(slot) && isHero(x)),
        ...targetList(foe, (slot, x) => face(slot) && isHero(x))
      ];
      if (!targets.length) return false;
      const t = await pick(n, 'Chân Thực Tân Vũ: chọn 1 quái HERO trên sân nhận +2500 ATK', targets);
      if (!t) return false;
      return fx(n, c, 'boost', [t], () => {
        const i = s.hand.indexOf(c.id);
        if (i < 0) return;
        s.honestDiscardRound = duel.round;
        takeDiscard(n, { id: c.id, index: i });
        bump(t.slot, 2500);
        log(`✦ Chân Thực Tân Vũ: ${C(t.id).name} tăng 2500 ATK đến hết lượt.`);
      });
    }
    const source = ctx.source;
    if (!source || !E(n).some(e => e.slot === source) || !face(source)) return false;
    if (s.honestFieldRound === duel.round) return false;
    const pool = choices(s.hand, 'hand').filter(e => C(e.id)?.card_type === 'Monster' && isHero(C(e.id)));
    if (!pool.length) return false;
    const cost = await pick(n, 'Chân Thực Tân Vũ: bỏ 1 quái HERO từ tay để tự tăng ATK', pool);
    if (!cost) return false;
    return fx(n, c, 'boost', [], () => {
      if (!E(n).some(e => e.slot === source)) return;
      const atk = C(cost.id)?.atk || 0;
      s.honestFieldRound = duel.round;
      takeDiscard(n, cost);
      bump(source, atk);
      log(`✦ Chân Thực Tân Vũ tăng ${atk} ATK đến hết lượt.`);
    });
  });

  // Form Change - swap a HERO Fusion for a same-Level Masked HERO
  register('DL-form_change', async (n, c, ctx) => {
    const s = S(n);
    const sources = targetList(n, (slot, x) => face(slot) && x?.monster_category === 'Dung Hợp' && isHero(x));
    const options = [];
    for (const src of sources) {
      const original = C(src.id);
      for (const t of choices(s.extraDeck, 'extra')) {
        const x = C(t.id);
        if (x?.summon_type !== 'transformation' || !/^Masked HERO /.test(x.name_en || '')) continue;
        if (x.stars !== original.stars || x.name_en === original.name_en) continue;
        options.push({ source: src, target: t });
      }
    }
    if (!options.length) return false;
    const source = await pick(n, 'Biến Đổi Hình Thái: chọn HERO Dung Hợp', [...new Set(options.map(o => o.source))]);
    if (!source) return false;
    const target = await pick(n, 'Biến Đổi Hình Thái: chọn Anh Hùng Mặt Nạ cùng Cấp', options.filter(o => o.source === source).map(o => o.target));
    if (!target) return false;
    const targetCard = C(target.id);
    let summoned = null;
    const done = await fx(n, c, 'fusion', [source], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      const entry = E(n).find(e => e.slot === source.slot);
      if (!entry || !s.extraDeck.includes(target.id)) return;
      if (entry.extra) s.extra = null;
      else s.monsters[entry.index] = null;
      s.extraDeck.push(source.id);
      s.extraDeck.splice(s.extraDeck.indexOf(target.id), 1);
      summoned = { ...monsterSlot(target.id), transformationSummoned: true, properlySummoned: true };
      uid(summoned);
      if (!placeOnField(n, summoned)) {
        s.extraDeck.push(target.id);
        summoned = null;
        log('Không còn ô trống cho quái Extra.');
        return;
      }
      log(`🔄 Biến Đổi Hình Thái: ${C(source.id).name} → ${targetCard.name}.`);
    }, { title: 'BIẾN ĐỔI HÌNH THÁI', text: targetCard.name, materials: [source.id] });
    if (done && summoned) await postSummon(n, summoned);
    return done;
  });

  // Favorite Hero - Equip to a Level 5+ Elemental HERO (stays in the Spell/Trap Zone)
  register('DL-favorite_hero', async (n, c, ctx) => {
    const s = S(n);
    const slotIndex = ctx.fromSet ? ctx.fromSet.index : s.spells.indexOf(null);
    if (slotIndex < 0) return false;
    const pool = targetList(n, (slot, x) => face(slot) && isHero(x) && (x.stars || 0) >= 5);
    if (!pool.length) return false;
    const t = await pick(n, 'Anh Hùng Tâm Đắc: chọn quái HERO Cấp 5 trở lên', pool);
    if (!t) return false;
    return fx(n, c, 'equip', [t], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      const gi = s.grave.lastIndexOf(c.id);
      if (gi < 0) return;
      s.grave.splice(gi, 1);
      t.slot.favoriteHero = true;
      s.spells[slotIndex] = {
        id: c.id,
        faceDown: false,
        equippedTo: uid(t.slot),
        setRound: duel.round,
        equipValue: 0
      };
      log(`⭐ Anh Hùng Tâm Đắc trang bị cho ${C(t.id).name}.`);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. ZANE HANDLERS
  // ─────────────────────────────────────────────────────────────
  // Cyber Emergency - Search Cyber Dragon monster
  register('DL-cyber_emergency', async (n, c, ctx) => {
    const s = S(n);
    const pool = choices(s.deck, 'deck').filter(e => isCyber(C(e.id)) && C(e.id)?.card_type === 'Monster');
    if (!pool.length) return false;
    const t = await pick(n, 'Khẩn Cấp Mạng Lưới: chọn quái Cyber từ Deck', pool);
    if (!t) return false;

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      const idx = s.deck.indexOf(t.id);
      if (idx >= 0) {
        window.memeCardMotion?.record('search', n, t.id);
        s.hand.push(s.deck.splice(idx, 1)[0]);
        s.deck = shuffle(s.deck);
      }
    });
  });

  // Cybernetic Fusion Support - pay half LP; Machine Fusion Materials may come from hand/field/GY and are banished
  register('DL-cybernetic_fusion_support', async (n, c, ctx) => {
    const s = S(n);
    if (s.cyberFusionSupportRound === duel.round) return false;
    if (s.lp < 2) return false;

    return fx(n, c, 'cost', [{ name: n, type: 'lp' }], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      s.lp = Math.max(1, Math.floor(s.lp / 2));
      s.cyberFusionSupportRound = duel.round;
      log('🔋 Tiếp Ứng Dung Hợp Rồng Máy: nguyên liệu Máy lấy từ Tay, Sân hoặc Mộ và bị trục xuất.');
    });
  });

  // Cyberload Fusion - Shuffle materials from Field/Banished into Deck
  register('DL-cyberload_fusion', async (n, c, ctx) => {
    const s = S(n);
    const listsCyberDragon = x => {
      const mats = Array.isArray(x?.fusion_materials) ? x.fusion_materials : [];
      return mats.includes('AN-cyber_dragon') || x?.flex_machine;
    };
    const fusions = choices(s.extraDeck, 'extra').filter(e => {
      const x = C(e.id);
      return x?.card_type === 'Monster' && isCyber(x) && listsCyberDragon(x);
    });
    if (!fusions.length || !extraOpen(n)) return false;
    const target = await pick(n, 'Dung Hợp Nạp Mạng: chọn quái Extra', fusions);
    if (!target) return false;

    const tc = C(target.id);
    const mats = Array.isArray(tc?.fusion_materials) ? tc.fusion_materials : [];
    const isCD = e => e.id === 'AN-cyber_dragon' || (e.zone === 'field' && e.id === 'AN-proto_cyber_dragon');
    const cdOnly = mats.length > 0 && mats.every(m => m === 'AN-cyber_dragon');
    const materials = [
      ...E(n).filter(e => face(e.slot) && (isCyber(C(e.slot.id)) || e.slot.id === 'AN-cyber_dragon')).map(e => ({ ...e, id: e.slot.id, zone: 'field' })),
      ...choices(s.banished, 'banished').filter(e => C(e.id)?.card_type === 'Monster' && (isCyber(C(e.id)) || e.id === 'AN-cyber_dragon')).map(e => ({ ...e, zone: 'banished' }))
    ];
    const pool = tc?.flex_machine
      ? materials.filter(e => C(e.id)?.tribe === 'Máy')
      : cdOnly ? materials.filter(isCD) : materials;
    const min = tc?.flex_machine ? 2 : Math.max(2, mats.length);
    const max = tc?.flex_machine ? Math.min(3, pool.length) : min;
    if (pool.length < min) return false;
    const picked = await pickMany(n, 'Dung Hợp Nạp Mạng: chọn nguyên liệu', pool, {
      min, max, text: `Chọn ${min === max ? min : `${min}–${max}`} nguyên liệu từ Sân hoặc đã bị trục xuất.`
    });
    if (!picked || !picked.length) return false;
    if (tc?.flex_machine && !picked.some(isCD)) return false;
    if (!extraOpen(n) && !picked.some(m => m.zone === 'field')) return false;

    return fx(n, c, 'fusion', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      for (const m of picked) {
        if (m.zone === 'field') {
          if (m.extra) s.extra = null; else s.monsters[m.index] = null;
          s.deck.push(m.id);
        }
        else {
          const idx = s.banished.indexOf(m.id);
          if (idx >= 0) s.deck.push(s.banished.splice(idx, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
      s.extraDeck.splice(target.index, 1);
      const slot = { ...monsterSlot(target.id, 'atk'), fusionSummoned: true };
      uid(slot);
      if (!summonExtra(n, slot, target.id)) return;
      enqueue(() => postSummon(n, slot));
    });
  });

  // Cybernetic Overflow - Banish Cyber Dragons to destroy cards
  register('DL-cybernetic_overflow', async (n, c, ctx) => {
    const s = S(n);
    const foe = other(n);
    const candidates = [
      ...choices(s.hand, 'hand').filter(e => isCyber(C(e.id)) && C(e.id).stars),
      ...E(n).filter(e => face(e.slot) && isCyber(C(e.slot.id))).map(e => ({ ...e, zone: 'field' })),
      ...choices(s.grave, 'grave').filter(e => isCyber(C(e.id)) && C(e.id).stars)
    ];
    if (!candidates.length) return false;
    const foeCards = [...targetList(foe), ...spellList(foe)];
    if (!foeCards.length) return false;

    const m = await pick(n, 'Tràn Mạng Cyber: chọn quái Cyber để trục xuất', candidates);
    if (!m) return false;
    const destroyTarget = await pick(n, 'Chọn lá bài đối thủ để phá hủy', foeCards);
    if (!destroyTarget) return false;

    return fx(n, c, 'destroy', [destroyTarget], () => {
      clearSpell(n, ctx.fromSet?.index ?? s.spells.indexOf(ctx.source));
      if (m.zone === 'field') remove(n, m, 'cost');
      else {
        const pool = m.zone === 'hand' ? s.hand : s.grave;
        const idx = pool.indexOf(m.id);
        if (idx >= 0) s.banished.push(pool.splice(idx, 1)[0]);
      }
      if (destroyTarget.type === 'spell' || destroyTarget.type === 'field') {
        clearSpell(foe, destroyTarget.index);
      } else {
        remove(foe, destroyTarget, 'effect');
      }
    });
  });

  // Evolution Burst - Destroy 1 opponent card if controlling Cyber Dragon
  register('DL-evolution_burst', async (n, c, ctx) => {
    const foe = other(n);
    const foeCards = [...targetList(foe), ...spellList(foe)];
    if (!foeCards.length) return false;
    const t = await pick(n, 'Tiến Hóa Bùng Nổ: chọn lá đối thủ để phá hủy', foeCards);
    if (!t) return false;

    return fx(n, c, 'destroy', [t], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      if (t.type === 'spell' || t.type === 'field') clearSpell(foe, t.index);
      else remove(foe, t, 'effect');
    });
  });

  // Cyber Dragon Core (Lõi Rồng Máy) - On Normal Summon: Search Cyber Spell/Trap
  const handleCyberCore = async (n, c, ctx) => {
    const s = S(n);
    const targets = choices(s.deck, 'deck').filter(e => {
      return ['DL-cyber_emergency', 'DL-cyber_repair_plant', 'DL-cyberload_fusion', 'DL-cybernetic_overflow', 'DL-cybernetic_fusion_support', 'DL-evolution_burst'].includes(e.id);
    });
    if (!targets.length) return false;
    const picked = await pick(n, 'Lõi Rồng Máy: lấy 1 Phép/Bẫy Cyber lên tay', targets, { optional: true });
    if (!picked) return false;
    return fx(n, c, 'search', [], () => {
      if (s.deck[picked.index] === picked.id) {
        window.memeCardMotion?.record('search', n, picked.id);
        s.hand.push(s.deck.splice(picked.index, 1)[0]);
        s.deck = shuffle(s.deck);
        log(`✦ Lõi Rồng Máy lấy ${C(picked.id).name} lên tay.`);
      }
    });
  };
  register('DL-cyber_dragon_core', handleCyberCore);
  register('dl_cyber_core', handleCyberCore);

  // Cyber Repair Plant (Nhà Máy Sửa Chữa Cyber)
  register('DL-cyber_repair_plant', async (n, c, ctx) => {
    const s = S(n);
    const hasCD = s.grave.some(id => id === 'AN-cyber_dragon' || id === 'DL-cyber_dragon_core' || id === 'AN-proto_cyber_dragon');
    if (!hasCD) return false;
    const targets = choices(s.deck, 'deck').filter(e => {
      const x = C(e.id);
      return x && x.tribe === 'Máy' && x.element === 'Quang';
    });
    if (!targets.length) return false;
    const picked = await pick(n, 'Nhà Máy Sửa Chữa: lấy 1 quái Máy Ánh Sáng lên tay', targets);
    if (!picked) return false;
    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      if (s.deck[picked.index] === picked.id) {
        window.memeCardMotion?.record('search', n, picked.id);
        s.hand.push(s.deck.splice(picked.index, 1)[0]);
        s.deck = shuffle(s.deck);
        log(`✦ Nhà Máy Sửa Chữa lấy ${C(picked.id).name} lên tay.`);
      }
    });
  });

  // Hook into memeAnime.resolveEffect and window.memeTcgEngine
  const originalResolveEffect = window.memeAnime.resolveEffect;
  window.memeAnime.resolveEffect = async function(n, c, ctx = {}) {
    if (c && handlers.has(c.id)) {
      return handlers.get(c.id)(n, c, ctx);
    }
    return originalResolveEffect(n, c, ctx);
  };

  if (window.memeTcgEngine) {
    const origHandles = window.memeTcgEngine.handles;
    const origResolve = window.memeTcgEngine.resolveEffect;
    window.memeTcgEngine.handles = function(id) {
      if (handlers.has(id)) return true;
      return origHandles ? origHandles(id) : false;
    };
    window.memeTcgEngine.resolveEffect = function(n, c, ctx) {
      if (c && handlers.has(c.id)) {
        return handlers.get(c.id)(n, c, ctx);
      }
      return origResolve ? origResolve(n, c, ctx) : false;
    };
  }

  // Hook into memeAnime.specialMode
  const originalSpecialMode = window.memeAnime.specialMode;
  window.memeAnime.specialMode = function(n, c) {
    if (!c) return null;
    const s = S(n);
    if (s.noSpecialRound === duel.round) return null;
    if (c.id === 'DL-blue_eyes_alternative_white_dragon') {
      if (s.hand.includes('AN-blue_eyes_white_dragon') && free(n) >= 0 && s.altSpecialRound !== duel.round) return 'free';
    }
    if (c.id === 'DL-apprentice_illusion_magician') {
      if (s.hand.length >= 2 && free(n) >= 0) return 'free';
    }
    if (c.id === 'DL-cyber_dragon_nachster') {
      if (s.hand.length >= 2 && free(n) >= 0) return 'free';
    }
    if (c.id === 'DL-toon_harpie_lady') {
      if (spellList(n).some(e => ['AN-toon_world', 'DL-toon_kingdom'].includes(C(e.id)?.id)) && free(n) >= 0) return 'free';
    }
    return originalSpecialMode(n, c);
  };

  // Hook into memeAnime.specialSummon
  const originalSpecialSummon = window.memeAnime.specialSummon;
  window.memeAnime.specialSummon = async function(n, index) {
    const s = S(n);
    const c = card(s.hand[index]);
    const mode = c && window.memeAnime.specialMode(n, c);
    if (mode === 'free') {
      if (free(n) < 0) return false;
      let cost = null;
      if (c.id === 'DL-apprentice_illusion_magician' || c.id === 'DL-cyber_dragon_nachster') {
        const pool = choices(s.hand, 'hand').filter(e => e.index !== index);
        cost = await pick(n, `${c.name}: bỏ 1 lá trên tay làm chi phí`, pool, { cheap: true });
        if (!cost) return false;
      }
      const success = await fx(n, c, 'summon', [], () => {
        if (cost) takeDiscard(n, cost);
        if (c.id === 'DL-blue_eyes_alternative_white_dragon') s.altSpecialRound = duel.round;
        s.hand.splice(s.hand.indexOf(c.id), 1);
        const slot = monsterSlot(c.id);
        uid(slot);
        s.monsters[free(n)] = slot;
        log(`✦ Gọi đặc biệt ${c.name}.`);
      });
      if (success) {
        const slot = E(n).find(e => e.slot.id === c.id)?.slot;
        if (slot) await postSummon(n, slot);
      }
      return success;
    }
    return originalSpecialSummon(n, index);
  };

  // Hook into trapProblem and activateTrap for all Duel Links traps
  const originalTrapProblem = window.memeAnime.trapProblem;
  function dlTrapProblem(index) {
    const slot = S('player').spells[index], c = card(slot?.id);
    if (!slot?.faceDown || c?.card_type !== 'Trap') return 'Chọn một Bẫy đang úp.';
    if (slot.setRound >= duel.round) return 'Bẫy vừa úp: phải chờ sang lượt sau.';
    if (allFields().some(e => face(e.slot) && has(e.slot, 'jinzo'))) return 'Jinzo đang vô hiệu Bẫy.';

    if (c.id === 'DL-red_eyes_fang_with_chain' || c.effect_code === 'dl_fang_with_chain') {
      const reList = targetList('player', (s, x) => face(s) && isRedEyes(x));
      if (!reList.length) return 'Cần có quái Mắt Đỏ ngửa trên sân để trang bị.';
      return '';
    }
    if (c.id === 'DL-red_eyes_spirit') {
      if (free('player') < 0) return 'Không còn ô quái trống.';
      if (!S('player').grave.some(id => isRedEyes(C(id)))) return 'Cần có quái Mắt Đỏ trong Mộ.';
      return '';
    }
    if (c.id === 'DL-return_of_the_red_eyes') {
      const hasRe = targetList('player', (s, x) => face(s) && isRedEyes(x)).length > 0;
      if (!hasRe) return 'Cần có quái Mắt Đỏ trên sân để kích hoạt Sự Trở Lại.';
      return '';
    }
    if (c.id === 'DL-magician_navigation') {
      if (free('player') < 0) return 'Không còn ô quái trống.';
      if (!S('player').hand.includes('AN-dark_magician')) return 'Cần có Phù Thủy Áo Đen trên tay.';
      return '';
    }
    if (c.id === 'DL-eternal_soul') {
      return '';
    }
    if (c.id === 'DL-cybernetic_overflow') {
      const foeTargets = [...targetList(other('player')), ...spellList(other('player'))];
      if (!foeTargets.length) return 'Đối thủ không có bài trên sân để phá hủy.';
      return '';
    }

    return originalTrapProblem ? originalTrapProblem(index) : 'Bẫy phản đòn: tự kích hoạt khi đúng điều kiện.';
  }
  window.memeAnime.trapProblem = dlTrapProblem;

  const originalActivateTrap = window.activateTrap;
  window.activateTrap = async function(index) {
    if (!canAct() || duel.mode) return;
    const slot = S('player').spells[index], c = card(slot?.id);
    if (!slot?.faceDown || c?.card_type !== 'Trap') return;
    const problem = dlTrapProblem(index);
    if (problem) {
      log(problem);
      render();
      return;
    }

    if (c.id === 'DL-red_eyes_fang_with_chain' || c.effect_code === 'dl_fang_with_chain') {
      return window.memeAnime.perform(() => handleFangWithChain('player', index));
    }
    if (handlers.has(c.id)) {
      return window.memeAnime.perform(async () => {
        slot.faceDown = false;
        const res = await handlers.get(c.id)('player', c, { fromSet: { index, slot }, source: slot });
        if (!res) slot.faceDown = true;
        render();
        return res;
      });
    }

    return originalActivateTrap ? originalActivateTrap(index) : false;
  };

  // Hook into renderInspector to surface action buttons for DL cards
  if (typeof renderInspector === 'function') {
    const originalRenderInspector = renderInspector;
    renderInspector = function() {
      originalRenderInspector();
      const sel = duel?.selected;
      if (!sel || sel.name !== 'player' || duel.mode) return;
      const s = S('player');
      const actions = $('inspectActions');
      if (!actions) return;

      // Hand cards inspection
      if (sel.type === 'hand') {
        const id = s.hand[sel.index];
        const c = card(id);
        if (!c) return;
        if (c.card_type === 'Monster' && window.memeAnime.specialMode('player', c)) {
          if (![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Triệu hồi đặc biệt'))) {
            addAction(actions, '✦ Triệu hồi đặc biệt', () => window.memeAnime.perform(() => window.memeAnime.specialSummon('player', sel.index)));
          }
        }
        if (c.id === 'DL-black_metal_dragon') {
          const reList = targetList('player', (slot, x) => face(slot) && isRedEyes(x));
          if (reList.length && ![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Trang bị (+600 ATK)'))) {
            addAction(actions, '✦ Trang bị (+600 ATK)', () => window.memeAnime.perform(() => equipBlackMetal('player', sel)));
          }
        }
      }

      // Monster on field inspection
      if (sel.type === 'monster') {
        const slot = s.monsters[sel.index];
        if (slot && face(slot) && slot.id === 'DL-black_metal_dragon') {
          const reList = targetList('player', (st, x) => face(st) && isRedEyes(x) && st !== slot);
          if (reList.length && ![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Trang bị (+600 ATK)'))) {
            addAction(actions, '✦ Trang bị (+600 ATK)', () => window.memeAnime.perform(() => equipBlackMetal('player', sel)));
          }
        }
      }

      // Spell / Trap backrow inspection
      if (sel.type === 'spell') {
        const slot = s.spells[sel.index];
        if (!slot) return;
        const c = card(slot.id);
        if (!c) return;

        // Set Traps
        if (slot.faceDown) {
          if (c.id === 'DL-red_eyes_fang_with_chain') {
            if (slot.setRound < duel.round) {
              if (![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Lật Bẫy Nanh Xích'))) {
                addAction(actions, '⛓ Lật Bẫy Nanh Xích', () => window.activateTrap(sel.index));
              }
            }
          }
        } else {
          // Face-up active traps
          if (c.id === 'DL-red_eyes_fang_with_chain') {
            const foeMonsters = targetList(other('player'), (st, x) => face(st) && (x.monster_category === 'Hiệu Ứng' || !x.normal));
            if (foeMonsters.length && ![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Cướp quái đối thủ'))) {
              addAction(actions, '⛓ Cướp quái đối thủ (Gửi xuống Mộ)', () => window.memeAnime.perform(() => handleFangSteal('player', sel.index)));
            }
          }
          if (c.id === 'DL-eternal_soul') {
            if (![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Linh Hồn Vĩnh Cửu'))) {
              addAction(actions, '🔮 Hiệu ứng Linh Hồn Vĩnh Cửu', () => window.memeAnime.perform(() => handlers.get('DL-eternal_soul')('player', c, { source: slot })));
            }
          }
          if (c.id === 'DL-return_of_the_red_eyes') {
            if (![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Sự Trở Lại'))) {
              addAction(actions, '🔮 Hiệu ứng Sự Trở Lại', () => window.memeAnime.perform(() => handlers.get('DL-return_of_the_red_eyes')('player', c, { source: slot })));
            }
          }
        }
      }
    };
  };

  // ─────────────────────────────────────────────────────────────
  // GY AUTO-RESOLUTION (abilities that work while the card is in the Graveyard)
  // ─────────────────────────────────────────────────────────────
  async function handleReturnRedEyesDestroyed(n) {
    const s = S(n);
    if (free(n) < 0) return false;
    const pool = choices(s.grave, 'grave').filter(e => e.id !== 'DL-return_of_the_red_eyes' && isRedEyes(C(e.id)) && C(e.id)?.card_type === 'Monster' && C(e.id)?.deck_zone !== 'Extra');
    if (!pool.length) return false;
    const target = pool.find(e => e.id === 'AN-red_eyes_black_dragon') || pool[0];
    return fx(n, card('DL-return_of_the_red_eyes'), 'revive', [], () => {
      const slot = revive(n, n, target.id, 'def');
      if (slot) enqueue(() => postSummon(n, slot));
      log(`✦ Sự Trở Lại Của Mắt Đỏ hồi sinh ${C(target.id).name} từ Mộ.`);
    });
  }

  async function autoWhiteStone(n) {
    const s = S(n);
    if (s.ancientsSentRound !== duel.round || !s.grave.includes('DL-the_white_stone_of_ancients')) return false;
    delete s.ancientsSentRound;
    const deckPool = choices(s.deck, 'deck').filter(e => isBlueEyes(C(e.id)) && C(e.id)?.card_type === 'Monster' && !C(e.id)?.special_only);
    if (deckPool.length && free(n) >= 0) {
      const target = deckPool.find(e => e.id === 'AN-blue_eyes_white_dragon') || deckPool[0];
      return fx(n, card('DL-the_white_stone_of_ancients'), 'summon', [], () => {
        const idx = s.deck.indexOf(target.id);
        if (idx < 0 || free(n) < 0) return;
        const summoned = s.deck.splice(idx, 1)[0];
        s.deck = shuffle(s.deck);
        const slot = monsterSlot(summoned, 'atk');
        uid(slot);
        s.monsters[free(n)] = slot;
        enqueue(() => postSummon(n, slot));
        log(`✦ Bạch Thạch Cổ Đại gọi đặc biệt ${C(summoned).name} từ Bộ bài vào cuối lượt.`);
      });
    }
    const gravePool = choices(s.grave, 'grave').filter(e => e.id !== 'DL-the_white_stone_of_ancients' && isBlueEyes(C(e.id)) && C(e.id)?.card_type === 'Monster' && C(e.id)?.deck_zone !== 'Extra');
    if (!gravePool.length) return false;
    const target = gravePool.find(e => e.id === 'AN-blue_eyes_white_dragon') || gravePool[0];
    return fx(n, card('DL-the_white_stone_of_ancients'), 'search', [], () => {
      const stone = s.grave.indexOf('DL-the_white_stone_of_ancients');
      if (stone >= 0) s.banished.push(s.grave.splice(stone, 1)[0]);
      const idx = s.grave.indexOf(target.id);
      if (idx >= 0) {
        window.memeCardMotion?.record('recover', n, target.id);
        s.hand.push(s.grave.splice(idx, 1)[0]);
        log(`✦ Bạch Thạch Cổ Đại trục xuất chính nó: lấy ${C(target.id).name} từ Mộ lên tay.`);
      }
    });
  }

  async function autoCyberDragonCore(n) {
    const s = S(n), foe = other(n);
    if (s.grave.indexOf('DL-cyber_dragon_core') < 0) return false;
    if (E(n).length || !E(foe).length || free(n) < 0) return false;
    const deckIndex = s.deck.findIndex(id => id === 'AN-cyber_dragon' || C(id)?.name_en === 'Cyber Dragon');
    if (deckIndex < 0) return false;
    return fx(n, card('DL-cyber_dragon_core'), 'summon', [], () => {
      const gi = s.grave.indexOf('DL-cyber_dragon_core');
      if (gi < 0) return;
      s.banished.push(s.grave.splice(gi, 1)[0]);
      const di = s.deck.findIndex(id => id === 'AN-cyber_dragon' || C(id)?.name_en === 'Cyber Dragon');
      if (di < 0 || free(n) < 0) return;
      const summoned = s.deck.splice(di, 1)[0];
      s.deck = shuffle(s.deck);
      const slot = monsterSlot(summoned, 'atk');
      uid(slot);
      s.monsters[free(n)] = slot;
      enqueue(() => postSummon(n, slot));
      log('✦ Lõi Rồng Máy trục xuất chính nó: gọi đặc biệt Rồng Máy từ Bộ bài.');
    });
  }

  // Toon Bookmark / Neos Fusion protect their cards by banishing themselves from the GY.
  window.memeAnime.registerGraveGuard((n, slot, reason) => {
    if (!['battle', 'effect'].includes(reason) || !slot) return false;
    const c = C(slot.id);
    if (!c || c.card_type !== 'Monster' || c.monster_category !== 'Dung Hợp' || !/Neos/i.test(c.name_en || '')) return false;
    const owner = slot.originalOwner || slot.homeOwner || n;
    const s = S(owner);
    const i = s.grave.indexOf('DL-neos_fusion');
    if (i < 0) return false;
    s.grave.splice(i, 1);
    s.banished.push('DL-neos_fusion');
    const msg = `Trục xuất khỏi Mộ để đỡ đòn bảo vệ [${c.name}] khỏi bị tiêu diệt bởi ${reason === 'battle' ? 'chiến đấu' : 'hiệu ứng'}!`;
    log(`🛡️ Dung Hợp Tân Vũ: ${msg}`);
    window.showEffectNotice?.({
      cardId: 'DL-neos_fusion',
      title: '🛡️ Hiệu ứng Mộ: Dung Hợp Tân Vũ',
      text: msg,
      owner,
      icon: '🛡️'
    });
    return true;
  });
  window.memeAnime.registerGraveGuard((n, slot, reason) => {
    if (!['battle', 'effect'].includes(reason) || !slot) return false;
    if (!['AN-toon_world', 'DL-toon_kingdom'].includes(slot.id)) return false;
    const owner = slot.originalOwner || n;
    const s = S(owner);
    const i = s.grave.indexOf('DL-toon_bookmark');
    if (i < 0) return false;
    s.grave.splice(i, 1);
    s.banished.push('DL-toon_bookmark');
    const msg = 'Trục xuất khỏi Mộ để bảo vệ Thế Giới/Vương Quốc Hoạt Hình khỏi bị phá hủy!';
    log(`🛡️ Đánh Dấu Trang Hoạt Hình: ${msg}`);
    window.showEffectNotice?.({
      cardId: 'DL-toon_bookmark',
      title: '🛡️ Hiệu ứng Mộ: Đánh Dấu Trang Hoạt Hình',
      text: msg,
      owner,
      icon: '🛡️'
    });
    return true;
  });

  // Global sentToGrave hook for Duel Links cards
  window.memeAnime.onSentToGrave = async function(n, id, byEffect, reason = 'effect') {
    if (id === 'DL-black_metal_dragon' || id === 'dl_black_metal') {
      await handleBlackMetalGY(n);
    } else if (id === 'DL-the_white_stone_of_legend' || id === 'dl_stone_legend') {
      const s = S(n);
      const be = choices(s.deck, 'deck').find(e => e.id === 'AN-blue_eyes_white_dragon');
      if (be) {
        await fx(n, card(id), 'search', [], () => {
          const idx = s.deck.indexOf('AN-blue_eyes_white_dragon');
          if (idx >= 0) {
            window.memeCardMotion?.record('search', n, 'AN-blue_eyes_white_dragon');
            s.hand.push(s.deck.splice(idx, 1)[0]);
            s.deck = shuffle(s.deck);
            log(`✦ Đá Trắng Truyền Thuyết lấy Rồng Trắng Mắt Xanh lên tay.`);
          }
        });
      }
    } else if (id === 'DL-the_white_stone_of_ancients' || id === 'dl_stone_ancients') {
      S(n).ancientsSentRound = duel.round;
    } else if (id === 'DL-elemental_hero_solid_soldier' || id === 'dl_solid_soldier') {
      if (byEffect && reason !== 'discard') await handleSolidSoldierGY(n, byEffect);
    } else if (id === 'DL-elemental_hero_liquid_soldier' || id === 'dl_liquid_soldier') {
      if (reason === 'material') await handleLiquidSoldierFusionMat(n);
    } else if (id === 'DL-return_of_the_red_eyes') {
      if (reason !== 'material' && reason !== 'discard') await handleReturnRedEyesDestroyed(n);
    } else if (id === 'DL-cyber_dragon_core' || id === 'dl_cyber_core') {
      await autoCyberDragonCore(n);
    }
  };
  window.memeAnime.onBanished = async function(n, id) {
    if (id === 'DL-elemental_hero_liquid_soldier' || id === 'dl_liquid_soldier') await handleLiquidSoldierFusionMat(n);
  };

  // End Phase hook for Duel Links (The White Stone of Ancients, Cyber Dragon Core)
  const origEndTurnHook = window.memeAnime.onEndTurn;
  window.memeAnime.onEndTurn = async function(n) {
    if (origEndTurnHook) await origEndTurnHook(n);
    for (const side of ['player', 'enemy']) {
      await autoWhiteStone(side);
      await autoCyberDragonCore(side);
    }
  };

  // Add all effect codes to supported set & ensure traits
  if (window.MEME_DUEL_LINKS_GROUP?.cards) {
    for (const c of window.MEME_DUEL_LINKS_GROUP.cards) {
      if (!Array.isArray(c.traits)) c.traits = [];
      if (c.effect_code) window.memeAnime.supported.add(c.effect_code);
    }
  }

  console.log('⚔️ [MEME_DUEL_LINKS_ENGINE] 60 Duel Links meta cards initialized and hooked.');
})();
