function renderBuilderHTML() {
    return `
        <div id="arena-builder">
            <p style="margin-bottom:20px; color:#aaa;">Sammensæt dit hold mod modstanderen!</p>

            <!-- TOP ROW: Support Slots (Left) & Fight Button (Right) -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:15px;">
                <!-- SUPPORT SLOTS (Weapon, PP, Pod) -->
                <div id="arena-support" style="display:flex; gap:15px;">
                    <div class="squad-slot" id="slot-weapon" onclick="removeSupport('weapon')" style="width:70px; height:70px; border:2px dashed #444; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.02); cursor:pointer; transition:0.2s;">
                        <span style="font-size:1.5rem; opacity:0.3;">🔫</span>
                        <span style="font-size:0.55rem; font-weight:bold; color:#666; margin-top:2px;">VÅBEN</span>
                    </div>
                    <div class="squad-slot" id="slot-pp" onclick="removeSupport('pp')" style="width:70px; height:70px; border:2px dashed #444; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.02); cursor:pointer; transition:0.2s;">
                        <span style="font-size:1.5rem; opacity:0.3;">⚡</span>
                        <span style="font-size:0.55rem; font-weight:bold; color:#666; margin-top:2px;">POWER</span>
                    </div>
                    <div class="squad-slot" id="slot-pod" onclick="removeSupport('pod')" style="width:70px; height:70px; border:2px dashed #444; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.02); cursor:pointer; transition:0.2s;">
                        <span style="font-size:1.5rem; opacity:0.3;">🛸</span>
                        <span style="font-size:0.55rem; font-weight:bold; color:#666; margin-top:2px;">POD</span>
                    </div>
                </div>

                <button id="btn-fight" style="background:#333; color:#666; border:none; padding:15px 40px; border-radius:50px; font-size:1.2rem; font-weight:bold; cursor:not-allowed; box-shadow:0 5px #111; transition:transform 0.1s;">KÆMP!</button>
            </div>

            <!-- SQUAD SLOTS -->
            <div id="arena-squad" style="display:flex; justify-content:center; gap:10px; margin-bottom:20px; flex-wrap:wrap;"></div>

            <div style="background:var(--panel); padding:20px; border-radius:15px; border:1px solid #333; text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:10px; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <h3 style="margin:0; color:var(--blue);">DINE BEDSTE KRIGERE</h3>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button onclick="clearSquad(this)" style="background:#331111; color:#ffaaaa; border:1px solid #552222; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; font-size: 0.9rem; transition: 0.2s;">🗑️ RYD HOLD</button>
                        <button onclick="shuffleSquad(this)" style="background:#002244; color:#aaccff; border:1px solid #004488; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; font-size: 0.9rem; transition: 0.2s;">🔀 BLAND</button>
                        <button onclick="autoFillSquad(this)" style="background:#222; color:#fff; border:1px solid #444; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; font-size: 0.9rem; transition: 0.2s;">⚡ AUTO UDFYLD</button>
                    </div>
                </div>
                
                <!-- CATEGORY TABS -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button class="filter-btn active" id="cat-btn-warriors" onclick="setArenaCategory('warriors', this)">KRIGERE</button>
                        <button class="filter-btn" id="cat-btn-pps" onclick="setArenaCategory('pps', this)">POWER PLAYERS</button>
                        <button class="filter-btn" id="cat-btn-weapons" onclick="setArenaCategory('weapons', this)">VÅBEN</button>
                        <button class="filter-btn" id="cat-btn-pods" onclick="setArenaCategory('pods', this)">PODS</button>
                    </div>
                    <div>
                        <span style="font-size:0.8rem; color:#888; margin-right:10px;">SORTER:</span>
                        <select id="arenaSort" onchange="updateArenaRoster()" style="background:#000; color:#fff; border:1px solid #444; padding:5px; border-radius:5px; cursor:pointer;">
                            <option value="power">Højeste Power</option>
                            <option value="type">Farve (Type)</option>
                            <option value="id">ID (Laveste)</option>
                        </select>
                    </div>
                </div>

                <!-- WARRIOR FILTERS -->
                <div id="warrior-filters" style="background:#0a0c14; padding:10px; border-radius:10px; margin-bottom:15px; display:flex; flex-direction:column; gap:10px;">
                    <div class="filter-group">
                        <span class="filter-label">TYPE:</span>
                        <button class="filter-btn active" onclick="setArenaFilter('type', 'all', this)">ALLE</button>
                        <button class="filter-btn" onclick="setArenaFilter('type', 'red', this)" style="color:var(--red)">RØD</button>
                        <button class="filter-btn" onclick="setArenaFilter('type', 'green', this)" style="color:var(--green)">GRØN</button>
                        <button class="filter-btn" onclick="setArenaFilter('type', 'blue', this)" style="color:var(--blue)">BLÅ</button>
                        <button class="filter-btn" onclick="setArenaFilter('type', 'hybrid', this)" style="color:var(--gold)">MUTANT</button>
                        <button class="filter-btn" onclick="setArenaFilter('type', 'metallic', this)" style="color:#c0c0c0">RAMMS</button>
                    </div>
                </div>

                <div id="arena-roster" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:15px; max-height:450px; overflow-y:auto; padding-right:10px;"></div>
            </div>
        </div>`;
}

