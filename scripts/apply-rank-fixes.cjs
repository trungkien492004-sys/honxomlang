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

// ────────────────── 1. PATCH site_rank.js ──────────────────
patchFile('assets/js/site_rank.js', content => {
  let c = content;

  // Insert showRankError definition
  const targetTop = `let profile = null, poll = null, searching = false, queueBusy = false, unwatchProfile = null, unwatchStats = null;`;
  const showRankErrorDef = `let profile = null, poll = null, searching = false, queueBusy = false, unwatchProfile = null, unwatchStats = null;

  function showRankError(error, context = 'Đấu Rank') {
    const rawMsg = typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error) || 'Lỗi không xác định');
    const stack = error?.stack || '';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    const errObj = { message: rawMsg, stack, context, time: now.toISOString(), timeStr };
    try { localStorage.setItem('last_rank_error', JSON.stringify(errObj)); } catch {}
    window.lastRankError = errObj;
    if (window.parent && window.parent !== window) {
      try { window.parent.lastRankError = errObj; } catch {}
    }
    console.error(\`[LỖI ĐẤU RANK · \${context}]:\`, error);

    document.getElementById('rankErrorBanner')?.remove();
    const banner = document.createElement('div');
    banner.id = 'rankErrorBanner';
    banner.className = 'rank-error-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = \`
      <div class="rank-error-content">
        <div class="rank-error-header">
          <span class="rank-error-icon">🚨</span>
          <strong>LỖI ĐẤU RANK · \${esc(context)}</strong>
          <span class="rank-error-time">[\${timeStr}]</span>
          <button type="button" class="rank-error-close" id="closeRankErrorBtn" aria-label="Đóng">✕</button>
        </div>
        <div class="rank-error-msg">\${esc(rawMsg)}</div>
        <div class="rank-error-actions">
          <button type="button" class="rank-error-copy-btn" id="copyRankErrorBtn">📋 Sao chép lỗi để gửi dev</button>
          <span class="rank-error-tip">Đã lưu lỗi vào bộ nhớ để kiểm tra</span>
        </div>
      </div>
    \`;
    document.body.appendChild(banner);
    const closeBtn = document.getElementById('closeRankErrorBtn');
    if (closeBtn) closeBtn.onclick = () => banner.remove();
    const copyBtn = document.getElementById('copyRankErrorBtn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const text = \`[LỖI ĐẤU RANK · \${context}]\\nThời gian: \${timeStr}\\nChi tiết: \${rawMsg}\${stack ? '\\nStack: ' + stack : ''}\`;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = '✅ Đã sao chép!';
            setTimeout(() => { if (copyBtn) copyBtn.textContent = '📋 Sao chép lỗi để gửi dev'; }, 2000);
          }).catch(() => prompt('Sao chép thông tin lỗi:', text));
        } else {
          prompt('Sao chép thông tin lỗi:', text);
        }
      };
    }
  }
  window.showRankError = showRankError;
  if (window.parent && window.parent !== window) {
    try { window.parent.showRankError = showRankError; } catch {}
  }

  function appendLastErrorNotice(summary) {
    if (!summary) return;
    try {
      summary.querySelector('.rank-last-error-notice')?.remove();
      const savedErr = localStorage.getItem('last_rank_error');
      if (savedErr) {
        const errData = JSON.parse(savedErr);
        const errDiv = document.createElement('div');
        errDiv.className = 'rank-last-error-notice';
        errDiv.style.cssText = 'margin-top:7px;display:flex;align-items:center;justify-content:space-between;background:rgba(239,68,68,0.18);border:1px solid #ef4444;border-radius:6px;padding:5px 8px;font-size:11.5px;color:#fee2e2;gap:6px;';
        errDiv.innerHTML = \`<span>⚠️ Lỗi Rank gần nhất: <b>\${esc(errData.context || 'Đấu Rank')}</b> (\${esc(errData.timeStr || '')})</span><button type="button" style="background:#b91c1c;border:1px solid #f87171;color:#fff;border-radius:4px;padding:2px 7px;font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;">🚨 Mở lỗi đỏ</button>\`;
        errDiv.querySelector('button').onclick = () => showRankError(errData.message, errData.context);
        summary.appendChild(errDiv);
      }
    } catch {}
  }`;

  if (!c.includes('function showRankError')) {
    c = c.replace(targetTop, showRankErrorDef);
  } else if (!c.includes('function appendLastErrorNotice')) {
    c = c.replace('function localTier(rating) {', `function appendLastErrorNotice(summary) {
    if (!summary) return;
    try {
      summary.querySelector('.rank-last-error-notice')?.remove();
      const savedErr = localStorage.getItem('last_rank_error');
      if (savedErr) {
        const errData = JSON.parse(savedErr);
        const errDiv = document.createElement('div');
        errDiv.className = 'rank-last-error-notice';
        errDiv.style.cssText = 'margin-top:7px;display:flex;align-items:center;justify-content:space-between;background:rgba(239,68,68,0.18);border:1px solid #ef4444;border-radius:6px;padding:5px 8px;font-size:11.5px;color:#fee2e2;gap:6px;';
        errDiv.innerHTML = \`<span>⚠️ Lỗi Rank gần nhất: <b>\${esc(errData.context || 'Đấu Rank')}</b> (\${esc(errData.timeStr || '')})</span><button type="button" style="background:#b91c1c;border:1px solid #f87171;color:#fff;border-radius:4px;padding:2px 7px;font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;">🚨 Mở lỗi đỏ</button>\`;
        errDiv.querySelector('button').onclick = () => showRankError(errData.message, errData.context);
        summary.appendChild(errDiv);
      }
    } catch {}
  }\n\n  function localTier(rating) {`);
  }

  // Hook appendLastErrorNotice into paintProgress
  if (!c.includes('appendLastErrorNotice(summary);')) {
    c = c.replace(`if (btn) btn.onclick = () => identity.login();\n      return;`, `if (btn) btn.onclick = () => identity.login();\n      appendLastErrorNotice(summary);\n      return;`);
    c = c.replace(`<div class="rank-progress-bottom"><span>\${esc(progress)}</span><span>\${wins} thắng · \${losses} thua · \${draws} hòa (\${played} trận)</span></div>\`;`, `<div class="rank-progress-bottom"><span>\${esc(progress)}</span><span>\${wins} thắng · \${losses} thua · \${draws} hòa (\${played} trận)</span></div>\`;\n    appendLastErrorNotice(summary);`);
  }

  // In show(), catch error with showRankError
  const oldShowCatch = `} catch (error) { if (overlay.isConnected) document.getElementById('rankEmpty').textContent = error.message; }`;
  const newShowCatch = `} catch (error) {
      if (overlay.isConnected) document.getElementById('rankEmpty').textContent = error.message;
      showRankError(error, 'Tải Bảng Xếp Hạng');
    }`;
  c = c.replace(oldShowCatch, newShowCatch);

  // In find():
  // 1. publish(true) catch error should showRankError and stop!
  const oldPublish = `try { await window.memeIdDuel?.publish?.(true); } catch (_) {}`;
  const newPublish = `try {
      await window.memeIdDuel?.publish?.(true);
    } catch (pubErr) {
      console.warn('Rank publish error:', pubErr);
      showRankError(pubErr, 'Xác thực bộ bài leo Rank');
      return;
    }`;
  c = c.replace(oldPublish, newPublish);

  // 2. Directory scan error handling & candidate invite catch handling
  const oldCandidateInvite = `          try {
            const target = await window.memeIdDuel?.lookup?.(candidate.uid);
            if (target && window.memeIdDuel?.online?.(target)) {
              window.memeIdDuel?.invite?.(target).catch(() => {});
            }
          } catch (_) {}`;
  const newCandidateInvite = `          try {
            const target = await window.memeIdDuel?.lookup?.(candidate.uid);
            if (target && window.memeIdDuel?.online?.(target)) {
              window.memeIdDuel?.invite?.(target).catch(invErr => {
                console.warn('Rank invite error:', invErr);
                const sEl = document.getElementById('rankMatchStatus');
                if (sEl) sEl.textContent = \`⚠️ Lời mời tới \${candidate.name} thất bại: \${invErr.message}. Tiếp tục tìm kiếm...\`;
              });
            }
          } catch (candErr) {
            console.warn('Lookup candidate error:', candErr);
          }`;
  c = c.replace(oldCandidateInvite, newCandidateInvite);

  // Directory scan catch
  const oldDirScanCatch = `    } catch (e) {
      console.warn('Matchmaking directory scan:', e);
    }`;
  const newDirScanCatch = `    } catch (e) {
      console.warn('Matchmaking directory scan:', e);
      showRankError(e, 'Quét tìm đối thủ Online');
    }`;
  c = c.replace(oldDirScanCatch, newDirScanCatch);

  // 3. Matchmaking bot start fallback wrapped in try/catch
  const oldBotStart = `          if (typeof startGame === 'function') {
            startGame({ customBotDeck: chosenBot.preset });
          }`;
  const newBotStart = `          try {
            if (typeof startGame === 'function') {
              startGame({ customBotDeck: chosenBot.preset });
            } else {
              throw Error('Hàm khởi tạo trận đấu startGame chưa sẵn sàng.');
            }
          } catch (startErr) {
            showRankError(startErr, 'Khởi tạo trận đấu Rank');
          }`;
  c = c.replace(oldBotStart, newBotStart);

  return c;
});

