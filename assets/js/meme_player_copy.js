// Keep the card face useful during a duel; retain audit/version notes in the catalogue.
(() => {
 const clean=text=>String(text||'').replace(/\s*(?:Thiết kế H5|Chuyển thể H5|Bổ sung H5|H5 giới hạn|Bản phỏng theo anime DM\/GX)[^.]*\./g,'').replace(/\s*Không dùng mô tả TCG hiện hành\./g,'').replace(/\s*Không xác nhận là hiệu ứng anime nguyên gốc\./g,'').replace(/Quái thường\. Không có hiệu ứng\./g,'Quái thường.').replace(/\s+/g,' ').trim();
 for(const c of CARDS){c.audit_description??=c.description;c.description=clean(c.description);}
 const fixedFees={'AN-toon_world':1000,'AN-premature_burial':800,'AN-seven_tools_of_the_bandit':1000};
 if(window.memeLpCosts)for(const [id,tcg]of Object.entries(fixedFees)){const c=card(id),actual=memeLpCosts.fixed(tcg),pattern=new RegExp('\\b'+tcg+'(?=\\s*LP)','g'),detailPattern=new RegExp('\\b'+tcg+'\\b','g');if(!c)continue;c.description=c.description.replace(pattern,String(actual));c.fixed_lp_costs=[{tcg,game:actual}];const d=window.MEME_CARD_DETAILS?.[id];if(d)for(const key of ['condition','cost','limit'])if(d[key])d[key]=d[key].replace(detailPattern,String(actual));}
 const corrections={
  'AN-megamorph':{description:'Nếu LP của bạn thấp hơn đối thủ, ATK của quái được trang bị bằng hai lần ATK gốc. Nếu LP của bạn cao hơn, ATK bằng một nửa ATK gốc. LP bằng nhau thì không đổi ATK. Xét LP của người điều khiển lá trang bị.',condition:'Chọn 1 quái ngửa trên sân để trang bị, kể cả quái đối thủ.',cost:'Không có chi phí LP.'},
  'AN-premature_burial':{description:'Trả 400 LP, chọn 1 quái trong Mộ của bạn; triệu hồi đặc biệt ở thế công và trang bị lá này cho quái đó. Khi lá này bị phá hủy, phá quái đã hồi sinh.',condition:'Cần hơn 400 LP, ô quái và ô Phép/Bẫy trống. Quái được gọi ở thế công.',cost:'Trả 400 LP khi kích hoạt; bị vô hiệu vẫn mất phí.'},
  'AN-magic_jammer':{description:'Khi một lá Phép được kích hoạt: bỏ 1 lá trên tay làm chi phí; vô hiệu việc kích hoạt và phá hủy lá Phép đó. Dù Bẫy này bị vô hiệu, lá đã bỏ không được hoàn lại.',condition:'Bẫy phản đòn: phản ứng khi Phép được kích hoạt; phải được úp từ lượt trước.',cost:'Bỏ 1 lá trên tay ngay khi kích hoạt, trước các phản ứng tiếp theo.'}
 };for(const [id,fix]of Object.entries(corrections)){const c=card(id);if(!c)continue;c.description=fix.description;if(id==='AN-premature_burial'){c.revival_position='atk';c.spell_category='Trang Bị';}const d=window.MEME_CARD_DETAILS?.[id];if(d){d.condition=fix.condition;d.cost=fix.cost;}}
 window.memePlayerCopy={clean};
})();
