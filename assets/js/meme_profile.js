// Duelist profile: character identity, paid rename and the item bag. Cloud sync itself stays automatic in meme_cloud.js.
(function () {
  'use strict';

  const P = window.memeProgress;
  if (!P) return;

  const RENAME_FEE_XU = 500;
  const POTION_XP = 150;

  const $id = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('vi-VN');

  function heroData() {
    const heroes = window.MEME_HEROES || [];
    let id = 0;
    try {
      const stored = JSON.parse(localStorage.getItem('xom-arcana-duelist-v1'));
      if (Number.isFinite(stored)) id = stored;
    } catch { /* default hero */ }
    return heroes[id] || heroes[0] || null;
  }

  function displayName() {
    const custom = P.state.profile.name;
    if (custom) return custom;
    const user = window.siteIdentity?.user;
    return user?.displayName || 'Đấu sĩ';
  }

  function playerId() {
    const user = window.siteIdentity?.user;
    if (user) return 'P_' + user.uid.slice(0, 10);
    try {
      let guest = localStorage.getItem('xom-guest-id');
      if (!guest) {
        guest = 'G' + Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem('xom-guest-id', guest);
      }
      return guest;
    } catch {
      return 'G-KHACH';
    }
  }

  function rankInfo() {
    const rating = Number.isFinite(Number(window.siteRank?.profile?.rating)) ? Number(window.siteRank.profile.rating) : null;
    const tier = document.querySelector('#rankIdentity .tier-pill')?.textContent?.trim() || '';
    return { rating, tier };
  }

  function accountLine() {
    const user = window.siteIdentity?.user;
    if (user) return `Google · ${esc(user.email || user.displayName || user.uid.slice(0, 10))}`;
    return 'Khách · đăng nhập Google để lưu tiến trình';
  }

  function portraitHTML(hero) {
    if (hero?.figure) return `<img class="profile-portrait" src="${esc(hero.figure)}" alt="${esc(hero.name)}">`;
    return `<span class="profile-portrait profile-portrait-icon" style="--hero-color:${esc(hero?.color || '#67e8f9')}">${hero?.icon || '🃏'}</span>`;
  }

  function factsHTML() {
    const st = P.state, hero = heroData(), rank = rankInfo();
    const need = P.xpNeed(st.level);
    const xpPercent = Math.min(100, Math.round((st.xp / need) * 100));
    const rows = [
      ['Cấp độ', `Lv.${st.level} · XP ${fmt(st.xp)}/${fmt(need)}`],
      ['Tiền', `🪙 ${fmt(st.xu)} Xu · ✦ ${fmt(st.dust)} bụi`],
      ['Vé Pack', `🎟️ ${st.tickets.p1} / ${st.tickets.p2} / ${st.tickets.p3}`],
      ['Bộ sưu tập', `${P.ownedUnique()}/${P.totalCollectible()} lá`],
      ['Điểm danh', st.login.streak ? `🔥 Chuỗi ${st.login.streak} ngày` : 'Chưa bắt đầu chuỗi'],
      ['Thành tích', `${fmt(st.stats.duels)} trận · ${fmt(st.stats.wins)} thắng · ${fmt(st.stats.packOpens)} pack`],
      ['Xếp hạng', rank.rating != null ? `🏆 ${rank.tier ? esc(rank.tier) + ' · ' : ''}${fmt(rank.rating)} Elo` : 'Chưa có Elo (đấu Rank để được tính)'],
      ['Tài khoản', accountLine()]
    ];
    return `<div class="profile-facts">${rows.map(([k, v]) => `<span><small>${esc(k)}</small><b>${v}</b></span>`).join('')}</div>
      <div class="profile-xp"><i style="width:${xpPercent}%"></i></div>`;
  }

  function itemsHTML() {
    const items = P.state.items;
    const row = (icon, name, count, action, attrs) => `<div class="profile-item"><span class="profile-item-icon">${icon}</span><div class="profile-item-body"><b>${esc(name)}</b><small>${count > 0 ? `Bạn có ${count}` : 'Chưa sở hữu · mua ở Cửa hàng'}</small></div><button type="button" class="secondary-btn" data-item-action="${action}" ${count > 0 ? '' : 'disabled'} ${attrs}>${count > 0 ? 'Dùng' : 'Trống'}</button></div>`;
    return `<div class="profile-items">
      ${row('📛', 'Thẻ Đổi Tên', items.rename, 'rename', `id="itemUseRename"`)}
      ${row('🧪', `Thuốc Kinh Nghiệm (+${POTION_XP} XP)`, items.potion, 'potion', `id="itemUsePotion"`)}
    </div>`;
  }

  function syncRowHTML() {
    const cloud = window.memeCloud;
    if (!cloud) return '';
    const labels = { off: 'Không dùng', guest: 'Chưa đăng nhập', loading: 'Đang tải…', syncing: 'Đang lưu…', synced: 'Đã lưu', loaded: 'Đã tải', error: 'Lỗi lưu' };
    return `<div class="profile-sync">
      <span>☁️ <b>${esc(labels[cloud.status] || '—')}</b></span>
      <button type="button" class="ghost-btn" id="profilePush">⬆️ Gửi ngay</button>
      <button type="button" class="ghost-btn" id="profilePull">⬇️ Tải về</button>
    </div>`;
  }

  function bodyHTML() {
    const st = P.state, hero = heroData();
    return `<div class="profile-modal">
      <header class="profile-head">
        ${portraitHTML(hero)}
        <div class="profile-title">
          <small>${esc(hero?.name || 'Đấu sĩ')} · ${esc(hero?.skill || '')}</small>
          <h2 id="profileNameText">${esc(displayName())}</h2>
          <span class="profile-id">🆔 ${esc(playerId())}</span>
        </div>
        <button type="button" class="ghost-btn" id="profileRenameBtn">✏️ Đổi tên · ${st.items.rename > 0 ? 'dùng thẻ' : fmt(RENAME_FEE_XU) + ' Xu'}</button>
      </header>
      <div id="profileRenameBox" class="profile-rename hidden">
        <input id="profileNameInput" maxlength="20" placeholder="Tên đấu sĩ mới (2–20 ký tự)" aria-label="Tên đấu sĩ mới">
        <button type="button" class="primary-btn" id="profileRenameGo">Xác nhận</button>
        <button type="button" class="secondary-btn" id="profileRenameCancel">Huỷ</button>
      </div>
      ${factsHTML()}
      <h3 class="profile-section">🎒 Túi vật phẩm</h3>
      ${itemsHTML()}
      ${syncRowHTML()}
      <div class="profile-foot">
        ${window.siteIdentity?.user ? '<button type="button" class="ghost-btn" id="profileLogout">Đăng xuất</button>' : '<button type="button" class="secondary-btn" id="profileLogin">🔑 Đăng nhập Google</button>'}
        <button type="button" class="primary-btn" id="profileClose">Đóng</button>
      </div>
    </div>`;
  }

  function open() {
    window.showModal(bodyHTML());
    const card = document.querySelector('#modal .modal-card');
    if (card) card.classList.add('profile-card');

    const renameBox = $id('profileRenameBox');
    $id('profileRenameBtn').onclick = () => {
      renameBox.classList.toggle('hidden');
      if (!renameBox.classList.contains('hidden')) $id('profileNameInput').focus();
    };
    $id('profileRenameCancel').onclick = () => renameBox.classList.add('hidden');
    $id('profileRenameGo').onclick = () => {
      const result = rename($id('profileNameInput').value);
      if (!result.ok) return window.showActionNotice(result.error, 'Đổi tên');
      window.showActionNotice?.(result.via === 'card' ? 'Đã dùng Thẻ Đổi Tên và cập nhật tên mới.' : `Đã trừ ${fmt(RENAME_FEE_XU)} Xu và cập nhật tên mới.`, 'Đổi tên');
      open();
      window.memePacks?.refresh?.();
    };
    const useRename = $id('itemUseRename');
    if (useRename) useRename.onclick = () => {
      renameBox.classList.remove('hidden');
      $id('profileNameInput').focus();
    };
    const usePotion = $id('itemUsePotion');
    if (usePotion) usePotion.onclick = () => {
      if (!P.useItem('potion')) return window.showActionNotice('Bạn không còn Thuốc Kinh Nghiệm.', 'Túi đồ');
      const level = P.addXp(POTION_XP);
      window.showActionNotice?.(level.levels ? `Lên ${level.levels} cấp! Hiện Lv.${level.level}.` : `+${POTION_XP} XP. Hiện Lv.${P.state.level}.`, 'Thuốc Kinh Nghiệm');
      open();
      window.memePacks?.refresh?.();
    };
    $id('profileClose').onclick = () => window.closeModal();
    const login = $id('profileLogin');
    if (login) login.onclick = () => window.siteIdentity.login().catch(() => window.showActionNotice('Không mở được đăng nhập Google.', 'Tài khoản'));
    const logout = $id('profileLogout');
    if (logout) logout.onclick = () => window.siteIdentity.logout();
    const push = $id('profilePush');
    if (push) push.onclick = async () => {
      const result = await window.memeCloud.pushNow();
      window.showActionNotice?.(result.ok ? 'Đã gửi tiến trình lên cloud.' : `Không gửi được: ${result.error || 'lỗi'}`, 'Đồng bộ');
      open();
    };
    const pull = $id('profilePull');
    if (pull) pull.onclick = async () => {
      const result = await window.memeCloud.pull({ force: true });
      window.showActionNotice?.(result.ok ? (result.adopted ? 'Đã tải tiến trình từ cloud.' : 'Cloud không có bản nào mới hơn.') : `Không tải được: ${result.error || 'lỗi'}`, 'Đồng bộ');
      open();
      window.memePacks?.refresh?.();
    };
  }

  function rename(rawName) {
    const name = String(rawName ?? '').trim();
    if (name.length < 2 || name.length > 20) return { ok: false, error: 'Tên cần 2–20 ký tự.' };
    if (name === displayName()) return { ok: false, error: 'Tên mới trùng tên hiện tại.' };
    const st = P.state;
    let via = 'xu';
    if (st.items.rename > 0) {
      P.useItem('rename');
      via = 'card';
    } else if (!P.spendXu(RENAME_FEE_XU)) {
      return { ok: false, error: `Cần ${fmt(RENAME_FEE_XU)} Xu hoặc 1 Thẻ Đổi Tên. Vào Cửa hàng để mua thẻ.` };
    }
    const result = P.setProfileName(name);
    if (!result.ok) {
      if (via === 'card') P.addItem('rename', 1);
      else P.addXu(RENAME_FEE_XU);
      return result;
    }
    return { ok: true, via, name: result.name };
  }

  function ensureButton() {
    if ($id('profileBtn')) return;
    const actions = document.querySelector('.progress-actions') || document.querySelector('.lobby-footer');
    if (!actions) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'profileBtn';
    btn.className = 'progress-btn profile';
    btn.innerHTML = '👤 <span>Hồ sơ</span>';
    btn.title = 'Thông tin nhân vật, túi đồ và đổi tên';
    btn.onclick = open;
    actions.appendChild(btn);
  }

  function refreshName() {
    const node = $id('profileNameText');
    if (node) node.textContent = displayName();
  }

  window.memeProfile = {
    RENAME_FEE_XU, POTION_XP,
    open, rename, displayName, playerId, heroData,
    ensureButton, refreshName
  };

  ensureButton();
})();
