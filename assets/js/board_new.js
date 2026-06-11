// ===== ðŸ   BOARD_NEW.JS â€” Cá»  Ä ua Sinh Tá»“n v4.0 (Yu-Gi-Oh Style) =====
'use strict';
var boardGame = null;
const BOARD_TOTAL_CELLS = 60;

const RACE_DICE_EMOJIS = ['âš€','âš ','âš‚','âšƒ','âš„','âš…'];
const RACE_PLAYER_COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b'];
const NEIGHBORHOOD_NAMES = [
    "NhÃ  HÃ’A", "QuÃ¡n Net THU THáº¢O", "NhÃ  Máº®M", "Háº»m Táº¸T", "Táº¡p hÃ³a THÆ¯Æ NG HIá»€N",
    "Chá»‘t báº£o vá»‡ KIÃŠN", "Tráº¡m sáº¡c HECK", "NhÃ  Háº¢I", "QuÃ¡n bida TRÃ’N", "NhÃ  Káº¾T",
    "QuÃ¡n nháº­u HUY", "BÃ£i rÃ¡c Náº¤M", "NhÃ  LÃ™N", "Lá»— cá»‘ng QUÃ‚N", "Tiá»‡m cáº¯t tÃ³c BI", "SÃ¢n banh Bá»P",
    "Gá»‘c Ä‘a LÃ ng", "Chuá»“ng GÃ ", "Cá»™t Äiá»‡n", "Ao CÃ¡"
];

// â”€â”€ Kho Tháº» BÃ i (HÆ¡n 20 tháº», phÃ¢n loáº¡i theo Type) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RACE_CARDS = [
    // ðŸ‘¾ MONSTER (QuÃ¡i Váº­t) - Máº¥t máº¡ng náº¿u khÃ´ng cÃ³ vÅ© khÃ­
    { name: "SÃ³i XÃ¡m Äá»™t Biáº¿n", type: 'monster', rarity: 'common', desc: "Gáº·p quÃ¡i váº­t! Trá»« 1 máº¡ng náº¿u khÃ´ng cÃ³ VÅ© KhÃ­.", 
      effect: p => boardFightMonster(p, "SÃ³i XÃ¡m", 30) },
    { name: "CÆ°Æ¡ng Thi LÃ ng", type: 'monster', rarity: 'rare', desc: "Gáº·p quÃ¡i váº­t! Trá»« 1 máº¡ng náº¿u khÃ´ng cÃ³ VÅ© KhÃ­.", 
      effect: p => boardFightMonster(p, "CÆ°Æ¡ng Thi", 50) },
    { name: "Rá»“ng Lá»­a Cá»• Äáº¡i", type: 'monster', rarity: 'epic', desc: "TrÃ¹m Rá»“ng! Trá»« 2 máº¡ng náº¿u khÃ´ng cÃ³ KhiÃªn/VÅ© khÃ­ cháº·n.", 
      effect: p => boardFightMonster(p, "Rá»“ng Lá»­a", 100, 2) },

    // ðŸ—¡ï¸ EQUIP (Trang bá»‹)
    { name: "Kiáº¿m Sáº¯t XÃ³m", type: 'equip', rarity: 'common', desc: "Nháº­n 1 ðŸ—¡ï¸ VÅ© KhÃ­! DÃ¹ng Ä‘á»ƒ Ä‘Ã¡nh quÃ¡i hoáº·c cÆ°á»›p máº¡ng Ä‘á»‘i thá»§.", 
      effect: p => { p.weapons++; return 'Nháº·t Ä‘Æ°á»£c 1 ðŸ—¡ï¸ VÅ© KhÃ­!'; } },
    { name: "Cung Gá»— Tráº¯c", type: 'equip', rarity: 'common', desc: "Nháº­n 1 ðŸ—¡ï¸ VÅ© KhÃ­!", 
      effect: p => { p.weapons++; return 'Nháº·t Ä‘Æ°á»£c Cung! (+1 ðŸ—¡ï¸)'; } },
    { name: "KhiÃªn Gá»— Má»™c", type: 'equip', rarity: 'common', desc: "Nháº­n 1 ðŸ›¡ï¸ KhiÃªn! Cháº·n 1 Ä‘Ã²n chÃ­ tá»­.", 
      effect: p => { p.shields++; return 'Nháº·t Ä‘Æ°á»£c 1 ðŸ›¡ï¸ KhiÃªn!'; } },
    { name: "KhiÃªn ThÃ©p Äen", type: 'equip', rarity: 'rare', desc: "Nháº­n 1 ðŸ›¡ï¸ KhiÃªn siÃªu cáº¥p!", 
      effect: p => { p.shields++; return 'Nháº­n 1 ðŸ›¡ï¸ KhiÃªn!'; } },
    { name: "Há»™p Cá»©u ThÆ°Æ¡ng", type: 'equip', rarity: 'epic', desc: "Há»“i láº¡i 1 â¤ï¸ Máº¡ng (Tá»‘i Ä‘a 3).", 
      effect: p => { if(p.lives < 3) { p.lives++; return 'Há»“i 1 â¤ï¸ Máº¡ng!'; } return 'Máº¡ng Ä‘Ã£ Ä‘áº§y, khÃ´ng tÃ¡c dá»¥ng.'; } },

    // ðŸŒªï¸ SPELL (Ma phÃ¡p di chuyá»ƒn / há»— trá»£)
    { name: "Cuá»“ng Phong", type: 'spell', rarity: 'common', desc: "Tiáº¿n thÃªm 3 Ã´!", 
      effect: p => { boardMovePlayer(p.idx, 3, true); return 'Tiáº¿n 3 Ã´.'; } },
    { name: "Lá»‘c XoÃ¡y", type: 'spell', rarity: 'common', desc: "LÃ¹i 2 Ã´!", 
      effect: p => { boardMovePlayer(p.idx, -2, true); return 'LÃ¹i 2 Ã´.'; } },
    { name: "RÆ°Æ¡ng VÃ ng", type: 'spell', rarity: 'rare', desc: "+50 VÃ ng!", 
      effect: p => { if(p.isHuman||p.networkId===myNetworkId) { player.gold+=50; refreshHudDisplay(); } return 'Nháº­n 50 vÃ ng.'; } },
    { name: "Dá»‹ch Chuyá»ƒn KhÃ´ng Gian", type: 'spell', rarity: 'epic', desc: "Äá»•i chá»— vá»›i ngÆ°á»i gáº§n nháº¥t!", 
      effect: p => boardSwapNearest(p) },
    { name: "TÄƒng Tá»‘c Sinh Tá»“n", type: 'spell', rarity: 'rare', desc: "Tiáº¿n 5 Ã´ vÃ  nháº­n 1 KhiÃªn!", 
      effect: p => { p.shields++; boardMovePlayer(p.idx, 5, true); return 'Tiáº¿n 5 Ã´ + 1 ðŸ›¡ï¸ KhiÃªn.'; } },

    // ðŸ’£ TRAP (Cáº¡m báº«y)
    { name: "Há»‘ ChÃ´ng Trá»«ng Pháº¡t", type: 'trap', rarity: 'rare', desc: "Trá»« 1 máº¡ng ngay láº­p tá»©c!", 
      effect: p => { return boardTakeDamage(p, 1, "Há»‘ ChÃ´ng"); } },
    { name: "SÃ©t ÄÃ¡nh", type: 'trap', rarity: 'epic', desc: "NgÆ°á»i dáº«n Ä‘áº§u máº¥t 1 máº¡ng!", 
      effect: p => { 
          const L = boardGame.players.filter(x=>!x.eliminated).reduce((a,b) => a.pos > b.pos ? a : b); 
          if(L) return boardTakeDamage(L, 1, "SÃ©t ÄÃ¡nh"); 
          return 'KhÃ´ng cÃ³ ai bá»‹ sÃ©t Ä‘Ã¡nh.';
      } 
    },
];

