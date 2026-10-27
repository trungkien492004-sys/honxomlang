const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

const publicDir = path.resolve('dist');
const documents = new Map();
const server = http.createServer((request, response) => {
  if (request.url === '/fixture') {
    response.setHeader('Content-Type', 'text/html');
    return response.end('<meta name="viewport" content="width=device-width,initial-scale=1"><div id="host"></div>');
  }
  const file = path.resolve(publicDir, '.' + new URL(request.url, 'http://local').pathname);
  if (!file.startsWith(publicDir + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return response.writeHead(404).end();
    response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    response.end(bytes);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const checks = [];
  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      const native = fetch;
      window.fetch = (url, ...args) => String(url).includes('runAggregationQuery') ? Promise.resolve({ ok: true, json: async () => [{ result: { aggregateFields: { total: { integerValue: '1' } } } }] }) : native(url, ...args);
    });
    await page.exposeFunction('readDb', async key => documents.get(key) || null);
    await page.exposeFunction('writeDb', async (key, data, merge) => {
      documents.set(key, merge ? { ...documents.get(key), ...data } : data);
    });
    await page.exposeFunction('listDb', async key =>
      [...documents].filter(([k]) => k.startsWith(key + '/')).map(([k, data]) => ({ id: k.slice(key.length + 1), data }))
    );

    await page.goto(`http://127.0.0.1:${server.address().port}/fixture`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(({ uid, name, origin }) => {
      const subscriptions = [];
      class ServerTimestamp { toMillis() { return Date.now(); } }
      const resolve = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value instanceof ServerTimestamp ? Date.now() : value]));
      const snap = data => ({ exists: !!data, data: () => data });
      const doc = key => ({
        path: key,
        get: async () => snap(await readDb(key)),
        set: (data, options) => writeDb(key, resolve(data), !!options?.merge),
        update: data => writeDb(key, resolve(data), true),
        onSnapshot(callback) { const entry = { key, callback }; subscriptions.push(entry); readDb(key).then(data => callback(snap(data))); return () => subscriptions.splice(subscriptions.indexOf(entry), 1); }
      });
      const db = {
        doc,
        runTransaction: async action => action({ get: ref => ref.get(), update: (ref, data) => ref.update(data), set: (ref, data, options) => ref.set(data, options) }),
        collection: key => ({
          orderBy() { return this; },
          limit() { return this; },
          async get() {
            const rows = await listDb(key);
            const docs = rows.map(d => ({ id: d.id, data: () => d.data }));
            return { empty: !docs.length, docs, forEach: callback => docs.forEach(callback) };
          },
          where: (field, op, value) => ({ onSnapshot(callback) { const entry = { key, field, value, callback }; subscriptions.push(entry); return () => subscriptions.splice(subscriptions.indexOf(entry), 1); } })
        })
      };
      const user = { uid, displayName: name, metadata: { creationTime: new Date(Date.now() - 30 * 86400000).toISOString() }, getIdToken: async () => 'test-token' };
      window._testAllowed = true;
      window._legacyAuthReady = true;
      window.siteIdentity = { user, ready: true, db, whenReady: Promise.resolve(), subscribe(callback) { callback({ user, ready: true }); return () => {}; } };
      window.currentFirebaseUser = user;
      window.myNetworkId = uid;
      window.player = { name };
      const firestore = () => db;
      firestore.FieldValue = { serverTimestamp: () => new ServerTimestamp() };
      window.firebase = { firestore };
      const frame = document.createElement('iframe');
      frame.src = origin + '/memecard.html';
      frame.style = 'position:fixed;inset:0;width:100%;height:100%;border:0';
      document.getElementById('host').appendChild(frame);
    }, { uid: 'TestPlayerUid', name: 'Đấu sĩ Test', origin: `http://127.0.0.1:${server.address().port}` });

    await page.waitForFunction(() => document.querySelector('iframe')?.contentWindow.memeIdDuel, { timeout: 30000 });
    const frame = page.frames().find(f => f.parentFrame());

    await frame.evaluate(() => {
      window._testAllowed = true;
      memeMusic.setEnabled(false);
      memeFx.setMode('minimal');
      memeOpening.create = () => ({ face: 'heads', first: 'player', readyAt: Date.now() - 1 });
      memeAnime.setAuto(false);
    });

    // 1. Publish deck profile
    await frame.evaluate(() => memeIdDuel.publish(true));
    assert.ok(documents.has('duel_directory/TestPlayerUid'));
    checks.push('Player profile published to duel_directory');

    // 1.1 Verify Rank Season Promotional announcement modal
    await frame.waitForSelector('#rankPromoOverlay', { timeout: 5000 });
    const promoTitle = await frame.evaluate(() => document.getElementById('rankPromoTitle')?.textContent || '');
    assert.ok(promoTitle.includes('Đấu Trí Đỉnh Cao'), 'Rank promo modal title: ' + promoTitle);
    await frame.evaluate(() => document.getElementById('promoDismissBtn')?.click());
    const promoHidden = await frame.evaluate(() => !document.getElementById('rankPromoOverlay'));
    assert.ok(promoHidden, 'Rank promo modal dismissed on button click');
    checks.push('Rank Season announcement modal rendered and dismissed cleanly');

    // 2. Start game vs bot from "Vào trận"
    const startResult = await frame.evaluate(() => {
      try {
        startGame();
        return { ok: true, duel: !!duel };
      } catch (e) {
        return { ok: false, error: e.message, stack: e.stack };
      }
    });
    console.log('startResult:', startResult);
    const duelInfo = await frame.evaluate(() => ({
      hasDuel: !!duel,
      rankChallengeId: duel.rankChallengeId,
      rankChallengeOpponentUid: duel.rankChallengeOpponentUid
    }));
    assert.ok(duelInfo.hasDuel, 'Duel started');
    assert.ok(duelInfo.rankChallengeId && duelInfo.rankChallengeId.startsWith('bot-'), 'Bot challenge ID set: ' + duelInfo.rankChallengeId);
    assert.ok(duelInfo.rankChallengeOpponentUid && duelInfo.rankChallengeOpponentUid.startsWith('bot-'), 'Bot opponent UID set: ' + duelInfo.rankChallengeOpponentUid);
    checks.push('Bot match automatically assigned rankChallengeId and opponent UID');

    // 3. Finish duel with player win
    await frame.evaluate(() => finish('player', 'Thắng tuyệt đối!'));
    for (let i = 0; i < 30 && !documents.has('rank_profiles/TestPlayerUid'); i++) await new Promise(r => setTimeout(r, 100));

    const savedProfile = documents.get('rank_profiles/TestPlayerUid');
    assert.ok(savedProfile, 'rank_profiles/TestPlayerUid was written');
    assert.equal(savedProfile.wins, 1, 'Wins should be 1');
    assert.equal(savedProfile.losses, 0, 'Losses should be 0');
    assert.equal(savedProfile.played, 1, 'Played should be 1');
    assert.ok(savedProfile.rating > 1000, 'Rating should have increased: ' + savedProfile.rating);
    checks.push('Bot match victory updated Elo and wins in rank_profiles');

    // Check modal UI contains rank update note
    const modalText = await frame.evaluate(() => document.querySelector('.rank-challenge-result')?.textContent || '');
    assert.ok(modalText.toUpperCase().includes('BXH ĐÃ CẬP NHẬT') || modalText.includes('BXH đã cập nhật'), 'Victory modal displays rank update note: ' + modalText);
    checks.push('Victory modal displays updated Elo and record');

    // 4. Test rematch ('againBtn')
    await frame.evaluate(() => document.getElementById('againBtn').click());
    const rematchInfo = await frame.evaluate(oldMatchId => ({
      rankChallengeId: duel.rankChallengeId,
      oldMatchId
    }), duelInfo.rankChallengeId);
    assert.ok(rematchInfo.rankChallengeId.startsWith('bot-'));
    assert.notEqual(rematchInfo.rankChallengeId, rematchInfo.oldMatchId, 'Rematch generated a fresh challenge ID');
    checks.push('Rematch generated a distinct challenge ID');

    // 5. Finish rematch with second win
    await frame.evaluate(() => finish('player', 'Thắng lần hai!'));
    for (let i = 0; i < 30; i++) {
      const p = documents.get('rank_profiles/TestPlayerUid');
      if (p?.wins === 2) break;
      await new Promise(r => setTimeout(r, 100));
    }
    const profile2 = documents.get('rank_profiles/TestPlayerUid');
    assert.equal(profile2.wins, 2, 'Wins should now be 2');
    assert.equal(profile2.played, 2, 'Played should now be 2');
    assert.ok(profile2.rating > savedProfile.rating, 'Rating should have increased again');
    checks.push('Second bot victory correctly accumulated wins and Elo');

    // 6. Verify Leaderboard modal renders updated profile
    await frame.evaluate(() => siteRank.show());
    await frame.waitForSelector('#rankRows tr');
    const boardData = await frame.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#rankRows tr'));
      const playerRow = rows.find(r => r.textContent.includes('Đấu sĩ Test'));
      return {
        progressText: document.getElementById('rankProgress')?.textContent,
        playerRowText: playerRow?.textContent,
        totalRows: rows.length
      };
    });
    assert.ok(boardData.progressText.includes('2 thắng'), 'BXH progress shows 2 wins: ' + boardData.progressText);
    assert.ok(boardData.playerRowText && boardData.playerRowText.includes('Đấu sĩ Test'), 'BXH rows include player: ' + boardData.playerRowText);
    assert.ok(boardData.playerRowText.includes('2'), 'BXH player row shows 2 wins: ' + boardData.playerRowText);
    checks.push('Leaderboard modal displays updated Elo and 2 wins across ' + boardData.totalRows + ' rows');

    // 7. Verify Quick Matchmaking modal and 60s online/bot fallback
    await frame.evaluate(() => siteRank.close());
    await frame.evaluate(() => siteRank.find());
    await frame.waitForSelector('#rankMatchOverlay', { timeout: 5000 });
    const mmTitle = await frame.evaluate(() => document.querySelector('.rank-match-title')?.textContent || '');
    assert.ok(mmTitle.includes('Ghép Trận Rank Nhanh'), 'Matchmaking modal shown: ' + mmTitle);
    const mmSec = await frame.evaluate(() => document.getElementById('rankMatchSec')?.textContent);
    assert.ok(mmSec === '60' || mmSec === '59', 'Countdown started at 60s: ' + mmSec);
    // Cancel matchmaking to test clean exit
    await frame.evaluate(() => document.getElementById('rankMatchCancelBtn')?.click());
    const mmClosed = await frame.evaluate(() => !document.getElementById('rankMatchOverlay'));
    assert.ok(mmClosed, 'Matchmaking cancelled cleanly on user request');
    checks.push('Quick Matchmaking 60s modal verified and cancelled cleanly');

    // 8. Quick match must actually dispatch an online invite (and cancel it).
    const api = await frame.evaluate(() => ({ invite: typeof memeIdDuel.invite, cancelInvite: typeof memeIdDuel.cancelInvite, challenge: typeof memeIdDuel.challenge }));
    assert.deepEqual(api, { invite: 'function', cancelInvite: 'function', challenge: 'function' }, 'Rank API must expose invite/cancelInvite/challenge');
    const mine = documents.get('duel_players/TestPlayerUid');
    documents.set('duel_directory/OtherUid', { uid: 'OtherUid', name: 'Đối thủ Online', newbieUntil: 0, online: true, lastSeen: Date.now(), updatedAt: Date.now() });
    documents.set('duel_players/OtherUid', { ...mine, uid: 'OtherUid', name: 'Đối thủ Online', networkId: 'OtherNetId', online: true, busy: false, lastSeen: Date.now() });
    await frame.evaluate(() => {
      window.__invited = []; window.__cancelled = 0;
      memeIdDuel.invite = player => { window.__invited.push({ uid: player.uid, name: player.name }); return Promise.resolve('invited'); };
      memeIdDuel.cancelInvite = async () => { window.__cancelled += 1; };
    });
    await frame.evaluate(() => siteRank.find());
    await frame.waitForSelector('#rankMatchOverlay', { timeout: 5000 });
    for (let i = 0; i < 40 && !(await frame.evaluate(() => window.__invited.length)); i++) await new Promise(r => setTimeout(r, 100));
    const invited = await frame.evaluate(() => window.__invited);
    assert.equal(invited.length, 1, 'Quick match invites exactly one online candidate');
    assert.equal(invited[0].uid, 'OtherUid', 'Invite targets the online directory candidate: ' + JSON.stringify(invited));
    await frame.evaluate(() => document.getElementById('rankMatchCancelBtn')?.click());
    assert.equal(await frame.evaluate(() => window.__cancelled), 1, 'Cancelling matchmaking cancels the pending invite');
    assert.equal(await frame.evaluate(() => !document.getElementById('rankMatchOverlay')), true, 'Matchmaking overlay removed after cancel');
    checks.push('Quick match sends an online invite and cancels it cleanly');

    console.log('Bot duel BXH tests:', checks.length, 'checks passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});
