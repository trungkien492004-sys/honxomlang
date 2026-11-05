const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),http=require('http'),puppeteer=require('puppeteer');
const pub=path.resolve(__dirname,'..','dist');
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://l').pathname.replace(/^\/$/,'/memecard.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.evaluateOnNewDocument(()=>{window._testAllowed=true;});
 await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
 await page.waitForFunction(()=>window.memeDlMissing&&window.memeAnime&&window.memeDlHandlers,{timeout:30000});
 const res=await page.evaluate(async()=>{
  const out={};const F='AN-celtic_guardian';
  const fresh=()=>{clearTimeout(aiTimer);memeFx.reset();memeMusic.setEnabled(false);memeAnime.setAuto(true);
   duel={player:blankSide(MEME_DECK_PRESETS['Kaiba · Kinh điển'],[],0),enemy:blankSide(MEME_DECK_PRESETS['Kaiba · Kinh điển'],[],1),turn:'player',phase:'MAIN1',round:3,normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};
   for(const n of ['player','enemy']){const s=duel[n];s.hand=[];s.grave=[];s.banished=[];s.monsters=[null,null,null];s.spells=[null,null,null];s.field=null;s.extra=null;s.extraDeck=[];}
   $('lobby')?.classList.add('hidden');$('duel')?.classList.remove('hidden');};
  const put=(n,id,i=0,pos='atk')=>{const s=monsterSlot(id,pos);s.summonedRound=1;duel[n].monsters[i]=s;return s;};
  // 1. Twin Burst không bị phá bởi chiến đấu
  fresh();const tb=put('player','DL-blue_eyes_twin_burst_dragon');put('enemy','AN-blue_eyes_white_dragon');
  duel.turn='enemy';duel.phase='BATTLE';duel.enemy.monsters[0].attacksUsed=0;
  await memeAnime.perform(()=>memeAnime.battle('enemy',0,false,0));
  out.tbSurvives=duel.player.monsters[0]===tb;
  // 2. Twin Burst trục xuất quái sống sót
  fresh();const a=put('player','DL-blue_eyes_twin_burst_dragon');const d=put('enemy','DL-blue_eyes_twin_burst_dragon');
  duel.phase='BATTLE';await memeAnime.perform(()=>memeAnime.battle('player',0,false,0));
  out.banished=duel.enemy.banished.includes('DL-blue_eyes_twin_burst_dragon')&&!duel.enemy.monsters[0];out.attackerStays=duel.player.monsters[0]===a;
  // 3. Vier: +500 cho Rồng Máy và tự gọi khi triệu hồi Rồng Máy
  fresh();duel.player.hand=['AN-cyber_dragon','DL-cyber_dragon_vier'];put('player',F,1);
  const base=memeAnime.tcgCore.stat('player',monsterSlot('AN-cyber_dragon'));
  await memeAnime.perform(()=>memeAnime.normalSummon('player',0,'atk',[1]));
  const vier=duel.player.monsters.find(m=>m&&m.id==='DL-cyber_dragon_vier');const cd=duel.player.monsters.find(m=>m&&m.id==='AN-cyber_dragon');
  out.vier=!!vier&&vier.position==='def';out.dbg=JSON.stringify({mons:duel.player.monsters.map(m=>m&&m.id),hand:duel.player.hand,logs:duel.logs.slice(-4).map(l=>l.text||l)});out.cdBoost=cd?memeAnime.tcgCore.stat('player',cd)-base:null;
  // 4. Rampage phá Phép/Bẫy theo số nguyên liệu
  fresh();duel.enemy.spells=[{id:'AN-mirror_force',faceDown:true,setRound:1},{id:'AN-waboku',faceDown:true,setRound:1},{id:'AN-magic_jammer',faceDown:true,setRound:1}];
  const rs=put('player','DL-chimeratech_rampage_dragon');rs.materialCount=2;
  await memeAnime.perform(()=>memeAnime.resolveEffect('player',card('DL-chimeratech_rampage_dragon'),{source:rs}));
  out.rampage=duel.enemy.spells.filter(Boolean).length;
  // 5. Toon BLS: trục xuất 1 lá, đánh trực tiếp khi đối thủ không có Toon
  fresh();const bls=put('player','DL-toon_black_luster_soldier');put('enemy','AN-blue_eyes_white_dragon');
  out.direct=memeAnime.directAllowed('player',bls);
  await memeAnime.perform(()=>memeAnime.resolveEffect('player',card('DL-toon_black_luster_soldier'),{source:bls}));
  out.blsBanished=duel.enemy.banished.length+duel.player.banished.length;
  // 6. Golden Eyes Idol xem tay
  fresh();duel.enemy.hand=['AN-kuriboh'];const idol=put('player','DL-golden_eyes_idol');
  const ok=await memeAnime.perform(()=>memeAnime.resolveEffect('player',card('DL-golden_eyes_idol'),{source:idol}));
  out.idolLog=duel.logs.some(l=>String(l.text||l).includes('tay đối thủ'));
  return out;});
 assert.equal(res.tbSurvives,true,'Twin Burst không bị phá bởi chiến đấu');
 assert.equal(res.banished,true,'quái sống sót bị trục xuất');assert.equal(res.attackerStays,true);
 assert.equal(res.vier,true,'Vier tự gọi thế thủ '+res.dbg);assert.equal(res.cdBoost,500,'+500 Rồng Máy');
 assert.equal(res.rampage,1,'phá 2 trong 3 Phép/Bẫy');
 assert.equal(res.direct,true,'Toon BLS đánh trực tiếp khi đối thủ không có Toon');assert.equal(res.blsBanished,1);
 assert.equal(res.idolLog,true);
 assert.deepEqual(errors,[]);
 console.log('DL missing-card tests passed');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
