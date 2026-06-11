const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('ERR:', err.toString()));
    
    const uri = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
    await page.goto(uri, { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Logging in...');
    try {
        await page.type('#usernameInp', 'Tester');
        await page.click('#classicLoginBtn');
        await new Promise(r => setTimeout(r, 2000));
    } catch(e) {
        console.log('Login error:', e.message);
    }

    console.log('Opening board game...');
    try {
        await page.evaluate(() => {
            if(typeof openBoardGame === 'function') openBoardGame();
        });
        await new Promise(r => setTimeout(r, 1000));
    } catch(e) {
        console.log('Board error:', e.message);
    }
    
    console.log('Done.');
    await browser.close();
})();
