function switchCollectionTab(tab) {
    currentCollectionTab = tab;
    document.getElementById('tab-figures').className = tab === 'figures' ? 'tab-btn active' : 'tab-btn';
    document.getElementById('tab-album').className = tab === 'album' ? 'tab-btn active' : 'tab-btn';
    const gearBtn = document.getElementById('tab-gear');
    if(gearBtn) gearBtn.className = tab === 'gear' ? 'tab-btn active' : 'tab-btn';
    document.getElementById('collection-controls').style.display = tab === 'figures' ? 'flex' : 'none';
    updateCollection();
}

function updateCollection() {
    const album = document.getElementById('album-content');
    if (!album) return; 
    album.innerHTML = "";

    if (currentCollectionTab === 'album') {
        const groups = ["Mutants", "Weapons", "Pods", "RAMMs", "Crystalites", "Shadows", "Sciroids", "E-ramm"];
        groups.forEach(groupName => {
            const groupCards = cardData.filter(c => c.group === groupName);
            if (groupCards.length > 0) {
                const section = document.createElement('div');
                section.className = "album-section";
                section.innerHTML = `<div class="section-title">${groupName}</div>`;
                const grid = document.createElement('div');
                grid.className = "row-grid";
                groupCards.forEach(card => {
                    const owned = state.ownedCards.includes(card.id);
                grid.appendChild(createAlbumCardElement(card, owned));
                });
                section.appendChild(grid);
                album.appendChild(section);
            }
        });
        return;
    }

    if (currentCollectionTab === 'gear') {
        // Bluspew: Acid Icer (401), Discstroyer (404), Blue Pod
        renderGearGroup(album, "Bluspew Gear", [401, 404], 'blue');
        
        // Dredrock: Rock Drocket (403), Spykosphere (406), Red Pod
        renderGearGroup(album, "Dredrock Gear", [403, 406], 'red');
        
        // Gangreen: Ooze Wad (402), Web Blaster (405), Green Pod
        renderGearGroup(album, "Gangreen Gear", [402, 405], 'green');
        
        // Neutralizer (407) - Special
        renderGearGroup(album, "Special Gear", [407], null);
        return;
    }

    // FIGURES VIEW
    const sortBy = document.getElementById('sortSelect').value;
    if (sortBy === 'id') {
        const sortWithOrder = (items, order) => {
            return items.sort((a, b) => {
                const idxA = order.indexOf(a.id);
                const idxB = order.indexOf(b.id);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return a.id - b.id;
            });
        };

        // 1. Bluspews
        const bluspewOrder = [1, 2, 3, 7, 9, 4, 5, 6, 8, 10];
        renderSection(album, "Bluspews", sortWithOrder(alienData.filter(a => a.group === "Bluspews"), bluspewOrder), false, "row-grid grid-5-col");

        // 2. Dredrocks
        const dredrockOrder = [11, 12, 13, 17, 19, 14, 15, 16, 18, 20];
        renderSection(album, "Dredrocks", sortWithOrder(alienData.filter(a => a.group === "Dredrocks"), dredrockOrder), false, "row-grid grid-5-col");

        // 3. Gangreens
        const gangreenOrder = [21, 22, 23, 27, 29, 24, 25, 26, 28, 30];
        renderSection(album, "Gangreens", sortWithOrder(alienData.filter(a => a.group === "Gangreens"), gangreenOrder), false, "row-grid grid-5-col");

        // 4. Mutants
        const mutantOrder = [31, 32, 33, 40, 39, 36, 35, 41, 37, 38, 34, 42];
        renderSection(album, "Mutants", sortWithOrder(alienData.filter(a => a.group === "Mutants" && !(a.releases ? a.releases.includes('secret') : a.release === 'secret')), mutantOrder), false, "row-grid grid-4-col");

        // 5. Error Prints (Secret)
        const secrets = alienData.filter(a => a.releases ? a.releases.includes('secret') : a.release === 'secret');
        renderSection(album, "Secret Error Prints", secrets, false, "row-grid grid-6-col");

        // 6. RAMMs (Standard)
        renderSection(album, "RAMMs (Metallic Mutants)", alienData.filter(a => a.group === "RAMMs" && !(a.releases ? a.releases.includes('special_edition') : a.release === 'special_edition')), false, "row-grid grid-3-col");

        // 7. Special Edition RAMM Set
        renderSection(album, "Special Edition RAMM Set", alienData.filter(a => a.releases ? a.releases.includes('special_edition') : a.release === 'special_edition'), false, "row-grid grid-3-col");

        // 8. Power Players
        renderSection(album, "Power Players: Crystalites", crystaliteData, true, "row-grid grid-3-col");
        renderSection(album, "Power Players: Shadows", shadowData, true, "row-grid grid-3-col");

        // 10. Sciroids
        renderSection(album, "Sciroids", alienData.filter(a => a.group === "Sciroids"), false, "row-grid grid-3-col");

        // 11. E-ramm (Jangutz Khan)
        renderSection(album, "E-ramm (Mythic)", alienData.filter(a => a.group === "E-ramm"), false, "row-grid grid-3-col");
    } else {
        const grid = document.createElement('div');
        grid.className = "row-grid";
        // Combine all owned figures for sorting
        const allOwned = [...state.ownedAliens, ...state.ownedCrystalites];
        const sorted = allOwned.sort((a,b) => b.power - a.power);
        sorted.forEach(item => {
            // Pass explicit count 1 if needed, or rely on default
            grid.appendChild(createFigureElement(item, true, null, 1));
        });
        album.appendChild(grid);
    }
}

