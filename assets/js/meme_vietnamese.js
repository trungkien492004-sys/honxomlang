// Display text only. Card IDs, English identifiers and gameplay rules stay stable.
(function(root){
 const overrides={
  'Celtic Guardian':'Kiếm Sĩ Yêu Tinh','Jinzo':'Người Máy Jinzo','Manga Ryu-Ran':'Rồng Truyện Tranh Ryu-Ran',
  'Elemental HERO Avian':'Anh Hùng Nguyên Tố Phong Dực','Elemental HERO Burstinatrix':'Anh Hùng Nguyên Tố Hỏa Nữ','Elemental HERO Clayman':'Anh Hùng Nguyên Tố Thạch Nhân','Elemental HERO Sparkman':'Anh Hùng Nguyên Tố Lôi Quang','Elemental HERO Neos':'Anh Hùng Nguyên Tố Tân Vũ',
  'Elemental HERO Bubbleman':'Anh Hùng Nguyên Tố Bọt Biển','Elemental HERO Wildheart':'Anh Hùng Nguyên Tố Hoang Dã','Elemental HERO Bladeedge':'Anh Hùng Nguyên Tố Lưỡi Kiếm','Elemental HERO Necroshade':'Anh Hùng Nguyên Tố Bóng Ma',
  'Elemental HERO Flame Wingman':'Anh Hùng Nguyên Tố Dực Hỏa','Elemental HERO Thunder Giant':'Anh Hùng Nguyên Tố Lôi Cự Nhân','Elemental HERO Rampart Blaster':'Anh Hùng Nguyên Tố Pháo Đài','Elemental HERO Steam Healer':'Anh Hùng Nguyên Tố Y Sĩ Hơi Nước','Elemental HERO Mudballman':'Anh Hùng Nguyên Tố Bùn Đất','Elemental HERO Shining Flare Wingman':'Anh Hùng Nguyên Tố Dực Hỏa Quang Minh','Elemental HERO Wildedge':'Anh Hùng Nguyên Tố Cuồng Đao','Elemental HERO Darkbright':'Anh Hùng Nguyên Tố Ám Quang',
  'Elemental HERO Air Neos':'Anh Hùng Nguyên Tố Tân Vũ Phong','Elemental HERO Aqua Neos':'Anh Hùng Nguyên Tố Tân Vũ Thủy','Elemental HERO Flare Neos':'Anh Hùng Nguyên Tố Tân Vũ Hỏa',
  'Neo-Spacian Air Hummingbird':'Chim Ruồi Tân Không Gian','Neo-Spacian Aqua Dolphin':'Cá Heo Tân Không Gian','Neo-Spacian Flare Scarab':'Bọ Lửa Tân Không Gian',
  'Cyber Dragon':'Rồng Máy','Cyberdark Horn':'Giác Long Cơ Khí Hắc Ám','Cyberdark Edge':'Dực Long Cơ Khí Hắc Ám','Cyberdark Keel':'Cốt Long Cơ Khí Hắc Ám','Cyberdark Dragon':'Rồng Máy Hắc Ám','Chimeratech Overdragon':'Siêu Rồng Hợp Máy',
  'Harpies Feather Duster':'Lông Vũ Yêu Điểu','Sheep Token':'Cừu Thế Thân'
 };
 const words={'Contact Fusion':'Dung Hợp Tiếp Xúc','Elemental HERO':'Anh Hùng Nguyên Tố','Neo-Spacian':'Tân Không Gian','Cyberdark':'Cơ Khí Hắc Ám','HERO':'Anh Hùng','Toon':'Hoạt Hình','Extra Deck':'bộ bài phụ','Main Deck':'bộ bài chính','Deck':'bộ bài','Extra':'bộ bài phụ','Token':'Thế Thân','Get Your Game On!':'Bắt Đầu Cuộc Đấu!','Cyber Style':'Phong Cách Rồng Máy','Red-Eyes':'Rồng Đen Mắt Đỏ','Blue-Eyes':'Rồng Trắng Mắt Xanh'};
 function makeTranslator(cards){const entries=new Map(Object.entries(words));for(const c of cards)entries.set(c.name_en,c.name_vi);const protectedNames=new Set([...entries.values()]);const keys=[...new Set([...entries.keys(),...protectedNames])].filter(Boolean).sort((a,b)=>b.length-a.length);const pattern=new RegExp(keys.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');return value=>String(value??'').replace(pattern,match=>protectedNames.has(match)?match:entries.get(match)||match);}
 if(typeof module==='object'&&module.exports)module.exports={overrides,makeTranslator};
 if(root.document){const translate=makeTranslator(root.MEME_CARDS||[]);root.memeTextVi=translate;
  const originalLog=log;log=(text,...rest)=>originalLog(translate(text),...rest);
  const originalNotify=notify;notify=(text,...rest)=>originalNotify(translate(text),...rest);
  const originalModal=showModal;showModal=(...args)=>{const result=originalModal(...args),host=document.getElementById('modalContent');if(host&&!host.querySelector('[id^="meme"]')){const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);for(let node=walker.nextNode();node;node=walker.nextNode()){const option=node.parentElement;if(option?.tagName==='OPTION'&&!option.hasAttribute('value'))option.setAttribute('value',option.value);node.nodeValue=translate(node.nodeValue);}}return result;};
 }
})(typeof window==='object'?window:globalThis);