// ────────────────── 2. PATCH meme_id_duel.js ──────────────────
patchFile('assets/js/meme_id_duel.js', content => {
  let c = content;

  // Enhance error(e) to invoke showRankError
  const oldErrorFn = `function error(e){const n=$('idDuelError');if(n)n.textContent=e.message||'Không kết nối được. Hãy thử lại.';else notify(e.message||'Không kết nối được.');}`;
  const newErrorFn = `function error(e){
  const n=$('idDuelError');
  if(n)n.textContent=e.message||'Không kết nối được. Hãy thử lại.';
  else notify(e.message||'Không kết nối được.');
  if (typeof window.showRankError === 'function') window.showRankError(e, 'Hệ thống Rank');
  else if (typeof window.parent?.showRankError === 'function') window.parent.showRankError(e, 'Hệ thống Rank');
}`;
  c = c.replace(oldErrorFn, newErrorFn);

  // In publish: detailed deck problem message
  const oldValidCheck = `if(!valid(p))throw Error('Bộ bài đang dùng chưa hợp lệ.');`;
  const newValidCheck = `const prob = deckProblem(p.main, p.extra);
  if(prob) throw Error('Bộ bài đang dùng chưa hợp lệ: ' + prob);
  if(!valid(p)) throw Error('Bộ bài đang dùng chưa hợp lệ (nhân vật hoặc số lượng bài sai).');`;
  c = c.replace(oldValidCheck, newValidCheck);

  // In recordResult:
  // 1. Ensure rawMatchId and opponentUid are guaranteed
  const oldMatchIdCheck = `const rawMatchId=match?.rankChallengeId||memeRoom?.challengeId,opponentUid=match?.rankChallengeOpponentUid||memeRoom?.rankOpponentUid||match?.ghostOpponent?.uid;
      if(!match?.finished||!rawMatchId||!opponentUid||opponentUid===currentUid||!currentStore)return null;`;
  const newMatchIdCheck = `let rawMatchId=match?.rankChallengeId||memeRoom?.challengeId;
      let opponentUid=match?.rankChallengeOpponentUid||memeRoom?.rankOpponentUid||match?.ghostOpponent?.uid;
      if (!rawMatchId) {
        const botGroup = (typeof HEROES !== 'undefined' && HEROES[match?.enemy?.heroId]?.group || 'kaiba').toLowerCase();
        rawMatchId = 'bot-' + crypto.randomUUID().replaceAll('-', '').slice(0, 24);
        opponentUid = opponentUid || ('bot-' + botGroup);
        if (match) {
          match.rankChallengeId = rawMatchId;
          match.rankChallengeOpponentUid = opponentUid;
        }
      }
      if (!opponentUid) {
        const botGroup = (typeof HEROES !== 'undefined' && HEROES[match?.enemy?.heroId]?.group || 'kaiba').toLowerCase();
        opponentUid = 'bot-' + botGroup;
        if (match) match.rankChallengeOpponentUid = opponentUid;
      }
      if(!match?.finished||!rawMatchId||!opponentUid||opponentUid===currentUid||!currentStore)return null;`;
  c = c.replace(oldMatchIdCheck, newMatchIdCheck);

  // 2. Accurate Bot Elo lookup
  const oldOpponentRating = `const rating=Math.max(0,Math.round(Number(mine.rating)||1000)),opponentRating=isBot?1000:Math.max(0,Math.round(Number(opponent.rating)||1000));`;
  const newOpponentRating = `const LEGEND_BOT_ELOS = { 'bot-kaiba': 1550, 'bot-yugi': 1600, 'bot-zane': 1450, 'bot-jaden': 1350, 'bot-pegasus': 1250, 'bot-joey': 1150 };
        const rating=Math.max(0,Math.round(Number(mine.rating)||1000)),opponentRating=isBot?(match?.botOpponent?.elo||LEGEND_BOT_ELOS[opponentUid]||1200):Math.max(0,Math.round(Number(opponent.rating)||1000));`;
  c = c.replace(oldOpponentRating, newOpponentRating);

  // 3. Catch error in recordResult promise and call showRankError
  const oldRecordCatch = `    const promise=run().catch(e=>{
      console.error('Không cập nhật được kết quả khiêu chiến:',e);
      const errObj={error:e.message||'Lỗi lưu BXH'};
      updateResultUI(errObj);
      if (typeof window.showRankError === 'function') window.showRankError(e, 'Lưu kết quả Rank lên BXH');
      else if (typeof window.parent?.showRankError === 'function') window.parent.showRankError(e, 'Lưu kết quả Rank lên BXH');
      return errObj;
    });`;
  const newRecordCatch = `    const promise=run().catch(e=>{
      console.error('Không cập nhật được kết quả khiêu chiến:',e);
      const errObj={error:e.message||'Lỗi lưu BXH'};
      if (match) match.rankChallengeResult = errObj;
      updateResultUI(errObj);
      if (typeof window.showRankError === 'function') window.showRankError(e, 'Lưu kết quả Rank lên BXH');
      else if (typeof window.parent?.showRankError === 'function') window.parent.showRankError(e, 'Lưu kết quả Rank lên BXH');
      return errObj;
    });`;
  c = c.replace(oldRecordCatch, newRecordCatch);

  // Export updateResultUI
  if (!c.includes('updateResultUI,')) {
    c = c.replace('window.memeIdDuel={', 'window.memeIdDuel={updateResultUI,');
  }

  // 4. In updateResultUI: add "Thử lưu lại" retry button on error
  const oldReceiptErrorUI = `    }else if(receipt.error){
      note.style.color='#ef4444';
      note.textContent=\`⚠️ Chưa đồng bộ BXH: \${receipt.error}\`;
    }`;
  const newReceiptErrorUI = `    }else if(receipt.error){
      note.style.color='#ef4444';
      note.style.fontWeight='bold';
      note.innerHTML=\`⚠️ Chưa đồng bộ BXH: \${esc(receipt.error)} <button type="button" class="rank-error-copy-btn" id="retrySyncEloBtn" style="margin-left:8px;padding:3px 8px;font-size:11px;background:#b91c1c;color:#fff;border:1px solid #ef4444;border-radius:6px;cursor:pointer;">🔄 Thử lưu lại</button>\`;
      setTimeout(()=>{
        const retryBtn = document.getElementById('retrySyncEloBtn');
        if (retryBtn) retryBtn.onclick = async () => {
          retryBtn.disabled = true; retryBtn.textContent = 'Đang thử lại...';
          if (duel) delete duel._recordResultPromise;
          const res = await recordResult(duel);
          if (res && !res.error) updateResultUI(res);
          else { retryBtn.disabled = false; retryBtn.textContent = 'Thử lại thất bại'; }
        };
      }, 50);
    }`;
  c = c.replace(oldReceiptErrorUI, newReceiptErrorUI);

  return c;
});

