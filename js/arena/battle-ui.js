function updateFigureElement(figure, item, isPlayer) {
    if (!figure || !item) return;
    figure.dataset.id = item.id;
    
    // Reset power text if it was modified by weapon boost
    const label = figure.querySelector('.figure-label');
    if (label) {
        label.innerHTML = `<span class="figure-name">${item.name}</span><div class="power-badge">${item.power}</div>`;
        label.style.background = "";
        label.style.color = "";
        label.style.borderColor = "";
        label.style.boxShadow = "";
        
        // Fjern glow fra det specifikke badge i fald det hang fast
        const badge = figure.querySelector('.power-badge');
        if(badge) { badge.style.background = ""; badge.style.color = ""; badge.style.boxShadow = ""; }
    }
}

function renderBattleField(revealingIndex = -1) {
    const enemyBench = document.getElementById('battle-enemy-bench');
    const enemyActive = document.getElementById('battle-enemy-active');
    const playerActive = document.getElementById('battle-player-active');
    const playerBench = document.getElementById('battle-player-bench');
    
    enemyBench.innerHTML = ""; 
    enemyActive.innerHTML = "";

    // Render Scoreboard Dots
    const dots = document.getElementById('battle-dots');
    if(dots) {
        dots.innerHTML = "";
        for(let i=0; i<7; i++) {
            let color = "#333";
            if(i < battleState.history.length) {
                if(battleState.history[i] === 1) color = "var(--green)"; 
                else if(battleState.history[i] === 2) color = "var(--red)"; 
                else color = "#888"; 
            } else if (i === battleState.round) color = "var(--gold)";
            dots.innerHTML += `<div style="width:10px; height:10px; border-radius:50%; background:${color}; border:1px solid #000;"></div>`;
        }
    }

    const colors = { 'red': '#cc0000', 'green': '#00aa00', 'blue': '#0055ff', 'hybrid': 'var(--gold)', 'metallic': '#c0c0c0' };

    let activePlayerIndex = (revealingIndex !== -1) ? battleState.playerMoves[battleState.round] : -1;
    if (battleState.phase === 'matchup' && activePlayerIndex === -1) {
        activePlayerIndex = battleState.playerMoves[battleState.round];
    }

    const animClasses = ['anim-fly-in', 'anim-fly-in-enemy', 'anim-clash-p', 'anim-clash-e', 'anim-clash-winner-p', 'anim-clash-winner-e', 'anim-clash-loser', 'anim-shake', 'anim-power-reveal'];

    const styleBattleFigure = (figure, item, index, isPlayer) => {
        // Reset styles applied via JS to avoid conflicts with new CSS

        const baseEl = figure.querySelector('.figure-base');

        const isPlayed = isPlayer ? battleState.playerMoves.includes(index) : index < battleState.round;
        const isActive = isPlayer ? (index === activePlayerIndex) : (index === battleState.round);

        figure.classList.remove(...animClasses);

        if (isPlayer) {
            figure.style.transform = ""; figure.style.opacity = ""; figure.style.filter = ""; figure.style.pointerEvents = ""; figure.style.margin = ""; figure.style.zIndex = ""; figure.style.position = "";
            if(baseEl) baseEl.style.boxShadow = ""; // Reset base shadow

            if (isActive) {
                figure.style.transform = "scale(2)"; figure.style.zIndex = 100; 
                if(baseEl) baseEl.style.boxShadow = "0 0 30px rgba(255,255,255,0.8)";
                figure.classList.add('anim-fly-in');
                
                // VISUALISER VÅBEN BOOST
                const label = figure.querySelector('.figure-label');
                if (label) {
                    const badge = figure.querySelector('.power-badge');
                    const baseP = item.power + (item.type === 'hybrid' ? 3 : 0);
                    let boostedP = baseP;
                    if (battleState.activeWeaponMultiplier > 1) {
                        boostedP = baseP * battleState.activeWeaponMultiplier;
                        if (badge) {
                            badge.innerText = boostedP;
                            badge.style.background = "radial-gradient(circle, var(--red), #800)"; badge.style.color = "#fff"; badge.style.boxShadow = "0 0 15px var(--gold)";
                        }
                    } else if (battleState.activeWeaponBonus > 0) {
                        boostedP = baseP + battleState.activeWeaponBonus;
                        if (badge) {
                            badge.innerText = boostedP;
                            badge.style.background = "radial-gradient(circle, var(--blue), #004)"; badge.style.color = "#fff"; badge.style.boxShadow = "0 0 15px var(--gold)";
                        }
                    }
                }
            } else if (isPlayed) {
            figure.style.filter = "grayscale(1) opacity(0.3)"; figure.style.transform = "scale(0.6)"; figure.style.pointerEvents = "none"; figure.style.marginRight = "-3cqw";
            } else {
                if (battleState.phase === 'ready') {
                figure.style.transform = ""; figure.style.marginRight = "0.5cqw"; figure.style.opacity = "1"; figure.style.pointerEvents = 'auto';
                } else {
                figure.style.transform = "scale(0.6)"; figure.style.marginRight = "-3cqw"; figure.style.opacity = "1"; figure.style.pointerEvents = 'none';
                }
            }
        } else {
            if(isPlayed && !isActive) {
            figure.style.filter = "grayscale(1) opacity(0.5)"; figure.style.transform = "scale(0.5)"; figure.style.pointerEvents = "none"; figure.style.margin = "-2cqw"; figure.style.opacity = "0.5";
            } else if(isActive) {
            figure.style.transform = "scale(2)"; figure.style.zIndex = 10;
                if(baseEl) baseEl.style.boxShadow = "0 0 30px rgba(255,255,255,0.8)";
            figure.classList.add('anim-fly-in-enemy'); figure.style.opacity = "1"; figure.style.margin = "0";
            } else {
            figure.style.transform = "scale(0.5)"; figure.style.margin = "-2cqw";
            }
        }
    };

    const benchFigures = [];

    for(let i=0; i<7; i++) {
        let pFigure = document.getElementById(`player-figure-${i}`);
        if (!pFigure) {
            pFigure = createFigureElement(arenaSquad[i], true);
            pFigure.id = `player-figure-${i}`;
            pFigure.classList.add('battle-bench-figure');
        }
        updateFigureElement(pFigure, arenaSquad[i], true);
        styleBattleFigure(pFigure, arenaSquad[i], i, true);
        
        if (i === activePlayerIndex) {
            if (pFigure.parentElement !== playerActive) playerActive.appendChild(pFigure);
            pFigure.style.order = "";
        } else {
            if (pFigure.parentElement !== playerBench) playerBench.appendChild(pFigure);
            pFigure.style.order = battleState.playerMoves.includes(i) ? 1 : 0;
            benchFigures.push({ figure: pFigure, isPlayed: battleState.playerMoves.includes(i), index: i });
        }

        const isGameOver = battleState.playerScore >= 4 || battleState.enemyScore >= 4 || battleState.round >= 7;

        if(!battleState.auto && !battleState.playerMoves.includes(i) && revealingIndex === -1 && battleState.phase !== 'matchup' && !isGameOver) {
            pFigure.style.cursor = "pointer";
            pFigure.classList.add('squad-figure-hover');
            
            pFigure.onclick = (e) => {
                // Tjek om vi er på en touch-enhed
                const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
                
                if (isTouch) {
                    if (pFigure.classList.contains('touch-selected')) {
                        // Andet tap (Bekræft): Send figuren i kamp
                        pFigure.classList.remove('touch-selected');
                        playNextRound(i);
                    } else {
                        // Første tap (Vælg): Pop figuren op og fjern valg fra andre
                        document.querySelectorAll('.touch-selected').forEach(f => f.classList.remove('touch-selected'));
                        pFigure.classList.add('touch-selected');
                    }
                } else {
                    // PC/Mus: Kæmp øjeblikkeligt ved første klik
                    playNextRound(i);
                }
            };
        } else {
            pFigure.classList.remove('squad-figure-hover', 'touch-selected');
            pFigure.onclick = null;
            if (!battleState.playerMoves.includes(i)) pFigure.style.cursor = "default";
        }

        const isActiveEnemy = (i === battleState.round);
        const showCard = (i < battleState.round) || (isActiveEnemy && battleState.phase !== 'ready');

        let fist = document.getElementById(`enemy-fist-${i}`);
        if (!fist) {
            fist = document.createElement('div');
            fist.id = `enemy-fist-${i}`;
            fist.classList.add('battle-bench-figure'); // Giver modstanderen bløde overgange
            fist.style.cssText = "width:clamp(40px, 11cqw, 110px); aspect-ratio:110/150; background:linear-gradient(#1a1a1a, #0a0a0a); border:2px solid #333; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; transform:scale(0.6); margin:-2cqw; box-shadow: inset 0 0 15px #000; flex-shrink:0;";
            fist.innerHTML = `<span style="font-size:clamp(1.5rem, 4cqw, 3rem); filter: drop-shadow(0 0 5px rgba(0,0,0,0.8));">✊</span>`;
        }
        fist.style.order = i; // Holder fast i rækkefølgen på bænken

        let eFigure = document.getElementById(`enemy-figure-${i}`);
        if (!eFigure) {
            eFigure = createFigureElement(enemySquad[i], true);
            eFigure.id = `enemy-figure-${i}`;
            eFigure.classList.add('battle-bench-figure'); // Giver modstanderen bløde overgange
        }
        eFigure.style.order = i; // Holder fast i rækkefølgen på bænken
        updateFigureElement(eFigure, enemySquad[i], false);

        if(!showCard) {
            if (eFigure.parentElement) eFigure.parentElement.removeChild(eFigure);
            if (isActiveEnemy) {
                fist.style.transform = "scale(1)";
                enemyActive.appendChild(fist);
            } else {
                fist.style.transform = "scale(0.6)";
                enemyBench.appendChild(fist);
            }
        } else {
            if (fist.parentElement) fist.parentElement.removeChild(fist);
            styleBattleFigure(eFigure, enemySquad[i], i, false);
            
            let hidePower = false;
            if (i === battleState.round && battleState.phase === 'matchup') {
                hidePower = true;
            } 
            else if (i <= battleState.round) {
                const pIndex = battleState.playerMoves[i];
                if (pIndex !== undefined && arenaSquad[pIndex]) {
                    if (!isPowerRelevant(arenaSquad[pIndex], enemySquad[i])) {
                        hidePower = true;
                    }
                }
            }

            const badge = eFigure.querySelector('.power-badge');
            if (badge) {
                if (hidePower) {
                    badge.innerText = "?";
                    badge.classList.add("hidden-power");
                } else {
                    badge.innerText = enemySquad[i].power + (enemySquad[i].type === 'hybrid' ? 3 : 0);
                    badge.classList.remove("hidden-power");
                }
            }
            
            if (isActiveEnemy) {
                enemyActive.appendChild(eFigure);
            } else {
                enemyBench.appendChild(eFigure);
            }
        }
    }

    benchFigures.sort((a, b) => {
        if (a.isPlayed !== b.isPlayed) return a.isPlayed ? 1 : -1;
        return a.index - b.index;
    });
    benchFigures.forEach(item => playerBench.appendChild(item.figure));

    const btnPP = document.getElementById('btn-use-pp');
    
    if(selectedPowerPlayerId) {
        btnPP.style.display = 'none'; // Midlertidigt skjult så den ikke ødelægger layoutet
        btnPP.disabled = battleState.ppUsed;
        if(battleState.ppUsed) btnPP.style.opacity = 0.5;
    }
}

