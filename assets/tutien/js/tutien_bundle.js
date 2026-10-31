// TU TIEN KY NGUYEN HIEN DAI - STANDALONE WEB ENGINE BUNDLE (NO EXTERNAL DEPENDENCIES)

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

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateCamera(targetX, targetY) {
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

        this.renderMap(ctx, mapInfo, now);

        if (mapInfo && mapInfo.portals) {
            for (const portal of mapInfo.portals) {
                this.renderPortal(ctx, portal, now);
            }
        }

        if (mapInfo && mapInfo.npcs) {
            for (const npc of mapInfo.npcs) {
                this.renderNPC(ctx, npc, now);
            }
        }

        if (snapshot && snapshot.monsters) {
            for (const mob of snapshot.monsters) {
                this.renderMonster(ctx, mob, now);
            }
        }

        if (snapshot && snapshot.players) {
            for (const p of snapshot.players) {
                const isLocal = (p.id === localPlayerId);
                this.renderPlayer(ctx, p, isLocal, now);
            }
        }

        this.renderSkillVisuals(ctx, now);
        this.renderParticles(ctx);
        this.renderFloatingTexts(ctx);

        ctx.restore();
    }

    renderMap(ctx, mapInfo, now) {
        const w = mapInfo?.width || 1400;
        const h = mapInfo?.height || 1000;

        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, 0, w, h);

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

        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, w, h);

        if (mapInfo?.id === 'city_tan_hai') {
            ctx.fillStyle = 'rgba(16, 24, 48, 0.8)';
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.fillRect(600, 250, 200, 150);
            ctx.strokeRect(600, 250, 200, 150);
            ctx.fillStyle = '#00e5ff';
            ctx.font = 'bold 12px Segoe UI, Nunito';
            ctx.textAlign = 'center';
            ctx.fillText('🏢 TẬP ĐOÀN VẠN LINH', 700, 330);
        } else if (mapInfo?.id === 'arena_heaven') {
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

        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 11px Segoe UI, Nunito';
        ctx.textAlign = 'center';
        ctx.fillText(`🌀 ${portal.label}`, portal.x, portal.y - 36);
    }

    renderNPC(ctx, npc, now) {
        ctx.save();
        ctx.translate(npc.x, npc.y);

        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 16, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();

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

        ctx.font = 'bold 12px Segoe UI, Nunito';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(npc.name, 0, -28);

        ctx.font = '10px Segoe UI, Nunito';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`<${npc.title}>`, 0, -16);

        ctx.restore();
    }

    renderMonster(ctx, mob, now) {
        ctx.save();
        ctx.translate(mob.x, mob.y);

        const radius = mob.isBoss ? 28 : 16;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, radius, radius * 1.1, radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (mob.isEnraged) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, radius + 8 + Math.sin(now / 150) * 4, 0, Math.PI * 2);
            ctx.stroke();
        }

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

        ctx.font = mob.isBoss ? 'bold 12px Segoe UI, Nunito' : '11px Segoe UI, Nunito';
        ctx.fillStyle = mob.isBoss ? '#ffd700' : '#fca5a5';
        ctx.fillText(mob.name, 0, -radius - 14);

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
        ctx.translate(p.pos_x || p.x, p.pos_y || p.y);

        const rot = (now / 1000) * 2;
        ctx.save();
        ctx.rotate(rot);
        let auraColor = '#00e5ff';
        if (p.realm >= 3) auraColor = '#ffd700';
        if (p.realm >= 4) auraColor = '#a855f7';
        if (p.realm >= 5) auraColor = '#ef4444';

        ctx.strokeStyle = auraColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const swordFloatY = Math.sin(now / 200) * 3;
        ctx.fillStyle = '#00e5ff';
        ctx.font = '16px Segoe UI';
        ctx.fillText('🗡️', 14, -8 + swordFloatY);

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

        ctx.font = 'bold 12px Segoe UI, Nunito';
        ctx.fillStyle = isLocal ? '#00e5ff' : '#fff';
        ctx.fillText(p.name, 0, -28);

        ctx.font = '10px Segoe UI, Nunito';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`[${p.title}]`, 0, -16);

        const barW = 36;
        const hpPct = Math.max(0, p.hp / p.max_hp);
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
            ctx.font = ft.type === 'crit' ? 'bold 18px Segoe UI, Nunito' : 'bold 14px Segoe UI, Nunito';
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

