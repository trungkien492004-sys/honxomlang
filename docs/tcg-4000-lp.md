# Phí LP cho định dạng 4000 LP

Quyết định: dùng hiệu ứng TCG với sân 3 ô quái, 3 ô Phép/Bẫy, 4000 LP và lượt online 60 giây.

- Phí LP cố định bằng một nửa phí in trên bản TCG: 1000 → 500, 800 → 400, 500 → 250.
- Phí theo tỷ lệ giữ nguyên tỷ lệ. Điều kiện trả để còn đúng một số LP giữ nguyên số LP còn lại; Ra trả để còn đúng 100 LP.
- Không giảm sát thương, hồi máu, ATK/DEF, số lá bỏ, hiến tế hoặc trục xuất.
- Phải có LP lớn hơn khoản phí. Không trả phí để LP về 0.
- Trả phí kích hoạt trước cửa sổ phản ứng. Hiệu ứng bị vô hiệu không hoàn lại phí. Hủy chọn mục tiêu trước khi kích hoạt không mất phí.
- Phí tấn công trả khi tuyên bố tấn công, vẫn mất nếu đòn đánh bị chặn.

| Lá | Khoản phí TCG | Khoản phí trong game |
|---|---:|---:|
| Toon World | 1000 | 500 |
| Premature Burial | 800 | 400 |
| Seven Tools of the Bandit | 1000 | 500 |
| Blue-Eyes Toon Dragon | 500 / lần tấn công | 250 / lần tấn công |
| Toon Summoned Skull | 500 / lần tấn công | 250 / lần tấn công |
| Toon Mermaid | 500 / lần tấn công | 250 / lần tấn công |
| Manga Ryu-Ran | 500 / lần tấn công | 250 / lần tấn công |
| The Winged Dragon of Ra: phá quái | 1000 | 500 |
| Masked HERO Blast: đưa Phép/Bẫy về tay | 500 | 250 |

Toon Dark Magician Girl không có phí tấn công; không tự thêm phí cho lá này.

Kiểm tra bằng `npm run test:lp`. Báo cáo tại `outputs/tcg-migration/lp-cost-tests.json`.

Trạng thái: bản vá `20261026-lp-hotfix1` cập nhật ba khoản phí đang có trong cơ chế web: Seven Tools và Toon World còn 500 LP, Premature Burial còn 400 LP; đồng thời sửa mô tả và điều kiện LP tối thiểu. Các dòng Ra, Blast và phí tấn công Toon trong bảng thuộc bản TCG đang chuyển đổi, chưa phải cam kết rằng những hiệu ứng đó đã hoạt động trên web. Danh mục TCG đầy đủ vẫn có `ready: false` vì việc chuyển toàn bộ hiệu ứng và điều kiện triệu hồi chưa hoàn tất.
