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
      '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'
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
    page.on('pageerror', e => { console.log('PAGE ERROR:', e); errors.push(e.message); });
    page.on('console', m => {
      console.log('PAGE LOG:', m.text());
    });

    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + '/memecard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.memeAnime && window.memePhase1);

    const testResults = await page.evaluate(async () => {
      const logs = [];
      const origRender = window.render;
      window.render = function(...args) {
        try {
          return origRender.apply(this, args);
        } catch (err) {
          console.error("CRASH IN RENDER:", err && err.stack ? err.stack : err);
          throw err;
        }
      };

      const id = n => 'AN-' + n.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '');
      const eq = (a, b, m = 'equal') => {
        if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
      };
      const ok = (v, m = 'truthy') => {
        if (!v) throw new Error(m);
      };

      function reset() {
        clearTimeout(aiTimer);
        memeFx.reset();
        closeModal();
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
        $('lobby').classList.add('hidden');
        $('duel').classList.remove('hidden');
        memeAnime.setAuto(true);
      }

      const put = (name, en, index = 0, pos = 'atk') => {
        const slot = monsterSlot(id(en), pos);
        slot.uid = 'uid-' + Math.random().toString(36).slice(2, 8);
        side(name).monsters[index] = slot;
        return slot;
      };

      // -------------------------------------------------------------
      // TEST 0: Filter Polish & Character Card Separation
      // -------------------------------------------------------------
      const logStep = msg => { logs.push(msg); console.log(msg); };
      logStep('Testing Filter Polish & Archetype Separation...');
      const collectible = CARDS.filter(c => !c.uncollectible && c.archetype !== 'Token');
      eq(collectible.length, 290, 'Total collectible cards should be 290');

      const expectedHeroCounts = {
        yugi: 43,
        kaiba: 29,
        joey: 27,
        pegasus: 26,
        jaden: 59,
        zane: 24,
        mai: 26,
        yusei: 20,
        staples: 36
      };
      for (const [hero, expected] of Object.entries(expectedHeroCounts)) {
        const count = collectible.filter(c => matchesHero(c, hero)).length;
        eq(count, expected, `Count for ${hero} expected ${expected}, got ${count}`);
      }

      // Verify no character-specific cards in staples
      const staplesCards = collectible.filter(c => matchesHero(c, 'staples'));
      const characterOnlyNames = [
        'Dark Magic Attack', 'Black Luster Ritual', 'Black Magic Ritual', 'Multiply',
        'The Flute of Summoning Dragon', 'Toon World', 'Black Illusion Ritual',
        'Power Bond', 'Skyscraper', "Harpie's Feather Duster", 'Tuning', 'Synchro Blast Wave'
      ];
      for (const name of characterOnlyNames) {
        ok(!staplesCards.some(c => c.name_en === name), `Card ${name} should NOT be in staples!`);
      }
      logStep('✓ Test 0 PASSED: Filter Polish & Archetype Separation verified');

      // -------------------------------------------------------------
      // TEST 1: Yusei Hero Skill ("Tăng Tốc Đồng Bộ")
      // -------------------------------------------------------------
      logStep('Testing Hero Skill: yusei...');
      // Scenario 1a: Valid execution - pays 500 LP, discards 1 card, searches Junk Synchron
      reset();
      duel.player.heroId = 7; // Yusei
      duel.player.lp = 4000;
      duel.player.hand = [id('Kuriboh')];
      duel.player.deck = [id('Junk Synchron'), id('Celtic Guardian')];
      eq(heroSkillProblem('player'), '', 'Skill should be available');
      await useHeroSkill();
      eq(duel.player.lp, 3500, 'Paid 500 LP fee');
      eq(duel.player.hand, [id('Junk Synchron')], 'Searched Junk Synchron into hand');
      eq(duel.player.grave, [id('Kuriboh')], 'Discarded Kuriboh as fee');
      eq(duel.player.skillUsed, true, 'Skill marked as used');

      // Scenario 1b: Low LP restriction (< 500 LP)
      reset();
      duel.player.heroId = 7;
      duel.player.lp = 500;
      duel.player.hand = [id('Kuriboh')];
      duel.player.deck = [id('Junk Synchron')];
      ok(heroSkillProblem('player').includes('LP'), 'Blocked when LP <= 500');

      // Scenario 1c: Empty hand restriction
      reset();
      duel.player.heroId = 7;
      duel.player.lp = 4000;
      duel.player.hand = [];
      duel.player.deck = [id('Junk Synchron')];
      ok(heroSkillProblem('player').includes('1 lá trên tay'), 'Blocked when hand empty');
      logStep('✓ Test 1 PASSED: Yusei skill (Tăng Tốc Đồng Bộ) verified');

      // -------------------------------------------------------------
      // TEST 2: Card 1 - Junk Synchron (AN-junk_synchron)
      // -------------------------------------------------------------
      logStep('Testing Card 1: Junk Synchron...');
      // Scenario 2a: Normal Summon with Lv <= 2 in GY -> revives in DEF, negated
      reset();
      duel.player.hand = [id('Junk Synchron')];
      duel.player.grave = [id('Speed Warrior')]; // Lv 2
      eq(card(id('Junk Synchron')).is_tuner, true, 'Junk Synchron is Tuner');
      await memeAnime.perform(() => memeAnime.normalSummon('player', 0, 'atk', []));
      ok(duel.player.monsters[0]?.id === id('Junk Synchron'), 'Junk Synchron on field');
      ok(duel.player.monsters[1]?.id === id('Speed Warrior'), 'Speed Warrior revived');
      eq(duel.player.monsters[1].position, 'def', 'Revived in DEF position');
      eq(duel.player.monsters[1].negated, true, 'Effects are negated');

      // Scenario 2b: Normal Summon with no Lv <= 2 in GY -> no revive
      reset();
      duel.player.hand = [id('Junk Synchron')];
      duel.player.grave = [id('Dark Magician')]; // Lv 7
      await memeAnime.perform(() => memeAnime.normalSummon('player', 0, 'atk', []));
      eq(duel.player.monsters[1], null, 'No monster revived when no Lv<=2');

      // Scenario 2c: Special Summoned -> no revive prompt
      reset();
      duel.player.hand = [id('Monster Reborn')];
      duel.player.grave = [id('Junk Synchron'), id('Speed Warrior')];
      await playSpell(0);
      eq(duel.player.monsters[0]?.id, id('Junk Synchron'), 'Revived by Monster Reborn');
      eq(duel.player.monsters[1], null, 'Special summon does not trigger normal summon effect');
      logStep('✓ Test 2 PASSED: Junk Synchron verified');

      // -------------------------------------------------------------
      // TEST 3: Card 2 - Speed Warrior (AN-speed_warrior)
      // -------------------------------------------------------------
      logStep('Testing Card 2: Speed Warrior...');
      // Scenario 3a: Normal summoned this turn -> ATK doubles to 1800 in Battle Phase
      reset();
      duel.player.hand = [id('Speed Warrior')];
      await memeAnime.perform(() => memeAnime.normalSummon('player', 0, 'atk', []));
      eq(effectiveAtk('player', duel.player.monsters[0]), 900, 'Base 900 in Main 1');
      duel.phase = 'BATTLE';
      eq(effectiveAtk('player', duel.player.monsters[0]), 1800, 'Doubled to 1800 in Battle Phase');

      // Scenario 3b: In Main 2 -> resets to 900
      duel.phase = 'MAIN2';
      eq(effectiveAtk('player', duel.player.monsters[0]), 900, 'Back to 900 in Main 2');

      // Scenario 3c: Not normal summoned this turn (e.g. previous turn) -> remains 900
      duel.round = 5;
      duel.phase = 'BATTLE';
      eq(effectiveAtk('player', duel.player.monsters[0]), 900, '900 in future turn Battle Phase');
      logStep('✓ Test 3 PASSED: Speed Warrior verified');

      // -------------------------------------------------------------
      // TEST 4: Card 3 - Quillbolt Hedgehog (AN-quillbolt_hedgehog)
      // -------------------------------------------------------------
      logStep('Testing Card 3: Quillbolt Hedgehog...');
      // Scenario 4a: In GY with face-up Tuner on field -> revives with banishOnLeave
      reset();
      put('player', 'Junk Synchron', 0, 'atk'); // Tuner on field
      duel.player.grave = [id('Quillbolt Hedgehog')];
      await memeAnime.perform(() => memeAnime.resolveEffect('player', card(id('Quillbolt Hedgehog')), { fromGrave: true }));
      ok(duel.player.monsters[1]?.id === id('Quillbolt Hedgehog'), 'Quillbolt revived to field');
      eq(duel.player.monsters[1].banishOnLeave, true, 'Marked banishOnLeave');

      // Scenario 4b: Leaves the field -> banished instead of grave
      await memeAnime.perform(() => memeAnime.remove('player', { slot: duel.player.monsters[1], index: 1, extra: false }, 'tribute'));
      ok(duel.player.banished.includes(id('Quillbolt Hedgehog')), 'Banished upon leaving field');
      ok(!duel.player.grave.includes(id('Quillbolt Hedgehog')), 'Not in grave');

      // Scenario 4c: No Tuner on field -> blocked
      reset();
      put('player', 'Celtic Guardian', 0, 'atk'); // Non-tuner
      duel.player.grave = [id('Quillbolt Hedgehog')];
      const res = await memeAnime.perform(() => memeAnime.resolveEffect('player', card(id('Quillbolt Hedgehog')), { fromGrave: true }));
      eq(res, false, 'Cannot revive without a face-up Tuner');
      logStep('✓ Test 4 PASSED: Quillbolt Hedgehog verified');

      // -------------------------------------------------------------
      // TEST 5: Card 4 - Sonic Chick (AN-sonic_chick)
      // -------------------------------------------------------------
      logStep('Testing Card 4: Sonic Chick...');
      // Scenario 5a: Attacked by monster with >= 1900 ATK -> NOT destroyed by battle
      reset();
      put('player', 'Sonic Chick', 0, 'atk'); // 300 ATK
      put('enemy', 'Blue-Eyes White Dragon', 0, 'atk'); // 3000 ATK
      duel.phase = 'BATTLE';
      await memeAnime.perform(() => memeAnime.battle('enemy', 0, false, 0));
      ok(duel.player.monsters[0]?.id === id('Sonic Chick'), 'Sonic Chick survives battle with 3000 ATK monster');
      eq(duel.player.lp, 1300, 'Damage (2700) still dealt');

      // Scenario 5b: Attacked by monster with < 1900 ATK -> destroyed normally
      reset();
      put('player', 'Sonic Chick', 0, 'atk'); // 300 ATK
      put('enemy', 'Celtic Guardian', 0, 'atk'); // 1400 ATK (< 1900)
      duel.phase = 'BATTLE';
      await memeAnime.perform(() => memeAnime.battle('enemy', 0, false, 0));
      eq(duel.player.monsters[0], null, 'Sonic Chick destroyed by < 1900 ATK monster');
      logStep('✓ Test 5 PASSED: Sonic Chick verified');

      // -------------------------------------------------------------
      // TEST 6: Card 5 - Shield Wing (AN-shield_wing)
      // -------------------------------------------------------------
      logStep('Testing Card 5: Shield Wing...');
      reset();
      put('player', 'Shield Wing', 0, 'def');
      put('enemy', 'Blue-Eyes White Dragon', 0, 'atk');
      put('enemy', 'Dark Magician', 1, 'atk');
      put('enemy', 'Vorse Raider', 2, 'atk');
      duel.phase = 'BATTLE';
      // Attack 1: survives
      await memeAnime.perform(() => memeAnime.battle('enemy', 0, false, 0));
      ok(duel.player.monsters[0]?.id === id('Shield Wing'), 'Shield Wing survives 1st attack');
      // Attack 2: survives
      await memeAnime.perform(() => memeAnime.battle('enemy', 1, false, 0));
      ok(duel.player.monsters[0]?.id === id('Shield Wing'), 'Shield Wing survives 2nd attack');
      // Attack 3: destroyed
      await memeAnime.perform(() => memeAnime.battle('enemy', 2, false, 0));
      eq(duel.player.monsters[0], null, 'Shield Wing destroyed on 3rd attack');
      logStep('✓ Test 6 PASSED: Shield Wing verified');

      // -------------------------------------------------------------
      // TEST 7: Card 6 - Junk Forward (AN-junk_forward)
      // -------------------------------------------------------------
      logStep('Testing Card 6: Junk Forward...');
      // Scenario 7a: Special summon from hand when field has 0 monsters
      reset();
      duel.player.hand = [id('Junk Forward')];
      eq(memeAnime.specialMode('player', card(id('Junk Forward'))), 'free', 'Special mode available when field empty');
      await memeAnime.perform(() => memeAnime.specialSummon('player', 0));
      ok(duel.player.monsters[0]?.id === id('Junk Forward'), 'Junk Forward special summoned');

      // Scenario 7b: Field has monsters -> special summon blocked
      reset();
      put('player', 'Kuriboh', 0, 'atk');
      duel.player.hand = [id('Junk Forward')];
      eq(memeAnime.specialMode('player', card(id('Junk Forward'))), null, 'Special mode blocked when field has monster');
      ok(cardSpecialProblem('player', card(id('Junk Forward'))).includes('KHÔNG điều khiển quái thú'), 'Clear error notice');

      // Scenario 7c: Can Normal Summon
      reset();
      duel.player.hand = [id('Junk Forward')];
      await memeAnime.perform(() => memeAnime.normalSummon('player', 0, 'atk', []));
      ok(duel.player.monsters[0]?.id === id('Junk Forward'), 'Junk Forward normal summoned');
      logStep('✓ Test 7 PASSED: Junk Forward verified');

      // -------------------------------------------------------------
      // TEST 8: Card 7 - Doppelwarrior & Doppel Token
      // -------------------------------------------------------------
      logStep('Testing Card 7: Doppelwarrior & Doppel Token...');
      // Scenario 8a: Special summon from hand when monster revived from GY
      reset();
      duel.player.hand = [id('Monster Reborn'), id('Doppelwarrior')];
      duel.player.grave = [id('Speed Warrior')];
      try { await playSpell(0); } catch(err) { console.log("CAUGHT PLAY SPELL ERR:", err && err.stack ? err.stack : err); throw err; }
      ok(duel.player.monsters.some(s => s?.id === id('Doppelwarrior')), 'Doppelwarrior special summoned from hand on GY revive');

      // Scenario 8b: Sent to GY as Synchro Material -> spawns 2 Doppel Tokens
      reset();
      put('player', 'Junk Synchron', 0, 'atk'); // Lv 3 Tuner
      put('player', 'Doppelwarrior', 1, 'atk'); // Lv 2 non-Tuner
      duel.player.extraDeck = [id('Junk Warrior')]; // Lv 5 Synchro
      ok(synchroOptions('player', duel.player.extraDeck[0]).length > 0, 'Synchro options found');
      await summonExtra(0);
      eq(duel.player.extra?.id, id('Junk Warrior'), 'Junk Warrior summoned');
      // Doppel Tokens should be spawned on field
      const tokens = duel.player.monsters.filter(s => s?.id === 'AN-doppel_token');
      eq(tokens.length, 2, '2 Doppel Tokens spawned');
      eq(tokens[0].token, true, 'Token flag set');
      eq(card('AN-doppel_token').atk, 400, 'Token ATK is 400');
      logStep('✓ Test 8 PASSED: Doppelwarrior & Doppel Token verified');

      // -------------------------------------------------------------
      // TEST 9: Card 8 - Effect Veiler (AN-effect_veiler)
      // -------------------------------------------------------------
      logStep('Testing Card 8: Effect Veiler...');
      reset();
      duel.turn = 'enemy';
      duel.phase = 'MAIN1';
      put('enemy', 'Time Wizard', 0, 'atk');
      duel.player.hand = [id('Effect Veiler')];
      await memeAnime.perform(() => memeAnime.resolveEffect('player', card(id('Effect Veiler')), { fromHand: true, handIndex: 0 }));
      eq(duel.enemy.monsters[0].negated, true, 'Opponent monster negated until end of turn');
      ok(duel.player.grave.includes(id('Effect Veiler')), 'Effect Veiler sent to GY as cost');
      logStep('✓ Test 9 PASSED: Effect Veiler verified');

      // -------------------------------------------------------------
      // TEST 10: Card 9 - Turbo Synchron (AN-turbo_synchron)
      // -------------------------------------------------------------
      logStep('Testing Card 9: Turbo Synchron...');
      reset();
      put('player', 'Turbo Synchron', 0, 'atk');
      put('enemy', 'Blue-Eyes White Dragon', 0, 'atk');
      duel.phase = 'BATTLE';
      await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
      eq(duel.enemy.monsters[0].position, 'def', 'Attack target switched to DEF');
      logStep('✓ Test 10 PASSED: Turbo Synchron verified');

      // -------------------------------------------------------------
      // TEST 11: Card 10 - Nitro Synchron (AN-nitro_synchron)
      // -------------------------------------------------------------
      logStep('Testing Card 10: Nitro Synchron...');
      reset();
      put('player', 'Nitro Synchron', 0, 'atk'); // Lv 2 Tuner
      put('player', 'Dark Magician', 1, 'atk'); // Lv 7? wait Nitro Warrior is Lv 7 (2+5)
      duel.player.monsters[1] = monsterSlot(id('Celtic Guardian'), 'atk'); // 4
      duel.player.monsters[2] = monsterSlot(id('Silver Fang'), 'atk'); // 3
      // 2 + 4 + 1? Or 2 + 5 (Curse of Dragon)
      duel.player.monsters[1] = monsterSlot(id('Curse of Dragon'), 'atk'); // 5
      duel.player.extraDeck = [id('Nitro Warrior')]; // Lv 7
      ok(synchroOptions('player', duel.player.extraDeck[0]).length > 0, 'Synchro options for Nitro Warrior');
      await summonExtra(0);
      eq(duel.player.extra?.id, id('Nitro Warrior'), 'Nitro Warrior summoned');
      eq(duel.player.nitroSynchronDrawReady, true, 'Nitro Synchron draw flag ready');

      // Now activate a spell -> draws 1 card
      duel.player.hand = [id('Pot of Greed')];
      duel.player.deck = [id('Kuriboh'), id('Dark Magician'), id('Celtic Guardian')];
      await playSpell(0);
      // Pot of Greed draws 2 + Nitro Synchron draws 1 = 3 cards drawn
      eq(duel.player.hand.length, 3, 'Drew 1 extra card from Nitro Synchron');
      eq(duel.player.nitroSynchronDrawReady, false, 'Nitro Synchron flag consumed');
      logStep('✓ Test 11 PASSED: Nitro Synchron verified');

      // -------------------------------------------------------------
      // TEST 12: Card 11 - Stardust Dragon (AN-stardust_dragon)
      // -------------------------------------------------------------
      logStep('Testing Card 11: Stardust Dragon...');
      // Scenario 12a: Negate and destroy destruction card (Raigeki)
      reset();
      put('player', 'Stardust Dragon', 0, 'atk');
      put('player', 'Kuriboh', 1, 'atk');
      duel.enemy.hand = [id('Raigeki')];
      await memeAnime.perform(() => memeAnime.playSpellFor('enemy', 0));
      ok(duel.player.grave.includes(id('Stardust Dragon')), 'Stardust Dragon tributed itself');
      ok(duel.player.monsters[1]?.id === id('Kuriboh'), 'Kuriboh saved from Raigeki');
      ok(duel.enemy.grave.includes(id('Raigeki')), 'Raigeki negated and destroyed');
      eq(duel.player.stardustReviveQueued, duel.round, 'Revival queued for End Phase');

      // Scenario 12b: End Phase revival
      await memeAnime.perform(() => memeAnime.endTurn('player'));
      ok(duel.player.monsters.some(s => s?.id === id('Stardust Dragon')), 'Stardust Dragon revived at End Phase');
      logStep('✓ Test 12 PASSED: Stardust Dragon verified');

      // -------------------------------------------------------------
      // TEST 13: Card 12 - Junk Warrior (AN-junk_warrior)
      // -------------------------------------------------------------
      logStep('Testing Card 12: Junk Warrior...');
      reset();
      put('player', 'Junk Synchron', 0, 'atk'); // Lv 3
      put('player', 'Speed Warrior', 1, 'atk'); // Lv 2
      put('player', 'Quillbolt Hedgehog', 2, 'atk'); // Lv 2, 800 ATK (will stay on field)
      duel.player.extraDeck = [id('Junk Warrior')]; // Lv 5
      await summonExtra(0);
      eq(duel.player.extra?.id, id('Junk Warrior'), 'Junk Warrior summoned');
      // Junk Warrior base 2300 + Quillbolt (800) = 3100 ATK
      eq(effectiveAtk('player', duel.player.extra), 3100, 'Gained 800 ATK from Quillbolt Hedgehog');
      logStep('✓ Test 13 PASSED: Junk Warrior verified');

      // -------------------------------------------------------------
      // TEST 14: Card 13 - Formula Synchron (AN-formula_synchron)
      // -------------------------------------------------------------
      logStep('Testing Card 13: Formula Synchron...');
      reset();
      put('player', 'Turbo Synchron', 0, 'atk'); // Lv 1 Tuner
      put('player', 'Sonic Chick', 1, 'atk'); // Lv 1 non-Tuner
      duel.player.extraDeck = [id('Formula Synchron')]; // Lv 2
      duel.player.deck = [id('Kuriboh')];
      duel.player.hand = [];
      await summonExtra(0);
      eq(duel.player.extra?.id, id('Formula Synchron'), 'Formula Synchron summoned');
      eq(duel.player.hand.length, 1, 'Formula Synchron draws 1 card on summon');
      eq(card(id('Formula Synchron')).is_tuner, true, 'Formula Synchron is Synchro / Tuner');
      logStep('✓ Test 14 PASSED: Formula Synchron verified');

      // -------------------------------------------------------------
      // TEST 15: Card 14 - Armory Arm (AN-armory_arm)
      // -------------------------------------------------------------
      logStep('Testing Card 14: Armory Arm...');
      reset();
      put('player', 'Dark Magician', 0, 'atk'); // 2500 ATK
      put('player', 'Armory Arm', 1, 'atk');
      // Equip Armory Arm from field to Dark Magician (only face-up monster on field)
      await memeAnime.perform(() => memeAnime.resolveEffect('player', card(id('Armory Arm')), { source: duel.player.monsters[1] }));
      eq(effectiveAtk('player', duel.player.monsters[0]), 3500, 'Dark Magician gains +1000 ATK (3500)');

      // Now place enemy monster Blue-Eyes White Dragon
      put('enemy', 'Blue-Eyes White Dragon', 0, 'atk'); // 3000 ATK
      // Attack Blue-Eyes: destroys Blue-Eyes, burns enemy LP for 3000
      duel.phase = 'BATTLE';
      await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
      // Battle damage: 3500 - 3000 = 500
      // Burn damage: 3000
      // Total enemy LP loss: 3500 -> 4000 - 3500 = 500 LP remaining
      eq(duel.enemy.lp, 500, 'Burn damage equal to destroyed monster ATK applied');
      logStep('✓ Test 15 PASSED: Armory Arm verified');

      // -------------------------------------------------------------
      // TEST 16: Card 15 - Nitro Warrior (AN-nitro_warrior)
      // -------------------------------------------------------------
      logStep('Testing Card 15: Nitro Warrior...');
      reset();
      put('player', 'Nitro Warrior', 0, 'atk'); // 2800 ATK
      duel.player.hand = [id('Pot of Greed')];
      await playSpell(0);
      eq(effectiveAtk('player', duel.player.monsters[0]), 3800, 'Gains 1000 ATK on next attack after spell');

      // Attack: after destroying opponent monster, second attack on DEF monster
      put('enemy', 'Kuriboh', 0, 'atk');
      put('enemy', 'Giant Soldier of Stone', 1, 'def');
      duel.phase = 'BATTLE';
      await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0));
      eq(duel.enemy.monsters[1].position, 'atk', 'Switched opponent DEF monster to ATK');
      eq(duel.player.monsters[0].attacksUsed, 0, 'Granted second attack');
      logStep('✓ Test 16 PASSED: Nitro Warrior verified');

      // -------------------------------------------------------------
      // TEST 17: Card 16 - Scrap-Iron Scarecrow (AN-scrap_iron_scarecrow)
      // -------------------------------------------------------------
      logStep('Testing Card 16: Scrap-Iron Scarecrow...');
      reset();
      put('enemy', 'Blue-Eyes White Dragon', 0, 'atk');
      duel.player.spells[0] = { id: id('Scrap-Iron Scarecrow'), faceDown: true, setRound: 1 };
      duel.phase = 'BATTLE';
      await memeAnime.perform(() => memeAnime.battle('enemy', 0, false, null));
      eq(duel.player.lp, 4000, 'Attack negated, no direct damage');
      ok(duel.player.spells[0]?.faceDown, 'Scrap-Iron Scarecrow set itself face-down on field');
      ok(!duel.player.grave.includes(id('Scrap-Iron Scarecrow')), 'Not sent to grave');
      eq(duel.player.spells[0].setRound, duel.round, 'setRound updated to prevent reuse this turn');
      logStep('✓ Test 17 PASSED: Scrap-Iron Scarecrow verified');

      // -------------------------------------------------------------
      // TEST 18: Card 17 - Tuning (AN-tuning)
      // -------------------------------------------------------------
      logStep('Testing Card 17: Tuning...');
      reset();
      duel.player.hand = [id('Tuning')];
      duel.player.deck = [id('Junk Synchron'), id('Kuriboh'), id('Celtic Guardian')];
      await playSpell(0);
      ok(duel.player.hand.includes(id('Junk Synchron')), 'Searched Junk Synchron into hand');
      ok(duel.player.grave.includes(id('Kuriboh')) || duel.player.grave.includes(id('Celtic Guardian')), 'Top deck card milled to GY');
      eq(duel.player.deck.length, 1, '1 card remaining in deck after search and mill');
      ok(duel.player.grave.includes(id('Tuning')), 'Tuning spent');
      logStep('✓ Test 18 PASSED: Tuning verified');

      // -------------------------------------------------------------
      // TEST 19: Card 18 - Synchro Blast Wave (AN-synchro_blast_wave)
      // -------------------------------------------------------------
      logStep('Testing Card 18: Synchro Blast Wave...');
      // Scenario 19a: Control Synchro monster -> destroys opponent monster
      reset();
      put('player', 'Junk Warrior', 0, 'atk');
      put('enemy', 'Blue-Eyes White Dragon', 0, 'atk');
      duel.player.hand = [id('Synchro Blast Wave')];
      await playSpell(0);
      eq(duel.enemy.monsters[0], null, 'Opponent monster destroyed by Synchro Blast Wave');

      // Scenario 19b: No Synchro monster controlled -> cannot activate
      reset();
      put('player', 'Celtic Guardian', 0, 'atk');
      put('enemy', 'Blue-Eyes White Dragon', 0, 'atk');
      duel.player.hand = [id('Synchro Blast Wave')];
      const resBlast = await playSpell(0);
      eq(resBlast, false, 'Cannot activate without Synchro monster');
      logStep('✓ Test 19 PASSED: Synchro Blast Wave verified');

      // -------------------------------------------------------------
      // TEST 20: Card 19 - Limiter Overload (AN-limiter_overload)
      // -------------------------------------------------------------
      logStep('Testing Card 20: Limiter Overload...');
      reset();
      duel.player.deck = [id('Speed Warrior')];
      // When Limiter Overload is sent to GY by any means (e.g. milled or discarded or destroyed)
      await memeAnime.perform(() => {
        duel.player.grave.push(id('Limiter Overload'));
        window.memeAnime.tcgCore.sentToGrave('player', id('Limiter Overload'), true, 'effect');
      });
      ok(duel.player.monsters.some(s => s?.id === id('Speed Warrior')), 'Speed Warrior special summoned on Limiter Overload GY send');
      logStep('✓ Test 20 PASSED: Limiter Overload verified');

      // -------------------------------------------------------------
      // TEST 21: Card 20 - Spirit Force (AN-spirit_force)
      // -------------------------------------------------------------
      logStep('Testing Card 21: Spirit Force...');
      reset();
      put('enemy', 'Blue-Eyes White Dragon', 0, 'atk'); // 3000 ATK
      duel.player.spells[0] = { id: id('Spirit Force'), faceDown: true, setRound: 1 };
      duel.player.grave = [id('Junk Synchron')]; // DEF 320 <= 3000
      duel.phase = 'BATTLE';
      await memeAnime.perform(() => memeAnime.battle('enemy', 0, false, null));
      eq(duel.player.lp, 4000, 'Battle damage reduced to 0 by Spirit Force');
      ok(duel.player.hand.includes(id('Junk Synchron')), 'Warrior Tuner returned from GY to hand');
      logStep('✓ Test 21 PASSED: Spirit Force verified');

      return logs;
    });

    console.log('\n--- TEST SUITE LOGS ---');
    testResults.forEach(l => console.log(l));
    console.log('\n=======================================');
    console.log('ALL 22 YUSEI TEST SUITES PASSED 100%!');
    console.log('=======================================\n');

  } catch (err) {
    console.error('TEST RUNNER FAILED:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
