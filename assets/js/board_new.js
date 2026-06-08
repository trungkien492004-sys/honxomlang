// ===== 🏁 BOARD_NEW.JS — Cờ Đua v3.0 Patch =====
// File này override toàn bộ board game cũ (Cờ Cá Ngựa)
// Phải được load SAU game.js trong index.html

'use strict';

// ── Corrected constants ──────────────────────────────────────
const RACE_DICE_EMOJIS = ['⚀','⚁','⚂','⚃','⚄','⚅'];
const RACE_PLAYER_COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b'];

// ── 25 Magic Cards (4 Rarity Tiers) ─────────────────────────
const RACE_CARDS = [
    // ─── COMMON (7) ───
    { name: "🌪️ Gió Thuận",    rarity: 'common',    desc: "Tiến thêm 3 ô!",                    effect: p => { boardMovePlayer(p.idx, 3, true); return 'Tiến thêm 3 ô.'; } },
    { name: "🌀 Lốc Xoáy",     rarity: 'common',    desc: "Lùi 2 ô!",                          effect: p => { boardMovePlayer(p.idx, -2, true); return 'Lùi 2 ô.'; } },
    { name: "⭐ Vận May",       rarity: 'common',    desc: "+30 vàng thưởng!",                  effect: p => { if(p.networkId===myNetworkId||p.isHuman){player.gold+=30;refreshHudDisplay();} return 'Nhận 30 vàng.'; } },
    { name: "😴 Ngủ Gật",      rarity: 'common',    desc: "Mất lượt tiếp theo!",               effect: p => { p.skipTurn=true; return 'Mất lượt kế tiếp.'; } },
    { name: "🔄 Hoán Vị",      rarity: 'common',    desc: "Đổi vị trí với người gần nhất!",   effect: p => boardSwapNearest(p) },
    { name: "🔁 Tung Lại",     rarity: 'common',    desc: "Được tung xúc xắc thêm 1 lần!",    effect: p => { p.extraRoll=true; return 'Được tung thêm 1 lần.'; } },
    { name: "💰 Kho Báu",      rarity: 'common',    desc: "+50 vàng nếu đứng ô chẵn!",        effect: p => { if(p.pos%2===0&&p.pos>=0&&(p.networkId===myNetworkId||p.isHuman)){player.gold+=50;refreshHudDisplay();return 'Ô chẵn — nhận 50 vàng!';} return 'Ô lẻ — không có vàng.'; } },
    // ─── RARE (8) ───
    { name: "🚀 Siêu Tốc",     rarity: 'rare',      desc: "Tiến thêm 10 ô!",                   effect: p => { boardMovePlayer(p.idx, 10, true); return 'Tiến thêm 10 ô.'; } },
    { name: "🧲 Nam Châm",     rarity: 'rare',      desc: "Kéo người dẫn đầu về chỗ bạn!",   effect: p => boardPullLeader(p) },
    { name: "🛡️ Miễn Nhiễm",  rarity: 'rare',      desc: "Miễn dịch hiệu ứng xấu 2 lượt!",  effect: p => { p.immune=2; return 'Miễn nhiễm 2 lượt.'; } },
    { name: "💣 Đặt Bẫy",      rarity: 'rare',      desc: "Đặt bẫy ở ô hiện tại.",            effect: p => { boardTrapCell(p.pos); return '💣 Đặt bẫy thành công.'; } },
    { name: "🌈 Cầu Vồng",     rarity: 'rare',      desc: "Nhảy tới checkpoint gần nhất!",    effect: p => { const cps=[9,19,29]; const next=cps.find(c=>c>(p.pos||0)); if(next!==undefined&&p.pieces){p.pieces[p.activePiece||0]=next;boardSyncPlayerPos(p);boardRenderGrid();return `Nhảy tới ô ${next+1}.`;} return 'Không có checkpoint phía trước.'; } },
    { name: "🌊 Sóng Thần",    rarity: 'rare',      desc: "Tất cả đối thủ lùi 3 ô!",         effect: p => { boardGame.players.forEach((pl,i)=>{if(i!==p.idx&&!pl.immune)boardMovePlayer(i,-3,true);}); return 'Tất cả đối thủ lùi 3 ô.'; } },
    { name: "🎯 Bắn Tỉa",      rarity: 'rare',      desc: "Người dẫn đầu lùi 5 ô!",          effect: p => { const L=boardGame.players.reduce((a,b)=>(b.pos||0)>(a.pos||0)?b:a); if(L.idx!==p.idx&&!L.immune){boardMovePlayer(L.idx,-5,true);return `${L.name} lùi 5 ô.`;} return 'Không có đối thủ để bắn.'; } },
    { name: "💊 Hồi Phục",     rarity: 'rare',      desc: "Tiến 5 ô và miễn nhiễm 1 lượt!",  effect: p => { boardMovePlayer(p.idx,5,true); p.immune=1; return 'Tiến 5 ô + miễn nhiễm 1 lượt.'; } },
    // ─── EPIC (6) ───
    { name: "🌠 Thiên Mệnh",   rarity: 'epic',      desc: "Nhảy gần về đích!",                effect: p => { if(p.pieces){p.pieces[p.activePiece||0]=Math.min(38,BOARD_TOTAL_CELLS-2);boardSyncPlayerPos(p);boardRenderGrid();} return 'Vọt lên gần đích!'; } },
    { name: "☄️ Thiên Thạch",  rarity: 'epic',      desc: "Tất cả đối thủ lùi 4 ô!",         effect: p => { boardGame.players.forEach((pl,i)=>{if(i!==p.idx&&!pl.immune)boardMovePlayer(i,-4,true);}); return 'Tất cả đối thủ lùi 4 ô.'; } },
    { name: "🕊️ Bình Yên",    rarity: 'epic',      desc: "Không có biến cố lượt này.",       effect: () => 'Lượt này bình yên.' },
    { name: "👑 Vương Giả",    rarity: 'epic',      desc: "+150 vàng hoàng gia!",             effect: p => { if(p.networkId===myNetworkId||p.isHuman){player.gold+=150;refreshHudDisplay();} return 'Nhận 150 vàng hoàng gia.'; } },
    { name: "🔮 Bói Toán",     rarity: 'epic',      desc: "Tiến 6 ô + miễn nhiễm 1 lượt!",  effect: p => { boardMovePlayer(p.idx,6,true); p.immune=1; return 'Tiến 6 ô + miễn nhiễm 1 lượt.'; } },
    { name: "🔀 Ngược Chiều",  rarity: 'epic',      desc: "Đổi chỗ với người cuối bảng!",    effect: p => { const L=boardGame.players.reduce((a,b)=>(b.pos||0)<(a.pos||0)?b:a); if(L.idx!==p.idx&&L.pieces&&p.pieces){const ap=p.activePiece||0,al=L.activePiece||0;const tmp=p.pieces[ap];p.pieces[ap]=L.pieces[al];L.pieces[al]=tmp;boardSyncPlayerPos(p);boardSyncPlayerPos(L);boardRenderGrid();return `Đổi chỗ với ${L.name}!`;} return 'Không có đối thủ.'; } },
    // ─── LEGENDARY (4) ───
    { name: "💎 Kim Cương",    rarity: 'legendary', desc: "+200 vàng cực hiếm!",              effect: p => { if(p.networkId===myNetworkId||p.isHuman){player.gold+=200;refreshHudDisplay();} return '💎 Nhận 200 vàng siêu hiếm!'; } },
    { name: "⚡ Sét Đánh",     rarity: 'legendary', desc: "Một quân bay thẳng về đích!",      effect: p => { if(p.pieces){const i=p.pieces.findIndex(x=>x>=0&&x<BOARD_TOTAL_CELLS-1);if(i>=0){p.pieces[i]=BOARD_TOTAL_CELLS-1;boardSyncPlayerPos(p);boardRenderGrid();return 'Một quân bay thẳng về đích!';}} return 'Không có quân trên đường.'; } },
    { name: "🌀 Hố Đen",       rarity: 'legendary', desc: "Quân mạnh nhất đối thủ về chuồng!", effect: p => { const L=boardGame.players.reduce((a,b)=>(b.pos||0)>(a.pos||0)?b:a);if(L.idx!==p.idx&&!L.immune&&L.pieces){const bi=L.pieces.indexOf(Math.max(...L.pieces));if(bi>=0){L.pieces[bi]=-1;boardSyncPlayerPos(L);boardRenderGrid();return `Quân mạnh của ${L.name} về chuồng!`;}} return 'Không tác dụng.'; } },
    { name: "🌈 Phép Màu",     rarity: 'legendary', desc: "2 hiệu ứng ngẫu nhiên cùng lúc!", effect: p => { const pool=RACE_CARDS.slice(0,20);const r1=pool[Math.floor(Math.random()*pool.length)];const r2=pool[Math.floor(Math.random()*pool.length)];return `${r1.name}: ${r1.effect(p)} | ${r2.name}: ${r2.effect(p)}`; } },
];

