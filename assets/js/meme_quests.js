// Daily and weekly quests. Progress lives in xom-progress-v1 and resets by period.
(function () {
  'use strict';

  const P = window.memeProgress;
  if (!P || !window.memePacks) return;

  const EVENTS = ['duel', 'win', 'pack', 'login'];
  const DEFS = {
    daily: [
      { id: 'duel3', icon: '⚔️', title: 'Ra sân 3 trận', event: 'duel', goal: 3, reward: { xu: 150 } },
      { id: 'win1', icon: '🏆', title: 'Thắng 1 trận', event: 'win', goal: 1, reward: { t: { p1: 1 } } },
      { id: 'pack1', icon: '📦', title: 'Mở 1 pack', event: 'pack', goal: 1, reward: { dust: 60 } }
    ],
    weekly: [
      { id: 'win5', icon: '🔥', title: 'Thắng 5 trận', event: 'win', goal: 5, reward: { xu: 500, t: { p2: 1 } } },
      { id: 'pack10', icon: '🎁', title: 'Mở 10 pack', event: 'pack', goal: 10, reward: { xu: 200, t: { p2: 1 } } },
      { id: 'login3', icon: '📅', title: 'Điểm danh 3 ngày', event: 'login', goal: 3, reward: { xu: 120, t: { p1: 1 } } }
    ]
  };

  const $id = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('vi-VN');
  let dirty = false;

  function weekKey(date = new Date()) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return window.memePacks.dayKey(d);
  }

  function bucket(kind) {
    const st = P.state;
    if (!st.quests || typeof st.quests !== 'object') { st.quests = {}; dirty = true; }
    let box = st.quests[kind];
    if (!box || typeof box !== 'object') { box = st.quests[kind] = {}; dirty = true; }
    if (!box.progress || typeof box.progress !== 'object') { box.progress = {}; dirty = true; }
    if (!box.claimed || typeof box.claimed !== 'object') { box.claimed = {}; dirty = true; }
    const period = kind === 'daily' ? window.memePacks.dayKey() : weekKey();
    if (box.period !== period) {
      box.period = period;
      box.progress = {};
      box.claimed = {};
      dirty = true;
    }
    return box;
  }

  function ensure() {
    bucket('daily');
    bucket('weekly');
    if (dirty) { P.save(); dirty = false; }
  }

  function progressOf(kind, def) {
    return Math.min(def.goal, Number(bucket(kind).progress[def.event]) || 0);
  }

  function claimableCount() {
    ensure();
    let n = 0;
    for (const kind of ['daily', 'weekly']) {
      for (const def of DEFS[kind]) {
        if (!bucket(kind).claimed[def.id] && progressOf(kind, def) >= def.goal) n += 1;
      }
    }
    return n;
  }

  function track(event, n = 1) {
    if (!EVENTS.includes(event)) return;
    let changed = false;
    for (const kind of ['daily', 'weekly']) {
      if (!DEFS[kind].some(def => def.event === event)) continue;
      const box = bucket(kind);
      box.progress[event] = Math.max(0, (Number(box.progress[event]) || 0) + n);
      changed = true;
    }
    if (changed) {
      P.save();
      refreshBadge();
    }
  }

  function rewardLabel(reward) {
    const parts = [];
    if (reward.xu) parts.push(`🪙 +${fmt(reward.xu)} Xu`);
    if (reward.dust) parts.push(`✦ +${fmt(reward.dust)} Bụi`);
    for (const [kind, n] of Object.entries(reward.t || {})) parts.push(`🎟️ +${n} vé ${window.memePacks.PACKS[kind].name}`);
    return parts;
  }

  function claim(kind, id) {
    const def = DEFS[kind]?.find(d => d.id === id);
    if (!def) return { ok: false, error: 'Nhiệm vụ không hợp lệ.' };
    const box = bucket(kind);
    if (box.claimed[id]) return { ok: false, error: 'Nhiệm vụ này đã nhận thưởng.' };
    if (progressOf(kind, def) < def.goal) return { ok: false, error: 'Chưa hoàn thành nhiệm vụ.' };
    box.claimed[id] = true;
    P.addXu(def.reward.xu || 0);
    P.addDust(def.reward.dust || 0);
    for (const [pack, n] of Object.entries(def.reward.t || {})) P.addTicket(pack, n);
    P.save();
    refreshBadge();
    return { ok: true, def };
  }

  function row(kind, def) {
    const box = bucket(kind), done = progressOf(kind, def), claimed = !!box.claimed[def.id], complete = done >= def.goal;
    const percent = Math.round(done * 100 / def.goal);
    return `<article class="quest-row${complete ? ' complete' : ''}${claimed ? ' claimed' : ''}">
      <span class="quest-icon" aria-hidden="true">${def.icon}</span>
      <div class="quest-body">
        <b>${esc(def.title)}</b>
        <div class="quest-track"><i style="width:${percent}%"></i></div>
        <small>${done}/${def.goal}</small>
      </div>
      <div class="quest-reward">${rewardLabel(def.reward).map(x => `<span>${x}</span>`).join('')}</div>
      <button type="button" class="quest-claim primary-btn" data-kind="${kind}" data-id="${def.id}" ${claimed || !complete ? 'disabled' : ''}>${claimed ? 'Đã nhận' : complete ? 'Nhận' : 'Chưa xong'}</button>
    </article>`;
  }

  function section(kind, title, note) {
    bucket(kind);
    const rows = DEFS[kind].map(def => row(kind, def)).join('');
    return `<section class="quest-section ${kind}">
      <header><h3>${title}</h3><small>${note}</small></header>
      <div class="quest-list">${rows}</div>
    </section>`;
  }

  function openQuests() {
    ensure();
    window.showModal(`<div class="quest-modal">
      <div class="quest-head"><div><h2>📋 Nhiệm vụ</h2><p>Hoàn thành để kiếm Xu, bụi và vé pack.</p></div><span class="quest-count">${claimableCount()} sẵn sàng nhận</span></div>
      ${section('daily', '☀️ Hằng ngày', 'Làm mới lúc 00:00 mỗi ngày')}
      ${section('weekly', '🗓️ Hằng tuần', 'Làm mới vào thứ Hai')}
      <div class="quest-actions"><button type="button" id="questShop" class="secondary-btn">📦 Mở Pack</button><button type="button" id="questClose" class="primary-btn">Đóng</button></div>
    </div>`);
    $id('questShop').onclick = () => window.memePacks.openShop();
    $id('questClose').onclick = () => window.closeModal();
    document.querySelectorAll('.quest-claim').forEach(btn => {
      btn.onclick = () => {
        const result = claim(btn.dataset.kind, btn.dataset.id);
        if (!result.ok) return window.showActionNotice?.(result.error, 'Nhiệm vụ');
        openQuests();
      };
    });
  }

  function refreshBadge() {
    ensure();
    const btn = $id('questBtn');
    if (!btn) return;
    const n = claimableCount();
    btn.classList.toggle('has-quests', n > 0);
    const badge = btn.querySelector('.ticket-badge');
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    btn.title = n ? `${n} nhiệm vụ có thể nhận` : 'Nhiệm vụ ngày và tuần';
  }

  function ensureButton() {
    if ($id('questBtn')) return refreshBadge();
    const actions = document.querySelector('.progress-actions');
    if (!actions) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'questBtn';
    btn.className = 'progress-btn quest has-quests';
    btn.innerHTML = '📋 <span>Nhiệm vụ</span><i class="ticket-badge" hidden>0</i>';
    btn.onclick = openQuests;
    actions.insertBefore(btn, actions.firstChild);
    refreshBadge();
  }

  window.memeQuests = {
    DEFS, track, claim, claimableCount, open: openQuests, refreshBadge, weekKey, ensure
  };

  ensure();
  ensureButton();
})();
