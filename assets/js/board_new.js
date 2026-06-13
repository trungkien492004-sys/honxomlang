// ===== 🏁 BOARD_NEW.JS — Cờ Đua Sinh Tồn v4.0 (Yu-Gi-Oh Style) =====
'use strict';
var boardGame = null;
const BOARD_TOTAL_CELLS = 60;

const RACE_DICE_EMOJIS = ['⚀','⚁','⚂','⚃','⚄','⚅'];
const RACE_PLAYER_COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b'];
const NEIGHBORHOOD_NAMES = [
    "Nhà HÒA", "Quán Net THU THẢO", "Nhà MẮM", "Hẻm TẸT", "Tạp hóa THƯƠNG HIỀN",
    "Chốt bảo vệ KIÊN", "Trạm sạc HECK", "Nhà HẢI", "Quán bida TRÒN", "Nhà KẾT",
    "Quán nhậu HUY", "Bãi rác NẤM", "Nhà LÙN", "Lỗ cống QUÂN", "Tiệm cắt tóc BI", "Sân banh BỐP",
    "Gốc đa Làng", "Chuồng Gà", "Cột Điện", "Ao Cá"
];

// ── Kho Thẻ Bài (Hơn 20 thẻ, phân loại theo Type) ─────────────
const RACE_CARDS = [
    // 👾 MONSTER (Quái Vật) - Mất mạng nếu không có vũ khí
    { name: "Sói Xám Đột Biến", type: 'monster', rarity: 'common', desc: "Gặp quái vật! Trừ 1 mạng nếu không có Vũ Khí.", 
      effect: p => boardFightMonster(p, "Sói Xám", 30) },
    { name: "Cương Thi Làng", type: 'monster', rarity: 'rare', desc: "Gặp quái vật! Trừ 1 mạng nếu không có Vũ Khí.", 
      effect: p => boardFightMonster(p, "Cương Thi", 50) },
    { name: "Rồng Lửa Cổ Đại", type: 'monster', rarity: 'epic', desc: "Trùm Rồng! Trừ 2 mạng nếu không có Khiên/Vũ khí chặn.", 
      effect: p => boardFightMonster(p, "Rồng Lửa", 100, 2) },

    // 🗡️ EQUIP (Trang bị)
    { name: "Kiếm Sắt Xóm", type: 'equip', rarity: 'common', desc: "Nhận 1 🗡️ Vũ Khí! Dùng để đánh quái hoặc cướp mạng đối thủ.", 
      effect: p => { p.weapons++; return 'Nhặt được 1 🗡️ Vũ Khí!'; } },
    { name: "Cung Gỗ Trắc", type: 'equip', rarity: 'common', desc: "Nhận 1 🗡️ Vũ Khí!", 
      effect: p => { p.weapons++; return 'Nhặt được Cung! (+1 🗡️)'; } },
    { name: "Khiên Gỗ Mộc", type: 'equip', rarity: 'common', desc: "Nhận 1 🛡️ Khiên! Chặn 1 đòn chí tử.", 
      effect: p => { p.shields++; return 'Nhặt được 1 🛡️ Khiên!'; } },
    { name: "Khiên Thép Đen", type: 'equip', rarity: 'rare', desc: "Nhận 1 🛡️ Khiên siêu cấp!", 
      effect: p => { p.shields++; return 'Nhận 1 🛡️ Khiên!'; } },
    { name: "Hộp Cứu Thương", type: 'equip', rarity: 'epic', desc: "Hồi lại 1 ❤️ Mạng (Tối đa 3).", 
      effect: p => { if(p.lives < 3) { p.lives++; return 'Hồi 1 ❤️ Mạng!'; } return 'Mạng đã đầy, không tác dụng.'; } },

    // 🌪️ SPELL (Ma pháp di chuyển / hỗ trợ)
    { name: "Cuồng Phong", type: 'spell', rarity: 'common', desc: "Tiến thêm 3 ô!", 
      effect: p => { boardMovePlayer(p.idx, 3, true); return 'Tiến 3 ô.'; } },
    { name: "Lốc Xoáy", type: 'spell', rarity: 'common', desc: "Lùi 2 ô!", 
      effect: p => { boardMovePlayer(p.idx, -2, true); return 'Lùi 2 ô.'; } },
    { name: "Rương Vàng", type: 'spell', rarity: 'rare', desc: "+50 Vàng!", 
      effect: p => { if(p.isHuman||p.networkId===myNetworkId) { player.gold+=50; refreshHudDisplay(); } return 'Nhận 50 vàng.'; } },
    { name: "Dịch Chuyển Không Gian", type: 'spell', rarity: 'epic', desc: "Đổi chỗ với người gần nhất!", 
      effect: p => boardSwapNearest(p) },
    { name: "Tăng Tốc Sinh Tồn", type: 'spell', rarity: 'rare', desc: "Tiến 5 ô và nhận 1 Khiên!", 
      effect: p => { p.shields++; boardMovePlayer(p.idx, 5, true); return 'Tiến 5 ô + 1 🛡️ Khiên.'; } },

    // 💣 TRAP (Cạm bẫy)
    { name: "Hố Chông Trừng Phạt", type: 'trap', rarity: 'rare', desc: "Trừ 1 mạng ngay lập tức!", 
      effect: p => { return boardTakeDamage(p, 1, "Hố Chông"); } },
    { name: "Sét Đánh", type: 'trap', rarity: 'epic', desc: "Người dẫn đầu mất 1 mạng!", 
      effect: p => { 
          const L = boardGame.players.filter(x=>!x.eliminated).reduce((a,b) => a.pos > b.pos ? a : b); 
          if(L) return boardTakeDamage(L, 1, "Sét Đánh"); 
          return 'Không có ai bị sét đánh.';
      } 
    },
];

