const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const landing = document.getElementById("landing");
const lovePage = document.getElementById("lovePage");
const music = document.getElementById("bgMusic");
const noMessage = document.getElementById("noMessage");

let noClickCount = 0;
let isDodging = false;

// FLOWER PROGRESSION SYSTEM
const flowerContainers = document.querySelectorAll('.flower-container');
let currentFlowerIndex = 0; // Start with left flower (index 0)
let completedFlowers = []; // Track which flowers are completed
let openedPetals = [[], [], []]; // Track opened petals for each flower

// Lock flowers 1 and 2 initially
function initializeFlowers() {
    flowerContainers.forEach((container, index) => {
        if (index > 0) {
            container.classList.add('flower-locked');
        }
    });
}

// Check if all petals in current flower are opened
function checkFlowerCompletion(flowerIndex) {
    const petalsInFlower = flowerContainers[flowerIndex].querySelectorAll('.petal');
    return openedPetals[flowerIndex].length === petalsInFlower.length;
}

// Unlock next flower
function unlockNextFlower() {
    if (currentFlowerIndex < 2) {
        currentFlowerIndex++;
        flowerContainers[currentFlowerIndex].classList.remove('flower-locked');
        
        if (currentFlowerIndex === 2) {
            // All flowers unlocked - show completion message
            setTimeout(() => {
                alert("🎉 All flowers unlocked! You can now view all photos anytime! 💖");
            }, 500);
        }
    }
}

// Initialize flowers when love page loads
setTimeout(() => {
    if (!lovePage.classList.contains('hidden')) {
        initializeFlowers();
    }
}, 100);

/* NO BUTTON CLICKS */
noBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    noClickCount++;
    
    // Enlarge YES button with each NO click
    const baseSize = 1.3;
    const growthFactor = 0.3;
    const newSize = baseSize + (noClickCount * growthFactor);
    const basePadding = 15;
    const paddingGrowth = 5;
    const newPadding = basePadding + (noClickCount * paddingGrowth);
    
    yesBtn.style.fontSize = newSize + "rem";
    yesBtn.style.padding = newPadding + "px " + (newPadding * 2.5) + "px";
    
    if (noClickCount === 1) {
        noMessage.textContent = "Are you sure? 🥺";
        noBtn.style.animation = "shake 1.2s";
        setTimeout(() => noBtn.style.animation = "", 500);
    } else if (noClickCount === 2) {
        noMessage.textContent = "Are you really sure about this? 😢";
        noBtn.style.animation = "shake 1.2s";
        setTimeout(() => noBtn.style.animation = "", 500);
    } else if (noClickCount === 3) {
        noMessage.textContent = "Are you absolutely positive? 😭";
        noBtn.style.animation = "shake 1.2s";
        setTimeout(() => noBtn.style.animation = "", 500);
    } else if (noClickCount === 4) {
        noMessage.textContent = "Final answer??? 😭";
        noBtn.style.animation = "shake 1.2s";
        setTimeout(() => noBtn.style.animation = "", 500);     
    } else if (noClickCount === 5) {
        noMessage.textContent = "Fine, I give up… 💔 You leave me no choice.";
        noBtn.style.animation = "disappear 1.5s forwards";
        setTimeout(() => noBtn.remove(), 1000);
    }
});

/* SMOOTH DODGE */
const buttonContainer = document.querySelector('.button-container');

