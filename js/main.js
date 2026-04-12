let state = JSON.parse(localStorage.getItem('foa_v3.0')) || {
    currency: 10000, points: 0,
    ownedAliens: [], // inventory
    ownedCards: [], ownedPods: { red: 1, blue: 1, green: 1 }, 
    ownedCrystalites: [], ownedWeapons: [],
    clickLvls: [0,0,0,0], autoLvls: [0,0,0,0],
    arenaLevel: 1, maxLevel: 1,
    stats: { totalClicks: 0, totalDust: 0, totalWins: 0, totalLosses: 0 },
    claimedAchievements: [],
    notifiedAchievements: []
};

if (!state.tasks) { state.tasks = { mowLawn: { level: 0 }, cleanHouse: { level: 0 }, allowance: { level: 0 }, robotMower: { level: 0 }, robotVacuum: { level: 0 } }; }

let currentCollectionTab = 'figures';
let currentAchievementCategory = null;

// Holder styr på om brugeren har klikket på siden endnu (for at undgå autoplay-advarsler)
let hasInteracted = false;

// --- UPGRADE CONSTANTS ---
const MAX_UPGRADE_LVL = 5;
const CLICK_BASE_COST = 50;
const CLICK_COST_MULTIPLIER = 1.8;
const AUTO_BASE_COST = 120;
const AUTO_COST_MULTIPLIER = 2.2;
const TOTAL_CLICK_LEVELS = 4 * MAX_UPGRADE_LVL;
const TOTAL_AUTO_LEVELS = 4 * MAX_UPGRADE_LVL;
const MAX_CLICK_BONUS = 9; // Total 10, base is 1
const MAX_AUTO_BONUS = 3; // Total 3, base is 0

let lastCurrencyUpdate = 0;

function formatMoney(amount) {
    return (Math.floor(amount * 4) / 4).toFixed(2).replace('.', ',');
}

function save() {
    localStorage.setItem('foa_v3.0', JSON.stringify(state));
    updateUI();
}

function resetGame() {
    // Luk sidemenuen, så bekræftelses-dialogen er fuldt synlig på mobil
    const nav = document.querySelector('nav');
    if (nav && nav.classList.contains('open')) {
        toggleNav();
    }

    showConfirm(
        "Er du sikker på, at du vil slette alt og starte forfra? Denne handling kan ikke fortrydes.", 
        "Nulstil Spil?", 
        () => {
            localStorage.removeItem('foa_v3.0');
            location.reload();
        }
    );
}

function toggleNav() {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.classList.toggle('open');
        // Viser/skjuler et mørkt lag bag menuen, så man kan lukke den ved at klikke udenfor
        const overlay = document.getElementById('menu-overlay');
        if (overlay) overlay.style.display = nav.classList.contains('open') ? 'block' : 'none';
    }
}

// --- Custom Modal Functions ---
let confirmCallback = null;

function showAlert(text, title = "Meddelelse", btnText = "OK") {
    const modal = document.getElementById('customModal');
    if (!modal) return;

    document.getElementById('customModalTitle').innerText = title;
    document.getElementById('customModalText').innerHTML = text;
    
    const btnConfirm = document.getElementById('customModalBtnConfirm');
    const btnCancel = document.getElementById('customModalBtnCancel');

    btnConfirm.innerText = btnText;
    btnConfirm.style.background = 'var(--blue)';
    btnConfirm.onclick = closeCustomModal;
    
    btnCancel.style.display = 'none';
    btnConfirm.style.flex = '1 1 100%';

    if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'popup-open');
    modal.style.display = 'flex';
}

function showConfirm(text, title, onConfirm) {
    const modal = document.getElementById('customModal');
    if (!modal) return;

    document.getElementById('customModalTitle').innerText = title;
    document.getElementById('customModalText').innerHTML = text;
    
    const btnConfirm = document.getElementById('customModalBtnConfirm');
    const btnCancel = document.getElementById('customModalBtnCancel');

    confirmCallback = onConfirm;

    btnConfirm.innerText = 'JA';
    btnConfirm.style.background = 'var(--green)';
    btnConfirm.onclick = () => {
        if(typeof confirmCallback === 'function') confirmCallback();
        closeCustomModal();
    };
    
    btnCancel.innerText = 'NEJ';
    btnCancel.style.background = 'var(--red)';
    btnCancel.style.display = 'block';
    btnCancel.onclick = closeCustomModal;

    btnConfirm.style.flex = '1';
    btnCancel.style.flex = '1';

    if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'popup-open');
    modal.style.display = 'flex';
}

