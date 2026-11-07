// Hiệu ứng sprite CC0 (assets/vfx/*) gắn thêm vào memeFx: triệu hồi, tấn công, kích hoạt bài, bẫy.
// Không thay thế hiệu ứng cũ: chỉ chạy thêm ở lớp #memeFxLayer, tắt khi memeFx.mode === 'minimal' hoặc reduced-motion.
(() => {
  if (window.__memeVfxPackLoaded) return;
  window.__memeVfxPackLoaded = true;

  const BASE = 'assets/vfx/';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_LIVE = 28;
  let live = 0;

  // Dải khung hình (spritesheet ngang). frames = số khung thật trong ảnh.
  const SHEETS = {
    lightning: { src: 'gothicvania-magic9/Lightning.png', fw: 64, fh: 128, frames: 10, ms: 620 },
    darkbolt: { src: 'gothicvania-magic9/Dark-Bolt.png', fw: 64, fh: 88, frames: 11, ms: 640 },
    firebomb: { src: 'gothicvania-magic9/Fire-bomb.png', fw: 64, fh: 64, frames: 14, ms: 700 },
    spark: { src: 'gothicvania-magic9/spark.png', fw: 32, fh: 32, frames: 7, ms: 420 },
    fireball: { src: 'starsteel-spells/fireball.png', fw: 64, fh: 32, frames: 9, ms: 600 },
    icespear: { src: 'starsteel-spells/icespear.png', fw: 64, fh: 32, frames: 6, ms: 480 },
    thundersphere: { src: 'starsteel-spells/thundersphere.png', fw: 64, fh: 32, frames: 8, ms: 560 }
  };
  // Hạt Kenney (trắng, kênh alpha) → tô màu bằng mask.
  const GLOW = ['magic_01', 'magic_02', 'magic_03', 'magic_04', 'magic_05', 'circle_03', 'circle_05', 'light_01', 'light_02', 'flare_01'];
  const SPARK = ['star_01', 'star_02', 'star_03', 'star_04', 'star_05', 'star_06', 'star_07', 'star_08', 'star_09', 'spark_01', 'spark_02', 'spark_03', 'spark_04', 'spark_05', 'spark_06', 'spark_07'];
  const SLASH = ['slash_01', 'slash_02', 'slash_03', 'slash_04'];
  const ELEMENT_SHEET = { Hỏa: 'firebomb', Thủy: 'icespear', Phong: 'lightning', Quang: 'lightning', Ám: 'darkbolt', Cơ: 'thundersphere' };
  const ELEMENT_COLOR = { Hỏa: '#ff8159', Thủy: '#63eaff', Phong: '#8fffb9', Quang: '#ffe89a', Ám: '#d18cff', Cơ: '#9cd7ff' };

  const layer = () => document.getElementById('memeFxLayer');
  const canAnimate = () => !reduced.matches && window.memeFx && window.memeFx.mode !== 'minimal' && !document.hidden;
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const centerOf = el => { const r = el?.getBoundingClientRect(); return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height } : null; };
  const slotEl = (side, index, extra) => extra ? document.getElementById(side + 'Extra') : document.querySelectorAll('#' + side + 'Monsters .field-slot')[index];
  const url = (dir, name) => `${BASE}kenney-particles/${name}.png`;

  // Nạp trước để lần đầu không bị chớp.
  function preload() {
    try {
      for (const s of Object.values(SHEETS)) new Image().src = BASE + s.src;
      for (const n of [...GLOW, ...SPARK, ...SLASH]) new Image().src = url('', n);
    } catch { /* bỏ qua */ }
  }

  function track(node, ms) {
    live += 1;
    setTimeout(() => { node.remove(); live -= 1; }, ms + 80);
  }

  // Phát một dải khung hình tại (x,y). scale theo pixel-art, canh giữa.
  function playSheet(name, pos, opts = {}) {
    const s = SHEETS[name], host = layer();
    if (!s || !pos || !host || live >= MAX_LIVE || !canAnimate()) return;
    const scale = opts.scale || 2.4, ms = opts.ms || s.ms;
    const node = document.createElement('div');
    Object.assign(node.style, {
      position: 'fixed', left: (pos.x - s.fw * scale / 2) + 'px', top: (pos.y - s.fh * scale * (opts.anchor ?? .5)) + 'px',
      width: s.fw * scale + 'px', height: s.fh * scale + 'px', pointerEvents: 'none', zIndex: 60,
      backgroundImage: `url(${BASE + s.src})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
      backgroundSize: `${s.fw * s.frames * scale}px ${s.fh * scale}px`, backgroundPosition: '0 0',
      transform: opts.flip ? 'scaleX(-1)' : '', opacity: opts.opacity ?? 1, mixBlendMode: opts.blend || 'normal'
    });
    host.appendChild(node);
    node.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: `${-s.fw * s.frames * scale}px 0` }], { duration: ms, easing: `steps(${s.frames})`, fill: 'forwards' });
    track(node, ms);
  }

  // Một hạt Kenney tô màu (mask) bay ra / nở ra rồi tan.
  function particle(name, pos, color, opts = {}) {
    const host = layer();
    if (!host || live >= MAX_LIVE) return;
    const size = opts.size || 64, ms = opts.ms || 700;
    const node = document.createElement('i');
    Object.assign(node.style, {
      position: 'fixed', left: (pos.x - size / 2) + 'px', top: (pos.y - size / 2) + 'px', width: size + 'px', height: size + 'px',
      background: color, pointerEvents: 'none', zIndex: 61, mixBlendMode: 'screen',
      webkitMaskImage: `url(${url('', name)})`, maskImage: `url(${url('', name)})`,
      webkitMaskSize: 'contain', maskSize: 'contain', webkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
      webkitMaskPosition: 'center', maskPosition: 'center'
    });
    host.appendChild(node);
    const dx = opts.dx || 0, dy = opts.dy || 0, spin = opts.spin ?? 0;
    node.animate([
      { transform: `translate(0,0) scale(${opts.from ?? .2}) rotate(0deg)`, opacity: 0 },
      { transform: `translate(${dx * .5}px,${dy * .5}px) scale(${(opts.to ?? 1.2) * .8}) rotate(${spin * .5}deg)`, opacity: 1, offset: .3 },
      { transform: `translate(${dx}px,${dy}px) scale(${opts.to ?? 1.2}) rotate(${spin}deg)`, opacity: 0 }
    ], { duration: ms, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    track(node, ms);
  }

  function sparkleBurst(pos, color, n = 9, spread = 90) {
    if (!pos || !canAnimate()) return;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * .5, d = spread * (.5 + Math.random() * .7);
      particle(pick(SPARK), pos, color, { size: 20 + Math.random() * 26, dx: Math.cos(a) * d, dy: Math.sin(a) * d, spin: (Math.random() - .5) * 240, to: 1.1, ms: 520 + Math.random() * 280 });
    }
  }

  // Vòng ma pháp: 2 lớp xoay ngược nhau + flare
  function magicCircle(pos, color = '#9fe8ff', size = 150) {
    if (!pos || !canAnimate()) return;
    particle('circle_05', pos, color, { size, from: .3, to: 1.25, spin: 120, ms: 900 });
    particle(pick(['magic_01', 'magic_03', 'magic_05']), pos, '#ffffff', { size: size * .8, from: .4, to: 1.1, spin: -200, ms: 850 });
    particle('flare_01', pos, color, { size: size * 1.3, from: .2, to: 1, ms: 600 });
  }

  const colorOf = (c) => ELEMENT_COLOR[c?.element] || '#ffe39b';

  // ----- các sự kiện -----
  function onSummon(target, extraCardId) {
    const p = centerOf(target); if (!p) return;
    const color = extraCardId ? '#c9a5ff' : '#9fe8ff';
    magicCircle(p, color, Math.min(170, p.w * 1.6));
    sparkleBurst(p, extraCardId ? '#e8d6ff' : '#ffe9a8', extraCardId ? 14 : 9, 80);
    if (extraCardId) { particle('star_05', p, '#e8d6ff', { size: 150, from: .3, to: 1.3, spin: 90, ms: 800 }); particle('flare_01', p, '#c9a5ff', { size: 200, from: .2, to: 1.1, ms: 700 }); }
  }

  function onAttack(args, cardLookup) {
    const [side, index, extra, tIndex, tExtra] = args;
    const defSide = side === 'player' ? 'enemy' : 'player';
    const dst = tIndex === null && !tExtra ? document.getElementById(defSide + 'Life') : slotEl(defSide, tIndex, tExtra);
    const p = centerOf(dst); if (!p) return;
    let c = null;
    try { const slot = extra ? duel[side].extra : duel[side].monsters[index]; c = cardLookup(slot?.id); } catch { /* bỏ qua */ }
    const color = colorOf(c);
    // Hiệu ứng mượt (vector/alpha), không dùng sprite pixel-art cho tấn công.
    const big = { Hỏa: ['flame_03', 'flame_05'], Thủy: ['magic_02', 'circle_03'], Phong: ['trace_02', 'spark_05'], Quang: ['star_06', 'light_02'], Ám: ['smoke_02', 'magic_04'], Cơ: ['circle_05', 'spark_03'] }[c?.element] || ['flare_01', 'spark_04'];
    particle('flare_01', p, color, { size: 190, from: .3, to: 1.1, ms: 460 });
    particle(big[0], p, color, { size: 150, from: .4, to: 1.25, spin: (Math.random() - .5) * 60, ms: 520 });
    particle(big[1], p, '#ffffff', { size: 110, from: .3, to: 1.05, spin: (Math.random() - .5) * 120, ms: 440 });
    particle(pick(SLASH), p, color, { size: 110, from: .5, to: 1.15, spin: (Math.random() - .5) * 40, ms: 420 });
    sparkleBurst(p, color, 8, 70);
  }

  function onActivate(kind) {
    const p = centerOf(document.querySelector('.board-frame')); if (!p) return;
    magicCircle(p, kind === 'trap' ? '#ff9ab8' : '#8fe8ff', 190);
    sparkleBurst(p, kind === 'trap' ? '#ffd0dc' : '#d8f6ff', 12, 110);
  }

  function onTrapFlip(side, index) {
    const p = centerOf(document.querySelectorAll('#' + side + 'Spells .field-slot')[index]); if (!p) return;
    particle('flare_01', p, '#ffd0dc', { size: 150, from: .3, to: 1.1, ms: 500 });
    magicCircle(p, '#ff9ab8', 110);
  }

  // ----- gắn vào memeFx (không đổi thứ tự / thời gian của hiệu ứng cũ) -----
  function install() {
    const fx = window.memeFx;
    if (!fx || fx.__packWrapped) return !!fx;
    const lookup = id => { try { return card(id); } catch { return null; } };
    const later = (ms, fn) => setTimeout(() => { try { if (canAnimate()) fn(); } catch (e) { console.warn('vfx-pack:', e); } }, ms);

    const origSummon = fx.summon, origAttack = fx.attack, origCard = fx.cardActivation, origFlip = fx.flipTrap;
    fx.summon = function (handIndex, zoneIndex, faceDown, name = 'player', extraCardId = null) {
      const target = zoneIndex === 'extra' ? document.getElementById(name + 'Extra') : document.querySelectorAll('#' + name + 'Monsters .field-slot')[zoneIndex];
      if (!faceDown) later(780, () => onSummon(target, extraCardId));
      return origSummon.apply(this, arguments);
    };
    fx.attack = function () {
      const args = [...arguments];
      later(560, () => onAttack(args, lookup));
      return origAttack.apply(this, arguments);
    };
    fx.cardActivation = function (index, kind = 'spell') {
      later(600, () => onActivate(kind));
      return origCard.apply(this, arguments);
    };
    if (typeof origFlip === 'function') {
      fx.flipTrap = function (side, index) {
        later(200, () => onTrapFlip(side, index));
        return origFlip.apply(this, arguments);
      };
    }
    fx.__packWrapped = true;
    return true;
  }

  preload();
  if (!install()) window.addEventListener('load', install);

  window.memeVfxPack = { SHEETS, playSheet, particle, sparkleBurst, magicCircle, install, get live() { return live; } };
})();