function dodge(e) {
    if (noClickCount >= 3 || isDodging) return;
    
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;

    const noRect = noBtn.getBoundingClientRect();
    const containerRect = buttonContainer.getBoundingClientRect();

    const noCenterX = noRect.left + noRect.width / 2;
    const noCenterY = noRect.top + noRect.height / 2;

    const dx = noCenterX - x;
    const dy = noCenterY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const dodgeRadius = 150;

    if (distance < dodgeRadius) {
        isDodging = true;
        
        const angle = Math.atan2(dy, dx);
        const moveDistance = dodgeRadius - distance + 60;

        let newX = noCenterX + Math.cos(angle) * moveDistance;
        let newY = noCenterY + Math.sin(angle) * moveDistance;

        const padding = 20;
        newX = Math.max(containerRect.left + noRect.width / 2 + padding, 
                       Math.min(containerRect.right - noRect.width / 2 - padding, newX));
        newY = Math.max(containerRect.top + noRect.height / 2 + padding, 
                       Math.min(containerRect.bottom - noRect.height / 2 - padding, newY));

        // NO button is already positioned absolutely, just update its position
        noBtn.style.left = (newX - containerRect.left) + "px";
        noBtn.style.top = (newY - containerRect.top) + "px";
        noBtn.style.transform = "translate(-50%, -50%)";
        noBtn.style.transition = "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

        setTimeout(() => {
            isDodging = false;
        }, 350);
    }
}

document.addEventListener("mousemove", dodge);
document.addEventListener("touchmove", dodge);

/* YES CLICK */
yesBtn.addEventListener("click", () => {
    landing.style.animation = "fadeOut 1s forwards";
    setTimeout(() => {
        landing.style.display = "none";
        lovePage.classList.remove("hidden");
        music.volume = 0.5; // Set volume to 50%
        music.play();
        initializeFlowers(); // Initialize flower locks
    }, 1000);
});

/* PETAL CLICKS & IMAGE ZOOM/PAN */
const petals = document.querySelectorAll('.petal');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeBtn = document.querySelector('.close');
const boxLid = document.querySelector('.box-lid');
const chocolateBox = document.querySelector('.chocolate-box');
const imageWrapper = document.querySelector('.image-wrapper');
const zoomControl = document.getElementById('zoomControl');
const zoomSlider = document.getElementById('zoomSlider');
const liquidFill = document.querySelector('.liquid-fill');
const zoomPercentageDisplay = document.querySelector('.zoom-percentage');

let boxOpened = false;
let zoomLevel = 1; // Start at 1x (100%)
let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

petals.forEach((petal, globalIndex) => {
    petal.addEventListener('click', () => {
        // Find which flower this petal belongs to
        let flowerIndex = -1;
        flowerContainers.forEach((container, idx) => {
            if (container.contains(petal)) {
                flowerIndex = idx;
            }
        });

        // Check if this flower is locked
        if (flowerContainers[flowerIndex].classList.contains('flower-locked')) {
            return; // Don't open petal if flower is locked
        }

        // Track this petal as opened
        const petalId = `${flowerIndex}-${globalIndex}`;
        if (!openedPetals[flowerIndex].includes(petalId)) {
            openedPetals[flowerIndex].push(petalId);
        }

        const imgSrc = petal.getAttribute('data-img');
        modalImg.src = imgSrc;
        modalImg.classList.remove('revealed');
        modalImg.classList.remove('zoom-1x', 'zoom-1-5x');
        modalImg.classList.add('zoom-1x');
        boxLid.classList.remove('opened');
        boxOpened = false;
        zoomLevel = 0.24;
        zoomSlider.value = 24;
        zoomPercentageDisplay.textContent = '24%';
        updateLiquidFill(24);
        translateX = 0;
        translateY = 0;
        modal.classList.remove('hidden');
        zoomControl.classList.add('hidden');
        modalImg.style.opacity = '0';
        modalImg.style.transform = 'scale(1) translate(0, 0)';

        // Store current flower index for later check
        modal.dataset.currentFlower = flowerIndex;
    });
});

chocolateBox.addEventListener('click', (e) => {
    if (!boxOpened && e.target !== modalImg) {
        boxLid.classList.add('opened');
        modalImg.classList.add('revealed');
        // Clear inline opacity style to let the revealed class animation show
        modalImg.style.opacity = '';
        boxOpened = true;
        
        // Show zoom control after box opens
        setTimeout(() => {
            zoomControl.classList.remove('hidden');
        }, 800);
    }
});