// HÃ m Xá»­ lÃ½ ÄÃ¡nh QuÃ¡i (Tá»± Ä‘á»™ng)
function boardFightMonster(p, mName, reward, damage = 1) {
    if (p.weapons > 0) {
        p.weapons--;
        if(p.isHuman||p.networkId===myNetworkId) { player.gold += reward; refreshHudDisplay(); }
        return `DÃ¹ng ðŸ—¡ï¸ diá»‡t ${mName}! ThÆ°á»Ÿng ${reward}ðŸ’°`;
    } else {
        return boardTakeDamage(p, damage, `Bá»‹ ${mName} cáº¯n`);
    }
}

// HÃ m Xá»­ lÃ½ Máº¥t Máº¡ng
function boardTakeDamage(p, amount, reason) {
    if (p.shields > 0) {
        p.shields--;
        return `ðŸ›¡ï¸ DÃ¹ng KhiÃªn cháº·n Ä‘Æ°á»£c Ä‘Ã²n (${reason})!`;
    }
    p.lives -= amount;
    if (p.lives <= 0) {
        p.eliminated = true;
        boardAddLog(`ðŸ’€ ${p.name} Ä‘Ã£ Bá»Š LOáº I KHá»ŽI CUá»˜C CHÆ I!`, 'win');
        return `ðŸ’€ Háº¿t máº¡ng! Báº N ÄÃƒ Bá»Š LOáº I!`;
    }
    return `ðŸ’” Máº¥t ${amount} máº¡ng vÃ¬ ${reason}! (CÃ²n ${p.lives}â¤ï¸)`;
}