function renderSection(container, title, items, isPowerPlayer = false, customGridClass = null) {
    if (items.length === 0) return;

    // Tjek om spilleren ejer mindst én figur i denne gruppe
    const anyOwned = items.some(base => isPowerPlayer ? state.ownedCrystalites.some(i => i.id === base.id) : state.ownedAliens.some(i => i.id === base.id));
    
    const displayTitle = anyOwned ? title : "?????";

    const section = document.createElement('div');
    section.className = "album-section";
    section.innerHTML = `<div class="section-title">${displayTitle}</div>`;
    const grid = document.createElement('div');
    grid.className = customGridClass || "row-grid";
    
    items.forEach(base => {
        let owned = [];
        if (isPowerPlayer) {
            owned = state.ownedCrystalites.filter(i => i.id === base.id);
        } else {
            owned = state.ownedAliens.filter(i => i.id === base.id);
        }

        if (owned.length > 0) {
            const best = [...owned].sort((x,y) => y.power - x.power)[0];
            grid.appendChild(createFigureElement(best, true, null, owned.length));
        } else {
            grid.appendChild(createFigureElement(base, false));
        }
    });
    section.appendChild(grid);
    container.appendChild(section);
}

function renderStackedGrid(container, items) {
    const counts = {};
    items.forEach(item => { counts[item.id] = (counts[item.id] || 0) + 1; });
    const uniqueItems = [];
    const seen = new Set();
    items.forEach(item => {
        if(!seen.has(item.id)) {
            seen.add(item.id);
            uniqueItems.push(item);
        }
    });
    uniqueItems.sort((a,b) => a.id - b.id);
    uniqueItems.forEach(item => {
        const count = counts[item.id];
        container.appendChild(createFigureElement(item, true, null, count));
    });
}

