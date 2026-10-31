// HIGH-PERFORMANCE 60FPS CANVAS 2D RENDERER FOR IMMORTAL DAO WORLD
// TU TIEN UI — LOCKED. Read AGENTS.md → "TUTIEN GAME — DO NOT DELETE" before editing.
// tutien.html runs assets/tutien/js/tutien_bundle.js, which mirrors this file's
// 15 world/camera methods line for line. Edit both or the live page stays stale.
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
        let targetCamX = targetX - this.canvas.width / 2;
        let targetCamY = targetY - this.canvas.height / 2;
        // Keep the world edge on screen: a map smaller than the viewport is centred instead.
        const mw = this._mapW || 0, mh = this._mapH || 0;
        if (mw) targetCamX = mw < this.canvas.width ? (mw - this.canvas.width) / 2 : Math.max(0, Math.min(mw - this.canvas.width, targetCamX));
        if (mh) targetCamY = mh < this.canvas.height ? (mh - this.canvas.height) / 2 : Math.max(0, Math.min(mh - this.canvas.height, targetCamY));
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
        this._mapW = mapInfo?.width || 1400;
        this._mapH = mapInfo?.height || 1000;
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

    // Decor is derived from a stable hash of the tile coords, never Math.random, so the
    // skyline does not shimmer between frames.
    _hash(i, j, s) {
        let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
        n = Math.imul(n ^ (n >>> 13), 1274126177);
        return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    }

    _mapTheme(id) {
        const themes = {
            city_tan_hai: { mode: 'city', g0: '9,15,27', g1: '17,28,47', road: '24,34,51', neon: '0,229,255', warm: '242,200,110', skin: ['20,31,51', '25,39,66', '31,48,77'] },
            beast_forest: { mode: 'forest', g0: '5,17,13', g1: '12,33,25', road: '20,48,35', neon: '52,211,153', warm: '250,204,21', skin: ['16,44,31', '21,58,40', '27,72,50'] },
            arena_heaven: { mode: 'arena', g0: '14,9,28', g1: '28,17,54', road: '36,22,66', neon: '168,85,247', warm: '255,215,0', skin: ['27,18,54', '36,24,68', '45,31,84'] },
        };
        return themes[id] || themes.city_tan_hai;
    }

    renderMap(ctx, mapInfo, now) {
        const w = mapInfo?.width || 1400;
        const h = mapInfo?.height || 1000;
        const id = mapInfo?.id || '';
        const T = this._mapTheme(id);
        const vx0 = this.camera.x, vy0 = this.camera.y;
        const vx1 = vx0 + this.canvas.width, vy1 = vy0 + this.canvas.height;
        const vis = (x, y, pad) => x + pad >= vx0 && x - pad <= vx1 && y + pad >= vy0 && y - pad <= vy1;

        if (this._decoKey !== id + ':' + w + 'x' + h) {
            this._decoKey = id + ':' + w + 'x' + h;
            this._keepOut = [...(mapInfo?.portals || []), ...(mapInfo?.npcs || [])];
            if (mapInfo?.spawns) this._keepOut.push(mapInfo.spawns);
            this._wells = [];
            for (let k = 0; k < 4; k++) {
                this._wells.push({ x: (0.14 + 0.24 * k) * w, y: (0.16 + 0.66 * this._hash(k, 7, 3)) * h, r: 165 + 70 * this._hash(k, 11, 5) });
            }
        }
        const crowded = (x, y) => this._keepOut.some(p => Math.abs(p.x - x) < 108 && Math.abs(p.y - y) < 108);
        const onRoad = (x, y) => T.mode === 'city' ? (x > 615 && x < 785) || (y > 435 && y < 565) : T.mode === 'forest' ? (y > 540 && y < 660) : false;

        // Nền đá chuyển sắc
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, `rgb(${T.g1})`);
        bg.addColorStop(1, `rgb(${T.g0})`);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Mạch linh khí chạy dọc bản đồ
        ctx.strokeStyle = `rgba(${T.neon},.10)`;
        ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
            const yMid = h * (0.24 + 0.26 * k);
            if (!vis(w / 2, yMid, w / 2 + 80)) continue;
            ctx.beginPath();
            for (let x = 0; x <= w; x += 48) {
                const y = yMid + Math.sin(x / 190 + k * 2.1) * 55;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Giếng linh khí phát sáng theo nhịp
        for (let k = 0; k < this._wells.length; k++) {
            const well = this._wells[k];
            if (!vis(well.x, well.y, well.r)) continue;
            const pulse = 0.5 + 0.5 * Math.sin(now / 1300 + k * 1.9);
            const g = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, well.r);
            g.addColorStop(0, `rgba(${T.neon},${(0.10 + 0.08 * pulse).toFixed(3)})`);
            g.addColorStop(1, `rgba(${T.neon},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(well.x, well.y, well.r, 0, Math.PI * 2);
            ctx.fill();
        }

        this._drawRoads(ctx, T, w, h, now);

        // Ô lát + decor
        const G = 100;
        const i0 = Math.max(0, Math.floor(vx0 / G) - 1), i1 = Math.min(Math.ceil(w / G), Math.ceil(vx1 / G) + 1);
        const j0 = Math.max(0, Math.floor(vy0 / G) - 1), j1 = Math.min(Math.ceil(h / G), Math.ceil(vy1 / G) + 1);
        for (let i = i0; i <= i1; i++) {
            for (let j = j0; j <= j1; j++) {
                const cx = i * G + G / 2, cy = j * G + G / 2;
                ctx.strokeStyle = `rgba(${T.neon},.05)`;
                ctx.lineWidth = 1;
                ctx.strokeRect(i * G + .5, j * G + .5, G, G);
                if (crowded(cx, cy) || onRoad(cx, cy)) continue;
                const r1 = this._hash(i, j, 1), r2 = this._hash(i, j, 2), r3 = this._hash(i, j, 3);
                if (T.mode === 'city') this._drawCityLot(ctx, T, i, j, cx, cy, r1, r2, r3, now);
                else if (T.mode === 'forest') this._drawForestLot(ctx, T, i, j, cx, cy, r1, r2, r3, now);
                else this._drawArenaLot(ctx, T, i, j, cx, cy, r1, r2, now);
            }
        }

        if (T.mode === 'city') {
            this._drawTower(ctx, T, 600, 236, 200, 164, now, '🏢 TẬP ĐOÀN VẠN LINH');
            this._drawPagoda(ctx, T, 1010, 700, now);
            this._drawPond(ctx, T, 250, 800, now);
        } else if (T.mode === 'forest') {
            this._drawSpiritTree(ctx, T, 800, 560, now);
        } else {
            this._drawArenaRing(ctx, T, w, h, now);
        }

        // Ranh giới bản đồ
        ctx.strokeStyle = `rgba(${T.neon},.22)`;
        ctx.lineWidth = 12;
        ctx.strokeRect(-6, -6, w + 12, h + 12);
        ctx.strokeStyle = `rgba(${T.neon},.85)`;
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, w, h);
        for (const [px, py] of [[0, 0], [w, 0], [0, h], [w, h]]) {
            ctx.fillStyle = `rgba(${T.warm},.85)`;
            ctx.fillRect(px - 9, py - 9, 18, 18);
            ctx.fillStyle = `rgba(${T.warm},.18)`;
            ctx.beginPath();
            ctx.arc(px, py, 26 + 6 * Math.sin(now / 600), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawRoads(ctx, T, w, h, now) {
        if (T.mode === 'city') {
            ctx.fillStyle = `rgb(${T.road})`;
            ctx.fillRect(640, 0, 140, h);
            ctx.fillRect(0, 460, w, 80);
            ctx.strokeStyle = `rgba(${T.neon},.30)`;
            ctx.lineWidth = 2;
            for (const x of [640, 780, 0, w]) {
                ctx.beginPath();
                if (x === 640 || x === 780) { ctx.moveTo(x, 0); ctx.lineTo(x, h); } else { ctx.moveTo(0, 460); ctx.lineTo(w, 460); }
                ctx.stroke();
            }
            ctx.strokeStyle = `rgba(${T.warm},.35)`;
            ctx.setLineDash([22, 26]);
            ctx.beginPath(); ctx.moveTo(710, 0); ctx.lineTo(710, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, 500); ctx.lineTo(w, 500); ctx.stroke();
            ctx.setLineDash([]);
        } else if (T.mode === 'forest') {
            ctx.fillStyle = `rgb(${T.road})`;
            ctx.fillRect(0, 560, w, 80);
            ctx.strokeStyle = `rgba(${T.neon},.22)`;
            ctx.lineWidth = 2;
            ctx.setLineDash([16, 22]);
            ctx.beginPath(); ctx.moveTo(0, 600); ctx.lineTo(w, 600); ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    _drawCityLot(ctx, T, i, j, cx, cy, r1, r2, r3, now) {
        cx += (this._hash(i, j, 4) - .5) * 26;
        cy += (this._hash(i, j, 5) - .5) * 22;
        if (r1 < 0.5) {
            if (r1 > 0.4) { // bồn cây ven đường
                ctx.fillStyle = 'rgba(0,0,0,.4)';
                ctx.beginPath(); ctx.ellipse(cx + 4, cy + 12, 15, 7, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = `rgb(${T.skin[2]})`;
                ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
            }
            return;
        }
        const bw = 56 + Math.floor(r2 * 28), bh = 40 + Math.floor(r3 * 26);
        const bx = cx - bw / 2, by = cy - bh / 2 + 6;
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(bx + 6, by + 9, bw, bh);
        ctx.fillStyle = `rgb(${T.skin[(r1 * 3 | 0) % 3]})`;
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = 'rgba(255,255,255,.07)';
        ctx.fillRect(bx, by, bw, 7);
        ctx.strokeStyle = `rgba(${T.neon},.20)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + .5, by + .5, bw, bh);
        for (let c = 0; c < 3; c++) {
            for (let d = 0; d < 2; d++) {
                const seed = this._hash(i * 7 + c, j * 5 + d, 9);
                if (seed < 0.38) continue;
                const glow = 0.35 + 0.35 * Math.sin(now / 900 + seed * 30);
                ctx.fillStyle = `rgba(${seed > 0.7 ? T.warm : T.neon},${glow.toFixed(3)})`;
                ctx.fillRect(bx + 9 + c * (bw - 24) / 2, by + 15 + d * 16, 8, 10);
            }
        }
        if (r2 > 0.84) {
            ctx.fillStyle = `rgba(${T.warm},.7)`;
            ctx.fillRect(bx + bw * .25, by - 6, bw * .5, 3);
        }
    }

    _drawForestLot(ctx, T, i, j, cx, cy, r1, r2, r3, now) {
        cx += (this._hash(i, j, 4) - .5) * 56;
        cy += (this._hash(i, j, 5) - .5) * 48;
        if (r1 > 0.42) {
            const big = r2 > 0.72;
            const rr = (big ? 27 : 17) * (0.8 + r3 * 0.5);
            ctx.fillStyle = 'rgba(0,0,0,.45)';
            ctx.beginPath(); ctx.ellipse(cx + 5, cy + 15, rr * .95, rr * .42, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#3b2a1c';
            ctx.fillRect(cx - 3, cy - 4, 6, 20);
            ctx.fillStyle = `rgb(${T.skin[(r3 * 3 | 0) % 3]})`;
            for (const [ox, oy, s] of [[-9, -10, .74], [9, -8, .66], [0, -20, .70]]) {
                ctx.beginPath(); ctx.arc(cx + ox * (big ? 1.25 : 1), cy + oy * (big ? 1.2 : 1), rr * s, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = `rgba(${T.neon},.12)`;
            ctx.beginPath(); ctx.arc(cx - 6, cy - 22, rr * .42, 0, Math.PI * 2); ctx.fill();
        } else if (r1 > 0.3) {
            ctx.fillStyle = 'rgba(0,0,0,.4)';
            ctx.beginPath(); ctx.ellipse(cx + 3, cy + 9, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgb(${T.skin[0]})`;
            ctx.beginPath(); ctx.moveTo(cx - 14, cy + 8); ctx.lineTo(cx - 5, cy - 10); ctx.lineTo(cx + 6, cy - 4); ctx.lineTo(cx + 14, cy + 8); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.08)';
            ctx.beginPath(); ctx.moveTo(cx - 5, cy - 10); ctx.lineTo(cx + 6, cy - 4); ctx.lineTo(cx + 1, cy - 1); ctx.closePath(); ctx.fill();
        } else if (r1 > 0.22) {
            const pulse = 0.35 + 0.4 * Math.sin(now / 700 + r2 * 24);
            ctx.fillStyle = `rgba(${T.neon},${pulse.toFixed(3)})`;
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = `rgba(${T.warm},.5)`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, cy + 1); ctx.stroke();
        }
        // Đom đóm: vị trí cố định, chỉ pha dao động
        if (r3 > 0.9) {
            const fy = cy - 26 + Math.sin(now / 800 + r1 * 20) * 9;
            ctx.fillStyle = `rgba(${T.warm},.75)`;
            ctx.beginPath(); ctx.arc(cx + 18, fy, 2, 0, Math.PI * 2); ctx.fill();
        }
    }

    _drawArenaLot(ctx, T, i, j, cx, cy, r1, r2, now) {
        ctx.fillStyle = `rgba(${T.skin[(r1 * 3 | 0) % 3]},.85)`;
        ctx.fillRect(i * 100 + 6, j * 100 + 6, 88, 88);
        ctx.strokeStyle = `rgba(${T.warm},.10)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(i * 100 + 6.5, j * 100 + 6.5, 87, 87);
        if (r2 > 0.86) {
            const pulse = 0.18 + 0.14 * Math.sin(now / 900 + r1 * 18);
            ctx.strokeStyle = `rgba(${T.warm},${pulse.toFixed(3)})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.stroke();
        }
    }

    _drawTower(ctx, T, x, y, tw, th, now, label) {
        if (!this._vis(x + tw / 2, y + th / 2, tw)) return;
        ctx.fillStyle = 'rgba(0,0,0,.55)';
        ctx.fillRect(x + 12, y + 16, tw, th);
        const g = ctx.createLinearGradient(x, y, x + tw, y + th);
        g.addColorStop(0, `rgb(${T.skin[2]})`);
        g.addColorStop(1, `rgb(${T.skin[0]})`);
        ctx.fillStyle = g;
        ctx.fillRect(x, y, tw, th);
        ctx.strokeStyle = `rgba(${T.neon},.55)`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + .5, y + .5, tw, th);
        ctx.fillStyle = `rgba(${T.neon},.10)`;
        for (let c = 1; c < 5; c++) ctx.fillRect(x + c * (tw / 5) - 1, y, 2, th);
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 5; c++) {
                const seed = this._hash(c, r, 21);
                if (seed < 0.4) continue;
                ctx.fillStyle = `rgba(${seed > 0.75 ? T.warm : T.neon},${(0.3 + 0.4 * Math.abs(Math.sin(now / 1100 + seed * 20))).toFixed(3)})`;
                ctx.fillRect(x + 8 + c * (tw / 5), y + 10 + r * (th / 6.5), tw / 5 - 16, th / 6.5 - 12);
            }
        }
        ctx.fillStyle = `rgba(${T.warm},.9)`;
        ctx.fillRect(x + tw / 2 - 2, y - 26, 4, 26);
        ctx.beginPath();
        ctx.arc(x + tw / 2, y - 30, 4 + 2 * Math.sin(now / 450), 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 13px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${T.neon},.95)`;
        ctx.fillText(label, x + tw / 2, y + th + 22);
    }

    _drawPagoda(ctx, T, x, y, now) {
        if (!this._vis(x, y, 130)) return;
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.beginPath(); ctx.ellipse(x + 8, y + 66, 96, 26, 0, 0, Math.PI * 2); ctx.fill();
        for (let tier = 0; tier < 3; tier++) {
            const rw = 150 - tier * 38, ry = y + 52 - tier * 40;
            ctx.fillStyle = `rgb(${T.skin[1]})`;
            ctx.fillRect(x - rw / 2 + 16, ry - 22, rw - 32, 26);
            ctx.fillStyle = `rgba(${T.warm},.55)`;
            ctx.beginPath();
            ctx.moveTo(x - rw / 2, ry - 20);
            ctx.quadraticCurveTo(x, ry - 44, x + rw / 2, ry - 20);
            ctx.quadraticCurveTo(x, ry - 28, x - rw / 2, ry - 20);
            ctx.fill();
            ctx.strokeStyle = `rgba(${T.neon},.35)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        ctx.fillStyle = `rgba(${T.warm},${(0.5 + 0.3 * Math.sin(now / 800)).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y - 68, 6, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 12px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${T.warm},.9)`;
        ctx.fillText('🏮 CHỢ QUÊ CŨ', x, y + 82);
    }

    _drawPond(ctx, T, x, y, now) {
        if (!this._vis(x, y, 120)) return;
        const g = ctx.createRadialGradient(x, y, 8, x, y, 105);
        g.addColorStop(0, `rgba(${T.neon},.34)`);
        g.addColorStop(1, `rgba(${T.neon},.04)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(x, y, 105, 62, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${T.neon},.45)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(x, y, 105, 62, 0, 0, Math.PI * 2); ctx.stroke();
        for (let k = 0; k < 4; k++) {
            const rr = 26 + k * 20 + 6 * Math.sin(now / 1200 + k);
            ctx.strokeStyle = `rgba(${T.warm},${(0.16 - k * 0.03).toFixed(3)})`;
            ctx.beginPath(); ctx.ellipse(x, y, rr, rr * .58, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.font = 'bold 12px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${T.neon},.85)`;
        ctx.fillText('🪷 HỒ LINH KHÍ', x, y + 82);
    }

    _drawSpiritTree(ctx, T, x, y, now) {
        if (!this._vis(x, y, 150)) return;
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.beginPath(); ctx.ellipse(x + 10, y + 74, 92, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${T.warm},.35)`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(x, y + 72, 96, 32, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#4a3524';
        ctx.beginPath();
        ctx.moveTo(x - 16, y + 70); ctx.lineTo(x - 8, y - 40); ctx.lineTo(x + 8, y - 40); ctx.lineTo(x + 16, y + 70);
        ctx.closePath(); ctx.fill();
        const sway = Math.sin(now / 1500) * 4;
        ctx.fillStyle = `rgb(${T.skin[2]})`;
        for (const [ox, oy, r] of [[-52, -52, 46], [52, -46, 42], [0, -86, 52], [-22, -26, 40], [26, -22, 38]]) {
            ctx.beginPath(); ctx.arc(x + ox + sway, y + oy, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = `rgba(${T.neon},.16)`;
        for (const [ox, oy, r] of [[-30, -70, 26], [40, -60, 20], [4, -104, 24]]) {
            ctx.beginPath(); ctx.arc(x + ox + sway, y + oy, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.font = 'bold 13px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${T.warm},.9)`;
        ctx.fillText('🌳 CÂY LINH CHỮA NGÀN NĂM', x, y + 108);
    }

    _drawArenaRing(ctx, T, w, h, now) {
        const cx = w / 2, cy = h / 2;
        if (!this._vis(cx, cy, 320)) return;
        ctx.fillStyle = `rgba(${T.warm},.05)`;
        ctx.beginPath(); ctx.arc(cx, cy, 220, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${T.warm},.6)`;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, 220, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(${T.neon},.35)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 176, 0, Math.PI * 2); ctx.stroke();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(now / 9000);
        ctx.strokeStyle = `rgba(${T.warm},.45)`;
        ctx.lineWidth = 2;
        for (let k = 0; k < 8; k++) {
            ctx.beginPath();
            ctx.moveTo(Math.cos(k * Math.PI / 4) * 96, Math.sin(k * Math.PI / 4) * 96);
            ctx.lineTo(Math.cos(k * Math.PI / 4) * 176, Math.sin(k * Math.PI / 4) * 176);
            ctx.stroke();
        }
        ctx.restore();
        ctx.font = 'bold 13px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${T.warm},.85)`;
        ctx.fillText('⚔️ VÕ ĐÀI BÁT QUÁI', cx, cy - 236);
        for (const [px, py] of [[110, 110], [w - 110, 110], [110, h - 110], [w - 110, h - 110]]) {
            if (!this._vis(px, py, 70)) continue;
            const flame = 0.55 + 0.35 * Math.sin(now / 320 + px);
            ctx.fillStyle = 'rgba(0,0,0,.5)';
            ctx.beginPath(); ctx.ellipse(px + 6, py + 40, 26, 11, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgb(${T.skin[1]})`;
            ctx.fillRect(px - 13, py - 34, 26, 74);
            ctx.strokeStyle = `rgba(${T.warm},.55)`;
            ctx.lineWidth = 2;
            ctx.strokeRect(px - 12.5, py - 33.5, 26, 74);
            ctx.fillStyle = `rgba(${T.warm},${flame.toFixed(3)})`;
            ctx.beginPath(); ctx.arc(px, py - 46, 11, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgba(${T.neon},${(flame * .35).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(px, py - 46, 24, 0, Math.PI * 2); ctx.fill();
        }
    }

    _vis(x, y, pad) {
        return x + pad >= this.camera.x && x - pad <= this.camera.x + this.canvas.width
            && y + pad >= this.camera.y && y - pad <= this.camera.y + this.canvas.height;
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
