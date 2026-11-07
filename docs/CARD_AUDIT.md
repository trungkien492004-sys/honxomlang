# Kiểm tra từng lá bài (TCG ↔ hiệu ứng đang chạy)

Sinh bởi `node scripts/audit-cards.cjs` (chạy thật từng lá trên engine bằng Chrome headless) + so sánh văn bản với `assets/data/tcg-catalog-work.json`.

## Cách đọc
- **Chạy được**: harness đưa lá vào tình huống phù hợp và engine thực sự thay đổi trạng thái/trả hiệu ứng (triệu hồi được, Phép/Bẫy giải quyết). Không có nghĩa là *đúng từng chữ* TCG.
- **Chưa xác nhận**: harness chưa dựng được điều kiện riêng của lá (cần kịch bản thủ công), KHÔNG tự động là lỗi.
- **Khác TCG**: so với `tcg_text` chính thức trong catalogue ứng viên (176 lá; `ready:false`, tất cả còn `pending_semantic_review`). Phí LP cố định bị chia đôi là chủ ý của định dạng 4000 LP (`meme_lp_costs.js`), không tính là lỗi.

## Tổng quan
- Lá trong game: **307**. Chạy thử tự động: **236 chạy được**, 71 chưa xác nhận/thất bại.
- Lá có `tcg_text` để đối chiếu: **176**; trong đó lá hiệu ứng còn `pending`: **127**.
- **Nguyên nhân gốc của "sai hiệu ứng TCG"**: game đang chạy catalogue *anime* (mô tả tiếng Việt tự soạn), còn catalogue TCG chính thức (`meme_tcg_catalog.js`) chưa bật vì chưa chuyển xong 127 lá hiệu ứng (xem `docs/card-effect-policy.md`).

## Lá có hiệu ứng không có mã triển khai nào (chỉ có chữ)
Năm lá Duel Links chỉ có mô tả + `traits`, **không có handler** cho `effect_code`; hiệu ứng ghi trên thẻ không xảy ra (ngoài các `traits` chung như `double_attack`):
- `DL-blue_eyes_twin_burst_dragon` (Rồng Trắng Hai Đầu, `dl_twin_burst`): Dung Hợp: 2x Rồng Trắng Mắt Xanh (có thể đưa 2 quái trên sân vào Mộ mà không cần Phép). Không bị tiêu diệt bởi chiến đấu. Tấn công quái vật 2 lần mỗi lượt. Sau khi tấn công quái không bị phá hủy: trục xuất quái đó.
- `DL-toon_black_luster_soldier` (Chiến Binh Ánh Sáng Hoạt Hình, `dl_toon_bls`): Triệu hồi đặc biệt bằng cách hiến tế quái Hoạt Hình có tổng cấp từ 8 trở lên. 1 lần/lượt: trục xuất 1 lá trên sân. Có thể tấn công trực tiếp nếu đối thủ không có quái Hoạt Hình.
- `DL-golden_eyes_idol` (Tượng Hoàng Kim Mắt, `dl_golden_eyes`): Xem tay đối thủ. Có thể hiến tế lá này để biến thành trang bị cho Quỷ Hy Sinh hoặc Quỷ Ngàn Mắt.
- `DL-chimeratech_rampage_dragon` (Rồng Hợp Máy Cuồng Nộ, `dl_rampage_dragon`): Dung Hợp: 2+ Quái Rồng Máy. Khi triệu hồi: phá hủy Phép/Bẫy của đối thủ bằng số nguyên liệu sử dụng. Gửi tối đa 2 quái Máy Ánh Sáng từ Bộ bài xuống Mộ: tăng số lần tấn công tương ứng.
- `DL-cyber_dragon_vier` (Rồng Máy Đệ Tứ, `dl_cyber_vier`): Tên trở thành Rồng Máy trên sân và Mộ. Khi bạn triệu hồi Rồng Máy: triệu hồi đặc biệt lá này từ tay ở thế thủ. Tăng 500 ATK/DEF cho toàn bộ Rồng Máy.