// â”€â”€ Váº½ tháº» bÃ i 3D â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.boardDrawRandomCard = function(p, reason, callback) {
    if(boardGame.gameOver || p.eliminated) {
        if(callback) callback();
        return;
    }
    const roll = Math.random() * 100;
    let tier = roll < 50 ? 'common' : roll < 80 ? 'rare' : 'epic';
    let pool = RACE_CARDS.filter(c => c.rarity === tier);
    if(!pool.length) pool = RACE_CARDS;
    let card = pool[Math.floor(Math.random() * pool.length)];
    
    let result = card.effect(p);
    
    const badgeClass  = `badge-${card.rarity}`;
    const typeIcon = card.type === 'monster' ? 'ðŸ‘¾' : card.type === 'equip' ? 'ðŸ›¡ï¸' : card.type === 'trap' ? 'ðŸ’£' : 'ðŸŒªï¸';

    document.getElementById('boardCardDisplay').innerHTML = `
        <div class="drawn-card card-3d-flip ${card.type}-card">
            <span class="card-rarity-badge ${badgeClass}">${card.rarity.toUpperCase()}</span>
            <div style="font-size:1.4rem;margin:8px 0;">${typeIcon} ${card.name}</div>
            <div style="font-size:0.8rem;color:#cbd5e1;padding:4px;">${card.desc}</div>
            <div style="font-size:0.75rem;color:#fbbf24;margin-top:6px;font-weight:bold;">ðŸ‘‰ ${result}</div>
        </div>`;
    boardAddLog(`ðŸƒ ${p.name} láº­t: [${card.name}] â€” ${result}`, 'card');
    
    window.boardShowBigNotice(
        `${typeIcon} ${card.name}`, 
        `RÃºt tháº» á»Ÿ <b>${reason}</b><br><br><span style="color:#fcd34d">${card.desc}</span>`, 
        `ðŸ‘‰ ${result}`, 
        callback
    );
};

// â”€â”€ Hoáº¡t áº£nh xÃºc xáº¯c â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.boardDoRollAnimation = function(boardPlayer, callback) {
    const diceEl  = document.getElementById('diceDisplay');
    const resultEl = document.getElementById('diceResultText');
    const roll = 1 + Math.floor(Math.random() * 6);
    let ticks = 0;
    const interval = setInterval(() => {
        diceEl.textContent = RACE_DICE_EMOJIS[Math.floor(Math.random()*6)];
        diceEl.style.animation = 'none'; diceEl.offsetHeight;
        diceEl.style.animation = 'diceRoll 0.5s ease';
        if(++ticks >= 6) {
            clearInterval(interval);
            diceEl.textContent = RACE_DICE_EMOJIS[roll - 1];
            resultEl.textContent = `${boardPlayer.name} Ä‘i ${roll} bÆ°á»›c`;
            boardPlayer.lastRoll = roll;
            boardProcessTurn(boardPlayer, roll, callback);
        }
    }, 100);
};