// ────────────────── 3. PATCH site_rank_players.js ──────────────────
patchFile('assets/js/site_rank_players.js', content => {
  let c = content;

  // In tbody.onclick: handle bot challenge when in parent window (index.html)
  const oldBotBranch = `          if (typeof startGame === 'function') {
            startGame({ customBotDeck: preset, ghost: null });
          } else {
            await challenge(targetUid);
          }`;
  const newBotBranch = `          if (typeof startGame === 'function') {
            startGame({ customBotDeck: preset, ghost: null });
          } else {
            if (typeof window.openMemeCardGame !== 'function') throw Error('Hãy mở đấu bài từ sảnh để khiêu chiến.');
            window.openMemeCardGame();
            let started = false;
            for (let i = 0; i < 100; i++) {
              const child = document.getElementById('memecardFrame')?.contentWindow;
              if (typeof child?.startGame === 'function') {
                child.startGame({ customBotDeck: preset, ghost: null });
                started = true;
                break;
              }
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (!started) throw Error('Chưa mở được đấu bài. Hãy thử lại.');
          }`;
  c = c.replace(oldBotBranch, newBotBranch);

  // In catch (error): invoke showRankError
  const oldPlayerCatch = `      } catch (error) {
        if (window.showActionNotice) {
          window.showActionNotice('⚠️ ' + (error.message || 'Không thể khiêu chiến đối thủ.'));
        } else {
          alert(error.message || 'Không thể khiêu chiến đối thủ.');
        }
      }`;
  const newPlayerCatch = `      } catch (error) {
        if (typeof window.showRankError === 'function') {
          window.showRankError(error, 'Khiêu chiến đối thủ');
        } else if (typeof window.parent?.showRankError === 'function') {
          window.parent.showRankError(error, 'Khiêu chiến đối thủ');
        } else if (window.showActionNotice) {
          window.showActionNotice('⚠️ ' + (error.message || 'Không thể khiêu chiến đối thủ.'));
        } else {
          alert(error.message || 'Không thể khiêu chiến đối thủ.');
        }
      }`;
  c = c.replace(oldPlayerCatch, newPlayerCatch);

  return c;
});