// Hàm Xử lý Đánh Quái (Tự động)
function boardFightMonster(p, mName, reward, damage = 1) {
    if (p.weapons > 0) {
        p.weapons--;
        if(p.isHuman||p.networkId===myNetworkId) { player.gold += reward; refreshHudDisplay(); }
        return `Dùng 🗡️ diệt ${mName}! Thưởng ${reward}💰`;
    } else {
        return boardTakeDamage(p, damage, `Bị ${mName} cắn`);
    }
}

// Hàm Xử lý Mất Mạng
function boardTakeDamage(p, amount, reason) {
    if (p.shields > 0) {
        p.shields--;
        return `🛡️ Dùng Khiên chặn được đòn (${reason})!`;
    }
    p.lives -= amount;
    if (p.lives <= 0) {
        p.eliminated = true;
        boardAddLog(`💀 ${p.name} đã BỊ LOẠI KHỎI CUỘC CHƠI!`, 'win');
        return `💀 Hết mạng! BẠN ĐÃ BỊ LOẠI!`;
    }
    return `💔 Mất ${amount} mạng vì ${reason}! (Còn ${p.lives}❤️)`;
}

// ── Vẽ thẻ bài 3D ─────────────────────────────────────────────
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
    const typeIcon = card.type === 'monster' ? '👾' : card.type === 'equip' ? '🛡️' : card.type === 'trap' ? '💣' : '🌪️';

    document.getElementById('boardCardDisplay').innerHTML = `
        <div class="drawn-card card-3d-flip ${card.type}-card">
            <span class="card-rarity-badge ${badgeClass}">${card.rarity.toUpperCase()}</span>
            <div style="font-size:1.4rem;margin:8px 0;">${typeIcon} ${card.name}</div>
            <div style="font-size:0.8rem;color:#cbd5e1;padding:4px;">${card.desc}</div>
            <div style="font-size:0.75rem;color:#fbbf24;margin-top:6px;font-weight:bold;">👉 ${result}</div>
        </div>`;
    boardAddLog(`🃏 ${p.name} lật: [${card.name}] — ${result}`, 'card');
    
    window.boardShowBigNotice(
        `${typeIcon} ${card.name}`, 
        `Rút thẻ ở <b>${reason}</b><br><br><span style="color:#fcd34d">${card.desc}</span>`, 
        `👉 ${result}`, 
        callback
    );
};

