// ===== 🎮 SPRITES_RENDERER.JS — Helbreath Sprite Renderer =====

window.spriteImageCache = {};

// Map monster emojis to Helbreath sprite names
const emojiSpriteMap = {
    "🦟": "ant",
    "🐀": "slm",
    "🐕": "zom",
    "🐗": "cyc",
    "👹": "barlog"
};

// Custom scales for each monster sprite type
const spriteScaleMap = {
    "ant": 1.1,
    "slm": 1.0,
    "zom": 1.2,
    "cyc": 1.3,
    "barlog": 1.8
};

// Resolve 8 directions clockwise (0=Up/North, 1=Up-Right, ..., 7=Up-Left)
function getDirection8(vx, vy) {
    if (vx === 0 && vy === 0) return 4; // Default to facing South/Down
    let angle = Math.atan2(vy, vx) * 180 / Math.PI; // -180 to 180
    let normalized = (angle + 360 + 90 + 22.5) % 360;
    return Math.floor(normalized / 45) % 8;
}

window.drawHelbreathMonster = function(ctx, sx, sy, m) {
    if (!window.GAME_SPRITES_METADATA) return false;

    const spriteName = emojiSpriteMap[m.emoji];
    if (!spriteName) return false;

    const meta = window.GAME_SPRITES_METADATA[spriteName];
    if (!meta) return false;

    const now = Date.now();
    const isAttacking = (m.lastAttack && now - m.lastAttack < 600);
    
    // Resolve facing direction vector
    let dx = m.vx;
    let dy = m.vy;

    if (isAttacking) {
        // Face player when attacking
        dx = window.player.x - m.x;
        dy = window.player.y - m.y;
    } else if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
        // Face player if they are nearby, otherwise idle facing South
        const dist = Math.sqrt((window.player.x - m.x)**2 + (window.player.y - m.y)**2);
        if (dist < 250) {
            dx = window.player.x - m.x;
            dy = window.player.y - m.y;
        } else {
            dx = 0;
            dy = 1;
        }
    }

    // Map monster state to base sheet index
    let baseSheet = 0; // Idle
    if (m.hp <= 0) {
        baseSheet = 32; // Dead
    } else if (isAttacking) {
        baseSheet = 16; // Attack
    } else if (Math.abs(m.vx) > 0.05 || Math.abs(m.vy) > 0.05) {
        baseSheet = 8; // Move
    }

    const dir = getDirection8(dx, dy);
    const sheetIndex = baseSheet + dir;
    const sheetData = meta[sheetIndex];
    if (!sheetData) return false;

    // Retrieve or cache image sheet
    const imgKey = `${spriteName}_sheet_${sheetIndex}`;
    let img = window.spriteImageCache[imgKey];
    if (!img) {
        img = new Image();
        img.src = `assets/sprites/${sheetData.sheetName}`;
        window.spriteImageCache[imgKey] = img;
    }

    if (!img.complete || img.naturalWidth === 0) {
        return false; // Not yet loaded, fallback to emoji
    }

    const frameCount = sheetData.frames.length;
    if (frameCount === 0) return false;

    // Animate frames offset by unique ID to make movements look natural
    const offsetSeed = Math.floor(Math.abs(m.x + m.y) * 10) % 1000;
    const animationTick = (now + offsetSeed) / 100;
    let frameIndex = 0;

    if (m.hp <= 0) {
        frameIndex = frameCount - 1; // Keep last frame for dead
    } else {
        frameIndex = Math.floor(animationTick) % frameCount;
    }

    const frame = sheetData.frames[frameIndex];
    if (!frame) return false;

    const scale = spriteScaleMap[spriteName] || 1.0;

    // Draw Helbreath frame
    ctx.save();
    
    // Draw Soft shadow beneath the monster
    ctx.beginPath();
    ctx.ellipse(sx, sy + (frame.height - frame.pivotY - 5) * scale, 22 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();

    // Render texture frame with pivot offsets
    ctx.drawImage(
        img,
        frame.left,
        frame.top,
        frame.width,
        frame.height,
        sx - frame.pivotX * scale,
        sy - frame.pivotY * scale,
        frame.width * scale,
        frame.height * scale
    );

    ctx.restore();
    return true;
};
