// Curated DM/GX/5D's anime roster. Descriptions are original Vietnamese gameplay summaries.
const fs=require('node:fs'),vm=require('node:vm');const cards=[],decks={},extras={},ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('assets/js/yugioh_cards_data.js','utf8'),ctx);
const source=new Map(ctx.window.YUGIOH_CARDS.map(c=>[c.name_en,c]));
const palette={Yugi:['Ám','#bca0ed','Pháp Sư'],Kaiba:['Quang','#b7e3ff','Rồng'],Joey:['Hỏa','#edb18b','Chiến Binh'],Pegasus:['Ám','#edace0','Hoạt Hình'],Jaden:['Phong','#9bdfb7','HERO'],Zane:['Cơ','#a9dcdf','Máy'],Mai:['Phong','#cfa7f5','Chim'],Yusei:['Phong','#2ec4b6','Chiến Binh']};
const id=n=>'AN-'+n.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/_$/,'');
function add(en,vi,group,type,fields={}){const [element,color,tribe]=palette[group]||['Quang','#ffe0a0','Hỗ Trợ'];const c={id:id(en),name:en,name_vi:vi,name_en:en,archetype:group,element,tribe,card_type:type,rarity:'R',max_copies:3,deck_zone:'Main',effect_code:'',effect_value:0,effect_trigger:'passive',traits:[],description:'Quái thường. Không có hiệu ứng.',catalogue_version:'anime-v1',art:{emoji:type==='Monster'?'✦':type==='Spell'?'✧':'◇',c1:color,c2:'#253248'},...fields};c.custom_image=fs.existsSync(`assets/memecard/pictures/${c.id}.webp`)?`assets/memecard/pictures/${c.id}.webp`:`assets/memecard/art/${c.id}.svg`;c.activation_rules=c.activation_rules||(type==='Monster'?'Triệu hồi thường: 1 lần/lượt. 5–6 sao hiến tế 1; từ 7 sao hiến tế 2.':type==='Trap'?'Úp từ lượt trước; tự phản ứng khi đúng điều kiện.':'Dùng trong MAIN. Chọn mục tiêu trước khi trả chi phí.');c.engine_notes=c.engine_notes||'Bản phỏng theo anime DM/GX/5Ds cho sân H5: 3 ô quái, 4000 LP. Không dùng mô tả TCG hiện hành.';if(source.has(en))c.source_url=source.get(en).source_url;cards.push(c);return c;}
function mon(g,en,vi,stars,atk,def,code='',text='',traits=[],extra={}){return add(en,vi,g,'Monster',{stars,atk,def,monster_category:code||traits.length?'Hiệu ứng':'Thường',effect_code:code,effect_trigger:code?'activated':'passive',description:text||'Quái thường. Không có hiệu ứng.',traits,...extra});}
function fusion(g,en,vi,stars,atk,def,mats,traits=[],text='',extra={}){return mon(g,en,vi,stars,atk,def,'',text,traits,{monster_category:'Dung Hợp',deck_zone:'Extra',fusion_materials:mats.map(id),description:mats.join(' + ')+'. '+(text||'Không có hiệu ứng phụ.'),activation_rules:'Dung Hợp từ Extra bằng đúng nguyên liệu trên tay/sân và Phép Dung Hợp.',...extra});}
function synchro(g,en,vi,stars,atk,def,reqText,traits=[],text='',extra={}){return mon(g,en,vi,stars,atk,def,'',text,traits,{monster_category:'Đồng Bộ',deck_zone:'Extra',description:reqText+'. '+(text||'Không có hiệu ứng phụ.'),activation_rules:'Triệu hồi Đồng Bộ từ Extra bằng đúng 1 Tuner + 1+ quái không Tuner trên sân có tổng số sao bằng lá này.',...extra});}
const normal=[
 ['Yugi','Dark Magician','Phù Thủy Áo Đen',7,2500,2100],['Yugi','Summoned Skull','Quỷ Triệu Hồi',6,2500,1200],['Yugi','Celtic Guardian','Kiếm Sĩ Elf',4,1400,1200],['Yugi','Giant Soldier of Stone','Người Đá Khổng Lồ',3,1300,2000],['Yugi','Gaia The Fierce Knight','Kỵ Sĩ Gaia',7,2300,2100],['Yugi','Curse of Dragon','Rồng Nguyền Rủa',5,2000,1500],['Yugi','Gazelle the King of Mythical Beasts','Vua Thú Gazelle',4,1500,1200],['Yugi','Silver Fang','Sói Bạc',3,1200,800],['Yugi','Mystical Elf','Yêu Tinh Thánh',4,800,2000],['Yugi','Alpha The Magnet Warrior','Chiến Binh Nam Châm Alpha',4,1400,1700],['Yugi','Beta The Magnet Warrior','Chiến Binh Nam Châm Beta',4,1700,1600],['Yugi','Gamma The Magnet Warrior','Chiến Binh Nam Châm Gamma',4,1500,1800],
 ['Kaiba','Blue-Eyes White Dragon','Rồng Trắng Mắt Xanh',8,3000,2500],['Kaiba','La Jinn the Mystical Genie of the Lamp','Thần Đèn La Jinn',4,1800,1000],['Kaiba','Battle Ox','Ngưu Ma Chiến Sĩ',4,1700,1000],['Kaiba','Hitotsu-Me Giant','Người Khổng Lồ Một Mắt',4,1200,1000],['Kaiba','Vorse Raider','Chiến Binh Vorse',4,1900,1200],['Kaiba','Ryu-Kishin Powered','Quỷ Ryu-Kishin',4,1600,1200],['Kaiba','X-Head Cannon','Pháo X',4,1800,1500],['Kaiba','Y-Dragon Head','Đầu Rồng Y',4,1500,1600],['Kaiba','Z-Metal Tank','Xe Tăng Z',4,1500,1300],['Kaiba','Saggi the Dark Clown','Hề Bóng Tối Saggi',3,600,1500],
 ['Joey','Red-Eyes Black Dragon','Rồng Đen Mắt Đỏ',7,2400,2000],['Joey','Baby Dragon','Rồng Con',3,1200,700],['Joey','Axe Raider','Chiến Binh Rìu',4,1700,1150],['Joey','Alligator Sword','Cá Sấu Kiếm Sĩ',4,1500,1200],['Joey','Masaki the Legendary Swordsman','Kiếm Sĩ Masaki',4,1100,1100],['Joey','Flame Manipulator','Pháp Sư Điều Khiển Lửa',3,900,1000],['Joey','Swordsman of Landstar','Kiếm Sĩ Landstar',3,500,1200],['Joey','Tiger Axe','Hổ Cầm Rìu',4,1300,1100],
 ['Pegasus','Thousand-Eyes Idol','Tượng Ngàn Mắt',1,0,0],['Pegasus','Illusionist Faceless Mage','Pháp Sư Vô Diện',5,1200,2200],['Pegasus','Crass Clown','Hề Bạo Lực',4,1350,1400],['Pegasus','Dream Clown','Hề Giấc Mơ',3,1200,900],['Pegasus','Dark Rabbit','Thỏ Hắc Ám',4,1100,1500],['Pegasus','Parrot Dragon','Rồng Vẹt',5,2000,1300],
 ['Jaden','Elemental HERO Avian','HERO Avian',3,1000,1000],['Jaden','Elemental HERO Burstinatrix','HERO Burstinatrix',3,1200,800],['Jaden','Elemental HERO Clayman','HERO Clayman',4,800,2000],['Jaden','Elemental HERO Sparkman','HERO Sparkman',4,1600,1400],['Jaden','Elemental HERO Neos','HERO Neos',7,2500,2000],['Zane','Cyber Tech Alligator','Cá Sấu Công Nghệ',5,2500,1600]
];normal.forEach(r=>mon(...r));
mon('Yugi','Dark Magician Girl','Nữ Phù Thủy Áo Đen',6,2000,1700,'','Tăng 300 ATK cho mỗi Dark Magician hoặc Magician of Black Chaos trong cả hai Mộ.',['dark_girl']);
mon('Yugi','Kuriboh','Kuriboh',1,300,200,'','Khi bạn sắp nhận sát thương chiến đấu: bỏ lá này từ tay để chặn sát thương đó.',['kuriboh']);
mon('Yugi','Buster Blader','Chiến Sĩ Diệt Rồng',7,2600,2300,'','Tăng 500 ATK cho mỗi Rồng trên sân và trong Mộ đối thủ.',['buster']);
mon('Yugi','Berfomet','Thú Hai Đầu Berfomet',5,1400,1800,'search_gazelle','Khi triệu hồi ngửa: lấy Gazelle từ Deck lên tay.',[],{effect_trigger:'on_summon'});
mon('Yugi','Valkyrion the Magna Warrior','Chiến Binh Nam Châm Valkyrion',8,3500,3850,'','Gửi Alpha, Beta và Gamma từ tay/sân xuống Mộ để gọi đặc biệt.',['valkyrion'],{special_only:true});
mon('Yugi','Black Luster Soldier','Chiến Sĩ Hỗn Mang',8,3000,2500,'','Nghi Lễ bằng Black Luster Ritual; tổng sao nguyên liệu từ 8.',[],{monster_category:'Nghi Lễ',ritual_spell:id('Black Luster Ritual'),ritual_level:8,special_only:true});
mon('Yugi','Magician of Black Chaos','Pháp Sư Hỗn Mang Đen',8,2800,2600,'','Nghi Lễ bằng Black Magic Ritual; tổng sao nguyên liệu từ 8.',[],{monster_category:'Nghi Lễ',ritual_spell:id('Black Magic Ritual'),ritual_level:8,special_only:true});
for(const [en,vi]of[['Exodia the Forbidden One','Đầu Exodia'],['Left Arm of the Forbidden One','Tay Trái Exodia'],['Right Arm of the Forbidden One','Tay Phải Exodia'],['Left Leg of the Forbidden One','Chân Trái Exodia'],['Right Leg of the Forbidden One','Chân Phải Exodia']])mon('Yugi',en,vi,1,en.startsWith('Exodia')?1000:200,en.startsWith('Exodia')?1000:300,'','Có đủ 5 phần Exodia trên tay: chiến thắng ngay.',['exodia'],{max_copies:1,rarity:'UR'});
mon('Yugi','Slifer the Sky Dragon','Thần Bầu Trời Osiris',10,0,0,'','Hiến tế 3 quái. ATK/DEF = số lá trên tay ×1000. Quái đối thủ vừa triệu hồi ngửa thế công mất 2000 ATK; về 0 thì bị phá hủy.',['god','slifer'],{tribute_count:3,rarity:'UR',max_copies:1});
mon('Kaiba','Obelisk the Tormentor','Thần Phá Hoại Obelisk',10,4000,4000,'obelisk','Hiến tế 3 quái để gọi. Một lần/lượt: hiến tế 2 quái khác, phá hủy quái đối thủ và gây 4000 sát thương.',['god'],{tribute_count:3,rarity:'UR',max_copies:1});
mon('Kaiba','The Winged Dragon of Ra','Dực Thần Long Ra',10,0,0,'ra','Hiến tế 3 quái: lấy tổng ATK/DEF của nguyên liệu. Một lần/lượt: giữ lại 1 LP, đổi LP còn lại thành ATK đến hết lượt.',['god','ra'],{tribute_count:3,rarity:'UR',max_copies:1});
mon('Kaiba','Lord of D.','Chúa Tể Loài Rồng',4,1200,1100,'','Rồng của bạn không thể bị chỉ định bởi Phép/Bẫy đối thủ.',['lord_d']);
mon('Kaiba','Thunder Dragon','Rồng Sấm',5,1600,1500,'thunder_search','Bỏ lá này từ tay: lấy tối đa 2 Thunder Dragon từ Deck lên tay.',[],{hand_action:true});
mon('Kaiba','Blue-Eyes Shining Dragon','Rồng Trắng Ánh Sáng',10,3000,2500,'','Hiến tế Blue-Eyes Ultimate Dragon để gọi đặc biệt. Tăng 300 ATK cho mỗi Rồng trong Mộ.',['shining_dragon'],{special_only:true});
mon('Joey','Time Wizard','Phù Thủy Thời Gian',2,500,400,'time_wizard','Một lần/lượt: tung đồng xu. Ngửa: phá quái đối thủ; nếu có Baby Dragon, hóa thành Thousand Dragon. Sấp: phá quái của bạn.');
mon('Joey','Jinzo','Jinzo',6,2400,1500,'','Khi ngửa trên sân, vô hiệu toàn bộ Bẫy của cả hai bên.',['jinzo']);
mon('Joey','Rocket Warrior','Chiến Binh Tên Lửa',4,1500,1300,'','Khi tấn công: không bị phá hủy, không nhận sát thương và giảm 500 ATK của quái bị đánh.',['rocket']);
mon('Joey','Gearfried the Iron Knight','Kỵ Sĩ Sắt Gearfried',4,1800,1600,'','Trang bị gắn vào lá này bị phá hủy ngay.',['gearfried']);
mon('Joey','Gilford the Lightning','Hiệp Sĩ Sấm Gilford',8,2800,1400,'gilford','Hiến tế 3 quái để triệu hồi: phá hủy toàn bộ quái đối thủ.',[],{tribute_count:3,effect_trigger:'on_summon'});
mon('Pegasus','Relinquished','Quỷ Hy Sinh',1,0,0,'absorb','Nghi Lễ bằng Black Illusion Ritual. Một lần/lượt: hấp thụ 1 quái đối thủ; ATK/DEF bằng quái bị hấp thụ.',['relinquished'],{monster_category:'Nghi Lễ',ritual_spell:id('Black Illusion Ritual'),ritual_level:1,special_only:true});
for(const [en,vi,l,a,d]of[['Blue-Eyes Toon Dragon','Rồng Trắng Hoạt Hình',8,3000,2500],['Toon Summoned Skull','Quỷ Triệu Hồi Hoạt Hình',6,2500,1200],['Toon Mermaid','Tiên Cá Hoạt Hình',4,1400,1500],['Manga Ryu-Ran','Rồng Manga',7,2200,2600],['Toon Dark Magician Girl','Nữ Phù Thủy Hoạt Hình',6,2000,1700]])mon('Pegasus',en,vi,l,a,d,'','Cần Toon World để gọi. Có thể đánh trực tiếp nếu đối thủ không có Toon; né đòn đầu tiên mỗi lượt khi Toon World còn tồn tại.',['toon'],{engine_notes:'Anime/H5: né đòn tối đa 1 lần/lượt; không né vô hạn. Toon World rời sân thì Toon bị phá hủy.'});
mon('Jaden','Elemental HERO Bubbleman','HERO Bubbleman',4,800,1200,'','Nếu đây là lá cuối trên tay: gọi đặc biệt, rồi rút 2 lá.',['bubbleman']);
mon('Jaden','Elemental HERO Wildheart','HERO Wildheart',4,1500,1600,'','Không bị ảnh hưởng bởi Bẫy.',['trap_immune']);
mon('Jaden','Elemental HERO Bladeedge','HERO Bladeedge',7,2600,1800,'','Gây sát thương xuyên thủ.',['piercing']);
mon('Jaden','Elemental HERO Necroshade','HERO Necroshade',5,1600,1800,'','Trong Mộ: cho phép gọi 1 HERO cấp cao từ tay mà không cần hiến tế, 1 lần/trận.',['necroshade']);
mon('Jaden','Winged Kuriboh','Kuriboh Có Cánh',1,300,200,'','Bị phá hủy: bạn không nhận thêm sát thương chiến đấu trong lượt này.',['winged_kuriboh']);
mon('Jaden','Neo-Spacian Air Hummingbird','Neo-Spacian Chim Ruồi',3,800,600,'hummingbird','Một lần/lượt: hồi 500 LP cho mỗi lá trên tay đối thủ.');
mon('Jaden','Neo-Spacian Aqua Dolphin','Neo-Spacian Cá Heo',3,600,800,'dolphin','Một lần/lượt: bỏ 1 lá; xem tay đối thủ, chọn 1 quái có ATK không vượt quái mạnh nhất của bạn để phá và gây 500 sát thương.');
mon('Jaden','Neo-Spacian Flare Scarab','Neo-Spacian Bọ Lửa',3,500,500,'','Tăng 400 ATK cho mỗi Phép/Bẫy trên sân đối thủ.',['scarab']);
mon('Zane','Cyber Dragon','Rồng Máy Cyber Dragon',5,2100,1600,'','Nếu sân mình trống và đối thủ có quái: gọi đặc biệt từ tay.',['cyber_special']);
mon('Zane','Proto-Cyber Dragon','Rồng Máy Nguyên Mẫu',3,1100,600,'','Khi ở trên sân, tên được coi là Cyber Dragon.',['proto_cyber']);
mon('Zane','Cyber Phoenix','Phượng Hoàng Máy',4,1200,1600,'draw_n','Bị phá hủy trong chiến đấu: rút 1 lá.',[],{effect_trigger:'on_destroy',effect_value:1});
mon('Zane','Cyber Valley','Thung Lũng Máy',1,0,0,'','Khi bị tấn công: trục xuất lá này, hủy đòn đánh và rút 1 lá.',['cyber_valley']);
mon('Zane','Exploder Dragon','Rồng Phát Nổ',3,1000,0,'','Bị phá hủy trong chiến đấu: phá hủy quái đã đánh nó.',['exploder']);
for(const [en,vi,a,d,trait]of[['Cyberdark Horn','Cyberdark Sừng',800,800,'piercing'],['Cyberdark Edge','Cyberdark Cánh',800,800,'direct_half'],['Cyberdark Keel','Cyberdark Xương',800,800,'battle_burn_300']])mon('Zane',en,vi,4,a,d,'cyberdark_equip','Khi triệu hồi: trang bị 1 Rồng cấp 3 trở xuống trong Mộ và nhận ATK của Rồng đó.',[trait],{effect_trigger:'on_summon'});
mon('Mai','Harpie Lady','Yêu Điểu',4,1300,1400);
mon('Mai','Harpie Lady Sisters','Yêu Điểu Tam Tỷ',6,1950,2100,'','Khi ở trên sân, tên được coi là Harpie Lady. Chỉ được Triệu hồi Đặc biệt bằng Elegant Egotist.',['harpie_name'],{special_only:true,noRevive:true});
mon('Mai',"Harpie's Pet Dragon",'Rồng Cưng Yêu Điểu',7,2000,2500,'','Tăng 300 ATK/DEF cho mỗi Harpie Lady ngửa trên sân.',['pet_dragon']);
mon('Mai','Amazoness Fighter','Chiến Binh Amazoness',4,1500,1300,'','Bạn không nhận sát thương chiến đấu liên quan đến lá này.',['amazon_fighter'],{element:'Địa'});
mon('Mai','Amazoness Swordswoman','Nữ Kiếm Sĩ Amazoness',4,1500,1600,'','Đối thủ nhận mọi sát thương chiến đấu mà bạn đáng lẽ phải nhận khi lá này giao chiến.',['amazon_swords'],{element:'Địa'});
mon('Mai','Amazoness Tiger','Hổ Amazoness',4,1100,1500,'','Tăng 400 ATK cho mỗi Amazoness khác mà bạn điều khiển. Đối thủ chỉ được tấn công lá này.',['amazon_tiger'],{element:'Địa',engine_notes:'Anime/H5: không giới hạn 1 Hổ Amazoness mỗi sân như TCG.'});
mon('Mai','Amazoness Chain Master','Nữ Chúa Xiềng Amazoness',4,1500,1300,'amazon_chain','Bị phá hủy trong chiến đấu: trả 1500 LP để lấy 1 quái từ tay đối thủ.',[],{element:'Địa',effect_trigger:'on_destroy'});
mon('Mai','Cyber Harpie Lady','Yêu Điểu Cyber',4,1800,1300,'','Khi ở trên sân, tên được coi là Harpie Lady.',['harpie_name']);
mon('Mai','Harpie Queen','Nữ Hoàng Yêu Điểu',4,1900,1500,'','Khi ở trên sân, tên được coi là Harpie Lady.',['harpie_name']);
mon('Mai',"Harpie's Pet Baby Dragon",'Rồng Cưng Con Yêu Điểu',4,1200,600,'','Tăng 300 ATK/DEF cho mỗi Harpie Lady ngửa trên sân.',['pet_dragon']);
mon('Mai','Amazoness Queen','Nữ Hoàng Amazoness',6,2400,1800,'','Amazoness của bạn không thể bị phá hủy trong chiến đấu.',['amazon_battleproof'],{element:'Địa'});
mon('Mai','Amazoness Paladin','Hiệp Sĩ Amazoness',4,1700,300,'','Tăng 100 ATK cho mỗi Amazoness bạn điều khiển.',['amazon_paladin'],{element:'Địa'});
mon('Mai','Amazoness Sage','Hiền Nhân Amazoness',4,1400,700,'','Khi tấn công: phá hủy 1 Phép/Bẫy đối thủ.',['amazon_sage'],{element:'Địa'});

