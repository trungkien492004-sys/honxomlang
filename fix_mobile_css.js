const fs = require('fs');

let css = `/* ---- MOBILE UI OVERHAUL ---- */
/* Hamburger Menu */
#mobileMenuToggle {
    display: none;
    position: fixed;
    top: 12px;
    right: 140px;
    width: 42px;
    height: 42px;
    background: rgba(15,15,35,0.9);
    border: 2px solid rgba(255,215,0,0.4);
    border-radius: 10px;
    z-index: 99995; /* TRÊN CẢ BOARD GAME */
    color: white;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    user-select: none;
}

.nav-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
}

/* Virtual Joystick */
#joystickZone {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 150px;
    height: 150px;
    z-index: 40;
    touch-action: none;
    display: none;
    justify-content: center;
    align-items: center;
}
#joystickBase {
    width: 130px;
    height: 130px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    position: relative;
    box-shadow: 0 0 15px rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}
#joystickStick {
    width: 55px;
    height: 55px;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(150,150,150,0.8));
    border-radius: 50%;
    position: absolute;
    box-shadow: 0 5px 15px rgba(0,0,0,0.6);
    transition: transform 0.1s ease-out;
}
#joystickZone.active #joystickStick {
    transition: none;
}

@media (max-width: 1024px) {
    #mobileMenuToggle { display: flex; }
    #joystickZone { display: none !important; }
    
    .top-hud { transform: scale(0.75); transform-origin: top left; top: 5px; left: 5px; z-index: 99996; }
    
    #minimap { width: 75px; height: 75px; }
    .right-top-box { right: 5px; top: 5px; width: 75px; gap: 4px; }
    .right-top-box .btn-sm { font-size: 0.6rem; padding: 3px; }
    #mobileMenuToggle { right: 90px; top: 5px; }
    
    #toastContainer {
        top: 60px !important;
        left: 10px !important;
        transform: scale(0.75) !important;
        transform-origin: top left !important;
        gap: 3px !important;
        z-index: 99999 !important;
    }
    .toast { width: 220px !important; font-size: 0.75rem !important; padding: 5px 10px !important; }
    
    .bottom-hud {
        top: 55px;
        right: 15px;
        left: auto;
        transform: none;
        background: rgba(15,15,35,0.95);
        border: 2px solid rgba(255,215,0,0.3);
        border-radius: 12px;
        padding: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        display: none;
        width: 180px;
        z-index: 99996 !important;
    }
    #hudNavContainer { display: none; flex-direction: column; width: 100%; gap: 6px; }
    #hudNavContainer.open { display: flex; }
    .bottom-hud:has(#hudNavContainer.open) { display: block; }
    
    .nav-btn { width: 100%; text-align: left; padding: 8px 10px; font-size: 0.8rem; justify-content: flex-start; }
    
    .skill-hotbar {
        left: auto;
        right: 15px;
        bottom: 15px;
        transform: none;
        background: none;
        border: none;
        width: 220px;
        height: 220px;
        padding: 0;
        box-shadow: none;
    }
    .skill-hotbar h3 { display: none; }
    #skillButtons { position: relative; width: 100%; height: 100%; display: block; justify-content: unset; }
    .skill-slot { position: absolute; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.6); background: rgba(0,0,0,0.5); }
    .skill-slot .skill-circle, .skill-slot .skill-circle img { width: 100%; height: 100%; }
    .skill-slot .cooldown-ring svg { width: 100%; height: 100%; }
    .skill-slot .cooldown-text { font-size: 0.8rem; }
    .skill-slot .skill-auto-toggle { display: none; }

    .skill-slot[data-slot="1"] { width: 90px; height: 90px; bottom: 0; right: 0; border: 2px solid #fbbf24; }
    .skill-slot[data-slot="1"] .cooldown-text { font-size: 1rem; }
    .skill-slot[data-slot="2"] { width: 65px; height: 65px; bottom: 110px; right: 10px; }
    .skill-slot[data-slot="3"] { width: 65px; height: 65px; bottom: 80px; right: 90px; }
    .skill-slot[data-slot="4"] { width: 65px; height: 65px; bottom: 15px; right: 125px; }

    .game-panel { width: 95vw; height: 85vh; top: 5vh; left: 2.5vw; transform: none; }

    /* ---- BOARD GAME MOBILE PORTRAIT ADJUSTMENTS ---- */
    .board-container {
        width: 98vw !important;
        padding: 10px 5px !important;
        border-radius: 12px !important;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1) !important;
    }
    .board-title { font-size: 1.5rem !important; margin-top: 10px; }
    .board-subtitle { font-size: 0.65rem !important; margin-bottom: 5px; }
    .track-grid {
        margin-bottom: 5px !important;
    }
    .board-cell {
        border-width: 0.5px !important;
    }
    .board-cell .cell-num {
        font-size: 0.4rem !important;
        top: 1px !important;
        left: 2px !important;
    }
    .board-token-large {
        width: 14px !important;
        height: 14px !important;
        border-width: 1px !important;
        font-size: 0.7rem !important;
    }
    .board-center-title {
        font-size: 1rem !important;
    }
    .board-center > div:nth-child(2) > div {
        min-width: 40px !important;
        padding: 4px !important;
    }
    .board-center > div:nth-child(2) > div > div:first-child {
        font-size: 1rem !important;
    }
    .board-center > div:nth-child(2) > div > div:nth-child(2) {
        font-size: 0.5rem !important;
    }
}
`;

fs.writeFileSync('./assets/css/mobile.css', css, 'utf8');
console.log('mobile.css updated successfully.');
