// Compact, original cards inspired by Duel Monsters / GX, with one main effect per card.
const fs=require('node:fs'),crypto=require('node:crypto');
const original=JSON.parse(fs.readFileSync('assets/data/arcana-200.json')),cards=[],presets={},extras={};
const groups=[
 ['Hắc Ấn','Pháp Sư','Ám','#bca0ed',['Học Đồ Hắc Ấn','Kiếm Sĩ Ma Thuật','Mèo Giấy Phù Chú','Pháp Sư Hắc Ấn','Nữ Hoàng Nguyệt Ấn','Vệ Sĩ Phù Văn','Kỵ Sĩ Hắc Ấn','Đại Pháp Sư Song Ấn']],
 ['Bạch Long','Rồng','Quang','#a7e4fa',['Rồng Trắng Non','Kỵ Sĩ Lam Nhãn','Tinh Linh Lam Ngọc','Bạch Long Thiên Không','Long Vương Ngân Hà','Hộ Vệ Vảy Bạc','Song Long Lam Nhãn','Bạch Long Tam Quang']],
 ['Hồng Long','Rồng','Hỏa','#ed9d88',['Rồng Đỏ Sơ Sinh','Kiếm Sĩ Đuôi Rồng','Phù Thủy Đồng Hồ','Hồng Long Hắc Dực','Long Chúa Hồng Liên','Hiệp Sĩ Vảy Đỏ','Hồng Long Kiếm Hồn','Hồng Long Thiên Hỏa']],
 ['Anh Hùng Nguyên Tố','Chiến Binh','Phong','#90d7b3',['Anh Hùng Phong Vũ','Anh Hùng Hỏa Tâm','Anh Hùng Thủy Kính','Anh Hùng Lôi Quang','Anh Hùng Thái Dương','Anh Hùng Nham Giáp','Anh Hùng Dực Hỏa','Anh Hùng Nhật Thực']],
 ['Rồng Máy','Cơ Giới','Cơ','#a1d1de',['Rồng Máy Tiền Tuyến','Rồng Máy Trinh Sát','Kỹ Sư Lõi Bạc','Rồng Máy Cao Áp','Rồng Máy Cự Pháo','Rồng Máy Giáp Chắn','Song Long Cơ Giới','Rồng Máy Chung Cực']],
 ['Cơ Binh Cổ Đại','Cơ Giới','Thổ','#d1b98a',['Cơ Binh Bánh Răng','Cơ Binh Kỵ Sĩ','Thợ Máy Cổ Thành','Người Khổng Lồ Cổ Đại','Cự Thần Bánh Răng','Cơ Binh Khiên Đá','Cơ Binh Song Kiếm','Cự Thần Cổ Thành']]
];
function make(x){const c={catalogue_version:'classic-v1',max_copies:x.rarity==='UR'?1:x.rarity==='SR'?2:3,deck_zone:'Main',effect_code:'',effect_value:0,effect_trigger:'passive',art:{emoji:'✦',c1:x.color||'#a7d4e2',c2:'#23354f'},...x};delete c.color;c.custom_image=`assets/memecard/art/${c.id}.svg`;c.activation_rules=c.card_type==='Monster'?'Triệu hồi thường 1 lần/lượt. 5–6 sao: hiến tế 1; 7 sao trở lên: hiến tế 2.':c.card_type==='Trap'?'Úp trước ít nhất 1 lượt. Tự phản ứng khi đúng điều kiện.':'Dùng trong MAIN 1 hoặc MAIN 2.';cards.push(c);return c;}
for(let g=0;g<groups.length;g++){
 const [archetype,tribe,element,color,names]=groups[g],ids=names.map((_,i)=>`DMGX-${String(g*8+i+1).padStart(3,'0')}`);
 const stats=[[4,1800,1000],[4,1600,1600],[3,1400,1200],[6,2400,1800],[7,2700,2200],[4,1500,2000],[6,2500,2100],[8,3000,2500]];
 names.forEach((name,i)=>{const [stars,atk,def]=stats[i],fusion=i>=6,traits=i===3||i===7?['piercing']:i===5?['battle_resist']:[];
  const c=make({id:ids[i],name,archetype,tribe,element,color,card_type:'Monster',monster_category:fusion?'Dung Hợp':i===2||traits.length?'Hiệu ứng':'Thường',rarity:i===4||i===7?'UR':fusion?'SR':i===3||i===5?'R':'N',stars,atk,def,deck_zone:fusion?'Extra':'Main',traits,
   effect_code:i===2?'draw_n':'',effect_trigger:i===2?'on_flip':'passive',effect_value:i===2?1:0,
   description:i===2?'Khi lật ngửa: rút 1 lá.':traits.includes('piercing')?'Khi tấn công quái thế thủ, gây sát thương bằng phần ATK vượt DEF.':traits.includes('battle_resist')?'Mỗi lượt, không bị phá hủy bởi chiến đấu lần đầu tiên.':'Quái thường. Không có hiệu ứng; dùng để tấn công, phòng thủ hoặc làm nguyên liệu.'});
  if(g===0&&i===4){c.atk=2500;c.def=2100;}
  if(g===1&&i===4){c.atk=3000;c.def=2500;c.stars=8;}
  if(g===0&&i===7){c.traits=[];c.effect_code='destroy_spell';c.effect_trigger='on_summon';c.description='Khi Dung Hợp: phá hủy 1 Phép/Bẫy đối thủ (ưu tiên ô bên trái).';}
  if(g===1&&i===7){c.traits=['double_attack'];c.description='Có thể tấn công tối đa 2 lần mỗi lượt.';}
  if(g===2&&i===7){c.traits=[];c.effect_code='burn_n';c.effect_value=500;c.effect_trigger='on_summon';c.description='Khi Dung Hợp: gây 500 sát thương LP cho đối thủ.';}
  if(g===3&&i===6){c.effect_code='destroy_strongest';c.effect_trigger='on_summon';c.description='Khi Dung Hợp: phá hủy quái có ATK cao nhất của đối thủ.';}
  if(g===4&&i===3){c.traits=[];c.special_empty_field=true;c.stars=5;c.atk=2100;c.description='Nếu đối thủ có quái và sân bạn trống, có thể triệu hồi đặc biệt lá này từ tay.';}
  if(g===5&&i===7){c.traits=['ancient_attack'];c.description='Khi lá này tấn công, đối thủ không thể dùng Bẫy phản đòn đòn đánh đó.';}
  if(fusion){c.fusion_materials=i===6?[ids[0],ids[1]]:[ids[3],ids[5]];c.description=`${c.fusion_materials.map(id=>names[ids.indexOf(id)]).join(' + ')}. ${c.effect_code||c.traits.length?c.description:'Không có hiệu ứng phụ.'}`;c.activation_rules='Extra Deck. Dùng Phép Dung Hợp và đúng nguyên liệu trên tay hoặc sân; không tiêu lượt triệu hồi thường.';}
 });
 presets[archetype]=[...Array(3).fill(ids[0]),...Array(3).fill(ids[1]),ids[2],ids[2],ids[3],ids[4],ids[5],ids[5],'XA-096','XA-096','XA-006','XA-026','XA-036','XA-056','XA-008','XA-018'];extras[archetype]=[ids[6],ids[7]];
}
for(const [i,n]of[1,4,11,14,21,24,31,34,41,44,51,54].entries()){
 const old=original.cards.find(c=>c.id===`XA-${String(n).padStart(3,'0')}`);
 make({id:old.id,name:old.name,archetype:'Xóm Cổ Điển',tribe:old.tribe,element:old.element,color:old.art.c1,card_type:'Monster',monster_category:i%4===3?'Hiệu ứng':'Thường',rarity:'N',stars:4,atk:i%2?1700:1800,def:i%2?1800:1000,traits:i%4===3?['battle_resist']:[],description:i%4===3?'Mỗi lượt, không bị phá hủy bởi chiến đấu lần đầu tiên.':'Quái thường. Không có hiệu ứng phụ; mạnh ngay khi được triệu hồi.'});
}
const utility=[
 [6,'Chén Trà Bình Tâm','Spell','draw_n',1,'Rút 1 lá.','R'],[16,'Suối Nguồn Xóm Nhỏ','Spell','heal_n',800,'Hồi 800 LP.','N'],
 [26,'Lưỡi Kiếm Định Mệnh','Spell','destroy_monster_target',0,'Chọn và phá hủy 1 quái đối thủ.','SR'],[36,'Kiếm Ánh Sao','Spell','equip_atk_n',500,'Trang bị cho 1 quái của bạn: tăng 500 ATK.','R'],
 [46,'Phong Ấn Phép Thuật','Trap','negate_spell',0,'Khi đối thủ dùng Phép: vô hiệu Phép đó.','SR'],[56,'Tiếng Gọi Hồi Sinh','Spell','revive',0,'Hồi sinh 1 quái từ 4 sao trở xuống ở Mộ của bạn trong thế thủ.','SR'],
 [66,'Gió Lốc Sân Trường','Spell','destroy_spell_target',0,'Chọn và phá hủy 1 Phép/Bẫy đối thủ.','R'],[76,'Cánh Cổng Hồi Hương','Spell','bounce_strongest',0,'Đưa quái có ATK cao nhất của đối thủ về tay. Quái Dung Hợp về Extra.','R'],
 [86,'Bình Báu Cổ Xưa','Spell','draw_n',2,'Rút 2 lá. Tối đa 1 bản trong bộ bài.','UR'],[96,'Dung Hợp Xóm Anh Hùng','Spell','fusion_summon',0,'Gửi đúng nguyên liệu từ tay hoặc sân xuống Mộ để gọi 1 quái Dung Hợp từ Extra Deck.','R'],
 [8,'Bức Tường Ánh Sáng','Trap','negate_attack',0,'Khi đối thủ tấn công: vô hiệu đòn tấn công đó.','N'],[18,'Hố Bẫy Phản Công','Trap','destroy_attacker',0,'Khi đối thủ tấn công: phá hủy quái đang tấn công.','SR']
];
for(const [n,name,card_type,effect_code,effect_value,description,rarity]of utility)make({id:`XA-${String(n).padStart(3,'0')}`,name,archetype:'Hỗ Trợ Chung',tribe:'Hỗ Trợ',element:'Quang',card_type,rarity,effect_code,effect_value,description,spell_category:effect_code==='equip_atk_n'?'Trang Bị':'Thường',trap_category:'Phản Ứng'});
const meta={version:'20261024-classic-v1',cardCount:cards.length,mainSize:20,extraLimit:5,storageVersion:'classic-v1',defaultExtra:extras[Object.keys(extras)[0]],excelFilename:'xom-arcana-classic.xlsx',era:'Duel Monsters / GX',retiredIds:original.cards.filter(c=>!cards.some(n=>n.id===c.id)).map(c=>c.id)};
const output={cards,decks:presets,extras,meta};fs.writeFileSync('assets/data/arcana-classic.json',JSON.stringify(output,null,2));
fs.writeFileSync('assets/js/meme_catalog_classic.js','// Original compact DM/GX inspired set. Generated by scripts/build-classic-catalog.cjs\nwindow.MEME_CARDS='+JSON.stringify(cards)+';\nwindow.MEME_DECK_PRESETS='+JSON.stringify(presets)+';\nwindow.MEME_EXTRA_PRESETS='+JSON.stringify(extras)+';\nwindow.ARCANA_CATALOGUE='+JSON.stringify(meta)+';\n');
console.log(JSON.stringify({cards:cards.length,retired:meta.retiredIds.length,normal:cards.filter(c=>c.monster_category==='Thường').length,fusions:cards.filter(c=>c.fusion_materials).length}));
