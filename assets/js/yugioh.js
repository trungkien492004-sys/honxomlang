// ===== 🃏 YUGIOH.JS — Game Bài Ma Thuật Yu-Gi-Oh! v1.0 =====
'use strict';

const ygoCharacters = {
    // --- BỘ BA HUYỀN THOẠI ---
    yugi: {
        name: "Yugi Muto (Atem)",
        requiredCards: ["dark_magician", "dark_magician_girl", "kuriboh"],
        skillName: "Rút Bài Định Mệnh (Destiny Draw)",
        skillDesc: "Khi LP dưới 1500, ở Draw Phase tiếp theo, mở toàn bộ Deck và tự chọn 1 lá bài đưa lên tay thay vì rút ngẫu nhiên. Kích hoạt hiệu ứng hào quang vàng và đổi nhạc nền kịch tính."
    },
    kaiba: {
        name: "Seto Kaiba",
        requiredCards: ["blue_eyes_white_dragon", "blue_eyes_white_dragon", "flute_of_summoning_dragon"],
        skillName: "Kiêu Hãnh Của Rồng (Pride of Blue-Eyes)",
        skillDesc: "Một trận một lần, có thể Triệu hồi Thường ngay lập tức Rồng Trắng Mắt Xanh từ trên tay xuống sân mà không cần hiến tế."
    },
    joey: {
        name: "Joey Wheeler (Jonouchi)",
        requiredCards: ["red_eyes_black_dragon", "time_wizard", "baby_dragon"],
        skillName: "Thần Bài May Mắn (The Gambler)",
        skillDesc: "Tất cả các lá bài có hiệu ứng tung đồng xu hoặc đổ xúc xắc luôn ra kết quả có lợi nhất (Đồng xu luôn ngửa, xúc xắc luôn 6 nút)."
    },

    // --- CÁC BÀI THỦ NỮ KINH ĐIỂN ---
    mai: {
        name: "Mai Valentine",
        requiredCards: ["harpie_lady", "harpie_lady_sb", "elegant_egotist"],
        skillName: "Nước Hoa Chiến Thuật (Aroma Strategy)",
        skillDesc: "Toàn bộ các lá bài trong Deck sẽ luôn hiển thị lật ngửa đối với Mai, giúp biết trước 100% các lá bài mình sẽ rút tiếp theo."
    },
    tea: {
        name: "Téa Gardner (Anzu)",
        requiredCards: ["shining_friendship", "happy_lover", "fire_sorcerer"],
        skillName: "Sức Mạch Tình Bạn (Friendship Power)",
        skillDesc: "Kỹ năng bị động. Mỗi khi Téa bị trừ LP từ đòn tấn công của đối thủ, cô sẽ hồi lại đúng bằng 50% số LP vừa tổn thất."
    },
    ishizu: {
        name: "Ishizu Ishtar",
        requiredCards: ["mudora", "keldo", "zolga"],
        skillName: "Vòng Cổ Ngàn Năm (Millennium Necklace)",
        skillDesc: "Ishizu có thể nhìn thấy toàn bộ các lá bài trên tay và 3 lá bài trên cùng của bộ bài đối phương xuyên suốt cả trận đấu."
    },
    rebecca: {
        name: "Rebecca Hopkins",
        requiredCards: ["shadow_ghoul", "cannon_soldier", "witch_of_the_black_forest"],
        skillName: "Thần Đồng Công Nghệ (Cyber Prodigy)",
        skillDesc: "Kỹ năng bị động. Mỗi khi Rebecca kích hoạt thành công một lá bài Phép (Spell), đối thủ sẽ bị trừ ngay lập tức 400 LP."
    },

    // --- PHE TÂM LINH & PHẢN DIỆN DIỆN DIỄN ---
    marik: {
        name: "Yami Marik",
        requiredCards: ["lava_golem", "helpoemer", "monster_reborn"],
        skillName: "Nghi Thức Hiến Tế Bóng Tối",
        skillDesc: "Một trận một lần, chọn 1 quái thú của đối thủ làm vật tế để triệu hồi quái thú từ tay mình, giá phải trả là bị trừ một nửa LP hiện tại."
    },
    bakura: {
        name: "Yami Bakura",
        requiredCards: ["dark_necrofear", "change_of_heart", "headless_knight"],
        skillName: "Sức Mệnh Kẻ Trộm Mộ (Graveyard Robber)",
        skillDesc: "Một trận một lần, hồi sinh một quái thú bất kỳ từ Mộ bài (GY) của đối thủ lên sân của mình và biến nó thành hệ Bóng Tối (Dark)."
    },
    pegasus: {
        name: "Maximillion Pegasus",
        requiredCards: ["toon_world", "relinquished", "toon_summoned_skull"],
        skillName: "Con Mắt Ngàn Năm (Millennium Eye)",
        skillDesc: "Toàn bộ các lá bài Úp trên sân của đối thủ (Quái thú úp thủ, Phép/Bẫy úp) sẽ hiển thị lật ngửa (nhìn xuyên thấu) đối với Pegasus."
    },
    keith: {
        name: "Bandit Keith",
        requiredCards: ["barrel_dragon", "slot_machine", "seven_completed"],
        skillName: "Gian Lận Súng Sáu (Sleight of Hand)",
        skillDesc: "Một trận một lần, Keith có thể biến đổi 1 lá bài bất kỳ trên tay thành lá bài Phép '7 Completed' (+700 ATK cho Máy móc)."
    },

    // --- BÀI THỦ BATTLE CITY & DUELIST KINGDOM ---
    mako: {
        name: "Mako Tsunami",
        requiredCards: ["the_legendary_fisherman", "amphibian_beast", "umi"],
        skillName: "Đại Dương Thịnh Nộ (Ocean Kingdom)",
        skillDesc: "Tự động kích hoạt bài môi trường Umi (+500 ATK cho hệ Nước). Quái thú hệ Nước có thể tấn công trực tiếp nếu đối thủ không có quái hệ Nước."
    },
    weevil: {
        name: "Weevil Underwood",
        requiredCards: ["insect_queen", "parasite_paracide", "cocoon_of_evolution"],
        skillName: "Kẻ Đặt Bẫy Côn Trùng (Insect Infestation)",
        skillDesc: "Vào trận, lén nhét 2 lá bẫy 'Parasite Paracide' vào giữa Deck đối thủ. Khi đối thủ rút phải, họ mất 1000 LP và quái trên sân biến thành Côn Trùng."
    },
    rex: {
        name: "Rex Raptor",
        requiredCards: ["tyrant_dragon", "two_headed_king_rex", "megazowler"],
        skillName: "Khủng Long Bạo Chúa (Dino Stampede)",
        skillDesc: "Kỹ năng bị động. Tất cả quái thú hệ Khủng Long của Rex khi tấn công quái thú thủ của đối phương sẽ gây sát thương xuyên thủ (ATK - DEF)."
    },
    espa_roba: {
        name: "Espa Roba",
        requiredCards: ["jinzo", "cyber_raider", "reflect_bounder"],
        skillName: "Sóng Não Ngoại Cảm (Cyber Psychic)",
        skillDesc: "Kỹ năng bị động. Espa Roba luôn nhìn thấy toàn bộ các lá bài Cạm Bẫy (Trap Card) trên tay và trên sân của đối thủ xuyên suốt trận đấu."
    },
    duke: {
        name: "Duke Devlin",
        requiredCards: ["orgoth_the_relentless", "dice_dungeon", "strike_ninja"],
        skillName: "Xúc Xắc Ma Thuật (Dice Dungeon)",
        skillDesc: "Khi tung xúc xắc: Số Chẵn (2,4,6) tăng 500 ATK cho quái của Duke. Số Lẻ (1,3,5) chuyển quái sang thủ và không thể bị phá hủy trong lượt đó."
    },
    arkana: {
        name: "Arkana (Pandora)",
        requiredCards: ["dark_magician_red", "dark_renewal", "anti_spell_fragrance"],
        skillName: "Phù Thủy Đen Độc Ác (Dark Magician Curtain)",
        skillDesc: "Một trận một lần, hiến tế 1000 LP để Triệu hồi Đặc biệt ngay lập tức một Phù thủy áo đen đồ đỏ từ trong bộ bài ra sân."
    },
    bonz: {
        name: "Bonz (Ghost)",
        requiredCards: ["pumpking_king_of_ghosts", "castle_of_dark_illusions", "dragon_zombie"],
        skillName: "Tiếng Gọi Nghĩa Địa (Call of the Living Dead)",
        skillDesc: "Kỹ năng bị động. Mỗi khi quái thú hệ Zombie của Bonz bị tiêu diệt xuống Mộ, nó tự động hồi sinh ở thế Thủ với ATK = 0 (bất tử chặn đòn)."
    },
    paradox_brothers: {
        name: "Anh Em Mê Cung",
        requiredCards: ["gate_guardian", "labyrinth_wall", "sanga_of_the_thunder"],
        skillName: "Hợp Thể Mê Cung (Labyrinth Wall)",
        skillDesc: "Một trận một lần, có thể biến đổi 1 quái thú bất kỳ đang ở thế Thủ của mình thành 'Labyrinth Wall' với chỉ số DEF gán cứng bằng 3000."
    },
    odion: {
        name: "Odion (Rashid)",
        requiredCards: ["mystical_beast_serket", "temple_of_the_kings", "judgment_of_anubis"],
        skillName: "Bậc Thầy Cạm Bẫy (Endless Traps)",
        skillDesc: "Mỗi khi Odion bị trừ LP trực tiếp, được chọn 1 lá bài Bẫy (Trap) ngẫu nhiên dưới Mộ bài để úp ngược trở lại sân (Tối đa 2 lần/trận)."
    },

    // --- TRÙM PHẦN NGOẠI TRUYỆN (ORICHALCOS & VIRTUAL WORLD) ---
    dartz: {
        name: "Dartz",
        requiredCards: ["orichalcos_shunoros", "mirror_knight_calling", "orichalcos_deuteros"],
        skillName: "Con Mắt Phong Ấn (The Seal of Orichalcos)",
        skillDesc: "Tự động kích hoạt bài môi trường Orichalcos không thể phá hủy (+500 ATK). Cho phép Dartz dùng luôn 3 ô Phép/Bẫy để triệu hồi quái (Tối đa 6 quái)."
    },
    rafael: {
        name: "Rafael",
        requiredCards: ["guardian_grarl", "guardian_elma", "backup_soldier"],
        skillName: "Sức Mạnh Giữ Mình (Guardian Trust)",
        skillDesc: "Kỹ năng bị động. Nếu Mộ bài của Rafael hoàn toàn trống trơn (0 lá bài), tất cả quái thú trên sân được +1000 ATK và kháng mọi hiệu ứng phá hủy."
    },
    alister: {
        name: "Alister (Amelda)",
        requiredCards: ["gorlag", "air_fortress_ziggurat", "science_soldier"],
        skillName: "Pháo Đài Ảo Ảnh (Ziggurat Summon)",
        skillDesc: "Khi LP dưới 2000, Alister lập tức loại bỏ toàn bộ bài trên tay để Triệu hồi Đặc biệt siêu quái thú 'Air Fortress Ziggurat' từ Deck ra sân."
    },
    valon: {
        name: "Valon",
        requiredCards: ["psychic_armor_head", "buster_pile", "active_armor"],
        skillName: "Giáp Trận Công Nghệ (Armor Active)",
        skillDesc: "Kỹ năng bị động. Khi Valon có quái thú hệ Máy móc (Machine) trên sân, tất cả sát thương chiến đấu phản lại Valon sẽ gán bằng 0."
    },
    noah: {
        name: "Noah Kaiba",
        requiredCards: ["shinato_king_of_plane", "asura_priest", "inaba_white_rabbit"],
        skillName: "Thế Giới Ảo (Virtual World Reset)",
        skillDesc: "Khi bị tấn công làm LP dưới 1000, Noah có thể kích hoạt Reset: Đưa tất cả quái thú đang có trên sân của cả 2 bên trở về tay chủ sở hữu."
    },
    gozaburo: {
        name: "Gozaburo Kaiba",
        requiredCards: ["exodia_necross", "contract_with_exodia", "shinato_ark"],
        skillName: "Khát Vọng Báo Thù (Necross Immortality)",
        skillDesc: "Kỹ năng bị động. Chỉ cần trong Mộ bài của Gozaburo có đủ 5 mảnh bộ bộ Exodia, quái thú 'Exodia Necross' trên sân sẽ không thể bị chọn làm mục tiêu."
    },
    zigfried: {
        name: "Zigfried von Schroeder",
        requiredCards: ["ride_of_the_valkyries", "valkyrie_brunnhilde", "valkyrie_erste"],
        skillName: "Bản Hùng Ca Valkyrie",
        skillDesc: "Một trận một lần, Triệu hồi Đặc biệt cùng lúc tất cả quái thú hệ Tiên thần (Fairy) từ tay ra sân. Cuối lượt, toàn bộ số quái này bị trục xuất."
    },
    leon: {
        name: "Leon von Schroeder",
        requiredCards: ["golden_castle_of_stromberg", "cinderella", "iron_hans"],
        skillName: "Lâu Đài Cổ Tích (Stromberg Castle)",
        skillDesc: "Vào trận, tự động kích hoạt bài môi trường 'Golden Castle of Stromberg'. Mỗi khi đối thủ tuyên bố tấn công, quái thú tấn công tự động bị phá hủy."
    },

    // --- NHÂN VẬT PHỤ ĐẶC BIỆT ---
    lumis_umbra: {
        name: "Lumis & Umbra",
        requiredCards: ["masked_beast_des_gardius", "mask_of_restrict", "grand_tiki_elder"],
        skillName: "Phong Ấn Mặt Nạ (Mask Lock)",
        skillDesc: "Một trận một lần, chọn 1 ô quái thú hoặc 1 ô phép bẫy trống của đối thủ. Phong ấn ô đó khiến đối thủ không thể sử dụng trong 3 lượt tiếp theo."
    },
    solomon: {
        name: "Solomon Muto (Sugoroku)",
        requiredCards: ["ancient_dragon", "goshen_steel_ogre", "ancient_city"],
        skillName: "Trải Nghiệm Lão Luyện",
        skillDesc: "Kỹ năng bị động. Solomon có thể sử dụng bất kỳ lá bài Phép/Bẫy nào từ trên tay ngay trong lượt đấu của đối thủ (Bỏ qua luật chỉ úp ở lượt mình)."
    }
};

// Trạng thái game
var ygoGame = {
    myDeck: [],            // Bộ bài hiện tại của người chơi
    currentScreen: 'lobby', // lobby, deck, duel
    lobbyTab: 'play',       // play, char, limit
    myCharacter: 'yugi',    // Nhân vật của tôi
    oppCharacter: 'kaiba',  // Nhân vật đối thủ (Bot hoặc PvP)
    
    // Trạng thái trận đấu (Duel State)
    duel: {
        mode: 'pve',       // pve hoặc pvp
        opponentId: null,  // Nếu là pvp
        opponentName: 'Bot',
        playerLP: 8000,
        oppLP: 8000,
        playerHand: [],
        oppHand: [],
        playerDeck: [],
        oppDeck: [],
        playerGY: [],
        oppGY: [],
        // Bàn đấu: 5 ô Quái thú, 5 ô Phép/Bẫy
        playerMonsters: [null, null, null, null, null],
        playerSpells: [null, null, null, null, null],
        oppMonsters: [null, null, null, null, null],
        oppSpells: [null, null, null, null, null],
        
        turn: 'player',    // player hoặc opponent
        phase: 'DRAW',     // DRAW, STANDBY, MAIN1, BATTLE, MAIN2, END
        hasNormalSummoned: false,
        selectedHandIndex: null,
        selectedZoneIndex: null,
        selectedFieldCard: null, // { side, type, pos }
        logs: [],
        
        // Trạng thái Kỹ năng Trận đấu
        myUsedSkill: false,
        oppUsedSkill: false,
        destinyDrawUsed: false,
        freeBlueEyes: false,
        keithSkillUsed: false,
        marikSkillUsed: false,
        bakuraSkillUsed: false,
        arkanaSkillUsed: false,
        brothersSkillUsed: false,
        odionSkillCount: 0,
        alisterSkillUsed: false,
        noahSkillUsed: false,
        lumisSkillUsed: false,
        lumisLockTurns: 0,
        lumisLockedZone: null, // { side, type, index }
        zigfriedSkillUsed: false,
        zigfriedBanishList: [], // các quái thú triệu hồi bởi kỹ năng này
        parasiteInfested: false
    }
};

// Danh sách bài giới hạn (Limited - tối đa 1 lá, Semi-Limited - tối đa 2 lá)
const YGO_LIMITS = {
    // Limited (1 lá)
    'Exodia': 1, 'Pot of Greed': 1, 'Monster Reborn': 1, 'Raigeki': 1, 'Change of Heart': 1,
    'Hũ tham lam': 1, 'Phục sinh quái thú': 1, 'Lôi kích': 1, 'Thay đổi trái tim': 1,
    // Semi-Limited (2 lá)
    'Dark Hole': 2, 'Card Destruction': 2, 'Hố đen': 2, 'Hủy bài': 2
};

// Lấy giới hạn tối đa cho một lá bài dựa vào tên
function ygoGetCardLimit(cardName) {
    for (let key in YGO_LIMITS) {
        if (cardName.toLowerCase().includes(key.toLowerCase())) {
            return YGO_LIMITS[key];
        }
    }
    return 3; // Mặc định là tối đa 3 lá
}

// ── KHỞI TẠO GAME & LOBBY ──────────────────────────────────────────
window.openYugiohGame = function() {
    try {
        try { audio.play('click'); } catch(e){}
        document.getElementById('yugiohGameModal').style.display = 'block';
        
        // Chuẩn hóa toàn bộ thẻ bài trong database khi mở game
        if (window.YUGIOH_CARDS && Array.isArray(window.YUGIOH_CARDS)) {
            window.YUGIOH_CARDS.forEach(c => {
                if (c) {
                    if (!c.name_en && c.name) c.name_en = c.name;
                    if (!c.name && c.name_en) c.name = c.name_en;
                }
            });
        }
        
        // Load nhân vật đã chọn
        let savedChar = localStorage.getItem('ygo_char_save');
        if (savedChar && ygoCharacters[savedChar]) {
            ygoGame.myCharacter = savedChar;
        } else {
            ygoGame.myCharacter = 'yugi';
        }
        
        // Nạp bộ bài đã lưu từ LocalStorage hoặc gán starter deck
        ygoLoadMyDeck();
        
        // Khởi tạo giao diện các tab
        ygoSwitchLobbyTab('play');
        ygoRenderCharacters();
        
        ygoShowScreen('lobby');
        ygoRefreshPvpList();
    } catch (err) {
        console.error("Error opening Yu-Gi-Oh! Game:", err);
        alert("⚠️ Lỗi khởi tạo Bài Ma Thuật:\n" + err.message + "\n\nHãy tải lại trang (Ctrl + F5) hoặc kiểm tra lại!");
    }
};

function ygoCloseGame() {
    try { audio.play('click'); } catch(e){}
    document.getElementById('yugiohGameModal').style.display = 'none';
}

function ygoShowScreen(screenName) {
    ygoGame.currentScreen = screenName;
    document.getElementById('ygoLobbyScreen').style.display = screenName === 'lobby' ? 'block' : 'none';
    document.getElementById('ygoDeckScreen').style.display = screenName === 'deck' ? 'block' : 'none';
    document.getElementById('ygoDuelScreen').style.display = screenName === 'duel' ? 'block' : 'none';
}

// Biến lưu nhân vật đang xem chi tiết ở Chọn Nhân Vật
var ygoSelectedCharDetailId = 'yugi';

