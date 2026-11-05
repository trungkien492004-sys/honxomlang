// TU TIEN KY NGUYEN HIEN DAI - STANDALONE WEB ENGINE BUNDLE (NO EXTERNAL DEPENDENCIES)
// TU TIEN UI — LOCKED. Read AGENTS.md → "TUTIEN GAME — DO NOT DELETE" before editing.
// The 15 GameRenderer world/camera methods listed in AGENTS.md mirror
// assets/tutien/js/renderer.js line for line. This bundle is what tutien.html
// executes; changing only renderer.js changes nothing on the live page.

// --- 1. PROCEDURAL WEB AUDIO ENGINE ---
class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playSlash() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }

    playThunder() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(now + 0.8);
    }

    playMeditationQi() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.5);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(now + 0.5);
    }

    playHeavenlyChime() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50];

        freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.1);

            gain.gain.setValueAtTime(0.15, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 1.2);
        });
    }

    playCoin() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(now + 0.25);
    }
}

const audio = new AudioManager();

// --- 2. 60FPS CANVAS 2D RENDERER ---
class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = { x: 0, y: 0 };
        this.particles = [];
        this.floatingTexts = [];
        this.skillVisuals = [];
        this._pl = {};
        this._loadSprites();

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    // Kenney (CC0): urban.png = RPG Urban Pack, dungeon.png = Tiny Dungeon. Ô 16x16.
    _loadSprites() {
        this.sheets = {};
        for (const [k, f] of [['urban', 'urban.png'], ['dungeon', 'dungeon.png']]) {
            const im = new Image();
            im.onload = () => { im._ok = true; if (this.onSheetsLoaded) this.onSheetsLoaded(); };
            im.src = 'assets/tutien/img/' + f;
            this.sheets[k] = im;
        }
    }

    _tile(ctx, im, idx, dx, dy, s) {
        const cols = Math.floor(im.width / 16);
        ctx.drawImage(im, (idx % cols) * 16, Math.floor(idx / cols) * 16, 16, 16, dx, dy, 16 * s, 16 * s);
    }

    _block(ctx, im, idx, w, h, dx, dy, s) {
        const cols = Math.floor(im.width / 16);
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) this._tile(ctx, im, idx + r * cols + c, dx + c * 16 * s, dy + r * 16 * s, s);
        }
    }

    // Chỉ số ô nhân vật Urban: nhóm g (3 hàng khung đi) x 4 hướng (cột 23..26).
    static charGroup(school) {
        return { sword: 0, body: 3, spell: 2, array: 4, demonic: 1, medicine: 5 }[school] ?? 0;
    }
    charIndex(school, frame, dir) {
        return (GameRenderer.charGroup(school) * 3 + frame) * 27 + 23 + dir;
    }

    // Vẽ 1 ô sprite lên canvas phụ (chân dung trong khung chiến đấu / HUD).
    drawSpriteTo(canvas, sheet, idx) {
        const im = this.sheets && this.sheets[sheet];
        if (!canvas || !im || !im._ok) return false;
        const c = canvas.getContext('2d');
        c.imageSmoothingEnabled = false;
        c.clearRect(0, 0, canvas.width, canvas.height);
        const cols = Math.floor(im.width / 16);
        c.drawImage(im, (idx % cols) * 16, Math.floor(idx / cols) * 16, 16, 16, 0, 0, canvas.width, canvas.height);
        return true;
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
        ctx.imageSmoothingEnabled = false;

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
                const im = this.sheets && this.sheets.urban;
                ctx.fillStyle = 'rgba(0,0,0,.4)';
                ctx.beginPath(); ctx.ellipse(cx + 4, cy + 12, 15, 7, 0, 0, Math.PI * 2); ctx.fill();
                if (im && im._ok) {
                    this._tile(ctx, im, (this._hash(i, j, 8) > 0.5 ? 367 : 286) + (r2 > 0.5 ? 1 : 0), cx - 24, cy - 32, 3);
                } else {
                    ctx.fillStyle = `rgb(${T.skin[2]})`;
                    ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
                }
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
        if (r1 > 0.42 && this._spriteTree(ctx, i, j, r2, r3, cx, cy)) {
            // cây sprite đã vẽ
        } else if (r1 > 0.42) {
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

    _spriteTree(ctx, i, j, r2, r3, cx, cy) {
        const im = this.sheets && this.sheets.urban;
        if (!im || !im._ok) return false;
        const o = this._hash(i, j, 6) > 0.5 ? 81 : 0; // biến thể lá cam
        let idx, w, h;
        if (r2 > 0.8) { idx = 235 + o; w = 2; h = 3; } else if (r3 > 0.5) { idx = 232 + o; w = 1; h = 2; } else { idx = 233 + o; w = 1; h = 2; }
        const s = 3;
        ctx.fillStyle = 'rgba(0,0,0,.4)';
        ctx.beginPath(); ctx.ellipse(cx, cy + 14, w * 8 * s * 0.75, 9, 0, 0, Math.PI * 2); ctx.fill();
        this._block(ctx, im, idx, w, h, cx - w * 8 * s, cy + 14 - h * 16 * s, s);
        return true;
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
        const gim = this.sheets && this.sheets.urban;
        if (gim && gim._ok) {
            // Rừng linh thụ sprite (Kenney) phóng 5x, nhấp nhô theo gió
            const sway = Math.sin(now / 1500) * 2;
            this._block(ctx, gim, 235, 2, 3, x - 80 + sway, y + 70 - 240, 5);
            ctx.fillStyle = `rgba(${T.neon},.10)`;
            ctx.beginPath(); ctx.ellipse(x, y - 40, 110, 130, 0, 0, Math.PI * 2); ctx.fill();
        } else {
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
        ctx.font = 'bold 11px Segoe UI, Nunito';
        ctx.textAlign = 'center';
        ctx.fillText(`🌀 ${portal.label}`, portal.x, portal.y - 36);
    }

    renderNPC(ctx, npc, now) {
        const im = this.sheets && this.sheets.dungeon;
        ctx.save();
        ctx.translate(npc.x, npc.y);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        let top = -20;
        if (im && im._ok && npc.sprite !== undefined) {
            const s = 3;
            const bob = Math.sin(now / 500 + npc.x) * 1.5;
            this._tile(ctx, im, npc.sprite, -8 * s, 10 - 16 * s + bob, s);
            top = 10 - 16 * s;
        } else {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = '14px Segoe UI';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🧘', 0, 0);
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.font = 'bold 12px Segoe UI, Nunito';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(npc.name, 0, top - 16);
        ctx.font = '10px Segoe UI, Nunito';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`<${npc.title}>`, 0, top - 4);
        ctx.restore();
    }

    renderMonster(ctx, mob, now) {
        const im = this.sheets && this.sheets.dungeon;
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

        let top = -radius;
        if (im && im._ok && mob.sprite !== undefined) {
            const s = mob.isBoss ? 5 : 3;
            const bob = Math.sin(now / 280 + mob.homeX * 0.01) * 2;
            this._tile(ctx, im, mob.sprite, -8 * s, radius * 0.8 - 16 * s + bob, s);
            top = radius * 0.8 - 16 * s;
        } else {
            ctx.fillStyle = mob.isBoss ? '#b91c1c' : '#7f1d1d';
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = mob.isBoss ? '#ffd700' : '#ef4444';
            ctx.lineWidth = mob.isBoss ? 3 : 1.5;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = mob.isBoss ? '22px Segoe UI' : '15px Segoe UI';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mob.isBoss ? '👑👹' : '🐺', 0, 0);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.font = mob.isBoss ? 'bold 12px Segoe UI, Nunito' : '11px Segoe UI, Nunito';
        ctx.fillStyle = mob.isBoss ? '#ffd700' : '#fca5a5';
        ctx.fillText((mob.element ? mob.element + ' · ' : '') + mob.name, 0, top - 10);

        // Thanh HP quái
        const barW = Math.max(radius * 2.2, 40);
        const barH = 5;
        const hpPercent = Math.max(0, mob.hp / mob.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-barW / 2, top - 6, barW, barH);
        ctx.fillStyle = mob.isBoss ? '#ffd700' : '#ef4444';
        ctx.fillRect(-barW / 2, top - 6, barW * hpPercent, barH);

        ctx.restore();
    }

    renderPlayer(ctx, p, isLocal, now) {
        const im = this.sheets && this.sheets.urban;
        const px = p.pos_x ?? p.x, py = p.pos_y ?? p.y;
        ctx.save();
        ctx.translate(px, py);

        // Hào quang Chân Khí dưới chân (Aura xoay theo cảnh giới)
        const rot = (now / 1000) * 2;
        ctx.save();
        ctx.translate(0, 8);
        ctx.rotate(rot);
        let auraColor = '#00e5ff';
        if (p.realm >= 3) auraColor = '#ffd700'; // Kim Đan
        if (p.realm >= 4) auraColor = '#a855f7'; // Nguyên Anh
        if (p.realm >= 5) auraColor = '#ef4444'; // Hóa Thần

        ctx.strokeStyle = auraColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Bóng đổ
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hướng & khung hoạt ảnh đi theo độ dời thực tế giữa các frame
        const st = this._pl[p.id] || (this._pl[p.id] = { x: px, y: py, dir: 1, mv: -1e9 });
        const ddx = px - st.x, ddy = py - st.y;
        if (ddx || ddy) {
            st.mv = now;
            if (Math.abs(ddx) > Math.abs(ddy)) st.dir = ddx > 0 ? 3 : 0; else st.dir = ddy > 0 ? 1 : 2;
        }
        st.x = px; st.y = py;
        const moving = now - st.mv < 140;
        const frame = moving ? [0, 1, 2, 1][Math.floor(now / 110) % 4] : 1;

        // Phi kiếm bay lơ lửng phía sau lưng
        const swordFloatY = Math.sin(now / 200) * 3;
        const dm = this.sheets && this.sheets.dungeon;
        if (dm && dm._ok) {
            ctx.save();
            ctx.translate(26, -18 + swordFloatY);
            ctx.rotate(Math.PI / 4);
            this._tile(ctx, dm, 104, -16, -16, 2);
            ctx.restore();
        }

        let top = -24;
        if (im && im._ok) {
            const s = 3;
            this._tile(ctx, im, this.charIndex(p.school, frame, st.dir), -8 * s, 8 - 16 * s, s);
            top = 8 - 16 * s;
            if (isLocal) {
                ctx.strokeStyle = 'rgba(0,229,255,.9)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(-6, top - 5); ctx.lineTo(0, top - 1); ctx.lineTo(6, top - 5); ctx.stroke();
            }
        } else {
            ctx.fillStyle = isLocal ? '#0284c7' : '#475569';
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isLocal ? '#00e5ff' : '#cbd5e1';
            ctx.lineWidth = isLocal ? 2.5 : 1;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = '16px Segoe UI';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🧙‍♂️', 0, 0);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        // Thanh máu nhỏ
        const barW = 36;
        const hpPct = Math.max(0, p.hp / (p.max_hp ?? p.maxHp));
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-barW / 2, top - 12, barW, 4);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-barW / 2, top - 12, barW * hpPct, 4);

        // Tên & Danh hiệu
        ctx.font = 'bold 12px Segoe UI, Nunito';
        ctx.fillStyle = isLocal ? '#00e5ff' : '#fff';
        ctx.fillText(p.name, 0, top - 28);
        ctx.font = '10px Segoe UI, Nunito';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`[${p.title}]`, 0, top - 16);

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

// --- 3. GAME ENGINE ---
// CẤU HÌNH CẢNH GIỚI & DỮ LIỆU
const REALMS_DATA = [
    { id: 1, name: 'Luyện Khí', maxStages: 9, baseHp: 250, baseMp: 120, baseAtk: 30, baseDef: 18, expReq: 120, tribulation: false },
    { id: 2, name: 'Trúc Cơ', maxStages: 4, baseHp: 800, baseMp: 400, baseAtk: 95, baseDef: 60, expReq: 3500, tribulation: false },
    { id: 3, name: 'Kim Đan', maxStages: 4, baseHp: 2400, baseMp: 1100, baseAtk: 260, baseDef: 170, expReq: 18000, tribulation: true, bolts: 3 },
    { id: 4, name: 'Nguyên Anh', maxStages: 4, baseHp: 6500, baseMp: 3000, baseAtk: 650, baseDef: 420, expReq: 80000, tribulation: true, bolts: 6 },
    { id: 5, name: 'Hóa Thần', maxStages: 4, baseHp: 16000, baseMp: 7500, baseAtk: 1550, baseDef: 980, expReq: 300000, tribulation: true, bolts: 9 }
];

const MAPS_DATA = {
    city_tan_hai: {
        id: 'city_tan_hai',
        name: 'Đô Thị Tân Hải',
        width: 1400,
        height: 1000,
        ambientQi: 1.0,
        safe: true,
        spawns: { x: 450, y: 500 },
        portals: [
            { targetMap: 'beast_forest', x: 100, y: 500, label: 'Lối Ra Rừng Yêu Thú' },
            { targetMap: 'arena_heaven', x: 700, y: 100, label: 'Thiên Môn Đấu Trường (PvP)' }
        ],
        npcs: [
            { id: 'npc_guide', name: 'Lý Linh Vân', title: 'Hiệp Hội Tu Sĩ Đô Thị', x: 500, y: 400, sprite: 99 },
            { id: 'npc_ceo', name: 'Vương Tổng', title: 'Chủ Tịch Tập Đoàn Vạn Linh', x: 800, y: 400, sprite: 100 }
        ]
    },
    beast_forest: {
        id: 'beast_forest',
        name: 'Rừng Yêu Thú Ngoại Ô',
        width: 1600,
        height: 1200,
        ambientQi: 2.0,
        spawns: { x: 1450, y: 600 },
        portals: [
            { targetMap: 'city_tan_hai', x: 1550, y: 600, label: 'Về Đô Thị Tân Hải' }
        ]
    },
    arena_heaven: {
        id: 'arena_heaven',
        name: 'Thiên Môn Đấu Trường',
        width: 1100,
        height: 800,
        ambientQi: 1.0,
        safe: true,
        spawns: { x: 550, y: 700 },
        portals: [
            { targetMap: 'city_tan_hai', x: 550, y: 760, label: 'Về Đô Thị' }
        ]
    }
};

// ===== NGŨ HÀNH & KỸ NĂNG =====
// beats[a] = các hệ mà a khắc (x1.5); bị khắc ngược lại thì x0.75.
const ELEMENT_BEATS = {
    'Kim': ['Mộc'], 'Mộc': ['Thổ'], 'Thổ': ['Thủy'], 'Thủy': ['Hỏa'], 'Hỏa': ['Kim'],
    'Lôi': ['Thủy', 'Phong'], 'Phong': ['Thổ']
};
const ELEMENT_ICON = { 'Kim': '⚙️', 'Mộc': '🌿', 'Thủy': '💧', 'Hỏa': '🔥', 'Thổ': '⛰️', 'Lôi': '⚡', 'Phong': '🌪️' };
function elementMult(att, def) {
    if ((ELEMENT_BEATS[att] || []).includes(def)) return 1.5;
    if ((ELEMENT_BEATS[def] || []).includes(att)) return 0.75;
    return 1;
}

const SKILLS_DATA = [
    { id: 'sword_slash', name: 'Thanh Phong Kiếm Khí', el: 'Kim', mpCost: 15, cd: 0, dmgMult: 1.4, icon: '🗡️' },
    { id: 'ten_thousand_swords', name: 'Vạn Kiếm Quy Tông', el: 'Kim', mpCost: 45, cd: 3, dmgMult: 2.8, icon: '✨⚔️' },
    { id: 'elemental_burst', name: 'Hỏa Cầu Diễm Bạo', el: 'Hỏa', mpCost: 30, cd: 2, dmgMult: 2.1, burn: 3, icon: '🔥' },
    { id: 'thunder_wrath', name: 'Cửu Thiên Thần Lôi', el: 'Lôi', mpCost: 60, cd: 4, dmgMult: 3.2, stunChance: 0.5, icon: '⚡' }
];

const PILL_HEAL = 'Tụ Khí Đan';
const PILL_BREAK = 'Phá Cảnh Đan';
const SHOP = {
    heal: { name: PILL_HEAL, type: 'pill', rarity: 'spiritual', currency: 'gold', price: 150 },
    break: { name: PILL_BREAK, type: 'pill_break', rarity: 'earth', currency: 'spirit_stones', price: 10 }
};

// Quái theo bản đồ. `moves`: đòn của quái; heavy = báo trước 1 lượt, phòng thủ giảm mạnh.
function mobTemplates() {
    const wolf = [{ name: 'Cắn Xé', mult: 1, w: 3 }, { name: 'Vồ Mạnh', mult: 1.9, w: 1, heavy: true }];
    const eagle = [{ name: 'Mổ', mult: 1, w: 2 }, { name: 'Lôi Điện Giáng', mult: 1.7, w: 1, heavy: true }];
    const bear = [{ name: 'Vả', mult: 1, w: 2 }, { name: 'Hỏa Diễm Phun', mult: 1.2, w: 2, burn: 3 }, { name: 'Địa Chấn', mult: 2.1, w: 1, heavy: true }];
    const demon = [{ name: 'Ma Trảo', mult: 1, w: 2 }, { name: 'Hư Không Thực', mult: 1.4, w: 2, burn: 3 }, { name: 'Diệt Thế', mult: 2.4, w: 1, heavy: true }];
    const mk = (id, name, el, hp, atk, def, speed, x, y, realm, moves, extra = {}) => ({
        id, name, element: el, isBoss: false, maxHp: hp, hp, atk, def, speed, x, y, homeX: x, homeY: y,
        realm, moves, isDead: false, isEnraged: false, nextEngage: 0, respawnAt: 0, ...extra
    });
    const list = [
        mk('mob_1', 'Thiết Giáp Sói', 'Kim', 260, 32, 14, 90, 800, 500, 1, wolf, { mapId: 'beast_forest' }),
        mk('mob_5', 'Thanh Mộc Sói', 'Mộc', 260, 30, 12, 90, 1100, 800, 1, wolf, { mapId: 'beast_forest' }),
        mk('mob_2', 'Lôi Đình Ưng', 'Lôi', 340, 42, 12, 110, 600, 300, 1, eagle, { mapId: 'beast_forest' }),
        mk('mob_6', 'Hàn Thủy Xà', 'Thủy', 300, 36, 10, 95, 450, 900, 1, wolf, { mapId: 'beast_forest' }),
        mk('mob_3', 'Xích Viêm Cự Hùng (Thủ Lĩnh)', 'Hỏa', 2200, 80, 50, 75, 500, 600, 2, bear, { mapId: 'beast_forest', isBoss: true }),
        mk('mob_4', 'Hư Không Diệt Thế Ma Tôn (Thế Giới Boss)', 'Thủy', 12000, 300, 160, 85, 250, 1000, 3, demon, { mapId: 'beast_forest', isBoss: true })
    ];
    // Ô sprite trong dungeon.png (Kenney Tiny Dungeon)
    const SPR = { mob_1: 124, mob_5: 122, mob_2: 120, mob_6: 108, mob_3: 110, mob_4: 121 };
    for (const m of list) m.sprite = SPR[m.id];
    return list;
}

// Hiệu ứng chiến đấu: ảnh hạt Kenney (CC0) tô màu bằng mask, chồng lên thẻ nhân vật.
const FX = {
    attack: [['slash_03', '#e2e8f0', 1]],
    sword_slash: [['slash_02', '#bfe9ff', 1]],
    ten_thousand_swords: [['slash_01', '#ffffff', 1.3], ['star_04', '#7dd3fc', 1]],
    elemental_burst: [['fire_01', '#ff6a2b', 1.3], ['flame_01', '#ffd24a', 1]],
    thunder_wrath: [['spark_01', '#c084fc', 1.4], ['light_01', '#e9d5ff', 1.2]],
    enemy_hit: [['slash_03', '#ff5a5a', 1]],
    enemy_heavy: [['magic_03', '#ff3b3b', 1.4], ['flare_01', '#ffd24a', 1.2]],
    bolt: [['spark_03', '#c084fc', 1.5], ['light_01', '#ffffff', 1.4]],
    heal: [['magic_05', '#34d399', 1.2]],
    guard: [['circle_03', '#67e8f9', 1.2]]
};
const PVP_SPRITES = [84, 86, 87, 96, 97, 98, 99, 100, 111, 112];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (a, b) => a + Math.random() * (b - a);

class TuTienGame {
    constructor() {
        this.renderer = null;
        this.character = null;
        this.inventory = [];
        this.skills = [];
        this.currentMap = MAPS_DATA.city_tan_hai;
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.monsters = [];
        this.battle = null;
        this.meditateReadyAt = 0;
        this._regenAcc = 0;
        this._hudAcc = 0;

        this.initDOM();
        this.loadProgress();
        this.initWorldMobs();
    }

    initDOM() {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new GameRenderer(canvas);
        this.renderer.onSheetsLoaded = () => { this.updateHUD(); if (this.battle) this.renderBattle(); };

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        canvas.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX + this.renderer.camera.x;
            this.mousePos.y = e.clientY + this.renderer.camera.y;
        });
        canvas.addEventListener('mousedown', (e) => this.handleCanvasClick(e));

        // Nút thoát về sảnh Hon Xom Lang
        const exitBtn = document.getElementById('btn-exit-honxomlang');
        if (exitBtn) {
            exitBtn.onclick = () => this.exitToHonXomLang();
        }

        // Loop 60FPS
        let lastTime = Date.now();
        const loop = (now) => {
            const dt = Math.min(0.1, (Date.now() - lastTime) / 1000);
            lastTime = Date.now();

            this.update(dt);
            if (this.character) {
                this.renderer.updateCamera(this.character.pos_x, this.character.pos_y);
                const snapshot = {
                    players: [this.character],
                    monsters: this.monsters.filter(m => !m.isDead && m.mapId === this.currentMap.id)
                };
                this.renderer.render(snapshot, this.character.id, this.currentMap, now);
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    exitToHonXomLang() {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'CLOSE_TUTIEN' }, '*');
        } else {
            window.location.href = 'index.html';
        }
    }

    initWorldMobs() {
        this.monsters = mobTemplates();
    }

    // Bản lưu cũ thiếu trường mới / kỹ năng cũ: bù mặc định, giữ nguyên tiến trình.
    migrateCharacter() {
        const c = this.character;
        if (!c) return;
        if (c.max_mp === undefined) c.max_mp = 120;
        if (c.hp === undefined || c.hp > c.max_hp) c.hp = c.max_hp;
        if (c.mp === undefined || c.mp > c.max_mp) c.mp = c.max_mp;
        if (c.school === undefined) c.school = 'sword';
        this.skills = SKILLS_DATA.map(s => ({ ...s }));
        for (const it of this.inventory) {
            if (it.name === PILL_BREAK) it.type = 'pill_break';
        }
    }

    loadProgress() {
        const saved = localStorage.getItem('tutien_character_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.character = data.character;
                this.inventory = data.inventory || [];
                this.migrateCharacter();
                document.getElementById('auth-screen').classList.remove('active');
                document.getElementById('game-screen').classList.add('active');
                this.updateHUD();
                this.showToast(`Chào mừng đạo hữu [${this.character.name}] trở lại!`, 'gold');
                return;
            } catch (e) {}
        }
        // Chưa có dữ liệu -> Mở màn hình đăng ký/tạo nhân vật
        document.getElementById('auth-screen').classList.add('active');
    }

    saveProgress() {
        if (!this.character) return;
        localStorage.setItem('tutien_character_data', JSON.stringify({
            character: this.character,
            inventory: this.inventory,
            skills: this.skills
        }));
    }

    createNewCharacter(name, school = 'sword') {
        const trimmed = (name || '').trim();
        if (!trimmed) {
            this.showToast('Vui lòng nhập tên đạo hiệu!', 'danger');
            return;
        }

        const elements = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ', 'Lôi', 'Phong'];
        const randomEl = pick(elements);

        this.character = {
            id: 'char_' + Date.now(),
            name: trimmed,
            school,
            realm: 1,
            realm_stage: 1,
            hp: 250,
            max_hp: 250,
            mp: 120,
            max_mp: 120,
            qi: 50,
            max_qi: 100,
            exp: 0,
            max_exp: 120,
            atk: 35,
            def: 20,
            crit_rate: 0.08,
            linh_can: randomEl,
            linh_can_purity: 85,
            tam_canh: 75,
            pos_x: 450,
            pos_y: 500,
            map_id: 'city_tan_hai',
            gold: 5000,
            spirit_stones: 50,
            pvp_elo: 1000,
            pvp_wins: 0,
            pvp_losses: 0,
            title: 'Luyện Khí Tu Sĩ'
        };
        // Thiên phú theo trường phái
        const c = this.character;
        if (school === 'sword') { c.atk += 5; c.crit_rate = 0.14; }
        else if (school === 'body') { c.max_hp += 90; c.hp = c.max_hp; c.def += 8; }
        else if (school === 'spell') { c.max_mp += 70; c.mp = c.max_mp; c.atk += 3; }
        else if (school === 'array') { c.def += 4; }
        else if (school === 'demonic') { c.atk += 4; }
        else if (school === 'medicine') { c.max_hp += 40; c.hp = c.max_hp; }

        this.inventory = [
            { id: 'inv_1', name: 'Mộc Kiếm Khởi Đầu', type: 'weapon', rarity: 'common', quantity: 1 },
            { id: 'inv_2', name: PILL_HEAL, type: 'pill', rarity: 'spiritual', quantity: 5 }
        ];
        this.skills = SKILLS_DATA.map(s => ({ ...s }));

        this.saveProgress();
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        this.updateHUD();
        this.showToast(`Thức tỉnh Linh Căn [${randomEl}]! Bước vào Tiên Đạo!`, 'gold');
        audio.playMeditationQi();
    }

    // ===== THẾ GIỚI =====
    update(dt) {
        if (!this.character) return;
        const now = Date.now();
        const inBattle = !!this.battle;

        // Hồi sinh quái theo mốc thời gian (không dùng setTimeout)
        for (const mob of this.monsters) {
            if (mob.isDead && now >= mob.respawnAt) {
                mob.isDead = false;
                mob.hp = mob.maxHp;
                mob.isEnraged = false;
                mob.x = mob.homeX;
                mob.y = mob.homeY;
                mob.atk = mob.baseAtk || mob.atk;
            }
        }

        if (inBattle) return;

        // Di chuyển nhân vật
        let vx = 0;
        let vy = 0;
        const spd = 4;
        if (this.keys['w'] || this.keys['arrowup']) vy -= spd;
        if (this.keys['s'] || this.keys['arrowdown']) vy += spd;
        if (this.keys['a'] || this.keys['arrowleft']) vx -= spd;
        if (this.keys['d'] || this.keys['arrowright']) vx += spd;

        if (vx !== 0 || vy !== 0) {
            this.character.pos_x = Math.max(30, Math.min(this.currentMap.width - 30, this.character.pos_x + vx));
            this.character.pos_y = Math.max(30, Math.min(this.currentMap.height - 30, this.character.pos_y + vy));

            // Kiểm tra cổng dịch chuyển
            if (this.currentMap.portals) {
                for (const portal of this.currentMap.portals) {
                    if (Math.hypot(this.character.pos_x - portal.x, this.character.pos_y - portal.y) < 50) {
                        const nextMap = MAPS_DATA[portal.targetMap];
                        if (nextMap) {
                            this.travelTo(nextMap);
                            break;
                        }
                    }
                }
            }
        }

        // Hồi phục chậm ngoài chiến đấu (nhanh hơn ở khu an toàn)
        this._regenAcc += dt;
        if (this._regenAcc >= 1) {
            const k = this.currentMap.safe ? 0.03 : 0.005;
            const c = this.character;
            const hp0 = c.hp, mp0 = c.mp;
            c.hp = Math.min(c.max_hp, c.hp + Math.ceil(c.max_hp * k));
            c.mp = Math.min(c.max_mp, c.mp + Math.ceil(c.max_mp * k));
            this._regenAcc = 0;
            if (c.hp !== hp0 || c.mp !== mp0) this.updateHUD();
        }

        // Quái vật AI: đuổi theo khi gần; chạm vào là khai chiến
        for (const mob of this.monsters) {
            if (mob.isDead || mob.mapId !== this.currentMap.id) continue;
            const dist = Math.hypot(this.character.pos_x - mob.x, this.character.pos_y - mob.y);
            const reach = mob.isBoss ? 56 : 42;
            if (dist <= reach && now >= mob.nextEngage) {
                this.startBattle(mob);
                return;
            }
            if (dist < 200 && dist > reach - 6) {
                const angle = Math.atan2(this.character.pos_y - mob.y, this.character.pos_x - mob.x);
                mob.x += Math.cos(angle) * (mob.speed * dt);
                mob.y += Math.sin(angle) * (mob.speed * dt);
            }
        }
    }

    travelTo(nextMap) {
        this.currentMap = nextMap;
        this.character.map_id = nextMap.id;
        this.character.pos_x = nextMap.spawns.x;
        this.character.pos_y = nextMap.spawns.y;
        const t = Date.now() + 1500; // thời gian ân hạn, quái không vồ ngay lúc vừa tới
        for (const m of this.monsters) m.nextEngage = Math.max(m.nextEngage, t);
        this.showToast(`Dịch chuyển đến [${nextMap.name}]!`, 'gold');
    }

    // ===== KHO ĐỒ =====
    countItem(name) {
        const it = this.inventory.find(i => i.name === name);
        return it ? it.quantity : 0;
    }
    addItem(spec, qty = 1) {
        const it = this.inventory.find(i => i.name === spec.name);
        if (it) it.quantity += qty;
        else this.inventory.push({ id: 'inv_' + Date.now() + Math.floor(Math.random() * 999), name: spec.name, type: spec.type, rarity: spec.rarity, quantity: qty });
    }
    consumeItem(name) {
        const it = this.inventory.find(i => i.name === name);
        if (!it || it.quantity <= 0) return false;
        it.quantity--;
        if (it.quantity <= 0) this.inventory = this.inventory.filter(i => i !== it);
        return true;
    }
    buyItem(kind) {
        const spec = SHOP[kind];
        if (!spec || !this.character) return;
        if (this.character[spec.currency] < spec.price) {
            this.showToast(`Không đủ ${spec.currency === 'gold' ? 'Linh Tệ' : 'Linh Thạch'} (${spec.price})!`, 'danger');
            return;
        }
        this.character[spec.currency] -= spec.price;
        this.addItem(spec, 1);
        audio.playCoin();
        this.showToast(`Mua [${spec.name}] x1`, 'success');
        this.updateHUD();
        this.saveProgress();
    }
    healPillAmount() {
        const bonus = this.character.school === 'medicine' ? 1.5 : 1;
        return Math.round(this.character.max_hp * 0.35 * bonus);
    }

    // ===== CHIẾN ĐẤU THEO LƯỢT =====
    // Quái thế giới (PvE)
    startBattle(mob) {
        if (this.battle || !this.character) return;
        if (!mob.baseAtk) mob.baseAtk = mob.atk;
        if (this.character.hp <= 0) this.character.hp = 1;
        const warn = this.character.realm < mob.realm;
        this.beginBattle({
            mode: 'pve', mob,
            enemy: { name: mob.name, element: mob.element, hp: mob.hp, maxHp: mob.maxHp, atk: mob.atk, def: mob.def, moves: mob.moves, isBoss: mob.isBoss, sprite: mob.sprite }
        });
        this.logBattle(`⚔️ [${mob.name}] xuất hiện!` + (warn ? ' ⚠ Cảnh giới của ngươi thấp hơn nó rất nhiều.' : ''), 'warn');
    }

    // Đấu trường: đối thủ "ảnh tu sĩ" cân bằng theo chỉ số của người chơi
    startPvpQueue() {
        if (this.battle || !this.character) return;
        const c = this.character;
        const names = ['Tiêu Viêm', 'Hàn Lập', 'Bạch Tiểu Thuần', 'Lý Trường Thọ', 'Diệp Phàm', 'Cố Trường Ca'];
        const els = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ', 'Lôi', 'Phong'];
        const f = rand(0.9, 1.1);
        const hp = Math.round(c.max_hp * 1.0 * f);
        this.closeModal('modal-pvp');
        this.beginBattle({
            mode: 'pvp',
            enemy: {
                name: pick(names), element: pick(els), hp, maxHp: hp,
                atk: Math.round(c.atk * 0.95 * f), def: Math.round(c.def * f), isBoss: false, sprite: pick(PVP_SPRITES),
                moves: [{ name: 'Kiếm Quyết', mult: 1, w: 3 }, { name: 'Pháp Thuật', mult: 1.3, w: 2 }, { name: 'Tuyệt Kỹ', mult: 2.0, w: 1, heavy: true }]
            }
        });
        this.logBattle(`🏟️ Đối thủ [${this.battle.enemy.name}] hệ ${this.battle.enemy.element} bước lên lôi đài!`, 'warn');
    }

    startTribulation(onSuccess) {
        const realm = REALMS_DATA.find(r => r.id === this.character.realm) || REALMS_DATA[0];
        const bolts = realm.bolts || 3;
        this.beginBattle({
            mode: 'tribulation', onSuccess, boltsLeft: bolts,
            enemy: { name: 'Cửu Thiên Lôi Kiếp', element: 'Lôi', hp: bolts, maxHp: bolts, atk: 0, def: 0, isBoss: true, moves: [] }
        });
        audio.playThunder();
        this.logBattle(`⚡ ${bolts} đạo Thiên Lôi sắp giáng xuống! Phòng thủ và giữ vững sinh lực!`, 'warn');
    }

    beginBattle(b) {
        this.battle = {
            turn: 1, over: false, cds: {},
            player: { guard: 0, burn: 0, stun: 0 },
            foe: { burn: 0, stun: 0 },
            log: [],
            ...b
        };
        this.battle.intent = this.pickIntent();
        for (const k of Object.keys(this.keys)) this.keys[k] = false;
        ['modal-cultivation', 'modal-inventory', 'modal-pvp', 'modal-leaderboard', 'modal-housing'].forEach(id => this.closeModal(id));
        this.openModal('modal-battle');
        audio.playThunder();
        this.renderBattle();
    }

    pickIntent() {
        const b = this.battle;
        if (!b || b.mode === 'tribulation') return null;
        const moves = b.enemy.moves;
        const total = moves.reduce((s, m) => s + m.w, 0);
        let r = Math.random() * total;
        for (const m of moves) { r -= m.w; if (r <= 0) return m; }
        return moves[0];
    }

    logBattle(msg, cls = '') {
        if (!this.battle) return;
        this.battle.log.push({ msg, cls });
        if (this.battle.log.length > 40) this.battle.log.shift();
    }

    // Hành động của người chơi. type: attack | skill | guard | pill | flee | ward
    battleAction(type, skillId) {
        const b = this.battle;
        if (!b || b.over) return;
        const c = this.character;
        const e = b.enemy;
        const trib = b.mode === 'tribulation';
        b.player.guard = 0;

        if (b.player.stun > 0) {
            b.player.stun--;
            this.logBattle('💫 Ngươi bị choáng, mất lượt!', 'bad');
        } else if (type === 'attack' && !trib) {
            this.playerHit({ name: 'Đánh Thường', el: c.linh_can, dmgMult: 1.0 }, true);
            c.mp = Math.min(c.max_mp, c.mp + Math.max(4, Math.round(c.max_mp * 0.05)));
        } else if (type === 'skill' && !trib) {
            const s = this.skills.find(x => x.id === skillId);
            if (!s) return;
            if ((b.cds[s.id] || 0) > 0) { this.showToast(`${s.name} còn hồi chiêu ${b.cds[s.id]} lượt!`, 'danger'); return; }
            if (c.mp < s.mpCost) { this.showToast('Linh lực không đủ!', 'danger'); return; }
            c.mp -= s.mpCost;
            b.cds[s.id] = s.cd;
            this.playerHit(s, false);
        } else if (type === 'guard') {
            b.player.guard = c.school === 'array' ? 0.75 : 0.6;
            this.battleFx('player', 'guard');
            c.mp = Math.min(c.max_mp, c.mp + Math.max(6, Math.round(c.max_mp * 0.08)));
            this.logBattle('🛡️ Ngươi vận công phòng thủ, hồi chút linh lực.', 'good');
        } else if (type === 'ward' && trib) {
            const cost = Math.round(c.max_mp * 0.4);
            if (c.mp < cost) { this.showToast(`Cần ${cost} linh lực để Hộ Thể Linh Quang!`, 'danger'); return; }
            c.mp -= cost;
            b.player.guard = 0.85;
            this.battleFx('player', 'guard');
            this.logBattle('✨ Hộ Thể Linh Quang bừng sáng!', 'good');
        } else if (type === 'pill') {
            if (!this.consumeItem(PILL_HEAL)) { this.showToast(`Hết ${PILL_HEAL}! Mua ở tab Tu Luyện.`, 'danger'); return; }
            const amt = this.healPillAmount();
            c.hp = Math.min(c.max_hp, c.hp + amt);
            c.qi = Math.min(c.max_qi, c.qi + 30);
            audio.playMeditationQi();
            this.renderer.addFloatingText('+' + amt, c.pos_x, c.pos_y - 30, 'heal');
            this.battleFx('player', 'heal');
            this.logBattle(`💊 Uống ${PILL_HEAL}, hồi ${amt} sinh lực.`, 'good');
        } else if (type === 'flee') {
            if (b.mode !== 'pve' || e.isBoss) { this.showToast('Không thể bỏ chạy trận này!', 'danger'); return; }
            if (Math.random() < 0.55) { this.endBattle('flee'); return; }
            this.logBattle('🏃 Bỏ chạy thất bại!', 'bad');
        } else {
            return;
        }

        if (this.checkEnemyDead()) return;
        this.finishTurn();
    }

    playerHit(skill, isBasic) {
        const b = this.battle;
        const c = this.character;
        const e = b.enemy;
        const em = elementMult(skill.el, e.element);
        const affinity = skill.el === c.linh_can ? 1.2 : 1;
        let dmg = c.atk * skill.dmgMult * rand(0.9, 1.1) * em * affinity;
        const crit = Math.random() < c.crit_rate;
        if (crit) dmg *= 1.75;
        dmg = Math.max(1, Math.round(dmg - e.def * 0.5));
        e.hp = Math.max(0, e.hp - dmg);
        audio.playSlash();
        this.battleFx('enemy', isBasic ? 'attack' : skill.id);
        let note = em > 1 ? ' (khắc chế!)' : em < 1 ? ' (bị kháng)' : '';
        this.logBattle(`${isBasic ? '🗡️' : '✨'} ${skill.name}: gây ${dmg} sát thương${crit ? ' BẠO KÍCH' : ''}${note}`, em > 1 || crit ? 'good' : '');
        this.hitFx('enemy', dmg, crit);
        if (c.school === 'demonic') {
            const heal = Math.max(1, Math.round(dmg * 0.1));
            c.hp = Math.min(c.max_hp, c.hp + heal);
        }
        if (skill.burn) { b.foe.burn = skill.burn; this.logBattle('🔥 Địch bốc cháy!', 'good'); }
        if (skill.stunChance && Math.random() < skill.stunChance && !e.isBoss) {
            b.foe.stun = 1;
            this.logBattle('⚡ Địch bị sét đánh choáng!', 'good');
        }
    }

    checkEnemyDead() {
        const b = this.battle;
        if (b.mode === 'tribulation') return false;
        if (b.enemy.hp > 0) return false;
        this.endBattle('win');
        return true;
    }

    finishTurn() {
        const b = this.battle;
        const c = this.character;
        const e = b.enemy;

        // Sát thương theo thời gian lên địch
        if (b.foe.burn > 0 && b.mode !== 'tribulation') {
            const d = Math.max(1, Math.round(c.atk * 0.3));
            e.hp = Math.max(0, e.hp - d);
            b.foe.burn--;
            this.logBattle(`🔥 Địch chịu ${d} sát thương thiêu đốt.`, 'good');
            this.hitFx('enemy', d, false);
            if (this.checkEnemyDead()) return;
        }

        // Lượt địch
        if (b.mode === 'tribulation') {
            this.boltStrike();
        } else if (b.foe.stun > 0) {
            b.foe.stun--;
            this.logBattle(`💫 [${e.name}] bị choáng, mất lượt!`, 'good');
        } else {
            this.enemyAct();
        }
        if (b.over) return;

        // Thiêu đốt lên người chơi
        if (b.player.burn > 0) {
            const d = Math.max(1, Math.round(e.atk * 0.2));
            c.hp = Math.max(0, c.hp - d);
            b.player.burn--;
            this.logBattle(`🔥 Ngươi chịu ${d} sát thương thiêu đốt.`, 'bad');
            this.hitFx('player', d, false);
        }
        if (c.hp <= 0) { this.endBattle('lose'); return; }

        // Hồi chiêu
        for (const k of Object.keys(b.cds)) if (b.cds[k] > 0) b.cds[k]--;
        b.turn++;
        b.intent = this.pickIntent();
        // Boss cuồng nộ ở 50% máu
        if (b.mode === 'pve' && e.isBoss && !b.mob.isEnraged && e.hp <= e.maxHp * 0.5) {
            b.mob.isEnraged = true;
            e.atk = Math.round(e.atk * 1.3);
            this.logBattle('😡 Thủ Lĩnh Cuồng Nộ! Sát thương tăng vọt!', 'warn');
        }
        this.updateHUD();
        this.renderBattle();
    }

    enemyAct() {
        const b = this.battle;
        const c = this.character;
        const e = b.enemy;
        const mv = b.intent || e.moves[0];
        let dmg = e.atk * mv.mult * rand(0.9, 1.1) * elementMult(e.element, c.linh_can);
        dmg = Math.max(1, Math.round(dmg - c.def * 0.5));
        let guardNote = '';
        if (b.player.guard) {
            // Đòn nặng bị phòng thủ giảm sâu hơn
            const g = mv.heavy ? Math.min(0.9, b.player.guard + 0.15) : b.player.guard;
            dmg = Math.max(1, Math.round(dmg * (1 - g)));
            guardNote = ' (đã chặn)';
        }
        c.hp = Math.max(0, c.hp - dmg);
        audio.playThunder();
        this.logBattle(`${mv.heavy ? '💥' : '🩸'} [${e.name}] dùng ${mv.name}: ngươi mất ${dmg} sinh lực${guardNote}`, 'bad');
        this.hitFx('player', dmg, !!mv.heavy);
        this.battleFx('player', mv.heavy ? 'enemy_heavy' : 'enemy_hit');
        if (mv.burn && !b.player.guard) { b.player.burn = mv.burn; this.logBattle('🔥 Ngươi bốc cháy!', 'bad'); }
    }

    boltStrike() {
        const b = this.battle;
        const c = this.character;
        let dmg = c.max_hp * (0.2 + 0.02 * c.realm) * rand(0.9, 1.1);
        if (b.player.guard) dmg *= (1 - b.player.guard);
        dmg = Math.max(1, Math.round(dmg));
        c.hp = Math.max(0, c.hp - dmg);
        b.boltsLeft--;
        b.enemy.hp = b.boltsLeft;
        audio.playThunder();
        this.renderer.addSkillVisual('thunder_wrath', c.pos_x, c.pos_y);
        this.logBattle(`⚡ Thiên Lôi giáng xuống: mất ${dmg} sinh lực! (còn ${b.boltsLeft} đạo)`, 'bad');
        this.hitFx('player', dmg, true);
        this.battleFx('player', 'bolt');
        if (c.hp <= 0) { this.endBattle('lose'); return; }
        if (b.boltsLeft <= 0) this.endBattle('win');
    }

    endBattle(result) {
        const b = this.battle;
        if (!b || b.over) return;
        b.over = true;
        const c = this.character;
        const e = b.enemy;
        let closeDelay = 900;

        if (b.mode === 'pve') {
            const mob = b.mob;
            if (result === 'win') {
                mob.isDead = true;
                mob.hp = 0;
                mob.respawnAt = Date.now() + (mob.isBoss ? 45000 : 15000);
                const expGain = Math.round(mob.maxHp * 0.25 + mob.realm * 20);
                const goldGain = Math.round(mob.maxHp * 0.25);
                const stoneGain = mob.isBoss ? 15 : 1;
                c.exp += expGain;
                c.gold += goldGain;
                c.spirit_stones += stoneGain;
                let drop = '';
                if (Math.random() < (mob.isBoss ? 0.8 : 0.25)) {
                    const spec = Math.random() < (mob.isBoss ? 0.6 : 0.12) ? SHOP.break : SHOP.heal;
                    this.addItem(spec, 1);
                    drop = `, rơi [${spec.name}]`;
                }
                audio.playCoin();
                this.logBattle(`🏆 Hạ gục [${mob.name}]! +${expGain} Tu Vi, +${goldGain} Linh Tệ, +${stoneGain} Linh Thạch${drop}`, 'good');
                this.showToast(`Hạ gục [${mob.name}]! +${expGain} Tu Vi`, 'gold');
            } else if (result === 'flee') {
                mob.hp = e.hp;
                mob.nextEngage = Date.now() + 3500;
                this.showToast('Ngươi chạy thoát!', 'info');
                closeDelay = 0;
            } else {
                mob.hp = mob.maxHp;
                mob.nextEngage = Date.now() + 5000;
                this.defeatPenalty();
            }
        } else if (b.mode === 'pvp') {
            const win = result === 'win';
            const delta = win ? 24 : -16;
            c.pvp_elo = Math.max(0, c.pvp_elo + delta);
            if (win) { c.pvp_wins++; c.gold += 300; audio.playHeavenlyChime(); }
            else { c.pvp_losses++; c.hp = Math.max(1, Math.round(c.max_hp * 0.5)); }
            this.logBattle(win ? `🏆 Thắng! +${delta} ELO, +300 Linh Tệ (ELO ${c.pvp_elo})` : `💀 Thua! ${delta} ELO (ELO ${c.pvp_elo})`, win ? 'good' : 'bad');
        } else if (b.mode === 'tribulation') {
            if (result === 'win') {
                this.logBattle('🌈 Vượt qua Lôi Kiếp! Thiên địa dị tượng!', 'good');
                const cb = b.onSuccess;
                setTimeout(() => cb && cb(), 1000);
            } else {
                const lost = Math.round(c.exp * 0.4);
                c.exp = Math.max(0, c.exp - lost);
                c.tam_canh = Math.max(0, c.tam_canh - 15);
                c.hp = Math.max(1, Math.round(c.max_hp * 0.2));
                this.logBattle(`💀 Độ kiếp thất bại! Mất ${lost} tu vi, tâm cảnh tổn thương.`, 'bad');
            }
        }

        this.renderBattle();
        this.updateHUD();
        this.saveProgress();
        if (closeDelay) setTimeout(() => this.closeBattle(), closeDelay + 1200);
        else this.closeBattle();
    }

    defeatPenalty() {
        const c = this.character;
        const lostGold = Math.round(c.gold * 0.1);
        const lostExp = Math.round(c.exp * 0.2);
        c.gold -= lostGold;
        c.exp -= lostExp;
        c.tam_canh = Math.max(0, c.tam_canh - 5);
        c.hp = Math.max(1, Math.round(c.max_hp * 0.5));
        c.mp = Math.round(c.max_mp * 0.5);
        this.logBattle(`💀 Trọng thương! Mất ${lostGold} Linh Tệ, ${lostExp} Tu Vi. Được đưa về Đô Thị.`, 'bad');
        this._respawnCity = true;
    }

    closeBattle() {
        if (!this.battle) return;
        this.battle = null;
        this.closeModal('modal-battle');
        if (this._respawnCity) {
            this._respawnCity = false;
            this.travelTo(MAPS_DATA.city_tan_hai);
        }
        this.updateHUD();
    }

    battleFx(side, kind) {
        const box = document.getElementById(side === 'enemy' ? 'battle-enemy-fx' : 'battle-player-fx');
        if (!box) return;
        (FX[kind] || []).forEach(([name, color, size], i) => {
            const d = document.createElement('div');
            d.className = 'fx-sprite';
            d.style.setProperty('--c', color);
            d.style.setProperty('--img', `url(assets/tutien/img/fx/${name}.png)`);
            d.style.setProperty('--sz', Math.round(110 * size) + 'px');
            d.style.animationDelay = (i * 90) + 'ms';
            box.appendChild(d);
            setTimeout(() => d.remove(), 900 + i * 90);
        });
    }

    hitFx(side, dmg, strong) {
        const el = document.getElementById(side === 'enemy' ? 'battle-enemy-card' : 'battle-player-card');
        if (el) {
            el.classList.remove('hit');
            void el.offsetWidth;
            el.classList.add('hit');
        }
        const fx = document.getElementById(side === 'enemy' ? 'battle-enemy-fx' : 'battle-player-fx');
        if (fx) {
            const n = document.createElement('div');
            n.className = 'battle-dmg' + (strong ? ' strong' : '');
            n.textContent = '-' + dmg;
            fx.appendChild(n);
            setTimeout(() => n.remove(), 900);
        }
    }

    renderBattle() {
        const b = this.battle;
        if (!b) return;
        const c = this.character;
        const e = b.enemy;
        const $ = (id) => document.getElementById(id);
        const trib = b.mode === 'tribulation';
        const pct = (v, m) => Math.max(0, Math.min(100, (v / m) * 100));

        $('battle-title').textContent = trib ? '⚡ Độ Lôi Kiếp' : b.mode === 'pvp' ? '🏟️ Lôi Đài Thiên Môn' : '⚔️ Chiến Đấu';
        $('battle-enemy-name').textContent = e.name;
        const es = $('battle-enemy-sprite');
        es.style.display = e.sprite !== undefined ? '' : 'none';
        if (e.sprite !== undefined) this.renderer.drawSpriteTo(es, 'dungeon', e.sprite);
        this.renderer.drawSpriteTo($('battle-player-sprite'), 'urban', this.renderer.charIndex(c.school, 1, 1));
        const rel = elementMult(c.linh_can, e.element);
        $('battle-enemy-el').textContent = `${ELEMENT_ICON[e.element] || ''} ${e.element}` + (trib ? '' : rel > 1 ? ' · ta khắc' : rel < 1 ? ' · ta bị khắc' : '');
        $('battle-enemy-hp').style.width = pct(e.hp, e.maxHp) + '%';
        $('battle-enemy-hp-text').textContent = trib ? `Còn ${b.boltsLeft} đạo lôi` : `${Math.round(e.hp)}/${e.maxHp}`;
        $('battle-player-name').textContent = c.name;
        $('battle-player-el').textContent = `${ELEMENT_ICON[c.linh_can] || ''} ${c.linh_can}`;
        $('battle-player-hp').style.width = pct(c.hp, c.max_hp) + '%';
        $('battle-player-hp-text').textContent = `${Math.round(c.hp)}/${c.max_hp}`;
        $('battle-player-mp').style.width = pct(c.mp, c.max_mp) + '%';
        $('battle-player-mp-text').textContent = `${Math.round(c.mp)}/${c.max_mp}`;

        let intent = '';
        if (trib) intent = '⚡ Thiên Lôi sẽ giáng mỗi lượt — hãy phòng thủ!';
        else if (b.foe.stun > 0) intent = '💫 Địch đang choáng';
        else if (b.intent) intent = (b.intent.heavy ? '⚠️ ' : '👁 ') + `Địch chuẩn bị: ${b.intent.name}${b.intent.heavy ? ' (đòn nặng — nên phòng thủ!)' : ''}`;
        $('battle-intent').textContent = intent;
        const st = [];
        if (b.foe.burn > 0) st.push(`🔥 Cháy ${b.foe.burn}`);
        if (b.foe.stun > 0) st.push('💫 Choáng');
        $('battle-enemy-status').textContent = st.join('  ');
        const pst = [];
        if (b.player.burn > 0) pst.push(`🔥 Cháy ${b.player.burn}`);
        if (b.player.stun > 0) pst.push('💫 Choáng');
        $('battle-player-status').textContent = pst.join('  ');

        // Nút hành động
        const box = $('battle-actions');
        const disabled = b.over;
        const btn = (label, sub, on, off = false, cls = '') =>
            `<button class="battle-btn ${cls}" ${disabled || off ? 'disabled' : ''} onclick="${on}"><span>${label}</span><small>${sub}</small></button>`;
        let html = '';
        if (trib) {
            html += btn('🛡️ Phòng Thủ', 'Giảm 60% sát thương', "window.gameApp.battleAction('guard')");
            html += btn('✨ Hộ Thể Linh Quang', `Giảm 85% · ${Math.round(c.max_mp * 0.4)} MP`, "window.gameApp.battleAction('ward')", c.mp < c.max_mp * 0.4);
            html += btn(`💊 ${PILL_HEAL}`, `Hồi ${this.healPillAmount()} · còn ${this.countItem(PILL_HEAL)}`, "window.gameApp.battleAction('pill')", this.countItem(PILL_HEAL) <= 0);
        } else {
            html += btn('🗡️ Đánh Thường', `Hệ ${c.linh_can} · +MP`, "window.gameApp.battleAction('attack')");
            this.skills.forEach((s, i) => {
                const cd = b.cds[s.id] || 0;
                const rel2 = elementMult(s.el, e.element);
                const tag = rel2 > 1 ? ' ▲' : rel2 < 1 ? ' ▼' : '';
                html += btn(`${s.icon} ${s.name}${tag}`, cd > 0 ? `Hồi chiêu ${cd}` : `[${i + 1}] ${ELEMENT_ICON[s.el]}${s.el} · ${s.mpCost} MP`, `window.gameApp.battleAction('skill','${s.id}')`, cd > 0 || c.mp < s.mpCost);
            });
            html += btn('🛡️ Phòng Thủ', 'Giảm 60% · +MP', "window.gameApp.battleAction('guard')");
            html += btn(`💊 ${PILL_HEAL}`, `Hồi ${this.healPillAmount()} · còn ${this.countItem(PILL_HEAL)}`, "window.gameApp.battleAction('pill')", this.countItem(PILL_HEAL) <= 0);
            html += btn('🏃 Bỏ Chạy', b.mode === 'pve' && !e.isBoss ? '55% thành công' : 'Không thể', "window.gameApp.battleAction('flee')", b.mode !== 'pve' || e.isBoss);
        }
        box.innerHTML = html;

        const log = $('battle-log');
        log.innerHTML = b.log.map(l => `<div class="bl ${l.cls}">${l.msg}</div>`).join('');
        log.scrollTop = log.scrollHeight;
    }

    // ===== ĐẢ TỌA & ĐỘT PHÁ =====
    meditate() {
        if (!this.character || this.battle) return;
        const now = Date.now();
        if (now < this.meditateReadyAt) {
            this.showToast(`Tâm chưa tĩnh, đợi ${Math.ceil((this.meditateReadyAt - now) / 1000)}s nữa.`, 'danger');
            return;
        }
        this.meditateReadyAt = now + 6000;
        const c = this.character;
        const q = this.currentMap.ambientQi || 1.0;
        const purity = (c.linh_can_purity || 80) / 100;
        const qiGain = Math.round(20 * q);
        const expGain = Math.round((20 + c.realm * 15) * q * purity);

        c.qi = Math.min(c.max_qi, c.qi + qiGain);
        c.exp += expGain;
        c.hp = Math.min(c.max_hp, c.hp + Math.round(c.max_hp * 0.1));
        c.mp = Math.min(c.max_mp, c.mp + Math.round(c.max_mp * 0.2));
        c.tam_canh = Math.min(100, c.tam_canh + 1);

        let extra = '';
        if (Math.random() < 0.1) {
            c.tam_canh = Math.max(0, c.tam_canh - 6);
            extra = ' Tâm ma quấy nhiễu, tâm cảnh -6!';
        }
        audio.playMeditationQi();
        this.renderer.addQiParticles(c.pos_x, c.pos_y, 16, '#10b981');
        this.showToast(`Đả tọa: +${qiGain} Linh Khí, +${expGain} Tu Vi, hồi phục sinh lực.${extra}`, extra ? 'danger' : 'success');
        this.updateHUD();
        this.saveProgress();
    }

    breakthroughInfo() {
        const c = this.character;
        const realm = REALMS_DATA.find(r => r.id === c.realm) || REALMS_DATA[0];
        const major = c.realm_stage >= realm.maxStages;
        const peak = major && c.realm >= REALMS_DATA.length;
        const hasPill = this.countItem(PILL_BREAK) > 0;
        let p = major ? 0.65 - 0.07 * (c.realm - 1) : 0.9;
        p += (c.tam_canh - 50) * 0.004;
        p += ((c.linh_can_purity || 80) - 80) * 0.002;
        if (hasPill) p += 0.2;
        p = Math.max(0.1, Math.min(0.97, p));
        return { realm, major, peak, hasPill, chance: p, tribulation: major && realm.tribulation };
    }

    breakthrough() {
        if (!this.character || this.battle) return;
        const c = this.character;
        if (c.exp < c.max_exp) {
            this.showToast(`Tu vi chưa viên mãn (${c.exp}/${c.max_exp}). Chưa thể đột phá!`, 'danger');
            return;
        }
        const info = this.breakthroughInfo();
        if (info.peak) {
            this.showToast('Đã đạt đỉnh phong Hóa Thần, chờ phiên bản sau để phi thăng!', 'gold');
            return;
        }
        const usedPill = info.hasPill && this.consumeItem(PILL_BREAK);
        const ok = Math.random() < info.chance;

        if (!ok) {
            audio.playThunder();
            const lost = Math.round(c.exp * 0.2);
            c.exp = Math.max(0, c.exp - lost);
            c.tam_canh = Math.max(0, c.tam_canh - 8);
            c.hp = Math.max(1, Math.round(c.hp * 0.6));
            this.showToast(`Tẩu Hỏa Nhập Ma! Đột phá thất bại (tỷ lệ ${Math.round(info.chance * 100)}%), mất ${lost} tu vi, tâm cảnh -8.${usedPill ? ' Phá Cảnh Đan đã tiêu hao.' : ''}`, 'danger');
            this.updateHUD();
            this.saveProgress();
            return;
        }
        if (info.tribulation) {
            this.closeModal('modal-cultivation');
            this.showToast('⚡ Cửu Thiên Lôi Kiếp giáng thế! Hãy phòng thủ cẩn thận!', 'gold');
            this.startTribulation(() => this.applyBreakthrough());
            return;
        }
        this.applyBreakthrough();
    }

    applyBreakthrough() {
        const c = this.character;
        const currentRealm = REALMS_DATA.find(r => r.id === c.realm) || REALMS_DATA[0];
        let newStage = c.realm_stage + 1;
        let newRealm = c.realm;
        if (newStage > currentRealm.maxStages) {
            newRealm = Math.min(REALMS_DATA.length, newRealm + 1);
            newStage = 1;
        }
        const nextInfo = REALMS_DATA.find(r => r.id === newRealm) || currentRealm;
        c.realm = newRealm;
        c.realm_stage = newStage;
        c.exp = 0;
        c.max_exp = Math.round(nextInfo.expReq * (1 + newStage * 0.3));
        c.max_hp += Math.round(nextInfo.baseHp * 0.3);
        c.max_mp += Math.round(nextInfo.baseMp * 0.3);
        c.hp = c.max_hp;
        c.mp = c.max_mp;
        c.atk += Math.round(nextInfo.baseAtk * 0.3);
        c.def += Math.round(nextInfo.baseDef * 0.3);
        c.title = `${nextInfo.name} Tầng ${newStage}`;

        audio.playHeavenlyChime();
        this.renderer.addQiParticles(c.pos_x, c.pos_y, 40, '#ffd700');
        this.showToast(`Thiên Địa Dị Tượng! Đột phá thành công [${c.title}]!`, 'gold');
        this.updateHUD();
        this.saveProgress();
    }

    // Tương thích HTML cũ
    castSkill(skillId) {
        if (this.battle) this.battleAction('skill', skillId);
        else this.showToast('Kỹ năng chỉ dùng được trong chiến đấu — chạm vào yêu thú để khai chiến!', 'info');
    }

    // BẢNG XẾP HẠNG
    renderLeaderboards(cat = 'cultivation') {
        const tbody = document.getElementById('leaderboard-tbody');
        tbody.innerHTML = '';

        const fakeTop = [
            { rank: 1, name: 'Hàn Lập', title: 'Hóa Thần Viên Mãn', score: '3,200 ELO' },
            { rank: 2, name: 'Bạch Tiểu Thuần', title: 'Nguyên Anh Hậu Kỳ', score: '2,950 ELO' },
            { rank: 3, name: 'Tiêu Viêm', title: 'Kim Đan Viên Mãn', score: '2,780 ELO' },
            { rank: 4, name: this.character.name, title: this.character.title, score: `${this.character.pvp_elo} ELO` }
        ];

        fakeTop.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="${r.rank === 1 ? 'rank-top1' : (r.rank === 2 ? 'rank-top2' : '')}">#${r.rank}</td>
                <td><strong>${r.name}</strong></td>
                <td>${r.title}</td>
                <td>${r.score}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // BẤT ĐỘNG SẢN & ĐÔ THỊ
    buyHousing(cost, name, qiBonus, income) {
        if (this.character.gold < cost) {
            this.showToast(`Không đủ Linh Tệ (${this.character.gold}/${cost})!`, 'danger');
            return;
        }
        this.character.gold -= cost;
        this.character.max_qi += qiBonus;
        audio.playCoin();
        this.showToast(`Sở hữu thành công [${name}]! Khí hải tăng +${qiBonus}!`, 'gold');
        this.updateHUD();
        this.saveProgress();
    }

    // UI CONTROLS
    handleKeyDown(e) {
        const k = e.key.toLowerCase();
        if (this.battle) {
            const idx = ['1', '2', '3', '4'].indexOf(e.key);
            if (idx >= 0 && this.skills[idx] && this.battle.mode !== 'tribulation') this.battleAction('skill', this.skills[idx].id);
            else if (k === 'g') this.battleAction('guard');
            else if (k === 'e') this.battleAction('pill');
            return;
        }
        this.keys[k] = true;
        if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
        if (k === 'c') { this.updateHUD(); this.toggleModal('modal-cultivation'); }
        if (k === 'b') { this.renderInventory(); this.toggleModal('modal-inventory'); }
        if (k === 'p') this.toggleModal('modal-pvp');
        if (k === 'l') { this.renderLeaderboards(); this.toggleModal('modal-leaderboard'); }
        if (k === 'm') this.toggleModal('modal-market');
        if (k === 'h') this.toggleModal('modal-housing');
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    // Bấm vào yêu thú ở gần để khai chiến
    handleCanvasClick(e) {
        if (this.battle || !this.character) return;
        const now = Date.now();
        for (const mob of this.monsters) {
            if (mob.isDead || mob.mapId !== this.currentMap.id) continue;
            if (Math.hypot(mob.x - this.mousePos.x, mob.y - this.mousePos.y) < (mob.isBoss ? 50 : 34)) {
                if (Math.hypot(mob.x - this.character.pos_x, mob.y - this.character.pos_y) < 160) {
                    mob.nextEngage = 0;
                    this.startBattle(mob);
                } else {
                    this.showToast('Lại gần hơn để khai chiến!', 'info');
                }
                return;
            }
        }
    }

    updateHUD() {
        if (!this.character) return;
        const c = this.character;
        document.getElementById('hud-char-name').textContent = c.name;
        document.getElementById('hud-char-title').textContent = c.title;
        document.getElementById('hud-char-realm').textContent = `Cảnh Giới ${c.realm}`;

        const hpPct = Math.max(0, (c.hp / c.max_hp) * 100);
        const mpPct = Math.max(0, (c.mp / c.max_mp) * 100);
        const qiPct = Math.max(0, (c.qi / c.max_qi) * 100);
        const expPct = Math.min(100, Math.max(0, (c.exp / c.max_exp) * 100));

        document.getElementById('hud-hp-bar').style.width = `${hpPct}%`;
        document.getElementById('hud-mp-bar').style.width = `${mpPct}%`;
        document.getElementById('hud-qi-bar').style.width = `${qiPct}%`;
        document.getElementById('hud-exp-bar').style.width = `${expPct}%`;

        document.getElementById('hud-hp-text').textContent = `${Math.round(c.hp)}/${c.max_hp}`;
        document.getElementById('hud-mp-text').textContent = `${Math.round(c.mp)}/${c.max_mp}`;
        document.getElementById('hud-qi-text').textContent = `${c.qi}/${c.max_qi}`;
        document.getElementById('hud-exp-text').textContent = `${c.exp}/${c.max_exp}`;

        document.getElementById('hud-gold').textContent = Number(c.gold).toLocaleString();
        document.getElementById('hud-stones').textContent = Number(c.spirit_stones).toLocaleString();

        const av = document.getElementById('hud-avatar');
        if (av) {
            if (!av._cv) {
                av.textContent = '';
                const cv = document.createElement('canvas');
                cv.width = cv.height = 48;
                cv.style.cssText = 'width:44px;height:44px;image-rendering:pixelated;';
                av.appendChild(cv);
                av._cv = cv;
            }
            this.renderer.drawSpriteTo(av._cv, 'urban', this.renderer.charIndex(c.school, 1, 1));
        }

        const bt = document.getElementById('bt-chance');
        if (bt) {
            const info = this.breakthroughInfo();
            bt.innerHTML = info.peak
                ? 'Đã đạt đỉnh phong.'
                : `Tỷ lệ đột phá: <b>${Math.round(info.chance * 100)}%</b>` +
                  (info.major ? ' (đại cảnh giới)' : ' (tiểu cảnh giới)') +
                  (info.tribulation ? ' · <b style="color:#a855f7">có Lôi Kiếp</b>' : '') +
                  (info.hasPill ? ' · <span style="color:#10b981">+20% Phá Cảnh Đan</span>' : '') +
                  `<br>Tâm cảnh: ${c.tam_canh}/100 · Phá Cảnh Đan: ${this.countItem(PILL_BREAK)} · ${PILL_HEAL}: ${this.countItem(PILL_HEAL)}`;
        }
    }

    renderInventory() {
        const grid = document.getElementById('inventory-grid-box');
        grid.innerHTML = '';
        this.inventory.forEach(item => {
            const slot = document.createElement('div');
            slot.className = `inv-slot rarity-${item.rarity}`;
            slot.innerHTML = `<span>${item.type === 'pill' || item.type === 'pill_break' ? '💊' : '🗡️'}</span><span class="inv-qty">x${item.quantity}</span>`;
            slot.title = item.type === 'pill' ? `${item.name}\nBấm để dùng.` : item.type === 'pill_break' ? `${item.name}\nTự dùng khi đột phá (+20%).` : item.name;
            slot.onclick = () => {
                if (item.type === 'pill') {
                    this.character.hp = Math.min(this.character.max_hp, this.character.hp + this.healPillAmount());
                    this.character.qi = Math.min(this.character.max_qi, this.character.qi + 30);
                    this.consumeItem(item.name);
                    audio.playMeditationQi();
                    this.showToast(`Sử dụng [${item.name}]: Hồi phục sinh lực & linh khí!`, 'success');
                    this.updateHUD();
                    this.renderInventory();
                    this.saveProgress();
                }
            };
            grid.appendChild(slot);
        });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast alert-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    openModal(id) {
        document.getElementById(id)?.classList.add('open');
    }
    closeModal(id) {
        document.getElementById(id)?.classList.remove('open');
    }
    toggleModal(id) {
        if (this.battle) return;
        const el = document.getElementById(id);
        if (el?.classList.contains('open')) el.classList.remove('open');
        else el?.classList.add('open');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new TuTienGame();
});