## Lệch văn bản/hiệu ứng so với TCG đã xác định (đọc từng lá)
- `AN-axe_of_despair` Rìu Tuyệt Vọng: Thiếu vế "khi rời sân xuống Mộ: hiến tế 1 quái để đặt lá này lên đầu bộ bài".
- `MGX-elemental_hero_ocean` Anh Hùng Nguyên Tố Đại Dương: Chạy hiệu ứng *tấn công trực tiếp khi có Umi*; TCG: Standby Phase thu 1 HERO về tay.
- `MGX-elemental_hero_stratos` Anh Hùng Nguyên Tố Thiên Không: Chạy "giảm nửa ATK để đánh trực tiếp"; TCG: khi triệu hồi chọn phá Phép/Bẫy hoặc tìm 1 HERO.
- `MGX-umi` Biển Umi: Chạy "Ocean tấn công trực tiếp"; TCG: +200 ATK/DEF Fish/Sea Serpent/Thunder/Aqua, −200 Machine/Pyro.
- `MGX-elemental_hero_absolute_zero` Anh Hùng Nguyên Tố Không Độ Tuyệt Đối: Thiếu vế "rời sân: phá toàn bộ quái đối thủ"; nguyên liệu TCG là 1 HERO + 1 quái WATER.
- `MGX-elemental_hero_the_shining` Anh Hùng Nguyên Tố Ánh Sáng Rực Rỡ: Đếm HERO bị trục xuất của *cả hai bên*; TCG chỉ của bạn. Nguyên liệu TCG: HERO + quái LIGHT.
- `MGX-masked_hero_blast` Anh Hùng Mặt Nạ Phong Bạo: Thiếu vế Quick Effect: trả 500 LP, đưa 1 Phép/Bẫy đối thủ về tay.
- `MGX-masked_hero_koga` Anh Hùng Mặt Nạ Quang Nha: Thiếu vế banish HERO trong Mộ để giảm ATK mục tiêu.
- `MGX-masked_hero_divine_wind` Anh Hùng Mặt Nạ Thần Phong: Thiếu "đối thủ chỉ tấn công bằng 1 quái mỗi Battle Phase" và "không bị phá bởi chiến đấu".
- `MGX-masked_hero_acid` Anh Hùng Mặt Nạ Axit: TCG: phá tối đa Phép/Bẫy rồi mới trừ 300 ATK *nếu đã phá*; đang trừ vô điều kiện.
- `MGX-mask_change` Biến Đổi Mặt Nạ: TCG: mục tiêu là HERO bất kỳ, lấy quái Masked HERO cùng thuộc tính từ Extra; game yêu cầu thêm "cấp cao hơn, chênh tối đa 2 sao".
> Danh sách đầy đủ 127 lá hiệu ứng còn `pending` nằm trong `assets/data/tcg-catalog-work.json` (trường `tcg_text` so với `description`).

## Phí LP khác TCG do chủ ý (định dạng 4000 LP)
- `AN-toon_world` Thế Giới Hoạt Hình: phí TCG chia đôi.
- `AN-premature_burial` Chôn Sống: phí TCG chia đôi.
- `AN-seven_tools_of_the_bandit` Bảy Công Cụ Đạo Tặc: phí TCG chia đôi.

## Theo nhân vật
### Yugi Muto / Atem (5 bộ bài)
- 47 lá khác nhau, 26 lá có hiệu ứng: **22 chạy được**, 4 chưa xác nhận.
- Có đối chiếu TCG: 16 lá.
- Chưa xác nhận / lỗi:
  - `DL-illusion_magic` Ma Thuật Ảo Ảnh (dl_illusion_magic) — fail / play-spell
  - `DL-the_eye_of_timaeus` Con Mắt Timaeus (dl_eye_of_timaeus) — fail / play-spell
  - `DL-magician_navigation` Dẫn Lối Phù Thủy Áo Đen (dl_navigation) — fail / trap-direct
  - `DL-eternal_soul` Linh Hồn Vĩnh Cửu Phù Thủy Áo Đen (dl_eternal_soul) — fail / trap-direct