window.ygoSwitchLobbyTab = function(tabName) {
    try { audio.play('click'); } catch(e){}
    ygoGame.lobbyTab = tabName;
    
    document.getElementById('ygoLobbyTabPlay').style.display = tabName === 'play' ? 'block' : 'none';
    document.getElementById('ygoLobbyTabChar').style.display = tabName === 'char' ? 'block' : 'none';
    document.getElementById('ygoLobbyTabLimit').style.display = tabName === 'limit' ? 'block' : 'none';
    
    // CSS active tab button styling
    let btnPlay = document.getElementById('ygoLobbyTabPlayBtn');
    let btnChar = document.getElementById('ygoLobbyTabCharBtn');
    let btnLimit = document.getElementById('ygoLobbyTabLimitBtn');
    
    btnPlay.className = tabName === 'play' ? 'ygo-btn' : 'ygo-btn ygo-btn-secondary';
    btnPlay.style.background = tabName === 'play' ? 'linear-gradient(135deg, #d4af37, #aa7c11)' : '';
    
    btnChar.className = tabName === 'char' ? 'ygo-btn' : 'ygo-btn ygo-btn-secondary';
    btnChar.style.background = tabName === 'char' ? 'linear-gradient(135deg, #d4af37, #aa7c11)' : '';
    
    btnLimit.className = tabName === 'limit' ? 'ygo-btn' : 'ygo-btn ygo-btn-secondary';
    btnLimit.style.background = tabName === 'limit' ? 'linear-gradient(135deg, #d4af37, #aa7c11)' : '';
    
    if (tabName === 'play') {
        let activeChar = ygoCharacters[ygoGame.myCharacter] || ygoCharacters.yugi;
        document.getElementById('ygoLobbyActiveCharText').textContent = `Nhân vật hiện tại: ${activeChar.name}`;
    }
};

window.ygoRenderCharacters = function() {
    const grid = document.getElementById('ygoCharListGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    for (let charId in ygoCharacters) {
        let char = ygoCharacters[charId];
        let item = document.createElement('div');
        item.style.cssText = "padding:8px; background:#271610; border:2px solid #5a3d28; border-radius:8px; text-align:center; cursor:pointer; font-size:0.8rem; font-weight:bold; transition:all 0.2s;";
        
        let emoji = '👤';
        if (charId === 'yugi') emoji = '🔮';
        if (charId === 'kaiba') emoji = '🐉';
        if (charId === 'joey') emoji = '🗡️';
        if (charId === 'pegasus') emoji = '👁️';
        if (charId === 'marik') emoji = '💀';
        if (charId === 'bakura') emoji = '👻';
        if (charId === 'mai') emoji = '💅';
        if (charId === 'tea') emoji = '💖';
        if (charId === 'ishizu') emoji = '⛓️';
        
        if (ygoGame.myCharacter === charId) {
            item.style.borderColor = "#ea580c";
            item.style.background = "#3c1e15";
        }
        
        item.innerHTML = `
            <div style="font-size:1.5rem; margin-bottom:4px;">${emoji}</div>
            <div>${char.name}</div>
        `;
        item.onclick = () => ygoShowCharacterDetail(charId);
        grid.appendChild(item);
    }
    
    ygoShowCharacterDetail(ygoGame.myCharacter);
};

window.ygoShowCharacterDetail = function(charId) {
    let char = ygoCharacters[charId];
    if (!char) return;
    ygoSelectedCharDetailId = charId;
    
    let emoji = '👤';
    if (charId === 'yugi') emoji = '🔮';
    if (charId === 'kaiba') emoji = '🐉';
    if (charId === 'joey') emoji = '🗡️';
    if (charId === 'pegasus') emoji = '👁️';
    if (charId === 'marik') emoji = '💀';
    if (charId === 'bakura') emoji = '👻';
    if (charId === 'mai') emoji = '💅';
    if (charId === 'tea') emoji = '💖';
    if (charId === 'ishizu') emoji = '⛓️';
    
    document.getElementById('ygoCharDetailAvatar').textContent = emoji;
    document.getElementById('ygoCharDetailName').textContent = char.name;
    
    let reqHTML = "<b>Bài yêu thích:</b><br>";
    char.requiredCards.forEach(c => {
        let cleanName = c.replace(/_/g, ' ');
        cleanName = cleanName.replace(/\b\w/g, l => l.toUpperCase());
        reqHTML += `<span style="display:inline-block; font-size:0.68rem; background:rgba(0,0,0,0.4); padding:2px 5px; border-radius:4px; margin-right:4px; margin-bottom:3px; border:1px solid #78350f;">🃏 ${cleanName}</span>`;
    });
    document.getElementById('ygoCharDetailReq').innerHTML = reqHTML;
    
    document.getElementById('ygoCharDetailSkillName').textContent = `Kỹ năng: ${char.skillName}`;
    document.getElementById('ygoCharDetailSkillDesc').textContent = char.skillDesc;
    
    let selectBtn = document.getElementById('ygoCharSelectBtn');
    if (ygoGame.myCharacter === charId) {
        selectBtn.textContent = "ĐANG CHỌN VAI NÀY";
        selectBtn.style.background = "#475569";
        selectBtn.style.borderColor = "#64748b";
        selectBtn.disabled = true;
    } else {
        selectBtn.textContent = "CHỌN VAI NÀY";
        selectBtn.style.background = "linear-gradient(135deg,#f97316,#d97706)";
        selectBtn.style.borderColor = "#fff";
        selectBtn.disabled = false;
    }
    
    const gridItems = document.getElementById('ygoCharListGrid').children;
    let idx = 0;
    for (let cid in ygoCharacters) {
        let el = gridItems[idx];
        if (el) {
            if (cid === charId) {
                el.style.borderColor = "#ea580c";
                el.style.background = "#3c1e15";
            } else if (cid === ygoGame.myCharacter) {
                el.style.borderColor = "#ea580c";
                el.style.background = "#3c1e15";
            } else {
                el.style.borderColor = "#5a3d28";
                el.style.background = "#271610";
            }
        }
        idx++;
    }
};

window.ygoSelectCharacterAct = function() {
    try { audio.play('levelup'); } catch(e){}
    ygoGame.myCharacter = ygoSelectedCharDetailId;
    localStorage.setItem('ygo_char_save', ygoSelectedCharDetailId);
    showToast(`✅ Đã chọn vai chơi: ${ygoCharacters[ygoSelectedCharDetailId].name}!`);
    ygoRenderCharacters();
};

// Tải bộ bài của tôi
function ygoLoadMyDeck() {
    let saved = localStorage.getItem('ygo_deck_save');
    if (saved) {
        try {
            ygoGame.myDeck = JSON.parse(saved);
            if (!Array.isArray(ygoGame.myDeck)) {
                ygoGame.myDeck = [];
            }
        } catch (e) {
            ygoGame.myDeck = [];
        }
    } else {
        ygoGame.myDeck = [];
    }
    
    // Normalize cards in myDeck (ensuring both name and name_en exist)
    ygoGame.myDeck.forEach(c => {
        if (c) {
            if (!c.name_en && c.name) c.name_en = c.name;
            if (!c.name && c.name_en) c.name = c.name_en;
        }
    });
    
    // Nếu chưa có bài, cấp Starter Deck tự động
    if (!ygoGame.myDeck || !Array.isArray(ygoGame.myDeck) || ygoGame.myDeck.length < 40) {
        ygoCreateStarterDeck();
    }
}

// Tạo Starter Deck từ kho bài có sẵn
// Hàm phụ trợ xây dựng bộ bài có tỉ lệ cân bằng (Main Deck 40 lá, Extra Deck riêng)
function ygoBuildBalancedDeck(initialCards, pool) {
    let mainDeck = [];
    let extraDeck = [];
    
    const isLowLevelMonster = (c) => c.card_type === 'Monster' && (c.level_rank === null || c.level_rank === undefined || parseInt(c.level_rank) <= 4 || isNaN(parseInt(c.level_rank)));
    const isHighLevelMonster = (c) => c.card_type === 'Monster' && c.level_rank !== null && c.level_rank !== undefined && parseInt(c.level_rank) >= 5;
    const isExtraMonster = (c) => {
        let mt = (c.monster_type || '').toLowerCase();
        return c.card_type === 'Monster' && (mt.includes('fusion') || mt.includes('synchro') || mt.includes('xyz') || mt.includes('link'));
    };
    
    // Phân loại các lá ban đầu
    initialCards.forEach(c => {
        if (isExtraMonster(c)) {
            if (extraDeck.length < 15) extraDeck.push(c);
        } else {
            if (mainDeck.length < 40) mainDeck.push(c);
        }
    });
    
    // Trộn ngẫu nhiên pool bài để lấy ngẫu nhiên
    let shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    
    // Nạp đầy Extra Deck lên 8-10 lá nếu có chỗ
    if (extraDeck.length < 10) {
        for (let card of shuffledPool) {
            if (extraDeck.length >= 10) break;
            if (isExtraMonster(card)) {
                let limit = ygoGetCardLimit(card.name_en);
                let count = extraDeck.filter(c => c.name_en === card.name_en).length;
                if (count < limit) {
                    extraDeck.push(card);
                }
            }
        }
    }
    
    // Nạp đầy Main Deck lên đúng 40 lá với tỉ lệ cân bằng
    // Mục tiêu: 18 quái thú level 1-4, 5 quái thú tế phẩm level 5+, 10 phép, 7 bẫy
    let lowMonsters = mainDeck.filter(isLowLevelMonster);
    let highMonsters = mainDeck.filter(isHighLevelMonster);
    let spells = mainDeck.filter(c => c.card_type === 'Spell');
    let traps = mainDeck.filter(c => c.card_type === 'Trap');
    
    for (let card of shuffledPool) {
        if (mainDeck.length >= 40) break;
        if (isExtraMonster(card)) continue;
        
        let limit = ygoGetCardLimit(card.name_en);
        let count = mainDeck.filter(c => c.name_en === card.name_en).length;
        if (count >= limit) continue;
        
        if (isLowLevelMonster(card) && lowMonsters.length < 18) {
            mainDeck.push(card);
            lowMonsters.push(card);
        } else if (isHighLevelMonster(card) && highMonsters.length < 5) {
            mainDeck.push(card);
            highMonsters.push(card);
        } else if (card.card_type === 'Spell' && spells.length < 10) {
            mainDeck.push(card);
            spells.push(card);
        } else if (card.card_type === 'Trap' && traps.length < 7) {
            mainDeck.push(card);
            traps.push(card);
        }
    }
    
    // Dự phòng: Nếu vẫn chưa đủ 40 lá, lấp đầy bằng bài bất kỳ không phải Extra Deck
    for (let card of shuffledPool) {
        if (mainDeck.length >= 40) break;
        if (isExtraMonster(card)) continue;
        
        let limit = ygoGetCardLimit(card.name_en);
        let count = mainDeck.filter(c => c.name_en === card.name_en).length;
        if (count < limit) {
            mainDeck.push(card);
        }
    }
    
    return mainDeck.concat(extraDeck);
}

// Tạo Starter Deck từ kho bài có sẵn
function ygoCreateStarterDeck() {
    let pool = window.YUGIOH_CARDS || [];
    if (!pool.length) return;
    
    // Chọn các lá bài đặc trưng
    let targetCards = [
        'Dark Magician', 'Celtic Guardian', 'Summoned Skull', 'Giant Soldier of Stone', 'Kuriboh',
        'Baby Dragon', 'Time Wizard', 'Monster Reborn', 'Pot of Greed', 'Raigeki', 'Mirror Force',
        'Axe Raider', 'Feral Imp', 'Mystical Elf', 'Silver Fang', 'Trap Hole'
    ];
    
    let initialCards = [];
    targetCards.forEach(tc => {
        let found = pool.find(c => c.name_en.toLowerCase().includes(tc.toLowerCase()) || c.name_vi.toLowerCase().includes(tc.toLowerCase()));
        if (found) {
            initialCards.push(found);
        }
    });
    
    ygoGame.myDeck = ygoBuildBalancedDeck(initialCards, pool);
    localStorage.setItem('ygo_deck_save', JSON.stringify(ygoGame.myDeck));
}

window.ygoResetToStarterDeck = function() {
    if (confirm("Bạn có chắc chắn muốn khôi phục bộ bài về Starter Deck mặc định (tỉ lệ cân bằng) không? Bộ bài hiện tại sẽ bị xóa.")) {
        ygoCreateStarterDeck();
        ygoLoadMyDeck();
        ygoOpenDeckBuilder(); // Làm mới giao diện
        showToast("🔄 Đã khôi phục Starter Deck thành công!");
    }
};

// ── DECK BUILDER ────────────────────────────────────────────────────
var ygoFilteredWarehouse = [];

window.ygoOpenDeckBuilder = function() {
    try { audio.play('click'); } catch(e){}
    ygoLoadMyDeck();
    ygoShowScreen('deck');
    
    ygoFilteredWarehouse = window.YUGIOH_CARDS || [];
    ygoRenderWarehouse();
    ygoRenderDeck();
};

window.ygoCloseDeckBuilder = function() {
    try { audio.play('click'); } catch(e){}
    ygoShowScreen('lobby');
};

function ygoRenderWarehouse() {
    const container = document.getElementById('ygoWarehouseContainer');
    if (!container) return;
    container.innerHTML = '';
    
    ygoFilteredWarehouse.forEach(card => {
        const div = document.createElement('div');
        // Phân loại class CSS theo Card Type
        let typeClass = 'monster';
        if (card.card_type === 'Spell') typeClass = 'spell';
        if (card.card_type === 'Trap') typeClass = 'trap';
        
        div.className = `ygo-mini-card ${typeClass}`;
        div.title = `${card.name_vi} (${card.name_en})\n${card.card_type}\nATK: ${card.atk || '---'} / DEF: ${card.def || '---'}\n\nHiệu ứng: ${card.anime_effect_vi || 'Không có'}`;
        
        // Thống kê giới hạn số lượng bài để hiển thị badge
        let limit = ygoGetCardLimit(card.name_en);
        let limitBadge = limit < 3 ? `<span class="ygo-zone-badge" style="background:#ea580c; top:2px; right:2px;">${limit}</span>` : '';
        
        div.innerHTML = `
            ${limitBadge}
            <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${card.name_vi}</div>
            <div style="font-size:0.48rem; color:#fcd34d;">${card.atk !== null ? `A:${card.atk}` : card.property || card.card_type}</div>
        `;
        
        div.onclick = () => ygoAddCardToDeck(card);
        container.appendChild(div);
    });
}

function ygoRenderDeck() {
    const container = document.getElementById('ygoDeckContainer');
    const countSpan = document.getElementById('ygoDeckCount');
    if (!container || !countSpan) return;
    
    countSpan.textContent = ygoGame.myDeck.length;
    container.innerHTML = '';
    
    // Group các lá bài trùng tên để hiển thị số lượng gọn gàng
    let grouped = {};
    ygoGame.myDeck.forEach(card => {
        if (!grouped[card.name_en]) {
            grouped[card.name_en] = { card: card, qty: 0 };
        }
        grouped[card.name_en].qty++;
    });
    
    // Sắp xếp quái thú trước, phép sau, bẫy cuối cùng
    let sortedList = Object.values(grouped).sort((a,b) => {
        let typeWeight = { 'Monster': 1, 'Spell': 2, 'Trap': 3 };
        let wa = typeWeight[a.card.card_type] || 4;
        let wb = typeWeight[b.card.card_type] || 4;
        return wa - wb;
    });
    
    sortedList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'ygo-deck-row';
        let color = '#d4af37';
        if (item.card.card_type === 'Spell') color = '#10b981';
        if (item.card.card_type === 'Trap') color = '#ec4899';
        
        div.style.borderLeft = `4px solid ${color}`;
        div.innerHTML = `
            <span style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${item.card.name_vi}</span>
            <span style="color:#fbbf24; font-weight:bold;">x${item.qty}</span>
        `;
        
        div.onclick = () => ygoRemoveCardFromDeck(item.card);
        container.appendChild(div);
    });
}

function ygoAddCardToDeck(card) {
    if (ygoGame.myDeck.length >= 60) {
        showToast("⚠️ Bộ bài tối đa chỉ được chứa 60 lá!");
        return;
    }
    
    // Kiểm tra giới hạn của lá bài này
    let limit = ygoGetCardLimit(card.name_en);
    let currentQty = ygoGame.myDeck.filter(c => c.name_en === card.name_en).length;
    if (currentQty >= limit) {
        showToast(`⚠️ Lá bài này bị giới hạn tối đa ${limit} bản sao trong Deck!`);
        return;
    }
    
    try { audio.play('click'); } catch(e){}
    ygoGame.myDeck.push(card);
    ygoRenderDeck();
}

function ygoRemoveCardFromDeck(card) {
    let idx = ygoGame.myDeck.findIndex(c => c.name_en === card.name_en);
    if (idx !== -1) {
        try { audio.play('click'); } catch(e){}
        ygoGame.myDeck.splice(idx, 1);
        ygoRenderDeck();
    }
}

window.ygoFilterCards = function() {
    let search = document.getElementById('ygoSearchInput').value.toLowerCase();
    let type = document.getElementById('ygoTypeFilter').value;
    
    ygoFilteredWarehouse = (window.YUGIOH_CARDS || []).filter(c => {
        let matchesSearch = c.name_en.toLowerCase().includes(search) || c.name_vi.toLowerCase().includes(search);
        let matchesType = type === 'all' || c.card_type === type;
        return matchesSearch && matchesType;
    });
    
    ygoRenderWarehouse();
};

window.ygoSaveDeck = function() {
    if (ygoGame.myDeck.length < 40) {
        showToast("⚠️ Bộ bài phải có tối thiểu 40 lá để thi đấu!");
        return;
    }
    
    try { audio.play('levelup'); } catch(e){}
    localStorage.setItem('ygo_deck_save', JSON.stringify(ygoGame.myDeck));
    showToast("✅ Đã lưu bộ bài thành công!");
    ygoShowScreen('lobby');
};

// ── PVE BOT DECKS GENERATOR ──────────────────────────────────────────
// Tạo bộ bài đặc trưng cho Bot dựa trên cơ sở dữ liệu cào được
function ygoGenerateBotDeck(botType) {
    let pool = window.YUGIOH_CARDS || [];
    
    let keywords = [];
    if (botType === 'yugi') {
        keywords = ['Magician', 'Dark', 'Summoned Skull', 'Celtic', 'Elf', 'Gaia', 'Kuriboh', 'Stone', 'Buster', 'Mirror Force', 'Reborn', 'Hũ tham lam'];
    } else if (botType === 'kaiba') {
        keywords = ['Blue-Eyes', 'Dragon', 'Vorse', 'Ox', 'Ring of', 'Kaiser', 'La Jinn', 'Shrink', 'Trap Hole'];
    } else if (botType === 'joey') {
        keywords = ['Red-Eyes', 'Flame Swordsman', 'Gearfried', 'Baby Dragon', 'Time Wizard', 'Landstar', 'Kunai', 'Shield'];
    } else { // pegasus
        keywords = ['Toon', 'Relinquished', 'Illusion', 'Ritual', 'Eyes Limit', 'Toon World'];
    }
    
    // Gom các lá bài chứa từ khóa
    let matching = pool.filter(c => keywords.some(k => c.name_en.toLowerCase().includes(k.toLowerCase()) || c.name_vi.toLowerCase().includes(k.toLowerCase())));
    
    // Tạo bộ bài có tỉ lệ cân bằng từ danh sách lá đặc trưng của Bot
    return ygoBuildBalancedDeck(matching, pool);
}

