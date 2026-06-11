// --- TÁCH HỆ THỐNG VFX (HẠT, THỜI TIẾT, NGÀY/ĐÊM) RA FILE RIÊNG ---

window.vfxParticles = [];
window.weatherParticles = [];
window.screenShake = { x: 0, y: 0, time: 0, magnitude: 0 };
window.gameTimeClock = 600; // 600 phút = 10:00 AM
window.weatherType = 'clear'; // 'clear', 'rain', 'snow', 'petals'

// 1. Tạo hiệu ứng rung màn hình
window.triggerScreenShake = function(magnitude, durationMs) {
    window.screenShake.magnitude = magnitude;
    window.screenShake.time = durationMs;
};

// 2. Sinh hạt (Particle) cho chiêu thức
window.spawnParticle = function(x, y, color, size, life, vx, vy, type = 'normal') {
    window.vfxParticles.push({
        x: x, y: y,
        color: color,
        size: size,
        life: life,
        maxLife: life,
        vx: vx, vy: vy,
        type: type // 'normal', 'glow', 'spark', 'beam', 'aura'
    });
};

// 3. Hiệu ứng chiêu cuối theo phong cách Anime
window.playUltimateVFX = function(x, y, type) {
    window.triggerScreenShake(15, 600); // Rung màn hình
    
    if(type === 'kamehameha') {
        for(let i=0; i<50; i++) {
            let vx = (Math.random() - 0.5) * 20;
            let vy = (Math.random() - 0.5) * 20;
            window.spawnParticle(x, y, '#38bdf8', Math.random()*15 + 5, 40, vx, vy, 'glow');
        }
    } else if (type === 'magic_circle') {
        for(let i=0; i<360; i+=10) {
            let rad = i * Math.PI / 180;
            let vx = Math.cos(rad) * 8;
            let vy = Math.sin(rad) * 8;
            window.spawnParticle(x, y, '#fbbf24', 8, 50, vx, vy, 'glow');
        }
    } else if (type === 'haki') {
        for(let i=0; i<30; i++) {
            let vx = (Math.random() - 0.5) * 25;
            let vy = (Math.random() - 0.5) * 25;
            window.spawnParticle(x, y, i%2===0 ? '#ef4444' : '#000000', Math.random()*20 + 5, 30, vx, vy, 'spark');
        }
    }
};

window.spawnAura = function(x, y, color) {
    let vx = (Math.random() - 0.5) * 2;
    let vy = -Math.random() * 5 - 2;
    window.spawnParticle(x, y, color, Math.random()*8 + 4, 20, vx, vy, 'aura');
};

// 4. Sinh hạt thời tiết
function updateWeather() {
    if(Math.random() < 0.0005) {
        let weathers = ['clear', 'rain', 'snow', 'petals'];
        window.weatherType = weathers[Math.floor(Math.random() * weathers.length)];
    }

    let canvas = document.getElementById('gameCanvas');
    if(!canvas) return;

    if(window.weatherType === 'rain' && Math.random() < 0.3) {
        window.weatherParticles.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: 2, vy: 15, size: 2, color: 'rgba(200, 200, 255, 0.6)', life: 100, type: 'rain'
        });
    } else if(window.weatherType === 'snow' && Math.random() < 0.1) {
        window.weatherParticles.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 2, size: Math.random()*3+2, color: '#ffffff', life: 200, type: 'snow'
        });
    } else if(window.weatherType === 'petals' && Math.random() < 0.05) { // Lá rụng Naruto/Anime
        window.weatherParticles.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 4, vy: 3 + Math.random() * 3, size: Math.random()*5+3, color: '#fbcfe8', life: 200, type: 'petal'
        });
    }
}