// Yusei Fudo Monsters
mon('Yusei','Junk Synchron','Đồng Bộ Phế Liệu',3,1300,320,'junk_synchron_summon','Khi triệu hồi thường: có thể hồi sinh 1 quái thú Cấp 2 trở xuống từ Mộ ở thế thủ (vô hiệu hiệu ứng của nó).',['junk_synchron'],{is_tuner:true,rarity:'SR',effect_trigger:'on_summon'});
mon('Yusei','Speed Warrior','Chiến Binh Tốc Độ',2,900,400,'','Trong Battle Phase của lượt triệu hồi thường: ATK gốc tăng gấp đôi (thành 1800).',['speed_boost'],{rarity:'R'});
mon('Yusei','Quillbolt Hedgehog','Nhím Lông Nhọn',2,800,800,'quillbolt_revive','Nếu bạn điều khiển Tuner ngửa trên sân: có thể gọi đặc biệt lá này từ Mộ ở thế thủ; trục xuất khi rời sân.',['quillbolt'],{rarity:'R'});
mon('Yusei','Sonic Chick','Gà Siêu Âm',1,300,300,'','Không bị phá hủy trong chiến đấu bởi quái thú có từ 1900 ATK trở lên.',['sonic_chick'],{rarity:'N'});
mon('Yusei','Shield Wing','Cánh Khiên',2,0,900,'','Không bị phá hủy trong chiến đấu tối đa 2 lần mỗi lượt.',['shield_wing'],{rarity:'R'});
mon('Yusei','Junk Forward','Tiên Phong Phế Liệu',3,900,1500,'junk_forward_special','Nếu bạn không điều khiển quái thú nào: có thể gọi đặc biệt lá này từ tay ở thế công.',['junk_forward'],{hand_action:true,rarity:'R'});
mon('Yusei','Doppelwarrior','Chiến Binh Song Sinh',2,800,800,'doppelwarrior','Khi quái thú được hồi sinh từ Mộ: có thể gọi đặc biệt lá này từ tay. Khi gửi xuống Mộ làm nguyên liệu Đồng Bộ: tạo tối đa 2 Doppel Token (1 sao, 400/400).',['doppelwarrior'],{rarity:'SR'});
mon('Yusei','Effect Veiler','Cô Gái Ảo Ảnh',1,0,0,'effect_veiler','Bỏ lá này từ tay: vô hiệu hiệu ứng của 1 quái ngửa của đối thủ đến hết lượt.',['effect_veiler'],{is_tuner:true,hand_action:true,rarity:'UR',max_copies:2});
mon('Yusei','Turbo Synchron','Đồng Bộ Tăng Tốc',1,100,500,'turbo_synchron','Khi tấn công: có thể đổi quái bị tấn công sang thế thủ. Nhận sát thương liên quan lá này: gọi đặc biệt 1 quái từ tay có ATK không vượt sát thương.',['turbo_synchron'],{is_tuner:true,rarity:'R'});
mon('Yusei','Nitro Synchron','Đồng Bộ Nitro',2,300,100,'','Tuner Đồng Bộ cho Nitro Warrior. Nếu dùng làm nguyên liệu Đồng Bộ: rút 1 lá sau khi kích hoạt Phép trong lượt đó.',['nitro_synchron'],{is_tuner:true,rarity:'R'});

