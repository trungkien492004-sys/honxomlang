// ===== 🎨 MAP_DECORATIONS.JS — CraftPix Medieval Sprites Manager =====

window.mapDecorations = [];
window.mapDecorationImages = {};

// Register asset paths copied from D:\Đồ họa\PNG
const DECORATION_ASSETS = {
    // Trees
    tree1_field: 'Environment/Cartoon_Medieval_Field_Work_Level_Set_Environment - Tree 01.png',
    tree2_field: 'Environment/Cartoon_Medieval_Field_Work_Level_Set_Environment - Tree 02.png',
    tree1_arena: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Tree 01.png',
    tree2_arena: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Tree 02.png',
    stump: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Stump.png',
    
    // Rocks & Stones
    rock1: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Rock 01.png',
    rock2: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Rock 02.png',
    rock3: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Rock 03.png',
    rock4: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Rock 04.png',
    rock5: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Rock 05.png',
    rock6: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Rock 06.png',
    rock7: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Rock 07.png',
    rock8: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Rock 08.png',
    stone: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Stone.png',
    
    // Barrels & Crates & Sacks
    barrel: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Wooden Barrel.png',
    crate: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Wooden Crate.png',
    sack: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Sack.png',
    bag: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Bag.png',
    
    // Fences & Obstacles & Gates
    fence1: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Fence 01.png',
    fence2: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Fence 02.png',
    fence3: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Fence 03.png',
    barrier1: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Barrier 01.png',
    barrier2: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Barrier 02.png',
    arch: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Arch.png',
    
    // Props & Utilities
    flag: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Flag.png',
    sign1: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Sign 01.png',
    sign2: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Sign 02.png',
    sign3: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Sign 03.png',
    chair: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Chair.png',
    table1: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Table 01.png',
    table2: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Table 02 .png',
    target1: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Target 01.png',
    target2: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Target 02.png',
    shield1: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Shield 01.png',
    sword1: 'Environment/Cartoon_Medieval_Training Arena_Level_Set_Environment - Sword 01.png',
    
    // Buildings - walls and roofs
    wall_a: 'Building/Cartoon_Medieval_Training Arena_Level_Set_Building - Wall A 01.png',
    wall_b: 'Building/Cartoon_Medieval_Training Arena_Level_Set_Building - Wall B 01.png',
    wall_c: 'Building/Cartoon_Medieval_Training Arena_Level_Set_Building - Wall C 01.png',
    roof_a: 'Building/Cartoon_Medieval_Training Arena_Level_Set_Building - Roof A 01.png',
    roof_b: 'Building/Cartoon_Medieval_Training Arena_Level_Set_Building - Roof B 01.png',
    door: 'Building/Cartoon_Medieval_Training Arena_Level_Set_Building - Door 01.png',
    wide_door: 'Building/Cartoon_Medieval_Training Arena_Level_Set_Building - Wide Door 01.png',
    chimney: 'Building/Cartoon_Medieval_Training Arena_Level_Set_Building - Chimney 01.png'
};

// Preload all decoration images
window.loadMapDecorations = function() {
    for (let type in DECORATION_ASSETS) {
        let img = new Image();
        img.src = 'assets/sprites/medieval/' + DECORATION_ASSETS[type];
        window.mapDecorationImages[type] = img;
    }
};

