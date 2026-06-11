// --- 1. CONFIGURATIONS & GAME CONSTANTS ---
        const WORLD_SIZE = 4000; 
        const SAVE_KEY = "XOM_ANH_HUNG_SAVE_V2";
        const AUDIO_ENABLED = true;

        // Sound Engine Class utilizing HTML5 Audio Elements for Helbreath authentic assets
        class AudioSynthEngine {
            constructor() {
                this.muted = false;
                this.bgmVolume = 0.35;
                this.sfxVolume = 0.50;
                this.bgm = null;
                this.currentBgmName = "";
                this.sfxPools = {};
            }
            init() {
                if(this.bgm) return;
                this.bgm = new Audio();
                this.bgm.loop = true;
                this.bgm.volume = this.muted ? 0 : this.bgmVolume;
            }
            playBgm(trackName) {
                this.init();
                if(this.currentBgmName === trackName) return;
                
                const path = `assets/audio/music/${trackName}.mp3`;
                this.bgm.src = path;
                this.currentBgmName = trackName;
                
                if(!this.muted) {
                    this.bgm.play().catch(e => {
                        console.log("Audio BGM autoplay blocked, waiting for interaction.");
                        const playOnInteraction = () => {
                            if (this.bgm.src && !this.muted) {
                                this.bgm.play().catch(o => {});
                            }
                            document.removeEventListener('click', playOnInteraction);
                            document.removeEventListener('keydown', playOnInteraction);
                        };
                        document.addEventListener('click', playOnInteraction);
                        document.addEventListener('keydown', playOnInteraction);
                    });
                }
            }
            stopBgm() {
                if(this.bgm) {
                    this.bgm.pause();
                    this.currentBgmName = "";
                }
            }
            play(type) {
                if(!AUDIO_ENABLED || this.muted) return;
                
                let fileName = "";
                switch(type) {
                    case 'click':
                        fileName = "C16.mp3"; // GUI Click/Cast
                        break;
                    case 'hit':
                        fileName = "C6.mp3"; // Bladed weapon damage
                        break;
                    case 'levelup':
                        fileName = "C23.mp3"; // Levelup fanfare
                        break;
                    case 'skill':
                        fileName = "E5.mp3"; // Skill cast
                        break;
                    case 'gold':
                        fileName = "E20.mp3"; // Item added / gold pickup
                        break;
                    case 'quest':
                        fileName = "E29.mp3"; // Quest / inventory bags
                        break;
                    default:
                        fileName = type.endsWith('.mp3') ? type : `${type}.mp3`;
                        break;
                }
                
                const path = `assets/audio/sounds/${fileName}`;
                if(!this.sfxPools[path]) {
                    this.sfxPools[path] = [];
                }
                
                let audioEl = this.sfxPools[path].find(el => el.paused || el.ended);
                if(!audioEl) {
                    audioEl = new Audio(path);
                    this.sfxPools[path].push(audioEl);
                }
                
                audioEl.volume = this.sfxVolume;
                audioEl.currentTime = 0;
                audioEl.play().catch(e => {});
            }
        }
        const audio = new AudioSynthEngine();

        // --- 2. DATA DICTIONARIES (CLASSES, MONSTERS, ITEMS, RECIPES, NPCS) ---
        const CLASS_DATA = {
            cop: { name: "Anh Cảnh Sát", emoji: "👮‍♂️", hp: 160, mp: 40, atk: 12, def: 8, speed: 4.5, skills: [
                { id: "cop_bash", name: "Dùi Cùi Trấn Áp", icon: "🔨", desc: "Đập mạnh gây sát thương vật lý và làm chậm mục tiêu.", mp: 8, cd: 3000, type: 'target', range: 180, multiplier: 1.6, lastUsed: 0 },
                { id: "cop_shield", name: "Khiên Công Lý", icon: "🛡️", desc: "Tạo khiên hấp thụ sát thương và hồi HP tức thời.", mp: 12, cd: 6000, type: 'self', lastUsed: 0 },
                { id: "cop_charge", name: "Tăng Tốc Đột Kích", icon: "⚡", desc: "Phóng tới cường kích mục tiêu, tạo choáng nhẹ.", mp: 14, cd: 5200, type: 'target', range: 220, multiplier: 1.9, lastUsed: 0 },
                { id: "cop_siren", name: "Âm Thanh Kiểm Soát", icon: "📯", desc: "Gây hiệu ứng diện rộng làm chậm quái và giảm sát thương.", mp: 22, cd: 9000, type: 'aoe', range: 200, multiplier: 1.2, lastUsed: 0 },
                { id: "cop_bastion", name: "Thành Lũy Công Lý", icon: "🏰", desc: "Mở vùng phòng thủ, phản lại sát thương và hồi HP lớn.", mp: 30, cd: 14000, type: 'ultimate', lastUsed: 0 }
            ]},
            teacher: { name: "Cô Giáo Làng", emoji: "👩‍🏫", hp: 90, mp: 100, atk: 18, def: 3, speed: 4.2, skills: [
                { id: "teach_quiz", name: "Kiểm Tra Bài Cũ", icon: "✏️", desc: "Tung phấn ma thuật gây sát thương phép và làm choáng.", mp: 15, cd: 2500, type: 'target', range: 200, multiplier: 2.2, lastUsed: 0 },
                { id: "teach_silence", name: "Cả Lớp Trật Tự!", icon: "🔇", desc: "Khống chế một vùng kẻ địch và làm chậm lại toàn bộ quái.", mp: 25, cd: 7000, type: 'aoe', range: 180, multiplier: 1.3, lastUsed: 0 },
                { id: "teach_meteor", name: "Thiên Thạch Phấn", icon: "☄️", desc: "Gọi thiên thạch giáng xuống điểm đã chọn gây sát thương lớn.", mp: 28, cd: 9500, type: 'point', range: 240, multiplier: 2.5, lastUsed: 0 },
                { id: "teach_barrier", name: "Hào Quang Tri Thức", icon: "📚", desc: "Tạo lá chắn hồi phục cho bản thân và giảm sát thương.", mp: 20, cd: 10000, type: 'self', lastUsed: 0 },
                { id: "teach_grace", name: "Ánh Sao Tinh Tú", icon: "🌟", desc: "Kỹ năng tối thượng gây bão ma thuật lớn lên vùng mục tiêu.", mp: 35, cd: 14500, type: 'ultimate', lastUsed: 0 }
            ]},
            merchant: { name: "Chú Buôn Lậu", emoji: "🕵️‍♂️", hp: 110, mp: 60, atk: 15, def: 5, speed: 5.2, skills: [
                { id: "merch_slash", name: "Đoản Đao Cắt Lỗ", icon: "🗡️", desc: "Chém lén chí mạng gây sát thương lớn và tăng bạo kích.", mp: 10, cd: 2000, type: 'target', range: 180, multiplier: 1.9, lastUsed: 0 },
                { id: "merch_bribe", name: "Đút Lót Tăng Tốc", icon: "💰", desc: "Hồi MP và tăng tốc độ đánh nhanh chóng.", mp: 0, cd: 5000, type: 'self', lastUsed: 0 },
                { id: "merch_trap", name: "Bẫy Siêu Lợi", icon: "🪤", desc: "Đặt bẫy vùng gây sát thương và làm chậm địch.", mp: 18, cd: 7500, type: 'aoe', range: 190, multiplier: 1.4, lastUsed: 0 },
                { id: "merch_dash", name: "Lướt Bóng Tiếp", icon: "🏃", desc: "Lướt tới mục tiêu và đánh thương mạnh.", mp: 12, cd: 4700, type: 'target', range: 220, multiplier: 2.0, lastUsed: 0 },
                { id: "merch_midas", name: "Bàn Tay Midas", icon: "💎", desc: "Kỹ năng tối thượng gây vàng và sát thương phép cho kẻ địch.", mp: 32, cd: 13200, type: 'ultimate', lastUsed: 0 }
            ]},
            engineer: { name: "Anh Kỹ Sư", emoji: "👨‍💻", hp: 120, mp: 80, atk: 13, def: 6, speed: 4.6, skills: [
                { id: "eng_turret", name: "Ụ Súng Công Nghệ", icon: "🛠️", desc: "Triệu hồi súng laze bắn mục tiêu trong tầm.", mp: 20, cd: 4000, type: 'target', range: 220, multiplier: 1.7, lastUsed: 0 },
                { id: "eng_overclock", name: "Ép Xung Phần Cứng", icon: "⚡", desc: "Hồi HP/MP và tăng tốc độ đánh trong vài giây.", mp: 30, cd: 9000, type: 'self', lastUsed: 0 },
                { id: "eng_missile", name: "Tên Lửa Lăn Quân", icon: "🚀", desc: "Bắn tên lửa vào vị trí đã chọn gây nổ diện rộng.", mp: 25, cd: 8500, type: 'point', range: 240, multiplier: 2.3, lastUsed: 0 },
                { id: "eng_shield", name: "Lá Chắn Nano", icon: "🔧", desc: "Kích hoạt lá chắn công nghệ, hấp thụ sát thương và hồi ít HP.", mp: 18, cd: 7200, type: 'self', lastUsed: 0 },
                { id: "eng_core", name: "Phóng Năng Lượng", icon: "💥", desc: "Kỹ năng tối thượng bắn luồng năng lượng chém qua nhiều kẻ địch.", mp: 38, cd: 14500, type: 'ultimate', lastUsed: 0 }
            ]}
        };

        const MONSTER_POOL = [
            { name: "Muỗi Vằn Sốt Xuất Huyết", emoji: "🦟", hp: 45, maxHp: 45, atk: 6, exp: 15, gold: 5 },
            { name: "Chuột Cống Đột Biến", emoji: "🐀", hp: 80, maxHp: 80, atk: 10, exp: 28, gold: 12 },
            { name: "Chó Hoang Lên Cơn Dại", emoji: "🐕", hp: 140, maxHp: 140, atk: 16, exp: 50, gold: 22 },
            { name: "Lợn Rừng Phá Hoa Màu", emoji: "🐗", hp: 250, maxHp: 250, atk: 25, exp: 110, gold: 45 }
        ];

        const BOSS_POOL = [
            { name: "THẦN TRÙNG ĐẠI QUỶ (SIÊU BOSS)", emoji: "👹", hp: 1200, maxHp: 1200, atk: 55, exp: 1000, gold: 500, isBoss: true }
        ];

        const QUEST_DATA = [
            { id: "q_kill_rats", title: "Diệt Chuột Cống Đột Biến", desc: "Tiêu diệt 3 con chuột cống tại bờ mương phía Bắc làng.", type: "kill", target: "🐀", req: 3, progress: 0, rewardGold: 80, rewardExp: 100, done: false },
            { id: "q_craft_sword", title: "Rèn Kiếm Kim Cương", desc: "Thu thập đủ nguyên liệu chế tạo Kiếm Kim Cương từ Thợ Rèn.", type: "craft", target: "🗡️", req: 1, progress: 0, rewardGold: 200, rewardExp: 250, done: false }
        ];

        const ITEMS = {
            potion_hp: { id: "potion_hp", name: "Bình Thuốc Tiên HP", emoji: "🧪", type: "usable", desc: "Hồi phục ngay lập tức 50 Máu (HP)", value: 50, price: 20 },
            potion_mp: { id: "potion_mp", name: "Bình Nước Suối MP", emoji: "💧", type: "usable", desc: "Hồi phục ngay lập tức 30 Linh Lực (MP)", value: 30, price: 15 },
            iron_ore:  { id: "iron_ore", name: "Quặng Sắt Thô", emoji: "🪨", type: "material", desc: "Quặng đá sắt dùng làm phôi chế tạo vũ khí trang bị", price: 10 },
            magic_crystal: { id: "magic_crystal", name: "Pha Lê Ma Thuật", emoji: "🔮", type: "material", desc: "Tinh thể ma pháp quý hiếm rớt ra từ quái vật", price: 30 },
            
            // Weapons
            wp_wooden: { id: "wp_wooden", name: "Gậy Gỗ Đầu Thôn", emoji: "🪵", type: "weapon", atk: 4, def: 0, hp: 0, price: 30 },
            wp_steel:  { id: "wp_steel", name: "Đao Thép Sáng Chóa", emoji: "⚔️", type: "weapon", atk: 15, def: 0, hp: 0, price: 150 },
            wp_diamond:{ id: "wp_diamond", name: "Kiếm Kim Cương Thượng Hạng", emoji: "🗡️", type: "weapon", atk: 40, def: 5, hp: 50, price: 500 },

            // Armors
            ar_cloth:  { id: "ar_cloth", name: "Áo Vải Rách Vai", emoji: "👕", type: "armor", atk: 0, def: 2, hp: 15, price: 25 },
            ar_iron:   { id: "ar_iron", name: "Giáp Sắt Cự Thần", emoji: "🛡️", type: "armor", atk: 0, def: 14, hp: 80, price: 200 },
            
            // Accessories
            ac_ring:   { id: "ac_ring", name: "Nhẫn Ngọc Cẩm Thạch", emoji: "📿", type: "accessory", atk: 5, def: 3, hp: 30, price: 120 }
        };

        const CRAFT_RECIPES = [
            { resultId: "wp_steel", ingredients: { iron_ore: 3 }, cost: 40 },
            { resultId: "ar_iron", ingredients: { iron_ore: 5, magic_crystal: 1 }, cost: 80 },
            { resultId: "wp_diamond", ingredients: { iron_ore: 8, magic_crystal: 4 }, cost: 250 }
        ];

        const NPC_DATA = {
            elder: { name: "Cụ Trưởng Làng", emoji: "🧙‍♂️", role: "Cốt Truyện & Đại Nhiệm Vụ", x: 2000, y: 2000, radius: 45 },
            blacksmith: { name: "Bác Thợ Rèn Hùng Hổ", emoji: "👨‍🏭", role: "Lò Rèn Chế Tạo Trang Bị", x: 1750, y: 1950, radius: 45 },
            merchant: { name: "Cô Ba Tạp Hóa", emoji: "👩‍🌾", role: "Giao Thương Mua Bán Vật Phẩm", x: 2250, y: 2050, radius: 45 },
            vinhsHouse: { name: "Nhà Vinh Đèn Lồng", emoji: "🏮", role: "Chủ Đèn Lồng", x: 1460, y: 1500, radius: 40 },
            tankShop: { name: "Chú Tăng Bán Xe", emoji: "🚜", role: "Xe Tăng Xóm Giữa", x: 1620, y: 1380, radius: 40 },
            flowerHouse: { name: "Nhà Hoa Cúc", emoji: "🌼", role: "Vườn Hoa Sắc Màu", x: 2000, y: 1620, radius: 38 },
            poorHouse: { name: "Nhà Nghèo", emoji: "🏚️", role: "Gia Đình Khiêm Nhường", x: 2180, y: 1770, radius: 38 },
            fruitVendor: { name: "Quầy Hoa Quả", emoji: "🍉", role: "Bán Hoa Quả & Rau", x: 2360, y: 1810, radius: 38 },
            fishSeller: { name: "Bà Bán Cá", emoji: "🐟", role: "Đặc Sản Cá Đồng", x: 2520, y: 1960, radius: 38 },
            barber: { name: "Tiệm Cắt Tóc", emoji: "💈", role: "Mốt Tóc Xóm", x: 2640, y: 1820, radius: 38 },
            dirtyPond: { name: "Ao Cạn Bẩn", emoji: "🪱", role: "Ao Tháng Ngâu", x: 2640, y: 1520, radius: 45 },
            richMaze: { name: "Mê Cung Siêu Giàu", emoji: "🏰", role: "Biệt Thự Vườn Lớn", x: 2440, y: 1340, radius: 50 }
        };

        const WORLD_THEME_AREAS = [
            // Khu trung tâm Làng (x: 1300-2700, y: 1200-2200)
            { name: 'Đầu Xóm Đèn Lồng', x: 1400, y: 1450, w: 240, h: 180, color: 'rgba(244, 194, 56, 0.14)', icon: '🏮', label: 'Làng Đèn Lồng' },
            { name: 'Cửa Hàng Xe Tăng', x: 1550, y: 1300, w: 240, h: 180, color: 'rgba(107, 114, 128, 0.14)', icon: '🚜', label: 'Xe Tăng Chú Tăng' },
            { name: 'Vườn Hoa Cúc', x: 1880, y: 1570, w: 260, h: 210, color: 'rgba(236, 72, 153, 0.12)', icon: '🌼', label: 'Nhà Hoa Cúc' },
            { name: 'Nhà Nghèo', x: 2120, y: 1700, w: 220, h: 170, color: 'rgba(120, 120, 120, 0.14)', icon: '🏚️', label: 'Nhà Nghèo' },
            { name: 'Chợ Hoa Quả', x: 2280, y: 1750, w: 240, h: 160, color: 'rgba(34, 197, 94, 0.11)', icon: '🍉', label: 'Chợ Hoa Quả' },
            { name: 'Chợ Cá Đồng', x: 2440, y: 1880, w: 220, h: 160, color: 'rgba(59, 130, 246, 0.13)', icon: '🐟', label: 'Chợ Cá' },
            { name: 'Tiệm Cắt Tóc', x: 2560, y: 1760, w: 240, h: 180, color: 'rgba(249, 115, 22, 0.13)', icon: '💈', label: 'Tiệm Tóc' },
            { name: 'Ao Cạn', x: 2560, y: 1420, w: 240, h: 160, color: 'rgba(22, 78, 99, 0.14)', icon: '🪱', label: 'Ao Cạn' },
            { name: 'Biệt Thự Mê Cung', x: 2340, y: 1240, w: 340, h: 240, color: 'rgba(168, 85, 247, 0.11)', icon: '🏰', label: 'Mê Cung Siêu Giàu' },

            // Các phân khu bản đồ mới mở rộng (Rộng gấp 4 lần)
            { name: 'Rừng U Minh', x: 200, y: 2200, w: 1000, h: 1200, color: 'rgba(6, 78, 59, 0.22)', icon: '🌲', label: 'Rừng U Minh (Khó)' },
            { name: 'Hồ Sen Tĩnh Lặng', x: 2300, y: 2300, w: 1200, h: 1000, color: 'rgba(8, 145, 178, 0.18)', icon: '🏞️', label: 'Hồ Sen Tĩnh Lặng' },
            { name: 'Đồi Cỏ Mặt Trời', x: 2800, y: 300, w: 1000, h: 900, color: 'rgba(234, 179, 8, 0.13)', icon: '🌄', label: 'Đồi Cỏ Mặt Trời' },
            { name: 'Khu Luyện Cấp Ngoài Làng', x: 500, y: 3200, w: 1400, h: 650, color: 'rgba(220, 38, 38, 0.12)', icon: '💀', label: 'Bãi Luyện Cấp (Dị Biến)' },
            { name: 'Chợ Quê Xóm Dưới', x: 2400, y: 3400, w: 900, h: 500, color: 'rgba(16, 185, 129, 0.14)', icon: '🎪', label: 'Chợ Quê Xóm Dưới' }
        ];

        // --- 3. STATE MANAGEMENT VARIABLES ---
        let currentScreen = window.currentScreen || 'login';
        let activePanel = null;
        let shopActiveTab = 'buy';
        let isAutoFarming = false;
        let autoSkillIds = new Set();
        let lastAutoCombatAction = 0;

        let activeSkillSelection = null;
        let skillCursor = null;
        let clickMarker = null;
        let skillActionPopups = [];

        window.currentMapId = 'world';
        window.lastPortalVisited = null;

        window.player = {
            name: "",
            classId: "",
            level: 1,
            exp: 0,
            maxExp: 100,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            baseAtk: 10,
            baseDef: 5,
            baseSpeed: 4.5,
            gold: 150,
            x: 2000, y: 2000, // Coordinates in World Map Space centered at 2000,2000
            targetMonster: null,
            inventory: [
                { id: "potion_hp", count: 3 },
                { id: "potion_mp", count: 2 },
                { id: "iron_ore", count: 4 }
            ],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            skills: [],
            quests: JSON.parse(JSON.stringify(QUEST_DATA)), // Deep clone quest dictionary
            attackEffect: { active: false, sx: 0, sy: 0, targetX: 0, targetY: 0, startAt: 0 }
        };

        let camera = { x: 0, y: 0 };
        let monsters = [];
        let particles = [];
        let skillEffects = [];
        let monsterProjectiles = [];
        let chatMessages = [];
        let footballFixtures = [];
        let placedBets = [];
        let networkPlayers = {}; // PvP players cache from BroadcastChannel
        let myNetworkId = "P_" + Math.random().toString(36).substring(2, 9);

        const FOOTBALL_LEAGUES = ['Premier League','La Liga','Bundesliga','Serie A','Ligue 1','World Cup'];
        const FOOTBALL_TEAMS = ['Manchester City','Liverpool','Real Madrid','Barcelona','Bayern Munich','Borussia Dortmund','Juventus','Inter Milan','Paris SG','Marseille','Brazil','Germany','Argentina','France'];

        // Interactive Canvas setups
        let canvas = document.getElementById('gameCanvas');
        let ctx = canvas.getContext('2d');
        let mCanvas = document.getElementById('minimap');
        let mCtx = mCanvas.getContext('2d');

        // Setup Multiplayer Synchronization using Firebase Firestore (True Online)
        let pvpChannel = {
            postMessage(msg) {
                if(!window.currentFirebaseUser || typeof db === 'undefined') return;
                if(msg.type === 'PRESENCE') {
                    db.collection('active_players').doc(myNetworkId).set({
                        ...msg, timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, {merge: true}).catch(()=>{});
                } else {
                    db.collection('network_events').add({
                        ...msg, timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }).catch(()=>{});
                }
            }
        };

        let chatChannel = {
            postMessage(msg) {
                if(!window.currentFirebaseUser || typeof db === 'undefined') return;
                db.collection('chat_messages').add({
                    ...msg, timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(()=>{});
            }
        };

        // Firebase Listeners
        setTimeout(() => {
            if(typeof db !== 'undefined') {
                // 1. Presence Sync
                db.collection('active_players').onSnapshot(snap => {
                    snap.forEach(doc => {
                        const msg = doc.data();
                        if(msg.id && msg.id !== myNetworkId) {
                            handleNetworkMessage(msg);
                        }
                    });
                });

                // 2. Transient Events (PVP, Invites, Board)
                let startEventTime = new Date();
                db.collection('network_events')
                  .where('timestamp', '>', startEventTime)
                  .orderBy('timestamp')
                  .onSnapshot(snap => {
                      snap.docChanges().forEach(change => {
                          if(change.type === 'added') {
                              const msg = change.doc.data();
                              if(msg.id && msg.id !== myNetworkId) {
                                  handleNetworkMessage(msg);
                              }
                          }
                      });
                  });

                // 3. Global Chat
                let startChatTime = new Date();
                db.collection('chat_messages')
                  .where('timestamp', '>', startChatTime)
                  .orderBy('timestamp')
                  .onSnapshot(snap => {
                      snap.docChanges().forEach(change => {
                          if(change.type === 'added') {
                              const msg = change.doc.data();
                              if(msg.id && msg.id !== myNetworkId) {
                                  // Call the original chat handler if exists, else append directly
                                  if (chatChannel.onmessage) {
                                      chatChannel.onmessage({ data: msg });
                                  } else if (typeof appendChatMessage === 'function') {
                                      appendChatMessage(msg.name, msg.text, msg.isSystem, msg.color);
                                  }
                              }
                          }
                      });
                  });
            }
        }, 3000); // Wait 3s to let Firebase auth initialize

        const SAMPLE_FOOTBALL_FIXTURES = [
            { league: 'Premier League', match: 'Manchester City vs Liverpool', time: '21:00', status: 'LIVE', odds: '1.85 / 3.20 / 2.10' },
            { league: 'La Liga', match: 'Real Madrid vs Barcelona', time: '23:45', status: 'UPCOMING', odds: '2.00 / 3.40 / 2.00' },
            { league: 'Bundesliga', match: 'Bayern Munich vs Borussia Dortmund', time: '19:30', status: 'LIVE', odds: '1.70 / 3.80 / 2.50' },
            { league: 'Serie A', match: 'Juventus vs Inter Milan', time: '22:15', status: 'UPCOMING', odds: '2.20 / 3.20 / 2.40' },
            { league: 'Ligue 1', match: 'Paris SG vs Marseille', time: '20:45', status: 'LIVE', odds: '1.95 / 3.15 / 2.25' },
            { league: 'World Cup', match: 'Brazil vs Germany', time: '02:00', status: 'UPCOMING', odds: '1.90 / 3.25 / 2.20' }
        ];

        window.pressedKeys = {};

        // --- 4. LOGIN & INITIALIZATION & SAVE SYSTEM ---
        window.onload = () => {
            setupCanvasSize();
            checkAndDisplayLocalSave();

            if (window.loadMapDecorations) window.loadMapDecorations();

            // Start playing the gothic default menu music
            audio.init();
            audio.playBgm('default');
            
            const autoFarmBtn = document.getElementById('autoFarmBtn');
            if(autoFarmBtn) autoFarmBtn.addEventListener('click', toggleAutoFarm);

            // Listen to page sizing
            window.addEventListener('resize', setupCanvasSize);

            // Canvas nhận click trực tiếp - tất cả UI dùng position:fixed bên ngoài
            canvas.addEventListener('click', handleWorldClick);
            canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleWorldClick(e.touches[0]); }, {passive:false});
            canvas.addEventListener('mousemove', handleSkillCursor);
            canvas.addEventListener('mouseout', () => { skillCursor = null; });

            // Lắng nghe bàn phím di chuyển (WASD / Phím mũi tên) và phím tắt menu
            window.addEventListener('keydown', (e) => {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                let key = e.key.toLowerCase();
                window.pressedKeys[key] = true;
                handleKeyDown(e);
            });
            window.addEventListener('keyup', (e) => {
                let key = e.key.toLowerCase();
                window.pressedKeys[key] = false;
            });

            // PvP Network Broadcast Incoming Message Route
            pvpChannel.onmessage = (e) => { handleNetworkMessage(e.data); };
            chatChannel.onmessage = (e) => {
                if(!e.data || !e.data.type) return;
                if(e.data.type === 'CHAT_MESSAGE') {
                    appendChatMessage(e.data.sender, e.data.message, false);
                }
            };

            // Setup Network Tick Pulse (Every 1 second)
            setInterval(broadcastMyPresence, 2000); // 2s per update for Firestore limits
            // Setup Cleanup Tick for offline network players
            setInterval(cleanupNetworkPlayers, 4000);
            // Setup Autosave Interval (Every 30 seconds)
            setInterval(autosaveGameProcess, 30000);
        };

        function setupCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            mCanvas.width = 150;
            mCanvas.height = 150;
        }

        function checkAndDisplayLocalSave() {
            let saved = localStorage.getItem(SAVE_KEY);
            let notice = document.getElementById('saveNotice');
            if (!notice) return;
            if(saved) {
                try {
                    let data = JSON.parse(saved);
                    notice.innerHTML = `💾 Phát hiện dữ liệu cũ: <b>${data.name}</b> (Cấp ${data.level} ${CLASS_DATA[data.classId]?.name || ''})<br><span style="text-decoration:underline; cursor:pointer;" onclick="loadGameFromLocal()">[NHẤP VÀO ĐÂY ĐỂ TẢI TIẾN TRÌNH]</span>`;
                    notice.style.display = "block";
                } catch(e) { localStorage.removeItem(SAVE_KEY); }
            } else {
                notice.style.display = "none";
            }
        }

        function submitLogin() {
            let nameInp = document.getElementById('usernameInp').value.trim();
            if(!nameInp) { alert("Vui lòng nhập tên Anh Hùng hợp lệ!"); return; }
            player.name = nameInp;
            audio.play('click');
            
            // Switch to class choice screen
            switchScreen('classScreen');
        }

        function selectClass(cId) {
            audio.play('click');
            document.querySelectorAll('.class-card').forEach(card => card.classList.remove('selected'));
            document.querySelector(`.class-card.${cId}`).classList.add('selected');
            player.classId = cId;
        }

        function confirmClass() {
            if(!player.classId) { alert("Vui lòng nhấp chọn một loại Nghề Nghiệp!"); return; }
            audio.play('levelup');

            // Apply specific stats from config template
            let t = CLASS_DATA[player.classId];
            player.hp = player.maxHp = t.hp;
            player.mp = player.maxMp = t.mp;
            player.baseAtk = t.atk;
            player.baseDef = t.def;
            player.baseSpeed = t.speed;
            player.skills = JSON.parse(JSON.stringify(t.skills));

            // Run lore/story overview intro sequence
            showLoreOverlay();
        }

        function showLoreOverlay() {
            switchScreen('gameScreen');
            document.getElementById('loreOverlay').style.display = "flex";
            let txt = `Chào mừng tân binh ${player.name} gia nhập Xóm Anh Hùng! Vào năm 2026, một thế lực hắc ám bí ẩn thức tỉnh, biến đổi tất cả muỗi vằn, chuột cống và sinh vật bình dị quanh xóm thành ma quỷ khát máu hung hãn. Trưởng Làng, Bác Thợ Rèn và Cô Ba Tạp Hóa đang gồng mình chống cự tại trung tâm. Sứ mệnh của cậu là đi săn quái vật tích lũy kinh nghiệm, rèn vũ khí tối tân, phối hợp hoặc so tài cùng các Anh Hùng làng bên để chuẩn bị tiêu diệt Siêu Đại Quái Thần Trùng bảo vệ bình yên vĩnh cửu cho giang sơn bờ cõi!`;
            document.getElementById('loreContentText').textContent = txt;
        }

        function closeLoreOverlay() {
            audio.play('click');
            document.getElementById('loreOverlay').style.display = "none";
            
            // Start core game dynamic loops
            spawnInitialMonsters();
            requestAnimationFrame(mainGameLoop);
            rebuildQuickSkillBarUI();
            refreshHudDisplay();
            showToast("🎮 Chào mừng bạn! Nhấp chuột lên bãi đất trống để di chuyển.");
        }

        window.switchScreen = function(sId) {
            currentScreen = sId;
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const el = document.getElementById(sId);
            if(el) el.classList.add('active');

            if(sId === 'gameScreen') {
                audio.playBgm('aresden'); // Main game zone theme
            } else if(sId === 'loginScreen' || sId === 'characterSelectScreen' || sId === 'classScreen' || sId === 'serverScreen') {
                audio.playBgm('default'); // Menu login/char select theme
            } else {
                audio.stopBgm();
            }
        };
        const switchScreen = window.switchScreen;

        // --- LOCAL STORAGE CORE SAVE/LOAD ENGINE ---
        function autosaveGameProcess() {
            if(currentScreen !== 'gameScreen') return;
            saveGameToLocal();
            let ind = document.getElementById('saveIndicator');
            ind.style.display = "block";
            setTimeout(() => ind.style.display = "none", 2500);
        }

        function triggerManualSave() {
            audio.play('quest');
            saveGameToLocal();
            showToast("💾 Hệ thống đã lưu tiến trình của bạn thành công!");
        }

        function saveGameToLocal() {
            let stateToSave = {
                name: player.name,
                classId: player.classId,
                level: player.level,
                exp: player.exp,
                maxExp: player.maxExp,
                hp: player.hp,
                maxHp: player.maxHp,
                mp: player.mp,
                maxMp: player.maxMp,
                baseAtk: player.baseAtk,
                baseDef: player.baseDef,
                baseSpeed: player.baseSpeed,
                gold: player.gold,
                x: player.x,
                y: player.y,
                inventory: player.inventory,
                equipment: player.equipment,
                quests: player.quests
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
        }

        function loadGameFromLocal() {
            let saved = localStorage.getItem(SAVE_KEY);
            if(!saved) return;
            try {
                let data = JSON.parse(saved);
                player.name = data.name;
                player.classId = data.classId;
                player.level = data.level;
                player.exp = data.exp;
                player.maxExp = data.maxExp;
                player.hp = data.hp;
                player.maxHp = data.maxHp;
                player.mp = data.mp;
                player.maxMp = data.maxMp;
                player.baseAtk = data.baseAtk;
                player.baseDef = data.baseDef;
                player.baseSpeed = data.baseSpeed;
                player.gold = data.gold;
                player.x = data.x;
                player.y = data.y;
                player.inventory = data.inventory;
                player.equipment = data.equipment;
                player.quests = data.quests;

                // Re-hydrate skill template based on restored class ID
                let t = CLASS_DATA[player.classId];
                player.skills = JSON.parse(JSON.stringify(t.skills));

                switchScreen('gameScreen');
                spawnInitialMonsters();
                requestAnimationFrame(mainGameLoop);
                
                showToast(`💾 Đã tải thành công nhân vật cũ: ${player.name}!`);
            } catch(e) {
                alert("Lỗi cấu trúc file save, không thể phục hồi dữ liệu!");
            }
        }

        // --- 5. PVP MULTIPLAYER SYSTEM via BROADCAST CHANNEL (Fixed + Team PvP) ---
        function broadcastMyPresence() {
            if(currentScreen !== 'gameScreen') return;
            pvpChannel.postMessage({
                type: 'PRESENCE',
                id: myNetworkId,
                name: player.name,
                classId: player.classId,
                level: player.level,
                hp: player.hp,
                maxHp: getEffectiveMaxHp(),
                x: player.x,
                y: player.y,
                partyId: partySystem.partyId,
                leaderId: partySystem.leaderId
            });
        }

        function handleNetworkMessage(msg) {
            if(!msg || msg.id === myNetworkId) return;

            if(msg.type === 'PRESENCE') {
                networkPlayers[msg.id] = { ...msg, lastSeen: Date.now() };
                partySystem.updateMemberPresence(msg);
                rebuildPvpLobbyUI();
                rebuildPartyPanel();
            }
            else if(msg.type === 'PARTY_INVITE' && msg.targetId === myNetworkId) {
                audio.play('quest');
                if(partySystem.partyId) {
                    pvpChannel.postMessage({ type: 'PARTY_INVITE_REPLY', id: myNetworkId, targetId: msg.id, accepted: false, name: player.name, reason: 'already_in_party' });
                    showToast('?? B?n ?? c? t? ??i, kh?ng th? nh?n l?i m?i kh?c.');
                    return;
                }
                // Auto-accept setting
                if(window.autoAcceptParty) {
                    partySystem.joinParty(msg.partyId, msg.id, msg.senderName);
                    pvpChannel.postMessage({ type: 'PARTY_INVITE_REPLY', id: myNetworkId, targetId: msg.id, accepted: true, name: player.name });
                    showToast(`🤝 Tự động gia nhập đội của ${msg.senderName}!`);
                    return;
                }
                if(window.autoRejectParty) {
                    pvpChannel.postMessage({ type: 'PARTY_INVITE_REPLY', id: myNetworkId, targetId: msg.id, accepted: false, name: player.name });
                    showToast(`🚫 Tự động từ chối lời mời từ ${msg.senderName}.`);
                    return;
                }
                // Show modal
                window.__partyInviteMsg = msg;
                document.getElementById('partyInviteText').innerHTML =
                    `<b style="color:#93c5fd;">${msg.senderName}</b> mời bạn gia nhập tổ đội của họ!<br><span style="color:#64748b;font-size:0.82rem;">Cùng chia sẻ vàng, EXP và chiến đấu đội nhóm.</span>`;
                document.getElementById('partyAutoHint').textContent = '💡 Bật "Tự động" trong tab Tổ Đội để không cần xác nhận mỗi lần.';
                document.getElementById('partyInviteModal').style.display = 'flex';
            }
            else if(msg.type === 'PARTY_INVITE_REPLY' && msg.targetId === myNetworkId) {
                if(msg.accepted) {
                    if(partySystem.leaderId !== myNetworkId || !partySystem.partyId) return;
                    partySystem.addMember(msg.id, msg.name);
                    showToast(`?? ${msg.name} ?? gia nh?p ??i c?a b?n!`);
                    rebuildPartyPanel();
                } else {
                    let reason = msg.reason === 'already_in_party' ? ' v? h? ?? c? t? ??i.' : '.';
                    showToast(`?? ${msg.name} t? ch?i l?i m?i v?o ??i${reason}`);
                }
            }
            else if(msg.type === 'PARTY_DISBAND' && msg.partyId === partySystem.partyId) {
                partySystem.partyId = null; partySystem.leaderId = null; partySystem.members = {};
                showToast(`?? Tr??ng ??i ${msg.name || ''} ?? gi?i t?n t? ??i.`);
                rebuildPartyPanel(); updatePartyHud();
            }
            else if(msg.type === 'PARTY_LEAVE') {
                partySystem.removeMember(msg.id);
                showToast(`👋 ${msg.name} đã rời khỏi tổ đội.`);
                rebuildPartyPanel();
            }
            else if(msg.type === 'PARTY_XP_SHARE' && partySystem.isInSameParty(msg.partyId)) {
                let sharedGold = Math.round(msg.gold * 0.3);
                let sharedExp = Math.round(msg.exp * 0.3);
                player.gold += sharedGold;
                player.exp += sharedExp;
                if(sharedGold > 0) createFloatingText(`+${sharedGold}g đội`, player.x, player.y - 20, '#ffd700');
                refreshHudDisplay();
            }
            else if(msg.type === 'BOARD_PVP_START') {
                boardApplyNetworkState(msg);
                showToast('?? ?? v?o ph?ng PvP C? V? ??ch.');
            }
            else if(msg.type === 'BOARD_PVP_STATE') {
                boardApplyNetworkState(msg);
            }
            else if(msg.type === 'BOARD_ROLL_REQUEST' && boardGame.pvp && boardGame.hostId === myNetworkId && msg.hostId === myNetworkId) {
                let cur = boardGame.players[boardGame.currentTurn];
                if(cur && cur.networkId === msg.id && !boardGame.isRolling && !boardGame.gameOver) boardRollForCurrentPlayer();
            }
            else if(msg.type === 'CHALLENGE' && msg.targetId === myNetworkId) {
                audio.play('quest');
                window.__pvpMsg = msg;
                let challengerTeam = msg.challengerTeam || [];
                let teamText = challengerTeam.length > 1
                    ? `<br><span style="color:#fbbf24;font-size:0.82rem;">⚠️ Thách đấu TỔ ĐỘI — ${challengerTeam.length} vs ${partySystem.getMemberCount()} người</span>`
                    : '';
                // Auto-accept
                if(window.autoAcceptPvp) {
                    pvpChannel.postMessage({ type: 'CHALLENGE_REPLY', id: myNetworkId, senderId: msg.id, targetId: msg.id, accepted: true, replierName: player.name });
                    showToast(`⚔️ Tự động nghênh chiến ${msg.senderName}!`);
                    setTimeout(() => executePvpAttackStrike(msg.id), 500);
                    return;
                }
                // Auto-reject
                if(window.autoRejectPvp) {
                    pvpChannel.postMessage({ type: 'CHALLENGE_REPLY', id: myNetworkId, senderId: msg.id, targetId: msg.id, accepted: false, replierName: player.name });
                    showToast(`🏳️ Tự động từ chối thách đấu từ ${msg.senderName}.`);
                    return;
                }
                // Show modal
                document.getElementById('pvpChallengeText').innerHTML =
                    `⚔️ <b>${msg.senderName || 'Người chơi'}</b> (Lv.${msg.senderLevel || '?'}) muốn tỉ thí với bạn!${teamText}`;
                document.getElementById('pvpAutoHint').textContent = '💡 Bật "Tự động" trong tab Đấu Trường để không cần xác nhận.';
                document.getElementById('pvpChallengeModal').style.display = 'flex';
            }
            else if(msg.type === 'CHALLENGE_REPLY' && msg.targetId === myNetworkId) {
                if(msg.accepted) {
                    showToast(`⚔️ ${msg.replierName} CHẤP NHẬN thách đấu! Bắt đầu giao tranh!`);
                    executePvpAttackStrike(msg.senderId);
                    // Notify party members to also attack
                    if(partySystem.partyId) {
                        pvpChannel.postMessage({ type: 'PARTY_PVP_ATTACK', partyId: partySystem.partyId, targetId: msg.senderId, attackerId: myNetworkId });
                    }
                } else {
                    showToast(`🏳️ ${msg.replierName} đã từ chối vì khiếp sợ!`);
                }
            }
            else if(msg.type === 'ATTACK' && msg.targetId === myNetworkId) {
                audio.play('hit');
                let damageTaken = Math.max(5, Math.round(msg.damage - getEffectiveDef() * 0.5));
                // Reduce damage if party members present (shield bonus)
                if(partySystem.getMemberCount() > 1) damageTaken = Math.round(damageTaken * 0.75);
                player.hp = Math.max(0, player.hp - damageTaken);
                createParticle("💥", player.x, player.y);
                createFloatingText(`-${damageTaken} PvP`, player.x, player.y, '#ff3d00');

                if(player.hp <= 0) {
                    showToast(`💀 Bị hạ gục bởi ${msg.senderName}!`);
                    pvpChannel.postMessage({ type: 'MATCH_RESULT', id: myNetworkId, winnerId: msg.id, loserName: player.name });
                    setTimeout(() => { respawnPlayerCenter(); showToast("😇 Hồi sinh giữa bản đồ!"); }, 3000);
                } else {
                    setTimeout(() => { executePvpAttackStrike(msg.id); }, 1200);
                }
                refreshHudDisplay();
            }
            else if(msg.type === 'PARTY_PVP_ATTACK' && msg.partyId !== partySystem.partyId) {
                // An enemy party member attacks — we defend
                if(partySystem.getMemberCount() > 0) {
                    let dmg = Math.max(3, 8 - getEffectiveDef());
                    player.hp = Math.max(1, player.hp - dmg);
                    createFloatingText(`-${dmg} 팀PvP`, player.x, player.y, '#f97316');
                    refreshHudDisplay();
                }
            }
            else if(msg.type === 'MATCH_RESULT' && msg.winnerId === myNetworkId) {
                audio.play('levelup');
                let reward = 100 + partySystem.getMemberCount() * 30;
                player.gold += reward;
                showToast(`🏆 CHIẾN THẮNG! Hạ gục ${msg.loserName}, nhận ${reward} Vàng!`);
                refreshHudDisplay();
            }
        }

        function challengePlayer(oppId) {
            let opp = networkPlayers[oppId];
            if(!opp) return;
            audio.play('click');
            let myTeam = partySystem.getMemberIds();
            showToast(`📩 Gửi thách đấu tới ${opp.name}${myTeam.length > 1 ? ` (kéo theo ${myTeam.length-1} đồng đội!)` : ''}...`);
            pvpChannel.postMessage({
                type: 'CHALLENGE',
                id: myNetworkId,
                targetId: oppId,
                senderName: player.name,
                senderLevel: player.level,
                challengerTeam: myTeam
            });
        }

        function executePvpAttackStrike(oppId) {
            let opp = networkPlayers[oppId];
            if(!opp || player.hp <= 0) return;
            let dmg = getEffectiveAtk();
            let isCrit = Math.random() < 0.25;
            if(isCrit) dmg = Math.round(dmg * 1.6);
            // Party bonus damage
            dmg = Math.round(dmg * (1 + partySystem.getMemberCount() * 0.15));

            showToast(`⚔️ Tung chiêu${partySystem.getMemberCount()>1?' (đội '+partySystem.getMemberCount()+'người)':''} vào ${opp.name}! ${isCrit?'CHÍ MẠNG!':''}`);
            pvpChannel.postMessage({
                type: 'ATTACK',
                id: myNetworkId,
                targetId: oppId,
                senderName: player.name,
                damage: dmg
            });
        }

        function cleanupNetworkPlayers() {
            let now = Date.now();
            let changed = false;
            for(let id in networkPlayers) {
                if(now - networkPlayers[id].lastSeen > 6000) {
                    delete networkPlayers[id];
                    partySystem.removeMember(id);
                    changed = true;
                }
            }
            if(changed) { rebuildPvpLobbyUI(); rebuildPartyPanel(); }
        }

        function rebuildPvpLobbyUI() {
            let container = document.getElementById('pvpPlayerList');
            if(!container) return;
            container.innerHTML = "";
            let keys = Object.keys(networkPlayers);
            if(keys.length === 0) {
                container.innerHTML = `<div style="text-align:center;color:#777;padding:20px;">Không tìm thấy Anh Hùng nào ở các tab lân cận...</div>`;
                return;
            }
            keys.forEach(id => {
                let opp = networkPlayers[id];
                let clsInfo = CLASS_DATA[opp.classId]?.name || "Vô Danh";
                let clsEmoji = CLASS_DATA[opp.classId]?.emoji || "👤";
                let inMyParty = partySystem.isMember(id);
                let div = document.createElement('div');
                div.className = "shop-item";
                div.innerHTML = `
                    <div class="item-meta">
                        <div style="font-size:1.8rem;">${clsEmoji}</div>
                        <div class="item-details">
                            <h4>${opp.name} (Lv.${opp.level}) ${inMyParty?'<span style="color:#4ade80;font-size:0.75rem;">🤝ĐỘI</span>':''}</h4>
                            <p>${clsInfo} | HP: ${opp.hp}/${opp.maxHp}</p>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:4px;">
                        <button class="btn-sm" style="background:var(--red);" onclick="challengePlayer('${id}')">⚔️ KHIÊU CHIẾN</button>
                        ${!inMyParty ? `<button class="btn-sm" style="background:#1d4ed8;font-size:0.72rem;" onclick="partySystem.invite('${id}')">🤝 Mời Vào Đội</button>` : `<button class="btn-sm" style="background:#6b7280;font-size:0.72rem;" onclick="partySystem.kick('${id}')">❌ Mời Ra</button>`}
                    </div>
                `;
                container.appendChild(div);
            });
        }

        // ===== PARTY SYSTEM CLASS =====
        const partySystem = {
            partyId: null,
            leaderId: null,
            members: {}, // id -> { name, hp, maxHp, classId }

            create() {
                if(this.partyId) return;
                this.partyId = 'party_' + myNetworkId;
                this.leaderId = myNetworkId;
                this.members[myNetworkId] = { name: player.name, hp: player.hp, maxHp: getEffectiveMaxHp(), classId: player.classId };
                showToast('🎉 Đã tạo tổ đội mới! Mời thành viên vào đội.');
                rebuildPartyPanel();
                updatePartyHud();
            },

            invite(targetId) {
                if(this.partyId && this.leaderId !== myNetworkId) { showToast('?? Ch? tr??ng ??i m?i ???c m?i th?nh vi?n.'); return; }
                if(!this.partyId) this.create();
                let opp = networkPlayers[targetId];
                if(!opp) return;
                if(opp.partyId && opp.partyId !== this.partyId) { showToast('?? Ng??i ch?i n?y ?ang ? t? ??i kh?c.'); return; }
                pvpChannel.postMessage({
                    type: 'PARTY_INVITE', id: myNetworkId, targetId,
                    partyId: this.partyId, senderName: player.name
                });
                showToast(`📩 Đã gửi lời mời tổ đội tới ${opp.name}`);
            },

            joinParty(partyId, leaderId, leaderName) {
                if(this.partyId && this.partyId !== partyId) { showToast('?? B?n ?? c? t? ??i. H?y r?i ??i hi?n t?i tr??c.'); return false; }
                this.partyId = partyId;
                this.leaderId = leaderId;
                this.members = {};
                this.members[myNetworkId] = { name: player.name, hp: player.hp, maxHp: getEffectiveMaxHp(), classId: player.classId };
                this.members[leaderId] = { name: leaderName, hp: 100, maxHp: 100, classId: networkPlayers[leaderId]?.classId || 'cop' };
                rebuildPartyPanel();
                updatePartyHud();
                return true;
            },

            addMember(id, name) {
                let np = networkPlayers[id];
                this.members[id] = { name, hp: np?.hp || 100, maxHp: np?.maxHp || 100, classId: np?.classId || 'cop' };
                updatePartyHud();
            },

            removeMember(id) {
                if(this.members[id]) {
                    delete this.members[id];
                    if(Object.keys(this.members).length <= 1) {
                        this.partyId = null;
                        this.leaderId = null;
                        this.members = {};
                    }
                    updatePartyHud();
                }
            },

            kick(id) {
                if(this.leaderId !== myNetworkId) { showToast('⚠️ Chỉ trưởng nhóm mới có thể mời ra!'); return; }
                this.removeMember(id);
                pvpChannel.postMessage({ type: 'PARTY_LEAVE', id: myNetworkId, name: player.name });
                showToast(`👟 Đã kick thành viên khỏi đội.`);
                rebuildPartyPanel();
            },

            disband() {
                if(!this.partyId) return;
                if(this.leaderId !== myNetworkId) { showToast('?? Ch? tr??ng ??i m?i ???c gi?i t?n t? ??i.'); return; }
                let oldPartyId = this.partyId;
                pvpChannel.postMessage({ type: 'PARTY_DISBAND', id: myNetworkId, partyId: oldPartyId, name: player.name });
                this.partyId = null; this.leaderId = null; this.members = {};
                showToast('?? ?? gi?i t?n t? ??i.');
                rebuildPartyPanel(); updatePartyHud();
            },

            leave() {
                if(!this.partyId) return;
                pvpChannel.postMessage({ type: 'PARTY_LEAVE', id: myNetworkId, name: player.name });
                this.partyId = null; this.leaderId = null; this.members = {};
                showToast('👋 Đã rời tổ đội.');
                rebuildPartyPanel(); updatePartyHud();
            },

            isMember(id) { return !!this.members[id]; },
            isInSameParty(pid) { return this.partyId && this.partyId === pid; },
            getMemberCount() { return Object.keys(this.members).length; },
            getMemberIds() { return Object.keys(this.members); },

            updateMemberPresence(msg) {
                if(this.members[msg.id]) {
                    this.members[msg.id].hp = msg.hp;
                    this.members[msg.id].maxHp = msg.maxHp;
                    updatePartyHud();
                }
            },

            broadcastXpShare(gold, exp) {
                if(!this.partyId || Object.keys(this.members).length <= 1) return;
                pvpChannel.postMessage({ type: 'PARTY_XP_SHARE', partyId: this.partyId, id: myNetworkId, gold, exp });
            }
        };

        function rebuildPartyPanel() {
            let statusBox = document.getElementById('partyStatusBox');
            let inviteList = document.getElementById('partyInviteList');
            if(!statusBox || !inviteList) return;

            if(partySystem.partyId) {
                let members = partySystem.members;
                let memberHtml = Object.entries(members).map(([id, m]) => {
                    let isLeader = id === partySystem.leaderId;
                    let cls = CLASS_DATA[m.classId];
                    let hpPct = Math.round((m.hp / m.maxHp) * 100);
                    return `<div class="board-player-row ${id===myNetworkId?'current':''}">
                        <span style="font-size:1.3rem;">${cls?.emoji||'👤'}</span>
                        <div style="flex:1;">
                            <div style="font-size:0.78rem;font-weight:700;">${m.name} ${isLeader?'👑':''}${id===myNetworkId?' (Bạn)':''}</div>
                            <div style="background:#333;height:4px;border-radius:2px;margin-top:2px;"><div style="height:100%;width:${hpPct}%;background:#22c55e;border-radius:2px;"></div></div>
                        </div>
                    </div>`;
                }).join('');
                statusBox.innerHTML = `
                    <div style="background:rgba(34,197,94,0.1);border:1px solid #22c55e;border-radius:10px;padding:10px;margin-bottom:10px;">
                        <div style="color:#4ade80;font-weight:800;margin-bottom:6px;">🤝 TỔ ĐỘI HIỆN TẠI (${Object.keys(members).length} người)</div>
                        ${memberHtml}
                        ${partySystem.leaderId===myNetworkId ? '<button class="btn-sm" style="background:#b91c1c;width:100%;margin-top:8px;" onclick="partySystem.disband()">?? Gi?i T?n ??i</button>' : '<button class="btn-sm" style="background:#dc2626;width:100%;margin-top:8px;" onclick="partySystem.leave()">?? R?i ??i</button>'}
                    </div>`;
            } else {
                statusBox.innerHTML = `<div style="color:#888;text-align:center;padding:10px;font-size:0.85rem;">Bạn chưa ở trong tổ đội nào.<br>Mời người chơi khác để bắt đầu!</div>`;
            }

            inviteList.innerHTML = '';
            Object.entries(networkPlayers).forEach(([id, opp]) => {
                if(partySystem.isMember(id)) return;
                let cls = CLASS_DATA[opp.classId];
                let div = document.createElement('div');
                div.className = 'shop-item';
                div.innerHTML = `
                    <div class="item-meta">
                        <div style="font-size:1.5rem;">${cls?.emoji||'👤'}</div>
                        <div class="item-details">
                            <h4>${opp.name} (Lv.${opp.level})</h4>
                            <p>${cls?.name||'?'}</p>
                        </div>
                    </div>
                    <button class="btn-sm" style="background:#1d4ed8;" onclick="partySystem.invite('${id}')">🤝 Mời</button>
                `;
                inviteList.appendChild(div);
            });
            if(inviteList.children.length === 0 && !partySystem.partyId) {
                inviteList.innerHTML = '<div style="color:#666;font-size:0.8rem;text-align:center;">Không có người chơi nào để mời. Mở tab khác!</div>';
            }
        }

        function updatePartyHud() {
            let hud = document.getElementById('partyHud');
            if(!hud) return;
            let members = partySystem.members;
            if(Object.keys(members).length <= 1 && !partySystem.partyId) { hud.style.display = 'none'; return; }
            hud.style.display = 'block';
            hud.innerHTML = `<div class="party-hud-title">🤝 TỔ ĐỘI (${Object.keys(members).length})</div>` +
                Object.entries(members).map(([id, m]) => {
                    let hpPct = Math.round((m.hp/m.maxHp)*100);
                    let cls = CLASS_DATA[m.classId];
                    return `<div class="party-member-row">
                        <span class="party-member-avatar">${cls?.emoji||'👤'}</span>
                        <div class="party-member-info">
                            <div class="party-member-name">${m.name}${id===myNetworkId?' ★':''}</div>
                            <div class="party-mini-bar"><div class="party-mini-hp" style="width:${hpPct}%;background:${hpPct>50?'#22c55e':hpPct>25?'#f59e0b':'#ef4444'};"></div></div>
                        </div>
                    </div>`;
                }).join('');
        }

        // ===== 🏁 BOARD GAME: CỜ ĐUA THẺ BÀI =====
        const BOARD_TOTAL_CELLS = 40;
        const BOARD_PIECES_PER_PLAYER = 4;
        const BOARD_DICE_EMOJIS = ['?','?','?','?','?','?'];
        const PLAYER_COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b'];
        const PLAYER_EMOJIS = ['??','??','??','??'];

        const MAGIC_CARDS = [
            { name: "?? Gi? Thu?n", rarity: 'common', desc: "Ti?n th?m 3 ?!", effect: (p) => { boardMovePlayer(p.idx, 3, true); return 'Ti?n th?m 3 ?.'; } },
            { name: "?? L?c Xo?y", rarity: 'common', desc: "L?i 2 ?!", effect: (p) => { boardMovePlayer(p.idx, -2, true); return 'L?i 2 ?.'; } },
            { name: "? V?n May", rarity: 'common', desc: "+30 v?ng th??ng!", effect: (p) => { if(p.networkId === myNetworkId || p.isHuman) { player.gold += 30; refreshHudDisplay(); } return 'Nh?n 30 v?ng.'; } },
            { name: "?? Ng? G?t", rarity: 'common', desc: "M?t l??t ti?p theo!", effect: (p) => { p.skipTurn = true; return 'M?t l??t k? ti?p.'; } },
            { name: "?? Ho?n V?", rarity: 'common', desc: "??i v? tr? v?i ng??i g?n nh?t!", effect: (p) => boardSwapNearest(p) },
            { name: "?? Si?u T?c", rarity: 'rare', desc: "Ti?n th?m 10 ?!", effect: (p) => { boardMovePlayer(p.idx, 10, true); return 'Ti?n th?m 10 ?.'; } },
            { name: "?? Nam Ch?m", rarity: 'rare', desc: "K?o ng??i d?n ??u v? v? tr? b?n!", effect: (p) => boardPullLeader(p) },
            { name: "??? Mi?n Nhi?m", rarity: 'rare', desc: "Mi?n d?ch hi?u ?ng x?u 2 l??t!", effect: (p) => { p.immune = 2; return 'Mi?n nhi?m 2 l??t.'; } },
            { name: "?? B?y M?n", rarity: 'rare', desc: "??t b?y ? ? hi?n t?i.", effect: (p) => { boardTrapCell(p.pos); return '?? ??t b?y.'; } },
            { name: "?? Thi?n M?nh", rarity: 'epic', desc: "Ti?n g?n v? ??ch.", effect: (p) => { if(p.pieces) p.pieces[p.activePiece || 0] = Math.min(38, BOARD_TOTAL_CELLS-2); boardSyncPlayerPos(p); boardRenderGrid(); return 'V?t l?n g?n ??ch.'; } },
            { name: "?? Thi?n Th?ch", rarity: 'epic', desc: "Ng??i ch?i kh?c l?i 4 ?!", effect: (p) => { boardGame.players.forEach((pl,i) => { if(i!==p.idx && !pl.immune) boardMovePlayer(i,-4,true); }); return 'T?t c? ??i th? l?i 4 ?.'; } },
            { name: "?? B?nh Y?n", rarity: 'epic', desc: "Kh?ng c? bi?n c?.", effect: () => 'L??t n?y b?nh y?n.' },
        ];

        const BOARD_SPECIALS = {};

        let boardGame = {
            players: [],
            currentTurn: 0,
            isRolling: false,
            trappedCells: {},
            log: [],
            gameOver: false,
            pvp: false,
            hostId: null
        };

        function createBoardPlayer({ idx, name, networkId = null, isLocal = false, isBot = false, classId = null }) {
            return {
                idx,
                name,
                networkId,
                pos: -1,
                pieces: [-1,-1,-1,-1],
                activePiece: 0,
                finished: 0,
                color: PLAYER_COLORS[idx] || PLAYER_COLORS[0],
                emoji: isBot ? PLAYER_EMOJIS[idx] : (CLASS_DATA[classId || player.classId]?.emoji || PLAYER_EMOJIS[idx] || '??'),
                isHuman: isLocal,
                isBot,
                skipTurn: false,
                immune: 0
            };
        }

        function openBoardGame(pvpMode = false) {
            audio.play('click');
            boardGame = { players: [], currentTurn: 0, isRolling: false, trappedCells: {}, log: [], gameOver: false, pvp: !!pvpMode, hostId: pvpMode ? myNetworkId : null };
            boardGame.players.push(createBoardPlayer({ idx: 0, name: player.name, networkId: myNetworkId, isLocal: true, classId: player.classId }));

            if(pvpMode) {
                Object.entries(networkPlayers).slice(0, 3).forEach(([id, opp]) => {
                    boardGame.players.push(createBoardPlayer({ idx: boardGame.players.length, name: opp.name, networkId: id, classId: opp.classId }));
                });
                if(boardGame.players.length < 2) {
                    showToast('?? Ch?a c? ng??i ch?i online ?? PvP c?. M? th?m tab ho?c d?ng th?m Bot.');
                    boardGame.pvp = false;
                    boardGame.hostId = null;
                    boardAddBot();
                } else {
                    boardBroadcastState('start');
                }
            } else {
                boardAddBot();
            }

            boardRenderGrid();
            boardRenderPlayers();
            boardUpdateRollBtn();
            document.getElementById('boardGameModal').classList.add('active');
            boardAddLog(`${boardGame.pvp ? '?? PvP C? V? ??ch' : '?? C? V? ??ch'} b?t ??u. Tung 6 ?? xu?t qu?n, v? ?? 4 qu?n l? th?ng.`, 'special');
            boardBroadcastState('state');
        }

        function closeBoardGame() {
            document.getElementById('boardGameModal').classList.remove('active');
        }

        function boardAddBot() {
            if(boardGame.pvp) { showToast('?? ?ang ? ch? ?? PvP c?, kh?ng th?m Bot.'); return; }
            if(boardGame.players.length >= 4) { showToast('?? T?i ?a 4 ng??i ch?i!'); return; }
            let idx = boardGame.players.length;
            let botNames = ['Bot Tr? Tu?', 'Bot M?y M?c', 'Bot S?t'];
            boardGame.players.push(createBoardPlayer({ idx, name: botNames[idx-1] || `Bot ${idx}`, isBot: true }));
            boardRenderPlayers();
            boardAddLog(`?? ${botNames[idx-1]||'Bot'} tham gia!`);
        }

        function boardRenderGrid() {
            let grid = document.getElementById('boardGrid');
            grid.innerHTML = '';
            let rows = [];
            for(let r = 0; r < 4; r++) {
                let row = [];
                for(let c = 0; c < 10; c++) row.push(r * 10 + c + 1);
                if(r % 2 === 1) row.reverse();
                rows.push(row);
            }
            rows.reverse();
            rows.forEach(row => {
                row.forEach(cellNum => {
                    let realIdx = cellNum - 1;
                    let div = document.createElement('div');
                    div.className = 'board-cell' + (cellNum === 1 ? ' start' : '');
                    div.id = `bcell_${realIdx}`;
                    let tokens = boardGame.players.flatMap(p => (p.pieces || [p.pos]).map((pos, pieceIdx) => pos === realIdx ? `<div class="token" style="background:${p.color};" title="${p.name} - qu?n ${pieceIdx+1}"></div>` : '')).join('');
                    let trapped = boardGame.trappedCells[realIdx] ? '??' : '';
                    div.innerHTML = `<span class="cell-num">${cellNum}</span><span class="cell-emoji">${cellNum===1?'??':(cellNum===40?'??':trapped)}</span><div class="cell-tokens">${tokens}</div>`;
                    grid.appendChild(div);
                });
            });
        }

        function boardRenderPlayers() {
            let container = document.getElementById('boardPlayersContainer');
            container.innerHTML = boardGame.players.map((p,i) => `
                <div class="board-player-row ${i===boardGame.currentTurn&&!boardGame.gameOver?'current':''}">
                    <span style="font-size:1.2rem;">${p.emoji}</span>
                    <div style="flex:1;">
                        <div style="font-size:0.78rem;font-weight:700;color:${p.color};">${p.name} ${i===boardGame.currentTurn?'? L??t':''}${p.skipTurn?' ??':''}</div>
                        <div style="font-size:0.7rem;color:#888;">Chu?ng: ${(p.pieces||[]).filter(x=>x<0).length} ? ???ng: ${(p.pieces||[]).filter(x=>x>=0&&x<BOARD_TOTAL_CELLS-1).length} ? ??ch: ${p.finished||0}/${BOARD_PIECES_PER_PLAYER}</div>
                    </div>
                </div>
            `).join('');
        }

        function boardIsMyTurn() {
            let cur = boardGame.players[boardGame.currentTurn];
            if(!cur) return false;
            if(boardGame.pvp) return cur.networkId === myNetworkId;
            return !!cur.isHuman;
        }

        function boardUpdateRollBtn() {
            let btn = document.getElementById('rollDiceBtn');
            if(!btn) return;
            let isMyTurn = boardIsMyTurn();
            btn.disabled = boardGame.isRolling || boardGame.gameOver || !isMyTurn;
            btn.textContent = boardGame.gameOver ? '?? V?n ?? k?t th?c' : isMyTurn ? '?? Tung X?c X?c' : '? Ch? ??i th?...';
        }

        function boardRollDice() {
            if(boardGame.isRolling || boardGame.gameOver) return;
            let cur = boardGame.players[boardGame.currentTurn];
            if(!cur || !boardIsMyTurn()) return;
            if(boardGame.pvp && boardGame.hostId !== myNetworkId) {
                pvpChannel.postMessage({ type: 'BOARD_ROLL_REQUEST', id: myNetworkId, hostId: boardGame.hostId });
                boardGame.isRolling = true;
                boardUpdateRollBtn();
                return;
            }
            boardRollForCurrentPlayer();
        }

        function boardRollForCurrentPlayer() {
            let cur = boardGame.players[boardGame.currentTurn];
            if(!cur) return;
            boardGame.isRolling = true;
            boardUpdateRollBtn();
            boardDoRollAnimation(cur, () => {
                boardGame.isRolling = false;
                if(!boardGame.gameOver && cur.lastRoll === 6) {
                    boardAddLog(`?? ${cur.name} tung 6, ???c th?m l??t!`, 'special');
                    boardRenderPlayers();
                } else {
                    boardNextTurn();
                }
                boardUpdateRollBtn();
                boardBroadcastState('state');
            });
        }

        function boardDoRollAnimation(boardPlayer, callback) {
            let diceEl = document.getElementById('diceDisplay');
            let resultEl = document.getElementById('diceResultText');
            let roll = 1 + Math.floor(Math.random() * 6);
            let ticks = 0;
            let interval = setInterval(() => {
                diceEl.textContent = BOARD_DICE_EMOJIS[Math.floor(Math.random()*6)];
                diceEl.style.animation = 'none';
                diceEl.offsetHeight;
                diceEl.style.animation = 'diceRoll 0.5s ease';
                ticks++;
                if(ticks >= 6) {
                    clearInterval(interval);
                    diceEl.textContent = BOARD_DICE_EMOJIS[roll-1];
                    resultEl.textContent = `${boardPlayer.name} tung ???c: ${roll}`;
                    boardPlayer.lastRoll = roll;
                    boardProcessTurn(boardPlayer, roll, callback);
                }
            }, 100);
        }

        function boardSyncPlayerPos(p) {
            let moving = (p.pieces || []).filter(pos => pos >= 0 && pos < BOARD_TOTAL_CELLS - 1);
            p.pos = moving.length ? Math.max(...moving) : -1;
            p.finished = (p.pieces || []).filter(pos => pos >= BOARD_TOTAL_CELLS - 1).length;
        }

        function boardChoosePieceIndex(p, roll) {
            if(!p.pieces) p.pieces = [p.pos ?? -1, -1, -1, -1];
            if(roll === 6) {
                let homeIdx = p.pieces.findIndex(pos => pos < 0);
                if(homeIdx !== -1) return homeIdx;
            }
            let movable = p.pieces
                .map((pos, idx) => ({ pos, idx }))
                .filter(piece => piece.pos >= 0 && piece.pos < BOARD_TOTAL_CELLS - 1 && piece.pos + roll <= BOARD_TOTAL_CELLS - 1)
                .sort((a, b) => b.pos - a.pos);
            return movable.length ? movable[0].idx : -1;
        }

        function boardDrawRandomCard(p, reason) {
            if(boardGame.gameOver || !p) return;
            let card = MAGIC_CARDS[Math.floor(Math.random() * MAGIC_CARDS.length)];
            boardSyncPlayerPos(p);
            let result = card.effect(p);
            boardSyncPlayerPos(p);
            let cardHtml = `<div class="drawn-card ${card.rarity !== 'common' ? 'card-' + card.rarity : ''}">
                <div style="font-size:1.3rem;">${card.name}</div>
                <div style="font-size:0.78rem;color:#cbd5e1;margin-top:4px;">${card.desc}</div>
                <div style="font-size:0.72rem;color:#fbbf24;margin-top:2px;">${result}</div>
            </div>`;
            document.getElementById('boardCardDisplay').innerHTML = cardHtml;
            boardAddLog(`?? ${p.name} l?t th? ${reason || 'cu?i l??t'}: ${card.name} - ${result}`, 'card');
        }

        function boardKickOpponents(currentPlayer, landingPos) {
            if(landingPos < 0 || landingPos >= BOARD_TOTAL_CELLS - 1) return;
            boardGame.players.forEach(other => {
                if(other.idx === currentPlayer.idx || !other.pieces) return;
                other.pieces.forEach((pos, idx) => {
                    if(pos === landingPos) {
                        other.pieces[idx] = -1;
                        boardSyncPlayerPos(other);
                        boardAddLog(`?? ${currentPlayer.name} ?? qu?n c?a ${other.name} v? chu?ng!`, 'special');
                    }
                });
            });
        }

        function boardProcessTurn(p, roll, callback) {
            if(p.skipTurn) {
                p.skipTurn = false;
                boardAddLog(`?? ${p.name} m?t l??t v? ng? g?t!`);
                boardDrawRandomCard(p, 'sau l??t m?t l??t');
                if(callback) callback();
                return;
            }
            if(p.immune > 0) p.immune--;
            if(!p.pieces) p.pieces = [-1,-1,-1,-1];
            let pieceIdx = boardChoosePieceIndex(p, roll);
            if(pieceIdx === -1) {
                boardAddLog(`?? ${p.name} tung ${roll} nh?ng ch?a c? qu?n h?p l? ?? ?i${roll !== 6 ? ' (c?n 6 ?? xu?t chu?ng)' : ''}.`);
                boardDrawRandomCard(p, 'cu?i l??t');
                boardRenderGrid();
                boardRenderPlayers();
                if(callback) callback();
                return;
            }
            p.activePiece = pieceIdx;
            if(p.pieces[pieceIdx] < 0) {
                p.pieces[pieceIdx] = 0;
                boardAddLog(`?? ${p.name} xu?t qu?n ${pieceIdx + 1}!`, 'special');
            } else {
                boardMovePlayer(p.idx, roll, false);
                boardAddLog(`?? ${p.name} ?i qu?n ${pieceIdx + 1} th?m ${roll} ?.`);
            }
            let newPos = p.pieces[pieceIdx];
            setTimeout(() => {
                if(boardGame.trappedCells[newPos]) {
                    delete boardGame.trappedCells[newPos];
                    if(!p.immune) {
                        boardAddLog(`?? ${p.name} d?m b?y! L?i 3 ?!`, 'special');
                        boardMovePlayer(p.idx, -3, true);
                    } else {
                        boardAddLog(`??? ${p.name} mi?n nhi?m b?y!`);
                    }
                }
                boardKickOpponents(p, p.pieces[pieceIdx]);
                boardSyncPlayerPos(p);
                if((p.finished || 0) >= BOARD_PIECES_PER_PLAYER) {
                    boardGame.gameOver = true;
                    let prize = 200;
                    if(p.networkId === myNetworkId || p.isHuman) { player.gold += prize; refreshHudDisplay(); }
                    boardAddLog(`?? ${p.name} ??a ?? 4 qu?n v? ??CH! ${p.networkId === myNetworkId || p.isHuman ? '+200 V?ng!' : '??i th? th?ng!'}`, 'special');
                    document.getElementById('diceResultText').textContent = `?? ${p.name} CHI?N TH?NG!`;
                    showToast(`?? ${p.name} th?ng C? V? ??ch!`);
                    audio.play('levelup');
                } else {
                    boardDrawRandomCard(p, 'cu?i l??t');
                }
                boardRenderGrid();
                boardRenderPlayers();
                if(callback) callback();
            }, 400);
        }

        function boardMovePlayer(idx, steps, animate) {
            let p = boardGame.players[idx];
            if(!p) return;
            if(!p.pieces) p.pieces = [p.pos ?? -1, -1, -1, -1];
            let pieceIdx = p.activePiece ?? boardChoosePieceIndex(p, Math.max(0, steps));
            if(pieceIdx < 0) return;
            let current = p.pieces[pieceIdx];
            if(current < 0) return;
            let next = current + steps;
            if(next > BOARD_TOTAL_CELLS - 1) return;
            p.pieces[pieceIdx] = Math.max(0, Math.min(BOARD_TOTAL_CELLS - 1, next));
            boardSyncPlayerPos(p);
            if(animate) { boardRenderGrid(); boardRenderPlayers(); }
        }

        function boardSwapNearest(p) {
            let nearest = null; let minDist = Infinity;
            boardGame.players.forEach((pl,i) => {
                if(i !== p.idx) { let d = Math.abs((pl.pos || 0) - (p.pos || 0)); if(d < minDist) { minDist = d; nearest = pl; } }
            });
            if(nearest && nearest.pieces) {
                let pi = p.activePiece || 0;
                let ni = nearest.activePiece || 0;
                let tmp = p.pieces[pi];
                p.pieces[pi] = nearest.pieces[ni];
                nearest.pieces[ni] = tmp;
                boardSyncPlayerPos(p); boardSyncPlayerPos(nearest); boardRenderGrid();
                return `??i v? tr? v?i ${nearest.name}.`;
            }
            return 'Kh?ng c? ai ?? ??i.';
        }

        function boardPullLeader(p) {
            let leader = boardGame.players.reduce((a,b) => a.pos > b.pos ? a : b);
            if(leader.idx === p.idx) return 'B?n ?ang d?n ??u r?i.';
            if(leader.pieces) leader.pieces[leader.activePiece || 0] = Math.max(0, p.pos);
            boardSyncPlayerPos(leader);
            boardRenderGrid();
            return `K?o ${leader.name} v? ? ${p.pos+1}.`;
        }

        function boardTrapCell(pos) {
            if(pos >= 0) boardGame.trappedCells[pos] = true;
            boardRenderGrid();
        }

        function boardAddLog(text, type) {
            boardGame.log.push({ text, type });
            if(boardGame.log.length > 24) boardGame.log.shift();
            let logEl = document.getElementById('boardLog');
            if(!logEl) return;
            logEl.innerHTML = boardGame.log.map(l => `<p class="${l.type||''}">${l.text}</p>`).join('');
            logEl.scrollTop = logEl.scrollHeight;
        }

        function boardRunBotTurn(bot) {
            setTimeout(() => {
                if(boardGame.gameOver) return;
                boardRollForCurrentPlayer();
            }, 900);
        }

        function boardNextTurn() {
            if(boardGame.gameOver) return;
            boardGame.currentTurn = (boardGame.currentTurn + 1) % boardGame.players.length;
            let next = boardGame.players[boardGame.currentTurn];
            boardRenderPlayers();
            boardUpdateRollBtn();
            boardBroadcastState('state');
            if(next && next.isBot) boardRunBotTurn(next);
        }

        function boardBroadcastState(kind) {
            if(!boardGame.pvp || boardGame.hostId !== myNetworkId) return;
            pvpChannel.postMessage({
                type: kind === 'start' ? 'BOARD_PVP_START' : 'BOARD_PVP_STATE',
                id: myNetworkId,
                hostId: myNetworkId,
                targetIds: boardGame.players.map(p => p.networkId).filter(Boolean),
                boardGame: JSON.parse(JSON.stringify(boardGame)),
                cardHtml: document.getElementById('boardCardDisplay')?.innerHTML || '',
                diceText: document.getElementById('diceResultText')?.textContent || ''
            });
        }

        function boardApplyNetworkState(msg) {
            if(!msg.boardGame || !msg.targetIds?.includes(myNetworkId)) return;
            boardGame = msg.boardGame;
            boardGame.players.forEach((p, idx) => {
                p.idx = idx;
                p.isHuman = p.networkId === myNetworkId;
                p.isBot = false;
            });
            boardGame.isRolling = false;
            document.getElementById('boardGameModal').classList.add('active');
            if(msg.cardHtml) document.getElementById('boardCardDisplay').innerHTML = msg.cardHtml;
            if(msg.diceText) document.getElementById('diceResultText').textContent = msg.diceText;
            boardRenderGrid();
            boardRenderPlayers();
            boardUpdateRollBtn();
        }

        // === Wire all modal buttons after DOM ready ===
        window.autoAcceptPvp = false;
        window.autoRejectPvp = false;
        window.autoAcceptParty = false;
        window.autoRejectParty = false;

        function wireModalButtons() {
            // PvP accept
            document.getElementById('acceptPvpBtn').onclick = function() {
                document.getElementById('pvpChallengeModal').style.display = 'none';
                let msg = window.__pvpMsg;
                if(!msg) return;
                pvpChannel.postMessage({ type: 'CHALLENGE_REPLY', id: myNetworkId, senderId: msg.id, targetId: msg.id, accepted: true, replierName: player.name });
                showToast(`⚔️ Chấp nhận thách đấu! Nghênh chiến ${msg.senderName}!`);
                setTimeout(() => executePvpAttackStrike(msg.id), 500);
            };
            // PvP reject
            document.getElementById('rejectPvpBtn').onclick = function() {
                document.getElementById('pvpChallengeModal').style.display = 'none';
                let msg = window.__pvpMsg;
                if(!msg) return;
                pvpChannel.postMessage({ type: 'CHALLENGE_REPLY', id: myNetworkId, senderId: msg.id, targetId: msg.id, accepted: false, replierName: player.name });
                showToast('🏳️ Đã từ chối thách đấu.');
            };
            // Party accept
            document.getElementById('acceptPartyBtn').onclick = function() {
                document.getElementById('partyInviteModal').style.display = 'none';
                let msg = window.__partyInviteMsg;
                if(!msg) return;
                if(!partySystem.joinParty(msg.partyId, msg.id, msg.senderName)) return;
                pvpChannel.postMessage({ type: 'PARTY_INVITE_REPLY', id: myNetworkId, targetId: msg.id, accepted: true, name: player.name });
                showToast(`?? ?? gia nh?p ??i c?a ${msg.senderName}!`);
                rebuildPartyPanel();
            };
            // Party reject
            document.getElementById('rejectPartyBtn').onclick = function() {
                document.getElementById('partyInviteModal').style.display = 'none';
                let msg = window.__partyInviteMsg;
                if(!msg) return;
                pvpChannel.postMessage({ type: 'PARTY_INVITE_REPLY', id: myNetworkId, targetId: msg.id, accepted: false, name: player.name });
                showToast('🚫 Đã từ chối lời mời tổ đội.');
            };
        }
        // Call immediately — HTML is already parsed at this point since script is at end of body
        wireModalButtons();

        // --- 6. MONSTER SPAWNING & COMBAT SIMULATION ENGINE ---
        function spawnInitialMonsters() {
            monsters = [];
            
            if (window.generateMapDecorations) {
                window.generateMapDecorations(window.currentMapId || 'world');
            }

            if (window.currentMapId === 'world') {
                // Spawn 36 quái vật thường rải rác khắp bản đồ
                for(let i=0; i<36; i++) {
                    spawnSingleMonster(false);
                }
                // Spawn 2 Siêu Boss ở hai phân khu xa xôi hiểm trở
                spawnSingleMonster(true);
                spawnSingleMonster(true);
            }
        }

        function spawnSingleMonster(isBoss = false) {
            let template = isBoss ? BOSS_POOL[0] : MONSTER_POOL[Math.floor(Math.random() * MONSTER_POOL.length)];
            let angle = Math.random() * Math.PI * 2;
            
            let mx, my;
            if (isBoss) {
                // Boss chỉ xuất hiện ở khu vực hẻo lánh (Rừng sâu hoặc Đồi cỏ hoang)
                let bossSpots = [
                    { x: 600, y: 3400 },
                    { x: 3300, y: 700 }
                ];
                let spot = bossSpots[Math.floor(Math.random() * bossSpots.length)];
                mx = spot.x + (Math.random() - 0.5) * 200;
                my = spot.y + (Math.random() - 0.5) * 200;
            } else {
                // Quái thường spawn rộng rãi quanh khu trung tâm và các bãi ngoài
                let dist = 180 + Math.random() * 1600;
                mx = 2000 + Math.cos(angle) * dist;
                my = 2000 + Math.sin(angle) * dist;
            }

            monsters.push({
                ...JSON.parse(JSON.stringify(template)),
                x: Math.max(50, Math.min(WORLD_SIZE - 50, mx)),
                y: Math.max(50, Math.min(WORLD_SIZE - 50, my)),
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                lastAttack: 0,
                id: "M_" + Math.random()
            });
        }

        function triggerMonsterCombatAttack(m) {
            let now = Date.now();
            if(now - m.lastAttack < 1800) return; // Attack cooling down speed
            m.lastAttack = now;

            audio.play('hit');
            let damageDealt = Math.max(1, Math.round(m.atk - getEffectiveDef() * 0.4));
            player.hp = Math.max(0, player.hp - damageDealt);

            monsterProjectiles.push({
                x: m.x,
                y: m.y,
                tx: player.x,
                ty: player.y,
                vx: 0,
                vy: 0,
                life: 20,
                alpha: 1,
                emoji: m.isBoss ? '🟥' : '🪨',
                color: '#ff7043'
            });
            createParticle("🩸", player.x, player.y);
            createFloatingText(`-${damageDealt}`, player.x, player.y, '#e53935');

            if(player.hp <= 0) {
                audio.play('hit');
                showToast("💀 Bạn đã kiệt sức và ngã xuống! Trưởng làng đã cứu bạn hồi sinh giữa bản đồ.");
                respawnPlayerCenter();
            }
            refreshHudDisplay();
        }

        function executeActiveSkillUsage(skillId) {
            let sk = player.skills.find(s => s.id === skillId);
            if(!sk) return;
            let now = Date.now();
            if(now - sk.lastUsed < sk.cd) { showToast("⏳ Kỹ năng đang trong thời gian hồi chiêu!"); return; }
            if(player.mp < sk.mp) { showToast("💧 Không đủ điểm Linh Lực (MP) để kích hoạt!"); return; }

            audio.play('skill');
            player.mp -= sk.mp;
            sk.lastUsed = now;
            createSkillEffect(skillId, player.x, player.y);

            if(sk.type === 'self') {
                let healAmount = sk.id === 'cop_shield' ? 25 : sk.id === 'eng_overclock' ? 50 : 20;
                player.hp = Math.min(getEffectiveMaxHp(), player.hp + healAmount);
                if(sk.id === 'eng_overclock') player.mp = Math.min(getEffectiveMaxMp(), player.mp + 40);
                createFloatingText(`+${healAmount} HP`, player.x, player.y, '#4caf50');
                createParticle("✨", player.x, player.y);
                showToast(`✨ Kích hoạt ${sk.name}!`);
                refreshHudDisplay();
                rebuildSkillsPanelUI();
                return;
            }

            if(sk.type === 'target' || sk.type === 'point') {
                if(!player.targetMonster) {
                    showToast("🎯 Hãy nhấp chọn một mục tiêu trên bản đồ để sử dụng kỹ năng!");
                    player.mp += sk.mp;
                    return;
                }
                let target = player.targetMonster;
                let damage = Math.round(getEffectiveAtk() * (sk.multiplier || 1.8));
                target.hp = Math.max(0, target.hp - damage);
                createFloatingText(`💥 ${damage}`, target.x, target.y, '#ffeb3b');
                createParticle("⚡", target.x, target.y);
                createSkillEffect(skillId, target.x, target.y);
                showToast(`⚡ ${sk.name} trúng ${target.name}!`);
                if(target.hp <= 0) handleMonsterDefeated(target);
                refreshHudDisplay();
                rebuildSkillsPanelUI();
                return;
            }

            if(sk.type === 'aoe') {
                showToast(`🎯 ${sk.name} đã sẵn sàng, hãy nhấp chọn vị trí để thi triển.`);
                player.mp += sk.mp;
                return;
            }

            showToast(`✨ ${sk.name} đã được kích hoạt!`);
            refreshHudDisplay();
            rebuildSkillsPanelUI();
        }



        function toggleAutoSkill(skillId, enabled) {
            if(enabled) autoSkillIds.add(skillId); else autoSkillIds.delete(skillId);
            rebuildQuickSkillBarUI();
            rebuildSkillsPanelUI();
            showToast(`${enabled ? '? B?t' : '?? T?t'} t? ??ng d?ng k? n?ng`);
        }

        function canUseSkillNow(skill) {
            return skill && Date.now() - skill.lastUsed >= skill.cd && player.mp >= skill.mp;
        }

        function runAutoSkillCombatCycle(monster, now) {
            if(!monster || monster.hp <= 0 || autoSkillIds.size === 0) return false;
            if(now - lastAutoCombatAction < 900) return false;
            let selected = player.skills.find(skill => autoSkillIds.has(skill.id) && canUseSkillNow(skill));
            if(selected) {
                lastAutoCombatAction = now;
                if(selected.type === 'self' || selected.type === 'instant') executeActiveSkillUsage(selected.id);
                else if(selected.type === 'target' || selected.type === 'point') executeSkillAtTarget(selected.id, monster);
                else if(selected.type === 'aoe') executeSkillAtLocation(selected.id, monster.x, monster.y);
                rebuildQuickSkillBarUI();
                return true;
            }
            return false;
        }

        function triggerNormalAttack() {
            if(!player.targetMonster) {
                showToast("🎯 Hãy chọn một quái vật để đánh thường!");
                return;
            }
            let now = Date.now();
            if(player.targetMonster.hp <= 0) { showToast("🛡️ Mục tiêu đã bị hạ! Hãy chọn quái khác."); return; }

            audio.play('hit');
            let dmg = Math.max(1, Math.round(getEffectiveAtk() * 1.0 - 1));
            player.targetMonster.hp = Math.max(0, player.targetMonster.hp - dmg);
            player.attackEffect.active = true;
            player.attackEffect.sx = player.x;
            player.attackEffect.sy = player.y;
            player.attackEffect.targetX = player.targetMonster.x;
            player.attackEffect.targetY = player.targetMonster.y;
            player.attackEffect.startAt = now;

            createFloatingText(`-${dmg}`, player.targetMonster.x, player.targetMonster.y, '#ffd54f');
            createParticle('⚔️', player.targetMonster.x, player.targetMonster.y);
            showToast(`🗡️ Đánh thường: ${dmg} sát thương với ${player.targetMonster.name}`);
            if(player.targetMonster.hp <= 0) handleMonsterDefeated(player.targetMonster);
            refreshHudDisplay();
        }

        function prepareSkillCast(skillId) {
            let s = player.skills.find(sk => sk.id === skillId);
            if(!s) return;
            let now = Date.now();
            if(now - s.lastUsed < s.cd) { showToast('⏳ Kỹ năng này đang hồi chiêu!'); return; }
            if(player.mp < s.mp) { showToast('💧 Không đủ MP để sử dụng!'); return; }

            if(s.type === 'self' || s.type === 'instant') {
                executeActiveSkillUsage(skillId);
                rebuildQuickSkillBarUI();
                return;
            }

            if((s.type === 'target' || s.type === 'point') && player.targetMonster) {
                executeActiveSkillUsage(skillId);
                rebuildQuickSkillBarUI();
                return;
            }

            activeSkillSelection = skillId;
            showToast(`🎯 Chọn vị trí hoặc mục tiêu để sử dụng ${s.name}`);
        }

        function rebuildQuickSkillBarUI() {
            let container = document.getElementById('skillButtons');
            if(!container) return;
            container.innerHTML = "";

            function makeSlot(button, autoBox, slotIndex) {
                let slot = document.createElement('div');
                slot.className = 'skill-slot';
                if(slotIndex) slot.dataset.slot = slotIndex;
                slot.appendChild(button);
                if(autoBox) slot.appendChild(autoBox);
                return slot;
            }

            function stopUiEvent(ev) {
                ev.preventDefault();
                ev.stopPropagation();
            }

            let normalBtn = document.createElement('button');
            normalBtn.type = 'button';
            normalBtn.className = 'skill-circle';
            normalBtn.dataset.action = 'normal';
            normalBtn.title = '??nh th??ng';
            normalBtn.innerHTML = `
                <span class="skill-icon">???</span>
                <div class="cooldown-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="10"></circle></svg></div>
                <div class="cooldown-text">ATT</div>
            `;
            normalBtn.onpointerdown = (ev) => { stopUiEvent(ev); triggerNormalAttack(); };
            normalBtn.onclick = stopUiEvent;
            normalBtn.onmouseenter = () => showSkillTooltip('??nh th??ng', '??n ??nh c? b?n kh?ng t?n MP. Ch?n qu?i tr??c r?i b?m ?? ??nh.', 'Kh?ng t?n MP');
            normalBtn.onmousemove = moveSkillTooltip;
            normalBtn.onmouseleave = hideSkillTooltip;
            container.appendChild(makeSlot(normalBtn, null, 1));

            let sIdx = 2;
            player.skills.forEach(s => {
                let btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'skill-circle';
                btn.dataset.skillId = s.id;
                let elapsed = Date.now() - s.lastUsed;
                let cooldown = Math.max(0, Math.ceil((s.cd - elapsed) / 1000));
                let ready = cooldown === 0;
                let progress = ready ? 0 : ((s.cd - elapsed) / s.cd) * 100;
                let icon = s.icon || '?';
                let statusText = ready ? 'S?n s?ng' : `H?i ${cooldown}s`;
                let autoChecked = autoSkillIds.has(s.id);
                btn.title = `${s.name}
${s.desc}`;
                if(!ready) btn.classList.add('cooling');
                if(autoChecked) btn.classList.add('auto-enabled');
                if(activeSkillSelection === s.id) btn.classList.add('active');
                btn.innerHTML = `
                    <span class="skill-icon">${icon}</span>
                    <div class="cooldown-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="10"></circle><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(59,130,246,0.95)" stroke-width="10" stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (251.2 * progress / 100)}" stroke-linecap="round"></circle></svg></div>
                    <div class="cooldown-text">${ready ? 'OK' : cooldown + 's'}</div>
                `;
                btn.onpointerdown = (ev) => { stopUiEvent(ev); prepareSkillCast(s.id); rebuildQuickSkillBarUI(); };
                btn.onclick = stopUiEvent;
                btn.onmouseenter = () => showSkillTooltip(s.name, s.desc || 'K? n?ng ch?a c? m? t?.', `MP ${s.mp} ? ${statusText}`);
                btn.onmousemove = moveSkillTooltip;
                btn.onmouseleave = hideSkillTooltip;

                let autoBox = document.createElement('input');
                autoBox.type = 'checkbox';
                autoBox.className = 'skill-auto-toggle';
                autoBox.title = 'T? ??ng spam k? n?ng n?y';
                autoBox.checked = autoChecked;
                autoBox.onpointerdown = stopUiEvent;
                autoBox.onclick = (ev) => { ev.stopPropagation(); };
                autoBox.onchange = (ev) => { ev.stopPropagation(); toggleAutoSkill(s.id, autoBox.checked); };

                container.appendChild(makeSlot(btn, autoBox, sIdx++));
            });
        }

        function respawnPlayerCenter() {
            player.hp = getEffectiveMaxHp();
            player.mp = getEffectiveMaxMp();
            player.x = Math.round(WORLD_SIZE / 2);
            player.y = Math.round(WORLD_SIZE / 2);
            player.destinationX = player.x;
            player.destinationY = player.y;
            player.targetMonster = null;
            refreshHudDisplay();
        }

        // Tạo một mảng toàn cục để chứa các hạt bắn ra khi trúng mục tiêu (Đặt dòng này ở đầu file game của bạn)
let attackParticles = [];

function renderAttackEffect() {
    if (!player.attackEffect.active) return;
    
    let elapsed = Date.now() - player.attackEffect.startAt;
    const duration = 350; // Tăng nhẹ thời gian lên 350ms để hiệu ứng nhìn mượt và rõ hơn
    if (elapsed > duration) { 
        player.attackEffect.active = false; 
        return; 
    }
    
    let progress = elapsed / duration;
    let alpha = Math.pow(1 - progress, 2); // Giảm dần alpha theo hàm mũ để biến mất mượt hơn
    
    // Tọa độ thực tế đã trừ góc Camera
    let sx = player.attackEffect.sx - camera.x;
    let sy = player.attackEffect.sy - camera.y;
    let tx = player.attackEffect.targetX - camera.x;
    let ty = player.attackEffect.targetY - camera.y;

    // --- KÍCH HOẠT HIỆU ỨNG HẠT (BẮN TIA LỬA KHI VỪA KHỞI CHẠY) ---
    if (elapsed < 30 && attackParticles.length === 0) {
        createAttackParticles(player.attackEffect.targetX, player.attackEffect.targetY);
    }

    ctx.save();
    
    // Sử dụng chế độ hòa trộn màu "lighter" để tạo hiệu ứng phát sáng neon siêu đỉnh
    ctx.globalCompositeOperation = 'lighter';

    // === LỚP 1: VẼ LUỒNG SÉT CHÍNH (LIGHTNING EFFECT) ===
    let distance = Math.hypot(tx - sx, ty - sy);
    let segments = Math.floor(distance / 15); // Cứ mỗi 15px tạo 1 khúc gãy
    
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    
    for (let i = 1; i < segments; i++) {
        let t = i / segments;
        // Tính toán đường thẳng tuyến tính cơ sở
        let currX = sx + (tx - sx) * t;
        let currY = sy + (ty - sy) * t;
        
        // Tạo độ giật ngẫu nhiên vuông góc với tia sét (chỉ giật mạnh ở giữa đoạn)
        let jitterStrength = Math.sin(t * Math.PI) * 12 * (1 - progress);
        let offset = (Math.random() - 0.5) * jitterStrength;
        
        // Tính góc vuông góc để bù offset vào
        let angle = Math.atan2(ty - sy, tx - sx) + Math.PI / 2;
        currX += Math.cos(angle) * offset;
        currY += Math.sin(angle) * offset;
        
        ctx.lineTo(currX, currY);
    }
    ctx.lineTo(tx, ty);

    // Cấu hình phát sáng (Glow) cho tia sét
    ctx.shadowBlur = 20 * (1 - progress);
    ctx.shadowColor = `rgba(255, 110, 0, ${alpha})`; // Phát sáng màu cam lửa
    ctx.strokeStyle = `rgba(255, 235, 59, ${alpha})`; // Thân tia sét màu vàng chói
    ctx.lineWidth = 6 * (1 - progress) + 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // === LỚP 2: LÕI NĂNG LƯỢNG TRẮNG (TẠO CẢM GIÁC ĐẬM ĐẶC) ===
    ctx.shadowBlur = 0; // Tắt shadow để vẽ lõi bén hơn
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.lineWidth = 2 * (1 - progress) + 0.5;
    ctx.stroke();

    ctx.restore();

    // === LỚP 3: CẬP NHẬT VÀ VẼ CÁC HẠT NĂNG LƯỢNG BẮN TUNG TÓE ===
    updateAndRenderParticles();
}

// Hàm khởi tạo các hạt năng lượng tại điểm trúng đạn
function createAttackParticles(targetX, targetY) {
    attackParticles = [];
    const particleCount = 15; // Số lượng tia lửa bắn ra
    for (let i = 0; i < particleCount; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 4 + 2;
        attackParticles.push({
            x: targetX,
            y: targetY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1,
            alpha: 1,
            color: Math.random() > 0.5 ? '#ff9100' : '#ffea00' // Ngẫu nhiên cam hoặc vàng
        });
    }
}

// Hàm cập nhật vị trí và vẽ các hạt
function updateAndRenderParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = attackParticles.length - 1; i >= 0; i--) {
        let p = attackParticles[i];
        
        // Di chuyển hạt
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04; // Hạt nhạt dần theo thời gian
        
        if (p.alpha <= 0) {
            attackParticles.splice(i, 1);
            continue;
        }
        
        // Vẽ hạt lên màn hình (đã trừ camera)
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
    }
    ctx.restore();
}

        function renderSkillEffects() {
            let now = Date.now();
            skillEffects.forEach(effect => {
                let age = now - effect.startAt;
                if(age > effect.duration) return;
                let progress = age / effect.duration;
                let radius = 24 + progress * 60;
                ctx.save();
                ctx.globalAlpha = 1 - progress;
                let strokeColor = effect.color || '#fb923c';
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 3 + (1 - progress) * 2;
                ctx.beginPath();
                ctx.arc(effect.x - camera.x, effect.y - camera.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.globalAlpha = 0.35 + (1 - progress) * 0.25;
                let fillColor = strokeColor.startsWith('#') ? `${strokeColor}33` : strokeColor.replace('rgb(', 'rgba(').replace(')', ', 0.22)');
                ctx.fillStyle = fillColor;
                ctx.beginPath();
                ctx.arc(effect.x - camera.x, effect.y - camera.y, radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                if(effect.name) {
                    ctx.save();
                    ctx.globalAlpha = 0.85 - progress * 0.75;
                    ctx.font = 'bold 13px "Baloo 2"';
                    ctx.fillStyle = strokeColor;
                    ctx.textAlign = 'center';
                    ctx.fillText(effect.name, effect.x - camera.x, effect.y - camera.y - radius - 10);
                    ctx.restore();
                }
            });
            skillEffects = skillEffects.filter(effect => now - effect.startAt < effect.duration);
        }

        function renderMonsterProjectiles() {
            monsterProjectiles.forEach(proj => {
                ctx.save();
                ctx.globalAlpha = proj.alpha;
                ctx.strokeStyle = proj.color;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(proj.x - camera.x, proj.y - camera.y);
                ctx.lineTo(proj.tx - camera.x, proj.ty - camera.y);
                ctx.stroke();
                ctx.fillStyle = proj.color;
                ctx.font = '20px Arial';
                ctx.fillText(proj.emoji, proj.x - camera.x, proj.y - camera.y);
                ctx.restore();
            });
        }

        function renderSkillTargetPreview() {
            if(!activeSkillSelection || !skillCursor) return;
            let skill = player.skills.find(s => s.id === activeSkillSelection);
            if(!skill) return;

            ctx.save();
            ctx.strokeStyle = 'rgba(59,130,246,0.8)';
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(player.x - camera.x, player.y - camera.y);
            ctx.lineTo(skillCursor.x - camera.x, skillCursor.y - camera.y);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.globalAlpha = 0.22;
            ctx.fillStyle = 'rgba(59,130,246,0.35)';
            ctx.beginPath();
            ctx.arc(skillCursor.x - camera.x, skillCursor.y - camera.y, 28, 0, Math.PI * 2);
            ctx.fill();

            if(skill.range) {
                ctx.globalAlpha = 0.18;
                ctx.strokeStyle = 'rgba(239,68,68,0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(player.x - camera.x, player.y - camera.y, skill.range, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }

        function renderClickMarker() {
            if(!clickMarker) return;
            let age = (Date.now() - clickMarker.createdAt) / 1000;
            if(age > 1.2) { clickMarker = null; return; }
            let alpha = 1 - age;
            ctx.save();
            ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(clickMarker.x - camera.x, clickMarker.y - camera.y, 26, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = alpha * 0.18;
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(clickMarker.x - camera.x, clickMarker.y - camera.y, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function handleMonsterDefeated(m) {
            audio.play('gold');
            player.gold += m.gold;
            player.exp += m.exp;

            createFloatingText(`+${m.gold} Vàng`, m.x, m.y, '#ffd54f');
            showToast(`⚔️ Tiêu diệt [${m.name}] nhận ${m.exp} EXP và ${m.gold} Vàng!`);

            // Share XP/Gold with party
            partySystem.broadcastXpShare(m.gold, m.exp);

            // Drop material system roll (Chance based loot mechanics)
            let dropRoll = Math.random();
            if(dropRoll < 0.45) {
                let dropId = Math.random() < 0.7 ? "iron_ore" : "magic_crystal";
                addItemToInventory(dropId, 1);
                showToast(`🎁 Nhặt được: ${ITEMS[dropId].emoji} ${ITEMS[dropId].name}!`);
            }

            // Update quest objectives instantly
            player.quests.forEach(q => {
                if(!q.done && q.type === 'kill' && q.target === m.emoji) {
                    q.progress = Math.min(q.req, q.progress + 1);
                    showToast(`📜 Tiến trình: ${q.title} (${q.progress}/${q.req})`);
                }
            });

            // Splice slain target out of monster roster loop
            monsters = monsters.filter(item => item.id !== m.id);
            player.targetMonster = null;
            let tInd = document.getElementById('targetIndicator');
            if(tInd) tInd.style.display = 'none';

            // Instantly check for leveling thresholds
            if(player.exp >= player.maxExp) {
                player.level++;
                player.exp -= player.maxExp;
                player.maxExp = Math.round(player.maxExp * 1.5);
                
                // Grant attribute upgrades
                player.baseAtk += 3;
                player.baseDef += 2;
                player.hp = player.maxHp = player.maxHp + 20;
                player.mp = player.maxMp = player.maxMp + 10;
                
                audio.play('levelup');
                createFloatingText("CẤP ĐỘ UP!! 🎉", player.x, player.y, varColorClass());
                showToast(`🎉 CHÚC MỪNG: Bạn đã thăng cấp lên Cấp ${player.level}! Sức mạnh gia tăng vượt trội.`);
            }

            // Respawn replacement immediately to retain population scale
            setTimeout(() => { spawnSingleMonster(m.isBoss); }, 6000);
            refreshHudDisplay();
        }

        function varColorClass() {
            if(player.classId === 'cop') return '#4fc3f7';
            if(player.classId === 'teacher') return '#ce93d8';
            return '#ffd700';
        }

        // --- 7. INPUT HANDLERS & WORLD INTERACTION CORE ---
        /**
 * Xử lý phím tắt mở các bảng giao diện (Inventory, Skills, Equipment, Quests)
 */
function handleKeyDown(e) {
    if (currentScreen !== 'gameScreen') return;

    // Sử dụng Object Mapping để đăng ký hotkey - Sạch sẽ và cực kỳ dễ mở rộng
    const hotkeys = {
        'i': 'inventory',
        'k': 'skills',
        'e': 'equipment',
        'q': 'quests'
    };

    const targetPanel = hotkeys[e.key.toLowerCase()];
    if (targetPanel) {
        togglePanel(targetPanel);
    }
}

/**
 * Xử lý tương tác chuột trong thế giới game (Click NPC, Quái, kỹ năng hoặc Di chuyển)
 */
function handleWorldClick(e) {
    if(currentScreen !== 'gameScreen') return;
    // Canvas nhận click trực tiếp, không cần check UI
    let rect = canvas.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let clickY = e.clientY - rect.top;
    let worldClickX = clickX + camera.x;
    let worldClickY = clickY + camera.y;

    audio.play('click');
    clickMarker = { x: worldClickX, y: worldClickY, createdAt: Date.now() };

    // Khi đang chọn skill, ưu tiên thi triển chiêu thức trước
    if(activeSkillSelection) {
        let skill = player.skills.find(s => s.id === activeSkillSelection);
        if(skill) {
            let clickedMonster = monsters.find(m => {
                let dx = worldClickX - m.x;
                let dy = worldClickY - m.y;
                return Math.sqrt(dx*dx + dy*dy) <= 30;
            });

            if(clickedMonster) {
                executeSkillAtTarget(skill.id, clickedMonster);
            } else {
                executeSkillAtLocation(skill.id, worldClickX, worldClickY);
            }
        }
        activeSkillSelection = null;
        skillCursor = null;
        return;
    }

    // Click trên NPC sẽ mở thoại chứ không phải di chuyển
    for(let nKey in NPC_DATA) {
        let npc = NPC_DATA[nKey];
        let dx = worldClickX - npc.x;
        let dy = worldClickY - npc.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist <= npc.radius + 15) {
            // Show NPC indicator briefly
            let tInd = document.getElementById('targetIndicator');
            if(tInd) {
                tInd.style.display = 'block';
                tInd.style.borderColor = 'rgba(255,215,0,0.6)';
                tInd.style.background = 'rgba(255,215,0,0.1)';
                document.getElementById('targetName').textContent = `${npc.emoji} ${npc.name}`;
                document.getElementById('targetHpBar').style.display = 'none';
                document.getElementById('targetHpText').textContent = npc.role;
                document.querySelector('#targetIndicator > div:first-child').textContent = '💬 HỘI THOẠI';
                setTimeout(() => {
                    tInd.style.display = 'none';
                    tInd.style.borderColor = 'rgba(244,63,94,0.5)';
                    tInd.style.background = 'rgba(244,63,94,0.12)';
                    document.getElementById('targetHpBar').style.display = '';
                    document.querySelector('#targetIndicator > div:first-child').textContent = '🎯 MỤC TIÊU';
                }, 2000);
            }
            openNpcDialogueSystem(nKey);
            return;
        }
    }

    // Click trúng Quái vật thì nhắm mục tiêu và bắt đầu tấn công
    for(let m of monsters) {
        let dx = worldClickX - m.x;
        let dy = worldClickY - m.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist <= 40) {
            player.targetMonster = m;
            player.destinationX = m.x;
            player.destinationY = m.y;
            showToast(`🎯 Đã nhắm mục tiêu: [${m.name}]`);
            refreshHudDisplay();
            return;
        }
    }

    // Click đất trống sẽ cập nhật đích di chuyển ngay lập tức
    player.targetMonster = null;
    document.getElementById('targetIndicator').style.display = 'none';
    player.destinationX = worldClickX;
    player.destinationY = worldClickY;
}

function executeSkillAtTarget(skillId, target) {
    let skill = player.skills.find(s => s.id === skillId);
    if(!skill) return;
    if(skill.type === 'self') {
        executeActiveSkillUsage(skillId);
        return;
    }
    let now = Date.now();
    if(now - skill.lastUsed < skill.cd) { showToast('⏳ Kỹ năng vẫn đang hồi chiêu!'); return; }
    if(player.mp < skill.mp) { showToast('💧 Không đủ MP để thi triển!'); return; }

    player.mp -= skill.mp;
    skill.lastUsed = now;
    player.targetMonster = target;
    player.destinationX = target.x;
    player.destinationY = target.y;
    createSkillEffect(skillId, target.x, target.y);
    let baseDmg = getEffectiveAtk();
    let multiplier = skill.multiplier || 1.8;
    let damage = Math.round(baseDmg * multiplier);
    target.hp = Math.max(0, target.hp - damage);
    createFloatingText(`💥 ${damage}`, target.x, target.y, '#ffeb3b');
    createParticle('⚡', target.x, target.y);
    showToast(`⚡ ${skill.name} trúng ${target.name}!`);
    if(target.hp <= 0) handleMonsterDefeated(target);
    refreshHudDisplay();
}

function executeSkillAtLocation(skillId, x, y) {
    let skill = player.skills.find(s => s.id === skillId);
    if(!skill) return;
    let now = Date.now();
    if(now - skill.lastUsed < skill.cd) { showToast('⏳ Kỹ năng vẫn đang hồi chiêu!'); return; }
    if(player.mp < skill.mp) { showToast('💧 Không đủ MP để thi triển!'); return; }
    if(skill.range && Math.hypot(x - player.x, y - player.y) > skill.range) {
        showToast('🚫 Vượt quá tầm kỹ năng! Hãy chọn vị trí gần hơn.');
        return;
    }

    player.mp -= skill.mp;
    skill.lastUsed = now;
    createSkillEffect(skillId, x, y);
    createFloatingText(`✨ ${skill.name}`, x, y, '#7c3aed');
    createParticle('✨', x, y);
    showToast(`⚡ ${skill.name} đã được thi triển!`);
    refreshHudDisplay();
}
/**
 * Bật/Tắt chế độ tự động farm quái (AI Auto Farming)
 */
function handleSkillCursor(e) {
    if(!activeSkillSelection || currentScreen !== 'gameScreen') return;
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    skillCursor = { x: x + camera.x, y: y + camera.y };
}

function toggleAutoFarm() {
    try {
        audio.play('click');
    } catch (e) {
        console.warn('Auto farm click sound failed:', e);
    }
    isAutoFarming = !isAutoFarming;
    
    const btn = document.getElementById('autoFarmBtn');
    if(!btn) return;
    
    btn.classList.toggle('active', isAutoFarming);
    if (isAutoFarming) {
        btn.textContent = "Tự Động Đánh: BẬT";
        showToast("🤖 Kích hoạt AI tự động tìm mục tiêu dọn quái xung quanh bản đồ!");
    } else {
        btn.textContent = "Tự Động Đánh: TẮT";
    }
}
        
        // --- 8. NPC & DIALOGUE / QUEST IMPLEMENTATION ---
        function openNpcDialogueSystem(npcKey) {
            let npc = NPC_DATA[npcKey];
            let layer = document.getElementById('npcDialogLayer');
            
            document.getElementById('dialogNpcAvatar').textContent = npc.emoji;
            document.getElementById('dialogNpcName').textContent = npc.name;
            document.getElementById('dialogNpcRole').textContent = npc.role;
            
            let txtBox = document.getElementById('dialogNpcText');
            let optBox = document.getElementById('dialogNpcOptions');
            optBox.innerHTML = "";

            if(npcKey === 'elder') {
                txtBox.textContent = `Chào mừng con, ${player.name}. Làng của chúng ta bị quỷ dữ bao vây tàn bạo, may có con dũng cảm đứng lên. Hãy hỗ trợ bà con diệt quái và chuẩn bị sắm đồ diệt quỷ vương Thần Trùng cứu nguy bờ cõi!`;
                
                // Offer interactive questing lines
                player.quests.forEach(q => {
                    if(!q.done) {
                        let btn = document.createElement('button');
                        btn.className = "opt-btn";
                        if(q.progress >= q.req) {
                            btn.innerHTML = `🎁 <b>Trả Nhiệm Vụ:</b> ${q.title} (XONG)`;
                            btn.onclick = () => { completeQuestReward(q.id); openNpcDialogueSystem('elder'); };
                        } else {
                            btn.innerHTML = `📜 <b>Nhận / Theo Dõi:</b> ${q.title} (${q.progress}/${q.req})`;
                            btn.onclick = () => { alert(`Hãy cố gắng tích cực hoàn thành mục tiêu: ${q.desc}`); };
                        }
                        optBox.appendChild(btn);
                    }
                });
            }
            else if(npcKey === 'blacksmith') {
                txtBox.textContent = `Keng! Keng! Chào người anh em! Tôi có thể rèn phôi sắt vụn và đá ma pháp thành vũ khí, áo giáp cực kỳ thượng hạng cho cậu đây. Vào xem công thức chế tác lò rèn đi!`;
                let btn = document.createElement('button');
                btn.className = "opt-btn";
                btn.textContent = "🏪 Mở Giao Diện Lò Rèn Chế Tạo";
                btn.onclick = () => { closeNpcDialog(); togglePanel('shop'); switchShopTab('craft'); };
                optBox.appendChild(btn);
            }
            else if(npcKey === 'merchant') {
                txtBox.textContent = `Ai thuốc tiên trị thương, nước lọc hồi mana đi! Mua bán sòng phẳng không lo lỗ vốn nhé hiệp khách đại tài.`;
                let btn = document.createElement('button');
                btn.className = "opt-btn";
                btn.textContent = "🏪 Mở Cửa Hàng Mua Bán Vật Phẩm";
                btn.onclick = () => { closeNpcDialog(); togglePanel('shop'); switchShopTab('buy'); };
                optBox.appendChild(btn);
            }

            // Universal escape option button
            let exitBtn = document.createElement('button');
            exitBtn.className = "opt-btn";
            exitBtn.textContent = "🚪 Tạm biệt, con đi làm nhiệm vụ tiếp!";
            exitBtn.style.background = "#3f3f5f";
            exitBtn.onclick = closeNpcDialog;
            optBox.appendChild(exitBtn);

            layer.style.display = "flex";
        }

        function closeNpcDialog() {
            document.getElementById('npcDialogLayer').style.display = "none";
        }

        function completeQuestReward(qId) {
            let q = player.quests.find(item => item.id === qId);
            if(!q || q.done || q.progress < q.req) return;

            audio.play('quest');
            q.done = true;
            player.gold += q.rewardGold;
            player.exp += q.rewardExp;

            showToast(`🎉 HOÀN THÀNH NHIỆM VỤ: Nhận ngay ${q.rewardGold} Vàng và ${q.rewardExp} EXP!`);
            refreshHudDisplay();
        }

        // --- 9. INVENTORY & EQUIPMENT & CRAFTING ENGINE ---
        function addItemToInventory(itemId, amount) {
            let existing = player.inventory.find(i => i.id === itemId);
            if(existing) {
                existing.count += amount;
            } else {
                player.inventory.push({ id: itemId, count: amount });
            }

            // Trigger objective increment if quest tracks crafting craft items
            player.quests.forEach(q => {
                if(!q.done && q.type === 'craft' && q.target === ITEMS[itemId]?.emoji) {
                    q.progress = Math.min(q.req, q.progress + amount);
                }
            });
            refreshHudDisplay();
        }

        function useOrEquipInventoryItem(itemId) {
            let idx = player.inventory.findIndex(i => i.id === itemId);
            if(idx === -1) return;
            let invItem = player.inventory[idx];
            let itemDef = ITEMS[itemId];

            audio.play('click');

            if(itemDef.type === 'usable') {
                if(itemId === 'potion_hp') {
                    if(player.hp >= getEffectiveMaxHp()) { showToast("❤️ Thanh máu của bạn đã đầy sẵn!"); return; }
                    player.hp = Math.min(getEffectiveMaxHp(), player.hp + itemDef.value);
                    createFloatingText(`+${itemDef.value} HP`, player.x, player.y, '#4caf50');
                } else if(itemId === 'potion_mp') {
                    if(player.mp >= getEffectiveMaxMp()) { showToast("💧 Thanh năng lượng của bạn đã đầy sẵn!"); return; }
                    player.mp = Math.min(getEffectiveMaxMp(), player.mp + itemDef.value);
                    createFloatingText(`+${itemDef.value} MP`, player.x, player.y, '#2196f3');
                }
                invItem.count--;
                if(invItem.count <= 0) player.inventory.splice(idx, 1);
                showToast(`🧪 Đã sử dụng thành công ${itemDef.name}!`);
            } 
            else if(['weapon', 'armor', 'accessory'].includes(itemDef.type)) {
                let slot = itemDef.type;
                let oldEquipId = player.equipment[slot];
                
                // Put back old equipped item to item inventory bag if exists
                if(oldEquipId) {
                    addItemToInventory(oldEquipId, 1);
                }

                // Deduct the newly equipped one from bag space
                invItem.count--;
                if(invItem.count <= 0) player.inventory.splice(idx, 1);

                player.equipment[slot] = itemId;
                showToast(`🛡️ Đã trang bị thành công: ${itemDef.name}!`);
            }
            else {
                showToast("🪨 Đây là vật phẩm nguyên liệu thô, mang tới Thợ Rèn để chế tạo đồ tốt hơn.");
                return;
            }

            refreshHudDisplay();
            rebuildInventoryGridUI();
            rebuildEquipmentUI();
        }

        function unequipItem(slot) {
            let itemId = player.equipment[slot];
            if(!itemId) return;

            audio.play('click');
            player.equipment[slot] = null;
            addItemToInventory(itemId, 1);
            showToast(`🎒 Đã tháo bỏ trang bị ${ITEMS[itemId].name} cất vào túi đồ.`);
            
            refreshHudDisplay();
            rebuildInventoryGridUI();
            rebuildEquipmentUI();
        }

        // Calculation extensions factoring dynamic equipment stat additions
        function getEffectiveAtk() {
            let bon = 0;
            if(player.equipment.weapon) bon += ITEMS[player.equipment.weapon].atk || 0;
            if(player.equipment.armor) bon += ITEMS[player.equipment.armor].atk || 0;
            if(player.equipment.accessory) bon += ITEMS[player.equipment.accessory].atk || 0;
            return player.baseAtk + bon;
        }

        function getEffectiveDef() {
            let bon = 0;
            if(player.equipment.weapon) bon += ITEMS[player.equipment.weapon].def || 0;
            if(player.equipment.armor) bon += ITEMS[player.equipment.armor].def || 0;
            if(player.equipment.accessory) bon += ITEMS[player.equipment.accessory].def || 0;
            return player.baseDef + bon;
        }

        function getEffectiveMaxHp() {
            let bon = 0;
            if(player.equipment.weapon) bon += ITEMS[player.equipment.weapon].hp || 0;
            if(player.equipment.armor) bon += ITEMS[player.equipment.armor].hp || 0;
            if(player.equipment.accessory) bon += ITEMS[player.equipment.accessory].hp || 0;
            return player.maxHp + bon;
        }

        function getEffectiveMaxMp() { return player.maxMp; }

        // --- 10. SHOP TRADING & MANUFACTURING (CRAFT) ENGINE ---
        function buyItemFromShop(itemId) {
            let def = ITEMS[itemId];
            if(!def) return;
            if(player.gold < def.price) { showToast("❌ Không đủ tiền vàng để chi trả giao dịch này!"); return; }

            audio.play('gold');
            player.gold -= def.price;
            addItemToInventory(itemId, 1);
            showToast(`🛒 Mua thành công: ${def.emoji} ${def.name}`);
            
            refreshHudDisplay();
            rebuildInventoryGridUI();
            renderShopTabsMarkup();
        }

        function sellItemToShop(itemId) {
            let idx = player.inventory.findIndex(i => i.id === itemId);
            if(idx === -1) return;
            let invItem = player.inventory[idx];
            let def = ITEMS[itemId];

            audio.play('gold');
            let payout = Math.round(def.price * 0.5) || 5;
            player.gold += payout;

            invItem.count--;
            if(invItem.count <= 0) player.inventory.splice(idx, 1);
            showToast(`💰 Đã thanh lý ${def.name} đổi lấy +${payout} Vàng.`);

            refreshHudDisplay();
            rebuildInventoryGridUI();
            renderShopTabsMarkup();
        }

        function craftItemFromRecipe(recipeIdx) {
            let rec = CRAFT_RECIPES[recipeIdx];
            let targetDef = ITEMS[rec.resultId];

            if(player.gold < rec.cost) { showToast("❌ Thiếu ngân lượng chi phí thuê thợ rèn gia công!"); return; }

            // Validate full ingredient inventory quantities
            for(let matId in rec.ingredients) {
                let reqAmt = rec.ingredients[matId];
                let invHas = player.inventory.find(i => i.id === matId);
                if(!invHas || invHas.count < reqAmt) {
                    showToast(`❌ Không đủ nguyên liệu ${ITEMS[matId]?.name || matId}!`);
                    return;
                }
            }

            // Deduct everything systematically
            audio.play('quest');
            player.gold -= rec.cost;
            for(let matId in rec.ingredients) {
                let reqAmt = rec.ingredients[matId];
                let invHas = player.inventory.find(i => i.id === matId);
                invHas.count -= reqAmt;
            }
            player.inventory = player.inventory.filter(i => i.count > 0);

            // Give engineered payload item
            addItemToInventory(rec.resultId, 1);
            showToast(`🛠️ ĐÚC THÀNH CÔNG RÈN THẦN CÔNG: ${targetDef.emoji} [${targetDef.name}]!`);

            refreshHudDisplay();
            rebuildInventoryGridUI();
            renderShopTabsMarkup();
        }

        function switchShopTab(tabMode) {
            audio.play('click');
            shopActiveTab = tabMode;
            document.getElementById('tabBuyBtn').className = tabMode === 'buy' ? 'tab-btn active' : 'tab-btn';
            document.getElementById('tabSellBtn').className = tabMode === 'sell' ? 'tab-btn active' : 'tab-btn';
            document.getElementById('tabCraftBtn').className = tabMode === 'craft' ? 'tab-btn active' : 'tab-btn';

            document.getElementById('shopTabBuy').style.display = tabMode === 'buy' ? 'flex' : 'none';
            document.getElementById('shopTabSell').style.display = tabMode === 'sell' ? 'flex' : 'none';
            document.getElementById('shopTabCraft').style.display = tabMode === 'craft' ? 'flex' : 'none';
            
            renderShopTabsMarkup();
        }

        function renderShopTabsMarkup() {
            // Populate Buy Tab
            let buyBox = document.getElementById('shopTabBuy');
            buyBox.innerHTML = "";
            let buyables = ['potion_hp', 'potion_mp', 'wp_wooden', 'ar_cloth', 'ac_ring'];
            buyables.forEach(id => {
                let item = ITEMS[id];
                let d = document.createElement('div');
                d.className = "shop-item";
                d.innerHTML = `
                    <div class="item-meta">
                        <div style="font-size:1.8rem;">${item.emoji}</div>
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>Giá mua: <b style="color:var(--gold);">${item.price} Vàng</b></p>
                        </div>
                    </div>
                    <button class="btn-sm" style="background:#2563eb;" onclick="buyItemFromShop('${id}')">MUA</button>
                `;
                buyBox.appendChild(d);
            });

            // Populate Sell Tab
            let sellBox = document.getElementById('shopTabSell');
            sellBox.innerHTML = "";
            if(player.inventory.length === 0) {
                sellBox.innerHTML = `<div style="text-align:center; color:#666; padding:15px;">Hành trang trống rỗng, không có gì thanh lý!</div>`;
            } else {
                player.inventory.forEach(i => {
                    let item = ITEMS[i.id];
                    if(!item) return;
                    let sellPrice = Math.round(item.price * 0.5) || 5;
                    let d = document.createElement('div');
                    d.className = "shop-item";
                    d.innerHTML = `
                        <div class="item-meta">
                            <div style="font-size:1.8rem;">${item.emoji}</div>
                            <div class="item-details">
                                <h4>${item.name} (x${i.count})</h4>
                                <p>Giá thu mua lại: <b style="color:#4caf50;">${sellPrice} Vàng</b></p>
                            </div>
                        </div>
                        <button class="btn-sm" style="background:#d97706;" onclick="sellItemToShop('${i.id}')">BÁN 1 CÁI</button>
                    `;
                    sellBox.appendChild(d);
                });
            }

            // Populate Craft Tab
            let craftBox = document.getElementById('shopTabCraft');
            craftBox.innerHTML = "";
            CRAFT_RECIPES.forEach((rec, index) => {
                let resItem = ITEMS[rec.resultId];
                let ingTxt = "";
                for(let mId in rec.ingredients) {
                    ingTxt += `${ITEMS[mId].emoji} ${rec.ingredients[mId]} `;
                }
                let d = document.createElement('div');
                d.className = "craft-item";
                d.innerHTML = `
                    <div class="item-meta">
                        <div style="font-size:2rem;">${resItem.emoji}</div>
                        <div class="item-details">
                            <h4>Chế Tạo: ${resItem.name}</h4>
                            <p style="color:#cbd5e1;">Cần: ${ingTxt} | Phí rèn: <span style="color:var(--gold);">${rec.cost}g</span></p>
                        </div>
                    </div>
                    <button class="btn-sm" style="background:#059669;" onclick="craftItemFromRecipe(${index})">ĐÚC ĐỒ</button>
                `;
                craftBox.appendChild(d);
            });
        }

        function appendChatMessage(sender, message, isSystem = false) {
            let time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
            chatMessages.push({ sender, message, time, isSystem });
            if(chatMessages.length > 50) chatMessages.shift();
            rebuildChatUI();
        }

        function rebuildChatUI() {
            let log = document.getElementById('chatLog');
            if(!log) return;
            log.innerHTML = '';
            chatMessages.forEach(msg => {
                let row = document.createElement('div');
                row.style.marginBottom = '8px';
                row.innerHTML = `<span style="color:${msg.isSystem ? '#f59e0b' : '#60a5fa'}; font-weight:700;">[${msg.time}] ${msg.sender}:</span> <span style="color:${msg.isSystem ? '#fff' : '#e5e7eb'};">${msg.message}</span>`;
                log.appendChild(row);
            });
            log.scrollTop = log.scrollHeight;
        }

        function sendGlobalChat() {
            let input = document.getElementById('chatMessageInput');
            if(!input) return;
            let message = input.value.trim();
            if(!message) return;
            audio.play('click');
            appendChatMessage(player.name || 'Bạn', message, false);
            chatChannel.postMessage({ type: 'CHAT_MESSAGE', sender: player.name || 'Bạn', message });
            input.value = '';
        }

        function loadFootballFixtures() {
            // TODO: Replace this simulated fixture generator with a real sports API call.
            // Example services: football-data.org, api-football.com, thesportsdb.com, sportdataapi.com.
            // You will need to call through a server/proxy if the API does not allow direct browser CORS.
            footballFixtures = FOOTBALL_LEAGUES.slice(0, 6).map((league, idx) => {
                let home = FOOTBALL_TEAMS[idx * 2] || 'Team A';
                let away = FOOTBALL_TEAMS[idx * 2 + 1] || 'Team B';
                let odds = [1.6 + Math.random() * 1.1, 3.0 + Math.random() * 0.8, 1.8 + Math.random() * 0.9].map(v => v.toFixed(2)).join(' / ');
                let status = Math.random() > 0.55 ? 'LIVE' : 'UPCOMING';
                let time = status === 'LIVE' ? `${19 + idx}:${Math.floor(Math.random()*60).toString().padStart(2,'0')}` : `${21 + idx}:${Math.floor(Math.random()*30).toString().padStart(2,'0')}`;
                return { league, match: `${home} vs ${away}`, time, status, odds, shownAt: new Date().toLocaleTimeString('vi-VN', { hour12: false }) };
            });
            placedBets = placedBets.filter(bet => bet.time > Date.now() - 1000 * 60 * 30);
            renderFootballFixtures();
            updateBetWalletDisplay();
            showToast('⚽ Dữ liệu bóng đá đã được cập nhật.');
        }

        function renderFootballFixtures() {
            let list = document.getElementById('betFixtureList');
            if(!list) return;
            list.innerHTML = '';
            footballFixtures.forEach((fixture, index) => {
                let card = document.createElement('div');
                card.className = 'bet-card';
                card.innerHTML = `
                    <h4>${fixture.league}</h4>
                    <p><span>${fixture.match}</span></p>
                    <p>Thời gian: ${fixture.time} | Trạng thái: <b style="color:${fixture.status === 'LIVE' ? '#34d399' : '#fbbf24'};">${fixture.status}</b></p>
                    <p>Tỷ lệ cược: ${fixture.odds}</p>
                    <input id="betAmountInput_${index}" type="number" placeholder="Nhập số vàng cược" min="10" />
                    <button class="btn-sm place-bet-btn" onclick="placeBet(${index})">Đặt cược</button>
                `;
                if(placedBets.some(b => b.fixtureIndex === index)) {
                    let note = document.createElement('p');
                    note.style.color = '#86efac';
                    note.style.marginTop = '8px';
                    note.textContent = '⚡ Bạn đã đặt cược vào trận này rồi.';
                    card.appendChild(note);
                }
                list.appendChild(card);
            });
        }

        function updateBetWalletDisplay() {
            let wallet = document.getElementById('betWalletInfo');
            if(wallet) wallet.innerHTML = `Số dư cược: <span>${player.gold} Vàng</span>`;
        }

        function placeBet(index) {
            let input = document.getElementById(`betAmountInput_${index}`);
            if(!input) return;
            let amount = parseInt(input.value, 10);
            if(isNaN(amount) || amount < 10) { showToast('⚠️ Nhập ít nhất 10 Vàng để cược.'); return; }
            if(amount > player.gold) { showToast('⚠️ Không đủ vàng để đặt cược.'); return; }
            if(placedBets.find(b => b.fixtureIndex === index)) { showToast('⚠️ Bạn đã cược trận này rồi.'); return; }
            player.gold -= amount;
            placedBets.push({ fixtureIndex: index, amount, time: Date.now() });
            updateBetWalletDisplay();
            renderFootballFixtures();
            showToast(`✅ Đặt cược ${amount} Vàng cho ${footballFixtures[index].match}.`);
        }

        function createSkillEffect(type, x, y) {
            let sk = player.skills.find(s => s.id === type);
            let color = '#fb923c';
            if(sk) {
                if(sk.type === 'self') color = '#4caf50';
                else if(sk.type === 'aoe') color = '#a855f7';
                else if(sk.type === 'point') color = '#38bdf8';
                else if(sk.type === 'target') color = '#f59e0b';
            }
            
            // --- Ultimate VFX Triggers ---
            if(window.playUltimateVFX) {
                if(type === 'skill_cop_3' || type === 'skill_hunter_3') {
                    window.playUltimateVFX(x, y, 'kamehameha');
                } else if (type === 'skill_merchant_3' || type === 'skill_teacher_3') {
                    window.playUltimateVFX(x, y, 'magic_circle');
                } else if (type === 'skill_engineer_3' || type === 'skill_cop_2') {
                    window.playUltimateVFX(x, y, 'haki');
                } else {
                    // Small standard sparks for regular skills
                    if(window.spawnParticle) {
                        for(let i=0; i<10; i++) {
                            window.spawnParticle(x, y, color, Math.random()*5+3, 15, (Math.random()-0.5)*10, (Math.random()-0.5)*10, 'glow');
                        }
                    }
                }
            }
            // -----------------------------

            skillEffects.push({ type, x, y, startAt: Date.now(), duration: 900, age: 0, name: sk?.name || type, color });
            skillActionPopups.push({ text: sk?.name || type, x, y, startAt: Date.now(), duration: 900, color });
        }

        function renderSkillActionPopups() {
            if(!skillActionPopups.length) return;
            skillActionPopups = skillActionPopups.filter(effect => {
                let elapsed = Date.now() - effect.startAt;
                if(elapsed > effect.duration) return false;
                let progress = elapsed / effect.duration;
                let alpha = 1 - progress;
                let rise = progress * 40;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.font = 'bold 18px "Baloo 2"';
                ctx.fillStyle = effect.color;
                ctx.textAlign = 'center';
                ctx.fillText(effect.text, effect.x - camera.x, effect.y - camera.y - 20 - rise);
                ctx.restore();
                return true;
            });
        }

        // --- 11. UI HUB LAYER RENDERING MANAGERS ---
        function togglePanel(panelId) {
            audio.play('click');
            let p = document.getElementById(`panel-${panelId}`);
            
            if(p.style.display === 'flex') {
                p.style.display = 'none';
                activePanel = null;
            } else {
                // Shut off all panels
                document.querySelectorAll('.game-panel').forEach(panel => panel.style.display = 'none');
                p.style.display = 'flex';
                activePanel = panelId;
                
                // Refresh specific targeted internal list injectors
                if(panelId === 'inventory') rebuildInventoryGridUI();
                if(panelId === 'skills') rebuildSkillsPanelUI();
                if(panelId === 'equipment') rebuildEquipmentUI();
                if(panelId === 'quests') rebuildQuestsUI();
                if(panelId === 'shop') switchShopTab('buy');
                if(panelId === 'pvp') rebuildPvpLobbyUI();
                if(panelId === 'party') { rebuildPartyPanel(); }
                if(panelId === 'chat') rebuildChatUI();
                if(panelId === 'bet') loadFootballFixtures();
            }
        }

        function refreshHudDisplay() {
            let cls = CLASS_DATA[player.classId];
            const hudCanvas = document.getElementById('hudAvatarCanvas');
            if (hudCanvas && window.drawBeautifulRPGChibi) {
                const hctx = hudCanvas.getContext('2d');
                hctx.clearRect(0, 0, 60, 60);
                window.drawBeautifulRPGChibi(hctx, 30, 24, player.classId, false, 0.85, 'right');
            } else {
                document.getElementById('hudAvatar').textContent = cls?.emoji || "👮‍♂️";
            }
            document.getElementById('hudName').textContent = `${player.name} (Cấp ${player.level} ${cls?.name || ''})`;
            
            let maxHp = getEffectiveMaxHp();
            let maxMp = getEffectiveMaxMp();
            
            // Percentage compute widths bars
            document.getElementById('barHp').style.width = `${(player.hp / maxHp) * 100}%`;
            document.getElementById('txtHp').textContent = `MÁU: ${player.hp}/${maxHp}`;

            document.getElementById('barMp').style.width = `${(player.mp / maxMp) * 100}%`;
            document.getElementById('txtMp').textContent = `LINH LỰC: ${player.mp}/${maxMp}`;

            document.getElementById('barExp').style.width = `${(player.exp / player.maxExp) * 100}%`;
            document.getElementById('txtExp').textContent = `EXP: ${player.exp}/${player.maxExp} (${Math.round(player.exp/player.maxExp*100)}%)`;

            document.getElementById('hudStats').innerHTML = `⚔️ TẤN CÔNG: ${getEffectiveAtk()} | 🛡️ PHÒNG THỦ: ${getEffectiveDef()} | 💰 NGÂN LƯỢNG: ${player.gold}`;
            document.getElementById('invGoldText').textContent = `💰 Tài Sản: ${player.gold} Vàng`;

            // Update target lock indicator
            let tInd = document.getElementById('targetIndicator');
            if(player.targetMonster && player.targetMonster.hp > 0) {
                tInd.style.display = 'block';
                document.getElementById('targetName').textContent = (player.targetMonster.isBoss ? '👑 ' : '⚔️ ') + player.targetMonster.name;
                let hpPct = Math.max(0, (player.targetMonster.hp / player.targetMonster.maxHp) * 100);
                document.getElementById('targetHpBar').style.width = hpPct + '%';
                document.getElementById('targetHpBar').style.background = hpPct > 50 ? 'linear-gradient(90deg,#16a34a,#22c55e)' : hpPct > 25 ? 'linear-gradient(90deg,#d97706,#f59e0b)' : 'linear-gradient(90deg,#dc2626,#ef4444)';
                document.getElementById('targetHpText').textContent = `${player.targetMonster.hp} / ${player.targetMonster.maxHp} HP`;
            } else {
                tInd.style.display = 'none';
                player.targetMonster = null;
            }

            rebuildQuickSkillBarUI();
        }

        function rebuildInventoryGridUI() {
            let g = document.getElementById('inventoryGrid');
            g.innerHTML = "";
            
            // Build up max 16 item grid slots layout
            for(let i=0; i<16; i++) {
                let slot = document.createElement('div');
                slot.className = "item-slot";
                
                if(player.inventory[i]) {
                    let invItem = player.inventory[i];
                    let details = ITEMS[invItem.id];
                    if(details) {
                        slot.innerHTML = `
                            <div class="slot-emoji">${details.emoji}</div>
                            <div class="slot-name">${details.name}</div>
                            <div class="slot-count">${invItem.count}</div>
                        `;
                        slot.title = `${details.name}\n${details.desc || 'Vật phẩm quý'}`;
                        slot.onclick = () => useOrEquipInventoryItem(invItem.id);
                    }
                } else {
                    slot.innerHTML = `<span style="color:#333; font-size:1.5rem;">·</span>`;
                }
                g.appendChild(slot);
            }
        }

        function rebuildSkillsPanelUI() {
            let box = document.getElementById('skillsList');
            box.innerHTML = "";
            player.skills.forEach(s => {
                let item = document.createElement('button');
                item.type = 'button';
                item.className = "skill-card";
                item.onclick = () => { executeActiveSkillUsage(s.id); rebuildSkillsPanelUI(); rebuildQuickSkillBarUI(); };
                let cooldown = Math.max(0, Math.ceil((s.cd - (Date.now() - s.lastUsed)) / 1000));
                let status = s.lastUsed && cooldown > 0 ? `CD ${cooldown}s` : 'ẤN';
                item.innerHTML = `
                    <div class="skill-meta">
                        <span class="icon">⚡</span>
                        <div>
                            <div class="skill-name">${s.name}</div>
                            <div class="skill-desc">${s.desc}</div>
                        </div>
                    </div>
                    <label class="skill-action" onclick="event.stopPropagation()" title="T? ??ng spam k? n?ng n?y">
                        <input type="checkbox" ${autoSkillIds.has(s.id) ? 'checked' : ''} onchange="toggleAutoSkill('${s.id}', this.checked)"> AUTO
                    </label>
                    <span class="skill-action">${status}</span>
                `;
                box.appendChild(item);
            });
        }

        function rebuildEquipmentUI() {
            let slots = ['weapon', 'armor', 'accessory'];
            slots.forEach(slotName => {
                let eqBox = document.getElementById(`eq-${slotName}`);
                let itemId = player.equipment[slotName];
                if(itemId && ITEMS[itemId]) {
                    eqBox.innerHTML = `<div class="slot-emoji">${ITEMS[itemId].emoji}</div><div class="slot-name" style="font-size:0.6rem;">${ITEMS[itemId].name}</div>`;
                    eqBox.style.background = "rgba(255,215,0,0.1)";
                } else {
                    let defEmoji = slotName === 'weapon' ? "👊" : slotName === 'armor' ? "👕" : "📿";
                    eqBox.innerHTML = `<div class="slot-emoji" style="opacity:0.25;">${defEmoji}</div>`;
                    eqBox.style.background = "rgba(0,0,0,0.4)";
                }
            });

            // Calculate differences bonus text
            let weaponDef = ITEMS[player.equipment.weapon];
            let armorDef = ITEMS[player.equipment.armor];
            let accDef = ITEMS[player.equipment.accessory];

            let addAtk = (weaponDef?.atk || 0) + (armorDef?.atk || 0) + (accDef?.atk || 0);
            let addDef = (weaponDef?.def || 0) + (armorDef?.def || 0) + (accDef?.def || 0);
            let addHp  = (weaponDef?.hp  || 0) + (armorDef?.hp  || 0) + (accDef?.hp  || 0);

            document.getElementById('equipBonusStats').innerHTML = `⚡ Tấn công: <b style="color:var(--gold);">+${addAtk} ATK</b><br>🛡️ Phòng thủ: <b style="color:#4fc3f7;">+${addDef} DEF</b><br>❤️ Sinh lực thêm: <b style="color:#4caf50;">+${addHp} HP</b>`;
        }

        function rebuildQuestsUI() {
            let qBox = document.getElementById('questsList');
            qBox.innerHTML = "";
            player.quests.forEach(q => {
                let div = document.createElement('div');
                div.className = "shop-item";
                let statusTxt = q.done ? "<b style='color:#4caf50;'>[ĐÃ HOÀN THÀNH]</b>" : ` Tiến độ: <b>${q.progress}/${q.req}</b>`;
                div.innerHTML = `
                    <div class="item-meta">
                        <div style="font-size:1.6rem;">${q.done ? '✅' : '📜'}</div>
                        <div class="item-details">
                            <h4>${q.title}</h4>
                            <p>${q.desc}</p>
                            <span style="font-size:0.8rem; color:#ffd54f;">Thưởng: ${q.rewardGold} vàng / +${q.rewardExp} exp</span>
                        </div>
                    </div>
                    <div style="font-size:0.9rem;">${statusTxt}</div>
                `;
                qBox.appendChild(div);
            });
        }

        function showToast(text, isPvp = false) {
            let container = document.getElementById('toastContainer');
            let t = document.createElement('div');
            t.className = isPvp ? "toast pvp" : "toast";
            t.textContent = text;
            container.appendChild(t);
            setTimeout(() => { t.remove(); }, 4000);
        }

        function showSkillTooltip(title, description, extra = '') {
            let tip = document.getElementById('skillTooltip');
            if(!tip) return;
            tip.innerHTML = `<strong>${title}</strong><div>${description}</div>${extra ? '<div class="meta">' + extra + '</div>' : ''}`;
            tip.style.display = 'block';
        }

        function moveSkillTooltip(evt) {
            let tip = document.getElementById('skillTooltip');
            if(!tip || tip.style.display !== 'block') return;
            tip.style.left = `${evt.clientX + 14}px`;
            tip.style.top = `${evt.clientY + 14}px`;
        }

        function hideSkillTooltip() {
            let tip = document.getElementById('skillTooltip');
            if(tip) tip.style.display = 'none';
        }

        function createFloatingText(text, wx, wy, color = '#fff') {
            // Compute localized coordinate mappings inside current camera viewport
            let sx = canvas.width / 2 + (wx - player.x) + (Math.random() - 0.5) * 20;
            let sy = canvas.height / 2 + (wy - player.y) - 20;

            let div = document.createElement('div');
            div.className = 'float-text';
            div.textContent = text;
            div.style.left = `${sx}px`;
            div.style.top = `${sy}px`;
            div.style.color = color;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 1200);
        }

        function createParticle(emoji, wx, wy) {
            for(let i=0; i<3; i++) {
                particles.push({
                    emoji: emoji,
                    x: wx,
                    y: wy,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -1 - Math.random() * 3,
                    life: 20,
                    opacity: 1
                });
            }
        }

        // --- 12. GRAPHICS CANVAS RENDERING ENGINE LOOP (50FPS) ---
        function mainGameLoop() {
            if(currentScreen !== 'gameScreen') return;

            // Apply camera shake
            let sx = 0, sy = 0;
            if(window.screenShake && window.screenShake.time > 0) {
                sx = (Math.random() - 0.5) * window.screenShake.magnitude;
                sy = (Math.random() - 0.5) * window.screenShake.magnitude;
                window.screenShake.time -= 16;
                if(window.screenShake.time <= 0) window.screenShake.magnitude = 0;
            }
            camera.x += sx;
            camera.y += sy;

            updateGameLogicState();
            renderWorldGraphicsLayers();
            
            // Revert camera shake
            camera.x -= sx;
            camera.y -= sy;
            
            // Render VFX Overlays (Particles, Weather, Day/Night)
            if(window.renderVFXOverlays) window.renderVFXOverlays(ctx, camera);
            
            renderMinimapGraphics();

            requestAnimationFrame(mainGameLoop);
        }

        let lastBgmCheckTime = 0;
        function updateGameLogicState() {
            // Zone Background Music transition tick check
            let nowTime = Date.now();
            if (nowTime - lastBgmCheckTime > 1000) {
                lastBgmCheckTime = nowTime;
                let currentArea = null;
                WORLD_THEME_AREAS.forEach(area => {
                    if (player.x >= area.x && player.x <= area.x + area.w &&
                        player.y >= area.y && player.y <= area.y + area.h) {
                        currentArea = area;
                    }
                });
                
                let targetBgm = 'aresden';
                if (currentArea) {
                    if (currentArea.name === 'Rừng U Minh') targetBgm = 'dungeon';
                    else if (currentArea.name === 'Hồ Sen Tĩnh Lặng') targetBgm = 'elvine';
                    else if (currentArea.name === 'Đồi Cỏ Mặt Trời') targetBgm = 'middleland';
                    else if (currentArea.name === 'Khu Luyện Cấp Ngoài Làng') targetBgm = 'apocalypse';
                    else if (currentArea.name === 'Chợ Quê Xóm Dưới') targetBgm = 'middleland';
                }
                audio.playBgm(targetBgm);
            }

            // A. AI Auto Farm logic targeting closest enemy routine
            if(isAutoFarming && !player.targetMonster && monsters.length > 0) {
                let closest = null; let minD = 99999;
                monsters.forEach(m => {
                    if(m.isBoss) return; // Không auto chọn boss
                    let d = Math.sqrt((m.x-player.x)**2 + (m.y-player.y)**2);
                    if(d < minD) { minD = d; closest = m; }
                });
                if(closest && minD < 400) player.targetMonster = closest;
            }

            // B. Movement computation vector calculations
            let speed = player.baseSpeed;
            
            // Tính toán hướng đi bàn phím (WASD / Phím mũi tên)
            let keyVx = 0;
            let keyVy = 0;
            if (window.pressedKeys) {
                if (window.pressedKeys['w'] || window.pressedKeys['arrowup']) keyVy = -1;
                if (window.pressedKeys['s'] || window.pressedKeys['arrowdown']) keyVy = 1;
                if (window.pressedKeys['a'] || window.pressedKeys['arrowleft']) keyVx = -1;
                if (window.pressedKeys['d'] || window.pressedKeys['arrowright']) keyVx = 1;
            }

            // Keyboard Override
            if (keyVx !== 0 || keyVy !== 0) {
                let len = Math.hypot(keyVx, keyVy);
                player.x += (keyVx / len) * speed;
                player.y += (keyVy / len) * speed;
                player.destinationX = undefined;
                player.destinationY = undefined;
                player.targetMonster = null;
                window.joystickActive = false; // Tắt di chuyển joystick nếu bấm phím
            }
            // Joystick Override
            else if(window.joystickActive && window.joystickVector && (window.joystickVector.x !== 0 || window.joystickVector.y !== 0)) {
                player.x += window.joystickVector.x * speed;
                player.y += window.joystickVector.y * speed;
                player.destinationX = undefined;
                player.destinationY = undefined;
            } else {
                let targetX = player.destinationX;
                let targetY = player.destinationY;

                if(player.targetMonster) {
                    // Adjust vector position towards target monster bounding edge
                    targetX = player.targetMonster.x;
                    targetY = player.targetMonster.y;
                }

                if(targetX !== undefined && targetY !== undefined) {
                    let dx = targetX - player.x;
                    let dy = targetY - player.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);

                let stopThreshold = player.targetMonster ? 45 : 6;
                if(dist > stopThreshold) {
                    player.x += (dx / dist) * speed;
                    player.y += (dy / dist) * speed;
                } else {
                    player.x = targetX;
                    player.y = targetY;
                    if(!player.targetMonster) {
                        // Reset single spot navigation parameters
                        player.destinationX = undefined;
                        player.destinationY = undefined;
                    } else {
                        // Lock onto target and stop jittering around it
                        player.destinationX = undefined;
                        player.destinationY = undefined;
                    }
                }
                // Close if(targetX !== undefined && targetY !== undefined)
            }
            } // Close the 'else' block from Joystick Override

            player.isMoving = (keyVx !== 0 || keyVy !== 0) || (window.joystickActive) || (player.destinationX !== undefined || (player.targetMonster && player.targetMonster.hp > 0)) && !(player.destinationX === undefined && !player.targetMonster);
            player.animationState = player.isMoving ? 'run' : 'idle';

            // Bound checking limits protection
            player.x = Math.max(20, Math.min(WORLD_SIZE - 20, player.x));
            player.y = Math.max(20, Math.min(WORLD_SIZE - 20, player.y));

            // Camera smoothly center anchoring system interpolations
            camera.x = player.x - canvas.width / 2;
            camera.y = player.y - canvas.height / 2;

            // C. Direct auto auto engagement strike loop calculations
            if(player.targetMonster) {
                let m = player.targetMonster;
                let dist = Math.sqrt((m.x - player.x)**2 + (m.y - player.y)**2);
                if(dist <= 55) {
                    // Trigger dynamic active damage cycle
                    let now = Date.now();
                    if(runAutoSkillCombatCycle(m, now)) return;
                    if(!player.lastAttackTime) player.lastAttackTime = 0;
                    if(now - player.lastAttackTime > 1300) { // Auto basic speed frequency cooldown
                        player.lastAttackTime = now;
                        audio.play('hit');
                        
                        let dmg = Math.max(2, Math.round(getEffectiveAtk() - 2));
                        m.hp = Math.max(0, m.hp - dmg);
                        createParticle("⚔️", m.x, m.y);
                        createFloatingText(`${dmg}`, m.x, m.y, '#ffd54f');
                        player.attackEffect.active = true;
                        player.attackEffect.sx = player.x;
                        player.attackEffect.sy = player.y;
                        player.attackEffect.targetX = m.x;
                        player.attackEffect.targetY = m.y;
                        player.attackEffect.startAt = now;

                        if(m.hp <= 0) {
                            handleMonsterDefeated(m);
                        } else {
                            triggerMonsterCombatAttack(m);
                        }
                    }
                }
            }

            // D. Continuous standard background monster physics step
            monsters.forEach(m => {
                m.x += m.vx; m.y += m.vy;
                if(m.x < 50 || m.x > WORLD_SIZE - 50) m.vx *= -1;
                if(m.y < 50 || m.y > WORLD_SIZE - 50) m.vy *= -1;

            });

            // E. Process particle age decay parameters
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                p.life--;
                p.opacity = p.life / 20;
            });
            particles = particles.filter(p => p.life > 0);

            // F. Monster projectile animation effects
            monsterProjectiles.forEach(proj => {
                let dx = proj.tx - proj.x;
                let dy = proj.ty - proj.y;
                let dist = Math.sqrt(dx*dx + dy*dy) || 1;
                proj.x += dx / dist * 6;
                proj.y += dy / dist * 6;
                proj.life--;
                proj.alpha = proj.life / 20;
            });
            monsterProjectiles = monsterProjectiles.filter(p => p.life > 0);

            // G. Skill effect lifetimes
            skillEffects.forEach(effect => {
                effect.age = Date.now() - effect.startAt;
            });
            skillEffects = skillEffects.filter(effect => effect.age < effect.duration);

            // H. Update NPC roaming and chat bubbles
            for (let nKey in NPC_DATA) {
                let npc = NPC_DATA[nKey];
                if (nKey === 'dirtyPond' || nKey === 'richMaze' || nKey === 'vinhsHouse' || nKey === 'poorHouse' || nKey === 'flowerHouse') continue;
                
                if (!npc.ox) {
                    npc.ox = npc.x;
                    npc.oy = npc.y;
                    npc.roamCooldown = 0;
                    npc.chatCooldown = 0;
                }
                
                if (Date.now() > (npc.roamCooldown || 0)) {
                    if (Math.random() < 0.25) {
                        let angle = Math.random() * Math.PI * 2;
                        let dist = 30 + Math.random() * 50;
                        npc.tx = npc.ox + Math.cos(angle) * dist;
                        npc.ty = npc.oy + Math.sin(angle) * dist;
                        npc.roamCooldown = Date.now() + 2000 + Math.random() * 3000;
                    } else {
                        npc.tx = undefined;
                        npc.ty = undefined;
                        npc.roamCooldown = Date.now() + 1000 + Math.random() * 2000;
                    }
                }
                
                if (npc.tx !== undefined && npc.ty !== undefined) {
                    let dx = npc.tx - npc.x;
                    let dy = npc.ty - npc.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > 2) {
                        npc.x += (dx / dist) * 0.8;
                        npc.y += (dy / dist) * 0.8;
                    } else {
                        npc.x = npc.tx;
                        npc.y = npc.ty;
                        npc.tx = undefined;
                        npc.ty = undefined;
                    }
                }
                
                if (Date.now() > (npc.chatCooldown || 0)) {
                    if (Math.random() < 0.15) {
                        let phrases = [];
                        if (nKey === 'elder') {
                            phrases = ["Hỡi các dũng sĩ, yêu quái đang mạnh lên!", "Hãy bảo vệ Xóm Anh Hùng!", "Có nhiệm vụ mới cho cháu đây!"];
                        } else if (nKey === 'blacksmith') {
                            phrases = ["Cần rèn kiếm hay cường hóa giáp không?", "Lò rèn đỏ rực thắp sáng đêm!", "Đao kiếm của cháu đã mài chưa?"];
                        } else if (nKey === 'merchant') {
                            phrases = ["Mua máu, mana thảo dược giá gốc đây!", "Thương hội cô Ba buôn lậu chất nhất xóm!", "Có quà đặc biệt cho khách quen đây!"];
                        } else if (nKey === 'barber') {
                            phrases = ["Cắt quả đầu cua hay tóc undercut dũng sĩ đi!", "Làm kiểu tóc gothic Helbreath đi dũng sĩ!", "Đổi kiểu tóc đổi vận mệnh!"];
                        } else {
                            phrases = ["Hôm nay buôn bán ế ẩm quá!", "Mừng các dũng sĩ viễn chinh trở về!", "Xóm mình ngày càng nhộn nhịp!"];
                        }
                        npc.speechBubble = phrases[Math.floor(Math.random() * phrases.length)];
                        npc.speechBubbleTime = Date.now() + 3000;
                        npc.chatCooldown = Date.now() + 8000 + Math.random() * 8000;
                    }
                }
            }

            // I. Check portal and door triggers
            if (window.checkPortalTriggers) {
                window.checkPortalTriggers();
            }
        }

        function renderWorldThemeAreas() {
            let tileSize = 200;
            let startGridX = Math.floor(camera.x / tileSize) * tileSize;
            let startGridY = Math.floor(camera.y / tileSize) * tileSize;
            let mapId = window.currentMapId || 'world';

            for(let gx = startGridX; gx < startGridX + canvas.width + tileSize; gx += tileSize) {
                for(let gy = startGridY; gy < startGridY + canvas.height + tileSize; gy += tileSize) {
                    let wx = gx; let wy = gy;
                    if(wx >= 0 && wy >= 0 && wx <= WORLD_SIZE && wy <= WORLD_SIZE) {
                        if (mapId === 'world') {
                            // Grass tiles
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#65a30d"; // Lime green
                            } else {
                                ctx.fillStyle = "#4d7c0f"; // Darker green
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            // Stylized grass tufts
                            ctx.fillStyle = "#3f6212";
                            ctx.fillRect(wx - camera.x + 50, wy - camera.y + 50, 4, 12);
                            ctx.fillRect(wx - camera.x + 54, wy - camera.y + 54, 4, 8);
                        } else if (mapId === 'demon_cave') {
                            // Volcanic cave
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#1e1e24";
                            } else {
                                ctx.fillStyle = "#2c2c35";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            ctx.fillStyle = "#ea580c"; // Lava glows
                            ctx.fillRect(wx - camera.x + 80, wy - camera.y + 80, 40, 6);
                            ctx.fillRect(wx - camera.x + 100, wy - camera.y + 60, 6, 40);
                        } else if (mapId === 'cemetery') {
                            // Graveyard mud/soil
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#45474a";
                            } else {
                                ctx.fillStyle = "#343538";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                        } else if (mapId === 'ghost_forest') {
                            // Cursed woods
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#2e1065";
                            } else {
                                ctx.fillStyle = "#1e1b4b";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                        } else if (mapId === 'ancient_temple') {
                            // Ancient stone slabs
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#52525b";
                            } else {
                                ctx.fillStyle = "#3f3f46";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            ctx.strokeStyle = "#27272a";
                            ctx.lineWidth = 2;
                            ctx.strokeRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                        } else if (mapId === 'dungeon') {
                            // Dungeon brick blocks
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#18181b";
                            } else {
                                ctx.fillStyle = "#27272a";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            ctx.strokeStyle = "#09090b";
                            ctx.lineWidth = 2;
                            ctx.strokeRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                        } else {
                            // Building interiors (wooden floorboards)
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#78350f";
                            } else {
                                ctx.fillStyle = "#451a03";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            ctx.strokeStyle = "#292524";
                            ctx.lineWidth = 1;
                            for (let i = 0; i < tileSize; i += 40) {
                                ctx.beginPath();
                                ctx.moveTo(wx - camera.x + i, wy - camera.y);
                                ctx.lineTo(wx - camera.x + i, wy - camera.y + tileSize);
                                ctx.stroke();
                            }
                        }
                    }
                }
            }

            if (mapId === 'world') {
                ctx.save();
                ctx.translate(-camera.x, -camera.y);
                WORLD_THEME_AREAS.forEach(area => {
                    ctx.save();
                    ctx.fillStyle = area.color;
                    ctx.fillRect(area.x, area.y, area.w, area.h);
                    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(area.x, area.y, area.w, area.h);
                    ctx.font = '18px "Baloo 2"';
                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillText(area.icon + ' ' + area.label, area.x + 10, area.y + 26);

                    if(area.icon === '🏰') {
                        let mazeX = area.x + area.w - 90;
                        let mazeY = area.y + 55;
                        ctx.fillStyle = 'rgba(148,163,184,0.25)';
                        ctx.fillRect(mazeX, mazeY, 70, 70);
                        ctx.strokeStyle = '#eab308';
                        ctx.strokeRect(mazeX, mazeY, 70, 70);
                        ctx.beginPath(); ctx.moveTo(mazeX + 10, mazeY + 10); ctx.lineTo(mazeX + 60, mazeY + 10); ctx.lineTo(mazeX + 60, mazeY + 60); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(mazeX + 10, mazeY + 35); ctx.lineTo(mazeX + 50, mazeY + 35); ctx.lineTo(mazeX + 50, mazeY + 60); ctx.stroke();
                    }
                    if(area.icon === '🪱') {
                        ctx.fillStyle = 'rgba(6, 78, 59, 0.25)';
                        ctx.beginPath(); ctx.ellipse(area.x + 90, area.y + 85, 60, 24, 0, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = '#fde68a'; ctx.stroke();
                    }
                    if(area.icon === '🏮') {
                        for(let i=0;i<5;i++) {
                            let lx = area.x + 20 + i*40;
                            let ly = area.y + 60 + (i%2)*20;
                            ctx.fillStyle = '#f97316';
                            ctx.fillRect(lx, ly, 14, 22);
                            ctx.strokeStyle = '#fb923c'; ctx.strokeRect(lx, ly, 14, 22);
                        }
                    }
                    ctx.restore();
                });
                ctx.restore();
            }
        }

        function drawPortalsAndEntrances() {
            let px = player.x;
            let py = player.y;
            let timeTick = Date.now() / 300;
            
            if (window.currentMapId === 'world') {
                PORTALS.forEach(portal => {
                    let sx = portal.x - camera.x;
                    let sy = portal.y - camera.y;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(sx, sy, 35, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
                    ctx.fill();
                    ctx.strokeStyle = portal.color;
                    ctx.lineWidth = 3;
                    ctx.setLineDash([8, 12]);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 25, timeTick, timeTick + Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 8 + Math.sin(timeTick * 2) * 3, 0, Math.PI * 2);
                    ctx.fillStyle = portal.color;
                    ctx.fill();
                    ctx.font = "bold 11px 'Baloo 2'";
                    ctx.fillStyle = "#fff";
                    ctx.textAlign = "center";
                    ctx.fillText("🌀 " + portal.name, sx, sy - 40);
                    ctx.restore();
                });

                DUNGEON_ENTRANCES.forEach(ent => {
                    let sx = ent.x - camera.x;
                    let sy = ent.y - camera.y;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(sx, sy, 40, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
                    ctx.fill();
                    ctx.strokeStyle = ent.color;
                    ctx.lineWidth = 4;
                    ctx.setLineDash([12, 8]);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 30, -timeTick, -timeTick + Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 12 + Math.cos(timeTick) * 3, 0, Math.PI * 2);
                    ctx.fillStyle = ent.color;
                    ctx.fill();
                    ctx.font = "bold 12px 'Baloo 2'";
                    ctx.fillStyle = "#fca5a5";
                    ctx.textAlign = "center";
                    ctx.fillText("🔮 " + ent.name, sx, sy - 45);
                    ctx.restore();
                });

                BUILDING_ENTRANCES.forEach(ent => {
                    let sx = ent.x - camera.x;
                    let sy = ent.y - camera.y;
                    ctx.save();
                    ctx.beginPath();
                    ctx.ellipse(sx, sy, 20, 8, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
                    ctx.fill();
                    ctx.strokeStyle = '#eab308';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.font = "bold 11px 'Baloo 2'";
                    ctx.fillStyle = "#fef08a";
                    ctx.textAlign = "center";
                    ctx.fillText("🚪 " + ent.name, sx, sy - 15);
                    ctx.restore();
                });
            } else {
                if (window.currentMapId.includes('cave') || window.currentMapId.includes('dungeon') || window.currentMapId.includes('temple') || window.currentMapId === 'cemetery' || window.currentMapId === 'ghost_forest') {
                    let sx = 2000 - camera.x;
                    let sy = 2600 - camera.y;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(sx, sy, 40, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
                    ctx.fill();
                    ctx.strokeStyle = '#22d3ee';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([8, 12]);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 28, timeTick, timeTick + Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
                    ctx.fillStyle = '#22d3ee';
                    ctx.fill();
                    ctx.font = "bold 13px 'Baloo 2'";
                    ctx.fillStyle = "#fff";
                    ctx.textAlign = "center";
                    ctx.fillText("🌀 Cổng Về Làng", sx, sy - 45);
                    ctx.restore();
                } else {
                    let sx = 300 - camera.x;
                    let sy = 550 - camera.y;
                    ctx.save();
                    ctx.beginPath();
                    ctx.ellipse(sx, sy, 20, 8, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
                    ctx.fill();
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.font = "bold 12px 'Baloo 2'";
                    ctx.fillStyle = "#fca5a5";
                    ctx.textAlign = "center";
                    ctx.fillText("🚪 Ra Ngoài", sx, sy - 15);
                    ctx.restore();
                }
            }
        }

        function renderWorldGraphicsLayers() {
            ctx.fillStyle = "#111625";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            renderWorldThemeAreas();

            ctx.strokeStyle = "rgba(255,215,0,0.06)";
            ctx.lineWidth = 1;
            let spacing = 100;
            let startGridX = Math.floor(camera.x / spacing) * spacing;
            let startGridY = Math.floor(camera.y / spacing) * spacing;

            for(let gx = startGridX; gx < startGridX + canvas.width + spacing; gx += spacing) {
                ctx.beginPath();
                ctx.moveTo(gx - camera.x, 0); ctx.lineTo(gx - camera.x, canvas.height);
                ctx.stroke();
            }
            for(let gy = startGridY; gy < startGridY + canvas.height + spacing; gy += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, gy - camera.y); ctx.lineTo(canvas.width, gy - camera.y);
                ctx.stroke();
            }

            ctx.strokeStyle = "rgba(239,68,68,0.4)";
            ctx.lineWidth = 4;
            ctx.strokeRect(0 - camera.x, 0 - camera.y, WORLD_SIZE, WORLD_SIZE);

            renderClickMarker();
            renderSkillTargetPreview();
            drawPortalsAndEntrances();

            const drawList = [];

            // Add NPCs
            for(let nKey in NPC_DATA) {
                let npc = NPC_DATA[nKey];
                
                if (window.currentMapId !== 'world') {
                    let targetMap = '';
                    if (nKey === 'elder') targetMap = 'communal_house';
                    else if (nKey === 'blacksmith') targetMap = 'blacksmith_shop';
                    else if (nKey === 'merchant') targetMap = 'village_temple';
                    else if (nKey === 'barber') targetMap = 'school';
                    
                    if (window.currentMapId !== targetMap) continue;
                } else {
                    if (nKey === 'dirtyPond' || nKey === 'richMaze') continue;
                }

                drawList.push({
                    y: npc.y,
                    draw: () => {
                        let sx = npc.x - camera.x;
                        let sy = npc.y - camera.y;

                        ctx.beginPath();
                        ctx.arc(sx, sy, npc.radius, 0, Math.PI * 2);
                        ctx.fillStyle = "rgba(255,215,0,0.06)";
                        ctx.fill();
                        ctx.strokeStyle = "rgba(255,215,0,0.3)";
                        ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

                        ctx.font = "32px Arial";
                        ctx.textAlign = "center"; ctx.textBaseline = "middle";
                        ctx.fillText(npc.emoji, sx, sy - 5);

                        ctx.font = "bold 13px 'Baloo 2'";
                        ctx.fillStyle = "var(--gold)";
                        ctx.fillText(npc.name, sx, sy + 25);
                        ctx.font = "10px sans-serif";
                        ctx.fillStyle = "#4fc3f7";
                        ctx.fillText(npc.role, sx, sy + 38);

                        if(nKey === 'elder') {
                            ctx.font = "bold 20px Arial"; ctx.fillStyle = "#ffeb3b";
                            ctx.fillText("❓", sx, sy - 35);
                        }

                        if (npc.speechBubble && Date.now() < npc.speechBubbleTime) {
                            ctx.save();
                            ctx.font = "12px sans-serif";
                            let textW = ctx.measureText(npc.speechBubble).width;
                            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                            ctx.strokeStyle = "rgba(255, 215, 0, 0.7)";
                            ctx.lineWidth = 1;
                            let bx = sx - textW / 2 - 8;
                            let by = sy - 65;
                            let bw = textW + 16;
                            let bh = 24;
                            ctx.beginPath();
                            ctx.roundRect(bx, by, bw, bh, 6);
                            ctx.fill(); ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(sx - 4, by + bh);
                            ctx.lineTo(sx + 4, by + bh);
                            ctx.lineTo(sx, by + bh + 4);
                            ctx.closePath();
                            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                            ctx.fill();
                            ctx.beginPath();
                            ctx.moveTo(sx - 4, by + bh);
                            ctx.lineTo(sx, by + bh + 4);
                            ctx.lineTo(sx + 4, by + bh);
                            ctx.stroke();

                            ctx.fillStyle = "#fff";
                            ctx.textAlign = "center"; ctx.textBaseline = "middle";
                            ctx.fillText(npc.speechBubble, sx, by + bh / 2);
                            ctx.restore();
                        }
                    }
                });
            }

            // Add Monsters
            monsters.forEach(m => {
                drawList.push({
                    y: m.y,
                    draw: () => {
                        let sx = m.x - camera.x;
                        let sy = m.y - camera.y;

                        if(m.isBoss) {
                            ctx.beginPath(); ctx.arc(sx, sy, 40, 0, Math.PI*2);
                            ctx.fillStyle = "rgba(229,57,53,0.15)"; ctx.fill();
                            ctx.strokeStyle = "#e53935"; ctx.lineWidth = 2; ctx.stroke();
                        }

                        let drawn = false;
                        if (window.drawHelbreathMonster) {
                            drawn = window.drawHelbreathMonster(ctx, sx, sy, m);
                        }
                        if (!drawn) {
                            ctx.save();
                            ctx.font = m.isBoss ? "48px Arial" : "28px Arial";
                            ctx.textAlign = "center"; ctx.textBaseline = "middle";
                            ctx.shadowBlur = m.isBoss ? 16 : 8;
                            ctx.shadowColor = m.isBoss ? "#ef4444" : "rgba(0, 0, 0, 0.7)";
                            ctx.strokeStyle = "#000000";
                            ctx.lineWidth = 4;
                            ctx.strokeText(m.emoji, sx, sy);
                            ctx.fillText(m.emoji, sx, sy);
                            ctx.restore();
                        }

                        let barW = m.isBoss ? 80 : 40;
                        let barH = m.isBoss ? 7 : 4;
                        ctx.fillStyle = "#333";
                        ctx.fillRect(sx - barW/2, sy - 30, barW, barH);
                        ctx.fillStyle = m.isBoss ? "#e53935" : "#4caf50";
                        ctx.fillRect(sx - barW/2, sy - 30, barW * (m.hp / m.maxHp), barH);

                        ctx.font = "11px 'Baloo 2'"; ctx.fillStyle = m.isBoss ? "var(--red)" : "#aaa";
                        ctx.textAlign = "center";
                        ctx.fillText(m.name, sx, sy - 36);
                    }
                });
            });

            // Add Remote players
            for(let id in networkPlayers) {
                let p = networkPlayers[id];
                if (p.mapId !== window.currentMapId) continue;

                drawList.push({
                    y: p.y,
                    draw: () => {
                        let sx = p.x - camera.x;
                        let sy = p.y - camera.y;

                        if (window.drawBeautifulRPGChibi) {
                            window.drawBeautifulRPGChibi(ctx, sx, sy - 10, p.classId, false, 0.9, 'right');
                        } else {
                            ctx.font = "30px Arial"; ctx.textAlign = "center";
                            ctx.fillText(CLASS_DATA[p.classId]?.emoji || "👤", sx, sy);
                        }
                        
                        ctx.font = "bold 12px 'Baloo 2'"; ctx.fillStyle = "#f43f5e";
                        ctx.textAlign = "center";
                        ctx.fillText(`⚔️ ${p.name} (Lv.${p.level})`, sx, sy + 25);
                        
                        ctx.fillStyle = "red"; ctx.fillRect(sx-20, sy-22, 40, 3);
                        ctx.fillStyle = "green"; ctx.fillRect(sx-20, sy-22, 40 * (p.hp / p.maxHp), 3);
                    }
                });
            }

            // Add Self Player
            drawList.push({
                y: player.y,
                draw: () => {
                    let px = player.x - camera.x;
                    let py = player.y - camera.y;

                    if(player.hp > 0 && window.spawnAura && Math.random() < 0.25) {
                        let auraColor = '#fbbf24';
                        if(player.classId === 'cop') auraColor = '#38bdf8'; 
                        else if(player.classId === 'teacher') auraColor = '#ef4444'; 
                        else if(player.classId === 'merchant') auraColor = '#fbbf24';
                        else if(player.classId === 'engineer') auraColor = '#a855f7';
                        window.spawnAura(player.x, player.y, auraColor);
                    }

                    ctx.save();
                    let auraRadius = 42 + Math.sin(Date.now() / 180) * 4;
                    ctx.beginPath();
                    ctx.arc(px, py, auraRadius, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(79, 195, 247, 0.14)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255, 215, 0, 0.28)';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.restore();

                    if(player.isMoving) {
                        ctx.save();
                        ctx.globalAlpha = 0.24;
                        ctx.fillStyle = 'rgba(34, 197, 94, 0.18)';
                        ctx.beginPath();
                        ctx.ellipse(px, py + 36, 32, 10, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }

                    if (window.drawBeautifulRPGChibi) {
                        let faceDir = 'right';
                        let dx = 0;
                        if (window.pressedKeys) {
                            if (window.pressedKeys['a'] || window.pressedKeys['arrowleft']) dx = -1;
                            if (window.pressedKeys['d'] || window.pressedKeys['arrowright']) dx = 1;
                        }
                        if (dx === 0 && window.joystickActive && window.joystickVector) {
                            dx = window.joystickVector.x;
                        }
                        if (dx < -0.1) faceDir = 'left';
                        else if (dx > 0.1) faceDir = 'right';
                        
                        window.drawBeautifulRPGChibi(ctx, px, py - 10, player.classId, player.isMoving, 1.0, faceDir);
                    } else {
                        ctx.font = "34px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                        ctx.fillText(CLASS_DATA[player.classId]?.emoji || "👮‍♂️", px, py);
                    }

                    ctx.font = "bold 13px 'Baloo 2'"; ctx.fillStyle = "#fff";
                    ctx.textAlign = "center";
                    ctx.fillText(player.name, px, py + 26);

                    renderAttackEffect();
                }
            });

            // Add Map Decorations
            window.mapDecorations.forEach(dec => {
                drawList.push({
                    y: dec.y,
                    draw: () => {
                        if (window.drawDecoration) {
                            window.drawDecoration(ctx, dec, camera);
                        }
                    }
                });
            });

            // Sort all by Y pivot position
            drawList.sort((a, b) => a.y - b.y);

            // Draw Y-Sorted items
            drawList.forEach(item => item.draw());

            renderMonsterProjectiles();
            renderSkillEffects();
            renderSkillActionPopups();

            // Layer 5: Target Reticle Selection Highlights Line Indicators
            if(player.targetMonster) {
                let m = player.targetMonster;
                ctx.beginPath();
                ctx.strokeStyle = "rgba(244,63,94,0.6)";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.moveTo(player.x - camera.x, player.y - camera.y);
                ctx.lineTo(m.x - camera.x, m.y - camera.y);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.strokeStyle = "#f43f5e";
                ctx.strokeRect(m.x - camera.x - 22, m.y - camera.y - 22, 44, 44);
            }

            // Layer 7: Render Floating Particle elements array
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.opacity;
                
                let px = p.x - camera.x;
                let py = p.y - camera.y;
                
                if (p.emoji === "⚔️" || p.emoji === "💥" || p.emoji === "🔥") {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "#ef4444";
                    ctx.strokeStyle = "#f87171";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(px - p.vx * 3, py - p.vy * 3);
                    ctx.lineTo(px + p.vx * 3, py + p.vy * 3);
                    ctx.stroke();
                } else if (p.emoji === "🧪") {
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = "#22c55e";
                    ctx.fillStyle = "#4ade80";
                    ctx.beginPath();
                    ctx.arc(px, py, 4 + p.life % 4, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.emoji === "❤️") {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "#f43f5e";
                    ctx.fillStyle = "#fda4af";
                    ctx.beginPath();
                    ctx.arc(px, py, 6, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.emoji === "✨" || p.emoji === "⭐") {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "#eab308";
                    ctx.fillStyle = "#fef08a";
                    ctx.beginPath();
                    ctx.moveTo(px, py - 8);
                    ctx.lineTo(px + 4, py - 2);
                    ctx.lineTo(px + 10, py);
                    ctx.lineTo(px + 4, py + 2);
                    ctx.lineTo(px, py + 8);
                    ctx.lineTo(px - 4, py + 2);
                    ctx.lineTo(px - 10, py);
                    ctx.lineTo(px - 4, py - 2);
                    ctx.closePath();
                    ctx.fill();
                } else if (p.emoji === "💀") {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = "#7c3aed";
                    ctx.fillStyle = "#c084fc";
                    ctx.beginPath();
                    ctx.arc(px, py, 5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.emoji === "💰") {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = "#fbbf24";
                    ctx.fillStyle = "#fbbf24";
                    ctx.beginPath();
                    ctx.arc(px, py, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#b45309";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                } else {
                    ctx.font = "20px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(p.emoji, px, py);
                }
                
                ctx.restore();
            });
            
            if(!window.uiTicks) window.uiTicks = 0;
            if(window.uiTicks++ % 8 === 0) refreshHudDisplay();
        }

        function renderMinimapGraphics() {
            mCtx.fillStyle = "rgba(10,15,30,0.85)";
            mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);

            // Map sizing scaling ratio converters
            let scale = mCanvas.width / WORLD_SIZE;

            // Render Static Map NPCs dots
            for(let k in NPC_DATA) {
                let n = NPC_DATA[k];
                mCtx.fillStyle = "gold";
                mCtx.beginPath(); mCtx.arc(n.x * scale, n.y * scale, 3, 0, Math.PI*2); mCtx.fill();
            }

            // Render Red Roaming Enemy Dots
            monsters.forEach(m => {
                mCtx.fillStyle = m.isBoss ? "orange" : "red";
                mCtx.beginPath(); mCtx.arc(m.x * scale, m.y * scale, m.isBoss ? 4 : 2, 0, Math.PI*2); mCtx.fill();
            });

            // Render Green Core Main Client Player Dot
            mCtx.fillStyle = "#22c55e";
            mCtx.beginPath(); mCtx.arc(player.x * scale, player.y * scale, 4, 0, Math.PI*2); mCtx.fill();

            // Self outline cursor cross ring
            mCtx.strokeStyle = "rgba(34,197,94,0.5)";
            mCtx.strokeRect(player.x * scale - 4, player.y * scale - 4, 8, 8);
        }

        // --- MULTI-MAP PORTALS & TRANSITIONS ---
        const PORTALS = [
            { name: "Làng Trung Tâm", mapId: "world", x: 1520, y: 1450, color: '#22d3ee' },
            { name: "Rừng U Minh", mapId: "world", x: 600, y: 2800, color: '#10b981' },
            { name: "Hồ Sen Tĩnh Lặng", mapId: "world", x: 2800, y: 2800, color: '#3b82f6' },
            { name: "Đồi Cỏ Mặt Trời", mapId: "world", x: 3300, y: 800, color: '#eab308' },
            { name: "Bãi Luyện Cấp (Dị Biến)", mapId: "world", x: 1200, y: 3500, color: '#f43f5e' },
            { name: "Chợ Quê Xóm Dưới", mapId: "world", x: 2800, y: 3600, color: '#a855f7' }
        ];

        const DUNGEON_ENTRANCES = [
            { name: "Cổng Vào Hang Quỷ (Cấp 15+)", targetMapId: "demon_cave", parentMapId: "world", x: 400, y: 2500, spawnX: 2000, spawnY: 2500, color: '#ef4444' },
            { name: "Cổng Vào Nghĩa Địa (Cấp 25+)", targetMapId: "cemetery", parentMapId: "world", x: 800, y: 3400, spawnX: 2000, spawnY: 2500, color: '#6b7280' },
            { name: "Cổng Vào Rừng Ma (Cấp 35+)", targetMapId: "ghost_forest", parentMapId: "world", x: 3500, y: 500, spawnX: 2000, spawnY: 2500, color: '#a855f7' },
            { name: "Cổng Vào Đền Cổ (Cấp 45+)", targetMapId: "ancient_temple", parentMapId: "world", x: 3100, y: 2500, spawnX: 2000, spawnY: 2500, color: '#eab308' },
            { name: "Cổng Vào Hầm Ngục Tối (Cấp 55+)", targetMapId: "dungeon", parentMapId: "world", x: 2900, y: 3700, spawnX: 2000, spawnY: 2500, color: '#f97316' }
        ];

        const BUILDING_ENTRANCES = [
            { name: "Cửa Vào Ủy Ban Xã", targetMapId: "communal_house", parentMapId: "world", x: 1800, y: 1600, spawnX: 300, spawnY: 500, color: '#f43f5e' },
            { name: "Cửa Vào Trường Học", targetMapId: "school", parentMapId: "world", x: 2000, y: 1600, spawnX: 300, spawnY: 500, color: '#38bdf8' },
            { name: "Cửa Vào Trạm Công An", targetMapId: "police_station", parentMapId: "world", x: 2200, y: 1600, spawnX: 300, spawnY: 500, color: '#fbbf24' },
            { name: "Cửa Vào Lò Rèn", targetMapId: "blacksmith_shop", parentMapId: "world", x: 2300, y: 1550, spawnX: 300, spawnY: 500, color: '#fb923c' },
            { name: "Cửa Vào Đình Làng", targetMapId: "village_temple", parentMapId: "world", x: 2500, y: 1550, spawnX: 300, spawnY: 500, color: '#e2e8f0' }
        ];

        function spawnMonstersForMap(mapId) {
            monsters = [];
            if (mapId === 'world') {
                spawnInitialMonsters();
            } else if (mapId === 'demon_cave') {
                spawnBoss('demon_cave', 'Quỷ Vương Khổng Lồ (Cyclops Lord)', '🐗', 2500, 2000, 2000);
                for (let i = 0; i < 15; i++) {
                    spawnMinion('cyc', 2000 + (Math.random()-0.5)*800, 2000 + (Math.random()-0.5)*800);
                }
            } else if (mapId === 'cemetery') {
                spawnBoss('cemetery', 'Chúa Tể Thây Ma (Zombie Lord)', '🐕', 3500, 2000, 2000);
                for (let i = 0; i < 15; i++) {
                    spawnMinion('zom', 2000 + (Math.random()-0.5)*800, 2000 + (Math.random()-0.5)*800);
                }
            } else if (mapId === 'dungeon') {
                spawnBoss('dungeon', 'Ma Vương Rực Lửa (Barlog King)', '👹', 5000, 2000, 2000);
                for (let i = 0; i < 15; i++) {
                    spawnMinion('barlog', 2000 + (Math.random()-0.5)*800, 2000 + (Math.random()-0.5)*800);
                }
            } else if (mapId === 'ghost_forest') {
                spawnBoss('ghost_forest', 'Ác Quỷ Bóng Đêm', '👹', 3000, 2000, 2000);
                for (let i = 0; i < 12; i++) {
                    spawnMinion('ant', 2000 + (Math.random()-0.5)*800, 2000 + (Math.random()-0.5)*800);
                }
            } else if (mapId === 'ancient_temple') {
                spawnBoss('ancient_temple', 'Hộ Vệ Đền Cổ', '🐗', 4000, 2000, 2000);
                for (let i = 0; i < 12; i++) {
                    spawnMinion('cyc', 2000 + (Math.random()-0.5)*800, 2000 + (Math.random()-0.5)*800);
                }
            }
        }

        function spawnBoss(mapId, name, emoji, hp, x, y) {
            monsters.push({
                name: name,
                emoji: emoji,
                hp: hp,
                maxHp: hp,
                atk: 45,
                def: 25,
                speed: 2.2,
                isBoss: true,
                xpReward: 1200,
                goldReward: 2500,
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                lastAttack: 0,
                id: "BOSS_" + mapId
            });
        }

        function spawnMinion(type, x, y) {
            let template = null;
            if (type === 'ant') template = MONSTER_POOL[0];
            else if (type === 'slm') template = MONSTER_POOL[1];
            else if (type === 'zom') template = MONSTER_POOL[2];
            else if (type === 'cyc') template = MONSTER_POOL[3];
            else if (type === 'barlog') {
                template = { name: "Quỷ Lửa Nhỏ", emoji: "👹", hp: 350, maxHp: 350, atk: 28, exp: 160, gold: 60 };
            }
            if (!template) template = MONSTER_POOL[0];
            
            monsters.push({
                ...JSON.parse(JSON.stringify(template)),
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                lastAttack: 0,
                id: "MINION_" + Math.random()
            });
        }

        window.changeMap = function(mapId, spawnX, spawnY) {
            if (window.currentMapId === mapId) return;
            
            audio.play('C23');
            
            const fadeDiv = document.createElement('div');
            fadeDiv.style.position = 'fixed';
            fadeDiv.style.inset = '0';
            fadeDiv.style.background = '#000';
            fadeDiv.style.opacity = '0';
            fadeDiv.style.transition = 'opacity 0.4s ease';
            fadeDiv.style.zIndex = '99999';
            document.body.appendChild(fadeDiv);
            
            setTimeout(() => { fadeDiv.style.opacity = '1'; }, 50);
            
            setTimeout(() => {
                window.currentMapId = mapId;
                player.x = spawnX;
                player.y = spawnY;
                player.destinationX = undefined;
                player.destinationY = undefined;
                player.targetMonster = null;
                
                if (window.generateMapDecorations) {
                    window.generateMapDecorations(mapId);
                }
                spawnMonstersForMap(mapId);
                
                let targetBgm = 'aresden';
                if (mapId === 'demon_cave' || mapId === 'dungeon') targetBgm = 'dungeon';
                else if (mapId === 'cemetery') targetBgm = 'apocalypse';
                else if (mapId.includes('house') || mapId.includes('school') || mapId.includes('shop')) targetBgm = 'elvine';
                audio.playBgm(targetBgm);
                
                showToast(`🔮 Đã chuyển sang bản đồ: ${mapId.toUpperCase()}`);
                
                fadeDiv.style.opacity = '0';
                setTimeout(() => { fadeDiv.remove(); }, 400);
            }, 450);
        };

        function teleportToPortal(portal) {
            audio.play('C23');
            
            const fadeDiv = document.createElement('div');
            fadeDiv.style.position = 'fixed';
            fadeDiv.style.inset = '0';
            fadeDiv.style.background = '#000';
            fadeDiv.style.opacity = '0';
            fadeDiv.style.transition = 'opacity 0.3s ease';
            fadeDiv.style.zIndex = '99999';
            document.body.appendChild(fadeDiv);
            
            setTimeout(() => { fadeDiv.style.opacity = '1'; }, 50);
            
            setTimeout(() => {
                window.currentMapId = portal.mapId;
                player.x = portal.x;
                player.y = portal.y + 40;
                player.destinationX = undefined;
                player.destinationY = undefined;
                player.targetMonster = null;
                
                if (window.generateMapDecorations) {
                    window.generateMapDecorations(window.currentMapId);
                }
                spawnMonstersForMap(window.currentMapId);
                
                showToast(`🌀 Đã dịch chuyển tới ${portal.name}`);
                
                for (let i = 0; i < 30; i++) {
                    let vx = (Math.random() - 0.5) * 8;
                    let vy = (Math.random() - 0.5) * 8 - 4;
                    window.spawnParticle(player.x, player.y, portal.color, Math.random()*6+2, 25, vx, vy, 'glow');
                }
                
                fadeDiv.style.opacity = '0';
                setTimeout(() => { fadeDiv.remove(); }, 300);
            }, 350);
        }

        function openTeleportMenu() {
            if (document.getElementById('teleportMenu')) return;
            
            const menu = document.createElement('div');
            menu.id = 'teleportMenu';
            menu.style.position = 'fixed';
            menu.style.left = '50%';
            menu.style.top = '50%';
            menu.style.transform = 'translate(-50%, -50%)';
            menu.style.width = '320px';
            menu.style.zIndex = '1000';
            menu.style.background = '#1a120b';
            menu.style.border = '2px solid #d4af37';
            menu.style.borderRadius = '12px';
            menu.style.boxShadow = '0 0 25px rgba(0,0,0,0.8)';
            menu.style.fontFamily = '"Baloo 2", sans-serif';
            menu.style.color = '#f5f5f5';
            
            const header = document.createElement('div');
            header.style.background = '#3c2a21';
            header.style.padding = '12px';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.borderBottom = '1px solid #d4af37';
            header.style.borderTopLeftRadius = '10px';
            header.style.borderTopRightRadius = '10px';
            
            const title = document.createElement('span');
            title.textContent = '🌀 DỊCH CHUYỂN NHANH';
            title.style.fontWeight = 'bold';
            title.style.color = '#d4af37';
            
            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '✖';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => { menu.remove(); };
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            menu.appendChild(header);
            
            const body = document.createElement('div');
            body.style.padding = '15px';
            body.style.display = 'flex';
            body.style.flexDirection = 'column';
            body.style.gap = '10px';
            
            PORTALS.forEach(p => {
                const btn = document.createElement('button');
                btn.textContent = p.name;
                btn.style.width = '100%';
                btn.style.padding = '10px';
                btn.style.background = '#543d2b';
                btn.style.border = '1px solid #d4af37';
                btn.style.borderRadius = '6px';
                btn.style.color = '#fff';
                btn.style.fontWeight = 'bold';
                btn.style.cursor = 'pointer';
                
                btn.onclick = () => {
                    menu.remove();
                    teleportToPortal(p);
                };
                body.appendChild(btn);
            });
            
            menu.appendChild(body);
            document.body.appendChild(menu);
        }

        window.checkPortalTriggers = function() {
            let px = player.x;
            let py = player.y;
            
            if (window.currentMapId === 'world') {
                let currentStandingPortal = null;
                for (let portal of PORTALS) {
                    let dist = Math.sqrt((px - portal.x)**2 + (py - portal.y)**2);
                    if (dist < 30) {
                        currentStandingPortal = portal;
                        break;
                    }
                }
                
                if (currentStandingPortal) {
                    if (window.lastPortalVisited !== currentStandingPortal) {
                        window.lastPortalVisited = currentStandingPortal;
                        openTeleportMenu();
                    }
                    return;
                } else {
                    window.lastPortalVisited = null;
                }

                for (let entrance of DUNGEON_ENTRANCES) {
                    let dist = Math.sqrt((px - entrance.x)**2 + (py - entrance.y)**2);
                    if (dist < 40) {
                        let reqLevel = 1;
                        if (entrance.targetMapId === 'demon_cave') reqLevel = 15;
                        else if (entrance.targetMapId === 'cemetery') reqLevel = 25;
                        else if (entrance.targetMapId === 'ghost_forest') reqLevel = 35;
                        else if (entrance.targetMapId === 'ancient_temple') reqLevel = 45;
                        else if (entrance.targetMapId === 'dungeon') reqLevel = 55;
                        
                        if (player.level < reqLevel) {
                            showToast(`⚠️ Cần đạt cấp ${reqLevel} để đi vào hầm ngục này!`, '#ef4444');
                            player.x -= (player.x - entrance.x) * 0.5;
                            player.y -= (player.y - entrance.y) * 0.5;
                            return;
                        }
                        
                        window.changeMap(entrance.targetMapId, entrance.spawnX, entrance.spawnY);
                        return;
                    }
                }
                
                for (let entrance of BUILDING_ENTRANCES) {
                    let dist = Math.sqrt((px - entrance.x)**2 + (py - entrance.y)**2);
                    if (dist < 35) {
                        window.changeMap(entrance.targetMapId, entrance.spawnX, entrance.spawnY);
                        return;
                    }
                }
            } else {
                if (window.currentMapId.includes('cave') || window.currentMapId.includes('dungeon') || window.currentMapId.includes('temple') || window.currentMapId === 'cemetery' || window.currentMapId === 'ghost_forest') {
                    let dist = Math.sqrt((px - 2000)**2 + (py - 2600)**2);
                    if (dist < 40) {
                        let ent = DUNGEON_ENTRANCES.find(e => e.targetMapId === window.currentMapId);
                        let rx = ent ? ent.x : 1520;
                        let ry = ent ? ent.y + 50 : 1450;
                        window.changeMap('world', rx, ry);
                        return;
                    }
                } else {
                    let dist = Math.sqrt((px - 300)**2 + (py - 550)**2);
                    if (dist < 35) {
                        let ent = BUILDING_ENTRANCES.find(e => e.targetMapId === window.currentMapId);
                        let rx = ent ? ent.x : 1520;
                        let ry = ent ? ent.y + 50 : 1450;
                        window.changeMap('world', rx, ry);
                        return;
                    }
                }
            }
        };
