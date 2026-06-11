const fs = require('fs');
let b = fs.readFileSync('./assets/js/board_new.js', 'utf8');

b = b.replace(/i === 39 \? 'finish' : ''/g, "i === (BOARD_TOTAL_CELLS - 1) ? 'finish' : ''");
b = b.replace(/i === 39 \? '🏆' : boardGame\.trappedCells\[i\]/g, "i === (BOARD_TOTAL_CELLS - 1) ? '🏆' : boardGame.trappedCells[i]");

const oldTokens = `const tokens = cellPlayers.map(p => 
            \`<div class="board-token-large" style="border-color:\${p.color};box-shadow:0 0 8px \${p.color};" title="\${p.name} (\${p.lives}❤️)">\${p.emoji}</div>\`
        ).join('');`;

const newTokens = `const bgIdx = ((i * 7) % 13) + 1;
        const bgNum = bgIdx < 10 ? '0' + bgIdx : bgIdx;
        const bgImg = 'assets/img/board/Cartoon_Medieval_Training Arena_Level_Set_Platformer - Ground ' + bgNum + '.png';

        const tokens = cellPlayers.map((p, idx) => 
            \`<div class="board-token-large" style="border-color:\${p.color};box-shadow:0 0 8px \${p.color};background:url('assets/img/char_\${p.classId||'cop'}.png') center/cover;" title="\${p.name} (\${p.lives}❤️)"></div>\`
        ).join('');`;

b = b.replace(oldTokens, newTokens);

const oldDiv = `div.style.cssText = \`grid-row:\${pos.r};grid-column:\${pos.c};position:relative;display:flex;align-items:center;justify-content:center;\`;
        div.innerHTML = \`<span class="cell-num">\${i+1}</span><span class="cell-emoji">\${icon}</span><div class="cell-tokens-wrap">\${tokens}</div>\`;`;

const newDiv = `div.style.cssText = \`grid-row:\${pos.r};grid-column:\${pos.c};position:relative;display:flex;align-items:center;justify-content:center;background-image:url('\${bgImg}');\`;
        div.innerHTML = \`<span class="cell-num" style="position:absolute;top:2px;left:4px;font-size:0.65rem;font-weight:900;color:white;text-shadow:0 0 4px #000;">\${i+1}</span><span class="cell-emoji">\${icon}</span><div class="cell-tokens-wrap">\${tokens}</div>\`;`;

b = b.replace(oldDiv, newDiv);

fs.writeFileSync('./assets/js/board_new.js', b, 'utf8');
console.log('Replaced successfully');
