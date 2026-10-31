const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'dist'),out=path.join(root,'outputs/progression');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);if(process.env.DEBUG_ERRORS)console.error(e.stack);});
 await page.setViewport({width:1366,height:768});
 await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('rank-promo-dismissed','1');sessionStorage.setItem('rank-promo-dismissed','1');}catch{}});
 await page.goto(base+'/memecard.html');
 await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress,{timeout:30000});

 const fresh=await page.evaluate(()=>({
  migrated:memeProgress.state.migrated,level:memeProgress.state.level,xu:memeProgress.state.xu,ticket:memeProgress.state.tickets.p2,
  ownsStarter:defaultDeck().every(id=>memeProgress.owns(id)),ownsExtra:defaultExtraDeck().every(id=>memeProgress.owns(id)),
  ownsBlue:memeProgress.owns('AN-blue_eyes_white_dragon'),ownedCount:Object.keys(memeProgress.state.owned).length,totalCards:CARDS.length,
  starterProblem:deckProblem(defaultDeck(),defaultExtraDeck())||ownedProblem(defaultDeck(),defaultExtraDeck()),
  unlockedAll:CARDS.every(c=>memeProgress.owns(c.id))
 }));
 assert.equal(fresh.migrated,false,'fresh account is not a legacy migration');
 assert.equal(fresh.level,1);assert.equal(fresh.xu,0);assert.equal(fresh.ticket,0);
 assert.ok(fresh.ownsStarter,'starter main deck is owned');assert.ok(fresh.ownsExtra,'starter extra deck is owned');
 assert.equal(fresh.ownsBlue,false,'non-starter card stays locked');assert.equal(fresh.unlockedAll,false,'collection is not fully unlocked');
 assert.ok(fresh.ownedCount>0&&fresh.ownedCount<fresh.totalCards,'only starter cards are owned');
 assert.equal(fresh.starterProblem,'','starter deck is playable');

 await page.evaluate(()=>openDeckBuilder());
 await page.waitForSelector('#deckGrid .deck-item');
 const builder=await page.evaluate(()=>{
  const locked=document.querySelectorAll('#deckGrid .deck-item.locked').length,total=document.querySelectorAll('#deckGrid .deck-item').length;
  const blue=document.querySelector('#deckGrid [data-card-id="AN-blue_eyes_white_dragon"]');
  return {locked,total,results:$('deckResults').textContent,blueLocked:blue?.classList.contains('locked'),bluePlusDisabled:blue?.querySelector('[data-action=plus]').disabled,blueLabel:blue?.querySelector('.deck-lock')?.textContent||''};
 });
 assert.ok(builder.locked>0&&builder.locked<builder.total,'locked cards are marked in the library');
 assert.match(builder.results,/chưa sở hữu/);assert.equal(builder.blueLocked,true);assert.equal(builder.bluePlusDisabled,true);assert.match(builder.blueLabel,/Chưa sở hữu/);
 await page.screenshot({path:path.join(out,'builder-locked-1366x768.png')});
 await page.setViewport({width:390,height:844});await page.screenshot({path:path.join(out,'builder-locked-390x844.png')});await page.setViewport({width:1366,height:768});

 const preset=await page.evaluate(()=>{
  const before=JSON.stringify(deckDraft);
  const name=Object.keys(MEME_DECK_PRESETS).find(n=>ownedProblem([...MEME_DECK_PRESETS[n]],[...(MEME_EXTRA_PRESETS[n]||[])]));
  const select=$('deckPreset');select.value=name;select.dispatchEvent(new Event('change'));
  const result={name,before,after:JSON.stringify(deckDraft),toast:document.querySelector('.mini-action-toast')?.textContent||'',value:select.value};
  document.querySelectorAll('.mini-action-toast').forEach(n=>n.remove());return result;
 });
 assert.ok(preset.name,'a preset with unowned cards exists');assert.equal(preset.before,preset.after,'preset with unowned cards is rejected');assert.match(preset.toast,/chưa sở hữu/i);assert.equal(preset.value,'');

 const gate=await page.evaluate(()=>{
  const key='xom-arcana-decks-anime-v1',before=localStorage.getItem(key);
  deckDraft.cards=[...defaultDeck()];deckDraft.cards[deckDraft.cards.length-1]='AN-blue_eyes_white_dragon';deckDraft.extra=[...defaultExtraDeck()];
  renderDeckBuilder();
  const saveDisabled=$('saveDeck').disabled,status=$('deckStatus').textContent;
  commitDeckDraft();
  return {before,after:localStorage.getItem(key),saveDisabled,status,stillBlue:deckDraft.cards.includes('AN-blue_eyes_white_dragon')};
 });
 assert.equal(gate.saveDisabled,true,'save is blocked while a card is unowned');assert.match(gate.status,/chưa sở hữu/);assert.equal(gate.before,gate.after,'blocked save writes nothing');assert.equal(gate.stillBlue,true);

 const granted=await page.evaluate(()=>{memeProgress.grant('AN-blue_eyes_white_dragon');renderDeckBuilder();return {saveDisabled:$('saveDeck').disabled,status:$('deckStatus').textContent,locked:document.querySelector('#deckGrid [data-card-id="AN-blue_eyes_white_dragon"]').classList.contains('locked')};});
 assert.equal(granted.saveDisabled,false,'granting the card unlocks the deck');assert.equal(granted.status.includes('chưa sở hữu'),false);assert.equal(granted.locked,false);

 await page.click('#saveDeck');
 const saved=await page.evaluate(()=>({active:deckList.includes('AN-blue_eyes_white_dragon'),extra:extraDeckList.every(id=>memeProgress.owns(id)),library:JSON.parse(localStorage.getItem('xom-arcana-decks-anime-v1')||'null'),copies:memeProgress.copies('AN-blue_eyes_white_dragon'),hidden:$('modal').classList.contains('hidden')}));
 assert.ok(saved.active,'granted deck saves and becomes active');assert.ok(saved.library?.decks?.some(d=>d.cards.includes('AN-blue_eyes_white_dragon')));assert.equal(saved.copies,1);assert.equal(saved.hidden,true);

 await page.reload();await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress);
 const persisted=await page.evaluate(()=>({owns:memeProgress.owns('AN-blue_eyes_white_dragon'),active:deckList.includes('AN-blue_eyes_white_dragon'),level:memeProgress.state.level}));
 assert.ok(persisted.owns,'collection persists across reloads');assert.ok(persisted.active,'saved deck persists');assert.equal(persisted.level,1);

 const deckGrant=await page.evaluate(()=>{memeProgress.grantDeck(['AN-kuriboh','AN-kuriboh','AN-kuriboh'],['AN-cyber_dragon']);return {kuriboh:memeProgress.copies('AN-kuriboh'),cyber:memeProgress.copies('AN-cyber_dragon')};});
 assert.equal(deckGrant.kuriboh,3,'grantDeck raises duplicate copies');assert.equal(deckGrant.cyber,1,'grantDeck covers extra deck cards');

 await page.evaluate(()=>{
  const main=[...defaultDeck()];main[main.length-1]='AN-blue_eyes_white_dragon';
  const extra=[...defaultExtraDeck()];
  const legacyCards=[...defaultDeck()].slice(0,20);legacyCards[0]='AN-cyber_dragon';
  localStorage.clear();localStorage.setItem('rank-promo-dismissed','1');
  localStorage.setItem('xom-arcana-main-anime-v1',JSON.stringify(main));
  localStorage.setItem('xom-arcana-extra-anime-v1',JSON.stringify(extra));
  localStorage.setItem('xom-arcana-decks-anime-v1',JSON.stringify({activeId:'legacy',decks:[{id:'legacy',name:'Bộ cũ',cards:legacyCards,extra}]}));
 });
 await page.reload();await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress);
 const migrated=await page.evaluate(()=>({
  migrated:memeProgress.state.migrated,level:memeProgress.state.level,xu:memeProgress.state.xu,ticket:memeProgress.state.tickets.p2,
  blue:memeProgress.owns('AN-blue_eyes_white_dragon'),cyber:memeProgress.owns('AN-cyber_dragon'),
  active:deckList.includes('AN-cyber_dragon'),extraOk:extraDeckList.every(id=>memeProgress.owns(id)),
  problem:deckProblem(deckList,extraDeckList)||ownedProblem(deckList,extraDeckList),
  ownedCount:Object.keys(memeProgress.state.owned).length,created:memeProgress.state.createdAt,updated:memeProgress.state.updatedAt
 }));
 assert.equal(migrated.migrated,true,'legacy deck triggers migration A');assert.equal(migrated.level,5);assert.equal(migrated.xu,1000);assert.equal(migrated.ticket,1);
 assert.ok(migrated.blue&&migrated.cyber,'cards from saved deck and deck library are granted');assert.ok(migrated.active);assert.ok(migrated.extraOk);assert.equal(migrated.problem,'');
 assert.ok(migrated.updated>=migrated.created);
 await page.evaluate(()=>openDeckBuilder());await page.waitForSelector('#deckGrid .deck-item');
 const afterMigration=await page.evaluate(()=>({locked:document.querySelectorAll('#deckGrid .deck-item.locked').length,saveDisabled:$('saveDeck').disabled,status:$('deckStatus').textContent}));
 assert.ok(afterMigration.locked>0,'non-legacy cards remain locked after migration');
 await page.screenshot({path:path.join(out,'builder-migrated-1366x768.png')});

 await page.reload();await page.waitForFunction(()=>window.memeCardMotion&&window.memeProgress);
 const twice=await page.evaluate(()=>({xu:memeProgress.state.xu,ticket:memeProgress.state.tickets.p2,level:memeProgress.state.level}));
 assert.deepEqual(twice,{xu:1000,ticket:1,level:5},'migration runs once');

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log('P0: starter-only collection, locked library badges + disabled add/save, preset denial, grant/persist, legacy deck+library migration A (Lv5, 1000 Xu, 1 Pack II ticket) once only, no page errors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
