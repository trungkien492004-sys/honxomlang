const fs = require('fs');
let c = fs.readFileSync('assets/js/game.js', 'utf8');

c = c.replace(/\?\? T\?i save:/g, '💾 Tải save:');
c = c.replace(/\?\? Pht hi\?n d\? li\?u cu:/g, '💾 Phát hiện dữ liệu cũ:');
c = c.replace(/\[NH\?P VAO DAY D\? T\?I TI\?N TRINH\]/g, '[NHẤP VÀO ĐÂY ĐỂ TẢI TIẾN TRÌNH]');
c = c.replace(/\?\? B\?n \?\? c\? t\? \?\?i, kh\?ng th\? nh\?n l\?i m\?i kh\?c./g, '⚠️ Bạn đã có tổ đội, không thể nhận lời mời khác.');
c = c.replace(/\?\? \$\{msg.name\} \?\? gia nh\?p \?\?i c\?a b\?n!/g, '✅  đã gia nhập đội của bạn!');
c = c.replace(/\?\? Tr\?\?ng \?\?i \$\{msg.name \|\| ''\} \?\? gi\?i t\?n t\? \?\?i./g, '⚠️ Trưởng đội  đã giải tán tổ đội.');
c = c.replace(/\?\? \$\{msg.name\} da r\?i kh\?i t\? d\?i./g, '⚠️  đã rời khỏi tổ đội.');
c = c.replace(/\?\? ' \+ msg.senderName \+ ' r\? b\?n choi C\? \?ua! B\?n c\? tham gia kh\?ng\?'/g, '\\'⚔️ \\' + msg.senderName + \\' rủ bạn chơi Cờ Đua! Bạn có tham gia không?\\'');
c = c.replace(/\?ang k\?t n\?i\.\.\./g, 'Đang kết nối...');
c = c.replace(/\?\? ' \+ msg.name \+ ' d\? ch\?p nh\?n! H\?y Tung X\?c X\?c.'/g, '\\'✅ \\' + msg.name + \\' đã chấp nhận! Hãy Tung Xúc Xắc.\\'');
c = c.replace(/\? ' \+ msg.name \+ ' d\? t\? ch\?i choi C\? \?ua.'/g, '\\'❌ \\' + msg.name + \\' đã từ chối chơi Cờ Đua.\\'');
c = c.replace(/\?\? Da vo phng PvP C\? Dua\./g, '⚔️ Đã vào phòng PvP Cờ Đua.');
c = c.replace(/\?\? Thch d\?u T\? D\?I - \$\{challengerTeam.length\} vs \$\{partySystem.getMemberCount\(\)\} ngu\?i/g, '⚔️ Thách đấu TỔ ĐỘI -  vs  người');
c = c.replace(/\?\? T\? d\?ng nghnh chi\?n \$\{msg.senderName\}!/g, '⚔️ Tự động nghênh chiến !');
c = c.replace(/\?\? Ngu\?i Kh\?i Hnh May M\?n \?\?/g, '✨ Người Khởi Hành May Mắn ✨');
c = c.replace(/\?\? Thanh mu c\?a b\?n da d\?y s\?n!/g, '⚠️ Thanh máu của bạn đã đầy sẵn!');
c = c.replace(/\?\? Thanh nang lu\?ng c\?a b\?n da d\?y s\?n!/g, '⚠️ Thanh năng lượng của bạn đã đầy sẵn!');
c = c.replace(/\?\? Mua /g, '🛒 Mua ');
c = c.replace(/\?\? B\?n \?ang mu\?n mua/g, '🛒 Bạn đang muốn mua');
c = c.replace(/\?\? Kh\?ng \?\? Vng/g, '⚠️ Không đủ Vàng');
c = c.replace(/\?\? Kh\?ng c\? v\? tr\?i/g, '⚠️ Không có vật phẩm');
c = c.replace(/\?\? H\?nh trang \?\?y!/g, '⚠️ Hành trang đầy!');

fs.writeFileSync('assets/js/game.js', c, 'utf8');
