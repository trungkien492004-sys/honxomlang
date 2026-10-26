# Đợt sửa hiệu ứng TCG: Phép trang bị và phản đòn

Phạm vi đã sửa: các hành vi bên dưới, không phải xác nhận toàn bộ kho bài đã hoàn tất TCG.

- Megamorph: LP bằng nhau không giảm ATK; xét LP của người điều khiển Phép trang bị, kể cả khi trang bị cho quái đối thủ. Các bản Megamorph không cộng dồn liên tiếp; bản trang bị sau được dùng khi có hai bên trang bị lên cùng quái. Ghi thứ tự trang bị vào trạng thái trận để đồng bộ.
- Chôn Cất Vội Vã: Phép trang bị, phí 400 LP theo định dạng 4000 LP; hồi sinh ở thế công. Một bản Phép liên kết với quái đã hồi sinh. Khi Phép bị phá thì quái bị phá theo.
- Bẫy Phá Phép: bỏ một lá làm chi phí ngay khi kích hoạt, trước cửa sổ phản đòn tiếp theo; nếu bị Bảy Công Cụ Đạo Tặc vô hiệu, lá đã bỏ vẫn ở Mộ.
- Mô tả và phần điều kiện sử dụng hiển thị cùng hành vi đã sửa.

Đã kiểm tra: 13 tình huống hiệu ứng và 8 kiểm tra hai cửa sổ đấu theo ID/đấu máy đại diện. Toàn bộ danh mục TCG vẫn tắt kích hoạt tự động (`ready: false`); những điều kiện chưa rà xong, như theo dõi triệu hồi hợp lệ để hồi sinh và các tương tác thay đổi ATK phức tạp, vẫn thuộc phần chuyển đổi đang làm.

Nguồn đối chiếu:
- Megamorph: https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=4663&request_locale=en
- Premature Burial: https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=4966&request_locale=en
- Magic Jammer: https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=4862&request_locale=en
