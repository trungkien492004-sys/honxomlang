const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function patchFile(relPath, replacer) {
  const fullPath = path.join(root, relPath);
  const content = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
  const updated = replacer(content);
  if (content === updated) {
    console.warn(`[WARN] No change made to ${relPath}`);
  } else {
    fs.writeFileSync(fullPath, updated.replace(/\n/g, '\r\n'), 'utf8');
    console.log(`[OK] Successfully patched ${relPath}`);
  }
}

// ────────────────── 1. PATCH assets/js/meme_game.js ──────────────────
patchFile('assets/js/meme_game.js', content => {
  let c = content;

  // Fix addAction duplicate event listener (b.onclick + b.addEventListener('click'))
  const oldAddAction = `function addAction(host,label,fn,secondary=false){const b=document.createElement('button');b.className=secondary?'secondary-btn':'primary-btn';b.textContent=label;b.onclick=fn;b.addEventListener('click',fn);host.appendChild(b);return b;}`;
  const newAddAction = `function addAction(host,label,fn,secondary=false){const b=document.createElement('button');b.type='button';b.className=secondary?'secondary-btn':'primary-btn';b.textContent=label;b.onclick=e=>{if(b.disabled)return;return fn(e);};host.appendChild(b);return b;}`;
  c = c.replace(oldAddAction, newAddAction);

  // Fix summon check in meme_game.js: if busy or cannot act, don't show false "Chỉ có thể Triệu hồi ở phase MAIN 1 hoặc MAIN 2"
  const oldSummonHead = `function summon(index,position){\n  if(!mainPhase()){\n    const msg = duel.phase === 'BATTLE' ? 'Không thể Triệu hồi trong Phase Chiến Đấu! Hãy quay về Main 2 hoặc sang lượt sau.' : 'Chỉ có thể Triệu hồi ở phase MAIN 1 hoặc MAIN 2.';\n    window.showActionNotice(msg);\n    return log(msg);\n  }`;
  const newSummonHead = `function summon(index,position){\n  if(duel?.turn!=='player'){window.showActionNotice('Đang là lượt của đối thủ!');return;}\n  if(!['MAIN1','MAIN2'].includes(duel?.phase)){\n    const msg = duel?.phase === 'BATTLE' ? 'Không thể Triệu hồi trong Phase Chiến Đấu! Hãy quay về Main 2 hoặc sang lượt sau.' : 'Chỉ có thể Triệu hồi ở phase MAIN 1 hoặc MAIN 2.';\n    window.showActionNotice(msg);\n    return log(msg);\n  }\n  if(!canAct())return;`;
  c = c.replace(oldSummonHead, newSummonHead);

  return c;
});

