const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'dist');

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
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', e => errors.push(e.message));
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.goto(base + '/memecard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.memeAnime && window.MEME_DUEL_LINKS_GROUP);
    await page.evaluate(() => { memeProgress.grant(CARDS.map(c => c.id), 3); });

    const testResults = await page.evaluate(async () => {
      const results = [];
      const ok = (x, m) => { if (!x) throw Error(m); };
      const eq = (a, b, m = 'value') => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);

      const dlReset = () => {
        clearTimeout(aiTimer);
        memeFx.reset();
        closeModal();
        memeAnime.setAuto(true);
        duel = {
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
        duel.player.hand = [];
        duel.player.grave = [];
        duel.player.banished = [];
        duel.enemy.hand = [];
        duel.enemy.grave = [];
        duel.enemy.banished = [];
        $('lobby').classList.add('hidden');
        $('duel').classList.remove('hidden');
        render();
      };

      // TEST 1: Sage with Eyes of Blue - Normal Summon triggers search for Level 1 LIGHT Tuner (White Stone)
      {
        dlReset();
        duel.player.hand = ['DL-sage_with_eyes_of_blue'];
        duel.player.deck = ['DL-the_white_stone_of_ancients', 'AN-blue_eyes_white_dragon', 'AN-pot_of_greed'];
        
        // Normal Summon Sage
        const summonRes = await memeAnime.perform(() => memeAnime.normalSummon('player', 0, 'atk', []));
        ok(summonRes, 'Sage summoned successfully');
        eq(duel.player.monsters[0]?.id, 'DL-sage_with_eyes_of_blue', 'Sage is in monster zone');
        ok(duel.player.hand.includes('DL-the_white_stone_of_ancients'), 'White Stone of Ancients searched to hand on summon');
        results.push('Sage with Eyes of Blue on-summon searches Level 1 LIGHT tuner');
      }

      // TEST 2: Sage with Eyes of Blue - Hand effect: Discard Sage + send monster on field to GY -> Special Summon Blue-Eyes
      {
        dlReset();
        duel.player.hand = ['DL-sage_with_eyes_of_blue'];
        // Put a monster on field
        duel.player.monsters[0] = monsterSlot('AN-vorse_raider', 'atk');
        duel.player.deck = ['AN-blue_eyes_white_dragon', 'AN-pot_of_greed'];
        
        // Activate hand action
        const handRes = await memeAnime.perform(() => memeAnime.resolveEffect('player', card('DL-sage_with_eyes_of_blue'), { source: null, fromHand: true }));
        ok(handRes, 'Sage hand effect activated successfully');
        eq(duel.player.grave.includes('DL-sage_with_eyes_of_blue'), true, 'Sage discarded to grave');
        eq(duel.player.grave.includes('AN-vorse_raider'), true, 'Field monster sent to grave as cost');
        eq(duel.player.monsters[0]?.id, 'AN-blue_eyes_white_dragon', 'Blue-Eyes summoned from deck to field');
        results.push('Sage with Eyes of Blue hand effect summons Blue-Eyes from deck');
      }

      // TEST 3: Bot deck selection based on difficulty
      {
        const supremeNames = [
          'Kaiba · Đỉnh Cao Mắt Xanh',
          'Yugi · Ma Thuật Tối Thượng',
          'Joey · Rồng Đen Bất Diệt',
          'Pegasus · Vương Quốc Hoạt Hình',
          'Jaden · Anh Hùng Tối Thượng',
          'Zane · Rồng Máy Tận Diệt',
          'Mai · Tối Thượng',
          'Yuma · Tối Thượng',
          'Yusei · Tối Thượng'
        ];

        // Default / Hard mode
        window.memePhase2.settings.difficulty = 'hard';
        delete window.memePhase2.settings.botDeck;
        startGame();
        clearTimeout(aiTimer);
        const botDeckHard = duel.enemy.deck;
        ok(supremeNames.some(p => MEME_DECK_PRESETS[p] && JSON.stringify(MEME_DECK_PRESETS[p].sort()) === JSON.stringify([...botDeckHard, ...duel.enemy.hand].sort())), 'Bot uses Supreme Deck by default on Hard');

        // Easy mode
        window.memePhase2.settings.difficulty = 'easy';
        startGame();
        clearTimeout(aiTimer);
        const easyNames = ['Kaiba · Kinh điển', 'Yugi · Kinh điển', 'Joey · Kinh điển', 'Pegasus · Kinh điển', 'Jaden · Kinh điển', 'Zane · Kinh điển'];
        ok(easyNames.some(p => MEME_DECK_PRESETS[p] && JSON.stringify(MEME_DECK_PRESETS[p].sort()) === JSON.stringify([...duel.enemy.deck, ...duel.enemy.hand].sort())), 'Bot uses Easy/Classic Deck on Easy');

        // Custom Bot Deck specification
        window.memePhase2.settings.botDeck = 'Kaiba · Đỉnh Cao Mắt Xanh';
        startGame();
        clearTimeout(aiTimer);
        eq(duel.enemy.heroId, HEROES.find(h => h.code === 'kaiba').id, 'Bot hero matches selected supreme Kaiba deck');
        results.push('Bot deck adapts to difficulty setting (Supreme by default, Easy on easy, Custom selectable)');
      }

      // TEST 4: Lobby Hero Roster button to equip character's Supreme Deck
      {
        chooseHero(1); // Kaiba
        const equipBtn = $('equipHeroSupremeBtn');
        ok(equipBtn, 'Equip Supreme Deck button rendered in hero preview');
        equipBtn.click();
        ok(deckList.includes('DL-blue_eyes_alternative_white_dragon'), 'Player deck equipped with Kaiba Supreme Deck');
        ok(deckList.includes('DL-sage_with_eyes_of_blue'), 'Player deck contains Sage with Eyes of Blue');
        results.push('Lobby hero roster equips character supreme deck directly');
      }

      // TEST 5: Deck Builder contains Supreme Decks optgroup at top
      {
        openDeckBuilder();
        const presetSelect = $('deckPreset');
        console.log('PRESET SELECT HTML:', presetSelect?.innerHTML);
        ok(presetSelect.innerHTML.includes('Đỉnh Cao Mắt Xanh'), 'Supreme decks at top of presets');
        closeModal();
        results.push('Deck builder presents Supreme Decks prominently');
      }

      return results;
    });

    console.log('✅ Unit Test Results:\n' + testResults.map(r => '  - ' + r).join('\n'));
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
