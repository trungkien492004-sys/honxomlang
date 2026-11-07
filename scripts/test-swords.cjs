const fs=require('fs'),path=require('path'),http=require('http'),puppeteer=require('puppeteer');
const pub=path.resolve(__dirname,'..','dist');
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://l').pathname.replace(/^\/$/,'/memecard.html'));fs.readFile(f,(e,d)=>{if(e)return res.writeHead(404).end();res.end(d)})});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
const page=await b.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));await page.evaluateOnNewDocument(()=>{window._testAllowed=true;});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);await page.waitForFunction(()=>window.memeDlMissing,{timeout:30000});
const out=await page.evaluate(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const L=[];
 for(const mode of ['auto','manual']){
  clearTimeout(aiTimer);memeFx.reset();memeMusic.setEnabled(false);memeAnime.setAuto(mode==='auto');closeModal();
  duel={player:blankSide(MEME_DECK_PRESETS['Yugi · Kinh điển'],[],0),enemy:blankSide(MEME_DECK_PRESETS['Kaiba · Kinh điển'],[],1),turn:'player',phase:'MAIN1',round:3,normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};
  for(const n of ['player','enemy']){const s=duel[n];s.hand=[];s.grave=[];s.banished=[];s.monsters=[null,null,null];s.spells=[null,null,null];s.field=null;s.extra=null;s.extraDeck=[];}
  $('lobby')?.classList.add('hidden');$('duel')?.classList.remove('hidden');
  const P=duel.player,E=duel.enemy;P.hand=['AN-swords_of_revealing_light'];
  const fd=monsterSlot('AN-blue_eyes_white_dragon','def_down');fd.summonedRound=1;E.monsters[0]=fd;
  const up=monsterSlot('AN-battle_ox','atk');up.summonedRound=1;E.monsters[1]=up;
  const mine=monsterSlot('AN-summoned_skull','atk');mine.summonedRound=1;P.monsters[0]=mine;
  const r=await Promise.race([memeAnime.perform(()=>memeAnime.playSpellFor('player',0)).then(v=>({v})),sleep(2000).then(()=>({t:1}))]);
  if(r.t){document.querySelector('.modal-card .arcana-option')?.click();document.querySelector('.modal-card .primary-btn')?.click();await sleep(600);}
  const sp=P.spells.find(Boolean);
  L.push({mode,ret:r.t?'modal':r.v,flipped:E.monsters[0].position,faceDownFlag:E.monsters[0].faceDown,swordsOnField:!!sp,faceUp:sp&&!sp.faceDown,turns:sp?.turnsLeft,
   foeCanAttack:memeAnime.canAttack?memeAnime.canAttack(E.monsters[1]):'n/a',myCanAttack:memeAnime.canAttack?memeAnime.canAttack(mine):'n/a',handLeft:P.hand.length,grave:P.grave.length});
  const seq=[];
  const ca=sl=>{try{return memeAnime.canAttack(sl)}catch(e){return 'err'}};
  seq.push('foeCanAttack:'+ca(E.monsters[1]));
  for(let t=0;t<3;t++){duel.turn='enemy';await memeAnime.perform(()=>memeAnime.endTurn('enemy'));seq.push(P.spells.find(Boolean)?.turnsLeft??'gone');}
  L.push({mode,seq,onFieldAfter:!!P.spells.find(Boolean),graveAfter:P.grave.length});
 }
 return L;});
let bad=0;const chk=(c,m)=>{if(!c){bad++;console.log('FAIL',m);}};
for(let i=0;i<out.length;i+=2){const a=out[i],b=out[i+1];
 chk(a.ret===true,a.mode+': kích hoạt được');chk(a.flipped==='def',a.mode+': lật quái úp đối thủ');
 chk(a.swordsOnField&&a.faceUp&&a.turns===3&&a.grave===0,a.mode+': ở lại sân ngửa với 3 lượt (không vào Mộ ngay)');
 chk(JSON.stringify(b.seq.slice(1))==='[2,1,"gone"]',a.mode+': đếm 3→2→1→phá');chk(!b.onFieldAfter&&b.graveAfter===1,a.mode+': vào Mộ sau 3 lượt');}
if(errs.length){bad++;console.log('pageerrors',errs);}
console.log(bad?'FAILED':'PASS swords of revealing light');await b.close();server.close();process.exit(bad?1:0);})();