// â”€â”€ Logic Ä‘i lÆ°á»£t hoÃ n toÃ n má»›i â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.boardProcessTurn = function(p, roll, callback) {
    if(p.eliminated) {
        boardNextTurn();
        if(callback) callback();
        return;
    }
    if(p.skipTurn) {
        p.skipTurn = false;
        boardAddLog(`ðŸ˜´ ${p.name} máº¥t lÆ°á»£t!`);
        window.boardShowBigNotice("ðŸ˜´ Ngá»§ gáº­t", `${p.name} bá»‹ máº¥t lÆ°á»£t nÃ y!`, "", () => {
            if(callback) callback();
        });
        return;
    }

    // Tiáº¿n tá»›i (khÃ´ng cáº§n 6 Ä‘á»ƒ xuáº¥t chuá»“ng)
    let steps = roll;
    if (p.pos + steps > BOARD_TOTAL_CELLS - 1) {
        steps = (BOARD_TOTAL_CELLS - 1) - p.pos; // Dá»«ng á»Ÿ Ä‘Ã­ch
    }

    boardMovePlayer(p.idx, steps, false);
    boardAddLog(`ðŸƒ ${p.name} tiáº¿n lÃªn Ã´ ${p.pos + 1}.`);

    setTimeout(() => {
        if(p.eliminated) return;

        let cellName = NEIGHBORHOOD_NAMES[p.pos % NEIGHBORHOOD_NAMES.length];

        const finalizeTurn = () => {
            // Kiem tra xem chi con 1 nguoi song khong
            const alive = boardGame.players.filter(x => !x.eliminated);
            if(alive.length === 1 && boardGame.players.length > 1) {
                boardGame.gameOver = true;
                let prize = 200 + (boardGame.betPool||0);
                boardAddLog(`ðŸ† Táº¥t cáº£ Ä‘á»‘i thá»§ Ä‘Ã£ cháº¿t! ${alive[0].name} Sá»NG SÃ“T VÃ€ CHIáº¾N THáº®NG!`, 'win');
                if(alive[0].networkId === myNetworkId || alive[0].isHuman) { player.gold += prize; refreshHudDisplay(); }
                window.boardShowBigNotice("ðŸ† CHIáº¾N THáº®NG", `${alive[0].name} lÃ  ngÆ°á»i sá»‘ng sÃ³t cuá»‘i cÃ¹ng!`, `ThÆ°á»Ÿng: ${prize} ðŸ’°<br><br><span style="color:#22c55e;font-size:0.9rem;">(Cháº¡m Ä‘á»ƒ tiáº¿p tá»¥c)</span>`, () => {}, true);
            }
            boardRenderGrid(); 
            boardRenderPlayers();
            if(callback) callback();
        };

        const handleWinOrCard = () => {
            if(p.pos >= BOARD_TOTAL_CELLS - 1) {
                boardGame.gameOver = true;
                let prize = boardGame.betPool || 0;
                if(p.networkId === myNetworkId || p.isHuman) {
                    player.gold += (200 + prize);
                    refreshHudDisplay();
                }
                boardAddLog(`ðŸ† ${p.name} Ä‘Ã£ cÃ¡n ÄÃCH Äáº¦U TIÃŠN!`, 'win');
                document.getElementById('diceResultText').textContent = `ðŸ† ${p.name} CHIáº¾N THáº®NG!`;
                window.boardShowBigNotice("ðŸ† CHIáº¾N THáº®NG", `${p.name} Ä‘Ã£ cÃ¡n Ä‘Ã­ch an toÃ n!`, `ThÆ°á»Ÿng: ${200 + prize} ðŸ’°<br><br><span style="color:#22c55e;font-size:0.9rem;">(Cháº¡m Ä‘á»ƒ tiáº¿p tá»¥c)</span>`, finalizeTurn, true);
                audio.play('levelup');
            } else {
                // RÃºt bÃ i náº¿u chÆ°a win
                boardDrawRandomCard(p, cellName, finalizeTurn);
            }
        };

        const handleCombat = () => {
            let combatLog = boardHandleCombat(p);
            if(combatLog) {
                window.boardShowBigNotice("âš”ï¸ Äá»¤NG Äá»˜", combatLog, `Khu vá»±c: ${cellName}`, handleWinOrCard);
            } else {
                handleWinOrCard();
            }
        };

        // Xá»­ lÃ½ báº«y trÃªn sÃ¢n
        if(boardGame.trappedCells[p.pos]) {
            delete boardGame.trappedCells[p.pos];
            boardAddLog(`ðŸ’¥ ${p.name} dáº«m báº«y! LÃ¹i 3 Ã´!`, 'special');
            boardMovePlayer(p.idx, -3, true);
            window.boardShowBigNotice("ðŸ’£ DáºªM BáºªY!", `${p.name} dáº«m pháº£i báº«y á»Ÿ ${cellName} vÃ  bá»‹ lÃ¹i 3 Ã´!`, "", handleCombat);
        } else {
            handleCombat();
        }

    }, 400);
};

// PvP khi 2 ng chung 1 Ã´
function boardHandleCombat(p) {
    if(p.pos <= 0 || p.pos >= 39) return null;
    let combatHappened = "";
    boardGame.players.forEach(other => {
        if(other.idx !== p.idx && !other.eliminated && other.pos === p.pos) {
            // P Ä‘Ã¡nh Other
            if (p.weapons > 0) {
                p.weapons--;
                boardAddLog(`âš”ï¸ Äá»¤NG Äá»˜! ${p.name} dÃ¹ng ðŸ—¡ï¸ Ä‘Ã¢m ${other.name}!`, 'special');
                let dmgLog = boardTakeDamage(other, 1, `Bá»‹ ${p.name} Ä‘Ã¢m`);
                boardAddLog(dmgLog, 'special');
                combatHappened += `ðŸ¤œ ${p.name} chÃ©m ${other.name} má»™t nhÃ¡t!<br>`;
            } else {
                boardAddLog(`ðŸ¤œ ${p.name} vÃ  ${other.name} Ä‘á»©ng chung Ã´ nhÆ°ng khÃ´ng cÃ³ ðŸ—¡ï¸ Ä‘Ã¡nh nhau!`);
                combatHappened += `ðŸ¤œ ${p.name} vÃ  ${other.name} lÆ°á»m nhau (khÃ´ng cÃ³ vÅ© khÃ­)<br>`;
            }
        }
    });
    return combatHappened || null;
}

// â”€â”€ Overlay ThÃ´ng BÃ¡o Sá»± Kiá»‡n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window._bigEventTimer = null;
window._bigEventCallback = null;