// ────────────────── 2. PATCH assets/js/meme_anime_rules.js ──────────────────
patchFile('assets/js/meme_anime_rules.js', content => {
  let c = content;

  // 2.1 Fix summon() head to not show false notice when busy or double-clicked
  c = c.replace(
    /summon=\(index,position='atk'\)=>\{\n\s*if\(!mainPhase\(\)\)\{\n\s*const msg = duel\?\.phase === 'BATTLE' \? 'Không thể Triệu hồi trong Phase Chiến Đấu! Hãy quay về Main 2 hoặc sang lượt sau\.' : 'Chỉ có thể Triệu hồi ở phase MAIN 1 hoặc MAIN 2\.';\n\s*window\.showActionNotice\(msg\);\n\s*return log\(msg\);\n\s*\}/,
    `summon=(index,position='atk')=>{\n    if(duel?.turn!=='player'){window.showActionNotice('Đang là lượt của đối thủ!');return;}\n    if(!['MAIN1','MAIN2'].includes(duel?.phase)){\n      const msg = duel?.phase === 'BATTLE' ? 'Không thể Triệu hồi trong Phase Chiến Đấu! Hãy quay về Main 2 hoặc sang lượt sau.' : 'Chỉ có thể Triệu hồi ở phase MAIN 1 hoặc MAIN 2.';\n      window.showActionNotice(msg);\n      return log(msg);\n    }\n    if(!canAct()||!mainPhase())return;`
  );

  // 2.2 In normalSummon, clear duel.selected after successful summon
  const oldNormalEnd = `s.normalUsed=true;if(n==='player')duel.normalSummoned=true;duel.mode=null;duel.pending=null;log(position==='def_down'?'🂠 Một quái được đặt úp.':\`✨ \${c.name} được triệu hồi.\`);`;
  const newNormalEnd = `s.normalUsed=true;if(n==='player'){duel.normalSummoned=true;duel.selected=null;}duel.mode=null;duel.pending=null;log(position==='def_down'?'🂠 Một quái được đặt úp.':\`✨ \${c.name} được triệu hồi.\`);`;
  c = c.replace(oldNormalEnd, newNormalEnd);

  // 2.3 Fix Premature Burial (Chôn sống) activation and equip attachment in resolveEffect
  const oldPremature = `if(['anime_reborn','premature'].includes(code)){if(free(n)<0||code==='premature'&&(s.lp<=lpFee(800)||!s.spells.includes(null)&&!ctx.fromSet))return false;const options=[n,...(code==='anime_reborn'?[foe]:[])].flatMap(who=>choices(S(who).grave,'grave').filter(e=>card(e.id)?.card_type==='Monster'&&!card(e.id).uncollectible&&!card(e.id).noRevive).map(e=>({...e,from:who,zone:'grave'})));const t=await pick(n,'Chọn quái trong Mộ để hồi sinh',options);if(!t)return false;const position=await revivalPosition(n,c,t.id);if(!position)return false;if(code==='premature'){const payment=await paySpellActivation(n,c,ctx,800);if(payment!=='paid')return payment==='negated';}return commit('revive',[],()=>{if(!S(t.from).grave.includes(t.id)||free(n)<0)return;const slot=revive(n,t.from,t.id,position);if(slot&&code==='premature'){const i=s.grave.lastIndexOf(c.id);if(i>=0)s.grave.splice(i,1);s.spells[s.spells.indexOf(null)]={id:c.id,faceDown:false,setRound:duel.round,revivalUid:uid(slot),equippedTo:uid(slot),equipValue:0};}if(slot)deathQueue.push(()=>postSummon(n,slot));});}`;
  
  const newPremature = `if(['anime_reborn','premature'].includes(code)){
    if(free(n)<0||code==='premature'&&(s.lp<=lpFee(800)||!s.spells.includes(null)&&!ctx.fromSet))return false;
    const options=[n,...(code==='anime_reborn'?[foe]:[])].flatMap(who=>choices(S(who).grave,'grave').filter(e=>card(e.id)?.card_type==='Monster'&&!card(e.id).uncollectible&&!card(e.id).noRevive).map(e=>({...e,from:who,zone:'grave'})));
    const t=await pick(n,'Chọn quái trong Mộ để hồi sinh',options);
    if(!t)return false;
    const position=await revivalPosition(n,c,t.id);
    if(!position)return false;
    if(code==='premature'){
      const payment=await paySpellActivation(n,c,ctx,800);
      if(payment!=='paid')return payment==='negated';
    }
    return commit('revive',[],()=>{
      if(!S(t.from).grave.includes(t.id)||free(n)<0)return;
      const slot=revive(n,t.from,t.id,position);
      if(slot&&code==='premature'){
        let spellSlot=s.spells.find(sp=>sp&&sp.id===c.id&&!sp.equippedTo);
        if(spellSlot){
          spellSlot.revivalUid=uid(slot);
          spellSlot.equippedTo=uid(slot);
          spellSlot.equipValue=0;
          spellSlot.faceDown=false;
        }else{
          const i=s.grave.lastIndexOf(c.id);
          if(i>=0)s.grave.splice(i,1);
          const nullIdx=s.spells.indexOf(null);
          if(nullIdx>=0){
            s.spells[nullIdx]={id:c.id,faceDown:false,setRound:duel.round,revivalUid:uid(slot),equippedTo:uid(slot),equipValue:0};
          }
        }
      }
      if(slot)deathQueue.push(()=>postSummon(n,slot));
    });
  }`;
  c = c.replace(oldPremature, newPremature);

  // 2.4 Fix spellProblem for premature
  c = c.replace(
    /if\s*\(c\.effect_code === 'premature'\)\s*\{\s*if\s*\(s\.lp <= 800\)[^}]+\}/,
    `if (c.effect_code === 'premature') {\n      if (s.lp <= lpFee(800)) return 'Cần ít nhất ' + lpFee(800) + ' LP để kích hoạt Chôn Sống!';\n      if (free(n) < 0) return 'Khu vực quái thú trên sân đã đầy!';\n      if (!s.spells.includes(null) && !fromSet) return 'Khu vực Phép/Bẫy đã đầy (Tối đa 3 ô trên sân)!';\n      if (!s.grave.some(id => card(id)?.card_type === 'Monster' && !card(id)?.uncollectible && !card(id)?.noRevive)) return 'Không có quái thú hợp lệ trong Mộ để hồi sinh!';\n    }`
  );

  // 2.5 Fix fusion field check in spellProblem so Polymerization / Miracle Fusion / Power Bond
  // does not reject with 'Khu vực quái thú trên sân đã đầy!' if fusion materials on the field will free up space!
  c = c.replace(
    /const modes = \{fusion_summon:'fusion', miracle_fusion:'miracle', power_bond:'power'\};\s*if \(modes\[c\.effect_code\]\) \{\s*if \(free\(n\) < 0 && !extraOpen\(n\)\) return 'Khu vực quái thú trên sân đã đầy!';\s*if \(!fusionCandidates\(n, modes\[c\.effect_code\]\)\.length\) \{/,
    `const modes = {fusion_summon:'fusion', miracle_fusion:'miracle', power_bond:'power'};\n    if (modes[c.effect_code]) {\n      const candidates = fusionCandidates(n, modes[c.effect_code]);\n      if (!candidates.length) {\n        if (free(n) < 0 && !extraOpen(n)) return 'Khu vực quái thú trên sân đã đầy!';`
  );

  // 2.6 Fix extraSummonProblem for Extra deck monsters when field materials will free space
  c = c.replace(
    /if \(free\(n\) < 0 && !extraOpen\(n\)\) \{\s*return 'Khu vực quái thú và Extra Zone trên sân đã kín \(Tối đa 3 ô \+ 1 Extra\)!';\s*\}/,
    `const opts = fusionOptions(n, id);\n    if (free(n) < 0 && !extraOpen(n) && !opts.some(chosen => chosen.some(e => e.zone === 'field'))) {\n      return 'Khu vực quái thú và Extra Zone trên sân đã kín (Tối đa 3 ô + 1 Extra)!';\n    }`
  );

  return c;
});

// ────────────────── 3. PATCH assets/js/site_rank.js ──────────────────
patchFile('assets/js/site_rank.js', content => {
  let c = content;

  // In find(): provide immediate visual state on rankPlayBtn and do NOT block unauthenticated users from quick rank match
  const oldFindAuth = `    if (!identity.user) {\n      try {\n        await identity.login();\n      } catch (err) {\n        console.warn('Rank identity login error:', err);\n      }\n      if (!identity.user) {\n        showRankLoginPrompt();\n        return;\n      }\n    }`;
  const newFindAuth = `    const quickPlayBtn = document.getElementById('rankPlayBtn');\n    if (quickPlayBtn) quickPlayBtn.classList.add('rank-btn-searching');\n    if (!identity.user) {\n      try {\n        if (typeof identity.login === 'function' && !identity.signing) {\n          await Promise.race([\n            identity.login(),\n            new Promise(res => setTimeout(() => res(null), 1200))\n          ]);\n        }\n      } catch (err) {\n        console.warn('Rank identity login error:', err);\n      }\n      // If user remains unauthenticated, continue matchmaking as Guest\n      // (Guest Elo starts at 1000 and can be synced to Google after the match!)\n      if (!identity.user) {\n        if (window.notify) window.notify('⚔️ Đang ghép Rank Khách (Điểm sẽ được lưu sau khi đăng nhập Google)');\n      }\n    }`;
  c = c.replace(oldFindAuth, newFindAuth);

  return c;
});

console.log('Patch complete.');
