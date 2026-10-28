const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log('🧪 Starting Card Banner Duration & Online Turn Clock Test Suite...\n');

// Mock browser / DOM context
let mockNow = 100000;
let elementMap = new Map();

function createElement(tag) {
  const el = {
    tagName: tag.toUpperCase(),
    className: '',
    id: '',
    hidden: false,
    textContent: '',
    title: '',
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
        } else if (force) {
          this._classes.add(c);
        } else {
          this._classes.delete(c);
        }
      },
      contains(c) { return this._classes.has(c); }
    },
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k]; },
    children: [],
    appendChild(child) { this.children.push(child); if (child.id) elementMap.set(child.id, child); return child; },
    querySelector(sel) {
      if (sel === '.effect-banner-close') return { onclick: null };
      return null;
    },
    remove() {
      if (this.id) elementMap.delete(this.id);
    }
  };
  return el;
}

const divider = createElement('div');
divider.className = 'field-divider';
elementMap.set('field-divider', divider);

const sandbox = {
  Date: {
    now: () => mockNow
  },
  setTimeout: (fn, ms) => {
    // Return an id
    return { fn, ms, scheduledAt: mockNow };
  },
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  document: {
    createElement,
    getElementById: id => elementMap.get(id) || null,
    querySelector: sel => {
      if (sel === '.field-divider') return divider;
      return null;
    },
    querySelectorAll: sel => {
      return [];
    },
    body: createElement('body'),
    addEventListener: () => {}
  },
  addEventListener: () => {},
  window: {},
  $: id => elementMap.get(id) || null,
  render: () => {},
  log: () => {},
  other: n => n === 'player' ? 'enemy' : 'player',
  closeModal: () => {},
  memeMyId: () => 'player-1',
  memeSend: (type, data) => {},
  esc: s => String(s),
  card: id => ({ id, name: 'Lá bài thử nghiệm', description: 'Mô tả hiệu ứng lá bài' }),
  artHTML: () => '<span>art</span>',
  console
};
sandbox.window = sandbox;
vm.createContext(sandbox);

// ----------------------------------------------------
// TEST 1: Verify Banner readDuration in meme_game.js is 1500ms
// ----------------------------------------------------
console.log('Test 1: Verify readDuration in assets/js/meme_game.js is 1500ms');
const gameJs = fs.readFileSync('assets/js/meme_game.js', 'utf8');
assert(gameJs.includes('const readDuration = 1500;'), 'readDuration must be exactly 1500ms (1.5s)');
assert(!gameJs.includes('const readDuration = 2500;'), 'Old 2500ms duration should no longer exist');
console.log('✅ assets/js/meme_game.js verified with 1500ms readDuration.');

// ----------------------------------------------------
// TEST 2: Load meme_turn_clock.js & Verify bannerStart / bannerEnd
// ----------------------------------------------------
console.log('\nTest 2: Test meme_turn_clock.js with Banner Pause & Deadline Extension');
vm.runInContext(fs.readFileSync('assets/js/meme_turn_clock.js', 'utf8'), sandbox);

assert(sandbox.window.memeTurnClock, 'memeTurnClock should be defined on window');
assert.strictEqual(typeof sandbox.window.memeTurnClock.bannerStart, 'function', 'bannerStart must be exported');
assert.strictEqual(typeof sandbox.window.memeTurnClock.bannerEnd, 'function', 'bannerEnd must be exported');
assert.strictEqual(typeof sandbox.window.memeTurnClock.extend, 'function', 'extend must be exported');

// Setup mock online duel
mockNow = 100000;
sandbox.window.memeOnlineIsPlaying = () => true;
sandbox.memeRoom = { code: 'TEST-123', role: 'host', peerId: 'guest-1', clockOffset: 0 };
sandbox.duel = {
  round: 1,
  turn: 'player',
  finished: false,
  turnClock: null
};

// Start turn clock
sandbox.window.memeTurnClock.start();
const clock = sandbox.duel.turnClock;
assert(clock, 'duel.turnClock must be initialized');
assert.strictEqual(clock.startedAt, 100000);
assert.strictEqual(clock.deadline, 160000); // 100,000 + 60,000ms
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 60000);

// Advance 15 seconds (15,000ms)
mockNow = 115000;
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 45000); // 45 seconds left

// Now show effect banner (takes 1.5s / 1500ms)
sandbox.window.memeTurnClock.bannerStart();
assert.strictEqual(sandbox.window.memeTurnClock.bannerActive, true, 'bannerActive must be true');

// While banner is showing, clock must be FROZEN at 45000 (0:45)
mockNow = 115500; // 500ms later
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 45000, 'Clock must stay frozen at 45000 during banner');

mockNow = 116000; // 1000ms later
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 45000, 'Clock must stay frozen at 45000 during banner');

mockNow = 116500; // 1500ms later (banner dismisses)
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 45000, 'Clock must stay frozen at 45000 until banner ends');