// Zoom slider functionality
zoomSlider.addEventListener('input', (e) => {
    if (!boxOpened) return;
    
    const sliderValue = parseInt(e.target.value);
    // Convert 0-100 percentage to 0-1 zoom scale (like volume)
    // 0% = invisible (0x), 100% = normal size (1x)
    zoomLevel = sliderValue / 100;
    
    // Update the percentage display
    zoomPercentageDisplay.textContent = sliderValue + '%';
    
    // Update liquid fill height based on zoom percentage
    updateLiquidFill(sliderValue);
    
    // Update cursor style
    if (zoomLevel > 0.1) {
        modalImg.classList.remove('zoom-1x');
        modalImg.classList.add('zoom-1-5x');
    } else {
        modalImg.classList.remove('zoom-1-5x');
        modalImg.classList.add('zoom-1x');
    }
    
    updateImageTransform();
});

function updateLiquidFill(percentage = 0) {
    // Map percentage (0-100%) to liquid height (0%-100%)
    liquidFill.style.height = percentage + '%';
}

function updateImageTransform() {
    const scale = zoomLevel;
    
    // Hide image if zoom is too low
    if (scale < 0.05) {
        modalImg.style.opacity = '0';
    } else {
        modalImg.style.opacity = '1';
    }
    
    // Allow panning at any zoom level (even when zoomed out)
    if (scale > 0.1) {
        // Get dimensions to calculate bounds
        const imgRect = modalImg.getBoundingClientRect();
        const wrapperRect = imageWrapper.getBoundingClientRect();
        
        // Calculate the visible area dimensions
        const visibleWidth = wrapperRect.width;
        const visibleHeight = wrapperRect.height;
        
        // Image dimensions at current scale
        const scaledWidth = (imgRect.width / scale) * scale;
        const scaledHeight = (imgRect.height / scale) * scale;
        
        // Calculate maximum allowed translation
        const maxTranslateX = Math.max(0, (scaledWidth - visibleWidth) / 2 / scale);
        const maxTranslateY = Math.max(0, (scaledHeight - visibleHeight) / 2 / scale);
        
        // Constrain the translation within bounds
        const constrainedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX / scale));
        const constrainedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY / scale));
        
        // Update the actual translate values
        translateX = constrainedX * scale;
        translateY = constrainedY * scale;
        
        // Apply transform with pan
        modalImg.style.transform = `scale(${scale}) translate(${constrainedX}px, ${constrainedY}px)`;
    } else {
        // Reset when zoom is too low
        translateX = 0;
        translateY = 0;
        modalImg.style.transform = `scale(${scale}) translate(0, 0)`;
    }
}

// Pan functionality with mouse
modalImg.addEventListener('mousedown', (e) => {
    if (boxOpened && zoomLevel > 0.1) {
        isPanning = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        e.preventDefault();
    }
});

document.addEventListener('mousemove', (e) => {
    if (isPanning && boxOpened && zoomLevel > 0.1) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateImageTransform();
    }
});

document.addEventListener('mouseup', () => {
    if (isPanning) {
        isPanning = false;
    }
});

// Pan functionality with touch
let touchStartX = 0;
let touchStartY = 0;

modalImg.addEventListener('touchstart', (e) => {
    if (boxOpened && zoomLevel > 0.1 && e.touches.length === 1) {
        isPanning = true;
        touchStartX = e.touches[0].clientX - translateX;
        touchStartY = e.touches[0].clientY - translateY;
        e.preventDefault();
    }
});

modalImg.addEventListener('touchmove', (e) => {
    if (isPanning && boxOpened && zoomLevel > 0.1 && e.touches.length === 1) {
        translateX = e.touches[0].clientX - touchStartX;
        translateY = e.touches[0].clientY - touchStartY;
        updateImageTransform();
        e.preventDefault();
    }
});

modalImg.addEventListener('touchend', () => {
    isPanning = false;
});

