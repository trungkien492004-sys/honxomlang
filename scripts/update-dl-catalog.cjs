const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve('assets/js/meme_duel_links_catalog.js');
let content = fs.readFileSync(catalogPath, 'utf8');

// Mapping of card ID to new name, name_vi, and updated description
const cardUpdates = {
  // 1. SETO KAIBA
  'DL-blue_eyes_alternative_white_dragon': {
    name: 'Rồng Trắng Mắt Xanh Biến Dị',
    name_vi: 'Rồng Trắng Mắt Xanh Biến Dị',
    max_copies: 1,
    desc: 'Hiện 1 Rồng Trắng Mắt Xanh trên tay để triệu hồi đặc biệt. 1 lần/lượt: chọn và phá hủy 1 quái của đối thủ (không thể tấn công trong lượt dùng hiệu ứng).'
  },
  'DL-blue_eyes_twin_burst_dragon': {
    name: 'Rồng Trắng Hai Đầu',
    name_vi: 'Rồng Trắng Hai Đầu',
    max_copies: 1,
    desc: 'Dung Hợp: 2x Rồng Trắng Mắt Xanh (có thể đưa 2 quái trên sân vào Mộ mà không cần Phép). Không bị tiêu diệt bởi chiến đấu. Tấn công quái vật 2 lần mỗi lượt. Sau khi tấn công quái không bị phá hủy: trục xuất quái đó.'
  },
  'DL-the_white_stone_of_ancients': {
    name: 'Đá Trắng Cổ Đại',
    name_vi: 'Đá Trắng Cổ Đại',
    max_copies: 1,
    desc: 'Khi lá này được gửi xuống Mộ: triệu hồi đặc biệt 1 quái Mắt Xanh từ Bộ bài ở End Phase. Trục xuất lá này từ Mộ: lấy 1 quái Mắt Xanh từ Mộ lên tay.'
  },
  'DL-the_white_stone_of_legend': {
    name: 'Đá Trắng Truyền Thuyết',
    name_vi: 'Đá Trắng Truyền Thuyết',
    max_copies: 1,
    desc: 'Khi lá này được gửi xuống Mộ: lấy 1 Rồng Trắng Mắt Xanh từ Bộ bài lên tay.'
  },
  'DL-sage_with_eyes_of_blue': {
    name: 'Hiền Triết Mắt Xanh',
    name_vi: 'Hiền Triết Mắt Xanh',
    max_copies: 1,
    desc: 'Khi triệu hồi thường: lấy 1 quái Điều Phối Ánh Sáng Cấp 1 từ Bộ bài lên tay. Bỏ lá này trên tay và gửi 1 quái hiệu ứng trên sân xuống Mộ: triệu hồi đặc biệt 1 quái Mắt Xanh từ Bộ bài.'
  },
  'DL-dragon_spirit_of_white': {
    name: 'Linh Hồn Rồng Trắng',
    name_vi: 'Linh Hồn Rồng Trắng',
    max_copies: 1,
    desc: 'Được tính là Quái Thường trên tay hoặc Mộ. Khi triệu hồi thường hoặc đặc biệt: trục xuất 1 Phép/Bẫy của đối thủ. Có thể hiến tế lá này để triệu hồi đặc biệt Rồng Trắng Mắt Xanh từ tay.'
  },
  'DL-the_melody_of_awakening_dragon': {
    name: 'Giai Điệu Thức Tỉnh Rồng',
    name_vi: 'Giai Điệu Thức Tỉnh Rồng',
    max_copies: 1,
    desc: 'Bỏ 1 lá trên tay: chọn tối đa 2 quái tộc Rồng có từ 3000 ATK trở lên và từ 2500 DEF trở xuống từ Bộ bài lên tay (chọn cùng lúc bằng multi-pick).'
  },
  'DL-cards_of_consonance': {
    name: 'Lá Bài Hòa Điệu',
    name_vi: 'Lá Bài Hòa Điệu',
    max_copies: 1,
    desc: 'Bỏ 1 quái tộc Rồng Điều Phối có ATK từ 1000 trở xuống trên tay: rút 2 lá.'
  },
  'DL-silvers_cry': {
    name: 'Tiếng Gầm Bạc',
    name_vi: 'Tiếng Gầm Bạc',
    max_copies: 1,
    desc: 'Chọn 1 quái Thường tộc Rồng (Rồng Trắng Mắt Xanh) trong Mộ: hồi sinh quái đó lên sân.'
  },
  'DL-bingo_machine_go': {
    name: 'Máy Bingo, Xuất Phát!',
    name_vi: 'Máy Bingo, Xuất Phát!',
    max_copies: 1,
    desc: 'Lấy ngẫu nhiên 1 lá mang tên "Mắt Xanh" từ Bộ bài lên tay.'
  },

  // 2. YUGI MUTO
  'DL-magicians_rod': {
    name: 'Gậy Phép Phù Thủy Áo Đen',
    name_vi: 'Gậy Phép Phù Thủy Áo Đen',
    max_copies: 1,
    desc: 'Khi triệu hồi thường: lấy 1 lá Phép/Bẫy ghi danh Phù Thủy Áo Đen từ Bộ bài lên tay.'
  },
  'DL-dark_magical_circle': {
    name: 'Ma Pháp Trận Phù Thủy Áo Đen',
    name_vi: 'Ma Pháp Trận Phù Thủy Áo Đen',
    max_copies: 1,
    desc: 'Khi kích hoạt: xem 3 lá trên cùng của Bộ bài, lấy 1 lá Phù Thủy Áo Đen hoặc Phép/Bẫy tương ứng lên tay. Mỗi khi Phù Thủy Áo Đen được triệu hồi: trục xuất 1 lá của đối thủ trên sân.'
  },
  'DL-magician_navigation': {
    name: 'Dẫn Lối Phù Thủy Áo Đen',
    name_vi: 'Dẫn Lối Phù Thủy Áo Đen',
    max_copies: 1,
    desc: 'Úp từ lượt trước. Triệu hồi đặc biệt 1 Phù Thủy Áo Đen từ tay, sau đó triệu hồi đặc biệt 1 quái Phép Thuật Bóng Tối Cấp 7 hoặc thấp hơn từ Bộ bài.'
  },
  'DL-eternal_soul': {
    name: 'Linh Hồn Vĩnh Cửu Phù Thủy Áo Đen',
    name_vi: 'Linh Hồn Vĩnh Cửu Phù Thủy Áo Đen',
    max_copies: 1,
    desc: 'Bẫy Liên Tục: Phù Thủy Áo Đen không bị ảnh hưởng bởi hiệu ứng của đối thủ. 1 lần/lượt: triệu hồi đặc biệt Phù Thủy Áo Đen từ tay hoặc Mộ, hoặc lấy Đòn Tấn Công Ma Pháp từ Bộ bài. Nếu lá này rời sân: phá hủy toàn bộ quái của bạn.'
  },
  'DL-apprentice_illusion_magician': {
    name: 'Đồ Đệ Ảo Ảnh Phù Thủy Áo Đen',
    name_vi: 'Đồ Đệ Ảo Ảnh Phù Thủy Áo Đen',
    max_copies: 1,
    desc: 'Bỏ 1 lá trên tay để triệu hồi đặc biệt. Khi triệu hồi: lấy 1 Phù Thủy Áo Đen từ Bộ bài lên tay. Trong chiến đấu: tăng 2000 ATK/DEF cho quái Phép Thuật Bóng Tối.'
  },
  'DL-the_eye_of_timaeus': {
    name: 'Con Mắt Timaeus',
    name_vi: 'Con Mắt Timaeus',
    max_copies: 1,
    desc: 'Chọn 1 Phù Thủy Áo Đen trên sân: dùng làm nguyên liệu triệu hồi Dung Hợp 1 quái Dung Hợp tương ứng (Kỵ Sĩ Áo Đen Tối Thượng hoặc Kỵ Sĩ Phù Thủy Bóng Tối).'
  },
  'DL-dark_cavalry': {
    name: 'Kỵ Sĩ Áo Đen Tối Thượng',
    name_vi: 'Kỵ Sĩ Áo Đen Tối Thượng',
    max_copies: 1,
    desc: 'Dung Hợp: Phù Thủy Áo Đen + 1 Quái Chiến Binh. Tăng 100 ATK cho mỗi Phép/Bẫy trên sân và Mộ. Gây sát thương xuyên thủ. Bỏ 1 lá trên tay: vô hiệu và phá hủy hiệu ứng nhắm mục tiêu.'
  },
  'DL-magician_of_chaos': {
    name: 'Phù Thủy Hỗn Mang',
    name_vi: 'Phù Thủy Hỗn Mang',
    max_copies: 1,
    desc: 'Nghi Lễ: Gọi bằng Ma Thuật Hắc Ám Hỗn Mang. Tên trở thành Phù Thủy Áo Đen trên sân và Mộ. Khi Phép/Bẫy kích hoạt: chọn và phá hủy 1 lá trên sân.'
  },
  'DL-illusion_magic': {
    name: 'Ma Thuật Ảo Ảnh',
    name_vi: 'Ma Thuật Ảo Ảnh',
    max_copies: 1,
    desc: 'Hiến tế 1 quái Phép Thuật trên sân: lấy tối đa 2 Phù Thủy Áo Đen từ Bộ bài hoặc Mộ lên tay (chọn cùng lúc bằng multi-pick).'
  },
  'DL-magicians_souls': {
    name: 'Linh Hồn Phù Thủy Áo Đen',
    name_vi: 'Linh Hồn Phù Thủy Áo Đen',
    max_copies: 1,
    desc: 'Gửi 1 quái Phép Thuật Cấp 6 trở lên từ Bộ bài xuống Mộ: triệu hồi đặc biệt lá này từ tay hoặc hồi sinh Phù Thủy Áo Đen từ Mộ. Gửi tối đa 2 Phép/Bẫy trên tay/sân xuống Mộ: rút số lá tương ứng.'
  },

  // 3. JOEY WHEELER
  'DL-red_eyes_slash_dragon': {
    name: 'Rồng Đen Thiết Trảm Mắt Đỏ',
    name_vi: 'Rồng Đen Thiết Trảm Mắt Đỏ',
    max_copies: 1,
    desc: 'Dung Hợp: Rồng Đen Mắt Đỏ + 1 Quái Chiến Binh. Khi quái Mắt Đỏ tấn công: trang bị 1 Chiến Binh từ Mộ (+200 ATK). Gửi 1 lá trang bị xuống Mộ: vô hiệu hiệu ứng đối thủ. Khi bị phá hủy: hồi sinh các quái trang bị.'
  },
  'DL-red_eyes_fusion': {
    name: 'Dung Hợp Mắt Đỏ',
    name_vi: 'Dung Hợp Mắt Đỏ',
    max_copies: 1,
    desc: 'Dung Hợp 1 quái mang tên Mắt Đỏ bằng nguyên liệu từ Tay, Sân hoặc BỘ BÀI (chọn nguyên liệu bằng multi-pick). Quái được triệu hồi mang tên Rồng Đen Mắt Đỏ.'
  },
  'DL-red_eyes_insight': {
    name: 'Cái Nhìn Thấu Mắt Đỏ',
    name_vi: 'Cái Nhìn Thấu Mắt Đỏ',
    max_copies: 1,
    desc: 'Gửi 1 quái Mắt Đỏ từ tay hoặc Bộ bài xuống Mộ: lấy 1 lá Phép/Bẫy Mắt Đỏ (Dung Hợp Mắt Đỏ, Nanh Xích Mắt Đỏ,...) từ Bộ bài lên tay.'
  },
  'DL-red_eyes_spirit': {
    name: 'Linh Hồn Mắt Đỏ',
    name_vi: 'Linh Hồn Mắt Đỏ',
    max_copies: 1,
    desc: 'Úp từ lượt trước. Hồi sinh 1 quái mang tên Mắt Đỏ từ Mộ lên sân.'
  },
  'DL-return_of_the_red_eyes': {
    name: 'Sự Trở Lại Của Mắt Đỏ',
    name_vi: 'Sự Trở Lại Của Mắt Đỏ',
    max_copies: 1,
    desc: 'Bẫy Liên Tục: Nếu có quái Mắt Đỏ trên sân, 1 lần/lượt hồi sinh 1 Quái Thường từ Mộ. Khi lá này bị phá hủy: hồi sinh 1 quái Mắt Đỏ từ Mộ.'
  },
  'DL-black_metal_dragon': {
    name: 'Rồng Đen Thép Mắt Đỏ',
    name_vi: 'Rồng Đen Thép Mắt Đỏ',
    max_copies: 1,
    desc: 'Trang bị từ tay hoặc sân vào 1 quái Mắt Đỏ (+600 ATK). Khi lá này được gửi từ sân hoặc tay xuống Mộ: lấy 1 lá Mắt Đỏ bất kỳ từ Bộ bài lên tay.',
    hand_action: false
  },
  'DL-red_eyes_retro_dragon': {
    name: 'Rồng Cổ Xưa Mắt Đỏ',
    name_vi: 'Rồng Cổ Xưa Mắt Đỏ',
    max_copies: 1,
    desc: 'Khi quái Mắt Đỏ Cấp 7 hoặc thấp hơn bị phá hủy: triệu hồi đặc biệt lá này từ tay và hồi sinh quái Mắt Đỏ vừa bị tiêu diệt.'
  },
  'DL-gearfried_the_red_eyes_iron_knight': {
    name: 'Kỵ Sĩ Sắt Mắt Đỏ Gearfried',
    name_vi: 'Kỵ Sĩ Sắt Mắt Đỏ Gearfried',
    max_copies: 1,
    desc: '1 lần/lượt nếu được trang bị: phá hủy 1 Phép/Bẫy của đối thủ. Có thể gửi lá trang bị xuống Mộ để hồi sinh 1 quái Mắt Đỏ Cấp 7 hoặc thấp hơn từ Mộ.'
  },
  'DL-red_eyes_baby_dragon': {
    name: 'Rồng Con Mắt Đỏ',
    name_vi: 'Rồng Con Mắt Đỏ',
    max_copies: 1,
    desc: 'Khi bị phá hủy bởi chiến đấu: triệu hồi đặc biệt 1 quái Mắt Đỏ Cấp 7 hoặc thấp hơn từ Bộ bài và trang bị lá này vào quái đó (+300 ATK).'
  },
  'DL-red_eyes_fang_with_chain': {
    name: 'Nanh Xích Mắt Đỏ',
    name_vi: 'Nanh Xích Mắt Đỏ',
    max_copies: 1,
    desc: 'Úp từ lượt trước. Kích hoạt: trang bị vào 1 quái Mắt Đỏ (+500 ATK/DEF, tấn công 2 quái mỗi lượt). Khi đã trang bị: gửi lá này xuống Mộ để cướp 1 quái hiệu ứng của đối thủ biến thành trang bị tăng ATK/DEF.'
  },

  // 4. MAXIMILLION PEGASUS
  'DL-toon_kingdom': {
    name: 'Vương Quốc Hoạt Hình',
    name_vi: 'Vương Quốc Hoạt Hình',
    max_copies: 1,
    desc: 'Tên trở thành Thế Giới Hoạt Hình. Khi kích hoạt: trục xuất 3 lá trên cùng của Bộ bài úp. Quái Hoạt Hình không thể bị đối thủ nhắm mục tiêu hiệu ứng. Nếu quái Hoạt Hình bị phá hủy: trục xuất 1 lá trên cùng Bộ bài thay thế.'
  },
  'DL-toon_bookmark': {
    name: 'Đánh Dấu Trang Hoạt Hình',
    name_vi: 'Đánh Dấu Trang Hoạt Hình',
    max_copies: 1,
    desc: 'Lấy 1 lá Thế Giới/Vương Quốc Hoạt Hình hoặc lá bài ghi danh từ Bộ bài lên tay. Có thể trục xuất lá này từ Mộ để bảo vệ Thế Giới/Vương Quốc Hoạt Hình khỏi bị phá hủy.'
  },
  'DL-toon_table_of_contents': {
    name: 'Mục Lục Hoạt Hình',
    name_vi: 'Mục Lục Hoạt Hình',
    max_copies: 1,
    desc: 'Lấy 1 lá bài mang tên Hoạt Hình (Toon) bất kỳ từ Bộ bài lên tay.'
  },
  'DL-toon_page_flipper': {
    name: 'Lật Trang Hoạt Hình',
    name_vi: 'Lật Trang Hoạt Hình',
    max_copies: 1,
    desc: 'Nếu có Thế Giới Hoạt Hình: hiện 3 quái Hoạt Hình khác nhau từ Bộ bài, đối thủ chọn ngẫu nhiên 1 quái để bạn triệu hồi đặc biệt miễn phí.'
  },
  'DL-toon_black_luster_soldier': {
    name: 'Chiến Binh Ánh Sáng Hoạt Hình',
    name_vi: 'Chiến Binh Ánh Sáng Hoạt Hình',
    max_copies: 1,
    desc: 'Triệu hồi đặc biệt bằng cách hiến tế quái Hoạt Hình có tổng cấp từ 8 trở lên. 1 lần/lượt: trục xuất 1 lá trên sân. Có thể tấn công trực tiếp nếu đối thủ không có quái Hoạt Hình.'
  },
  'DL-toon_harpie_lady': {
    name: 'Yêu Điểu Hoạt Hình',
    name_vi: 'Yêu Điểu Hoạt Hình',
    max_copies: 1,
    desc: 'Nếu có Thế Giới Hoạt Hình trên sân: triệu hồi đặc biệt lá này từ tay. Phá hủy 1 Phép/Bẫy của đối thủ. Có thể tấn công trực tiếp.'
  },
  'DL-millennium_eyes_restrict': {
    name: 'Quỷ Ngàn Mắt Thiên Niên',
    name_vi: 'Quỷ Ngàn Mắt Thiên Niên',
    max_copies: 1,
    desc: 'Dung Hợp: Quỷ Hy Sinh + 1 Quái Hiệu Ứng. Khi đối thủ kích hoạt hiệu ứng quái thú: hút quái đó trên sân hoặc trong Mộ làm trang bị (+ATK/DEF tương ứng và phong ấn quái cùng tên).'
  },
  'DL-relinquished_fusion': {
    name: 'Dung Hợp Quỷ Hy Sinh',
    name_vi: 'Dung Hợp Quỷ Hy Sinh',
    max_copies: 1,
    desc: 'Dung Hợp Quỷ Ngàn Mắt bằng cách trục xuất nguyên liệu từ Tay, Sân hoặc Mộ (chọn cùng lúc bằng multi-pick).'
  },
  'DL-golden_eyes_idol': {
    name: 'Tượng Hoàng Kim Mắt',
    name_vi: 'Tượng Hoàng Kim Mắt',
    max_copies: 1,
    desc: 'Xem tay đối thủ. Có thể hiến tế lá này để biến thành trang bị cho Quỷ Hy Sinh hoặc Quỷ Ngàn Mắt.'
  },
  'DL-toon_terror': {
    name: 'Nỗi Khiếp Sợ Hoạt Hình',
    name_vi: 'Nỗi Khiếp Sợ Hoạt Hình',
    max_copies: 1,
    desc: 'Bẫy Phản Đòn: Khi có Thế Giới/Vương Quốc Hoạt Hình, vô hiệu hóa và phá hủy bất kỳ kích hoạt Phép, Bẫy hoặc Hiệu Ứng Quái Thú của đối thủ.'
  },

  // 5. JADEN YUKI
  'DL-neos_fusion': {
    name: 'Dung Hợp Tân Vũ',
    name_vi: 'Dung Hợp Tân Vũ',
    max_copies: 1,
    desc: 'Dung Hợp 1 quái Dung Hợp Tân Vũ bằng nguyên liệu từ Tay, Sân hoặc BỘ BÀI (chọn bằng multi-pick). Có thể trục xuất lá này từ Mộ để bảo vệ quái Dung Hợp Tân Vũ khỏi bị phá hủy.'
  },
  'DL-elemental_hero_brave_neos': {
    name: 'Anh Hùng Nguyên Tố Dũng Giả Tân Vũ',
    name_vi: 'Anh Hùng Nguyên Tố Dũng Giả Tân Vũ',
    max_copies: 1,
    desc: 'Dung Hợp: Anh Hùng Nguyên Tố Tân Vũ + 1 Quái Hiệu Ứng Cấp 4 hoặc thấp hơn. Tăng 100 ATK cho mỗi quái Anh Hùng/Tân Không Gian trong Mộ. Khi tiêu diệt quái địch: lấy 1 lá Phép/Bẫy Tân Vũ từ Bộ bài lên tay.'
  },
  'DL-elemental_hero_sunrise': {
    name: 'Anh Hùng Nguyên Tố Thái Dương',
    name_vi: 'Anh Hùng Nguyên Tố Thái Dương',
    max_copies: 1,
    desc: 'Dung Hợp: 2 quái Anh Hùng Nguyên Tố khác Hệ. Khi triệu hồi: lấy 1 lá Phép Dung Hợp Kỳ Tích từ Bộ bài lên tay. Tăng 200 ATK cho quái cùng Hệ. Khi quái Anh Hùng khác tấn công: phá hủy 1 lá trên sân.'
  },
  'DL-elemental_hero_liquid_soldier': {
    name: 'Anh Hùng Nguyên Tố Thủy Nhân',
    name_vi: 'Anh Hùng Nguyên Tố Thủy Nhân',
    max_copies: 1,
    desc: 'Khi triệu hồi thường: hồi sinh 1 quái Anh Hùng Cấp 4 hoặc thấp hơn từ Mộ. Khi dùng làm nguyên liệu Dung Hợp gửi xuống Mộ/trục xuất: rút 2 lá, bỏ 1 lá.'
  },
  'DL-elemental_hero_solid_soldier': {
    name: 'Anh Hùng Nguyên Tố Thiết Nhân',
    name_vi: 'Anh Hùng Nguyên Tố Thiết Nhân',
    max_copies: 1,
    desc: 'Khi triệu hồi thường: triệu hồi đặc biệt 1 quái Anh Hùng Cấp 4 hoặc thấp hơn từ tay. Khi bị gửi từ vùng quái xuống Mộ bởi hiệu ứng Phép: hồi sinh 1 quái Anh Hùng từ Mộ ở thế phòng thủ.'
  },
  'DL-elemental_hero_honest_neos': {
    name: 'Anh Hùng Nguyên Tố Chân Thực Tân Vũ',
    name_vi: 'Anh Hùng Nguyên Tố Chân Thực Tân Vũ',
    max_copies: 1,
    desc: 'Bỏ lá này trên tay: tăng 2500 ATK cho 1 quái Anh Hùng Nguyên Tố trên sân cho đến hết lượt.'
  },
  'DL-masked_hero_anki': {
    name: 'Anh Hùng Mặt Nạ Ám Quỷ',
    name_vi: 'Anh Hùng Mặt Nạ Ám Quỷ',
    max_copies: 1,
    desc: 'Biến Đổi: Gọi bằng Phép Mặt Nạ Biến Đổi. Có thể tấn công trực tiếp đối thủ (sát thương giảm một nửa). Khi tiêu diệt quái địch bằng chiến đấu: lấy 1 Phép Mặt Nạ Biến Đổi từ Bộ bài lên tay.'
  },
  'DL-a_hero_lives': {
    name: 'Anh Hùng Xuất Hiện',
    name_vi: 'Anh Hùng Xuất Hiện',
    max_copies: 1,
    desc: 'Nếu không điều khiển quái nào: trả một nửa LP, triệu hồi đặc biệt 1 quái Anh Hùng Nguyên Tố Cấp 4 hoặc thấp hơn từ Bộ bài.'
  },
  'DL-form_change': {
    name: 'Biến Đổi Hình Thái',
    name_vi: 'Biến Đổi Hình Thái',
    max_copies: 1,
    desc: 'Đưa 1 quái Anh Hùng Dung Hợp trên sân về Bộ bài phụ: triệu hồi đặc biệt 1 Anh Hùng Mặt Nạ cùng cấp từ Bộ bài phụ.'
  },
  'DL-favorite_hero': {
    name: 'Anh Hùng Tâm Đắc',
    name_vi: 'Anh Hùng Tâm Đắc',
    max_copies: 1,
    desc: 'Trang bị cho quái Anh Hùng Cấp 7 trở lên: tăng ATK bằng chỉ số DEF gốc, không thể bị nhắm mục tiêu hiệu ứng. Kích hoạt trực tiếp 1 Ma Pháp Môi Trường từ Bộ bài.'
  },

  // 6. ZANE TRUESDALE
  'DL-cyber_dragon_core': {
    name: 'Lõi Rồng Máy',
    name_vi: 'Lõi Rồng Máy',
    max_copies: 1,
    desc: 'Tên trở thành Rồng Máy trên sân và Mộ. Khi triệu hồi thường: lấy 1 lá Phép/Bẫy Rồng Máy từ Bộ bài lên tay. Trục xuất lá này từ Mộ khi đối thủ có quái: triệu hồi đặc biệt Rồng Máy từ Bộ bài.'
  },
  'DL-cyber_emergency': {
    name: 'Tín Hiệu Khẩn Rồng Máy',
    name_vi: 'Tín Hiệu Khẩn Rồng Máy',
    max_copies: 1,
    desc: 'Lấy 1 quái tộc Máy Ánh Sáng không thể triệu hồi thường hoặc quái mang tên Rồng Máy từ Bộ bài lên tay.'
  },
  'DL-cyberload_fusion': {
    name: 'Dung Hợp Rồng Máy',
    name_vi: 'Dung Hợp Rồng Máy',
    max_copies: 1,
    desc: 'Dung Hợp 1 quái Dung Hợp Rồng Máy bằng cách xáo các nguyên liệu đang ở trên Sân hoặc Đang Trục Xuất vào Bộ bài (chọn bằng multi-pick).'
  },
  'DL-chimeratech_rampage_dragon': {
    name: 'Rồng Hợp Máy Cuồng Nộ',
    name_vi: 'Rồng Hợp Máy Cuồng Nộ',
    max_copies: 1,
    desc: 'Dung Hợp: 2+ Quái Rồng Máy. Khi triệu hồi: phá hủy Phép/Bẫy của đối thủ bằng số nguyên liệu sử dụng. Gửi tối đa 2 quái Máy Ánh Sáng từ Bộ bài xuống Mộ: tăng số lần tấn công tương ứng.'
  },
  'DL-cyber_repair_plant': {
    name: 'Trạm Sửa Chữa Rồng Máy',
    name_vi: 'Trạm Sửa Chữa Rồng Máy',
    max_copies: 1,
    desc: 'Nếu có Rồng Máy trong Mộ: lấy 1 quái Máy Ánh Sáng từ Bộ bài lên tay hoặc xáo 1 quái từ Mộ về Bộ bài.'
  },
  'DL-cyber_dragon_nachster': {
    name: 'Rồng Máy Hậu Duệ',
    name_vi: 'Rồng Máy Hậu Duệ',
    max_copies: 1,
    desc: 'Tên trở thành Rồng Máy trên sân và Mộ. Bỏ 1 quái trên tay để triệu hồi đặc biệt lá này. Khi triệu hồi: hồi sinh 1 quái Máy có 2100 ATK hoặc DEF từ Mộ.'
  },
  'DL-cyber_dragon_vier': {
    name: 'Rồng Máy Đệ Tứ',
    name_vi: 'Rồng Máy Đệ Tứ',
    max_copies: 1,
    desc: 'Tên trở thành Rồng Máy trên sân và Mộ. Khi bạn triệu hồi Rồng Máy: triệu hồi đặc biệt lá này từ tay ở thế thủ. Tăng 500 ATK/DEF cho toàn bộ Rồng Máy.'
  },
  'DL-cybernetic_overflow': {
    name: 'Quá Tải Rồng Máy',
    name_vi: 'Quá Tải Rồng Máy',
    max_copies: 1,
    desc: 'Úp từ lượt trước. Trục xuất các quái Rồng Máy có cấp độ khác nhau từ Tay, Sân hoặc Mộ (chọn bằng multi-pick): phá hủy số lá bài tương ứng trên sân của đối thủ.'
  },
  'DL-cybernetic_fusion_support': {
    name: 'Tiếp Ứng Dung Hợp Rồng Máy',
    name_vi: 'Tiếp Ứng Dung Hợp Rồng Máy',
    max_copies: 1,
    desc: 'Trả một nửa LP: lượt này khi triệu hồi Dung Hợp quái tộc Máy, có thể trục xuất nguyên liệu từ Tay, Sân hoặc Mộ.'
  },
  'DL-evolution_burst': {
    name: 'Hơi Thở Tiến Hóa Bùng Nổ',
    name_vi: 'Hơi Thở Tiến Hóa Bùng Nổ',
    max_copies: 1,
    desc: 'Nếu điều khiển Rồng Máy: chọn và phá hủy 1 lá bài của đối thủ. Rồng Máy không thể tấn công trong lượt dùng lá này.'
  }
};

