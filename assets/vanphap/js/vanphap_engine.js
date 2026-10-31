// ==========================================================================
// VẠN PHÁP ĐẠO TRÀNG — CORE ENGINE, PROCEDURAL AUDIO & VISUAL CANVAS
// Pure Vanilla JavaScript — Zero External Dependencies
// ==========================================================================

// 1. ZEN PROCEDURAL AUDIO ENGINE (Realistic Web Audio API)
class ZenAudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Tiếng Mõ Gỗ Tụng Kinh (Multi-Harmonic Hardwood Hollow Resonance)
    playWoodenFish() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Hardwood transient click contact (~880Hz -> 350Hz)
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(880, now);
        clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.025);
        clickGain.gain.setValueAtTime(0.45, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.03);

        // 2. Hollow Sandalwood Chamber Resonance (~420Hz -> 180Hz)
        const bodyOsc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();
        bodyOsc.type = 'sine';
        bodyOsc.frequency.setValueAtTime(420, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        bodyGain.gain.setValueAtTime(0.38, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);
        bodyOsc.connect(bodyGain);
        bodyGain.connect(this.ctx.destination);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.095);

        // 3. Low body thud (~120Hz)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(140, now);
        subOsc.frequency.exponentialRampToValueAtTime(70, now + 0.07);
        subGain.gain.setValueAtTime(0.25, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.075);
    }

    // Tiếng Chuông Gia Trì / Khánh Ngân (528Hz Solfeggio Miracle Healing Tone)
    playSingingBowl() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const harmonics = [
            { f: 528, g: 0.35, d: 4.2 },
            { f: 1056, g: 0.12, d: 3.5 },
            { f: 1584, g: 0.05, d: 2.5 }
        ];

        harmonics.forEach(h => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(h.f, now);

            gain.gain.setValueAtTime(h.g, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + h.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + h.d);
        });
    }

    // Tiếng Đại Hồng Chung (Deep Temple Bell)
    playTempleBell() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const baseF = 130.81; // C3 low resonance
        const harmonics = [1, 1.98, 2.76, 3.44, 4.88];
        harmonics.forEach((h, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseF * h, now);

            const startGain = 0.35 / (i + 1);
            gain.gain.setValueAtTime(startGain, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 5.5);
        });
    }
}

// 2. HIGH-FIDELITY ORIENTAL WATERCOLOR LANDSCAPE CANVAS
class CampusVisualizer {
    constructor(canvas, onBuildingClick) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onBuildingClick = onBuildingClick;
        this.smokeParticles = [];
        this.kois = [];
        this.monks = [];
        this.selectedBuildingKey = 'chinh_dien';
        this.hoveredBuildingKey = null;
        this.time = 0;