// Synchro Extra Monsters
synchro('Yusei','Stardust Dragon','Rồng Tinh Tú',8,2500,2000,'1 Tuner + 1+ quái không Tuner',['stardust_dragon'],'Khi đối thủ kích hoạt hiệu ứng phá hủy bài trên sân: hiến tế lá này để vô hiệu và phá hủy lá đó. Cuối lượt: hồi sinh lá này từ Mộ nếu đã hiến tế theo hiệu ứng này.',{synchro_requirement:{tuners:1,minNonTuners:1,level:8},effect_code:'stardust_dragon',effect_trigger:'reaction',max_copies:1,rarity:'UR'});
synchro('Yusei','Junk Warrior','Chiến Binh Phế Liệu',5,2300,1300,'Junk Synchron + 1+ quái không Tuner',['junk_warrior'],'Khi Đồng Bộ thành công: tăng ATK bằng tổng ATK của tất cả quái thú Cấp 2 trở xuống đang ngửa trên sân bạn.',{synchro_requirement:{tuners:1,minNonTuners:1,level:5,tunerName:'Junk Synchron'},effect_code:'junk_warrior_boost',effect_trigger:'on_summon',max_copies:2,rarity:'UR'});
synchro('Yusei','Formula Synchron','Đồng Bộ Công Thức',2,200,1500,'1 Tuner + 1 quái không Tuner',['formula_synchron'],'Khi Đồng Bộ thành công: rút 1 lá.',{is_tuner:true,monster_category:'Đồng Bộ / Tuner',synchro_requirement:{tuners:1,minNonTuners:1,level:2},effect_code:'draw_n',effect_value:1,effect_trigger:'on_summon',rarity:'SR'});
synchro('Yusei','Armory Arm','Cánh Tay Vũ Khí',4,1800,1200,'1 Tuner + 1+ quái không Tuner',['armory_arm'],'Có thể trang bị cho 1 quái thú: tăng 1000 ATK. Quái được trang bị hạ quái đối thủ: gây sát thương bằng ATK gốc của quái bị hạ.',{synchro_requirement:{tuners:1,minNonTuners:1,level:4},effect_code:'armory_arm',effect_trigger:'activated',rarity:'SR'});
synchro('Yusei','Nitro Warrior','Chiến Binh Nitro',7,2800,1800,'Nitro Synchron + 1+ quái không Tuner',['nitro_warrior'],'Mỗi lượt, khi bạn dùng Phép: tăng 1000 ATK trong đòn đánh kế tiếp. Khi hạ quái đối thủ: có thể đổi 1 quái thủ đối thủ sang công và đánh tiếp.',{synchro_requirement:{tuners:1,minNonTuners:1,level:7,tunerName:'Nitro Synchron'},effect_code:'nitro_warrior',rarity:'SR'});

