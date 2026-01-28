const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const landing = document.getElementById("landing");
const lovePage = document.getElementById("lovePage");
const music = document.getElementById("bgMusic");
const noMessage = document.getElementById("noMessage");

let noClickCount = 0;
let isDodging = false;

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

        noBtn.style.position = "absolute";
        noBtn.style.left = (newX - containerRect.left - noRect.width / 2) + "px";
        noBtn.style.top = (newY - containerRect.top - noRect.height / 2) + "px";
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
        music.play();
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

petals.forEach(petal => {
    petal.addEventListener('click', () => {
        const imgSrc = petal.getAttribute('data-img');
        modalImg.src = imgSrc;
        modalImg.classList.remove('revealed');
        modalImg.classList.remove('zoom-1x', 'zoom-1-5x');
        modalImg.classList.add('zoom-1x');
        boxLid.classList.remove('opened');
        boxOpened = false;
        zoomLevel = 0.24; // Start at 24%
        zoomSlider.value = 24;
        zoomPercentageDisplay.textContent = '24%';
        updateLiquidFill(24);
        translateX = 0;
        translateY = 0;
        modal.classList.remove('hidden');
        zoomControl.classList.add('hidden');
        // Reset inline opacity to ensure image is hidden until box is opened
        modalImg.style.opacity = '0';
        modalImg.style.transform = 'scale(1) translate(0, 0)';
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