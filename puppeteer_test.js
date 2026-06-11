const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    const uri = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
    console.log('Navigating to:', uri);
    await page.goto(uri, { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Testing character creation...');
    try {
        await page.type('#charName', 'TestUser');
        await page.click('#confirmClassBtn');
        await new Promise(r => setTimeout(r, 1000));
    } catch(e) {
        console.log('Char creation step error:', e);
    }

    console.log('Testing opening board game...');
    try {
        // Find a way to call openBoardGame
        await page.evaluate(() => {
            if(typeof openBoardGame === 'function') {
                openBoardGame();
            } else {
                console.log('openBoardGame is not defined!');
            }
        });
        await new Promise(r => setTimeout(r, 1000));
    } catch(e) {
        console.log('Board game open error:', e);
    }
    
    console.log('Testing opening inventory...');
    try {
        await page.evaluate(() => {
            if(typeof togglePanel === 'function') {
                togglePanel('inventory');
            } else {
                console.log('togglePanel is not defined!');
            }
        });
        await new Promise(r => setTimeout(r, 1000));
    } catch(e) {
        console.log('Inventory open error:', e);
    }

    console.log('Done testing.');
    await browser.close();
})();
