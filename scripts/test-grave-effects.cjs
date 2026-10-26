const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => {
      console.error('PAGE ERROR:', e.message);
      errors.push(e.message);
    });
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`http://localhost:${port}/memecard.html`);
    await page.waitForFunction(() => window.memeAnime && window.MEME_DUEL_LINKS_GROUP);

    const testResults = await page.evaluate(async () => {
      const results = [];
      const ok = (x, m) => { if (!x) throw Error(m); };
      const eq = (a, b, m = 'value') => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);

      window.gyReset = async () => {
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
        for (const n of ['player', 'enemy']) {
          duel[n].hand = [];
          duel[n].grave = [];
          duel[n].banished = [];
          duel[n].monsters = [null, null, null];
          duel[n].spells = [null, null, null];
          duel[n].field = null;
          duel[n].extra = null;
        }
        $('lobby')?.classList.add('hidden');
        $('duel')?.classList.remove('hidden');
        render();
      };

      async function test(name, fn) {
        await gyReset();
        try {
          await fn();
          results.push(name);
        } catch (e) {
          throw Error(`${name}: ${e.message}`);
        }
      }

      await test('Shadow Mist sent to GY searches a different HERO from the Deck', async () => {
        duel.player.deck = ['AN-elemental_hero_clayman', 'AN-kuriboh'];
        duel.player.monsters[0] = { ...monsterSlot('MGX-elemental_hero_shadow_mist', 'atk'), uid: 'mist' };
        render();
        await memeAnime.perform(() => memeRules.remove('player', { slot: duel.player.monsters[0], index: 0 }, 'effect'));
        eq(duel.player.hand.includes('AN-elemental_hero_clayman'), true, 'Clayman searched');
      });

      await test('Masked HERO Fountain sent to GY sets Mask Change from the Deck', async () => {
        duel.player.deck = ['MGX-mask_change'];
        duel.player.monsters[0] = { ...monsterSlot('MGX-masked_hero_fountain', 'atk'), uid: 'fountain' };
        render();
        await memeAnime.perform(() => memeRules.remove('player', { slot: duel.player.monsters[0], index: 0 }, 'effect'));
        eq(duel.player.spells.some(slot => slot?.id === 'MGX-mask_change' && slot.faceDown), true, 'Mask Change set');
      });

      await test('Solid Soldier sent by effect revives a HERO in Defense Position', async () => {
        duel.player.grave = ['AN-elemental_hero_clayman'];
        duel.player.monsters[0] = { ...monsterSlot('DL-elemental_hero_solid_soldier', 'atk'), uid: 'solid' };
        render();
        await memeAnime.perform(() => memeRules.remove('player', { slot: duel.player.monsters[0], index: 0 }, 'effect'));
        const revived = duel.player.monsters.find(slot => slot?.id === 'AN-elemental_hero_clayman');
        eq(!!revived, true, 'Clayman revived');
        eq(revived?.position, 'def', 'Defense position');
      });

      await test('Solid Soldier destroyed by battle does not revive', async () => {
        duel.player.grave = ['AN-elemental_hero_clayman'];
        duel.player.monsters[0] = { ...monsterSlot('DL-elemental_hero_solid_soldier', 'atk'), uid: 'solid-battle' };
        render();
        await memeAnime.perform(() => memeRules.remove('player', { slot: duel.player.monsters[0], index: 0 }, 'battle'));
        eq(duel.player.monsters.some(slot => slot?.id === 'AN-elemental_hero_clayman'), false, 'No battle revive');
      });

      await test('Liquid Soldier as Fusion Material draws 2 and discards 1', async () => {
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh', 'AN-kuriboh'];
        render();
        await memeAnime.perform(() => window.memeAnime.tcgCore.sentToGrave('player', 'DL-elemental_hero_liquid_soldier', true, 'material'));
        eq(duel.player.hand.length, 1, 'Kept one drawn card');
        eq(duel.player.grave.length, 1, 'Discarded one card');
        eq(duel.player.deck.length, 1, 'Drew two cards');
      });

      await test('Liquid Soldier banished as Fusion Material draws 2 and discards 1', async () => {
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh', 'AN-kuriboh'];
        render();
        await memeAnime.perform(() => memeAnime.onBanished('player', 'DL-elemental_hero_liquid_soldier'));
        eq(duel.player.hand.length, 1, 'Kept one drawn card');
        eq(duel.player.grave.length, 1, 'Discarded one card');
      });

      await test('Liquid Soldier destroyed by effect does not draw', async () => {
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh', 'AN-kuriboh'];
        duel.player.monsters[0] = { ...monsterSlot('DL-elemental_hero_liquid_soldier', 'atk'), uid: 'liquid-effect' };
        render();
        await memeAnime.perform(() => memeRules.remove('player', { slot: duel.player.monsters[0], index: 0 }, 'effect'));
        eq(duel.player.deck.length, 3, 'No draw');
        eq(duel.player.hand.length, 0, 'No drawn card in hand');
      });

      await test('White Stone of Ancients summons Blue-Eyes from the Deck in the End Phase', async () => {
        duel.player.deck = ['AN-blue_eyes_white_dragon'];
        duel.player.grave = ['DL-the_white_stone_of_ancients'];
        render();
        await memeAnime.onSentToGrave('player', 'DL-the_white_stone_of_ancients', true, 'effect');
        await memeAnime.perform(() => memeAnime.endTurn('player'));
        eq(duel.player.monsters.some(slot => slot?.id === 'AN-blue_eyes_white_dragon'), true, 'Blue-Eyes summoned');
        eq(duel.player.grave.includes('DL-the_white_stone_of_ancients'), true, 'Stone stays in GY');
      });

      await test('White Stone of Ancients banishes itself to recover Blue-Eyes when the Deck is empty', async () => {
        duel.player.deck = ['AN-kuriboh'];
        duel.player.grave = ['DL-the_white_stone_of_ancients', 'AN-blue_eyes_white_dragon'];
        render();
        await memeAnime.onSentToGrave('player', 'DL-the_white_stone_of_ancients', true, 'effect');
        await memeAnime.perform(() => memeAnime.endTurn('player'));
        eq(duel.player.hand.includes('AN-blue_eyes_white_dragon'), true, 'Blue-Eyes recovered to hand');
        eq(duel.player.banished.includes('DL-the_white_stone_of_ancients'), true, 'Stone banished');
      });

      await test('Cyber Dragon Core banishes itself to Special Summon Cyber Dragon from the Deck', async () => {
        duel.player.grave = ['DL-cyber_dragon_core'];
        duel.player.deck = ['AN-cyber_dragon'];
        duel.enemy.monsters[0] = { ...monsterSlot('AN-kuriboh', 'atk'), uid: 'foe-only' };
        render();
        await memeAnime.onSentToGrave('player', 'DL-cyber_dragon_core', true, 'effect');
        eq(duel.player.monsters.some(slot => slot?.id === 'AN-cyber_dragon'), true, 'Cyber Dragon summoned');
        eq(duel.player.banished.includes('DL-cyber_dragon_core'), true, 'Core banished itself');
      });

      await test('Return of the Red-Eyes destroyed revives a Red-Eyes from the GY', async () => {
        duel.player.grave = ['AN-red_eyes_black_dragon'];
        render();
        await memeAnime.onSentToGrave('player', 'DL-return_of_the_red_eyes', true, 'effect');
        eq(duel.player.monsters.some(slot => slot?.id === 'AN-red_eyes_black_dragon'), true, 'Red-Eyes revived');
      });

      await test('Neos Fusion protects a Neos Fusion monster by banishing itself from the GY', async () => {
        duel.player.grave = ['DL-neos_fusion'];
        duel.player.monsters[0] = { ...monsterSlot('DL-elemental_hero_brave_neos', 'atk'), uid: 'brave', fusionSummoned: true };
        render();
        const removed = await memeAnime.perform(() => memeRules.remove('player', { slot: duel.player.monsters[0], index: 0 }, 'effect'));
        eq(removed, false, 'Removal was replaced');
        eq(!!duel.player.monsters[0], true, 'Brave Neos survives');
        eq(duel.player.grave.includes('DL-neos_fusion'), false, 'Neos Fusion left the GY');
        eq(duel.player.banished.includes('DL-neos_fusion'), true, 'Neos Fusion banished');
      });

      await test('Toon Bookmark protects Toon World by banishing itself from the GY', async () => {
        duel.player.grave = ['DL-toon_bookmark'];
        duel.player.field = { id: 'AN-toon_world' };
        render();
        await memeAnime.perform(() => window.memeAnime.tcgCore.clearSpell('player', -1));
        eq(duel.player.field?.id, 'AN-toon_world', 'Toon World survives');
        eq(duel.player.banished.includes('DL-toon_bookmark'), true, 'Toon Bookmark banished');
      });

      await test('Necroshade in the GY allows a tribute-free high-level HERO summon', async () => {
        duel.player.grave = ['AN-elemental_hero_necroshade'];
        duel.player.hand = ['AN-elemental_hero_neos'];
        render();
        await memeAnime.perform(() => memeAnime.normalSummon('player', 0));
        eq(duel.player.monsters.some(slot => slot?.id === 'AN-elemental_hero_neos'), true, 'Neos summoned without tribute');
        eq(duel.player.grave.includes('AN-elemental_hero_necroshade'), true, 'Necroshade stays in GY');
      });

      return results;
    });

    testResults.forEach(r => console.log('✅ ' + r));
    if (errors.length) throw Error('Page errors: ' + errors.join(' | '));
    console.log(`🎉 All ${testResults.length} graveyard-effect tests passed.`);
  } finally {
    await browser.close();
    server.close();
  }
});
