const fs = require('fs');
const path = require('path');

const enginePath = path.resolve('assets/js/meme_duel_links_engine.js');
let content = fs.readFileSync(enginePath, 'utf8');

// 1. Rewrite DL-red_eyes_fusion with multi-source manual material selection
const redEyesFusionCode = `  // Red-Eyes Fusion - Fusion Summon from Hand, Field or DECK with material choice!
  register('DL-red_eyes_fusion', async (n, c, ctx) => {
    const s = S(n);
    const fusions = choices(s.extraDeck, 'extra').filter(e => ['DL-red_eyes_slash_dragon', 'AN-black_skull_dragon'].includes(e.id));
    if (!fusions.length || free(n) < 0) return false;
    const fusionTarget = await pick(n, 'Dung Hợp Mắt Đỏ: chọn quái Extra', fusions);
    if (!fusionTarget) return false;

    // Red-Eyes materials pool (Deck, Hand, Field)
    const rePool = [
      ...choices(s.deck, 'deck').filter(e => isRedEyes(C(e.id))),
      ...choices(s.hand, 'hand').filter(e => isRedEyes(C(e.id)) && e.index !== ctx.handIndex),
      ...E(n).filter(e => face(e.slot) && isRedEyes(C(e.slot.id))).map(e => ({ ...e, zone: 'field' }))
    ];
    if (!rePool.length) {
      log('Không có quái Mắt Đỏ nào trên Tay, Sân hoặc trong Bộ bài.');
      return false;
    }
    const reCard = await pick(n, 'Dung Hợp Mắt Đỏ: chọn quái Mắt Đỏ làm nguyên liệu', rePool);
    if (!reCard) return false;

    // Second material pool (Warrior or Summoned Skull)
    const isSlash = fusionTarget.id === 'DL-red_eyes_slash_dragon';
    const secondPool = isSlash ? [
      ...choices(s.deck, 'deck').filter(e => C(e.id)?.tribe === 'Chiến Binh' && e !== reCard),
      ...choices(s.hand, 'hand').filter(e => C(e.id)?.tribe === 'Chiến Binh' && e.index !== ctx.handIndex && e !== reCard),
      ...E(n).filter(e => face(e.slot) && C(e.slot.id)?.tribe === 'Chiến Binh' && e !== reCard).map(e => ({ ...e, zone: 'field' }))
    ] : [
      ...choices(s.deck, 'deck').filter(e => e.id === 'AN-summoned_skull'),
      ...choices(s.hand, 'hand').filter(e => e.id === 'AN-summoned_skull' && e.index !== ctx.handIndex),
      ...E(n).filter(e => face(e.slot) && e.slot.id === 'AN-summoned_skull').map(e => ({ ...e, zone: 'field' }))
    ];

    if (!secondPool.length) {
      log(isSlash ? 'Không có quái Chiến Binh nào trên Tay, Sân hoặc Bộ bài.' : 'Không có Quỷ Triệu Hồi trên Tay, Sân hoặc Bộ bài.');
      return false;
    }
    const secondCard = await pick(n, isSlash ? 'Dung Hợp Mắt Đỏ: chọn quái Chiến Binh làm nguyên liệu' : 'Dung Hợp Mắt Đỏ: chọn Quỷ Triệu Hồi làm nguyên liệu', secondPool);
    if (!secondCard) return false;

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
      s.monsters[free(n)] = slot;
      enqueue(() => postSummon(n, slot));
      log(\`🌀 Dung Hợp Mắt Đỏ gọi \${C(fusionTarget.id).name} từ Bộ bài phụ!\`);
    });
  });`;

content = content.replace(/  \/\/ Red-Eyes Fusion[\s\S]*?  \}\);\n\n  \/\/ Red-Eyes Insight/, `${redEyesFusionCode}\n\n  // Red-Eyes Insight`);