// Fusion materials are complete; every referenced material is also in this catalogue.
fusion('Yugi','Dark Paladin','Kỵ Sĩ Phù Thủy Bóng Tối',8,2900,2400,['Dark Magician','Buster Blader'],['paladin'],'Tăng 500 ATK cho mỗi Rồng trên cả sân/Mộ. Có thể bỏ 1 lá để vô hiệu Phép.');
fusion('Yugi','Chimera the Flying Mythical Beast','Chimera Huyền Thú Bay',6,2100,1800,['Gazelle the King of Mythical Beasts','Berfomet'],['chimera'],'Bị phá hủy: hồi sinh Gazelle hoặc Berfomet từ Mộ.');
fusion('Yugi','Gaia the Dragon Champion','Kỵ Sĩ Rồng Gaia',7,2600,2100,['Gaia The Fierce Knight','Curse of Dragon']);
fusion('Yugi','Dragon Master Knight','Kỵ Sĩ Rồng Chủ',12,5000,5000,['Black Luster Soldier','Blue-Eyes Ultimate Dragon'],['dragon_master'],'Tăng 500 ATK cho mỗi Rồng khác trên sân bạn.');
fusion('Kaiba','Blue-Eyes Ultimate Dragon','Rồng Trắng Ba Đầu',12,4500,3800,['Blue-Eyes White Dragon','Blue-Eyes White Dragon','Blue-Eyes White Dragon']);
fusion('Kaiba','Twin-Headed Thunder Dragon','Rồng Sấm Hai Đầu',7,2800,2100,['Thunder Dragon','Thunder Dragon']);
fusion('Kaiba','XYZ-Dragon Cannon','Pháo Rồng XYZ',8,2800,2600,['X-Head Cannon','Y-Dragon Head','Z-Metal Tank'],[],'Một lần/lượt: bỏ 1 lá để phá hủy 1 lá đối thủ.',{contact:true,contact_banish:true,effect_code:'discard_destroy',effect_trigger:'activated',activation_rules:'Hợp thể X + Y + Z từ sân, không cần Polymerization; trục xuất nguyên liệu.'});
fusion('Joey','Thousand Dragon','Rồng Ngàn Tuổi',7,2400,2000,['Baby Dragon','Time Wizard']);fusion('Joey','Black Skull Dragon','Rồng Đen Hộp Sọ',9,3200,2500,['Red-Eyes Black Dragon','Summoned Skull']);fusion('Joey','Flame Swordsman','Kiếm Sĩ Lửa',5,1800,1600,['Flame Manipulator','Masaki the Legendary Swordsman']);fusion('Joey','Alligators Sword Dragon','Rồng Cá Sấu Kiếm',5,1700,1500,['Alligator Sword','Baby Dragon'],['direct'],'Có thể đánh trực tiếp.');
fusion('Pegasus','Thousand-Eyes Restrict','Quỷ Ngàn Mắt',1,0,0,['Relinquished','Thousand-Eyes Idol'],['relinquished','restrict'],'Quái khác không được tấn công. Một lần/lượt: hấp thụ 1 quái đối thủ và lấy ATK/DEF.',{effect_code:'absorb',effect_trigger:'activated'});fusion('Pegasus','Bickuribox','Hộp Hề Ma Quái',7,2300,2000,['Crass Clown','Dream Clown']);
fusion('Jaden','Elemental HERO Flame Wingman','HERO Flame Wingman',6,2100,1200,['Elemental HERO Avian','Elemental HERO Burstinatrix'],['wingman'],'Hạ quái trong chiến đấu: gây sát thương bằng ATK gốc của quái đó.');fusion('Jaden','Elemental HERO Thunder Giant','HERO Thunder Giant',6,2400,1500,['Elemental HERO Clayman','Elemental HERO Sparkman'],[],'Một lần/lượt: bỏ 1 lá, phá quái có ATK thấp hơn lá này.',{effect_code:'thunder_giant',effect_trigger:'activated'});fusion('Jaden','Elemental HERO Rampart Blaster','HERO Rampart Blaster',6,2000,2500,['Elemental HERO Burstinatrix','Elemental HERO Clayman'],['rampart'],'Có thể tấn công trực tiếp từ thế thủ với một nửa ATK.');fusion('Jaden','Elemental HERO Steam Healer','HERO Steam Healer',5,1800,1000,['Elemental HERO Burstinatrix','Elemental HERO Bubbleman'],['steam_healer'],'Hạ quái trong chiến đấu: hồi LP bằng ATK gốc của quái đó.');fusion('Jaden','Elemental HERO Mudballman','HERO Mudballman',6,1900,3000,['Elemental HERO Bubbleman','Elemental HERO Clayman']);fusion('Jaden','Elemental HERO Shining Flare Wingman','HERO Shining Flare Wingman',8,2500,2100,['Elemental HERO Flame Wingman','Elemental HERO Sparkman'],['wingman','shining_flare'],'Tăng 300 ATK mỗi HERO trong Mộ; hạ quái thì đốt LP bằng ATK gốc của nó.');fusion('Jaden','Elemental HERO Wildedge','HERO Wildedge',8,2600,2300,['Elemental HERO Wildheart','Elemental HERO Bladeedge'],['attack_all'],'Có thể tấn công từng quái đối thủ 1 lần trong Battle.');fusion('Jaden','Elemental HERO Darkbright','HERO Darkbright',6,2000,1000,['Elemental HERO Sparkman','Elemental HERO Necroshade'],['piercing','darkbright'],'Xuyên thủ; sau tấn công chuyển sang thủ. Bị phá hủy: phá 1 quái đối thủ.');
for(const [en,vi,material,trait]of[['Elemental HERO Air Neos','HERO Air Neos','Neo-Spacian Air Hummingbird','air_neos'],['Elemental HERO Aqua Neos','HERO Aqua Neos','Neo-Spacian Aqua Dolphin','aqua_neos'],['Elemental HERO Flare Neos','HERO Flare Neos','Neo-Spacian Flare Scarab','flare_neos']])fusion('Jaden',en,vi,7,2500,2000,['Elemental HERO Neos',material],[trait],trait==='air_neos'?'Khi LP thấp hơn đối thủ, tăng ATK bằng chênh lệch LP.':trait==='flare_neos'?'Tăng 400 ATK mỗi Phép/Bẫy trên cả sân.':'Một lần/lượt: bỏ 1 lá để phá 1 lá ngẫu nhiên trên tay đối thủ.',{contact:true,contact_return:true,effect_code:trait==='aqua_neos'?'aqua_neos':'',effect_trigger:trait==='aqua_neos'?'activated':'passive',activation_rules:'Contact Fusion: đưa đúng nguyên liệu trên sân về Deck, không cần Phép. Cuối lượt về Extra.'});
fusion('Zane','Cyber Twin Dragon','Rồng Máy Hai Đầu',8,2800,2100,['Cyber Dragon','Cyber Dragon'],['double_attack'],'Có thể tấn công 2 lần mỗi lượt.');fusion('Zane','Cyber End Dragon','Rồng Máy Ba Đầu',10,4000,2800,['Cyber Dragon','Cyber Dragon','Cyber Dragon'],['piercing'],'Gây sát thương xuyên thủ.');fusion('Zane','Chimeratech Overdragon','Siêu Rồng Chimeratech',9,0,0,['Cyber Dragon','Proto-Cyber Dragon'],['chimeratech'],'ATK/DEF = 800 × số nguyên liệu. Gửi các lá khác của bạn xuống Mộ; được đánh số lần bằng nguyên liệu.',{flex_machine:true,engine_notes:'Anime/H5: tối đa 3 nguyên liệu Máy từ tay/sân; phải có Cyber Dragon (hoặc Proto trên sân).'});fusion('Zane','Cyberdark Dragon','Rồng Cyberdark',8,1000,1000,['Cyberdark Horn','Cyberdark Edge','Cyberdark Keel'],['cyberdark_dragon'],'Khi Dung Hợp: trang bị 1 Rồng từ Mộ, nhận ATK của Rồng đó và 100 ATK mỗi quái trong Mộ.',{effect_code:'cyberdark_equip',effect_trigger:'on_summon'});

function spell(en,vi,code,text,extra={}){return add(en,vi,'Hỗ Trợ Anime','Spell',{spell_category:'Thường',effect_code:code,description:text,...extra});}
function trap(en,vi,code,text,extra={}){return add(en,vi,'Hỗ Trợ Anime','Trap',{trap_category:'Phản Ứng',effect_code:code,description:text,...extra});}

