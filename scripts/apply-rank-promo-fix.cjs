const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function replaceInFile(relativePath, findStr, replaceStr) {
  const filePath = path.join(root, relativePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const normContent = content.replace(/\r\n/g, '\n');
  const normFind = findStr.replace(/\r\n/g, '\n');
  const normReplace = replaceStr.replace(/\r\n/g, '\n');
  if (!normContent.includes(normFind)) {
    throw new Error(`Could not find target string in ${relativePath}`);
  }
  const updatedNorm = normContent.replace(normFind, normReplace);
  fs.writeFileSync(filePath, updatedNorm, 'utf8');
  console.log(`Successfully updated ${relativePath}`);
}

// 3. Update assets/js/site_rank.js
console.log('--- Updating site_rank.js ---');
const siteRankPath = path.join(root, 'assets/js/site_rank.js');
let siteRankContent = fs.readFileSync(siteRankPath, 'utf8').replace(/\r\n/g, '\n');

// Replace paintProgress fallback
const paintProgTarget = `    if (!profile || !Number.isFinite(Number(profile.rating))) {
      summary.innerHTML = \`<div class="rank-progress-title">\${cfg.enabled ? 'Đang tải hạng của bạn…' : 'Hồ sơ xếp hạng chưa được khởi tạo'}</div><div class="rank-progress-muted">\${cfg.enabled ? 'Chờ đồng bộ hồ sơ rank.' : 'Khiêu chiến trên BXH để tạo hồ sơ Elo và ghi nhận thắng thua.'}</div>\`;
      return;
    }
    const rating = Number(profile.rating), tier = localTier(rating), newbie = profile.newbie || Date.now() < Number(profile.newbieUntil || 0);`;

const paintProgReplace = `    const rating = Number.isFinite(Number(profile?.rating)) ? Number(profile.rating) : 1000;
    const tier = localTier(rating), newbie = profile?.newbie || identity.newbie || Date.now() < Number(profile?.newbieUntil || 0);`;

if (!siteRankContent.includes(paintProgTarget)) {
  console.log('paintProgTarget not found directly, checking substring...');
}
siteRankContent = siteRankContent.replace(paintProgTarget, paintProgReplace);

// Replace paint()
const paintTarget = `  function paint() {
    const node = document.getElementById('rankIdentity');
    if (node) { const user = identity.user; node.innerHTML = user ? esc(user.displayName || 'Đấu sĩ') + (identity.newbie ? '<span class="newbie-badge">NEWBIE</span>' : '') + (profile ? ' · ' + profile.rating + ' Elo' : '') : ''; }
    paintProgress();`;

const paintReplace = `  function paint() {
    const node = document.getElementById('rankIdentity');
    if (node) {
      const user = identity.user;
      const rating = Number.isFinite(Number(profile?.rating)) ? profile.rating : 1000;
      node.style.cursor = 'pointer';
      node.onclick = () => show();
      node.title = 'Bấm để xem Bảng Xếp Hạng Rank';
      node.innerHTML = user ? esc(user.displayName || 'Đấu sĩ') + (identity.newbie ? '<span class="newbie-badge">NEWBIE</span>' : '') + ' · <b>' + rating + ' Elo</b>' : '';
    }
    paintProgress();`;

siteRankContent = siteRankContent.replace(paintTarget, paintReplace);

// Add showRankPromo
const promoFunctionAndExport = `  function showRankPromo() {
    document.getElementById('rankPromoOverlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'rankPromoOverlay';
    overlay.className = 'rank-promo-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'rankPromoTitle');
    overlay.innerHTML = \`
      <div class="rank-promo-card">
        <button type="button" class="rank-promo-close" id="closeRankPromo" aria-label="Đóng">✕</button>
        <div class="rank-promo-badge">🔥 KHỞI TRANH MÙA GIẢI XẾP HẠNG (RANK) 🔥</div>
        <h2 id="rankPromoTitle">Đấu Trí Đỉnh Cao · Tranh Đoạt Ngôi Vua Xóm Anh Hùng</h2>
        <p class="rank-promo-subtitle">Hệ thống Rank & Elo đã chính thức mở toàn diện cho tất cả Đấu Sĩ!</p>
        <div class="rank-promo-features">
          <div class="rank-promo-item">
            <span class="rank-promo-icon">🤖⚔️</span>
            <div>
              <b>Đấu Với Máy & Online Đều Tính Rank</b>
              <p>Mỗi trận thắng trước Kaiba, Yugi, Joey, Pegasus, Jaden, Zane... hay đối thủ online đều được ghi nhận trực tiếp vào <b>Elo & BXH</b>!</p>
            </div>
          </div>
          <div class="rank-promo-item">
            <span class="rank-promo-icon">🔰⚡</span>
            <div>
              <b>Đặc Quyền Tân Binh (Newbie 7 Ngày Đầu)</b>
              <p>Thắng nhận <b>x2 Elo (+32 Elo/trận)</b> · Thua <b>KHÔNG bị trừ Elo</b> · Không giới hạn số trận mỗi ngày. Tha hồ cọ xát và thử nghiệm bộ bài!</p>
            </div>
          </div>
          <div class="rank-promo-item">
            <span class="rank-promo-icon">🏆📈</span>
            <div>
              <b>Hệ Thống Phân Hạng Elo Chuẩn</b>
              <p>Tân Binh ➔ Đồng (1000) ➔ Bạc (1200) ➔ Vàng (1400) ➔ Bạch Kim (1600) ➔ Kim Cương (1800) ➔ Cao Thủ (2000+).</p>
            </div>
          </div>
        </div>
        <div class="rank-promo-actions">
          <button type="button" class="primary-btn" id="promoPlayBtn">⚔️ Vào trận ngay</button>
          <button type="button" class="secondary-btn" id="promoBoardBtn">🏆 Xem Bảng Xếp Hạng</button>
          <button type="button" class="secondary-btn" id="promoDismissBtn">Đã hiểu</button>
        </div>
      </div>
    \`;
    const dismiss = () => {
      try { sessionStorage.setItem('rank-promo-dismissed', '1'); } catch {}
      overlay.remove();
    };
    overlay.onclick = event => { if (event.target === overlay) dismiss(); };
    overlay.onkeydown = event => { if (event.key === 'Escape') dismiss(); };
    document.body.appendChild(overlay);
    document.getElementById('closeRankPromo').onclick = dismiss;
    document.getElementById('promoDismissBtn').onclick = dismiss;
    document.getElementById('promoBoardBtn').onclick = () => { dismiss(); show(); };
    document.getElementById('promoPlayBtn').onclick = () => {
      dismiss();
      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.click();
    };
  }

  function tryAutoPromo() {
    try {
      if (sessionStorage.getItem('rank-promo-dismissed')) return;
      if (document.getElementById('duel') && !document.getElementById('duel').classList.contains('hidden')) return;
      showRankPromo();
    } catch {}
  }
  setTimeout(tryAutoPromo, 900);

  window.siteRank = { show, find, close, paint, showPromo: showRankPromo, refresh: async () => {`;

siteRankContent = siteRankContent.replace(`  window.siteRank = { show, find, close, paint, refresh: async () => {`, promoFunctionAndExport);

fs.writeFileSync(siteRankPath, siteRankContent, 'utf8');
console.log('Successfully updated assets/js/site_rank.js');

// 4. Update assets/css/site_rank.css
console.log('--- Updating site_rank.css ---');
const rankPromoCss = `
/* Rank Season Announcement Modal */
.rank-promo-overlay{position:fixed;inset:0;z-index:270000;background:rgba(4,15,24,0.88);backdrop-filter:blur(4px);display:grid;place-items:center;padding:16px;box-sizing:border-box;color:#edf9ff;font-family:'Nunito',system-ui,sans-serif;animation:rankFadeIn .25s ease-out}
@keyframes rankFadeIn{from{opacity:0}to{opacity:1}}
.rank-promo-card{position:relative;width:min(560px,100%);max-height:92dvh;overflow-y:auto;box-sizing:border-box;background:linear-gradient(160deg,#10344d,#081d2e);border:2px solid #e2be6f;border-radius:20px;padding:24px;box-shadow:0 16px 50px rgba(0,0,0,0.7),0 0 30px rgba(226,190,111,0.2);text-align:center}
.rank-promo-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border:1px solid #7cb1c7;border-radius:50%;background:#17455c;color:#fff;font-size:16px;font-weight:900;cursor:pointer;display:grid;place-items:center;line-height:1}
.rank-promo-badge{display:inline-block;padding:5px 14px;background:linear-gradient(90deg,#b91c1c,#d97706);border:1px solid #fbbf24;border-radius:999px;color:#fff;font-size:12px;font-weight:900;letter-spacing:0.5px;margin-bottom:12px;box-shadow:0 2px 10px rgba(217,119,6,0.4)}
.rank-promo-card h2{margin:0 0 8px;color:#ffe3a3;font-size:21px;line-height:1.3}
.rank-promo-subtitle{margin:0 0 18px;color:#c0e0ee;font-size:13px;line-height:1.4}
.rank-promo-features{display:grid;gap:12px;text-align:left;margin-bottom:22px}
.rank-promo-item{display:flex;align-items:flex-start;gap:12px;background:#09263a;border:1px solid #376378;border-radius:12px;padding:12px}
.rank-promo-icon{font-size:24px;line-height:1;flex-shrink:0;margin-top:2px}
.rank-promo-item b{display:block;color:#ffebb5;font-size:13.5px;margin-bottom:4px}
.rank-promo-item p{margin:0;color:#c9e3ed;font-size:12px;line-height:1.45}
.rank-promo-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.rank-promo-actions button{min-height:42px;padding:8px 18px;font-size:13.5px;font-weight:900;border-radius:10px;cursor:pointer}
.rank-promo-actions .primary-btn{background:linear-gradient(#f59e0b,#d97706);border:1px solid #fde68a;color:#fff;box-shadow:0 4px 15px rgba(217,119,6,0.4)}
.rank-promo-actions .secondary-btn{background:#17485e;border:1px solid #7daec3;color:#edf9ff}
@media(max-width:600px){.rank-promo-card{padding:18px 14px}.rank-promo-card h2{font-size:18px}.rank-promo-badge{font-size:11px;padding:4px 10px}.rank-promo-item{padding:10px;gap:10px}.rank-promo-actions button{width:100%}}
`;
const cssPath = path.join(root, 'assets/css/site_rank.css');
let currentCss = fs.readFileSync(cssPath, 'utf8');
if (!currentCss.includes('rank-promo-overlay')) {
  fs.writeFileSync(cssPath, currentCss.trim() + '\n' + rankPromoCss, 'utf8');
  console.log('Successfully appended rank promo CSS to site_rank.css');
}

// 5. Update assets/js/memecard.js cache buster
console.log('--- Updating memecard.js cache buster ---');
replaceInFile(
  'assets/js/memecard.js',
  `frame.src = 'memecard.html?v=20261026-confirm-v1';`,
  `frame.src = 'memecard.html?v=20261027-bxh-promo1';`
);
replaceInFile(
  'assets/js/memecard.js',
  `!frame.src.includes('v=20261026-confirm-v1')`,
  `!frame.src.includes('v=20261027-bxh-promo1')`
);

// 6. Update index.html and memecard.html version query params
console.log('--- Updating index.html and memecard.html version params ---');
replaceInFile(
  'index.html',
  `<script src="assets/js/memecard.js?v=20261026-confirm-v1"></script>`,
  `<script src="assets/js/memecard.js?v=20261027-bxh-promo1"></script>`
);
replaceInFile(
  'index.html',
  `<link rel="stylesheet" href="assets/css/site_rank.css?v=20261026-rank-presence1">`,
  `<link rel="stylesheet" href="assets/css/site_rank.css?v=20261027-bxh-promo1">`
);
replaceInFile(
  'index.html',
  `<script src="assets/js/site_rank.js?v=20261027-bxh-elo1"></script>`,
  `<script src="assets/js/site_rank.js?v=20261027-bxh-promo1"></script>`
);

replaceInFile(
  'memecard.html',
  `<link rel="stylesheet" href="assets/css/site_rank.css?v=20261026-rank-presence1">`,
  `<link rel="stylesheet" href="assets/css/site_rank.css?v=20261027-bxh-promo1">`
);
replaceInFile(
  'memecard.html',
  `<script src="assets/js/meme_game.js?v=20261027-bxh-elo1"></script>`,
  `<script src="assets/js/meme_game.js?v=20261027-bxh-promo1"></script>`
);
replaceInFile(
  'memecard.html',
  `<script src="assets/js/meme_online.js?v=20261027-bxh-elo1"></script>`,
  `<script src="assets/js/meme_online.js?v=20261027-bxh-promo1"></script>`
);
replaceInFile(
  'memecard.html',
  `<script src="assets/js/site_rank.js?v=20261027-bxh-elo1"></script>`,
  `<script src="assets/js/site_rank.js?v=20261027-bxh-promo1"></script>`
);
replaceInFile(
  'memecard.html',
  `<script src="assets/js/meme_id_duel.js?v=20261027-bxh-elo1"></script>`,
  `<script src="assets/js/meme_id_duel.js?v=20261027-bxh-promo1"></script>`
);

console.log('ALL UPDATES APPLIED SUCCESSFULLY!');
