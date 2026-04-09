// --- ELITE COLLECTOR CLUB & POSTORDRE ---

function renderEliteClub() {
    const currentLevel = state.maxLevel || 1;
    const eliteUnlocked = currentLevel > 15; // Låses op efter Rivalerne (Zone 3)

    let html = '';
    
    if (eliteUnlocked) {
        html = `
            <div style="margin-top:50px; padding-top:30px; border-top: 2px solid var(--gold); text-align:center;">
                <button onclick="openEliteShopModal()" class="elite-shop-button">
                    <span class="elite-shop-icon">✨</span>
                    <span class="elite-shop-title">Elite Collector Club</span>
                    <span class="elite-shop-desc">Eksklusive samlerobjekter</span>
                </button>
            </div>
        `;
    } else {
        html = `
            <div style="margin-top:50px; padding:40px; opacity:0.5; border: 1px dashed #444; border-radius: 15px;">
                <h3 style="color:#666; text-transform:uppercase; letter-spacing:2px; font-size:1.5rem;">Elite Collector Club</h3>
                <p style="color:#888; margin-bottom:10px;">Låses op når du har besejret Rivalerne (Niveau 15)</p>
                <div style="font-size:3rem;">🔒</div>
            </div>
        `;
    }
    return html;
}

function openEliteShopModal() {
    const modal = document.createElement('div');
    modal.id = 'elite-shop-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(10, 0, 20, 0.95); z-index: 10000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 20px; box-sizing: border-box;
    `;

    const content = `
        <h3 style="color:var(--gold); text-transform:uppercase; letter-spacing:2px; font-size:2rem; text-shadow: 0 0 10px var(--gold);">Elite Collector Club</h3>
        <p style="color:#ccc; margin-bottom:20px;">Brug Jangutz Points til at købe eksklusive samlerobjekter.</p>
        <div style="display:flex; justify-content:center; gap:30px; flex-wrap:wrap; max-width:1000px; margin:0 auto; padding-bottom: 20px; max-height: 60vh; overflow-y: auto;">
            <button class="shop-btn" onclick="buyElitePack()" onmousemove="tiltPack(event)" onmouseleave="resetTilt(event)" ontouchstart="tiltPack(event)" ontouchmove="tiltPack(event)" ontouchend="resetTilt(event)" ontouchcancel="resetTilt(event)" style="background:radial-gradient(circle, #4a3800 0%, #1a1400 100%); border:2px solid var(--gold); color:#fff; padding:20px; border-radius:15px; cursor:pointer; width:300px; transition:0.2s; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);">
                <img class="pack-img" src="assets/shop/special_edition_ramm_set.gif" style="width:100%; height:250px; object-fit:contain; margin-bottom:10px; image-rendering:pixelated; transition: transform 0.1s ease-out;">
                <div style="font-weight:bold; margin:5px 0; font-size:1.2rem;">MEGA RARE PAKKE</div>
                <div style="font-size:0.9rem; color:#aaa; margin-top:5px;">Garanteret Rammerface, Rammstash & Rammworm</div>
                <div style="color:var(--blue); font-weight:bold; margin-top:5px; font-size:1.1rem;">10 Jangutz Points</div>
            </button>
            <button class="shop-btn" onclick="buyJangutzPack()" onmousemove="tiltPack(event)" onmouseleave="resetTilt(event)" ontouchstart="tiltPack(event)" ontouchmove="tiltPack(event)" ontouchend="resetTilt(event)" ontouchcancel="resetTilt(event)" style="background:radial-gradient(circle, #220000 0%, #110000 100%); border:2px solid var(--red); color:#fff; padding:20px; border-radius:15px; cursor:pointer; width:300px; transition:0.2s; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 0 30px rgba(255, 0, 0, 0.2);">
                <img class="pack-img" src="assets/shop/jangutz_pack.gif" style="width:100%; height:250px; object-fit:contain; margin-bottom:10px; image-rendering:pixelated; transition: transform 0.1s ease-out;">
                <div style="font-weight:bold; margin:5px 0; font-size:1.2rem; color:var(--red);">JANGUTZ KHAN PAKKE</div>
                <div style="font-size:0.9rem; color:#aaa; margin-top:5px;">Indeholder den legendariske Jangutz Khan</div>
                <div style="color:var(--blue); font-weight:bold; margin-top:5px; font-size:1.1rem;">16 Jangutz Points</div>
            </button>
            <button class="shop-btn" onclick="buyVaultPack()" onmousemove="tiltPack(event)" onmouseleave="resetTilt(event)" ontouchstart="tiltPack(event)" ontouchmove="tiltPack(event)" ontouchend="resetTilt(event)" ontouchcancel="resetTilt(event)" style="background:radial-gradient(circle, #001122 0%, #000011 100%); border:2px solid var(--blue); color:#fff; padding:20px; border-radius:15px; cursor:pointer; width:300px; transition:0.2s; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 0 30px rgba(0, 85, 255, 0.2);">
                <img class="pack-img" src="assets/shop/blister_pack_us.gif" data-scale="1.2" style="width:100%; height:250px; object-fit:contain; margin-bottom:10px; image-rendering:pixelated; transition: transform 0.1s ease-out; transform: scale(1.2);">
                <div style="font-weight:bold; margin:5px 0; font-size:1.2rem; color:var(--blue);">THE VAULT</div>
                <div style="font-size:0.9rem; color:#aaa; margin-top:5px;">2 Udgåede Aliens (Chance for US RAMM!)</div>
                <div style="color:var(--gold); font-weight:bold; margin-top:5px; font-size:1.1rem;">5 Jangutz Points</div>
            </button>
            <button class="shop-btn" onclick="buyEliteItem('poster')" onmousemove="tiltPack(event)" onmouseleave="resetTilt(event)" ontouchstart="tiltPack(event)" ontouchmove="tiltPack(event)" ontouchend="resetTilt(event)" ontouchcancel="resetTilt(event)" style="background:radial-gradient(circle, #222 0%, #000 100%); border:2px solid #aaa; color:#fff; padding:20px; border-radius:15px; cursor:pointer; width:300px; transition:0.2s; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);">
                <img class="pack-img" src="assets/shop/foa_poster.gif" data-scale="1" style="width:100%; height:250px; object-fit:contain; margin-bottom:10px; image-rendering:pixelated; transition: transform 0.1s ease-out;">
                <div style="font-weight:bold; margin:5px 0; font-size:1.2rem; color:#fff;">FOA PLAKAT</div>
                <div style="font-size:0.9rem; color:#aaa; margin-top:5px;">Den officielle plakat</div>
                <div style="color:var(--blue); font-weight:bold; margin-top:5px; font-size:1.1rem;">6 Jangutz Points</div>
            </button>
            <button class="shop-btn" onclick="buyEliteItem('tshirt')" onmousemove="tiltPack(event)" onmouseleave="resetTilt(event)" ontouchstart="tiltPack(event)" ontouchmove="tiltPack(event)" ontouchend="resetTilt(event)" ontouchcancel="resetTilt(event)" style="background:radial-gradient(circle, #222 0%, #000 100%); border:2px solid #aaa; color:#fff; padding:20px; border-radius:15px; cursor:pointer; width:300px; transition:0.2s; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);">
                <img class="pack-img" src="assets/shop/t-shirt.gif" data-scale="1" style="width:100%; height:250px; object-fit:contain; margin-bottom:10px; image-rendering:pixelated; transition: transform 0.1s ease-out;">
                <div style="font-weight:bold; margin:5px 0; font-size:1.2rem; color:#fff;">FOA T-SHIRT</div>
                <div style="font-size:0.9rem; color:#aaa; margin-top:5px;">Eksklusiv medlems T-shirt</div>
                <div style="color:var(--blue); font-weight:bold; margin-top:5px; font-size:1.1rem;">8 Jangutz Points</div>
            </button>
        </div>
        <button onclick="document.getElementById('elite-shop-modal').remove()" style="margin-top: 30px; padding: 10px 30px; background: #333; color: #fff; border: 1px solid #555; border-radius: 50px; cursor: pointer;">Tilbage til Butikken</button>
    `;

    modal.innerHTML = content;
    document.body.appendChild(modal);
}

function buyElitePack() {
    if (typeof shopIsBusy !== 'undefined' && shopIsBusy) return false;
    
    if ((state.points || 0) < 10) {
        showAlert("Du har ikke nok Jangutz Points.", "Mangler Points");
        return false;
    }
    
    if(typeof setShopBusy === 'function') setShopBusy(true);
    state.points -= 10;

    // Elite IDs: 60, 61, 62
    const items = [];
    [60, 61, 62].forEach(id => {
        const base = alienData.find(a => a.id === id);
        if(base) items.push(addAlienToInventory(base));
    });
    
    // Tilføj Special Edition RAMMs kort første gang
    if (!state.ownedCards.includes(154)) {
        state.ownedCards.push(154);
        window.droppedCardReward = 154; // Gemmer ID'et til Fætter BR popup'en
    }

    save();
    document.getElementById('elite-shop-modal')?.remove();
    openPackInteractive(items, 'elite_ramm');
    return true;
}

function buyJangutzPack() {
    if (typeof shopIsBusy !== 'undefined' && shopIsBusy) return false;

    if ((state.points || 0) < 16) {
        showAlert("Du har ikke nok Jangutz Points.", "Mangler Points");
        return false;
    }

    if(typeof setShopBusy === 'function') setShopBusy(true);
    state.points -= 16;

    const base = alienData.find(a => a.id === 65);
    const item = addAlienToInventory(base);
    save();

    document.getElementById('elite-shop-modal')?.remove();
    openPackInteractive([item], 'elite_jangutz');
    return true;
}

function buyVaultPack() {
    if (typeof shopIsBusy !== 'undefined' && shopIsBusy) return false;

    if ((state.points || 0) < 5) {
        showAlert("Du har ikke nok Jangutz Points.", "Mangler Points");
        return false;
    }

    if(typeof setShopBusy === 'function') setShopBusy(true);
    state.points -= 5;

    const items = [];
    // Pulje af udgåede aliens (dem der kun var i Gen 1 og ikke Gen 2)
    let vaultPool = alienData.filter(a => a.releases && a.releases.includes('gen_1') && !a.releases.includes('gen_2'));
    if (vaultPool.length === 0) vaultPool = alienData.filter(a => (a.releases || [a.release]).includes('gen_1'));

    for(let i=0; i<2; i++) {
        if (Math.random() < 0.05 && !items.some(x => x.id === 59)) {
            const usRamm = alienData.find(a => a.id === 59);
            if (usRamm) items.push(addAlienToInventory(usRamm, 'us'));
        } else {
            const randomVault = vaultPool[Math.floor(Math.random() * vaultPool.length)];
            items.push(addAlienToInventory(randomVault, 'gen_1'));
        }
    }

    // Tjek for US RAMM (ID: 59) for at give kortet første gang
    const hasUsRamm = items.some(i => i.id === 59);
    if (hasUsRamm && !state.ownedCards.includes(153)) {
        state.ownedCards.push(153);
        window.droppedCardReward = 153;
    }

    save();
    document.getElementById('elite-shop-modal')?.remove();
    openPackInteractive(items, 'blister_us');
    return true;
}

function buyEliteItem(type) {
    if (typeof shopIsBusy !== 'undefined' && shopIsBusy) return false;

    if (!state.ownedMerch) state.ownedMerch = [];
    if (state.ownedMerch.includes(type)) {
        showAlert("Du ejer allerede dette objekt.", "Allerede Ejet");
        return false;
    }

    const cost = type === 'poster' ? 6 : 8;
    if ((state.points || 0) < cost) {
        showAlert("Du har ikke nok Jangutz Points.", "Mangler Points");
        return false;
    }

    state.points -= cost;
    state.ownedMerch.push(type);
    save();

    document.getElementById('elite-shop-modal')?.remove();

    const item = { id: type, name: type === 'poster' ? 'FOA PLAKAT' : 'FOA T-SHIRT', img: type === 'poster' ? 'assets/jangutz_khan/poster.gif' : 'assets/shop/t-shirt.gif', type: 'merch', status: 'NEW' };
    if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier3');
    showBigReveal(item);
    return true;
}
