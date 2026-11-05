// Giải đấu theo lịch: Vương Quốc Đấu Sĩ, Thành Phố Quyết Đấu, Kaiba Cup, Học Viện Duel.
// Mỗi tuần một giải, bắt đầu 20:00 (giờ VN) thứ Bảy. Đăng ký mở đúng 24 giờ trước giờ bắt đầu,
// khi vào game có thông báo. Thi đấu loại trực tiếp với bot; thắng từng vòng nhận thưởng, vô địch nhận thưởng lớn.
// Tiến độ lưu ở state.story.tourney (không thêm khóa gốc vì normalize() của meme_progress.js bỏ khóa lạ).
(function () {
  'use strict';

  const DAY = 86400000, WEEK = 7 * DAY;
  const FIRST_START = Date.UTC(2026, 10, 7, 13, 0); // Thứ Bảy 07/11/2026 20:00 UTC+7
  const REG_MS = DAY, LIVE_MS = DAY;

  // rounds: [tên đối thủ, biểu tượng, bộ bài bot]
  const EVENTS = [
    { id: 'duelist_kingdom', icon: '🏰', name: 'Vương Quốc Đấu Sĩ', sub: 'Giải của Pegasus — đảo Duelist Kingdom',
      color: '#c4b5fd', rounds: [['Weevil', '🐛', 'Pegasus · Kinh điển'], ['Rex Raptor', '🦖', 'Joey · Kinh điển'], ['Mai Valentine', '🦢', 'Mai · Kinh điển'], ['Pegasus', '👁️', 'Pegasus · Vương Quốc Hoạt Hình']],
      reward: { xu: 1500, dust: 80, t: { p2: 1 } }, perRound: 150 },
    { id: 'battle_city', icon: '🏙️', name: 'Thành Phố Quyết Đấu', sub: 'Giải Battle City — tranh ba Thần Bài',
      color: '#fcd34d', rounds: [['Bakura', '🎭', 'Yugi · Kinh điển'], ['Joey Wheeler', '🃏', 'Joey · Thời gian'], ['Seto Kaiba', '🐉', 'Kaiba · Kinh điển'], ['Marik', '☥', 'Yugi · Thần Osiris'], ['Yugi Muto', '⭐', 'Yugi · Ma Thuật Tối Thượng']],
      reward: { xu: 2500, dust: 120, t: { p2: 1, p3: 1 } }, perRound: 180 },
    { id: 'kaiba_cup', icon: '🏆', name: 'Kaiba Cup', sub: 'Giải của Tập đoàn Kaiba — vũ khí Rồng Trắng',
      color: '#7dd3fc', rounds: [['Kaiba Corp Elite', '🛡️', 'Kaiba · Phản công'], ['Zane Truesdale', '⚙️', 'Zane · Kinh điển'], ['Seto Kaiba', '🐉', 'Kaiba · Đỉnh Cao Mắt Xanh']],
      reward: { xu: 2000, dust: 100, t: { p2: 1 } }, perRound: 200 },
    { id: 'duel_academy', icon: '🎓', name: 'Giải Học Viện Duel', sub: 'Học Viện Duel — từ Judai đến Yusei, Yuma',
      color: '#86efac', rounds: [['Syrus', '🔧', 'Zane · Phản công'], ['Chazz', '🌪️', 'Joey · Phản công'], ['Yuma Tsukumo', '✨', 'Yuma · Kinh điển'], ['Yusei Fudo', '🏍️', 'Yusei · Kinh điển'], ['Judai Yuki', '🦸', 'Jaden · Anh Hùng Tối Thượng']],
      reward: { xu: 2800, dust: 140, t: { p3: 1 } }, perRound: 200 }
  ];

  // ---------- lịch ----------
  function occurrence(k) {
    const start = FIRST_START + k * WEEK;
    return { k, start, regOpen: start - REG_MS, end: start + LIVE_MS, ev: EVENTS[((k % EVENTS.length) + EVENTS.length) % EVENTS.length] };
  }
  function phaseOf(o, now) {
    if (now < o.regOpen) return 'upcoming';
    if (now < o.start) return 'register';
    if (now < o.end) return 'live';
    return 'ended';
  }
  // Các kỳ liên quan đến thời điểm now: kỳ trước (còn đang diễn ra) + hai kỳ tới.
  function current(now = Date.now()) {
    const k0 = Math.floor((now - FIRST_START) / WEEK);
    return [k0 - 1, k0, k0 + 1, k0 + 2].map(occurrence).filter(o => phaseOf(o, now) !== 'ended' || now - o.end < DAY).map(o => ({ ...o, phase: phaseOf(o, now) }));
  }
  function fmtTime(ts) {
    const d = new Date(ts + 7 * 3600000);
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())} ${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}`;
  }
  function fmtLeft(ms) {
    const m = Math.max(0, Math.floor(ms / 60000)), h = Math.floor(m / 60);
    return h >= 1 ? `${h} giờ ${m % 60} phút` : `${m} phút`;
  }

  // ---------- tiến độ ----------
  const P = window.memeProgress;
  const store = () => {
    if (!P) return { entries: {} };
    const story = P.state.story && typeof P.state.story === 'object' ? P.state.story : (P.state.story = {});
    if (!story.tourney || typeof story.tourney !== 'object') story.tourney = {};
    if (!story.tourney.entries || typeof story.tourney.entries !== 'object') story.tourney.entries = {};
    return story.tourney;
  };
  const entryOf = k => store().entries[k] || null;
  function register(k, now = Date.now()) {
    const o = occurrence(k), phase = phaseOf(o, now);
    if (phase !== 'register' && phase !== 'live') return { ok: false, msg: phase === 'upcoming' ? 'Chưa mở đăng ký.' : 'Giải đã kết thúc.' };
    if (phase === 'live') return { ok: false, msg: 'Đã hết hạn đăng ký.' };
    const s = store();
    if (s.entries[k]) return { ok: false, msg: 'Bạn đã đăng ký giải này.' };
    s.entries[k] = { round: 0, status: 'registered', at: now };
    P?.save?.();
    return { ok: true };
  }
  function status(k, now = Date.now()) {
    const o = occurrence(k), e = entryOf(k), phase = phaseOf(o, now);
    if (!e) return phase === 'register' ? 'open' : phase === 'live' ? 'missed' : phase;
    if (e.status === 'champion') return 'champion';
    if (e.status === 'out') return 'out';
    if (phase === 'ended') return 'expired';
    return phase === 'live' ? 'playing' : 'waiting';
  }

  // ---------- thi đấu ----------
  let pending = null;
  const heroById = id => (window.MEME_HEROES || []).find(h => h.id === id);
  function deckReady() {
    try {
      if (typeof deckProblem === 'function' && deckProblem(deckList, extraDeckList)) { window.openDeckBuilder?.(); return false; }
    } catch { return false; }
    return true;
  }
  function preset(name) {
    return window.MEME_DECK_PRESETS?.[name] ? name : Object.keys(window.MEME_DECK_PRESETS || {})[0];
  }
  function startRound(k, now = Date.now()) {
    const o = occurrence(k), e = entryOf(k);
    if (!e || phaseOf(o, now) !== 'live' || e.status !== 'registered') return false;
    if (!deckReady()) return false;
    const r = o.ev.rounds[e.round];
    if (!r) return false;
    window.closeModal?.();
    const token = `tour-${now}-${k}-${e.round}`;
    pending = { k, round: e.round, token };
    window.startGame({ customBotDeck: preset(r[2]) });
    try { duel.tourneyToken = token; } catch { /* trận chưa tạo */ }
    return true;
  }
  const seen = new WeakSet();
  function handleFinish(won) {
    let d; try { d = duel; } catch { return null; }
    if (!d || typeof d !== 'object' || seen.has(d)) return null;
    seen.add(d);
    const job = pending && d.tourneyToken === pending.token ? pending : null;
    pending = null;
    if (!job) return null;
    const o = occurrence(job.k), e = entryOf(job.k);
    if (!e || e.status !== 'registered' || e.round !== job.round) return null;
    const lines = [];
    let title;
    if (won) {
      const gain = o.ev.perRound * (job.round + 1);
      P.addXu(gain); lines.push(`🪙 +${gain} Xu`);
      e.round += 1;
      if (e.round >= o.ev.rounds.length) {
        e.status = 'champion';
        const r = o.ev.reward;
        P.addXu(r.xu); lines.push(`🪙 +${r.xu} Xu (vô địch)`);
        if (r.dust) { P.addDust(r.dust); lines.push(`✦ +${r.dust} Bụi`); }
        for (const [kind, n] of Object.entries(r.t || {})) { P.addTicket(kind, n); lines.push(`🎟️ +${n} vé ${window.memePacks?.PACKS?.[kind]?.name || kind}`); }
        title = `🏆 VÔ ĐỊCH ${o.ev.name.toUpperCase()}!`;
      } else {
        title = `${o.ev.icon} Vào vòng ${e.round + 1} — ${o.ev.name}`;
        lines.push(`Đối thủ tiếp theo: ${o.ev.rounds[e.round][0]}`);
      }
    } else {
      e.status = 'out';
      title = `${o.ev.icon} Bị loại tại vòng ${job.round + 1}`;
      lines.push('Giải loại trực tiếp: hẹn bạn kỳ sau.');
    }
    P.save?.();
    refreshBadge();
    return { title, lines, lost: !won };
  }
  const J = window.memeJourney;
  if (J && typeof J.onDuelFinished === 'function' && !J.__tourneyWrapped) {
    const orig = J.onDuelFinished;
    J.onDuelFinished = function (won) {
      const base = orig.call(this, won);
      let extra = null;
      try { extra = handleFinish(!!won); } catch (e) { console.warn('Tournament:', e); }
      if (!extra) return base;
      if (!base) return extra;
      return { ...base, title: extra.title, lines: [...extra.lines, ...(base.lines || [])] };
    };
    J.__tourneyWrapped = true;
  }

  // ---------- giao diện ----------
  const $id = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function card(o, now) {
    const ev = o.ev, st = status(o.k, now), e = entryOf(o.k);
    let note = '', btn = '';
    if (st === 'open') {
      note = `Đăng ký đến ${fmtTime(o.start)} · còn ${fmtLeft(o.start - now)}`;
      btn = `<button type="button" class="primary-btn" data-reg="${o.k}">Đăng ký</button>`;
    } else if (st === 'waiting') {
      note = `Đã đăng ký · khai mạc ${fmtTime(o.start)} (còn ${fmtLeft(o.start - now)})`;
    } else if (st === 'playing') {
      note = `Vòng ${e.round + 1}/${ev.rounds.length}: gặp ${ev.rounds[e.round][0]} · giải đóng ${fmtTime(o.end)}`;
      btn = `<button type="button" class="primary-btn" data-play="${o.k}">⚔️ Vào vòng ${e.round + 1}</button>`;
    } else if (st === 'missed') {
      note = `Hết hạn đăng ký · giải diễn ra đến ${fmtTime(o.end)}`;
    } else if (st === 'champion') {
      note = '🏆 Bạn là nhà vô địch!';
    } else if (st === 'out') {
      note = `Bị loại tại vòng ${e.round + 1}`;
    } else if (st === 'expired') {
      note = 'Giải đã kết thúc';
    } else {
      note = `Mở đăng ký ${fmtTime(o.regOpen)} · khai mạc ${fmtTime(o.start)}`;
    }
    const prize = ev.reward;
    return `<div class="tour-card" style="--c:${ev.color}">
      <div class="tour-top"><i>${ev.icon}</i><div><strong>${esc(ev.name)}</strong><small>${esc(ev.sub)}</small></div></div>
      <div class="tour-rounds">${ev.rounds.map((r, i) => `<span class="${e && i < e.round ? 'done' : e && i === e.round && e.status === 'registered' ? 'cur' : ''}">${esc(r[1])} ${esc(r[0])}</span>`).join('')}</div>
      <div class="tour-prize">Vô địch: 🪙 ${prize.xu} · ✦ ${prize.dust}${Object.entries(prize.t || {}).map(([kk, n]) => ` · 🎟️ ${n} vé ${esc(window.memePacks?.PACKS?.[kk]?.name || kk)}`).join('')}</div>
      <div class="tour-foot"><small>${note}</small>${btn}</div>
    </div>`;
  }

  function open() {
    const now = Date.now();
    const list = current(now);
    window.showModal(`<div class="tour-modal">
      <div class="saga-head"><div><h2>🏆 Giải đấu</h2><p>Mỗi tuần một giải. Đăng ký mở 24 giờ trước khai mạc, thi đấu loại trực tiếp.</p></div></div>
      <div class="tour-list">${list.map(o => card(o, now)).join('') || '<p class="saga-note">Chưa có giải nào.</p>'}</div>
      <div class="saga-foot"><button type="button" class="primary-btn" id="tourClose">Đóng</button></div>
    </div>`);
    $id('tourClose').onclick = () => window.closeModal();
    document.querySelectorAll('[data-reg]').forEach(b => { b.onclick = () => { const r = register(Number(b.dataset.reg)); window.showActionNotice?.(r.ok ? 'Đăng ký thành công! Nhớ vào game lúc khai mạc.' : r.msg, 'Giải đấu'); refreshBadge(); open(); }; });
    document.querySelectorAll('[data-play]').forEach(b => { b.onclick = () => startRound(Number(b.dataset.play)); });
  }

  function badgeCount(now = Date.now()) {
    return current(now).filter(o => { const s = status(o.k, now); return s === 'open' || s === 'playing'; }).length;
  }
  function refreshBadge() {
    const b = $id('tournamentBtn')?.querySelector('.ticket-badge');
    if (!b) return;
    const n = badgeCount();
    b.textContent = n; b.hidden = n === 0;
  }
  function ensureButton() {
    if ($id('tournamentBtn')) return refreshBadge();
    const footer = document.querySelector('.lobby-footer');
    const host = footer || document.querySelector('.progress-actions');
    if (!host) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.id = 'tournamentBtn';
    btn.className = footer ? 'lobby-big-btn tournament' : 'progress-btn tournament';
    btn.innerHTML = '🏆 <span>Giải đấu</span><i class="ticket-badge" hidden>0</i>';
    btn.onclick = () => open();
    host.appendChild(btn);
    refreshBadge();
  }

  // ---------- thông báo khi vào game ----------
  function announce(now = Date.now()) {
    const msgs = [];
    for (const o of current(now)) {
      const st = status(o.k, now);
      if (st === 'open') msgs.push(`${o.ev.icon} ${o.ev.name}: mở đăng ký, hạn chót ${fmtTime(o.start)} (còn ${fmtLeft(o.start - now)}).`);
      else if (st === 'playing') msgs.push(`${o.ev.icon} ${o.ev.name} đang diễn ra — bạn đang ở vòng ${entryOf(o.k).round + 1}.`);
    }
    return msgs;
  }
  function showAnnouncement() {
    const msgs = announce();
    if (!msgs.length) return false;
    const key = 'meme-tourney-notified';
    const sig = msgs.join('|') + '|' + new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 13);
    try { if (sessionStorage.getItem(key) === sig) return false; sessionStorage.setItem(key, sig); } catch { /* bỏ qua */ }
    const box = document.createElement('div');
    box.id = 'tourAnnounce'; box.className = 'tour-announce'; box.setAttribute('role', 'status');
    box.innerHTML = `<b>🏆 Giải đấu</b><p>${msgs.map(esc).join('<br>')}</p><div><button type="button" id="tourAnnOpen">Xem giải</button><button type="button" id="tourAnnX" aria-label="Đóng">✕</button></div>`;
    document.body.appendChild(box);
    $id('tourAnnOpen').onclick = () => { box.remove(); open(); };
    $id('tourAnnX').onclick = () => box.remove();
    setTimeout(() => box.remove(), 15000);
    return true;
  }

  window.memeTournaments = {
    EVENTS, occurrence, phaseOf, current, status, register, startRound, open, announce, showAnnouncement,
    entryOf, badgeCount, refreshBadge, fmtTime, REG_MS, FIRST_START,
    get pending() { return pending ? { ...pending } : null; }
  };

  ensureButton();
  setTimeout(showAnnouncement, 1200);
  setInterval(refreshBadge, 60000);
})();
