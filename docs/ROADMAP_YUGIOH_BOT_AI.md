# Lộ trình Yu-Gi-Oh!: Bot "sảnh đông" + AI thông minh tối đa

Thời gian dự kiến: **~5 tháng** (tuần 1 = tuần đầu tháng 11/2026 → release cuối tháng 3/2027).
Đội: 1 dev chính + Claude. Mỗi giai đoạn kết thúc bằng một bản chạy được và test trong `npm test`.

---

## 0. Hiện trạng (đã khảo sát trong repo)

| Hạng mục | Hiện có | Hạn chế |
|---|---|---|
| AI lượt bot | `aiTurn()` / `aiAttack()` trong `assets/js/meme_game.js` (~dòng 752–834) | Tham lam: dùng spell theo điểm, triệu hồi quái ATK cao nhất, úp bẫy ưu tiên cố định, đánh theo luật. **Không nhìn trước (lookahead), không lập kế hoạch lượt, không đọc bài đối thủ.** |
| "Não" chiến thuật | `assets/js/meme_phase2_tactics.js` (9 KB: `attack`, `spellScore`, `trapScore`, `value`) | Bảng điểm viết tay theo từng `effect_code`; chỉ có 3 độ khó (easy/normal/hard). Đã đúng nguyên tắc **chỉ dùng thông tin công khai**. |
| Bộ bài bot | `MEME_DECK_PRESETS` (nhiều file catalog), `MEME_SUPREME_DECKS`; chọn easy/normal/supreme trong `startGame()` | Bộ bài là danh sách cố định theo nhân vật anime; thiếu bài "dị" có lối chơi riêng. |
| Bot trong BXH | `LEGEND_BOTS` — 6 boss, **khai báo trùng** ở `site_rank.js` và `site_rank_players.js`, chỉ số thắng/thua gõ cứng | Chỉ 6 bot, số liệu giả cố định; ghép trận chờ 60 giây rồi mới rơi về bot (đấu tập, không tính rank). |
| Hiện diện online | `site_identity.js` ghi presence lên Firestore mỗi 25 giây | Không có "người chơi ảo". |
| Hạ tầng | Engine không DOM trong `server/functions/engine/bundle.json`; `scripts/simulate-phase2-balance.cjs` chạy sim bằng Puppeteer | Cloud Functions **chưa bật** (dự án chưa có Blaze) → mọi thứ bot phải chạy được phía client / không tốn phí. |
| Ràng buộc luật | `docs/card-effect-policy.md`: chỉ dùng hiệu ứng TCG đã đối chiếu, 3 ô, 4000 LP, 60 giây/lượt | Bot không được dùng bài/hiệu ứng tự bịa. |

**Rủi ro kỹ thuật lớn nhất:** logic luật trong `meme_game.js` dính DOM + `await memeFx` (animation). Muốn AI "nghĩ trước" phải mô phỏng hàng nghìn nước đi/giây → cần một bản luật **thuần, không animation, clone được state**. Đây là việc đầu tiên (Giai đoạn 0).

---

## 1. Nguyên tắc thiết kế

1. **Bot không gian lận:** chỉ thấy tay/sân/mộ công khai như người chơi. Khi lookahead, "đoán" bài úp/tay đối thủ bằng xác suất (determinization), không đọc trộm.
2. **Minh bạch về bot.** Bot là "Đấu Sĩ" có tên, avatar, phong cách riêng, và có nhãn nhận diện được (huy hiệu nhỏ trong hồ sơ / lịch sử trận). Lý do: giả danh người thật làm người chơi tin sai và, nếu ảnh hưởng Elo, là gian lận với người chơi thật. Sảnh vẫn "đông, sống động"; chỉ không nói dối.
3. **Bot không làm lệch BXH thật:** trận với bot = Đấu tập (không đổi Elo người thật), hoặc bot có thang Elo riêng. (Khớp với hành vi hiện tại "Không tính Rank".)
4. **Mọi thứ đo được:** mỗi thay đổi AI/bộ bài phải qua sim hàng loạt trước khi vào game.
5. **Không đụng file khoá** trong `AGENTS.md` (board UI, tutien, vanphap). Bot nằm trong module mới.

---

## 2. Kiến trúc đề xuất

