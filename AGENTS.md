# AGENTS.md — rules for AI agents working in this repo

> **ĐỌC TRƯỚC KHI SỬA GIAO DIỆN.** Board UI (bàn cờ, quân cờ, hiệu ứng, ghép trận/lobby)
> đã được người dùng duyệt và **khoá**. Không viết lại, không đổi theme.

## LOCKED BOARD UI — DO NOT REWRITE

The board race UI was polished and signed off by the user. Treat it as owned
design, not scaffolding. Other agents have previously overwritten it — do not do
that again.

Protected files:

- `assets/css/board_upgrade.css` — the board theme (layout, cells, pawns, FX,
  matchmaking/lobby/bet/room-code modals).
- `assets/js/board_new.js` — board map render, pawn rendering/clustering, event
  FX (`window.boardPlayFx`), matchmaking (`boardHostOnlineRoom`,
  `boardJoinOnlineRoom`, `boardRoomCodeModal`), lobby UI (`boardShowLobbyUI`),
  room list (`boardRenderActiveRoomsList`).
- Board markup and modals inside `index.html`: `#boardGameModal`,
  `#boardBetModal`, `#boardInviteModal`, `#boardLobbyOverlay`,
  `#boardRoomCodeModal`, and their surrounding elements.

What must stay:

- Teal/gold palette with the dark radial backdrop — never revert to the old
  purple/flat theme.
- Pale parchment coin cells for hidden cells, dark number badges, rotated
  location tags, extra road strokes and ambient fireflies.
- Clustered pawns on shared cells (2×2 slot layout, `--pscale`) plus the
  `.pawn-roster` name chips under the cell.
- Prominent event FX (float text, burst, rings, spark, flash, shake, confetti)
  with the `--fxk` counter-zoom so effects stay readable on phones.
- Themed matchmaking panel, lobby card, bet options and the custom room-code
  overlay (`window.boardRoomCodeModal`) instead of native `prompt()`.
- `?v=` cache-busting query strings on `board_new.js`, `board_upgrade.js` and
  `board_upgrade.css` in `index.html`.

How to change the board:

1. Only make the scoped change the user explicitly requested. No "cleanup",
   no redesign, no restyling of untouched sections.
2. Extend existing CSS rules; do not replace the file. Specificity conflict?
   Add a narrowly scoped rule, don't tear down the theme block.
3. Keep the JS API stable (`window.boardPlayFx`, `window.boardShowLobbyUI`,
   `window.boardRoomCodeModal`, `boardRenderActiveRoomsList`, etc.).
4. After editing, run `node scripts/test-race.cjs` and rebuild with
   `node scripts/build-public.js` before deploying.
5. If a request seems to require the old appearance, confirm with the user
   first — do not silently revert.

## BOARD FRAME RATE — PERF INVARIANTS

Measured on 2026-11-01: the board ran at ~27 fps while idle (77% of the main
thread busy) purely because of these two things. Do not reintroduce them.

- Never put a `filter` (e.g. `drop-shadow`) on an ancestor of an element that
  has a running CSS animation. That disables compositing and repaints the whole
  subtree every frame. The 98 animated `.cell-q` mystery glyphs did exactly this
  through `.cell-badge { filter: drop-shadow(...) }`; the shadow now lives in a
  `text-shadow` on `.cell-badge:has(.cell-q)` in `board_upgrade.css`.
- The camera rAF loop (`window.boardStartCameraLoop`, overridden in
  `board_upgrade.js`) must not read or write `grid.scrollLeft/scrollTop/scrollWidth`
  on frames where the camera is parked. Reading flushes layout for the whole map;
  it currently writes only while panning and learns about user drags from `scroll`
  events. Do not turn it back into an unconditional per-frame scroll write, and do
  not restore `void offsetWidth` reflows (`boardHopPawn`, `boardFxShake`).
