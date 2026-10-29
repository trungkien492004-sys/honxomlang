const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer');

const pub = path.resolve('outputs/rank-challenge/public');
const docs = new Map();
const clients = [];
const events = [];

const server = http.createServer((request, response) => {
  if (request.url === '/fixture') {
    response.setHeader('Content-Type', 'text/html');
    return response.end('<meta name="viewport" content="width=device-width,initial-scale=1"><div id="host"></div>');
  }
  const file = path.resolve(pub, '.' + new URL(request.url, 'http://local').pathname);
  if (!file.startsWith(pub + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return response.writeHead(404).end();
    response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    response.end(bytes);
  });
});

setTimeout(() => { console.error('Online result test timed out'); process.exit(1); }, 300000).unref();

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const errors = [];
  async function deliver() {
    for (const client of clients) await client.page.evaluate(data => window.deliverDb?.(data), Object.fromEntries(docs));
  }
  async function relay() {
    for (let loop = 0; loop < 8; loop++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      for (const [uid, message] of events.splice(0)) for (const client of clients) if (client.uid !== uid) await client.frame.evaluate(m => window.memeOnlineReceive(m), message);
    }
  }
  async function pollFrame(frame, test, label) {
    for (let i = 0; i < 60; i++) { if (await frame.evaluate(test)) return; await new Promise(resolve => setTimeout(resolve, 500)); }
    throw Error('Timeout: ' + label);
  }
  try {
    for (const [uid, name] of [['AliceID', 'Alice'], ['BobID', 'Bob']]) {
      const page = await browser.newPage();
      page.on('pageerror', error => { errors.push(error.message); console.log('browser error', error.message); });
      page.on('console', message => { if (/Rank|BXH|record/i.test(message.text())) console.log('[' + uid + ']', message.text()); });
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      const client = { page, uid };
      clients.push(client);
      await page.exposeFunction('listDb', async key => [...docs].filter(([k]) => k.startsWith(key + '/')).map(([k, data]) => ({ id: k.slice(key.length + 1), data })));
      await page.exposeFunction('readDb', async key => docs.get(key) || null);
      await page.exposeFunction('writeDb', async (key, data, merge) => { docs.set(key, merge ? { ...docs.get(key), ...data } : data); setTimeout(() => deliver().catch(() => {}), 0); });
      await page.exposeFunction('networkSend', message => events.push([uid, message]));
      await page.goto(`http://127.0.0.1:${server.address().port}/fixture`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(({ uid, name, origin }) => {
        const subscriptions = [];
        const snap = data => ({ exists: !!data, data: () => data });
        const doc = key => ({
          path: key,
          get: async () => snap(await readDb(key)),
          set: data => writeDb(key, data, false),
          update: data => writeDb(key, data, true),
          onSnapshot(fn) { const entry = { key, fn }; subscriptions.push(entry); readDb(key).then(d => fn(snap(d))); return () => subscriptions.splice(subscriptions.indexOf(entry), 1); }
        });
        const db = {
          doc,
          runTransaction: async fn => fn({ get: ref => ref.get(), set: (ref, d) => ref.set(d), update: (ref, d) => ref.update(d) }),
          collection: key => ({
            orderBy() { return this; }, limit() { return this; },
            async get() { const rows = await listDb(key); return { empty: !rows.length, docs: rows.map(d => ({ id: d.id, data: () => d.data })) }; },
            where: (field, op, value) => ({ onSnapshot(fn) { const entry = { collection: key, field, value, fn }; subscriptions.push(entry); return () => subscriptions.splice(subscriptions.indexOf(entry), 1); } })
          })
        };
        window.deliverDb = records => {
          for (const subscription of subscriptions) {
            if (subscription.key) subscription.fn(snap(records[subscription.key]));
            else subscription.fn({ docs: Object.entries(records).filter(([k, v]) => k.startsWith(subscription.collection + '/') && v[subscription.field] === subscription.value).map(([k, v]) => ({ ...snap(v), id: k.slice(subscription.collection.length + 1) })) });
          }
        };
        const user = { uid, displayName: name, metadata: { creationTime: new Date(Date.now() - (uid === 'BobID' ? 2 : 30) * 86400000).toISOString() }, getIdToken: async () => 'fixture-token' };
        window.siteIdentity = { user, ready: true, db, whenReady: Promise.resolve(), subscribe(fn) { fn({ user, ready: true }); return () => {}; } };
        window.currentFirebaseUser = user;
        window.myNetworkId = uid;
        window.player = { name };
        window.pvpChannel = { postMessage: message => networkSend(message) };
        const firestore = () => db;
        firestore.FieldValue = { serverTimestamp: () => Date.now() };
        window.firebase = { firestore };
        const frame = document.createElement('iframe');
        frame.src = origin + '/memecard.html';
        frame.style = 'position:fixed;inset:0;width:100%;height:100%;border:0';
        document.getElementById('host').appendChild(frame);
      }, { uid, name, origin: `http://127.0.0.1:${server.address().port}` });
      await page.waitForFunction(() => document.querySelector('iframe')?.contentWindow.memeIdDuel);
      client.frame = page.frames().find(candidate => candidate.parentFrame());
      await client.frame.evaluate(() => {
        memeMusic.setEnabled(false);
        memeFx.setMode('minimal');
        memeOpening.create = () => ({ face: 'heads', first: 'player', readyAt: Date.now() - 1 });
        memeAnime.setAuto(false);
        sessionStorage.setItem('rank-promo-dismissed', '1');
        document.getElementById('rankPromoOverlay')?.remove();
      });
    }
    const [a, b] = clients;
    await deliver();
    await a.frame.evaluate(() => memeIdDuel.publish(true));
    await b.frame.evaluate(() => memeIdDuel.publish(true));

    await a.frame.evaluate(() => siteRank.show());
    await a.frame.waitForSelector('#rankRows [data-challenge-uid="BobID"]');
    await a.frame.evaluate(() => document.querySelector('#rankRows [data-challenge-uid="BobID"]').click());
    await b.frame.waitForSelector('#idAcceptInvite');
    await b.frame.evaluate(() => document.getElementById('idAcceptInvite').click());
    await relay();
    await pollFrame(a.frame, () => !!memeRoom?.playing, 'host enters the duel');
    await pollFrame(b.frame, () => !!memeRoom?.playing, 'guest enters the duel');

    const ids = await b.frame.evaluate(() => ({ challengeId: memeRoom.challengeId, rankChallengeId: duel.rankChallengeId, opponent: duel.rankChallengeOpponentUid }));
    console.log('guest ids', ids);

    await a.frame.evaluate(() => { duel.enemy.lp = 0; checkWin(); });
    await relay();
    await pollFrame(b.frame, () => duel?.finished === true, 'guest sees the finished match');
    await new Promise(resolve => setTimeout(resolve, 2500));

    const hostProfile = docs.get('rank_profiles/AliceID');
    const guestProfile = docs.get('rank_profiles/BobID');
    const resultKeys = [...docs.keys()].filter(key => key.startsWith('rank_challenge_results/'));
    console.log('host profile', hostProfile);
    console.log('guest profile', guestProfile);
    console.log('results', resultKeys, docs.get('duel_invites/AliceID_BobID'));
    assert.ok(hostProfile && hostProfile.wins === 1 && hostProfile.played === 1, 'host win must be recorded');
    assert.ok(guestProfile && guestProfile.losses === 1 && guestProfile.played === 1, 'guest loss must be recorded');
    assert.equal(resultKeys.length, 2, 'both clients must write a rank result');
    assert.ok(guestProfile.rating < 1000, 'guest must lose Elo even while protected as a newbie');

    await a.frame.evaluate(() => document.getElementById('backBtn').click());
    await b.frame.evaluate(() => document.getElementById('backBtn').click());
    await relay();
    await a.frame.evaluate(() => memeIdDuel.publish(true));
    await b.frame.evaluate(() => memeIdDuel.publish(true));
    await a.frame.evaluate(() => siteRank.show());
    await a.frame.waitForSelector('#rankRows [data-challenge-uid="BobID"]');
    await a.frame.evaluate(() => document.querySelector('#rankRows [data-challenge-uid="BobID"]').click());
    await b.frame.waitForSelector('#idAcceptInvite');
    await b.frame.evaluate(() => document.getElementById('idAcceptInvite').click());
    await relay();
    await pollFrame(b.frame, () => !!memeRoom?.playing, 'guest enters the rematch duel');
    await b.frame.evaluate(() => { duel.turn = 'player'; duel.enemy.lp = 0; checkWin(); });
    await relay();
    await pollFrame(a.frame, () => duel?.finished === true, 'host sees the finished rematch');
    await new Promise(resolve => setTimeout(resolve, 2500));
    const hostAfter = docs.get('rank_profiles/AliceID');
    const guestAfter = docs.get('rank_profiles/BobID');
    console.log('host after rematch', hostAfter);
    console.log('guest after rematch', guestAfter);
    assert.equal(hostAfter.losses, 1, 'host loss must be recorded when the guest wins');
    assert.ok(hostAfter.rating < 1000, 'host must lose Elo');
    assert.equal(guestAfter.wins, 1, 'guest win must be recorded');
    assert.ok(guestAfter.rating > hostAfter.rating, 'guest winner must gain Elo');
    assert.equal([...docs.keys()].filter(key => key.startsWith('rank_challenge_results/')).length, 4, 'each match must write one result per player');
    assert.deepEqual(errors, []);
    console.log('Online duel result recording: 11 checks passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
