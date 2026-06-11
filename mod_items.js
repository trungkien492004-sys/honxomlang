const fs = require('fs');
let b = fs.readFileSync('./assets/js/game.js', 'utf8');

b = b.replace(/magic_crystal:[^\n]+,/, `$&
            skin_cong_chua: { id: "skin_cong_chua", name: "Công Chúa Cầu Vồng", emoji: "👗", type: "skin", desc: "Trang phục Công Chúa Cầu Vồng với hiệu ứng lấp lánh (Quà Tân Thủ)", price: 0 },`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Added skin_cong_chua to ITEMS');