// 2. Rewrite DL-neos_fusion with material selection
const neosFusionCode = `  // Neos Fusion - Send materials from Hand, Field or DECK with choice!
  register('DL-neos_fusion', async (n, c, ctx) => {
    const s = S(n);
    const fusions = choices(s.extraDeck, 'extra').filter(e => e.id === 'DL-elemental_hero_brave_neos' || e.id === 'AN-elemental_hero_flame_wingman');
    if (!fusions.length || free(n) < 0) return false;
    const target = await pick(n, 'Dung Hợp Tân Vũ: chọn quái Extra', fusions);
    if (!target) return false;

    // Neos pool
    const neosPool = [
      ...choices(s.deck, 'deck').filter(e => e.id === 'AN-elemental_hero_neos'),
      ...choices(s.hand, 'hand').filter(e => e.id === 'AN-elemental_hero_neos' && e.index !== ctx.handIndex),
      ...E(n).filter(e => face(e.slot) && e.slot.id === 'AN-elemental_hero_neos').map(e => ({ ...e, zone: 'field' }))
    ];
    if (!neosPool.length) {
      log('Không có Anh Hùng Nguyên Tố Tân Vũ trên Tay, Sân hoặc Bộ bài.');
      return false;
    }
    const neosCard = await pick(n, 'Dung Hợp Tân Vũ: chọn Tân Vũ Neos làm nguyên liệu', neosPool);
    if (!neosCard) return false;

    // Level 4 or lower effect monster pool
    const lv4Pool = [
      ...choices(s.deck, 'deck').filter(e => {
        const x = C(e.id);
        return x?.card_type === 'Monster' && (x.stars || 0) <= 4 && (x.monster_category === 'Hiệu Ứng' || !x.normal) && e !== neosCard;
      }),
      ...choices(s.hand, 'hand').filter(e => {
        const x = C(e.id);
        return x?.card_type === 'Monster' && (x.stars || 0) <= 4 && (x.monster_category === 'Hiệu Ứng' || !x.normal) && e.index !== ctx.handIndex && e !== neosCard;
      }),
      ...E(n).filter(e => {
        const x = C(e.slot.id);
        return face(e.slot) && (x?.stars || 0) <= 4 && (x?.monster_category === 'Hiệu Ứng' || !x?.normal) && e !== neosCard;
      }).map(e => ({ ...e, zone: 'field' }))
    ];
    if (!lv4Pool.length) {
      log('Không có quái Hiệu Ứng Cấp 4 hoặc thấp hơn trên Tay, Sân hoặc Bộ bài.');
      return false;
    }
    const lv4Card = await pick(n, 'Dung Hợp Tân Vũ: chọn quái Hiệu Ứng Cấp 4 làm nguyên liệu', lv4Pool);
    if (!lv4Card) return false;

    return fx(n, c, 'fusion', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      for (const m of [neosCard, lv4Card]) {
        if (m.zone === 'field') {
          remove(n, m, 'material');
        } else {
          const pool = m.zone === 'deck' ? s.deck : s.hand;
          const idx = pool.indexOf(m.id);
          if (idx >= 0) s.grave.push(pool.splice(idx, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
      s.extraDeck.splice(target.index, 1);
      const slot = { ...monsterSlot(target.id, 'atk'), fusionSummoned: true };
      uid(slot);
      s.monsters[free(n)] = slot;
      enqueue(() => postSummon(n, slot));
      log(\`🌀 Dung Hợp Tân Vũ gọi \${C(target.id).name} từ Bộ bài phụ!\`);
    });
  });`;

content = content.replace(/  \/\/ Neos Fusion[\s\S]*?  \}\);\n\n  \/\/ A Hero Lives/, `${neosFusionCode}\n\n  // A Hero Lives`);

// 3. Rewrite DL-cyberload_fusion with pickMany
const cyberloadFusionCode = `  // Cyberload Fusion - Shuffle materials from Field/Banished into Deck via pickMany
  register('DL-cyberload_fusion', async (n, c, ctx) => {
    const s = S(n);
    const fusions = choices(s.extraDeck, 'extra').filter(e => isCyber(C(e.id)) || e.id === 'DL-chimeratech_rampage_dragon');
    if (!fusions.length || free(n) < 0) return false;
    const target = await pick(n, 'Dung Hợp Rồng Máy: chọn quái Extra', fusions);
    if (!target) return false;

    const materials = [
      ...E(n).filter(e => face(e.slot) && (isCyber(C(e.slot.id)) || e.slot.id === 'AN-cyber_dragon')).map(e => ({ ...e, zone: 'field' })),
      ...choices(s.banished, 'banished').filter(e => isCyber(C(e.id)) || e.id === 'AN-cyber_dragon').map(e => ({ ...e, zone: 'banished' }))
    ];
    if (materials.length < 2) return false;
    const multiFn = core.pickMany || window.memeAnime.chooseMany;
    const picked = await multiFn(n, 'Dung Hợp Rồng Máy: chọn 2 nguyên liệu trên Sân hoặc Trục Xuất', materials, { min: 2, max: 2 });
    if (!picked || picked.length < 2) return false;

    return fx(n, c, 'fusion', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      for (const m of picked) {
        if (m.zone === 'field') remove(n, m, 'material');
        else {
          const idx = s.banished.indexOf(m.id);
          if (idx >= 0) s.deck.push(s.banished.splice(idx, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
      s.extraDeck.splice(target.index, 1);
      const slot = { ...monsterSlot(target.id, 'atk'), fusionSummoned: true };
      uid(slot);
      s.monsters[free(n)] = slot;
      enqueue(() => postSummon(n, slot));
      log(\`🌀 Dung Hợp Rồng Máy gọi \${C(target.id).name}!\`);
    });
  });`;

