// Nền ngoài sân đấu (phần trong khung ô bài là sàn vector cố định) và mặt sau bài bán trong Cửa hàng. Mỗi người chơi tự mua và tự chọn.
// Sân lưu ở themes.active dạng "arena:<key>"; mặt sau bài lưu trong themes.owned: "back:<key>" = đã mua, "backon:<key>" = đang dùng,
// vì normalize() của meme_progress.js bỏ khóa lạ. Mặc định (không chọn gì) dùng ảnh theo đấu sĩ, miễn phí.
(function () {
  'use strict';
  const P = window.memeProgress;
  if (!P) return;

  const arena = (key, name, price, dir = 'arenas') => ({ key, id: 'arena:' + key, name, price, file: `assets/memecard/${dir}/${key}.webp` });
  const back = (key, name, price) => ({ key, id: 'back:' + key, name, price, file: `assets/memecard/backs/${key}.webp` });
  const ARENAS = [
    arena('jaden', 'Trấn Đèn Lồng', 600), arena('yusei', 'Sân Hoa Đêm', 600), arena('chazz', 'Hồ Đêm Cổ Thụ', 600), arena('s_castle', 'Thành Trời Xanh', 600), arena('s_isles', 'Đảo Bay Thác Mây', 600),
    arena('s_moon', 'Đền Trăng Tròn', 600), arena('s_ruins', 'Phế Tích Hoàng Hôn', 600), arena('s_teal', 'Vòng Phù Văn Ngọc', 600), arena('s_bamboo', 'Rừng Trúc Pháp Trận', 600),
    arena('destiny', 'Điện Phù Văn Vàng', 1200), arena('pegasus', 'Thành Bạch Kim', 1200), arena('kaiba', 'Lâu Đài Sao Xanh', 1200), arena('mai', 'Âm Dương Anh Đào', 1200), arena('zane', 'Hang Pha Lê', 1200), arena('s_float', 'Thiên Cung Hào Quang', 1200), arena('s_white', 'Thánh Đường Bạch Ngọc', 1200), arena('s_sea', 'Đấu Trường Biển Sâu', 1200),
    arena('yuma', 'Đô Thị Neon', 2500), arena('joey', 'Chiến Trường Dung Nham', 2500), arena('marik', 'Lâu Đài Trăng Máu', 2500), arena('jack', 'Thành Xiềng Lửa', 2500), arena('shark', 'Thủy Cung Cổ', 2500), arena('s_city', 'Thành Phố Pha Lê', 2500), arena('s_chain', 'Vực Xích Hư Không', 2500), arena('s_lava', 'Vòng Lửa Địa Ngục', 2500)
  ];
  const BACKS = [
    back('star', 'Sao Ngọc Lam', 400), back('ice', 'Tinh Thể Băng', 400), back('fire', 'Xoáy Lửa', 400), back('b_classic', 'Xoáy Hổ Phách', 400), back('b_tree', 'Cây Thế Giới', 400), back('b_teal', 'Pháp Trận Ngọc', 400),
    back('shadow', 'Bóng Tối Tím', 900), back('sakura', 'Anh Đào', 900), back('dragon', 'Long Ngọc', 900), back('b_shadow', 'Gai Bạc Tím', 900), back('b_blue', 'Tinh Tú Bạc', 900), back('b_red', 'Hồng Ngọc Đỏ', 900),
    back('gold', 'Hoàng Kim', 1800), back('galaxy', 'Thiên Hà', 1800), back('crimson', 'Mắt Máu', 1800), back('wings', 'Đôi Cánh Thiên Thần', 1800), back('b_gold', 'Cánh Vàng', 1800), back('b_galaxy', 'Tinh Vân Tím', 1800)
  ];
  const find = id => [...ARENAS, ...BACKS].find(x => x.id === id);
  const owns = id => P.ownsTheme(id);

  function buy(id) {
    const item = find(id);
    if (!item) return { ok: false, error: 'Vật phẩm không tồn tại.' };
    if (owns(id)) return { ok: false, error: 'Bạn đã sở hữu vật phẩm này.' };
    if (P.state.xu < item.price) return { ok: false, error: `Cần ${item.price.toLocaleString('vi-VN')} Xu, bạn mới có ${P.state.xu.toLocaleString('vi-VN')} Xu.` };
    if (!P.spendXu(item.price)) return { ok: false, error: 'Không trừ được Xu.' };
    P.grantTheme(id);
    return { ok: true, item };
  }
  const refresh = () => { window.memeThemes?.apply?.(); window.memeHeroStage?.applyDuelArt?.(); };
  function equip(id) {
    if (id === 'arena:auto') { P.setTheme('default'); refresh(); return { ok: true }; }
    const item = find(id);
    if (!item || !owns(id)) return { ok: false, error: 'Bạn chưa sở hữu vật phẩm này.' };
    if (id.startsWith('arena:')) P.setTheme(id);
    else setBack(item.key);
    refresh();
    return { ok: true };
  }
  function setBack(key) {
    const t = P.state.themes;
    t.owned = t.owned.filter(x => !x.startsWith('backon:'));
    if (key) t.owned.push('backon:' + key);
    P.save();
  }
  const equipBackAuto = () => { setBack(null); refresh(); return { ok: true }; };
  const activeBack = () => P.state.themes.owned.find(x => x.startsWith('backon:'))?.slice(7) || null;
  const activeArena = () => { const a = P.state.themes.active || ''; return a.startsWith('arena:') ? a.slice(6) : null; };
  const arenaFile = () => { const k = activeArena(); return ARENAS.find(x => x.key === k)?.file || null; };
  const backFile = () => { const k = activeBack(); return BACKS.find(x => x.key === k)?.file || null; };

  window.memeCosmetics = { ARENAS, BACKS, buy, equip, equipBackAuto, activeArena, activeBack, arenaFile, backFile };
})();
