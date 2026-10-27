const fs = require('fs');
const path = require('path');

const root = 'C:/Users/Kien/Downloads/honxomlang-main';

// 1. Patch assets/js/site_rank.js
{
  const file = path.join(root, 'assets/js/site_rank.js');
  let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

  const oldPub = `    try {
      await window.memeIdDuel?.publish?.(true);
    } catch (pubErr) {
      console.warn('Rank publish error:', pubErr);
      showRankError(pubErr, 'Xác thực bộ bài leo Rank');
      return;
    }`;

  const newPub = `    try {
      if (identity.user) {
        await window.memeIdDuel?.publish?.(true);
      }
    } catch (pubErr) {
      console.warn('Rank publish error (matchmaking proceeds):', pubErr);
    }`;

  if (code.includes(oldPub)) {
    code = code.replace(oldPub, newPub);
    console.log('site_rank.js: patched publish block');
  }

  const oldStart = `          try {
            if (typeof startGame === 'function') {
              startGame({ customBotDeck: chosenBot.preset });
            } else {
              throw Error('Hàm khởi tạo trận đấu startGame chưa sẵn sàng.');
            }
          } catch (startErr) {
            showRankError(startErr, 'Khởi tạo trận đấu Rank');
          }`;

  const newStart = `          try {
            if (typeof startGame === 'function') {
              startGame({ customBotDeck: chosenBot.preset });
            } else if (typeof window.parent?.startGame === 'function') {
              window.parent.startGame({ customBotDeck: chosenBot.preset });
            } else {
              const frame = document.getElementById('memecardFrame')?.contentWindow;
              if (typeof frame?.startGame === 'function') {
                frame.startGame({ customBotDeck: chosenBot.preset });
              } else {
                throw Error('Hàm khởi tạo trận đấu startGame chưa sẵn sàng.');
              }
            }
          } catch (startErr) {
            showRankError(startErr, 'Khởi tạo trận đấu Rank');
          }`;

  if (code.includes(oldStart)) {
    code = code.replace(oldStart, newStart);
    console.log('site_rank.js: patched startGame fallback');
  }

  const oldPromo = `    document.getElementById('promoPlayBtn').onclick = () => {
      dismiss();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.click();
    };`;

  const newPromo = `    document.getElementById('promoPlayBtn').onclick = () => {
      dismiss();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.click();
      } else if (typeof window.openMemeCardGame === 'function') {
        window.openMemeCardGame();
        setTimeout(() => {
          const frame = document.getElementById('memecardFrame')?.contentWindow;
          if (frame?.siteRank?.find) frame.siteRank.find();
          else if (frame?.document?.getElementById('rankPlayBtn')) frame.document.getElementById('rankPlayBtn').click();
          else if (frame?.document?.getElementById('playBtn')) frame.document.getElementById('playBtn').click();
        }, 600);
      }
    };`;

  if (code.includes(oldPromo)) {
    code = code.replace(oldPromo, newPromo);
    console.log('site_rank.js: patched promoPlayBtn');
  }

  fs.writeFileSync(file, code, 'utf8');
}

// 2. Patch assets/js/site_rank_players.js
{
  const file = path.join(root, 'assets/js/site_rank_players.js');
  let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

  const oldLoginCheck = `    if (!identity.user) {
      try { await identity.login(); } catch(e) { console.warn('Challenge login:', e); }
      if (!identity.user) throw Error('Bạn cần đăng nhập Google để khiếu chiến đối thủ.');
    }`;

  const newLoginCheck = `    if (!identity?.user) {
      try {
        if (typeof identity?.login === 'function' && !identity.signing) {
          await Promise.race([identity.login(), new Promise(r => setTimeout(r, 1200))]);
        }
      } catch(e) { console.warn('Challenge login:', e); }
    }`;

  if (code.includes(oldLoginCheck)) {
    code = code.replace(oldLoginCheck, newLoginCheck);
    console.log('site_rank_players.js: patched challenge() login check');
  } else {
    // try regex replace
    const reg = /if\s*\(!identity\.user\)\s*\{\s*try\s*\{\s*await\s+identity\.login\(\);\s*\}\s*catch\(e\)\s*\{[^\}]*\}\s*if\s*\(!identity\.user\)\s*throw\s+Error\('Bạn cần đăng nhập Google để khiếu chiến đối thủ\.'\);\s*\}/;
    if (reg.test(code)) {
      code = code.replace(reg, `if (!identity?.user) {
      try {
        if (typeof identity?.login === 'function' && !identity.signing) {
          await Promise.race([identity.login(), new Promise(r => setTimeout(r, 1200))]);
        }
      } catch(e) { console.warn('Challenge login:', e); }
    }`);
      console.log('site_rank_players.js: patched challenge() login check via regex');
    } else {
      console.warn('site_rank_players.js: login check pattern not matched');
    }
  }

  fs.writeFileSync(file, code, 'utf8');
}

