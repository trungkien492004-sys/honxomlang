# Yu-Gi-Oh! DM / GX — Anime Duel

Game web thuần HTML/CSS/JavaScript. Firebase Authentication quản lý tài khoản;
Firestore đồng bộ nhân vật, hiện diện, chat và sự kiện giữa người chơi.

## Chạy và kiểm tra tại máy

```powershell
npm run build
npx firebase-tools emulators:start --only hosting,firestore
```

Bản phát hành nằm trong `dist/` và chỉ chứa `index.html`, `memecard.html` và
`assets/`. Không triển khai cả thư mục mã nguồn vì ở đó còn có dữ liệu và file thử nghiệm.

## Thiết lập Firebase trước khi phát hành

1. Mở dự án Firebase `honxomlang-e6974`, bật Google trong **Authentication > Sign-in method** và thêm tên miền Hosting vào **Authorized domains**.
2. Đăng nhập Firebase CLI: `npx firebase-tools login`.
3. Triển khai rules: `npx firebase-tools deploy --only firestore:rules`.
4. Triển khai web: `npm run build` rồi `npx firebase-tools deploy --only hosting`.
5. Đăng nhập hai tài khoản Google khác nhau trên hai thiết bị để kiểm tra danh sách người chơi, lời mời, chat và một trận cờ/bài.

## Chơi Yu-Gi-Oh! online

Hai người đăng nhập bằng hai tài khoản Google khác nhau. Trong game, cùng mở
**Yu-Gi-Oh! DM / GX** rồi bấm **Vào trận**. Một người chọn **Tạo phòng online**,
đặt mã phòng và gửi mã cho bạn. Người còn lại chọn **Vào phòng online** và nhập
đúng mã đó. Khi thấy tên bạn chơi, chủ phòng bấm **Bắt đầu trận đấu**.

Người đi trước không được tấn công hoặc vào Battle Phase ở lượt mở đầu của trận:
MAIN 1 → kết thúc lượt. Khóa này áp dụng cả đòn trực tiếp, đánh nhiều lần, Toon,
quái Extra và tấn công từ thế thủ. Người đi sau được Battle ngay lượt đầu của mình
(lượt 2 của trận); từ lượt 3, người đi trước được Battle bình thường.

Mỗi lượt online có tổng cộng 60 giây cho MAIN 1, Battle và MAIN 2. Đổi giai đoạn,
xem bài hoặc gửi lại trạng thái không đặt lại giờ. Đồng hồ đếm ngược trên sân,
đỏ khi còn 10 giây. Hết giờ hủy lựa chọn dang dở, giải quyết hiệu ứng cuối lượt,
rồi tự chuyển lượt và rút đúng một lá cho người kế tiếp. Chủ phòng xử lý hết giờ
cho cả hai bên, kể cả khi khách không bấm nút. Trạng thái của lượt cũ bị bỏ qua.
Giờ dựa trên mốc kết thúc, cập nhật khi quay lại tab; đấu máy không bật giới hạn.

Toàn bộ 156 lá dùng tên Việt trên bài, trình chọn, sân và nhật ký. Nội dung hiệu ứng,
nguyên liệu Dung Hợp và các tên bài được nhắc trong hướng dẫn cũng được Việt hóa.
Tìm kiếm nhận cả tên Việt lẫn tên tiếng Anh; tên gốc có thể mở để đối chiếu trong
chi tiết bài và có cột riêng trong Excel. Mã lá, công thức, tên tài khoản và bộ bài
đã lưu được giữ nguyên. Kỹ năng nhân vật dùng cùng tên bài tiếng Việt.

## Hiệu ứng, hình bài và nhạc nền

### Nâng cấp đợt 1 ngày 25 tháng 10 năm 2026

