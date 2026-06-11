const fs = require('fs');
let b = fs.readFileSync('./assets/js/firebase.js', 'utf8');

b = b.replace(/window\.drawBeautifulRPGChibi = function\([^)]+\) \{/, `const _skinCache = {};
$&`);

fs.writeFileSync('./assets/js/firebase.js', b, 'utf8');
console.log('Added skin cache');