// ── OVERRIDE: boardDrawRandomCard ────────────────────────────
window.boardDrawRandomCard = function(p, reason) {
    if(boardGame.gameOver || !p) return;
    // Weighted rarity draw
    const roll = Math.random() * 100;
    let tier = roll < 50 ? 'common' : roll < 80 ? 'rare' : roll < 95 ? 'epic' : 'legendary';
    let pool = RACE_CARDS.filter(c => c.rarity === tier);
    if(!pool.length) pool = RACE_CARDS;
    let card = pool[Math.floor(Math.random() * pool.length)];
    boardSyncPlayerPos(p);
    let result = card.effect(p);
    boardSyncPlayerPos(p);
    const rarityClass = card.rarity !== 'common' ? 'card-' + card.rarity : '';
    const badgeClass  = `badge-${card.rarity}`;
    document.getElementById('boardCardDisplay').innerHTML = `
        <div class="drawn-card ${rarityClass}">
            <span class="card-rarity-badge ${badgeClass}">${card.rarity.toUpperCase()}</span>
            <div style="font-size:1.4rem;margin:4px 0;">${card.name}</div>
            <div style="font-size:0.78rem;color:#cbd5e1;">${card.desc}</div>
            <div style="font-size:0.72rem;color:#fbbf24;margin-top:4px;">${result}</div>
        </div>`;
    boardAddLog(`🃏 ${p.name} lật thẻ (${reason||'cuối lượt'}): ${card.name} — ${result}`, 'card');
};

