let shopIsBusy = false;
let currentPackIndex = 1;
let isAnimating = false;
let DEV_MODE = false;

function toggleDevMode() {
    DEV_MODE = !DEV_MODE;
    const logoEl = document.getElementById('shop-br-logo');
    
    if (DEV_MODE) {
        if (logoEl) { logoEl.src = 'assets/shop/cousin_br_evil.gif'; logoEl.classList.add('evil-shake'); }
        showAlert(
            `<img src="assets/shop/cousin_br_evil.gif" class="dev-mode-img"><br>
            <span class="dev-mode-text">DEV-MODE AKTIVERET</span><br>Droprates er blevet markant forbedret!`, 
            '⚠️ ADVARSEL ⚠️'
        );
    } else {
        if (logoEl) { logoEl.src = 'assets/shop/cousin_br.jpg'; logoEl.classList.remove('evil-shake'); }
        showAlert("Dev-mode er slået fra. Droprates er normale igen.", "INFO");
    }
}

// Pakke definitioner til Karrusellen
const shopPacks = [
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
        desc: '7 Aliens + 2 Mutanter + 1 PP + 2 Våben',
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
        img: 'assets/shop/sciroid_battleship_box.gif', // Nyt asset
        color: '#00ff00',
        special: true,
        reqLevel: 11,
        reqText: 'Låses op hos Rivalerne (Niveau 11)',
        scale: 1.8,
        tagStyle: 'right: -20%;'
    }
];

function setShopBusy(val) { shopIsBusy = val; }

