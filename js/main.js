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
    showConfirm(
        "Er du sikker på, at du vil slette alt og starte forfra? Denne handling kan ikke fortrydes.", 
        "Nulstil Spil?", 
        () => {
            localStorage.removeItem('foa_v3.0');
            location.reload();
        }
    );
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
    state.maxLevel = 20;
    state.arenaLevel = 20;
    save();
    location.reload();
}

function showPage(p) {
    // Forhindr spilleren i at forlade arenaen under en aktiv kamp
    const currentPage = document.querySelector('.page.active');
    if (currentPage && currentPage.id === 'page-arena' && p !== 'arena') {
        const arenaBattle = document.getElementById('arena-battle');
        if (arenaBattle && arenaBattle.style.display === 'block') {
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
    
    const navBtn = document.getElementById('nav-'+p);
    if(navBtn) navBtn.classList.add('active');
    
    // Luk popups/modals hvis man navigerer væk
    const detailModal = document.getElementById('detailModal');
    if(detailModal) detailModal.style.display = 'none';
    const revealOverlay = document.getElementById('revealOverlay');
    if(revealOverlay) revealOverlay.style.display = 'none';
    
    if (p === 'collection') switchCollectionTab('figures');

        if (p === 'home') {
            if (typeof AudioManager !== 'undefined') AudioManager.bgm.play('bgm-general');
            initHomePage();
        }
        if (p === 'work') {
            if (typeof AudioManager !== 'undefined') AudioManager.bgm.play('bgm-general');
            initWorkPage();
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

    // Skjul REGLER fra menuen (da den nu er i Arena)
    document.querySelectorAll('nav button').forEach(btn => {
        if(btn.innerText.toUpperCase().includes('REGLER') || btn.id === 'nav-rules') {
            btn.style.display = 'none';
        }
    });

    updateUI();
    
    // Indlæs lydindstillinger i UI sliders
    if (typeof AudioManager !== 'undefined') {
        const vBgm = document.getElementById('vol-bgm'); if (vBgm) vBgm.value = AudioManager.settings.bgmVolume;
        const vSfx = document.getElementById('vol-sfx'); if (vSfx) vSfx.value = AudioManager.settings.sfxVolume;
        const vAnn = document.getElementById('vol-announcer'); if (vAnn) vAnn.value = AudioManager.settings.announcerVolume;
        
        // --- QUICK AUDIO MUTE CONTROLS ---
        const style = document.createElement('style');
        style.innerHTML = `
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

function getAchievementProgress(ach) {
    let progress = 0;
    const type = ach.type;

    if (type === 'clicks') progress = state.stats.totalClicks || 0;
    else if (type === 'dust') progress = state.stats.totalDust || 0;
    else if (type === 'wins') progress = state.stats.totalWins || 0;
    else if (type === 'losses') progress = state.stats.totalLosses || 0;
    else if (type === 'collection') {
        const uniqueIds = new Set([...state.ownedAliens, ...state.ownedCrystalites, ...state.ownedWeapons].map(i => i.id));
        progress = uniqueIds.size;
    }
    else if (type === 'level') progress = state.maxLevel || 1;
    else if (type.startsWith('rarity_')) {
        const rarity = type.split('_')[1];
        const uniqueOwnedOfRarity = new Set();
        state.ownedAliens.forEach(owned => {
            const base = alienData.find(a => a.id === owned.id);
            const isSecretRelease = base ? (base.releases ? base.releases.includes('secret') : base.release === 'secret') : false;
            if (base && (base.rarity === rarity || (rarity === 'secret' && isSecretRelease))) {
                uniqueOwnedOfRarity.add(owned.id);
            }
        });
        progress = uniqueOwnedOfRarity.size;
    }
    else if (type.startsWith('group_')) {
        const group = type.split('_')[1];
        const uniqueOwnedOfGroup = new Set();
        state.ownedAliens.forEach(owned => {
            const base = alienData.find(a => a.id === owned.id);
            if (base) {
                const isSecretRelease = base.releases ? base.releases.includes('secret') : base.release === 'secret';
                if (group === 'Monos' && isSecretRelease) {
                    uniqueOwnedOfGroup.add(owned.id);
                } else if (base.group === group) {
                    uniqueOwnedOfGroup.add(owned.id);
                }
            }
        });
        progress = uniqueOwnedOfGroup.size;
    }
    else if (type.startsWith('upgrades_')) {
        if (!state.tasks) return 0;
        const subType = type.split('_')[1]; // 'total', 'manual', 'passive'
        let totalLevels = 0;
        for (const taskId in state.tasks) {
            const taskInfo = taskData[taskId];
            if (!taskInfo) continue;

            if (subType === 'total') {
                totalLevels += state.tasks[taskId].level;
            } else if (subType === 'manual' && taskInfo.type === 'manual') {
                totalLevels += state.tasks[taskId].level;
            } else if (subType === 'passive' && taskInfo.type === 'passive') {
                totalLevels += state.tasks[taskId].level;
            }
        }
        progress = totalLevels;
    }
    else if (type === 'max_power') {
        let count = 0;
        state.ownedAliens.forEach(owned => {
            const base = alienData.find(a => a.id === owned.id);
            let maxBasePower = -1;
            if (base && base.powerRanges && base.powerRanges[owned.release]) maxBasePower = base.powerRanges[owned.release][1];
            else if (base && base.powerRange) maxBasePower = base.powerRange[1];
            
            if (maxBasePower !== -1 && owned.power === maxBasePower) count++;
        });
        progress = count;
    }
    return progress;
}

function checkAchievements() {
    if (!state.notifiedAchievements) state.notifiedAchievements = [];
    let hasUnclaimed = false;

    achievementsData.forEach(ach => {
        const progress = getAchievementProgress(ach);

        if (progress >= ach.target) {
            // Tjek for notifikation
            if (!state.notifiedAchievements.includes(ach.id)) {
                showNotification(ach);
                state.notifiedAchievements.push(ach.id);
                save();
            }
            // Tjek for rød prik
            if (!state.claimedAchievements.includes(ach.id)) {
                hasUnclaimed = true;
            }
        }
    });

    const badge = document.getElementById('ach-badge');
    if (badge) badge.style.display = hasUnclaimed ? 'block' : 'none';
}

function showNotification(ach) {
    if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'message');

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div style="font-size:2rem;">🏆</div>
        <div>
            <div style="font-weight:bold; color:var(--gold); text-transform:uppercase; font-size:0.8rem;">Trofæ Låst Op!</div>
            <div style="font-size:1.1rem; font-weight:bold;">${ach.name}</div>
        </div>
    `;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Fjern igen
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 4000);
}

// Kør achievement check jævnligt
setInterval(checkAchievements, 2000);

function switchWorkTab(tab) {
    state.activeWorkTab = tab;
    renderWorkPage();
}

function initWorkPage() {
    const page = document.getElementById('page-work');
    if (!page || page.dataset.initialized) return;

    page.innerHTML = `
        <div class="page-content">
            <h2 class="page-title" style="color:var(--gold); text-transform:uppercase; letter-spacing:2px;">Tjen Penge</h2>

            <div class="stats-container">
                <div class="stat-box">
                    <div class="stat-label">KR. / KLIK</div>
                    <div id="ui-click-power" class="stat-value" style="color:var(--blue);">1.00</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">KR. / SEK</div>
                    <div id="ui-auto-power" class="stat-value" style="color:var(--green);">0.00</div>
                </div>
            </div>

            <div class="work-grid">
                <div class="work-grid-left">
                        <div style="color:#aaa; font-weight:bold; margin-bottom:10px; font-size:0.9rem; letter-spacing:1px; text-transform:uppercase;">Klik her for at tjene penge</div>
                    <button id="work-btn" onclick="manualWork(event)">
                        <img id="work-gif" src="assets/click_gifs/samle_pant.gif">
                    </button>
                    <div style="margin-top:15px; text-align:center;">
                        <button onclick="devUnlockAll()" style="background:transparent; border:1px solid #333; color:#444; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.7rem;">DEV: UNLOCK ALL</button>
                    </div>
                </div>
                <div class="work-grid-right">
                    <div class="work-tabs">
                        <button id="tab-manual" class="work-tab-btn" onclick="switchWorkTab('manual')">MANUELT ARBEJDE</button>
                        <button id="tab-passive" class="work-tab-btn" onclick="switchWorkTab('passive')">PASSIV INDKOMST</button>
                    </div>
                    <div id="work-tasks-container" class="work-tasks-grid"></div>
                </div>
            </div>
        </div>
    `;
    page.dataset.initialized = 'true';
    renderWorkPage();
}

function renderWorkPage() {
    if (!state.activeWorkTab) state.activeWorkTab = 'manual';

    const tabMan = document.getElementById('tab-manual');
    const tabPas = document.getElementById('tab-passive');
    if(tabMan) tabMan.className = state.activeWorkTab === 'manual' ? 'work-tab-btn active' : 'work-tab-btn';
    if(tabPas) tabPas.className = state.activeWorkTab === 'passive' ? 'work-tab-btn active' : 'work-tab-btn';

    const container = document.getElementById('work-tasks-container');
    if (!container) return;
    container.innerHTML = '';

    for (const taskId in taskData) {
        const task = taskData[taskId];
        if (!state.tasks[taskId]) state.tasks[taskId] = { level: 0 };
        const currentLevel = state.tasks[taskId].level;
        const maxLevel = task.maxLevel || task.upgrades.length;

        if (task.isUnlocked && !task.isUnlocked(state)) {
            continue; 
        }

        if (state.activeWorkTab === 'manual' && task.type !== 'manual') continue;
        if (state.activeWorkTab === 'passive' && task.type !== 'passive') continue;
        
        const isMaxed = currentLevel >= maxLevel;
        const upgrade = isMaxed ? task.upgrades[maxLevel - 1] : task.upgrades[currentLevel];
        const canAfford = state.currency >= upgrade.cost;
        
        let btnStyle = '';
        let btnClass = 'btn-upg';
        
        if (!isMaxed) {
            if (canAfford) {
                btnClass += ' can-afford';
            } else {
                const progress = (state.currency / upgrade.cost) * 100;
                btnStyle = `background: linear-gradient(90deg, #666 ${progress}%, #222 ${progress}%); color: #fff; border: 1px solid #444;`;
            }
        }

        const bonusText = isMaxed ? 'MAX Niveau' : `+${formatMoney(upgrade.power)} Kr./${task.type === 'manual' ? 'klik' : 'sek'}`;
        const nextUpgradeName = isMaxed ? "Alt opgraderet!" : upgrade.name;

        const taskHtml = `
            <div class="upgrade-card">
                <div class="card-header">
                    <span class="card-icon">${task.icon}</span>
                    <span class="card-name">${task.name}</span>
                </div>
                <div class="card-body">
                    <div class="card-level">Niveau ${currentLevel}</div>
                    <div style="font-size:0.85rem; color:#aaa; margin-bottom:5px;">${isMaxed ? '' : 'Næste: '}<span style="color:var(--gold);">${nextUpgradeName}</span></div>
                    <div class="card-bonus">${bonusText}</div>
                </div>
                <button class="${btnClass}" style="${btnStyle}" onclick="buyUpgrade('${taskId}')" ${isMaxed ? 'disabled' : ''}>
                    ${isMaxed ? 'MAX' : `Køb: ${formatMoney(upgrade.cost)} Kr.`}
                </button>
            </div>
        `;
        container.innerHTML += taskHtml;
    }
}

function renderAchievements() {
    const page = document.getElementById('page-achievements');
    if(!page) return;

    // Udvidet for at inkludere alle trofæ-typer
    const categories = {
        'economy': { title: 'Økonomi & Slid', icon: '💰', types: ['clicks', 'dust', 'upgrades_total', 'upgrades_manual', 'upgrades_passive'] },
        'collection': { title: 'Mester Samler', icon: '📖', types: ['collection', 'rarity_rare', 'rarity_legendary', 'rarity_mythic', 'group_Bluspews', 'group_Dredrocks', 'group_Gangreens', 'group_RAMMs', 'group_Mutants', 'max_power'] },
        'arena': { title: 'Gladiator', icon: '⚔️', types: ['wins', 'level', 'losses'] },
        'secrets': { title: 'Hemmeligheder', icon: '👻', types: ['rarity_secret', 'group_Monos'] }
    };

    if (!currentAchievementCategory) {
        // --- GRID VIEW (KATEGORIER) ---
        let gridHtml = `
            <div style="text-align:center; max-width:800px; margin:0 auto;">
                <h2 style="color:var(--gold); text-transform:uppercase; letter-spacing:2px;">TROFÆER</h2>
                <p style="color:#aaa; margin-bottom:30px;">Vælg en kategori for at se dine fremskridt.</p>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px;">
        `;

        for (const [key, cat] of Object.entries(categories)) {
            const catAch = achievementsData.filter(a => cat.types.includes(a.type));
            const total = catAch.length;
            
            // Beregn fremskridt
            let completedCount = 0;
            let hasUnclaimed = false;
            catAch.forEach(ach => {
                const progress = getAchievementProgress(ach);
                if (progress >= ach.target) {
                    completedCount++;
                    if (!state.claimedAchievements.includes(ach.id)) hasUnclaimed = true;
                }
            });

            const pct = total > 0 ? Math.floor((completedCount / total) * 100) : 0;
            const isAllDone = completedCount === total && total > 0;

            const badgeHtml = hasUnclaimed ? `<div style="position:absolute; top:-10px; right:-10px; background:var(--red); color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; box-shadow:0 0 15px var(--red); animation: pulse 2s infinite; z-index:10;">!</div>` : '';

            gridHtml += `
                <div onclick="currentAchievementCategory='${key}'; renderAchievements()" style="position:relative; background:var(--panel); border:1px solid ${isAllDone ? 'var(--gold)' : (hasUnclaimed ? 'var(--red)' : '#333')}; border-radius:15px; padding:20px; cursor:pointer; transition:transform 0.2s; box-shadow: ${hasUnclaimed ? '0 0 15px rgba(255,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.3)'};" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                    ${badgeHtml}
                    <div style="font-size:3rem; margin-bottom:10px;">${cat.icon}</div>
                    <h3 style="color:${isAllDone ? 'var(--gold)' : '#fff'}; margin:0 0 5px 0;">${cat.title}</h3>
                    <div style="color:#aaa; font-size:0.9rem; margin-bottom:15px;">${completedCount} / ${total} Opnået</div>
                    <div style="width:100%; height:8px; background:#222; border-radius:4px; overflow:hidden;">
                        <div style="width:${pct}%; height:100%; background:${isAllDone ? 'var(--gold)' : 'var(--blue)'};"></div>
                    </div>
                </div>
            `;
        }
        gridHtml += `</div></div>`;
        page.innerHTML = gridHtml;

    } else {
        // --- LIST VIEW (DETALJER) ---
        const cat = categories[currentAchievementCategory];
        const catAch = achievementsData.filter(a => cat.types.includes(a.type));

        let listHtml = `
            <div style="text-align:center; max-width:800px; margin:0 auto;">
                <div style="display:flex; align-items:center; justify-content:center; gap:15px; margin-bottom:20px;">
                    <button onclick="currentAchievementCategory=null; renderAchievements()" style="background:#333; border:none; color:#fff; width:40px; height:40px; border-radius:50%; cursor:pointer; font-weight:bold; font-size:1.2rem;">⬅</button>
                    <h2 style="color:var(--gold); text-transform:uppercase; letter-spacing:2px; margin:0;">${cat.icon} ${cat.title}</h2>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
        `;

        catAch.forEach(ach => {
            const isClaimed = state.claimedAchievements.includes(ach.id);
            const progress = getAchievementProgress(ach);
            let isCompleted = false;
            
            if (progress >= ach.target) isCompleted = true;
            
            let pct = Math.min(100, Math.floor((progress / ach.target) * 100));
            
            let btnHtml = '';
            if (isClaimed) {
                btnHtml = `<button disabled style="background:#333; color:#aaa; border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">MODTAGET</button>`;
            } else if (isCompleted) {
                btnHtml = `<button onclick="claimAchievement(event, '${ach.id}')" style="background:var(--green); color:#000; border:none; padding:10px 20px; border-radius:5px; font-weight:bold; cursor:pointer; animation:pulse 2s infinite;">HENT ${ach.reward} KR.</button>`;
            } else {
                btnHtml = `<div style="text-align:right; color:#666; font-size:0.8rem;">${Math.floor(progress)} / ${ach.target}</div>`;
            }

            listHtml += `
                <div style="background:var(--panel); border:1px solid ${isCompleted ? 'var(--gold)' : '#333'}; padding:15px; border-radius:10px; display:flex; align-items:center; justify-content:space-between; opacity:${isClaimed ? 0.6 : 1};">
                    <div style="text-align:left; flex-grow:1;">
                        <div style="font-weight:bold; color:${isCompleted ? 'var(--gold)' : '#fff'}; font-size:1.1rem;">${ach.name}</div>
                        <div style="color:#aaa; font-size:0.9rem; margin-bottom:5px;">${ach.desc}</div>
                        <div style="width:100%; max-width:300px; height:6px; background:#222; border-radius:3px; overflow:hidden;">
                            <div style="width:${pct}%; height:100%; background:${isCompleted ? 'var(--gold)' : 'var(--blue)'};"></div>
                        </div>
                    </div>
                    <div style="margin-left:20px;">${btnHtml}</div>
                </div>
            `;
        });

        listHtml += `</div></div>`;
        page.innerHTML = listHtml;
    }
}

function claimAchievement(event, id) {
    if(state.claimedAchievements.includes(id)) return;
    const ach = achievementsData.find(a => a.id === id);
    if(ach) {
        state.claimedAchievements.push(id);
        state.currency += ach.reward;
        save();
        renderAchievements();
        
        // Svævende tekst i stedet for popup
        const floatEl = document.createElement('div');
        floatEl.className = 'floating-reward';
        floatEl.innerHTML = `<span style="color:var(--gold); font-size:0.8rem; text-transform:uppercase;">Låst op!</span><br>+${ach.reward} Kr.`;
        
        if (event && event.clientX) {
            floatEl.style.left = event.clientX + 'px';
            floatEl.style.top = event.clientY + 'px';
        } else {
            floatEl.style.left = '50%'; floatEl.style.top = '50%';
        }
        document.body.appendChild(floatEl);
        setTimeout(() => floatEl.remove(), 1500);
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'trophy-claim');
    }
}