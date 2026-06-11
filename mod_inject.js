const fs = require('fs');

let b = fs.readFileSync('./assets/js/game.js', 'utf8');

b = b.replace(/player\.inventory = data\.inventory;\s*player\.equipment = data\.equipment;\s*player\.quests = data\.quests;/, 
`player.inventory = data.inventory || [];
                player.equipment = data.equipment || { weapon: null, armor: null, accessory: null, skin: null };
                player.quests = data.quests;

                if(!player.equipment.skin) player.equipment.skin = null;
                if(!player.inventory.find(i => i.id === 'skin_cong_chua')) {
                    player.inventory.push({ id: 'skin_cong_chua', count: 1 });
                }`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Fixed loadGameFromLocal');
