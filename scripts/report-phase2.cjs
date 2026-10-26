const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/upgrade-phase2'),read=f=>JSON.parse(fs.readFileSync(path.join(out,f),'utf8')),sim=read('balance-simulation.json'),audit=read('cards-review-156.json'),effective=JSON.parse(fs.readFileSync(path.join(root,'assets/data/arcana-anime.json'),'utf8')),by=new Map(effective.cards.map(c=>[c.id,c]));
const pct=v=>(v*100).toFixed(1)+'%',causes=sim.matches.reduce((a,m)=>(a[m.finishCategory]=(a[m.finishCategory]||0)+1,a),{}),rarities={};
for(const c of sim.cardUse){const a=rarities[c.rarity]??={cards:0,events:0,participations:0,winsWithActivation:0};a.cards++;a.events+=c.uses;a.participations+=c.matchParticipations;a.winsWithActivation+=c.winsWithActivation;}
const unused=sim.cardUse.filter(c=>!c.uses).map(c=>({...c,reason:!c.presetCopies?'Không có trong 18 bộ mẫu; mô phỏng không đo được.':by.get(c.id)?.fusion_materials?'Có trong Extra; chưa được AI lắp đủ công thức ở các trận này.':by.get(c.id)?.card_type==='Monster'?'Chưa có sự kiện triệu hồi riêng; có thể dùng làm nguyên liệu, không kết luận là lá vô dụng.':'Có trong bộ; cần kiểm tra điều kiện kích hoạt và lựa chọn của AI.'}));
fs.writeFileSync(path.join(out,'balance-analysis.json'),JSON.stringify({causes,winsAfterFusion:sim.matches.filter(m=>m.winnerUsedFusion).length,rarities,unused,interpretation:'Event-use statistics count summons and activations, not every material use. Win with activation is correlated with deck and other cards, not causal card strength. Fusion participation does not establish a combo caused the win.'},null,2));
const report=`# Báo cáo nâng cấp giai đoạn 2

Ngày 25 tháng 10 năm 2026. Phần lõi đã phát hành tại https://honxomlang-e6974.web.app. **Chưa hoàn tất toàn bộ giai đoạn 2: máy chủ mới chưa phát hành do dự án chưa bật Blaze; vẫn còn các giới hạn được nêu bên dưới.**

## Đã phát hành

- Ba mức đấu máy Dễ, Thường, Khó; ba chính sách phản ứng Cân bằng, Phòng thủ, Tiết kiệm. Mở nút Chiến thuật bên dưới nhân vật hoặc trong tùy chọn trận đấu.
- Bẫy Tự chọn và chọn mục tiêu thủ công được giữ nguyên. Tự động đánh giá nguy cơ và tài nguyên, tránh bỏ mảnh Exodia khi có lựa chọn khác. AI chuẩn bị Toon World và Nghi Lễ trước triệu hồi thường.
- Bảy Công Cụ có thể phản lại Bảy Công Cụ khác, giới hạn tổng cộng 6 mắt xích kể cả Bẫy gốc. Chi phí 1000 LP trả lúc tuyên bố, không hoàn nếu bị vô hiệu. Nhiễu Loạn vẫn dùng quy tắc H5 riêng: chọn chi phí trước, chỉ bỏ lá khi Bẫy giải quyết thành công.
- Rà soát đủ 156 mã lá ổn định; 14 lá có sửa mô tả hoặc logic. Các lá Dung Hợp yếu được thêm vai trò xuyên thủ, đỡ đòn hoặc hỗ trợ. Hiệu ứng sáng tạo ghi rõ H5, không khẳng định là nguyên tác anime đã được xác minh.
- Sửa Kuriboh Có Cánh chỉ bảo vệ LP, không làm các quái khác bất tử; trục xuất không kích hoạt hiệu ứng chỉ dành cho Mộ. Sửa bảo vệ mục tiêu của Chúa Tể Loài Rồng. Quái đặt úp không còn bị lịch sử ghi lộ tên.
- Sáu cảnh phản công riêng: Lực Phản Chiếu, Ống Trụ, Hố Bẫy, Bảy Công Cụ, Nhiễu Loạn và khiên Kuriboh. Giữ quái thường sáng nhẹ và các chế độ giảm chuyển động.
- Excel trong game đã cập nhật hiệu ứng và thêm đối chiếu đủ 156 lá. Sổ tay Word cập nhật chain, thao tác mobile, tung xu và các ngoại lệ mới; giữ phần Cờ đua.

## Kiểm tra đã chạy

- Toàn bộ 11 nhóm kiểm tra cũ qua npm test: luật anime, trình diễn, online bằng hai cửa sổ thử, Cờ đua, bố cục, tung xu, lựa chọn Bẫy, nhấn giữ mobile, di chuyển bài, úp Phép và giữ vị trí soạn bộ.
- Kịch bản thực thi riêng cho đủ 156 lá: triệu hồi quái, công thức Dung Hợp hoặc kích hoạt Phép/Bẫy với đầu vào hợp lệ. Có thêm các ca Kuriboh, bảo vệ mục tiêu, phản Bẫy nhiều tầng, đỡ đòn HERO và Kiếm Sĩ Lửa. Điều này không có nghĩa mọi tổ hợp của mọi hiệu ứng đã được duyệt hết.
- Kiểm tra chiến thuật bằng đổi danh tính bài bí mật nhưng giữ thông tin công khai: quyết định không đổi.
- Giao diện chiến thuật lưu được thiết lập trên mobile và PC; sáu cảnh phản công xuất hiện và không có lỗi JavaScript.
- Bản máy chủ thử tại máy: chặn sai lượt/sai revision, gửi lặp chỉ xử lý một lần, che hai thứ tự Deck và tay/Extra đối thủ, lựa chọn đúng người, hết giờ chuyển một lượt/rút một lá, xác nhận mất kết nối sau 90 giây. Hai trình duyệt thử dùng nút thật qua dịch vụ với bản trạng thái riêng. Kết nối Firebase thật còn cần kiểm chứng.
- Đã triển khai Hosting và Firestore rules. Firebase đã biên dịch rules thành công; đây không thay thế kiểm thử quyền đọc bằng tài khoản thật.
- Kiểm tra web thật đã qua: nội dung các tài nguyên trùng bản đã thử, tải Excel đúng, giao diện mobile/PC không tràn, nhạc theo LP, khóa Battle lượt 1, đồng hồ 60 giây, úp/lật Phép, Bẫy và cuộn trình xây bộ.

## Mô phỏng cân bằng

${sim.matchCount} trận, 18 bộ mẫu, mỗi cặp đấu với ba hạt ngẫu nhiên ở mỗi phía đi trước. Mỗi bộ có 102 trận, cùng AI Khó và chính sách Cân bằng. Giữ nguyên xác suất xáo/rút; tắt trình diễn khi tính kết quả. Bên đi trước thắng ${pct(sim.firstWinRate)}, bên đi sau thắng ${pct(1-sim.firstWinRate)}. Trung bình ${sim.averageRounds.toFixed(2)} lượt chung mỗi trận.

| Bộ mẫu | Thắng | Tỉ lệ |
| --- | ---: | ---: |
${sim.decks.map(d=>`| ${d.name} | ${d.wins}/${d.played} | ${pct(d.winRate)} |`).join('\n')}

Kết liễu do chiến đấu ${causes.battle||0} trận, hiệu ứng ${causes.effect||0}, Exodia ${causes.exodia||0}, hết bài ${causes.deckout||0}. Có ${sim.matches.filter(m=>m.winnerUsedFusion).length} trận bên thắng đã Dung Hợp trong trận; đây là số trận có sử dụng Dung Hợp, không chứng minh Dung Hợp là nguyên nhân duy nhất của chiến thắng.

Zane đang thắng nhiều: ba Rồng Máy, nguyên liệu Nguyên Mẫu và Liên Kết Sức Mạnh tạo lối đánh nhanh, nhiều đòn trong sân 4000 LP. Pegasus kinh điển phụ thuộc Toon World hoặc đủ Nghi Lễ, nhiều bài tay khó triển khai. Yugi Thần cần nhiều thân quái hiến tế; Cừu Token không được hiến tế. Đây là nguyên nhân theo cấu trúc bộ; cần thêm dữ liệu hành động theo trận và người chơi thật trước khi kết luận mức giảm sức mạnh. Không tăng đồng loạt quái thường hoặc âm thầm đổi lượt rút để kéo các tỉ lệ về 50%.

Có ${unused.length} lá không ghi nhận sự kiện triệu hồi/kích hoạt riêng; ${unused.filter(c=>!c.presetCopies).length} lá trong số này không nằm trong 18 bộ mẫu. Nguyên liệu đi thẳng vào Dung Hợp cũng có thể không có sự kiện riêng. Không dùng số này để xóa lá yếu tự động. Chi tiết tần suất theo lá và độ hiếm nằm trong balance-analysis.json; tỉ lệ thắng khi lá xuất hiện chỉ là tương quan.

## Phần máy chủ chưa phát hành

Dự án honxomlang-e6974 có billingEnabled=false. Cloud Functions cần gói Blaze theo https://firebase.google.com/docs/functions/manage-functions. Mã nguồn callable, gói luật dùng chung và giao diện nhận trạng thái riêng đã được chuẩn bị, nhưng cờ MEME_SERVER_CONFIG.enabled vẫn false. Không tự bật hoặc liên kết thanh toán.

Online đang hoạt động trên web vẫn dùng truyền trạng thái giữa hai trình duyệt; chưa được coi là an toàn trước việc đọc bài bí mật bằng công cụ trình duyệt. Đồng hồ và kết quả tách khỏi thời lượng animation, chống sửa trạng thái bằng máy khách, kết nối lại trận và xác nhận mất kết nối của máy chủ mới chỉ được thử tại máy.

Sau khi chủ dự án bật Blaze: triển khai duelApi, dùng hai tài khoản kiểm tra quyền và kết nối thật, thử thao tác lặp/hết giờ/tải lại, rồi mới bật cấu hình máy chủ trên Hosting. Các bước cụ thể ở server/README.md.

## Giới hạn cần giữ rõ

- Chưa xác minh hiệu ứng đủ 156 lá theo từng tập anime. Bảng rà soát phân biệt bổ sung H5 và luật H5 đang dùng, không phải một hồ sơ xác nhận nguyên tác.
- Chưa đạt sức mạnh đồng đều giữa mọi bộ mẫu. Mô phỏng dùng một AI nên không thay thế thử nghiệm với người.
- Hệ thống còn dùng bộ xử lý hiệu ứng hiện hữu theo mã và trait, cùng hàng đợi giới hạn; bảng mô tả hiệu ứng độc lập không có nghĩa đã thay toàn bộ engine thành kiến trúc dữ liệu mới.
- Kiểm tra từng lá hiện gồm đường thực thi chính và các tương tác chọn lọc. Chưa có chứng minh vét cạn mọi combo hoặc mọi chuỗi vô hạn.

## Tệp bàn giao

- Kho_bai_DM_GX_giai_doan_2.xlsx
- So_tay_DM_GX_giai_doan_2.docx
- cards-review-156.json và CSV
- balance-simulation.json và balance-analysis.json
- per-card-test-results.json, server-tests.json, authoritative-client-tests.json và regression.log
`;
fs.writeFileSync(path.join(out,'BAO-CAO-GIAI-DOAN-2.md'),report);
fs.writeFileSync(path.join(out,'progress.json'),JSON.stringify({phase:2,status:'core_released_server_pending_billing',release:'20261025-phase2-v1 / anime-dmgx-phase2-v12',website:'https://honxomlang-e6974.web.app',completed:['156-card stable-ID review and 14 executable patches','three reaction policies and three bounded AI levels','nested trap counters and six visual scenes','legacy regressions and live browser verification','918-match balance diagnostics','updated Excel and 33-page Word manual','server and private-view client implementation with local service/browser tests','Hosting and compiled Firestore rules deployed'],remaining:['Owner must enable Blaze before Functions deployment','Deploy and live-test authenticated authoritative online with two accounts','Only then enable server client flag','Further balance tuning and per-episode anime provenance verification','Broader combinatorial effect tests and full data-driven engine refactor'],billingEnabled:false,authoritativeOnlineEnabled:false,simulation:{matches:sim.matchCount,firstWinRate:sim.firstWinRate,averageRounds:sim.averageRounds}},null,2));
console.log('Phase 2 report and progress saved.');
