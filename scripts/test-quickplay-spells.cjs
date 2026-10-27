const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..'), pub = path.join(root, 'dist');

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

// Every Quick-Play Spell currently in the game: 2 MGX masks + 7 Duel Links spells.
const QUICK_PLAY = [
  'MGX-mask_change', 'MGX-mask_change_ii',
  'DL-silvers_cry', 'DL-illusion_magic', 'DL-toon_page_flipper', 'DL-relinquished_fusion',
  'DL-form_change', 'DL-cyberload_fusion', 'DL-cybernetic_fusion_support'
];

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
      console.error('PAGE ERROR:', e.message);
      errors.push(e.message);
    });
    await page.setViewport({ width: 1366, height: 768 });
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + '/memecard.html');
    await page.waitForFunction(() => window.memeAnime && window.MEME_DUEL_LINKS_GROUP && window.MEME_MASKED_GROUP);

    const out = await page.evaluate(async (QUICK_PLAY) => {
      const results = [];
      const ok = (x, m) => { if (!x) throw Error(m); };
      const eq = (a, b, m = 'value') => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
      const T = memeAnime.tcgCore;
      const oldRender = render;
      render = () => {};
      memeMusic.setEnabled(false);
      memeAnime.setAuto(true);
      memeFx.resolveCard = async (event, fn) => { await fn?.(); return true; };
      memeFx.attack = async (a, b, c, d, e, fn) => { await fn?.(); return true; };
      memeCardMotion.record = () => {};
      memeCardMotion.flush = async () => {};

      function reset() {
        clearTimeout(aiTimer);
        closeModal();
        memeFx.reset();
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
          const s = duel[n];
          s.hand = []; s.deck = []; s.extraDeck = []; s.grave = []; s.banished = [];
          s.monsters = [null, null, null]; s.spells = [null, null, null];
          s.field = null; s.extra = null; s.lp = 4000;
          for (const k of ['noSpecialRound', 'normalUsed', 'necroUses', 'bubbleSpecialRound', 'bubbleDrawRound',
            'altSpecialRound', 'honestDiscardRound', 'honestFieldRound', 'favoriteFieldRound',
            'maskedFountainHandRound', 'maskedFountainGraveRound', 'shadowMistUsedRound', 'powerBondDebt',
            'cyberFusionSupportRound']) delete s[k];
        }
        $('lobby')?.classList.add('hidden');
        $('duel')?.classList.remove('hidden');
      }

      async function test(name, fn) {
        reset();
        try {
          await fn();
          results.push(name);
        } catch (e) {
          throw Error(`${name}: ${e.message}`);
        }
      }

      const put = (who, id, index = 0, position = 'atk') => {
        const slot = monsterSlot(id, position);
        T.uid(slot);
        duel[who].monsters[index] = slot;
        return slot;
      };
      const play = (index = 0) => memeAnime.perform(() => memeAnime.playSpellFor('player', index));
      const playSet = (index = 0) => memeAnime.perform(() => memeAnime.playSetSpellFor('player', index));
      const setSpell = (id, index = 0) => { duel.player.spells[index] = { id, faceDown: true, setRound: duel.round }; };
      const summonedIds = () => duel.player.monsters.filter(Boolean).map(s => s.id);

      // ── Data integrity ───────────────────────────────────────────
      await test('All 9 Quick-Play Spells are flagged and wired to an effect handler', () => {
        eq(QUICK_PLAY.length, 9, 'quick-play count');
        for (const id of QUICK_PLAY) {
          const c = card(id);
          ok(c, 'missing card ' + id);
          eq(c.card_type, 'Spell', id + ' type');
          eq(c.quick_play, true, id + ' quick_play');
          eq(c.spell_category, 'Tốc Công', id + ' category');
          ok((c.description || '').length > 20, id + ' description');
          if (id.startsWith('DL-')) ok(memeDlHandlers.has(id), id + ' has an active handler');
        }
      });

      // ── Mask Change / Mask Change II ─────────────────────────────
      await test('Mask Change: hand and set activation transform a Masked HERO', async () => {
        put('player', 'MGX-masked_hero_gust');
        duel.player.hand = ['MGX-mask_change'];
        duel.player.extraDeck = ['MGX-masked_hero_blast'];
        ok(await play(0), 'hand activation');
        eq(summonedIds(), ['MGX-masked_hero_blast'], 'Blast on field');
        eq(duel.player.grave.includes('MGX-masked_hero_gust'), true, 'source to GY');
        eq(duel.player.grave.includes('MGX-mask_change'), true, 'Spell to GY');

        reset();
        put('player', 'MGX-masked_hero_ray');
        duel.player.extraDeck = ['MGX-masked_hero_koga'];
        setSpell('MGX-mask_change');
        ok(await playSet(0), 'set activation');
        eq(summonedIds(), ['MGX-masked_hero_koga'], 'Koga on field');
        eq(duel.player.grave.includes('MGX-mask_change'), true, 'set Spell to GY');
      });

      await test('Mask Change II: pays the discard and reaches Level 8 from the hand', async () => {
        put('player', 'MGX-masked_hero_gust');
        duel.player.hand = ['MGX-mask_change_ii', 'AN-kuriboh'];
        duel.player.extraDeck = ['MGX-masked_hero_divine_wind'];
        ok(await play(0), 'activation');
        eq(summonedIds(), ['MGX-masked_hero_divine_wind'], 'Divine Wind on field');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'discard paid');
        eq(duel.player.grave.includes('MGX-mask_change_ii'), true, 'Spell to GY');
        duel.player.monsters[0] = null;
        put('player', 'MGX-masked_hero_gust');
        duel.player.hand = ['MGX-mask_change_ii'];
        duel.player.extraDeck = ['MGX-masked_hero_divine_wind'];
        eq(await play(0), false, 'no discard cost means no activation');
        eq(duel.player.hand.includes('MGX-mask_change_ii'), true, 'Spell kept');
      });

      // ── Silver's Cry ─────────────────────────────────────────────
      await test("Silver's Cry: revives a Normal Dragon from hand or set, rejects other targets", async () => {
        duel.player.grave = ['AN-blue_eyes_white_dragon'];
        duel.player.hand = ['DL-silvers_cry'];
        ok(await play(0), 'hand activation');
        eq(summonedIds(), ['AN-blue_eyes_white_dragon'], 'BEWD revived');
        eq(duel.player.monsters[0].position, 'atk', 'highest stat position');
        eq(duel.player.grave.includes('DL-silvers_cry'), true, 'Spell to GY');

        reset();
        duel.player.grave = ['AN-blue_eyes_white_dragon'];
        setSpell('DL-silvers_cry');
        ok(await playSet(0), 'set activation');
        eq(summonedIds(), ['AN-blue_eyes_white_dragon'], 'BEWD revived from set Spell');

        reset();
        duel.player.grave = ['AN-dark_magician'];
        duel.player.hand = ['DL-silvers_cry'];
        eq(await play(0), false, 'non-Dragon rejected');
        eq(duel.player.hand, ['DL-silvers_cry'], 'Spell kept');
      });

      await test("Silver's Cry: the real hand and set-zone UI actions both resolve", async () => {
        duel.player.grave = ['AN-blue_eyes_white_dragon'];
        duel.player.hand = ['DL-silvers_cry'];
        ok(await playSpell(0), 'Kích hoạt Phép action');
        eq(summonedIds(), ['AN-blue_eyes_white_dragon'], 'revived from the hand UI');

        reset();
        duel.player.grave = ['AN-blue_eyes_white_dragon'];
        setSpell('DL-silvers_cry');
        ok(await memeActivateSetSpell(0), 'Lật Phép action');
        eq(summonedIds(), ['AN-blue_eyes_white_dragon'], 'revived from the set-zone UI');
      });

      // ── Illusion Magic ───────────────────────────────────────────
      await test('Illusion Magic: tributes a Spellcaster and gets Dark Magician from Deck and GY', async () => {
        put('player', 'AN-dark_magician');
        duel.player.hand = ['DL-illusion_magic'];
        duel.player.deck = ['AN-dark_magician', 'AN-kuriboh'];
        duel.player.grave = ['AN-dark_magician'];
        ok(await play(0), 'hand activation');
        eq(duel.player.hand.filter(id => id === 'AN-dark_magician').length, 2, 'two Dark Magicians added');
        eq(duel.player.monsters[0], null, 'tribute removed');
        eq(duel.player.grave.includes('AN-dark_magician'), true, 'GY copy recovered or tribute in GY');
        eq(duel.player.grave.includes('DL-illusion_magic'), true, 'Spell to GY');

        reset();
        put('player', 'AN-dark_magician');
        duel.player.grave = ['AN-dark_magician', 'AN-dark_magician'];
        setSpell('DL-illusion_magic');
        ok(await playSet(0), 'set activation');
        eq(duel.player.hand.filter(id => id === 'AN-dark_magician').length, 2, 'two GY copies added');
        eq(duel.player.monsters[0], null, 'tribute removed');

        reset();
        put('player', 'AN-kuriboh');
        duel.player.hand = ['DL-illusion_magic'];
        duel.player.deck = ['AN-dark_magician'];
        eq(await play(0), false, 'no Spellcaster to tribute');
        eq(duel.player.hand, ['DL-illusion_magic'], 'Spell kept');
      });

      // ── Toon Page-Flipper ────────────────────────────────────────
      await test('Toon Page-Flipper: requires Toon World and Special Summons 1 of 3 different Toon names', async () => {
        duel.player.hand = ['DL-toon_page_flipper'];
        duel.player.deck = ['AN-toon_mermaid', 'AN-toon_summoned_skull', 'AN-blue_eyes_toon_dragon', 'AN-manga_ryu_ran'];
        eq(await play(0), false, 'Toon World required');
        eq(duel.player.hand, ['DL-toon_page_flipper'], 'Spell kept');

        reset();
        duel.player.field = { id: 'AN-toon_world' };
        duel.player.hand = ['DL-toon_page_flipper'];
        duel.player.deck = ['AN-toon_mermaid', 'AN-toon_summoned_skull', 'AN-blue_eyes_toon_dragon', 'AN-manga_ryu_ran'];
        ok(await play(0), 'hand activation');
        eq(duel.player.monsters.filter(Boolean).length, 1, 'one Toon Special Summoned');
        ok(card(duel.player.monsters[0].id).traits.includes('toon'), 'summoned monster is Toon');
        eq(duel.player.deck.length, 3, 'two revealed cards shuffled back, one summoned');
        ok(!duel.player.deck.includes(duel.player.monsters[0].id), 'summoned copy left the Deck');
        eq(duel.player.grave.includes('DL-toon_page_flipper'), true, 'Spell to GY');

        reset();
        duel.player.field = { id: 'DL-toon_kingdom' };
        duel.player.deck = ['AN-toon_mermaid', 'AN-toon_summoned_skull', 'AN-blue_eyes_toon_dragon'];
        setSpell('DL-toon_page_flipper');
        ok(await playSet(0), 'set activation');
        eq(duel.player.monsters.filter(Boolean).length, 1, 'one Toon Special Summoned from set Spell');
        eq(duel.player.deck.length, 2, 'two failed-to-pick Toons returned to Deck');

        reset();
        duel.player.field = { id: 'AN-toon_world' };
        duel.player.hand = ['DL-toon_page_flipper'];
        duel.player.deck = ['AN-toon_mermaid', 'AN-toon_summoned_skull'];
        eq(await play(0), false, 'needs 3 differently named Toon monsters');
        eq(duel.player.hand, ['DL-toon_page_flipper'], 'Spell kept');

        reset();
        duel.player.spells[0] = { id: 'AN-toon_world', faceDown: true, setRound: duel.round };
        duel.player.hand = ['DL-toon_page_flipper'];
        duel.player.deck = ['AN-toon_mermaid', 'AN-toon_summoned_skull', 'AN-blue_eyes_toon_dragon'];
        eq(await play(0), false, 'face-down Toon World does not count');
        eq(duel.player.hand, ['DL-toon_page_flipper'], 'Spell kept');
      });

      // ── Relinquished Fusion ──────────────────────────────────────
      await test('Relinquished Fusion: hand + GY materials, and GY materials are banished', async () => {
        duel.player.hand = ['DL-relinquished_fusion', 'AN-relinquished', 'AN-kuriboh'];
        duel.player.extraDeck = ['DL-millennium_eyes_restrict'];
        ok(await play(0), 'hand activation');
        eq(summonedIds(), ['DL-millennium_eyes_restrict'], 'Millennium-Eyes summoned');
        eq(duel.player.grave.includes('AN-relinquished'), true, 'hand Relinquished goes to GY');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'hand Effect Monster goes to GY');

        reset();
        put('player', 'AN-relinquished');
        duel.player.grave = ['AN-kuriboh'];
        duel.player.hand = ['DL-relinquished_fusion'];
        duel.player.extraDeck = ['DL-millennium_eyes_restrict'];
        ok(await play(0), 'field + GY materials');
        eq(summonedIds(), ['DL-millennium_eyes_restrict'], 'summoned from field + GY');
        eq(duel.player.banished.includes('AN-kuriboh'), true, 'GY material banished');
        eq(duel.player.grave.includes('AN-relinquished'), true, 'field material to GY');

        reset();
        put('player', 'AN-relinquished');
        duel.player.hand = ['DL-relinquished_fusion', 'AN-kuriboh'];
        duel.player.extraDeck = ['AN-thousand_eyes_restrict'];
        eq(await play(0), false, 'Thousand-Eyes needs Thousand-Eyes Idol');
        eq(duel.player.hand.length, 2, 'cards kept');
        duel.player.grave = ['AN-thousand_eyes_idol'];
        ok(await play(0), 'Idol enables Thousand-Eyes');
        eq(summonedIds(), ['AN-thousand_eyes_restrict'], 'Thousand-Eyes summoned');
        eq(duel.player.banished.includes('AN-thousand_eyes_idol'), true, 'Idol banished from GY');
      });

      await test('Relinquished Fusion: can be activated from a set position', async () => {
        put('player', 'AN-relinquished');
        duel.player.grave = ['AN-thousand_eyes_idol'];
        duel.player.extraDeck = ['AN-thousand_eyes_restrict'];
        setSpell('DL-relinquished_fusion');
        ok(await playSet(0), 'set activation');
        eq(summonedIds(), ['AN-thousand_eyes_restrict'], 'Thousand-Eyes summoned');
        eq(duel.player.grave.includes('DL-relinquished_fusion'), true, 'Spell to GY');
        eq(duel.player.banished.includes('AN-thousand_eyes_idol'), true, 'GY material banished');
      });

      // ── Form Change ──────────────────────────────────────────────
      await test('Form Change: hand and set activation recycle a HERO Fusion into a same-Level Masked HERO', async () => {
        put('player', 'AN-elemental_hero_flame_wingman');
        duel.player.hand = ['DL-form_change'];
        duel.player.extraDeck = ['MGX-masked_hero_koga'];
        ok(await play(0), 'hand activation');
        eq(summonedIds(), ['MGX-masked_hero_koga'], 'Koga on field');
        eq(duel.player.extraDeck.includes('AN-elemental_hero_flame_wingman'), true, 'source returned to Extra');

        reset();
        put('player', 'AN-elemental_hero_flame_wingman');
        duel.player.extraDeck = ['MGX-masked_hero_koga'];
        setSpell('DL-form_change');
        ok(await playSet(0), 'set activation');
        eq(summonedIds(), ['MGX-masked_hero_koga'], 'Koga from set Spell');
        eq(duel.player.grave.includes('DL-form_change'), true, 'Spell to GY');
      });

      // ── Cyberload Fusion ─────────────────────────────────────────
      await test('Cyberload Fusion: fuses from field + banished and returns materials to the Deck', async () => {
        put('player', 'AN-cyber_dragon');
        duel.player.banished = ['AN-cyber_dragon'];
        duel.player.hand = ['DL-cyberload_fusion'];
        duel.player.extraDeck = ['AN-cyber_twin_dragon'];
        ok(await play(0), 'hand activation');
        eq(summonedIds(), ['AN-cyber_twin_dragon'], 'Cyber Twin Dragon summoned');
        eq(duel.player.deck.filter(id => id === 'AN-cyber_dragon').length, 2, 'both materials shuffled into Deck');
        eq(duel.player.grave.includes('AN-cyber_dragon'), false, 'field material did not go to GY');
        eq(duel.player.banished.includes('AN-cyber_dragon'), false, 'banished material shuffled into Deck');
        eq(duel.player.deck.includes('AN-cyber_dragon'), true, 'material in Deck');
        eq(duel.player.grave.includes('DL-cyberload_fusion'), true, 'Spell to GY');

        reset();
        put('player', 'AN-cyber_dragon');
        duel.player.banished = ['AN-cyber_dragon'];
        duel.player.extraDeck = ['AN-cyber_twin_dragon'];
        setSpell('DL-cyberload_fusion');
        ok(await playSet(0), 'set activation');
        eq(summonedIds(), ['AN-cyber_twin_dragon'], 'summoned from set Spell');
      });

      await test('Cyberload Fusion: respects the Fusion recipe size (Cyber End Dragon needs 3)', async () => {
        put('player', 'AN-cyber_dragon');
        duel.player.banished = ['AN-cyber_dragon'];
        duel.player.hand = ['DL-cyberload_fusion'];
        duel.player.extraDeck = ['AN-cyber_end_dragon'];
        eq(await play(0), false, 'two materials are not enough');
        eq(duel.player.hand, ['DL-cyberload_fusion'], 'Spell kept');

        duel.player.banished.push('AN-cyber_dragon');
        ok(await play(0), 'three materials enable Cyber End Dragon');
        eq(summonedIds(), ['AN-cyber_end_dragon'], 'Cyber End Dragon summoned');
        eq(duel.player.banished.length, 0, 'both banished materials returned to the Deck');
        eq(duel.player.deck.filter(id => id === 'AN-cyber_dragon').length, 3, 'all three materials in Deck');
        eq(duel.player.grave.includes('AN-cyber_dragon'), false, 'field material did not go to GY');
      });

      // ── Cybernetic Fusion Support ────────────────────────────────
      await test('Cybernetic Fusion Support: pays half LP and lets a Machine Fusion use GY materials', async () => {
        put('player', 'AN-cyber_dragon');
        duel.player.grave = ['AN-cyber_dragon'];
        duel.player.hand = ['DL-cybernetic_fusion_support', 'AN-polymerization'];
        duel.player.extraDeck = ['AN-cyber_twin_dragon'];
        ok(await play(0), 'support activation');
        eq(duel.player.lp, 2000, 'half LP paid');
        eq(duel.player.cyberFusionSupportRound, duel.round, 'effect active this turn');
        eq(duel.player.grave.includes('DL-cybernetic_fusion_support'), true, 'Spell to GY');
        ok(await play(0), 'fusion with a GY material');
        eq(summonedIds(), ['AN-cyber_twin_dragon'], 'Cyber Twin Dragon summoned');
        eq(duel.player.banished.filter(id => id === 'AN-cyber_dragon').length, 2, 'both materials banished');
        eq(duel.player.grave.includes('AN-cyber_dragon'), false, 'GY material left the GY');

        reset();
        put('player', 'AN-cyber_dragon');
        duel.player.hand = ['DL-cybernetic_fusion_support', 'AN-polymerization', 'AN-cyber_dragon'];
        duel.player.extraDeck = ['AN-cyber_twin_dragon'];
        ok(await play(0), 'support activation');
        ok(await play(0), 'fusion with a hand material');
        eq(duel.player.banished.filter(id => id === 'AN-cyber_dragon').length, 2, 'hand and field materials banished');

        reset();
        put('player', 'AN-elemental_hero_avian');
        duel.player.grave = ['AN-elemental_hero_burstinatrix'];
        duel.player.hand = ['DL-cybernetic_fusion_support', 'AN-polymerization'];
        duel.player.extraDeck = ['AN-elemental_hero_flame_wingman'];
        ok(await play(0), 'support activation');
        eq(await play(0), false, 'non-Machine Fusion cannot use GY materials');
        eq(duel.player.hand.includes('AN-polymerization'), true, 'Polymerization kept');

        reset();
        duel.player.lp = 4000;
        setSpell('DL-cybernetic_fusion_support');
        ok(await playSet(0), 'set activation');
        eq(duel.player.lp, 2000, 'half LP paid from set Spell');
        eq(duel.player.grave.includes('DL-cybernetic_fusion_support'), true, 'set Spell to GY');
      });

      await test('Cybernetic Fusion Support: cannot be activated twice in one turn or at 1 LP', async () => {
        duel.player.hand = ['DL-cybernetic_fusion_support'];
        ok(await play(0), 'first activation');
        duel.player.hand = ['DL-cybernetic_fusion_support'];
        eq(await play(0), false, 'second activation blocked');
        eq(duel.player.hand, ['DL-cybernetic_fusion_support'], 'second copy kept');

        reset();
        duel.player.lp = 1;
        duel.player.hand = ['DL-cybernetic_fusion_support'];
        eq(await play(0), false, 'cannot pay half at 1 LP');
        eq(duel.player.hand, ['DL-cybernetic_fusion_support'], 'Spell kept');
      });

      render = oldRender;
      return results;
    }, QUICK_PLAY);

    out.forEach(r => console.log('✅ ' + r));
    if (errors.length) throw Error('Page errors: ' + errors.join(' | '));
    console.log(`🎉 ${out.length} quick-play scenario groups passed across ${QUICK_PLAY.length} cards.`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  server.close();
  process.exitCode = 1;
});