function initBuilderLogic() {
    // Render slots
    const squadContainer = document.getElementById('arena-squad');
    for(let i=0; i<7; i++) {
        squadContainer.innerHTML += `
            <div class="squad-slot" id="slot-${i}" style="width:clamp(70px, 15vw, 110px); aspect-ratio:110/150; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; cursor:pointer; position:relative; background:transparent;">
            </div>
        `;
    }

    updateArenaRoster();
    renderSquad();
    checkReady();
}

function getUniqueItems(items) {
    if (!items) return [];
    const unique = [];
    const seen = new Set();
    items.forEach(i => { if(!seen.has(i.id)) { seen.add(i.id); unique.push(i); } });
    return unique;
}

function setArenaCategory(cat, btn) {
    arenaCategory = cat;
    // Update active tab
    document.querySelectorAll('.filter-btn').forEach(b => {
        if(b.id && b.id.startsWith('cat-btn-')) b.classList.remove('active');
    });
    if(btn) btn.classList.add('active');
    
    // Show/Hide warrior filters
    const warriorFilters = document.getElementById('warrior-filters');
    if(warriorFilters) warriorFilters.style.display = (cat === 'warriors') ? 'flex' : 'none';
    
    updateArenaRoster();
}

function removeSupport(type) {
    if(type === 'weapon') selectedWeaponId = null;
    if(type === 'pp') selectedPowerPlayerId = null;
    if(type === 'pod') selectedGlobalPod = null;
    updateArenaRoster(); renderSquad();
    checkReady();
}

function setArenaFilter(cat, val, btn) {
    if(cat === 'type') arenaFilterType = val;
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(c => {
        if(c.tagName === 'BUTTON') c.classList.remove('active');
    });
    btn.classList.add('active');
    updateArenaRoster();
}

function autoFillSquad(btn) {
    if(btn) {
        btn.classList.add('animate-flash');
        setTimeout(() => btn.classList.remove('animate-flash'), 400);
    }

    arenaSquad = [null, null, null, null, null, null, null];
    let pool = getUniqueItems(state.ownedAliens.filter(a => a.locked)).sort((a, b) => b.power - a.power);
    let specialCount = 0; // Mutants + RAMMs
    let alienCount = 0;
    
    for(let item of pool) {
        if(arenaSquad.every(s => s !== null)) break;
        const squadItem = { ...item };
        const isSpecial = item.type === 'hybrid' || item.type === 'metallic';
        if(isSpecial) {
            if(specialCount < 1) {
                arenaSquad[arenaSquad.indexOf(null)] = squadItem;
                specialCount++;
            }
        } else {
            if(alienCount < 6) {
                arenaSquad[arenaSquad.indexOf(null)] = squadItem;
                alienCount++;
            }
        }
    }

    // Auto-fill Support Items
    const weapons = getUniqueItems(state.ownedWeapons || []);
    if(weapons.length > 0) selectedWeaponId = weapons[0].id;

    const pps = getUniqueItems(state.ownedCrystalites || []);
    if(pps.length > 0) selectedPowerPlayerId = pps[0].id;

    if(state.ownedPods && state.ownedPods.red > 0) selectedGlobalPod = 'red';
    else if(state.ownedPods && state.ownedPods.green > 0) selectedGlobalPod = 'green';
    else if(state.ownedPods && state.ownedPods.blue > 0) selectedGlobalPod = 'blue';

    updateArenaRoster(); renderSquad(); checkReady();
}

function clearSquad(btn) {
    if(btn) {
        btn.classList.add('animate-flash');
        setTimeout(() => btn.classList.remove('animate-flash'), 400);
    }
    arenaSquad = [null, null, null, null, null, null, null];
    selectedWeaponId = null;
    selectedPowerPlayerId = null;
    selectedGlobalPod = null;
    updateArenaRoster();
    renderSquad();
    checkReady();
}

function shuffleSquad(btn) {
    if(btn) {
        btn.classList.add('animate-flash');
        setTimeout(() => btn.classList.remove('animate-flash'), 400);
    }
    
    let members = arenaSquad.filter(s => s !== null);
    for (let i = members.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [members[i], members[j]] = [members[j], members[i]];
    }
    
    for (let i = 0; i < 7; i++) {
        arenaSquad[i] = members[i] || null;
    }
    
    renderSquad();
}