function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'popup-close');
    }
    confirmCallback = null; // Reset callback
}

function devUnlockAll() {
    state.maxLevel = 35;
    state.arenaLevel = 35;
    save();
    location.reload();
}

function showPage(p) {
    // Afspil klik-lyd ved navigation
    if (typeof AudioManager !== 'undefined' && hasInteracted) {
        AudioManager.sfx.play('ui', 'click');
    }

    // Tjek om den klikkede knap allerede er aktiv for at implementere "toggle"
    const navBtn = document.getElementById('nav-'+p);
    const isAlreadyActive = navBtn && navBtn.classList.contains('active');

    if (isAlreadyActive) {
        const submenus = {
            'work': document.getElementById('work-submenu'),
            'collection': document.getElementById('collection-submenu'),
            'arena': document.getElementById('arena-submenu'),
            'achievements': document.getElementById('achievements-submenu')
        };
        const sub = submenus[p];
        if (sub) {
            // Toggle synligheden af undermenuen
            sub.style.display = (sub.style.display === 'none' || sub.style.display === '') ? 'flex' : 'none';
        }
        // Afslut funktionen, da vi kun skulle toggle undermenuen, ikke skifte side
        return;
    }

    // Hvis sidemenuen er åben på mobil, luk den når vi navigerer til en ny side
    const nav = document.querySelector('nav');
    if (nav && nav.classList.contains('open')) {
        toggleNav();
    }

    // Forhindr spilleren i at forlade arenaen under en aktiv kamp
    const currentPage = document.querySelector('.page.active');
    if (currentPage && currentPage.id === 'page-arena' && p !== 'arena') {
        const arenaBattle = document.getElementById('arena-battle');
        if (arenaBattle && (arenaBattle.style.display === 'block' || arenaBattle.style.display === 'flex')) {
            // Tjek om kampen rent faktisk er afsluttet
            let isGameOver = false;
            if (typeof battleState !== 'undefined' && battleState) {
                isGameOver = battleState.playerScore >= 4 || battleState.enemyScore >= 4 || battleState.round >= 7;
            }
            
            // Hvis kampen IKKE er slut endnu, blokerer vi navigationen
            if (!isGameOver) {
                showAlert("Du kan ikke forlade Arenaen, mens du er i kamp! Tryk på 'GIV OP' for at trække dig, eller afslut kampen.", "Kamp Igang!");
                return;
            } else {
                // Kampen er slut - sørg for at gemme deres belønning før de navigerer væk!
                save();
            }
        }
    }

    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    
    const page = document.getElementById('page-'+p);
    if(page) page.classList.add('active');
    
    if(navBtn) navBtn.classList.add('active');
    
    // Vis/Skjul Work undermenu i sidemenuen
    const workSub = document.getElementById('work-submenu');
    if (workSub) {
        workSub.style.display = (p === 'work') ? 'flex' : 'none';
    }
    
    // Vis/Skjul Arena undermenu i sidemenuen
    const arenaSub = document.getElementById('arena-submenu');
    if (arenaSub) {
        arenaSub.style.display = (p === 'arena') ? 'flex' : 'none';
    }
    
    // Vis/Skjul Collection undermenu i sidemenuen
    const colSub = document.getElementById('collection-submenu');
    if (colSub) {
        colSub.style.display = (p === 'collection') ? 'flex' : 'none';
    }
    
    // Vis/Skjul Achievements undermenu i sidemenuen
    const achSub = document.getElementById('achievements-submenu');
    if (achSub) {
        achSub.style.display = (p === 'achievements') ? 'flex' : 'none';
    }
    
    // Luk popups/modals hvis man navigerer væk
    const detailModal = document.getElementById('detailModal');
    if(detailModal) detailModal.style.display = 'none';
    const revealOverlay = document.getElementById('revealOverlay');
    if(revealOverlay) revealOverlay.style.display = 'none';
    
    if (p === 'collection') {
        if (typeof switchCollectionTab === 'function') switchCollectionTab('figures');
        updateCollectionSubmenuUI();
    }

        if (p === 'home') {
            if (typeof AudioManager !== 'undefined' && hasInteracted) AudioManager.bgm.play('bgm-general');
            initHomePage();
        }
        if (p === 'work') {
            if (typeof AudioManager !== 'undefined') AudioManager.bgm.play('bgm-general');
            initWorkPage();
            if (typeof updateWorkSubmenuUI === 'function') updateWorkSubmenuUI();
        }
        if (p === 'arena') {
            initArena();
        }
        if (p === 'shop') {
            if (typeof AudioManager !== 'undefined') AudioManager.bgm.play('shop-theme');
            if (typeof initShop === 'function') initShop();
        }
        if (p === 'collection' || p === 'achievements') {
            if (typeof AudioManager !== 'undefined') AudioManager.bgm.play('bgm-general');
        }
        if (p === 'achievements') currentAchievementCategory = null; // Reset visning FØR vi renderer siden
        if (p === 'achievements' && typeof renderAchievements === 'function') {
            renderAchievements();
            if (typeof updateAchievementSubmenuUI === 'function') updateAchievementSubmenuUI();
        }
        
        updateUI();
}

