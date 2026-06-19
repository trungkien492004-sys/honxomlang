# BÁO CÁO NÂNG CẤP GAME (UPGRADE REPORT) 🚀⚙️

Dự án **Xóm Anh Hùng v3.0** đã được nâng cấp đồ họa, hiệu ứng và tích hợp hệ thống ánh sáng 2D động theo thời gian thực tham chiếu từ dự án mã nguồn mở **Helbreath Base Game**. Quá trình nâng cấp tuân thủ tuyệt đối quy tắc giữ vững lối chơi cốt lõi, bảo toàn dữ liệu người chơi và cấu trúc game hiện có.

---

## 1. Asset Đã Được Thay Thế / Bổ Sung (Assets Replaced & Added)

Thay vì vẽ quái vật bằng kí tự Emojis phẳng chất lượng thấp, chúng tôi đã trích xuất trực tiếp các sprite sheet nguyên bản từ dự án GitHub Helbreath và đồng bộ hóa đồ họa vector chuyển động 8 hướng chất lượng cao:

| Quái Vật Trong Game | Emoji Cũ | Sprite Helbreath Mới Tích Hợp | Nguồn File Sprite Sheet Trích Xuất |
| :--- | :---: | :--- | :--- |
| **Muỗi Vằn Sốt Xuất Huyết** | 🦟 | **Ant Sprite** (Kiến khổng lồ 8 hướng) | `ant.spr` (`ant_sheet_0.png` -> `ant_sheet_39.png`) |
| **Chuột Cống Đột Biến** | 🐀 | **Slime Sprite** (Chất nhầy ma thuật 8 hướng) | `slm.spr` (`slm_sheet_0.png` -> `slm_sheet_39.png`) |
| **Chó Hoang Lên Cơn Dại** | 🐕 | **Zombie Sprite** (Thác quỷ xác sống 8 hướng) | `zom.spr` (`zom_sheet_0.png` -> `zom_sheet_39.png`) |
| **Lợn Rừng Phá Hoa Màu** | 🐗 | **Cyclops Sprite** (Người khổng lồ một mắt 8 hướng) | `cyc.spr` (`cyc_sheet_0.png` -> `cyc_sheet_39.png`) |
| **THẦN TRÙNG ĐẠI QUỶ (SIÊU BOSS)** | 👹 | **Barlog Sprite** (Quỷ lửa có cánh siêu khổng lồ) | `barlog.spr` (`barlog_sheet_0.png` -> `barlog_sheet_39.png`) |

* **Danh sách cơ sở dữ liệu Metadata:** Tạo mới [sprites_data.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/sprites_data.js) chứa dữ liệu định vị toạ độ cắt khung hình (left, top, width, height) và toạ độ tâm điểm xoay vẽ (pivotX, pivotY) cho từng khung hình để hiển thị khớp 100% tỷ lệ gốc.
* **Đường dẫn thư mục lưu trữ sprite:** [assets/sprites/](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/sprites/)

---

## 2. Tính Năng / Cơ Chế Tham Chiếu Từ Dự Án GitHub (Features Integrated)

* **Hệ Thống Động Cơ Hướng Đi (8-Directional Vector Angle Resolver):**
  * Tham chiếu cơ cấu chuyển động và hướng đi của Helbreath. Tích hợp thuật toán đổi góc Vector `Math.atan2(vy, vx)` thành 8 chỉ số hướng (0 = Bắc, 1 = Đông Bắc, ..., 7 = Tây Bắc) trong [sprites_renderer.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/sprites_renderer.js).
  * **Trí tuệ nhân đạo hướng nhìn:** Khi quái vật tấn công hoặc đứng gần, chúng tự động quay hướng về phía người chơi thay vì chỉ đứng ngẫu nhiên.