function updateArenaRoster() {
    const rosterDiv = document.getElementById('arena-roster');
    if(!rosterDiv) return;
    rosterDiv.innerHTML = "";
    
    let items = [];
    
    if (arenaCategory === 'warriors') {
        let filteredAliens = state.ownedAliens.filter(a => {
            const isLocked = a.locked;
            const notInSquad = !arenaSquad.some(s => s && s.id === a.id); // Skjuler alle med samme ID, hvis figuren allerede er på holdet
            const typeMatch = arenaFilterType === 'all' ? true : (arenaFilterType === 'hybrid' ? (a.type === 'hybrid' || a.type === 'metallic') : a.type === arenaFilterType);
            return isLocked && notInSquad && typeMatch;
        });
        
        items = getUniqueItems(filteredAliens); // Fjerner alle dubletter af max-power figurer fra visningen
        
        const sortBy = document.getElementById('arenaSort').value;
        items.sort((a, b) => {
            if (sortBy === 'power') return b.power - a.power;
            if (sortBy === 'type') return a.type.localeCompare(b.type);
            if (sortBy === 'id') return a.id - b.id;
            return 0;
        });
    } else if (arenaCategory === 'pps') {
        // Hent både Crystalites og Shadows sikkert, og slå dem sammen
        const crys = state.ownedCrystalites || [];
        const shads = state.ownedShadows || [];
        items = getUniqueItems([...crys, ...shads]); 
    } else if (arenaCategory === 'weapons') {
        items = getUniqueItems(state.ownedWeapons || []);
    } else if (arenaCategory === 'pods') {
        // Tjek SIKKERT om spilleren overhovedet har et ownedPods objekt
        if (state.ownedPods) {
            if(state.ownedPods.red > 0) items.push({ id: 'pod_red', name: 'Red Pod', type: 'pod', color: 'red', img: 'assets/pods/red_pod.gif' });
            if(state.ownedPods.green > 0) items.push({ id: 'pod_green', name: 'Green Pod', type: 'pod', color: 'green', img: 'assets/pods/green_pod.gif' });
            if(state.ownedPods.blue > 0) items.push({ id: 'pod_blue', name: 'Blue Pod', type: 'pod', color: 'blue', img: 'assets/pods/blue_pod.gif' });
        }
    }

    if(items.length === 0) {
        rosterDiv.innerHTML = "<div style='opacity:0.5; padding:20px; grid-column: 1 / -1; text-align:center;'>Ingen genstande fundet i denne kategori.</div>";
        return;
    }

    items.forEach(item => {
        if (arenaCategory === 'pods') {
            const podEl = document.createElement('div');
            podEl.className = "hover-pop";
            podEl.style.cssText = "background:transparent; border-radius:10px; overflow:hidden; text-align:center; cursor:pointer;";
            podEl.innerHTML = `
                <img src="${item.img}" style="width:100px; height:auto; display:block; image-rendering:pixelated; filter:drop-shadow(0 4px 5px rgba(0,0,0,0.5));">
                <div style="font-weight:bold; margin-top:5px; color:${item.color};">${item.name}</div>
            `;
            podEl.onclick = () => addToSquad(item, 'pods');
            rosterDiv.appendChild(podEl);
        } else {
            const figure = createFigureElement(item, true, null);
            figure.onclick = () => addToSquad(item, arenaCategory);
            rosterDiv.appendChild(figure);
        }
    });
}

function addToSquad(item, category = 'warriors') {
    if (category === 'warriors') {
        const isSpecial = item.type === 'hybrid' || item.type === 'metallic';
        if(isSpecial && arenaSquad.some(s => s && (s.type === 'hybrid' || s.type === 'metallic'))) { showAlert("Du kan maksimalt have én Mutant eller RAMM på dit hold!", "Holdet er Ulovligt"); return; }
        if(item.group === 'E-ramm' && arenaSquad.some(s => s && s.group === 'E-ramm')) { showAlert("Du kan maksimalt have én Jangutz Khan på dit hold!", "Unik Figur"); return; }
        if(!isSpecial && arenaSquad.filter(s => s && s.type !== 'hybrid' && s.type !== 'metallic').length >= 6) { showAlert("Du kan maksimalt have 6 almindelige Aliens på dit hold!", "Holdet er Fuldt"); return; }
        
        const squadItem = { ...item };
        let placed = false;
        for(let i=0; i<7; i++) { if(!arenaSquad[i]) { arenaSquad[i] = squadItem; placed = true; break; } }
        if(!placed) showAlert("Dit hold er allerede fyldt op. Fjern en kæmper for at tilføje en ny.", "Holdet er Fuldt");
    } else if (category === 'pps') {
        selectedPowerPlayerId = item.id;
    } else if (category === 'weapons') {
        selectedWeaponId = item.id;
    } else if (category === 'pods') {
        selectedGlobalPod = item.color;
    }
    
    updateArenaRoster(); renderSquad(); checkReady();
}