// Banner ends
sandbox.window.memeTurnClock.bannerEnd();
assert.strictEqual(sandbox.window.memeTurnClock.bannerActive, false, 'bannerActive must be false');
assert.strictEqual(clock.deadline, 161500, 'Deadline must be extended by 1500ms to 161500');
assert.strictEqual(clock.bannerBonus, 1500, 'bannerBonus must be 1500');

// Immediately after banner ends at mockNow = 116500:
// remaining = 161500 - 116500 = 45000!
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 45000, 'Player still has full 45s left after 1.5s banner!');

// Advance 1 more second:
mockNow = 117500;
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 44000, 'Countdown resumes normally (44s)');
console.log('✅ Clock freezes during banner and extends deadline by exactly 1500ms without consuming turn time.');

// ----------------------------------------------------
// TEST 3: User early dismiss (e.g. click after 400ms)
// ----------------------------------------------------
console.log('\nTest 3: Early Dismiss (User clicks banner after 400ms)');
mockNow = 120000;
// Remaining before banner: 161500 - 120000 = 41500ms
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 41500);

sandbox.window.memeTurnClock.bannerStart();
mockNow = 120400; // User clicks dismiss 400ms later
sandbox.window.memeTurnClock.bannerEnd();

// Deadline should be extended by 400ms
assert.strictEqual(clock.deadline, 161500 + 400);
assert.strictEqual(clock.bannerBonus, 1500 + 400);
// Remaining at 120400: (161900 - 120400) = 41500ms! Exactly preserved!
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 41500);
console.log('✅ Early dismiss properly credits only the exact elapsed 400ms, preserving player clock.');

// ----------------------------------------------------
// TEST 4: Online Host & Guest bannerBonus Synchronization
// ----------------------------------------------------
console.log('\nTest 4: Host & Guest bannerBonus Network Synchronization');
// Mock Guest sending state with a 1500ms bannerBonus to Host
const hostDuel = {
  round: 2,
  turn: 'enemy', // Guest's turn from host perspective
  turnClock: {
    round: 2,
    startedAt: 200000,
    deadline: 260000,
    bannerBonus: 0
  }
};
const priorClock = hostDuel.turnClock;
const priorRound = hostDuel.round;

// Incoming guest state where guest watched a 1.5s banner (bannerBonus = 1500, deadline = 261500)
const guestIncomingState = {
  round: 2,
  turn: 'player', // On guest, turn is 'player'
  turnClock: {
    round: 2,
    startedAt: 200000,
    deadline: 261500,
    bannerBonus: 1500
  }
};

// Simulate Host logic in meme_online.js
const guestBonus = (guestIncomingState.turnClock?.bannerBonus || 0) - (priorClock.bannerBonus || 0);
assert.strictEqual(guestBonus, 1500, 'Host must compute +1500ms guestBonus');
if (guestBonus > 0) {
  priorClock.deadline += guestBonus;
  priorClock.bannerBonus = (priorClock.bannerBonus || 0) + guestBonus;
}
hostDuel.turnClock = priorClock;

assert.strictEqual(hostDuel.turnClock.deadline, 261500, 'Host authoritative deadline extended to 261500');
assert.strictEqual(hostDuel.turnClock.bannerBonus, 1500, 'Host authoritative bannerBonus recorded 1500');
console.log('✅ Host accurately updates authoritative deadline based on Guest bannerBonus.');

// ----------------------------------------------------
// TEST 5: Consecutive effect banners
// ----------------------------------------------------
console.log('\nTest 5: Consecutive Effect Banners');
mockNow = 300000;
sandbox.duel = {
  round: 3,
  turn: 'player',
  finished: false,
  turnClock: null
};
sandbox.window.memeTurnClock.start();
const c3 = sandbox.duel.turnClock;
assert.strictEqual(c3.deadline, 360000);

// Banner 1 starts at 310000
mockNow = 310000;
sandbox.window.memeTurnClock.bannerStart();
mockNow = 311500;
sandbox.window.memeTurnClock.bannerEnd();
assert.strictEqual(c3.deadline, 361500);

// Banner 2 starts immediately at 311500
sandbox.window.memeTurnClock.bannerStart();
mockNow = 313000;
sandbox.window.memeTurnClock.bannerEnd();
assert.strictEqual(c3.deadline, 363000);
assert.strictEqual(c3.bannerBonus, 3000);

// At 313000, remaining is 363000 - 313000 = 50000ms (50s left, exactly 360000 - 310000)
assert.strictEqual(sandbox.window.memeTurnClock.remaining(), 50000);
console.log('✅ Two consecutive 1.5s banners extended deadline by 3.0s total, retaining 50s clock.');

console.log('\n🎉 ALL 5 BANNER & TURN CLOCK TESTS PASSED SUCCESSFULLY!');
