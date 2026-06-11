const fs = require('fs');
let b = fs.readFileSync('./assets/js/game.js', 'utf8');

b = b.replace(/window\.drawBeautifulRPGChibi\(hctx, 30, 24, player\.classId, false, 0\.85, 'right'\);/g, `window.drawBeautifulRPGChibi(hctx, 30, 24, player.classId, false, 0.85, 'right', false, player.equipment.skin);`);

b = b.replace(/window\.drawBeautifulRPGChibi\(ctx, sx, sy \- 10, p\.classId, false, 0\.9, 'right'\);/g, `window.drawBeautifulRPGChibi(ctx, sx, sy - 10, p.classId, false, 0.9, 'right', false, p.equipment?.skin);`);

b = b.replace(/window\.drawBeautifulRPGChibi\(ctx, px, py \- 10, player\.classId, player\.isMoving, 1\.0, faceDir\);/g, `window.drawBeautifulRPGChibi(ctx, px, py - 10, player.classId, player.isMoving, 1.0, faceDir, false, player.equipment.skin);`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Updated draw calls');