```
assets/js/ai/
  ai_state.js     // clone state, liệt kê nước đi hợp lệ, apply(action) KHÔNG animation
  ai_eval.js      // hàm lượng giá: LP, bàn, tay, mộ, tempo, "lethal distance", tài nguyên
  ai_search.js    // ISMCTS / lookahead có ngân sách thời gian (đặt theo độ khó)
  ai_profiles.js  // trọng số + phong cách + độ nhiễu theo từng bot/độ khó
  ai_decks.js     // thư viện bộ bài dị + metadata "kế hoạch ván" (game plan)
  bot_roster.js   // danh sách persona bot (tên, avatar, deck, Elo, giờ hoạt động)
  bot_presence.js // sinh "đang online" cho lobby (client, không ghi Firestore)
scripts/
  sim-selfplay.cjs   // chạy N ván bot vs bot headless, xuất ma trận thắng/thua
  tune-ai.cjs        // dò trọng số (hill-climb / CMA-ES)
  evolve-decks.cjs   // sinh & lọc bộ bài dị bằng thuật toán di truyền
  test-ai-*.cjs      // test hồi quy, thêm vào "npm test"
```

`aiTurn()` trong `meme_game.js` chỉ đổi thành: `const plan = memeAI.plan(state, profile); for (a of plan) await execute(a)` — phần animation/log vẫn dùng đường cũ, nên không phá UI.

---

## 3. Các giai đoạn

### Giai đoạn 0 — Nền tảng đo & mô phỏng (Tuần 1–3)
- Spike: xác nhận `server/functions/engine/bundle.json` có thể chạy trận bot-vs-bot không cần trình duyệt (nếu thiếu API thì bóc logic luật ra `ai_state.js`).
- `ai_state.js`: `clone()`, `legalActions()`, `apply()`, `isTerminal()`, deterministic theo seed.
- `sim-selfplay.cjs`: chạy ≥2.000 ván/phút, xuất ma trận deck×deck, tỉ lệ đi trước, độ dài ván, nguyên nhân thắng (LP / hết bài / Exodia).
- **Baseline:** đo bot hiện tại (easy/normal/hard) để có mốc so sánh.
- ✅ Xong khi: có báo cáo baseline + test xác nhận mô phỏng khớp luật với trận thật (replay 50 ván).

### Giai đoạn 1 — AI v2: biết nhìn trước (Tháng 1–2 = Tuần 4–9)
1. **Hàm lượng giá** (`ai_eval.js`): chênh LP, tổng ATK/DEF khả dụng, số lá tay, giá trị mộ (hồi sinh/Fusion), quân bài chủ lực, khoảng cách tới lethal, nguy cơ bị lethal.
2. **Tìm kiếm có ngân sách:** bắt đầu 1–2 ply tìm trong *một lượt* (chọn chuỗi: spell → triệu hồi → úp bẫy → tấn công), rồi nâng lên **ISMCTS** (determinization cho tay/bài úp đối thủ) có ngân sách 150–800 ms.
3. **Quyết định chuyên sâu:**
   - Kiểm tra *lethal* trước tiên; tính cả bẫy có thể có.
   - Hiến tế / giữ quái; tấn công hay giữ thủ; che chắn lượt sau.
   - Úp bẫy & *bluff* (úp lá rỗng khi cần); chọn thời điểm kích hoạt bẫy/phản ứng (hiện chỉ có `trapScore`).
   - Đọc đối thủ: đếm bài đã ra, suy luận deck (nhận ra Exodia, Fusion, Toon…).
4. **Độ khó theo ngân sách + nhiễu:** Dễ (greedy cũ + 20% sai), Thường (1-ply), Khó (ISMCTS 300 ms), Tối thượng (ISMCTS 800 ms, không nhiễu), mỗi bot persona có "tính cách" (hung hăng/phòng thủ/combo).
5. Chạy 30–60 ms/nước trên điện thoại: đặt trần thời gian, chạy trong Web Worker để không giật UI.
- ✅ Xong khi: AI v2 (Khó) thắng baseline "hard" ≥ 75% trên cùng bộ bài, 0 crash trong 10.000 ván sim, không vi phạm luật (không có hành động bất hợp lệ).

