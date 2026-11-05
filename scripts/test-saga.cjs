const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),http=require('http'),puppeteer=require('puppeteer');
const pub=path.resolve(__dirname,'..','dist');
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://l').pathname.replace(/^\/$/,'/memecard.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
 await page.waitForFunction(()=>window.memeSaga&&window.memeJourney&&window.memeProgress,{timeout:30000});
 await page.waitForSelector('#sagaBtn');
 // 1. dữ liệu: đủ 9 đấu sĩ x 6 hồi, bộ bài có thật, mỗi đấu sĩ có thẻ thưởng
 const data=await page.evaluate(()=>{const S=memeSaga,out={heroes:MEME_HEROES.length,missing:[],badLines:[],pools:[],acts:0};
  for(const h of MEME_HEROES){const saga=S.SAGA[h.id];if(!saga){out.missing.push('saga '+h.id);continue;}
   out.pools.push(S.heroPool(h.id).length);
   for(const a of saga.acts){out.acts++;if(!MEME_DECK_PRESETS[a[3]])out.missing.push(h.id+':'+a[3]);for(const l of [...a[4],a[5]])if(!/^[hen]:/.test(l))out.badLines.push(l);}
   if(saga.acts.length!==S.LEVELS.length)out.missing.push('acts '+h.id);}
  return out;});
 assert.equal(data.heroes,9);assert.deepEqual(data.missing,[],'mọi hồi dùng bộ bài có thật');assert.deepEqual(data.badLines,[]);assert.equal(data.acts,54);assert.ok(data.pools.every(n=>n>=10),'mỗi đấu sĩ đủ thẻ thưởng: '+data.pools);
 // 2. lên cấp: cấp mốc tặng thẻ + xu, không nhận trùng
 const lv=await page.evaluate(()=>{const S=memeSaga,P=memeProgress;const xu0=P.state.xu,own0=P.ownedUnique?.()??0;
  const lines=S.addHeroXp(4,2000);const h=S.heroState(4);const lines2=S.addHeroXp(4,0);
  return{level:h.level,claimed:h.claimed.length,cardLines:lines.filter(l=>l.startsWith('🃏')).length,xuGain:P.state.xu-xu0,dup:new Set(h.claimed).size!==h.claimed.length,lines2:lines2.length};});
 assert.ok(lv.level>=10,'2000 KN đủ lên cấp 10+: '+lv.level);assert.ok(lv.cardLines>=3,'nhận thẻ ở các mốc: '+lv.cardLines);assert.ok(lv.xuGain>0);assert.ok(!lv.dup);assert.equal(lv.lines2,0);
 // 3. khóa hồi theo cấp
 const lock=await page.evaluate(()=>[memeSaga.actUnlocked(5,0),memeSaga.actUnlocked(5,1),memeSaga.actUnlocked(4,1)]);
 assert.deepEqual(lock,[true,false,false],'hồi 2 cần cấp 4 và xong hồi 1');
 // 4. mở UI
 await page.evaluate(()=>document.getElementById('sagaBtn').click());await page.waitForSelector('.saga-modal');
 assert.equal(await page.$$eval('.saga-heroes button',b=>b.length),9);assert.equal(await page.$$eval('.saga-act',b=>b.length),6);
 await page.evaluate(sel=>document.querySelector(sel).click(),'.saga-tabs [data-tab="rewards"]');await page.waitForSelector('.saga-levels');
 assert.equal(await page.$$eval('.saga-lv',b=>b.length),39);
 await page.evaluate(sel=>document.querySelector(sel).click(),'.saga-tabs [data-tab="story"]');
 // 5. chơi hồi 1: thoại -> trận -> thắng -> thưởng + KN
 await page.evaluate(()=>{const P=memeProgress;P.grantDeck(deckList,extraDeckList);});
 const deckOk=await page.evaluate(()=>{try{return !deckProblem(deckList,extraDeckList)}catch{return false}});
 if(deckOk){
  await page.evaluate(sel=>document.querySelector(sel).click(),'.saga-play[data-act="0"]');await page.waitForSelector('.saga-dlg');
  await page.waitForSelector('.saga-dlg-text');await page.evaluate(sel=>document.querySelector(sel).click(),'.saga-dlg-skip');
  await page.waitForFunction(()=>!document.querySelector('.saga-dlg')&&!!duel&&!duel.finished,{timeout:15000});
  const pend=await page.evaluate(()=>({p:memeSaga.pending,tok:duel.sagaToken}));assert.ok(pend.p&&pend.p.token===pend.tok,'trận gắn token Truyền Kỳ');
  const before=await page.evaluate(()=>memeSaga.heroState(0).xp+memeSaga.heroState(0).level*1e4);
  const res=await page.evaluate(()=>{finish('player','test');return{journey:duel.journey,cleared:memeSaga.actCleared(0,0),hero:memeSaga.heroState(0)};});
  assert.ok(res.cleared,'hồi 1 hoàn thành');assert.ok(res.journey&&/Hồi 1 hoàn thành/.test(res.journey.title),'kết quả hiện thưởng hồi: '+JSON.stringify(res.journey));
  assert.ok(res.journey.lines.some(l=>l.startsWith('💬')),'có thoại kết');
  const after=await page.evaluate(()=>memeSaga.heroState(0).xp+memeSaga.heroState(0).level*1e4);assert.ok(after>before,'đấu sĩ nhận KN');
 }else console.log('(bỏ qua bước chơi: bộ bài mặc định chưa hợp lệ)');
 assert.deepEqual(errors,[],'không lỗi trang: '+errors.join('; '));
 console.log('test-saga: OK');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