window.boardShowBigNotice = function(title, desc, extra = '', callback, persist = false) {
    const overlay = document.getElementById('bigEventOverlay');
    if(!overlay) {
        if(callback) callback();
        return;
    }
    try { audio.play('hit'); } catch(e){}
    document.getElementById('bigEventTitle').textContent = title;
    document.getElementById('bigEventDesc').innerHTML = desc;
    document.getElementById('bigEventExtra').innerHTML = extra;
    overlay.style.display = 'flex';
    
    // Reset animations
    const els = [document.getElementById('bigEventTitle'), document.getElementById('bigEventDesc'), document.getElementById('bigEventExtra'), overlay.querySelector('button')];
    els.forEach(el => { if(el) { el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; }});
    
    if(window._bigEventTimer) clearTimeout(window._bigEventTimer);
    window._bigEventCallback = callback;
    
    if(!persist) {
        window._bigEventTimer = setTimeout(() => {
            window.closeBigEvent();
        }, 3000);
    }
};

window.closeBigEvent = function() {
    try { audio.play('click'); } catch(e){}
    const overlay = document.getElementById('bigEventOverlay');
    if(overlay) overlay.style.display = 'none';
    if(window._bigEventTimer) clearTimeout(window._bigEventTimer);
    if(window._bigEventCallback) {
        const cb = window._bigEventCallback;
        window._bigEventCallback = null;
        cb();
    }
};

// â”€â”€ Di chuyá»ƒn â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.boardMovePlayer = function(idx, steps, animate) {
    let p = boardGame.players[idx];
    if(!p || p.eliminated) return;
    let next = p.pos + steps;
    p.pos = Math.max(0, Math.min(BOARD_TOTAL_CELLS - 1, next));
    if(animate) { boardRenderGrid(); boardRenderPlayers(); }
};

// â”€â”€ HÃ m phá»¥ trá»£ tÃ­nh tá»a Ä‘á»™ vÃ²ng quanh â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function _getCellPos(i) {
    if(i < 10) return { r: 1, c: i + 1 };
    if(i < 14) return { r: i - 10 + 2, c: 10 };
    if(i < 24) return { r: 6, c: 10 - (i - 14) };
    if(i < 28) return { r: 6 - (i - 23), c: 1 };
    if(i < 36) return { r: 2, c: (i - 28) + 2 };
    if(i < 38) return { r: i - 36 + 3, c: 9 };
    if(i < 46) return { r: 5, c: 9 - (i - 38) };
    if(i < 48) return { r: 5 - (i - 45), c: 2 };
    if(i < 54) return { r: 3, c: (i - 48) + 3 };
    if(i < 60) return { r: 4, c: 8 - (i - 54) };
    return { r: 1, c: 1 };
};

// â”€â”€ Render Track â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.boardRenderGrid = function() {
    const grid = document.getElementById('boardGrid');
    if(!grid) return;
    grid.innerHTML = '';
    // XÃ³a CSS grid cÅ©, thiáº¿t láº­p CSS grid oval rá»™ng hÆ¡n
    grid.style.cssText = [
        'display:grid',
        'grid-template-columns:repeat(10,1fr)',
        'grid-template-rows:repeat(6,1fr)',
        'gap:4px',
        'width:100%',
        'aspect-ratio:10/6',
        'max-height:400px',
        'margin-bottom:12px'
    ].join(';');

    // Title á»Ÿ giá»¯a
    const center = document.createElement('div');
    center.className = 'board-center';
    center.style.cssText = 'grid-row:2/6;grid-column:2/10;background:rgba(0,0,0,0.5);border-radius:16px;border:2px dashed #475569;';
    
    // Chá»‰ hiá»ƒn thá»‹ ngÆ°á»i cÃ²n sá»‘ng trÃªn báº£ng xáº¿p háº¡ng mini giá»¯a sÃ¢n
    const alivePlayers = boardGame.players.filter(p => !p.eliminated);
    
    center.innerHTML = `
        <div class="board-center-title" style="font-size:1.8rem;text-shadow:0 0 10px #fca5a5;color:#fecdd3;">â˜ ï¸ Äáº¤U TRÆ¯á»œNG SINH Tá»’N â˜ ï¸</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:10px;">
            ${alivePlayers.map(p => `
                <div style="text-align:center;min-width:60px;background:rgba(255,255,255,0.05);padding:8px;border-radius:8px;">
                    <div style="font-size:2rem;line-height:1;margin-bottom:4px;filter:drop-shadow(0 0 5px ${p.color});">${p.emoji}</div>
                    <div style="font-size:0.65rem;font-weight:800;color:${p.color};">${p.name}</div>
                    <div style="font-size:0.6rem;color:#fca5a5;margin-top:2px;">${'â¤ï¸'.repeat(p.lives)}</div>
                </div>`).join('')}
        </div>
        ${boardGame.betPool ? `<div style="margin-top:10px;font-size:0.8rem;color:#f97316;font-weight:800;background:#fff1;padding:4px 12px;border-radius:20px;display:inline-block;">ðŸ† Ná»’I CÆ¯á»¢C: ${boardGame.betPool} VÃ€NG ðŸ’°</div>` : ''}`;
    grid.appendChild(center);

    for(let i = 0; i < BOARD_TOTAL_CELLS; i++) {
        const pos  = _getCellPos(i);
        const type = i === 0 ? 'start' : i === (BOARD_TOTAL_CELLS - 1) ? 'finish' : '';
        const icon = i === 0 ? 'ðŸ' : i === 39 ? 'ðŸ†' : boardGame.trappedCells[i] ? 'ðŸ’£' : '';
        
        // Tokens hiá»‡n táº¡i á»Ÿ Ã´ nÃ y
        const cellPlayers = boardGame.players.filter(p => p.pos === i && !p.eliminated);
        const tokens = cellPlayers.map(p => 
            `<div class="board-token-large" style="border-color:${p.color};box-shadow:0 0 8px ${p.color};" title="${p.name} (${p.lives}â¤ï¸)">${p.emoji}</div>`
        ).join('');
        
        const div = document.createElement('div');
        div.className = 'board-cell' + (type ? ' ' + type : '');
        div.id = `bcell_${i}`;
        div.style.cssText = `grid-row:${pos.r};grid-column:${pos.c};position:relative;display:flex;align-items:center;justify-content:center;`;
        div.innerHTML = `<span class="cell-num">${i+1}</span><span class="cell-emoji">${icon}</span><div class="cell-tokens-wrap">${tokens}</div>`;
        grid.appendChild(div);
    }
};

