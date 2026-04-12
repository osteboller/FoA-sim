let shopIsBusy = false;
let currentPackIndex = 3;
let isAnimating = false;
let DEV_MODE = false;

function toggleDevMode() {
    DEV_MODE = !DEV_MODE;
    const logoEl = document.getElementById('shop-br-logo');
    
    if (DEV_MODE) {
        if (logoEl) { logoEl.src = 'assets/shop/fatter_br_evil.gif'; logoEl.classList.add('evil-shake'); }
        showAlert(
            `<img src="assets/shop/fatter_br_evil.gif" class="dev-mode-img" style="width:200px; border-radius:10px; border:2px solid var(--red); margin-bottom:15px; filter:drop-shadow(0 0 10px var(--red));"><br>
            <span class="dev-mode-text">DEV-MODE AKTIVERET</span><br>Droprates er blevet markant forbedret!`, 
            '⚠️ ADVARSEL ⚠️'
        );
    } else {
        if (logoEl) { logoEl.src = 'assets/shop/fatter_br.gif'; logoEl.classList.remove('evil-shake'); }
        showAlert(
            `<img src="assets/shop/fatter_br.gif" style="width:200px; border-radius:10px; border:2px solid #444; margin-bottom:15px;"><br>
            <span style="color:var(--green); font-weight:bold; font-size:1.2rem;">DEV-MODE DEAKTIVERET</span><br>Droprates er normale igen.`, 
            "INFO"
        );
    }
}

// Pakke definitioner til Karrusellen
const shopPacks = [
    {
        id: 'blister_it',
        name: 'ITALIENSK BLISTER',
        desc: '2 Aliens (Italienske Exclusives)',
        cost: 25,
        currency: 'Kr.',
        img: 'assets/shop/blister_pack_it.gif',
        color: '#009246',
        reqLevel: 21,
        reqText: 'Låses op i Italien (Niveau 21)'
    },
    {
        id: 'blister_jp',
        name: 'JAPANSK BLISTER',
        desc: '2 Aliens (Japanske Exclusives)',
        cost: 25,
        currency: 'Kr.',
        img: 'assets/shop/blister_pack_jp.gif',
        color: '#bc002d',
        reqLevel: 31,
        reqText: 'Låses op i Japan (Niveau 31)'
    },
    {
        id: 'blister',
        name: 'BLISTER PACK',
        desc: '2 Aliens',
        cost: 10,
        currency: 'Kr.',
        img: 'assets/shop/blister_pack.gif',
        color: '#444'
    },
    {
        id: 'battle',
        name: 'BATTLE PACK',
        desc: '4 Aliens + 1 Mutant + 1 Kort',
        cost: 70,
        currency: 'Kr.',
        img: 'assets/shop/battle_pack.gif',
        color: 'var(--blue)',
        scale: 1.2
    },
    {
        id: 'pod',
        name: 'SPACE POD PACK',
        desc: '4 Aliens + 2 Mutanter + 1 Pod + 1 Kort',
        cost: 100,
        currency: 'Kr.',
        img: 'assets/shop/space_pod_pack.gif',
        color: 'var(--red)'
    },
    {
        id: 'war',
        name: 'WAR PACK',
        desc: '4 Aliens + 2 Mutanter + 1 PP + 2 Våben',
        cost: 150,
        currency: 'Kr.',
        img: 'assets/shop/war_pack.gif',
        color: '#ff5500',
        reqLevel: 6,
        reqText: 'Låses op i Skolegården (Niveau 6)',
        scale: 1.4
    },
    {
        id: 'battleship',
        name: 'SCIROID BATTLESHIP',
        desc: '2 SCIROIDS + 1 Neutralizer + 1 Våben + 3 Kort',
        cost: 1000,
        currency: 'Kr.',
        img: 'assets/shop/sciroid_battleship_box.gif',
        color: '#00ff00',
        special: true,
        reqLevel: 16,
        reqText: 'Låses op hos Rivalerne (Niveau 16)',
        scale: 1.8,
        tagStyle: 'right: -20%;'
    }
];

