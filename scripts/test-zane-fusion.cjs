const fs=require('fs'),path=require('path'),http=require('http'),puppeteer=require('puppeteer');
const pub=path.resolve(__dirname,'..','dist');
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://l').pathname.replace(/^\/$/,'/memecard.html'));fs.readFile(f,(e,d)=>{if(e)return res.writeHead(404).end();res.end(d)})});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
const page=await b.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));await page.evaluateOnNewDocument(()=>{window._testAllowed=true;});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);await page.waitForFunction(()=>window.memeDlMissing,{timeout:30000});
const out=await page.evaluate(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const all=[];
 const setup=(spell,mats,mode)=>{clearTimeout(aiTimer);memeFx.reset();memeMusic.setEnabled(false);memeAnime.setAuto(mode==='auto');closeModal();
  duel={player:blankSide(MEME_DECK_PRESETS['Zane · Kinh điển'],[],0),enemy:blankSide(MEME_DECK_PRESETS['Kaiba · Kinh điển'],[],1),turn:'player',phase:'MAIN1',round:3,normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};
  for(const n of ['player','enemy']){const s=duel[n];s.hand=[];s.grave=[];s.banished=[];s.monsters=[null,null,null];s.spells=[null,null,null];s.field=null;s.extra=null;s.extraDeck=[];}
  $('lobby')?.classList.add('hidden');$('duel')?.classList.remove('hidden');
  const P=duel.player;P.extraDeck=['AN-cyber_twin_dragon','AN-cyber_end_dragon','AN-chimeratech_overdragon','AN-cyberdark_dragon','DL-chimeratech_rampage_dragon'];P.hand=[spell];mats.forEach((x,i)=>{const s=monsterSlot(x,'atk');s.summonedRound=1;P.monsters[i]=s;});return P;};
 const spells=['AN-polymerization','AN-power_bond','DL-cyberload_fusion','DL-cybernetic_fusion_support','DL-evolution_burst'];
 const scen=[[],['AN-cyber_dragon'],['AN-celtic_guardian','AN-kuriboh'],['AN-cyberdark_horn','AN-cyberdark_edge']];
 for(const mode of ['auto','manual'])for(const sp of spells)for(const mats of scen){
  const P=setup(sp,mats,mode);const lp0=P.lp,ex0=P.extraDeck.length,g0=P.grave.length,mon0=P.monsters.filter(Boolean).length;
  const pr=memeAnime.perform(()=>memeAnime.playSpellFor('player',0));
  const r=await Promise.race([pr.then(x=>({v:x})),sleep(1200).then(()=>({t:1}))]);
  if(r.t){document.querySelector('.modal-card .secondary-btn')?.click();closeModal();await Promise.race([pr,sleep(500)]);}
  all.push({k:mode+' '+sp+' ['+mats.join(',')+']',ret:r.t?'modal':String(r.v),lpLost:lp0-P.lp,kept:P.hand.includes(sp),summoned:!!P.extra||P.monsters.filter(Boolean).length>mon0,exChanged:P.extraDeck.length!==ex0,graveChanged:P.grave.length!==g0});}
 return all;});
let bad=0;for(const x of out){if(x.ret!=='false'||x.lpLost||!x.kept||x.summoned||x.exChanged||x.graveChanged){bad++;console.log('FAIL',JSON.stringify(x));}}
if(errs.length){bad++;console.log('pageerrors',errs);}
console.log(bad?'FAILED':'PASS zane fusion refused without materials ('+out.length+' cases)');await b.close();server.close();process.exit(bad?1:0);})();
