// assets/js/joystick.js

window.joystickVector = { x: 0, y: 0 };
window.joystickActive = false;

document.addEventListener('DOMContentLoaded', () => {
    const zone = document.getElementById('joystickZone');
    const base = document.getElementById('joystickBase');
    const stick = document.getElementById('joystickStick');
    
    if(!zone || !base || !stick) return;

    let maxRadius = base.offsetWidth / 2;
    let centerX = 0;
    let centerY = 0;
    let pointerId = null;

    function getCenter() {
        const rect = base.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
        maxRadius = rect.width / 2;
    }

    function onStart(e) {
        if(window.joystickActive) return;
        e.preventDefault();
        getCenter();
        zone.classList.add('active');
        window.joystickActive = true;
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        if(e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            pointerId = e.touches[0].identifier;
        }
        
        updateStick(clientX, clientY);
    }

    function onMove(e) {
        if(!window.joystickActive) return;
        e.preventDefault();
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        
        if(e.touches) {
            for(let i=0; i<e.touches.length; i++) {
                if(e.touches[i].identifier === pointerId) {
                    clientX = e.touches[i].clientX;
                    clientY = e.touches[i].clientY;
                    break;
                }
            }
        }
        
        updateStick(clientX, clientY);
    }

    function onEnd(e) {
        if(!window.joystickActive) return;
        
        if(e.touches) {
            let found = false;
            for(let i=0; i<e.touches.length; i++) {
                if(e.touches[i].identifier === pointerId) {
                    found = true;
                    break;
                }
            }
            if(found) return; // Pointer hasn't been lifted
        }
        
        e.preventDefault();
        window.joystickActive = false;
        pointerId = null;
        zone.classList.remove('active');
        stick.style.transform = `translate(0px, 0px)`;
        window.joystickVector = { x: 0, y: 0 };
        
        // Dừng nhân vật nếu đang di chuyển bằng joystick
        if(window.player) {
            window.player.targetX = window.player.x;
            window.player.targetY = window.player.y;
        }
    }

    function updateStick(clientX, clientY) {
        let dx = clientX - centerX;
        let dy = clientY - centerY;
        let dist = Math.hypot(dx, dy);
        
        if(dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
        }
        
        stick.style.transform = `translate(${dx}px, ${dy}px)`;
        
        // Tính vector hướng (độ lớn 0-1)
        window.joystickVector = {
            x: dx / maxRadius,
            y: dy / maxRadius
        };
    }

    // Touch events
    zone.addEventListener('touchstart', onStart, {passive: false});
    document.addEventListener('touchmove', onMove, {passive: false});
    document.addEventListener('touchend', onEnd, {passive: false});
    document.addEventListener('touchcancel', onEnd, {passive: false});

    // Mouse events (for testing on PC)
    zone.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
});
