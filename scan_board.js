const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'assets', 'js', 'board_new.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const keywords = [
  'roll',
  'turn',
  'bot',
  'timeout',
  'modal',
  'dice',
  'showNotice',
  'win',
  'close'
];

let results = [];
lines.forEach((line, index) => {
  const lineNum = index + 1;
  keywords.forEach(keyword => {
    if (line.toLowerCase().includes(keyword)) {
      results.push(`Line ${lineNum}: ${line.trim()}`);
    }
  });
});

fs.writeFileSync(path.join(__dirname, 'board_scan_results.txt'), results.join('\n'), 'utf8');
console.log('Finished scanning board_new.js. Wrote results to board_scan_results.txt');
