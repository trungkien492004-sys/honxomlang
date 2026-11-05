// Truyền Kỳ: cày cấp từng đấu sĩ để nhận thẻ + cốt truyện nhiều hồi có thoại. Dữ liệu ở meme_saga_data.js.
// Tiến độ nằm trong xom-progress-v1 → state.story.saga (được meme_cloud.js đồng bộ cùng story).
(function () {
  'use strict';

  const P = window.memeProgress, PK = window.memePacks, DATA = window.MEME_SAGA;
  if (!P || !DATA) return;

  const { LEVELS, REWARDS, SAGA } = DATA;
  const MAX_LEVEL = 40;
  const CARD_LEVELS = [2, 5, 8, 12, 16, 20, 25, 30, 35, 40];
  const TICKET_LEVELS = { 10: 'p1', 20: 'p2', 30: 'p2', 40: 'p3' };
  const DUST_LEVELS = { 15: 60, 25: 90, 35: 120 };
  const RARITY = { N: 0, R: 1, SR: 2, UR: 3 };
  const XP_WIN = 70, XP_LOSS = 25, XP_FIRST_WIN_BONUS = 100;

  const $id = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Number(n || 0).toLocaleString('vi-VN');
  const heroes = () => window.MEME_HEROES || [];
  const heroById = id => heroes().find(h => h.id === id);
  const cardById = id => (window.MEME_CARDS || []).find(c => c.id === id);
  const needFor = level => 60 + 20 * Math.min(MAX_LEVEL, Math.max(1, level));

  // ---------- state ----------
  function sagaState() {
    const story = P.state.story && typeof P.state.story === 'object' ? P.state.story : (P.state.story = {});
    if (!story.saga || typeof story.saga !== 'object') story.saga = {};
    const s = story.saga;
    if (!s.heroes || typeof s.heroes !== 'object') s.heroes = {};
    if (!s.acts || typeof s.acts !== 'object') s.acts = {};
    return s;
  }

  function heroState(id) {
    const s = sagaState();
    let h = s.heroes[id];
    if (!h || typeof h !== 'object') h = s.heroes[id] = { xp: 0, level: 1, claimed: [], day: '' };
    h.xp = Math.max(0, Math.floor(Number(h.xp) || 0));
    h.level = Math.min(MAX_LEVEL, Math.max(1, Math.floor(Number(h.level) || 1)));
    if (!Array.isArray(h.claimed)) h.claimed = [];
    return h;
  }

  const actKey = (hero, i) => `${hero}:${i}`;
  const actCleared = (hero, i) => sagaState().acts[actKey(hero, i)] === true;
  const actUnlocked = (hero, i) => heroState(hero).level >= LEVELS[i] && (i === 0 || actCleared(hero, i - 1));

  // ---------- thẻ thưởng của đấu sĩ ----------
  const poolCache = new Map();
  function heroPool(id) {
    if (poolCache.has(id)) return poolCache.get(id);
    const h = heroById(id), prefix = h ? `${h.group} ·` : null;
    const ids = new Set();
    if (prefix) {
      for (const src of [window.MEME_DECK_PRESETS, window.MEME_EXTRA_PRESETS]) {
        for (const [name, list] of Object.entries(src || {})) {
          if (name.startsWith(prefix)) for (const cid of list) ids.add(cid);
        }
      }
    }
    const pool = [...ids].filter(cid => cardById(cid)).sort((a, b) => {
      const ra = RARITY[cardById(a).rarity] ?? 1, rb = RARITY[cardById(b).rarity] ?? 1;
      return ra - rb || (a < b ? -1 : 1);
    });
    poolCache.set(id, pool);
    return pool;
  }

  function milestoneIndex(level) { return CARD_LEVELS.indexOf(level); }

  function previewCard(heroId, level) {
    const k = milestoneIndex(level), pool = heroPool(heroId);
    if (k < 0 || !pool.length) return null;
    return pool[Math.round(k * (pool.length - 1) / (CARD_LEVELS.length - 1))];
  }

  function pickCard(heroId, level) {
    const pool = heroPool(heroId), start = previewCard(heroId, level);
    if (!start) return null;
    const from = pool.indexOf(start);
    for (let n = 0; n < pool.length; n++) {
      const cid = pool[(from + n) % pool.length];
      if (P.copies(cid) < Math.max(1, Number(cardById(cid)?.max_copies) || 3)) return cid;
    }
    return null;
  }

  // ---------- thưởng & kinh nghiệm ----------
  function levelRewardLines(heroId, level) {
    const lines = [], xu = 40 + level * 8;
    P.addXu(xu);
    lines.push(`🪙 +${fmt(xu)} Xu`);
    if (TICKET_LEVELS[level]) {
      P.addTicket(TICKET_LEVELS[level], 1);
      lines.push(`🎟️ +1 vé ${PK?.PACKS?.[TICKET_LEVELS[level]]?.name || TICKET_LEVELS[level]}`);
    }
    if (DUST_LEVELS[level]) {
      P.addDust(DUST_LEVELS[level]);
      lines.push(`✦ +${DUST_LEVELS[level]} Bụi`);
    }
    if (milestoneIndex(level) >= 0) {
      const cid = pickCard(heroId, level);
      if (cid && P.grant(cid)) lines.push(`🃏 Thẻ mới: ${cardById(cid)?.name || cid}`);
      else { P.addDust(50); lines.push('✦ +50 Bụi (đã đủ thẻ của đấu sĩ)'); }
    }
    return lines;
  }

  function addHeroXp(heroId, amount) {
    const h = heroState(heroId), name = (heroById(heroId)?.name || '').split(' / ')[0] || 'Đấu sĩ', lines = [];
    if (h.level >= MAX_LEVEL) return lines;
    h.xp += Math.max(0, Math.floor(amount));
    while (h.level < MAX_LEVEL && h.xp >= needFor(h.level)) {
      h.xp -= needFor(h.level);
      h.level += 1;
      lines.push(`⭐ ${name} lên cấp ${h.level}!`);
      if (!h.claimed.includes(h.level)) {
        h.claimed.push(h.level);
        lines.push(...levelRewardLines(heroId, h.level));
      }
    }
    if (h.level >= MAX_LEVEL) h.xp = 0;
    return lines;
  }

  // ---------- thoại ----------
  let dialogueOpen = false;
  function playDialogue(lines, ctx) {
    return new Promise(resolve => {
      dialogueOpen = true;
      const hero = ctx.hero, foe = ctx.foe;
      const root = document.createElement('div');
      root.className = 'saga-dlg';
      root.innerHTML = `<div class="saga-dlg-stage">
        <div class="saga-dlg-who left" style="--c:${esc(hero.color || '#9cd9ff')}"><i>${esc(hero.icon || '★')}</i><b>${esc((hero.name || '').split(' / ')[0])}</b></div>
        <div class="saga-dlg-who right" style="--c:#ff9a8a"><i>${esc(foe.icon || '⚔')}</i><b>${esc(foe.name)}</b></div>
      </div>
      <div class="saga-dlg-box"><b class="saga-dlg-name"></b><p class="saga-dlg-text"></p><small>Chạm / Space để tiếp tục</small></div>
      <button type="button" class="saga-dlg-skip">Bỏ qua ⏭</button>`;
      document.body.appendChild(root);
      const nameEl = root.querySelector('.saga-dlg-name'), textEl = root.querySelector('.saga-dlg-text');
      let idx = -1, timer = null, full = '', typing = false;
      const finish = () => {
        clearInterval(timer);
        document.removeEventListener('keydown', onKey, true);
        root.remove();
        dialogueOpen = false;
        resolve();
      };
      function show() {
        clearInterval(timer);
        const raw = lines[idx], kind = raw.slice(0, 1), text = raw.slice(2);
        root.classList.toggle('speak-left', kind === 'h');
        root.classList.toggle('speak-right', kind === 'e');
        root.classList.toggle('narrate', kind === 'n');
        nameEl.textContent = kind === 'h' ? (hero.name || '').split(' / ')[0] : kind === 'e' ? foe.name : 'Dẫn truyện';
        full = text; typing = true; textEl.textContent = '';
        let n = 0;
        timer = setInterval(() => {
          n += 1; textEl.textContent = full.slice(0, n);
          if (n >= full.length) { clearInterval(timer); typing = false; }
        }, 16);
      }
      function next() {
        if (typing) { clearInterval(timer); textEl.textContent = full; typing = false; return; }
        idx += 1;
        if (idx >= lines.length) return finish();
        show();
      }
      function onKey(e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); next(); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(); }
      }
      root.addEventListener('click', e => { if (!e.target.closest('.saga-dlg-skip')) next(); });
      root.querySelector('.saga-dlg-skip').onclick = finish;
      document.addEventListener('keydown', onKey, true);
      next();
    });
  }

  // ---------- vào trận ----------
  let pending = null;

  function deckReady() {
    try {
      if (typeof deckProblem === 'function' && deckProblem(deckList, extraDeckList)) {
        window.openDeckBuilder?.();
        return false;
      }
    } catch { return false; }
    return true;
  }

  function presetFor(wanted, heroId) {
    if (window.MEME_DECK_PRESETS?.[wanted]) return wanted;
    const fallback = heroById(heroId)?.primaryDeck;
    return window.MEME_DECK_PRESETS?.[fallback] ? fallback : 'Yugi · Thần Osiris';
  }

  async function startAct(heroId, i) {
    const saga = SAGA[heroId], act = saga?.acts[i];
    if (!act || dialogueOpen) return false;
    if (!actUnlocked(heroId, i)) {
      const need = LEVELS[i];
      window.showActionNotice?.(heroState(heroId).level < need ? `Cần đạt cấp ${need} để mở hồi này.` : 'Hãy hoàn thành hồi trước.', 'Truyền Kỳ');
      return false;
    }
    if (!deckReady()) return false;
    const hero = heroById(heroId);
    const [, foeName, foeIcon, preset, intro] = act;
    window.closeModal?.();
    try { chooseHero(heroId); } catch { /* giữ đấu sĩ hiện tại */ }
    await playDialogue(intro, { hero, foe: { name: foeName, icon: foeIcon } });
    const token = `saga-${Date.now()}-${heroId}-${i}`;
    pending = { hero: heroId, act: i, token };
    window.startGame({ customBotDeck: presetFor(preset, heroId) });
    try { duel.sagaToken = token; } catch { /* trận chưa tạo */ }
    return true;
  }

  const seen = new WeakSet();
  function handleFinish(won) {
    let d;
    try { d = duel; } catch { return null; }
    if (!d || typeof d !== 'object' || seen.has(d)) return null;
    seen.add(d);
    const heroId = d.player?.heroId;
    if (!heroById(heroId)) return null;
    const job = pending && d.sagaToken === pending.token ? pending : null;
    pending = null;
    const h = heroState(heroId);
    const day = PK?.dayKey ? PK.dayKey() : new Date().toISOString().slice(0, 10);
    let xp = won ? XP_WIN : XP_LOSS;
    const lines = [];
    let title = null;
    if (won && h.day !== day) { h.day = day; xp += XP_FIRST_WIN_BONUS; lines.push(`🔥 Thắng đầu tiên trong ngày: +${XP_FIRST_WIN_BONUS} KN đấu sĩ`); }
    let outro = null;
    if (job && won) {
      const act = SAGA[job.hero].acts[job.act], first = !actCleared(job.hero, job.act);
      if (first) {
        sagaState().acts[actKey(job.hero, job.act)] = true;
        const r = REWARDS[job.act];
        title = `📜 Hồi ${job.act + 1} hoàn thành!`;
        P.addXu(r.xu); lines.push(`🪙 +${fmt(r.xu)} Xu`);
        if (r.dust) { P.addDust(r.dust); lines.push(`✦ +${r.dust} Bụi`); }
        for (const [kind, n] of Object.entries(r.t || {})) { P.addTicket(kind, n); lines.push(`🎟️ +${n} vé ${PK?.PACKS?.[kind]?.name || kind}`); }
        xp += r.hxp;
        if (job.act === SAGA[job.hero].acts.length - 1) lines.push('🏅 Hoàn thành toàn bộ Truyền Kỳ của đấu sĩ này!');
      } else {
        title = `📜 Hồi ${job.act + 1} thắng lại`;
      }
      outro = act[5];
    } else if (job) {
      title = `📜 Hồi ${job.act + 1} thất bại`;
      lines.push('Thử lại để tiếp tục câu chuyện.');
    }
    lines.push(`+${xp} KN ${(heroById(heroId).name || '').split(' / ')[0]} (cấp ${h.level})`);
    lines.push(...addHeroXp(heroId, xp));
    if (outro) lines.push(`💬 ${outro.slice(2)}`);
    P.save();
    refreshBadge();
    return { title: title || `⭐ Kinh nghiệm đấu sĩ`, lines, lost: !won };
  }

  // Gắn vào kết quả trận: giữ nguyên kết quả Hành trình, chỉ nối thêm dòng của Truyền Kỳ.
  const J = window.memeJourney;
  if (J && typeof J.onDuelFinished === 'function' && !J.__sagaWrapped) {
    const orig = J.onDuelFinished;
    J.onDuelFinished = function (won) {
      const base = orig.call(this, won);
      let extra = null;
      try { extra = handleFinish(!!won); } catch (e) { console.warn('Saga:', e); }
      if (!extra) return base;
      if (!base) return extra;
      return { ...base, lines: [...(base.lines || []), ...extra.lines] };
    };
    J.__sagaWrapped = true;
  }

  // ---------- giao diện ----------
  let sel = 0, tab = 'story';
  const heroName = h => (h.name || '').split(' / ')[0];

  function storyBody(h) {
    const saga = SAGA[h.id], hs = heroState(h.id);
    if (!saga) return '<p>Đấu sĩ này chưa có cốt truyện.</p>';
    return `<p class="saga-intro">${esc(saga.intro)}</p><div class="saga-acts">${saga.acts.map((a, i) => {
      const cleared = actCleared(h.id, i), unlocked = actUnlocked(h.id, i);
      const lvlLock = hs.level < LEVELS[i];
      const r = REWARDS[i];
      const rew = [`🪙 ${fmt(r.xu)}`, r.dust ? `✦ ${r.dust}` : '', ...Object.entries(r.t || {}).map(([k, n]) => `🎟️ ${n} ${PK?.PACKS?.[k]?.name || k}`), `⭐ ${r.hxp} KN`].filter(Boolean);
      return `<article class="saga-act${cleared ? ' cleared' : ''}${unlocked ? '' : ' locked'}">
        <span class="saga-act-num">${cleared ? '✓' : i + 1}</span>
        <div class="saga-act-main"><b>${esc(a[2])} Hồi ${i + 1} · ${esc(a[0])}</b><small>Đối thủ: ${esc(a[1])}</small>
          <div class="saga-rew">${rew.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
        <span class="saga-act-state">${cleared ? '✅ Xong' : lvlLock ? `🔒 Cấp ${LEVELS[i]}` : unlocked ? '⚔️ Sẵn sàng' : '🔒 Hồi trước'}</span>
        <button type="button" class="primary-btn saga-play" data-act="${i}" ${unlocked ? '' : 'disabled'}>${cleared ? 'Xem lại' : 'Đấu'}</button>
      </article>`;
    }).join('')}</div>`;
  }

  function rewardsBody(h) {
    const hs = heroState(h.id);
    return `<div class="saga-levels">${Array.from({ length: MAX_LEVEL - 1 }, (_, n) => {
      const lv = n + 2, got = hs.level >= lv, card = previewCard(h.id, lv);
      const extra = [TICKET_LEVELS[lv] ? '🎟️' : '', DUST_LEVELS[lv] ? '✦' : ''].join('');
      return `<div class="saga-lv${got ? ' got' : ''}${card ? ' card' : ''}" title="Cấp ${lv}${card ? ' · ' + esc(cardById(card)?.name || '') : ''}">
        <b>${lv}</b><i>${card ? '🃏' : '🪙'}${extra}</i>${card ? `<small>${esc(cardById(card)?.name || '')}</small>` : ''}
      </div>`;
    }).join('')}</div>
    <p class="saga-note">Mỗi cấp nhận Xu. Mốc 🃏 tặng thẻ của đấu sĩ này; 🎟️ vé pack ở cấp 10/20/30/40; ✦ Bụi ở cấp 15/25/35.</p>`;
  }

  function open(heroId) {
    if (Number.isInteger(heroId)) sel = Math.max(0, heroes().findIndex(h => h.id === heroId));
    const list = heroes(); if (!list.length) return;
    sel = Math.min(sel, list.length - 1);
    const h = list[sel], hs = heroState(h.id), need = needFor(hs.level), pct = hs.level >= MAX_LEVEL ? 100 : Math.round(hs.xp * 100 / need);
    window.showModal(`<div class="saga-modal">
      <div class="saga-head"><div><h2>🌟 Truyền Kỳ</h2><p>Cày cấp từng đấu sĩ để nhận thẻ, mở các hồi cốt truyện.</p></div>
        <div class="saga-wallet"><span>🪙 ${fmt(P.state.xu)} Xu</span><span>🎟️ ${P.state.tickets.p1}/${P.state.tickets.p2}/${P.state.tickets.p3}</span></div></div>
      <div class="saga-heroes">${list.map((x, n) => `<button type="button" data-hero-i="${n}" class="${n === sel ? 'active' : ''}" style="--c:${esc(x.color || '#9cd9ff')}" title="${esc(x.name)}"><i>${esc(x.icon || '★')}</i><b>${esc(heroName(x))}</b><em>Cấp ${heroState(x.id).level}</em></button>`).join('')}</div>
      <div class="saga-card" style="--c:${esc(h.color || '#9cd9ff')}">
        <div class="saga-card-top"><strong>${esc(h.name)}</strong><span>Cấp ${hs.level}${hs.level >= MAX_LEVEL ? ' · TỐI ĐA' : ''}</span></div>
        <div class="saga-xp"><i style="width:${pct}%"></i></div>
        <small>${hs.level >= MAX_LEVEL ? 'Đã đạt cấp tối đa' : `${fmt(hs.xp)} / ${fmt(need)} KN · thắng +${XP_WIN}, thua +${XP_LOSS}, thắng đầu ngày +${XP_FIRST_WIN_BONUS}`}</small>
        <small class="saga-title">${esc(SAGA[h.id]?.title || '')}</small>
      </div>
      <div class="saga-tabs"><button type="button" data-tab="story" class="${tab === 'story' ? 'active' : ''}">📖 Cốt truyện</button><button type="button" data-tab="rewards" class="${tab === 'rewards' ? 'active' : ''}">🎁 Thưởng cấp</button></div>
      <div class="saga-body">${tab === 'rewards' ? rewardsBody(h) : storyBody(h)}</div>
      <div class="saga-foot"><button type="button" class="secondary-btn" id="sagaPractice">⚔️ Luyện cấp nhanh</button><button type="button" class="primary-btn" id="sagaClose">Đóng</button></div>
    </div>`);
    document.querySelectorAll('.saga-heroes [data-hero-i]').forEach(b => { b.onclick = () => { sel = Number(b.dataset.heroI); open(); }; });
    document.querySelectorAll('.saga-tabs [data-tab]').forEach(b => { b.onclick = () => { tab = b.dataset.tab; open(); }; });
    document.querySelectorAll('.saga-play').forEach(b => { b.onclick = () => startAct(h.id, Number(b.dataset.act)); });
    $id('sagaClose').onclick = () => window.closeModal();
    $id('sagaPractice').onclick = () => {
      if (!deckReady()) return;
      window.closeModal?.();
      try { chooseHero(h.id); } catch { /* ok */ }
      window.startGame({ customBotDeck: presetFor(null, h.id) });
    };
  }

  function badgeCount() {
    let n = 0;
    for (const h of heroes()) {
      const acts = SAGA[h.id]?.acts || [];
      if (acts.some((_, i) => actUnlocked(h.id, i) && !actCleared(h.id, i))) n += 1;
    }
    return n;
  }

  function refreshBadge() {
    const btn = $id('sagaBtn');
    if (!btn) return;
    const n = badgeCount();
    btn.classList.toggle('has-actions', n > 0);
    const badge = btn.querySelector('.ticket-badge');
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    btn.title = n ? `${n} đấu sĩ có hồi truyện sẵn sàng` : 'Cốt truyện và cấp đấu sĩ';
  }

  function ensureButton() {
    if ($id('sagaBtn')) return refreshBadge();
    const footer = document.querySelector('.lobby-footer');
    const host = footer || document.querySelector('.progress-actions');
    if (!host) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'sagaBtn';
    btn.className = footer ? 'lobby-big-btn saga' : 'progress-btn saga';
    btn.innerHTML = '🌟 <span>Truyền Kỳ</span><i class="ticket-badge" hidden>0</i>';
    btn.onclick = () => open();
    const anchor = $id('journeyBtn');
    host.insertBefore(btn, anchor && anchor.parentNode === host ? anchor : host.firstChild);
    refreshBadge();
  }

  window.memeSaga = {
    SAGA, LEVELS, REWARDS, MAX_LEVEL, needFor,
    open, startAct, playDialogue, addHeroXp, heroState, heroPool, previewCard,
    actCleared, actUnlocked, sagaState, refreshBadge,
    get pending() { return pending ? { ...pending } : null; }
  };

  ensureButton();
  refreshBadge();
})();
