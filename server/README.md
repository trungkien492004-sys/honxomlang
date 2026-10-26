# Máy chủ trận đấu giai đoạn 2

Trạng thái: mã nguồn và kiểm tra tại máy đã có; **chưa triển khai Cloud Functions, chưa bật cấu hình trên website**. Dự án `honxomlang-e6974` đang chưa bật thanh toán. Không tự liên kết tài khoản thanh toán.

## Cách hoạt động

- Firebase callable `duelApi` xác thực Google UID. Trình duyệt gửi ý định thao tác, không gửi kết quả hoặc trạng thái tự sửa.
- `duel_private/{code}` chỉ dành cho máy chủ; `duel_rooms/{code}/views/{uid}` là bản đã che bài riêng của từng người.
- Dùng đúng mã luật của game đã đóng gói trong `engine/bundle.json`; trình diễn và nhạc tắt khi máy chủ tính luật.
- Lựa chọn nhiều bước lưu trạng thái gốc, hạt ngẫu nhiên và các lựa chọn đã xác nhận để phát lại có kiểm soát. Không giữ một cửa sổ trình duyệt chờ người chơi.
- Kiểm tra phiên bản, lượt, revision và mã thao tác. Trả lại biên nhận nếu cùng mã bị gửi lại.
- Đồng hồ 60 giây không khởi động lại vì đổi phase hoặc animation. Chờ lựa chọn tối đa 12 giây, không vượt hạn lượt. Mất kết nối 90 giây cho phép đối thủ yêu cầu kết thúc.
- Trình duyệt có cờ `MEME_SERVER_CONFIG.enabled=false`; phiên online cũ còn dùng truyền trạng thái giữa hai máy và **chưa bảo mật bài bí mật bằng máy chủ**.

## Rank, NEWBIE và bạn bè

- Hồ sơ rank lưu `played`, `wins`, `losses`, `draws` và Elo khi máy chủ chốt kết quả; bảng RANK đọc cả bốn thống kê theo thời gian thực.
- Hạng theo Elo: Tân Binh (<1000), Đồng (1000), Bạc (1200), Vàng (1400), Bạch Kim (1600), Kim Cương (1800), Cao Thủ (2000+). Màn RANK hiện khoảng Elo còn thiếu tới mốc kế tiếp.
- Tuổi NEWBIE xác minh từ Google Auth: dưới 7 ngày không giới hạn trận rank; từ đủ 7 ngày giới hạn 20 trận rank đã ghép trong mỗi ngày UTC. Hủy tìm trận không bị tính lượt. Bộ đếm nằm trong `rank_daily` và chỉ máy chủ được đọc/ghi.
- Lời mời kết bạn và danh sách bạn lưu riêng trong Firestore; mời bạn đánh thường dùng luồng đấu hiện có và không tiêu hao lượt rank.
- Mã máy chủ đã có luật trên, nhưng rank nhanh và Elo vẫn chưa hoạt động trên web cho tới khi triển khai Cloud Functions. Không bật thanh toán hoặc tự triển khai Functions từ máy khách.

## Kiểm tra tại máy

`npm run test:phase2` xây lại các gói mã, kiểm tra chiến thuật, 156 lá, hình ảnh phản công, dịch vụ máy chủ và hai trình duyệt nhận bản trạng thái riêng. Cần có Chrome và cài các thư viện trong `server/functions`.

Các bài kiểm tra dịch vụ dùng bộ giả lập giao dịch trong bộ nhớ, không xác minh độ cạnh tranh của Firestore thật. Bài kiểm tra trình duyệt dùng kết nối callable giả tại máy, không chứng minh cấu hình Auth, CORS hay quyền truy cập triển khai thực tế.

## Bước phát hành còn lại

1. Chủ dự án tự bật Blaze trong Firebase Console. Đây là điều kiện dùng Cloud Functions và có thể phát sinh phí theo sử dụng.
2. Xây gói mã và chạy lại kiểm tra. Triển khai `functions:duel-authority` cùng Firestore rules.
3. Dùng hai tài khoản thử tạo phòng, lựa chọn phản ứng, hết giờ, tải lại và kết nối lại. Kiểm tra người ngoài không đọc được các bản riêng bằng Firebase thật.
4. Chỉ sau khi qua kiểm tra mới đổi `enabled` thành `true`, phát hành hosting và kiểm tra lại trên web.

Giới hạn tài nguyên cấu hình: `minInstances:0`, `maxInstances:2`, `concurrency:1`, 1 GiB mỗi instance, thời gian tối đa 45 giây mỗi yêu cầu. Các giới hạn này không phải một cam kết giới hạn tổng hóa đơn. Không có lịch tự chạy nền.

Tài liệu Firebase: https://firebase.google.com/docs/functions/manage-functions và https://firebase.google.com/docs/functions/callable.
