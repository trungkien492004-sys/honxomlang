// ===== 🐸 MEMECARD_DATA.JS — Kho Thẻ Bài "ĐẤU TRƯỜNG MEME XÓM" =====
// Đây là cơ sở dữ liệu thẻ bài cho mini-game bài ma thuật phiên bản chế/meme Việt Nam,
// xây trên luật chơi rút gọn kiểu "Speed Duel".
//
// ── HƯỚNG DẪN THÊM THẺ BÀI MỚI (để bạn tự bổ sung dần lên 100+ lá) ──
// Mỗi thẻ là 1 object trong mảng MEME_CARDS dưới đây. Các trường dùng chung:
//   id            : mã định danh duy nhất, viết liền không dấu, dùng "_" (bắt buộc, không trùng)
//   name          : Tên thẻ bài (tiếng Việt, càng "meme" càng vui)
//   card_type     : "Monster" | "Spell" | "Trap"
//   art           : { emoji: "🐸", c1: "#mãmàu", c2: "#mãmàu" } -> ảnh placeholder (emoji to + nền gradient)
//   custom_image  : để null. Sau này nếu có ảnh thật (vẽ/AI/tự chụp), điền đường dẫn ảnh vào đây,
//                   game sẽ tự ưu tiên hiển thị ảnh này thay cho placeholder.
//   description   : Mô tả hiệu ứng (nếu là bài Hiệu Ứng/Spell/Trap có tác dụng) HOẶC mô tả vui/lore
//                   (nếu là quái Thường không có hiệu ứng).
//
// Riêng THẺ QUÁI THÚ (card_type: "Monster") có thêm:
//   stars             : Số sao (1-12, giống Level/Rank). Sao >=5 cần hiến tế 1 quái, >=7 cần hiến tế 2.
//   tribe             : Tộc bài (VD: "Tộc Trẩu", "Tộc Đầm Lầy", "Tộc Hài"...)
//   monster_category  : "Thường" | "Hiệu Ứng" | "Dung Hợp" | "Nghi Lễ"
//   atk, def          : Điểm tấn công / phòng thủ (số nguyên)
//   effect_code       : (chỉ cho Hiệu Ứng) mã hiệu ứng máy đọc được, xem danh sách mã hợp lệ ở
//                       memecard.js -> hàm mcExecuteEffect(). Để trống/null nếu quái không có hiệu ứng.
//   effect_value      : số giá trị đi kèm effect_code (VD: số LP, số lá bài...)
//   effect_trigger    : "on_summon" | "on_attack" (thời điểm hiệu ứng tự kích hoạt)
//   fusion_requirement: (chỉ Dung Hợp) { count: số quái cần hiến tế, minStars: tổng sao tối thiểu }
//   ritual_requirement: (chỉ Nghi Lễ) { spellId: id của bài Nghi Lễ cần dùng kèm, minStars: tổng sao tối thiểu }
//
// THẺ MA PHÁP (card_type: "Spell") có thêm:
//   spell_category : "Thường" | "Nhanh" | "Liên Tục" | "Trang Bị" | "Môi Trường" | "Nghi Lễ"
//   effect_code, effect_value (xem mcExecuteEffect)
//
// THẺ BẪY (card_type: "Trap") có thêm:
//   trap_category : "Thường" | "Phản Đòn" | "Liên Tục"
//   effect_code, effect_value
//
// Sau khi thêm thẻ mới vào mảng dưới, lưu file lại và mở lại game — không cần sửa gì khác,
// thẻ sẽ tự xuất hiện trong Kho Bài của Deck Builder.

