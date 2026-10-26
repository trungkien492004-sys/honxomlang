const fs = require('fs');
const path = require('path');

const enginePath = path.resolve(__dirname, '../assets/js/meme_duel_links_engine.js');
let code = fs.readFileSync(enginePath, 'utf8');

// 1. Ensure pickMany is destructured from core
code = code.replace(
  'pick, enqueue, fx, flush',
  'pick, pickMany, enqueue, fx, flush'
);

// 2. Replace Melody handler with pickMany implementation
const oldMelody = `  // The Melody of Awakening Dragon - Discard 1, add 2 Dragons
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
    const first = await pick(n, 'Giai Điệu: chọn Rồng thứ nhất (Blue-Eyes / Alternative)', dragons);
    if (!first) return false;
    const secondPool = dragons.filter(e => e !== first);
    const second = secondPool.length ? await pick(n, 'Giai Điệu: chọn Rồng thứ hai', secondPool, { optional: true }) : null;

    return fx(n, c, 'search', [], () => {
      if (!commitSpellSource(n, c, ctx)) return;
      takeDiscard(n, cost);
      const picks = [first, second].filter(Boolean).sort((a, b) => b.index - a.index);
      for (const p of picks) {
        if (s.deck[p.index] === p.id) {
          window.memeCardMotion?.record('search', n, p.id);
          s.hand.push(s.deck.splice(p.index, 1)[0]);
        }
      }
      s.deck = shuffle(s.deck);
    });
  });`;

const newMelody = `  // The Melody of Awakening Dragon - Discard 1, add up to 2 Dragons at once via multi-select
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
      log(\`✦ Giai Điệu Thức Tỉnh Rồng lấy \${picked.map(p => C(p.id).name).join(', ')} lên tay.\`);
    });
  });`;

code = code.replace(oldMelody, newMelody);

// 3. Update Black Metal Dragon & add Hero Solid/Liquid handlers
const oldBM = `  // Black Metal Dragon (Rồng Kim Loại Đen) - Sent to GY -> Search Red-Eyes card
  const handleBlackMetal = async (n, c, ctx) => {
    const s = S(n);
    const targets = choices(s.deck, 'deck').filter(e => isRedEyes(C(e.id)));
    if (!targets.length) return false;
    const picked = await pick(n, 'Rồng Kim Loại Đen: lấy 1 lá Red-Eyes lên tay', targets, { optional: true });
    if (!picked) return false;
    return fx(n, c, 'search', [], () => {
      if (s.deck[picked.index] === picked.id) {
        window.memeCardMotion?.record('search', n, picked.id);
        s.hand.push(s.deck.splice(picked.index, 1)[0]);
        s.deck = shuffle(s.deck);
        log(\`✦ Rồng Kim Loại Đen lấy \${C(picked.id).name} lên tay.\`);
      }
    });
  };
  register('DL-black_metal_dragon', handleBlackMetal);
  register('dl_black_metal', handleBlackMetal);`;

const newBM = `  // Black Metal Dragon (Hắc Kim Long) - Sent to GY -> Search Red-Eyes card
  const handleBlackMetalGY = async (n) => {
    const s = S(n);
    const targets = choices(s.deck, 'deck').filter(e => isRedEyes(C(e.id)));
    if (!targets.length) return false;
    const picked = await pick(n, 'Hắc Kim Long: lấy 1 lá Red-Eyes từ Deck lên tay', targets, { optional: true });
    if (!picked) return false;
    return fx(n, card('DL-black_metal_dragon'), 'search', [], () => {
      const idx = s.deck.indexOf(picked.id);
      if (idx >= 0) {
        window.memeCardMotion?.record('search', n, picked.id);
        s.hand.push(s.deck.splice(idx, 1)[0]);
        s.deck = shuffle(s.deck);
        log(\`✦ Hắc Kim Long lấy \${C(picked.id).name} lên tay.\`);
      }
    });
  };
  register('DL-black_metal_dragon', handleBlackMetalGY);
  register('dl_black_metal', handleBlackMetalGY);

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
      log(\`✦ Hắc Kim Long trang bị cho \${C(target.slot.id).name} (+600 ATK).\`);
    });
  }`;

code = code.replace(oldBM, newBM);

// 4. Add HERO Solid Soldier & Liquid Soldier handlers before Zane handlers
const heroHandlers = `  // Elemental HERO Solid Soldier (HERO Thiết Binh)
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
              log(\`✦ HERO Thiết Binh gọi đặc biệt \${C(mId).name} từ tay.\`);
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
          log(\`✦ HERO Thiết Binh hồi sinh \${C(picked.id).name} từ Mộ ở thế thủ.\`);
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
            log(\`✦ HERO Thủy Binh hồi sinh \${C(picked.id).name} từ Mộ.\`);
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
      log(\`✦ HERO Thủy Binh kích hoạt: Rút 2 lá và bỏ 1 lá.\`);
    });
  };

`;

