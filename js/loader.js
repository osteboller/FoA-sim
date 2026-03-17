let isGameLoaded = false;

function initHomePage() {
    let page = document.getElementById('page-home');
    if (!page) {
        const workPage = document.getElementById('page-work');
        if (workPage && workPage.parentElement) {
            page = document.createElement('div');
            page.id = 'page-home';
            page.className = 'page';
            workPage.parentElement.appendChild(page);
        }
    }
    
    if (page) {
        if (!isGameLoaded) {
            page.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:70vh; text-align:center;">
                    <img src="assets/bgg/foassa.gif" style="max-width:100%; max-height:85vh; object-fit:contain; image-rendering:pixelated; filter: drop-shadow(0 0 20px rgba(0,0,0,0.5)); margin-bottom:30px;">
                    
                    <div id="loader-ui" style="display:flex; flex-direction:column; align-items:center; width: 100%; max-width: 400px;">
                        <div id="loader-container" style="width: 100%; background: #111; border: 2px solid #333; border-radius: 20px; padding: 5px; margin-bottom: 15px; box-shadow: inset 0 0 10px #000;">
                            <div id="loader-bar" style="width: 0%; height: 20px; background: linear-gradient(90deg, var(--gold), #ffaa00); border-radius: 15px; transition: width 0.1s; box-shadow: 0 0 10px var(--gold);"></div>
                        </div>
                        <div id="loader-text" style="color: var(--gold); font-weight: bold; font-family: monospace; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px;">Indlæser Assets (0%)</div>
                    </div>

                    <button id="start-btn" onclick="showPage('shop')" style="display:none; padding:15px 50px; background:var(--green); color:#fff; border:none; border-radius:50px; font-size:1.5rem; font-weight:bold; cursor:pointer; box-shadow:0 0 20px rgba(0,255,0,0.3); transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">START SPILLET</button>
                </div>
            `;
            preloadAssets();
        } else {
            page.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:70vh; text-align:center;">
                    <img src="assets/bgg/foassa.gif" style="max-width:100%; max-height:85vh; object-fit:contain; image-rendering:pixelated; filter: drop-shadow(0 0 20px rgba(0,0,0,0.5)); margin-bottom:30px;">
                    <button onclick="showPage('shop')" style="padding:15px 50px; background:var(--green); color:#fff; border:none; border-radius:50px; font-size:1.5rem; font-weight:bold; cursor:pointer; box-shadow:0 0 20px rgba(0,255,0,0.3); transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">START SPILLET</button>
                </div>
            `;
        }
    }
}

function preloadAssets() {
    const assets = new Set();
    const staticAssets = [
        "assets/bgg/foassa.gif", "assets/bgg/logo_foa_sim.gif", "assets/shop/cousin_br.jpg",
        "assets/shop/cousin_br_evil.gif", "assets/shop/mystery_box.gif", "assets/shop/mystery_box_open.gif",
        "assets/shop/blister_closed.gif", "assets/shop/blister_open.gif", "assets/shop/battle_pack.gif",
        "assets/shop/space_pod_pack.gif", "assets/shop/war_pack.gif", "assets/shop/sciroid_battleship_box.gif",
        "assets/shop/special_edition_ramm_set.gif", "assets/shop/jangutz_pack.gif", "assets/img/3aliens.gif"
    ];
    staticAssets.forEach(src => assets.add(src));
    if (typeof workGifs !== 'undefined') workGifs.forEach(gif => assets.add(gif));
    const arrays = [
        typeof alienData !== 'undefined' ? alienData : [], typeof crystaliteData !== 'undefined' ? crystaliteData : [],
        typeof shadowData !== 'undefined' ? shadowData : [], typeof weaponData !== 'undefined' ? weaponData : [],
        typeof cardData !== 'undefined' ? cardData : []
    ];
    arrays.forEach(arr => arr.forEach(item => { if (item.img) assets.add(item.img); }));
    
    const audioAssets = [
        "assets/audio/sfx/ui/message.ogg",
        "assets/audio/sfx/ui/trophy-claim.ogg",
        "assets/audio/sfx/ui/upgrade-bought1.ogg",
        "assets/audio/sfx/ui/upgrade-bought2.ogg",
        "assets/audio/sfx/ui/popup-open.ogg",
        "assets/audio/sfx/ui/popup-close.ogg",
        "assets/audio/sfx/shop/riser-tier1.ogg",
        "assets/audio/sfx/shop/riser-tier2.ogg",
        "assets/audio/sfx/shop/riser-tier3.ogg",
        "assets/audio/sfx/shop/riser-tier4.ogg",
        "assets/audio/sfx/shop/reveal-tier1.ogg",
        "assets/audio/sfx/shop/reveal-tier2.ogg",
        "assets/audio/sfx/shop/reveal-tier3.ogg",
        "assets/audio/sfx/shop/reveal-tier4.ogg"
    ];

    const allAssets = Array.from(assets).map(src => ({ type: 'image', src })).concat(audioAssets.map(src => ({ type: 'audio', src })));
    let loadedCount = 0;
    const totalCount = allAssets.length;
    if (totalCount === 0) { finishLoading(); return; }

    const updateProgress = () => {
        loadedCount++;
        const pct = Math.floor((loadedCount / totalCount) * 100);
        const bar = document.getElementById('loader-bar');
        const text = document.getElementById('loader-text');
        if (bar) bar.style.width = pct + '%';
        if (text) text.innerText = `INDLÆSER ASSETS (${pct}%)`;
        if (loadedCount === totalCount) setTimeout(finishLoading, 300);
    };

    allAssets.forEach(asset => {
        if (asset.type === 'image') {
            const img = new Image();
            img.onload = img.onerror = updateProgress;
            img.src = asset.src;
        } else {
            fetch(asset.src).then(updateProgress).catch(updateProgress);
        }
    });
}

function finishLoading() {
    isGameLoaded = true;
    const loaderUi = document.getElementById('loader-ui');
    const startBtn = document.getElementById('start-btn');
    if (loaderUi) loaderUi.style.display = 'none';
    if (startBtn) startBtn.style.display = 'inline-block';
}