// â”€â”€ Render Danh sÃ¡ch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.boardRenderPlayers = function() {
    const c = document.getElementById('boardPlayersContainer');
    if(!c) return;
    c.innerHTML = boardGame.players.map((p, i) => {
        const isCur  = i === boardGame.currentTurn && !boardGame.gameOver && !p.eliminated;
        const deadCls = p.eliminated ? 'eliminated-player' : '';
        return `<div class="board-player-row ${isCur ? 'current' : ''} ${deadCls}">
            <div class="player-color-dot" style="background:${p.color};"></div>
            <span style="font-size:1.4rem; filter:drop-shadow(0 0 2px #fff);">${p.eliminated ? 'ðŸ’€' : p.emoji}</span>
            <div style="flex:1;min-width:0;padding-left:8px;">
                <div style="font-size:0.8rem;font-weight:800;color:${p.eliminated?'#64748b':p.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${p.name}${isCur?' ðŸŽ²':''}${p.eliminated?' (ÄÃƒ CHáº¾T)':''}
                </div>
                <div style="font-size:0.65rem;color:#cbd5e1;margin-top:3px;font-weight:bold;">
                    ${p.eliminated ? 'Bá»Š LOáº I' : `Máº¡ng: ${'â¤ï¸'.repeat(p.lives)} | ðŸ—¡ï¸x${p.weapons} | ðŸ›¡ï¸x${p.shields} | Ã”: ${p.pos+1}`}
                </div>
            </div>
        </div>`;
    }).join('');
};

// â”€â”€ Khá»Ÿi táº¡o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.openBoardGame = function(pvpMode = false) {
    audio.play('click');
    let betAmount = 0; // TODO: Láº¥y tá»« modal cÆ°á»£c náº¿u cÃ³
    boardGame = {
        players: [], currentTurn: 0, isRolling: false,
        trappedCells: {}, log: [], gameOver: false,
        pvp: !!pvpMode, hostId: pvpMode ? myNetworkId : null, betPool: betAmount
    };
    boardGame.players.push({
        idx: 0, name: player.name, networkId: myNetworkId, classId: player.classId, skin: player.equipment.skin,
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false, // Core sinh tá»“n
        color: RACE_PLAYER_COLORS[0],
        emoji: CLASS_DATA[player.classId]?.emoji || 'ðŸƒ',
        isHuman: true, isBot: false, skipTurn: false
    });
    
    // Add 2 bots for more chaos in survival
    boardAddBot();
    boardAddBot();

    const bpd = document.getElementById('boardBetPoolDisplay');
    const bpa = document.getElementById('boardBetPoolAmount');
    if(bpd && bpa) {
        if(betAmount > 0) {
            bpd.style.display = 'flex';
            bpa.textContent = `${betAmount} ðŸ’°`;
        } else {
            bpd.style.display = 'none';
        }
    }

    boardRenderGrid();
    boardRenderPlayers();
    boardUpdateRollBtn();
    document.getElementById('boardGameModal').classList.add('active');
    boardAddLog(`ðŸ Äáº¤U TRÆ¯á»œNG Báº®T Äáº¦U! Ai háº¿t 3 â¤ï¸ sáº½ cháº¿t. Äi tá»›i Ã´ 40 Ä‘á»ƒ tháº¯ng!`, 'special');
};

