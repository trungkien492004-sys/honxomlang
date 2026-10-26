const fs = require('fs');
const path = require('path');

const fileTactics = path.join(__dirname, '../assets/js/meme_phase2_tactics.js');
let tactics = fs.readFileSync(fileTactics, 'utf8').replace(/\r\n/g, '\n');
const targetStr = "if(code==='toon_world')return v.self.lp>(root.memeLpCosts?.fixed(1000)??1000)&&!v.self.spells.some(x=>x?.id===c.id)&&v.self.hand.some(id=>has(get(id),'toon'))?2500:0;return 1000;";
const replacementStr = `if(code==='toon_world')return v.self.lp>(root.memeLpCosts?.fixed(1000)??1000)&&!v.self.spells.some(x=>x?.id===c.id)&&v.self.hand.some(id=>has(get(id),'toon'))?2500:0;
  if(['DL-the_melody_of_awakening_dragon','DL-cards_of_consonance','DL-silvers_cry','DL-dark_magical_circle','DL-neos_fusion','DL-red_eyes_fusion','DL-red_eyes_insight','DL-a_hero_lives','DL-cyber_emergency','DL-cyberload_fusion','DL-toon_table_of_contents','DL-toon_bookmark','DL-bingo_machine_go','DL-cyber_repair_plant'].includes(c.id))return 4200;
  return 1000;`;

if (!tactics.includes(targetStr)) {
  console.log('Target string in tactics not found or already replaced.');
} else {
  tactics = tactics.replace(targetStr, replacementStr);
  fs.writeFileSync(fileTactics, tactics.replace(/\n/g, '\r\n'));
  console.log('Successfully updated meme_phase2_tactics.js!');
}
