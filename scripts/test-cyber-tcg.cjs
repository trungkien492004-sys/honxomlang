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
        ok(card('AN-chimeratech_overdragon').description.includes('800 × số nguyên liệu'), 'Chimeratech text');
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
        const chimera = duel.player.monsters.find(slot => slot?.id === 'AN-chimeratech_overdragon');
        ok(chimera, 'Chimeratech Fusion Summoned');
        eq(duel.player.monsters.filter(Boolean).length, 1, 'other monsters sent to GY');
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
