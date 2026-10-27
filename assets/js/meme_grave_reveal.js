// Every card that leaves the Graveyard or the banished pile is shown on screen.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const HOLD = 1900, SHOWN_PER_BATCH = 3, MAX_QUEUE = 16, MAX_ACTIVE = 2;
  const ZONE = { grave: { icon: '⚰', label: 'TỪ MỘ' }, banished: { icon: '↗', label: 'TỪ TRỤC XUẤT' } };
  let matchRef = null, matchKey = null, snapshots = null, queue = [], active = 0, epoch = 0;
  const matchIdentity = state => state?.onlineMatchId || state?.animeMatchId || state?.motionMatchId || null;

  function tray() {
    let node = document.getElementById('graveRevealTray');
    if (!node) {
      node = document.createElement('div');
      node.id = 'graveRevealTray';
      node.className = 'grave-reveal-tray';
      node.setAttribute('aria-live', 'polite');
      node.setAttribute('aria-atomic', 'false');
      document.body.appendChild(node);
    }
    return node;
  }
  function count(list) {
    const map = new Map();
    for (const id of list) map.set(id, (map.get(id) || 0) + 1);
    return map;
  }
  function departed(before, after) {
    const old = count(before), now = count(after), out = [];
    for (const [id, total] of old) {
      const left = total - (now.get(id) || 0);
      for (let i = 0; i < left; i += 1) out.push(id);
    }
    return out;
  }
  function clear() {
    epoch += 1;
    queue = [];
    active = 0;
    matchRef = null;
    matchKey = null;
    snapshots = null;
    document.getElementById('graveRevealTray')?.replaceChildren();
  }
  function capture(state) {
    return {
      player: { grave: [...state.player.grave], banished: [...(state.player.banished || [])] },
      enemy: { grave: [...state.enemy.grave], banished: [...(state.enemy.banished || [])] }
    };
  }
  function snapshot() {
    if (!duel) { if (matchRef) clear(); return; }
    const key = matchIdentity(duel);
    // Online and authoritative syncs rebuild the state object every message,
    // so only a changed match id may reset the snapshots.
    const continued = duel !== matchRef && !!key && (!matchKey || key === matchKey);
    if (duel !== matchRef && !continued) {
      clear();
      matchRef = duel;
      matchKey = key;
      snapshots = capture(duel);
      return;
    }
    matchRef = duel;
    if (key) matchKey = key;
    if (!snapshots) { snapshots = capture(duel); return; }
    for (const owner of ['player', 'enemy']) {
      for (const zone of ['grave', 'banished']) {
        const list = zone === 'grave' ? duel[owner].grave : duel[owner].banished || [];
        const gone = departed(snapshots[owner][zone], list);
        snapshots[owner][zone] = [...list];
        if (!gone.length) continue;
        for (const id of gone.slice(0, SHOWN_PER_BATCH)) queue.push({ owner, zone, id });
        if (gone.length > SHOWN_PER_BATCH) queue.push({ owner, zone, count: gone.length - SHOWN_PER_BATCH });
      }
    }
    if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
    pump();
  }
  function holdMs() {
    if (reduced.matches || window.memeFx?.mode === 'minimal') return 900;
    return window.memeFx?.mode === 'compact' ? 1200 : HOLD;
  }
  function mount(entry, runEpoch) {
    const tag = `${ZONE[entry.zone].icon} ${ZONE[entry.zone].label} · ${entry.owner === 'player' ? 'CỦA BẠN' : 'ĐỐI THỦ'}`;
    const node = document.createElement('article');
    node.className = `grave-reveal zone-${entry.zone} owner-${entry.owner}`;
    node.innerHTML = entry.count
      ? `<span class="grave-reveal-summary"><b>+${entry.count} lá</b><small>${tag}</small></span>`
      : `${artHTML(entry.id, 'grave-reveal-art')}<span class="grave-reveal-copy"><small>${tag}</small><b>${esc(card(entry.id)?.name || entry.id)}</b></span>`;
    const host = tray();
    host.appendChild(node);
    while (host.children.length > 3) host.firstElementChild.remove();
    if (!reduced.matches && window.memeFx?.mode !== 'minimal') {
      try { node.animate([{ transform: 'translateX(36px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 180, easing: 'ease-out' }); } catch (_) {}
    }
    return new Promise(resolve => setTimeout(() => {
      if (runEpoch === epoch) node.remove();
      resolve();
    }, holdMs()));
  }
  function pump() {
    while (queue.length && active < MAX_ACTIVE) {
      const entry = queue.shift();
      active += 1;
      mount(entry, epoch).finally(() => { active = Math.max(0, active - 1); if (queue.length) pump(); });
    }
  }

  const renderBefore = render;
  render = () => { renderBefore(); snapshot(); };
  const reset = memeFx.reset;
  memeFx.reset = () => { clear(); return reset(); };
  $('backBtn')?.addEventListener('click', clear);
  window.memeGraveReveal = { snapshot, clear, get queued() { return queue.length; } };
})();
