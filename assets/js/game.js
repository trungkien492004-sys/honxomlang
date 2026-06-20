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
                // Disabled by user request
                return;
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
        
        // --- STORY SYSTEM AND OPTIONAL QUESTS ---
        const STORY_QUESTS = [
            {
                id: "story_1",
                title: "Tỉnh Giấc",
                desc: "Nói chuyện với Trưởng Làng Lâm để bắt đầu cuộc hành trình.",
                type: "talk",
                target: "elder",
                reqLevel: 1,
                rewardGold: 50,
                rewardExp: 100,
                rewardItem: "wp_wooden",
                dialogStart: "Trưởng Làng Lâm: Con cuối cùng cũng tỉnh rồi! Cơn địa chấn vừa rồi thật đáng sợ. Ta rất lo lắng cho tương lai của làng...",
                dialogFinish: "Trưởng Làng Lâm: Tốt lắm, ta thấy con có tư chất võ học. Hãy cầm lấy thanh Kiếm Gỗ này làm vũ khí hộ thân."
            },
            {
                id: "story_2",
                title: "Người Dân Lo Lắng",
                desc: "Đến trò chuyện với Bà Năm để tìm hiểu về tình hình trong làng.",
                type: "talk",
                target: "ba_nam",
                reqLevel: 1,
                rewardGold: 100,
                rewardExp: 100,
                dialogStart: "Bà Năm: Ôi chao, cậu trẻ vừa tỉnh dậy đấy à? Cơn địa chấn làm mọi người trong làng lo sốt vó lên đây này. Hãy đi hỏi thăm bà con xem sao.",
                dialogFinish: "Bà Năm: Cảm ơn cậu đã quan tâm đến bà con. Đây là chút lộ phí nhỏ ta tặng cậu."
            },
            {
                id: "story_3",
                title: "Chuột Trong Kho Lúa",
                desc: "Tiêu diệt 5 con Chuột Cống ở bãi đất phía Bắc giúp Cô Ba Tạp Hóa.",
                type: "kill",
                target: "Chuột Cống",
                req: 5,
                reqLevel: 1,
                rewardGold: 100,
                rewardExp: 300,
                npcAccept: "merchant",
                npcFinish: "merchant",
                dialogStart: "Cô Ba: Mấy hôm nay, lũ Chuột Cống trong kho lúa phá hoại quá! Con mau ra bờ mương phía Bắc tiêu diệt 5 con Chuột Cống giúp ta nhé.",
                dialogFinish: "Cô Ba: Cảm ơn con! Kho lúa của ta tạm thời yên ổn rồi."
            },
            {
                id: "story_4",
                title: "Đồ Ăn Cho Quán",
                desc: "Thu thập 10 Thịt Chuột từ Chuột Cống mang về cho Cô Ba.",
                type: "collect",
                target: "Thịt Chuột",
                req: 10,
                reqLevel: 2,
                rewardGold: 150,
                rewardExp: 300,
                rewardItem: "food_bread",
                npcAccept: "merchant",
                npcFinish: "merchant",
                dialogStart: "Cô Ba: Ta đang cần nguyên liệu làm món thịt chuột nướng cho quán. Con đi diệt chuột và thu thập giúp ta 10 miếng Thịt Chuột nhé.",
                dialogFinish: "Cô Ba: Ôi thịt tươi ngon quá! Đây là ổ Bánh Mì nóng hổi và tiền công của con."
            },
            {
                id: "story_5",
                title: "Thanh Kiếm Cũ",
                desc: "Thu thập 5 Quặng Đồng Thô mang về cho Thợ Rèn Hùng.",
                type: "collect",
                target: "copper_ore",
                req: 5,
                reqLevel: 2,
                rewardGold: 100,
                rewardExp: 200,
                rewardItem: "wp_copper",
                npcAccept: "blacksmith",
                npcFinish: "blacksmith",
                dialogStart: "Thợ Rèn Hùng: Keng! Keng! Chào cậu em. Muốn có vũ khí tốt hơn à? Đi tới Mỏ Đá phía Tây tìm cho ta 5 Quặng Đồng Thô xem nào.",
                dialogFinish: "Thợ Rèn Hùng: Quặng đồng rất tốt! Để ta đúc cho cậu em một thanh Kiếm Đồng sáng loáng!"
            },
            {
                id: "story_6",
                title: "Tiếng Khóc Trong Rừng",
                desc: "Tìm kiếm chú Mèo Lạc trong Rừng Tân Thủ mang về cho Bé Na.",
                type: "collect",
                target: "lost_cat",
                req: 1,
                reqLevel: 3,
                rewardGold: 150,
                rewardExp: 400,
                rewardItem: "ac_lucky_amulet",
                npcAccept: "be_na",
                npcFinish: "be_na",
                dialogStart: "Bé Na: Huhu... Anh ơi, chú mèo vàng của em chạy lạc vào Rừng Tân Thủ rồi. Anh tìm giúp em với, nghe nói trong rừng có nhiều sói lắm...",
                dialogFinish: "Bé Na: A! Chú mèo vàng đây rồi! Cảm ơn anh nhiều lắm. Đây là Mặt Dây Chuyền May Mắn em tặng anh!"
            },
            {
                id: "story_7",
                title: "Bầy Sói Đói",
                desc: "Gặp Thợ Săn Nam để nhận nhiệm vụ tiêu diệt đàn sói rừng.",
                type: "talk",
                target: "hunter_nam",
                reqLevel: 3,
                rewardGold: 200,
                rewardExp: 500,
                dialogStart: "Thợ Săn Nam: Chào cậu. Bầy sói hoang dạo này đói ăn nên hung tợn lắm. Hãy tiến vào Rừng Tân Thủ tiêu diệt 8 con Sói Hoang bảo vệ dân làng nhé.",
                dialogFinish: "Thợ Săn Nam: Rất tốt, cậu dũng cảm lắm. Tấm da sói này ta tặng cậu làm giáp phòng thân.",
                rewardItem: "ar_wolf_leather"
            },
            {
                id: "story_8",
                title: "Mùi Hôi Từ Cống Ngầm",
                desc: "Đến gặp Trưởng Làng Lâm để báo cáo và khám phá Cống Ngầm Cũ.",
                type: "talk",
                target: "elder",
                reqLevel: 4,
                rewardGold: 250,
                rewardExp: 600,
                dialogStart: "Trưởng Làng Lâm: Có mùi hôi thối bốc lên từ Cống Ngầm Cũ phía Đông làng. Ta nghi ngờ có dịch bệnh hoặc sinh vật biến dị. Con hãy xuống đó điều tra và diệt trừ con Chuột Đột Biến!",
                dialogFinish: "Trưởng Làng Lâm: Con đã diệt được Chuột Đột Biến? Tuyệt vời! Đây là Giày Tăng Tốc thưởng cho sự dũng cảm của con.",
                rewardItem: "eq_speed_boots"
            },
            {
                id: "story_9",
                title: "Mảnh Bản Đồ Bí Ẩn",
                desc: "Mang Mảnh Bản Đồ Cổ nhặt được từ Chuột Đột Biến đến cho Thợ Rèn Hùng.",
                type: "talk",
                target: "blacksmith",
                reqLevel: 5,
                rewardGold: 300,
                rewardExp: 800,
                dialogStart: "Thợ Rèn Hùng: Bản đồ cổ này... Để ta xem nào. Nét vẽ này rất giống các ký tự của vương quốc cổ đại bị chôn vùi!",
                dialogFinish: "Thợ Rèn Hùng: Đúng rồi! Đây là một phần bản đồ kho báu cổ. Con hãy mang nó tới gặp Giáo Sư Minh khảo cổ để giải mã thêm."
            },
            {
                id: "story_10",
                title: "Người Khảo Cổ",
                desc: "Thu thập 3 Mảnh Đá Khắc từ Hang Dơi mang về cho Giáo Sư Minh.",
                type: "collect",
                target: "stone_engraving",
                req: 3,
                reqLevel: 5,
                rewardGold: 350,
                rewardExp: 1000,
                npcAccept: "prof_minh",
                npcFinish: "prof_minh",
                dialogStart: "Giáo Sư Minh: Kính lúp của ta đâu rồi... Ồ, mảnh bản đồ cổ! Để giải mã nó, ta cần con vào Hang Dơi thu thập 3 Mảnh Đá Khắc chứa cổ thư tự.",
                dialogFinish: "Giáo Sư Minh: Quá tuyệt vời! 3 mảnh đá khắc này khớp hoàn toàn với bản đồ!"
            },
            {
                id: "story_11",
                title: "Hang Dơi U Ám",
                desc: "Tiên vào Hang Dơi tiêu diệt 5 con Dơi Máu để làm sạch hang động.",
                type: "kill",
                target: "Dơi Máu",
                req: 5,
                reqLevel: 6,
                npcAccept: "prof_minh",
                npcFinish: "prof_minh",
                rewardGold: 400,
                rewardExp: 1200,
                rewardItem: "wp_copper_refined",
                dialogStart: "Giáo Sư Minh: Lũ dơi trong hang đang trở nên vô cùng khát máu. Hãy tiêu diệt 5 con Dơi Máu gác cửa để ta có thể vào sâu nghiên cứu.",
                dialogFinish: "Giáo Sư Minh: Cảm ơn con! Đây là thanh Kiếm Đồng Tinh Luyện ta tìm thấy trong di tích cổ tặng con."
            },
            {
                id: "story_12",
                title: "Trứng Quái Dị",
                desc: "Quay lại gặp Giáo Sư Minh để tìm hiểu về nguồn gốc sinh vật biến dị.",
                type: "talk",
                target: "prof_minh",
                reqLevel: 7,
                rewardGold: 450,
                rewardExp: 1500,
                dialogStart: "Giáo Sư Minh: Con có thấy những tổ trứng khổng lồ trong hang không? Chúng đang đe dọa sinh sôi nảy nở. Hãy đi tiêu diệt Mẫu Thể Ký Sinh đầu sỏ!",
                dialogFinish: "Giáo Sư Minh: Thật đáng sợ! Con quái vật đó có thể ký sinh và điều khiển sinh vật khác. Cả vùng đất đang gặp nguy hiểm!"
            },
            {
                id: "story_13",
                title: "Thợ Rèn Mất Tích",
                desc: "Đến gặp Vợ Thợ Rèn để hỏi thăm về Thợ Rèn Hùng.",
                type: "talk",
                target: "wife_blacksmith",
                reqLevel: 8,
                rewardGold: 500,
                rewardExp: 2000,
                dialogStart: "Vợ Thợ Rèn: Huhuhu... Nhà tôi đi tìm quặng ở Mỏ Đồng Bỏ Hoang ba ngày nay chưa thấy về. Trong mỏ dạo này xuất hiện nhiều Người Đá hung dữ lắm. Tráng sĩ cứu nhà tôi với!",
                dialogFinish: "Vợ Thợ Rèn: Cầu mong tráng sĩ tìm thấy nhà tôi bình an vô sự..."
            },
            {
                id: "story_14",
                title: "Bí Mật Trong Hầm Mỏ",
                desc: "Giải cứu Thợ Rèn Hùng tại Mỏ Đồng Bỏ Hoang.",
                type: "talk",
                target: "blacksmith",
                reqLevel: 9,
                rewardGold: 600,
                rewardExp: 2500,
                dialogStart: "Thợ Rèn Hùng: Ôi may quá con đã tới! Ta bị lũ Giáo Đồ Bóng Đêm giam giữ ở đây. Chúng đang khai quật một thứ tà thuật hắc ám để hồi sinh thế lực cổ xưa!",
                dialogFinish: "Thợ Rèn Hùng: Cảm ơn con cứu mạng! Lũ giáo đồ đó thuộc một giáo phái cực kỳ bí ẩn đang nhắm vào ngôi làng của chúng ta."
            },
            {
                id: "story_15",
                title: "Tấn Công Doanh Trại Giáo Đồ",
                desc: "Tiêu diệt 8 Giáo Đồ Bóng Đêm tại Doanh Trại Giáo Đồ để chặn đứng âm mưu của chúng.",
                type: "kill",
                target: "Giáo Đồ Bóng Đêm",
                req: 8,
                reqLevel: 10,
                npcAccept: "blacksmith",
                npcFinish: "elder",
                rewardGold: 700,
                rewardExp: 3000,
                dialogStart: "Thợ Rèn Hùng: Giáo phái hắc ám có một doanh trại lớn gần mỏ đồng. Hãy tiến công tiêu diệt 8 tên lính gác của chúng!",
                dialogFinish: "Trưởng Làng Lâm: Tuyệt vời! Con đã đập tan tiền đồn của chúng. Nhưng tình hình đang ngày càng căng thẳng."
            },
            {
                id: "story_16",
                title: "Truy Tìm Kẻ Chủ Mưu",
                desc: "Trò chuyện với Trưởng Làng Lâm để lên phương án phòng thủ làng.",
                type: "talk",
                target: "elder",
                reqLevel: 11,
                rewardGold: 800,
                rewardExp: 4000,
                dialogStart: "Trưởng Làng Lâm: Mật thư thu thập được từ doanh trại địch cho thấy chúng đang thờ phụng một tà thần cổ đại có tên là 'Thần Trùng'. Chúng ta phải chuẩn bị cho một trận chiến lớn!",
                dialogFinish: "Trưởng Làng Lâm: Chuẩn bị vũ khí đi con, ta cảm nhận bầu trời đang nhuộm sắc đỏ..."
            },
            {
                id: "story_17",
                title: "Đêm Trăng Máu",
                desc: "Chiến đấu chống lại các đợt quái vật tấn công làng.",
                type: "talk",
                target: "elder",
                reqLevel: 12,
                rewardGold: 1000,
                rewardExp: 6000,
                dialogStart: "Trưởng Làng Lâm: Nguy rồi! Trăng máu đã lên, lũ Chuột Máu, Sói Máu đang tấn công vào làng. Con hãy cùng ta bảo vệ cổng chính!",
                dialogFinish: "Trưởng Làng Lâm: Cảm ơn con! Ngôi làng tạm thời được giữ vững, nhưng tà khí bắt nguồn từ Hang Tổ Thần Trùng."
            },
            {
                id: "story_18",
                title: "Truy Kích Thần Trùng",
                desc: "Tiến vào Hang Tổ Thần Trùng tiêu diệt 10 con Chuột Khổng Lồ.",
                type: "kill",
                target: "Chuột Khổng Lồ",
                req: 10,
                reqLevel: 13,
                npcAccept: "elder",
                npcFinish: "elder",
                rewardGold: 1200,
                rewardExp: 8000,
                dialogStart: "Trưởng Làng Lâm: Hang Tổ Thần Trùng nằm sâu dưới thung lũng phía Bắc. Hãy tiến thẳng vào hang tiêu diệt 10 con Chuột Khổng Lồ mở đường vào sào huyệt!",
                dialogFinish: "Trưởng Làng Lâm: Con đường vào hang sâu đã được dọn sạch."
            },
            {
                id: "story_19",
                title: "Trái Tim Tổ Chuột",
                desc: "Thu thập 5 Tinh Thể Nhiễm Bệnh từ quái vật trong Hang Tổ.",
                type: "collect",
                target: "stone_disease",
                req: 5,
                reqLevel: 14,
                npcAccept: "elder",
                npcFinish: "elder",
                rewardGold: 1500,
                rewardExp: 10000,
                dialogStart: "Trưởng Làng Lâm: Trái tim của tổ chuột được bảo vệ bởi các tinh thể độc hại. Hãy thu thập 5 Tinh Thể Nhiễm Bệnh để làm suy yếu phong ấn của Chuột Chúa!",
                dialogFinish: "Trưởng Làng Lâm: Phong ấn đã vỡ! Tà thần cổ đại sắp xuất hiện!"
            },
            {
                id: "story_20",
                title: "SIÊU BOSS THẦN TRÙNG",
                desc: "Tiêu diệt Chuột Chúa - Thần Trùng Cổ Đại tại trung tâm Hang Tổ.",
                type: "kill",
                target: "Chuột Chúa - Thần Trùng Cổ Đại",
                req: 1,
                reqLevel: 15,
                npcAccept: "elder",
                npcFinish: "elder",
                rewardGold: 5000,
                rewardExp: 20000,
                rewardItem: "key_cemetery",
                dialogStart: "Trưởng Làng Lâm: Chuột Chúa - Thần Trùng Cổ Đại đã thức tỉnh! Hãy dùng tất cả sức mạnh tiêu diệt tà thần này giải cứu ngôi làng!",
                dialogFinish: "Trưởng Làng Lâm: Ôi trời đất ơi! Con thực sự đã tiêu diệt được Thần Trùng Cổ Đại! Nhưng con quái vật này rơi ra Chìa Khóa Nghĩa Địa và Ngọc Hắc Ám. Ta nghi ngờ có một thế lực ma vương đứng sau giật dây..."
            }
        ];

        // Functions to generate optional quests
        function generateDailyQuest() {
            let roll = Math.random();
            if(roll < 0.5) {
                return {
                    title: "📅 Diệt Muỗi Làng Bên",
                    desc: "Tiêu diệt 3 con Muỗi Vằn Sốt Xuất Huyết ở bờ ruộng phía Đông.",
                    type: "kill",
                    target: "Muỗi Vằn Sốt Xuất Huyết",
                    req: 3,
                    progress: 0,
                    rewardGold: 200,
                    rewardExp: 400
                };
            } else {
                return {
                    title: "📅 Diệt Chó Dại Bảo Vệ Dân",
                    desc: "Tiêu diệt 2 con Chó Hoang Lên Cơn Dại bảo vệ làng quê.",
                    type: "kill",
                    target: "Chó Hoang Lên Cơn Dại",
                    req: 2,
                    progress: 0,
                    rewardGold: 300,
                    rewardExp: 600
                };
            }
        }

        function generateGuildQuest() {
            let roll = Math.random();
            if(roll < 0.5) {
                return {
                    title: "🛡️ Quyên Góp Sắt Thô",
                    desc: "Thu thập và mang 2 Quặng Sắt Thô quyên góp vào kho bang.",
                    type: "collect",
                    target: "iron_ore",
                    req: 2,
                    progress: 0,
                    rewardGold: 250,
                    rewardExp: 500
                };
            } else {
                return {
                    title: "🛡️ Quyên Góp Pha Lê",
                    desc: "Thu thập và quyên góp 1 Pha Lê Ma Thuật cho bang hội.",
                    type: "collect",
                    target: "magic_crystal",
                    req: 1,
                    progress: 0,
                    rewardGold: 400,
                    rewardExp: 800
                };
            }
        }

        function generateCoupleQuest() {
            let roll = Math.random();
            if(roll < 0.5) {
                return {
                    title: "💖 Tặng Cơm Nắm Xá Xíu",
                    desc: "Thu thập 2 Cơm Nắm Xá Xíu để cùng người thương dã ngoại.",
                    type: "collect",
                    target: "food_com_nam",
                    req: 2,
                    progress: 0,
                    rewardGold: 200,
                    rewardExp: 400
                };
            } else {
                return {
                    title: "💖 Trò Chuyện Lãng Mạn",
                    desc: "Gặp gỡ Cô Ba Tạp Hóa để mua tặng hoa hồng tình duyên.",
                    type: "talk",
                    target: "merchant",
                    req: 1,
                    progress: 0,
                    rewardGold: 150,
                    rewardExp: 300
                };
            }
        }

        // Real-time skill cooldown update tick
        function updateSkillCooldownsTick() {
            if(!window.player || !player.skills) return;
            player.skills.forEach(s => {
                let btn = document.querySelector(`.skill-circle[data-skill-id="${s.id}"]`);
                if(!btn) return;
                let elapsed = Date.now() - s.lastUsed;
                let cooldownMs = s.cd - elapsed;
                let ready = cooldownMs <= 0;
                let cooldownSec = Math.max(0, cooldownMs / 1000);
                
                // Toggle cooling class
                if(!ready) {
                    btn.classList.add('cooling');
                } else {
                    btn.classList.remove('cooling');
                }
                
                // Update SVG progress ring
                let ring = btn.querySelector('.cooldown-ring circle:nth-child(2)');
                if(ring) {
                    let progress = ready ? 0 : (cooldownMs / s.cd) * 100;
                    ring.setAttribute('stroke-dashoffset', 251.2 - (251.2 * progress / 100));
                }
                
                // Update Cooldown Text
                let txt = btn.querySelector('.cooldown-text');
                if(txt) {
                    if(ready) {
                        txt.textContent = 'OK';
                        txt.style.color = '#f8fafc';
                    } else {
                        if(cooldownSec < 2.0) {
                            txt.textContent = cooldownSec.toFixed(1);
                            txt.style.color = '#ef4444';
                        } else {
                            txt.textContent = Math.ceil(cooldownSec) + 's';
                            txt.style.color = '#ffd54f';
                        }
                    }
                }
            });
        }

        // Quest Directions Pointer UI Canvas Drawer
        function renderQuestDirectionGuide() {
            if(currentScreen !== 'gameScreen') return;
            
            // Get coordinates of active target based on current accepted quest
            let targetX = null;
            let targetY = null;
            let targetName = "";
            let targetMap = "world"; // default
            
            if (player.currentQuestIdx !== undefined && STORY_QUESTS[player.currentQuestIdx]) {
                let sQuest = STORY_QUESTS[player.currentQuestIdx];
                if (!player.questAccepted) {
                    // Go accept quest from accept NPC
                    let npcKey = sQuest.npcAccept || sQuest.target;
                    let npc = NPC_DATA[npcKey];
                    if (npc) {
                        targetX = npc.x;
                        targetY = npc.y;
                        targetName = "📜 " + npc.name;
                    }
                } else {
                    // Accepted, go to target
                    if (sQuest.type === 'talk') {
                        let npc = NPC_DATA[sQuest.target];
                        if (npc) {
                            targetX = npc.x;
                            targetY = npc.y;
                            targetName = "💬 " + npc.name;
                        }
                    } else if (sQuest.type === 'kill') {
                        // Find if target monster exists on map
                        let match = monsters.find(m => m.name === sQuest.target);
                        if (match) {
                            targetX = match.x;
                            targetY = match.y;
                            targetName = "⚔️ " + match.name;
                        } else {
                            // Point to spawn region coordinate estimation
                            if (sQuest.target.includes('Chuột')) { targetX = 1800; targetY = 1800; }
                            else if (sQuest.target.includes('Chó')) { targetX = 1200; targetY = 2000; }
                            else if (sQuest.target.includes('Muỗi')) { targetX = 1000; targetY = 1000; }
                            else if (sQuest.target.includes('Lợn')) { targetX = 2500; targetY = 2500; }
                            else if (sQuest.target.includes('Hộ Vệ')) { targetX = 2000; targetY = 2000; }
                            else if (sQuest.target.includes('Thần Trùng')) { targetX = 2200; targetY = 2200; }
                            else if (sQuest.target.includes('Barlog')) { targetX = 3500; targetY = 500; }
                            else { targetX = 2000; targetY = 2000; }
                            targetName = "🔍 Vùng: " + sQuest.target;
                        }
                    } else if (sQuest.type === 'collect') {
                        // Point to drop items or spawn regions
                        let match = groundItems.find(gi => {
                            if (gi.mapId && gi.mapId !== (window.currentMapId || 'world')) return false;
                            let itemDef = ITEMS[gi.id];
                            return gi.id === sQuest.target || (itemDef && itemDef.name === sQuest.target);
                        });
                        if (match) {
                            targetX = match.x;
                            targetY = match.y;
                            targetName = "💎 Vật Phẩm Rơi";
                        } else {
                            targetX = 1800; targetY = 1800; // General central farm spot
                            targetName = "🌾 Tìm: " + sQuest.target;
                        }
                    }
                }
            } else if (player.dailyQuest) {
                let dq = player.dailyQuest;
                let match = monsters.find(m => m.name === dq.target);
                if (match) { targetX = match.x; targetY = match.y; }
                else { targetX = 1500; targetY = 1500; }
                targetName = dq.title;
            }

            if (targetX === null || targetY === null) return;

            // Draw arrow
            let sx = canvas.width / 2 + (targetX - player.x);
            let sy = canvas.height / 2 + (targetY - player.y);

            let isOnScreen = (sx >= 10 && sx <= canvas.width - 10 && sy >= 10 && sy <= canvas.height - 10);

            if (isOnScreen) {
                // Draw bouncing arrow pointing down above target
                let bounce = Math.sin(Date.now() / 150) * 8;
                ctx.save();
                ctx.fillStyle = "#ffd54f";
                ctx.strokeStyle = "#ff8f00";
                ctx.lineWidth = 2;
                ctx.beginPath();
                let ax = sx;
                let ay = sy - 60 + bounce;
                ctx.moveTo(ax, ay + 12);
                ctx.lineTo(ax - 8, ay);
                ctx.lineTo(ax - 3, ay);
                ctx.lineTo(ax - 3, ay - 12);
                ctx.lineTo(ax + 3, ay - 12);
                ctx.lineTo(ax + 3, ay);
                ctx.lineTo(ax + 8, ay);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            } else {
                // Draw edge indicator arrow pointing to direction
                let angle = Math.atan2(targetY - player.y, targetX - player.x);
                let border = 28;
                let arrowX = canvas.width / 2 + Math.cos(angle) * (canvas.width / 2 - border);
                let arrowY = canvas.height / 2 + Math.sin(angle) * (canvas.height / 2 - border);
                arrowX = Math.max(border, Math.min(canvas.width - border, arrowX));
                arrowY = Math.max(border, Math.min(canvas.height - border, arrowY));

                ctx.save();
                ctx.translate(arrowX, arrowY);
                ctx.rotate(angle);
                ctx.fillStyle = "#ffd54f";
                ctx.strokeStyle = "#ff8f00";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(12, 0);
                ctx.lineTo(-6, -8);
                ctx.lineTo(-2, -3);
                ctx.lineTo(-14, -3);
                ctx.lineTo(-14, 3);
                ctx.lineTo(-2, 3);
                ctx.lineTo(-6, 8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                // Draw Distance Label Text
                let distM = Math.round(Math.hypot(targetX - player.x, targetY - player.y) / 10);
                ctx.save();
                ctx.font = "bold 11px 'Baloo 2'";
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.textAlign = arrowX < canvas.width / 2 ? "left" : "right";
                let textX = arrowX + (arrowX < canvas.width / 2 ? 16 : -16);
                let textY = arrowY + 4;
                ctx.strokeText(`${targetName} (${distM}m)`, textX, textY);
                ctx.fillText(`${targetName} (${distM}m)`, textX, textY);
                ctx.restore();
            }
        }
        
        window.closeNpcDialogue = function() {
            let layer = document.getElementById('npcDialogLayer');
            if (layer) layer.style.display = 'none';
        };

	const CLASS_DATA = {
            cop: { name: "Anh Cảnh Sát", emoji: "👮‍♂️", hp: 160, mp: 40, atk: 12, def: 8, speed: 8.5, skills: [
                { id: "cop_bash", name: "Dùi Cùi Trấn Áp", icon: "🔨", desc: "Đập mạnh gây sát thương vật lý và làm chậm mục tiêu.", mp: 8, cd: 3000, type: 'target', range: 180, multiplier: 3.2, lastUsed: 0 },
                { id: "cop_shield", name: "Khiên Công Lý", icon: "🛡️", desc: "Tạo khiên hấp thụ sát thương và hồi HP tức thời.", mp: 12, cd: 6000, type: 'self', lastUsed: 0 },
                { id: "cop_charge", name: "Tăng Tốc Đột Kích", icon: "⚡", desc: "Phóng tới cường kích mục tiêu, tạo choáng nhẹ.", mp: 14, cd: 5200, type: 'target', range: 220, multiplier: 3.8, lastUsed: 0 },
                { id: "cop_siren", name: "Âm Thanh Kiểm Soát", icon: "📯", desc: "Gây hiệu ứng diện rộng làm chậm quái và giảm sát thương.", mp: 22, cd: 9000, type: 'aoe', range: 200, multiplier: 2.4, lastUsed: 0 },
                { id: "cop_bastion", name: "Thành Lũy Công Lý", icon: "🏰", desc: "Mở vùng phòng thủ, phản lại sát thương và hồi HP lớn.", mp: 30, cd: 14000, type: 'ultimate', lastUsed: 0 }
            ]},
            teacher: { name: "Cô Giáo Làng", emoji: "👩‍🏫", hp: 90, mp: 100, atk: 18, def: 3, speed: 8.0, skills: [
                { id: "teach_quiz", name: "Kiểm Tra Bài Cũ", icon: "✏️", desc: "Tung phấn ma thuật gây sát thương phép và làm choáng.", mp: 15, cd: 2500, type: 'target', range: 200, multiplier: 4.4, lastUsed: 0 },
                { id: "teach_silence", name: "Cả Lớp Trật Tự!", icon: "🔇", desc: "Khống chế một vùng kẻ địch và làm chậm lại toàn bộ quái.", mp: 25, cd: 7000, type: 'aoe', range: 180, multiplier: 2.6, lastUsed: 0 },
                { id: "teach_meteor", name: "Thiên Thạch Phấn", icon: "☄️", desc: "Gọi thiên thạch giáng xuống điểm đã chọn gây sát thương lớn.", mp: 28, cd: 9500, type: 'point', range: 240, multiplier: 5.0, lastUsed: 0 },
                { id: "teach_barrier", name: "Hào Quang Tri Thức", icon: "📚", desc: "Tạo lá chắn hồi phục cho bản thân và giảm sát thương.", mp: 20, cd: 10000, type: 'self', lastUsed: 0 },
                { id: "teach_grace", name: "Ánh Sao Tinh Tú", icon: "🌟", desc: "Kỹ năng tối thượng gây bão ma thuật lớn lên vùng mục tiêu.", mp: 35, cd: 14500, type: 'ultimate', lastUsed: 0 }
            ]},
            merchant: { name: "Chú Buôn Lậu", emoji: "🕵️‍♂️", hp: 110, mp: 60, atk: 15, def: 5, speed: 10.0, skills: [
                { id: "merch_slash", name: "Đoản Đao Cắt Lỗ", icon: "🗡️", desc: "Chém lén chí mạng gây sát thương lớn và tăng bạo kích.", mp: 10, cd: 2000, type: 'target', range: 180, multiplier: 3.8, lastUsed: 0 },
                { id: "merch_bribe", name: "Đút Lót Tăng Tốc", icon: "💰", desc: "Hồi MP và tăng tốc độ đánh nhanh chóng.", mp: 0, cd: 5000, type: 'self', lastUsed: 0 },
                { id: "merch_trap", name: "Bẫy Siêu Lợi", icon: "🪤", desc: "Đặt bẫy vùng gây sát thương và làm chậm địch.", mp: 18, cd: 7500, type: 'aoe', range: 190, multiplier: 5.6, lastUsed: 0 },
                { id: "merch_dash", name: "Lướt Bóng Tiếp", icon: "🏃", desc: "Lướt tới mục tiêu và đánh thương mạnh.", mp: 12, cd: 4700, type: 'target', range: 220, multiplier: 4.0, lastUsed: 0 },
                { id: "merch_midas", name: "Bàn Tay Midas", icon: "💎", desc: "Kỹ năng tối thượng gây vàng và sát thương phép cho kẻ địch.", mp: 32, cd: 13200, type: 'ultimate', lastUsed: 0 }
            ]},
            engineer: { name: "Anh Kỹ Sư", emoji: "👨‍💻", hp: 120, mp: 80, atk: 13, def: 6, speed: 8.5, skills: [
                { id: "eng_turret", name: "Ụ Súng Công Nghệ", icon: "🛠️", desc: "Triệu hồi súng laze bắn mục tiêu trong tầm.", mp: 20, cd: 4000, type: 'target', range: 220, multiplier: 3.4, lastUsed: 0 },
                { id: "eng_overclock", name: "Ép Xung Phần Cứng", icon: "⚡", desc: "Hồi HP/MP và tăng tốc độ đánh trong vài giây.", mp: 30, cd: 9000, type: 'self', lastUsed: 0 },
                { id: "eng_missile", name: "Tên Lửa Lăn Quân", icon: "🚀", desc: "Bắn tên lửa vào vị trí đã chọn gây nổ diện rộng.", mp: 25, cd: 8500, type: 'point', range: 240, multiplier: 4.6, lastUsed: 0 },
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

        const MAP_MONSTER_CONFIGS = {
            'world': {
                monsters: [
                    { name: "Chuột Cống", emoji: "🐀", hp: 50, maxHp: 50, atk: 5, exp: 20, gold: 8 },
                    { name: "Gà Con Tinh Nghịch", emoji: "🐔", hp: 35, maxHp: 35, atk: 4, exp: 10, gold: 3 },
                    { name: "Sói Hoang", emoji: "🐕", hp: 120, maxHp: 120, atk: 12, exp: 45, gold: 15 }
                ],
                bosses: [
                    { name: "CHẰN TINH VƯƠNG (SIÊU BOSS)", emoji: "👹", hp: 1200, maxHp: 1200, atk: 55, exp: 1000, gold: 500, isBoss: true }
                ]
            },
            'sewer': {
                monsters: [
                    { name: "Chuột Độc", emoji: "🐀", hp: 90, maxHp: 90, atk: 8, exp: 35, gold: 15 },
                    { name: "Dơi Nhỏ", emoji: "🦟", hp: 80, maxHp: 80, atk: 7, exp: 30, gold: 12 }
                ],
                bosses: [
                    { name: "Chuột Đột Biến", emoji: "👹", hp: 800, maxHp: 800, atk: 25, exp: 300, gold: 150, isBoss: true }
                ]
            },
            'bat_cave': {
                monsters: [
                    { name: "Dơi Máu", emoji: "🦟", hp: 200, maxHp: 200, atk: 14, exp: 60, gold: 20 },
                    { name: "Dơi Độc", emoji: "🦟", hp: 220, maxHp: 220, atk: 16, exp: 70, gold: 24 },
                    { name: "Dơi Già", emoji: "🦟", hp: 300, maxHp: 300, atk: 20, exp: 90, gold: 30 }
                ],
                bosses: [
                    { name: "Mẫu Thể Ký Sinh", emoji: "👹", hp: 1500, maxHp: 1500, atk: 35, exp: 500, gold: 250, isBoss: true }
                ]
            },
            'mine': {
                monsters: [
                    { name: "Người Đá", emoji: "🐗", hp: 350, maxHp: 350, atk: 22, exp: 110, gold: 35 },
                    { name: "Giáo Đồ Bóng Đêm", emoji: "🐕", hp: 400, maxHp: 400, atk: 25, exp: 130, gold: 40 }
                ],
                bosses: [
                    { name: "Tà Linh Hầm Mỏ", emoji: "👹", hp: 2000, maxHp: 2000, atk: 45, exp: 600, gold: 300, isBoss: true }
                ]
            },
            'cultist_camp': {
                monsters: [
                    { name: "Giáo Đồ", emoji: "🐕", hp: 450, maxHp: 450, atk: 28, exp: 150, gold: 45 },
                    { name: "Pháp Sư Tập Sự", emoji: "🐕", hp: 420, maxHp: 420, atk: 30, exp: 160, gold: 50 },
                    { name: "Cung Thủ Bóng Đêm", emoji: "🐕", hp: 380, maxHp: 380, atk: 26, exp: 140, gold: 42 }
                ],
                bosses: [
                    { name: "Đội Trưởng Giáo Đồ", emoji: "👹", hp: 2500, maxHp: 2500, atk: 50, exp: 800, gold: 400, isBoss: true }
                ]
            },
            'nest_cave': {
                monsters: [
                    { name: "Chuột Độc", emoji: "🐀", hp: 180, maxHp: 180, atk: 18, exp: 80, gold: 25 },
                    { name: "Chuột Khổng Lồ", emoji: "🐀", hp: 350, maxHp: 350, atk: 26, exp: 130, gold: 40 },
                    { name: "Ký Sinh Trùng", emoji: "🐀", hp: 150, maxHp: 150, atk: 15, exp: 60, gold: 20 }
                ],
                bosses: [
                    { name: "Chuột Chúa - Thần Trùng Cổ Đại", emoji: "👹", hp: 15000, maxHp: 15000, atk: 80, exp: 3000, gold: 1000, isBoss: true }
                ]
            },
            'bamboo_forest': {
                monsters: [
                    { name: "Tinh Linh Rừng Xanh", emoji: "🧚", hp: 220, maxHp: 220, atk: 22, exp: 90, gold: 40 },
                    { name: "Sói Xám Đói Ăn", emoji: "🐺", hp: 280, maxHp: 280, atk: 26, exp: 110, gold: 50 }
                ],
                bosses: [
                    { name: "SÓI VƯƠNG THÔN VĨ (BOSS)", emoji: "🐺", hp: 2000, maxHp: 2000, atk: 40, exp: 800, gold: 400, isBoss: true }
                ]
            },
            'beach': {
                monsters: [
                    { name: "Cua Đá Cương Lực", emoji: "🦀", hp: 350, maxHp: 350, atk: 30, exp: 140, gold: 65 },
                    { name: "Cướp Biển Vùng Bờ Ao", emoji: "🥷", hp: 420, maxHp: 420, atk: 35, exp: 170, gold: 80 }
                ],
                bosses: [
                    { name: "ĐẠI TẶC BIỂN ĐÔNG (BOSS)", emoji: "🥷", hp: 3000, maxHp: 3000, atk: 55, exp: 1200, gold: 600, isBoss: true }
                ]
            },
            'citadel': {
                monsters: [
                    { name: "Yêu Quái Dạ Xoa", emoji: "👺", hp: 650, maxHp: 650, atk: 55, exp: 300, gold: 140 },
                    { name: "Chiến Binh Đất Nung", emoji: "🧱", hp: 700, maxHp: 700, atk: 60, exp: 350, gold: 160 }
                ],
                bosses: [
                    { name: "DẠ XOA TƯỚNG QUÂN (BOSS)", emoji: "👺", hp: 5000, maxHp: 5000, atk: 80, exp: 2200, gold: 1200, isBoss: true }
                ]
            },
            'demon_cave': {
                monsters: [
                    { name: "Quỷ Lửa", emoji: "👹", hp: 400, maxHp: 400, atk: 30, exp: 180, gold: 70 }
                ],
                bosses: [
                    { name: "Quỷ Vương Khổng Lồ (Cyclops Lord)", emoji: "🐗", hp: 2500, maxHp: 2500, atk: 45, exp: 1200, gold: 2500, isBoss: true }
                ]
            },
            'cemetery': {
                monsters: [
                    { name: "Thây Ma Sống", emoji: "🧟", hp: 500, maxHp: 500, atk: 35, exp: 220, gold: 90 }
                ],
                bosses: [
                    { name: "Chúa Tể Thây Ma (Zombie Lord)", emoji: "🐕", hp: 3500, maxHp: 3500, atk: 45, exp: 1200, gold: 2500, isBoss: true }
                ]
            },
            'ghost_forest': {
                monsters: [
                    { name: "Ma Trơi Bóng Tối", emoji: "👻", hp: 450, maxHp: 450, atk: 32, exp: 200, gold: 80 }
                ],
                bosses: [
                    { name: "Ác Quỷ Bóng Đêm", emoji: "👹", hp: 3000, maxHp: 3000, atk: 45, exp: 1200, gold: 2500, isBoss: true }
                ]
            },
            'ancient_temple': {
                monsters: [
                    { name: "Hộ Vệ Đá Cổ", emoji: "🗿", hp: 600, maxHp: 600, atk: 40, exp: 260, gold: 110 }
                ],
                bosses: [
                    { name: "Hộ Vệ Đền Cổ", emoji: "🐗", hp: 4000, maxHp: 4000, atk: 45, exp: 1200, gold: 2500, isBoss: true }
                ]
            },
            'dungeon': {
                monsters: [
                    { name: "Quỷ Lửa Nhỏ", emoji: "👹", hp: 350, maxHp: 350, atk: 28, exp: 160, gold: 60 }
                ],
                bosses: [
                    { name: "Ma Vương Rực Lửa (Barlog King)", emoji: "👹", hp: 5000, maxHp: 5000, atk: 45, exp: 1200, gold: 2500, isBoss: true }
                ]
            }
        };

        const QUEST_DATA = [
            { id: "q_kill_rats", title: "Diệt Chuột Cống Đột Biến", desc: "Tiêu diệt 3 con chuột cống tại bờ mương phía Bắc làng.", type: "kill", target: "🐀", req: 3, progress: 0, rewardGold: 80, rewardExp: 100, done: false },
            { id: "q_craft_sword", title: "Rèn Kiếm Kim Cương", desc: "Thu thập đủ nguyên liệu chế tạo Kiếm Kim Cương từ Thợ Rèn.", type: "craft", target: "🗡️", req: 1, progress: 0, rewardGold: 200, rewardExp: 250, done: false }
        ];

        const ITEMS = {
            potion_hp: { id: "potion_hp", name: "Bình Thuốc Tiên HP", emoji: "🧪", type: "usable", desc: "Hồi phục ngay lập tức 50 Máu (HP)", value: 50, price: 20 },
            potion_mp: { id: "potion_mp", name: "Bình Nước Suối MP", emoji: "💧", type: "usable", desc: "Hồi phục ngay lập tức 30 Linh Lực (MP)", value: 30, price: 15 },
            iron_ore:  { id: "iron_ore", name: "Quặng Sắt Thô", emoji: "🪨", type: "material", desc: "Quặng đá sắt dùng làm phôi chế tạo vũ khí trang bị", price: 10 },
            magic_crystal: { id: "magic_crystal", name: "Pha Lê Ma Thuật", emoji: "🔮", type: "material", desc: "Tinh thể ma pháp quý hiếm rớt ra từ quái vật", price: 30 },
            food_com_nam: { id: "food_com_nam", name: "Cơm Nắm Xá Xíu", emoji: "🍙", type: "usable_food", desc: "Hồi 10 HP & 5 MP mỗi 3 giây. Kéo dài 30 giây.", regenHp: 10, regenMp: 5, duration: 30000, price: 50 },
            food_sua: { id: "food_sua", name: "Sữa Bò Tươi Xóm Giữa", emoji: "🥛", type: "usable_food", desc: "Hồi 15 HP & 10 MP mỗi 3 giây. Kéo dài 30 giây.", regenHp: 15, regenMp: 10, duration: 30000, price: 80 },
            food_mi_ramen: { id: "food_mi_ramen", name: "Mì Ramen Nóng Hổi", emoji: "🍜", type: "usable_food", desc: "Hồi 25 HP & 15 MP mỗi 3 giây. Kéo dài 30 giây.", regenHp: 25, regenMp: 15, duration: 30000, price: 100 },
            food_ca_nuong: { id: "food_ca_nuong", name: "Cá Lóc Nướng Trui", emoji: "🐟", type: "usable_food", desc: "Hồi 50 HP & 30 MP mỗi 3 giây. Kéo dài 30 giây.", regenHp: 50, regenMp: 30, duration: 30000, price: 200 },
            food_nuoc_tang_luc: { id: "food_nuoc_tang_luc", name: "Nước Tăng Lực Rồng Đỏ", emoji: "🥤", type: "usable_food", desc: "Hồi 100 HP & 60 MP mỗi 3 giây. Kéo dài 30 giây.", regenHp: 100, regenMp: 60, duration: 30000, price: 400 },
            stone_enhance: { id: "stone_enhance", name: "Đá Cường Hóa", emoji: "💎", type: "material", desc: "Dùng để cường hóa trang bị tại Bác Thợ Rèn", price: 300 },
            card_summon: { id: "card_summon", name: "Thẻ Triệu Hồi Boss", emoji: "🃏", type: "usable", desc: "Triệu hồi Boss Thần Trùng lập tức tại Bản Đồ Thế Giới!", price: 1000 },
            
            // Quest Items
            rat_tail: { id: "rat_tail", name: "Đuôi Chuột", emoji: "🐀", type: "material", desc: "Đuôi của chuột cống trong kho lúa", price: 5 },
            rat_meat: { id: "rat_meat", name: "Thịt Chuột", emoji: "🥩", type: "material", desc: "Thịt chuột cống dùng làm nguyên liệu nấu nướng", price: 8 },
            copper_ore: { id: "copper_ore", name: "Quặng Đồng Thô", emoji: "🪨", type: "material", desc: "Quặng đồng thô khai thác tại Mỏ đá phía Tây", price: 10 },
            food_bread: { id: "food_bread", name: "Bánh Mì Cô Ba", emoji: "🍞", type: "usable", desc: "Bánh mì thơm ngon hồi 30 HP", value: 30, price: 15 },
            ac_lucky_amulet: { id: "ac_lucky_amulet", name: "Mặt Dây Chuyền May Mắn", emoji: "📿", type: "accessory", atk: 2, def: 1, hp: 20, price: 100 },
            ar_wolf_leather: { id: "ar_wolf_leather", name: "Áo Da Sói", emoji: "👕", type: "armor", atk: 1, def: 5, hp: 40, price: 120 },
            eq_speed_boots: { id: "eq_speed_boots", name: "Giày Tăng Tốc", emoji: "🥾", type: "accessory", atk: 0, def: 2, hp: 10, speed: 1.0, price: 80 },
            lost_cat: { id: "lost_cat", name: "Mèo Lạc", emoji: "🐱", type: "material", desc: "Chú mèo lạc của Bé Na", price: 0 },
            stone_engraving: { id: "stone_engraving", name: "Mảnh Đá Khắc", emoji: "🪨", type: "material", desc: "Mảnh đá khắc chữ cổ trong Hang Dơi", price: 20 },
            stone_disease: { id: "stone_disease", name: "Tinh Thể Nhiễm Bệnh", emoji: "🔮", type: "material", desc: "Tinh thể nhiễm độc gieo rắc tà thuật", price: 50 },

            // Weapons
            wp_wooden: { id: "wp_wooden", name: "Gậy Gỗ Đầu Thôn", emoji: "🪵", type: "weapon", atk: 4, def: 0, hp: 0, price: 30 },
            wp_copper: { id: "wp_copper", name: "Kiếm Đồng", emoji: "🗡️", type: "weapon", atk: 8, def: 0, hp: 0, price: 60 },
            wp_copper_refined: { id: "wp_copper_refined", name: "Kiếm Đồng Tinh Luyện", emoji: "⚔️", type: "weapon", atk: 12, def: 1, hp: 15, price: 150 },
            wp_steel:  { id: "wp_steel", name: "Đao Thép Sáng Chóa", emoji: "⚔️", type: "weapon", atk: 15, def: 0, hp: 0, price: 150 },
            wp_diamond:{ id: "wp_diamond", name: "Kiếm Kim Cương Thượng Hạng", emoji: "🗡️", type: "weapon", atk: 40, def: 5, hp: 50, price: 500 },

            // Armors
            ar_cloth:  { id: "ar_cloth", name: "Áo Vải Rách Vai", emoji: "👕", type: "armor", atk: 0, def: 2, hp: 15, price: 25 },
            ar_iron:   { id: "ar_iron", name: "Giáp Sắt Cự Thần", emoji: "🛡️", type: "armor", atk: 0, def: 14, hp: 80, price: 200 },
            
            // Accessories
            ac_ring:   { id: "ac_ring", name: "Nhẫn Ngọc Cẩm Thạch", emoji: "📿", type: "accessory", atk: 5, def: 3, hp: 30, price: 120 },
            
            // Dungeon Keys
            key_demon_cave: { id: "key_demon_cave", name: "Chìa Khóa Hang Quỷ", emoji: "🔑", type: "material", desc: "Dùng để mở độ khó cao của Hang Quỷ", price: 150 },
            key_cemetery: { id: "key_cemetery", name: "Chìa Khóa Nghĩa Địa", emoji: "🔑", type: "material", desc: "Dùng để mở độ khó cao của Nghĩa Địa", price: 150 },
            key_ghost_forest: { id: "key_ghost_forest", name: "Chìa Khóa Rừng Ma", emoji: "🔑", type: "material", desc: "Dùng để mở độ khó cao của Rừng Ma", price: 150 },
            key_ancient_temple: { id: "key_ancient_temple", name: "Chìa Khóa Đền Cổ", emoji: "🔑", type: "material", desc: "Dùng để mở độ khó cao của Đền Cổ", price: 150 },
            key_dungeon: { id: "key_dungeon", name: "Chìa Khóa Hầm Ngục", emoji: "🔑", type: "material", desc: "Dùng để mở độ khó cao của Hầm Ngục Tối", price: 150 },
            
            // Epic Items
            wp_hellfire: { id: "wp_hellfire", name: "Kiếm Ma Địa Ngục", emoji: "🔥", type: "weapon", atk: 60, def: 10, hp: 100, price: 1000 },
            ar_guardian: { id: "ar_guardian", name: "Giáp Hộ Vệ Hoàng Gia", emoji: "🛡️", type: "armor", atk: 5, def: 25, hp: 200, price: 1200 },
            ac_phoenix: { id: "ac_phoenix", name: "Dây Chuyền Phượng Hoàng", emoji: "💍", type: "accessory", atk: 15, def: 5, hp: 80, price: 800 },
            
            // Legendary Items
            wp_barlog: { id: "wp_barlog", name: "Rìu Chiến Ma Vương Barlog", emoji: "🪓", type: "weapon", atk: 100, def: 20, hp: 250, price: 3000 },
            ar_god: { id: "ar_god", name: "Giáp Thần Long Vạn Năng", emoji: "🐉", type: "armor", atk: 20, def: 50, hp: 500, price: 4000 },
            ac_god_eye: { id: "ac_god_eye", name: "Mắt Thần Vạn Biến", emoji: "👁️", type: "accessory", atk: 35, def: 15, hp: 150, price: 2500 }
        };

        const CRAFT_RECIPES = [
            { resultId: "wp_steel", ingredients: { iron_ore: 3 }, cost: 40 },
            { resultId: "ar_iron", ingredients: { iron_ore: 5, magic_crystal: 1 }, cost: 80 },
            { resultId: "wp_diamond", ingredients: { iron_ore: 8, magic_crystal: 4 }, cost: 250 }
        ];

        const NPC_DATA = {
            elder: { name: "Trưởng Làng Lâm", emoji: "🧙‍♂️", role: "Cốt Truyện & Đại Nhiệm Vụ", x: 2000, y: 2000, radius: 45 },
            blacksmith: { name: "Thợ Rèn Hùng", emoji: "👨‍🏭", role: "Lò Rèn Chế Tạo Trang Bị", x: 1750, y: 1950, radius: 45 },
            merchant: { name: "Cô Ba Tạp Hóa", emoji: "👩‍🌾", role: "Giao Thương Mua Bán Vật Phẩm", x: 2250, y: 2050, radius: 45 },
            vinhsHouse: { name: "Nhà Vinh Đèn Lồng", emoji: "🏮", role: "Chủ Đèn Lồng", x: 1460, y: 1500, radius: 40 },
            tankShop: { name: "Chú Tăng Bán Xe", emoji: "🚜", role: "Xe Tăng Xóm Giữa", x: 1620, y: 1380, radius: 40 },
            flowerHouse: { name: "Nhà Hoa Cúc", emoji: "🌼", role: "Vườn Hoa Sắc Màu", x: 2000, y: 1620, radius: 38 },
            poorHouse: { name: "Nhà Nghèo", emoji: "🏚️", role: "Gia Đình Khiêm Nhường", x: 2180, y: 1770, radius: 38 },
            fruitVendor: { name: "Quầy Hoa Quả", emoji: "🍉", role: "Bán Hoa Quả & Rau", x: 2360, y: 1810, radius: 38 },
            fishSeller: { name: "Bà Bán Cá", emoji: "🐟", role: "Đặc Sản Cá Đồng", x: 2520, y: 1960, radius: 38 },
            barber: { name: "Tiệm Cắt Tóc", emoji: "💈", role: "Mốt Tóc Xóm", x: 2640, y: 1820, radius: 38 },
            dirtyPond: { name: "Ao Cạn Bẩn", emoji: "🪱", role: "Ao Tháng Ngâu", x: 2640, y: 1520, radius: 45 },
            richMaze: { name: "Mê Cung Siêu Giàu", emoji: "🏰", role: "Biệt Thự Vườn Lớn", x: 2440, y: 1340, radius: 50 },
            
            // New Quest NPCs
            ba_nam: { name: "Bà Năm", emoji: "👵", role: "Người Lớn Tuổi Trong Làng", x: 1900, y: 1800, radius: 45 },
            be_na: { name: "Bé Na", emoji: "👧", role: "Cô Bé Đầu Làng", x: 1550, y: 1550, radius: 45 },
            hunter_nam: { name: "Thợ Săn Nam", emoji: "🏹", role: "Thợ Săn Rừng Tân Thủ", x: 1200, y: 1600, radius: 45 },
            prof_minh: { name: "Giáo Sư Minh", emoji: "👴", role: "Giáo Sư Khảo Cổ Học", x: 1300, y: 2400, radius: 45 },
            wife_blacksmith: { name: "Vợ Thợ Rèn", emoji: "👩", role: "Người Vợ Lo Lắng", x: 1720, y: 1920, radius: 45 }
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

        window.autoLoot = true;
        window.autoUseHp = false;
        window.autoUseMp = false;
        window.autoUseFood = false;
        window.autoSkillsSelected = [null, null, null];

        let activeSkillSelection = null;
        let skillCursor = null;
        let clickMarker = null;
        let skillActionPopups = [];

        window.currentMapId = 'world';
        window.lastPortalVisited = null;

        window.player = {
            currentQuestIdx: 0,
            questAccepted: false,
            questProgress: 0,
            questDone: false,
            dailyQuest: null,
            guildQuest: null,
            coupleQuest: null,
            hasMount: false,
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
            baseSpeed: 6.0,
            gold: 150,
            x: 1000, y: 1000, // Coordinates in World Map Space centered at 1000,1000
            targetMonster: null,
            inventory: [
                { id: "skin_cong_chua", count: 1 },
                { id: "potion_hp", count: 5 },
                { id: "potion_mp", count: 5 },
                { id: "iron_ore", count: 4 },
                { id: "food_com_nam", count: 5 },
                { id: "food_mi_ramen", count: 5 },
                { id: "food_ca_nuong", count: 2 },
                { id: "food_sua", count: 2 }
            ],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null,
                skin: null
            },
            skills: [],
            assignedSkills: [null, null, null],
            activeBuffs: { hp: null, mp: null },
            quests: JSON.parse(JSON.stringify(QUEST_DATA)), // Deep clone quest dictionary
            attackEffect: { active: false, sx: 0, sy: 0, targetX: 0, targetY: 0, startAt: 0 }
        };

        let camera = { x: 0, y: 0 };
        let monsters = [];
        let groundItems = [];
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
                    snap.docChanges().forEach(change => {
                        if(change.type === 'removed') {
                            const id = change.doc.id;
                            delete networkPlayers[id];
                            if(typeof partySystem !== 'undefined') partySystem.updateMemberPresence({ id: id, offline: true });
                            rebuildPvpLobbyUI();
                        } else {
                            const msg = change.doc.data();
                            if(msg.id && msg.id !== myNetworkId) {
                                handleNetworkMessage(msg);
                            }
                        }
                    });
                });

                // 2. Transient Events (PVP, Invites, Board) - 5-min lookback to avoid clock drift
                let startEventTime = new Date(Date.now() - 5 * 60 * 1000);
                let isInitialEvent = true;
                db.collection('network_events')
                  .where('timestamp', '>', startEventTime)
                  .orderBy('timestamp')
                  .onSnapshot(snap => {
                      snap.docChanges().forEach(change => {
                          if(change.type === 'added') {
                              const msg = change.doc.data();
                              if(isInitialEvent) return; // Skip existing history messages
                              if(msg.id && msg.id !== myNetworkId) {
                                  handleNetworkMessage(msg);
                              }
                          }
                      });
                      isInitialEvent = false;
                  });

                // 3. Global Chat - 5-min lookback to avoid clock drift
                let startChatTime = new Date(Date.now() - 5 * 60 * 1000);
                let isInitialChat = true;
                db.collection('chat_messages')
                  .where('timestamp', '>', startChatTime)
                  .orderBy('timestamp')
                  .onSnapshot(snap => {
                      snap.docChanges().forEach(change => {
                          if(change.type === 'added') {
                              const msg = change.doc.data();
                              if(isInitialChat) return; // Skip existing history messages
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
                      isInitialChat = false;
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
            // Canvas nhận click trực tiếp - Drag-to-move / Touch-to-move liên tục
            let isDragging = false;

            const updateDestinationFromEvent = (e) => {
                let rect = canvas.getBoundingClientRect();
                let clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
                let clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null);
                if (clientX === null || clientY === null) return;
                let clickX = clientX - rect.left;
                let clickY = clientY - rect.top;
                let worldClickX = clickX + camera.x;
                let worldClickY = clickY + camera.y;
                
                player.destinationX = worldClickX;
                player.destinationY = worldClickY;
                player.targetMonster = null; // Bỏ tự động tấn công khi kéo
                clickMarker = { x: worldClickX, y: worldClickY, createdAt: Date.now() };
            };

            canvas.addEventListener('mousedown', (e) => {
                isDragging = true;
                handleWorldClick(e);
            });

            canvas.addEventListener('mousemove', (e) => {
                handleSkillCursor(e);
                if (isDragging && !activeSkillSelection) {
                    updateDestinationFromEvent(e);
                }
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });

            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                isDragging = true;
                handleWorldClick(e.touches[0]);
            }, {passive:false});

            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (isDragging && !activeSkillSelection) {
                    updateDestinationFromEvent(e.touches[0]);
                }
            }, {passive:false});

            canvas.addEventListener('touchend', (e) => {
                isDragging = false;
            });
            
            canvas.addEventListener('touchcancel', (e) => {
                isDragging = false;
            });

            canvas.addEventListener('mouseout', () => {
                skillCursor = null;
                isDragging = false;
            });

            // Lắng nghe bàn phím di chuyển (WASD / Phím mũi tên) và phím tắt menu
            window.addEventListener('keydown', (e) => {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                let key = e.key.toLowerCase();
                window.pressedKeys[key] = true;
                handleKeyDown(e);
                // ESC Key support to close NPC Dialog & open Game Panels
                if (e.key === 'Escape' || e.key === 'Esc') {
                    window.closeNpcDialogue();
                    document.querySelectorAll('.game-panel').forEach(p => p.style.display = 'none');
                }
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
            
            window.addEventListener('beforeunload', () => {
                saveGameToLocal();
                if(typeof db !== 'undefined' && myNetworkId) {
                    db.collection('active_players').doc(myNetworkId).delete().catch(()=>{});
                }
            });
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
            player.assignedSkills = [t.skills[0].id, t.skills[1].id, t.skills[2].id];
            player.activeBuffs = { hp: null, mp: null };

            // Run lore/story overview intro sequence
            showLoreOverlay();
        }

        function showLoreOverlay() {
            switchScreen('gameScreen');
            document.getElementById('loreOverlay').style.display = "flex";
            let txt = `Chào mừng tân binh ${player.name} gia nhập Xóm Anh Hùng! Vào năm 2026, sau một cơn địa chấn kinh hoàng, vùng đất thanh bình bỗng chốc bị bao trùm bởi bóng tối. Lũ chuột cống, dơi đêm và sói hoang biến dị điên cuồng phá hại kho lương. Trưởng Làng Lâm cùng các bô lão đang kêu gọi anh hùng hào kiệt đứng lên dẹp loạn. Sứ mệnh của cậu là đi từ những nhiệm vụ nhỏ nhặt trong làng, tiến vào Cống Ngầm Cũ và Hang Dơi U Ám, giải cứu Thợ Rèn Hùng, đập tan doanh trại Giáo Đồ Bóng Đêm và chuẩn bị đối mặt với Siêu Boss Thần Trùng Cổ Đại tại Hang Tổ. Hãy rèn luyện và bảo vệ xóm làng khỏi họa diệt vong!`;
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

        window.switchScreen = function(sId) { window.currentScreen = sId;
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
        function autosaveGameProcess(silent = false) {
            if(currentScreen !== 'gameScreen') return;
            saveGameToLocal();
            
            // Nếu có cloud save, thử auto-sync nhẹ
            if(window._cloudSaveEnabled && window.player && window.currentFirebaseUser && window.saveGameToCloud) {
                window.saveGameToCloud(window.player);
            }
            
            if (!silent) {
                let ind = document.getElementById('saveIndicator');
                if (ind) {
                    ind.style.display = "block";
                    setTimeout(() => ind.style.display = "none", 2500);
                }
            }
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
                
                quests: player.quests,
                currentQuestIdx: player.currentQuestIdx,
                questAccepted: player.questAccepted,
                questProgress: player.questProgress,
                questDone: player.questDone,
                dailyQuest: player.dailyQuest,
                guildQuest: player.guildQuest,
                coupleQuest: player.coupleQuest,
                hasMount: player.hasMount,
                autoUseHp: window.autoUseHp,
                autoUseMp: window.autoUseMp,
                autoUseFood: window.autoUseFood,
                autoLoot: window.autoLoot,
                autoSkillsSelected: window.autoSkillsSelected,
                assignedSkills: player.assignedSkills,
                activeBuffs: player.activeBuffs
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
                player.inventory = data.inventory || [];
                player.equipment = data.equipment || { weapon: null, armor: null, accessory: null, skin: null };
                
                player.quests = data.quests;
                player.currentQuestIdx = data.currentQuestIdx !== undefined ? data.currentQuestIdx : 0;
                player.questAccepted = data.questAccepted !== undefined ? !!data.questAccepted : false;
                player.questProgress = data.questProgress !== undefined ? data.questProgress : 0;
                player.questDone = data.questDone !== undefined ? !!data.questDone : false;
                player.dailyQuest = data.dailyQuest !== undefined ? data.dailyQuest : null;
                player.guildQuest = data.guildQuest !== undefined ? data.guildQuest : null;
                player.coupleQuest = data.coupleQuest !== undefined ? data.coupleQuest : null;
                player.hasMount = data.hasMount !== undefined ? !!data.hasMount : false;

                window.autoUseHp = !!data.autoUseHp;
                window.autoUseMp = !!data.autoUseMp;
                window.autoUseFood = !!data.autoUseFood;
                window.autoLoot = data.autoLoot !== undefined ? !!data.autoLoot : true;
                window.autoSkillsSelected = data.autoSkillsSelected || [null, null, null];
                player.assignedSkills = data.assignedSkills || [null, null, null];
                player.activeBuffs = data.activeBuffs || { hp: null, mp: null };

                // Sync UI Checkboxes
                let hpCheck = document.getElementById('chkAutoHp');
                if(hpCheck) hpCheck.checked = window.autoUseHp;
                let mpCheck = document.getElementById('chkAutoMp');
                if(mpCheck) mpCheck.checked = window.autoUseMp;
                let foodCheck = document.getElementById('chkAutoFood');
                if(foodCheck) foodCheck.checked = window.autoUseFood;
                let lootCheck = document.getElementById('chkAutoLoot');
                if(lootCheck) lootCheck.checked = window.autoLoot;

                if(!player.equipment.skin) player.equipment.skin = null;
                if(!player.inventory.find(i => i.id === 'skin_cong_chua')) {
                    player.inventory.push({ id: 'skin_cong_chua', count: 1 });
                }

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
                leaderId: partySystem.leaderId,
                mapId: window.currentMapId,
                pvpSeed: window.pvpArena ? window.pvpArena.seed : null,
                pvpTheme: window.pvpArena ? window.pvpArena.theme : null
            });
        }

        window.getMapSize = function(mapId) {
            if (mapId === 'world') return 4000;
            if (mapId === 'beach') return 1400;
            if (mapId === 'pvp_arena') return 1000;
            return 1200;
        };

        window.isInsideMapBoundary = function(mapId, x, y) {
            let size = window.getMapSize(mapId);
            let cx = size / 2;
            let cy = size / 2;
            if (x < 40 || x > size - 40 || y < 40 || y > size - 40) return false;
            if (mapId === 'world') {
                let dist = Math.hypot(x - cx, y - cy);
                return dist < (cx - 60);
            }
            if (mapId === 'beach') {
                let rx = cx - 60;
                let ry = cy - 60;
                let norm = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
                return norm < 1.0;
            }
            if (mapId === 'bamboo_forest' || mapId === 'ghost_forest') {
                let dist = Math.hypot(x - cx, y - cy);
                return dist < (cx - 80);
            }
            if (mapId === 'demon_cave' || mapId === 'bat_cave' || mapId === 'dungeon') {
                let dist = Math.hypot(x - cx, y - cy);
                if (dist < 250) return true;
                if (Math.hypot(x - cx, y - (cy - 300)) < 200) return true;
                if (Math.hypot(x - cx, y - (cy + 300)) < 200) return true;
                if (Math.hypot(x - (cx - 300), y - cy) < 200) return true;
                if (Math.hypot(x - (cx + 300), y - cy) < 200) return true;
                if (Math.abs(x - cx) < 80 && Math.abs(y - cy) < 400) return true;
                if (Math.abs(y - cy) < 80 && Math.abs(x - cx) < 400) return true;
                return false;
            }
            if (mapId === 'cemetery' || mapId === 'ancient_temple' || mapId === 'citadel') {
                let dx = Math.abs(x - cx);
                let dy = Math.abs(y - cy);
                return (dx + dy) < (size - 120);
            }
            return true;
        };

        window.constrainToMapBoundary = function(mapId, x, y) {
            let size = window.getMapSize(mapId);
            let cx = size / 2;
            let cy = size / 2;
            if (mapId === 'pvp_arena') {
                return {
                    x: Math.max(40, Math.min(960, x)),
                    y: Math.max(40, Math.min(960, y))
                };
            }
            x = Math.max(40, Math.min(size - 40, x));
            y = Math.max(40, Math.min(size - 40, y));
            if (mapId === 'world') {
                let R = cx - 60;
                let dx = x - cx;
                let dy = y - cy;
                let dist = Math.hypot(dx, dy);
                if (dist > R) {
                    return { x: cx + (dx / dist) * R, y: cy + (dy / dist) * R };
                }
            } else if (mapId === 'beach') {
                let rx = cx - 60;
                let ry = cy - 60;
                let dx = x - cx;
                let dy = y - cy;
                let norm = Math.pow(dx / rx, 2) + Math.pow(dy / ry, 2);
                if (norm > 1.0) {
                    let angle = Math.atan2(dy, dx);
                    return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
                }
            } else if (mapId === 'bamboo_forest' || mapId === 'ghost_forest') {
                let R = cx - 80;
                let dx = x - cx;
                let dy = y - cy;
                let dist = Math.hypot(dx, dy);
                if (dist > R) {
                    return { x: cx + (dx / dist) * R, y: cy + (dy / dist) * R };
                }
            } else if (mapId === 'demon_cave' || mapId === 'bat_cave' || mapId === 'dungeon') {
                if (window.isInsideMapBoundary(mapId, x, y)) {
                    return { x, y };
                }
                let dx = cx - x;
                let dy = cy - y;
                let dist = Math.hypot(dx, dy);
                let steps = Math.ceil(dist / 10);
                for (let i = 1; i <= steps; i++) {
                    let tx = x + (dx / dist) * (i * 10);
                    let ty = y + (dy / dist) * (i * 10);
                    if (window.isInsideMapBoundary(mapId, tx, ty)) {
                        return { x: tx, y: ty };
                    }
                }
                return { x: cx, y: cy };
            } else if (mapId === 'cemetery' || mapId === 'ancient_temple' || mapId === 'citadel') {
                let R = size - 120;
                let dx = x - cx;
                let dy = y - cy;
                let absX = Math.abs(dx);
                let absY = Math.abs(dy);
                if (absX + absY > R) {
                    let sum = absX + absY;
                    let ratio = R / sum;
                    return { x: cx + dx * ratio, y: cy + dy * ratio };
                }
            }
            return { x, y };
        };

        window.startPvpArena = function(msg) {
            if (window.currentMapId === 'pvp_arena') return;
            window.pvpArenaSeed = msg.seed;
            window.pvpArenaTheme = msg.theme;
            window.pvpArena = {
                active: true,
                state: 'countdown',
                countdownStart: Date.now(),
                challengerId: msg.challengerId,
                targetId: msg.targetId,
                seed: msg.seed,
                theme: msg.theme,
                spectating: (msg.challengerId !== window.myNetworkId && msg.targetId !== window.myNetworkId),
                obstacles: [],
                buffs: [],
                projectiles: []
            };
            if (!window.prePvpMapState) {
                window.prePvpMapState = {
                    mapId: window.currentMapId,
                    x: player.x,
                    y: player.y
                };
            }
            if (msg.challengerId === window.myNetworkId) {
                player.x = 200;
                player.y = 500;
            } else if (msg.targetId === window.myNetworkId) {
                player.x = 800;
                player.y = 500;
            } else {
                player.x = 500;
                player.y = 200;
                window.pvpArena.spectateFollowId = msg.challengerId;
                if (!document.getElementById('exitSpectateBtn')) {
                    const exitBtn = document.createElement('button');
                    exitBtn.id = 'exitSpectateBtn';
                    exitBtn.innerText = '❌ Thoát Xem Đấu';
                    exitBtn.style.position = 'fixed';
                    exitBtn.style.top = '70px';
                    exitBtn.style.right = '12px';
                    exitBtn.style.zIndex = '999999';
                    exitBtn.style.background = 'rgba(239, 68, 68, 0.9)';
                    exitBtn.style.color = '#fff';
                    exitBtn.style.border = '2px solid #fff';
                    exitBtn.style.borderRadius = '8px';
                    exitBtn.style.padding = '8px 12px';
                    exitBtn.style.fontWeight = 'bold';
                    exitBtn.style.cursor = 'pointer';
                    exitBtn.onclick = () => {
                        window.exitSpectateMode();
                    };
                    document.body.appendChild(exitBtn);
                }
            }
            window.currentMapId = 'pvp_arena';
            player.destinationX = undefined;
            player.destinationY = undefined;
            player.targetMonster = null;
            player.targetPvpPlayerId = null;
            if (window.generateMapDecorations) {
                window.generateMapDecorations('pvp_arena');
            }
            if (!window.pvpArena.spectating) {
                player.hp = getEffectiveMaxHp();
                player.mp = getEffectiveMaxMp();
                refreshHudDisplay();
            }
            audio.playBgm('apocalypse');
            showToast('⚔️ Trận đấu Đấu Trường PvP sắp bắt đầu!');
        };

        function handleNetworkMessage(msg) {
            if (typeof window.ygoRegisterNetworkMessage === 'function') {
                window.ygoRegisterNetworkMessage(msg);
            }
            if(!msg || msg.id === myNetworkId) return;

            if(msg.type === 'PRESENCE') {
                // Chúng ta không dùng Date.now() - msg.timestamp vì nếu đồng hồ thiết bị của user sai giờ, nó sẽ tự xoá hết người chơi khác!
                // Thay vào đó chỉ dựa vào lastSeen cục bộ.
                networkPlayers[msg.id] = { ...msg, lastSeen: Date.now() };
                partySystem.updateMemberPresence(msg);
                rebuildPvpLobbyUI();
                rebuildPartyPanel();
            }
            else if(msg.type === 'PARTY_INVITE' && msg.targetId === myNetworkId) {
                audio.play('quest');
                if(partySystem.partyId) {
                    pvpChannel.postMessage({ type: 'PARTY_INVITE_REPLY', id: myNetworkId, targetId: msg.id, accepted: false, name: player.name, reason: 'already_in_party' });
                    showToast('⚠️ Bạn đã có tổ đội, không thể nhận lời mời khác.');
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
                    showToast(`👥 ${msg.name} đã gia nhập tổ đội của bạn!`);
                    rebuildPartyPanel();
                } else {
                    let reason = msg.reason === 'already_in_party' ? ' v? h? ?? c? t? ??i.' : '.';
                    showToast(`❌ ${msg.name} từ chối lời mời vào tổ đội${reason}`);
                }
            }
            else if(msg.type === 'PARTY_DISBAND' && msg.partyId === partySystem.partyId) {
                partySystem.partyId = null; partySystem.leaderId = null; partySystem.members = {};
                showToast(`❌ Trưởng đội ${msg.name || ''} đã giải tán tổ đội.`);
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
                if (window.boardApplyNetworkState) window.boardApplyNetworkState(msg);
                showToast('🎮 Đã vào phòng PvP Cờ Đua.');
            }
            else if(msg.type === 'BOARD_PVP_STATE') {
                if (window.boardApplyNetworkState) window.boardApplyNetworkState(msg);
            }
            else if(msg.type === 'BOARD_ROLL_REQUEST' && window.boardGame && window.boardGame.pvp && window.boardGame.hostId === myNetworkId && msg.hostId === myNetworkId) {
                let cur = window.boardGame.players[window.boardGame.currentTurn];
                if(cur && cur.networkId === msg.id && !window.boardGame.isRolling && !window.boardGame.gameOver) {
                    if (window.boardRollForCurrentPlayer) window.boardRollForCurrentPlayer();
                }
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
            else if(msg.type === 'BOARD_PVP_INVITE' && msg.targetId === myNetworkId) {
                if(window.showBoardInvite) window.showBoardInvite(msg);
            }
            else if(msg.type === 'BOARD_PVP_REPLY' && msg.targetId === myNetworkId) {
                if(msg.accepted) {
                    showToast(`✅ ${msg.replierName} đã CHẤP NHẬN vào Cờ Đua!`);
                    if(window.boardStartPvpAsHost) {
                        window.boardStartPvpAsHost(msg.id, msg.replierName);
                    }
                } else {
                    showToast(`❌ ${msg.replierName} đã TỪ CHỐI lời mời Cờ Đua.`);
                }
            }
            else if(msg.type === 'CHALLENGE_REPLY' && msg.targetId === myNetworkId) {
                if(msg.accepted) {
                    showToast(`⚔️ ${msg.replierName} CHẤP NHẬN thách đấu! Đang dịch chuyển vào Đấu Trường...`);
                    let seed = Math.floor(Math.random() * 1000000);
                    let themes = ['bamboo', 'ruins', 'snow', 'desert', 'citadel', 'rocky'];
                    let theme = themes[Math.floor(Math.random() * themes.length)];
                    pvpChannel.postMessage({
                        type: 'PVP_ARENA_START',
                        id: myNetworkId,
                        challengerId: myNetworkId,
                        targetId: msg.id,
                        seed: seed,
                        theme: theme
                    });
                } else {
                    showToast(`🏳️ ${msg.replierName} đã từ chối vì khiếp sợ!`);
                }
            }
            else if(msg.type === 'PVP_ARENA_START') {
                if (window.currentMapId === 'pvp_arena') return;
                window.pvpArenaSeed = msg.seed;
                window.pvpArenaTheme = msg.theme;
                window.pvpArena = {
                    active: true,
                    state: 'countdown',
                    countdownStart: Date.now(),
                    challengerId: msg.challengerId,
                    targetId: msg.targetId,
                    seed: msg.seed,
                    theme: msg.theme,
                    spectating: (msg.challengerId !== myNetworkId && msg.targetId !== myNetworkId),
                    obstacles: [],
                    buffs: [],
                    projectiles: []
                };
                if (!window.prePvpMapState) {
                    window.prePvpMapState = {
                        mapId: window.currentMapId,
                        x: player.x,
                        y: player.y
                    };
                }
                if (msg.challengerId === myNetworkId) {
                    player.x = 200;
                    player.y = 500;
                } else if (msg.targetId === myNetworkId) {
                    player.x = 800;
                    player.y = 500;
                } else {
                    player.x = 500;
                    player.y = 200;
                    window.pvpArena.spectateFollowId = msg.challengerId;
                    if (!document.getElementById('exitSpectateBtn')) {
                        const exitBtn = document.createElement('button');
                        exitBtn.id = 'exitSpectateBtn';
                        exitBtn.innerText = '❌ Thoát Xem Đấu';
                        exitBtn.style.position = 'fixed';
                        exitBtn.style.top = '70px';
                        exitBtn.style.right = '12px';
                        exitBtn.style.zIndex = '999999';
                        exitBtn.style.background = 'rgba(239, 68, 68, 0.9)';
                        exitBtn.style.color = '#fff';
                        exitBtn.style.border = '2px solid #fff';
                        exitBtn.style.borderRadius = '8px';
                        exitBtn.style.padding = '8px 12px';
                        exitBtn.style.fontWeight = 'bold';
                        exitBtn.style.cursor = 'pointer';
                        exitBtn.onclick = () => {
                            window.exitSpectateMode();
                        };
                        document.body.appendChild(exitBtn);
                    }
                }
                window.currentMapId = 'pvp_arena';
                player.destinationX = undefined;
                player.destinationY = undefined;
                player.targetMonster = null;
                player.targetPvpPlayerId = null;
                if (window.generateMapDecorations) {
                    window.generateMapDecorations('pvp_arena');
                }
                if (!window.pvpArena.spectating) {
                    player.hp = getEffectiveMaxHp();
                    player.mp = getEffectiveMaxMp();
                    refreshHudDisplay();
                }
                audio.playBgm('apocalypse');
                showToast('⚔️ Trận đấu Đấu Trường PvP sắp bắt đầu!');
            }
            else if(msg.type === 'PVP_PLAYER_MOVE') {
                let opp = networkPlayers[msg.id];
                if (opp) {
                    opp.x = msg.x;
                    opp.y = msg.y;
                    opp.hp = msg.hp;
                    opp.maxHp = msg.maxHp;
                    opp.mapId = 'pvp_arena';
                }
            }
            else if(msg.type === 'PVP_PROJECTILE_SPAWN') {
                if (window.currentMapId === 'pvp_arena') {
                    window.spawnPvpProjectileLocally(msg.id, msg.ownerId, msg.targetId, msg.skillId, msg.damage, msg.isCrit);
                    let attacker = networkPlayers[msg.ownerId];
                    if (attacker) {
                        attacker.lastAttackTime = Date.now();
                    }
                }
            }
            else if(msg.type === 'PVP_HP_UPDATE') {
                let opp = networkPlayers[msg.id];
                if (opp) {
                    let oldHp = opp.hp || opp.maxHp;
                    opp.hp = msg.hp;
                    opp.maxHp = msg.maxHp;
                    if (msg.hp < oldHp) {
                        opp.playerHitFlashUntil = Date.now() + 250;
                        let diff = oldHp - msg.hp;
                        createParticle("💥", opp.x, opp.y);
                        createFloatingText(`-${diff}`, opp.x, opp.y, '#f97316');
                    }
                }
            }
            else if(msg.type === 'PVP_BUFF_SPAWN') {
                if (window.currentMapId === 'pvp_arena') {
                    window.spawnPvpBuffLocally(msg.buffId, msg.buffType, msg.x, msg.y);
                }
            }
            else if(msg.type === 'PVP_BUFF_PICKUP') {
                if (window.pvpArena && window.pvpArena.buffs) {
                    window.pvpArena.buffs = window.pvpArena.buffs.filter(b => b.id !== msg.buffId);
                    let pickerName = (msg.pickerId === myNetworkId) ? player.name : (networkPlayers[msg.pickerId]?.name || "Đối thủ");
                    let typeName = "Bùa Lợi";
                    if (msg.buffType === 'hp') typeName = "Hồi HP ❤️";
                    else if (msg.buffType === 'mp') typeName = "Hồi MP 💙";
                    else if (msg.buffType === 'speed') typeName = "Tăng Tốc Chạy ⚡";
                    else if (msg.buffType === 'damage') typeName = "Tăng Sát Thương 🔥";
                    showToast(`🎁 ${pickerName} đã nhặt bùa: ${typeName}`);
                }
            }
            else if(msg.type === 'PVP_MATCH_OVER') {
                window.endPvpArenaMatch(msg.winnerId);
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
                if(now - networkPlayers[id].lastSeen > 12000) { // Đợi 12s không có tín hiệu thì mới xoá (tránh mạng lag)
                    delete networkPlayers[id];
                    if(typeof partySystem !== 'undefined') partySystem.removeMember(id);
                    changed = true;
                    if(typeof db !== 'undefined') db.collection('active_players').doc(id).delete().catch(()=>{});
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
                if(this.partyId && this.leaderId !== myNetworkId) { showToast('⚠️ Chỉ trưởng đội mới được mời thành viên.'); return; }
                if(!this.partyId) this.create();
                let opp = networkPlayers[targetId];
                if(!opp) return;
                if(opp.partyId && opp.partyId !== this.partyId) { showToast('⚠️ Người chơi này đang ở tổ đội khác.'); return; }
                pvpChannel.postMessage({
                    type: 'PARTY_INVITE', id: myNetworkId, targetId,
                    partyId: this.partyId, senderName: player.name
                });
                showToast(`📩 Đã gửi lời mời tổ đội tới ${opp.name}`);
            },

            joinParty(partyId, leaderId, leaderName) {
                if(this.partyId && this.partyId !== partyId) { showToast('⚠️ Bạn đã có tổ đội. Hãy rời đội hiện tại trước.'); return false; }
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
                if(this.leaderId !== myNetworkId) { showToast('⚠️ Chỉ trưởng đội mới được giải tán tổ đội.'); return; }
                let oldPartyId = this.partyId;
                pvpChannel.postMessage({ type: 'PARTY_DISBAND', id: myNetworkId, partyId: oldPartyId, name: player.name });
                this.partyId = null; this.leaderId = null; this.members = {};
                showToast('❌ Đã giải tán tổ đội.');
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
                        ${partySystem.leaderId===myNetworkId ? '<button class="btn-sm" style="background:#b91c1c;width:100%;margin-top:8px;" onclick="partySystem.disband()">❌ Giải Tán Đội</button>' : '<button class="btn-sm" style="background:#dc2626;width:100%;margin-top:8px;" onclick="partySystem.leave()">🚪 Rời Đội</button>'}
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
        // All board game code has been moved to board_new.js
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
                showToast(`👥 Đã gia nhập tổ đội của ${msg.senderName}!`);
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
        function updateNpcPositionsForMap(mapId) {
            // Save defaults if not already done
            for (let nKey in NPC_DATA) {
                let npc = NPC_DATA[nKey];
                if (npc.defaultX === undefined) {
                    npc.defaultX = npc.x;
                    npc.defaultY = npc.y;
                }
            }
            
            // Set coordinates based on current map
            for (let nKey in NPC_DATA) {
                let npc = NPC_DATA[nKey];
                
                let targetMap = '';
                if (nKey === 'elder') targetMap = 'communal_house';
                else if (nKey === 'blacksmith') targetMap = 'blacksmith_shop';
                else if (nKey === 'merchant') targetMap = 'village_temple';
                else if (nKey === 'barber') targetMap = 'school';
                
                if (targetMap) {
                    if (mapId === targetMap) {
                        // Inside their building, place them behind the table
                        npc.x = 300;
                        npc.y = 240;
                        npc.ox = 300;
                        npc.oy = 240;
                    } else {
                        // Restore to world defaults
                        npc.x = npc.defaultX;
                        npc.y = npc.defaultY;
                        npc.ox = npc.defaultX;
                        npc.oy = npc.defaultY;
                    }
                }
            }
        }

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
            updateNpcPositionsForMap(window.currentMapId || 'world');
        }

        function spawnSingleMonster(isBoss = false, mapId = window.currentMapId) {
            let template = null;
            let mx = 2000, my = 2000;
            
            const config = MAP_MONSTER_CONFIGS[mapId] || MAP_MONSTER_CONFIGS['world'];
            
            if (isBoss) {
                if (config.bosses && config.bosses.length > 0) {
                    template = config.bosses[Math.floor(Math.random() * config.bosses.length)];
                }
            } else {
                if (config.monsters && config.monsters.length > 0) {
                    template = config.monsters[Math.floor(Math.random() * config.monsters.length)];
                }
            }

            if (!template) return;
            
            template = JSON.parse(JSON.stringify(template));

            // Determine spawn location
            let size = window.getMapSize(mapId);
            let cx = size / 2;
            let cy = size / 2;
            
            let attempts = 0;
            while (attempts < 100) {
                if (mapId === 'world') {
                    if (isBoss) {
                        let angle = Math.random() * Math.PI * 2;
                        let dist = 500 + Math.random() * 300;
                        mx = cx + Math.cos(angle) * dist;
                        my = cy + Math.sin(angle) * dist;
                    } else {
                        let angle = Math.random() * Math.PI * 2;
                        let dist = 150 + Math.random() * 700;
                        mx = cx + Math.cos(angle) * dist;
                        my = cy + Math.sin(angle) * dist;
                    }
                } else if (mapId === 'pvp_arena') {
                    mx = cx + (Math.random() - 0.5) * 600;
                    my = cy + (Math.random() - 0.5) * 600;
                } else {
                    mx = cx + (Math.random() - 0.5) * (size - 160);
                    my = cy + (Math.random() - 0.5) * (size - 160);
                }
                
                if (window.isInsideMapBoundary(mapId, mx, my)) {
                    break;
                }
                attempts++;
            }
            if (attempts >= 100) {
                mx = cx;
                my = cy;
            }

            // Implement Elite monster logic (15% chance for normal monsters)
            let isElite = false;
            if (!isBoss && Math.random() < 0.15) {
                isElite = true;
                template.isElite = true;
                template.name = template.name + " [Tinh Anh]";
                template.hp = (template.hp || template.maxHp) * 2;
                template.maxHp = template.hp;
                template.atk = template.atk * 2;
                template.exp = template.exp * 2;
                template.gold = template.gold * 2;
            }

            // Apply difficulty stat modifiers for non-outer maps (dungeons)
            const outerMaps = ['world', 'bamboo_forest', 'beach', 'bat_cave', 'citadel'];
            if (!outerMaps.includes(mapId)) {
                let diff = window.dungeonDifficulty || 'easy';
                let mult = 1.0;
                if (diff === 'medium') mult = 1.5;
                else if (diff === 'hard') mult = 2.5;
                else if (diff === 'hell') mult = 4.0;
                
                template.hp = Math.round((template.hp || template.maxHp) * mult);
                template.maxHp = template.hp;
                template.atk = Math.round(template.atk * (1 + (mult - 1) * 0.5));
                if (template.goldReward) template.goldReward = Math.round(template.goldReward * mult);
                if (template.xpReward) template.xpReward = Math.round(template.xpReward * mult);
                if (template.gold) template.gold = Math.round(template.gold * mult);
                if (template.exp) template.exp = Math.round(template.exp * mult);
            }

            monsters.push({
                ...template,
                x: Math.max(50, Math.min(size - 50, mx)),
                y: Math.max(50, Math.min(size - 50, my)),
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                lastAttack: 0,
                id: "M_" + Math.random(),
                spawnedMapId: mapId
            });
        }

        function triggerMonsterCombatAttack(m) {
            let now = Date.now();
            let cd = 1800;
            if (m.name === "Chuột Chúa - Thần Trùng Cổ Đại" && m.phase4Triggered) {
                cd = 800;
            }
            if(now - m.lastAttack < cd) return; // Attack cooling down speed
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

            if (window.currentMapId === 'pvp_arena') {
                if (sk.type === 'self') {
                    audio.play('skill');
                    player.mp -= sk.mp;
                    sk.lastUsed = now;
                    let healAmount = sk.id === 'cop_shield' ? 70 : sk.id === 'eng_overclock' ? 120 : 50;
                    player.hp = Math.min(getEffectiveMaxHp(), player.hp + healAmount);
                    if(sk.id === 'eng_overclock') player.mp = Math.min(getEffectiveMaxMp(), player.mp + 100);
                    createFloatingText(`+${healAmount} HP`, player.x, player.y, '#4caf50');
                    createParticle("✨", player.x, player.y);
                    showToast(`✨ Kích hoạt ${sk.name}!`);
                    refreshHudDisplay();
                    rebuildSkillsPanelUI();
                    return;
                } else if (sk.id === 'cop_bastion') {
                    audio.play('skill');
                    player.mp -= sk.mp;
                    sk.lastUsed = now;
                    player.hp = getEffectiveMaxHp();
                    createFloatingText(`+${getEffectiveMaxHp()} HP`, player.x, player.y, '#4caf50');
                    createParticle('🏰', player.x, player.y);
                    showToast("🏰 Thành Lũy Công Lý: Hồi 100% HP!");
                    refreshHudDisplay();
                    rebuildSkillsPanelUI();
                    return;
                } else if (sk.type === 'target' || sk.type === 'point' || sk.type === 'aoe' || sk.type === 'ultimate') {
                    if(!player.targetPvpPlayerId) {
                        showToast("🎯 Hãy chọn mục tiêu đối thủ để xuất chiêu!");
                        return;
                    }
                    let opp = networkPlayers[player.targetPvpPlayerId];
                    if (!opp || opp.mapId !== 'pvp_arena') {
                        return;
                    }
                    let dist = Math.hypot(opp.x - player.x, opp.y - player.y);
                    let rangeLimit = sk.range || 300;
                    if (dist > rangeLimit) {
                        showToast("⚠️ Mục tiêu ngoài phạm vi kỹ năng!");
                        return;
                    }
                    
                    audio.play('skill');
                    player.mp -= sk.mp;
                    sk.lastUsed = now;
                    
                    let skillDmg = Math.round(getEffectiveAtk() * (sk.multiplier || 1.8));
                    let isCrit = Math.random() < 0.25;
                    if (isCrit) skillDmg = Math.round(skillDmg * 1.6);
                    
                    let projId = 'proj_' + myNetworkId + '_' + Date.now() + '_' + Math.floor(Math.random()*1000);
                    window.spawnPvpProjectileLocally(projId, myNetworkId, player.targetPvpPlayerId, sk.id, skillDmg, isCrit);
                    
                    pvpChannel.postMessage({
                        type: 'PVP_PROJECTILE_SPAWN',
                        id: projId,
                        ownerId: myNetworkId,
                        targetId: player.targetPvpPlayerId,
                        skillId: sk.id,
                        damage: skillDmg,
                        isCrit: isCrit
                    });
                    
                    refreshHudDisplay();
                    rebuildSkillsPanelUI();
                    return;
                }
            }

            audio.play('skill');
            player.mp -= sk.mp;
            sk.lastUsed = now;
            createSkillEffect(skillId, player.x, player.y);

            if(sk.type === 'self') {
                let healAmount = sk.id === 'cop_shield' ? 70 : sk.id === 'eng_overclock' ? 120 : 50;
                player.hp = Math.min(getEffectiveMaxHp(), player.hp + healAmount);
                if(sk.id === 'eng_overclock') player.mp = Math.min(getEffectiveMaxMp(), player.mp + 100);
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
                    sk.lastUsed = 0;
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
                sk.lastUsed = 0;
                return;
            }

            if (sk.type === 'ultimate') {
                if (sk.id === 'cop_bastion') {
                    player.hp = getEffectiveMaxHp();
                    showToast("🏰 Thành Lũy Công Lý: Hồi 100% HP & tăng giáp cực đại!");
                } else if (sk.id === 'teach_grace') {
                    let uDmg = Math.round(getEffectiveAtk() * 5.0);
                    let hit = 0;
                    monsters.forEach(m => {
                        let d = Math.hypot(m.x - player.x, m.y - player.y);
                        if (d <= 600) {
                            m.hp = Math.max(0, m.hp - uDmg);
                            createFloatingText(`💥 ${uDmg}`, m.x, m.y, '#f59e0b');
                            createParticle('🌟', m.x, m.y);
                            if(m.hp <= 0) setTimeout(() => handleMonsterDefeated(m), 50);
                            hit++;
                        }
                    });
                    showToast(`🌟 Ánh Sao Tinh Tú quét sạch ${hit} kẻ địch trong tầm!`);
                } else if (sk.id === 'merch_midas') {
                    if (player.targetMonster) {
                        let tm = player.targetMonster;
                        let uDmg = Math.round(getEffectiveAtk() * 6.0);
                        tm.hp = Math.max(0, tm.hp - uDmg);
                        createFloatingText(`💎 ${uDmg}`, tm.x, tm.y, '#e5c158');
                        createParticle('💎', tm.x, tm.y);
                        player.gold += 1000;
                        showToast(`💎 Bàn Tay Midas đập trúng quái! Nhận ngay +1000 vàng!`);
                        if(tm.hp <= 0) handleMonsterDefeated(tm);
                    } else {
                        showToast("🎯 Hãy nhắm mục tiêu quái vật để thi triển Bàn Tay Midas!");
                        player.mp += sk.mp;
                        sk.lastUsed = 0;
                        return;
                    }
                } else if (sk.id === 'eng_core') {
                    let uDmg = Math.round(getEffectiveAtk() * 5.5);
                    let hit = 0;
                    monsters.forEach(m => {
                        let d = Math.hypot(m.x - player.x, m.y - player.y);
                        if (d <= 200) {
                            m.hp = Math.max(0, m.hp - uDmg);
                            createFloatingText(`💥 ${uDmg}`, m.x, m.y, '#ec4899');
                            createParticle('💥', m.x, m.y);
                            if(m.hp <= 0) setTimeout(() => handleMonsterDefeated(m), 50);
                            hit++;
                        }
                    });
                    showToast(`💥 Phóng Năng Lượng ép hạt nhân tiêu diệt ${hit} quái vật xung quanh!`);
                }
                refreshHudDisplay();
                rebuildSkillsPanelUI();
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
            showToast(`${enabled ? '🟢 Bật' : '🔴 Tắt'} tự động dùng kỹ năng`);
        }

        function canUseSkillNow(skill) {
            return skill && Date.now() - skill.lastUsed >= skill.cd && player.mp >= skill.mp;
        }

        let currentAutoSkillIndex = 0;
        function runAutoSkillCombatCycle(monster, now) {
            if(!monster || monster.hp <= 0) return false;
            if(now - lastAutoCombatAction < 1000) return false;

            let selectedIds = window.autoSkillsSelected;
            if(!selectedIds || selectedIds.every(id => !id)) return false;

            for (let i = 0; i < 3; i++) {
                let checkIdx = (currentAutoSkillIndex + i) % 3;
                let sId = selectedIds[checkIdx];
                if (sId) {
                    let skill = player.skills.find(s => s.id === sId);
                    if (skill && canUseSkillNow(skill)) {
                        lastAutoCombatAction = now;
                        if(skill.type === 'self' || skill.type === 'instant') executeActiveSkillUsage(skill.id);
                        else if(skill.type === 'target' || skill.type === 'point') executeSkillAtTarget(skill.id, monster);
                        else if(skill.type === 'aoe') executeSkillAtLocation(skill.id, monster.x, monster.y);
                        
                        currentAutoSkillIndex = (checkIdx + 1) % 3;
                        rebuildQuickSkillBarUI();
                        return true;
                    }
                }
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

            // Xử lý riêng trong Đấu trường PvP
            if (window.currentMapId === 'pvp_arena') {
                if (window.pvpArena && window.pvpArena.state === 'countdown') {
                    showToast('⏳ Chưa bắt đầu trận đấu!');
                    return;
                }
                if (s.type === 'self' || s.type === 'instant') {
                    executeActiveSkillUsage(skillId);
                    rebuildQuickSkillBarUI();
                    return;
                }
                if (player.targetPvpPlayerId) {
                    let opp = networkPlayers[player.targetPvpPlayerId];
                    if (opp) {
                        let rangeLimit = s.range || 200;
                        let dist = Math.hypot(opp.x - player.x, opp.y - player.y);
                        if (dist > rangeLimit) {
                            showToast("⚠️ Mục tiêu ngoài phạm vi.");
                            return;
                        }
                        executeActiveSkillUsage(skillId);
                        rebuildQuickSkillBarUI();
                        return;
                    }
                }
                activeSkillSelection = skillId;
                showToast(`🎯 Nhấp đất hoặc đối thủ để thi triển: ${s.name}`);
                return;
            }

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
            normalBtn.title = 'Đánh thường';
            normalBtn.innerHTML = `
                <span class="skill-icon">⚔️</span>
                <div class="cooldown-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="10"></circle></svg></div>
                <div class="cooldown-text">ATT</div>
            `;
            normalBtn.onpointerdown = (ev) => { stopUiEvent(ev); triggerNormalAttack(); };
            normalBtn.onclick = stopUiEvent;
            normalBtn.onmouseenter = () => showSkillTooltip('Đánh thường', 'Đòn đánh cơ bản không tốn MP. Chọn quái trước rồi bấm để đánh.', 'Không tốn MP');
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
                let statusText = ready ? 'Sẵn sàng' : `Hồi ${cooldown}s`;
                let autoChecked = autoSkillIds.has(s.id);
                btn.title = `${s.name}
${s.desc}`;
                if(!ready) btn.classList.add('cooling');
                if(autoChecked) btn.classList.add('auto-enabled');
                if(activeSkillSelection === s.id) btn.classList.add('active');
                btn.innerHTML = `
                    <span class="skill-icon">${icon}</span>
                    <div class="cooldown-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="10"></circle><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(59,130,246,0.95)" stroke-width="10" stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (251.2 * progress / 100)}" stroke-linecap="round"></circle></svg></div>
                    <div class="cooldown-text">${ready ? '' : cooldown + 's'}</div>
                `;
                btn.onpointerdown = (ev) => { stopUiEvent(ev); prepareSkillCast(s.id); rebuildQuickSkillBarUI(); };
                btn.onclick = stopUiEvent;
                btn.onmouseenter = () => showSkillTooltip(s.name, s.desc || 'Kỹ năng chưa có mô tả.', `MP ${s.mp} - ${statusText}`);
                btn.onmousemove = moveSkillTooltip;
                btn.onmouseleave = hideSkillTooltip;

                let autoBox = document.createElement('input');
                autoBox.type = 'checkbox';
                autoBox.className = 'skill-auto-toggle';
                autoBox.title = 'Tự động spam kỹ năng này';
                autoBox.checked = autoChecked;
                autoBox.onpointerdown = stopUiEvent;
                autoBox.onclick = (ev) => { ev.stopPropagation(); };
                autoBox.onchange = (ev) => { ev.stopPropagation(); toggleAutoSkill(s.id, autoBox.checked); };

                container.appendChild(makeSlot(btn, null, sIdx++));
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
    // Render particles even if line slash is inactive
    updateAndRenderParticles();

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

    if (player.classId === 'cop') {
        // === COP CLASS: ĐƯỜNG KIẾM CHÉM (SWORD SLASH ARC) ===
        let angle = Math.atan2(ty - sy, tx - sx);
        let radius = 25 + progress * 15;
        ctx.save();
        ctx.beginPath();
        // Vẽ vòng cung chém quét quanh mục tiêu
        ctx.arc(tx, ty, radius, angle - Math.PI / 2.5 + progress * Math.PI, angle + Math.PI / 2.5 - progress * Math.PI, true);
        ctx.lineCap = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#38bdf8';
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 4 * (1 - progress) + 1;
        ctx.stroke();
        
        // Lõi chém trắng sắc nét
        ctx.beginPath();
        ctx.arc(tx, ty, radius, angle - Math.PI / 3 + progress * Math.PI * 0.8, angle + Math.PI / 3 - progress * Math.PI * 0.8, true);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.5 * (1 - progress) + 0.5;
        ctx.stroke();
        ctx.restore();
    } 
    else if (player.classId === 'teacher') {
        // === TEACHER CLASS: ĐẠN MA THUẬT BAY (MAGIC PROJECTILE) ===
        let px = sx + (tx - sx) * progress;
        let py = sy + (ty - sy) * progress;
        
        ctx.save();
        // Đường đuôi phép thuật mờ
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(236, 72, 153, ${alpha * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vẽ emoji sao/sách ma thuật
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ec4899";
        ctx.fillText("☄️", px, py);
        ctx.restore();
    } 
    else if (player.classId === 'merchant') {
        // === MERCHANT CLASS: TÊN/VÀNG BAY (ARROW/COIN PROJECTILE) ===
        let px = sx + (tx - sx) * progress;
        let py = sy + (ty - sy) * progress;
        let angle = Math.atan2(ty - sy, tx - sx);
        
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🏹", 0, 0);
        ctx.restore();
    } 
    else if (player.classId === 'engineer') {
        // === ENGINEER CLASS: BÁNH RĂNG/MỎ LẮT XOAY BAY (SPINNING GEAR) ===
        let px = sx + (tx - sx) * progress;
        let py = sy + (ty - sy) * progress;
        let rotAngle = progress * Math.PI * 6; // Xoay 3 vòng
        
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rotAngle);
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚙️", 0, 0);
        ctx.restore();
    } 
    else {
        // === FALLBACK: LUỒNG SÉT MA PHÁP GỐC ===
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        let distance = Math.hypot(tx - sx, ty - sy);
        let segments = Math.floor(distance / 15);
        
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        
        for (let i = 1; i < segments; i++) {
            let t = i / segments;
            let currX = sx + (tx - sx) * t;
            let currY = sy + (ty - sy) * t;
            let jitterStrength = Math.sin(t * Math.PI) * 12 * (1 - progress);
            let offset = (Math.random() - 0.5) * jitterStrength;
            let angle = Math.atan2(ty - sy, tx - sx) + Math.PI / 2;
            currX += Math.cos(angle) * offset;
            currY += Math.sin(angle) * offset;
            ctx.lineTo(currX, currY);
        }
        ctx.lineTo(tx, ty);

        ctx.shadowBlur = 20 * (1 - progress);
        ctx.shadowColor = `rgba(255, 110, 0, ${alpha})`;
        ctx.strokeStyle = `rgba(255, 235, 59, ${alpha})`;
        ctx.lineWidth = 6 * (1 - progress) + 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.lineWidth = 2 * (1 - progress) + 0.5;
        ctx.stroke();

        ctx.restore();
    }

    // === LỚP 3: CẬP NHẬT VÀ VẼ CÁC HẠT NĂNG LƯỢNG BẮN TUNG TÓE ===
    updateAndRenderParticles();
}

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

        function dropItemOnGround(itemId, count, x, y, mapId = window.currentMapId || 'world') {
            let rx = x + (Math.random() - 0.5) * 35;
            let ry = y + (Math.random() - 0.5) * 35;
            groundItems.push({
                id: itemId,
                count: count,
                x: rx,
                y: ry,
                mapId: mapId,
                spawnedAt: Date.now()
            });
        }

        function handleMonsterDefeated(m) {
            audio.play('gold');
            player.gold += m.gold;
            player.exp += m.exp;

            createFloatingText(`+${m.gold} Vàng`, m.x, m.y, '#ffd54f');
            showToast(`⚔️ Tiêu diệt [${m.name}] nhận ${m.exp} EXP và ${m.gold} Vàng!`);

            // Share XP/Gold with party
            partySystem.broadcastXpShare(m.gold, m.exp);

            let spawnedMap = m.spawnedMapId || window.currentMapId || 'world';

            if (m.isBoss) {
                // Boss Drops: Roll 2 to 4 items on the ground
                let dropCount = 2 + Math.floor(Math.random() * 3);
                for (let i = 0; i < dropCount; i++) {
                    let roll = Math.random();
                    if (roll < 0.40) {
                        dropItemOnGround('stone_enhance', 1, m.x, m.y);
                    } else if (roll < 0.65) {
                        let keys = ['key_demon_cave', 'key_cemetery', 'key_ghost_forest', 'key_ancient_temple', 'key_dungeon'];
                        let keyId = keys[Math.floor(Math.random() * keys.length)];
                        dropItemOnGround(keyId, 1, m.x, m.y);
                    } else if (roll < 0.80) {
                        dropItemOnGround('card_summon', 1, m.x, m.y);
                    } else if (roll < 0.92) {
                        let epics = ['wp_hellfire', 'ar_guardian', 'ac_phoenix'];
                        let epicId = epics[Math.floor(Math.random() * epics.length)];
                        dropItemOnGround(epicId, 1, m.x, m.y);
                    } else {
                        let legendaries = ['wp_barlog', 'ar_god', 'ac_god_eye'];
                        let legId = legendaries[Math.floor(Math.random() * legendaries.length)];
                        dropItemOnGround(legId, 1, m.x, m.y);
                    }
                }
                // Always drop 1 high-tier food
                dropItemOnGround('food_nuoc_tang_luc', 1, m.x, m.y);
                showToast(`👑 Boss [${m.name}] đã ngã xuống! Kho báu quý giá đã rơi ra quanh gốc!`, '#f59e0b');
            } else {
                // Minion Drops on the Ground
                let dropRoll = Math.random();
                if (spawnedMap === 'world') {
                    if (dropRoll < 0.45) {
                        let roll = Math.random();
                        if (roll < 0.50) {
                            dropItemOnGround('iron_ore', 1, m.x, m.y);
                        } else if (roll < 0.75) {
                            dropItemOnGround('magic_crystal', 1, m.x, m.y);
                        } else if (roll < 0.90) {
                            let foods = ['food_com_nam', 'food_sua'];
                            dropItemOnGround(foods[Math.floor(Math.random() * foods.length)], 1, m.x, m.y);
                        } else {
                            let keys = ['key_demon_cave', 'key_cemetery', 'key_ghost_forest', 'key_ancient_temple', 'key_dungeon'];
                            let keyId = keys[Math.floor(Math.random() * keys.length)];
                            dropItemOnGround(keyId, 1, m.x, m.y);
                        }
                    }
                } else {
                    // Dungeon minion drops
                    if (dropRoll < 0.55) {
                        let roll = Math.random();
                        if (roll < 0.40) {
                            dropItemOnGround('iron_ore', 1, m.x, m.y);
                        } else if (roll < 0.70) {
                            dropItemOnGround('magic_crystal', 1, m.x, m.y);
                        } else if (roll < 0.85) {
                            let foods = ['food_mi_ramen', 'food_ca_nuong'];
                            dropItemOnGround(foods[Math.floor(Math.random() * foods.length)], 1, m.x, m.y);
                        } else {
                            let keyId = 'key_' + spawnedMap;
                            if (ITEMS[keyId]) dropItemOnGround(keyId, 1, m.x, m.y);
                        }
                    }
                }
            }

            // Update quest objectives instantly
            // Update quest objectives instantly
            player.quests.forEach(q => {
                if(!q.done && q.type === 'kill' && q.target === m.emoji) {
                    q.progress = Math.min(q.req, q.progress + 1);
                    showToast(`📜 Tiến trình: ${q.title} (${q.progress}/${q.req})`);
                }
            });

            // Cập nhật nhiệm vụ cốt truyện chính tuyến
            if (player.currentQuestIdx !== undefined && STORY_QUESTS[player.currentQuestIdx]) {
                let sQuest = STORY_QUESTS[player.currentQuestIdx];
                if (player.questAccepted && sQuest.type === 'kill' && (m.name.includes(sQuest.target) || sQuest.target === m.name)) {
                    player.questProgress = Math.min(sQuest.req, (player.questProgress || 0) + 1);
                    showToast(`📜 NV Cốt Truyện: ${sQuest.title} (${player.questProgress}/${sQuest.req})`);
                    if (player.questProgress >= sQuest.req) {
                        showToast(`💡 Hoàn thành mục tiêu! Hãy về gặp ${NPC_DATA[sQuest.npcFinish || sQuest.target]?.name || sQuest.npcFinish || 'Trưởng Làng'} để trả nhiệm vụ.`);
                    }
                    saveGameToLocal();
                }
            }

            // Cập nhật nhiệm vụ phụ hằng ngày / bang hội / cặp đôi
            [player.dailyQuest, player.guildQuest, player.coupleQuest].forEach(q => {
                if (q && !q.done && q.type === 'kill' && (m.name.includes(q.target) || q.target === m.name)) {
                    q.progress = Math.min(q.req, (q.progress || 0) + 1);
                    showToast(`📜 Tiến trình ${q.title}: (${q.progress}/${q.req})`);
                    saveGameToLocal();
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
            // Respawn replacement based on monster class to retain population scale
            let respawnDelay = 5000 + Math.random() * 5000; // Default normal monster: 5-10s
            if (m.isBoss) {
                respawnDelay = 120000 + Math.random() * 180000; // Boss: 2-5 minutes
            } else if (m.isElite) {
                respawnDelay = 20000 + Math.random() * 10000; // Elite: 20-30s
            }
            setTimeout(() => { spawnSingleMonster(m.isBoss, m.spawnedMapId || 'world'); }, respawnDelay);
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
    player.destinationX = worldClickX;
    player.destinationY = worldClickY;

    // Check if clicked near a ground item
    for(let gi of groundItems) {
        if (gi.mapId && gi.mapId !== (window.currentMapId || 'world')) continue;
        let dx = worldClickX - gi.x;
        let dy = worldClickY - gi.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist <= 35) {
            player.destinationX = gi.x;
            player.destinationY = gi.y;
            player.targetMonster = null;
            let itemDef = ITEMS[gi.id];
            showToast(`💎 Đang di chuyển đến nhặt: ${itemDef?.name || gi.id}`);
            return;
        }
    }

    // Khi đang chọn skill, ưu tiên thi triển chiêu thức trước
    if(activeSkillSelection) {
        let skill = player.skills.find(s => s.id === activeSkillSelection);
        if(skill) {
            if (window.currentMapId === 'pvp_arena') {
                let clickedOpp = null;
                for(let id in networkPlayers) {
                    let p = networkPlayers[id];
                    if (p.mapId === 'pvp_arena' && Math.hypot(worldClickX - p.x, worldClickY - p.y) <= 40) {
                        clickedOpp = p;
                        break;
                    }
                }
                if (clickedOpp) {
                    player.targetPvpPlayerId = clickedOpp.id;
                    executeActiveSkillUsage(skill.id);
                } else {
                    if (typeof executeSkillAtLocationPvp === 'function') {
                        executeSkillAtLocationPvp(skill.id, worldClickX, worldClickY);
                    }
                }
            } else {
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

    // Click trúng đối thủ PvP trong Đấu Trường
    if (window.currentMapId === 'pvp_arena') {
        for(let id in networkPlayers) {
            let p = networkPlayers[id];
            if(p.mapId !== window.currentMapId) continue;
            let dx = worldClickX - p.x;
            let dy = worldClickY - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist <= 40) {
                if (typeof canObserverSeePlayer === 'function' && !canObserverSeePlayer(player, p)) continue;
                
                player.targetPvpPlayerId = id;
                player.targetMonster = null;
                player.destinationX = p.x;
                player.destinationY = p.y;
                showToast(`🎯 Đã nhắm mục tiêu PvP: [${p.name}]`);
                
                let tInd = document.getElementById('targetIndicator');
                if(tInd) {
                    tInd.style.display = 'block';
                    tInd.style.borderColor = 'rgba(239,68,68,0.6)';
                    tInd.style.background = 'rgba(239,68,68,0.12)';
                    document.getElementById('targetName').textContent = `⚔️ ${p.name}`;
                    document.getElementById('targetHpBar').style.display = 'block';
                    document.getElementById('targetHpText').textContent = `HP: ${p.hp}/${p.maxHp || 100}`;
                    let hpPercent = (p.hp / (p.maxHp || 100)) * 100;
                    let innerBar = document.getElementById('targetHpBarInner');
                    if (innerBar) innerBar.style.width = `${hpPercent}%`;
                }
                refreshHudDisplay();
                return;
            }
        }
        player.targetPvpPlayerId = null;
    }

    // Click trúng Quái vật thì nhắm mục tiêu (khóa mục tiêu) hoặc bắt đầu tấn công
    for(let m of monsters) {
        let dx = worldClickX - m.x;
        let dy = worldClickY - m.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist <= 40) {
            if (player.lockedTarget === m || player.targetMonster === m) {
                // Click lần 2: Tấn công
                player.targetMonster = m;
                player.destinationX = m.x;
                player.destinationY = m.y;
                showToast(`⚔️ Bắt đầu tấn công: [${m.name}]`);
            } else {
                // Click lần 1: Khóa mục tiêu
                player.lockedTarget = m;
                player.targetMonster = null; // Chưa lao vào đánh
                showToast(`🎯 Khóa mục tiêu: [${m.name}]. Nhấp lần nữa để tấn công!`);
            }
            refreshHudDisplay();
            return;
        }
    }

    // Click đất trống sẽ cập nhật đích di chuyển và xóa mục tiêu khóa
    player.targetMonster = null;
    player.lockedTarget = null;
    player.targetPvpPlayerId = null;
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
            
            // Gây sát thương diện rộng thực tế cho quái vật xung quanh tọa độ x,y
            let radius = 130;
            let baseAtk = getEffectiveAtk();
            let mult = skill.multiplier || 1.8;
            let skillDmg = Math.round(baseAtk * mult);
            let hitCount = 0;

            monsters.forEach(m => {
                let dist = Math.hypot(m.x - x, m.y - y);
                if (dist <= radius) {
                    m.hp = Math.max(0, m.hp - skillDmg);
                    createFloatingText(`💥 ${skillDmg}`, m.x, m.y, '#e040fb');
                    createParticle('⚡', m.x, m.y);
                    if(m.hp <= 0) {
                        setTimeout(() => handleMonsterDefeated(m), 50);
                    }
                    hitCount++;
                }
            });

            if (hitCount > 0) {
                showToast(`💥 ${skill.name} sát thương diện rộng trúng ${hitCount} quái vật!`);
            } else {
                showToast(`⚡ ${skill.name} đã được thi triển!`);
            }
            refreshHudDisplay();
        }
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
            if(!npc || !layer) return;
            
            document.getElementById('dialogNpcAvatar').textContent = npc.emoji;
            document.getElementById('dialogNpcName').textContent = npc.name;
            document.getElementById('dialogNpcRole').textContent = npc.role;
            
            let txtBox = document.getElementById('dialogNpcText');
            let optBox = document.getElementById('dialogNpcOptions');
            optBox.innerHTML = "";

            // Khởi tạo các trường cốt truyện nếu chưa có
            if (player.currentQuestIdx === undefined) player.currentQuestIdx = 0;
            if (player.questAccepted === undefined) player.questAccepted = false;
            if (player.questProgress === undefined) player.questProgress = 0;
            if (player.questDone === undefined) player.questDone = false;

            let hasQuestOption = false;

            // Kiểm tra nhiệm vụ cốt truyện hiện tại
            if (player.currentQuestIdx < STORY_QUESTS.length) {
                let sQuest = STORY_QUESTS[player.currentQuestIdx];
                
                // Nếu NPC này liên quan đến nhiệm vụ cốt truyện hiện tại và chưa nhận
                if (!player.questAccepted && (sQuest.npcAccept === npcKey || sQuest.target === npcKey || (sQuest.type === 'talk' && sQuest.target === npcKey))) {
                    if (player.level >= sQuest.reqLevel) {
                        txtBox.textContent = sQuest.dialogStart;
                        let btn = document.createElement('button');
                        btn.className = "opt-btn";
                        btn.innerHTML = `📜 <b>Nhận NV Cốt Truyện:</b> ${sQuest.title}`;
                        btn.onclick = () => {
                            player.questAccepted = true;
                            player.questProgress = 0;
                            player.questDone = false;
                            showToast(`📜 Nhận nhiệm vụ cốt truyện: ${sQuest.title}`);
                            
                            // Spawn quest-related items
                            if (sQuest.id === 'story_5') {
                                for (let i = 0; i < 5; i++) {
                                    dropItemOnGround('copper_ore', 1, 800, 1200);
                                }
                                showToast(`✨ 5 Quặng Đồng Thô đã xuất hiện tại Mỏ Đá phía Tây!`);
                            } else if (sQuest.id === 'story_6') {
                                dropItemOnGround('lost_cat', 1, 600, 2500);
                                showToast(`✨ Chú Mèo Đi Lạc đã xuất hiện trong Rừng Tân Thủ!`);
                            } else if (sQuest.id === 'story_10') {
                                for (let i = 0; i < 3; i++) {
                                    let rx = 500 + (Math.random() - 0.5) * 200;
                                    let ry = 500 + (Math.random() - 0.5) * 200;
                                    groundItems.push({
                                        id: 'stone_engraving',
                                        count: 1,
                                        x: rx,
                                        y: ry,
                                        mapId: 'bat_cave',
                                        spawnedAt: Date.now()
                                    });
                                }
                                showToast(`✨ 3 Mảnh Đá Khắc đã xuất hiện trong Hang Dơi!`);
                            } else if (sQuest.id === 'story_19') {
                                for (let i = 0; i < 5; i++) {
                                    let rx = 500 + (Math.random() - 0.5) * 200;
                                    let ry = 500 + (Math.random() - 0.5) * 200;
                                    groundItems.push({
                                        id: 'stone_disease',
                                        count: 1,
                                        x: rx,
                                        y: ry,
                                        mapId: 'nest_cave',
                                        spawnedAt: Date.now()
                                    });
                                }
                                showToast(`✨ 5 Tinh Thể Nhiễm Bệnh đã xuất hiện trong Hang Tổ!`);
                            }
                            
                            saveGameToLocal(); 
                            openNpcDialogueSystem(npcKey);
                        };
                        optBox.appendChild(btn);
                        hasQuestOption = true;
                    } else {
                        txtBox.textContent = `[Cốt Truyện] Con cần đạt cấp độ ${sQuest.reqLevel} để nhận nhiệm vụ tiếp theo: "${sQuest.title}". Tích cực rèn luyện thêm nhé!`;
                    }
                }
                // Đang làm nhiệm vụ cốt truyện và nói chuyện với NPC hoàn thành
                else if (player.questAccepted && (sQuest.npcFinish === npcKey || sQuest.target === npcKey || (sQuest.type === 'talk' && sQuest.target === npcKey))) {
                    let isFinished = false;
                    if (sQuest.type === 'talk') {
                        isFinished = true; 
                    } else if (sQuest.type === 'kill' && player.questProgress >= sQuest.req) {
                        isFinished = true;
                    } else if (sQuest.type === 'collect' && player.questProgress >= sQuest.req) {
                        isFinished = true;
                    }

                    if (isFinished) {
                        txtBox.textContent = sQuest.dialogFinish;
                        let btn = document.createElement('button');
                        btn.className = "opt-btn";
                        btn.innerHTML = `🎁 <b>Trả NV Cốt Truyện:</b> ${sQuest.title} (XONG)`;
                        btn.onclick = () => {
                            if (sQuest.type === 'collect') {
                                let targetId = sQuest.target;
                                let actualItemId = null;
                                if (ITEMS[targetId]) {
                                    actualItemId = targetId;
                                } else {
                                    actualItemId = Object.keys(ITEMS).find(k => ITEMS[k].name === targetId);
                                }
                                if (actualItemId) {
                                    let invItem = player.inventory.find(inv => inv.id === actualItemId);
                                    if (invItem) {
                                        invItem.count -= sQuest.req;
                                    }
                                    player.inventory = player.inventory.filter(inv => inv.count > 0);
                                }
                            }

                            player.gold += sQuest.rewardGold;
                            player.exp += sQuest.rewardExp;
                            
                            if (sQuest.rewardItem && ITEMS[sQuest.rewardItem]) {
                                addItemToInventory(sQuest.rewardItem, 1);
                                showToast(`🎒 Nhận trang bị: ${ITEMS[sQuest.rewardItem].name}`);
                            }

                            if (sQuest.id === 'story_6') {
                                player.hasMount = true;
                                player.baseSpeed += 1.5; 
                                showToast(`🐎 Nhận Thú Cưỡi Ngựa Tân Thủ (Tăng tốc chạy!)`);
                            }
                            
                            showToast(`🎉 Hoàn thành: ${sQuest.title}! +${sQuest.rewardGold} vàng, +${sQuest.rewardExp} EXP`);
                            
                            player.currentQuestIdx++;
                            player.questAccepted = false;
                            player.questProgress = 0;
                            player.questDone = false;
                            
                            saveGameToLocal(); 
                            refreshHudDisplay();
                            openNpcDialogueSystem(npcKey);
                        };
                        optBox.appendChild(btn);
                        hasQuestOption = true;
                    } else {
                        txtBox.textContent = `[ĐANG LÀM] ${sQuest.desc} (Tiến độ: ${player.questProgress || 0}/${sQuest.req || 1})`;
                    }
                }
            }

            // Giao nhiệm vụ Hằng Ngày (elder)
            if (npcKey === 'elder' && !hasQuestOption) {
                if (!player.dailyQuest) {
                    txtBox.textContent = "Chào con! Ta có một số công việc hằng ngày cần giúp đỡ. Con có muốn nhận không?";
                    let btn = document.createElement('button');
                    btn.className = "opt-btn";
                    btn.innerHTML = "📅 Nhận Nhiệm Vụ Hằng Ngày";
                    btn.onclick = () => {
                        player.dailyQuest = generateDailyQuest();
                        showToast(`📅 Nhận nhiệm vụ hằng ngày: ${player.dailyQuest.title}`);
                        saveGameToLocal();
                        openNpcDialogueSystem(npcKey);
                    };
                    optBox.appendChild(btn);
                } else {
                    let dq = player.dailyQuest;
                    if (dq.progress >= dq.req && !dq.done) {
                        txtBox.textContent = "Con làm tốt lắm! Đây là phần thưởng cống hiến hằng ngày của con.";
                        let btn = document.createElement('button');
                        btn.className = "opt-btn";
                        btn.innerHTML = "🎁 Trả Nhiệm Vụ Hằng Ngày (XONG)";
                        btn.onclick = () => {
                            player.gold += dq.rewardGold;
                            player.exp += dq.rewardExp;
                            dq.done = true;
                            showToast(`🎉 Hoàn thành Nhiệm Vụ Hằng Ngày! +${dq.rewardGold} vàng`);
                            player.dailyQuest = null;
                            saveGameToLocal();
                            refreshHudDisplay();
                            openNpcDialogueSystem(npcKey);
                        };
                        optBox.appendChild(btn);
                    } else if (!dq.done) {
                        txtBox.textContent = `Nhiệm vụ hằng ngày: ${dq.desc} (Tiến độ: ${dq.progress}/${dq.req})`;
                    }
                }
            }

            // Giao nhiệm vụ Bang Hội (blacksmith)
            if (npcKey === 'blacksmith' && !hasQuestOption) {
                let craftBtn = document.createElement('button');
                craftBtn.className = "opt-btn";
                craftBtn.textContent = "🏪 Mở Giao Diện Lò Rèn Chế Tạo";
                craftBtn.onclick = () => { closeNpcDialog(); togglePanel('shop'); switchShopTab('craft'); };
                optBox.appendChild(craftBtn);

                if (!player.guildQuest) {
                    let btn = document.createElement('button');
                    btn.className = "opt-btn";
                    btn.innerHTML = "🛡️ Nhận Nhiệm Vụ Bang Hội";
                    btn.onclick = () => {
                        player.guildQuest = generateGuildQuest();
                        showToast(`🛡️ Nhận nhiệm vụ bang hội: ${player.guildQuest.title}`);
                        saveGameToLocal();
                        openNpcDialogueSystem(npcKey);
                    };
                    optBox.appendChild(btn);
                } else {
                    let gq = player.guildQuest;
                    // Kiểm tra nếu là collect thì check trực tiếp số lượng trong hành trang
                    if (gq.type === 'collect' && !gq.done) {
                        let totalCount = 0;
                        player.inventory.forEach(inv => {
                            if (inv.id === gq.target) totalCount += inv.count;
                        });
                        gq.progress = Math.min(gq.req, totalCount);
                    }

                    if (gq.progress >= gq.req && !gq.done) {
                        txtBox.textContent = "Thành viên bang hội thật là tuyệt vời! Cảm ơn con đóng góp nguyên liệu.";
                        let btn = document.createElement('button');
                        btn.className = "opt-btn";
                        btn.innerHTML = "🎁 Trả Nhiệm Vụ Bang Hội (XONG)";
                        btn.onclick = () => {
                            // Trừ nguyên liệu nếu là collect
                            if (gq.type === 'collect') {
                                let invItem = player.inventory.find(inv => inv.id === gq.target);
                                if (invItem) invItem.count -= gq.req;
                                player.inventory = player.inventory.filter(inv => inv.count > 0);
                            }
                            player.gold += gq.rewardGold;
                            player.exp += gq.rewardExp;
                            gq.done = true;
                            showToast(`🎉 Hoàn thành Nhiệm Vụ Bang Hội! +${gq.rewardGold} vàng`);
                            player.guildQuest = null;
                            saveGameToLocal();
                            refreshHudDisplay();
                            openNpcDialogueSystem(npcKey);
                        };
                        optBox.appendChild(btn);
                    } else if (!gq.done) {
                        txtBox.textContent = `Nhiệm vụ bang hội: ${gq.desc} (Tiến độ: ${gq.progress}/${gq.req})`;
                    }
                }
            }

            // Giao nhiệm vụ Cặp Đôi (merchant)
            if (npcKey === 'merchant' && !hasQuestOption) {
                let shopBtn = document.createElement('button');
                shopBtn.className = "opt-btn";
                shopBtn.textContent = "🏪 Mở Cửa Hàng Mua Bán Vật Phẩm";
                shopBtn.onclick = () => { closeNpcDialog(); togglePanel('shop'); switchShopTab('buy'); };
                optBox.appendChild(shopBtn);

                if (!player.coupleQuest) {
                    let btn = document.createElement('button');
                    btn.className = "opt-btn";
                    btn.innerHTML = "💖 Nhận Nhiệm Vụ Cặp Đôi";
                    btn.onclick = () => {
                        player.coupleQuest = generateCoupleQuest();
                        showToast(`💖 Nhận nhiệm vụ cặp đôi: ${player.coupleQuest.title}`);
                        saveGameToLocal();
                        openNpcDialogueSystem(npcKey);
                    };
                    optBox.appendChild(btn);
                } else {
                    let cq = player.coupleQuest;
                    if (cq.type === 'collect' && !cq.done) {
                        let totalCount = 0;
                        player.inventory.forEach(inv => {
                            if (inv.id === cq.target) totalCount += inv.count;
                        });
                        cq.progress = Math.min(cq.req, totalCount);
                    }

                    if (cq.progress >= cq.req && !cq.done) {
                        txtBox.textContent = "Tình yêu đôi lứa thật là đẹp! Cảm ơn con đã chia sẻ.";
                        let btn = document.createElement('button');
                        btn.className = "opt-btn";
                        btn.innerHTML = "🎁 Trả Nhiệm Vụ Cặp Đôi (XONG)";
                        btn.onclick = () => {
                            if (cq.type === 'collect') {
                                let invItem = player.inventory.find(inv => inv.id === cq.target);
                                if (invItem) invItem.count -= cq.req;
                                player.inventory = player.inventory.filter(inv => inv.count > 0);
                            }
                            player.gold += cq.rewardGold;
                            player.exp += cq.rewardExp;
                            cq.done = true;
                            showToast(`🎉 Hoàn thành Nhiệm Vụ Cặp Đôi! +${cq.rewardGold} vàng`);
                            player.coupleQuest = null;
                            saveGameToLocal();
                            refreshHudDisplay();
                            openNpcDialogueSystem(npcKey);
                        };
                        optBox.appendChild(btn);
                    } else if (!cq.done) {
                        txtBox.textContent = `Nhiệm vụ cặp đôi: ${cq.desc} (Tiến độ: ${cq.progress}/${cq.req})`;
                    }
                }
            }

            // Thêm các lựa chọn mặc định nếu không có thoại nhiệm vụ
            if (!hasQuestOption && optBox.innerHTML === "") {
                if (npcKey === 'elder') {
                    txtBox.textContent = "Chào con! Ta là trưởng làng. Chúc con một ngày phiêu lưu nhiều may mắn.";
                } else if (npcKey === 'blacksmith') {
                    txtBox.textContent = "Keng! Keng! Chào người anh em, hôm nay có rèn gì không?";
                } else if (npcKey === 'merchant') {
                    txtBox.textContent = "Hàng mới về, mua gì cứ tự nhiên nhé hiệp khách!";
                } else {
                    txtBox.textContent = npc.role || "Chào ngươi! Ta có thể giúp gì?";
                }
            }

            // Thêm sự kiện bấm click ra ngoài layer để đóng
            if(!layer.dataset.closeBound) {
                layer.dataset.closeBound = 'true';
                layer.addEventListener('click', (e) => {
                    if (e.target === layer) {
                        window.closeNpcDialogue();
                    }
                });
            }

            let exitBtn = document.createElement('button');
            exitBtn.className = "opt-btn";
            exitBtn.textContent = "🚪 Tạm biệt, con đi làm nhiệm vụ tiếp!";
            exitBtn.style.background = "#3f3f5f";
            exitBtn.onclick = () => { layer.style.display = "none"; };
            optBox.appendChild(exitBtn);

            layer.style.display = "flex";
        }

        function closeNpcDialog() {
            let layer = document.getElementById('npcDialogLayer');
            if (layer) layer.style.display = "none";
        }

        function completeQuestReward(qId) {
            let q = player.quests.find(item => item.id === qId);
            if(!q || q.done || q.progress < q.req) return;
            audio.play('quest');
            q.done = true;
            player.gold += q.rewardGold;
            player.exp += q.rewardExp;
            showToast(`🎉 HOÀN THÀNH NV: +${q.rewardGold} Vàng, +${q.rewardExp} EXP!`);
            saveGameToLocal();
            refreshHudDisplay();
        }

        function addItemToInventory(itemId, amount) {

            // Cập nhật nhiệm vụ cốt truyện thu thập vật phẩm
            if (player.currentQuestIdx !== undefined && STORY_QUESTS[player.currentQuestIdx]) {
                let sQuest = STORY_QUESTS[player.currentQuestIdx];
                if (player.questAccepted && sQuest.type === 'collect') {
                    let itemDef = ITEMS[itemId];
                    if (sQuest.target === itemId || (itemDef && itemDef.name === sQuest.target)) {
                        let totalCount = 0;
                        player.inventory.forEach(inv => {
                            if (inv.id === sQuest.target || (ITEMS[inv.id] && ITEMS[inv.id].name === sQuest.target)) {
                                totalCount += inv.count;
                            }
                        });
                        player.questProgress = Math.min(sQuest.req, totalCount + amount);
                        showToast(`📜 NV Cốt Truyện: ${sQuest.title} (${player.questProgress}/${sQuest.req})`);
                    }
                }
            }

            // Cập nhật nhiệm vụ phụ thu thập vật phẩm
            [player.dailyQuest, player.guildQuest, player.coupleQuest].forEach(q => {
                if (q && !q.done && q.type === 'collect') {
                    let itemDef = ITEMS[itemId];
                    if (q.target === itemId || (itemDef && itemDef.name === q.target)) {
                        let totalCount = 0;
                        player.inventory.forEach(inv => {
                            if (inv.id === q.target || (ITEMS[inv.id] && ITEMS[inv.id].name === q.target)) {
                                totalCount += inv.count;
                            }
                        });
                        q.progress = Math.min(q.req, totalCount + amount);
                        showToast(`📜 Tiến trình ${q.title}: (${q.progress}/${q.req})`);
                    }
                }
            });
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
                } else if(itemId === 'card_summon') {
                    if (window.currentMapId !== 'world') {
                        showToast("⚠️ Chỉ có thể triệu hồi Boss ở Bản Đồ Thế Giới!");
                        return;
                    }
                    let boss = spawnBossMonsterAt(player.x + 50, player.y + 50);
                    if (boss) {
                        showToast("😈 BÁO ĐỘNG: Boss Thần Trùng đã được triệu hồi ngay bên cạnh!", "#dc2626");
                    } else {
                        return;
                    }
                }
                invItem.count--;
                if(invItem.count <= 0) player.inventory.splice(idx, 1);
                showToast(`🧪 Đã sử dụng thành công ${itemDef.name}!`);
            } 
            else if(itemDef.type === 'usable_food') {
                let now = Date.now();
                player.activeBuffs.hp = {
                    itemId: itemId,
                    expiresAt: now + itemDef.duration,
                    value: itemDef.regenHp
                };
                player.activeBuffs.mp = {
                    itemId: itemId,
                    expiresAt: now + itemDef.duration,
                    value: itemDef.regenMp
                };
                invItem.count--;
                if(invItem.count <= 0) player.inventory.splice(idx, 1);
                showToast(`😋 Thưởng thức ${itemDef.name}! Kích hoạt buff hồi phục sinh lực.`);
            } 
            else if(['weapon', 'armor', 'accessory', 'skin'].includes(itemDef.type)) {
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
            let atk = player.baseAtk + bon;
            if (window.pvpDamageBuffEndTime && Date.now() < window.pvpDamageBuffEndTime) {
                atk = Math.round(atk * 1.5);
            }
            return atk;
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
            let buyables = ['potion_hp', 'potion_mp', 'food_com_nam', 'food_sua', 'food_mi_ramen', 'food_ca_nuong', 'stone_enhance', 'card_summon', 'wp_wooden', 'ar_cloth', 'ac_ring', 'key_demon_cave', 'key_cemetery', 'key_ghost_forest', 'key_ancient_temple', 'key_dungeon'];
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
            chatChannel.postMessage({ type: 'CHAT_MESSAGE', id: myNetworkId, sender: player.name || 'Bạn', message });
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
                if(type === 'cop_bastion' || type === 'eng_core') {
                    window.playUltimateVFX(x, y, 'haki');
                } else if (type === 'teach_grace' || type === 'merch_midas') {
                    window.playUltimateVFX(x, y, 'magic_circle');
                } else if (type === 'teach_meteor' || type === 'eng_missile') {
                    window.playUltimateVFX(x, y, 'kamehameha');
                } else {
                    // Regular skills get a decent particle burst
                    if(window.spawnParticle) {
                        let numParticles = (type.includes('siren') || type.includes('silence') || type.includes('trap')) ? 25 : 15;
                        for(let i=0; i<numParticles; i++) {
                            window.spawnParticle(x, y, color, Math.random()*7+4, 20, (Math.random()-0.5)*8, (Math.random()-0.5)*8, 'glow');
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

        window.toggleMainMenu = function() {
            let popup = document.getElementById('mainMenuPopup');
            if (!popup) return;
            if (popup.style.display === 'none' || popup.style.display === '') {
                popup.style.display = 'flex';
                // Update checkboxes to match current state
                let fCheck = document.getElementById('chkAutoFight');
                if(fCheck) fCheck.checked = isAutoFarming;
                let lCheck = document.getElementById('chkAutoLoot');
                if(lCheck) lCheck.checked = window.autoLoot;
                let hpCheck = document.getElementById('chkAutoHp');
                if(hpCheck) hpCheck.checked = window.autoUseHp;
                let mpCheck = document.getElementById('chkAutoMp');
                if(mpCheck) mpCheck.checked = window.autoUseMp;
                let foodCheck = document.getElementById('chkAutoFood');
                if(foodCheck) foodCheck.checked = window.autoUseFood;

                window.populateAutoSkillsUI();
            } else {
                popup.style.display = 'none';
            }
        };

        window.toggleAutoFightFromMenu = function(checked) {
            if(isAutoFarming !== checked) {
                toggleAutoFarm();
            }
        };

        window.menuAction = function(action) {
            // Close menu
            let popup = document.getElementById('mainMenuPopup');
            if (popup) popup.style.display = 'none';
            
            if (action === 'logout') {
                if(typeof logoutPlayerSystem === 'function') {
                    logoutPlayerSystem();
                } else {
                    location.reload();
                }
            } else {
            if (action === 'board') {
                if (typeof openBoardGameWithBet === 'function') {
                    openBoardGameWithBet();
                } else {
                    showToast("⚠️ Tính năng Đua Cờ chưa sẵn sàng!");
                }
            } else if (action === 'yugioh') {
                if (typeof openYugiohGame === 'function') {
                    openYugiohGame();
                } else {
                    showToast("⚠️ Trò chơi Bài Ma Thuật đang được khởi tạo!");
                }
            } else {
                togglePanel(action);
            }
            }
        };

        window.populateAutoSkillsUI = function() {
            let s1 = document.getElementById('selAutoSkill1');
            let s2 = document.getElementById('selAutoSkill2');
            let s3 = document.getElementById('selAutoSkill3');
            if(!s1 || !s2 || !s3) return;

            [s1, s2, s3].forEach((selectEl, index) => {
                selectEl.innerHTML = `<option value="">Không dùng</option>`;
                player.skills.forEach(s => {
                    selectEl.innerHTML += `<option value="${s.id}">${s.name}</option>`;
                });
                selectEl.value = window.autoSkillsSelected[index] || "";
            });
        };

        window.updateAutoSkillSelect = function(index, value) {
            window.autoSkillsSelected[index] = value || null;
            saveGameToLocal();
        };

        function spawnBossMonsterAt(x, y) {
            let template = BOSS_POOL[0];
            if (!template) return null;
            let boss = {
                ...JSON.parse(JSON.stringify(template)),
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                lastAttack: 0,
                id: "M_" + Math.random(),
                spawnedMapId: window.currentMapId
            };
            monsters.push(boss);
            return boss;
        }

        let lastFoodTick = 0;
        function tickFoodBuffs() {
            let now = Date.now();
            if (now - lastFoodTick < 3000) return;
            lastFoodTick = now;

            let healedAny = false;
            let hpBuff = player.activeBuffs?.hp;
            let mpBuff = player.activeBuffs?.mp;

            if (hpBuff && now < hpBuff.expiresAt) {
                player.hp = Math.min(getEffectiveMaxHp(), player.hp + hpBuff.value);
                healedAny = true;
                createParticle("💚", player.x, player.y);
            } else if (hpBuff) {
                player.activeBuffs.hp = null;
            }

            if (mpBuff && now < mpBuff.expiresAt) {
                player.mp = Math.min(getEffectiveMaxMp(), player.mp + mpBuff.value);
                healedAny = true;
                createParticle("💙", player.x, player.y);
            } else if (mpBuff) {
                player.activeBuffs.mp = null;
            }

            if (healedAny) {
                refreshHudDisplay();
            }

            updateBuffIconsUI();
        }

        function updateBuffIconsUI() {
            let container = document.getElementById('buffContainer');
            if (!container) return;
            container.innerHTML = "";
            let now = Date.now();

            let hpBuff = player.activeBuffs?.hp;
            if (hpBuff && now < hpBuff.expiresAt) {
                let remaining = Math.ceil((hpBuff.expiresAt - now) / 1000);
                let itemDef = ITEMS[hpBuff.itemId];
                let itemEmoji = itemDef?.emoji || "🍱";
                container.innerHTML += `
                    <div class="buff-icon" style="background:rgba(22,163,74,0.3); border:1.5px solid #16a34a; border-radius:4px; padding:2px 6px; font-size:0.75rem; color:#fff; display:flex; align-items:center; gap:3px;">
                        <span>${itemEmoji}</span> <span>${remaining}s</span>
                    </div>
                `;
            }

            let mpBuff = player.activeBuffs?.mp;
            if (mpBuff && now < mpBuff.expiresAt) {
                let remaining = Math.ceil((mpBuff.expiresAt - now) / 1000);
                let itemDef = ITEMS[mpBuff.itemId];
                let itemEmoji = itemDef?.emoji || "🥛";
                container.innerHTML += `
                    <div class="buff-icon" style="background:rgba(59,130,246,0.3); border:1.5px solid #3b82f6; border-radius:4px; padding:2px 6px; font-size:0.75rem; color:#fff; display:flex; align-items:center; gap:3px;">
                        <span>${itemEmoji}</span> <span>${remaining}s</span>
                    </div>
                `;
            }
        }

        let lastAutoPotionTime = 0;
        function processAutoPotionAndFood() {
            let now = Date.now();
            if (now - lastAutoPotionTime < 1000) return;
            lastAutoPotionTime = now;

            // 1. Auto HP
            if (window.autoUseHp) {
                let maxHp = getEffectiveMaxHp();
                if (player.hp < maxHp * 0.5) {
                    let hpPots = player.inventory.filter(i => i.id === 'potion_hp');
                    if (hpPots.length > 0 && hpPots[0].count > 0) {
                        useOrEquipInventoryItem('potion_hp');
                    }
                }
            }

            // 2. Auto MP
            if (window.autoUseMp) {
                let maxMp = getEffectiveMaxMp();
                if (player.mp < maxMp * 0.3) {
                    let mpPots = player.inventory.filter(i => i.id === 'potion_mp');
                    if (mpPots.length > 0 && mpPots[0].count > 0) {
                        useOrEquipInventoryItem('potion_mp');
                    }
                }
            }

            // 3. Auto Food
            if (window.autoUseFood) {
                let hpBuffActive = player.activeBuffs?.hp && (now < player.activeBuffs.hp.expiresAt);
                let mpBuffActive = player.activeBuffs?.mp && (now < player.activeBuffs.mp.expiresAt);
                if (!hpBuffActive && !mpBuffActive) {
                    // Try to eat best food
                    let foodTypes = ['food_ca_nuong', 'food_mi_ramen', 'food_sua', 'food_com_nam'];
                    for (let fId of foodTypes) {
                        let invItem = player.inventory.find(i => i.id === fId);
                        if (invItem && invItem.count > 0) {
                            useOrEquipInventoryItem(fId);
                            break;
                        }
                    }
                }
            }
        }

        // --- 11. UI HUB LAYER RENDERING MANAGERS ---
        
        window.rebuildAutoPanelUI = function() {
            let chkFight = document.getElementById('chkAutoFightPanel');
            let chkLoot = document.getElementById('chkAutoLootPanel');
            let chkHp = document.getElementById('chkAutoHpPanel');
            let chkMp = document.getElementById('chkAutoMpPanel');
            let chkFood = document.getElementById('chkAutoFoodPanel');
            
            if(chkFight) chkFight.checked = isAutoFarming;
            if(chkLoot) chkLoot.checked = window.autoLoot;
            if(chkHp) chkHp.checked = window.autoUseHp;
            if(chkMp) chkMp.checked = window.autoUseMp;
            if(chkFood) chkFood.checked = window.autoUseFood;

            // Populate skill selectors
            let s1 = document.getElementById('selAutoSkillPanel1');
            let s2 = document.getElementById('selAutoSkillPanel2');
            let s3 = document.getElementById('selAutoSkillPanel3');
            if(s1 && s2 && s3) {
                [s1, s2, s3].forEach((selectEl, index) => {
                    selectEl.innerHTML = '<option value="">-- Trống --</option>';
                    player.skills.forEach(sk => {
                        let opt = document.createElement('option');
                        opt.value = sk.id;
                        opt.textContent = sk.name;
                        selectEl.appendChild(opt);
                    });
                    selectEl.value = window.autoSkillsSelected[index] || "";
                });
            }
        };

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
                if(panelId === 'auto') rebuildAutoPanelUI();
                else if(panelId === 'inventory') rebuildInventoryGridUI();
                if(panelId === 'skills') rebuildSkillsPanelUI();
                if(panelId === 'equipment') rebuildEquipmentUI();
                if(panelId === 'quests') rebuildQuestsUI();
                if(panelId === 'shop') switchShopTab('buy');
                if(panelId === 'pvp') rebuildPvpLobbyUI();
                if(panelId === 'party') { rebuildPartyPanel(); }
                if(panelId === 'chat') {
                    rebuildChatUI();
                    window.unreadChatCount = 0;
                    window.updateChatBadgeUI();
                }
                if(panelId === 'bet') loadFootballFixtures();
            }
        }

        function refreshHudDisplay() {
            let cls = CLASS_DATA[player.classId];
            const hudCanvas = document.getElementById('hudAvatarCanvas');
            if (hudCanvas && window.drawBeautifulRPGChibi) {
                const hctx = hudCanvas.getContext('2d');
                hctx.clearRect(0, 0, 60, 60);
                window.drawBeautifulRPGChibi(hctx, 30, 24, player.classId, false, 0.85, 'right', false, player.equipment.skin);
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
            let expPct = Math.round((player.exp / player.maxExp) * 100);
            document.getElementById('txtExp').textContent = `EXP: ${player.exp}/${player.maxExp} (${expPct}%)`;
            let expSub = document.getElementById('txtExpSubtitle');
            if (expSub) {
                expSub.textContent = `LV ${player.level} (${expPct}%)`;
            }

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
        window.refreshHudDisplay = refreshHudDisplay;

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
                    <label class="skill-action" onclick="event.stopPropagation()" title="Tự động spam kỹ năng này">
                        <input type="checkbox" ${autoSkillIds.has(s.id) ? 'checked' : ''} onchange="toggleAutoSkill('${s.id}', this.checked)"> AUTO
                    </label>
                    <span class="skill-action">${status}</span>
                `;
                box.appendChild(item);
            });
        }

        function rebuildEquipmentUI() {
            let slots = ['weapon', 'armor', 'accessory', 'skin'];
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
            if(!qBox) return;
            qBox.innerHTML = "";

            // 1. Vẽ Nhiệm Vụ Cốt Truyện hiện tại
            if (player.currentQuestIdx !== undefined && STORY_QUESTS[player.currentQuestIdx]) {
                let s = STORY_QUESTS[player.currentQuestIdx];
                let div = document.createElement('div');
                div.className = "shop-item";
                div.style.border = "2px dashed #ffd54f";
                div.style.background = "rgba(253, 224, 71, 0.05)";
                
                let isDone = player.questAccepted && (s.type === 'talk' || player.questProgress >= s.req);
                let statusTxt = "";
                if (!player.questAccepted) {
                    statusTxt = "<b style='color:#fb7185;'>[CHƯA NHẬN] Gặp NPC</b>";
                } else if (isDone) {
                    statusTxt = "<b style='color:#4caf50;'>[XONG] Trả NPC</b>";
                } else {
                    statusTxt = `Tiến độ: <b>${player.questProgress || 0}/${s.req || 1}</b>`;
                }

                div.innerHTML = `
                    <div class="item-meta">
                        <div style="font-size:1.6rem; color:#f59e0b;">👑</div>
                        <div class="item-details">
                            <h4 style="color:#f59e0b;">[Cốt Truyện] ${s.title}</h4>
                            <p>${s.desc}</p>
                            <span style="font-size:0.8rem; color:#ffd54f;">Thưởng: ${s.rewardGold} vàng / +${s.rewardExp} exp ${s.rewardItem ? '(Trang Bị)' : ''}</span>
                        </div>
                    </div>
                    <div style="font-size:0.9rem;">${statusTxt}</div>
                `;
                qBox.appendChild(div);
            }

            // 2. Vẽ các Nhiệm Vụ Phụ (Hằng Ngày, Bang Hội, Cặp Đôi)
            let optionals = [
                { q: player.dailyQuest, icon: "📅", label: "Hằng Ngày" },
                { q: player.guildQuest, icon: "🛡️", label: "Bang Hội" },
                { q: player.coupleQuest, icon: "💖", label: "Cặp Đôi" }
            ];

            optionals.forEach(opt => {
                if (opt.q) {
                    let s = opt.q;
                    let div = document.createElement('div');
                    div.className = "shop-item";
                    div.style.border = "1.5px solid #60a5fa";
                    
                    let isDone = s.progress >= s.req;
                    let statusTxt = isDone ? "<b style='color:#4caf50;'>[XONG] Trả NPC</b>" : `Tiến độ: <b>${s.progress}/${s.req}</b>`;

                    div.innerHTML = `
                        <div class="item-meta">
                            <div style="font-size:1.6rem;">${opt.icon}</div>
                            <div class="item-details">
                                <h4 style="color:#60a5fa;">[${opt.label}] ${s.title}</h4>
                                <p>${s.desc}</p>
                                <span style="font-size:0.8rem; color:#ffd54f;">Thưởng: ${s.rewardGold} vàng / +${s.rewardExp} exp</span>
                            </div>
                        </div>
                        <div style="font-size:0.9rem;">${statusTxt}</div>
                    `;
                    qBox.appendChild(div);
                }
            });

            // 3. Vẽ các nhiệm vụ phụ của làng cũ
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
            let scale = 1.0;
            if (window.currentMapId === 'pvp_arena') scale = 1.3;
            let sx = canvas.width / 2 + (wx - player.x) * scale + (Math.random() - 0.5) * 20;
            let sy = canvas.height / 2 + (wy - player.y) * scale - 20;

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
        let lastGameLoopTime = 0;
        function mainGameLoop(timestamp) {
            if(currentScreen !== 'gameScreen') return;
            
            // Giới hạn FPS ở mức ~30-40 để giảm lag giật
            if (timestamp - lastGameLoopTime < 25) {
                requestAnimationFrame(mainGameLoop);
                return;
            }
            lastGameLoopTime = timestamp;

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
            updateSkillCooldownsTick();
            renderWorldGraphicsLayers();
            renderQuestDirectionGuide();
            
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
            // Prune dead/removed targets
            if (player.targetMonster && !monsters.some(m => m.id === player.targetMonster.id)) {
                player.targetMonster = null;
            }
            if (player.lockedTarget && !monsters.some(m => m.id === player.lockedTarget.id)) {
                player.lockedTarget = null;
            }

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

            // Food Regeneration buffs tick
            tickFoodBuffs();

            // Auto Potions & Foods check
            processAutoPotionAndFood();

            // Auto Loot & Manual pickup proximity check
            for (let i = groundItems.length - 1; i >= 0; i--) {
                let gi = groundItems[i];
                if (gi.mapId && gi.mapId !== (window.currentMapId || 'world')) continue;
                let dx = player.x - gi.x;
                let dy = player.y - gi.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                
                if (window.autoLoot && dist <= 250) {
                    // Magnet pull speed
                    gi.x += (dx / dist) * 6;
                    gi.y += (dy / dist) * 6;
                }
                
                if (dist <= 45) {
                    addItemToInventory(gi.id, gi.count);
                    audio.play('gold');
                    
                    let itemDef = ITEMS[gi.id];
                    let label = itemDef ? `${itemDef.emoji} ${itemDef.name}` : gi.id;
                    createFloatingText(`+${gi.count} ${label}`, player.x, player.y - 10, '#4ade80');
                    showToast(`🎁 Nhặt được: ${label} x${gi.count}`);
                    
                    autosaveGameProcess(true);
                    
                    groundItems.splice(i, 1);
                }
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
            if (window.pvpSpeedBuffEndTime && Date.now() < window.pvpSpeedBuffEndTime) {
                speed *= 1.5; // Tốc độ tăng 50% từ bùa lợi
            }
            
            // Collision check function
            function checkCollision(x, y, radius = 15) {
                if (window.currentMapId !== 'pvp_arena') return false;
                if (!window.pvpArena || !window.pvpArena.obstacles) return false;
                for (let obs of window.pvpArena.obstacles) {
                    if (!obs.isSolid) continue;
                    let dist = Math.hypot(x - obs.x, y - obs.y);
                    if (dist < (radius + obs.radius)) {
                        return true;
                    }
                }
                return false;
            }

            // Slide movement function
            function applyPlayerMovement(vx, vy) {
                if (window.pvpArena && window.pvpArena.active && window.pvpArena.state === 'countdown') {
                    return; // Không di chuyển khi đang đếm ngược
                }
                if (window.currentMapId === 'pvp_arena') {
                    let nextX = player.x + vx;
                    let nextY = player.y + vy;
                    
                    if (!checkCollision(nextX, player.y, 15)) {
                        player.x = nextX;
                    }
                    if (!checkCollision(player.x, nextY, 15)) {
                        player.y = nextY;
                    }
                } else {
                    player.x += vx;
                    player.y += vy;
                }
            }
            
            // Tính toán hướng đi bàn phím (WASD / Phím mũi tên)
            let keyVx = 0;
            let keyVy = 0;
            if (window.pressedKeys) {
                if (window.pressedKeys['w'] || window.pressedKeys['arrowup']) keyVy = -1;
                if (window.pressedKeys['s'] || window.pressedKeys['arrowdown']) keyVy = 1;
                if (window.pressedKeys['a'] || window.pressedKeys['arrowleft']) keyVx = -1;
                if (window.pressedKeys['d'] || window.pressedKeys['arrowright']) keyVx = 1;
            }

            let isCurrentlyMoving = false;

            // Keyboard or Joystick Override
            let vx = keyVx;
            let vy = keyVy;
            if (vx === 0 && vy === 0 && window.joystickActive && window.joystickVector) {
                vx = window.joystickVector.x;
                vy = window.joystickVector.y;
            }

            if (vx !== 0 || vy !== 0) {
                let len = Math.hypot(vx, vy);
                applyPlayerMovement((vx / len) * speed, (vy / len) * speed);
                player.destinationX = undefined;
                player.destinationY = undefined;
                player.targetMonster = null;
                isCurrentlyMoving = true;
            } else {
                let targetX = player.destinationX;
                let targetY = player.destinationY;

                if(player.targetMonster) {
                    targetX = player.targetMonster.x;
                    targetY = player.targetMonster.y;
                }

                if(targetX !== undefined && targetY !== undefined) {
                    let dx = targetX - player.x;
                    let dy = targetY - player.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);

                    let stopThreshold = player.targetMonster ? 45 : 6;
                    if(dist > stopThreshold) {
                        applyPlayerMovement((dx / dist) * speed, (dy / dist) * speed);
                        isCurrentlyMoving = true;
                    } else {
                        player.x = targetX;
                        player.y = targetY;
                        player.destinationX = undefined;
                        player.destinationY = undefined;
                    }
                }
            }
            player.isMoving = isCurrentlyMoving;

            // Walking dust particle effects
            if (player.isMoving && Math.random() < 0.25) {
                if (window.spawnParticle) {
                    window.spawnParticle(
                        player.x + (Math.random() - 0.5) * 10,
                        player.y + 25 + (Math.random() - 0.5) * 5, // feet level
                        'rgba(240, 240, 240, 0.35)', // dust white
                        Math.random() * 4 + 2, // size
                        15, // life
                        (Math.random() - 0.5) * 0.8, // vx
                        -Math.random() * 0.8, // vy
                        'normal'
                    );
                }
            }

            let constrainedPos = window.constrainToMapBoundary(window.currentMapId || 'world', player.x, player.y);
            player.x = constrainedPos.x;
            player.y = constrainedPos.y;

            // Camera smoothly center anchoring system interpolations
            if (window.pvpArena && window.pvpArena.active && window.pvpArena.spectating) {
                let followId = window.pvpArena.spectateFollowId;
                let followPlayer = networkPlayers[followId];
                if (followPlayer) {
                    camera.x = followPlayer.x - canvas.width / 2;
                    camera.y = followPlayer.y - canvas.height / 2;
                } else {
                    camera.x = 500 - canvas.width / 2;
                    camera.y = 500 - canvas.height / 2;
                }
            } else {
                camera.x = player.x - canvas.width / 2;
                camera.y = player.y - canvas.height / 2;
            }

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

            // PvP auto engagement calculations
            if (window.currentMapId === 'pvp_arena') {
                if (typeof updatePvpArenaLogic === 'function') updatePvpArenaLogic();
                
                // Phát sóng vị trí tần số cao (60ms) để di chuyển mượt mà
                let nowBroadcast = Date.now();
                if (!window.lastPvpBroadcastTime) window.lastPvpBroadcastTime = 0;
                if (nowBroadcast - window.lastPvpBroadcastTime > 60) {
                    window.lastPvpBroadcastTime = nowBroadcast;
                    pvpChannel.postMessage({
                        type: 'PVP_PLAYER_MOVE',
                        id: myNetworkId,
                        x: player.x,
                        y: player.y,
                        hp: player.hp,
                        maxHp: getEffectiveMaxHp()
                    });
                }
                
                if (player.targetPvpPlayerId && (!window.pvpArena || window.pvpArena.state === 'fight')) {
                    let opp = networkPlayers[player.targetPvpPlayerId];
                    if (opp && opp.hp > 0 && opp.mapId === 'pvp_arena') {
                        let dist = Math.hypot(opp.x - player.x, opp.y - player.y);
                        let rangeLimit = (player.classId === 'merchant' || player.classId === 'teacher') ? 250 : 100;
                        if (dist <= rangeLimit) {
                            let now = Date.now();
                            if (!player.lastAttackTime) player.lastAttackTime = 0;
                            if (now - player.lastAttackTime > 1300) {
                                player.lastAttackTime = now;
                                
                                let baseDmg = getEffectiveAtk();
                                let isCrit = Math.random() < 0.25;
                                let dmg = isCrit ? Math.round(baseDmg * 1.6) : baseDmg;
                                let projId = 'proj_' + myNetworkId + '_' + Date.now() + '_' + Math.floor(Math.random()*1000);
                                
                                if (typeof spawnPvpProjectileLocally === 'function') {
                                    spawnPvpProjectileLocally(projId, myNetworkId, player.targetPvpPlayerId, 'basic', dmg, isCrit);
                                    pvpChannel.postMessage({
                                        type: 'PVP_PROJECTILE_SPAWN',
                                        id: projId,
                                        ownerId: myNetworkId,
                                        targetId: player.targetPvpPlayerId,
                                        skillId: 'basic',
                                        damage: dmg,
                                        isCrit: isCrit
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // D. Continuous standard background monster physics step (Culling: only update physics if within 1200px of player)
            monsters.forEach(m => {
                let d = Math.hypot(m.x - player.x, m.y - player.y);
                if (d < 1200) {
                    m.x += m.vx; m.y += m.vy;
                    if(m.x < 50 || m.x > WORLD_SIZE - 50) m.vx *= -1;
                    if(m.y < 50 || m.y > WORLD_SIZE - 50) m.vy *= -1;
                }

                // Chuột Chúa - Thần Trùng Cổ Đại 4-Phase Boss Logic
                if (m.name === "Chuột Chúa - Thần Trùng Cổ Đại" && m.hp > 0) {
                    let hpPct = m.hp / m.maxHp;
                    if (m.scaleMultiplier === undefined) m.scaleMultiplier = 1.0;
                    if (m.baseAtk === undefined) m.baseAtk = m.atk;

                    // Phase 2 (HP < 75%)
                    if (hpPct < 0.75 && !m.phase2Triggered) {
                        m.phase2Triggered = true;
                        showToast("🚨 Chuột Chúa triệu hồi lâu la Chuột Cống bảo vệ!", "#dc2626");
                        for (let i = 0; i < 3; i++) {
                            let mx = m.x + (Math.random() - 0.5) * 100;
                            let my = m.y + (Math.random() - 0.5) * 100;
                            monsters.push({
                                name: "Chuột Cống",
                                emoji: "🐀",
                                level: 2,
                                hp: 50,
                                maxHp: 50,
                                atk: 12,
                                def: 2,
                                speed: 2,
                                exp: 80,
                                gold: 20,
                                x: mx,
                                y: my,
                                vx: (Math.random() - 0.5) * 3,
                                vy: (Math.random() - 0.5) * 3,
                                isMinion: true,
                                lastAttack: 0,
                                id: "M_" + Math.random(),
                                spawnedMapId: window.currentMapId
                            });
                        }
                    }

                    // Phase 3 (HP < 50%)
                    if (hpPct < 0.50 && !m.phase3Triggered) {
                        m.phase3Triggered = true;
                        m.scaleMultiplier = 1.8;
                        m.atk = Math.round(m.baseAtk * 1.5);
                        showToast("🚨 Chuột Chúa nổi giận, kích thước và lực công kích tăng mạnh!", "#dc2626");
                    }

                    // Phase 4 (HP < 25%)
                    if (hpPct < 0.25 && !m.phase4Triggered) {
                        m.phase4Triggered = true;
                        m.atk = Math.round(m.baseAtk * 2.0);
                        showToast("🚨 Chuột Chúa cuồng bạo! Lực công kích gấp đôi, tốc độ tấn công điên cuồng!", "#dc2626");
                    }
                }
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
                
                let canRoam = true;
                if (window.currentMapId !== 'world' && (nKey === 'elder' || nKey === 'blacksmith' || nKey === 'merchant' || nKey === 'barber')) {
                    canRoam = false;
                    npc.tx = undefined;
                    npc.ty = undefined;
                }
                
                if (canRoam && Date.now() > (npc.roamCooldown || 0)) {
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
                
                if (canRoam && npc.tx !== undefined && npc.ty !== undefined) {
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
                        } else if (mapId === 'bamboo_forest') {
                            // Bamboo forest
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#1e3a1e";
                            } else {
                                ctx.fillStyle = "#142d14";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            // Stylized bamboo stalks
                            ctx.fillStyle = "#4d7c0f";
                            ctx.fillRect(wx - camera.x + 80, wy - camera.y + 40, 8, 120);
                            ctx.fillRect(wx - camera.x + 120, wy - camera.y + 60, 6, 100);
                        } else if (mapId === 'beach') {
                            // Sandy beach
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#fef08a";
                            } else {
                                ctx.fillStyle = "#fde047";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            // Stylized shells
                            ctx.fillStyle = "#fb7185";
                            ctx.fillRect(wx - camera.x + 60, wy - camera.y + 60, 6, 6);
                        } else if (mapId === 'bat_cave') {
                            // Dark bat cave
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#111827";
                            } else {
                                ctx.fillStyle = "#1f2937";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            // Purple crystal clusters
                            ctx.fillStyle = "#c084fc";
                            ctx.fillRect(wx - camera.x + 100, wy - camera.y + 80, 8, 8);
                        } else if (mapId === 'citadel') {
                            // Stone Citadel
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#334155";
                            } else {
                                ctx.fillStyle = "#475569";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            ctx.strokeStyle = "#1e293b";
                            ctx.lineWidth = 2;
                            ctx.strokeRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                        } else if (mapId === 'pvp_arena') {
                            // PVP Arena concrete/stone tiles
                            if(((Math.abs(wx) + Math.abs(wy)) / tileSize) % 2 === 0) {
                                ctx.fillStyle = "#27272a";
                            } else {
                                ctx.fillStyle = "#18181b";
                            }
                            ctx.fillRect(wx - camera.x, wy - camera.y, tileSize, tileSize);
                            ctx.strokeStyle = "#3f3f46";
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
                if (window.currentMapId === 'bamboo_forest') {
                    let sx = 1900 - camera.x;
                    let sy = 1000 - camera.y;
                    ctx.save();
                    ctx.beginPath(); ctx.arc(sx, sy, 35, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(234, 179, 8, 0.08)'; ctx.fill();
                    ctx.strokeStyle = '#eab308'; ctx.lineWidth = 3;
                    ctx.setLineDash([8, 12]);
                    ctx.beginPath(); ctx.arc(sx, sy, 25, timeTick, timeTick + Math.PI * 2); ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                    ctx.fillStyle = '#eab308'; ctx.fill();
                    ctx.font = "bold 13px 'Baloo 2'"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
                    ctx.fillText("🌉 Cầu Dẫn (Sang Bãi Biển)", sx, sy - 40);
                    ctx.restore();
                } else if (window.currentMapId === 'beach') {
                    let sx = 1900 - camera.x;
                    let sy = 1000 - camera.y;
                    ctx.save();
                    ctx.beginPath(); ctx.arc(sx, sy, 35, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)'; ctx.fill();
                    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
                    ctx.setLineDash([8, 12]);
                    ctx.beginPath(); ctx.arc(sx, sy, 25, timeTick, timeTick + Math.PI * 2); ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                    ctx.fillStyle = '#3b82f6'; ctx.fill();
                    ctx.font = "bold 13px 'Baloo 2'"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
                    ctx.fillText("⛵ Thuyền Dịch Chuyển (Sang Động Dơi)", sx, sy - 40);
                    ctx.restore();
                } else if (window.currentMapId === 'bat_cave') {
                    let sx = 1900 - camera.x;
                    let sy = 1000 - camera.y;
                    ctx.save();
                    ctx.beginPath(); ctx.arc(sx, sy, 35, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(168, 85, 247, 0.08)'; ctx.fill();
                    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3;
                    ctx.setLineDash([8, 12]);
                    ctx.beginPath(); ctx.arc(sx, sy, 25, timeTick, timeTick + Math.PI * 2); ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                    ctx.fillStyle = '#a855f7'; ctx.fill();
                    ctx.font = "bold 13px 'Baloo 2'"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
                    ctx.fillText("🕳️ Cửa Hang (Sang Thành Trấn)", sx, sy - 40);
                    ctx.restore();
                } else if (window.currentMapId === 'citadel') {
                    let sx = 1000 - camera.x;
                    let sy = 100 - camera.y;
                    ctx.save();
                    ctx.beginPath(); ctx.arc(sx, sy, 35, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(34, 211, 238, 0.08)'; ctx.fill();
                    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3;
                    ctx.setLineDash([8, 12]);
                    ctx.beginPath(); ctx.arc(sx, sy, 25, timeTick, timeTick + Math.PI * 2); ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                    ctx.fillStyle = '#22d3ee'; ctx.fill();
                    ctx.font = "bold 13px 'Baloo 2'"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
                    ctx.fillText("🌀 Cổng Dịch Chuyển (Về Làng)", sx, sy - 40);
                    ctx.restore();
                } else if (window.currentMapId.includes('cave') || window.currentMapId.includes('dungeon') || window.currentMapId.includes('temple') || window.currentMapId === 'cemetery' || window.currentMapId === 'ghost_forest' || window.currentMapId === 'sewer' || window.currentMapId === 'mine' || window.currentMapId === 'cultist_camp' || window.currentMapId === 'nest_cave') {
                    let sx = 600 - camera.x;
                    let sy = 1100 - camera.y;
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
            
            let pvpZoom = (window.currentMapId === 'pvp_arena');
            if (pvpZoom) {
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(1.3, 1.3);
                ctx.translate(-canvas.width / 2, -canvas.height / 2);
            }
            
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

            // Add Monsters (Culling: only visible monsters)
            const monPad = 80;
            monsters.forEach(m => {
                if (m.x >= camera.x - monPad && m.x <= camera.x + canvas.width + monPad &&
                    m.y >= camera.y - monPad && m.y <= camera.y + canvas.height + monPad) {
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
                }
            });

            // Add Remote players
            for(let id in networkPlayers) {
                let p = networkPlayers[id];
                if (p.mapId !== window.currentMapId) continue;
                if (window.currentMapId === 'pvp_arena' && typeof canObserverSeePlayer === 'function' && !canObserverSeePlayer(player, p)) {
                    continue;
                }

                drawList.push({
                    y: p.y,
                    draw: () => {
                        let sx = p.x - camera.x;
                        let sy = p.y - camera.y;

                        let isFlashing = (p.playerHitFlashUntil && p.playerHitFlashUntil > Date.now());
                        if (isFlashing) {
                            ctx.save();
                            ctx.filter = 'brightness(0.6) sepia(1) hue-rotate(-50deg) saturate(5)';
                        }

                        // Calculate other players' movement and facing direction
                        if (p.prevX === undefined) {
                            p.prevX = p.x;
                            p.prevY = p.y;
                            p.lastMoveTime = 0;
                            p.faceDir = 'right';
                        }
                        
                        if (p.x !== p.prevX || p.y !== p.prevY) {
                            if (p.x < p.prevX) p.faceDir = 'left';
                            else if (p.x > p.prevX) p.faceDir = 'right';
                            p.lastMoveTime = Date.now();
                            p.prevX = p.x;
                            p.prevY = p.y;
                        }
                        
                        let otherIsMoving = (Date.now() - p.lastMoveTime < 600);
                        let otherIsAttacking = p.lastAttackTime && (Date.now() - p.lastAttackTime < 350);

                        if (window.drawBeautifulRPGChibi) {
                            window.drawBeautifulRPGChibi(ctx, sx, sy - 10, p.classId, otherIsMoving, 0.9, p.faceDir, false, p.equipment?.skin, otherIsAttacking);
                        } else {
                            ctx.font = "30px Arial"; ctx.textAlign = "center";
                            ctx.fillText(CLASS_DATA[p.classId]?.emoji || "👤", sx, sy);
                        }

                        if (isFlashing) {
                            ctx.restore();
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

                    let inBush = (window.currentMapId === 'pvp_arena' && typeof isPlayerInBush === 'function' && isPlayerInBush(player));
                    let isFlashing = (player.playerHitFlashUntil && player.playerHitFlashUntil > Date.now());
                    
                    ctx.save();
                    if (inBush) {
                        ctx.globalAlpha = 0.55;
                    }
                    if (isFlashing) {
                        ctx.filter = 'brightness(0.6) sepia(1) hue-rotate(-50deg) saturate(5)';
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
                        
                        let isSelfAttacking = (player.attackEffect && player.attackEffect.active && (Date.now() - player.attackEffect.startAt < 350));
                        if (isSelfAttacking) {
                            if (player.attackEffect.targetX < player.x) faceDir = 'left';
                            else faceDir = 'right';
                        }
                        
                        window.drawBeautifulRPGChibi(ctx, px, py - 10, player.classId, player.isMoving, 1.0, faceDir, false, player.equipment.skin, isSelfAttacking);
                    } else {
                        ctx.font = "34px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                        ctx.fillText(CLASS_DATA[player.classId]?.emoji || "👮‍♂️", px, py);
                    }

                    ctx.restore();

                    ctx.font = "bold 13px 'Baloo 2'"; ctx.fillStyle = "#fff";
                    ctx.textAlign = "center";
                    if(player.equipment.skin === 'skin_cong_chua') {
                        ctx.fillStyle = '#fbcfe8';
                        ctx.font = "bold 11px 'Baloo 2'";
                        ctx.fillText("✨ Người Khởi Hành May Mắn ✨", px, py + 22);
                        ctx.fillStyle = '#fff';
                        ctx.font = "bold 13px 'Baloo 2'";
                        ctx.fillText(player.name, px, py + 36);
                    } else {
                        ctx.fillText(player.name, px, py + 26);
                    }

                    renderAttackEffect();
                }
            });

            // Add Map Decorations using Chunk-Based Streaming
            const dChunkSize = 500;
            const pad = 150;
            let startCx = Math.max(0, Math.floor((camera.x - pad) / dChunkSize));
            let endCx = Math.floor((camera.x + canvas.width + pad) / dChunkSize);
            let startCy = Math.max(0, Math.floor((camera.y - pad) / dChunkSize));
            let endCy = Math.floor((camera.y + canvas.height + pad) / dChunkSize);

            // Add PvP Projectiles to draw list
            if (window.currentMapId === 'pvp_arena' && window.pvpArena && window.pvpArena.projectiles) {
                window.pvpArena.projectiles.forEach(proj => {
                    drawList.push({
                        y: proj.y,
                        draw: () => {
                            let sx = proj.x - camera.x;
                            let sy = proj.y - camera.y;
                            ctx.save();
                            ctx.font = "24px Arial";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillText(proj.emoji, sx, sy);
                            ctx.restore();
                        }
                    });
                });
            }

            // Add PvP Buffs to draw list
            if (window.currentMapId === 'pvp_arena' && window.pvpArena && window.pvpArena.buffs) {
                window.pvpArena.buffs.forEach(buff => {
                    drawList.push({
                        y: buff.y,
                        draw: () => {
                            let sx = buff.x - camera.x;
                            let sy = buff.y - camera.y;
                            ctx.save();
                            let bounce = Math.sin(Date.now() / 150) * 4;
                            ctx.beginPath();
                            ctx.arc(sx, sy, 18, 0, Math.PI * 2);
                            let glowColor = 'rgba(251, 191, 36, 0.3)';
                            if (buff.type === 'hp') glowColor = 'rgba(239, 68, 68, 0.3)';
                            else if (buff.type === 'mp') glowColor = 'rgba(59, 130, 246, 0.3)';
                            else if (buff.type === 'speed') glowColor = 'rgba(234, 179, 8, 0.3)';
                            else if (buff.type === 'damage') glowColor = 'rgba(168, 85, 247, 0.3)';
                            ctx.fillStyle = glowColor;
                            ctx.fill();
                            ctx.font = "22px Arial";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            let emoji = "❓";
                            if (buff.type === 'hp') emoji = "❤️";
                            else if (buff.type === 'mp') emoji = "💙";
                            else if (buff.type === 'speed') emoji = "⚡";
                            else if (buff.type === 'damage') emoji = "🔥";
                            ctx.fillText(emoji, sx, sy + bounce);
                            ctx.restore();
                        }
                    });
                });
            }

            if (window.mapDecorationsChunks) {
                for (let cx = startCx; cx <= endCx; cx++) {
                    for (let cy = startCy; cy <= endCy; cy++) {
                        let key = `${cx},${cy}`;
                        let chunkDecs = window.mapDecorationsChunks[key];
                        if (chunkDecs) {
                            chunkDecs.forEach(dec => {
                                drawList.push({
                                    y: dec.y,
                                    draw: () => {
                                        if (window.drawDecoration) {
                                            window.drawDecoration(ctx, dec, camera);
                                        }
                                    }
                                });
                            });
                        }
                    }
                }
            } else {
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
            }

            // Add Ground Items to draw list
            groundItems.forEach(gi => {
                if (gi.mapId && gi.mapId !== (window.currentMapId || 'world')) return;
                let d = Math.hypot(gi.x - player.x, gi.y - player.y);
                if (d < 800) {
                    drawList.push({
                        y: gi.y,
                        draw: () => {
                            let sx = gi.x - camera.x;
                            let sy = gi.y - camera.y;
                            let itemDef = ITEMS[gi.id];
                            let emoji = itemDef?.emoji || "🎁";
                            let bounce = Math.sin((Date.now() - gi.spawnedAt) / 200) * 4;
                            
                            ctx.save();
                            if (gi.id.startsWith('wp_') || gi.id.startsWith('ar_') || gi.id.startsWith('ac_') || gi.id === 'stone_enhance' || gi.id === 'card_summon') {
                                ctx.shadowBlur = 12;
                                ctx.shadowColor = gi.id.includes('god') || gi.id === 'card_summon' ? '#f59e0b' : '#c084fc';
                            }
                            ctx.font = "24px Arial";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillText(emoji, sx, sy + bounce);
                            ctx.restore();

                            ctx.font = "bold 9px 'Baloo 2'";
                            ctx.fillStyle = "#fff";
                            ctx.strokeStyle = "#000";
                            ctx.lineWidth = 2;
                            ctx.textAlign = "center";
                            let nameText = itemDef?.name || gi.id;
                            ctx.strokeText(nameText, sx, sy + bounce + 16);
                            ctx.fillText(nameText, sx, sy + bounce + 16);
                        }
                    });
                }
            });

            // Sort all by Y pivot position
            drawList.sort((a, b) => a.y - b.y);

            // Draw Y-Sorted items
            drawList.forEach(item => item.draw());

            renderMonsterProjectiles();
            renderSkillEffects();
            renderSkillActionPopups();

            // Layer 5: Target Reticle Selection Highlights Line Indicators
            let activeTarget = player.targetMonster || player.lockedTarget;
            if(activeTarget) {
                let m = activeTarget;
                ctx.beginPath();
                ctx.strokeStyle = "rgba(244,63,94,0.6)";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.moveTo(player.x - camera.x, player.y - camera.y);
                ctx.lineTo(m.x - camera.x, m.y - camera.y);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.beginPath();
                let pulseRadius = 24 + Math.sin(Date.now() / 120) * 4;
                ctx.arc(m.x - camera.x, m.y - camera.y, pulseRadius, 0, Math.PI * 2);
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth = 3;
                ctx.stroke();
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
            
            // Draw bushes on top of players but inside the zoomed world
            if (window.currentMapId === 'pvp_arena' && window.pvpArena && window.pvpArena.obstacles) {
                ctx.save();
                window.pvpArena.obstacles.forEach(obs => {
                    if (obs.type === 'bush') {
                        let sx = obs.x - camera.x;
                        let sy = obs.y - camera.y;
                        
                        ctx.beginPath();
                        ctx.arc(sx, sy, obs.radius, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
                        ctx.fill();
                        
                        ctx.font = '28px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.globalAlpha = 0.55;
                        
                        ctx.fillText('🌿', sx, sy);
                        let offset = 20;
                        ctx.fillText('🌿', sx - offset, sy - offset);
                        ctx.fillText('🌿', sx + offset, sy - offset);
                        ctx.fillText('🌿', sx - offset, sy + offset);
                        ctx.fillText('🌿', sx + offset, sy + offset);
                    }
                });
                ctx.restore();
            }

            // Draw bo circle inside zoomed world
            if (window.currentMapId === 'pvp_arena' && window.pvpArena && window.pvpArena.boRadius) {
                let sx = 500 - camera.x;
                let sy = 500 - camera.y;
                let r = window.pvpArena.boRadius;
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 6;
                ctx.setLineDash([15, 10]);
                ctx.lineDashOffset = -Date.now() / 50;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ef4444';
                ctx.stroke();
                ctx.restore();
            }

            if (pvpZoom) {
                ctx.restore();
            }

            // Draw countdown AFTER restore (screen space)
            if (window.pvpArena && window.pvpArena.active && window.pvpArena.state === 'countdown') {
                let elapsed = Date.now() - window.pvpArena.countdownStart;
                let count = 3 - Math.floor(elapsed / 1000);
                if (count <= 0) {
                    window.pvpArena.state = 'fight';
                    window.pvpArena.startTime = Date.now();
                    showToast('⚔️ GIAO TRANH BẮT ĐẦU!');
                } else {
                    ctx.save();
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.font = "bold 90px 'Baloo 2'";
                    ctx.fillStyle = '#fbbf24';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#fbbf24';
                    ctx.fillText(count.toString(), canvas.width / 2, canvas.height / 2);
                    ctx.restore();
                }
            }

            if(!window.uiTicks) window.uiTicks = 0;
            if(window.uiTicks++ % 8 === 0) refreshHudDisplay();
        }

        function renderMinimapGraphics() {
            mCtx.fillStyle = "rgba(10,15,30,0.85)";
            mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);

            let mapId = window.currentMapId || 'world';
            let mapSize = window.getMapSize(mapId);
            let scale = mCanvas.width / mapSize;

            // 1. Draw Map Portals / Entrances
            if (mapId === 'world') {
                PORTALS.forEach(portal => {
                    mCtx.fillStyle = portal.color || "#22d3ee";
                    mCtx.beginPath();
                    mCtx.arc(portal.x * scale, portal.y * scale, 4, 0, Math.PI * 2);
                    mCtx.fill();
                    mCtx.font = "8px sans-serif";
                    mCtx.fillStyle = "#88edff";
                    mCtx.textAlign = "center";
                    let shortName = portal.name.replace("Làng ", "").replace("Rừng ", "").replace("Hồ ", "").replace("Đồi ", "");
                    mCtx.fillText(shortName, portal.x * scale, portal.y * scale - 6);
                });

                DUNGEON_ENTRANCES.forEach(ent => {
                    mCtx.fillStyle = "#ef4444";
                    mCtx.beginPath();
                    mCtx.rect(ent.x * scale - 3, ent.y * scale - 3, 6, 6);
                    mCtx.fill();
                    mCtx.font = "8px sans-serif";
                    mCtx.fillStyle = "#fca5a5";
                    mCtx.textAlign = "center";
                    let shortName = ent.name.substring(0, 4);
                    mCtx.fillText(shortName, ent.x * scale, ent.y * scale - 6);
                });

                BUILDING_ENTRANCES.forEach(ent => {
                    mCtx.fillStyle = "#eab308";
                    mCtx.beginPath();
                    mCtx.rect(ent.x * scale - 2, ent.y * scale - 2, 4, 4);
                    mCtx.fill();
                });
            } else {
                let exitX = null, exitY = null, exitLabel = "Cổng";
                if (mapId === 'bamboo_forest' || mapId === 'beach' || mapId === 'bat_cave') {
                    exitX = 1900; exitY = 1000;
                    exitLabel = mapId === 'bamboo_forest' ? "Cầu" : (mapId === 'beach' ? "Thuyền" : "Hang");
                } else if (mapId === 'citadel') {
                    exitX = 1000; exitY = 100;
                    exitLabel = "Về Làng";
                } else if (mapId.includes('cave') || mapId.includes('dungeon') || mapId.includes('temple') || mapId === 'cemetery' || mapId === 'ghost_forest' || mapId === 'sewer' || mapId === 'mine' || mapId === 'cultist_camp' || mapId === 'nest_cave') {
                    exitX = 600; exitY = 1100;
                    exitLabel = "Về Làng";
                } else {
                    exitX = 300; exitY = 550;
                    exitLabel = "Lối Ra";
                }

                if (exitX !== null) {
                    mCtx.fillStyle = "#22d3ee";
                    mCtx.beginPath();
                    mCtx.arc(exitX * scale, exitY * scale, 5, 0, Math.PI * 2);
                    mCtx.fill();
                    mCtx.strokeStyle = "#ffffff";
                    mCtx.lineWidth = 1;
                    mCtx.beginPath();
                    mCtx.arc(exitX * scale, exitY * scale, 7, 0, Math.PI * 2);
                    mCtx.stroke();

                    mCtx.font = "bold 8px sans-serif";
                    mCtx.fillStyle = "#22d3ee";
                    mCtx.textAlign = "center";
                    mCtx.fillText(exitLabel, exitX * scale, exitY * scale - 9);
                }
            }

            // 2. Render Static Map NPCs dots
            for(let k in NPC_DATA) {
                let n = NPC_DATA[k];
                let showNpc = false;
                if (window.currentMapId !== 'world') {
                    let targetMap = '';
                    if (k === 'elder') targetMap = 'communal_house';
                    else if (k === 'blacksmith') targetMap = 'blacksmith_shop';
                    else if (k === 'merchant') targetMap = 'village_temple';
                    else if (k === 'barber') targetMap = 'school';
                    
                    if (window.currentMapId === targetMap) showNpc = true;
                } else {
                    if (k !== 'dirtyPond' && k !== 'richMaze') showNpc = true;
                }

                if (showNpc) {
                    mCtx.fillStyle = "gold";
                    mCtx.beginPath(); mCtx.arc(n.x * scale, n.y * scale, 3, 0, Math.PI*2); mCtx.fill();
                }
            }

            // 3. Render Red Roaming Enemy Dots
            monsters.forEach(m => {
                mCtx.fillStyle = m.isBoss ? "orange" : "red";
                mCtx.beginPath(); mCtx.arc(m.x * scale, m.y * scale, m.isBoss ? 4 : 2, 0, Math.PI*2); mCtx.fill();
            });

            // 4. Render Green Core Main Client Player Dot
            mCtx.fillStyle = "#22c55e";
            mCtx.beginPath(); mCtx.arc(player.x * scale, player.y * scale, 4, 0, Math.PI*2); mCtx.fill();

            // Self outline cursor cross ring
            mCtx.strokeStyle = "rgba(34,197,94,0.5)";
            mCtx.strokeRect(player.x * scale - 4, player.y * scale - 4, 8, 8);
        }

        // --- MULTI-MAP PORTALS & TRANSITIONS ---
        const PORTALS = [
            { name: "Làng Trung Tâm", mapId: "world", x: 1520, y: 1450, color: '#22d3ee' },
            { name: "Rừng Tre", mapId: "world", x: 600, y: 2800, color: '#10b981' },
            { name: "Hồ Sen Tĩnh Lặng", mapId: "world", x: 2800, y: 2800, color: '#3b82f6' },
            { name: "Đồi Cỏ Mặt Trời", mapId: "world", x: 3300, y: 800, color: '#eab308' },
            { name: "Bãi Luyện Cấp (Dị Biến)", mapId: "world", x: 1200, y: 3500, color: '#f43f5e' },
            { name: "Chợ Quê Xóm Dưới", mapId: "world", x: 2800, y: 3600, color: '#a855f7' }
        ];

        const DUNGEON_ENTRANCES = [
            // Chapter 1 Dungeons
            { name: "Cống Ngầm Cũ (Cấp 4+)", targetMapId: "sewer", parentMapId: "world", x: 2600, y: 1520, spawnX: 600, spawnY: 600, color: '#10b981' },
            { name: "Hang Dơi (Cấp 5+)", targetMapId: "bat_cave", parentMapId: "world", x: 1200, y: 2200, spawnX: 600, spawnY: 600, color: '#3b82f6' },
            { name: "Mỏ Đồng Bỏ Hoang (Cấp 8+)", targetMapId: "mine", parentMapId: "world", x: 600, y: 1200, spawnX: 600, spawnY: 600, color: '#eab308' },
            { name: "Doanh Trại Giáo Đồ (Cấp 10+)", targetMapId: "cultist_camp", parentMapId: "world", x: 1400, y: 3200, spawnX: 600, spawnY: 600, color: '#a855f7' },
            { name: "Hang Tổ Thần Trùng (Cấp 13+)", targetMapId: "nest_cave", parentMapId: "world", x: 2200, y: 2200, spawnX: 600, spawnY: 600, color: '#f43f5e' },
            
            // Classic Dungeons
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
            if (mapId === 'pvp_arena') {
                return; // Không sinh quái vật trong đấu trường PvP
            }
            if (mapId === 'world') {
                spawnInitialMonsters();
            } else {
                // Spawn Boss for this map
                spawnSingleMonster(true, mapId);
                // Spawn minions
                let count = (mapId === 'demon_cave' || mapId === 'cemetery' || mapId === 'dungeon') ? 15 : 12;
                for (let i = 0; i < count; i++) {
                    spawnSingleMonster(false, mapId);
                }
            }
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
                player.lockedTarget = null;
                
                if (window.generateMapDecorations) {
                    window.generateMapDecorations(mapId);
                }
                spawnMonstersForMap(mapId);
                updateNpcPositionsForMap(mapId);
                
                let targetBgm = 'aresden';
                if (mapId === 'demon_cave' || mapId === 'dungeon' || mapId === 'bat_cave') targetBgm = 'dungeon';
                else if (mapId === 'cemetery') targetBgm = 'apocalypse';
                else if (mapId.includes('house') || mapId.includes('school') || mapId.includes('shop')) targetBgm = 'elvine';
                audio.playBgm(targetBgm);
                
                const mapNames = {
                    'world': 'Làng Tân Thủ',
                    'bamboo_forest': 'Rừng Tre',
                    'beach': 'Bãi Biển',
                    'bat_cave': 'Động Dơi',
                    'citadel': 'Thành Trấn',
                    'demon_cave': 'Hang Quỷ',
                    'cemetery': 'Nghĩa Địa',
                    'ghost_forest': 'Rừng Ma',
                    'ancient_temple': 'Đền Cổ',
                    'dungeon': 'Hầm Ngục Tối',
                    'communal_house': 'Ủy Ban Xã',
                    'school': 'Trường Học',
                    'police_station': 'Trạm Công An',
                    'blacksmith_shop': 'Lò Rèn',
                    'village_temple': 'Đình Làng',
                    'pvp_arena': 'Đấu Trường PvP'
                };
                showToast(`🔮 Đã chuyển sang bản đồ: ${mapNames[mapId] || mapId.toUpperCase()}`);
                autosaveGameProcess(true);
                
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
                player.lockedTarget = null;
                
                if (window.generateMapDecorations) {
                    window.generateMapDecorations(window.currentMapId);
                }
                spawnMonstersForMap(window.currentMapId);
                updateNpcPositionsForMap(window.currentMapId);
                
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

        function openDifficultySelector(entrance) {
            // Push player back slightly to prevent trigger loop
            let px = player.x;
            let py = player.y;
            let dx = px - entrance.x;
            let dy = py - entrance.y;
            let dist = Math.sqrt(dx*dx + dy*dy) || 1;
            player.x = entrance.x + (dx / dist) * 60;
            player.y = entrance.y + (dy / dist) * 60;
            player.destinationX = undefined;
            player.destinationY = undefined;
            player.targetMonster = null;

            // Remove existing modal if any
            let old = document.getElementById('difficultyModal');
            if (old) old.remove();

            let modal = document.createElement('div');
            modal.id = 'difficultyModal';
            modal.style.position = 'fixed';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.width = '320px';
            modal.style.background = '#1e1e24';
            modal.style.border = '2px solid #e53935';
            modal.style.borderRadius = '12px';
            modal.style.color = '#fff';
            modal.style.zIndex = '99999';
            modal.style.boxShadow = '0 0 20px rgba(229, 57, 53, 0.5)';
            modal.style.fontFamily = "'Segoe UI', sans-serif";
            
            // Header
            let header = document.createElement('div');
            header.style.background = '#e53935';
            header.style.padding = '10px';
            header.style.textAlign = 'center';
            header.style.fontWeight = 'bold';
            header.style.fontSize = '1.05rem';
            header.style.borderTopLeftRadius = '10px';
            header.style.borderTopRightRadius = '10px';
            header.textContent = `🔮 ĐỘ KHÓ: HẦM NGỤC`;
            modal.appendChild(header);

            // Body
            let body = document.createElement('div');
            body.style.padding = '12px';
            body.style.display = 'flex';
            body.style.flexDirection = 'column';
            body.style.gap = '8px';

            let baseLevel = 1;
            if (entrance.targetMapId === 'sewer') baseLevel = 4;
            else if (entrance.targetMapId === 'bat_cave') baseLevel = 5;
            else if (entrance.targetMapId === 'mine') baseLevel = 8;
            else if (entrance.targetMapId === 'cultist_camp') baseLevel = 10;
            else if (entrance.targetMapId === 'nest_cave') baseLevel = 13;
            else if (entrance.targetMapId === 'demon_cave') baseLevel = 15;
            else if (entrance.targetMapId === 'cemetery') baseLevel = 25;
            else if (entrance.targetMapId === 'ghost_forest') baseLevel = 35;
            else if (entrance.targetMapId === 'ancient_temple') baseLevel = 45;
            else if (entrance.targetMapId === 'dungeon') baseLevel = 55;

            let keyId = 'key_' + entrance.targetMapId;
            let keyCount = 0;
            let keyInv = player.inventory.find(i => i.id === keyId);
            if (keyInv) keyCount = keyInv.count;

            let difficulties = [
                { id: 'easy', name: '🟢 Dễ', desc: 'Thưởng: x1.0 Vàng/XP. Không cần chìa khóa.', reqLvl: baseLevel, reqKeys: 0 },
                { id: 'medium', name: '🟡 Thường', desc: 'Thưởng: x1.5 Vàng/XP. Có cơ hội rớt chìa khóa.', reqLvl: baseLevel + 5, reqKeys: 0 },
                { id: 'hard', name: '🔴 Khó', desc: `Thưởng: x2.5 Vàng/XP. Cơ hội Epic loot. Cần 1 chìa (Có: ${keyCount})`, reqLvl: baseLevel + 10, reqKeys: 1 },
                { id: 'hell', name: '☠️ Ác Mộng', desc: `Thưởng: x4.0 Vàng/XP. Cơ hội Legendary loot. Cần 2 chìa (Có: ${keyCount})`, reqLvl: baseLevel + 20, reqKeys: 2 }
            ];

            difficulties.forEach(diff => {
                let btn = document.createElement('div');
                btn.style.background = '#2e2e38';
                btn.style.border = '1px solid #4a4a5a';
                btn.style.borderRadius = '8px';
                btn.style.padding = '8px';
                btn.style.cursor = 'pointer';
                btn.style.transition = 'background 0.2s';
                
                btn.onmouseover = () => { btn.style.background = '#3e3e4a'; };
                btn.onmouseout = () => { btn.style.background = '#2e2e38'; };

                btn.innerHTML = `
                    <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:0.9rem;">
                        <span>${diff.name}</span>
                        <span style="color:#aaa; font-size:0.8rem;">Cấp: ${diff.reqLvl}</span>
                    </div>
                    <div style="font-size:0.7rem; color:#cbd5e1; margin-top:2px;">${diff.desc}</div>
                `;

                btn.onclick = () => {
                    if (player.level < diff.reqLvl) {
                        showToast(`⚠️ Cần đạt cấp ${diff.reqLvl} cho độ khó này!`, '#ef4444');
                        return;
                    }
                    if (diff.reqKeys > 0) {
                        if (keyCount < diff.reqKeys) {
                            showToast(`⚠️ Không đủ Chìa Khóa! Cần ${diff.reqKeys}x ${ITEMS[keyId].name}!`, '#ef4444');
                            return;
                        }
                        // Consume keys
                        let invItem = player.inventory.find(i => i.id === keyId);
                        if (invItem) {
                            invItem.count -= diff.reqKeys;
                            if (invItem.count <= 0) {
                                let idx = player.inventory.indexOf(invItem);
                                player.inventory.splice(idx, 1);
                            }
                        }
                        showToast(`🔑 Đã tiêu hao ${diff.reqKeys}x Chìa Khóa Hầm Ngục!`);
                    }
                    
                    window.dungeonDifficulty = diff.id;
                    modal.remove();
                    window.changeMap(entrance.targetMapId, entrance.spawnX, entrance.spawnY);
                };

                body.appendChild(btn);
            });

            // Cancel button
            let cancel = document.createElement('button');
            cancel.textContent = 'ĐÓNG';
            cancel.style.width = '100%';
            cancel.style.padding = '8px';
            cancel.style.background = '#4b5563';
            cancel.style.border = 'none';
            cancel.style.borderRadius = '6px';
            cancel.style.color = '#fff';
            cancel.style.fontWeight = 'bold';
            cancel.style.cursor = 'pointer';
            cancel.style.marginTop = '4px';
            cancel.onclick = () => { modal.remove(); };
            body.appendChild(cancel);

            modal.appendChild(body);
            document.body.appendChild(modal);
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
                    // Bamboo forest transition portal
                    if (currentStandingPortal.x === 600 && currentStandingPortal.y === 2800) {
                        window.changeMap('bamboo_forest', 200, 200);
                        return;
                    }
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
                        if (entrance.targetMapId === 'sewer') reqLevel = 4;
                        else if (entrance.targetMapId === 'bat_cave') reqLevel = 5;
                        else if (entrance.targetMapId === 'mine') reqLevel = 8;
                        else if (entrance.targetMapId === 'cultist_camp') reqLevel = 10;
                        else if (entrance.targetMapId === 'nest_cave') reqLevel = 13;
                        else if (entrance.targetMapId === 'demon_cave') reqLevel = 15;
                        else if (entrance.targetMapId === 'cemetery') reqLevel = 25;
                        else if (entrance.targetMapId === 'ghost_forest') reqLevel = 35;
                        else if (entrance.targetMapId === 'ancient_temple') reqLevel = 45;
                        else if (entrance.targetMapId === 'dungeon') reqLevel = 55;
                        
                        if (player.level < reqLevel) {
                            showToast(`⚠️ Cần đạt cấp ${reqLevel} để đi vào hầm ngục này!`, '#ef4444');
                            let dx = px - entrance.x;
                            let dy = py - entrance.y;
                            let pushDist = 60;
                            if (dist === 0) { dx = 0; dy = 1; dist = 1; }
                            player.x = entrance.x + (dx / dist) * pushDist;
                            player.y = entrance.y + (dy / dist) * pushDist;
                            player.destinationX = undefined;
                            player.destinationY = undefined;
                            player.targetMonster = null;
                            return;
                        }
                        
                        openDifficultySelector(entrance);
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
                if (window.currentMapId === 'bamboo_forest') {
                    let dist = Math.sqrt((px - 1900)**2 + (py - 1000)**2);
                    if (dist < 40) {
                        window.changeMap('beach', 200, 200);
                        return;
                    }
                } else if (window.currentMapId === 'beach') {
                    let dist = Math.sqrt((px - 1900)**2 + (py - 1000)**2);
                    if (dist < 40) {
                        window.changeMap('bat_cave', 200, 200);
                        return;
                    }
                } else if (window.currentMapId === 'bat_cave') {
                    let dist = Math.sqrt((px - 1900)**2 + (py - 1000)**2);
                    if (dist < 40) {
                        window.changeMap('citadel', 200, 200);
                        return;
                    }
                } else if (window.currentMapId === 'citadel') {
                    let dist = Math.sqrt((px - 1000)**2 + (py - 100)**2);
                    if (dist < 40) {
                        window.changeMap('world', 760, 725); // back to town center
                        return;
                    }
                } else if (window.currentMapId.includes('cave') || window.currentMapId.includes('dungeon') || window.currentMapId.includes('temple') || window.currentMapId === 'cemetery' || window.currentMapId === 'ghost_forest' || window.currentMapId === 'sewer' || window.currentMapId === 'mine' || window.currentMapId === 'cultist_camp' || window.currentMapId === 'nest_cave') {
                    let dist = Math.sqrt((px - 600)**2 + (py - 1100)**2);
                    if (dist < 40) {
                        let ent = DUNGEON_ENTRANCES.find(e => e.targetMapId === window.currentMapId);
                        let rx = ent ? ent.x : 760;
                        let ry = ent ? ent.y + 50 : 725;
                        window.changeMap('world', rx, ry);
                        return;
                    }
                } else {
                    let dist = Math.sqrt((px - 300)**2 + (py - 550)**2);
                    if (dist < 35) {
                        let ent = BUILDING_ENTRANCES.find(e => e.targetMapId === window.currentMapId);
                        let rx = ent ? ent.x : 760;
                        let ry = ent ? ent.y + 50 : 725;
                        window.changeMap('world', rx, ry);
                        return;
                    }
                }
            }
        };
