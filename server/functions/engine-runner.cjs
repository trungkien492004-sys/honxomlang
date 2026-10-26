const http=require('http'),fs=require('fs'),path=require('path');
let server,browserPromise;
const bundle=JSON.parse(fs.readFileSync(path.join(__dirname,'engine/bundle.json'),'utf8'));
async function browser(){
 if(!browserPromise)browserPromise=(async()=>{
  const puppeteer=require('puppeteer-core'),chromium=require('@sparticuz/chromium');
  server=http.createServer((req,res)=>{const key=new URL(req.url,'http://localhost').pathname,body=bundle.files[key];if(body){res.setHeader('Content-Type',key.endsWith('.js')?'text/javascript':'text/html');res.end(body);}else res.writeHead(204).end();});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const executablePath=process.env.PUPPETEER_EXECUTABLE_PATH||await chromium.executablePath();
  return puppeteer.launch({headless:true,executablePath,args:process.env.PUPPETEER_EXECUTABLE_PATH?['--no-sandbox']:chromium.args});
 })();return browserPromise;
}
async function run(input){
 const b=await browser(),page=await b.newPage();
 try{
  await page.setRequestInterception(true);
  page.on('request',req=>req.url().startsWith(`http://127.0.0.1:${server.address().port}/`)?req.continue():req.abort());
  await page.evaluateOnNewDocument(()=>{window.setInterval=()=>0;});
  await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.memePhase2);
  return await page.evaluate(async input=>{
   let seed=input.seed>>>0;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   render=()=>{};memeMusic.setEnabled(false);memePhase2.simulation=true;memeAnime.setAuto(false);
   memeCardMotion.record=()=>{};memeCardMotion.flush=async()=>{};memeTurnClock.expired=()=>false;memeTurnClock.remaining=()=>60000;
   window.memeOnlineIsPlaying=()=>true;window.memeRevivalChoice=null;window.memeDecision=null;window.memeServerMode=true;
   let committed=false;
   memeFx.resolveCard=async(event,fn)=>{if(event.kind!=='attack-intent')committed=true;await fn?.();return true;};
   memeFx.attack=async(a,b,c,d,e,fn)=>{committed=true;await fn?.();return true;};
   finish=(winner,reason)=>{duel.finished=true;duel.winner=winner;duel.finishReason=reason;};
   if(input.kind==='start'){
    duel={player:blankSide(input.players[0].deck,input.players[0].extra,input.players[0].heroId),enemy:blankSide(input.players[1].deck,input.players[1].extra,input.players[1].heroId),turn:input.first===0?'player':'enemy',phase:'MAIN1',round:1,normalSummoned:false,mode:null,pending:null,selected:null,logs:[],finished:false,animeMatchId:input.matchId};
    for(let i=0;i<4;i++){draw('player');draw('enemy');}
    duel.player.p2Policy=input.players[0].policy;duel.enemy.p2Policy=input.players[1].policy;
    return {state:memeSnapshot()};
   }
   const actor=input.actor,mirror=actor===1;
   duel=mirror?memeMirror(input.state):JSON.parse(JSON.stringify(input.state));
   const isActorTurn=duel.turn==='player';let cursor=0;
   const publicOption=(o,key,n)=>({key,id:o.hidden?null:o.id||null,hidden:!!o.hidden,label:o.label||null,zone:o.zone||null,position:o.position||null,location:o.location||(o.zone==='hand'?'Trên tay':o.zone==='grave'?'Trong Mộ':o.zone==='deck'?'Trong Deck':o.zone==='field'?'Trên sân':o.zone==='extra'?'Extra Deck':o.name?`${o.name===n?'Sân của bạn':'Sân đối thủ'} · Ô ${o.index+1}`:''),priorityScore:o.priorityScore??null});
   window.memeServerChoice=(n,title,options,config)=>{
    if(config.reaction)return memePhase2Tactics.autoTrap(options);
    const step=cursor++;
    if(step<(input.decisions||[]).length){const key=input.decisions[step];if(config.multiple)return Array.isArray(key)&&new Set(key).size===key.length&&key.every(k=>Number.isInteger(k)&&k>=0&&k<options.length)?key.map(k=>options[k]):null;return Number.isInteger(key)&&key>=0&&key<options.length?options[key]:null;}
    if(input.autoResolve)return committed?config.multiple?config.fallbackKeys?.map(k=>options[k])||null:memePhase2.choose(n,title,options,{cheap:!!config.cheap,reaction:!!config.reaction}):null;
    const e=new Error('Choice required');e.code='CHOICE_REQUIRED';e.choice={owner:n==='player'?actor:1-actor,title,options:options.map((o,key)=>publicOption(o,key,n)),optional:!!config.optional,reaction:!!config.reaction,text:config.text||'',step,...(config.multiple?{multiple:{min:config.min,max:config.max,validSets:config.validSets,levelAtLeast:config.levelAtLeast,requireField:config.requireField}}:{})};throw e;
   };
   const action=input.action||{};
   const index=value=>{if(!Number.isInteger(value)||value<0||value>40)throw Error('Invalid card index');return value;};
   const requireTurn=()=>{if(!isActorTurn||duel.finished)throw Error('Not your turn');};
   const main=()=>{requireTurn();if(!['MAIN1','MAIN2'].includes(duel.phase))throw Error('Main phase required');};
   try{
    if(action.type==='summon'){
     main();const i=index(action.index),c=card(duel.player.hand[i]);if(!c)throw Error('Missing card');
     let need=c.tribute_count??(c.stars>=7?2:c.stars>=5?1:0);
     if(c.archetype==='Jaden'&&duel.player.grave.includes('AN-elemental_hero_necroshade')&&!duel.player.necroUsed)need=0;
     const selected=[];
     if(need){const options=memeRules.entries('player').filter(e=>!e.extra&&!e.slot.noTribute).map(e=>({...e,id:e.slot.id,name:'player',zone:'field'})),picked=await memeAnime.chooseMany('player',`Chọn ${need} quái hiến tế`,options,{min:need,max:need,cheap:true});if(!picked)return {state:input.state,cancelled:true};selected.push(...picked.map(e=>e.index));}
     await memeAnime.perform(()=>memeAnime.normalSummon('player',i,action.position==='def_down'?'def_down':'atk',selected));
    }else if(action.type==='spell'){main();await memeAnime.perform(()=>memeAnime.playSpellFor('player',index(action.index)));}
    else if(action.type==='setSpell'){main();await memeSetSpell(index(action.index));}
    else if(action.type==='setTrap'){main();await setTrap(index(action.index));}
    else if(action.type==='flipSpell'){main();await memeActivateSetSpell(index(action.index));}
    else if(action.type==='trap'){requireTurn();await activateTrap(index(action.index));}
    else if(action.type==='monster'){main();await activateMonsterEffect(action.extra?-1:index(action.index),!!action.extra);}
    else if(action.type==='special'){main();await memeAnime.perform(()=>memeAnime.specialSummon('player',index(action.index)));}
    else if(action.type==='handEffect'){main();const c=card(duel.player.hand[index(action.index)]);if(!c?.hand_action)throw Error('No hand effect');await memeAnime.perform(()=>memeAnime.resolveEffect('player',c,{source:null}));}
    else if(action.type==='extra'){main();await summonExtra(index(action.index));}
    else if(action.type==='skill'){main();await useHeroSkill('player');}
    else if(action.type==='position'){
     main();const slot=action.extra?duel.player.extra:duel.player.monsters[index(action.index)];
     if(!slot||slot.summonedRound>=duel.round||slot.changedPositionRound===duel.round||slot.attacksUsed||['player','enemy'].flatMap(n=>memeRules.entries(n)).some(e=>e.slot!==slot&&e.slot.position!=='def_down'&&memeRules.trait(e.slot,'restrict')))throw Error('Cannot change position');
     await memeAnime.perform(()=>memeAnime.changePosition('player',action.index,!!action.extra));
    }else if(action.type==='attack'){
     requireTurn();if(duel.phase!=='BATTLE'||duel.round<=1)throw Error('Battle not available');
     const i=action.extra?-1:index(action.index),slot=action.extra?duel.player.extra:duel.player.monsters[i];if(!memeRules.canAttack(slot))throw Error('Monster cannot attack');
     const targets=memeRules.entries('enemy').map(e=>({...e,id:e.slot.id,name:'enemy',zone:'field',hidden:e.slot.position==='def_down'}));let target=null;
     if(targets.length){if(memeAnime.directAllowed('player',slot))targets.push({id:slot.id,label:'Tấn công trực tiếp',direct:true});target=await memeAnime.choose('player','Chọn mục tiêu tấn công',targets);if(!target)return {state:input.state,cancelled:true};}
     await memeAnime.perform(()=>memeAnime.battle('player',i,!!action.extra,target?.direct?null:target?.index??null,target?.direct?false:!!target?.extra));
    }else if(['nextPhase','endTurn'].includes(action.type)){
     requireTurn();if(action.type==='nextPhase'&&duel.round>1&&duel.phase!=='MAIN2')duel.phase=duel.phase==='MAIN1'?'BATTLE':'MAIN2';
     else await memeAnime.perform(async()=>{await memeAnime.endTurn('player');if(duel.finished)return;duel.turn='enemy';duel.phase='MAIN1';duel.round++;duel.normalSummoned=false;memeRules.beginTurn('enemy');draw('enemy');});
    }else throw Error('Unknown action');
    return {state:mirror?memeMirror(memeSnapshot()):memeSnapshot()};
   }catch(e){if(e.code==='CHOICE_REQUIRED')return {choice:e.choice};throw e;}
  },input);
 }finally{await page.close();}
}
async function close(){if(browserPromise){const b=await browserPromise;await b.close();browserPromise=null;}if(server)server.close();}
module.exports={run,close,version:bundle.version,hash:bundle.hash};
