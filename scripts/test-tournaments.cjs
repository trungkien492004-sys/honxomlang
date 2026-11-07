const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),http=require('http'),puppeteer=require('puppeteer');
const pub=path.resolve(__dirname,'..','dist');
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://l').pathname.replace(/^\/$/,'/memecard.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
 await page.waitForFunction(()=>window.memeTournaments&&window.memeJourney&&window.memeProgress,{timeout:30000});
 await page.waitForSelector('#tournamentBtn');
 // 1. dữ liệu: bộ bài có thật, đủ 4 giải
 const d=await page.evaluate(()=>{const T=memeTournaments;return{n:T.EVENTS.length,missing:T.EVENTS.flatMap(e=>e.rounds.filter(r=>!MEME_DECK_PRESETS[r[2]]).map(r=>e.id+':'+r[2]))};});
 assert.equal(d.n,4);assert.deepEqual(d.missing,[],'mọi vòng dùng bộ bài có thật');
 // 2. lịch: đăng ký đúng 24 giờ trước khai mạc
 const s=await page.evaluate(()=>{const T=memeTournaments,o=T.occurrence(0),H=3600000;
  return{before:T.phaseOf(o,o.start-25*H),open:T.phaseOf(o,o.start-23*H),edge:T.phaseOf(o,o.start-24*H),live:T.phaseOf(o,o.start+H),ended:T.phaseOf(o,o.start+25*H),regSpan:o.start-o.regOpen,
   a:T.occurrence(0).ev.id,b:T.occurrence(1).ev.id,c:T.occurrence(4).ev.id};});
 assert.equal(s.before,'upcoming');assert.equal(s.open,'register');assert.equal(s.edge,'register');assert.equal(s.live,'live');assert.equal(s.ended,'ended');assert.equal(s.regSpan,86400000);
 assert.notEqual(s.a,s.b);assert.equal(s.a,s.c,'xoay vòng 4 giải');
 // 3. đăng ký: chỉ trong cửa sổ, không đăng ký hai lần, hết hạn khi khai mạc
 const r=await page.evaluate(()=>{const T=memeTournaments,o=T.occurrence(0);memeProgress.state.story.tourney={entries:{}};
  return[T.register(0,o.start-26*3600000).ok,T.register(0,o.start-2*3600000).ok,T.register(0,o.start-1*3600000).ok,T.register(0,o.start+1000).ok,T.status(0,o.start+1000),T.status(0,o.start-1000)];});
 assert.deepEqual(r,[false,true,false,false,'playing','waiting'].map((x,i)=>i<4?x:x));
 // 4. không đăng ký thì lỡ giải
 const m=await page.evaluate(()=>{const T=memeTournaments,o=T.occurrence(1);return[T.status(1,o.start-3600000),T.status(1,o.start+3600000),T.register(1,o.start+3600000).ok];});
 assert.deepEqual(m,['open','missed',false]);
 // 5. thông báo khi vào game chỉ khi có giải đang mở đăng ký
 const a=await page.evaluate(()=>{const T=memeTournaments,o=T.occurrence(1);return[T.announce(o.start-3*3600000).length>0,T.announce(o.start-4*86400000).filter(x=>x.includes('mở đăng ký')).length];});
 assert.equal(a[0],true);
 // 6. thi đấu: thắng qua từng vòng, vô địch nhận thưởng, thua bị loại
 const w=await page.evaluate(async()=>{const T=memeTournaments,P=memeProgress,o=T.occurrence(2),n=o.ev.rounds.length;
  P.state.story.tourney={entries:{2:{round:0,status:'registered',at:1}}};
  const xu0=P.state.xu;const log=[];
  for(let i=0;i<n;i++){
   T.__finish=null;
   // mô phỏng kết thúc trận qua móc của memeJourney
   const realNow=Date.now;Date.now=()=>o.start+3600000;
   try{ if(!T.startRound(2)){log.push('start-fail '+i);break;} }catch(e){log.push('err '+e.message);break;} finally{Date.now=realNow;}
   const res=memeJourney.onDuelFinished(true);log.push(res&&res.title);
   try{ if(typeof clearTimeout==='function'&&window.aiTimer)clearTimeout(window.aiTimer);}catch{}
  }
  return{log,status:T.entryOf(2).status,xu:P.state.xu-xu0};});
 assert.equal(w.status,'champion',JSON.stringify(w.log));assert.ok(w.xu>=2000,'thưởng vô địch: '+w.xu);
 // 7. UI mở được và có nút đăng ký
 await page.evaluate(()=>{memeProgress.state.story.tourney={entries:{}};});
 await page.evaluate(()=>document.getElementById('tournamentBtn').click());await page.waitForSelector('.tour-modal');
 assert.ok(await page.$$eval('.tour-card',b=>b.length)>=1);
 assert.deepEqual(errors,[]);
 console.log('Tournament tests passed');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
