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
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' })[path.extname(f)] || 'text/plain');
    res.end(b);
  });
});
server.listen(0, async () => {
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: 'new', executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()); });
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`http://localhost:${port}/memecard.html`);
    await page.waitForFunction(() => window.memeAnime && window.MEME_DUEL_LINKS_GROUP);
    const out = await page.evaluate(async () => {
      const log = [];
      const reset = async auto => {
        clearTimeout(aiTimer); await memeAnime.flush?.(); memeFx.reset(); closeModal(); memeMusic.setEnabled(false); memeAnime.setAuto(auto);
        duel = { player: blankSide(defaultDeck()), enemy: blankSide(defaultDeck()), turn: 'player', phase: 'MAIN1', round: 3, normalSummoned: false, mode: null, pending: null, selected: null, logs: [], finished: false };
        for (const n of ['player', 'enemy']) { duel[n].hand = []; duel[n].grave = []; duel[n].banished = []; duel[n].monsters = [null, null, null]; duel[n].spells = [null, null, null]; duel[n].extra = null; }
        $('lobby')?.classList.add('hidden'); $('duel')?.classList.remove('hidden'); render();
      };
      // 1: send Liquid Soldier to GY by effect
      await reset(true);
      duel.player.hand = ['DL-elemental_hero_liquid_soldier'];
      duel.player.deck = ['AN-kuriboh', 'AN-kuriboh2', 'AN-kuriboh3'];
      render();
      const liquidSlot = { ...monsterSlot('DL-elemental_hero_liquid_soldier', 'atk'), uid: 'liq' };
      duel.player.monsters[0] = liquidSlot; render();
      const deckBefore = duel.player.deck.length;
      await memeAnime.perform(async () => { memeRules.remove('player', { slot: liquidSlot, index: 0 }, 'effect'); });
      log.push({ test: 'liquid-soldier GY by effect', hand: duel.player.hand.length, deckBefore, deckAfter: duel.player.deck.length, grave: [...duel.player.grave] });

      // 2: Solid Soldier to GY by effect with a HERO in grave
      await reset(true);
      duel.player.grave = ['AN-elemental_hero_clayman'];
      const solidSlot = { ...monsterSlot('DL-elemental_hero_solid_soldier', 'atk'), uid: 'sol' };
      duel.player.monsters[0] = solidSlot; render();
      await memeAnime.perform(async () => { memeRules.remove('player', { slot: solidSlot, index: 0 }, 'effect'); });
      log.push({ test: 'solid-soldier GY by effect', grave: [...duel.player.grave], monsters: duel.player.monsters.filter(Boolean).map(m => m.id) });

      // 3: Solid Soldier as fusion material (field) into a HERO fusion
      await reset(true);
      duel.player.extraDeck = ['AN-elemental_hero_flame_wingman'];
      duel.player.hand = ['AN-elemental_hero_avian', 'AN-elemental_hero_burstinatrix'];
      duel.player.grave = ['AN-elemental_hero_clayman'];
      duel.player.monsters[0] = { ...monsterSlot('DL-elemental_hero_solid_soldier', 'atk'), uid: 'sol2' };
      render();
      const fuseOk = await memeAnime.perform(async () => {
        const opts = memeAnime.fusionOptions('player');
        const target = opts.find(o => o.card?.id === 'AN-elemental_hero_flame_wingman') || opts[0];
        return target ? memeAnime.fuse('player', target) : 'no-option:' + JSON.stringify(opts.map(o => o.card?.id || o.id));
      });
      log.push({ test: 'solid-soldier as material via fuse', fuseOk, grave: [...duel.player.grave], monsters: duel.player.monsters.filter(Boolean).map(m => m.id), hand: [...duel.player.hand] });

      // 4: White Stone of Ancients end turn summon
      await reset(true);
      duel.player.grave = ['DL-the_white_stone_of_ancients'];
      duel.player.deck = ['AN-blue_eyes_white_dragon'];
      duel.player.stoneTesting = true;
      await memeAnime.onSentToGrave('player', 'DL-the_white_stone_of_ancients', true);
      await memeAnime.endTurn('player');
      await memeAnime.flush();
      log.push({ test: 'ancients end turn', monsters: duel.player.monsters.filter(Boolean).map(m => m.id), grave: [...duel.player.grave] });

      // 5: White Stone of Legend sent to grave
      await reset(true);
      duel.player.deck = ['AN-blue_eyes_white_dragon'];
      await memeAnime.perform(async () => { memeAnime.tcgCore?.sentToGrave ? memeAnime.tcgCore.sentToGrave('player', 'DL-the_white_stone_of_legend', true) : window.memeAnime.onSentToGrave('player', 'DL-the_white_stone_of_legend', true); });
      await memeAnime.flush();
      log.push({ test: 'stone of legend', hand: [...duel.player.hand], deck: [...duel.player.deck] });
      return { log, errors: [] };
    });
    console.log(JSON.stringify(out, null, 2));
    console.log('PAGE ERRORS:', JSON.stringify(errors));
  } finally {
    await browser.close();
    server.close();
  }
});