- `window.boardRefreshCell` is memoised in `board_upgrade.js`: it skips repaints
  when a cell's revealed/trapped/zone/theme inputs are unchanged. If you add
  anything that changes a cell's appearance, add it to that signature or the board
  will render stale art.

Check with `node scripts/test-race.cjs` plus a frame sample (rAF deltas over an
idle 3s window: p50 should stay near 16 ms, not 35 ms).

## TUTIEN GAME — DO NOT DELETE

`Tu Tiên Kỷ Nguyên` is a playable game mode of this site, not scratch work.
It was once lost because it only existed inside `dist/` and a rebuild wiped it.

Owned files (keep them in the repo, never in `dist/` only):

- `tutien.html`
- `assets/tutien/css/style.css`, `assets/tutien/css/animations.css`
- `assets/tutien/js/tutien_bundle.js` (the active entry), plus
  `tutien_engine.js`, `renderer.js`, `audio.js`

Entry points:

- Mode card `Tu Tiên Kỷ Nguyên` in `#gameModeScreen` (index.html).
- `window.openTuTienGame()` / `window.closeTuTienGame()` and the
  `#tutienGameModal` iframe, plus the `🌌 Tu Tiên` menu button.
- The game posts `{type:'CLOSE_TUTIEN'}` to the parent to leave the iframe.

Build rule: `scripts/build-public.js` wipes `dist/` and copies a **fixed
list** of root HTML files plus `assets/`. If another root page is added to the
site, add it to that list; never let a page live only in `dist/`.

Mirror rule: `tutien.html` executes `assets/tutien/js/tutien_bundle.js`, not
`renderer.js`. These 15 `GameRenderer` methods — `updateCamera`, `render`,
`renderMap`, `_hash`, `_mapTheme`, `_drawRoads`, `_drawCityLot`,
`_drawForestLot`, `_drawArenaLot`, `_drawTower`, `_drawPagoda`, `_drawPond`,
`_drawSpiritTree`, `_drawArenaRing`, `_vis` — are a line-for-line mirror in both
files (identical code; only comments/blank lines differ). Editing only
`renderer.js` changes nothing on the live page. If you change the world
renderer, change both and re-compare the method bodies.

World-render invariants (`renderer.js` / `tutien_bundle.js` `GameRenderer`):

- Decor must stay deterministic: positions come from `_hash()` (`Math.imul`),
  never `Math.random()` — random decor shimmers every frame.
- Per-map palettes live in `_mapTheme()` as `r,g,b` strings for `rgba()`; the
  map key for cached decor is `this._decoKey = id + ':' + w + 'x' + h`.
- `_drawRoads` / the `crowded` + `onRoad` predicates keep decor out of the spawn,
  NPC, portal and road lanes. If you add a map or move a portal, update them.
- `updateCamera` clamps to the map and centres a map smaller than the viewport.
  Do not drop the clamp; the arena map is intentionally smaller than the canvas.

## LOBBY CARD ART — LOCKED

The two placeholder-free lobby cards (`Tu Tiên Kỷ Nguyên`, `Vạn Pháp Đạo Tràng`)
draw inline `<svg class="mode-scene" viewBox="0 0 320 208"
preserveAspectRatio="xMidYMax slice">` scenes in `index.html`, styled by
`.mode-scene` in `assets/css/ui_premium.css`.

- Stacking inside `.mode-art` is: `::after` bottom fade (auto) < `.mode-scene`
  (z-index 1) < `.tutien-sigil`/`.vanphap-sigil` (2) < `.mode-chip` (4). The
  scene therefore paints *over* the fade and must carry its own dark base —
  the sky gradient ends at `#060b18` and the art keeps its weight in the upper
  60% of the band so the title row below stays readable.
- Skyline silhouettes use value contrast against the sky (`#1a2450` far /
  `#0a1226` near) with `#f2c86e` + `#3ee6ff` windows. Do not recolour them to
  values close to the sky gradient — that is what made the cards look blank.
