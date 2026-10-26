const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const docs = new Map([
  ['duel_directory/alice', { uid: 'alice', name: 'Alice', online: true, lastSeen: Date.now() }],
  ['duel_directory/bob', { uid: 'bob', name: 'Bob', online: false, lastSeen: Date.now() }],
  ['rank_profiles/alice', { uid: 'alice', name: 'Alice', rating: 1000, wins: 5, losses: 2, draws: 1, played: 8, newbieUntil: Date.now() + 86400000 }],
  ['rank_profiles/bob', { uid: 'bob', name: 'Bob', rating: 1200, wins: 7, losses: 4, draws: 0, played: 11, newbieUntil: Date.now() - 86400000 }],
  ['rank_stats/global', { matchesCompleted: 19 }]
]);
const pages = new Set();
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/') {
    const uid = url.searchParams.get('uid') || 'alice';
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/css/site_rank.css"><main id="lobby"><header class="topbar"></header><footer class="lobby-footer"></footer></main><script>
      const uid=${JSON.stringify(uid)}, listeners=[];
      const snap=(exists,data)=>({exists,data:()=>data});
      window.deliverDb=all=>{window.testDocs=all;for(const sub of listeners){if(sub.path){const value=all[sub.path];sub.callback(snap(!!value,value));continue;}const rows=Object.entries(all).filter(([key,value])=>key.startsWith(sub.collection+'/')&&sub.filters.every(f=>f.op==='array-contains'?value[f.field]?.includes(f.value):value[f.field]===f.value)).map(([key,data])=>({id:key.slice(sub.collection.length+1),data:()=>data}));sub.callback({docs:rows});}};
      const doc=path=>({path,get:async()=>{const data=window.testDocs[path];if(path.startsWith('rank_friend_requests/')&&!data)throw Error('Missing or insufficient permissions.');return snap(!!data,data)},set:async data=>writeDb(path,data,false,uid),update:async data=>writeDb(path,data,true,uid),onSnapshot(callback){const s={path,callback};listeners.push(s);callback(snap(!!window.testDocs[path],window.testDocs[path]));return()=>listeners.splice(listeners.indexOf(s),1);}});
      const query=(collection,filters=[])=>({collection,filters,where(field,op,value){return query(collection,[...filters,{field,op,value}]);},orderBy(){return this;},limit(){return this;},async get(){const rows=await listDb(collection);return {docs:rows.filter(row=>filters.every(f=>f.op==='array-contains'?row.data[f.field]?.includes(f.value):row.data[f.field]===f.value)).map(row=>({id:row.id,data:()=>row.data}))};},onSnapshot(callback){const s={collection,filters,callback};listeners.push(s);window.deliverDb(window.testDocs);return()=>listeners.splice(listeners.indexOf(s),1);}});
      const db={doc,collection:query,async runTransaction(fn){const writes=[],result=await fn({get:ref=>ref.get(),set:(ref,data)=>writes.push([ref.path,data,false]),update:(ref,data)=>writes.push([ref.path,data,true])});for(const [path,data,merge] of writes)await writeDb(path,data,merge,uid);return result;}};
      window.testDocs={};window.siteIdentity={user:{uid,displayName:uid,metadata:{creationTime:new Date(Date.now()-86400000).toISOString()},getIdToken:async()=>''},newbie:uid==='alice',db,whenReady:Promise.resolve(),subscribe(fn){fn({user:this.user,ready:true});return()=>{};},login:async()=>{}};
      window.SITE_RANK_CONFIG={enabled:false,endpoint:'/unused'};window.memeIdDuel={challenge:async target=>recordChallenge(uid,target)};window.fetch=async url=>String(url).includes('runAggregationQuery')?{ok:true,json:async()=>[{result:{aggregateFields:{total:{integerValue:'2'}}}}]}:{ok:false,json:async()=>({})};
    </script><script src="/assets/js/site_rank_players.js"></script><script src="/assets/js/site_rank.js"></script>`);
    return;
  }
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, data) => { if (error) return response.writeHead(404).end(); response.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : 'text/javascript'); response.end(data); });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
    const checks = [], errors = [], challenges = [];
  try {
    async function makePlayer(uid) {
      const page = await browser.newPage(); pages.add(page);
      await page.exposeFunction('listDb', async collection => [...docs].filter(([key]) => key.startsWith(collection + '/')).map(([key, data]) => ({ id: key.slice(collection.length + 1), data })));
      await page.exposeFunction('readDb', async path => docs.get(path) || null);
      await page.exposeFunction('writeDb', async (path, data, merge, source) => {
        docs.set(path, merge ? { ...docs.get(path), ...data } : data);
        for (const peer of pages) if (peer !== page) await peer.evaluate(all => window.deliverDb?.(all), Object.fromEntries(docs));
      });
      await page.exposeFunction('recordChallenge', async (from, to) => { challenges.push([from, to]); return true; });
      await page.evaluateOnNewDocument(all => { window.testDocs = all; }, Object.fromEntries(docs));
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/?uid=${uid}`, { waitUntil: 'load' });
      await page.evaluate(all => { window.testDocs = all; }, Object.fromEntries(docs));
      return page;
    }
    const alice = await makePlayer('alice'), bob = await makePlayer('bob');
    await alice.evaluate(() => siteRank.show());
    await new Promise(resolve => setTimeout(resolve, 500));
    await alice.waitForSelector('#rankRows tr', { timeout: 5000 });
    await alice.waitForFunction(() => document.querySelectorAll('#rankRows tr').length === 2, { timeout: 5000 });
    assert.ok(await alice.$eval('#rankRows', node => node.textContent.includes('5') && node.textContent.includes('2') && node.textContent.includes('1')));
    assert.ok(await alice.$eval('#rankProgress', node => node.textContent.includes('1000 Elo') && node.textContent.includes('NEWBIE')));
    checks.push('RANK shows live W/L/D totals, newbie status, current tier and Elo gap');

    await alice.evaluate(() => document.querySelector('[data-player-uid="bob"]').click());
    await alice.evaluate(() => document.querySelector('#rankFriendAction').click());
    await new Promise(resolve => setTimeout(resolve, 200));
    assert.equal(docs.get('rank_friend_requests/alice_bob').status, 'pending');
    checks.push('player can send a friend request from the RANK list');

    await bob.evaluate(() => siteRank.show());
    await bob.waitForFunction(() => document.querySelector('[data-accept-uid="alice"]'));
    await bob.evaluate(() => document.querySelector('[data-accept-uid="alice"]').click());
    await bob.waitForFunction(() => document.querySelector('[data-challenge-uid="alice"]'));
    assert.equal(docs.get('rank_friend_requests/alice_bob').status, 'accepted');
    assert.deepEqual(docs.get('rank_friendships/alice__bob').uids, ['alice', 'bob']);
    checks.push('recipient accepts the request and creates a shared friendship');

    await alice.waitForFunction(() => document.querySelector('[data-challenge-uid="bob"]'));
    assert.ok(await alice.$eval('[data-challenge-uid="bob"]', node => node.textContent.includes('∞')));
    await alice.evaluate(() => document.querySelector('[data-challenge-uid="bob"]').click());
    await new Promise(resolve => setTimeout(resolve, 200));
    assert.deepEqual(challenges.at(-1), ['alice', 'bob']);
    checks.push('friend list offers an unlimited challenge and dispatches the selected opponent');

    await alice.evaluate(() => siteRank.show());
    await alice.evaluate(() => document.querySelector('#rankQuickMatch').click());
    await alice.waitForSelector('.rank-status');
    assert.equal(await alice.evaluate(() => SITE_RANK_CONFIG.enabled), false);
    checks.push('quick rank entry explains honestly that secure matchmaking is not activated yet');
    assert.deepEqual(errors, []);
    const report = JSON.stringify({ status: 'passed', scope: 'Local browser test using controlled Firebase Auth and Firestore adapters.', checks }, null, 2);
    fs.mkdirSync(path.join(root, 'outputs/rank-social'), { recursive: true });
    fs.writeFileSync(path.join(root, 'outputs/rank-social/ui-results.json'), report);
    fs.mkdirSync(path.join(root, 'outputs/rank-social-deploy'), { recursive: true });
    fs.writeFileSync(path.join(root, 'outputs/rank-social-deploy/ui-results.json'), report);
    console.log('Rank/social UI:', checks.length, 'checks passed.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