        this.initEnvironment();
        this.bindEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.startLoop();
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    initEnvironment() {
        // Animated Koi Fish in the lotus pond
        this.kois = [
            { x: 120, y: 340, angle: 0.5, speed: 0.8, color: '#f97316', white: '#ffffff', size: 10 },
            { x: 150, y: 360, angle: 2.2, speed: 0.6, color: '#ef4444', white: '#fef08a', size: 12 },
            { x: 100, y: 320, angle: 3.8, speed: 0.7, color: '#fbbf24', white: '#ffffff', size: 9 }
        ];

        // Animated Monks walking between halls
        this.monks = [
            { x: 260, y: 240, targetX: 380, targetY: 240, speed: 0.5, robe: '#d97706', state: 'walk', action: 'Quét lá sân chùa' },
            { x: 420, y: 190, state: 'meditate', robe: '#b45309', aura: 0, action: 'Tọa thiền tịnh tâm' },
            { x: 500, y: 280, targetX: 620, targetY: 280, speed: 0.4, robe: '#78350f', state: 'walk', action: 'Chăm sóc nam dược' }
        ];
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const blds = this.getBuildingLayout();
            let found = null;
            for (const b of blds) {
                const dist = Math.hypot(x - b.cx, y - b.cy);
                if (dist < b.radius) {
                    found = b.key;
                    break;
                }
            }
            this.hoveredBuildingKey = found;
            this.canvas.style.cursor = found ? 'pointer' : 'default';
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const blds = this.getBuildingLayout();
            for (const b of blds) {
                const dist = Math.hypot(x - b.cx, y - b.cy);
                if (dist < b.radius) {
                    this.selectedBuildingKey = b.key;
                    if (this.onBuildingClick) this.onBuildingClick(b.key);
                    break;
                }
            }
        });
    }

    getBuildingLayout() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        return [
            { key: 'chinh_dien', label: 'Đại Hùng Điện', cx: w * 0.5, cy: h * 0.38, radius: 52, icon: '🏛️' },
            { key: 'tam_quan', label: 'Tam Quan Sơn Môn', cx: w * 0.5, cy: h * 0.84, radius: 40, icon: '⛩️' },
            { key: 'tang_kinh_cac', label: 'Tàng Kinh Các', cx: w * 0.22, cy: h * 0.36, radius: 44, icon: '📜' },
            { key: 'thien_duong', label: 'Thiền Đường', cx: w * 0.78, cy: h * 0.36, radius: 44, icon: '🧘' },
            { key: 'thap_kinh', label: 'Tháp Xá Lợi', cx: w * 0.85, cy: h * 0.18, radius: 38, icon: '🗼' },
            { key: 'cay_bo_de', label: 'Cây Bồ Đề', cx: w * 0.15, cy: h * 0.20, radius: 40, icon: '🌳' },
            { key: 'ho_sen', label: 'Hồ Sen Tịnh Tâm', cx: w * 0.18, cy: h * 0.68, radius: 45, icon: '🪷' },
            { key: 'vuon_thuoc', label: 'Vườn Nam Dược', cx: w * 0.82, cy: h * 0.68, radius: 45, icon: '🌿' },
            { key: 'nha_khach', label: 'Nhà Khách', cx: w * 0.34, cy: h * 0.62, radius: 38, icon: '🏡' },
            { key: 'trai_duong', label: 'Trai Đường & Bếp', cx: w * 0.66, cy: h * 0.62, radius: 38, icon: '🍲' }
        ];
    }

    startLoop() {
        const tick = () => {
            this.time += 0.02;
            this.render();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (!w || !h) return;

        ctx.clearRect(0, 0, w, h);

        // 1. Serene Twilight Sky Background with Golden Mist
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#1a0b08');
        skyGrad.addColorStop(0.35, '#351610');
        skyGrad.addColorStop(0.65, '#200e0a');
        skyGrad.addColorStop(1, '#0e0504');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Sacred Sun/Moon Disc behind mountains
        const sunX = w * 0.5;
        const sunY = h * 0.22;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 130);
        sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        sunGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.15)');
        sunGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 130, 0, Math.PI * 2);
        ctx.fill();

        // 2. Multi-tier Layered Misty Mountains (Thủy Mặc Sơn Thủy)
        // Distant Mountains
        ctx.fillStyle = 'rgba(40, 20, 16, 0.65)';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.38);
        ctx.quadraticCurveTo(w * 0.2, h * 0.12, w * 0.45, h * 0.32);
        ctx.quadraticCurveTo(w * 0.75, h * 0.14, w, h * 0.35);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Mid-distance Mountains
        ctx.fillStyle = 'rgba(28, 14, 10, 0.85)';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.48);
        ctx.quadraticCurveTo(w * 0.3, h * 0.24, w * 0.6, h * 0.44);
        ctx.quadraticCurveTo(w * 0.85, h * 0.28, w, h * 0.46);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // 3. Monastery Terraced Courtyard & Flagstone Paths
        // Central Stone Plaza
        ctx.fillStyle = 'rgba(35, 17, 13, 0.9)';
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.52, w * 0.46, h * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(197, 155, 39, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Main Imperial Path (Tam Quan -> Đại Hùng Bảo Điện)
        const pathGrad = ctx.createLinearGradient(w * 0.5 - 18, 0, w * 0.5 + 18, 0);
        pathGrad.addColorStop(0, 'rgba(197, 155, 39, 0.15)');
        pathGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.4)');
        pathGrad.addColorStop(1, 'rgba(197, 155, 39, 0.15)');
        ctx.fillStyle = pathGrad;
        ctx.fillRect(w * 0.5 - 16, h * 0.40, 32, h * 0.45);

        // Branch Paths to Wings
        ctx.strokeStyle = 'rgba(197, 155, 39, 0.3)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.52);
        ctx.lineTo(w * 0.22, h * 0.36);
        ctx.moveTo(w * 0.5, h * 0.52);
        ctx.lineTo(w * 0.78, h * 0.36);
        ctx.stroke();

        // 4. Emerald Lotus Pond with Swimming Koi Fish
        const pondX = w * 0.18;
        const pondY = h * 0.68;
        const pondR = 48;
        const pondGrad = ctx.createRadialGradient(pondX, pondY, 10, pondX, pondY, pondR);
        pondGrad.addColorStop(0, 'rgba(45, 106, 79, 0.85)');
        pondGrad.addColorStop(0.8, 'rgba(27, 67, 50, 0.95)');
        pondGrad.addColorStop(1, 'rgba(8, 28, 21, 0.95)');
        ctx.fillStyle = pondGrad;
        ctx.beginPath();
        ctx.arc(pondX, pondY, pondR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(197, 155, 39, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Animate Koi Fish in the pond
        for (const koi of this.kois) {
            koi.angle += 0.02 * koi.speed;
            const kx = pondX + Math.cos(koi.angle) * (pondR * 0.55);
            const ky = pondY + Math.sin(koi.angle) * (pondR * 0.45);

            ctx.save();
            ctx.translate(kx, ky);
            ctx.rotate(koi.angle + Math.PI / 2);

            // Koi Body
            ctx.fillStyle = koi.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, koi.size * 0.4, koi.size, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tail fin wigwag
            const tailWig = Math.sin(this.time * 8 + koi.speed) * 4;
            ctx.fillStyle = koi.white;
            ctx.beginPath();
            ctx.moveTo(0, koi.size * 0.8);
            ctx.lineTo(-4 + tailWig, koi.size * 1.6);
            ctx.lineTo(4 + tailWig, koi.size * 1.6);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // Floating Lotus Flowers in Pond
        ctx.font = '16px serif';
        ctx.fillText('🪷', pondX - 18, pondY - 14);
        ctx.fillText('🪷', pondX + 10, pondY + 16);

        // 5. Procedural Sandalwood Incense Smoke from Courtyard Burner
        if (Math.random() < 0.3) {
            this.smokeParticles.push({
                x: w * 0.5 + (Math.random() - 0.5) * 6,
                y: h * 0.54,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.8 - Math.random() * 0.5,
                alpha: 0.6,
                size: 3 + Math.random() * 3
            });
        }
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.006;
            p.size += 0.12;
            ctx.fillStyle = `rgba(240, 225, 215, ${Math.max(0, p.alpha)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            if (p.alpha <= 0) this.smokeParticles.splice(i, 1);
        }

        // 6. Draw Architectural Pavilions (Buildings)
        const blds = this.getBuildingLayout();
        for (const b of blds) {
            const isHover = this.hoveredBuildingKey === b.key;
            const isSelected = this.selectedBuildingKey === b.key;

            // Halo glow for hovered/selected
            if (isSelected || isHover) {
                ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 191, 36, 0.12)';
                ctx.beginPath();
                ctx.arc(b.cx, b.cy, b.radius + 10, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = isSelected ? '#fbbf24' : 'rgba(251, 191, 36, 0.6)';
                ctx.lineWidth = isSelected ? 2.5 : 1.5;
                ctx.beginPath();
                ctx.arc(b.cx, b.cy, b.radius + 6, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Pavilion Foundation Base
            ctx.fillStyle = 'rgba(20, 10, 8, 0.88)';
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, b.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = isSelected ? '#fbbf24' : 'rgba(197, 155, 39, 0.5)';
            ctx.lineWidth = isSelected ? 2.5 : 1.5;
            ctx.stroke();

            // Pavilion Icon & Label
            ctx.font = `${Math.round(b.radius * 0.58)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.icon, b.cx, b.cy - 6);

            // Label text below
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = isSelected ? '#fef08a' : '#fffaf0';
            ctx.fillText(b.label, b.cx, b.cy + b.radius * 0.55);
        }

        // 7. Monks Walking in Courtyard
        for (const m of this.monks) {
            if (m.state === 'meditate') {
                m.aura = (m.aura || 0) + 0.05;
                const glowR = 14 + Math.sin(m.aura) * 3;
                ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
                ctx.beginPath();
                ctx.arc(m.x, m.y, glowR, 0, Math.PI * 2);
                ctx.fill();

                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🧘', m.x, m.y + 4);
            } else if (m.state === 'walk') {
                const dx = m.targetX - m.x;
                const dy = m.targetY - m.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 3) {
                    m.targetX = w * 0.35 + Math.random() * (w * 0.3);
                    m.targetY = h * 0.45 + Math.random() * (h * 0.2);
                } else {
                    m.x += (dx / dist) * m.speed;
                    m.y += (dy / dist) * m.speed;
                }
                ctx.font = '15px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🚶', m.x, m.y + 4);
            }
        }
    }
}

// 3. MASTER VẠN PHÁP GAME CONTROLLER
class VanPhapGame {
    constructor() {
        this.audio = new ZenAudioEngine();
        this.visualizer = null;
        this.state = null;
        this.selectedTab = 'chanting';
        this.selectedBuildingKey = 'chinh_dien';
        this.activeCategory = 'kinh_sach';

        // Chanting Feature State
        this.beadCount = 0;
        this.malaCycles = 0;
        this.comboCount = 0;
        this.comboResetTimer = null;
        this.isAutoChanting = false;
        this.autoChantInterval = null;
        this.selectedScripture = 'daohanh';

        this.initDOM();
        this.loadState();
    }

    initDOM() {
        // Tab switching
        document.querySelectorAll('.vp-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Audio toggle
        const audioBtn = document.getElementById('btn-audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                this.audio.enabled = !this.audio.enabled;
                audioBtn.textContent = this.audio.enabled ? '🔊 Âm Thiền: Bật' : '🔇 Âm Thiền: Tắt';
            });
        }

        // Meditate button (Campus tab)
        const medBtn = document.getElementById('btn-meditate-abbot');
        if (medBtn) {
            medBtn.addEventListener('click', () => this.handleAbbotMeditate());
        }

        // Recruit button
        const recBtn = document.getElementById('btn-recruit-disciple');
        if (recBtn) {
            recBtn.addEventListener('click', () => this.handleRecruitDisciple());
        }

        // Canvas visualizer
        const canvas = document.getElementById('campusCanvas');
        if (canvas) {
            this.visualizer = new CampusVisualizer(canvas, (buildingKey) => {
                this.selectedBuildingKey = buildingKey;
                this.renderSelectedBuildingDetails();
            });
        }

