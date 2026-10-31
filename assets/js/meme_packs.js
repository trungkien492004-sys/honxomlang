// Pack opening, daily login and the local economy. Everything stays in xom-progress-v1.
(function () {
  'use strict';

  const P = window.memeProgress;
  if (!P) return;

  const CATALOG = (window.MEME_CARDS || []).filter(c => !c.uncollectible);
  const BY_ID = new Map(CATALOG.map(c => [c.id, c]));
  const RANK = { N: 0, R: 1, SR: 2, UR: 3 };
  const DUST = { N: 5, R: 15, SR: 50, UR: 200 };
  const DAY = 86400000;

  const PACKS = {
    p1: {
      icon: '📦', name: 'Pack Tân Binh', tier: 'KHỞI ĐẦU', priceXu: 150, cards: 5,
      weights: { N: 55, R: 35, SR: 9, UR: 1 }, guarantee: 'R',
      pity: { rarity: 'SR', every: 10 },
      odds: 'N 55% · R 35% · SR 9% · UR 1%',
      note: 'Đảm bảo R trở lên · Bảo hiểm SR sau 10 pack'
    },
    p2: {
      icon: '🎁', name: 'Pack Cao Cấp', tier: 'NÂNG CAO', priceXu: 450, cards: 5,
      weights: { N: 15, R: 45, SR: 32, UR: 8 }, guarantee: 'SR',
      pity: { rarity: 'UR', every: 20 },
      odds: 'N 15% · R 45% · SR 32% · UR 8%',
      note: 'Đảm bảo SR trở lên · Bảo hiểm UR sau 20 pack'
    },
    p3: {
      icon: '💎', name: 'Pack Huyền Thoại', tier: 'TỐI THƯỢNG', priceXu: 1200, cards: 5,
      weights: { N: 0, R: 20, SR: 55, UR: 25 }, guarantee: 'UR',
      pity: null,
      odds: 'R 20% · SR 55% · UR 25%',
      note: 'Đảm bảo 1 UR mỗi pack'
    }
  };

  const LOGIN_REWARDS = [
    { xu: 100 }, { xu: 150 }, { xu: 200, t: { p1: 1 } }, { xu: 250 },
    { xu: 300, t: { p2: 1 } }, { xu: 400, t: { p1: 1 } }, { xu: 600, t: { p3: 1 } }
  ];
  const EXCHANGES = { p2: 600, p3: 1800 };

  const pools = { N: [], R: [], SR: [], UR: [] };
  for (const c of CATALOG) {
    const r = RANK[c.rarity] !== undefined ? c.rarity : 'R';
    pools[r].push(c);
  }

  let rng = Math.random;
  let lastReward = null;

  const $id = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('vi-VN');
  const cardName = id => BY_ID.get(id)?.name || id;
  const art = (id, cls) => (typeof window.artHTML === 'function' ? window.artHTML(id, cls) : '');

  function limit(id) {
    const c = BY_ID.get(id);
    return Math.max(1, Number(c?.max_copies) || (id === 'trung_tang_bat_ngo' ? 1 : 3));
  }

  function pickRarity(weights) {
    let roll = rng() * 100, acc = 0;
    for (const r of ['N', 'R', 'SR', 'UR']) {
      acc += weights[r] || 0;
      if (roll < acc) return r;
    }
    return 'UR';
  }

  function pickCard(rarity) {
    const pool = pools[rarity] || [];
    if (!pool.length) return null;
    const open = pool.filter(c => P.copies(c.id) < limit(c.id));
    const list = open.length ? open : pool;
    return list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
  }

  function rollCards(kind, def) {
    const st = P.state, rarities = [];
    for (let i = 0; i < def.cards; i++) rarities.push(pickRarity(def.weights));
    const minRank = RANK[def.guarantee];
    if (!rarities.some(r => RANK[r] >= minRank)) rarities[def.cards - 1] = def.guarantee;
    if (def.pity) {
      const hit = rarities.some(r => RANK[r] >= RANK[def.pity.rarity]);
      if (!hit && (st.pity[kind] || 0) + 1 >= def.pity.every) {
        rarities[def.cards - 1] = def.pity.rarity;
      }
    }
    const results = [];
    for (const rarity of rarities) {
      const c = pickCard(rarity);
      if (!c) continue;
      const before = P.copies(c.id);
      if (before < limit(c.id)) {
        P.grant(c.id, 1);
        results.push({ id: c.id, name: c.name, rarity: c.rarity, isNew: before === 0, gained: 1, dust: 0 });
      } else {
        P.addDust(DUST[c.rarity] || 5);
        results.push({ id: c.id, name: c.name, rarity: c.rarity, isNew: false, gained: 0, dust: DUST[c.rarity] || 5 });
      }
    }
    if (def.pity) {
      const hit = results.some(r => RANK[r.rarity] >= RANK[def.pity.rarity]);
      st.pity[kind] = hit ? 0 : (st.pity[kind] || 0) + 1;
    }
    return results;
  }

  function canAfford(kind) {
    const st = P.state, def = PACKS[kind];
    return !!def && (st.tickets[kind] > 0 || st.xu >= def.priceXu);
  }

  function open(kind) {
    const def = PACKS[kind];
    if (!def) return { ok: false, error: 'Pack không hợp lệ.' };
    const st = P.state;
    let paid;
    if (st.tickets[kind] > 0) {
      P.useTicket(kind); paid = { ticket: true };
    } else if (st.xu >= def.priceXu) {
      P.spendXu(def.priceXu); paid = { xu: def.priceXu };
    } else {
      return { ok: false, error: `Chưa đủ ${fmt(def.priceXu)} Xu và không còn vé ${def.name}.` };
    }
    const cards = rollCards(kind, def);
    st.stats.packOpens += 1;
    window.memeQuests?.track?.('pack');
    P.save();
    refresh();
    return { ok: true, kind, def, cards, paid };
  }

  function onDuelFinished(won) {
    const st = P.state;
    const xu = won ? 120 : 40, xp = won ? 40 : 15;
    P.addXu(xu);
    const level = P.addXp(xp);
    let bonusXu = 0, bonusTickets = 0;
    if (level.levels > 0) {
      bonusXu = level.levels * 250;
      bonusTickets = level.levels;
      P.addXu(bonusXu);
      P.addTicket('p1', bonusTickets);
    }
    st.stats.duels += 1;
    if (won) st.stats.wins += 1;
    window.memeQuests?.track?.('duel');
    if (won) window.memeQuests?.track?.('win');
    P.save();
    refresh();
    lastReward = { won, xu: xu + bonusXu, xp, level: level.level, levels: level.levels, tickets: bonusTickets };
    return lastReward;
  }

  function dayKey(date = new Date()) {
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function dayDiff(from, to) {
    const parse = key => {
      const [y, m, d] = key.split('-').map(Number);
      return new Date(y, m - 1, d, 12).getTime();
    };
    return Math.round((parse(to) - parse(from)) / DAY);
  }

  function rankReward(rating) {
    const r = Number(rating) || 0;
    if (r >= 2000) return { tier: 'Cao Thủ', tickets: { p3: 1 } };
    if (r >= 1800) return { tier: 'Kim Cương', tickets: { p1: 1, p2: 2 } };
    if (r >= 1600) return { tier: 'Bạch Kim', tickets: { p2: 2 } };
    if (r >= 1400) return { tier: 'Vàng', tickets: { p1: 1, p2: 1 } };
    if (r >= 1200) return { tier: 'Bạc', tickets: { p2: 1 } };
    if (r >= 1000) return { tier: 'Đồng', tickets: { p1: 1 } };
    return { tier: 'Tân Binh', tickets: { p1: 1 } };
  }

  function currentRating() {
    try {
      const r = Number(window.siteRank?.profile?.rating);
      return Number.isFinite(r) && r > 0 ? r : 1000;
    } catch {
      return 1000;
    }
  }

  function loginReward(streak) {
    return LOGIN_REWARDS[((Math.max(1, streak) - 1) % 7)];
  }

  function claimDaily(rating = currentRating()) {
    const today = dayKey(), login = P.state.login;
    if (login.lastDay === today) return { ok: false, already: true, streak: login.streak };
    const streak = login.lastDay && dayDiff(login.lastDay, today) === 1 ? login.streak + 1 : 1;
    const reward = loginReward(streak), rank = rankReward(rating);
    P.addXu(reward.xu || 0);
    for (const kind of ['p1', 'p2', 'p3']) {
      const n = (reward.t?.[kind] || 0) + (rank.tickets[kind] || 0);
      if (n) P.addTicket(kind, n);
    }
    P.setLogin(streak, today);
    window.memeQuests?.track?.('login');
    refresh();
    return { ok: true, streak, day: (streak - 1) % 7 + 1, login: reward, rank };
  }

  function rewardList(reward, rank) {
    const rows = [`🪙 +${fmt(reward.xu || 0)} Xu`];
    for (const [kind, n] of Object.entries(reward.t || {})) rows.push(`🎟️ +${n} vé ${PACKS[kind].name}`);
    for (const [kind, n] of Object.entries(rank?.tickets || {})) rows.push(`🎖️ Hạng ${esc(rank.tier)}: +${n} vé ${PACKS[kind].name}`);
    return rows;
  }

  function showDailyModal(result) {
    const st = P.state;
    const modalCard = document.querySelector('#modal .modal-card');
    if (modalCard) modalCard.classList.remove('pack-modal', 'pack-reveal-open');
    if (result.already) {
      const tomorrow = loginReward(st.login.streak + 1);
      const rank = rankReward(currentRating());
      window.showModal(`<div class="daily-modal"><h2>🔥 Chuỗi ${st.login.streak} ngày</h2>
        <p class="daily-sub">Hôm nay đã điểm danh. Quay lại vào ngày mai để nhận thêm quà!</p>
        <div class="daily-rewards"><span>Ngày mai: ${rewardList(tomorrow, null).map(esc).join(' · ')}</span><span>Quà theo rank ${esc(rank.tier)}: ${Object.entries(rank.tickets).map(([k, n]) => `+${n} vé ${PACKS[k].name}`).join(', ')}</span></div>
        <div class="daily-actions"><button id="dailyShop" class="primary-btn">📦 Mở Pack</button><button id="dailyClose" class="secondary-btn">Đóng</button></div></div>`);
      $id('dailyShop').onclick = openShop;
      $id('dailyClose').onclick = () => window.closeModal();
      return;
    }
    window.showModal(`<div class="daily-modal"><h2>🎁 Điểm danh ngày ${result.streak}</h2>
      <p class="daily-sub">Chuỗi đăng nhập ${result.streak} ngày · Quà càng về cuối tuần càng lớn.</p>
      <div class="daily-rewards">${rewardList(result.login, result.rank).map(x => `<span>${x}</span>`).join('')}</div>
      <div class="daily-actions"><button id="dailyShop" class="primary-btn">📦 Mở Pack</button><button id="dailyClose" class="secondary-btn">Đóng</button></div></div>`);
    $id('dailyShop').onclick = openShop;
    $id('dailyClose').onclick = () => window.closeModal();
  }

  function packCard(kind) {
    const st = P.state, def = PACKS[kind], tickets = st.tickets[kind] || 0, afford = canAfford(kind);
    const pity = def.pity ? `<span>Bảo hiểm ${def.pity.rarity}: ${st.pity[kind] || 0}/${def.pity.every}</span>` : '';
    const label = tickets > 0 ? `Mở bằng vé (${tickets})` : `Mở · ${fmt(def.priceXu)} Xu`;
    return `<article class="pack-card pack-${kind}">
      <div class="pack-art"><span class="pack-icon">${def.icon}</span><span class="pack-shine"></span><small>${esc(def.tier)}</small></div>
      <h3>${esc(def.name)}</h3>
      <p class="pack-odds">${esc(def.odds)}</p>
      <div class="pack-meta"><span>${def.cards} thẻ</span><span>${esc(def.note)}</span>${pity}</div>
      <div class="pack-cost"><span title="Giá Xu">🪙 ${fmt(def.priceXu)}</span><span title="Vé đang có">🎟️ ${tickets}</span></div>
      <button type="button" class="primary-btn pack-open-btn" data-pack="${kind}" ${afford ? '' : 'disabled'}>${label}</button>
    </article>`;
  }

  function openShop() {
    const st = P.state, owned = P.ownedUnique(), total = P.totalCollectible();
    const percent = total ? Math.round(owned * 100 / total) : 0;
    window.showModal(`<div class="pack-shop">
      <div class="pack-shop-head"><div><h2>📦 Mở Pack</h2><p class="pack-sub">Sưu tầm <b>${owned}/${total}</b> lá · Chơi trận, điểm danh và leo rank để kiếm thêm pack.</p></div><div class="pack-wallet"><span>🪙 ${fmt(st.xu)} Xu</span><span>✦ ${fmt(st.dust)} bụi</span><span>🎟️ ${st.tickets.p1}/${st.tickets.p2}/${st.tickets.p3}</span></div></div>
      <div class="collection-track"><i style="width:${percent}%"></i><small>${percent}%</small></div>
      <div class="pack-grid">${['p1', 'p2', 'p3'].map(packCard).join('')}</div>
      <div class="pack-exchange"><h3>✦ Đổi bụi ma thuật</h3><p>Thẻ trùng khi đã đủ bản tự chuyển thành bụi.</p><div class="exchange-actions">
        ${Object.entries(EXCHANGES).map(([kind, cost]) => `<button type="button" class="secondary-btn" data-exchange="${kind}" ${st.dust >= cost ? '' : 'disabled'}>${fmt(cost)} ✦ → 1 vé ${PACKS[kind].name}</button>`).join('')}
      </div></div>
      <p class="pack-login-note">🎁 Quà đăng nhập hằng ngày được nhận ở thanh tiến trình phía trên sảnh.</p>
    </div>`);
    const card = document.querySelector('#modal .modal-card');
    if (card) card.classList.add('pack-modal');
    if (card) card.classList.remove('pack-reveal-open');
    document.querySelectorAll('[data-pack]').forEach(btn => {      btn.onclick = () => {
        const result = open(btn.dataset.pack);
        if (!result.ok) return window.showActionNotice(result.error, 'Chưa đủ tài nguyên');
        showReveal(result);
      };
    });
    document.querySelectorAll('[data-exchange]').forEach(btn => {
      btn.onclick = () => {
        const kind = btn.dataset.exchange, cost = EXCHANGES[kind];
        if (!P.spendDust(cost)) return window.showActionNotice('Không đủ bụi để đổi vé.', 'Thiếu bụi');
        P.addTicket(kind, 1);
        refresh();
        openShop();
      };
    });
  }

  function showReveal(result) {
    const st = P.state, owned = P.ownedUnique(), total = P.totalCollectible();
    const paidLabel = result.paid.ticket ? 'Mở bằng vé' : `Mở · ${fmt(result.paid.xu)} Xu`;
    const cards = result.cards.map((c, i) => `<article class="reveal-card rarity-${c.rarity}" style="--i:${i}">
      <span class="reveal-glow"></span>${art(c.id, 'reveal-art')}
      <span class="reveal-rarity">${c.rarity}</span>
      <b>${esc(c.name)}</b>
      <small>${c.isNew ? '<em class="is-new">MỚI</em>' : c.dust ? `Trùng · +${c.dust} ✦` : '+1 bản'}</small>
    </article>`).join('');
    const again = canAfford(result.kind);
    window.showModal(`<div class="pack-open">
      <h2 class="pack-open-title">${result.def.icon} ${esc(result.def.name)}</h2>
      <p class="pack-open-sub">${paidLabel} · ${result.cards.filter(c => c.isNew).length} lá mới</p>
      <div class="pack-reveal-grid">${cards}</div>
      <div class="pack-open-foot">
        <span class="pack-collection">🃏 ${owned}/${total}</span>
        <button id="packAgain" class="primary-btn" ${again ? '' : 'disabled'}>${canAfford(result.kind) ? 'Mở tiếp' : 'Hết vé & Xu'}</button>
        <button id="packBack" class="secondary-btn">← Cửa hàng</button>
        <button id="packClose" class="secondary-btn">Đóng</button>
      </div>
    </div>`);
    const card = document.querySelector('#modal .modal-card');
    if (card) card.classList.add('pack-modal', 'pack-reveal-open');
    $id('packAgain').onclick = () => {
      const next = open(result.kind);
      if (!next.ok) return window.showActionNotice(next.error, 'Chưa đủ tài nguyên');
      showReveal(next);
    };
    $id('packBack').onclick = openShop;
    $id('packClose').onclick = () => window.closeModal();
  }

  function ticketTotal() {
    const t = P.state.tickets;
    return (t.p1 || 0) + (t.p2 || 0) + (t.p3 || 0);
  }

  function refresh() {
    const st = P.state;
    const set = (id, text) => { const n = $id(id); if (n) n.textContent = text; };
    set('progressLevel', st.level);
    set('progressXu', fmt(st.xu));
    set('progressDust', fmt(st.dust));
    set('progressTickets', `${st.tickets.p1}/${st.tickets.p2}/${st.tickets.p3}`);
    const bar = $id('progressXpBar');
    if (bar) {
      const need = P.xpNeed(st.level);
      bar.style.width = `${Math.min(100, Math.round((st.xp / need) * 100))}%`;
      bar.parentElement?.setAttribute('title', `XP ${fmt(st.xp)}/${fmt(need)}`);
    }
    const streak = $id('progressStreak');
    if (streak) {
      streak.hidden = !st.login.streak;
      set('progressStreakValue', st.login.streak);
    }
    const claimed = st.login.lastDay === dayKey();
    const daily = $id('dailyBtn');
    if (daily) {
      daily.classList.toggle('claimed', claimed);
      daily.classList.toggle('unclaimed', !claimed);
      daily.textContent = claimed ? '✅ Đã điểm danh' : '🎁 Quà ngày';
      daily.title = claimed ? `Chuỗi ${st.login.streak} ngày · mai quay lại` : 'Nhận quà đăng nhập hôm nay';
    }
    const pack = $id('packBtn');
    if (pack) {
      const total = ticketTotal();
      pack.classList.toggle('has-tickets', total > 0);
      const badge = pack.querySelector('.ticket-badge');
      if (badge) { badge.textContent = total; badge.hidden = total === 0; }
    }
    window.memeQuests?.refreshBadge?.();
  }

  function ensureHud() {
    if ($id('progressStrip')) return refresh();
    const lobby = $id('lobby');
    if (!lobby) return;
    const strip = document.createElement('div');
    strip.id = 'progressStrip';
    strip.className = 'progress-strip';
    strip.innerHTML = `<div class="progress-chips">
        <span class="progress-chip lv" title="Cấp độ tài khoản"><b>Lv.<span id="progressLevel">1</span></b><i class="xp-track"><span id="progressXpBar"></span></i></span>
        <span class="progress-chip xu" title="Xu kiếm từ trận đấu, điểm danh và nhiệm vụ">🪙 <b id="progressXu">0</b><small>Xu</small></span>
        <span class="progress-chip dust" title="Bụi ma thuật từ thẻ trùng, dùng đổi vé">✦ <b id="progressDust">0</b><small>Bụi</small></span>
        <span class="progress-chip tickets" title="Vé Pack Tân Binh / Cao Cấp / Huyền Thoại">🎟️ <b id="progressTickets">0/0/0</b></span>
        <span class="progress-chip streak" id="progressStreak" hidden title="Chuỗi đăng nhập">🔥 <b id="progressStreakValue">0</b></span>
      </div>
      <div class="progress-actions">
        <button type="button" id="dailyBtn" class="progress-btn daily unclaimed">🎁 Quà ngày</button>
        <button type="button" id="packBtn" class="progress-btn pack has-tickets" title="Mở pack">📦 <span>Mở Pack</span><i class="ticket-badge" hidden>0</i></button>
      </div>`;
    const anchor = $id('rankIdentity') || lobby.querySelector('.topbar');
    if (anchor) anchor.after(strip); else lobby.prepend(strip);
    $id('dailyBtn').onclick = () => showDailyModal(claimDaily());
    $id('packBtn').onclick = openShop;
    const back = $id('backBtn');
    if (back) back.addEventListener('click', () => refresh());
    refresh();
  }

  window.memePacks = {
    PACKS, DUST, EXCHANGES,
    open, openShop, claimDaily, rankReward, currentRating, onDuelFinished,
    refresh, setRandom(fn) { rng = typeof fn === 'function' ? fn : Math.random; },
    dayKey,
    get lastReward() { return lastReward; }
  };

  ensureHud();
})();
