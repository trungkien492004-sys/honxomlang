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

      window.kaibaReset = async () => {
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
        await kaibaReset();
        try {
          await fn();
          results.push(name);
        } catch (e) {
          throw Error(`${name}: ${e.message}`);
        }
      }

      const target = (slot, name = 'player') => ({ name, slot, id: slot.id, type: 'monster' });

      await test('Kaiba TCG text and flags are applied', async () => {
        ok(card('AN-lord_of_d').description.includes('Cả hai người chơi'), 'Lord of D. text');
        ok(card('AN-the_flute_of_summoning_dragon').description.includes('Chúa Tể Loài Rồng'), 'Flute text');
        eq(card('AN-xyz_dragon_cannon').tcg_once, false, 'XYZ has no once per turn');
        eq(card('AN-xyz_dragon_cannon').noRevive, true, 'XYZ cannot be revived');
        eq(card('AN-xyz_dragon_cannon').contact_banish, true, 'XYZ contact banishes materials');
        ok(card('AN-xyz_dragon_cannon').description.includes('trục xuất'), 'XYZ official text');
        ok(card('AN-blue_eyes_shining_dragon').description.includes('vô hiệu hóa'), 'Shining text');
        ok(card('AN-blue_eyes_ultimate_dragon').description.includes(card('AN-blue_eyes_white_dragon').name), 'Ultimate materials');
        ok(card('AN-twin_headed_thunder_dragon').description.includes(card('AN-thunder_dragon').name), 'Thunder fusion materials');
      });

      await test('Lord of D. blocks Dragon targets for both players only', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-lord_of_d', 'atk'), uid: 'lord-player' };
        duel.player.monsters[1] = { ...monsterSlot('AN-blue_eyes_white_dragon', 'atk'), uid: 'dragon-own' };
        duel.enemy.monsters[0] = { ...monsterSlot('AN-vorse_raider', 'atk'), uid: 'non-dragon' };
        render();
        eq(memeAnime.tcgCore.spellTargetAllowed('enemy', card('AN-change_of_heart'), target(duel.player.monsters[1])), false, 'opponent blocked');
        eq(memeAnime.tcgCore.spellTargetAllowed('player', card('AN-change_of_heart'), target(duel.player.monsters[1])), false, 'owner blocked');
        eq(memeAnime.tcgCore.spellTargetAllowed('player', card('AN-change_of_heart'), target(duel.enemy.monsters[0], 'enemy')), true, 'non-Dragon allowed');
        duel.player.monsters[0] = null;
        eq(memeAnime.tcgCore.spellTargetAllowed('enemy', card('AN-change_of_heart'), target(duel.player.monsters[1])), true, 'Dragon targetable without Lord of D.');
      });

      await test('Lord of D. also blocks De-Fusion on your own Dragon Fusion', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-blue_eyes_ultimate_dragon', 'atk'), uid: 'beud' };
        duel.player.monsters[1] = { ...monsterSlot('AN-lord_of_d', 'atk'), uid: 'lord-defusion' };
        duel.player.hand = ['AN-de_fusion'];
        duel.player.extraDeck = [];
        render();
        eq(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), false, 'De-Fusion cannot resolve');
        eq(duel.player.monsters[0].id, 'AN-blue_eyes_ultimate_dragon', 'Blue-Eyes Ultimate stays');
        eq(duel.player.hand, ['AN-de_fusion'], 'spell stays in hand');
      });

      await test('XYZ-Dragon Cannon is contact summoned by banishing X, Y and Z', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-x_head_cannon', 'atk'), uid: 'x' };
        duel.player.monsters[1] = { ...monsterSlot('AN-y_dragon_head', 'atk'), uid: 'y' };
        duel.player.monsters[2] = { ...monsterSlot('AN-z_metal_tank', 'atk'), uid: 'z' };
        duel.player.extraDeck = ['AN-xyz_dragon_cannon'];
        render();
        ok(await memeAnime.perform(() => memeAnime.fuse('player', null, 'AN-xyz_dragon_cannon')), 'contact summon');
        const xyz = duel.player.monsters.find(slot => slot?.id === 'AN-xyz_dragon_cannon');
        ok(xyz, 'XYZ on field');
        eq(xyz.materialCount, 3, 'three materials');
        for (const id of ['AN-x_head_cannon', 'AN-y_dragon_head', 'AN-z_metal_tank']) {
          eq(duel.player.banished.includes(id), true, id + ' banished');
          eq(duel.player.grave.includes(id), false, id + ' not in GY');
        }
        eq(duel.player.monsters.filter(Boolean).length, 1, 'only XYZ remains');
        eq(duel.player.extraDeck.length, 0, 'left the Extra Deck');
      });

      await test('Polymerization cannot summon the contact-only XYZ-Dragon Cannon', async () => {
        duel.player.hand = ['AN-polymerization', 'AN-x_head_cannon', 'AN-y_dragon_head', 'AN-z_metal_tank'];
        duel.player.extraDeck = ['AN-xyz_dragon_cannon'];
        render();
        eq(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), false, 'Polymerization fizzles');
        eq(duel.player.monsters.filter(Boolean).length, 0, 'no Fusion Summon');
        eq(duel.player.hand.length, 4, 'cards stay in hand');
      });

      await test('XYZ-Dragon Cannon can destroy opponent cards repeatedly in one turn', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-xyz_dragon_cannon', 'atk'), uid: 'xyz-effect' };
        duel.player.hand = ['AN-kuriboh', 'AN-kuriboh'];
        duel.enemy.monsters[0] = { ...monsterSlot('AN-blue_eyes_white_dragon', 'atk'), uid: 'xyz-first' };
        duel.enemy.monsters[1] = { ...monsterSlot('AN-vorse_raider', 'atk'), uid: 'xyz-second' };
        render();
        await activateMonsterEffect(0);
        await activateMonsterEffect(0);
        eq(duel.player.hand.length, 0, 'discarded two costs');
        eq(duel.enemy.monsters.filter(Boolean).length, 0, 'destroyed both targets');
        eq(duel.player.monsters[0].effectUsedRound, undefined, 'no once-per-turn lock');
      });

      await test('XYZ-Dragon Cannon cannot be revived from the GY', async () => {
        duel.player.grave = ['AN-xyz_dragon_cannon'];
        duel.player.hand = ['AN-monster_reborn'];
        render();
        eq(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), false, 'Monster Reborn has no target');
        eq(duel.player.grave, ['AN-xyz_dragon_cannon'], 'stays in the GY');
        eq(duel.player.monsters.filter(Boolean).length, 0, 'no revival');
      });

      await test('Blue-Eyes Shining Dragon negates targeting and tributes Ultimate Dragon', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-blue_eyes_ultimate_dragon', 'atk'), uid: 'beud-tribute' };
        duel.player.hand = ['AN-blue_eyes_shining_dragon'];
        render();
        ok(await memeAnime.perform(() => memeAnime.specialSummon('player', 0)), 'special summon');
        const shining = duel.player.monsters.find(slot => slot?.id === 'AN-blue_eyes_shining_dragon');
        ok(shining, 'Shining Dragon on field');
        eq(duel.player.grave.includes('AN-blue_eyes_ultimate_dragon'), true, 'Ultimate Dragon tributed');
        eq(duel.player.hand.length, 0, 'hand card used');
        duel.player.grave.push('AN-baby_dragon');
        eq(memeAnime.tcgCore.stat('player', shining), 3600, 'gains 300 per Dragon in GY');
        eq(memeAnime.tcgCore.spellTargetAllowed('enemy', card('AN-change_of_heart'), target(shining)), false, 'Spell target negated');
        eq(memeAnime.tcgCore.spellTargetAllowed('enemy', card('AN-trap_hole'), target(shining)), false, 'Trap target negated');
      });

      await test('Flute of Summoning Dragon needs Lord of D. and summons up to 2 Dragons', async () => {
        duel.player.hand = ['AN-the_flute_of_summoning_dragon', 'AN-blue_eyes_white_dragon', 'AN-blue_eyes_white_dragon'];
        render();
        eq(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), false, 'fails without Lord of D.');
        eq(duel.player.hand.length, 3, 'no cards spent');
        duel.player.monsters[0] = { ...monsterSlot('AN-lord_of_d', 'atk'), uid: 'flute-lord' };
        render();
        ok(await memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 'flute resolves');
        eq(duel.player.monsters.filter(slot => slot?.id === 'AN-blue_eyes_white_dragon').length, 2, 'two Dragons summoned');
        eq(duel.player.hand.length, 0, 'hand emptied');
        eq(duel.player.grave.includes('AN-the_flute_of_summoning_dragon'), true, 'spell spent');
      });

      await test('Dragon Master Knight gains 500 ATK per other Dragon you control', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-dragon_master_knight', 'atk'), uid: 'dmk' };
        duel.player.monsters[1] = { ...monsterSlot('AN-blue_eyes_white_dragon', 'atk'), uid: 'dmk-dragon' };
        duel.enemy.monsters[0] = { ...monsterSlot('AN-red_eyes_black_dragon', 'atk'), uid: 'dmk-enemy' };
        render();
        eq(memeAnime.tcgCore.stat('player', duel.player.monsters[0]), 5500, 'one own Dragon');
        duel.player.monsters[2] = { ...monsterSlot('AN-baby_dragon', 'atk'), uid: 'dmk-baby' };
        eq(memeAnime.tcgCore.stat('player', duel.player.monsters[0]), 6000, 'two own Dragons');
      });

      return results;
    });

    testResults.forEach(r => console.log('✅ ' + r));
    if (errors.length) throw Error('Page errors: ' + errors.join(' | '));
    console.log(`🎉 All ${testResults.length} Kaiba TCG tests passed.`);
  } finally {
    await browser.close();
    server.close();
  }
});
