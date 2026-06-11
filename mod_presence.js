const fs = require('fs');
let b = fs.readFileSync('./assets/js/game.js', 'utf8');

b = b.replace(/classId: player.classId,/, `classId: player.classId, equipment: player.equipment,`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Updated broadcast presence');
