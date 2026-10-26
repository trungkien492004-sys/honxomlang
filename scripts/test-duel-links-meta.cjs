const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict'), puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..'), pub = path.join(root, 'dist'), out = path.join(root, 'outputs/duel-links-meta');
fs.mkdirSync(out, { recursive: true });

const server = http.createServer((req, res) => {
  const f = path.resolve(pub, '.' + new URL(req.url, 'http://localhost').pathname.replace(/^\/$/, '/memecard.html'));
  if (!f.startsWith(pub + path.sep)) return res.writeHead(403).end();
  fs.readFile(f, (e, b) => {
    if (e) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg'
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
      console.error('PAGE ERROR OCCURRED:', e.stack || e.message);
      errors.push(e.message);
    });
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(base + '/memecard.html');
    await page.waitForFunction(() => window.memeAnime && window.MEME_DUEL_LINKS_GROUP);

    const testResults = await page.evaluate(async () => {
      const results = [];
      const ok = (x, m) => { if (!x) throw Error(m); };
      const eq = (a, b, m = 'value') => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);

      window.dlReset = () => {
        clearTimeout(aiTimer);
        memeFx.reset();
        closeModal();
        memeMusic.setEnabled(false);
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

      async function test(name, fn) {
        dlReset();
        try {
          await fn();
          results.push(name);
        } catch (e) {
          throw Error(`${name}: ${e.message}`);
        }
      }

      // Test 1: Catalogue & Presets
      await test('60 Duel Links meta cards added, 6 new meta presets valid', () => {
        eq(window.MEME_DUEL_LINKS_GROUP.cards.length, 60, '60 DL cards count');
        const expectedPresets = [
          'Kaiba · Đỉnh Cao Mắt Xanh',
          'Yugi · Ma Thuật Tối Thượng',
          'Joey · Rồng Đen Bất Diệt',
          'Pegasus · Vương Quốc Hoạt Hình',
          'Jaden · Anh Hùng Tối Thượng',
          'Zane · Rồng Máy Tận Diệt'
        ];
        for (const pName of expectedPresets) {
          ok(window.MEME_DECK_PRESETS[pName], `Preset ${pName} exists`);
          ok(window.MEME_EXTRA_PRESETS[pName], `Extra preset ${pName} exists`);
          const main = window.MEME_DECK_PRESETS[pName];
          const extra = window.MEME_EXTRA_PRESETS[pName];
          ok(main.length >= 20 && main.length <= 30, `${pName} Main size ${main.length}`);
          ok(extra.length <= 10, `${pName} Extra size ${extra.length}`);
          eq(deckProblem(main, extra), '', `${pName} is legal`);
        }
      });

      // Test 2: Kaiba - Blue-Eyes Alternative Special Summon & Destroy Effect
      await test('Kaiba: Alternative White Dragon special summon & effect destroy', async () => {
        duel.player.hand = ['DL-blue_eyes_alternative_white_dragon', 'AN-blue_eyes_white_dragon'];
        duel.enemy.monsters[0] = monsterSlot('AN-hitotsu_me_giant', 'atk');
        // Alternative special summon
        const mode = memeAnime.specialMode('player', card('DL-blue_eyes_alternative_white_dragon'));
        eq(mode, 'free', 'alternative special mode');
        ok(await memeAnime.perform(() => memeAnime.specialSummon('player', 0)), 'special summon alternative');
        eq(duel.player.monsters[0].id, 'DL-blue_eyes_alternative_white_dragon');
        // Activate destroy effect
        ok(await memeAnime.perform(() => memeAnime.resolveEffect('player', card('DL-blue_eyes_alternative_white_dragon'), { source: duel.player.monsters[0] })), 'activate destroy effect');
        eq(duel.enemy.monsters[0], null, 'enemy monster destroyed');
        eq(duel.player.monsters[0].attacksUsed, 99, 'cannot attack this turn');
      });

      // Test 3: Kaiba - The Melody of Awakening Dragon
      await test('Kaiba: Melody of Awakening Dragon searches Alternative & Blue-Eyes', async () => {
        duel.player.hand = ['DL-the_melody_of_awakening_dragon', 'AN-kuriboh'];
        duel.player.deck = ['AN-blue_eyes_white_dragon', 'DL-blue_eyes_alternative_white_dragon'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Melody');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'cost discarded');
        eq(duel.player.hand.includes('AN-blue_eyes_white_dragon'), true, 'BEWD added to hand');
        eq(duel.player.hand.includes('DL-blue_eyes_alternative_white_dragon'), true, 'Alternative added to hand');
      });

      // Test 4: Kaiba - Cards of Consonance
      await test('Kaiba: Cards of Consonance draws 2 cards', async () => {
        duel.player.hand = ['DL-cards_of_consonance', 'DL-the_white_stone_of_ancients'];
        duel.player.deck = ['AN-blue_eyes_white_dragon', 'AN-kuriboh'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Consonance');
        eq(duel.player.grave.includes('DL-the_white_stone_of_ancients'), true, 'Stone discarded');
        eq(duel.player.hand.length, 2, '2 cards drawn');
      });

      // Test 5: Kaiba - Silver's Cry revives Normal Dragon
      await test('Kaiba: Silver Cry revives Blue-Eyes from grave', async () => {
        duel.player.hand = ['DL-silvers_cry'];
        duel.player.grave = ['AN-blue_eyes_white_dragon'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Silver Cry');
        eq(duel.player.monsters[0].id, 'AN-blue_eyes_white_dragon', 'BEWD revived');
      });

      // Test 5b: Alternative's field name is Blue-Eyes White Dragon
      await test('Kaiba: Alternative is named Blue-Eyes on field for Twin Burst contact fusion', async () => {
        ok(card('DL-blue_eyes_alternative_white_dragon').description.includes('trở thành "Rồng Trắng Mắt Xanh"'), 'text states the name change');
        duel.player.monsters[0] = monsterSlot('DL-blue_eyes_alternative_white_dragon', 'atk');
        duel.player.monsters[1] = monsterSlot('AN-blue_eyes_white_dragon', 'atk');
        duel.player.extraDeck = ['DL-blue_eyes_twin_burst_dragon'];
        ok(await memeAnime.perform(() => memeAnime.fuse('player', null, 'DL-blue_eyes_twin_burst_dragon')), 'contact fuse with Alternative as Blue-Eyes');
        ok(duel.player.monsters.some(s => s?.id === 'DL-blue_eyes_twin_burst_dragon'), 'Twin Burst summoned');
        ok(duel.player.grave.includes('DL-blue_eyes_alternative_white_dragon'), 'Alternative used as material');
      });

      // Test 5c: Alternative's name in the GY is Blue-Eyes White Dragon
      await test('Kaiba: Silver Cry revives Alternative through its GY name', async () => {
        duel.player.hand = ['DL-silvers_cry'];
        duel.player.grave = ['DL-blue_eyes_alternative_white_dragon'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Silver Cry on Alternative');
        eq(duel.player.monsters[0]?.id, 'DL-blue_eyes_alternative_white_dragon', 'Alternative revived from grave');
      });

      // Test 5d: Alternative can only be Special Summoned by its own procedure once per turn
      await test('Kaiba: Alternative special summon is once per turn', async () => {
        duel.player.hand = ['DL-blue_eyes_alternative_white_dragon', 'AN-blue_eyes_white_dragon'];
        eq(memeAnime.specialMode('player', card('DL-blue_eyes_alternative_white_dragon')), 'free', 'first summon available');
        ok(await memeAnime.perform(() => memeAnime.specialSummon('player', 0)), 'first special summon');
        duel.player.hand.push('DL-blue_eyes_alternative_white_dragon');
        eq(memeAnime.specialMode('player', card('DL-blue_eyes_alternative_white_dragon')), null, 'second special summon blocked');
      });

      // Test 6: Yugi - Dark Magical Circle searches Dark Magician
      await test('Yugi: Dark Magical Circle activation search', async () => {
        duel.player.hand = ['DL-dark_magical_circle'];
        duel.player.deck = ['AN-dark_magician', 'AN-kuriboh', 'AN-celtic_guardian'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Circle');
        eq(duel.player.hand.includes('AN-dark_magician'), true, 'DM added to hand');
      });

      // Test 7: Yugi - The Eye of Timaeus fusions Dark Cavalry
      await test('Yugi: The Eye of Timaeus fusions Dark Cavalry using DM on field', async () => {
        duel.player.monsters[0] = monsterSlot('AN-dark_magician', 'atk');
        duel.player.hand = ['DL-the_eye_of_timaeus'];
        duel.player.extraDeck = ['DL-dark_cavalry'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Timaeus');
        eq(duel.player.monsters[0].id, 'DL-dark_cavalry', 'Dark Cavalry summoned');
      });

      // Test 8: Yugi - Eternal Soul revives Dark Magician
      await test('Yugi: Eternal Soul revives Dark Magician from grave', async () => {
        duel.player.spells[0] = { id: 'DL-eternal_soul', faceDown: false, setRound: 1 };
        duel.player.grave = ['AN-dark_magician'];
        ok(await memeAnime.perform(() => memeAnime.resolveEffect('player', card('DL-eternal_soul'), { source: duel.player.spells[0] })), 'activate Eternal Soul');
        eq(duel.player.monsters[0].id, 'AN-dark_magician', 'DM revived');
      });

      // Test 9: Joey - Red-Eyes Fusion from Deck
      await test('Joey: Red-Eyes Fusion sends materials from Deck to summon Slash Dragon', async () => {
        duel.player.hand = ['DL-red_eyes_fusion'];
        duel.player.deck = ['AN-red_eyes_black_dragon', 'AN-axe_raider'];
        duel.player.extraDeck = ['DL-red_eyes_slash_dragon'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Red-Eyes Fusion');
        eq(duel.player.monsters[0].id, 'DL-red_eyes_slash_dragon', 'Slash Dragon summoned');
        eq(duel.player.grave.includes('AN-red_eyes_black_dragon'), true, 'REBD in grave');
        eq(duel.player.grave.includes('AN-axe_raider'), true, 'Axe Raider in grave');
      });

      // Test 10: Joey - Red-Eyes Insight
      await test('Joey: Red-Eyes Insight searches Red-Eyes Fusion', async () => {
        duel.player.hand = ['DL-red_eyes_insight'];
        duel.player.deck = ['AN-red_eyes_black_dragon', 'DL-red_eyes_fusion'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Red-Eyes Insight');
        eq(duel.player.grave.includes('AN-red_eyes_black_dragon'), true, 'REBD sent as cost');
        eq(duel.player.hand.includes('DL-red_eyes_fusion'), true, 'Red-Eyes Fusion searched');
      });

      // Test 11: Pegasus - Toon Table of Contents & Toon Bookmark
      await test('Pegasus: Toon Table of Contents searches Toon Bookmark, Bookmark searches Kingdom', async () => {
        duel.player.hand = ['DL-toon_table_of_contents'];
        duel.player.deck = ['DL-toon_bookmark', 'DL-toon_kingdom'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Table of Contents');
        eq(duel.player.hand.includes('DL-toon_bookmark'), true, 'Bookmark searched');
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Bookmark');
        eq(duel.player.hand.includes('DL-toon_kingdom'), true, 'Kingdom searched');
      });

      // Test 12: Jaden - Neos Fusion from Deck
      await test('Jaden: Neos Fusion sends materials from Deck to summon Brave Neos', async () => {
        duel.player.hand = ['DL-neos_fusion'];
        duel.player.deck = ['AN-elemental_hero_neos', 'AN-elemental_hero_sparkman'];
        duel.player.extraDeck = ['DL-elemental_hero_brave_neos'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Neos Fusion');
        eq(duel.player.monsters[0].id, 'DL-elemental_hero_brave_neos', 'Brave Neos summoned');
        eq(duel.player.grave.includes('AN-elemental_hero_neos'), true, 'Neos sent to grave');
        eq(duel.player.grave.includes('AN-elemental_hero_sparkman'), true, 'Sparkman sent to grave');
      });

      // Test 13: Jaden - A Hero Lives
      await test('Jaden: A Hero Lives halves LP and special summons Level 4 HERO from Deck', async () => {
        duel.player.hand = ['DL-a_hero_lives'];
        duel.player.deck = ['MGX-elemental_hero_stratos'];
        duel.player.lp = 4000;
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play A Hero Lives');
        eq(duel.player.lp, 2000, 'LP halved');
        eq(duel.player.monsters[0].id, 'MGX-elemental_hero_stratos', 'Stratos summoned');
      });

      // Test 14: Zane - Cyber Emergency & Evolution Burst
      await test('Zane: Cyber Emergency searches Core, Evolution Burst destroys card', async () => {
        duel.player.hand = ['DL-cyber_emergency'];
        duel.player.deck = ['DL-cyber_dragon_core'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Emergency');
        eq(duel.player.hand.includes('DL-cyber_dragon_core'), true, 'Core searched');

        // Evolution Burst
        duel.player.monsters[0] = monsterSlot('AN-cyber_dragon', 'atk');
        duel.player.hand = ['DL-evolution_burst'];
        duel.enemy.monsters[0] = monsterSlot('AN-hitotsu_me_giant', 'atk');
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Evolution Burst');
        eq(duel.enemy.monsters[0], null, 'enemy monster destroyed');
      });

      return results;
    });

    console.log('✅ All Duel Links Meta Unit Tests Passed:');
    for (const r of testResults) {
      console.log('  -', r);
    }

    // Viewport Screenshot tests for UI verification
    for (const [w, h] of [[1366, 768], [390, 844], [844, 390]]) {
      await page.setViewport({ width: w, height: h });
      await page.evaluate(() => {
        openDeckBuilder();
        renderDeckBuilder();
      });
      await page.screenshot({ path: path.join(out, `dl-meta-builder-${w}x${h}.png`) });
      await page.evaluate(() => closeModal());
    }
    console.log('✅ UI tested across 3 viewports (Desktop, Mobile portrait, Mobile landscape).');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'dl-tests-report.json'), JSON.stringify({ status: 'passed', total: testResults.length, scenarios: testResults }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error('❌ Duel Links Meta Test Failed:', e);
  server.close();
  process.exitCode = 1;
});