// Staples (Pure generic cards)
spell('Polymerization','Dung Hợp','fusion_summon','Dung Hợp 1 quái Extra bằng đúng nguyên liệu từ tay hoặc sân.');
spell('Pot of Greed','Hũ Tham Lam','draw_n','Rút 2 lá.',{effect_value:2,max_copies:1,rarity:'UR'});
spell('Graceful Charity','Thiên Sứ Ban Phước','charity','Rút 3 lá, rồi chọn bỏ 2 lá.',{max_copies:1,rarity:'UR'});
spell('Monster Reborn','Hồi Sinh Quái Vật','anime_reborn','Chọn 1 quái trong Mộ của một trong hai bên để hồi sinh.',{max_copies:1,rarity:'UR'});
spell('Dark Hole','Hố Đen','dark_hole','Phá hủy toàn bộ quái trên cả sân.');
spell('Raigeki','Sấm Sét','destroy_all_opponent_monsters','Phá hủy toàn bộ quái đối thủ.',{max_copies:1,rarity:'UR'});
spell('Swords of Revealing Light','Kiếm Ánh Sáng','swords','Lật ngửa quái úp đối thủ; ngăn họ tấn công trong 3 lượt của họ.',{spell_category:'Liên Tục'});
spell('Card Destruction','Hủy Diệt Bài','card_destruction','Hai bên bỏ toàn bộ tay, rồi rút lại đúng số lá vừa bỏ.');
spell('Change of Heart','Thay Đổi Trái Tim','control','Chiếm 1 quái đối thủ đến hết lượt, cần ô quái trống.',{max_copies:1,rarity:'UR'});
spell('Mystical Space Typhoon','Cơn Lốc Thần Bí','destroy_spell_target','Chọn và phá hủy 1 Phép/Bẫy đối thủ.');
spell('De-Fusion','Giải Dung Hợp','de_fusion','Đưa 1 quái Dung Hợp về Extra; hồi sinh nguyên liệu còn trong Mộ nếu đủ ô.');
spell('Fusion Sage','Hiền Nhân Dung Hợp','fusion_search','Lấy Polymerization từ Deck lên tay.');
spell('Megamorph','Siêu Biến Hóa','equip_atk_n','Trang bị: LP bạn thấp hơn thì gấp đôi ATK gốc; không thấp hơn thì còn một nửa.',{spell_category:'Trang Bị',traits:['megamorph']});
spell('Axe of Despair','Rìu Tuyệt Vọng','equip_atk_n','Trang bị: tăng 1000 ATK.',{spell_category:'Trang Bị',effect_value:1000});
spell('Metalmorph','Biến Hóa Kim Loại','equip_atk_n','Trang bị: tăng 300 ATK/DEF, lúc tấn công thêm nửa ATK quái bị đánh.',{spell_category:'Trang Bị',effect_value:300,traits:['metalmorph']});
spell('Scapegoat','Bầy Cừu Tế Thần','scapegoat','Tạo Cừu Token thế thủ trong các ô trống. Không dùng chúng hiến tế.',{engine_notes:'Anime/H5: sân chỉ có 3 ô quái nên tối đa 3 Cừu Token, thay vì 4.'});
spell('Stray Lambs','Đôi Cừu Lạc','lambs','Tạo tối đa 2 Cừu Token thế thủ.');
spell('Monster Reincarnation','Luân Hồi Quái Vật','reincarnate','Bỏ 1 lá trên tay; lấy 1 quái trong Mộ về tay.');
spell('Premature Burial','Chôn Sống','premature','Trả 800 LP, hồi sinh 1 quái của bạn và gắn Phép này; Phép bị phá thì quái bị phá.',{spell_category:'Liên Tục',max_copies:1,rarity:'UR'});
spell('Dian Keto the Cure Master','Thần Y Dian Keto','heal_n','Hồi 1000 LP.',{effect_value:1000});
spell('Heavy Storm','Bão Tố','heavy_storm','Phá hủy toàn bộ Phép/Bẫy của cả hai bên.',{max_copies:1,rarity:'UR'});
spell('Snatch Steal','Cướp Đoạt','snatch_steal','Trang bị: chiếm 1 quái ngửa của đối thủ; chủ cũ hồi 500 LP mỗi Standby của họ.',{spell_category:'Trang Bị',max_copies:1,rarity:'UR'});
spell('Delinquent Duo','Cặp Đôi Du Thủ','delinquent_duo','Trả 500 LP: đối thủ bỏ ngẫu nhiên 1 lá trên tay.',{max_copies:1,rarity:'UR'});
spell('Painful Choice','Lựa Chọn Đau Đớn','painful_choice','Xem 5 lá trên cùng của Deck; đối thủ chọn 1 lên tay bạn, 4 lá còn lại xuống Mộ.',{max_copies:1,rarity:'UR'});
spell('Card of Safe Return','Lá Bài Trở Về An Toàn','safe_return','Khi quái của bạn được hồi sinh từ Mộ: rút 1 lá.',{spell_category:'Liên Tục',max_copies:1,rarity:'UR'});

trap('Mirror Force','Lực Phản Chiếu','destroy_attack_position','Khi đối thủ tấn công: phá hủy mọi quái thế công của họ.',{max_copies:1,rarity:'UR'});
trap('Magic Cylinder','Ống Trụ Ma Thuật','magic_cylinder','Khi đối thủ tấn công: hủy đòn và gây sát thương bằng ATK quái tấn công.');
trap('Negate Attack','Vô Hiệu Tấn Công','negate_battle','Hủy đòn tấn công và kết thúc Battle.');
trap('Trap Hole','Hố Bẫy','trap_hole','Khi đối thủ triệu hồi quái có ATK từ 1000: phá hủy quái đó.');
trap('Torrential Tribute','Cống Phẩm Sóng Thần','torrential','Khi đối thủ triệu hồi: phá hủy toàn bộ quái hai bên.');
trap('Call of the Haunted','Tiếng Gọi Người Chết','haunted','Khi bị tấn công: hồi sinh 1 quái từ Mộ để bảo vệ bạn.');
trap('Seven Tools of the Bandit','Bảy Công Cụ Đạo Tặc','seven_tools','Khi Bẫy đối thủ kích hoạt: trả 1000 LP để vô hiệu Bẫy đó.');
trap('Magic Jammer','Nhiễu Loạn Ma Thuật','magic_jammer','Khi đối thủ dùng Phép: bỏ 1 lá để vô hiệu Phép đó.');
trap('Waboku','Hòa Bình Waboku','waboku','Khi đối thủ tấn công: chặn sát thương chiến đấu và bảo vệ quái của bạn hết lượt.');
trap('Dust Tornado','Bão Bụi','dust_tornado','Khi đối thủ dùng Phép: phá hủy 1 Phép/Bẫy của họ. Phép thường vẫn giải quyết.');
trap('Imperial Order','Sắc Lệnh Đế Quốc','imperial_order','Khi ngửa trên sân: vô hiệu toàn bộ Phép của cả hai bên.',{trap_category:'Liên Tục',max_copies:1,rarity:'UR'});

// Character Specific Spells and Traps correctly categorized by archetype:
// Yugi
add('Dark Magic Attack','Ma Thuật Hắc Ám','Yugi','Spell',{spell_category:'Thường',effect_code:'dark_magic_attack',description:'Nếu điều khiển Dark Magician: phá hủy Phép/Bẫy đối thủ.'});
add('Black Luster Ritual','Nghi Lễ Hỗn Mang','Yugi','Spell',{spell_category:'Thường',effect_code:'ritual',description:'Nghi Lễ Black Luster Soldier, tổng sao nguyên liệu từ 8.'});
add('Black Magic Ritual','Nghi Lễ Hắc Ma Thuật','Yugi','Spell',{spell_category:'Thường',effect_code:'ritual',description:'Nghi Lễ Magician of Black Chaos, tổng sao nguyên liệu từ 8.'});
add('Multiply','Nhân Bản Kuriboh','Yugi','Spell',{spell_category:'Thường',effect_code:'multiply',description:'Gửi 1 Kuriboh trên sân xuống Mộ; lấp ô trống bằng bản sao Kuriboh thế thủ.'});

// Kaiba
add('The Flute of Summoning Dragon','Sáo Triệu Hồi Rồng','Kaiba','Spell',{spell_category:'Thường',effect_code:'flute',description:'Nếu có Lord of D.: gọi đặc biệt tối đa 2 Rồng từ tay.'});

// Pegasus
add('Toon World','Thế Giới Hoạt Hình','Pegasus','Spell',{spell_category:'Liên Tục',effect_code:'toon_world',description:'Trả 1000 LP để mở Thế Giới Hoạt Hình. Toon mất chỗ trú khi lá này rời sân.'});
add('Black Illusion Ritual','Nghi Lễ Ảo Ảnh Đen','Pegasus','Spell',{spell_category:'Thường',effect_code:'ritual',description:'Nghi Lễ Relinquished, tổng sao nguyên liệu từ 1.'});

// Jaden
add('Miracle Fusion','Dung Hợp Kỳ Tích','Jaden','Spell',{spell_category:'Thường',effect_code:'miracle_fusion',description:'Trục xuất nguyên liệu HERO từ sân/Mộ để Dung Hợp 1 HERO.'});
add('Skyscraper','Tòa Nhà Chọc Trời','Jaden','Spell',{spell_category:'Môi Trường',effect_code:'skyscraper',description:'HERO đang tấn công quái mạnh hơn được tăng 1000 ATK trong giao chiến.'});