Lớp trình bày cuối là `meme_upgrade_phase1.js/css`. Màn xây bộ có kho 4–5 cột
desktop, bộ lọc tộc/thuộc tính/sao/vai trò, khung tra cứu và Main/Extra trực quan;
điện thoại chuyển giữa ba vùng. Ảnh từng lá và ảnh thu nhỏ được tách từ atlas bằng
`node scripts/build-duel-presentation.cjs`, giữ nguyên hình và ID. Bài tay giữ tỷ lệ
dọc, avatar lớn hơn, nhật ký có lịch sử, có ba mức trình diễn ở nút bánh răng.

`npm test` bao gồm `scripts/test-upgrade-phase1.cjs`. Báo cáo và bảng đối chiếu đủ
156 lá nằm trong `outputs/upgrade-phase1`. Đợt 1 chưa thay hiệu ứng từng lá, AI,
chính sách counter hoặc kiến trúc luật online; các mục đó thuộc đợt 2.

Quái bình thường khi vào sân chỉ có ánh nền nhẹ. Các lá UR, quái từ bộ bài phụ,
quái Nghi Lễ và chủ lực từ 7 sao có màn xuất hiện riêng. Phép/Bẫy thường có bảng
kích hoạt gọn, không phủ vòng xoáy toàn màn hình. Hiệu ứng giữ hình lâu hơn trước
khi áp dụng và có khoảng dừng sau kết quả. Có thể bỏ qua hoặc bật giảm chuyển động.
Đòn đánh của quái nhỏ dùng tia mảnh; hình ảnh và phép tính sát thương cùng một lần xử lý.

Toàn bộ 156 lá và Cừu Thế Thân có tranh minh họa riêng. Bốn atlas mới, ánh xạ từng
lá trong `assets/data/anime-art-atlases.json`, bổ sung 133 tranh cho 24 tranh đã có.
Bộ bài trên tay dùng kích thước cố định lớn hơn; khi nhiều lá có thể vuốt ngang,
vẫn giữ sân, thông tin bài và nút thao tác trong một màn hình.

Hồi Sinh Quái Vật, Chôn Sống, Chimera và Giải Dung Hợp cho chọn thế công/thủ trước
khi dùng bài hoặc trả chi phí. Hủy không mất bài hay LP. Nguồn có trường
`revival_position` buộc tư thế được giữ nguyên. Trong luật H5 hiện tại, Tiếng Gọi
Người Chết vẫn bắt buộc hồi sinh ở thế thủ để đỡ đòn. Giải Dung Hợp đếm đúng số bản
nguyên liệu trùng tên và cho chọn tư thế từng quái. Tư thế được đồng bộ online.
Khi hồi sinh trong lượt đối thủ, chủ lá bài có 5 giây chọn tư thế; hết thời gian
sẽ dùng thế thủ. Lựa chọn này không dừng hoặc kéo dài đồng hồ lượt.