### Giai đoạn 2 — Thư viện bộ bài dị (Tháng 2–3 = Tuần 10–14)
Mục tiêu: **30–40 bộ bài**, mỗi bộ có lối thắng riêng để người chơi gặp bot "lạ mà hay":

| Nhóm | Ví dụ ý tưởng (chỉ dùng bài TCG có sẵn trong catalog) |
|---|---|
| Thắng đặc biệt | Exodia (tìm đủ 5 mảnh + chống phá), đếm ngược/decking (ép đối thủ hết bài) |
| Burn / LP | Hồ sơ sát thương hiệu ứng, bẫy phản sát thương, bài trả LP |
| Khoá (lock) | Toon khoá tấn công, Swords of Revealing Light, bẫy nhịp độ chậm |
| Phòng thủ / Stall | Tường quái DEF, Scapegoat, Waboku — thắng bằng hết bài đối thủ |
| Fusion / Synchro / Xyz / Ritual | Dung hợp liên tục, Cyber/HERO, Zexal, nghi lễ |
| Hồi sinh / mộ | Monster Reborn chuỗi, Zombie, hy sinh–hồi sinh |
| Beatdown / OTK | Quái hiến tế lớn, trang bị tăng ATK, nhân đôi đòn |
| "Joke" nhưng nguy hiểm | Deck gần như toàn bẫy, deck 1 quái, deck chỉ Normal |

- Mỗi deck có metadata `gamePlan` (mục tiêu, lá khoá, điều kiện mulligan, lá cần giữ) để AI biết *cách chơi đúng*, không chỉ chơi theo bảng điểm chung.
- **Sinh deck tự động** (`evolve-decks.cjs`): thuật toán di truyền bắt đầu từ preset, đột biến thêm/bớt lá, chấm bằng tỉ lệ thắng sim; lọc bằng `deckProblem()` để bảo đảm hợp lệ; con người duyệt cuối.
- Cân bằng: không deck nào > 60% hay < 35% trong ma trận sim; deck "độc" (lock vô hạn) có giới hạn lượt để tránh ván treo.
- ✅ Xong khi: ≥30 deck qua ma trận cân bằng, mỗi deck có test "chơi đúng game plan" (ví dụ deck Exodia thực sự gom được Exodia ≥ X% ván khi không bị cản).

### Giai đoạn 3 — Tự chơi để tinh chỉnh (Tuần 14–17)
- `tune-ai.cjs`: tự đối kháng giữa các bản trọng số (self-play), giữ bản thắng, mỗi deck một profile riêng.
- Phát hiện lỗi chiến thuật bằng "replay lỗi": ván AI thua dù lợi thế → log điểm ngoặt → thêm test hồi quy.
- Hiệu chỉnh Elo cho mọi (bot, deck, độ khó) bằng round-robin → số Elo của bot là *đo thật*, không gõ tay như `LEGEND_BOTS` hiện nay.
- ✅ Xong khi: bảng Elo bot ổn định (độ lệch < 40 sau 2 lần chạy), bot Tối thượng thắng người chơi giỏi ~60–70%.

### Giai đoạn 4 — Đội bot "sảnh đông" (Tuần 15–19, song song GĐ3)
- **Roster 40–60 persona**: tên, avatar, câu thoại, deck chủ lực, mức Elo (rải 800–2000+ để khớp mọi hạng trong `server/README.md`), phong cách chơi, mức "ồn" (thích chat/emote).
- **Hiện diện:** `bot_presence.js` sinh danh sách "đang online" ngay ở client dựa trên giờ và seed (không ghi Firestore → không tốn phí/không cần Blaze). Số lượng theo đường cong ngày (tối nhiều, sáng ít), tên chuyển trạng thái *Rảnh / Đang đấu / Đang xây bộ*.
- **Ghép trận nhanh:** thay "chờ 60 giây rồi mới bot" bằng ghép bot trong 3–15 giây nếu không có người thật phù hợp, chọn bot theo Elo ±100 (hiện logic `LEGEND_BOTS.find(...)` chỉ có 6 mức).
- **Hành vi giống người:** thời gian suy nghĩ ngẫu nhiên 1–6 giây, thỉnh thoảng suy nghĩ lâu ở nước quan trọng, emote/chat vui, thua thì GG; **không** giả rớt mạng hay giả cảm xúc lừa người.
- Hợp nhất 2 danh sách `LEGEND_BOTS` (`site_rank.js`, `site_rank_players.js`) về một nguồn `bot_roster.js`.
- Bot hiện trong BXH ở mục riêng "Đấu Sĩ" hoặc có huy hiệu; thống kê bot do sim/trận thật cập nhật, không hardcode.
- ✅ Xong khi: lobby luôn có ≥15–40 "đấu sĩ" hoạt động đúng giờ, ghép bot ≤ 15 giây, người chơi mới (Tân Binh) không bao giờ gặp bot quá mạnh.

