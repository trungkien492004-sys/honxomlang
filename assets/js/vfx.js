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
    triggerScreenShake(15, 600); // Rung màn hình
    
    if(type === 'kamehameha') {
        for(let i=0; i<50; i++) {
            let vx = (Math.random() - 0.5) * 20;
            let vy = (Math.random() - 0.5) * 20;
            spawnParticle(x, y, '#38bdf8', Math.random()*15 + 5, 40, vx, vy, 'glow');
        }
    } else if (type === 'magic_circle') {
        for(let i=0; i<360; i+=10) {
            let rad = i * Math.PI / 180;
            let vx = Math.cos(rad) * 8;
            let vy = Math.sin(rad) * 8;
            spawnParticle(x, y, '#fbbf24', 8, 50, vx, vy, 'glow');
        }
    } else if (type === 'haki') {
        for(let i=0; i<30; i++) {
            let vx = (Math.random() - 0.5) * 25;
            let vy = (Math.random() - 0.5) * 25;
            spawnParticle(x, y, i%2===0 ? '#ef4444' : '#000000', Math.random()*20 + 5, 30, vx, vy, 'spark');
        }
    }
};

window.spawnAura = function(x, y, color) {
    let vx = (Math.random() - 0.5) * 2;
    let vy = -Math.random() * 5 - 2;
    spawnParticle(x, y, color, Math.random()*8 + 4, 20, vx, vy, 'aura');
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
        weatherParticles.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: 2, vy: 15, size: 2, color: 'rgba(200, 200, 255, 0.6)', life: 100, type: 'rain'
        });
    } else if(window.weatherType === 'snow' && Math.random() < 0.1) {
        weatherParticles.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 2, size: Math.random()*3+2, color: '#ffffff', life: 200, type: 'snow'
        });
    } else if(window.weatherType === 'petals' && Math.random() < 0.05) { // Lá rụng Naruto/Anime
        weatherParticles.push({
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
    
    // Ngày và Đêm (Day/Night Overlay)
    window.gameTimeClock += 0.05; // Mỗi khung hình trôi qua một chút
    if(window.gameTimeClock > 1440) window.gameTimeClock = 0; // 1440 phút = 24h
    
    let hour = window.gameTimeClock / 60;
    let darkAlpha = 0;
    
    ctx.globalCompositeOperation = 'multiply';
    if(hour >= 18 && hour < 20) {
        // Hoàng hôn
        darkAlpha = (hour - 18) / 2 * 0.4;
        ctx.fillStyle = `rgba(255, 120, 50, ${darkAlpha * 0.5})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (hour >= 20 || hour < 5) {
        // Đêm tối
        ctx.fillStyle = `rgba(10, 10, 40, 0.7)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (hour >= 5 && hour < 7) {
        // Bình minh
        darkAlpha = 0.7 - ((hour - 5) / 2 * 0.7);
        ctx.fillStyle = `rgba(10, 10, 40, ${darkAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.globalCompositeOperation = 'source-over';
};