// ────────────────── 4. PATCH meme_online.js ──────────────────
patchFile('assets/js/meme_online.js', content => {
  let c = content;

  // In MEME_ROOM_JOIN sending at line 136: include guestUid
  const oldJoinSend = `memeSend('MEME_ROOM_JOIN', { guestName: memeMyName(), deck: [...deckList], extraDeck:[...extraDeckList],heroId:chosenHero });`;
  const newJoinSend = `memeSend('MEME_ROOM_JOIN', { guestName: memeMyName(), guestUid: (window.siteIdentity?.user?.uid || null), deck: [...deckList], extraDeck:[...extraDeckList],heroId:chosenHero });`;
  c = c.replace(oldJoinSend, newJoinSend);

  // In MEME_ROOM_JOIN receiving at line 264: save guestUid
  const oldJoinReceive = `    memeRoom.peerId = msg.id;
    memeRoom.peerName = msg.guestName || 'Khách';
    memeRoom.peerDeck = [...msg.deck];`;
  const newJoinReceive = `    memeRoom.peerId = msg.id;
    memeRoom.peerName = msg.guestName || 'Khách';
    if (msg.guestUid) {
      memeRoom.peerUid = msg.guestUid;
      memeRoom.rankOpponentUid = msg.guestUid;
    }
    memeRoom.peerDeck = [...msg.deck];`;
  c = c.replace(oldJoinReceive, newJoinReceive);

  return c;
});

