const fs = require('fs');
const path = require('path');

const cards = [
  { id: 'AN-junk_synchron', name: 'Đồng Bộ Phế Liệu', type: 'Monster', element: 'Ám', c1: '#2ec4b6', c2: '#0b2b3a' },
  { id: 'AN-speed_warrior', name: 'Chiến Binh Tốc Độ', type: 'Monster', element: 'Phong', c1: '#38bdf8', c2: '#0c4a6e' },
  { id: 'AN-quillbolt_hedgehog', name: 'Nhím Lông Nhọn', type: 'Monster', element: 'Địa', c1: '#f59e0b', c2: '#78350f' },
  { id: 'AN-sonic_chick', name: 'Gà Siêu Âm', type: 'Monster', element: 'Phong', c1: '#38bdf8', c2: '#0c4a6e' },
  { id: 'AN-shield_wing', name: 'Cánh Khiên', type: 'Monster', element: 'Phong', c1: '#38bdf8', c2: '#0c4a6e' },
  { id: 'AN-junk_forward', name: 'Tiên Phong Phế Liệu', type: 'Monster', element: 'Địa', c1: '#f59e0b', c2: '#78350f' },
  { id: 'AN-doppelwarrior', name: 'Chiến Binh Song Sinh', type: 'Monster', element: 'Ám', c1: '#a855f7', c2: '#3b0764' },
  { id: 'AN-effect_veiler', name: 'Cô Gái Ảo Ảnh', type: 'Monster', element: 'Quang', c1: '#fbbf24', c2: '#713f12' },
  { id: 'AN-turbo_synchron', name: 'Đồng Bộ Tăng Tốc', type: 'Monster', element: 'Phong', c1: '#38bdf8', c2: '#0c4a6e' },
  { id: 'AN-nitro_synchron', name: 'Đồng Bộ Nitro', type: 'Monster', element: 'Hỏa', c1: '#ef4444', c2: '#7f1d1d' },
  { id: 'AN-stardust_dragon', name: 'Rồng Tinh Tú', type: 'Monster', element: 'Phong', c1: '#00f5d4', c2: '#005f73' },
  { id: 'AN-junk_warrior', name: 'Chiến Binh Phế Liệu', type: 'Monster', element: 'Ám', c1: '#2ec4b6', c2: '#0b2b3a' },
  { id: 'AN-formula_synchron', name: 'Đồng Bộ Công Thức', type: 'Monster', element: 'Quang', c1: '#00b4d8', c2: '#03045e' },
  { id: 'AN-armory_arm', name: 'Cánh Tay Vũ Khí', type: 'Monster', element: 'Quang', c1: '#ffd166', c2: '#073b4c' },
  { id: 'AN-nitro_warrior', name: 'Chiến Binh Nitro', type: 'Monster', element: 'Hỏa', c1: '#f77f00', c2: '#6a040f' },
  { id: 'AN-scrap_iron_scarecrow', name: 'Bù Nhìn Sắt Vụn', type: 'Trap', element: 'Trap', c1: '#c084fc', c2: '#3b0764' },
  { id: 'AN-tuning', name: 'Điều Tinh', type: 'Spell', element: 'Spell', c1: '#06d6a0', c2: '#073b4c' },
  { id: 'AN-synchro_blast_wave', name: 'Sóng Nổ Đồng Bộ', type: 'Spell', element: 'Spell', c1: '#118ab2', c2: '#073b4c' },
  { id: 'AN-limiter_overload', name: 'Bộ Giới Hạn Quá Tải', type: 'Trap', element: 'Trap', c1: '#c084fc', c2: '#3b0764' },
  { id: 'AN-spirit_force', name: 'Năng Lượng Tinh Thần', type: 'Trap', element: 'Trap', c1: '#c084fc', c2: '#3b0764' },
  { id: 'AN-doppel_token', name: 'Token Phân Thân', type: 'Monster', element: 'Ám', c1: '#a855f7', c2: '#3b0764' }
];

const artDir = 'assets/memecard/art';
os = require('os');
for (const c of cards) {
  const p = path.join(artDir, c.id + '.svg');
  if (fs.existsSync(p)) continue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440"><defs><linearGradient id="bg" x2=".8" y2="1"><stop stop-color="${c.c2}"/><stop offset="1" stop-color="#07172d"/></linearGradient></defs><rect width="360" height="440" fill="url(#bg)"/><circle cx="180" cy="220" r="140" fill="none" stroke="${c.c1}" stroke-width="4"/><text x="180" y="225" font-family="sans-serif" font-size="20" font-weight="bold" fill="#fff" text-anchor="middle">${c.name}</text></svg>`;
  fs.writeFileSync(p, svg);
}
console.log('Generated fallback SVGs for all Yusei cards');
