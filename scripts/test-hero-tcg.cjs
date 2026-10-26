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
      const heroId = id => id;

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
          duel[n].lp = 4000;
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

      const put = (name, id, index = 0, position = 'atk') => {
        const slot = monsterSlot(heroId(id), position);
        memeAnime.tcgCore.uid(slot);
        duel[name].monsters[index] = slot;
        return slot;
      };

      await test('HERO data patch uses TCG text and drops H5-only traits', async () => {
        ok(card('AN-elemental_hero_bubbleman').description.includes('duy nhất trên tay'), 'Bubbleman text');
        ok(card('AN-elemental_hero_thunder_giant').description.includes('ATK gốc'), 'Thunder Giant text');
        ok(card('AN-elemental_hero_rampart_blaster').description.includes('chia đôi'), 'Rampart text');
        ok(card('AN-elemental_hero_necroshade').description.includes('không cần hiến tế'), 'Necroshade text');
        ok(card('AN-neo_spacian_aqua_dolphin').description.includes('500 sát thương'), 'Dolphin text');
        ok(card('AN-elemental_hero_air_neos').description.includes('chênh lệch'), 'Air Neos text');
        ok(card('AN-miracle_fusion').description.includes('trục xuất'), 'Miracle Fusion text');
        ok(card('AN-skyscraper').description.includes('1000 ATK'), 'Skyscraper text');
        eq(card('AN-elemental_hero_mudballman').traits.includes('hero_guard'), false, 'Mudballman is vanilla');
        eq(card('AN-elemental_hero_mudballman').description.includes('hiệu ứng'), true, 'Mudballman no effect');
        for (const id of ['AN-elemental_hero_aqua_neos', 'AN-elemental_hero_flare_neos', 'AN-elemental_hero_darkbright', 'AN-elemental_hero_wildedge', 'AN-elemental_hero_shining_flare_wingman'])
          eq(memeTextVi(card(id).description), card(id).description, id + ' idempotent');
      });

      await test('Bubbleman draws only with an empty hand and empty board', async () => {
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh', 'AN-kuriboh'];
        duel.player.hand = ['AN-elemental_hero_bubbleman'];
        render();
        eq(memeAnime.specialMode('player', card('AN-elemental_hero_bubbleman')), 'bubbleman', 'special mode');
        await memeAnime.perform(() => memeAnime.specialSummon('player', 0));
        eq(duel.player.monsters[0]?.id, 'AN-elemental_hero_bubbleman', 'summoned');
        eq(duel.player.hand.length, 2, 'drew 2');
        duel.player.hand = ['AN-elemental_hero_bubbleman'];
        eq(memeAnime.specialMode('player', card('AN-elemental_hero_bubbleman')), null, 'once per turn special summon');
        await gyReset();
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh'];
        duel.player.hand = ['AN-elemental_hero_bubbleman', 'AN-kuriboh'];
        render();
        const summoned = await memeAnime.perform(() => memeAnime.normalSummon('player', 0));
        ok(summoned, 'summon result ' + JSON.stringify({ normalUsed: duel.player.normalUsed, flag: duel.normalSummoned, free: memeAnime.tcgCore.free('player'), hand: duel.player.hand.slice(), monsters: duel.player.monsters.map(s => s?.id || null) }));
        eq(duel.player.monsters.filter(Boolean).length, 1, 'normal summoned');
        eq(duel.player.hand.length, 1, 'no draw with cards in hand');
        await gyReset();
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh'];
        duel.player.hand = ['AN-elemental_hero_bubbleman'];
        duel.player.field = { id: 'AN-skyscraper' };
        render();
        await memeAnime.perform(() => memeAnime.specialSummon('player', 0));
        eq(duel.player.hand.length, 0, 'no draw while controlling another card');
      });

      await test('Wildheart is unaffected by Trap effects', async () => {
        const w = put('player', 'AN-elemental_hero_wildheart');
        put('enemy', 'AN-kuriboh', 0, 'def');
        duel.enemy.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 0 };
        duel.phase = 'BATTLE';
        render();
        eq(memeAnime.tcgCore.spellTargetAllowed('enemy', card('AN-mirror_force'), { name: 'player', slot: w, index: 0, id: w.id }), false, 'trap cannot target');
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
        eq(duel.player.monsters[0]?.id, 'AN-elemental_hero_wildheart', 'survives Mirror Force');
        eq(duel.enemy.monsters[0], null, 'target destroyed');
        ok(duel.enemy.spells[0]?.faceDown, 'trap cannot resolve against Wildheart');
      });

      await test('Blade Edge deals piercing battle damage', async () => {
        put('player', 'AN-elemental_hero_bladeedge');
        put('enemy', 'AN-elemental_hero_clayman', 0, 'def');
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
        eq(duel.enemy.lp, 3400, '600 piercing damage');
        eq(duel.enemy.monsters[0], null, 'defender destroyed');
      });

      await test('Necroshade grants one tribute-free Normal Summon per copy in the GY', async () => {
        duel.player.grave = ['AN-elemental_hero_necroshade'];
        duel.player.hand = ['AN-elemental_hero_neos'];
        render();
        ok(await memeAnime.perform(() => memeAnime.normalSummon('player', 0)), 'summoned without tribute');
        eq(duel.player.monsters[0]?.id, 'AN-elemental_hero_neos', 'Neos on field');
        eq(duel.player.necroUses, 1, 'one use marked');
        eq(duel.player.grave.includes('AN-elemental_hero_necroshade'), true, 'Necroshade stays in GY');
        duel.normalSummoned = false;
        duel.player.normalUsed = false;
        duel.player.hand = ['AN-elemental_hero_neos'];
        ok(!(await memeAnime.perform(() => memeAnime.normalSummon('player', 0))), 'one copy is spent');
        duel.player.grave.push('AN-elemental_hero_necroshade');
        duel.normalSummoned = false;
        duel.player.normalUsed = false;
        duel.player.hand = ['AN-elemental_hero_neos'];
        ok(await memeAnime.perform(() => memeAnime.normalSummon('player', 0)), 'second copy unlocks another');
        eq(duel.player.necroUses, 2, 'two uses');
      });

      await test('Winged Kuriboh removes all battle damage for the rest of the turn', async () => {
        put('player', 'AN-winged_kuriboh');
        put('enemy', 'AN-blue_eyes_white_dragon');
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('enemy', 0, false, 0));
        eq(duel.player.monsters[0], null, 'Kuriboh destroyed');
        eq(duel.player.lp, 4000, 'battle damage negated');
        duel.enemy.monsters[1] = null;
        put('enemy', 'AN-vorse_raider', 1);
        await memeAnime.perform(() => memeAnime.battle('enemy', 1, false, null));
        eq(duel.player.lp, 4000, 'later direct attack also negated');
      });

      await test('Thunder Giant uses original ATK, discards a cost and is once per turn', async () => {
        const tg = put('player', 'AN-elemental_hero_thunder_giant');
        const boosted = put('enemy', 'AN-kuriboh');
        boosted.attackBonus = 5000;
        duel.player.hand = ['AN-kuriboh'];
        render();
        await activateMonsterEffect(0);
        eq(duel.enemy.monsters[0], null, 'original ATK used for targeting');
        ok(duel.player.grave.includes('AN-kuriboh'), 'discard cost paid');
        eq(tg.effectUsedRound, duel.round, 'once per turn marked');
        eq(await activateMonsterEffect(0), false, 'second use blocked');
      });

      await test('Rampart Blaster attacks from Defense only when the opponent has no monsters', async () => {
        const rb = put('player', 'AN-elemental_hero_rampart_blaster', 0, 'def');
        put('enemy', 'AN-kuriboh');
        render();
        eq(canAttackSlot(rb), false, 'blocked with opposing monsters');
        eq(await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0)), false, 'battle rejected');
        duel.enemy.monsters[0] = null;
        render();
        eq(canAttackSlot(rb), true, 'direct allowed when field is empty');
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, null));
        eq(duel.enemy.lp, 3000, 'half ATK direct damage');
      });

      await test('Steam Healer gains LP equal to the destroyed monster ATK', async () => {
        duel.player.lp = 1000;
        put('player', 'AN-elemental_hero_steam_healer');
        put('enemy', 'AN-celtic_guardian');
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
        eq(duel.player.lp, 2400, 'healed 1400');
        eq(duel.enemy.lp, 3600, '400 battle damage');
      });

      await test('Shining Flare Wingman scales with HERO cards and burns on destruction', async () => {
        duel.player.grave = ['AN-elemental_hero_avian', 'AN-elemental_hero_burstinatrix'];
        const sf = put('player', 'AN-elemental_hero_shining_flare_wingman');
        eq(memeAnime.tcgCore.stat('player', sf), 3100, '2500 + 300 x 2');
        put('enemy', 'AN-kuriboh');
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
        eq(duel.enemy.lp, 900, '2800 battle damage plus 300 burn');
      });

      await test('Wildedge attacks every opposing monster but never directly while they remain', async () => {
        const we = put('player', 'AN-elemental_hero_wildedge');
        put('enemy', 'AN-kuriboh');
        put('enemy', 'AN-celtic_guardian', 1);
        eq(memeAnime.attacksRemaining(we), 2, 'two attacks');
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 1));
        eq(duel.enemy.monsters.filter(Boolean).length, 0, 'both monsters destroyed');
      });

      await test('Darkbright pierces, turns to Defense and destroys a monster when it leaves', async () => {
        const db = put('player', 'AN-elemental_hero_darkbright');
        put('enemy', 'AN-celtic_guardian', 0, 'def');
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
        eq(duel.enemy.lp, 3200, '800 piercing damage');
        eq(db.position, 'def', 'switched to Defense');
        put('enemy', 'AN-vorse_raider', 1);
        await memeAnime.perform(() => memeRules.remove('player', { slot: db, index: 0 }, 'effect'));
        eq(duel.enemy.monsters[1], null, 'on-destroy target destroyed');
      });

      await test('Air Neos gains the LP difference and returns to the Extra Deck', async () => {
        put('player', 'AN-elemental_hero_neos');
        put('player', 'AN-neo_spacian_air_hummingbird', 1);
        duel.player.extraDeck = ['AN-elemental_hero_air_neos'];
        duel.player.lp = 2000;
        render();
        ok(await memeAnime.perform(() => memeAnime.fuse('player', null, 'AN-elemental_hero_air_neos')), 'contact fusion');
        const an = duel.player.monsters.find(slot => slot?.id === 'AN-elemental_hero_air_neos');
        ok(an, 'Air Neos on field');
        eq(memeAnime.tcgCore.stat('player', an), 4500, '2500 + 2000');
        await memeAnime.perform(() => memeAnime.endTurn('player'));
        eq(duel.player.monsters.filter(Boolean).length, 0, 'returned to Extra Deck');
        ok(duel.player.extraDeck.includes('AN-elemental_hero_air_neos'), 'card back in Extra Deck');
      });

      await test('Aqua Neos discards a cost and destroys a random card in hand', async () => {
        put('player', 'AN-elemental_hero_aqua_neos');
        duel.player.hand = ['AN-kuriboh', 'AN-kuriboh'];
        duel.enemy.hand = ['AN-blue_eyes_white_dragon', 'AN-celtic_guardian'];
        render();
        await activateMonsterEffect(0);
        eq(duel.player.hand.length, 1, 'discard cost paid');
        eq(duel.enemy.hand.length, 1, 'one hand card destroyed');
        eq(duel.enemy.grave.length, 1, 'destroyed card in GY');
      });

      await test('Flare Neos and Flare Scarab count Spell/Trap cards correctly', async () => {
        const fn = put('player', 'AN-elemental_hero_flare_neos');
        duel.player.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 0 };
        duel.enemy.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 0 };
        duel.enemy.field = { id: 'AN-skyscraper' };
        eq(memeAnime.tcgCore.stat('player', fn), 3700, 'Flare Neos 2500 + 400 x 3');
        const scarab = put('player', 'AN-neo_spacian_flare_scarab', 1);
        eq(memeAnime.tcgCore.stat('player', scarab), 1300, 'Scarab 500 + 400 x opponent 2');
      });

      await test('Air Hummingbird heals 500 per opponent hand card', async () => {
        put('player', 'AN-neo_spacian_air_hummingbird');
        duel.player.lp = 2000;
        duel.enemy.hand = ['AN-kuriboh', 'AN-kuriboh', 'AN-kuriboh'];
        render();
        await activateMonsterEffect(0);
        eq(duel.player.lp, 3500, 'healed 1500');
      });

      await test('Aqua Dolphin destroys a weaker monster or burns its controller', async () => {
        put('player', 'AN-elemental_hero_neos');
        put('player', 'AN-neo_spacian_aqua_dolphin', 1);
        duel.player.hand = ['AN-kuriboh'];
        duel.enemy.hand = ['AN-kuriboh'];
        render();
        await activateMonsterEffect(1);
        eq(duel.enemy.hand.length, 0, 'chosen monster destroyed');
        eq(duel.enemy.lp, 3500, '500 burn');
        await gyReset();
        put('player', 'AN-neo_spacian_aqua_dolphin');
        duel.player.hand = ['AN-kuriboh'];
        duel.enemy.hand = ['AN-blue_eyes_white_dragon'];
        render();
        await activateMonsterEffect(0);
        eq(duel.player.lp, 3500, '500 damage when outmatched');
        eq(duel.enemy.hand.length, 1, 'strong monster stays in hand');
      });

      await test('Miracle Fusion banishes GY materials and summons the HERO Fusion', async () => {
        duel.player.hand = ['AN-miracle_fusion'];
        duel.player.grave = ['AN-elemental_hero_avian', 'AN-elemental_hero_burstinatrix'];
        duel.player.extraDeck = ['AN-elemental_hero_flame_wingman'];
        render();
        await playSpell(0);
        eq(duel.player.monsters[0]?.id, 'AN-elemental_hero_flame_wingman', 'Fusion Summoned');
        eq(duel.player.banished.length, 2, 'materials banished');
        eq(duel.player.grave.includes('AN-elemental_hero_avian'), false, 'Avian left the GY');
        eq(duel.player.grave.includes('AN-miracle_fusion'), true, 'spell in GY');
      });

      await test('Skyscraper gives the attacking HERO 1000 ATK during damage calculation', async () => {
        put('player', 'AN-elemental_hero_avian');
        put('enemy', 'AN-vorse_raider');
        duel.player.field = { id: 'AN-skyscraper' };
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
        eq(duel.enemy.monsters[0], null, 'Vorse Raider destroyed');
        eq(duel.player.monsters[0]?.id, 'AN-elemental_hero_avian', 'Avian survives');
        eq(duel.enemy.lp, 3900, '100 damage');
      });

      await test('Mudballman no longer redirects attacks as an H5 guard', async () => {
        put('player', 'AN-elemental_hero_avian');
        put('player', 'AN-elemental_hero_mudballman', 1, 'def');
        put('enemy', 'AN-blue_eyes_white_dragon');
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('enemy', 0, false, 0));
        eq(duel.player.monsters[0], null, 'Avian destroyed');
        eq(duel.player.monsters[1]?.id, 'AN-elemental_hero_mudballman', 'Mudballman not redirected');
      });

      return results;
    });

    testResults.forEach(r => console.log('✅ ' + r));
    if (errors.length) throw Error('Page errors: ' + errors.join(' | '));
    console.log(`🎉 All ${testResults.length} Elemental HERO TCG tests passed.`);
  } finally {
    await browser.close();
    server.close();
  }
});
