const fs = require('fs');

function fixFile(file, marker) {
    let content = fs.readFileSync(file, 'utf8');
    let idx = content.indexOf(marker);
    if (idx === -1) {
        console.log('Marker not found in ' + file);
        return false;
    }
    let endIdx = content.indexOf('}', idx) + 1;
    let clean = content.substring(0, endIdx);
    return clean;
}

// 1. Fix board_new.js
let cleanBoard = fixFile('./assets/js/board_new.js', 'KhÃ´ng cÃ³ ai Ä‘á»ƒ Ä‘á»•i.');
if(cleanBoard) {
    let extra = `

window.openBoardInviteModal = function() {
    let list = document.getElementById('boardInvitePlayerList');
    if(!list) return;
    list.innerHTML = '';
    let count = 0;
    if(typeof networkPlayers !== 'undefined') {
        Object.entries(networkPlayers).forEach(([id, p]) => {
            count++;
            list.innerHTML += \`<div class="invite-player-row"><span>\${p.name}</span><button class="board-btn" style="padding:4px 8px;font-size:0.7rem;" onclick="sendBoardInvite('\${id}', '\${p.name}')">Mời Chơi Cờ</button></div>\`;
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
`;
    fs.writeFileSync('./assets/js/board_new.js', cleanBoard + extra, 'utf8');
    console.log('Fixed board_new.js');
}

// 2. Fix game.js
let cleanGame = fixFile('./assets/js/game.js', 'function closePartyInviteModal()');
// Actually, for game.js, I need to know where I appended `toggleMobileMenu`.
// Let's check game.js length first.