// ── DUELING ENGINE (PVE & PVP) ───────────────────────────────────────
window.ygoStartBotGame = function() {
    if (ygoGame.myDeck.length < 40) {
        showToast("⚠️ Hãy chỉnh sửa bộ bài để đủ tối thiểu 40 lá trước!");
        return;
    }
    
    let botType = document.getElementById('ygoBotSelector').value;
    let botDeck = ygoGenerateBotDeck(botType);
    let botNames = { 'yugi': 'Yugi Muto', 'kaiba': 'Seto Kaiba', 'joey': 'Joey Wheeler', 'pegasus': 'Pegasus', 'weevil': 'Weevil Underwood', 'rex': 'Rex Raptor' };
    
    ygoGame.oppCharacter = botType; // Set bot character properly
    
    // Tách Extra Deck người chơi
    let playerMainDeck = [];
    let playerExtraDeck = [];
    ygoGame.myDeck.forEach(c => {
        let mt = (c.monster_type || '').toLowerCase();
        if (c.card_type === 'Monster' && (mt.includes('fusion') || mt.includes('synchro') || mt.includes('xyz') || mt.includes('link'))) {
            playerExtraDeck.push(c);
        } else {
            playerMainDeck.push(c);
        }
    });

    // Tách Extra Deck bot
    let botMainDeck = [];
    let botExtraDeck = [];
    botDeck.forEach(c => {
        let mt = (c.monster_type || '').toLowerCase();
        if (c.card_type === 'Monster' && (mt.includes('fusion') || mt.includes('synchro') || mt.includes('xyz') || mt.includes('link'))) {
            botExtraDeck.push(c);
        } else {
            botMainDeck.push(c);
        }
    });
    
    ygoGame.duel = {
        mode: 'pve',
        opponentId: null,
        opponentName: botNames[botType] || 'Bot Thủ',
        playerLP: 8000,
        oppLP: 8000,
        playerHand: [],
        oppHand: [],
        playerDeck: playerMainDeck,
        oppDeck: botMainDeck,
        playerExtraDeck: playerExtraDeck,
        oppExtraDeck: botExtraDeck,
        playerGY: [],
        oppGY: [],
        playerMonsters: [null, null, null, null, null],
        playerSpells: [null, null, null, null, null],
        oppMonsters: [null, null, null, null, null],
        oppSpells: [null, null, null, null, null],
        playerFieldSpell: null,
        oppFieldSpell: null,
        
        turn: Math.random() < 0.5 ? 'player' : 'opponent',
        phase: 'DRAW',
        hasNormalSummoned: false,
        selectedHandIndex: null,
        selectedZoneIndex: null,
        selectedFieldCard: null,
        logs: [],
        turnCount: 1,
        
        // Chain Link & Priority
        chainStack: [],
        chainActive: false,
        prioritySide: 'player',
        consecutivePasses: 0,
        chainSelectionInProgress: false,
        
        // Tribute selection
        tributeSelectionInProgress: false,
        tributeNeeded: 0,
        tributeSelectedIndices: [],
        tributeSummonCard: null,
        tributeSummonPosition: null,
        selectedSummonZoneIdx: null,
        
        // Stolen
        changeOfHeartStolen: null,
        zigfriedBanishList: []
    };
    
    // Weevil Underwood's Parasite Paracide skill trigger:
    const parasiteCard = {
        name_en: "Parasite Paracide",
        name_vi: "Ký Sinh Trùng Kẻ Gây Hại",
        card_type: "Monster",
        attribute: "EARTH",
        monster_type: "Insect / Effect",
        level_rank: 2,
        atk: "500",
        def: "3000",
        anime_effect_en: "When drawn: take 1000 LP damage, and all your face-up monsters become Insect-Type.",
        anime_effect_vi: "Khi rút được: trừ 1000 LP người rút, biến toàn bộ quái trên sân của họ thành Côn trùng."
    };

    if (ygoGame.oppCharacter === 'weevil') {
        ygoGame.duel.playerDeck.splice(Math.floor(ygoGame.duel.playerDeck.length / 3), 0, {...parasiteCard});
        ygoGame.duel.playerDeck.splice(Math.floor(ygoGame.duel.playerDeck.length * 2 / 3), 0, {...parasiteCard});
    }
    if (ygoGame.myCharacter === 'weevil') {
        ygoGame.duel.oppDeck.splice(Math.floor(ygoGame.duel.oppDeck.length / 3), 0, {...parasiteCard});
        ygoGame.duel.oppDeck.splice(Math.floor(ygoGame.duel.oppDeck.length * 2 / 3), 0, {...parasiteCard});
    }
    
    // Shuffle hai bộ bài
    ygoShuffle(ygoGame.duel.playerDeck);
    ygoShuffle(ygoGame.duel.oppDeck);
    
    // Rút 5 lá khởi đầu cho mỗi bên
    for (let i = 0; i < 5; i++) {
        ygoDrawCard('player');
        ygoDrawCard('opponent');
    }
    
    ygoShowScreen('duel');
    document.getElementById('oppNameDisplay').textContent = ygoGame.duel.opponentName;
    document.getElementById('ygoMyCharDisplay').textContent = ygoCharacters[ygoGame.myCharacter]?.name || 'Yugi Muto';
    
    ygoLog("⚔️ TRẬN ĐẤU BẮT ĐẦU!");
    ygoLog(`👤 Đối thủ: ${ygoGame.duel.opponentName}`);
    ygoLog(`⭐ Đi trước: ${ygoGame.duel.turn === 'player' ? 'BẠN' : 'ĐỐI THỦ'}`);
    
    ygoRenderField();
    ygoUpdateLP();
    
    // Khởi động Central State Machine ở DRAW phase
    ygoStartPhase('DRAW');
};

function ygoShuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function ygoDrawCard(side) {
    let d = ygoGame.duel;
    let deck = side === 'player' ? d.playerDeck : d.oppDeck;
    let hand = side === 'player' ? d.playerHand : d.oppHand;
    
    if (deck.length === 0) {
        ygoLog(`💀 ${side === 'player' ? 'Bạn' : 'Đối thủ'} đã hết bài để rút!`);
        ygoEndGame(side === 'player' ? 'opponent' : 'player');
        return;
    }
    
    let card = deck.pop();
    
    // Weevil Parasite Paracide Draw Trigger
    if (card.name_en === "Parasite Paracide") {
        if (side === 'player') {
            ygoLog(`💥 [KÝ SINH TRÙNG] Bạn rút trúng Parasite Paracide! Mất 1000 LP và quái thú biến thành Côn Trùng!`);
            ygoDamagePlayer(1000, "ký sinh trùng");
            d.playerMonsters.forEach(m => {
                if (m) {
                    m.monster_type = "Insect";
                    m.name_vi = "Côn trùng ký sinh";
                }
            });
            d.playerGY.push(card);
        } else {
            ygoLog(`💥 [KÝ SINH TRÙNG] Đối thủ rút trúng Parasite Paracide! Mất 1000 LP và quái thú biến thành Côn Trùng!`);
            ygoDamageOpponent(1000, "ký sinh trùng");
            d.oppMonsters.forEach(m => {
                if (m) {
                    m.monster_type = "Insect";
                    m.name_vi = "Côn trùng ký sinh";
                }
            });
            d.oppGY.push(card);
        }
    } else {
        hand.push(card);
        if(side === 'player') {
            ygoLog(`📥 Bạn rút được lá bài: ${card.name_vi}`);
        }
    }
}

function ygoLog(msg) {
    let d = ygoGame.duel;
    d.logs.push(msg);
    if(d.logs.length > 50) d.logs.shift();
    
    const consoleEl = document.getElementById('ygoDuelLog');
    if(consoleEl) {
        consoleEl.innerHTML = d.logs.map(l => `<p style="margin:2px 0;">${l}</p>`).join('');
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
}

function ygoUpdateLP() {
    let d = ygoGame.duel;
    document.getElementById('playerLP').textContent = d.playerLP;
    document.getElementById('oppLP').textContent = d.oppLP;
}

// Render toàn bộ bàn đấu bài
window.ygoRenderField = function() {
    let d = ygoGame.duel;
    
    // 1. Render Bài Trên Tay Người Chơi
    const handContainer = document.getElementById('playerHand');
    if (handContainer) {
        handContainer.innerHTML = '';
        d.playerHand.forEach((card, idx) => {
            const div = document.createElement('div');
            let typeClass = 'monster';
            if (card.card_type === 'Spell') typeClass = 'spell';
            if (card.card_type === 'Trap') typeClass = 'trap';
            
            div.className = `ygo-mini-card ${typeClass}`;
            if (d.selectedHandIndex === idx) {
                div.style.borderColor = '#fbbf24';
                div.style.boxShadow = '0 0 8px #fbbf24';
            }
            
            div.innerHTML = `
                <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${card.name_vi}</div>
                <div style="font-size:0.48rem; color:#fcd34d;">${card.atk !== null ? `A:${card.atk}` : card.card_type}</div>
            `;
            
            div.onmouseover = () => ygoHoverCard(card);
            div.onclick = () => ygoSelectHand(idx);
            handContainer.appendChild(div);
        });
    }
    
    // 1.5. Render Bài Trên Tay Đối Thủ (Bot hoặc PVP)
    const oppHandContainer = document.getElementById('oppHand');
    if (oppHandContainer) {
        oppHandContainer.innerHTML = '';
        d.oppHand.forEach((card, idx) => {
            const div = document.createElement('div');
            let isRevealed = false;
            let typeClass = 'monster';
            let cardText = "ÚP";
            let atkText = "";

            if (ygoGame.myCharacter === 'ishizu') {
                isRevealed = true;
            } else if (ygoGame.myCharacter === 'espa_roba' && card && card.card_type === 'Trap') {
                isRevealed = true;
            }
            
            if (isRevealed && card && card.name_vi) {
                if (card.card_type === 'Spell') typeClass = 'spell';
                if (card.card_type === 'Trap') typeClass = 'trap';
                cardText = card.name_vi;
                atkText = card.atk !== null ? `A:${card.atk}` : card.card_type;
            }

            div.className = `ygo-mini-card ${isRevealed ? typeClass : ''}`;
            div.style.width = '55px';
            div.style.height = '75px';
            div.style.minHeight = '75px';
            div.style.flexShrink = '0';
            
            if (!isRevealed) {
                div.style.background = 'linear-gradient(135deg, #4c0519, #881337)'; // YGO card back colors
                div.style.borderColor = '#fb7185';
                div.style.cursor = 'default';
                div.innerHTML = `
                    <div style="font-weight:bold; color:#fecdd3; display:flex; align-items:center; justify-content:center; height:100%; font-size: 0.65rem;">YGO</div>
                `;
            } else {
                div.innerHTML = `
                    <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.5rem; line-height:1.2;">${cardText}</div>
                    <div style="font-size:0.42rem; color:#fcd34d;">${atkText}</div>
                `;
                div.onmouseover = () => ygoHoverCard(card);
            }
            oppHandContainer.appendChild(div);
        });
    }
    
    // 2. Render Vùng Quái Thú Player
    const pFront = document.getElementById('playerFrontrow');
    if(pFront) {
        pFront.innerHTML = d.playerMonsters.map((c, i) => {
            if(c) {
                let isFaceUp = c.faceUp !== false;
                let posText = c.position === 'defense' ? (isFaceUp ? 'DEF' : 'ÚP DEF') : 'ATK';
                let statVal = c.position === 'defense' ? (c.currentDef || c.def) : (c.currentAtk || c.atk);
                
                let isSelected = d.selectedFieldCard && d.selectedFieldCard.side === 'player' && d.selectedFieldCard.type === 'monster' && d.selectedFieldCard.pos === i;
                
                let borderStyle = '';
                if (isSelected) {
                    borderStyle = 'border-color: #fbbf24; box-shadow: 0 0 8px #fbbf24;';
                } else if (d.tributeSelectionInProgress && d.tributeSelectedIndices.includes(i)) {
                    borderStyle = 'border-color: #ef4444; box-shadow: 0 0 12px #ef4444;'; // hiến tế đỏ
                } else if (c.position === 'defense') {
                    borderStyle = 'border-color: #3b82f6;';
                }
                
                let rotationStyle = c.position === 'defense' ? 'transform: rotate(90deg);' : '';
                let imgUrl = ygoGetCardImage(c);
                
                // Owner can inspect set monsters, but let's tint them dark red/purple to show they are set
                let bgStyle = isFaceUp
                    ? `background: linear-gradient(rgba(10,8,6,0.65), rgba(10,8,6,0.65)), url('${imgUrl}') center/cover no-repeat;`
                    : `background: linear-gradient(rgba(76,5,25,0.75), rgba(76,5,25,0.75)), url('${imgUrl}') center/cover no-repeat;`;
                
                return `<div class="ygo-zone active-card" style="${rotationStyle} ${borderStyle} ${bgStyle}" onclick="ygoZoneClick('player', 'monster', ${i})" onmouseover="ygoHoverCardById('player', 'monster', ${i})">
                    <span style="font-size:0.6rem;font-weight:bold;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%; text-shadow: 1px 1px 2px black;">${c.name_vi}</span>
                    <span style="color:#fcd34d;font-size:0.5rem;margin-top:3px; text-shadow: 1px 1px 2px black;">${posText} ${statVal}</span>
                </div>`;
            }
            return `<div class="ygo-zone" onclick="ygoZoneClick('player', 'monster', ${i})">Monster ${i+1}</div>`;
        }).join('');
    }
    
    // 3. Render Vùng Phép/Bẫy Player
    const pBack = document.getElementById('playerBackrow');
    if(pBack) {
        pBack.innerHTML = d.playerSpells.map((c, i) => {
            if(c) {
                let isSelected = d.selectedFieldCard && d.selectedFieldCard.side === 'player' && d.selectedFieldCard.type === 'spell' && d.selectedFieldCard.pos === i;
                let borderStyle = isSelected ? 'border-color: #fbbf24; box-shadow: 0 0 8px #fbbf24;' : 'border-color:#10b981;';
                let statusText = c.faceUp ? "NGỬA" : "ÚP";
                let imgUrl = ygoGetCardImage(c);
                let bgStyle = c.faceUp 
                    ? `background: linear-gradient(rgba(10,8,6,0.65), rgba(10,8,6,0.65)), url('${imgUrl}') center/cover no-repeat;`
                    : `background: linear-gradient(rgba(76,5,25,0.75), rgba(76,5,25,0.75)), url('${imgUrl}') center/cover no-repeat;`;
                
                return `<div class="ygo-zone active-card" style="${borderStyle} ${bgStyle}" onclick="ygoZoneClick('player', 'spell', ${i})" onmouseover="ygoHoverCardById('player', 'spell', ${i})">
                    <span style="font-size:0.6rem;font-weight:bold;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%; text-shadow: 1px 1px 2px black;">${c.name_vi}</span>
                    <span style="font-size:0.48rem;color:#cbd5e1; text-shadow: 1px 1px 2px black;">${statusText}</span>
                </div>`;
            }
            return `<div class="ygo-zone" onclick="ygoZoneClick('player', 'spell', ${i})">S/T ${i+1}</div>`;
        }).join('');
    }

    // 4. Render Vùng Quái Thú Đối thủ (Bot)
    const oFront = document.getElementById('oppFrontrow');
    if(oFront) {
        let isPegasus = (ygoGame.myCharacter === 'pegasus');
        oFront.innerHTML = d.oppMonsters.map((c, i) => {
            if(c) {
                let reveal = (c.faceUp !== false) || isPegasus;
                let posText = c.position === 'defense' ? 'DEF' : 'ATK';
                let statVal = c.position === 'defense' ? (c.currentDef || c.def) : (c.currentAtk || c.atk);
                let rotationStyle = c.position === 'defense' ? 'transform: rotate(90deg); border-color: #3b82f6;' : '';
                if (reveal) {
                    let imgUrl = ygoGetCardImage(c);
                    let bgStyle = `background: linear-gradient(rgba(10,8,6,0.65), rgba(10,8,6,0.65)), url('${imgUrl}') center/cover no-repeat;`;
                    return `<div class="ygo-zone active-card" style="${rotationStyle} ${bgStyle}" onclick="ygoZoneClick('opponent', 'monster', ${i})" onmouseover="ygoHoverCardById('opponent', 'monster', ${i})">
                        <span style="font-size:0.6rem;font-weight:bold;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%; text-shadow: 1px 1px 2px black;">${c.name_vi}</span>
                        <span style="color:#fcd34d;font-size:0.5rem;margin-top:3px; text-shadow: 1px 1px 2px black;">${posText} ${statVal}</span>
                    </div>`;
                } else {
                    return `<div class="ygo-zone active-card" style="${rotationStyle} background:linear-gradient(135deg, #4c0519, #881337); border-color:#fb7185;" onclick="ygoZoneClick('opponent', 'monster', ${i})" onmouseover="ygoHoverCardById('opponent', 'monster', ${i})">
                        <span style="font-size:0.6rem;font-weight:bold;color:#fecdd3;">ÚP DEF</span>
                    </div>`;
                }
            }
            return `<div class="ygo-zone" onclick="ygoZoneClick('opponent', 'monster', ${i})">Monster ${i+1}</div>`;
        }).join('');
    }
    
    // 5. Render Vùng Phép/Bẫy Đối thủ (Bot)
    const oBack = document.getElementById('oppBackrow');
    if(oBack) {
        let isPegasus = (ygoGame.myCharacter === 'pegasus');
        let isEspa = (ygoGame.myCharacter === 'espa_roba');
        
        oBack.innerHTML = d.oppSpells.map((c, i) => {
            if(c) {
                let reveal = (c.faceUp !== false) || isPegasus || (isEspa && c.card_type === 'Trap');
                if (reveal) {
                    let imgUrl = ygoGetCardImage(c);
                    let bgStyle = `background: linear-gradient(rgba(10,8,6,0.65), rgba(10,8,6,0.65)), url('${imgUrl}') center/cover no-repeat;`;
                    return `<div class="ygo-zone active-card" style="border-color:#be185d; ${bgStyle}" onclick="ygoZoneClick('opponent', 'spell', ${i})" onmouseover="ygoHoverCardById('opponent', 'spell', ${i})">
                        <span style="font-size:0.55rem;font-weight:bold;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%; text-shadow: 1px 1px 2px black;">${c.name_vi}</span>
                        <span style="font-size:0.45rem;color:#e879f9; text-shadow: 1px 1px 2px black;">${c.card_type === 'Trap' ? 'BẪY' : 'PHÉP'}</span>
                    </div>`;
                }
                return `<div class="ygo-zone active-card" style="border-color:#be185d; background:linear-gradient(135deg, #4c0519, #881337);" onmouseover="ygoHoverCardById('opponent', 'spell', ${i})">
                    <span style="font-size:0.6rem; color:#fecdd3;">ÚP</span>
                </div>`;
            }
            return `<div class="ygo-zone" onclick="ygoZoneClick('opponent', 'spell', ${i})">S/T ${i+1}</div>`;
        }).join('');
    }

    // 6. Render Vùng Môi Trường (Field Spell Zone)
    const pFieldSpellZone = document.getElementById('playerFieldSpellZone');
    if (pFieldSpellZone) {
        if (d.playerFieldSpell) {
            let c = d.playerFieldSpell;
            let isSelected = d.selectedFieldCard && d.selectedFieldCard.side === 'player' && d.selectedFieldCard.type === 'fieldspell';
            let borderStyle = isSelected ? 'border-color: #fbbf24; box-shadow: 0 0 8px #fbbf24;' : 'border-color:#10b981;';
            let imgUrl = ygoGetCardImage(c);
            let bgStyle = `background: linear-gradient(rgba(10,8,6,0.65), rgba(10,8,6,0.65)), url('${imgUrl}') center/cover no-repeat;`;
            pFieldSpellZone.className = "ygo-zone active-card";
            pFieldSpellZone.style.cssText = borderStyle + " " + bgStyle;
            pFieldSpellZone.innerHTML = `
                <span style="font-size:0.55rem;font-weight:bold;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%; text-shadow: 1px 1px 2px black;">${c.name_vi}</span>
                <span style="font-size:0.45rem;color:#a7f3d0; text-shadow: 1px 1px 2px black;">FIELD</span>
            `;
            pFieldSpellZone.onmouseover = () => ygoHoverCard(c);
            pFieldSpellZone.onclick = () => ygoZoneClick('player', 'fieldspell', 0);
        } else {
            pFieldSpellZone.className = "ygo-zone";
            pFieldSpellZone.style.borderColor = "";
            pFieldSpellZone.style.boxShadow = "";
            pFieldSpellZone.style.background = "";
            pFieldSpellZone.innerHTML = `<span style="font-size:0.5rem;">PLAY FIELD</span>`;
            pFieldSpellZone.onmouseover = null;
            pFieldSpellZone.onclick = () => ygoZoneClick('player', 'fieldspell', 0);
        }
    }

    const oFieldSpellZone = document.getElementById('oppFieldSpellZone');
    if (oFieldSpellZone) {
        if (d.oppFieldSpell) {
            let c = d.oppFieldSpell;
            let imgUrl = ygoGetCardImage(c);
            let bgStyle = `background: linear-gradient(rgba(10,8,6,0.65), rgba(10,8,6,0.65)), url('${imgUrl}') center/cover no-repeat;`;
            oFieldSpellZone.className = "ygo-zone active-card";
            oFieldSpellZone.style.borderColor = "#10b981";
            oFieldSpellZone.style.cssText = `border-color:#10b981; ${bgStyle}`;
            oFieldSpellZone.innerHTML = `
                <span style="font-size:0.55rem;font-weight:bold;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%; text-shadow: 1px 1px 2px black;">${c.name_vi}</span>
                <span style="font-size:0.45rem;color:#a7f3d0; text-shadow: 1px 1px 2px black;">FIELD</span>
            `;
            oFieldSpellZone.onmouseover = () => ygoHoverCard(c);
            oFieldSpellZone.onclick = () => ygoZoneClick('opponent', 'fieldspell', 0);
        } else {
            oFieldSpellZone.className = "ygo-zone";
            oFieldSpellZone.style.borderColor = "";
            oFieldSpellZone.style.background = "";
            oFieldSpellZone.innerHTML = `<span style="font-size:0.5rem;">OPP FIELD</span>`;
            oFieldSpellZone.onmouseover = null;
            oFieldSpellZone.onclick = () => ygoZoneClick('opponent', 'fieldspell', 0);
        }
    }

    // 7. Cập nhật các bộ đếm Deck, GY và Extra Deck
    const pExtraCountEl = document.querySelectorAll('#playerExtraCount');
    pExtraCountEl.forEach(el => el.textContent = d.playerExtraDeck ? d.playerExtraDeck.length : 0);
    const oExtraCountEl = document.querySelectorAll('#oppExtraCount');
    oExtraCountEl.forEach(el => el.textContent = d.oppExtraDeck ? d.oppExtraDeck.length : 0);
    
    const pDeckCountEl = document.getElementById('playerDeckCountDisplay');
    if (pDeckCountEl) pDeckCountEl.textContent = d.playerDeck ? d.playerDeck.length : 0;
    const oDeckCountEl = document.getElementById('oppDeckCountDisplay');
    if (oDeckCountEl) oDeckCountEl.textContent = d.oppDeck ? d.oppDeck.length : 0;
    
    const pGYCountEl = document.getElementById('playerGYCount');
    if (pGYCountEl) pGYCountEl.textContent = d.playerGY ? d.playerGY.length : 0;
    const oGYCountEl = document.getElementById('oppGYCount');
    if (oGYCountEl) oGYCountEl.textContent = d.oppGY ? d.oppGY.length : 0;

    // Hover xem lá bài trên cùng của Mộ bài (GY)
    const pGYZone = document.getElementById('playerGYZone');
    if (pGYZone) {
        if (d.playerGY && d.playerGY.length > 0) {
            let topGY = d.playerGY[d.playerGY.length - 1];
            pGYZone.style.cursor = 'pointer';
            pGYZone.onmouseover = () => ygoHoverCard(topGY);
        } else {
            pGYZone.onmouseover = null;
        }
    }
    const oGYZone = document.getElementById('oppGYZone');
    if (oGYZone) {
        if (d.oppGY && d.oppGY.length > 0) {
            let topGY = d.oppGY[d.oppGY.length - 1];
            oGYZone.style.cursor = 'pointer';
            oGYZone.onmouseover = () => ygoHoverCard(topGY);
        } else {
            oGYZone.onmouseover = null;
        }
    }
    
    ygoCheckAromaStrategy();
    if (typeof ygoCheckMillenniumNecklace === 'function') {
        ygoCheckMillenniumNecklace();
    }

    ygoRenderCardActions();
};

// Khởi tạo bộ nhớ cache ảnh bài bằng tên tiếng Anh chuẩn để tránh gọi API lặp lại
window.ygoImageCache = {};
try {
    let savedCache = localStorage.getItem('ygo_card_image_cache');
    if (savedCache) {
        window.ygoImageCache = JSON.parse(savedCache);
    }
} catch(e) {}

// Hàm lấy ảnh không đồng bộ từ YGOPRODECK API bằng tên tiếng Anh để phân giải ID
window.ygoFetchCardImageAsync = function(name) {
    if (!name) return;
    if (window.ygoImageCache[name]) return;
    
    window.ygoImageCache[name] = 'FETCHING';
    
    fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}`)
        .then(res => {
            if (!res.ok) throw new Error('Card not found');
            return res.json();
        })
        .then(json => {
            if (json && json.data && json.data[0] && json.data[0].card_images && json.data[0].card_images[0]) {
                let imgUrl = json.data[0].card_images[0].image_url;
                window.ygoImageCache[name] = imgUrl;
                try {
                    localStorage.setItem('ygo_card_image_cache', JSON.stringify(window.ygoImageCache));
                } catch(e) {}
                
                if (typeof ygoRenderField === 'function') ygoRenderField();
                
                if (window.ygoCurrentHoveredCard) {
                    let currentHoverName = window.ygoCurrentHoveredCard.name || window.ygoCurrentHoveredCard.name_en || '';
                    if (currentHoverName === name && typeof ygoHoverCard === 'function') {
                        ygoHoverCard(window.ygoCurrentHoveredCard);
                    }
                }
            } else {
                window.ygoImageCache[name] = 'NOT_FOUND';
            }
        })
        .catch(err => {
            console.warn(`[YGOPRODECK API] Không tìm thấy ảnh cho: ${name}. Sử dụng fallback.`, err);
            window.ygoImageCache[name] = `https://images.ygoprodeck.com/images/cards/${encodeURIComponent(name)}.jpg`;
        });
};

