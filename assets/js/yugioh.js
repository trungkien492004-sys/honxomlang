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
    
    ygoLog("⚔️ TRẬN ĐẤU BẮT ĐẦU!");
    ygoLog(`👤 Đối thủ: ${ygoGame.duel.opponentName}`);
    ygoLog(`⭐ Đi trước: ${ygoGame.duel.turn === 'player' ? 'BẠN' : 'ĐỐI THỦ'}`);
    
    ygoRenderField();
    ygoUpdateLP();
    
    // Nếu Bot đi trước, kích hoạt Bot đánh
    if (ygoGame.duel.turn === 'opponent') {
        setTimeout(ygoRunBotTurn, 1000);
    } else {
        ygoStartPhase('DRAW');
    }
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
            // Check if player is Ishizu or Espa Roba (with trap cards)
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
                let posText = c.position === 'defense' ? 'DEF' : 'ATK';
                let statVal = c.position === 'defense' ? (c.currentDef || c.def) : (c.currentAtk || c.atk);
                
                let isSelected = d.selectedFieldCard && d.selectedFieldCard.side === 'player' && d.selectedFieldCard.type === 'monster' && d.selectedFieldCard.pos === i;
                let borderStyle = isSelected ? 'border-color: #fbbf24; box-shadow: 0 0 8px #fbbf24;' : (c.position === 'defense' ? 'border-color: #3b82f6;' : '');
                let rotationStyle = c.position === 'defense' ? 'transform: rotate(90deg);' : '';
                let imgUrl = ygoGetCardImage(c);
                let bgStyle = `background: linear-gradient(rgba(10,8,6,0.65), rgba(10,8,6,0.65)), url('${imgUrl}') center/cover no-repeat;`;
                
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
    
    // Check Aroma Strategy (Mai) & Millennium Necklace (Ishizu)
    ygoCheckAromaStrategy();
    if (typeof ygoCheckMillenniumNecklace === 'function') {
        ygoCheckMillenniumNecklace();
    }

    // Render nút hành động bài ở khung chi tiết
    ygoRenderCardActions();
};

window.ygoGetCardImage = function(card) {
    if (!card) return '';
    
    // Normalize card properties on the fly to ensure compatibility
    if (!card.name_en && card.name) card.name_en = card.name;
    if (!card.name && card.name_en) card.name = card.name_en;
    
    // Check if anime exclusive: if there is 'anime_exclusive' in any string fields or if anime_exclusive is true/1
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
    
    // Auto-fetch image by English name from YGOPRODECK API
    let name = card.name || card.name_en || '';
    return `https://images.ygoprodeck.com/images/cards/${encodeURIComponent(name)}.jpg`;
};

