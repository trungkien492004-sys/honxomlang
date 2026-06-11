const fs = require('fs');
let b = fs.readFileSync('./assets/js/game.js', 'utf8');

b = b.replace(/let slots = \['weapon', 'armor', 'accessory'\];/, `let slots = ['weapon', 'armor', 'accessory', 'skin'];`);
b = b.replace(/let defEmoji = slotName === 'weapon' \? "⚔️" : slotName === 'armor' \? "🛡️" : "💍";/, `let defEmoji = slotName === 'weapon' ? "⚔️" : slotName === 'armor' ? "🛡️" : slotName === 'accessory' ? "💍" : "👗";`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Updated rebuildEquipmentUI in game.js');
