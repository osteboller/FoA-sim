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
    const gen2Unlocked = currentLevel >= 16;
    const activeRelease = gen2Unlocked ? 'gen_2' : 'gen_1';
    
    // Filter pools: Exclude all exclusives from normal packs
    const filterPool = (a) => {
        // Liste over releases, der IKKE skal kunne trækkes i standard pakker
        const exclusiveReleases = ['secret', 'japanese', 'italian', 'us', 'special_edition', 'jangutz_exclusive', 'battle_ship_exclusive'];
        const releases = a.releases || [a.release];
        if (releases.some(r => exclusiveReleases.includes(r))) return false;

        // Lås Gen 2 figurer indtil spilleren når det korrekte niveau
        if (!releases.includes(activeRelease)) return false;
        return true;
    };

    const standardPool = alienData.filter(a => a.group !== 'Mutants' && a.group !== 'RAMMs' && filterPool(a));
    const mutantPool = alienData.filter(a => a.group === 'Mutants' && filterPool(a));
    const rammPool = alienData.filter(a => a.group === 'RAMMs' && filterPool(a));
    const secretPool = alienData.filter(a => a.releases ? a.releases.includes('secret') : a.release === 'secret');

    // Pulje til almindelige kort (filtrer alle exclusives fra, og respekter gen 1/2 oplåsning)
    const standardCardPool = cardData.filter(c => {
        const exclusiveReleases = ['secret', 'japanese', 'italian', 'us', 'special_edition', 'jangutz_exclusive', 'battle_ship_exclusive', 'exclusive'];
        if (exclusiveReleases.includes(c.release)) return false;
        if (c.release === 'gen_2' && !gen2Unlocked) return false;
        return true;
    });

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
        sciroids.forEach(s => itemsToReveal.push(addAlienToInventory(s, 'battle_ship_exclusive')));
        
        // Tilføj selve Skibet som et "Pod" item
        if (!state.ownedPods) state.ownedPods = {};
        const isShipNew = (state.ownedPods['battleship'] || 0) === 0;
        state.ownedPods['battleship'] = (state.ownedPods['battleship'] || 0) + 1;
        itemsToReveal.push({ type: 'pod', name: 'SCIROID BATTLESHIP', color: '#00ff00', img: 'assets/sciroid_battleship/sciroid_battleship_pod_open.gif', status: isShipNew ? 'NEW' : 'DUP' });

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

        // 4. 3 Kort (Sciroid Kort er garanteret, resten er random standard kort)
        const sciroidCards = cardData.filter(c => c.release === 'battle_ship_exclusive');
        let cardsToAdd = [...sciroidCards];
        
        while (cardsToAdd.length < 3) {
            cardsToAdd.push(standardCardPool[Math.floor(Math.random() * standardCardPool.length)]);
        }

        cardsToAdd.forEach(c => {
            const isNew = !state.ownedCards.includes(c.id);
            if (isNew) state.ownedCards.push(c.id);
            
            itemsToReveal.push({
                instanceId: Date.now() + Math.random(),
                id: c.id, name: c.name, type: 'none', img: c.img,
                status: isNew ? 'NEW' : 'DUP',
                power: undefined
            });
        });

    } else if (type === 'war') {
        // 7 Aliens, 2 Mutants, 1 PP, 2 Weapons, 2 Cards
        for(let i=0; i<7; i++) itemsToReveal.push(addAlienToInventory(getRandomStandard(), activeRelease));
        for(let i=0; i<2; i++) itemsToReveal.push(addAlienToInventory(getRandomMutantOrRamm(), activeRelease));
        
        // PP
        const ppPool = [...crystaliteData, ...shadowData].filter(p => p.release === 'gen_1' || (gen2Unlocked && p.release === 'gen_2'));
        const pp = ppPool[Math.floor(Math.random() * ppPool.length)];
        const ppItem = createItemInstance(pp);
        state.ownedCrystalites.push(ppItem); // Eller ownedShadows, logik i main er lidt blandet, men OK
        itemsToReveal.push(ppItem);

        // Weapons
        let wPool = weaponData.filter(w => w.release !== 'bs_ex' && (w.release === 'gen_1' || (gen2Unlocked && w.release === 'gen_2')));
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
        for(let i=0; i<2; i++) {
            const c = standardCardPool[Math.floor(Math.random() * standardCardPool.length)];
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
        for(let i=0; i<4; i++) itemsToReveal.push(addAlienToInventory(getRandomStandard(), activeRelease));
        for(let i=0; i<2; i++) itemsToReveal.push(addAlienToInventory(getRandomMutantOrRamm(), activeRelease));
        
        const colors = ['red', 'green', 'blue'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        state.ownedPods[color]++;
        itemsToReveal.push({ type: 'pod', name: color.toUpperCase() + ' POD', color: color, img: `assets/pods/${color}_pod.gif` });
        
        // 1 Card
        const c = standardCardPool[Math.floor(Math.random() * standardCardPool.length)];
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
        for(let i=0; i<4; i++) itemsToReveal.push(addAlienToInventory(getRandomStandard(), activeRelease));
        itemsToReveal.push(addAlienToInventory(getRandomMutantOrRamm(), activeRelease));
        
        // 1 Card
        const c = standardCardPool[Math.floor(Math.random() * standardCardPool.length)];
        const isNew = !state.ownedCards.includes(c.id);
        if (isNew) state.ownedCards.push(c.id);
        itemsToReveal.push({
            instanceId: Date.now() + Math.random(),
            id: c.id, name: c.name, type: 'none', img: c.img,
            status: isNew ? 'NEW' : 'DUP',
            power: undefined
        });
    } else if (type.startsWith('blister')) {
        // Blister Packs: 2 Aliens
        const isIt = type === 'blister_it';
        const isJp = type === 'blister_jp';
        const region = isIt ? 'italian' : (isJp ? 'japanese' : null);
        
        let regionAliens = [];
        let regionRamm = [];
        if (region) {
             regionAliens = alienData.filter(a => (a.releases || [a.release]).includes(region) && a.group !== 'RAMMs');
             regionRamm = alienData.filter(a => (a.releases || [a.release]).includes(region) && a.group === 'RAMMs');
        }

        for(let i=0; i<2; i++) {
            let itemToAdd = null;
            if (DEV_MODE && !region) {
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
            } else if (region) {
                 const r = Math.random();
                 if (r < 0.05 && regionRamm.length > 0) { 
                     itemToAdd = regionRamm[0]; // 5% chance for Regional RAMM
                 } else if (r < 0.25 && regionAliens.length > 0) { 
                     itemToAdd = regionAliens[Math.floor(Math.random() * regionAliens.length)]; // 20% chance for Regional Alien
                 } else if (r < 0.30) { 
                     itemToAdd = getRandomMutantOrRamm(); // 5% chance for Standard Special
                 }
            } else {
                if (Math.random() < 0.05) itemToAdd = getRandomMutantOrRamm();
            }

            if (itemToAdd) {
                // Tjek for dubletter i denne pakke (selvom det er usandsynligt med pools)
                if (itemsToReveal.some(existing => existing.id === itemToAdd.id)) {
                    itemsToReveal.push(addAlienToInventory(getRandomStandard(), activeRelease));
                } else {
                    const actualRelease = itemToAdd.releases ? itemToAdd.releases[0] : (itemToAdd.release || activeRelease);
                    itemsToReveal.push(addAlienToInventory(itemToAdd, actualRelease));
                }
            } else {
                itemsToReveal.push(addAlienToInventory(getRandomStandard(), activeRelease));
            }
        }
    }

    // Tjek for regionale Exclusive RAMMs (ID: 57, 58, 59) for at give kortet første gang
    const hasExclusiveRamm = itemsToReveal.some(i => [57, 58, 59].includes(i.id));
    if (hasExclusiveRamm && !state.ownedCards.includes(153)) {
        state.ownedCards.push(153);
        window.droppedCardReward = 153; // Gemmer ID'et til Fætter BR popup'en
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