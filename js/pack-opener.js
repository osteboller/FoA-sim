// --- PACK OPENER & ANIMATIONS ---

let skipOpenerAnimation = false;
let activeWaitResolvers = [];

// Helper for async delays
const wait = (ms) => new Promise(resolve => {
    if (skipOpenerAnimation) return resolve();
    const timeoutId = setTimeout(() => {
        activeWaitResolvers = activeWaitResolvers.filter(r => r.id !== timeoutId);
        resolve();
    }, ms);
    activeWaitResolvers.push({ id: timeoutId, resolve: () => { clearTimeout(timeoutId); resolve(); } });
});

function skipPackAnimation() {
    skipOpenerAnimation = true;
    activeWaitResolvers.forEach(r => r.resolve());
    activeWaitResolvers = [];
    document.body.classList.remove('screen-shake');
}

function tiltPack(e) {
    const btn = e.currentTarget;
    const img = btn.querySelector('.pack-img');
    if(!img) return;
    
    if (!btn.classList.contains('is-tilted')) {
        btn.classList.add('is-tilted'); // Aktiverer CSS hover-effekter på touch
        img.style.transition = 'none'; // Fjerner CSS-transition midlertidigt for at fjerne lag
    }
    
    let clientX, clientY;
    let isTouch = false;
    
    // Hent touch koordinater, hvis det er en mobil
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        isTouch = true;
        
        // Gem boksens start-position for at undgå "søsyge" reflows, når man scroller skærmen
        if (e.type === 'touchstart') {
            const rect = btn.getBoundingClientRect();
            btn.dataset.cx = rect.left + rect.width / 2;
            btn.dataset.cy = rect.top + rect.height / 2;
            btn.dataset.w = rect.width / 2;
            btn.dataset.h = rect.height / 2;
        }
    } else if (e.type && e.type.includes('touch')) {
        return; // Undgå fejl, hvis der mangler data (f.eks. ved touchcancel)
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    if (btn.tiltFrame) cancelAnimationFrame(btn.tiltFrame);
    
    // Batch DOM-opdateringen for at sikre en silkeblød framerate på mobil
    btn.tiltFrame = requestAnimationFrame(() => {
        let rotX, rotY;
        
        if (isTouch && btn.dataset.cx) {
            // Mobil: Brug gemte koordinater for at undgå at tiltet hakker under scrolling
            rotX = -((clientY - parseFloat(btn.dataset.cy)) / parseFloat(btn.dataset.h)) * 15;
            rotY = ((clientX - parseFloat(btn.dataset.cx)) / parseFloat(btn.dataset.w)) * 15;
            // Sæt et max tilt på 20 grader så den ikke spinner helt rundt ved lange scrolls
            rotX = Math.max(-20, Math.min(20, rotX));
            rotY = Math.max(-20, Math.min(20, rotY));
        } else {
            // Mus/PC: Beregn live da musen ikke scroller hele siden automatisk
            const rect = btn.getBoundingClientRect();
            rotX = -((clientY - rect.top - rect.height / 2) / (rect.height / 2)) * 15; 
            rotY = ((clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 15;
        }
        
        const baseScale = parseFloat(img.dataset.scale || 1);
        img.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${baseScale * 1.05})`;
    });
}

function resetTilt(e) {
    const btn = e.currentTarget;
    btn.classList.remove('is-tilted');
    const img = btn.querySelector('.pack-img');
    
    if (btn.tiltFrame) cancelAnimationFrame(btn.tiltFrame);
    
    if(img) {
        img.style.transition = ''; // Gendan CSS transition, så den falder blødt på plads
        const baseScale = parseFloat(img.dataset.scale || 1);
        img.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(${baseScale})`;
    }
}

async function openPackInteractive(items, packType) {
    packType = packType || '';
    const container = document.getElementById('shop-batch');
    if (!container) return;

    // Setup container styling
    container.className = 'pack-opener-overlay';
    container.style.display = ''; // Fjerner 'display:none', så CSS klassen kan vises
    container.style.overflowX = 'hidden'; // Dræb horisontal scrollbar under animationer
    container.style.overflowY = 'auto'; // Tillad kun vertikal scroll, hvis pakken er meget stor
    container.style.transition = ''; // Fjerner gamle overgange, så baggrunden ikke fader væk og viser shoppen
    container.style.background = ''; // Sikr at der ikke hænger gamle farver (f.eks. rød)
    document.body.style.overflow = 'hidden'; // Lås baggrundens scrollbar fast
    container.innerHTML = "";
    container.onclick = null; // Nulstil klik, så den ikke lukker mens animationen kører

    skipOpenerAnimation = false;
    
    // Skab et usynligt klik-lag over hele animationen til at skippe
    const skipOverlay = document.createElement('div');
    skipOverlay.id = 'skip-opener-overlay';
    skipOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; cursor:pointer;';
    skipOverlay.title = "Klik for at springe animationen over";
    skipOverlay.onclick = (e) => {
        if (e) e.stopPropagation(); // Stop klikket fra at boble videre
        skipPackAnimation();
        skipOverlay.style.pointerEvents = 'none';
    };
    container.appendChild(skipOverlay);

    // Midlertidig mute af "riser" og buildup lyde, hvis man trykker skip
    window.originalAudioPlay = null;
    if (typeof AudioManager !== 'undefined' && AudioManager.sfx && AudioManager.sfx.play) {
        window.originalAudioPlay = AudioManager.sfx.play;
        AudioManager.sfx.play = function(cat, snd) {
            if (skipOpenerAnimation && cat === 'shop' && (snd.includes('riser') || snd.includes('swipe'))) return;
            window.originalAudioPlay.call(AudioManager.sfx, cat, snd);
        };
    }

    // Opret Scene Wrapper (For responsivitet inden i det fuldskærms mørke overlay)
    const scene = document.createElement('div');
    scene.className = 'game-scene-container shop-scene';
    container.appendChild(scene);

    // --- BLISTER PACK LOGIC ---
    if (packType.startsWith('blister')) {
        // 1. Calculate Max Tier
        let maxTier = 1;
        for (const item of items) {
            const isSecret = item.group === 'Secret' || item.release === 'secret' || (item.releases && item.releases.includes('secret'));
            if (isSecret) {
                maxTier = 4;
            } else if ((item.group === 'RAMMs' || item.type === 'metallic') && maxTier < 3) {
                maxTier = 3;
            } else if ((item.group === 'Mutants' || item.type === 'hybrid') && maxTier < 2) {
                maxTier = 2;
            }
        }

        // 2. Render Blister Container
        // Wrapper til blister pack (bruger margin auto for at centrere i den nye container struktur)
        const blisterWrapper = document.createElement('div');
        blisterWrapper.className = 'blister-wrapper';

        let closedImgSrc = "assets/shop/blister_closed.gif";
        let openImgSrc = "assets/shop/blister_open.gif";
        
        if (packType === 'blister_it') {
            closedImgSrc = "assets/shop/blister_pack_it.gif";
            openImgSrc = "assets/shop/blister_open_it.gif";
        } else if (packType === 'blister_jp') {
            closedImgSrc = "assets/shop/blister_pack_jp.gif";
            openImgSrc = "assets/shop/blister_open_jp.gif";
        } else if (packType === 'blister_us') {
            closedImgSrc = "assets/shop/blister_pack_us.gif";
            openImgSrc = "assets/shop/blister_open_us.gif";
        }

        const blisterImg = document.createElement('img');
        blisterImg.src = closedImgSrc;
        blisterImg.className = 'blister-main-img';
        
        // US pakken er ofte tegnet lidt mindre i selve asset-filen, så vi pakker den ind og skalerer den op
        if (packType === 'blister_us') {
            const scaleWrapper = document.createElement('div');
            scaleWrapper.style.transform = "scale(1.2)";
            scaleWrapper.style.transformOrigin = "center center";
            scaleWrapper.appendChild(blisterImg);
            blisterWrapper.appendChild(scaleWrapper);
        } else {
            blisterWrapper.appendChild(blisterImg);
        }

        const cardContainer = document.createElement('div');
        cardContainer.className = 'blister-card-container';
        
        const renderedItems = [];
        for (const item of items) {
            const isCard = (typeof cardData !== 'undefined' && cardData.some(c => c.id === item.id));
            const el = isCard ? createAlbumCardElement(item, true, item.status === 'NEW' ? "NEW" : item.status) : createFigureElement(item, true, item.status === 'NEW' ? "NEW" : item.status);
            el.style.cursor = 'pointer';
            el.onclick = (e) => { e.stopPropagation(); showBigReveal(item); };
            cardContainer.appendChild(el);
            renderedItems.push({ el, item });
        }
        blisterWrapper.appendChild(cardContainer);
        scene.appendChild(blisterWrapper);

        // 3. Animation Sequence
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier1');
        blisterImg.classList.add('tier-1-shake');
        let finalGlowFilterString = "";
        await wait(1500);

        if (maxTier >= 2) {
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier2');
            blisterImg.classList.add('tier-2-pulse-box');
            finalGlowFilterString = "drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))";
            await wait(1500);

            if (maxTier >= 3) {
                if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier3');
                blisterImg.classList.add('tier-3-heavy-shake');
                finalGlowFilterString = "drop-shadow(0 0 20px rgba(255, 255, 255, 0.9))";
                await wait(2000);

                if (maxTier === 4) {
                    if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier4');
                    const secretItem = items.find(i => i.group === 'Secret' || i.release === 'secret');
                    if (secretItem) {
                        let gColor = '#ff00ff'; 
                        if (secretItem.type === 'red') gColor = '#ff3333';
                        if (secretItem.type === 'green') gColor = '#33ff33';
                        if (secretItem.type === 'blue') gColor = '#3388ff';
                        blisterImg.style.setProperty('--glitch-color', gColor);
                    }
                    blisterImg.classList.add('tier-4-glitch');
                    const gColor = blisterImg.style.getPropertyValue('--glitch-color');
                    finalGlowFilterString = `drop-shadow(0 0 20px ${gColor}) drop-shadow(0 0 40px ${gColor})`;
                    document.body.classList.add('screen-shake');
                    await wait(1500);
                    document.body.classList.remove('screen-shake');
                }
            }
        }

        // 4. Reveal
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', `reveal-tier${maxTier}`);
        blisterImg.src = openImgSrc;
        blisterImg.classList.remove('tier-1-shake', 'tier-2-pulse', 'tier-2-pulse-box', 'tier-3-heavy-shake', 'tier-4-glitch');
        
        // Sæt den endelige filter-stil, der kombinerer mørk baggrund med den opnåede glød
        let finalFilter = "brightness(0.6)";
        if (finalGlowFilterString) {
            finalFilter += ` ${finalGlowFilterString}`;
        }
        blisterImg.style.filter = finalFilter;
        
        cardContainer.classList.add('popped');

        await wait(500);
        
        renderedItems.forEach(({ el, item }) => {
            el.classList.add('revealed');
            
            const baseEl = el.querySelector('.figure-base');
            if (!baseEl) return;

            if (item.type === 'hybrid') {
                baseEl.style.boxShadow = `-5px 0 20px var(--${item.c1}), 5px 0 20px var(--${item.c2})`;
                el.classList.add('juicy-shake');
            } else if (item.group === 'Sciroids') {
                baseEl.style.boxShadow = "0 0 25px #00ff00";
                el.classList.add('juicy-shake');
            } else if (item.group === 'RAMMs' || item.type === 'metallic' || item.group === 'Secret' || item.release === 'secret') {
                 baseEl.style.boxShadow = "0 0 20px var(--gold)";
                 el.classList.add('juicy-shake');
            }
        });

        showCloseButton(packType);
        return;
    }

    // --- ELITE RAMM PACK LOGIC (SPECIAL EDITION RAMMS) ---
    if (packType === 'elite_ramm') {
        const eliteWrapper = document.createElement('div');
        eliteWrapper.className = 'elite-ramm-wrapper';
        eliteWrapper.style.cssText = 'display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; margin-top:5vh;';

        const boxImg = document.createElement('img');
        boxImg.src = 'assets/shop/special_edition_ramm_set.gif';
        boxImg.style.cssText = 'width:380px; max-width:90vw; object-fit:contain; transition: all 0.3s ease-out; filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.4)); z-index:2; position:relative;';
        
        const itemsContainer = document.createElement('div');
        itemsContainer.style.cssText = 'display:flex; gap:25px; justify-content:center; align-items:center; flex-wrap:wrap; perspective:1000px; margin-bottom:-120px; z-index:5; position:relative;';

        // Forbered figurerne, men skjul dem nede i "kassen" til at starte med
        const renderedItems = items.map((item, index) => {
            const el = createFigureElement(item, true, item.status === 'NEW' ? "NEW" : item.status);
            el.style.opacity = '0';
            el.style.transform = 'scale(0.2) translateY(150px) rotateX(45deg)'; // Længere ned for at starte bag kassen
            el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Giver en fjedrende "pop" effekt
            el.style.cursor = 'pointer';
            el.onclick = (e) => { e.stopPropagation(); showBigReveal(item); };
            itemsContainer.appendChild(el);
            return { el, item, index };
        });

        // Bytter om på rækkefølgen så figurer er over kassen
        eliteWrapper.appendChild(itemsContainer);
        eliteWrapper.appendChild(boxImg);
        scene.appendChild(eliteWrapper);

        // 1. Kassen ryster
        await wait(500);
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier3');
        boxImg.classList.add('tier-3-heavy-shake');
        boxImg.style.filter = 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))';
        await wait(2000);

        // 2. Fade ud og skift til den åbne kasse
        boxImg.style.opacity = '0';
        await wait(300);
        boxImg.src = 'assets/shop/special_edition_ramm_set_open.gif'; // HUSK AT OPRETTE DENNE FIL!
        boxImg.classList.remove('tier-3-heavy-shake');
        
        // Skub kassen i baggrunden, gør den falmet og flyt den ned
        boxImg.style.zIndex = '0';
        boxImg.style.transform = 'scale(1.15) translateY(80px)'; // Større og skubbet kraftigt ned
        boxImg.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.4)) brightness(0.6)';
        boxImg.style.opacity = '0.8';
        
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier3');
        
        document.body.classList.add('screen-shake');
        await wait(300);
        document.body.classList.remove('screen-shake');

        // 3. "Pling Pling Pling" pop-out animation
        for (const { el, item, index } of renderedItems) {
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier2'); // Pop lyd
            el.style.opacity = '1';
            
            // V-Formation: Hæv yderste kort (index 0 og 2), og sænk det midterste (index 1)
            const finalY = (index === 1) ? '20px' : '-40px';
            el.style.transform = `scale(1.3) translateY(${finalY}) rotateX(0)`;

            const baseEl = el.querySelector('.figure-base');
            if (baseEl) baseEl.style.boxShadow = "0 0 25px var(--gold)";
            el.classList.add('juicy-shake');
            el.classList.add('revealed'); // Sikrer at navn og Power vises!
            
            await wait(400); // Vent lidt før næste figur popper
        }

        await wait(1000);
        showCloseButton(packType);
        return;
    }

    // --- ELITE JANGUTZ LOGIC (MYTHIC) ---
    if (packType === 'elite_jangutz') {
        const eliteWrapper = document.createElement('div');
        eliteWrapper.className = 'elite-jangutz-wrapper';
        // Nyt absolut layout: Låser elementerne fast, så de ikke skrider under skalering
        eliteWrapper.style.cssText = 'position:relative; width:100%; height:60vh; min-height:450px; display:flex; justify-content:center; margin-top:5vh;';

        const boxImg = document.createElement('img');
        boxImg.src = 'assets/shop/jangutz_pack.gif';
        boxImg.style.cssText = 'position:absolute; bottom:0; width:300px; max-width:80vw; object-fit:contain; transition: all 0.4s ease-out; filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.2)); z-index:2;';

        const itemContainer = document.createElement('div');
        itemContainer.style.cssText = 'position:absolute; bottom:90px; z-index:5; perspective:1000px; display:flex; justify-content:center; width:100%;';

        const item = items[0]; // Jangutz Khan
        const el = createFigureElement(item, true, item.status === 'NEW' ? "NEW" : item.status);
        el.style.opacity = '0';
        el.style.transformOrigin = 'bottom center'; // Vokser solidt fra fødderne
        el.style.transform = 'scale(0.2) rotateX(70deg)'; // Ligger fladt nede i kassen (ingen translateY nødvendig nu!)
        el.style.transition = 'all 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        el.style.cursor = 'pointer';
        el.onclick = (e) => { e.stopPropagation(); showBigReveal(item); };
        
        itemContainer.appendChild(el);
        // Bytter om på rækkefølgen så figur er over kassen
        eliteWrapper.appendChild(itemContainer);
        eliteWrapper.appendChild(boxImg);
        scene.appendChild(eliteWrapper);

        // 1. Dyster opbygning
        await wait(500);
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier4');
        container.style.transition = "background 2s";
        container.style.background = "radial-gradient(circle at center, rgba(40, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.99) 100%)"; // Blodrød glød bagved
        boxImg.classList.add('tier-3-heavy-shake');
        boxImg.style.filter = 'drop-shadow(0 0 40px rgba(255, 0, 0, 0.8)) brightness(0.8) contrast(1.5)';
        await wait(2000);

        // 2. Skælv og energi-overload
        boxImg.style.setProperty('--glitch-color', '#ff0000');
        boxImg.classList.add('tier-4-glitch');
        document.body.classList.add('screen-shake');
        await wait(1800);
        document.body.classList.remove('screen-shake');

        // 3. Eksplosion og skift til åben kasse
        boxImg.style.opacity = '0';
        boxImg.style.transform = 'scale(1.5)'; // Pakken "sprænger" visuelt
        await wait(300);
        
        boxImg.src = 'assets/shop/jangutz_pack_open.gif'; // HUSK AT OPRETTE DENNE FIL!
        boxImg.classList.remove('tier-4-glitch', 'tier-3-heavy-shake');
        
        // Skub kassen i baggrunden, gør den falmet og flyt den ned
        boxImg.style.zIndex = '0';
        boxImg.style.transform = 'translateY(40px)'; // Rykker kassen let ned (ingen scale)
        boxImg.style.filter = 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.4)) brightness(0.6)';
        boxImg.style.opacity = '0.8';

        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier4');
        
        // Et sidste kraftigt ryst, når han popper op
        document.body.classList.add('screen-shake');
        await wait(300);
        document.body.classList.remove('screen-shake');
        
        // Jangutz stiger op!
        el.style.opacity = '1';
        el.style.transform = 'scale(1.4) rotateX(0)'; // Rejser sig op direkte fra sit ankerpunkt nede i æsken
        
        const baseEl = el.querySelector('.figure-base');
        if (baseEl) baseEl.style.boxShadow = "0 0 40px var(--red), 0 0 60px var(--gold)";
        el.classList.add('juicy-shake');
        el.classList.add('revealed'); // Sikrer at navn og Power vises!

        announceDrop(item, 4000, packType); // Din eksisterende announceDrop tager sig allerede fantastisk af E-ramm/Jangutz!
        
        await wait(1500);
        showCloseButton(packType);
        return;
    }

    // --- SCIROID BATTLESHIP LOGIC ---
    if (packType === 'battleship') {
        const battleWrapper = document.createElement('div');
        battleWrapper.className = 'battleship-wrapper';
        battleWrapper.style.cssText = 'position:relative; width:100%; min-height:80vh; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; margin-top:2vh; z-index:1; padding-bottom: 50px;';

        // INTRO BOXES
        const introContainer = document.createElement('div');
        introContainer.style.cssText = 'position:absolute; top:45%; transform:translateY(-50%); display:flex; justify-content:center; align-items:center; width:100%; z-index:10; pointer-events:none;';

        const closedBox = document.createElement('img');
        closedBox.src = 'assets/shop/sciroid_battleship_box.gif';
        closedBox.style.cssText = 'position:absolute; width:500px; max-width:90vw; object-fit:contain; transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);';

        const openBox = document.createElement('img');
        openBox.src = 'assets/shop/sciroid_battleship_box_open.gif';
        openBox.style.cssText = 'position:absolute; width:500px; max-width:90vw; object-fit:contain; opacity:0; transition: all 0.5s ease;';

        introContainer.appendChild(openBox);
        introContainer.appendChild(closedBox);
        battleWrapper.appendChild(introContainer);

        // ITEM ROWS
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:15px; justify-content:center; margin-bottom: 30px; width:100%; max-width:800px; z-index:2; opacity:0; transition: opacity 0.5s;';
        
        const middleRow = document.createElement('div');
        middleRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:30px; justify-content:center; margin-bottom: 40px; width:100%; z-index:3;';

        const bottomRow = document.createElement('div');
        bottomRow.style.cssText = 'display:flex; justify-content:center; width:100%; z-index:4;';

        battleWrapper.appendChild(topRow);
        battleWrapper.appendChild(middleRow);
        battleWrapper.appendChild(bottomRow);
        scene.appendChild(battleWrapper);

        let podItemData = null;
        let podEl = null;
        let podClosedImg = null;
        
        const sciroidEls = [];
        const topEls = [];

        items.forEach((item) => {
            const isCard = (typeof cardData !== 'undefined' && cardData.some(c => c.id === item.id));
            
            if (item.type === 'pod') {
                podItemData = item;
                podEl = document.createElement('div');
                podEl.style.cssText = 'position:relative; transform: scale(2.4); margin-top: 40px; opacity:0; transition: opacity 0.5s; display:flex; flex-direction:column; align-items:center; cursor:pointer;';
                podEl.onclick = (e) => { e.stopPropagation(); showBigReveal(item); };

                podClosedImg = document.createElement('img');
                podClosedImg.src = 'assets/sciroid_battleship/sciroid_battleship_pod_closed.gif';
                podClosedImg.style.cssText = 'width:180px; object-fit:contain; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.8)); transition: all 0.3s;';
                
                podEl.appendChild(podClosedImg);
                bottomRow.appendChild(podEl);
            } 
            else if (item.group === 'Sciroids') {
                const el = createFigureElement(item, true, item.status === 'NEW' ? "NEW" : item.status);
                el.style.opacity = '0';
                el.style.transform = 'translateY(-150px) scale(0.5)';
                el.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                el.style.cursor = 'pointer';
                el.onclick = (e) => { e.stopPropagation(); showBigReveal(item); };
                
                const wrap = document.createElement('div');
                wrap.style.cssText = 'position:relative; display:flex; justify-content:center; align-items:center; transform: scale(1.2);';
                
                const beam = document.createElement('div');
                beam.style.cssText = 'position:absolute; top:-400px; width:60px; height:600px; background:linear-gradient(to bottom, rgba(0,255,0,0) 0%, rgba(0,255,0,0.8) 80%, rgba(0,255,0,0) 100%); opacity:0; pointer-events:none; z-index:20; filter:blur(4px); transition: opacity 0.15s ease;';
                
                wrap.appendChild(beam);
                wrap.appendChild(el);
                middleRow.appendChild(wrap);
                
                sciroidEls.push({ wrap, el, beam, item });
            } 
            else {
                const el = isCard ? createAlbumCardElement(item, true, item.status === 'NEW' ? "NEW" : item.status) : createFigureElement(item, true, item.status === 'NEW' ? "NEW" : item.status);
                const flipWrap = document.createElement('div');
                flipWrap.className = 'flip-container';
                flipWrap.innerHTML = '<div class="flip-inner"><div class="flip-front"><img src="assets/bgg/logo_foa_sim.gif" style="width:80%; opacity:0.5; filter:grayscale(1);"></div><div class="flip-back"></div></div>';
                flipWrap.querySelector('.flip-back').appendChild(el);
                flipWrap.style.cursor = 'pointer';
                flipWrap.onclick = (e) => { e.stopPropagation(); showBigReveal(item); };
                topRow.appendChild(flipWrap);
                topEls.push({ flipWrap, el, item });
            }
        });

        // ANIMATION SEQUENCE
        await wait(500);
        
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'swipe-1');
        closedBox.style.transform = 'translateX(-100vw) rotateY(-20deg)';
        closedBox.style.opacity = '0';
        openBox.style.opacity = '1';
        
        await wait(500); // Vises lynhurtigt i et halvt sekund
        openBox.style.opacity = '0';
        openBox.style.transform = 'scale(0.8)';
        await wait(300);

        topRow.style.opacity = '1';
        for (const { flipWrap } of topEls) flipWrap.classList.add('flipped');
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier2');
        await wait(500);

        podEl.style.opacity = '1';
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier3');
        podClosedImg.classList.add('tier-3-heavy-shake');
        podClosedImg.style.filter = 'drop-shadow(0 0 30px #00ff00)';
        await wait(1500);

        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier3');
        podClosedImg.style.display = 'none';
        const revealedPodEl = createFigureElement(podItemData, true, podItemData.status === 'NEW' ? "NEW" : podItemData.status);
        revealedPodEl.style.transform = 'scale(1.2)';
        revealedPodEl.style.filter = 'drop-shadow(0 0 25px #00ff00)';
        revealedPodEl.classList.add('revealed');
        podEl.appendChild(revealedPodEl);
        await wait(500);

        container.style.transition = "background 0.5s";
        container.style.background = "radial-gradient(circle at center, rgba(0, 30, 0, 0.95) 0%, rgba(0, 0, 0, 0.99) 100%)";
        
        for (const { el, beam, item } of sciroidEls) {
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier2');
            beam.style.opacity = '1';
            await wait(50);
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
            const baseEl = el.querySelector('.figure-base');
            if (baseEl) baseEl.style.boxShadow = "0 0 25px #00ff00";
            el.classList.add('juicy-shake');
            el.classList.add('revealed'); // Sikrer at navn og Power vises!
            await wait(100);
            beam.style.opacity = '0';
            await wait(150);
        }

        const sciroids = items.filter(i => i.group === 'Sciroids');
        if (sciroids.length > 0) announceDrop(sciroids[0], 3000, packType);

        await wait(1500);
        showCloseButton(packType);
        return;
    }

    // 1. SORTERING: Standard først, derefter Rares (for spænding)
    const isSpecial = (item) => {
        // Fallback: Hvis item mangler gruppe (gamle data), slå det op
        let group = item.group;
        let rarity = item.rarity;
        
        // Tjek om det er et kort
        const isCard = (typeof cardData !== 'undefined' && cardData.some(c => c.id === item.id));

        if (!group) {
             let base = alienData.find(a => a.id === item.id);
             if (!base && typeof weaponData !== 'undefined') base = weaponData.find(a => a.id === item.id);
             if (!base && typeof crystaliteData !== 'undefined') base = crystaliteData.find(a => a.id === item.id);
             if (!base && typeof shadowData !== 'undefined') base = shadowData.find(a => a.id === item.id);
             if (!base && isCard) base = cardData.find(c => c.id === item.id);
             if (base) { group = base.group; rarity = base.rarity; }
        }

        if (isCard) {
            // I store pakker flytter vi kort til vingerne for at spare plads.
            // I Battle/Pod Packs skal de blive i bunden (return false).
            return (packType === 'war' || packType === 'battleship');
        }

        const specialGroups = ['Sciroids', 'E-ramm', 'Weapons', 'Crystalites', 'Shadows'];
        return specialGroups.includes(group) || item.type === 'hybrid' || item.type === 'metallic' || rarity === 'rare' || rarity === 'legendary' || rarity === 'mythic' || rarity === 'ultra_rare' || rarity === 'super_rare';
    };
    
    // Skelnen mellem "Major Specials" (Store bokse) og "Minor Specials" (Side items)
    const isMajorSpecial = (item) => {
        if (item.name === 'SCIROID BATTLESHIP') return true;
        // Kort er aldrig Major (skal ud i vingerne)
        if (typeof cardData !== 'undefined' && cardData.some(c => c.id === item.id)) return false;

        let group = item.group;
        if (!group) {
             let base = alienData.find(a => a.id === item.id); // Kun Aliens (Mutants/RAMMs) er major her
             if (base) group = base.group;
        }
        return group === 'Mutants' || group === 'RAMMs' || group === 'Secret' || group === 'Sciroids' || group === 'E-ramm' || item.type === 'hybrid' || item.type === 'metallic';
    };

    const standards = items.filter(i => !isSpecial(i));
    const majors = items.filter(i => isSpecial(i) && isMajorSpecial(i));
    const minors = items.filter(i => isSpecial(i) && !isMajorSpecial(i)); // Våben og PPs
    
    const itemElements = [];

    // Opret rækker til layoutet
    // TOP ROW: Container til både majors og minors
    const topRow = document.createElement('div');
    topRow.className = 'opener-top-row';
    
    // Wings til side-items
    const leftWing = document.createElement('div');
    leftWing.className = 'opener-wing-left';
    
    const centerStage = document.createElement('div');
    centerStage.className = 'opener-center-stage';
    
    const rightWing = document.createElement('div');
    rightWing.className = 'opener-wing-right';
    
    topRow.appendChild(leftWing);
    topRow.appendChild(centerStage);
    topRow.appendChild(rightWing);
    
    const standardRow = document.createElement('div');
    standardRow.className = 'opener-standard-row';

    // Opret en ny tredje række til våben og kort for at give bedre plads på mobil
    const minorRow = document.createElement('div');
    minorRow.className = 'opener-minor-row';

    // Helper function til at generere kortene
    const processItem = (item, containerRow, isLarge) => {
        const isNew = item.status === 'NEW';
        const isCard = (typeof cardData !== 'undefined' && cardData.some(c => c.id === item.id));
        const renderedItemEl = isCard ? createAlbumCardElement(item, true, isNew ? "NEW" : item.status) : createFigureElement(item, true, isNew ? "NEW" : item.status);
        renderedItemEl.style.cursor = 'pointer';
        renderedItemEl.onclick = (e) => { e.stopPropagation(); showBigReveal(item); };

        // Bestem visningstype
        let displayType = 'flip'; // Standard
        if (isMajorSpecial(item)) {
            if (packType.startsWith('blister')) displayType = 'blister_special';
            else if (item.group === 'Sciroids' || item.group === 'E-ramm' || item.release === 'special_edition') displayType = 'epic';
            else displayType = 'box';
        } else if (isSpecial(item)) {
            displayType = 'side_item'; // Ny type for Våben/PPs
        }

        let el, flipEl = null, beam = null;
        if (displayType === 'box') {
            // MYSTERY BOX SETUP
            el = document.createElement('div');
            el.className = 'mystery-box-wrapper';
            // Gør Mystery Box 2x større
            if (isLarge) {
                el.style.transform = "scale(1.5)";
                el.style.margin = "0 3cqw";
            }
            el.innerHTML = `
                <div class="mystery-box-mover">
                    <img src="assets/shop/mystery_box.gif" class="mystery-box-img">
                </div>
                <div class="mystery-item"></div>
            `;
            
            const mc = el.querySelector('.mystery-item');
            mc.appendChild(renderedItemEl);

        } else if (displayType === 'battleship_pod_box') {
            el = document.createElement('div');
            el.className = 'mystery-box-wrapper';
            if (isLarge) { el.style.transform = "scale(1.5)"; el.style.margin = "0 3cqw"; }
            el.innerHTML = `
                <div class="mystery-box-mover">
                    <img src="assets/sciroid_battleship/sciroid_battleship_pod_closed.gif" class="mystery-box-img pod-img">
                </div>
                <div class="mystery-item"></div>
            `;
            el.querySelector('.mystery-item').appendChild(renderedItemEl);
            
        } else if (displayType === 'beam_down') {
            el = document.createElement('div');
            if (isLarge) { el.style.transform = "scale(1.5)"; el.style.margin = "0 3cqw"; }
            el.style.position = 'relative';
            el.style.display = 'flex';
            el.style.justifyContent = 'center';
            el.style.alignItems = 'center';
            
            beam = document.createElement('div');
            beam.style.cssText = 'position:absolute; top:-400px; width:60px; height:500px; background:linear-gradient(to bottom, rgba(0,255,0,0) 0%, rgba(0,255,0,0.8) 80%, rgba(0,255,0,0) 100%); opacity:0; pointer-events:none; z-index:20; filter:blur(4px); transition: opacity 0.2s ease;';
            
            flipEl = document.createElement('div');
            flipEl.className = 'flip-container';
            flipEl.style.opacity = '0';
            flipEl.style.transform = 'translateY(-150px) scale(0.5)';
            flipEl.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            flipEl.innerHTML = `
                <div class="flip-inner">
                    <div class="flip-front"><img src="assets/bgg/logo_foa_sim.gif" style="width:80%; opacity:0.5; filter:grayscale(1);"></div>
                    <div class="flip-back"></div>
                </div>
            `;
            flipEl.querySelector('.flip-back').appendChild(renderedItemEl);
            
            el.appendChild(beam);
            el.appendChild(flipEl);
        } else {
            // FLIP CARD SETUP (Standard, Blister, Epic)
            el = document.createElement('div');
            el.className = 'flip-container';
            if (isLarge) {
                el.style.transform = "scale(1.5)";
                el.style.margin = "0 3cqw";
            } else if (displayType === 'side_item') {
                el.style.transform = "scale(1.15)";
            }
            el.innerHTML = `
                <div class="flip-inner">
                    <div class="flip-front"><img src="assets/bgg/logo_foa_sim.gif" style="width:80%; opacity:0.5; filter:grayscale(1);"></div>
                    <div class="flip-back"></div>
                </div>
            `;
            el.querySelector('.flip-back').appendChild(renderedItemEl);
            
            // Skjul Epic kort helt indtil surge
            if (displayType === 'epic') el.style.opacity = '0';
        }

        containerRow.appendChild(el);
        itemElements.push({ el, item, displayType, element: renderedItemEl, flipEl, beam });
    };

    // 2. RENDERING AF SPECIALS (Øverste række - Store bokse)
    for (const item of majors) {
        processItem(item, centerStage, true);
    }
    
    // 2.5 RENDERING AF MINORS (Side items på vingerne)
    minors.forEach((item) => {
        const isCard = (typeof cardData !== 'undefined' && cardData.some(c => c.id === item.id));
        const group = item.group;
        
        if (group === 'Crystalites' || group === 'Shadows') {
            processItem(item, centerStage, false); // Power Players bliver i midten
        } else {
            processItem(item, minorRow, false); // Våben og Kort flyttes til den nye nederste række
        }
    });

    // 3. RENDERING AF STANDARDS (Nederste række - Normal størrelse)
    for (const item of standards) {
        processItem(item, standardRow, false);
    }

    // Tilføj rækkerne til containeren (hvis de har indhold)
    if (centerStage.hasChildNodes()) {
        if (majors.length > 0) topRow.style.marginBottom = "8cqh"; // Skubber nederste række ned, så de ikke overlapper
        scene.appendChild(topRow);
    }
    if (standards.length > 0) scene.appendChild(standardRow);
    if (minorRow.hasChildNodes()) {
        scene.appendChild(minorRow);
    }

    // 3. AUTOMATISK REVEAL SEKVENS (Sorteret så specials kommer sidst)
    const revealSequence = [
        ...itemElements.filter(x => !isSpecial(x.item)),
        ...itemElements.filter(x => isSpecial(x.item) && !isMajorSpecial(x.item)), // Minors før majors
        ...itemElements.filter(x => isMajorSpecial(x.item))
    ];

    await wait(500); // Start pause

    for (const seqItem of revealSequence) {
        const { el, item, displayType, element, flipEl, beam } = seqItem;
        
        const applyJuice = () => {
            const baseEl = element.querySelector('.figure-base');
            if (!baseEl) return;

            if (item.type === 'hybrid') {
                baseEl.style.boxShadow = `-5px 0 20px var(--${item.c1}), 5px 0 20px var(--${item.c2})`;
            } else if (item.group === 'Sciroids') {
                baseEl.style.boxShadow = "0 0 25px #00ff00";
            } else {
                baseEl.style.boxShadow = "0 0 20px var(--gold)";
            }
            element.classList.add('juicy-shake');
            
            // Auto-scroll hvis elementet er uden for skærmen (godt til mobiler/zoom)
            // Men kun hvis det ikke forstyrrer layoutet for meget
            // el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        
        if (displayType === 'flip' || displayType === 'side_item') {
            // STANDARD FLIP
            el.classList.add('flipped');
            await wait(150); // Hurtigt flow
            element.classList.add('revealed'); // Vis PWR
            if (displayType === 'side_item') {
                 applyJuice();
                 announceDrop(item, 2000, packType);
                 await wait(300);
            }
        } 
        
        else if (displayType === 'box') {
            // MYSTERY BOX LOGIC
            const boxImg = el.querySelector('.mystery-box-img');
            const hiddenItem = el.querySelector('.mystery-item');
            
            // 1. Opdater Betingelserne
            const isMutant = (item.group === 'Mutants' || item.type === 'hybrid') && item.group !== 'Secret';
            const isHighMutant = isMutant && (item.power >= 19);
            const isRAMM = item.type === 'metallic' || item.group === 'RAMMs';
            const isSecret = item.group === 'Secret' || item.release === 'secret';
            let finalGlowClass = '';
            let achievedTier = 1;

            // TIER 1 (Kører for ALLE: Low Mutant, High Mutant, RAMM og Secret)
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier1');
            boxImg.classList.add('tier-1-shake');
            await wait(1500);

            if (isHighMutant || isRAMM || isSecret) {
                // TIER 2 (Kører KUN for High Mutant, RAMM og Secret)
                achievedTier = 2;
                if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier2');
                boxImg.classList.add('tier-2-pulse-box'); // Ny klasse der bruger drop-shadow
                finalGlowClass = 'glow-tier-2';
                await wait(1500);

                if (isRAMM || isSecret) {
                    // TIER 3 (Kører KUN for RAMM og Secret - dette var vores gamle Tier 2)
                    achievedTier = 3;
                    if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier3');
                    boxImg.classList.add('tier-3-heavy-shake'); 
                    container.style.background = "rgba(0,0,0,0.98)"; // Darker bg
                    finalGlowClass = 'glow-tier-3';
                    await wait(2000);

                    if (isSecret) {
                        // TIER 4 (Kører KUN for Secret Error Prints - dette var vores gamle Tier 3)
                        achievedTier = 4;
                        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier4');
                        
                        // Dynamic Glitch Color based on type
                        let gColor = '#ff00ff'; // fallback
                        if (item.type === 'red') gColor = '#ff3333';
                        if (item.type === 'green') gColor = '#33ff33';
                        if (item.type === 'blue') gColor = '#3388ff';
                        boxImg.style.setProperty('--glitch-color', gColor);

                        boxImg.classList.add('tier-4-glitch');
                        finalGlowClass = 'glow-tier-4';
                        document.body.classList.add('screen-shake');
                        await wait(2000);
                        document.body.classList.remove('screen-shake');
                    }
                }
            }

            // OPEN! Først nu, efter alle delays er overstået.
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', `reveal-tier${achievedTier}`);
            boxImg.src = "assets/shop/mystery_box_open.gif";
            boxImg.classList.remove('tier-1-shake', 'tier-2-pulse', 'tier-2-pulse-box', 'tier-3-heavy-shake', 'tier-4-glitch');
            if (finalGlowClass) boxImg.classList.add(finalGlowClass);
            hiddenItem.classList.add('popped');
            announceDrop(item, 2500, packType); // Starter NU (sammen med zoom) og varer 500ms længere for at matche slut-tidspunktet
            
            await wait(500);
            element.classList.add('revealed'); // Vis PWR
            applyJuice();
            await wait(500); // Kortere pause for at holde flowet
            container.style.background = "rgba(0,0,0,0.95)"; // Reset bg
        }
        else if (displayType === 'battleship_pod_box') {
            const boxImg = el.querySelector('.mystery-box-img');
            const hiddenItem = el.querySelector('.mystery-item');
            
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier3');
            boxImg.classList.add('tier-3-heavy-shake'); 
            boxImg.style.filter = 'drop-shadow(0 0 20px #00ff00)';
            await wait(2000);

            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier3');
            boxImg.src = "assets/sciroid_battleship/sciroid_battleship_pod_open.gif";
            boxImg.classList.remove('tier-3-heavy-shake');
            hiddenItem.classList.add('popped');
            
            await wait(500);
            element.classList.add('revealed');
            applyJuice();
            await wait(500);
        }
        else if (displayType === 'beam_down') {
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier4');
            container.style.transition = "background 1s";
            container.style.background = "radial-gradient(circle at center, rgba(0, 30, 0, 0.95) 0%, rgba(0, 0, 0, 0.99) 100%)";
            
            beam.style.opacity = '1';
            await wait(150);
            flipEl.style.opacity = '1';
            flipEl.style.transform = 'translateY(0) scale(1)';
            flipEl.classList.add('flipped');
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier4');
            await wait(150);
            beam.style.opacity = '0';
            
            await wait(400);
            element.classList.add('revealed');
            applyJuice();
            announceDrop(item, 2800, packType);
            await wait(1500);
            container.style.background = "rgba(0,0,0,0.95)"; // Reset bg
        }

        else if (displayType === 'blister_special') {
            // BLISTER SPECIAL (Ingen boks, men ryst kortet)
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier2');
            el.classList.add('anim-shake-tier2');
            await wait(1500);
            el.classList.remove('anim-shake-tier2');
            el.classList.add('flipped');
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier2');
            await wait(500);
            element.classList.add('revealed');
            applyJuice();
            announceDrop(item, 2000, packType);
        }

        else if (displayType === 'epic') {
            // EPIC REVEAL (SciRoids / Jangutz)
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'riser-tier4');
            el.style.opacity = '1';
            announceDrop(item, 2800, packType); // Starter sammen med surge
            el.classList.add('anim-surge'); // Digital surge animation
            await wait(400); // Vent til surge dækker
            el.classList.add('flipped');
            if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier4');
            await wait(400);
            element.classList.add('revealed');
            applyJuice();
            await wait(1500);
        }
    }

    showCloseButton(packType, scene);
}