window.ygoGetCardImage = function(card) {
    if (!card) return '';
    
    if (!card.name_en && card.name) card.name_en = card.name;
    if (!card.name && card.name_en) card.name = card.name_en;
    
    let isAnimeExclusive = false;
    if (card.anime_exclusive === 1 || card.anime_exclusive === true) {
        isAnimeExclusive = true;
    } else {
        for (let key in card) {
            if (card.hasOwnProperty(key) && typeof card[key] === 'string') {
                if (card[key].toLowerCase().includes('anime_exclusive')) {
                    isAnimeExclusive = true;
                    break;
                }
            }
        }
    }
    
    if (isAnimeExclusive && card.custom_image) {
        return card.custom_image;
    }
    
    let name = card.name || card.name_en || '';
    if (!name) return '';
    
    let cachedUrl = window.ygoImageCache[name];
    if (cachedUrl && cachedUrl !== 'FETCHING' && cachedUrl !== 'NOT_FOUND') {
        return cachedUrl;
    }
    
    if (!cachedUrl) {
        window.ygoFetchCardImageAsync(name);
    }
    
    return `https://images.ygoprodeck.com/images/cards/${encodeURIComponent(name)}.jpg`;
};

// Hiển thị chi tiết lá bài khi hover chuột
window.ygoHoverCard = function(card) {
    if(!card) return;
    window.ygoCurrentHoveredCard = card;
    document.getElementById('ygoDetailName').textContent = card.name_vi;
    document.getElementById('ygoDetailStats').innerHTML = `
        <span>CARD: ${card.card_type}</span>
        <span>${card.atk !== null ? `ATK:${card.atk} / DEF:${card.def}` : (card.property || 'Normal')}</span>
    `;
    document.getElementById('ygoDetailEffect').textContent = card.anime_effect_vi || 'Không có hiệu ứng đặc biệt.';
    
    let imgContainer = document.getElementById('ygoDetailImg');
    if (imgContainer) {
        let imgUrl = ygoGetCardImage(card);
        imgContainer.innerHTML = `<img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;" onerror="this.style.display='none'; this.parentElement.textContent='🃏';">`;
        imgContainer.style.background = 'transparent';
    }
};

window.ygoHoverCardById = function(side, type, index) {
    let d = ygoGame.duel;
    let card = null;
    if(side === 'player') {
        if (type === 'monster') card = d.playerMonsters[index];
        else if (type === 'spell') card = d.playerSpells[index];
        else if (type === 'fieldspell') card = d.playerFieldSpell;
        ygoHoverCard(card);
    } else {
        if (type === 'monster') card = d.oppMonsters[index];
        else if (type === 'spell') card = d.oppSpells[index];
        else if (type === 'fieldspell') card = d.oppFieldSpell;
        
        if (!card) return;
        
        let reveal = false;
        if (type === 'monster') {
            reveal = (card.faceUp !== false) || (ygoGame.myCharacter === 'pegasus');
        } else if (type === 'spell') {
            reveal = (card.faceUp !== false) || (ygoGame.myCharacter === 'pegasus') || (ygoGame.myCharacter === 'espa_roba' && card.card_type === 'Trap');
        } else if (type === 'fieldspell') {
            reveal = true;
        }
        
        if (reveal) {
            ygoHoverCard(card);
        } else {
            document.getElementById('ygoDetailName').textContent = "Lá Bài Úp của Đối Thủ";
            document.getElementById('ygoDetailStats').innerHTML = `
                <span>CARD: ---</span>
                <span>ATK/DEF: ---</span>
            `;
            document.getElementById('ygoDetailEffect').textContent = "Hiệu ứng của lá bài này đang bị ẩn vì lá bài đang úp.";
            let imgContainer = document.getElementById('ygoDetailImg');
            if (imgContainer) {
                imgContainer.style.background = 'linear-gradient(135deg, #4c0519, #881337)';
                imgContainer.textContent = "❓";
            }
        }
    }
};

// Người chơi chọn bài trên tay
window.ygoSelectHand = function(idx) {
    let d = ygoGame.duel;
    if (d.turn !== 'player') return;
    if (d.chainActive) return;
    
    try { audio.play('click'); } catch(e){}
    
    if (d.selectedHandIndex === idx) {
        d.selectedHandIndex = null; // Huỷ chọn
    } else {
        d.selectedHandIndex = idx;
        d.selectedFieldCard = null; // Huỷ chọn bài trên sân
        let card = d.playerHand[idx];
        ygoHoverCard(card);
        ygoLog(`👉 Chọn bài trên tay: [${card.name_vi}]. Hãy bấm nút Thao Tác ở khung chi tiết bên trái.`);
    }
    ygoRenderField();
};

// ==========================================
// CÁC NÚT THAO TÁC BÀI CHI TIẾT
// ==========================================
window.ygoRenderCardActions = function() {
    const container = document.getElementById('ygoCardActionsContainer');
    if (!container) return;
    container.innerHTML = '';
    
    let d = ygoGame.duel;
    if (!d || d.turn !== 'player' || d.chainActive) return;
    
    // Check if hand card is selected
    if (d.selectedHandIndex !== null) {
        let card = d.playerHand[d.selectedHandIndex];
        if (!card) return;
        
        if (card.card_type === 'Monster') {
            if (d.phase.includes('MAIN')) {
                // Summon / Set Position selection trigger button
                const btnSummon = document.createElement('button');
                btnSummon.className = 'ygo-btn';
                btnSummon.style.background = 'linear-gradient(to right, #b45309, #78350f)';
                btnSummon.textContent = '⚔️ Triệu Hồi / Úp Bài';
                btnSummon.onclick = () => {
                    let emptyIdx = d.playerMonsters.indexOf(null);
                    if (emptyIdx === -1) {
                        showToast("⚠️ Sân quái thú của bạn đã đầy!");
                        return;
                    }
                    d.selectedSummonZoneIdx = emptyIdx;
                    ygoOpenSummonPositionModal(d.selectedHandIndex);
                };
                container.appendChild(btnSummon);
            }
        } else if (card.card_type === 'Spell' || card.card_type === 'Trap') {
            let isField = (card.property === 'Field' || card.name_en.toLowerCase().includes('umi') || card.name_en.toLowerCase().includes('orichalcos') || card.name_en.toLowerCase().includes('stromberg'));
            
            if (isField) {
                const btnActivate = document.createElement('button');
                btnActivate.className = 'ygo-btn';
                btnActivate.style.background = 'linear-gradient(to right, #047857, #065f46)';
                btnActivate.textContent = '🏞️ Kích Hoạt Môi Trường';
                btnActivate.onclick = () => ygoActionActivateFieldSpell();
                container.appendChild(btnActivate);
            } else {
                if (card.card_type === 'Spell') {
                    // Check if Quick-Play: can only activate on own turn from hand
                    const btnActivate = document.createElement('button');
                    btnActivate.className = 'ygo-btn';
                    btnActivate.style.background = 'linear-gradient(to right, #047857, #065f46)';
                    btnActivate.textContent = '🪄 Kích Hoạt Phép';
                    btnActivate.onclick = () => ygoActionActivateSpell();
                    container.appendChild(btnActivate);
                }
                
                const btnSet = document.createElement('button');
                btnSet.className = 'ygo-btn ygo-btn-secondary';
                btnSet.textContent = '🃏 Úp Phép/Bẫy';
                btnSet.onclick = () => ygoActionSetSpellTrap();
                container.appendChild(btnSet);
            }
        }
    }
    // Check if field card is selected
    else if (d.selectedFieldCard !== null) {
        let sel = d.selectedFieldCard;
        if (sel.side === 'player') {
            if (sel.type === 'monster') {
                let card = d.playerMonsters[sel.pos];
                if (!card) return;
                
                if (d.phase.includes('MAIN')) {
                    const btnPos = document.createElement('button');
                    btnPos.className = 'ygo-btn';
                    btnPos.style.background = 'linear-gradient(to right, #1d4ed8, #1e40af)';
                    
                    if (card.faceUp === false) {
                        btnPos.textContent = '🔄 Flip Summon (Lật mặt)';
                    } else if (card.position === 'defense') {
                        btnPos.textContent = '🔄 Lật Ngửa Tấn Công';
                    } else {
                        btnPos.textContent = '🔄 Chuyển Thế Thủ';
                    }
                    btnPos.onclick = () => ygoActionChangePosition(sel.pos);
                    container.appendChild(btnPos);
                }
                
                if (d.phase === 'BATTLE') {
                    if (d.turnCount === 1) {
                        const lblNoAttack = document.createElement('div');
                        lblNoAttack.style.cssText = 'color:#ef4444; font-size:0.75rem; text-align:center; padding: 5px; background: rgba(239, 68, 68, 0.15); border: 1px dashed #ef4444; border-radius: 4px;';
                        lblNoAttack.textContent = '⚠️ Lượt 1 không được tấn công!';
                        container.appendChild(lblNoAttack);
                    } else if (card.position !== 'defense' && !card.hasAttacked) {
                        const btnAttack = document.createElement('button');
                        btnAttack.className = 'ygo-btn';
                        btnAttack.style.background = 'linear-gradient(to right, #b91c1c, #991b1b)';
                        btnAttack.textContent = '⚔️ Tuyên Bố Tấn Công';
                        btnAttack.onclick = () => ygoActionDeclareAttack(sel.pos);
                        container.appendChild(btnAttack);
                    }
                }
            } else if (sel.type === 'spell') {
                let card = d.playerSpells[sel.pos];
                if (card && !card.faceUp) {
                    const btnActivate = document.createElement('button');
                    btnActivate.className = 'ygo-btn';
                    btnActivate.style.background = 'linear-gradient(to right, #047857, #065f46)';
                    btnActivate.textContent = '🪄 Kích Hoạt Bài Úp';
                    btnActivate.onclick = () => ygoActionActivateSetCard(sel.pos);
                    container.appendChild(btnActivate);
                }
            }
        }
    }
};

window.ygoOpenSummonPositionModal = function(idx) {
    let d = ygoGame.duel;
    let card = d.playerHand[idx];
    if (!card) return;
    
    if (d.hasNormalSummoned) {
        showToast("⚠️ Bạn đã Triệu hồi Thường 1 quái thú ở lượt này rồi!");
        return;
    }
    
    let emptyIdx = d.playerMonsters.indexOf(null);
    if (emptyIdx === -1) {
        showToast("⚠️ Sân quái thú của bạn đã đầy!");
        return;
    }
    
    // Set target zone
    d.selectedSummonZoneIdx = d.selectedSummonZoneIdx !== null ? d.selectedSummonZoneIdx : emptyIdx;
    
    document.getElementById('ygoSummonPosCardName').textContent = card.name_vi;
    
    // Link Monster checks
    let isLink = (card.monster_type || '').toLowerCase().includes('link') || card.def === null || card.def === undefined;
    if (isLink) {
        document.getElementById('btnSummonPosDefFaceup').style.display = 'none';
        document.getElementById('btnSummonPosDefFacedown').style.display = 'none';
    } else {
        document.getElementById('btnSummonPosDefFaceup').style.display = 'block';
        document.getElementById('btnSummonPosDefFacedown').style.display = 'block';
    }
    
    document.getElementById('ygoSummonPositionModal').style.display = 'flex';
};

window.ygoSummonPositionSelect = function(posType) {
    document.getElementById('ygoSummonPositionModal').style.display = 'none';
    
    let d = ygoGame.duel;
    if (d.selectedHandIndex === null || d.selectedSummonZoneIdx === null) return;
    let card = d.playerHand[d.selectedHandIndex];
    if (!card) return;
    
    let lvl = card.level_rank || 1;
    let tributesNeeded = lvl >= 7 ? 2 : (lvl >= 5 ? 1 : 0);
    
    if (ygoGame.myCharacter === 'kaiba' && card.name_en.toLowerCase().includes("blue-eyes white dragon") && d.freeBlueEyes) {
        tributesNeeded = 0;
        d.freeBlueEyes = false;
        ygoLog(`🐉 [Kiêu Hãnh Của Rồng] Triệu hồi Rồng Trắng Mắt Xanh không cần hiến tế!`);
    }
    
    let aliveCount = d.playerMonsters.filter(m => m !== null).length;
    if (aliveCount < tributesNeeded) {
        showToast(`⚠️ Không đủ tế phẩm trên sân! Cần ${tributesNeeded} quái.`);
        d.selectedHandIndex = null;
        d.selectedSummonZoneIdx = null;
        return;
    }
    
    if (tributesNeeded > 0) {
        d.tributeSelectionInProgress = true;
        d.tributeNeeded = tributesNeeded;
        d.tributeSelectedIndices = [];
        d.tributeSummonCard = card;
        d.tributeSummonPosition = posType;
        
        ygoLog(`🕯️ Triệu hồi hiến tế [${card.name_vi}]: Hãy click chọn ${tributesNeeded} quái thú trên sân của bạn làm tế phẩm.`);
        ygoRenderField();
    } else {
        ygoPerformSummon('player', card, d.selectedSummonZoneIdx, posType);
        d.selectedHandIndex = null;
        d.selectedSummonZoneIdx = null;
        ygoRenderField();
    }
};

// ==========================================
// CENTRAL GAME STATE MACHINE & AI BOT SYSTEM
// ==========================================

window.ygoPerformSummon = function(side, card, zoneIdx, position) {
    let d = ygoGame.duel;
    let monsters = side === 'player' ? d.playerMonsters : d.oppMonsters;
    let hand = side === 'player' ? d.playerHand : d.oppHand;
    
    // Xoá khỏi tay
    let handIdx = hand.indexOf(card);
    if (handIdx !== -1) {
        hand.splice(handIdx, 1);
    }
    
    card.position = position === 'set' ? 'defense' : position;
    card.faceUp = (position !== 'set');
    card.hasChangedPosition = true; // vừa ra sân không được đổi tư thế
    card.wasSummonedThisTurn = true;
    card.hasAttacked = false;
    card.currentAtk = parseInt(card.atk) || 0;
    card.currentDef = parseInt(card.def) || 0;
    
    monsters[zoneIdx] = card;
    
    if (side === 'player') {
        if (position === 'set') {
            ygoLog(`🃏 Bạn úp 1 quái thú ở thế phòng thủ.`);
        } else {
            ygoLog(`⚔️ Bạn triệu hồi quái thú: [${card.name_vi}] (ATK: ${card.atk}).`);
        }
    } else {
        if (position === 'set') {
            ygoLog(`🤖 Bot úp 1 quái thú ở thế phòng thủ.`);
        } else {
            ygoLog(`🤖 Bot triệu hồi quái thú: [${card.name_vi}] (ATK: ${card.atk}).`);
        }
    }
    
    try { audio.play('levelup'); } catch(e){}
    
    // Kích hoạt Chain Link cho Summon Response nếu đối phương có Trap/Quick-Play
    ygoTriggerChainResponse(side === 'player' ? 'opponent' : 'player', card, () => {
        ygoRenderField();
    });
};

