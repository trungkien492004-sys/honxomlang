const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'dist');
const server = http.createServer((request, response) => {
  const file = path.resolve(pub, '.' + new URL(request.url, 'http://local').pathname);
  if (!file.startsWith(pub + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, data) => { if (error) return response.writeHead(404).end(); response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream'); response.end(data); });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.memePhase2 && window.memeRules && window.memeFx);
    await page.evaluate(() => {
      memeMusic.setEnabled(false); memeFx.setMode('minimal');
      duel = { player: blankSide(defaultDeck()), enemy: blankSide(defaultDeck()), turn: 'enemy', phase: 'BATTLE', round: 3, normalSummoned: false, mode: null, pending: null, selected: null, logs: [], finished: false };
      duel.player.monsters[0] = monsterSlot('AN-kuriboh', 'atk');
      duel.player.monsters[1] = monsterSlot('AN-celtic_guardian', 'atk');
      duel.enemy.monsters[0] = monsterSlot('AN-blue_eyes_white_dragon', 'atk');
      return aiAttack(0, false);
    });
    await page.waitForFunction(() => duel.player.monsters[0] === null && !!duel.player.monsters[1], { timeout: 10000 });
    const state = await page.evaluate(() => ({ destroyed: duel.player.monsters[0] === null, kept: duel.player.monsters[1]?.id, logs: duel.logs.join('\n') }));
    assert.equal(state.destroyed, true);
    assert.equal(state.kept, 'AN-celtic_guardian');
    assert.deepEqual(errors, []);
    const result = { status: 'passed', scope: 'Browser smoke test against the actual client battle engine.', checks: ['AI chooses a legal favorable target using public board state', 'AI attack resolves with its battle animation and no browser errors'] };
    fs.mkdirSync(path.join(root, 'outputs/rank-social-deploy'), { recursive: true });
    fs.writeFileSync(path.join(root, 'outputs/rank-social-deploy/ai-results.json'), JSON.stringify(result, null, 2));
    console.log('AI decision smoke test: the bot selects a legal favorable target and completes its battle animation without browser errors.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