content = content.replace(/  \/\/ Cyberload Fusion[\s\S]*?  \}\);\n\n  \/\/ Zane Truesdale Extra Boss/, `${cyberloadFusionCode}\n\n  // Zane Truesdale Extra Boss`);

// 4. Rewrite DL-cybernetic_overflow with pickMany
const cyberOverflowCode = `  // Cybernetic Overflow - Banish Cyber Dragons via pickMany to destroy cards
  register('DL-cybernetic_overflow', async (n, c, ctx) => {
    const s = S(n);
    const foe = other(n);
    const candidates = [
      ...choices(s.hand, 'hand').filter(e => isCyber(C(e.id))),
      ...E(n).filter(e => face(e.slot) && isCyber(C(e.slot.id))).map(e => ({ ...e, zone: 'field' })),
      ...choices(s.grave, 'grave').filter(e => isCyber(C(e.id))).map(e => ({ ...e, zone: 'grave' }))
    ];
    if (!candidates.length) return false;
    const foeCards = [...targetList(foe), ...spellList(foe)];
    if (!foeCards.length) return false;

    const multiFn = core.pickMany || window.memeAnime.chooseMany;
    const picked = await multiFn(n, 'Quá Tải Rồng Máy: chọn các Rồng Máy cấp khác nhau để trục xuất', candidates, { min: 1, max: Math.min(candidates.length, foeCards.length) });
    if (!picked || !picked.length) return false;

    const destroyTargets = await multiFn(n, \`Quá Tải Rồng Máy: chọn \${picked.length} lá của đối thủ để phá hủy\`, foeCards, { min: picked.length, max: picked.length });
    if (!destroyTargets || destroyTargets.length < picked.length) return false;

    return fx(n, c, 'destroy', destroyTargets, () => {
      clearSpell(n, ctx.fromSet?.index ?? s.spells.indexOf(ctx.source));
      for (const m of picked) {
        if (m.zone === 'field') remove(n, m, 'cost');
        else if (m.zone === 'hand') {
          const idx = s.hand.indexOf(m.id);
          if (idx >= 0) s.banished.push(s.hand.splice(idx, 1)[0]);
        } else {
          const idx = s.grave.indexOf(m.id);
          if (idx >= 0) s.banished.push(s.grave.splice(idx, 1)[0]);
        }
      }
      for (const t of destroyTargets) {
        if (t.type === 'spell' || t.slot?.faceDown !== undefined && t.zone !== 'monster') clearSpell(foe, t.index);
        else remove(foe, t, 'effect');
      }
      log(\`💥 Quá Tải Rồng Máy trục xuất \${picked.length} quái và phá hủy \${destroyTargets.length} lá đối thủ!\`);
    });
  });`;

content = content.replace(/  \/\/ Cybernetic Overflow[\s\S]*?  \}\);\n\n  \/\/ Cybernetic Fusion Support/, `${cyberOverflowCode}\n\n  // Cybernetic Fusion Support`);