- The `.tutien-sigil` / `.vanphap-sigil` emoji rings are positioned
  `inset:34% 0 -12% 0` on top of the scene and are clipped by `.mode-art`.
  Keep the closing `</span>` on both; the emoji span is nested.
- `tutien.html`'s `#auth-screen` reuses the same night-city banner and the site's
  teal/gold card + school-card styling. Entry screens for any new game should
  match, not return to a flat black form.

## VAN PHAP GAME — DO NOT DELETE

`Vạn Pháp Đạo Tràng` (idle temple management) is the **fourth** game mode. It
used to exist only inside another agent's `dist/`, so every deploy from this
repo wiped it from the live site.

Owned files:

- `vanphap.html`
- `assets/vanphap/css/vanphap.css`, `assets/vanphap/js/vanphap_engine.js`

Entry points:

- Mode card `Vạn Pháp Đạo Tràng` in `#gameModeScreen` (4-card grid).
- `window.openVanPhapGame()` / `window.closeVanPhapGame()` + `#vanphapGameModal`
  iframe; the page posts `{type:'CLOSE_VANPHAP'}` to return to the lobby.
- `🪷 Vạn Pháp` button in `#mainMenuPopup`.

All four games (duel, race, tu tiên, vạn pháp) share the same lobby card design
and the same teal/gold "Sảnh Xóm Làng" pill in their header. Keep it that way —
when adding a fifth game, copy the `.mode-card` block and the header pill.

## Concurrent sessions

Multiple agents/sessions share this checkout. Before staging or committing:

- Run `git status` first. Stage only the files you personally touched.
- Never stage or commit unrelated dirty work (currently the `meme_*` /
  `memecard.html` / `package.json` feature is owned by another session).
- Never commit secrets: `.env`, `firebase-config.js`, service-account JSON.
- Do not edit auth/rank files (`assets/js/auth*.js`, `site_rank.css`,
  rank/progression modules) unless the task is explicitly about them.
- **Deploys are repo-wide.** A second checkout (an agent scratch copy) that still
  has the pre-polish board assets will overwrite the live site with the old UI
  the moment it runs `firebase deploy --only hosting`. Deploy from this checkout
  at `HEAD`, or rebuild the other copy from `origin/main` first. This already
  happened twice (board UI reverted, `vanphap.html` lost).

## Project basics

- Static HTML/CSS/JS game. Hosting: Firebase project `honxomlang-e6974`
  (`firebase.json`, public dir `dist`), live at https://honxomlang-e6974.web.app.
- Build: `node scripts/build-public.js` copies the repo into `dist/`.
- Board regression test: `node scripts/test-race.cjs`.
- "Push" for this project means: `git push` **and**
  `firebase deploy --only hosting`.

## TRUYỀN KỲ (SAGA) — cốt truyện + cấp đấu sĩ

Owned files: `assets/js/meme_saga.js`, `assets/js/meme_saga_data.js`, `assets/css/meme_saga.css`
(loaded in `memecard.html` right after `meme_journey.js`). Test: `node scripts/test-saga.cjs`.

- 9 đấu sĩ × 6 hồi, cần cấp 1/4/8/14/22/32; cấp tối đa 40; mốc thẻ ở cấp 2,5,8,12,16,20,25,30,35,40.
- Tiến độ lưu ở `state.story.saga` (không thêm khóa gốc mới vì `normalize()` của meme_progress.js bỏ khóa lạ).
- Kết quả trận gắn qua việc bọc `memeJourney.onDuelFinished`; không sửa meme_game.js.
- Thêm hồi/đấu sĩ: sửa `meme_saga_data.js` (bộ bài đối thủ phải có trong `MEME_DECK_PRESETS`; test sẽ kiểm tra).

## VFX PACK (CC0) — assets/vfx

