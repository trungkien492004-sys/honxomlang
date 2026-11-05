// Sân khấu nhân vật: hiện đấu sĩ đang chọn trong thẻ 3D (nghiêng theo chuột/ngón tay, xoay một vòng khi đổi).
// Ảnh AI tuỳ chỉnh: bỏ vào assets/characters/<code>.png (code: destiny, kaiba, joey, pegasus, jaden, zane, mai, yuma, yusei).
// Không có ảnh thì dùng chân dung hiện tại. Xem hướng dẫn + prompt vẽ ở art-studio.html.
(() => {
  if (window.memeHeroStage) return;
  const roster = document.getElementById('heroRoster');
  const section = roster?.closest('.lobby-roster');
  const picker = section?.querySelector('.hero-picker');
  if (!roster || !section || !picker) return;

  const CHAR_DIR = 'assets/characters/';
  const cache = new Map(); // code -> true/false (ảnh tồn tại?)
  const probe = code => cache.has(code) ? Promise.resolve(cache.get(code)) : new Promise(res => {
    const i = new Image();
    i.onload = () => { cache.set(code, true); res(true); };
    i.onerror = () => { cache.set(code, false); res(false); };
    i.src = CHAR_DIR + code + '.png';
  });

  const stage = document.createElement('div');
  stage.className = 'hero-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML = '<div class="hs-glow"></div><div class="hs-ring"></div><div class="hs-ring r2"></div>' +
    '<div class="hs-card"><span class="hs-art"></span><div class="hs-shine"></div><div class="hs-label"><b></b><small></small></div></div><div class="hs-fx"></div>';
  section.insertBefore(stage, picker);
  const card = stage.querySelector('.hs-card'), label = stage.querySelector('.hs-label'), fx = stage.querySelector('.hs-fx');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (let i = 0; i < 14; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--x', ((Math.random() - .5) * 220).toFixed(0) + 'px');
    p.style.setProperty('--d', (2.6 + Math.random() * 2.2).toFixed(1) + 's');
    p.style.setProperty('--dl', (Math.random() * 3).toFixed(1) + 's');
    p.style.left = (30 + Math.random() * 40).toFixed(0) + '%';
    fx.appendChild(p);
  }

  let current = null;
  async function show(btn, animate) {
    const id = btn.dataset.hero;
    if (id === current) return;
    current = id;
    let h = null; try { h = window.getHero ? getHero(Number(id)) : null; } catch { /* bỏ qua */ }
    stage.style.setProperty('--hs-color', h?.color || getComputedStyle(btn).getPropertyValue('--hero-color') || '#ffd28c');
    const old = stage.querySelector('.hs-art');
    const src = btn.querySelector('.hero-figure');
    const art = src ? src.cloneNode(false) : document.createElement('span');
    art.className = (src ? src.className : '') + ' hs-art';
    art.removeAttribute('aria-hidden');
    old.replaceWith(art);
    label.querySelector('b').textContent = h?.name || btn.querySelector('b')?.textContent || '';
    label.querySelector('small').textContent = h ? `${h.icon} ${h.skill}` : '';
    if (animate && !reduced) { stage.classList.remove('swap'); void stage.offsetWidth; stage.classList.add('swap'); }
    if (h?.code && await probe(h.code) && current === id) {
      art.classList.add('custom'); art.style.setProperty('background-image', `url(${CHAR_DIR}${h.code}.png)`, 'important');
    }
  }

  function sync(animate) {
    const sel = roster.querySelector('.hero-tag.selected');
    if (sel) show(sel, animate);
  }
  new MutationObserver(() => sync(true)).observe(roster, { subtree: true, attributes: true, attributeFilter: ['class'] });
  new MutationObserver(() => { current = null; sync(false); tagArt(); }).observe(roster, { childList: true });
  sync(false);

  // Nghiêng 3D theo con trỏ.
  function tilt(e) {
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - .5), y = ((e.clientY - r.top) / r.height - .5);
    card.style.setProperty('--ry', (x * 44).toFixed(1) + 'deg');
    card.style.setProperty('--rx', (-y * 30).toFixed(1) + 'deg');
    card.querySelector('.hs-shine').style.setProperty('--sx', (120 - (x + .5) * 190).toFixed(0) + '%');
    stage.classList.add('is-hover');
  }
  function untilt() {
    stage.classList.remove('is-hover');
    card.style.removeProperty('--rx'); card.style.removeProperty('--ry');
  }
  if (!reduced) {
    stage.addEventListener('pointermove', tilt);
    stage.addEventListener('pointerleave', untilt);
    stage.addEventListener('pointerup', untilt);
  }
  stage.addEventListener('click', () => { if (reduced) return; stage.classList.remove('swap'); void stage.offsetWidth; stage.classList.add('swap'); });

  // Ảnh AI cũng thay cho chân dung nhỏ trong danh sách (nếu có file).
  window.memeHeroStage = { refresh: () => { current = null; sync(false); }, probe };
  window.memeHeroStage.tags = tagArt;
  function tagArt() {
    return Promise.all([...roster.querySelectorAll('.hero-tag')].map(async b => {
      let h = null; try { h = getHero(Number(b.dataset.hero)); } catch { return; }
      const fig = b.querySelector('.hero-figure');
      if (h?.code && fig && await probe(h.code)) fig.style.setProperty('background-image', `url(${CHAR_DIR}${h.code}.png)`, 'important');
    }));
  }
  tagArt();
})();