// ── Hoạt ảnh xúc xắc ──────────────────────────────────────────
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
            resultEl.textContent = `${boardPlayer.name} đi ${roll} bước`;
            boardPlayer.lastRoll = roll;
            boardProcessTurn(boardPlayer, roll, callback);
        }
    }, 100);
};

// ── Logic đi lượt hoàn toàn mới ───────────────────────────────
window.boardProcessTurn = function(p, roll, callback) {
    if(p.eliminated) {
        boardNextTurn();
        if(callback) callback();
        return;
    }
    if(p.skipTurn) {
        p.skipTurn = false;
        boardAddLog(`😴 ${p.name} mất lượt!`);
        window.boardShowBigNotice("😴 Ngủ gật", `${p.name} bị mất lượt này!`, "", () => {
            if(callback) callback();
        });
        return;
    }

    // Tiến tới (không cần 6 để xuất chuồng)
    let steps = roll;
    if (p.pos + steps > BOARD_TOTAL_CELLS - 1) {
        steps = (BOARD_TOTAL_CELLS - 1) - p.pos; // Dừng ở đích
    }

    let currentStep = 0;
    let moveInterval = setInterval(() => {
        if(currentStep >= steps || p.eliminated) {
            clearInterval(moveInterval);
            
            setTimeout(() => {
                if(p.eliminated) return;

                let cellName = NEIGHBORHOOD_NAMES[p.pos % NEIGHBORHOOD_NAMES.length];

                const finalizeTurn = () => {
                    // Kiem tra xem chi con 1 nguoi song khong
                    const alive = boardGame.players.filter(x => !x.eliminated);
                    if(alive.length === 1 && boardGame.players.length > 1) {
                        boardGame.gameOver = true;
                        let prize = 200 + (boardGame.betPool||0);
                        boardAddLog(`🏆 Tất cả đối thủ đã chết! ${alive[0].name} SỐNG SÓT VÀ CHIẾN THẮNG!`, 'win');
                        if(alive[0].networkId === myNetworkId || alive[0].isHuman) {
                            player.gold += prize;
                            refreshHudDisplay();
                        }
                        window.boardShowBigNotice("🏆 CHIẾN THẮNG", `${alive[0].name} là người sống sót cuối cùng!`, `Thưởng: ${prize} 🪙<br><br><span style="color:#22c55e;font-size:0.9rem;">(Chạm để tiếp tục)</span>`, () => {}, true);
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
                        boardAddLog(`🏆 ${p.name} đã cán ĐÍCH ĐẦU TIÊN!`, 'win');
                        window.boardShowBigNotice("🏆 CHIẾN THẮNG", `${p.name} đã cán đích an toàn!`, `Thưởng: ${200 + prize} 🪙<br><br><span style="color:#22c55e;font-size:0.9rem;">(Chạm để tiếp tục)</span>`, finalizeTurn, true);
                        try { audio.play('levelup'); } catch(e){}
                    } else {
                        // Rút bài nếu chưa win
                        boardDrawRandomCard(p, cellName, finalizeTurn);
                    }
                };

                const handleCombat = () => {
                    let combatLog = boardHandleCombat(p);
                    if(combatLog) {
                        window.boardShowBigNotice("⚔️ ĐỤNG ĐỘ", combatLog, `Khu vực: ${cellName}`, handleWinOrCard);
                    } else {
                        handleWinOrCard();
                    }
                };

                // Xử lý bẫy trên sân
                if(boardGame.trappedCells[p.pos]) {
                    delete boardGame.trappedCells[p.pos];
                    boardAddLog(`💣 ${p.name} dẫm bẫy! Lùi 3 ô!`, 'special');
                    boardMovePlayer(p.idx, -3, true);
                    window.boardShowBigNotice("💣 DẪM BẪY!", `${p.name} dẫm phải bẫy ở ${cellName} và bị lùi 3 ô!`, "", handleCombat);
                } else {
                    handleCombat();
                }
        };

        const handleCombat = () => {
            let combatLog = boardHandleCombat(p);
            if(combatLog) {
                window.boardShowBigNotice("⚔️ ĐỤNG ĐỘ", combatLog, `Khu vực: ${cellName}`, handleWinOrCard);
            } else {
                handleWinOrCard();
            }
        };

        // Xử lý bẫy trên sân
        if(boardGame.trappedCells[p.pos]) {
            delete boardGame.trappedCells[p.pos];
            boardAddLog(`💥 ${p.name} dẫm bẫy! Lùi 3 ô!`, 'special');
            boardMovePlayer(p.idx, -3, true);
            window.boardShowBigNotice("💣 DẪM BẪY!", `${p.name} dẫm phải bẫy ở ${cellName} và bị lùi 3 ô!`, "", handleCombat);
        } else {
            handleCombat();
        }

    }, 400);
};

// PvP khi 2 ng chung 1 ô
function boardHandleCombat(p) {
    if(p.pos <= 0 || p.pos >= 39) return null;
    let combatHappened = "";
    boardGame.players.forEach(other => {
        if(other.idx !== p.idx && !other.eliminated && other.pos === p.pos) {
            // P đánh Other
            if (p.weapons > 0) {
                p.weapons--;
                boardAddLog(`⚔️ ĐỤNG ĐỘ! ${p.name} dùng 🗡️ đâm ${other.name}!`, 'special');
                let dmgLog = boardTakeDamage(other, 1, `Bị ${p.name} đâm`);
                boardAddLog(dmgLog, 'special');
                combatHappened += `🤜 ${p.name} chém ${other.name} một nhát!<br>`;
            } else {
                boardAddLog(`🤜 ${p.name} và ${other.name} đứng chung ô nhưng không có 🗡️ đánh nhau!`);
                combatHappened += `🤜 ${p.name} và ${other.name} lườm nhau (không có vũ khí)<br>`;
            }
        }
    });
    return combatHappened || null;
}

// ── Overlay Thông Báo Sự Kiện ─────────────────────────────────
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
    
    // Reset and apply animations via inline styles
    const titleEl = document.getElementById('bigEventTitle');
    const descEl = document.getElementById('bigEventDesc');
    const extraEl = document.getElementById('bigEventExtra');
    const btnEl = overlay.querySelector('button');

    if(titleEl) { titleEl.style.animation = 'none'; titleEl.offsetHeight; titleEl.style.animation = 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'; }
    if(descEl) { descEl.style.animation = 'none'; descEl.offsetHeight; descEl.style.animation = 'fadeIn 0.5s 0.2s forwards'; }
    if(extraEl) { extraEl.style.animation = 'none'; extraEl.offsetHeight; extraEl.style.animation = 'fadeIn 0.5s 0.4s forwards'; }
    if(btnEl) { btnEl.style.animation = 'none'; btnEl.offsetHeight; btnEl.style.animation = 'fadeIn 0.5s 0.6s forwards'; }
    
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

// ── Di chuyển ─────────────────────────────────────────────────
window.boardMovePlayer = function(idx, steps, animate) {
    let p = boardGame.players[idx];
    if(!p || p.eliminated) return;
    let next = p.pos + steps;
    p.pos = Math.max(0, Math.min(BOARD_TOTAL_CELLS - 1, next));
    if(animate) { boardRenderGrid(); boardRenderPlayers(); }
};

// ── Hàm phụ trợ tính tọa độ vòng quanh ──────────────────────────
function _getCellPos(i) {
    if(i < 13) return { r: 1, c: i + 1 };
    if(i < 20) return { r: i - 13 + 2, c: 13 };
    if(i < 33) return { r: 9, c: 13 - (i - 20) };
    return { r: 9 - (i - 33), c: 1 };
}

// ── Render Track ──────────────────────────────────────────────
window.boardRenderGrid = function() {
    const grid = document.getElementById('boardGrid');
    if(!grid) return;
    grid.innerHTML = '';
    // Xóa CSS grid cũ, thiết lập CSS grid oval rộng hơn
    grid.style.cssText = [
        'display:grid',
        'grid-template-columns:repeat(13,1fr)',
        'grid-template-rows:repeat(9,1fr)',
        'gap:4px',
        'width:100%',
        'aspect-ratio:13/9',
        'max-height:400px',
        'margin-bottom:12px'
    ].join(';');

    // Title ở giữa
    const center = document.createElement('div');
    center.className = 'board-center';
    center.style.cssText = 'grid-row:2/9;grid-column:2/13;background:rgba(0,0,0,0.5);border-radius:16px;border:2px dashed #475569;';
    
    // Chỉ hiển thị người còn sống trên bảng xếp hạng mini giữa sân
    const alivePlayers = boardGame.players.filter(p => !p.eliminated);
    
    center.innerHTML = `
        <div class="board-center-title" style="font-size:1.8rem;text-shadow:0 0 10px #fca5a5;color:#fecdd3;">☠️ ĐẤU TRƯỜNG SINH TỒN ☠️</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:10px;">
            ${alivePlayers.map(p => `
                <div style="text-align:center;min-width:60px;background:rgba(255,255,255,0.05);padding:8px;border-radius:8px;">
                    <div style="font-size:2rem;line-height:1;margin-bottom:4px;filter:drop-shadow(0 0 5px ${p.color});">${p.emoji}</div>
                    <div style="font-size:0.65rem;font-weight:800;color:${p.color};">${p.name}</div>
                    <div style="font-size:0.6rem;color:#fca5a5;margin-top:2px;">${'❤️'.repeat(p.lives)}</div>
                </div>`).join('')}
        </div>
        ${boardGame.betPool ? `<div style="margin-top:10px;font-size:0.8rem;color:#f97316;font-weight:800;background:#fff1;padding:4px 12px;border-radius:20px;display:inline-block;">🏆 NỒI CƯỢC: ${boardGame.betPool} VÀNG 💰</div>` : ''}`;
    grid.appendChild(center);

    for(let i = 0; i < BOARD_TOTAL_CELLS; i++) {
        const pos  = _getCellPos(i);
        const type = i === 0 ? 'start' : i === 39 ? 'finish' : '';
        const icon = i === 0 ? '🏁' : i === 39 ? '🏆' : boardGame.trappedCells[i] ? '💣' : '';
        
        // Tokens hiện tại ở ô này
        const cellPlayers = boardGame.players.filter(p => p.pos === i && !p.eliminated);
        const tokens = cellPlayers.map(p => 
            `<div class="board-token-large" style="border-color:${p.color};box-shadow:0 0 8px ${p.color};" title="${p.name} (${p.lives}❤️)">${p.emoji}</div>`
        ).join('');
        
        const div = document.createElement('div');
        div.className = 'board-cell' + (type ? ' ' + type : '');
        div.id = `bcell_${i}`;
        div.style.cssText = `grid-row:${pos.r};grid-column:${pos.c};position:relative;display:flex;align-items:center;justify-content:center;`;
        div.innerHTML = `<span class="cell-num">${i+1}</span><span class="cell-emoji">${icon}</span><div class="cell-tokens-wrap">${tokens}</div>`;
        grid.appendChild(div);
    }
};

// ── Render Danh sách ──────────────────────────────────────────
window.boardRenderPlayers = function() {
    const c = document.getElementById('boardPlayersContainer');
    if(!c) return;
    c.innerHTML = boardGame.players.map((p, i) => {
        const isCur  = i === boardGame.currentTurn && !boardGame.gameOver && !p.eliminated;
        const deadCls = p.eliminated ? 'eliminated-player' : '';
        return `<div class="board-player-row ${isCur ? 'current' : ''} ${deadCls}">
            <div class="player-color-dot" style="background:${p.color};"></div>
            <span style="font-size:1.4rem; filter:drop-shadow(0 0 2px #fff);">${p.eliminated ? '💀' : p.emoji}</span>
            <div style="flex:1;min-width:0;padding-left:8px;">
                <div style="font-size:0.8rem;font-weight:800;color:${p.eliminated?'#64748b':p.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${p.name}${isCur?' 🎲':''}${p.eliminated?' (ĐÃ CHẾT)':''}
                </div>
                <div style="font-size:0.65rem;color:#cbd5e1;margin-top:3px;font-weight:bold;">
                    ${p.eliminated ? 'BỊ LOẠI' : `Mạng: ${'❤️'.repeat(p.lives)} | 🗡️x${p.weapons} | 🛡️x${p.shields} | Ô: ${p.pos+1}`}
                </div>
            </div>
        </div>`;
    }).join('');
};

// ── Khởi tạo ──────────────────────────────────────────────────
window.openBoardGame = function(pvpMode = false) {
    audio.play('click');
    let betAmount = 0; // TODO: Lấy từ modal cược nếu có
    boardGame = {
        players: [], currentTurn: 0, isRolling: false,
        trappedCells: {}, log: [], gameOver: false,
        pvp: !!pvpMode, hostId: pvpMode ? myNetworkId : null, betPool: betAmount
    };
    boardGame.players.push({
        idx: 0, name: player.name, networkId: myNetworkId, classId: player.classId, skin: player.equipment?.skin,
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false, // Core sinh tồn
        color: RACE_PLAYER_COLORS[0],
        emoji: CLASS_DATA[player.classId]?.emoji || '🏃',
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
            bpa.textContent = `${betAmount} 💰`;
        } else {
            bpd.style.display = 'none';
        }
    }

    boardRenderGrid();
    boardRenderPlayers();
    boardUpdateRollBtn();
    document.getElementById('boardGameModal').classList.add('active');
    boardAddLog(`🏁 ĐẤU TRƯỜNG BẮT ĐẦU! Ai hết 3 ❤️ sẽ chết. Đi tới ô 40 để thắng!`, 'special');
};

window.boardAddBot = function() {
    if(boardGame.players.length >= 4) return;
    const idx = boardGame.players.length;
    const botNames  = ['🤖 Sát Thủ Bot', '🦾 Cỗ Máy Chém', '🤯 Kẻ Điên'];
    const botEmojis = ['🧟','🧛','🦹'];
    boardGame.players.push({
        idx, name: botNames[idx-1] || `Bot ${idx}`, networkId: null, 
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: RACE_PLAYER_COLORS[idx] || '#f59e0b',
        emoji: botEmojis[idx-1] || '👾',
        isHuman: false, isBot: true, skipTurn: false
    });
    boardRenderPlayers();
    boardAddLog(`💀 ${botNames[idx-1]} đã tham gia đấu trường!`);
};

// ── Logic chuyển lượt có xử lý người chết ──────────────────
window.boardNextTurn = function() {
    if(boardGame.gameOver) return;
    let nextIdx = (boardGame.currentTurn + 1) % boardGame.players.length;
    let safety = 0;
    // Bỏ qua những người đã chết
    while(boardGame.players[nextIdx].eliminated && safety < 10) {
        nextIdx = (nextIdx + 1) % boardGame.players.length;
        safety++;
    }
    boardGame.currentTurn = nextIdx;
    boardGame.players.sort((a,b)=>b.pos - a.pos);
    boardRenderPlayers();
    boardUpdateRollBtn();
    if(next && next.isBot && !next.eliminated && !boardGame.gameOver) {
        setTimeout(() => { if(!boardGame.gameOver) boardRollForCurrentPlayer(); }, 900);
    }
};

window.closeBoardGame = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardGameModal');
    if(modal) modal.classList.remove('active');
};

window.closeBoardInviteModal = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardInviteModal');
    if(modal) modal.classList.remove('active');
};

window.openBoardInviteModal = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardInviteModal');
    const list = document.getElementById('boardInvitePlayerList');
    if(!modal || !list) return;
    
    list.innerHTML = '';
    let players = window.networkPlayers || {};
    let count = 0;
    
    for(let id in players) {
        let p = players[id];
        if(id === myNetworkId || (Date.now() - p.lastSeen > 12000)) continue;
        count++;
        let div = document.createElement('div');
        div.className = 'pvp-player-row';
        div.innerHTML = `
            <div style="flex:1; display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.5rem;">${window.CLASS_DATA && window.CLASS_DATA[p.classId] ? window.CLASS_DATA[p.classId].emoji : '👤'}</span>
                <div>
                    <div style="font-weight:bold; color:var(--gold);">${p.name}</div>
                    <div style="font-size:0.75rem; color:#aaa;">Lv.${p.level || 1}</div>
                </div>
            </div>
            <button class="btn-sm" style="background:#22c55e;" onclick="sendBoardInvite('${id}', '${p.name}')">Mời</button>
        `;
        list.appendChild(div);
    }
    
    if(count === 0) {
        list.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">Không có người chơi online. Mở thêm tab!</div>';
    }
    modal.classList.add('active');
};

