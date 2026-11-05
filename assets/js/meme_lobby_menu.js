// Gom các nút phụ ở footer sảnh vào một nút "☰ Menu". "Vào trận" và "Đấu Rank nhanh" vẫn tách riêng.
// Các nút được DI CHUYỂN (giữ nguyên id + trình xử lý) nên mọi script khác vẫn hoạt động.
(function () {
  'use strict';

  const MENU_IDS = ['sagaBtn', 'journeyBtn', 'rankBoardBtn', 'shopBigBtn', 'lobbyDeckBtn'];
  const footer = document.querySelector('#lobby .lobby-footer');
  if (!footer || document.getElementById('lobbyMenuBtn')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'lobbyMenuBtn';
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '☰ <span>Menu</span><i class="ticket-badge" hidden>0</i>';
  btn.title = 'Truyền Kỳ, Hành trình, Bảng xếp hạng, Cửa hàng, Bộ bài';

  const panel = document.createElement('div');
  panel.id = 'lobbyMenuPanel';
  panel.hidden = true;
  panel.setAttribute('role', 'menu');

  footer.appendChild(btn);
  footer.appendChild(panel);

  const order = id => MENU_IDS.indexOf(id);

  function adopt(node) {
    if (!node || node.parentNode === panel) return;
    panel.appendChild(node);
    // giữ thứ tự cố định trong menu
    [...panel.children].sort((a, b) => order(a.id) - order(b.id)).forEach(n => panel.appendChild(n));
    refreshBadge();
  }

  function sweep() {
    for (const id of MENU_IDS) {
      const node = document.getElementById(id);
      if (node && node.parentNode !== panel) adopt(node);
    }
  }

  function refreshBadge() {
    let total = 0;
    panel.querySelectorAll('.ticket-badge').forEach(b => { if (!b.hidden) total += Number(b.textContent) || 0; });
    const badge = btn.querySelector('.ticket-badge');
    badge.textContent = total;
    badge.hidden = total === 0;
    btn.classList.toggle('has-actions', total > 0);
  }

  function setOpen(open) {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('open', open);
  }

  btn.addEventListener('click', e => { e.stopPropagation(); setOpen(panel.hidden); });
  // bấm vào một mục: đóng menu (mục vẫn chạy trình xử lý của nó)
  panel.addEventListener('click', e => { if (e.target.closest('button')) setTimeout(() => setOpen(false), 0); });
  document.addEventListener('click', e => { if (!panel.hidden && !e.target.closest('#lobbyMenuPanel, #lobbyMenuBtn')) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });

  // Nút do script khác thêm sau (site_rank, meme_shop...) cũng được gom; badge đổi thì cập nhật.
  new MutationObserver(sweep).observe(footer, { childList: true });
  new MutationObserver(refreshBadge).observe(panel, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'], characterData: true });

  sweep();
  refreshBadge();

  window.memeLobbyMenu = { open: () => setOpen(true), close: () => setOpen(false), get isOpen() { return !panel.hidden; }, refreshBadge, MENU_IDS };
})();