// 1. Process card blocks line by line
const lines = content.split('\n');
let currentId = null;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const idMatch = line.match(/id:\s*['"](DL-[a-z0-9_]+)['"]/);
  if (idMatch) {
    currentId = idMatch[1];
  }
  if (currentId && cardUpdates[currentId]) {
    const u = cardUpdates[currentId];
    if (line.includes('name:')) {
      lines[i] = `      name: '${u.name}',`;
    } else if (line.includes('name_vi:')) {
      lines[i] = `      name_vi: '${u.name_vi}',`;
    } else if (line.includes('max_copies:')) {
      lines[i] = `      max_copies: ${u.max_copies},`;
    } else if (line.trim().startsWith('description:')) {
      lines[i] = `      description: '${u.desc}',`;
    } else if (line.includes('hand_action: true') && u.hand_action === false) {
      lines[i] = ''; // remove line
    }
  }
  if (line.trim() === '},') {
    currentId = null;
  }
}
content = lines.filter(l => l !== '').join('\n');

// 2. Rebalance Preset Decks to strictly obey Limit 1 and synergy
const balancedPresets = `  const dlPresets = {
    'Kaiba · Đỉnh Cao Mắt Xanh': [
      'AN-blue_eyes_white_dragon', 'AN-blue_eyes_white_dragon', 'AN-blue_eyes_white_dragon',
      'DL-blue_eyes_alternative_white_dragon',
      'DL-dragon_spirit_of_white',
      'DL-the_white_stone_of_ancients',
      'DL-the_white_stone_of_legend',
      'DL-sage_with_eyes_of_blue',
      'AN-kaibaman',
      'AN-vorse_raider',
      'DL-the_melody_of_awakening_dragon',
      'DL-cards_of_consonance',
      'DL-silvers_cry',
      'DL-bingo_machine_go',
      'AN-burst_stream_of_destruction',
      'AN-flute_of_summoning_dragon',
      'AN-pot_of_greed', 'AN-monster_reborn', 'AN-mirror_force', 'AN-magic_cylinder'
    ],
    'Yugi · Ma Thuật Tối Thượng': [
      'AN-dark_magician', 'AN-dark_magician', 'AN-dark_magician',
      'AN-dark_magician_girl',
      'DL-magicians_rod',
      'DL-apprentice_illusion_magician',
      'DL-magicians_souls',
      'DL-magician_of_chaos',
      'AN-celtic_guardian',
      'DL-dark_magical_circle',
      'DL-illusion_magic',
      'DL-the_eye_of_timaeus',
      'AN-dark_magic_attack',
      'AN-thousand_knives',
      'DL-magician_navigation',
      'DL-eternal_soul',
      'AN-swords_of_revealing_light',
      'AN-pot_of_greed', 'AN-monster_reborn', 'AN-mirror_force'
    ],
    'Joey · Rồng Đen Bất Diệt': [
      'AN-red_eyes_black_dragon', 'AN-red_eyes_black_dragon', 'AN-red_eyes_black_dragon',
      'DL-black_metal_dragon',
      'DL-gearfried_the_red_eyes_iron_knight',
      'DL-red_eyes_retro_dragon',
      'DL-red_eyes_baby_dragon',
      'AN-baby_dragon',
      'AN-time_wizard',
      'AN-jinzo',
      'AN-alligator_sword',
      'DL-red_eyes_fusion',
      'DL-red_eyes_insight',
      'DL-red_eyes_spirit',
      'DL-return_of_the_red_eyes',
      'DL-red_eyes_fang_with_chain',
      'AN-polymerization',
      'AN-pot_of_greed', 'AN-monster_reborn', 'AN-scarecrow'
    ],
    'Pegasus · Vương Quốc Hoạt Hình': [
      'DL-toon_black_luster_soldier',
      'DL-toon_harpie_lady',
      'AN-blue_eyes_toon_dragon',
      'AN-toon_mermaid',
      'AN-toon_dark_magician_girl',
      'DL-golden_eyes_idol',
      'AN-thousand_eyes_idol',
      'AN-relinquished',
      'AN-black_illusion_ritual',
      'DL-toon_kingdom',
      'AN-toon_world',
      'DL-toon_bookmark',
      'DL-toon_table_of_contents',
      'DL-toon_page_flipper',
      'DL-relinquished_fusion',
      'DL-toon_terror',
      'AN-pot_of_greed', 'AN-monster_reborn', 'AN-mirror_force', 'AN-magic_cylinder'
    ],
    'Jaden · Anh Hùng Tối Thượng': [
      'AN-elemental_hero_neos', 'AN-elemental_hero_neos',
      'AN-elemental_hero_sparkman',
      'AN-elemental_hero_clayman',
      'AN-elemental_hero_burstinatrix',
      'AN-elemental_hero_avian',
      'MGX-elemental_hero_stratos',
      'DL-elemental_hero_liquid_soldier',
      'DL-elemental_hero_solid_soldier',
      'DL-elemental_hero_honest_neos',
      'DL-neos_fusion',
      'AN-miracle_fusion',
      'AN-polymerization',
      'DL-a_hero_lives',
      'MGX-mask_change',
      'DL-form_change',
      'DL-favorite_hero',
      'AN-pot_of_greed', 'AN-monster_reborn', 'AN-mirror_force'
    ],
    'Zane · Rồng Máy Tận Diệt': [
      'AN-cyber_dragon', 'AN-cyber_dragon', 'AN-cyber_dragon',
      'AN-proto_cyber_dragon',
      'DL-cyber_dragon_core',
      'DL-cyber_dragon_nachster',
      'DL-cyber_dragon_vier',
      'AN-cyber_phoenix',
      'AN-cyber_valley',
      'DL-cyber_emergency',
      'DL-cyber_repair_plant',
      'DL-cyberload_fusion',
      'AN-power_bond',
      'AN-polymerization',
      'DL-evolution_burst',
      'DL-cybernetic_fusion_support',
      'DL-cybernetic_overflow',
      'AN-pot_of_greed', 'AN-monster_reborn', 'AN-mirror_force'
    ]
  };`;

content = content.replace(/const dlPresets = \{[\s\S]*?\n  \};/, balancedPresets);

// 3. Update dlExtras so every extra deck contains exactly 1 of the DL boss monsters
const balancedExtras = `  const dlExtras = {
    'Kaiba · Đỉnh Cao Mắt Xanh': [
      'DL-blue_eyes_twin_burst_dragon',
      'AN-blue_eyes_ultimate_dragon'
    ],
    'Yugi · Ma Thuật Tối Thượng': [
      'DL-dark_cavalry',
      'AN-dark_paladin'
    ],
    'Joey · Rồng Đen Bất Diệt': [
      'DL-red_eyes_slash_dragon',
      'AN-black_skull_dragon',
      'AN-thousand_dragon',
      'AN-flame_swordsman'
    ],
    'Pegasus · Vương Quốc Hoạt Hình': [
      'DL-millennium_eyes_restrict',
      'AN-thousand_eyes_restrict'
    ],
    'Jaden · Anh Hùng Tối Thượng': [
      'DL-elemental_hero_brave_neos',
      'DL-elemental_hero_sunrise',
      'DL-masked_hero_anki',
      'AN-elemental_hero_flame_wingman',
      'AN-elemental_hero_shining_flare_wingman'
    ],
    'Zane · Rồng Máy Tận Diệt': [
      'DL-chimeratech_rampage_dragon',
      'AN-cyber_twin_dragon',
      'AN-cyber_end_dragon',
      'AN-chimeratech_overdragon'
    ]
  };`;

content = content.replace(/const dlExtras = \{[\s\S]*?\n  \};/, balancedExtras);

fs.writeFileSync(catalogPath, content, 'utf8');
console.log('Successfully updated meme_duel_links_catalog.js safely!');
