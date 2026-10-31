const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'dist'),out=path.join(root,'outputs/quests');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);if(process.env.DEBUG_ERRORS)console.error(e.stack);});
 await page.setViewport({width:1366,height:768});
 await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('rank-promo-dismissed','1');sessionStorage.setItem('rank-promo-dismissed','1');}catch{}});
 await page.goto(base+'/memecard.html');
 await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress&&window.memePacks&&window.memeQuests,{timeout:30000});
 await page.waitForSelector('#questBtn');

 const boot=await page.evaluate(()=>({
  btn:!!$('questBtn'),badgeHidden:$('questBtn').querySelector('.ticket-badge').hidden,
  dailyPeriod:memeProgress.state.quests.daily.period,today:memePacks.dayKey(),
  weekPeriod:memeProgress.state.quests.weekly.period,week:memeQuests.weekKey(),
  claimable:memeQuests.claimableCount()
 }));
 assert.ok(boot.btn,'quest button sits in the HUD');assert.equal(boot.badgeHidden,true);assert.equal(boot.claimable,0);
 assert.equal(boot.dailyPeriod,boot.today,'daily quests start on today');assert.equal(boot.weekPeriod,boot.week,'weekly quests start this week');

 await page.click('#dailyBtn');await page.waitForSelector('.daily-modal');
 await page.click('#dailyClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));
 const afterLogin=await page.evaluate(()=>memeProgress.state.quests.weekly.progress.login);
 assert.equal(afterLogin,1,'daily check-in feeds the weekly login quest');

 await page.evaluate(()=>memePacks.onDuelFinished(true));
 const afterWin=await page.evaluate(()=>({
  duel:memeProgress.state.quests.daily.progress.duel,win:memeProgress.state.quests.daily.progress.win,
  weekWin:memeProgress.state.quests.weekly.progress.win,claimable:memeQuests.claimableCount(),
  badge:$('questBtn').querySelector('.ticket-badge').textContent,badgeHidden:$('questBtn').querySelector('.ticket-badge').hidden
 }));
 assert.equal(afterWin.duel,1);assert.equal(afterWin.win,1);assert.equal(afterWin.weekWin,1);
 assert.equal(afterWin.claimable,1,'a won duel completes the daily win quest');assert.equal(afterWin.badgeHidden,false);assert.equal(afterWin.badge,'1');
 await page.screenshot({path:path.join(out,'hud-1366x768.png')});
 await page.setViewport({width:390,height:844});
 await page.screenshot({path:path.join(out,'hud-390x844.png')});
 await page.setViewport({width:1366,height:768});

 await page.evaluate(()=>memeQuests.open());
 const modal=await page.evaluate(()=>({
  daily:document.querySelectorAll('.quest-section.daily .quest-row').length,
  weekly:document.querySelectorAll('.quest-section.weekly .quest-row').length,
  count:document.querySelector('.quest-count').textContent,
  rows:[...document.querySelectorAll('.quest-row')].map(n=>({text:n.querySelector('b').textContent,small:n.querySelector('.quest-body small').textContent,claim:n.querySelector('.quest-claim').textContent,disabled:n.querySelector('.quest-claim').disabled}))
 }));
 assert.equal(modal.daily,3,'three daily quests');assert.equal(modal.weekly,3,'three weekly quests');
 assert.match(modal.count,/1 sẵn sàng nhận/);
 assert.deepEqual(modal.rows[1],{text:'Thắng 1 trận',small:'1/1',claim:'Nhận',disabled:false});
 assert.equal(modal.rows[0].disabled,true);assert.equal(modal.rows[0].claim,'Chưa xong');
 await page.screenshot({path:path.join(out,'quests-1366x768.png')});

 const claimWin=await page.evaluate(()=>{const before={ticket:memeProgress.state.tickets.p1};document.querySelector('.quest-claim[data-kind="daily"][data-id="win1"]').click();return {before,ticket:memeProgress.state.tickets.p1,claimed:memeProgress.state.quests.daily.claimed.win1,badge:memeQuests.claimableCount(),btn:document.querySelector('.quest-claim[data-kind="daily"][data-id="win1"]')?.textContent};});
 assert.equal(claimWin.ticket,claimWin.before.ticket+1,'claiming the win quest grants a Pack I ticket');
 assert.equal(claimWin.claimed,true);assert.equal(claimWin.badge,0);assert.equal(claimWin.btn,'Đã nhận');
 const doubleClaim=await page.evaluate(()=>memeQuests.claim('daily','win1'));
 assert.equal(doubleClaim.ok,false,'a claimed quest cannot be claimed twice');
 await page.click('#questClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));

 await page.evaluate(()=>{memePacks.onDuelFinished(false);memePacks.onDuelFinished(true);});
 const duelQuest=await page.evaluate(()=>{
  const before=memeProgress.state.xu;
  const result=memeQuests.claim('daily','duel3');
  return {result:result.ok,before,xu:memeProgress.state.xu,progress:memeProgress.state.quests.daily.progress.duel};
 });
 assert.equal(duelQuest.progress,3);assert.equal(duelQuest.result,true);assert.equal(duelQuest.xu-duelQuest.before,150,'duel quest pays 150 Xu');

 await page.evaluate(()=>memePacks.setRandom(()=>0));
 const packOpen=await page.evaluate(()=>{const before={dust:memeProgress.state.dust,ticket:memeProgress.state.tickets.p1};const result=memePacks.open('p1');return {ok:result.ok,before,dust:memeProgress.state.dust,ticket:memeProgress.state.tickets.p1,pack:memeProgress.state.quests.daily.progress.pack,weekPack:memeProgress.state.quests.weekly.progress.pack};});
 assert.equal(packOpen.ok,true);assert.equal(packOpen.ticket,packOpen.before.ticket-1,'pack uses the quest ticket');
 assert.equal(packOpen.pack,1);assert.equal(packOpen.weekPack,1);
 const packClaim=await page.evaluate(()=>{const before=memeProgress.state.dust;const result=memeQuests.claim('daily','pack1');return {ok:result.ok,before,dust:memeProgress.state.dust};});
 assert.equal(packClaim.ok,true);assert.equal(packClaim.dust-packClaim.before,60,'pack quest pays 60 dust');

 await page.evaluate(()=>memeQuests.open());
 const weekly=await page.evaluate(()=>({
  rows:[...document.querySelectorAll('.quest-section.weekly .quest-row')].map(n=>({small:n.querySelector('.quest-body small').textContent,disabled:n.querySelector('.quest-claim').disabled}))
 }));
 assert.equal(weekly.rows[0].small,'2/5');assert.equal(weekly.rows[1].small,'1/10');assert.equal(weekly.rows[2].small,'1/3');
 assert.equal(weekly.rows[0].disabled,true,'weekly win quest still locked at 2/5');
 const weeklyGate=await page.evaluate(()=>memeQuests.claim('weekly','win5'));
 assert.equal(weeklyGate.ok,false,'incomplete weekly quest cannot be claimed');
 await page.click('#questClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));

 await page.evaluate(()=>{memePacks.onDuelFinished(true);memePacks.onDuelFinished(true);memePacks.onDuelFinished(true);});
 const weeklyWin=await page.evaluate(()=>{
  const before={xu:memeProgress.state.xu,p2:memeProgress.state.tickets.p2,claimable:memeQuests.claimableCount()};
  const result=memeQuests.claim('weekly','win5');
  return {ok:result.ok,before,xu:memeProgress.state.xu,p2:memeProgress.state.tickets.p2,progress:memeProgress.state.quests.weekly.progress.win};
 });
 assert.equal(weeklyWin.progress,5);assert.equal(weeklyWin.ok,true);
 assert.equal(weeklyWin.xu-weeklyWin.before.xu,500,'weekly win quest pays 500 Xu');
 assert.equal(weeklyWin.p2-weeklyWin.before.p2,1,'weekly win quest grants a Pack II ticket');

 await page.reload();await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress&&window.memePacks&&window.memeQuests);
 const persisted=await page.evaluate(()=>({
  daily:{progress:{...memeProgress.state.quests.daily.progress},claimed:{...memeProgress.state.quests.daily.claimed}},
  weekly:{progress:{...memeProgress.state.quests.weekly.progress},claimed:{...memeProgress.state.quests.weekly.claimed}},
  badge:memeQuests.claimableCount()
 }));
 assert.equal(persisted.daily.claimed.win1,true);assert.equal(persisted.daily.claimed.duel3,true);assert.equal(persisted.daily.claimed.pack1,true);
 assert.equal(persisted.weekly.claimed.win5,true);assert.equal(persisted.weekly.progress.win,5);assert.equal(persisted.badge,0);

 await page.setViewport({width:390,height:844});
 await page.evaluate(()=>memeQuests.open());
 const mobile=await page.evaluate(()=>{const c=document.querySelector('#modal .modal-card');return {scrollable:c.scrollHeight>c.clientHeight+1,overflow:getComputedStyle(c).overflowY,width:c.getBoundingClientRect().width};});
 assert.equal(mobile.overflow,'auto');assert.ok(mobile.width<=390,'quest modal fits the mobile viewport');
 await page.screenshot({path:path.join(out,'quests-390x844.png')});
 await page.click('#questClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));
 await page.setViewport({width:1366,height:768});

 const beforeResetWeek=await page.evaluate(()=>memeQuests.weekKey());
 await page.evaluate(()=>{const q=memeProgress.state.quests.daily;q.period='2000-01-01';q.progress.duel=3;q.progress.pack=1;q.claimed.win1=true;memeProgress.save();});
 await page.reload();await page.waitForFunction(()=>window.memeProgress&&window.memeQuests);
 const dailyReset=await page.evaluate(()=>({period:memeProgress.state.quests.daily.period,today:memePacks.dayKey(),progress:memeProgress.state.quests.daily.progress,claimed:memeProgress.state.quests.daily.claimed,weeklyPeriod:memeProgress.state.quests.weekly.period,weeklyClaimed:{...memeProgress.state.quests.weekly.claimed}}));
 assert.equal(dailyReset.period,dailyReset.today,'daily quests roll over to the new day');
 assert.deepEqual(dailyReset.progress,{});assert.deepEqual(dailyReset.claimed,{});
 assert.equal(dailyReset.weeklyPeriod,beforeResetWeek,'weekly period survives a daily rollover');
 assert.equal(dailyReset.weeklyClaimed.win5,true,'weekly claims survive a daily rollover');

 await page.evaluate(()=>{const q=memeProgress.state.quests.weekly;q.period='2000-01-03';q.progress.win=5;q.progress.pack=10;q.progress.login=3;q.claimed.win5=true;memeProgress.save();});
 await page.reload();await page.waitForFunction(()=>window.memeProgress&&window.memeQuests);
 const weeklyReset=await page.evaluate(()=>({period:memeProgress.state.quests.weekly.period,week:memeQuests.weekKey(),progress:memeProgress.state.quests.weekly.progress,claimed:memeProgress.state.quests.weekly.claimed,dailyPeriod:memeProgress.state.quests.daily.period,today:memePacks.dayKey()}));
 assert.equal(weeklyReset.period,weeklyReset.week,'weekly quests roll over to the new week');
 assert.deepEqual(weeklyReset.progress,{});assert.deepEqual(weeklyReset.claimed,{});
 assert.equal(weeklyReset.dailyPeriod,weeklyReset.today,'weekly rollover keeps the daily period');

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log('P2: quest HUD badge, 3 daily + 3 weekly quests, duel/pack/login tracking, claim gates and rewards, persistence, daily and weekly rollover, mobile modal, no page errors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