function updateBattleControls() {
    // Hvis kampen er slut, afbryder vi her for ikke at slette vinder/taber-knapperne
    if (battleState.playerScore >= 4 || battleState.enemyScore >= 4 || battleState.round >= 7) return;

    const centerOverlay = document.getElementById('battle-center-overlay');
    const bottomControls = document.getElementById('battle-controls-area');
    const progContainer = document.getElementById('battle-progress-container');
    const vsText = document.getElementById('battle-vs-text');
    
    let weaponUsable = false;
    let weaponItem = null;
    let pIndex = -1;
    let currentAlien = null;

    if (battleState.phase === 'matchup') {
        pIndex = battleState.playerMoves[battleState.round];
        currentAlien = arenaSquad[pIndex];
        if (selectedWeaponId && !battleState.weaponUsed) {
            weaponItem = weaponData.find(w => w.id == selectedWeaponId);
            if (weaponItem && currentAlien) {
                 weaponUsable = (weaponItem.type === 'weapon') || 
                                (currentAlien.type === 'metallic') || 
                                (currentAlien.type === weaponItem.type) || 
                                (currentAlien.type === 'hybrid' && (currentAlien.c1 === weaponItem.type || currentAlien.c2 === weaponItem.type));
            }
        }
    }

    centerOverlay.innerHTML = "";
    centerOverlay.classList.remove('weapon-overlay-active', 'result-overlay-active');
    if (bottomControls) bottomControls.innerHTML = "";
    
    if(battleState.auto && (!weaponUsable || battleState.phase !== 'matchup')) {
        centerOverlay.style.display = 'none';
        progContainer.style.display = 'block';
        if(vsText) vsText.style.opacity = 0.3;
        return;
    }
    
    progContainer.style.display = 'none';

    if (battleState.phase === 'matchup' && weaponUsable && weaponItem) {
        centerOverlay.style.display = 'flex';
        centerOverlay.classList.add('weapon-overlay-active');
        if(vsText) vsText.style.opacity = 0;

             const typeColors = { 'red': 'var(--red)', 'green': 'var(--green)', 'blue': 'var(--blue)' };
             const btnColor = (weaponItem.type === 'weapon') ? 'var(--gold)' : (typeColors[weaponItem.type] || 'var(--gold)');
             const weaponColor = (weaponItem.type === 'weapon') ? 'var(--gold)' : (typeColors[weaponItem.type] || 'var(--gold)');

             const img = document.createElement('img');
             img.src = weaponItem.img;
             img.style.cssText = `width:120px; height:120px; object-fit:contain; margin-bottom:20px; filter: drop-shadow(0 0 15px ${weaponColor}); animation: pulse 2s infinite;`;
             centerOverlay.appendChild(img);

             const btnUse = document.createElement('button');
             btnUse.style.cssText = `background:${btnColor}; color:#000; border:none; padding:15px; border-radius:10px; font-weight:bold; font-size:1.2rem; cursor:pointer; width:100%; margin-bottom:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); position:relative; overflow:hidden;`;
             
             if (battleState.auto) {
                 btnUse.innerHTML = `<span style="z-index:2; position:relative; font-size:1.4rem;">AFFYRER VÅBEN...</span>
                                     <div style="position:absolute; bottom:0; left:0; height:100%; background:rgba(0, 255, 0, 0.4); width:0%; transition:width 1.5s linear; z-index:1;" id="auto-weapon-progress"></div>`;
                 btnUse.onclick = null;
                 btnUse.style.cursor = 'default';
                 centerOverlay.appendChild(btnUse);

                 setTimeout(() => {
                     const bar = document.getElementById('auto-weapon-progress');
                     if (bar) bar.style.width = '100%';
                 }, 50);
             } else {
                 btnUse.innerText = `BRUG ${weaponItem.name.toUpperCase()}`;
                 btnUse.onclick = activateWeapon;
                 centerOverlay.appendChild(btnUse);

                 const btnSkip = document.createElement('button');
                 btnSkip.style.cssText = "background:var(--blue); color:#fff; border:none; padding:15px; border-radius:10px; font-weight:bold; font-size:1.2rem; cursor:pointer; width:100%; margin-bottom:10px;";
                 btnSkip.innerText = "KÆMP VIDERE";
                 btnSkip.onclick = resolveRound;
                 centerOverlay.appendChild(btnSkip);
             }

    } else {
        centerOverlay.style.display = 'none';
        if(vsText) vsText.style.opacity = 0.3;
        document.getElementById('battle-message').innerText = "Vælg din kæmper!";
    }
}