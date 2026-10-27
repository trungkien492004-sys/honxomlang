const fs=require('fs'),http=require('http'),path=require('path'),puppeteer=require('puppeteer'),pub=path.resolve('dist');
const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://local'),f=path.resolve(pub,'.'+u.pathname);fs.readFile(f,(e,b)=>{if(e)return r.writeHead(404).end();r.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});const p=await b.newPage();await p.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);await p.waitForFunction(()=>window.memeAnime?.battle);
const out=await p.evaluate(async()=>{
 clearTimeout(aiTimer);memeAnime.cancelChoice();memeOpening.clear();memeFx.reset();closeModal();memeAnime.setAuto(false);
 duel={player:blankSide(defaultDeck()),enemy:blankSide(defaultDeck()),round:3,turn:'player',phase:'BATTLE',normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};
 duel.player.extra={...monsterSlot('AN-elemental_hero_flame_wingman','atk'),uid:'ez'};
 duel.player.hand=[];duel.player.extraDeck=[];
 duel.enemy.monsters=[{...monsterSlot('AN-celtic_guardian','atk'),uid:'foe'}];
 $('lobby').classList.add('hidden');$('duel').classList.remove('hidden');render();
 const def=duel.enemy.monsters[0]&&card(duel.enemy.monsters[0].id);
 await memeAnime.perform(()=>memeAnime.battle('player',-1,true,0,false));
 return {enemyMons:duel.enemy.monsters.map(s=>s?.id||null),lp:duel.enemy.lp,logs:duel.logs.slice(-6),atk:memeRules.stat('player',duel.player.extra),defName:def&&def.name,defAtk:def&&def.atk};
});
console.log(JSON.stringify(out,null,2));await b.close();server.close();})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