        // Wooden fish stage click (GÕ MÕ TỤNG KINH)
        const fishStage = document.getElementById('woodenFishStage');
        if (fishStage) {
            fishStage.addEventListener('click', () => {
                this.strikeWoodenFish(false);
            });
        }

        // Auto chant toggle button
        const autoBtn = document.getElementById('toggleAutoChant');
        if (autoBtn) {
            autoBtn.addEventListener('click', () => {
                this.toggleAutoChant();
            });
        }

        // Scripture select input
        const scripSelect = document.getElementById('scriptureSelect');
        if (scripSelect) {
            scripSelect.addEventListener('change', (e) => {
                this.selectedScripture = e.target.value;
                this.showToast(`Đã chuyển sang: ${e.target.options[e.target.selectedIndex].text}`);
            });
        }

        // Leaderboard tabs
        document.querySelectorAll('.lb-tab-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.lb-tab-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.loadLeaderboard(chip.getAttribute('data-type'));
            });
        });

        // Canon category chips
        document.querySelectorAll('.canon-cat-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.canon-cat-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.activeCategory = chip.getAttribute('data-cat');
                this.renderCanons();
            });
        });

        // Periodic auto loop (tick every 1s)
        setInterval(() => this.tick(), 1000);
        // Periodic sync to server every 15s
        setInterval(() => this.syncServerState(), 15000);
    }

    switchTab(tabId) {
        this.selectedTab = tabId;
        document.querySelectorAll('.vp-tab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
        });
        document.querySelectorAll('.tab-pane').forEach(p => {
            p.classList.toggle('active', p.id === 'tab-' + tabId);
        });

        if (tabId === 'campus' && this.visualizer) {
            this.visualizer.resize();
        } else if (tabId === 'leaderboard') {
            this.loadLeaderboard('reputation');
        }
    }

    // ======================================================================
    // CORE GÕ MÕ TỤNG KINH (WOODEN FISH CHANTING ENGINE)
    // ======================================================================
    strikeWoodenFish(isAuto = false) {
        this.audio.playWoodenFish();

        // 1. Trigger Mallet Swing Animation
        const mallet = document.getElementById('woodenMallet');
        if (mallet) {
            mallet.classList.remove('strike');
            void mallet.offsetWidth; // Force reflow
            mallet.classList.add('strike');
        }

        // 2. Trigger Fish Bump Animation
        const fish = document.getElementById('woodenFishBody');
        if (fish) {
            fish.classList.remove('hit');
            void fish.offsetWidth;
            fish.classList.add('hit');
        }

        // 3. Spawn Golden Ripple
        const rippleWrap = document.getElementById('moRippleContainer');
        if (rippleWrap) {
            const ripple = document.createElement('div');
            ripple.className = 'mo-ripple';
            rippleWrap.appendChild(ripple);
            setTimeout(() => ripple.remove(), 750);
        }

        // 4. Update Combo Streak
        this.comboCount++;
        clearTimeout(this.comboResetTimer);
        this.comboResetTimer = setTimeout(() => {
            this.comboCount = 0;
            this.updateComboDisplay();
        }, 3600);
        this.updateComboDisplay();

        // 5. Calculate Gains based on Combo & Scripture
        let comboBonus = 1.0;
        if (this.comboCount >= 100) comboBonus = 3.0;
        else if (this.comboCount >= 50) comboBonus = 2.0;
        else if (this.comboCount >= 30) comboBonus = 1.5;
        else if (this.comboCount >= 10) comboBonus = 1.2;

        // Disciples stationed at Chanting Duty provide passive multipliers
        let chantingPower = 1.0;
        const disciples = this.state?.disciples || [];
        for (const d of disciples) {
            if (d.assignment === 'chanting') {
                chantingPower += 0.25;
            }
        }

        let baseDao = 8 * comboBonus * chantingPower;
        let baseMerit = 4 * comboBonus;
        let baseIncense = 1;

        if (this.selectedScripture === 'daohanh') {
            baseDao *= 1.5;
        } else if (this.selectedScripture === 'tritue') {
            baseDao *= 0.8;
            this.tickResearchProgress(2.5 * comboBonus);
        } else if (this.selectedScripture === 'congduc') {
            baseMerit *= 2.0;
        } else if (this.selectedScripture === 'tamcanh') {
            if (this.state && this.state.monastery) {
                this.state.monastery.tam_canh = Math.min(999, this.state.monastery.tam_canh + 0.1);
            }
        }

        baseDao = Math.round(baseDao);
        baseMerit = Math.round(baseMerit);

        if (this.state && this.state.monastery) {
            const m = this.state.monastery;
            m.dao_hanh = Math.min(m.dao_hanh_max, m.dao_hanh + baseDao);
            m.cong_duc += baseMerit;
            m.incense = Math.min(m.storage_max || 2000, m.incense + baseIncense);
        }

        // 6. Spawn Floating Text & Mantras
        const mantras = [
            'Nam Mô A Di Đà Phật',
            'Bát Nhã Ba La Mật Đa',
            'Án Ma Ni Bát Mê Hồng',
            'Minh Tâm Kiến Tính',
            'Bồ Đề Thường Tịch',
            'Vạn Pháp Quy Tâm',
            'Khổ Tận Cam Lai',
            'Phúc Huệ Song Tu'
        ];
        const randomMantra = mantras[Math.floor(Math.random() * mantras.length)];
        this.spawnFloatingText(`+${baseDao} Đạo Hạnh ✨ <br><span style="font-size:12px; color:#fbbf24;">${randomMantra}</span>`);

        // 7. Increment 108 Mala Beads Counter
        this.beadCount++;
        if (this.beadCount >= 108) {
            this.beadCount = 0;
            this.malaCycles++;
            this.triggerFullMalaCompletion();
        }
        this.updateMalaDisplay();

        // 8. Refresh Cultivation & Resources UI
        this.renderAbbotCultivation();
        this.renderHeaderAndResources();
    }

    triggerFullMalaCompletion() {
        this.audio.playSingingBowl();
        const bonusDao = 500;
        const bonusMerit = 250;

        if (this.state && this.state.monastery) {
            const m = this.state.monastery;
            m.dao_hanh = Math.min(m.dao_hanh_max, m.dao_hanh + bonusDao);
            m.cong_duc += bonusMerit;
        }

        this.spawnFloatingText(`🪷 VIÊN MÃN 1 TRÀNG 108 HẠT!<br>+${bonusDao} Đạo Hạnh | +${bonusMerit} Công Đức!`, true);
        this.showToast(`🎉 Đại Khai Ngộ! Bạn đã viên mãn tràng thứ ${this.malaCycles} (+${bonusDao} Đạo Hạnh)!`);
    }

    updateMalaDisplay() {
        const beadEl = document.getElementById('bead-count');
        const fillEl = document.getElementById('mala-fill');
        const cycleEl = document.getElementById('mala-cycle-count');

        if (beadEl) beadEl.textContent = this.beadCount;
        if (cycleEl) cycleEl.textContent = this.malaCycles;
        if (fillEl) {
            const pct = Math.round((this.beadCount / 108) * 100);
            fillEl.style.width = `${pct}%`;
        }
    }

    updateComboDisplay() {
        const countEl = document.getElementById('combo-count');
        const titleEl = document.getElementById('combo-title');
        const multEl = document.getElementById('combo-mult');

        if (countEl) countEl.textContent = `x${this.comboCount}`;

        let title = 'Thanh Tịnh Tâm';
        let mult = '+0% Exp';

        if (this.comboCount >= 100) {
            title = '🌟 Đại Khai Ngộ — Vạn Pháp Viên Dung';
            mult = '+200% Exp';
        } else if (this.comboCount >= 50) {
            title = '🔥 Nhất Tâm Bất Loạn';
            mult = '+100% Exp';
        } else if (this.comboCount >= 30) {
            title = '✨ An Định Bồ Đề';
            mult = '+50% Exp';
        } else if (this.comboCount >= 10) {
            title = '📿 Tĩnh Lự Nhất Niệm';
            mult = '+20% Exp';
        }

        if (titleEl) titleEl.textContent = title;
        if (multEl) multEl.textContent = mult;
    }

    spawnFloatingText(html, isSpecial = false) {
        const container = document.getElementById('floatingTextContainer');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'floating-mantra';
        el.innerHTML = html;
        if (isSpecial) {
            el.style.fontSize = '18px';
            el.style.color = '#fef08a';
            el.style.textShadow = '0 0 15px #f59e0b, 0 0 30px #f59e0b';
        }

        // Slight random horizontal offset
        const offsetX = (Math.random() - 0.5) * 60;
        el.style.marginLeft = `${offsetX}px`;

        container.appendChild(el);
        setTimeout(() => el.remove(), 1100);
    }

    toggleAutoChant() {
        this.isAutoChanting = !this.isAutoChanting;
        const btn = document.getElementById('toggleAutoChant');
        if (btn) {
            btn.classList.toggle('active', this.isAutoChanting);
        }

        if (this.isAutoChanting) {
            this.showToast('📿 Đã bật Tự Động Thỉnh Mõ liên tục!');
            this.autoChantInterval = setInterval(() => {
                this.strikeWoodenFish(true);
            }, 900);
        } else {
            this.showToast('Đã dừng Tự Động Thỉnh Mõ.');
            clearInterval(this.autoChantInterval);
            this.autoChantInterval = null;
        }
    }

    tickResearchProgress(points) {
        if (!this.state || !this.state.researches) return;
        const activeRes = this.state.researches.find(r => r.is_completed === 0);
        if (activeRes) {
            activeRes.progress += points;
            if (activeRes.progress >= activeRes.target_points) {
                activeRes.is_completed = 1;
                this.audio.playSingingBowl();
                this.showToast('📜 Tàng Kinh Các đã đốn ngộ hoàn thành một pháp môn mới!');
                this.renderCanons();
            }
        }
    }

    // ======================================================================
    // BREAKTHROUGH & CULTIVATION REALMS
    // ======================================================================
    handleBreakthrough() {
        if (!this.state || !this.state.monastery) return;
        const m = this.state.monastery;
        if (m.dao_hanh < m.dao_hanh_max) {
            this.showToast('⚠️ Đạo Hạnh chưa tích lũy đầy đủ để đột phá!');
            return;
        }

        const realms = [
            'Sơ Học', 'Nhập Môn', 'Tĩnh Tâm', 'Tu Tập',
            'Minh Tâm', 'Quán Chiếu', 'Tỉnh Ngộ', 'Thâm Nhập', 'Viên Mãn'
        ];

        if (m.realm_level < 9) {
            m.realm_level++;
            m.realm_title = realms[m.realm_level - 1];
            m.dao_hanh = 0;
            m.dao_hanh_max = Math.round(m.dao_hanh_max * 2.2);
            m.tam_canh += 25;
            m.tri_tue += 20;
            m.cong_duc += 100;

            this.audio.playTempleBell();
            this.showToast(`🎉 ĐẠI TRIỆT ĐẠI NGỘ! Trụ trì đã đột phá cảnh giới: ${m.realm_title}!`);
            this.renderAll();
        } else {
            this.showToast('🪷 Công Đức Vô Lượng! Đã đạt cảnh giới tối cao Viên Mãn!');
        }
    }

    // ======================================================================
    // STATE LOAD, SAVE & FALLBACK
    // ======================================================================
    async loadState() {
        const userId = localStorage.getItem('vanphap_user_id') || 'monk_' + Math.floor(Math.random() * 10000);
        localStorage.setItem('vanphap_user_id', userId);

        try {
            const resp = await fetch(`/api/vanphap/state?userId=${userId}`);
            if (resp.ok) {
                const data = await resp.json();
                if (data.success) {
                    this.state = data;
                    this.onStateLoaded();
                    return;
                }
            }
        } catch (e) {
            console.warn('Backend unavailable, running in offline zen mode:', e);
        }

        this.initLocalFallbackState(userId);
    }

    initLocalFallbackState(userId) {
        const saved = localStorage.getItem('vanphap_save_' + userId);
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                this.onStateLoaded();
                return;
            } catch (e) {}
        }

        this.state = {
            monastery: {
                id: 'local_monastery',
                name: 'Trúc Lâm Thiền Tự',
                abbot_name: 'Thiền Sư Pháp Trí',
                motto: 'Vạn Pháp Quy Tâm - Bồ Đề Thường Tịch',
                realm_level: 1,
                realm_title: 'Sơ Học',
                dao_hanh: 0,
                dao_hanh_max: 100,
                tam_canh: 30,
                tri_tue: 25,
                cong_duc: 50,
                reputation: 100,
                wood: 400,
                stone: 300,
                herbs: 150,
                food: 400,
                incense: 80,
                coins: 800,
                storage_max: 2500,
                last_sync_time: Date.now()
            },
            buildings: [
                { building_key: 'chinh_dien', name: 'Đại Hùng Bảo Điện', level: 1 },
                { building_key: 'tam_quan', name: 'Tam Quan Sơn Môn', level: 1 },
                { building_key: 'tang_kinh_cac', name: 'Tàng Kinh Các', level: 1 },
                { building_key: 'thien_duong', name: 'Thiền Đường', level: 1 },
                { building_key: 'thap_kinh', name: 'Tháp Xá Lợi', level: 1 },
                { building_key: 'ho_sen', name: 'Hồ Sen Tịnh Tâm', level: 1 },
                { building_key: 'cay_bo_de', name: 'Cây Bồ Đề Linh Thụ', level: 1 },
                { building_key: 'vuon_thuoc', name: 'Vườn Nam Dược', level: 1 },
                { building_key: 'nha_khach', name: 'Nhà Khách Thập Phương', level: 1 },
                { building_key: 'trai_duong', name: 'Trai Đường & Bếp', level: 1 }
            ],
            disciples: [
                { id: 'd1', name: 'Đại Đệ Tử Tuệ Minh', talent_grade: 'Ưu tú', talent_type: 'chanting', realm_level: 1, dao_hanh: 20, dao_hanh_max: 80, assignment: 'chanting', origin: 'Thư sinh đất kinh kỳ' },
                { id: 'd2', name: 'Nhị Đệ Tử Diệu Hạnh', talent_grade: 'Khá', talent_type: 'garden', realm_level: 1, dao_hanh: 10, dao_hanh_max: 60, assignment: 'farm', origin: 'Nông nữ lương thiện' },
                { id: 'd3', name: 'Tam Đệ Tử Chân Quang', talent_grade: 'Trác tuyệt', talent_type: 'research', realm_level: 1, dao_hanh: 15, dao_hanh_max: 100, assignment: 'research', origin: 'Học sĩ phương Nam' }
            ],
            researches: [
                { canon_key: 'ks_bat_nha', progress: 30, target_points: 100, is_completed: 0 }
            ],
            templates: {
                buildings: {
                    chinh_dien: { name: 'Đại Hùng Bảo Điện', desc: 'Trung tâm sơn môn, nơi an vị kim thân chư Phật và tổ chức các thời khóa tụng niệm.', baseWood: 150, baseStone: 100 },
                    tam_quan: { name: 'Tam Quan Sơn Môn', desc: 'Cửa thiền khai mở, thu hút thiện nam tín nữ thập phương đến cúng dường chiêm bái.', baseWood: 120, baseStone: 80 },
                    tang_kinh_cac: { name: 'Tàng Kinh Các', desc: 'Lưu giữ kinh điển tam tạng, sách cổ, nơi đệ tử nghiên cứu mở khóa pháp môn.', baseWood: 200, baseStone: 150 },
                    thien_duong: { name: 'Thiền Đường', desc: 'Không gian tĩnh mịch giúp chư tăng an định tâm thức, tăng tốc độ đả tọa tu hành.', baseWood: 140, baseStone: 90 },
                    thap_kinh: { name: 'Tháp Xá Lợi Cổ Tự', desc: 'Nơi lưu giữ linh cốt tiền nhân, tỏa linh khí trấn an toàn bộ sơn môn đạo tràng.', baseWood: 250, baseStone: 220 },
                    ho_sen: { name: 'Hồ Sen Tịnh Tâm', desc: 'Nuôi dưỡng cá chép, hoa sen nở rộ, thanh lọc trược khí và tăng trưởng công đức.', baseWood: 100, baseStone: 130 },
                    cay_bo_de: { name: 'Cây Bồ Đề Linh Thụ', desc: 'Cội nguồn giác ngộ, ban phước lành và ngộ tính cho toàn thể tăng chúng.', baseWood: 80, baseStone: 60 },
                    vuon_thuoc: { name: 'Vườn Nam Dược', desc: 'Trồng các loại thảo dược quý như sâm đất, linh chi, hoa cúc để dưỡng sinh.', baseWood: 110, baseStone: 70 },
                    nha_khach: { name: 'Nhà Khách Thập Phương', desc: 'Tiếp đón tăng chúng du phương và tín chủ ghé thăm, gia tăng ngân lượng cúng dường.', baseWood: 130, baseStone: 90 },
                    trai_duong: { name: 'Trai Đường & Bếp', desc: 'Cung cấp cơm chay thanh đạm, bồi bổ sinh lực cho đệ tử bền bỉ tinh tấn.', baseWood: 120, baseStone: 80 }
                },
                canons: {
                    ks_bat_nha: { cat: 'kinh_sach', name: 'Bát Nhã Ba La Mật Đa Tâm Kinh', desc: 'Cốt tủy của tuệ giác vô thượng, quán chiếu ngũ uẩn giai không, dứt sạch mọi khổ ách.', points: 100 },
                    ks_kim_cang: { cat: 'kinh_sach', name: 'Kim Cang Bát Nhã Ba La Mật Kinh', desc: 'Phá chấp trừ mê, thấy các tướng chẳng phải tướng tức thấy Như Lai.', points: 250 },
                    ks_phap_hoa: { cat: 'kinh_sach', name: 'Diệu Pháp Liên Hoa Kinh', desc: 'Khai mở tri kiến giác ngộ cho muôn loài, hội tụ vạn pháp về Nhất Thừa.', points: 500 },
                    th_an_ban: { cat: 'thien_hoc', name: 'An Ban Thủ Ý (Quán Niệm Hơi Thở)', desc: 'Phương pháp dõi theo hơi thở vào ra, an tịnh thân tâm, khai mở định lực.', points: 80 },
                    th_tu_niem: { cat: 'thien_hoc', name: 'Tứ Niệm Xứ Thiền Quán', desc: 'Quán thân bất tịnh, quán thọ thị khổ, quán tâm vô thường, quán pháp vô ngã.', points: 200 },
                    dh_duong_sinh: { cat: 'dao_hoc', name: 'Đạo Đức Kinh & Phép Dưỡng Khí', desc: 'Thuận theo tự nhiên, bồi dưỡng chân nguyên, thanh tịnh vô vi diên niên ích thọ.', points: 150 },
                    gl_sa_di: { cat: 'gioi_luat', name: 'Sa Di Luật Nghi & Oai Nghi', desc: 'Gốc rễ của người xuất gia, giữ gìn thân khẩu ý trang nghiêm thanh tịnh.', points: 120 },
                    tr_trung_quan: { cat: 'triet_hoc', name: 'Trung Quán Luận & Tính Không', desc: 'Vượt thoát nhị biên đoạn thường, thấu suốt duyên khởi tính không.', points: 300 },
                    nd_tue_tinh: { cat: 'duoc_hoc', name: 'Nam Dược Thần Hiệu — Tuệ Tĩnh', desc: 'Dùng cây thuốc phương Nam trị bệnh cho người Nam, an thần định phách.', points: 160 },
                    tt_ho_tri: { cat: 'tinh_tam', name: 'Chú Lăng Nghiêm Hộ Trì Sơn Môn', desc: 'Thần chú uy lực xua tan ma chướng, bảo hộ đạo tràng thanh tịnh bất hoại.', points: 350 },
                    ct_dai_viet: { cat: 'co_thu', name: 'Thiền Uyển Tập Anh Cổ Bản', desc: 'Ghi chép hành trạng của các bậc thiền sư tiền bối thời Lý Trần.', points: 220 },
                    kt_doanh_tao: { cat: 'kien_truc', name: 'Mộc Công & Doanh Tạo Sơn Môn', desc: 'Quy thức xây dựng chùa chiền mái cong, cột gỗ lim bền vững trăm năm.', points: 180 },
                    hc_van_phap: { cat: 'hu_cau', name: 'Vạn Pháp Quy Nhất Đại Thừa Quyết', desc: 'Pháp môn cổ xưa dung hội tinh hoa vạn phái, ngộ triệt huyền cơ vũ trụ.', points: 600 }
                }
            }
        };

        this.onStateLoaded();
    }

    onStateLoaded() {
        this.renderAll();
        if (this.state.offlineResult && this.state.offlineResult.reports && this.state.offlineResult.reports.length > 0) {
            this.showOfflineModal(this.state.offlineResult);
        }
    }

    showOfflineModal(result) {
        const modal = document.getElementById('offlineReportModal');
        const list = document.getElementById('offlineReportList');
        if (!modal || !list) return;

        list.innerHTML = result.reports.map(r => `<li style="margin-bottom:8px; line-height:1.5;">🪷 ${r}</li>`).join('');
        modal.classList.add('open');
        this.audio.playSingingBowl();
    }

    closeOfflineModal() {
        const modal = document.getElementById('offlineReportModal');
        if (modal) modal.classList.remove('open');
    }

    renderAll() {
        this.renderHeaderAndResources();
        this.renderAbbotCultivation();
        this.renderDisciples();
        this.renderCanons();
        this.renderBuildings();
        this.renderSelectedBuildingDetails();
        this.renderRealmGrid();
        this.renderChantingDisciples();
    }

    renderHeaderAndResources() {
        if (!this.state || !this.state.monastery) return;
        const m = this.state.monastery;

        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setText('monastery-name-display', m.name);
        setText('abbot-name-header', m.abbot_name);
        setText('abbot-realm-tag', m.realm_title || 'Sơ Học');

        setText('res-wood', Math.floor(m.wood));
        setText('res-stone', Math.floor(m.stone));
        setText('res-herbs', Math.floor(m.herbs));
        setText('res-food', Math.floor(m.food));
        setText('res-incense', Math.floor(m.incense));
        setText('res-coins', Math.floor(m.coins));
        setText('res-merit', Math.floor(m.cong_duc));
        setText('res-reputation', Math.floor(m.reputation));
    }

    renderAbbotCultivation() {
        if (!this.state || !this.state.monastery) return;
        const m = this.state.monastery;

        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        // Chanting Tab Altar Panel
        setText('chant-abbot-name', m.abbot_name);
        setText('chant-abbot-realm', m.realm_title || 'Sơ Học');
        setText('chant-dao-text', `${Math.floor(m.dao_hanh)} / ${m.dao_hanh_max}`);
        const chantFill = document.getElementById('chant-dao-fill');
        if (chantFill) {
            const pct = Math.min(100, Math.round((m.dao_hanh / m.dao_hanh_max) * 100));
            chantFill.style.width = pct + '%';
        }

        // Breakthrough button visibility
        const btBtn = document.getElementById('btnBreakthroughAltar');
        if (btBtn) {
            btBtn.style.display = m.dao_hanh >= m.dao_hanh_max && m.realm_level < 9 ? 'flex' : 'none';
        }

        // Cultivate Tab Panel
        setText('abbot-realm-card', m.realm_title || 'Sơ Học');
        setText('abbot-name-card', m.abbot_name);
        setText('abbot-motto-card', `"${m.motto}"`);

        setText('stat-dao-hanh', `${Math.floor(m.dao_hanh)} / ${m.dao_hanh_max}`);
        setText('stat-tam-canh', Math.floor(m.tam_canh));
        setText('stat-tri-tue', Math.floor(m.tri_tue));
        setText('stat-cong-duc', Math.floor(m.cong_duc));

        const fill = document.getElementById('abbot-dao-fill');
        if (fill) {
            const pct = Math.min(100, Math.round((m.dao_hanh / m.dao_hanh_max) * 100));
            fill.style.width = pct + '%';
        }
    }

    renderRealmGrid() {
        const grid = document.getElementById('realmTierGrid');
        if (!grid || !this.state || !this.state.monastery) return;
        const curLevel = this.state.monastery.realm_level || 1;

        const realms = [
            { lvl: 1, title: '1. Sơ Học', desc: 'Khởi tâm bồ đề, gõ mõ an định thân tâm.' },
            { lvl: 2, title: '2. Nhập Môn', desc: 'Nắm vững quy tắc, định lực sơ khởi.' },
            { lvl: 3, title: '3. Tĩnh Tâm', desc: 'Vọng niệm tiêu tan, thanh tịnh thường lạc.' },
            { lvl: 4, title: '4. Tu Tập', desc: 'Thấu triệt kinh pháp căn bản, đạo nghiệp tinh tấn.' },
            { lvl: 5, title: '5. Minh Tâm', desc: 'Minh tâm kiến tính, trí tuệ quang minh soi tỏ.' },
            { lvl: 6, title: '6. Quán Chiếu', desc: 'Quán chiếu ngũ uẩn giai không, duyên khởi diệt.' },
            { lvl: 7, title: '7. Tỉnh Ngộ', desc: 'Đại triệt đại ngộ, tự tại vô ngại.' },
            { lvl: 8, title: '8. Thâm Nhập', desc: 'Thâm nhập kinh tạng, trí tuệ sâu rộng như hải.' },
            { lvl: 9, title: '9. Viên Mãn', desc: 'Vạn pháp viên dung, đạo hạnh vô lượng cứu độ chúng sinh.' }
        ];

        grid.innerHTML = realms.map(r => {
            const isUnlocked = curLevel >= r.lvl;
            const isCurrent = curLevel === r.lvl;
            return `
                <div class="realm-tier-card ${isUnlocked ? 'unlocked' : ''} ${isCurrent ? 'current' : ''}">
                    <strong style="color:${isUnlocked ? '#fbbf24' : '#94a3b8'}; font-size:13px; display:block; margin-bottom:4px;">
                        ${r.title} ${isUnlocked ? '✓' : '🔒'}
                    </strong>
                    <div style="font-size:11px; color:#cbd5e1; line-height:1.4;">${r.desc}</div>
                </div>
            `;
        }).join('');
    }

    renderChantingDisciples() {
        const list = document.getElementById('chanting-disciples-list');
        if (!list || !this.state) return;

        const chantingDisciples = (this.state.disciples || []).filter(d => d.assignment === 'chanting');
        if (chantingDisciples.length === 0) {
            list.innerHTML = '<span style="color:var(--text-dim);">Chưa có đệ tử trực điện. Phân công đệ tử sẽ gia tăng tốc độ và Exp thỉnh mõ!</span>';
        } else {
            list.innerHTML = chantingDisciples.map(d => `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>📿 ${d.name} (${d.talent_grade})</span>
                    <strong style="color:var(--jade-bright);">+25% Exp</strong>
                </div>
            `).join('');
        }
    }

    renderDisciples() {
        const grid = document.getElementById('disciple-grid');
        if (!grid || !this.state) return;

        const disciples = this.state.disciples || [];
        const countDisplay = document.getElementById('disciple-count-badge');
        if (countDisplay) {
            countDisplay.textContent = `${disciples.length} Đệ Tử`;
        }

        grid.innerHTML = disciples.map(d => {
            const gradeClass = {
                'Phổ thông': 'grade-pho-thong',
                'Khá': 'grade-kha',
                'Ưu tú': 'grade-uu-tu',
                'Trác tuyệt': 'grade-trac-tuyet',
                'Tiên thiên': 'grade-tien-thien'
            }[d.talent_grade] || 'grade-pho-thong';

            return `
                <div class="disciple-card" data-id="${d.id}">
                    <div class="disciple-top">
                        <div class="disciple-avatar">🧘</div>
                        <div>
                            <h4 style="font-family:var(--font-heading); color:var(--gold-bright); font-size:15px;">${d.name}</h4>
                            <span class="disciple-grade-tag ${gradeClass}">${d.talent_grade}</span>
                            <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">${d.origin || 'Thư sinh'}</div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-dim); background:rgba(0,0,0,0.3); padding:6px 10px; border-radius:8px;">
                        <span>Đạo Hạnh: <strong style="color:var(--gold-bright);">${d.dao_hanh}/${d.dao_hanh_max}</strong></span>
                        <span>Cảnh giới: <strong style="color:var(--jade-bright);">Cấp ${d.realm_level}</strong></span>
                    </div>
                    <div>
                        <label style="font-size:11px; color:var(--text-dim); display:block; margin-bottom:4px;">Phân Công Tu Học:</label>
                        <select class="disciple-assign-select" onchange="window.vpApp.changeDiscipleAssignment('${d.id}', this.value)">
                            <option value="chanting" ${d.assignment === 'chanting' ? 'selected' : ''}>📿 Trực Điện Gõ Mõ (+Tốc độ & Exp Thỉnh Mõ)</option>
                            <option value="research" ${d.assignment === 'research' ? 'selected' : ''}>📜 Nghiên Cứu Tàng Kinh (+Tiến độ)</option>
                            <option value="farm" ${d.assignment === 'farm' ? 'selected' : ''}>🌿 Vườn Nam Dược (+Dược liệu)</option>
                            <option value="lumber" ${d.assignment === 'lumber' ? 'selected' : ''}>🌲 Đốn Củi Khai Thạch (+Gỗ & Đá)</option>
                            <option value="hospitality" ${d.assignment === 'hospitality' ? 'selected' : ''}>🍵 Tiếp Đón Thập Phương (+Cúng dường)</option>
                            <option value="meditate" ${d.assignment === 'meditate' ? 'selected' : ''}>🧘 Tọa Thiền Tịnh Tâm (+Đạo Hạnh)</option>
                            <option value="idle" ${d.assignment === 'idle' ? 'selected' : ''}>💤 Nghỉ Ngơi Dưỡng Thần</option>
                        </select>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCanons() {
        const grid = document.getElementById('canon-grid');
        if (!grid || !this.state) return;

        const templates = this.state.templates?.canons || {};
        const researches = this.state.researches || [];
        const resMap = {};
        for (const r of researches) resMap[r.canon_key] = r;

        const filtered = Object.entries(templates).filter(([key, c]) => c.cat === this.activeCategory);

        grid.innerHTML = filtered.map(([key, c]) => {
            const res = resMap[key];
            const isCompleted = res && res.is_completed === 1;
            const progress = res ? res.progress : 0;
            const pct = Math.min(100, Math.round((progress / c.points) * 100));

            return `
                <div class="canon-card ${isCompleted ? 'completed' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="font-family:var(--font-heading); color:var(--gold-bright); font-size:15px;">${c.name}</h4>
                        ${isCompleted ? '<span style="color:var(--jade-bright); font-size:11px; font-weight:800;">✓ Đã Đốn Ngộ</span>' : ''}
                    </div>
                    <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">${c.desc}</p>
                    <div class="vp-progress-wrap">
                        <div class="vp-progress-fill" style="width:${pct}%;"></div>
                        <div class="vp-progress-text">${isCompleted ? 'Viên Mãn 100%' : `${Math.floor(progress)} / ${c.points}`}</div>
                    </div>
                    ${!isCompleted ? `
                        <button class="btn-secondary" style="margin-top:6px;" onclick="window.vpApp.startResearch('${key}')">
                            📖 Khai Mở Nghiên Cứu
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    renderBuildings() {
        const grid = document.getElementById('buildings-grid');
        if (!grid || !this.state) return;

        const templates = this.state.templates?.buildings || {};
        const blds = this.state.buildings || [];
        const bldMap = {};
        for (const b of blds) bldMap[b.building_key] = b;

        grid.innerHTML = Object.entries(templates).map(([key, t]) => {
            const b = bldMap[key] || { level: 1 };
            const costWood = Math.round(t.baseWood * Math.pow(1.35, b.level - 1));
            const costStone = Math.round(t.baseStone * Math.pow(1.35, b.level - 1));

            return `
                <div class="building-card">
                    <div class="bld-header">
                        <h4 class="bld-name">${t.name}</h4>
                        <span class="bld-level-badge">Cấp ${b.level}</span>
                    </div>
                    <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; min-height:36px;">${t.desc}</p>
                    <div style="font-size:11px; color:var(--text-dim); background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:8px;">
                        <div>Chi phí trùng tu: 🪵 ${costWood} | 🪨 ${costStone}</div>
                    </div>
                    <button class="btn-zen" style="margin-top:6px; padding:8px 14px; font-size:12px;" onclick="window.vpApp.upgradeBuilding('${key}')">
                        🔨 Trùng Tu Nâng Cấp
                    </button>
                </div>
            `;
        }).join('');
    }

    renderSelectedBuildingDetails() {
        const box = document.getElementById('campus-selected-building');
        if (!box || !this.state) return;

        const key = this.selectedBuildingKey;
        const template = this.state.templates?.buildings?.[key] || { name: 'Công Trình Tự Viện', desc: 'Nơi đại chúng tu tập.' };
        const bld = (this.state.buildings || []).find(b => b.building_key === key) || { level: 1 };

        box.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h4 style="color:var(--gold-bright); font-size:16px; font-family:var(--font-heading);">${template.name}</h4>
                <span class="bld-level-badge">Cấp ${bld.level}</span>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${template.desc}</p>
            <button class="btn-zen" style="width:100%; margin-top:12px; padding:10px;" onclick="window.vpApp.upgradeBuilding('${key}')">
                🔨 Trùng Tu Lên Cấp ${bld.level + 1}
            </button>
        `;
    }

    // ======================================================================
    // ACTIONS & HANDLERS
    // ======================================================================
    async handleAbbotMeditate() {
        this.strikeWoodenFish(false);
    }

    async handleRecruitDisciple() {
        this.audio.playSingingBowl();
        const names = [
            'Tuệ Quang', 'Minh An', 'Diệu Âm', 'Chân Tịnh', 'Pháp Đăng',
            'Bảo Tích', 'Từ Mẫn', 'Viên Thông', 'Thiện Trí', 'Thanh Tịnh'
        ];
        const origins = ['Thư sinh Kinh Bắc', 'Nông phu xứ Đoài', 'Dược đồng Nam Sơn', 'Thương gia thức tỉnh', 'Học sĩ phương Nam'];
        const grades = ['Phổ thông', 'Khá', 'Ưu tú', 'Trác tuyệt'];
        const randomGrade = grades[Math.floor(Math.random() * grades.length)];
        const randomName = 'Đệ Tử ' + names[Math.floor(Math.random() * names.length)];
        const randomOrigin = origins[Math.floor(Math.random() * origins.length)];

        const newDisciple = {
            id: 'disciple_' + Date.now(),
            name: randomName,
            talent_grade: randomGrade,
            talent_type: 'chanting',
            realm_level: 1,
            dao_hanh: 0,
            dao_hanh_max: 60,
            assignment: 'chanting',
            origin: randomOrigin
        };

        if (!this.state.disciples) this.state.disciples = [];
        this.state.disciples.push(newDisciple);
        this.showToast(`🪷 Đạo hữu ${newDisciple.name} (${newDisciple.talent_grade}) đã phát tâm xuất gia nhập môn!`);
        this.renderAll();
    }

    changeDiscipleAssignment(discipleId, assignment) {
        const d = (this.state.disciples || []).find(x => x.id === discipleId);
        if (d) {
            d.assignment = assignment;
            this.showToast(`Đã phân công ${d.name} công việc mới.`);
            this.renderChantingDisciples();
        }
    }

    upgradeBuilding(buildingKey) {
        const b = (this.state.buildings || []).find(x => x.building_key === buildingKey);
        const t = this.state.templates?.buildings?.[buildingKey];
        if (!b || !t) return;

        const costWood = Math.round(t.baseWood * Math.pow(1.35, b.level - 1));
        const costStone = Math.round(t.baseStone * Math.pow(1.35, b.level - 1));

        const m = this.state.monastery;
        if (m.wood < costWood || m.stone < costStone) {
            this.showToast(`⚠️ Chưa đủ tài nguyên! Cần 🪵 ${costWood} Gỗ và 🪨 ${costStone} Đá.`);
            return;
        }

        m.wood -= costWood;
        m.stone -= costStone;
        b.level++;
        this.audio.playTempleBell();
        this.showToast(`🔨 Đã trùng tu thành công ${t.name} lên Cấp ${b.level}!`);
        this.renderAll();
    }

    startResearch(canonKey) {
        const c = this.state.templates?.canons?.[canonKey];
        if (!c) return;

        if (!this.state.researches) this.state.researches = [];
        let r = this.state.researches.find(x => x.canon_key === canonKey);
        if (!r) {
            r = { canon_key: canonKey, progress: 0, target_points: c.points, is_completed: 0 };
            this.state.researches.push(r);
        }

        this.audio.playSingingBowl();
        this.showToast(`📜 Bắt đầu khai mở nghiên cứu: ${c.name}!`);
        this.renderCanons();
    }

    async loadLeaderboard(type = 'reputation') {
        const body = document.getElementById('lb-table-body');
        if (!body) return;
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-dim);">Đang thỉnh bảng vàng online...</td></tr>';

        try {
            const resp = await fetch(`/api/vanphap/leaderboard?type=${type}`);
            if (resp.ok) {
                const data = await resp.json();
                if (data.success && data.rows && data.rows.length > 0) {
                    body.innerHTML = data.rows.map((row, idx) => `
                        <tr>
                            <td style="font-weight:900; color:${idx === 0 ? '#fbbf24' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#d97706' : '#94a3b8'};">
                                ${idx === 0 ? '👑 #1' : `#${idx + 1}`}
                            </td>
                            <td>
                                <strong style="color:#fff;">${row.name || row.monastery_name || 'Đạo Tràng'}</strong>
                                <div style="font-size:11px; color:var(--text-dim);">Trụ trì: ${row.abbot_name || 'Vô danh'}</div>
                            </td>
                            <td>
                                <span class="abbot-realm-tag">${row.realm_title || 'Sơ Học'}</span>
                            </td>
                            <td>
                                <strong style="color:var(--gold-bright);">${row.reputation || row.dao_hanh || row.cong_duc || 0}</strong>
                            </td>
                            <td>
                                <button class="btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.vpApp.openVisitModal('${row.id}')">
                                    🏯 Viếng Thăm
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    return;
                }
            }
        } catch (e) {}

        // Fallback local leaderboards
        const mockMonasteries = [
            { name: 'Vạn Hạnh Thiền Viện', abbot: 'Đại Sư Thích Trí Quang', realm: 'Viên Mãn', score: '99,500' },
            { name: 'Trúc Lâm Yên Tử Tự', abbot: 'Thiền Sư Pháp Loa', realm: 'Thâm Nhập', score: '78,200' },
            { name: 'Chùa Hương Tích Sơn', abbot: 'Đại Đức Viên Minh', realm: 'Tỉnh Ngộ', score: '56,400' },
            { name: 'Giác Lâm Cổ Tự', abbot: 'Thiền Sư Minh Đăng', realm: 'Quán Chiếu', score: '42,100' },
            { name: 'Phổ Minh Cổ Viện', abbot: 'Đại Sư Huyền Không', realm: 'Minh Tâm', score: '28,900' }
        ];

        body.innerHTML = mockMonasteries.map((m, idx) => `
            <tr>
                <td style="font-weight:900; color:${idx === 0 ? '#fbbf24' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#d97706' : '#94a3b8'};">
                    ${idx === 0 ? '👑 #1' : `#${idx + 1}`}
                </td>
                <td>
                    <strong style="color:#fff;">${m.name}</strong>
                    <div style="font-size:11px; color:var(--text-dim);">Trụ trì: ${m.abbot}</div>
                </td>
                <td>
                    <span class="abbot-realm-tag">${m.realm}</span>
                </td>
                <td>
                    <strong style="color:var(--gold-bright);">${m.score}</strong>
                </td>
                <td>
                    <button class="btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.vpApp.openVisitModal('mock_${idx}')">
                        🏯 Viếng Thăm
                    </button>
                </td>
            </tr>
        `).join('');
    }

    openVisitModal(monasteryId) {
        const modal = document.getElementById('visitMonasteryModal');
        const content = document.getElementById('visitMonasteryContent');
        if (!modal || !content) return;

        content.innerHTML = `
            <div style="text-align:center; margin-bottom:16px;">
                <h3 style="color:var(--gold-bright); font-size:22px; font-family:var(--font-heading);">VẠN HẠNH THIỀN VIỆN</h3>
                <div style="font-size:12px; color:var(--text-dim);">Trụ trì: <strong style="color:#fff;">Đại Sư Thích Trí Quang</strong> (Cảnh giới: Viên Mãn)</div>
                <p style="font-style:italic; font-size:12px; color:var(--text-secondary); margin-top:6px;">"Trúc biếc hoa vàng đâu ngoại pháp - Mây bay nước chảy lộ thiền tâm"</p>
            </div>
            <div style="background:rgba(0,0,0,0.3); padding:14px; border-radius:12px; margin-bottom:16px;">
                <h4 style="font-size:13px; color:var(--jade-bright); margin-bottom:8px;">👥 Đại Đệ Tử Ưu Tú:</h4>
                <div style="font-size:12px; margin-bottom:4px;">🪷 Đại Đệ Tử Huyền Quang (Tiên thiên) - Cảnh giới Cấp 8</div>
                <div style="font-size:12px; margin-bottom:4px;">🪷 Nhị Đệ Tử Tuệ Tĩnh (Trác tuyệt) - Cảnh giới Cấp 7</div>
            </div>
            <div style="display:flex; gap:10px;">
                <input type="text" id="blessing-input" placeholder="Gửi lời chúc thiện lành..." style="flex:1; background:rgba(0,0,0,0.5); border:1.5px solid var(--border-gold-subtle); padding:10px; border-radius:8px; color:#fff;" value="Nguyện cầu sơn môn hưng thịnh, đạo nghiệp tinh tấn cát tường!">
                <button class="btn-zen" onclick="window.vpApp.sendBlessing()">🪔 Thắp Hương</button>
            </div>
        `;
        modal.classList.add('open');
    }

    sendBlessing() {
        this.audio.playTempleBell();
        this.showToast('🪔 Đã thắp hương cầu an và gửi lời chúc thành công (+10 Công Đức)!');
        if (this.state && this.state.monastery) {
            this.state.monastery.cong_duc += 10;
            this.renderHeaderAndResources();
        }
        this.closeVisitModal();
    }

    closeVisitModal() {
        const modal = document.getElementById('visitMonasteryModal');
        if (modal) modal.classList.remove('open');
    }

    // Passive Tick Loop (Every 1s)
    tick() {
        if (!this.state || !this.state.monastery) return;
        const m = this.state.monastery;

        // Auto resource passive generation
        m.food = Math.min(m.storage_max || 2500, m.food + 0.35);
        m.herbs = Math.min(m.storage_max || 2500, m.herbs + 0.25);
        m.wood = Math.min(m.storage_max || 2500, m.wood + 0.2);
        m.stone = Math.min(m.storage_max || 2500, m.stone + 0.15);
        m.coins += 0.3;

        // Active research tick
        const activeRes = (this.state.researches || []).find(r => r.is_completed === 0);
        if (activeRes) {
            let power = 0.5;
            for (const d of (this.state.disciples || [])) {
                if (d.assignment === 'research') power += 1.2;
            }
            activeRes.progress += power;
            if (activeRes.progress >= activeRes.target_points) {
                activeRes.is_completed = 1;
                this.audio.playSingingBowl();
                this.showToast('📜 Tàng Kinh Các đã đốn ngộ hoàn thành một pháp môn mới!');
                this.renderCanons();
            }
        }

        this.renderHeaderAndResources();
    }

    syncServerState() {
        if (!this.state || !this.state.monastery) return;
        const userId = localStorage.getItem('vanphap_user_id');
        localStorage.setItem('vanphap_save_' + userId, JSON.stringify(this.state));
    }

    showToast(msg) {
        const box = document.getElementById('vp-toast-box');
        if (!box) return;
        const toast = document.createElement('div');
        toast.className = 'vp-toast';
        toast.innerHTML = msg;
        box.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.vpApp = new VanPhapGame();
});