const MEME_CARDS = [

// ════════════════ QUÁI THÚ — THƯỜNG (vanilla, không hiệu ứng) ════════════════
{
    id: "trau_tre_len_doi", name: "Trẩu Tre Lên Đời", card_type: "Monster",
    stars: 3, tribe: "Tộc Trẩu", monster_category: "Thường", atk: 1300, def: 800,
    description: "Mới nứt mắt đã đòi làm đại ca xóm. Đi đâu cũng phải có nhạc nền remix mở loa kẹo kéo.",
    art: { emoji: "🛵", c1: "#b45309", c2: "#78350f" }, custom_image: null
},
{
    id: "co_mat_job", name: "Cò Mất Job", card_type: "Monster",
    stars: 2, tribe: "Tộc Lầy", monster_category: "Thường", atk: 900, def: 1100,
    description: "Thất nghiệp nhưng vẫn ung dung đứng một chân câu cá, đời không gấp gáp.",
    art: { emoji: "🦩", c1: "#0f766e", c2: "#134e4a" }, custom_image: null
},
{
    id: "ech_xanh_triet_ly", name: "Ếch Xanh Triết Lý", card_type: "Monster",
    stars: 1, tribe: "Tộc Đầm Lầy", monster_category: "Thường", atk: 300, def: 500,
    description: "Ngồi trên lá sen cả ngày chỉ để nói những câu thả thính vô nghĩa nhưng nghe rất "
        + "thấm vào lúc 2 giờ sáng.",
    art: { emoji: "🐸", c1: "#15803d", c2: "#14532d" }, custom_image: null
},
{
    id: "cua_dong_bat_khuat", name: "Cua Đồng Bất Khuất", card_type: "Monster",
    stars: 2, tribe: "Tộc Đầm Lầy", monster_category: "Thường", atk: 800, def: 1500,
    description: "Bị lật ngửa bao nhiêu lần vẫn tự lật lại được. Tinh thần thép trong lớp vỏ cứng.",
    art: { emoji: "🦀", c1: "#b91c1c", c2: "#7f1d1d" }, custom_image: null
},
{
    id: "meo_map_lan_long", name: "Mèo Map Lăn Lông Lốc", card_type: "Monster",
    stars: 4, tribe: "Tộc Mập", monster_category: "Thường", atk: 1600, def: 1400,
    description: "Cân nặng tỉ lệ thuận với độ lầy. Lăn qua là đè bẹp luôn đối thủ, không cần đánh.",
    art: { emoji: "🐱", c1: "#ca8a04", c2: "#854d0e" }, custom_image: null
},

// ════════════════ QUÁI THÚ — HIỆU ỨNG ════════════════
{
    id: "thanh_chui_binh_luan", name: "Thánh Chửi Bình Luận", card_type: "Monster",
    stars: 4, tribe: "Tộc Lầy", monster_category: "Hiệu Ứng", atk: 1500, def: 1200,
    effect_code: "burn_n", effect_value: 300, effect_trigger: "on_attack",
    description: "Khi quái này tấn công, gây thêm 300 sát thương trực diện vì mồm không bao giờ nghỉ.",
    art: { emoji: "💬", c1: "#9333ea", c2: "#581c87" }, custom_image: null
},
{
    id: "ninja_luon_dem", name: "Ninja Lượn Đêm", card_type: "Monster",
    stars: 4, tribe: "Tộc Bóng Tối", monster_category: "Hiệu Ứng", atk: 1700, def: 900,
    effect_code: "draw_n", effect_value: 1, effect_trigger: "on_summon",
    description: "Khi triệu hồi thành công, rút thêm 1 lá bài vì lượn cả đêm tìm được nhiều đồ hời.",
    art: { emoji: "🌙", c1: "#1e293b", c2: "#0f172a" }, custom_image: null
},
{
    id: "ba_hoa_dam_drama", name: "Bà Hoả Đam Mê Drama", card_type: "Monster",
    stars: 5, tribe: "Tộc Hài", monster_category: "Hiệu Ứng", atk: 1900, def: 1300,
    effect_code: "burn_n", effect_value: 500, effect_trigger: "on_summon",
    description: "Vừa xuất hiện là cả xóm dậy sóng. Khi triệu hồi thành công, gây ngay 500 sát thương hóng biến.",
    art: { emoji: "🔥", c1: "#dc2626", c2: "#7f1d1d" }, custom_image: null
},
{
    id: "trum_cuoi_bi_an", name: "Trùm Cuối Bí Ẩn", card_type: "Monster",
    stars: 7, tribe: "Tộc Bí Ẩn", monster_category: "Hiệu Ứng", atk: 2600, def: 2000,
    effect_code: "heal_n", effect_value: 800, effect_trigger: "on_summon",
    description: "Không ai biết mặt thật. Khi triệu hồi thành công, hồi 800 LP vì luôn có quỹ dự phòng khủng.",
    art: { emoji: "🕶️", c1: "#1f2937", c2: "#000000" }, custom_image: null
},
{
    id: "dao_ham_meme_lord", name: "Đào Hâm Meme Lord", card_type: "Monster",
    stars: 3, tribe: "Tộc Trẩu", monster_category: "Hiệu Ứng", atk: 1000, def: 1000,
    effect_code: "heal_n", effect_value: 400, effect_trigger: "on_summon",
    description: "Đào bới meme cũ chế lại liên tục. Khi triệu hồi, hồi 400 LP vì biết cách câu thời gian.",
    art: { emoji: "🍑", c1: "#f97316", c2: "#c2410c" }, custom_image: null
},
{
    id: "anh_grab_da_nhiem", name: "Anh Grab Đa Nhiệm", card_type: "Monster",
    stars: 4, tribe: "Tộc Lao Động", monster_category: "Hiệu Ứng", atk: 1500, def: 1500,
    effect_code: "draw_n", effect_value: 1, effect_trigger: "on_summon",
    description: "Vừa chạy xe vừa nghe đơn vừa nghĩ chuyện đời. Triệu hồi thành công thì rút thêm 1 lá vì giỏi xử lý đa luồng.",
    art: { emoji: "🛵", c1: "#16a34a", c2: "#14532d" }, custom_image: null
},
{
    id: "co_vy_dang_so", name: "Cô Vy Đáng Sợ", card_type: "Monster",
    stars: 6, tribe: "Tộc Vô Hình", monster_category: "Hiệu Ứng", atk: 1800, def: 600,
    effect_code: "burn_n", effect_value: 800, effect_trigger: "on_summon",
    description: "Vô hình mà ai cũng sợ. Khi triệu hồi thành công, gây 800 sát thương trực diện không báo trước.",
    art: { emoji: "🦠", c1: "#7c3aed", c2: "#4c1d95" }, custom_image: null
},
{
    id: "ke_seeding_chuyen_nghiep", name: "Kẻ Seeding Chuyên Nghiệp", card_type: "Monster",
    stars: 5, tribe: "Tộc Bí Ẩn", monster_category: "Hiệu Ứng", atk: 1700, def: 1700,
    effect_code: "draw_n", effect_value: 1, effect_trigger: "on_attack",
    description: "Tấn công xong vẫn kịp tay gõ thêm vài dòng review giả. Khi tấn công, rút thêm 1 lá.",
    art: { emoji: "⌨️", c1: "#0891b2", c2: "#155e75" }, custom_image: null
},
{
    id: "thuy_quai_lay_loi", name: "Thủy Quái Lầy Lội", card_type: "Monster",
    stars: 5, tribe: "Tộc Đầm Lầy", monster_category: "Hiệu Ứng", atk: 2000, def: 1000,
    effect_code: "heal_n", effect_value: 300, effect_trigger: "on_attack",
    description: "Trồi lên từ đáy ao sau cả năm ẩn dật. Mỗi lần tấn công, hồi 300 LP vì bùn rất bổ.",
    art: { emoji: "🐊", c1: "#365314", c2: "#1a2e05" }, custom_image: null
},

// ════════════════ QUÁI THÚ — DUNG HỢP (Extra Zone) ════════════════
{
    id: "dai_de_trau_tre_toi_thuong", name: "Đại Đế Trẩu Tre Tối Thượng", card_type: "Monster",
    stars: 8, tribe: "Tộc Trẩu", monster_category: "Dung Hợp", atk: 2800, def: 2200,
    fusion_requirement: { count: 2, minStars: 5 },
    description: "Hợp thể từ 2 quái thú bất kỳ trên sân (tổng sao tối thiểu 5). Đỉnh của chóp trong giới trẩu tre, "
        + "tay lái cứng tới mức không ai dám cà khịa.",
    art: { emoji: "👑", c1: "#b45309", c2: "#451a03" }, custom_image: null
},
{
    id: "quai_vat_lay_loi_toi_thuong", name: "Quái Vật Lầy Lội Tối Thượng", card_type: "Monster",
    stars: 9, tribe: "Tộc Đầm Lầy", monster_category: "Dung Hợp", atk: 3000, def: 2500,
    fusion_requirement: { count: 2, minStars: 6 },
    description: "Hợp thể từ 2 quái thú bất kỳ trên sân (tổng sao tối thiểu 6). Lầy đến mức cả vũ trụ phải nể.",
    art: { emoji: "🐙", c1: "#4d7c0f", c2: "#1a2e05" }, custom_image: null
},

// ════════════════ QUÁI THÚ — NGHI LỄ (Extra Zone) ════════════════
{
    id: "than_linh_hon_trau", name: "Thần Linh Hồn Trẩu", card_type: "Monster",
    stars: 8, tribe: "Tộc Thần Thoại", monster_category: "Nghi Lễ", atk: 2700, def: 2300,
    ritual_requirement: { spellId: "nghi_le_goi_hon_trau_tre", minStars: 8 },
    description: "Triệu hồi Nghi Lễ bằng bài [Nghi Lễ Gọi Hồn Trẩu Tre], hiến tế quái thú đủ tổng 8 sao trở lên. "
        + "Linh hồn của vạn con trẩu tre đã từng ngã xe hợp nhất thành một.",
    art: { emoji: "👻", c1: "#7c2d12", c2: "#fbbf24" }, custom_image: null
},

// ════════════════ MA PHÁP (SPELL) ════════════════
{
    id: "hot_via", name: "Hốt Vía", card_type: "Spell", spell_category: "Thường",
    effect_code: "draw_n", effect_value: 2,
    description: "Rút thêm 2 lá bài. Hên xui là chính, nhưng hốt được vía là vui cả ngày.",
    art: { emoji: "🍀", c1: "#16a34a", c2: "#14532d" }, custom_image: null
},
{
    id: "dinh_cua_chop", name: "Đỉnh Của Chóp", card_type: "Spell", spell_category: "Thường",
    effect_code: "heal_n", effect_value: 800,
    description: "Hồi 800 LP. Tự tin tuyên bố mình đỉnh nhất xóm, năng lượng tích cực lan toả tức thì.",
    art: { emoji: "🏔️", c1: "#0284c7", c2: "#075985" }, custom_image: null
},
{
    id: "khum_du_nua_dau", name: "Khum Đú Nữa Đâu", card_type: "Spell", spell_category: "Nhanh",
    effect_code: "burn_n", effect_value: 400,
    description: "Bài Tốc Hành — có thể dùng bất cứ lúc nào, kể cả lượt đối thủ. Bất ngờ dội 400 sát thương "
        + "trực diện trước khi đối thủ kịp đú theo.",
    art: { emoji: "⚡", c1: "#eab308", c2: "#854d0e" }, custom_image: null
},
{
    id: "vong_tay_ban_than", name: "Vòng Tay Bạn Thân", card_type: "Spell", spell_category: "Trang Bị",
    effect_code: "equip_atk_n", effect_value: 500,
    description: "Trang bị cho 1 quái thú của bạn: ATK +500. Có bạn thân chống lưng thì đánh đâu thắng đó.",
    art: { emoji: "🧿", c1: "#db2777", c2: "#831843" }, custom_image: null
},
{
    id: "mam_com_nha_ai_cung_phai_co", name: "Mâm Cơm Nhà Ai Cũng Phải Có", card_type: "Spell",
    spell_category: "Liên Tục", effect_code: "continuous_tribe_boost", effect_value: 300, target_tribe: "Tộc Trẩu",
    description: "Bài Liên Tục: trong khi bài này còn trên sân, toàn bộ quái thú Tộc Trẩu của bạn +300 ATK. "
        + "No bụng rồi mới có sức quẩy.",
    art: { emoji: "🍚", c1: "#f59e0b", c2: "#92400e" }, custom_image: null
},
{
    id: "vung_dat_lay_vinh_cuu", name: "Vùng Đất Lầy Vĩnh Cửu", card_type: "Spell", spell_category: "Môi Trường",
    effect_code: "continuous_tribe_boost", effect_value: 300, target_tribe: "Tộc Đầm Lầy",
    description: "Bài Môi Trường: toàn sân biến thành đầm lầy bất tận. Quái thú Tộc Đầm Lầy của bạn +300 ATK "
        + "khi bài này còn hiệu lực.",
    art: { emoji: "🌫️", c1: "#3f6212", c2: "#1a2e05" }, custom_image: null
},
{
    id: "nghi_le_goi_hon_trau_tre", name: "Nghi Lễ Gọi Hồn Trẩu Tre", card_type: "Spell", spell_category: "Nghi Lễ",
    description: "Dùng để Triệu hồi Nghi Lễ [Thần Linh Hồn Trẩu]. Hiến tế quái thú trên tay/sân có tổng sao "
        + "theo đúng yêu cầu của quái thú Nghi Lễ.",
    art: { emoji: "🕯️", c1: "#581c87", c2: "#1e1b4b" }, custom_image: null
},
{
    id: "trung_tang_bat_ngo", name: "Trùng Tang Bất Ngờ", card_type: "Spell", spell_category: "Thường",
    effect_code: "destroy_all_opponent_monsters", effect_value: 0,
    description: "Phá hủy toàn bộ quái thú phía đối thủ. Một biến cố không ai ngờ tới, xoá sạch cả sân trong "
        + "tích tắc. (Giới hạn: tối đa 1 lá trong Deck)",
    art: { emoji: "⚰️", c1: "#374151", c2: "#111827" }, custom_image: null
},

// ════════════════ BẪY (TRAP) ════════════════
{
    id: "mat_binh_tinh", name: "Mất Bình Tĩnh", card_type: "Trap", trap_category: "Thường",
    effect_code: "burn_n", effect_value: 500,
    description: "Lật bài úp này để gây 500 sát thương trực diện. Đối thủ làm bạn nóng mặt nên phải đáp trả ngay.",
    art: { emoji: "😤", c1: "#ea580c", c2: "#7c2d12" }, custom_image: null
},
{
    id: "dung_do_dung_di_dau", name: "Đứng Đó Đừng Đi Đâu", card_type: "Trap", trap_category: "Phản Đòn",
    effect_code: "negate_attack", effect_value: 0,
    description: "Phản Đòn: Khi đối thủ tuyên bố tấn công, vô hiệu hóa đòn tấn công đó. Đứng yên đó, không ai "
        + "đi đâu được hết.",
    art: { emoji: "✋", c1: "#dc2626", c2: "#7f1d1d" }, custom_image: null
},
{
    id: "gay_ong_dap_lung_ong", name: "Gậy Ông Đập Lưng Ông", card_type: "Trap", trap_category: "Phản Đòn",
    effect_code: "destroy_attacker", effect_value: 0,
    description: "Phản Đòn: Khi đối thủ tuyên bố tấn công, phá huỷ ngay quái thú đang tấn công đó. Gậy của ai "
        + "thì người đó tự ăn.",
    art: { emoji: "🏑", c1: "#92400e", c2: "#451a03" }, custom_image: null
},
{
    id: "luoi_tang_hinh_lay_loi", name: "Lưới Tàng Hình Lầy Lội", card_type: "Trap", trap_category: "Liên Tục",
    effect_code: "continuous_tribe_boost", effect_value: 300, target_tribe: "Tộc Đầm Lầy",
    description: "Bài Liên Tục: trong khi bài này còn trên sân, quái thú Tộc Đầm Lầy của bạn +300 ATK, ẩn mình "
        + "trong lưới lầy không ai phát hiện được.",
    art: { emoji: "🕸️", c1: "#1e3a8a", c2: "#172554" }, custom_image: null
},
{
    id: "tam_ly_vung_nhu_be_tong", name: "Tâm Lý Vững Như Bê Tông", card_type: "Trap", trap_category: "Thường",
    effect_code: "heal_n", effect_value: 600,
    description: "Lật bài úp này để hồi 600 LP. Dù drama cỡ nào cũng giữ được tinh thần thép.",
    art: { emoji: "🧱", c1: "#57534e", c2: "#1c1917" }, custom_image: null
},
{
    id: "lat_mat_khong_bao_truoc", name: "Lật Mặt Không Báo Trước", card_type: "Trap", trap_category: "Phản Đòn",
    effect_code: "destroy_attacker", effect_value: 0,
    description: "Phản Đòn: Khi đối thủ tuyên bố tấn công, phá huỷ ngay quái thú tấn công. Vừa thân thiện đó, "
        + "trở mặt cái là không nhận ra luôn.",
    art: { emoji: "🎭", c1: "#be185d", c2: "#500724" }, custom_image: null
}

];

// Chuẩn hoá: đảm bảo mọi thẻ có id, name, description hợp lệ trước khi game sử dụng
MEME_CARDS.forEach(c => {
    if (!c.custom_image) c.custom_image = null;
    if (c.card_type === 'Monster' && !c.monster_category) c.monster_category = 'Thường';
});

window.MEME_CARDS = MEME_CARDS;
console.log(`🐸 [memecard_data.js] Đã nạp ${MEME_CARDS.length} thẻ bài Đấu Trường Meme Xóm!`);
