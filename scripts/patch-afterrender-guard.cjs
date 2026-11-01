const fs = require('fs');
const path = require('path');

// 1. Fix assets/js/meme_vfx_battle.js
const battleVfxPath = path.join(__dirname, '..', 'assets', 'js', 'meme_vfx_battle.js');
let battleCode = fs.readFileSync(battleVfxPath, 'utf8');

const targetBattleHook = /\/\/ 3\.2 Hook afterRender:[\s\S]*?window\.memeFx\.afterRender = hookedAfterRender;\s*\}/;

const fixedBattleHook = `// 3.2 Hook afterRender: Bổ sung hiệu ứng nổ vỡ quái vật & theo dõi Crisis
    let prevMonstersMap = null;

    const prevAfterRender = window.memeFx.afterRender;
    if (prevAfterRender && !prevAfterRender.__hookedVfxBattle) {
      const hookedAfterRender = function(state, oldElements) {
        // Chỉ kích hoạt hiệu ứng nổ vỡ khi ô thực sự ĐÃ CÓ quái vật trước đó và nay bị tiêu diệt
        if (prevMonstersMap && oldElements && canAnimate() && window.card) {
          for (const name of ['player', 'enemy']) {
            for (let i = 0; i < 3; i++) {
              const prevId = prevMonstersMap[name]?.[i];
              const currentMonster = state[name]?.monsters?.[i];
              // Phải có quái vật ở frame trước và nay biến mất mới kích hoạt nổ hủy diệt
              if (prevId && !currentMonster) {
                const old = oldElements.find(x => x.name === name && x.zone === 'Monsters' && x.i === i);
                if (old) {
                  const centerPos = { x: old.rect.left + old.rect.width / 2, y: old.rect.top + old.rect.height / 2 };
                  const c = window.card(prevId);
                  const color = c ? (attackColors[c.element] || '#ffe592') : '#ff7878';
                  spawnShatterParticles(centerPos, color);
                  window.memeAudioSfx?.play('destroy');
                }
              }
            }
            // Ô Extra
            const prevExtraId = prevMonstersMap[name + 'Extra'];
            const currentExtra = state[name]?.extra;
            if (prevExtraId && !currentExtra) {
              const oldExtra = oldElements.find(x => x.name === name && x.zone === 'Extra');
              if (oldExtra) {
                const centerPos = { x: oldExtra.rect.left + oldExtra.rect.width / 2, y: oldExtra.rect.top + oldExtra.rect.height / 2 };
                spawnShatterParticles(centerPos, '#cfa7ff');
                window.memeAudioSfx?.play('destroy');
              }
            }
          }
        }

        // Cập nhật bản đồ quái vật cho frame tiếp theo
        prevMonstersMap = {
          player: state.player?.monsters?.map(s => s?.id || null) || [null, null, null],
          enemy: state.enemy?.monsters?.map(s => s?.id || null) || [null, null, null],
          playerExtra: state.player?.extra?.id || null,
          enemyExtra: state.enemy?.extra?.id || null
        };

        const res = prevAfterRender.apply(this, arguments);
        updateCrisisState();
        return res;
      };
      hookedAfterRender.__hookedVfxBattle = true;
      window.memeFx.afterRender = hookedAfterRender;
    }`;

if (targetBattleHook.test(battleCode)) {
  battleCode = battleCode.replace(targetBattleHook, fixedBattleHook);
  fs.writeFileSync(battleVfxPath, battleCode, 'utf8');
  console.log('Successfully patched meme_vfx_battle.js');
} else {
  console.error('Target hook in meme_vfx_battle.js not found');
  process.exit(1);
}

// 2. Fix assets/js/meme_vfx_summon.js
const summonVfxPath = path.join(__dirname, '..', 'assets', 'js', 'meme_vfx_summon.js');
let summonCode = fs.readFileSync(summonVfxPath, 'utf8');

const targetSummonHook = /\/\/ 4\.2 Hook afterRender:[\s\S]*?window\.memeFx\.afterRender = hookedAfterRender;\s*\}/;

const fixedSummonHook = `// 4.2 Hook afterRender: Khi quái vật lật từ úp thủ sang ngửa
    let prevFaceDownMap = null;

    const prevAfterRender = window.memeFx.afterRender;
    if (prevAfterRender && !prevAfterRender.__hookedVfxSummon) {
      const hookedAfterRender = function(state, oldElements) {
        const res = prevAfterRender.apply(this, arguments);
        if (canAnimate() && oldElements && prevFaceDownMap) {
          for (const name of ['player', 'enemy']) {
            for (let i = 0; i < 3; i++) {
              const wasFaceDown = prevFaceDownMap[name]?.[i] === true;
              const curSlot = state[name]?.monsters?.[i];
              // Chỉ kích hoạt Mana Sigil khi trước đó thực sự ĐANG ÚP và nay được lật ngửa
              if (wasFaceDown && curSlot && curSlot.position !== 'def_down') {
                const el = document.querySelectorAll('#' + name + 'Monsters .field-slot')[i];
                if (el) {
                  spawnFlipSigil(el, '#facc15');
                }
              }
            }
          }
        }

        prevFaceDownMap = {
          player: state.player?.monsters?.map(s => s?.position === 'def_down') || [false, false, false],
          enemy: state.enemy?.monsters?.map(s => s?.position === 'def_down') || [false, false, false]
        };

        return res;
      };
      hookedAfterRender.__hookedVfxSummon = true;
      window.memeFx.afterRender = hookedAfterRender;
    }`;

if (targetSummonHook.test(summonCode)) {
  summonCode = summonCode.replace(targetSummonHook, fixedSummonHook);
  fs.writeFileSync(summonVfxPath, summonCode, 'utf8');
  console.log('Successfully patched meme_vfx_summon.js');
} else {
  console.error('Target hook in meme_vfx_summon.js not found');
  process.exit(1);
}
