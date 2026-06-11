const fs = require('fs');
let b = fs.readFileSync('./assets/js/game.js', 'utf8');

b = b.replace(/inventory:\s*\[/, `inventory: [
                { id: "skin_cong_chua", count: 1 },`);

b = b.replace(/equipment:\s*\{\s*weapon:\s*null,\s*armor:\s*null,\s*accessory:\s*null\s*\}/, `equipment: {
                weapon: null,
                armor: null,
                accessory: null,
                skin: null
            }`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Replaced successfully');