// Zane
add('Power Bond','Liên Kết Sức Mạnh','Zane','Spell',{spell_category:'Thường',effect_code:'power_bond',description:'Dung Hợp Máy, gấp đôi ATK gốc. Cuối lượt chịu sát thương bằng ATK gốc.'});

// Mai
add('Harpies Feather Duster','Lông Vũ Harpie','Mai','Spell',{spell_category:'Thường',effect_code:'duster',description:'Phá hủy toàn bộ Phép/Bẫy đối thủ.',max_copies:1,rarity:'UR'});
add('Elegant Egotist','Màn Vũ Điệu Kiêu Kỳ','Mai','Spell',{spell_category:'Thường',effect_code:'egotist',description:'Nếu bạn điều khiển Harpie Lady: gọi đặc biệt 1 Harpie Lady hoặc Harpie Lady Sisters từ tay hoặc Deck.'});
add('Cyber Shield','Khiên Cyber','Mai','Spell',{spell_category:'Trang Bị',effect_code:'cyber_shield',effect_value:500,description:'Trang bị cho Harpie Lady: tăng 500 ATK.'});
add('Rose Whip','Roi Hoa Hồng','Mai','Spell',{spell_category:'Trang Bị',effect_code:'rose_whip',effect_value:300,description:'Trang bị cho Harpie Lady: tăng 300 ATK.',engine_notes:'Anime-only: không tồn tại trong TCG.'});
add('Amazoness Spellcaster','Pháp Sư Amazoness','Mai','Spell',{spell_category:'Thường',effect_code:'amazon_spellcaster',description:'Đổi ATK gốc của 1 Amazoness ngửa mà bạn điều khiển với 1 quái ngửa của đối thủ đến hết lượt.'});
add('Shadow of Eyes','Bóng Tối Ánh Nhìn','Mai','Trap',{trap_category:'Phản Ứng',effect_code:'shadow_of_eyes',description:'Khi đối thủ Úp quái: lật ngửa quái đó ở thế công (không kích hoạt hiệu ứng lật).'});
add('Mirror Wall','Tường Gương','Mai','Trap',{trap_category:'Liên Tục',effect_code:'mirror_wall',description:'Khi đối thủ tấn công: giảm nửa ATK của quái tấn công khi lá này ngửa.',engine_notes:'Anime/H5: bỏ qua phí duy trì 2000 LP mỗi lượt.'});
add('Amazoness Archers','Cung Thủ Amazoness','Mai','Trap',{trap_category:'Phản Ứng',effect_code:'amazoness_archers',description:'Khi đối thủ tấn công: lật toàn bộ quái của họ sang thế công và giảm 500 ATK mỗi quái.',engine_notes:'Anime/H5: bỏ qua yêu cầu quái đối thủ buộc phải tấn công trong TCG.'});
add('Dramatic Rescue','Giải Cứu Ngoạn Mục','Mai','Trap',{trap_category:'Phản Ứng',effect_code:'dramatic_rescue',description:'Khi quái Amazoness của bạn bị tấn công: đưa nó về tay, rồi gọi đặc biệt 1 quái từ tay.'});
add('Triangle Ecstasy Spark','Tia Sáng Khoái Lạc','Mai','Spell',{spell_category:'Thường',effect_code:'ecstasy_spark',description:'Nếu bạn điều khiển Harpie Lady: mọi Harpie Lady ngửa của bạn thành 2700 ATK và miễn nhiễm Bẫy đến hết lượt.'});
add('Harpie Lady Phoenix Formation','Đội Hình Phượng Hoàng Yêu Điểu','Mai','Spell',{spell_category:'Thường',effect_code:'phoenix_formation',description:'Nếu bạn điều khiển Harpie Lady: phá hủy toàn bộ quái đối thủ và gây 300 sát thương mỗi quái bị phá.'});
add("Harpie's Hunting Ground",'Thánh Địa Săn Mồi Yêu Điểu','Mai','Spell',{spell_category:'Môi Trường',effect_code:'hunting_ground',description:'Quái Chim thuộc tính Phong của bạn tăng 200 ATK. Khi bạn triệu hồi Harpie Lady: phá hủy 1 Phép/Bẫy đối thủ.'});
add('Amazoness Village','Làng Amazoness','Mai','Spell',{spell_category:'Môi Trường',effect_code:'amazon_village',description:'Amazoness của bạn tăng 200 ATK. Khi Amazoness của bạn bị phá hủy trong chiến đấu: hồi sinh 1 Amazoness khác từ Mộ.'});

// Yusei Spells & Traps
add('Scrap-Iron Scarecrow','Bù Nhìn Sắt Vụn','Yusei','Trap',{trap_category:'Phản Ứng',effect_code:'scrap_iron_scarecrow',description:'Khi quái đối thủ tấn công: vô hiệu đòn tấn công đó, sau đó Úp lại lá này xuống ô Bẫy thay vì gửi vào Mộ (1 lần/lượt).',rarity:'SR'});
add('Tuning','Điều Tinh','Yusei','Spell',{spell_category:'Thường',effect_code:'tuning_search',description:'Lấy 1 quái thú Tuner "Synchron" từ Bộ bài lên tay, rồi gửi lá trên cùng của Bộ bài xuống Mộ.',rarity:'SR'});
add('Synchro Blast Wave','Sóng Nổ Đồng Bộ','Yusei','Spell',{spell_category:'Thường',effect_code:'synchro_blast_wave',description:'Nếu bạn điều khiển quái thú Đồng Bộ: chọn và phá hủy 1 quái thú ngửa của đối thủ.',rarity:'R'});
add('Limiter Overload','Bộ Giới Hạn Quá Tải','Yusei','Trap',{trap_category:'Phản Ứng',effect_code:'limiter_overload',description:'Khi lá này được gửi xuống Mộ: gọi đặc biệt 1 Chiến Binh Tốc Độ từ tay, Bộ bài hoặc Mộ.',rarity:'R',traits:['limiter_overload']});
add('Spirit Force','Năng Lượng Tinh Thần','Yusei','Trap',{trap_category:'Phản Ứng',effect_code:'spirit_force',description:'Khi đối thủ tấn công: chặn toàn bộ sát thương chiến đấu của đòn đánh đó, rồi lấy 1 Tuner Chiến Binh từ Mộ về tay.',rarity:'R'});

// Tokens
add('Sheep Token','Cừu Token','Token','Monster',{stars:1,atk:0,def:0,monster_category:'Token',deck_zone:'Token',max_copies:0,uncollectible:true,description:'Token thế thủ, không dùng để hiến tế.'});
add('Doppel Token','Token Phân Thân','Token','Monster',{stars:1,atk:400,def:400,monster_category:'Token',deck_zone:'Token',max_copies:0,uncollectible:true,description:'Token được tạo bởi hiệu ứng Chiến Binh Song Sinh (Doppelwarrior).'});

