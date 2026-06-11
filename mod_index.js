const fs = require('fs');
let b = fs.readFileSync('./index.html', 'utf8');

b = b.replace(/<div class="equip-box" id="eq-accessory"[^>]+><div class="slot-emoji">.*?<\/div><\/div>/, `$&
                                <div class="equip-box" id="eq-skin" data-label="Ngoại Trang" onclick="unequipItem('skin')"><div class="slot-emoji">👗</div></div>`);

fs.writeFileSync('./index.html', b, 'utf8');
console.log('Added eq-skin to index.html');