// --- 3. GAME SYSTEM & SIMULATION ENGINE ---
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
        spawns: { x: 450, y: 500 },
        portals: [
            { targetMap: 'beast_forest', x: 100, y: 500, label: 'Lối Ra Rừng Yêu Thú' },
            { targetMap: 'arena_heaven', x: 700, y: 100, label: 'Thiên Môn Đấu Trường (PvP)' }
        ],
        npcs: [
            { id: 'npc_guide', name: 'Lý Linh Vân', title: 'Hiệp Hội Tu Sĩ Đô Thị', x: 500, y: 400 },
            { id: 'npc_ceo', name: 'Vương Tổng', title: 'Chủ Tịch Tập Đoàn Vạn Linh', x: 800, y: 400 }
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
        spawns: { x: 550, y: 700 },
        portals: [
            { targetMap: 'city_tan_hai', x: 550, y: 760, label: 'Về Đô Thị' }
        ]
    }
};

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
        this.pvpMatch = null;

        this.initDOM();
        this.loadProgress();
        this.initWorldMobs();
    }

    initDOM() {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new GameRenderer(canvas);

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        canvas.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX + this.renderer.camera.x;
            this.mousePos.y = e.clientY + this.renderer.camera.y;
        });
        canvas.addEventListener('mousedown', (e) => this.handleCanvasClick(e));

        const exitBtn = document.getElementById('btn-exit-honxomlang');
        if (exitBtn) {
            exitBtn.onclick = () => this.exitToHonXomLang();
        }

        let lastTime = Date.now();
        const loop = (now) => {
            const dt = (Date.now() - lastTime) / 1000;
            lastTime = Date.now();

            this.update(dt);
            if (this.character) {
                this.renderer.updateCamera(this.character.pos_x, this.character.pos_y);
                const snapshot = {
                    players: [this.character],
                    monsters: this.monsters.filter(m => !m.isDead)
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
        this.monsters = [
            { id: 'mob_1', name: 'Thiết Giáp Sói', isBoss: false, maxHp: 350, hp: 350, atk: 40, def: 20, speed: 90, x: 500, y: 600, realm: 1, isDead: false },
            { id: 'mob_2', name: 'Lôi Đình Ưng', isBoss: false, maxHp: 480, hp: 480, atk: 55, def: 18, speed: 110, x: 800, y: 400, realm: 1, isDead: false },
            { id: 'mob_3', name: 'Xích Viêm Cự Hùng (Thủ Lĩnh)', isBoss: true, maxHp: 3500, hp: 3500, atk: 120, def: 70, speed: 75, x: 1000, y: 700, realm: 2, isDead: false, isEnraged: false },
            { id: 'mob_4', name: 'Hư Không Diệt Thế Ma Tôn (Thế Giới Boss)', isBoss: true, maxHp: 18000, hp: 18000, atk: 350, def: 180, speed: 85, x: 400, y: 300, realm: 3, isDead: false, isEnraged: false }
        ];
    }

    loadProgress() {
        const saved = localStorage.getItem('tutien_character_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.character = data.character;
                this.inventory = data.inventory || [];
                this.skills = data.skills || [];
                document.getElementById('auth-screen').classList.remove('active');
                document.getElementById('game-screen').classList.add('active');
                this.updateHUD();
                this.showToast(`Chào mừng đạo hữu [${this.character.name}] trở lại!`, 'gold');
                return;
            } catch (e) {}
        }
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
        const randomEl = elements[Math.floor(Math.random() * elements.length)];

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

        this.inventory = [
            { id: 'inv_1', name: 'Mộc Kiếm Khởi Đầu', type: 'weapon', rarity: 'common', quantity: 1 },
            { id: 'inv_2', name: 'Tụ Khí Đan', type: 'pill', rarity: 'spiritual', quantity: 5 }
        ];

        this.skills = [
            { id: 'sword_slash', name: 'Thanh Phong Kiếm Khí', mpCost: 15, dmgMult: 1.4 },
            { id: 'ten_thousand_swords', name: 'Vạn Kiếm Quy Tông', mpCost: 45, dmgMult: 2.8 },
            { id: 'elemental_burst', name: 'Hỏa Cầu Diễm Bạo', mpCost: 30, dmgMult: 2.1 },
            { id: 'thunder_wrath', name: 'Cửu Thiên Thần Lôi', mpCost: 60, dmgMult: 3.2 }
        ];

        this.saveProgress();
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        this.updateHUD();
        this.showToast(`Thức tỉnh Linh Căn [${randomEl}]! Bước vào Tiên Đạo!`, 'gold');
        audio.playMeditationQi();
    }

    update(dt) {
        if (!this.character) return;

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

            if (this.currentMap.portals) {
                for (const portal of this.currentMap.portals) {
                    if (Math.hypot(this.character.pos_x - portal.x, this.character.pos_y - portal.y) < 50) {
                        const nextMap = MAPS_DATA[portal.targetMap];
                        if (nextMap) {
                            this.currentMap = nextMap;
                            this.character.pos_x = nextMap.spawns.x;
                            this.character.pos_y = nextMap.spawns.y;
                            this.showToast(`Dịch chuyển đến [${nextMap.name}]!`, 'gold');
                            break;
                        }
                    }
                }
            }
        }

        for (const mob of this.monsters) {
            if (mob.isDead) continue;
            const dist = Math.hypot(this.character.pos_x - mob.x, this.character.pos_y - mob.y);
            if (dist < 200 && dist > 40) {
                const angle = Math.atan2(this.character.pos_y - mob.y, this.character.pos_x - mob.x);
                mob.x += Math.cos(angle) * (mob.speed * dt);
                mob.y += Math.sin(angle) * (mob.speed * dt);
            }
        }
    }

    castSkill(skillId, targetX = null, targetY = null) {
        if (!this.character) return;
        const tx = targetX !== null ? targetX : this.mousePos.x;
        const ty = targetY !== null ? targetY : this.mousePos.y;

        if (this.pvpMatch) {
            this.handlePvpSkillCast();
            return;
        }

        const skill = this.skills.find(s => s.id === skillId) || { id: 'sword_slash', mpCost: 10, dmgMult: 1.3 };
        if (this.character.mp < skill.mpCost) {
            this.showToast('Linh lực không đủ!', 'danger');
            return;
        }

        this.character.mp -= skill.mpCost;
        this.renderer.addSkillVisual(skill.id, tx, ty);
        if (skill.id === 'thunder_wrath') audio.playThunder();
        else audio.playSlash();

        for (const mob of this.monsters) {
            if (mob.isDead) continue;
            const dist = Math.hypot(mob.x - tx, mob.y - ty);
            if (dist < 90) {
                let dmg = Math.round(this.character.atk * skill.dmgMult * (1 + Math.random() * 0.2));
                let isCrit = Math.random() < this.character.crit_rate;
                if (isCrit) dmg = Math.round(dmg * 1.75);

                mob.hp = Math.max(0, mob.hp - dmg);
                this.renderer.addFloatingText(dmg + (isCrit ? ' BẠO KÍCH!' : ''), mob.x, mob.y - 15, isCrit ? 'crit' : 'normal');

                if (mob.isBoss && mob.hp <= (mob.maxHp * 0.5) && !mob.isEnraged) {
                    mob.isEnraged = true;
                    mob.atk = Math.round(mob.atk * 1.3);
                    this.showToast(`Thủ Lĩnh Cuồng Nộ! Sát thương tăng vọt!`, 'danger');
                }

                if (mob.hp <= 0) {
                    mob.isDead = true;
                    audio.playCoin();
                    const expGain = Math.round(mob.maxHp * 0.2);
                    const goldGain = Math.round(mob.maxHp * 0.25);
                    const stoneGain = mob.isBoss ? 15 : 1;

                    this.character.exp += expGain;
                    this.character.gold += goldGain;
                    this.character.spirit_stones += stoneGain;

                    this.showToast(`Hạ gục [${mob.name}]! +${expGain} Tu Vi, +${goldGain} Linh Tệ, +${stoneGain} Linh Thạch`, 'gold');
                    this.saveProgress();

                    setTimeout(() => {
                        mob.isDead = false;
                        mob.hp = mob.maxHp;
                        mob.isEnraged = false;
                    }, 15000);
                }
            }
        }

        this.updateHUD();
    }

    meditate() {
        if (!this.character) return;
        const qiGain = Math.round(20 * (this.currentMap.ambientQi || 1.0));
        const expGain = Math.round(35 * (this.currentMap.ambientQi || 1.0));

        this.character.qi = Math.min(this.character.max_qi, this.character.qi + qiGain);
        this.character.exp += expGain;
        this.character.tam_canh = Math.min(100, this.character.tam_canh + 1);

        audio.playMeditationQi();
        this.renderer.addQiParticles(this.character.pos_x, this.character.pos_y, 16, '#10b981');
        this.showToast(`Đả tọa hấp thu +${qiGain} Linh Khí, lĩnh ngộ +${expGain} Tu Vi!`, 'success');
        this.updateHUD();
        this.saveProgress();
    }

    breakthrough() {
        if (!this.character) return;
        if (this.character.exp < this.character.max_exp) {
            this.showToast(`Tu vi chưa viên mãn (${this.character.exp}/${this.character.max_exp}). Chưa thể đột phá!`, 'danger');
            return;
        }

        if (this.character.tam_canh < 50 && Math.random() < 0.4) {
            audio.playThunder();
            const lostExp = Math.round(this.character.exp * 0.2);
            this.character.exp = Math.max(0, this.character.exp - lostExp);
            this.showToast(`Tẩu Hỏa Nhập Ma! Đột phá thất bại, tổn thất ${lostExp} tu vi!`, 'danger');
            this.updateHUD();
            this.saveProgress();
            return;
        }

        const currentRealm = REALMS_DATA.find(r => r.id === this.character.realm) || REALMS_DATA[0];
        const isUpgradingRealm = (this.character.realm_stage >= currentRealm.maxStages);

        if (isUpgradingRealm && currentRealm.tribulation) {
            audio.playThunder();
            this.showToast(`⚡ Cửu Thiên Lôi Kiếp Giáng Thế!`, 'gold');
            this.renderer.addSkillVisual('thunder_wrath', this.character.pos_x, this.character.pos_y);
        }

        let newStage = this.character.realm_stage + 1;
        let newRealm = this.character.realm;
        if (newStage > currentRealm.maxStages) {
            newRealm = Math.min(5, newRealm + 1);
            newStage = 1;
        }

        const nextInfo = REALMS_DATA.find(r => r.id === newRealm) || currentRealm;
        this.character.realm = newRealm;
        this.character.realm_stage = newStage;
        this.character.exp = 0;
        this.character.max_exp = Math.round(nextInfo.expReq * (1 + newStage * 0.3));
        this.character.max_hp += Math.round(nextInfo.baseHp * 0.3);
        this.character.hp = this.character.max_hp;
        this.character.atk += Math.round(nextInfo.baseAtk * 0.3);
        this.character.def += Math.round(nextInfo.baseDef * 0.3);
        this.character.title = `${nextInfo.name} Tầng ${newStage}`;

        audio.playHeavenlyChime();
        this.renderer.addQiParticles(this.character.pos_x, this.character.pos_y, 40, '#ffd700');
        this.showToast(`Thiên Địa Dị Tượng! Đột phá thành công [${this.character.title}]!`, 'gold');
        this.updateHUD();
        this.saveProgress();
    }

    startPvpQueue() {
        this.showToast('Đang tìm kiếm cao thủ Tiên Giới...', 'gold');
        setTimeout(() => {
            const botNames = ['Tiêu Viêm', 'Hàn Lập', 'Bạch Tiểu Thuần', 'Lý Trường Thọ', 'Diệp Phàm', 'Cố Trường Ca'];
            const botName = botNames[Math.floor(Math.random() * botNames.length)];
            const botElo = this.character.pvp_elo + Math.floor((Math.random() - 0.5) * 80);

            this.pvpMatch = {
                opponent: { name: botName, elo: botElo },
                yourHp: 2000,
                opponentHp: 2000
            };

            this.openModal('modal-pvp');
            this.renderPvpView();
            audio.playThunder();
            this.showToast(`Đối thủ xuất hiện: [${botName}]! Khai chiến!`, 'danger');
        }, 800);
    }

    handlePvpSkillCast() {
        if (!this.pvpMatch) return;
        audio.playSlash();

        const yourDmg = Math.round(180 + Math.random() * 80);
        this.pvpMatch.opponentHp = Math.max(0, this.pvpMatch.opponentHp - yourDmg);

        const botDmg = Math.round(160 + Math.random() * 70);
        this.pvpMatch.yourHp = Math.max(0, this.pvpMatch.yourHp - botDmg);

        this.renderPvpView();

        if (this.pvpMatch.opponentHp <= 0 || this.pvpMatch.yourHp <= 0) {
            const isWin = this.pvpMatch.opponentHp <= 0;
            const delta = isWin ? 24 : -16;
            this.character.pvp_elo = Math.max(0, this.character.pvp_elo + delta);
            if (isWin) this.character.pvp_wins++;
            else this.character.pvp_losses++;

            if (isWin) {
                audio.playHeavenlyChime();
                this.showToast(`Chiến Thắng! +${delta} ELO (Hiện tại: ${this.character.pvp_elo})`, 'gold');
            } else {
                this.showToast(`Thất Bại! ${delta} ELO (Hiện tại: ${this.character.pvp_elo})`, 'danger');
            }

            this.pvpMatch = null;
            this.saveProgress();
            setTimeout(() => this.closeModal('modal-pvp'), 2000);
        }
    }

    renderPvpView() {
        const box = document.getElementById('pvp-arena-content');
        if (!this.pvpMatch) return;

        box.innerHTML = `
            <div class="pvp-vs-box">
                <div class="pvp-fighter-card">
                    <h3 style="color: #00e5ff;">${this.character.name}</h3>
                    <p style="font-size: 12px; color: #cbd5e1;">ELO: ${this.character.pvp_elo}</p>
                    <div class="bar-wrap" style="margin-top: 10px; height: 12px;">
                        <div class="bar-fill bar-hp" style="width: ${(this.pvpMatch.yourHp / 2000) * 100}%;"></div>
                    </div>
                    <div style="font-size: 11px; margin-top: 4px;">HP: ${this.pvpMatch.yourHp}/2000</div>
                </div>
                <div style="font-size: 28px; font-weight: 800; color: #ef4444;">VS</div>
                <div class="pvp-fighter-card">
                    <h3 style="color: #ef4444;">${this.pvpMatch.opponent.name}</h3>
                    <p style="font-size: 12px; color: #cbd5e1;">ELO: ${this.pvpMatch.opponent.elo}</p>
                    <div class="bar-wrap" style="margin-top: 10px; height: 12px;">
                        <div class="bar-fill bar-hp" style="width: ${(this.pvpMatch.opponentHp / 2000) * 100}%;"></div>
                    </div>
                    <div style="font-size: 11px; margin-top: 4px;">HP: ${this.pvpMatch.opponentHp}/2000</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-primary" style="width: 220px;" onclick="window.gameApp.handlePvpSkillCast()">⚔️ Xuất Chiêu Lôi Đài!</button>
            </div>
        `;
    }

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

    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        if (e.key === 'c' || e.key === 'C') this.toggleModal('modal-cultivation');
        if (e.key === 'b' || e.key === 'B') { this.renderInventory(); this.toggleModal('modal-inventory'); }
        if (e.key === 'p' || e.key === 'P') this.toggleModal('modal-pvp');
        if (e.key === 'l' || e.key === 'L') { this.renderLeaderboards(); this.toggleModal('modal-leaderboard'); }
        if (e.key === 'm' || e.key === 'M') this.toggleModal('modal-market');
        if (e.key === 'h' || e.key === 'H') this.toggleModal('modal-housing');

        if (['1', '2', '3', '4'].includes(e.key)) {
            const idx = parseInt(e.key) - 1;
            if (this.skills[idx]) this.castSkill(this.skills[idx].id);
        }
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    handleCanvasClick(e) {
        this.castSkill('sword_slash', this.mousePos.x, this.mousePos.y);
    }

    updateHUD() {
        if (!this.character) return;
        document.getElementById('hud-char-name').textContent = this.character.name;
        document.getElementById('hud-char-title').textContent = this.character.title;
        document.getElementById('hud-char-realm').textContent = `Cảnh Giới ${this.character.realm}`;

        const hpPct = Math.max(0, (this.character.hp / this.character.max_hp) * 100);
        const mpPct = Math.max(0, (this.character.mp / this.character.max_mp) * 100);
        const qiPct = Math.max(0, (this.character.qi / this.character.max_qi) * 100);
        const expPct = Math.max(0, (this.character.exp / this.character.max_exp) * 100);

        document.getElementById('hud-hp-bar').style.width = `${hpPct}%`;
        document.getElementById('hud-mp-bar').style.width = `${mpPct}%`;
        document.getElementById('hud-qi-bar').style.width = `${qiPct}%`;
        document.getElementById('hud-exp-bar').style.width = `${expPct}%`;

        document.getElementById('hud-hp-text').textContent = `${this.character.hp}/${this.character.max_hp}`;
        document.getElementById('hud-mp-text').textContent = `${this.character.mp}/${this.character.max_mp}`;
        document.getElementById('hud-qi-text').textContent = `${this.character.qi}/${this.character.max_qi}`;
        document.getElementById('hud-exp-text').textContent = `${this.character.exp}/${this.character.max_exp}`;

        document.getElementById('hud-gold').textContent = Number(this.character.gold).toLocaleString();
        document.getElementById('hud-stones').textContent = Number(this.character.spirit_stones).toLocaleString();
    }

    renderInventory() {
        const grid = document.getElementById('inventory-grid-box');
        grid.innerHTML = '';
        this.inventory.forEach(item => {
            const slot = document.createElement('div');
            slot.className = `inv-slot rarity-${item.rarity}`;
            slot.innerHTML = `<span>${item.type === 'pill' ? '💊' : '🗡️'}</span><span class="inv-qty">x${item.quantity}</span>`;
            slot.title = `${item.name}\nBấm để dùng.`;
            slot.onclick = () => {
                if (item.type === 'pill') {
                    this.character.hp = Math.min(this.character.max_hp, this.character.hp + 100);
                    this.character.qi = Math.min(this.character.max_qi, this.character.qi + 30);
                    item.quantity--;
                    if (item.quantity <= 0) {
                        this.inventory = this.inventory.filter(i => i.id !== item.id);
                    }
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
        const el = document.getElementById(id);
        if (el?.classList.contains('open')) el.classList.remove('open');
        else el?.classList.add('open');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new TuTienGame();
});