// Hiển thị chi tiết lá bài khi hover chuột
window.ygoHoverCard = function(card) {
    if(!card) return;
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
        
        // Check if opponent card is face-down and needs hiding
        let reveal = false;
        if (type === 'monster') {
            reveal = (card.faceUp !== false) || (ygoGame.myCharacter === 'pegasus');
        } else if (type === 'spell') {
            reveal = (card.faceUp !== false) || (ygoGame.myCharacter === 'pegasus') || (ygoGame.myCharacter === 'espa_roba' && card.card_type === 'Trap');
        } else if (type === 'fieldspell') {
            reveal = true; // Field spells are always face-up/revealed once active
        }
        
        if (reveal) {
            ygoHoverCard(card);
        } else {
            // Conceal details
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
    if (!d || d.turn !== 'player') return; // Only player's turn shows actions!
    
    // Check if hand card is selected
    if (d.selectedHandIndex !== null) {
        let card = d.playerHand[d.selectedHandIndex];
        if (!card) return;
        
        if (card.card_type === 'Monster') {
            if (d.phase.includes('MAIN')) {
                // Summon Button
                const btnSummon = document.createElement('button');
                btnSummon.className = 'ygo-btn';
                btnSummon.style.background = 'linear-gradient(to right, #b45309, #78350f)';
                btnSummon.textContent = '⚔️ Triệu Hồi Tấn Công';
                btnSummon.onclick = () => ygoActionSummon(false);
                container.appendChild(btnSummon);
                
                // Set Button
                const btnSet = document.createElement('button');
                btnSet.className = 'ygo-btn ygo-btn-secondary';
                btnSet.textContent = '🛡️ Úp Phòng Thủ';
                btnSet.onclick = () => ygoActionSummon(true);
                container.appendChild(btnSet);
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
                    if (card.position === 'defense') {
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
                    } else if (card.position !== 'defense') {
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

window.ygoActionSummon = function(isDefense) {
    let d = ygoGame.duel;
    if (d.selectedHandIndex === null) return;
    let card = d.playerHand[d.selectedHandIndex];
    if (!card || card.card_type !== 'Monster') return;
    
    if (d.hasNormalSummoned) {
        showToast("⚠️ Bạn đã Triệu hồi Thường 1 quái thú ở lượt này rồi!");
        return;
    }
    
    let emptyIdx = d.playerMonsters.indexOf(null);
    if (emptyIdx === -1) {
        showToast("⚠️ Sân quái thú của bạn đã đầy!");
        return;
    }
    
    let lvl = card.level_rank || 1;
    let tributesNeeded = lvl >= 7 ? 2 : (lvl >= 5 ? 1 : 0);
    
    // Seto Kaiba: Pride of Blue-Eyes
    if (ygoGame.myCharacter === 'kaiba' && card.name_en.toLowerCase().includes("blue-eyes white dragon")) {
        if (d.freeBlueEyes) {
            tributesNeeded = 0;
            d.freeBlueEyes = false;
            ygoLog(`🐉 [Kiêu Hãnh Của Rồng] Triệu hồi Rồng Trắng Mắt Xanh không cần hiến tế!`);
        }
    }
    
    let aliveMonstersCount = d.playerMonsters.filter(m => m !== null).length;
    if (aliveMonstersCount < tributesNeeded) {
        showToast(`⚠️ Cần ${tributesNeeded} quái thú tế phẩm trên sân để triệu hồi!`);
        return;
    }
    
    // Tribute if needed
    if (tributesNeeded > 0) {
        let tCount = 0;
        for (let mIdx = 0; mIdx < 5; mIdx++) {
            if (d.playerMonsters[mIdx] !== null) {
                ygoLog(`🕯️ Hiến tế quái thú: [${d.playerMonsters[mIdx].name_vi}] làm tế phẩm.`);
                d.playerGY.push(d.playerMonsters[mIdx]);
                d.playerMonsters[mIdx] = null;
                tCount++;
                if (tCount >= tributesNeeded) break;
            }
        }
    }
    
    try { audio.play('levelup'); } catch(e){}
    card.currentAtk = parseInt(card.atk) || 0;
    card.currentDef = parseInt(card.def) || 0;
    card.position = isDefense ? 'defense' : 'attack';
    card.faceUp = !isDefense;
    
    d.playerMonsters[emptyIdx] = card;
    d.playerHand.splice(d.selectedHandIndex, 1);
    d.hasNormalSummoned = true;
    d.selectedHandIndex = null;
    
    if (isDefense) {
        ygoLog(`💥 Bạn úp 1 quái thú ở thế PHÒNG THỦ.`);
    } else {
        ygoLog(`💥 Bạn triệu hồi quái thú: [${card.name_vi}] (ATK: ${card.atk})`);
    }
    
    ygoRenderField();
    if (d.mode === 'pvp') {
        ygoSendSyncState(isDefense ? `💥 Đối thủ úp 1 quái thú ở thế PHÒNG THỦ.` : `💥 Đối thủ triệu hồi quái thú: [${card.name_vi}] (ATK: ${card.atk})`);
    }
};

window.ygoActionActivateSpell = function() {
    let d = ygoGame.duel;
    if (d.selectedHandIndex === null) return;
    let card = d.playerHand[d.selectedHandIndex];
    if (!card) return;
    
    let emptyIdx = d.playerSpells.indexOf(null);
    if (emptyIdx === -1) {
        showToast("⚠️ Ô bài phép/bẫy của bạn đã đầy!");
        return;
    }
    
    try { audio.play('click'); } catch(e){}
    card.faceUp = true;
    d.playerSpells[emptyIdx] = card;
    d.playerHand.splice(d.selectedHandIndex, 1);
    d.selectedHandIndex = null;
    
    ygoLog(`🃏 Bạn kích hoạt Spell: [${card.name_vi}]`);
    
    // Rebecca passive
    if (ygoGame.myCharacter === 'rebecca') {
        ygoLog(`✨ [Thần Đồng Công Nghệ] Rebecca kích hoạt Spell. Gây 400 sát thương lên đối thủ!`);
        ygoDamageOpponent(400, "hiệu ứng Rebecca");
    }
    
    ygoExecuteCardEffect('player', card, emptyIdx);
    
    ygoRenderField();
    if (d.mode === 'pvp') {
        ygoSendSyncState(`🃏 Đối thủ kích hoạt Spell: [${card.name_vi}]`);
    }
};

window.ygoActionSetSpellTrap = function() {
    let d = ygoGame.duel;
    if (d.selectedHandIndex === null) return;
    let card = d.playerHand[d.selectedHandIndex];
    if (!card) return;
    
    let emptyIdx = d.playerSpells.indexOf(null);
    if (emptyIdx === -1) {
        showToast("⚠️ Ô bài phép/bẫy của bạn đã đầy!");
        return;
    }
    
    try { audio.play('click'); } catch(e){}
    card.faceUp = false;
    d.playerSpells[emptyIdx] = card;
    d.playerHand.splice(d.selectedHandIndex, 1);
    d.selectedHandIndex = null;
    
    ygoLog(`🃏 Bạn úp 1 lá bài Phép/Bẫy xuống sân.`);
    ygoRenderField();
    if (d.mode === 'pvp') {
        ygoSendSyncState(`🃏 Đối thủ úp 1 lá bài Phép/Bẫy xuống sân.`);
    }
};

window.ygoActionActivateFieldSpell = function() {
    let d = ygoGame.duel;
    if (d.selectedHandIndex === null) return;
    let card = d.playerHand[d.selectedHandIndex];
    if (!card) return;
    
    try { audio.play('click'); } catch(e){}
    if (d.playerFieldSpell) {
        ygoLog(`🗑️ Gửi bài môi trường cũ [${d.playerFieldSpell.name_vi}] xuống Mộ bài.`);
        d.playerGY.push(d.playerFieldSpell);
    }
    
    card.faceUp = true;
    d.playerFieldSpell = card;
    d.playerHand.splice(d.selectedHandIndex, 1);
    d.selectedHandIndex = null;
    
    ygoLog(`🏞️ Bạn kích hoạt Bài Môi Trường: [${card.name_vi}]`);
    ygoRenderField();
    if (d.mode === 'pvp') {
        ygoSendSyncState(`🏞️ Đối thủ kích hoạt Bài Môi Trường: [${card.name_vi}]`);
    }
};

window.ygoActionChangePosition = function(pos) {
    let d = ygoGame.duel;
    let mon = d.playerMonsters[pos];
    if (!mon) return;
    
    if (mon.position === 'defense') {
        mon.position = 'attack';
        mon.faceUp = true;
        ygoLog(`🔄 Lật mặt / Chuyển quái thú [${mon.name_vi}] sang thế TẤN CÔNG (ATK).`);
    } else {
        mon.position = 'defense';
        ygoLog(`🔄 Chuyển quái thú [${mon.name_vi}] sang thế PHÒNG THỦ (DEF).`);
    }
    
    ygoRenderField();
    if (d.mode === 'pvp') ygoSendSyncState();
};

window.ygoActionDeclareAttack = function(pos) {
    let d = ygoGame.duel;
    let myMon = d.playerMonsters[pos];
    if (!myMon) return;
    
    d.selectedFieldCard = { side: 'player', type: 'monster', pos: pos };
    ygoLog(`⚔️ Tuyên bố tấn công với [${myMon.name_vi}]! Click vào quái đối thủ để tấn công hoặc click vào ô đối diện trống để Tấn công trực diện.`);
};

window.ygoActionActivateSetCard = function(pos) {
    let d = ygoGame.duel;
    let card = d.playerSpells[pos];
    if (!card) return;
    
    try { audio.play('click'); } catch(e){}
    card.faceUp = true;
    ygoLog(`🃏 Bạn kích hoạt bài úp: [${card.name_vi}]`);
    
    ygoExecuteCardEffect('player', card, pos);
    
    ygoRenderField();
    if (d.mode === 'pvp') {
        ygoSendSyncState(`🃏 Đối thủ kích hoạt bài úp: [${card.name_vi}]`);
    }
};

window.ygoOpenExtraDeckModal = function() {
    let d = ygoGame.duel;
    if (!d) return;
    if (d.turn !== 'player') {
        showToast("⚠️ Chỉ có thể triệu hồi Đặc biệt từ Extra Deck trong lượt của bạn!");
        return;
    }
    if (!d.phase.includes('MAIN')) {
        showToast("⚠️ Chỉ có thể triệu hồi từ Extra Deck trong Main Phase 1 hoặc Main Phase 2!");
        return;
    }
    
    const modal = document.getElementById('ygoDeckSelectModal');
    const container = document.getElementById('ygoDeckSelectContainer');
    if (!modal || !container) return;
    
    modal.querySelector('h3').textContent = "🔮 TRIỆU HỒI TỪ EXTRA DECK";
    modal.querySelector('p').textContent = "Chọn một quái thú Dung hợp/Đồng bộ/Xyz/Link để Triệu hồi Đặc biệt lên sân.";
    
    container.innerHTML = '';
    
    if (!d.playerExtraDeck || d.playerExtraDeck.length === 0) {
        container.innerHTML = '<div style="color:#cbd5e1; font-size:0.85rem; padding: 15px; grid-column:1/-1; text-align:center;">Extra Deck trống!</div>';
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
    if (!d || d.turn !== 'player') return;
    
    let card = d.playerExtraDeck[idx];
    if (!card) return;
    
    let emptyIdx = d.playerMonsters.indexOf(null);
    if (emptyIdx === -1) {
        showToast("⚠️ Sân của bạn đã đầy quái thú!");
        return;
    }
    
    let isDefense = !confirm(`Bạn muốn Triệu hồi Đặc biệt [${card.name_vi}] ở thế TẤN CÔNG? (Chọn Cancel để ÚP PHÒNG THỦ hoặc THẾ THỦ)`);
    
    try { audio.play('levelup'); } catch(e){}
    card.currentAtk = parseInt(card.atk) || 0;
    card.currentDef = parseInt(card.def) || 0;
    card.position = isDefense ? 'defense' : 'attack';
    card.faceUp = true; // Always face-up for special summons in general
    
    d.playerMonsters[emptyIdx] = card;
    d.playerExtraDeck.splice(idx, 1);
    
    ygoLog(`🔮 Bạn Triệu hồi Đặc biệt [${card.name_vi}] từ Extra Deck ở thế ${isDefense ? 'PHÒNG THỦ' : 'TẤN CÔNG'}!`);
    ygoRenderField();
    if (d.mode === 'pvp') {
        ygoSendSyncState(`🔮 Đối thủ Triệu hồi Đặc biệt [${card.name_vi}] từ Extra Deck ở thế ${isDefense ? 'PHÒNG THỦ' : 'TẤN CÔNG'}!`);
    }
};

// Xử lý Click vào ô trên bàn đấu
// ── HỆ THỐNG KỸ NĂNG VAI CHƠI CHI TIẾT (30 NHÂN VẬT) ─────────────────
function ygoGetEffectiveAtk(side, card) {
    if (!card) return 0;
    let baseAtk = parseInt(card.atk) || 0;
    let bonus = 0;
    
    // Mako: Ocean Kingdom -> Water +500 ATK
    let hasUmi = (ygoGame.myCharacter === 'mako' || ygoGame.oppCharacter === 'mako');
    if (hasUmi && card.attribute && card.attribute.toUpperCase() === 'WATER') {
        bonus += 500;
    }
    
    // Dartz: Seal of Orichalcos -> +500 ATK to own monsters
    let myDartz = (side === 'player' && ygoGame.myCharacter === 'dartz');
    let oppDartz = (side === 'opponent' && ygoGame.oppCharacter === 'dartz');
    if (myDartz || oppDartz) {
        bonus += 500;
    }
    
    // Rafael: GY empty -> +1000 ATK
    let d = ygoGame.duel;
    let gy = side === 'player' ? d.playerGY : d.oppGY;
    let myRafael = (side === 'player' && ygoGame.myCharacter === 'rafael' && gy.length === 0);
    let oppRafael = (side === 'opponent' && ygoGame.oppCharacter === 'rafael' && gy.length === 0);
    if (myRafael || oppRafael) {
        bonus += 1000;
    }
    
    return baseAtk + bonus;
}

function ygoDamagePlayer(amount, reason) {
    let d = ygoGame.duel;
    let actualDamage = amount;
    
    // Valon: Armor Active (Nếu có quái Machine trên sân, damage = 0)
    if (ygoGame.myCharacter === 'valon') {
        let hasMachine = d.playerMonsters.some(m => m !== null && m.monster_type && m.monster_type.toLowerCase().includes('machine'));
        if (hasMachine) {
            ygoLog(`🛡️ [Giáp Trận Công Nghệ] Valon sở hữu quái thú Máy Móc trên sân. Sát thương nhận vào giảm về 0!`);
            return;
        }
    }
    
    // Téa: Friendship Power (Hồi lại 50% LP bị trừ)
    if (ygoGame.myCharacter === 'tea') {
        let recover = Math.floor(actualDamage * 0.5);
        d.playerLP = Math.max(0, d.playerLP - actualDamage + recover);
        ygoLog(`💖 [Sức Mạnh Tình Bạn] Téa Gardner hồi lại ${recover} LP từ ${actualDamage} sát thương.`);
    } else {
        d.playerLP = Math.max(0, d.playerLP - actualDamage);
        ygoLog(`💔 Bạn nhận ${actualDamage} sát thương từ ${reason}.`);
    }
    
    ygoUpdateLP();
    ygoCheckWinConditions();
    
    // Noah: Virtual World Reset (Khi LP dưới 1000 sau đòn đánh)
    if (ygoGame.myCharacter === 'noah' && d.playerLP < 1000 && d.playerLP > 0 && !d.noahSkillUsed) {
        d.noahSkillUsed = true;
        ygoLog(`🌐 [Thế Giới Ảo] Noah kích hoạt Reset: Trả toàn bộ quái thú trên sân của hai bên về tay chủ!`);
        for (let i = 0; i < 5; i++) {
            if (d.playerMonsters[i]) {
                d.playerHand.push(d.playerMonsters[i]);
                d.playerMonsters[i] = null;
            }
            if (d.oppMonsters[i]) {
                d.oppHand.push(d.oppMonsters[i]);
                d.oppMonsters[i] = null;
            }
        }
        ygoRenderField();
    }
    
    // Alister: Ziggurat Summon (Khi LP dưới 2000)
    if (ygoGame.myCharacter === 'alister' && d.playerLP < 2000 && d.playerLP > 0 && !d.alisterSkillUsed) {
        d.alisterSkillUsed = true;
        ygoLog(`⚡ [Pháo Đài Ảo Ảnh] Alister huỷ toàn bộ bài trên tay để Triệu hồi Đặc biệt siêu quái thú Air Fortress Ziggurat!`);
        d.playerHand = [];
        let emptyIdx = d.playerMonsters.indexOf(null);
        let ziggurat = {
            name_en: "Air Fortress Ziggurat",
            name_vi: "Pháo Đài Không Trung Ziggurat",
            card_type: "Monster",
            attribute: "WIND",
            monster_type: "Machine / Effect",
            level_rank: 8,
            atk: "2500",
            def: "2000",
            anime_effect_en: "Cannot be destroyed.",
            anime_effect_vi: "Không thể bị phá huỷ."
        };
        if (emptyIdx !== -1) {
            d.playerMonsters[emptyIdx] = ziggurat;
        } else {
            d.playerGY.push(ziggurat);
        }
        ygoRenderField();
    }
}

function ygoDamageOpponent(amount, reason) {
    let d = ygoGame.duel;
    let actualDamage = amount;
    
    // Valon opponent passive
    if (ygoGame.oppCharacter === 'valon') {
        let hasMachine = d.oppMonsters.some(m => m !== null && m.monster_type && m.monster_type.toLowerCase().includes('machine'));
        if (hasMachine) {
            ygoLog(`🛡️ [Giáp Trận Công Nghệ] Bot Valon có quái Máy Móc. Sát thương nhận vào giảm về 0!`);
            return;
        }
    }
    
    // Téa opponent passive
    if (ygoGame.oppCharacter === 'tea') {
        let recover = Math.floor(actualDamage * 0.5);
        d.oppLP = Math.max(0, d.oppLP - actualDamage + recover);
        ygoLog(`💖 [Sức Mạnh Tình Bạn] Bot Téa Gardner hồi lại ${recover} LP.`);
    } else {
        d.oppLP = Math.max(0, d.oppLP - actualDamage);
        ygoLog(`💥 Đối thủ nhận ${actualDamage} sát thương từ ${reason}.`);
    }
    
    ygoUpdateLP();
    ygoCheckWinConditions();
    
    // Noah opponent passive
    if (ygoGame.oppCharacter === 'noah' && d.oppLP < 1000 && d.oppLP > 0 && !d.noahSkillUsed) {
        d.noahSkillUsed = true;
        ygoLog(`🌐 [Thế Giới Ảo] Bot Noah kích hoạt Reset: Trả toàn bộ quái về tay chủ!`);
        for (let i = 0; i < 5; i++) {
            if (d.playerMonsters[i]) {
                d.playerHand.push(d.playerMonsters[i]);
                d.playerMonsters[i] = null;
            }
            if (d.oppMonsters[i]) {
                d.oppHand.push(d.oppMonsters[i]);
                d.oppMonsters[i] = null;
            }
        }
        ygoRenderField();
    }
    
    // Alister opponent passive
    if (ygoGame.oppCharacter === 'alister' && d.oppLP < 2000 && d.oppLP > 0 && !d.alisterSkillUsed) {
        d.alisterSkillUsed = true;
        ygoLog(`⚡ [Pháo Đài Ảo Ảnh] Bot Alister huỷ tay triệu hồi Air Fortress Ziggurat!`);
        d.oppHand = [];
        let emptyIdx = d.oppMonsters.indexOf(null);
        let ziggurat = {
            name_en: "Air Fortress Ziggurat",
            name_vi: "Pháo Đài Không Trung Ziggurat",
            card_type: "Monster",
            attribute: "WIND",
            monster_type: "Machine / Effect",
            level_rank: 8,
            atk: "2500",
            def: "2000",
            anime_effect_en: "Cannot be destroyed.",
            anime_effect_vi: "Không thể bị phá huỷ."
        };
        if (emptyIdx !== -1) {
            d.oppMonsters[emptyIdx] = ziggurat;
        } else {
            d.oppGY.push(ziggurat);
        }
        ygoRenderField();
    }
}

function ygoDestroyMonster(side, index) {
    let d = ygoGame.duel;
    let monsters = side === 'player' ? d.playerMonsters : d.oppMonsters;
    let gy = side === 'player' ? d.playerGY : d.oppGY;
    let char = side === 'player' ? ygoGame.myCharacter : ygoGame.oppCharacter;
    
    let mon = monsters[index];
    if (!mon) return;
    
    // Rafael: Sức Mạnh Giữ Mình (Mộ trống -> kháng phá huỷ)
    if (char === 'rafael' && gy.length === 0) {
        ygoLog(`🛡️ [Sức Mạnh Giữ Mình] Mộ bài của ${side === 'player' ? 'Rafael' : 'Bot Rafael'} trống rơn. [${mon.name_vi}] kháng mọi phá huỷ!`);
        return;
    }
    
    // Gozaburo: Necross Immortality
    let hasNecross = (mon.name_en && mon.name_en.toLowerCase().includes("necross"));
    if (char === 'gozaburo' && hasNecross) {
        let exodiaParts = gy.filter(c => c.name_en && c.name_en.toLowerCase().includes("exodia"));
        if (exodiaParts.length >= 5) {
            ygoLog(`🔥 [Khát Vọng Báo Thù] Exodia Necross trên sân Gozaburo bất tử chặn đứng đòn tiêu diệt!`);
            return;
        }
    }
    
    // Bonz: Tiếng Gọi Nghĩa Địa (Hồi sinh quái Zombie thế thủ ATK=0)
    if (char === 'bonz' && mon.monster_type && mon.monster_type.toLowerCase().includes('zombie')) {
        ygoLog(`🧟 [Tiếng Gọi Nghĩa Địa] Zombie [${mon.name_vi}] tự động hồi sinh ở thế Thủ, ATK = 0!`);
        mon.currentAtk = 0;
        monsters[index] = mon; // Giữ lại trên sân
    } else {
        gy.push(mon);
        monsters[index] = null;
    }
}

function ygoFlipCoin(side) {
    let char = side === 'player' ? ygoGame.myCharacter : ygoGame.oppCharacter;
    if (char === 'joey') {
        ygoLog(`🎲 [Thần Bài May Mắn] Kết quả tung đồng xu luôn luôn NGỬA (Có lợi)!`);
        return 'heads';
    }
    return Math.random() < 0.5 ? 'heads' : 'tails';
}

function ygoRollDice(side) {
    let char = side === 'player' ? ygoGame.myCharacter : ygoGame.oppCharacter;
    let d = ygoGame.duel;
    if (char === 'joey') {
        ygoLog(`🎲 [Thần Bài May Mắn] Kết quả đổ xúc xắc luôn luôn là 6!`);
        return 6;
    }
    
    let roll = Math.floor(Math.random() * 6) + 1;
    // Duke Devlin: Xúc Xắc Ma Thuật
    if (char === 'duke') {
        ygoLog(`🎲 [Xúc Xắc Ma Thuật] Duke Devlin tung xúc xắc được ${roll}!`);
        if (roll % 2 === 0) {
            ygoLog(`✨ Số chẵn! Cộng ngay 500 ATK cho toàn bộ quái thú của Duke.`);
            let monsters = side === 'player' ? d.playerMonsters : d.oppMonsters;
            monsters.forEach(m => {
                if (m) m.currentAtk = (parseInt(m.currentAtk || m.atk) || 0) + 500;
            });
        } else {
            ygoLog(`✨ Số lẻ! Các quái thú chuyển thế thủ và kháng phá huỷ lượt này.`);
        }
    }
    return roll;
}

function ygoTriggerDestinyDraw() {
    let d = ygoGame.duel;
    ygoLog("✨ [KỸ NĂNG BẠN] Yugi Muto kích hoạt [RÚT BÀI ĐỊNH MỆNH]!");
    ygoLog("🎵 Nhạc nền kịch tính apocaylpse vang dội! Hiệu ứng hào quang vàng rực rỡ.");
    
    try { audio.play('apocalypse'); } catch(e){}
    
    const container = document.getElementById('ygoDeckSelectContainer');
    if (!container) return;
    container.innerHTML = '';
    
    let sortedDeck = [...d.playerDeck].sort((a,b) => a.name_vi.localeCompare(b.name_vi));
    
    sortedDeck.forEach(card => {
        const div = document.createElement('div');
        let typeClass = 'monster';
        if (card.card_type === 'Spell') typeClass = 'spell';
        if (card.card_type === 'Trap') typeClass = 'trap';
        div.className = `ygo-mini-card ${typeClass}`;
        div.innerHTML = `
            <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${card.name_vi}</div>
            <div style="font-size:0.48rem; color:#fcd34d;">${card.atk !== null ? `A:${card.atk}` : card.card_type}</div>
        `;
        div.onclick = () => ygoSelectDestinyCard(card);
        container.appendChild(div);
    });
    
    document.getElementById('ygoDeckSelectModal').style.display = 'flex';
}

window.ygoSelectDestinyCard = function(card) {
    let d = ygoGame.duel;
    let idx = d.playerDeck.findIndex(c => c.name_en === card.name_en);
    if (idx !== -1) {
        let selected = d.playerDeck.splice(idx, 1)[0];
        d.playerHand.push(selected);
        ygoLog(`📥 [Rút Bài Định Mệnh] Bạn đã chọn thành công lá bài đỉnh cao: ${selected.name_vi}!`);
        
        document.getElementById('ygoDeckSelectModal').style.display = 'none';
        d.hasNormalSummoned = false;
        ygoRenderField();
        if (d.mode === 'pvp') ygoSendSyncState();
    }
};

function ygoCheckAromaStrategy() {
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
}

function ygoCheckMillenniumNecklace() {
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
}

window.ygoActivateSkill = function() {
    let d = ygoGame.duel;
    if (d.turn !== 'player') {
        showToast("⚠️ Chỉ có thể kích hoạt kỹ năng trong lượt của bạn!");
        return;
    }
    if (d.myUsedSkill) {
        showToast("⚠️ Bạn đã kích hoạt kỹ năng trong trận đấu này rồi!");
        return;
    }
    
    let charId = ygoGame.myCharacter;
    let char = ygoCharacters[charId];
    if (!char) return;
    
    try { audio.play('levelup'); } catch(e){}
    
    // 1. Seto Kaiba: Pride of Blue-Eyes
    if (charId === 'kaiba') {
        let hasBEWD = d.playerHand.some(c => c.name_en.toLowerCase().includes("blue-eyes white dragon"));
        if (!hasBEWD) {
            showToast("⚠️ Bạn cần có Rồng Trắng Mắt Xanh trên tay để kích hoạt kỹ năng này!");
            return;
        }
        d.freeBlueEyes = true;
        d.myUsedSkill = true;
        ygoLog(`⚡ [KỸ NĂNG] Kaiba kích hoạt [Kiêu Hãnh Của Rồng]! Lá bài Rồng Trắng Mắt Xanh kế tiếp triệu hồi không cần hiến tế.`);
        showToast("⚡ Đã kích hoạt Kiêu Hãnh Của Rồng!");
    }
    
    // 2. Yami Marik: Shadow Sacrifice
    else if (charId === 'marik') {
        let oppMonIndices = [];
        d.oppMonsters.forEach((m, i) => { if(m) oppMonIndices.push(i); });
        
        if (oppMonIndices.length === 0) {
            showToast("⚠️ Đối thủ không có quái thú nào trên sân để hiến tế!");
            return;
        }
        let handMonIdx = d.playerHand.findIndex(c => c.card_type === 'Monster');
        if (handMonIdx === -1) {
            showToast("⚠️ Bạn không có quái thú nào trên tay để triệu hồi!");
            return;
        }
        
        let targetIdx = oppMonIndices[0];
        let sacrificed = d.oppMonsters[targetIdx];
        d.oppGY.push(sacrificed);
        d.oppMonsters[targetIdx] = null;
        
        let summoned = d.playerHand[handMonIdx];
        d.playerHand.splice(handMonIdx, 1);
        let emptyIdx = d.playerMonsters.indexOf(null);
        if (emptyIdx !== -1) {
            d.playerMonsters[emptyIdx] = summoned;
        } else {
            d.playerGY.push(summoned);
        }
        
        let cost = Math.floor(d.playerLP / 2);
        d.playerLP -= cost;
        
        d.myUsedSkill = true;
        ygoLog(`⚡ [KỸ NĂNG] Marik kích hoạt [Nghi Thức Hiến Tế Bóng Tối]! Tế quái [${sacrificed.name_vi}] của đối thủ, triệu hồi [${summoned.name_vi}] và trừ ${cost} LP.`);
        ygoUpdateLP();
        ygoRenderField();
        ygoCheckWinConditions();
        if (d.mode === 'pvp') ygoSendSyncState();
    }
    
    // 3. Yami Bakura: Graveyard Robber
    else if (charId === 'bakura') {
        let monstersInOppGy = d.oppGY.filter(c => c.card_type === 'Monster');
        if (monstersInOppGy.length === 0) {
            showToast("⚠️ Mộ bài đối thủ không có quái thú nào!");
            return;
        }
        let emptyIdx = d.playerMonsters.indexOf(null);
        if (emptyIdx === -1) {
            showToast("⚠️ Sân của bạn đã đầy quái thú!");
            return;
        }
        
        monstersInOppGy.sort((a,b) => (parseInt(b.atk)||0) - (parseInt(a.atk)||0));
        let targetMon = monstersInOppGy[0];
        
        let gyIdx = d.oppGY.indexOf(targetMon);
        d.oppGY.splice(gyIdx, 1);
        
        targetMon.attribute = 'DARK';
        targetMon.currentAtk = parseInt(targetMon.atk) || 0;
        targetMon.currentDef = parseInt(targetMon.def) || 0;
        d.playerMonsters[emptyIdx] = targetMon;
        
        d.myUsedSkill = true;
        ygoLog(`⚡ [KỸ NĂNG] Yami Bakura kích hoạt [Sức Mệnh Kẻ Trộm Mộ]! Cướp quái [${targetMon.name_vi}] từ Mộ đối thủ và hồi sinh dưới hệ Bóng Tối (DARK).`);
        ygoRenderField();
        if (d.mode === 'pvp') ygoSendSyncState();
    }
    
    // 4. Bandit Keith: Sleight of Hand
    else if (charId === 'keith') {
        if (d.playerHand.length === 0) {
            showToast("⚠️ Bạn không có lá bài nào trên tay để biến đổi!");
            return;
        }
        let cardToTransform = d.playerHand[0];
        let cardSeven = {
            name_en: "7 Completed",
            name_vi: "7 Hoàn Hảo",
            card_type: "Spell",
            property: "Equip",
            anime_effect_en: "Equip only to a Machine monster. It gains 700 ATK.",
            anime_effect_vi: "Trang bị cho quái thú Máy Móc (Machine). Tăng 700 ATK."
        };
        d.playerHand[0] = cardSeven;
        d.myUsedSkill = true;
        ygoLog(`⚡ [KỸ NĂNG] Bandit Keith kích hoạt [Gian Lận Súng Sáu]! Biến đổi lá bài [${cardToTransform.name_vi}] trên tay thành lá bài Phép '7 Hoàn Hảo'.`);
        ygoRenderField();
    }
    
    // 5. Arkana: Dark Magician Curtain
    else if (charId === 'arkana') {
        if (d.playerLP <= 1000) {
            showToast("⚠️ LP của bạn không đủ!");
            return;
        }
        let emptyIdx = d.playerMonsters.indexOf(null);
        if (emptyIdx === -1) {
            showToast("⚠️ Sân của bạn đã đầy!");
            return;
        }
        
        let dmIdx = d.playerDeck.findIndex(c => c.name_en.toLowerCase().includes("dark magician"));
        if (dmIdx === -1) {
            showToast("⚠️ Không tìm thấy Phù Thủy Áo Đen trong bộ bài!");
            return;
        }
        
        let dm = d.playerDeck[dmIdx];
        d.playerDeck.splice(dmIdx, 1);
        dm.currentAtk = parseInt(dm.atk) || 0;
        dm.currentDef = parseInt(dm.def) || 0;
        d.playerMonsters[emptyIdx] = dm;
        d.playerLP -= 1000;
        d.myUsedSkill = true;
        
        ygoLog(`⚡ [KỸ NĂNG] Arkana kích hoạt [Phù Thủy Đen Độc Ác]! Trả 1000 LP triệu hồi Phù Thủy Áo Đen [${dm.name_vi}] từ bộ bài.`);
        ygoUpdateLP();
        ygoRenderField();
        ygoCheckWinConditions();
        if (d.mode === 'pvp') ygoSendSyncState();
    }
    
    // 6. Paradox Brothers: Labyrinth Wall
    else if (charId === 'paradox_brothers') {
        let playerMonIdx = d.playerMonsters.findIndex(m => m !== null);
        if (playerMonIdx === -1) {
            showToast("⚠️ Bạn không có quái thú nào trên sân để biến đổi!");
            return;
        }
        
        let targetMon = d.playerMonsters[playerMonIdx];
        targetMon.name_vi = "Bức Tường Mê Cung";
        targetMon.name_en = "Labyrinth Wall";
        targetMon.def = "3000";
        targetMon.currentDef = 3000;
        
        d.myUsedSkill = true;
        ygoLog(`⚡ [KỸ NĂNG] Anh Em Mê Cung kích hoạt [Hợp Thể Mê Cung]! Biến đổi quái [${targetMon.name_vi}] thành 'Bức Tường Mê Cung' với DEF bằng 3000.`);
        ygoRenderField();
        if (d.mode === 'pvp') ygoSendSyncState();
    }
    
    // 7. Zigfried: Valkyrie Anthem
    else if (charId === 'zigfried') {
        let fairyMonsters = [];
        for (let i = d.playerHand.length - 1; i >= 0; i--) {
            let card = d.playerHand[i];
            if (card.card_type === 'Monster' && card.monster_type && card.monster_type.toLowerCase().includes('fairy')) {
                fairyMonsters.push(card);
                d.playerHand.splice(i, 1);
            }
        }
        
        if (fairyMonsters.length === 0) {
            showToast("⚠️ Bạn không có quái thú tộc Fairy (Tiên thần) nào trên tay!");
            return;
        }
        
        let count = 0;
        fairyMonsters.forEach(monster => {
            let emptyIdx = d.playerMonsters.indexOf(null);
            if (emptyIdx !== -1) {
                monster.currentAtk = parseInt(monster.atk) || 0;
                monster.currentDef = parseInt(monster.def) || 0;
                d.playerMonsters[emptyIdx] = monster;
                d.zigfriedBanishList.push(monster);
                count++;
            } else {
                d.playerGY.push(monster);
            }
        });
        
        d.myUsedSkill = true;
        ygoLog(`⚡ [KỸ NĂNG] Zigfried kích hoạt [Bản Hùng Ca Valkyrie]! Triệu hồi đặc biệt cùng lúc các quái thú Fairy lên sân.`);
        ygoRenderField();
        if (d.mode === 'pvp') ygoSendSyncState();
    }
    
    // 8. Lumis & Umbra: Mask Lock
    else if (charId === 'lumis_umbra') {
        d.lumisLockedZone = { side: 'opponent', type: 'monster', index: 0 };
        d.lumisLockTurns = 3;
        d.myUsedSkill = true;
        ygoLog(`⚡ [KỸ NĂNG] Lumis & Umbra kích hoạt [Phong Ấn Mặt Nạ]! Khoá ô quái số 1 của đối thủ trong 3 lượt tiếp theo.`);
        if (d.mode === 'pvp') ygoSendSyncState();
    }
    
    else {
        showToast(`💡 Vai chơi có kỹ năng bị động [${char.skillName}] hoạt động tự động!`);
    }
};

window.ygoZoneClick = function(side, type, index) {
    let d = ygoGame.duel;
    
    // Solomon Muto passive bypasses turn limit for Spell/Trap cards
    let isSolomonBypass = (d.turn !== 'player' && ygoGame.myCharacter === 'solomon' && d.selectedHandIndex !== null);
    if (d.turn !== 'player' && !isSolomonBypass) return;
    
    // Lumis & Umbra: Mask Lock check
    if (d.lumisLockTurns > 0 && d.lumisLockedZone) {
        if (d.lumisLockedZone.side === side && d.lumisLockedZone.type === type && d.lumisLockedZone.index === index) {
            showToast(`⚠️ Ô này đang bị phong ấn bởi Mặt Nạ trong ${d.lumisLockTurns} lượt nữa!`);
            return;
        }
    }
    
    // TH1: Đang chọn bài trên tay để RA BÀI (Summon/Set) bằng cách click vào ô trống (Old Flow fallback)
    if (d.selectedHandIndex !== null && side === 'player') {
        let card = d.playerHand[d.selectedHandIndex];
        
        if (type === 'monster' && card.card_type === 'Monster') {
            if (d.turn !== 'player') {
                showToast("⚠️ Bạn không thể triệu hồi quái thú trong lượt đối thủ!");
                return;
            }
            if (d.hasNormalSummoned) {
                showToast("⚠️ Bạn đã Triệu hồi Thường 1 quái thú ở lượt này rồi!");
                return;
            }
            if (d.playerMonsters[index] !== null) {
                showToast("⚠️ Ô quái thú này đã có bài!");
                return;
            }
            
            // Xử lý tế phẩm hiến tế (Tribute)
            let lvl = card.level_rank || 1;
            let tributesNeeded = lvl >= 7 ? 2 : (lvl >= 5 ? 1 : 0);
            
            // Seto Kaiba: Pride of Blue-Eyes
            if (ygoGame.myCharacter === 'kaiba' && card.name_en.toLowerCase().includes("blue-eyes white dragon")) {
                if (d.freeBlueEyes) {
                    tributesNeeded = 0;
                    d.freeBlueEyes = false; // Reset sau khi dùng
                    ygoLog(`🐉 [Kiêu Hãnh Của Rồng] Triệu hồi Rồng Trắng Mắt Xanh không cần hiến tế!`);
                }
            }
            
            let aliveMonstersCount = d.playerMonsters.filter(m => m !== null).length;
            if (aliveMonstersCount < tributesNeeded) {
                showToast(`⚠️ Cần ${tributesNeeded} quái thú tế phẩm trên sân để triệu hồi!`);
                return;
            }
            
            // Thực hiện tế phẩm nếu cần
            if (tributesNeeded > 0) {
                let tCount = 0;
                for (let mIdx = 0; mIdx < 5; mIdx++) {
                    if (d.playerMonsters[mIdx] !== null) {
                        ygoLog(`🕯️ Hiến tế quái thú: [${d.playerMonsters[mIdx].name_vi}] làm tế phẩm.`);
                        d.playerGY.push(d.playerMonsters[mIdx]);
                        d.playerMonsters[mIdx] = null;
                        tCount++;
                        if (tCount >= tributesNeeded) break;
                    }
                }
            }
            
            // Hỏi thế Tấn công hay Phòng thủ
            let isDefense = !confirm(`Bạn muốn Triệu hồi [${card.name_vi}] ở thế TẤN CÔNG? (Chọn Cancel để ÚP PHÒNG THỦ)`);
            
            // Triệu hồi
            try { audio.play('levelup'); } catch(e){}
            card.currentAtk = parseInt(card.atk) || 0;
            card.currentDef = parseInt(card.def) || 0;
            card.position = isDefense ? 'defense' : 'attack';
            card.faceUp = !isDefense;
            
            d.playerMonsters[index] = card;
            d.playerHand.splice(d.selectedHandIndex, 1);
            d.hasNormalSummoned = true;
            d.selectedHandIndex = null;
            
            if (isDefense) {
                ygoLog(`💥 Bạn úp 1 quái thú ở thế PHÒNG THỦ.`);
                ygoRenderField();
                if (d.mode === 'pvp') {
                    ygoSendSyncState(`💥 Đối thủ úp 1 quái thú ở thế PHÒNG THỦ.`);
                }
            } else {
                ygoLog(`💥 Bạn triệu hồi quái thú: [${card.name_vi}] (ATK: ${card.atk})`);
                ygoRenderField();
                if (d.mode === 'pvp') {
                    ygoSendSyncState(`💥 Đối thủ triệu hồi quái thú: [${card.name_vi}] (ATK: ${card.atk})`);
                }
            }
            return;
        }
        
        if (type === 'spell' && (card.card_type === 'Spell' || card.card_type === 'Trap')) {
            if (d.playerSpells[index] !== null) {
                showToast("⚠️ Ô bài phép/bẫy này đã có bài!");
                return;
            }
            
            try { audio.play('click'); } catch(e){}
            card.faceUp = false;
            d.playerSpells[index] = card;
            d.playerHand.splice(d.selectedHandIndex, 1);
            d.selectedHandIndex = null;
            
            ygoLog(`🃏 Bạn úp bài/kích hoạt: [${card.name_vi}]`);
            
            // Rebecca passive
            if (ygoGame.myCharacter === 'rebecca' && card.card_type === 'Spell') {
                ygoLog(`✨ [Thần Đồng Công Nghệ] Rebecca kích hoạt Spell. Gây 400 sát thương lên đối thủ!`);
                ygoDamageOpponent(400, "hiệu ứng Rebecca");
            }
            
            ygoExecuteCardEffect('player', card, index);
            
            ygoRenderField();
            if (d.mode === 'pvp') {
                ygoSendSyncState(`🃏 Đối thủ úp bài/kích hoạt: [${card.name_vi}]`);
            }
            return;
        }
    }
    
    // TH2: TẤN CÔNG (Battle Phase combat declaration / target selection)
    if (d.phase === 'BATTLE' && d.selectedFieldCard && d.selectedFieldCard.side === 'player' && d.selectedFieldCard.type === 'monster') {
        if (d.turnCount === 1) {
            showToast("⚠️ Lượt đầu tiên của trận đấu không được phép tấn công!");
            d.selectedFieldCard = null;
            ygoRenderField();
            return;
        }
        
        if (side === 'opponent' && type === 'monster') {
            let myMon = d.playerMonsters[d.selectedFieldCard.pos];
            if (!myMon) return;
            
            // Leon Stromberg check
            if (ygoGame.oppCharacter === 'leon') {
                ygoLog(`🏰 [Lâu Đài Cổ Tích] Quái thú [${myMon.name_vi}] bị tiêu diệt bởi Stromberg Castle của Leon khi tuyên bố tấn công!`);
                ygoDestroyMonster('player', d.selectedFieldCard.pos);
                d.selectedFieldCard = null;
                ygoRenderField();
                if (d.mode === 'pvp') ygoSendSyncState();
                return;
            }
            
            let oppMon = d.oppMonsters[index];
            if (oppMon) {
                // Battle against monster
                try { audio.play('hit'); } catch(e){}
                let myAtk = ygoGetEffectiveAtk('player', myMon);
                
                if (oppMon.position === 'defense') {
                    let oppDef = parseInt(oppMon.currentDef || oppMon.def) || 0;
                    ygoLog(`⚔️ [${myMon.name_vi}] (ATK ${myAtk}) tấn công [${oppMon.name_vi}] ở THẾ THỦ (DEF ${oppDef})!`);
                    
                    if (myAtk > oppDef) {
                        ygoLog(`💥 Tiêu diệt quái thú thế thủ của đối thủ!`);
                        ygoDestroyMonster('opponent', index);
                        // Rex Raptor: Dino Stampede (Pierce damage)
                        if (ygoGame.myCharacter === 'rex' && myMon.monster_type && myMon.monster_type.toLowerCase().includes('dinosaur')) {
                            let diff = myAtk - oppDef;
                            ygoDamageOpponent(diff, `xuyên thủ của Rex Raptor`);
                        }
                    } else if (myAtk < oppDef) {
                        let diff = oppDef - myAtk;
                        ygoDamagePlayer(diff, `phản đòn từ quái thủ của đối thủ`);
                    } else {
                        ygoLog(`🛡️ Không thể xuyên phá thủ!`);
                    }
                } else {
                    let oppAtk = ygoGetEffectiveAtk('opponent', oppMon);
                    ygoLog(`⚔️ [${myMon.name_vi}] (ATK ${myAtk}) tấn công [${oppMon.name_vi}] (ATK ${oppAtk})!`);
                    
                    if (myAtk > oppAtk) {
                        let diff = myAtk - oppAtk;
                        ygoDamageOpponent(diff, `chiến đấu quái thú`);
                        ygoLog(`💥 Tiêu diệt quái thú đối thủ!`);
                        ygoDestroyMonster('opponent', index);
                    } else if (myAtk === oppAtk) {
                        ygoLog(`💥 Lưỡng bại câu thương! Cả hai quái thú cùng bay màu.`);
                        ygoDestroyMonster('player', d.selectedFieldCard.pos);
                        ygoDestroyMonster('opponent', index);
                    } else {
                        let diff = oppAtk - myAtk;
                        ygoDamagePlayer(diff, `quái thú đối thủ phản công`);
                        ygoLog(`💔 [${myMon.name_vi}] bị tiêu diệt.`);
                        ygoDestroyMonster('player', d.selectedFieldCard.pos);
                    }
                }
                
                d.selectedFieldCard = null;
                ygoUpdateLP();
                ygoRenderField();
                ygoCheckWinConditions();
                if (d.mode === 'pvp') {
                    ygoSendSyncState(`⚔️ [${myMon.name_vi}] tấn công [${oppMon.name_vi}]!`);
                }
            } else {
                // Direct attack clicked empty monster zone
                let hasOtherMonsters = d.oppMonsters.some(m => m !== null);
                let isWater = myMon.attribute && myMon.attribute.toUpperCase() === 'WATER';
                let oppHasWater = d.oppMonsters.some(m => m !== null && m.attribute && m.attribute.toUpperCase() === 'WATER');
                
                let canAttackDirectly = !hasOtherMonsters || (ygoGame.myCharacter === 'mako' && isWater && !oppHasWater);
                
                if (canAttackDirectly) {
                    try { audio.play('hit'); } catch(e){}
                    let myAtk = ygoGetEffectiveAtk('player', myMon);
                    
                    ygoDamageOpponent(myAtk, `đòn tấn công trực diện`);
                    ygoLog(`💥 [${myMon.name_vi}] tấn công TRỰC DIỆN!`);
                    
                    d.selectedFieldCard = null;
                    ygoUpdateLP();
                    ygoRenderField();
                    ygoCheckWinConditions();
                    if (d.mode === 'pvp') {
                        ygoSendSyncState(`💥 [${myMon.name_vi}] tấn công TRỰC DIỆN!`);
                    }
                } else {
                    showToast("⚠️ Bạn phải tiêu diệt quái thú trên sân đối phương trước!");
                }
            }
            return;
        }
    }
    
    // TH3: Lựa chọn bài trên sân của mình (Select field card for details/actions)
    if (side === 'player' && d.selectedHandIndex === null) {
        let card = null;
        if (type === 'monster') card = d.playerMonsters[index];
        else if (type === 'spell') card = d.playerSpells[index];
        else if (type === 'fieldspell') card = d.playerFieldSpell;
        
        if (card) {
            d.selectedFieldCard = { side: side, type: type, pos: index };
            d.selectedHandIndex = null;
            ygoHoverCard(card);
            ygoLog(`👉 Đã chọn bài trên sân: [${card.name_vi}]. Bấm nút Thao tác bên trái để tương tác.`);
            ygoRenderField();
            return;
        }
    }
};;

// Kích hoạt một số thẻ bài phép/bẫy cơ bản
// Kích hoạt một số thẻ bài phép/bẫy cơ bản
function ygoExecuteCardEffect(side, card, zoneIdx) {
    let d = ygoGame.duel;
    let name = card.name_en.toLowerCase();
    let isPlayer = (side === 'player');
    
    // Pot of Greed (Hũ tham lam) -> Rút 2 lá bài
    if (name.includes('pot of greed') || card.name_vi.includes('Hũ tham lam')) {
        ygoLog(`🪄 Kích hoạt hiệu ứng [${card.name_vi}]: Rút thêm 2 lá bài!`);
        ygoDrawCard(side);
        ygoDrawCard(side);
        // Chuyển bài phép vào mộ sau khi dùng
        setTimeout(() => {
            if(side === 'player') {
                d.playerGY.push(card);
                d.playerSpells[zoneIdx] = null;
            } else {
                d.oppGY.push(card);
                d.oppSpells[zoneIdx] = null;
            }
            ygoRenderField();
        }, 1000);
    }
    
    // Raigeki (Lôi kích) -> Tiêu diệt toàn bộ quái đối phương
    else if (name.includes('raigeki') || card.name_vi.includes('Lôi kích')) {
        ygoLog(`⚡ LÔI KÍCH HOẠT ĐỘNG! Tiêu diệt toàn bộ quái thú của đối phương!`);
        let oppMon = side === 'player' ? d.oppMonsters : d.playerMonsters;
        let oppGY = side === 'player' ? d.oppGY : d.playerGY;
        
        for (let i = 0; i < 5; i++) {
            if (oppMon[i] !== null) {
                oppGY.push(oppMon[i]);
                oppMon[i] = null;
            }
        }
        
        setTimeout(() => {
            if(side === 'player') {
                d.playerGY.push(card);
                d.playerSpells[zoneIdx] = null;
            } else {
                d.oppGY.push(card);
                d.oppSpells[zoneIdx] = null;
            }
            ygoRenderField();
        }, 1000);
    }
    
    // Monster Reborn (Phục sinh quái thú)
    else if (name.includes('monster reborn') || card.name_vi.includes('Phục sinh quái thú')) {
        let myGY = isPlayer ? d.playerGY : d.oppGY;
        let myMonsters = isPlayer ? d.playerMonsters : d.oppMonsters;
        let monstersInGy = myGY.filter(c => c.card_type === 'Monster');
        
        if (monstersInGy.length > 0) {
            monstersInGy.sort((a, b) => (parseInt(b.atk) || 0) - (parseInt(a.atk) || 0));
            let targetMon = monstersInGy[0];
            let gyIdx = myGY.indexOf(targetMon);
            myGY.splice(gyIdx, 1);
            
            let emptyIdx = myMonsters.indexOf(null);
            if (emptyIdx !== -1) {
                targetMon.currentAtk = parseInt(targetMon.atk) || 0;
                targetMon.currentDef = parseInt(targetMon.def) || 0;
                targetMon.position = 'attack'; // summon face up attack by default
                myMonsters[emptyIdx] = targetMon;
                ygoLog(`🪄 [${card.name_vi}] phục sinh quái thú [${targetMon.name_vi}] (ATK: ${targetMon.atk}) từ Mộ bài lên sân!`);
            } else {
                myGY.push(targetMon);
                ygoLog(`⚠️ Không có ô quái thú trống để phục sinh!`);
            }
        } else {
            ygoLog(`⚠️ Mộ bài không có quái thú nào để phục sinh!`);
        }
        
        setTimeout(() => {
            if(isPlayer) {
                d.playerGY.push(card);
                d.playerSpells[zoneIdx] = null;
            } else {
                d.oppGY.push(card);
                d.oppSpells[zoneIdx] = null;
            }
            ygoRenderField();
        }, 1000);
    }
    
    // Dark Hole (Hố đen)
    else if (name.includes('dark hole') || card.name_vi.includes('Hố đen')) {
        ygoLog(`🪄 Kích hoạt [${card.name_vi}]: Gửi tất cả quái thú trên sân của hai bên xuống Mộ!`);
        for (let i = 0; i < 5; i++) {
            if (d.playerMonsters[i] !== null) {
                d.playerGY.push(d.playerMonsters[i]);
                d.playerMonsters[i] = null;
            }
            if (d.oppMonsters[i] !== null) {
                d.oppGY.push(d.oppMonsters[i]);
                d.oppMonsters[i] = null;
            }
        }
        
        setTimeout(() => {
            if(isPlayer) {
                d.playerGY.push(card);
                d.playerSpells[zoneIdx] = null;
            } else {
                d.oppGY.push(card);
                d.oppSpells[zoneIdx] = null;
            }
            ygoRenderField();
        }, 1000);
    }
    
    // Card Destruction (Hủy bài)
    else if (name.includes('card destruction') || card.name_vi.includes('Hủy bài')) {
        ygoLog(`🪄 Kích hoạt [${card.name_vi}]: Huỷ toàn bộ bài trên tay của hai bên và rút lại số lượng tương đương!`);
        
        // Player hand discard & redraw
        let pCount = d.playerHand.length;
        while(d.playerHand.length > 0) {
            d.playerGY.push(d.playerHand.pop());
        }
        for (let i = 0; i < pCount; i++) {
            ygoDrawCard('player');
        }
        
        // Opponent hand discard & redraw
        let oCount = d.oppHand.length;
        while(d.oppHand.length > 0) {
            let disc = d.oppHand.pop();
            if (disc && disc.name_en) d.oppGY.push(disc);
        }
        for (let i = 0; i < oCount; i++) {
            ygoDrawCard('opponent');
        }
        
        setTimeout(() => {
            if(isPlayer) {
                d.playerGY.push(card);
                d.playerSpells[zoneIdx] = null;
            } else {
                d.oppGY.push(card);
                d.oppSpells[zoneIdx] = null;
            }
            ygoRenderField();
        }, 1000);
    }
    
    // Change of Heart (Thay đổi trái tim)
    else if (name.includes('change of heart') || card.name_vi.includes('Thay đổi trái tim')) {
        let oppMonsters = isPlayer ? d.oppMonsters : d.playerMonsters;
        let myMonsters = isPlayer ? d.playerMonsters : d.oppMonsters;
        
        let strongestIdx = -1;
        let maxAtk = -1;
        for (let i = 0; i < 5; i++) {
            if (oppMonsters[i] !== null) {
                let atk = parseInt(oppMonsters[i].atk) || 0;
                if (atk > maxAtk) {
                    maxAtk = atk;
                    strongestIdx = i;
                }
            }
        }
        
        let emptyIdx = myMonsters.indexOf(null);
        if (strongestIdx !== -1 && emptyIdx !== -1) {
            let stolen = oppMonsters[strongestIdx];
            oppMonsters[strongestIdx] = null;
            myMonsters[emptyIdx] = stolen;
            
            d.changeOfHeartStolen = {
                monster: stolen,
                fromSide: isPlayer ? 'opponent' : 'player',
                fromIdx: strongestIdx,
                toSide: side,
                toIdx: emptyIdx
            };
            ygoLog(`🪄 [${card.name_vi}] chiếm quyền điều khiển quái thú [${stolen.name_vi}] của đối thủ!`);
        } else {
            ygoLog(`⚠️ Không có quái thú đối phương để cướp hoặc sân của bạn đã đầy!`);
        }
        
        setTimeout(() => {
            if(isPlayer) {
                d.playerGY.push(card);
                d.playerSpells[zoneIdx] = null;
            } else {
                d.oppGY.push(card);
                d.oppSpells[zoneIdx] = null;
            }
            ygoRenderField();
        }, 1000);
    }
}

// Chuyển đổi Phase đấu bài
window.ygoNextPhase = function() {
    let d = ygoGame.duel;
    if (d.turn !== 'player') return;
    
    try { audio.play('click'); } catch(e){}
    
    if (d.phase === 'DRAW') ygoStartPhase('STANDBY');
    else if (d.phase === 'STANDBY') ygoStartPhase('MAIN1');
    else if (d.phase === 'MAIN1') ygoStartPhase('BATTLE');
    else if (d.phase === 'BATTLE') ygoStartPhase('MAIN2');
    else if (d.phase === 'MAIN2') ygoStartPhase('END');
    else if (d.phase === 'END') {
        ygoLog(`⏳ Kết thúc lượt của bạn. Bắt đầu lượt của đối thủ.`);
        
        // Return Change of Heart stolen monster before turn switch
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

        d.turn = 'opponent';
        d.turnCount = (d.turnCount || 1) + 1;
        ygoRenderField();
        
        if (d.mode === 'pvp') {
            ygoSendSyncState("⏳ Lượt đối thủ kết thúc. Bắt đầu lượt của bạn!");
        } else {
            setTimeout(ygoRunBotTurn, 1000);
        }
    }
    if (d.mode === 'pvp') {
        ygoSendSyncState();
    }
};

function ygoStartPhase(phaseName) {
    let d = ygoGame.duel;
    d.phase = phaseName;
    document.getElementById('ygoPhaseText').textContent = `${phaseName} PHASE`;
    
    ygoLog(`📍 Bước vào: ${phaseName} PHASE`);
    
    if (phaseName === 'DRAW' && d.turn === 'player') {
        if (ygoGame.myCharacter === 'yugi' && d.playerLP < 1500 && !d.destinyDrawUsed && d.playerDeck.length > 0) {
            d.destinyDrawUsed = true;
            ygoTriggerDestinyDraw();
        } else {
            ygoDrawCard('player');
        }
        d.hasNormalSummoned = false;
        ygoRenderField();
        
        // Tự động chuyển DRAW -> STANDBY -> MAIN1 để người chơi có thể chơi bài ngay lập tức
        setTimeout(() => {
            if (d.phase === 'DRAW' && d.turn === 'player') {
                ygoStartPhase('STANDBY');
                setTimeout(() => {
                    if (d.phase === 'STANDBY' && d.turn === 'player') {
                        ygoStartPhase('MAIN1');
                    }
                }, 150);
            }
        }, 250);
    }
    if (d.mode === 'pvp') {
        ygoSendSyncState();
    }
}

// Đầu hàng
window.ygoSurrender = function() {
    if(confirm("Bạn có chắc chắn muốn đầu hàng trận đấu này?")) {
        ygoLog("🏳️ Bạn đã đầu hàng!");
        ygoEndGame('opponent');
    }
};

// ── BOT AI AUTOMATION ──────────────────────────────────────────────
function ygoRunBotTurn() {
    let d = ygoGame.duel;
    if (d.turn !== 'opponent') return;
    
    ygoLog(`🤖 Lượt của Bot (${d.opponentName}) bắt đầu...`);
    
    // 1. Draw Phase (Bot Yugi Destiny Draw check)
    if (ygoGame.oppCharacter === 'yugi' && d.oppLP < 1500 && !d.destinyDrawUsed && d.oppDeck.length > 0) {
        d.destinyDrawUsed = true;
        let targetIdx = d.oppDeck.findIndex(c => c.name_en.toLowerCase().includes("raigeki") || c.name_en.toLowerCase().includes("pot of greed"));
        if (targetIdx === -1) {
            targetIdx = d.oppDeck.findIndex(c => c.card_type === 'Monster');
        }
        if (targetIdx !== -1) {
            let card = d.oppDeck.splice(targetIdx, 1)[0];
            d.oppHand.push(card);
            ygoLog(`⚡ [RÚT BÀI ĐỊNH MỆNH] Bot Yugi Atem kích hoạt kỹ năng và chọn [${card.name_vi}] lên tay!`);
            try { audio.play('apocalypse'); } catch(e){}
        } else {
            ygoDrawCard('opponent');
        }
    } else {
        ygoDrawCard('opponent');
    }
    
    // Mai Valentine Aroma Strategy check for Bot (Bot Mai knows top card of deck)
    if (ygoGame.oppCharacter === 'mai' && d.oppDeck.length > 0) {
        let top = d.oppDeck[d.oppDeck.length - 1];
        ygoLog(`🔮 [Nước Hoa] Bot Mai Valentine ngửi thấy bài tiếp theo: [${top.name_vi}]`);
    }
    
    ygoRenderField();
    
    // 2. Bot tính toán Ra Bài (Main Phase 1)
    setTimeout(() => {
        // Bot Special Summon từ Extra Deck (30% cơ hội nếu có ít hơn 2 quái thú trên sân)
        let botMonsterCount = d.oppMonsters.filter(m => m !== null).length;
        if (d.oppExtraDeck && d.oppExtraDeck.length > 0 && botMonsterCount < 2 && Math.random() < 0.3) {
            let emptyIdx = d.oppMonsters.indexOf(null);
            if (emptyIdx !== -1) {
                let card = d.oppExtraDeck.shift(); // Lấy quái đầu tiên từ Extra Deck
                card.currentAtk = parseInt(card.atk) || 0;
                card.currentDef = parseInt(card.def) || 0;
                card.position = 'attack';
                card.faceUp = true;
                d.oppMonsters[emptyIdx] = card;
                ygoLog(`🔮 Bot thực hiện Triệu hồi Đặc biệt quái thú [${card.name_vi}] từ Extra Deck!`);
                ygoRenderField();
            }
        }
        
        // Bot kích hoạt kỹ năng đặc trưng (Nếu chưa dùng và có cơ hội)
        if (!d.oppUsedSkill && Math.random() < 0.5) {
            let botChar = ygoGame.oppCharacter;
            
            if (botChar === 'kaiba') {
                let bewdIdx = d.oppHand.findIndex(c => c.name_en.toLowerCase().includes("blue-eyes white dragon"));
                if (bewdIdx !== -1) {
                    let emptyIdx = d.oppMonsters.indexOf(null);
                    if (emptyIdx !== -1) {
                        let card = d.oppHand[bewdIdx];
                        card.currentAtk = parseInt(card.atk) || 0;
                        card.currentDef = parseInt(card.def) || 0;
                        card.position = 'attack';
                        d.oppMonsters[emptyIdx] = card;
                        d.oppHand.splice(bewdIdx, 1);
                        d.oppUsedSkill = true;
                        ygoLog(`⚡ [KỸ NĂNG] Bot Kaiba kích hoạt [Kiêu Hãnh Của Rồng]! Triệu hồi đặc biệt Rồng Trắng Mắt Xanh [${card.name_vi}] không cần hiến tế!`);
                        try { audio.play('levelup'); } catch(e){}
                    }
                }
            }
            
            else if (botChar === 'marik') {
                let playerAlive = [];
                d.playerMonsters.forEach((m, i) => { if(m) playerAlive.push(i); });
                let handMonIdx = d.oppHand.findIndex(c => c.card_type === 'Monster');
                if (playerAlive.length > 0 && handMonIdx !== -1 && d.oppLP > 1000) {
                    let targetIdx = playerAlive[0];
                    let sacrificed = d.playerMonsters[targetIdx];
                    d.playerGY.push(sacrificed);
                    d.playerMonsters[targetIdx] = null;
                    
                    let summoned = d.oppHand[handMonIdx];
                    d.oppHand.splice(handMonIdx, 1);
                    let emptyIdx = d.oppMonsters.indexOf(null);
                    if (emptyIdx !== -1) {
                        summoned.currentAtk = parseInt(summoned.atk) || 0;
                        summoned.currentDef = parseInt(summoned.def) || 0;
                        summoned.position = 'attack';
                        d.oppMonsters[emptyIdx] = summoned;
                    }
                    
                    let cost = Math.floor(d.oppLP / 2);
                    d.oppLP -= cost;
                    d.oppUsedSkill = true;
                    ygoLog(`⚡ [KỸ NĂNG] Bot Marik kích hoạt [Nghi Thức Hiến Tế Bóng Tối]! Tế quái [${sacrificed.name_vi}] của bạn, triệu hồi [${summoned.name_vi}] và trừ ${cost} LP.`);
                    try { audio.play('levelup'); } catch(e){}
                }
            }
            
            else if (botChar === 'bakura') {
                let monstersInPlayerGy = d.playerGY.filter(c => c.card_type === 'Monster');
                let emptyIdx = d.oppMonsters.indexOf(null);
                if (monstersInPlayerGy.length > 0 && emptyIdx !== -1) {
                    monstersInPlayerGy.sort((a,b) => (parseInt(b.atk)||0) - (parseInt(a.atk)||0));
                    let targetMon = monstersInPlayerGy[0];
                    
                    let gyIdx = d.playerGY.indexOf(targetMon);
                    d.playerGY.splice(gyIdx, 1);
                    
                    targetMon.attribute = 'DARK';
                    targetMon.currentAtk = parseInt(targetMon.atk) || 0;
                    targetMon.currentDef = parseInt(targetMon.def) || 0;
                    targetMon.position = 'attack';
                    d.oppMonsters[emptyIdx] = targetMon;
                    
                    d.oppUsedSkill = true;
                    ygoLog(`⚡ [KỸ NĂNG] Bot Yami Bakura kích hoạt [Sức Mệnh Kẻ Trộm Mộ]! Cướp quái [${targetMon.name_vi}] từ Mộ bạn về sân đối thủ.`);
                    try { audio.play('levelup'); } catch(e){}
                }
            }
            
            else if (botChar === 'arkana' && d.oppLP > 1000) {
                let emptyIdx = d.oppMonsters.indexOf(null);
                let dmIdx = d.oppDeck.findIndex(c => c.name_en.toLowerCase().includes("dark magician"));
                if (emptyIdx !== -1 && dmIdx !== -1) {
                    let dm = d.oppDeck[dmIdx];
                    d.oppDeck.splice(dmIdx, 1);
                    dm.currentAtk = parseInt(dm.atk) || 0;
                    dm.currentDef = parseInt(dm.def) || 0;
                    dm.position = 'attack';
                    d.oppMonsters[emptyIdx] = dm;
                    d.oppLP -= 1000;
                    d.oppUsedSkill = true;
                    ygoLog(`⚡ [KỸ NĂNG] Bot Arkana kích hoạt [Phù Thủy Đen Độc Ác]! Trả 1000 LP triệu hồi Phù Thủy Áo Đen [${dm.name_vi}] từ bộ bài.`);
                    try { audio.play('levelup'); } catch(e){}
                }
            }
            
            else if (botChar === 'lumis_umbra') {
                d.lumisLockedZone = { side: 'player', type: 'monster', index: 0 };
                d.lumisLockTurns = 3;
                d.oppUsedSkill = true;
                ygoLog(`⚡ [KỸ NĂNG] Bot Lumis & Umbra kích hoạt [Phong Ấn Mặt Nạ]! Khoá ô quái số 1 của bạn trong 3 lượt tiếp theo.`);
                try { audio.play('levelup'); } catch(e){}
            }
        }
        
        // Tìm quái thú mạnh nhất trên tay Bot để triệu hồi thường hoặc úp thủ
        let bestMonsterIdx = -1;
        let maxAtk = -1;
        
        d.oppHand.forEach((card, idx) => {
            if (card.card_type === 'Monster') {
                let atk = parseInt(card.atk) || 0;
                if (atk > maxAtk) {
                    maxAtk = atk;
                    bestMonsterIdx = idx;
                }
            }
        });
        
        if (bestMonsterIdx !== -1) {
            let card = d.oppHand[bestMonsterIdx];
            let emptyZoneIdx = d.oppMonsters.indexOf(null);
            if (emptyZoneIdx !== -1) {
                // Tế phẩm (Dành cho Bot nếu không miễn phí)
                let lvl = card.level_rank || 1;
                let tributesNeeded = lvl >= 7 ? 2 : (lvl >= 5 ? 1 : 0);
                
                // Kaiba free Blue-eyes
                if (ygoGame.oppCharacter === 'kaiba' && card.name_en.toLowerCase().includes("blue-eyes")) {
                    tributesNeeded = 0;
                }
                
                let aliveOppCount = d.oppMonsters.filter(m => m !== null).length;
                if (aliveOppCount >= tributesNeeded) {
                    if (tributesNeeded > 0) {
                        let tCount = 0;
                        for (let mIdx = 0; mIdx < 5; mIdx++) {
                            if (d.oppMonsters[mIdx] !== null) {
                                d.oppGY.push(d.oppMonsters[mIdx]);
                                d.oppMonsters[mIdx] = null;
                                tCount++;
                                if (tCount >= tributesNeeded) break;
                            }
                        }
                    }
                    try { audio.play('levelup'); } catch(e){}
                    card.currentAtk = parseInt(card.atk) || 0;
                    card.currentDef = parseInt(card.def) || 0;
                    
                    // Smart decision: Set in defense if DEF > ATK
                    let isDefense = (parseInt(card.def) || 0) > (parseInt(card.atk) || 0);
                    card.position = isDefense ? 'defense' : 'attack';
                    
                    d.oppMonsters[emptyZoneIdx] = card;
                    d.oppHand.splice(bestMonsterIdx, 1);
                    
                    if (isDefense) {
                        ygoLog(`🤖 Bot úp 1 quái thú ở thế PHÒNG THỦ.`);
                    } else {
                        ygoLog(`🤖 Bot triệu hồi: [${card.name_vi}] (ATK: ${card.atk})`);
                    }
                }
            }
        }
        
        // Bot kích hoạt bài Môi trường nếu có trên tay
        let botFieldSpellIdx = d.oppHand.findIndex(c => c.card_type === 'Spell' && (c.property === 'Field' || c.name_en.toLowerCase().includes('umi') || c.name_en.toLowerCase().includes('orichalcos') || c.name_en.toLowerCase().includes('stromberg')));
        if (botFieldSpellIdx !== -1) {
            let card = d.oppHand[botFieldSpellIdx];
            if (d.oppFieldSpell) {
                d.oppGY.push(d.oppFieldSpell);
            }
            card.faceUp = true;
            d.oppFieldSpell = card;
            d.oppHand.splice(botFieldSpellIdx, 1);
            ygoLog(`🤖 Bot kích hoạt Bài Môi Trường: [${card.name_vi}]`);
        }
        
        // Bot úp bài phép ngẫu nhiên
        let spellIdx = d.oppHand.findIndex(c => c.card_type === 'Spell' || c.card_type === 'Trap');
        if (spellIdx !== -1) {
            let card = d.oppHand[spellIdx];
            let emptySpellZone = d.oppSpells.indexOf(null);
            if (emptySpellZone !== -1) {
                d.oppSpells[emptySpellZone] = card;
                d.oppHand.splice(spellIdx, 1);
                ygoLog(`🤖 Bot úp một lá bài Phép/Bẫy.`);
                
                // Solomon passive check
                if (ygoGame.myCharacter === 'solomon' && card.card_type === 'Spell') {
                    ygoLog(`👵 [Trải Nghiệm Lão Luyện] Solomon Muto rút 1 lá bài do đối thủ kích hoạt Spell/Trap!`);
                    ygoDrawCard('player');
                }
                
                if (card.name_en.toLowerCase().includes('pot of greed') || card.name_en.toLowerCase().includes('raigeki')) {
                    ygoExecuteCardEffect('opponent', card, emptySpellZone);
                }
            }
        }
        
        ygoRenderField();
        
        // 3. Bot Tấn Công (Battle Phase)
        setTimeout(() => {
            if (d.turnCount === 1) {
                ygoLog("🤖 Lượt đầu tiên của trận đấu, Bot không thể tấn công.");
            } else {
                for (let i = 0; i < 5; i++) {
                    let botMon = d.oppMonsters[i];
                    if (botMon) {
                        if (botMon.position === 'defense') continue; // Defense monsters cannot attack!
                        
                        // Leon Stromberg check on player side
                        if (ygoGame.myCharacter === 'leon') {
                            ygoLog(`🏰 [Lâu Đài Cổ Tích] Bot [${botMon.name_vi}] tuyên bố tấn công và bị nổ tung bởi Stromberg Castle!`);
                            ygoDestroyMonster('opponent', i);
                            ygoRenderField();
                            continue;
                        }
                        
                        let playerAliveMonIndices = [];
                        d.playerMonsters.forEach((pm, idx) => {
                            if(pm !== null) playerAliveMonIndices.push(idx);
                        });
                        
                        let isWater = botMon.attribute && botMon.attribute.toUpperCase() === 'WATER';
                        let playerHasWater = d.playerMonsters.some(m => m !== null && m.attribute && m.attribute.toUpperCase() === 'WATER');
                        
                        // Mako Ocean direct attack condition
                        let canAttackDirectly = (playerAliveMonIndices.length === 0) || (ygoGame.oppCharacter === 'mako' && isWater && !playerHasWater);
                        
                        if (!canAttackDirectly && playerAliveMonIndices.length > 0) {
                            let targetIdx = playerAliveMonIndices[0];
                            let targetMon = d.playerMonsters[targetIdx];
                            
                            try { audio.play('hit'); } catch(e){}
                            let botAtk = ygoGetEffectiveAtk('opponent', botMon);
                            
                            if (targetMon.position === 'defense') {
                                let playDef = parseInt(targetMon.currentDef || targetMon.def) || 0;
                                ygoLog(`🤖 Bot [${botMon.name_vi}] (ATK ${botAtk}) tấn công [${targetMon.name_vi}] ở THẾ THỦ (DEF ${playDef})!`);
                                
                                if (botAtk > playDef) {
                                    ygoLog(`💔 [${targetMon.name_vi}] bị tiêu diệt.`);
                                    ygoDestroyMonster('player', targetIdx);
                                    // Bot Rex Raptor: Dino Stampede (Pierce damage)
                                    if (ygoGame.oppCharacter === 'rex' && botMon.monster_type && botMon.monster_type.toLowerCase().includes('dinosaur')) {
                                        let diff = botAtk - playDef;
                                        ygoDamagePlayer(diff, `xuyên thủ của Bot Rex Raptor`);
                                    }
                                } else if (botAtk < playDef) {
                                    let diff = playDef - botAtk;
                                    ygoDamageOpponent(diff, `phản đòn từ quái thủ`);
                                }
                            } else {
                                let playAtk = ygoGetEffectiveAtk('player', targetMon);
                                ygoLog(`🤖 Bot [${botMon.name_vi}] (ATK ${botAtk}) tấn công [${targetMon.name_vi}] (ATK ${playAtk})!`);
                                
                                if (botAtk > playAtk) {
                                    let diff = botAtk - playAtk;
                                    ygoDamagePlayer(diff, `chiến đấu quái thú`);
                                    ygoLog(`💔 [${targetMon.name_vi}] bị tiêu diệt.`);
                                    ygoDestroyMonster('player', targetIdx);
                                } else if (botAtk === playAtk) {
                                    ygoLog(`💥 Cả hai cùng chết!`);
                                    ygoDestroyMonster('opponent', i);
                                    ygoDestroyMonster('player', targetIdx);
                                } else {
                                    let diff = playAtk - botAtk;
                                    ygoDamageOpponent(diff, `quái thú phản công`);
                                    ygoLog(`💔 Bot [${botMon.name_vi}] bị tiêu diệt.`);
                                    ygoDestroyMonster('opponent', i);
                                }
                            }
                        } else if (canAttackDirectly) {
                            // Tấn công trực diện
                            try { audio.play('hit'); } catch(e){}
                            let botAtk = ygoGetEffectiveAtk('opponent', botMon);
                            ygoDamagePlayer(botAtk, `đòn tấn công trực diện của Bot`);
                        }
                        
                        ygoUpdateLP();
                        ygoRenderField();
                        ygoCheckWinConditions();
                        
                        if(d.playerLP <= 0 || d.oppLP <= 0) return; // Kết thúc game
                    }
                }
            }
            
            // 4. Kết thúc lượt của Bot (Banish Valkyries của Zigfried nếu có)
            setTimeout(() => {
                if (d.zigfriedBanishList.length > 0) {
                    ygoLog(`✨ [Bản Hùng Ca Valkyrie] Trục xuất toàn bộ Valkyrie khỏi sân.`);
                    for (let i = 0; i < 5; i++) {
                        if (d.oppMonsters[i] && d.zigfriedBanishList.includes(d.oppMonsters[i])) d.oppMonsters[i] = null;
                        if (d.playerMonsters[i] && d.zigfriedBanishList.includes(d.playerMonsters[i])) d.playerMonsters[i] = null;
                    }
                    d.zigfriedBanishList = [];
                }
                
                // Return Change of Heart stolen monster
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
                
                // Trừ thời gian Lumis Lock
                if (d.lumisLockTurns > 0) {
                    d.lumisLockTurns--;
                    if (d.lumisLockTurns === 0) {
                        ygoLog(`🎭 Giải phóng ô bị phong ấn bởi Mặt Nạ.`);
                        d.lumisLockedZone = null;
                    }
                }
                
                ygoLog(`⏳ Bot kết thúc lượt. Đến lượt của bạn!`);
                d.turn = 'player';
                d.turnCount = (d.turnCount || 1) + 1;
                ygoStartPhase('DRAW');
                ygoRenderField();
            }, 1000);
            
        }, 1000);
        
    }, 1000);
}

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
