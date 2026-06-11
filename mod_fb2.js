const fs = require('fs');
let b = fs.readFileSync('./assets/js/firebase.js', 'utf8');

b = b.replace(/window\.drawBeautifulRPGChibi = function\(ctx, x, y, classId, isMoving = false, scale = 1, faceDirection = 'right', isBlinking = false\) \{/, 
`window.drawBeautifulRPGChibi = function(ctx, x, y, classId, isMoving = false, scale = 1, faceDirection = 'right', isBlinking = false, skinId = null) {
    if(skinId === 'skin_cong_chua') {
        const imgName = isMoving ? 'ayaa.jpg' : 'aya.jpg';
        if(!_skinCache[imgName]) {
            let img = new Image();
            img.src = 'assets/img/skins/' + imgName;
            _skinCache[imgName] = img;
        }
        if(_skinCache[imgName].complete && _skinCache[imgName].naturalWidth > 0) {
            ctx.save();
            if(faceDirection === 'left') {
                ctx.translate(x, y);
                ctx.scale(-1, 1);
                ctx.translate(-x, -y);
            }
            let drawW = 60 * scale;
            let drawH = 60 * scale;
            let drawX = x - drawW / 2;
            let drawY = (y - 30 * scale) + (isMoving ? Math.sin(Date.now() / 150) * 4 * scale : 0);
            
            // Draw sparkly aura
            ctx.shadowColor = 'rgba(255, 182, 193, 0.8)';
            ctx.shadowBlur = 15;
            ctx.drawImage(_skinCache[imgName], drawX, drawY, drawW, drawH);
            ctx.restore();
            return; // Skip normal drawing
        }
    }
`);

fs.writeFileSync('./assets/js/firebase.js', b, 'utf8');
console.log('Updated drawBeautifulRPGChibi');