function initShop() {
    const page = document.getElementById('page-shop');
    if(!page) return;

    page.innerHTML = `
        <div id="shop-content" class="shop-content-wrapper">
            <div class="shop-top-bar">
                <div style="margin-bottom: 20px; display:inline-block;">
                    <img id="shop-br-logo" src="assets/shop/cousin_br.jpg" style="width:100px; height:100px; border-radius:10px; object-fit:cover; border:2px solid #333; cursor:pointer; transition:all 0.2s;" onclick="toggleDevMode()">
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
        <h3 class="pack-title">${pack.name}</h3>
        <div class="pack-desc">${isLocked ? pack.reqText : pack.desc}</div>
        
        <div class="pack-display" onclick="${isLocked ? '' : `buyPack('${pack.id}')`}" ${!isLocked ? `onmousemove="tiltPack(event)" onmouseleave="resetTilt(event)"` : ''} style="position:relative; cursor: ${isLocked ? 'default' : 'pointer'};">
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
    shopIsBusy = false;
    const container = document.getElementById('shop-batch');
    if (container) {
        container.innerHTML = "";
        container.className = 'shop-batch-grid'; // Nulstil til standard grid layout
        container.style.display = 'none'; // Sørg for at den skjules igen
    }
    
    const content = document.getElementById('shop-content');
    if(content) content.style.filter = "none";
    
    // Refresh UI to show updated currency
    updateUI();
}

function buyPack(type) {
    if (shopIsBusy) return false;
    
    const pack = shopPacks.find(p => p.id === type);
    if (!pack) return false;

    if (state.currency < pack.cost) {
        showAlert("Du har ikke nok lommepenge til at købe denne pakke.", "Mangler Lommepenge");
        return false;
    }

    shopIsBusy = true;
    state.currency -= pack.cost;
    // Giv Jangutz point som bonus
    state.points = (state.points || 0) + Math.floor(pack.cost / 10);

    const content = document.getElementById('shop-content');
    if(content) content.style.filter = "blur(8px)";

    // --- ITEM GENERATION LOGIC ---
    let itemsToReveal = [];
    
    const currentLevel = state.maxLevel || 1;
    const gen2Unlocked = currentLevel >= 11;
    
    // Filter pools: Exclude all exclusives from normal packs
    const filterPool = (a) => {
        // Liste over releases, der IKKE skal kunne trækkes i standard pakker
        const exclusiveReleases = ['secret', 'japanese', 'italian', 'us', 'special_edition', 'jangutz_exclusive', 'battle_ship_exclusive'];
        if (exclusiveReleases.includes(a.release)) return false;

        // Lås Gen 2 figurer indtil spilleren når det korrekte niveau
        if (a.release === 'gen_2' && !gen2Unlocked) return false;
        return true;
    };

    const standardPool = alienData.filter(a => a.group !== 'Mutants' && a.group !== 'RAMMs' && filterPool(a));
    const mutantPool = alienData.filter(a => a.group === 'Mutants' && filterPool(a));
    const rammPool = alienData.filter(a => a.group === 'RAMMs' && filterPool(a));
    const secretPool = alienData.filter(a => a.release === 'secret');

    // Hold styr på trukne figurer i denne pakke for at undgå dubletter
    const drawnMutants = new Set();
    const drawnAliens = new Set();
    const drawnRamms = new Set();
    const drawnSecrets = new Set();

    const getDevItem = () => {
        const r = Math.random();
        let pool = mutantPool;
        let drawnSet = drawnMutants;

        if (r < 0.33) { pool = mutantPool; drawnSet = drawnMutants; }
        else if (r < 0.66 && rammPool.length > 0) { pool = rammPool; drawnSet = drawnRamms; }
        else if (secretPool.length > 0) { pool = secretPool; drawnSet = drawnSecrets; }
        
        const available = pool.filter(i => !drawnSet.has(i.id));
        const usePool = available.length > 0 ? available : pool;
        const item = usePool[Math.floor(Math.random() * usePool.length)];
        drawnSet.add(item.id);
        return item;
    };

    const getRandomStandard = () => {
        const availableAliens = standardPool.filter(a => !drawnAliens.has(a.id));
        const poolToUse = availableAliens.length > 0 ? availableAliens : standardPool;
        const alien = poolToUse[Math.floor(Math.random() * poolToUse.length)];
        drawnAliens.add(alien.id);
        return alien;
    };

    const getRandomMutantOrRamm = () => {
        if (DEV_MODE) return getDevItem();
        // 1% chance for Secret Error Print (Mono)
        if (Math.random() < 0.01 && secretPool.length > 0) {
             const available = secretPool.filter(i => !drawnSecrets.has(i.id));
             const pool = available.length > 0 ? available : secretPool;
             const item = pool[Math.floor(Math.random() * pool.length)];
             drawnSecrets.add(item.id);
             return item;
        }
        
        // 5% chance for RAMM
        if (Math.random() < 0.05 && rammPool.length > 0) {
             const available = rammPool.filter(i => !drawnRamms.has(i.id));
             const pool = available.length > 0 ? available : rammPool;
             const item = pool[Math.floor(Math.random() * pool.length)];
             drawnRamms.add(item.id);
             return item;
        }
        
        // Find en mutant der ikke er trukket endnu i denne pakke
        const availableMutants = mutantPool.filter(m => !drawnMutants.has(m.id));
        const poolToUse = availableMutants.length > 0 ? availableMutants : mutantPool;
        
        const mutant = poolToUse[Math.floor(Math.random() * poolToUse.length)];
        drawnMutants.add(mutant.id);
        return mutant;
    };

    // --- BATTLESHIP LOGIC ---
    if (type === 'battleship') {
        // 1. Find 2 Sciroids (IDs 63, 64)
        const sciroids = alienData.filter(a => a.group === 'Sciroids');
        sciroids.forEach(s => itemsToReveal.push(addAlienToInventory(s)));

        // 2. Find 1 Neutralizer (ID 407)
        const neutralizerBase = weaponData.find(w => w.id === 407);
        if (neutralizerBase) {
            const nItem = createItemInstance(neutralizerBase);
            state.ownedWeapons.push(nItem);
            itemsToReveal.push(nItem);
        }

        // 3. 1 Random Weapon (excluding Neutralizer)
        const wPool = weaponData.filter(w => w.id !== 407);
        if (wPool.length > 0) {
             const w = wPool[Math.floor(Math.random() * wPool.length)];
             const wItem = createItemInstance(w);
             state.ownedWeapons.push(wItem);
             itemsToReveal.push(wItem);
        }

        // 4. 3 Random Cards
        const cPool = cardData;
        for(let i=0; i<3; i++) {
            const c = cPool[Math.floor(Math.random() * cPool.length)];
            const isNew = !state.ownedCards.includes(c.id);
            if (isNew) state.ownedCards.push(c.id);
            
            itemsToReveal.push({
                instanceId: Date.now() + Math.random(),
                id: c.id, name: c.name, type: 'none', img: c.img,
                status: isNew ? 'NEW' : 'DUP',
                power: undefined // Kort har ingen power
            });
        }

    } else if (type === 'war') {
        // 7 Aliens, 2 Mutants, 1 PP, 2 Weapons, 2 Cards
        for(let i=0; i<7; i++) itemsToReveal.push(addAlienToInventory(getRandomStandard()));
        for(let i=0; i<2; i++) itemsToReveal.push(addAlienToInventory(getRandomMutantOrRamm()));
        
        // PP
        const ppPool = [...crystaliteData, ...shadowData].filter(p => p.release === 'gen_1' || (gen2Unlocked && p.release === 'gen_2'));
        const pp = ppPool[Math.floor(Math.random() * ppPool.length)];
        const ppItem = createItemInstance(pp);
        state.ownedCrystalites.push(ppItem); // Eller ownedShadows, logik i main er lidt blandet, men OK
        itemsToReveal.push(ppItem);

        // Weapons
        let wPool = weaponData.filter(w => w.release !== 'bs_ex');
        for(let i=0; i<2; i++) {
            if (wPool.length === 0) break; // Sikkerhed hvis puljen er tom
            const w = wPool[Math.floor(Math.random() * wPool.length)];
            const wItem = createItemInstance(w);
            state.ownedWeapons.push(wItem);
            itemsToReveal.push(wItem);
            
            // Fjern det trukne våben fra puljen for at undgå dubletter
            wPool = wPool.filter(weapon => weapon.id !== w.id);
        }
        
        // 2 Cards
        const cPool = cardData;
        for(let i=0; i<2; i++) {
            const c = cPool[Math.floor(Math.random() * cPool.length)];
            const isNew = !state.ownedCards.includes(c.id);
            if (isNew) state.ownedCards.push(c.id);
            itemsToReveal.push({
                instanceId: Date.now() + Math.random(),
                id: c.id, name: c.name, type: 'none', img: c.img,
                status: isNew ? 'NEW' : 'DUP',
                power: undefined
            });
        }

    } else if (type === 'pod') {
        // 4 Aliens, 2 Mutants, 1 Pod
        for(let i=0; i<4; i++) itemsToReveal.push(addAlienToInventory(getRandomStandard()));
        for(let i=0; i<2; i++) itemsToReveal.push(addAlienToInventory(getRandomMutantOrRamm()));
        
        const colors = ['red', 'green', 'blue'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        state.ownedPods[color]++;
        itemsToReveal.push({ type: 'pod', name: color.toUpperCase() + ' POD', color: color, img: `assets/pods/${color}_pod.gif` });
        
        // 1 Card
        const cPool = cardData;
        const c = cPool[Math.floor(Math.random() * cPool.length)];
        const isNew = !state.ownedCards.includes(c.id);
        if (isNew) state.ownedCards.push(c.id);
        itemsToReveal.push({
            instanceId: Date.now() + Math.random(),
            id: c.id, name: c.name, type: 'none', img: c.img,
            status: isNew ? 'NEW' : 'DUP',
            power: undefined
        });

    } else if (type === 'battle') {
        // 4 Aliens, 1 Mutant
        for(let i=0; i<4; i++) itemsToReveal.push(addAlienToInventory(getRandomStandard()));
        itemsToReveal.push(addAlienToInventory(getRandomMutantOrRamm()));
        
        // 1 Card
        const cPool = cardData;
        const c = cPool[Math.floor(Math.random() * cPool.length)];
        const isNew = !state.ownedCards.includes(c.id);
        if (isNew) state.ownedCards.push(c.id);
        itemsToReveal.push({
            instanceId: Date.now() + Math.random(),
            id: c.id, name: c.name, type: 'none', img: c.img,
            status: isNew ? 'NEW' : 'DUP',
            power: undefined
        });
    } else {
        // Blister: 2 Aliens
        for(let i=0; i<2; i++) {
            let itemToAdd = null;
            if (DEV_MODE) {
                 // 20% Mutant, 20% RAMM, 20% Secret, 40% Standard
                 const r = Math.random();
                 if (r < 0.20 && mutantPool.length > 0) {
                     const available = mutantPool.filter(i => !drawnMutants.has(i.id));
                     const pool = available.length > 0 ? available : mutantPool;
                     itemToAdd = pool[Math.floor(Math.random() * pool.length)];
                     drawnMutants.add(itemToAdd.id);
                 }
                 else if (r < 0.40 && rammPool.length > 0) {
                     const available = rammPool.filter(i => !drawnRamms.has(i.id));
                     const pool = available.length > 0 ? available : rammPool;
                     itemToAdd = pool[Math.floor(Math.random() * pool.length)];
                     drawnRamms.add(itemToAdd.id);
                 }
                 else if (r < 0.60 && secretPool.length > 0) {
                     const available = secretPool.filter(i => !drawnSecrets.has(i.id));
                     const pool = available.length > 0 ? available : secretPool;
                     itemToAdd = pool[Math.floor(Math.random() * pool.length)];
                     drawnSecrets.add(itemToAdd.id);
                 }
            } else {
                if (Math.random() < 0.05) itemToAdd = getRandomMutantOrRamm();
            }

            if (itemToAdd) {
                // Tjek for dubletter i denne pakke (selvom det er usandsynligt med pools)
                if (itemsToReveal.some(existing => existing.id === itemToAdd.id)) {
                    itemsToReveal.push(addAlienToInventory(getRandomStandard()));
                } else {
                    itemsToReveal.push(addAlienToInventory(itemToAdd));
                }
            } else {
                itemsToReveal.push(addAlienToInventory(getRandomStandard()));
            }
        }
    }

    save();
    
    // Call the new interactive opener
    if (typeof openPackInteractive === 'function') {
        openPackInteractive(itemsToReveal, type);
    } else {
        console.error("pack-opener.js is missing!");
        resetShopState();
    }
    return true;
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