### Seto Kaiba (4 bộ bài)
- 34 lá khác nhau, 23 lá có hiệu ứng: **18 chạy được**, 5 chưa xác nhận.
- Có đối chiếu TCG: 13 lá.
- Chưa xác nhận / lỗi:
  - `AN-obelisk_the_tormentor` Thần Phá Hoại Obelisk (obelisk) — fail / normal-summon
  - `DL-blue_eyes_alternative_white_dragon` Rồng Trắng Mắt Xanh Biến Dị (dl_alternative_dragon) — fail / special-summon
  - `DL-the_melody_of_awakening_dragon` Giai Điệu Thức Tỉnh Rồng (dl_melody_dragon) — fail / play-spell
  - `DL-cards_of_consonance` Lá Bài Hòa Điệu (dl_consonance) — fail / play-spell
  - `DL-silvers_cry` Tiếng Gầm Bạc (dl_silvers_cry) — fail / play-spell

### Joey Wheeler (4 bộ bài)
- 36 lá khác nhau, 22 lá có hiệu ứng: **18 chạy được**, 4 chưa xác nhận.
- Có đối chiếu TCG: 12 lá.
- Chưa xác nhận / lỗi:
  - `DL-red_eyes_fusion` Dung Hợp Mắt Đỏ (dl_red_eyes_fusion) — fail / play-spell
  - `DL-red_eyes_spirit` Linh Hồn Mắt Đỏ (dl_red_eyes_spirit) — fail / trap-direct
  - `DL-return_of_the_red_eyes` Sự Trở Lại Của Mắt Đỏ (dl_return_red_eyes) — fail / trap-direct
  - `DL-red_eyes_fang_with_chain` Nanh Xích Mắt Đỏ (dl_fang_with_chain) — fail / trap-direct

### Maximillion Pegasus (3 bộ bài)
- 32 lá khác nhau, 21 lá có hiệu ứng: **16 chạy được**, 5 chưa xác nhận.
- Có đối chiếu TCG: 11 lá.
- Chưa xác nhận / lỗi:
  - `DL-toon_black_luster_soldier` Chiến Binh Ánh Sáng Hoạt Hình (dl_toon_bls) — fail / normal-summon
  - `DL-toon_harpie_lady` Yêu Điểu Hoạt Hình (dl_toon_harpie) — fail / normal-summon
  - `DL-toon_page_flipper` Lật Trang Hoạt Hình (dl_page_flipper) — fail / play-spell
  - `DL-relinquished_fusion` Dung Hợp Quỷ Hy Sinh (dl_relinquished_fusion) — fail / play-spell
  - `DL-toon_terror` Nỗi Khiếp Sợ Hoạt Hình (dl_toon_terror) — fail / trap-direct

### Jaden Yuki / Judai (7 bộ bài)
- 69 lá khác nhau, 46 lá có hiệu ứng: **29 chạy được**, 17 chưa xác nhận.
- Có đối chiếu TCG: 36 lá.
- Chưa xác nhận / lỗi:
  - `MGX-elemental_hero_absolute_zero` Anh Hùng Nguyên Tố Không Độ Tuyệt Đối (p3_zero) — fail / extra-summon
  - `MGX-elemental_hero_the_shining` Anh Hùng Nguyên Tố Ánh Sáng Rực Rỡ (p3_shining) — fail / extra-summon
  - `MGX-elemental_hero_gaia` Anh Hùng Nguyên Tố Địa Thần Gaia (p3_gaia) — fail / extra-summon
  - `MGX-elemental_hero_great_tornado` Anh Hùng Nguyên Tố Đại Cuồng Phong (p3_tornado) — fail / extra-summon
  - `MGX-elemental_hero_escuridao` Anh Hùng Nguyên Tố Bóng Tối (p3_escuridao) — fail / extra-summon
  - `MGX-masked_hero_vapor` Anh Hùng Mặt Nạ Thủy Khí (masked_vapor) — fail / extra-summon
  - `MGX-masked_hero_acid` Anh Hùng Mặt Nạ Axit (masked_acid) — fail / extra-summon
  - `MGX-masked_hero_daian` Anh Hùng Mặt Nạ Địa Vương (masked_dian) — fail / extra-summon
  - `MGX-masked_hero_blast` Anh Hùng Mặt Nạ Phong Bạo (masked_blast) — fail / extra-summon
  - `MGX-masked_hero_koga` Anh Hùng Mặt Nạ Quang Nha (masked_koga) — fail / extra-summon
  - `MGX-masked_hero_divine_wind` Anh Hùng Mặt Nạ Thần Phong (masked_divine) — fail / extra-summon
  - `DL-a_hero_lives` Anh Hùng Xuất Hiện (dl_a_hero_lives) — fail / play-spell
  - `DL-form_change` Biến Đổi Hình Thái (dl_form_change) — fail / play-spell
  - `DL-favorite_hero` Anh Hùng Tâm Đắc (dl_favorite_hero) — fail / play-spell
  - `DL-elemental_hero_brave_neos` Anh Hùng Nguyên Tố Dũng Giả Tân Vũ (dl_brave_neos) — fail / extra-summon
  - `DL-elemental_hero_sunrise` Anh Hùng Nguyên Tố Thái Dương (dl_hero_sunrise) — fail / extra-summon
  - `DL-masked_hero_anki` Anh Hùng Mặt Nạ Ám Quỷ (dl_masked_anki) — fail / extra-summon

