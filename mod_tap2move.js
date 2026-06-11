const fs = require('fs');

let b = fs.readFileSync('./assets/js/game.js', 'utf8');

// 1. Add destination setting on click
b = b.replace(/clickMarker = \{ x: worldClickX, y: worldClickY, createdAt: Date\.now\(\) \};/, 
`$&
    player.destinationX = worldClickX;
    player.destinationY = worldClickY;`);

// 2. Add dx fixing for animation direction
let targetPattern = `if (dx === 0 && window.joystickActive && window.joystickVector) {
                            dx = window.joystickVector.x;
                        }`;
b = b.replace(targetPattern, 
`${targetPattern}
                        if (dx === 0 && player.destinationX !== undefined) {
                            dx = player.destinationX - player.x;
                        }`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Fixed tap-to-move successfully.');
