// Kiểm tra từng lá bài bằng cách THỰC SỰ chạy nó trong engine (không chỉ đọc mã).
// Dùng: node scripts/audit-cards.cjs [--out file.json] [--only AN-id,AN-id2]
// Kết quả mỗi lá: status = ok | noop | error | untested  (+ ghi chú). Không sửa dữ liệu game.
const fs = require('fs'), path = require('path'), http = require('http'), puppeteer = require('puppeteer');

const args = process.argv.slice(2);
const argOf = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const out = argOf('--out') || path.resolve(__dirname, '../outputs/card-audit.json');
const only = (argOf('--only') || '').split(',').filter(Boolean);
const pub = path.resolve(__dirname, '..', 'dist');

const server = http.createServer((req, res) => {
  const f = path.resolve(pub, '.' + new URL(req.url, 'http://l').pathname.replace(/^\/$/, '/memecard.html'));
  if (!f.startsWith(pub + path.sep)) return res.writeHead(403).end();
  fs.readFile(f, (e, b) => {
    if (e) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[path.extname(f)] || 'application/octet-stream');
    res.end(b);
  });
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
    await page.waitForFunction(() => window.memeAnime && window.memeDlHandlers && window.memeProgress, { timeout: 30000 });

    const results = await page.evaluate(async (only) => {
      const rejections = [];
      window.addEventListener('unhandledrejection', e => rejections.push(String(e.reason?.message || e.reason)));
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const withTimeout = (p, ms, label) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Error('timeout ' + label)), ms))]);

      const vanilla = MEME_CARDS.filter(c => c.card_type === 'Monster' && c.deck_zone === 'Main' && !c.effect_code && (c.stars || 0) <= 4 && c.monster_category === 'Thường');
      const F = [vanilla[0].id, vanilla[1].id, vanilla[2].id];
      const strong = MEME_CARDS.find(c => c.id === 'AN-blue_eyes_white_dragon') || vanilla[0];
      const presetOf = id => {
        const names = Object.keys(MEME_DECK_PRESETS);
        return names.find(n => MEME_DECK_PRESETS[n].includes(id) || (MEME_EXTRA_PRESETS[n] || []).includes(id)) || names[0];
      };
      const snap = () => JSON.stringify({ p: duel.player, e: duel.enemy }, (k, v) => (k === 'uid' || k === 'logs') ? undefined : v);

      async function reset(c) {
        clearTimeout(aiTimer);
        await memeAnime.flush?.();
        memeFx.reset(); closeModal(); memeMusic.setEnabled(false); memeAnime.setAuto(true);
        const preset = presetOf(c.id), main = [...MEME_DECK_PRESETS[preset]], extra = [...(MEME_EXTRA_PRESETS[preset] || [])];
        const take = main.indexOf(c.id); if (take >= 0) main.splice(take, 1);
        duel = {
          player: blankSide(main, extra, 0), enemy: blankSide(MEME_DECK_PRESETS['Kaiba · Kinh điển'], MEME_EXTRA_PRESETS['Kaiba · Kinh điển'] || [], 1),
          turn: 'player', phase: 'MAIN1', round: 3, normalSummoned: false, mode: null, pending: null, selected: null, logs: [], finished: false
        };
        const P = duel.player, E = duel.enemy;
        P.hand = []; P.grave = [F[2], 'AN-pot_of_greed']; P.banished = []; P.monsters = [monsterSlot(F[0]), monsterSlot(F[1]), null];
        P.spells = [null, null, null]; P.field = null; P.extra = null;
        E.hand = ['AN-kuriboh']; E.grave = [F[2]]; E.banished = []; E.monsters = [monsterSlot(strong.id), monsterSlot(F[0], 'def'), null];
        E.spells = [null, null, null]; E.field = null; E.extra = null;
        $('lobby')?.classList.add('hidden'); $('duel')?.classList.remove('hidden');
        P.monsters.forEach(s => { if (s) s.summonedRound = 1; }); E.monsters.forEach(s => { if (s) s.summonedRound = 1; });
        render();
        return { preset };
      }

      const onField = (n, id) => [...duel[n].monsters, duel[n].extra].some(s => s && s.id === id);
      const logMark = () => duel.logs.length;
      const newLogs = m => duel.logs.slice(m).map(l => typeof l === 'string' ? l : (l.text || JSON.stringify(l))).slice(0, 6);

      async function exercise(c) {
        const P = duel.player, E = duel.enemy, notes = [];
        const before = snap(), mark = logMark();
        let action = '', ok = false, acted = false;
        if (c.card_type === 'Monster') {
          const extraZone = c.deck_zone === 'Extra';
          if (extraZone) {
            action = 'extra-summon';
            if (c.fusion_materials?.length) {
              P.monsters = [null, null, null]; const mats = c.fusion_materials.slice(0, 3);
              mats.forEach((m, i) => { if (CARD_BY_ID_SAFE(m)) P.monsters[i] = monsterSlot(m); });
              if (c.fusion_materials.length > 3) notes.push('materials>3');
              P.hand = ['AN-polymerization'];
              const opt = memeAnime.fusionOptions?.('player', c.id, 'fusion');
              notes.push('fusionOptions=' + (Array.isArray(opt) ? opt.length : typeof opt));
              ok = !!(await memeAnime.perform(() => memeAnime.fuse('player', c.contact ? null : 'AN-polymerization', c.id, 'fusion')));
            } else {
              P.extraDeck = [c.id, ...P.extraDeck.filter(x => x !== c.id)];
              P.monsters = [monsterSlot(F[0]), monsterSlot(F[1]), monsterSlot(F[2])];
              const pool = MEME_CARDS.filter(x => x.card_type === 'Monster' && x.deck_zone === 'Main' && !x.special_only);
              if (c.xyz_requirement || c.monster_category === 'Xyz') {
                const rank = c.rank ?? c.xyz_requirement?.rank, n = c.xyz_requirement?.materials || 2;
                const mats = pool.filter(x => x.stars === rank).slice(0, n); P.monsters = [null, null, null]; mats.forEach((m, i) => P.monsters[i] = monsterSlot(m.id));
                notes.push('xyz mats ' + mats.length + '/' + n);
              } else if (c.monster_category?.startsWith('Đồng Bộ')) {
                let done = false;
                for (const tu of pool.filter(x => x.is_tuner)) { const nt = pool.find(x => !x.is_tuner && x.stars === c.stars - tu.stars && x.stars > 0); if (nt) { P.monsters = [monsterSlot(tu.id), monsterSlot(nt.id), null]; done = true; break; } }
                notes.push('synchro mats ' + done);
              }
              const so = typeof synchroOptions === 'function' ? synchroOptions('player', c.id) : null; if (so) notes.push('synchroOptions=' + so.length);
              try { await withTimeout(Promise.resolve(summonExtra(0)), 8000, 'summonExtra'); } catch (e) { notes.push('extra-err:' + e.message); }
              await memeAnime.flush?.(); await sleep(250); ok = onField('player', c.id);
            }
            ok = ok || onField('player', c.id);
            acted = true;
          } else if (c.special_only || c.ritual_spell) {
            action = 'special-summon';
            P.hand = [c.id];
            if (c.ritual_spell) {
              action = 'ritual-spell'; P.hand = [c.ritual_spell, c.id, F[0], F[1], F[2]]; P.monsters = [null, null, null];
              await withTimeout(memeAnime.perform(() => memeAnime.playSpellFor('player', 0)), 8000, 'ritual'); ok = onField('player', c.id);
            } else {
              const mode = memeAnime.specialMode?.('player', c); notes.push('specialMode=' + mode);
              ok = !!(mode && await memeAnime.perform(() => memeAnime.specialSummon('player', 0))) || onField('player', c.id);
            }
            acted = true;
          } else {
            action = 'normal-summon';
            P.hand = [c.id];
            const need = c.tribute_count ?? (c.stars >= 7 ? 2 : c.stars >= 5 ? 1 : 0);
            if (!need) P.monsters = [null, monsterSlot(F[1]), null];
            const trib = P.monsters.map((s, i) => s ? i : -1).filter(i => i >= 0).slice(0, need);
            ok = !!(await memeAnime.perform(() => memeAnime.normalSummon('player', 0, 'atk', trib)));
            ok = ok || onField('player', c.id);
            acted = true;
          }
          if (ok && c.effect_trigger === 'activated') {
            const idx = P.monsters.findIndex(s => s && s.id === c.id);
            const isExtra = idx < 0 && P.extra?.id === c.id;
            if (idx >= 0 || isExtra) {
              action += '+activate';
              const b2 = snap();
              try { await withTimeout(activateMonsterEffect(isExtra ? -1 : idx, isExtra), 6000, 'activate'); } catch (e) { notes.push('activate-err:' + e.message); return { action, ok, err: e.message, logs: newLogs(mark), notes }; }
              if (snap() === b2) notes.push('activated-noop');
              else notes.push('activated-changed');
            }
          }
        } else if (c.card_type === 'Spell') {
          action = 'play-spell';
          P.hand = [c.id];
          prepare(c, P, E, notes);
          const res = await memeAnime.perform(() => memeAnime.playSpellFor('player', 0));
          ok = !!res || !P.hand.includes(c.id);
          acted = true;
        } else if (c.card_type === 'Trap') {
          action = 'trap-battle';
          P.spells[0] = { id: c.id, faceDown: true, setRound: 1 };
          prepare(c, P, E, notes);
          duel.turn = 'enemy';
          E.monsters.forEach(s => { if (s) { s.attacked = false; s.attacksUsed = 0; s.summonedRound = 1; } });
          try { await withTimeout(memeAnime.perform(() => memeAnime.battle('enemy', 0, false, 0)), 6000, 'battle'); } catch (e) { notes.push('battle-err:' + e.message); }
          const used = !P.spells[0] || P.spells[0].id !== c.id || P.spells[0].faceDown === false || P.grave.includes(c.id);
          ok = used;
          if (!used) {
            action = 'trap-spell';
            duel.turn = 'enemy'; E.hand = ['AN-pot_of_greed'];
            try { await withTimeout(memeAnime.perform(() => memeAnime.playSpellFor('enemy', 0)), 6000, 'enemy-spell'); } catch (e) { notes.push('spell-err:' + e.message); }
            ok = !P.spells[0] || P.spells[0].faceDown === false || P.grave.includes(c.id);
          }
          if (!ok) {
            action = 'trap-summon';
            P.spells[0] = P.spells[0] && P.spells[0].id === c.id ? P.spells[0] : { id: c.id, faceDown: true, setRound: 1 };
            duel.turn = 'enemy'; E.normalSummoned = false; E.hand = [F[0]]; E.monsters = [null, null, null]; E.spells = [{ id: 'AN-mirror_force', faceDown: true, setRound: 1 }, null, null];
            try { await withTimeout(memeAnime.perform(() => memeAnime.normalSummon('enemy', 0, 'atk', [])), 6000, 'enemy-summon'); } catch (e) { notes.push('summon-err:' + e.message); }
            ok = !P.spells[0] || P.spells[0].faceDown === false || P.grave.includes(c.id);
          }
          if (!ok) {
            action = 'trap-direct';
            duel.turn = 'player'; P.spells[0] = { id: c.id, faceDown: true, setRound: 1 };
            try { await withTimeout(memeAnime.perform(() => activateTrap(0)), 6000, 'activateTrap'); } catch (e) { notes.push('direct-err:' + e.message); }
            ok = !P.spells[0] || P.spells[0].faceDown === false || P.grave.includes(c.id);
          }
          acted = true;
        }
        const changed = snap() !== before;
        return { action, ok, changed, acted, logs: newLogs(mark), notes };
      }
      const byName = (re, pred = () => true) => MEME_CARDS.find(x => re.test(x.id) && pred(x));
      function prepare(c, P, E, notes) {
        const code = c.effect_code || c.id, cd = id => MEME_CARDS.find(x => x.id === id);
        const four = MEME_CARDS.filter(x => x.card_type === 'Monster' && x.deck_zone === 'Main' && !x.effect_code && x.stars === 4 && x.monster_category === 'Thường');
        const hero = id => id && MEME_CARDS.some(x => x.id === id);
        if (code === 'dark_magic_attack') { P.monsters = [monsterSlot('AN-dark_magician'), null, null]; E.spells = [{ id: 'AN-mirror_force', faceDown: true, setRound: 1 }, null, null]; }
        else if (code === 'multiply') P.monsters = [monsterSlot('AN-kuriboh'), null, null];
        else if (code === 'flute') { P.monsters = [monsterSlot('AN-lord_of_d'), null, null]; P.hand = [c.id, 'AN-red_eyes_black_dragon']; }
        else if (code === 'ritual') { const rm = MEME_CARDS.find(x => x.ritual_spell === c.id); P.hand = [c.id, rm.id, four[0].id, four[1].id]; P.monsters = [null, null, null]; notes.push('ritual→' + rm.id); }
        else if (code === 'fusion_summon' || code === 'power_bond') { P.monsters = [monsterSlot('AN-cyber_dragon'), monsterSlot('AN-cyber_dragon'), null]; P.extraDeck = ['AN-cyber_twin_dragon']; }
        else if (code === 'miracle_fusion') { P.monsters = [monsterSlot('AN-elemental_hero_avian'), monsterSlot('AN-elemental_hero_burstinatrix'), null]; P.extraDeck = MEME_CARDS.filter(x => x.deck_zone === 'Extra' && /elemental_hero/.test(x.id) && (x.fusion_materials || []).length === 2 && (x.fusion_materials || []).every(m => ['AN-elemental_hero_avian', 'AN-elemental_hero_burstinatrix'].includes(m))).map(x => x.id); notes.push('extra=' + P.extraDeck.join(',')); }
        else if (code === 'de_fusion') { P.monsters = [monsterSlot('AN-cyber_twin_dragon'), null, null]; P.grave = ['AN-cyber_dragon', 'AN-cyber_dragon']; P.extraDeck = []; }
        else if (code === 'destroy_spell_target' || code === 'dust_tornado') E.spells = [{ id: 'AN-mirror_force', faceDown: true, setRound: 1 }, null, null];
        else if (code === 'reincarnate') P.hand = [c.id, F[0]];
        else if (code === 'magic_jammer' || code === 'seven_tools') P.hand = [F[0]];
        else if (code === 'haunted') { P.grave = ['AN-dark_magician']; }
        else if (code === 'mask_change' || code === 'mask_change_ii') { const h = MEME_CARDS.find(x => /MGX-masked_hero_(fountain|gust|ray)/.test(x.id)); P.monsters = [monsterSlot(h.id), null, null]; P.hand = code === 'mask_change_ii' ? [c.id, F[0]] : [c.id]; P.extraDeck = MEME_CARDS.filter(x => /MGX-masked_hero_/.test(x.id) && x.deck_zone === 'Extra').map(x => x.id); }
      }
      const CARD_BY_ID_SAFE = id => MEME_CARDS.some(c => c.id === id);

      const list = MEME_CARDS.filter(c => !only.length || only.includes(c.id));
      const res = [];
      for (const c of list) {
        const rec = { id: c.id, name: c.name_en || c.name, type: c.card_type, cat: c.monster_category || c.spell_category || c.trap_category || '', code: c.effect_code || '', trig: c.effect_trigger || '', status: 'untested' };
        const rj0 = rejections.length;
        try {
          const { preset } = await reset(c); rec.preset = preset;
          const r = await withTimeout(exercise(c), 15000, 'card');
          Object.assign(rec, { action: r.action, logs: r.logs, notes: r.notes });
          if (r.err) rec.status = 'error';
          else if (!r.acted) rec.status = 'untested';
          else if (!r.ok) rec.status = 'fail';
          else rec.status = 'ok';
        } catch (e) { rec.status = 'error'; rec.err = String(e.message || e).slice(0, 200); }
        if (rejections.length > rj0) { rec.rejections = rejections.slice(rj0).slice(0, 2); if (rec.status === 'ok') rec.status = 'error'; }
        res.push(rec);
      }
      return res;
    }, only);

    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(results, null, 1));
    const tally = {}; results.forEach(r => { tally[r.status] = (tally[r.status] || 0) + 1; });
    console.log('cards', results.length, JSON.stringify(tally), '->', out);
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; server.close(); });
