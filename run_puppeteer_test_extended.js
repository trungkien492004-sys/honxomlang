const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('🚀 Starting EXTENDED Puppeteer Test for Xóm Anh Hùng v3.0...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();

    // Set a decent viewport size
    await page.setViewport({ width: 1280, height: 720 });

    page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    page.on('pageerror', err => {
        console.error(`[BROWSER ERROR] Uncaught exception: ${err.message}`);
    });

    const fs = require('fs');
    let indexHtmlPath = path.resolve(__dirname, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
        indexHtmlPath = path.resolve(__dirname, '../../../scratch/xomanhung_v3/index.html');
        if (!fs.existsSync(indexHtmlPath)) {
            indexHtmlPath = path.resolve(__dirname, '../../../../scratch/xomanhung_v3/index.html');
        }
    }
    const fileUrl = 'file:///' + indexHtmlPath.replace(/\\/g, '/');
    console.log(`🔗 Loading page: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'load' });

    // 1. Register new account
    const testUsername = 'test_' + Math.random().toString(36).substring(2, 8);
    const testPassword = 'password123';
    console.log(`🔑 Registering user: ${testUsername}`);
    await page.type('#usernameInp', testUsername);
    await page.type('#passwordInp', testPassword);
    await page.click('#classicRegisterBtn');
    await new Promise(r => setTimeout(r, 3000));

    // Choose S1 server
    console.log('🌐 Selecting Server [S1]...');
    await page.evaluate(() => {
        const sCard = document.querySelector('.class-card');
        if(sCard) sCard.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // 2. Click "Tạo Nhân Vật" slot
    console.log('➕ Clicking "Tạo Nhân Vật" slot...');
    await page.evaluate(() => {
        const slots = document.querySelectorAll('#characterSlotsContainer .class-card');
        // The first slot should be empty/new
        if (slots[0]) slots[0].click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Check if on classScreen
    let activeScreen = await page.evaluate(() => window.currentScreen);
    console.log(`📍 Screen after slot click: ${activeScreen}`);
    if (activeScreen !== 'classScreen') {
        throw new Error(`❌ Not on classScreen! Active screen: ${activeScreen}`);
    }

    // 3. Choose Cop class and click "XUẤT TRẬN ⚔️"
    console.log('👮 Selecting class "cop" and clicking "XUẤT TRẬN"...');
    await page.evaluate(() => {
        const copCard = document.querySelector('.class-card.cop');
        if (copCard) copCard.click();
        const confirmBtn = document.querySelector('#classScreen button.btn');
        if (confirmBtn) confirmBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Check if loreOverlay is display: flex
    const loreDisplay = await page.evaluate(() => {
        const lore = document.getElementById('loreOverlay');
        return lore ? getComputedStyle(lore).display : 'none';
    });
    console.log(`📖 Lore overlay display: ${loreDisplay}`);
    if (loreDisplay !== 'flex') {
        throw new Error('❌ Lore overlay is not visible!');
    }

    // 4. Click "BẮT ĐẦU CHƠI"
    console.log('🎮 Clicking "BẮT ĐẦU CHƠI" in lore overlay...');
    await page.evaluate(() => {
        const startBtn = document.querySelector('#loreOverlay button.btn');
        if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // Check if game screen is active and loreOverlay is hidden
    const gameState = await page.evaluate(() => {
        const active = document.querySelector('.screen.active');
        const lore = document.getElementById('loreOverlay');
        return {
            screen: active ? active.id : null,
            loreVisible: lore ? getComputedStyle(lore).display !== 'none' : false,
            playerX: window.player ? window.player.x : null,
            playerY: window.player ? window.player.y : null
        };
    });
    console.log(`📍 Game State after starting:`, gameState);
    if (gameState.screen !== 'gameScreen') {
        throw new Error(`❌ Not on gameScreen! Active screen: ${gameState.screen}`);
    }
    if (gameState.loreVisible) {
        throw new Error('❌ Lore overlay is still visible after clicking start!');
    }

    // 5. Check Canvas rendering content
    console.log('🎨 Analyzing Game Canvas pixel data...');
    const canvasPixels = await page.evaluate(() => {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        
        // Force a render in case animation frame hasn't triggered or completed yet
        if (typeof renderWorldGraphicsLayers === 'function') {
            renderWorldGraphicsLayers();
        }
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        // Count non-black, non-transparent pixels
        let nonBgCount = 0;
        for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i+1];
            const b = imgData[i+2];
            const a = imgData[i+3];
            // If not fully transparent and not pure black
            if (a > 0 && (r > 20 || g > 20 || b > 20)) {
                nonBgCount++;
            }
        }
        return {
            totalPixels: canvas.width * canvas.height,
            coloredPixels: nonBgCount,
            ratio: nonBgCount / (canvas.width * canvas.height)
        };
    });

    console.log('📊 Canvas Pixel analysis:', canvasPixels);
    if (!canvasPixels || canvasPixels.coloredPixels === 0) {
        throw new Error('❌ The canvas is blank or pure black!');
    }
    
    console.log(`🎉 SUCCESS: The game screen has successfully rendered! Ratio of colored pixels: ${(canvasPixels.ratio * 100).toFixed(2)}%`);
    await browser.close();
    process.exit(0);
})().catch(err => {
    console.error('❌ Extended Test failed with error:', err);
    process.exit(1);
});
