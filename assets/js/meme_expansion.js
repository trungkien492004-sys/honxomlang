// 67 original cards. Together with the original 33 cards this set contains 100.
(() => {
  const cards = window.MEME_CARDS;
  const palettes = { Hỏa:['#ff8746','#7f1630'], Thủy:['#58e4ff','#153b89'], Phong:['#9df3b2','#145c62'], Quang:['#ffe491','#8754ad'], Ám:['#cb9aff','#36185f'], Cơ:['#87cfff','#243b59'] };
  const add = (id,name,type,element,emoji,fields) => cards.push({id,name,card_type:type,element,art:{emoji,c1:palettes[element][0],c2:palettes[element][1]},custom_image:null,...fields});
  const m = (id,name,element,emoji,stars,atk,def,code,value,trigger,description,extra={}) => add(id,name,'Monster',element,emoji,{stars,atk,def,tribe:`Tộc ${element}`,monster_category:code?'Hiệu Ứng':'Thường',effect_code:code||null,effect_value:value||0,effect_trigger:trigger||null,description,...extra});
  const s = (id,name,element,emoji,category,code,value,description,extra={}) => add(id,name,'Spell',element,emoji,{spell_category:category,effect_code:code,effect_value:value,description,...extra});
  const t = (id,name,element,emoji,category,code,value,description) => add(id,name,'Trap',element,emoji,{trap_category:category,effect_code:code,effect_value:value,description});

  // 32 monsters: six visual factions, passive, triggered and activated effects.
  m('kiem_si_binh_minh','Kiếm Sĩ Bình Minh','Quang','⚔️',4,1650,1200,'boost_all',300,'on_summon','Khi triệu hồi: toàn bộ quái của bạn +300 ATK đến hết lượt này.');
  m('long_nhi_hoa_toc','Long Nhi Hỏa Tốc','Hỏa','🐉',3,1350,700,'burn_n',300,'on_summon','Khi triệu hồi: gây 300 sát thương LP.');
  m('phap_su_bang_tra','Pháp Sư Băng Trà','Thủy','🧊',4,1450,1700,'freeze_all',1,'on_summon','Khi triệu hồi: quái đối thủ đang có trên sân không thể tấn công trong lượt kế tiếp của họ.');
  m('ho_ve_sen_hong','Hộ Vệ Sen Hồng','Phong','🪷',3,1100,1900,'shield_n',500,'on_summon','Khi triệu hồi: tạo khiên hấp thụ tổng cộng 500 sát thương LP cho bạn.');
  m('meo_kiem_khach','Mèo Kiếm Khách','Phong','🐈',4,1750,800,null,0,null,'Có thể tấn công tối đa 2 lần mỗi lượt.',{traits:['double_attack']});
  m('rong_com_chay','Rồng Cơm Cháy','Hỏa','🔥',6,2300,1500,null,0,null,'Gây sát thương xuyên thủ bằng chênh lệch ATK và DEF khi đánh quái thế thủ.',{traits:['piercing']});
  m('nu_vuong_mat_trang','Nữ Vương Mặt Trăng','Ám','🌙',6,2200,1800,null,0,null,'Hồi LP bằng sát thương chiến đấu thực tế lá này gây cho đối thủ.',{traits:['lifesteal']});
  m('chien_binh_giap_giay','Chiến Binh Giáp Giấy','Cơ','🛡️',4,1500,1600,null,0,null,'Mỗi lượt, lần đầu bị phá hủy trong chiến đấu sẽ được bảo vệ.',{traits:['battle_resist']});
  m('linh_gac_giay','Lính Gác Giấy','Cơ','🤖',1,500,700,null,0,null,'Lính gác nhỏ của xóm. Có thể được gọi ra bằng hiệu ứng Triệu Tập.');
  m('ho_ly_thu_vien','Hồ Ly Thư Viện','Quang','🦊',3,1000,1400,'search_spell',1,'on_summon','Khi triệu hồi: lấy lá Phép đầu tiên trong bộ bài lên tay, rồi xáo bộ bài.');
  m('tho_san_bao_dem','Thợ Săn Bão Đêm','Ám','🏹',4,1700,1100,'destroy_spell',1,'activated','Một lần trong lượt của bạn ở MAIN: phá Phép/Bẫy ở ô đầu tiên đang có bài của đối thủ.');
  m('hai_tac_san_may','Hải Tặc Săn Mây','Thủy','⛵',4,1600,1300,'recover_grave',1,'on_summon','Khi triệu hồi: lấy một lá Phép gần nhất trong mộ của bạn lên tay.');
  m('tinh_linh_duong_pho','Tinh Linh Đường Phố','Quang','✨',2,700,900,'heal_n',400,'on_destroy','Khi bị phá hủy trong chiến đấu hoặc bởi hiệu ứng: hồi 400 LP. Hiến tế không kích hoạt.');
  m('ac_mong_deadline','Ác Mộng Deadline','Ám','⌛',5,2050,1400,'discard_n',1,'on_summon','Khi triệu hồi: đối thủ bỏ lá có ATK cao nhất trên tay vào mộ (hòa: lá bên trái).');
  m('samurai_dep_to_ong','Samurai Dép Tổ Ong','Phong','🩴',4,1800,1000,null,0,null,'Kiếm pháp dép tổ ong: gây sát thương xuyên thủ.',{traits:['piercing']});
  m('ky_si_sao_bang','Kỵ Sĩ Sao Băng','Quang','🌠',5,2000,1500,'draw_n',1,'on_attack','Sau khi tấn công không bị phản đòn: rút 1 lá.');
  m('golem_banh_mi','Golem Bánh Mì','Cơ','🥖',4,1300,2100,null,0,null,'Mỗi lượt được bảo vệ khỏi một lần phá hủy trong chiến đấu.',{traits:['battle_resist']});
  m('thien_su_tra_dao','Thiên Sứ Trà Đào','Quang','🍑',4,1400,1500,'heal_n',500,'activated','Một lần trong lượt của bạn ở MAIN: hồi 500 LP.');
  m('phu_thuy_duong_den','Phù Thủy Đường Đen','Ám','🔮',4,1550,1400,'mill_n',2,'on_summon','Khi triệu hồi: gửi 2 lá trên cùng bộ bài đối thủ xuống mộ.');
  m('ca_voi_tang_may','Cá Voi Tầng Mây','Thủy','🐋',7,2600,2400,'bounce_strongest',1,'on_summon','Khi triệu hồi: trả quái có ATK cao nhất của đối thủ về tay.');
  m('hoa_than_bep_than','Hỏa Thần Bếp Than','Hỏa','♨️',7,2750,1900,'burn_n',500,'on_attack','Sau khi tấn công không bị phản đòn: gây thêm 500 sát thương LP.');
  m('kiem_si_lac_duong','Kiếm Sĩ Lạc Đường','Phong','🧭',3,1200,1000,'search_monster',1,'on_summon','Khi triệu hồi: lấy quái 4 sao trở xuống có ATK cao nhất trong bộ bài lên tay, rồi xáo bài.');
  m('robo_shopper','Robo Shopper','Cơ','🛒',4,1500,1500,'draw_n',1,'activated','Một lần trong lượt của bạn ở MAIN: rút 1 lá.');
  m('bat_coc_vu_tru','Bát Cóc Vũ Trụ','Ám','🛸',2,600,1200,'burn_n',400,'on_flip','Khi bị tấn công và lật ngửa: gây 400 sát thương LP cho đối thủ.');
  m('nang_tien_wifi','Nàng Tiên Wi-Fi','Phong','📶',2,800,800,'draw_n',1,'on_flip','Khi bị tấn công và lật ngửa: rút 1 lá.');
  m('phuong_hoang_thuc_khuya','Phượng Hoàng Thức Khuya','Hỏa','🦅',6,2350,1600,'draw_n',1,'on_destroy','Khi bị phá hủy trong chiến đấu hoặc bởi hiệu ứng: rút 1 lá.');
  m('bach_long_may_tre','Bạch Long Mây Tre','Quang','🐲',8,2900,2500,null,0,null,'Đồng Bộ: 2 quái, tổng ít nhất 7 sao. Có sát thương xuyên thủ.',{monster_category:'Đồng Bộ',fusion_requirement:{count:2,minStars:7},traits:['piercing']});
  m('song_kiem_thien_loi','Song Kiếm Thiên Lôi','Phong','⚡',7,2400,1800,null,0,null,'Đồng Bộ: 2 quái, tổng ít nhất 6 sao. Có thể tấn công 2 lần mỗi lượt.',{monster_category:'Đồng Bộ',fusion_requirement:{count:2,minStars:6},traits:['double_attack']});
  m('co_than_sieu_thi','Cơ Thần Siêu Thị','Cơ','🦾',8,2800,2800,'shield_n',1000,'on_summon','Đồng Bộ: 2 quái, tổng ít nhất 7 sao. Khi triệu hồi: tạo khiên 1000 LP.',{monster_category:'Đồng Bộ',fusion_requirement:{count:2,minStars:7}});
  m('am_long_ngu_ngay','Ám Long Ngủ Ngày','Ám','🦇',8,2850,2100,'revive',1,'on_summon','Đồng Bộ: 2 quái, tổng ít nhất 8 sao. Khi triệu hồi: hồi sinh quái 4 sao trở xuống mạnh nhất trong mộ vào ô quái trống, thế thủ.',{monster_category:'Đồng Bộ',fusion_requirement:{count:2,minStars:8}});
  m('nu_than_hoi_sinh','Nữ Thần Hồi Sinh','Quang','🕊️',7,2500,2300,'revive',1,'on_summon','Nghi Lễ với Gọi Hồn Trẩu Tre, hiến tế tổng ít nhất 7 sao. Khi triệu hồi: hồi sinh quái 4 sao trở xuống mạnh nhất của bạn ở thế thủ.',{monster_category:'Nghi Lễ',ritual_requirement:{spellId:'nghi_le_goi_hon_trau_tre',minStars:7}});
  m('hai_than_tra_sua','Hải Thần Trà Sữa','Thủy','🔱',8,2800,2600,'weaken_all',700,'on_summon','Nghi Lễ với Gọi Hồn Trẩu Tre, hiến tế tổng ít nhất 8 sao. Khi triệu hồi: quái đối thủ -700 ATK đến hết lượt này.',{monster_category:'Nghi Lễ',ritual_requirement:{spellId:'nghi_le_goi_hon_trau_tre',minStars:8}});

  // 22 spells.
  s('hoi_sinh_binh_minh','Hồi Sinh Bình Minh','Quang','🌅','Thường','revive',1,'Hồi sinh quái 4 sao trở xuống có ATK cao nhất trong mộ của bạn vào ô quái trống ở thế thủ. Không kích hoạt hiệu ứng khi triệu hồi.');
  s('bao_kiem_vo_hinh','Bão Kiếm Vô Hình','Phong','🌪️','Thường','destroy_strongest',1,'Phá hủy quái có ATK cao nhất của đối thủ. Nếu hòa, chọn ô từ trái sang phải, Extra sau cùng.');
  s('thien_thach_mini','Thiên Thạch Mini','Hỏa','☄️','Thường','burn_n',700,'Gây 700 sát thương LP cho đối thủ.');
  s('tieng_goi_dong_doi','Tiếng Gọi Đồng Đội','Quang','📯','Thường','search_monster',1,'Lấy quái 4 sao trở xuống có ATK cao nhất trong bộ bài lên tay, rồi xáo bài.');
  s('thu_vien_bi_mat','Thư Viện Bí Mật','Ám','📚','Thường','search_spell',1,'Lấy lá Phép đầu tiên còn trong bộ bài lên tay, rồi xáo bài.');
  s('gio_doi_chieu','Gió Đổi Chiều','Phong','🍃','Nhanh','bounce_strongest',1,'Trong MAIN của bạn: trả quái có ATK cao nhất của đối thủ về tay.');
  s('bang_phong_thanh','Băng Phong Thành','Thủy','❄️','Thường','freeze_all',1,'Khóa tấn công toàn bộ quái đối thủ hiện có trên sân trong lượt kế tiếp của họ.');
  s('ao_giap_anh_sang','Áo Giáp Ánh Sáng','Quang','🛡️','Trang Bị','equip_def_n',700,'Quái được chọn +700 DEF khi còn trên sân.');
  s('thuong_xuyen_giap','Thương Xuyên Giáp','Phong','🗡️','Trang Bị','equip_pierce',0,'Quái được chọn gây sát thương xuyên thủ khi ATK cao hơn DEF của mục tiêu.');
  s('song_kiem_lien_hoan','Song Kiếm Liên Hoàn','Hỏa','⚔️','Trang Bị','equip_double',0,'Quái được chọn có thể tấn công tối đa 2 lần mỗi lượt. Không cộng dồn số lần.');
  s('vong_hut_sinh_luc','Vòng Hút Sinh Lực','Ám','🩸','Trang Bị','equip_lifesteal',0,'Quái được chọn hồi LP cho bạn bằng sát thương chiến đấu thực tế nó gây cho đối thủ.');
  s('vu_dieu_sao','Vũ Điệu Sao','Quang','💫','Thường','boost_all',500,'Toàn bộ quái của bạn +500 ATK đến hết lượt này.');
  s('man_suong_yeu_suc','Màn Sương Yếu Sức','Thủy','🌁','Thường','weaken_all',500,'Toàn bộ quái đối thủ -500 ATK đến hết lượt này.');
  s('doi_cong_thu','Đổi Công Thủ','Cơ','🔄','Thường','swap_stats',1,'Đảo ATK gốc và DEF gốc của quái mạnh nhất bên bạn. Hiệu lực khi quái còn trên sân.');
  s('trieu_tap_linh_gac','Triệu Tập Lính Gác','Cơ','📣','Thường','summon_tokens',2,'Gọi tối đa 2 Lính Gác Giấy (500 ATK / 700 DEF) vào ô quái trống ở thế thủ. Token không vào mộ hoặc lên tay.');
  s('la_chan_tinh_the','Lá Chắn Tinh Thể','Thủy','💎','Thường','shield_n',1000,'Tạo khiên hấp thụ tổng cộng 1000 sát thương LP cho bạn; còn hiệu lực cho đến khi dùng hết.');
  s('xoa_dau_vet','Xóa Dấu Vết','Ám','🌀','Thường','destroy_spell',1,'Phá Phép/Bẫy đầu tiên đang nằm trên sân đối thủ (trái sang phải, Môi Trường sau cùng).');
  s('ky_uc_chien_truong','Ký Ức Chiến Trường','Quang','📜','Thường','recover_grave',1,'Lấy lá Phép gần nhất trong mộ của bạn lên tay, trừ chính lá này.');
  s('vuon_sen_binh_yen','Vườn Sen Bình Yên','Phong','🌸','Liên Tục','continuous_heal',300,'Đầu mỗi lượt của bạn, hồi 300 LP khi lá này đang ngửa trên sân.');
  s('lo_ren_ruc_lua','Lò Rèn Rực Lửa','Hỏa','⚒️','Môi Trường','field_boost_all',300,'Toàn bộ quái của bạn +300 ATK khi môi trường này còn trên sân.');
  s('dong_ho_tan_ca','Đồng Hồ Tan Ca','Cơ','⏰','Liên Tục','continuous_draw',1,'Đầu mỗi lượt của bạn: rút thêm 1 lá. Hết bài vẫn bị xử thua theo luật rút bài.');
  s('bong_dem_mat_ngu','Bóng Đêm Mất Ngủ','Ám','🌑','Liên Tục','continuous_burn',250,'Đầu mỗi lượt của bạn: gây 250 sát thương LP cho đối thủ.');

  // 13 traps: automatic counters plus activated normal and continuous cards.
  t('guong_phan_chieu','Gương Phản Chiếu','Quang','🪞','Phản Đòn','reflect_attack',700,'Tự lật khi bị tấn công: vô hiệu đòn đánh và gây 700 sát thương LP cho bên tấn công.');
  t('bay_bang_tinh','Bẫy Băng Tĩnh','Thủy','🧊','Phản Đòn','weaken_attacker',800,'Tự lật khi bị tấn công: quái tấn công -800 ATK đến hết lượt, sau đó trận đánh tiếp tục.');
  t('phong_an_ma_phap','Phong Ấn Ma Pháp','Ám','🔒','Phản Đòn','negate_spell',0,'Tự lật khi đối thủ dùng Phép: vô hiệu lá Phép đó và gửi cả hai lá xuống mộ.');
  t('mai_phuc_san_truong','Mai Phục Sân Trường','Cơ','🚧','Phản Đòn','negate_attack',0,'Tự lật khi bị tấn công: vô hiệu đòn đánh.');
  t('loi_nguyen_deadline','Lời Nguyền Deadline','Ám','📅','Thường','discard_n',1,'Kích hoạt trong MAIN từ lượt sau khi úp: đối thủ bỏ lá có ATK cao nhất trên tay vào mộ.');
  t('cuu_vien_luc_nua_dem','Cứu Viện Lúc Nửa Đêm','Quang','🚑','Thường','revive',1,'Từ lượt sau khi úp, kích hoạt trong MAIN: hồi sinh quái 4 sao trở xuống mạnh nhất trong mộ ở thế thủ.');
  t('mua_thien_thach','Mưa Thiên Thạch','Hỏa','🌋','Thường','burn_n',800,'Từ lượt sau khi úp, kích hoạt trong MAIN: gây 800 sát thương LP.');
  t('ket_gioi_bao_ho','Kết Giới Bảo Hộ','Phong','🔰','Thường','shield_n',1200,'Từ lượt sau khi úp, kích hoạt trong MAIN: tạo khiên hấp thụ tổng cộng 1200 sát thương LP.');
  t('cuon_bang_ky_uc','Cuộn Băng Ký Ức','Cơ','📼','Thường','draw_n',2,'Từ lượt sau khi úp, kích hoạt trong MAIN: rút 2 lá.');
  t('lo_xo_tra_hang','Lò Xo Trả Hàng','Phong','📦','Thường','bounce_strongest',1,'Từ lượt sau khi úp, kích hoạt trong MAIN: trả quái mạnh nhất của đối thủ về tay.');
  t('tieng_chuong_hoi_phuc','Tiếng Chuông Hồi Phục','Quang','🔔','Liên Tục','continuous_heal',400,'Lật trong MAIN từ lượt sau khi úp. Đầu mỗi lượt của bạn sau đó: hồi 400 LP.');
  t('mieng_vuc_tinh_lang','Miệng Vực Tĩnh Lặng','Ám','🕳️','Thường','mill_n',3,'Từ lượt sau khi úp, kích hoạt trong MAIN: gửi 3 lá đầu bộ bài đối thủ xuống mộ.');
  t('phan_don_cuoi_cung','Phản Đòn Cuối Cùng','Hỏa','💥','Phản Đòn','destroy_attacker',0,'Tự lật khi bị tấn công: phá hủy quái tấn công và vô hiệu đòn đánh.');

  const tuners=new Set(['ech_xanh_triet_ly','co_mat_job','phap_su_bang_tra','long_nhi_hoa_toc','ho_ly_thu_vien','nang_tien_wifi','kiem_si_lac_duong']);
  const revisions={
    bao_kiem_vo_hinh:{effect_code:'destroy_monster_target',description:'Chọn 1 quái đối thủ trên sân (kể cả đang úp hoặc ở ô Extra) và phá hủy nó.'},
    xoa_dau_vet:{effect_code:'destroy_spell_target',description:'Chọn 1 Phép/Bẫy đối thủ trên sân, kể cả Môi Trường hoặc bài úp, và phá hủy nó.'},
    mieng_vuc_tinh_lang:{effect_code:'destroy_monster_target',effect_value:1,description:'Từ lượt sau khi úp, kích hoạt trong MAIN: chọn 1 quái đối thủ trên sân và phá hủy nó.'},
    mai_phuc_san_truong:{effect_code:'destroy_attack_position',description:'Từ lượt sau khi úp: tự lật khi đối thủ tấn công, phá toàn bộ quái thế công đang ngửa của họ và vô hiệu đòn đánh.'}
  };
  cards.forEach((c,i) => {
    Object.assign(c,revisions[c.id]||{});
    c.is_tuner=tuners.has(c.id);
    c.deck_zone=['Đồng Bộ','Dung Hợp','Xyz','Liên Kết'].includes(c.monster_category)?'Extra':'Main';
    if(c.is_tuner)c.description='Tuner (Điều chỉnh). '+c.description;
    if(c.monster_category==='Đồng Bộ'){
      c.synchro_requirement={tuners:1,minNonTuners:1,level:c.stars};delete c.fusion_requirement;
      c.description=`Đồng Bộ từ Extra Deck: 1 Tuner + ít nhất 1 quái không phải Tuner đang ngửa, tổng đúng ${c.stars} sao. `+c.description.replace(/^Đồng Bộ:.*?\.\s*|^Hợp thể.*?\.\s*/,'');
    }
    c.element ||= ['Phong','Thủy','Quang','Hỏa','Ám','Cơ'][i%6];
    c.rarity ||= (c.stars>=7 || c.id==='trung_tang_bat_ngo') ? 'UR' : c.stars>=5 || c.monster_category==='Đồng Bộ' ? 'SR' : c.effect_code ? 'R' : 'N';
    c.set_number = String(i+1).padStart(3,'0');
    c.custom_image ||= `assets/memecard/art/${c.id}.svg`;
  });
  window.MEME_DECK_PRESETS = {
    'Hỏa • Tiến công': ['long_nhi_hoa_toc','long_nhi_hoa_toc','meo_kiem_khach','samurai_dep_to_ong','samurai_dep_to_ong','kiem_si_binh_minh','ninja_luon_dem','hiep_si_tra_sua','kiem_si_lac_duong','chien_binh_giap_giay','rong_com_chay','hoa_than_bep_than','bach_long_may_tre','song_kiem_thien_loi','thien_thach_mini','vu_dieu_sao','thuong_xuyen_giap','song_kiem_lien_hoan','lo_ren_ruc_lua','hot_via','mai_phuc_san_truong','phan_don_cuoi_cung','guong_phan_chieu','mua_thien_thach'],
    'Thủy • Kiểm soát': ['phap_su_bang_tra','phap_su_bang_tra','ho_ve_sen_hong','ho_ve_sen_hong','hai_tac_san_may','nang_tien_wifi','nang_tien_wifi','ho_ly_thu_vien','kiem_si_lac_duong','golem_banh_mi','ca_voi_tang_may','thuy_quai_lay_loi','co_than_sieu_thi','bang_phong_thanh','gio_doi_chieu','man_suong_yeu_suc','la_chan_tinh_the','thu_vien_bi_mat','xoa_dau_vet','dong_ho_tan_ca','bay_bang_tinh','phong_an_ma_phap','lo_xo_tra_hang','cuon_bang_ky_uc'],
    'Ám • Hồi sinh': ['nu_vuong_mat_trang','thien_su_tra_dao','tinh_linh_duong_pho','tinh_linh_duong_pho','phu_thuy_duong_den','phu_thuy_duong_den','bat_coc_vu_tru','ho_ly_thu_vien','robo_shopper','ninja_luon_dem','ac_mong_deadline','am_long_ngu_ngay','nu_than_hoi_sinh','hoi_sinh_binh_minh','tieng_goi_dong_doi','vong_hut_sinh_luc','trieu_tap_linh_gac','ky_uc_chien_truong','nghi_le_goi_hon_trau_tre','bong_dem_mat_ngu','loi_nguyen_deadline','cuu_vien_luc_nua_dem','tieng_chuong_hoi_phuc','ket_gioi_bao_ho']
  };
  // Keep each preset at 24 Main Deck cards after separating Synchro monsters.
  for(const [name,deck] of Object.entries(window.MEME_DECK_PRESETS)){
    const main=deck.filter(id=>cards.find(c=>c.id===id)?.deck_zone!=='Extra');
    for(const id of ['phap_su_bang_tra','long_nhi_hoa_toc','kiem_si_binh_minh'])while(main.length<24&&main.filter(x=>x===id).length<3)main.push(id);
    window.MEME_DECK_PRESETS[name]=main;
  }
})();