// Håndterer navigation direkte fra den nye undermenu
function navCollectionTab(tab) {
    if (typeof switchCollectionTab === 'function') {
        switchCollectionTab(tab);
    }
    updateCollectionSubmenuUI();
    
    // Luk sidemenuen på mobil, når der navigeres
    const nav = document.querySelector('nav');
    if (nav && nav.classList.contains('open')) {
        toggleNav();
    }
}

// Opdaterer farver og borders i undermenuen, så det matcher det valgte faneblad
function updateCollectionSubmenuUI() {
    document.querySelectorAll('.collection-sub-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderLeftColor = '#444';
        btn.style.color = '#888';
    });
    const activeBtn = document.getElementById('nav-collection-' + currentCollectionTab);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.borderLeftColor = 'var(--red)';
        activeBtn.style.color = '#fff';
    }
}

// Håndterer navigation direkte fra den nye Work undermenu
function navWorkTab(tab) {
    if (typeof switchWorkTab === 'function') {
        switchWorkTab(tab);
    }
    updateWorkSubmenuUI();
    
    // Luk sidemenuen på mobil, når der navigeres
    const nav = document.querySelector('nav');
    if (nav && nav.classList.contains('open')) {
        toggleNav();
    }
}

// Opdaterer farver og borders i undermenuen for Work
function updateWorkSubmenuUI() {
    document.querySelectorAll('.work-sub-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderLeftColor = '#444';
        btn.style.color = '#888';
    });
    const activeBtn = document.getElementById('nav-work-' + (state.activeWorkTab || 'manual'));
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.borderLeftColor = 'var(--red)';
        activeBtn.style.color = '#fff';
    }
}

// Håndterer navigation direkte fra den nye undermenu for Trofæer
function navAchievementTab(tab) {
    currentAchievementCategory = tab;
    if (typeof renderAchievements === 'function') {
        renderAchievements();
    }
    updateAchievementSubmenuUI();
    
    // Luk sidemenuen på mobil, når der navigeres
    const nav = document.querySelector('nav');
    if (nav && nav.classList.contains('open')) {
        toggleNav();
    }
}

// Opdaterer farver og borders i undermenuen for Trofæer
function updateAchievementSubmenuUI() {
    document.querySelectorAll('.ach-sub-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderLeftColor = '#444';
        btn.style.color = '#888';
    });
    const activeTabId = currentAchievementCategory ? currentAchievementCategory : 'overview';
    const activeBtn = document.getElementById('nav-ach-' + activeTabId);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.borderLeftColor = 'var(--red)';
        activeBtn.style.color = '#fff';
    }
}

