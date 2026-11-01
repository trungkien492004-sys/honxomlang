const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// ==========================================================================
// VẠN PHÁP ĐẠO TRÀNG — CORE ENGINE, PROCEDURAL AUDIO & VISUAL CANVAS
// Pure Vanilla JavaScript — Zero External Dependencies
// ==========================================================================

// 1. ZEN PROCEDURAL AUDIO ENGINE (Realistic Web Audio API)
class ZenAudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.channels = {
            bell: true,
            woodfish: true,
            wind: true,
            birds: true,
            water: true
        };
        this.ambientInterval = null;
        this.startAmbientSoundscape();
    }

    toggleChannel(name, isChecked) {
        if (this.channels.hasOwnProperty(name)) {
            this.channels[name] = isChecked;
        }
    }

    startAmbientSoundscape() {
        // Procedural ambient sounds triggered every 5-10s
        setInterval(() => {
            if (!this.enabled || !this.ctx) return;
            const hour = new Date().getHours();
            // Daytime: birds chirping & breeze
            if (hour >= 5 && hour < 18) {
                if (this.channels.birds && Math.random() < 0.45) this.synthesizeBirdChirp();
                if (this.channels.wind && Math.random() < 0.35) this.synthesizeWindBreeze();
            } else {
                // Nighttime: gentle wind and deep temple bell
                if (this.channels.wind && Math.random() < 0.45) this.synthesizeWindBreeze();
                if (this.channels.bell && Math.random() < 0.2) this.playTempleBell();
            }
        }, 6000);
    }

    synthesizeBirdChirp() {
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const baseFreq = 2600 + Math.random() * 800;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(baseFreq + 200, now + 0.16);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (_) {}
    }

    synthesizeWindBreeze() {
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.linearRampToValueAtTime(140, now + 1.2);
            osc.frequency.linearRampToValueAtTime(70, now + 2.5);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.025, now + 1.0);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 2.5);
        } catch (_) {}
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

// ======================================================================
// GĐ2: HỆ THỐNG NPC TỰ ĐỘNG TRONG SÂN CHÙA (TEMPLE NPC FSM & SCHEDULE)
// ======================================================================
const NPC_ARCHETYPES = [
    {
        type: 'elder',
        names: ['Cụ Tư (Làng Dưới)', 'Cụ Cần (Thôn Đoài)', 'Cụ Bà Từ Tâm'],
        avatar: '👴',
        role: 'Cầu an sức khỏe gia đạo',
        bubble: '🙏',
        targetKeys: ['chinh_dien', 'cay_bo_de'],
        robeColor: '#78350f',
        timeSlots: ['morning', 'afternoon', 'evening'],
        actionText: 'Quỳ chắp tay cầu an',
        speeches: [
            'Tuổi đã xế chiều, chỉ mong gia đạo bình an, con cháu thuận hòa hiếu nghĩa. Đến chốn thiền môn hít thở một làn khói trầm thấy lòng thanh tịnh biết bao.',
            'Cả đời bôn ba xuôi ngược, nay đến trước Phật đài mới hiểu được hai chữ buông xả. Thân này mạnh khỏe một ngày là phước một ngày.'
        ],
        blessedSpeech: 'A Di Đà Phật! Đa tạ Đạo Tràng đã mở lòng cầu phúc. Chúc sơn môn luôn thanh tịnh cát tường!'
    },
    {
        type: 'student',
        names: ['Thanh Tú (Sĩ Tử)', 'Minh Hà (Học Sinh)', 'Tuấn Anh (Kỳ Thi Sắp Tới)'],
        avatar: '👧',
        role: 'Cầu thi cử đỗ đạt & định tâm',
        bubble: '📖',
        targetKeys: ['tang_kinh_cac', 'chinh_dien'],
        robeColor: '#0284c7',
        timeSlots: ['morning', 'afternoon', 'evening'],
        actionText: 'Đọc sách & chắp tay khấn nguyện',
        speeches: [
            'Kỳ thi sắp tới nhiều áp lực và âu lo... Con đến đây thắp một nén hương xin nương nhờ cửa Phật tìm lấy một chữ Tịnh, buông bớt sợ hãi để dốc lòng đèn sách.',
            'Con không dám cầu may mắn vô cớ, chỉ mong giữ được tâm trí sáng suốt, kiên trì học hỏi và vượt qua được chính sự yếu đuối của mình.'
        ],
        blessedSpeech: 'Đa tạ lời chúc thiện lành của Đạo Tràng! Tâm trí con đã nhẹ nhõm hơn nhiều, con sẽ cố gắng hết mình.'
    },
    {
        type: 'sleeper',
        names: ['Anh Ba An Lạc', 'Bác Nghỉ Chân', 'Khách Lữ Hành'],
        avatar: '😴',
        role: 'Tìm chốn an giấc nghỉ chân',
        bubble: '💤',
        targetKeys: ['cay_bo_de', 'nha_khach'],
        robeColor: '#64748b',
        timeSlots: ['afternoon', 'morning', 'night'],
        actionText: 'Tựa lưng chợp mắt thanh thản',
        speeches: [
            'Ngoài đời cơm áo gạo tiền mệt nhoài, gió cuốn bụi bay. Dưới bóng mát cội Bồ Đề này mát lành quá, xin cho con nương nhờ một giấc ngủ an yên chốn thiền môn.',
            'Nghe tiếng chuông chùa điểm nhịp thong dong, bao nhiêu muộn phiền tự nhiên rơi rụng hết. Chợp mắt một lát thôi mà thấy tâm an tự tại.'
        ],
        blessedSpeech: 'Cảm tạ quý thầy đã không xua đuổi kẻ mệt mỏi này. Một giấc ngủ chốn từ bi quý hơn vạn lượng vàng bạc.'
    },
    {
        type: 'animal_rescuer',
        names: ['Bác Tám Lành', 'Cô Út Thiện Duyên', 'Anh Tư Phóng Sinh'],
        avatar: '🐓',
        role: 'Mang gà xin quy y Tam Bảo',
        bubble: '✨',
        targetKeys: ['ho_sen', 'vuon_thuoc'],
        robeColor: '#15803d',
        timeSlots: ['morning', 'afternoon'],
        actionText: 'Bế chú gà vuốt ve từ bi',
        speeches: [
            'Chú gà này con chuộc lại từ chợ lúc người ta sắp làm thịt. Con mang lên đây xin cửa chùa từ bi cho nó được nương tựa bóng Phật, sớm thoát kiếp súc sinh.',
            'Muôn loài đều ham sống sợ chết... Nhìn ánh mắt nó sợ hãi con không đành lòng. Xin Tam Bảo từ bi chứng giám cho một mầm sống nhỏ nhoi.'
        ],
        blessedSpeech: 'Lành thay! Có lời kinh chúc phúc của quý đạo tràng, chú gà này đã được kết duyên lành với Phật pháp rồi.'
    },
    {
        type: 'merchant',
        names: ['Bá Hộ Trí', 'Cô Bảy Tạp Hóa', 'Thương Nhân Thành Phố'],
        avatar: '🧰',
        role: 'Cầu hướng thiện & buôn bán chân thật',
        bubble: '🪔',
        targetKeys: ['chinh_dien', 'trai_duong'],
        robeColor: '#b45309',
        timeSlots: ['morning', 'afternoon', 'evening'],
        actionText: 'Thắp hương cầu nguyện buôn bán chân chính',
        speeches: [
            'Buôn bán thương trường nhiều lúc toan tính trăn trở. Con lên chùa để tự soi lại mình, cầu xin giữ được cái tâm trong sạch, bán buôn chân thật không lừa dối người.',
            'Lộc kiếm được con xin trích một phần cúng dường đèn dầu, giúp đỡ người cơ nhỡ. Mong cho việc làm ăn thuận hòa, tạo phước cho đời.'
        ],
        blessedSpeech: 'Mô Phật! Lời dạy của Đạo Tràng là kim chỉ nam cho con giữ vững đạo đức trong kinh doanh.'
    },
    {
        type: 'gardener',
        names: ['Bác Nam Dược', 'Bé Sen Trồng Hoa', 'Đạo Hữu Làm Vườn'],
        avatar: '🧺',
        role: 'Chăm sóc cỏ cây & vườn thuốc',
        bubble: '🌿',
        targetKeys: ['vuon_thuoc', 'ho_sen'],
        robeColor: '#059669',
        timeSlots: ['morning', 'afternoon'],
        actionText: 'Tưới nước chăm sóc vườn thuốc',
        speeches: [
            'Cỏ cây nơi cửa Phật cũng mang linh khí thanh sạch. Con xin góp chút sức mọn tưới luống nam dược này, mong khi có người ốm đau có thang thuốc lành cứu giúp.',
            'Nhìn búp sen nở giữa bùn nhơ mà không nhuốm mùi bùn, con thấy đạo lý Phật dạy ở ngay nơi từng cành hoa ngọn cỏ.'
        ],
        blessedSpeech: 'Công đức vô lượng! Cỏ cây hoa lá như cũng đang tươi vui cùng câu niệm Phật an lành.'
    },
    {
        type: 'midnight_guest',
        names: ['Bạch Y Nhân', 'Tịnh Nguyệt Cô', 'Khách Dạ Hành'],
        avatar: '🤍',
        role: 'Khách áo trắng nửa đêm ngắm trăng',
        bubble: '🌙',
        targetKeys: ['ho_sen', 'thap_kinh'],
        robeColor: '#f8fafc',
        timeSlots: ['night', 'evening'],
        actionText: 'Đứng tĩnh lặng ngắm trăng đáy nước',
        speeches: [
            'Đêm khuya thanh vắng, chuông chùa buông từng hồi... Bấy lâu nay mải miết chạy theo ảo mộng nhân gian, chỉ có nửa đêm thanh tịnh này mới nhìn thấu tự tâm.',
            'Trăng dưới đáy hồ vỡ rồi lại tròn. Đời người thịnh suy được mất cũng như ánh trăng kia thôi. Lòng con nay đã nhẹ như làn gió thoảng.'
        ],
        blessedSpeech: 'Đa tạ tiếng chuông và câu niệm Phật đã soi sáng lối đi trong đêm tối. Con xin khắc ghi vào tâm khảm.'
    },
    {
        type: 'spirit',
        names: ['Hương Linh Vô Danh', 'Thiện Hồn Nương Bóng', 'U Minh Hương Linh'],
        avatar: '✨',
        role: 'Hương linh xin tụng kinh siêu độ',
        bubble: '📿',
        targetKeys: ['thap_kinh', 'chinh_dien'],
        robeColor: 'rgba(147, 197, 253, 0.75)',
        timeSlots: ['night'],
        actionText: 'Chắp tay cúi lạy lắng nghe kinh chú',
        speeches: [
            'Con phiêu bạt chốn u minh lạnh lẽo đã lâu... Nghe tiếng kinh Đại Bi và tiếng mõ ấm áp của Đạo Tràng, con tìm về đây xin nương tựa một ánh quang minh.',
            'Không nhà không cửa, chỉ mong được một lời chú vãng sinh để rũ bỏ hết oán kết ái trược nơi trần thế, sớm ngày siêu sinh tịnh cảnh.'
        ],
        blessedSpeech: 'Nam Mô A Di Đà Phật! Nhờ ánh sáng từ bi vô lượng của Đạo Tràng, tâm con đã bớt lạnh lẽo, hận thù tiêu tan. Con xin bái tạ để theo ánh quang minh siêu thoát!'
    }
];