function showCloseButton(packType, sceneContainer) {
    // Gendan den originale lydafspiller
    if (typeof window.originalAudioPlay === 'function') {
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play = window.originalAudioPlay;
        window.originalAudioPlay = null;
    }

    // Slå skip-overlay fra, så man kan klikke på figurerne
    const skipOverlay = document.getElementById('skip-opener-overlay');
    if (skipOverlay) skipOverlay.style.pointerEvents = 'none';

    const container = document.getElementById('shop-batch');
    if (!container) return;

    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'opener-btn-wrapper';

    // "Køb igen" button
    const buyAgainBtn = document.createElement('button');
    buyAgainBtn.innerText = "KØB IGEN";
    buyAgainBtn.className = 'btn-buy-again';
    buyAgainBtn.onclick = (e) => {
        if (e) e.stopPropagation(); // Undgå at klikket bobler op til baggrunden
        const container = document.getElementById('shop-batch');
        if(container) container.innerHTML = "";
        if(typeof setShopBusy === 'function') setShopBusy(false);
        
        let success = false;
        if (packType === 'blister_us') {
            success = typeof buyVaultPack === 'function' ? buyVaultPack() : false;
        } else if (packType === 'elite_ramm') {
            success = typeof buyElitePack === 'function' ? buyElitePack() : false;
        } else if (packType === 'elite_jangutz') {
            success = typeof buyJangutzPack === 'function' ? buyJangutzPack() : false;
        } else {
            success = typeof buyPack === 'function' ? buyPack(packType) : false;
        }
        
        if (!success) resetShopState();
    };
    
    // "Afslut" button
    const okBtn = document.createElement('button');
    okBtn.innerText = "AFSLUT";
    okBtn.className = 'btn-close-pack';
    okBtn.onclick = (e) => {
        if (e) e.stopPropagation();
        resetShopState();
    };

    btnWrapper.appendChild(okBtn);
    btnWrapper.appendChild(buyAgainBtn);
    (sceneContainer || container).appendChild(btnWrapper);

    // Tillad at lukke ved at klikke hvorsomhelst i baggrunden
    // Lagt i en lille forsinkelse, så skip-klikket ikke uforvarende lukker pakken
    setTimeout(() => {
        container.onclick = resetShopState;
    }, 100);

    // Tjek om Fætter BR skal give et tabt kort!
    if (window.droppedCardReward) {
        const cardId = window.droppedCardReward;
        window.droppedCardReward = null;
        
        let brText = "Hov! Du tabte noget, da du åbnede pakken! Her, værsgo.";
        if (cardId === 165) {
            brText = "Hov, vent! Du var lige ved at glemme det her også!";
        }

        setTimeout(() => {
            showBRPopup([{
                id: 'dropped_card_' + cardId,
                text: brText,
                requireClick: true,
                onClick: () => {
                    const card = cardData.find(c => c.id === cardId);
                    if (card) {
                        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('shop', 'reveal-tier3');
                        showBigReveal({ ...card, status: 'NEW' });
                    }
                }
            }]);
        }, 800);
    } else {
        setTimeout(() => {
            if (typeof checkShopPopups === 'function') checkShopPopups();
        }, 800);
    }
}