function rollPower(base, drawnRelease = null) {
    let pr = base.powerRange;
    if (base.powerRanges) {
        pr = (drawnRelease && base.powerRanges[drawnRelease]) ? base.powerRanges[drawnRelease] : Object.values(base.powerRanges)[0];
    }
    
    if (pr) {
        const [min, max] = pr;
        const weightedRandom = Math.pow(Math.random(), 2); 
        const power = Math.floor(weightedRandom * (max - min + 1)) + min;
        return power;
    }
    return Math.floor(Math.random() * 10) + 1;
}

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// --- GLOBAL HELPERS (Moved from shop.js) ---
function addAlienToInventory(base, drawnRelease = null) {
    if (!base) return null;
    
    let actualRelease = drawnRelease;
    if (!base.releases?.includes(actualRelease) && base.releases) actualRelease = base.releases[0];
    if (!actualRelease) actualRelease = base.release;
    
    const isNew = !state.ownedAliens.some(a => a.id === base.id);
    const newItem = {
        instanceId: Date.now() + Math.random(), id: base.id, name: base.name, type: base.type,
        c1: base.c1, c2: base.c2, power: rollPower(base, actualRelease), img: base.img, locked: false,
        group: base.group, rarity: base.rarity, release: actualRelease
    };
    state.ownedAliens.push(newItem);
    
    // Smart Lock Logic
    const group = state.ownedAliens.filter(a => a.id === base.id);
    const maxP = Math.max(...group.map(a => a.power));
    let isUpgrade = false;
    group.forEach(item => {
        if (item.power === maxP && !item.locked) { item.locked = true; isUpgrade = true; }
        else if (item.power < maxP && item.locked) item.locked = false;
    });

    newItem.status = isNew ? "NEW" : (isUpgrade ? "UPGRADE" : "DUP");
    return newItem;
}

function createItemInstance(base, drawnRelease = null) {
     if (!base) return null;
     let actualRelease = drawnRelease;
     if (!base.releases?.includes(actualRelease) && base.releases) actualRelease = base.releases[0];
     if (!actualRelease) actualRelease = base.release;

     // Tjek om vi allerede ejer udstyret
     let isNew = true;
     if (base.group === 'Weapons') {
         isNew = !state.ownedWeapons.some(w => w.id === base.id);
     } else if (base.group === 'Crystalites' || base.group === 'Shadows') {
         isNew = !state.ownedCrystalites.some(p => p.id === base.id) && !(state.ownedShadows && state.ownedShadows.some(p => p.id === base.id));
     }

     return {
        instanceId: Date.now() + Math.random(), id: base.id, name: base.name, type: base.type,
        img: base.img, locked: false, power: 0, release: actualRelease, status: isNew ? 'NEW' : 'DUP',
        group: base.group, rarity: base.rarity // Tilføjet så Pack Opener kan sortere korrekt
    };
}

function createFigureElement(item, owned, status = null, count = 0) {
    if (!item) return document.createElement('div'); // Failsafe hvis der sendes en tom plads (null)
    
    const base = typeof alienData !== 'undefined' ? (alienData.find(a => a.id === item.id) || crystaliteData.find(a => a.id === item.id) || shadowData.find(a => a.id === item.id) || weaponData.find(a => a.id === item.id)) : null;
    
    const container = document.createElement('div');
    container.className = `alien-figure ${owned ? 'owned' : 'not-owned'}`;
    if(owned && item.type !== 'pod' && typeof openDetail === 'function') container.onclick = () => openDetail(item.id);

    if (item.type === 'pod') {
        container.style.background = 'transparent';
        container.style.border = 'none';
        container.innerHTML = `
            <img src="${item.img}" style="width:100px; height:auto; display:block; margin:0 auto; image-rendering:pixelated; filter:drop-shadow(0 4px 5px rgba(0,0,0,0.5));">
            <div style="font-weight:bold; margin-top:5px; color:${item.color || '#666'}; text-align:center;">${item.name}</div>
        `;
        if (count > 1) {
            const cnt = document.createElement('div');
            cnt.style.cssText = "position:absolute; top:0; left:0; background:var(--gold); color:black; font-weight:bold; font-size:0.7rem; padding:2px 5px; border-radius:4px; z-index:5;";
            cnt.innerText = "x" + count;
            container.appendChild(cnt);
        }
        if (status && status !== 'DUP') {
            const stat = document.createElement('div');
            stat.style.cssText = "position:absolute; top:0; right:0; background:var(--red); color:white; font-weight:bold; font-size:0.7rem; padding:2px 5px; border-radius:4px; z-index:5;";
            stat.innerText = status;
            container.appendChild(stat);
        }
        return container;
    }

    const group = base ? base.group : (item.group || '');
    let type = item.type || (base ? base.type : 'none');
    
    let baseClass = 'base-none';
    
    if (!owned) {
        baseClass = 'base-locked';
    } else {
        if (group === 'E-ramm') baseClass = 'base-eramm';
        else if (group === 'Sciroids') baseClass = 'base-sciroid';
        else if (group === 'RAMMs' || type === 'metallic') baseClass = 'base-metallic';
        else if (type === 'hybrid') baseClass = 'base-hybrid';
        else if (type === 'blue') baseClass = 'base-blue';
        else if (type === 'green') baseClass = 'base-green';
        else if (type === 'red') baseClass = 'base-red';
        else if (type === 'weapon') baseClass = 'base-weapon'; 
    }

    const img = document.createElement('img');
    img.className = "alien-gif";
    img.src = base ? base.img : item.img;
    if (base && base.cssFilter) img.style.filter = base.cssFilter;
    
    if (!owned) {
        img.style.filter = "brightness(0) opacity(0.5)";
        container.style.cursor = "default";
    }

    container.appendChild(img);

    const baseEl = document.createElement('div');
    baseEl.className = "figure-base " + baseClass;
    if (type === 'hybrid' && owned) {
        const c1 = base ? base.c1 : item.c1;
        const c2 = base ? base.c2 : item.c2;
        baseEl.style.setProperty('--c1', `var(--${c1 || 'gold'})`);
        baseEl.style.setProperty('--c2', `var(--${c2 || 'gold'})`);
    }
    container.appendChild(baseEl);

    const label = document.createElement('div');
    label.className = "figure-label";
    const pwr = (owned && item.power !== undefined) ? item.power : '?';
    const displayName = owned ? (item.name || (base ? base.name : 'Unknown')) : '?????';
    label.innerHTML = `<span class="figure-name">${displayName}</span><div class="power-badge ${pwr === '?' ? 'hidden-power' : ''}">${pwr}</div>`;
    container.appendChild(label);

    if (count > 1) {
        const cnt = document.createElement('div');
        cnt.style.cssText = "position:absolute; top:0; left:0; background:var(--gold); color:black; font-weight:bold; font-size:0.7rem; padding:2px 5px; border-radius:4px; z-index:5;";
        cnt.innerText = "x" + count;
        container.appendChild(cnt);
    }

    if (status && status !== 'DUP') {
        const stat = document.createElement('div');
        stat.style.cssText = "position:absolute; top:0; right:0; background:var(--red); color:white; font-weight:bold; font-size:0.7rem; padding:2px 5px; border-radius:4px; z-index:5;";
        stat.innerText = status;
        container.appendChild(stat);
    }

    return container;
}

