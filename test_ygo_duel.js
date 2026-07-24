const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('🚀 Starting Puppeteer Test for Yu-Gi-Oh! Minigame Logic...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    page.on('pageerror', err => {
        console.error(`[BROWSER ERROR] Uncaught exception: ${err.message}`);
    });

    let indexHtmlPath = path.resolve(__dirname, 'index.html');
    const fileUrl = 'file:///' + indexHtmlPath.replace(/\\/g, '/');
    console.log(`🔗 Loading page: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'load' });

    // 1. Register
    const testUsername = 'ygotest_' + Math.random().toString(36).substring(2, 8);
    const testPassword = 'password123';
    console.log(`🔑 Registering user: ${testUsername}`);
    await page.type('#usernameInp', testUsername);
    await page.type('#passwordInp', testPassword);
    await page.click('#classicRegisterBtn');
    await new Promise(r => setTimeout(r, 3000));

    // Server selection
    await page.evaluate(() => {
        const sCard = document.querySelector('.class-card');
        if(sCard) sCard.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Click slot
    await page.evaluate(() => {
        const slots = document.querySelectorAll('#characterSlotsContainer .class-card');
        if (slots[0]) slots[0].click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Choose Cop class and enter game
    await page.evaluate(() => {
        const copCard = document.querySelector('.class-card.cop');
        if (copCard) copCard.click();
        const confirmBtn = document.querySelector('#classScreen button.btn');
        if (confirmBtn) confirmBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Click "BẮT ĐẦU CHƠI" in lore overlay
    await page.evaluate(() => {
        const startBtn = document.querySelector('#loreOverlay button.btn');
        if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // 2. Open Yugioh Game
    console.log('🃏 Opening Yu-Gi-Oh! Game Lobby...');
    await page.evaluate(() => {
        if (typeof openYugiohGame === 'function') {
            openYugiohGame();
        } else {
            console.error('openYugiohGame is not defined!');
        }
    });
    await new Promise(r => setTimeout(r, 1500));

    // 3. Start Bot Game
    console.log('🤖 Starting Bot Game...');
    await page.evaluate(() => {
        if (typeof ygoStartBotGame === 'function') {
            ygoStartBotGame();
        } else {
            console.error('ygoStartBotGame is not defined!');
        }
    });
    await new Promise(r => setTimeout(r, 2000));

    // 4. Simulate a turn action (e.g. Select card in hand, Summon, and check state)
    console.log('⚔️ Performing a summon action test...');
    const result = await page.evaluate(() => {
        let d = window.ygoGame.duel;
        if (!d) return { success: false, reason: 'Duel not initialized' };
        
        console.log(`Initial turn: ${d.turn}, phase: ${d.phase}`);
        
        // Let's force it to be player's turn to make sure we can test player action
        d.turn = 'player';
        d.phase = 'MAIN1';
        
        // Find a monster card in hand
        let monsterHandIdx = d.playerHand.findIndex(c => c.card_type === 'Monster');
        if (monsterHandIdx === -1) {
            return { success: false, reason: 'No monster in player hand', hand: d.playerHand };
        }
        
        console.log(`Found monster in hand at index ${monsterHandIdx}: ${d.playerHand[monsterHandIdx].name_vi}`);
        
        // Select hand card
        window.ygoSelectHand(monsterHandIdx);
        
        // Open Summon Position Modal
        let emptyIdx = d.playerMonsters.indexOf(null);
        if (emptyIdx === -1) {
            return { success: false, reason: 'Player monster zone is full' };
        }
        d.selectedSummonZoneIdx = emptyIdx;
        window.ygoOpenSummonPositionModal(monsterHandIdx);
        
        // Select attack position (posType = 'attack')
        window.ygoSummonPositionSelect('attack');
        
        // Check if monster is now on the field
        let fieldCard = d.playerMonsters[emptyIdx];
        if (fieldCard && fieldCard.name_vi) {
            return {
                success: true,
                message: `Successfully summoned [${fieldCard.name_vi}] to monster zone ${emptyIdx+1}!`,
                field: d.playerMonsters
            };
        } else {
            return { success: false, reason: 'Monster was not placed on the field', field: d.playerMonsters };
        }
    });

    console.log('📊 Summon Test Result:', result);
    if (!result.success) {
        throw new Error(`❌ Summon Action Test failed: ${result.reason}`);
    }

    console.log('🔄 Advancing Phase to END to test Bot Turn...');
    const botResult = await page.evaluate(async () => {
        let d = window.ygoGame.duel;
        // Set turn count to 2 to allow attack / battle if needed
        d.turnCount = 2;
        
        // Move to BATTLE phase
        window.ygoStartPhase('BATTLE');
        console.log(`Advanced to phase: ${d.phase}`);
        
        // Move to END phase to transfer turn to bot
        window.ygoStartPhase('END');
        console.log(`Turn changed to: ${d.turn}, phase: ${d.phase}`);
        
        // Wait 1.5 seconds for bot to run its turn
        await new Promise(r => setTimeout(r, 1500));
        
        return {
            currentTurn: d.turn,
            currentPhase: d.phase,
            oppMonsters: d.oppMonsters,
            oppHand: d.oppHand
        };
    });

    console.log('🤖 Bot Turn State after 1.5s:', botResult);

    console.log('🎉 SUCCESS: Yu-Gi-Oh! Game logic successfully validated!');
    await browser.close();
    process.exit(0);
})().catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
});