function setShopBusy(val) { shopIsBusy = val; }

function initShop() {
    const page = document.getElementById('page-shop');
    if(!page) return;

    const logoSrc = DEV_MODE ? 'assets/shop/fatter_br_evil.gif' : 'assets/shop/fatter_br.gif';
    const logoClass = DEV_MODE ? 'evil-shake' : '';

    page.innerHTML = `
        <div id="shop-content" class="shop-content-wrapper">
            <div class="shop-top-bar">
                <div style="margin-bottom: 20px; display:inline-block;">
                    <img id="shop-br-logo" src="${logoSrc}" class="${logoClass}" style="width:100px; height:100px; border-radius:10px; object-fit:cover; border:2px solid #333; cursor:pointer; transition:all 0.2s;" onclick="toggleDevMode()">
                </div>
            </div>
            <button onclick="showDropRates()" class="drop-rates-btn"><span class="drop-rates-icon">📊</span> Drop Rates</button>

            <!-- CAROUSEL AREA -->
            <div class="shop-carousel-wrapper" style="margin-top: 50px;">
                <button class="nav-arrow prev" onclick="navigateShop(-1)">❮</button>
                <div id="pack-content-wrapper">
                    <!-- Content is rendered here -->
                </div>
                <button class="nav-arrow next" onclick="navigateShop(1)">❯</button>
            </div>
            
            <!-- ELITE CLUB SECTION (Rendered from postordre.js) -->
            <div id="elite-container"></div>
        </div>
        
        <div id="shop-batch" style="display:none;"></div>
    `;
    
    renderActivePack();
    const eliteHtml = (typeof renderEliteClub === 'function') ? renderEliteClub() : '';
    document.getElementById('elite-container').innerHTML = eliteHtml;

    // Tilføj swipe-funktionalitet til karrusellen på mobil
    const carouselWrapper = document.querySelector('.shop-carousel-wrapper');
    if (carouselWrapper) {
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwipingHorizontal = null; // null = ukendt, true = horisontalt swipe, false = vertikalt scroll

        carouselWrapper.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isSwipingHorizontal = null;
        }, { passive: true });

        carouselWrapper.addEventListener('touchmove', e => {
            if (isSwipingHorizontal === false) return; // Lad browseren scrolle vertikalt

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(currentX - touchStartX);
            const diffY = Math.abs(currentY - touchStartY);

            if (isSwipingHorizontal === null && (diffX > 5 || diffY > 5)) {
                isSwipingHorizontal = diffX > diffY;
            }

            if (isSwipingHorizontal) {
                e.preventDefault(); // Forhindrer at skærmen scroller op/ned
            }
        }, { passive: false });

        carouselWrapper.addEventListener('touchend', e => {
            if (isSwipingHorizontal !== false) {
                const touchEndX = e.changedTouches[0].clientX;
                const threshold = 50; // Minimum antal pixels der skal swipes
                if (touchEndX < touchStartX - threshold) {
                    navigateShop(1); // Swipe mod venstre -> Næste pakke
                } else if (touchEndX > touchStartX + threshold) {
                    navigateShop(-1); // Swipe mod højre -> Forrige pakke
                }
            }
            isSwipingHorizontal = null;
        }, { passive: true });
    }

    // Tjek om Fætter BR har noget at sige!
    setTimeout(checkShopPopups, 800);
}

