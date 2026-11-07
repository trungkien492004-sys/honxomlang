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

      await test('TCG data patch enables Cyber Valley and Cyberdark protection', async () => {
        eq(card('AN-cyber_valley').effect_trigger, 'activated', 'Cyber Valley activated');
        eq(card('AN-cyber_valley').effect_code, 'cyber_valley', 'Cyber Valley code');
        eq(card('AN-cyber_phoenix').traits.includes('cyber_phoenix'), true, 'Phoenix trait');
        for (const id of ['AN-cyberdark_horn', 'AN-cyberdark_edge', 'AN-cyberdark_keel', 'AN-cyberdark_dragon'])
          eq(card(id).traits.includes('cyberdark_guard'), true, id + ' guard trait');
        ok(card('AN-chimeratech_overdragon').description.includes('×800'), 'Chimeratech text');
      });

      await test('Cyber Phoenix negates Spell/Trap targets on Machines only in Attack Position', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-cyber_phoenix', 'atk'), uid: 'phoenix' };
        duel.player.monsters[1] = { ...monsterSlot('AN-cyber_dragon', 'atk'), uid: 'dragon' };
        render();
        const target = { name: 'player', slot: duel.player.monsters[1], index: 1, id: 'AN-cyber_dragon', type: 'monster' };
        eq(memeAnime.tcgCore.spellTargetAllowed('enemy', card('AN-change_of_heart'), target), false, 'negated in ATK');
        duel.player.monsters[0].position = 'def';
        eq(memeAnime.tcgCore.spellTargetAllowed('enemy', card('AN-change_of_heart'), target), true, 'allowed in DEF');
      });

      await test('Cyber Phoenix draws only when destroyed by battle', async () => {
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh'];
        duel.player.monsters[0] = { ...monsterSlot('AN-cyber_phoenix', 'atk'), uid: 'phoenix-effect' };
        render();
        await memeAnime.perform(() => memeRules.remove('player', { slot: duel.player.monsters[0], index: 0 }, 'effect'));
        eq(duel.player.hand.length, 0, 'no draw from effect destruction');
        duel.player.monsters[0] = { ...monsterSlot('AN-cyber_phoenix', 'atk'), uid: 'phoenix-battle' };
        render();
        await memeAnime.perform(() => memeRules.remove('player', { slot: duel.player.monsters[0], index: 0 }, 'battle'));
        eq(duel.player.hand.length, 1, 'draw from battle destruction');
        eq(duel.player.deck.length, 1, 'one card left');
      });

      await test('Cyber Valley banishes itself and a face-up monster to draw 2', async () => {
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh'];
        duel.player.monsters[0] = { ...monsterSlot('AN-cyber_valley', 'atk'), uid: 'valley-pair' };
        duel.player.monsters[1] = { ...monsterSlot('AN-cyber_dragon', 'atk'), uid: 'pair-target' };
        render();
        const source = duel.player.monsters[0];
        await activateMonsterEffect(0);
        eq(duel.player.banished.includes('AN-cyber_valley'), true, 'Cyber Valley banished');
        eq(duel.player.banished.includes('AN-cyber_dragon'), true, 'target banished');
        eq(duel.player.monsters.filter(Boolean).length, 0, 'both left the field');
        eq(duel.player.hand.length, 2, 'drew 2');
        eq(duel.player.deck.length, 0, 'deck emptied');
        eq(source.effectUsedRound, duel.round, 'once per turn marked');
      });

      await test('Cyber Valley banishes a hand card to put a GY card on top of the Deck', async () => {
        duel.player.hand = ['AN-kuriboh'];
        duel.player.grave = ['AN-cyber_dragon'];
        duel.player.deck = ['AN-exploder_dragon'];
        duel.player.monsters[0] = { ...monsterSlot('AN-cyber_valley', 'atk'), uid: 'valley-top' };
        render();
        await activateMonsterEffect(0);
        eq(duel.player.banished.includes('AN-cyber_valley'), true, 'Cyber Valley banished');
        eq(duel.player.banished.includes('AN-kuriboh'), true, 'hand card banished');
        eq(duel.player.grave.length, 0, 'GY target left the grave');
        eq(duel.player.deck[0], 'AN-cyber_dragon', 'target placed on top');
        eq(duel.player.hand.length, 0, 'hand card spent');
      });

      await test('Cyber Valley attacked banishes itself, draws 1 and ends the Battle Phase', async () => {
        duel.player.deck = ['AN-kuriboh'];
        duel.player.monsters[0] = { ...monsterSlot('AN-cyber_valley', 'atk'), uid: 'valley-battle' };
        duel.enemy.monsters[0] = { ...monsterSlot('AN-cyber_dragon', 'atk'), uid: 'valley-attacker' };
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('enemy', 0, false, 0, false));
        eq(duel.player.banished.includes('AN-cyber_valley'), true, 'Cyber Valley banished');
        eq(duel.player.hand.length, 1, 'drew 1');
        eq(duel.phase, 'MAIN2', 'Battle Phase ended');
        eq(duel.player.monsters[0], null, 'defender zone empty');
        eq(duel.enemy.monsters[0]?.id, 'AN-cyber_dragon', 'attacker stays');
        eq(duel.player.lp, 4000, 'no battle damage');
      });

      await test('Cyberdark equips a Level 3 Dragon on Normal Summon and protects itself in battle', async () => {
        duel.player.hand = ['AN-cyberdark_horn'];
        duel.player.grave = ['AN-baby_dragon'];
        render();
        await memeAnime.perform(() => memeAnime.normalSummon('player', 0));
        const horn = duel.player.monsters.find(slot => slot?.id === 'AN-cyberdark_horn');
        ok(horn, 'Cyberdark Horn summoned');
        const equipped = duel.player.spells.find(slot => slot?.equippedTo === horn.uid);
        ok(equipped, 'dragon equipped');
        eq(equipped.id, 'AN-baby_dragon', 'Level 3 Dragon equipped');
        eq(equipped.cyberdarkEquip, true, 'equip belongs to Cyberdark effect');
        eq(memeAnime.tcgCore.stat('player', horn), 2000, 'ATK gains the equipped Dragon ATK');
        duel.battleContext = { owner: 'enemy', attacker: { id: 'AN-blue_eyes_white_dragon', position: 'atk', uid: 'horn-attacker' }, defender: horn };
        const removed = await memeAnime.perform(() => memeRules.remove('player', { slot: horn, index: duel.player.monsters.indexOf(horn) }, 'battle'));
        eq(removed, false, 'battle destruction replaced');
        eq(duel.player.monsters.includes(horn), true, 'Cyberdark survives');
        eq(duel.player.spells.some(slot => slot?.equippedTo === horn.uid), false, 'equip destroyed instead');
        eq(duel.player.grave.includes('AN-baby_dragon'), true, 'equipped Dragon sent to GY');
        duel.battleContext = null;
      });

      await test('Exploder Dragon blocks battle damage and destroys its destroyer', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-exploder_dragon', 'atk'), uid: 'exploder' };
        duel.enemy.monsters[0] = { ...monsterSlot('AN-blue_eyes_white_dragon', 'atk'), uid: 'exploder-victim' };
        duel.phase = 'BATTLE';
        render();
        await memeAnime.perform(() => memeAnime.battle('player', 0, false, 0, false));
        eq(duel.player.lp, 4000, 'no damage to Exploder controller');
        eq(duel.enemy.lp, 4000, 'no damage to the other player');
        eq(duel.player.grave.includes('AN-exploder_dragon'), true, 'Exploder destroyed');
        eq(duel.enemy.monsters.some(slot => slot?.id === 'AN-blue_eyes_white_dragon'), false, 'destroyer destroyed');
      });

      await test('Chimeratech Overdragon sends all other cards to the GY and scales with materials', async () => {
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['AN-chimeratech_overdragon'];
        duel.player.monsters[0] = { ...monsterSlot('AN-cyber_dragon', 'atk'), uid: 'chimera-material-1' };
        duel.player.monsters[1] = { ...monsterSlot('AN-proto_cyber_dragon', 'atk'), uid: 'chimera-material-2' };
        duel.player.spells[0] = { id: 'AN-toon_world', faceDown: true, setRound: 0 };
        duel.player.field = { id: 'AN-toon_world' };
        render();
        await memeAnime.perform(() => memeAnime.playSpellFor('player', 0));
        const chimera = duel.player.extra?.id === 'AN-chimeratech_overdragon' ? duel.player.extra : null;
        ok(chimera, 'Chimeratech Fusion Summoned to the Extra Monster Zone');
        eq(duel.player.monsters.filter(Boolean).length, 0, 'other monsters sent to GY');
        eq(duel.player.spells.filter(Boolean).length, 0, 'spells sent to GY');
        eq(duel.player.field, null, 'field spell sent to GY');
        eq(duel.player.grave.includes('AN-toon_world'), true, 'field spell in GY');
        eq(chimera.materialCount, 2, 'two materials used');
        eq(memeAnime.tcgCore.stat('player', chimera), 1600, 'ATK 800 x materials');
      });

      await test('Chimeratech Overdragon attacks monsters equal to materials but directly only once', async () => {
        const chimera = { ...monsterSlot('AN-chimeratech_overdragon', 'atk'), uid: 'chimera-attacks', materialCount: 3 };
        duel.player.monsters[0] = chimera;
        duel.enemy.monsters[0] = { ...monsterSlot('AN-kuriboh', 'atk'), uid: 'chimera-target' };
        render();
        eq(memeAnime.attacksRemaining(chimera), 3, 'three attacks against monsters');
        duel.enemy.monsters[0] = null;
        eq(memeAnime.attacksRemaining(chimera), 1, 'single direct attack');
      });

      await test('Rename on field: Proto, Duel Links Dragons and Alternative Blue-Eyes change names', async () => {
        const cd = memeAnime.tcgCore.aid('Cyber Dragon'), be = memeAnime.tcgCore.aid('Blue-Eyes White Dragon');
        eq(cd, 'AN-cyber_dragon', 'Cyber Dragon resolves to the anime card');
        eq(memeAnime.treatedName('AN-proto_cyber_dragon', 'field'), cd, 'Proto Cyber Dragon is named Cyber Dragon on the field');
        eq(memeAnime.treatedName('AN-proto_cyber_dragon', 'field', false), 'AN-proto_cyber_dragon', 'a face-down Proto keeps its own name');
        eq(memeAnime.treatedName('AN-proto_cyber_dragon', 'grave'), 'AN-proto_cyber_dragon', 'Proto keeps its own name in the Graveyard');
        eq(memeAnime.treatedName('AN-proto_cyber_dragon', 'hand'), 'AN-proto_cyber_dragon', 'Proto keeps its own name in the hand');
        for (const id of ['DL-cyber_dragon_core', 'DL-cyber_dragon_nachster', 'DL-cyber_dragon_vier']) {
          eq(memeAnime.treatedName(id, 'field'), cd, id + ' is named Cyber Dragon on the field');
          eq(memeAnime.treatedName(id, 'grave'), cd, id + ' is named Cyber Dragon in the Graveyard');
          eq(memeAnime.treatedName(id, 'hand'), id, id + ' keeps its own name in the hand');
        }
        eq(memeAnime.treatedName('DL-blue_eyes_alternative_white_dragon', 'field'), be, 'Alternative Dragon is named Blue-Eyes on the field');
        eq(memeAnime.treatedName('DL-blue_eyes_alternative_white_dragon', 'grave'), be, 'and in the Graveyard');
        eq(memeAnime.treatedName('DL-blue_eyes_alternative_white_dragon', 'hand'), 'DL-blue_eyes_alternative_white_dragon', 'but not in the hand');
        eq(memeAnime.treatedName('AN-dark_magician', 'field'), 'AN-dark_magician', 'unrelated monsters keep their name');
      });

      await test('The board shows the treated name and keeps the real name in the tooltip', async () => {
        duel.player.monsters[0] = { ...monsterSlot('AN-proto_cyber_dragon', 'atk'), uid: 'proto-label', summonedRound: 0 };
        render();
        const cell = document.querySelector('[data-side="player"][data-zone="monster"][data-index="0"]');
        ok(cell, 'the monster cell renders');
        const label = cell.querySelector('.slot-label')?.textContent || '';
        ok(label.includes(card('AN-cyber_dragon').name), `slot label shows the treated name, got "${label}"`);
        ok(!label.includes(card('AN-proto_cyber_dragon').name), 'the original name is not shown on the slot');
        ok((cell.title || '').startsWith(`${card('AN-cyber_dragon').name} (gốc: ${card('AN-proto_cyber_dragon').name})`), `the tooltip names both cards, got "${cell.title}"`);
        eq(memeAnime.fieldName(duel.player.monsters[0]), card('AN-cyber_dragon').name, 'fieldName returns the display name');
        duel.player.monsters[0].position = 'def_down';
        render();
        eq(memeAnime.fieldName(duel.player.monsters[0]), card('AN-proto_cyber_dragon').name, 'a face-down slot keeps the real name');
      });

      await test('Fusion recipes read the treated name: Proto plus Cyber Dragon makes Cyber Twin', async () => {
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['AN-cyber_twin_dragon'];
        duel.player.monsters[0] = { ...monsterSlot('AN-proto_cyber_dragon', 'atk'), uid: 'twin-proto', summonedRound: 0 };
        duel.player.monsters[1] = { ...monsterSlot('AN-cyber_dragon', 'atk'), uid: 'twin-cyber', summonedRound: 0 };
        render();
        eq(memeAnime.fusionOptions('player', 'AN-cyber_twin_dragon').length > 0, true, 'Proto plus Cyber Dragon is a legal recipe');
        await memeAnime.perform(() => memeAnime.playSpellFor('player', 0));
        const twin = duel.player.extra?.id === 'AN-cyber_twin_dragon' ? duel.player.extra : null;
        ok(twin, 'Cyber Twin Dragon is Fusion Summoned');
        eq(duel.player.monsters.filter(Boolean).length, 0, 'both materials left the field');
        eq(twin.materials.includes('AN-proto_cyber_dragon'), true, 'the renamed Proto is recorded as material');
      });

      await test('Cyber Repair Plant only looks for a Cyber Dragon name in the Graveyard', async () => {
        duel.player.hand = ['DL-cyber_repair_plant'];
        duel.player.grave = ['AN-proto_cyber_dragon', 'AN-kuriboh'];
        duel.player.deck = ['DL-cyber_dragon_vier', 'AN-kuriboh'];
        render();
        const protoOnly = await memeAnime.perform(() => memeAnime.playSpellFor('player', 0));
        eq(protoOnly, false, 'a Proto in the Graveyard is not a Cyber Dragon');
        eq(duel.player.hand.includes('DL-cyber_repair_plant'), true, 'the spell stays usable');
        duel.player.grave = ['DL-cyber_dragon_core', 'AN-kuriboh'];
        render();
        await memeAnime.perform(() => memeAnime.playSpellFor('player', 0));
        eq(duel.player.hand.includes('DL-cyber_dragon_vier'), true, 'the Duel Links Dragon in the Graveyard opens the search');
        eq(duel.player.grave.includes('DL-cyber_dragon_core'), true, 'the Graveyard card is unchanged');
      });

      await test('Cyber Dragon Nachster revives a Machine with 2100 ATK or DEF on summon', async () => {
        duel.player.hand = ['DL-cyber_dragon_nachster'];
        duel.player.grave = ['AN-cyber_dragon', 'AN-kuriboh'];
        render();
        await memeAnime.perform(() => memeAnime.normalSummon('player', 0));
        const board = duel.player.monsters.map(slot => slot?.id || null);
        eq(board.includes('DL-cyber_dragon_nachster'), true, 'Nachster is Normal Summoned');
        eq(board.includes('AN-cyber_dragon'), true, 'the 2100 ATK Machine is revived');
        eq(duel.player.grave.includes('AN-cyber_dragon'), false, 'the revived card leaves the Graveyard');
        const nachster = duel.player.monsters.find(slot => slot?.id === 'DL-cyber_dragon_nachster');
        eq(nachster.nachsterRound, duel.round, 'the effect is marked once per turn');
        duel.player.grave = ['AN-cyber_dragon'];
        render();
        const again = await memeAnime.perform(() => memeAnime.resolveEffect('player', card('DL-cyber_dragon_nachster'), { source: nachster, kind: 'summon' }));
        eq(again, false, 'the effect cannot run twice in the same turn');
        eq(duel.player.grave.includes('AN-cyber_dragon'), true, 'the second attempt revives nothing');
      });

      await test('Cyber Dragon Nachster ignores Machines without 2100 ATK or DEF', async () => {
        duel.player.hand = ['DL-cyber_dragon_nachster'];
        duel.player.grave = ['AN-kuriboh'];
        render();
        await memeAnime.perform(() => memeAnime.normalSummon('player', 0));
        eq(duel.player.monsters.filter(Boolean).length, 1, 'only Nachster is on the field');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'the non-Machine stays in the Graveyard');
      });

      await test('Cyber Dragon Vier is summoned from the hand and gives Cyber Dragons 500 ATK', async () => {
        duel.player.hand = ['DL-cyber_dragon_core', 'DL-cyber_dragon_vier'];
        duel.player.deck = ['AN-kuriboh'];
        render();
        await memeAnime.perform(() => memeAnime.normalSummon('player', 0));
        const core = duel.player.monsters.find(slot => slot?.id === 'DL-cyber_dragon_core');
        ok(core, 'the Level 2 Core is Normal Summoned');
        const vier = duel.player.monsters.find(slot => slot?.id === 'DL-cyber_dragon_vier');
        ok(vier, 'Vier was Special Summoned from the hand because a Cyber Dragon name entered the field');
        eq(vier.position, 'def', 'Vier arrives in Defense Position');
        eq(duel.player.hand.includes('DL-cyber_dragon_vier'), false, 'Vier left the hand');
        eq(memeAnime.tcgCore.stat('player', core), 900, 'the Core gains 500 ATK from Vier');
        eq(memeAnime.tcgCore.stat('player', vier), 2100, 'Vier is also named Cyber Dragon so it gains the aura');
        eq(duel.player.vierSpecialRound, duel.round, 'the hand summon is marked once per turn');
      });

      await test('Chimeratech Rampage Dragon destroys backrow by material count on summon', async () => {
        duel.player.monsters[0] = { ...monsterSlot('DL-chimeratech_rampage_dragon', 'atk'), uid: 'rampage', materialCount: 2, materials: ['AN-cyber_dragon', 'AN-proto_cyber_dragon'] };
        duel.enemy.spells = [{ id: 'AN-mirror_force', faceDown: true, setRound: 1 }, { id: 'DL-cyber_repair_plant', faceDown: true, setRound: 1 }, { id: 'AN-waboku', faceDown: true, setRound: 1 }];
        render();
        const resolved = await memeAnime.perform(() => memeAnime.resolveEffect('player', card('DL-chimeratech_rampage_dragon'), { source: duel.player.monsters[0], kind: 'summon' }));
        eq(resolved, true, 'the on-summon destruction resolves');
        eq(duel.enemy.spells.filter(Boolean).length, 1, 'only two of the three sets are destroyed with two materials');
        eq(duel.player.monsters[0].rampageDestroyRound, duel.round, 'the summon effect is marked once per turn');
      });

      await test('Chimeratech Rampage Dragon sends LIGHT Machines from the Deck for extra attacks', async () => {
        const rampage = { ...monsterSlot('DL-chimeratech_rampage_dragon', 'atk'), uid: 'rampage-boost', materialCount: 2 };
        duel.player.monsters[0] = rampage;
        duel.player.deck = ['DL-cyber_dragon_core', 'DL-cyber_dragon_vier', 'AN-kuriboh'];
        render();
        eq(memeAnime.attacksRemaining(rampage), 1, 'one attack before the boost');
        const boosted = await memeAnime.perform(() => window.memeDlRampageExtraAttacks('player', rampage));
        eq(boosted, true, 'the boost resolves');
        eq(rampage.rampageExtraAttacks, 2, 'two LIGHT Machines were sent from the Deck');
        eq(memeAnime.attacksRemaining(rampage), 3, 'the attack count follows the boosted limit');
        eq(duel.player.grave.includes('AN-kuriboh'), false, 'non-Machine cards are not buried');
        eq(duel.player.deck.includes('AN-kuriboh'), true, 'the only remaining Deck card is the Kuriboh');
        const again = await memeAnime.perform(() => window.memeDlRampageExtraAttacks('player', rampage));
        eq(again, false, 'the boost is limited to once per turn');
        duel.round = duel.round + 2;
        eq(memeAnime.attacksRemaining(rampage), 1, 'the bonus expires with the turn');
      });

      return results;
    });

    testResults.forEach(r => console.log('✅ ' + r));
    if (errors.length) throw Error('Page errors: ' + errors.join(' | '));
    console.log(`🎉 All ${testResults.length} Cyber TCG tests passed.`);
  } finally {
    await browser.close();
    server.close();
  }
});
