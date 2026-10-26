// Visual effects for Meme Xóm. Game state remains owned by meme_game.js.
(() => {
  const layer = document.getElementById('memeFxLayer');
  const skipButton = document.getElementById('memeSkipFx');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new Set();
  const animations = new Set();
  let busy = false;
  let skipping = false;
  let epoch = 0;
  let previous = null;
  let soundEnabled=localStorage.getItem('meme-sound')!=='off',audioContext=null;
  const attackColors={Hỏa:'#ff8159',Thủy:'#63eaff',Phong:'#8fffb9',Quang:'#ffe89a',Ám:'#d18cff',Cơ:'#9cd7ff'};
  const shownLp = { player: null, enemy: null };
  const targetLp = { player: null, enemy: null };
  const lpAnimations = { player: null, enemy: null };
  const lpDone = { player: Promise.resolve(), enemy: Promise.resolve() };

  let visualMode=['full','compact','minimal'].includes(localStorage.getItem('meme-fx-mode'))?localStorage.getItem('meme-fx-mode'):'full';
  document.documentElement.dataset.fxMode=visualMode;
  function motion() { return visualMode!=='minimal' && !reduced.matches && !skipping; }
  function setMode(value){if(!['full','compact','minimal'].includes(value))return;visualMode=value;localStorage.setItem('meme-fx-mode',value);document.documentElement.dataset.fxMode=value;if(busy)skip();}
  function isSpotlight(c){return !!c&&(c.rarity==='UR'||c.deck_zone==='Extra'||c.stars>=7||c.special_only||c.monster_category==='Nghi Lễ'||c.traits?.includes('god'));}
  function presentation(event){const c=card(event.cardId);if(['set','draw','position','cost','attack-intent'].includes(event.kind)||c?.card_type==='Monster'&&!isSpotlight(c)&&['summon','revive','flip'].includes(event.kind))return 'quiet';return event.heroId!=null||['god','exodia','skill'].includes(event.kind)||isSpotlight(c)?'epic':'focus';}
  function sound(kind){
    if(!soundEnabled)return;
    try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;oscillator.type=kind==='hit'?'triangle':'sine';oscillator.frequency.setValueAtTime(kind==='hit'?170:kind==='heal'?650:330,now);oscillator.frequency.exponentialRampToValueAtTime(kind==='hit'?45:kind==='heal'?1000:700,now+.18);gain.gain.setValueAtTime(kind==='soft'?.008:.035,now);gain.gain.exponentialRampToValueAtTime(.001,now+.22);oscillator.connect(gain).connect(audioContext.destination);oscillator.start();oscillator.stop(now+.24);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};}catch(_){}
  }
  const soundButton=document.getElementById('memeSoundBtn');
  function soundLabel(){if(soundButton){soundButton.textContent=soundEnabled?'🔊':'🔇';soundButton.setAttribute('aria-pressed',String(soundEnabled));soundButton.title='Bật hoặc tắt tiếng hiệu ứng';soundButton.setAttribute('aria-label','Bật hoặc tắt tiếng hiệu ứng');}}
  soundLabel();soundButton?.addEventListener('click',()=>{soundEnabled=!soundEnabled;localStorage.setItem('meme-sound',soundEnabled?'on':'off');soundLabel();if(soundEnabled)sound('heal');});
  function delay(ms) {
    if (!motion()) return Promise.resolve();
    return new Promise(resolve => {
      const entry = { id: null, resolve: () => { clearTimeout(entry.id); timers.delete(entry); resolve(); } };
      entry.id = setTimeout(entry.resolve, visualMode==='compact'?Math.round(ms*.35):ms);
      timers.add(entry);
    });
  }
  function animate(el, frames, options) {
    if (!el || !motion()) return Promise.resolve();
    options={...options,duration:visualMode==='compact'?Math.round(options.duration*.4):options.duration};
    const animation = el.animate(frames, options);
    animations.add(animation);
    // Background tabs and small iframes may pause Web Animations indefinitely.
    // The game action must still resolve on wall-clock time.
    let timeout;
    const fallback = new Promise(resolve => { timeout = setTimeout(resolve, Number(options.duration || 0) + 240); });
    return Promise.race([animation.finished.catch(() => {}), fallback]).finally(() => {
      clearTimeout(timeout);
      try { animation.finish(); } catch (_) {}
      animations.delete(animation);
    });
  }
  function skip() {
    skipping = true;
    for (const entry of [...timers]) entry.resolve();
    for (const animation of [...animations]) { try { animation.finish(); } catch (_) {} }
  }
  skipButton.addEventListener('click', skip);
  async function run(task) {
    if (busy) return false;
    const runEpoch = epoch;
    busy = true; skipping = false;
    skipButton.classList.toggle('hidden', reduced.matches);
    try { await task(runEpoch); return true; }
    finally { if (epoch === runEpoch) { busy = false; skipButton.classList.add('hidden'); skipping = false;if(duel){document.getElementById('nextPhaseBtn').disabled=duel.turn!=='player'||duel.finished;renderInspector();renderHeroSkills();window.memeBattleUX?.refresh();if(document.querySelector('.pile-modal')&&!document.getElementById('modal').classList.contains('hidden'))renderPile();} } }
  }
  function center(el) {
    const r = el?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, rect: r } : null;
  }
  function ghost(el) {
    const pos = center(el); if (!pos) return null;
    const node = el.cloneNode(true);
    node.removeAttribute('id');node.classList.remove('selected','defense','valid-target','fx-charging');node.classList.add('meme-fx-ghost');
    Object.assign(node.style, { left: pos.rect.left + 'px', top: pos.rect.top + 'px', width: pos.rect.width + 'px', height: pos.rect.height + 'px', margin: '0', transform: 'none' });
    layer.appendChild(node);
    return { node, pos };
  }
  function ring(pos) {
    if (!pos || !motion()) return;
    const node = document.createElement('div'); node.className = 'meme-fx-ring';
    node.style.left = pos.x + 'px'; node.style.top = pos.y + 'px'; layer.appendChild(node);
    setTimeout(() => node.remove(), 550);
  }
  function burst(pos,color='#ffe4a1'){
    if(!pos||!motion())return;for(let i=0;i<7;i++){const node=document.createElement('i'),angle=i*Math.PI*2/7;Object.assign(node.style,{position:'fixed',left:pos.x+'px',top:pos.y+'px',width:'5px',height:'11px',background:color,boxShadow:`0 0 7px ${color}`,borderRadius:'2px'});layer.appendChild(node);animate(node,[{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${Math.cos(angle)*45}px,${Math.sin(angle)*45}px) rotate(${i*65}deg)`,opacity:0}],{duration:450,easing:'ease-out'}).finally(()=>node.remove());}
  }
  function float(text, pos, heal = false) {
    if (!pos || !motion()) return;
    const node = document.createElement('div'); node.className = 'meme-fx-float' + (heal ? ' heal' : '');
    node.textContent = text; node.style.left = pos.x + 'px'; node.style.top = pos.y + 'px'; layer.appendChild(node);
    setTimeout(() => node.remove(), 900);
  }
  function banner(text) {
    if (!motion()) return;
    const node = document.createElement('div'); node.className = 'meme-fx-banner'; node.textContent = text;
    layer.appendChild(node); setTimeout(() => node.remove(), 850);
  }
  async function summon(handIndex, zoneIndex, faceDown, name='player',extraCardId=null) {
    return run(async runEpoch => {
      const source = extraCardId?document.getElementById(name+'ExtraDeckBtn'):name==='player'?document.querySelectorAll('#hand .card')[handIndex]:document.querySelector('#opponentHand span');
      const target = zoneIndex === 'extra' ? document.getElementById(name+'Extra') : document.querySelectorAll('#'+name+'Monsters .field-slot')[zoneIndex];
      const start = center(source), end = center(target);
      if (!start || !end || !motion()) return;
      const copy = ghost(source); source.style.visibility = 'hidden';
      if(extraCardId){copy.node.innerHTML=artHTML(extraCardId,'synchro-flight-art');banner('🌀 TRIỆU HỒI ĐỒNG BỘ · '+card(extraCardId).name);}
      sound('summon');
      try {
        const dx = end.x - start.x, dy = end.y - start.y;
        await animate(copy.node, [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx * .35}px,${dy * .35 - 25}px) scale(1.18)`, opacity: 1, offset: .45 },
          { transform: `translate(${dx}px,${dy}px) scale(.86) rotateY(${faceDown ? 180 : 0}deg)`, opacity: .35 }
        ], { duration: 720, easing: 'ease-in-out', fill: 'forwards' });
        if (epoch !== runEpoch) return;
        ring(end); await delay(100);
      } finally { source.style.visibility = ''; copy.node.remove(); }
    });
  }
  async function attack(attackerSide, attackerIndex, attackerExtra, targetIndex, targetExtra, resolve) {
    if (busy) return false;
    const match = duel;
    await run(async runEpoch => {
      const src = attackerExtra ? document.getElementById(attackerSide + 'Extra') : document.querySelectorAll('#' + attackerSide + 'Monsters .field-slot')[attackerIndex];
      const defenderSide = attackerSide === 'player' ? 'enemy' : 'player';
      const dst = targetIndex === null && !targetExtra ? document.getElementById(defenderSide + 'Life') :
        targetExtra ? document.getElementById(defenderSide + 'Extra') : document.querySelectorAll('#' + defenderSide + 'Monsters .field-slot')[targetIndex];
      const a = center(src), d = center(dst);
      if (a && d && motion()) {
        const attacker=attackerExtra?side(attackerSide).extra:side(attackerSide).monsters[attackerIndex],c=card(attacker?.id),color=attackColors[c?.element]||'#ffe39b';
        if(!isSpotlight(c)){const beam=document.createElement('div'),angle=Math.atan2(d.y-a.y,d.x-a.x);beam.className='meme-fx-beam soft-attack-beam';Object.assign(beam.style,{left:a.x+'px',top:a.y+'px',width:Math.hypot(d.x-a.x,d.y-a.y)+'px',height:'2px',opacity:'.3',boxShadow:'none',background:color});layer.appendChild(beam);sound('soft');try{await animate(beam,[{transform:'rotate('+angle+'rad) scaleX(0)',opacity:0},{transform:'rotate('+angle+'rad) scaleX(1)',opacity:.35}],{duration:360,easing:'ease-in-out',fill:'forwards'});await delay(100);if(epoch===runEpoch&&duel===match)await resolve();await delay(180);}finally{beam.remove();}return;}
        const cutin=document.createElement('div');cutin.className='meme-fx-cutin';cutin.style.setProperty('--attack-color',color);cutin.innerHTML=`${c?artHTML(c.id,'cutin-art'):''}<div><small>${attackerSide==='player'?'BẠN TẤN CÔNG':'ĐỐI THỦ TẤN CÔNG'}</small><strong>${esc(c?.name||'Tấn công')}</strong><span>${c?.element||''} · ${attacker?effectiveAtk(attackerSide,attacker):''} ATK</span></div>`;layer.appendChild(cutin);setTimeout(()=>cutin.remove(),780);
        src.classList.add('fx-charging');
        sound('charge');
        await delay(190);
        if (epoch !== runEpoch) { src.classList.remove('fx-charging'); return; }
        const beam = document.createElement('div'); beam.className = 'meme-fx-beam';
        beam.style.setProperty('--attack-color',color);
        const dx = d.x - a.x, dy = d.y - a.y, distance = Math.hypot(dx, dy);
        Object.assign(beam.style, { left: a.x + 'px', top: a.y + 'px', width: distance + 'px', transform: `rotate(${Math.atan2(dy, dx)}rad) scaleX(0)` });
        layer.appendChild(beam);
        await animate(beam, [{ transform: `rotate(${Math.atan2(dy, dx)}rad) scaleX(0)` }, { transform: `rotate(${Math.atan2(dy, dx)}rad) scaleX(1)` }], { duration: 310, easing: 'ease-in', fill: 'forwards' });
        if (epoch !== runEpoch) { beam.remove(); src.classList.remove('fx-charging'); return; }
        ring(d);
        burst(d,color);
        sound('hit');
        const impact=document.createElement('div');impact.className='meme-fx-impact';impact.textContent='ドン!';impact.style.left=d.x+'px';impact.style.top=d.y+'px';impact.style.color=color;layer.appendChild(impact);setTimeout(()=>impact.remove(),600);
        const board = document.querySelector('.board-frame'); board.classList.add('fx-impact');
        setTimeout(() => board.classList.remove('fx-impact'), 250);
        await delay(120);
        beam.remove();
        src.classList.remove('fx-charging');
      }
      if (epoch === runEpoch && duel === match) await resolve();
    });
    return true;
  }
  async function cardActivation(index, kind = 'spell') {
    return run(async runEpoch => {
      const source = document.querySelectorAll('#hand .card')[index];
      const start = center(source), board = center(document.querySelector('.board-frame'));
      if (!start || !board || !motion()) return;
      const copy = ghost(source); source.style.visibility = 'hidden';
      try {
        await animate(copy.node, [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${board.x - start.x}px,${board.y - start.y}px) scale(1.25) rotateY(${kind === 'trap' ? 180 : 0}deg)`, opacity: 1, offset: .72 },
          { transform: `translate(${board.x - start.x}px,${board.y - start.y}px) scale(1.35)`, opacity: 0 }
        ], { duration: 560, easing: 'ease-out', fill: 'forwards' });
        if (epoch !== runEpoch) return;
        ring(board);
      } finally { source.style.visibility = ''; copy.node.remove(); }
    });
  }
  async function flipTrap(side, index) {
    return run(async runEpoch => {
      sound('charge');
      const source = document.querySelectorAll('#' + side + 'Spells .field-slot')[index];
      const pos = center(source);
      if (!source || !pos || !motion()) return;
      const copy = ghost(source); source.style.visibility = 'hidden';
      try {
        await animate(copy.node, [{ transform: 'rotateY(0deg) scale(1)' }, { transform: 'rotateY(90deg) scale(1.28)', offset: .48 }, { transform: 'rotateY(180deg) scale(1.08)' }], { duration: 460, easing: 'ease-in-out', fill: 'forwards' });
        if (epoch === runEpoch) ring(pos);
      } finally { source.style.visibility = ''; copy.node.remove(); }
    });
  }
  async function activateSlot(name,index,isExtra,c){
    return run(async()=>{const source=isExtra?document.getElementById(name+'Extra'):document.querySelectorAll('#'+name+'Monsters .field-slot')[index];const pos=center(source);if(!pos||!motion())return;const copy=ghost(source);sound('charge');banner(c.name);await animate(copy.node,[{transform:'scale(1)',opacity:1},{transform:'scale(1.45) translateY(-12px)',opacity:1,offset:.6},{transform:'scale(1.1)',opacity:0}],{duration:480,easing:'ease-out'});copy.node.remove();ring(pos);});
  }
  function setLp(name, value) {
    const number = document.getElementById(name + 'Life');
    const bar = document.getElementById(name + 'LifeBar');
    const track = bar.parentElement;
    const old = shownLp[name];
    if (targetLp[name] === value) return;
    targetLp[name] = value;
    if (lpAnimations[name]) lpAnimations[name].cancel();
    if (old === null || !motion()) {
      shownLp[name] = value; number.textContent = `${Math.max(0,value)} LP`;
      bar.style.width = `${Math.max(0,Math.min(100,value / 40))}%`; return;
    }
    if (old === value) return;
    const startValue = old, change = value - old, duration = Math.min(850, Math.max(380, Math.abs(change) * .42));
    let raf, startTime, fallback;
    const trail = track.querySelector('.lp-trail') || document.createElement('span');
    trail.className = 'lp-trail'; track.appendChild(trail);
    trail.style.width = `${Math.max(0,Math.min(100,startValue / 40))}%`;
    track.classList.add(change < 0 ? 'lp-hit' : 'lp-heal');
    sound(change<0?'hit':'heal');
    float(`${change > 0 ? '+' : ''}${change} LP`, center(number), change > 0);
    lpDone[name] = new Promise(resolve => {
      let ended=false;
      function settle(){if(ended)return;ended=true;cancelAnimationFrame(raf);clearTimeout(fallback);shownLp[name]=value;number.textContent=`${Math.max(0,value)} LP`;bar.style.width=`${Math.max(0,Math.min(100,value/40))}%`;track.classList.remove('lp-hit','lp-heal');trail.style.width=bar.style.width;resolve();}
      function frame(now) {
        if (startTime === undefined) startTime = now;
        const t = Math.min(1, (now - startTime) / duration), eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(startValue + change * eased);
        shownLp[name] = current; number.textContent = `${Math.max(0,current)} LP`;
        bar.style.width = `${Math.max(0,Math.min(100,current / 40))}%`;
        if (t < 1) raf = requestAnimationFrame(frame);
        else settle();
      }
      raf = requestAnimationFrame(frame);
      fallback=setTimeout(settle,duration+160);
      lpAnimations[name] = { cancel: () => {if(ended)return;ended=true;cancelAnimationFrame(raf);clearTimeout(fallback);track.classList.remove('lp-hit','lp-heal');resolve();} };
    });
  }
  function beforeRender() {
    if (!previous) return null;
    const lost = [];
    for (const name of ['player','enemy']) for (const zone of ['Monsters','Spells']) for (let i = 0; i < 3; i++) {
      const el = document.querySelectorAll('#' + name + zone + ' .field-slot')[i];
      if (el) lost.push({ name, zone, i, el: el.cloneNode(true), rect: el.getBoundingClientRect() });
    }
    for(const name of ['player','enemy']){const el=document.getElementById(name+'Extra');if(el)lost.push({name,zone:'Extra',i:-1,el:el.cloneNode(true),rect:el.getBoundingClientRect()});}
    return lost;
  }
  function effectScene(event){
    const c=card(event?.cardId);if(!c||!motion())return;
    const color=c.card_type==='Trap'?'#ff78dd':'#75ffc9',runEpoch=epoch,board=center(document.querySelector('.board-frame'));if(!board)return;
    layer.querySelectorAll('.meme-magic-card,.meme-fx-banner').forEach(node=>node.remove());
    const panel=document.createElement('div');panel.className='meme-magic-card '+(c.card_type==='Trap'?'trap':'spell');panel.style.setProperty('--magic-color',color);
    panel.innerHTML=`${artHTML(c.id,'magic-art')}<div><small>${c.card_type==='Trap'?'BẪY KÍCH HOẠT':'PHÉP THUẬT'}</small><strong>${esc(c.name)}</strong><span>${c.effect_code?.startsWith('destroy')?'PHÁ HỦY!':c.effect_code==='negate_spell'?'VÔ HIỆU PHÉP!':'KÍCH HOẠT HIỆU ỨNG'}</span></div>`;
    layer.appendChild(panel);sound('charge');setTimeout(()=>panel.remove(),1150);
    for(const target of event.targets||[]){const el=target.type==='extra'?document.getElementById(target.name+'Extra'):target.type==='field'?document.getElementById(target.name+'FieldSpell'):document.querySelectorAll('#'+target.name+(target.type==='spell'?'Spells':'Monsters')+' .field-slot')[target.index];const end=center(el);if(!end)continue;
      const sigil=document.createElement('div');sigil.className='magic-sigil';sigil.style.setProperty('--magic-color',color);sigil.style.left=end.x+'px';sigil.style.top=end.y+'px';layer.appendChild(sigil);
      const beam=document.createElement('div'),dx=end.x-board.x,dy=end.y-board.y,angle=Math.atan2(dy,dx);beam.className='magic-ray';Object.assign(beam.style,{left:board.x+'px',top:board.y+'px',width:Math.hypot(dx,dy)+'px',background:color,boxShadow:`0 0 18px ${color}`});layer.appendChild(beam);
      animate(beam,[{transform:`rotate(${angle}rad) scaleX(0)`,opacity:0},{transform:`rotate(${angle}rad) scaleX(1)`,opacity:1,offset:.45},{transform:`rotate(${angle}rad) scaleX(1)`,opacity:0}],{duration:650,easing:'ease-out'}).finally(()=>beam.remove());
      setTimeout(()=>{if(epoch===runEpoch){burst(end,color);ring(end);sound('hit');}sigil.remove();},600);
    }
  }
  function heroScene(event){
    if(!event||!motion())return;const h=getHero(event.heroId),owner=event.owner;
    layer.querySelectorAll('.hero-skill-cutin,.meme-fx-banner').forEach(el=>el.remove());
    const node=document.createElement('div');node.className='hero-skill-cutin';node.style.cssText=heroStyle(h);
    node.innerHTML=`${heroFigure(h)}<div><small>${owner==='player'?'KỸ NĂNG CỦA BẠN':'KỸ NĂNG ĐỐI THỦ'}</small><strong>${h.icon} ${esc(h.skill)}</strong><b>${esc(h.name)}</b><p>${esc(h.description)}</p></div>`;
    layer.appendChild(node);sound(h.code==='heal'?'heal':'charge');ring(center(document.getElementById(owner+'SkillCard')));setTimeout(()=>node.remove(),1400);
  }
  function extraDespawn(old,name){if(!old||!motion())return;const node=old.el;node.classList.add('meme-fx-ghost');Object.assign(node.style,{left:old.rect.left+'px',top:old.rect.top+'px',width:old.rect.width+'px',height:old.rect.height+'px'});layer.appendChild(node);const start={x:old.rect.left+old.rect.width/2,y:old.rect.top+old.rect.height/2},end=center(document.getElementById(name+'GY'));burst(start);animate(node,[{transform:'scale(1)',opacity:1,filter:'brightness(2)'},{transform:`translate(${(end?.x||start.x)-start.x}px,${(end?.y||start.y)-start.y}px) scale(.1) rotate(25deg)`,opacity:0}],{duration:600,easing:'ease-in'}).finally(()=>node.remove());}
  function afterRender(state, oldElements) {
    const current = {
      turn: state.turn, round: state.round,
      playerHand: state.player.hand.length, enemyHand: state.enemy.hand.length,
      playerMonsters: state.player.monsters.map(s => s?.id || null),
      enemyMonsters: state.enemy.monsters.map(s => s?.id || null),
      playerAtk: state.player.monsters.map(s => s ? effectiveAtk('player',s) : null),
      enemyAtk: state.enemy.monsters.map(s => s ? effectiveAtk('enemy',s) : null),
      playerSpells: state.player.spells.map(s => s ? {id:s.id,faceDown:!!s.faceDown} : null),
      enemySpells: state.enemy.spells.map(s => s ? {id:s.id,faceDown:!!s.faceDown} : null),
      playerPositions:state.player.monsters.map(s=>s?.position),enemyPositions:state.enemy.monsters.map(s=>s?.position),
      playerExtra:state.player.extra?.id,enemyExtra:state.enemy.extra?.id,effectSerial:state.lastEffect?.serial,skillSerial:state.lastSkill?.serial
    };
    if (previous && motion()) {
      if(current.skillSerial&&current.skillSerial!==previous.skillSerial)heroScene(state.lastSkill);
      if(current.effectSerial&&current.effectSerial!==previous.effectSerial)effectScene(state.lastEffect);
      for(const name of ['player','enemy'])if(previous[name+'Extra']&&previous[name+'Extra']!==current[name+'Extra'])extraDespawn(oldElements?.find(x=>x.name===name&&x.zone==='Extra'),name);
      if (current.turn !== previous.turn) banner(current.turn === 'player' ? 'LƯỢT CỦA BẠN' : 'LƯỢT ĐỐI THỦ');
      if (current.playerHand > previous.playerHand) {
        const deck = center(document.getElementById('playerDeck'));
        const hand = center(document.getElementById('hand'));
        if (deck && hand) {
          const node = document.createElement('div'); node.className = 'meme-fx-ghost'; node.textContent = '🂠';
          Object.assign(node.style, { left: deck.x + 'px', top: deck.y + 'px', width: '35px', height: '48px', display: 'grid', placeItems: 'center' });
          layer.appendChild(node);
          animate(node, [{ transform: 'translate(0,0) scale(.6)', opacity: 1 }, { transform: `translate(${hand.x - deck.x}px,${hand.y - deck.y}px) scale(1)`, opacity: 0 }], { duration: 420, easing: 'ease-out' }).finally(() => node.remove());
        }
      }
      for (const name of ['player','enemy']) for (let i = 0; i < 3; i++) {
        const before = previous[name + 'Monsters'][i], after = current[name + 'Monsters'][i];
        const el = document.querySelectorAll('#' + name + 'Monsters .field-slot')[i];
        if (!before && after && el) { const epic=isSpotlight(card(after));el.classList.add(epic?'fx-land':'soft-land');if(epic)ring(center(el));setTimeout(()=>el.classList.remove('fx-land','soft-land'),650); }
        if (before && !after) {
          const old = oldElements?.find(x => x.name === name && x.zone === 'Monsters' && x.i === i);
          if (old) {
            const node = old.el;node.classList.remove('selected','defense','valid-target','fx-charging');node.classList.add('meme-fx-ghost');
            Object.assign(node.style, { left: old.rect.left + 'px', top: old.rect.top + 'px', width: old.rect.width + 'px', height: old.rect.height + 'px' });
            layer.appendChild(node);const grave=center(document.getElementById(name+'GY')),origin={x:old.rect.left+old.rect.width/2,y:old.rect.top+old.rect.height/2};if(isSpotlight(card(before)))burst(origin);animate(node,[{transform:'scale(1)',filter:'brightness(1)',opacity:1},{transform:`translate(${(grave?.x||origin.x)-origin.x}px,${(grave?.y||origin.y)-origin.y}px) scale(.15) rotate(30deg)`,filter:'brightness(1)',opacity:0}],{duration:550,easing:'ease-in'}).finally(()=>node.remove());
          }
        }
        if(before&&after===before&&previous[name+'Positions'][i]==='def_down'&&current[name+'Positions'][i]==='def'){if(isSpotlight(card(after))){ring(center(el));banner('LẬT BÀI · '+(card(after)?.name||''));}}
        if (before && after === before && current[name + 'Atk'][i] !== previous[name + 'Atk'][i]) {
          const stat = el?.querySelector('.slot-stats');
          const from = previous[name + 'Atk'][i], to = current[name + 'Atk'][i];
          if (stat && Number.isFinite(from) && Number.isFinite(to)) {
            const prefix = stat.textContent.slice(0,1); const started = performance.now();
            const tick = now => { if (!stat.isConnected) return; const t = Math.min(1,(now-started)/420);stat.textContent=prefix+Math.round(from+(to-from)*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(tick); };
            requestAnimationFrame(tick); float(`ATK ${to>from?'+':''}${to-from}`,center(el),to>from);
          }
        }
        const oldSpell=previous[name+'Spells'][i],newSpell=current[name+'Spells'][i];
        if(oldSpell&&oldSpell.id!==newSpell?.id)extraDespawn(oldElements?.find(x=>x.name===name&&x.zone==='Spells'&&x.i===i),name);
        if (oldSpell?.faceDown && ((newSpell?.id===oldSpell.id&&!newSpell.faceDown)||state.lastEffect?.cardId===oldSpell.id&&current.effectSerial!==previous.effectSerial)) {
          const old=oldElements?.find(x=>x.name===name&&x.zone==='Spells'&&x.i===i);
          if(old){ring({x:old.rect.left+old.rect.width/2,y:old.rect.top+old.rect.height/2});if(current.effectSerial===previous.effectSerial)banner(card(oldSpell.id)?.name||'Bẫy kích hoạt');}
        }
      }
    }
    previous = current;
  }
  function reset() {
    skip(); epoch++; previous = null; busy = false; skipping = false;
    skipButton.classList.add('hidden'); layer.replaceChildren();
    for (const name of ['player','enemy']) { lpAnimations[name]?.cancel(); lpAnimations[name]=null; shownLp[name]=null; targetLp[name]=null; lpDone[name]=Promise.resolve(); }
    document.getElementById('duel').classList.remove('match-finished');
  }
  async function resolveCard(event,commit){
    const task=async runEpoch=>{
      const match=duel,c=card(event.cardId),hero=event.heroId!=null?getHero(event.heroId):null;
      const tier=presentation(event),stage=document.createElement('div');stage.className='anime-effect-stage anime-tier-'+tier;stage.dataset.kind=event.kind||'spell';stage.dataset.tier=tier;stage.style.setProperty('--anime-color',hero?.color||c?.art?.c1||'#bfa4ff');
      stage.innerHTML=`<div class="anime-effect-orbit"></div><div class="anime-effect-rays"></div>${event.coin?`<div class="anime-time-coin">${esc(event.coin)}</div>`:''}<div class="anime-effect-card">${hero?heroFigure(hero,'anime-portrait'):c?artHTML(c.id,'anime-card-picture'):''}<small>${event.owner==='player'?'BẠN KÍCH HOẠT':'ĐỐI THỦ KÍCH HOẠT'}</small><strong>${esc(event.title||hero?.skill||c?.name||'Hiệu ứng')}</strong><p>${esc(event.text||'')}</p></div>${(event.materials||[]).map((id,i)=>`<div class="anime-material" style="--material-i:${i};--material-count:${event.materials.length}">${artHTML(id,'anime-material-art')}</div>`).join('')}`;
      const marked=[];for(const target of event.targets||[]){const node=target.type==='lp'?document.getElementById(target.name+'Life'):target.type==='spell'?document.querySelectorAll('#'+target.name+'Spells .field-slot')[target.index]:target.type==='extra'?document.getElementById(target.name+'Extra'):document.querySelectorAll('#'+target.name+'Monsters .field-slot')[target.index];if(node){node.classList.add('anime-target');marked.push(node);}}
      const board=document.querySelector('.board-frame');if(tier==='quiet'){stage.innerHTML=`<div class="anime-soft-caption">${esc(event.title||c?.name||'')}${event.coin?` · ${esc(event.coin)}`:''}</div>`;board?.classList.add('anime-soft-lit');}
      const counterType=event.kind==='trap'?({destroy_attack_position:'mirror',magic_cylinder:'cylinders',trap_hole:'hole',magic_jammer:'jammer'}[c?.effect_code]):event.kind==='negate'&&c?.effect_code==='seven_tools'?'tools':event.kind==='shield'&&c?.traits?.some(t=>['kuriboh','winged_kuriboh'].includes(t))?'kuriboh':null;
      if(counterType){stage.classList.add('p2-counter-stage');stage.dataset.counter=counterType;const visual=document.createElement('div');visual.className='p2-counter-visual p2-'+counterType;visual.innerHTML=`<i></i><i></i><span>${counterType==='mirror'?'PHẢN CHIẾU':counterType==='cylinders'?'ĐẢO CHIỀU':counterType==='hole'?'HỐ BẪY':counterType==='tools'?'VÔ HIỆU':counterType==='jammer'?'CHẶN PHÉP':'CHẶN SÁT THƯƠNG'}</span>`;stage.prepend(visual);}
      layer.appendChild(stage);sound(tier==='quiet'?'soft':event.kind==='heal'?'heal':'charge');
      try{await animate(stage,[{opacity:0,transform:'scale(.96)'},{opacity:1,transform:'scale(1)'}],{duration:tier==='quiet'?180:360,easing:'ease-out',fill:'forwards'});await delay(tier==='quiet'?300:tier==='epic'?1450:1000);
        if(epoch!==runEpoch||duel!==match)return false;
        await commit?.();if(duel===match)render();if(tier!=='quiet')sound(event.kind==='heal'?'heal':'hit');await delay(tier==='quiet'?150:tier==='epic'?600:420);
        await animate(stage,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.025)'}],{duration:tier==='quiet'?180:320,fill:'forwards'});return true;
      }finally{stage.remove();board?.classList.remove('anime-soft-lit');for(const node of marked)node.classList.remove('anime-target');}
    };
    // Reactions and destruction may animate inside the attack animation's transaction.
    if(busy)return task(epoch);let result=false;await run(async e=>{result=await task(e);});return result;
  }
  window.memeFx = { get busy() { return busy; }, get mode(){return visualMode;},setMode, isSpotlight,presentation,resolveCard, summon, attack, cardActivation, flipTrap, activateSlot, setLp, beforeRender, afterRender, whenLpSettles: () => Promise.all(Object.values(lpDone)), banner, float, skip, reset };
})();
