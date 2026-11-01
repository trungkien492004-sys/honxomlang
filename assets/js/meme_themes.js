// Duel board ("sân đấu") themes: definitions, ownership, equipping and applying data-theme on #duel.
(function () {
  'use strict';

  const P = window.memeProgress;
  if (!P) return;

  const THEMES = [
    { id: 'default', icon: '🌀', name: 'Xóm Arena', desc: 'Sân thủy thủ mặc định của giải đấu.', price: 0 },
    { id: 'ankh', icon: '🏜️', name: 'Ai Cập Cổ Đại', desc: 'Bàn đá sa mạc, ánh vàng kim tự tháp.', price: 800 },
    { id: 'neon', icon: '🌃', name: 'Thành Phố Neon', desc: 'Sân cyberpunk tím hồng dưới ánh đèn neon.', price: 1200 },
    { id: 'volcano', icon: '🌋', name: 'Lò Núi Lửa', desc: 'Mặt bàn dung nham rực cháy, viền bazan.', price: 1500 },
    { id: 'tournament', icon: '🏆', name: 'Giải Đấu Chuyên Nghiệp', desc: 'Bàn thi đấu chính thức với viền xanh hoàng gia.', price: 2000 }
  ];
  const BY_ID = new Map(THEMES.map(t => [t.id, t]));

  function apply() {
    const el = document.getElementById('duel');
    if (!el) return;
    const active = P.state.themes.active;
    if (active && active !== 'default') el.dataset.theme = active;
    else delete el.dataset.theme;
  }

  function buy(id) {
    const theme = BY_ID.get(String(id));
    if (!theme) return { ok: false, error: 'Giao diện không tồn tại.' };
    if (P.ownsTheme(theme.id)) return { ok: false, error: 'Bạn đã sở hữu giao diện này.' };
    if (P.state.xu < theme.price) return { ok: false, error: `Cần ${theme.price} Xu, bạn mới có ${P.state.xu} Xu.` };
    if (!P.spendXu(theme.price)) return { ok: false, error: 'Không trừ được Xu.' };
    P.grantTheme(theme.id);
    return { ok: true, theme };
  }

  function equip(id) {
    id = String(id);
    if (!P.ownsTheme(id)) return { ok: false, error: 'Bạn chưa sở hữu giao diện này.' };
    P.setTheme(id);
    apply();
    return { ok: true };
  }

  window.memeThemes = { THEMES, apply, buy, equip };

  apply();
})();
