const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'dist');
const out = path.join(root, 'outputs/deck-filter-polish');
fs.mkdirSync(out, { recursive: true });

const server = http.createServer((req, res) => {
  const f = path.resolve(pub, '.' + new URL(req.url, 'http://localhost').pathname.replace(/^\/$/, '/memecard.html'));
  if (!f.startsWith(pub + path.sep)) return res.writeHead(403).end();
  fs.readFile(f, (e, b) => {
    if (e) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg'
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
    args: ['--no-sandbox', '--disable-background-timer-throttling']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 1366, height: 850 });
    await page.evaluateOnNewDocument(() => { window._testAllowed = true; });
    await page.goto(base + '/memecard.html', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.memeAnime && window.memePhase1);

    console.log('Testing Deck Builder Filter Polish...');

    // Open Deck Builder
    await page.evaluate(() => openDeckBuilder());

    // 1. Verify Total Cards
    const totalCount = await page.$$eval('#deckGrid .deck-item', els => els.length);
    assert.equal(totalCount, 285, 'Total cards in builder should be 285');
    console.log('✓ Total 285 cards present');

    // 2. Verify 7 Characters + Staples Filter
    const characterCounts = {
      yugi: 39,
      kaiba: 28,
      joey: 27,
      pegasus: 24,
      jaden: 58,
      zane: 23,
      mai: 25,
      yuma: 15,
      staples: 46
    };
    for (const [hero, expected] of Object.entries(characterCounts)) {
      await page.select('#deckArchetype', hero);
      const count = await page.$$eval('#deckGrid .deck-item', els => els.length);
      assert.equal(count, expected, `Character ${hero} expected ${expected} cards, got ${count}`);
    }
    console.log('✓ All 7 characters + Yuma + staples filtered with exact counts (Yugi:39, Kaiba:28, Joey:27, Pegasus:24, Jaden:58, Zane:23, Mai:25, Yuma:15, Staples:46)');
    await page.select('#deckArchetype', '');

    // 3. Verify Card Types (Monster, Spell, Trap)
    await page.evaluate(() => { deckFilter = 'Monster'; renderDeckBuilder(); });
    const monsterCount = await page.$$eval('#deckGrid .deck-item', els => els.length);
    assert.equal(monsterCount, 189, `Monster count expected 189, got ${monsterCount}`);

    await page.evaluate(() => { deckFilter = 'Spell'; renderDeckBuilder(); });
    const spellCount = await page.$$eval('#deckGrid .deck-item', els => els.length);
    assert.equal(spellCount, 72, `Spell count expected 72, got ${spellCount}`);

    await page.evaluate(() => { deckFilter = 'Trap'; renderDeckBuilder(); });
    const trapCount = await page.$$eval('#deckGrid .deck-item', els => els.length);
    assert.equal(trapCount, 24, `Trap count expected 24, got ${trapCount}`);

    await page.evaluate(() => { deckFilter = 'All'; renderDeckBuilder(); });
    console.log('✓ Card type filters verified (Monster: 189, Spell: 72, Trap: 24)');

    // 4. Verify Limit Filter & Badges
    await page.select('#deckLimitFilter', '1');
    const limit1Count = await page.$$eval('#deckGrid .deck-item', els => els.length);
    assert.equal(limit1Count, 82, `Limit 1 expected 82 cards, got ${limit1Count}`);

    // Verify all 82 cards display the red circular limit badge with text "1"
    const limit1Badges = await page.$$eval('#deckGrid .deck-item .limit-badge.limit-1', els => els.length);
    assert.equal(limit1Badges, 82, 'All 82 limit-1 cards should display limit-1 badge');

    // Take screenshot of limit 1 filter
    await page.screenshot({ path: path.join(out, 'builder-limit1-filter.png') });
    console.log('✓ Limit 1 filter returned 82 cards (including Graceful Charity, Change of Heart, Mirror Force, Premature Burial), all with .limit-badge.limit-1');

    await page.select('#deckLimitFilter', '3');
    const limit3Count = await page.$$eval('#deckGrid .deck-item', els => els.length);
    assert.equal(limit3Count, 199, `Unlimited (3 copies) expected 199 cards, got ${limit3Count}`);
    await page.select('#deckLimitFilter', '');

    // 5. Verify Badge Layout: Rarity at top-left, Limit badge at top-right
    const badgeGeom = await page.evaluate(() => {
      // Find a card that is Limit 1, e.g. AN-pot_of_greed
      const item = document.querySelector('.deck-item[data-card-id="AN-pot_of_greed"]');
      if (!item) return null;
      const preview = item.querySelector('.library-preview');
      const rarity = preview.querySelector('.rarity');
      const limit = preview.querySelector('.limit-badge');
      const pRect = preview.getBoundingClientRect();
      const rRect = rarity.getBoundingClientRect();
      const lRect = limit.getBoundingClientRect();
      return {
        rarityLeft: rRect.left - pRect.left,
        rarityTop: rRect.top - pRect.top,
        limitRight: pRect.right - lRect.right,
        limitTop: lRect.top - pRect.top,
        limitText: limit.textContent.trim(),
        rarityText: rarity.textContent.trim()
      };
    });
    assert.ok(badgeGeom, 'Card AN-pot_of_greed should exist in library');
    assert.equal(badgeGeom.limitText, '1');
    assert.equal(badgeGeom.rarityText, 'UR');
    assert.ok(badgeGeom.rarityLeft < 10, 'Rarity should be on the left');
    assert.ok(badgeGeom.limitRight < 10, 'Limit badge should be on the right');
    console.log('✓ Visual layout verified: Rarity top-left, Red Limit badge top-right:', badgeGeom);

    // 6. Verify Rarity Reclassification & Staples Limits
    const cardChecks = await page.evaluate(() => {
      return {
        darkMagician: card('AN-dark_magician')?.rarity,
        blueEyes: card('AN-blue_eyes_white_dragon')?.rarity,
        redEyes: card('AN-red_eyes_black_dragon')?.rarity,
        neos: card('AN-elemental_hero_neos')?.rarity,
        cyberDragon: card('AN-cyber_dragon')?.rarity,
        exodia: card('AN-exodia_the_forbidden_one')?.rarity,
        slifer: card('AN-slifer_the_sky_dragon')?.rarity,
        kuriboh: card('AN-kuriboh')?.rarity,
        wingedKuriboh: card('AN-winged_kuriboh')?.rarity,
        miracleFusionHero: card('AN-miracle_fusion')?.archetype,
        charityLimit: card('AN-graceful_charity')?.max_copies,
        charityRarity: card('AN-graceful_charity')?.rarity,
        changeOfHeartLimit: card('AN-change_of_heart')?.max_copies,
        mirrorForceLimit: card('AN-mirror_force')?.max_copies,
        prematureLimit: card('AN-premature_burial')?.max_copies,
        prematureRarity: card('AN-premature_burial')?.rarity,
      };
    });
    assert.equal(cardChecks.darkMagician, 'UR');
    assert.equal(cardChecks.blueEyes, 'UR');
    assert.equal(cardChecks.redEyes, 'UR');
    assert.equal(cardChecks.neos, 'UR');
    assert.equal(cardChecks.cyberDragon, 'UR');
    assert.equal(cardChecks.exodia, 'UR');
    assert.equal(cardChecks.slifer, 'UR');
    assert.equal(cardChecks.kuriboh, 'N');
    assert.equal(cardChecks.wingedKuriboh, 'N');
    assert.equal(cardChecks.miracleFusionHero, 'Jaden · HERO', 'Miracle Fusion must belong to Jaden / HERO');
    assert.equal(cardChecks.charityLimit, 1, 'Graceful Charity must be Limit 1');
    assert.equal(cardChecks.charityRarity, 'UR');
    assert.equal(cardChecks.changeOfHeartLimit, 1, 'Change of Heart must be Limit 1');
    assert.equal(cardChecks.mirrorForceLimit, 1, 'Mirror Force must be Limit 1');
    assert.equal(cardChecks.prematureLimit, 1, 'Premature Burial must be Limit 1');
    assert.equal(cardChecks.prematureRarity, 'UR');
    console.log('✓ Rarity reclassification verified & Miracle Fusion in Jaden & OP staples (Charity, Change of Heart, Mirror Force, Premature Burial) limited to 1');

    // 7. Verify Redundant Controls (#deckRole and #deckSource) are Hidden
    const hiddenStatus = await page.evaluate(() => {
      const role = document.getElementById('deckRole');
      const source = document.getElementById('deckSource');
      return {
        roleInDom: !!role,
        roleHidden: role.offsetParent === null || getComputedStyle(role).display === 'none',
        sourceInDom: !!source,
        sourceHidden: source.offsetParent === null || getComputedStyle(source).display === 'none',
      };
    });
    assert.ok(hiddenStatus.roleInDom && hiddenStatus.roleHidden, '#deckRole should be hidden');
    assert.ok(hiddenStatus.sourceInDom && hiddenStatus.sourceHidden, '#deckSource should be hidden');
    console.log('✓ Redundant controls (#deckRole, #deckSource) successfully hidden from UI view while kept in DOM');

    // 8. Verify Duel Hand Cards remain clean without limit badges in game
    await page.evaluate(() => {
      closeModal();
      startGame();
      clearTimeout(aiTimer);
      closeModal();
      const m = document.getElementById('modal');
      if (m) { m.classList.add('hidden'); m.style.display = 'none'; }
      const cs = document.getElementById('openingCoinStage');
      if (cs) cs.remove();
      document.body.classList.remove('modal-open');
      duel.player.hand = ['AN-pot_of_greed', 'AN-dark_magician', 'AN-kuriboh'];
      render();
    });
    const handLimitBadge = await page.$eval('#hand .card', cardEl => {
      const b = cardEl.querySelector('.limit-badge');
      return b ? b.textContent.trim() : null;
    });
    assert.equal(handLimitBadge, null, 'Hand cards in duel should remain clean without limit badge');
    const firstCardEl = await page.$('#hand .card');
    if (firstCardEl) {
      await firstCardEl.screenshot({ path: path.join(out, 'hand-clean-in-duel.png') });
    }
    console.log('✓ Hand cards during duel remain clean without limit badge');

    // 9. Take Full Screenshot of Deck Builder with Characters
    await page.evaluate(() => {
      openDeckBuilder();
    });
    await page.screenshot({ path: path.join(out, 'builder-overview.png') });

    assert.deepEqual(errors, []);
    console.log('\n🎉 ALL DECK FILTER POLISH UNIT & INTEGRATION TESTS PASSED 100%!');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