function createPackElement(index) {
    const pack = shopPacks[index];
    const currentLevel = state.maxLevel || 1;
    const isLocked = pack.reqLevel && currentLevel < pack.reqLevel;
    const scale = pack.scale || 1;

    const container = document.createElement('div');
    container.className = 'pack-container';
    container.style.setProperty('--pack-color', pack.color);

    container.innerHTML = `
        <h3 class="pack-title">${isLocked ? '?????' : pack.name}</h3>
        <div class="pack-desc">${isLocked ? pack.reqText : pack.desc}</div>
        
        <div class="pack-display" onclick="${isLocked ? '' : `buyPack('${pack.id}')`}" ${!isLocked ? `onmousemove="tiltPack(event)" onmouseleave="resetTilt(event)" ontouchstart="tiltPack(event)" ontouchmove="tiltPack(event)" ontouchend="resetTilt(event)" ontouchcancel="resetTilt(event)"` : ''} style="position:relative; cursor: ${isLocked ? 'default' : 'pointer'};">
            <div class="pack-price-tag ${isLocked ? 'locked' : ''}" style="${pack.tagStyle || ''}">
                ${isLocked ? '<div style="font-size:2rem">🔒</div>' : `<div>${pack.cost}</div><span>KR.</span>`}
            </div>
                <img src="${pack.img}" class="pack-img ${isLocked ? 'locked' : ''}" data-scale="${scale}" style="transform: scale(${scale});">
        </div>
        
        <div class="pack-status-text">
            ${isLocked ? 'LÅST' : 'KLIK PÅ PAKKEN FOR AT KØBE'}
        </div>
    `;
    
    return container;
}