### Giai đoạn 5 — Tích hợp online, an toàn, vận hành (Tuần 19–21)
- Trận bot dùng đường `startGame({ customBotDeck, isPractice })` hiện có; thêm `botId` để lưu lịch sử/nhiệm vụ.
- Công tắc tắt khẩn cấp (`MEME_BOT_CONFIG.enabled`), giới hạn số trận bot/ngày để tránh farm phần thưởng.
- Thu thập số liệu ẩn danh: tỉ lệ thắng người–bot theo bậc Elo, thời gian chờ, tỉ lệ bỏ ván; chỉnh độ khó tự động nếu người chơi thua quá nhiều (dynamic difficulty).
- Test: `test-ai-decisions.cjs` (đã có) mở rộng; thêm vào `npm test` để mọi lần deploy đều chạy.

### Giai đoạn 6 — Đánh bóng & phát hành (Tuần 21–22)
- Cân bằng lần cuối, kiểm tra điện thoại (hiệu năng, pin), thử 2 máy online thật.
- Tài liệu: bổ sung vào `README.md` + `AGENTS.md` (mục BOT — file sở hữu, API, ràng buộc).
- Deploy theo quy ước repo: `node scripts/build-public.js` → `git push` + `firebase deploy --only hosting`.

---

## 4. Mốc thời gian

| Mốc | Tuần | Kết quả |
|---|---|---|
| M0 | 3 | Sim headless + baseline đo được |
| M1 | 9 | AI v2 (lookahead) thắng hard cũ ≥ 75% |
| M2 | 14 | 30+ bộ bài dị cân bằng, có game plan |
| M3 | 17 | Elo bot đo thật, profile theo deck |
| M4 | 19 | Roster bot + sảnh có người "đang online" + ghép ≤ 15 s |
| M5 | 22 | Bản phát hành, giám sát số liệu |

## 5. Rủi ro & cách xử lý

| Rủi ro | Mức | Xử lý |
|---|---|---|
| Logic luật dính DOM → khó mô phỏng | Cao | GĐ0 dựa trên engine bundle server; nếu thiếu, tách luật thuần từng phần, so khớp với trận thật bằng replay |
| AI mạnh nhưng chậm trên điện thoại | Trung bình | Web Worker + trần thời gian; giảm ngân sách tự động theo thiết bị |
| Hiệu ứng bài mới còn thiếu/sai → bot chơi sai | Cao | Chỉ đưa lá đã có hiệu ứng thực thi + test; không bịa theo `card-effect-policy.md` |
| Deck dị gây ván treo / lock vô hạn | Trung bình | Giới hạn lượt, đo độ dài ván trong sim |
| Người chơi cảm thấy bị lừa nếu bot giả người thật | Trung bình–cao | Gắn nhãn bot (nguyên tắc 2), không ảnh hưởng Elo người thật |
| Không có Blaze → không chạy bot phía server | Trung bình | Toàn bộ bot chạy client, presence ảo tính cục bộ |
| Agent khác ghi đè file | Trung bình | Module mới trong `assets/js/ai/`, stage riêng từng file theo mục "Concurrent sessions" |

## 6. Việc nên làm ngay (2 tuần đầu)
1. Spike engine headless (`server/functions/engine`) → chạy được 1 trận bot-vs-bot.
2. Viết `sim-selfplay.cjs` + báo cáo baseline.
3. Hợp nhất `LEGEND_BOTS` thành `bot_roster.js` (sửa nhỏ, rủi ro thấp, thấy ngay lợi ích).
4. Viết 5 deck dị đầu tiên (Exodia, Stall, Burn, Toon lock, Fusion-spam) để thử pipeline.
