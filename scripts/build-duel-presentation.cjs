// Derive thumbnails from the existing approved artwork. No card or saved ID changes.
const fs=require('node:fs'),path=require('node:path');
let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/Kien/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'assets/data/arcana-anime.json'),'utf8'));
const full=path.join(root,'assets/memecard/pictures'),thumb=path.join(full,'thumbs');fs.mkdirSync(thumb,{recursive:true});
const refs=new Map();for(const c of data.cards)for(const id of c.fusion_materials||[]){if(!refs.has(id))refs.set(id,[]);refs.get(id).push(c.id);}
const names=new Map(data.cards.map(c=>[c.name_en,c.id])),id=n=>names.get(n);
const support={
 'Dark Magician':['Dark Magic Attack','Dark Magician Girl','Dark Paladin'],
 'Blue-Eyes White Dragon':['The Flute of Summoning Dragon','Lord of D.','Blue-Eyes Ultimate Dragon'],
 'Red-Eyes Black Dragon':['Black Skull Dragon','Monster Reborn','Metalmorph'],
 'Kuriboh':['Multiply','Monster Reborn'], 'Monster Reborn':['Blue-Eyes White Dragon','Cyber Dragon','Chimera the Flying Mythical Beast'], 'Toon World':['Blue-Eyes Toon Dragon','Toon Dark Magician Girl'],
 'Relinquished':['Black Illusion Ritual','Thousand-Eyes Restrict'],
 'Cyber Dragon':['Power Bond','Cyber Twin Dragon','Cyber End Dragon','Chimeratech Overdragon'],
 'Time Wizard':['Baby Dragon','Thousand Dragon'],
 'Slifer the Sky Dragon':['Pot of Greed','Graceful Charity'],
 'The Winged Dragon of Ra':['Dian Keto the Cure Master','Monster Reborn'],
 'Elemental HERO Neos':['Neo-Spacian Air Hummingbird','Neo-Spacian Aqua Dolphin','Neo-Spacian Flare Scarab'],
};
const cost={premature:'Trả 800 LP khi hồi sinh; cần LP lớn hơn 800.',toon_world:'Trả 1000 LP; cần LP lớn hơn 1000.',seven_tools:'Tự trả 1000 LP; cần LP lớn hơn 1000.',magic_jammer:'Tự bỏ lá đầu tay khi Bẫy giải quyết.',charity:'Sau khi rút 3, chọn bỏ 2 lá.',discard_destroy:'Bỏ 1 lá trên tay.',thunder_giant:'Bỏ 1 lá trên tay.',dolphin:'Bỏ 1 lá trên tay.',aqua_neos:'Bỏ 1 lá trên tay.',obelisk:'Hiến tế 2 quái khác.',ra:'Đổi LP còn lại, giữ lại 1 LP.',reincarnate:'Bỏ 1 lá trên tay.',thunder_search:'Bỏ chính lá này từ tay.'};
const trigger={passive:'Liên tục hoặc theo điều kiện trên lá',activated:'Chủ động trong MAIN',on_summon:'Tự động khi gọi ngửa',on_destroy:'Sau khi bị phá theo điều kiện'};
const counters=c=>c.card_type==='Trap'?['Jinzo','Seven Tools of the Bandit']:c.card_type==='Spell'?['Magic Jammer','Dark Paladin']:c.traits?.includes('exodia')?['Card Destruction','Neo-Spacian Aqua Dolphin']:c.traits?.includes('toon')?['Mystical Space Typhoon','Harpies Feather Duster']:c.traits?.includes('god')||c.traits?.includes('trap_immune')?['Raigeki','Change of Heart','Dark Hole']:['Raigeki','Trap Hole','Change of Heart'];
const mismatches={
 'Lord of D.':'Mô tả nêu Phép/Bẫy, mã hiện chỉ bảo vệ trước Phép chọn trực tiếp Rồng.',
 'Winged Kuriboh':'Bảo vệ bật trước đòn có thể hạ quái và còn chặn phá hủy chiến đấu, rộng hơn mô tả.',
 'Chimeratech Overdragon':'Bộ chọn nguyên liệu thực tế dùng 2–3 Máy linh hoạt; công thức mẫu trên thẻ chưa thể hiện đủ.',
 'Call of the Haunted':'Mục tiêu tự lấy quái ATK gốc cao nhất; thế thủ bắt buộc; chưa ghi đủ trong mô tả ngắn.',
 'Dark Paladin':'Tự bỏ lá đầu tay, không hỏi người chơi chọn chi phí như một hiệu ứng tùy chọn.',
 'Magic Jammer':'Chi phí phản ứng tự chọn lá đầu tay, chưa bảo toàn phần Exodia theo chính sách.',
};
(async()=>{
 const pictures={},details={},audit=[];
 for(const c of data.cards){
  const src=c.art_atlas||'assets/memecard/anime-monsters-v1.png',cols=c.art_cols||6,rows=c.art_rows||4,m=await sharp(path.join(root,src)).metadata(),col=c.art_tile%cols,row=Math.floor(c.art_tile/cols);
  const left=Math.floor(col*m.width/cols),top=Math.floor(row*m.height/rows),width=Math.floor((col+1)*m.width/cols)-left,height=Math.floor((row+1)*m.height/rows)-top;
  const buffer=await sharp(path.join(root,src)).extract({left,top,width,height}).webp({quality:88}).toBuffer();
  fs.writeFileSync(path.join(full,c.id+'.webp'),buffer);await sharp(buffer).resize({width:144,height:144,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toFile(path.join(thumb,c.id+'.webp'));
  pictures[c.id]={full:'assets/memecard/pictures/'+c.id+'.webp',thumb:'assets/memecard/pictures/thumbs/'+c.id+'.webp',width,height,fallback:c.custom_image};
  if(c.uncollectible)continue;
  const combo=[...new Set([...(c.traits?.includes('exodia')?data.cards.filter(x=>x.id!==c.id&&x.traits?.includes('exodia')).map(x=>x.id):[]),...(c.fusion_materials||[]),...(refs.get(c.id)||[]),...(support[c.name_en]||[]).map(id),c.ritual_spell].filter(Boolean))];
  const condition=c.card_type==='Trap'?'Tự phản ứng sau lượt đã úp; Jinzo ngửa khóa Bẫy.':c.contact?'Nguyên liệu ngửa trên sân; không cần Phép Dung Hợp.':c.fusion_materials?'Quái còn trong Extra; đủ nguyên liệu và Phép phù hợp.':c.ritual_spell?'Cần Phép Nghi Lễ đúng tên và đủ tổng sao nguyên liệu.':c.card_type==='Spell'?'Dùng trong MAIN của bạn; mục tiêu và ô trống theo lá.':c.effect_trigger==='activated'?'Quái ngửa trên sân trong MAIN; chưa dùng hiệu ứng bản này ở lượt hiện tại.':c.special_only?c.description:'Triệu hồi thường tối đa một lần mỗi lượt. Cần '+(c.tribute_count??(c.stars>=7?2:c.stars>=5?1:0))+' quái hiến tế và ô quái hợp lệ.';
  const detail={condition,cost:cost[c.effect_code]||'Không có chi phí kích hoạt riêng; xem điều kiện triệu hồi.',limit:c.effect_trigger==='activated'?'Một lần mỗi lượt cho từng bản quái.':c.card_type==='Trap'?'Tự động theo cửa phản ứng; ưu tiên hiện tại theo vị trí ô.':c.effect_code==='thunder_search'?'Dùng từ tay trong MAIN.':'Theo điều kiện ghi trên lá.',timing:trigger[c.effect_trigger]||'Theo điều kiện trên lá',combo,counters:counters(c).map(id).filter(Boolean),origin:'Bản chuyển thể H5 hiện tại',normal:c.card_type==='Monster'&&c.monster_category==='Thường'};
  details[c.id]=detail;
  audit.push({id:c.id,name_vi:c.name,name_en:c.name_en,type:c.card_type,tribe:c.tribe,attribute:c.element,level:c.stars||0,atk:c.atk||0,def:c.def||0,rarity:c.rarity,max_copies:c.max_copies,old_effect:c.description,phase1_effect:c.description,phase2_effect:null,phase1_status:'Giữ nguyên luật và hiệu ứng; cập nhật trình bày và tra cứu.',engine_binding:{code:c.effect_code,trigger:c.effect_trigger,traits:c.traits},effects:[...(c.effect_code?[{id:c.id+':'+c.effect_code,trigger:c.effect_trigger,condition:detail.condition,cost:detail.cost,usage_limit:detail.limit,implementation:'meme_anime_rules.js',status:'legacy_binding'}]:[]),...(c.traits||[]).map(trait=>({id:c.id+':'+trait,trigger:'trait',implementation:'meme_anime_rules.js',status:'legacy_binding'}))],reference_url:c.source_url||null,anime_evidence_status:'Chưa xác minh cảnh anime cho từng hiệu ứng; không gán nguyên tác cho chỉnh sửa H5.',combo:combo.map(x=>data.cards.find(c=>c.id===x)?.name),counter:detail.counters.map(x=>data.cards.find(c=>c.id===x)?.name),review_note:mismatches[c.name_en]||'Đợt 2 cần kiểm thử ngữ nghĩa riêng và xác minh căn cứ anime.',tests_needed:['Điều kiện và chi phí','Vùng và mục tiêu hợp lệ','Tư thế và giới hạn','Miễn nhiễm và vô hiệu','Đấu máy và online']});
 }
 fs.writeFileSync(path.join(root,'assets/js/meme_card_details.js'),'window.MEME_CARD_PICTURES='+JSON.stringify(pictures)+';\nwindow.MEME_CARD_DETAILS='+JSON.stringify(details)+';\n');
 const out=path.join(root,'outputs/upgrade-phase1');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'cards-audit-156.json'),JSON.stringify({phase:1,count:audit.length,semanticsChanged:false,cards:audit},null,2));
 const headers=['ID','Tên Việt','Tên gốc','Loại','Hiệu ứng cũ','Hiệu ứng đợt 1','Hiệu ứng đợt 2','Ghi chú rà soát'];const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';fs.writeFileSync(path.join(out,'cards-audit-156.csv'),'\ufeff'+[headers,...audit.map(c=>[c.id,c.name_vi,c.name_en,c.type,c.old_effect,c.phase1_effect,'Chưa triển khai',c.review_note])].map(r=>r.map(quote).join(',')).join('\r\n'));
 console.log(`Prepared ${data.cards.length} full pictures and thumbnails; audited ${audit.length} cards with stable IDs and unchanged effects.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