closeBtn.addEventListener('click', () => {
    const flowerIndex = parseInt(modal.dataset.currentFlower || '0');
    
    modal.classList.add('hidden');
    zoomControl.classList.add('hidden');
    boxOpened = false;
    zoomLevel = 1;
    zoomSlider.value = 100;
    zoomPercentageDisplay.textContent = '100%';
    updateLiquidFill(100);
    translateX = 0;
    translateY = 0;
    modalImg.classList.remove('zoom-1-5x');
    modalImg.classList.add('zoom-1x');
    modalImg.style.transform = 'scale(1) translate(0, 0)';
    modalImg.style.opacity = '1';

    // Check if current flower is completed
    if (checkFlowerCompletion(flowerIndex) && !completedFlowers.includes(flowerIndex)) {
        completedFlowers.push(flowerIndex);
        
        // Show mini game if not the last flower or not all unlocked
        if (flowerIndex < 2) {
            setTimeout(() => {
                startMiniGame();
            }, 500);
        }
    }
});

// ESC key to close modal or reset zoom
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        if (zoomLevel !== 1) {
            // First ESC: reset zoom to 100%
            zoomLevel = 1;
            zoomSlider.value = 100;
            zoomPercentageDisplay.textContent = '100%';
            updateLiquidFill(100);
            translateX = 0;
            translateY = 0;
            modalImg.classList.remove('zoom-1-5x');
            modalImg.classList.add('zoom-1x');
            updateImageTransform();
        } else {
            // Second ESC or if already at 100%: close modal
            const flowerIndex = parseInt(modal.dataset.currentFlower || '0');
            
            modal.classList.add('hidden');
            zoomControl.classList.add('hidden');
            boxOpened = false;
            zoomLevel = 1;
            zoomSlider.value = 100;
            zoomPercentageDisplay.textContent = '100%';
            updateLiquidFill(100);
            translateX = 0;
            translateY = 0;
            modalImg.classList.remove('zoom-1-5x');
            modalImg.classList.add('zoom-1x');
            modalImg.style.transform = 'scale(1) translate(0, 0)';
            modalImg.style.opacity = '1';

            // Check if current flower is completed
            if (checkFlowerCompletion(flowerIndex) && !completedFlowers.includes(flowerIndex)) {
                completedFlowers.push(flowerIndex);
                
                // Show mini game if not the last flower
                if (flowerIndex < 2) {
                    setTimeout(() => {
                        startMiniGame();
                    }, 500);
                }
            }
        }
    }
});

/* FLOATING EMOJIS */
function floatEmoji(emoji) {
    const span = document.createElement("span");
    if (emoji === "🦋") {
        span.innerHTML = `<span class="butterfly">${emoji}</span>`;
    } else {
        span.innerText = emoji;
    }
    span.style.position = "absolute";
    span.style.left = Math.random() * 100 + "vw";
    span.style.bottom = "-50px";
    span.style.fontSize = Math.random() * 20 + 20 + "px";
    span.style.animation = "float 6s linear";
    document.body.appendChild(span);

    setTimeout(() => span.remove(), 6000);
}

setInterval(() => floatEmoji("❤️"), 400);
setInterval(() => floatEmoji("🦋"), 1200);
setInterval(() => floatEmoji("🌸"), 900);

/* MINI GAME - LOVE CATCHER */
const miniGameModal = document.getElementById('miniGameModal');
const gameCanvas = document.getElementById('gameCanvas');
const catcher = document.getElementById('catcher');
const heartsCollectedEl = document.getElementById('heartsCollected');
const gameTimerEl = document.getElementById('gameTimer');
const gameMessageEl = document.getElementById('gameMessage');

let gameActive = false;
let heartsCollected = 0;
let gameTimeLeft = 30;
let gameInterval;
let spawnInterval;
let catcherX = 50; // percentage

// Start mini game
function startMiniGame() {
    miniGameModal.classList.remove('hidden');
    heartsCollected = 0;
    gameTimeLeft = 30;
    gameActive = true;
    gameMessageEl.classList.add('hidden');
    
    heartsCollectedEl.textContent = '0';
    gameTimerEl.textContent = '30';
    
    // Reset catcher position
    catcherX = 50;
    catcher.style.left = '50%';
    
    // Clear any existing falling items
    document.querySelectorAll('.falling-item').forEach(item => item.remove());
    
    // Start game timer
    gameInterval = setInterval(() => {
        gameTimeLeft--;
        gameTimerEl.textContent = gameTimeLeft;
        
        if (gameTimeLeft <= 0) {
            endMiniGame(false);
        }
    }, 1000);
    
    // Start spawning items
    spawnInterval = setInterval(spawnFallingItem, 800);
}