`assets/js/meme_vfx_pack.js` bọc `memeFx.summon/attack/cardActivation/flipTrap` để phát thêm sprite CC0 từ
`assets/vfx/{kenney-particles,gothicvania-magic9,starsteel-spells}` (nguồn + giấy phép ở `assets/vfx/CREDITS.txt`).
Chỉ thêm lớp hiệu ứng trong `#memeFxLayer`, tắt khi `memeFx.mode==='minimal'` hoặc reduced-motion, tối đa 28 phần tử cùng lúc.
Sprite Kenney đã chuyển độ sáng → alpha để tô màu bằng CSS mask. Chỉ thêm asset có giấy phép CC0/tương đương và ghi vào CREDITS.txt. Test: `node scripts/test-vfx-pack.cjs`.

## LOBBY MENU (memecard.html)

`assets/js/meme_lobby_menu.js` + `assets/css/meme_lobby_menu.css` gom Truyền Kỳ, Hành trình, Bảng Xếp Hạng, Cửa hàng, Bộ bài vào nút `☰ Menu`.
`Đấu Rank nhanh` (#rankPlayBtn) và `Vào trận` (#playBtn) giữ riêng ở footer. Nút được di chuyển (giữ id + handler), script khác thêm nút vào footer sau đó vẫn được gom.
Thêm nút phụ mới: thêm id vào `MENU_IDS`. Test: `node scripts/test-lobby-menu.cjs`.

## HIỆU ỨNG TRẬN ĐẤU + GIỌNG NÓI

`assets/js/meme_fx_cinema.js` + `assets/css/meme_fx_cinema.css`: bài vỡ + bụi vào Mộ (móc trong `remove()` và `clearSpell()` của `meme_anime_rules.js`), lá core tấn công, cut-in mắt (`assets/characters/eyes/<code>.webp`, tỉ lệ 4:1, hai mắt nằm ngang). Thêm nhân vật mới phải có dải mắt riêng. Test: `node scripts/test-cinema.cjs`.

`assets/js/meme_ja_voice.js`: giọng chỉ tiếng Nhật, không đọc tiếng khác khi máy thiếu giọng ja-JP. Không tải clip phim/lồng tiếng từ mạng về repo: site công khai, nội dung có bản quyền. File giọng do chủ repo tự cung cấp đặt ở `assets/audio/voices/ja/<code>_<ngữ cảnh>.mp3`.

Che bài úp: `maskFaceDown()` trong `pick`/`pickMany` đặt `hidden` cho mọi bài úp của đối thủ. Handler không cần tự đặt `hidden`.

## NHÂN VẬT ĐỢT MỚI (Marik, Jack, Shark, Chazz)

`assets/js/meme_roster2_catalog.js` (lá, bộ bài, nhân vật) + `assets/js/meme_roster2_engine.js` (hiệu ứng). Test từng lá: `node scripts/test-roster2.cjs`.
Chỉ thêm lá khi làm đúng được văn bản TCG; tra chỉ số/hiệu ứng từ db.ygoprodeck.com, không dựa trí nhớ. Mã hiệu ứng mới phải vào `memeRules.supported`.
Thêm nhân vật cần: chân dung + CSS `hero-figure-<code>`, dải mắt, thoại `meme_ja_voice.js`, kỹ năng (`skillCandidates` + hai danh sách code), lọc `getCardHero` + `<option>` trong `meme_upgrade_phase1.js`, cập nhật số lượng trong test.
Truyền Kỳ chỉ hiện nhân vật đã có dữ liệu trong `MEME_SAGA`.

## ẢNH THEO NHÂN VẬT

`assets/characters/<code>.png` (ảnh toàn thân, không nén mất dữ liệu, không thu nhỏ: bản webp nén từng bị người dùng chê mờ). `assets/memecard/arenas/<code>.webp` là khung cảnh cho cổng vòm và nền bàn đấu; `assets/memecard/backs/*.webp` là mặt sau bài, gán trong `BACKS` ở `meme_hero_stage.js`. Biến CSS chứa ảnh phải dùng đường dẫn đầy đủ vì trình duyệt tính theo file CSS.