// ── OVERRIDE: boardDoRollAnimation ──────────────────────────
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
            resultEl.textContent = `${boardPlayer.name} tung được: ${roll}`;
            boardPlayer.lastRoll = roll;
            boardProcessTurn(boardPlayer, roll, callback);
        }
    }, 100);
};

// ── OVERRIDE: boardAddBot ────────────────────────────────────
window.boardAddBot = function() {
    if(boardGame.pvp) { showToast('⚠️ Đang ở chế độ PvP, không thêm Bot.'); return; }
    if(boardGame.players.length >= 4) { showToast('⚠️ Tối đa 4 người chơi!'); return; }
    const idx = boardGame.players.length;
    const botNames  = ['🤖 Bot Trí Tuệ', '🦾 Bot Cơ Học', '🤯 Bot Thần Thánh'];
    const botEmojis = ['🚗','🏎️','🚕'];
    boardGame.players.push({
        idx, name: botNames[idx-1] || `Bot ${idx}`,
        networkId: null, pos: -1, pieces: [-1,-1,-1,-1], activePiece: 0, finished: 0,
        color: RACE_PLAYER_COLORS[idx] || '#f59e0b',
        emoji: botEmojis[idx-1] || '🚗',
        isHuman: false, isBot: true, skipTurn: false, immune: 0
    });
    boardRenderPlayers();
    boardAddLog(`🤖 ${botNames[idx-1]||'Bot'} tham gia đường đua!`);
};