// Spawn falling items
function spawnFallingItem() {
    if (!gameActive) return;
    
    const item = document.createElement('div');
    item.className = 'falling-item';
    
    // 80% hearts, 20% broken hearts (avoid these)
    const isHeart = Math.random() > 0.2;
    item.textContent = isHeart ? '💖' : '💔';
    item.dataset.type = isHeart ? 'heart' : 'broken';
    
    // Random horizontal position
    const randomX = Math.random() * 90 + 5; // 5% to 95%
    item.style.left = randomX + '%';
    
    // Random fall duration
    const duration = Math.random() * 2 + 3; // 3-5 seconds
    item.style.animationDuration = duration + 's';
    
    gameCanvas.appendChild(item);
    
    // Check for collision
    const collisionChecker = setInterval(() => {
        if (!gameActive || !item.parentElement) {
            clearInterval(collisionChecker);
            return;
        }
        
        checkCollision(item, collisionChecker);
    }, 50);
    
    // Remove item after animation
    setTimeout(() => {
        if (item.parentElement) {
            item.remove();
        }
        clearInterval(collisionChecker);
    }, duration * 1000);
}

// Check collision between catcher and falling item
function checkCollision(item, intervalId) {
    const catcherRect = catcher.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    
    const collision = !(
        catcherRect.right < itemRect.left ||
        catcherRect.left > itemRect.right ||
        catcherRect.bottom < itemRect.top ||
        catcherRect.top > itemRect.bottom
    );
    
    if (collision) {
        clearInterval(intervalId);
        
        if (item.dataset.type === 'heart') {
            // Caught a heart!
            heartsCollected++;
            heartsCollectedEl.textContent = heartsCollected;
            item.remove();
            
            // Check win condition
            if (heartsCollected >= 10) {
                endMiniGame(true);
            }
        } else {
            // Caught a broken heart - lose 1 heart
            heartsCollected = Math.max(0, heartsCollected - 1);
            heartsCollectedEl.textContent = heartsCollected;
            item.remove();
        }
    }
}

// End mini game
function endMiniGame(won) {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    
    // Remove all falling items
    document.querySelectorAll('.falling-item').forEach(item => item.remove());
    
    if (won) {
        gameMessageEl.textContent = '🎉 You Won! Next flower unlocked! 💖';
        gameMessageEl.classList.remove('hidden');
        
        setTimeout(() => {
            miniGameModal.classList.add('hidden');
            unlockNextFlower();
        }, 2000);
    } else {
        gameMessageEl.textContent = '⏰ Time\'s up! Try again!';
        gameMessageEl.classList.remove('hidden');
        
        setTimeout(() => {
            gameMessageEl.classList.add('hidden');
            startMiniGame(); // Restart game
        }, 2000);
    }
}

// Move catcher with mouse
gameCanvas.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    
    const canvasRect = gameCanvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const percentage = (x / canvasRect.width) * 100;
    
    catcherX = Math.max(5, Math.min(95, percentage));
    catcher.style.left = catcherX + '%';
});

// Move catcher with touch
gameCanvas.addEventListener('touchmove', (e) => {
    if (!gameActive) return;
    e.preventDefault();
    
    const canvasRect = gameCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - canvasRect.left;
    const percentage = (x / canvasRect.width) * 100;
    
    catcherX = Math.max(5, Math.min(95, percentage));
    catcher.style.left = catcherX + '%';
});

// Move catcher with keyboard
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    if (e.key === 'ArrowLeft') {
        catcherX = Math.max(5, catcherX - 5);
        catcher.style.left = catcherX + '%';
    } else if (e.key === 'ArrowRight') {
        catcherX = Math.min(95, catcherX + 5);
        catcher.style.left = catcherX + '%';
    }
});