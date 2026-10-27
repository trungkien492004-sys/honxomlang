const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..'), pub = path.join(root, 'dist');

const server = http.createServer((req, res) => {
  const f = path.resolve(pub, '.' + new URL(req.url, 'http://localhost').pathname.replace(/^\/$/, '/memecard.html'));
  if (!f.startsWith(pub + path.sep)) return res.writeHead(403).end();
  fs.readFile(f, (e, b) => {
    if (e) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml'
    })[path.extname(f)] || 'application/octet-stream');
    res.end(b);
  });
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => {
      console.error('PAGE ERROR:', e.message);
      errors.push(e.message);
    });
    await page.setViewport({ width: 1366, height: 768 });
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + '/memecard.html');
    await page.waitForFunction(() => window.memeAnime && window.memeGraveReveal && window.memeCardMotion);

    const out = await page.evaluate(async () => {
      const results = [];
      const ok = (x, m) => { if (!x) throw Error(m); };
      const eq = (a, b, m = 'value') => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
      const reveals = () => [...document.querySelectorAll('.grave-reveal')];
      const trayText = () => document.getElementById('graveRevealTray')?.textContent || '';
      const ids = defaultDeck();
      const A = ids[0], B = ids[1], C = ids[2], D = ids[3], E = ids[4], F = ids[5];
      memeMusic.setEnabled(false);
      memeAnime.setAuto(true);
      memeFx.resolveCard = async (event, fn) => { await fn?.(); return true; };
      memeFx.attack = async (a, b, c, d, e, fn) => { await fn?.(); return true; };
      memeCardMotion.record = () => {};
      memeCardMotion.flush = async () => {};

      function freshDuel() {
        return {
          player: blankSide(defaultDeck()),
          enemy: blankSide(defaultDeck()),
          turn: 'player',
          phase: 'MAIN1',
          round: 3,
          normalSummoned: false,
          mode: null,
          pending: null,
          selected: null,
          logs: [],
          finished: false
        };
      }
      function reset() {
        clearTimeout(aiTimer);
        closeModal();
        memeFx.reset();
        memeAnime.setAuto(true);
        duel = freshDuel();
        for (const n of ['player', 'enemy']) {
          const s = duel[n];
          s.hand = []; s.deck = []; s.extraDeck = []; s.grave = []; s.banished = [];
          s.monsters = [null, null, null]; s.spells = [null, null, null];
          s.field = null; s.extra = null; s.lp = 4000;
        }
        $('lobby').classList.add('hidden');
        $('duel').classList.remove('hidden');
        render();
      }

      // 1. Banished pile exists everywhere, not hidden behind the grave modal.
      reset();
      for (const id of ['playerBoardGrave', 'playerBoardBanished', 'playerBoardExtraDeck',
        'enemyBoardGrave', 'enemyBoardBanished', 'enemyBoardExtraDeck',
        'playerBanishedBtn', 'enemyBanishedBtn', 'playerBanished', 'enemyBanished']) ok($(id), 'missing #' + id);
      results.push('banished pile + buttons rendered for both sides');

      // 2. Counts and top cards update for grave and banished.
      duel.player.grave = [A, B];
      duel.player.banished = [C, D];
      duel.enemy.banished = [E];
      render();
      eq($('playerGY').textContent, '2', 'playerGY');
      eq($('playerBanished').textContent, '2', 'playerBanished');
      eq($('enemyBanished').textContent, '1', 'enemyBanished');
      ok($('playerBoardGrave').textContent.includes('2'), 'board grave count');
      ok($('playerBoardBanished').textContent.includes('2'), 'board banished count');
      ok($('enemyBoardBanished').textContent.includes('1'), 'enemy board banished count');
      ok($('playerBoardGrave').getAttribute('aria-label').includes('2 lá'), 'grave aria');
      ok($('playerBoardBanished').getAttribute('aria-label').includes('2 lá'), 'banished aria');
      eq(reveals().length, 0, 'adding to piles must not reveal');
      results.push('counts and top-card renders stay in sync');

      // 3. A card used from the Graveyard is shown on screen with its name.
      const usedGrave = duel.player.grave.shift();
      render();
      eq(reveals().length, 1, 'one grave reveal');
      ok(reveals()[0].textContent.includes(card(usedGrave).name), 'grave reveal shows card name');
      ok(reveals()[0].textContent.includes('TỪ MỘ'), 'grave tag');
      ok(reveals()[0].classList.contains('owner-player'), 'grave owner player');
      eq($('playerGY').textContent, '1', 'playerGY after use');
      $('modal').classList.add('hidden');
      results.push('grave use reveals the card on screen');

      // 4. A card used from banished is shown with the banished tag.
      const usedBanished = duel.player.banished.shift();
      render();
      const banishedReveal = reveals().find(n => n.textContent.includes('TỪ TRỤC XUẤT'));
      ok(banishedReveal, 'banished reveal missing');
      ok(banishedReveal.textContent.includes(card(usedBanished).name), 'banished reveal shows card name');
      ok(banishedReveal.classList.contains('zone-banished'), 'banished zone class');
      eq($('playerBanished').textContent, '1', 'playerBanished after use');
      results.push('banished use reveals the card on screen');

      // 5. Opponent grave usage is labelled as the opponent's.
      reset();
      duel.enemy.grave = [A];
      render();
      duel.enemy.grave.shift();
      render();
      ok(reveals().some(n => n.classList.contains('owner-enemy') && n.textContent.includes('ĐỐI THỦ')), 'enemy reveal label');
      results.push('opponent grave usage is labelled');

      // 6. Row and board buttons open the banished pile directly.
      reset();
      duel.player.banished = [C, D];
      render();
      $('playerBanishedBtn').click();
      ok(!$('modal').classList.contains('hidden'), 'banished modal hidden');
      ok($('modalContent').textContent.includes('Trục xuất'), 'banished modal title');
      eq(document.querySelectorAll('#pileCards .pile-card').length, 2, 'banished modal cards');
      closeModal();
      $('playerBoardBanished').click();
      ok($('modalContent').textContent.includes('Trục xuất'), 'board banished modal title');
      closeModal();
      results.push('row + board banished buttons open the banished pile');

      // 7. A large removal shows a summary instead of flooding the screen.
      reset();
      duel.player.grave = [A, B, C, D, E];
      render();
      duel.player.grave = [];
      render();
      ok(reveals().length >= 1 && reveals().length <= 2, 'reveals capped on screen');
      ok(trayText().includes(card(A).name), 'first removed card shown');
      ok(memeGraveReveal.queued > 0, 'remaining reveals queued');
      memeGraveReveal.clear();
      eq(reveals().length, 0, 'clear empties tray');
      results.push('bulk removal queues a summary and can be cleared');

      // 8. A new duel never shows stale cards from the previous one.
      reset();
      duel.enemy.grave = [A];
      render();
      duel.enemy.grave = [];
      render();
      ok(reveals().length > 0, 'precondition reveal');
      duel = freshDuel();
      render();
      eq(reveals().length, 0, 'new duel cleared stale reveals');
      results.push('new duel clears stale reveals');

      // 9. Resetting effects clears the tray.
      duel.player.grave = [B];
      render();
      duel.player.grave = [];
      render();
      ok(reveals().length > 0, 'precondition reset reveal');
      memeFx.reset();
      eq(reveals().length, 0, 'memeFx.reset cleared tray');
      results.push('memeFx.reset clears the tray');

      // 10. Online sync rebuilds the state object every message; same match id must still reveal.
      reset();
      duel.animeMatchId = 'online-match-x';
      render();
      const clone = () => JSON.parse(JSON.stringify(duel));
      duel = clone();
      duel.player.grave = [A];
      render();
      duel = clone();
      duel.player.grave = [];
      render();
      ok(reveals().some(n => n.textContent.includes(card(A).name)), 'reveal survived state object replacement');
      results.push('online state replacement keeps revealing grave usage');

      // 11. A genuinely new match id still clears the tray.
      duel = clone();
      duel.animeMatchId = 'online-match-y';
      duel.player.grave = [];
      render();
      eq(reveals().length, 0, 'new match id cleared stale reveals');
      results.push('new online match clears stale reveals');

      // 12. Real card effect: Silver's Cry reviving a Dragon is shown on screen.
      reset();
      const dragon = CARDS.find(c => c.card_type === 'Monster' && c.tribe === 'Rồng' && !isExtraCard(c.id) && !c.uncollectible && !c.noRevive);
      ok(dragon, 'dragon available for revival');
      duel.player.grave = [dragon.id];
      duel.player.hand = ['DL-silvers_cry'];
      ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'silvers cry resolved');
      ok(duel.player.monsters.some(m => m?.id === dragon.id), 'dragon revived');
      ok(reveals().some(n => n.textContent.includes(dragon.name) && n.textContent.includes('TỪ MỘ')), 'revive shown on screen');
      results.push('real graveyard revive is displayed');

      return results;
    });

    for (const line of out) console.log('✔', line);
    if (errors.length) throw Error('page errors: ' + errors.join(' | '));
    console.log(`🎉 ${out.length} grave/banished visibility scenario groups passed.`);
    await browser.close();
    server.close();
  } catch (e) {
    console.error('❌', e.message);
    await browser.close();
    server.close();
    process.exitCode = 1;
  }
})();
