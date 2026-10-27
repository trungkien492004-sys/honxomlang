const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict'),puppeteer=require('puppeteer'),pub=path.resolve(process.env.DUEL_PUBLIC_DIR||'dist'),out=path.resolve('outputs/extra-zone');
const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://local'),f=path.resolve(pub,'.'+u.pathname);if(!f.startsWith(pub+path.sep))return r.writeHead(403).end();fs.readFile(f,async(e,b)=>{if(e){if(!process.env.DUEL_ASSET_FALLBACK)return r.writeHead(404).end();try{const x=await fetch('https://honxomlang-e6974.web.app'+u.pathname);r.writeHead(x.status,{'Content-Type':x.headers.get('content-type')||'application/octet-stream'});return r.end(Buffer.from(await x.arrayBuffer()));}catch{return r.writeHead(404).end();}}r.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(b);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--disable-background-timer-throttling']});
 try{
  const p=await browser.newPage(),errors=[],checks=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.setViewport({width:1366,height:768});
  await p.goto((process.env.DUEL_BASE_URL||`http://127.0.0.1:${server.address().port}`)+'/memecard.html');
  await p.waitForFunction(()=>window.memeAnime?.chooseMany);
  fs.mkdirSync(out,{recursive:true});
  await p.evaluate(()=>{
   window.ezReset=opts=>{
    clearTimeout(aiTimer);memeAnime.cancelChoice();memeOpening.clear();memeFx.reset();closeModal();memeMusic.setEnabled(false);memeAnime.setAuto(false);
    duel={player:blankSide(defaultDeck()),enemy:blankSide(defaultDeck()),round:3,turn:'player',phase:'MAIN1',normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};
    const P=duel.player,E=duel.enemy;
    P.hand=[...(opts?.hand??['AN-polymerization','AN-elemental_hero_avian','AN-elemental_hero_burstinatrix'])];
    P.extraDeck=[...(opts?.extraDeck??['AN-elemental_hero_flame_wingman','AN-elemental_hero_flame_wingman'])];
    P.monsters=(opts?.monsters??[null,null,null]).map(id=>id?{...monsterSlot(id,'atk'),uid:'ez-'+Math.random()}:null);
    E.monsters=[{...monsterSlot(opts?.enemyMonster||'AN-celtic_guardian','atk'),uid:'foe-1'},null,null];
    P.extra=opts?.extra?{...monsterSlot(opts.extra,'atk'),uid:'ez-extra'}:null;
    P.spells=[null,null,null];E.spells=[null,null,null];P.field=null;E.field=null;E.hand=[];E.extra=null;
    $('lobby').classList.add('hidden');$('duel').classList.remove('hidden');render();
   };
   window.ezFuse=id=>memeAnime.perform(()=>memeAnime.fuse('player','AN-polymerization',id));
   window.ezIdle=()=>!memeAnime.busy&&!memeAnime.choosing;
   ezReset();
  });

  // 1. Empty Extra zone: the fusion goes there, main monster zones stay empty.
  await p.evaluate(()=>{ezReset();window.ezAction=ezFuse('AN-elemental_hero_flame_wingman');});
  await p.waitForSelector('#multiChoiceStatus');
  for(const id of ['AN-elemental_hero_avian','AN-elemental_hero_burstinatrix'])await p.click(`.multi-choice-list [data-card-id="${id}"]`);
  await p.click('#animeChoiceConfirm');
  await p.waitForFunction(()=>!memeAnime.busy&&!memeAnime.choosing&&duel.player.extra?.id==='AN-elemental_hero_flame_wingman',{timeout:20000});
  await p.evaluate(()=>window.ezAction);
  let state=await p.evaluate(()=>({extra:duel.player.extra?.id||null,main:duel.player.monsters.map(s=>s?.id||null),hand:duel.player.hand.length,extraDeck:duel.player.extraDeck.length,grave:duel.player.grave.slice()}));
  assert.equal(state.extra,'AN-elemental_hero_flame_wingman','fusion lands in the Extra Monster Zone');
  assert.deepEqual(state.main,[null,null,null],'main monster zones stay untouched');
  assert.equal(state.hand,0,'Polymerization and both materials leave the hand');
  assert.equal(state.extraDeck,1,'one copy consumed from the Extra Deck');
  assert.ok(state.grave.includes('AN-elemental_hero_avian')&&state.grave.includes('AN-elemental_hero_burstinatrix'),'materials go to the Graveyard');
  const zone1=await p.$eval('#playerExtra',n=>({has:n.classList.contains('has-card'),text:n.textContent.replace(/\s+/g,' ').trim(),stats:n.querySelector('.special-stats')?.textContent||''}));
  assert.ok(zone1.has&&zone1.text.includes('Dực Hỏa'),'Extra zone UI shows the summoned monster');
  assert.ok(zone1.stats.includes('2100'),'Extra zone UI shows ATK');
  checks.push('Empty Extra zone: fusion summoned there, main zones untouched, UI shows ATK');

  // 2. Extra zone occupied: the next fusion drops into the first free main zone.
  await p.evaluate(()=>{ezReset({extraDeck:['AN-elemental_hero_flame_wingman'],extra:'AN-elemental_hero_flame_wingman'});window.ezAction=ezFuse('AN-elemental_hero_flame_wingman');});
  await p.waitForSelector('#multiChoiceStatus');
  for(const id of ['AN-elemental_hero_avian','AN-elemental_hero_burstinatrix'])await p.click(`.multi-choice-list [data-card-id="${id}"]`);
  await p.click('#animeChoiceConfirm');
  await p.waitForFunction(()=>!memeAnime.busy&&!memeAnime.choosing&&duel.player.monsters.some(s=>s?.id==='AN-elemental_hero_flame_wingman'),{timeout:20000});
  await p.evaluate(()=>window.ezAction);
  state=await p.evaluate(()=>({extra:duel.player.extra?.id||null,main:duel.player.monsters.map(s=>s?.id||null)}));
  assert.equal(state.extra,'AN-elemental_hero_flame_wingman','occupied Extra zone keeps its monster');
  assert.deepEqual(state.main,['AN-elemental_hero_flame_wingman',null,null],'second fusion uses the first free main zone');
  checks.push('Occupied Extra zone: next fusion goes to the first free main monster zone');

  // 3. Extra zone + all main zones occupied, materials only in hand: fusion is not offered.
  const blocked=await p.evaluate(()=>{
   ezReset({extraDeck:['AN-elemental_hero_flame_wingman'],extra:'AN-elemental_hero_flame_wingman',monsters:['AN-celtic_guardian','AN-celtic_guardian','AN-celtic_guardian']});
   return {options:memeAnime.fusionOptions('player','AN-elemental_hero_flame_wingman').length,candidates:synchroOptions('player','AN-elemental_hero_flame_wingman').length,hand:duel.player.hand.length};
  });
  assert.equal(blocked.options,0,'no fusion options when every zone is occupied and materials sit in hand');
  assert.equal(blocked.candidates,0,'summon button stays disabled');
  const refused=await p.evaluate(async()=>{const r=await memeAnime.fuse('player','AN-polymerization','AN-elemental_hero_flame_wingman');return {result:r,hand:duel.player.hand.length,extraDeck:duel.player.extraDeck.length};});
  assert.equal(refused.result,false,'forced fusion is refused');
  assert.deepEqual([refused.hand,refused.extraDeck],[3,1],'nothing is consumed by the refused summon');
  checks.push('Full board: fusion refused, no card consumed');

  // 4. Full main board but a field material frees a zone -> fusion lands in the freed main zone.
  await p.evaluate(()=>{ezReset({extraDeck:['AN-elemental_hero_flame_wingman'],extra:'AN-elemental_hero_flame_wingman',hand:['AN-polymerization','AN-elemental_hero_burstinatrix'],monsters:['AN-celtic_guardian','AN-elemental_hero_avian','AN-celtic_guardian']});window.ezAction=ezFuse('AN-elemental_hero_flame_wingman');});
  await p.waitForSelector('#multiChoiceStatus');
  for(const id of ['AN-elemental_hero_avian','AN-elemental_hero_burstinatrix'])await p.click(`.multi-choice-list [data-card-id="${id}"]`);
  await p.click('#animeChoiceConfirm');
  await p.waitForFunction(()=>!memeAnime.busy&&!memeAnime.choosing&&duel.player.monsters.some(s=>s?.id==='AN-elemental_hero_flame_wingman'),{timeout:20000});
  await p.evaluate(()=>window.ezAction);
  state=await p.evaluate(()=>({extra:duel.player.extra?.id||null,main:duel.player.monsters.map(s=>s?.id||null)}));
  assert.equal(state.extra,'AN-elemental_hero_flame_wingman','Extra zone still holds the first fusion');
  assert.deepEqual(state.main,['AN-celtic_guardian','AN-elemental_hero_flame_wingman','AN-celtic_guardian'],'fusion replaces the field material it consumed');
  checks.push('Full main board with a field material: fusion lands in the freed main zone');

  // 5. Extra zone monster attacks and can be attacked back.
  const attack=await p.evaluate(async()=>{
   ezReset({extra:'AN-elemental_hero_flame_wingman',hand:[],extraDeck:['AN-elemental_hero_flame_wingman'],monsters:[null,null,null]});
   duel.phase='BATTLE';render();
   await memeAnime.perform(()=>memeAnime.battle('player',-1,true,0,false));
   return {enemyMonsters:duel.enemy.monsters.map(s=>s?.id||null),enemyLp:duel.enemy.lp,enemyExtra:duel.enemy.extra?.id||null,attackerAttacked:!!duel.player.extra?.attacked};
  });
  assert.deepEqual(attack.enemyMonsters,[null,null,null],'Extra zone monster destroys the defender');
  assert.equal(attack.enemyLp,1900,'battle damage plus Flame Wingman burn applies from the Extra zone attacker');
  assert.equal(attack.attackerAttacked,true,'attacking from the Extra zone consumes the attack');
  const defence=await p.evaluate(async()=>{
   ezReset({extra:'AN-elemental_hero_flame_wingman',hand:[],extraDeck:[],monsters:[null,null,null],enemyMonster:'AN-dark_magician'});
   duel.turn='enemy';duel.phase='BATTLE';duel.enemy.monsters[0]={...monsterSlot('AN-dark_magician','atk'),uid:'foe-2'};render();
   await memeAnime.perform(()=>memeAnime.battle('enemy',0,false,null,true));
   return {extra:duel.player.extra?.id||null,grave:duel.player.grave.slice(),lp:duel.player.lp};
  });
  assert.equal(defence.extra,null,'defender in the Extra zone is destroyed normally');
  assert.ok(defence.grave.includes('AN-elemental_hero_flame_wingman'),'destroyed Extra zone monster goes to the Graveyard');
  assert.equal(defence.lp,3600,'battle damage applies when the Extra zone monster defends');
  checks.push('Extra zone monster attacks and is attacked with normal battle resolution');

  // 6. Layout: the Extra zone card and its stats stay inside the zone at phone and desktop sizes.
  for(const [width,height]of[[390,844],[667,375],[1366,768]]){
   await p.setViewport({width,height});
   await p.evaluate(()=>{ezReset({extra:'AN-elemental_hero_flame_wingman'});});
   const box=await p.$eval('#playerExtra',n=>{const r=n.getBoundingClientRect(),s=n.querySelector('.special-stats')?.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,stats:s?{x:s.x,y:s.y,right:s.right,bottom:s.bottom}:null,text:n.textContent.replace(/\s+/g,' ').trim()};});
   assert.ok(box.w>20&&box.h>20,`Extra zone must be visible at ${width}x${height}: ${JSON.stringify(box)}`);
   assert.ok(box.stats,'Extra zone stats badge renders at '+width+'x'+height);
   assert.ok(box.stats.right<=box.right+.6&&box.stats.bottom<=box.bottom+.6&&box.stats.x>=box.x-.6&&box.stats.y>=box.y-.6,`stats badge clipped at ${width}x${height}: ${JSON.stringify(box)}`);
   assert.ok(box.text.includes('2100'),'stats text visible');
   await p.screenshot({path:path.join(out,`extra-zone-${width}x${height}.png`)});
  }
  checks.push('Extra zone is visible with unclipped stats at 390x844, 667x375 and 1366x768');

  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'extra-zone-results.json'),JSON.stringify({status:'passed',checks},null,2));
  console.log(`Extra Monster Zone: ${checks.length} checks passed.`);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