Nhạc gốc lấy từ [playlist NhacCuaTui do chủ dự án chọn](https://www.nhaccuatui.com/playlist/aUMoplWD48x5),
qua bản tải công khai 128kbps. Sảnh/chọn bài dùng Kawaita Sakebi có lời. Trong trận:
Voice Beat khi cả hai trên 2000 LP; Shuffle Beat khi bên thấp hơn còn 1001–2000 LP;
Wild Drive Beat khi bên thấp hơn còn từ 1000 LP trở xuống. Nhạc chuyển nhẹ, phát lặp,
có nút nhạc riêng, âm lượng riêng và tạm dừng khi ẩn tab/đóng game. Trình duyệt có
thể yêu cầu chạm màn hình trước khi cho phát. Nguồn và tác giả ở
`assets/audio/duel/tracks.json`; các tệp âm thanh tải cùng bản game.

## Avatar và kỹ năng đấu sĩ

Chọn một nhân vật ở sảnh để mang avatar và thẻ kỹ năng vào trận. Lựa chọn được
lưu trên trình duyệt, độc lập với bộ bài. Nhân vật đứng ở góc sân; bấm thẻ ở góc
hoặc avatar cạnh thanh LP để đọc và kích hoạt kỹ năng. Có thể xem kỹ năng đối thủ.

| Đấu sĩ | Kỹ năng anime |
| --- | --- |
| Yugi / Atem | LP ≤2000: chọn 1 lá từ Deck lên tay. |
| Kaiba | Bỏ 1 lá: lấy Blue-Eyes White Dragon từ Deck. |
| Joey | Bỏ 1 lá: lấy Time Wizard hoặc Red-Eyes từ Deck. |
| Pegasus | Xem tay đối thủ, tìm Toon World hoặc Black Illusion Ritual. |
| Jaden / Judai | Có HERO: tìm Polymerization hoặc Miracle Fusion. |
| Zane / Ryo | Bỏ 1 lá: tìm Cyber Dragon hoặc Power Bond. |

Mỗi người có **1 lần dùng kỹ năng trong một trận**, trong MAIN 1 hoặc MAIN 2
của mình, sau khi hoàn tất thao tác đang chọn và đáp ứng điều kiện trên thẻ kỹ năng.
AI cũng dùng kỹ năng; trận online đồng bộ avatar, hiệu ứng và trạng thái
đã dùng giữa hai người. Nhân vật đã chọn không đổi trong trận đang chơi.

## Xóm Arcana — Anime DM / GX (24/10/2026)

Kho đang chơi có **156 lá**, gồm 28 Dung Hợp / hợp thể và đủ nguyên liệu của chúng,
18 bộ mẫu cho Yugi/Atem, Kaiba, Joey, Pegasus, Jaden/Judai và Zane/Ryo. Đây là
phần tuyển chọn DM/GX có luật phỏng theo anime cho sân H5, không bao gồm toàn bộ
hàng nghìn lá anime. Mỗi lá ghi điều chỉnh H5 để người chơi biết cách áp dụng.

Main 20–30 lá, Extra tối đa 10. Mỗi tên tối đa 3 bản trừ các lá ghi giới hạn riêng.
Dung Hợp dùng nguyên liệu tay/sân và Phép; Miracle Fusion dùng sân/Mộ và trục xuất;
Power Bond tăng gấp đôi ATK gốc rồi gây sát thương cuối lượt. Contact Fusion dùng
đúng nguyên liệu trên sân, không cần Phép. Nghi Lễ dùng tổng sao nguyên liệu.

- Cơ chế anime: Time Wizard hóa Baby Dragon thành Thousand Dragon; Toon né đòn
  đầu mỗi lượt; Exodia thắng khi đủ 5 phần; Osiris theo tay bài, Obelisk hiến tế,
  Ra đổi LP; Relinquished hấp thụ, HERO đốt/hồi LP, Cyber đánh nhiều lần/xuyên thủ.
- Mọi hành động qua hàng đợi: hiện lá và mục tiêu trước, sau đó áp dụng kết quả.
  Phá hủy, hồi sinh, Nghi Lễ, Dung Hợp, kỹ năng và phản ứng Bẫy có hoạt ảnh. Online
  phát lại sự kiện mới rồi mới nhận kết quả, bỏ qua gói cũ. Có nút bỏ qua hoạt ảnh
  và hỗ trợ giảm chuyển động. Trong hoạt ảnh khóa các hành động game khác.
- Sáu nhân vật có chân dung và kỹ năng riêng, dùng trong MAIN một lần/trận.
  Bấm nút bộ mẫu ở phần kỹ năng để xem/sửa; lưu để dùng cả Main và Extra.
- Bộ bài mới dùng khóa lưu `anime-v1`, giữ lại kho/save classic và 200 lá cũ.
- Màn Sửa bộ bài hiển thị chi tiết bên phải, tìm cả tên Việt/Anh. Excel tải kho
  đang chơi, đủ 18 bộ mẫu và 6 kỹ năng trong ba sheet.

### Trạng thái bài và nhắc Battle

`meme_battle_guide.js` hiển thị rõ ÚP/NGỬA và CÔNG/THỦ. Bài úp của mình có hình
thu nhỏ để nhận diện; bài úp đối thủ không hiện tên, hình, chỉ số hoặc tên trong
nhãn hỗ trợ đọc màn hình. Bẫy úp ghi rõ tự lật khi đúng điều kiện.

Trong Battle của mình, quái đánh được có viền xanh, mũi tên và số đòn còn lại;
đánh hết lượt thì có nhãn ĐÃ ĐÁNH. Nút chọn quái chỉ chọn để xem thao tác, không
tự tấn công. Khi rời Battle mà vẫn còn quái đánh được, có nhắc tiếp tục đánh
hoặc chủ động bỏ lượt đánh để sang MAIN 2. Trạng thái cập nhật ngay sau hoạt ảnh,
dùng cùng điều kiện đánh của engine, gồm quái đánh hai lần, khóa đánh và thế thủ.
Đây là hướng dẫn giao diện; không thay đổi bộ luật đang chơi.

Tham chiếu nguyên tắc úp/ngửa và tấn công: [hướng dẫn Speed Duel của Konami](https://www.yugioh-card.com/eu/wp-content/uploads/2022/07/Speed_Duel_Guide_EN.pdf).

Nguồn dữ liệu: `assets/data/arcana-anime.json`; tạo từ `scripts/build-anime-catalog.cjs`.
Engine đang dùng: `meme_anime_rules.js`. Catalog classic/200 và các engine cũ
được giữ làm bản lưu, không nạp trong trang đấu hiện tại.

## Cờ đua — giao diện và xử lý lượt mới

`board_upgrade.js` sửa các lỗi đã tái hiện: dùng sai tên ô ngẫu nhiên, ô sau khi lùi
bẫy không cập nhật, các nhánh ẩn/hiện tab xử lý khác nhau, cộng thưởng thắng hai lần,
mạng âm, bộ đếm cũ tiếp tục tác động sau khi đóng/mở ván, và đăng ký kéo bản đồ lặp.
Khi đánh bại quái bằng vũ khí, nhận vàng đúng mức thưởng ghi trong dữ liệu.

Online: chủ phòng xử lý xúc xắc, di chuyển, bài và tiền; máy khách gửi yêu cầu theo
lượt. Gói sai người, sai lượt và trạng thái cũ bị bỏ qua. Khách vẫn chọn giao chiến
và mua đồ qua cửa sổ 20 giây; mua đồ dùng giá cố định của game. Thưởng trả đúng
người thắng một lần, không dựa vào cờ isHuman của máy chủ. Luồng mời PvP cũ vẫn
có bộ phát trạng thái riêng. Hai người nên tải lại trang trước khi tạo phòng mới.

Giao diện có bản đồ làng SVG gốc với sông, cây, nhà; quân cờ rõ hơn, bảng nhân vật,
thanh tiến độ, bố cục PC/mobile/ngang, kéo bản đồ và đưa camera về người đang đi.
Bài tay dùng trong lượt mình trước khi tung, không chen vào lúc di chuyển.

`npm run build` tạo bản web. `npm test` kiểm tra 156 lá, toàn bộ 28 công thức,
hiệu ứng anime, 18 bộ máy, thời điểm áp dụng sau hoạt ảnh, chuyển lượt, luật ô cờ,
thưởng, đóng/mở ván, khung hình và
hai cửa sổ online riêng cho cả bài lẫn cờ đua. Kiểm tra tiền tệ là logic client
hiện tại của game; không thay thế máy chủ xác thực cho thi đấu có thưởng thực.

## Tài khoản cũ và dữ liệu lưu

Luồng tên người dùng cũ lưu mật khẩu nguyên văn. Theo yêu cầu chủ dự án, bản mới
chỉ cho đăng nhập Google; tài khoản và save gắn với UID `local_` cũ đã được xóa.
Save gắn với tài khoản Google được giữ lại. Người dùng đã dùng lại mật khẩu cũ ở
dịch vụ khác nên đổi mật khẩu tại các dịch vụ đó.

Firestore hiện phục vụ đồng bộ trận đấu và dữ liệu nhân vật từ trình duyệt. Các
trận đấu có thưởng cần logic xác thực phía máy chủ trước khi dùng để thi đấu cạnh
tranh hoặc giao dịch vật phẩm.
