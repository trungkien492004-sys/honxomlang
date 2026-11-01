// ==========================================================================
// YU-GI-OH! ANIME DUEL — SPECIAL SUMMON & REVEAL RUNTIME (GĐ2)
// Hiệu ứng triệu hồi đặc biệt: Fusion Vortex, Synchro Tuning Rings,
// XYZ Galaxy Portal, Mana Sigil khi lật bài úp & Khiên Phản đòn Counter.
// ==========================================================================
(() => {
  if (window.__memeVfxSummonLoaded) return;
  window.__memeVfxSummonLoaded = true;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function canAnimate() {
    return window.memeFx && window.memeFx.mode !== 'minimal' && !reduced.matches;
  }

  // 1. Hiệu ứng bộc phát Mana Sigil khi lật bài úp (Phép / Bẫy / Quái)
  function spawnFlipSigil(targetEl, color) {
    if (!targetEl || !canAnimate()) return;
    const r = targetEl.getBoundingClientRect();
    if (!r || r.width === 0) return;
    const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const layer = document.getElementById('memeFxLayer');
    if (!layer) return;

    const sigil = document.createElement('div');
    sigil.className = 'meme-flip-sigil';
    sigil.style.left = center.x + 'px';
    sigil.style.top = center.y + 'px';
    sigil.style.setProperty('--sigil-color', color || '#facc15');
    layer.appendChild(sigil);
    window.memeAudioSfx?.play('flip');
    setTimeout(() => sigil.remove(), 700);
  }

  // 2. Tăng cường giao diện sân khấu hiệu ứng (Stage Enhancer)
  function enhanceEffectStage(stage) {
    if (!canAnimate() || !stage) return;
    const kind = stage.dataset.kind || '';
    const title = stage.querySelector('.anime-effect-card strong')?.textContent || '';
    const text = stage.querySelector('.anime-effect-card p')?.textContent || '';
    const counterVisual = stage.querySelector('.p2-counter-visual');

    // 2.1 Hiệu ứng Vòng xoáy Dung Hợp (Polymerization Vortex)
    if (kind === 'fusion' || title.includes('Dung Hợp') || title.includes('Polymerization') || text.includes('Dung Hợp')) {
      if (!stage.querySelector('.fusion-vortex-stage')) {
        const vortex = document.createElement('div');
        vortex.className = 'fusion-vortex-stage';
        vortex.innerHTML = `
          <div class="fusion-vortex-core"></div>
          <div class="fusion-spiral-arm arm-cyan"></div>
          <div class="fusion-spiral-arm arm-magenta"></div>
        `;
        stage.prepend(vortex);
        window.memeAudioSfx?.play('special_summon');
      }
    }

    // 2.2 Hiệu ứng Vòng tròn Tốc độ Đồng Bộ (Synchro Tuning Rings)
    if (kind === 'synchro' || title.includes('Đồng Bộ') || title.includes('Synchro') || text.includes('Đồng Bộ')) {
      if (!stage.querySelector('.synchro-tuning-stage')) {
        const synchro = document.createElement('div');
        synchro.className = 'synchro-tuning-stage';
        synchro.innerHTML = `
          <div class="synchro-rings-container">
            <div class="synchro-green-ring"></div>
            <div class="synchro-green-ring"></div>
            <div class="synchro-green-ring"></div>
            <div class="synchro-speed-beam"></div>
          </div>
        `;
        stage.prepend(synchro);
        window.memeAudioSfx?.play('special_summon');
      }
    }

    // 2.3 Hiệu ứng Cổng Không Gian Số Chiều XYZ (XYZ Galaxy Portal)
    if (kind === 'xyz' || title.includes('XYZ') || title.includes('Xyz') || text.includes('XYZ') || text.includes('Xyz')) {
      if (!stage.querySelector('.xyz-portal-stage')) {
        const xyz = document.createElement('div');
        xyz.className = 'xyz-portal-stage';
        xyz.innerHTML = `
          <div class="xyz-galaxy-disk"></div>
          <div class="xyz-orbit-satellites">
            <div class="xyz-satellite sat-1"></div>
            <div class="xyz-satellite sat-2"></div>
          </div>
        `;
        stage.prepend(xyz);
        window.memeAudioSfx?.play('special_summon');
      }
    }

    // 2.4 Hiệu ứng Khiên Phản Chiếu (Counter Clash Shield Ripple)
    if (counterVisual && !counterVisual.querySelector('.counter-clash-shield')) {
      const shield = document.createElement('div');
      shield.className = 'counter-clash-shield';
      counterVisual.appendChild(shield);
      window.memeAudioSfx?.play('counter');
    }
  }

  // 3. Giám sát Layer bằng MutationObserver để tự động trang trí Stage khi xuất hiện
  function setupStageObserver() {
    const layer = document.getElementById('memeFxLayer');
    if (!layer) {
      setTimeout(setupStageObserver, 50);
      return;
    }

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && node.classList.contains('anime-effect-stage')) {
            enhanceEffectStage(node);
          }
        }
      }
    });

    observer.observe(layer, { childList: true });
  }

  // 4. Hook vào các hàm lật bài của memeFx
  function hookFlipEffects() {
    if (!window.memeFx) {
      setTimeout(hookFlipEffects, 50);
      return;
    }

    // 4.1 Hook flipTrap: Khi lật bài bẫy hoặc phép úp
    const prevFlipTrap = window.memeFx.flipTrap;
    if (prevFlipTrap && !prevFlipTrap.__hookedVfxSummon) {
      const hookedFlipTrap = async function(side, index) {
        const slot = document.querySelectorAll('#' + side + 'Spells .field-slot')[index];
        if (slot) spawnFlipSigil(slot, '#ec4899');
        return prevFlipTrap.apply(this, arguments);
      };
      hookedFlipTrap.__hookedVfxSummon = true;
      window.memeFx.flipTrap = hookedFlipTrap;
    }

    // 4.2 Hook afterRender: Khi quái vật lật từ úp thủ sang ngửa
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
    }
  }

  // Khởi động
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupStageObserver();
      hookFlipEffects();
    });
  } else {
    setupStageObserver();
    hookFlipEffects();
  }

  window.memeSummonVfx = {
    spawnFlipSigil,
    enhanceEffectStage
  };
})();
