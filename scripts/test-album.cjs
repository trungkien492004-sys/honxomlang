const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'dist'),out=path.join(root,'outputs/album');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'})[path.extname(f)]||'application/octet-stream'});res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);if(process.env.DEBUG_ERRORS)console.error(e.stack);});
 const boot=async()=>{await page.goto(base+'/memecard.html');await page.waitForFunction(()=>window.memeProgress&&window.memePacks&&window.memeAlbum,{timeout:30000});await page.waitForSelector('#packBtn');};
 const openShop=async()=>{await page.evaluate(()=>memePacks.openShop());await page.waitForSelector('.pack-shop');};
 await page.setViewport({width:1366,height:768});
 await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('rank-promo-dismissed','1');sessionStorage.setItem('rank-promo-dismissed','1');}catch{}});
 await boot();

 const prices=await page.evaluate(()=>({...memeAlbum.BUY}));
 assert.deepEqual(prices,{N:100,R:260,SR:780,UR:2000},'dust prices are set per rarity');

 await openShop();
 await page.screenshot({path:path.join(out,'pack-shop-1366x768.png')});
 await page.click('#packAlbumBtn');await page.waitForSelector('.album-modal');
 const head=await page.evaluate(()=>({
  title:document.querySelector('.album-head h2').textContent,
  owned:document.querySelector('.album-head p b').textContent,
  tiles:document.querySelectorAll('.album-card').length,
  total:memeAlbum.catalog().length,
  locked:[...document.querySelectorAll('.album-buy')].every(n=>n.disabled),
  wallet:document.querySelector('.album-wallet span').textContent
 }));
 assert.match(head.title,/Bộ sưu tập/);assert.match(head.owned,/^\d+\/\d+$/,'the album counts the collection');
 assert.equal(head.tiles,head.total,'unfiltered album shows every collectible card');
 assert.equal(head.locked,true,'nothing is affordable at 0 dust');assert.match(head.wallet,/0 bụi/);
 await page.screenshot({path:path.join(out,'album-1366x768.png')});

 const purchase=await page.evaluate(price=>{
  const target=memeAlbum.catalog().find(c=>c.rarity==='N'&&memeProgress.copies(c.id)===0&&memeAlbum.limitOf(c)===3);
  const denied=memeAlbum.buy(target.id);
  memeProgress.addDust(5000);
  const first=memeAlbum.buy(target.id);
  memeAlbum.buy(target.id);memeAlbum.buy(target.id);
  const over=memeAlbum.buy(target.id);
  return {id:target.id,name:target.name,denied,first,over,copies:memeProgress.copies(target.id),dust:memeProgress.state.dust,hud:document.getElementById('progressDust').textContent,price:price.N};
 },prices);
 assert.equal(purchase.denied.ok,false,'a purchase without dust is refused');
 assert.equal(purchase.first.ok,true);assert.equal(purchase.first.price,purchase.price);
 assert.equal(purchase.dust,5000-purchase.price*3,'three copies cost three times the price');
 assert.equal(purchase.copies,3);
 assert.equal(purchase.over.ok,false,'buying past the copy limit is refused');assert.match(purchase.over.error,/đã đủ 3 bản/);
 assert.equal(purchase.hud,(5000-purchase.price*3).toLocaleString('vi-VN'),'the HUD dust chip follows the purchase');

 await page.evaluate(()=>memeAlbum.open());await page.waitForSelector('.album-modal');
 const searched=await page.evaluate(()=>{
  const name=document.querySelector('.album-info b').textContent,total=document.querySelectorAll('.album-card').length;
  const s=document.getElementById('albumSearch');s.value=name;s.dispatchEvent(new Event('input'));
  return {name,total,tiles:document.querySelectorAll('.album-card').length,count:document.getElementById('albumCount').textContent};
 });
 assert.ok(searched.tiles>=1&&searched.tiles<searched.total,`search for "${searched.name}" narrows ${searched.total} to ${searched.tiles}`);
 assert.match(searched.count,/thẻ/);
 await page.evaluate(()=>{const s=document.getElementById('albumSearch');s.value='';s.dispatchEvent(new Event('input'));});

 await page.click('[data-rarity="UR"]');
 const ur=await page.evaluate(price=>({tiles:document.querySelectorAll('.album-card').length,
  allUr:[...document.querySelectorAll('.album-card')].every(n=>n.classList.contains('rarity-UR')),
  labels:[...document.querySelectorAll('.album-card')].map(n=>({full:n.classList.contains('full'),text:n.querySelector('.album-buy').textContent})),
  priced:price.toLocaleString('vi-VN')}),prices.UR);
 assert.ok(ur.tiles>0&&ur.allUr,'the rarity filter keeps only UR cards');
 assert.deepEqual(ur.labels.filter(l=>l.full&&!l.text.includes('Đủ')).length,0,'full tiles say Đủ');
 assert.equal(ur.labels.filter(l=>!l.full&&!l.text.includes(ur.priced)).length,0,'open UR tiles quote the UR dust price');

 await page.click('[data-status="missing"]');await page.click('[data-rarity="all"]');
 const missing=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[data-buy]')].map(n=>n.dataset.buy);return {count:ids.length,owned:ids.filter(id=>memeProgress.copies(id)>0).length};});
 assert.ok(missing.count>0,'the album has cards still missing');assert.equal(missing.owned,0,'the missing filter hides owned cards');
 await page.screenshot({path:path.join(out,'album-filtered-1366x768.png')});

 await page.click('#albumShop');await page.waitForSelector('.pack-shop');
 const shop=await page.evaluate(()=>({sub:document.querySelector('.pack-sub b').textContent,owned:memeProgress.ownedUnique(),total:memeProgress.totalCollectible()}));
 assert.equal(shop.sub,`${shop.owned}/${shop.total}`,'the shop counter matches the collection');

 await boot();
 const persisted=await page.evaluate(()=>({owned:memeProgress.ownedUnique(),missing:memeAlbum.rows().filter(c=>memeProgress.copies(c.id)===0).length,hud:document.getElementById('progressDust').textContent}));
 assert.ok(persisted.owned>=3,'purchases survive a reload');assert.ok(persisted.missing>0,'the album still has cards to chase');assert.equal(persisted.hud,(5000-purchase.price*3).toLocaleString('vi-VN'));

 await page.evaluate(()=>memeAlbum.open());await page.waitForSelector('.album-modal');
 const single=await page.evaluate(()=>{
  const target=memeAlbum.catalog().find(c=>memeAlbum.limitOf(c)===1&&!memeProgress.owns(c.id));
  if(!target)return {skipped:true};
  memeProgress.addDust(3000);
  const first=memeAlbum.buy(target.id),again=memeAlbum.buy(target.id);
  return {skipped:false,first,again,copies:memeProgress.copies(target.id)};
 });
 if(!single.skipped){assert.equal(single.first.ok,true);assert.equal(single.again.ok,false,'a 1-copy card cannot be bought twice');assert.equal(single.copies,1);}
 else assert.fail('the catalog needs at least one 1-copy card');

 const poor=await page.evaluate(()=>{
  const target=memeAlbum.catalog().find(c=>memeProgress.copies(c.id)===0);
  memeProgress.state.dust=0;
  const result=memeAlbum.buy(target.id);
  return {error:result.error,ok:result.ok};
 });
 assert.equal(poor.ok,false);assert.match(poor.error,/Cần \d+ bụi/,'the refusal states the price');

 await page.setViewport({width:390,height:844});
 await page.evaluate(()=>memeAlbum.open());await page.waitForSelector('.album-modal');
 const mobile=await page.evaluate(()=>{const c=document.querySelector('#modal .modal-card'),b=document.querySelector('.album-body');return {width:c.getBoundingClientRect().width,overflow:getComputedStyle(c).overflowY,scrolls:b.scrollHeight>b.clientHeight+1,tile:document.querySelector('.album-card').getBoundingClientRect().width};});
 assert.ok(mobile.width<=390,'the album fits a phone');assert.equal(mobile.overflow,'auto');assert.ok(mobile.scrolls,'the album grid scrolls');assert.ok(mobile.tile<=376);
 await page.screenshot({path:path.join(out,'album-390x844.png')});

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log('P5: collection album opened from the pack shop, owned/total counters, rarity + status + text filters, dust prices per rarity, copy limits and 1-copy cards, purchase persistence, HUD and shop counters in sync, mobile grid, no page errors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
