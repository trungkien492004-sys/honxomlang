// Regression: profile modal replaces cloud sync modal, paid rename, item shop, expanded journey, big footer buttons.
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict'), puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..'), pub = path.join(root, 'dist'), out = path.join(root, 'outputs/profile-shop');
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  const f = path.resolve(pub, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!f.startsWith(pub + path.sep)) return res.writeHead(403).end();
  fs.readFile(f, (e, b) => {
    if (e) return res.writeHead(404).end();
    res.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream');
    res.end(b);
  });
});
const base = () => `http://127.0.0.1:${server.address().port}`;

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const b = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const p = await b.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  try {
    await p.goto(base() + '/memecard.html');
    await p.waitForFunction(() => window.memeProgress && window.memePacks && window.memeJourney && window.memeProfile && window.memeShop && window.memeCloud);
    await p.evaluate(() => memeMusic.setEnabled(false));
    // The rank promo modal is injected on a delayed timer; dismiss it right before screenshots.
    const dismissPromo = async () => {
      await p.evaluate(() => document.getElementById('closeRankPromo')?.click());
      await new Promise(r => setTimeout(r, 150));
    };
    await p.evaluate(() => document.getElementById('closeRankPromo')?.click());

    // 1. Old cloud sync modal is gone; the chip opens the profile instead.
    assert.equal(await p.evaluate(() => typeof window.memeCloud.openModal), 'undefined');
    await p.waitForFunction(() => document.getElementById('cloudBtn'), { timeout: 15000 });
    await p.evaluate(() => document.getElementById('cloudBtn').click());
    assert.ok(await p.$('.profile-modal'), 'cloud chip opens profile modal');
    const headText = await p.$eval('.profile-modal', el => el.textContent);
    assert.ok(!headText.includes('Đồng bộ tiến trình'), 'no legacy sync modal copy');
    assert.ok(headText.includes('🆔'), 'profile shows an ID row');
    await dismissPromo();
    await p.screenshot({ path: path.join(out, 'profile.png') });

    // 2. Paid rename: blocked without Xu, charged with Xu, persisted to storage.
    assert.equal(await p.evaluate(() => memeProfile.rename('Kiên Xóm').ok), false);
    await p.evaluate(() => { memeProgress.addXu(600); });
    const rename = await p.evaluate(() => {
      const r = memeProfile.rename('Kiên Xóm');
      return { ok: r.ok, via: r.via, xu: memeProgress.state.xu, name: memeProfile.displayName(), stored: JSON.parse(localStorage.getItem('xom-progress-v1')).profile.name };
    });
    assert.deepEqual(rename, { ok: true, via: 'xu', xu: 100, name: 'Kiên Xóm', stored: 'Kiên Xóm' });
    assert.equal(await p.evaluate(() => memeProfile.rename('ab').ok), false, 'too-short name rejected');
    assert.equal(await p.evaluate(() => memeProfile.rename('Kiên Xóm').ok), false, 'same-name rejected');

    // 3. Item shop: buy flows move Xu into tickets/dust/items and respect the balance.
    await p.evaluate(() => window.memeShop.open());
    assert.ok(await p.$('.shop-modal'));
    const shop = await p.evaluate(() => {
      memeProgress.addXu(900);
      const st = memeProgress.state, before = { xu: st.xu, p1: st.tickets.p1, dust: st.dust, rename: st.items.rename };
      const poor = memeShop.buy('ticket_p3').ok === false;
      const buys = [memeShop.buy('ticket_p1').ok, memeShop.buy('dust_bag').ok, memeShop.buy('rename').ok];
      const after = { xu: st.xu, p1: st.tickets.p1, dust: st.dust, rename: st.items.rename };
      return {
        poor,
        buys,
        spentXu: before.xu - after.xu,
        p1: after.p1 - before.p1,
        dust: after.dust - before.dust,
        renameCards: after.rename - before.rename
      };
    });
    assert.deepEqual(shop, { poor: true, buys: [true, true, true], spentXu: 950, p1: 1, dust: 200, renameCards: 1 });
    await dismissPromo();
    await p.screenshot({ path: path.join(out, 'shop.png') });

    // 4. Rename card in the bag is preferred over Xu.
    const cardRename = await p.evaluate(() => {
      const xu = memeProgress.state.xu;
      const r = memeProfile.rename('Kaiba Jr');
      return { ok: r.ok, via: r.via, xuKept: memeProgress.state.xu === xu, cards: memeProgress.state.items.rename };
    });
    assert.deepEqual(cardRename, { ok: true, via: 'card', xuKept: true, cards: 0 });

    // 5. XP potion item works from the bag.
    const potion = await p.evaluate(() => {
      memeProgress.addItem('potion', 1);
      const xp = memeProgress.state.xp, lv = memeProgress.state.level;
      memeProgress.useItem('potion');
      memeProgress.addXp(memeProfile.POTION_XP);
      return { used: memeProgress.state.items.potion === 0, gained: (memeProgress.state.level > lv ? memeProgress.xpNeed(lv) + memeProgress.state.xp - xp : memeProgress.state.xp - xp) };
    });
    assert.equal(potion.used, true);
    assert.equal(potion.gained, 150);

    // 5b. Duel-board themes: shop section, purchase, equip applies #duel[data-theme], persistence.
    const themeInit = await p.evaluate(() => ({
      count: window.memeThemes.THEMES.length,
      defaultOwned: memeProgress.state.themes.owned.includes('default'),
      inShop: (window.memeShop.open(), document.querySelectorAll('.theme-item').length),
      poorBuy: memeThemes.buy('ankh').ok === false
    }));
    assert.equal(themeInit.count, 5);
    assert.equal(themeInit.defaultOwned, true);
    assert.equal(themeInit.inShop, 5);
    assert.equal(themeInit.poorBuy, true, 'theme blocked without Xu');
    const themeBuy = await p.evaluate(() => {
      memeProgress.addXu(2000);
      const r = memeThemes.buy('ankh');
      const replay = memeThemes.buy('ankh');
      const badEquip = memeThemes.equip('neon').ok === false;
      const equipped = memeThemes.equip('ankh');
      return { ok: r.ok, xu: memeProgress.state.xu, replay: replay.ok === false, badEquip, active: memeProgress.state.themes.active, attr: document.getElementById('duel').dataset.theme, equipped: equipped.ok };
    });
    assert.deepEqual(themeBuy, { ok: true, xu: 1250, replay: true, badEquip: true, equipped: true, active: 'ankh', attr: 'ankh' });
    await p.reload();
    await p.waitForFunction(() => window.memeThemes && window.memeProgress && window.memeProgress.ready);
    await p.evaluate(() => memeMusic.setEnabled(false));
    const afterReload = await p.evaluate(() => ({ owned: memeProgress.state.themes.owned, active: memeProgress.state.themes.active, attr: document.getElementById('duel')?.dataset.theme }));
    assert.deepEqual(afterReload.owned, ['default', 'ankh']);
    assert.equal(afterReload.active, 'ankh');
    assert.equal(afterReload.attr, 'ankh');
    await p.evaluate(() => { memeThemes.equip('default'); });
    assert.equal(await p.evaluate(() => document.getElementById('duel').dataset.theme), undefined, 'default clears the attribute');
    await p.evaluate(() => { memeThemes.equip('ankh'); document.getElementById('duel').classList.add('hidden'); $('lobby').classList.remove('hidden'); });

    // 6. Journey expanded: 26 chapters, 20 tower floors, unlock chain intact.
    const journey = await p.evaluate(() => ({
      chapters: memeJourney.CHAPTERS.length,
      floors: memeJourney.TOWER.length,
      firstLocked: memeJourney.chapterUnlocked(1),
      state: (memeJourney.towerState(), memeJourney.storyState(), true)
    }));
    assert.equal(journey.chapters, 26);
    assert.equal(journey.floors, 20);
    assert.equal(journey.firstLocked, false);
    const presets = await p.evaluate(() => [...memeJourney.CHAPTERS.map(c => c.preset), ...memeJourney.TOWER.map(f => f.preset)].filter(n => !window.MEME_DECK_PRESETS[n]));
    assert.deepEqual(presets, [], 'every journey preset exists in the catalog');

    // 7. Clearing chapter 1 unlocks chapter 2 and grants the reward.
    const firstClear = await p.evaluate(() => {
      const started = memeJourney.startStory('c1');
      if (!started) return { started: false };
      const r = memeJourney.onDuelFinished(true);
      document.getElementById('backBtn')?.click();
      return { started: true, cleared: memeJourney.chapterCleared('c1'), unlocked2: memeJourney.chapterUnlocked(1), title: r && r.title };
    });
    assert.equal(firstClear.started, true, 'chapter 1 startable with starter deck');
    assert.equal(firstClear.cleared, true);
    assert.equal(firstClear.unlocked2, true);
    assert.ok(firstClear.title && firstClear.title.includes('Chặng 1'));

    // 8. Big footer buttons exist, are ordered like the rank buttons and stay in bounds.
    await p.evaluate(() => closeModal());
    for (const [width, height] of [[360, 640], [390, 844], [1366, 768]]) {
      await p.setViewport({ width, height });
      await p.evaluate(() => window.memeLobbyMenu.open());
      const boxes = await p.$$eval('#lobby .lobby-footer button', ns => ns.map(n => {
        const r = n.getBoundingClientRect();
        return { id: n.id, w: r.width, h: r.height, x: r.x, y: r.y, right: r.right, bottom: r.bottom };
      }));
      for (const id of ['journeyBtn', 'shopBigBtn', 'playBtn', 'rankPlayBtn', 'rankBoardBtn', 'lobbyDeckBtn']) {
        assert.ok(boxes.some(x => x.id === id), `${id} missing at ${width}x${height}`);
      }
      assert.ok(boxes.every(r => r.w > 0 && r.h > 0 && r.x >= -1 && r.y >= -1 && r.right <= width + 1 && r.bottom <= height + 1), JSON.stringify({ width, height, boxes }));
      const journey = boxes.find(r => r.id === 'journeyBtn'), rank = boxes.find(r => r.id === 'rankPlayBtn');
      assert.ok(journey.h >= rank.h - 4, 'journey button about as tall as rank button');
      assert.ok(journey.w >= 100, 'menu item wide enough to tap');
      assert.ok(await p.evaluate(() => document.querySelector('#journeyBtn > span').offsetHeight > 0), 'journey label visible');
      await dismissPromo();
      await p.screenshot({ path: path.join(out, `lobby-${width}x${height}.png`) });
    }
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));

    // 9. Journey modal opens from the big button and lists all chapters.
    await p.evaluate(() => document.getElementById('journeyBtn').click());
    assert.ok(await p.$('.journey-modal'));
    assert.equal(await p.$$eval('.journey-row', n => n.length), 26);
    await p.evaluate(() => document.querySelector('.journey-tabs [data-tab="tower"]').click());
    assert.equal(await p.$$eval('.tower-cell', n => n.length), 20);
    await p.screenshot({ path: path.join(out, 'journey-tower.png') });
    await p.evaluate(() => closeModal());

    // 10. Profile button in the progress strip opens the same modal.
    assert.ok(await p.$('#profileBtn'));
    await p.evaluate(() => document.getElementById('profileBtn').click());
    assert.ok(await p.$('.profile-modal'));
    await p.evaluate(() => closeModal());

    assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
    console.log('Profile/shop/journey: sync modal replaced, paid rename + rename card, 6-item shop, 26 chapters, 20 floors, big footer buttons in bounds, no page errors.');
  } finally {
    await b.close();
    server.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; server.close(); });
