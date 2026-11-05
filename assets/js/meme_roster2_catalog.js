// Đợt 1 nhân vật mới: Marik (DM), Jack (5D's), Shark (ZEXAL), Chazz (GX). Chỉ số và hiệu ứng tra từ dữ liệu TCG.
// Hiệu ứng nằm ở meme_roster2_engine.js. Lá nào chưa làm đúng được thì không đưa vào.
(() => {
  const note = 'Theo văn bản TCG, sân H5: 3 ô quái, 4000 LP.';
  const mon = (arch, id, en, vi, el, tribe, stars, atk, def, extra = {}) => ({
    id: 'AN-' + id, name: vi, name_vi: vi, name_en: en, archetype: arch, element: el, tribe, card_type: 'Monster',
    stars, atk, def, monster_category: 'Hiệu ứng', rarity: 'R', max_copies: 3, deck_zone: 'Main', effect_code: '', effect_value: 0,
    effect_trigger: 'passive', traits: [], catalogue_version: 'roster2-v1', activation_rules: 'Theo mô tả lá bài.', engine_notes: note,
    art: { emoji: '✦', c1: '#7d5cff', c2: '#141a33' }, ...extra
  });
  const art = (emoji, c1, c2 = '#141a33') => ({ emoji, c1, c2 });
  const onBattleDeath = { effect_trigger: 'on_destroy' };
  const M = art('👁', '#b08a2e'), J = art('🔥', '#c8281e'), S = art('🦈', '#1f8fd6'), C = art('🟡', '#3fa34d');
  const cards = [
    // Marik
    mon('Marik', 'gil_garth', 'Gil Garth', 'Gil Garth', 'Ám', 'Quỷ', 4, 1800, 1200, { monster_category: 'Thường', description: 'Cỗ máy khủng bố bọc thép, chém gục kẻ thù bằng thanh katana khổng lồ.', art: M }),
    mon('Marik', 'newdoria', 'Newdoria', 'Newdoria', 'Ám', 'Quỷ', 4, 1200, 800, { ...onBattleDeath, effect_code: 'r2_newdoria', rarity: 'SR', description: 'Nếu lá này bị phá hủy trong chiến đấu và đưa vào Mộ: chọn 1 quái trên sân; phá hủy nó.', art: M }),
    mon('Marik', 'mystic_tomato', 'Mystic Tomato', 'Cà Chua Thần Bí', 'Ám', 'Thực Vật', 4, 1400, 1100, { ...onBattleDeath, effect_code: 'r2_tomato', rarity: 'SR', description: 'Khi lá này bị phá hủy trong chiến đấu và đưa vào Mộ: bạn có thể Triệu hồi Đặc biệt 1 quái ÁM có ATK từ 1500 trở xuống từ Bộ bài ở thế tấn công.', art: art('🍅', '#b3261e') }),
    mon('Marik', 'giant_germ', 'Giant Germ', 'Vi Khuẩn Khổng Lồ', 'Ám', 'Quỷ', 2, 1000, 100, { ...onBattleDeath, effect_code: 'r2_germ', description: 'Khi lá này bị phá hủy trong chiến đấu và đưa vào Mộ: gây 500 sát thương cho đối thủ, sau đó bạn có thể Triệu hồi Đặc biệt bao nhiêu lá "Vi Khuẩn Khổng Lồ" tùy ý từ Bộ bài ở thế tấn công.', art: M }),
    mon('Marik', 'mask_of_darkness', 'Mask of Darkness', 'Mặt Nạ Bóng Tối', 'Ám', 'Quỷ', 2, 900, 400, { effect_code: 'r2_mask', effect_trigger: 'on_flip', monster_category: 'Lật', description: 'LẬT: chọn 1 Bẫy trong Mộ của bạn; đưa lá đó lên tay.', art: art('🎭', '#6a3fb5') }),
    // Jack
    mon('Jack', 'red_dragon_archfiend', 'Red Dragon Archfiend', 'Rồng Quỷ Đỏ', 'Ám', 'Rồng', 8, 3000, 2000, { deck_zone: 'Extra', monster_category: 'Đồng Bộ', rarity: 'UR', max_copies: 1, traits: ['r2_rda'], synchro_requirement: { tuners: 1, minNonTuners: 1, level: 8 }, description: '1 Tuner + 1 hoặc nhiều quái không phải Tuner. Sau tính sát thương, nếu lá này tấn công quái thế thủ của đối thủ: phá hủy tất cả quái thế thủ đối thủ điều khiển. Trong End Phase của bạn: phá hủy tất cả quái khác của bạn không tuyên bố tấn công lượt này. Lá này phải ngửa trên sân để kích hoạt.', activation_rules: 'Đồng Bộ từ bộ bài phụ.', art: art('🐲', '#c8281e') }),
    mon('Jack', 'red_resonator', 'Red Resonator', 'Cộng Hưởng Đỏ', 'Hỏa', 'Quỷ', 2, 600, 200, { is_tuner: true, effect_code: 'r2_red_reso', effect_trigger: 'on_summon', rarity: 'SR', description: 'Khi lá này được Triệu hồi Thường: bạn có thể Triệu hồi Đặc biệt 1 quái Cấp 4 trở xuống từ tay. Khi lá này được Triệu hồi Đặc biệt: bạn có thể chọn 1 quái ngửa trên sân; nhận LP bằng ATK của nó. Mỗi lượt chỉ dùng được hiệu ứng này một lần.', art: J }),
    mon('Jack', 'dark_resonator', 'Dark Resonator', 'Cộng Hưởng Bóng Tối', 'Ám', 'Quỷ', 3, 1300, 300, { is_tuner: true, traits: ['gogogo_guard'], description: 'Lần đầu lá này sắp bị phá hủy trong chiến đấu mỗi lượt, nó không bị phá hủy.', art: J }),
    mon('Jack', 'mad_archfiend', 'Mad Archfiend', 'Quỷ Điên', 'Ám', 'Quỷ', 4, 1800, 0, { traits: ['piercing', 'r2_mad'], description: 'Nếu lá này tấn công quái thế thủ, gây sát thương xuyên giáp cho đối thủ. Nếu lá này đang ngửa thế tấn công bị chọn làm mục tiêu tấn công: chuyển nó sang thế thủ.', art: J }),
    mon('Jack', 'power_invader', 'Power Invader', 'Kẻ Xâm Lăng Sức Mạnh', 'Ám', 'Quỷ', 5, 2200, 0, { rarity: 'SR', description: 'Nếu đối thủ điều khiển từ 2 quái trở lên, bạn có thể Triệu hồi Thường lá này không cần Hiến tế.', art: J }),
    // Shark
    mon('Shark', 'big_jaws', 'Big Jaws', 'Hàm Lớn', 'Thủy', 'Cá', 3, 1800, 300, { traits: ['r2_big_jaws'], description: 'Vào cuối Battle Phase, nếu lá này đã tấn công: trục xuất nó.', art: S, engine_notes: 'Game gộp Battle Phase vào cuối lượt, nên lá bị trục xuất ở End Phase của lượt đó.' }),
    mon('Shark', 'hammer_shark', 'Hammer Shark', 'Cá Mập Búa', 'Thủy', 'Cá', 4, 1700, 1500, { effect_code: 'r2_hammer', effect_trigger: 'activated', rarity: 'SR', description: 'Một lần mỗi lượt: bạn có thể giảm 1 Cấp của lá này, và nếu làm vậy, Triệu hồi Đặc biệt 1 quái THỦY Cấp 3 trở xuống từ tay.', art: S }),
    mon('Shark', 'shark_stickers', 'Shark Stickers', 'Cá Bám', 'Thủy', 'Cá', 3, 200, 1000, { traits: ['r2_stickers', 'no_synchro_material'], description: 'Khi một quái tộc Cá, Hải Long hoặc Thủy được Triệu hồi Thường hoặc Đặc biệt lên sân bạn: bạn có thể Triệu hồi Đặc biệt lá này từ tay. Lá này không thể dùng làm nguyên liệu Đồng Bộ.', art: S }),
    mon('Shark', 'black_ray_lancer', 'Black Ray Lancer', 'Thương Thủ Cá Đuối Đen', 'Ám', 'Thú Chiến Binh', 0, 2100, 600, { deck_zone: 'Extra', monster_category: 'Xyz', rank: 3, rarity: 'SR', max_copies: 2, effect_code: 'r2_lancer', effect_trigger: 'activated', xyz_requirement: { materials: 2, rank: 3, element: 'Thủy' }, description: '2 quái THỦY Cấp 3. Một lần mỗi lượt: bạn có thể tách 1 nguyên liệu Xyz khỏi lá này, chọn 1 quái ngửa trên sân; vô hiệu hóa hiệu ứng của nó đến End Phase.', activation_rules: 'Triệu hồi Xyz từ bộ bài phụ.', art: art('🗡', '#2b3f8c') }),
    mon('Shark', 'number_32_shark_drake', 'Number 32: Shark Drake', 'Số 32: Rồng Cá Mập', 'Thủy', 'Hải Long', 0, 2800, 2100, { deck_zone: 'Extra', monster_category: 'Xyz', rank: 4, rarity: 'UR', max_copies: 1, traits: ['r2_drake'], xyz_requirement: { materials: 3, rank: 4 }, description: '3 quái Cấp 4. Một lần mỗi lượt, khi lá này tấn công và phá hủy quái đối thủ trong chiến đấu rồi đưa vào Mộ: bạn có thể tách 1 nguyên liệu; Triệu hồi Đặc biệt quái bị phá lên sân đối thủ ở thế tấn công (nó mất 1000 ATK), và nếu làm vậy, lá này có thể tấn công lần thứ hai trong Battle Phase này.', activation_rules: 'Triệu hồi Xyz từ bộ bài phụ.', art: art('🐉', '#0f6ea8') }),
    // Chazz
    mon('Chazz', 'ojama_yellow', 'Ojama Yellow', 'Ojama Vàng', 'Quang', 'Thú', 2, 0, 1000, { monster_category: 'Thường', description: 'Một thành viên của bộ ba Ojama, chen vào bằng mọi giá.', art: art('🟡', '#d6b21f') }),
    mon('Chazz', 'ojama_green', 'Ojama Green', 'Ojama Xanh', 'Quang', 'Thú', 2, 0, 1000, { monster_category: 'Thường', description: 'Một thành viên của bộ ba Ojama, chen vào bằng mọi giá.', art: C }),
    mon('Chazz', 'ojama_black', 'Ojama Black', 'Ojama Đen', 'Quang', 'Thú', 2, 0, 1000, { monster_category: 'Thường', description: 'Một thành viên của bộ ba Ojama, chen vào bằng mọi giá.', art: art('⚫', '#3c3c46') }),
    mon('Chazz', 'armed_dragon_lv3', 'Armed Dragon LV3', 'Rồng Vũ Trang LV3', 'Phong', 'Rồng', 3, 1200, 900, { traits: ['r2_lv3'], rarity: 'SR', description: 'Trong Standby Phase của bạn: bạn có thể đưa lá này vào Mộ; Triệu hồi Đặc biệt 1 "Rồng Vũ Trang LV5" từ tay hoặc Bộ bài.', art: art('🐉', '#4b8f5a') }),
    mon('Chazz', 'armed_dragon_lv5', 'Armed Dragon LV5', 'Rồng Vũ Trang LV5', 'Phong', 'Rồng', 5, 2400, 1700, { effect_code: 'r2_lv5', effect_trigger: 'activated', traits: ['r2_lv5'], rarity: 'SR', max_copies: 2, description: 'Bạn có thể đưa 1 quái từ tay vào Mộ, rồi chọn 1 quái đối thủ có ATK nhỏ hơn hoặc bằng ATK của quái vừa đưa vào Mộ; phá hủy nó. Trong End Phase, nếu lá này đã phá hủy quái trong chiến đấu lượt này: bạn có thể đưa lá này vào Mộ; Triệu hồi Đặc biệt 1 "Rồng Vũ Trang LV7" từ tay hoặc Bộ bài.', art: art('🐉', '#2f7d6b') }),
    mon('Chazz', 'armed_dragon_lv7', 'Armed Dragon LV7', 'Rồng Vũ Trang LV7', 'Phong', 'Rồng', 7, 2800, 1000, { effect_code: 'r2_lv7', effect_trigger: 'activated', special_only: true, rarity: 'UR', max_copies: 2, description: 'Không thể Triệu hồi Thường hoặc Úp. Chỉ Triệu hồi Đặc biệt bằng "Rồng Vũ Trang LV5". Bạn có thể đưa 1 quái từ tay vào Mộ; phá hủy tất cả quái đối thủ có ATK nhỏ hơn hoặc bằng ATK của quái vừa đưa vào Mộ.', art: art('🐉', '#1f6f8b') }),
    mon('Chazz', 'chthonian_soldier', 'Chthonian Soldier', 'Chiến Sĩ Âm Phủ', 'Ám', 'Chiến Binh', 4, 1200, 1400, { traits: ['r2_chthonian'], description: 'Khi lá này bị quái tấn công của đối thủ phá hủy và đưa vào Mộ, sát thương chiến đấu bạn nhận từ trận này cũng gây cho đối thủ.', art: art('⚔', '#5a4a6a') })
  ];
  const known = new Set((window.MEME_CARDS || []).map(c => c.id));
  window.MEME_CARDS = [...(window.MEME_CARDS || []), ...cards.filter(c => !known.has(c.id))];
  if (typeof CARDS !== 'undefined') { CARDS.splice(0, CARDS.length, ...window.MEME_CARDS.filter(c => !c.uncollectible)); CARD_BY_ID.clear(); for (const c of window.MEME_CARDS) CARD_BY_ID.set(c.id, c); }

  const staples = ['AN-pot_of_greed', 'AN-monster_reborn', 'AN-mirror_force', 'AN-magic_cylinder', 'AN-mystical_space_typhoon', 'AN-mystical_space_typhoon', 'AN-swords_of_revealing_light', 'AN-waboku', 'AN-waboku'];
  const x3 = (...ids) => ids.flatMap(i => ['AN-' + i, 'AN-' + i, 'AN-' + i]);
  const DECK = window.MEME_DECK_PRESETS ||= {}, EXTRA = window.MEME_EXTRA_PRESETS ||= {};
  DECK['Marik · Kinh điển'] = [...x3('gil_garth', 'newdoria', 'mystic_tomato', 'giant_germ'), 'AN-mask_of_darkness', 'AN-mask_of_darkness', ...staples]; EXTRA['Marik · Kinh điển'] = [];
  DECK['Jack · Kinh điển'] = [...x3('red_resonator', 'dark_resonator', 'mad_archfiend', 'power_invader'), ...staples]; EXTRA['Jack · Kinh điển'] = ['AN-red_dragon_archfiend'];
  DECK['Shark · Kinh điển'] = [...x3('big_jaws', 'hammer_shark', 'shark_stickers', 'gil_garth'), ...staples]; EXTRA['Shark · Kinh điển'] = ['AN-black_ray_lancer', 'AN-black_ray_lancer', 'AN-number_32_shark_drake'];
  DECK['Chazz · Kinh điển'] = [...x3('armed_dragon_lv3', 'chthonian_soldier', 'ojama_yellow'), 'AN-armed_dragon_lv5', 'AN-armed_dragon_lv5', 'AN-armed_dragon_lv7', 'AN-armed_dragon_lv7', ...staples]; EXTRA['Chazz · Kinh điển'] = [];

  const add = (id, name, skill, code, description, color, icon, title) => ({ id, name, skill, code, description, tile: 0, color, icon, title, group: title, primaryDeck: title + ' · Kinh điển', position: '0%', value: 0, figure: true });
  const HEROES = window.MEME_HEROES ||= [];
  if (!HEROES.some(h => h.code === 'marik')) HEROES.push(
    add(9, 'Marik Ishtar', 'Thần Hầu Bóng Tối', 'marik', 'Trả 500 LP: đổi 1 lá trên tay lấy Cà Chua Thần Bí hoặc Newdoria từ bộ bài.', '#e0b84a', '👁', 'Marik'),
    add(10, 'Jack Atlas', 'Vua Tốc Độ', 'jack', 'Trả 500 LP: đổi 1 lá trên tay lấy Cộng Hưởng Đỏ hoặc Kẻ Xâm Lăng Sức Mạnh từ bộ bài.', '#ff5a4a', '🔥', 'Jack'),
    add(11, 'Reginald Kastle / Shark', 'Răng Cá Mập', 'shark', 'Trả 500 LP: đổi 1 lá trên tay lấy Cá Mập Búa hoặc Hàm Lớn từ bộ bài.', '#4ab6ff', '🦈', 'Shark'),
    add(12, 'Chazz Princeton / Manjoume', 'Manjoume Thunder', 'chazz', 'Trả 500 LP: đổi 1 lá trên tay lấy Rồng Vũ Trang LV3 hoặc LV5 từ bộ bài.', '#8bd17c', '⚡', 'Chazz')
  );
  if (window.ARCANA_CATALOGUE) window.ARCANA_CATALOGUE.cardCount = (window.ARCANA_CATALOGUE.cardCount || 0) + cards.filter(c => !known.has(c.id)).length;
})();
