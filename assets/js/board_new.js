// ===== 🏁 BOARD_NEW.JS — Cờ Đua Sinh Tồn v4.0 (Yu-Gi-Oh Style) =====
'use strict';

// Resolve myNetworkId and networkPlayers globally
if (!('myNetworkId' in window)) {
    Object.defineProperty(window, 'myNetworkId', {
        get() { return window._myNetworkId; },
        set(v) { window._myNetworkId = v; },
        configurable: true
    });
}
if (!('networkPlayers' in window)) {
    Object.defineProperty(window, 'networkPlayers', {
        get() { return window._networkPlayers; },
        set(v) { window._networkPlayers = v; },
        configurable: true
    });
}

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
    
    // Highlight selected card
    document.querySelectorAll('.char-card').forEach((card, i) => {
        if (i === idx) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    window.boardUpdateCharPanel();
};

window.boardUpdateCharPanel = function() {
    if (!boardGame || !boardGame.players) return;
    let p = boardGame.players[window.boardSelectedCharDisplayIdx];
    if (!p) return;
    
    const livesEl = document.getElementById('boardInfoLives');
    const weaponsEl = document.getElementById('boardInfoWeapons');
    const shieldsEl = document.getElementById('boardInfoShields');
    const goldEl = document.getElementById('boardInfoGold');
    
    if (livesEl) livesEl.innerHTML = p.eliminated ? '<span style="color:#ef4444;font-weight:bold;font-size:0.75rem;">ĐÃ CHẾT</span>' : '❤️'.repeat(p.lives);
    if (weaponsEl) weaponsEl.textContent = p.weapons;
    if (shieldsEl) shieldsEl.textContent = p.shields;
    if (goldEl) {
        goldEl.textContent = p.gold !== undefined ? p.gold : 0;
    }
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
    { id: 'soi', name: "Sói Xám Đột Biến", type: 'monster', rarity: 'common', desc: "Gặp sói xám đột biến chực ăn thịt! Mất 1 mạng nếu tay không bắt giặc.", reward: 30, damage: 1,
      effect: function(p) { return boardFightMonster(p, this); } },
    { id: 'cuongthi', name: "Cương Thi Làng", type: 'monster', rarity: 'rare', desc: "Cương Thi đói bụng nhảy tưng tưng đòi cắn! Cần 1 Vũ Khí phòng thân.", reward: 50, damage: 1,
      effect: function(p) { return boardFightMonster(p, this); } },
    { id: 'rong', name: "Rồng Lửa Cổ Đại", type: 'monster', rarity: 'epic', desc: "Boss Rồng Lửa khè khói mù mịt! Trừ 2 mạng nếu không có hàng nóng/nắp vung chống đỡ.", reward: 100, damage: 2,
      effect: function(p) { return boardFightMonster(p, this); } },

    // 🗡️ EQUIP (Trang bị - chỉ mua ở cửa hàng hoặc nhặt ngẫu nhiên trên ô)
    { id: 'kiem', name: "Kiếm Sắt Xóm", type: 'equip', rarity: 'common', desc: "Lượm được Đồ Long Đao bằng sắt vụn! Nhận 1 🗡️ Vũ Khí.", value: 1,
      effect: function(p) { p.weapons += this.value; return `Nhặt được Kiếm! (+${this.value} 🗡️)`; } },
    { id: 'cung', name: "Cung Gỗ Trắc", type: 'equip', rarity: 'common', desc: "Nhặt được Cung thần tình yêu! Nhận 1 🗡️ Vũ Khí.", value: 1,
      effect: function(p) { p.weapons += this.value; return `Lượm được Cung! (+${this.value} 🗡️)`; } },
    { id: 'khien_go', name: "Khiên Gỗ Mộc", type: 'equip', rarity: 'common', desc: "Nhặt được nắp vung nồi cũ làm khiên! Nhận 1 🛡️ Khiên.", value: 1,
      effect: function(p) { p.shields += this.value; return `Nhặt được Khiên gỗ! (+${this.value} 🛡️)`; } },
    { id: 'khien_thep', name: "Khiên Thép Đen", type: 'equip', rarity: 'rare', desc: "Nhặt được khiên sắt cực xịn! Nhận 1 🛡️ Khiên.", value: 1,
      effect: function(p) { p.shields += this.value; return `Nhận Khiên thép! (+${this.value} 🛡️)`; } },
    { id: 'cuuthuong', name: "Hộp Cứu Thương", type: 'equip', rarity: 'epic', desc: "Hồi 1 ❤️ Mạng (Tối đa 3).", value: 1,
      effect: function(p) { if(p.lives < 3) { p.lives += this.value; return `Hồi ${this.value} ❤️!`; } return 'Máu đang đầy.'; } },

    // 🌪️ FUN SPELL (Bài ma pháp vui nhộn phát trên tay khi bắt đầu game)
    { id: 'cuongphong', name: "Cuồng Phong", type: 'fun_spell', rarity: 'common', desc: "Gió thổi bay màu! Tiến thẳng 3 ô.", value: 3,
      effect: function(p) { boardMovePlayer(p.idx, this.value, true); return `Tiến thẳng ${this.value} ô.`; } },
    { id: 'ruongvang', name: "Rương Vàng", type: 'fun_spell', rarity: 'rare', desc: "+50 Vàng nóng.", value: 50,
      effect: function(p) { p.gold = (p.gold || 0) + this.value; if(p.isHuman) { boardRefreshHud(); } return `Nhận ${this.value} vàng.`; } },
    { id: 'dichchuyen', name: "Dịch Chuyển Không Gian", type: 'fun_spell', rarity: 'epic', desc: "Hoán đổi vị trí của bạn với đứa gần nhất.",
      effect: function(p) { return boardSwapNearest(p); } },
    { id: 'vochuoi', name: "Vỏ Chuối Trơn Trượt", type: 'fun_spell', rarity: 'common', desc: "Ném vỏ chuối làm đứa đứng gần nhất trượt chân lùi 3 ô.",
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
              return `Ném vỏ chuối vào chân ${nearest.name}, khiến họ giật lùi 3 ô!`;
          }
          return 'Không có đối thủ nào gần bên để ném vỏ chuối.';
      } 
    },
    { id: 'tromvang', name: "Ăn Trộm Tiền Lẻ", type: 'fun_spell', rarity: 'rare', desc: "Trộm 40 vàng của đối thủ gần nhất.",
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
              return `Móc túi thành công ${stolen} vàng từ ví của ${nearest.name}!`;
          }
          return 'Không có ai để trộm vàng.';
      }
    },
    { id: 'sieuquay', name: "Bùa Ngủ Gật Troll", type: 'fun_spell', rarity: 'rare', desc: "Dán bùa ngủ gật làm đứa đi kế tiếp mất lượt tiếp theo.",
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
              return `Dán bùa ngủ gật lên trán ${target.name}, khiến họ mất lượt tiếp theo!`;
          }
          return 'Không có mục tiêu ngủ gật.';
      }
    },
    { id: 'giasam', name: "Bão Thổi Ngược", type: 'fun_spell', rarity: 'rare', desc: "Tạo bão xoáy thổi ngược đứa dẫn đầu lùi 4 ô.",
      effect: function(p) {
          const leading = boardGame.players.filter(x=>!x.eliminated && x.idx !== p.idx).reduce((a,b) => a.pos > b.pos ? a : b, null);
          if (leading) {
              boardMovePlayer(leading.idx, -4, true);
              return `Tạo bão thổi bay ${leading.name} lùi lại 4 ô!`;
          }
          return 'Không có ai dẫn đầu để thổi gió.';
      }
    },
    { id: 'boombip', name: "Bom Khói Hài Hước", type: 'fun_spell', rarity: 'common', desc: "Ném quả bom khói hài hước khiến một đối thủ ngẫu nhiên lùi 2 ô.",
      effect: function(p) {
          let targets = boardGame.players.filter(x => !x.eliminated && x.idx !== p.idx);
          if (targets.length > 0) {
              let target = targets[Math.floor(Math.random() * targets.length)];
              boardMovePlayer(target.idx, -2, true);
              return `Ném bom khói khiến ${target.name} sặc sụa và đi lùi 2 ô!`;
          }
          return 'Không có ai để ném bom.';
      }
    },
    { id: 'tocbientuong', name: "Bùa Tốc Biến Ẩn Danh", type: 'fun_spell', rarity: 'rare', desc: "Sử dụng phép ẩn danh giúp bạn tiến ngẫu nhiên từ 1 đến 5 ô.",
      effect: function(p) {
          let steps = 1 + Math.floor(Math.random() * 5);
          boardMovePlayer(p.idx, steps, true);
          return `Tốc biến kỳ ảo! Tiến thẳng lên ${steps} ô.`;
      }
    },
    { id: 'trollportal', name: "Cổng Dịch Chuyển Troll", type: 'fun_spell', rarity: 'epic', desc: "Mở cổng không gian bay thẳng đến đứng chung ô với đứa dẫn đầu.",
      effect: function(p) {
          const leading = boardGame.players.filter(x=>!x.eliminated && x.idx !== p.idx).reduce((a,b) => a.pos > b.pos ? a : b, null);
          if (leading && leading.pos > p.pos) {
              p.pos = leading.pos;
              return `Dịch chuyển bay vèo tới đứng chung ô với ${leading.name} (ô số ${p.pos+1})!`;
          }
          return 'Bạn đang dẫn đầu hoặc không tìm thấy mục tiêu phù hợp.';
      }
    },

    // 🌪️ SPELL (Ma pháp môi trường vẽ trên ô)
    { id: 'locxoay', name: "Lốc Xoáy", type: 'spell', rarity: 'common', desc: "Lùi cắm đầu 2 ô.", value: -2,
      effect: function(p) { boardMovePlayer(p.idx, this.value, true); return `Lùi lại ${Math.abs(this.value)} ô.`; } },

    // 💣 TRAP (Cạm bẫy)
    { id: 'trap_ho', name: "Hố Chông Trừng Phạt", type: 'trap', rarity: 'rare', desc: "Mất 1 mạng tại chỗ.", damage: 1,
      effect: function(p) { return boardTakeDamage(p, this.damage, "lọt hố chông"); } },
    { id: 'trap_set', name: "Sét Đánh", type: 'trap', rarity: 'epic', desc: "Sét đánh trúng đứa dẫn đầu làm mất 1 mạng.", damage: 1,
      effect: function(p) {
          const L = boardGame.players.filter(x=>!x.eliminated).reduce((a,b) => a.pos > b.pos ? a : b, null); 
          if(L) return boardTakeDamage(L, this.damage, "bị sét đánh"); 
          return 'Sét đánh hụt.';
      } 
    }
];