window.ygoStartPhase = function(phaseName) {
    let d = ygoGame.duel;
    d.phase = phaseName;
    
    const phaseTextEl = document.getElementById('ygoPhaseText');
    if (phaseTextEl) {
        phaseTextEl.textContent = `${phaseName} PHASE`;
    }
    
    ygoLog(`📍 Bước vào: ${phaseName} PHASE (${d.turn === 'player' ? 'Lượt của bạn' : 'Lượt của Bot'})`);
    
    if (phaseName === 'DRAW') {
        d.hasNormalSummoned = false;
        
        // Reset flags cho quái thú bên có lượt
        let monsters = d.turn === 'player' ? d.playerMonsters : d.oppMonsters;
        monsters.forEach(m => {
            if (m) {
                m.hasChangedPosition = false;
                m.hasAttacked = false;
                m.wasSummonedThisTurn = false;
            }
        });
        
        // Draw card
        if (d.turn === 'player') {
            if (ygoGame.myCharacter === 'yugi' && d.playerLP < 1500 && !d.destinyDrawUsed && d.playerDeck.length > 0) {
                d.destinyDrawUsed = true;
                ygoTriggerDestinyDraw();
            } else {
                ygoDrawCard('player');
            }
        } else {
            // Bot Draw
            if (ygoGame.oppCharacter === 'yugi' && d.oppLP < 1500 && !d.destinyDrawUsed && d.oppDeck.length > 0) {
                d.destinyDrawUsed = true;
                let targetIdx = d.oppDeck.findIndex(c => c.name_en.toLowerCase().includes("raigeki") || c.name_en.toLowerCase().includes("pot of greed"));
                if (targetIdx === -1) {
                    targetIdx = d.oppDeck.findIndex(c => c.card_type === 'Monster');
                }
                if (targetIdx !== -1) {
                    let card = d.oppDeck.splice(targetIdx, 1)[0];
                    d.oppHand.push(card);
                    ygoLog(`🔮 [RÚT BÀI ĐỊNH MỆNH] Bot Yugi Atem kích hoạt kỹ năng và chọn [${card.name_vi}] lên tay!`);
                    try { audio.play('apocalypse'); } catch(e){}
                } else {
                    ygoDrawCard('opponent');
                }
            } else {
                ygoDrawCard('opponent');
            }
            
            if (ygoGame.oppCharacter === 'mai' && d.oppDeck.length > 0) {
                let top = d.oppDeck[d.oppDeck.length - 1];
                ygoLog(`🔮 [Nước Hoa] Bot Mai Valentine ngửi thấy bài tiếp theo: [${top.name_vi}]`);
            }
        }
        
        ygoRenderField();
        
        // Tự chuyển DRAW -> STANDBY
        setTimeout(() => {
            ygoStartPhase('STANDBY');
        }, 800);
    }
    else if (phaseName === 'STANDBY') {
        // Tự chuyển STANDBY -> MAIN1
        setTimeout(() => {
            ygoStartPhase('MAIN1');
        }, 800);
    }
    else if (phaseName === 'MAIN1' || phaseName === 'MAIN2' || phaseName === 'BATTLE') {
        ygoRenderField();
        if (d.turn === 'opponent') {
            // Bot chạy AI Bot cho Main Phase hoặc Battle Phase
            setTimeout(() => {
                ygoRunBotPhase();
            }, 500);
        }
    }
    else if (phaseName === 'END') {
        ygoRenderField();
        
        // Dọn dẹp cuối lượt (Valkyries, Change of Heart, mask lock)
        if (d.zigfriedBanishList.length > 0) {
            ygoLog(`✨ [Bản Hùng Ca Valkyrie] Trục xuất toàn bộ Valkyrie khỏi sân.`);
            for (let i = 0; i < 5; i++) {
                if (d.oppMonsters[i] && d.zigfriedBanishList.includes(d.oppMonsters[i])) d.oppMonsters[i] = null;
                if (d.playerMonsters[i] && d.zigfriedBanishList.includes(d.playerMonsters[i])) d.playerMonsters[i] = null;
            }
            d.zigfriedBanishList = [];
        }
        
        if (d.changeOfHeartStolen) {
            let ch = d.changeOfHeartStolen;
            let currentMonsters = ch.toSide === 'player' ? d.playerMonsters : d.oppMonsters;
            let targetMonsters = ch.fromSide === 'player' ? d.playerMonsters : d.oppMonsters;
            
            if (currentMonsters[ch.toIdx] === ch.monster) {
                currentMonsters[ch.toIdx] = null;
                if (targetMonsters[ch.fromIdx] === null) {
                    targetMonsters[ch.fromIdx] = ch.monster;
                } else {
                    let emptyIdx = targetMonsters.indexOf(null);
                    if (emptyIdx !== -1) {
                        targetMonsters[emptyIdx] = ch.monster;
                    } else {
                        let oppGY = ch.fromSide === 'player' ? d.playerGY : d.oppGY;
                        oppGY.push(ch.monster);
                    }
                }
                ygoLog(`⏳ Trả lại quái thú [${ch.monster.name_vi}] cho đối thủ.`);
            }
            d.changeOfHeartStolen = null;
        }
        
        if (d.lumisLockTurns > 0) {
            d.lumisLockTurns--;
            if (d.lumisLockTurns === 0) {
                ygoLog(`🎭 Giải phóng ô bị phong ấn bởi Mặt Nạ.`);
                d.lumisLockedZone = null;
            }
        }
        
        // Chuyển lượt
        d.turn = d.turn === 'player' ? 'opponent' : 'player';
        d.turnCount = (d.turnCount || 1) + 1;
        ygoLog(`⏳ Bắt đầu lượt mới. Lượt của ${d.turn === 'player' ? 'BẠN' : 'BOT'}`);
        ygoRenderField();
        
        setTimeout(() => {
            ygoStartPhase('DRAW');
        }, 500);
    }
    
    if (d.mode === 'pvp') {
        ygoSendSyncState();
    }
};

window.ygoNextPhase = function() {
    let d = ygoGame.duel;
    if (d.turn !== 'player') return;
    if (d.chainActive) return;
    
    try { audio.play('click'); } catch(e){}
    
    if (d.phase === 'MAIN1') {
        if (d.turnCount === 1) {
            ygoLog(`⚠️ Lượt 1 không được vào BATTLE PHASE. Đi thẳng sang END PHASE.`);
            ygoStartPhase('END');
        } else {
            ygoStartPhase('BATTLE');
        }
    } else if (d.phase === 'BATTLE') {
        ygoStartPhase('MAIN2');
    } else if (d.phase === 'MAIN2') {
        ygoStartPhase('END');
    }
    
    if (d.mode === 'pvp') {
        ygoSendSyncState();
    }
};

window.ygoZoneClick = function(side, type, index) {
    let d = ygoGame.duel;
    if (d.chainActive) return;
    
    // Tribute Selection
    if (d.tributeSelectionInProgress) {
        if (side === 'player' && type === 'monster' && d.playerMonsters[index] !== null) {
            if (d.tributeSelectedIndices.includes(index)) {
                d.tributeSelectedIndices = d.tributeSelectedIndices.filter(i => i !== index);
            } else {
                d.tributeSelectedIndices.push(index);
            }
            ygoLog(`👉 Đã chọn: ${d.tributeSelectedIndices.length}/${d.tributeNeeded} tế phẩm.`);
            ygoRenderField();
            
            if (d.tributeSelectedIndices.length === d.tributeNeeded) {
                d.tributeSelectedIndices.forEach(idx => {
                    let sacrificed = d.playerMonsters[idx];
                    ygoLog(`🪦 Hiến tế [${sacrificed.name_vi}] gửi vào Graveyard.`);
                    d.playerGY.push(sacrificed);
                    d.playerMonsters[idx] = null;
                });
                
                ygoPerformSummon('player', d.tributeSummonCard, d.selectedSummonZoneIdx, d.tributeSummonPosition);
                
                d.tributeSelectionInProgress = false;
                d.tributeNeeded = 0;
                d.tributeSelectedIndices = [];
                d.tributeSummonCard = null;
                d.tributeSummonPosition = null;
                d.selectedSummonZoneIdx = null;
                d.selectedHandIndex = null;
                ygoRenderField();
            }
        }
        return;
    }
    
    if (d.turn !== 'player') return;
    
    if (d.lumisLockTurns > 0 && d.lumisLockedZone) {
        if (d.lumisLockedZone.side === side && d.lumisLockedZone.type === type && d.lumisLockedZone.index === index) {
            showToast(`⚠️ Ô này đang bị phong ấn bởi Mặt Nạ trong ${d.lumisLockTurns} lượt nữa!`);
            return;
        }
    }
    
    if (d.selectedHandIndex !== null && side === 'player') {
        let card = d.playerHand[d.selectedHandIndex];
        if (!card) return;
        
        if (type === 'monster' && card.card_type === 'Monster') {
            if (d.playerMonsters[index] !== null) {
                showToast("⚠️ Ô này đã có quái thú!");
                return;
            }
            d.selectedSummonZoneIdx = index;
            ygoOpenSummonPositionModal(d.selectedHandIndex);
            return;
        }
        
        if (type === 'spell' && (card.card_type === 'Spell' || card.card_type === 'Trap')) {
            if (d.playerSpells[index] !== null) {
                showToast("⚠️ Ô này đã có Phép/Bẫy!");
                return;
            }
            
            let confirmAct = confirm(`Kích hoạt [${card.name_vi}]? (Chọn Cancel để ÚP)`);
            if (confirmAct) {
                if (card.card_type === 'Spell') {
                    try { audio.play('click'); } catch(e){}
                    card.faceUp = true;
                    d.playerSpells[index] = card;
                    d.playerHand.splice(d.selectedHandIndex, 1);
                    d.selectedHandIndex = null;
                    ygoLog(`🪄 Bạn kích hoạt: [${card.name_vi}]`);
                    
                    ygoStartChain('player', card, index);
                } else {
                    showToast("⚠️ Bẫy (Trap) chỉ có thể ÚP trước rồi mới kích hoạt từ lượt sau!");
                }
            } else {
                try { audio.play('click'); } catch(e){}
                card.faceUp = false;
                d.playerSpells[index] = card;
                d.playerHand.splice(d.selectedHandIndex, 1);
                d.selectedHandIndex = null;
                ygoLog(`🃏 Bạn úp 1 lá Phép/Bẫy.`);
                ygoRenderField();
            }
            return;
        }
    }
    
    if (d.phase === 'BATTLE' && d.selectedFieldCard && d.selectedFieldCard.side === 'player' && d.selectedFieldCard.type === 'monster') {
        let myMonIdx = d.selectedFieldCard.pos;
        let myMon = d.playerMonsters[myMonIdx];
        if (!myMon || myMon.position === 'defense' || myMon.hasAttacked) return;
        
        if (side === 'opponent' && type === 'monster') {
            let oppMon = d.oppMonsters[index];
            if (oppMon) {
                ygoResolveBattle(myMonIdx, index);
            } else {
                let hasOtherOppMonsters = d.oppMonsters.some(m => m !== null);
                let isWater = myMon.attribute && myMon.attribute.toUpperCase() === 'WATER';
                let oppHasWater = d.oppMonsters.some(m => m !== null && m.attribute && m.attribute.toUpperCase() === 'WATER');
                let canAttackDirectly = !hasOtherOppMonsters || (ygoGame.myCharacter === 'mako' && isWater && !oppHasWater);
                
                if (canAttackDirectly) {
                    ygoResolveDirectAttack(myMonIdx);
                } else {
                    showToast("⚠️ Bạn phải tiêu diệt quái thú trên sân đối phương trước!");
                }
            }
            d.selectedFieldCard = null;
            ygoRenderField();
            return;
        }
    }
    
    if (side === 'player' && d.selectedHandIndex === null) {
        let card = null;
        if (type === 'monster') card = d.playerMonsters[index];
        else if (type === 'spell') card = d.playerSpells[index];
        else if (type === 'fieldspell') card = d.playerFieldSpell;
        
        if (card) {
            d.selectedFieldCard = { side: side, type: type, pos: index };
            ygoHoverCard(card);
            ygoLog(`👉 Chọn bài trên sân: [${card.name_vi}]. Chọn thao tác bên trái.`);
            ygoRenderField();
        }
    }
};

window.ygoStartChain = function(side, card, zoneIdx) {
    let d = ygoGame.duel;
    d.chainStack.push({ side: side, card: card, zoneIdx: zoneIdx });
    d.chainActive = true;
    d.consecutivePasses = 0;
    d.prioritySide = side === 'player' ? 'opponent' : 'player';
    
    ygoLog(`⛓️ Chain Link ${d.chainStack.length}: [${card.name_vi}] được kích hoạt!`);
    ygoTriggerChainResponse();
};

window.ygoTriggerChainResponse = function() {
    let d = ygoGame.duel;
    if (!d.chainActive) return;
    
    if (d.prioritySide === 'opponent') {
        if (d.mode === 'pvp') {
            // PVP Sync...
        } else {
            setTimeout(() => {
                ygoBotChainDecision();
            }, 800);
        }
    } else {
        let hasValidResponse = ygoCheckValidResponses('player');
        if (hasValidResponse) {
            document.getElementById('ygoChainPromptText').textContent = `Đối thủ kích hoạt hiệu ứng của [${d.chainStack[d.chainStack.length - 1].card.name_vi}]. Bạn có muốn phản hồi không?`;
            document.getElementById('ygoChainModal').style.display = 'flex';
        } else {
            ygoPassChain('player');
        }
    }
};

window.ygoCheckValidResponses = function(side) {
    let d = ygoGame.duel;
    let spells = side === 'player' ? d.playerSpells : d.oppSpells;
    let hand = side === 'player' ? d.playerHand : d.oppHand;
    
    let hasOnField = spells.some((c, idx) => {
        if (c && !c.faceUp) {
            let isQuickPlay = c.card_type === 'Spell' && c.property === 'Quick-Play';
            let isTrap = c.card_type === 'Trap';
            return isTrap || isQuickPlay;
        }
        return false;
    });
    
    let hasInHand = false;
    if (d.turn === side) {
        hasInHand = hand.some(c => c.card_type === 'Spell' && c.property === 'Quick-Play');
    }
    
    return hasOnField || hasInHand;
};

window.ygoPassChain = function(side) {
    let d = ygoGame.duel;
    if (!d.chainActive) return;
    
    if (side === 'player') {
        document.getElementById('ygoChainModal').style.display = 'none';
    }
    
    ygoLog(`Pass priority: ${side === 'player' ? 'Bạn' : 'Bot'} không phản hồi Chain.`);
    d.consecutivePasses++;
    
    if (d.consecutivePasses >= 2) {
        ygoLog(`⛓️ Cả hai bên đều dừng phản hồi. Bắt đầu giải quyết chuỗi Chain Link...`);
        ygoResolveChain();
    } else {
        d.prioritySide = side === 'player' ? 'opponent' : 'player';
        ygoTriggerChainResponse();
    }
};

window.ygoConfirmChain = function() {
    document.getElementById('ygoChainModal').style.display = 'none';
    let d = ygoGame.duel;
    
    let validCards = [];
    d.playerSpells.forEach((c, idx) => {
        if (c && !c.faceUp) {
            validCards.push({ card: c, source: 'field', index: idx });
        }
    });
    if (d.turn === 'player') {
        d.playerHand.forEach((c, idx) => {
            if (c.card_type === 'Spell' && c.property === 'Quick-Play') {
                validCards.push({ card: c, source: 'hand', index: idx });
            }
        });
    }
    
    if (validCards.length === 0) {
        showToast("⚠️ Không có bài phản hồi khả dụng!");
        ygoPassChain('player');
        return;
    }
    
    const modal = document.getElementById('ygoDeckSelectModal');
    const container = document.getElementById('ygoDeckSelectContainer');
    if (!modal || !container) return;
    
    modal.querySelector('h3').textContent = "⛓️ CHỌN BÀI PHẢN HỒI (CHAIN)";
    modal.querySelector('p').textContent = "Chọn một lá bài Spell/Trap phù hợp để tạo Chain Link tiếp theo.";
    container.innerHTML = '';
    
    validCards.forEach(item => {
        const div = document.createElement('div');
        let typeClass = item.card.card_type === 'Spell' ? 'spell' : 'trap';
        div.className = `ygo-mini-card ${typeClass}`;
        div.innerHTML = `
            <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.card.name_vi}</div>
            <div style="font-size:0.48rem; color:#cbd5e1;">${item.source === 'hand' ? 'TAY' : 'SÂN'}</div>
        `;
        div.onclick = () => {
            modal.style.display = 'none';
            try { audio.play('click'); } catch(e){}
            item.card.faceUp = true;
            
            if (item.source === 'hand') {
                let emptyIdx = d.playerSpells.indexOf(null);
                if (emptyIdx !== -1) {
                    d.playerSpells[emptyIdx] = item.card;
                    d.playerHand.splice(item.index, 1);
                    d.chainStack.push({ side: 'player', card: item.card, zoneIdx: emptyIdx });
                }
            } else {
                d.chainStack.push({ side: 'player', card: item.card, zoneIdx: item.index });
            }
            
            d.consecutivePasses = 0;
            d.prioritySide = 'opponent';
            ygoLog(`⛓️ Chain Link ${d.chainStack.length}: Bạn phản hồi bằng [${item.card.name_vi}]!`);
            ygoTriggerChainResponse();
        };
        container.appendChild(div);
    });
    
    modal.style.display = 'flex';
};

window.ygoResolveChain = function() {
    let d = ygoGame.duel;
    if (d.chainStack.length === 0) {
        d.chainActive = false;
        d.consecutivePasses = 0;
        ygoLog(`⛓️ Giải quyết Chain hoàn tất!`);
        ygoRenderField();
        ygoCheckWinConditions();
        
        if (d.turn === 'opponent') {
            setTimeout(ygoRunBotPhase, 500);
        }
        return;
    }
    
    let link = d.chainStack.pop();
    ygoLog(`▶️ Resolve Chain Link ${d.chainStack.length + 1}: Kích hoạt hiệu ứng của [${link.card.name_vi}] (${link.side === 'player' ? 'BẠN' : 'BOT'})`);
    
    ygoExecuteCardEffect(link.side, link.card, link.zoneIdx);
    
    setTimeout(() => {
        ygoResolveChain();
    }, 1000);
};

window.ygoBotChainDecision = function() {
    let d = ygoGame.duel;
    let hasResponse = ygoCheckValidResponses('opponent');
    if (hasResponse && Math.random() < 0.6) {
        let validSpells = [];
        d.oppSpells.forEach((c, idx) => {
            if (c && !c.faceUp) validSpells.push({ card: c, source: 'field', index: idx });
        });
        if (d.turn === 'opponent') {
            d.oppHand.forEach((c, idx) => {
                if (c.card_type === 'Spell' && c.property === 'Quick-Play') {
                    validSpells.push({ card: c, source: 'hand', index: idx });
                }
            });
        }
        
        if (validSpells.length > 0) {
            let choice = validSpells[Math.floor(Math.random() * validSpells.length)];
            choice.card.faceUp = true;
            
            if (choice.source === 'hand') {
                let emptyIdx = d.oppSpells.indexOf(null);
                if (emptyIdx !== -1) {
                    d.oppSpells[emptyIdx] = choice.card;
                    d.oppHand.splice(choice.index, 1);
                    d.chainStack.push({ side: 'opponent', card: choice.card, zoneIdx: emptyIdx });
                }
            } else {
                d.chainStack.push({ side: 'opponent', card: choice.card, zoneIdx: choice.index });
            }
            
            d.consecutivePasses = 0;
            d.prioritySide = 'player';
            ygoLog(`⛓️ Chain Link ${d.chainStack.length}: Bot phản hồi bằng [${choice.card.name_vi}]!`);
            ygoTriggerChainResponse();
            return;
        }
    }
    
    ygoPassChain('opponent');
};

