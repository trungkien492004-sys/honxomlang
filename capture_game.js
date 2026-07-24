const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('🚀 Starting screenshot capture script...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERROR] ${err.message}`));
    page.on('requestfailed', request => {
        console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText || 'failed'}`);
    });

    const indexHtmlPath = path.resolve(__dirname, 'index.html');
    const fileUrl = 'file:///' + indexHtmlPath.replace(/\\/g, '/');
    console.log('🔗 Loading page: ' + fileUrl);
    await page.goto(fileUrl, { waitUntil: 'load' });

    // Register
    const testUsername = 'test_' + Math.random().toString(36).substring(2, 8);
    console.log('🔑 Registering user: ' + testUsername);
    await page.type('#usernameInp', testUsername);
    await page.type('#passwordInp', 'password123');
    await page.click('#classicRegisterBtn');
    await new Promise(r => setTimeout(r, 2000));

    // Choose Server
    console.log('🌐 Selecting server S1...');
    await page.evaluate(() => {
        const sCard = document.querySelector('.class-card');
        if(sCard) sCard.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Click slot
    console.log('➕ Clicking character slot...');
    await page.evaluate(() => {
        const slots = document.querySelectorAll('#characterSlotsContainer .class-card');
        if (slots[0]) slots[0].click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Confirm class
    console.log('👩‍🏫 Selecting class "teacher" and clicking confirm...');
    await page.evaluate(() => {
        const teacherCard = document.querySelector('.class-card.teacher');
        if(teacherCard) teacherCard.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
        const confirmBtn = document.querySelector('button.btn[onclick="confirmClass()"]');
        if(confirmBtn) confirmBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Start playing
    console.log('🎮 Clicking BẮT ĐẦU CHƠI...');
    await page.evaluate(() => {
        const btn = document.querySelector('button.btn[onclick="closeLoreOverlay()"]');
        if(btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 4000)); // wait for rendering and sprite load

    const screenshotPath = 'C:/Users/Kien/.gemini/antigravity/brain/5c02bba6-68a2-47d2-b573-1811177cf0bf/game_screenshot.png';
    await page.screenshot({ path: screenshotPath });
    console.log('📸 Screenshot saved to: ' + screenshotPath);
    await browser.close();
})();