// Hàm Xử lý Đánh Quái (Tự động)
function boardFightMonster(p, card) {
    const mName = card.name;
    const reward = card.reward || 30;
    const damage = card.damage || 1;
    if (p.weapons > 0) {
        p.weapons--;
        p.gold = (p.gold || 0) + reward;
        if(p.isHuman) boardRefreshHud();
        return `Dùng hàng nóng 🗡️ vả sml ${mName}! Húp trọn ${reward}💰 thưởng.`;
    } else {
        return boardTakeDamage(p, damage, `bị ${mName} cắn cụt mông`);
    }
}

// Hàm Xử lý Mất Mạng
function boardTakeDamage(p, amount, reason) {
    if (p.shields > 0) {
        p.shields--;
        return `🛡️ Nắp vung (Khiên) đã chặn thành công đòn chí tử (${reason})!`;
    }
    p.lives -= amount;
    if (p.lives <= 0) {
        p.eliminated = true;
        boardAddLog(`💀 ${p.name} ăn hành quá nhiều và ĐÃ BÊN KIA THẾ GIỚI!`, 'win');
        return `💀 Hết mạng! BẠN ĐÃ ĐĂNG XUẤT KHỎI TRÁI ĐẤT!`;
    }
    return `💔 Mất ${amount} mạng vì ${reason}! (Còn ${p.lives}❤️)`;
}

