const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');

const publicDir = path.resolve('outputs/rank-challenge/public');
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
  try {
    const page = await browser.newPage();
    await page.exposeFunction('writeDb', async (key, data, merge) => {
      documents.set(key, merge ? { ...documents.get(key), ...data } : data);
    });
    await page.exposeFunction('readDb', async key => documents.get(key) || null);
    await page.goto(`http://127.0.0.1:${server.address().port}/fixture`);
    await page.evaluate(origin => {
      class ServerTimestamp { toMillis() { return Date.now(); } }
      window.pageTimestampResults = { ServerTimestamp, directory: false, player: false, directoryWrites: 0, playerWrites: 0 };
      const resolve = data => Object.fromEntries(Object.entries(data).map(([field, value]) => [field, value instanceof ServerTimestamp ? Date.now() : value]));
      const doc = key => ({
        get: async () => { const data = await readDb(key); return { exists: !!data, data: () => data }; },
        set: (data, options) => {
          if (key.startsWith('duel_directory/')) { window.pageTimestampResults.directory = data.lastSeen instanceof ServerTimestamp && data.updatedAt instanceof ServerTimestamp; window.pageTimestampResults.directoryWrites += 1; }
          if (key.startsWith('duel_players/')) { window.pageTimestampResults.player = data.lastSeen instanceof ServerTimestamp; window.pageTimestampResults.playerWrites += 1; }
          return writeDb(key, resolve(data), !!options?.merge);
        },
        update: data => writeDb(key, resolve(data), true)
      });
      const db = { doc };
      const user = { uid: 'TimestampTester', displayName: 'Kiểm tra dấu thời gian', metadata: { creationTime: new Date(Date.now() - 8 * 86400000).toISOString() } };
      window.siteIdentity = { user, ready: true, db, whenReady: Promise.resolve(), subscribe(callback) { callback({ user, ready: true }); return () => {}; } };
      const firestore = () => db;
      firestore.FieldValue = { serverTimestamp: () => new ServerTimestamp() };
      window.firebase = { firestore };
      const frame = document.createElement('iframe');
      frame.src = origin + '/memecard.html';
      frame.style = 'position:fixed;inset:0;width:100%;height:100%;border:0';
      document.getElementById('host').appendChild(frame);
    }, `http://127.0.0.1:${server.address().port}`);
    await page.waitForFunction(() => document.querySelector('iframe')?.contentWindow.memeIdDuel, { timeout: 30000 });
    const frame = page.frames().find(candidate => candidate.parentFrame());
    await frame.evaluate(() => memeIdDuel.publish(true));
    const result = await page.evaluate(() => ({ directory: pageTimestampResults.directory, player: pageTimestampResults.player }));
    assert.deepEqual(result, { directory: true, player: true }, JSON.stringify(result));
    const before = await page.evaluate(() => ({ directoryWrites: pageTimestampResults.directoryWrites, playerWrites: pageTimestampResults.playerWrites }));
    documents.delete('duel_directory/TimestampTester');
    documents.delete('duel_players/TimestampTester');
    await frame.evaluate(() => memeIdDuel.publish(true));
    const after = await page.evaluate(() => ({ directoryWrites: pageTimestampResults.directoryWrites, playerWrites: pageTimestampResults.playerWrites }));
    assert.ok(after.directoryWrites > before.directoryWrites, 'presence directory was not refreshed on repeat publish: ' + JSON.stringify({ before, after }));
    assert.ok(after.playerWrites > before.playerWrites, 'saved player was not refreshed on repeat publish: ' + JSON.stringify({ before, after }));
    assert.ok(documents.has('duel_directory/TimestampTester'), 'duel_directory document missing after repeat publish');
    assert.ok(documents.has('duel_players/TimestampTester'), 'duel_players document missing after repeat publish');
    fs.writeFileSync('outputs/rank-challenge/timestamp-results.json', JSON.stringify({ status: 'passed', checks: ['directory lastSeen/updatedAt remain serverTimestamp transforms', 'saved player lastSeen remains a serverTimestamp transform', 'repeat publish refreshes the public presence directory so online players stay challengeable'], scope: 'Firestore adapter receives native timestamp sentinels before resolving server values.' }, null, 2));
    console.log('Duel profile Firestore timestamps: 3 checks passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
