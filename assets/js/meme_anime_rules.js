// DM/GX anime adaptation. Every action awaits its presentation before committing its result.
(() => {
 const base=window.memeRules,deathQueue=[];let busy=false,cancelChoice=null,auto=false,origin=null,queueMatch=null;
 const aid=n=>'AN-'+n.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/_$/,'');
 // Zane/Cyber TCG text and traits. Card objects are shared with the CARDS snapshot built by meme_game.js.
 const cyberTcg={
  'AN-cyber_dragon':{description:'Nếu chỉ đối thủ kiểm soát quái: bạn có thể Triệu hồi Đặc biệt lá này từ tay.',activation_rules:'Triệu hồi Đặc biệt từ tay khi sân bạn trống và đối thủ có quái.'},
  'AN-proto_cyber_dragon':{description:'Tên lá này trở thành "Rồng Máy" khi ở trên sân (dùng được làm nguyên liệu Dung Hợp).',activation_rules:'Tên chỉ đổi khi lá ở trên sân; trong Mộ vẫn là Rồng Máy Nguyên Mẫu.'},
  'AN-cyber_phoenix':{description:'Khi lá này ở thế Tấn công: vô hiệu hóa hiệu ứng Phép/Bẫy chỉ định đúng 1 quái Máy bạn kiểm soát (và không chỉ định lá nào khác). Khi lá này bị phá hủy trong chiến đấu và được gửi vào Mộ: bạn có thể rút 1 lá.',traits:['cyber_phoenix'],activation_rules:'Hiệu ứng vô hiệu hóa là liên tục khi ở thế Tấn công; rút 1 lá khi bị phá hủy trong chiến đấu.'},
  'AN-cyber_valley':{description:'Chọn 1 hiệu ứng: (1) Khi lá này bị quái đối thủ chọn làm mục tiêu tấn công: trục xuất lá này; rút 1 lá, sau đó kết thúc Battle Phase. (2) Chọn 1 quái ngửa bạn kiểm soát và lá này; trục xuất cả hai; rút 2 lá. (3) Chọn 1 lá trong Mộ bạn; trục xuất lá này và 1 lá trên tay; đặt lá mục tiêu lên đầu Bộ bài.',effect_code:'cyber_valley',effect_trigger:'activated',traits:['cyber_valley'],activation_rules:'Kích hoạt từ sân ở MAIN 1/2 cho hiệu ứng (2) và (3); hiệu ứng (1) tự phản ứng khi bị tấn công.'},
  'AN-exploder_dragon':{description:'Nếu lá này bị phá hủy trong chiến đấu và được gửi vào Mộ: phá hủy quái đã phá hủy nó. Cả hai bên không nhận sát thương chiến đấu từ các đòn tấn công liên quan đến lá này.',activation_rules:'Tự động khi bị phá hủy trong chiến đấu; chặn toàn bộ sát thương chiến đấu của đòn đánh đó.'},
  'AN-cyberdark_horn':{description:'Nếu lá này được Triệu hồi Thường: chọn 1 Rồng cấp 3 hoặc thấp hơn trong Mộ bạn; trang bị Rồng đó cho lá này. Lá này nhận ATK bằng ATK gốc của quái được trang bị bởi hiệu ứng này. Nếu lá này tấn công quái ở thế Thủ: gây sát thương xuyên thủ. Nếu lá này sắp bị phá hủy trong chiến đấu: phá hủy quái được trang bị thay thế.',traits:['cyberdark_guard'],activation_rules:'Trang bị Rồng cấp 3 trở xuống từ Mộ khi Triệu hồi Thường; quái được trang bị bị phá hủy thay cho lá này trong chiến đấu.'},
  'AN-cyberdark_edge':{description:'Nếu lá này được Triệu hồi Thường: chọn 1 Rồng cấp 3 hoặc thấp hơn trong Mộ bạn; trang bị Rồng đó cho lá này. Lá này nhận ATK bằng ATK gốc của quái được trang bị bởi hiệu ứng này. Lá này có thể tấn công trực tiếp; nếu làm vậy, ATK của nó bị chia đôi chỉ trong lúc tính sát thương. Nếu lá này sắp bị phá hủy trong chiến đấu: phá hủy quái được trang bị thay thế.',traits:['cyberdark_guard'],activation_rules:'Trang bị Rồng cấp 3 trở xuống từ Mộ khi Triệu hồi Thường; đánh trực tiếp với ATK chia đôi; quái được trang bị bị phá hủy thay trong chiến đấu.'},
  'AN-cyberdark_keel':{description:'Nếu lá này được Triệu hồi Thường: chọn 1 Rồng cấp 3 hoặc thấp hơn trong Mộ bạn; trang bị Rồng đó cho lá này. Lá này nhận ATK bằng ATK gốc của quái được trang bị bởi hiệu ứng này. Nếu lá này phá hủy quái đối thủ trong chiến đấu: gây 300 sát thương cho đối thủ. Nếu lá này sắp bị phá hủy trong chiến đấu: phá hủy quái được trang bị thay thế.',traits:['cyberdark_guard'],activation_rules:'Trang bị Rồng cấp 3 trở xuống từ Mộ khi Triệu hồi Thường; gây 300 sát thương khi hạ quái; quái được trang bị bị phá hủy thay trong chiến đấu.'},
  'AN-cyberdark_dragon':{description:'Giác Long Cơ Khí Hắc Ám + Dực Long Cơ Khí Hắc Ám + Cốt Long Cơ Khí Hắc Ám. Không thể Triệu hồi Đặc biệt ngoại trừ Dung Hợp. Khi được Triệu hồi Đặc biệt: chọn 1 Rồng trong Mộ bạn; trang bị cho lá này. Lá này nhận ATK bằng ATK của quái được trang bị và thêm 100 ATK cho mỗi quái trong Mộ bạn. Nếu lá này sắp bị phá hủy trong chiến đấu: phá hủy quái được trang bị thay thế.',traits:['cyberdark_guard'],activation_rules:'Chỉ Triệu hồi Dung Hợp; trang bị 1 Rồng từ Mộ khi xuất hiện; quái được trang bị bị phá hủy thay trong chiến đấu.'},
  'AN-cyber_twin_dragon':{description:'Rồng Máy + Rồng Máy. Chỉ có thể Dung Hợp bằng đúng nguyên liệu trên. Lá này có thể tấn công lần thứ hai trong mỗi Battle Phase.',activation_rules:'Dung Hợp từ Extra bằng 2 Rồng Máy; tấn công tối đa 2 lần mỗi lượt.'},
  'AN-cyber_end_dragon':{description:'Rồng Máy + Rồng Máy + Rồng Máy. Chỉ có thể Dung Hợp bằng đúng nguyên liệu trên. Nếu lá này tấn công quái ở thế Thủ: gây sát thương xuyên thủ.',activation_rules:'Dung Hợp từ Extra bằng 3 Rồng Máy; gây sát thương xuyên thủ.'},
  'AN-chimeratech_overdragon':{description:'Rồng Máy hoặc Rồng Máy Nguyên Mẫu + 1+ quái Máy. Phải được Triệu hồi Dung Hợp. Khi được Triệu hồi Dung Hợp: gửi tất cả các lá khác bạn kiểm soát xuống Mộ. ATK/DEF gốc của lá này bằng số nguyên liệu Dung Hợp ×800. Mỗi lượt, lá này có thể tấn công quái đối thủ số lần bằng số nguyên liệu Dung Hợp.',activation_rules:'Dung Hợp linh hoạt 1 Rồng Máy + 1–2 quái Máy; khi xuất hiện gửi hết lá khác bạn kiểm soát xuống Mộ; chỉ tấn công trực tiếp 1 lần.'}
 };
 for(const x of window.MEME_CARDS||[]){const p=cyberTcg[x.id];if(!p)continue;const t=p.traits?[...new Set([...(x.traits||[]),...p.traits])]:null;Object.assign(x,p);if(t)x.traits=t;}
 // Kaiba / Blue-Eyes TCG text and traits.
 const kaibaTcg={
  'AN-lord_of_d':{description:'Cả hai người chơi không thể chọn quái Rồng trên sân làm mục tiêu của hiệu ứng bài.',activation_rules:'Hiệu ứng liên tục khi ở trên sân; chặn mọi hiệu ứng bài chọn quái Rồng làm mục tiêu, kể cả của chủ sở hữu.'},
  'AN-the_flute_of_summoning_dragon':{description:'Triệu hồi Đặc biệt tối đa 2 quái Rồng từ tay. "Chúa Tể Loài Rồng" phải ở trên sân để kích hoạt và giải quyết hiệu ứng này.',activation_rules:'Dùng trong MAIN khi Chúa Tể Loài Rồng đang ngửa trên sân bạn; gọi tối đa 2 Rồng từ tay.'},
  'AN-xyz_dragon_cannon':{description:'Pháo X + Đầu Rồng Y + Xe Tăng Z. Phải được Triệu hồi Đặc biệt lần đầu từ bộ bài phụ bằng cách trục xuất các lá trên bạn kiểm soát (không dùng Dung Hợp). Không thể Triệu hồi Đặc biệt từ Mộ. Bạn có thể bỏ 1 lá, sau đó chọn 1 lá đối thủ kiểm soát; phá hủy lá đó.',activation_rules:'Hợp thể X + Y + Z từ sân và trục xuất chúng; bỏ 1 lá để phá 1 lá đối thủ, không giới hạn số lần mỗi lượt; không hồi sinh từ Mộ.',tcg:true,tcg_once:false,noRevive:true},
  'AN-blue_eyes_shining_dragon':{description:'Không thể Triệu hồi Thường/Úp. Phải được Triệu hồi Đặc biệt từ tay bằng cách hiến tế Rồng Trắng Ba Đầu. Lá này tăng 300 ATK cho mỗi quái Rồng trong Mộ bạn. Khi một lá hoặc hiệu ứng được kích hoạt chọn lá này làm mục tiêu (Hiệu ứng Nhanh): bạn có thể vô hiệu hóa hiệu ứng đó.',activation_rules:'Chỉ gọi đặc biệt từ tay bằng cách hiến tế Rồng Trắng Ba Đầu; tự động vô hiệu hiệu ứng bài chọn lá này làm mục tiêu.'},
  'AN-dragon_master_knight':{description:'Chiến Sĩ Hỗn Mang + Rồng Trắng Ba Đầu. Phải được Triệu hồi Dung Hợp. Lá này tăng 500 ATK cho mỗi quái Rồng bạn kiểm soát, trừ lá này.'},
  'AN-blue_eyes_ultimate_dragon':{description:'Rồng Trắng Mắt Xanh + Rồng Trắng Mắt Xanh + Rồng Trắng Mắt Xanh. Quái Dung Hợp không có hiệu ứng.'},
  'AN-twin_headed_thunder_dragon':{description:'Rồng Sấm + Rồng Sấm. Quái Dung Hợp không có hiệu ứng.'},
  'AN-thunder_dragon':{description:'Bỏ lá này từ tay; lấy tối đa 2 Rồng Sấm từ bộ bài lên tay.'}
 };
 const applyKaibaTcg=()=>{for(const x of window.MEME_CARDS||[]){const p=kaibaTcg[x.id];if(!p)continue;const t=p.traits?[...new Set([...(x.traits||[]),...p.traits])]:null;Object.assign(x,p);if(t)x.traits=t;if(x.id==='AN-blue_eyes_ultimate_dragon'||x.id==='AN-twin_headed_thunder_dragon')x.traits=(x.traits||[]).filter(t=>t!=='attack_all'&&t!=='piercing');}};
 applyKaibaTcg();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyKaibaTcg,{once:true});
 // Jaden / Elemental HERO + Neo-Spacian TCG text. H5-only traits are stripped below.
 const heroTcg={
  'AN-elemental_hero_bubbleman':{description:'Nếu lá này là lá duy nhất trên tay bạn: bạn có thể Triệu hồi Đặc biệt lá này từ tay. Khi lá này được Triệu hồi: bạn có thể rút 2 lá, nhưng bạn phải không kiểm soát lá nào khác và không có lá nào trên tay để kích hoạt và giải quyết hiệu ứng này.'},
  'AN-elemental_hero_wildheart':{description:'Lá này không bị ảnh hưởng bởi hiệu ứng Bẫy.',activation_rules:'Hiệu ứng liên tục khi ở trên sân; miễn nhiễm mọi hiệu ứng Bẫy, kể cả Bẫy không chỉ định.'},
  'AN-elemental_hero_bladeedge':{description:'Nếu lá này tấn công quái ở thế Thủ: gây sát thương xuyên thủ cho đối thủ.'},
  'AN-elemental_hero_necroshade':{description:'Một lần, khi lá này ở trong Mộ: 1 quái "Anh Hùng Nguyên Tố" cấp 5 trở lên bạn Triệu hồi Thường có thể được Triệu hồi mà không cần hiến tế.',activation_rules:'Dùng trong Mộ, không cần kích hoạt; lá vẫn nằm trong Mộ sau khi dùng, mỗi bản sao cho phép một lần.'},
  'AN-winged_kuriboh':{description:'Nếu lá này trên sân bị phá hủy và được gửi vào Mộ: trong phần còn lại của lượt này, bạn không nhận sát thương chiến đấu.'},
  'AN-neo_spacian_air_hummingbird':{description:'Một lần/lượt: bạn có thể hồi 500 LP cho mỗi lá trên tay đối thủ.'},
  'AN-neo_spacian_aqua_dolphin':{description:'Một lần/lượt: bạn có thể bỏ 1 lá; xem tay đối thủ và chọn 1 quái. Nếu bạn kiểm soát quái có ATK lớn hơn hoặc bằng ATK của lá đã chọn: phá hủy lá đó, và nếu làm vậy, gây 500 sát thương cho đối thủ. Nếu không, bạn nhận 500 sát thương.'},
  'AN-neo_spacian_flare_scarab':{description:'Lá này tăng 400 ATK cho mỗi Phép/Bẫy đối thủ kiểm soát.'},
  'AN-elemental_hero_flame_wingman':{description:'Anh Hùng Nguyên Tố Phong Dực + Anh Hùng Nguyên Tố Hỏa Nữ. Phải được Triệu hồi Dung Hợp. Khi lá này phá hủy quái trong chiến đấu và gửi vào Mộ: gây sát thương cho đối thủ bằng ATK của quái bị phá hủy trong Mộ.'},
  'AN-elemental_hero_thunder_giant':{description:'Anh Hùng Nguyên Tố Lôi Quang + Anh Hùng Nguyên Tố Thạch Nhân. Phải được Triệu hồi Dung Hợp. Một lần/lượt: bạn có thể bỏ 1 lá, sau đó chọn 1 quái ngửa trên sân có ATK gốc nhỏ hơn ATK của lá này; phá hủy mục tiêu đó.'},
  'AN-elemental_hero_rampart_blaster':{description:'Anh Hùng Nguyên Tố Thạch Nhân + Anh Hùng Nguyên Tố Hỏa Nữ. Phải được Triệu hồi Dung Hợp. Lá này có thể tấn công khi đang ở thế Thủ ngửa, nhưng chỉ khi đối thủ không kiểm soát quái nào; nếu làm vậy, ATK của lá này bị chia đôi chỉ trong lúc tính sát thương.'},
  'AN-elemental_hero_steam_healer':{description:'Anh Hùng Nguyên Tố Hỏa Nữ + Anh Hùng Nguyên Tố Bọt Biển. Phải được Triệu hồi Dung Hợp. Khi lá này phá hủy quái trong chiến đấu và gửi vào Mộ: hồi LP bằng ATK của quái bị phá hủy trong Mộ.'},
  'AN-elemental_hero_mudballman':{description:'Anh Hùng Nguyên Tố Bọt Biển + Anh Hùng Nguyên Tố Thạch Nhân. Quái Dung Hợp không có hiệu ứng.'},
  'AN-elemental_hero_shining_flare_wingman':{description:'Anh Hùng Nguyên Tố Dực Hỏa + Anh Hùng Nguyên Tố Lôi Quang. Phải được Triệu hồi Dung Hợp. Lá này tăng 300 ATK cho mỗi lá "Anh Hùng Nguyên Tố" trong Mộ bạn. Khi lá này phá hủy quái trong chiến đấu và gửi vào Mộ: gây sát thương cho đối thủ bằng ATK của quái bị phá hủy trong Mộ.'},
  'AN-elemental_hero_wildedge':{description:'Anh Hùng Nguyên Tố Hoang Dã + Anh Hùng Nguyên Tố Lưỡi Kiếm. Phải được Triệu hồi Dung Hợp. Lá này có thể tấn công mỗi quái đối thủ kiểm soát (mỗi quái 1 lần trong mỗi Battle Phase).'},
  'AN-elemental_hero_darkbright':{description:'Anh Hùng Nguyên Tố Lôi Quang + Anh Hùng Nguyên Tố Bóng Ma. Phải được Triệu hồi Dung Hợp. Nếu lá này tấn công quái ở thế Thủ: gây sát thương xuyên thủ. Nếu lá này tấn công: chuyển nó sang thế Thủ vào cuối Damage Step. Nếu lá này bị phá hủy: chọn 1 quái đối thủ; phá hủy mục tiêu đó.'},
  'AN-elemental_hero_air_neos':{description:'Anh Hùng Nguyên Tố Tân Vũ + Chim Ruồi Tân Không Gian. Chỉ có thể Triệu hồi Đặc biệt từ bộ bài phụ bằng cách đưa các nguyên liệu trên về bộ bài (không dùng Dung Hợp). Khi LP của bạn thấp hơn đối thủ, lá này tăng ATK bằng chênh lệch. Lá này trở về bộ bài phụ vào End Phase.'},
  'AN-elemental_hero_aqua_neos':{description:'Anh Hùng Nguyên Tố Tân Vũ + Cá Heo Tân Không Gian. Chỉ có thể Triệu hồi Đặc biệt từ bộ bài phụ bằng cách đưa các nguyên liệu trên về bộ bài (không dùng Dung Hợp). Một lần/lượt: bạn có thể bỏ 1 lá; phá hủy 1 lá ngẫu nhiên trên tay đối thủ. Trong End Phase: đưa lá này về bộ bài phụ.'},
  'AN-elemental_hero_flare_neos':{description:'Anh Hùng Nguyên Tố Tân Vũ + Bọ Lửa Tân Không Gian. Chỉ có thể Triệu hồi Đặc biệt từ bộ bài phụ bằng cách đưa các nguyên liệu trên về bộ bài (không dùng Dung Hợp). Lá này tăng 400 ATK cho mỗi Phép/Bẫy trên sân. Trong End Phase: đưa lá này về bộ bài phụ.'},
  'AN-miracle_fusion':{description:'Triệu hồi Dung Hợp 1 quái Dung Hợp "Anh Hùng Nguyên Tố" từ bộ bài phụ bằng cách trục xuất các nguyên liệu ghi trên lá từ sân hoặc Mộ bạn.'},
  'AN-skyscraper':{description:'Nếu một quái "Anh Hùng Nguyên Tố" tấn công quái có ATK cao hơn, quái tấn công tăng 1000 ATK chỉ trong lúc tính sát thương.',activation_rules:'Hiệu ứng liên tục của Phép Môi Trường; chỉ áp dụng trong lúc tính sát thương.'}
 };
 // Anime catalog shipped every HERO with the same Attribute; restore the official ones.
 const heroElement={'AN-elemental_hero_avian':'Phong','AN-elemental_hero_burstinatrix':'Hỏa','AN-elemental_hero_clayman':'Địa','AN-elemental_hero_sparkman':'Quang','AN-elemental_hero_neos':'Quang','AN-elemental_hero_bubbleman':'Thủy','AN-elemental_hero_wildheart':'Địa','AN-elemental_hero_bladeedge':'Địa','AN-elemental_hero_necroshade':'Ám','AN-elemental_hero_flame_wingman':'Phong','AN-elemental_hero_thunder_giant':'Quang','AN-elemental_hero_rampart_blaster':'Địa','AN-elemental_hero_steam_healer':'Thủy','AN-elemental_hero_mudballman':'Địa','AN-elemental_hero_shining_flare_wingman':'Quang','AN-elemental_hero_wildedge':'Địa','AN-elemental_hero_darkbright':'Ám','AN-elemental_hero_air_neos':'Phong','AN-elemental_hero_aqua_neos':'Thủy','AN-elemental_hero_flare_neos':'Hỏa','AN-neo_spacian_air_hummingbird':'Phong','AN-neo_spacian_aqua_dolphin':'Thủy','AN-neo_spacian_flare_scarab':'Hỏa'};
 const applyHeroTcg=()=>{for(const x of window.MEME_CARDS||[]){const p=heroTcg[x.id],el=heroElement[x.id];if(!p&&!el)continue;const t=p?.traits?[...new Set([...(x.traits||[]),...p.traits])]:null;if(p)Object.assign(x,p);if(el)x.element=el;if(t)x.traits=t;if(x.id==='AN-elemental_hero_mudballman')x.traits=(x.traits||[]).filter(t=>t!=='hero_guard');}};
 applyHeroTcg();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyHeroTcg,{once:true});
 const S=n=>{const s=side(n);s.banished??=[];return s;},E=n=>base.entries(n),face=s=>s&&s.position!=='def_down'&&!s.faceDown,has=(s,t)=>base.trait(s,t),hero=c=>/\bHERO\b/i.test(c?.name_en||''),dragon=c=>c?.tribe==='Rồng',machine=c=>c?.tribe==='Máy',amazoness=c=>/\bAmazoness\b/.test(c?.name_en||''),isRedEyes=c=>/Red-Eyes/i.test(c?.name_en||'')||c?.id==='AN-red_eyes_black_dragon'||/Mắt Đỏ/i.test(c?.name||''),darkSpellcaster=c=>c?.element==='Ám'&&c?.tribe==='Pháp Sư',necroCopies=n=>S(n).grave.filter(id=>id===aid('Elemental HERO Necroshade')).length;
 const free=n=>S(n).monsters.indexOf(null),allFields=()=>['player','enemy'].flatMap(n=>E(n).map(e=>({...e,name:n,id:e.slot.id,type:e.extra?'extra':'monster'}))),extraOpen=n=>{const s=S(n);return !s.extra||s.monsters.includes(null)};
 function placeOnField(n,slot){const s=S(n);if(!s.extra){s.extra=slot;return{extra:true,index:-1};}const i=s.monsters.indexOf(null);if(i<0)return null;s.monsters[i]=slot;return{extra:false,index:i};}
 const lpFee=amount=>window.memeLpCosts?.fixed(amount)??amount,payLp=(n,amount,id)=>window.memeLpCosts?window.memeLpCosts.pay(n,amount,id):(S(n).lp>amount?(S(n).lp-=amount,true):false);
 function uid(slot){slot.uid??='anime-'+(duel.uidSeq=(duel.uidSeq||0)+1);return slot.uid;}
 function targetList(n,p=()=>true){return E(n).filter(e=>p(e.slot,card(e.slot.id))).map(e=>({...e,id:e.slot.id,name:n,type:e.extra?'extra':'monster'}));}
 function spellList(n){return S(n).spells.map((slot,index)=>({slot,index,id:slot?.id,name:n,type:'spell'})).filter(e=>e.slot).concat(S(n).field?[{slot:S(n).field,index:-1,id:S(n).field.id,name:n,type:'field'}]:[]);}
 function choices(ids,zone){return ids.map((id,index)=>({id,index,zone}));}
 function choiceLocation(e,n){if(e.zone==='banished')return 'Đang bị trục xuất · Lá '+(e.index+1);if(e.location)return e.location;const ordinal=e.index>=0?' · Lá '+(e.index+1):'';if(e.zone==='grave')return `Trong Mộ${e.from?' · '+(e.from===n?'của bạn':'đối thủ'):''}${ordinal}`;if(e.zone==='hand')return 'Trên tay'+ordinal;if(e.zone==='deck')return 'Trong Deck'+ordinal;if(e.zone==='extra')return 'Extra Deck'+ordinal;if(e.name||e.zone==='field')return `${!e.name||e.name===n?'Trên sân của bạn':'Trên sân đối thủ'} · ${e.type==='field'?'Môi trường':e.type==='spell'?'Phép/Bẫy':e.extra?'Ô Extra':'Quái'}${e.index>=0?' · Ô '+(e.index+1):''}`;return '';}
 let manualTraps=false;
 // Old saved preferences must not bring back the removed trap-mode switch.
 localStorage.removeItem('meme-manual-traps');
 async function pick(n,title,options,{optional=false,cheap=false,reaction=false,remote=false,previewIndex=null,text='Chọn một lá để tiếp tục.'}={}){
  if(!options.length||!duel||duel.finished||window.memeTurnClock?.expired()&&!window.memeTurnClock?.forcing)return null;
  if(window.memeServerChoice)return window.memeServerChoice(n,title,options,{optional,cheap,reaction,text});
  if(reaction)return window.memePhase2?memePhase2.choose(n,title,options,{reaction:true}):options[0];
  if(n==='enemy'&&!auto&&!remote&&window.memeOnlineIsPlaying?.()&&window.memeDecision){const match=duel,key=await window.memeDecision.request({title,text,reaction,options:options.map((e,key)=>({key,id:e.hidden?null:e.id,hidden:!!e.hidden,label:e.label,zone:e.zone,priorityScore:e.priorityScore,location:choiceLocation(e,n)}))});return duel===match&&!duel.finished&&Number.isInteger(key)?options[key]||null:null;}
  if(n!=='player'||auto)return window.memePhase2?memePhase2.choose(n,title,options,{cheap,reaction}):[...options].sort((a,b)=>(cheap?1:-1)*((card(a.id)?.atk||0)-(card(b.id)?.atk||0)))[0];
  return new Promise(resolve=>{
   const match=duel;let done=false,selected=-1;
   const finish=x=>{if(done)return;done=true;cancelChoice=null;closeModal();resolve(x);};
   showModal(`<h2>${esc(title)}</h2><p>${esc(text)} Bấm lá bài để xem, rồi xác nhận.</p><div class="choice-confirm-body"><div id="animeChoices" class="arcana-choice-list" aria-label="Các lá có thể chọn"></div><section id="animeChoicePreview" class="choice-preview" aria-label="Thông tin lá đang chọn" aria-live="polite"><p class="choice-preview-empty">Chọn một lá để xem ảnh và hiệu ứng.</p></section></div><div class="choice-confirm-actions"><button id="animeChoiceCancel" class="secondary-btn" type="button">${optional?'Bỏ qua':'Hủy thao tác'}</button><button id="animeChoiceConfirm" class="primary-btn" type="button" disabled>Xác nhận</button></div>`);
   $('modal').querySelector('.modal-card').classList.add('arcana-choice','confirm-choice-modal');
   cancelChoice=()=>finish(null);
   function preview(key){
    selected=key;const option=options[key],c=option.hidden?null:card(option.id),location=choiceLocation(option,n);
    for(const b of $('animeChoices').children){const chosen=Number(b.dataset.choiceKey)===key;b.classList.toggle('chosen',chosen);b.setAttribute('aria-pressed',String(chosen));}
    const knownSlot=!option.hidden&&option.slot,owner=option.name||n;
    const stats=c?.card_type==='Monster'?`<p class="choice-preview-stats">★ ${c.stars||0} · ATK ${knownSlot?effectiveAtk(owner,option.slot):c.atk} / DEF ${knownSlot?effectiveDef(owner,option.slot):c.def}</p>`:'';
    $('animeChoicePreview').innerHTML=option.hidden?`<div class="choice-preview-hidden" aria-hidden="true">🂠</div><h3>Bài úp</h3><p class="choice-preview-location">${esc(location)}</p><p>Nội dung lá đối thủ đang úp được giữ kín.</p>`:`<div class="choice-preview-top">${c?artHTML(c.id,'choice-preview-art'):''}<div><h3>${esc(c?.name||option.label||'Lựa chọn')}</h3>${option.label?`<b class="choice-preview-label">${esc(option.label)}</b>`:''}<p class="choice-preview-location">${esc(location)}</p>${stats}<small>${esc(c?.tribe||c?.spell_category||c?.trap_category||'')}</small></div></div>${c?`<h4>Hiệu ứng</h4><p class="choice-preview-effect">${esc(c.description||'Quái thường. Không có hiệu ứng.')}</p>${c.activation_rules?`<h4>Điều kiện sử dụng</h4><p>${esc(c.activation_rules)}</p>`:''}`:''}`;
    $('animeChoicePreview').scrollTop=0;$('animeChoiceConfirm').disabled=false;$('animeChoiceConfirm').setAttribute('aria-label','Xác nhận chọn '+(option.hidden?'bài úp':c?.name||option.label||'lựa chọn'));
   }
   for(const [key,option]of options.entries()){
    const c=card(option.id),b=document.createElement('button');b.type='button';b.className='arcana-option';b.dataset.choiceKey=key;b.setAttribute('aria-pressed','false');
    if(!option.hidden&&c)b.dataset.cardId=c.id;if(option.position)b.dataset.position=option.position;
    b.innerHTML=`${option.hidden?'<span class="pile-art">🂠</span>':artHTML(option.id,'pile-art')}<span><b>${esc(option.hidden?'Bài úp':option.label||c?.name||option.id)}</b><small>${esc(choiceLocation(option,n)||c?.tribe||'')}${option.hidden?' · Nội dung được giữ kín':''}</small></span>`;
    b.onclick=()=>preview(key);$('animeChoices').appendChild(b);
   }
   if(Number.isInteger(previewIndex)&&previewIndex>=0&&previewIndex<options.length)preview(previewIndex);
   $('animeChoiceConfirm').onclick=()=>{if(selected<0||done)return;if(duel!==match||duel.finished||window.memeTurnClock?.expired()&&!window.memeTurnClock?.forcing)return finish(null);finish(options[selected]);};
   $('animeChoiceCancel').onclick=()=>finish(null);
  });
 }
 async function pickMany(n,title,options,{min=1,max=options.length,validSets=null,levelAtLeast=0,requireField=false,optional=false,cheap=false,remote=false,text='Chọn các lá cần dùng, rồi xác nhận một lần.'}={}){
  max=Math.min(max,options.length);if(!duel||duel.finished||!options.length||max<min)return null;
  const match=duel,config={multiple:true,min,max,validSets,levelAtLeast,requireField,optional,cheap,text};
  const valid=keys=>Array.isArray(keys)&&new Set(keys).size===keys.length&&keys.length>=min&&keys.length<=max&&keys.every(k=>Number.isInteger(k)&&k>=0&&k<options.length)&&(!validSets||validSets.some(set=>set.length===keys.length&&keys.every(k=>set.includes(k))))&&(!levelAtLeast||keys.reduce((sum,k)=>sum+(card(options[k].id)?.stars||0),0)>=levelAtLeast)&&(!requireField||keys.some(k=>options[k].zone==='field'));
  const fallback=()=>{if(validSets)return validSets.find(valid)||null;const pool=options.map((e,key)=>({e,key})).sort((a,b)=>(cheap?1:-1)*((card(a.e.id)?.atk||0)-(card(b.e.id)?.atk||0))),keys=[];for(const x of pool){if(keys.length>=max)break;keys.push(x.key);if(valid(keys)&&keys.length>=Math.max(min,levelAtLeast?min:max))return keys;}return valid(keys)?keys:null;};
  const finishKeys=keys=>duel===match&&!duel.finished&&valid(keys)?keys.map(k=>options[k]):null;
  if(window.memeServerChoice){const chosen=await window.memeServerChoice(n,title,options,{...config,fallbackKeys:fallback()});return Array.isArray(chosen)?finishKeys(chosen.map(e=>options.indexOf(e))):null;}
  if(n==='enemy'&&!auto&&!remote&&window.memeOnlineIsPlaying?.()&&window.memeDecision){const keys=await window.memeDecision.request({title,text,multiple:config,options:options.map((e,key)=>({key,id:e.hidden?null:e.id,hidden:!!e.hidden,label:e.label,zone:e.zone,location:choiceLocation(e,n)}))});return finishKeys(keys);}
  if(n!=='player'||auto)return finishKeys(fallback());
  if(window.memeTurnClock?.expired()&&!window.memeTurnClock?.forcing)return null;
  return new Promise(resolve=>{
   let done=false;const selected=new Set();const finish=value=>{if(done)return;done=true;cancelChoice=null;closeModal();resolve(value);};
   showModal(`<h2>${esc(title)}</h2><p>${esc(text)} Bấm lại lá đã chọn để bỏ chọn.</p><div id="multiChoiceStatus" role="status" aria-live="polite"></div><div class="choice-confirm-body"><div id="animeChoices" class="arcana-choice-list multi-choice-list" aria-label="Chọn nhiều lá"></div><section id="animeChoicePreview" class="choice-preview" aria-label="Thông tin lá bài"><p>Chọn lá để xem thông tin.</p></section></div><div class="choice-confirm-actions"><button id="animeChoiceCancel" class="secondary-btn" type="button">${optional?'Bỏ qua':'Hủy thao tác'}</button><button id="animeChoiceConfirm" class="primary-btn" type="button" disabled>Xác nhận</button></div>`);
   $('modal').querySelector('.modal-card').classList.add('arcana-choice','confirm-choice-modal');cancelChoice=()=>finish(null);
   const update=()=>{const keys=[...selected],ok=valid(keys),levels=keys.reduce((sum,k)=>sum+(card(options[k].id)?.stars||0),0);$('multiChoiceStatus').textContent=`Đã chọn ${keys.length} · ${min===max?'Cần '+min:'Chọn '+min+'–'+max} lá${levelAtLeast?' · '+levels+'/'+levelAtLeast+' sao':''}${keys.length&&!ok?' · Chưa đủ điều kiện':''}`;$('animeChoiceConfirm').disabled=!ok;$('animeChoiceConfirm').textContent=`Xác nhận${keys.length?' ('+keys.length+')':''}`;for(const b of $('animeChoices').children){const key=Number(b.dataset.choiceKey),chosen=selected.has(key);b.classList.toggle('chosen',chosen);b.setAttribute('aria-pressed',String(chosen));const extendable=!validSets||validSets.some(set=>keys.every(k=>set.includes(k))&&set.includes(key));b.disabled=!chosen&&(keys.length>=max||!extendable);}};
   for(const [key,e]of options.entries()){const c=e.hidden?null:card(e.id),b=document.createElement('button');b.type='button';b.className='arcana-option';b.dataset.choiceKey=key;b.setAttribute('aria-pressed','false');if(c)b.dataset.cardId=c.id;b.innerHTML=`${c?artHTML(c.id,'pile-art'):'<span class="pile-art">🂠</span>'}<span><b>${esc(e.hidden?'Bài úp':e.label||c?.name||e.id)}</b><small>${esc(choiceLocation(e,n))}</small></span><span class="multi-check" aria-hidden="true">✓</span>`;b.onclick=()=>{if(selected.has(key))selected.delete(key);else if(selected.size<max)selected.add(key);$('animeChoicePreview').innerHTML=c?`<div class="choice-preview-top">${artHTML(c.id,'choice-preview-art')}<div><h3>${esc(c.name)}</h3><p class="choice-preview-location">${esc(choiceLocation(e,n))}</p>${c.card_type==='Monster'?`<p>★ ${c.stars||0} · ATK ${c.atk} / DEF ${c.def}</p>`:''}</div></div><p>${esc(c.description||'Quái thường.')}</p>`:'<h3>Bài đối thủ đang úp</h3><p>Nội dung được giữ kín.</p>';$('animeChoicePreview').scrollTop=0;update();};$('animeChoices').appendChild(b);}
   $('animeChoiceConfirm').onclick=()=>{if(done||!valid([...selected]))return;if(duel!==match||duel.finished||window.memeTurnClock?.expired()&&!window.memeTurnClock?.forcing)return finish(null);finish(finishKeys([...selected]));};$('animeChoiceCancel').onclick=()=>finish(null);update();
  });
 }
 async function fx(n,c,kind,targets,commit,extra={}){
  if(!duel)return false;const match=duel;duel.animeMatchId??='anime-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);duel.animeSerial=(duel.animeSerial||0)+1;
  const event={serial:duel.animeSerial,owner:n,cardId:c?.id||null,kind,title:c?.name||'',text:kind==='fusion'?'Nguyên liệu hội tụ — Dung Hợp!':kind==='revive'?'Linh hồn trở lại chiến trường':kind==='destroy'?'Sức mạnh được giải phóng':kind==='negate'?'Hiệu ứng bị vô hiệu':c?.description||'',targets:(targets||[]).map(t=>({name:t.name||other(n),type:t.type||'monster',index:t.index??0})),...extra};
  if(window.memeTextVi){event.title=window.memeTextVi(event.title);event.text=window.memeTextVi(event.text);}
  const publicEvent=kind==='set'?{...event,cardId:null,title:'Bài được đặt úp',text:'Nội dung được giữ kín.'}:event;duel.animeEvents=[...(duel.animeEvents||[]),publicEvent].slice(-24);
  const apply=async()=>{if(duel!==match)return;const previous=origin;origin=c;try{await commit();await window.memeCardMotion?.flush();}finally{origin=previous;}if(duel===match){checkWin();}};
  if(window.memeFx?.resolveCard)return window.memeFx.resolveCard(event,apply);await apply();render();return true;
 }
 function enqueue(fn){if(queueMatch!==duel){deathQueue.length=0;queueMatch=duel;}deathQueue.push(fn);}
 const graveGuards=[];
 function guardRemoval(n,slot,reason){for(const guard of graveGuards)if(guard(n,slot,reason))return true;return false;}
 async function flush(){let count=0;while(deathQueue.length&&duel&&!duel.finished&&duel===queueMatch&&count++<40)await deathQueue.shift()();if(count>=40||duel!==queueMatch)deathQueue.length=0;}
 function sentToGrave(n,id,byEffect=true,reason=byEffect?'effect':'other'){if(card(id)?.effect_code==='p3_shadow_mist')enqueue(()=>shadowMist(n,false));if(byEffect&&card(id)?.effect_code==='masked_fountain')enqueue(()=>fountainSet(n));if(window.memeAnime?.onSentToGrave)enqueue(()=>window.memeAnime.onSentToGrave(n,id,byEffect,reason));}
 async function fountainSet(n){const s=S(n),c=card('MGX-masked_hero_fountain');if(s.maskedFountainGraveRound===duel.round||!s.spells.includes(null))return false;const options=[...choices(s.deck,'deck'),...choices(s.grave,'grave')].filter(e=>card(e.id)?.name_en==='Mask Change');const t=await pick(n,'Suối Nguồn: úp Biến Đổi Mặt Nạ',options,{optional:true});if(!t)return false;return fx(n,c,'set',[],()=>{const pool=t.zone==='deck'?s.deck:s.grave;if(pool[t.index]!==t.id)return;pool.splice(t.index,1);s.spells[s.spells.indexOf(null)]={id:t.id,faceDown:true,setRound:duel.round};s.maskedFountainGraveRound=duel.round;if(t.zone==='deck')s.deck=shuffle(s.deck);});}
 async function shadowMist(n,special){const s=S(n),c=card('MGX-elemental_hero_shadow_mist');if(s.shadowMistUsedRound===duel.round)return false;
  const options=choices(s.deck,'deck').filter(e=>{const x=card(e.id);return special?x?.card_type==='Spell'&&/Change/.test(x.name_en||'')&&(x.quick_play||['Tốc Công','Quick-Play'].includes(x.spell_category)):x?.card_type==='Monster'&&/\bHERO\b/.test(x.name_en||'')&&x.name_en!=='Elemental HERO Shadow Mist';});
  const t=await pick(n,special?'Sương Mù Bóng Đêm: lấy Phép Change':'Sương Mù Bóng Đêm: lấy 1 HERO khác',options,{optional:true});if(!t||s.shadowMistUsedRound===duel.round)return false;
  return fx(n,c,'search',[],()=>{if(s.deck[t.index]!==t.id)return;s.shadowMistUsedRound=duel.round;window.memeCardMotion?.record('search',n,t.id);s.hand.push(s.deck.splice(t.index,1)[0]);s.deck=shuffle(s.deck);});
 }
 async function woodsman(n,slot){if(!face(slot)||!E(n).some(e=>e.slot===slot)||slot.woodsmanUsedRound===duel.round)return false;const s=S(n),options=[...choices(s.deck,'deck'),...choices(s.grave,'grave')].filter(e=>e.id===aid('Polymerization'));
  const t=await pick(n,'Mộc Nhân: lấy Dung Hợp từ Deck hoặc Mộ',options,{optional:true});if(!t)return false;return fx(n,card(slot.id),'search',[],()=>{const pool=t.zone==='deck'?s.deck:s.grave;if(pool[t.index]!==t.id)return;slot.woodsmanUsedRound=duel.round;window.memeCardMotion?.record(t.zone==='deck'?'search':'recover',n,t.id);s.hand.push(pool.splice(t.index,1)[0]);if(t.zone==='deck')s.deck=shuffle(s.deck);});
 }
 async function perform(fn){if(window.memeTurnClock?.expired()&&!window.memeTurnClock?.forcing)return false;if(busy||window.memeFx?.busy||!duel||duel.finished)return false;const match=duel;if(queueMatch!==match){deathQueue.length=0;queueMatch=match;}busy=true;render();try{const v=await fn();checkWin();await flush();return v;}finally{busy=false;if(duel===match){match.animePublishTurnEnd=true;render();match.animePublishTurnEnd=false;}}}
 function usable(n,c){return c?.card_type==='Monster'&&!c.special_only&&!c.uncollectible&&c.deck_zone!=='Extra';}
 function drawCards(n,count){for(let i=0;i<count&&!duel.finished;i++)if(!draw(n))break;}
 const checkBase=checkWin;checkWin=()=>{checkBase();if(!duel||duel.finished)return;const parts=CARDS.filter(c=>c.traits?.includes('exodia')).map(c=>c.id);for(const n of ['player','enemy'])if(!duel.exodiaQueued&&parts.length===5&&parts.every(id=>S(n).hand.includes(id))){duel.exodiaQueued=true;duel.exodiaWinner=n;deathQueue.push(()=>fx(n,card(aid('Exodia the Forbidden One')),'exodia',[],()=>finish(n,'EXODIA — đủ 5 phần trên tay!'),{materials:parts}));break;}};
 function stat(n,slot,kind='atk'){
  if(window.memeTcgEngine?.active())return window.memeTcgEngine.stat(n,slot,kind);
  if(!slot)return 0;const c=card(slot.id),s=S(n),foe=S(other(n));if(!c)return 0;
  let value=base.stat(n,slot,kind);if(slot.statAtk!=null)value=(kind==='atk'?slot.statAtk:slot.statDef??c.def)+(kind==='atk'&&slot.tempRound===duel.round?(slot.tempAtk||0):0);
  if(has(slot,'slifer'))value=s.hand.length*1000;if(has(slot,'relinquished'))value=kind==='atk'?slot.absorbAtk||0:slot.absorbDef||0;
  if(has(slot,'chimeratech'))value=(slot.materialCount||2)*800;
  if(has(slot,'pet_dragon'))value+=300*allFields().filter(e=>face(e.slot)&&(e.slot.id===aid('Harpie Lady')||has(e.slot,'harpie_name'))).length;
  if(has(slot,'amazon_paladin'))value+=100*E(n).filter(e=>e.slot!==slot&&face(e.slot)&&amazoness(card(e.slot.id))).length;
  if(kind==='atk'){
   if(slot.swapRound===duel.round&&slot.swapAtk!=null)value=slot.swapAtk;
   if(amazoness(c)&&s.field&&card(s.field.id)?.effect_code==='amazon_village')value+=200;
   if(c.tribe==='Chim'&&c.element==='Phong'&&s.field&&card(s.field.id)?.effect_code==='hunting_ground')value+=200;
   if(has(slot,'amazon_tiger'))value+=400*E(n).filter(e=>e.slot!==slot&&face(e.slot)&&amazoness(card(e.slot.id))).length;
   if(has(slot,'dark_girl'))value+=300*[...s.grave,...foe.grave].filter(id=>[aid('Dark Magician'),aid('Magician of Black Chaos')].includes(id)).length;
   if(has(slot,'buster'))value+=500*[...E(other(n)).map(e=>e.slot.id),...foe.grave].filter(id=>dragon(card(id))).length;
   if(has(slot,'paladin'))value+=500*[...allFields().map(e=>e.id),...s.grave,...foe.grave].filter(id=>dragon(card(id))).length;
   if(has(slot,'shining_dragon'))value+=300*s.grave.filter(id=>dragon(card(id))).length;
   if(has(slot,'shining_flare'))value+=300*s.grave.filter(id=>hero(card(id))).length;
   if(has(slot,'dragon_master'))value+=500*E(n).filter(e=>e.slot!==slot&&dragon(card(e.slot.id))).length;
   if(has(slot,'scarab'))value+=400*spellList(other(n)).length;if(has(slot,'flare_neos'))value+=400*(spellList(n).length+spellList(other(n)).length);
   if(has(slot,'air_neos'))value+=Math.max(0,foe.lp-s.lp);if(has(slot,'cyberdark_dragon'))value+=100*s.grave.filter(id=>card(id)?.card_type==='Monster').length;
   for(const e of [...spellList(n),...spellList(other(n))])if(e.slot.equippedTo&&e.slot.equippedTo===slot.uid){const x=card(e.id);if(!x.traits?.includes('megamorph'))value+=e.slot.equipValue??x.effect_value??0;}
   value+=window.memeEquipRules?.megamorphDelta(n,slot)||0;value+=(slot.powerAtk||0)+(slot.attackBonus||0);
  }else for(const e of [...spellList(n),...spellList(other(n))])if(e.slot.equippedTo===slot.uid&&slot.uid&&card(e.id).traits?.includes('metalmorph'))value+=300;
  if(kind==='atk'){
   if(c.effect_code==='p3_zero')value+=500*allFields().filter(e=>e.slot!==slot&&face(e.slot)&&card(e.id).element==='Thủy').length;
   if(c.effect_code==='p3_shining')value+=300*[...s.banished,...foe.banished].filter(id=>/\bHERO\b/.test(card(id)?.name_en||'')).length;
   if(c.effect_code==='p3_escuridao')value+=100*s.grave.filter(id=>hero(card(id))).length;
   if(c.effect_code==='masked_koga')value+=500*E(other(n)).length;
   if(c.effect_code==='dl_brave_neos')value+=100*s.grave.filter(id=>/\bHERO\b/.test(card(id)?.name_en||'')||/Neo-Spacian/.test(card(id)?.name_en||'')).length;
   if(E(n).some(e=>face(e.slot)&&card(e.slot.id)?.effect_code==='dl_hero_sunrise'))value+=200*new Set(E(n).filter(e=>face(e.slot)).map(e=>card(e.slot.id)?.element)).size;
   if(slot.favoriteHero&&s.field)value+=card(slot.id)?.def||0;
   value+=(slot.mangaAtkDelta||0)+(slot.mangaTempRound===duel.round?slot.mangaTempAtk||0:0);
   if([...spellList(n),...spellList(other(n))].some(e=>e.slot&&!e.slot.faceDown&&(e.slot.halvedUids||[]).includes(slot.uid)))value=Math.floor(value/2);
  }else value+=(slot.mangaDefDelta||0)+(slot.mangaTempRound===duel.round?slot.mangaTempDef||0:0);
  return Math.max(0,Math.round(value));
 }
 // XYZ (ZEXAL): same-Level materials, overlay units stored on slot.materials.
 function levelOf(slot){const c=card(slot?.id);if(!c)return 0;if(slot.levelFixed!=null)return slot.levelFixed;if(slot.levelOverrideRound===duel.round)return slot.levelOverride??(c.stars||0);return c.stars||0;}
 function xyzReq(id){return card(id)?.xyz_requirement||null;}
 function xyzPool(n,id){const req=xyzReq(id);if(!req)return[];const rank=req.rank??card(id)?.rank;return E(n).filter(e=>face(e.slot)&&card(e.slot.id)?.card_type==='Monster'&&card(e.slot.id)?.monster_category!=='Xyz'&&levelOf(e.slot)===rank);}
 function xyzOptions(n,id){const req=xyzReq(id);if(!req)return[];const pool=xyzPool(n,id),count=Math.max(1,req.materials||2),options=[];const walk=(start,chosen)=>{if(chosen.length===count){options.push(chosen);return;}for(let i=start;i<pool.length;i++)walk(i+1,[...chosen,pool[i]]);};walk(0,[]);return options;}
 function xyzDetach(n,slot,index=0){if(!slot?.materials?.length)return null;const id=slot.materials.splice(Math.max(0,Math.min(index,slot.materials.length-1)),1)[0];S(n).grave.push(id);sentToGrave(n,id,true,'material');return id;}
 function xyzDump(n,slot){if(!slot?.materials?.length)return;for(const id of slot.materials.splice(0)){S(n).grave.push(id);sentToGrave(n,id,true,'material');}}
 async function xyzSummon(n,id){const s=S(n),c=card(id),req=xyzReq(id);if(!c||!req||s.noSpecialRound===duel.round)return false;const combos=xyzOptions(n,id);if(!combos.length)return false;
  const pool=[];for(const combo of combos)for(const e of combo)if(!pool.some(x=>x.slot===e.slot))pool.push(e);
  const validSets=combos.map(set=>set.map(e=>pool.findIndex(x=>x.slot===e.slot)));
  const rank=req.rank??c.rank;
  const picked=await pickMany(n,'XYZ · '+c.name,pool.map(e=>({...e,id:e.slot.id,zone:'field'})),{min:req.materials||2,max:req.materials||2,validSets,text:'Chọn đúng '+(req.materials||2)+' quái ngửa cùng Cấp '+rank+' để chồng lên nhau.'});
  if(!picked?.length)return false;
  const mats=picked.map(e=>e.slot);
  let summoned=null;
  const done=await fx(n,c,'summon',[],()=>{
   for(const mat of mats){const entry=E(n).find(e=>e.slot===mat);if(!entry)continue;if(entry.extra)s.extra=null;else s.monsters[entry.index]=null;}
   const at=s.extraDeck.indexOf(c.id);if(at<0)return;s.extraDeck.splice(at,1);
   const slot={...monsterSlot(c.id),properlySummoned:true,xyzSummoned:true,rank,materials:picked.map(e=>e.id)};
   uid(slot);if(placeOnField(n,slot)){summoned=slot;log(`✦ XYZ: ${c.name} (Rank ${rank}) xuất hiện với ${slot.materials.length} nguyên liệu!`);}else s.extraDeck.push(c.id);
  },{materials:picked.map(e=>e.id),title:'XYZ TRIỆU HỒI',text:c.name+' · Rank '+rank});
  if(done&&summoned)await postSummon(n,summoned,'xyz');
  return !!summoned;
 }
 function ownerOf(slot){return ['player','enemy'].find(n=>E(n).some(e=>e.slot===slot))||duel.turn;}
 function attackLimit(slot){const n=ownerOf(slot);return has(slot,'double_attack')?2:has(slot,'chimeratech')?E(other(n)).length?slot.materialCount||2:1:has(slot,'attack_all')?slot.attackAllLimit||Math.max(1,E(other(n)).length):1;}
 function canAttack(slot){if(!slot||!duel||duel.round<=1)return false;const n=ownerOf(slot);if(window.memeTcgEngine?.attackProblem(n,slot))return false;if(has(slot,'rampart')&&slot.position==='def'&&E(other(n)).length)return false;if((slot.position!=='atk'&&!(has(slot,'rampart')&&slot.position==='def'))||(slot.frozenUntil??-1)>=duel.round)return false;if(allFields().some(e=>face(e.slot)&&has(e.slot,'restrict')&&e.slot!==slot))return false;if(spellList(other(n)).some(e=>e.slot.turnsLeft>0&&card(e.id)?.effect_code==='swords'))return false;return (slot.attacksUsed||0)<attackLimit(slot);}
 function damage(n,amount){if(duel.battleContext){const c=duel.battleContext;if(S(n).battleShieldRound===duel.round||S(n).battleDamageShieldRound===duel.round||c.owner===n&&has(c.attacker,'rocket')||has(c.attacker,'exploder')||c.defender&&has(c.defender,'exploder')||c.owner===n&&has(c.attacker,'amazon_fighter')||c.defender&&has(c.defender,'amazon_fighter')&&n!==c.owner)return 0;}return base.damage(n,amount);}
 function clearSpell(n,index){const s=S(n),slot=index===-1?s.field:s.spells[index];if(!slot)return;if(!slot.banishOnLeave&&guardRemoval(n,slot,'effect'))return;if(index===-1)s.field=null;else s.spells[index]=null;(slot.banishOnLeave?S(slot.originalOwner||n).banished:S(slot.originalOwner||n).grave).push(slot.id);if(!slot.banishOnLeave)sentToGrave(slot.originalOwner||n,slot.id,true,'effect');if(card(slot.id)?.effect_code==='toon_world')for(const e of [...E(n)])if(has(e.slot,'toon'))remove(n,e,'effect');if(slot.absorbedTo){const source=allFields().find(e=>e.slot.uid===slot.absorbedTo)?.slot;if(source){source.absorbAtk=0;source.absorbDef=0;}}if(slot.revivalUid){const e=E(n).find(e=>e.slot.uid===slot.revivalUid);if(e)remove(n,e,'effect');}
 if(card(slot.id)?.effect_code==='snatch_steal'){const e=allFields().find(x=>x.slot.uid===slot.equippedTo&&x.slot.snatchStolen&&x.slot.homeOwner);if(e){const original=e.slot.homeOwner;delete e.slot.snatchStolen;delete e.slot.homeOwner;if(e.extra)S(e.name).extra=null;else S(e.name).monsters[e.index]=null;if(free(original)>=0)S(original).monsters[free(original)]=e.slot;else{S(original).grave.push(e.slot.id);sentToGrave(original,e.slot.id,true,'effect');}log(`🔙 Cướp Đoạt hết hiệu lực: ${card(e.slot.id).name} trở về với chủ cũ.`);}}}
 function remove(n,entry,reason='effect'){
  if(!entry?.slot)return false;const s=S(n),slot=entry.slot,c=card(slot.id);if(!E(n).some(e=>e.slot===slot))return false;
  if(reason==='effect'&&face(slot)&&c.effect_code==='masked_vapor'){
   log(`🛡 ${c.name} không bị phá bởi hiệu ứng.`);
   window.showEffectNotice?.({
     cardId: slot.id,
     title: '🛡 Kháng Hiệu Ứng: ' + c.name,
     text: c.name + ' không thể bị phá hủy bởi hiệu ứng bài!',
     owner: n,
     icon: '🛡'
   });
   return false;
  }
  if(reason==='effect'&&s.effectShieldRound===duel.round){
   log(`🛡 ${c.name} không thể bị phá hủy bởi hiệu ứng (Gagagaguard).`);
   window.showEffectNotice?.({cardId:slot.id,title:'🛡 Gagagaguard: '+c.name,text:c.name+' không thể bị phá hủy bởi hiệu ứng lá bài trong lượt này!',owner:n,icon:'🛡'});
   return false;
  }
  if(reason==='battle'&&slot.halfUnbreakRound===duel.round){
   log(`🛡 ${c.name} không thể bị phá hủy bởi chiến đấu (Nửa Bất Diệt).`);
   window.showEffectNotice?.({cardId:slot.id,title:'🛡 Nửa Bất Diệt: '+c.name,text:c.name+' không thể bị phá hủy bởi chiến đấu trong lượt này!',owner:n,icon:'🛡'});
   return false;
  }
  if(reason==='battle'&&has(slot,'gogogo_guard')&&slot.gogogoRound!==duel.round){
   slot.gogogoRound=duel.round;
   log(`🛡 ${c.name} chặn lần phá hủy chiến đấu trong lượt này.`);
   window.showEffectNotice?.({cardId:slot.id,title:'🛡 Người Đá Gogogo: '+c.name,text:c.name+' không thể bị phá hủy bởi chiến đấu một lần mỗi lượt!',owner:n,icon:'🛡'});
   return false;
  }
  if(reason==='battle'&&(s.battleShieldRound===duel.round||has(slot,'rocket')&&duel.battleContext?.attacker===slot))return false;
  if(reason==='battle'&&has(slot,'legacy_guard')&&!slot.legacyGuardUsed){
   slot.legacyGuardUsed=true;
   log(`🛡 ${c.name} chặn lần phá hủy chiến đấu đầu tiên.`);
   window.showEffectNotice?.({
     cardId: slot.id,
     title: '🛡 Bảo Hộ: ' + c.name,
     text: c.name + ' chặn lần phá hủy chiến đấu đầu tiên trong trận đấu!',
     owner: n,
     icon: '🛡'
   });
   return false;
  }
  if(reason==='battle'&&has(slot,'cyberdark_guard')){
   const equipped=spellList(n).find(e=>e.slot.cyberdarkEquip&&e.slot.equippedTo===slot.uid);
   if(equipped){
     clearSpell(n,equipped.index);
     log(`🛡 ${c.name}: ${card(equipped.id).name} bị phá hủy thay.`);
     window.showEffectNotice?.({
       cardId: equipped.id,
       title: '🛡 Đỡ Đòn Thay Thế: ' + card(equipped.id).name,
       text: card(equipped.id).name + ' bị phá hủy thay cho ' + c.name + '!',
       owner: n,
       icon: '🛡'
     });
     return false;
   }
  }
  if(reason==='battle'&&amazoness(c)&&E(n).some(e=>face(e.slot)&&has(e.slot,'amazon_battleproof'))){
   log(`🛡 ${c.name} không thể bị phá hủy trong chiến đấu (Nữ Hoàng Amazoness bảo hộ).`);
   window.showEffectNotice?.({
     cardId: slot.id,
     title: '🛡 Bảo Hộ Amazoness: ' + c.name,
     text: c.name + ' không thể bị phá hủy trong chiến đấu khi Nữ Hoàng Amazoness còn trên sân!',
     owner: n,
     icon: '🛡'
   });
   return false;
  }
  if(['battle','effect'].includes(reason)&&guardRemoval(n,slot,reason))return false;
  if(entry.extra)s.extra=null;else s.monsters[entry.index]=null;const destination=slot.originalOwner||slot.homeOwner||n;if(!slot.token)(slot.banishOnLeave?S(destination).banished:S(destination).grave).push(slot.id);
  if(!slot.token&&!slot.banishOnLeave)sentToGrave(destination,slot.id,['effect','material','effect_cost'].includes(reason),reason);
  if(slot.xyzSummoned&&slot.materials?.length)xyzDump(destination,slot);
  if(reason==='battle'&&has(slot,'ganbara_knight')){const a=duel.battleContext?.attacker;if(a&&a!==slot&&a.position==='atk'&&allFields().some(e=>e.slot===a)){a.position='def';log(`🛡 Hiệp Sĩ Ganbara: ${card(a.id)?.name||'quái tấn công'} chuyển sang thế Thủ.`);}}
  if(window.memeTcgEngine?.active())window.memeTcgEngine.onLeave(n,slot,reason,!slot.token&&!slot.banishOnLeave);
  if(c.effect_code==='p3_shining'&&!slot.banishOnLeave&&!slot.token)deathQueue.push(async()=>{
   const options=choices(S(destination).banished,'banished').filter(e=>/\bHERO\b/.test(card(e.id)?.name_en||''));if(options.length<2)return;
   const picked=await pickMany(destination,'Ánh Sáng Rực Rỡ: chọn 2 HERO để thu hồi',options,{min:2,max:2,optional:true});if(!picked)return;
   await fx(destination,c,'search',[],()=>{for(const e of picked.sort((a,b)=>b.index-a.index)){const list=S(destination).banished;if(list[e.index]!==e.id)continue;list.splice(e.index,1);(card(e.id).deck_zone==='Extra'?S(destination).extraDeck:S(destination).hand).push(e.id);}});
  });
  if(['battle','effect'].includes(reason)&&!slot.banishOnLeave&&!slot.token){
   if(has(slot,'winged_kuriboh'))s.battleDamageShieldRound=duel.round;
   if(c.effect_trigger==='on_destroy'&&(!['Cyber Phoenix','Amazoness Chain Master'].includes(c.name_en)||reason==='battle'))deathQueue.push(()=>resolveEffect(n,c,{source:slot}));
   if(has(slot,'chimera'))deathQueue.push(async()=>{const t=await pick(n,'Chimera: hồi sinh Gazelle hoặc Berfomet',choices(s.grave,'grave').filter(e=>[aid('Berfomet'),aid('Gazelle the King of Mythical Beasts')].includes(e.id)));if(t&&free(n)>=0){const position=await revivalPosition(n,c,t.id);if(!position)return;let slot;await fx(n,c,'revive',[],()=>{slot=revive(n,n,t.id,position);});if(slot)await postSummon(n,slot);}});
   if(has(slot,'darkbright'))deathQueue.push(()=>destroyChoice(n,c));
   if(reason==='battle'&&has(slot,'exploder')){const opponent=duel.battleContext?.attacker===slot?duel.battleContext?.defender:duel.battleContext?.attacker;deathQueue.push(async()=>{const x=allFields().find(e=>e.slot===opponent);if(x)await fx(n,c,'destroy',[x],()=>remove(x.name,x,'effect'));});}
   const isDestroyedRedEyes=(isRedEyes(c)||/Red-Eyes/i.test(c?.name_en||'')||c?.id==='AN-red_eyes_black_dragon')&&(c?.stars||0)<=7;
   const destSide=S(destination);
   if(isDestroyedRedEyes&&destSide.hand.includes('DL-red_eyes_retro_dragon')&&free(destination)>=0){
    deathQueue.push(async()=>{
     if(!destSide.hand.includes('DL-red_eyes_retro_dragon')||free(destination)<0)return;
     let useRetro=false;
     if(destination==='player'){
      const chosen=await pick('player','Bất ngờ: Kích hoạt Rồng Cổ Xưa Mắt Đỏ từ tay?',[{
       id:'DL-red_eyes_retro_dragon',
       label:'✦ Triệu hồi Rồng Cổ Xưa & Hồi sinh '+c.name
      }],{optional:true,reaction:true,text:`Khi quái Mắt Đỏ Cấp 7 hoặc thấp hơn bị phá hủy: triệu hồi đặc biệt lá này từ tay và hồi sinh [${c.name}]!`});
      if(chosen)useRetro=true;
     }else{useRetro=true;}
     if(useRetro){
      const rIdx=destSide.hand.indexOf('DL-red_eyes_retro_dragon');
      if(rIdx>=0){
       destSide.hand.splice(rIdx,1);
       const retroSlot=monsterSlot('DL-red_eyes_retro_dragon','def');
       uid(retroSlot);
       const f1=free(destination);
       if(f1>=0){
        destSide.monsters[f1]=retroSlot;
        log(`🦖 Rồng Cổ Xưa Mắt Đỏ xuất hiện từ tay ở thế thủ!`);
        await fx(destination,card('DL-red_eyes_retro_dragon'),'summon',[{name:destination,index:f1}],()=>{});
        const gIdx=destSide.grave.lastIndexOf(c.id);
        if(gIdx>=0&&free(destination)>=0){
         destSide.grave.splice(gIdx,1);
         const revivedSlot=monsterSlot(c.id,'def');
         uid(revivedSlot);
         const f2=free(destination);
         if(f2>=0){
          destSide.monsters[f2]=revivedSlot;
          log(`🔥 Rồng Cổ Xưa hồi sinh ${c.name} trở lại sân!`);
          await fx(destination,card(c.id),'revive',[{name:destination,index:f2}],()=>{});
          window.showEffectNotice?.({
           cardId:'DL-red_eyes_retro_dragon',
           title:'🦖 HIỆU ỨNG TỪ TAY: RỒNG CỔ XƯA MẮT ĐỎ',
           text:`Triệu hồi Rồng Cổ Xưa từ tay và hồi sinh [${c.name}] ở thế thủ!`,
           owner:destination,
           icon:'🦖'
          });
         }
        }
       }
      }
     }
    });
   }
   if(c.id==='DL-red_eyes_baby_dragon'&&reason==='battle'&&free(destination)>=0){
    deathQueue.push(async()=>{
     const pool=choices(destSide.deck,'deck').filter(e=>{
      const x=card(e.id);
      return x&&(isRedEyes(x)||/Red-Eyes/i.test(x.name_en||'')||x.id==='AN-red_eyes_black_dragon')&&(x.stars||0)<=7&&x.deck_zone!=='Extra';
     });
     if(!pool.length||free(destination)<0)return;
     const target=destination==='player'?await pick('player','Rồng Con Mắt Đỏ: chọn 1 quái Mắt Đỏ từ Bộ bài',pool,{optional:true}):pool[0];
     if(!target)return;
     const posture=destination==='player'?await pick('player','Rồng Con Mắt Đỏ: chọn tư thế triệu hồi',[{id:target.id,position:'atk',label:'Thế công'},{id:target.id,position:'def',label:'Thế thủ'}]):{position:'atk'};
     const dIdx=destSide.deck.indexOf(target.id);
     if(dIdx>=0&&free(destination)>=0){
      destSide.deck.splice(dIdx,1);
      destSide.deck=shuffle(destSide.deck);
      const babySlot=monsterSlot(target.id,posture?.position||'atk');
      uid(babySlot);
      const bPos=free(destination);
      if(bPos>=0){
       destSide.monsters[bPos]=babySlot;
       log(`🐣 Rồng Con Mắt Đỏ gọi đặc biệt ${card(target.id).name} từ Bộ bài!`);
       await fx(destination,card(target.id),'summon',[{name:destination,index:bPos}],()=>{});
      }
     }
    });
   }
   if(reason==='battle'&&amazoness(c)&&s.field&&card(s.field.id)?.effect_code==='amazon_village'&&s.villageRound!==duel.round){
    s.villageRound=duel.round;
    deathQueue.push(async()=>{
     const options=choices(s.grave,'grave').filter(e=>e.id!==c.id&&card(e.id)?.card_type==='Monster'&&amazoness(card(e.id))&&!card(e.id).uncollectible&&!card(e.id).noRevive);
     if(!options.length||free(n)<0)return;
     const t=await pick(n,'Làng Amazoness: chọn Amazoness trong Mộ để hồi sinh',options,{optional:true});if(!t)return;
     const position=await revivalPosition(n,c,t.id);if(!position)return;
     let revivedSlot;await fx(n,c,'revive',[],()=>{revivedSlot=revive(n,n,t.id,position);});
     if(revivedSlot)await postSummon(n,revivedSlot);
    });
   }
  }
  return true;
 }
 function cleanEquipment(){if(!duel)return;const uids=new Set(allFields().map(e=>e.slot.uid).filter(Boolean));for(const n of ['player','enemy'])S(n).spells.forEach((slot,i)=>{if(slot?.equippedTo&&!uids.has(slot.equippedTo))clearSpell(n,i);});}
 const renderBase=render;render=()=>{cleanEquipment();renderBase();};
 function revive(n,from,id,position='def'){const s=S(n),i=S(from).grave.indexOf(id);if(!['atk','def'].includes(position)||i<0||free(n)<0||card(id)?.card_type!=='Monster'||card(id)?.uncollectible||card(id)?.noRevive)return null;S(from).grave.splice(i,1);const slot={...monsterSlot(id,position),revived:true,originalOwner:from};uid(slot);s.monsters[free(n)]=slot;if(spellList(n).some(e=>!e.slot.faceDown&&card(e.id)?.effect_code==='safe_return'))enqueue(()=>fx(n,card(aid('Card of Safe Return')),'draw',[],()=>drawCards(n,1),{text:'Lá Bài Trở Về An Toàn: rút 1 lá.'}));return slot;}
 async function revivalPosition(n,source,id,{remote=false}={}){const match=duel;if(['atk','def'].includes(source?.revival_position))return source.revival_position;const c=card(id);if(window.memeServerMode){const t=await pick(n,'Hồi sinh '+c.name+' · Chọn tư thế',[{id,position:'atk',label:'Thế công'},{id,position:'def',label:'Thế thủ'}]);return t?.position||null;}if(n==='enemy'&&!auto&&!remote&&window.memeOnlineIsPlaying?.()&&window.memeRevivalChoice){const selected=await window.memeRevivalChoice.request({sourceId:source.id,cardId:id});return duel===match&&!duel.finished&&window.memeOnlineIsPlaying?.()?selected:null;}if(n!=='player'||auto)return c.atk>=c.def?'atk':'def';const selected=await pick(n,'Hồi sinh '+c.name+' · Chọn tư thế',[{id,position:'atk',label:'⚔ Thế công · ATK '+c.atk},{id,position:'def',label:'🛡 Thế thủ · DEF '+c.def}],{text:remote?'Bạn chọn và xác nhận trong tối đa 12 giây. Hết giờ hoặc bỏ qua sẽ hủy lựa chọn hồi sinh; đồng hồ lượt vẫn chạy.':'Chọn tư thế ngửa khi trở lại sân. Hủy sẽ không dùng lá hoặc trả chi phí.'});return duel===match&&!duel.finished?selected?.position||null:null;}
 async function discard(n,title,filter=()=>true){return pick(n,title,choices(S(n).hand,'hand').filter(e=>filter(card(e.id),e)),{cheap:true});}
 function takeDiscard(n,entry){if(!entry)return;const s=S(n),i=entry.zone==='hand'&&s.hand[entry.index]===entry.id?entry.index:s.hand.indexOf(entry.id);if(i>=0){window.memeCardMotion?.record('discard',n,entry.id,entry.zone==='hand'?entry.index:i);const id=s.hand.splice(i,1)[0];s.grave.push(id);sentToGrave(n,id,!!origin?.effect_code,origin?.effect_code?'effect_cost':'discard');}}
 function trapLocked(){return allFields().some(e=>face(e.slot)&&has(e.slot,'jinzo'));}
 function trapEntries(n,codes,filter=()=>true){if(trapLocked())return[];return S(n).spells.map((slot,index)=>({slot,index,id:slot?.id,c:card(slot?.id),name:n,type:'spell'})).filter(e=>e.slot?.faceDown&&e.slot.setRound<duel.round&&codes.includes(e.c?.effect_code)&&filter(e));}
 async function chooseTrap(n,codes,filter=()=>true,context='',event={}){let entries=trapEntries(n,codes,filter);if(window.memePhase2)entries=memePhase2.rankTraps(n,entries,event);return pick(n,'Chọn Bẫy để phản ứng',entries,{optional:true,reaction:true,text:context+' Chọn Bẫy muốn dùng, hoặc Bỏ qua để tiếp tục. Bẫy vừa úp chưa được kích hoạt.'});}
 async function trapUse(n,entry,targets,commit,depth=0){if(!entry||S(n).spells[entry.index]!==entry.slot||!entry.slot.faceDown||trapLocked())return false;const match=duel;entry.slot.faceDown=false;window.memePhase2?.trace(n,entry.id,'declared',depth);
  if(entry.c.effect_code==='seven_tools'){if(S(n).lp<=lpFee(1000)){entry.slot.faceDown=true;return false;}await fx(n,entry.c,'cost',[{name:n,type:'lp'}],()=>{payLp(n,1000,entry.id);window.memePhase2?.trace(n,entry.id,'cost',depth);},{text:`Trả ${lpFee(1000)} LP để phản công. Chi phí vẫn trả nếu bị vô hiệu.`});}
  if(entry.c.effect_code==='magic_jammer'){const cost=entry.activationDiscard;if(!cost||!S(n).hand.includes(cost.id)){entry.slot.faceDown=true;return false;}await fx(n,entry.c,'cost',[],()=>{takeDiscard(n,cost);window.memePhase2?.trace(n,entry.id,'cost',depth);},{materials:[cost.id],text:'Bỏ 1 lá để kích hoạt Bẫy Phá Phép. Chi phí không hoàn lại nếu bị vô hiệu.'});}
  let negated=false;const counter=depth<5?await chooseTrap(other(n),['seven_tools'],()=>S(other(n)).lp>lpFee(1000),entry.c.name+' đang kích hoạt.',{kind:'trap',cardId:entry.id}):null;
  if(counter)await trapUse(other(n),counter,[entry],()=>{negated=true;},depth+1);if(duel!==match||duel.finished)return false;
  if(negated){await fx(other(n),counter.c,'negate',[entry],()=>{clearSpell(n,entry.index);window.memePhase2?.trace(n,entry.id,'negated',depth);},{counterDepth:depth+1,text:'Phản Bẫy thành công — hiệu ứng gốc bị vô hiệu.'});return false;}
  await fx(n,entry.c,'trap',targets,async()=>{if(entry.c.trap_category==='Liên Tục')entry.slot.faceDown=false;else clearSpell(n,entry.index);await commit();window.memePhase2?.trace(n,entry.id,'resolved',depth);},{counterDepth:depth});return true;}
 async function dustTarget(n){return pick(n,'Chọn Phép/Bẫy đối thủ để phá hủy',spellList(other(n)).map(e=>({...e,hidden:!!e.slot.faceDown})));}
 async function hauntedTarget(n){if(free(n)<0)return null;return pick(n,'Chọn quái trong Mộ để hồi sinh thế thủ',choices(S(n).grave,'grave').filter(e=>card(e.id)?.card_type==='Monster'&&!card(e.id).uncollectible&&!card(e.id).noRevive).map(e=>({...e,zone:'grave'})));}
 async function negateSpell(n,c){const foe=other(n),event={kind:'spell',cardId:c.id};
 if(!trapLocked()){const io=['player','enemy'].find(w=>spellList(w).some(e=>!e.slot.faceDown&&card(e.id)?.effect_code==='imperial_order'));if(io){await fx(io,card(aid('Imperial Order')),'negate',[],()=>{}, {text:'Sắc Lệnh Đế Quốc đang mở: mọi Phép bị vô hiệu.'});return true;}}
 const ioSet=await chooseTrap(foe,['imperial_order'],()=>true,c.name+' đang kích hoạt.',event);
 if(ioSet){let flipped=false;await trapUse(foe,ioSet,[],()=>{flipped=true;});if(flipped)return true;}
 const t=await chooseTrap(foe,['magic_jammer'],()=>S(foe).hand.length>0,c.name+' đang kích hoạt.',event),cost=t&&await discard(foe,'Bẫy Phá Phép: chọn lá bỏ làm chi phí');if(t&&cost){let stopped=false;await trapUse(foe,{...t,activationDiscard:cost},[],()=>{stopped=true;});if(stopped)return true;}const pal=E(foe).find(e=>face(e.slot)&&has(e.slot,'paladin')),worth=!window.memePhase2||memePhase2.rankTraps(foe,[{id:aid('Magic Jammer')}],event)[0]?.priorityScore>0;if(pal&&S(foe).hand.length&&worth){const cost=await discard(foe,'Kỵ Sĩ Rồng: chọn lá bỏ để vô hiệu Phép');if(cost){await fx(foe,card(pal.slot.id),'negate',[],()=>takeDiscard(foe,cost));return true;}}const dust=await chooseTrap(foe,['dust_tornado'],()=>spellList(n).length>0,c.name+' đang kích hoạt.',event);if(dust){const target=await dustTarget(foe);if(target)await trapUse(foe,dust,[target],()=>clearSpell(n,target.index));}return false;}
 async function postSummon(n,slot,kind='special'){
  if(!slot||!E(n).some(e=>e.slot===slot)||duel.finished)return;const c=card(slot.id);await window.memeTcgEngine?.onSummon(n,slot,kind);if(kind==='flip'){if(c.effect_trigger==='on_flip'||c.effect_code==='search_gazelle')await resolveEffect(n,c,{source:slot,kind});}else if(c.effect_trigger==='on_summon')await resolveEffect(n,c,{source:slot,kind});
  if(c.traits.includes('bubbleman')&&S(n).bubbleDrawRound!==duel.round&&E(n).length===1&&!S(n).hand.length&&!S(n).spells.some(Boolean)&&!S(n).field){S(n).bubbleDrawRound=duel.round;await fx(n,c,'draw',[],()=>drawCards(n,2),{text:'Bọt Biển: rút 2 lá vì tay trống và không còn lá nào khác.'});}
  if(kind==='special'&&c.effect_code==='p3_shadow_mist')enqueue(()=>shadowMist(n,true));
  if(kind!=='flip')for(const e of E(other(n)))if(face(e.slot)&&has(e.slot,'slifer')&&slot.position==='atk'&&E(n).some(e=>e.slot===slot))await fx(other(n),card(e.slot.id),'destroy',[{name:n,index:S(n).monsters.indexOf(slot)}],()=>{slot.powerAtk=(slot.powerAtk||0)-2000;if(stat(n,slot)===0){const self=E(n).find(x=>x.slot===slot);if(self)remove(n,self,'effect');}});
  if(kind!=='flip'&&(c.id===aid('Harpie Lady')||has(slot,'harpie_name'))&&S(n).field&&card(S(n).field.id)?.effect_code==='hunting_ground'){
   const groundTargets=spellList(other(n)).filter(e=>e.slot);
   if(groundTargets.length){const t=await pick(n,'Thánh Địa Săn Mồi: chọn Phép/Bẫy đối thủ để phá hủy',groundTargets.map(e=>({...e,hidden:!!e.slot.faceDown})),{optional:true});if(t)await fx(n,card(S(n).field.id),'destroy',[t],()=>clearSpell(other(n),t.index));}
  }
  const hole=E(n).some(e=>e.slot===slot)&&!has(slot,'god')&&!has(slot,'trap_immune')?await chooseTrap(other(n),['trap_hole','torrential'],e=>e.c.effect_code==='torrential'||['normal','flip'].includes(kind)&&stat(n,slot)>=1000&&spellTargetAllowed(other(n),e.c,{slot,id:slot.id,name:n}),c.name+' vừa được triệu hồi.',{kind:'summon',summonKind:kind,cardId:c.id,atk:stat(n,slot)}):null;if(hole)await trapUse(other(n),hole,[{name:n,index:S(n).monsters.indexOf(slot)}],()=>{if(hole.c.effect_code==='torrential'){for(const e of allFields())if(!has(e.slot,'god')&&!has(e.slot,'trap_immune')&&e.slot.sparkRound!==duel.round)remove(e.name,e,'effect');}else{const current=E(n).find(e=>e.slot===slot);if(current)remove(n,current,'effect');}});
 }
 async function changePosition(n,index,extra=false){const slot=extra?S(n).extra:S(n).monsters[index];if(!slot||duel.finished||duel.turn!==n||!['MAIN1','MAIN2'].includes(duel.phase)||duel.mode||slot.summonedRound>=duel.round||slot.changedPositionRound===duel.round||slot.attacksUsed||allFields().some(e=>e.slot!==slot&&face(e.slot)&&has(e.slot,'restrict')))return false;const flip=slot.position==='def_down',c=card(slot.id);await fx(n,c,flip?'flip':'position',[{name:n,index,type:extra?'extra':'monster'}],()=>{slot.position=slot.position==='atk'?'def':'atk';delete slot.faceDown;slot.changedPositionRound=duel.round;},{text:flip?'Triệu hồi Lật · '+c.name:'Đổi tư thế · '+c.name});if(flip)await postSummon(n,slot,'flip');return true;}
 function materialPool(n,mode='fusion'){
  const s=S(n);if(mode==='miracle')return [...E(n).map(e=>({...e,id:e.slot.id,zone:'field'})),...choices(s.grave,'grave').map(e=>({...e,zone:'grave'}))];
  return [...choices(s.hand,'hand').map(e=>({...e,zone:'hand'})),...E(n).map(e=>({...e,id:e.slot.id,zone:'field'}))];
 }
 function materialName(e){if(e.zone==='field'&&face(e.slot)&&has(e.slot,'proto_cyber'))return aid('Cyber Dragon');return e.zone!=='hand'&&card(e.id)?.traits?.includes('blue_eyes_name')?aid('Blue-Eyes White Dragon'):e.id;}
 function materialReq(req,e){if(typeof req==='string')return materialName(e)===req;const x=card(e.id);if(!x||x.card_type!=='Monster')return false;if(req.name&&x.name_en!==req.name)return false;if(req.hero&&!/\bHERO\b/.test(x.name_en||''))return false;if(req.levelMax&&(x.stars||0)>req.levelMax)return false;if(req.effectMonster&&x.monster_category==='Thường')return false;return true;}
 function fusionOptions(n,id,mode='fusion'){
  const c=card(id),s=S(n);if(!c||!c.fusion_materials&&!c.fusion_recipe||c.summon_type==='transformation')return[];if(mode==='miracle'&&!hero(c)||mode==='power'&&!machine(c))return[];
  let pool=materialPool(n,mode);if(c.contact)pool=pool.filter(e=>e.zone==='field'&&face(e.slot));if(mode!=='miracle'&&s.cyberFusionSupportRound===duel.round&&machine(c))pool=[...pool,...choices(s.grave,'grave').map(e=>({...e,zone:'grave'}))];
  const options=[];function save(chosen){if(c.distinct_element&&new Set(chosen.map(e=>card(e.id)?.element)).size<chosen.length)return;if(extraOpen(n)||chosen.some(e=>e.zone==='field'))options.push(chosen);}
  if(c.fusion_recipe){for(const combo of window.memeFusionRecipes.combinations(c.fusion_recipe,pool,e=>card(e.id)))save(combo);return options;}
  if(c.flex_machine){const machines=pool.filter(e=>machine(card(e.id)));for(let mask=1;mask<(1<<Math.min(12,machines.length));mask++){const picked=machines.filter((_,i)=>mask&(1<<i));if(picked.length>=2&&picked.length<=3&&picked.some(e=>materialName(e)===aid('Cyber Dragon')))save(picked);}return options.sort((a,b)=>b.length-a.length);}
  function walk(i,picked){if(i===c.fusion_materials.length)return save(picked);for(const e of pool)if(materialReq(c.fusion_materials[i],e)&&!picked.includes(e))walk(i+1,[...picked,e]);}walk(0,[]);return options;
 }
 function fusionCandidates(n,mode='fusion'){return choices(S(n).extraDeck,'extra').filter(e=>fusionOptions(n,e.id,mode).length);}
 function spendSpellSource(n,id,fromSet=null){const s=S(n);if(fromSet){if(s.spells[fromSet.index]===fromSet.slot){s.spells[fromSet.index]=null;s.grave.push(id);sentToGrave(n,id,true,'effect');return true;}return s.grave.includes(id);}const i=s.hand.indexOf(id);if(i<0)return false;s.hand.splice(i,1);s.grave.push(id);sentToGrave(n,id,true,'effect');return true;}
 async function fuse(n,spellId=null,forcedId=null,mode='fusion',fromSet=null){
  const s=S(n);if(s.noSpecialRound===duel.round)return false;const all=fusionCandidates(n,mode).filter(e=>spellId?!card(e.id).contact:card(e.id).contact);const target=forcedId?all.find(e=>e.id===forcedId):await pick(n,'Chọn quái Dung Hợp / hợp thể',all);if(!target)return false;const c=card(target.id);const banishMats=mode!=='miracle'&&s.cyberFusionSupportRound===duel.round&&machine(c);
  if(!c.contact&&!spellId)return false;const combos=fusionOptions(n,c.id,mode),pool=[...new Set(combos.flat())],validSets=combos.map(set=>set.map(e=>pool.indexOf(e))),picked=await pickMany(n,'Chọn nguyên liệu: '+c.name,pool,{min:Math.min(...combos.map(s=>s.length)),max:Math.max(...combos.map(s=>s.length)),validSets});let summoned=null;if(!picked)return false;
  if(spellId&&await negateSpell(n,card(spellId))){spendSpellSource(n,spellId,fromSet);return true;}
  const completed=await fx(n,c,'fusion',[],()=>{
   if(spellId&&!spendSpellSource(n,spellId,fromSet))return;
   for(const x of picked.filter(e=>e.zone==='hand').sort((a,b)=>b.index-a.index)){const i=s.hand.indexOf(x.id);if(i>=0){const id=s.hand.splice(i,1)[0];(mode==='miracle'||banishMats?s.banished:s.grave).push(id);if(mode==='miracle'||banishMats){if(window.memeAnime?.onBanished)enqueue(()=>window.memeAnime.onBanished(n,id));}else sentToGrave(n,id,true,'material');}}
   for(const x of picked.filter(e=>e.zone==='grave').sort((a,b)=>b.index-a.index)){const i=s.grave.indexOf(x.id);if(i>=0){s.banished.push(s.grave.splice(i,1)[0]);if(window.memeAnime?.onBanished)enqueue(()=>window.memeAnime.onBanished(n,x.id));}}
   for(const x of picked.filter(e=>e.zone==='field')){if(c.contact_return){if(x.extra)s.extra=null;else s.monsters[x.index]=null;s.deck.push(x.id);}else if(c.contact_banish||mode==='miracle'||banishMats){if(x.extra)s.extra=null;else s.monsters[x.index]=null;s.banished.push(x.id);if(window.memeAnime?.onBanished)enqueue(()=>window.memeAnime.onBanished(n,x.id));}else remove(n,x,'material');}
   if(c.contact_return)s.deck=shuffle(s.deck);s.extraDeck.splice(s.extraDeck.indexOf(c.id),1);const slot={...monsterSlot(c.id),fusionSummoned:true,materials:picked.map(e=>e.id),materialCount:picked.length,returnExtraEnd:c.contact_return};uid(slot);
   if(mode==='power'){slot.powerAtk=c.atk;s.powerBondDebt=(s.powerBondDebt||0)+c.atk;}
   if(has(slot,'chimeratech')){for(const e of [...E(n)])remove(n,e,'material');for(const e of [...spellList(n)])clearSpell(n,e.index);}
   const at=placeOnField(n,slot);if(!at){s.extraDeck.push(c.id);log('Không còn ô trống cho quái Extra.');return;}summoned=slot;log(`🌀 ${c.name} xuất hiện${at.extra?' tại Ô quái Extra':' trên sân'}!`);
  },{materials:picked.map(e=>e.id)});if(completed&&summoned)await postSummon(n,summoned);return completed;}
 async function normalSummon(n,index,position='atk',tributes=[]){const s=S(n),c=card(s.hand[index]);if(!c||!usable(n,c)||c.traits.includes('toon')&&!spellList(n).some(e=>card(e.id).effect_code==='toon_world'))return false;const expected=(c.tribute_count??(c.stars>=7?2:c.stars>=5?1:0)),necro=hero(c)&&c.stars>=5&&(s.necroUses||0)<necroCopies(n);
  if(s.normalUsed||(n==='player'&&duel.normalSummoned)||tributes.length<(necro?0:expected)||free(n)<0&&!tributes.length)return false;if(has({id:c.id},'god'))position='atk';
  let summoned=null;const atk=tributes.reduce((sum,i)=>sum+stat(n,s.monsters[i]),0),def=tributes.reduce((sum,i)=>sum+stat(n,s.monsters[i],'def'),0);
  const success=await fx(n,c,position==='def_down'?'set':c.traits.includes('god')?'god':'summon',[],()=>{if(necro&&!tributes.length)s.necroUses=(s.necroUses||0)+1;for(const i of tributes)remove(n,{slot:s.monsters[i],index:i,extra:false},'tribute');s.hand.splice(s.hand.indexOf(c.id),1);const slot=monsterSlot(c.id,position);uid(slot);if(c.traits.includes('ra')){slot.statAtk=atk;slot.statDef=def;}s.monsters[free(n)]=slot;summoned=slot;s.normalUsed=true;if(n==='player'){duel.normalSummoned=true;duel.selected=null;}duel.mode=null;duel.pending=null;log(position==='def_down'?'🂠 Một quái được đặt úp.':`✨ ${c.name} được triệu hồi.`);},{materials:tributes.map(i=>s.monsters[i]?.id).filter(Boolean)});
  if(success&&position!=='def_down'&&summoned)await postSummon(n,summoned,'normal');
  if(success&&position==='def_down'&&summoned&&S(n).monsters.includes(summoned)){const trap=await chooseTrap(other(n),['shadow_of_eyes'],()=>true,card(summoned.id).name+' vừa được Úp.',{kind:'set',atk:stat(n,summoned)});if(trap){const flipped=await trapUse(other(n),trap,[{name:n,index:S(n).monsters.indexOf(summoned)}],()=>{summoned.position='atk';});if(flipped&&E(n).some(e=>e.slot===summoned)){const fc=card(summoned.id);if(fc?.effect_trigger==='on_flip'||fc?.effect_code==='search_gazelle')await resolveEffect(n,fc,{source:summoned,kind:'flip'});}}}
  return success;
 }
 function specialMode(n,c){const s=S(n);if(s.noSpecialRound===duel.round)return null;if(c.traits.includes('valkyrion')&&['Alpha The Magnet Warrior','Beta The Magnet Warrior','Gamma The Magnet Warrior'].every(name=>materialPool(n).some(e=>e.id===aid(name))))return 'valkyrion';if(c.traits.includes('shining_dragon')&&E(n).some(e=>e.slot.id===aid('Blue-Eyes Ultimate Dragon')))return 'shining';if(free(n)<0)return null;if(c.traits.includes('cyber_special')&&!E(n).length&&E(other(n)).length)return 'free';if(c.traits.includes('bubbleman')&&s.hand.length===1&&s.bubbleSpecialRound!==duel.round)return 'bubbleman';if(c.traits.includes('gagaga_special')&&E(n).some(e=>face(e.slot)&&has(e.slot,'gagaga')))return 'gagaga';if(c.traits.includes('kagetokage_special')&&E(n).some(e=>face(e.slot)&&levelOf(e.slot)===4))return 'kagetokage';return null;}
 async function specialSummon(n,index){const s=S(n),c=card(s.hand[index]),mode=c&&specialMode(n,c);if(!mode)return false;const mats=mode==='valkyrion'?['Alpha The Magnet Warrior','Beta The Magnet Warrior','Gamma The Magnet Warrior'].map(name=>materialPool(n).find(e=>e.id===aid(name))):mode==='shining'?[materialPool(n).find(e=>e.zone==='field'&&e.id===aid('Blue-Eyes Ultimate Dragon'))]:[];
  const success=await fx(n,c,'summon',[],()=>{for(const e of mats){if(e.zone==='hand')takeDiscard(n,e);else remove(n,e,'tribute');}s.hand.splice(s.hand.indexOf(c.id),1);const slot=monsterSlot(c.id);uid(slot);if(c.traits.includes('gagaga_child_four'))slot.levelFixed=4;s.monsters[free(n)]=slot;if(mode==='bubbleman')s.bubbleSpecialRound=duel.round;log(`✦ Gọi đặc biệt ${c.name}.`);},{materials:mats.map(e=>e.id)});if(success){const slot=E(n).find(e=>e.slot.id===c.id)?.slot;if(slot)await postSummon(n,slot);}return success;
 }
 async function ritual(n,spell,fromSet=null){const s=S(n),candidates=choices(s.hand,'hand').filter(e=>card(e.id)?.ritual_spell===spell.id),target=await pick(n,'Chọn quái Nghi Lễ',candidates);if(!target)return false;const c=card(target.id),pool=materialPool(n).filter(e=>e.id!==target.id&&!card(e.id)?.uncollectible&&card(e.id)?.card_type==='Monster'),picked=await pickMany(n,'Chọn nguyên liệu Nghi Lễ',pool,{min:1,max:pool.length,levelAtLeast:c.ritual_level,requireField:free(n)<0,cheap:true});if(!picked)return false;
  if(free(n)<0&&!picked.some(e=>e.zone==='field'))return false;if(await negateSpell(n,spell)){spendSpellSource(n,spell.id,fromSet);return true;}
  const success=await fx(n,c,'ritual',[],()=>{if(!spendSpellSource(n,spell.id,fromSet))return;for(const e of picked){if(e.zone==='hand')takeDiscard(n,e);else remove(n,e,'tribute');}s.hand.splice(s.hand.indexOf(c.id),1);const slot={...monsterSlot(c.id),properlySummoned:true};uid(slot);s.monsters[free(n)]=slot;},{materials:picked.map(e=>e.id)});if(success)await postSummon(n,E(n).find(e=>e.slot.id===c.id)?.slot);return success;
 }
 function lordDBlocks(slot){return !!slot&&face(slot)&&dragon(card(slot.id))&&['player','enemy'].some(n=>E(n).some(e=>face(e.slot)&&has(e.slot,'lord_d')));}
 function spellTargetAllowed(n,c,e){if(!e.slot)return false;if(e.name&&e.name!==n&&e.slot.favoriteHero&&S(e.name).field)return false;if(c.card_type==='Trap'&&(has(e.slot,'trap_immune')||has(e.slot,'god')||e.slot.sparkRound===duel.round))return false;if(lordDBlocks(e.slot))return false;if(face(e.slot)&&has(e.slot,'shining_dragon'))return false;if(['Spell','Trap'].includes(c.card_type)&&machine(card(e.id))&&E(e.name).some(x=>face(x.slot)&&x.slot.position==='atk'&&has(x.slot,'cyber_phoenix')))return false;return true;}
 async function destroyChoice(n,c){const t=await pick(n,'Chọn quái đối thủ để phá hủy',targetList(other(n)).filter(e=>spellTargetAllowed(n,c,e)).map(e=>({...e,hidden:e.slot.position==='def_down'})));if(!t)return false;return fx(n,c,'destroy',[t],()=>remove(t.name,t,'effect'));}
 function commitSpellSource(n,c,ctx){const s=S(n);if(ctx.fromSet){const {index,slot}=ctx.fromSet;if(c.spell_category==='Liên Tục'){if(s.spells[index]!==slot)return false;slot.faceDown=false;if(c.effect_code==='swords')slot.turnsLeft=3;return true;}if(c.spell_category==='Môi Trường'){if(s.spells[index]!==slot)return false;s.spells[index]=null;if(s.field){s.grave.push(s.field.id);sentToGrave(n,s.field.id,true,'effect');}s.field={id:c.id};return true;}return spendSpellSource(n,c.id,ctx.fromSet);}if(ctx.fromHand){const i=s.hand.indexOf(c.id);if(i<0)return false;s.hand.splice(i,1);if(c.spell_category==='Liên Tục'){const freeSlot=s.spells.indexOf(null);if(freeSlot<0){s.grave.push(c.id);sentToGrave(n,c.id,true,'effect');return false;}s.spells[freeSlot]={id:c.id,faceDown:false,setRound:duel.round,turnsLeft:c.effect_code==='swords'?3:undefined};}else if(c.spell_category==='Môi Trường'){if(s.field){s.grave.push(s.field.id);sentToGrave(n,s.field.id,true,'effect');}s.field={id:c.id};}else{s.grave.push(c.id);sentToGrave(n,c.id,true,'effect');}}return true;}
 async function paySpellActivation(n,c,ctx,tcg){const s=S(n);if(s.lp<=lpFee(tcg)||ctx.fromHand&&!s.hand.includes(c.id)||ctx.fromSet&&s.spells[ctx.fromSet.index]!==ctx.fromSet.slot)return false;let paid=false;await fx(n,c,'cost',[{name:n,type:'lp'}],()=>{paid=payLp(n,tcg,c.id);},{text:`Trả ${lpFee(tcg)} LP để kích hoạt. Chi phí vẫn trả nếu bị vô hiệu.`});if(!paid)return false;if(await negateSpell(n,c)){spendSpellSource(n,c.id,ctx.fromSet||null);return 'negated';}return 'paid';}
 async function resolveEffect(n,c,ctx={}){
  if(window.memeTcgEngine?.handles(c?.id))return window.memeTcgEngine.resolveEffect(n,c,ctx);
  if(!c||duel.finished)return false;const match=duel,s=S(n),foe=other(n),f=S(foe),code=c.effect_code,source=ctx.source;
  const costOptions=()=>choices(s.hand,'hand').filter(e=>e.index!==ctx.handIndex);
  const commit=async(kind,targets,fn,extra={})=>duel!==match||duel.finished?false:fx(n,c,kind,targets,async()=>{if(!commitSpellSource(n,c,ctx))return;if(ctx.markSlot)ctx.markSlot.effectUsedRound=duel.round;await fn();},extra);
  if(code==='masked_fountain'){
   if(s.maskedFountainHandRound===duel.round||!s.hand.includes(c.id)||free(n)<0||!['MAIN1','MAIN2'].includes(duel.phase)||duel.turn!==n)return false;
   const t=await pick(n,'Suối Nguồn: gọi HERO từ tay ở thế thủ',choices(s.hand,'hand').filter(e=>{const x=card(e.id);return x?.card_type==='Monster'&&/\bHERO\b/.test(x.name_en||'')&&x.deck_zone!=='Extra'&&!x.special_only&&!x.ritual_spell;}));if(!t)return false;let summoned;
   const done=await fx(n,c,'summon',[],()=>{if(!s.hand.includes(c.id)||s.hand[t.index]!==t.id||free(n)<0)return;s.maskedFountainHandRound=duel.round;s.hand.splice(t.index,1);summoned=monsterSlot(t.id,'def');uid(summoned);s.monsters[free(n)]=summoned;},{title:'Suối Nguồn · cho xem và gọi HERO',materials:[t.id]});if(done&&summoned)await postSummon(n,summoned);return !!summoned;
  }
  if(code==='cyber_valley'){
   if(!source||!E(n).some(e=>e.slot===source))return false;
   const monsters=targetList(n,slot=>slot!==source&&face(slot)),modes=[];
   if(monsters.length)modes.push({id:c.id,mode:'pair',label:'Trục xuất lá này và 1 quái ngửa · rút 2'});
   if(s.grave.length&&s.hand.some((id,i)=>i!==ctx.handIndex))modes.push({id:c.id,mode:'top',label:'Trục xuất lá này và 1 lá trên tay · đặt 1 lá Mộ lên đầu Deck'});
   if(!modes.length)return false;
   const mode=(await pick(n,'Thung Lũng Máy: chọn hiệu ứng',modes,{optional:true}))?.mode;if(!mode)return false;
   const banish=entry=>{const index=S(n).monsters.indexOf(entry.slot);if(index<0)return false;entry.slot.banishOnLeave=true;return remove(n,{slot:entry.slot,index,extra:false},'cost');};
   if(mode==='pair'){
    const t=await pick(n,'Chọn quái ngửa để trục xuất cùng',monsters);if(!t)return false;
    return commit('banish',[t],()=>{banish({slot:source});if(t.slot!==source)banish(t);drawCards(n,2);});
   }
   const target=await pick(n,'Chọn 1 lá trong Mộ đưa lên đầu Deck',choices(s.grave,'grave'));if(!target)return false;
   const cost=await pick(n,'Trục xuất 1 lá trên tay',choices(s.hand,'hand'));if(!cost)return false;
   return commit('banish',[target],()=>{if(s.grave[target.index]!==target.id||s.hand[cost.index]!==cost.id)return;banish({slot:source});s.grave.splice(target.index,1);const id=s.hand.splice(cost.index,1)[0];s.banished.push(id);window.memeAnime?.onBanished?.(n,id);s.deck.unshift(target.id);});
  }
  if(code==='masked_blast'){const t=await pick(n,'Phong Bạo: giảm một nửa ATK',targetList(foe,face).filter(e=>spellTargetAllowed(n,c,e)),{optional:true});if(!t)return false;return commit('boost',[t],()=>{t.slot.mangaAtkDelta=(t.slot.mangaAtkDelta||0)-Math.floor(stat(foe,t.slot)/2);});}
  if(code==='masked_acid'){const targets=spellList(foe);return commit('destroy',targets,()=>{for(const t of [...targets])clearSpell(foe,t.index);for(const e of E(foe))if(face(e.slot))e.slot.mangaAtkDelta=(e.slot.mangaAtkDelta||0)-300;});}
  if(code==='p3_umi')return commit('spell',[],()=>{});
  if(code==='p3_gaia'){
   if(!source||!E(n).some(e=>e.slot===source))return false;const t=await pick(n,'Địa Thần Gaia: chọn quái ngửa để hấp thu ATK',targetList(foe,face));if(!t)return false;
   return commit('boost',[t],()=>{const amount=Math.floor(stat(foe,t.slot)/2);t.slot.mangaAtkDelta=(t.slot.mangaAtkDelta||0)-amount;source.mangaAtkDelta=(source.mangaAtkDelta||0)+amount;});
  }
  if(code==='p3_tornado'){const targets=targetList(foe,face);if(!targets.length)return false;return commit('boost',targets,()=>{for(const t of targets){const a=Math.floor(stat(foe,t.slot)/2),d=Math.floor(stat(foe,t.slot,'def')/2);t.slot.mangaAtkDelta=(t.slot.mangaAtkDelta||0)-a;t.slot.mangaDefDelta=(t.slot.mangaDefDelta||0)-d;}});}
  if(code==='p3_terra'){
   if(!source||!E(n).some(e=>e.slot===source))return false;const t=await pick(n,'Đại Địa: chọn HERO khác để hiến tế',targetList(n,(slot,x)=>slot!==source&&face(slot)&&!slot.noTribute&&hero(x)));if(!t)return false;
   return commit('boost',[t],()=>{const a=stat(n,t.slot),d=stat(n,t.slot,'def');if(remove(n,t,'effect_cost')){source.mangaTempRound=duel.round;source.mangaTempAtk=a;source.mangaTempDef=d;}},{materials:[t.id]});
  }
  if(code==='p3_stratos'){if(!source||!E(n).some(e=>e.slot===source))return false;return commit('boost',[],()=>{source.mangaTempRound=duel.round;source.mangaTempAtk=-Math.floor(stat(n,source)/2);source.mangaDirectRound=duel.round;});}
  if(['draw_n','heal_n','destroy_all_opponent_monsters','gilford','dark_hole','duster','dark_magic_attack','swords','card_destruction','fusion_search','search_gazelle','skyscraper','toon_world','scapegoat','lambs','multiply'].includes(code)){
   if(code==='dark_magic_attack'&&!E(n).some(e=>e.slot.id===aid('Dark Magician')))return false;if(code==='toon_world'&&s.lp<=lpFee(1000))return false;if(['scapegoat','lambs'].includes(code)&&free(n)<0)return false;if(code==='multiply'&&!E(n).some(e=>e.slot.id===aid('Kuriboh')))return false;
   if(code==='toon_world'){const payment=await paySpellActivation(n,c,ctx,1000);if(payment!=='paid')return payment==='negated';}
   const targets=code==='dark_hole'?allFields():['destroy_all_opponent_monsters','gilford'].includes(code)?targetList(foe):['duster','dark_magic_attack'].includes(code)?spellList(foe):[];
   return commit(code==='heal_n'?'heal':targets.length?'destroy':code==='draw_n'?'draw':'spell',targets,async()=>{
    if(code==='draw_n')drawCards(n,c.effect_value||1);else if(code==='heal_n')base.heal(n,c.effect_value);else if(['destroy_all_opponent_monsters','gilford'].includes(code)){for(const e of [...E(foe)])remove(foe,e,'effect');}else if(code==='dark_hole'){for(const e of allFields())remove(e.name,e,'effect');}
    else if(['duster','dark_magic_attack'].includes(code)){for(const e of [...spellList(foe)])clearSpell(foe,e.index);}
    else if(code==='swords'){for(const e of E(foe))if(e.slot.position==='def_down')e.slot.position='def';}
    else if(code==='card_destruction'){for(const who of [n,foe]){const count=S(who).hand.length;while(S(who).hand.length)takeDiscard(who,{id:S(who).hand[0]});await window.memeCardMotion?.flush();drawCards(who,count);}}
    else if(['fusion_search','search_gazelle'].includes(code)){const id=code==='fusion_search'?aid('Polymerization'):aid('Gazelle the King of Mythical Beasts'),i=s.deck.indexOf(id);if(i>=0){window.memeCardMotion?.record('search',n,id);s.hand.push(s.deck.splice(i,1)[0]);s.deck=shuffle(s.deck);}}
    else if(['multiply','scapegoat','lambs'].includes(code)){if(code==='multiply'){const e=E(n).find(e=>e.slot.id===aid('Kuriboh'));if(e)remove(n,e,'tribute');}const count=code==='lambs'?2:3;for(let i=0;i<count&&free(n)>=0;i++){const slot={...monsterSlot(code==='multiply'?aid('Kuriboh'):aid('Sheep Token'),'def'),token:true,noTribute:code!=='multiply'};uid(slot);s.monsters[free(n)]=slot;}}
   });
  }
  if(code==='charity'){return commit('draw',[],async()=>{drawCards(n,3);await window.memeCardMotion?.flush();render();if(duel.finished||!s.hand.length)return;const count=Math.min(2,s.hand.length),options=choices(s.hand,'hand'),picked=await pickMany(n,'Thiên Sứ: chọn các lá phải bỏ',options,{min:count,max:count,cheap:true})||options.sort((a,b)=>(card(a.id).atk||0)-(card(b.id).atk||0)).slice(0,count);for(const t of picked.sort((a,b)=>b.index-a.index))takeDiscard(n,t);await window.memeCardMotion?.flush();render();});}
  if(['anime_reborn','premature'].includes(code)){
    if(free(n)<0||code==='premature'&&(s.lp<=lpFee(800)||!s.spells.includes(null)&&!ctx.fromSet))return false;
    const options=[n,...(code==='anime_reborn'?[foe]:[])].flatMap(who=>choices(S(who).grave,'grave').filter(e=>card(e.id)?.card_type==='Monster'&&!card(e.id).uncollectible&&!card(e.id).noRevive).map(e=>({...e,from:who,zone:'grave'})));
    const t=await pick(n,'Chọn quái trong Mộ để hồi sinh',options);
    if(!t)return false;
    const position=await revivalPosition(n,c,t.id);
    if(!position)return false;
    if(code==='premature'){
      const payment=await paySpellActivation(n,c,ctx,800);
      if(payment!=='paid')return payment==='negated';
    }
    return commit('revive',[],()=>{
      if(!S(t.from).grave.includes(t.id)||free(n)<0)return;
      const slot=revive(n,t.from,t.id,position);
      if(slot&&code==='premature'){
        let spellSlot=s.spells.find(sp=>sp&&sp.id===c.id&&!sp.equippedTo);
        if(spellSlot){
          spellSlot.revivalUid=uid(slot);
          spellSlot.equippedTo=uid(slot);
          spellSlot.equipValue=0;
          spellSlot.faceDown=false;
        }else{
          const i=s.grave.lastIndexOf(c.id);
          if(i>=0)s.grave.splice(i,1);
          const nullIdx=s.spells.indexOf(null);
          if(nullIdx>=0){
            s.spells[nullIdx]={id:c.id,faceDown:false,setRound:duel.round,revivalUid:uid(slot),equippedTo:uid(slot),equipValue:0};
          }
        }
      }
      if(slot)deathQueue.push(()=>postSummon(n,slot));
    });
  }
  if(['destroy_spell_target','control','de_fusion','discard_destroy','thunder_giant'].includes(code)){
   let options=code==='destroy_spell_target'?spellList(foe):code==='de_fusion'?allFields().filter(e=>card(e.id).fusion_materials):code==='discard_destroy'?[...targetList(foe),...spellList(foe)]:code==='thunder_giant'?allFields().filter(e=>face(e.slot)&&(card(e.id)?.atk||0)<stat(n,source)):targetList(foe);
   if(code==='control'&&free(n)<0)return false;options=options.filter(e=>spellTargetAllowed(n,c,e));
   const target=await pick(n,'Chọn mục tiêu trên sân',options.map(e=>({...e,hidden:e.name===foe&&(e.slot.faceDown||e.slot.position==='def_down')})));if(!target)return false;
   const cost=['discard_destroy','thunder_giant'].includes(code)?await discard(n,'Bỏ 1 lá làm chi phí'):null;if(['discard_destroy','thunder_giant'].includes(code)&&!cost)return false;
   const revivalPlan=[];if(code==='de_fusion'){const owner=target.name,materials=(target.slot.materials||card(target.id).fusion_materials).filter(m=>typeof m==='string'),counts=new Map();for(const id of S(owner).grave)counts.set(id,(counts.get(id)||0)+1);const enough=materials.every(id=>{const n=counts.get(id)||0;if(!n)return false;counts.set(id,n-1);return true;});if(enough&&S(owner).monsters.filter(x=>!x).length+(target.extra?0:1)>=materials.length){for(const id of materials){const position=await revivalPosition(owner,c,id);if(!position)return false;revivalPlan.push({id,position});}}}
   return commit(code==='control'?'control':code==='de_fusion'?'fusion':'destroy',[target],()=>{takeDiscard(n,cost);if(code==='control'){if(target.extra)f.extra=null;else f.monsters[target.index]=null;target.slot.homeOwner=foe;target.slot.controlRound=duel.round;s.monsters[free(n)]=target.slot;}
    else if(code==='de_fusion'){const owner=target.name,materials=target.slot.materials||card(target.id).fusion_materials;if(target.extra)S(owner).extra=null;else S(owner).monsters[target.index]=null;S(owner).extraDeck.push(target.id);for(const planned of revivalPlan){const slot=revive(owner,owner,planned.id,planned.position);if(slot)deathQueue.push(()=>postSummon(owner,slot));}}
    else if(['spell','field'].includes(target.type))clearSpell(target.name,target.index);else remove(target.name,target,'effect');});
  }
  if(code==='flute'){if(!E(n).some(e=>e.slot.id===aid('Lord of D.'))||free(n)<0)return false;const targets=choices(s.hand,'hand').filter(e=>dragon(card(e.id))&&card(e.id).card_type==='Monster'&&!card(e.id).special_only),picked=await pickMany(n,'Sáo Rồng: chọn Rồng từ tay',targets,{min:1,max:Math.min(2,s.monsters.filter(x=>!x).length)});if(!picked?.length)return false;return commit('summon',[],()=>{for(const t of picked){s.hand.splice(s.hand.indexOf(t.id),1);const slot=monsterSlot(t.id);uid(slot);s.monsters[free(n)]=slot;deathQueue.push(()=>postSummon(n,slot));}},{materials:picked.map(e=>e.id)});}
  if(code==='equip_atk_n'){if(!s.spells.includes(null)&&!ctx.fromSet)return false;const t=await pick(n,'Chọn quái để trang bị',c.id==='AN-megamorph'?allFields().filter(e=>face(e.slot)&&spellTargetAllowed(n,c,e)):targetList(n,face).filter(e=>spellTargetAllowed(n,c,e)));if(!t)return false;return commit('equip',[t],()=>{const i=s.grave.lastIndexOf(c.id);if(i>=0)s.grave.splice(i,1);const slot={id:c.id,faceDown:false,equippedTo:uid(t.slot),setRound:duel.round,equippedSerial:duel.equipSerial=(duel.equipSerial||0)+1};s.spells[s.spells.indexOf(null)]=slot;if(has(t.slot,'gearfried'))clearSpell(n,s.spells.indexOf(slot));});}
  if(code==='reincarnate'){const cost=await pick(n,'Bỏ 1 lá làm chi phí',costOptions(),{cheap:true}),target=await pick(n,'Lấy quái từ Mộ về tay',choices(s.grave,'grave').filter(e=>card(e.id).card_type==='Monster'));if(!cost||!target)return false;return commit('revive',[],()=>{takeDiscard(n,cost);window.memeCardMotion?.record('recover',n,target.id);s.grave.splice(s.grave.indexOf(target.id),1);s.hand.push(target.id);});}
  if(code==='time_wizard'){const heads=Math.random()<.5;return commit('time',allFields(),()=>{log(`🪙 Time Wizard: ${heads?'NGỬA':'SẤP'}!`);for(const e of [...E(heads?foe:n)])remove(heads?foe:n,e,'effect');if(heads){const baby=E(n).find(e=>e.slot.id===aid('Baby Dragon')),extra=s.extraDeck.indexOf(aid('Thousand Dragon'));if(baby&&extra>=0){remove(n,baby,'material');s.extraDeck.splice(extra,1);placeOnField(n,{...monsterSlot(aid('Thousand Dragon')),fusionSummoned:true});}}},{coin:heads?'NGỬA':'SẤP',text:heads?'NGỬA! Phép thời gian thành công — quái đối thủ tan biến.':'SẤP! Phép thời gian phản lại chủ nhân.'});}
  if(code==='hummingbird')return commit('heal',[],()=>base.heal(n,500*f.hand.length));
  if(code==='warrior_inspire'){const t=await pick(n,'Chọn Chiến Binh ngửa để tăng 500 ATK',targetList(n,(slot,c)=>face(slot)&&c.tribe==='Chiến Binh'));if(!t)return false;return commit('boost',[t],()=>{t.slot.tempAtk=(t.slot.tempRound===duel.round?t.slot.tempAtk||0:0)+500;t.slot.tempRound=duel.round;});}
  if(code==='dolphin'){const cost=await discard(n,'Bỏ 1 lá làm chi phí');if(!cost)return false;const monsters=choices(f.hand,'hand').filter(e=>card(e.id).card_type==='Monster');const target=monsters.length?await pick(n,'Cá Heo: xem tay đối thủ và chọn 1 quái',monsters):null;if(!target)return commit('spell',[],()=>takeDiscard(n,cost));const best=Math.max(0,...E(n).map(e=>stat(n,e.slot))),beats=best>=(card(target.id).atk||0);return commit(beats?'destroy':'damage',[],()=>{takeDiscard(n,cost);if(beats){takeDiscard(foe,target);damage(foe,500);}else damage(n,500);});}
  if(code==='aqua_neos'){const cost=await discard(n,'Bỏ 1 lá làm chi phí');if(!cost||!f.hand.length)return false;const target={id:f.hand[Math.floor(Math.random()*f.hand.length)]};return commit('destroy',[],()=>{takeDiscard(n,cost);takeDiscard(foe,target);});}
  if(code==='obelisk'){const pool=targetList(n,slot=>slot!==source&&!slot.noTribute),picked=await pickMany(n,'Obelisk: chọn 2 quái để hiến tế',pool,{min:2,max:2});if(!picked)return false;return commit('god',targetList(foe),()=>{for(const e of picked)remove(n,e,'tribute');for(const e of [...E(foe)])remove(foe,e,'effect');damage(foe,4000);},{materials:picked.map(e=>e.id)});}
  if(code==='ra'){if(s.lp<=1)return false;return commit('god',[],()=>{const value=s.lp-1;s.lp=1;source.tempAtk=(source.tempRound===duel.round?source.tempAtk||0:0)+value;source.tempRound=duel.round;});}
  if(code==='absorb'){if(!s.spells.includes(null))return false;const t=await pick(n,'Hấp thụ quái đối thủ',targetList(foe).filter(e=>spellTargetAllowed(n,c,e)).map(e=>({...e,hidden:e.slot.position==='def_down'})));if(!t)return false;const a=stat(foe,t.slot),d=stat(foe,t.slot,'def');return commit('absorb',[t],()=>{for(const e of spellList(n).filter(e=>e.slot.absorbedTo===uid(source)))clearSpell(n,e.index);if(t.extra)f.extra=null;else f.monsters[t.index]=null;s.spells[s.spells.indexOf(null)]={id:t.id,faceDown:false,equippedTo:uid(source),absorbedTo:uid(source),originalOwner:t.slot.originalOwner||t.slot.homeOwner||foe,equipValue:0};source.absorbAtk=a;source.absorbDef=d;});}
  if(code==='cyberdark_equip'){if(!s.spells.includes(null))return false;const options=choices(s.grave,'grave').filter(e=>dragon(card(e.id))&&(has(source,'cyberdark_dragon')||card(e.id).stars<=3));const target=await pick(n,'Cyberdark: trang bị Rồng trong Mộ',options);if(!target)return false;return commit('equip',[],()=>{s.grave.splice(s.grave.indexOf(target.id),1);s.spells[s.spells.indexOf(null)]={id:target.id,faceDown:false,equippedTo:uid(source),equipValue:card(target.id).atk,cyberdarkEquip:true};});}
  if(code==='thunder_search'){const count=s.deck.filter(id=>id===c.id).length;if(!count)return false;return commit('draw',[],()=>{takeDiscard(n,{id:c.id});for(let i=0;i<Math.min(2,count);i++){const index=s.deck.indexOf(c.id);if(index>=0){window.memeCardMotion?.record('search',n,c.id);s.hand.push(s.deck.splice(index,1)[0]);}}s.deck=shuffle(s.deck);});}
  if(code==='egotist'){if(s.noSpecialRound===duel.round||!E(n).some(e=>face(e.slot)&&(e.slot.id===aid('Harpie Lady')||has(e.slot,'harpie_name')))||free(n)<0)return false;const pool=[...choices(s.hand,'hand'),...choices(s.deck,'deck')].filter(e=>e.id===aid('Harpie Lady')||e.id===aid('Harpie Lady Sisters'));const t=await pick(n,'Màn Vũ Điệu Kiêu Kỳ: gọi Yêu Điểu',pool);if(!t)return false;let summoned;
   const done=await commit('summon',[],()=>{const src=t.zone==='hand'?s.hand:s.deck,i=src.indexOf(t.id);if(i<0)return;src.splice(i,1);if(t.zone==='deck')s.deck=shuffle(s.deck);const slot={...monsterSlot(t.id),properlySummoned:true};uid(slot);s.monsters[free(n)]=slot;summoned=slot;log(`✦ Gọi đặc biệt ${card(t.id).name} nhờ Màn Vũ Điệu Kiêu Kỳ.`);},{materials:[t.id]});if(done&&summoned)await postSummon(n,summoned);return !!summoned;
  }
  if(['cyber_shield','rose_whip'].includes(code)){if(!s.spells.includes(null)&&!ctx.fromSet)return false;const t=await pick(n,'Chọn Yêu Điểu để trang bị',targetList(n,slot=>face(slot)&&(slot.id===aid('Harpie Lady')||has(slot,'harpie_name'))));if(!t)return false;return commit('equip',[t],()=>{const i=s.grave.lastIndexOf(c.id);if(i>=0)s.grave.splice(i,1);const slot={id:c.id,faceDown:false,equippedTo:uid(t.slot),setRound:duel.round,equipValue:c.effect_value||0,equippedSerial:duel.equipSerial=(duel.equipSerial||0)+1};s.spells[s.spells.indexOf(null)]=slot;if(has(t.slot,'gearfried'))clearSpell(n,s.spells.indexOf(slot));});}
  if(code==='amazon_spellcaster'){const mine=targetList(n,slot=>face(slot)&&amazoness(card(slot.id)));if(!mine.length||!E(foe).some(e=>face(e.slot)))return false;const t1=await pick(n,'Chọn Amazoness của bạn',mine);if(!t1)return false;const t2=await pick(n,'Chọn quái ngửa của đối thủ để hoán đổi ATK gốc',targetList(foe,face));if(!t2)return false;return commit('boost',[t1,t2],()=>{if(!E(n).some(e=>e.slot===t1.slot)||!E(foe).some(e=>e.slot===t2.slot))return;t1.slot.swapAtk=card(t2.slot.id).atk;t1.slot.swapRound=duel.round;t2.slot.swapAtk=card(t1.slot.id).atk;t2.slot.swapRound=duel.round;log(`🔄 Pháp Sư Amazoness hoán đổi ATK gốc của ${card(t1.slot.id).name} và ${card(t2.slot.id).name}!`);});}
  if(code==='amazon_chain'){if(s.lp<=lpFee(1500)||!f.hand.some(id=>card(id)?.card_type==='Monster'))return false;const t=await pick(n,'Xiềng Amazoness: trả 1500 LP để lấy 1 quái từ tay đối thủ?',choices(f.hand,'hand').filter(e=>card(e.id)?.card_type==='Monster'),{optional:true});if(!t)return false;return commit('steal',[],()=>{if(f.hand[t.index]!==t.id)return;if(!payLp(n,1500,c.id))return;window.memeCardMotion?.record('discard',foe,t.id,t.index);s.hand.push(f.hand.splice(t.index,1)[0]);log(`⛓ ${c.name}: lấy ${card(t.id).name} từ tay đối thủ!`);});}
  if(['safe_return','hunting_ground','amazon_village'].includes(code))return commit('spell',[],()=>{});
  if(code==='heavy_storm'){const targets=[...spellList(n),...spellList(foe)].filter(e=>e.slot);return commit('destroy',targets,()=>{for(const t of [...targets])clearSpell(t.name,t.index);});}
  if(code==='snatch_steal'){if((!s.spells.includes(null)&&!ctx.fromSet)||free(n)<0)return false;const t=await pick(n,'Cướp Đoạt: chọn quái ngửa của đối thủ',targetList(foe,face).filter(e=>spellTargetAllowed(n,c,e)));if(!t)return false;return commit('control',[t],()=>{const i=s.grave.lastIndexOf(c.id);if(i>=0)s.grave.splice(i,1);const slot={id:c.id,faceDown:false,equippedTo:uid(t.slot),setRound:duel.round,equippedSerial:duel.equipSerial=(duel.equipSerial||0)+1};s.spells[s.spells.indexOf(null)]=slot;if(t.extra)f.extra=null;else f.monsters[t.index]=null;t.slot.homeOwner=foe;t.slot.snatchStolen=true;s.monsters[free(n)]=t.slot;if(has(t.slot,'gearfried'))clearSpell(n,s.spells.indexOf(slot));log(`💀 Cướp Đoạt: ${card(t.id).name} về phe bạn!`);});}
  if(code==='delinquent_duo'){if(s.lp<=lpFee(1000)||!f.hand.length)return false;const payment=await paySpellActivation(n,c,ctx,1000);if(payment!=='paid')return payment==='negated';return commit('destroy',[],()=>{if(!f.hand.length)return;const i=Math.floor(Math.random()*f.hand.length),id=f.hand[i];takeDiscard(foe,{id,zone:'hand',index:i});log(`🎭 Cặp Đôi Du Thủ: đối thủ vứt ngẫu nhiên ${card(id).name}.`);});}
  if(code==='painful_choice'){if(!s.deck.length)return false;const count=Math.min(5,s.deck.length),options=s.deck.slice(0,count).map((id,index)=>({id,index,zone:'deck'}));const t=await pick(foe,'Lựa Chọn Đau Đớn: chọn 1 lá cho đối thủ giữ',options);if(!t)return false;return commit('search',options,()=>{if(s.deck.length<count)return;const top=s.deck.slice(0,count);top.forEach((id,i)=>{if(i===t.index)s.hand.push(id);else{s.grave.push(id);sentToGrave(n,id,true,'effect');}});s.deck.splice(0,count);window.memeCardMotion?.record('search',n,t.id);log(`🔮 Lựa Chọn Đau Đớn: ${card(t.id).name} lên tay, ${count-1} lá còn lại xuống Mộ.`);});}
  if(code==='ecstasy_spark'){if(!E(n).some(e=>face(e.slot)&&(e.slot.id===aid('Harpie Lady')||has(e.slot,'harpie_name'))))return false;const targets=targetList(n,slot=>face(slot)&&(slot.id===aid('Harpie Lady')||has(slot,'harpie_name')));if(!targets.length)return false;return commit('boost',targets,()=>{for(const t of targets){t.slot.swapAtk=2700;t.slot.swapRound=duel.round;t.slot.sparkRound=duel.round;}});}
  if(code==='phoenix_formation'){if(!E(n).some(e=>face(e.slot)&&(e.slot.id===aid('Harpie Lady')||has(e.slot,'harpie_name'))))return false;const targets=targetList(foe);if(!targets.length)return false;return commit('destroy',targets,()=>{let destroyed=0;for(const t of [...targets])if(remove(foe,t,'effect'))destroyed++;if(destroyed)damage(foe,300*destroyed);});}
  if(code==='gagaga_level'){
   if(!source||!E(n).some(e=>e.slot===source))return false;
   const options=[1,2,3,4,5,6,7,8].map(v=>({id:c.id,value:v,label:'Cấp '+v}));
   let t;
   if(n!=='player'||auto){const wanted=s.extraDeck.map(id=>card(id)).filter(x=>x?.xyz_requirement).map(x=>x.xyz_requirement.rank??x.rank);t=options.find(o=>wanted.includes(o.value))||options[3];}
   else t=await pick(n,c.name+': chọn Cấp mới',options,{text:'Cấp của lá này trở thành Cấp đã chọn cho đến hết lượt này.'});
   if(!t||duel!==match||duel.finished)return false;
   return commit('boost',[],()=>{if(!E(n).some(e=>e.slot===source))return;source.levelOverride=t.value;source.levelOverrideRound=duel.round;log(`✦ ${c.name}: Cấp trở thành ${t.value} đến hết lượt.`);});
  }
  if(code==='gagaga_girl'){
   if(!source||!E(n).some(e=>e.slot===source))return false;
   const targets=targetList(foe,face);if(!targets.length)return false;
   const t=await pick(n,c.name+': chọn quái đối thủ',targets,{text:'ATK của mục tiêu trở thành 0 cho đến hết lượt này.'});
   if(!t||duel!==match||duel.finished)return false;
   return commit('boost',[t],()=>{if(!E(foe).some(e=>e.slot===t.slot))return;t.slot.mangaTempAtk=(t.slot.mangaTempRound===duel.round?t.slot.mangaTempAtk||0:0)-stat(foe,t.slot,'atk');t.slot.mangaTempRound=duel.round;log(`✦ ${c.name}: ATK của ${card(t.slot.id).name} trở thành 0 đến hết lượt.`);});
  }
  if(code==='leviathan_charge'){
   if(!source||!E(n).some(e=>e.slot===source)||!(source.materials||[]).length)return false;
   return commit('boost',[],()=>{if(!E(n).some(e=>e.slot===source)||!(source.materials||[]).length)return;xyzDetach(n,source);source.powerAtk=(source.powerAtk||0)+500;log(`✦ ${c.name}: tách 1 nguyên liệu XYZ, tăng 500 ATK (hiện tại ${stat(n,source)}).`);});
  }
  if(code==='cowboy_shot'){
   if(!source||!E(n).some(e=>e.slot===source)||!(source.materials||[]).length)return false;
   const atkPos=source.position==='atk';
   return commit(atkPos?'boost':'damage',atkPos?[{name:n,index:E(n).findIndex(e=>e.slot===source),type:'monster'}]:[{name:foe,type:'lp'}],()=>{if(!E(n).some(e=>e.slot===source)||!(source.materials||[]).length)return;xyzDetach(n,source);if(atkPos){source.powerAtk=(source.powerAtk||0)+1000;log(`✦ ${c.name}: tách 1 nguyên liệu XYZ, tăng 1000 ATK (hiện tại ${stat(n,source)}).`);}else{damage(foe,800);log(`✦ ${c.name}: tách 1 nguyên liệu XYZ, gây 800 sát thương.`);}});
  }
  if(code==='zubaba_general'){
   if(!source||!E(n).some(e=>e.slot===source)||!(source.materials||[]).length)return false;
   const warriors=choices(s.hand,'hand').filter(e=>{const x=card(e.id);return x?.card_type==='Monster'&&x.tribe==='Chiến Binh';});
   if(!warriors.length)return false;
   const t=await pick(n,c.name+': trang bị 1 Chiến Binh từ tay',warriors,{text:'Quái được trang bị xuống Mộ; lá này tăng ATK bằng ATK của nó.'});
   if(!t||s.hand[t.index]!==t.id||duel!==match||duel.finished)return false;
   const bonus=card(t.id).atk||0;
   return commit('equip',[],()=>{if(!E(n).some(e=>e.slot===source)||!(source.materials||[]).length||s.hand[t.index]!==t.id)return;xyzDetach(n,source);takeDiscard(n,t);source.powerAtk=(source.powerAtk||0)+bonus;log(`✦ ${c.name}: trang bị ${card(t.id).name}, tăng ${bonus} ATK (hiện tại ${stat(n,source)}).`);},{materials:[t.id]});
  }
  if(code==='onomatopaira'){
   const cost=await pick(n,c.name+': bỏ 1 lá làm chi phí',costOptions(),{cheap:true});
   if(!cost)return false;
   const seen=new Set(),pool=[];
   choices(s.deck,'deck').forEach(e=>{const x=card(e.id);if(!x||x.card_type!=='Monster'||x.deck_zone==='Extra'||!/\b(?:Gagaga|Zubaba|Gogogo|Dododo)\b/i.test(x.name_en||''))return;if(seen.has(x.name_en))return;seen.add(x.name_en);pool.push(e);});
   if(!pool.length)return false;
   const picked=await pickMany(n,c.name+': lấy quái khác tên từ Deck',pool,{min:1,max:Math.min(2,pool.length),text:'Chọn tối đa 2 quái "Gagaga", "Zubaba", "Gogogo" hoặc "Dododo" khác tên.'});
   if(!picked?.length||s.hand[cost.index]!==cost.id)return false;
   return commit('search',picked.map(e=>({...e,zone:'hand'})),()=>{takeDiscard(n,cost);const names=[];for(const e of picked){const i=s.deck.indexOf(e.id);if(i<0)continue;window.memeCardMotion?.record('search',n,e.id);s.hand.push(s.deck.splice(i,1)[0]);names.push(card(e.id).name);}s.deck=shuffle(s.deck);log(`✦ ${c.name}: thêm ${names.join(', ')} lên tay.`);});
  }
  if(code==='gagagabolt'){
   if(!E(n).some(e=>face(e.slot)&&has(e.slot,'gagaga')))return false;
   const targets=[...targetList(foe).map(e=>({...e,hidden:e.slot.position==='def_down'})),...spellList(foe)];
   if(!targets.length)return false;
   const t=await pick(n,c.name+': chọn 1 lá của đối thủ để phá hủy',targets);
   if(!t)return false;
   return commit('destroy',[t],()=>{if(t.type==='spell'||t.type==='field')clearSpell(foe,t.index);else remove(foe,t,'effect');});
  }
  return false;
 }
 function transformationOptions(n,spellId,forcedId=null){const spell=card(spellId),s=S(n);if(!['mask_change','mask_change_ii'].includes(spell?.effect_code))return[];const options=[];for(const source of E(n).map(e=>({...e,id:e.slot.id,name:n,zone:'field'}))){const c=card(source.id);if(!face(source.slot)||!/^Masked HERO /.test(c?.name_en||''))continue;for(const target of choices(s.extraDeck,'extra')){const x=card(target.id);if(x?.summon_type!=='transformation'||x.element!==c.element||forcedId&&x.id!==forcedId)continue;const legal=spell.effect_code==='mask_change_ii'?x.stars===8:x.stars>c.stars&&x.stars<=c.stars+2;if(legal)options.push({source,target});}}return options;}
 async function transform(n,spellId,fromSet=null,forcedId=null){const match=duel,s=S(n),spell=card(spellId);if(duel.turn!==n||!['MAIN1','MAIN2'].includes(duel.phase)||!spell||s.noSpecialRound===duel.round)return false;const ii=spell.effect_code==='mask_change_ii';if(ii&&s.hand.length-(fromSet?0:1)<1)return false;const options=transformationOptions(n,spellId,forcedId),sources=[...new Set(options.map(o=>o.source))];const source=await pick(n,'Biến Đổi: chọn quái Mặt Nạ của bạn',sources);if(!source)return false;const target=await pick(n,'Biến Đổi: chọn quái từ Extra',options.filter(o=>o.source===source).map(o=>o.target));if(!target)return false;
  const spellIndex=fromSet?-1:s.hand.indexOf(spellId),cost=ii?await pick(n,'Biến Đổi II: bỏ 1 lá làm chi phí',choices(s.hand,'hand').filter(e=>e.index!==spellIndex),{cheap:true}):null;if(ii&&!cost||duel!==match||duel.finished)return false;let paid=false;
  await fx(n,spell,'cost',[source],()=>{if(!E(n).some(e=>e.slot===source.slot)||!s.extraDeck.includes(target.id)||!spendSpellSource(n,spellId,fromSet))return;if(cost)takeDiscard(n,cost);paid=remove(n,source,'effect_cost');},{materials:[source.id,...(cost?[cost.id]:[])],text:'Gửi quái Mặt Nạ xuống Mộ để biến đổi.'});if(!paid)return false;
  if(await negateSpell(n,spell))return true;if(duel!==match||duel.finished||!extraOpen(n)||!s.extraDeck.includes(target.id))return true;let summoned;const c=card(target.id);
  await fx(n,c,'fusion',[],()=>{s.extraDeck.splice(s.extraDeck.indexOf(target.id),1);summoned={...monsterSlot(c.id),transformationSummoned:true,properlySummoned:true};uid(summoned);placeOnField(n,summoned);log(`◈ Biến Đổi: ${c.name}!`);},{title:'BIẾN ĐỔI MẶT NẠ',text:c.name,materials:[source.id]});if(summoned)await postSummon(n,summoned);return true;
 }
 async function playSpellFor(n,index){const s=S(n),c=card(s.hand[index]);if(!c||c.card_type!=='Spell')return false;if(['Liên Tục','Trang Bị'].includes(c.spell_category)&&!s.spells.includes(null))return false;
  if(['mask_change','mask_change_ii'].includes(c.effect_code))return transform(n,c.id);
  const modes={fusion_summon:'fusion',miracle_fusion:'miracle',power_bond:'power'};if(modes[c.effect_code])return fuse(n,c.id,null,modes[c.effect_code]);if(c.effect_code==='ritual')return ritual(n,c);
  if(!['toon_world','premature'].includes(c.effect_code)&&await negateSpell(n,c)){const i=s.hand.indexOf(c.id);if(i>=0){s.grave.push(s.hand.splice(i,1)[0]);sentToGrave(n,c.id,true,'effect');}return true;}return resolveEffect(n,c,{fromHand:true,handIndex:index});
 }
 async function playSetSpellFor(n,index){const s=S(n),slot=s.spells[index],c=card(slot?.id);if(!slot?.faceDown||c?.card_type!=='Spell')return false;const fromSet={index,slot},modes={fusion_summon:'fusion',miracle_fusion:'miracle',power_bond:'power'};if(['mask_change','mask_change_ii'].includes(c.effect_code))return transform(n,c.id,fromSet);if(modes[c.effect_code])return fuse(n,c.id,null,modes[c.effect_code],fromSet);if(c.effect_code==='ritual')return ritual(n,c,fromSet);if(!['toon_world','premature'].includes(c.effect_code)&&await negateSpell(n,c)){spendSpellSource(n,c.id,fromSet);return true;}return resolveEffect(n,c,{fromSet});}
 window.memeActivateSetSpell=index=>{if(!mainPhase()||duel.mode)return;return perform(()=>playSetSpellFor('player',index));};
 async function activateMonster(n,index,extra=false){const slot=extra?S(n).extra:S(n).monsters[index],c=card(slot?.id);if(!face(slot)||!c||c.effect_trigger!=='activated'||slot.effectUsedRound===duel.round&&(!c.tcg||c.tcg_once!==false))return false;return resolveEffect(n,c,{source:slot,markSlot:c.tcg&&c.tcg_once===false?null:slot});}
 function beginTurn(n){for(const e of E(n)){e.slot.attacked=false;e.slot.attacksUsed=0;e.slot.attackTargets=[];delete e.slot.attackAllLimit;if(face(e.slot)&&card(e.slot.id)?.effect_code==='p3_woodsman'&&e.slot.woodsmanOfferedRound!==duel.round){e.slot.woodsmanOfferedRound=duel.round;enqueue(()=>woodsman(n,e.slot));}}for(const p of spellList(n))if(p.slot?.halvedUids)p.slot.halvedUids=[];S(n).normalUsed=false;
 for(const e of E(other(n)))if(e.slot.snatchStolen&&e.slot.homeOwner===n)enqueue(async()=>{if(E(other(n)).some(x=>x.slot===e.slot)&&e.slot.homeOwner===n)await fx(n,card(aid('Snatch Steal')),'heal',[{name:n,type:'lp'}],()=>base.heal(n,500),{text:'Cướp Đoạt: chủ cũ hồi 500 LP.'});});
 if(window.memeAnime?.onStartTurn)enqueue(()=>window.memeAnime.onStartTurn(n));}
 async function endTurn(n){const s=S(n);
  for(const e of [...E(n)])if(e.slot.returnExtraEnd){if(guardRemoval(n,e.slot,'effect')){delete e.slot.returnExtraEnd;continue;}await fx(n,card(e.slot.id),'fusion',[{name:n,index:e.index}],()=>{if(e.extra)s.extra=null;else s.monsters[e.index]=null;s.extraDeck.push(e.slot.id);});}
  if(s.powerBondDebt){const debt=s.powerBondDebt;s.powerBondDebt=0;await fx(n,card(aid('Power Bond')),'damage',[{name:n,type:'lp'}],()=>damage(n,debt),{text:`Power Bond: nhận ${debt} sát thương cuối lượt.`});}
  for(const e of [...E(n)])if(e.slot.homeOwner&&!e.slot.snatchStolen){const original=e.slot.homeOwner;await fx(n,card(aid('Change of Heart')),'control',[{name:n,index:e.index}],()=>{if(e.extra)s.extra=null;else s.monsters[e.index]=null;delete e.slot.homeOwner;delete e.slot.controlRound;if(free(original)>=0)S(original).monsters[free(original)]=e.slot;else{S(original).grave.push(e.slot.id);sentToGrave(original,e.slot.id,true,'effect');}});}
  for(const p of [...spellList(other(n))])if(p.slot.turnsLeft>0&&card(p.id)?.effect_code==='swords'){p.slot.turnsLeft--;if(!p.slot.turnsLeft)await fx(other(n),card(p.id),'spell',[p],()=>clearSpell(other(n),p.index),{text:'Kiếm Ánh Sáng đã hết 3 lượt.'});}
  if(s.hand.length>6){const count=s.hand.length-6,options=choices(s.hand,'hand'),fallback=[...options].sort((a,b)=>(card(a.id).atk||0)-(card(b.id).atk||0)).slice(0,count),picked=window.memeTurnClock?.forcing?fallback:await pickMany(n,'Giữ tối đa 6 lá: chọn các lá phải bỏ',options,{min:count,max:count,cheap:true});for(const t of (picked||fallback).sort((a,b)=>b.index-a.index))takeDiscard(n,t);}
  if(window.memeAnime?.onEndTurn)await window.memeAnime.onEndTurn(n);
  await window.memeCardMotion?.flush();
 }
 function directAllowed(n,slot){if(has(slot,'leviathan')&&!(slot.materials||[]).length)return false;const foe=other(n);return !E(foe).length||has(slot,'direct')||has(slot,'direct_half')||slot.mangaDirectRound===duel.round||card(slot.id)?.effect_code==='p3_ocean'&&[S(n).field,S(foe).field].some(s=>s&&card(s.id)?.name_en==='Umi')||has(slot,'rampart')&&slot.position==='def'||has(slot,'toon')&&spellList(n).some(e=>card(e.id).effect_code==='toon_world')&&!E(foe).some(e=>has(e.slot,'toon'));}
 async function attackReactions(owner,attacker,defender,targetIndex,targetExtra){const opponent=other(owner),s=S(opponent),immune=has(attacker,'trap_immune')||has(attacker,'god')||attacker.sparkRound===duel.round;
  if(defender&&has(defender,'toon')&&spellList(opponent).some(e=>card(e.id).effect_code==='toon_world')&&defender.dodgeRound!==duel.round){await fx(opponent,card(defender.id),'dodge',[],()=>{defender.dodgeRound=duel.round;},{text:'Toon né đòn và trốn vào Thế Giới Hoạt Hình!'});return {cancel:true};}
  if(defender&&face(defender)&&has(defender,'cyber_valley')){await fx(opponent,card(defender.id),'negate',[],()=>{defender.banishOnLeave=true;remove(opponent,{slot:defender,index:targetIndex,extra:targetExtra},'cost');drawCards(opponent,1);duel.phase='MAIN2';});return {cancel:true};}
  const utopia=defender&&face(defender)&&has(defender,'utopia')&&defender.materials?.length?defender:E(opponent).map(e=>e.slot).find(slot=>face(slot)&&has(slot,'utopia')&&(slot.materials||[]).length);
  if(utopia){
   let negate=false;
   if(opponent==='player'){
    const chosen=await pick('player','Số 39: Utopia · Tách nguyên liệu vô hiệu đòn?',[{id:utopia.id,label:'✦ Tách 1 nguyên liệu XYZ: Vô hiệu hóa đòn tấn công'}],{optional:true,reaction:true,text:`Tách 1 nguyên liệu XYZ của ${card(utopia.id).name} (còn ${utopia.materials.length}) để vô hiệu hóa đòn tấn công${defender?' vào '+card(defender.id).name:' trực tiếp'}.`});
    if(chosen)negate=true;
   }else if(!defender||stat(owner,attacker)>stat(opponent,defender,defender.position==='atk'?'atk':'def')){negate=true;}
   if(negate&&E(opponent).some(e=>e.slot===utopia)&&utopia.materials?.length){
    await fx(opponent,card(utopia.id),'negate',[],()=>{xyzDetach(opponent,utopia);},{text:'Số 39: Utopia tách 1 nguyên liệu XYZ — vô hiệu hóa đòn tấn công!'});
    log(`🛡 ${card(utopia.id).name}: tách 1 nguyên liệu XYZ, vô hiệu hóa đòn tấn công của ${card(attacker.id).name}!`);
    return {cancel:true};
   }
  }
  if(s.grave.includes('DL-bacon_saver')){
   let useBacon=false;
   if(opponent==='player'){
    const chosen=await pick(opponent,'Bất ngờ từ Mộ: Kích hoạt Chú Heo Cứu Nguy (Bacon Saver)?',[{id:'DL-bacon_saver',label:'✦ Trục xuất Heo Cứu Nguy: Chặn đòn tấn công'}],{optional:true,reaction:true,text:'Trục xuất Chú Heo Cứu Nguy khỏi Mộ để vô hiệu hóa đòn tấn công của '+card(attacker.id).name+'.'});
    if(chosen)useBacon=true;
   }else if(!defender||stat(owner,attacker)>stat(opponent,defender,defender.position==='atk'?'atk':'def')){
    useBacon=true;
   }
   if(useBacon){
    const bIdx=s.grave.indexOf('DL-bacon_saver');
    if(bIdx>=0){
     s.grave.splice(bIdx,1);
     s.banished.push('DL-bacon_saver');
     await fx(opponent,card('DL-bacon_saver'),'shield',[{name:opponent,type:'lp'}],()=>{},{text:'Heo Cứu Nguy trục xuất khỏi Mộ — Vô hiệu hóa đòn tấn công!'});
     log(`🛡️ Chú Heo Cứu Nguy trục xuất từ Mộ: Chặn đứng đòn tấn công của ${card(attacker.id).name}!`);
     window.showEffectNotice?.({
      cardId:'DL-bacon_saver',
      title:'🛡️ HIỆU ỨNG TỪ MỘ: HEO CỨU NGUY',
      text:'Trục xuất Chú Heo Cứu Nguy khỏi Mộ để chặn đứng đòn tấn công!',
      owner:opponent,
      icon:'🛡️'
     });
     return {cancel:true};
    }
   }
  }
  const attackEvent={kind:'attack',atk:stat(owner,attacker),def:defender?stat(opponent,defender,defender.position==='atk'?'atk':'def'):0,direct:!defender,wouldDestroy:!!defender&&stat(owner,attacker)>stat(opponent,defender,defender.position==='atk'?'atk':'def'),defenderId:defender?.id,immune,attackers:E(owner).filter(e=>e.slot.position==='atk').length};
  const trap=await chooseTrap(opponent,['destroy_attack_position','magic_cylinder','negate_battle','waboku','haunted','mirror_wall','amazoness_archers','dramatic_rescue','half_unbreak'],e=>(!immune||!['destroy_attack_position','magic_cylinder','mirror_wall','amazoness_archers'].includes(e.c.effect_code))&&(e.c.effect_code!=='haunted'||free(opponent)>=0&&s.grave.some(id=>card(id)?.card_type==='Monster'&&!card(id).uncollectible))&&(e.c.effect_code!=='amazoness_archers'||E(opponent).some(x=>face(x.slot)&&amazoness(card(x.slot.id))))&&(e.c.effect_code!=='half_unbreak'||!!defender&&face(defender)&&E(opponent).some(x=>x.slot===defender)&&defender.halfUnbreakRound!==duel.round)&&(e.c.effect_code!=='dramatic_rescue'||!!defender&&face(defender)&&amazoness(card(defender.id))&&s.hand.some(id=>card(id)?.card_type==='Monster')),card(attacker.id).name+' đang tấn công.',attackEvent);
  if(trap){
   if(trap.c.effect_code==='mirror_wall'){
    const counter=await chooseTrap(owner,['seven_tools'],()=>S(owner).lp>lpFee(1000),trap.c.name+' đang kích hoạt.',{kind:'trap',cardId:trap.id});
    if(counter){let negated=false;await trapUse(owner,counter,[trap],()=>{negated=true;},1);if(negated){await fx(owner,counter.c,'negate',[trap],()=>{clearSpell(opponent,trap.index);window.memePhase2?.trace(opponent,trap.id,'negated',1);},{counterDepth:2,text:'Phản Bẫy thành công — hiệu ứng gốc bị vô hiệu.'});return {};}}
    if(S(opponent).spells[trap.index]!==trap.slot)return {};
    await fx(opponent,trap.c,'flip',[{name:opponent,index:trap.index}],()=>{trap.slot.faceDown=false;(trap.slot.halvedUids||=[]).push(uid(attacker));window.memePhase2?.trace(opponent,trap.id,'resolved');},{text:'Tường Gương: ATK quái đang tấn công bị giảm một nửa.'});return {};
   }
   let cancel=false,changed=null;const revived=trap.c.effect_code==='haunted'?await hauntedTarget(opponent):null;if(trap.c.effect_code==='haunted'&&!revived)return {};
   const rescue=trap.c.effect_code==='dramatic_rescue'?await pick(opponent,'Giải Cứu Ngoạn Mục: chọn quái từ tay',choices(s.hand,'hand').filter(e=>card(e.id)?.card_type==='Monster')):null;if(trap.c.effect_code==='dramatic_rescue'&&!rescue)return {};
   await trapUse(opponent,trap,[{name:owner,index:S(owner).monsters.indexOf(attacker)}],()=>{const code=trap.c.effect_code;
   if(code==='destroy_attack_position'){for(const e of [...E(owner)])if(e.slot.position==='atk'&&!has(e.slot,'trap_immune')&&!has(e.slot,'god')&&e.slot.sparkRound!==duel.round)remove(owner,e,'effect');cancel=!E(owner).some(e=>e.slot===attacker);}
   if(code==='magic_cylinder'){damage(owner,stat(owner,attacker));cancel=true;}if(code==='negate_battle'){duel.phase='MAIN2';cancel=true;}if(code==='waboku')s.battleShieldRound=duel.round;if(code==='half_unbreak'&&defender){defender.halfUnbreakRound=duel.round;log(`🛡 Nửa Bất Diệt: ${card(defender.id).name} không thể bị phá hủy chiến đấu và sát thương bị chia đôi trong lượt này!`);}
   if(code==='haunted'&&revived&&free(opponent)>=0){const slot=revive(opponent,opponent,revived.id,trap.c.revival_position||'def');if(slot){changed={slot,index:s.monsters.indexOf(slot),extra:false};deathQueue.push(()=>postSummon(opponent,slot));}}
   if(code==='amazoness_archers'){for(const e of [...E(owner)]){const wasDown=e.slot.position==='def_down';e.slot.position='atk';e.slot.mangaTempAtk=(e.slot.mangaTempRound===duel.round?e.slot.mangaTempAtk||0:0)-500;e.slot.mangaTempRound=duel.round;if(wasDown){const fc=card(e.slot.id);if(fc?.effect_trigger==='on_flip'||fc?.effect_code==='search_gazelle')deathQueue.push(()=>resolveEffect(owner,fc,{source:e.slot,kind:'flip'}));}}}
   if(code==='dramatic_rescue'&&rescue&&defender&&E(opponent).some(e=>e.slot===defender)&&s.hand[rescue.index]===rescue.id){if(targetExtra)s.extra=null;else s.monsters[targetIndex]=null;const id=s.hand.splice(rescue.index,1)[0];s.hand.push(defender.id);log(`🎭 Giải Cứu Ngoạn Mục: ${card(defender.id).name} về tay, ${card(id).name} vào sân!`);const slot=monsterSlot(id,'atk');uid(slot);if(placeOnField(opponent,slot))deathQueue.push(()=>postSummon(opponent,slot));}
  });if(cancel)return {cancel:true};if(changed&&targetIndex===null)return {defender:changed.slot,targetIndex:changed.index,targetExtra:false};}
  return {};
 }
 async function protectDamage(n,amount){if(amount<=0||S(n).battleShieldRound===duel.round||S(n).battleDamageShieldRound===duel.round||duel.battleContext?.owner===n&&has(duel.battleContext.attacker,'rocket')||has(duel.battleContext?.attacker,'exploder')||duel.battleContext?.defender&&has(duel.battleContext.defender,'exploder')||duel.battleContext?.owner===n&&has(duel.battleContext.attacker,'amazon_fighter')||duel.battleContext?.defender&&has(duel.battleContext.defender,'amazon_fighter')&&n!==duel.battleContext.owner)return;const id=S(n).hand.find(id=>card(id)?.traits?.includes('kuriboh'));if(id){let useKuriboh=true;if(n==='player'){const chosen=await pick('player','Bất ngờ: Kích hoạt Kuriboh từ tay?',[{id,label:'✦ Bỏ Kuriboh: Chặn '+amount+' sát thương chiến đấu'}],{optional:true,reaction:true,text:'Bỏ Kuriboh từ tay xuống Mộ để chặn hoàn toàn '+amount+' sát thương chiến đấu này.'});if(!chosen)useKuriboh=false;}if(useKuriboh)await fx(n,card(id),'shield',[{name:n,type:'lp'}],()=>{takeDiscard(n,{id});if(duel.battleContext)duel.battleContext.kuribohBlock=n;},{text:'Kuriboh — chặn sát thương chiến đấu này!'});}}
 async function resolveBattleQuickEffects(owner,attacker,defender,targetIndex,targetExtra){
  if(!attacker||duel.finished)return;
  const opponent=other(owner);
  const checkHonestNeos=async(sideName,slot,isAttacking)=>{
   const s=S(sideName);
   if(!s.hand.includes('DL-elemental_hero_honest_neos')||s.honestDiscardRound===duel.round)return false;
   const c=card(slot.id);
   if(!hero(c))return false;
   const myVal=stat(sideName,slot,slot.position==='def'&&!isAttacking?'def':'atk');
   const foeMon=isAttacking?defender:attacker;
   const foeSide=other(sideName);
   const foeVal=foeMon?stat(foeSide,foeMon,foeMon.position==='def'&&isAttacking?'def':'atk'):0;
   let activate=false;
   if(sideName==='player'){
    const disadvantage=foeMon&&myVal<=foeVal;
    const msg=disadvantage
     ?`Bất lợi: ${c.name} (${myVal}) không mạnh hơn đối thủ (${foeVal}). Kích hoạt Chân Thực Tân Vũ (Honest Neos) +2500 ATK?`
     :`Kích hoạt Chân Thực Tân Vũ (Honest Neos) từ tay để tăng 2500 ATK cho ${c.name}?`;
    const chosen=await pick('player','Bất ngờ: Kích hoạt Chân Thực Tân Vũ (Honest Neos)?',[{
     id:'DL-elemental_hero_honest_neos',
     label:`✦ Bỏ Tân Vũ từ tay: +2500 ATK cho ${c.name}`
    }],{optional:true,reaction:true,text:msg});
    if(chosen)activate=true;
   }else{
    if(foeMon&&myVal<=foeVal&&myVal+2500>foeVal)activate=true;
    else if(isAttacking&&!foeMon&&myVal+2500>=S(foeSide).lp)activate=true;
   }
   if(activate){
    const idx=s.hand.indexOf('DL-elemental_hero_honest_neos');
    if(idx>=0){
     takeDiscard(sideName,{id:'DL-elemental_hero_honest_neos',index:idx});
     s.honestDiscardRound=duel.round;
     slot.mangaTempAtk=(slot.mangaTempAtk||0)+2500;
     slot.mangaTempRound=duel.round;
     const newAtk=stat(sideName,slot,'atk');
     log(`✦ Chân Thực Tân Vũ: Bỏ từ tay, ${c.name} tăng 2500 ATK (hiện tại: ${newAtk} ATK)!`);
     await fx(sideName,card('DL-elemental_hero_honest_neos'),'boost',[{
      name:sideName,
      index:isAttacking?(attacker===S(sideName).extra?-1:S(sideName).monsters.indexOf(slot)):targetIndex,
      type:isAttacking?(attacker===S(sideName).extra?'extra':'monster'):(targetExtra?'extra':'monster')
     }],()=>{},{text:`Chân Thực Tân Vũ: ${c.name} tăng 2500 ATK!`});
     window.showEffectNotice?.({
      cardId:'DL-elemental_hero_honest_neos',
      title:'✦ HIỆU ỨNG TỪ TAY: CHÂN THỰC TÂN VŨ',
      text:`Bỏ Chân Thực Tân Vũ từ tay: [${c.name}] nhận +2500 ATK đến hết lượt!`,
      owner:sideName,
      icon:'⚡'
     });
     return true;
    }
   }
   return false;
  };
  const checkApprentice=async(sideName,slot,isAttacking)=>{
   const s=S(sideName);
   if(!s.hand.includes('DL-apprentice_illusion_magician')||s.apprenticeDiscardRound===duel.round)return false;
   const c=card(slot.id);
   if(!c||c.id==='DL-apprentice_illusion_magician'||!darkSpellcaster(c))return false;
   const foeMon=isAttacking?defender:attacker;
   if(!foeMon)return false;
   const foeSide=other(sideName);
   const myVal=stat(sideName,slot,slot.position==='def'&&!isAttacking?'def':'atk');
   const foeVal=stat(foeSide,foeMon,foeMon.position==='def'&&isAttacking?'def':'atk');
   let activate=false;
   if(sideName==='player'){
    const disadvantage=myVal<=foeVal;
    const msg=disadvantage
     ?`Bất lợi: ${c.name} (${myVal}) không mạnh hơn đối thủ (${foeVal}). Kích hoạt Đồ Đệ Ma Thuật Ảo Ảnh +2000 ATK/DEF?`
     :`Kích hoạt Đồ Đệ Ma Thuật Ảo Ảnh từ tay để tăng 2000 ATK/DEF cho ${c.name}?`;
    const chosen=await pick('player','Bất ngờ: Kích hoạt Đồ Đệ Ma Thuật Ảo Ảnh?',[{
     id:'DL-apprentice_illusion_magician',
     label:`✦ Bỏ Đồ Đệ từ tay: +2000 ATK/DEF cho ${c.name}`
    }],{optional:true,reaction:true,text:msg});
    if(chosen)activate=true;
   }else{
    if(myVal<=foeVal&&myVal+2000>foeVal)activate=true;
   }
   if(activate){
    const idx=s.hand.indexOf('DL-apprentice_illusion_magician');
    if(idx>=0){
     takeDiscard(sideName,{id:'DL-apprentice_illusion_magician',index:idx});
     s.apprenticeDiscardRound=duel.round;
     slot.mangaTempAtk=(slot.mangaTempAtk||0)+2000;
     slot.mangaTempDef=(slot.mangaTempDef||0)+2000;
     slot.mangaTempRound=duel.round;
     const newAtk=stat(sideName,slot,'atk');
     log(`✦ Đồ Đệ Ma Thuật Ảo Ảnh: Bỏ từ tay, ${c.name} tăng 2000 ATK/DEF (hiện tại: ${newAtk} ATK)!`);
     await fx(sideName,card('DL-apprentice_illusion_magician'),'boost',[{
      name:sideName,
      index:isAttacking?(attacker===S(sideName).extra?-1:S(sideName).monsters.indexOf(slot)):targetIndex,
      type:isAttacking?(attacker===S(sideName).extra?'extra':'monster'):(targetExtra?'extra':'monster')
     }],()=>{},{text:`Đồ Đệ Ảo Ảnh: ${c.name} tăng 2000 ATK/DEF!`});
     window.showEffectNotice?.({
      cardId:'DL-apprentice_illusion_magician',
      title:'✦ HIỆU ỨNG TỪ TAY: ĐỒ ĐỆ ẢO ẢNH',
      text:`Bỏ Đồ Đệ Ma Thuật Ảo Ảnh từ tay: [${c.name}] nhận +2000 ATK/DEF trong giao chiến!`,
      owner:sideName,
      icon:'🔮'
     });
     return true;
    }
   }
   return false;
  };
  await checkHonestNeos(owner,attacker,true);
  await checkApprentice(owner,attacker,true);
  if(defender&&E(opponent).some(e=>e.slot===defender)){
   const defHonest=await checkHonestNeos(opponent,defender,false);
   const defApp=await checkApprentice(opponent,defender,false);
   if(defHonest||defApp){
    await checkHonestNeos(owner,attacker,true);
    await checkApprentice(owner,attacker,true);
   }
  }
 }
 async function battle(owner,index,extra,targetIndex,targetExtra=false){const match=duel,s=S(owner),foe=other(owner),attacker=extra?s.extra:s.monsters[index];
  if(duel.phase==='BATTLE'&&s.favoriteFieldRound!==duel.round&&spellList(owner).some(p=>p.id==='DL-favorite_hero'&&p.slot.equippedTo&&E(owner).some(e=>e.slot.uid===p.slot.equippedTo&&face(e.slot)))){s.favoriteFieldRound=duel.round;const fields=[...choices(s.hand,'hand').map(e=>({...e,zone:'hand'})),...choices(s.deck,'deck').map(e=>({...e,zone:'deck'}))].filter(e=>card(e.id)?.spell_category==='Môi Trường');if(fields.length){const t=await pick(owner,'Anh Hùng Tâm Đắc: kích hoạt 1 Phép Môi Trường',fields,{optional:true});if(t)await fx(owner,card(t.id),'spell',[],()=>{const src=t.zone==='hand'?s.hand:s.deck,i=src.indexOf(t.id);if(i<0)return;src.splice(i,1);if(t.zone==='deck')s.deck=shuffle(s.deck);if(s.field){s.grave.push(s.field.id);sentToGrave(owner,s.field.id,true,'effect');}s.field={id:t.id};log(`🌐 Anh Hùng Tâm Đắc kích hoạt ${card(t.id).name}.`);});}}if(!canAttack(attacker))return false;
  let defender=targetExtra?S(foe).extra:targetIndex==null?null:S(foe).monsters[targetIndex];if(!defender&&!directAllowed(owner,attacker))return false;
  const taunt=defender?E(foe).find(e=>e.slot!==defender&&face(e.slot)&&has(e.slot,'amazon_tiger')):E(foe).find(e=>face(e.slot)&&has(e.slot,'amazon_tiger'));
  if(taunt){log(`🐯 ${card(taunt.slot.id).name} chặn đường tấn công — chỉ được đánh nó!`);return false;}
  const guard=defender&&hero(card(defender.id))?E(foe).find(e=>e.slot!==defender&&face(e.slot)&&e.slot.position==='def'&&has(e.slot,'hero_guard')&&e.slot.p2GuardRound!==duel.round&&stat(foe,e.slot,'def')>=stat(owner,attacker)&&stat(owner,attacker)>stat(foe,defender,defender.position==='atk'?'atk':'def')):null;
  if(guard){await fx(foe,card(guard.slot.id),'shield',[{name:foe,index:guard.index}],()=>{guard.slot.p2GuardRound=duel.round;});defender=guard.slot;targetIndex=guard.index;targetExtra=!!guard.extra;}
  if(has(attacker,'attack_all')&&defender){uid(defender);if(attacker.attackTargets?.includes(defender.uid))return false;attacker.attackAllLimit??=Math.max(1,E(foe).length);}
  if(window.memeTcgEngine&&!await window.memeTcgEngine.payAttackFee(owner,attacker))return false;
  if(window.memePhase2){memePhase2.trace(owner,attacker.id,'attack');if(S(foe).spells.some(s=>s?.faceDown))await fx(owner,card(attacker.id),'attack-intent',defender?[{name:foe,index:targetIndex,type:targetExtra?'extra':'monster'}]:[{name:foe,type:'lp'}],()=>{},{text:'Tuyên bố tấn công — kiểm tra phản ứng.'});}
  const reaction=await attackReactions(owner,attacker,defender,targetIndex,targetExtra);if(duel!==match||duel.finished)return false;
  if(reaction.cancel){attacker.attacksUsed=(attacker.attacksUsed||0)+1;attacker.attacked=attacker.attacksUsed>=attackLimit(attacker);duel.mode=null;duel.pending=null;await flush();return true;}
  if(reaction.defender){defender=reaction.defender;targetIndex=reaction.targetIndex;targetExtra=false;}
  if(!E(owner).some(e=>e.slot===attacker))return false;
  if(defender?.position==='def_down')await fx(foe,card(defender.id),'flip',[{name:foe,index:targetIndex}],()=>{defender.position='def';},{text:'Lật ngửa quái đang phòng thủ.'});
  if(defender&&hero(card(attacker.id))&&S(owner).field?.id===aid('Skyscraper')&&stat(owner,attacker)<stat(foe,defender))await fx(owner,card(aid('Skyscraper')),'boost',[{name:owner,index}],()=>{attacker.attackBonus=(attacker.attackBonus||0)+1000;});
  const metal=spellList(owner).find(e=>e.slot.equippedTo===attacker.uid&&card(e.id)?.traits?.includes('metalmorph'));if(metal&&defender)await fx(owner,card(metal.id),'boost',[{name:owner,index}],()=>{attacker.attackBonus=(attacker.attackBonus||0)+Math.floor(stat(foe,defender)/2);});
  const sunrise=E(owner).find(e=>e.slot!==attacker&&face(e.slot)&&card(e.slot.id)?.effect_code==='dl_hero_sunrise'&&e.slot.sunriseAttackRound!==duel.round);
  if(sunrise&&/\bHERO\b/.test(card(attacker.id)?.name_en||'')){const sunriseTargets=[...targetList(foe),...spellList(foe)];if(sunriseTargets.length){sunrise.slot.sunriseAttackRound=duel.round;const t=await pick(owner,'Thái Dương: chọn 1 lá trên sân đối thủ để phá hủy',sunriseTargets,{optional:true});if(t)await fx(owner,card(sunrise.slot.id),'destroy',[t],()=>{if(t.type==='spell'||t.type==='field')clearSpell(foe,t.index);else remove(foe,t,'effect');});}}
  if(has(attacker,'amazon_sage')&&attacker.sageRound!==duel.round){const sageTargets=spellList(foe).filter(e=>e.slot);if(sageTargets.length){const t=await pick(owner,'Hiền Nhân Amazoness: chọn Phép/Bẫy đối thủ để phá hủy',sageTargets.map(e=>({...e,hidden:!!e.slot.faceDown})),{optional:true});if(t){attacker.sageRound=duel.round;await fx(owner,card(attacker.id),'destroy',[t],()=>clearSpell(foe,t.index));}}}
  const slashDragon=attacker.id==='DL-red_eyes_slash_dragon'?attacker:E(owner).find(e=>face(e.slot)&&e.slot.id==='DL-red_eyes_slash_dragon')?.slot;
  if(slashDragon&&isRedEyes(card(attacker.id))&&slashDragon.slashRound!==duel.round){
   const warriors=choices(S(owner).grave,'grave').filter(e=>card(e.id)?.tribe==='Chiến Binh');
   if(warriors.length){
    slashDragon.slashRound=duel.round;
    const w=await pick(owner,'Rồng Đen Thiết Trảm: trang bị 1 Chiến Binh từ Mộ',warriors,{optional:true});
    if(w){
     const gIdx=S(owner).grave.indexOf(w.id);
     if(gIdx>=0){
      S(owner).grave.splice(gIdx,1);
      slashDragon.equippedCards=slashDragon.equippedCards||[];
      slashDragon.equippedCards.push(w.id);
      slashDragon.mangaTempAtk=(slashDragon.mangaTempAtk||0)+200;
      slashDragon.mangaTempRound=duel.round;
      log(`⚔️ Rồng Đen Thiết Trảm trang bị ${card(w.id).name} từ Mộ (+200 ATK)!`);
      await fx(owner,card('DL-red_eyes_slash_dragon'),'boost',[{name:owner,index}],()=>{});
     }
    }
   }
  }
   if(defender&&!E(foe).some(e=>e.slot===defender)){
     log(`🔄 ${card(attacker.id).name}: Mục tiêu đã rời sân — Kích hoạt Đánh Lại (Replay)!`);
     window.showEffectNotice?.({
       cardId: attacker.id,
       title: '🔄 ĐÁNH LẠI (REPLAY)',
       text: `Mục tiêu ban đầu đã rời sân. ${card(attacker.id).name} được quyền chọn lại mục tiêu tấn công mới!`,
       owner,
       icon: '🔄'
     });
     duel.mode=null;duel.pending=null;duel.battleContext=null;attacker.attackBonus=0;render();return false;
   }
  await resolveBattleQuickEffects(owner,attacker,defender,targetIndex,targetExtra);
  if(duel!==match||duel.finished)return false;
  duel.battleContext={owner,attacker,defender};const swAtt=has(attacker,'amazon_swords'),swDef=defender&&has(defender,'amazon_swords');const atk=Math.floor(stat(owner,attacker)*(!defender&&(has(attacker,'direct_half')||has(attacker,'rampart')&&attacker.position==='def')?.5:1)),def=defender?stat(foe,defender,defender.position==='atk'?'atk':'def'):0;
  if(defender&&atk>def&&has(defender,'winged_kuriboh')&&!defender.banishOnLeave&&S(foe).battleShieldRound!==duel.round)await fx(foe,card(defender.id),'shield',[],()=>{S(foe).battleDamageShieldRound=duel.round;});
  const halfBattle=attacker.halfUnbreakRound===duel.round||defender?.halfUnbreakRound===duel.round,battleDamage=(n,amount)=>damage(n,halfBattle?Math.ceil(amount/2):amount);
  const takes=defender?atk>def?(defender.position==='atk'||has(attacker,'piercing')?{name:swDef?owner:foe,amount:atk-def}:null):atk<def?{name:swAtt?foe:owner,amount:def-atk}:null:{name:foe,amount:atk};if(takes&&halfBattle)takes.amount=Math.ceil(takes.amount/2);if(takes)await protectDamage(takes.name,takes.amount);
  let victim=null;duel.mode=null;duel.pending=null;
  const hit=()=>{if(duel!==match)return;
    if(defender&&!E(foe).some(e=>e.slot===defender)){
      log(`🔄 ${card(attacker.id).name}: Mục tiêu đã rời sân — Kích hoạt Đánh Lại (Replay)!`);
      window.showEffectNotice?.({
        cardId: attacker.id,
        title: '🔄 ĐÁNH LẠI (REPLAY)',
        text: `Mục tiêu ban đầu đã rời sân. ${card(attacker.id).name} được quyền chọn lại mục tiêu tấn công mới!`,
        owner,
        icon: '🔄'
      });
      duel.mode=null;duel.pending=null;checkWin();render();return;
    }
    if(defender&&defender.position==='def'&&has(attacker,'zubaba_knight')&&E(foe).some(e=>e.slot===defender)){
      attacker.attacksUsed=(attacker.attacksUsed||0)+1;attacker.attacked=attacker.attacksUsed>=attackLimit(attacker);attacker.attackTargets??=[];attacker.attackTargets.push(uid(defender));
      if(remove(foe,{slot:defender,index:targetIndex,extra:targetExtra},'battle')){victim=defender;log(`⚔ ${card(attacker.id).name} phá hủy ${card(defender.id).name} ở thế Thủ bằng hiệu ứng, không tính sát thương!`);}checkWin();render();return;
    }
    attacker.attacksUsed=(attacker.attacksUsed||0)+1;attacker.attacked=attacker.attacksUsed>=attackLimit(attacker);if(defender){attacker.attackTargets??=[];attacker.attackTargets.push(uid(defender));}
   if(!defender)battleDamage(foe,atk);else if(atk>def){const removed=remove(foe,{slot:defender,index:targetIndex,extra:targetExtra},'battle');if(removed)victim=defender;if(defender.position==='atk'||has(attacker,'piercing'))battleDamage(swDef?owner:foe,atk-def);}else if(atk<def){if(defender.position==='atk')remove(owner,{slot:attacker,index,extra},'battle');battleDamage(swAtt?foe:owner,def-atk);}else if(defender.position==='atk'){remove(owner,{slot:attacker,index,extra},'battle');if(remove(foe,{slot:defender,index:targetIndex,extra:targetExtra},'battle'))victim=defender;}
   log(`⚔ ${card(attacker.id).name} ${defender?'giao chiến với '+card(defender.id).name:'tấn công trực tiếp'}!`);checkWin();render();};
  duel.animeMatchId??='anime-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);duel.animeSerial=(duel.animeSerial||0)+1;duel.animeEvents=[...(duel.animeEvents||[]),{serial:duel.animeSerial,owner,kind:'attack',cardId:attacker.id,index,extra,targetIndex,targetExtra}].slice(-24);
  try{if(window.memeFx)await window.memeFx.attack(owner,index,extra,targetIndex,targetExtra,hit);else hit();}finally{duel.battleContext=null;attacker.attackBonus=0;}
  await flush();if(duel!==match||duel.finished)return true;
  if(victim&&E(owner).some(e=>e.slot===attacker)&&face(attacker)){
   const c=card(attacker.id);if(c.effect_code==='masked_divine'&&S(owner).deck.length){const yes=await pick(owner,'Thần Phong: rút 1 lá',[{id:c.id,label:'Rút 1 lá',name:owner,index,zone:'field'}],{optional:true});if(yes)await fx(owner,c,'draw',[],()=>drawCards(owner,1));}
   if(c.effect_code==='masked_dian'&&free(owner)>=0){const t=await pick(owner,'Địa Vương: gọi quái từ Deck',choices(S(owner).deck,'deck').filter(e=>{const x=card(e.id);return x?.card_type==='Monster'&&x.stars<=4&&x.deck_zone!=='Extra'&&!x.special_only&&!x.ritual_spell;}),{optional:true});if(t){const posture=await pick(owner,'Địa Vương: chọn thế công hoặc thủ',[{id:t.id,position:'atk',label:'Thế công'},{id:t.id,position:'def',label:'Thế thủ'}]);if(posture&&free(owner)>=0){let slot;await fx(owner,c,'summon',[],()=>{if(S(owner).deck[t.index]!==t.id)return;S(owner).deck.splice(t.index,1);S(owner).deck=shuffle(S(owner).deck);slot=monsterSlot(t.id,posture.position);uid(slot);S(owner).monsters[free(owner)]=slot;},{materials:[t.id]});if(slot)await postSummon(owner,slot);}}}
  }
  if(victim&&(has(attacker,'wingman')||has(attacker,'steam_healer')||has(attacker,'battle_burn_300'))){const value=has(attacker,'battle_burn_300')?300:card(victim.id)?.atk||0;if(value)await fx(owner,card(attacker.id),has(attacker,'steam_healer')?'heal':'damage',[{name:has(attacker,'steam_healer')?owner:foe,type:'lp'}],()=>{if(has(attacker,'steam_healer'))base.heal(owner,value);else damage(foe,value);},{text:`${has(attacker,'steam_healer')?'Hồi':'Gây'} ${value} LP nhờ quái vừa bị hạ.`});}
  if(victim&&E(owner).some(e=>e.slot===attacker)&&face(attacker)){const ac=card(attacker.id);
   if(ac.effect_code==='dl_brave_neos'&&attacker.braveSearchRound!==duel.round){const pool=choices(S(owner).deck,'deck').filter(e=>{const x=card(e.id);return x&&['Spell','Trap'].includes(x.card_type)&&/Neos/i.test(x.name_en||'');});if(pool.length){attacker.braveSearchRound=duel.round;const t=await pick(owner,'Dũng Giả Tân Vũ: lấy 1 Phép/Bẫy nhắc đến Tân Vũ',pool,{optional:true});if(t)await fx(owner,ac,'search',[],()=>{const i=S(owner).deck.indexOf(t.id);if(i>=0){window.memeCardMotion?.record('search',owner,t.id);S(owner).hand.push(S(owner).deck.splice(i,1)[0]);S(owner).deck=shuffle(S(owner).deck);}});}}
   if(ac.effect_code==='dl_masked_anki'&&attacker.ankiSearchRound!==duel.round){const pool=choices(S(owner).deck,'deck').filter(e=>{const x=card(e.id);return x&&x.card_type!=='Monster'&&/^(Mask Change|Form Change)/.test(x.name_en||'');});if(pool.length){attacker.ankiSearchRound=duel.round;const t=await pick(owner,'Ám Quỷ: lấy 1 Phép Tốc Công "Change"',pool,{optional:true});if(t)await fx(owner,ac,'search',[],()=>{const i=S(owner).deck.indexOf(t.id);if(i>=0){window.memeCardMotion?.record('search',owner,t.id);S(owner).hand.push(S(owner).deck.splice(i,1)[0]);S(owner).deck=shuffle(S(owner).deck);}});}}
   if(attacker.favoriteHero&&attacker.favoriteSecondRound!==duel.round){attacker.favoriteSecondRound=duel.round;const eq=spellList(owner).find(e=>e.id==='DL-favorite_hero'&&e.slot.equippedTo===attacker.uid);if(eq)await fx(owner,card(eq.id),'spell',[eq],()=>clearSpell(owner,eq.index));attacker.favoriteHero=false;attacker.attacksUsed=Math.max(0,(attacker.attacksUsed||0)-1);attacker.attacked=false;log(`⭐ ${card(attacker.id).name} được tấn công thêm 1 lần.`);}
  }
  if(defender&&E(foe).some(e=>e.slot===defender)&&has(attacker,'rocket'))await fx(owner,card(attacker.id),'boost',[{name:foe,index:targetIndex}],()=>{defender.powerAtk=(defender.powerAtk||0)-500;},{text:'Rocket Warrior làm mục tiêu mất 500 ATK.'});
  if(E(owner).some(e=>e.slot===attacker)&&has(attacker,'darkbright'))await fx(owner,card(attacker.id),'position',[{name:owner,index}],()=>{attacker.position='def';});checkWin();return true;
 }
 const oldDamage=damage;damage=(n,amount)=>duel?.battleContext?.kuribohBlock===n?0:oldDamage(n,amount);
 // Every interactive entry point goes through the same serialized transaction.
 function extraSummonProblem(n, id) {
   if (!duel) return 'Trận đấu chưa bắt đầu.';
   if (duel.finished) return 'Trận đấu đã kết thúc.';
   if (duel.turn !== n) return 'Đang là lượt của đối thủ!';
   if (!['MAIN1','MAIN2'].includes(duel.phase)) return 'Chỉ có thể Triệu hồi ở phase MAIN 1 hoặc MAIN 2!';
   if (duel.mode) return 'Hãy hoàn tất hoặc bấm Hủy thao tác chọn bài trước!';
   const s = S(n), c = card(id);
   if (!c) return 'Không tìm thấy lá bài.';
   if (s.noSpecialRound === duel.round) {
     return 'Hiệu ứng lá bài khác (như Neos Fusion) đang cấm Triệu hồi Đặc biệt trong lượt này!';
   }
   if (c.xyz_requirement) {
     const req = c.xyz_requirement, rank = req.rank ?? c.rank;
     if (!xyzOptions(n, id).length) {
       return 'Cần ' + (req.materials || 2) + ' quái ngửa cùng Cấp ' + rank + ' trên sân để Triệu hồi XYZ ' + c.name + '!';
     }
     if (!extraOpen(n)) return 'Ô quái Extra và cả 3 ô quái đều đã kín!';
     return '';
   }
   const opts = fusionOptions(n, id);
    if (free(n) < 0 && !extraOpen(n) && !opts.some(chosen => chosen.some(e => e.zone === 'field'))) {
      return 'Khu vực quái thú và Extra Zone trên sân đã kín (Tối đa 3 ô + 1 Extra)!';
    }
   if (c.summon_type === 'transformation') {
     const spell = availableFusionSpell(n, id);
     if (!spell) return 'Cần quái Mặt Nạ phù hợp trên sân và Phép Biến Đổi (Mask Change) trên tay!';
     return '';
   }
   if (c.contact) {
     const opts = fusionOptions(n, id);
     if (!opts.length) {
       const matNames = c.fusion_materials ? c.fusion_materials.map(m => card(m)?.name || m).join(' + ') : 'nguyên liệu phù hợp';
       return 'Cần đúng nguyên liệu ngửa trên sân để Hợp Thể (' + matNames + ')!';
     }
     return '';
   }
   const spell = availableFusionSpell(n, id);
   if (!spell) {
     const matNames = c.fusion_materials ? c.fusion_materials.map(m => card(m)?.name || m).join(' + ') : 'nguyên liệu phù hợp';
     return 'Cần Phép Dung Hợp phù hợp trên tay (Dung Hợp / Miracle Fusion / Power Bond) và đủ ' + matNames + '!';
   }
   return '';
 }
 window.extraSummonProblem = extraSummonProblem;

 function cardSpecialProblem(n, c) {
   if (!c) return 'Không tìm thấy lá bài.';
   const s = S(n);
   if (s.noSpecialRound === duel.round) {
     return 'Hiệu ứng lá bài khác (như Neos Fusion) đang cấm Triệu hồi Đặc biệt trong lượt này!';
   }
   if (free(n) < 0) {
     return 'Khu vực quái thú trên sân đã đầy (Tối đa 3 ô trên sân)!';
   }
   if (c.traits?.includes('cyber_special')) {
     if (E(n).length > 0) return 'Cyber Dragon chỉ được gọi đặc biệt khi bạn KHÔNG điều khiển quái thú nào trên sân!';
     if (!E(other(n)).length) return 'Cyber Dragon chỉ được gọi đặc biệt khi đối thủ CÓ quái thú trên sân!';
   }
   if (c.traits?.includes('bubbleman')) {
     if (s.hand.length !== 1) return 'Bubbleman chỉ được gọi đặc biệt khi đây là LÁ BÀI DUY NHẤT trên tay bạn!';
     if (s.bubbleSpecialRound === duel.round) return 'Hiệu ứng gọi đặc biệt của Bubbleman chỉ dùng 1 lần mỗi lượt!';
   }
   if (c.traits?.includes('valkyrion')) {
     const needed = ['Alpha The Magnet Warrior', 'Beta The Magnet Warrior', 'Gamma The Magnet Warrior'];
     const missing = needed.filter(name => !materialPool(n).some(e => e.id === aid(name)));
     if (missing.length > 0) return 'Cần đủ 3 Chiến Binh Từ Tính (Alpha, Beta, Gamma) trên tay/sân. Còn thiếu: ' + missing.join(', ') + '!';
   }
   if (c.traits?.includes('shining_dragon')) {
     if (!E(n).some(e => e.slot.id === aid('Blue-Eyes Ultimate Dragon'))) {
       return 'Cần hiến tế Rồng Trắng Mắt Xanh 3 Đầu (Blue-Eyes Ultimate Dragon) trên sân!';
     }
   }
   if (c.id === 'DL-blue_eyes_alternative_white_dragon' || c.traits?.includes('alternative_special')) {
     if (!s.hand.some(id => aid('Blue-Eyes White Dragon') === id)) {
       return 'Cần tiết lộ 1 lá Rồng Trắng Mắt Xanh trên tay!';
     }
   }
   if (c.traits?.includes('harpie_name')) {
     return 'Yêu Điểu Tam Tỷ chỉ được Triệu hồi Đặc biệt bằng Elegant Egotist!';
   }
   if (c.traits?.includes('gagaga_special') && !E(n).some(e => face(e.slot) && has(e.slot,'gagaga'))) {
     return 'Cần 1 quái "Gagaga" ngửa trên sân để Triệu hồi Đặc biệt!';
   }
   if (c.traits?.includes('kagetokage_special') && !E(n).some(e => face(e.slot) && levelOf(e.slot) === 4)) {
     return 'Cần 1 quái Cấp 4 ngửa trên sân để Triệu hồi Đặc biệt!';
   }
   return 'Chưa thỏa mãn điều kiện Triệu hồi Đặc biệt ghi trên lá bài.';
 }
 window.cardSpecialProblem = cardSpecialProblem;

 function spellProblem(n, c, fromSet = false) {
   if (!c) return 'Không tìm thấy lá bài.';
   if (duel.turn !== n) return 'Đang là lượt của đối thủ!';
   if (!['MAIN1','MAIN2'].includes(duel.phase)) return 'Chỉ kích hoạt Phép trong phase MAIN 1 hoặc MAIN 2!';
   if (duel.mode) return 'Hãy hoàn tất hoặc bấm Hủy thao tác đang chọn trước!';
   const s = S(n);
   const isSpecialSummonSpell = ['fusion_summon','miracle_fusion','power_bond','ritual','mask_change','mask_change_ii','premature','anime_reborn','egotist','DL-neos_fusion','DL-relinquished_fusion','DL-cyberload_fusion','DL-red_eyes_fusion','DL-a_hero_lives','DL-silvers_cry','DL-form_change'].includes(c.effect_code || c.id);
   if (isSpecialSummonSpell && s.noSpecialRound === duel.round) {
     return 'Hiệu ứng lá bài khác (như Neos Fusion) đang cấm Triệu hồi Đặc biệt trong lượt này!';
   }
   if (['Liên Tục','Trang Bị'].includes(c.spell_category) && !s.spells.includes(null) && !fromSet) {
     return 'Khu vực Phép/Bẫy đã đầy (Tối đa 3 ô trên sân)!';
   }
   if (c.spell_category === 'Trang Bị' && !['premature','snatch_steal'].includes(c.effect_code) && !s.monsters.some(Boolean) && !s.extra) {
     return 'Cần có quái thú ngửa trên sân để trang bị!';
   }
   const modes = {fusion_summon:'fusion', miracle_fusion:'miracle', power_bond:'power'};
   if (c.effect_code === 'onomatopaira') {
     if (s.hand.length < (fromSet ? 1 : 2)) return 'Cần 1 lá bài khác trên tay để bỏ làm chi phí!';
     if (!s.deck.some(id => {const x = card(id); return x?.card_type === 'Monster' && x.deck_zone !== 'Extra' && /\b(?:Gagaga|Zubaba|Gogogo|Dododo)\b/i.test(x.name_en || '');})) return 'Deck không có quái "Gagaga", "Zubaba", "Gogogo" hoặc "Dododo" để lấy!';
   }
   if (c.effect_code === 'gagagabolt') {
     if (!E(n).some(e => face(e.slot) && has(e.slot,'gagaga'))) return 'Cần 1 quái "Gagaga" ngửa trên sân!';
     if (!E(other(n)).length && !spellList(other(n)).length) return 'Đối thủ không có lá nào trên sân để phá hủy!';
   }
    if (modes[c.effect_code]) {
      const candidates = fusionCandidates(n, modes[c.effect_code]);
      if (!candidates.length) {
        const extraFusions = choices(S(n).extraDeck, 'extra').filter(e => {
          const ec = card(e.id);
          if (!ec || (!ec.fusion_materials && !ec.fusion_recipe) || ec.summon_type === 'transformation') return false;
          if (modes[c.effect_code] === 'miracle' && !hero(ec)) return false;
          if (modes[c.effect_code] === 'power' && !machine(ec)) return false;
          return true;
        });
        if (!extraFusions.length) return 'Không có quái Dung Hợp phù hợp trong Extra Deck!';
        if (free(n) < 0 && !extraOpen(n)) return 'Sân và Ô quái Extra đã đầy! Cần có ít nhất 1 nguyên liệu trên sân để giải phóng chỗ trống khi Dung Hợp.';
        if (c.effect_code === 'miracle_fusion') return 'Chưa đủ nguyên liệu Anh Hùng trên Sân hoặc Mộ để Dung Hợp!';
        if (c.effect_code === 'power_bond') return 'Chưa đủ nguyên liệu Quái Máy trên Tay hoặc Sân để kích hoạt Power Bond!';
        return 'Chưa đủ nguyên liệu trên Tay hoặc Sân cho bất kỳ quái Dung Hợp nào trong Extra Deck!';
      }
    }
   if (['mask_change','mask_change_ii'].includes(c.effect_code)) {
     if (c.effect_code === 'mask_change_ii' && s.hand.length < (fromSet ? 1 : 2)) return 'Cần 1 lá bài khác trên tay để bỏ làm chi phí!';
     if (!transformationOptions(n, c.id).length) return 'Không có quái HERO phù hợp trên sân hoặc quái Mặt Nạ tương ứng trong Extra Deck!';
   }
   if (c.effect_code === 'ritual') {
     if (!choices(s.hand, 'hand').some(e => card(e.id)?.ritual_spell === c.id)) return 'Cần có quái Nghi Lễ tương ứng trên tay!';
     if (!materialPool(n).filter(e => card(e.id)?.card_type === 'Monster').length) return 'Không đủ quái thú trên tay hoặc sân để tế cho Nghi Lễ!';
   }
   if (c.id === 'DL-neos_fusion') {
     if (free(n) < 0 && !extraOpen(n)) return 'Khu vực quái thú trên sân đã đầy!';
     const neosFusions = s.extraDeck.filter(id => {
       const mats = card(id)?.fusion_materials;
       return mats && mats.some(m => typeof m === 'string' ? (m.includes('neos') || m.includes('Neos')) : (m.name?.includes('Neos')));
     });
     if (!neosFusions.length) return 'Không có quái Dung Hợp Tân Vũ (Neos) phù hợp trong Extra Deck!';
     const hasNeos = s.deck.includes(aid('Elemental HERO Neos')) || s.hand.includes(aid('Elemental HERO Neos')) || E(n).some(e => e.slot.id === aid('Elemental HERO Neos'));
     if (!hasNeos) return 'Cần Elemental HERO Neos trong Deck, Tay hoặc Sân!';
   }
   if (c.id === 'DL-a_hero_lives') {
     if (E(n).some(e => face(e.slot))) return 'A Hero Lives chỉ dùng khi bạn KHÔNG điều khiển quái thú nào trên sân!';
     if (free(n) < 0) return 'Khu vực quái thú trên sân đã đầy!';
     if (s.lp <= 1) return 'Không đủ LP để kích hoạt!';
   }
   if (c.effect_code === 'premature') {
      if (s.lp <= lpFee(800)) return 'Cần ít nhất ' + lpFee(800) + ' LP để kích hoạt Chôn Sống!';
      if (free(n) < 0) return 'Khu vực quái thú trên sân đã đầy!';
      if (!s.spells.includes(null) && !fromSet) return 'Khu vực Phép/Bẫy đã đầy (Tối đa 3 ô trên sân)!';
      if (!s.grave.some(id => card(id)?.card_type === 'Monster' && !card(id)?.uncollectible && !card(id)?.noRevive)) return 'Không có quái thú hợp lệ trong Mộ để hồi sinh!';
    }
   if (c.effect_code === 'anime_reborn') {
     if (free(n) < 0) return 'Khu vực quái thú trên sân đã đầy!';
     if (![...s.grave, ...S(other(n)).grave].some(id => card(id)?.card_type === 'Monster' && !card(id)?.uncollectible && !card(id)?.noRevive)) return 'Không có quái thú hợp lệ trong Mộ để hồi sinh!';
   }
   if (c.id === 'DL-silvers_cry') {
     if (free(n) < 0) return 'Khu vực quái thú trên sân đã đầy!';
     if (!s.grave.some(id => card(id)?.card_type === 'Monster' && card(id)?.tribe === 'Rồng' && card(id)?.monster_category === 'Thường')) return 'Không có quái Rồng Thường (Normal Dragon) trong Mộ để hồi sinh!';
   }
   if (['destroy_spell_target', 'duster', 'dust_tornado'].includes(c.effect_code)) {
     if (!spellList(other(n)).length) return 'Đối thủ không có lá Phép hoặc Bẫy nào trên sân để phá hủy!';
   }
   if (['dark_hole', 'destroy_all_opponent_monsters'].includes(c.effect_code)) {
     if (!E(other(n)).length) return 'Đối thủ không có quái thú nào trên sân!';
   }
   if (c.effect_code === 'control') {
     if (!E(other(n)).length) return 'Đối thủ không có quái thú nào trên sân để điều khiển!';
   }
   if (c.effect_code === 'dark_magic_attack') {
     if (!E(n).some(e => face(e.slot) && (card(e.slot.id)?.name_en === 'Dark Magician' || card(e.slot.id)?.id === aid('Dark Magician')))) {
       return 'Cần Phù Thủy Áo Đen (Dark Magician) đang ngửa trên sân!';
     }
   }
   if (c.id === 'DL-cards_of_consonance') {
     if (!s.hand.some(id => id !== c.id && card(id)?.tribe === 'Rồng' && card(id)?.is_tuner && (card(id)?.atk || 0) <= 1000)) {
       return 'Cần 1 quái Rồng Tuner có ATK ≤ 1000 trên tay để bỏ làm chi phí!';
     }
   }
   if (c.id === 'DL-the_melody_of_awakening_dragon') {
     if (s.hand.length < (fromSet ? 1 : 2)) return 'Cần 1 lá bài khác trên tay để bỏ làm chi phí!';
   }
   if (c.effect_code === 'egotist') {
     if (!E(n).some(e => face(e.slot) && (e.slot.id === aid('Harpie Lady') || has(e.slot,'harpie_name')))) return 'Cần Yêu Điểu (Harpie Lady) đang ngửa trên sân!';
     if (free(n) < 0) return 'Khu vực quái thú trên sân đã đầy!';
     if (![...s.hand,...s.deck].some(id => id === aid('Harpie Lady') || id === aid('Harpie Lady Sisters'))) return 'Không còn Yêu Điểu nào trong Tay hoặc Deck để gọi!';
   }
   if (['cyber_shield','rose_whip'].includes(c.effect_code) && !E(n).some(e => face(e.slot) && (e.slot.id === aid('Harpie Lady') || has(e.slot,'harpie_name')))) {
     return 'Cần Yêu Điểu (Harpie Lady) đang ngửa trên sân để trang bị!';
   }
   if (c.effect_code === 'amazon_spellcaster') {
     if (!E(n).some(e => face(e.slot) && amazoness(card(e.slot.id)))) return 'Cần Amazoness đang ngửa trên sân của bạn!';
     if (!E(other(n)).some(e => face(e.slot))) return 'Đối thủ không có quái thú ngửa nào để hoán đổi ATK!';
   }
   return '';
 }
 window.spellProblem = spellProblem;

 function monsterEffectProblem(n, slot, c) {
   if (!duel) return 'Trận đấu chưa bắt đầu.';
   if (duel.turn !== n) return 'Đang là lượt của đối thủ!';
   if (!['MAIN1','MAIN2'].includes(duel.phase)) return 'Chỉ kích hoạt hiệu ứng trong phase MAIN 1 hoặc MAIN 2!';
   if (duel.mode) return 'Hãy hoàn tất hoặc bấm Hủy thao tác đang chọn trước!';
   if (!slot) return 'Không tìm thấy quái thú.';
   if (slot.position === 'def_down') return 'Quái thú đang úp mặt, cần lật lên mới kích hoạt hiệu ứng!';
   if (slot.effectsNegated || (slot.negatedUntil ?? -1) >= duel.round) return 'Quái thú đang bị vô hiệu hóa hiệu ứng!';
   if (slot.effectUsedRound === duel.round && (!c.tcg || c.tcg_once !== false)) {
     return 'Hiệu ứng của quái thú này đã kích hoạt trong lượt này rồi! (Mỗi lượt chỉ dùng 1 lần)';
   }
   const s = S(n);
   const doesSpecialSummon = ['search_gazelle','p3_ocean','DL-elemental_hero_solid_soldier','DL-elemental_hero_liquid_soldier','DL-sage_with_eyes_of_blue','DL-cyber_dragon_core'].includes(c.effect_code || c.id);
   if (doesSpecialSummon && s.noSpecialRound === duel.round) {
     return 'Hiệu ứng lá bài khác (như Neos Fusion) đang cấm Triệu hồi Đặc biệt trong lượt này!';
   }
   if (c.effect_code === 'time_wizard' && duel.round === 1) return 'Time Wizard không thể dùng trong lượt đầu!';
   if (c.effect_code === 'absorb' && !E(other(n)).length) return 'Đối thủ không có quái thú trên sân để hút!';
   if (c.effect_code === 'discard_destroy' && !s.hand.length) return 'Cần 1 lá bài trên tay để bỏ làm chi phí!';
   if (c.effect_code === 'thunder_giant' && (!s.hand.length || !E(other(n)).some(e => face(e.slot) && (card(e.slot.id)?.atk || 0) < c.atk))) {
     return 'Cần 1 lá trên tay và đối thủ có quái ngửa với ATK thấp hơn Thunder Giant (2400)!';
   }
   if (c.effect_code === 'aqua_neos' && (!s.hand.length || !S(other(n)).hand.length)) {
     return 'Cần 1 lá trên tay và đối thủ có ít nhất 1 lá trên tay để phá hủy!';
   }
   if (c.effect_code === 'gagaga_girl' && !E(other(n)).some(e => face(e.slot))) return 'Đối thủ không có quái ngửa để đưa ATK về 0!';
   if (['leviathan_charge','cowboy_shot','zubaba_general'].includes(c.effect_code) && !(slot.materials || []).length) return 'Lá này không còn nguyên liệu XYZ để tách!';
   if (c.effect_code === 'zubaba_general' && !s.hand.some(id => card(id)?.card_type === 'Monster' && card(id)?.tribe === 'Chiến Binh')) return 'Cần 1 quái Chiến Binh trên tay để trang bị!';
   if (window.memeRules?.canExecute && !window.memeRules.canExecute(n, c)) {
     return 'Chưa đủ điều kiện kích hoạt hiệu ứng này (thiếu mục tiêu hoặc chi phí)!';
   }
   return '';
 }
 window.monsterEffectProblem = monsterEffectProblem;

 summon=(index,position='atk')=>{
    if(duel?.turn!=='player'){window.showActionNotice('Đang là lượt của đối thủ!');return;}
    if(!['MAIN1','MAIN2'].includes(duel?.phase)){
      const msg = duel?.phase === 'BATTLE' ? 'Không thể Triệu hồi trong Phase Chiến Đấu! Hãy quay về Main 2 hoặc sang lượt sau.' : 'Chỉ có thể Triệu hồi ở phase MAIN 1 hoặc MAIN 2.';
      window.showActionNotice(msg);
      return log(msg);
    }
    if(!canAct()||!mainPhase())return;
   if(duel.mode){
     window.showActionNotice('Hãy hoàn tất hoặc bấm Hủy thao tác chọn bài trước!');
     return log('Đang trong thao tác chọn bài.');
   }
   const s=S('player'),c=card(s.hand[index]);
   if(!c||c.card_type!=='Monster')return;
   if(c.special_only){
     const prob = cardSpecialProblem('player', c);
     window.showActionNotice(prob, 'Không thể Triệu hồi Thường');
     log(prob);
     return false;
   }
   if(c?.traits.includes('toon')&&!spellList('player').some(e=>card(e.id).effect_code==='toon_world')){
     const msg = 'Cần Toon World đang ngửa trên sân để Triệu hồi Toon!';
     window.showActionNotice(msg);
     return log(msg);
   }
   if(duel.normalSummoned){
     const msg = 'Bạn đã triệu hồi thường trong lượt này rồi! (Mỗi lượt chỉ được 1 lần)';
     window.showActionNotice(msg);
     return log(msg);
   }
   const necro=hero(c)&&c.stars>=5&&(s.necroUses||0)<necroCopies('player'),need=necro?0:c.tribute_count??(c.stars>=7?2:c.stars>=5?1:0);
   const available = E('player').filter(e=>!e.slot.noTribute).length;
   if(available<need){
     const msg = `Cần ${need} quái để hiến tế cho ${c.name} (${c.stars}★)! Hiện chỉ có ${available}.`;
     window.showActionNotice(msg);
     return log(msg);
   }
   if(free('player')<0 && need === 0){
     const msg = 'Khu vực quái thú trên sân đã đầy (Tối đa 3 ô trên sân)!';
     window.showActionNotice(msg);
     return log(msg);
   }
   if(need){duel.mode='tribute';duel.pending={index,position,needed:need,chosen:[]};log(`Chọn ${need} quái để hiến tế cho ${c.name}.`);render();return;}
   return perform(()=>normalSummon('player',index,position,[]));
 };
 placeSummon=(index,position,tributes)=>perform(()=>normalSummon('player',index,position,tributes));
 const singleSummon=summon;summon=(index,position='atk')=>{const c=duel&&card(S('player').hand[index]);if(!c||!mainPhase()||duel.mode||c.special_only||duel.normalSummoned)return singleSummon(index,position);const necro=hero(c)&&c.stars>=5&&(S('player').necroUses||0)<necroCopies('player'),need=necro?0:c.tribute_count??(c.stars>=7?2:c.stars>=5?1:0);if(need<=1)return singleSummon(index,position);return perform(async()=>{const picked=await pickMany('player','Chọn '+need+' quái để hiến tế',targetList('player',slot=>!slot.noTribute).filter(e=>!e.extra),{min:need,max:need,cheap:true});return picked?normalSummon('player',index,position,picked.map(e=>e.index)):false;});};
 const originalTribute=chooseTribute;chooseTribute=async index=>{const match=duel,p=duel?.pending,slot=S('player').monsters[index];if(!p||!slot||cancelChoice)return;if(slot.noTribute)return log('Cừu Token không dùng hiến tế.');if(p.chosen.includes(index))return originalTribute(index);const selected=await pick('player','Xác nhận quái hiến tế',[{id:slot.id,slot,index,name:'player',type:'monster'}],{previewIndex:0,text:'Quái này sẽ được dùng làm chi phí triệu hồi.'});if(selected&&duel===match&&duel.pending===p&&S('player').monsters[index]===slot)return originalTribute(index);};
 playSpell=index=>{
   if(!mainPhase()||duel.mode)return;
   const c=card(S('player').hand[index]);
   const spellBypass=['toon_world','premature','mask_change','mask_change_ii','fusion_summon','miracle_fusion','power_bond','ritual'];
   const ioOpen=!trapLocked()&&['player','enemy'].some(w=>spellList(w).some(e=>!e.slot.faceDown&&card(e.id)?.effect_code==='imperial_order'));
   if(!(ioOpen&&c?.card_type==='Spell'&&!spellBypass.includes(c.effect_code))){
     const prob=spellProblem('player',c);
     if(prob){
       window.showActionNotice(prob, 'Chưa thể kích hoạt');
       log(prob);
       return false;
     }
   }
   return perform(()=>playSpellFor('player',index));
 };
 summonExtra=index=>{
   if(!mainPhase()||duel.mode)return;
   const id=S('player').extraDeck[index],c=card(id);
   if(!c)return;
   const prob=extraSummonProblem('player',id);
   if(prob){
     window.showActionNotice(prob, 'Chưa thể Triệu hồi');
     log(prob);
     return false;
   }
   if(c.xyz_requirement){
     closeModal();
     return perform(()=>xyzSummon('player',id));
   }
   const spell=availableFusionSpell('player',id);
   if(c.summon_type==='transformation'){
     closeModal();
     return perform(()=>transform('player',spell,null,id));
   }
   closeModal();
   return perform(()=>fuse('player',c.contact?null:spell,id,spell&&card(spell).effect_code==='miracle_fusion'?'miracle':spell&&card(spell).effect_code==='power_bond'?'power':'fusion'));
 };
 function availableFusionSpell(n,id){if(card(id)?.summon_type==='transformation')return S(n).hand.find(spell=>transformationOptions(n,spell,id).length&&(card(spell).effect_code!=='mask_change_ii'||S(n).hand.length>=2));return S(n).hand.find(x=>{const code=card(x)?.effect_code,mode=code==='miracle_fusion'?'miracle':code==='power_bond'?'power':code==='fusion_summon'?'fusion':null;return mode&&fusionOptions(n,id,mode).length;});}
 synchroOptions=(name,id)=>card(id)?.summon_type==='transformation'?S(name).hand.flatMap(spell=>card(spell)?.effect_code==='mask_change_ii'&&S(name).hand.length<2?[]:transformationOptions(name,spell,id)):card(id)?.contact?fusionOptions(name,id):availableFusionSpell(name,id)?fusionOptions(name,id,card(availableFusionSpell(name,id)).effect_code==='miracle_fusion'?'miracle':card(availableFusionSpell(name,id)).effect_code==='power_bond'?'power':'fusion'):[];
 activateMonsterEffect=(index,extra=false)=>{
   if(!mainPhase()||duel.mode)return;
   const slot=extra?S('player').extra:S('player').monsters[index],c=card(slot?.id);
   const prob=monsterEffectProblem('player',slot,c);
   if(prob){
     window.showActionNotice(prob, 'Chưa thể kích hoạt');
     log(prob);
     return false;
   }
   return perform(()=>activateMonster('player',index,extra));
 };
 function trapProblem(index){
   const slot=S('player').spells[index],c=card(slot?.id);
   if(!slot?.faceDown||c?.card_type!=='Trap')return 'Chọn một Bẫy đang úp.';
   if(slot.setRound>=duel.round)return 'Bẫy vừa úp trong lượt này: phải chờ sang lượt sau mới kích hoạt được!';
   if(trapLocked())return 'Jinzo đang vô hiệu Bẫy trên sân!';
   if(['haunted','DL-magician_navigation','DL-eternal_soul','DL-red_eyes_spirit','DL-return_of_the_red_eyes'].includes(c.effect_code||c.id) && S('player').noSpecialRound===duel.round){
     return 'Hiệu ứng lá bài khác (như Neos Fusion) đang cấm Triệu hồi Đặc biệt trong lượt này!';
   }
   if(!['dust_tornado','haunted','waboku','gagagaguard','half_unbreak'].includes(c.effect_code))return 'Bẫy phản đòn: tự động kích hoạt khi đối thủ tấn công hoặc đủ điều kiện.';
   if(c.effect_code==='dust_tornado'&&!spellList('enemy').length)return 'Đối thủ chưa có Phép/Bẫy trên sân để phá hủy.';
   if(c.effect_code==='gagagaguard'&&!E('player').some(e=>face(e.slot)&&has(e.slot,'gagaga')))return 'Cần 1 quái "Gagaga" ngửa trên sân để kích hoạt!';
   if(c.effect_code==='half_unbreak'&&!targetList('player',face).length)return 'Cần 1 quái ngửa của bạn để chọn!';
   if(c.effect_code==='haunted'&&(free('player')<0||!S('player').grave.some(id=>card(id)?.card_type==='Monster'&&!card(id).uncollectible)))return 'Cần ô quái trống trên sân và quái hợp lệ trong Mộ.';
   return '';
 }
 activateTrap=index=>{
   if(!canAct()||duel.mode)return;
   const problem=trapProblem(index);
   if(problem){
     window.showActionNotice(problem, 'Chưa thể lật Bẫy');
     log(problem);
     render();
     return;
   }
   return perform(async()=>{const slot=S('player').spells[index],c=card(slot.id),entry={slot,index,id:slot.id,c,name:'player',type:'spell'};const target=c.effect_code==='dust_tornado'?await dustTarget('player'):c.effect_code==='haunted'?await hauntedTarget('player'):c.effect_code==='half_unbreak'?await pick('player','Nửa Bất Diệt: chọn quái của bạn',targetList('player',face),{text:'Quái này không thể bị phá hủy bởi chiến đấu và sát thương chiến đấu liên quan bị chia đôi trong lượt này.'}):null;if(!['waboku','gagagaguard'].includes(c.effect_code)&&!target)return false;return trapUse('player',entry,target?.slot?[target]:[],()=>{if(c.effect_code==='dust_tornado')clearSpell(target.name,target.index);else if(c.effect_code==='waboku')S('player').battleShieldRound=duel.round;else if(c.effect_code==='gagagaguard'){S('player').effectShieldRound=duel.round;log(`🛡 Gagagaguard: quái của bạn không thể bị phá hủy bởi hiệu ứng trong lượt này.`);}else if(c.effect_code==='half_unbreak'&&target){target.slot.halfUnbreakRound=duel.round;log(`🛡 Nửa Bất Diệt: ${card(target.slot.id).name} không thể bị phá hủy chiến đấu và sát thương liên quan bị chia đôi trong lượt này.`);}else{const revived=revive('player','player',target.id,c.revival_position||'def');if(revived)deathQueue.push(()=>postSummon('player',revived));}});});
 };
 effect=(name,c,ctx={})=>{if(busy){deathQueue.push(()=>resolveEffect(name,c,ctx));return;}return perform(()=>resolveEffect(name,c,ctx));};
 declareAttack=(index,extra=false)=>{if(!canAct()||duel.phase!=='BATTLE'||duel.mode)return;const slot=extra?S('player').extra:S('player').monsters[index];if(!canAttack(slot))return;duel.pending={index,isExtra:extra};duel.mode='attack';if(!E('enemy').length)return resolveAttack(null);render();};
 resolveAttack=async(targetIndex,targetExtra=false)=>{const p=duel?.pending;if(!p||!canAct()&&duel.turn==='player'||busy||cancelChoice)return;const target=targetExtra?S('enemy').extra:targetIndex!=null?S('enemy').monsters[targetIndex]:null;if((targetExtra||targetIndex!=null)&&!target)return false;return perform(()=>battle(duel.turn,p.index,p.isExtra,targetIndex,targetExtra));};
 endPlayerTurn=()=>{if(!canAct()||duel.mode)return;return perform(async()=>{await endTurn('player');if(duel.finished)return;duel.turn='enemy';duel.phase='MAIN1';duel.round++;duel.selected=null;duel.normalSummoned=false;if(!window.memeOnlineIsPlaying?.())aiTimer=setTimeout(aiTurn,450);});};
 aiTurn=async(options={})=>{if(!duel||duel.finished||duel.turn!=='enemy'||window.memeOnlineIsPlaying?.())return;const match=duel,s=S('enemy');beginTurn('enemy');await perform(async()=>{if(duel.round>1&&!options.alreadyDrew)await fx('enemy',null,'draw',[],()=>drawCards('enemy',1),{title:'Lượt đối thủ',text:'Rút 1 lá từ Deck.'});if(duel.finished)return;
   await flush();const fountain=s.hand.find(id=>card(id)?.effect_code==='masked_fountain');if(fountain)await resolveEffect('enemy',card(fountain));const special=s.hand.findIndex(id=>specialMode('enemy',card(id)));if(special>=0)await specialSummon('enemy',special);
   // Prepare Toon and Ritual strategies before spending the Normal Summon.
   if(window.memePhase2?.settings.difficulty!=='easy')for(const id of [...s.hand]){const c=card(id);if(c?.effect_code==='ritual'||c?.effect_code==='toon_world'&&memePhase2.spellScore('enemy',c)>0)await playSpellFor('enemy',s.hand.indexOf(id));}
   const fusionSpell=s.hand.find(id=>['fusion_summon','miracle_fusion','power_bond'].includes(card(id)?.effect_code));if(fusionSpell)await playSpellFor('enemy',s.hand.indexOf(fusionSpell));else{const contact=fusionCandidates('enemy').find(e=>card(e.id).contact);if(contact)await fuse('enemy',null,contact.id);}
   let normal=s.hand.map((id,index)=>({id,index,c:card(id)})).filter(e=>e.c.card_type==='Monster'&&usable('enemy',e.c)).sort((a,b)=>b.c.atk-a.c.atk);if(window.memePhase2)normal=memePhase2.normalCandidates('enemy',normal);for(const x of normal){const need=x.c.tribute_count??(x.c.stars>=7?2:x.c.stars>=5?1:0),pool=E('enemy').filter(e=>!e.extra&&!e.slot.noTribute).sort((a,b)=>stat('enemy',a.slot)-stat('enemy',b.slot));if(pool.length<need||free('enemy')<0&&!need)continue;const position=x.c.def>x.c.atk+500&&x.c.atk<1500?'def_down':'atk';if(await normalSummon('enemy',s.hand.indexOf(x.id),position,pool.slice(0,need).map(e=>e.index)))break;}
   for(const e of [...E('enemy')])if(card(e.slot.id)?.effect_trigger==='activated'&&e.slot.effectUsedRound!==duel.round){await activateMonster('enemy',e.index,e.extra);break;}
   const xyzId=s.extraDeck.find(id=>card(id)?.xyz_requirement&&!extraSummonProblem('enemy',id)&&xyzOptions('enemy',id).length);if(xyzId&&duel===match&&!duel.finished)await xyzSummon('enemy',xyzId);
   const spells=[...s.hand].filter(id=>card(id).card_type==='Spell'&&!['fusion_summon','miracle_fusion','power_bond','ritual'].includes(card(id).effect_code)).sort((a,b)=>(window.memePhase2?.spellScore('enemy',card(b))||0)-(window.memePhase2?.spellScore('enemy',card(a))||0));let played=0;for(const id of spells){if(duel.finished)break;if(window.memePhase2&&memePhase2.spellScore('enemy',card(id))<=0)continue;if(await playSpellFor('enemy',s.hand.indexOf(id)))if(++played>=(window.memePhase2?.settings.difficulty==='hard'?4:window.memePhase2?.settings.difficulty==='easy'?1:2))break;}
   const trap=s.hand.find(id=>card(id).card_type==='Trap');if(trap&&s.spells.includes(null)){await fx('enemy',null,'set',[],()=>{s.hand.splice(s.hand.indexOf(trap),1);s.spells[s.spells.indexOf(null)]={id:trap,faceDown:true,setRound:duel.round};},{title:'Đối thủ úp bài',text:'Một lá bài được đặt úp.'});}
   if(!skillProblem('enemy',true))await skillFor('enemy');
  });if(duel!==match||duel.finished)return;duel.phase=duel.round===1?'MAIN1':'BATTLE';render();
  for(const e of [...E('enemy')])for(let i=0;i<3&&canAttack(e.slot);i++){if(duel!==match||duel.finished||duel.phase!=='BATTLE')break;const targets=targetList('player').filter(t=>!has(e.slot,'attack_all')||!e.slot.attackTargets?.includes(t.slot.uid)),target=window.memePhase2?memePhase2.attack('enemy',e.slot,targets):targets.find(t=>stat('enemy',e.slot)>(t.slot.position==='atk'?stat('player',t.slot):stat('player',t.slot,'def')));if(targets.length&&!target&&!directAllowed('enemy',e.slot))break;await perform(()=>battle('enemy',e.index,e.extra,target?.index??null,target?.extra||false));}
  if(duel!==match||duel.finished)return;await perform(async()=>{await endTurn('enemy');if(duel.finished)return;duel.turn='player';duel.phase='MAIN1';duel.round++;duel.normalSummoned=false;beginTurn('player');await fx('player',null,'draw',[],()=>drawCards('player',1),{title:'Lượt của bạn',text:'Rút 1 lá từ Deck.'});});
 };
 function skillCandidates(n,h){if(h.code==='destiny')return choices(S(n).deck,'deck').slice(0,5);if(h.code==='jaden')return choices(S(n).deck,'deck').filter(e=>['fusion_summon','miracle_fusion','mask_change','mask_change_ii'].includes(card(e.id)?.effect_code));return choices(S(n).deck,'deck').filter(e=>h.code==='destiny'||({kaiba:['Blue-Eyes White Dragon'],joey:['Time Wizard','Red-Eyes Black Dragon'],pegasus:['Toon World','Black Illusion Ritual'],jaden:['Polymerization','Miracle Fusion'],zane:['Cyber Dragon','Power Bond'],mai:['Harpie Lady','Elegant Egotist']}[h.code]||[]).map(aid).includes(e.id));}
 function skillProblem(n,internal=false){if(window.memeOpening?.pending())return 'Chờ tung xu chọn lượt.';if(!duel||duel.finished)return 'Trận đấu đã kết thúc.';const s=S(n),h=getHero(s.heroId);if(s.skillUsed)return 'Đã dùng kỹ năng trong trận này.';if(duel.turn!==n||!['MAIN1','MAIN2'].includes(duel.phase))return 'Dùng trong MAIN của bạn.';if(duel.mode)return 'Hoàn tất thao tác chọn bài trước.';if(!internal&&(busy||window.memeFx?.busy))return 'Chờ hoạt ảnh hiện tại hoàn tất.';if(h.code==='destiny'&&s.lp>2000)return 'Trái Tim Lá Bài cần LP từ 2000 trở xuống.';if(['kaiba','zane','pegasus','mai'].includes(h.code)&&s.lp<=lpFee(1000))return `Cần ít nhất ${lpFee(1000)} LP để trả phí kỹ năng.`;if(['kaiba','zane'].includes(h.code)&&!s.hand.length)return 'Cần 1 lá trên tay làm chi phí.';if(h.code==='jaden'&&!E(n).some(e=>face(e.slot)&&/\bHERO\b/.test(card(e.slot.id)?.name_en||'')))return 'Cần 1 HERO đang ngửa trên sân.';if(!skillCandidates(n,h).length&&!(h.code==='pegasus'&&S(other(n)).hand.length))return 'Không còn lá phù hợp trong Deck.';return '';}
 async function skillFor(n){const problem=skillProblem(n,true);if(problem)return false;const s=S(n),h=getHero(s.heroId),discardGroup=['kaiba','zane'].includes(h.code),payGroup=['kaiba','zane','pegasus','mai'].includes(h.code),cost=discardGroup?await discard(n,'Đổi 1 lá trên tay làm chi phí kỹ năng'):null;if(discardGroup&&!cost)return false;
  if(h.code==='pegasus'&&S(other(n)).hand.length)await pick(n,'Con Mắt Ngàn Năm: xem tay đối thủ',choices(S(other(n)).hand,'hand'),{optional:true,text:'Chọn một lá hoặc bấm Bỏ qua để tiếp tục; không lấy lá đối thủ.'});
  const target=await pick(n,'Kỹ năng '+h.name+': chọn lá trong Deck',skillCandidates(n,h),{optional:h.code==='pegasus'});if(!target&&h.code!=='pegasus')return false;
  return fx(n,null,'skill',[],()=>{if(payGroup&&!payLp(n,1000,'skill'))return;takeDiscard(n,cost);if(target){const i=s.deck.indexOf(target.id);if(i>=0){window.memeCardMotion?.record('search',n,target.id);s.hand.push(s.deck.splice(i,1)[0]);}s.deck=shuffle(s.deck);}s.skillUsed=true;log(`✦ ${h.name}: ${h.skill}!`);},{heroId:h.id,title:h.skill,text:h.description,cost:payGroup?lpFee(1000)+' LP':null});
 }
 heroSkillProblem=skillProblem;useHeroSkill=(n='player')=>{const problem=skillProblem(n);if(problem){if(n==='player')notify(problem);return false;}return perform(()=>skillFor(n));};
 heroStyle=h=>`--hero-color:${h.color};--hero-pos:${h.position};--hero-x:${h.tile%4/3*100}%;--hero-y:${Math.floor(h.tile/4)/2*100}%`;
 const originalChoose=chooseHero;chooseHero=id=>{originalChoose(id);const h=getHero(chosenHero),box=$('selectedHeroSummary').querySelector('div');if(box){const label=box.querySelector('span');if(label)label.textContent='Kỹ năng nhân vật · MAIN · 1 lần/trận';const b=document.createElement('button');b.className='anime-deck-shortcut';b.textContent='🃏 Xem bộ mẫu của '+h.name.split(' / ')[0];b.onclick=()=>{openDeckBuilder();deckDraft.cards=[...MEME_DECK_PRESETS[h.primaryDeck]];deckDraft.extra=[...MEME_EXTRA_PRESETS[h.primaryDeck]];deckDraft.name=h.primaryDeck;renderDeckBuilder();};box.appendChild(b);}};
 renderHeroRoster();document.querySelector('.hero-heading .eyebrow').textContent='DM / GX · NHÂN VẬT ANIME';document.querySelector('.hero-heading h1').textContent='Chọn huyền thoại của bạn';document.querySelector('.hero-heading p').textContent=HEROES.length+' đấu sĩ · Kỹ năng riêng · '+Object.keys(MEME_DECK_PRESETS).length+' bộ bài';
 const inspector=renderInspector;renderInspector=()=>{inspector();const sel=duel?.selected;if(!sel||sel.name!=='player'||duel.mode||!mainPhase())return;const s=S('player'),id=sel.type==='hand'?s.hand[sel.index]:sel.type==='monster'?s.monsters[sel.index]?.id:sel.type==='extra'?s.extra?.id:s.spells[sel.index]?.id,c=card(id),actions=$('inspectActions');if(!c||!actions)return;
  if(sel.type==='hand'&&c.card_type==='Monster'){
   if(c.special_only){
     actions.innerHTML='';
     if(c.ritual_spell)addAction(actions,'🕯 Dùng Nghi Lễ trên tay',()=>{const i=s.hand.indexOf(c.ritual_spell);if(i>=0)playSpell(i);else {const msg='Cần '+card(c.ritual_spell).name+' trên tay.';window.showActionNotice(msg);log(msg);}});
   }
   if(specialMode('player',c)){
     addAction(actions,'✦ Triệu hồi đặc biệt',()=>perform(()=>specialSummon('player',sel.index)));
   } else if(c.special_only || c.traits?.some(t => ['cyber_special','bubbleman','valkyrion','shining_dragon','harpie_name','gagaga_special','kagetokage_special'].includes(t)) || c.id === 'DL-blue_eyes_alternative_white_dragon'){
     const prob = cardSpecialProblem('player', c);
     addAction(actions,'✦ Triệu hồi đặc biệt',()=>window.showActionNotice(prob, 'Chưa thể Triệu hồi ĐB'), true);
   }
   if(c.hand_action)addAction(actions,'✦ Hiệu ứng từ tay',()=>perform(()=>resolveEffect('player',c,{source:null,fromHand:true})));
  }
  if(['monster','extra'].includes(sel.type)){
   const slot=sel.type==='extra'?s.extra:s.monsters[sel.index],old=[...actions.querySelectorAll('button')].find(b=>b.textContent.includes('Đổi thế'));if(slot&&old){const b=old.cloneNode(true);old.replaceWith(b);if(slot.position==='def_down')b.textContent='↥ Triệu hồi Lật';b.disabled=slot.changedPositionRound===duel.round||!!slot.attacksUsed||allFields().some(e=>face(e.slot)&&has(e.slot,'restrict')&&e.slot!==slot);b.onclick=()=>{if(!mainPhase()||b.disabled)return;return perform(()=>changePosition('player',sel.index,sel.type==='extra'));};}
  }
 };
 const detail=renderDeckInspector;renderDeckInspector=()=>{detail();const c=card(deckInspectedId),body=document.querySelector('.deck-inspect-body');if(c&&body){const note=document.createElement('div');note.className='anime-source-note';note.innerHTML=`<details><summary>Tên gốc để đối chiếu</summary><b>${esc(c.name_en)}</b></details>`;body.prepend(note);}};
 function setBackrow(index,type){if(!mainPhase()||duel.mode)return;const s=S('player'),id=s.hand[index],c=card(id);if(c?.card_type!==type)return;if(!s.spells.includes(null)){log('Không còn ô Phép/Bẫy trống.');return;}return perform(()=>fx('player',c,'set',[],()=>{s.hand.splice(index,1);s.spells[s.spells.indexOf(null)]={id,faceDown:true,setRound:duel.round};duel.selected=null;}));}
 setTrap=index=>setBackrow(index,'Trap');window.memeSetSpell=index=>setBackrow(index,'Spell');
 const supported=new Set(['warrior_inspire','search_gazelle','obelisk','ra','thunder_search','time_wizard','gilford','absorb','hummingbird','dolphin','draw_n','cyberdark_equip','cyber_valley','discard_destroy','thunder_giant','aqua_neos','fusion_summon','charity','anime_reborn','dark_hole','destroy_all_opponent_monsters','duster','swords','card_destruction','control','destroy_spell_target','dark_magic_attack','flute','toon_world','ritual','miracle_fusion','power_bond','de_fusion','fusion_search','skyscraper','equip_atk_n','multiply','scapegoat','lambs','reincarnate','premature','heal_n','destroy_attack_position','magic_cylinder','negate_battle','trap_hole','torrential','haunted','seven_tools','magic_jammer','waboku','dust_tornado','egotist','cyber_shield','rose_whip','amazon_spellcaster','amazon_chain','shadow_of_eyes','mirror_wall','amazoness_archers','dramatic_rescue','heavy_storm','snatch_steal','delinquent_duo','imperial_order','painful_choice','safe_return','ecstasy_spark','phoenix_formation','hunting_ground','amazon_village']);
 window.memeRules={...base,stat,canAttack,remove,damage,beginTurn,supported,execute:(n,c,ctx)=>effect(n,c,ctx),canExecute:(n,c)=>{if(!c||!c.effect_code)return false;return c.effect_code==='fusion_summon'?fusionCandidates(n).length>0:true;},counter:()=>false,negateSpell:()=>false,aiSpecialSummon:()=>{}};
 for(const code of ['p3_zero','p3_shining','p3_gaia','p3_tornado','p3_terra','p3_escuridao','p3_ocean','p3_stratos','p3_umi','p3_woodsman','p3_shadow_mist','masked_fountain','masked_vapor','masked_acid','masked_dian','masked_blast','masked_koga','masked_divine','mask_change','mask_change_ii','gagaga_level','gagaga_girl','leviathan_charge','cowboy_shot','zubaba_general','onomatopaira','gagagabolt','gagagaguard','half_unbreak'])supported.add(code);
 window.memeAnime={choose:pick,trapProblem,get manualTraps(){return manualTraps;},setManualTraps(v){manualTraps=false;localStorage.removeItem('meme-manual-traps');},get busy(){return busy;},get choosing(){return !!cancelChoice;},cancelChoice(){cancelChoice?.();},setAuto(v){auto=!!v;},directAllowed,perform,fx,flush,resolveEffect,playSpellFor,playSetSpellFor,normalSummon,specialSummon,specialMode,postSummon,fuse,fusionOptions,transform,transformationOptions,battle,endTurn,revivalPosition,skillFor,skillProblem,registerGraveGuard:guard=>{graveGuards.push(guard);},attacksRemaining:slot=>Math.max(0,attackLimit(slot)-(slot.attacksUsed||0)),levelOf,xyzReq,xyzPool,xyzOptions,xyzSummon,xyzDetach,xyzDump,supported};
 window.memeAnime.chooseMany=pickMany;
 window.memeAnime.changePosition=changePosition;
 window.memeAnime.tcgCore={S,E,face,has,uid,free,allFields,extraOpen,placeOnField,targetList,spellList,choices,pick,pickMany,enqueue,fx,flush,stat,remove,clearSpell,revive,revivalPosition,takeDiscard,drawCards,damage,heal:base.heal,spendSpellSource,commitSpellSource,negateSpell,postSummon,specialSummon,normalSummon,fuse,resolveEffect,spellTargetAllowed,materialPool,sentToGrave};
 showCredits=()=>showModal('<h2>Tranh Anime DM / GX</h2><p>Toàn bộ 171 lá và Cừu Thế Thân có tranh minh họa phỏng theo anime, được tạo bằng AI và lưu cùng game. Hình ảnh là bản minh họa phỏng theo, tên Việt và hiệu ứng được viết riêng cho sân H5.</p>');
 showRules=()=>showModal('<h2>Anime DM / GX · Luật H5</h2><ul><li>4000 LP · Main 20–30 lá · Extra tối đa 10. Online: 60 giây cho toàn bộ MAIN 1 / Battle / MAIN 2; hết giờ tự kết thúc lượt. Bộ mẫu theo 7 nhân vật.</li><li>Người đi trước không có Battle Phase trong lượt đầu: MAIN 1 → kết thúc lượt. Người đi sau được đánh từ lượt 2 của trận.</li><li>Quái thường 1 lần/lượt; 5–6 sao hiến tế 1, từ 7 sao hiến tế 2. Các Thần và Gilford cần 3.</li><li>Dung Hợp dùng nguyên liệu tay/sân. Miracle Fusion trục xuất sân/Mộ; Power Bond có sát thương cuối lượt. Contact Fusion dùng nguyên liệu trên sân, không cần Phép.</li><li>Hiệu ứng được trình bày bằng hoạt ảnh rồi mới áp dụng. Có thể bấm Bỏ qua hiệu ứng.</li><li>Phép có thể úp và lật lên để dùng trong MAIN của bạn. Bẫy phải chờ sang lượt sau khi úp. Bẫy tự phản ứng khi đủ điều kiện; bạn vẫn chọn mục tiêu và chi phí. Bão Bụi, Tiếng Gọi Người Chết và Waboku có thể chủ động kích hoạt; các Bẫy phản đòn vẫn chờ đúng tình huống. Jinzo vô hiệu Bẫy. Kỹ năng anime riêng của mỗi nhân vật, 1 lần/trận.</li><li>Đây là bản phỏng theo anime cho sân 3 ô, có ghi điều chỉnh H5 trên từng lá. Đủ 5 phần Exodia trên tay là thắng.</li></ul>');$('helpBtn').onclick=showRules;$('rulesBtn').onclick=showRules;
 // Incoming snapshots replay unseen effects before exposing their final state.
 let remoteChain=Promise.resolve(),remoteMatch=null,remoteSerial=0;const receive=window.memeOnlineReceive;
 window.memeOnlineReceive=msg=>{if(msg?.type!=='MEME_ROOM_STATE'||!msg.state||!window.memeOnlineIsPlaying?.())return receive(msg);const room=memeRoom;if(msg.id!==room?.peerId||msg.targetId!==memeMyId()||msg.roomId!==room.code)return;
  remoteChain=remoteChain.then(async()=>{if(memeRoom!==room||msg.state.round<duel?.round||!Number.isSafeInteger(msg.version)||msg.version<=room.lastRemoteVersion)return;const incoming=memeMirror(msg.state);if(remoteMatch!==incoming.animeMatchId){remoteMatch=incoming.animeMatchId;remoteSerial=0;}if(duel?.animeMatchId===incoming.animeMatchId)remoteSerial=Math.max(remoteSerial,duel.animeSerial||0);for(const event of incoming.animeEvents||[]){if(event.serial<=remoteSerial)continue;if(event.kind==='attack')await window.memeFx.attack(event.owner,event.index,event.extra,event.targetIndex,event.targetExtra,()=>{});else await window.memeFx.resolveCard(event,()=>{});remoteSerial=event.serial;if(memeRoom!==room)return;}if(memeRoom!==room||msg.state.round<duel?.round)return;if(incoming.turn==='player'&&duel?.turn!=='player'&&!incoming.finished)await window.memeFx.resolveCard({owner:'player',kind:'draw',title:'Lượt của bạn',text:'Rút 1 lá từ Deck.'},()=>receive(msg));else receive(msg);if(duel&&!duel.finished&&duel.turn==='player')await perform(async()=>{});}).catch(error=>{console.error('Anime playback:',error);if(memeRoom===room)receive(msg);});return remoteChain;
 };
})();
