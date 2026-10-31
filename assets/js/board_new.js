// ===== 🏁 BOARD_NEW.JS — Cờ Đua Sinh Tồn v4.0 (Yu-Gi-Oh Style) =====
'use strict';

// Resolve getMyNetworkId() from global window (set by game.js)
function getMyNetworkId() { return window.myNetworkId || ''; }

function boardRefreshHud() {
    if (typeof window.refreshHudDisplay === 'function' && window.refreshHudDisplay !== boardRefreshHud) {
        window.refreshHudDisplay();
    }
}

var boardGame = null;

const BOARD_CUSTOM_COORDS = [
    { x: 8.0, y: 51.0 },
    { x: 8.0, y: 55.6 },
    { x: 8.0, y: 60.2 },
    { x: 8.0, y: 64.8 },
    { x: 8.0, y: 69.41 },
    { x: 10.01, y: 72.0 },
    { x: 14.61, y: 72.0 },
    { x: 19.21, y: 72.0 },
    { x: 23.81, y: 72.0 },
    { x: 28.41, y: 72.0 },
    { x: 33.01, y: 72.0 },
    { x: 37.61, y: 72.0 },
    { x: 42.22, y: 72.0 },
    { x: 46.82, y: 72.0 },
    { x: 51.42, y: 72.0 },
    { x: 55.67, y: 70.37 },
    { x: 59.88, y: 68.5 },
    { x: 64.29, y: 68.73 },
    { x: 68.78, y: 69.73 },
    { x: 73.36, y: 70.0 },
    { x: 77.96, y: 70.0 },
    { x: 82.56, y: 70.0 },
    { x: 86.64, y: 67.98 },
    { x: 90.66, y: 65.75 },
    { x: 92.0, y: 61.93 },
    { x: 92.0, y: 57.33 },
    { x: 92.0, y: 52.73 },
    { x: 92.0, y: 48.13 },
    { x: 92.0, y: 43.53 },
    { x: 92.0, y: 38.93 },
    { x: 92.0, y: 34.33 },
    { x: 92.0, y: 29.73 },
    { x: 92.0, y: 25.12 },
    { x: 92.0, y: 20.52 },
    { x: 91.01, y: 16.04 },
    { x: 89.57, y: 12.0 },
    { x: 84.97, y: 12.0 },
    { x: 80.36, y: 12.0 },
    { x: 75.76, y: 12.0 },
    { x: 71.16, y: 12.0 },
    { x: 66.56, y: 12.0 },
    { x: 61.96, y: 12.0 },
    { x: 57.36, y: 12.0 },
    { x: 52.76, y: 12.0 },
    { x: 48.15, y: 12.0 },
    { x: 43.55, y: 12.0 },
    { x: 38.95, y: 12.0 },
    { x: 34.35, y: 12.0 },
    { x: 29.75, y: 12.0 },
    { x: 25.15, y: 12.0 },
    { x: 20.55, y: 12.0 },
    { x: 15.95, y: 12.0 },
    { x: 12.59, y: 14.75 },
    { x: 9.56, y: 18.21 },
    { x: 8.0, y: 22.23 },
    { x: 8.0, y: 26.83 },
    { x: 8.0, y: 31.43 },
    { x: 8.0, y: 36.03 },
    { x: 8.0, y: 40.63 },
    { x: 11.23, y: 42.0 },
    { x: 15.83, y: 42.0 },
    { x: 20.44, y: 42.0 },
    { x: 24.49, y: 40.26 },
    { x: 28.26, y: 37.62 },
    { x: 32.03, y: 34.99 },
    { x: 36.25, y: 33.14 },
    { x: 40.46, y: 31.3 },
    { x: 44.68, y: 29.45 },
    { x: 48.97, y: 28.0 },
    { x: 53.58, y: 28.0 },
    { x: 58.18, y: 28.0 },
    { x: 62.78, y: 28.0 },
    { x: 66.06, y: 30.13 },
    { x: 68.12, y: 34.24 },
    { x: 70.18, y: 38.36 },
    { x: 71.76, y: 42.47 },
    { x: 69.7, y: 46.59 },
    { x: 67.65, y: 50.71 },
    { x: 65.59, y: 54.82 },
    { x: 61.8, y: 56.75 },
    { x: 57.33, y: 57.81 },
    { x: 52.85, y: 58.86 },
    { x: 48.37, y: 59.91 },
    { x: 43.9, y: 58.98 },
    { x: 39.44, y: 57.86 },
    { x: 34.97, y: 56.74 },
    { x: 31.48, y: 54.56 },
    { x: 29.9, y: 50.23 },
    { x: 28.33, y: 45.91 },
    { x: 30.98, y: 42.92 },
    { x: 34.75, y: 40.28 },
    { x: 38.63, y: 38.0 },
    { x: 43.23, y: 38.0 },
    { x: 47.83, y: 38.0 },
    { x: 52.43, y: 38.0 },
    { x: 57.04, y: 38.0 },
    { x: 58.0, y: 41.64 },
    { x: 56.81, y: 45.36 },
    { x: 52.41, y: 46.68 },
    { x: 48.0, y: 48.0 }
];

const BOARD_CHARACTERS = [
    { id: 'trau', name: 'Trâu Trẻ Trâu', img: 'assets/img/board/char_trau.png', color: '#ff4444', desc: 'Trâu Trẻ Trâu với cây gậy gỗ sẵn sàng đối đầu mọi nguy hiểm.' },
    { id: 'mam', name: 'Mầm Mềm Mẽ', img: 'assets/img/board/char_mam.png', color: '#e084fc', desc: 'Mầm Mềm Mẽ duyên dáng nhưng ẩn chứa năng lực sinh tồn bền bỉ.' },
    { id: 'kien', name: 'Kiến Bảo Vệ', img: 'assets/img/board/char_kien.png', color: '#22c55e', desc: 'Kiến Bảo Vệ trong sắc xanh quân phục trị an xóm làng.' },
    { id: 'ut', name: 'Út Mũ Rơm', img: 'assets/img/board/char_ut.png', color: '#3b82f6', desc: 'Út Mũ Rơm tinh nghịch cùng chiếc súng cao su bách phát bách trúng.' }
];

window.boardSelectedCharDisplayIdx = 0;

window.boardSelectCharacterDisplay = function(idx) {
    try { audio.play('click'); } catch(e){}
    window.boardSelectedCharDisplayIdx = idx;
    document.querySelectorAll('#boardGameModal .char-card').forEach(card => {
        card.classList.toggle('active', card.id === 'charCard_' + idx);
    });
    window.boardUpdateCharPanel();
};

window.boardUpdateCharPanel = function() {
    if (!boardGame || !boardGame.players) return;
    const p = boardGame.players[window.boardSelectedCharDisplayIdx];
    if (!p) return;

    const section = document.querySelector('#boardGameModal .info-section');
    if (section) section.style.setProperty('--pc', p.color || '#f4c766');
    const title = section && section.querySelector('.info-title');
    if (title) title.textContent = p.eliminated ? `${p.name} · Đã gục` : `${p.name} · Ô ${p.pos + 1}`;

    const livesEl = document.getElementById('boardInfoLives');
    const weaponsEl = document.getElementById('boardInfoWeapons');
    const shieldsEl = document.getElementById('boardInfoShields');
    const goldEl = document.getElementById('boardInfoGold');

    if (livesEl) livesEl.textContent = p.eliminated ? '💀' : '♥'.repeat(Math.max(0, p.lives || 0));
    if (weaponsEl) weaponsEl.textContent = p.weapons;
    if (shieldsEl) shieldsEl.textContent = p.shields;
    if (goldEl) goldEl.textContent = p.gold !== undefined ? p.gold : 0;
};

const BOARD_TOTAL_CELLS = 100;

const RACE_DICE_EMOJIS = ['⚀','⚁','⚂','⚃','⚄','⚅'];
const RACE_PLAYER_COLORS = ['#ef4444','#e084fc','#22c55e','#3b82f6'];
// 12 khu vực quanh Quảng Trường Xóm Làng (theo bản concept art), rải đều 40 ô đường đua.
const NEIGHBORHOOD_NAMES = [
    "Nhà Hòa", "Nhà Mắm", "Nhà Ba Tý", "Nhà Út", "Nhà Trưởng Thôn",           // Khu 1: Nhà Dân
    "Chợ Xóm", "Quán Bún", "Tạp Hóa", "Tiệm Thuốc", "Quán Nước", "Bãi Gửi Xe", // Khu 2: Chợ
    "Quán Net Thu Thảo",                                                       // Khu 3
    "Ruộng Lúa", "Ruộng Rau", "Bù Nhìn", "Máy Cày",                            // Khu 4: Ruộng
    "Chuồng Gà", "Chuồng Vịt", "Ao Cá", "Chuồng Heo",                          // Khu 5
    "Hẻm Tẹt",                                                                 // Khu 6
    "Chốt Bảo Vệ Kiên",                                                        // Khu 7
    "Gốc Đa Làng", "Miếu Nhỏ",                                                 // Khu 8
    "Bờ Sông", "Cầu Gỗ", "Bến Đò",                                             // Khu 9
    "Nghĩa Địa Cũ", "Mộ Cổ",                                                   // Khu 10
    "Đồi Tre", "Đường Mòn Tre",                                                // Khu 11
    "Sân Đá Bóng",
    "Quảng Trường Xóm Làng", "Cây Đa Cổ Thụ", "Giếng Nước", "Sân Đình",
    "Cột Điện", "Bãi Rác Nấm", "Quán Nhậu Huy"
];

const RACE_CARDS = [
    // 👾 MONSTER (Quái Vật) - Mất mạng nếu không có vũ khí
    { id: 'soi', name: "Sói Xám Đột Biến", type: 'monster', rarity: 'common', desc: "Sói xám nhe răng. Không có 🗡️ thì mất 1 ♥.", reward: 30, damage: 1,
      effect: function(p) { return boardFightMonster(p, this); } },
    { id: 'cuongthi', name: "Cương Thi Làng", type: 'monster', rarity: 'rare', desc: "Cương Thi nhảy tưng tưng đòi cắn. Cần 🗡️.", reward: 50, damage: 1,
      effect: function(p) { return boardFightMonster(p, this); } },
    { id: 'rong', name: "Rồng Lửa Cổ Đại", type: 'monster', rarity: 'epic', desc: "Rồng khè lửa. Không 🗡️/🛡️ là bay 2 ♥.", reward: 100, damage: 2,
      effect: function(p) { return boardFightMonster(p, this); } },

    // 🗡️ EQUIP (Trang bị - chỉ mua ở cửa hàng hoặc nhặt ngẫu nhiên trên ô)
    { id: 'kiem', name: "Kiếm Sắt Xóm", type: 'equip', rarity: 'common', desc: "Đồ Long Đao chợ trời. +1 🗡️.", value: 1,
      effect: function(p) { p.weapons += this.value; return `Vớ được kiếm! (+${this.value} 🗡️)`; } },
    { id: 'cung', name: "Cung Gỗ Trắc", type: 'equip', rarity: 'common', desc: "Cung tình yêu bắn... trượt. +1 🗡️.", value: 1,
      effect: function(p) { p.weapons += this.value; return `Vớ được cung! (+${this.value} 🗡️)`; } },
    { id: 'khien_go', name: "Khiên Gỗ Mộc", type: 'equip', rarity: 'common', desc: "Nắp vung nồi huyền thoại. +1 🛡️.", value: 1,
      effect: function(p) { p.shields += this.value; return `Nắp vung về tay! (+${this.value} 🛡️)`; } },
    { id: 'khien_thep', name: "Khiên Thép Đen", type: 'equip', rarity: 'rare', desc: "Khiên sắt xịn, đỡ được cả đời. +1 🛡️.", value: 1,
      effect: function(p) { p.shields += this.value; return `Khiên xịn về tay! (+${this.value} 🛡️)`; } },
    { id: 'cuuthuong', name: "Hộp Cứu Thương", type: 'equip', rarity: 'epic', desc: "Hộp cứu thương thơm long não. +1 ❤️.", value: 1,
      effect: function(p) { if(p.lives < 3) { p.lives += this.value; return `Dán băng! (+${this.value} ❤️)`; } return 'Máu đầy rồi, khỏi uống.'; } },

    // 🌪️ FUN SPELL (Bài ma pháp vui nhộn phát trên tay khi bắt đầu game)
    { id: 'cuongphong', name: "Cuồng Phong", type: 'fun_spell', rarity: 'common', desc: "Gió cuốn bay dép. Tiến 3 ô.", value: 3,
      effect: function(p) { boardMovePlayer(p.idx, this.value, true); return `Bay như chó thả dây! (+${this.value} ô)`; } },
    { id: 'ruongvang', name: "Rương Vàng", type: 'fun_spell', rarity: 'rare', desc: "Rương rơi trúng đầu. +50 🪙.", value: 50,
      effect: function(p) { p.gold = (p.gold || 0) + this.value; if(p.isHuman) { boardRefreshHud(); } return `Rương rơi trúng đầu! (+${this.value} 🪙)`; } },
    { id: 'dichchuyen', name: "Dịch Chuyển Không Gian", type: 'fun_spell', rarity: 'epic', desc: "Đổi chỗ với đứa gần nhất. Nó ngơ ngác.",
      effect: function(p) { return boardSwapNearest(p); } },
    { id: 'vochuoi', name: "Vỏ Chuối Trơn Trượt", type: 'fun_spell', rarity: 'common', desc: "Vỏ chuối tự nhiên. Đứa gần nhất lùi 3 ô.",
      effect: function(p) {
          let nearest = null; let minDist = Infinity;
          boardGame.players.forEach((pl,i) => {
              if(i !== p.idx && !pl.eliminated) {
                  let d = Math.abs((pl.pos || 0) - (p.pos || 0));
                  if(d < minDist) { minDist = d; nearest = pl; }
              }
          });
          if(nearest) {
              boardMovePlayer(nearest.idx, -3, true);
              return `Trượt vỏ chuối! ${nearest.name} lùi 3 ô.`;
          }
          return 'Không có ai gần để ném vỏ chuối.';
      } 
    },
    { id: 'tromvang', name: "Ăn Trộm Tiền Lẻ", type: 'fun_spell', rarity: 'rare', desc: "Móc ví nhẹ tay. Trộm tối đa 40 🪙.",
      effect: function(p) {
          let nearest = null; let minDist = Infinity;
          boardGame.players.forEach((pl,i) => {
              if(i !== p.idx && !pl.eliminated) {
                  let d = Math.abs((pl.pos || 0) - (p.pos || 0));
                  if(d < minDist) { minDist = d; nearest = pl; }
              }
          });
          if(nearest) {
              let stolen = Math.min(nearest.gold || 0, 40);
              nearest.gold = Math.max(0, nearest.gold - stolen);
              if(nearest.isHuman) boardRefreshHud();
              
              p.gold = (p.gold || 0) + stolen;
              if (p.isHuman) boardRefreshHud();
              return `Móc ví ${nearest.name}: +${stolen} 🪙.`;
          }
          return 'Ví ai cũng rỗng.';
      }
    },
    { id: 'sieuquay', name: "Bùa Ngủ Gật Troll", type: 'fun_spell', rarity: 'rare', desc: "Bùa ngủ gật. Đứa kế tiếp ngáp 1 lượt.",
      effect: function(p) {
          let nextIdx = (p.idx + 1) % boardGame.players.length;
          let safety = 0;
          while(boardGame.players[nextIdx].eliminated && safety < 10) {
              nextIdx = (nextIdx + 1) % boardGame.players.length;
              safety++;
          }
          let target = boardGame.players[nextIdx];
          if (target) {
              target.skipTurn = true;
              return `${target.name} dính bùa, ngáp 1 lượt.`;
          }
          return 'Không ai để dán bùa.';
      }
    },
    { id: 'giasam', name: "Bão Thổi Ngược", type: 'fun_spell', rarity: 'rare', desc: "Bão thổi ngược. Đứa dẫn đầu lùi 4 ô.",
      effect: function(p) {
          const cand = boardGame.players.filter(x => !x.eliminated && x.idx !== p.idx);
          const leading = cand.length > 0 ? cand.reduce((a, b) => (a.pos > b.pos ? a : b)) : null;
          if (leading) {
              boardMovePlayer(leading.idx, -4, true);
              return `Gió thổi ${leading.name} lùi 4 ô.`;
          }
          return 'Không có ai để thổi.';
      }
    },
    { id: 'boombip', name: "Bom Khói Hài Hước", type: 'fun_spell', rarity: 'common', desc: "Bom khói rẻ tiền. Đứa ngẫu nhiên lùi 2 ô.",
      effect: function(p) {
          let targets = boardGame.players.filter(x => !x.eliminated && x.idx !== p.idx);
          if (targets.length > 0) {
              let target = targets[Math.floor(Math.random() * targets.length)];
              boardMovePlayer(target.idx, -2, true);
              return `Bùm! ${target.name} lùi 2 ô.`;
          }
          return 'Bom nổ suông.';
      }
    },
    { id: 'tocbientuong', name: "Bùa Tốc Biến Ẩn Danh", type: 'fun_spell', rarity: 'rare', desc: "Tốc biến liều mạng. Tiến 1–5 ô.",
      effect: function(p) {
          let steps = 1 + Math.floor(Math.random() * 5);
          boardMovePlayer(p.idx, steps, true);
          return `Biến mất! Tiến ${steps} ô.`;
      }
    },
    { id: 'trollportal', name: "Cổng Dịch Chuyển Troll", type: 'fun_spell', rarity: 'epic', desc: "Cổng troll: nhảy tới chỗ đứa dẫn đầu.",
      effect: function(p) {
          const cand = boardGame.players.filter(x => !x.eliminated && x.idx !== p.idx);
          const leading = cand.length > 0 ? cand.reduce((a, b) => (a.pos > b.pos ? a : b)) : null;
          if (leading && leading.pos > p.pos) {
              window.boardTeleportPlayer(p, leading.pos);
              return `Xuyên không tới ô ${p.pos+1} của ${leading.name}!`;
          }
          return 'Bạn đang dẫn đầu, khỏi troll.';
      }
    },

    // 🌪️ SPELL (Ma pháp môi trường vẽ trên ô)
    { id: 'locxoay', name: "Lốc Xoáy", type: 'spell', rarity: 'common', desc: "Lốc xoáy tự dưng. Lùi 2 ô.", value: -2,
      effect: function(p) { boardMovePlayer(p.idx, this.value, true); return `Lốc cuốn! Lùi ${Math.abs(this.value)} ô.`; } },

    // 💣 TRAP (Cạm bẫy)
    { id: 'trap_ho', name: "Hố Chông Trừng Phạt", type: 'trap', rarity: 'rare', desc: "Hố chông nhà ai đào. -1 ♥.", damage: 1,
      effect: function(p) { return boardTakeDamage(p, this.damage, "lọt hố chông"); } },
    { id: 'trap_set', name: "Sét Đánh", type: 'trap', rarity: 'epic', desc: "Sét đánh đứa dẫn đầu. -1 ♥.", damage: 1,
      effect: function(p) {
          const candL = boardGame.players.filter(x => !x.eliminated);
          const L = candL.length > 0 ? candL.reduce((a, b) => (a.pos > b.pos ? a : b)) : null; 
          if(L) return boardTakeDamage(L, this.damage, "bị sét đánh"); 
          return 'Sét đánh hụt.';
      } 
    },
    { id: 'huydebuff', name: "Thanh Lọc Độc Tố", type: 'fun_spell', rarity: 'common', desc: "Uống nước chanh, tỉnh ngủ. Hết mất lượt.",
      effect: function(p) {
          if (p.skipTurn) {
              p.skipTurn = false;
              return "Tỉnh ngủ rồi! Đi tiếp thôi.";
          }
          return "Đang tỉnh sẵn, khỏi uống.";
      }
    },
    { id: 'trombai', name: "Bàn Tay Nhanh Nhẹn", type: 'fun_spell', rarity: 'rare', desc: "Bàn tay nhanh như chớp. Trộm 1 lá.",
      effect: function(p) {
          let nearest = null; let minDist = Infinity;
          boardGame.players.forEach((pl,i) => {
              if(i !== p.idx && !pl.eliminated) {
                  let d = Math.abs((pl.pos || 0) - (p.pos || 0));
                  if(d < minDist) { minDist = d; nearest = pl; }
              }
          });
          if(nearest && nearest.hand && nearest.hand.length > 0) {
              let cardIdx = Math.floor(Math.random() * nearest.hand.length);
              let stolenCard = nearest.hand.splice(cardIdx, 1)[0];
              p.hand.push(stolenCard);
              return `Chôm được [${stolenCard.name}]!`;
          }
          return 'Hắn ta trắng tay.';
      }
    },
    { id: 'doidat', name: "Đảo Lộn Cạm Bẫy", type: 'fun_spell', rarity: 'epic', desc: "Bê bẫy đi chỗ khác. Tặng đứa dẫn đầu.",
      effect: function(p) {
          const cand = boardGame.players.filter(x => !x.eliminated && x.idx !== p.idx);
          const leading = cand.length > 0 ? cand.reduce((a, b) => (a.pos > b.pos ? a : b)) : null;
          if (leading) {
              let trapsRemoved = 0;
              for (let i = Math.max(0, p.pos - 2); i <= Math.min(BOARD_TOTAL_CELLS - 1, p.pos + 2); i++) {
                  if (boardGame.trappedCells[i]) {
                      delete boardGame.trappedCells[i];
                      trapsRemoved++;
                  }
              }
              boardGame.trappedCells[leading.pos] = true;
              return `Dời ${trapsRemoved} bẫy, gài 1 quả dưới chân ${leading.name}.`;
          }
          return 'Không có ai dẫn đầu.';
      }
    },
    { id: 'baohothanky', name: "Bảo Hộ Thần Kỳ", type: 'fun_spell', rarity: 'common', desc: "Nồi cơm điện che chắn. +1 🛡️, tiến 2 ô.",
      effect: function(p) {
          p.shields++;
          boardMovePlayer(p.idx, 2, true);
          return "Có khiên che, tiến 2 ô.";
      }
    }
];

// ── Hình minh họa + hiệu ứng kích hoạt thẻ bài ───────────────
const BOARD_CARD_EMOJI = {
    soi: '🐺', cuongthi: '🧟', rong: '🐉',
    kiem: '🗡️', cung: '🏹', khien_go: '🍳', khien_thep: '🛡️', cuuthuong: '🧰',
    cuongphong: '🌪️', ruongvang: '💰', dichchuyen: '🔀', vochuoi: '🍌', tromvang: '🧤',
    sieuquay: '😴', giasam: '🌬️', boombip: '💣', tocbientuong: '💨', trollportal: '🌀',
    locxoay: '🌪️', trap_ho: '🕳️', trap_set: '⚡', huydebuff: '🍋', trombai: '🃏',
    doidat: '🧨', baohothanky: '🍲'
};

const BOARD_CARD_CAPTIONS = {
    soi: 'GRỪ!', cuongthi: 'NHẢY!', rong: 'KHÈ!',
    kiem: 'CHÉM!', cung: 'TẠCH!', khien_go: 'KENG!', khien_thep: 'KENG!', cuuthuong: 'DÁN!',
    cuongphong: 'VÙ!', ruongvang: '+50!', dichchuyen: 'TRÁO!', vochuoi: 'TRƯỢT!', tromvang: 'MÓC!',
    sieuquay: 'NGÁP!', giasam: 'THỔI!', boombip: 'BÙM!', tocbientuong: 'VÈO!', trollportal: 'XUYÊN!',
    locxoay: 'XOÁY!', trap_ho: 'HỰ!', trap_set: 'ĐOÀNG!', huydebuff: 'TỈNH!', trombai: 'GIẬT!',
    doidat: 'GÀI!', baohothanky: 'CHE!'
};

const BOARD_CARD_ACCENT = {
    soi: '#aab6c4', cuongthi: '#8fe08f', rong: '#ff7b4f',
    kiem: '#c8d4de', cung: '#d9a066', khien_go: '#c98b45', khien_thep: '#8e9aa8', cuuthuong: '#7ee0a8',
    cuongphong: '#8ad8ff', ruongvang: '#ffd66b', dichchuyen: '#b49be8', vochuoi: '#ffe36b', tromvang: '#c8f4a0',
    sieuquay: '#b39ddb', giasam: '#8ec9d8', boombip: '#a8b0bd', tocbientuong: '#8ad8ff', trollportal: '#c08cff',
    locxoay: '#8ab6f0', trap_ho: '#c98b45', trap_set: '#ffe36b', huydebuff: '#ffe36b', trombai: '#ffb3c6',
    doidat: '#ff9f43', baohothanky: '#ffd66b'
};

const BOARD_CARD_TINTS = {
    monster: ['#ff6b5a', '#4a1410'],
    equip: ['#59c8ff', '#0d2f3f'],
    trap: ['#ffb347', '#3a1d07'],
    fun_spell: ['#b49be8', '#241740'],
    spell: ['#8ab6f0', '#10233f']
};

