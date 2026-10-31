// Collection album: browse every collectible card and buy missing ones with dust.
(function () {
  'use strict';

  const P = window.memeProgress, PK = window.memePacks;
  if (!P || !PK) return;

  const RANK = { N: 0, R: 1, SR: 2, UR: 3 };
  const BUY = { N: 100, R: 260, SR: 780, UR: 2000 };
  const HINT = { N: 'Thường', R: 'Hiếm', SR: 'Siêu hiếm', UR: 'Cực hiếm' };
  const STATUSES = [['all', 'Tất cả'], ['missing', 'Chưa có'], ['owned', 'Đã có'], ['complete', 'Đủ bản']];

  const $id = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('vi-VN');

  const filter = { rarity: 'all', status: 'all', q: '' };

  function catalog() {
    return (window.MEME_CARDS || []).filter(c => !c.uncollectible);
  }

  function cardById(id) {
    return catalog().find(c => c.id === id) || null;
  }

  function limitOf(card) {
    return Math.max(1, Number(card.max_copies) || 3);
  }

  function priceOf(card) {
    return BUY[card.rarity] || BUY.R;
  }

  function rows() {
    const q = filter.q.trim().toLowerCase();
    return catalog().filter(card => {
      if (filter.rarity !== 'all' && card.rarity !== filter.rarity) return false;
      const owned = P.copies(card.id), full = owned >= limitOf(card);
      if (filter.status === 'missing' && owned > 0) return false;
      if (filter.status === 'owned' && owned === 0) return false;
      if (filter.status === 'complete' && !full) return false;
      if (q && !`${card.name} ${card.id}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      const byRarity = RANK[b.rarity] - RANK[a.rarity];
      if (byRarity) return byRarity;
      const byOwned = (P.copies(b.id) > 0 ? 1 : 0) - (P.copies(a.id) > 0 ? 1 : 0);
      if (byOwned) return byOwned;
      return String(a.name).localeCompare(String(b.name), 'vi');
    });
  }

  function tile(card) {
    const owned = P.copies(card.id), limit = limitOf(card), price = priceOf(card);
    const full = owned >= limit, afford = P.state.dust >= price;
    const title = full ? 'Đã đủ bản' : afford ? `Mua 1 bản với ${fmt(price)} bụi` : `Cần ${fmt(price)} bụi`;
    return `<article class="album-card rarity-${card.rarity}${owned ? ' owned' : ''}${full ? ' full' : ''}">
      ${window.artHTML ? window.artHTML(card.id, 'album-art') : ''}
      <div class="album-info"><b title="${esc(card.name)}">${esc(card.name)}</b><small><span class="album-rarity" title="${esc(HINT[card.rarity] || '')}">${esc(card.rarity)}</span> ${owned}/${limit} bản</small></div>
      <button type="button" class="album-buy" data-buy="${esc(card.id)}" ${full || !afford ? 'disabled' : ''} title="${esc(title)}">${full ? 'Đủ' : `✦ ${fmt(price)}`}</button>
    </article>`;
  }

  function paintBody() {
    const body = $id('albumBody');
    if (!body) return;
    const list = rows();
    body.innerHTML = list.length ? `<div class="album-grid">${list.map(tile).join('')}</div>` : '<p class="album-empty">Không có thẻ nào khớp bộ lọc.</p>';
    const count = $id('albumCount');
    if (count) count.textContent = `${list.length} thẻ`;
    document.querySelectorAll('[data-buy]').forEach(btn => {
      btn.onclick = () => {
        const result = buy(btn.dataset.buy);
        if (!result.ok) return window.showActionNotice?.(result.error, 'Bộ sưu tập');
        paintBody();
      };
    });
  }

  function buy(id) {
    const card = cardById(id);
    if (!card) return { ok: false, error: 'Không tìm thấy thẻ.' };
    const limit = limitOf(card), owned = P.copies(card.id);
    if (owned >= limit) return { ok: false, error: `${card.name} đã đủ ${limit} bản.` };
    const price = priceOf(card);
    if (!P.spendDust(price)) return { ok: false, error: `Cần ${fmt(price)} bụi · bạn có ${fmt(P.state.dust)} bụi.` };
    P.grant(card.id, 1);
    PK.refresh();
    return { ok: true, id: card.id, name: card.name, price, copies: P.copies(card.id), limit };
  }

  function setFilter(next) {
    Object.assign(filter, next || {});
    open();
  }

  function open() {
    const total = catalog().length, owned = P.ownedUnique();
    window.showModal(`<div class="album-modal">
      <div class="album-head"><div><h2>📚 Bộ sưu tập</h2><p>Đã sở hữu <b>${owned}/${total}</b> lá · Dùng bụi mua thẳng thẻ còn thiếu.</p></div><div class="album-wallet"><span>✦ ${fmt(P.state.dust)} bụi</span><span id="albumCount"></span></div></div>
      <div class="album-filters">
        <div class="album-chips">${['all', 'N', 'R', 'SR', 'UR'].map(r => `<button type="button" data-rarity="${r}" class="${filter.rarity === r ? 'active' : ''}">${r === 'all' ? 'Mọi độ hiếm' : r}</button>`).join('')}</div>
        <div class="album-chips">${STATUSES.map(([key, label]) => `<button type="button" data-status="${key}" class="${filter.status === key ? 'active' : ''}">${label}</button>`).join('')}</div>
        <input id="albumSearch" type="search" placeholder="Tìm tên thẻ…" value="${esc(filter.q)}" aria-label="Tìm thẻ">
      </div>
      <div class="album-body" id="albumBody"></div>
      <div class="album-foot">
        <button type="button" id="albumShop" class="secondary-btn">📦 Cửa hàng Pack</button>
        <button type="button" id="albumClose" class="primary-btn">Đóng</button>
      </div>
    </div>`);
    const card = document.querySelector('#modal .modal-card');
    if (card) card.classList.add('album-modal-card');
    document.querySelectorAll('[data-rarity]').forEach(btn => {
      btn.onclick = () => { filter.rarity = btn.dataset.rarity; open(); };
    });
    document.querySelectorAll('[data-status]').forEach(btn => {
      btn.onclick = () => { filter.status = btn.dataset.status; open(); };
    });
    const search = $id('albumSearch');
    if (search) search.oninput = () => { filter.q = search.value; paintBody(); };
    $id('albumShop').onclick = () => PK.openShop();
    $id('albumClose').onclick = () => window.closeModal();
    paintBody();
  }

  window.memeAlbum = { BUY, HINT, catalog, rows, tile, buy, open, setFilter, priceOf, limitOf, get filter() { return { ...filter }; } };
})();
