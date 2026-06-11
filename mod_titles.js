const fs = require('fs');
let b = fs.readFileSync('./assets/js/game.js', 'utf8');

b = b.replace(/ctx\.fillText\(player\.name, px, py \+ 26\);/, 
`if(player.equipment.skin === 'skin_cong_chua') {
                        ctx.fillStyle = '#fbcfe8';
                        ctx.font = "bold 11px 'Baloo 2'";
                        ctx.fillText("✨ Người Khởi Hành May Mắn ✨", px, py + 22);
                        ctx.fillStyle = '#fff';
                        ctx.font = "bold 13px 'Baloo 2'";
                        ctx.fillText(player.name, px, py + 36);
                    } else {
                        ctx.fillText(player.name, px, py + 26);
                    }`);

b = b.replace(/ctx\.fillText\(\`\$\{p\.name\} \(Lv\.\$\{p\.level\}\)\`, sx, sy \+ 25\);/,
`if(p.equipment?.skin === 'skin_cong_chua') {
                            ctx.fillStyle = '#fbcfe8';
                            ctx.font = "bold 10px 'Baloo 2'";
                            ctx.fillText("✨ Người Khởi Hành May Mắn ✨", sx, sy + 22);
                            ctx.fillStyle = "#f43f5e";
                            ctx.font = "bold 12px 'Baloo 2'";
                            ctx.fillText(\`\${p.name} (Lv.\${p.level})\`, sx, sy + 36);
                        } else {
                            ctx.fillText(\`\${p.name} (Lv.\${p.level})\`, sx, sy + 25);
                        }`);

fs.writeFileSync('./assets/js/game.js', b, 'utf8');
console.log('Added titles');