function createAlbumCardElement(card, owned, status = null) {
    const el = document.createElement('div');
    el.style.cssText = "position:relative; background:transparent; border-radius:10px; overflow:hidden;";
    if (owned) { 
        el.className = "hover-pop"; 
        if(typeof openAlbumCardDetail === 'function') el.onclick = () => openAlbumCardDetail(card.id); 
        el.style.cursor = 'pointer';
    }
    const filterStyle = owned ? "" : "filter: grayscale(100%) brightness(40%); opacity: 0.6;";
    el.innerHTML = `<img src="${card.img}" style="width:100%; height:auto; display:block; image-rendering:pixelated; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.5); ${filterStyle}">`;

    if(status && status !== 'DUP') {
        const stat = document.createElement('div');
        stat.style.cssText = "position:absolute; top:5px; right:5px; background:var(--red); color:white; font-weight:bold; font-size:0.7rem; padding:2px 5px; border-radius:4px; z-index:5;";
        stat.innerText = status;
        el.appendChild(stat);
    }
    return el;
}

function updateUI() {
    const currencyEl = document.getElementById('ui-currency');
    const premiumEl = document.getElementById('ui-premium');
    const pointsEl = document.getElementById('ui-jangutz');
    
    const now = Date.now();
    if (currencyEl && (now - lastCurrencyUpdate > 3000)) {
        lastCurrencyUpdate = now;
        const kr = Math.floor(state.currency);
        // Vis kun 0, 25, 50 eller 75 øre (og opdater dermed sjældnere visuelt)
        const oreVal = Math.floor((state.currency - kr) * 4) * 25;
        const ore = oreVal === 0 ? "00" : oreVal.toString();
        currencyEl.innerHTML = `${kr} kr. ${ore} øre`;
    }

    if (pointsEl) {
        pointsEl.innerText = state.points || 0;
    }
    
    // Calculate auto power for UI
    let autoPowerPerSec = 0;
    let clickPower = 1; // Base click power
    if (state.tasks) {
        for (const taskId in state.tasks) {
            const taskInfo = taskData[taskId];
            if (!taskInfo) continue;
            const level = state.tasks[taskId].level;
            if (taskInfo.type === 'passive' && level > 0) {
                 if (taskInfo.isUnlocked && !taskInfo.isUnlocked(state)) continue;
                 for (let i = 0; i < level; i++) {
                    if (taskInfo.upgrades[i]) autoPowerPerSec += taskInfo.upgrades[i].power;
                 }
            }
            // Calculate Click Power for UI
            if (taskInfo.type === 'manual' && level > 0) { // BUGFIX: Should be cumulative
                 for (let i = 0; i < level; i++) {
                     if (taskInfo.upgrades[i]) {
                         clickPower += taskInfo.upgrades[i].power;
                     }
                 }
            }
        }
    }

    // Skjul Kr/sek og Jangutz i toppen, men pas på ikke at skjule Lommepenge hvis de deler container
    const hideWithLabel = (el, labelText) => {
        if (!el || !el.parentElement) return;
        if (currencyEl && el.parentElement.contains(currencyEl)) {
             el.style.display = 'none';
             Array.from(el.parentElement.childNodes).forEach(node => {
                 if (node === el || node === currencyEl || (node.nodeType === 1 && node.contains(currencyEl))) return;
                 if (node.textContent && node.textContent.toUpperCase().includes(labelText)) {
                     if (node.style) node.style.display = 'none';
                     else node.textContent = '';
                 }
             });
        } else {
             el.parentElement.style.display = 'none';
        }
    };

    if (premiumEl) hideWithLabel(premiumEl, 'KR/SEK');
    // if (pointsEl) hideWithLabel(pointsEl, 'JANGUTZ'); // Keep Jangutz visible

    // Skjul Merch fane og knap hvis man ikke ejer noget merch
    const hasMerch = state.ownedMerch && state.ownedMerch.length > 0;
    const navMerchBtn = document.getElementById('nav-collection-merch');
    const tabMerchBtn = document.getElementById('tab-merch');
    if (navMerchBtn) navMerchBtn.style.display = hasMerch ? 'block' : 'none';
    if (tabMerchBtn) tabMerchBtn.style.display = hasMerch ? 'inline-block' : 'none';

    // --- Work Page UI ---
    const workPage = document.querySelector('#page-work');
    if (workPage && workPage.classList.contains('active')) {
        renderWorkPage();
        // Opdater stats på arbejdssiden
        const clickEl = document.getElementById('ui-click-power');
        const autoEl = document.getElementById('ui-auto-power');
        if(clickEl) clickEl.innerText = formatMoney(clickPower);
        if(autoEl) autoEl.innerText = formatMoney(autoPowerPerSec);
        
        // Opdater GIF ved load
        if(typeof workGifs !== 'undefined') {
            const gifIndex = Math.floor(state.stats.totalClicks / 15) % workGifs.length;
            const gifEl = document.getElementById('work-gif');
            const nextGif = workGifs[gifIndex];
            if(gifEl && !gifEl.src.endsWith(nextGif)) gifEl.src = nextGif;
        }
    }

    const colPage = document.querySelector('#page-collection');
    if (colPage && colPage.classList.contains('active')) updateCollection();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Registrer brugerens første klik, så musikken får lov at spille uden fejl
    document.addEventListener('click', () => hasInteracted = true, { once: true });

    if(typeof renderShopButtons === 'function') renderShopButtons();
    
    // Opdater Logo i toppen
    const titles = document.querySelectorAll('h1, h2');
    titles.forEach(t => {
        if(t.innerText.toLowerCase().includes('aliens')) {
            t.innerHTML = `<img src="assets/bgg/logo_foa_sim.gif" style="width:100%; max-width:220px; display:block; margin:0 auto; cursor:pointer;">`;
            t.style.background = 'transparent';
            t.onclick = () => showPage('home');
        }
    });

    // Omdøb WORK knappen til TJEN PENGE
    const workNavBtn = document.getElementById('nav-work');
    if(workNavBtn) workNavBtn.innerText = "💰 TJEN PENGE";

    // Tilføj badge container til Achievements knappen
    const achBtn = document.getElementById('nav-achievements');
    if(achBtn) {
        achBtn.style.position = 'relative';
        const badge = document.createElement('div');
        badge.id = 'ach-badge';
        badge.className = 'nav-badge';
        achBtn.appendChild(badge);
    }

    // Gør Collection header sticky
    const collectionPage = document.getElementById('page-collection');
    const tabFiguresBtn = document.getElementById('tab-figures');
    if (collectionPage && tabFiguresBtn && !collectionPage.querySelector('#sticky-collection-header')) {
        const h2 = collectionPage.querySelector('h2');
        
        // Opgrader Collection H2 til det nye Top Panel automatisk
        if (h2 && !h2.classList.contains('top-panel-header')) {
            h2.className = 'top-panel-header';
            h2.style.borderTop = '2px solid var(--gold)';
            h2.style.borderBottom = '2px solid var(--gold)';
            h2.innerHTML = `<span style="color:var(--gold);">SAMLING</span>`;
        }

        const tabsContainer = tabFiguresBtn.parentElement;
        const controlsContainer = document.getElementById('collection-controls');

        if (h2 && tabsContainer && controlsContainer) {
            const stickyHeader = document.createElement('div');
            stickyHeader.id = 'sticky-collection-header';
            stickyHeader.className = 'collection-sticky-header';
            h2.parentNode.insertBefore(stickyHeader, h2.nextSibling);
            stickyHeader.appendChild(tabsContainer);
            stickyHeader.appendChild(controlsContainer);
        }
    }

    // Skjul den gamle "globale" REGLER knap, men uden at ramme undermenuen
    const oldRulesBtn = document.getElementById('nav-rules');
    if(oldRulesBtn) oldRulesBtn.style.display = 'none';

    updateUI();
    
    // Indlæs lydindstillinger i UI sliders
    if (typeof AudioManager !== 'undefined') {
        const vBgm = document.getElementById('vol-bgm'); if (vBgm) vBgm.value = AudioManager.settings.bgmVolume;
        const vSfx = document.getElementById('vol-sfx'); if (vSfx) vSfx.value = AudioManager.settings.sfxVolume;
        const vAnn = document.getElementById('vol-announcer'); if (vAnn) vAnn.value = AudioManager.settings.announcerVolume;
        
        // --- QUICK AUDIO MUTE CONTROLS ---
        const style = document.createElement('style');
        style.innerHTML = `
            /* Forhindrer double-tap zoom og uønsket markering på mobil */
            * {
                -webkit-tap-highlight-color: transparent;
            }
            body, button, img, .alien-figure, .pack-display, .shop-btn, .hover-pop {
                touch-action: manipulation;
                user-select: none;
                -webkit-user-select: none;
            }
            #quick-audio-controls {
                position: fixed; top: 15px; right: 20px; display: flex; gap: 10px; z-index: 9999;
            }
            .quick-mute-btn {
                background: rgba(0,0,0,0.5); border: 1px solid #444; color: #fff; width: 45px; height: 45px; 
                border-radius: 50%; font-size: 1.2rem; cursor: pointer; transition: 0.2s; 
                display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);
                position: relative;
            }
            .quick-mute-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.1); }
            .quick-mute-btn.muted { border-color: var(--red); color: #666; }
            .quick-mute-btn.muted::after {
                content: ''; position: absolute; width: 60%; height: 3px; background-color: var(--red);
                transform: rotate(-45deg); border-radius: 2px; box-shadow: 0 0 5px rgba(0,0,0,0.8);
            }
            @media (max-width: 768px) {
                #quick-audio-controls { right: 15px; top: 15px; }
            }

            #hamburger-btn {
                display: none; /* Skjult på PC som standard */
                position: fixed;
                top: 15px;
                left: 15px;
                z-index: 10001;
                width: 45px;
                height: 45px;
                background: rgba(0,0,0,0.5);
                border: 1px solid #444;
                border-radius: 50%;
                cursor: pointer;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 5px;
                padding: 10px;
                backdrop-filter: blur(5px);
            }
            #hamburger-btn span {
                display: block;
                width: 100%;
                height: 3px;
                background: #fff;
                border-radius: 2px;
                transition: all 0.2s;
            }

            #menu-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.6);
                z-index: 10001;
            }

            /* Fælles Top-Panel for alle sider */
            .top-panel-header {
                min-height: 70px;
                background: linear-gradient(90deg, #111 0%, #222 50%, #111 100%);
                border-radius: 15px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.3rem;
                font-weight: bold;
                color: #fff;
                text-transform: uppercase;
                letter-spacing: 2px;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.5);
                text-shadow: 0 2px 4px rgba(0,0,0,0.9);
                width: 100%;
                box-sizing: border-box;
            }

            /* --- MOBIL-SPECIFIKKE REGLER (RESPONSIVE) --- */
            @media (max-width: 768px) {
                html {
                    height: 100%;
                    background: var(--bg);
                }
                body {
                    zoom: 0.75; /* Vi zoomer hele siden for at fange alle popups og notifikationer */
                    height: 133.3333vh; /* Kompenserer for zoom, så vi undgår dead-space i bunden */
                    overflow: hidden; /* Forhindrer body i at scrolle */
                }
                nav, #hamburger-btn, #quick-audio-controls {
                    zoom: 1.333333; /* Skalerer UI elementerne op igen, så de holdes i 1.0 størrelse */
                }
                #main-content {
                    margin-left: 0;
                    padding: 10px;
                    padding-bottom: 150px; /* Ekstra luft i bunden så man kan scrolle forbi mobilens menulinje (Safari fix) */
                    box-sizing: border-box;
                    height: 100%;
                    overflow-y: auto; /* Giver KUN main-content en scrollbar */
                    -webkit-overflow-scrolling: touch; /* Giver smooth "momentum" scroll på iOS */
                }
                nav {
                    transform: translateX(-105%);
                    transition: transform 0.3s ease-in-out;
                    position: fixed;
                    z-index: 10002;
                    height: 100%;
                    box-shadow: 5px 0 15px rgba(0,0,0,0.5);
                    /* Gør menuen scrollable hvis indholdet er for højt til skærmen */
                    overflow-y: auto;
                    display: flex; flex-direction: column;
                }
                nav.open {
                    transform: translateX(0);
                }
                #hamburger-btn {
                    display: flex;
                }

                /* Gør hoved-containere på siderne 100% brede */
                #page-arena > div, #page-achievements > div, #page-shop > div,
                .collection-sticky-header, #album-content, .page-content {
                    max-width: 100% !important; /* !important er nødvendig for at overskrive inline styles */
                    padding-left: 0; padding-right: 0;
                }

                /* Gør Arena kamp-vinduet højere på mobil */
                .battle-field {
                    min-height: 65vh;
                }

                /* Arena: Flyt resultat-knapper HELT ned i bunden på mobil */
            .battle-center-overlay.result-overlay-active {
                position: fixed !important;
                top: auto !important;
                bottom: 0 !important;
                left: 0 !important;
                transform: none !important; /* Dette løser buggen! */
                width: 100% !important;
                background: rgba(0,0,0,0.95) !important;
                border-top: 2px solid var(--gold) !important;
                padding-bottom: 25px !important;
                z-index: 9999 !important;
                }

                .result-overlay-active .result-btn-container {
                    display: flex; 
                    flex-wrap: wrap;
                    width: 100%;
                max-width: 100%;
                    padding: 15px;
                    box-sizing: border-box;
                background: transparent;
                }

                .result-overlay-active .result-btn {
                    flex-grow: 1;
                    flex-basis: 40%; /* Giver et 2x2 grid på de fleste mobiler */
                }

                /* Fætter BR Shop Popup på mobil */
                #br-popup-container {
                    flex-direction: column !important;
                    align-items: center !important;
                    right: 0 !important;
                    left: 0 !important;
                }
                #br-popup-bubble {
                    margin-right: 0 !important;
                    margin-bottom: 15px !important;
                    max-width: 85% !important;
                    font-size: 1.1rem !important;
                    padding: 15px !important;
                }
                #br-popup-tail {
                    bottom: -16px !important;
                    right: 50% !important;
                    margin-right: -13px !important;
                    transform: rotate(135deg) !important; /* Får halen til at pege nedad */
                }
                #br-popup-img {
                    width: 220px !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        const qacContainer = document.createElement('div');
        qacContainer.id = 'quick-audio-controls';
        
        const createMuteBtn = (type, icon, title) => {
            const btn = document.createElement('button');
            const isMuted = AudioManager.settings[type + 'Muted'];
            btn.className = 'quick-mute-btn' + (isMuted ? ' muted' : '');
            btn.innerHTML = icon;
            btn.title = title;
            
            btn.onclick = () => {
                const muted = AudioManager.toggleMute(type);
                btn.className = 'quick-mute-btn' + (muted ? ' muted' : '');
            };
            return btn;
        };
        
        qacContainer.appendChild(createMuteBtn('bgm', '🎵', 'Slå musik til/fra'));
        qacContainer.appendChild(createMuteBtn('sfx', '🔊', 'Slå lydeffekter til/fra'));
        document.body.appendChild(qacContainer);
    }
    
    // Start på Home siden
    initHomePage();
    showPage('home');
});