function openDetail(id) {
    const base = alienData.find(a => a.id === id) || crystaliteData.find(a => a.id === id) || shadowData.find(a => a.id === id) || weaponData.find(a => a.id === id);
    let inv = state.ownedAliens.filter(a => a.id === id);
    if(inv.length === 0) inv = state.ownedCrystalites.filter(a => a.id === id);
    if(inv.length === 0) inv = state.ownedWeapons.filter(a => a.id === id);
    
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    modal.style.display = 'flex';
    modal.style.zIndex = '10000';
    
    const bestItem = inv[0] || { ...base, power: '?', locked: false };
    const bigFigure = createFigureElement(bestItem, inv.length > 0, null);
    bigFigure.style.width = "100%"; bigFigure.style.maxWidth = "360px"; bigFigure.style.aspectRatio = "3/4";
    bigFigure.style.pointerEvents = "none"; bigFigure.style.cursor = "default";
    const bigImg = bigFigure.querySelector('img');
    if(bigImg) { bigImg.style.width = "200px"; bigImg.style.height = "200px"; }

    const rList = base.releases || [base.release];
    const releaseLabel = rList.map(r => r === 'gen_1' ? 'Gen 1' : (r === 'gen_2' ? 'Gen 2' : (r ? r.toUpperCase() : ''))).join(' & ');
    content.innerHTML = `
        <div class="detail-layout">
            <div class="detail-left" id="detail-art-container"></div>
            <div class="detail-right">
                <div class="detail-info">
                    <h2 style="color:var(--blue); margin:0 0 5px 0;">${base.name} <span style="font-size:0.8em; color:#666;">#${base.id}</span></h2>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <span style="background:#333; padding:3px 8px; border-radius:4px; font-size:0.8rem;">Ejet: ${inv.length}</span>
                        <span style="background:#333; padding:3px 8px; border-radius:4px; font-size:0.8rem;">Gruppe: ${base.group}</span>
                        <span style="background:#333; padding:3px 8px; border-radius:4px; font-size:0.8rem;">${releaseLabel}</span>
                    </div>
                </div>
                <div class="detail-list" id="dupList">
                    ${inv.map(item => `
                        <div class="dup-row ${item.locked ? 'is-locked' : ''}">
                            <div style="display:flex; flex-direction:column;">
                                <div><strong style="color:var(--blue)">Power: ${item.power}</strong></div>
                            </div>
                            <button class="lock-btn ${item.locked ? 'active' : ''}" onclick="toggleLock('${item.instanceId}', ${id})">
                                ${item.locked ? '🔒' : '🔓'}
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button onclick="document.getElementById('detailModal').style.display='none'" style="padding:12px; background:#444; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:bold;">LUK</button>
            </div>
        </div>
    `;
    document.getElementById('detail-art-container').appendChild(bigFigure);
}

function openAlbumCardDetail(id) {
    const card = cardData.find(c => c.id === id);
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    modal.style.display = 'flex';
    modal.style.zIndex = '10000';
    content.innerHTML = `
        <div class="detail-layout" style="justify-content:center; align-items:center; flex-direction:column;">
            <div style="margin-bottom:20px;">
                <img src="${card.img}" style="width:100%; max-width:400px; height:auto; image-rendering:pixelated; border-radius:15px; box-shadow:0 0 30px rgba(0,0,0,0.8);">
            </div>
            <h2 style="color:var(--blue); margin:0 0 20px 0;">${card.name}</h2>
            <button onclick="document.getElementById('detailModal').style.display='none'" style="padding:12px 40px; background:#444; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem;">LUK</button>
        </div>
    `;
}

function toggleLock(instId, alienId) {
    let item = state.ownedAliens.find(a => a.instanceId == instId);
    if(!item) item = state.ownedCrystalites.find(a => a.instanceId == instId);
    if(!item) item = state.ownedWeapons.find(a => a.instanceId == instId);
    if(item) { item.locked = !item.locked; save(); openDetail(alienId); }
}

function sellUnlocked() {
    const before = state.ownedAliens.length;
    state.ownedAliens = state.ownedAliens.filter(a => a.locked);
    state.currency += (before - state.ownedAliens.length) * 5;
    save();
}

function renderGearGroup(container, title, weaponIds, podColor) {
    const section = document.createElement('div');
    section.className = "album-section";
    const colorVar = podColor ? `var(--${podColor})` : '#fff';
    section.innerHTML = `<div class="section-title" style="color:${colorVar}">${title}</div>`;
    const grid = document.createElement('div');
    grid.className = "row-grid";
    grid.style.gap = "30px"; // Lidt ekstra luft mellem våbnene
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(clamp(110px, 18vw, 140px), 1fr))"; // Gør hver spalte bredere

    weaponIds.forEach(id => {
        const base = weaponData.find(w => w.id === id);
        if(base) {
            const owned = state.ownedWeapons.filter(w => w.id === id);
            if (owned.length > 0) {
                const best = [...owned].sort((x,y) => y.power - x.power)[0];
            grid.appendChild(createFigureElement(best, true, null, owned.length));
            } else {
            grid.appendChild(createFigureElement(base, false));
            }
        }
    });

    if (podColor) {
        const count = state.ownedPods[podColor] || 0;
        const podEl = document.createElement('div');
        if (count > 0) podEl.className = "hover-pop";
        podEl.style.cssText = "background:transparent; border-radius:10px; overflow:hidden; text-align:center;";
        const filterStyle = count > 0 ? "" : "filter: grayscale(100%) brightness(40%); opacity: 0.6;";
        podEl.innerHTML = `
            <img src="assets/pods/${podColor}_pod.gif" style="width:100%; max-width:100px; height:auto; display:block; margin:0 auto; image-rendering:pixelated; filter:drop-shadow(0 4px 5px rgba(0,0,0,0.5)) ${filterStyle};">
            <div style="font-weight:bold; margin-top:5px; color:${count > 0 ? podColor : '#666'};">${podColor.toUpperCase()} POD</div>
            <div style="font-size:0.8rem; color:#aaa;">Ejet: ${count}</div>
        `;
        grid.appendChild(podEl);
    }

    section.appendChild(grid);
    container.appendChild(section);
}