const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'dist'),out=path.join(root,'outputs/packs');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);if(process.env.DEBUG_ERRORS)console.error(e.stack);});
 await page.setViewport({width:1366,height:768});
 await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('rank-promo-dismissed','1');sessionStorage.setItem('rank-promo-dismissed','1');}catch{}});
 await page.goto(base+'/memecard.html');
 await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress&&window.memePacks,{timeout:30000});
 await page.waitForSelector('#progressStrip');

 const hud=await page.evaluate(()=>({
  level:$('progressLevel').textContent,xu:$('progressXu').textContent,dust:$('progressDust').textContent,
  tickets:$('progressTickets').textContent,claimed:$('dailyBtn').classList.contains('claimed'),
  packBtn:!!$('packBtn'),owned:Object.keys(memeProgress.state.owned).length,stateXu:memeProgress.state.xu
 }));
 assert.equal(hud.level,'1');assert.equal(hud.xu,'0');assert.equal(hud.dust,'0');assert.equal(hud.tickets,'0/0/0');
 assert.equal(hud.claimed,false,'daily reward is not claimed on boot');assert.ok(hud.packBtn);assert.equal(hud.stateXu,0,'boot does not auto-grant Xu');
 await page.screenshot({path:path.join(out,'lobby-hud-1366x768.png')});

 await page.click('#dailyBtn');
 await page.waitForSelector('.daily-modal');
 const dailyText=await page.$eval('.daily-modal',n=>n.textContent);
 assert.match(dailyText,/Điểm danh ngày 1/);assert.match(dailyText,/\+100 Xu/);assert.match(dailyText,/Pack Tân Binh/);assert.match(dailyText,/Đồng/);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#modal .modal-card')).opacity==='1');
 await page.screenshot({path:path.join(out,'daily-1366x768.png')});
 await page.click('#dailyClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));
 const afterDaily=await page.evaluate(()=>({xu:memeProgress.state.xu,p1:memeProgress.state.tickets.p1,streak:memeProgress.state.login.streak,lastDay:memeProgress.state.login.lastDay,today:memePacks.dayKey(),hudXu:$('progressXu').textContent,claimed:$('dailyBtn').classList.contains('claimed')}));
 assert.equal(afterDaily.xu,100);assert.equal(afterDaily.p1,1);assert.equal(afterDaily.streak,1);assert.equal(afterDaily.lastDay,afterDaily.today);
 assert.equal(afterDaily.hudXu,'100');assert.equal(afterDaily.claimed,true);

 await page.click('#dailyBtn');await page.waitForSelector('.daily-modal');
 const dailyAgain=await page.$eval('.daily-modal',n=>n.textContent);
 assert.match(dailyAgain,/Hôm nay đã điểm danh/);
 const afterSecond=await page.evaluate(()=>({xu:memeProgress.state.xu,p1:memeProgress.state.tickets.p1}));
 assert.deepEqual(afterSecond,{xu:100,p1:1},'daily reward cannot be claimed twice in a day');
 await page.click('#dailyClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));

 await page.click('#packBtn');
 await page.waitForSelector('.pack-grid .pack-card');
 const shop=await page.evaluate(()=>{
  const cards=[...document.querySelectorAll('.pack-grid .pack-card')];
  return {count:cards.length,p1:{label:cards[0].querySelector('[data-pack]').textContent,disabled:cards[0].querySelector('[data-pack]').disabled},
   p2:{disabled:cards[1].querySelector('[data-pack]').disabled},p3:{disabled:cards[2].querySelector('[data-pack]').disabled},
   modalPack:document.querySelector('#modal .modal-card').classList.contains('pack-modal'),head:document.querySelector('.pack-shop-head').textContent};
 });
 assert.equal(shop.count,3,'exactly three pack types');
 assert.match(shop.p1.label,/Mở bằng vé/);assert.equal(shop.p1.disabled,false,'starter ticket opens Pack I');
 assert.equal(shop.p2.disabled,true,'Pack II is locked without Xu/ticket');assert.equal(shop.p3.disabled,true);
 assert.equal(shop.modalPack,true);assert.match(shop.head,/Sưu tầm/);
 await page.screenshot({path:path.join(out,'shop-1366x768.png')});

 await page.evaluate(()=>memePacks.setRandom(()=>0));
 await page.click('[data-pack="p1"]');
 await page.waitForFunction(()=>document.querySelectorAll('.pack-reveal-grid .reveal-card').length===5);
 const reveal=await page.evaluate(()=>({
  cards:[...document.querySelectorAll('.reveal-card')].map(n=>({rarity:n.className.match(/rarity-(N|R|SR|UR)/)?.[1],text:n.textContent})),
  p1:memeProgress.state.tickets.p1,opens:memeProgress.state.stats.packOpens,pity:memeProgress.state.pity.p1,
  again:$('packAgain').disabled,owned:Object.keys(memeProgress.state.owned).length
 }));
 assert.equal(reveal.cards.length,5);
 assert.equal(reveal.cards.filter(c=>c.rarity==='R').length>=1,true,'Pack I guarantees R or better');
 assert.equal(reveal.cards.filter(c=>c.rarity==='UR').length,0,'deterministic low roll gives no UR');
 assert.equal(reveal.p1,0,'ticket is consumed');assert.equal(reveal.opens,1);assert.equal(reveal.pity,1,'no SR raises the pity counter');
 assert.equal(reveal.again,true,'Mở tiếp is disabled without funds');
 await page.waitForFunction(()=>[...document.querySelectorAll('.reveal-card')].every(n=>getComputedStyle(n).opacity==='1'),{timeout:5000});
 await page.screenshot({path:path.join(out,'reveal-1366x768.png')});
 await page.setViewport({width:390,height:844});
 await page.waitForFunction(()=>[...document.querySelectorAll('.reveal-card')].every(n=>getComputedStyle(n).opacity==='1'),{timeout:5000});
 await page.screenshot({path:path.join(out,'reveal-390x844.png')});
 const mobileReveal=await page.evaluate(()=>{const c=document.querySelector('#modal .modal-card');return {scrollable:c.scrollHeight>c.clientHeight+1,overflow:getComputedStyle(c).overflowY};});
 assert.equal(mobileReveal.overflow,'auto');assert.ok(mobileReveal.scrollable,'reveal modal scrolls on mobile');
 await page.evaluate(()=>{const c=document.querySelector('#modal .modal-card');c.scrollTop=c.scrollHeight;});
 const footReachable=await page.evaluate(()=>{const r=document.querySelector('.pack-open-foot').getBoundingClientRect();return r.bottom<=innerHeight+1&&r.top>=0;});
 assert.ok(footReachable,'reveal footer is reachable on mobile');
 await page.screenshot({path:path.join(out,'reveal-390x844-bottom.png')});
 await page.setViewport({width:1366,height:768});
 await page.click('#packClose');await page.waitForFunction(()=>$('modal').classList.contains('hidden'));

 await page.evaluate(()=>{memeProgress.addXu(20000);memePacks.setRandom(()=>0);});
 const buys=await page.evaluate(()=>{
  const one=(kind)=>{const r=memePacks.open(kind);return r.ok?{ok:true,cards:r.cards,paid:r.paid}:r;};
  const before=memeProgress.state.xu;
  const p2=one('p2'),after2=memeProgress.state.xu;
  const p3=one('p3'),after3=memeProgress.state.xu;
  return {before,p2,p3,after2,after3,xu:memeProgress.state.xu};
 });
 assert.equal(buys.p2.ok,true);assert.equal(buys.before-buys.after2,450,'Pack II costs 450 Xu');
 assert.equal(buys.p2.cards.some(c=>['SR','UR'].includes(c.rarity)),true,'Pack II guarantees SR or better');
 assert.equal(buys.after2-buys.after3,1200,'Pack III costs 1200 Xu');
 assert.equal(buys.p3.cards.some(c=>c.rarity==='UR'),true,'Pack III guarantees a UR');

 const pity=await page.evaluate(()=>{
  memeProgress.state.pity.p1=9;memeProgress.save();
  const p1=memePacks.open('p1');
  const p1Pity=memeProgress.state.pity.p1;
  memeProgress.state.pity.p2=19;memeProgress.save();
  const p2=memePacks.open('p2');
  const p2Pity=memeProgress.state.pity.p2;
  return {p1:p1.cards.map(c=>c.rarity),p1Pity,p2:p2.cards.map(c=>c.rarity),p2Pity};
 });
 assert.equal(pity.p1.includes('SR')||pity.p1.includes('UR'),true,'Pack I pity forces SR at 10 opens');assert.equal(pity.p1Pity,0);
 assert.equal(pity.p2.includes('UR'),true,'Pack II pity forces UR at 20 opens');assert.equal(pity.p2Pity,0);

 const dupes=await page.evaluate(()=>{
  CARDS.filter(c=>c.rarity==='N').forEach(c=>memeProgress.grant(c.id,3));
  memeProgress.state.pity.p1=0;memeProgress.save();
  const dustBefore=memeProgress.state.dust;
  memePacks.setRandom(()=>0);
  const r=memePacks.open('p1');
  return {dustBefore,dustAfter:memeProgress.state.dust,cards:r.cards};
 });
 const nDrops=dupes.cards.filter(c=>c.rarity==='N');
 assert.equal(nDrops.length,4,'deterministic roll gives four N cards');
 assert.equal(nDrops.every(c=>c.dust===5&&c.gained===0),true,'maxed N cards convert to 5 dust');
 assert.equal(dupes.dustAfter-dupes.dustBefore,20,'dust equals four N duplicates');

 const exchange=await page.evaluate(()=>{
  memeProgress.addDust(1000);memePacks.refresh();
  const before={dust:memeProgress.state.dust,p2:memeProgress.state.tickets.p2};
  memePacks.openShop();
  document.querySelector('[data-exchange="p2"]').click();
  return {before,after:{dust:memeProgress.state.dust,p2:memeProgress.state.tickets.p2}};
 });
 assert.equal(exchange.before.dust-exchange.after.dust,600,'dust exchange charges 600');
 assert.equal(exchange.after.p2-exchange.before.p2,1,'dust exchange grants a Pack II ticket');
 await page.click('#packBack').catch(()=>{});
 await page.evaluate(()=>window.closeModal());

 const bands=await page.evaluate(()=>[900,1000,1200,1400,1600,1800,2000].map(r=>{const b=memePacks.rankReward(r);return `${b.tier}|${Object.entries(b.tickets).map(([k,n])=>k+n).join(',')}`;}));
 assert.deepEqual(bands,['Tân Binh|p11','Đồng|p11','Bạc|p21','Vàng|p11,p21','Bạch Kim|p22','Kim Cương|p11,p22','Cao Thủ|p31'],'rank daily packs scale by tier');

 const rankedDaily=await page.evaluate(()=>{
  memeProgress.setLogin(0,'');
  const p3Before=memeProgress.state.tickets.p3;
  const res=memePacks.claimDaily(2000);
  return {res,p3Before,p3After:memeProgress.state.tickets.p3,xu:memeProgress.state.xu};
 });
 assert.equal(rankedDaily.res.ok,true);assert.equal(rankedDaily.res.rank.tier,'Cao Thủ');
 assert.equal(rankedDaily.p3After-rankedDaily.p3Before,1,'Cao Thủ daily grants a Pack III ticket');

 const match=await page.evaluate(()=>{
  const before={xu:memeProgress.state.xu,level:memeProgress.state.level,xp:memeProgress.state.xp,wins:memeProgress.state.stats.wins,duels:memeProgress.state.stats.duels};
  const res=memePacks.onDuelFinished(true);
  const after={xu:memeProgress.state.xu,level:memeProgress.state.level,xp:memeProgress.state.xp,wins:memeProgress.state.stats.wins,duels:memeProgress.state.stats.duels};
  const lose=memePacks.onDuelFinished(false);
  return {before,res,after,lose,duels:memeProgress.state.stats.duels};
 });
 assert.equal(match.res.xp,40);assert.equal(match.after.xp-match.before.xp,40);assert.equal(match.after.wins-match.before.wins,1);
 assert.equal(match.after.duels-match.before.duels,1);assert.ok(match.after.xu-match.before.xu>=120);
 assert.equal(match.lose.xp,15);assert.equal(match.duels,2);

 const persistedBefore=await page.evaluate(()=>({xu:memeProgress.state.xu,dust:memeProgress.state.dust,level:memeProgress.state.level,tickets:{...memeProgress.state.tickets},owned:Object.keys(memeProgress.state.owned).length,streak:memeProgress.state.login.streak,lastDay:memeProgress.state.login.lastDay,packOpens:memeProgress.state.stats.packOpens}));
 await page.reload();await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress&&window.memePacks);
 await page.waitForSelector('#progressStrip');
 const persisted=await page.evaluate(()=>({xu:memeProgress.state.xu,dust:memeProgress.state.dust,level:memeProgress.state.level,tickets:{...memeProgress.state.tickets},owned:Object.keys(memeProgress.state.owned).length,streak:memeProgress.state.login.streak,lastDay:memeProgress.state.login.lastDay,packOpens:memeProgress.state.stats.packOpens,hudXu:$('progressXu').textContent,claimed:$('dailyBtn').classList.contains('claimed')}));
 assert.deepEqual({...persisted,hudXu:undefined,claimed:undefined},{...persistedBefore,hudXu:undefined,claimed:undefined},'economy persists across reloads');
 assert.equal(persisted.claimed,true,'daily stays claimed after reload');assert.equal(persisted.hudXu,String(persisted.xu).replace(/\B(?=(\d{3})+(?!\d))/g,'.'));
 await page.setViewport({width:390,height:844});
 await page.screenshot({path:path.join(out,'lobby-hud-390x844.png')});
 await page.click('#packBtn');await page.waitForSelector('.pack-grid .pack-card');
 await page.screenshot({path:path.join(out,'shop-390x844.png')});

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log('P1: HUD, daily login rewards once per day, three packs with ticket/Xu costs, guarantees, pity, duplicates to dust, dust exchange, rank-scaled daily packs, duel rewards, persistence, no page errors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