// ── Vẽ thẻ bài 3D ─────────────────────────────────────────────
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
    
    let result = card.effect(p);
    
    const badgeClass  = `badge-${card.rarity}`;
    const typeIcon = card.type === 'monster' ? '👾' : card.type === 'equip' ? '🛡️' : card.type === 'trap' ? '💣' : '🌪️';

    document.getElementById('boardCardDisplay').innerHTML = `
        <div class="drawn-card card-3d-flip ${card.type}-card">
            <span class="card-rarity-badge ${badgeClass}">${card.rarity.toUpperCase()}</span>
            <div style="font-size:1.4rem;margin:8px 0;">${typeIcon} ${card.name}</div>
            <div style="font-size:0.8rem;color:#cbd5e1;padding:4px;">${card.desc}</div>
            <div style="font-size:0.75rem;color:#fbbf24;margin-top:6px;font-weight:bold;">👉 ${result}</div>
        </div>`;
    boardAddLog(`🃏 ${p.name} lật: [${card.name}] — ${result}`, 'card');
    
    window.boardShowBigNotice(
        `${typeIcon} ${card.name}`, 
        `Rút thẻ ở <b>${reason}</b><br><br><span style="color:#fcd34d">${card.desc}</span>`, 
        `👉 ${result}`, 
        callback
    );
};

