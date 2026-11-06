// Item shop: buy pack tickets, dust, XP potions and rename cards with Xu. Progress lives in xom-progress-v1.
(function () {
  'use strict';

  const P = window.memeProgress;
  if (!P) return;

  const ITEMS = [
    { id: 'ticket_p1', icon: '🎫', name: 'Vé Pack Tân Binh', desc: 'Mở 1 Pack Tân Binh · 5 thẻ, đảm bảo R trở lên.', price: 150, grant: { ticket: 'p1' } },
    { id: 'ticket_p2', icon: '🎟️', name: 'Vé Pack Cao Cấp', desc: 'Mở 1 Pack Cao Cấp · 5 thẻ, đảm bảo SR trở lên.', price: 450, grant: { ticket: 'p2' } },
    { id: 'ticket_p3', icon: '💎', name: 'Vé Pack Huyền Thoại', desc: 'Mở 1 Pack Huyền Thoại · 5 thẻ, đảm bảo 1 UR.', price: 1200, grant: { ticket: 'p3' } },
    { id: 'dust_bag', icon: '✦', name: 'Túi Bụi Ma Thuật', desc: '+200 bụi · bụi đổi được vé pack trong mục Mở Pack.', price: 300, grant: { dust: 200 } },
    { id: 'potion', icon: '🧪', name: 'Thuốc Kinh Nghiệm', desc: 'Vào túi đồ · dùng để nhận +150 XP.', price: 350, grant: { item: 'potion' } },
    { id: 'rename', icon: '📛', name: 'Thẻ Đổi Tên', desc: 'Vào túi đồ · đổi tên nhân vật miễn phí ở Hồ sơ.', price: 500, grant: { item: 'rename' } }
  ];

  const $id = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('vi-VN');

  function buy(id) {
    const item = ITEMS.find(x => x.id === id);
    if (!item) return { ok: false, error: 'Vật phẩm không tồn tại.' };
    if (P.state.xu < item.price) return { ok: false, error: `Cần ${fmt(item.price)} Xu, bạn mới có ${fmt(P.state.xu)} Xu.` };
    if (!P.spendXu(item.price)) return { ok: false, error: 'Không trừ được Xu.' };
    if (item.grant.ticket) P.addTicket(item.grant.ticket, 1);
    if (item.grant.dust) P.addDust(item.grant.dust);
    if (item.grant.item) P.addItem(item.grant.item, 1);
    P.save();
    window.memePacks?.refresh?.();
    return { ok: true, item };
  }

  function itemCard(item) {
    const st = P.state, afford = st.xu >= item.price;
    let owned = '';
    if (item.grant.ticket) owned = `Đang có: ${st.tickets[item.grant.ticket]}`;
    if (item.grant.item) owned = `Trong túi: ${st.items[item.grant.item]}`;
    return `<article class="shop-item${afford ? '' : ' poor'}">
      <span class="shop-item-icon" aria-hidden="true">${item.icon}</span>
      <div class="shop-item-body"><b>${esc(item.name)}</b><small>${esc(item.desc)}</small>${owned ? `<em>${esc(owned)}</em>` : ''}</div>
      <button type="button" class="primary-btn shop-buy-btn" data-shop="${item.id}" ${afford ? '' : 'disabled'}>🪙 ${fmt(item.price)}</button>
    </article>`;
  }

  function themeCard(theme) {
    const st = P.state, owned = st.themes.owned.includes(theme.id), active = st.themes.active === theme.id;
    const afford = st.xu >= theme.price;
    let action;
    if (active) action = `<button type="button" class="secondary-btn shop-buy-btn" disabled>✅ Đang dùng</button>`;
    else if (owned) action = `<button type="button" class="primary-btn shop-buy-btn" data-equip="${theme.id}">🎨 Trang bị</button>`;
    else action = `<button type="button" class="primary-btn shop-buy-btn" data-theme-buy="${theme.id}" ${afford ? '' : 'disabled'}>🪙 ${fmt(theme.price)}</button>`;
    return `<article class="shop-item theme-item${owned || afford ? '' : ' poor'}">
      <span class="shop-item-icon" aria-hidden="true">${theme.icon}</span>
      <div class="shop-item-body"><b>${esc(theme.name)}</b><small>${esc(theme.desc)}</small>${owned ? '<em>Đã sở hữu</em>' : ''}</div>
      ${action}
    </article>`;
  }

  // Nền sân đấu + mặt sau bài: lưới ảnh xem trước, gấp theo mục vì danh sách dài.
  function cosCard(item, isOn, kind) {
    const st = P.state, owned = st.themes.owned.includes(item.id), afford = st.xu >= item.price;
    let action;
    if (isOn) action = '<button type="button" class="secondary-btn cos-btn" disabled>Đang dùng</button>';
    else if (owned) action = `<button type="button" class="primary-btn cos-btn" data-cos-equip="${item.id}">Dùng</button>`;
    else action = `<button type="button" class="primary-btn cos-btn" data-cos-buy="${item.id}" ${afford ? '' : 'disabled'}>🪙 ${fmt(item.price)}</button>`;
    return `<article class="cos-item ${kind}${isOn ? ' on' : ''}"><img src="${item.file}" alt="${esc(item.name)}" loading="lazy" /><b>${esc(item.name)}</b>${action}</article>`;
  }
  function cosSection(title, kind, items, activeKey, autoAttr) {
    const count = items.filter(x => P.state.themes.owned.includes(x.id)).length;
    const auto = `<article class="cos-item ${kind} auto${activeKey ? '' : ' on'}"><span class="cos-auto">Theo đấu sĩ</span><b>Miễn phí</b>${activeKey ? `<button type="button" class="primary-btn cos-btn" ${autoAttr}>Dùng</button>` : '<button type="button" class="secondary-btn cos-btn" disabled>Đang dùng</button>'}</article>`;
    return `<details class="shop-section cos-section"><summary>${title} <small>Đã có ${count}/${items.length}</small></summary><div class="cos-grid ${kind}">${auto}${items.map(x => cosCard(x, activeKey === x.key, kind)).join('')}</div></details>`;
  }

  function open() {
    const st = P.state;
    const themes = window.memeThemes?.THEMES || [];
    window.showModal(`<div class="shop-modal">
      <div class="shop-head"><div><h2>🛒 Cửa Hàng Vật Phẩm</h2><p>Mua bằng Xu · thắng trận, điểm danh và Hành trình để kiếm thêm.</p></div>
        <div class="shop-wallet"><span>🪙 ${fmt(st.xu)} Xu</span><span>✦ ${fmt(st.dust)} bụi</span><span>🎟️ ${st.tickets.p1}/${st.tickets.p2}/${st.tickets.p3}</span></div></div>
      <div class="shop-grid">${ITEMS.map(itemCard).join('')}</div>
      ${themes.length > 1 ? `<div class="shop-section"><h3>🎨 Giao diện sân đấu</h3><div class="shop-grid">${themes.map(themeCard).join('')}</div></div>` : ''}
      ${window.memeCosmetics ? cosSection('Nền ngoài sân đấu', 'cos-arena', memeCosmetics.ARENAS, memeCosmetics.activeArena(), 'data-cos-equip="arena:auto"') + cosSection('Mặt sau lá bài', 'cos-back', memeCosmetics.BACKS, memeCosmetics.activeBack(), 'data-cos-back-auto') : ''}
      <div class="shop-foot">
        <button type="button" class="secondary-btn" id="shopPackBtn">📦 Mở Pack</button>
        <button type="button" class="secondary-btn" id="shopProfileBtn">👤 Hồ sơ · túi đồ</button>
        <button type="button" class="primary-btn" id="shopClose">Đóng</button>
      </div>
    </div>`);
    const card = document.querySelector('#modal .modal-card');
    if (card) card.classList.add('shop-card');
    document.querySelectorAll('[data-shop]').forEach(btn => {
      btn.onclick = () => {
        const result = buy(btn.dataset.shop);
        if (!result.ok) return window.showActionNotice(result.error, 'Chưa đủ Xu');
        open();
      };
    });
    document.querySelectorAll('[data-theme-buy]').forEach(btn => {
      btn.onclick = () => {
        const result = window.memeThemes.buy(btn.dataset.themeBuy);
        if (!result.ok) return window.showActionNotice(result.error, 'Chưa mua được');
        open();
      };
    });
    document.querySelectorAll('[data-equip]').forEach(btn => {
      btn.onclick = () => {
        const result = window.memeThemes.equip(btn.dataset.equip);
        if (!result.ok) return window.showActionNotice(result.error, 'Không trang bị được');
        open();
      };
    });
    const reopen = sectionIdx => { open(); document.querySelectorAll('.cos-section')[sectionIdx]?.setAttribute('open', ''); };
    const secOf = el => [...document.querySelectorAll('.cos-section')].indexOf(el.closest('.cos-section'));
    document.querySelectorAll('[data-cos-buy]').forEach(btn => {
      btn.onclick = () => {
        const i = secOf(btn), result = memeCosmetics.buy(btn.dataset.cosBuy);
        if (!result.ok) return window.showActionNotice(result.error, 'Chưa mua được');
        memeCosmetics.equip(btn.dataset.cosBuy); reopen(i);
      };
    });
    document.querySelectorAll('[data-cos-equip]').forEach(btn => {
      btn.onclick = () => {
        const i = secOf(btn), result = memeCosmetics.equip(btn.dataset.cosEquip);
        if (!result.ok) return window.showActionNotice(result.error, 'Không dùng được');
        reopen(i);
      };
    });
    document.querySelectorAll('[data-cos-back-auto]').forEach(btn => { btn.onclick = () => { const i = secOf(btn); memeCosmetics.equipBackAuto(); reopen(i); }; });
    $id('shopPackBtn').onclick = () => window.memePacks?.openShop?.();
    $id('shopProfileBtn').onclick = () => window.memeProfile?.open();
    $id('shopClose').onclick = () => window.closeModal();
  }

  function ensureButton() {
    if ($id('shopBigBtn')) return;
    const footer = document.querySelector('.lobby-footer');
    const play = $id('playBtn');
    if (!footer || !play) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'shopBigBtn';
    btn.className = 'lobby-big-btn shop';
    btn.innerHTML = '🛒 <span>Cửa hàng</span>';
    btn.title = 'Mua vật phẩm bằng Xu';
    btn.onclick = open;
    footer.insertBefore(btn, play);
  }

  window.memeShop = { ITEMS, buy, open, ensureButton };

  ensureButton();
})();