window.ygoResolveBattle = function(myMonIdx, oppMonIdx) {
    let d = ygoGame.duel;
    let myMon = d.playerMonsters[myMonIdx];
    let oppMon = d.oppMonsters[oppMonIdx];
    if (!myMon || !oppMon) return;
    
    myMon.hasAttacked = true;
    
    let wasFaceDown = (oppMon.faceUp === false);
    if (wasFaceDown) {
        oppMon.faceUp = true;
        ygoLog(`🔄 Lật ngửa quái thú thủ úp của đối thủ: [${oppMon.name_vi}]!`);
        let isFlip = (oppMon.monster_type || '').toLowerCase().includes('flip') || (oppMon.anime_effect_vi || '').toLowerCase().includes('lật');
        if (isFlip) {
            ygoLog(`🔮 Kích hoạt hiệu ứng FLIP của [${oppMon.name_vi}]!`);
            ygoExecuteCardEffect('opponent', oppMon, oppMonIdx);
        }
    }
    
    let myAtk = ygoGetEffectiveAtk('player', myMon);
    try { audio.play('hit'); } catch(e){}
    
    if (oppMon.position === 'defense') {
        let oppDef = parseInt(oppMon.currentDef || oppMon.def) || 0;
        ygoLog(`⚔️ [${myMon.name_vi}] (ATK ${myAtk}) tấn công [${oppMon.name_vi}] ở THẾ THỦ (DEF ${oppDef})!`);
        
        if (myAtk > oppDef) {
            ygoLog(`💔 [${oppMon.name_vi}] bị tiêu diệt.`);
            ygoDestroyMonster('opponent', oppMonIdx);
            
            if (ygoGame.myCharacter === 'rex' && myMon.monster_type && myMon.monster_type.toLowerCase().includes('dinosaur')) {
                let diff = myAtk - oppDef;
                ygoDamageOpponent(diff, `xuyên thủ của Rex Raptor`);
            }
        } else if (myAtk < oppDef) {
            let diff = oppDef - myAtk;
            ygoDamagePlayer(diff, `phản đòn phòng thủ từ quái thú`);
        } else {
            ygoLog(`🛡️ Không bên nào bị thiệt hại.`);
        }
    } else {
        let oppAtk = ygoGetEffectiveAtk('opponent', oppMon);
        ygoLog(`⚔️ [${myMon.name_vi}] (ATK ${myAtk}) tấn công [${oppMon.name_vi}] (ATK ${oppAtk})!`);
        
        if (myAtk > oppAtk) {
            let diff = myAtk - oppAtk;
            ygoDamageOpponent(diff, `chiến đấu quái thú`);
            ygoLog(`💔 [${oppMon.name_vi}] bị tiêu diệt.`);
            ygoDestroyMonster('opponent', oppMonIdx);
        } else if (myAtk === oppAtk) {
            ygoLog(`💥 Cả hai quái thú cùng bị hủy!`);
            ygoDestroyMonster('player', myMonIdx);
            ygoDestroyMonster('opponent', oppMonIdx);
        } else {
            let diff = oppAtk - myAtk;
            ygoDamagePlayer(diff, `quái thú đối thủ phản công`);
            ygoLog(`💔 [${myMon.name_vi}] bị tiêu diệt.`);
            ygoDestroyMonster('player', myMonIdx);
        }
    }
};

window.ygoResolveDirectAttack = function(myMonIdx) {
    let d = ygoGame.duel;
    let myMon = d.playerMonsters[myMonIdx];
    if (!myMon) return;
    
    myMon.hasAttacked = true;
    let myAtk = ygoGetEffectiveAtk('player', myMon);
    
    try { audio.play('hit'); } catch(e){}
    ygoLog(`⚔️ [${myMon.name_vi}] tấn công TRỰC DIỆN!`);
    ygoDamageOpponent(myAtk, `tấn công trực diện`);
};

window.ygoRunBotPhase = function() {
    let d = ygoGame.duel;
    if (d.turn !== 'opponent' || d.chainActive) return;
    
    if (d.phase === 'MAIN1') {
        ygoRunBotMainPhase();
    } else if (d.phase === 'BATTLE') {
        ygoRunBotBattlePhase();
    } else if (d.phase === 'MAIN2') {
        ygoStartPhase('END');
    }
};

window.ygoRunBotMainPhase = function() {
    let d = ygoGame.duel;
    
    // 1. Extra Deck Summon
    let botMonsterCount = d.oppMonsters.filter(m => m !== null).length;
    if (d.oppExtraDeck && d.oppExtraDeck.length > 0 && botMonsterCount < 2 && Math.random() < 0.3) {
        let emptyIdx = d.oppMonsters.indexOf(null);
        if (emptyIdx !== -1) {
            let card = d.oppExtraDeck.shift();
            card.currentAtk = parseInt(card.atk) || 0;
            card.currentDef = parseInt(card.def) || 0;
            card.position = 'attack';
            card.faceUp = true;
            d.oppMonsters[emptyIdx] = card;
            ygoLog(`🔮 Bot Triệu hồi Đặc biệt [${card.name_vi}] từ Extra Deck!`);
            ygoRenderField();
        }
    }
    
    // 2. Kích hoạt Skill
    if (!d.oppUsedSkill && Math.random() < 0.5) {
        ygoTriggerBotSkill();
    }
    
    // 3. Triệu hồi quái thú thường
    let bestMonIdx = -1;
    let maxAtk = -1;
    d.oppHand.forEach((c, idx) => {
        if (c.card_type === 'Monster') {
            let atk = parseInt(c.atk) || 0;
            if (atk > maxAtk) {
                maxAtk = atk;
                bestMonIdx = idx;
            }
        }
    });
    
    if (bestMonIdx !== -1 && !d.hasNormalSummoned) {
        let card = d.oppHand[bestMonIdx];
        let emptyIdx = d.oppMonsters.indexOf(null);
        if (emptyIdx !== -1) {
            let lvl = card.level_rank || 1;
            let tributesNeeded = lvl >= 7 ? 2 : (lvl >= 5 ? 1 : 0);
            if (ygoGame.oppCharacter === 'kaiba' && card.name_en.toLowerCase().includes("blue-eyes white dragon")) {
                tributesNeeded = 0;
            }
            
            let aliveCount = d.oppMonsters.filter(m => m !== null).length;
            if (aliveCount >= tributesNeeded) {
                if (tributesNeeded > 0) {
                    let count = 0;
                    for (let i = 0; i < 5; i++) {
                        if (d.oppMonsters[i] !== null) {
                            ygoLog(`🕯️ Bot hiến tế [${d.oppMonsters[i].name_vi}] gửi vào Graveyard.`);
                            d.oppGY.push(d.oppMonsters[i]);
                            d.oppMonsters[i] = null;
                            count++;
                            if (count >= tributesNeeded) break;
                        }
                    }
                }
                
                let isDef = (parseInt(card.def) || 0) > (parseInt(card.atk) || 0);
                let pos = isDef ? 'set' : 'attack';
                
                ygoPerformSummon('opponent', card, emptyIdx, pos);
                d.hasNormalSummoned = true;
            }
        }
    }
    
    // 4. Úp Spell/Trap
    let spellIdx = d.oppHand.findIndex(c => c.card_type === 'Spell' || c.card_type === 'Trap');
    if (spellIdx !== -1) {
        let emptyIdx = d.oppSpells.indexOf(null);
        if (emptyIdx !== -1) {
            let card = d.oppHand[spellIdx];
            d.oppSpells[emptyIdx] = card;
            d.oppHand.splice(spellIdx, 1);
            ygoLog(`🤖 Bot úp 1 lá Spell/Trap.`);
            
            if (card.card_type === 'Spell' && (card.name_en.toLowerCase().includes('pot of greed') || card.name_en.toLowerCase().includes('raigeki'))) {
                card.faceUp = true;
                ygoStartChain('opponent', card, emptyIdx);
                return;
            }
        }
    }
    
    ygoRenderField();
    
    setTimeout(() => {
        if (d.turnCount === 1) {
            ygoStartPhase('END');
        } else {
            ygoStartPhase('BATTLE');
        }
    }, 1000);
};

window.ygoTriggerBotSkill = function() {
    let d = ygoGame.duel;
    let botChar = ygoGame.oppCharacter;
    
    if (botChar === 'kaiba') {
        let bewdIdx = d.oppHand.findIndex(c => c.name_en.toLowerCase().includes("blue-eyes white dragon"));
        let emptyIdx = d.oppMonsters.indexOf(null);
        if (bewdIdx !== -1 && emptyIdx !== -1) {
            let card = d.oppHand.splice(bewdIdx, 1)[0];
            ygoPerformSummon('opponent', card, emptyIdx, 'attack');
            d.oppUsedSkill = true;
            ygoLog(`🔥 [Kỹ Năng] Bot Kaiba kích hoạt [Kiêu Hãnh Của Rồng] không cần hiến tế!`);
        }
    }
    else if (botChar === 'marik' && d.oppLP > 1000) {
        let playerAlive = d.playerMonsters.map((m, i) => m !== null ? i : null).filter(v => v !== null);
        let handMonIdx = d.oppHand.findIndex(c => c.card_type === 'Monster');
        let emptyIdx = d.oppMonsters.indexOf(null);
        if (playerAlive.length > 0 && handMonIdx !== -1 && emptyIdx !== -1) {
            let targetIdx = playerAlive[0];
            let sacrificed = d.playerMonsters[targetIdx];
            d.playerGY.push(sacrificed);
            d.playerMonsters[targetIdx] = null;
            
            let summoned = d.oppHand.splice(handMonIdx, 1)[0];
            ygoPerformSummon('opponent', summoned, emptyIdx, 'attack');
            
            let cost = Math.floor(d.oppLP / 2);
            d.oppLP -= cost;
            d.oppUsedSkill = true;
            ygoLog(`🔥 [Kỹ Năng] Bot Marik kích hoạt [Nghi Thức Hiến Tế Bóng Tối] hiến tế [${sacrificed.name_vi}] và trừ ${cost} LP.`);
            ygoUpdateLP();
        }
    }
};

window.ygoRunBotBattlePhase = function() {
    let d = ygoGame.duel;
    
    let botMonsters = [];
    d.oppMonsters.forEach((m, idx) => {
        if (m && m.position === 'attack' && !m.hasAttacked) {
            botMonsters.push({ card: m, index: idx });
        }
    });
    
    if (botMonsters.length === 0) {
        ygoStartPhase('MAIN2');
        return;
    }
    
    let idxToAttack = 0;
    
    function performNextAttack() {
        if (idxToAttack >= botMonsters.length) {
            ygoStartPhase('MAIN2');
            return;
        }
        
        let attacker = botMonsters[idxToAttack];
        let myMon = attacker.card;
        myMon.hasAttacked = true;
        
        let playerAlive = [];
        d.playerMonsters.forEach((m, i) => {
            if (m) playerAlive.push(i);
        });
        
        let isWater = myMon.attribute && myMon.attribute.toUpperCase() === 'WATER';
        let playerHasWater = d.playerMonsters.some(m => m !== null && m.attribute && m.attribute.toUpperCase() === 'WATER');
        let canAttackDirectly = (playerAlive.length === 0) || (ygoGame.oppCharacter === 'mako' && isWater && !playerHasWater);
        
        if (ygoGame.myCharacter === 'leon') {
            ygoLog(`🏰 [Lâu Đài Cổ Tích] Bot [${myMon.name_vi}] tuyên bố tấn công và bị tiêu diệt bởi Stromberg Castle!`);
            ygoDestroyMonster('opponent', attacker.index);
            ygoRenderField();
            idxToAttack++;
            setTimeout(performNextAttack, 1000);
            return;
        }
        
        if (!canAttackDirectly && playerAlive.length > 0) {
            let targetIdx = playerAlive[0];
            let targetMon = d.playerMonsters[targetIdx];
            
            if (targetMon.faceUp === false) {
                targetMon.faceUp = true;
                ygoLog(`🔄 Bot lật ngửa quái thú của bạn: [${targetMon.name_vi}]!`);
                let isFlip = (targetMon.monster_type || '').toLowerCase().includes('flip') || (targetMon.anime_effect_vi || '').toLowerCase().includes('lật');
                if (isFlip) {
                    ygoLog(`🔮 Kích hoạt hiệu ứng FLIP của [${targetMon.name_vi}]!`);
                    ygoExecuteCardEffect('player', targetMon, targetIdx);
                }
            }
            
            let botAtk = ygoGetEffectiveAtk('opponent', myMon);
            try { audio.play('hit'); } catch(e){}
            
            if (targetMon.position === 'defense') {
                let playDef = parseInt(targetMon.currentDef || targetMon.def) || 0;
                ygoLog(`🤖 Bot [${myMon.name_vi}] (ATK ${botAtk}) tấn công [${targetMon.name_vi}] ở THẾ THỦ (DEF ${playDef})!`);
                
                if (botAtk > playDef) {
                    ygoLog(`💔 [${targetMon.name_vi}] bị tiêu diệt.`);
                    ygoDestroyMonster('player', targetIdx);
                    if (ygoGame.oppCharacter === 'rex' && myMon.monster_type && myMon.monster_type.toLowerCase().includes('dinosaur')) {
                        let diff = botAtk - playDef;
                        ygoDamagePlayer(diff, `xuyên thủ của Bot Rex Raptor`);
                    }
                } else if (botAtk < playDef) {
                    let diff = playDef - botAtk;
                    ygoDamageOpponent(diff, `quái thủ phản đòn`);
                }
            } else {
                let playAtk = ygoGetEffectiveAtk('player', targetMon);
                ygoLog(`🤖 Bot [${myMon.name_vi}] (ATK ${botAtk}) tấn công [${targetMon.name_vi}] (ATK ${playAtk})!`);
                
                if (botAtk > playAtk) {
                    let diff = botAtk - playAtk;
                    ygoDamagePlayer(diff, `chiến đấu quái thú`);
                    ygoLog(`💔 [${targetMon.name_vi}] bị tiêu diệt.`);
                    ygoDestroyMonster('player', targetIdx);
                } else if (botAtk === playAtk) {
                    ygoLog(`💥 Cả hai quái thú cùng chết!`);
                    ygoDestroyMonster('opponent', attacker.index);
                    ygoDestroyMonster('player', targetIdx);
                } else {
                    let diff = playAtk - botAtk;
                    ygoDamageOpponent(diff, `quái thú phản công`);
                    ygoLog(`💔 Bot [${myMon.name_vi}] bị tiêu diệt.`);
                    ygoDestroyMonster('opponent', attacker.index);
                }
            }
        } else if (canAttackDirectly) {
            try { audio.play('hit'); } catch(e){}
            let botAtk = ygoGetEffectiveAtk('opponent', myMon);
            ygoLog(`🤖 Bot [${myMon.name_vi}] tấn công TRỰC DIỆN!`);
            ygoDamagePlayer(botAtk, `tấn công trực diện của Bot`);
        }
        
        ygoUpdateLP();
        ygoRenderField();
        ygoCheckWinConditions();
        
        if (d.playerLP <= 0 || d.oppLP <= 0) return;
        
        idxToAttack++;
        setTimeout(performNextAttack, 1000);
    }
    
    performNextAttack();
};

window.ygoActionActivateSpell = function() {
    let d = ygoGame.duel;
    if (d.selectedHandIndex === null) return;
    let card = d.playerHand[d.selectedHandIndex];
    if (!card) return;
    
    let emptyIdx = d.playerSpells.indexOf(null);
    if (emptyIdx === -1) {
        showToast("⚠️ Ô bài Phép/Bẫy của bạn đã đầy!");
        return;
    }
    
    try { audio.play('click'); } catch(e){}
    card.faceUp = true;
    d.playerSpells[emptyIdx] = card;
    d.playerHand.splice(d.selectedHandIndex, 1);
    d.selectedHandIndex = null;
    
    ygoLog(`🪄 Bạn kích hoạt: [${card.name_vi}]`);
    ygoStartChain('player', card, emptyIdx);
};

window.ygoActionSetSpellTrap = function() {
    let d = ygoGame.duel;
    if (d.selectedHandIndex === null) return;
    let card = d.playerHand[d.selectedHandIndex];
    if (!card) return;
    
    let emptyIdx = d.playerSpells.indexOf(null);
    if (emptyIdx === -1) {
        showToast("⚠️ Ô bài Phép/Bẫy của bạn đã đầy!");
        return;
    }
    
    try { audio.play('click'); } catch(e){}
    card.faceUp = false;
    d.playerSpells[emptyIdx] = card;
    d.playerHand.splice(d.selectedHandIndex, 1);
    d.selectedHandIndex = null;
    
    ygoLog(`🃏 Bạn úp 1 lá Phép/Bẫy.`);
    ygoRenderField();
};

window.ygoActionActivateFieldSpell = function() {
    let d = ygoGame.duel;
    if (d.selectedHandIndex === null) return;
    let card = d.playerHand[d.selectedHandIndex];
    if (!card) return;
    
    try { audio.play('click'); } catch(e){}
    if (d.playerFieldSpell) {
        d.playerGY.push(d.playerFieldSpell);
    }
    
    card.faceUp = true;
    d.playerFieldSpell = card;
    d.playerHand.splice(d.selectedHandIndex, 1);
    d.selectedHandIndex = null;
    
    ygoLog(`🏞️ Kích hoạt bài Môi Trường: [${card.name_vi}]`);
    ygoRenderField();
};

window.ygoActionActivateSetCard = function(pos) {
    let d = ygoGame.duel;
    let card = d.playerSpells[pos];
    if (!card) return;
    
    try { audio.play('click'); } catch(e){}
    card.faceUp = true;
    ygoLog(`🪄 Bạn lật kích hoạt bài úp: [${card.name_vi}]`);
    ygoStartChain('player', card, pos);
};

window.ygoActionChangePosition = function(pos) {
    let d = ygoGame.duel;
    let card = d.playerMonsters[pos];
    if (!card) return;
    
    if (card.faceUp === false) {
        card.faceUp = true;
        card.position = 'attack';
        ygoLog(`🔄 Flip Summon (Lật mặt tấn công): [${card.name_vi}]!`);
        
        let isFlip = (card.monster_type || '').toLowerCase().includes('flip') || (card.anime_effect_vi || '').toLowerCase().includes('lật');
        if (isFlip) {
            ygoLog(`🔮 Kích hoạt hiệu ứng FLIP của [${card.name_vi}]!`);
            ygoExecuteCardEffect('player', card, pos);
        }
    } else {
        card.position = card.position === 'defense' ? 'attack' : 'defense';
        ygoLog(`🔄 Thay đổi tư thế chiến đấu của [${card.name_vi}] sang ${card.position === 'defense' ? 'PHÒNG THỦ' : 'TẤN CÔNG'}.`);
    }
    
    card.hasChangedPosition = true;
    d.selectedFieldCard = null;
    ygoRenderField();
};

window.ygoActionDeclareAttack = function(pos) {
    let d = ygoGame.duel;
    let card = d.playerMonsters[pos];
    if (!card || card.position === 'defense' || card.hasAttacked) return;
    
    d.selectedFieldCard = { side: 'player', type: 'monster', pos: pos };
    ygoLog(`⚔️ Hãy click chọn 1 quái thú đối thủ để tấn công (hoặc ô trống đối diện để tấn công trực diện).`);
};