* **Hệ Thống Phân Tách Hoạt Ảnh Đa Trạng Thái (Sprite Animation State Machine):**
  * Tích hợp máy trạng thái hoạt ảnh động cơ. Hệ thống tự động ánh xạ trạng thái hành vi của quái vật (Đứng yên -> Idle, Di chuyển -> Move, Tấn công -> Attack, Bị sát thương -> Damage) sang các dải sprite sheet tương ứng từ 0 đến 31.
* **Hệ Thống Ánh Sáng 2D Động Theo Thời Gian Thực (Dynamic Real-Time 2D Lighting Engine):**
  * Tham chiếu cơ chế chiếu sáng của Helbreath, nâng cấp hệ thống Ngày & Đêm nguyên bản trong game.
  * Khi trời chuyển hoàng hôn, đêm tối hoặc bình minh, toàn bộ thế giới sẽ được che phủ bởi lớp màn tối dịu mát.
  * Tích hợp cơ chế đục lỗ ánh sáng (`globalCompositeOperation = 'destination-out'`) và pha trộn sắc màu (`globalCompositeOperation = 'screen'`), tạo ra các quầng sáng lan tỏa sinh động (đèn lồng cam ấm quanh người chơi, ánh sáng nhỏ quanh các NPC trong làng, quầng lửa đỏ bập bùng dữ dội phát ra từ Siêu Boss).

---

## 3. Các File Đã Được Chỉnh Sửa / Tạo Mới (Modified & New Files)

### Tạo mới [NEW]:
1.  **[sprites_renderer.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/sprites_renderer.js):** Chứa lõi dựng hình sprite Helbreath, bóng đổ chân quái vật và bộ xử lý 8 hướng chuyển động.
2.  **[sprites_data.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/sprites_data.js):** Cơ sở dữ liệu định vị frames của các tệp sprite (Ant, Slime, Zombie, Cyclops, Barlog) nhằm loại bỏ hoàn toàn các yêu cầu Ajax/Fetch qua giao thức `file://` giúp tương thích hoàn hảo.
3.  **Thư mục hình ảnh [assets/sprites/](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/sprites/):** Chứa các file hình ảnh PNG của sprite sheet trích xuất từ ổ D.

### Chỉnh sửa [MODIFY]:
1.  **[index.html](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/index.html):** Tích hợp liên kết nạp hai file JavaScript bổ trợ (`sprites_data.js` và `sprites_renderer.js`) trước file game chính.
2.  **[vfx.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/vfx.js):** Thiết lập lõi dựng hình ánh sáng 2D đa nguồn sáng động (carve out radial gradients) trong hoàng hôn/ban đêm/bình minh.
3.  **[game.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/game.js):** Chỉnh sửa Layer 3 trong hàm vẽ đồ hoạ thế giới để tích hợp `window.drawHelbreathMonster` vẽ quái vật thay cho kí tự emojis cũ (vẫn giữ nguyên fallback vẽ emojis nếu sprite chưa tải xong, chống lỗi tối đen hoặc treo đứng).

---

## 4. Các File Được Giữ Nguyên Hoạt Động (Untouched Files)

Để đảm bảo không phá vỡ gameplay và giao diện hiện có của bạn, các file sau được giữ nguyên cấu trúc:

*   **[firebase.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/firebase.js):** Giữ nguyên hệ thống lưu trữ Cloud/Local Auth đồng bộ Firestore, giao diện vẽ chibi RPG vector của nhân vật và logic màn hình login.
*   **[joystick.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/joystick.js):** Giữ nguyên logic di chuyển ảo joystick trên màn hình cảm ứng di động.
*   **[board_new.js](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/js/board_new.js):** Giữ nguyên hệ thống Board Game Cờ đua sinh tồn cá cược.
*   **[style.css](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/css/style.css) & [mobile.css](file:///C:/Users/Kien/.gemini/antigravity/scratch/xomanhung_v3/assets/css/mobile.css):** Bảo toàn giao diện RPG hiện đại của trang chủ, bảng xếp hạng và các panel chức năng.
