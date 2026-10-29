const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict'),vm=require('vm'),puppeteer=require('puppeteer'),pub=path.resolve(process.env.DUEL_PUBLIC_DIR||'.'),out=path.resolve('outputs/zexal-xyz');
const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://local'),f=path.resolve(pub,'.'+u.pathname);if(!f.startsWith(pub+path.sep))return r.writeHead(403).end();fs.readFile(f,async(e,b)=>{if(e)return r.writeHead(404).end();r.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'application/octet-stream');r.end(b);});});

const checks=[];
const check=(name)=>checks.push(name);

// Catalog-level checks run without a browser.
const ctx={window:{},console};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('assets/js/meme_catalog_anime.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('assets/js/meme_zexal_catalog.js','utf8'),ctx);
const cards=new Map(ctx.MEME_CARDS.map(c=>[c.id,c]));
const zexalIds=['AN-gagaga_magician','AN-gagaga_girl','AN-gagaga_child','AN-zubaba_knight','AN-gogogo_golem','AN-kagetokage','AN-ganbara_knight','AN-onomatopaira','AN-gagagabolt','AN-gagagaguard','AN-half_unbreak','AN-number_39_utopia','AN-number_17_leviathan_dragon','AN-gagaga_cowboy','AN-zubaba_general'];
for(const id of zexalIds)assert.ok(cards.has(id),'missing ZEXAL card '+id);
assert.equal(ctx.MEME_CARDS.filter(c=>zexalIds.includes(c.id)).length,zexalIds.length,'ZEXAL cards are registered once');
for(const id of ['AN-number_39_utopia','AN-number_17_leviathan_dragon','AN-gagaga_cowboy','AN-zubaba_general']){
  const c=cards.get(id);
  assert.equal(c.deck_zone,'Extra',id+' lives in the Extra Deck');
  assert.ok(c.xyz_requirement&&c.xyz_requirement.materials===2,id+' needs 2 materials');
  assert.equal(c.rank,c.xyz_requirement.rank,id+' rank matches its requirement');
  assert.equal(c.monster_category,'Xyz',id+' is an Xyz monster');
}
for(const name of ['Yuma · Kinh điển','Yuma · Utopia']){
  const main=ctx.MEME_DECK_PRESETS?.[name],extra=ctx.MEME_EXTRA_PRESETS?.[name];
  assert.ok(Array.isArray(main)&&main.length>=20&&main.length<=30,name+' main deck is legal size');
  assert.ok(Array.isArray(extra)&&extra.length>=1&&extra.length<=10,name+' extra deck is legal size');
  for(const id of [...main,...extra])assert.ok(cards.has(id),name+' references unknown card '+id);
  for(const id of extra)assert.ok(cards.get(id)?.xyz_requirement,name+' extra card '+id+' is Xyz');
}
check('Catalog: 15 ZEXAL cards, 2 legal Yuma presets, all Extra cards are Xyz with matching ranks');
vm.runInContext(fs.readFileSync('assets/js/meme_anime_heroes.js','utf8'),ctx);
const yumaHero=ctx.MEME_HEROES.find(h=>h.code==='yuma');
assert.ok(yumaHero,'Yuma hero is registered');
assert.ok(ctx.MEME_HEROES.length>=8,'at least eight heroes are registered');
assert.equal(yumaHero.id,7,'Yuma hero id is 7');
assert.equal(yumaHero.skill,'Kattobingu!','skill name');
assert.ok(ctx.MEME_DECK_PRESETS[yumaHero.primaryDeck],'primary preset exists');
assert.ok(ctx.MEME_EXTRA_PRESETS[yumaHero.primaryDeck],'primary Extra Deck exists');
assert.ok(fs.existsSync(path.resolve(pub,yumaHero.figure)),'Yuma portrait file exists');
check('Catalog: Yuma hero entry, portrait file and primary preset');

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--disable-background-timer-throttling']});
 try{
  const p=await browser.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.setViewport({width:1366,height:768});
  await p.goto((process.env.DUEL_BASE_URL||`http://127.0.0.1:${server.address().port}`)+'/memecard.html');
  await p.waitForFunction(()=>window.memeAnime?.xyzSummon&&window.memeFx);
  fs.mkdirSync(out,{recursive:true});
  await p.evaluate(()=>{
   window.zxReset=opts=>{
    opts=opts||{};
    clearTimeout(aiTimer);memeAnime.cancelChoice();window.memeOpening?.clear?.();memeFx.reset?.();closeModal();memeMusic.setEnabled?.(false);memeAnime.setAuto(opts.auto!==false);
    const P=blankSide(defaultDeck()),E2=blankSide(defaultDeck());
    P.hand=[...(opts.hand||[])];P.deck=[...(opts.deck||[])];P.extraDeck=[...(opts.extraDeck||[])];P.grave=[];P.banished=[];P.extra=null;
    P.monsters=(opts.monsters||[null,null,null]).map((id,i)=>id?{...monsterSlot(id,(opts.positions||[])[i]||'atk'),uid:'zx-p'+i,summonedRound:0}:null);
    P.spells=[null,null,null];(opts.traps||[]).forEach((t,i)=>{if(t)P.spells[i]={id:t.id,faceDown:true,setRound:t.setRound??1};});
    if(opts.extra)P.extra={...monsterSlot(opts.extra,'atk'),uid:'zx-pe'};
    E2.hand=[...(opts.enemyHand||[])];E2.deck=[];E2.extraDeck=[];E2.grave=[];E2.extra=null;
    E2.monsters=(opts.enemyMonsters||[null,null,null]).map((id,i)=>id?{...monsterSlot(id,(opts.enemyPositions||[])[i]||'atk'),uid:'zx-e'+i,summonedRound:0}:null);
    E2.spells=[null,null,null];
    duel={player:P,enemy:E2,round:opts.round??3,turn:opts.turn||'player',phase:opts.phase||'MAIN1',normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false};
    $('lobby').classList.add('hidden');$('duel').classList.remove('hidden');render();
   };
   window.zxIdle=()=>!memeAnime.busy&&!memeAnime.choosing;
   const originalBattle=memeAnime.battle;
   window.zxBattle=(owner,index,extra,targetIndex,targetExtra)=>memeAnime.perform(()=>originalBattle(owner,index,extra,targetIndex,targetExtra));
   zxReset();
  });

  // 1. Legal Xyz summon: same-Level materials become overlay units, not Graveyard cards.
  let r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia']});
   const problem=extraSummonProblem('player','AN-number_39_utopia'),options=memeAnime.xyzOptions('player','AN-number_39_utopia').length;
   const summoned=await summonExtra(0);
   return {problem,options,summoned,extra:duel.player.extra?.id||null,rank:duel.player.extra?.rank??null,xyz:!!duel.player.extra?.xyzSummoned,materials:(duel.player.extra?.materials||[]).slice(),main:duel.player.monsters.map(s=>s?.id||null),grave:duel.player.grave.slice(),extraDeck:duel.player.extraDeck.length,atk:duel.player.extra?effectiveAtk('player',duel.player.extra):0};
  });
  assert.equal(r.problem,'','legal Xyz summon has no problem');
  assert.equal(r.options,1,'exactly one material combination');
  assert.equal(r.summoned,true,'Xyz summon succeeds');
  assert.equal(r.extra,'AN-number_39_utopia','Xyz monster lands in the Extra Monster Zone');
  assert.equal(r.rank,4,'rank is stored on the slot');
  assert.equal(r.xyz,true,'slot is flagged as an Xyz summon');
  assert.deepEqual(r.materials,['AN-gagaga_magician','AN-gogogo_golem'],'materials become overlay units');
  assert.deepEqual(r.main,[null,null,null],'material zones are freed');
  assert.deepEqual(r.grave,[],'materials do not touch the Graveyard on summon');
  assert.equal(r.extraDeck,0,'one copy leaves the Extra Deck');
  assert.equal(r.atk,2500,'Utopia keeps its printed ATK');
  check('Xyz summon: 2 same-Level materials overlay, Extra zone placement, no Graveyard leak');

  // 2. Illegal Xyz summon: mismatched Levels are refused without consuming anything.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-zubaba_knight',null],extraDeck:['AN-number_39_utopia']});
   const problem=extraSummonProblem('player','AN-number_39_utopia'),options=memeAnime.xyzOptions('player','AN-number_39_utopia').length;
   const summoned=await summonExtra(0);
   return {problem,options,summoned,extra:duel.player.extra?.id||null,extraDeck:duel.player.extraDeck.length,main:duel.player.monsters.map(s=>s?.id||null)};
  });
  assert.ok(r.problem.includes('Cấp 4'),'problem explains the required Level');
  assert.equal(r.options,0,'no legal material combination');
  assert.equal(r.summoned,false,'summon is refused');
  assert.equal(r.extra,null,'nothing is placed');
  assert.equal(r.extraDeck,1,'the Extra Deck card is kept');
  assert.deepEqual(r.main,['AN-gagaga_magician','AN-zubaba_knight',null],'materials stay on the field');
  check('Xyz summon: mismatched Levels are refused with nothing consumed');

  // 3. Occupied Extra zone: the next Xyz summon uses the freed main zone.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-gagaga_cowboy'],extra:'AN-number_39_utopia'});
   const summoned=await summonExtra(0);
   return {summoned,extra:duel.player.extra?.id||null,main:duel.player.monsters.map(s=>s?.id||null)};
  });
  assert.equal(r.summoned,true,'second Xyz summon succeeds');
  assert.equal(r.extra,'AN-number_39_utopia','the Extra zone keeps its first monster');
  assert.deepEqual(r.main,['AN-gagaga_cowboy',null,null],'the new Xyz takes the first free main zone');
  check('Xyz summon: occupied Extra zone falls back to a free main monster zone');

  // 4. Leviathan Dragon: detaching a unit sends it to the Graveyard and grants +500 ATK.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-zubaba_knight','AN-gagaga_girl',null],extraDeck:['AN-number_17_leviathan_dragon']});
   await summonExtra(0);
   const before={atk:effectiveAtk('player',duel.player.extra),materials:(duel.player.extra.materials||[]).slice()};
   const activated=await activateMonsterEffect(0,true);
   return {before,activated,atk:effectiveAtk('player',duel.player.extra||{}),materials:(duel.player.extra?.materials||[]).slice(),grave:duel.player.grave.slice(),used:duel.player.extra?.effectUsedRound===duel.round};
  });
  assert.equal(r.before.atk,2000,'Leviathan starts at 2000 ATK');
  assert.equal(r.before.materials.length,2,'two overlay units after summon');
  assert.equal(r.activated,true,'Leviathan effect resolves');
  assert.equal(r.atk,2500,'detaching one unit grants +500 ATK');
  assert.equal(r.materials.length,1,'one overlay unit remains');
  assert.ok(r.grave.includes('AN-zubaba_knight')||r.grave.includes('AN-gagaga_girl'),'the detached unit goes to the Graveyard');
  assert.equal(r.used,true,'effect is marked as used this turn');
  check('Leviathan Dragon: detach to Graveyard, +500 ATK, once per turn');

  // 5. Leviathan cannot attack directly while it has no overlay units.
  r=await p.evaluate(()=>{
   zxReset({monsters:[null,null,null]});
   const withMats={...monsterSlot('AN-number_17_leviathan_dragon','atk'),materials:['AN-zubaba_knight','AN-gagaga_girl'],uid:'zx-x'};
   const without={...monsterSlot('AN-number_17_leviathan_dragon','atk'),materials:[],uid:'zx-y'};
   return {withMats:memeAnime.directAllowed('player',withMats),without:memeAnime.directAllowed('player',without)};
  });
  assert.equal(r.withMats,true,'with materials and an empty enemy field, a direct attack is legal');
  assert.equal(r.without,false,'without overlay units Leviathan cannot attack directly');
  check('Leviathan Dragon: direct attacks are blocked with no overlay units');

  // 6. An Xyz leaving the field dumps every remaining overlay unit into the Graveyard.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia']});
   await summonExtra(0);
   duel.turn='enemy';duel.enemy.hand=['AN-raigeki'];
   await memeAnime.playSpellFor('enemy',0);
   return {extra:duel.player.extra?.id||null,grave:duel.player.grave.slice()};
  });
  assert.equal(r.extra,null,'Raigeki destroys the Xyz monster');
  assert.ok(r.grave.includes('AN-number_39_utopia'),'the Xyz card itself goes to the Graveyard');
  assert.ok(r.grave.includes('AN-gagaga_magician')&&r.grave.includes('AN-gogogo_golem'),'remaining overlay units follow it');
  check('Xyz leaving the field dumps all remaining overlay units');

  // 7. Gagaga Magician changes its Level to enable a different Rank.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-zubaba_knight',null],extraDeck:['AN-number_17_leviathan_dragon']});
   const activated=await activateMonsterEffect(0);
   const level=memeAnime.levelOf(duel.player.monsters[0]);
   const options=memeAnime.xyzOptions('player','AN-number_17_leviathan_dragon').length;
   const summoned=await summonExtra(0);
   return {activated,level,options,summoned,extra:duel.player.extra?.id||null};
  });
  assert.equal(r.activated,true,'Gagaga Magician effect resolves');
  assert.equal(r.level,3,'its Level becomes the Rank available in the Extra Deck');
  assert.equal(r.options,1,'two Level 3 monsters now qualify');
  assert.equal(r.summoned,true,'Rank 3 Xyz summon succeeds');
  assert.equal(r.extra,'AN-number_17_leviathan_dragon','Leviathan is summoned');
  check('Gagaga Magician: Level override unlocks a Rank 3 Xyz summon');

  // 8. Gagaga Girl drops an opponent monster to 0 ATK.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_girl',null,null],enemyMonsters:['AN-dark_magician',null,null]});
   const activated=await activateMonsterEffect(0);
   const target=duel.enemy.monsters[0];
   return {activated,atk:effectiveAtk('enemy',target),temp:target.mangaTempAtk,round:target.mangaTempRound};
  });
  assert.equal(r.activated,true,'Gagaga Girl effect resolves');
  assert.equal(r.atk,0,'the target ATK becomes 0 for the turn');
  assert.equal(r.temp,-2500,'the difference is stored as a temporary modifier');
  assert.equal(r.round,3,'the modifier expires with the turn');
  check('Gagaga Girl: target opponent monster ATK becomes 0');

  // 9. Gagaga special summons: Girl/Child need a Gagaga, Kagetokage needs a Level 4.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician',null,null],hand:['AN-gagaga_girl']});
   const girlMode=memeAnime.specialMode('player',card('AN-gagaga_girl'));
   const girlSummoned=await memeAnime.specialSummon('player',0);
   const girlOnField=duel.player.hand.length===0&&duel.player.monsters.some(s=>s?.id==='AN-gagaga_girl');
   const kageMode=memeAnime.specialMode('player',card('AN-kagetokage'));
   zxReset({monsters:['AN-dark_magician',null,null],hand:['AN-gagaga_girl','AN-kagetokage']});
   const noGagaga=memeAnime.specialMode('player',card('AN-gagaga_girl'));
   const noFour=memeAnime.specialMode('player',card('AN-kagetokage'));
   return {girlMode,girlSummoned,girlOnField,kageMode,noGagaga,noFour};
  });
  assert.equal(r.girlMode,'gagaga','Girl sees the Gagaga on the field');
  assert.equal(r.girlSummoned,true,'Girl is special summoned');
  assert.equal(r.girlOnField,true,'Girl left the hand');
  assert.equal(r.kageMode,'kagetokage','Kagetokage sees the Level 4 monster');
  assert.equal(r.noGagaga,null,'without a Gagaga, Girl cannot special summon');
  assert.equal(r.noFour,null,'without a Level 4 monster, Kagetokage cannot special summon');
  check('Special summons: Gagaga Girl/Child and Kagetokage conditions');

  // 10. Gagaga Child counts as Level 4, enabling a Rank 4 Xyz next to a Level 4 monster.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician',null,null],hand:['AN-gagaga_child'],extraDeck:['AN-number_39_utopia']});
   const summoned=await memeAnime.specialSummon('player',0);
   const slot=duel.player.monsters.find(s=>s?.id==='AN-gagaga_child');
   const level=memeAnime.levelOf(slot),options=memeAnime.xyzOptions('player','AN-number_39_utopia').length;
   const xyz=await summonExtra(0);
   return {summoned,level,options,xyz,extra:duel.player.extra?.id||null};
  });
  assert.equal(r.summoned,true,'Child is special summoned');
  assert.equal(r.level,4,'Child is treated as Level 4');
  assert.equal(r.options,1,'Magician + Child form one combination');
  assert.equal(r.xyz,true,'Rank 4 Xyz summon succeeds');
  assert.equal(r.extra,'AN-number_39_utopia','Utopia is summoned');
  check('Gagaga Child: treated as Level 4 for a Rank 4 Xyz summon');

  // 11. Onomatopaira: discard 1, add up to 2 differently named Gagaga/Zubaba/Gogogo/Dododo monsters.
  r=await p.evaluate(async()=>{
   zxReset({hand:['AN-onomatopaira','AN-gagaga_magician'],deck:['AN-gagaga_girl','AN-zubaba_knight','AN-dark_magician']});
   const resolved=await memeAnime.playSpellFor('player',0);
   return {resolved,hand:duel.player.hand.slice(),grave:duel.player.grave.slice(),deck:duel.player.deck.slice()};
  });
  assert.equal(r.resolved,true,'Onomatopaira resolves');
  assert.equal(r.hand.length,2,'two monsters are added to the hand');
  assert.ok(r.hand.includes('AN-gagaga_girl')&&r.hand.includes('AN-zubaba_knight'),'the searched monsters are correct');
  assert.ok(r.grave.includes('AN-onomatopaira')&&r.grave.includes('AN-gagaga_magician'),'the spell and the discarded card go to the Graveyard');
  assert.ok(r.deck.includes('AN-dark_magician'),'unrelated cards stay in the Deck');
  check('Onomatopaira: discard 1, search 2 differently named monsters');

  // 12. Gagagabolt: requires a Gagaga on the field and destroys one opponent card.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician',null,null],hand:['AN-gagagabolt'],enemyMonsters:['AN-dark_magician',null,null]});
   const resolved=await memeAnime.playSpellFor('player',0);
   return {resolved,enemy:duel.enemy.monsters.map(s=>s?.id||null),grave:duel.enemy.grave.slice()};
  });
  assert.equal(r.resolved,true,'Gagagabolt resolves');
  assert.deepEqual(r.enemy,[null,null,null],'the target monster is destroyed');
  assert.ok(r.grave.includes('AN-dark_magician'),'the destroyed card goes to the Graveyard');
  check('Gagagabolt: destroys an opponent card while a Gagaga is face-up');

  // 13. Gagagaguard: effect destruction is blocked for the rest of the turn.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician',null,null],traps:[{id:'AN-gagagaguard',setRound:1}]});
   const activated=await activateTrap(0);
   const shield=duel.player.effectShieldRound;
   duel.turn='enemy';duel.phase='MAIN1';duel.enemy.hand=['AN-raigeki'];
   await memeAnime.playSpellFor('enemy',0);
   return {activated,shield,alive:duel.player.monsters.map(s=>s?.id||null),grave:duel.enemy.grave.slice()};
  });
  assert.equal(r.activated,true,'Gagagaguard activates');
  assert.equal(r.shield,3,'the effect shield is armed for this turn');
  assert.deepEqual(r.alive,['AN-gagaga_magician',null,null],'the Gagaga survives effect destruction');
  assert.ok(r.grave.includes('AN-raigeki'),'the opposing spell resolved and went to the Graveyard');
  check('Gagagaguard: blocks effect destruction for the turn');

  // 14. Half Unbreak: battle damage is halved and the monster survives the battle.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician',null,null],enemyMonsters:['AN-blue_eyes_white_dragon',null,null],traps:[{id:'AN-half_unbreak',setRound:1}]});
   const activated=await activateTrap(0);
   const marked=duel.player.monsters[0].halfUnbreakRound;
   duel.phase='BATTLE';duel.turn='enemy';
   await zxBattle('enemy',0,false,0,false);
   return {activated,marked,lp:duel.player.lp,alive:duel.player.monsters.map(s=>s?.id||null)};
  });
  assert.equal(r.activated,true,'Half Unbreak activates');
  assert.equal(r.marked,3,'the chosen monster is marked for this turn');
  assert.equal(r.alive[0],'AN-gagaga_magician','the monster is not destroyed by battle');
  assert.equal(r.lp,3250,'1500 battle damage is halved to 750');
  check('Half Unbreak: halves battle damage and prevents battle destruction');

  // 15. Gogogo Golem survives the first battle destruction each turn, damage still applies.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gogogo_golem',null,null],enemyMonsters:['AN-blue_eyes_white_dragon',null,null]});
   duel.phase='BATTLE';duel.turn='enemy';
   await zxBattle('enemy',0,false,0,false);
   return {lp:duel.player.lp,alive:duel.player.monsters.map(s=>s?.id||null),guard:duel.player.monsters[0]?.gogogoRound};
  });
  assert.equal(r.lp,2800,'1200 battle damage is still taken');
  assert.equal(r.alive[0],'AN-gogogo_golem','the first battle destruction is blocked');
  assert.equal(r.guard,3,'the guard is flagged once per turn');
  check('Gogogo Golem: first battle destruction each turn is blocked');

  // 16. Ganbara Knight flips the attacker to Defense when destroyed.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-ganbara_knight',null,null],enemyMonsters:['AN-blue_eyes_white_dragon',null,null]});
   duel.phase='BATTLE';duel.turn='enemy';
   await zxBattle('enemy',0,false,0,false);
   return {alive:duel.player.monsters.map(s=>s?.id||null),grave:duel.player.grave.slice(),attacker:duel.enemy.monsters[0]?.position,lp:duel.player.lp};
  });
  assert.equal(r.alive[0],null,'Ganbara is destroyed');
  assert.ok(r.grave.includes('AN-ganbara_knight'),'it goes to the Graveyard');
  assert.equal(r.attacker,'def','the attacking monster is switched to Defense');
  assert.equal(r.lp,1000,'3000 battle damage applies (Ganbara has 0 ATK)');
  check('Ganbara Knight: flips the attacker to Defense on destruction');

  // 17. Zubaba Knight destroys a Defense monster without dealing battle damage.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-zubaba_knight',null,null],enemyMonsters:['AN-blue_eyes_white_dragon',null,null],enemyPositions:['def',null,null],phase:'BATTLE'});
   await zxBattle('player',0,false,0,false);
   return {enemy:duel.enemy.monsters.map(s=>s?.id||null),grave:duel.enemy.grave.slice(),lp:duel.player.lp};
  });
  assert.equal(r.enemy[0],null,'the Defense monster is destroyed');
  assert.ok(r.grave.includes('AN-blue_eyes_white_dragon'),'it goes to the Graveyard');
  assert.equal(r.lp,4000,'no battle damage is taken');
  check('Zubaba Knight: destroys a Defense monster without battle damage');

  // 18. Gagaga Cowboy: ATK position gains 1000 ATK, Defense position burns 800.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-gagaga_cowboy']});
   await summonExtra(0);
   const activated=await activateMonsterEffect(0,true);
   const atk=effectiveAtk('player',duel.player.extra);
   const boostMaterials=(duel.player.extra.materials||[]).length;
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-gagaga_cowboy']});
   await summonExtra(0);
   duel.player.extra.position='def';
   const burned=await activateMonsterEffect(0,true);
   return {activated,atk,boostMaterials,burned,enemyLp:duel.enemy.lp,burnMaterials:(duel.player.extra.materials||[]).length};
  });
  assert.equal(r.activated,true,'Cowboy ATK-mode effect resolves');
  assert.equal(r.atk,2500,'1500 + 1000 ATK');
  assert.equal(r.boostMaterials,1,'one overlay unit is detached');
  assert.equal(r.burned,true,'Cowboy Defense-mode effect resolves');
  assert.equal(r.enemyLp,3200,'800 burn damage is dealt');
  assert.equal(r.burnMaterials,1,'one overlay unit is detached');
  check('Gagaga Cowboy: +1000 ATK in Attack position, 800 burn in Defense position');

  // 19. Zubaba General: discard a Warrior to gain its ATK.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-zubaba_general'],hand:['AN-zubaba_knight']});
   await summonExtra(0);
   const activated=await activateMonsterEffect(0,true);
   return {activated,atk:effectiveAtk('player',duel.player.extra),materials:(duel.player.extra?.materials||[]).length,hand:duel.player.hand.slice(),grave:duel.player.grave.slice()};
  });
  assert.equal(r.activated,true,'Zubaba General effect resolves');
  assert.equal(r.atk,3600,'2000 + 1600 from the discarded Warrior');
  assert.equal(r.materials,1,'one overlay unit is detached');
  assert.deepEqual(r.hand,[],'the Warrior leaves the hand');
  assert.ok(r.grave.includes('AN-zubaba_knight'),'the Warrior goes to the Graveyard');
  check('Zubaba General: detach and discard a Warrior to gain its ATK');

  // 20. Utopia negates an attack by detaching an overlay unit.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia'],enemyMonsters:['AN-blue_eyes_white_dragon',null,null],positions:['atk','def','atk']});
   await summonExtra(0);
   duel.phase='BATTLE';duel.turn='enemy';
   await zxBattle('enemy',0,false,null,true);
   return {lp:duel.player.lp,extra:duel.player.extra?.id||null,materials:(duel.player.extra?.materials||[]).length,grave:duel.player.grave.slice(),attacked:!!duel.enemy.monsters[0]?.attacked};
  });
  assert.equal(r.extra,'AN-number_39_utopia','Utopia survives the attack');
  assert.equal(r.lp,4000,'the attack is negated so no damage is taken');
  assert.equal(r.materials,1,'exactly one overlay unit is detached');
  assert.ok(!r.grave.includes('AN-number_39_utopia'),'Utopia does not leave the field');
  assert.equal(r.attacked,true,'the canceled attack still counts as used');
  check('Number 39 Utopia: detaches a unit to negate an attack');

  // 21. Extra Deck UI labels Xyz cards with Rank and gates the summon button.
  r=await p.evaluate(()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia']});
   openPile('player','extra');
   const ready=document.querySelector('.pile-card[data-card-id="AN-number_39_utopia"]');
   const readyText=ready?ready.textContent.replace(/\s+/g,' ').trim():'';
   const readyLabel=ready?.querySelector('button:last-of-type')?.textContent?.trim()||'';
   zxReset({monsters:['AN-dark_magician',null,null],extraDeck:['AN-number_39_utopia']});
   openPile('player','extra');
   const locked=document.querySelector('.pile-card[data-card-id="AN-number_39_utopia"]');
   const lockedLabel=locked?.querySelector('button:last-of-type')?.textContent?.trim()||'';
   closeModal();pileView=null;
   return {readyText,readyLabel,lockedLabel};
  });
  assert.ok(r.readyText.includes('R4'),'the pile shows Rank 4');
  assert.ok(r.readyText.includes('2500/2000'),'the pile shows ATK/DEF');
  assert.equal(r.readyLabel,'✦ XYZ','the summon button is enabled with legal materials');
  assert.ok(r.lockedLabel.includes('Chưa đủ điều kiện'),'the summon button is disabled without legal materials');
  check('Extra Deck UI: Rank label, stats and Xyz summon gating');

  // 22. Yuma hero: skill refuels an Xyz with a Level-4 Graveyard monster.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia'],deck:['AN-onomatopaira']});
   await summonExtra(0);
   duel.player.heroId=7;duel.player.grave.push('AN-gogogo_golem');
   const problem=heroSkillProblem('player');
   const used=await useHeroSkill();
   return {problem,used,skillUsed:duel.player.skillUsed,materials:(duel.player.extra?.materials||[]).slice(),grave:duel.player.grave.slice(),hand:duel.player.hand.slice(),deck:duel.player.deck.slice(),logs:duel.logs.join(' | ')};
  });
  assert.equal(r.problem,'','Kattobingu is legal with an Xyz and a Level-4 Graveyard monster');
  assert.equal(r.used,true,'the skill resolves');
  assert.equal(r.skillUsed,true,'the skill is marked used');
  assert.deepEqual(r.materials,['AN-gagaga_magician','AN-gogogo_golem','AN-gogogo_golem'],'the Graveyard monster becomes a third overlay unit');
  assert.deepEqual(r.grave,[],'the attached monster leaves the Graveyard');
  assert.deepEqual(r.hand,['AN-onomatopaira'],'Utopia draws one card');
  assert.deepEqual(r.deck,[],'the draw comes from the top of the deck');
  assert.ok(r.logs.includes('Kattobingu!'),'the log names the skill');
  check('Yuma skill Kattobingu: attaches a Level-4 Grave monster and draws with Utopia');

  // 23. A non-Utopia Xyz gains the unit but no draw.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-gagaga_cowboy'],deck:['AN-onomatopaira']});
   await summonExtra(0);
   duel.player.heroId=7;duel.player.grave.push('AN-gogogo_golem','AN-gagaga_girl');
   const used=await useHeroSkill();
   return {used,target:duel.player.extra?.id||null,materials:(duel.player.extra?.materials||[]).slice(),grave:duel.player.grave.slice(),hand:duel.player.hand.slice()};
  });
  assert.equal(r.target,'AN-gagaga_cowboy','Gagaga Cowboy is the Xyz target');
  assert.equal(r.used,true,'the skill resolves on any Xyz');
  assert.deepEqual(r.materials,['AN-gagaga_magician','AN-gogogo_golem','AN-gogogo_golem'],'the first Level-4 monster is attached');
  assert.deepEqual(r.grave,['AN-gagaga_girl'],'only the attached copy leaves the Graveyard');
  assert.deepEqual(r.hand,[],'only Utopia draws a card');
  check('Yuma skill: any Xyz gains a unit, only Utopia draws');

  // 24. Kattobingu gating: MAIN, once per duel, Xyz and Level-4 Grave unit required.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician',null,null]});
   duel.player.heroId=7;duel.player.grave.push('AN-zubaba_knight');
   const noXyz=heroSkillProblem('player');
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia']});
   duel.player.heroId=7;
   await summonExtra(0);
   const noUnit=heroSkillProblem('player');
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia']});
   duel.player.heroId=7;duel.player.grave.push('AN-blue_eyes_white_dragon');
   await summonExtra(0);
   const wrongLevel=heroSkillProblem('player');
   return {noXyz,noUnit,wrongLevel};
  });
  assert.ok(r.noXyz.includes('XYZ'),'an Xyz monster is required');
  assert.ok(r.noUnit.includes('Cấp 4'),'a Level-4 Graveyard monster is required');
  assert.ok(r.wrongLevel.includes('Cấp 4'),'a Level-8 Graveyard monster is not a valid unit');
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia'],deck:['AN-onomatopaira']});
   await summonExtra(0);
   duel.player.heroId=7;duel.player.grave.push('AN-gogogo_golem');
   await useHeroSkill();
   const second=heroSkillProblem('player');
   duel.phase='BATTLE';const inBattle=heroSkillProblem('enemy');
   return {second,inBattle};
  });
  assert.ok(r.second.includes('Đã dùng'),'the skill is once per duel');
  assert.equal(r.inBattle,'Dùng trong MAIN của bạn.','the skill needs the MAIN phase');
  check('Yuma skill gating: MAIN only, once per duel, Xyz plus Level-4 unit required');

  // 25. The refueled unit can fuel Utopia's negate.
  r=await p.evaluate(async()=>{
   zxReset({monsters:['AN-gagaga_magician','AN-gogogo_golem',null],extraDeck:['AN-number_39_utopia'],deck:['AN-onomatopaira'],enemyMonsters:['AN-blue_eyes_white_dragon',null,null],positions:['atk','def','atk']});
   await summonExtra(0);
   duel.player.heroId=7;duel.player.grave.push('AN-gogogo_golem');
   await useHeroSkill();
   duel.phase='BATTLE';duel.turn='enemy';
   await zxBattle('enemy',0,false,null,true);
   return {lp:duel.player.lp,materials:(duel.player.extra?.materials||[]).length};
  });
  assert.equal(r.lp,4000,'the attack is still negated');
  assert.equal(r.materials,2,'one of the three units is spent on the negate');
  check('Yuma skill: the attached unit fuels a later Utopia negate');

  // 26. The Yuma hero registers with its skill, preset and custom portrait.
  r=await p.evaluate(()=>{
   const h=HEROES[7],tile=document.querySelector('#heroRoster .hero-tag[data-hero="7"]');
   return {count:HEROES.length,code:h.code,skill:h.skill,title:h.title,group:h.group,deck:h.primaryDeck,preset:!!MEME_DECK_PRESETS[h.primaryDeck],extra:!!MEME_EXTRA_PRESETS[h.primaryDeck],tiles:document.querySelectorAll('#heroRoster .hero-tag').length,tileText:tile?tile.textContent.replace(/\s+/g,' ').trim():'',figureClass:tile?.querySelector('.hero-figure')?.className||'',figureArt:getComputedStyle(tile.querySelector('.hero-figure')).backgroundImage,skillProblem:heroSkillProblem('player')};
  });
  assert.ok(r.count>=8,'at least eight heroes are registered');
  assert.equal(r.code,'yuma','the eighth hero is Yuma');
  assert.equal(r.skill,'Kattobingu!','the skill name matches');
  assert.equal(r.preset,true,'the primary preset exists');
  assert.equal(r.extra,true,'the primary Extra Deck exists');
  assert.ok(r.tiles>=8,'the roster shows every hero');
  assert.ok(r.tileText.includes('Yuma Tsukumo')&&r.tileText.includes('Kattobingu!'),'the roster tile shows name and skill');
  assert.ok(r.figureClass.includes('hero-figure-yuma'),'the roster tile uses the custom portrait class');
  assert.ok(r.figureArt.includes('yuma-v1.png'),'the roster tile loads the Yuma portrait');
  assert.ok(r.skillProblem.length>0,'the skill is gated outside a duel');
  check('Yuma hero: registration, roster tile, custom portrait, skill and preset');

  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'zexal-xyz-results.json'),JSON.stringify({status:'passed',checks},null,2));
  console.log(`ZEXAL / Yuma deck: ${checks.length} checks passed.`);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