const BOARD_CARD_PROPS = {
    soi: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M28,44 L30,14 L50,30 Q60,26 70,30 L90,14 L92,44 Q96,70 78,88 Q60,102 42,88 Q24,70 28,44 Z" fill="#9aa7b5"/>
        <path d="M35,38 L37,24 L48,34 Z M85,38 L83,24 L72,34 Z" fill="#5d6b7a"/>
        <circle cx="50" cy="56" r="5.5" fill="#ffe36b"/><circle cx="70" cy="56" r="5.5" fill="#ffe36b"/>
        <circle cx="50" cy="56" r="2" fill="#201827"/><circle cx="70" cy="56" r="2" fill="#201827"/>
        <path d="M46,76 Q60,86 74,76" stroke="#201827" stroke-width="4" fill="none"/>
        <path d="M52,78 l3,7 l3,-7 Z M62,78 l3,7 l3,-7 Z" fill="#fff"/>
        <path d="M28,52 Q33,48 38,52 M82,52 Q87,48 92,52" stroke="#201827" stroke-width="3" fill="none"/>
    </g>`,
    cuongthi: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M30,62 L10,72 M90,62 L110,72" stroke="#4f7a5a" stroke-width="9"/>
        <circle cx="60" cy="52" r="26" fill="#9fce9f"/>
        <path d="M40,40 Q48,28 60,30 Q72,28 80,40 L78,34 Q60,22 42,34 Z" fill="#2f3a2f"/>
        <rect x="50" y="20" width="20" height="30" rx="3" fill="#ffe36b" transform="rotate(-10 60 34)"/>
        <path d="M56,26 v18 M64,26 v18" stroke="#c0392b" stroke-width="2.4"/>
        <circle cx="51" cy="52" r="4.5" fill="#fff"/><circle cx="69" cy="52" r="4.5" fill="#fff"/>
        <circle cx="51" cy="53" r="2" fill="#201827"/><circle cx="69" cy="53" r="2" fill="#201827"/>
        <ellipse cx="60" cy="66" rx="6" ry="7" fill="#3a1a1a"/>
        <path d="M34,98 Q42,104 50,98 M60,98 Q68,104 76,98" stroke="#8fe08f" stroke-width="3" fill="none"/>
    </g>`,
    rong: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M26,44 Q34,18 62,20 Q90,22 96,48 L104,60 L96,64 Q90,88 62,92 Q34,92 26,66 Z" fill="#e86a3a"/>
        <path d="M34,30 L26,12 L48,24 Z M86,26 L98,10 L92,32 Z" fill="#f6c453"/>
        <path d="M28,44 L8,52 L26,56 Z" fill="#f6c453"/>
        <circle cx="48" cy="50" r="6" fill="#ffe36b"/><circle cx="48" cy="50" r="2.4" fill="#201827"/>
        <path d="M58,64 Q70,56 84,62 L86,72 Q72,80 58,72 Z" fill="#7a1f14"/>
        <path d="M60,66 l5,7 l5,-7 Z M72,66 l5,7 l4,-7 Z" fill="#fff"/>
        <path d="M82,30 Q92,36 96,48" stroke="#f6c453" stroke-width="4" fill="none"/>
        <path d="M18,84 Q8,72 16,64 Q24,74 34,70 Q26,84 18,84 Z" fill="#ffd66b"/>
    </g>`,
    kiem: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <g transform="rotate(-30 60 60)">
            <path d="M52,10 L68,10 L68,70 L60,82 L52,70 Z" fill="#c8d4de"/>
            <path d="M57,14 L57,72" stroke="#fff" stroke-width="2" opacity=".7"/>
            <rect x="32" y="70" width="56" height="11" rx="4" fill="#c98b45"/>
            <rect x="55" y="81" width="10" height="24" rx="4" fill="#7a5230"/>
            <circle cx="60" cy="108" r="7" fill="#ffd66b"/>
        </g>
        <path d="M22,30 l4,8 M32,22 l2,9 M96,26 l-5,8 M90,88 l-6,4" stroke="#ffe36b" stroke-width="3.4"/>
    </g>`,
    cung: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M38,14 Q96,60 38,106" fill="none" stroke="#c98b45" stroke-width="10"/>
        <path d="M38,14 L38,106" stroke="#e8c48a" stroke-width="2.4"/>
        <path d="M22,62 Q60,48 98,62" fill="none" stroke="#7a5230" stroke-width="4"/>
        <path d="M98,62 L86,55 L88,69 Z" fill="#7a5230"/>
        <path d="M106,62 Q112,54 118,60 Q112,66 106,62 Z" fill="#ff8fa3"/>
        <circle cx="106" cy="58" r="4" fill="#ff8fa3"/><circle cx="112" cy="58" r="4" fill="#ff8fa3"/>
        <path d="M18,88 q6,-6 12,0" stroke="#ffe36b" stroke-width="3" fill="none"/>
    </g>`,
    khien_go: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="60" cy="64" r="38" fill="#9fb7c9"/>
        <circle cx="60" cy="64" r="28" fill="#c8d4de"/>
        <circle cx="60" cy="64" r="10" fill="#8e9aa8"/>
        <rect x="52" y="18" width="16" height="12" rx="5" fill="#7a5230"/>
        <path d="M36,104 Q60,112 84,104" stroke="#201827" stroke-width="4" fill="none"/>
        <path d="M24,34 Q18,24 26,18 M96,34 Q102,24 94,18 M28,98 Q22,108 30,112" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>
    </g>`,
    khien_thep: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M60,14 L98,30 V62 Q98,94 60,108 Q22,94 22,62 V30 Z" fill="#3a4250"/>
        <path d="M60,24 L88,36 V62 Q88,86 60,97 Q32,86 32,62 V36 Z" fill="#5d6b7a"/>
        <circle cx="34" cy="40" r="4" fill="#c8d4de"/><circle cx="86" cy="40" r="4" fill="#c8d4de"/>
        <circle cx="34" cy="82" r="4" fill="#c8d4de"/><circle cx="86" cy="82" r="4" fill="#c8d4de"/>
        <path d="M52,58 L68,58 M60,50 L60,72" stroke="#c8d4de" stroke-width="5"/>
        <path d="M16,50 l-8,-4 M104,50 l8,-4" stroke="#ffe36b" stroke-width="3"/>
    </g>`,
    cuuthuong: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <rect x="24" y="38" width="72" height="54" rx="9" fill="#f4f7fa"/>
        <rect x="48" y="30" width="24" height="12" rx="5" fill="#c8d4de"/>
        <rect x="56" y="48" width="8" height="34" rx="2" fill="#ff5a4f"/>
        <rect x="43" y="61" width="34" height="8" rx="2" fill="#ff5a4f"/>
        <path d="M98,72 q12,0 12,12 q0,12 -12,12 q-12,0 -12,-12 q0,-12 12,-12 Z" fill="#ffe36b"/>
        <path d="M98,80 l0,16 M92,88 l12,0" stroke="#c98b45" stroke-width="3"/>
        <path d="M30,24 l4,8 M40,18 l1,8" stroke="#7ee0a8" stroke-width="3"/>
    </g>`,
    cuongphong: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M42,16 Q86,20 76,36 Q66,50 40,46 Q18,44 30,58 Q42,72 78,68 Q100,66 88,82 Q78,96 42,100" fill="none" stroke="#c8f4ff" stroke-width="11"/>
        <ellipse cx="24" cy="30" rx="14" ry="5" fill="#e8c48a" transform="rotate(-20 24 30)"/>
        <path d="M18,26 L24,12 L30,26 Z" fill="#c98b45"/>
        <path d="M94,28 q10,0 10,8 q0,8 -10,8 q-10,0 -10,-8 q0,-8 10,-8 Z" fill="#ff8fa3"/>
        <path d="M70,98 q8,-8 16,0 q-8,-4 -16,0 Z" fill="#fff"/>
        <path d="M30,76 l-10,4 M38,86 l-10,6" stroke="#8ad8ff" stroke-width="3.4"/>
    </g>`,
    ruongvang: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M22,54 Q22,34 60,34 Q98,34 98,54 L98,96 Q98,104 90,104 L30,104 Q22,104 22,96 Z" fill="#c98b45"/>
        <path d="M22,54 Q22,34 60,34 Q98,34 98,54 L98,64 Q60,76 22,64 Z" fill="#7a5230"/>
        <rect x="26" y="76" width="68" height="9" rx="3" fill="#ffd66b"/>
        <rect x="54" y="58" width="12" height="20" rx="4" fill="#ffd66b"/>
        <circle cx="20" cy="30" r="8" fill="#ffd66b"/><circle cx="20" cy="30" r="3" fill="#c98b45"/>
        <circle cx="100" cy="24" r="7" fill="#ffd66b"/><circle cx="100" cy="24" r="2.5" fill="#c98b45"/>
        <circle cx="104" cy="46" r="6" fill="#ffd66b"/><circle cx="104" cy="46" r="2" fill="#c98b45"/>
        <path d="M34,18 l3,7 M44,10 l1,8 M78,14 l-4,7" stroke="#ffe36b" stroke-width="3"/>
    </g>`,
    dichchuyen: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M38,34 A34,34 0 0 1 92,50" fill="none" stroke="#c08cff" stroke-width="9"/>
        <path d="M92,50 L80,42 L94,38 Z" fill="#c08cff"/>
        <path d="M82,86 A34,34 0 0 1 28,70" fill="none" stroke="#c08cff" stroke-width="9"/>
        <path d="M28,70 L40,78 L26,82 Z" fill="#c08cff"/>
        <ellipse cx="34" cy="62" rx="15" ry="5" fill="#e8c48a"/>
        <path d="M28,58 L34,44 L40,58 Z" fill="#c98b45"/>
        <ellipse cx="88" cy="54" rx="15" ry="5" fill="#e8c48a"/>
        <path d="M82,50 L88,36 L94,50 Z" fill="#c98b45"/>
        <path d="M20,20 l3,7 M100,92 l3,7 M100,20 l-3,7" stroke="#ffe36b" stroke-width="3"/>
    </g>`,
    vochuoi: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M30,86 Q24,62 48,52 Q70,42 88,58 Q100,70 92,86 Q76,74 60,84 Q44,94 30,86 Z" fill="#ffe36b"/>
        <path d="M40,78 Q48,62 62,58" fill="none" stroke="#e8c48a" stroke-width="3"/>
        <path d="M66,30 Q82,28 86,44 L78,50 Q72,38 62,40 Z" fill="#ff8fa3"/>
        <path d="M86,44 Q98,40 104,50" fill="none" stroke="#201827" stroke-width="4"/>
        <path d="M28,42 q-8,4 -14,0 M24,30 q-8,4 -14,0" stroke="#8ad8ff" stroke-width="3"/>
        <path d="M98,68 l6,6 M92,76 l8,4" stroke="#201827" stroke-width="3"/>
    </g>`,
    tromvang: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M58,58 Q58,42 74,40 Q92,38 96,54 L96,88 Q96,98 84,98 L68,98 Q58,98 58,88 Z" fill="#7a5230"/>
        <path d="M66,42 Q74,30 84,42" fill="none" stroke="#5c3a20" stroke-width="4"/>
        <path d="M22,58 Q42,50 58,66 L50,78 Q34,70 20,76 Z" fill="#ffe0bd"/>
        <path d="M18,56 Q26,50 34,54 L30,74 Q22,74 16,70 Z" fill="#3a4250"/>
        <path d="M28,52 L44,54 L42,60 L26,58 Z" fill="#201827"/>
        <circle cx="40" cy="34" r="8" fill="#ffd66b"/><circle cx="40" cy="34" r="3" fill="#c98b45"/>
        <circle cx="24" cy="32" r="6" fill="#ffd66b"/><circle cx="24" cy="32" r="2" fill="#c98b45"/>
        <path d="M100,30 l4,8 M108,44 l6,2" stroke="#ffe36b" stroke-width="3"/>
    </g>`,
    sieuquay: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="54" cy="64" r="24" fill="#ffe0bd"/>
        <path d="M30,52 Q38,38 54,40 Q70,38 78,52 L74,46 Q54,32 34,46 Z" fill="#3a2414"/>
        <path d="M44,62 Q48,58 52,62 M58,62 Q62,58 66,62" fill="none" stroke="#201827" stroke-width="3"/>
        <ellipse cx="55" cy="74" rx="5" ry="4" fill="#3a1a1a"/>
        <rect x="62" y="24" width="22" height="34" rx="3" fill="#ffe36b" transform="rotate(12 73 41)"/>
        <path d="M68,32 l10,2 M68,40 l10,2 M68,48 l8,2" stroke="#c0392b" stroke-width="2.4"/>
        <text x="96" y="40" font-family="Arial Black,Arial,sans-serif" font-size="22" font-weight="900" fill="#c8f4ff" transform="rotate(-12 96 40)">Z</text>
        <text x="104" y="62" font-family="Arial Black,Arial,sans-serif" font-size="15" font-weight="900" fill="#c8f4ff" transform="rotate(-12 104 62)">z</text>
        <path d="M18,90 Q28,84 38,90" stroke="#b39ddb" stroke-width="3" fill="none"/>
    </g>`,
    giasam: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M26,62 Q20,38 44,36 Q50,20 70,24 Q90,26 94,46 Q110,48 106,64 Q102,78 84,78 L40,78 Q26,78 26,62 Z" fill="#9fb7c9"/>
        <circle cx="54" cy="52" r="5" fill="#201827"/><circle cx="76" cy="52" r="5" fill="#201827"/>
        <path d="M56,66 Q64,60 72,66" fill="none" stroke="#201827" stroke-width="3"/>
        <path d="M94,64 Q106,58 114,64 M92,72 Q104,68 112,74" stroke="#8ad8ff" stroke-width="4" fill="none"/>
        <ellipse cx="104" cy="92" rx="13" ry="4" fill="#e8c48a" transform="rotate(-16 104 92)"/>
        <path d="M98,88 L104,76 L110,88 Z" fill="#c98b45"/>
        <path d="M30,92 Q40,84 50,92" stroke="#8ad8ff" stroke-width="3" fill="none"/>
    </g>`,
    boombip: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="56" cy="72" r="30" fill="#3a4250"/>
        <circle cx="46" cy="62" r="8" fill="#5d6b7a"/>
        <rect x="62" y="34" width="16" height="10" rx="4" fill="#201827" transform="rotate(18 70 39)"/>
        <path d="M76,36 Q90,26 86,14" fill="none" stroke="#c98b45" stroke-width="4"/>
        <path d="M86,14 l4,-8 l1,10 l8,-4 l-6,8" fill="#ffb347"/>
        <circle cx="92" cy="52" r="10" fill="#9fb7c9" opacity=".75"/>
        <circle cx="104" cy="66" r="7" fill="#9fb7c9" opacity=".6"/>
        <circle cx="98" cy="82" r="5" fill="#9fb7c9" opacity=".5"/>
        <path d="M20,58 l-8,-4 M22,72 l-10,0 M24,86 l-8,6" stroke="#ffb347" stroke-width="3.4"/>
    </g>`,
    tocbientuong: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <g opacity=".35" transform="translate(-30,4)">
            <circle cx="52" cy="42" r="13" fill="#8ad8ff"/><path d="M40,60 L64,60 L58,98 L46,98 Z" fill="#8ad8ff"/>
        </g>
        <g opacity=".6" transform="translate(-14,2)">
            <circle cx="52" cy="42" r="13" fill="#8ad8ff"/><path d="M40,60 L64,60 L58,98 L46,98 Z" fill="#8ad8ff"/>
        </g>
        <circle cx="58" cy="40" r="15" fill="#ffe0bd"/>
        <path d="M44,36 Q50,22 62,24 Q74,22 78,36 L74,30 Q58,20 42,30 Z" fill="#3a2414"/>
        <circle cx="53" cy="40" r="2.4" fill="#201827"/><circle cx="64" cy="40" r="2.4" fill="#201827"/>
        <path d="M55,48 Q59,51 63,48" stroke="#201827" stroke-width="2.4" fill="none"/>
        <path d="M46,58 L70,58 L66,96 L50,96 Z" fill="#59c8ff"/>
        <path d="M18,78 L-4,78 M84,84 L108,84 M14,94 L-6,94" stroke="#c8f4ff" stroke-width="5"/>
        <path d="M86,64 l10,-4 M90,74 l12,0" stroke="#c8f4ff" stroke-width="3.4"/>
    </g>`,
    trollportal: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="62" cy="60" r="36" fill="#6b3fa0"/>
        <circle cx="62" cy="60" r="27" fill="#2a1a44"/>
        <path d="M44,48 Q62,34 80,48 Q94,62 78,74 Q60,86 46,70" fill="none" stroke="#c08cff" stroke-width="5"/>
        <path d="M92,88 Q108,92 106,74 L96,70 Q100,82 88,80 Z" fill="#7ee0a8"/>
        <path d="M98,92 L110,98" stroke="#201827" stroke-width="4"/>
        <path d="M30,20 l3,8 M100,28 l4,7 M24,70 l-6,4" stroke="#ffe36b" stroke-width="3"/>
        <circle cx="96" cy="22" r="4" fill="#ffe36b"/><circle cx="18" cy="46" r="3" fill="#ffe36b"/>
    </g>`,
    locxoay: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M30,18 Q80,22 72,38 Q62,54 36,50 Q14,48 26,62 Q38,78 82,74 Q102,72 90,88" fill="none" stroke="#8ad8ff" stroke-width="10"/>
        <circle cx="58" cy="64" r="16" fill="#ffe0bd"/>
        <circle cx="52" cy="62" r="2.4" fill="#201827"/><circle cx="64" cy="62" r="2.4" fill="#201827"/>
        <path d="M52,72 Q58,68 64,72 Q58,78 52,72 Z" fill="#3a1a1a"/>
        <path d="M34,50 l-6,6 M80,56 l8,2" stroke="#c8f4ff" stroke-width="3"/>
        <path d="M24,84 l-8,4 M96,30 l8,-2" stroke="#ffe36b" stroke-width="3"/>
    </g>`,
    trap_ho: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <ellipse cx="60" cy="76" rx="44" ry="20" fill="#2a1a14"/>
        <ellipse cx="60" cy="74" rx="34" ry="14" fill="#0d0906"/>
        <path d="M30,74 l10,-14 l8,14 Z M50,76 l10,-16 l8,16 Z M70,76 l10,-14 l8,14 Z" fill="#9fb7c9"/>
        <path d="M22,70 Q40,58 60,62 Q82,58 98,70" fill="none" stroke="#e8c48a" stroke-width="4"/>
        <path d="M84,22 L86,40 L102,40 Q100,56 84,52 L82,60" fill="none" stroke="#c98b45" stroke-width="4"/>
        <path d="M86,22 Q80,14 90,12 Q98,14 92,22 Z" fill="#ff8fa3"/>
        <path d="M20,38 l4,8 M30,28 l2,8" stroke="#ffe36b" stroke-width="3"/>
    </g>`,
    trap_set: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M66,8 L40,58 L58,58 L42,104 L86,48 L66,48 L84,8 Z" fill="#ffe36b"/>
        <path d="M50,72 L36,86 M64,84 L58,100" stroke="#ffb347" stroke-width="3"/>
        <ellipse cx="72" cy="96" rx="22" ry="7" fill="#e8c48a"/>
        <path d="M56,92 L72,72 L88,92 Z" fill="#7a5230"/>
        <path d="M92,22 l4,8 M104,34 l6,2 M24,24 l-6,4" stroke="#c8f4ff" stroke-width="3"/>
    </g>`,
    huydebuff: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M34,34 L82,34 L76,100 L40,100 Z" fill="#d9f7ff"/>
        <path d="M34,34 L82,34 L80,48 L36,48 Z" fill="#8ad8ff"/>
        <circle cx="58" cy="54" r="15" fill="#ffe36b"/>
        <path d="M58,40 L58,68 M44,54 L72,54" stroke="#fff" stroke-width="2.4"/>
        <path d="M64,34 L72,12 L78,14 L70,36" fill="#ff8fa3"/>
        <path d="M88,64 l4,8 M96,50 l4,8 M92,80 l6,4" stroke="#7ee0a8" stroke-width="3"/>
        <text x="92" y="38" font-family="Arial Black,Arial,sans-serif" font-size="16" font-weight="900" fill="#c8f4ff">Z</text>
        <path d="M82,28 L100,44" stroke="#ff5a4f" stroke-width="4"/>
    </g>`,
    trombai: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <rect x="44" y="30" width="34" height="52" rx="5" fill="#f4f7fa" transform="rotate(-8 61 56)"/>
        <path d="M50,38 L72,34 M48,48 L70,44 M46,58 L68,54" stroke="#b49be8" stroke-width="3"/>
        <path d="M14,58 Q28,46 44,54 L40,70 Q26,64 16,72 Z" fill="#ffe0bd"/>
        <path d="M8,56 Q16,50 24,54 L20,70 Q12,70 6,66 Z" fill="#8a5bb8"/>
        <path d="M94,44 Q82,44 74,54 L78,70 Q92,62 100,66 Z" fill="#ffe0bd"/>
        <path d="M102,42 Q94,40 88,46 L92,60 Q100,60 106,56 Z" fill="#ff8fa3"/>
        <path d="M60,20 l2,8 M70,16 l0,8 M84,90 l6,4" stroke="#ffe36b" stroke-width="3"/>
    </g>`,
    doidat: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="56" cy="36" r="14" fill="#ffe0bd"/>
        <path d="M42,32 Q48,18 60,20 Q72,18 76,32 L72,26 Q56,16 40,26 Z" fill="#3a2414"/>
        <circle cx="51" cy="36" r="2.2" fill="#201827"/><circle cx="62" cy="36" r="2.2" fill="#201827"/>
        <path d="M54,44 Q58,47 62,44" stroke="#201827" stroke-width="2.2" fill="none"/>
        <path d="M46,52 L68,52 L70,82 L48,82 Z" fill="#ff9f43"/>
        <path d="M44,58 L28,52 M70,58 L86,52" stroke="#ffe0bd" stroke-width="6"/>
        <circle cx="24" cy="50" r="13" fill="#3a4250"/>
        <path d="M36,44 Q44,38 42,30" fill="none" stroke="#c98b45" stroke-width="3"/>
        <path d="M42,30 l4,-6 l1,7 l6,-2" fill="#ffb347"/>
        <path d="M92,78 q6,4 12,0 M30,92 q6,4 12,0 M94,94 q6,4 12,0" stroke="#9fb7c9" stroke-width="3" fill="none"/>
    </g>`,
    baohothanky: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="60" cy="62" r="38" fill="#c8d4de"/>
        <circle cx="60" cy="62" r="27" fill="#9fb7c9"/>
        <circle cx="60" cy="62" r="9" fill="#7a5230"/>
        <rect x="54" y="18" width="12" height="12" rx="4" fill="#5d6b7a"/>
        <path d="M22,24 l4,8 M96,22 l-2,9 M104,74 l8,2 M18,72 l-6,6" stroke="#ffe36b" stroke-width="3"/>
        <path d="M34,102 Q60,110 86,102" fill="none" stroke="#201827" stroke-width="4"/>
        <path d="M40,16 q3,-8 6,0 q3,-8 6,0 M86,44 q3,-8 6,0 q3,-8 6,0" fill="#fff" stroke="#c98b45" stroke-width="1.6"/>
    </g>`,
    _default: `<g stroke="#201827" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <rect x="38" y="20" width="44" height="64" rx="6" fill="#f4f7fa" transform="rotate(-6 60 52)"/>
        <path d="M52,40 Q60,28 68,40 Q60,54 52,40 Z" fill="#ff8fa3"/>
        <path d="M52,66 Q60,60 68,66" fill="none" stroke="#201827" stroke-width="3"/>
        <path d="M20,32 l4,8 M96,70 l-4,8" stroke="#ffe36b" stroke-width="3"/>
    </g>`
};

function boardCardWitness(type) {
    const scared = type === 'monster' || type === 'trap';
    const eyes = scared
        ? `<ellipse cx="10" cy="12" rx="4.2" ry="5.2" fill="#fff"/><ellipse cx="24" cy="12" rx="4.2" ry="5.2" fill="#fff"/><circle cx="10" cy="13.5" r="1.8" fill="#231a2c"/><circle cx="24" cy="13.5" r="1.8" fill="#231a2c"/>`
        : `<path d="M5,12 Q9,7 13,12" stroke="#231a2c" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M21,12 Q25,7 29,12" stroke="#231a2c" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    const mouth = scared
        ? `<ellipse cx="17" cy="23" rx="3.8" ry="4.6" fill="#3a1a1a"/>`
        : `<path d="M11,20 Q17,27 23,20" stroke="#231a2c" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    const extra = scared
        ? `<path d="M31,6 Q35,12 31,16 Q27,12 31,6 Z" fill="#8ad8ff"/><path d="M2,26 q-4,3 -8,1" stroke="#8ad8ff" stroke-width="2" fill="none"/>`
        : `<path d="M32,4 l2.5,6 l-2.5,6 l-2.5,-6 Z" fill="#ffe36b"/>`;
    return `<g transform="translate(18,208) scale(1.12)">
        <circle cx="17" cy="17" r="16" fill="#ffe0bd" stroke="#231a2c" stroke-width="2.4"/>
        <path d="M1,15 Q4,-1 17,-1 Q30,-1 33,15 L30,9 Q17,4 4,9 Z" fill="#3a2414" stroke="#231a2c" stroke-width="1.4"/>
        ${eyes}${mouth}${extra}
        <ellipse cx="6" cy="19" rx="2.6" ry="1.4" fill="#ff8fa3" opacity=".55"/>
        <ellipse cx="28" cy="19" rx="2.6" ry="1.4" fill="#ff8fa3" opacity=".55"/>
    </g>`;
}

const _boardCardArtCache = {};
function boardCardArtSvg(card) {
    const id = (card && card.id) || '_default';
    if (_boardCardArtCache[id]) return _boardCardArtCache[id];
    const type = (card && card.type) || 'fun_spell';
    const tint = BOARD_CARD_ACCENT[id] || (BOARD_CARD_TINTS[type] || BOARD_CARD_TINTS.fun_spell)[0];
    const dark = (BOARD_CARD_TINTS[type] || BOARD_CARD_TINTS.fun_spell)[1];
    const prop = BOARD_CARD_PROPS[id] || BOARD_CARD_PROPS._default;
    const caption = BOARD_CARD_CAPTIONS[id] || 'HẢ?!';
    const rays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => {
        if (i % 2) return '';
        const x = (160 + 230 * Math.cos(a * Math.PI / 180)).toFixed(1);
        const y = (150 + 230 * Math.sin(a * Math.PI / 180)).toFixed(1);
        return `<path d="M160,150 L${x},${y}" stroke="${tint}" stroke-opacity=".22" stroke-width="38"/>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
        <defs>
            <radialGradient id="bg" cx="50%" cy="36%" r="82%">
                <stop offset="0" stop-color="${tint}" stop-opacity=".85"/>
                <stop offset=".52" stop-color="${dark}"/>
                <stop offset="1" stop-color="#120d1c"/>
            </radialGradient>
            <pattern id="dots" width="13" height="13" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.5" fill="#fff" fill-opacity=".13"/>
            </pattern>
        </defs>
        <rect width="320" height="320" fill="url(#bg)"/>
        <g>${rays}</g>
        <rect width="320" height="320" fill="url(#dots)"/>
        <path d="M0,238 Q54,206 108,232 T214,228 T320,240 L320,320 L0,320 Z" fill="#0b0812" opacity=".55"/>
        <g fill="#08060e" opacity=".78">
            <rect x="16" y="222" width="34" height="44"/><path d="M10,222 L33,202 L56,222 Z"/>
            <rect x="252" y="230" width="40" height="38"/><path d="M245,230 L272,210 L299,230 Z"/>
            <rect x="214" y="242" width="24" height="28"/><path d="M208,242 L226,228 L244,242 Z"/>
            <path d="M120,236 q4,-30 10,0 M132,238 q5,-24 11,0 M144,236 q4,-28 10,0"/>
        </g>
        <ellipse cx="160" cy="244" rx="100" ry="17" fill="#000" opacity=".38"/>
        <svg x="52" y="34" width="216" height="216" viewBox="0 0 120 120" overflow="visible">${prop}</svg>
        ${boardCardWitness(type)}
        <g transform="translate(252,52)">
            <polygon points="0,-32 9,-10 32,-9 14,5 20,28 0,15 -20,28 -14,5 -32,-9 -9,-10" fill="${tint}" stroke="#150f1e" stroke-width="3"/>
            <text x="0" y="6" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="13" font-weight="900" fill="#1a1220" transform="rotate(-8)">${caption}</text>
        </g>
        <rect x="4" y="4" width="312" height="312" rx="24" fill="none" stroke="#ffffff2e" stroke-width="3"/>
    </svg>`;
    const uri = 'data:image/svg+xml,' + encodeURIComponent(svg);
    _boardCardArtCache[id] = uri;
    return uri;
}

window.boardCardArtUrl = function(card) {
    return boardCardArtSvg(card);
};

window.boardCardIcon = function(card) {
    const id = card && card.id;
    if (id && BOARD_CARD_EMOJI[id]) return BOARD_CARD_EMOJI[id];
    return card && card.type === 'monster' ? '👾' : card && card.type === 'equip' ? '🛡️' : card && card.type === 'trap' ? '💣' : '🌪️';
};

window.boardCardFaceHtml = function(card, result) {
    const badgeClass = `badge-${card.rarity}`;
    const art = window.boardCardArtUrl(card);
    return `<div class="drawn-card card-3d-flip ${card.type}-card">
        <span class="card-rarity-badge ${badgeClass}">${_boardEsc((card.rarity || '').toUpperCase())}</span>
        <div class="drawn-card-main">
            <div class="drawn-card-art" style="background-image:url('${art}')"></div>
            <div class="drawn-card-info">
                <div class="drawn-card-name">${window.boardCardIcon(card)} ${_boardEsc(card.name)}</div>
                <div class="drawn-card-desc">${_boardEsc(card.desc)}</div>
                <div class="drawn-card-result">👉 ${_boardEsc(result)}</div>
            </div>
        </div>
    </div>`;
};

window.boardCardNoticeBody = function(card, reason) {
    const art = window.boardCardArtUrl(card);
    return `<div class="notice-card">
        <div class="notice-card-frame"><div class="notice-card-art" style="background-image:url('${art}')"></div></div>
        <div class="notice-card-desc">${_boardEsc(card.desc || '')}</div>
        ${reason ? `<div class="notice-card-where">Rơi ở <b>${reason}</b>.</div>` : ''}
    </div>`;
};

function boardPlayCardEventFx(card, p, result) {
    const pos = p ? p.pos : (boardGame ? boardGame.currentTurn : 0);
    const text = String(result || '');
    if (card.type === 'monster') window.boardPlayFx('monster', pos, card.name);
    else if (card.type === 'trap') window.boardPlayFx('trap', pos, 'BÙM!');
    else if (/🪙/.test(text)) window.boardPlayFx('gold', pos, (text.match(/\+[\d.]+ 🪙/) || ['🪙'])[0]);
    else if (/🗡/.test(text)) window.boardPlayFx('weapon', pos, '+🗡️');
    else if (/🛡/.test(text)) window.boardPlayFx('shield', pos, '+🛡️');
    else if (/❤/.test(text)) window.boardPlayFx('heal', pos, '+❤️');
    else if (/lùi/i.test(text)) window.boardPlayFx('back', pos, '');
    else if (/Xuyên không|Đổi chỗ/i.test(text)) window.boardPlayFx('portal', pos, '🌀');
    else if (/ngáp|dính bùa/i.test(text)) window.boardPlayFx('sleep', pos, '💤');
    else window.boardPlayFx('card', pos, '');
}

window.boardShuffleDeck = function() {
    RACE_CARDS.sort(() => Math.random() - 0.5);
};

// Hàm Xử lý Đánh Quái (Tự động)
function boardFightMonster(p, card) {
    const mName = card.name;
    const damage = card.damage || 1;
    window.boardPlayFx('monster', p.pos, mName);
    if (p.weapons > 0) {
        p.weapons--;
        window.boardPlayFx('weapon', p.pos, 'Hạ gục!');
        return `Kết liễu ${mName} bằng 🗡️!`;
    } else {
        return boardTakeDamage(p, damage, `bị ${mName} cắn`);
    }
}

// Hàm Xử lý Mất Mạng
function boardTakeDamage(p, amount, reason) {
    if (p.shields > 0) {
        p.shields--;
        window.boardPlayFx('shield', p.pos, 'Đỡ!');
        return `🛡️ Khiên đỡ đòn (${reason}).`;
    }
    p.lives -= amount;
    if (p.lives <= 0) {
        p.eliminated = true;
        window.boardPlayFx('damage', p.pos, '💀', { count: 18 });
        boardAddLog(`💀 ${p.name} hết mạng, về quê!`, 'win');
        return `💀 Hết mạng! Bạn bị xóa khỏi bản đồ!`;
    }
    window.boardPlayFx('damage', p.pos, `-${amount} ♥`, { count: 13 });
    return `💔 -${amount} ♥ vì ${reason} (còn ${p.lives}).`;
}


// ── Vẽ thẻ bài 3D ─────────────────────────────────────────────
// FX do chính effect của thẻ phát ra; lớp thẻ chỉ vẽ bù khi effect chưa có hiệu ứng riêng.
function boardRunCardEffect(card, p) {
    const raw = window.boardPlayFx;
    let fx = 0;
    window.boardPlayFx = function () { fx++; return raw.apply(this, arguments); };
    let result;
    try {
        result = card.effect(p);
    } catch (err) {
        console.error('Card effect failed:', card && card.id, err);
        result = 'Thẻ bị kẹt, bỏ qua lượt này.';
    } finally {
        window.boardPlayFx = raw;
    }
    return { result: typeof result === 'string' ? result : String(result == null ? '' : result), fx };
}

window.boardDrawRandomCard = function(p, reason, callback) {
    if(boardGame.gameOver || p.eliminated) {
        if(callback) callback();
        return;
    }
    const roll = Math.random() * 100;
    let tier = roll < 50 ? 'common' : roll < 80 ? 'rare' : 'epic';
    let pool = RACE_CARDS.filter(c => c.rarity === tier);
    if(!pool.length) pool = RACE_CARDS;
    let card = pool[Math.floor(Math.random() * pool.length)];

    const applied = boardRunCardEffect(card, p);
    const result = applied.result;
    if (!applied.fx) boardPlayCardEventFx(card, p, result);

    const display = document.getElementById('boardCardDisplay');
    if (display) display.innerHTML = window.boardCardFaceHtml(card, result);
    boardAddLog(`🃏 ${p.name} lật [${card.name}]: ${result}`, 'card');

    window.boardShowBigNotice(
        `${window.boardCardIcon(card)} ${card.name}`,
        window.boardCardNoticeBody(card, reason),
        `👉 ${result}`,
        callback
    );
};


// ── Hoạt ảnh xúc xắc ──────────────────────────────────────────
window.boardDoRollAnimation = function(boardPlayer, callback, predefinedRoll) {
    const diceEl  = document.getElementById('diceDisplay');
    const resultEl = document.getElementById('diceResultText');
    const roll = (typeof predefinedRoll === 'number') ? predefinedRoll : (1 + Math.floor(Math.random() * 6));
    if (document.hidden) {
        if(diceEl) diceEl.textContent = RACE_DICE_EMOJIS[roll - 1];
        if(resultEl) resultEl.textContent = `${boardPlayer.name} đi ${roll} bước`;
        boardPlayer.lastRoll = roll;
        boardProcessTurn(boardPlayer, roll, callback);
        return;
    }
    let ticks = 0;
    const interval = setInterval(() => {
        if (document.hidden) {
            clearInterval(interval);
            if(diceEl) diceEl.textContent = RACE_DICE_EMOJIS[roll - 1];
            if(resultEl) resultEl.textContent = `${boardPlayer.name} đi ${roll} bước`;
            boardPlayer.lastRoll = roll;
            boardProcessTurn(boardPlayer, roll, callback);
            return;
        }
        diceEl.textContent = RACE_DICE_EMOJIS[Math.floor(Math.random()*6)];
        diceEl.style.animation = 'none'; diceEl.offsetHeight;
        diceEl.style.animation = 'diceRoll 0.5s ease';
        if(++ticks >= 6) {
            clearInterval(interval);
            diceEl.textContent = RACE_DICE_EMOJIS[roll - 1];
            resultEl.textContent = `${boardPlayer.name} đi ${roll} bước`;
            boardPlayer.lastRoll = roll;
            boardProcessTurn(boardPlayer, roll, callback);
        }
    }, 100);
};

// ── Logic đi lượt hoàn toàn mới ───────────────────────────────
window.boardProcessTurn = function(p, roll, callback) {
    if(p.eliminated) {
        if(callback) callback();
        return;
    }
    if(p.skipTurn) {
        p.skipTurn = false;
        window.boardPlayFx('sleep', p.pos, '💤');
        boardAddLog(`😴 ${p.name} mất lượt!`);
        window.boardShowBigNotice("😴 Ngủ gật", `${p.name} ngáp một cái, mất lượt.`, "", () => {
            if(callback) callback();
        });
        return;
    }

    // Tiến tới (không cần 6 để xuất chuồng)
    let steps = roll;
    if (p.pos + steps > BOARD_TOTAL_CELLS - 1) {
        steps = (BOARD_TOTAL_CELLS - 1) - p.pos; // Dừng ở đích
    }

    if (document.hidden) {
        // Chạy lập tức không trễ nếu tab đang bị ẩn
        if (!p.eliminated && steps > 0) {
            boardMovePlayer(p.idx, steps, false);
            boardAddLog(`🎲 ${p.name} đi ${steps} bước (tab ẩn).`);
        }
        
        let cellName = NEIGHBORHOOD_NAMES[p.pos % NEIGHBORHOOD_NAMES.length];
        
        const finalizeTurn = () => {
            const alive = boardGame.players.filter(x => !x.eliminated);
            if (alive.length === 1 && boardGame.players.length > 1) {
                boardGame.gameOver = true;
                let prize = 200 + (boardGame.betPool||0);
                boardAddLog(`🏆 ${alive[0].name} sống sót cuối cùng!`, 'win');
                if (alive[0].networkId === getMyNetworkId() || alive[0].isHuman) {
                    player.gold += prize;
                    boardRefreshHud();
                }
            }
            if (typeof window.boardSyncView === 'function') window.boardSyncView();
                else { boardRenderGrid(); boardRenderPlayers(); }
            if(callback) callback();
        };

        // PVP Check: Only Host calculates cell land rules on fasthidden finalize
        const isHost = !boardGame.pvp || boardGame.hostId === getMyNetworkId();
        if (!isHost) {
            finalizeTurn();
            return;
        }

        const handleWinOrCard = () => {
            if(p.pos >= BOARD_TOTAL_CELLS - 1) {
                boardGame.gameOver = true;
                let prize = boardGame.betPool || 0;
                if(p.networkId === getMyNetworkId() || p.isHuman) {
                    player.gold += (200 + prize);
                    boardRefreshHud();
                }
                boardAddLog(`🏆 ${p.name} cán đích đầu tiên!`, 'win');
                finalizeTurn();
            } else {
                if (p.pos >= 20 && typeof SHOP_ZONES !== 'undefined' && SHOP_ZONES.includes(cellName)) {
                    boardHandleShop(p, cellName, finalizeTurn);
                } else {
                    boardDrawRandomCard(p, cellName, finalizeTurn);
                }
            }
        };

        const handleCombat = () => {
            boardHandleCombat(p, () => {
                handleWinOrCard();
            });
        };

        if(boardGame.trappedCells[p.pos]) {
            delete boardGame.trappedCells[p.pos];
            boardAddLog(`💣 ${p.name} dẫm bẫy! Lùi 3 ô!`, 'special');
            boardMovePlayer(p.idx, -3, false);
            handleCombat();
        } else {
            handleCombat();
        }
        return;
    }

    let currentStep = 0;
    let moveInterval = setInterval(() => {
        if (document.hidden) {
            clearInterval(moveInterval);
            let remaining = steps - currentStep;
            if (remaining > 0 && !p.eliminated) {
                boardMovePlayer(p.idx, remaining, false);
            }
            let cellName = NEIGHBORHOOD_NAMES[p.pos % NEIGHBORHOOD_NAMES.length];
            const finalizeTurn = () => {
                const alive = boardGame.players.filter(x => !x.eliminated);
                if (alive.length === 1 && boardGame.players.length > 1) {
                    boardGame.gameOver = true;
                    let prize = 200 + (boardGame.betPool||0);
                    boardAddLog(`🏆 ${alive[0].name} sống sót cuối cùng!`, 'win');
                    if (alive[0].networkId === getMyNetworkId() || alive[0].isHuman) {
                        player.gold += prize;
                        boardRefreshHud();
                    }
                }
                if (typeof window.boardSyncView === 'function') window.boardSyncView();
                else { boardRenderGrid(); boardRenderPlayers(); }
                if(callback) callback();
            };
            
            // PVP Check: Only Host calculates cell land rules on hidden interval finalize
            const isHost = !boardGame.pvp || boardGame.hostId === getMyNetworkId();
            if (!isHost) {
                finalizeTurn();
                return;
            }

            const handleWinOrCard = () => {
                if(p.pos >= BOARD_TOTAL_CELLS - 1) {
                    boardGame.gameOver = true;
                    let prize = boardGame.betPool || 0;
                    if(p.networkId === getMyNetworkId() || p.isHuman) {
                        player.gold += (200 + prize);
                        boardRefreshHud();
                    }
                    boardAddLog(`🏆 ${p.name} cán đích đầu tiên!`, 'win');
                    finalizeTurn();
                } else {
                    if (p.pos >= 20 && typeof SHOP_ZONES !== 'undefined' && SHOP_ZONES.includes(cellName)) {
                        boardHandleShop(p, cellName, finalizeTurn);
                    } else {
                        boardDrawRandomCard(p, cellName, finalizeTurn);
                    }
                }
            };
            const handleCombat = () => {
                boardHandleCombat(p, () => {
                    handleWinOrCard();
                });
            };
            if(boardGame.trappedCells[p.pos]) {
                delete boardGame.trappedCells[p.pos];
                boardAddLog(`💣 ${p.name} dẫm bẫy! Lùi 3 ô!`, 'special');
                boardMovePlayer(p.idx, -3, false);
                handleCombat();
            } else {
                handleCombat();
            }
            return;
        }

        if(currentStep >= steps || p.eliminated) {
            clearInterval(moveInterval);
            
            setTimeout(() => {
                if(p.eliminated) {
                    if(callback) callback();
                    return;
                }

                // PVP Check: Only Host calculates cell land rules on normal interval finalize
                const isHost = !boardGame.pvp || boardGame.hostId === getMyNetworkId();
                if (!isHost) {
                    if (typeof window.boardSyncView === 'function') window.boardSyncView();
                else { boardRenderGrid(); boardRenderPlayers(); }
                    if(callback) callback();
                    return;
                }

                let cellName = NEIGHBORHOOD_NAMES[p.pos % NEIGHBORHOOD_NAMES.length];

                const finalizeTurn = () => {
                    const alive = boardGame.players.filter(x => !x.eliminated);
                    if(alive.length === 1 && boardGame.players.length > 1) {
                        boardGame.gameOver = true;
                        let prize = 200 + (boardGame.betPool||0);
                        boardAddLog(`🏆 ${alive[0].name} sống sót cuối cùng!`, 'win');
                        if(alive[0].networkId === getMyNetworkId() || alive[0].isHuman) {
                            player.gold += prize;
                            boardRefreshHud();
                        }
                        window.boardShowBigNotice("🏆 CHIẾN THẮNG", `${alive[0].name} sống sót cuối cùng!`, `Thưởng ${prize} 🪙 · chạm để tiếp tục`, () => {}, true);
                    }
                    if (typeof window.boardSyncView === 'function') window.boardSyncView();
                else { boardRenderGrid(); boardRenderPlayers(); }
                    if(callback) callback();
                };

                const handleWinOrCard = () => {
                    if(p.pos >= BOARD_TOTAL_CELLS - 1) {
                        boardGame.gameOver = true;
                        let prize = boardGame.betPool || 0;
                        if(p.networkId === getMyNetworkId() || p.isHuman) {
                            player.gold += (200 + prize);
                            boardRefreshHud();
                        }
                        boardAddLog(`🏆 ${p.name} cán đích đầu tiên!`, 'win');
                        window.boardShowBigNotice("🏆 CHIẾN THẮNG", `${p.name} cán đích! Cả xóm nhìn theo.`, `Thưởng ${200 + prize} 🪙 · chạm để tiếp tục`, finalizeTurn, true);
                        try { audio.play('levelup'); } catch(e){}
                    } else {
                        if (p.pos >= 20 && typeof SHOP_ZONES !== 'undefined' && SHOP_ZONES.includes(cellName)) {
                            boardHandleShop(p, cellName, finalizeTurn);
                        } else {
                            boardDrawRandomCard(p, cellName, finalizeTurn);
                        }
                    }
                };

                const handleCombat = () => {
                    boardHandleCombat(p, (combatLog) => {
                        if(combatLog) {
                            window.boardShowBigNotice("⚔️ ĐỤNG ĐỘ", combatLog, `Ở ${cellName}`, handleWinOrCard);
                        } else {
                            handleWinOrCard();
                        }
                    });
                };

                if(boardGame.trappedCells[p.pos]) {
                    delete boardGame.trappedCells[p.pos];
                    boardAddLog(`💣 ${p.name} dẫm bẫy! Lùi 3 ô!`, 'special');
                    boardMovePlayer(p.idx, -3, true);
                    window.boardShowBigNotice("💣 DẪM BẪY!", `${p.name} dẫm bẫy ở ${cellName}, lùi 3 ô.`, "", handleCombat);
                } else {
                    handleCombat();
                }

            }, 200);
            return;
        }

        boardMovePlayer(p.idx, 1, true);
        try { audio.play('click'); } catch(e){}
        currentStep++;
        
        if (currentStep === 1) {
            boardAddLog(`🎲 ${p.name} lăn được ${steps}.`);
        }
    }, 250);
};

// ── Logic đụng độ PvP hỗ trợ chiến thuật chọn lựa hoặc bỏ qua ─────
function boardHandleCombat(p, callback) {
    if (p.pos <= 0 || p.pos >= BOARD_TOTAL_CELLS - 1 || p.eliminated) {
        if(callback) callback(null);
        return;
    }
    
    // Tìm các đối thủ khác trên cùng ô
    let targets = boardGame.players.filter(other => other.idx !== p.idx && !other.eliminated && other.pos === p.pos);
    if (targets.length === 0) {
        if(callback) callback(null);
        return;
    }

    if (p.weapons <= 0) {
        let names = targets.map(t => t.name).join(', ');
        boardAddLog(`🤝 ${p.name} và ${names} đụng độ tại ô ${p.pos+1} nhưng không có vũ khí 🗡️ để chiến!`);
        if(callback) callback(`🤝 ${p.name} và ${names} đứng trố mắt lườm nguýt nhau (thiếu vũ khí).`);
        return;
    }

    // Có vũ khí!
    if (p.isHuman) {
        const modal = document.getElementById('boardPvpChoiceModal');
        const targetText = document.getElementById('pvpChoiceTargetText');
        const attackBtn = document.getElementById('pvpAttackBtn');
        const spareBtn = document.getElementById('pvpSpareBtn');
        
        if (modal && targetText && attackBtn && spareBtn) {
            let names = targets.map(t => t.name).join(', ');
            targetText.innerHTML = `Bạn vừa chạm trán <b>${names}</b>!<br>Bạn có muốn dùng 1 Vũ Khí 🗡️ để tấn công và trừ của đối phương 1 ❤️ không?`;
            
            modal.style.display = 'flex';
            
            attackBtn.onclick = () => {
                modal.style.display = 'none';
                try { audio.play('click'); } catch(e){}
                p.weapons--;
                let combatLog = "";
                targets.forEach(target => {
                    boardAddLog(`⚔️ QUYẾT ĐỊNH: ${p.name} quyết định tấn công ${target.name}!`, 'special');
                    let dmgLog = boardTakeDamage(target, 1, `bị ${p.name} tấn công`);
                    boardAddLog(dmgLog, 'special');
                    combatLog += `⚔️ Bạn đã dùng vũ khí chém ${target.name} (-1 ❤️)!<br>`;
                });
                if(callback) callback(combatLog);
            };
            
            spareBtn.onclick = () => {
                modal.style.display = 'none';
                try { audio.play('click'); } catch(e){}
                let names = targets.map(t => t.name).join(', ');
                boardAddLog(`🤝 BẢN LĨNH: ${p.name} quyết định tha mạng cho ${names}! Hai bên bắt tay hữu nghị.`, 'card');
                if(callback) callback(`🤝 Bạn chọn phương án hòa bình, bắt tay hữu nghị với ${names}!`);
            };
        } else {
            p.weapons--;
            let combatLog = "";
            targets.forEach(target => {
                let dmgLog = boardTakeDamage(target, 1, `bị ${p.name} tấn công`);
                combatLog += `⚔️ ${p.name} tấn công ${target.name} (-1 ❤️)!<br>`;
            });
            if(callback) callback(combatLog);
        }
    } else {
        // AI Bot: 70% tấn công, 30% tha mạng
        if (Math.random() < 0.70) {
            p.weapons--;
            let combatLog = "";
            targets.forEach(target => {
                boardAddLog(`⚔️ BOT TẤN CÔNG: ${p.name} dùng vũ khí tấn công ${target.name}!`, 'special');
                let dmgLog = boardTakeDamage(target, 1, `bị ${p.name} tấn công`);
                boardAddLog(dmgLog, 'special');
                combatLog += `⚔️ ${p.name} dùng vũ khí chém ${target.name} (-1 ❤️)!<br>`;
            });
            if(callback) callback(combatLog);
        } else {
            let names = targets.map(t => t.name).join(', ');
            boardAddLog(`🤝 BOT THA MẠNG: ${p.name} lựa chọn bỏ qua cho ${names}.`);
            if(callback) callback(`🤝 ${p.name} quyết định bỏ qua không tấn công ${names}.`);
        }
    }
}

// ── Overlay Thông Báo Sự Kiện ─────────────────────────────────
window._bigEventTimer = null;
window._bigEventCallback = null;

window.boardShowBigNoticeLocal = function(title, desc, extra = '', callback, persist = false) {
    const overlay = document.getElementById('bigEventOverlay');
    if(!overlay) {
        if(callback) callback();
        return;
    }
    try { if (window.audio) window.audio.play('hit'); } catch(e){}
    document.getElementById('bigEventTitle').textContent = title;
    document.getElementById('bigEventDesc').innerHTML = desc;
    document.getElementById('bigEventExtra').innerHTML = extra;
    overlay.style.display = 'flex';
    
    // Reset and apply animations via inline styles
    const titleEl = document.getElementById('bigEventTitle');
    const descEl = document.getElementById('bigEventDesc');
    const extraEl = document.getElementById('bigEventExtra');
    const btnEl = overlay.querySelector('button');

    if(titleEl) { titleEl.style.animation = 'none'; titleEl.offsetHeight; titleEl.style.animation = 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'; }
    if(descEl) { descEl.style.animation = 'none'; descEl.offsetHeight; descEl.style.animation = 'fadeIn 0.5s 0.2s forwards'; }
    if(extraEl) { extraEl.style.animation = 'none'; extraEl.offsetHeight; extraEl.style.animation = 'fadeIn 0.5s 0.4s forwards'; }
    if(btnEl) { btnEl.style.animation = 'none'; btnEl.offsetHeight; btnEl.style.animation = 'fadeIn 0.5s 0.6s forwards'; }
    
    if(window._bigEventTimer) clearTimeout(window._bigEventTimer);
    window._bigEventCallback = callback;
    
    if(!persist) {
        window._bigEventTimer = setTimeout(() => {
            window.closeBigEvent();
        }, 20000);
    }
};

window.boardShowBigNotice = function(title, desc, extra = '', callback, persist = false) {
    if (boardGame && boardGame.pvp && typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: 'BOARD_PVP_BIG_NOTICE',
            roomId: window.boardOnlineRoomId,
            id: getMyNetworkId(),
            title: title,
            desc: desc,
            extra: extra,
            persist: persist
        });
    }
    window.boardShowBigNoticeLocal(title, desc, extra, callback, persist);
};

window.closeBigEvent = function() {
    try { audio.play('click'); } catch(e){}
    const overlay = document.getElementById('bigEventOverlay');
    if(overlay) overlay.style.display = 'none';
    if(window._bigEventTimer) clearTimeout(window._bigEventTimer);
    if(window._bigEventCallback) {
        const cb = window._bigEventCallback;
        window._bigEventCallback = null;
        cb();
    }
};

// ── Di chuyển ─────────────────────────────────────────────────
window.boardMovePlayer = function(idx, steps, animate) {
    let p = boardGame.players[idx];
    if (!p || p.eliminated) return;
    if (steps > 0) {
        p.gold = (p.gold || 0) + (steps * 3);
        if (p.isHuman) {
            boardRefreshHud();
        }
    }
    const prevPos = p.pos;
    let next = p.pos + steps;
    p.pos = Math.max(0, Math.min(BOARD_TOTAL_CELLS - 1, next));
    boardGame.revealedCells[p.pos] = true; // ô chỉ lộ hình khi thật sự có người đi tới

    window.boardRefreshCell(prevPos);
    window.boardRefreshCell(p.pos);
    window.boardRenderPawns();
    window.boardRenderPlayers();
    window.boardUpdateCharPanel();
    if (animate) {
        window.boardHopPawn(idx);
        window._cameraFollowIdx = idx;
        window.boardFocusPawn(idx);
        if (steps > 1) window.boardPlayFx('forward', p.pos, `+${steps} ô`, { count: 10 });
        else if (steps > 0) window.boardPlayFx('forward', p.pos, '', { count: 3, ring: false, lift: 3 });
        else if (steps < 0) window.boardPlayFx('back', p.pos, `${steps} ô`, { count: 10 });
        if (steps >= 3) window.boardPlayFx('gold', p.pos, `+${steps * 3}🪙`, { count: 5, ring: false, z: -1 });
    }
};

// ── Bài trên tay (Hand Cards) — 5 lá có lợi ngẫu nhiên/người, dùng bất cứ lúc nào ──
function boardDealHand(count) {
    // Chỉ chia bài ma pháp vui nhộn (fun_spell), không có khiên kiếm mạng
    let pool = RACE_CARDS.filter(c => c.type === 'fun_spell');
    let hand = [];
    for (let i = 0; i < count; i++) {
        hand.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return hand;
}

window.boardOpenHandPanel = function() {
    let human = boardGame.players.find(p => p.isHuman);
    if (!human) return;
    document.querySelectorAll('.board-hand-modal').forEach(el => el.remove());

    let modal = document.createElement('div');
    modal.className = 'board-hand-modal';

    let box = document.createElement('div');
    box.className = 'board-hand-box';
    box.innerHTML = `<div class="hand-head"><span>🎴 Bài Trên Tay (${human.hand.length})</span><small>Dùng trước khi lắc xúc xắc</small></div>`;

    if (human.hand.length === 0) {
        let empty = document.createElement('div');
        empty.className = 'hand-empty';
        empty.textContent = 'Hết bài rồi. Tự thân vận động đi!';
        box.appendChild(empty);
    }

    const grid = document.createElement('div');
    grid.className = 'hand-grid';
    human.hand.forEach((card, i) => {
        let tile = document.createElement('button');
        tile.type = 'button';
        tile.className = `hand-card rarity-${card.rarity || 'common'}`;
        tile.innerHTML = `
            <span class="hand-card-art" style="background-image:url('${window.boardCardArtUrl(card)}')"></span>
            <span class="hand-card-top">${window.boardCardIcon(card)} ${_boardEsc(card.name)}</span>
            <span class="hand-card-desc">${_boardEsc(card.desc)}</span>
            <span class="hand-card-use">Dùng ngay</span>`;
        tile.onclick = () => {
            modal.remove();
            window.boardUseHandCard(human.idx, i);
        };
        grid.appendChild(tile);
    });
    box.appendChild(grid);

    let closeBtn = document.createElement('button');
    closeBtn.className = 'hand-close';
    closeBtn.textContent = 'Đóng';
    closeBtn.onclick = () => modal.remove();
    box.appendChild(closeBtn);

    modal.appendChild(box);
    document.body.appendChild(modal);
};

window.boardUseHandCard = function(playerIdx, handIndex) {
    let p = boardGame.players[playerIdx];
    if (!p || !p.hand || !p.hand[handIndex]) return;
    let card = p.hand[handIndex];
    p.hand.splice(handIndex, 1);

    // Look up original definition to restore functions lost in JSON serialization over network
    const origCard = RACE_CARDS.find(c => c.id === card.id) || card;
    if (typeof origCard.effect !== 'function') {
        console.error('Card effect function not found for card:', card);
        return;
    }

    const applied = boardRunCardEffect(origCard, p);
    const result = applied.result;
    if (!applied.fx) boardPlayCardEventFx(origCard, p, result);
    boardAddLog(`🎴 ${p.name} dùng [${card.name}]: ${result}`, 'card');

    window.boardShowBigNotice(`${window.boardCardIcon(origCard)} ${card.name}`, window.boardCardNoticeBody(origCard, ''), `👉 ${result}`, () => {
        if (!boardGame || boardGame.closed) return;
        if (typeof window.boardSyncView === 'function') window.boardSyncView();
        else { boardRenderGrid(); boardRenderPlayers(); }
    });
};


// ── Hàm phụ trợ tính tọa độ vòng quanh ──────────────────────────
// Preview icon shown on each track cell before anyone lands on it — purely
// flavor/telegraphing for what kind of card tends to drop there (the actual
// draw still goes through boardDrawRandomCard's rarity roll across all types).
const BOARD_EVENT_ICON_CYCLE = ['🎁', '👾', '💰', '🎲', '⚔️', '🌀', '☠️', '🏥', '🛡️', '🗡️'];

function boardPlayerTokenSVG(playerOrColor, size) {
    size = size || 28;
    let color = '#ff4444';
    let skin = 'trau';
    if (playerOrColor && typeof playerOrColor === 'object') {
        color = playerOrColor.color || color;
        if (playerOrColor.idx === 0) skin = 'trau';
        else if (playerOrColor.idx === 1) skin = 'mam';
        else if (playerOrColor.idx === 2) skin = 'kien';
        else if (playerOrColor.idx === 3) skin = 'ut';
    } else if (typeof playerOrColor === 'string') {
        color = playerOrColor;
        if (color === '#ff4444' || color === '#ef4444') skin = 'trau';
        else if (color === '#e084fc') skin = 'mam';
        else if (color === '#22c55e') skin = 'kien';
        else if (color === '#3b82f6') skin = 'ut';
    }

    let accessorySVG = '';
    let hairSVG = '';
    let eyesSVG = `<circle cx="16" cy="18" r="1.8" fill="#1c1a26"/><circle cx="24" cy="18" r="1.8" fill="#1c1a26"/>`;
    let mouthSVG = `<path d="M17,22 Q20,24 23,22" stroke="#1c1a26" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    let cheekSVG = '';

    if (skin === 'trau') {
        // Trâu Trẻ Trâu: Messy black hair, red headband, cheeks bandaid
        hairSVG = `
            <path d="M10,14 L12,6 L15,10 L18,4 L22,9 L25,4 L29,8 L31,14" fill="#2d1a0c" stroke="#1c1a26" stroke-width="1.2"/>
            <path d="M8,12 Q20,8 32,12" stroke="#1c1a26" stroke-width="3" fill="none"/>
        `;
        accessorySVG = `
            <path d="M9,13 L31,13 L30,16 L10,16 Z" fill="#ef4444" stroke="#1c1a26" stroke-width="1"/>
            <rect x="13" y="19" width="4" height="2" transform="rotate(15 13 19)" fill="#fff" stroke="#1c1a26" stroke-width="0.8"/>
        `;
    } else if (skin === 'mam') {
        // Mầm Mềm Mẽ: Cute girl brown hair, pink blushing cheeks, green sprout hairclip
        hairSVG = `
            <path d="M9,15 C9,5 31,5 31,15 L32,22 C32,25 30,26 30,26 L10,26 C10,26 8,25 8,22 Z" fill="#78350f" stroke="#1c1a26" stroke-width="1.2"/>
            <path d="M14,14 C17,14 18,12 20,15 C22,12 23,14 26,14" stroke="#1c1a26" stroke-width="1.2" fill="none"/>
        `;
        accessorySVG = `
            <!-- Sprout clip -->
            <path d="M24,7 Q21,3 24,0 Q27,3 24,7" fill="none" stroke="#22c55e" stroke-width="2"/>
            <path d="M24,2 Q19,-1 21,1 Z M24,2 Q29,-1 27,1 Z" fill="#22c55e" stroke="#1c1a26" stroke-width="0.5"/>
        `;
        cheekSVG = `
            <ellipse cx="13" cy="20" rx="2.5" ry="1.2" fill="#f43f5e" opacity="0.6"/>
            <ellipse cx="27" cy="20" rx="2.5" ry="1.2" fill="#f43f5e" opacity="0.6"/>
        `;
        mouthSVG = `<path d="M19,21 Q20,23 21,21" stroke="#1c1a26" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    } else if (skin === 'kien') {
        // Kiến Bảo Vệ: Green security guard hat, determined cool sunglasses
        hairSVG = `
            <path d="M11,14 L29,14 L29,16 L11,16 Z" fill="#1e293b"/>
        `;
        accessorySVG = `
            <!-- Guard Hat -->
            <path d="M12,12 L28,12 L26,6 L14,6 Z" fill="#166534" stroke="#1c1a26" stroke-width="1.2"/>
            <path d="M10,12 Q20,15 30,12" stroke="#1c1a26" stroke-width="2" fill="none"/>
            <polygon points="20,7 22,10 20,12 18,10" fill="#fbbf24" stroke="#1c1a26" stroke-width="0.6"/>
        `;
        eyesSVG = `
            <!-- Sunglasses -->
            <path d="M12,17 L17,17 L19,19 L14,19 Z M21,19 L23,17 L28,17 L26,19 Z" fill="#0f172a" stroke="#1c1a26" stroke-width="1"/>
            <line x1="17" y1="17" x2="23" y2="17" stroke="#1c1a26" stroke-width="1.5"/>
        `;
        mouthSVG = `<line x1="18" y1="23" x2="22" y2="23" stroke="#1c1a26" stroke-width="1.5" stroke-linecap="round"/>`;
    } else if (skin === 'ut') {
        // Út Mũ Rơm: Large Straw hat (Mũ Rơm), mischievous smile, straw in mouth
        hairSVG = `
            <path d="M10,14 L12,10 L28,10 L30,14" stroke="#1c1a26" stroke-width="1" fill="#1e293b"/>
        `;
        accessorySVG = `
            <!-- Straw Hat -->
            <ellipse cx="20" cy="10" rx="16" ry="3.5" fill="#ca8a04" stroke="#1c1a26" stroke-width="1.2"/>
            <path d="M11,10 C11,4 29,4 29,10 Z" fill="#ca8a04" stroke="#1c1a26" stroke-width="1.2"/>
            <path d="M11,9.5 Q20,7.5 29,9.5 L29,10 L11,10 Z" fill="#ef4444"/>
        `;
        mouthSVG = `
            <path d="M16,21 Q20,24 24,20" stroke="#1c1a26" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <line x1="23" y1="21" x2="27" y2="18" stroke="#ca8a04" stroke-width="1.5" stroke-linecap="round"/>
        `;
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="display:block; overflow:visible;">
        <!-- Shadow -->
        <ellipse cx="20" cy="36" rx="9" ry="2.5" fill="rgba(0,0,0,0.3)"/>
        
        <!-- Body -->
        <path d="M13,35 L15,25 L25,25 L25,35 Z" fill="${color}" stroke="#1c1a26" stroke-width="1.3" stroke-linejoin="round"/>
        <!-- Collar/Neck -->
        <polygon points="17,25 20,28 23,25" fill="#ffe0bd" stroke="#1c1a26" stroke-width="1.2"/>

        <!-- Face Base -->
        <circle cx="20" cy="18" r="10" fill="#ffe0bd" stroke="#1c1a26" stroke-width="1.3"/>

        <!-- Hair Layer -->
        ${hairSVG}

        <!-- Face Details -->
        ${eyesSVG}
        ${cheekSVG}
        ${mouthSVG}

        <!-- Accessory (Hats/Headbands) -->
        ${accessorySVG}
    </svg>`;
}

// ── Vẽ ô chức năng hoặc hình vẽ cho ô cờ ─────────────────────
const BOARD_ZONE_ART = {
    house: `<svg viewBox="0 0 40 40" width="26" height="26"><polygon points="6,20 20,8 34,20" fill="#c9663a"/><rect x="10" y="20" width="20" height="14" fill="#e8c48a"/><rect x="17" y="25" width="6" height="9" fill="#7a5230"/></svg>`,
    market: `<svg viewBox="0 0 40 40" width="26" height="26"><rect x="6" y="16" width="28" height="4" fill="#ff9eb5"/><polygon points="6,16 34,16 30,8 10,8" fill="#e8c48a"/><rect x="10" y="20" width="20" height="12" fill="#4d4566"/></svg>`,
    net: `<svg viewBox="0 0 40 40" width="26" height="26"><rect x="6" y="12" width="28" height="18" rx="3" fill="#2c2840" stroke="#ff9eb5" stroke-width="1.5"/><rect x="10" y="16" width="20" height="8" fill="#ff9eb5" opacity="0.7"/></svg>`,
    field: `<svg viewBox="0 0 40 40" width="26" height="26"><rect x="4" y="24" width="32" height="10" fill="#d8e878"/><path d="M10,24 L10,14 M16,24 L16,12 M22,24 L22,14 M28,24 L28,12" stroke="#8fbf5a" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    farm: `<svg viewBox="0 0 40 40" width="26" height="26"><ellipse cx="20" cy="26" rx="14" ry="8" fill="#f5e2ab"/><circle cx="14" cy="22" r="5" fill="#fff"/><circle cx="26" cy="24" r="4" fill="#7fcbe0"/></svg>`,
    alley: `<svg viewBox="0 0 40 40" width="26" height="26"><rect x="4" y="4" width="32" height="32" fill="#4d4566"/><path d="M8,32 L18,20 L14,10 L30,8" stroke="#9c9c9c" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="18" cy="20" r="2.5" fill="#fbbf24"/></svg>`,
    guard: `<svg viewBox="0 0 40 40" width="26" height="26"><rect x="10" y="14" width="18" height="16" fill="#8ab6f0"/><polygon points="10,14 19,6 28,14" fill="#5a6fa0"/><rect x="4" y="26" width="30" height="3" fill="#e2c391"/></svg>`,
    tree: `<svg viewBox="0 0 40 40" width="26" height="26"><rect x="17" y="24" width="6" height="10" fill="#7a5230"/><circle cx="20" cy="16" r="13" fill="#5a9c4a"/><circle cx="13" cy="20" r="8" fill="#6cae5a"/><circle cx="27" cy="20" r="8" fill="#6cae5a"/></svg>`,
    river: `<svg viewBox="0 0 40 40" width="26" height="26"><rect width="40" height="40" fill="#5bb0d4"/><path d="M2,14 Q10,10 18,14 T34,14" stroke="#a9e0ef" stroke-width="3" fill="none"/><path d="M2,26 Q10,22 18,26 T34,26" stroke="#a9e0ef" stroke-width="3" fill="none"/></svg>`,
    grave: `<svg viewBox="0 0 40 40" width="26" height="26"><rect width="40" height="40" fill="#8f957f"/><rect x="12" y="14" width="8" height="14" rx="3" fill="#e8e8e0"/><rect x="22" y="18" width="8" height="10" rx="3" fill="#e8e8e0"/></svg>`,
    bamboo: `<svg viewBox="0 0 40 40" width="26" height="26"><rect width="40" height="40" fill="#bfe89a"/><rect x="10" y="4" width="5" height="32" fill="#5a9c4a"/><rect x="22" y="8" width="5" height="28" fill="#6cae5a"/><rect x="30" y="14" width="4" height="22" fill="#5a9c4a"/></svg>`,
    stadium: `<svg viewBox="0 0 40 40" width="26" height="26"><rect width="40" height="40" fill="#7bd9a8"/><circle cx="20" cy="20" r="6" fill="#fff"/><rect x="4" y="8" width="4" height="20" fill="none" stroke="#fff" stroke-width="2"/><rect x="32" y="8" width="4" height="20" fill="none" stroke="#fff" stroke-width="2"/></svg>`,
    plaza: `<svg viewBox="0 0 40 40" width="26" height="26"><circle cx="20" cy="24" r="4" fill="#8a8a8a"/><circle cx="12" cy="18" r="9" fill="#5a9c4a"/><rect x="10" y="26" width="4" height="8" fill="#7a5230"/></svg>`
};
function boardGetZoneArtKey(zoneName) {
    const map = {
        'Nhà Hòa':'house','Nhà Mắm':'house','Nhà Ba Tý':'house','Nhà Út':'house','Nhà Trưởng Thôn':'house',
        'Chợ Xóm':'market','Quán Bún':'market','Tạp Hóa':'market','Tiệm Thuốc':'market','Quán Nước':'market','Bãi Gửi Xe':'market',
        'Quán Net Thu Thảo':'net',
        'Ruộng Lúa':'field','Ruộng Rau':'field','Bù Nhìn':'field','Máy Cày':'field',
        'Chuồng Gà':'farm','Chuồng Vịt':'farm','Ao Cá':'farm','Chuồng Heo':'farm',
        'Hẻm Tẹt':'alley',
        'Chốt Bảo Vệ Kiên':'guard',
        'Gốc Đa Làng':'tree','Miếu Nhỏ':'tree',
        'Bờ Sông':'river','Cầu Gỗ':'river','Bến Đò':'river',
        'Nghĩa Địa Cũ':'grave','Mộ Cổ':'grave',
        'Đồi Tre':'bamboo','Đường Mòn Tre':'bamboo',
        'Sân Đá Bóng':'stadium',
        'Quảng Trường Xóm Làng':'plaza','Cây Đa Cổ Thụ':'tree','Giếng Nước':'plaza','Sân Đình':'house',
        'Cột Điện':'alley','Bãi Rác Nấm':'alley','Quán Nhậu Huy':'market'
    };
    return map[zoneName] || 'house';
}
function boardGetZoneArtSVG(zoneName) {
    return BOARD_ZONE_ART[boardGetZoneArtKey(zoneName)] || '';
}

// Màu nền từng ô theo đúng 12 khu vực trong bản concept art (khu nhà dân = đất nện,
// chợ = lát đá, ruộng = xanh lúa, bờ sông = xanh nước, nghĩa địa = xám rêu...).
const BOARD_ZONE_COLORS = {
    'Nhà Hòa': '#c9a15f22', 'Nhà Mắm': '#c9a15f22', 'Nhà Ba Tý': '#c9a15f22', 'Nhà Út': '#c9a15f22', 'Nhà Trưởng Thôn': '#c9a15f33',
    'Chợ Xóm': '#b9b2a633', 'Quán Bún': '#b9b2a633', 'Tạp Hóa': '#b9b2a633', 'Tiệm Thuốc': '#b9b2a633', 'Quán Nước': '#b9b2a633', 'Bãi Gửi Xe': '#b9b2a633',
    'Quán Net Thu Thảo': '#ff9eb533',
    'Ruộng Lúa': '#d8e87833', 'Ruộng Rau': '#d8e87833', 'Bù Nhìn': '#d8e87833', 'Máy Cày': '#d8e87833',
    'Chuồng Gà': '#f5e2ab33', 'Chuồng Vịt': '#f5e2ab33', 'Ao Cá': '#7fcbe033', 'Chuồng Heo': '#f5e2ab33',
    'Hẻm Tẹt': '#4d456655',
    'Chốt Bảo Vệ Kiên': '#8ab6f033',
    'Gốc Đa Làng': '#5a9c4a33', 'Miếu Nhỏ': '#5a9c4a33',
    'Bờ Sông': '#5bb0d444', 'Cầu Gỗ': '#a9784a44', 'Bến Đò': '#5bb0d444',
    'Nghĩa Địa Cũ': '#b9c4a344', 'Mộ Cổ': '#b9c4a344',
    'Đồi Tre': '#b9e59c44', 'Đường Mòn Tre': '#b9e59c44',
    'Sân Đá Bóng': '#7bd9a844',
    'Quảng Trường Xóm Làng': '#ffb3c633', 'Cây Đa Cổ Thụ': '#5a9c4a33', 'Giếng Nước': '#8a8a8a33', 'Sân Đình': '#e8c48a33',
    'Cột Điện': '#00000022', 'Bãi Rác Nấm': '#6b7a3a33', 'Quán Nhậu Huy': '#c9663a33'
};
function boardGetZoneColor(zoneName) {
    return BOARD_ZONE_COLORS[zoneName] || 'rgba(255,255,255,0.04)';
}
function boardGetCellEventIcon(i) {
    if (i % 4 === 0) return ''; // leave every 4th cell plain so the track doesn't feel too busy
    return BOARD_EVENT_ICON_CYCLE[i % BOARD_EVENT_ICON_CYCLE.length];
}

// Grid size for the spiral track (matches the concept art: a wide loop that
// winds inward around the central Quảng Trường Xóm Làng).
const BOARD_GRID_COLS = 15;
const BOARD_GRID_ROWS = 11;

// Generates a clockwise inward spiral over a ROWS x COLS grid (1-indexed
// r/c, matching CSS grid-row/grid-column). Cached once since it's static.
let _boardSpiralCache = null;
function _generateBoardSpiral(rows, cols) {
    let positions = [];
    let top = 1, bottom = rows, left = 1, right = cols;
    while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c++) positions.push({ r: top, c });
        top++;
        for (let r = top; r <= bottom; r++) positions.push({ r, c: right });
        right--;
        if (top <= bottom) {
            for (let c = right; c >= left; c--) positions.push({ r: bottom, c });
            bottom--;
        }
        if (left <= right) {
            for (let r = bottom; r >= top; r--) positions.push({ r, c: left });
            left++;
        }
    }
    return positions;
}
function _getCellPos(i) {
    if (!_boardSpiralCache) _boardSpiralCache = _generateBoardSpiral(BOARD_GRID_ROWS, BOARD_GRID_COLS);
    return _boardSpiralCache[i] || { r: 1, c: 1 };
}

const BOARD_MAP_W = 1024;
const BOARD_MAP_H = 782;

function _getCellPixelPos(i) {
    if (typeof BOARD_CUSTOM_COORDS !== 'undefined' && BOARD_CUSTOM_COORDS[i]) {
        let coord = BOARD_CUSTOM_COORDS[i];
        return {
            x: (coord.x / 100) * BOARD_MAP_W,
            y: (coord.y / 100) * BOARD_MAP_H
        };
    }
    let pos = _getCellPos(i);
    const BOARD_CELL_PX = 54;
    return { x: (pos.c - 0.5) * BOARD_CELL_PX, y: (pos.r - 0.5) * BOARD_CELL_PX };
}

// Catmull-Rom → Bezier: biến chuỗi điểm góc vuông của xoắn ốc thành 1 đường
// cong mềm mại thật sự (đúng yêu cầu "ngoằn ngoèo" thay vì lưới ô vuông).
function _catmullRomToBezierPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x},${points[0].y} `;
    for (let i = 0; i < points.length - 1; i++) {
        let p0 = points[i - 1] || points[i];
        let p1 = points[i];
        let p2 = points[i + 1];
        let p3 = points[i + 2] || p2;
        let c1x = p1.x + (p2.x - p0.x) / 6;
        let c1y = p1.y + (p2.y - p0.y) / 6;
        let c2x = p2.x - (p3.x - p1.x) / 6;
        let c2y = p2.y - (p3.y - p1.y) / 6;
        d += `C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y} `;
    }
    return d;
}
let _boardSmoothPathCache = null;
function _getBoardSmoothPath() {
    if (_boardSmoothPathCache) return _boardSmoothPathCache;
    let points = [];
    for (let i = 0; i < BOARD_TOTAL_CELLS; i++) points.push(_getCellPixelPos(i));
    _boardSmoothPathCache = _catmullRomToBezierPath(points);
    return _boardSmoothPathCache;
}

// ── Render Track ──────────────────────────────────────────────
const BOARD_CELL_SIZE = 42;

function _boardEsc(text) {
    return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function boardCellType(i) {
    return i === 0 ? 'start' : i === BOARD_TOTAL_CELLS - 1 ? 'finish' : '';
}
function boardCellZone(i) {
    return (boardGame && boardGame.cellZones && boardGame.cellZones[i]) || NEIGHBORHOOD_NAMES[i % NEIGHBORHOOD_NAMES.length];
}
function boardCellArt(i, revealed, type, trapped) {
    if (!revealed) return '<span class="cell-q">?</span>';
    if (type === 'start') {
        return `<svg viewBox="0 0 40 40" width="22" height="22"><rect x="7" y="8" width="3" height="26" rx="1" fill="#3a2a14"/><path d="M10,8 L33,12 L10,22 Z" fill="#ef5b3f" stroke="#7a2216" stroke-width="1.4"/><circle cx="18" cy="14" r="2" fill="#ffe6a8"/></svg>`;
    }
    if (type === 'finish') {
        return `<svg viewBox="0 0 40 40" width="22" height="22"><path d="M11,6 L11,35" stroke="#4a3216" stroke-width="3.5" stroke-linecap="round"/><path d="M13,7 L33,12 L13,17 Z" fill="#3fbf74" stroke="#1c6d42" stroke-width="1.3"/><path d="M13,20 L28,24 L13,28 Z" fill="#f5c451" stroke="#8f6512" stroke-width="1.3"/></svg>`;
    }
    if (trapped) {
        return `<svg viewBox="0 0 40 40" width="21" height="21"><circle cx="20" cy="22" r="12" fill="#2a1a14" stroke="#0d0906" stroke-width="2"/><path d="M24,11 Q31,7 29,3" fill="none" stroke="#c98b45" stroke-width="2"/><circle cx="29" cy="4" r="2.4" fill="#ffb74d"><animate attributeName="opacity" values="1;.25;1" dur="1s" repeatCount="indefinite"/></circle><path d="M20,15 L20,25 M20,29 L20,30" stroke="#fff3cf" stroke-width="3" stroke-linecap="round"/></svg>`;
    }
    return boardGetZoneArtSVG(boardCellZone(i));
}
function boardCellBackground(i, revealed, type, trapped) {
    if (!revealed) return 'linear-gradient(155deg,#4d616e 0%,#1d2c36 100%)';
    if (type === 'start') return 'radial-gradient(circle at 32% 24%,#fff2bd 0%,#e0a94a 55%,#a8702c 100%)';
    if (type === 'finish') return 'radial-gradient(circle at 32% 24%,#dcffe9 0%,#4ec07d 55%,#1f7c4c 100%)';
    if (trapped) return 'radial-gradient(circle at 32% 24%,#ffb39a 0%,#d2543f 55%,#8f2622 100%)';
    const tint = boardGetZoneColor(boardCellZone(i));
    return `radial-gradient(circle at 32% 24%, ${tint} 0%, rgba(20,46,55,.96) 68%, rgba(11,30,38,1) 100%)`;
}
function _paintCell(div, i) {
    const type = boardCellType(i);
    const zoneName = boardCellZone(i);
    const revealed = !!boardGame.revealedCells[i];
    const trapped = !!boardGame.trappedCells[i];
    div.className = 'board-cell' + (type ? ' ' + type : '') + (revealed ? ' revealed' : ' hidden-cell');
    div.title = revealed ? zoneName : 'Ô bí ẩn — đi tới để mở';
    div.style.setProperty('background', boardCellBackground(i, revealed, type, trapped), 'important');
    div.innerHTML = `<span class="cell-num-center">${i + 1}</span>` +
        `<span class="cell-badge">${boardCellArt(i, revealed, type, trapped)}</span>` +
        `<span class="cell-zone">${_boardEsc(zoneName)}</span>`;
}

window.boardRenderGrid = function() {
    if (!boardGame) return;
    const grid = document.getElementById('boardGrid');
    if (!grid) return;

    grid.classList.add('board-map-viewport');
    grid.innerHTML = '';
    grid.style.cssText = 'position:relative;width:100%;height:100%;overflow:auto;display:block;';

    const shell = document.createElement('div');
    shell.className = 'board-map-shell';

    const canvas = document.createElement('div');
    canvas.className = 'board-canvas';
    canvas.style.width = BOARD_MAP_W + 'px';
    canvas.style.height = BOARD_MAP_H + 'px';

    // Dirt road following the village track.
    const roadSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    roadSvg.setAttribute('viewBox', `0 0 ${BOARD_MAP_W} ${BOARD_MAP_H}`);
    roadSvg.setAttribute('width', BOARD_MAP_W);
    roadSvg.setAttribute('height', BOARD_MAP_H);
    roadSvg.setAttribute('class', 'board-road-svg');
    roadSvg.innerHTML = `
        <path d="${_getBoardSmoothPath()}" fill="none" stroke="#2a3a24" stroke-width="64" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
        <path d="${_getBoardSmoothPath()}" fill="none" stroke="#5c4227" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
        <path d="${_getBoardSmoothPath()}" fill="none" stroke="#9a7046" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${_getBoardSmoothPath()}" fill="none" stroke="#e6c795" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 20" opacity="0.6"/>
    `;
    canvas.appendChild(roadSvg);

    // Village location signs.
    const locations = [
        { name: "🌾 Khu Ruộng", x: 25, y: 78 },
        { name: "🛍️ Khu Chợ", x: 82, y: 60 },
        { name: "🎮 Quán Net", x: 80, y: 20 },
        { name: "🏠 Khu Nhà Dân", x: 30, y: 6 },
        { name: "🪦 Nghĩa Địa Cũ", x: 16, y: 30 },
        { name: "⚽ Sân Đá Bóng", x: 20, y: 48 },
        { name: "🎋 Đồi Tre", x: 48, y: 22 },
        { name: "🌊 Bờ Sông", x: 75, y: 50 },
        { name: "🚪 Hẻm Tẹt", x: 34, y: 54 },
        { name: "👮 Chốt Bảo Vệ", x: 48, y: 64 },
        { name: "🌳 Gốc Đa Làng", x: 50, y: 36 }
    ];
    locations.forEach(loc => {
        const tag = document.createElement('div');
        tag.className = 'board-location-tag';
        tag.style.left = `${(loc.x / 100) * BOARD_MAP_W}px`;
        tag.style.top = `${(loc.y / 100) * BOARD_MAP_H}px`;
        tag.textContent = loc.name;
        canvas.appendChild(tag);
    });

    for (let i = 0; i < BOARD_TOTAL_CELLS; i++) {
        const px = _getCellPixelPos(i);
        const div = document.createElement('div');
        div.id = `bcell_${i}`;
        _paintCell(div, i);
        div.style.cssText += `position:absolute;left:${px.x - BOARD_CELL_SIZE / 2}px;top:${px.y - BOARD_CELL_SIZE / 2}px;width:${BOARD_CELL_SIZE}px;height:${BOARD_CELL_SIZE}px;`;
        canvas.appendChild(div);
    }

    const pawnLayer = document.createElement('div');
    pawnLayer.className = 'board-pawn-layer';
    pawnLayer.id = 'boardPawnLayer';
    canvas.appendChild(pawnLayer);

    // Hiệu ứng bám đúng hệ toạ độ của canvas nên luôn nổ đúng ô.
    const fxLayer = document.createElement('div');
    fxLayer.className = 'board-fx-layer';
    fxLayer.id = 'boardFxLayer';
    canvas.appendChild(fxLayer);

    shell.appendChild(canvas);
    grid.appendChild(shell);

    if (typeof window.boardInitCameraDrag === 'function') window.boardInitCameraDrag();
    if (typeof window.boardStartCameraLoop === 'function') window.boardStartCameraLoop();

    window.boardFitViewport();
    window.boardRenderPawns(true);

    const idx = boardGame.currentTurn || 0;
    window._cameraFollowIdx = idx;
    window._cameraCurrentX = null;
    window._cameraCurrentY = null;
    window.boardScrollToCurrentPlayer(idx);

    // Snap to the active pawn on first paint so the board does not fly in from a corner.
    grid.scrollLeft = window._cameraTargetX || 0;
    grid.scrollTop = window._cameraTargetY || 0;
    window._cameraCurrentX = grid.scrollLeft;
    window._cameraCurrentY = grid.scrollTop;
};

window.boardFitViewport = function() {
    const grid = document.getElementById('boardGrid');
    if (!grid) return;
    const shell = grid.querySelector('.board-map-shell');
    const canvas = grid.querySelector('.board-canvas');
    if (!shell || !canvas) return;
    const w = grid.clientWidth || 900;
    const h = grid.clientHeight || 600;
    // Keep the map large enough to read on phones; camera-follow handles the rest.
    const zoom = Math.max(0.62, Math.min(1.22, (w - 28) / BOARD_MAP_W));
    canvas.style.zoom = String(zoom);
    // A slim frame only: the camera centres pawns while there is room to scroll and
    // otherwise lets the map edge sit at the frame, so no empty strip ever shows.
    const padX = 24;
    const padY = Math.max(64, Math.min(220, Math.round(h * 0.18)));
    shell.style.padding = `${padY}px ${padX}px`;
    window._boardZoom = zoom;
    window._boardPadX = padX;
    window._boardPadY = padY;
};

// ── Quân cờ: chân dung SVG vẽ tay, sắc nét ở mọi mức zoom ────
const BOARD_PAWN_LOOKS = {
    trau: { skin: '#ffd3a1', shade: '#e8ac72', hair: '#2b1b12', shirt: '#d94b3d', rim: '#ff6b5a' },
    mam: { skin: '#ffe0bd', shade: '#f0b98c', hair: '#3c2143', shirt: '#b06ab8', rim: '#e084fc' },
    kien: { skin: '#f7cf9e', shade: '#ddaa72', hair: '#1e2a1c', shirt: '#1f6b3a', rim: '#22c55e' },
    ut: { skin: '#ffd7a8', shade: '#eab378', hair: '#2b1b12', shirt: '#3b82f6', rim: '#60a5fa' }
};

function boardPawnHair(id, c) {
    if (id === 'mam') return `
        <path d="M25,44 Q21,16 48,12 Q75,16 71,44 L76,70 Q68,60 65,45 Q48,28 31,45 Q28,60 20,70 Z" fill="${c.hair}" stroke="#201827" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M33,20 Q48,13 63,20" stroke="#ffffff" stroke-opacity=".22" stroke-width="3" fill="none" stroke-linecap="round"/>
        <g transform="translate(70,22) rotate(18)">
            <circle cx="0" cy="0" r="3.4" fill="#ff9ecb"/>
            <circle cx="6" cy="2" r="3.4" fill="#ffb3d9"/>
            <circle cx="3" cy="7" r="3.4" fill="#ff9ecb"/>
            <circle cx="2.6" cy="3" r="1.8" fill="#ffe36b"/>
        </g>`;
    if (id === 'kien') return `
        <path d="M27,34 Q28,13 48,13 Q68,13 69,34 Z" fill="#2f8f4e" stroke="#201827" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M25,33 Q48,26 71,33 L71,38 Q48,32 25,38 Z" fill="#1f6b3a" stroke="#201827" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="48" cy="24" r="4.6" fill="#ffe36b" stroke="#201827" stroke-width="1.8"/>
        <path d="M48,23 l1.6,3 l3.4,.3 l-2.6,2.2 l.8,3.3 l-3.2,-1.8 l-3.2,1.8 l.8,-3.3 l-2.6,-2.2 l3.4,-.3 Z" fill="#c9831f"/>
        <path d="M32,15 L27,5 M64,15 L69,5" stroke="#201827" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="27" cy="4.5" r="2.6" fill="#22c55e" stroke="#201827" stroke-width="1.4"/>
        <circle cx="69" cy="4.5" r="2.6" fill="#22c55e" stroke="#201827" stroke-width="1.4"/>`;
    if (id === 'ut') return `
        <path d="M16,33 L48,8 L80,33 Z" fill="#e7c777" stroke="#201827" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M30,25 Q48,19 66,25 L66,31 Q48,25 30,31 Z" fill="#d94b3d" stroke="#201827" stroke-width="2"/>
        <path d="M16,33 Q48,27 80,33 Q48,39 16,33 Z" fill="#d8b061" stroke="#201827" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M38,13 L44,6 M52,12 L54,4" stroke="#a8853c" stroke-width="1.8" stroke-linecap="round"/>`;
    return `
        <path d="M27,40 L21,18 L33,28 L32,10 L42,27 L48,8 L55,27 L65,10 L63,28 L75,18 L69,40 Q48,26 27,40 Z" fill="${c.hair}" stroke="#201827" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M28,32 Q48,24 68,32 L68,38 Q48,30 28,38 Z" fill="#d94b3d" stroke="#201827" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M68,33 L79,27 L76,38 Z" fill="#d94b3d" stroke="#201827" stroke-width="2" stroke-linejoin="round"/>`;
}

function boardPawnFace(id) {
    if (id === 'trau') return `
        <path d="M36,41 Q40,38 44,41" stroke="#201827" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M52,41 Q56,38 60,41" stroke="#201827" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <circle cx="40" cy="45" r="2.6" fill="#201827"/><circle cx="56" cy="45" r="2.6" fill="#201827"/>
        <path d="M38,53 Q48,61 58,52" stroke="#201827" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M44,55 l3,2 l3,-2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M59,50 l7,3" stroke="#e8c48a" stroke-width="2.6" stroke-linecap="round"/>
        <rect x="28" y="49" width="8" height="4" rx="1.6" fill="#ffd9a8" stroke="#201827" stroke-width="1.6" transform="rotate(-18 32 51)"/>`;
    if (id === 'mam') return `
        <ellipse cx="40" cy="45" rx="5.4" ry="6.2" fill="#fff" stroke="#201827" stroke-width="1.6"/>
        <ellipse cx="56" cy="45" rx="5.4" ry="6.2" fill="#fff" stroke="#201827" stroke-width="1.6"/>
        <circle cx="40.6" cy="46" r="3" fill="#3a2440"/><circle cx="56.6" cy="46" r="3" fill="#3a2440"/>
        <circle cx="42" cy="44" r="1.1" fill="#fff"/><circle cx="58" cy="44" r="1.1" fill="#fff"/>
        <path d="M36,38 Q40,35 44,38" stroke="#3a2440" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M52,38 Q56,35 60,38" stroke="#3a2440" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M44,55 Q48,58 52,55" stroke="#c0392b" stroke-width="2.2" fill="#e86a6a" stroke-linejoin="round"/>
        <ellipse cx="33" cy="51" rx="3.4" ry="2" fill="#ff8fa3" opacity=".5"/>
        <ellipse cx="63" cy="51" rx="3.4" ry="2" fill="#ff8fa3" opacity=".5"/>`;
    if (id === 'kien') return `
        <path d="M35,40 L44,43 M61,40 L52,43" stroke="#201827" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="41" cy="46" r="2.6" fill="#201827"/><circle cx="55" cy="46" r="2.6" fill="#201827"/>
        <path d="M42,55 L54,55" stroke="#201827" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M28,49 L36,50 M68,49 L60,50" stroke="#201827" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
    return `
        <ellipse cx="40" cy="45" rx="5" ry="5.8" fill="#fff" stroke="#201827" stroke-width="1.6"/>
        <ellipse cx="56" cy="45" rx="5" ry="5.8" fill="#fff" stroke="#201827" stroke-width="1.6"/>
        <circle cx="40.4" cy="46" r="2.8" fill="#2b1b12"/><circle cx="56.4" cy="46" r="2.8" fill="#2b1b12"/>
        <circle cx="41.6" cy="44.2" r="1" fill="#fff"/><circle cx="57.6" cy="44.2" r="1" fill="#fff"/>
        <path d="M36,39 Q40,36 44,39" stroke="#201827" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M52,39 Q56,36 60,39" stroke="#201827" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M41,54 Q48,61 55,54 Z" fill="#3a1a1a" stroke="#201827" stroke-width="2" stroke-linejoin="round"/>
        <path d="M44,57 l2,3 l2,-3" fill="#fff"/>
        <circle cx="32" cy="51" r="1.2" fill="#c98b45"/><circle cx="37" cy="53" r="1.2" fill="#c98b45"/>
        <circle cx="59" cy="53" r="1.2" fill="#c98b45"/><circle cx="64" cy="51" r="1.2" fill="#c98b45"/>`;
}

const _boardPawnTokenCache = {};
window.boardPawnTokenSrc = function(idx) {
    const char = BOARD_CHARACTERS[idx] || BOARD_CHARACTERS[0] || {};
    const id = char.id || 'trau';
    if (_boardPawnTokenCache[id]) return _boardPawnTokenCache[id];
    const c = BOARD_PAWN_LOOKS[id] || { skin: '#ffe0bd', shade: '#eab378', hair: '#2b1b12', shirt: char.color || '#f4c766', rim: char.color || '#f4c766' };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <defs>
            <radialGradient id="bg" cx="42%" cy="26%" r="82%">
                <stop offset="0" stop-color="#ffffff" stop-opacity=".38"/>
                <stop offset=".45" stop-color="${c.rim}" stop-opacity=".55"/>
                <stop offset="1" stop-color="#0c1a22"/>
            </radialGradient>
            <clipPath id="clip"><circle cx="48" cy="48" r="45"/></clipPath>
        </defs>
        <circle cx="48" cy="48" r="46" fill="url(#bg)"/>
        <g clip-path="url(#clip)">
            <path d="M8,98 Q12,70 48,66 Q84,70 88,98 Z" fill="${c.shirt}" stroke="#201827" stroke-width="2.8" stroke-linejoin="round"/>
            <path d="M40,60 L56,60 L54,72 L42,72 Z" fill="${c.shade}" stroke="#201827" stroke-width="2.2"/>
            <path d="M36,68 Q48,76 60,68" stroke="#201827" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <circle cx="26" cy="43" r="4.6" fill="${c.skin}" stroke="#201827" stroke-width="2"/>
            <circle cx="70" cy="43" r="4.6" fill="${c.skin}" stroke="#201827" stroke-width="2"/>
            <circle cx="48" cy="42" r="21.5" fill="${c.skin}" stroke="#201827" stroke-width="2.8"/>
            <path d="M30,30 Q34,20 48,19 Q62,20 66,30" fill="none" stroke="${c.shade}" stroke-width="3" opacity=".35"/>
            ${boardPawnFace(id)}
            ${boardPawnHair(id, c)}
            <ellipse cx="48" cy="25" rx="26" ry="10" fill="#fff" opacity=".1"/>
        </g>
        <circle cx="48" cy="48" r="45" fill="none" stroke="${c.rim}" stroke-width="3.4"/>
        <circle cx="48" cy="48" r="42.4" fill="none" stroke="#0c1a22" stroke-width="1.6" opacity=".55"/>
        <path d="M28,16 Q48,6 68,15" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
    const uri = 'data:image/svg+xml,' + encodeURIComponent(svg);
    _boardPawnTokenCache[id] = uri;
    return uri;
};

window.boardRenderPawns = function(instant) {
    if (!boardGame) return;
    const layer = document.querySelector('#boardGrid .board-pawn-layer');
    if (!layer) return;

    const byCell = {};
    boardGame.players.forEach(p => {
        if (!p.eliminated) (byCell[p.pos] = byCell[p.pos] || []).push(p.idx);
    });

    boardGame.players.forEach((p, i) => {
        let el = document.getElementById('boardPawn_' + i);
        if (!el) {
            el = document.createElement('div');
            el.id = 'boardPawn_' + i;
            el.className = 'board-pawn';
            el.innerHTML = '<div class="pawn-body"><div class="pawn-avatar"><img alt=""></div><span class="pawn-lives"></span><span class="pawn-gear"></span></div><span class="pawn-name"></span>';
            layer.appendChild(el);
        }
        const char = BOARD_CHARACTERS[p.idx] || BOARD_CHARACTERS[0];
        const img = el.querySelector('.pawn-avatar img');
        const tokenSrc = window.boardPawnTokenSrc(i);
        if (img.getAttribute('src') !== tokenSrc) img.src = tokenSrc;
        img.alt = p.name || char.name;
        el.style.setProperty('--pc', p.color || char.color);
        el.classList.toggle('is-active', !boardGame.gameOver && boardGame.currentTurn === p.idx);
        el.classList.toggle('is-out', !!p.eliminated);
        el.classList.toggle('is-me', !!(p.isHuman || (p.networkId && p.networkId === getMyNetworkId())));
        el.classList.toggle('no-move', !!instant);
        el.querySelector('.pawn-name').textContent = p.name || char.name;
        el.querySelector('.pawn-lives').textContent = p.eliminated ? '💀' : '♥'.repeat(Math.max(0, p.lives || 0));
        const gear = [];
        if (p.weapons > 0) gear.push('⚔' + p.weapons);
        if (p.shields > 0) gear.push('🛡' + p.shields);
        el.querySelector('.pawn-gear').textContent = gear.join(' ');
        if (p.eliminated) {
            el.style.display = 'none';
            return;
        }
        el.style.display = '';
        const pos = _getCellPixelPos(p.pos);
        const group = byCell[p.pos] || [i];
        const j = Math.max(0, group.indexOf(i));
        const stacked = group.length > 1;
        el.classList.toggle('is-stacked', stacked);
        el.style.setProperty('--pscale', stacked ? '0.78' : '1');
        let dx = 0, dy = 0;
        if (group.length === 2) {
            dx = j === 0 ? -14 : 14;
        } else if (group.length === 3) {
            dx = (j - 1) * 16;
            dy = j === 1 ? -19 : 9;
        } else if (group.length > 3) {
            dx = j % 2 === 0 ? -16 : 16;
            dy = j < 2 ? -21 : 10;
        }
        el.style.left = (pos.x + dx) + 'px';
        el.style.top = (pos.y + dy) + 'px';
        el.style.zIndex = String(30 + (boardGame.currentTurn === p.idx ? 20 : 0) + i);
    });

    if (instant) {
        requestAnimationFrame(() => layer.querySelectorAll('.board-pawn.no-move').forEach(n => n.classList.remove('no-move')));
    }
};

window.boardHopPawn = function(idx) {
    const body = document.querySelector('#boardPawn_' + idx + ' .pawn-body');
    if (!body) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    body.classList.remove('pawn-hop');
    void body.offsetWidth;
    body.classList.add('pawn-hop');
};

// ── Hiệu ứng sân đấu (bám theo ô cờ) ─────────────────────────
const BOARD_FX_GLYPHS = {
    forward: ['💨', '✨'],
    back: ['😵', '💨', '💥'],
    gold: ['🪙', '💰', '✨'],
    weapon: ['🗡️', '⚔️', '✨'],
    shield: ['🛡️', '✨', '💫'],
    heal: ['❤️', '💖', '✨'],
    damage: ['💔', '💥', '😱'],
    trap: ['💥', '🔥', '💣'],
    monster: ['👹', '💥', '😱'],
    swap: ['🌀', '✨', '🔁'],
    portal: ['🌀', '🪐', '✨'],
    sleep: ['💤', '😴'],
    steal: ['🤑', '🪙', '✨'],
    finish: ['🎉', '🎊', '⭐', '🏆'],
    card: ['🃏', '✨', '💫']
};
const BOARD_FX_COUNT = { forward: 8, back: 10, gold: 12, finish: 26, trap: 16, damage: 12, monster: 14 };

function boardFxReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

window.boardFxFlash = function(kind) {
    const modal = document.getElementById('boardGameModal');
    if (!modal) return;
    const flash = document.createElement('div');
    flash.className = 'board-fx-flash fx-' + kind;
    modal.appendChild(flash);
    setTimeout(() => flash.remove(), 640);
};

window.boardFxShake = function() {
    if (boardFxReduced()) return;
    const canvas = document.querySelector('#boardGrid .board-canvas');
    if (!canvas) return;
    canvas.classList.remove('board-fx-shake');
    void canvas.offsetWidth;
    canvas.classList.add('board-fx-shake');
    setTimeout(() => canvas.classList.remove('board-fx-shake'), 480);
};

window.boardPlayFx = function(kind, cell, text, opts) {
    try {
        if (!boardGame || !document.getElementById('boardGrid')) return;
        const layer = document.getElementById('boardFxLayer');
        const canvas = document.querySelector('#boardGrid .board-canvas');
        if (!layer || !canvas) return;
        opts = opts || {};
        const pos = _getCellPixelPos(typeof cell === 'number' ? cell : (boardGame.currentTurn || 0));
        const reduced = boardFxReduced();

        if (text) {
            const float = document.createElement('div');
            float.className = 'board-fx-float fx-' + kind;
            float.textContent = text;
            float.style.left = pos.x + 'px';
            float.style.top = (pos.y - 16) + 'px';
            float.style.zIndex = String(72 + (opts.z || 0));
            layer.appendChild(float);
            setTimeout(() => float.remove(), reduced ? 700 : 1300);
        }
        if (reduced) return;

        const glyphs = BOARD_FX_GLYPHS[kind] || ['✨'];
        const count = opts.count || BOARD_FX_COUNT[kind] || 9;
        for (let i = 0; i < count; i++) {
            const spark = document.createElement('span');
            spark.className = 'board-fx-spark';
            spark.textContent = glyphs[i % glyphs.length];
            const ang = (Math.PI * 2 * i) / count + Math.random() * 0.7;
            const dist = 24 + Math.random() * (kind === 'finish' ? 150 : 46);
            spark.style.left = pos.x + 'px';
            spark.style.top = pos.y + 'px';
            spark.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
            spark.style.setProperty('--dy', (Math.sin(ang) * dist - (opts.lift || 10)).toFixed(1) + 'px');
            spark.style.setProperty('--rot', Math.round(Math.random() * 240 - 120) + 'deg');
            spark.style.setProperty('--dur', (0.65 + Math.random() * 0.45).toFixed(2) + 's');
            spark.style.fontSize = (kind === 'finish' ? 16 : 11 + Math.random() * 6).toFixed(0) + 'px';
            layer.appendChild(spark);
            setTimeout(() => spark.remove(), 1250);
        }
        if (opts.ring !== false) {
            const ring = document.createElement('span');
            ring.className = 'board-fx-ring fx-' + kind;
            ring.style.left = pos.x + 'px';
            ring.style.top = pos.y + 'px';
            layer.appendChild(ring);
            setTimeout(() => ring.remove(), 720);
        }

        if (kind === 'damage' || kind === 'monster') { window.boardFxFlash('damage'); window.boardFxShake(); }
        else if (kind === 'trap') { window.boardFxFlash('trap'); window.boardFxShake(); }
        else if (kind === 'heal') window.boardFxFlash('heal');
        else if (kind === 'gold') window.boardFxFlash('gold');
        else if (kind === 'finish') { window.boardFxFlash('win'); boardFxConfetti(); }
    } catch (e) {}
};

function boardFxConfetti() {
    const modal = document.getElementById('boardGameModal');
    if (!modal || boardFxReduced()) return;
    const colors = ['#ffd27b', '#ff8fa3', '#7ee0a8', '#8ab6f0', '#f4c766'];
    for (let i = 0; i < 40; i++) {
        const bit = document.createElement('span');
        bit.className = 'board-fx-confetti';
        bit.style.left = Math.random() * 100 + '%';
        bit.style.background = colors[i % colors.length];
        bit.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
        bit.style.animationDuration = (1.3 + Math.random() * 0.9).toFixed(2) + 's';
        bit.style.setProperty('--rot', Math.round(Math.random() * 720 - 360) + 'deg');
        modal.appendChild(bit);
        setTimeout(() => bit.remove(), 2700);
    }
}


// Camera target: pawn centre in viewport space, clamped to the padded scroll area.
window.boardFocusPawn = function(idx) {
    if (!boardGame) return;
    if (typeof idx !== 'number') idx = boardGame.currentTurn;
    const p = boardGame.players[idx];
    if (!p) return;
    window._cameraFollowIdx = idx;
    const grid = document.getElementById('boardGrid');
    const canvas = grid && grid.querySelector('.board-canvas');
    if (!grid || !canvas) return;

    const gr = grid.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    const cell = _getCellPixelPos(p.pos);
    const screenX = cr.left + (cell.x / BOARD_MAP_W) * cr.width;
    const screenY = cr.top + (cell.y / BOARD_MAP_H) * cr.height;
    const maxX = Math.max(0, grid.scrollWidth - grid.clientWidth);
    const maxY = Math.max(0, grid.scrollHeight - grid.clientHeight);
    const tx = grid.scrollLeft + screenX - (gr.left + gr.width / 2);
    const ty = grid.scrollTop + screenY - (gr.top + gr.height / 2);
    window._cameraTargetX = Math.max(0, Math.min(maxX, tx));
    window._cameraTargetY = Math.max(0, Math.min(maxY, ty));
};

window.boardRefreshCell = function(i) {
    const div = document.getElementById('bcell_' + i);
    if (div) _paintCell(div, i);
};

// Repaint every board surface without rebuilding the DOM (used after cards / network sync).
window.boardSyncView = function() {
    if (!boardGame) return;
    const grid = document.getElementById('boardGrid');
    if (!grid || !grid.querySelector('.board-canvas')) {
        window.boardRenderGrid();
        return;
    }
    for (let i = 0; i < BOARD_TOTAL_CELLS; i++) window.boardRefreshCell(i);
    window.boardRenderPawns();
    window.boardRenderPlayers();
    window.boardRenderLog();
    window.boardUpdateRollBtn();
    window.boardUpdateCharPanel();
};

// --- CAMERA SYSTEM (World Board vs Viewport) ---
window.boardCameraAutoFollow = true;
window._cameraTargetX = 0;
window._cameraTargetY = 0;
window._boardCameraLoopId = null;

// Camera target is the active pawn itself (computed by boardFocusPawn).
window.boardScrollToCurrentPlayer = function(targetIdx) {
    const idx = (typeof targetIdx === 'number') ? targetIdx : (boardGame ? boardGame.currentTurn : 0);
    window.boardFocusPawn(idx);
};

// Desktop click-drag to scroll & Mobile touch-drag to scroll
window.boardInitCameraDrag = function() {
    const grid = document.getElementById('boardGrid');
    if (!grid) return;
    
    let isDragging = false;
    let startX, startY;
    let scrollLeft, scrollTop;
    
    // Desktop mouse drag
    grid.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('select') || e.target.closest('input') || e.target.closest('.board-overlay-panel')) {
            return;
        }
        isDragging = true;
        window.boardCameraAutoFollow = false; // Suspend auto-follow when dragging manually
        grid.style.cursor = 'grabbing';
        
        startX = e.pageX - grid.offsetLeft;
        startY = e.pageY - grid.offsetTop;
        scrollLeft = grid.scrollLeft;
        scrollTop = grid.scrollTop;
    });
    
    grid.addEventListener('mouseleave', () => {
        isDragging = false;
        grid.style.cursor = 'default';
    });
    
    grid.addEventListener('mouseup', () => {
        isDragging = false;
        grid.style.cursor = 'default';
    });
    
    grid.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const y = e.pageY - grid.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        grid.scrollLeft = scrollLeft - walkX;
        grid.scrollTop = scrollTop - walkY;
        
        // Sync target pos to drag scroll so auto-follow doesn't snap back on resume
        window._cameraTargetX = grid.scrollLeft;
        window._cameraTargetY = grid.scrollTop;
    });
    
    // Mobile touch drag
    grid.addEventListener('touchstart', (e) => {
        if (e.target.closest('button') || e.target.closest('select') || e.target.closest('input') || e.target.closest('.board-overlay-panel')) {
            return;
        }
        isDragging = true;
        window.boardCameraAutoFollow = false;
        
        const touch = e.touches[0];
        startX = touch.pageX - grid.offsetLeft;
        startY = touch.pageY - grid.offsetTop;
        scrollLeft = grid.scrollLeft;
        scrollTop = grid.scrollTop;
    }, { passive: true });
    
    grid.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    grid.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const x = touch.pageX - grid.offsetLeft;
        const y = touch.pageY - grid.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        grid.scrollLeft = scrollLeft - walkX;
        grid.scrollTop = scrollTop - walkY;
        
        window._cameraTargetX = grid.scrollLeft;
        window._cameraTargetY = grid.scrollTop;
    }, { passive: true });
};

// Starts requestAnimationFrame rendering loop for smooth camera transitions (LERP)
window.boardStartCameraLoop = function() {
    if (window._boardCameraLoopId) return;
    window._cameraCurrentX = null;
    window._cameraCurrentY = null;

    const loop = () => {
        const grid = document.getElementById('boardGrid');
        if (grid) {
            if (window._cameraCurrentX === null) window._cameraCurrentX = grid.scrollLeft;
            if (window._cameraCurrentY === null) window._cameraCurrentY = grid.scrollTop;

            if (window.boardCameraAutoFollow) {
                const maxX = Math.max(0, grid.scrollWidth - grid.clientWidth);
                const maxY = Math.max(0, grid.scrollHeight - grid.clientHeight);
                const targetX = Math.max(0, Math.min(maxX, window._cameraTargetX || 0));
                const targetY = Math.max(0, Math.min(maxY, window._cameraTargetY || 0));
                const dx = targetX - window._cameraCurrentX;
                const dy = targetY - window._cameraCurrentY;

                if (Math.abs(dx) < 0.8 && Math.abs(dy) < 0.8) {
                    window._cameraCurrentX = targetX;
                    window._cameraCurrentY = targetY;
                } else {
                    window._cameraCurrentX += dx * 0.18;
                    window._cameraCurrentY += dy * 0.18;
                }
                grid.scrollLeft = Math.round(window._cameraCurrentX);
                grid.scrollTop = Math.round(window._cameraCurrentY);
            } else {
                window._cameraCurrentX = grid.scrollLeft;
                window._cameraCurrentY = grid.scrollTop;
            }
        }
        window._boardCameraLoopId = requestAnimationFrame(loop);
    };
    window._boardCameraLoopId = requestAnimationFrame(loop);
};

// Recenter camera onto active player and re-enable auto-follow
window.boardRecenterCamera = function() {
    window.boardCameraAutoFollow = true;
    window.boardScrollToCurrentPlayer();
};

// ── Render Danh sách ──────────────────────────────────────────
window.boardRenderPlayers = function() {
    if (!boardGame || !boardGame.players) return;

    const charSection = document.querySelector('.characters-section');
    if (charSection) {
        // Drop the static cards from index.html on first render.
        charSection.querySelectorAll(':scope > .char-card').forEach(card => card.remove());

        const displayOrder = [...boardGame.players].sort((a, b) => {
            const aUs = (a.networkId === getMyNetworkId() || a.isHuman) ? 0 : 1;
            const bUs = (b.networkId === getMyNetworkId() || b.isHuman) ? 0 : 1;
            return aUs - bUs || a.idx - b.idx;
        });

        displayOrder.forEach((p, order) => {
            let wrap = document.getElementById('charWrap_' + p.idx);
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.className = 'char-card-container';
                wrap.id = 'charWrap_' + p.idx;
                wrap.innerHTML = `
                    <div class="user-card-tag">BẠN</div>
                    <div class="char-card" id="charCard_${p.idx}" role="button" tabindex="0">
                        <img alt="">
                        <span class="char-card-lives"></span>
                    </div>
                    <div class="char-card-name"></div>`;
                const card = wrap.querySelector('.char-card');
                card.addEventListener('click', () => window.boardSelectCharacterDisplay(p.idx));
                card.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.boardSelectCharacterDisplay(p.idx);
                    }
                });
                charSection.appendChild(wrap);
            }

            const char = BOARD_CHARACTERS[p.idx] || BOARD_CHARACTERS[0];
            const img = wrap.querySelector('img');
            if (img.getAttribute('src') !== char.img) {
                img.src = char.img;
                img.alt = p.name || char.name;
            }
            const isMe = !!(p.isHuman || (p.networkId && p.networkId === getMyNetworkId()));
            wrap.classList.toggle('is-me', isMe);
            wrap.style.order = String(order);
            wrap.style.setProperty('--pc', p.color || char.color);
            wrap.title = `${p.name || char.name} · Ô ${p.pos + 1}`;

            const card = wrap.querySelector('.char-card');
            card.classList.toggle('active', window.boardSelectedCharDisplayIdx === p.idx);
            card.classList.toggle('active-turn', !boardGame.gameOver && boardGame.currentTurn === p.idx);
            card.classList.toggle('eliminated', !!p.eliminated);
            wrap.querySelector('.char-card-lives').textContent = p.eliminated ? '💀' : '♥'.repeat(Math.max(0, p.lives || 0));
            wrap.querySelector('.char-card-name').textContent = p.name || char.name;
        });

        charSection.querySelectorAll('.char-card-container').forEach(w => {
            const idx = Number(w.id.replace('charWrap_', ''));
            if (!boardGame.players[idx]) w.remove();
        });
    }

    // Turn / race progress banner (created once, updated in place).
    const banner = document.querySelector('.board-title-banner');
    let bar = document.getElementById('raceProgress');
    if (bar && bar.parentElement !== banner) {
        bar.remove();
        bar = null;
    }
    if (!bar && banner) {
        bar = document.createElement('div');
        bar.id = 'raceProgress';
        bar.innerHTML = '<span id="raceTurnName"></span><b id="racePosText"></b><progress id="raceBar" max="99" value="0"></progress>';
        banner.appendChild(bar);
    }
    const cur = boardGame.players[boardGame.currentTurn];
    if (bar && cur) {
        const turnEl = document.getElementById('raceTurnName');
        const posEl = document.getElementById('racePosText');
        if (turnEl) turnEl.textContent = boardGame.gameOver ? '🏆 Kết thúc' : `Lượt: ${cur.name}`;
        if (posEl) posEl.textContent = `Ô ${Math.min(cur.pos + 1, BOARD_TOTAL_CELLS)} / ${BOARD_TOTAL_CELLS}`;
        const prog = document.getElementById('raceBar');
        if (prog) prog.value = cur.pos;
        bar.classList.toggle('is-over', !!boardGame.gameOver);
    }

    document.querySelectorAll('.board-cell.current-racer').forEach(el => el.classList.remove('current-racer'));
    if (cur && !boardGame.gameOver) {
        const activeCell = document.getElementById('bcell_' + cur.pos);
        if (activeCell) activeCell.classList.add('current-racer');
    }

    window.boardUpdateCharPanel();
};

// ── Khởi tạo ──────────────────────────────────────────────────
function openBoardGame(pvpMode = false) {
    try { if (window.audio) window.audio.play('click'); } catch(e){}
    
    // Shuffle deck for a completely randomized card pool this match
    if (typeof window.boardShuffleDeck === 'function') {
        window.boardShuffleDeck();
    }
    
    let betAmount = 0; // default bet
    boardGame = {
        players: [], currentTurn: 0, isRolling: false,
        trappedCells: {}, log: [], gameOver: false,
        revealedCells: { 0: true, [BOARD_TOTAL_CELLS - 1]: true },
        pvp: !!pvpMode, hostId: pvpMode ? getMyNetworkId() : null, betPool: betAmount,
        cellZones: []
    };

    // Randomize zone names for each cell in this match
    for (let i = 0; i < BOARD_TOTAL_CELLS; i++) {
        boardGame.cellZones.push(NEIGHBORHOOD_NAMES[Math.floor(Math.random() * NEIGHBORHOOD_NAMES.length)]);
    }

    // Randomize starting traps on cells (15% chance for cells 5 to 94)
    for (let i = 5; i < BOARD_TOTAL_CELLS - 5; i++) {
        if (Math.random() < 0.15) {
            boardGame.trappedCells[i] = true;
        }
    }
    
    // Human Player (Player 1) - Trâu Trẻ Trâu
    const playerName = (window.player && window.player.name) ? window.player.name : 'Anh Hùng';
    const playerClass = (window.player && window.player.classId) ? window.player.classId : 'cop';
    const playerSkin = window.player && window.player.equipment ? window.player.equipment.skin : null;

    // Shuffled player colors
    window.boardGameColors = [...RACE_PLAYER_COLORS].sort(() => Math.random() - 0.5);

    boardGame.players.push({
        idx: 0, name: playerName + ' (Trâu)', networkId: getMyNetworkId(), classId: playerClass, skin: playerSkin,
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: window.boardGameColors[0],
        emoji: '👦',
        isHuman: true, isBot: false, skipTurn: false,
        gold: 0,
        hand: boardDealHand(5)
    });
    
    // Add 3 Bots representing Mầm Mềm Mẽ, Kiến Bảo Vệ, Út Mũ Rơm
    boardAddBot();
    boardAddBot();
    boardAddBot();

    const bpd = document.getElementById('boardBetPoolDisplay');
    const bpa = document.getElementById('boardBetPoolAmount');
    if(bpd && bpa) {
        if(betAmount > 0) {
            bpd.style.display = 'flex';
            bpa.textContent = `${betAmount.toLocaleString()}`;
        } else {
            bpd.style.display = 'none';
        }
    }

    // Toggle Admin panel button if username is 'admin'
    const adminBtn = document.getElementById('boardAdminBtn');
    if (adminBtn) {
        if (window.player && window.player.name && window.player.name.toLowerCase() === 'admin') {
            adminBtn.style.display = 'inline-block';
        } else {
            adminBtn.style.display = 'none';
        }
    }

    // Default selected character display to human (0)
    window.boardSelectedCharDisplayIdx = 0;

    const bgModal = document.getElementById('boardGameModal');
    if (bgModal) bgModal.classList.add('active');
    boardRenderGrid();
    boardRenderPlayers();
    boardUpdateRollBtn();
    boardAddLog(`🏁 ĐẤU TRƯỜNG BẮT ĐẦU! Ai hết 3 ❤️ sẽ chết. Đi tới ô ${BOARD_TOTAL_CELLS} (Quảng Trường) để thắng!`, 'special');
}
window.openBoardGame = openBoardGame;

window.boardAddBot = function() {
    if(boardGame.players.length >= 4) return;
    const idx = boardGame.players.length;
    const botNames  = ['Mầm Mềm Mẽ', 'Kiến Bảo Vệ', 'Út Mũ Rơm'];
    const botEmojis = ['👩‍🦰', '👮‍♂️', '👦'];
    const color = (window.boardGameColors && window.boardGameColors[idx]) ? window.boardGameColors[idx] : '#f59e0b';
    boardGame.players.push({
        idx, name: botNames[idx-1] || `Bot ${idx}`, networkId: null,
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: color,
        emoji: botEmojis[idx-1] || '👾',
        isHuman: false, isBot: true, skipTurn: false,
        hand: boardDealHand(5),
        gold: 0
    });
    boardRenderPlayers();
    boardAddLog(`💀 ${botNames[idx-1]} đã tham gia đấu trường!`);
};

// ── Logic chuyển lượt có xử lý người chết ──────────────────
window.boardNextTurn = function() {
    if(boardGame.gameOver) return;
    let nextIdx = (boardGame.currentTurn + 1) % boardGame.players.length;
    let safety = 0;
    while(boardGame.players[nextIdx].eliminated && safety < 10) {
        nextIdx = (nextIdx + 1) % boardGame.players.length;
        safety++;
    }
    boardGame.currentTurn = nextIdx;
    if(boardGame) {
        boardGame.turnStartTime = Date.now();
    }
    
    // Auto-select character display to current turn player
    window.boardSelectedCharDisplayIdx = nextIdx;
    window.boardSelectCharacterDisplay(nextIdx);
    
    boardRenderPlayers();
    boardUpdateRollBtn();
    window.boardCameraAutoFollow = true; // Auto-follow active player at start of turn
    if (window.boardScrollToCurrentPlayer) window.boardScrollToCurrentPlayer(nextIdx);
    
    let next = boardGame.players[boardGame.currentTurn];
    if(next && next.isBot && !next.eliminated && !boardGame.gameOver) {
        if (document.hidden) {
            window.boardRollForCurrentPlayer();
        } else {
            setTimeout(() => { if(!boardGame.gameOver) window.boardRollForCurrentPlayer(); }, 900);
        }
    }
};

window.closeBoardGame = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardGameModal');
    if(modal) modal.classList.remove('active');
    if(window.boardPvpTimerInterval) {
        clearInterval(window.boardPvpTimerInterval);
        window.boardPvpTimerInterval = null;
    }
    if (typeof window.switchScreen === 'function') {
        window.switchScreen('gameModeScreen');
    }
};

window.closeBoardInviteModal = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardInviteModal');
    if(modal) modal.classList.remove('active');
    if(window._boardInviteRefreshInterval) {
        clearInterval(window._boardInviteRefreshInterval);
        window._boardInviteRefreshInterval = null;
    }
};

window.openBoardInviteModal = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardInviteModal');
    if(!modal) return;
    
    const refreshList = () => {
        const list = document.getElementById('boardInvitePlayerList');
        if(!list || !modal.classList.contains('active')) {
            if(window._boardInviteRefreshInterval) {
                clearInterval(window._boardInviteRefreshInterval);
                window._boardInviteRefreshInterval = null;
            }
            return;
        }
        list.innerHTML = '';
        let players = window.networkPlayers || {};
        let count = 0;
        
        for(let id in players) {
            let p = players[id];
            if(id === getMyNetworkId() || (Date.now() - p.lastSeen > 12000)) continue;
            count++;
            let div = document.createElement('div');
            div.className = 'pvp-player-row';
            div.innerHTML = `
                <div style="flex:1; display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.5rem;">${window.CLASS_DATA && window.CLASS_DATA[p.classId] ? window.CLASS_DATA[p.classId].emoji : '👤'}</span>
                    <div>
                        <div style="font-weight:bold; color:var(--gold);">${p.name}</div>
                        <div style="font-size:0.75rem; color:#aaa;">Lv.${p.level || 1}</div>
                    </div>
                </div>
                <button class="btn-sm" style="background:#22c55e;" onclick="sendBoardInvite('${id}', '${p.name}')">Mời</button>
            `;
            list.appendChild(div);
        }
        
        if(count === 0) {
            list.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">Không có người chơi online. Mở thêm tab!</div>';
        }
    };
    
    refreshList();
    modal.classList.add('active');
    
    if(window._boardInviteRefreshInterval) clearInterval(window._boardInviteRefreshInterval);
    window._boardInviteRefreshInterval = setInterval(refreshList, 1000);
};

window.sendBoardInvite = function(targetId, targetName) {
    try { audio.play('click'); } catch(e){}
    if(typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: 'BOARD_PVP_INVITE',
            id: getMyNetworkId(),
            targetId: targetId,
            senderName: player.name
        });
        showToast(`Đã gửi lời mời Cờ Đua tới ${targetName}!`);
        closeBoardInviteModal();
    }
};

window.showBoardInvite = function(msg) {
    if(window.currentScreen === 'boardGame' || document.getElementById('boardGameModal').classList.contains('active')) return;
    document.getElementById('pvpChallengeText').innerHTML = 
        `🎲 <b>${msg.senderName}</b> mời bạn chơi Cờ Đua Sinh Tồn!`;
    document.getElementById('pvpAutoHint').textContent = '';
    
    document.getElementById('acceptPvpBtn').onclick = () => {
        document.getElementById('pvpChallengeModal').style.display = 'none';
        if(typeof pvpChannel !== 'undefined') pvpChannel.postMessage({ type: 'BOARD_PVP_REPLY', id: getMyNetworkId(), senderId: msg.id, targetId: msg.id, accepted: true, replierName: player.name });
        showToast('⏳ Đã đồng ý! Đang chờ chủ phòng khởi tạo bàn cờ...');
    };
    
    document.getElementById('rejectPvpBtn').onclick = () => {
        document.getElementById('pvpChallengeModal').style.display = 'none';
        if(typeof pvpChannel !== 'undefined') pvpChannel.postMessage({ type: 'BOARD_PVP_REPLY', id: getMyNetworkId(), senderId: msg.id, targetId: msg.id, accepted: false, replierName: player.name });
    };
    
    document.getElementById('pvpChallengeModal').style.display = 'flex';
};

console.log('🏁 [board_new.js] Cờ Đua Sinh Tồn v4 loaded!');

// ── Bet Modal & Triggers ──────────────────────────────────────
window.openBoardGameWithBet = function() {
    try { if (window.audio) window.audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardBetModal');
    if(modal) modal.classList.add('active');
    window._selectedBetAmount = 0;
    const opts = document.querySelectorAll('.bet-option');
    if(opts.length > 0) {
        opts.forEach(el => el.classList.remove('selected'));
        opts[0].classList.add('selected');
    }
};

window.selectBetAmount = function(amt, ev) {
    try { if (window.audio) window.audio.play('click'); } catch(e){}
    window._selectedBetAmount = amt;
    document.querySelectorAll('.bet-option').forEach(el => el.classList.remove('selected'));
    const target = (ev && ev.currentTarget) ? ev.currentTarget : (typeof event !== 'undefined' && event ? event.currentTarget : null);
    if (target) target.classList.add('selected');
};

window.closeBetModal = function() {
    try { if (window.audio) window.audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardBetModal');
    if(modal) modal.classList.remove('active');
};

window.confirmBetAndStart = function() {
    try { if (window.audio) window.audio.play('click'); } catch(e){}
    let amt = window._selectedBetAmount || 0;
    const customInp = document.getElementById('customBetAmount');
    if(customInp && customInp.value) {
        amt = parseInt(customInp.value) || 0;
    }
    const currentGold = (window.player && typeof window.player.gold !== 'undefined') ? window.player.gold : 150;
    if(currentGold < amt) {
        if (typeof showToast === 'function') showToast('⚠️ Không đủ vàng để cược!');
        else alert('⚠️ Không đủ vàng để cược!');
        return;
    }
    if (window.player) window.player.gold = currentGold - amt;
    if (typeof boardRefreshHud === 'function') boardRefreshHud();
    window.closeBetModal();
    
    // Bắt đầu game với tiền cược
    window.openBoardGame(false); 
    if (window.boardGame) window.boardGame.betPool = amt; 
    if (typeof boardRenderGrid === 'function') boardRenderGrid();
};

window.startBoardGameNoBet = function() {
    try { if (window.audio) window.audio.play('click'); } catch(e){}
    window.closeBetModal();
    window.openBoardGame(false);
};

window.boardAddLog = function(text, type) {
    if (!boardGame) return;
    boardGame.log.push({ text, type });
    if (boardGame.log.length > 24) boardGame.log.shift();
    const logEl = document.getElementById('boardLog');
    if (!logEl) return;
    const p = document.createElement('p');
    p.className = type || '';
    p.textContent = text;
    logEl.appendChild(p);
    while (logEl.children.length > 24) logEl.removeChild(logEl.firstChild);
    logEl.scrollTop = logEl.scrollHeight;
};

window.boardRenderLog = function() {
    const logEl = document.getElementById('boardLog');
    if (!logEl || !boardGame) return;
    logEl.textContent = '';
    boardGame.log.forEach(entry => {
        const p = document.createElement('p');
        p.className = entry.type || '';
        p.textContent = entry.text;
        logEl.appendChild(p);
    });
    logEl.scrollTop = logEl.scrollHeight;
};

window.boardIsMyTurn = function() {
    if(!boardGame || boardGame.gameOver) return false;
    let cur = boardGame.players[boardGame.currentTurn];
    if(!cur) return false;
    if(boardGame.pvp) return cur.networkId === getMyNetworkId();
    return !!cur.isHuman;
};

window.boardUpdateRollBtn = function() {
    let btn = document.getElementById('rollDiceBtn');
    if(!btn || !boardGame) return;
    let isMyTurn = window.boardIsMyTurn();
    btn.disabled = boardGame.isRolling || boardGame.gameOver || !isMyTurn;
    btn.textContent = boardGame.gameOver ? '🏁 Ván đã kết thúc' : isMyTurn ? '🎲 Tung Xúc Xắc' : '⏳ Chờ đối thủ...';
};

window.boardRollDice = function() {
    if(!boardGame || boardGame.isRolling || boardGame.gameOver) return;
    let cur = boardGame.players[boardGame.currentTurn];
    if(!cur || !window.boardIsMyTurn()) return;
    if(boardGame.pvp && boardGame.hostId !== getMyNetworkId()) {
        if(typeof pvpChannel !== 'undefined') {
            pvpChannel.postMessage({ 
                type: 'BOARD_ROLL_REQUEST', 
                roomId: window.boardOnlineRoomId,
                id: getMyNetworkId(), 
                hostId: boardGame.hostId 
            });
        }
        boardGame.isRolling = true;
        window.boardUpdateRollBtn();
        return;
    }
    window.boardRollForCurrentPlayer();
};

window.boardRollForCurrentPlayer = function() {
    let cur = boardGame.players[boardGame.currentTurn];
    if(!cur) return;
    boardGame.isRolling = true;
    window.boardUpdateRollBtn();
    if (window.boardScrollToCurrentPlayer) {
        window.boardScrollToCurrentPlayer(boardGame.currentTurn);
    }

    const isHost = !boardGame.pvp || boardGame.hostId === getMyNetworkId();
    let roll = 1 + Math.floor(Math.random() * 6);

    if (boardGame.pvp && isHost) {
        // Broadcast roll value to Guest
        if (typeof pvpChannel !== 'undefined') {
            pvpChannel.postMessage({
                type: 'BOARD_PVP_ROLL_EVENT',
                roomId: window.boardOnlineRoomId,
                id: getMyNetworkId(),
                playerId: cur.idx,
                rollValue: roll
            });
        }
    }

    window.boardDoRollAnimation(cur, () => {
        boardGame.isRolling = false;
        // Đã bỏ luật "tung 6 được thêm lượt" theo yêu cầu — mỗi lượt chỉ đi 1 lần dù ra số gì.
        window.boardNextTurn();
        window.boardUpdateRollBtn();
        if (isHost) {
            window.boardBroadcastState('state');
        }
    }, roll);
};

window.boardBroadcastState = function(kind) {
    if(!boardGame || !boardGame.pvp || boardGame.hostId !== getMyNetworkId()) return;
    if(typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: kind === 'start' ? 'BOARD_PVP_START' : 'BOARD_PVP_STATE',
            id: getMyNetworkId(),
            hostId: getMyNetworkId(),
            targetIds: boardGame.players.map(p => p.networkId).filter(Boolean),
            boardGame: JSON.parse(JSON.stringify(boardGame)),
            cardHtml: document.getElementById('boardCardDisplay')?.innerHTML || '',
            diceText: document.getElementById('diceResultText')?.textContent || ''
        });
    }
};

window.boardApplyNetworkState = function(msg) {
    if(!msg.boardGame || !msg.targetIds?.includes(getMyNetworkId())) return;
    boardGame = msg.boardGame;
    boardGame.players.forEach((p, idx) => {
        p.idx = idx;
        p.isHuman = p.networkId === getMyNetworkId();
    });
    boardGame.isRolling = false;
    document.getElementById('boardGameModal').classList.add('active');
    if(msg.cardHtml) document.getElementById('boardCardDisplay').innerHTML = msg.cardHtml;
    if(msg.diceText) document.getElementById('diceResultText').textContent = msg.diceText;
    if (typeof window.boardSyncView === 'function') window.boardSyncView();
    else { window.boardRenderGrid(); window.boardRenderPlayers(); window.boardUpdateRollBtn(); }
    
    // Thiết lập vòng lặp đếm giờ phía khách để kiểm tra Chủ phòng mất kết nối
    if(window.boardPvpTimerInterval) clearInterval(window.boardPvpTimerInterval);
    window.boardPvpTimerInterval = setInterval(() => {
        if (!boardGame || boardGame.gameOver || !boardGame.pvp) {
            if(window.boardPvpTimerInterval) {
                clearInterval(window.boardPvpTimerInterval);
                window.boardPvpTimerInterval = null;
            }
            return;
        }
        if (boardGame.hostId === getMyNetworkId()) return; // Chỉ khách kiểm tra chủ phòng
        
        // Kiểm tra xem chủ phòng còn online không
        if (window.networkPlayers && !window.networkPlayers[boardGame.hostId]) {
            if (!boardGame.hostOfflineTime) {
                boardGame.hostOfflineTime = Date.now();
            } else if (Date.now() - boardGame.hostOfflineTime > 5000) { // Chờ 5s buffer tránh lag đột xuất
                boardAddLog(`⚠️ Chủ phòng đã mất kết nối! Trận đấu kết thúc.`, 'special');
                window.boardShowBigNotice("⚠️ MẤT KẾT NỐI", "Chủ phòng đã rời khỏi trò chơi.", "Quay lại thế giới...", () => {
                    window.closeBoardGame();
                }, true);
            }
        } else {
            boardGame.hostOfflineTime = null;
        }
    }, 1000);
};

window.boardSwapNearest = function(p) {
    if(!boardGame) return 'Lỗi game';
    let nearest = null; let minDist = Infinity;
    boardGame.players.forEach((pl,i) => {
        if(i !== p.idx && !pl.eliminated) {
            let d = Math.abs((pl.pos || 0) - (p.pos || 0));
            if(d < minDist) { minDist = d; nearest = pl; }
        }
    });
    if(nearest) {
        const mine = p.pos, theirs = nearest.pos;
        window.boardPlayFx('swap', mine, '🔀');
        window.boardPlayFx('portal', theirs, '🔀');
        p.pos = theirs;
        nearest.pos = mine;
        if (boardGame.revealedCells) {
            boardGame.revealedCells[p.pos] = true;
            boardGame.revealedCells[nearest.pos] = true;
        }
        window.boardRefreshCell(mine);
        window.boardRefreshCell(theirs);
        window.boardRenderPawns();
        window.boardRenderPlayers();
        window.boardPlayFx('portal', p.pos, '');
        window.boardFocusPawn(p.idx);
        return `Đổi chỗ với ${nearest.name}! Nó đang ngơ ngác.`;
    }
    return 'Không ai gần để đổi.';
};

window.boardTeleportPlayer = function(p, targetPos) {
    if (!boardGame || !p || p.eliminated) return;
    const from = p.pos;
    const to = Math.max(0, Math.min(BOARD_TOTAL_CELLS - 1, targetPos));
    window.boardPlayFx('portal', from, '🌀');
    p.pos = to;
    if (boardGame.revealedCells) boardGame.revealedCells[to] = true;
    window.boardRefreshCell(from);
    window.boardRefreshCell(to);
    window.boardRenderPawns();
    window.boardRenderPlayers();
    window.boardUpdateCharPanel();
    window.boardPlayFx('portal', to, 'Xuyên không!');
    window.boardFocusPawn(p.idx);
};


// ── Hàm Khởi Động PvP phía Chủ Phòng (Host) ──────────────────
window.boardStartPvpAsHost = function(guestId, guestName) {
    try { audio.play('click'); } catch(e){}
    let guestData = window.networkPlayers && window.networkPlayers[guestId] ? window.networkPlayers[guestId] : {};
    
    boardGame = {
        players: [], currentTurn: 0, isRolling: false,
        trappedCells: {}, log: [], gameOver: false,
        pvp: true, hostId: getMyNetworkId(), betPool: 0,
        turnStartTime: Date.now()
    };
    
    // Thêm Chủ phòng (A)
    boardGame.players.push({
        idx: 0, name: player.name, networkId: getMyNetworkId(), classId: player.classId, skin: player.equipment?.skin,
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: RACE_PLAYER_COLORS[0],
        emoji: CLASS_DATA[player.classId]?.emoji || '🏃',
        isHuman: true, isBot: false, skipTurn: false
    });
    
    // Thêm Khách (B)
    boardGame.players.push({
        idx: 1, name: guestName, networkId: guestId, classId: guestData.classId || 0, skin: guestData.skin || null,
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: RACE_PLAYER_COLORS[1],
        emoji: CLASS_DATA[guestData.classId || 0]?.emoji || '🏃',
        isHuman: false, isBot: false, skipTurn: false
    });
    
    // Thêm 2 bot cho đủ 4 người chơi
    boardAddBot();
    boardAddBot();
    
    boardRenderGrid();
    boardRenderPlayers();
    boardUpdateRollBtn();
    
    const modal = document.getElementById('boardGameModal');
    if (modal) modal.classList.add('active');
    
    boardAddLog(`🏁 ĐẤU TRƯỜNG PvP BẮT ĐẦU! Quyết đấu giữa ${player.name} và ${guestName}!`, 'special');
    
    // Thiết lập vòng lặp đếm giờ lượt đi (AFK Timer) phía chủ phòng
    if(window.boardPvpTimerInterval) clearInterval(window.boardPvpTimerInterval);
    window.boardPvpTimerInterval = setInterval(() => {
        if (!boardGame || boardGame.gameOver || !boardGame.pvp) {
            if(window.boardPvpTimerInterval) {
                clearInterval(window.boardPvpTimerInterval);
                window.boardPvpTimerInterval = null;
            }
            return;
        }
        if (boardGame.hostId !== getMyNetworkId()) return; // Chỉ chủ phòng kiểm tra AFK và mất kết nối
        if (boardGame.isRolling) return;
        
        // 1. Kiểm tra đối thủ mất kết nối
        let guestPlayer = boardGame.players.find(p => p.networkId && p.networkId !== getMyNetworkId());
        if (guestPlayer && window.networkPlayers && !window.networkPlayers[guestPlayer.networkId]) {
            boardAddLog(`⚠️ Đối thủ ${guestPlayer.name} đã mất kết nối! Bạn thắng cuộc!`, 'special');
            window.boardShowBigNotice("🏆 CHIẾN THẮNG", `${guestPlayer.name} đã mất kết nối. Bạn thắng cuộc!`, "", () => {
                window.closeBoardGame();
            }, true);
            return;
        }
        
        // 2. Kiểm tra quá giờ đi lượt (AFK - 20 giây)
        let cur = boardGame.players[boardGame.currentTurn];
        if (!cur || cur.isBot) return;
        
        if (!boardGame.turnStartTime) {
            boardGame.turnStartTime = Date.now();
        }
        
        let elapsed = Date.now() - boardGame.turnStartTime;
        if (elapsed > 20000) { // 20 giây
            boardAddLog(`⏰ ${cur.name} quá thời gian đi lượt! Tự động tung xúc xắc.`, 'special');
            window.boardRollForCurrentPlayer();
        }
    }, 1000);
    
    // Phát sóng trạng thái khởi động game cho khách
    window.boardBroadcastState('start');
};

// ── Admin Panel Functions ────────────────────────────────────
window.boardOpenAdminModal = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardAdminModal');
    if (!modal) return;
    
    // Load cards editor list
    const container = document.getElementById('adminCardsContainer');
    if (container) {
        container.innerHTML = RACE_CARDS.map(c => {
            let fieldHTML = '';
            if (c.value !== undefined) {
                fieldHTML = `<input type="number" value="${c.value}" onchange="boardAdminUpdateCardProp('${c.id}', 'value', this.value)" style="width:50px; background:#1c1007; border:1px solid #d4af37; color:#fff; text-align:center; border-radius:4px; font-size:0.75rem;">`;
            } else if (c.damage !== undefined) {
                fieldHTML = `<input type="number" value="${c.damage}" onchange="boardAdminUpdateCardProp('${c.id}', 'damage', this.value)" style="width:50px; background:#1c1007; border:1px solid #d4af37; color:#fff; text-align:center; border-radius:4px; font-size:0.75rem;">`;
            }
            let rewardHTML = '';
            if (c.reward !== undefined) {
                rewardHTML = `<span style="font-size:0.7rem; color:#a8a29e; margin-left:10px;">Thưởng:</span> <input type="number" value="${c.reward}" onchange="boardAdminUpdateCardProp('${c.id}', 'reward', this.value)" style="width:50px; background:#1c1007; border:1px solid #d4af37; color:#fff; text-align:center; border-radius:4px; font-size:0.75rem;">`;
            }
            
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:4px 8px; border-radius:6px; font-size:0.75rem; border:1px solid rgba(255,255,255,0.05);">
                    <span style="font-weight:700; color:#eae1d4;">${c.name}</span>
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="font-size:0.7rem; color:#a8a29e;">Trị số:</span>
                        ${fieldHTML}
                        ${rewardHTML}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    modal.style.display = 'flex';
};

window.boardCloseAdminModal = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardAdminModal');
    if (modal) modal.style.display = 'none';
};

window.boardAdminUpdateCardProp = function(cardId, propName, value) {
    let card = RACE_CARDS.find(c => c.id === cardId);
    if (card) {
        card[propName] = Number(value);
        boardAddLog(`🔧 Admin chỉnh sửa [${card.name}] -> ${propName} = ${value}`, 'special');
    }
};

window.boardAdminRandomizeCells = function() {
    try { audio.play('click'); } catch(e){}
    if (!boardGame) return;
    
    // Re-randomize zones
    boardGame.cellZones = [];
    for (let i = 0; i < BOARD_TOTAL_CELLS; i++) {
        boardGame.cellZones.push(NEIGHBORHOOD_NAMES[Math.floor(Math.random() * NEIGHBORHOOD_NAMES.length)]);
    }
    
    // Re-randomize traps (15% chance)
    boardGame.trappedCells = {};
    for (let i = 5; i < BOARD_TOTAL_CELLS - 5; i++) {
        if (Math.random() < 0.15) {
            boardGame.trappedCells[i] = true;
        }
    }
    
    boardRenderGrid();
    boardAddLog(`🔧 Admin đã đảo lộn và ngẫu nhiên hóa vị trí 100 ô cờ trên bản đồ!`, 'special');
};

window.boardAdminModifyCell = function() {
    try { audio.play('click'); } catch(e){}
    if (!boardGame) return;
    
    const idxInput = document.getElementById('adminCellIdx');
    const typeSelect = document.getElementById('adminCellType');
    if (!idxInput || !typeSelect) return;
    
    const cellIdx = Number(idxInput.value) - 1;
    if (cellIdx < 0 || cellIdx >= BOARD_TOTAL_CELLS) return;
    
    const type = typeSelect.value;
    if (type === 'trap') {
        boardGame.trappedCells[cellIdx] = true;
        boardGame.revealedCells[cellIdx] = true;
    } else if (type === 'revealed') {
        delete boardGame.trappedCells[cellIdx];
        boardGame.revealedCells[cellIdx] = true;
    } else if (type === 'hidden') {
        delete boardGame.trappedCells[cellIdx];
        boardGame.revealedCells[cellIdx] = false;
    }
    
    boardRenderGrid();
    boardAddLog(`🔧 Admin đã chỉnh sửa ô số ${cellIdx + 1} thành dạng: ${type.toUpperCase()}`, 'special');
};

// ── Shop Cells & Trigger Operations ─────────────────────────
const SHOP_ZONES = ["Chợ Xóm", "Tạp Hóa", "Tiệm Thuốc", "Quán Nước"];

window.boardHandleShop = function(p, shopName, callback) {
    if (p.eliminated || boardGame.gameOver) {
        if (callback) callback();
        return;
    }
    
    // Lưu callback và player đang đi lượt để tiếp tục sau khi đóng shop
    window._shopCallback = callback;
    window._shopPlayer = p;

    if (p.isHuman) {
        // Mở UI Cửa Hàng
        const modal = document.getElementById('boardShopModal');
        const welcome = document.getElementById('shopWelcomeText');
        const goldEl = document.getElementById('shopPlayerGold');
        if (modal && welcome && goldEl) {
            welcome.textContent = `Ghé [${shopName}]. Mua gì thì mua, đừng chần chừ!`;
            goldEl.textContent = p.gold || 0;
            modal.style.display = 'flex';
        } else {
            if (callback) callback();
        }
    } else {
        // AI Bot mua đồ tự động (quyết định mua dựa trên số vàng đang có)
        let botGold = p.gold !== undefined ? p.gold : 150;
        let boughtSomething = false;
        
        // Ưu tiên 1: Mua máu nếu < 3 mạng và đủ 60 vàng
        if (p.lives < 3 && botGold >= 60) {
            botGold -= 60;
            p.lives++;
            boardAddLog(`🛒 ${p.name} mua hộp cứu thương (-60 🪙, +1 ❤️)`);
            window.boardPlayFx('heal', p.pos, '+1 ❤️');
            window.boardPlayFx('gold', p.pos, '-60🪙', { count: 4, ring: false, z: -1 });
            boughtSomething = true;
        }
        // Ưu tiên 2: Mua vũ khí nếu có 0 vũ khí và đủ 50 vàng
        else if (p.weapons === 0 && botGold >= 50) {
            botGold -= 50;
            p.weapons++;
            boardAddLog(`🛒 ${p.name} mua kiếm sắt (-50 🪙, +1 🗡️)`);
            window.boardPlayFx('weapon', p.pos, '+1 🗡️');
            window.boardPlayFx('gold', p.pos, '-50🪙', { count: 4, ring: false, z: -1 });
            boughtSomething = true;
        }
        // Ưu tiên 3: Mua khiên nếu có 0 khiên và đủ 50 vàng
        else if (p.shields === 0 && botGold >= 50) {
            botGold -= 50;
            p.shields++;
            boardAddLog(`🛒 ${p.name} mua khiên gỗ (-50 🪙, +1 🛡️)`);
            window.boardPlayFx('shield', p.pos, '+1 🛡️');
            window.boardPlayFx('gold', p.pos, '-50🪙', { count: 4, ring: false, z: -1 });
            boughtSomething = true;
        }
        
        if (!boughtSomething) {
            boardAddLog(`🛒 ${p.name} lượn qua ${shopName}, không mua gì.`);
        }
        
        p.gold = botGold;
        if (callback) callback();
    }
};

window.boardShopBuyItem = function(itemType, cost) {
    let p = window._shopPlayer;
    if (!p) return;
    
    if ((p.gold || 0) < cost) {
        showToast('⚠️ Bạn không đủ vàng!');
        return;
    }
    
    if (itemType === 'health' && p.lives >= 3) {
        showToast('❤️ Mạng đã đạt giới hạn tối đa (3)!');
        return;
    }
    
    // Trừ vàng của người chơi
    p.gold = (p.gold || 0) - cost;
    try { audio.play('levelup'); } catch(e){}
    window.boardPlayFx('gold', p.pos, `-${cost}🪙`, { count: 5, ring: false });

    if (itemType === 'weapon') {
        p.weapons++;
        window.boardPlayFx('weapon', p.pos, '+1 🗡️');
        boardAddLog(`🛒 Mua kiếm sắt (-${cost} 🪙, +1 🗡️)`);
    } else if (itemType === 'shield') {
        p.shields++;
        window.boardPlayFx('shield', p.pos, '+1 🛡️');
        boardAddLog(`🛒 Mua khiên gỗ (-${cost} 🪙, +1 🛡️)`);
    } else if (itemType === 'health') {
        p.lives++;
        window.boardPlayFx('heal', p.pos, '+1 ❤️');
        boardAddLog(`🛒 Mua hộp cứu thương (-${cost} 🪙, +1 ❤️)`);
    }
    
    boardRefreshHud();
    window.boardUpdateCharPanel();
    
    // Cập nhật lại số vàng trong UI Shop
    const goldEl = document.getElementById('shopPlayerGold');
    if (goldEl) goldEl.textContent = p.gold || 0;
    
    showToast('🛒 Xong! Đồ về tay.');
};

window.boardCloseShop = function() {
    try { audio.play('click'); } catch(e){}
    const modal = document.getElementById('boardShopModal');
    if (modal) modal.style.display = 'none';
    
    const cb = window._shopCallback;
    window._shopCallback = null;
    window._shopPlayer = null;
    
    if (cb) cb();
};

// ────────────────── BOARD GAME ONLINE MULTIPLAYER ──────────────────
window.boardOnlineRole = null;
window.boardOnlineRoomId = null;
window.boardRoomPingInterval = null;
window.boardActiveRooms = {};

window.boardRenderActiveRoomsList = function() {
    const listEl = document.getElementById('boardActiveRoomsList');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    // Clean expired rooms (> 5s)
    const now = Date.now();
    for (let id in window.boardActiveRooms) {
        if (now - window.boardActiveRooms[id].lastSeen > 5000) {
            delete window.boardActiveRooms[id];
        }
    }
    
    const rooms = Object.values(window.boardActiveRooms);
    if (rooms.length === 0) {
        listEl.innerHTML = '<div style="font-size:0.75rem; color:#666; text-align:center; padding: 4px 0;">Chưa phát hiện phòng online nào đang chờ...</div>';
        return;
    }
    
    rooms.forEach(room => {
        const row = document.createElement('div');
        row.style.cssText = 'background:#242230; border:1px solid #4d4566; border-radius:8px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;';
        row.innerHTML = `
            <div style="text-align:left;">
                <div style="font-weight:bold; font-size:0.8rem; color:#ffb3c6;">🎮 Phòng: ${room.roomId}</div>
                <div style="font-size:0.7rem; color:#aaa;">Chủ: ${room.hostName} | Cược: ${room.betAmount}💰</div>
            </div>
            <button class="btn-sm" style="background:#10b981; border:none; padding:4px 8px; font-size:0.75rem; color:#fff; border-radius:4px; cursor:pointer;" onclick="window.boardQuickJoinRoom('${room.roomId}')">Vào chơi</button>
        `;
        listEl.appendChild(row);
    });
};

window.boardLobbyData = {
    hostName: '',
    guestName: '',
    guestId: null,
    betAmount: 0,
    botCount: 2
};

window.boardShowLobbyUI = function(roomId, role, data) {
    if (data) {
        window.boardLobbyData = { ...window.boardLobbyData, ...data };
    }
    
    // Hide active board game modal to prevent background clutter while in waiting lobby
    const bgModal = document.getElementById('boardGameModal');
    if (bgModal) bgModal.classList.remove('active');
    
    let el = document.getElementById('boardLobbyOverlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'boardLobbyOverlay';
        el.style.cssText = 'position:fixed; inset:0; background:rgba(15,10,25,0.92); z-index:100060; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; font-family:\'Baloo 2\', \'Quicksand\', sans-serif; color:#fff;';
        document.body.appendChild(el);
    }
    el.style.display = 'flex';

    const isHost = (role === 'host');
    const guestLabel = window.boardLobbyData.guestName ? `🟢 Khách: ${window.boardLobbyData.guestName}` : `⏳ Chờ người chơi tham gia...`;
    
    // Host can select bot count
    let botSelectorHTML = '';
    if (isHost) {
        botSelectorHTML = `
            <div style="margin: 15px 0; text-align:left; width:100%;">
                <label style="font-size:0.85rem; color:#aaa; display:block; margin-bottom:5px;">🤖 Số lượng BOT thêm vào:</label>
                <select id="boardLobbyBotSelect" style="background:#242230; color:#fff; border:1px solid #4d4566; padding:6px 12px; border-radius:6px; width:100%; font-family:inherit; cursor:pointer;" onchange="window.boardLobbyChangeBot(this.value)">
                    <option value="0" ${window.boardLobbyData.botCount === 0 ? 'selected' : ''}>0 Bot (Đấu đôi)</option>
                    <option value="1" ${window.boardLobbyData.botCount === 1 ? 'selected' : ''}>1 Bot (3 người)</option>
                    <option value="2" ${window.boardLobbyData.botCount === 2 ? 'selected' : ''}>2 Bot (Đủ 4 người)</option>
                </select>
            </div>
        `;
    } else {
        botSelectorHTML = `
            <div style="margin: 15px 0; text-align:left; width:100%; background:#242230; padding:8px 12px; border-radius:6px; border:1px solid #4d4566; box-sizing:border-box;">
                <span style="font-size:0.85rem; color:#aaa;">🤖 Số lượng BOT thêm vào:</span>
                <strong style="color:#ffb3c6; font-size:0.9rem; float:right;">${window.boardLobbyData.botCount} Bots</strong>
            </div>
        `;
    }

    let actionButtonHTML = '';
    if (isHost) {
        const canStart = !!window.boardLobbyData.guestName;
        actionButtonHTML = `
            <button class="btn" id="boardLobbyStartBtn" style="background:#10b981; border:none; padding:10px 20px; font-size:0.95rem; color:#fff; border-radius:8px; cursor:pointer; width:100%; font-weight:bold; ${canStart ? '' : 'background:#4b5563; cursor:not-allowed;'}" ${canStart ? '' : 'disabled'} onclick="window.boardLobbyStartMatch()">🚀 BẮT ĐẦU TRẬN ĐẤU</button>
        `;
    } else {
        actionButtonHTML = `
            <div style="text-align:center; font-size:0.85rem; color:#cbd5e1; font-style:italic; padding:10px 0;">⏳ Chờ chủ phòng bắt đầu trận đấu...</div>
        `;
    }

    el.innerHTML = `
        <div style="background:linear-gradient(135deg, #1b162b, #0f0b18); border:2px solid #6366f1; border-radius:16px; padding:28px; text-align:center; width:340px; box-shadow:0 0 30px rgba(99,102,241,0.4);">
            <div style="font-size:2.8rem; margin-bottom:10px;">🎮</div>
            <div style="font-weight:bold; font-size:1.3rem; color:#a5b4fc; margin-bottom:4px;">PHÒNG CHỜ TRẬN ĐẤU</div>
            <div style="font-size:0.8rem; color:#818cf8; margin-bottom:20px; background:rgba(99,102,241,0.1); padding:4px 8px; border-radius:6px; display:inline-block;">Mã phòng: ${roomId}</div>
            
            <div style="background:rgba(255,255,255,0.03); border-radius:10px; padding:12px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05); text-align:left;">
                <div style="font-size:0.85rem; font-weight:bold; color:#a5b4fc; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:8px;">👥 Danh sách thành viên:</div>
                <div style="font-size:0.9rem; margin-bottom:6px; color:#22c55e;">👑 Chủ phòng: ${window.boardLobbyData.hostName}</div>
                <div style="font-size:0.9rem; color:${window.boardLobbyData.guestName ? '#38bdf8' : '#aaa'};">${guestLabel}</div>
            </div>
            
            ${botSelectorHTML}
            
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                ${actionButtonHTML}
                <button class="btn" style="background:#ef4444; border:none; padding:8px 16px; font-size:0.85rem; color:#fff; border-radius:8px; cursor:pointer;" onclick="window.boardLobbyCancel()">❌ Thoát phòng</button>
            </div>
        </div>
    `;
};

window.boardLobbyChangeBot = function(val) {
    const count = parseInt(val) || 0;
    window.boardLobbyData.botCount = count;
    // Broadcast update to Guest
    if (typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: 'BOARD_ROOM_LOBBY_UPDATE',
            roomId: window.boardOnlineRoomId,
            id: getMyNetworkId(),
            hostName: window.boardLobbyData.hostName,
            guestName: window.boardLobbyData.guestName,
            botCount: count
        });
    }
};

window.boardLobbyCancel = function() {
    // Refund gold if Host
    if (window.boardOnlineRole === 'host' && window.boardLobbyData && window.boardLobbyData.betAmount > 0) {
        if (window.player) {
            window.player.gold += window.boardLobbyData.betAmount;
            if (typeof boardRefreshHud === 'function') boardRefreshHud();
        }
    }
    
    // Clear intervals
    if (window.boardRoomPingInterval) {
        clearInterval(window.boardRoomPingInterval);
        window.boardRoomPingInterval = null;
    }
    
    // Notify room leave if PVP
    if (typeof pvpChannel !== 'undefined' && window.boardOnlineRoomId) {
        pvpChannel.postMessage({
            type: 'BOARD_ROOM_LEAVE',
            roomId: window.boardOnlineRoomId,
            id: getMyNetworkId(),
            role: window.boardOnlineRole
        });
    }

    window.boardOnlineRoomId = null;
    window.boardOnlineRole = null;
    
    const el = document.getElementById('boardLobbyOverlay');
    if (el) el.style.display = 'none';
};

window.boardLobbyStartMatch = function() {
    if (window.boardOnlineRole !== 'host') return;
    
    // Clear Host presence ping interval to stop broadcasting lobby ping
    if (window.boardRoomPingInterval) {
        clearInterval(window.boardRoomPingInterval);
        window.boardRoomPingInterval = null;
    }
    
    // Start match locally as host
    const roomData = {
        hostName: window.boardLobbyData.hostName,
        guestName: window.boardLobbyData.guestName,
        betAmount: window.boardLobbyData.betAmount || 0,
        hostId: getMyNetworkId(),
        guestId: window.boardLobbyData.guestId,
        botCount: window.boardLobbyData.botCount
    };
    
    // Start game state
    boardStartOnlineMatch('host', roomData);
    
    // Close Lobby Overlay
    const el = document.getElementById('boardLobbyOverlay');
    if (el) el.style.display = 'none';
    
    // Broadcast BOARD_ROOM_START with state and botCount
    if (typeof window.pvpChannel !== 'undefined') {
        window.pvpChannel.postMessage({
            type: 'BOARD_ROOM_START',
            id: getMyNetworkId(),
            roomId: window.boardOnlineRoomId,
            guestId: window.boardLobbyData.guestId,
            hostId: getMyNetworkId(),
            hostName: window.boardLobbyData.hostName,
            guestName: window.boardLobbyData.guestName,
            betAmount: window.boardLobbyData.betAmount || 0,
            botCount: window.boardLobbyData.botCount,
            colors: window.boardGameColors,
            boardState: JSON.parse(JSON.stringify(boardGame))
        });
    }
};

window.boardQuickJoinRoom = function(roomId) {
    const playerName = (window.player && window.player.name) ? window.player.name : 'Anh Hùng';
    window.boardOnlineRole = 'guest';
    window.boardOnlineRoomId = roomId;
    
    // Set lobby data and open lobby UI for Guest
    window.boardLobbyData = {
        hostName: 'Chủ phòng',
        guestName: playerName,
        guestId: getMyNetworkId(),
        botCount: 2
    };
    window.boardShowLobbyUI(roomId, 'guest');

    // Notify Host we joined
    if (typeof window.pvpChannel !== 'undefined') {
        window.pvpChannel.postMessage({
            type: 'BOARD_ROOM_JOIN',
            id: getMyNetworkId(),
            roomId: roomId,
            guestId: getMyNetworkId(),
            guestName: playerName
        });
    }
};

window.boardHostOnlineRoom = async function() {
    try {
        let betAmt = window._selectedBetAmount || 0;
        const customInp = document.getElementById('customBetAmount');
        if(customInp && customInp.value) {
            betAmt = parseInt(customInp.value) || 0;
        }
        const currentGold = (window.player && typeof window.player.gold !== 'undefined') ? window.player.gold : 150;
        if (currentGold < betAmt) {
            if (typeof showToast === 'function') showToast('⚠️ Không đủ vàng để cược!');
            else alert('⚠️ Không đủ vàng để cược!');
            return;
        }

        const playerName = (window.player && window.player.name) ? window.player.name : 'Anh Hùng';
        const defaultRoomName = 'board_' + playerName;
        const roomId = prompt('🔑 Nhập mã phòng Cờ Đua của bạn:', defaultRoomName);
        if (!roomId) return;

        // Deduct bet amount upfront
        if (window.player) window.player.gold -= betAmt;
        if (typeof boardRefreshHud === 'function') boardRefreshHud();
        if (typeof window.closeBetModal === 'function') window.closeBetModal();

        window.boardOnlineRole = 'host';
        window.boardOnlineRoomId = roomId;
        
        window.boardLobbyData = {
            hostName: playerName,
            guestName: '',
            guestId: null,
            betAmount: betAmt,
            botCount: 2
        };

        if (window.boardRoomPingInterval) clearInterval(window.boardRoomPingInterval);

        window.boardRoomPingInterval = setInterval(() => {
            if (!window.boardOnlineRoomId || window.boardOnlineRole !== 'host') return;
            if (typeof window.pvpChannel !== 'undefined') {
                window.pvpChannel.postMessage({
                    type: 'BOARD_ROOM_PING',
                    id: getMyNetworkId(),
                    roomId: window.boardOnlineRoomId,
                    hostId: getMyNetworkId(),
                    hostName: playerName,
                    betAmount: betAmt
                });
            }
        }, 1500);

        // Open Lobby UI
        window.boardShowLobbyUI(roomId, 'host');
    } catch(err) {
        console.error('[boardHostOnlineRoom Error]', err);
        alert('❌ Lỗi khi tạo phòng Online: ' + err.message);
    }
};

window.boardJoinOnlineRoom = async function() {
    try {
        const roomId = prompt('🔑 Nhập mã phòng cờ bạn muốn tham gia:');
        if (!roomId) return;

        window.boardQuickJoinRoom(roomId);
    } catch(err) {
        console.error('[boardJoinOnlineRoom Error]', err);
        alert('❌ Lỗi khi vào phòng Online: ' + err.message);
    }
};

window.boardRegisterNetworkMessage = function(msg) {
    if (!msg) return;
    try {
        const playerName = (window.player && window.player.name) ? window.player.name : 'Anh Hùng';

        // Host receives roll request from Guest, rolls and broadcasts
        if (msg.type === 'BOARD_ROLL_REQUEST' && window.boardOnlineRoomId === msg.roomId && window.boardOnlineRole === 'host') {
            window.boardRollForCurrentPlayer();
        }

        if (msg.type === 'BOARD_ROOM_PING') {
            window.boardActiveRooms = window.boardActiveRooms || {};
            window.boardActiveRooms[msg.roomId] = {
                roomId: msg.roomId,
                hostName: msg.hostName,
                betAmount: msg.betAmount,
                lastSeen: Date.now()
            };
            if (typeof window.boardRenderActiveRoomsList === 'function') {
                window.boardRenderActiveRoomsList();
            }
        }

        // Guest hears host ping, checks bet amount, and replies with join request
        if (msg.type === 'BOARD_ROOM_PING' && window.boardOnlineRoomId === msg.roomId && window.boardOnlineRole === 'guest') {
            const betAmt = msg.betAmount || 0;
            const currentGold = (window.player && typeof window.player.gold !== 'undefined') ? window.player.gold : 150;
            if (currentGold < betAmt) {
                alert(`⚠️ Bạn không đủ vàng! Cần ít nhất ${betAmt} vàng để tham gia.`);
                window.boardOnlineRoomId = null;
                window.boardOnlineRole = null;
                if (typeof mcHideOnlineStatus === 'function') mcHideOnlineStatus();
                return;
            }

            // Deduct bet amount
            if (window.player) window.player.gold -= betAmt;
            if (typeof boardRefreshHud === 'function') boardRefreshHud();
            if (typeof window.closeBetModal === 'function') window.closeBetModal();

            if (typeof window.pvpChannel !== 'undefined') {
                window.pvpChannel.postMessage({
                    type: 'BOARD_ROOM_JOIN',
                    id: getMyNetworkId(),
                    roomId: window.boardOnlineRoomId,
                    guestId: getMyNetworkId(),
                    guestName: playerName,
                    betAmount: betAmt
                });
            }
        }

        // Host receives guest join, updates lobby UI and notifies Guest
        if (msg.type === 'BOARD_ROOM_JOIN' && window.boardOnlineRoomId === msg.roomId && window.boardOnlineRole === 'host') {
            // Ignore join request if the match has already started (lobby overlay is closed)
            const el = document.getElementById('boardLobbyOverlay');
            if (!el || el.style.display === 'none') {
                return;
            }

            window.boardLobbyData.guestName = msg.guestName;
            window.boardLobbyData.guestId = msg.guestId;
            
            // Refresh Host Lobby UI (enables Start button)
            window.boardShowLobbyUI(window.boardOnlineRoomId, 'host');
            
            // Send Lobby update to Guest containing hostName, guestName, botCount, etc.
            if (typeof window.pvpChannel !== 'undefined') {
                window.pvpChannel.postMessage({
                    type: 'BOARD_ROOM_LOBBY_UPDATE',
                    roomId: window.boardOnlineRoomId,
                    id: getMyNetworkId(),
                    hostName: playerName,
                    guestName: msg.guestName,
                    botCount: window.boardLobbyData.botCount
                });
            }
        }

        // Guest receives lobby details from Host
        if (msg.type === 'BOARD_ROOM_LOBBY_UPDATE' && window.boardOnlineRoomId === msg.roomId) {
            if (window.boardOnlineRole === 'guest') {
                window.boardLobbyData.hostName = msg.hostName;
                window.boardLobbyData.guestName = msg.guestName;
                window.boardLobbyData.botCount = msg.botCount;
                window.boardShowLobbyUI(window.boardOnlineRoomId, 'guest');
            }
        }

        // Handles room exits / cancels from lobby
        if (msg.type === 'BOARD_ROOM_LEAVE' && window.boardOnlineRoomId === msg.roomId) {
            if (msg.role === 'host') {
                alert('⚠️ Chủ phòng đã hủy phòng chờ.');
                window.boardOnlineRoomId = null;
                window.boardOnlineRole = null;
                const el = document.getElementById('boardLobbyOverlay');
                if (el) el.style.display = 'none';
            } else if (msg.role === 'guest') {
                if (window.boardOnlineRole === 'host') {
                    window.boardLobbyData.guestName = '';
                    window.boardLobbyData.guestId = null;
                    window.boardShowLobbyUI(window.boardOnlineRoomId, 'host');
                }
            }
        }

        // Guest receives start event, starts the match
        if (msg.type === 'BOARD_ROOM_START' && window.boardOnlineRoomId === msg.roomId && window.boardOnlineRole === 'guest') {
            if (msg.guestId !== getMyNetworkId()) return;
            
            // Close Lobby Overlay
            const el = document.getElementById('boardLobbyOverlay');
            if (el) el.style.display = 'none';

            const roomData = {
                hostName: msg.hostName,
                guestName: msg.guestName,
                betAmount: msg.betAmount,
                hostId: msg.hostId,
                guestId: msg.guestId,
                colors: msg.colors,
                botCount: msg.botCount
            };
            boardStartOnlineMatch('guest', roomData);

            // Sync initial state
            boardSyncOnlineState(msg);
        }

        // Both sync state during the match
        if (msg.type === 'BOARD_ROOM_STATE' && window.boardOnlineRoomId === msg.roomId) {
            if (msg.lastActionBy === window.boardOnlineRole) return;
            boardSyncOnlineState(msg);
        }

        // Synchronize roll and walk animation on guest/other tab
        if (msg.type === 'BOARD_PVP_ROLL_EVENT' && window.boardOnlineRoomId === msg.roomId) {
            if (window.boardOnlineRole === 'guest') {
                let cur = boardGame.players[msg.playerId];
                if (cur) {
                    boardGame.isRolling = true;
                    window.boardUpdateRollBtn();
                    if (window.boardScrollToCurrentPlayer) {
                        window.boardScrollToCurrentPlayer(msg.playerId);
                    }
                    window.boardDoRollAnimation(cur, () => {
                        boardGame.isRolling = false;
                        window.boardUpdateRollBtn();
                    }, msg.rollValue);
                }
            }
        }

        // Synchronize big notice popups (including bot alerts)
        if (msg.type === 'BOARD_PVP_BIG_NOTICE' && window.boardOnlineRoomId === msg.roomId) {
            if (window.boardOnlineRole === 'guest') {
                window.boardShowBigNoticeLocal(msg.title, msg.desc, msg.extra, null, msg.persist);
            }
        }
    } catch (err) {
        console.error('[boardRegisterNetworkMessage Error]', err);
    }
};

window.boardStartOnlineMatch = function(role, room) {
    // Shuffle the master deck for a completely randomized card distribution this match
    if (typeof window.boardShuffleDeck === 'function') {
        window.boardShuffleDeck();
    }

    // Reset local boardGame state
    boardGame = {
        players: [], currentTurn: 0, isRolling: false,
        trappedCells: {}, log: [], gameOver: false,
        revealedCells: { 0: true, [BOARD_TOTAL_CELLS - 1]: true },
        pvp: true, hostId: (role === 'host') ? getMyNetworkId() : (room.hostId || 'host_id_placeholder'),
        betPool: (room.betAmount || 0) * 2,
        cellZones: []
    };

    // Randomize cell zones symmetrically (host does it)
    if (role === 'host') {
        for (let i = 0; i < BOARD_TOTAL_CELLS; i++) {
            boardGame.cellZones.push(NEIGHBORHOOD_NAMES[Math.floor(Math.random() * NEIGHBORHOOD_NAMES.length)]);
        }
        for (let i = 5; i < BOARD_TOTAL_CELLS - 5; i++) {
            if (Math.random() < 0.15) {
                boardGame.trappedCells[i] = true;
            }
        }
    }

    // Shuffled match colors
    const gameColors = room.colors || [...RACE_PLAYER_COLORS];
    window.boardGameColors = gameColors;

    // Add Host (idx 0)
    boardGame.players.push({
        idx: 0, name: room.hostName + ' (Trâu)', networkId: (role === 'host') ? getMyNetworkId() : (room.hostId || 'host_net_id'),
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: gameColors[0], emoji: '👦', isHuman: (role === 'host'), isBot: false, gold: 0,
        hand: boardDealHand(5)
    });

    // Add Guest (idx 1)
    boardGame.players.push({
        idx: 1, name: room.guestName + ' (Trẩu)', networkId: (role === 'guest') ? getMyNetworkId() : (room.guestId || 'guest_net_id'),
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: gameColors[1], emoji: '👾', isHuman: (role === 'guest'), isBot: false, gold: 0,
        hand: boardDealHand(5)
    });

    // Add bots to fill up remaining slots based on botCount selection
    const botNames = ['Mầm Mềm Mẽ', 'Kiến Bảo Vệ'];
    const botEmojis = ['👩‍🦰', '👮‍♂️'];
    const botCount = typeof room.botCount === 'number' ? room.botCount : 2;
    for (let i = 0; i < botCount; i++) {
        boardGame.players.push({
            idx: 2 + i, name: botNames[i], networkId: null,
            pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
            color: gameColors[2 + i] || '#f59e0b', emoji: botEmojis[i],
            isHuman: false, isBot: true, skipTurn: false,
            hand: boardDealHand(5), gold: 0
        });
    }

    document.getElementById('boardGameModal').classList.add('active');
    boardAddLog(`🏁 CỜ ĐUA ONLINE BẮT ĐẦU! Cược cự ly: ${room.betAmount}g. Tổng cược: ${boardGame.betPool}g.`, 'special');

    if (role === 'host') {
        boardPushOnlineState();
    }
    
    boardRenderGrid();
    boardRenderPlayers();
    boardUpdateRollBtn();
};

window.boardPushOnlineState = function() {
    if (!window.boardOnlineRoomId || !boardGame) return;
    if (typeof window.pvpChannel !== 'undefined') {
        window.pvpChannel.postMessage({
            type: 'BOARD_ROOM_STATE',
            id: getMyNetworkId(),
            roomId: window.boardOnlineRoomId,
            lastActionBy: window.boardOnlineRole,
            boardState: JSON.parse(JSON.stringify(boardGame)),
            diceText: document.getElementById('diceResultText')?.textContent || '',
            diceEmoji: document.getElementById('diceDisplay')?.textContent || '',
            cardHtml: document.getElementById('boardCardDisplay')?.innerHTML || ''
        });
    }
};

window.boardSyncOnlineState = function(room) {
    const bs = room.boardState;
    if (!bs) return;

    boardGame = bs;

    // Symmetrically map isHuman / isBot
    boardGame.players.forEach((p, idx) => {
        p.idx = idx;
        p.isHuman = (p.networkId === getMyNetworkId() || (window.boardOnlineRole === 'host' && idx === 0) || (window.boardOnlineRole === 'guest' && idx === 1));
    });

    if (room.diceText) document.getElementById('diceResultText').textContent = room.diceText;
    if (room.diceEmoji) document.getElementById('diceDisplay').textContent = room.diceEmoji;
    if (room.cardHtml) document.getElementById('boardCardDisplay').innerHTML = room.cardHtml;

    if (typeof window.boardSyncView === 'function') window.boardSyncView();
    else { boardRenderGrid(); boardRenderPlayers(); boardUpdateRollBtn(); }
    window.boardFocusPawn(boardGame.currentTurn);
};

// Wrap boardRenderPlayers to trigger state push automatically
const origBoardRender = window.boardRenderPlayers;
window.boardRenderPlayers = function() {
    if (origBoardRender) origBoardRender.apply(this, arguments);
    if (window.boardOnlineRoomId && boardGame) {
        let cur = boardGame.players[boardGame.currentTurn];
        if (cur) {
            const isOurTurn = cur.networkId === getMyNetworkId() || (window.boardOnlineRole === 'host' && boardGame.currentTurn === 0) || (window.boardOnlineRole === 'guest' && boardGame.currentTurn === 1);
            const isHostHandlingBot = (window.boardOnlineRole === 'host' && cur.isBot);
            if (isOurTurn || isHostHandlingBot) {
                boardPushOnlineState();
            }
        }
    }
};

// Wrap closeBoardGame to handle cleanup
const origCloseBoardGame = window.closeBoardGame;
window.closeBoardGame = function() {
    if (origCloseBoardGame) origCloseBoardGame.apply(this, arguments);
    if (window.boardOnlineRoomId) {
        clearInterval(window.boardRoomPingInterval);
        window.boardOnlineRoomId = null;
        window.boardOnlineRole = null;
    }
};



