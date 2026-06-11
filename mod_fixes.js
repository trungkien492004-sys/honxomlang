const fs = require('fs');

// 1. Fix board_new.js token rendering
let b = fs.readFileSync('./assets/js/board_new.js', 'utf8');
b = b.replace(/const tokens = cellPlayers\.map\(p =>[^;]+;\n/m, 
`const tokens = cellPlayers.map(p => {
            if(p.skin === "skin_cong_chua") {
                return \`<div class="board-token-large" style="border-color:\${p.color};box-shadow:0 0 8px \${p.color};background:url('assets/img/skins/ayaa.jpg') center/cover;" title="\${p.name} (\${p.lives}❤️)"></div>\`;
            } else {
                return \`<div class="board-token-large" style="border-color:\${p.color};box-shadow:0 0 8px \${p.color};" title="\${p.name} (\${p.lives}❤️)">\${p.emoji}</div>\`;
            }
        }).join('');\n`);
fs.writeFileSync('./assets/js/board_new.js', b, 'utf8');

// 2. Add mobile layout to style.css
let c = fs.readFileSync('./assets/css/style.css', 'utf8');
c += `
/* Mobile Responsive Overrides */
@media (max-width: 768px) {
    #joystickZone { display: none !important; }
    .hud-nav-btn { padding: 5px 8px; font-size: 0.7rem; }
    .mobile-menu-btn { display: flex !important; }
    #hudNavContainer { display: none; flex-direction: column; position: fixed; top: 60px; right: 10px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 10px; z-index: 1000; }
    #hudNavContainer.open { display: flex; }
    .game-panel { width: 95vw !important; left: 2.5vw !important; height: 80vh !important; }
    
    /* Board Game Vertical Layout */
    #boardGameModal .modal-content {
        width: 98vw; height: 90vh;
        flex-direction: column;
    }
    .board-grid {
        /* Mobile layout: Transpose the 10x6 to 6x10 */
        grid-template-columns: repeat(6, 1fr) !important;
        grid-template-rows: repeat(10, 1fr) !important;
        gap: 2px !important;
    }
    .board-cell { min-height: 40px !important; font-size: 0.7rem !important; }
    .board-token-large { width: 18px !important; height: 18px !important; font-size: 0.6rem !important; }
}
`;
fs.writeFileSync('./assets/css/style.css', c, 'utf8');

console.log('Fixed token rendering and added mobile layout CSS');
