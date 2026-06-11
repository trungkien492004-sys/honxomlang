const fs = require('fs');
let b = fs.readFileSync('./assets/js/board_new.js', 'utf8');

b = b.replace(/classId: player.classId,/, `classId: player.classId, skin: player.equipment.skin,`);
// Oh wait, classId isn't passed directly in push.

// Let's replace the whole push
b = b.replace(/idx: 0, name: player\.name, networkId: myNetworkId,/, `idx: 0, name: player.name, networkId: myNetworkId, classId: player.classId, skin: player.equipment.skin,`);

b = b.replace(/background:url\('assets\/img\/char_\$\{p\.classId\|\|'cop'\}\.png'\)/g, `background:url('\${p.skin === "skin_cong_chua" ? "assets/img/skins/ayaa.jpg" : "assets/img/char_" + (p.classId||"cop") + ".png"}')`);

fs.writeFileSync('./assets/js/board_new.js', b, 'utf8');
console.log('Updated board_new.js to use skin');