window.generateMapDecorations = function(mapId) {
    window.mapDecorations = [];
    
    // Seeded pseudo-random generator for deterministic layouts
    let seed = 1337;
    function random() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    
    if (mapId === 'world') {
        // 1. BOUNDARY DENSE FORESTS (Top, Bottom, Left, Right edges)
        // Top edge
        for (let x = 60; x < 3940; x += 110 + random() * 50) {
            let y = 60 + random() * 80;
            addDecoration('tree1_field', x, y, 1.2 + random() * 0.3);
        }
        // Bottom edge
        for (let x = 60; x < 3940; x += 110 + random() * 50) {
            let y = 3820 + random() * 80;
            addDecoration('tree2_field', x, y, 1.2 + random() * 0.3);
        }
        // Left edge
        for (let y = 140; y < 3800; y += 110 + random() * 50) {
            let x = 60 + random() * 80;
            addDecoration('tree1_arena', x, y, 1.2 + random() * 0.3);
        }
        // Right edge
        for (let y = 140; y < 3800; y += 110 + random() * 50) {
            let x = 3820 + random() * 80;
            addDecoration('tree2_arena', x, y, 1.2 + random() * 0.3);
        }

        // 2. RỪNG U MINH (x: 200 to 1000, y: 2200 to 3400)
        for (let i = 0; i < 75; i++) {
            let x = 200 + random() * 800;
            let y = 2200 + random() * 1200;
            let type = random() < 0.5 ? 'tree1_field' : 'tree2_field';
            addDecoration(type, x, y, 1.2 + random() * 0.4);
            if (random() < 0.25) {
                addDecoration('stump', x + 25, y + 25, 0.9 + random() * 0.2);
            }
        }

        // 3. ĐỒI CỎ MẶT TRỜI (x: 2800 to 3800, y: 300 to 1200)
        for (let i = 0; i < 35; i++) {
            let x = 2800 + random() * 1000;
            let y = 300 + random() * 900;
            let type = random() < 0.5 ? 'tree1_arena' : 'tree2_arena';
            addDecoration(type, x, y, 1.1 + random() * 0.3);
            if (random() < 0.3) {
                let rType = 'rock' + (Math.floor(random() * 8) + 1);
                addDecoration(rType, x - 30, y + 20, 0.9 + random() * 0.3);
            }
        }

        // 4. KHU LUYỆN CẤP (x: 500 to 1900, y: 3200 to 3850)
        for (let i = 0; i < 30; i++) {
            let x = 500 + random() * 1400;
            let y = 3200 + random() * 600;
            let rType = 'rock' + (Math.floor(random() * 8) + 1);
            addDecoration(rType, x, y, 1.0 + random() * 0.5);
            if (random() < 0.15) {
                addDecoration('sword1', x + 15, y - 5, 1.0);
                addDecoration('shield1', x - 10, y + 10, 1.0);
            }
        }

        // 5. LÀNG TRUNG TÂM (x: 1300 to 2700, y: 1200 to 2200)
        // Gate Arch
        addDecoration('arch', 1520, 1400, 1.4);
        addDecoration('sign1', 1480, 1430, 1.1);
        addDecoration('flag', 1500, 1370, 1.2);
        addDecoration('flag', 1570, 1370, 1.2);

        // Fences around Làng Đèn Lồng
        for (let fx = 1350; fx < 1750; fx += 80) {
            if (Math.abs(fx - 1520) > 60) {
                addDecoration('fence1', fx, 1400, 1.0);
            }
        }

        // Forge area (blacksmith at 2300, 1600)
        addDecoration('barrel', 2260, 1610, 1.1);
        addDecoration('crate', 2240, 1590, 1.1);
        addDecoration('table1', 2340, 1630, 1.1);
        addDecoration('chair', 2320, 1640, 1.0);

        // Barber area (barber at 2640, 1820)
        addDecoration('sign2', 2600, 1800, 1.0);
        addDecoration('barrel', 2670, 1830, 1.0);

        // Elder area (elder at 1800, 1650)
        addDecoration('table2', 1760, 1660, 1.1);
        addDecoration('chair', 1740, 1670, 1.0);
        addDecoration('chair', 1780, 1670, 1.0);

        // Training area targets
        addDecoration('target1', 1900, 1720, 1.2);
        addDecoration('target2', 1950, 1720, 1.2);
        addDecoration('barrier1', 1920, 1750, 1.1);

        // Scattered props
        for (let i = 0; i < 15; i++) {
            let x = 1600 + random() * 800;
            let y = 1450 + random() * 500;
            let r = random();
            if (r < 0.3) addDecoration('barrel', x, y, 1.0);
            else if (r < 0.6) addDecoration('crate', x, y, 1.0);
            else if (r < 0.8) addDecoration('sack', x, y, 1.0);
            else addDecoration('stump', x, y, 1.0);
        }
    } else if (mapId === 'cemetery' || mapId.includes('cave') || mapId.includes('dungeon') || mapId.includes('temple')) {
        // Dungeon environments
        for (let i = 0; i < 35; i++) {
            let x = 200 + random() * 3600;
            let y = 200 + random() * 3600;
            let r = random();
            if (r < 0.4) {
                let rType = 'rock' + (Math.floor(random() * 8) + 1);
                addDecoration(rType, x, y, 1.2 + random() * 0.6);
            } else if (r < 0.7) {
                addDecoration('stone', x, y, 1.3 + random() * 0.5);
            } else if (r < 0.9) {
                addDecoration('barrier2', x, y, 1.1);
            } else {
                addDecoration('sword1', x, y, 1.0);
            }
        }
    } else {
        // Building interiors
        addDecoration('table1', 300, 300, 1.2);
        addDecoration('chair', 270, 300, 1.0);
        addDecoration('chair', 330, 300, 1.0);
        addDecoration('barrel', 150, 200, 1.1);
        addDecoration('crate', 180, 200, 1.1);
        addDecoration('chimney', 500, 150, 1.4);
    }
};