// 3. Patch assets/js/meme_id_duel.js
{
  const file = path.join(root, 'assets/js/meme_id_duel.js');
  let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

  const oldLookup = ` async function lookup(value){if(!uid)throw Error('Hãy đăng nhập Google.');const id=String(value||'').trim();if(!/^[A-Za-z0-9_-]{1,128}$/.test(id))throw Error('Không tìm thấy người chơi.');if(id===uid)throw Error('Bạn không thể khiêu chiến chính mình.');await publish();const snap=await store.doc('duel_players/'+id).get();if(!snap.exists){return {uid:id,name:'Đấu sĩ #'+id.slice(0,5),main:[...defaultDeck()],extra:[...defaultExtraDeck()],heroId:0,protocol:MEME_RULES_VERSION};}const p=snap.data();if(!valid(p)){p.main=[...defaultDeck()];p.extra=[...defaultExtraDeck()];p.heroId=validHero(p.heroId)?p.heroId:0;}return p;}`;

  const newLookup = ` async function lookup(value){const id=String(value||'').trim();if(!/^[A-Za-z0-9_-]{1,128}$/.test(id))throw Error('Không tìm thấy người chơi.');if(uid&&id===uid)throw Error('Bạn không thể khiêu chiến chính mình.');try{if(uid)await publish();}catch(_){}let snap=null;try{if(store)snap=await store.doc('duel_players/'+id).get();}catch(e){console.warn('Lookup player doc error:',e);}if(!snap||!snap.exists){return {uid:id,name:'Đấu sĩ #'+id.slice(0,5),main:[...defaultDeck()],extra:[...defaultExtraDeck()],heroId:0,protocol:MEME_RULES_VERSION};}const p=snap.data();if(!valid(p)){p.main=[...defaultDeck()];p.extra=[...defaultExtraDeck()];p.heroId=validHero(p.heroId)?p.heroId:0;}return p;}`;

  if (code.includes(oldLookup)) {
    code = code.replace(oldLookup, newLookup);
    console.log('meme_id_duel.js: patched lookup()');
  }

  const oldChall = `  async function challenge(id){
    if(!identity.user){await identity.login();await identity.whenReady;}if(busy())throw Error('Hãy kết thúc hoặc rời trận hiện tại trước khi khiêu chiến.');const p=await lookup(id);if(online(p)&&memeParent()&&memeMyId())return invite(p);ghost(p);
  }`;

  const newChall = `  async function challenge(id){
    if(!identity.user){try{if(typeof identity.login==='function'&&!identity.signing)await Promise.race([identity.login(),new Promise(r=>setTimeout(r,1200))]);}catch(_){}}if(busy())throw Error('Hãy kết thúc hoặc rời trận hiện tại trước khi khiêu chiến.');const p=await lookup(id);if(uid&&online(p)&&memeParent()&&memeMyId())return invite(p);ghost(p);
  }`;

  if (code.includes(oldChall)) {
    code = code.replace(oldChall, newChall);
    console.log('meme_id_duel.js: patched challenge()');
  }

  const oldGhost = ` function ghost(p){if(!valid(p))throw Error('Bộ bài không hợp lệ.');startGame({ghost:p});}`;
  const newGhost = ` function ghost(p){if(!valid(p)){p.main=[...defaultDeck()];p.extra=[...defaultExtraDeck()];p.heroId=validHero(p.heroId)?p.heroId:0;}startGame({ghost:p});}`;

  if (code.includes(oldGhost)) {
    code = code.replace(oldGhost, newGhost);
    console.log('meme_id_duel.js: patched ghost()');
  }

  fs.writeFileSync(file, code, 'utf8');
}

console.log('apply-rank-fixes: completed.');
