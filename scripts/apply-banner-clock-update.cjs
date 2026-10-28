const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 1. Update assets/js/meme_game.js
{
  const filePath = path.join(root, 'assets/js/meme_game.js');
  let content = fs.readFileSync(filePath, 'utf8');

  const oldShowNotice = /window\.showEffectNotice\s*=\s*function\(\{\s*cardId,\s*title,\s*text,\s*owner\s*=\s*'player',\s*icon\s*=\s*'✨'\s*\}\)\s*\{[\s\S]*?const readDuration\s*=\s*2500;[\s\S]*?timer\s*=\s*setTimeout\(dismiss,\s*readDuration\);[\s\S]*?\};/;

  const newShowNotice = `window.showEffectNotice = function({ cardId, title, text, owner = 'player', icon = '✨', fromRemote = false }) {
  const c = typeof card === 'function' ? card(cardId) : null;
  const name = title || c?.name || 'Hiệu ứng bài';
  const desc = text || c?.description || '';
  document.querySelectorAll('.card-effect-banner').forEach(n => n.remove());
  const banner = document.createElement('div');
  banner.className = 'card-effect-banner';
  banner.innerHTML = \`
    <button type="button" class="effect-banner-close" aria-label="Đóng">✕</button>
    <div class="effect-banner-inner">
      <div class="effect-banner-art">\${c ? artHTML(c.id, 'effect-art-mini') : \`<span style="font-size:32px;">\${icon}</span>\`}</div>
      <div class="effect-banner-info">
        <div class="effect-banner-tag">\${owner === 'player' ? 'BẠN KÍCH HOẠT' : 'ĐỐI THỦ KÍCH HOẠT'} · \${icon} <span class="effect-banner-hint">(Chạm để đóng)</span></div>
        <strong class="effect-banner-name">\${esc(name)}</strong>
        <p class="effect-banner-text">\${esc(desc)}</p>
      </div>
    </div>
  \`;
  const layer = document.getElementById('memeFxLayer') || document.body;
  layer.appendChild(banner);
  try { window.memeFx?.sound?.('charge'); } catch (_) {}
  if (!fromRemote && typeof duel === 'object' && duel) {
    duel.effectNoticeSerial = (duel.effectNoticeSerial || 0) + 1;
    duel.lastNotice = { serial: duel.effectNoticeSerial, cardId, title: name, text: desc, owner, icon };
  }
  window.memeTurnClock?.bannerStart?.();
  let timer = null;
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(timer);
    window.memeTurnClock?.bannerEnd?.();
    banner.classList.add('fade-out');
    setTimeout(() => banner.remove(), 300);
  };
  banner.onclick = dismiss;
  const closeBtn = banner.querySelector('.effect-banner-close');
  if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); dismiss(); };
  const readDuration = 1500;
  timer = setTimeout(dismiss, readDuration);
};`;

  if (oldShowNotice.test(content)) {
    content = content.replace(oldShowNotice, newShowNotice);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ assets/js/meme_game.js updated with 1.5s banner and turn clock notifications');
  } else {
    console.error('❌ Could not find old window.showEffectNotice pattern in meme_game.js');
    process.exit(1);
  }
}

// 2. Update assets/js/meme_online.js
{
  const filePath = path.join(root, 'assets/js/meme_online.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Add lastNotice to memeMirror
  if (!content.includes('if(copy.lastNotice)')) {
    const targetMirror = `if(copy.lastRandom)copy.lastRandom.owner=copy.lastRandom.owner==='player'?'enemy':'player';`;
    const replacementMirror = `if(copy.lastRandom)copy.lastRandom.owner=copy.lastRandom.owner==='player'?'enemy':'player';\n  if(copy.lastNotice)copy.lastNotice.owner=copy.lastNotice.owner==='player'?'enemy':'player';`;
    if (content.includes(targetMirror)) {
      content = content.replace(targetMirror, replacementMirror);
    } else {
      console.error('❌ Could not find targetMirror in meme_online.js');
      process.exit(1);
    }
  }

  // Update line 337 in MEME_ROOM_STATE receiver
  const targetHostClock = `if(memeRoom.role==='host')duel.turnClock=duel.round===priorRound?priorClock:null;`;
  const replacementHostClock = `if(memeRoom.role==='host'){
      if(duel.round===priorRound&&priorClock){
        const guestBonus=(duel.turnClock?.bannerBonus||0)-(priorClock.bannerBonus||0);
        if(guestBonus>0){
          priorClock.deadline+=guestBonus;
          priorClock.bannerBonus=(priorClock.bannerBonus||0)+guestBonus;
        }
        duel.turnClock=priorClock;
      }else{
        duel.turnClock=null;
      }
    }
    if(duel.lastNotice&&duel.lastNotice.serial!==(memeRoom.lastNoticeSerial||0)){
      memeRoom.lastNoticeSerial=duel.lastNotice.serial;
      window.showEffectNotice?.({...duel.lastNotice,fromRemote:true});
    }`;

  if (content.includes(targetHostClock)) {
    content = content.replace(targetHostClock, replacementHostClock);
  } else {
    console.error('❌ Could not find targetHostClock in meme_online.js');
    process.exit(1);
  }

  // Update memeMergeReaction
  const targetMerge = `const local={mode:duel.mode,pending:duel.pending,selected:duel.selected};Object.assign(duel,incoming,local);`;
  const replacementMerge = `const local={mode:duel.mode,pending:duel.pending,selected:duel.selected};
  if(memeRoom?.role==='host'&&duel?.turnClock&&incoming?.turnClock){
    const guestBonus=(incoming.turnClock.bannerBonus||0)-(duel.turnClock.bannerBonus||0);
    if(guestBonus>0){
      duel.turnClock.deadline+=guestBonus;
      duel.turnClock.bannerBonus=(duel.turnClock.bannerBonus||0)+guestBonus;
    }
    local.turnClock=duel.turnClock;
  }
  Object.assign(duel,incoming,local);
  if(duel.lastNotice&&duel.lastNotice.serial!==(memeRoom?.lastNoticeSerial||0)){
    if(memeRoom)memeRoom.lastNoticeSerial=duel.lastNotice.serial;
    window.showEffectNotice?.({...duel.lastNotice,fromRemote:true});
  }`;

  if (content.includes(targetMerge)) {
    content = content.replace(targetMerge, replacementMerge);
  } else {
    console.error('❌ Could not find targetMerge in meme_online.js');
    process.exit(1);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ assets/js/meme_online.js updated with turnClock bannerBonus sync and remote notice display');
}

// 3. Update assets/css/meme_turn_clock.css
{
  const filePath = path.join(root, 'assets/css/meme_turn_clock.css');
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('.clock-paused')) {
    content = content.trim() + '\n#turnClock.clock-paused{border-color:#38bdf8;color:#7dd3fc;background:#0d263b}\n';
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ assets/css/meme_turn_clock.css updated with .clock-paused style');
  }
}

console.log('🎉 All updates applied successfully.');