// 5. Hàm Render chính cho VFX (Được gọi từ game.js mainGameLoop)
window.renderVFXOverlays = function(ctx, camera) {
    let canvas = ctx.canvas;
    
    // Render Particles
    for(let i = window.vfxParticles.length - 1; i >= 0; i--) {
        let p = window.vfxParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        let alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        
        ctx.beginPath();
        if(p.type === 'glow') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
            ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI*2);
        } else if(p.type === 'spark') {
            ctx.moveTo(p.x - camera.x, p.y - camera.y);
            ctx.lineTo(p.x - camera.x - p.vx*2, p.y - camera.y - p.vy*2);
            ctx.lineWidth = p.size;
            ctx.strokeStyle = p.color;
            ctx.stroke();
        } else if(p.type === 'aura') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.globalCompositeOperation = 'lighter';
            ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI*2);
        } else {
            ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI*2);
        }
        ctx.fill();
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
        
        if(p.life <= 0) window.vfxParticles.splice(i, 1);
    }
    
    // Cập nhật và render Weather (Gắn với màn hình, không trôi theo camera)
    updateWeather();
    for(let i = window.weatherParticles.length - 1; i >= 0; i--) {
        let p = window.weatherParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if(p.type === 'rain') {
            ctx.fillRect(p.x, p.y, p.size/2, p.size * 5);
        } else {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }
        
        if(p.life <= 0 || p.y > canvas.height) {
            window.weatherParticles.splice(i, 1);
        }
    }
    
    // Ngày và Đêm (Day/Night Overlay & Dynamic 2D Lighting)
    window.gameTimeClock += 0.05; // Mỗi khung hình trôi qua một chút
    if(window.gameTimeClock > 1440) window.gameTimeClock = 0; // 1440 phút = 24h
    
    let hour = window.gameTimeClock / 60;
    let darkAlpha = 0;
    let hasDarkness = false;
    let overlayColor = '';
    
    if(hour >= 18 && hour < 20) {
        // Hoàng hôn (18h - 20h)
        darkAlpha = (hour - 18) / 2 * 0.45;
        overlayColor = `rgba(230, 90, 20, ${darkAlpha})`;
        hasDarkness = true;
    } else if (hour >= 20 || hour < 5) {
        // Đêm tối (20h - 5h sáng)
        overlayColor = `rgba(10, 15, 30, 0.68)`;
        hasDarkness = true;
    } else if (hour >= 5 && hour < 7) {
        // Bình minh (5h - 7h sáng)
        darkAlpha = 0.68 - ((hour - 5) / 2 * 0.68);
        overlayColor = `rgba(10, 15, 30, ${darkAlpha})`;
        hasDarkness = true;
    }
    
    if (hasDarkness) {
        ctx.save();
        
        // 1. Phủ bóng tối/hoàng hôn lên toàn màn hình
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = overlayColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. Đục lỗ vùng sáng bằng cơ chế destination-out
        ctx.globalCompositeOperation = 'destination-out';
        
        // Ánh sáng của Player
        if (window.player && window.player.x !== undefined) {
            let px = window.player.x - camera.x;
            let py = window.player.y - camera.y;
            let pRad = 220; 
            let grad = ctx.createRadialGradient(px, py, 15, px, py, pRad);
            grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)'); 
            grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');  
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(px, py, pRad, 0, Math.PI * 2); ctx.fill();
        }
        
        // Ánh sáng của các NPC trong làng
        if (typeof NPC_DATA !== 'undefined') {
            for (let nKey in NPC_DATA) {
                let npc = NPC_DATA[nKey];
                let nx = npc.x - camera.x;
                let ny = npc.y - camera.y;
                let nRad = 150;
                let grad = ctx.createRadialGradient(nx, ny, 10, nx, ny, nRad);
                grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(nx, ny, nRad, 0, Math.PI * 2); ctx.fill();
            }
        }
        
        // Ánh sáng rực lửa bao quanh Boss
        if (window.monsters) {
            window.monsters.forEach(m => {
                if (m.isBoss && m.hp > 0) {
                    let mx = m.x - camera.x;
                    let my = m.y - camera.y;
                    let bRad = 260;
                    let grad = ctx.createRadialGradient(mx, my, 25, mx, my, bRad);
                    grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath(); ctx.arc(mx, my, bRad, 0, Math.PI * 2); ctx.fill();
                }
            });
        }
        
        // 3. Phủ hiệu ứng màu sắc ánh đèn bằng chế độ pha trộn screen
        ctx.globalCompositeOperation = 'screen';
        
        // Ánh sáng đèn vàng ấm áp của Player
        if (window.player && window.player.x !== undefined) {
            let px = window.player.x - camera.x;
            let py = window.player.y - camera.y;
            let gradWarm = ctx.createRadialGradient(px, py, 5, px, py, 220);
            gradWarm.addColorStop(0, 'rgba(253, 186, 116, 0.15)'); 
            gradWarm.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
            ctx.fillStyle = gradWarm;
            ctx.beginPath(); ctx.arc(px, py, 220, 0, Math.PI * 2); ctx.fill();
        }
        
        // Ánh sáng tĩnh của các NPC
        if (typeof NPC_DATA !== 'undefined') {
            for (let nKey in NPC_DATA) {
                let npc = NPC_DATA[nKey];
                let nx = npc.x - camera.x;
                let ny = npc.y - camera.y;
                let gradWarm = ctx.createRadialGradient(nx, ny, 5, nx, ny, 150);
                gradWarm.addColorStop(0, 'rgba(253, 186, 116, 0.18)');
                gradWarm.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
                ctx.fillStyle = gradWarm;
                ctx.beginPath(); ctx.arc(nx, ny, 150, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Quầng lửa đỏ phát sáng bao quanh Siêu Boss
        if (window.monsters) {
            window.monsters.forEach(m => {
                if (m.isBoss && m.hp > 0) {
                    let mx = m.x - camera.x;
                    let my = m.y - camera.y;
                    let gradWarm = ctx.createRadialGradient(mx, my, 15, mx, my, 260);
                    gradWarm.addColorStop(0, 'rgba(239, 68, 68, 0.22)'); 
                    gradWarm.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
                    ctx.fillStyle = gradWarm;
                    ctx.beginPath(); ctx.arc(mx, my, 260, 0, Math.PI * 2); ctx.fill();
                }
            });
        }
        
        ctx.restore();
    }
};