function removeFromSquad(index) { arenaSquad[index] = null; updateArenaRoster(); renderSquad(); checkReady(); }

function renderSquad() {
    for(let i=0; i<7; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if(!slot) continue;
        
        // Nulstil baggrund og borders
        slot.style.border = "none";
        slot.style.boxShadow = "none";
        slot.style.background = "transparent";

        if(arenaSquad[i]) {
            slot.innerHTML = "";
            const item = arenaSquad[i];
            const figure = createFigureElement(item, true, null);
            figure.style.margin = "0"; // Undgå dobbelt margin inde i slottet
            figure.style.pointerEvents = "none";
            slot.appendChild(figure); 
            
            slot.onclick = () => removeFromSquad(i);
        } else {
            // Tom Grå Base
            slot.innerHTML = `
                <div style="width:75%; height:clamp(15px, 3vw, 25px); border-radius:50%; background:#222; border:2px dashed #555; box-shadow:0 4px 8px rgba(0,0,0,0.6); margin-bottom:5px;"></div>
                <div style="position:absolute; top:30%; font-size:clamp(1.5rem, 4vw, 2.5rem); color:#444; opacity:0.5; pointer-events:none;">+</div>
            `;
            slot.onclick = null;
        }
    }

    // Render Support Slots
    const slotWeapon = document.getElementById('slot-weapon');
    if(selectedWeaponId) {
        const wItem = weaponData.find(w => w.id == selectedWeaponId);
        if(wItem) {
            slotWeapon.innerHTML = `<img src="${wItem.img}" style="width:50px; height:50px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 5px rgba(0,0,0,0.5));">`;
            slotWeapon.style.border = "2px solid var(--blue)";
            slotWeapon.style.background = "rgba(0, 85, 255, 0.1)";
        }
    } else {
        slotWeapon.innerHTML = `<span style="font-size:1.5rem; opacity:0.3;">🔫</span><span style="font-size:0.55rem; font-weight:bold; color:#666; margin-top:2px;">VÅBEN</span>`;
        slotWeapon.style.border = "2px dashed #444";
        slotWeapon.style.background = "rgba(255,255,255,0.02)";
    }

    const slotPP = document.getElementById('slot-pp');
    if(selectedPowerPlayerId) {
        const ppItem = crystaliteData.find(p => p.id == selectedPowerPlayerId) || shadowData.find(p => p.id == selectedPowerPlayerId);
        if(ppItem) {
            slotPP.innerHTML = `<img src="${ppItem.img}" style="width:50px; height:50px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 5px rgba(0,0,0,0.5));">`;
            slotPP.style.border = "2px solid var(--gold)";
            slotPP.style.background = "rgba(255, 215, 0, 0.1)";
        }
    } else {
        slotPP.innerHTML = `<span style="font-size:1.5rem; opacity:0.3;">⚡</span><span style="font-size:0.55rem; font-weight:bold; color:#666; margin-top:2px;">POWER</span>`;
        slotPP.style.border = "2px dashed #444";
        slotPP.style.background = "rgba(255,255,255,0.02)";
    }

    const slotPod = document.getElementById('slot-pod');
    if(selectedGlobalPod) {
        slotPod.innerHTML = `<img src="assets/pods/${selectedGlobalPod}_pod.gif" style="width:50px; height:50px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 5px rgba(0,0,0,0.5));">`;
        slotPod.style.border = `2px solid var(--${selectedGlobalPod})`;
        
        if (selectedGlobalPod === 'red') slotPod.style.background = `rgba(255, 0, 0, 0.1)`;
        else if (selectedGlobalPod === 'green') slotPod.style.background = `rgba(0, 255, 0, 0.1)`;
        else slotPod.style.background = `rgba(0, 85, 255, 0.1)`;
    } else {
        slotPod.innerHTML = `<span style="font-size:1.5rem; opacity:0.3;">🛸</span><span style="font-size:0.55rem; font-weight:bold; color:#666; margin-top:2px;">POD</span>`;
        slotPod.style.border = "2px dashed #444";
        slotPod.style.background = "rgba(255,255,255,0.02)";
    }
}

function checkReady() {
    const btn = document.getElementById('btn-fight');
    const squadFull = arenaSquad.every(slot => slot !== null);
    if(squadFull) {
        btn.style.background = "linear-gradient(45deg, var(--red), #ff00aa)"; btn.style.color = "#fff"; btn.style.cursor = "pointer";
        btn.innerText = "VÆLG MODSTANDER"; btn.onclick = () => switchArenaView('levels'); 
    } else {
        btn.style.background = "#333"; btn.style.color = "#666"; btn.style.cursor = "not-allowed";
        btn.innerText = "KÆMP! (Hold ikke fyldt)"; btn.onclick = null;
    }
}