function addDecoration(type, x, y, scale = 1.0) {
    let asset = DECORATION_ASSETS[type];
    if (!asset) return;
    
    let w = 64;
    let h = 64;
    let pivotX = 32;
    let pivotY = 50; // Visual bottom sorting line
    
    if (type.includes('tree')) {
        w = 120; h = 180;
        pivotX = 60; pivotY = 160;
    } else if (type.includes('rock') || type === 'stone') {
        w = 70; h = 60;
        pivotX = 35; pivotY = 45;
    } else if (type === 'arch') {
        w = 180; h = 150;
        pivotX = 90; pivotY = 130;
    } else if (type.includes('fence')) {
        w = 80; h = 50;
        pivotX = 40; pivotY = 40;
    } else if (type.includes('barrel') || type.includes('crate') || type === 'sack' || type === 'bag') {
        w = 40; h = 40;
        pivotX = 20; pivotY = 35;
    } else if (type.includes('sign') || type === 'flag') {
        w = 45; h = 80;
        pivotX = 22; pivotY = 75;
    } else if (type.includes('target')) {
        w = 50; h = 80;
        pivotX = 25; pivotY = 75;
    } else if (type.includes('chair') || type.includes('table')) {
        w = 50; h = 50;
        pivotX = 25; pivotY = 40;
    } else if (type === 'stump') {
        w = 50; h = 45;
        pivotX = 25; pivotY = 38;
    }
    
    window.mapDecorations.push({
        type,
        x,
        y,
        w: w * scale,
        h: h * scale,
        scale,
        pivotX: pivotX * scale,
        pivotY: pivotY * scale
    });
}

// Render a single decoration
window.drawDecoration = function(ctx, dec, camera) {
    let img = window.mapDecorationImages[dec.type];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    
    let sx = dec.x - camera.x - dec.pivotX;
    let sy = dec.y - camera.y - dec.pivotY;
    
    // Draw shadow for 3D depth
    ctx.save();
    ctx.beginPath();
    let shadowW = dec.w * 0.7;
    let shadowH = dec.h * 0.15;
    ctx.ellipse(
        dec.x - camera.x,
        dec.y - camera.y - 2,
        shadowW / 2,
        shadowH / 2,
        0, 0, Math.PI * 2
    );
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();
    ctx.restore();
    
    // Draw sprite image
    ctx.drawImage(img, sx, sy, dec.w, dec.h);
};