code = code.replace(
  '  // ─────────────────────────────────────────────────────────────\n  // 6. ZANE HANDLERS',
  heroHandlers + '  // ─────────────────────────────────────────────────────────────\n  // 6. ZANE HANDLERS'
);

// 5. Connect onSentToGrave and onEndTurn hooks before the closing lines
const hooksCode = `
  // Global sentToGrave hook for Duel Links cards
  window.memeAnime.onSentToGrave = async function(n, id, byEffect) {
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
            log(\`✦ Bạch Thạch Truyền Thuyết lấy Rồng Trắng Mắt Xanh lên tay.\`);
          }
        });
      }
    } else if (id === 'DL-the_white_stone_of_ancients' || id === 'dl_stone_ancients') {
      S(n).ancientsSentRound = duel.round;
    } else if (id === 'DL-elemental_hero_solid_soldier' || id === 'dl_solid_soldier') {
      if (byEffect) await handleSolidSoldierGY(n, byEffect);
    } else if (id === 'DL-elemental_hero_liquid_soldier' || id === 'dl_liquid_soldier') {
      if (byEffect) await handleLiquidSoldierFusionMat(n);
    }
  };

  // End Phase hook for Duel Links (The White Stone of Ancients)
  const origEndTurnHook = window.memeAnime.onEndTurn;
  window.memeAnime.onEndTurn = async function(n) {
    if (origEndTurnHook) await origEndTurnHook(n);
    const s = S(n);
    if (s.ancientsSentRound === duel.round && s.grave.includes('DL-the_white_stone_of_ancients') && free(n) >= 0) {
      delete s.ancientsSentRound;
      const beMonsters = choices(s.deck, 'deck').filter(e => isBlueEyes(C(e.id)) && C(e.id)?.card_type === 'Monster' && !C(e.id)?.special_only);
      if (beMonsters.length && free(n) >= 0) {
        const picked = await pick(n, 'Bạch Thạch Cổ Đại: gọi đặc biệt 1 Rồng Trắng từ Deck', beMonsters, { optional: true });
        if (picked && free(n) >= 0) {
          await fx(n, card('DL-the_white_stone_of_ancients'), 'summon', [], () => {
            const idx = s.deck.indexOf(picked.id);
            if (idx >= 0) {
              const summoned = s.deck.splice(idx, 1)[0];
              s.deck = shuffle(s.deck);
              const slot = monsterSlot(summoned, 'atk');
              uid(slot);
              s.monsters[free(n)] = slot;
              enqueue(() => postSummon(n, slot));
              log(\`✦ Bạch Thạch Cổ Đại triệu hồi \${C(summoned).name} vào cuối lượt.\`);
            }
          });
        }
      }
    }
  };
`;

code = code.replace(
  '  // Add all effect codes to supported set',
  hooksCode + '\n  // Add all effect codes to supported set'
);

// 6. In renderInspector hook, add Black Metal Dragon equip action
const oldInspector = `      if (sel.type === 'hand' && c.card_type === 'Monster') {
        if (window.memeAnime.specialMode('player', c)) {
          if (![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Triệu hồi đặc biệt'))) {
            addAction(actions, '✦ Triệu hồi đặc biệt', () => window.memeAnime.perform(() => window.memeAnime.specialSummon('player', sel.index)));
          }
        }
      }`;

const newInspector = `      if (sel.type === 'hand' && c.card_type === 'Monster') {
        if (window.memeAnime.specialMode('player', c)) {
          if (![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Triệu hồi đặc biệt'))) {
            addAction(actions, '✦ Triệu hồi đặc biệt', () => window.memeAnime.perform(() => window.memeAnime.specialSummon('player', sel.index)));
          }
        }
      }
      if (c.id === 'DL-black_metal_dragon') {
        const reList = targetList('player', (slot, x) => face(slot) && isRedEyes(x));
        if (reList.length && ![...actions.querySelectorAll('button')].some(b => b.textContent.includes('Trang bị (+600 ATK)'))) {
          addAction(actions, '✦ Trang bị (+600 ATK)', () => window.memeAnime.perform(() => equipBlackMetal('player', sel)));
        }
      }`;

code = code.replace(oldInspector, newInspector);

fs.writeFileSync(enginePath, code, 'utf8');
console.log('✅ Applied Duel Links engine fixes successfully.');