// ── Hoạt ảnh xúc xắc ──────────────────────────────────────────
window.boardDoRollAnimation = function(boardPlayer, callback) {
    const diceEl  = document.getElementById('diceDisplay');
    const resultEl = document.getElementById('diceResultText');
    const roll = 1 + Math.floor(Math.random() * 6);
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
        boardAddLog(`😴 ${p.name} mất lượt!`);
        window.boardShowBigNotice("😴 Ngủ gật", `${p.name} bị mất lượt này!`, "", () => {
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
            boardAddLog(`🎲 ${p.name} di chuyển nhanh ${steps} bước (ẩn tab).`);
        }
        
        let cellName = NEIGHBORHOOD_NAMES[p.pos % NEIGHBORHOOD_NAMES.length];
        
        const finalizeTurn = () => {
            const alive = boardGame.players.filter(x => !x.eliminated);
            if (alive.length === 1 && boardGame.players.length > 1) {
                boardGame.gameOver = true;
                let prize = 200 + (boardGame.betPool||0);
                boardAddLog(`🏆 Tất cả đối thủ đã chết! ${alive[0].name} SỐNG SÓT VÀ CHIẾN THẮNG!`, 'win');
                if (alive[0].networkId === myNetworkId || alive[0].isHuman) {
                    player.gold += prize;
                    boardRefreshHud();
                }
            }
            boardRenderGrid(); 
            boardRenderPlayers();
            if(callback) callback();
        };

        const handleWinOrCard = () => {
            if(p.pos >= BOARD_TOTAL_CELLS - 1) {
                boardGame.gameOver = true;
                let prize = boardGame.betPool || 0;
                if(p.networkId === myNetworkId || p.isHuman) {
                    player.gold += (200 + prize);
                    boardRefreshHud();
                }
                boardAddLog(`🏆 ${p.name} đã cán ĐÍCH ĐẦU TIÊN!`, 'win');
                finalizeTurn();
            } else {
                if (typeof SHOP_ZONES !== 'undefined' && SHOP_ZONES.includes(cellName)) {
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
                    boardAddLog(`🏆 Tất cả đối thủ đã chết! ${alive[0].name} SỐNG SÓT VÀ CHIẾN THẮNG!`, 'win');
                    if (alive[0].networkId === myNetworkId || alive[0].isHuman) {
                        player.gold += prize;
                        boardRefreshHud();
                    }
                }
                boardRenderGrid(); 
                boardRenderPlayers();
                if(callback) callback();
            };
            const handleWinOrCard = () => {
                if(p.pos >= BOARD_TOTAL_CELLS - 1) {
                    boardGame.gameOver = true;
                    let prize = boardGame.betPool || 0;
                    if(p.networkId === myNetworkId || p.isHuman) {
                        player.gold += (200 + prize);
                        boardRefreshHud();
                    }
                    boardAddLog(`🏆 ${p.name} đã cán ĐÍCH ĐẦU TIÊN!`, 'win');
                    finalizeTurn();
                } else {
                    if (typeof SHOP_ZONES !== 'undefined' && SHOP_ZONES.includes(cellName)) {
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

                let cellName = NEIGHBORHOOD_NAMES[p.pos % NEIGHBORHOOD_NAMES.length];

                const finalizeTurn = () => {
                    const alive = boardGame.players.filter(x => !x.eliminated);
                    if(alive.length === 1 && boardGame.players.length > 1) {
                        boardGame.gameOver = true;
                        let prize = 200 + (boardGame.betPool||0);
                        boardAddLog(`🏆 Tất cả đối thủ đã chết! ${alive[0].name} SỐNG SÓT VÀ CHIẾN THẮNG!`, 'win');
                        if(alive[0].networkId === myNetworkId || alive[0].isHuman) {
                            player.gold += prize;
                            boardRefreshHud();
                        }
                        window.boardShowBigNotice("🏆 CHIẾN THẮNG", `${alive[0].name} là người sống sót cuối cùng!`, `Thưởng: ${prize} 🪙<br><br><span style="color:#22c55e;font-size:0.9rem;">(Chạm để tiếp tục)</span>`, () => {}, true);
                    }
                    boardRenderGrid(); 
                    boardRenderPlayers();
                    if(callback) callback();
                };

                const handleWinOrCard = () => {
                    if(p.pos >= BOARD_TOTAL_CELLS - 1) {
                        boardGame.gameOver = true;
                        let prize = boardGame.betPool || 0;
                        if(p.networkId === myNetworkId || p.isHuman) {
                            player.gold += (200 + prize);
                            boardRefreshHud();
                        }
                        boardAddLog(`🏆 ${p.name} đã cán ĐÍCH ĐẦU TIÊN!`, 'win');
                        window.boardShowBigNotice("🏆 CHIẾN THẮNG", `${p.name} đã cán đích an toàn!`, `Thưởng: ${200 + prize} 🪙<br><br><span style="color:#22c55e;font-size:0.9rem;">(Chạm để tiếp tục)</span>`, finalizeTurn, true);
                        try { audio.play('levelup'); } catch(e){}
                    } else {
                        if (typeof SHOP_ZONES !== 'undefined' && SHOP_ZONES.includes(cellName)) {
                            boardHandleShop(p, cellName, finalizeTurn);
                        } else {
                            boardDrawRandomCard(p, cellName, finalizeTurn);
                        }
                    }
                };

                const handleCombat = () => {
                    boardHandleCombat(p, (combatLog) => {
                        if(combatLog) {
                            window.boardShowBigNotice("⚔️ ĐỤNG ĐỘ", combatLog, `Khu vực: ${cellName}`, handleWinOrCard);
                        } else {
                            handleWinOrCard();
                        }
                    });
                };

                if(boardGame.trappedCells[p.pos]) {
                    delete boardGame.trappedCells[p.pos];
                    boardAddLog(`💣 ${p.name} dẫm bẫy! Lùi 3 ô!`, 'special');
                    boardMovePlayer(p.idx, -3, true);
                    window.boardShowBigNotice("💣 DẪM BẪY!", `${p.name} dẫm phải bẫy ở ${cellName} và bị lùi 3 ô!`, "", handleCombat);
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
            boardAddLog(`🎲 ${p.name} bắt đầu di chuyển ${steps} bước.`);
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

window.boardShowBigNotice = function(title, desc, extra = '', callback, persist = false) {
    let curPlayer = boardGame && boardGame.players && boardGame.players[boardGame.currentTurn];
    if ((curPlayer && curPlayer.isBot) || document.hidden) {
        if(callback) callback();
        return;
    }
    const overlay = document.getElementById('bigEventOverlay');
    if(!overlay) {
        if(callback) callback();
        return;
    }
    try { audio.play('hit'); } catch(e){}
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
    if(!p || p.eliminated) return;
    if (steps > 0) {
        p.gold = (p.gold || 0) + (steps * 3);
        if (p.isHuman) {
            boardRefreshHud();
        }
    }
    let next = p.pos + steps;
    p.pos = Math.max(0, Math.min(BOARD_TOTAL_CELLS - 1, next));
    boardGame.revealedCells[p.pos] = true; // ô chỉ lộ hình khi thật sự có người đi tới
    if(animate) { boardRenderGrid(); boardRenderPlayers(); }
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
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100025; display:flex; align-items:center; justify-content:center;';

    let box = document.createElement('div');
    box.style.cssText = 'background:#1c1a26; border:2px solid #ff9eb5; border-radius:14px; width:min(94vw,480px); max-height:80vh; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px;';
    box.innerHTML = `<div style="font-weight:800; color:#ffb3c6;">🎴 Bài Trên Tay (${human.hand.length}) — dùng bất cứ lúc nào để lật kèo</div>`;

    if (human.hand.length === 0) {
        let empty = document.createElement('div');
        empty.style.cssText = 'color:#94a3b8; font-size:0.85rem; text-align:center; padding:12px;';
        empty.textContent = 'Bạn đã dùng hết bài trên tay.';
        box.appendChild(empty);
    }

    human.hand.forEach((card, i) => {
        const typeIcon = card.type === 'monster' ? '👾' : card.type === 'equip' ? '🛡️' : card.type === 'trap' ? '💣' : card.type === 'fun_spell' ? '✨' : '🌪️';
        let row = document.createElement('div');
        row.style.cssText = 'background:#2c2840; border:1px solid #4d4566; border-radius:8px; padding:10px; cursor:pointer;';
        row.innerHTML = `<div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.9rem; color:#fff;"><span>${typeIcon} ${card.name}</span><span style="color:#ffb3c6; font-size:0.7rem; text-transform:uppercase;">${card.rarity}</span></div>
            <div style="font-size:0.75rem; color:#cbd5e1; margin-top:4px;">${card.desc}</div>`;
        row.onclick = () => {
            modal.remove();
            window.boardUseHandCard(human.idx, i);
        };
        box.appendChild(row);
    });

    let closeBtn = document.createElement('button');
    closeBtn.textContent = 'Đóng';
    closeBtn.style.cssText = 'padding:8px; background:#4b5563; border:none; border-radius:6px; color:#fff; cursor:pointer; margin-top:4px;';
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

    let result = card.effect(p);
    const typeIcon = card.type === 'monster' ? '👾' : card.type === 'equip' ? '🛡️' : card.type === 'trap' ? '💣' : card.type === 'fun_spell' ? '✨' : '🌪️';
    boardAddLog(`🎴 ${p.name} dùng bài tay [${card.name}] — ${result}`, 'card');
    window.boardShowBigNotice(`${typeIcon} ${card.name}`, card.desc, `👉 ${result}`, () => {
        boardRenderGrid();
        boardRenderPlayers();
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
window.boardRenderGrid = function() {
    const grid = document.getElementById('boardGrid');
    if(!grid) return;
    grid.innerHTML = '';

    const canvasW = 1024;
    const canvasH = 782;

    // Scrollable track wrapper
    grid.style.cssText = [
        'position:relative',
        'width:100%',
        'height:100%',
        'overflow:auto',
        'scroll-behavior:smooth',
        'display:flex',
        'align-items:flex-start',
        'justify-content:flex-start',
        'padding:10px'
    ].join(';');

    const canvas = document.createElement('div');
    canvas.className = 'board-canvas';
    canvas.style.cssText = `position:relative; width:${canvasW}px; height:${canvasH}px; background: radial-gradient(circle, #274217 0%, #15270c 100%); border: 4px solid #4a2e1b; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.85); flex-shrink: 0; zoom: 1.35;`;

    // Glow path svg overlay (Multi-layered dirt path style)
    const roadSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    roadSvg.setAttribute('viewBox', `0 0 ${canvasW} ${canvasH}`);
    roadSvg.setAttribute('width', canvasW);
    roadSvg.setAttribute('height', canvasH);
    roadSvg.style.cssText = 'position:absolute; top:0; left:0; pointer-events:none; z-index: 2;';
    roadSvg.innerHTML = `
        <!-- Soil Bed Border -->
        <path d="${_getBoardSmoothPath()}" fill="none" stroke="#3d2210" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
        <!-- Sand Road -->
        <path d="${_getBoardSmoothPath()}" fill="none" stroke="#704423" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Cobblestone Inner Path -->
        <path d="${_getBoardSmoothPath()}" fill="none" stroke="#a1754f" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Glowing Guide Line -->
        <path d="${_getBoardSmoothPath()}" fill="none" stroke="#ecd5b0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 16" opacity="0.6"/>
    `;
    canvas.appendChild(roadSvg);

    // Village locations tag overlay
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
        tag.style.left = `${loc.x * 10.24}px`;
        tag.style.top = `${loc.y * 7.82}px`;
        tag.textContent = loc.name;
        canvas.appendChild(tag);
    });

    for(let i = 0; i < BOARD_TOTAL_CELLS; i++) {
        const px = _getCellPixelPos(i);
        const type = i === 0 ? 'start' : i === BOARD_TOTAL_CELLS - 1 ? 'finish' : '';
        const zoneName = boardGame.cellZones[i] || NEIGHBORHOOD_NAMES[i % NEIGHBORHOOD_NAMES.length];
        const revealed = !!boardGame.revealedCells[i];

        // 3D stone button background gradients based on cell category
        let cellBg = '';
        if (!revealed) {
            cellBg = 'radial-gradient(circle, #4b5563 0%, #1f2937 100%)';
        } else if (type === 'start') {
            cellBg = 'radial-gradient(circle, #60a5fa 0%, #1d4ed8 100%)';
        } else if (type === 'finish') {
            cellBg = 'radial-gradient(circle, #6ee7b7 0%, #065f46 100%)';
        } else if (boardGame.trappedCells[i]) {
            cellBg = 'radial-gradient(circle, #f87171 0%, #b91c1c 100%)';
        } else {
            const baseColor = boardGetZoneColor(zoneName);
            cellBg = `radial-gradient(circle, ${baseColor}dd 0%, ${baseColor} 100%)`;
        }

        const art = !revealed
            ? `<svg viewBox="0 0 40 40" width="14" height="14"><circle cx="20" cy="20" r="4" fill="#a78bfa" opacity="0.6"/></svg>`
            : i === 0
            ? `<svg viewBox="0 0 40 40" width="22" height="22"><rect x="6" y="6" width="4" height="28" fill="#333"/><rect x="10" y="6" width="18" height="10" fill="#ef4444"/><rect x="10" y="6" width="9" height="5" fill="#fff"/><rect x="19" y="11" width="9" height="5" fill="#fff"/></svg>`
            : i === BOARD_TOTAL_CELLS - 1
            ? `<svg viewBox="0 0 40 40" width="22" height="22"><path d="M12,4 L12,36" stroke="#fbbf24" stroke-width="3"/><path d="M12,6 L30,10 L12,18 Z" fill="#22c55e"/></svg>`
            : boardGame.trappedCells[i]
            ? `<svg viewBox="0 0 40 40" width="20" height="20"><circle cx="20" cy="20" r="14" fill="#ef4444"/><path d="M20,10 L20,22 M20,27 L20,29" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`
            : boardGetZoneArtSVG(zoneName);

        const cellPlayers = boardGame.players.filter(p => p.pos === i && !p.eliminated);
        const tokens = cellPlayers.map(p =>
            `<div class="board-token-large" style="border-color:${p.color};box-shadow:0 0 8px ${p.color};" title="${p.name} (${p.lives}❤️)">${boardPlayerTokenSVG(p, 24)}</div>`
        ).join('');

        const div = document.createElement('div');
        div.className = 'board-cell' + (type ? ' ' + type : '') + (revealed ? ' revealed' : ' hidden-cell');
        div.id = `bcell_${i}`;
        div.title = revealed ? zoneName : '???';
        
        const cellSize = 38;
        div.style.cssText = `position:absolute; left:${px.x - cellSize / 2}px; top:${px.y - cellSize / 2}px; width:${cellSize}px; height:${cellSize}px; background:${cellBg}; z-index: 5;`;
        
        // Circular cell layout: number in center, event badge in top-right if revealed
        div.innerHTML = `<span class="cell-num-center">${i+1}</span>` + 
                        (revealed && type !== 'start' && type !== 'finish' ? `<span class="cell-badge">${art}</span>` : '') + 
                        `<div class="cell-tokens-wrap">${tokens}</div>`;
        canvas.appendChild(div);
    }

    grid.appendChild(canvas);
    boardScrollToCurrentPlayer();
};

// Lia màn hình bàn cờ tới đúng ô của người đang tới lượt (bàn 100 ô không thể
// hiện hết cùng lúc nên cần "camera" bám theo lượt chơi).
window.boardScrollToCurrentPlayer = function() {
    if (!boardGame || !boardGame.players.length) return;
    let cur = boardGame.players[boardGame.currentTurn];
    if (!cur) return;
    let cellEl = document.getElementById(`bcell_${cur.pos}`);
    let grid = document.getElementById('boardGrid');
    if (!cellEl || !grid) return;
    
    const zoomFactor = 1.35;
    let targetLeft = (cellEl.offsetLeft * zoomFactor) - (grid.clientWidth / 2) + (cellEl.clientWidth * zoomFactor / 2);
    let targetTop = (cellEl.offsetTop * zoomFactor) - (grid.clientHeight / 2) + (cellEl.clientHeight * zoomFactor / 2);
    grid.scrollTo({ left: Math.max(0, targetLeft), top: Math.max(0, targetTop), behavior: 'smooth' });
};

// ── Render Danh sách ──────────────────────────────────────────
window.boardRenderPlayers = function() {
    if (!boardGame || !boardGame.players) return;

    // Update bottom character cards visual state (highlight active, gray out dead)
    boardGame.players.forEach((p, idx) => {
        const cardEl = document.getElementById(`charCard_${p.idx}`);
        if (cardEl) {
            if (p.eliminated) {
                cardEl.classList.add('eliminated');
            } else {
                cardEl.classList.remove('eliminated');
            }
            
            if (p.idx === boardGame.currentTurn && !boardGame.gameOver) {
                cardEl.classList.add('active-turn');
                cardEl.style.borderColor = p.color;
                cardEl.style.boxShadow = `0 0 15px ${p.color}`;
            } else {
                cardEl.classList.remove('active-turn');
                cardEl.style.borderColor = '';
                cardEl.style.boxShadow = '';
            }
        }
    });
    
    // Update selected character info
    window.boardUpdateCharPanel();
};

// ── Khởi tạo ──────────────────────────────────────────────────
window.openBoardGame = function(pvpMode = false) {
    audio.play('click');
    let betAmount = 0; // default bet
    boardGame = {
        players: [], currentTurn: 0, isRolling: false,
        trappedCells: {}, log: [], gameOver: false,
        revealedCells: { 0: true, [BOARD_TOTAL_CELLS - 1]: true },
        pvp: !!pvpMode, hostId: pvpMode ? myNetworkId : null, betPool: betAmount,
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
    boardGame.players.push({
        idx: 0, name: player.name + ' (Trâu)', networkId: myNetworkId, classId: player.classId, skin: player.equipment?.skin,
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: RACE_PLAYER_COLORS[0],
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
        if (player.name && player.name.toLowerCase() === 'admin') {
            adminBtn.style.display = 'inline-block';
        } else {
            adminBtn.style.display = 'none';
        }
    }

    // Default selected character display to human (0)
    window.boardSelectedCharDisplayIdx = 0;

    boardRenderGrid();
    boardRenderPlayers();
    boardUpdateRollBtn();
    document.getElementById('boardGameModal').classList.add('active');
    boardAddLog(`🏁 ĐẤU TRƯỜNG BẮT ĐẦU! Ai hết 3 ❤️ sẽ chết. Đi tới ô ${BOARD_TOTAL_CELLS} (Quảng Trường) để thắng!`, 'special');
};

window.boardAddBot = function() {
    if(boardGame.players.length >= 4) return;
    const idx = boardGame.players.length;
    const botNames  = ['Mầm Mềm Mẽ', 'Kiến Bảo Vệ', 'Út Mũ Rơm'];
    const botColors = ['#e084fc', '#22c55e', '#3b82f6'];
    const botEmojis = ['👩‍🦰', '👮‍♂️', '👦'];
    boardGame.players.push({
        idx, name: botNames[idx-1] || `Bot ${idx}`, networkId: null,
        pos: 0, lives: 3, weapons: 0, shields: 0, eliminated: false,
        color: botColors[idx-1] || '#f59e0b',
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
    if (window.boardScrollToCurrentPlayer) window.boardScrollToCurrentPlayer();
    
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
            if(id === myNetworkId || (Date.now() - p.lastSeen > 12000)) continue;
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
            id: myNetworkId,
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
        if(typeof pvpChannel !== 'undefined') pvpChannel.postMessage({ type: 'BOARD_PVP_REPLY', id: myNetworkId, senderId: msg.id, targetId: msg.id, accepted: true, replierName: player.name });
        showToast('⏳ Đã đồng ý! Đang chờ chủ phòng khởi tạo bàn cờ...');
    };
    
    document.getElementById('rejectPvpBtn').onclick = () => {
        document.getElementById('pvpChallengeModal').style.display = 'none';
        if(typeof pvpChannel !== 'undefined') pvpChannel.postMessage({ type: 'BOARD_PVP_REPLY', id: myNetworkId, senderId: msg.id, targetId: msg.id, accepted: false, replierName: player.name });
    };
    
    document.getElementById('pvpChallengeModal').style.display = 'flex';
};

console.log('🏁 [board_new.js] Cờ Đua Sinh Tồn v4 loaded!');

// ── Bet Modal & Triggers ──────────────────────────────────────
window.openBoardGameWithBet = function() {
    audio.play('click');
    const modal = document.getElementById('boardBetModal');
    if(modal) modal.classList.add('active');
    window._selectedBetAmount = 50;
    const opts = document.querySelectorAll('.bet-option');
    if(opts.length > 0) {
        opts.forEach(el => el.classList.remove('selected'));
        opts[0].classList.add('selected');
    }
};

window.selectBetAmount = function(amt) {
    audio.play('click');
    window._selectedBetAmount = amt;
    document.querySelectorAll('.bet-option').forEach(el => el.classList.remove('selected'));
    if(event && event.currentTarget) event.currentTarget.classList.add('selected');
};

window.closeBetModal = function() {
    audio.play('click');
    const modal = document.getElementById('boardBetModal');
    if(modal) modal.classList.remove('active');
};

window.confirmBetAndStart = function() {
    audio.play('click');
    let amt = window._selectedBetAmount;
    const customInp = document.getElementById('customBetAmount');
    if(customInp && customInp.value) {
        amt = parseInt(customInp.value) || 0;
    }
    if(player.gold < amt) {
        showToast('⚠️ Không đủ vàng để cược!');
        return;
    }
    player.gold -= amt;
    boardRefreshHud();
    closeBetModal();
    
    // Bắt đầu game với tiền cược
    openBoardGame(false); 
    boardGame.betPool = amt; 
    boardRenderGrid(); // Render lại để hiện Nồi Cược
};

window.startBoardGameNoBet = function() {
    audio.play('click');
    closeBetModal();
    openBoardGame(false);
};

window.boardAddLog = function(text, type) {
    if(!boardGame) return;
    boardGame.log.push({ text, type });
    if(boardGame.log.length > 24) boardGame.log.shift();
    let logEl = document.getElementById('boardLog');
    if(!logEl) return;
    logEl.innerHTML = boardGame.log.map(l => `<p class="${l.type||''}">${l.text}</p>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
};

window.boardIsMyTurn = function() {
    if(!boardGame || boardGame.gameOver) return false;
    let cur = boardGame.players[boardGame.currentTurn];
    if(!cur) return false;
    if(boardGame.pvp) return cur.networkId === myNetworkId;
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
    if(boardGame.pvp && boardGame.hostId !== myNetworkId) {
        if(typeof pvpChannel !== 'undefined') {
            pvpChannel.postMessage({ type: 'BOARD_ROLL_REQUEST', id: myNetworkId, hostId: boardGame.hostId });
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
    window.boardDoRollAnimation(cur, () => {
        boardGame.isRolling = false;
        // Đã bỏ luật "tung 6 được thêm lượt" theo yêu cầu — mỗi lượt chỉ đi 1 lần dù ra số gì.
        window.boardNextTurn();
        window.boardUpdateRollBtn();
        window.boardBroadcastState('state');
    });
};

window.boardBroadcastState = function(kind) {
    if(!boardGame || !boardGame.pvp || boardGame.hostId !== myNetworkId) return;
    if(typeof pvpChannel !== 'undefined') {
        pvpChannel.postMessage({
            type: kind === 'start' ? 'BOARD_PVP_START' : 'BOARD_PVP_STATE',
            id: myNetworkId,
            hostId: myNetworkId,
            targetIds: boardGame.players.map(p => p.networkId).filter(Boolean),
            boardGame: JSON.parse(JSON.stringify(boardGame)),
            cardHtml: document.getElementById('boardCardDisplay')?.innerHTML || '',
            diceText: document.getElementById('diceResultText')?.textContent || ''
        });
    }
};

window.boardApplyNetworkState = function(msg) {
    if(!msg.boardGame || !msg.targetIds?.includes(myNetworkId)) return;
    boardGame = msg.boardGame;
    boardGame.players.forEach((p, idx) => {
        p.idx = idx;
        p.isHuman = p.networkId === myNetworkId;
    });
    boardGame.isRolling = false;
    document.getElementById('boardGameModal').classList.add('active');
    if(msg.cardHtml) document.getElementById('boardCardDisplay').innerHTML = msg.cardHtml;
    if(msg.diceText) document.getElementById('diceResultText').textContent = msg.diceText;
    window.boardRenderGrid();
    window.boardRenderPlayers();
    window.boardUpdateRollBtn();
    
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
        if (boardGame.hostId === myNetworkId) return; // Chỉ khách kiểm tra chủ phòng
        
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
        let tmp = p.pos;
        p.pos = nearest.pos;
        nearest.pos = tmp;
        window.boardRenderGrid();
        return `Đổi vị trí với ${nearest.name}.`;
    }
    return 'Không có ai để đổi.';
};

// ── Hàm Khởi Động PvP phía Chủ Phòng (Host) ──────────────────
window.boardStartPvpAsHost = function(guestId, guestName) {
    try { audio.play('click'); } catch(e){}
    let guestData = window.networkPlayers && window.networkPlayers[guestId] ? window.networkPlayers[guestId] : {};
    
    boardGame = {
        players: [], currentTurn: 0, isRolling: false,
        trappedCells: {}, log: [], gameOver: false,
        pvp: true, hostId: myNetworkId, betPool: 0,
        turnStartTime: Date.now()
    };
    
    // Thêm Chủ phòng (A)
    boardGame.players.push({
        idx: 0, name: player.name, networkId: myNetworkId, classId: player.classId, skin: player.equipment?.skin,
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
        if (boardGame.hostId !== myNetworkId) return; // Chỉ chủ phòng kiểm tra AFK và mất kết nối
        if (boardGame.isRolling) return;
        
        // 1. Kiểm tra đối thủ mất kết nối
        let guestPlayer = boardGame.players.find(p => p.networkId && p.networkId !== myNetworkId);
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
            welcome.textContent = `Bạn vừa ghé qua [${shopName}]. Hãy dùng Vàng để mua trang bị hỗ trợ sinh tồn!`;
            goldEl.textContent = p.gold || 0;
            modal.style.display = 'flex';
        } else {
            if (callback) callback();
        }
    } else {
        // AI Bot mua đồ tự động (quyết định mua dựa trên số vàng đang có)
        let botGold = p.gold !== undefined ? p.gold : 150;
        let boughtSomething = false;
        
        // Ưu tiên 1: Mua máu nếu < 3 mạng và đủ 100 vàng
        if (p.lives < 3 && botGold >= 100) {
            botGold -= 100;
            p.lives++;
            boardAddLog(`🛒 CỬA HÀNG: ${p.name} ghé mua 1 Hộp Cứu Thương (-100 Vàng, +1 ❤️)`);
            boughtSomething = true;
        }
        // Ưu tiên 2: Mua vũ khí nếu có 0 vũ khí và đủ 50 vàng
        else if (p.weapons === 0 && botGold >= 50) {
            botGold -= 50;
            p.weapons++;
            boardAddLog(`🛒 CỬA HÀNG: ${p.name} ghé mua 1 Kiếm Sắt (-50 Vàng, +1 🗡️)`);
            boughtSomething = true;
        }
        // Ưu tiên 3: Mua khiên nếu có 0 khiên và đủ 50 vàng
        else if (p.shields === 0 && botGold >= 50) {
            botGold -= 50;
            p.shields++;
            boardAddLog(`🛒 CỬA HÀNG: ${p.name} ghé mua 1 Khiên Gỗ (-50 Vàng, +1 🛡️)`);
            boughtSomething = true;
        }
        
        if (!boughtSomething) {
            boardAddLog(`🛒 CỬA HÀNG: ${p.name} lướt nhanh qua ${shopName} nhưng không mua gì.`);
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
    
    if (itemType === 'weapon') {
        p.weapons++;
        boardAddLog(`🛒 CỬA HÀNG: Bạn đã mua 1 Kiếm Sắt (-${cost} Vàng, +1 🗡️)`);
    } else if (itemType === 'shield') {
        p.shields++;
        boardAddLog(`🛒 CỬA HÀNG: Bạn đã mua 1 Khiên Gỗ (-${cost} Vàng, +1 🛡️)`);
    } else if (itemType === 'health') {
        p.lives++;
        boardAddLog(`🛒 CỬA HÀNG: Bạn đã mua 1 Hộp Cứu Thương (-${cost} Vàng, +1 ❤️)`);
    }
    
    boardRefreshHud();
    window.boardUpdateCharPanel();
    
    // Cập nhật lại số vàng trong UI Shop
    const goldEl = document.getElementById('shopPlayerGold');
    if (goldEl) goldEl.textContent = p.gold || 0;
    
    showToast('🛒 Mua sắm thành công!');
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
