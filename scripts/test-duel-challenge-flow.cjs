const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

const publicDir = path.resolve('outputs/rank-challenge/public');
const documents = new Map();
const clients = [];
const events = [];
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
    async function deliver() {
      for (const client of clients) await client.page.evaluate(records => window.deliverDb?.(records), Object.fromEntries(documents));
    }
    async function relay() {
      for (let i = 0; i < 6; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        for (const [sender, message] of events.splice(0)) {
          for (const client of clients) if (client.uid !== sender) await client.frame.evaluate(value => memeOnlineReceive(value), message);
        }
      }
    }

    for (const [uid, name] of [['AliceID', 'Alice'], ['BobID', 'Bob']]) {
      const page = await browser.newPage();
      clients.push({ page, uid });
      await page.exposeFunction('readDb', async key => documents.get(key) || null);
      await page.exposeFunction('writeDb', async (key, data, merge) => {
        documents.set(key, merge ? { ...documents.get(key), ...data } : data);
        setTimeout(() => deliver().catch(() => {}), 0);
      });
      await page.exposeFunction('networkSend', message => events.push([uid, message]));
      await page.goto(`http://127.0.0.1:${server.address().port}/fixture`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(({ uid, name, origin }) => {
        const subscriptions = [];
        class ServerTimestamp { toMillis() { return Date.now(); } }
        window.__timestampChecks = { directory: false, player: false };
        const resolve = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value instanceof ServerTimestamp ? Date.now() : value]));
        const snap = data => ({ exists: !!data, data: () => data });
        const doc = key => ({
          get: async () => snap(await readDb(key)),
          set: (data, options) => {
            if (key.startsWith('duel_directory/')) window.__timestampChecks.directory = data.lastSeen instanceof ServerTimestamp && data.updatedAt instanceof ServerTimestamp;
            if (key.startsWith('duel_players/')) window.__timestampChecks.player = data.lastSeen instanceof ServerTimestamp;
            return writeDb(key, resolve(data), !!options?.merge);
          },
          update: data => writeDb(key, resolve(data), true),
          onSnapshot(callback) { const entry = { key, callback }; subscriptions.push(entry); readDb(key).then(data => callback(snap(data))); return () => subscriptions.splice(subscriptions.indexOf(entry), 1); }
        });
        const db = {
          doc,
          runTransaction: async action => action({ get: ref => ref.get(), update: (ref, data) => ref.update(data), set: (ref, data, options) => ref.set(data, options) }),
          collection: name => ({ where: (field, op, value) => ({ onSnapshot(callback) { const entry = { name, field, value, callback }; subscriptions.push(entry); return () => subscriptions.splice(subscriptions.indexOf(entry), 1); } }) })
        };
        window.deliverDb = records => {
          for (const subscription of subscriptions) {
            if (subscription.key) subscription.callback(snap(records[subscription.key]));
            else subscription.callback({ docs: Object.entries(records).filter(([key, data]) => key.startsWith(subscription.name + '/') && data?.[subscription.field] === subscription.value).map(([key, data]) => ({ id: key.slice(subscription.name.length + 1), ...snap(data) })) });
          }
        };
        const user = { uid, displayName: name, metadata: { creationTime: new Date(Date.now() - 30 * 86400000).toISOString() }, getIdToken: async () => 'fixture-token' };
        window.siteIdentity = { user, ready: true, db, whenReady: Promise.resolve(), subscribe(callback) { callback({ user, ready: true }); return () => {}; } };
        window.currentFirebaseUser = user;
        window.myNetworkId = uid;
        window.player = { name };
        window.pvpChannel = { postMessage: message => networkSend(message) };
        const firestore = () => db;
        firestore.FieldValue = { serverTimestamp: () => new ServerTimestamp() };
        window.firebase = { firestore };
        const frame = document.createElement('iframe');
        frame.src = origin + '/memecard.html';
        frame.style = 'position:fixed;inset:0;width:100%;height:100%;border:0';
        document.getElementById('host').appendChild(frame);
      }, { uid, name, origin: `http://127.0.0.1:${server.address().port}` });
      await page.waitForFunction(() => document.querySelector('iframe')?.contentWindow.memeIdDuel, { timeout: 30000 });
      const client = clients.find(entry => entry.uid === uid);
      client.frame = page.frames().find(frame => frame.parentFrame());
      await client.frame.evaluate(() => { memeMusic.setEnabled(false); memeFx.setMode('minimal'); memeOpening.create = () => ({ face: 'heads', first: 'player', readyAt: Date.now() - 1 }); memeAnime.setAuto(false); });
    }

    await deliver();
    const [alice, bob] = clients;
    await alice.frame.evaluate(() => memeIdDuel.publish(true));
    await bob.frame.evaluate(() => memeIdDuel.publish(true));
    for (const client of clients) {
      const timestamps = await client.page.evaluate(() => window.__timestampChecks);
      assert.deepEqual(timestamps, { directory: true, player: true }, JSON.stringify(timestamps));
    }
    checks.push('Firestore receives native server timestamps for both saved profiles');

    await alice.frame.evaluate(() => memeIdDuel.challenge('BobID'));
    await bob.frame.waitForSelector('#idAcceptInvite');
    await bob.frame.evaluate(() => document.getElementById('idAcceptInvite').click());
    await relay();
    await alice.frame.waitForFunction(() => memeRoom?.playing);
    await bob.frame.waitForFunction(() => memeRoom?.playing);
    checks.push('online challenge creates a valid invitation and starts the duel after acceptance');

    const recorded = await alice.frame.evaluate(async () => {
      duel.finished = true;
      duel.winner = 'player';
      return memeIdDuel.recordResult(duel);
    });
    await alice.frame.evaluate(() => memeIdDuel.recordResult(duel));
    const savedProfile = documents.get('rank_profiles/AliceID');
    assert.equal(recorded.outcome, 'win');
    assert.ok(savedProfile.rating > 1000);
    assert.equal(savedProfile.wins, 1);
    assert.equal(savedProfile.played, 1);
    assert.equal(documents.get('rank_challenge_results/' + recorded.matchId + '_AliceID').outcome, 'win');
    checks.push('challenge victory updates Elo, wins and played once, even when result delivery repeats');



    fs.writeFileSync('outputs/rank-challenge/challenge-flow-results.json', JSON.stringify({ status: 'passed', scope: 'Two browser clients with controlled Google identities, Firestore timestamp transforms, and the online challenge/accept flow.', checks }, null, 2));
    console.log('Duel challenge flow:', checks.length, 'checks passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
