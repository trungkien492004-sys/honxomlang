const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

// Rebuild public dist first
execSync('node scripts/build-public.js', { stdio: 'inherit' });

const pub = path.resolve('dist');

const server = http.createServer((req, res) => {
  const f = path.resolve(pub, '.' + new URL(req.url, 'http://localhost').pathname.replace(/^\/$/, '/memecard.html'));
  if (!f.startsWith(pub + path.sep)) return res.writeHead(403).end();
  fs.readFile(f, (e, b) => {
    if (e) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png'
    })[path.extname(f)] || 'text/plain');
    res.end(b);
  });
});

server.listen(0, async () => {
  const port = server.address().port;
  const url = `http://localhost:${port}`;
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', e => {
      console.error('PAGE ERROR:', e.message);
      errors.push(e.message);
    });

    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`${url}/memecard.html`);
    await page.waitForFunction(() => window.memeAnime && window.MEME_DUEL_LINKS_GROUP);

    console.log('Testing Duel Links fixes in browser...');

    const testResults = await page.evaluate(async () => {
      const results = [];
      const ok = (x, m) => { if (!x) throw Error(m); };
      const eq = (a, b, m = 'value') => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);

      window.dlReset = async () => {
        clearTimeout(aiTimer);
        await memeAnime.flush?.();
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
        $('lobby')?.classList.add('hidden');
        $('duel')?.classList.remove('hidden');
        render();
      };

      async function test(name, fn) {
        await dlReset();
        try {
          await fn();
          results.push(name);
        } catch (e) {
          throw Error(`${name}: ${e.message}`);
        }
      }

      // Test 1: All 60 cards have max_copies = 1 & 6 Presets are balanced to 20 cards
      await test('All 60 DL cards are Limit 1 (max_copies: 1) and all 6 Presets are balanced to 20 cards', () => {
        const cards = window.MEME_DUEL_LINKS_GROUP.cards;
        eq(cards.length, 60, 'Card count');
        const overLimit = cards.filter(c => c.max_copies !== 1);
        eq(overLimit.length, 0, 'All DL cards must be max_copies: 1 (Limit 1)');

        const presets = window.MEME_DUEL_LINKS_GROUP.presets;
        for (const [pName, deck] of Object.entries(presets)) {
          eq(deck.length, 20, `${pName} deck size must be 20`);
          const counts = {};
          for (const id of deck) counts[id] = (counts[id] || 0) + 1;
          const violations = Object.entries(counts).filter(([id, cnt]) => id.startsWith('DL-') && cnt > 1);
          eq(violations.length, 0, `${pName} must have no duplicate DL meta cards`);
        }
      });

      // Test 2: Melody of Awakening Dragon searches up to 2 dragons via pickMany
      await test('Melody of Awakening Dragon searches Alternative & Blue-Eyes via multi-select', async () => {
        duel.player.hand = ['DL-the_melody_of_awakening_dragon', 'AN-kuriboh'];
        duel.player.deck = ['AN-blue_eyes_white_dragon', 'DL-blue_eyes_alternative_white_dragon'];
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Melody');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'cost discarded');
        eq(duel.player.hand.includes('AN-blue_eyes_white_dragon'), true, 'BEWD added to hand');
        eq(duel.player.hand.includes('DL-blue_eyes_alternative_white_dragon'), true, 'Alternative added to hand');
      });

      // Test 3: Solid Soldier Special Summons Lv4 HERO from Hand
      await test('Elemental HERO Solid Soldier Normal Summon special summons Level 4 HERO from hand', async () => {
        duel.player.hand = ['DL-elemental_hero_solid_soldier', 'AN-elemental_hero_sparkman'];
        render();
        ok(await memeAnime.perform(() => memeAnime.normalSummon('player', 0)), 'Normal summon Solid Soldier');
        eq(duel.player.monsters[0].id, 'DL-elemental_hero_solid_soldier', 'Solid Soldier summoned');
        eq(duel.player.monsters[1].id, 'AN-elemental_hero_sparkman', 'Sparkman special summoned');
      });

      // Test 4: Liquid Soldier Normal Summon revives Lv4 HERO from GY
      await test('Elemental HERO Liquid Soldier Normal Summon revives Level 4 HERO from GY', async () => {
        duel.player.hand = ['DL-elemental_hero_liquid_soldier'];
        duel.player.grave = ['AN-elemental_hero_clayman'];
        render();
        ok(await memeAnime.perform(() => memeAnime.normalSummon('player', 0)), 'Normal summon Liquid Soldier');
        eq(duel.player.monsters[0].id, 'DL-elemental_hero_liquid_soldier', 'Liquid Soldier summoned');
        eq(duel.player.monsters[1].id, 'AN-elemental_hero_clayman', 'Clayman revived from GY');
      });

      // Test 5: Black Metal Dragon cannot search from hand, searches only when sent to GY
      await test('Black Metal Dragon only searches when sent to Graveyard (not from hand)', async () => {
        duel.player.hand = ['DL-black_metal_dragon'];
        duel.player.deck = ['AN-red_eyes_black_dragon'];
        render();
        const directCall = await window.memeDlHandlers.get('DL-black_metal_dragon')('player', card('DL-black_metal_dragon'), { source: null });
        eq(directCall, false, 'Black Metal Dragon direct call from hand must return false without search');
        eq(duel.player.hand.length, 1, 'Hand still only has Black Metal Dragon');

        // Now send to GY via onSentToGrave
        await window.memeAnime.onSentToGrave('player', 'DL-black_metal_dragon', true);
        eq(duel.player.hand.includes('AN-red_eyes_black_dragon'), true, 'Searched Red-Eyes Black Dragon from GY trigger');
      });

      // Test 6: Red-Eyes Fang with Chain: Set activation (+500 ATK/DEF, double attack) & Steal Effect
      await test('Red-Eyes Fang with Chain flips, equips (+500 ATK, 2 attacks), and steals opponent monster', async () => {
        duel.round = 2; // set in round 1, now round 2
        duel.player.spells[0] = { id: 'DL-red_eyes_fang_with_chain', faceDown: true, setRound: 1 };
        duel.player.monsters[0] = { ...monsterSlot('AN-red_eyes_black_dragon', 'atk'), uid: 're-1' };
        render();

        eq(window.memeAnime.trapProblem(0), '', 'Fang with Chain has no trapProblem when controlling Red-Eyes');
        ok(await activateTrap(0), 'Activate Fang with Chain from backrow');
        eq(duel.player.spells[0].faceDown, false, 'Fang with Chain is now face-up');
        eq(duel.player.monsters[0].tempAtk, 500, 'Red-Eyes gained +500 ATK');
        eq(duel.player.monsters[0].double_attack, true, 'Red-Eyes gained double_attack');

        // Now test Steal effect from face-up Fang with Chain
        duel.enemy.monsters[0] = { ...monsterSlot('AN-vorse_raider', 'atk'), uid: 'foe-1' };
        render();
        duel.selected = { name: 'player', type: 'spell', index: 0 };
        renderInspector();
        const stealBtn = [...$('inspectActions').querySelectorAll('button')].find(b => b.textContent.includes('Cướp quái'));
        ok(stealBtn, 'Inspector has Steal button for face-up Fang with Chain');

        await stealBtn.onclick();
        eq(duel.player.spells[0], null, 'Fang with Chain was sent to GY');
        eq(duel.player.grave.includes('DL-red_eyes_fang_with_chain'), true, 'Fang with Chain is in GY');
        eq(duel.enemy.monsters[0], null, 'Opponent monster was stolen/removed');
        ok(duel.player.monsters[0].tempAtk >= 2400, 'Red-Eyes gained ATK from stolen monster');
      });

      // Test 7: Red-Eyes Fusion sends materials from Deck to summon Slash Dragon
      await test('Red-Eyes Fusion sends materials from Deck to summon Slash Dragon', async () => {
        duel.player.hand = ['DL-red_eyes_fusion'];
        duel.player.extraDeck = ['DL-red_eyes_slash_dragon'];
        duel.player.deck = ['AN-red_eyes_black_dragon', 'DL-gearfried_the_red_eyes_iron_knight'];
        render();
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Red-Eyes Fusion');
        eq(duel.player.extra?.id, 'DL-red_eyes_slash_dragon', 'Slash Dragon summoned to the Extra Monster Zone');
        eq(duel.player.grave.includes('AN-red_eyes_black_dragon'), true, 'Red-Eyes in GY');
        eq(duel.player.grave.includes('DL-gearfried_the_red_eyes_iron_knight'), true, 'Gearfried in GY');
      });

      // Test 8: Neos Fusion sends materials from Deck to summon Brave Neos
      await test('Neos Fusion sends materials from Deck to summon Brave Neos', async () => {
        duel.player.hand = ['DL-neos_fusion'];
        duel.player.extraDeck = ['DL-elemental_hero_brave_neos'];
        duel.player.deck = ['AN-elemental_hero_neos', 'DL-elemental_hero_solid_soldier'];
        render();
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Neos Fusion');
        eq(duel.player.extra?.id, 'DL-elemental_hero_brave_neos', 'Brave Neos summoned to the Extra Monster Zone');
        eq(duel.player.grave.includes('AN-elemental_hero_neos'), true, 'Neos in GY');
        eq(duel.player.grave.includes('DL-elemental_hero_solid_soldier'), true, 'Solid Soldier in GY');
      });

      // Test 9: Cyberload Fusion with multi-pick
      await test('Cyberload Fusion shuffles materials from field and banished into deck', async () => {
        duel.player.hand = ['DL-cyberload_fusion'];
        duel.player.extraDeck = ['AN-cyber_twin_dragon'];
        duel.player.deck = ['AN-kuriboh'];
        duel.player.monsters[0] = { ...monsterSlot('AN-cyber_dragon', 'atk'), uid: 'cydra-1' };
        duel.player.banished = ['AN-cyber_dragon'];
        render();
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'play Cyberload Fusion');
        eq(duel.player.extra?.id, 'AN-cyber_twin_dragon', 'Cyber Twin Dragon summoned to the Extra Monster Zone');
        eq(duel.player.banished.length, 0, 'banished material left the banished pile');
        eq(duel.player.deck.filter(id => id === 'AN-cyber_dragon').length, 2, 'both Cyber Dragons shuffled into deck');
      });

      return results;
    });

    testResults.forEach(r => console.log('✅ ' + r));
    console.log('🎉 All 9 Duel Links integration tests passed successfully!');

  } finally {
    await browser.close();
    server.close();
  }
});