// ────────────────── 5. PATCH meme_game.js ──────────────────
patchFile('assets/js/meme_game.js', content => {
  let c = content;

  // In finish(): notify showRankError if rankPromise fails
  const oldFinishRankPromise = `  const rankPromise = window.memeIdDuel?.recordResult?.(match)?.catch(e => {
    console.warn('Rank record error:', e);
    return { error: e.message || 'Lỗi đồng bộ BXH' };
  });`;
  const newFinishRankPromise = `  const rankPromise = window.memeIdDuel?.recordResult?.(match)?.catch(e => {
    console.warn('Rank record error:', e);
    if (typeof window.showRankError === 'function') {
      window.showRankError(e, 'Đồng bộ kết quả Rank');
    } else if (typeof window.parent?.showRankError === 'function') {
      window.parent.showRankError(e, 'Đồng bộ kết quả Rank');
    }
    return { error: e.message || 'Lỗi đồng bộ BXH' };
  });`;
  c = c.replace(oldFinishRankPromise, newFinishRankPromise);

  // In showMatchResult: support retry button for receipt.error
  const oldReceiptErrorText = `} else if (receipt?.error) {
    rankText = \`<p class="rank-challenge-result" style="color:#ef4444;">⚠️ Chưa đồng bộ BXH: \${esc(receipt.error)}</p>\`;`;
  const newReceiptErrorText = `} else if (receipt?.error) {
    rankText = \`<p class="rank-challenge-result" style="color:#ef4444;font-weight:bold;">⚠️ Chưa đồng bộ BXH: \${esc(receipt.error)} <button type="button" class="rank-error-copy-btn" id="retrySyncEloBtn" style="margin-left:8px;padding:3px 8px;font-size:11px;background:#b91c1c;color:#fff;border:1px solid #ef4444;border-radius:6px;cursor:pointer;">🔄 Thử lưu lại</button></p>\`;`;
  c = c.replace(oldReceiptErrorText, newReceiptErrorText);

  const oldShowModalEnd = `showModal(\`<span class="result-icon">\${won?'🏆':'💀'}</span><h2>\${won?'Chiến thắng!':'Thất bại!'}</h2><p>\${esc(reason||'Trận đấu đã kết thúc.')}</p>\${rankText}<div class="result-actions" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap"><button class="primary-btn" id="againBtn">⚔️ Đấu lại</button><button class="secondary-btn" id="resultLobbyBtn">🏠 Về sảnh</button></div>\`);`;
  const newShowModalEnd = `showModal(\`<span class="result-icon">\${won?'🏆':'💀'}</span><h2>\${won?'Chiến thắng!':'Thất bại!'}</h2><p>\${esc(reason||'Trận đấu đã kết thúc.')}</p>\${rankText}<div class="result-actions" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap"><button class="primary-btn" id="againBtn">⚔️ Đấu lại</button><button class="secondary-btn" id="resultLobbyBtn">🏠 Về sảnh</button></div>\`);
  const retryBtn = document.getElementById('retrySyncEloBtn');
  if (retryBtn) {
    retryBtn.onclick = async () => {
      retryBtn.disabled = true;
      retryBtn.textContent = 'Đang thử lại...';
      if (match) delete match._recordResultPromise;
      const res = await window.memeIdDuel?.recordResult?.(match);
      if (res && !res.error) {
        window.memeIdDuel?.updateResultUI?.(res);
      } else {
        retryBtn.disabled = false;
        retryBtn.textContent = 'Thử lại thất bại';
      }
    };
  }`;
  c = c.replace(oldShowModalEnd, newShowModalEnd);

  return c;
});

console.log('All patches completed.');