class TempleNPCManager {
    constructor(visualizer) {
        this.vis = visualizer;
        this.npcs = [];
        this.maxNpcs = 12; // Ràng buộc cứng: tối đa ~12 NPC trên sân
        this.nextSpawnTime = 0;
        this.selectedNpcId = null;
        this.hoveredNpcId = null;

        // Khởi tạo một số NPC ban đầu phù hợp với giờ máy khách
        this.initInitialNpcs();
    }

    getCurrentTimeSlot() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { slot: 'morning', label: '🌅 Thanh Sáng (05h-12h)' };
        if (hour >= 12 && hour < 18) return { slot: 'afternoon', label: '☀️ Nhật Trung (12h-18h)' };
        if (hour >= 18 && hour < 22) return { slot: 'evening', label: '🌆 Hoàng Hôn (18h-22h)' };
        return { slot: 'night', label: '🌙 Dạ Thiền (22h-05h)' };
    }

    initInitialNpcs() {
        const currentSlot = this.getCurrentTimeSlot().slot;
        const available = NPC_ARCHETYPES.filter(a => a.timeSlots.includes(currentSlot));
        const count = Math.min(6, available.length);

        for (let i = 0; i < count; i++) {
            const arch = available[i % available.length];
            this.spawnNpc(arch, true);
        }
    }

    spawnNpc(archetype, isImmediate = false) {
        if (this.npcs.length >= this.maxNpcs) return;

        const w = this.vis.canvas.width || 800;
        const h = this.vis.canvas.height || 500;
        const blds = this.vis.getBuildingLayout();

        // Chọn công trình mục tiêu
        const targetKey = archetype.targetKeys[Math.floor(Math.random() * archetype.targetKeys.length)];
        const targetBld = blds.find(b => b.key === targetKey) || blds[0];

        // Tam Quan Sơn Môn toạ độ xuất phát
        const spawnX = w * 0.5 + (Math.random() - 0.5) * 40;
        const spawnY = h * 0.86;

        // Vị trí mục tiêu (quanh công trình, lệch nhẹ tự nhiên)
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDist = targetBld.radius * 0.6 + Math.random() * 12;
        const destX = targetBld.cx + Math.cos(offsetAngle) * offsetDist;
        const destY = targetBld.cy + Math.sin(offsetAngle) * offsetDist;

        const name = archetype.names[Math.floor(Math.random() * archetype.names.length)];
        const speech = archetype.speeches[Math.floor(Math.random() * archetype.speeches.length)];

        const npc = {
            id: 'npc_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name: name,
            avatar: archetype.avatar,
            role: archetype.role,
            bubble: archetype.bubble,
            robeColor: archetype.robeColor,
            actionText: archetype.actionText,
            speech: speech,
            blessedSpeech: archetype.blessedSpeech,
            targetBuildingKey: targetKey,
            targetBuildingName: targetBld.label,
            speed: 0.35 + Math.random() * 0.25,
            x: isImmediate ? destX : spawnX,
            y: isImmediate ? destY : spawnY,
            targetX: destX,
            targetY: destY,
            state: isImmediate ? 'ACTION' : 'WALKING',
            actionDuration: 25 + Math.random() * 25, // 25s - 50s
            actionTimer: isImmediate ? (15 + Math.random() * 20) : 0,
            hasBlessed: false,
            phase: Math.random() * Math.PI * 2
        };

        this.npcs.push(npc);
    }

    update() {
        const now = Date.now();
        const w = this.vis.canvas.width || 800;
        const h = this.vis.canvas.height || 500;
        const blds = this.vis.getBuildingLayout();

        // 1. Kiểm tra sinh thêm NPC theo lịch đồng hồ máy khách
        if (now > this.nextSpawnTime && this.npcs.length < 8) {
            this.nextSpawnTime = now + 8000 + Math.random() * 7000; // mỗi 8-15s xem xét sinh 1 khách
            const currentSlot = this.getCurrentTimeSlot().slot;
            const available = NPC_ARCHETYPES.filter(a => a.timeSlots.includes(currentSlot));
            if (available.length > 0) {
                const arch = available[Math.floor(Math.random() * available.length)];
                this.spawnNpc(arch, false);
            }
        }

        // 2. Cập nhật máy trạng thái từng NPC
        for (let i = this.npcs.length - 1; i >= 0; i--) {
            const npc = this.npcs[i];
            npc.phase += 0.05;

            if (npc.state === 'WALKING') {
                const dx = npc.targetX - npc.x;
                const dy = npc.targetY - npc.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 4) {
                    npc.state = 'ACTION';
                    npc.actionTimer = npc.actionDuration;
                } else {
                    npc.x += (dx / dist) * npc.speed;
                    npc.y += (dy / dist) * npc.speed;
                }
            } else if (npc.state === 'ACTION') {
                npc.actionTimer -= 0.016; // ~60fps
                if (npc.actionTimer <= 0) {
                    // Xong việc, bắt đầu rời bước về Tam Quan
                    npc.state = 'LEAVING';
                    npc.targetX = w * 0.5 + (Math.random() - 0.5) * 30;
                    npc.targetY = h * 0.90;
                }
            } else if (npc.state === 'TALKING') {
                // Tạm dừng khi đang đối thoại với người chơi
            } else if (npc.state === 'LEAVING') {
                const dx = npc.targetX - npc.x;
                const dy = npc.targetY - npc.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 6) {
                    // Đã về đến cổng Tam Quan, rời khỏi sơn môn
                    this.npcs.splice(i, 1);
                } else {
                    npc.x += (dx / dist) * (npc.speed * 0.9);
                    npc.y += (dy / dist) * (npc.speed * 0.9);
                }
            }
        }
    }

    render(ctx, w, h) {
        for (const npc of this.npcs) {
            const isHover = this.hoveredNpcId === npc.id;
            const isSelected = this.selectedNpcId === npc.id;

            ctx.save();
            ctx.translate(npc.x, npc.y);

            // 1. Vòng hào quang nếu hover/selected
            if (isHover || isSelected) {
                ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.4)' : 'rgba(251, 191, 36, 0.2)';
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // 2. Bóng đổ mềm mại trên sân chùa
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.ellipse(0, 5, 8, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 3. Thân người phong cách thủy mặc
            ctx.fillStyle = npc.robeColor;
            ctx.beginPath();
            ctx.arc(0, -6, 5, 0, Math.PI * 2); // Đầu
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-5, 4);
            ctx.lineTo(0, -3);
            ctx.lineTo(5, 4);
            ctx.closePath();
            ctx.fill(); // Thân áo

            // 4. Biểu tượng Avatar/Emoji trên đầu
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(npc.avatar, 0, -14);

            // 5. Bong bóng trạng thái bập bùng nhẹ khi đang ACTION
            if (npc.state === 'ACTION') {
                const bobY = Math.sin(npc.phase * 2) * 2.5;
                ctx.font = '12px sans-serif';
                ctx.fillText(npc.bubble, 9, -24 + bobY);
            }

            // 6. Tên NPC hiển thị nhỏ phía dưới khi hover hoặc selected
            if (isHover || isSelected) {
                ctx.font = 'bold 10px sans-serif';
                ctx.fillStyle = '#fef08a';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, 0, 16);
            }

            ctx.restore();
        }
    }

    checkHover(mx, my) {
        let found = null;
        for (const npc of this.npcs) {
            const dist = Math.hypot(mx - npc.x, my - npc.y);
            if (dist < 20) {
                found = npc.id;
                break;
            }
        }
        this.hoveredNpcId = found;
        return found !== null;
    }

    checkClick(mx, my) {
        for (const npc of this.npcs) {
            const dist = Math.hypot(mx - npc.x, my - npc.y);
            if (dist < 22) {
                this.selectedNpcId = npc.id;
                npc.state = 'TALKING';
                return npc;
            }
        }
        return null;
    }
}

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

        this.npcManager = new TempleNPCManager(this);
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

            // Check NPC hover first
            if (this.npcManager && this.npcManager.checkHover(x, y)) {
                this.canvas.style.cursor = 'pointer';
                this.hoveredBuildingKey = null;
                return;
            }

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

            // Check NPC click first
            if (this.npcManager) {
                const clickedNpc = this.npcManager.checkClick(x, y);
                if (clickedNpc) {
                    if (window.vpApp && typeof window.vpApp.openNpcModal === 'function') {
                        window.vpApp.openNpcModal(clickedNpc.id);
                    }
                    return;
                }
            }

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

        // 6. Draw Architectural Pavilions (Buildings with Pagoda Eaves)
        const blds = this.getBuildingLayout();
        for (const b of blds) {
            const isHover = this.hoveredBuildingKey === b.key;
            const isSelected = this.selectedBuildingKey === b.key;

            ctx.save();
            ctx.translate(b.cx, b.cy);

            // Radiant Halo glow for hovered/selected
            if (isSelected || isHover) {
                const glowR = b.radius + (isSelected ? 14 : 8);
                const glowGrad = ctx.createRadialGradient(0, 0, b.radius * 0.4, 0, 0, glowR);
                glowGrad.addColorStop(0, isSelected ? 'rgba(251, 191, 36, 0.35)' : 'rgba(251, 191, 36, 0.18)');
                glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(0, 0, glowR, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = isSelected ? '#fbbf24' : 'rgba(251, 191, 36, 0.7)';
                ctx.lineWidth = isSelected ? 2.5 : 1.5;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.arc(0, 0, b.radius + 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Foundation Terrace (Bệ đá hoa cương)
            const baseW = b.radius * 1.5;
            const baseH = b.radius * 0.45;
            ctx.fillStyle = 'rgba(26, 12, 9, 0.94)';
            ctx.strokeStyle = isSelected ? '#fbbf24' : 'rgba(197, 155, 39, 0.6)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.ellipse(0, b.radius * 0.45, baseW * 0.5, baseH * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Sanctum Wall & Warm Glowing Entrance (Cửa điện ánh hoàng kim)
            const wallW = b.radius * 0.9;
            const wallH = b.radius * 0.6;
            ctx.fillStyle = '#220e0a';
            ctx.fillRect(-wallW * 0.5, -wallH * 0.3, wallW, wallH);

            const doorGrad = ctx.createLinearGradient(0, wallH * 0.3, 0, -wallH * 0.1);
            doorGrad.addColorStop(0, 'rgba(251, 191, 36, 0.75)');
            doorGrad.addColorStop(1, 'rgba(217, 119, 6, 0.25)');
            ctx.fillStyle = doorGrad;
            ctx.fillRect(-wallW * 0.25, -wallH * 0.1, wallW * 0.5, wallH * 0.45);

            // Classical Curved Pagoda Roof (Mái ngói âm dương cong vút)
            const roofW = b.radius * 1.6;
            const roofTopW = b.radius * 0.5;
            const roofH = b.radius * 0.5;
            const roofGrad = ctx.createLinearGradient(0, -b.radius * 0.6, 0, 0);
            roofGrad.addColorStop(0, '#991b1b');
            roofGrad.addColorStop(0.6, '#6b1414');
            roofGrad.addColorStop(1, '#3a0c0c');

            ctx.fillStyle = roofGrad;
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-roofW * 0.5, 0);
            // Upturned left eave (Đao mái cong trái)
            ctx.quadraticCurveTo(-roofW * 0.35, -roofH * 0.2, -roofTopW * 0.5, -roofH);
            // Roof crest ridge (Bờ nóc)
            ctx.lineTo(roofTopW * 0.5, -roofH);
            // Upturned right eave (Đao mái cong phải)
            ctx.quadraticCurveTo(roofW * 0.35, -roofH * 0.2, roofW * 0.5, 0);
            // Roof bottom line with slight swoop
            ctx.quadraticCurveTo(0, -roofH * 0.1, -roofW * 0.5, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Golden Spire on top (Hồ lô / Bảo châu thếp vàng)
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, -roofH - 4, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Lacquer Calligraphy Plaque (Biển tên Hoành phi sơn son thếp vàng)
            const plaqueW = b.radius * 1.3;
            const plaqueH = 18;
            const plaqueY = b.radius * 0.62;
            ctx.fillStyle = 'rgba(15, 6, 4, 0.95)';
            ctx.strokeStyle = isSelected ? '#fbbf24' : 'rgba(197, 155, 39, 0.7)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(-plaqueW * 0.5, plaqueY - plaqueH * 0.5, plaqueW, plaqueH, 4);
            ctx.fill();
            ctx.stroke();

            // Plaque Gold Text
            ctx.font = 'bold 10.5px serif';
            ctx.fillStyle = isSelected ? '#fef08a' : '#fffaf0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.label, 0, plaqueY);

            ctx.restore();
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

        // 8. Stage 2 NPCs in Courtyard
        if (this.npcManager) {
            this.npcManager.update();
            this.npcManager.render(ctx, w, h);
        }
    }
}


// ======================================================================
// GĐ3: THIÊN CƠ CHIẾU TRIỆU / PHẬT DUYÊN HIỂN HIỆN (LỰA CHỌN & ĐÁNH ĐỔI)
// ======================================================================
const AFFINITY_EVENTS = [
    {
        id: 'repentance_sinner',
        title: 'Kẻ Lầm Lỡ Xin Quy Y',
        visitor: 'Cư sĩ sám hối từ phương xa',
        description: 'Một người từng lầm đường lạc lối tích tụ nhiều tiền tài phi nghĩa, nay tâm thần hoảng loạn mang theo túi vàng 500 lượng đến trước cổng chùa dập đầu xin chuộc tội và quy y Tam Bảo. Dân làng quanh vùng có người xôn xao đòi đuổi đi.',
        choices: [
            {
                key: 'refuse_money_work',
                title: 'A. Từ Bi Thâu Nhận - Trả Lại Tiền Phi Nghĩa',
                desc: 'Từ chối nhận số vàng, yêu cầu người này đem phân phát hoàn trả lại cho những người từng bị hại; chùa chỉ tiếp nhận làm cư sĩ công quả chẻ củi gánh nước tịnh hóa nghiệp duyên.',
                tradeoffs: [
                    { text: '+25 Đạo Hạnh', type: 'pos' },
                    { text: '+20 Công Đức', type: 'pos' },
                    { text: '+15 Danh Vọng', type: 'pos' },
                    { text: '+0 Ngân Lượng', type: 'neu' }
                ],
                effects: { dao_hanh: 25, cong_duc: 20, reputation: 15, coins: 0 },
                outcomeMessage: 'Chân thật sám hối hơn vạn túi vàng. Dân làng thấy đạo tràng chánh trực, muôn người kính phục ngợi ca.'
            },
            {
                key: 'accept_charity_fund',
                title: 'B. Phương Tiện Thiện Xảo - Lập Quỹ Phát Chẩn',
                desc: 'Chấp nhận số vàng nhập vào quỹ thiện nguyện của chùa để mua lương thực phát chẩn cho dân nghèo cơ nhỡ trong vùng, cho người này quỳ tụng kinh sám hối mỗi đêm.',
                tradeoffs: [
                    { text: '+500 Ngân Lượng', type: 'pos' },
                    { text: '+300 Lương Thực', type: 'pos' },
                    { text: '+25 Công Đức', type: 'pos' },
                    { text: '-10 Đạo Hạnh (Bị dị nghị)', type: 'neg' }
                ],
                effects: { coins: 500, food: 300, cong_duc: 25, dao_hanh: -10 },
                outcomeMessage: 'Lương thực được phát chẩn cứu đói nhiều mảnh đời, dẫu có lời dị nghị nhưng công đức cứu mạng người là chân thật.'
            },
            {
                key: 'refer_remote_hermitage',
                title: 'C. Chỉ Đường Sang Am Thất Ẩn Tu',
                desc: 'Khuyên người này đến một am tự hẻo lánh trên đỉnh núi cao để chuyên tâm sám hối tịnh tu một thời gian, tránh sự dòm ngó hiềm khích của dân làng.',
                tradeoffs: [
                    { text: '+10 Đạo Hạnh', type: 'pos' },
                    { text: '+5 Danh Vọng', type: 'pos' },
                    { text: 'Giữ yên sơn môn', type: 'neu' }
                ],
                effects: { dao_hanh: 10, reputation: 5 },
                outcomeMessage: 'Cư sĩ mang theo lời dặn bước lên đường núi. Sơn môn giữ được sự thanh tịnh thường hằng.'
            }
        ]
    },
    {
        id: 'exclusive_ritual',
        title: 'Phú Thương Cầu Tụng Kinh Riêng',
        visitor: 'Đại Phú Thương Thẩm Vạn Tài',
        description: 'Một đại thương gia giàu có từ kinh thành đến, muốn cúng dường 600 lượng bạc để bao trọn Đại Hùng Điện tụng kinh cầu tài lộc riêng cho gia tộc trong 3 ngày, yêu cầu đóng cửa chùa không cho bá tánh nghèo khó vào lễ Phật.',
        choices: [
            {
                key: 'equality_open',
                title: 'A. Bình Đẳng Nhất Như - Cửa Phật Không Phân Giàu Nghèo',
                desc: 'Khước từ yêu cầu bao riêng điện thờ. Trụ trì giải thích cửa Phật từ bi bình đẳng, mời phú thương cùng vào lễ bái chung mâm chung chiếu với dân nghèo.',
                tradeoffs: [
                    { text: '+35 Đạo Hạnh', type: 'pos' },
                    { text: '+25 Danh Vọng', type: 'pos' },
                    { text: '-600 Bạc bỏ lỡ', type: 'neg' }
                ],
                effects: { dao_hanh: 35, reputation: 25, coins: 0 },
                outcomeMessage: 'Phú thương ban đầu ngỡ ngàng, sau kính phục cái tâm ngay thẳng của quý sư. Dân chúng xúc động đồng thanh tán thán.'
            },
            {
                key: 'partial_renovation',
                title: 'B. Phương Tiện Cúng Dường - Tu Bổ Tàng Kinh Các',
                desc: 'Chỉ nhận một phần cúng dường để in ấn kinh sách, bố trí đàn tràng phụ tại góc Thiền Đường vào sáng sớm tinh mơ trước khi mở cửa đón dân chúng.',
                tradeoffs: [
                    { text: '+300 Ngân Lượng', type: 'pos' },
                    { text: '+150 Điểm Kinh Sách', type: 'pos' },
                    { text: '+10 Đạo Hạnh', type: 'pos' }
                ],
                effects: { coins: 300, dao_hanh: 10, reputation: 10 },
                outcomeMessage: 'Tàng Kinh Các có thêm kinh phí bảo tồn cổ thư, đại chúng vẫn được vào chùa lễ Phật bình thường.'
            },
            {
                key: 'convert_to_alms',
                title: 'C. Khuyên Phú Thương Phát Gạo Cho Dân Nghèo',
                desc: 'Khuyên thương gia dùng số bạc ấy mua 500 thạch gạo phát trực tiếp cho bá tánh ngay trước cổng Tam Quan, tăng chúng sẽ đồng tụng kinh Dược Sư hồi hướng.',
                tradeoffs: [
                    { text: '+35 Công Đức', type: 'pos' },
                    { text: '+20 Danh Vọng', type: 'pos' },
                    { text: '+200 Lương Thực', type: 'pos' }
                ],
                effects: { cong_duc: 35, reputation: 20, food: 200 },
                outcomeMessage: 'Dân làng rộn rã nhận gạo ấm lòng. Phú thương lần đầu cảm nhận được niềm hoan hỷ tột cùng của sự bố thí.'
            }
        ]
    },
    {
        id: 'plague_outbreak',
        title: 'Nạn Dịch Thôn Dưới & Mở Kho Thuốc',
        visitor: 'Trưởng thôn cùng đại diện dân làng',
        description: 'Dưới chân núi đang bùng phát dịch chướng khí mùa mưa, nhiều gia đình nghèo ốm liệt giường không tiền mua thuốc. Dân làng cử người lên chùa cầu xin cứu tế thảo dược và lương thực khẩn cấp.',
        choices: [
            {
                key: 'open_all_herbs',
                title: 'A. Dốc Hết Kho Thuốc - Xuống Núi Cứu Bệnh',
                desc: 'Xuất toàn bộ thảo dược dự trữ và xuất lương thực mở trại phát chẩn dưới chân núi. Cử đệ tử y quán ngày đêm sắc thuốc cứu người.',
                tradeoffs: [
                    { text: '+50 Công Đức', type: 'pos' },
                    { text: '+35 Danh Vọng', type: 'pos' },
                    { text: '-200 Dược Liệu', type: 'neg' },
                    { text: '-250 Lương Thực', type: 'neg' }
                ],
                effects: { cong_duc: 50, reputation: 35, herbs: -200, food: -250 },
                outcomeMessage: 'Cứu sống hàng trăm mạng người qua cơn nguy kịch. Cả vùng tôn vinh Vạn Pháp Đạo Tràng là chốn từ bi cứu khổ cứu nạn.'
            },
            {
                key: 'measured_remedy',
                title: 'B. Phân Bổ Có Định Lượng - Truyền Dạy Bài Thuốc Dân Gian',
                desc: 'Trích một phần dược liệu cấp cho các ca nguy kịch, đồng thời hướng dẫn dân làng cách hái và sắc các cây cỏ quanh vườn tự điều trị.',
                tradeoffs: [
                    { text: '+25 Đạo Hạnh', type: 'pos' },
                    { text: '+25 Công Đức', type: 'pos' },
                    { text: '-80 Dược Liệu', type: 'neg' }
                ],
                effects: { dao_hanh: 25, cong_duc: 25, herbs: -80 },
                outcomeMessage: 'Dịch bệnh dần được khống chế, bà con lại học thêm được nhiều bài thuốc dân gian hữu ích để tự bảo vệ sức khỏe.'
            },
            {
                key: 'spiritual_prayer_only',
                title: 'C. Giữ Kho Dự Trữ - Lập Đàn Trì Chú Cầu An',
                desc: 'Giữ kho dược liệu cho các đệ tử nghiên cứu nội môn, chỉ phát nước thiêng tịnh thủy và lập đàn tụng kinh Dược Sư tiêu trừ tật bệnh.',
                tradeoffs: [
                    { text: '+15 Đạo Hạnh', type: 'pos' },
                    { text: '-15 Danh Vọng (Dân thất vọng)', type: 'neg' },
                    { text: 'Bảo toàn tài nguyên', type: 'neu' }
                ],
                effects: { dao_hanh: 15, reputation: -15 },
                outcomeMessage: 'Tiếng chuông kinh xoa dịu phần nào nỗi sợ hãi, nhưng dân làng vẫn gặp nhiều gian nan vì thiếu thốn thuốc men thực tế.'
            }
        ]
    },
    {
        id: 'ancient_relic',
        title: 'Bảo Vật Ngọc Phật Ngàn Năm',
        visitor: 'Một người thợ săn ngọc núi sâu',
        description: 'Người này tìm thấy một pho tượng Phật ngọc cổ linh thiêng từ nghìn năm trước trong hang đá sâu, muốn hiến tặng cho chùa nhưng đặt điều kiện chùa phải ghi tên mình lên bảng vàng Hộ Pháp muôn đời và cấp bạc lộ phí hậu hĩnh.',
        choices: [
            {
                key: 'enshrine_with_precepts',
                title: 'A. Cung Nghinh Tôn Tượng - Khuyên Giữ Giới Hộ Pháp',
                desc: 'Chấp thuận tôn trí tượng ngọc tại Chính Điện cho thập phương chiêm bái, chi một khoản lộ phí vừa phải và ân cần giảng giải: Người Hộ Pháp phải giữ năm giới thanh tịnh mới được phước báu lâu dài.',
                tradeoffs: [
                    { text: '+40 Danh Vọng Sơn Môn', type: 'pos' },
                    { text: '+25 Đạo Hạnh', type: 'pos' },
                    { text: '-150 Ngân Lượng (Lộ phí)', type: 'neg' }
                ],
                effects: { reputation: 40, dao_hanh: 25, coins: -150 },
                outcomeMessage: 'Ánh ngọc Phật tỏa sáng uy nghiêm tại Đại Hùng Điện, thập phương nghe tin đổ về chiêm bái nườm nượp.'
            },
            {
                key: 'public_museum',
                title: 'B. Khuyên Hiến Tặng Bảo Tàng Quốc Gia',
                desc: 'Khuyên người này dâng tặng bảo vật cho triều đình bảo tồn lưu truyền muôn đời, tránh việc kẻ gian dòm ngó chùa chiền trộm cắp gây kinh động chốn tu hành.',
                tradeoffs: [
                    { text: '+25 Đạo Hạnh', type: 'pos' },
                    { text: '+15 Công Đức', type: 'pos' },
                    { text: 'Tránh họa trộm cướp', type: 'neu' }
                ],
                effects: { dao_hanh: 25, cong_duc: 15 },
                outcomeMessage: 'Bảo vật được quốc gia trân trọng gìn giữ, sơn môn giữ tròn sự giản dị thanh bần thanh tịnh.'
            }
        ]
    },
    {
        id: 'monk_filial_piety',
        title: 'Đệ Tử Trẻ Xin Xả Giới Nuôi Mẹ Già',
        visitor: 'Đệ tử Thiện Tâm',
        description: 'Đệ tử Thiện Tâm xuất gia đã 5 năm, tinh tấn tu tập. Nay nhận tin mẹ già chốn quê nhà lâm bệnh hiểm nghèo không ai chăm sóc, quỳ trước phương trượng rơi lệ xin xả giới hoàn tục để làm tròn chữ hiếu.',
        choices: [
            {
                key: 'honor_filial_piety',
                title: 'A. Hiếu Đạo Là Gốc - Hoan Hỷ Thuận Tình Xuất Môn',
                desc: 'Ân cần xoa đầu đệ tử, trao tặng ngân lượng và dược liệu của chùa làm hành trang về quê phụng dưỡng mẹ già, dặn dò: "Hiếu hạnh là Phật hạnh, ở tại gia giữ tâm thanh tịnh cũng là tu."',
                tradeoffs: [
                    { text: '+30 Đạo Hạnh (Thấu triệt lý vô thường)', type: 'pos' },
                    { text: '+25 Công Đức', type: 'pos' },
                    { text: '-100 Ngân Lượng', type: 'neg' },
                    { text: '-50 Dược Liệu', type: 'neg' }
                ],
                effects: { dao_hanh: 30, cong_duc: 25, coins: -100, herbs: -50 },
                outcomeMessage: 'Thiện Tâm đẫm lệ bái tạ sư phụ. Cả chùa rưng rưng xúc động trước lòng từ bi và chữ Hiếu thiêng liêng.'
            },
            {
                key: 'bring_mother_to_temple',
                title: 'B. Đón Mẹ Lên Chùa - Vừa Tu Học Vừa Phụng Dưỡng',
                desc: 'Mời người mẹ lên tĩnh dưỡng tại hiên Nhà Khách của chùa, xuất kho thuốc chữa trị. Cho phép Thiện Tâm mỗi ngày vừa tu tập vừa hầu hạ sắc thuốc cho mẹ.',
                tradeoffs: [
                    { text: '+30 Danh Vọng Tình Nghĩa', type: 'pos' },
                    { text: '+20 Đạo Hạnh', type: 'pos' },
                    { text: '-150 Lương Thực', type: 'neg' },
                    { text: '-80 Dược Liệu', type: 'neg' }
                ],
                effects: { reputation: 30, dao_hanh: 20, food: -150, herbs: -80 },
                outcomeMessage: 'Người mẹ được chữa lành trong tình thương của thiền môn, Thiện Tâm giữ tròn chí nguyện xuất trần phụng sự đạo pháp.'
            }
        ]
    },
    {
        id: 'disaster_refugees',
        title: 'Nạn Dân Mất Mùa Tìm Về Nương Tựa',
        visitor: 'Đoàn nạn dân tha phương',
        description: 'Vùng châu thổ hạn hán mất mùa, hàng chục gia đình dắt díu con thơ kéo lên núi nương tựa bóng chùa xin chén cháo qua ngày. Kho lương của sơn môn còn hạn chế cho kỳ giáp hạt.',
        choices: [
            {
                key: 'open_granary_refugees',
                title: 'A. Mở Cửa Trai Đường - Cùng Ăn Cháo Rau Vượt Khó',
                desc: 'Chấp nhận chia sẻ toàn bộ gạo muối trong kho, tăng chúng tự nguyện ăn cháo loãng mỗi ngày để nhường cơm cho trẻ nhỏ và người già tị nạn.',
                tradeoffs: [
                    { text: '+45 Công Đức', type: 'pos' },
                    { text: '+30 Danh Vọng', type: 'pos' },
                    { text: '+20 Đạo Hạnh', type: 'pos' },
                    { text: '-300 Lương Thực', type: 'neg' }
                ],
                effects: { cong_duc: 45, reputation: 30, dao_hanh: 20, food: -300 },
                outcomeMessage: 'Dưới mái chùa ấm áp, những đứa trẻ được no lòng. Tình thương thiền môn sưởi ấm muôn vàn phận đời khốn khó.'
            },
            {
                key: 'work_for_food',
                title: 'B. Lập Xưởng Trồng Trọt & Khai Hoang Vườn Thuốc',
                desc: 'Cấp lương thực vừa đủ, đồng thời hướng dẫn bà con cùng tăng chúng khai khẩn sườn đồi trồng trọt hoa màu, nam dược để cùng tự lực cánh sinh.',
                tradeoffs: [
                    { text: '+25 Công Đức', type: 'pos' },
                    { text: '+15 Đạo Hạnh', type: 'pos' },
                    { text: '+150 Dược Liệu Tương Lai', type: 'pos' },
                    { text: '-120 Lương Thực', type: 'neg' }
                ],
                effects: { cong_duc: 25, dao_hanh: 15, herbs: 150, food: -120 },
                outcomeMessage: 'Sườn đồi hoang sớm phủ màu xanh mướt mát. Bà con có công ăn việc làm lương thiện, cuộc sống dần ấm no tự tại.'
            }
        ]
    }
];


// ======================================================================
// GĐ4: PHÒNG TU HÀNH ONLINE (ONLINE ZEN ROOM MANAGER)
// ======================================================================
class ZenOnlineRoomManager {
    constructor(game) {
        this.game = game;
        this.currentRoomId = 'tructam_01';
        this.currentRoomName = 'Thiền Viện Trúc Lâm (Phòng #1)';
        this.unsubscribe = null;
        this.myAction = '🧘 Tọa thiền';
        this.heartbeatTimer = null;
        this.lastMyChantTime = 0;
        this.lastRoomResonanceTime = 0;

        // Local state fallback / cache
        this.roomData = {
            id: 'tructam_01',
            name: 'Thiền Viện Trúc Lâm (Phòng #1)',
            capacity: 8,
            members: [],
            messages: [
                { from: 'Hệ Thống', text: 'Chào mừng quý đạo hữu đồng tu về với Thiền Đường trực tuyến!', time: Date.now(), isSystem: true }
            ]
        };

        this.initHeartbeat();
    }

    joinRoom(roomId, roomName = null) {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        this.currentRoomId = roomId;
        if (roomName) this.currentRoomName = roomName;

        const nameEl = document.getElementById('zenroom-current-name');
        if (nameEl) nameEl.innerText = this.currentRoomName;

        // Subscribe to Firestore room document with capped read
        const db = this.game.db || window.parent?.firebase?.firestore?.() || (typeof firebase !== 'undefined' ? firebase.firestore?.() : null);
        if (db) {
            try {
                this.unsubscribe = db.collection('vanphap_rooms').doc(roomId).onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        this.roomData.name = data.name || this.currentRoomName;
                        this.roomData.members = Array.isArray(data.members) ? data.members : [];
                        this.roomData.messages = Array.isArray(data.messages) ? data.messages : [];
                        this.renderRoomUI();
                    } else {
                        // Room does not exist yet, initialize it
                        this.syncRoomToCloud(db);
                    }
                }, err => {
                    console.warn('Firestore room snapshot error, using local room:', err);
                });
            } catch (e) {
                console.warn('Cannot listen to firestore room:', e);
            }
        }

        // Add myself locally
        this.updateMyPresence();
        this.renderRoomUI();
    }

    updateMyPresence() {
        const uid = this.game.user?.uid || this.game.identity?.user?.uid || 'guest_' + (localStorage.getItem('vp_guest_id') || 'seed');
        const name = this.game.user?.displayName || this.game.identity?.user?.displayName || (this.game.state?.monastery?.abbot_name || 'Đạo Hữu');
        const avatar = '🧘';

        const now = Date.now();
        const existingIdx = this.roomData.members.findIndex(m => m.uid === uid);
        const myPresence = {
            uid,
            name,
            avatar,
            action: this.myAction,
            updatedAt: now,
            isMe: true
        };

        if (existingIdx >= 0) {
            this.roomData.members[existingIdx] = myPresence;
        } else {
            // Keep room capacity <= 8
            if (this.roomData.members.length < 8) {
                this.roomData.members.push(myPresence);
            }
        }

        // Clean stale members (>60s)
        this.roomData.members = this.roomData.members.filter(m => (now - m.updatedAt) < 60000 || m.uid === uid);
    }

    initHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.game.selectedTab === 'zenroom') {
                this.updateMyPresence();
                const db = this.game.db || window.parent?.firebase?.firestore?.() || (typeof firebase !== 'undefined' ? firebase.firestore?.() : null);
                if (db) {
                    this.syncRoomToCloud(db);
                } else {
                    this.renderRoomUI();
                }
            }
        }, 8000); // 8s heartbeat throttling to protect Firestore free tier reads/writes
    }

    async syncRoomToCloud(db) {
        if (!db || !this.currentRoomId) return;
        try {
            await db.collection('vanphap_rooms').doc(this.currentRoomId).set({
                id: this.currentRoomId,
                name: this.currentRoomName,
                capacity: 8,
                members: this.roomData.members.map(m => ({
                    uid: m.uid,
                    name: m.name,
                    avatar: m.avatar,
                    action: m.action,
                    updatedAt: m.updatedAt
                })),
                messages: this.roomData.messages.slice(-15),
                lastUpdated: Date.now()
            }, { merge: true });
        } catch (_) {}
    }

    sendAction(type, label) {
        this.myAction = label;
        this.updateMyPresence();

        this.game.audio.playWoodenFish();
        this.game.showToast(`Đã phát tâm hành động: ${label}`);

        // Add system log into chat
        const name = this.game.user?.displayName || (this.game.state?.monastery?.abbot_name || 'Đạo Hữu');
        this.addMessage(name, `vừa thực hiện: ${label}`, true);

        const db = this.game.db || window.parent?.firebase?.firestore?.() || (typeof firebase !== 'undefined' ? firebase.firestore?.() : null);
        if (db) this.syncRoomToCloud(db);
        this.renderRoomUI();
    }

    handleChatSubmit(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('zenroom-chat-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const name = this.game.user?.displayName || (this.game.state?.monastery?.abbot_name || 'Đạo Hữu');
        this.addMessage(name, text, false);
        input.value = '';

        const db = this.game.db || window.parent?.firebase?.firestore?.() || (typeof firebase !== 'undefined' ? firebase.firestore?.() : null);
        if (db) this.syncRoomToCloud(db);
        this.renderRoomUI();
    }

    addMessage(from, text, isSystem = false) {
        this.roomData.messages.push({
            from,
            text,
            time: Date.now(),
            isSystem
        });
        if (this.roomData.messages.length > 20) {
            this.roomData.messages.shift();
        }
    }

    onChant() {
        const now = Date.now();
        this.lastMyChantTime = now;
        this.myAction = '🪵 Gõ mõ tụng kinh';

        // Check if another member is also chanting within 4s -> Golden Resonance
        const otherChanting = this.roomData.members.some(m => !m.isMe && (now - m.updatedAt) < 4500);
        if (otherChanting || this.roomData.members.length > 1) {
            this.triggerResonance();
        }
    }

    triggerResonance() {
        const glow = document.getElementById('zenroom-resonance-glow');
        const label = document.getElementById('zenroom-resonance-label');

        if (glow) {
            glow.classList.add('active');
            setTimeout(() => glow.classList.remove('active'), 2500);
        }
        if (label) {
            label.innerHTML = '🌟 <strong>CỘNG HƯỞNG THIỀN QUANG (+25% CÔNG ĐỨC)!</strong>';
            setTimeout(() => {
                if (label) label.innerText = 'Trầm hương thanh tịnh';
            }, 3000);
        }

        // Tặng thêm +2 Công Đức nhờ cộng hưởng
        if (this.game.state && this.game.state.monastery) {
            this.game.state.monastery.cong_duc += 2;
            this.game.renderHeaderAndResources();
        }
    }

    renderRoomUI() {
        // 1. Capacity Tag
        const capTag = document.getElementById('zenroom-capacity-tag');
        if (capTag) {
            capTag.innerText = `${this.roomData.members.length} / 8 Đạo Hữu`;
        }

        // 2. Seats Grid (8 mats)
        const grid = document.getElementById('zenroom-seats-grid');
        if (grid) {
            const seatsHtml = [];
            for (let i = 0; i < 8; i++) {
                const member = this.roomData.members[i];
                if (member) {
                    seatsHtml.push(`
                        <div class="zenroom-seat-card occupied ${member.isMe ? 'me' : ''}">
                            <div class="zenroom-seat-avatar">${member.avatar || '🧘'}</div>
                            <div class="zenroom-seat-name">${esc(member.name)} ${member.isMe ? '(Bạn)' : ''}</div>
                            <div class="zenroom-seat-action">${esc(member.action || 'Tọa thiền')}</div>
                        </div>
                    `);
                } else {
                    seatsHtml.push(`
                        <div class="zenroom-seat-card" style="opacity:0.45; border-style:dashed;">
                            <div class="zenroom-seat-avatar">🪑</div>
                            <div class="zenroom-seat-name" style="color:var(--text-dim); font-size:11px;">Bồ đoàn #${i + 1}</div>
                            <div class="zenroom-seat-action" style="color:var(--text-dim);">Chờ đạo hữu</div>
                        </div>
                    `);
                }
            }
            grid.innerHTML = seatsHtml.join('');
        }

        // 3. Messages Feed
        const msgContainer = document.getElementById('zenroom-chat-messages');
        if (msgContainer) {
            msgContainer.innerHTML = this.roomData.messages.map(m => `
                <div class="zenroom-chat-msg ${m.isSystem ? 'system' : ''}">
                    <span class="zenroom-chat-author">${esc(m.from)}:</span>
                    <span>${esc(m.text)}</span>
                </div>
            `).join('');
            msgContainer.scrollTop = msgContainer.scrollHeight;
        }
    }

    openRoomListModal() {
        const modal = document.getElementById('zenRoomListModal');
        const listEl = document.getElementById('zenroom-rooms-list');
        if (!modal) return;

        const defaultRooms = [
            { id: 'tructam_01', name: 'Thiền Viện Trúc Lâm (Phòng #1)', count: Math.min(8, this.roomData.members.length) },
            { id: 'tructam_02', name: 'Thiền Viện Trúc Lâm (Phòng #2)', count: 2 },
            { id: 'huongtich_01', name: 'Chùa Hương Tích Sơn (Phòng #1)', count: 4 },
            { id: 'vanhanh_01', name: 'Vạn Hạnh Thiền Tự (Phòng #1)', count: 1 }
        ];

        if (listEl) {
            listEl.innerHTML = defaultRooms.map(r => `
                <div class="visitor-item" style="cursor:pointer;" onclick="window.vpApp.zenRoomManager.selectRoom('${r.id}', '${r.name}')">
                    <div>
                        <strong style="color:var(--gold-bright); font-size:13px;">${esc(r.name)}</strong>
                        <div style="font-size:11px; color:var(--text-dim);">Không gian thanh tịnh • ${r.count}/8 người</div>
                    </div>
                    <button class="btn-zen" style="padding:4px 10px; font-size:11px;">Vào Tu ➔</button>
                </div>
            `).join('');
        }
        modal.classList.add('open');
    }

    closeRoomListModal() {
        const modal = document.getElementById('zenRoomListModal');
        if (modal) modal.classList.remove('open');
    }

    selectRoom(roomId, roomName) {
        this.closeRoomListModal();
        this.joinRoom(roomId, roomName);
        this.game.showToast(`Đã chuyển đến: ${roomName}`);
    }

    createCustomRoom() {
        const name = prompt('Nhập tên phòng tự viện mới:', 'Tịnh Xá Yên Bình');
        if (!name) return;
        const newId = 'room_' + Date.now().toString(36);
        this.closeRoomListModal();
        this.joinRoom(newId, name);
        this.game.showToast(`Đã tạo và bước vào: ${name}`);
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
        this.zenRoomManager = new ZenOnlineRoomManager(this);

        // Stage 3: Buddha Affinity Event State
        this.pendingAffinityEvent = null;
        this.affinityCooldownTimer = 25; // 25s sau khi vào game sẽ kích hoạt sự kiện đầu tiên

        // Auth & Cloud state
        this.user = null;
        this.db = null;
        this.identity = null;
        this.cloudSaveDebounce = null;
        this.isSavingCloud = false;

        // Chanting Feature State
        this.beadCount = 0;
        this.malaCycles = 0;
        this.comboCount = 0;
        this.comboResetTimer = null;
        this.isAutoChanting = false;
        this.autoChantInterval = null;
        this.selectedScripture = 'daohanh';

        this.initAuth();
        this.initDOM();
        this.loadState();
    }

    initAuth() {
        this.identity = window.parent?.siteIdentity || window.siteIdentity || null;
        try {
            this.db = window.parent?.firebase?.firestore?.() || (typeof firebase !== 'undefined' ? firebase.firestore?.() : null);
        } catch (_) {
            this.db = null;
        }

        const loginBtn = document.getElementById('btnZenGoogleLogin');
        if (loginBtn) {
            loginBtn.onclick = async () => {
                const id = this.identity || window.parent?.siteIdentity || window.siteIdentity;
                if (id?.login) {
                    loginBtn.disabled = true;
                    loginBtn.textContent = 'Đang gọi...';
                    try {
                        await id.login();
                    } catch (e) {
                        this.showToast('⚠️ Đăng nhập Google: ' + (e.message || 'Thất bại'));
                    } finally {
                        loginBtn.disabled = false;
                        loginBtn.textContent = '🔑 Đăng nhập Google';
                    }
                } else {
                    this.showToast('⚠️ Tính năng đăng nhập Google chưa sẵn sàng.');
                }
            };
        }

        if (this.identity && typeof this.identity.subscribe === 'function') {
            this.identity.subscribe(user => this.onAuthChange(user));
        } else if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(user => this.onAuthChange(user));
        }
    }

    onAuthChange(user) {
        this.user = user || null;
        try {
            if (!this.db) {
                this.db = window.parent?.firebase?.firestore?.() || (typeof firebase !== 'undefined' ? firebase.firestore?.() : null);
            }
        } catch (_) {}

        const statusIcon = document.getElementById('vp-auth-status-icon');
        const userNameEl = document.getElementById('vp-auth-user-name');
        const loginBtn = document.getElementById('btnZenGoogleLogin');

        if (user) {
            if (statusIcon) statusIcon.textContent = '🟢';
            if (userNameEl) userNameEl.textContent = (user.displayName || 'Đạo Hữu') + ' (Mây)';
            if (loginBtn) loginBtn.style.display = 'none';

            if (this.state?.monastery && user.displayName) {
                if (this.state.monastery.abbot_name === 'Thiền Sư Pháp Trí' || this.state.monastery.abbot_name.startsWith('Trụ Trì')) {
                    this.state.monastery.abbot_name = 'Thiền Sư ' + user.displayName;
                    this.renderHeaderAndResources();
                }
            }

            this.loadState(user.uid);
        } else {
            if (statusIcon) statusIcon.textContent = '⚪';
            if (userNameEl) userNameEl.textContent = 'Khách viếng thăm';
            if (loginBtn) {
                loginBtn.style.display = 'inline-block';
                loginBtn.textContent = '🔑 Đăng nhập Google';
            }
        }
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
            this.renderNpcVisitorList();
        } else if (tabId === 'zenroom' && this.zenRoomManager) {
            this.zenRoomManager.joinRoom(this.zenRoomManager.currentRoomId);
        } else if (tabId === 'leaderboard') {
            this.loadLeaderboard('reputation');
        }
    }

    // ======================================================================
    // CORE GÕ MÕ TỤNG KINH (WOODEN FISH CHANTING ENGINE)
    // ======================================================================
    strikeWoodenFish(isAuto = false) {
        this.audio.playWoodenFish();
        if (this.zenRoomManager) this.zenRoomManager.onChant();

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
        // Update stage 2 NPC UI list if in campus tab
        if (this.selectedTab === 'campus') {
            this.renderNpcVisitorList();
        }

        // Stage 3: Periodic Buddha Affinity Timer
        if (this.affinityCooldownTimer > 0) {
            this.affinityCooldownTimer--;
        } else if (!this.pendingAffinityEvent) {
            this.triggerAffinityEvent(false);
        }
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
    async loadState(uidOverride = null) {
        const uid = uidOverride || this.user?.uid || this.identity?.user?.uid || null;
        if (uid && this.db) {
            try {
                const doc = await this.db.collection('vanphap_monasteries').doc(uid).get();
                if (doc.exists) {
                    const cloudData = doc.data();
                    this.state = cloudData.state || cloudData;
                    localStorage.setItem('vanphap_save_' + uid, JSON.stringify(this.state));
                    this.onStateLoaded();
                    this.showToast('🪷 Đã đồng bộ Đạo Tràng từ Mây Google!');
                    return;
                } else {
                    const localSaved = localStorage.getItem('vanphap_save_' + uid) || localStorage.getItem('vanphap_save_guest');
                    if (localSaved) {
                        try {
                            this.state = JSON.parse(localSaved);
                            if (this.user?.displayName && this.state?.monastery) {
                                if (this.state.monastery.abbot_name === 'Thiền Sư Pháp Trí') {
                                    this.state.monastery.abbot_name = 'Thiền Sư ' + this.user.displayName;
                                }
                            }
                            this.onStateLoaded();
                            await this.saveCloudState(uid);
                            this.showToast('🙏 Đã liên kết và đồng bộ Đạo Tràng lên Mây thành công!');
                            return;
                        } catch (_) {}
                    }
                }
            } catch (err) {
                console.warn('Lỗi đọc Firestore vanphap_monasteries, chuyển sang offline mode:', err);
                this.showToast('⚠️ Chưa thể tải từ Mây, chuyển sang chế độ tu hành cục bộ.');
            }
        }

        const saveKey = uid ? 'vanphap_save_' + uid : 'vanphap_save_guest';
        this.initLocalFallbackState(saveKey);
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

    
    toggleSoundscapePanel() {
        const p = document.getElementById('zenSoundscapePanel');
        if (!p) return;
        const isHidden = p.style.display === 'none';
        p.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            const hourLabel = document.getElementById('soundscape-hour-mode');
            const h = new Date().getHours();
            if (hourLabel) {
                hourLabel.innerText = (h >= 5 && h < 12) ? 'Thanh Sáng (Sáo Trúc & Chim Ca)'
                    : (h >= 12 && h < 18) ? 'Nhật Trung (Thanh Trúc & Gió Nhẹ)'
                    : (h >= 18 && h < 22) ? 'Hoàng Hôn (Trầm Hương Bảng Lảng)'
                    : 'Dạ Thiền (Đại Hồng Chung & Gió Ngàn)';
            }
        }
    }

    changeDiscipleRole(discipleId, newRole) {
        if (!this.state || !this.state.disciples) return;
        const d = this.state.disciples.find(x => String(x.id) === String(discipleId));
        if (!d) return;
        d.role = newRole;
        this.audio.playSingingBowl();
        const roleNames = {
            'tru_tri': '👑 Đại Đức Trụ Trì',
            'giang_su': '📖 Giảng Sư Đăng Đàn',
            'thu_tang': '📜 Thủ Tàng Kinh Các',
            'dien_toa': '🍲 Điển Tọa Hương Tích',
            'y_tang': '🌿 Dược Sư Y Tăng',
            'ho_phap': '🛡️ Hộ Pháp Sơn Môn',
            'tap_tu': '🧘 Chúng Tăng Thường Nhật'
        };
        this.showToast(`Đã bổ nhiệm ${d.name} làm ${roleNames[newRole] || 'Hộ Pháp'}!`);
        this.renderDisciples();
        this.saveCloudState();
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
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <h4 style="font-family:var(--font-heading); color:var(--gold-bright); font-size:15px;">${d.name}</h4>
                                <span class="disciple-grade-tag ${gradeClass}">${d.talent_grade}</span>
                            </div>
                            <div style="margin-top:2px;">
                                <select class="disciple-role-badge" style="background:#1e1410; border:1px solid var(--gold-bright); color:var(--gold-bright); font-size:10.5px; padding:2px 4px; border-radius:4px; cursor:pointer;" onchange="window.vpApp.changeDiscipleRole('${d.id}', this.value)">
                                    <option value="tap_tu" ${d.role === 'tap_tu' || !d.role ? 'selected' : ''}>🧘 Chúng Tăng</option>
                                    <option value="tru_tri" ${d.role === 'tru_tri' ? 'selected' : ''}>👑 Trụ Trì</option>
                                    <option value="giang_su" ${d.role === 'giang_su' ? 'selected' : ''}>📖 Giảng Sư (+15% Danh Vọng)</option>
                                    <option value="thu_tang" ${d.role === 'thu_tang' ? 'selected' : ''}>📜 Thủ Tàng (+25% Kinh Sách)</option>
                                    <option value="dien_toa" ${d.role === 'dien_toa' ? 'selected' : ''}>🍲 Điển Tọa (+20% Lương Thực)</option>
                                    <option value="y_tang" ${d.role === 'y_tang' ? 'selected' : ''}>🌿 Y Tăng (+20% Nam Dược)</option>
                                    <option value="ho_phap" ${d.role === 'ho_phap' ? 'selected' : ''}>🛡️ Hộ Pháp (+15% Kho Chứa)</option>
                                </select>
                            </div>
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
                    ${isCompleted ? `
                        <div class="canon-perk-box">
                            ✨ Nội Tại Kích Hoạt: ${esc(c.perk || 'Gia tăng định lực, phước đức và danh vọng sơn môn trường tồn.')}
                        </div>
                    ` : `
                        <button class="btn-secondary" style="margin-top:6px;" onclick="window.vpApp.startResearch('${key}')">
                            📖 Khai Mở Nghiên Cứu
                        </button>
                    `}
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
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-dim);">Đang thỉnh Bảng Vàng trực tuyến...</td></tr>';

        const sortField = type === 'dao_hanh' ? 'dao_hanh' : type === 'cong_duc' ? 'cong_duc' : 'reputation';
        const typeLabel = type === 'dao_hanh' ? 'Đạo Hạnh' : type === 'cong_duc' ? 'Công Đức' : 'Danh Vọng';

        try {
            if (!this.db) {
                this.db = window.parent?.firebase?.firestore?.() || (typeof firebase !== 'undefined' ? firebase.firestore?.() : null);
            }
            if (!this.db) throw new Error('Chưa kết nối được cơ sở dữ liệu mây.');

            const snapshot = await this.db.collection('vanphap_monasteries')
                .orderBy(sortField, 'desc')
                .limit(20)
                .get();

            if (snapshot.empty) {
                body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-dim);">Chưa có sơn môn nào được ghi danh trên Bảng Vàng. Hãy đăng nhập Google để lưu đạo tràng!</td></tr>';
                return;
            }

            body.innerHTML = snapshot.docs.map((doc, idx) => {
                const row = doc.data();
                const score = Number(row[sortField]) || 0;
                const formattedScore = score.toLocaleString('vi-VN');
                const mName = row.monastery_name || row.name || 'Đạo Tràng';
                const abbot = row.abbot_name || 'Vô danh';
                const realm = row.realm_title || 'Sơ Học';

                return `
                    <tr>
                        <td style="font-weight:900; color:${idx === 0 ? '#fbbf24' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#d97706' : '#94a3b8'}; text-align:center;">
                            ${idx === 0 ? '👑 #1' : `#${idx + 1}`}
                        </td>
                        <td>
                            <strong style="color:#fff;">${esc(mName)}</strong>
                            <div style="font-size:11px; color:var(--text-dim);">Trụ trì: ${esc(abbot)}</div>
                        </td>
                        <td>
                            <span class="abbot-realm-tag">${esc(realm)}</span>
                        </td>
                        <td>
                            <strong style="color:var(--gold-bright);">${formattedScore}</strong> <small style="font-size:10px; color:var(--text-dim);">${typeLabel}</small>
                        </td>
                        <td>
                            <button class="btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.vpApp.openVisitModal('${doc.id}')">
                                🏯 Viếng Thăm
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (e) {
            console.error('loadLeaderboard error:', e);
            body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#f87171;">⚠️ Chưa tải được Bảng Vàng: ${esc(e.message || 'Lỗi kết nối')}. <button class="btn-secondary" style="margin-left:8px; padding:3px 10px;" onclick="window.vpApp.loadLeaderboard('${type}')">🔄 Thử lại</button></td></tr>`;
        }
    }

    async openVisitModal(monasteryId) {
        const modal = document.getElementById('visitMonasteryModal');
        const content = document.getElementById('visitMonasteryContent');
        if (!modal || !content) return;

        modal.classList.add('open');
        content.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-dim);">Đang đến viếng thăm sơn môn...</div>';

        try {
            if (!this.db) {
                this.db = window.parent?.firebase?.firestore?.() || (typeof firebase !== 'undefined' ? firebase.firestore?.() : null);
            }
            if (!this.db) throw new Error('Chưa kết nối được cơ sở dữ liệu.');

            const doc = await this.db.collection('vanphap_monasteries').doc(monasteryId).get();
            if (!doc.exists) {
                content.innerHTML = '<div style="text-align:center; padding:24px; color:#f87171;">Không tìm thấy thông tin sơn môn này.</div>';
                return;
            }

            const data = doc.data();
            const mName = data.monastery_name || data.name || 'VẠN PHÁP ĐẠO TRÀNG';
            const abbot = data.abbot_name || 'Thiền Sư';
            const realm = data.realm_title || 'Sơ Học';
            const motto = data.motto || 'Trúc biếc hoa vàng đâu ngoại pháp - Mây bay nước chảy lộ thiền tâm';
            const disciples = Array.isArray(data.top_disciples) ? data.top_disciples : [];

            content.innerHTML = `
                <div style="text-align:center; margin-bottom:16px;">
                    <h3 style="color:var(--gold-bright); font-size:22px; font-family:var(--font-heading);">${esc(mName.toUpperCase())}</h3>
                    <div style="font-size:12px; color:var(--text-dim);">Trụ trì: <strong style="color:#fff;">${esc(abbot)}</strong> (Cảnh giới: ${esc(realm)})</div>
                    <p style="font-style:italic; font-size:12px; color:var(--text-secondary); margin-top:6px;">"${esc(motto)}"</p>
                </div>
                <div style="background:rgba(0,0,0,0.3); padding:14px; border-radius:12px; margin-bottom:16px;">
                    <h4 style="font-size:13px; color:var(--jade-bright); margin-bottom:8px;">👥 Đại Đệ Tử Tiêu Biểu:</h4>
                    ${disciples.length > 0 ? disciples.map(d => `<div style="font-size:12px; margin-bottom:4px;">🪷 ${esc(d.name)} (${esc(d.talent_grade || 'Căn cơ tốt')}) - Cảnh giới Cấp ${d.realm_level || 1}</div>`).join('') : '<div style="font-size:12px; color:var(--text-dim);">Sơn môn đang tiếp tục chiêu tập đệ tử.</div>'}
                </div>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="blessing-input" placeholder="Gửi lời chúc thiện lành..." style="flex:1; background:rgba(0,0,0,0.5); border:1.5px solid var(--border-gold-subtle); padding:10px; border-radius:8px; color:#fff;" value="Nguyện cầu sơn môn hưng thịnh, đạo nghiệp tinh tấn cát tường!">
                    <button class="btn-zen" onclick="window.vpApp.sendBlessing('${monasteryId}')">🪔 Thắp Hương</button>
                </div>
            `;
        } catch (e) {
            content.innerHTML = `<div style="text-align:center; padding:20px; color:#f87171;">⚠️ Chưa tải được thông tin: ${esc(e.message)}</div>`;
        }
    }

    async sendBlessing(monasteryId) {
        const input = document.getElementById('blessing-input');
        const text = input ? input.value.trim() : 'Nguyện cầu sơn môn hưng thịnh!';
        if (this.db && monasteryId) {
            try {
                const fromUid = this.user?.uid || this.identity?.user?.uid || 'guest';
                const fromName = this.user?.displayName || 'Đạo Hữu Thập Phương';
                await this.db.collection('vanphap_monasteries').doc(monasteryId).collection('blessings').add({
                    fromUid,
                    fromName,
                    text: text.slice(0, 150),
                    createdAt: (window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date())
                });
            } catch (_) {}
        }
        this.audio.playSingingBowl();
        this.showToast('🪔 Đã thắp một nén hương trầm và gửi lời chúc phúc cát tường đến sơn môn!');
        this.closeVisitModal();
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



    // ======================================================================
    // STAGE 3: THIÊN CƠ CHIẾU TRIỆU / TIẾP ĐÓN CÓ ĐÁNH ĐỔI
    // ======================================================================
    triggerAffinityEvent(forceOpen = false) {
        // Chọn một sự kiện ngẫu nhiên khác với sự kiện trước nếu có
        const pool = AFFINITY_EVENTS;
        const ev = pool[Math.floor(Math.random() * pool.length)];
        this.pendingAffinityEvent = ev;

        // Cập nhật banner cảnh báo
        const banner = document.getElementById('affinityAlertBanner');
        const titleEl = document.getElementById('affinityAlertTitle');
        if (banner) {
            banner.style.display = 'flex';
        }
        if (titleEl) {
            titleEl.innerText = `${ev.title} (${ev.visitor})`;
        }

        if (forceOpen) {
            this.openAffinityModal();
        } else {
            this.showToast(`🪷 Thiên Cơ Chiếu Triệu: ${ev.title}! Hãy vào Sơn Môn tiếp đón.`);
        }
    }

    openAffinityModal() {
        if (!this.pendingAffinityEvent) {
            this.triggerAffinityEvent(true);
            return;
        }

        const ev = this.pendingAffinityEvent;
        const modal = document.getElementById('buddhaAffinityModal');
        const titleEl = document.getElementById('affinity-modal-title');
        const visitorEl = document.getElementById('affinity-modal-visitor');
        const descEl = document.getElementById('affinity-modal-desc');
        const choicesContainer = document.getElementById('affinity-choices-list');

        if (!modal) return;

        if (titleEl) titleEl.innerText = ev.title;
        if (visitorEl) visitorEl.innerHTML = `Khách viếng: <strong style="color:var(--gold-bright);">${esc(ev.visitor)}</strong>`;
        if (descEl) descEl.innerText = ev.description;

        if (choicesContainer) {
            choicesContainer.innerHTML = ev.choices.map(c => `
                <div class="affinity-choice-card" onclick="window.vpApp.chooseAffinityOption('${c.key}')">
                    <div class="affinity-choice-title">
                        <span>${esc(c.title)}</span>
                    </div>
                    <div class="affinity-choice-desc">${esc(c.desc)}</div>
                    <div class="affinity-tradeoffs-wrap">
                        ${c.tradeoffs.map(t => `<span class="tradeoff-badge tradeoff-${t.type}">${esc(t.text)}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        }

        modal.classList.add('open');
    }

    closeAffinityModal() {
        const modal = document.getElementById('buddhaAffinityModal');
        if (modal) modal.classList.remove('open');
    }

    chooseAffinityOption(choiceKey) {
        if (!this.pendingAffinityEvent || !this.state || !this.state.monastery) return;
        const ev = this.pendingAffinityEvent;
        const choice = ev.choices.find(c => c.key === choiceKey);
        if (!choice) return;

        const m = this.state.monastery;
        const eff = choice.effects || {};

        // Áp dụng các thay đổi tài nguyên có đánh đổi
        if (eff.dao_hanh) m.dao_hanh = Math.max(0, (m.dao_hanh || 0) + eff.dao_hanh);
        if (eff.cong_duc) m.cong_duc = Math.max(0, (m.cong_duc || 0) + eff.cong_duc);
        if (eff.reputation) m.reputation = Math.max(0, (m.reputation || 0) + eff.reputation);
        if (eff.coins) m.coins = Math.max(0, (m.coins || 0) + eff.coins);
        if (eff.food) m.food = Math.max(0, (m.food || 0) + eff.food);
        if (eff.herbs) m.herbs = Math.max(0, (m.herbs || 0) + eff.herbs);
        if (eff.wood) m.wood = Math.max(0, (m.wood || 0) + eff.wood);
        if (eff.stone) m.stone = Math.max(0, (m.stone || 0) + eff.stone);

        // Phát chuông thiền
        this.audio.playSingingBowl();

        // Đóng modal và ẩn banner
        this.closeAffinityModal();
        this.pendingAffinityEvent = null;
        this.affinityCooldownTimer = 75; // 75s sau mới kích hoạt sự kiện tự động tiếp theo

        const banner = document.getElementById('affinityAlertBanner');
        if (banner) banner.style.display = 'none';

        // Cập nhật giao diện tài nguyên
        this.renderHeaderAndResources();

        // Hiển thị lời đúc kết sâu sắc
        alert(`🪷 ĐỊNH ĐOẠT DUYÊN KHỞI:\n\n${choice.outcomeMessage}`);

        // Tự động lưu lên Cloud nếu đã đăng nhập
        this.saveCloudState();
    }

    // ======================================================================
    // STAGE 2: NPC INTERACTION & VISITOR ROSTER
    // ======================================================================
    renderNpcVisitorList() {
        const listEl = document.getElementById('campus-visitors-list');
        const countBadge = document.getElementById('npc-count-badge');
        const timeLabel = document.getElementById('campus-time-label');
        if (!listEl || !this.visualizer || !this.visualizer.npcManager) return;

        const mgr = this.visualizer.npcManager;
        const npcs = mgr.npcs;

        if (countBadge) countBadge.innerText = npcs.length;
        if (timeLabel) timeLabel.innerText = mgr.getCurrentTimeSlot().label;

        if (npcs.length === 0) {
            listEl.innerHTML = '<div style="font-size:12px; color:var(--text-dim); text-align:center; padding:12px;">Sơn môn đang thanh tịnh, chưa có khách vãng cảnh.</div>';
            return;
        }

        listEl.innerHTML = npcs.map(npc => {
            const statusLabel = npc.state === 'WALKING' ? `Đang đến ${esc(npc.targetBuildingName)}`
                : npc.state === 'ACTION' ? esc(npc.actionText)
                : npc.state === 'TALKING' ? 'Đang trò chuyện'
                : 'Đang tạ từ rời bước';

            return `
                <div class="visitor-item ${mgr.selectedNpcId === npc.id ? 'active' : ''}" onclick="window.vpApp.openNpcModal('${npc.id}')">
                    <div class="visitor-avatar-wrap">${npc.avatar}</div>
                    <div class="visitor-meta">
                        <div class="visitor-name-line">
                            <span class="visitor-name">${esc(npc.name)}</span>
                            <span class="visitor-tag">${esc(npc.role)}</span>
                        </div>
                        <div class="visitor-status-line">📍 ${statusLabel}</div>
                    </div>
                    <button class="visitor-btn-talk" onclick="event.stopPropagation(); window.vpApp.openNpcModal('${npc.id}')">
                        💬 Trò chuyện
                    </button>
                </div>
            `;
        }).join('');
    }

    openNpcModal(npcId) {
        if (!this.visualizer || !this.visualizer.npcManager) return;
        const mgr = this.visualizer.npcManager;
        const npc = mgr.npcs.find(n => n.id === npcId);
        if (!npc) return;

        mgr.selectedNpcId = npc.id;
        npc.state = 'TALKING';
        this.activeNpcId = npc.id;

        const modal = document.getElementById('npcDialogueModal');
        const avatarEl = document.getElementById('npc-dlg-avatar');
        const nameEl = document.getElementById('npc-dlg-name');
        const roleEl = document.getElementById('npc-dlg-role');
        const speechEl = document.getElementById('npc-dlg-speech');
        const blessBtn = document.getElementById('btn-npc-bless');
        const hintEl = document.getElementById('npc-dlg-reward-hint');

        if (avatarEl) avatarEl.innerText = npc.avatar;
        if (nameEl) nameEl.innerText = npc.name;
        if (roleEl) roleEl.innerText = npc.role + ' · Đích đến: ' + npc.targetBuildingName;
        if (speechEl) speechEl.innerText = '"' + npc.speech + '"';

        if (blessBtn) {
            blessBtn.disabled = npc.hasBlessed;
            blessBtn.innerText = npc.hasBlessed ? '✓ Đã Kết Duyên Lành' : '📿 Niệm Phật Cầu An';
        }
        if (hintEl) {
            hintEl.innerText = npc.hasBlessed ? 'Đã nhận thiện duyên' : '🪷 +5 Công Đức';
        }

        if (modal) modal.classList.add('open');
        this.renderNpcVisitorList();
    }

    closeNpcModal() {
        const modal = document.getElementById('npcDialogueModal');
        if (modal) modal.classList.remove('open');

        if (this.visualizer && this.visualizer.npcManager && this.activeNpcId) {
            const npc = this.visualizer.npcManager.npcs.find(n => n.id === this.activeNpcId);
            if (npc && npc.state === 'TALKING') {
                npc.state = npc.hasBlessed ? 'LEAVING' : 'ACTION';
            }
            this.visualizer.npcManager.selectedNpcId = null;
        }
        this.activeNpcId = null;
        this.renderNpcVisitorList();
    }

    blessNpc() {
        if (!this.visualizer || !this.visualizer.npcManager || !this.activeNpcId) return;
        const npc = this.visualizer.npcManager.npcs.find(n => n.id === this.activeNpcId);
        if (!npc || npc.hasBlessed) return;

        npc.hasBlessed = true;
        this.audio.playSingingBowl();

        // Tặng Công Đức
        if (this.state && this.state.monastery) {
            this.state.monastery.cong_duc = (this.state.monastery.cong_duc || 0) + 5;
            this.renderHeaderAndResources();
        }

        const speechEl = document.getElementById('npc-dlg-speech');
        if (speechEl) {
            speechEl.innerText = '"' + npc.blessedSpeech + '"';
        }

        const blessBtn = document.getElementById('btn-npc-bless');
        if (blessBtn) {
            blessBtn.disabled = true;
            blessBtn.innerText = '✓ Đã Kết Duyên Lành';
        }

        const hintEl = document.getElementById('npc-dlg-reward-hint');
        if (hintEl) hintEl.innerText = '✓ +5 Công Đức đã nhận!';

        this.showToast(`📿 Đã niệm Phật chúc phúc cho ${npc.name} (+5 Công Đức)!`);

        // Sau 2.5s tự động đóng và chuyển sang LEAVING
        setTimeout(() => {
            if (this.activeNpcId === npc.id) {
                this.closeNpcModal();
            }
        }, 2500);
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

    async saveCloudState(uidOverride = null) {
        const uid = uidOverride || this.user?.uid || this.identity?.user?.uid || null;
        if (!uid || !this.db || !this.state || !this.state.monastery) return;
        if (this.isSavingCloud) return;
        this.isSavingCloud = true;

        try {
            const m = this.state.monastery;
            const docData = {
                uid,
                name: m.name || 'Trúc Lâm Thiền Tự',
                monastery_name: m.name || 'Trúc Lâm Thiền Tự',
                abbot_name: m.abbot_name || 'Thiền Sư',
                realm_level: Number(m.realm_level) || 1,
                realm_title: m.realm_title || 'Sơ Học',
                reputation: Math.max(0, Math.round(Number(m.reputation) || 0)),
                dao_hanh: Math.max(0, Math.round(Number(m.dao_hanh) || 0)),
                cong_duc: Math.max(0, Math.round(Number(m.cong_duc || m.merit) || 0)),
                disciples_count: (this.state.disciples || []).length,
                top_disciples: (this.state.disciples || []).slice(0, 3).map(d => ({
                    name: d.name,
                    talent_grade: d.talent_grade,
                    realm_level: d.realm_level
                })),
                motto: m.motto || 'Vạn Pháp Quy Tâm - Bồ Đề Thường Tịch',
                state: this.state,
                updatedAt: (window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date())
            };
            await this.db.collection('vanphap_monasteries').doc(uid).set(docData, { merge: true });
        } catch (e) {
            console.warn('Cloud sync error:', e);
        } finally {
            this.isSavingCloud = false;
        }
    }

    syncServerState() {
        if (!this.state || !this.state.monastery) return;
        const uid = this.user?.uid || this.identity?.user?.uid || null;
        const saveKey = uid ? 'vanphap_save_' + uid : 'vanphap_save_guest';
        try {
            localStorage.setItem(saveKey, JSON.stringify(this.state));
        } catch (_) {}

        if (uid && this.db) {
            clearTimeout(this.cloudSaveDebounce);
            this.cloudSaveDebounce = setTimeout(() => {
                this.saveCloudState(uid);
            }, 3000);
        }
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