const tribes={
 'Rồng':['Blue-Eyes White Dragon','Blue-Eyes Ultimate Dragon','Blue-Eyes Shining Dragon','Curse of Dragon','Thunder Dragon','Twin-Headed Thunder Dragon','Red-Eyes Black Dragon','Baby Dragon','Thousand Dragon','Black Skull Dragon','Alligators Sword Dragon','Parrot Dragon','Blue-Eyes Toon Dragon','Manga Ryu-Ran','Exploder Dragon',"Harpie's Pet Dragon","Harpie's Pet Baby Dragon",'Stardust Dragon'],
 'Máy':['X-Head Cannon','Y-Dragon Head','Z-Metal Tank','XYZ-Dragon Cannon','Jinzo','Cyber Dragon','Proto-Cyber Dragon','Cyber Phoenix','Cyber Valley','Cyberdark Horn','Cyberdark Edge','Cyberdark Keel','Cyber Tech Alligator','Cyber Twin Dragon','Cyber End Dragon','Chimeratech Overdragon','Cyberdark Dragon','Quillbolt Hedgehog','Turbo Synchron','Nitro Synchron','Formula Synchron','Armory Arm'],
 'Chiến Binh':['Celtic Guardian','Gaia The Fierce Knight','Buster Blader','Black Luster Soldier','Dragon Master Knight','Axe Raider','Masaki the Legendary Swordsman','Swordsman of Landstar','Rocket Warrior','Gearfried the Iron Knight','Gilford the Lightning','Flame Swordsman','Amazoness Fighter','Amazoness Swordswoman','Amazoness Chain Master','Amazoness Queen','Amazoness Paladin','Amazoness Sage','Junk Synchron','Speed Warrior','Junk Forward','Doppelwarrior','Junk Warrior','Nitro Warrior','Doppel Token'],
 'Thú Chiến Binh':['Battle Ox','Vorse Raider','Tiger Axe','Alligator Sword'],
 'Thú':['Gazelle the King of Mythical Beasts','Silver Fang','Hitotsu-Me Giant','Dark Rabbit','Chimera the Flying Mythical Beast','Amazoness Tiger'],
 'Quỷ':['Summoned Skull','La Jinn the Mystical Genie of the Lamp','Ryu-Kishin Powered','Berfomet','Thousand-Eyes Idol','Crass Clown','Dream Clown','Toon Summoned Skull','Bickuribox','Kuriboh'],
 'Đá':['Giant Soldier of Stone','Alpha The Magnet Warrior','Beta The Magnet Warrior','Gamma The Magnet Warrior','Valkyrion the Magna Warrior'],
 'Pháp Sư':['Dark Magician','Dark Magician Girl','Mystical Elf','Magician of Black Chaos','Lord of D.','Saggi the Dark Clown','Time Wizard','Flame Manipulator','Illusionist Faceless Mage','Relinquished','Thousand-Eyes Restrict','Toon Dark Magician Girl','Dark Paladin','Effect Veiler'],
 'Thần Thú':['Slifer the Sky Dragon','Obelisk the Tormentor','The Winged Dragon of Ra'],
 'Tiên':['Winged Kuriboh'],'Côn Trùng':['Neo-Spacian Flare Scarab'],'Thủy':['Neo-Spacian Aqua Dolphin','Toon Mermaid'],'Chim':['Neo-Spacian Air Hummingbird','Harpie Lady','Harpie Lady Sisters','Cyber Harpie Lady','Harpie Queen','Sonic Chick','Shield Wing']
};
const atlas=['Dark Magician','Dark Magician Girl','Blue-Eyes White Dragon','Red-Eyes Black Dragon','Summoned Skull','Exodia the Forbidden One','Slifer the Sky Dragon','Obelisk the Tormentor','The Winged Dragon of Ra','Relinquished','Blue-Eyes Toon Dragon','Jinzo','Elemental HERO Flame Wingman','Elemental HERO Shining Flare Wingman','Elemental HERO Neos','Winged Kuriboh','Cyber Dragon','Cyber End Dragon','Thousand-Eyes Restrict','Buster Blader','Gaia the Dragon Champion','Thousand Dragon','Black Skull Dragon','Cyberdark Dragon'];
for(const c of cards){for(const [tribe,names]of Object.entries(tribes))if(names.includes(c.name_en))c.tribe=tribe;if(c.name_en.startsWith('Elemental HERO '))c.tribe='Chiến Binh';if(c.traits.includes('exodia'))c.tribe='Pháp Sư';if(atlas.includes(c.name_en))c.art_tile=atlas.indexOf(c.name_en);if(c.name_en.startsWith('Cyberdark ')&&c.deck_zone==='Main')c.description+=' '+({piercing:'Gây sát thương xuyên thủ.',direct_half:'Có thể đánh trực tiếp bằng nửa ATK.',battle_burn_300:'Hạ quái trong chiến đấu: gây thêm 300 sát thương.'}[c.traits[0]]||'');}
for(const c of cards){if(['anime_reborn','premature','de_fusion'].includes(c.effect_code)||c.traits.includes('chimera'))c.description+=' Được chọn thế công hoặc thế thủ khi hồi sinh.';if(c.effect_code==='haunted'){c.revival_position='def';c.description='Khi bị tấn công: hồi sinh 1 quái từ Mộ ở thế thủ để bảo vệ bạn.';c.engine_notes='Anime/H5: lá này bắt buộc hồi sinh ở thế thủ; không mở lựa chọn tư thế.';}}
const {overrides,makeTranslator}=require('../assets/js/meme_vietnamese.js');for(const c of cards){c.name_vi=overrides[c.name_en]||c.name_vi;c.name=c.name_vi;}const vi=makeTranslator(cards);for(const c of cards)for(const key of ['description','activation_rules','engine_notes'])if(c[key])c[key]=vi(c[key]);
const by=new Map(cards.map(c=>[c.id,c]));for(const c of cards){if(c.fusion_materials)for(const m of c.fusion_materials)if(!by.has(m))throw Error('Missing material '+m);}
for(const sheet of JSON.parse(fs.readFileSync('assets/data/anime-art-atlases.json','utf8')))for(const [index,id]of sheet.cards.entries()){const c=by.get(id);if(!c)throw Error('Unknown art card '+id);Object.assign(c,{art_atlas:sheet.file,art_cols:sheet.cols,art_rows:sheet.rows,art_tile:index});}
const repeat=(name,n=1)=>Array(n).fill(id(name));
const support=['Polymerization','Polymerization','Pot of Greed','Graceful Charity','Monster Reborn','Mystical Space Typhoon','Mirror Force','Magic Cylinder'];
function preset(name,monsters,spells,extraNames){const ids=[...monsters.map(id),...spells.map(id)];if(ids.length<20||ids.length>30)throw Error(name+' size '+ids.length);for(const x of ids){if(!by.has(x))throw Error('Unknown '+x);if(ids.filter(i=>i===x).length>by.get(x).max_copies)throw Error('Copies '+x);}decks[name]=ids;extras[name]=extraNames.map(id);}
const cores={
 Yugi:['Dark Magician','Dark Magician','Dark Magician Girl','Buster Blader','Celtic Guardian','Celtic Guardian','Giant Soldier of Stone','Giant Soldier of Stone','Kuriboh','Kuriboh','Summoned Skull','Gazelle the King of Mythical Beasts','Gazelle the King of Mythical Beasts','Berfomet','Mystical Elf','Silver Fang'],
 Kaiba:['Blue-Eyes White Dragon','Blue-Eyes White Dragon','Blue-Eyes White Dragon','Lord of D.','Lord of D.','La Jinn the Mystical Genie of the Lamp','La Jinn the Mystical Genie of the Lamp','Vorse Raider','Vorse Raider','Battle Ox','Hitotsu-Me Giant','Ryu-Kishin Powered','Thunder Dragon','Thunder Dragon','Thunder Dragon','Saggi the Dark Clown'],
 Joey:['Red-Eyes Black Dragon','Red-Eyes Black Dragon','Baby Dragon','Baby Dragon','Time Wizard','Time Wizard','Jinzo','Gearfried the Iron Knight','Rocket Warrior','Axe Raider','Axe Raider','Alligator Sword','Summoned Skull','Flame Manipulator','Masaki the Legendary Swordsman','Swordsman of Landstar'],
 Pegasus:['Relinquished','Relinquished','Thousand-Eyes Idol','Thousand-Eyes Idol','Toon Mermaid','Toon Mermaid','Blue-Eyes Toon Dragon','Toon Summoned Skull','Toon Dark Magician Girl','Manga Ryu-Ran','Crass Clown','Crass Clown','Dream Clown','Dream Clown','Dark Rabbit','Illusionist Faceless Mage'],
 Jaden:['Elemental HERO Avian','Elemental HERO Avian','Elemental HERO Burstinatrix','Elemental HERO Burstinatrix','Elemental HERO Clayman','Elemental HERO Clayman','Elemental HERO Sparkman','Elemental HERO Sparkman','Elemental HERO Bubbleman','Elemental HERO Bubbleman','Elemental HERO Wildheart','Elemental HERO Bladeedge','Elemental HERO Necroshade','Elemental HERO Neos','Winged Kuriboh','Winged Kuriboh'],
 Zane:['Cyber Dragon','Cyber Dragon','Cyber Dragon','Proto-Cyber Dragon','Proto-Cyber Dragon','Proto-Cyber Dragon','Cyber Phoenix','Cyber Phoenix','Cyber Valley','Cyber Valley','Cyberdark Horn','Cyberdark Edge','Cyberdark Keel','Exploder Dragon','Exploder Dragon','Cyber Tech Alligator'],
 Mai:['Harpie Lady','Harpie Lady','Harpie Lady','Cyber Harpie Lady','Cyber Harpie Lady','Harpie Queen','Harpie Queen','Harpie Lady Sisters','Harpie Lady Sisters',"Harpie's Pet Dragon","Harpie's Pet Baby Dragon","Harpie's Pet Baby Dragon",'Amazoness Swordswoman','Amazoness Tiger','Amazoness Chain Master','Amazoness Queen'],
 Yusei:['Junk Synchron','Junk Synchron','Junk Synchron','Speed Warrior','Speed Warrior','Quillbolt Hedgehog','Quillbolt Hedgehog','Sonic Chick','Shield Wing','Junk Forward','Junk Forward','Doppelwarrior','Doppelwarrior','Effect Veiler','Turbo Synchron','Nitro Synchron']
};
const fusionGroups={
 Yugi:['Dark Paladin','Chimera the Flying Mythical Beast','Gaia the Dragon Champion','Dragon Master Knight'],
 Kaiba:['Blue-Eyes Ultimate Dragon','Twin-Headed Thunder Dragon','XYZ-Dragon Cannon'],
 Joey:['Thousand Dragon','Black Skull Dragon','Flame Swordsman','Alligators Sword Dragon'],
 Pegasus:['Thousand-Eyes Restrict','Bickuribox'],
 Jaden:['Elemental HERO Flame Wingman','Elemental HERO Thunder Giant','Elemental HERO Rampart Blaster','Elemental HERO Steam Healer','Elemental HERO Mudballman','Elemental HERO Shining Flare Wingman','Elemental HERO Wildedge','Elemental HERO Darkbright'],
 Zane:['Cyber Twin Dragon','Cyber End Dragon','Chimeratech Overdragon','Cyberdark Dragon'],
 Mai:[],
 Yusei:['Stardust Dragon','Junk Warrior','Formula Synchron','Armory Arm','Nitro Warrior']
};
for(const [g,core]of Object.entries(cores)){
 let utility=[...support];
 if(g==='Pegasus')utility=['Toon World','Toon World','Black Illusion Ritual','Black Illusion Ritual','Polymerization','Pot of Greed','Monster Reborn','Mirror Force'];
 if(g==='Jaden')utility=['Polymerization','Polymerization','Miracle Fusion','Miracle Fusion','Skyscraper','Pot of Greed','Monster Reborn','Mirror Force'];
 if(g==='Zane')utility=['Polymerization','Polymerization','Power Bond','Power Bond','Pot of Greed','Monster Reborn','Mirror Force','Magic Cylinder'];
 if(g==='Kaiba')utility=['Polymerization','Polymerization','The Flute of Summoning Dragon','The Flute of Summoning Dragon','Pot of Greed','Monster Reborn','Mirror Force','Magic Cylinder'];
 if(g==='Mai')utility=['Elegant Egotist','Elegant Egotist','Elegant Egotist','Harpie Lady Phoenix Formation',"Harpie's Hunting Ground",'Triangle Ecstasy Spark','Shadow of Eyes','Mirror Wall','Harpies Feather Duster','Monster Reborn'];
 if(g==='Yusei')utility=['Tuning','Tuning','Synchro Blast Wave','Scrap-Iron Scarecrow','Scrap-Iron Scarecrow','Limiter Overload','Pot of Greed','Monster Reborn','Mirror Force','Mystical Space Typhoon'];
 preset(g+' · Kinh điển',core,utility,fusionGroups[g]);
 preset(g+' · Phản công',core,g==='Mai'?['Amazoness Archers','Dramatic Rescue','Mirror Wall','Amazoness Village','Elegant Egotist','Elegant Egotist','Harpies Feather Duster','Pot of Greed','Monster Reborn','Mirror Force']:g==='Yusei'?['Scrap-Iron Scarecrow','Scrap-Iron Scarecrow','Spirit Force','Limiter Overload','Tuning','Synchro Blast Wave','Pot of Greed','Monster Reborn','Mirror Force','Magic Cylinder']:['Swords of Revealing Light','Mirror Force','Magic Cylinder','Waboku','Monster Reborn','Polymerization','Polymerization','Pot of Greed',...(g==='Pegasus'?['Toon World','Black Illusion Ritual']:[])],fusionGroups[g]);
}
preset('Yugi · Exodia',normal.filter(x=>x[0]==='Yugi'&&x[3]<=4).slice(0,5).map(x=>x[1]).concat(['Exodia the Forbidden One','Left Arm of the Forbidden One','Right Arm of the Forbidden One','Left Leg of the Forbidden One','Right Leg of the Forbidden One','Kuriboh','Kuriboh']),['Pot of Greed','Graceful Charity','Dark Hole','Monster Reborn','Swords of Revealing Light','Swords of Revealing Light','Waboku','Waboku','Card Destruction','Monster Reincarnation'],[]);
preset('Yugi · Thần Osiris',cores.Yugi.slice(2).concat(['Slifer the Sky Dragon','Black Luster Soldier']),['Black Luster Ritual','Polymerization','Pot of Greed','Scapegoat','Monster Reborn','Mirror Force','Graceful Charity','Swords of Revealing Light'],fusionGroups.Yugi);
preset('Kaiba · Obelisk',cores.Kaiba.slice(2).concat(['Obelisk the Tormentor','Blue-Eyes Shining Dragon']),['Polymerization','The Flute of Summoning Dragon','Pot of Greed','Scapegoat','Monster Reborn','Mirror Force','Graceful Charity','Swords of Revealing Light'],fusionGroups.Kaiba);
preset('Joey · Thời gian',cores.Joey,['Polymerization','Polymerization','Pot of Greed','Graceful Charity','Metalmorph','Monster Reborn','Kunai with Chain','Magic Cylinder'].filter(x=>by.has(id(x))).concat(['Waboku']),fusionGroups.Joey);
preset('Jaden · Neo-Spacian',cores.Jaden.slice(0,10).concat(['Elemental HERO Neos','Elemental HERO Neos','Neo-Spacian Air Hummingbird','Neo-Spacian Aqua Dolphin','Neo-Spacian Flare Scarab','Winged Kuriboh']),['Polymerization','Miracle Fusion','Skyscraper','Pot of Greed','Graceful Charity','Monster Reborn','Mirror Force','Magic Cylinder'],['Elemental HERO Air Neos','Elemental HERO Aqua Neos','Elemental HERO Flare Neos','Elemental HERO Flame Wingman']);
preset('Zane · Cyberdark',cores.Zane.slice(0,7).concat(['Cyberdark Horn','Cyberdark Horn','Cyberdark Edge','Cyberdark Edge','Cyberdark Keel','Cyberdark Keel','Exploder Dragon','Exploder Dragon','Baby Dragon']),['Polymerization','Polymerization','Power Bond','Monster Reborn','Pot of Greed','Graceful Charity','Mirror Force','Magic Cylinder'],fusionGroups.Zane);
const heroSpecs=[
 ['Yugi Muto / Atem','Trái Tim Lá Bài','destiny','Khi LP ≤2000: xem 5 lá trên cùng của Deck, chọn 1 lên tay, rồi xáo lại.',0,'#cfa7ff','◈','Yugi'],
 ['Seto Kaiba','Kiêu Hãnh Rồng Trắng','kaiba','Trả 500 LP: đổi 1 lá trên tay lấy Blue-Eyes White Dragon từ Deck.',1,'#9cd9ff','🐉','Kaiba'],
 ['Joey Wheeler','Vòng Quay Thời Gian','joey','Đưa Time Wizard hoặc Red-Eyes từ Deck lên tay.',2,'#ffd28c','🪙','Joey'],
 ['Maximillion Pegasus','Con Mắt Ngàn Năm','pegasus','Trả 500 LP: xem tay đối thủ và lấy Toon World hoặc Black Illusion Ritual từ Deck.',3,'#e5abd4','◉','Pegasus'],
 ['Jaden Yuki / Judai','Get Your Game On!','jaden','Nếu có HERO: lấy Polymerization hoặc Miracle Fusion từ Deck lên tay.',6,'#ffae88','🔥','Jaden'],
 ['Zane Truesdale / Ryo','Cyber Style','zane','Trả 500 LP: đổi 1 lá trên tay lấy Cyber Dragon hoặc Power Bond từ Deck.',7,'#94d9e9','⚡','Zane'],
 ['Mai Valentine / Mai Kujaku','Vũ Điệu Yêu Điểu','mai','Trả 500 LP: lấy Harpie Lady hoặc Elegant Egotist từ Deck lên tay.',4,'#cfa7f5','🪶','Mai'],
 ['Yusei Fudo','Tăng Tốc Đồng Bộ','yusei','Trả 500 LP: đổi 1 lá trên tay lấy Junk Synchron hoặc Stardust Dragon từ Deck.',8,'#00b4d8','⭐','Yusei']
];
const heroes=heroSpecs.map(([name,skill,code,description,tile,color,icon,group],i)=>({id:i,name,skill,code,description,tile,color,icon,title:group,group,primaryDeck:group+' · Kinh điển',position:(tile%4)/3*100+'%',value:0}));
for(const h of heroes){h.description=vi(h.description);h.skill=vi(h.skill);}
const meta={version:'20261024-anime-v1',storageVersion:'anime-v1',cardCount:cards.filter(c=>!c.uncollectible).length,mainSize:30,extraLimit:10,defaultExtra:extras[heroes[0].primaryDeck],excelFilename:'xom-arcana-anime.xlsx',era:'DM / GX / 5Ds · Luật Anime H5',portraits:'assets/memecard/anime-duelists-v1.png',roster:heroes.map(h=>h.name)};
const data={cards,decks,extras,heroes,meta};
fs.writeFileSync('assets/data/arcana-anime.json',JSON.stringify(data,null,2));
fs.writeFileSync('assets/js/meme_catalog_anime.js','window.MEME_CARDS='+JSON.stringify(cards)+';\nwindow.MEME_DECK_PRESETS='+JSON.stringify(decks)+';\nwindow.MEME_EXTRA_PRESETS='+JSON.stringify(extras)+';\nwindow.ARCANA_CATALOGUE='+JSON.stringify(meta)+';\n');
fs.writeFileSync('assets/js/meme_anime_heroes.js','window.MEME_HEROES='+JSON.stringify(heroes)+';\n');
console.log(JSON.stringify({cards:cards.length,collectible:meta.cardCount,synchros:cards.filter(c=>c.synchro_requirement).length,fusions:cards.filter(c=>c.fusion_materials).length,decks:Object.keys(decks).length,heroes:heroes.length}));
