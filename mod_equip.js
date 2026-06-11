const fs = require('fs');
let b = fs.readFileSync('./assets/js/game.js', 'utf8');

b = b.replace(/\['weapon', 'armor', 'accessory'\]\.includes\(itemDef\.type\)/, `['weapon', 'armor', 'accessory', 'skin'].includes(itemDef.type)`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Updated useOrEquipInventoryItem');
