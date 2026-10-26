const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict'), puppeteer = require('puppeteer');
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

const HERO_IDS = [
  // AN · Elemental HERO (Jaden, anime/TCG)
  'AN-elemental_hero_avian', 'AN-elemental_hero_burstinatrix', 'AN-elemental_hero_clayman',
  'AN-elemental_hero_sparkman', 'AN-elemental_hero_neos', 'AN-elemental_hero_bubbleman',
  'AN-elemental_hero_wildheart', 'AN-elemental_hero_bladeedge', 'AN-elemental_hero_necroshade',
  'AN-neo_spacian_air_hummingbird', 'AN-neo_spacian_aqua_dolphin', 'AN-neo_spacian_flare_scarab',
  'AN-elemental_hero_flame_wingman', 'AN-elemental_hero_thunder_giant', 'AN-elemental_hero_rampart_blaster',
  'AN-elemental_hero_steam_healer', 'AN-elemental_hero_mudballman', 'AN-elemental_hero_shining_flare_wingman',
  'AN-elemental_hero_wildedge', 'AN-elemental_hero_darkbright', 'AN-elemental_hero_air_neos',
  'AN-elemental_hero_aqua_neos', 'AN-elemental_hero_flare_neos', 'AN-miracle_fusion', 'AN-skyscraper',
  // MGX · GX manga (manga semantics, do NOT overwrite)
  'MGX-elemental_hero_absolute_zero', 'MGX-elemental_hero_the_shining', 'MGX-elemental_hero_gaia',
  'MGX-elemental_hero_great_tornado', 'MGX-elemental_hero_terra_firma', 'MGX-elemental_hero_escuridao',
  'MGX-elemental_hero_ocean', 'MGX-elemental_hero_woodsman', 'MGX-elemental_hero_stratos',
  'MGX-elemental_hero_shadow_mist', 'MGX-masked_hero_bassols', 'MGX-masked_hero_gust',
  'MGX-masked_hero_ray', 'MGX-masked_hero_fountain', 'MGX-masked_hero_vapor', 'MGX-masked_hero_acid',
  'MGX-masked_hero_daian', 'MGX-masked_hero_blast', 'MGX-masked_hero_koga', 'MGX-masked_hero_divine_wind',
  'MGX-mask_change', 'MGX-mask_change_ii',
  // DL · Duel Links (TCG semantics)
  'DL-neos_fusion', 'DL-elemental_hero_brave_neos', 'DL-elemental_hero_sunrise',
  'DL-elemental_hero_liquid_soldier', 'DL-elemental_hero_solid_soldier', 'DL-elemental_hero_honest_neos',
  'DL-masked_hero_anki', 'DL-a_hero_lives', 'DL-form_change', 'DL-favorite_hero'
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

    const testResults = await page.evaluate(async (HERO_IDS) => {
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
            'maskedFountainHandRound', 'maskedFountainGraveRound', 'shadowMistUsedRound', 'powerBondDebt']) delete s[k];
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
      const stat = (who, slot, kind = 'atk') => T.stat(who, slot, kind);
      const play = (index = 0) => memeAnime.perform(() => memeAnime.playSpellFor('player', index));
      const playSet = (index = 0) => memeAnime.perform(() => memeAnime.playSetSpellFor('player', index));
      const summonNormal = (index = 0, tributes = []) => memeAnime.perform(() => memeAnime.normalSummon('player', index, 'atk', tributes));
      const activate = (index = 0) => activateMonsterEffect(index);
      const removeByEffect = (who = 'player', index = 0, slot = null) =>
        memeAnime.perform(() => memeRules.remove(who, { slot: slot || duel[who].monsters[index], index }, 'effect'));
      const battle = (who, index, targetIndex, targetExtra = false) =>
        memeAnime.perform(() => memeAnime.battle(who, index, false, targetIndex, targetExtra));

      // ── Data integrity across every HERO card ─────────────────────
      await test('All 57 HERO cards exist with idempotent Vietnamese text and artwork', () => {
        eq(HERO_IDS.length, 57, 'card list size');
        eq(new Set(HERO_IDS).size, 57, 'unique ids');
        for (const id of HERO_IDS) {
          const c = card(id);
          ok(c, 'missing card ' + id);
          ok((c.description || '').length > 20 || c.description === 'Quái thường.', id + ' description');
          eq(memeTextVi(c.description || ''), c.description || '', id + ' Vietnamese text idempotent');
          ok(c.name && c.name_en, id + ' names');
          ok(c.custom_image, id + ' art path');
          if (c.deck_zone === 'Extra') ok(c.fusion_materials || c.fusion_recipe || c.contact || c.summon_type === 'transformation', id + ' has an Extra route');
        }
      });

      await test('TCG text and official Attributes applied to anime HERO cards, manga cards untouched', () => {
        ok(card('AN-elemental_hero_bubbleman').description.includes('duy nhất trên tay'), 'Bubbleman TCG text');
        ok(card('AN-elemental_hero_wildheart').description.includes('không bị ảnh hưởng bởi hiệu ứng Bẫy'), 'Wildheart TCG text');
        ok(card('AN-elemental_hero_bladeedge').description.includes('xuyên thủ'), 'Bladedge TCG text');
        ok(card('AN-elemental_hero_necroshade').description.includes('không cần hiến tế'), 'Necroshade TCG text');
        ok(card('AN-neo_spacian_air_hummingbird').description.includes('500 LP'), 'Hummingbird TCG text');
        ok(card('AN-neo_spacian_aqua_dolphin').description.includes('500 sát thương'), 'Dolphin TCG text');
        ok(card('AN-neo_spacian_flare_scarab').description.includes('400 ATK'), 'Scarab TCG text');
        ok(card('AN-miracle_fusion').description.includes('trục xuất'), 'Miracle Fusion TCG text');
        ok(card('AN-skyscraper').description.includes('1000 ATK'), 'Skyscraper TCG text');
        ok(card('AN-elemental_hero_flame_wingman').description.includes('Phải được Triệu hồi Dung Hợp'), 'Fusion text');
        eq(card('AN-elemental_hero_sparkman').element, 'Quang', 'Sparkman LIGHT');
        eq(card('AN-elemental_hero_clayman').element, 'Địa', 'Clayman EARTH');
        eq(card('AN-elemental_hero_neos').element, 'Quang', 'Neos LIGHT');
        eq(card('AN-elemental_hero_burstinatrix').element, 'Hỏa', 'Burstinatrix FIRE');
        eq(card('AN-elemental_hero_bubbleman').element, 'Thủy', 'Bubbleman WATER');
        eq(card('AN-elemental_hero_necroshade').element, 'Ám', 'Necroshade DARK');
        eq(card('AN-elemental_hero_mudballman').traits.includes('hero_guard'), false, 'Mudballman vanilla');
        eq(card('MGX-masked_hero_bassols').description, 'Quái thường.', 'manga card text preserved');
      });

      // ── AN main-deck HERO monsters ────────────────────────────────
      await test('Avian: normal summon spends the turn and vanilla has no activated effect', async () => {
        duel.player.hand = ['AN-elemental_hero_avian'];
        ok(await summonNormal(0), 'Avian summoned');
        eq(duel.player.monsters[0].id, 'AN-elemental_hero_avian');
        duel.player.hand = ['AN-elemental_hero_avian'];
        eq(await summonNormal(0), false, 'second Normal Summon blocked');
        eq(await activate(0), false, 'vanilla monster has no activated effect');
        put('enemy', 'AN-kuriboh');
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.enemy.monsters[0], null, 'Kuriboh destroyed');
        eq(duel.enemy.lp, 3300, '700 battle damage');
      });

      await test('Burstinatrix: FIRE vanilla feeds Flame Wingman fusion', async () => {
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['AN-elemental_hero_flame_wingman'];
        put('player', 'AN-elemental_hero_avian');
        put('player', 'AN-elemental_hero_burstinatrix', 1);
        ok(await play(0), 'Polymerization resolves');
        ok(duel.player.monsters.some(s => s?.id === 'AN-elemental_hero_flame_wingman'), 'Flame Wingman summoned');
        eq(duel.player.grave.includes('AN-elemental_hero_avian'), true, 'Avian material');
        eq(duel.player.grave.includes('AN-elemental_hero_burstinatrix'), true, 'Burstinatrix material');
        eq(duel.player.extraDeck.length, 0, 'Extra Deck spent');
      });

      await test('Clayman: set face-down then Flip Summon reveals its defense', async () => {
        duel.player.hand = ['AN-elemental_hero_clayman'];
        ok(await memeAnime.perform(() => memeAnime.normalSummon('player', 0, 'def_down')), 'set Clayman');
        eq(duel.player.monsters[0].position, 'def_down', 'face-down defense');
        duel.round++;
        ok(await memeAnime.perform(() => memeAnime.changePosition('player', 0)), 'flip summon');
        eq(duel.player.monsters[0].position, 'atk', 'flip summon is face-up Attack Position');
        eq(duel.player.monsters[0].faceDown, undefined, 'flip cleared face-down flag');
        eq(stat('player', duel.player.monsters[0], 'def'), 2000, '2000 DEF');
      });

      await test('Sparkman: LIGHT 1600 body and Thunder Giant fusion route', async () => {
        put('player', 'AN-elemental_hero_sparkman');
        put('player', 'AN-elemental_hero_clayman', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['AN-elemental_hero_thunder_giant'];
        ok(await play(0), 'Thunder Giant fusion');
        ok(duel.player.monsters.some(s => s?.id === 'AN-elemental_hero_thunder_giant'), 'Thunder Giant on field');
        eq(duel.player.grave.includes('AN-elemental_hero_clayman'), true, 'Clayman material');
      });

      await test('Neos: Level 7 needs two tributes and can be normal summoned legally', async () => {
        duel.player.hand = ['AN-elemental_hero_neos'];
        eq(await summonNormal(0), false, 'rejects a tribute-less Level 7');
        put('player', 'AN-kuriboh');
        put('player', 'AN-kuriboh', 1);
        ok(await summonNormal(0, [0, 1]), 'two tributes');
        ok(duel.player.monsters.some(s => s?.id === 'AN-elemental_hero_neos'), 'Neos on field');
        eq(duel.player.grave.filter(id => id === 'AN-kuriboh').length, 2, 'both tributes in GY');
      });

      await test('Bubbleman: special summon only with an empty hand, draws only on an empty board', async () => {
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh', 'AN-kuriboh'];
        duel.player.hand = ['AN-elemental_hero_bubbleman'];
        eq(memeAnime.specialMode('player', card('AN-elemental_hero_bubbleman')), 'bubbleman', 'special mode');
        ok(await memeAnime.perform(() => memeAnime.specialSummon('player', 0)), 'special summon');
        eq(duel.player.hand.length, 2, 'drew 2 with an empty board');
        duel.player.hand = ['AN-elemental_hero_bubbleman'];
        eq(memeAnime.specialMode('player', card('AN-elemental_hero_bubbleman')), null, 'once per turn');
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh'];
        duel.player.hand = ['AN-elemental_hero_bubbleman', 'AN-kuriboh'];
        ok(await summonNormal(0), 'normal summon');
        eq(duel.player.hand.length, 1, 'no draw with another card in hand');
        eq(duel.player.deck.length, 2, 'deck untouched');
      });

      await test('Wildheart: Trap effects cannot target or resolve against it', async () => {
        const w = put('player', 'AN-elemental_hero_wildheart');
        put('enemy', 'AN-kuriboh', 0, 'def');
        duel.enemy.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 0 };
        duel.phase = 'BATTLE';
        eq(T.spellTargetAllowed('enemy', card('AN-mirror_force'), { name: 'player', slot: w, index: 0, id: w.id }), false, 'Mirror Force cannot target');
        await battle('player', 0, 0);
        eq(duel.player.monsters[0]?.id, 'AN-elemental_hero_wildheart', 'survives Mirror Force');
        eq(duel.enemy.monsters[0], null, 'defender destroyed');
        ok(duel.enemy.spells[0]?.faceDown, 'Trap stayed set');
      });

      await test('Bladedge: Level 7 needs two tributes and deals piercing damage', async () => {
        duel.player.hand = ['AN-elemental_hero_bladeedge'];
        eq(await summonNormal(0), false, 'rejects tribute-less summon');
        duel.player.hand = ['AN-elemental_hero_bladeedge', 'AN-kuriboh', 'AN-kuriboh'];
        put('player', 'AN-kuriboh');
        put('player', 'AN-kuriboh', 1);
        ok(await summonNormal(0, [0, 1]), 'summoned with two tributes');
        put('enemy', 'AN-elemental_hero_clayman', 0, 'def');
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.enemy.lp, 3400, '600 piercing damage');
        eq(duel.enemy.monsters[0], null, 'defender destroyed');
      });

      await test('Necroshade: one tribute-free Level 5+ HERO Normal Summon per GY copy', async () => {
        duel.player.grave = ['AN-elemental_hero_necroshade'];
        duel.player.hand = ['AN-elemental_hero_neos'];
        ok(await summonNormal(0), 'Neos without tribute');
        eq(duel.player.necroUses, 1, 'one use');
        eq(duel.player.grave.includes('AN-elemental_hero_necroshade'), true, 'stays in GY');
        duel.player.hand = ['AN-elemental_hero_neos'];
        duel.round = 4;
        duel.player.normalUsed = false;
        duel.normalSummoned = false;
        eq(await summonNormal(0), false, 'copy spent');
        duel.player.grave.push('AN-elemental_hero_necroshade');
        duel.player.hand = ['AN-elemental_hero_neos'];
        duel.player.normalUsed = false;
        duel.normalSummoned = false;
        ok(await summonNormal(0), 'second copy unlocks another');
        eq(duel.player.necroUses, 2, 'two uses');
      });

      await test('Air Hummingbird: once-per-turn heal equal to 500 × opponent hand', async () => {
        put('player', 'AN-neo_spacian_air_hummingbird');
        duel.player.lp = 2000;
        duel.enemy.hand = ['AN-kuriboh', 'AN-kuriboh', 'AN-kuriboh'];
        ok(await activate(0), 'effect resolves');
        eq(duel.player.lp, 3500, 'healed 1500');
        eq(await activate(0), false, 'once per turn');
      });

      await test('Aqua Dolphin: discard cost, hand reveal, destroy or recoil', async () => {
        put('player', 'AN-elemental_hero_neos');
        put('player', 'AN-neo_spacian_aqua_dolphin', 1);
        duel.player.hand = ['AN-kuriboh'];
        duel.enemy.hand = ['AN-kuriboh'];
        ok(await activate(1), 'beat weaker monster');
        eq(duel.enemy.hand.length, 0, 'chosen monster discarded');
        eq(duel.enemy.lp, 3500, '500 burn');
        eq(duel.player.hand.length, 0, 'cost paid');
        duel.player.hand = ['AN-kuriboh'];
        duel.enemy.hand = ['AN-blue_eyes_white_dragon'];
        duel.player.monsters[1].effectUsedRound = undefined;
        ok(await activate(1), 'outmatched branch');
        eq(duel.player.lp, 3500, '500 recoil');
        eq(duel.enemy.hand.length, 1, 'strong monster stays');
      });

      await test('Flare Scarab: +400 ATK for each opponent Spell/Trap', async () => {
        const scarab = put('player', 'AN-neo_spacian_flare_scarab');
        eq(stat('player', scarab), 500, 'base ATK');
        duel.enemy.spells[0] = { id: 'AN-waboku', faceDown: true, setRound: 0 };
        duel.enemy.spells[1] = { id: 'AN-mirror_force', faceDown: true, setRound: 0 };
        eq(stat('player', scarab), 1300, '500 + 400 × 2');
        duel.enemy.field = { id: 'AN-skyscraper' };
        eq(stat('player', scarab), 1700, 'Field Spell also counts as a Spell Card');
      });

      await test('Miracle Fusion: banishes GY/field materials and rejects non-HERO targets', async () => {
        duel.player.hand = ['AN-miracle_fusion'];
        duel.player.grave = ['AN-elemental_hero_avian', 'AN-elemental_hero_burstinatrix'];
        duel.player.extraDeck = ['AN-elemental_hero_flame_wingman'];
        ok(await play(0), 'Miracle Fusion resolves');
        ok(duel.player.monsters.some(s => s?.id === 'AN-elemental_hero_flame_wingman'), 'Fusion summoned');
        eq(duel.player.banished.length, 2, 'materials banished');
        eq(duel.player.grave.includes('AN-elemental_hero_avian'), false, 'Avian left GY');
        eq(duel.player.grave.includes('AN-miracle_fusion'), true, 'Spell in GY');
        duel.player.extraDeck = ['AN-cyber_end_dragon'];
        duel.player.grave = ['AN-cyber_dragon', 'AN-cyber_dragon', 'AN-cyber_dragon'];
        eq(memeAnime.fusionOptions('player', 'AN-cyber_end_dragon', 'miracle').length, 0, 'non-HERO rejected');
      });

      await test('Skyscraper: +1000 only while a HERO attacks a stronger monster', async () => {
        put('player', 'AN-elemental_hero_avian');
        put('enemy', 'AN-vorse_raider');
        duel.player.field = { id: 'AN-skyscraper' };
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.enemy.monsters[0], null, 'Vorse Raider destroyed');
        eq(duel.player.monsters[0]?.id, 'AN-elemental_hero_avian', 'Avian survives');
        eq(duel.enemy.lp, 3900, '100 damage');
        duel.player.monsters[0].attacksUsed = 0;
        duel.turn = 'enemy';
        duel.phase = 'BATTLE';
        put('enemy', 'AN-blue_eyes_white_dragon', 0);
        await battle('enemy', 0, 0);
        eq(duel.player.monsters[0], null, 'Skyscraper does not boost the opponent');
      });

      // ── AN Fusion monsters ────────────────────────────────────────
      await test('Flame Wingman: burns for the destroyed monster ATK after a battle kill', async () => {
        put('player', 'AN-elemental_hero_flame_wingman');
        put('enemy', 'AN-kuriboh');
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.enemy.monsters[0], null, 'Kuriboh destroyed');
        eq(duel.enemy.lp, 1900, '1800 battle + 300 burn');
      });

      await test('Thunder Giant: discard cost, original-ATK targeting, once per turn', async () => {
        put('player', 'AN-elemental_hero_thunder_giant');
        const boosted = put('enemy', 'AN-kuriboh');
        boosted.attackBonus = 5000;
        duel.player.hand = ['AN-kuriboh'];
        ok(await activate(0), 'effect resolves');
        eq(duel.enemy.monsters[0], null, 'original 300 ATK used, not 5300');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'cost discarded');
        eq(duel.player.monsters[0].effectUsedRound, duel.round, 'marked once per turn');
        duel.player.hand = ['AN-kuriboh'];
        eq(await activate(0), false, 'second activation blocked');
      });

      await test('Rampart Blaster: attacks from Defense only into an empty field, at half ATK', async () => {
        const rb = put('player', 'AN-elemental_hero_rampart_blaster', 0, 'def');
        put('enemy', 'AN-kuriboh');
        eq(canAttackSlot(rb), false, 'blocked while the opponent has monsters');
        eq(await battle('player', 0, 0), false, 'battle rejected');
        duel.enemy.monsters[0] = null;
        eq(canAttackSlot(rb), true, 'direct attack unlocked');
        await battle('player', 0, null);
        eq(duel.enemy.lp, 3000, 'half ATK direct damage');
      });

      await test('Steam Healer: heals the destroyed monster ATK on a battle kill', async () => {
        duel.player.lp = 2000;
        put('player', 'AN-elemental_hero_steam_healer');
        put('enemy', 'AN-celtic_guardian');
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.player.lp, 3400, 'healed 1400');
        eq(duel.enemy.lp, 3600, '400 battle damage');
      });

      await test('Mudballman: legal Fusion with no effect and no attack redirect', async () => {
        put('player', 'AN-elemental_hero_bubbleman');
        put('player', 'AN-elemental_hero_clayman', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['AN-elemental_hero_mudballman'];
        ok(await play(0), 'Mudballman fusion');
        const mud = duel.player.monsters.find(s => s?.id === 'AN-elemental_hero_mudballman');
        ok(mud, 'Mudballman on field');
        eq(mud.position, 'atk', 'summoned in attack');
        eq(await activate(duel.player.monsters.indexOf(mud)), false, 'no effect');
        put('player', 'AN-elemental_hero_avian', 1);
        put('enemy', 'AN-blue_eyes_white_dragon');
        duel.turn = 'enemy';
        duel.phase = 'BATTLE';
        await battle('enemy', 0, 1);
        eq(duel.player.monsters[1], null, 'Avian destroyed, no redirect to Mudballman');
        ok(duel.player.monsters[0]?.id === 'AN-elemental_hero_mudballman', 'Mudballman unharmed');
      });

      await test('Shining Flare Wingman: +300 per HERO in the GY and burns for the victim ATK', async () => {
        put('player', 'AN-elemental_hero_shining_flare_wingman');
        duel.player.grave = ['AN-elemental_hero_avian'];
        eq(stat('player', duel.player.monsters[0]), 2800, '2500 + 300');
        put('enemy', 'AN-celtic_guardian');
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.enemy.lp, 1200, '1400 battle + 1400 burn');
      });

      await test('Wildedge: attacks every opposing monster, never directly while they remain', async () => {
        const we = put('player', 'AN-elemental_hero_wildedge');
        put('enemy', 'AN-kuriboh');
        put('enemy', 'AN-celtic_guardian', 1);
        eq(memeAnime.attacksRemaining(we), 2, 'two attacks');
        eq(memeAnime.directAllowed('player', we), false, 'no direct attack');
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        await battle('player', 0, 1);
        eq(duel.enemy.monsters.filter(Boolean).length, 0, 'both monsters destroyed');
        eq(duel.enemy.lp, 500, '2300 + 1200 battle damage');
      });

      await test('Darkbright: piercing, self Defense switch and on-leave destruction', async () => {
        const db = put('player', 'AN-elemental_hero_darkbright');
        put('enemy', 'AN-celtic_guardian', 0, 'def');
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.enemy.lp, 3200, '800 piercing');
        eq(db.position, 'def', 'switched to Defense');
        put('enemy', 'AN-vorse_raider', 1);
        await removeByEffect('player', 0, db);
        eq(duel.enemy.monsters[1], null, 'on-leave target destroyed');
      });

      await test('Air Neos: contact fusion, LP-difference ATK and End Phase return', async () => {
        put('player', 'AN-elemental_hero_neos');
        put('player', 'AN-neo_spacian_air_hummingbird', 1);
        duel.player.extraDeck = ['AN-elemental_hero_air_neos'];
        duel.player.lp = 2000;
        ok(memeAnime.fusionOptions('player', 'AN-elemental_hero_air_neos').length > 0, 'contact uses the two field materials');
        duel.player.hand = ['AN-polymerization'];
        eq(await play(0), false, 'cannot Polymerization a contact fusion');
        duel.player.hand = [];
        ok(await memeAnime.perform(() => memeAnime.fuse('player', null, 'AN-elemental_hero_air_neos')), 'contact fusion');
        const an = duel.player.monsters.find(s => s?.id === 'AN-elemental_hero_air_neos');
        ok(an, 'Air Neos on field');
        eq(stat('player', an), 4500, '2500 + 2000 LP difference');
        await memeAnime.perform(() => memeAnime.endTurn('player'));
        eq(duel.player.monsters.filter(Boolean).length, 0, 'returned to Extra Deck');
        ok(duel.player.extraDeck.includes('AN-elemental_hero_air_neos'), 'back in Extra Deck');
      });

      await test('Aqua Neos: contact fusion, random discard, End Phase return', async () => {
        put('player', 'AN-elemental_hero_neos');
        put('player', 'AN-neo_spacian_aqua_dolphin', 1);
        duel.player.extraDeck = ['AN-elemental_hero_aqua_neos'];
        duel.player.hand = ['AN-kuriboh'];
        duel.enemy.hand = ['AN-blue_eyes_white_dragon', 'AN-celtic_guardian'];
        ok(await memeAnime.perform(() => memeAnime.fuse('player', null, 'AN-elemental_hero_aqua_neos')), 'contact fusion');
        ok(await activate(0), 'random discard effect');
        eq(duel.player.hand.length, 0, 'cost paid');
        eq(duel.enemy.hand.length, 1, 'one random card destroyed');
        eq(duel.enemy.grave.length, 1, 'destroyed card in GY');
        await memeAnime.perform(() => memeAnime.endTurn('player'));
        eq(duel.player.monsters.filter(Boolean).length, 0, 'returned to Extra Deck');
      });

      await test('Flare Neos: +400 per Spell/Trap on both fields and End Phase return', async () => {
        put('player', 'AN-elemental_hero_neos');
        put('player', 'AN-neo_spacian_flare_scarab', 1);
        duel.player.extraDeck = ['AN-elemental_hero_flare_neos'];
        duel.player.spells[0] = { id: 'AN-waboku', faceDown: true, setRound: 0 };
        duel.enemy.spells[0] = { id: 'AN-mirror_force', faceDown: true, setRound: 0 };
        duel.enemy.field = { id: 'AN-skyscraper' };
        ok(await memeAnime.perform(() => memeAnime.fuse('player', null, 'AN-elemental_hero_flare_neos')), 'contact fusion');
        const fn = duel.player.monsters.find(s => s?.id === 'AN-elemental_hero_flare_neos');
        eq(stat('player', fn), 3700, '2500 + 400 × 3');
        await memeAnime.perform(() => memeAnime.endTurn('player'));
        eq(duel.player.monsters.filter(Boolean).length, 0, 'returned to Extra Deck');
      });

      // ── MGX · GX manga Elemental HERO ────────────────────────────
      await test('Absolute Zero: fusion route, WATER boost on both fields, no TCG board wipe', async () => {
        put('player', 'MGX-elemental_hero_ocean');
        put('player', 'MGX-elemental_hero_stratos', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['MGX-elemental_hero_absolute_zero'];
        ok(await play(0), 'Absolute Zero fusion');
        const az = duel.player.monsters.find(s => s?.id === 'MGX-elemental_hero_absolute_zero');
        ok(az, 'Absolute Zero on field');
        put('player', 'AN-elemental_hero_bubbleman', 1);
        put('enemy', 'AN-elemental_hero_bubbleman', 0);
        put('enemy', 'MGX-elemental_hero_ocean', 1, 'def_down');
        eq(stat('player', az), 3500, '2500 + 500 × 2 face-up WATER');
        await removeByEffect('player', duel.player.monsters.indexOf(az), az);
        eq(duel.enemy.monsters.filter(Boolean).length, 2, 'manga card does not wipe the board');
      });

      await test('The Shining: +300 per banished HERO and recovers exactly two own banished HERO', async () => {
        put('player', 'MGX-elemental_hero_the_shining');
        duel.player.banished = ['MGX-elemental_hero_ocean', 'MGX-elemental_hero_woodsman'];
        duel.enemy.banished = ['AN-elemental_hero_avian'];
        eq(stat('player', duel.player.monsters[0]), 3500, '2600 + 300 × 3');
        await removeByEffect('player', 0);
        eq([...duel.player.hand].sort(), ['MGX-elemental_hero_ocean', 'MGX-elemental_hero_woodsman'].sort(), 'two HERO recovered');
        eq(duel.player.banished, [], 'own banished zone emptied');
        eq(duel.enemy.banished.length, 1, 'opponent banished untouched');
        eq(duel.player.grave.includes('MGX-elemental_hero_the_shining'), true, 'sent to GY');
      });

      await test('Gaia: on-summon ATK halving is permanent for the target and self-boost', async () => {
        put('player', 'MGX-elemental_hero_stratos');
        put('player', 'MGX-elemental_hero_woodsman', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['MGX-elemental_hero_gaia'];
        put('enemy', 'AN-blue_eyes_white_dragon');
        ok(await play(0), 'Gaia fusion');
        const gaia = duel.player.monsters.find(s => s?.id === 'MGX-elemental_hero_gaia');
        ok(gaia, 'Gaia on field');
        eq(stat('enemy', duel.enemy.monsters[0]), 1500, 'BEWD halved');
        eq(stat('player', gaia), 3700, '2200 + 1500');
        duel.round++;
        eq(stat('player', gaia), 3700, 'boost persists');
      });

      await test('Great Tornado: halves ATK and DEF of all face-up opponent monsters', async () => {
        put('player', 'MGX-elemental_hero_woodsman');
        put('player', 'MGX-elemental_hero_stratos', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['MGX-elemental_hero_great_tornado'];
        put('enemy', 'AN-blue_eyes_white_dragon');
        put('enemy', 'MGX-elemental_hero_woodsman', 1, 'def_down');
        ok(await play(0), 'Great Tornado fusion');
        eq(stat('enemy', duel.enemy.monsters[0]), 1500, 'ATK halved');
        eq(stat('enemy', duel.enemy.monsters[0], 'def'), 1250, 'DEF halved');
        eq(stat('enemy', duel.enemy.monsters[1], 'def'), 2000, 'face-down monster untouched');
      });

      await test('Terra Firma: tribute another HERO for ATK/DEF until the end of the turn', async () => {
        put('player', 'MGX-elemental_hero_ocean');
        put('player', 'MGX-elemental_hero_woodsman', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['MGX-elemental_hero_terra_firma'];
        ok(await play(0), 'Terra Firma fusion');
        const tf = duel.player.monsters.find(s => s?.id === 'MGX-elemental_hero_terra_firma');
        ok(tf, 'Terra Firma on field');
        put('player', 'AN-elemental_hero_sparkman', 1);
        ok(await activate(duel.player.monsters.indexOf(tf)), 'effect resolves');
        eq(duel.player.monsters[1], null, 'HERO tributed');
        eq(stat('player', tf), 4100, '2500 + 1600');
        eq(stat('player', tf, 'def'), 3400, '2000 + 1400');
        duel.round++;
        eq(stat('player', tf), 2500, 'ATK expires');
        eq(stat('player', tf, 'def'), 2000, 'DEF expires');
      });

      await test('Escuridao: +100 per Elemental HERO in its controller GY only', async () => {
        const esc = put('player', 'MGX-elemental_hero_escuridao');
        duel.player.grave = ['MGX-elemental_hero_woodsman', 'AN-elemental_hero_avian', 'AN-dark_magician'];
        duel.enemy.grave = ['MGX-elemental_hero_ocean'];
        eq(stat('player', esc), 2700, '2500 + 100 × 2');
      });

      await test('Ocean: direct attack requires Umi, with no TCG stat bonus', async () => {
        const ocean = put('player', 'MGX-elemental_hero_ocean');
        put('enemy', 'AN-blue_eyes_white_dragon');
        eq(memeAnime.directAllowed('player', ocean), false, 'blocked without Umi');
        duel.player.field = { id: 'MGX-umi' };
        eq(stat('player', ocean), 1500, 'no Umi stat bonus');
        eq(memeAnime.directAllowed('player', ocean), true, 'direct allowed under Umi');
        duel.player.field = null;
        eq(memeAnime.directAllowed('player', ocean), false, 'lost with Umi');
        duel.player.hand = ['MGX-elemental_hero_ocean'];
        ok(await summonNormal(0), 'normal summon legal');
      });

      await test('Woodsman: start-of-turn Polymerization recovery once per turn from Deck or GY', async () => {
        put('player', 'MGX-elemental_hero_woodsman');
        duel.player.deck = ['AN-polymerization', 'AN-polymerization'];
        await memeAnime.perform(() => memeRules.beginTurn('player'));
        eq(duel.player.hand, ['AN-polymerization'], 'recovered from Deck');
        eq(duel.player.deck.length, 1, 'Deck shrunk');
        await memeAnime.perform(() => memeRules.beginTurn('player'));
        eq(duel.player.hand.length, 1, 'once per turn');
        duel.round++;
        await memeAnime.perform(() => memeRules.beginTurn('player'));
        eq(duel.player.hand.length, 2, 'new turn unlocks again');
        duel.player.hand = []; duel.player.deck = []; duel.player.grave = ['AN-polymerization'];
        duel.player.monsters[0].woodsmanOfferedRound = -1;
        duel.round++;
        await memeAnime.perform(() => memeRules.beginTurn('player'));
        eq(duel.player.hand, ['AN-polymerization'], 'recovered from GY');
        eq(duel.player.grave, [], 'GY emptied');
      });

      await test('Stratos: halves its own ATK for a direct attack, then restores next turn', async () => {
        const str = put('player', 'MGX-elemental_hero_stratos');
        put('enemy', 'AN-blue_eyes_white_dragon');
        ok(await activate(0), 'effect resolves');
        eq(stat('player', str), 900, 'half ATK');
        eq(memeAnime.directAllowed('player', str), true, 'direct unlocked');
        duel.phase = 'BATTLE';
        await battle('player', 0, null);
        eq(duel.enemy.lp, 3100, '900 direct damage');
        duel.round++;
        eq(stat('player', str), 1800, 'ATK restored');
        eq(memeAnime.directAllowed('player', str), false, 'direct locked again');
      });

      await test('Shadow Mist: Special Summon searches a Change Quick-Play, shared once per turn', async () => {
        const sm = put('player', 'MGX-elemental_hero_shadow_mist');
        duel.player.deck = ['MGX-mask_change'];
        await memeAnime.perform(() => memeAnime.postSummon('player', sm, 'special'));
        eq(duel.player.hand, ['MGX-mask_change'], 'Mask Change searched');
        await memeAnime.perform(() => memeAnime.postSummon('player', sm, 'special'));
        eq(duel.player.hand.length, 1, 'same turn shared limit');
      });

      await test('Shadow Mist: sent to the GY searches another HERO monster', async () => {
        const sm = put('player', 'MGX-elemental_hero_shadow_mist');
        duel.player.deck = ['AN-elemental_hero_sparkman'];
        await removeByEffect('player', 0, sm);
        eq(duel.player.hand, ['AN-elemental_hero_sparkman'], 'HERO searched');
        eq(duel.player.grave.includes('MGX-elemental_hero_shadow_mist'), true, 'Shadow Mist in GY');
      });

      // ── MGX · Masked HERO main deck + Mask Change ─────────────────
      await test('Bassols: vanilla Normal Summon and no legal Mask Change target', async () => {
        duel.player.hand = ['MGX-masked_hero_bassols'];
        ok(await summonNormal(0), 'normal summon');
        eq(await activate(0), false, 'vanilla');
        duel.player.extraDeck = ['MGX-masked_hero_vapor'];
        eq(memeAnime.transformationOptions('player', 'MGX-mask_change').length, 0, 'Mask Change has no Level 4-5 target');
      });

      await test('Gust: Mask Change into Blast and its on-summon ATK halving', async () => {
        put('player', 'MGX-masked_hero_gust');
        duel.player.hand = ['MGX-mask_change'];
        duel.player.extraDeck = ['MGX-masked_hero_blast'];
        put('enemy', 'AN-blue_eyes_white_dragon');
        ok(await play(0), 'transforms');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_blast', 'Blast on field');
        eq(duel.player.grave.includes('MGX-masked_hero_gust'), true, 'source sent to GY');
        eq(stat('enemy', duel.enemy.monsters[0]), 1500, 'BEWD halved');
      });

      await test('Gust: Mask Change II reaches Level 8 Divine Wind', async () => {
        put('player', 'MGX-masked_hero_gust');
        duel.player.hand = ['MGX-mask_change_ii', 'AN-kuriboh'];
        duel.player.extraDeck = ['MGX-masked_hero_divine_wind'];
        ok(await play(0), 'transforms');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_divine_wind', 'Divine Wind on field');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'discard cost paid');
        eq(duel.player.monsters[0].transformationSummoned, true, 'Transformation flags');
      });

      await test('Ray: Mask Change into Koga; Mask Change II cannot reach a Level 6 target', async () => {
        put('player', 'MGX-masked_hero_ray');
        duel.player.hand = ['MGX-mask_change'];
        duel.player.extraDeck = ['MGX-masked_hero_koga'];
        ok(await play(0), 'transforms');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_koga', 'Koga on field');
        duel.player.monsters[0] = null;
        put('player', 'MGX-masked_hero_ray');
        duel.player.hand = ['MGX-mask_change_ii', 'AN-kuriboh'];
        eq(memeAnime.transformationOptions('player', 'MGX-mask_change_ii').length, 0, 'II needs exactly Level 8');
      });

      await test('Fountain: reveal-and-summon itself in Defense without using the Normal Summon', async () => {
        duel.player.hand = ['MGX-masked_hero_fountain', 'MGX-masked_hero_ray'];
        ok(await memeAnime.perform(() => memeAnime.resolveEffect('player', card('MGX-masked_hero_fountain'))), 'hand effect');
        eq(duel.player.monsters[0].position, 'def', 'summoned in Defense');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_ray', 'auto picks the highest ATK HERO');
        eq(duel.player.hand, ['MGX-masked_hero_fountain'], 'Fountain stays in hand');
        ok(!duel.player.normalUsed && !duel.normalSummoned, 'Normal Summon untouched');
        eq(await memeAnime.perform(() => memeAnime.resolveEffect('player', card('MGX-masked_hero_fountain'))), false, 'once per turn');
      });

      await test('Fountain: sent to the GY by an effect sets a Mask Change from the Deck', async () => {
        const f = put('player', 'MGX-masked_hero_fountain');
        duel.player.deck = ['MGX-mask_change'];
        await removeByEffect('player', 0, f);
        eq(duel.player.spells[0]?.id, 'MGX-mask_change', 'Mask Change set');
        eq(duel.player.spells[0]?.faceDown, true, 'set face-down');
        eq(duel.player.deck, [], 'Deck emptied');
      });

      await test('Fountain: no recycle from a Tribute or a full backrow', async () => {
        put('player', 'MGX-masked_hero_fountain');
        duel.player.hand = ['AN-celtic_guardian'];
        duel.player.deck = ['MGX-mask_change'];
        ok(await summonNormal(0, [0]), 'Tribute Summon');
        eq(duel.player.spells.filter(Boolean).length, 0, 'Tribute does not recycle');
        reset();
        const f = put('player', 'MGX-masked_hero_fountain');
        duel.player.deck = ['MGX-mask_change'];
        duel.player.spells = Array.from({ length: 3 }, () => ({ id: 'AN-waboku', faceDown: true, setRound: 1 }));
        await removeByEffect('player', 0, f);
        eq(duel.player.deck, ['MGX-mask_change'], 'no free Spell/Trap zone');
      });

      await test('Vapor: immune to effect destruction but not to battle', async () => {
        const v = put('player', 'MGX-masked_hero_vapor');
        eq(await removeByEffect('player', 0, v), false, 'effect destruction blocked');
        eq(duel.player.monsters[0], v, 'Vapor survives');
        eq(duel.player.grave.includes('MGX-masked_hero_vapor'), false, 'not sent to GY');
        put('enemy', 'AN-blue_eyes_white_dragon');
        duel.phase = 'BATTLE';
        await battle('enemy', 0, 0);
        eq(duel.player.monsters[0], null, 'destroyed in battle');
        eq(duel.player.grave.includes('MGX-masked_hero_vapor'), true, 'in GY after battle');
      });

      await test('Acid: transformation route destroys all backrow and weakens face-up monsters', async () => {
        put('player', 'MGX-masked_hero_vapor');
        duel.player.hand = ['MGX-mask_change'];
        duel.player.extraDeck = ['MGX-masked_hero_acid'];
        duel.enemy.spells[0] = { id: 'AN-waboku', faceDown: true, setRound: 3 };
        duel.enemy.field = { id: 'MGX-umi' };
        put('enemy', 'AN-blue_eyes_white_dragon');
        put('enemy', 'AN-kuriboh', 1, 'def_down');
        ok(await play(0), 'transforms into Acid');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_acid', 'Acid on field');
        eq(duel.player.grave.includes('MGX-masked_hero_vapor'), true, 'Vapor source');
        eq(duel.enemy.spells[0], null, 'backrow destroyed');
        eq(duel.enemy.field, null, 'Field Spell destroyed');
        eq(stat('enemy', duel.enemy.monsters[0]), 2700, 'face-up ATK reduced by 300');
        eq(stat('enemy', duel.enemy.monsters[1]), 300, 'face-down monster untouched');
      });

      await test('Daian: battle kill summons a Level 4 monster from the Deck, never on a direct attack', async () => {
        put('player', 'MGX-masked_hero_daian');
        put('enemy', 'AN-kuriboh');
        duel.player.deck = ['AN-celtic_guardian'];
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.player.monsters[1]?.id, 'AN-celtic_guardian', 'summoned after the kill');
        eq(duel.player.deck, [], 'Deck emptied');
        reset();
        put('player', 'MGX-masked_hero_daian');
        duel.player.deck = ['AN-celtic_guardian'];
        duel.phase = 'BATTLE';
        await battle('player', 0, null);
        eq(duel.player.monsters.filter(Boolean).length, 1, 'no trigger on a direct attack');
        eq(duel.player.deck, ['AN-celtic_guardian'], 'Deck untouched');
      });

      await test('Blast: on-summon halves only the strongest face-up opponent monster', async () => {
        put('player', 'MGX-masked_hero_blast');
        put('enemy', 'AN-blue_eyes_white_dragon');
        put('enemy', 'AN-vorse_raider', 1);
        await memeAnime.perform(() => memeAnime.postSummon('player', duel.player.monsters[0]));
        eq(stat('enemy', duel.enemy.monsters[0]), 1500, 'BEWD halved');
        eq(stat('enemy', duel.enemy.monsters[1]), 1900, 'other monster untouched');
      });

      await test('Koga: +500 ATK for every opponent monster, hidden zones included', async () => {
        const k = put('player', 'MGX-masked_hero_koga');
        eq(stat('player', k), 2200, 'base');
        put('enemy', 'AN-kuriboh');
        put('enemy', 'AN-kuriboh', 1);
        put('enemy', 'AN-kuriboh', 2, 'def_down');
        eq(stat('player', k), 3700, '2200 + 500 × 3');
      });

      await test('Divine Wind: draws after a battle kill but not after a direct attack', async () => {
        put('player', 'MGX-masked_hero_divine_wind');
        put('enemy', 'AN-kuriboh');
        duel.player.deck = ['AN-celtic_guardian', 'AN-celtic_guardian'];
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.player.hand.length, 1, 'one draw');
        reset();
        put('player', 'MGX-masked_hero_divine_wind');
        duel.player.deck = ['AN-celtic_guardian'];
        duel.phase = 'BATTLE';
        await battle('player', 0, null);
        eq(duel.player.hand.length, 0, 'no draw on direct attack');
        eq(duel.player.deck.length, 1, 'Deck untouched');
      });

      await test('Mask Change: rejects Elemental HERO, wrong Attribute and an excessive Level gap', async () => {
        put('player', 'MGX-elemental_hero_ocean');
        duel.player.extraDeck = ['MGX-masked_hero_vapor'];
        eq(memeAnime.transformationOptions('player', 'MGX-mask_change').length, 0, 'Elemental HERO rejected');
        duel.player.monsters[0] = null;
        put('player', 'MGX-masked_hero_bassols');
        eq(memeAnime.transformationOptions('player', 'MGX-mask_change').length, 0, 'wrong Attribute rejected');
        duel.player.monsters[0] = null;
        put('player', 'MGX-masked_hero_gust');
        duel.player.extraDeck = ['MGX-masked_hero_divine_wind'];
        eq(memeAnime.transformationOptions('player', 'MGX-mask_change').length, 0, 'Level gap rejected');
        duel.player.extraDeck = ['MGX-masked_hero_blast'];
        eq(memeAnime.transformationOptions('player', 'MGX-mask_change').length, 1, 'legal pair accepted');
      });

      await test('Mask Change: can be activated from a set position and consumes the Spell', async () => {
        put('player', 'MGX-masked_hero_ray');
        duel.player.extraDeck = ['MGX-masked_hero_koga'];
        duel.player.spells[0] = { id: 'MGX-mask_change', faceDown: true, setRound: 3 };
        ok(await playSet(0), 'set Spell activation');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_koga', 'Koga on field');
        eq(duel.player.spells[0], null, 'Spell Zone emptied');
        eq(duel.player.grave.filter(id => id === 'MGX-mask_change').length, 1, 'Spell in GY');
      });

      await test('Mask Change II: exact Level 8, discard cost, self-discard prevention', async () => {
        put('player', 'MGX-masked_hero_bassols');
        duel.player.hand = ['MGX-mask_change_ii'];
        duel.player.extraDeck = ['MGX-masked_hero_daian'];
        eq(await play(0), false, 'cannot discard itself as the only card');
        eq(duel.player.hand, ['MGX-mask_change_ii'], 'hand preserved');
        ok(duel.player.monsters[0], 'source preserved');
        duel.player.hand = ['MGX-mask_change_ii', 'AN-kuriboh'];
        ok(await play(0), 'transforms with a discard cost');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_daian', 'Daian on field');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'discard paid');
        eq(duel.player.grave.includes('MGX-masked_hero_bassols'), true, 'source sent to GY');
      });

      await test('Mask Change II: Fountain becomes Acid and applies its on-summon effect', async () => {
        put('player', 'MGX-masked_hero_fountain');
        duel.player.hand = ['MGX-mask_change_ii', 'AN-kuriboh'];
        duel.player.extraDeck = ['MGX-masked_hero_acid'];
        put('enemy', 'AN-blue_eyes_white_dragon');
        ok(await play(0), 'transforms');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_acid', 'Acid on field');
        eq(stat('enemy', duel.enemy.monsters[0]), 2700, 'Acid on-summon effect');
      });

      // ── DL · Neos / Sunrise fusions ──────────────────────────────
      await test('Neos Fusion: Deck materials for Brave Neos and the rest-of-turn Special Summon lock', async () => {
        duel.player.hand = ['DL-neos_fusion'];
        duel.player.deck = ['AN-elemental_hero_neos', 'DL-elemental_hero_solid_soldier'];
        duel.player.extraDeck = ['DL-elemental_hero_brave_neos'];
        ok(await play(0), 'Neos Fusion resolves');
        eq(duel.player.monsters[0].id, 'DL-elemental_hero_brave_neos', 'Brave Neos summoned');
        eq(duel.player.grave.includes('AN-elemental_hero_neos'), true, 'Neos sent to GY');
        eq(duel.player.grave.includes('DL-elemental_hero_solid_soldier'), true, 'Solid Soldier sent to GY');
        eq(duel.player.noSpecialRound, duel.round, 'lock marked');
        duel.player.hand = ['AN-elemental_hero_bubbleman'];
        eq(memeAnime.specialMode('player', card('AN-elemental_hero_bubbleman')), null, 'Special Summons locked');
      });

      await test('Neos Fusion: no Neos in hand/Deck/field means no activation', async () => {
        duel.player.hand = ['DL-neos_fusion'];
        duel.player.deck = ['DL-elemental_hero_solid_soldier'];
        duel.player.extraDeck = ['DL-elemental_hero_brave_neos'];
        eq(await play(0), false, 'rejected');
        eq(duel.player.hand, ['DL-neos_fusion'], 'Spell kept');
        eq(duel.player.extraDeck, ['DL-elemental_hero_brave_neos'], 'Extra untouched');
        eq(duel.player.monsters.filter(Boolean).length, 0, 'no Summon');
      });

      await test('Neos Fusion: can summon the contact-fusion Air Neos from the Extra Deck', async () => {
        duel.player.hand = ['DL-neos_fusion'];
        duel.player.deck = ['AN-elemental_hero_neos', 'AN-neo_spacian_air_hummingbird'];
        duel.player.extraDeck = ['AN-elemental_hero_air_neos'];
        ok(await play(0), 'Air Neos via Neos Fusion');
        eq(duel.player.monsters[0].id, 'AN-elemental_hero_air_neos', 'Air Neos summoned');
        eq(duel.player.grave.includes('AN-neo_spacian_air_hummingbird'), true, 'Hummingbird sent to GY');
      });

      await test('Neos Fusion: protects its Neos Fusion monsters by banishing itself from the GY', async () => {
        duel.player.hand = ['DL-neos_fusion'];
        duel.player.deck = ['AN-elemental_hero_neos', 'DL-elemental_hero_solid_soldier'];
        duel.player.extraDeck = ['DL-elemental_hero_brave_neos'];
        ok(await play(0), 'Brave Neos summoned');
        const brave = duel.player.monsters[0];
        eq(await removeByEffect('player', 0, brave), false, 'destruction replaced');
        eq(duel.player.monsters[0], brave, 'Brave Neos survives');
        eq(duel.player.banished.includes('DL-neos_fusion'), true, 'Neos Fusion banished instead');
        eq(duel.player.grave.includes('DL-neos_fusion'), false, 'left the GY');
      });

      await test('Brave Neos: material legality, GY ATK boost and battle search', async () => {
        put('player', 'AN-elemental_hero_neos');
        put('player', 'AN-elemental_hero_sparkman', 1);
        eq(memeAnime.fusionOptions('player', 'DL-elemental_hero_brave_neos').length, 0, 'Normal monster rejected');
        duel.player.monsters[1] = null;
        put('player', 'DL-elemental_hero_solid_soldier', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['DL-elemental_hero_brave_neos'];
        ok(memeAnime.fusionOptions('player', 'DL-elemental_hero_brave_neos').length > 0, 'Level 4 effect monster accepted');
        ok(await play(0), 'Fusion Summon');
        const brave = duel.player.monsters.find(s => s?.id === 'DL-elemental_hero_brave_neos');
        ok(brave, 'Brave Neos on field');
        duel.player.grave = ['AN-elemental_hero_neos', 'AN-neo_spacian_air_hummingbird', 'AN-polymerization', 'DL-elemental_hero_solid_soldier'];
        eq(stat('player', brave), 2800, '2500 + 100 × 3 HERO/Neo-Spacian in GY');
        put('enemy', 'AN-kuriboh');
        duel.player.deck = ['DL-neos_fusion'];
        duel.phase = 'BATTLE';
        await battle('player', duel.player.monsters.indexOf(brave), 0);
        eq(duel.player.hand.includes('DL-neos_fusion'), true, 'Neos Spell searched after the kill');
      });

      await test('Sunrise: different-Attribute HERO fusion, Miracle Fusion search and aura', async () => {
        put('player', 'AN-elemental_hero_sparkman');
        put('player', 'AN-elemental_hero_clayman', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.deck = ['AN-miracle_fusion'];
        duel.player.extraDeck = ['DL-elemental_hero_sunrise'];
        ok(await play(0), 'Sunrise fusion');
        const sunrise = duel.player.monsters.find(s => s?.id === 'DL-elemental_hero_sunrise');
        ok(sunrise, 'Sunrise on field');
        eq(duel.player.hand.includes('AN-miracle_fusion'), true, 'Miracle Fusion searched');
        eq(stat('player', sunrise), 2700, '2500 + 200 for one Attribute');
        put('player', 'AN-elemental_hero_clayman', 1);
        eq(stat('player', sunrise), 2900, 'two Attributes');
        eq(stat('player', duel.player.monsters[1]), 1200, 'Clayman aura');
        duel.player.monsters[1] = null;
        put('player', 'AN-elemental_hero_neos', 1);
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['DL-elemental_hero_sunrise'];
        eq(memeAnime.fusionOptions('player', 'DL-elemental_hero_sunrise').length, 0, 'same Attribute rejected');
      });

      await test('Sunrise: another HERO attack trigger destroys a target before damage', async () => {
        put('player', 'DL-elemental_hero_sunrise');
        put('player', 'AN-elemental_hero_sparkman', 1);
        put('player', 'AN-elemental_hero_clayman', 2);
        put('enemy', 'AN-celtic_guardian');
        put('enemy', 'AN-blue_eyes_white_dragon', 1);
        duel.phase = 'BATTLE';
        await battle('player', 1, 0);
        eq(duel.enemy.monsters[1], null, 'Sunrise destroyed the highest-ATK target');
        eq(duel.enemy.monsters[0], null, 'defender destroyed in battle');
        eq(duel.enemy.lp, 3400, '600 battle damage after the aura');
      });

      // ── DL · Soldier / Honest Neos / Anki ────────────────────────
      await test('Liquid Soldier: revives a Level 4- HERO on Normal Summon', async () => {
        duel.player.hand = ['DL-elemental_hero_liquid_soldier'];
        duel.player.grave = ['AN-elemental_hero_bubbleman'];
        ok(await summonNormal(0), 'Normal Summon');
        ok(duel.player.monsters.some(s => s?.id === 'AN-elemental_hero_bubbleman'), 'Bubbleman revived');
        eq(duel.player.monsters.find(s => s?.id === 'AN-elemental_hero_bubbleman').position, 'atk', 'revived in Attack');
        eq(duel.player.grave.includes('AN-elemental_hero_bubbleman'), false, 'left the GY');
      });

      await test('Liquid Soldier: used as a field Fusion material draws 2 and discards 1', async () => {
        duel.player.hand = ['DL-neos_fusion'];
        duel.player.deck = ['AN-elemental_hero_neos', 'AN-polymerization', 'AN-raigeki'];
        duel.player.extraDeck = ['DL-elemental_hero_brave_neos'];
        put('player', 'DL-elemental_hero_liquid_soldier');
        ok(await play(0), 'Neos Fusion using Liquid Soldier');
        eq(duel.player.grave.includes('DL-elemental_hero_liquid_soldier'), true, 'Liquid Soldier material');
        eq(duel.player.hand.length, 1, 'drew 2 then discarded 1');
      });

      await test('Liquid Soldier: banished as a Fusion material also triggers the draw', async () => {
        duel.player.grave = ['DL-elemental_hero_liquid_soldier'];
        duel.player.deck = ['AN-kuriboh', 'AN-kuriboh'];
        await memeAnime.onBanished('player', 'DL-elemental_hero_liquid_soldier');
        eq(duel.player.hand.length, 1, 'draw 2 discard 1');
        eq(duel.player.grave.includes('AN-kuriboh'), true, 'one card discarded');
      });

      await test('Solid Soldier: Normal Summon Special Summons a Level 4- HERO from hand', async () => {
        duel.player.hand = ['DL-elemental_hero_solid_soldier', 'AN-elemental_hero_bubbleman'];
        ok(await summonNormal(0), 'Normal Summon');
        eq(duel.player.monsters.filter(Boolean).length, 2, 'Bubbleman Special Summoned');
        eq(duel.player.hand, [], 'hand emptied');
      });

      await test('Solid Soldier: sent to the GY by a Spell effect revives a HERO in Defense', async () => {
        const solid = put('player', 'DL-elemental_hero_solid_soldier');
        duel.player.grave = ['AN-elemental_hero_sparkman'];
        await removeByEffect('player', 0, solid);
        eq(duel.player.monsters[0]?.id, 'AN-elemental_hero_sparkman', 'Sparkman revived');
        eq(duel.player.monsters[0].position, 'def', 'revived in Defense');
      });

      await test('Solid Soldier: a discard or Tribute does not revive', async () => {
        duel.player.grave = ['DL-elemental_hero_solid_soldier', 'AN-elemental_hero_sparkman'];
        await memeAnime.onSentToGrave('player', 'DL-elemental_hero_solid_soldier', false, 'discard');
        eq(duel.player.monsters.filter(Boolean).length, 0, 'discard ignored');
      });

      await test('Honest Neos: discard from hand for +2500 ATK until the end of the turn', async () => {
        const spark = put('player', 'AN-elemental_hero_sparkman');
        duel.player.hand = ['DL-elemental_hero_honest_neos'];
        ok(await memeAnime.perform(() => memeAnime.resolveEffect('player', card('DL-elemental_hero_honest_neos'), { source: null, fromHand: true })), 'hand effect');
        eq(stat('player', spark), 4100, '1600 + 2500');
        eq(duel.player.hand, [], 'discarded itself');
        eq(duel.player.grave.includes('DL-elemental_hero_honest_neos'), true, 'in GY');
        eq(await memeAnime.perform(() => memeAnime.resolveEffect('player', card('DL-elemental_hero_honest_neos'), { source: null, fromHand: true })), false, 'once per turn');
      });

      await test('Honest Neos: field effect discards a HERO to gain its ATK', async () => {
        const honest = put('player', 'DL-elemental_hero_honest_neos');
        duel.player.hand = ['AN-elemental_hero_sparkman'];
        ok(await activate(0), 'field effect');
        eq(stat('player', honest), 4100, '2500 + 1600');
        eq(duel.player.hand, [], 'HERO discarded');
        duel.player.hand = ['AN-elemental_hero_avian'];
        eq(await activate(0), false, 'once per turn');
        reset();
        put('player', 'DL-elemental_hero_honest_neos');
        duel.player.hand = ['AN-kuriboh'];
        eq(await activate(0), false, 'requires a HERO in hand');
        eq(duel.player.hand, ['AN-kuriboh'], 'no card lost');
      });

      await test('Masked HERO Anki: direct attack at half ATK and Change search after a kill', async () => {
        const anki = put('player', 'DL-masked_hero_anki');
        duel.phase = 'BATTLE';
        await battle('player', 0, null);
        eq(duel.enemy.lp, 2600, '2800 halved to 1400');
        reset();
        put('player', 'DL-masked_hero_anki');
        put('enemy', 'AN-kuriboh');
        duel.player.deck = ['MGX-mask_change', 'AN-polymerization'];
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.enemy.monsters[0], null, 'Kuriboh destroyed');
        eq(duel.player.hand.includes('MGX-mask_change'), true, 'Mask Change searched');
        eq(duel.player.hand.includes('AN-polymerization'), false, 'other Spells untouched');
        duel.player.hand = ['AN-polymerization'];
        duel.player.extraDeck = ['DL-masked_hero_anki'];
        eq(memeAnime.fusionOptions('player', 'DL-masked_hero_anki').length, 0, 'cannot be Fusion Summoned');
        eq(await play(0), false, 'Polymerization rejected');
      });

      // ── DL · Spells ──────────────────────────────────────────────
      await test('A Hero Lives: pays half LP, face-down monsters do not block, face-up ones do', async () => {
        duel.player.hand = ['DL-a_hero_lives'];
        duel.player.deck = ['AN-elemental_hero_sparkman', 'AN-elemental_hero_avian'];
        ok(await play(0), 'activation');
        eq(duel.player.lp, 2000, 'half LP paid');
        eq(duel.player.monsters.filter(Boolean).length, 1, 'one HERO summoned');
        eq(duel.player.grave.includes('DL-a_hero_lives'), true, 'Spell in GY');
        reset();
        put('player', 'AN-elemental_hero_sparkman', 0, 'def_down');
        duel.player.hand = ['DL-a_hero_lives'];
        duel.player.deck = ['AN-elemental_hero_avian'];
        ok(await play(0), 'face-down monster does not block');
        eq(duel.player.monsters.filter(Boolean).length, 2, 'second monster summoned');
        eq(duel.player.lp, 2000, 'half LP paid');
        reset();
        put('player', 'AN-elemental_hero_sparkman');
        duel.player.hand = ['DL-a_hero_lives'];
        duel.player.deck = ['AN-elemental_hero_avian'];
        eq(await play(0), false, 'face-up monster blocks');
        eq(duel.player.lp, 4000, 'no LP paid');
        eq(duel.player.hand, ['DL-a_hero_lives'], 'Spell kept');
      });

      await test('Form Change: swaps a HERO Fusion for a same-Level Masked HERO and recycles the source', async () => {
        put('player', 'AN-elemental_hero_flame_wingman');
        duel.player.hand = ['DL-form_change'];
        duel.player.extraDeck = ['MGX-masked_hero_koga'];
        ok(await play(0), 'Form Change');
        eq(duel.player.monsters[0].id, 'MGX-masked_hero_koga', 'Koga on field');
        eq(duel.player.monsters[0].transformationSummoned, true, 'Transformation flags');
        eq(duel.player.extraDeck, ['AN-elemental_hero_flame_wingman'], 'source returned to Extra Deck');
        eq(duel.player.grave.includes('DL-form_change'), true, 'Spell in GY');
        duel.player.monsters[0] = null;
        put('player', 'AN-elemental_hero_thunder_giant');
        duel.player.hand = ['DL-form_change'];
        duel.player.extraDeck = ['DL-masked_hero_anki'];
        eq(await play(0), false, 'Level mismatch rejected');
        eq(duel.player.hand, ['DL-form_change'], 'Spell kept');
        duel.player.monsters[0] = null;
        put('player', 'AN-elemental_hero_neos');
        duel.player.extraDeck = ['MGX-masked_hero_koga'];
        eq(await play(0), false, 'non-Fusion source rejected');
      });

      await test('Favorite Hero: equips any Level 5+ HERO, rejects Level 4, adds DEF and blocks targeting', async () => {
        const vapor = put('player', 'MGX-masked_hero_vapor');
        duel.player.hand = ['DL-favorite_hero'];
        ok(await play(0), 'equip a non-Elemental HERO Level 6');
        eq(duel.player.spells[0]?.id, 'DL-favorite_hero', 'equip placed');
        eq(vapor.favoriteHero, true, 'marker set');
        duel.player.field = { id: 'AN-skyscraper' };
        eq(stat('player', vapor), 4400, '2400 + original 2000 DEF');
        eq(T.spellTargetAllowed('enemy', card('AN-raigeki'), { name: 'player', slot: vapor, id: vapor.id }), false, 'opponent cannot target it');
        reset();
        put('player', 'AN-elemental_hero_sparkman');
        duel.player.hand = ['DL-favorite_hero'];
        eq(await play(0), false, 'Level 4 rejected');
        eq(duel.player.hand, ['DL-favorite_hero'], 'Spell kept');
      });

      await test('Favorite Hero: Battle Phase auto-activates a Field Spell and grants a second attack', async () => {
        const vapor = put('player', 'MGX-masked_hero_vapor');
        duel.player.hand = ['DL-favorite_hero'];
        ok(await play(0), 'equipped');
        duel.player.deck = ['AN-skyscraper'];
        put('enemy', 'AN-celtic_guardian');
        duel.phase = 'BATTLE';
        await battle('player', 0, 0);
        eq(duel.player.field?.id, 'AN-skyscraper', 'Field Spell activated from the Deck');
        eq(duel.player.deck, [], 'Deck emptied');
        eq(duel.enemy.monsters[0], null, 'defender destroyed');
        eq(duel.enemy.lp, 1000, '4400 - 1400 battle damage');
        eq(duel.player.monsters[0].attacksUsed, 0, 'second attack unlocked');
        eq(duel.player.spells.filter(Boolean).length, 0, 'Favorite Hero sent to the GY');
        eq(duel.player.grave.includes('DL-favorite_hero'), true, 'in GY');
      });

      render = oldRender;
      const heroCount = HERO_IDS.filter(id => card(id)).length;
      return { results, heroCount };
    }, HERO_IDS);

    testResults.results.forEach(r => console.log('✅ ' + r));
    if (errors.length) throw Error('Page errors: ' + errors.join(' | '));
    console.log(`🎉 ${testResults.results.length} scenario groups passed across ${testResults.heroCount} HERO cards.`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  server.close();
  process.exitCode = 1;
});