// ── OVERRIDE: boardRenderGrid — Racing Oval (13×9 grid) ─────
function _getCellPos(i) {
    if (i <= 12) return { r: 1, c: i + 1 };
    if (i <= 19) return { r: i - 11, c: 13 };
    if (i <= 32) return { r: 9, c: 13 - (i - 20) };
    return { r: 41 - i, c: 1 };
}
function _cellType(i) {
    if(i===0)  return 'start';
    if(i===39) return 'finish';
    if([9,19,29].includes(i)) return 'boost';
    if(boardGame.trappedCells[i]) return 'trap';
    if([4,14,24,34].includes(i)) return 'card-cell';
    if([7,17,27,37].includes(i)) return 'safe';
    return '';
}
function _cellIcon(i) {
    if(i===0)  return '🏁';
    if(i===39) return '🏆';
    if([9,19,29].includes(i)) return '🚀';
    if(boardGame.trappedCells[i]) return '💣';
    if([4,14,24,34].includes(i)) return '🃏';
    if([7,17,27,37].includes(i)) return '🛡️';
    return '';
}

window.boardRenderGrid = function() {
    const grid = document.getElementById('boardGrid');
    grid.innerHTML = '';
    grid.style.cssText = [
        'display:grid',
        'grid-template-columns:repeat(13,1fr)',
        'grid-template-rows:repeat(9,1fr)',
        'gap:3px',
        'width:100%',
        'aspect-ratio:13/9',
        'max-height:340px',
        'margin-bottom:12px'
    ].join(';');

    // Center panel
    const center = document.createElement('div');
    center.className = 'board-center';
    center.style.cssText = 'grid-row:2/9;grid-column:2/13;';
    center.innerHTML = `
        <div class="board-center-title">🏎️ CỜ ĐUA 🃏</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:4px;">
            ${boardGame.players.map(p => `
                <div style="text-align:center;min-width:56px;">
                    <div style="font-size:1.6rem;">${p.emoji}</div>
                    <div style="font-size:0.62rem;font-weight:800;color:${p.color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:68px;">${p.name}</div>
                    <div style="font-size:0.58rem;color:#64748b;">Ô ${Math.max(0,p.pos)+1} ✅${p.finished||0}/4</div>
                </div>`).join('')}
        </div>
        ${boardGame.betPool ? `<div style="margin-top:6px;font-size:0.7rem;color:#f97316;font-weight:800;">🏆 Nồi cược: ${boardGame.betPool} 💰</div>` : ''}`;
    grid.appendChild(center);

    // 40 track cells
    for(let i = 0; i < BOARD_TOTAL_CELLS; i++) {
        const pos  = _getCellPos(i);
        const type = _cellType(i);
        const icon = _cellIcon(i);
        const tokens = boardGame.players.flatMap(p =>
            (p.pieces || [p.pos]).map(piecePos =>
                piecePos === i ? `<div class="token" style="background:${p.color};box-shadow:0 0 5px ${p.color};" title="${p.name}"></div>` : ''
            )
        ).join('');
        const div = document.createElement('div');
        div.className = 'board-cell' + (type ? ' ' + type : '');
        div.id = `bcell_${i}`;
        div.style.cssText = `grid-row:${pos.r};grid-column:${pos.c};`;
        div.innerHTML = `<span class="cell-num">${i+1}</span><span class="cell-emoji">${icon}</span><div class="cell-tokens">${tokens}</div>`;
        grid.appendChild(div);
    }
};

// ── OVERRIDE: boardRenderPlayers ─────────────────────────────
window.boardRenderPlayers = function() {
    const c = document.getElementById('boardPlayersContainer');
    if(!c) return;
    c.innerHTML = boardGame.players.map((p, i) => {
        const home   = (p.pieces||[]).filter(x => x < 0).length;
        const onRoad = (p.pieces||[]).filter(x => x >= 0 && x < BOARD_TOTAL_CELLS-1).length;
        const done   = p.finished || 0;
        const isCur  = i === boardGame.currentTurn && !boardGame.gameOver;
        return `<div class="board-player-row ${isCur ? 'current' : ''}">
            <div class="player-color-dot" style="background:${p.color};"></div>
            <span style="font-size:1.1rem;">${p.emoji}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.75rem;font-weight:700;color:${p.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${p.name}${isCur?' 🎲':''}${p.skipTurn?' 😴':''}
                </div>
                <div style="font-size:0.6rem;color:#64748b;">🏠${home} 🛣️${onRoad} ✅${done}</div>
            </div>
        </div>`;
    }).join('');
};