window.ygoOpenExtraDeckModal = function() {
    let d = ygoGame.duel;
    if (!d || d.turn !== 'player' || !d.phase.includes('MAIN')) return;
    
    const modal = document.getElementById('ygoDeckSelectModal');
    const container = document.getElementById('ygoDeckSelectContainer');
    if (!modal || !container) return;
    
    modal.querySelector('h3').textContent = "🔮 TRIỆU HỒI TỪ EXTRA DECK";
    modal.querySelector('p').textContent = "Chọn quái thú Dung hợp / Đồng bộ / Xyz / Link.";
    container.innerHTML = '';
    
    if (!d.playerExtraDeck || d.playerExtraDeck.length === 0) {
        container.innerHTML = '<div style="color:#cbd5e1; padding: 15px; text-align:center; grid-column:1/-1;">Extra Deck trống!</div>';
    } else {
        d.playerExtraDeck.forEach((card, idx) => {
            const div = document.createElement('div');
            div.className = `ygo-mini-card monster`;
            div.style.borderColor = '#a855f7';
            div.innerHTML = `
                <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${card.name_vi}</div>
                <div style="font-size:0.48rem; color:#d8b4fe;">${card.atk !== null ? `A:${card.atk}` : card.card_type}</div>
            `;
            div.onmouseover = () => ygoHoverCard(card);
            div.onclick = () => {
                ygoSpecialSummonExtra(idx);
                modal.style.display = 'none';
            };
            container.appendChild(div);
        });
    }
    modal.style.display = 'flex';
};

window.ygoSpecialSummonExtra = function(idx) {
    let d = ygoGame.duel;
    let card = d.playerExtraDeck[idx];
    if (!card) return;
    
    let emptyIdx = d.playerMonsters.indexOf(null);
    if (emptyIdx === -1) {
        showToast("⚠️ Sân của bạn đã đầy quái thú!");
        return;
    }
    
    let confirmAtk = confirm(`Triệu hồi [${card.name_vi}] ở thế TẤN CÔNG? (Chọn Cancel để triệu hồi thế PHÒNG THỦ)`);
    let pos = confirmAtk ? 'attack' : 'defense';
    
    card.position = pos;
    card.faceUp = true;
    card.hasChangedPosition = true;
    card.currentAtk = parseInt(card.atk) || 0;
    card.currentDef = parseInt(card.def) || 0;
    
    d.playerMonsters[emptyIdx] = card;
    d.playerExtraDeck.splice(idx, 1);
    
    ygoLog(`🔮 Bạn Triệu hồi Đặc biệt [${card.name_vi}] ở thế ${pos === 'attack' ? 'TẤN CÔNG' : 'PHÒNG THỦ'}!`);
    ygoRenderField();
};

window.ygoCheckAromaStrategy = function() {
    let d = ygoGame.duel;
    let textEl = document.getElementById('ygoAromaText');
    if (!textEl) {
        let sidePanel = document.querySelector('.ygo-side-panel');
        if (sidePanel) {
            let div = document.createElement('div');
            div.id = 'ygoAromaText';
            div.style.cssText = "font-size:0.7rem; color:#f0abfc; background:rgba(0,0,0,0.4); padding:5px; border-radius:6px; margin-bottom:8px; border:1px solid #c084fc; display:none; text-align:center;";
            sidePanel.insertBefore(div, sidePanel.firstChild);
            textEl = div;
        }
    }
    
    if (textEl) {
        if (ygoGame.myCharacter === 'mai' && d.playerDeck.length > 0) {
            let topCard = d.playerDeck[d.playerDeck.length - 1];
            textEl.textContent = `🔮 [Nước Hoa] Bài sắp rút: ${topCard.name_vi}`;
            textEl.style.display = 'block';
        } else {
            textEl.style.display = 'none';
        }
    }
};

window.ygoCheckMillenniumNecklace = function() {
    let d = ygoGame.duel;
    let textEl = document.getElementById('ygoIshizuDeckText');
    if (!textEl) {
        let sidePanel = document.querySelector('.ygo-side-panel');
        if (sidePanel) {
            let div = document.createElement('div');
            div.id = 'ygoIshizuDeckText';
            div.style.cssText = "font-size:0.65rem; color:#fde047; background:rgba(0,0,0,0.5); padding:5px; border-radius:6px; margin-bottom:8px; border:1px solid #eab308; display:none; text-align:left; line-height:1.3;";
            sidePanel.insertBefore(div, sidePanel.firstChild);
            textEl = div;
        }
    }
    
    if (textEl) {
        if (ygoGame.myCharacter === 'ishizu' && d.oppDeck && d.oppDeck.length > 0) {
            let top3 = d.oppDeck.slice(-3).reverse();
            let names = top3.map((c, i) => `${i+1}. ${c.name_vi || c.name_en}`).join('<br>');
            textEl.innerHTML = `🔮 [Vòng Cổ] Top 3 bài đối thủ:<br>${names}`;
            textEl.style.display = 'block';
        } else {
            textEl.style.display = 'none';
        }
    }
};

window.ygoActivateSkill = function() {
    let d = ygoGame.duel;
    if (d.turn !== 'player') {
        showToast("⚠️ Chỉ có thể kích hoạt kỹ năng trong lượt của bạn!");
        return;
    }
    if (d.myUsedSkill) {
        showToast("⚠️ Bạn đã kích hoạt kỹ năng trong trận này rồi!");
        return;
    }
    
    let charId = ygoGame.myCharacter;
    let char = ygoCharacters[charId];
    if (!char) return;
    
    try { audio.play('levelup'); } catch(e){}
    
    if (charId === 'kaiba') {
        let hasBEWD = d.playerHand.some(c => c.name_en.toLowerCase().includes("blue-eyes white dragon"));
        if (!hasBEWD) {
            showToast("⚠️ Bạn cần Rồng Trắng Mắt Xanh trên tay để dùng kỹ năng!");
            return;
        }
        d.freeBlueEyes = true;
        d.myUsedSkill = true;
        ygoLog(`🔥 [Kỹ Năng] Kaiba kích hoạt [Kiêu Hãnh Của Rồng]! Lần triệu hồi Rồng Trắng Mắt Xanh tiếp theo không cần hiến tế.`);
    }
    else if (charId === 'marik') {
        let oppMonIndices = d.oppMonsters.map((m, i) => m !== null ? i : null).filter(v => v !== null);
        let handMonIdx = d.playerHand.findIndex(c => c.card_type === 'Monster');
        
        if (oppMonIndices.length === 0 || handMonIdx === -1 || d.playerLP <= 1000) {
            showToast("⚠️ Điều kiện dùng kỹ năng hiến tế bóng tối không đủ!");
            return;
        }
        
        let targetIdx = oppMonIndices[0];
        let sacrificed = d.oppMonsters[targetIdx];
        d.oppGY.push(sacrificed);
        d.oppMonsters[targetIdx] = null;
        
        let summoned = d.playerHand.splice(handMonIdx, 1)[0];
        let emptyIdx = d.playerMonsters.indexOf(null);
        if (emptyIdx !== -1) {
            ygoPerformSummon('player', summoned, emptyIdx, 'attack');
        }
        
        let cost = Math.floor(d.playerLP / 2);
        d.playerLP -= cost;
        d.myUsedSkill = true;
        ygoLog(`🔥 [Kỹ Năng] Marik kích hoạt [Hiến Tế Bóng Tối]: hiến tế [${sacrificed.name_vi}] và trừ ${cost} LP.`);
        ygoUpdateLP();
        ygoRenderField();
        ygoCheckWinConditions();
    }
    else if (charId === 'bakura') {
        let oppGyMon = d.oppGY.filter(c => c.card_type === 'Monster');
        let emptyIdx = d.playerMonsters.indexOf(null);
        if (oppGyMon.length === 0 || emptyIdx === -1) {
            showToast("⚠️ Mộ bài đối thủ trống hoặc sân bạn đầy!");
            return;
        }
        oppGyMon.sort((a,b) => (parseInt(b.atk)||0) - (parseInt(a.atk)||0));
        let target = oppGyMon[0];
        d.oppGY.splice(d.oppGY.indexOf(target), 1);
        target.attribute = 'DARK';
        ygoPerformSummon('player', target, emptyIdx, 'attack');
        d.myUsedSkill = true;
        ygoLog(`🔥 [Kỹ Năng] Bakura kích hoạt [Kẻ Trộm Mộ]: cướp quái [${target.name_vi}] sang hệ tối (DARK).`);
    }
    else if (charId === 'keith') {
        if (d.playerHand.length === 0) {
            showToast("⚠️ Không có bài trên tay!");
            return;
        }
        let cardSeven = {
            name_en: "7 Completed",
            name_vi: "7 Hoàn Hảo",
            card_type: "Spell",
            property: "Equip",
            anime_effect_en: "Equip only to a Machine monster. It gains 700 ATK.",
            anime_effect_vi: "Trang bị cho quái thú Máy Móc. Tăng 700 ATK."
        };
        d.playerHand[0] = cardSeven;
        d.myUsedSkill = true;
        ygoLog(`🔥 [Kỹ Năng] Bandit Keith kích hoạt [Gian Lận Súng Sáu]: Biến lá bài đầu trên tay thành phép '7 Hoàn Hảo'.`);
        ygoRenderField();
    }
    else if (charId === 'arkana') {
        let emptyIdx = d.playerMonsters.indexOf(null);
        let dmIdx = d.playerDeck.findIndex(c => c.name_en.toLowerCase().includes("dark magician"));
        if (emptyIdx === -1 || dmIdx === -1 || d.playerLP <= 1000) {
            showToast("⚠️ Không đủ điều kiện triệu hồi Phù Thuỷ Áo Đen!");
            return;
        }
        let dm = d.playerDeck.splice(dmIdx, 1)[0];
        ygoPerformSummon('player', dm, emptyIdx, 'attack');
        d.playerLP -= 1000;
        d.myUsedSkill = true;
        ygoLog(`🔥 [Kỹ Năng] Arkana kích hoạt [Phù Thuỷ Áo Đen Độc Ác]: Trả 1000 LP để triệu hồi Phù Thuỷ Áo Đen.`);
        ygoUpdateLP();
        ygoRenderField();
        ygoCheckWinConditions();
    }
    else if (charId === 'paradox_brothers') {
        let monIdx = d.playerMonsters.findIndex(m => m !== null);
        if (monIdx === -1) return;
        let m = d.playerMonsters[monIdx];
        m.name_vi = "Bức Tường Mê Cung";
        m.name_en = "Labyrinth Wall";
        m.def = 3000;
        m.currentDef = 3000;
        d.myUsedSkill = true;
        ygoLog(`🔥 [Kỹ Năng] Anh Em Mê Cung kích hoạt [Hợp Thể Mê Cung] biến quái thành Bức Tường Mê Cung.`);
        ygoRenderField();
    }
    else if (charId === 'zigfried') {
        let fairy = [];
        for (let i = d.playerHand.length - 1; i >= 0; i--) {
            if (d.playerHand[i].card_type === 'Monster' && (d.playerHand[i].monster_type || '').toLowerCase().includes('fairy')) {
                fairy.push(d.playerHand[i]);
                d.playerHand.splice(i, 1);
            }
        }
        if (fairy.length === 0) return;
        fairy.forEach(c => {
            let emptyIdx = d.playerMonsters.indexOf(null);
            if (emptyIdx !== -1) {
                ygoPerformSummon('player', c, emptyIdx, 'attack');
                d.zigfriedBanishList.push(c);
            } else {
                d.playerGY.push(c);
            }
        });
        d.myUsedSkill = true;
        ygoLog(`🔥 [Kỹ Năng] Zigfried kích hoạt [Bản Hùng Ca Valkyrie] triệu hồi đặc biệt các Valkyrie.`);
        ygoRenderField();
    }
    else if (charId === 'lumis_umbra') {
        d.lumisLockedZone = { side: 'opponent', type: 'monster', index: 0 };
        d.lumisLockTurns = 3;
        d.myUsedSkill = true;
        ygoLog(`🔥 [Kỹ Năng] Lumis & Umbra phong ấn ô quái số 1 của đối thủ trong 3 lượt.`);
    }
    else {
        showToast(`💡 Vai chơi có kỹ năng bị động [${char.skillName}] hoạt động tự động!`);
    }
};

window.ygoGetEffectiveAtk = function(side, card) {
    if (!card) return 0;
    let baseAtk = parseInt(card.atk) || 0;
    let bonus = 0;
    
    let hasUmi = (ygoGame.myCharacter === 'mako' || ygoGame.oppCharacter === 'mako');
    if (hasUmi && card.attribute && card.attribute.toUpperCase() === 'WATER') {
        bonus += 500;
    }
    
    let myDartz = (side === 'player' && ygoGame.myCharacter === 'dartz');
    let oppDartz = (side === 'opponent' && ygoGame.oppCharacter === 'dartz');
    if (myDartz || oppDartz) {
        bonus += 500;
    }
    
    let d = ygoGame.duel;
    let gy = side === 'player' ? d.playerGY : d.oppGY;
    let myRafael = (side === 'player' && ygoGame.myCharacter === 'rafael' && gy.length === 0);
    let oppRafael = (side === 'opponent' && ygoGame.oppCharacter === 'rafael' && gy.length === 0);
    if (myRafael || oppRafael) {
        bonus += 1000;
    }
    
    return baseAtk + bonus;
};

window.ygoDamagePlayer = function(amount, reason) {
    let d = ygoGame.duel;
    let actualDamage = amount;
    
    if (ygoGame.myCharacter === 'valon') {
        let hasMachine = d.playerMonsters.some(m => m !== null && m.monster_type && m.monster_type.toLowerCase().includes('machine'));
        if (hasMachine) {
            ygoLog(`🛡️ [Giáp Trận] Valon chặn sát thương về 0!`);
            return;
        }
    }
    
    if (ygoGame.myCharacter === 'tea') {
        let recover = Math.floor(actualDamage * 0.5);
        d.playerLP = Math.max(0, d.playerLP - actualDamage + recover);
        ygoLog(`💖 [Tình Bạn] Tea Gardner hồi lại ${recover} LP từ ${actualDamage} sát thương.`);
    } else {
        d.playerLP = Math.max(0, d.playerLP - actualDamage);
        ygoLog(`💔 Bạn nhận ${actualDamage} sát thương từ ${reason}.`);
    }
    
    ygoUpdateLP();
    ygoCheckWinConditions();
    
    if (ygoGame.myCharacter === 'noah' && d.playerLP < 1000 && d.playerLP > 0 && !d.noahSkillUsed) {
        d.noahSkillUsed = true;
        ygoLog(`🌐 [Noah Reset] Trả toàn bộ quái trên sân về tay.`);
        for (let i = 0; i < 5; i++) {
            if (d.playerMonsters[i]) { d.playerHand.push(d.playerMonsters[i]); d.playerMonsters[i] = null; }
            if (d.oppMonsters[i]) { d.oppHand.push(d.oppMonsters[i]); d.oppMonsters[i] = null; }
        }
        ygoRenderField();
    }
    
    if (ygoGame.myCharacter === 'alister' && d.playerLP < 2000 && d.playerLP > 0 && !d.alisterSkillUsed) {
        d.alisterSkillUsed = true;
        d.playerHand = [];
        let emptyIdx = d.playerMonsters.indexOf(null);
        let ziggurat = {
            name_en: "Air Fortress Ziggurat", name_vi: "Pháo Đài Không Trung Ziggurat",
            card_type: "Monster", attribute: "WIND", monster_type: "Machine / Effect",
            level_rank: 8, atk: "2500", def: "2000",
            anime_effect_vi: "Không thể bị phá huỷ."
        };
        if (emptyIdx !== -1) d.playerMonsters[emptyIdx] = ziggurat;
        else d.playerGY.push(ziggurat);
        ygoLog(`🛡️ [Kỹ Năng] Alister huỷ tay, triệu hồi Pháo Đài Không Trung Ziggurat!`);
        ygoRenderField();
    }
};

window.ygoDamageOpponent = function(amount, reason) {
    let d = ygoGame.duel;
    let actualDamage = amount;
    
    if (ygoGame.oppCharacter === 'valon') {
        let hasMachine = d.oppMonsters.some(m => m !== null && m.monster_type && m.monster_type.toLowerCase().includes('machine'));
        if (hasMachine) {
            ygoLog(`🛡️ Bot Valon chặn sát thương về 0!`);
            return;
        }
    }
    
    if (ygoGame.oppCharacter === 'tea') {
        let recover = Math.floor(actualDamage * 0.5);
        d.oppLP = Math.max(0, d.oppLP - actualDamage + recover);
        ygoLog(`💖 Bot Tea Gardner hồi lại ${recover} LP.`);
    } else {
        d.oppLP = Math.max(0, d.oppLP - actualDamage);
        ygoLog(`💥 Đối thủ nhận ${actualDamage} sát thương từ ${reason}.`);
    }
    
    ygoUpdateLP();
    ygoCheckWinConditions();
    
    if (ygoGame.oppCharacter === 'noah' && d.oppLP < 1000 && d.oppLP > 0 && !d.noahSkillUsed) {
        d.noahSkillUsed = true;
        ygoLog(`🌐 [Noah Reset] Trả quái về tay.`);
        for (let i = 0; i < 5; i++) {
            if (d.playerMonsters[i]) { d.playerHand.push(d.playerMonsters[i]); d.playerMonsters[i] = null; }
            if (d.oppMonsters[i]) { d.oppHand.push(d.oppMonsters[i]); d.oppMonsters[i] = null; }
        }
        ygoRenderField();
    }
    
    if (ygoGame.oppCharacter === 'alister' && d.oppLP < 2000 && d.oppLP > 0 && !d.alisterSkillUsed) {
        d.alisterSkillUsed = true;
        d.oppHand = [];
        let emptyIdx = d.oppMonsters.indexOf(null);
        let ziggurat = {
            name_en: "Air Fortress Ziggurat", name_vi: "Pháo Đài Không Trung Ziggurat",
            card_type: "Monster", attribute: "WIND", monster_type: "Machine / Effect",
            level_rank: 8, atk: "2500", def: "2000",
            anime_effect_vi: "Không thể bị phá huỷ."
        };
        if (emptyIdx !== -1) d.oppMonsters[emptyIdx] = ziggurat;
        else d.oppGY.push(ziggurat);
        ygoLog(`🛡️ Bot Alister triệu hồi Ziggurat!`);
        ygoRenderField();
    }
};

window.ygoDestroyMonster = function(side, index) {
    let d = ygoGame.duel;
    let monsters = side === 'player' ? d.playerMonsters : d.oppMonsters;
    let gy = side === 'player' ? d.playerGY : d.oppGY;
    let char = side === 'player' ? ygoGame.myCharacter : ygoGame.oppCharacter;
    
    let mon = monsters[index];
    if (!mon) return;
    
    if (char === 'rafael' && gy.length === 0) {
        ygoLog(`🛡️ [Kỹ Năng] [${mon.name_vi}] kháng phá huỷ do Mộ bài trống!`);
        return;
    }
    
    let hasNecross = (mon.name_en && mon.name_en.toLowerCase().includes("necross"));
    if (char === 'gozaburo' && hasNecross) {
        let exodiaParts = gy.filter(c => c.name_en && c.name_en.toLowerCase().includes("exodia"));
        if (exodiaParts.length >= 5) {
            ygoLog(`🛡️ Exodia Necross trên sân Gozaburo bất tử!`);
            return;
        }
    }
    
    if (char === 'bonz' && mon.monster_type && mon.monster_type.toLowerCase().includes('zombie')) {
        ygoLog(`🧟 [Hồi Sinh] Zombie [${mon.name_vi}] tự hồi sinh ở thế thủ ATK=0!`);
        mon.currentAtk = 0;
        monsters[index] = mon;
    } else {
        gy.push(mon);
        monsters[index] = null;
    }
};

window.ygoFlipCoin = function(side) {
    let char = side === 'player' ? ygoGame.myCharacter : ygoGame.oppCharacter;
    if (char === 'joey') {
        ygoLog(`🎲 [May Mắn] Đồng xu luôn ngửa!`);
        return 'heads';
    }
    return Math.random() < 0.5 ? 'heads' : 'tails';
};

