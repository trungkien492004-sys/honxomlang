const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict'),puppeteer=require('puppeteer'),pub=path.resolve(process.env.DUEL_PUBLIC_DIR||'.'),out=path.resolve('outputs/match-history');
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://local'),f=path.resolve(pub,'.'+u.pathname);if(!f.startsWith(pub+path.sep))return r.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return r.writeHead(404).end();r.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(b);});});

(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
  try{
    const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.setViewport({width:1366,height:768});
    await p.evaluateOnNewDocument(()=>{window._testAllowed=true;localStorage.setItem('rank-promo-dismissed','1');});
    await p.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
    await p.waitForFunction(()=>window.memeMatchHistory);
    await p.evaluate(()=>memeMusic.setEnabled(false));

    // Empty state on first visit.
    assert.equal(await p.$eval('#lobbyHistory .history-empty',n=>!!n.textContent.trim()),true);
    assert.equal(await p.$eval('#lobbyHistory .history-head span',n=>n.textContent.trim()),'Chưa có trận nào');

    // Seeded entries render newest first with result badges and Elo deltas.
    await p.evaluate(()=>{
      localStorage.setItem('meme-match-history',JSON.stringify([
        {id:'m-new',ts:Date.now()-60000,win:true,rounds:5,heroId:6,enemyHeroId:1,enemyName:'Seto Kaiba',enemyLp:0,rankDelta:18},
        {id:'m-old',ts:Date.now()-7200000,win:false,rounds:3,heroId:8,enemyHeroId:7,enemyName:'Yuma Tsukumo · Máy',enemyLp:2100,rankDelta:-12}
      ]));
      memeMatchHistory.render();
    });
    assert.equal(await p.$$eval('#lobbyHistory .history-row',n=>n.length),2);
    assert.equal(await p.$eval('#lobbyHistory .history-row .history-result',n=>n.textContent.trim()),'THẮNG');
    assert.equal(await p.$eval('#lobbyHistory .history-row .history-main b',n=>n.textContent.trim()),'Mai Valentine vs Seto Kaiba');
    assert.equal(await p.$eval('#lobbyHistory .history-main em.up',n=>n.textContent.trim()),'+18 Elo');
    assert.equal(await p.$eval('#lobbyHistory .history-head span',n=>n.textContent.trim()),'2 trận gần đây');
    await p.screenshot({path:path.join(out,'lobby-history-1366.png')});

    // Full-history modal lists every stored match and can wipe the log.
    await p.click('#historyOpenBtn');
    assert.equal(await p.evaluate(()=>$('modal').classList.contains('hidden')),false);
    assert.equal(await p.$$eval('#modal .history-modal-list .history-row',n=>n.length),2);
    assert.equal(await p.$('#modal .history-confirm'),null);
    assert.equal(await p.$eval('#historyWipeBtn',n=>n.textContent.trim()),'Xoá lịch sử');
    await p.screenshot({path:path.join(out,'history-modal-1366.png')});
    await p.click('#historyCloseBtn');

    // The clear shortcut opens the same list in confirmation mode.
    await p.click('#historyClearBtn');
    assert.equal(await p.$eval('#modal .history-confirm',n=>!!n.textContent.trim()),true);
    assert.equal(await p.$eval('#historyWipeBtn',n=>n.textContent.trim()),'Xoá toàn bộ');
    await p.click('#historyWipeBtn');
    assert.equal(await p.evaluate(()=>localStorage.getItem('meme-match-history')),'[]');
    assert.equal(await p.$eval('#lobbyHistory .history-head span',n=>n.textContent.trim()),'Chưa có trận nào');

    // A finished duel is recorded automatically, including the opponent name.
    await p.evaluate(()=>{
      localStorage.removeItem('meme-match-history');
      memeOpening.create=()=>({face:'heads',first:'player',readyAt:Date.now()-1});
      startGame();
      finish('player','Đối thủ hết LP');
    });
    await p.waitForFunction(()=>JSON.parse(localStorage.getItem('meme-match-history')||'[]').length===1);
    const stored=await p.evaluate(()=>JSON.parse(localStorage.getItem('meme-match-history')));
    assert.equal(stored[0].win,true);
    assert.equal(stored[0].heroId,0);
    assert.equal(stored[0].rounds,1);
    assert.equal(stored[0].reason,'Đối thủ hết LP');
    const shownEnemy=await p.evaluate(()=>$('enemyName').textContent.trim().replace(/\s*·\s*Máy$/,''));
    assert.equal(stored[0].enemyName,shownEnemy);
    assert.ok(stored[0].enemyName.length>0,'opponent name captured');
    assert.equal(typeof stored[0].enemyLp,'number');
    await p.waitForFunction(()=>!$('modal').classList.contains('hidden'),{timeout:5000});
    await p.evaluate(()=>closeModal());

    // Back to the lobby: the recorded row shows up without a reload.
    await p.evaluate(()=>{$('duel').classList.add('hidden');$('lobby').classList.remove('hidden');memeMatchHistory.render();});
    assert.equal(await p.$$eval('#lobbyHistory .history-row',n=>n.length),1);
    assert.equal(await p.$eval('#lobbyHistory .history-row .history-lp',n=>n.textContent.trim()),'Đối thủ còn 4000 LP');

    // Corrupt storage never breaks the lobby.
    await p.evaluate(()=>{localStorage.setItem('meme-match-history','not-json');memeMatchHistory.render();});
    assert.equal(await p.$eval('#lobbyHistory .history-head span',n=>n.textContent.trim()),'Chưa có trận nào');

    assert.deepEqual(errors,[]);
    console.log('Match history: empty state, seeded rows, Elo delta, modal list, auto-record on finish, corrupt storage tolerated; no page errors.');
  }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
