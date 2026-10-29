// Yuma Tsukumo / ZEXAL catalogue. Xyz cards use deck_zone "Extra" plus xyz_requirement.
(() => {
  const base = {
    archetype: 'Yuma',
    card_type: 'Monster',
    rarity: 'N',
    max_copies: 3,
    deck_zone: 'Main',
    effect_code: '',
    effect_value: 0,
    effect_trigger: 'passive',
    traits: [],
    catalogue_version: 'zexal-v1',
    art: { emoji: '🌀', c1: '#8f8bff', c2: '#1b1f42' },
    engine_notes: 'Bản phỏng theo ZEXAL cho sân H5: 3 ô quái, 4000 LP. XYZ dùng 2 quái cùng Cấp ngửa trên sân, đặt tại Ô quái Extra; nguyên liệu nằm dưới lá và xuống Mộ khi bị tách hoặc khi lá rời sân.'
  };
  const cards = [
    { ...base,
      id: 'AN-gagaga_magician', name: 'Ảo Thuật Gia Gagaga', name_vi: 'Ảo Thuật Gia Gagaga', name_en: 'Gagaga Magician',
      element: 'Ám', tribe: 'Pháp Sư', stars: 4, atk: 1500, def: 1000, monster_category: 'Hiệu ứng', rarity: 'R',
      effect_code: 'gagaga_level', effect_trigger: 'activated', traits: ['gagaga'],
      description: 'Một lần mỗi lượt: bạn có thể chọn 1 Cấp từ 1 đến 8; Cấp của lá này trở thành Cấp đã chọn cho đến hết lượt này.',
      activation_rules: 'Kích hoạt khi lá ngửa trên sân trong MAIN của bạn. Cấp đổi dùng để chọn nguyên liệu XYZ cùng Cấp.',
      engine_notes: 'Cấp đổi có hiệu lực đến hết lượt, không đổi Cấp thật của lá.'
    },
    { ...base,
      id: 'AN-gagaga_girl', name: 'Cô Gái Gagaga', name_vi: 'Cô Gái Gagaga', name_en: 'Gagaga Girl',
      element: 'Ám', tribe: 'Pháp Sư', stars: 3, atk: 1000, def: 800, monster_category: 'Hiệu ứng', rarity: 'R',
      effect_code: 'gagaga_girl', effect_trigger: 'activated', traits: ['gagaga', 'gagaga_special'],
      description: 'Nếu bạn điều khiển quái "Gagaga": bạn có thể Triệu hồi Đặc biệt lá này từ tay. Một lần mỗi lượt: chọn 1 quái ngửa của đối thủ; ATK của nó trở thành 0 cho đến hết lượt này.',
      activation_rules: 'Triệu hồi Đặc biệt từ tay khi bạn có quái Gagaga ngửa trên sân. Hiệu ứng đưa ATK về 0 dùng trong MAIN của bạn.',
      engine_notes: 'Hiệu ứng ATK về 0 chỉ áp dụng cho phần còn lại của lượt và không phải hiệu ứng chỉ định liên tục.'
    },
    { ...base,
      id: 'AN-gagaga_child', name: 'Đứa Trẻ Gagaga', name_vi: 'Đứa Trẻ Gagaga', name_en: 'Gagaga Child',
      element: 'Ám', tribe: 'Pháp Sư', stars: 2, atk: 800, def: 1200, monster_category: 'Hiệu ứng', rarity: 'N',
      traits: ['gagaga', 'gagaga_special', 'gagaga_child_four'],
      description: 'Nếu bạn điều khiển quái "Gagaga" khác: bạn có thể Triệu hồi Đặc biệt lá này từ tay, nhưng Cấp của nó trở thành 4.',
      activation_rules: 'Triệu hồi Đặc biệt từ tay khi bạn có quái Gagaga ngửa trên sân. Cấp của lá trên sân là 4.',
      engine_notes: 'Cấp 4 cố định khi ở trên sân để dễ ghép XYZ Rank 4.'
    },
    { ...base,
      id: 'AN-zubaba_knight', name: 'Hiệp Sĩ Zubaba', name_vi: 'Hiệp Sĩ Zubaba', name_en: 'Zubaba Knight',
      element: 'Địa', tribe: 'Chiến Binh', stars: 3, atk: 1600, def: 900, monster_category: 'Hiệu ứng', rarity: 'N',
      traits: ['zubaba_knight'],
      description: 'Nếu lá này tấn công quái ở thế Thủ: phá hủy quái đó ngay lập tức bằng hiệu ứng của lá này, không tính sát thương chiến đấu.',
      activation_rules: 'Tự động khi tấn công quái đang ở thế Thủ ngửa hoặc úp.',
      engine_notes: 'Không có sát thương chiến đấu và không có Đánh Lại cho đòn này.'
    },
    { ...base,
      id: 'AN-gogogo_golem', name: 'Người Đá Gogogo', name_vi: 'Người Đá Gogogo', name_en: 'Gogogo Golem',
      element: 'Địa', tribe: 'Đá', stars: 4, atk: 1800, def: 1500, monster_category: 'Hiệu ứng', rarity: 'N',
      traits: ['gogogo_guard'],
      description: 'Một lần mỗi lượt, lá này không thể bị phá hủy bởi chiến đấu.',
      activation_rules: 'Tự động khi lá này sắp bị phá hủy bởi chiến đấu lần đầu trong lượt.',
      engine_notes: 'Mỗi bản sao Gogogo Golem có một lần bảo vệ chiến đấu riêng trong mỗi lượt.'
    },
    { ...base,
      id: 'AN-kagetokage', name: 'Bóng Tối Hình Thằn Lằn', name_vi: 'Bóng Tối Hình Thằn Lằn', name_en: 'Kagetokage',
      element: 'Ám', tribe: 'Bò Sát', stars: 4, atk: 1100, def: 1500, monster_category: 'Hiệu ứng', rarity: 'N',
      traits: ['kagetokage_special'], special_only: true,
      description: 'Không thể Triệu hồi Thường/Úp. Phải được Triệu hồi Đặc biệt (từ tay) bằng cách điều khiển 1 quái Cấp 4.',
      activation_rules: 'Chọn lá trên tay khi bạn đang điều khiển quái Cấp 4 ngửa và còn ô quái trống.',
      engine_notes: 'Cấp 4 sẵn để ghép XYZ Rank 4 cùng các quái Yuma khác.'
    },
    { ...base,
      id: 'AN-ganbara_knight', name: 'Hiệp Sĩ Ganbara', name_vi: 'Hiệp Sĩ Ganbara', name_en: 'Ganbara Knight',
      element: 'Quang', tribe: 'Chiến Binh', stars: 4, atk: 0, def: 2000, monster_category: 'Hiệu ứng', rarity: 'N',
      traits: ['ganbara_knight'],
      description: 'Khi lá này bị phá hủy trong chiến đấu và được gửi vào Mộ: bạn có thể chuyển quái đã tấn công sang thế Thủ.',
      activation_rules: 'Tự động khi bị phá hủy bởi chiến đấu.',
      engine_notes: 'Quái tấn công đổi sang thế Thủ ngửa nếu còn trên sân.'
    },
    { ...base,
      id: 'AN-onomatopaira', name: 'Onomatopaira', name_vi: 'Onomatopaira', name_en: 'Onomatopaira',
      card_type: 'Spell', rarity: 'R', effect_code: 'onomatopaira', effect_trigger: 'activated',
      spell_category: 'Thường', element: 'Quang', tribe: 'Hỗ Trợ', atk: 0, def: 0, stars: 0, monster_category: '',
      description: 'Bỏ 1 lá bài; thêm tối đa 2 quái "Gagaga", "Zubaba", "Gogogo" hoặc "Dododo" có tên khác nhau từ Bộ bài lên tay.',
      activation_rules: 'Kích hoạt trong MAIN khi trên tay có lá khác để bỏ và Bộ bài có quái hợp lệ.',
      engine_notes: 'Hai lá lấy lên phải khác tên. Bộ bài được xáo lại sau khi lấy.'
    },
    { ...base,
      id: 'AN-gagagabolt', name: 'Gagagabolt', name_vi: 'Gagagabolt', name_en: 'Gagagabolt',
      card_type: 'Spell', rarity: 'N', effect_code: 'gagagabolt', effect_trigger: 'activated',
      spell_category: 'Thường', element: 'Ám', tribe: 'Hỗ Trợ', atk: 0, def: 0, stars: 0, monster_category: '',
      description: 'Nếu bạn điều khiển quái "Gagaga": chọn 1 lá trên sân đối thủ; phá hủy lá đó.',
      activation_rules: 'Kích hoạt trong MAIN khi có quái Gagaga ngửa trên sân và đối thủ có mục tiêu.',
      engine_notes: 'Có thể chọn quái, Phép/Bẫy hoặc Phép Môi Trường của đối thủ.'
    },
    { ...base,
      id: 'AN-gagagaguard', name: 'Gagagaguard', name_vi: 'Gagagaguard', name_en: 'Gagagaguard',
      card_type: 'Trap', rarity: 'R', effect_code: 'gagagaguard', effect_trigger: 'activated',
      trap_category: 'Thường', element: 'Quang', tribe: 'Hỗ Trợ', atk: 0, def: 0, stars: 0, monster_category: '',
      description: 'Nếu bạn điều khiển quái "Gagaga": trong lượt này, quái của bạn không thể bị phá hủy bởi hiệu ứng lá bài.',
      activation_rules: 'Úp 1 lượt rồi kích hoạt chủ động trong MAIN khi có quái Gagaga ngửa trên sân.',
      engine_notes: 'Bảo vệ mọi quái của bạn khỏi phá hủy bởi hiệu ứng trong phần còn lại của lượt, không chặn sát thương.'
    },
    { ...base,
      id: 'AN-half_unbreak', name: 'Nửa Bất Diệt', name_vi: 'Nửa Bất Diệt', name_en: 'Half Unbreak',
      card_type: 'Trap', rarity: 'N', effect_code: 'half_unbreak', effect_trigger: 'activated',
      trap_category: 'Thường', element: 'Quang', tribe: 'Hỗ Trợ', atk: 0, def: 0, stars: 0, monster_category: '',
      description: 'Chọn 1 quái của bạn: trong lượt này, quái đó không thể bị phá hủy bởi chiến đấu, và sát thương chiến đấu liên quan đến nó bị chia đôi.',
      activation_rules: 'Úp 1 lượt. Tự hỏi khi đối thủ tấn công quái của bạn; cũng có thể kích hoạt chủ động trong MAIN.',
      engine_notes: 'Sát thương chiến đấu (cả hai chiều) làm tròn lên sau khi chia đôi; không chặn hiệu ứng phá hủy.'
    },
    // XYZ monsters
    { ...base,
      id: 'AN-number_39_utopia', name: 'Số 39: Utopia', name_vi: 'Số 39: Utopia', name_en: 'Number 39: Utopia',
      deck_zone: 'Extra', element: 'Quang', tribe: 'Chiến Binh', stars: 0, rank: 4, atk: 2500, def: 2000,
      monster_category: 'Xyz', rarity: 'UR', max_copies: 2, xyz_requirement: { materials: 2, rank: 4 }, traits: ['utopia'],
      description: '2 quái Cấp 4. Khi quái của đối thủ tuyên bố tấn công: bạn có thể tách 1 nguyên liệu XYZ của lá này; vô hiệu hóa đòn tấn công đó.',
      activation_rules: 'Triệu hồi XYZ bằng 2 quái Cấp 4 ngửa trên sân. Hiệu ứng vô hiệu hóa tự hỏi khi bị tấn công.',
      engine_notes: 'Mỗi lần vô hiệu hóa tốn 1 nguyên liệu; Utopia hết nguyên liệu vẫn tấn công bình thường.'
    },
    { ...base,
      id: 'AN-number_17_leviathan_dragon', name: 'Số 17: Rồng Leviathan', name_vi: 'Số 17: Rồng Leviathan', name_en: 'Number 17: Leviathan Dragon',
      deck_zone: 'Extra', element: 'Ám', tribe: 'Rồng', stars: 0, rank: 3, atk: 2000, def: 0,
      monster_category: 'Xyz', rarity: 'SR', max_copies: 2, xyz_requirement: { materials: 2, rank: 3 },
      effect_code: 'leviathan_charge', effect_trigger: 'activated', traits: ['leviathan'],
      description: '2 quái Cấp 3. Một lần mỗi lượt: bạn có thể tách 1 nguyên liệu XYZ của lá này; lá này tăng 500 ATK. Nếu lá này không có nguyên liệu XYZ, nó không thể tấn công trực tiếp.',
      activation_rules: 'Triệu hồi XYZ bằng 2 quái Cấp 3. Hiệu ứng tăng ATK dùng trong MAIN của bạn.',
      engine_notes: 'ATK tăng vĩnh viễn; giới hạn đánh trực tiếp kiểm tra số nguyên liệu còn lại.'
    },
    { ...base,
      id: 'AN-gagaga_cowboy', name: 'Cao Bồi Gagaga', name_vi: 'Cao Bồi Gagaga', name_en: 'Gagaga Cowboy',
      deck_zone: 'Extra', element: 'Địa', tribe: 'Chiến Binh', stars: 0, rank: 4, atk: 1500, def: 2400,
      monster_category: 'Xyz', rarity: 'SR', max_copies: 2, xyz_requirement: { materials: 2, rank: 4 },
      effect_code: 'cowboy_shot', effect_trigger: 'activated', traits: ['gagaga'],
      description: '2 quái Cấp 4. Một lần mỗi lượt: bạn có thể tách 1 nguyên liệu XYZ của lá này; nếu lá này ở thế Tấn công, nó tăng 1000 ATK, nếu ở thế Thủ, gây 800 sát thương cho đối thủ.',
      activation_rules: 'Triệu hồi XYZ bằng 2 quái Cấp 4. Hiệu ứng dùng trong MAIN của bạn.',
      engine_notes: 'Hiệu ứng chọn theo tư thế hiện tại của lá lúc giải quyết.'
    },
    { ...base,
      id: 'AN-zubaba_general', name: 'Tướng Quân Zubaba', name_vi: 'Tướng Quân Zubaba', name_en: 'Zubaba General',
      deck_zone: 'Extra', element: 'Địa', tribe: 'Chiến Binh', stars: 0, rank: 4, atk: 2000, def: 1000,
      monster_category: 'Xyz', rarity: 'R', max_copies: 2, xyz_requirement: { materials: 2, rank: 4 },
      effect_code: 'zubaba_general', effect_trigger: 'activated',
      description: '2 quái Cấp 4. Một lần mỗi lượt: bạn có thể tách 1 nguyên liệu XYZ của lá này; trang bị 1 quái Chiến Binh từ tay cho lá này, và lá này tăng ATK bằng ATK của quái được trang bị.',
      activation_rules: 'Triệu hồi XYZ bằng 2 quái Cấp 4. Cần 1 quái Chiến Binh trên tay để dùng hiệu ứng.',
      engine_notes: 'Quái Chiến Binh được gửi xuống Mộ; phần ATK cộng thêm là vĩnh viễn.'
    }
  ];

  const existing = window.MEME_CARDS || [];
  const known = new Set(existing.map(c => c.id));
  window.MEME_CARDS = [...existing, ...cards.filter(c => !known.has(c.id))];

  const yumaMain = [
    'AN-gagaga_magician', 'AN-gagaga_magician', 'AN-gagaga_magician',
    'AN-gagaga_girl', 'AN-gagaga_girl',
    'AN-gagaga_child', 'AN-gagaga_child',
    'AN-zubaba_knight', 'AN-zubaba_knight', 'AN-zubaba_knight',
    'AN-gogogo_golem', 'AN-gogogo_golem', 'AN-gogogo_golem',
    'AN-kagetokage', 'AN-kagetokage',
    'AN-ganbara_knight', 'AN-ganbara_knight', 'AN-ganbara_knight',
    'AN-onomatopaira', 'AN-onomatopaira',
    'AN-gagagabolt', 'AN-gagagabolt',
    'AN-mystical_space_typhoon', 'AN-mystical_space_typhoon',
    'AN-monster_reborn',
    'AN-mirror_force',
    'AN-magic_cylinder',
    'AN-gagagaguard',
    'AN-half_unbreak', 'AN-half_unbreak'
  ];
  const yumaExtra = [
    'AN-number_39_utopia', 'AN-number_39_utopia',
    'AN-number_17_leviathan_dragon',
    'AN-gagaga_cowboy',
    'AN-zubaba_general', 'AN-zubaba_general'
  ];
  const utopiaMain = [
    'AN-gagaga_magician', 'AN-gagaga_magician', 'AN-gagaga_magician',
    'AN-gagaga_child', 'AN-gagaga_child', 'AN-gagaga_child',
    'AN-gagaga_girl', 'AN-gagaga_girl',
    'AN-ganbara_knight', 'AN-ganbara_knight', 'AN-ganbara_knight',
    'AN-kagetokage', 'AN-kagetokage', 'AN-kagetokage',
    'AN-zubaba_knight', 'AN-zubaba_knight', 'AN-zubaba_knight',
    'AN-gogogo_golem', 'AN-gogogo_golem',
    'AN-onomatopaira', 'AN-onomatopaira',
    'AN-mystical_space_typhoon', 'AN-mystical_space_typhoon',
    'AN-monster_reborn',
    'AN-gagagaguard', 'AN-gagagaguard',
    'AN-mirror_force',
    'AN-magic_cylinder',
    'AN-half_unbreak', 'AN-half_unbreak'
  ];
  const utopiaExtra = [
    'AN-number_39_utopia', 'AN-number_39_utopia',
    'AN-zubaba_general', 'AN-zubaba_general',
    'AN-gagaga_cowboy',
    'AN-number_17_leviathan_dragon'
  ];
  window.MEME_DECK_PRESETS = window.MEME_DECK_PRESETS || {};
  window.MEME_EXTRA_PRESETS = window.MEME_EXTRA_PRESETS || {};
  window.MEME_DECK_PRESETS['Yuma · Kinh điển'] = [...yumaMain];
  window.MEME_EXTRA_PRESETS['Yuma · Kinh điển'] = [...yumaExtra];
  window.MEME_DECK_PRESETS['Yuma · Utopia'] = [...utopiaMain];
  window.MEME_EXTRA_PRESETS['Yuma · Utopia'] = [...utopiaExtra];
  if (window.ARCANA_CATALOGUE) {
    window.ARCANA_CATALOGUE.cardCount = (window.ARCANA_CATALOGUE.cardCount || 0) + cards.filter(c => !known.has(c.id)).length;
    window.ARCANA_CATALOGUE.era = window.ARCANA_CATALOGUE.era || 'DM / GX / ZEXAL · Luật Anime H5';
  }
})();