window.ygoRollDice = function(side) {
    let char = side === 'player' ? ygoGame.myCharacter : ygoGame.oppCharacter;
    let d = ygoGame.duel;
    if (char === 'joey') {
        ygoLog(`🎲 Xúc xắc luôn là 6!`);
        return 6;
    }
    
    let roll = Math.floor(Math.random() * 6) + 1;
    if (char === 'duke') {
        ygoLog(`🎲 Duke Devlin tung xúc xắc được ${roll}!`);
        if (roll % 2 === 0) {
            let monsters = side === 'player' ? d.playerMonsters : d.oppMonsters;
            monsters.forEach(m => {
                if (m) m.currentAtk = (parseInt(m.currentAtk || m.atk) || 0) + 500;
            });
        }
    }
    return roll;
};

window.ygoTriggerDestinyDraw = function() {
    let d = ygoGame.duel;
    ygoLog("✨ [Định Mệnh] Kích hoạt Rút Bài Định Mệnh!");
    try { audio.play('apocalypse'); } catch(e){}
    
    const container = document.getElementById('ygoDeckSelectContainer');
    if (!container) return;
    container.innerHTML = '';
    
    let sortedDeck = [...d.playerDeck].sort((a,b) => a.name_vi.localeCompare(b.name_vi));
    sortedDeck.forEach(card => {
        const div = document.createElement('div');
        let typeClass = card.card_type === 'Spell' ? 'spell' : (card.card_type === 'Trap' ? 'trap' : 'monster');
        div.className = `ygo-mini-card ${typeClass}`;
        div.innerHTML = `
            <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${card.name_vi}</div>
            <div style="font-size:0.48rem; color:#fcd34d;">${card.atk !== null ? `A:${card.atk}` : card.card_type}</div>
        `;
        div.onclick = () => ygoSelectDestinyCard(card);
        container.appendChild(div);
    });
    document.getElementById('ygoDeckSelectModal').style.display = 'flex';
};

window.ygoSelectDestinyCard = function(card) {
    let d = ygoGame.duel;
    let idx = d.playerDeck.findIndex(c => c.name_en === card.name_en);
    if (idx !== -1) {
        let selected = d.playerDeck.splice(idx, 1)[0];
        d.playerHand.push(selected);
        ygoLog(`🔮 Bạn đã chọn [${selected.name_vi}] lên tay!`);
        document.getElementById('ygoDeckSelectModal').style.display = 'none';
        ygoRenderField();
    }
};

window.ygoExecuteCardEffect = function(side, card, zoneIdx) {
    let d = ygoGame.duel;
    let name = card.name_en.toLowerCase();
    let isPlayer = (side === 'player');
    
    if (name.includes('pot of greed') || card.name_vi.includes('Hũ tham lam')) {
        ygoLog(`🧪 Hiệu ứng Pot of Greed: Rút 2 lá bài!`);
        ygoDrawCard(side);
        ygoDrawCard(side);
        
        setTimeout(() => {
            if(isPlayer) { d.playerGY.push(card); d.playerSpells[zoneIdx] = null; }
            else { d.oppGY.push(card); d.oppSpells[zoneIdx] = null; }
            ygoRenderField();
        }, 800);
    }
    else if (name.includes('raigeki') || card.name_vi.includes('Lôi kích')) {
        ygoLog(`💥 Hiệu ứng Raigeki: Tiêu diệt toàn bộ quái đối phương!`);
        let oppMon = isPlayer ? d.oppMonsters : d.playerMonsters;
        let oppGY = isPlayer ? d.oppGY : d.playerGY;
        for (let i = 0; i < 5; i++) {
            if (oppMon[i] !== null) { oppGY.push(oppMon[i]); oppMon[i] = null; }
        }
        
        setTimeout(() => {
            if(isPlayer) { d.playerGY.push(card); d.playerSpells[zoneIdx] = null; }
            else { d.oppGY.push(card); d.oppSpells[zoneIdx] = null; }
            ygoRenderField();
        }, 800);
    }
    else if (name.includes('monster reborn') || card.name_vi.includes('Phục sinh')) {
        let myGY = isPlayer ? d.playerGY : d.oppGY;
        let myMonsters = isPlayer ? d.playerMonsters : d.oppMonsters;
        let monstersInGy = myGY.filter(c => c.card_type === 'Monster');
        
        if (monstersInGy.length > 0) {
            monstersInGy.sort((a, b) => (parseInt(b.atk) || 0) - (parseInt(a.atk) || 0));
            let targetMon = monstersInGy[0];
            myGY.splice(myGY.indexOf(targetMon), 1);
            let emptyIdx = myMonsters.indexOf(null);
            if (emptyIdx !== -1) {
                targetMon.currentAtk = parseInt(targetMon.atk) || 0;
                targetMon.currentDef = parseInt(targetMon.def) || 0;
                targetMon.position = 'attack';
                targetMon.faceUp = true;
                myMonsters[emptyIdx] = targetMon;
                ygoLog(`🧪 Phục sinh quái [${targetMon.name_vi}] lên sân!`);
            }
        }
        
        setTimeout(() => {
            if(isPlayer) { d.playerGY.push(card); d.playerSpells[zoneIdx] = null; }
            else { d.oppGY.push(card); d.oppSpells[zoneIdx] = null; }
            ygoRenderField();
        }, 800);
    }
    else if (name.includes('dark hole') || card.name_vi.includes('Hố đen')) {
        ygoLog(`🖤 Hiệu ứng Hố đen: Tiêu diệt toàn bộ quái vật hai bên!`);
        for (let i = 0; i < 5; i++) {
            if (d.playerMonsters[i]) { d.playerGY.push(d.playerMonsters[i]); d.playerMonsters[i] = null; }
            if (d.oppMonsters[i]) { d.oppGY.push(d.oppMonsters[i]); d.oppMonsters[i] = null; }
        }
        
        setTimeout(() => {
            if(isPlayer) { d.playerGY.push(card); d.playerSpells[zoneIdx] = null; }
            else { d.oppGY.push(card); d.oppSpells[zoneIdx] = null; }
            ygoRenderField();
        }, 800);
    }
    else if (name.includes('card destruction') || card.name_vi.includes('Huỷ bài')) {
        ygoLog(`🧪 Hiệu ứng Card Destruction: Huỷ toàn bộ tay và rút lại số tương ứng!`);
        let pCount = d.playerHand.length;
        while(d.playerHand.length) d.playerGY.push(d.playerHand.pop());
        for (let i = 0; i < pCount; i++) ygoDrawCard('player');
        
        let oCount = d.oppHand.length;
        while(d.oppHand.length) d.oppGY.push(d.oppHand.pop());
        for (let i = 0; i < oCount; i++) ygoDrawCard('opponent');
        
        setTimeout(() => {
            if(isPlayer) { d.playerGY.push(card); d.playerSpells[zoneIdx] = null; }
            else { d.oppGY.push(card); d.oppSpells[zoneIdx] = null; }
            ygoRenderField();
        }, 800);
    }
    else if (name.includes('change of heart') || card.name_vi.includes('Trái tim')) {
        let oppMon = isPlayer ? d.oppMonsters : d.playerMonsters;
        let myMon = isPlayer ? d.playerMonsters : d.oppMonsters;
        let targetIdx = oppMon.findIndex(m => m !== null);
        let emptyIdx = myMon.indexOf(null);
        if (targetIdx !== -1 && emptyIdx !== -1) {
            let stolen = oppMon[targetIdx];
            oppMon[targetIdx] = null;
            myMon[emptyIdx] = stolen;
            d.changeOfHeartStolen = {
                monster: stolen, fromSide: isPlayer ? 'opponent' : 'player',
                fromIdx: targetIdx, toSide: side, toIdx: emptyIdx
            };
            ygoLog(`🧪 Cướp quái [${stolen.name_vi}] cho đến cuối lượt.`);
        }
        
        setTimeout(() => {
            if(isPlayer) { d.playerGY.push(card); d.playerSpells[zoneIdx] = null; }
            else { d.oppGY.push(card); d.oppSpells[zoneIdx] = null; }
            ygoRenderField();
        }, 800);
    }
};

window.ygoSurrender = function() {
    if(confirm("Bạn có chắc chắn muốn đầu hàng trận đấu này?")) {
        ygoLog("🏳️ Bạn đã đầu hàng!");
        ygoEndGame('opponent');
    }
};

// Kiểm tra thắng thua
function ygoCheckWinConditions() {
    let d = ygoGame.duel;
    if (d.playerLP <= 0) {
        ygoLog("💀 BẠN ĐÃ THẤT BẠI! Hãy phục hận ở trận đấu tiếp theo.");
        ygoEndGame('opponent');
    } else if (d.oppLP <= 0) {
        ygoLog(`🏆 BẠN ĐÃ CHIẾN THẮNG đối thủ ${d.opponentName}!`);
        ygoEndGame('player');
    }
}

function ygoEndGame(winner) {
    let d = ygoGame.duel;
    if(winner === 'player') {
        // Thưởng 100 Vàng khi thắng Bot
        if(window.player) {
            window.player.gold += 100;
            if(window.refreshHudDisplay) window.refreshHudDisplay();
        }
        alert(`🏆 CHIẾN THẮNG!\nBạn đã đánh bại ${d.opponentName}.\nNhận thưởng: 100 Vàng 💰!`);
    } else {
        alert(`💔 THẤT BẠI!\nBạn đã bị ${d.opponentName} hạ gục.`);
    }
    ygoShowScreen('lobby');
}

// ── ONLINE PVP SYSTEM (Firestore Realtime Integration) ─────────────
window.ygoRefreshPvpList = function() {
    const list = document.getElementById('ygoPvpPlayersList');
    if(!list) return;
    
    list.innerHTML = '';
    let players = window.networkPlayers || {};
    let count = 0;
    
    for(let id in players) {
        let p = players[id];
        if(id === window.myNetworkId || (Date.now() - p.lastSeen > 12000)) continue;
        count++;
        let div = document.createElement('div');
        div.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; background:rgba(255,255,255,0.05); padding:6px; border-radius:6px;";
        div.innerHTML = `
            <span>👤 ${p.name} (Lv.${p.level || 1})</span>
            <button class="ygo-btn" style="padding:4px 10px; font-size:0.75rem;" onclick="ygoSendInvite('${id}', '${p.name}')">Mời Đấu</button>
        `;
        list.appendChild(div);
    }
    
    if(count === 0) {
        list.innerHTML = '<span style="font-size:0.8rem; color:#64748b; display:block; text-align:center; padding:10px;">Không có ai online... Mở thêm tab để test!</span>';
    }
};

window.ygoSendInvite = function(targetId, targetName) {
    try { audio.play('click'); } catch(e){}
    if(typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: 'YUGIOH_PVP_INVITE',
            id: window.myNetworkId,
            targetId: targetId,
            senderName: window.player.name
        });
        showToast(`Đã gửi lời mời thách đấu tới ${targetName}!`);
    }
};

// Nhận lời mời đấu Yu-Gi-Oh! trực tuyến
window.ygoShowInvite = function(msg) {
    if(confirm(`🎮 ${msg.senderName} thách bạn đấu Bài Ma Thuật Yu-Gi-Oh! Nghênh chiến?`)) {
        if(typeof pvpChannel !== 'undefined') {
            pvpChannel.postMessage({
                type: 'YUGIOH_PVP_REPLY',
                id: window.myNetworkId,
                senderId: msg.id,
                targetId: msg.id,
                accepted: true,
                replierName: window.player.name
            });
        }
        
        // Khởi tạo trận đấu online
        ygoStartOnlineGame(msg.id, msg.senderName, false);
    } else {
        if(typeof pvpChannel !== 'undefined') {
            pvpChannel.postMessage({
                type: 'YUGIOH_PVP_REPLY',
                id: window.myNetworkId,
                senderId: msg.id,
                targetId: msg.id,
                accepted: false,
                replierName: window.player.name
            });
        }
    }
};

function ygoStartOnlineGame(opponentId, opponentName, isHost) {
    ygoLoadMyDeck();
    if(ygoGame.myDeck.length < 40) {
        showToast("⚠️ Hãy chuẩn bị bộ bài 40 lá trước khi chơi!");
        return;
    }
    
    // Tách Extra Deck người chơi
    let playerMainDeck = [];
    let playerExtraDeck = [];
    ygoGame.myDeck.forEach(c => {
        let mt = (c.monster_type || '').toLowerCase();
        if (c.card_type === 'Monster' && (mt.includes('fusion') || mt.includes('synchro') || mt.includes('xyz') || mt.includes('link'))) {
            playerExtraDeck.push(c);
        } else {
            playerMainDeck.push(c);
        }
    });
    
    ygoGame.duel = {
        mode: 'pvp',
        opponentId: opponentId,
        opponentName: opponentName,
        playerLP: 8000,
        oppLP: 8000,
        playerHand: [],
        oppHand: [],
        playerDeck: playerMainDeck,
        oppDeck: [], // Bài của đối thủ tự quản lý, chỉ sync số lượng
        playerExtraDeck: playerExtraDeck,
        oppExtraDeck: [], 
        playerGY: [],
        oppGY: [],
        playerMonsters: [null, null, null, null, null],
        playerSpells: [null, null, null, null, null],
        oppMonsters: [null, null, null, null, null],
        oppSpells: [null, null, null, null, null],
        playerFieldSpell: null,
        oppFieldSpell: null,
        turn: isHost ? 'player' : 'opponent',
        phase: 'DRAW',
        hasNormalSummoned: false,
        selectedHandIndex: null,
        selectedZoneIndex: null,
        selectedFieldCard: null,
        logs: [],
        turnCount: 1
    };
    
    // Weevil Underwood's Parasite Paracide skill trigger:
    const parasiteCard = {
        name_en: "Parasite Paracide",
        name_vi: "Ký Sinh Trùng Kẻ Gây Hại",
        card_type: "Monster",
        attribute: "EARTH",
        monster_type: "Insect / Effect",
        level_rank: 2,
        atk: "500",
        def: "3000",
        anime_effect_en: "When drawn: take 1000 LP damage, and all your face-up monsters become Insect-Type.",
        anime_effect_vi: "Khi rút được: trừ 1000 LP người rút, biến toàn bộ quái trên sân của họ thành Côn trùng."
    };

    if (ygoGame.myCharacter === 'weevil') {
        // If player is Weevil, they normally inject into opponent's deck. In online PvP, the host/client will handle their own draw.
        // We'll notify opponent or we let opponent check if myCharacter is weevil and inject on their side when applying network state!
    }
    
    ygoShuffle(ygoGame.duel.playerDeck);
    
    for (let i = 0; i < 5; i++) {
        ygoDrawCard('player');
    }
    
    ygoShowScreen('duel');
    document.getElementById('oppNameDisplay').textContent = opponentName;
    
    ygoLog("⚔️ BẮT ĐẦU ĐẤU BÀI PVP ONLINE!");
    ygoLog(`👤 Đối thủ: ${opponentName}`);
    
    ygoRenderField();
    ygoUpdateLP();
    
    if(ygoGame.duel.turn === 'player') {
        ygoStartPhase('DRAW');
    }
    
    // Đồng bộ trạng thái phòng
    ygoSendSyncState("⚔️ Bắt đầu trận đấu PvP!");
}

// Đồng bộ hóa trạng thái Duel PvP lên Firestore
function ygoSendSyncState(actionLog) {
    let d = ygoGame.duel;
    if(d.mode !== 'pvp') return;
    
    if(typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: 'YUGIOH_PVP_STATE',
            id: window.myNetworkId,
            targetId: d.opponentId,
            playerLP: d.playerLP,
            oppLP: d.oppLP,
            playerHandCount: d.playerHand.length,
            playerMonsters: d.playerMonsters,
            playerSpells: d.playerSpells,
            playerFieldSpell: d.playerFieldSpell,
            playerExtraDeckCount: d.playerExtraDeck.length,
            turn: d.turn,
            phase: d.phase,
            turnCount: d.turnCount || 1,
            myCharacter: ygoGame.myCharacter,
            actionLog: actionLog || ""
        });
    }
}

// Áp dụng trạng thái nhận được từ đối thủ
window.ygoApplyNetworkState = function(msg) {
    let d = ygoGame.duel;
    if(d.mode !== 'pvp' || d.opponentId !== msg.id) return;
    
    // Cập nhật LP của đối thủ (đối thủ LP = playerLP của msg)
    d.oppLP = msg.playerLP;
    d.playerLP = msg.oppLP; // Đảm bảo khớp
    
    // Đồng bộ hóa vùng Monster / Spells của đối thủ
    d.oppMonsters = msg.playerMonsters;
    d.oppSpells = msg.playerSpells;
    d.oppFieldSpell = msg.playerFieldSpell;
    
    // Đồng bộ hóa Extra Deck đối thủ
    let oppExtraPlaceholder = [];
    for(let i=0; i<(msg.playerExtraDeckCount || 0); i++) oppExtraPlaceholder.push({});
    d.oppExtraDeck = oppExtraPlaceholder;
    
    // Số lượng bài trên tay đối thủ
    let oppHandPlaceholder = [];
    for(let i=0; i<msg.playerHandCount; i++) oppHandPlaceholder.push({});
    d.oppHand = oppHandPlaceholder;
    
    // Đồng bộ hóa lượt đi và phase
    d.turn = (msg.turn === 'player') ? 'opponent' : 'player';
    d.phase = msg.phase;
    d.turnCount = msg.turnCount || 1;
    document.getElementById('ygoPhaseText').textContent = `${d.phase} PHASE`;
    
    // Đồng bộ hóa nhân vật đối thủ
    ygoGame.oppCharacter = msg.myCharacter;
    
    // Weevil Parasite Paracide injection check for PvP:
    if (ygoGame.oppCharacter === 'weevil' && !d.parasiteInfested) {
        d.parasiteInfested = true;
        const parasiteCard = {
            name_en: "Parasite Paracide",
            name_vi: "Ký Sinh Trùng Kẻ Gây Hại",
            card_type: "Monster",
            attribute: "EARTH",
            monster_type: "Insect / Effect",
            level_rank: 2,
            atk: "500",
            def: "3000",
            anime_effect_en: "When drawn: take 1000 LP damage, and all your face-up monsters become Insect-Type.",
            anime_effect_vi: "Khi rút được: trừ 1000 LP người rút, biến toàn bộ quái trên sân của họ thành Côn trùng."
        };
        d.playerDeck.splice(Math.floor(d.playerDeck.length / 3), 0, {...parasiteCard});
        d.playerDeck.splice(Math.floor(d.playerDeck.length * 2 / 3), 0, {...parasiteCard});
        ygoLog("🐛 [Kẻ Đặt Bẫy Côn Trùng] Weevil đối thủ lén nhét 2 lá Ký Sinh Trùng vào bộ bài của bạn!");
    }
    
    if (msg.actionLog) {
        ygoLog(msg.actionLog);
    }
    
    ygoUpdateLP();
    ygoRenderField();
};

// Xử lý phản hồi thách đấu trực tuyến
window.ygoHandlePvpReply = function(msg) {
    if(msg.accepted) {
        showToast(`✅ ${msg.replierName} đã CHẤP NHẬN thách đấu! Vào phòng đấu...`);
        ygoStartOnlineGame(msg.id, msg.replierName, true);
    } else {
        showToast(`❌ ${msg.replierName} đã TỪ CHỐI lời mời đấu bài.`);
    }
};

// Đăng ký nhận tin nhắn mạng Yu-Gi-Oh! trong game.js
window.ygoRegisterNetworkMessage = function(msg) {
    if (msg.type === 'YUGIOH_PVP_INVITE' && msg.targetId === window.myNetworkId) {
        window.ygoShowInvite(msg);
    }
    else if (msg.type === 'YUGIOH_PVP_REPLY' && msg.targetId === window.myNetworkId) {
        window.ygoHandlePvpReply(msg);
    }
    else if (msg.type === 'YUGIOH_PVP_STATE' && msg.targetId === window.myNetworkId) {
        window.ygoApplyNetworkState(msg);
    }
};

console.log("🃏 [yugioh.js] Game bài Ma Thuật Yu-Gi-Oh! loaded!");