### Zane Truesdale / Ryo (4 bộ bài)
- 33 lá khác nhau, 25 lá có hiệu ứng: **22 chạy được**, 3 chưa xác nhận.
- Có đối chiếu TCG: 15 lá.
- Chưa xác nhận / lỗi:
  - `DL-cyber_repair_plant` Trạm Sửa Chữa Rồng Máy (dl_repair_plant) — fail / play-spell
  - `DL-cyberload_fusion` Dung Hợp Rồng Máy (dl_cyberload_fusion) — fail / play-spell
  - `DL-cybernetic_overflow` Quá Tải Rồng Máy (dl_cyber_overflow) — fail / trap-direct

### Mai Valentine / Mai Kujaku (3 bộ bài)
- 24 lá khác nhau, 16 lá có hiệu ứng: **11 chạy được**, 5 chưa xác nhận.
- Có đối chiếu TCG: 5 lá.
- Chưa xác nhận / lỗi:
  - `AN-elegant_egotist` Màn Vũ Điệu Kiêu Kỳ (egotist) — fail / play-spell
  - `AN-harpie_lady_phoenix_formation` Đội Hình Phượng Hoàng Yêu Điểu (phoenix_formation) — fail / play-spell
  - `AN-shadow_of_eyes` Bóng Tối Ánh Nhìn (shadow_of_eyes) — fail / trap-direct
  - `AN-amazoness_archers` Cung Thủ Amazoness (amazoness_archers) — fail / trap-direct
  - `AN-dramatic_rescue` Giải Cứu Ngoạn Mục (dramatic_rescue) — fail / trap-direct

### Yuma Tsukumo (3 bộ bài)
- 20 lá khác nhau, 14 lá có hiệu ứng: **10 chạy được**, 4 chưa xác nhận.
- Có đối chiếu TCG: 5 lá.
- Chưa xác nhận / lỗi:
  - `AN-onomatopaira` Onomatopaira (onomatopaira) — fail / play-spell
  - `AN-gagagabolt` Gagagabolt (gagagabolt) — fail / play-spell
  - `AN-gagagaguard` Gagagaguard (gagagaguard) — fail / trap-direct
  - `AN-half_unbreak` Nửa Bất Diệt (half_unbreak) — fail / trap-direct

### Yusei Fudo (3 bộ bài)
- 26 lá khác nhau, 22 lá có hiệu ứng: **18 chạy được**, 4 chưa xác nhận.
- Có đối chiếu TCG: 6 lá.
- Chưa xác nhận / lỗi:
  - `AN-synchro_blast_wave` Sóng Nổ Đồng Bộ (synchro_blast_wave) — fail / play-spell
  - `AN-scrap_iron_scarecrow` Bù Nhìn Sắt Vụn (scrap_iron_scarecrow) — fail / trap-direct
  - `AN-limiter_overload` Bộ Giới Hạn Quá Tải (limiter_overload) — fail / trap-direct
  - `AN-nitro_warrior` Chiến Binh Nitro (nitro_warrior) — fail / extra-summon

