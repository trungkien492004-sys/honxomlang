// Recent match history for the lobby. Results are stored locally per browser.
(function () {
  const KEY = 'meme-match-history';
  const MAX = 20;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

  const read = () => {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(list) ? list.filter(e => e && typeof e.ts === 'number') : [];
    } catch { return []; }
  };
  const write = list => { try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch {} };

  const heroName = id => {
    const hero = (window.MEME_HEROES || []).find(h => h.id === id);
    return hero ? hero.name.split(' / ')[0] : 'Đấu sĩ';
  };
  const timeText = ts => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'vừa xong';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' phút trước';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' giờ trước';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' ngày trước';
    return new Date(ts).toLocaleDateString('vi-VN');
  };
  const enemyNameOf = match => {
    if (!match) return 'Đối thủ';
    const named = match.ghostOpponent?.name || match.botOpponent?.name || document.getElementById('enemyName')?.textContent?.trim()?.replace(/\s*·\s*Máy$/, '');
    return named || heroName(match.enemy?.heroId);
  };

  function record(match) {
    if (!match || !match.finished) return null;
    const entry = {
      id: 'm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      ts: Date.now(),
      win: match.winner === 'player',
      rounds: match.round || 1,
      heroId: match.player?.heroId ?? 0,
      enemyHeroId: match.enemy?.heroId ?? 0,
      enemyName: enemyNameOf(match),
      enemyLp: match.enemy?.lp ?? 0,
      reason: match.finishReason || '',
      online: !!window.memeOnlineIsPlaying?.()
    };
    const list = read();
    list.unshift(entry);
    write(list);
    render();
    return entry.id;
  }

  function patch(id, fields) {
    if (!id) return;
    const list = read(), entry = list.find(e => e.id === id);
    if (!entry) return;
    Object.assign(entry, fields);
    write(list);
    if (!document.getElementById('lobby')?.classList.contains('hidden')) render();
  }

  function clear() {
    write([]);
    render();
  }

  const badge = entry => `<span class="history-result ${entry.win ? 'win' : 'loss'}">${entry.win ? 'THẮNG' : 'THUA'}</span>`;
  const meta = entry => `${entry.rounds} lượt · ${timeText(entry.ts)}${entry.rankDelta != null ? ` · <em class="${entry.rankDelta >= 0 ? 'up' : 'down'}">${entry.rankDelta > 0 ? '+' : ''}${entry.rankDelta} Elo</em>` : ''}`;
  const row = entry => `<div class="history-row">${badge(entry)}<div class="history-main"><b>${esc(heroName(entry.heroId))} vs ${esc(entry.enemyName)}</b><small>${meta(entry)}</small></div><span class="history-lp">${entry.win ? `Đối thủ còn ${entry.enemyLp} LP` : 'Thua trận'}</span></div>`;

  function render() {
    const host = document.getElementById('lobbyHistory');
    if (!host) return;
    const list = read();
    host.innerHTML = `<div class="history-head"><b>📜 Lịch sử đấu</b><span>${list.length ? list.length + ' trận gần đây' : 'Chưa có trận nào'}</span><button type="button" class="history-open" id="historyOpenBtn">${list.length ? 'Xem tất cả' : 'Trống'}</button></div>` +
      (list.length
        ? `<ol class="history-list">${list.slice(0, 4).map(entry => `<li>${row(entry)}</li>`).join('')}</ol><div class="history-actions"><button type="button" class="history-clear" id="historyClearBtn">Xoá lịch sử</button></div>`
        : `<p class="history-empty">Đánh xong một trận là kết quả được lưu tại đây.</p>`);
    document.getElementById('historyOpenBtn').onclick = () => openAll();
    const clearBtn = document.getElementById('historyClearBtn');
    if (clearBtn) clearBtn.onclick = () => openAll(true);
  }

  function openAll(confirmClear = false) {
    const list = read();
    const body = list.length
      ? `<ol class="history-modal-list">${list.map(entry => `<li>${row(entry)}</li>`).join('')}</ol>`
      : '<p class="history-empty">Chưa có trận nào. Vào trận để lưu lịch sử.</p>';
    const confirmText = confirmClear ? '<p class="history-confirm">Bấm “Xoá toàn bộ” để xoá lịch sử trên trình duyệt này.</p>' : '';
    showModal(`<h2>📜 Lịch sử đấu</h2><p class="history-sub">${list.length} trận gần nhất được lưu trên trình duyệt này.</p>${confirmText}${body}<div class="result-actions" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap"><button class="secondary-btn" id="historyWipeBtn" ${list.length ? '' : 'disabled'}>${confirmClear ? 'Xoá toàn bộ' : 'Xoá lịch sử'}</button><button class="primary-btn" id="historyCloseBtn">Đóng</button></div>`);
    document.getElementById('historyCloseBtn').onclick = () => closeModal();
    document.getElementById('historyWipeBtn').onclick = () => { clear(); closeModal(); };
  }

  window.memeMatchHistory = { record, patch, clear, render, openAll, list: read };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
})();
