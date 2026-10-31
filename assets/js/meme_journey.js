// Story chapters, tower floors, stake duels and quick practice. Progress lives in xom-progress-v1.
(function () {
  'use strict';

  const P = window.memeProgress, PK = window.memePacks;
  if (!P || !PK) return;

  const CHAPTERS = [
    { id: 'c1', num: 1, name: 'Đối đầu Seto Kaiba', preset: 'Kaiba · Kinh điển', icon: '🐉', brief: 'Kaiba thử thách bạn bằng Rồng Trắng Mắt Xanh.', reward: { xu: 300 } },
    { id: 'c2', num: 2, name: 'Sức mạnh của Joey', preset: 'Joey · Kinh điển', icon: '🤠', brief: 'Joey vào trận với quái thú và phép hỗ trợ.', reward: { xu: 350, t: { p1: 1 } } },
    { id: 'c3', num: 3, name: 'Bẫy của Pegasus', preset: 'Pegasus · Kinh điển', icon: '🎭', brief: 'Pegasus dùng Toon và bẫy dụ đối thủ.', reward: { xu: 400, t: { p1: 1 } } },
    { id: 'c4', num: 4, name: 'HERO của Jaden', preset: 'Jaden · Kinh điển', icon: '🦸', brief: 'Jaden gọi HERO và dung hợp ngay trên sân.', reward: { xu: 450, t: { p2: 1 } } },
    { id: 'c5', num: 5, name: 'Cyber của Zane', preset: 'Zane · Kinh điển', icon: '🤖', brief: 'Zane áp sát bằng Cyber Dragon.', reward: { xu: 500, t: { p2: 1 } } },
    { id: 'c6', num: 6, name: 'Tốc độ của Yusei', preset: 'Yusei · Kinh điển', icon: '⭐', brief: 'Yusei triệu hồi Đồng Bộ và tung đòn quyết định.', reward: { xu: 700, t: { p3: 1 } } }
  ];
  const TOWER = [
    { floor: 1, preset: 'Kaiba · Kinh điển', reward: { xu: 100 } },
    { floor: 2, preset: 'Yugi · Kinh điển', reward: { xu: 120, dust: 20 } },
    { floor: 3, preset: 'Joey · Kinh điển', reward: { xu: 150, t: { p1: 1 } } },
    { floor: 4, preset: 'Pegasus · Kinh điển', reward: { xu: 180, dust: 30 } },
    { floor: 5, preset: 'Jaden · Kinh điển', reward: { xu: 220, t: { p2: 1 } } },
    { floor: 6, preset: 'Zane · Kinh điển', reward: { xu: 260, dust: 40 } },
    { floor: 7, preset: 'Kaiba · Phản công', reward: { xu: 300, t: { p1: 1 } } },
    { floor: 8, preset: 'Yugi · Phản công', reward: { xu: 350, dust: 50 } },
    { floor: 9, preset: 'Jaden · Neo-Spacian', reward: { xu: 400, t: { p2: 1 } } },
    { floor: 10, preset: 'Yusei · Tối Thượng', reward: { xu: 600, t: { p3: 1 } } }
  ];
  const STAKES = [100, 300, 600];
  const STAKE_PRESET = 'Kaiba · Phản công';
  const FALLBACK_PRESET = 'Yugi · Thần Osiris';

  const $id = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('vi-VN');
  let pending = null;

  function presetName(wanted, fallback) {
    if (window.MEME_DECK_PRESETS?.[wanted]) return wanted;
    if (window.MEME_DECK_PRESETS?.[fallback]) return fallback;
    return FALLBACK_PRESET;
  }

  function storyState() {
    const st = P.state;
    if (!st.story || typeof st.story !== 'object') st.story = {};
    if (!st.story.chapters || typeof st.story.chapters !== 'object') st.story.chapters = {};
    if (!st.story.stake || typeof st.story.stake !== 'object') st.story.stake = { wins: 0, losses: 0 };
    return st.story;
  }

  function towerState() {
    const st = P.state;
    if (!st.tower || typeof st.tower !== 'object') st.tower = {};
    if (!st.tower.cleared || typeof st.tower.cleared !== 'object') st.tower.cleared = {};
    st.tower.floor = Math.min(10, Math.max(1, Math.floor(Number(st.tower.floor) || 1)));
    return st.tower;
  }

  function chapterCleared(id) {
    return storyState().chapters[id]?.cleared === true;
  }

  function chapterUnlocked(index) {
    return index === 0 || chapterCleared(CHAPTERS[index - 1].id);
  }

  function rewardLines(reward) {
    const lines = [];
    if (reward.xu) lines.push(`🪙 +${fmt(reward.xu)} Xu`);
    if (reward.dust) lines.push(`✦ +${fmt(reward.dust)} Bụi`);
    for (const [kind, n] of Object.entries(reward.t || {})) lines.push(`🎟️ +${n} vé ${PK.PACKS[kind].name}`);
    return lines;
  }

  function grant(reward) {
    if (reward.xu) P.addXu(reward.xu);
    if (reward.dust) P.addDust(reward.dust);
    for (const [kind, n] of Object.entries(reward.t || {})) P.addTicket(kind, n);
    return rewardLines(reward);
  }

  function deckReady() {
    try {
      if (typeof deckProblem === 'function' && deckProblem(deckList, extraDeckList)) {
        if (window.openDeckBuilder) window.openDeckBuilder();
        return false;
      }
    } catch {
      return false;
    }
    return true;
  }

  function startStory(id) {
    const chapter = CHAPTERS.find(c => c.id === id);
    if (!chapter) return false;
    if (!chapterUnlocked(CHAPTERS.indexOf(chapter))) return false;
    if (!deckReady()) return false;
    pending = { kind: 'story', id };
    window.startGame({ customBotDeck: presetName(chapter.preset) });
    return true;
  }

  function startTower() {
    const tower = towerState();
    if (!deckReady()) return false;
    pending = { kind: 'tower', floor: tower.floor };
    const floor = TOWER.find(f => f.floor === tower.floor) || TOWER[0];
    window.startGame({ customBotDeck: presetName(floor.preset) });
    return true;
  }

  function startStake(amount) {
    const stake = Math.floor(Number(amount) || 0);
    if (!STAKES.includes(stake)) return { ok: false, error: 'Mức cược không hợp lệ.' };
    if (P.state.xu < stake) return { ok: false, error: `Cần ${fmt(stake)} Xu để đặt cược.` };
    if (!deckReady()) return false;
    if (!P.spendXu(stake)) return { ok: false, error: 'Không đủ Xu.' };
    pending = { kind: 'stake', stake };
    window.startGame({ customBotDeck: presetName(STAKE_PRESET) });
    return { ok: true, stake };
  }

  function startPractice() {
    if (!deckReady()) return false;
    pending = null;
    window.startGame({ customBotDeck: presetName('Kaiba · Kinh điển') });
    return true;
  }

  function onDuelFinished(won) {
    const job = pending;
    if (!job) return null;
    pending = null;
    const story = storyState(), tower = towerState();
    let result = null;
    if (job.kind === 'story') {
      const chapter = CHAPTERS.find(c => c.id === job.id);
      if (!chapter) return null;
      const first = !chapterCleared(chapter.id);
      if (won) {
        story.chapters[chapter.id] = { cleared: true, at: Date.now() };
        result = first
          ? { title: `📖 Chặng ${chapter.num} hoàn thành!`, lines: grant(chapter.reward), firstClear: true }
          : { title: `📖 Chặng ${chapter.num} thắng lại`, lines: ['Chặng đã hoàn thành trước đó · không thêm thưởng'] };
      } else {
        result = { title: `📖 Chặng ${chapter.num} thất bại`, lines: ['Thử lại để mở chặng tiếp theo.'], lost: true };
      }
    } else if (job.kind === 'tower') {
      const floor = TOWER.find(f => f.floor === job.floor) || TOWER[0];
      if (won) {
        const first = tower.cleared[job.floor] !== true;
        tower.cleared[job.floor] = true;
        tower.floor = Math.min(10, job.floor + 1);
        result = first
          ? { title: `🗼 Vượt tầng ${job.floor}!`, lines: grant(floor.reward), firstClear: true }
          : { title: `🗼 Thắng lại tầng ${job.floor}`, lines: ['Tầng đã vượt trước đó · không thêm thưởng'] };
        if (job.floor === 10 && first) result.title = '🗼 Chinh phục Tháp 10 tầng!';
      } else {
        result = { title: `🗼 Tầng ${job.floor} thất bại`, lines: ['Tầng không đổi · thử lại khi sẵn sàng.'], lost: true };
      }
    } else if (job.kind === 'stake') {
      if (won) {
        story.stake.wins += 1;
        P.addXu(job.stake * 2);
        result = { title: `🎲 Thắng cược ${fmt(job.stake)} Xu!`, lines: [`🪙 +${fmt(job.stake * 2)} Xu (hoàn cược + thắng)`], won: true };
      } else {
        story.stake.losses += 1;
        result = { title: `🎲 Thua cược ${fmt(job.stake)} Xu`, lines: [`Đã trừ ${fmt(job.stake)} Xu khi vào trận.`], lost: true };
      }
    }
    P.save();
    return result;
  }

  function relaunch(job) {
    if (!job) return false;
    if (job.kind === 'story') return startStory(job.id);
    if (job.kind === 'tower') return startTower();
    if (job.kind === 'stake') {
      const result = startStake(job.stake);
      if (result && result.ok === false) {
        window.showActionNotice?.(result.error, 'Đấu cược');
        return true;
      }
      return !!result;
    }
    return false;
  }

  function storyBody() {
    return `<div class="journey-list">${CHAPTERS.map((chapter, index) => {
      const cleared = chapterCleared(chapter.id), unlocked = chapterUnlocked(index);
      const status = cleared ? '✅ Đã xong' : unlocked ? '⚔️ Sẵn sàng' : '🔒 Khóa';
      return `<article class="journey-row${cleared ? ' cleared' : ''}${unlocked ? '' : ' locked'}">
        <span class="journey-step">${cleared ? '✓' : chapter.num}</span>
        <div class="journey-body">
          <b>${chapter.icon} ${esc(chapter.name)}</b>
          <small>${esc(chapter.brief)}</small>
          <div class="journey-rewards">${rewardLines(chapter.reward).map(x => `<span>${x}</span>`).join('')}</div>
        </div>
        <span class="journey-status">${status}</span>
        <button type="button" class="journey-start primary-btn" data-story="${chapter.id}" ${unlocked ? '' : 'disabled'}>${cleared ? 'Đấu lại' : 'Đấu'}</button>
      </article>`;
    }).join('')}</div>`;
  }

  function towerBody() {
    const tower = towerState(), floor = TOWER.find(f => f.floor === tower.floor) || TOWER[tower.floor - 1] || TOWER[0];
    const cells = TOWER.map(f => {
      const cleared = tower.cleared[f.floor] === true, current = f.floor === tower.floor;
      const state = cleared ? '✓' : current ? '▶' : '🔒';
      return `<span class="tower-cell${cleared ? ' cleared' : ''}${current ? ' current' : ''}">${state}<small>${f.floor}</small></span>`;
    }).join('');
    const done = tower.cleared[10] === true;
    return `<div class="tower-panel">
      <div class="tower-head"><div><b>Tầng ${tower.floor}/10</b><small>Thắng để mở tầng kế · thua giữ nguyên tầng</small></div><span class="tower-best">Đã vượt ${Object.keys(tower.cleared).length}/10</span></div>
      <div class="tower-grid">${cells}</div>
      <div class="tower-floor">
        <div><b>${done ? '🏆 Tháp đã chinh phục' : `Tầng ${floor.floor} · ${esc(presetName(floor.preset))}`}</b><div class="journey-rewards">${done ? '<span>Có thể đấu lại tầng 10 để luyện tập</span>' : rewardLines(floor.reward).map(x => `<span>${x}</span>`).join('')}</div></div>
        <button type="button" id="towerStart" class="primary-btn">${done ? 'Đấu lại tầng 10' : `Đấu tầng ${floor.floor}`}</button>
      </div>
    </div>`;
  }

  function stakeBody() {
    const st = P.state, stake = storyState().stake;
    return `<div class="stake-panel">
      <p class="stake-note">Đặt cược Xu trước khi vào trận. Thắng nhận lại gấp đôi, thua mất phần cược. Cược bị trừ ngay khi bắt đầu.</p>
      <div class="stake-grid">${STAKES.map(n => `<button type="button" class="stake-card" data-stake="${n}" ${st.xu >= n ? '' : 'disabled'}><b>${fmt(n)} Xu</b><small>${st.xu >= n ? `Thắng +${fmt(n)} Xu` : 'Không đủ Xu'}</small></button>`).join('')}</div>
      <div class="stake-stats"><span>🏆 Thắng cược: <b>${stake.wins}</b></span><span>💀 Thua cược: <b>${stake.losses}</b></span><span>🪙 Ví: <b>${fmt(st.xu)} Xu</b></span></div>
    </div>`;
  }

  let tab = 'story';
  function bodyHTML() {
    if (tab === 'tower') return towerBody();
    if (tab === 'stake') return stakeBody();
    return storyBody();
  }

  function open(nextTab) {
    if (nextTab) tab = nextTab;
    window.showModal(`<div class="journey-modal">
      <div class="journey-head"><div><h2>🧭 Hành trình</h2><p>Chặng truyện, Tháp và Đấu cược để cày Xu và vé pack.</p></div><div class="journey-wallet"><span>🪙 ${fmt(P.state.xu)} Xu</span><span>🎟️ ${P.state.tickets.p1}/${P.state.tickets.p2}/${P.state.tickets.p3}</span></div></div>
      <div class="journey-tabs">
        <button type="button" data-tab="story" class="${tab === 'story' ? 'active' : ''}">📖 Chặng truyện</button>
        <button type="button" data-tab="tower" class="${tab === 'tower' ? 'active' : ''}">🗼 Tháp 10 tầng</button>
        <button type="button" data-tab="stake" class="${tab === 'stake' ? 'active' : ''}">🎲 Đấu cược</button>
      </div>
      <div class="journey-body">${bodyHTML()}</div>
      <div class="journey-foot">
        <button type="button" id="practiceBtn" class="secondary-btn">⚔️ Luyện tập nhanh</button>
        <button type="button" id="journeyPack" class="secondary-btn">📦 Mở Pack</button>
        <button type="button" id="journeyClose" class="primary-btn">Đóng</button>
      </div>
    </div>`);
    document.querySelectorAll('.journey-tabs [data-tab]').forEach(btn => {
      btn.onclick = () => open(btn.dataset.tab);
    });
    document.querySelectorAll('[data-story]').forEach(btn => {
      btn.onclick = () => startStory(btn.dataset.story);
    });
    document.querySelectorAll('[data-stake]').forEach(btn => {
      btn.onclick = () => {
        const result = startStake(Number(btn.dataset.stake));
        if (result && result.ok === false) window.showActionNotice?.(result.error, 'Đấu cược');
      };
    });
    const towerBtn = $id('towerStart');
    if (towerBtn) towerBtn.onclick = () => startTower();
    $id('practiceBtn').onclick = startPractice;
    $id('journeyPack').onclick = () => PK.openShop();
    $id('journeyClose').onclick = () => window.closeModal();
  }

  function ensureButton() {
    if ($id('journeyBtn')) return;
    const actions = document.querySelector('.progress-actions');
    if (!actions) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'journeyBtn';
    btn.className = 'progress-btn journey';
    btn.innerHTML = '🧭 <span>Hành trình</span>';
    btn.title = 'Chặng truyện, Tháp và Đấu cược';
    btn.onclick = () => open();
    actions.insertBefore(btn, actions.firstChild);
  }

  window.memeJourney = {
    CHAPTERS, TOWER, STAKES,
    startStory, startTower, startStake, startPractice, relaunch,
    onDuelFinished,
    open,
    get pending() { return pending ? { ...pending } : null; },
    chapterUnlocked, chapterCleared, storyState, towerState
  };

  ensureButton();
})();
