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

## Concurrent sessions

Multiple agents/sessions share this checkout. Before staging or committing:

- Run `git status` first. Stage only the files you personally touched.
- Never stage or commit unrelated dirty work (currently the `meme_*` /
  `memecard.html` / `package.json` feature is owned by another session).
- Never commit secrets: `.env`, `firebase-config.js`, service-account JSON.
- Do not edit auth/rank files (`assets/js/auth*.js`, `site_rank.css`,
  rank/progression modules) unless the task is explicitly about them.

## Project basics

- Static HTML/CSS/JS game. Hosting: Firebase project `honxomlang-e6974`
  (`firebase.json`, public dir `dist`), live at https://honxomlang-e6974.web.app.
- Build: `node scripts/build-public.js` copies the repo into `dist/`.
- Board regression test: `node scripts/test-race.cjs`.
- "Push" for this project means: `git push` **and**
  `firebase deploy --only hosting`.
