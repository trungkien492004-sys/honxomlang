const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox']});
  const page = await browser.newPage();
  const b64 = fs.readFileSync('assets/memecard/portraits/yuma-v1.png').toString('base64');
  const dataUri = 'data:image/png;base64,' + b64;
  await page.setContent(`
    <div style="display:flex;gap:20px;padding:20px;background:#0c1e30;">
      <div style="width: 100px; height: 100px; border-radius: 12px; border: 2px solid gold; overflow: hidden; background: url('${dataUri}') no-repeat 50% 50% / cover;"></div>
      <div style="width: 100px; height: 100px; border-radius: 12px; border: 2px solid cyan; overflow: hidden; background: url('${dataUri}') no-repeat 50% 40% / cover;"></div>
      <div style="width: 100px; height: 100px; border-radius: 12px; border: 2px solid lime; overflow: hidden; background: url('${dataUri}') no-repeat 50% 30% / cover;"></div>
      <div style="width: 100px; height: 120px; border-radius: 12px; border: 2px solid white; overflow: hidden; background: url('${dataUri}') no-repeat 50% 35% / cover;"></div>
    </div>
  `);
  await page.screenshot({path: 'outputs/yuma-face-preview.png'});
  await browser.close();
  console.log('Preview generated with base64');
})();
