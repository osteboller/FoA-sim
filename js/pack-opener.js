// --- PACK OPENER & ANIMATIONS ---

// Helper for async delays
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function tiltPack(e) {
    const btn = e.currentTarget;
    const img = btn.querySelector('.pack-img');
    if(!img) return;
    
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    
    const rotX = -((y - cy) / cy) * 15; 
    const rotY = ((x - cx) / cx) * 15;
    
    const baseScale = parseFloat(img.dataset.scale || 1);
    img.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${baseScale * 1.05})`;
}

function resetTilt(e) {
    const img = e.currentTarget.querySelector('.pack-img');
    if(img) {
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
    document.body.style.overflow = 'hidden'; // Lås baggrundens scrollbar fast
    container.innerHTML = "";

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
        
        blisterWrapper.appendChild(blisterImg);

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

        let el;
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
        itemElements.push({ el, item, displayType, element: renderedItemEl });
    };

    // 2. RENDERING AF SPECIALS (Øverste række - Store bokse)
    for (const item of majors) {
        processItem(item, centerStage, true);
    }
    
    // 2.5 RENDERING AF MINORS (Side items på vingerne)
    // Våben til venstre, Kort til højre (PPs også til venstre)
    minors.forEach((item) => {
        const isCard = (typeof cardData !== 'undefined' && cardData.some(c => c.id === item.id));
        const group = item.group;
        
        if (isCard) processItem(item, rightWing, false);
        else if (group === 'Weapons' || group === 'Crystalites' || group === 'Shadows') processItem(item, leftWing, false);
        else processItem(item, rightWing, false);
    });

    // 3. RENDERING AF STANDARDS (Nederste række - Normal størrelse)
    for (const item of standards) {
        processItem(item, standardRow, false);
    }

    // Tilføj rækkerne til containeren (hvis de har indhold)
    if (majors.length > 0 || minors.length > 0) {
        if (majors.length > 0) topRow.style.marginBottom = "8cqh"; // Skubber nederste række ned, så de ikke overlapper
        scene.appendChild(topRow);
    }
    if (standards.length > 0) scene.appendChild(standardRow);

    // 3. AUTOMATISK REVEAL SEKVENS (Sorteret så specials kommer sidst)
    const revealSequence = [
        ...itemElements.filter(x => !isSpecial(x.item)),
        ...itemElements.filter(x => isSpecial(x.item) && !isMajorSpecial(x.item)), // Minors før majors
        ...itemElements.filter(x => isMajorSpecial(x.item))
    ];

    await wait(500); // Start pause

    for (const { el, item, displayType, element } of revealSequence) {
        
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
    const container = document.getElementById('shop-batch');
    if (!container) return;

    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'opener-btn-wrapper';

    // "Køb igen" button
    const buyAgainBtn = document.createElement('button');
    buyAgainBtn.innerText = "KØB IGEN";
    buyAgainBtn.className = 'btn-buy-again';
    buyAgainBtn.onclick = () => {
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
    okBtn.onclick = resetShopState; // Defined in shop.js

    btnWrapper.appendChild(okBtn);
    btnWrapper.appendChild(buyAgainBtn);
    (sceneContainer || container).appendChild(btnWrapper);
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
    }

    const imgFilter = base && base.cssFilter ? base.cssFilter : 'none';
    const overlay = document.getElementById('revealOverlay');
    overlay.style.display = 'flex';
    
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
    } else if (group === 'Sciroids') {
        text = "LEGENDARY DROP!<br>SCIROID";
        style = "background: linear-gradient(135deg, #fff 0%, #aaa 50%, #fff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255,255,255,0.6); font-size: 3.5rem;";
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
    } else if (group === 'Crystalites' || group === 'Shadows') {
        text = "POWER PLAYER!";
        style = "color: #00ffff; text-shadow: 0 0 15px #00ffff; font-size: 3rem;";
    } else {
        return;
    }

    const html = `<div style="${style} line-height: 1.1;">${text}</div>`;
    showPackAnnouncement(html, duration);
}
