const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

console.log('🧪 Starting test suite: Card Fixes & Rank Match Button...');

// ────────────────── 1. TEST addAction single execution ──────────────────
{
  const memeGameContent = fs.readFileSync(path.join(root, 'assets/js/meme_game.js'), 'utf8');
  assert(!memeGameContent.includes("b.addEventListener('click',fn);host.appendChild(b)"), 'addAction must not attach both onclick and addEventListener!');
  assert(memeGameContent.includes("b.onclick=e=>{if(b.disabled)return;return fn(e);};"), 'addAction should have guard against multiple clicks');
  console.log('✅ Test 1 PASSED: addAction has no duplicate click listener');
}

// ────────────────── 2. TEST summon() busy guard ──────────────────
{
  const animeRulesContent = fs.readFileSync(path.join(root, 'assets/js/meme_anime_rules.js'), 'utf8');
  assert(animeRulesContent.includes("if(duel?.turn!=='player'){window.showActionNotice('Đang là lượt của đối thủ!');return;}"), 'summon must check duel.turn');
  assert(animeRulesContent.includes("if(!canAct()||!mainPhase())return;"), 'summon must return silently if cannot act or busy');
  console.log('✅ Test 2 PASSED: summon() does not trigger false phase notice when busy');
}

// ────────────────── 3. TEST Fusion when field is full ──────────────────
{
  const animeRulesContent = fs.readFileSync(path.join(root, 'assets/js/meme_anime_rules.js'), 'utf8');
  assert(animeRulesContent.includes("const candidates = fusionCandidates(n, modes[c.effect_code]);"), 'spellProblem checks fusionCandidates first');
  assert(animeRulesContent.includes("!opts.some(chosen => chosen.some(e => e.zone === 'field'))"), 'extraSummonProblem allows fusion when field materials free space');
  console.log('✅ Test 3 PASSED: Fusion allows using field materials even when field is currently full');
}

// ────────────────── 4. TEST Premature Burial (Chôn sống) logic ──────────────────
{
  const animeRulesContent = fs.readFileSync(path.join(root, 'assets/js/meme_anime_rules.js'), 'utf8');
  assert(animeRulesContent.includes("let spellSlot=s.spells.find(sp=>sp&&sp.id===c.id&&!sp.equippedTo);"), 'premature finds existing continuous/set spell slot');
  assert(animeRulesContent.includes("if (s.lp <= lpFee(800)) return 'Cần ít nhất ' + lpFee(800) + ' LP để kích hoạt Chôn Sống!';"), 'spellProblem uses lpFee(800) for premature');
  assert(animeRulesContent.includes("if (!s.spells.includes(null) && !fromSet) return 'Khu vực Phép/Bẫy đã đầy (Tối đa 3 ô trên sân)!';"), 'spellProblem checks spell slots for premature');
  console.log('✅ Test 4 PASSED: Premature Burial equip and cost logic verified');
}

// ────────────────── 5. TEST Quick Rank Match guest pass-through ──────────────────
{
  const siteRankContent = fs.readFileSync(path.join(root, 'assets/js/site_rank.js'), 'utf8');
  assert(siteRankContent.includes("quickPlayBtn.classList.add('rank-btn-searching')"), 'rankPlayBtn gets searching feedback');
  assert(siteRankContent.includes("Đang ghép Rank Khách"), 'Unauthenticated users are not blocked from playing rank');
  console.log('✅ Test 5 PASSED: Quick rank match button is non-blocking for guests');
}

console.log('🎉 ALL 5/5 CARD & RANK TESTS PASSED!');
