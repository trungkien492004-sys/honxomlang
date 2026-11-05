// Vòng xoay chọn đấu sĩ (kiểu mặt đồng hồ Omnitrix): vuốt/kéo ngang, mũi tên ‹ ›, phím ←/→ hoặc cuộn chuột.
// Thẻ ở giữa = nhân vật đang chọn (gọi chooseHero). Ảnh AI tuỳ chỉnh: assets/characters/<code>.png (xem art-studio.html).
(() => {
  if (window.memeHeroStage) return;
  const roster = document.getElementById('heroRoster');
  const section = roster?.closest('.lobby-roster');
  const picker = section?.querySelector('.hero-picker');
  if (!roster || !section || !picker) return;

  const CHAR_DIR = 'assets/characters/';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cache = new Map();
  const probe = code => cache.has(code) ? Promise.resolve(cache.get(code)) : new Promise(res => {
    const i = new Image();
    i.onload = () => { cache.set(code, true); res(true); };
    i.onerror = () => { cache.set(code, false); res(false); };
    i.src = CHAR_DIR + code + '.png';
  });

  const stage = document.createElement('div');
  stage.className = 'hero-stage';
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-label', 'Vòng xoay chọn đấu sĩ. Vuốt ngang hoặc dùng mũi tên để đổi nhân vật.');
  stage.tabIndex = 0;
  stage.innerHTML = '<div class="hs-glow"></div><div class="hs-ring"></div><div class="hs-ring r2"></div>' +
    '<div class="hs-dial"></div><div class="hs-fx"></div>' +
    '<button type="button" class="hs-arrow hs-prev" aria-label="Đấu sĩ trước">‹</button>' +
    '<button type="button" class="hs-arrow hs-next" aria-label="Đấu sĩ kế tiếp">›</button>' +
    '<div class="hs-label" aria-live="polite"><b></b><small></small></div><div class="hs-dots"></div>';
  section.insertBefore(stage, picker);
  section.classList.add('has-dial');
  const dial = stage.querySelector('.hs-dial'), fx = stage.querySelector('.hs-fx'), dots = stage.querySelector('.hs-dots');
  const label = stage.querySelector('.hs-label');

  for (let i = 0; i < 14; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--x', ((Math.random() - .5) * 240).toFixed(0) + 'px');
    p.style.setProperty('--d', (2.6 + Math.random() * 2.2).toFixed(1) + 's');
    p.style.setProperty('--dl', (Math.random() * 3).toFixed(1) + 's');
    p.style.left = (28 + Math.random() * 44).toFixed(0) + '%';
    fx.appendChild(p);
  }

  let items = [];          // [{id, el, h}]
  let index = 0, pos = 0;  // pos: vị trí thực (có phần lẻ khi đang kéo)
  const A = 38, R = 190;   // góc giữa 2 thẻ, bán kính vòng

  function heroOf(btn) { try { return window.getHero ? getHero(Number(btn.dataset.hero)) : null; } catch { return null; } }

  function build() {
    const tags = [...roster.querySelectorAll('.hero-tag')];
    dial.innerHTML = ''; dots.innerHTML = '';
    items = tags.map((btn, i) => {
      const h = heroOf(btn), src = btn.querySelector('.hero-figure');
      const el = document.createElement('div');
      el.className = 'hs-card'; el.dataset.i = i;
      const art = src ? src.cloneNode(false) : document.createElement('span');
      art.className = (src ? src.className : '') + ' hs-art'; art.removeAttribute('aria-hidden');
      el.appendChild(art);
      el.insertAdjacentHTML('beforeend', '<div class="hs-shine"></div>');
      el.style.setProperty('--c', h?.color || '#ffd28c');
      dial.appendChild(el);
      const dot = document.createElement('i'); dots.appendChild(dot);
      if (h?.code) probe(h.code).then(ok => { if (ok) { art.classList.add('custom'); art.style.setProperty('background-image', `url(${CHAR_DIR}${h.code}.png)`, 'important'); const f = btn.querySelector('.hero-figure'); f?.style.setProperty('background-image', `url(${CHAR_DIR}${h.code}.png)`, 'important'); } });
      return { id: Number(btn.dataset.hero), btn, h, el, dot };
    });
    const sel = tags.findIndex(b => b.classList.contains('selected'));
    index = pos = sel >= 0 ? sel : 0;
    render(pos, false);
  }

  const wrap = d => { const n = items.length; if (!n) return 0; d = ((d % n) + n) % n; return d > n / 2 ? d - n : d; };

  function render(p, animate = true) {
    const n = items.length; if (!n) return;
    items.forEach((it, i) => {
      const d = wrap(i - p), ad = Math.abs(d);
      const vis = ad < 3.4;
      it.el.style.transition = animate && !drag ? '' : 'none';
      it.el.style.transform = `translate(-50%, -50%) rotateY(${(d * A).toFixed(2)}deg) translateZ(${R}px) scale(${(1 - Math.min(ad, 3) * .06).toFixed(3)})`;
      it.el.style.opacity = vis ? String(Math.max(.18, 1 - ad * .26).toFixed(2)) : '0';
      it.el.style.filter = ad < .5 ? 'none' : `brightness(${(1 - Math.min(ad, 3) * .2).toFixed(2)}) saturate(.85)`;
      it.el.style.zIndex = String(100 - Math.round(ad * 10));
      it.el.style.pointerEvents = vis ? 'auto' : 'none';
      it.el.classList.toggle('is-center', i === index);
      it.el.tabIndex = -1;
    });
  }

  function paintLabel() {
    const it = items[index]; if (!it) return;
    stage.style.setProperty('--hs-color', it.h?.color || '#ffd28c');
    label.querySelector('b').textContent = it.h?.name || it.btn.querySelector('b')?.textContent || '';
    label.querySelector('small').textContent = it.h ? `${it.h.icon} ${it.h.skill}` : '';
    items.forEach((x, i) => x.dot.classList.toggle('on', i === index));
  }

  function flash() {
    if (reduced) return;
    stage.classList.remove('swap'); void stage.offsetWidth; stage.classList.add('swap');
  }

  // Đặt nhân vật ở giữa; commit=true thì gọi chooseHero của game.
  function go(i, commit = true) {
    const n = items.length; if (!n) return;
    const target = ((i % n) + n) % n;
    // đi theo đường ngắn nhất để vòng xoay không quay ngược cả vòng
    pos = pos + wrap(target - pos);
    const changed = target !== index;
    index = target;
    render(pos, true); paintLabel();
    if (changed) { flash(); try { navigator.vibrate?.(8); } catch { /* bỏ qua */ } }
    if (commit && typeof window.chooseHero === 'function' && roster.querySelector('.hero-tag.selected')?.dataset.hero !== String(items[index].id)) {
      suppress = true; try { chooseHero(items[index].id); } finally { suppress = false; }
    }
  }
  let suppress = false;

  stage.querySelector('.hs-prev').addEventListener('click', e => { e.stopPropagation(); go(index - 1); });
  stage.querySelector('.hs-next').addEventListener('click', e => { e.stopPropagation(); go(index + 1); });
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { go(index - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { go(index + 1); e.preventDefault(); }
  });
  let wheelLock = 0;
  stage.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12 || Date.now() - wheelLock < 160) return;
    wheelLock = Date.now(); go(index + (d > 0 ? 1 : -1)); e.preventDefault();
  }, { passive: false });
  dots.addEventListener('click', e => { const i = [...dots.children].indexOf(e.target); if (i >= 0) go(i); });

  // Vuốt / kéo: thẻ chạy theo ngón tay, thả ra thì chốt vào thẻ gần nhất.
  let drag = null, moved = 0;
  const STEP = 78;
  dial.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    drag = { x: e.clientX, y: e.clientY, base: pos, id: e.pointerId, lock: false };
    moved = 0;
  });
  window.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.lock && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { drag.lock = true; dial.setPointerCapture?.(e.pointerId); stage.classList.add('dragging'); }
    if (!drag.lock) return;
    moved = Math.abs(dx);
    pos = drag.base - dx / STEP;
    render(pos, false);
    const near = Math.round(pos), n = items.length;
    const ni = ((near % n) + n) % n;
    if (ni !== index) { index = ni; paintLabel(); }
  });
  const end = e => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const was = drag.lock; drag = null; stage.classList.remove('dragging');
    if (was) { const target = Math.round(pos); pos = target; go(((target % items.length) + items.length) % items.length); }
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  // Bấm thẻ bên cạnh = xoay tới thẻ đó (không tính khi vừa kéo).
  dial.addEventListener('click', e => {
    if (moved > 8) { moved = 0; return; }
    const c = e.target.closest('.hs-card'); if (!c) return;
    const i = Number(c.dataset.i);
    if (i === index) flash(); else go(i);
  });

  // Đồng bộ khi nơi khác đổi nhân vật (khởi tạo, lưu trữ, bot…).
  new MutationObserver(() => {
    if (suppress || drag) return;
    const sel = roster.querySelector('.hero-tag.selected'); if (!sel) return;
    const i = items.findIndex(x => x.btn === sel);
    if (i >= 0 && i !== index) go(i, false);
  }).observe(roster, { subtree: true, attributes: true, attributeFilter: ['class'] });
  new MutationObserver(() => { build(); paintLabel(); }).observe(roster, { childList: true });

  build(); paintLabel();
  window.memeHeroStage = { go: i => go(i), get index() { return index; }, refresh: () => { build(); paintLabel(); }, probe };
})();
