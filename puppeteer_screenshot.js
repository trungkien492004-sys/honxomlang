const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set viewport to mobile size
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    const uri = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
    await page.goto(uri, { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Typing name...');
    try {
        await page.type('#charNameInput', 'TestUser');
        await page.click('#confirmClassBtn');
        await new Promise(r => setTimeout(r, 1000));
    } catch(e) {
        console.log('Char creation step error:', e.message);
    }

    console.log('Opening board game...');
    try {
        await page.evaluate(() => {
            if(typeof openBoardGame === 'function') openBoardGame();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'screenshot_board.png' });
    } catch(e) {
        console.log('Board game open error:', e.message);
    }
    
    console.log('Done.');
    await browser.close();
})();