// Global reveal overlay logic (moved from shop.js)
function showBigReveal(item) {
    // Ensure overlay exists
    if (!document.getElementById('revealOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'revealOverlay'; // Resten af indholdet er i index.html
        document.body.appendChild(overlay);
    }

    // Udvidet søgning efter data
    let base = alienData.find(a => a.id === item.id);
    if (!base && typeof weaponData !== 'undefined') base = weaponData.find(a => a.id === item.id);
    if (!base && typeof cardData !== 'undefined') base = cardData.find(a => a.id === item.id);
    if (!base && typeof crystaliteData !== 'undefined') base = crystaliteData.find(a => a.id === item.id);
    if (!base && typeof shadowData !== 'undefined') base = shadowData.find(a => a.id === item.id);

    // Fallback for Pods (som ikke har ID i data listerne)
    if (item.type === 'pod') {
        base = { name: item.name, img: item.img, release: 'RESOURCE' };
    } else if (item.type === 'merch') {
        base = { name: item.name, img: item.img, release: 'MERCH' };
    }

    const imgFilter = base && base.cssFilter ? base.cssFilter : 'none';
    const overlay = document.getElementById('revealOverlay');
    overlay.style.display = 'flex';
    overlay.onclick = closeReveal; // Gør det muligt at lukke ved klik på baggrunden
    
    // Populate Data
    setTimeout(() => document.getElementById('bigCard').classList.add('show'), 10);
    document.getElementById('bigName').innerText = item.name || (base ? base.name : 'ITEM');
    const pwr = item.power !== undefined ? item.power : (base && base.powerRange ? '?' : '');
    document.getElementById('bigBR').innerHTML = pwr ? "PWR: " + pwr : "";
    document.getElementById('bigImg').src = (base && base.img) ? base.img : item.img;
    document.getElementById('bigImg').style.filter = imgFilter;
    
    const statusEl = document.getElementById('bigStatus');
    if (item.status) {
        statusEl.innerText = item.status;
        statusEl.className = "card-status-overlay status-" + item.status;
        statusEl.style.display = 'block';
    } else {
        statusEl.style.display = 'none';
    }
    
    const bigCard = document.getElementById('bigCard');
    bigCard.onclick = (e) => { e.stopPropagation(); closeReveal(); };

    const bar = document.getElementById('bigBar');
    bar.className = "type-bar " + (item.type || 'none');
    bar.style.background = ''; // Nulstil inline background

    const group = item.group || (base ? base.group : '');

    if (group === 'E-ramm') {
        bar.style.background = `linear-gradient(90deg, var(--red), var(--blue), var(--green))`;
    } else if (group === 'Sciroids' || item.group === 'Sciroids') {
        bar.style.background = `linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 50%, #e0e0e0 100%)`;
    } else if (group === 'RAMMs' || item.type === 'metallic' || item.group === 'RAMMs') {
        bar.style.background = `linear-gradient(135deg, #cd7f32 0%, #8b4513 50%, #cd7f32 100%)`;
    } else if (item.id === 201) { // Monsoon
        bar.style.background = '#40E0D0'; // Tyrkis
    } else if (item.id === 202) { // Twister
        bar.style.background = '#8A2BE2'; // Lilla
    } else if (item.id === 203) { // Blaze
        bar.style.background = '#FF4500'; // Orange
    } else if(item.type === 'hybrid') { 
        bar.style.setProperty('--c1', base ? base.c1 : item.c1); 
        bar.style.setProperty('--c2', base ? base.c2 : item.c2); 
    }
    
    if(item.type === 'pod') { bar.style.background = item.color || '#444'; }
    else if(item.type === 'merch') { bar.style.background = '#888'; }
    
    document.getElementById('bigTL').innerText = item.id ? `#${item.id}` : (item.type === 'pod' ? 'POD' : '');
    const displayRelease = item.release || (base && (base.releases ? base.releases[0] : base.release));
    document.getElementById('bigTR').innerText = displayRelease ? displayRelease.toUpperCase() : (item.type === 'pod' ? 'RESOURCE' : "ITEM");
}

function closeReveal() { 
    const c = document.getElementById('bigCard');
    if(c) c.classList.remove('show'); 
    setTimeout(() => {
        const o = document.getElementById('revealOverlay');
        if(o) o.style.display = 'none';
    }, 300); 
}

function showPackAnnouncement(html, duration = 2000) {
    const scene = document.querySelector('.game-scene-container.shop-scene') || document.body;
    const announceEl = document.createElement('div');
    announceEl.className = 'pack-announcement';
    announceEl.innerHTML = html;
    scene.appendChild(announceEl);

    setTimeout(() => { announceEl.classList.add('show'); }, 50);
    setTimeout(() => {
        announceEl.classList.remove('show');
        announceEl.classList.add('hide');
        setTimeout(() => announceEl.remove(), 300);
    }, duration);
}

function announceDrop(item, duration = 2000, packType = null) {
    let text = "";
    let style = "color: #fff;";

    // Sikr at vi har gruppe data (samme fallback som isSpecial)
    let group = item.group;
    if (!group) {
         // Simpel lookup hvis nødvendigt, ellers antag standard
         const base = alienData.find(a => a.id === item.id) || weaponData.find(a => a.id === item.id) || crystaliteData.find(a => a.id === item.id) || shadowData.find(a => a.id === item.id);
         if(base) group = base.group;
    }

    const isCard = (typeof cardData !== 'undefined' && cardData.some(c => c.id === item.id));

    if (group === 'E-ramm') {
        text = "MYTHIC DROP!<br>JANGUTZ KHAN";
        style = "background: linear-gradient(90deg, var(--red), var(--blue), var(--green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 10px rgba(255,255,255,0.2); font-size: 3.5rem;";
        style = "background: linear-gradient(90deg, var(--red), var(--blue), var(--green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 10px rgba(255,255,255,0.2);";
    } else if (group === 'Sciroids') {
        text = "LEGENDARY DROP!<br>SCIROID";
        style = "background: linear-gradient(135deg, #fff 0%, #aaa 50%, #fff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255,255,255,0.6); font-size: 3.5rem;";
        style = "background: linear-gradient(135deg, #fff 0%, #aaa 50%, #fff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255,255,255,0.6);";
    } else if (group === 'Secret' || item.release === 'secret') {
        text = "SECRET ERROR PRINT<br>MUTANT!";
        let gColor = '#ff00ff';
        if (item.type === 'red') gColor = '#ff3333';
        if (item.type === 'green') gColor = '#33ff33';
        if (item.type === 'blue') gColor = '#3388ff';
        style = `color: #fff; text-shadow: 2px 2px 0px ${gColor}, -2px -2px 0px ${gColor}; font-family: monospace; letter-spacing: -2px;`;
    } else if (group === 'RAMMs' || item.type === 'metallic') {
        text = "RARE ALIEN<br>METALLIC MUTANT!";
        style = "background: linear-gradient(135deg, #cd7f32 0%, #8b4513 50%, #cd7f32 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 4px rgba(0,0,0,0.5);";
    } else if (group === 'Mutants' || item.type === 'hybrid') {
        if (item.power >= 19) {
            text = "STRONG RARE<br>MUTANT!";
        } else {
            text = "RARE MUTANT!";
        }
        let c1 = item.c1 || 'gold';
        let c2 = item.c2 || 'gold';
        style = `background: linear-gradient(90deg, var(--${c1}), var(--${c2})); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));`;
    } else if (group === 'Weapons' && !isCard) { // Kun rigtige våben, ikke kort
        if (packType === 'war' || packType === 'battle') return;
        text = "EPIC WEAPON!";
        style = "color: var(--gold); text-shadow: 0 0 10px var(--gold); font-size: 3rem;";
        style = "color: var(--gold); text-shadow: 0 0 10px var(--gold);";
    } else if (group === 'Crystalites' || group === 'Shadows') {
        text = "POWER PLAYER!";
        style = "color: #00ffff; text-shadow: 0 0 15px #00ffff; font-size: 3rem;";
        style = "color: #00ffff; text-shadow: 0 0 15px #00ffff;";
    } else {
        return;
    }

    const html = `<div style="${style} line-height: 1.1;">${text}</div>`;
    showPackAnnouncement(html, duration);
}