window.sendBoardInvite = function(targetId, targetName) {
    try { audio.play('click'); } catch(e){}
    if(typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: 'BOARD_PVP_INVITE',
            id: myNetworkId,
            targetId: targetId,
            senderName: player.name
        });
        showToast(`Đã gửi lời mời Cờ Đua tới ${targetName}!`);
        closeBoardInviteModal();
    }
};

window.showBoardInvite = function(msg) {
    if(window.currentScreen === 'boardGame' || document.getElementById('boardGameModal').classList.contains('active')) return;
    document.getElementById('pvpChallengeText').innerHTML = 
        `🎲 <b>${msg.senderName}</b> mời bạn chơi Cờ Đua Sinh Tồn!`;
    document.getElementById('pvpAutoHint').textContent = '';
    
    document.getElementById('acceptPvpBtn').onclick = () => {
        document.getElementById('pvpChallengeModal').style.display = 'none';
        if(typeof pvpChannel !== 'undefined') pvpChannel.postMessage({ type: 'BOARD_PVP_REPLY', id: myNetworkId, senderId: msg.id, targetId: msg.id, accepted: true, replierName: player.name });
        if(window.openBoardGameWithBet) window.openBoardGameWithBet();
    };
    
    document.getElementById('rejectPvpBtn').onclick = () => {
        document.getElementById('pvpChallengeModal').style.display = 'none';
        if(typeof pvpChannel !== 'undefined') pvpChannel.postMessage({ type: 'BOARD_PVP_REPLY', id: myNetworkId, senderId: msg.id, targetId: msg.id, accepted: false, replierName: player.name });
    };
    
    document.getElementById('pvpChallengeModal').style.display = 'flex';
};

console.log('🏁 [board_new.js] Cờ Đua Sinh Tồn v4 loaded!');

// ── Bet Modal & Triggers ──────────────────────────────────────
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
        showToast('⚠️ Không đủ vàng để cược!');
        return;
    }
    player.gold -= amt;
    refreshHudDisplay();
    closeBetModal();
    
    // Bắt đầu game với tiền cược
    openBoardGame(false); 
    boardGame.betPool = amt; 
    boardRenderGrid(); // Render lại để hiện Nồi Cược
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
    btn.textContent = boardGame.gameOver ? '🏁 Ván đã kết thúc' : isMyTurn ? '🎲 Tung Xúc Xắc' : '⏳ Chờ đối thủ...';
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
            window.boardAddLog(`⭐ ${cur.name} tung 6, được thêm lượt!`, 'special');
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
    if(!boardGame) return 'Lỗi game';
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
        return `Đổi vị trí với ${nearest.name}.`;
    }
    return 'Không có ai để đổi.';
};
