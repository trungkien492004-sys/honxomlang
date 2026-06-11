const fs = require('fs');
let content = fs.readFileSync('./assets/js/game.js', 'utf8');
let idx = content.indexOf('window.changeMap(\'world\', rx, ry);');
if (idx > 0) {
    let endIdx = content.indexOf('};', idx) + 2;
    let clean = content.substring(0, endIdx);
    fs.writeFileSync('./assets/js/game.js', clean + '\n\nwindow.toggleMobileMenu = function() { let c = document.getElementById(\'hudNavContainer\'); if(c) c.classList.toggle(\'open\'); };\n', 'utf8');
    console.log('Fixed game.js');
} else {
    console.log('Marker not found in game.js');
}