// ── OVERRIDE: boardUpdateRollBtn ─────────────────────────────
window.boardUpdateRollBtn = function() {
    const btn = document.getElementById('rollDiceBtn');
    if(!btn) return;
    const my = boardIsMyTurn();
    btn.disabled = boardGame.isRolling || boardGame.gameOver || !my;
    btn.textContent = boardGame.gameOver ? '🏆 Ván đua kết thúc'
        : my ? '🎲 Tung Xúc Xắc' : '⏳ Chờ đối thủ...';
};

// ── OVERRIDE: boardAddLog ────────────────────────────────────
window.boardAddLog = function(text, type) {
    boardGame.log.push({ text, type });
    if(boardGame.log.length > 30) boardGame.log.shift();
    const logEl = document.getElementById('boardLog');
    if(!logEl) return;
    logEl.innerHTML = boardGame.log.map(l => `<p class="${l.type||''}">${l.text}</p>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
};

// ── OVERRIDE: boardProcessTurn ───────────────────────────────
window.boardProcessTurn = function(p, roll, callback) {
    if(p.skipTurn) {
        p.skipTurn = false;
        boardAddLog(`😴 ${p.name} mất lượt vì ngủ gật!`);
        boardDrawRandomCard(p, 'sau lượt ngủ gật');
        if(callback) callback();
        return;
    }
    if(p.immune > 0) p.immune--;
    if(!p.pieces) p.pieces = [-1,-1,-1,-1];
    const pieceIdx = boardChoosePieceIndex(p, roll);
    if(pieceIdx === -1) {
        boardAddLog(`🎲 ${p.name} tung ${roll} nhưng không có quân hợp lệ để đi${roll!==6?' (cần 6 để xuất chuồng)':''}.`);
        boardDrawRandomCard(p, 'cuối lượt');
        boardRenderGrid(); boardRenderPlayers();
        if(callback) callback();
        return;
    }
    p.activePiece = pieceIdx;
    if(p.pieces[pieceIdx] < 0) {
        p.pieces[pieceIdx] = 0;
        boardAddLog(`🏁 ${p.name} xuất quân ${pieceIdx+1} ra đường đua!`, 'special');
    } else {
        boardMovePlayer(p.idx, roll, false);
        boardAddLog(`🚗 ${p.name} di chuyển quân ${pieceIdx+1} thêm ${roll} ô.`);
    }
    const newPos = p.pieces[pieceIdx];
    setTimeout(() => {
        if(boardGame.trappedCells[newPos]) {
            delete boardGame.trappedCells[newPos];
            if(!p.immune) {
                boardAddLog(`💥 ${p.name} dẫm bẫy! Lùi 3 ô!`, 'special');
                boardMovePlayer(p.idx, -3, true);
            } else {
                boardAddLog(`🛡️ ${p.name} miễn nhiễm bẫy!`);
            }
        }
        boardKickOpponents(p, p.pieces[pieceIdx]);
        boardSyncPlayerPos(p);

        if((p.finished || 0) >= BOARD_PIECES_PER_PLAYER) {
            boardGame.gameOver = true;
            let prize = boardGame.betPool || 0;
            if(p.networkId === myNetworkId || p.isHuman) {
                player.gold += (200 + prize);
                refreshHudDisplay();
            }
            const prizeText = prize > 0 ? ` 🏆 +${prize+200} vàng (cược + thưởng)!` : ' +200 vàng thưởng!';
            boardAddLog(`🏆 ${p.name} đã đưa đủ 4 quân về ĐÍCH!${(p.networkId===myNetworkId||p.isHuman) ? prizeText : ' Đối thủ thắng!'}`, 'win');
            document.getElementById('diceResultText').textContent = `🏆 ${p.name} CHIẾN THẮNG!`;
            const bpd = document.getElementById('boardBetPoolDisplay');
            if(bpd) bpd.style.display = 'none';
            showToast(`🏆 ${p.name} thắng Cờ Đua!`);
            audio.play('levelup');
        } else {
            boardDrawRandomCard(p, 'cuối lượt');
        }
        boardRenderGrid(); boardRenderPlayers();
        if(callback) callback();
    }, 400);
};

// ── OVERRIDE: boardKickOpponents ─────────────────────────────
window.boardKickOpponents = function(cur, landingPos) {
    if(landingPos < 0 || landingPos >= BOARD_TOTAL_CELLS - 1) return;
    boardGame.players.forEach(other => {
        if(other.idx === cur.idx || !other.pieces) return;
        other.pieces.forEach((pos, idx) => {
            if(pos === landingPos) {
                other.pieces[idx] = -1;
                boardSyncPlayerPos(other);
                boardAddLog(`💥 ${cur.name} đá quân của ${other.name} về chuồng!`, 'special');
            }
        });
    });
};

// ══════════════════════════════════════════════════════════════
// 💰 BET SYSTEM
// ══════════════════════════════════════════════════════════════
let _boardBetSelected = 0;

window.openBoardGameWithBet = function() {
    audio.play('click');
    _boardBetSelected = 0;
    document.querySelectorAll('.bet-option').forEach(el => el.classList.remove('selected'));
    const ci = document.getElementById('betCustomInput');
    if(ci) ci.value = '';
    document.getElementById('boardBetModal').classList.add('active');
};

window.selectBetAmount = function(amount) {
    _boardBetSelected = amount;
    document.querySelectorAll('.bet-option').forEach(el =>
        el.classList.toggle('selected', el.textContent.startsWith(amount + ''))
    );
    const ci = document.getElementById('betCustomInput');
    if(ci) ci.value = '';
};

window.confirmBetAndStart = function() {
    const customVal = parseInt(document.getElementById('betCustomInput')?.value) || 0;
    const bet = customVal > 0 ? customVal : _boardBetSelected;
    if(bet <= 0)          { showToast('⚠️ Hãy chọn hoặc nhập số vàng cược!'); return; }
    if(bet > player.gold) { showToast(`❌ Không đủ vàng! Bạn chỉ có ${player.gold} 💰`); return; }
    player.gold -= bet;
    refreshHudDisplay();
    document.getElementById('boardBetModal').classList.remove('active');
    showToast(`💰 Đặt cược ${bet} vàng! Chúc may mắn! 🍀`);
    _startBoardGame(bet);
};

window.startBoardGameNoBet = function() {
    document.getElementById('boardBetModal').classList.remove('active');
    _startBoardGame(0);
};

window.closeBetModal = function() {
    document.getElementById('boardBetModal').classList.remove('active');
};

function _startBoardGame(betAmount) {
    boardGame = {
        players: [], currentTurn: 0, isRolling: false,
        trappedCells: {}, log: [], gameOver: false,
        pvp: false, hostId: null, betPool: betAmount
    };
    boardGame.players.push({
        idx: 0, name: player.name, networkId: myNetworkId,
        pos: -1, pieces: [-1,-1,-1,-1], activePiece: 0, finished: 0,
        color: RACE_PLAYER_COLORS[0],
        emoji: CLASS_DATA[player.classId]?.emoji || '🏃',
        isHuman: true, isBot: false, skipTurn: false, immune: 0
    });
    boardAddBot(); // Add 1 bot by default

    const bpd = document.getElementById('boardBetPoolDisplay');
    const bpa = document.getElementById('boardBetPoolAmount');
    if(bpd && bpa) {
        if(betAmount > 0) {
            bpd.style.display = 'flex';
            bpa.textContent = `${betAmount} 💰`;
            const bpdesc = document.getElementById('boardBetPoolDesc');
            if(bpdesc) bpdesc.textContent = '(bấm Mời Bạn để tăng nồi)';
        } else {
            bpd.style.display = 'none';
        }
    }

    boardRenderGrid();
    boardRenderPlayers();
    boardUpdateRollBtn();
    document.getElementById('boardGameModal').classList.add('active');
    boardAddLog(
        `🏁 Cờ Đua bắt đầu!${betAmount>0 ? ` Nồi cược: ${betAmount} 💰.` : ''} Tung 6 để xuất chuồng, về đích 4 quân là thắng!`,
        'special'
    );
}

// ── OVERRIDE: closeBoardGame ─────────────────────────────────
window.closeBoardGame = function() {
    document.getElementById('boardGameModal').classList.remove('active');
};

// ══════════════════════════════════════════════════════════════
// 📨 INVITE FRIEND SYSTEM
// ══════════════════════════════════════════════════════════════
window.openBoardInviteModal = function() {
    const list = document.getElementById('boardInvitePlayerList');
    if(!list) return;
    const entries = Object.entries(typeof networkPlayers !== 'undefined' ? networkPlayers : {});
    if(entries.length === 0) {
        list.innerHTML = '<div style="color:#666;text-align:center;padding:24px;font-size:0.85rem;">😕 Không có người chơi online.<br><br>Mở thêm tab trình duyệt để thử nghiệm!</div>';
    } else {
        list.innerHTML = entries.map(([id, opp]) => {
            const cls = (typeof CLASS_DATA !== 'undefined' && CLASS_DATA[opp.classId]) || {};
            return `<div class="invite-player-item">
                <span style="font-size:1.3rem;">${cls.emoji||'👤'}</span>
                <div style="flex:1;text-align:left;">
                    <div style="font-size:0.82rem;font-weight:800;">${opp.name}</div>
                    <div style="font-size:0.7rem;color:#64748b;">Lv.${opp.level||1} · ${cls.name||'?'}</div>
                </div>
                <button class="board-btn invite-friend" style="padding:6px 14px;font-size:0.75rem;"
                    onclick="boardSendRaceInvite('${id}','${opp.name}')">📨 Mời</button>
            </div>`;
        }).join('');
    }
    document.getElementById('boardInviteModal').classList.add('active');
};

window.closeBoardInviteModal = function() {
    document.getElementById('boardInviteModal').classList.remove('active');
};

window.boardSendRaceInvite = function(targetId, targetName) {
    if(typeof pvpChannel === 'undefined') { showToast('⚠️ Kênh kết nối chưa sẵn sàng!'); return; }
    pvpChannel.postMessage({
        type: 'BOARD_RACE_INVITE',
        id: myNetworkId,
        targetId,
        senderName: player.name,
        betPool: boardGame.betPool || 0
    });
    showToast(`📨 Đã gửi lời mời Cờ Đua tới ${targetName}!`);
    closeBoardInviteModal();
};

// ══════════════════════════════════════════════════════════════
// 🔥 Firebase / Google Login Stub
// Firebase / Google Login Stub removed because firebase.js handles it now

// ── Handle incoming BOARD_RACE_INVITE via BroadcastChannel ───
document.addEventListener('DOMContentLoaded', () => {
    // Patch the pvpChannel message handler if available
    const _patchInterval = setInterval(() => {
        if(typeof pvpChannel !== 'undefined') {
            clearInterval(_patchInterval);
            const _origOnMsg = pvpChannel.onmessage;
            pvpChannel.onmessage = function(e) {
                const msg = e.data;
                if(msg && msg.type === 'BOARD_RACE_INVITE' && msg.targetId === myNetworkId) {
                    const betText = msg.betPool > 0 ? ` Nồi cược: ${msg.betPool} vàng!` : '';
                    if(confirm(`🏁 ${msg.senderName} mời bạn chơi Cờ Đua!${betText}\n\nChấp nhận?`)) {
                        _startBoardGame(msg.betPool || 0);
                        showToast(`🎉 Đã vào ván Cờ Đua của ${msg.senderName}!`);
                    }
                }
                if(_origOnMsg) _origOnMsg.call(this, e);
            };
        }
    }, 500);
});

console.log('🏁 [board_new.js] Cờ Đua v3.0 — Loaded! Cards: ' + RACE_CARDS.length + ' | Features: bet, invite, racing-oval');
