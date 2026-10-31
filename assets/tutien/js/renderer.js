// HIGH-PERFORMANCE 60FPS CANVAS 2D RENDERER FOR IMMORTAL DAO WORLD
export class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = { x: 0, y: 0 };
        this.particles = [];
        this.floatingTexts = [];
        this.skillVisuals = [];

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateCamera(targetX, targetY) {
        // Smooth lerp camera
        const targetCamX = targetX - this.canvas.width / 2;
        const targetCamY = targetY - this.canvas.height / 2;
        this.camera.x += (targetCamX - this.camera.x) * 0.1;
        this.camera.y += (targetCamY - this.camera.y) * 0.1;
    }

    addFloatingText(text, x, y, type = 'normal') {
        this.floatingTexts.push({
            text,
            x,
            y,
            type,
            alpha: 1.0,
            vy: -1.5,
            life: 1.0
        });
    }

    addSkillVisual(skillId, x, y) {
        this.skillVisuals.push({
            skillId,
            x,
            y,
            life: 1.0,
            radius: 20
        });
    }

    addQiParticles(x, y, count = 5, color = '#00e5ff') {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -Math.random() * 2 - 0.5,
                radius: Math.random() * 2.5 + 1,
                alpha: 1.0,
                color
            });
        }
    }

    render(snapshot, localPlayerId, mapInfo, now) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

        // 1. RENDER MAP BACKGROUND & TILES
        this.renderMap(ctx, mapInfo, now);

        // 2. RENDER PORTALS
        if (mapInfo && mapInfo.portals) {
            for (const portal of mapInfo.portals) {
                this.renderPortal(ctx, portal, now);
            }
        }

        // 3. RENDER NPCS
        if (mapInfo && mapInfo.npcs) {
            for (const npc of mapInfo.npcs) {
                this.renderNPC(ctx, npc, now);
            }
        }

        // 4. RENDER MONSTERS & BOSSES
        if (snapshot && snapshot.monsters) {
            for (const mob of snapshot.monsters) {
                this.renderMonster(ctx, mob, now);
            }
        }

        // 5. RENDER PLAYERS
        if (snapshot && snapshot.players) {
            for (const p of snapshot.players) {
                const isLocal = (p.id === localPlayerId);
                this.renderPlayer(ctx, p, isLocal, now);
            }
        }

        // 6. RENDER SKILL VISUAL EFFECTS
        this.renderSkillVisuals(ctx, now);

        // 7. RENDER PARTICLES
        this.renderParticles(ctx);

        // 8. RENDER FLOATING DAMAGE / HEAL TEXTS
        this.renderFloatingTexts(ctx);

        ctx.restore();
    }

    renderMap(ctx, mapInfo, now) {
        const w = mapInfo?.width || 1400;
        const h = mapInfo?.height || 1000;

        // Nền tối công nghệ hiện đại
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, 0, w, h);

        // Grid lines linh mạch
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 80;
        for (let x = 0; x <= w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y <= h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Viền ranh giới bản đồ
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, w, h);

        // Đồ họa kiến trúc tượng trưng
        if (mapInfo?.id === 'city_tan_hai') {
            // Tòa tháp trung tâm Vạn Linh
            ctx.fillStyle = 'rgba(16, 24, 48, 0.8)';
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.fillRect(600, 250, 200, 150);
            ctx.strokeRect(600, 250, 200, 150);
            ctx.fillStyle = '#00e5ff';
            ctx.font = 'bold 12px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('🏢 TẬP ĐOÀN VẠN LINH', 700, 330);
        } else if (mapInfo?.id === 'arena_heaven') {
            // Võ đài bát quái trung tâm
            ctx.beginPath();
            ctx.arc(550, 400, 220, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 215, 0, 0.04)';
            ctx.fill();
        }
    }

    renderPortal(ctx, portal, now) {
        const rot = (now / 1000) * 1.5;
        ctx.save();
        ctx.translate(portal.x, portal.y);

        // Vòng xoáy portal
        ctx.rotate(rot);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 1.6);
        ctx.stroke();

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 1.2);
        ctx.stroke();

        ctx.restore();

        // Nhãn cổng dịch chuyển
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 11px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(`🌀 ${portal.label}`, portal.x, portal.y - 36);
    }

    renderNPC(ctx, npc, now) {
        // Vẽ NPC
        ctx.save();
        ctx.translate(npc.x, npc.y);

        // Vòng chân NPC
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 16, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thân NPC
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon NPC
        ctx.fillStyle = '#fff';
        ctx.font = '14px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧘', 0, 0);

        // Tên & Danh hiệu
        ctx.font = 'bold 12px Segoe UI';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(npc.name, 0, -28);

        ctx.font = '10px Segoe UI';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`<${npc.title}>`, 0, -16);

        ctx.restore();
    }

    renderMonster(ctx, mob, now) {
        ctx.save();
        ctx.translate(mob.x, mob.y);

        const radius = mob.isBoss ? 28 : 16;

        // Bóng đổ
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, radius, radius * 1.1, radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hào quang cuồng nộ Boss (Enrage Aura)
        if (mob.isEnraged) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, radius + 8 + Math.sin(now / 150) * 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Thân quái
        ctx.fillStyle = mob.isBoss ? '#b91c1c' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = mob.isBoss ? '#ffd700' : '#ef4444';
        ctx.lineWidth = mob.isBoss ? 3 : 1.5;
        ctx.stroke();

        // Icon quái vật
        ctx.fillStyle = '#fff';
        ctx.font = mob.isBoss ? '22px Segoe UI' : '15px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mob.isBoss ? '👑👹' : '🐺', 0, 0);

        // Tên quái vật
        ctx.font = mob.isBoss ? 'bold 12px Segoe UI' : '11px Segoe UI';
        ctx.fillStyle = mob.isBoss ? '#ffd700' : '#fca5a5';
        ctx.fillText(mob.name, 0, -radius - 14);

        // Thanh HP quái
        const barW = radius * 2.2;
        const barH = 5;
        const hpPercent = Math.max(0, mob.hp / mob.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-barW / 2, -radius - 8, barW, barH);
        ctx.fillStyle = mob.isBoss ? '#ffd700' : '#ef4444';
        ctx.fillRect(-barW / 2, -radius - 8, barW * hpPercent, barH);

        ctx.restore();
    }

    renderPlayer(ctx, p, isLocal, now) {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Hào quang Chân Khí dưới chân (Aura xoay theo cảnh giới)
        const rot = (now / 1000) * 2;
        ctx.save();
        ctx.rotate(rot);
        let auraColor = '#00e5ff';
        if (p.realm >= 3) auraColor = '#ffd700'; // Kim Đan
        if (p.realm >= 4) auraColor = '#a855f7'; // Nguyên Anh
        if (p.realm >= 5) auraColor = '#ef4444'; // Hóa Thần

        ctx.strokeStyle = auraColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Bóng đổ
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Phi kiếm bay lơ lửng phía sau lưng
        const swordFloatY = Math.sin(now / 200) * 3;
        ctx.fillStyle = '#00e5ff';
        ctx.font = '16px Segoe UI';
        ctx.fillText('🗡️', 14, -8 + swordFloatY);

        // Thân người chơi
        ctx.fillStyle = isLocal ? '#0284c7' : '#475569';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isLocal ? '#00e5ff' : '#cbd5e1';
        ctx.lineWidth = isLocal ? 2.5 : 1;
        ctx.stroke();

        // Icon nhân vật
        ctx.fillStyle = '#fff';
        ctx.font = '16px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧙‍♂️', 0, 0);

        // Tên & Danh hiệu
        ctx.font = 'bold 12px Segoe UI';
        ctx.fillStyle = isLocal ? '#00e5ff' : '#fff';
        ctx.fillText(p.name, 0, -28);

        ctx.font = '10px Segoe UI';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`[${p.title}]`, 0, -16);

        // Thanh máu nhỏ
        const barW = 36;
        const hpPct = Math.max(0, p.hp / p.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-barW / 2, -10, barW, 3);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-barW / 2, -10, barW * hpPct, 3);

        ctx.restore();
    }

    renderSkillVisuals(ctx, now) {
        for (let i = this.skillVisuals.length - 1; i >= 0; i--) {
            const fx = this.skillVisuals[i];
            fx.life -= 0.05;
            fx.radius += 5;

            ctx.save();
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 229, 255, ${fx.life})`;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Hiệu ứng lửa hoặc sấm
            if (fx.skillId === 'elemental_burst') {
                ctx.fillStyle = `rgba(239, 68, 68, ${fx.life * 0.4})`;
                ctx.fill();
            } else if (fx.skillId === 'thunder_wrath') {
                ctx.fillStyle = `rgba(168, 85, 247, ${fx.life * 0.4})`;
                ctx.fill();
            }

            ctx.restore();

            if (fx.life <= 0) {
                this.skillVisuals.splice(i, 1);
            }
        }
    }

    renderParticles(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    renderFloatingTexts(ctx) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.life -= 0.025;
            ft.alpha = Math.max(0, ft.life);

            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.font = ft.type === 'crit' ? 'bold 18px Segoe UI' : 'bold 14px Segoe UI';
            ctx.textAlign = 'center';

            if (ft.type === 'crit') {
                ctx.fillStyle = '#ffd700';
            } else if (ft.type === 'heal') {
                ctx.fillStyle = '#34d399';
            } else {
                ctx.fillStyle = '#ef4444';
            }

            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();

            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }
}