// 5. Rewrite DL-illusion_magic with pickMany
const illusionMagicCode = `  // Illusion Magic - Tribute 1 Spellcaster, search up to 2 Dark Magicians via pickMany
  register('DL-illusion_magic', async (n, c, ctx) => {
    const s = S(n);
    const spellcasters = E(n).filter(e => face(e.slot) && (C(e.slot.id)?.tribe === 'Phép Thuật' || C(e.slot.id)?.tribe === 'Phù Thủy'));
    if (!spellcasters.length) return false;
    const cost = await pick(n, 'Ma Thuật Ảo Ảnh: chọn 1 quái Phù Thủy trên sân làm chi phí', spellcasters, { cheap: true });
    if (!cost) return false;

    const dmInDeckOrGrave = [
      ...choices(s.deck, 'deck').filter(e => e.id === 'AN-dark_magician'),
      ...choices(s.grave, 'grave').filter(e => e.id === 'AN-dark_magician')
    ];
    if (!dmInDeckOrGrave.length) return false;

    const multiFn = core.pickMany || window.memeAnime.chooseMany;
    const picked = await multiFn(n, 'Ma Thuật Ảo Ảnh: chọn tối đa 2 Phù Thủy Áo Đen lên tay', dmInDeckOrGrave, { min: 1, max: Math.min(2, dmInDeckOrGrave.length) });
    if (!picked || !picked.length) return false;

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      remove(n, cost, 'cost');
      for (const t of picked) {
        if (t.zone === 'deck') {
          const idx = s.deck.indexOf('AN-dark_magician');
          if (idx >= 0) s.hand.push(s.deck.splice(idx, 1)[0]);
        } else {
          const idx = s.grave.indexOf('AN-dark_magician');
          if (idx >= 0) s.hand.push(s.grave.splice(idx, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
      log(\`✦ Ma Thuật Ảo Ảnh lấy \${picked.length} Phù Thủy Áo Đen lên tay.\`);
    });
  });`;

content = content.replace(/  \/\/ Illusion Magic[\s\S]*?  \}\);\n\n  \/\/ Magician of Chaos/, `${illusionMagicCode}\n\n  // Magician of Chaos`);

// 6. Red-Eyes Fang with Chain Complete Handlers and Inspection
const fangWithChainCode = `  // ─────────────────────────────────────────────────────────────
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
      log(\`✦ Nanh Xích Mắt Đỏ trang bị cho \${C(target.slot.id).name} (+500 ATK/DEF, tấn công 2 quái mỗi lượt)!\`);
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
      sentToGrave(n, 'DL-red_eyes_fang_with_chain', true);

      const stolenCard = C(target.id);
      const stolenAtk = stolenCard?.atk || 0;
      const stolenDef = stolenCard?.def || 0;
      remove(foe, target, 'effect');

      reMonster.slot.tempAtk = (reMonster.slot.tempAtk || 0) + stolenAtk;
      reMonster.slot.tempDef = (reMonster.slot.tempDef || 0) + stolenDef;
      log(\`✦ Nanh Xích Mắt Đỏ gửi xuống Mộ, cướp \${stolenCard?.name || 'quái đối thủ'} (ATK +\${stolenAtk}, DEF +\${stolenDef}) trang bị cho \${C(reMonster.slot.id).name}!\`);
    });
  }

  register('DL-red_eyes_fang_with_chain', async (n, c, ctx) => {
    if (ctx.fromSet) {
      return handleFangWithChain(n, ctx.fromSet.index);
    }
    return false;
  });`;

content = content.replace(/  \/\/ Black Metal Dragon[\s\S]*?  \/\/ Equip Black Metal Dragon to Red-Eyes monster on field/, `${fangWithChainCode}\n\n  // Black Metal Dragon (Rồng Đen Thép Mắt Đỏ) - Sent to GY -> Search Red-Eyes card
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
        log(\`✦ Rồng Đen Thép Mắt Đỏ lấy \${C(picked.id).name} lên tay.\`);
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

  // Equip Black Metal Dragon to Red-Eyes monster on field`);

// 7. Update renderInspector hook to support:
// - Red-Eyes Fang with Chain (Set activation & Face-up steal)
// - Black Metal Dragon equip action
// - Eternal Soul once-per-turn face-up activation
// - Return of the Red-Eyes once-per-turn face-up activation
// - Trap activation hook and problem hook
const hookSections = `  // Hook into trapProblem and activateTrap for all Duel Links traps
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
  }`;

content = content.replace(/  \/\/ Hook into renderInspector[\s\S]*?  \}\n  \}/, hookSections);

fs.writeFileSync(enginePath, content, 'utf8');
console.log('Successfully upgraded meme_duel_links_engine.js with multi-pick, full Fang with Chain, and trap activation!');