function renderActivePack() {
    const wrapper = document.getElementById('pack-content-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';
    wrapper.appendChild(createPackElement(currentPackIndex));
}

function navigateShop(dir) {
    if (isAnimating) return;
    isAnimating = true;

    if (typeof AudioManager !== 'undefined') {
        AudioManager.sfx.playRandom('shop', 'swipe', 2, false);
    }

    const wrapper = document.getElementById('pack-content-wrapper');
    if (!wrapper || !wrapper.firstElementChild) { isAnimating = false; return; }

    const oldContainer = wrapper.firstElementChild;
    const nextIndex = (currentPackIndex + dir + shopPacks.length) % shopPacks.length;
    const newContainer = createPackElement(nextIndex);

    const animOutClass = dir > 0 ? 'anim-slide-out-left' : 'anim-slide-out-right';
    const animInClass = dir > 0 ? 'anim-slide-in-right' : 'anim-slide-in-left';

    oldContainer.classList.add(animOutClass);
    newContainer.classList.add(animInClass);
    
    wrapper.appendChild(newContainer);

    newContainer.addEventListener('animationend', () => {
        if (oldContainer.parentNode) {
            wrapper.removeChild(oldContainer);
        }
        newContainer.classList.remove(animInClass);
        currentPackIndex = nextIndex;
        isAnimating = false;
    }, { once: true });
}

function resetShopState() {
    document.body.style.overflow = ''; // Nulstil main scrollbar
    shopIsBusy = false;
    const container = document.getElementById('shop-batch');
    if (container) {
        container.onclick = null; // Nulstil klik-hændelsen for baggrunden
        container.innerHTML = "";
        container.className = 'shop-batch-grid'; // Nulstil til standard grid layout
        container.style.display = 'none'; // Sørg for at den skjules igen
        container.style.overflowX = '';
        container.style.overflowY = '';
        container.style.transition = ''; // Nulstil
        container.style.background = ''; // Nulstil special baggrunde
    }
    
    const content = document.getElementById('shop-content');
    if(content) content.style.filter = "none";
    
    // Refresh UI to show updated currency
    updateUI();

    // Tjek om Fætter BR har noget at sige, når man vender tilbage til butikken
    setTimeout(checkShopPopups, 500);
}


function showDropRates() {
    let msg = "";
    if (DEV_MODE) {
        msg = `
            <div class="drop-rates-container">
                <div class="dev-rates-title">
                   👿 DEV-MODE DROP RATES 👿
                </div>
                <div class="dev-rates-box">
                    <p class="rates-text">
                        <strong style="color:var(--gold);">Blister Pack Rates:</strong><br>
                        20% Mutant, 20% RAMM, 20% Secret, 40% Standard
                    </p>
                    <p class="rates-text">
                        <strong style="color:var(--gold);">Andre Pakker (Special Slot):</strong><br>
                        33% Mutant, 33% RAMM, 33% Secret
                    </p>
                    <p class="rates-note">* Alle pakker garanterer unikke figurer.</p>
                </div>
            </div>
        `;
        showAlert(msg, "⚠️ ADVARSEL ⚠️");
    } else {
        msg = `
            <div class="drop-rates-container">
                <h4 class="rates-header">Generelle Drop Rates</h4>
                <p class="rates-desc">Når en pakke indeholder en "Special" figur (Mutant, RAMM, eller Secret), er chancerne som følger:</p>
                <ul class="rates-list">
                    <li><strong>Mutant (Tier 1 & 2):</strong> ~94%</li>
                    <li><strong>RAMM (Tier 3):</strong> ~5%</li>
                    <li><strong>Secret Error Print (Tier 4):</strong> 1%</li>
                </ul>
                <hr style="border-color: #333; margin: 15px 0;">
                <h4 class="rates-header">Pakkernes Indhold</h4>
                <p class="rates-desc">
                    <strong>Blister Pack:</strong> Indeholder 2 figurer. Hver figur har ca. 5% chance for at være en "Special".<br>
                    <strong>Battle Pack:</strong> Garanteret 1 "Special" figur, 4 standard Aliens, 1 Kort.<br>
                    <strong>Space Pod Pack:</strong> Garanteret 2 "Special" figurer, 4 standard Aliens, 1 Pod, 1 Kort.<br>
                    <strong>War Pack:</strong> Garanteret 2 "Special" figurer, 7 standard Aliens, 1 Power Player, 2 Våben, 2 Kort.<br>
                    <strong>SciRoid BattleShip:</strong> Garanteret indhold. Ingen tilfældighed for figurer.
                </p>
            </div>
        `;
        showAlert(msg, "Drop Rates");
    }
}

// --- FÆTTER BR POPUP SYSTEM ---
// --- FATTER BR POPUP SYSTEM ---
let isBRPopupActive = false;

function checkShopPopups() {
    if (!state.seenShopPopups) state.seenShopPopups = [];
    let popupsQueue = [];

    // 1. Velkomstbesked
    if (!state.seenShopPopups.includes('welcome')) {
        popupsQueue.push({ id: 'welcome', text: "Velkommen til Fatter BR! Brug dine lommepenge her på at udvide din Alien-hær." });
    }

    // 2. Tjek for nyligt oplåste pakker
    const currentLevel = state.maxLevel || 1;
    shopPacks.forEach(pack => {
        if (pack.reqLevel && currentLevel >= pack.reqLevel) {
            const unlockId = 'unlocked_' + pack.id;
            if (!state.seenShopPopups.includes(unlockId)) {
                popupsQueue.push({ id: unlockId, text: `Flot klaret i Arenaen! Jeg har lige sat ${pack.name} på hylderne til dig.`, packId: pack.id });
            }
        }
    });

    // 3. Første Våben fundet
    if (state.ownedWeapons && state.ownedWeapons.length > 0) {
        if (!state.seenShopPopups.includes('first_weapon')) {
            popupsQueue.push({ id: 'first_weapon', text: "Sådan min ven! Du har fundet dine første våben. Tag dem med dig i Arenaen og læs det opdaterede afsnit i Regler om våben." });
        }
    }

    // 4. Generation 2 (Niveau 16)
    if (currentLevel >= 16) {
        if (!state.seenShopPopups.includes('gen2_unlocked')) {
            popupsQueue.push({ id: 'gen2_unlocked', text: "Der er kommet nye figurer i pakkerne, men også nogle der er udgået..." });
        }
    }

    // 5. The Vault (Niveau 21)
    if (currentLevel >= 21) {
        if (!state.seenShopPopups.includes('vault_unlocked')) {
            popupsQueue.push({ id: 'vault_unlocked', text: "Oppe i Elite Collector Club kan du nu købe 'The Vault'. Her kan du være heldig at finde Generation 1 figurer, der ellers er udgået!" });
        }
    }

    if (popupsQueue.length > 0) {
        showBRPopup(popupsQueue);
    }
}

function showBRPopup(queue) {
    if (queue.length === 0 || isBRPopupActive) return;
    isBRPopupActive = true;

    const popupData = queue.shift();
    
    let container = document.getElementById('br-popup-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'br-popup-container';
        // Containeren er usynlig for musen, men dens indhold kan klikkes
        container.style.cssText = 'position:fixed; bottom:-450px; right:20px; z-index:10000; display:flex; align-items:flex-end; transition:bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events:none;';
        
        container.innerHTML = `
            <div id="br-popup-bubble" style="background:#fff; color:#000; padding:20px 30px; border-radius:25px; border:4px solid #333; max-width:375px; font-weight:bold; font-size:1.4rem; position:relative; margin-right:20px; margin-bottom:150px; box-shadow:0 5px 15px rgba(0,0,0,0.5); pointer-events:auto; z-index:1;">
                <span id="br-popup-text"></span>
                <div id="br-popup-tail" style="position:absolute; bottom:30px; right:-14px; width:26px; height:26px; background:#fff; border-top:4px solid #333; border-right:4px solid #333; transform:rotate(45deg); border-radius:4px;"></div>
            </div>
                <img id="br-popup-img" src="assets/shop/fatter_br_message.gif" style="width:375px; height:auto; object-fit:contain; filter:drop-shadow(0 5px 15px rgba(0,0,0,0.5)); cursor:pointer; pointer-events:auto; z-index:2;">
        `;
        document.body.appendChild(container);
    }

    document.getElementById('br-popup-text').innerText = popupData.text;
    const imgEl = document.getElementById('br-popup-img');
    imgEl.src = 'assets/shop/fatter_br_message.gif';
    
    const bubble = document.getElementById('br-popup-bubble');
    const tail = document.getElementById('br-popup-tail');

    bubble.style.background = '#fff'; bubble.style.color = '#000'; bubble.style.borderColor = '#333';
    tail.style.background = '#fff'; tail.style.borderColor = '#333';
    imgEl.style.filter = 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))';

    // Dynamisk onclick handling, så han kan udlevere gaver
    const clickHandler = () => {
        if (popupData.onClick) popupData.onClick();
        closeBRPopup(queue);
    };
    imgEl.onclick = clickHandler;
    bubble.onclick = clickHandler;
    bubble.style.cursor = 'pointer';

    // Animer ind
    setTimeout(() => {
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'popup-open');
        container.style.bottom = '20px';
        if (popupData.id && !state.seenShopPopups.includes(popupData.id)) {
            state.seenShopPopups.push(popupData.id);
            save();
        }

        // Hvis der er en pakke tilknyttet, så swipe over til den automatisk!
        if (popupData.packId) {
            const targetIndex = shopPacks.findIndex(p => p.id === popupData.packId);
            if (targetIndex !== -1) {
                autoSwipeTo(targetIndex);
            }
        }

        if (!popupData.requireClick) {
            container.brPopupTimeout = setTimeout(() => closeBRPopup(queue), popupData.duration || 6000);
        } else {
            if (container.brPopupTimeout) clearTimeout(container.brPopupTimeout);
        }
    }, 100);
}

function closeBRPopup(queue = []) {
    const container = document.getElementById('br-popup-container');
    if (container) {
        clearTimeout(container.brPopupTimeout);
        container.style.bottom = '-450px';
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'popup-close');
        setTimeout(() => { isBRPopupActive = false; if (queue.length > 0) showBRPopup(queue); }, 600);
    }
}

function autoSwipeTo(targetIndex) {
    if (currentPackIndex === targetIndex) return;
    if (!isAnimating) {
        let diff = targetIndex - currentPackIndex;
        let dir = diff > 0 ? 1 : -1;
        // Gå den korteste vej i karrusellen
        if (Math.abs(diff) > shopPacks.length / 2) {
            dir = -dir;
        }
        navigateShop(dir);
    }
    setTimeout(() => autoSwipeTo(targetIndex), 50); // Tjek igen lyn hurtigt, hvis den i gang med en animation
}
