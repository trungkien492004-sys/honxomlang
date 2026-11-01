// ==========================================================================
// YU-GI-OH! ANIME DUEL — BATTLE VFX & CRISIS RUNTIME
// Mở rộng hiệu ứng chiến đấu: Đòn đánh trực tiếp, vết chém, mảnh vỡ hủy diệt
// và chế độ nguy cấp LP (Crisis Mode) cho Anime Duel.
// ==========================================================================
(() => {
  if (window.__memeVfxBattleLoaded) return;
  window.__memeVfxBattleLoaded = true;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const attackColors = { Hỏa: '#ff8159', Thủy: '#63eaff', Phong: '#8fffb9', Quang: '#ffe89a', Ám: '#d18cff', Cơ: '#9cd7ff' };

  function canAnimate() {
    return window.memeFx && window.memeFx.mode !== 'minimal' && !reduced.matches;
  }

  function getCenter(el) {
    const r = el?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, rect: r } : null;
  }

  // 1. Hiệu ứng hạt năng lượng vỡ vụn khi quái vật bị tiêu diệt
  function spawnShatterParticles(pos, color) {
    if (!pos || !canAnimate()) return;
    const layer = document.getElementById('memeFxLayer');
    if (!layer) return;

    const count = 12;
    for (let i = 0; i < count; i++) {
      const shard = document.createElement('i');
      shard.className = 'meme-shatter-shard';
      const angle = (i * Math.PI * 2) / count + (Math.random() * 0.4 - 0.2);
      const dist = 32 + Math.random() * 48;
      const rot = Math.random() * 360;
      shard.style.left = pos.x + 'px';
      shard.style.top = pos.y + 'px';
      shard.style.setProperty('--shard-color', color || '#ffde7a');

      layer.appendChild(shard);
      const anim = shard.animate([
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.2) rotate(${rot}deg)`, opacity: 0 }
      ], {
        duration: 520,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });
      anim.finished.catch(() => {}).finally(() => shard.remove());
    }
  }

  // 2. Cập nhật trạng thái Nguy Cấp (Crisis Mode: LP <= 1000)
  function updateCrisisState() {
    const board = document.querySelector('.board-frame');
    if (!board) return;
    if (!window.duel || window.duel.finished) {
      board.classList.remove('board-crisis');
      return;
    }
    const playerLp = window.duel.player?.lp ?? 4000;
    const enemyLp = window.duel.enemy?.lp ?? 4000;
    const minLp = Math.min(playerLp, enemyLp);

    if (minLp > 0 && minLp <= 1000) {
      board.classList.add('board-crisis');
    } else {
      board.classList.remove('board-crisis');
    }
  }

  // 3. Hook vào hệ thống memeFx khi sẵn sàng
  function hookMemeFx() {
    if (!window.memeFx) {
      setTimeout(hookMemeFx, 50);
      return;
    }

    // 3.1 Hook Attack: Xử lý đòn đánh trực tiếp (Direct Attack)
    const prevAttack = window.memeFx.attack;
    if (prevAttack && !prevAttack.__hookedVfxBattle) {
      const hookedAttack = async function(attackerSide, attackerIndex, attackerExtra, targetIndex, targetExtra, resolve) {
        const isDirect = (targetIndex === null && !targetExtra);
        const layer = document.getElementById('memeFxLayer');

        if (isDirect && layer && canAnimate()) {
          const badge = document.createElement('div');
          badge.className = 'meme-direct-attack-badge';
          badge.innerHTML = '<span>⚡ TẤN CÔNG TRỰC TIẾP! ⚡</span>';
          layer.appendChild(badge);
          setTimeout(() => badge.remove(), 800);
        }

        const enhancedResolve = async () => {
          if (isDirect) {
            const board = document.querySelector('.board-frame');
            if (board) {
              board.classList.add('fx-direct-hit');
              setTimeout(() => board.classList.remove('fx-direct-hit'), 420);
            }
          }
          const res = await resolve();
          updateCrisisState();
          return res;
        };

        return prevAttack.call(this, attackerSide, attackerIndex, attackerExtra, targetIndex, targetExtra, enhancedResolve);
      };
      hookedAttack.__hookedVfxBattle = true;
      window.memeFx.attack = hookedAttack;
    }

    // 3.2 Hook afterRender: Bổ sung hiệu ứng nổ vỡ quái vật & theo dõi Crisis
    const prevAfterRender = window.memeFx.afterRender;
    if (prevAfterRender && !prevAfterRender.__hookedVfxBattle) {
      const hookedAfterRender = function(state, oldElements) {
        // Kiểm tra quái vật bị tiêu diệt
        if (oldElements && canAnimate() && window.card) {
          for (const name of ['player', 'enemy']) {
            for (let i = 0; i < 3; i++) {
              const old = oldElements.find(x => x.name === name && x.zone === 'Monsters' && x.i === i);
              const currentMonster = state[name]?.monsters?.[i];
              if (old && !currentMonster) {
                const centerPos = { x: old.rect.left + old.rect.width / 2, y: old.rect.top + old.rect.height / 2 };
                const oldCardId = old.el?.dataset?.cardId || old.el?.getAttribute('data-id');
                const c = oldCardId ? window.card(oldCardId) : null;
                const color = c ? (attackColors[c.element] || '#ffe592') : '#ff7878';
                spawnShatterParticles(centerPos, color);
                window.memeAudioSfx?.play('destroy');
              }
            }
            // Ô Extra
            const oldExtra = oldElements.find(x => x.name === name && x.zone === 'Extra');
            const currentExtra = state[name]?.extra;
            if (oldExtra && !currentExtra) {
              const centerPos = { x: oldExtra.rect.left + oldExtra.rect.width / 2, y: oldExtra.rect.top + oldExtra.rect.height / 2 };
              spawnShatterParticles(centerPos, '#cfa7ff');
              window.memeAudioSfx?.play('destroy');
            }
          }
        }

        const res = prevAfterRender.apply(this, arguments);
        updateCrisisState();
        return res;
      };
      hookedAfterRender.__hookedVfxBattle = true;
      window.memeFx.afterRender = hookedAfterRender;
    }

    // 3.3 Hook setLp: Đồng bộ trạng thái Crisis
    const prevSetLp = window.memeFx.setLp;
    if (prevSetLp && !prevSetLp.__hookedVfxBattle) {
      const hookedSetLp = function(name, value) {
        window.memeAudioSfx?.play('lp_tick');
        const res = prevSetLp.apply(this, arguments);
        setTimeout(updateCrisisState, 50);
        return res;
      };
      hookedSetLp.__hookedVfxBattle = true;
      window.memeFx.setLp = hookedSetLp;
    }
  }

  // Khởi động khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookMemeFx);
  } else {
    hookMemeFx();
  }

  // Xuất API kiểm thử
  window.memeBattleVfx = {
    spawnShatterParticles,
    updateCrisisState
  };
})();
