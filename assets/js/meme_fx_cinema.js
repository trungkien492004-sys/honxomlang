// Hiệu ứng điện ảnh cho trận đấu: bài vỡ + bụi bay vào Mộ, lá core tấn công (lóe sáng, khói, rung), cut-in mắt nhân vật.
// Chỉ thêm lớp hình ảnh, không đổi trạng thái trận. Tắt khi memeFx.mode === 'minimal', reduced-motion hoặc tab ẩn.
(() => {
  if (window.memeFxCinema) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fxMode = () => window.memeFx?.mode || 'full';
  const on = () => !reduced.matches && fxMode() !== 'minimal' && !document.hidden;
  const compact = () => fxMode() === 'compact';
  const MAX_NODES = 160;
  let nodes = 0, lastCut = 0;

  const host = () => {
    let h = document.getElementById('fxCinema');
    if (!h) { h = document.createElement('div'); h.id = 'fxCinema'; h.setAttribute('aria-hidden', 'true'); document.body.appendChild(h); }
    return h;
  };
  const el = (cls, css) => { const d = document.createElement('div'); d.className = cls; if (css) Object.assign(d.style, css); return d; };
  const put = (d, ms) => { host().appendChild(d); nodes += 1; setTimeout(() => { d.remove(); nodes -= 1; }, ms + 60); return d; };
  const lookup = id => { try { return card(id); } catch { return null; } };
  const monsterEl = (n, k) => k === 'extra' ? document.getElementById(n + 'Extra') : document.querySelectorAll('#' + n + 'Monsters .field-slot')[k];
  const spellEl = (n, i) => i === -1 ? document.getElementById(n + 'FieldSpell') : document.querySelectorAll('#' + n + 'Spells .field-slot')[i];
  const rectOf = e => { const r = e?.getBoundingClientRect(); return r && r.width > 4 ? r : null; };
  const pileTarget = (n, banish) => {
    const r = rectOf(document.getElementById(n + (banish ? 'BanishedBtn' : 'GraveBtn')));
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: n === 'player' ? innerHeight - 40 : 40 };
  };
  const artOf = c => c?.custom_image ? { backgroundImage: `url(${c.custom_image})` } : { backgroundImage: `linear-gradient(150deg, ${c?.art?.c1 || '#334'}, ${c?.art?.c2 || '#112'})` };

  // ----- Bài vỡ: nứt → mảnh văng → bụi bay vào Mộ -----
  function crack(r, color) {
    const svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 140'); svg.setAttribute('class', 'cin-crack');
    Object.assign(svg.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    const cx = 35 + Math.random() * 30, cy = 50 + Math.random() * 40;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + Math.random() * .4, mid = 20 + Math.random() * 25, end = 70 + Math.random() * 50;
      const p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', `M${cx} ${cy} L${cx + Math.cos(a + .25) * mid} ${cy + Math.sin(a + .25) * mid} L${cx + Math.cos(a) * end} ${cy + Math.sin(a) * end}`);
      p.setAttribute('stroke', color); p.setAttribute('stroke-width', 2.2); p.setAttribute('fill', 'none');
      svg.appendChild(p);
    }
    host().appendChild(svg); nodes += 1;
    svg.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: 330, delay: 60, fill: 'both' });
    setTimeout(() => { svg.remove(); nodes -= 1; }, 420);
  }

  function burst(slotRect, c, to) {
    // Ô trên sân rất nhỏ: phóng lá bài lên trước khi nổ để mảnh vỡ nhìn rõ.
    const big = Math.max(slotRect.width * 1.6, Math.min(innerWidth * .24, 150)), bigH = big * 1.42;
    const r = { left: slotRect.left + slotRect.width / 2 - big / 2, top: slotRect.top + slotRect.height / 2 - bigH / 2, width: big, height: bigH };
    const cols = 3, rows = 4, w = r.width / cols, h = r.height / rows, art = artOf(c), delay = 240;
    const box = el('cin-flash-card', { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', ...art });
    put(box, delay + 40).animate([{ filter: 'brightness(1)', transform: `scale(${(slotRect.width / big).toFixed(2)})` }, { filter: 'brightness(1.15)', transform: 'scale(1)', offset: .55 }, { filter: 'brightness(2.4)', transform: 'scale(1.03)' }], { duration: delay, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.3,1)' });
    crack(r, '#fff6d6');
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (nodes > MAX_NODES) break;
      const j = () => (Math.random() * 14).toFixed(0);
      const s = el('cin-shard', {
        left: r.left + x * w + 'px', top: r.top + y * h + 'px', width: w + 'px', height: h + 'px', ...art,
        backgroundSize: `${r.width}px ${r.height}px`, backgroundPosition: `${-x * w}px ${-y * h}px`,
        clipPath: `polygon(${j()}% ${j()}%, ${100 - j()}% ${j()}%, ${100 - j()}% ${100 - j()}%, ${j()}% ${100 - j()}%)`, opacity: 0
      });
      const ang = Math.atan2(y - (rows - 1) / 2 + .001, x - (cols - 1) / 2 + .001) + (Math.random() - .5) * .5;
      const d = r.width * (.7 + Math.random() * 1), rot = (Math.random() - .5) * 340;
      put(s, 900 + delay).animate([
        { opacity: 1, transform: 'translate(0,0) rotate(0)', offset: 0 },
        { opacity: 1, transform: `translate(${Math.cos(ang) * d * .55}px,${Math.sin(ang) * d * .55}px) rotate(${rot * .5}deg)`, offset: .45 },
        { opacity: 0, transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d + 22}px) rotate(${rot}deg) scale(.55)` }
      ], { duration: 720, delay, easing: 'cubic-bezier(.15,.7,.35,1)', fill: 'both' });
    }
    const count = compact() ? 10 : 34, tint = c?.art?.c1 || '#ffe2a6';
    for (let i = 0; i < count; i++) {
      if (nodes > MAX_NODES) break;
      const sx = r.left + Math.random() * r.width, sy = r.top + Math.random() * r.height, size = 3 + Math.random() * 5;
      const p = el('cin-dust', { left: sx + 'px', top: sy + 'px', width: size + 'px', height: size + 'px', background: i % 3 ? '#ffe9b8' : tint, opacity: 0 });
      const dx = to.x - sx, dy = to.y - sy, midX = dx * .45 + (Math.random() - .5) * 110, midY = dy * .35 - 30 - Math.random() * 70;
      const start = delay + 200 + Math.random() * 260, dur = 620 + Math.random() * 380;
      put(p, start + dur).animate([
        { opacity: 0, transform: 'translate(0,0) scale(.6)' },
        { opacity: 1, transform: `translate(${midX * .35}px,${midY * .5}px) scale(1.1)`, offset: .2 },
        { opacity: .9, transform: `translate(${midX}px,${midY}px) scale(.9)`, offset: .6 },
        { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(.25)` }
      ], { duration: dur, delay: start, easing: 'ease-in', fill: 'both' });
    }
    // Mộ loé nhẹ khi bụi tới.
    setTimeout(() => {
      if (!on()) return;
      const g = el('cin-grave-glow', { left: to.x - 34 + 'px', top: to.y - 34 + 'px' });
      put(g, 520).animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: .9, transform: 'scale(1)', offset: .35 }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 500, fill: 'forwards' });
    }, 980);
  }
  function shatter(n, zone, slot, banish) {
    try { if (!on()) return; const r = rectOf(monsterEl(n, zone)), c = lookup(slot?.id); if (r && c) burst(r, c, pileTarget(n, banish)); } catch (e) { console.warn('cinema:', e); }
  }
  function shatterSpell(n, index, slot, banish) {
    try { if (!on()) return; const r = rectOf(spellEl(n, index)), c = lookup(slot?.id); if (r && c) burst(r, c, pileTarget(n, banish)); } catch (e) { console.warn('cinema:', e); }
  }

  // ----- Lá core tấn công: lóe sáng + khói + rung -----
  const ELEMENT = { Hỏa: '#ff8159', Thủy: '#63eaff', Phong: '#8fffb9', Quang: '#fff2b8', Ám: '#d18cff', Cơ: '#9cd7ff' };
  function impact(pos, color, direct) {
    const f = el('cin-flash', { background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, #fff 0, ${color} 26%, transparent 72%)` });
    put(f, 420).animate([{ opacity: 0 }, { opacity: direct ? .95 : .8, offset: .12 }, { opacity: 0 }], { duration: 420, fill: 'forwards' });
    const pack = window.memeVfxPack;
    if (pack?.particle) for (let i = 0; i < (compact() ? 3 : 6); i++) {
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 80;
      pack.particle(['smoke_01', 'smoke_02', 'smoke_03'][i % 3], pos, i % 2 ? '#aab2c4' : color, { size: 140 + Math.random() * 90, from: .3, to: 1.5, dx: Math.cos(a) * d, dy: Math.sin(a) * d - 34, spin: (Math.random() - .5) * 90, ms: 1000 + Math.random() * 400 });
    }
    const board = document.querySelector('.board-frame');
    const k = direct ? 11 : 8;
    board?.animate([0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ transform: i === 7 ? 'translate(0,0)' : `translate(${(i % 2 ? -1 : 1) * k * (1 - i / 8)}px,${(i % 3 - 1) * k * .6 * (1 - i / 8)}px)` })), { duration: 440, easing: 'linear' });
  }
  function onAttack(side, index, extra, tIndex, tExtra) {
    const slot = extra ? duel[side].extra : duel[side].monsters[index], c = lookup(slot?.id);
    if (!c || !window.memeFx.isSpotlight(c)) return;
    const defSide = side === 'player' ? 'enemy' : 'player', direct = tIndex === null && !tExtra;
    const r = rectOf(direct ? document.getElementById(defSide + 'Life') : monsterEl(defSide, tExtra ? 'extra' : tIndex));
    if (!r) return;
    impact({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, ELEMENT[c.element] || '#ffe39b', direct);
    window.memeJaVoice?.say(duel[side].heroId, 'attack', c.id);
  }

  // ----- Cut-in mắt nhân vật khi lật bẫy / triệu hồi quái mạnh -----
  function cutIn(heroId, text, title) {
    if (!on()) return Promise.resolve();
    const now = Date.now(); if (now - lastCut < 1100) return Promise.resolve(); lastCut = now;
    let h = null; try { h = getHero(heroId); } catch { /* bỏ qua */ }
    const total = compact() ? 460 : 860, color = h?.color || '#ffd28c';
    const wrap = el('cin-cut'); wrap.style.setProperty('--cc', color);
    wrap.innerHTML = '<div class="cin-bar top"></div><div class="cin-bar bot"></div><div class="cin-strip"><div class="cin-eyes"></div><div class="cin-lines"></div></div><div class="cin-tag"><b></b><small></small></div>';
    wrap.querySelector('.cin-eyes').style.backgroundImage = `url(assets/characters/eyes/${h?.code || 'destiny'}.webp)`;
    wrap.querySelector('.cin-tag b').textContent = text;
    wrap.querySelector('.cin-tag small').textContent = title || '';
    put(wrap, total);
    const t = { duration: total, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' };
    wrap.querySelector('.cin-strip').animate([{ transform: 'scaleY(0)', opacity: 1 }, { transform: 'scaleY(1)', offset: .16 }, { transform: 'scaleY(1)', offset: .84 }, { transform: 'scaleY(0)', opacity: 1 }], t);
    wrap.querySelector('.cin-eyes').animate([{ transform: 'translateX(-5%) scale(1.14)' }, { transform: 'translateX(5%) scale(1.04)' }], { duration: total, fill: 'forwards' });
    wrap.querySelectorAll('.cin-bar').forEach(b => b.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: .14 }, { transform: 'scaleY(1)', offset: .86 }, { transform: 'scaleY(0)' }], { duration: total, fill: 'forwards' }));
    wrap.querySelector('.cin-tag').animate([{ opacity: 0, transform: 'translateX(60px) skewX(-10deg)' }, { opacity: 1, transform: 'translateX(0) skewX(-10deg)', offset: .2 }, { opacity: 1, offset: .82 }, { opacity: 0, transform: 'translateX(-40px) skewX(-10deg)' }], { duration: total, fill: 'forwards' });
    return new Promise(res => setTimeout(res, Math.round(total * .9)));
  }
  const SUMMON_KINDS = /summon|fusion|revive|synchro|xyz|ritual|special|flip|transform/i;
  const SKIP_KINDS = /^(set|cost|draw|position|attack-intent|negate|damage|destroy)$/;
  function cutFor(task) {
    const c = lookup(task?.cardId); if (!c || !task.owner || typeof duel === 'undefined' || !duel?.[task.owner]) return null;
    const heroId = duel[task.owner].heroId;
    if (c.card_type === 'Trap' && !SKIP_KINDS.test(task.kind || '')) return { heroId, text: '罠カード発動！', title: c.name, action: 'trap' };
    if (c.card_type === 'Monster' && SUMMON_KINDS.test(task.kind || '') && window.memeFx.isSpotlight(c) && (c.atk || 0) >= 2000) return { heroId, text: '召喚！', title: c.name, action: 'summon' };
    return null;
  }

  function install() {
    const fx = window.memeFx;
    if (!fx || fx.__cinemaWrapped) return !!fx;
    const origResolve = fx.resolveCard, origAttack = fx.attack;
    fx.resolveCard = async function (task, done) {
      try {
        const cut = cutFor(task);
        if (cut) await cutIn(cut.heroId, cut.text, cut.title);
      } catch (e) { console.warn('cinema:', e); }
      return origResolve.call(this, task, done);
    };
    fx.attack = function () {
      const args = [...arguments];
      if (on()) setTimeout(() => { try { if (on()) onAttack(...args.slice(0, 5)); } catch (e) { console.warn('cinema:', e); } }, compact() ? 260 : 600);
      return origAttack.apply(this, arguments);
    };
    fx.__cinemaWrapped = true;
    return true;
  }
  if (!install()) addEventListener('load', install);
  window.memeFxCinema = { shatter, shatterSpell, cutIn, impact, install, cutFor };
})();