window.boardAddBot = function() {
    if(boardGame.players.length >= 4) return;
    const idx = boardGame.players.length;
    const botNames  = ['ðŸ¤– SÃ¡t Thá»§ Bot', 'ðŸ¦¾ Cá»— MÃ¡y ChÃ©m', 'ðŸ¤¯ Káº» ÄiÃªn'];
    const botEmojis = ['ðŸ§Ÿ','ðŸ§›','ðŸ¦¹'];
    boardGame.players.push({
        idx, name: botNames[idx-1] || `Bot ${idx}`, networkId: null, 
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: RACE_PLAYER_COLORS[idx] || '#f59e0b',
        emoji: botEmojis[idx-1] || 'ðŸ‘¾',
        isHuman: false, isBot: true, skipTurn: false
    });
    boardRenderPlayers();
    boardAddLog(`ðŸ’€ ${botNames[idx-1]} Ä‘Ã£ tham gia Ä‘áº¥u trÆ°á»ng!`);
};

// â”€â”€ Logic chuyá»ƒn lÆ°á»£t cÃ³ xá»­ lÃ½ ngÆ°á»i cháº¿t â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.boardNextTurn = function() {
    if(boardGame.gameOver) return;
    let nextIdx = (boardGame.currentTurn + 1) % boardGame.players.length;
    let safety = 0;
    // Bá» qua nhá»¯ng ngÆ°á»i Ä‘Ã£ cháº¿t
    while(boardGame.players[nextIdx].eliminated && safety < 10) {
        nextIdx = (nextIdx + 1) % boardGame.players.length;
        safety++;
    }
    boardGame.currentTurn = nextIdx;
    let next = boardGame.players[boardGame.currentTurn];
    boardRenderPlayers();
    boardUpdateRollBtn();
    if(next && next.isBot && !next.eliminated && !boardGame.gameOver) {
        setTimeout(() => { if(!boardGame.gameOver) boardRollForCurrentPlayer(); }, 900);
    }
};

console.log('ðŸ [board_new.js] Cá» Äua Sinh Tá»“n v4 loaded!');

// â”€â”€ Bet Modal & Triggers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.openBoardGameWithBet = function() {
    audio.play('click');
    const modal = document.getElementById('boardBetModal');
    if(modal) modal.classList.add('active');
    window._selectedBetAmount = 50;
    const opts = document.querySelectorAll('.bet-option');
    if(opts.length > 0) {
        opts.forEach(el => el.classList.remove('selected'));
        opts[0].classList.add('selected');
    }
};

window.selectBetAmount = function(amt) {
    audio.play('click');
    window._selectedBetAmount = amt;
    document.querySelectorAll('.bet-option').forEach(el => el.classList.remove('selected'));
    if(event && event.currentTarget) event.currentTarget.classList.add('selected');
};

window.closeBetModal = function() {
    audio.play('click');
    const modal = document.getElementById('boardBetModal');
    if(modal) modal.classList.remove('active');
};

window.confirmBetAndStart = function() {
    audio.play('click');
    let amt = window._selectedBetAmount;
    const customInp = document.getElementById('customBetAmount');
    if(customInp && customInp.value) {
        amt = parseInt(customInp.value) || 0;
    }
    if(player.gold < amt) {
        showToast('âš ï¸ KhÃ´ng Ä‘á»§ vÃ ng Ä‘á»ƒ cÆ°á»£c!');
        return;
    }
    player.gold -= amt;
    refreshHudDisplay();
    closeBetModal();
    
    // Báº¯t Ä‘áº§u game vá»›i tiá»n cÆ°á»£c
    openBoardGame(false); 
    boardGame.betPool = amt; 
    boardRenderGrid(); // Render láº¡i Ä‘á»ƒ hiá»‡n Ná»“i CÆ°á»£c
};

window.startBoardGameNoBet = function() {
    audio.play('click');
    closeBetModal();
    openBoardGame(false);
};

