const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'dist'),out=path.join(root,'outputs/journey');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);if(process.env.DEBUG_ERRORS)console.error(e.stack);});
 const boot=async()=>{await page.goto(base+'/memecard.html');await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress&&window.memePacks&&window.memeQuests&&window.memeJourney,{timeout:30000});await page.waitForSelector('#journeyBtn');};
 await page.setViewport({width:1366,height:768});
 await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('rank-promo-dismissed','1');sessionStorage.setItem('rank-promo-dismissed','1');}catch{}});
 await boot();

 const initial=await page.evaluate(()=>({btn:!!$('journeyBtn'),chapters:memeJourney.CHAPTERS.length,floor:memeProgress.state.tower.floor||1,cleared:Object.keys(memeProgress.state.tower.cleared||{}).length,stake:{...memeJourney.storyState().stake}}));
 assert.ok(initial.btn,'journey button sits in the HUD');assert.equal(initial.chapters,6);assert.equal(initial.floor,1);assert.equal(initial.cleared,0);
 assert.deepEqual(initial.stake,{wins:0,losses:0});

 await page.evaluate(()=>document.getElementById('journeyBtn').click());await page.waitForSelector('.journey-modal');
 const story=await page.evaluate(()=>({
  tabs:[...document.querySelectorAll('.journey-tabs button')].map(n=>n.textContent),
  rows:document.querySelectorAll('.journey-row').length,
  statuses:[...document.querySelectorAll('.journey-status')].map(n=>n.textContent),
  buttons:[...document.querySelectorAll('.journey-start')].map(n=>({text:n.textContent,disabled:n.disabled})),
  rewards:document.querySelector('.journey-rewards').textContent
 }));
 assert.deepEqual(story.tabs,['📖 Chặng truyện','🗼 Tháp 10 tầng','🎯 Truy nã','🎲 Đấu cược']);
 assert.equal(story.rows,6,'six story chapters');
 assert.equal(story.statuses[0],'⚔️ Sẵn sàng');assert.match(story.statuses[1],/Khóa/);assert.equal(story.buttons[1].disabled,true);
 assert.match(story.rewards,/\+300 Xu/);
 const hudBadge=await page.evaluate(()=>{const b=$('journeyBtn').querySelector('.ticket-badge');return {text:b?.textContent,hidden:b?.hidden};});
 assert.ok(Number(hudBadge.text)>=1,'journey badge counts open activities');assert.equal(hudBadge.hidden,false);
 await page.screenshot({path:path.join(out,'journey-story-1366x768.png')});

 await page.click('[data-tab="tower"]');
 const tower=await page.evaluate(()=>({cells:document.querySelectorAll('.tower-cell').length,current:document.querySelector('.tower-cell.current')?.textContent,head:document.querySelector('.tower-head b').textContent,reward:document.querySelector('.tower-floor .journey-rewards').textContent}));
 assert.equal(tower.cells,10,'ten tower floors');assert.match(tower.current,/1/);assert.match(tower.head,/Tầng 1\/10/);assert.match(tower.reward,/\+100 Xu/);
 await page.screenshot({path:path.join(out,'journey-tower-1366x768.png')});

 await page.click('[data-tab="stake"]');
 const stake=await page.evaluate(()=>({cards:document.querySelectorAll('.stake-card').length,disabled:[...document.querySelectorAll('.stake-card')].map(n=>n.disabled)}));
 assert.equal(stake.cards,3);assert.deepEqual(stake.disabled,[true,true,true],'stake needs Xu');
 await page.screenshot({path:path.join(out,'journey-stake-1366x768.png')});

 await page.click('[data-tab="bounty"]');
 const bountyView=await page.evaluate(()=>({name:document.querySelector('.bounty-body b')?.textContent||'',preset:document.querySelector('.bounty-preset')?.textContent||'',state:document.querySelector('.bounty-state')?.textContent||'',reward:document.querySelector('.bounty-card .journey-rewards')?.textContent||'',disabled:$('bountyStart')?.disabled}));
 assert.ok(bountyView.name,'the daily bounty names its target');assert.match(bountyView.preset,/Đối thủ:/);assert.match(bountyView.state,/Còn/);assert.ok(bountyView.reward.length>0);assert.equal(bountyView.disabled,false);
 await page.screenshot({path:path.join(out,'journey-bounty-1366x768.png')});
 await page.click('#journeyClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));

 await page.evaluate(()=>document.getElementById('journeyBtn').click());await page.waitForSelector('.journey-modal');
 await page.click('[data-tab="story"]');
 await page.click('[data-story="c1"]');
 const started=await page.evaluate(()=>({duel:!$('duel').classList.contains('hidden'),lobby:$('lobby').classList.contains('hidden'),pending:memeJourney.pending}));
 assert.equal(started.duel,true,'story chapter starts a duel');assert.equal(started.lobby,true);assert.deepEqual(started.pending,{kind:'story',id:'c1'});
 const storyWin=await page.evaluate(()=>{const before=memeProgress.state.xu;const result=memeJourney.onDuelFinished(true);return {before,xu:memeProgress.state.xu,result,cleared:memeJourney.chapterCleared('c1'),unlocked:memeJourney.chapterUnlocked(1),pending:memeJourney.pending};});
 assert.match(storyWin.result.title,/Chặng 1 hoàn thành/);assert.equal(storyWin.xu-storyWin.before,300,'first story clear pays 300 Xu');
 assert.equal(storyWin.cleared,true);assert.equal(storyWin.unlocked,true);assert.equal(storyWin.pending,null);
 await boot();
 const afterStory=await page.evaluate(()=>({c1:memeJourney.chapterCleared('c1'),c2:memeJourney.chapterUnlocked(1),c3:memeJourney.chapterUnlocked(2),xu:memeProgress.state.xu}));
 assert.equal(afterStory.c1,true);assert.equal(afterStory.c2,true);assert.equal(afterStory.c3,false);
 assert.equal(afterStory.xu,300,'story rewards persist');

 await page.evaluate(()=>memeJourney.startStory('c2'));
 const storyLoss=await page.evaluate(()=>{const result=memeJourney.onDuelFinished(false);return {result,cleared:memeJourney.chapterCleared('c2'),c3:memeJourney.chapterUnlocked(2),xu:memeProgress.state.xu};});
 assert.equal(storyLoss.cleared,false,'a loss does not clear the chapter');assert.equal(storyLoss.c3,false);assert.equal(storyLoss.xu,300);
 await boot();
 const lockedLaunch=await page.evaluate(()=>{const started=memeJourney.startStory('c3');return {started,pending:memeJourney.pending,duel:$('duel').classList.contains('hidden')};});
 assert.equal(lockedLaunch.started,false,'locked chapter cannot launch');assert.equal(lockedLaunch.pending,null);assert.equal(lockedLaunch.duel,true);

 await page.evaluate(()=>memeJourney.startTower());
 const towerWin=await page.evaluate(()=>{const before=memeProgress.state.xu;const result=memeJourney.onDuelFinished(true);return {before,xu:memeProgress.state.xu,result,floor:memeJourney.towerState().floor,cleared:memeJourney.towerState().cleared[1]};});
 assert.match(towerWin.result.title,/Vượt tầng 1/);assert.equal(towerWin.xu-towerWin.before,100);assert.equal(towerWin.floor,2);assert.equal(towerWin.cleared,true);
 await page.evaluate(()=>memeJourney.startTower());
 const towerLoss=await page.evaluate(()=>{const result=memeJourney.onDuelFinished(false);return {result,floor:memeJourney.towerState().floor,cleared2:memeJourney.towerState().cleared[2]};});
 assert.equal(towerLoss.floor,2,'a tower loss keeps the floor');assert.equal(towerLoss.cleared2,undefined);
 await boot();
 const towerPersist=await page.evaluate(()=>({floor:memeJourney.towerState().floor,cleared:Object.keys(memeJourney.towerState().cleared).length,xu:memeProgress.state.xu}));
 assert.equal(towerPersist.floor,2);assert.equal(towerPersist.cleared,1);assert.equal(towerPersist.xu,400);

 await page.evaluate(()=>memeProgress.addXu(1000));
 await page.evaluate(()=>document.getElementById('journeyBtn').click());await page.waitForSelector('.journey-modal');
 await page.click('[data-tab="stake"]');
 const stakeReady=await page.evaluate(()=>[...document.querySelectorAll('.stake-card')].map(n=>n.disabled));
 assert.deepEqual(stakeReady,[false,false,false]);
 await page.click('[data-stake="300"]');
 const stakeStarted=await page.evaluate(()=>({duel:!$('duel').classList.contains('hidden'),xu:memeProgress.state.xu,pending:memeJourney.pending}));
 assert.equal(stakeStarted.duel,true);assert.equal(stakeStarted.xu,1100,'stake is deducted up front');assert.deepEqual(stakeStarted.pending,{kind:'stake',stake:300});
 const stakeWin=await page.evaluate(()=>{const before=memeProgress.state.xu;const result=memeJourney.onDuelFinished(true);return {before,xu:memeProgress.state.xu,result,stats:{...memeJourney.storyState().stake}};});
 assert.equal(stakeWin.xu-stakeWin.before,600,'a stake win returns double the stake');assert.equal(stakeWin.stats.wins,1);assert.match(stakeWin.result.title,/Thắng cược/);
 const stakeLoss=await page.evaluate(()=>{const result=memeJourney.startStake(100);const before=memeProgress.state.xu;memeJourney.onDuelFinished(false);return {result,before,xu:memeProgress.state.xu,stats:{...memeJourney.storyState().stake}};});
 assert.equal(stakeLoss.result.ok,true);assert.equal(stakeLoss.xu,stakeLoss.before,'a stake loss keeps the deducted amount');assert.equal(stakeLoss.stats.losses,1);
 const tooPoor=await page.evaluate(()=>{memeProgress.spendXu(memeProgress.state.xu-50);const result=memeJourney.startStake(100);return {result,xu:memeProgress.state.xu,pending:memeJourney.pending};});
 assert.equal(tooPoor.result.ok,false);assert.equal(tooPoor.pending,null);assert.equal(tooPoor.xu,50);
 await page.evaluate(()=>memeProgress.addXu(2000));
 await boot();
 const stakePersist=await page.evaluate(()=>({stats:{...memeJourney.storyState().stake},xu:memeProgress.state.xu}));
 assert.deepEqual(stakePersist.stats,{wins:1,losses:1});

 await page.evaluate(()=>{const t=memeJourney.towerState();t.floor=10;for(let i=1;i<=9;i++)t.cleared[i]=true;memeProgress.save();});
 await page.evaluate(()=>memeJourney.startTower());
 const towerTop=await page.evaluate(()=>{const before={xu:memeProgress.state.xu,p3:memeProgress.state.tickets.p3};const result=memeJourney.onDuelFinished(true);return {before,xu:memeProgress.state.xu,p3:memeProgress.state.tickets.p3,result,floor:memeJourney.towerState().floor};});
 assert.match(towerTop.result.title,/Chinh phục Tháp/);assert.equal(towerTop.xu-towerTop.before.xu,600);assert.equal(towerTop.p3-towerTop.before.p3,1);assert.equal(towerTop.floor,10);
 await page.evaluate(()=>memeJourney.startTower());
 const towerReplay=await page.evaluate(()=>{const before={xu:memeProgress.state.xu,p3:memeProgress.state.tickets.p3};const result=memeJourney.onDuelFinished(true);return {before,xu:memeProgress.state.xu,p3:memeProgress.state.tickets.p3,result};});
 assert.equal(towerReplay.xu,towerReplay.before.xu,'tower replay pays no reward');assert.equal(towerReplay.p3,towerReplay.before.p3);assert.match(towerReplay.result.title,/Thắng lại tầng 10/);

 await boot();
 await page.evaluate(()=>{window.memeShowMatchResult(true,'Thắng thử',{reward:null,journey:{title:'📖 Chặng 1 hoàn thành!',lines:['🪙 +300 Xu']},journeyArgs:{kind:'story',id:'c1'}});});
 const resultModal=await page.evaluate(()=>({journey:document.querySelector('.match-journey')?.textContent||'',again:!!$('againBtn')}));
 assert.match(resultModal.journey,/Chặng 1 hoàn thành/);assert.match(resultModal.journey,/\+300 Xu/);assert.equal(resultModal.again,true);
 await page.click('#againBtn');
 const relaunched=await page.evaluate(()=>({duel:!$('duel').classList.contains('hidden'),pending:memeJourney.pending}));
 assert.equal(relaunched.duel,true,'Đấu lại relaunches the journey mode');assert.deepEqual(relaunched.pending,{kind:'story',id:'c1'});
 await boot();

 const bountyStart=await page.evaluate(()=>{const started=memeJourney.startBounty();return {started,pending:memeJourney.pending,duel:!$('duel').classList.contains('hidden'),today:memePacks.dayKey()};});
 assert.equal(bountyStart.started,true,'the daily bounty launches an unclaimed target');assert.equal(bountyStart.pending.kind,'bounty');assert.equal(bountyStart.pending.day,bountyStart.today);assert.equal(bountyStart.duel,true);
 const bountyWin=await page.evaluate(()=>{const pick=()=>{const s=memeProgress.state;return {xu:s.xu,dust:s.dust,t:{...s.tickets}};};const before=pick();const result=memeJourney.onDuelFinished(true);const st=memeJourney.bountyState();return {before,after:pick(),result,done:st.done,day:st.day,today:memePacks.dayKey()};});
 assert.match(bountyWin.result.title,/Truy nã hoàn thành/);assert.equal(bountyWin.done,true,'a bounty win marks today done');assert.equal(bountyWin.day,bountyWin.today);
 const gained=(bountyWin.after.xu-bountyWin.before.xu)+(bountyWin.after.dust-bountyWin.before.dust)+['p1','p2','p3'].reduce((sum,k)=>sum+bountyWin.after.t[k]-bountyWin.before.t[k],0);
 assert.ok(gained>0,'the first bounty win pays its reward');
 const beforeReplay=await page.evaluate(()=>{const s=memeProgress.state;return {xu:s.xu,dust:s.dust,t:{...s.tickets},badge:$('journeyBtn').querySelector('.ticket-badge')?.textContent};});
 const bountyReplay=await page.evaluate(()=>{const started=memeJourney.startBounty();return {started,pending:memeJourney.pending,settle:memeJourney.onDuelFinished(true)};});
 assert.equal(bountyReplay.started,false,'a claimed bounty cannot relaunch today');assert.equal(bountyReplay.pending,null);assert.equal(bountyReplay.settle,null);
 const afterReplay=await page.evaluate(()=>({xu:memeProgress.state.xu,dust:memeProgress.state.dust,t:{...memeProgress.state.tickets}}));
 assert.deepEqual(afterReplay,{xu:beforeReplay.xu,dust:beforeReplay.dust,t:beforeReplay.t},'bounty replay pays nothing');
 assert.ok(Number(beforeReplay.badge)>=0,'journey badge still renders');

 await page.evaluate(()=>{const st=memeJourney.bountyState();st.day='2000-01-01';st.done=true;memeProgress.save();});
 await boot();
 const bountyRollover=await page.evaluate(()=>({done:memeJourney.bountyState().done,day:memeJourney.bountyState().day,today:memePacks.dayKey()}));
 assert.equal(bountyRollover.done,false,'a new day resets the bounty');assert.equal(bountyRollover.day,bountyRollover.today);
 await page.evaluate(()=>memeJourney.startBounty());
 const bountyLoss=await page.evaluate(()=>{const s=memeProgress.state;const before={xu:s.xu,dust:s.dust};const result=memeJourney.onDuelFinished(false);return {before,after:{xu:memeProgress.state.xu,dust:memeProgress.state.dust},result,done:memeJourney.bountyState().done};});
 assert.equal(bountyLoss.result.lost,true);assert.equal(bountyLoss.done,false,'a bounty loss keeps the target open');assert.deepEqual(bountyLoss.after,bountyLoss.before,'a bounty loss costs nothing');
 await boot();

 await page.setViewport({width:390,height:844});
 await page.evaluate(()=>document.getElementById('journeyBtn').click());await page.waitForSelector('.journey-modal');
 const mobile=await page.evaluate(()=>{const c=document.querySelector('#modal .modal-card');return {width:c.getBoundingClientRect().width,overflow:getComputedStyle(c).overflowY};});
 assert.ok(mobile.width<=390);assert.equal(mobile.overflow,'auto');
 await page.screenshot({path:path.join(out,'journey-story-390x844.png')});
 await page.click('[data-tab="bounty"]');
 await page.screenshot({path:path.join(out,'journey-bounty-390x844.png')});
 await page.click('[data-tab="stake"]');
 await page.screenshot({path:path.join(out,'journey-stake-390x844.png')});
 await page.click('#journeyClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log('P3: journey HUD button and badge, six unlockable story chapters with first-clear rewards, ten tower floors with loss/replay rules, daily bounty with reset/replay/loss rules, stake duels with up-front deduction and double payout, practice launch, result modal + rematch, persistence, mobile layout, no page errors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