window.boardAddLog = function(text, type) {
    if(!boardGame) return;
    boardGame.log.push({ text, type });
    if(boardGame.log.length > 24) boardGame.log.shift();
    let logEl = document.getElementById('boardLog');
    if(!logEl) return;
    logEl.innerHTML = boardGame.log.map(l => `<p class="${l.type||''}">${l.text}</p>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
};

window.boardIsMyTurn = function() {
    if(!boardGame || boardGame.gameOver) return false;
    let cur = boardGame.players[boardGame.currentTurn];
    if(!cur) return false;
    if(boardGame.pvp) return cur.networkId === myNetworkId;
    return !!cur.isHuman;
};

window.boardUpdateRollBtn = function() {
    let btn = document.getElementById('rollDiceBtn');
    if(!btn || !boardGame) return;
    let isMyTurn = window.boardIsMyTurn();
    btn.disabled = boardGame.isRolling || boardGame.gameOver || !isMyTurn;
    btn.textContent = boardGame.gameOver ? 'ðŸ VÃ¡n Ä‘Ã£ káº¿t thÃºc' : isMyTurn ? 'ðŸŽ² Tung XÃºc Xáº¯c' : 'â³ Chá» Ä‘á»‘i thá»§...';
};

window.boardRollDice = function() {
    if(!boardGame || boardGame.isRolling || boardGame.gameOver) return;
    let cur = boardGame.players[boardGame.currentTurn];
    if(!cur || !window.boardIsMyTurn()) return;
    if(boardGame.pvp && boardGame.hostId !== myNetworkId) {
        if(typeof pvpChannel !== 'undefined') {
            pvpChannel.postMessage({ type: 'BOARD_ROLL_REQUEST', id: myNetworkId, hostId: boardGame.hostId });
        }
        boardGame.isRolling = true;
        window.boardUpdateRollBtn();
        return;
    }
    window.boardRollForCurrentPlayer();
};

window.boardRollForCurrentPlayer = function() {
    let cur = boardGame.players[boardGame.currentTurn];
    if(!cur) return;
    boardGame.isRolling = true;
    window.boardUpdateRollBtn();
    window.boardDoRollAnimation(cur, () => {
        boardGame.isRolling = false;
        if(cur.lastRoll === 6 && !boardGame.gameOver && !cur.eliminated) {
            window.boardAddLog(`â­ ${cur.name} tung 6, Ä‘Æ°á»£c thÃªm lÆ°á»£t!`, 'special');
            window.boardRenderPlayers();
        } else {
            window.boardNextTurn();
        }
        window.boardUpdateRollBtn();
        window.boardBroadcastState('state');
    });
};

window.boardBroadcastState = function(kind) {
    if(!boardGame || !boardGame.pvp || boardGame.hostId !== myNetworkId) return;
    if(typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: kind === 'start' ? 'BOARD_PVP_START' : 'BOARD_PVP_STATE',
            id: myNetworkId,
            hostId: myNetworkId,
            targetIds: boardGame.players.map(p => p.networkId).filter(Boolean),
            boardGame: JSON.parse(JSON.stringify(boardGame)),
            cardHtml: document.getElementById('boardCardDisplay')?.innerHTML || '',
            diceText: document.getElementById('diceResultText')?.textContent || ''
        });
    }
};

window.boardApplyNetworkState = function(msg) {
    if(!msg.boardGame || !msg.targetIds?.includes(myNetworkId)) return;
    boardGame = msg.boardGame;
    boardGame.players.forEach((p, idx) => {
        p.idx = idx;
        p.isHuman = p.networkId === myNetworkId;
        p.isBot = false;
    });
    boardGame.isRolling = false;
    document.getElementById('boardGameModal').classList.add('active');
    if(msg.cardHtml) document.getElementById('boardCardDisplay').innerHTML = msg.cardHtml;
    if(msg.diceText) document.getElementById('diceResultText').textContent = msg.diceText;
    window.boardRenderGrid();
    window.boardRenderPlayers();
    window.boardUpdateRollBtn();
};

window.boardSwapNearest = function(p) {
    if(!boardGame) return 'Lá»—i game';
    let nearest = null; let minDist = Infinity;
    boardGame.players.forEach((pl,i) => {
        if(i !== p.idx && !pl.eliminated) { 
            let d = Math.abs((pl.pos || 0) - (p.pos || 0)); 
            if(d < minDist) { minDist = d; nearest = pl; } 
        }
    });
    if(nearest) {
        let tmp = p.pos;
        p.pos = nearest.pos;
        nearest.pos = tmp;
        window.boardRenderGrid();
        return `Äá»•i vá»‹ trÃ­ vá»›i ${nearest.name}.`;
    }
    return 'KhÃ´ng cÃ³ ai Ä‘á»ƒ Ä‘á»•i.';
}

window.openBoardInviteModal = function() {
    let list = document.getElementById('boardInvitePlayerList');
    if(!list) return;
    list.innerHTML = '';
    let count = 0;
    if(typeof networkPlayers !== 'undefined') {
        Object.entries(networkPlayers).forEach(([id, p]) => {
            count++;
            list.innerHTML += `<div class="invite-player-row"><span>${p.name}</span><button class="board-btn" style="padding:4px 8px;font-size:0.7rem;" onclick="sendBoardInvite('${id}', '${p.name}')">Mời Chơi Cờ</button></div>`;
        });
    }
    if(count === 0) list.innerHTML = '<div style="color:#888;font-size:0.8rem;text-align:center;">Không có ai online.</div>';
    document.getElementById('boardInviteModal').style.display = 'flex';
};
window.closeBoardInviteModal = function() { document.getElementById('boardInviteModal').style.display = 'none'; };
window.sendBoardInvite = function(id, name) {
    if(typeof pvpChannel !== 'undefined') pvpChannel.postMessage({ type: 'BOARD_INVITE', id: myNetworkId, targetId: id, senderName: player.name });
    showToast('Đã gửi lời mời Cờ Đua đến ' + name);
    window.closeBoardInviteModal();
};
