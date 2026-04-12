// --- ARENA STATE & CONTROLLER ---

let arenaSquad = [null, null, null, null, null, null, null];
let selectedGlobalPod = null;
let selectedWeaponId = null;
let selectedPowerPlayerId = null;
let enemySquad = [];
let battleState = { round: 0, playerScore: 0, enemyScore: 0, history: [], stake: 1, playerMoves: [], auto: false, weaponUsed: false, ppUsed: false, activeWeaponMultiplier: 1, activeWeaponBonus: 0, phase: 'ready' };
let arenaFilterType = 'all';
let arenaCategory = 'warriors';
let autoBattleTimer = null;
let autoWeaponTimer = null;
let currentArenaView = 'builder'; 
let selectedLevel = 1;
let isEndlessMode = false;

function initArena() {
    const arenaPage = document.getElementById('page-arena');
    
    let headerHTML = `
        <div id="arena-menu-container" style="text-align:center; max-width:900px; margin:0 auto;">
            <div class="top-panel-header" style="border-top: 2px solid var(--red); border-bottom: 2px solid var(--red);">
                <span style="color:var(--red);">ARENA</span>
            </div>
            <div style="display:flex; justify-content:center; align-items:center; margin-bottom:20px; flex-wrap: wrap; gap: 10px;">
                <button onclick="switchArenaView('builder')" class="filter-btn ${currentArenaView === 'builder' ? 'active' : ''}">BYG HOLD</button>
                <button onclick="switchArenaView('levels')" class="filter-btn ${currentArenaView === 'levels' ? 'active' : ''}">KAMPAGNE</button>
                <button onclick="switchArenaView('rules')" class="filter-btn ${currentArenaView === 'rules' ? 'active' : ''}">REGLER</button>
            </div>
    `;

    if (currentArenaView === 'rules') {
        headerHTML += renderRules();
    } else if (currentArenaView === 'levels') {
        headerHTML += renderLevelSelector();
    } else if (currentArenaView === 'builder') {
        headerHTML += renderBuilderHTML();
    }

    headerHTML += `</div>`;
    headerHTML += renderBattleContainerHTML();
    arenaPage.innerHTML = headerHTML;

    // Opdater sidemenuens undermenu-knapper
    document.querySelectorAll('.arena-sub-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderLeftColor = '#444';
        btn.style.color = '#888';
    });
    const activeSubBtn = document.getElementById('nav-arena-' + currentArenaView);
    if (activeSubBtn) {
        activeSubBtn.classList.add('active');
        activeSubBtn.style.borderLeftColor = 'var(--red)';
        activeSubBtn.style.color = '#fff';
    }

    if (typeof AudioManager !== 'undefined') AudioManager.bgm.play('draft-theme');

    if (currentArenaView === 'builder') {
        initBuilderLogic();
    }
}

function startBattle() {
    // Sikkerheds-tjek: Er holdet rent faktisk fyldt op?
    if (!arenaSquad.every(slot => slot !== null)) {
        showAlert("Dit hold er ikke komplet! Gå til 'BYG HOLD' og vælg 7 kæmpere, før du kan starte kampen.", "Mangler Krigere!");
        switchArenaView('builder');
        return;
    }

    const menu = document.getElementById('arena-menu-container');
    if(menu) menu.style.display = 'none';
    const arenaBattle = document.getElementById('arena-battle');
    arenaBattle.style.display = 'flex';
    arenaBattle.style.flexDirection = 'column';
    enemySquad = generateEnemy(selectedLevel);
    
    // Tving Safari til at genberegne layoutet, så den ikke fejler med mobil-CSS'en på første kamp
    void arenaBattle.offsetHeight;
    
    if (typeof AudioManager !== 'undefined') AudioManager.bgm.play('battle-theme');

    const isAuto = document.getElementById('chk-auto-battle').checked;
    battleState = { round: 0, playerScore: 0, enemyScore: 0, history: [], stake: 1, playerMoves: [], auto: isAuto, weaponUsed: false, ppUsed: false, activeWeaponMultiplier: 1, activeWeaponBonus: 0, phase: 'ready', aborted: false };
    
    // Opdater den nye Zone Header med farve og tekst
    const currentLvl = parseInt(selectedLevel) || 1;
    const zone = levelZones.find(z => currentLvl >= z.range[0] && currentLvl <= z.range[1]) || levelZones[levelZones.length - 1];
    const headerEl = document.getElementById('battle-zone-header');
    if (headerEl) {
        headerEl.style.background = `linear-gradient(90deg, #111 0%, ${zone.color} 50%, #111 100%)`;
        headerEl.style.borderTop = `2px solid ${zone.color}`;
        headerEl.style.borderBottom = `2px solid ${zone.color}`;
        const modeHeader = isEndlessMode ? "Endless Mode" : `Niveau ${selectedLevel}`;
        headerEl.innerHTML = `<span style="text-shadow: 0 2px 4px rgba(0,0,0,0.9);">${zone.name} - ${modeHeader}</span>`;
    }

    const modeText = isEndlessMode ? "Endless Modstander" : "Modstander";
    document.getElementById('battle-log').innerHTML = `<div>${modeText} fundet (Niveau ${selectedLevel}). Knyt næverne!</div>`;
    document.getElementById('battle-round-text').innerText = "1";
    
    const wInd = document.getElementById('battle-weapon-indicator');
    if (wInd) {
        if (selectedWeaponId) {
            const wItem = weaponData.find(w => w.id == selectedWeaponId);
            if (wItem) {
                wInd.style.display = 'block';
                wInd.innerHTML = `<img src="${wItem.img}" style="width:100%; height:100%; object-fit:contain; image-rendering:pixelated; filter: drop-shadow(0 0 5px var(--blue));">`;
                wInd.style.opacity = '1';
                wInd.title = wItem.name;
            }
        } else {
            wInd.style.display = 'none';
        }
    }

    // Vis "Giv Op" knappen igen
    const surrenderBtn = document.querySelector('.btn-surrender');
    if (surrenderBtn) surrenderBtn.style.visibility = 'visible';

    updateBattleControls();
    if(isAuto) startAutoBattleTimer();
    
    renderBattleField();
}

function toggleAutoBattle() {
    battleState.auto = document.getElementById('chk-auto-battle').checked;
    if(battleState.auto) {
        const pIndex = battleState.playerMoves[battleState.round];
        const currentAlien = arenaSquad[pIndex];
        let weaponUsable = false;
        if (battleState.phase === 'matchup' && selectedWeaponId && !battleState.weaponUsed) {
            const wItem = weaponData.find(w => w.id == selectedWeaponId);
            if (wItem && currentAlien) {
                 weaponUsable = (wItem.type === 'weapon') || (currentAlien.type === 'metallic') || (currentAlien.type === wItem.type) || (currentAlien.type === 'hybrid' && (currentAlien.c1 === wItem.type || currentAlien.c2 === wItem.type));
            }
        }
        if (battleState.phase === 'matchup' && weaponUsable) {
            if (!autoWeaponTimer) autoWeaponTimer = setTimeout(() => { if(!battleState.aborted) activateWeapon(); }, 1500);
        } else {
            startAutoBattleTimer();
        }
    } else {
        if(autoBattleTimer) clearInterval(autoBattleTimer);
        if(autoWeaponTimer) { clearTimeout(autoWeaponTimer); autoWeaponTimer = null; }
    }
    updateBattleControls();
}

function startAutoBattleTimer() {
    if(autoBattleTimer) clearInterval(autoBattleTimer);
    const bar = document.getElementById('battle-progress-bar');
    let width = 0;
    bar.style.width = '0%';
    
    autoBattleTimer = setInterval(() => {
        width += 1;
        bar.style.width = width + '%';
        if(width >= 100) {
            clearInterval(autoBattleTimer);
            playNextRound();
        }
    }, 10);
}

function activateWeapon() {
    if(autoWeaponTimer) { clearTimeout(autoWeaponTimer); autoWeaponTimer = null; }
    if(battleState.weaponUsed) { showAlert("Du har allerede brugt dit våben i denne kamp.", "Våben Brugt"); return; }
    if(battleState.phase !== 'matchup') { showAlert("Du kan kun bruge våben i 'Matchup' fasen, før runden afgøres.", "Forkert Timing"); return; }
    
    const pIndex = battleState.playerMoves[battleState.round];
    const currentAlien = arenaSquad[pIndex];
    const weapon = weaponData.find(w => w.id == selectedWeaponId);
    
    if(currentAlien && weapon) {
        const match = (weapon.type === 'weapon') || 
                      (currentAlien.type === 'metallic') || 
                      (currentAlien.type === weapon.type) || 
                      (currentAlien.type === 'hybrid' && (currentAlien.c1 === weapon.type || currentAlien.c2 === weapon.type));
        
        if(match) {
            if (typeof AudioManager !== 'undefined') {
                const fName = weapon.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                AudioManager.announcer.playEventRandom([`${fName}-1`, `${fName}-2`]);
            }

            let styleStr = "";
            if (weapon.type === 'red') styleStr = "color: var(--red); text-shadow: 0 0 20px var(--red);";
            else if (weapon.type === 'green') styleStr = "color: var(--green); text-shadow: 0 0 20px var(--green);";
            else if (weapon.type === 'blue') styleStr = "color: var(--blue); text-shadow: 0 0 20px var(--blue);";
            else styleStr = "background: linear-gradient(90deg, var(--red), var(--blue), var(--green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));";
            
            showAnnouncement(`<span style="font-size: 3.5rem; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 2px; ${styleStr}">${weapon.name}!</span>`, null, 2000);

            if (weapon.type === 'weapon') {
                battleState.activeWeaponBonus = 15;
                document.getElementById('battle-log').innerHTML = `<div style="color:var(--gold); font-weight:bold;">🔫 NEUTRALIZER! ${currentAlien.name} får +15 POWER!</div>` + document.getElementById('battle-log').innerHTML;
            } else {
                battleState.activeWeaponMultiplier = 2;
                document.getElementById('battle-log').innerHTML = `<div style="color:var(--gold); font-weight:bold;">🔫 VÅBEN AKTIVERET! ${currentAlien.name} får x2 POWER!</div>` + document.getElementById('battle-log').innerHTML;
            }

            battleState.weaponUsed = true;
            const wInd = document.getElementById('battle-weapon-indicator');
            if(wInd) wInd.style.opacity = '0.3';

            resolveRound(); 
        } else {
            showAlert("Dette våben er ikke kompatibelt med den valgte Alien og har ingen effekt.", "Våben Inkompatibelt");
        }
    }
}

function activatePowerPlayer() {
    if(battleState.ppUsed) { showAlert("Du har allerede brugt din Power Player i denne kamp.", "Power Player Brugt"); return; }
    if(battleState.phase !== 'matchup') { showAlert("Du kan kun bruge Power Player i 'Matchup' fasen!", "Forkert Timing"); return; }
    
    const pp = (typeof crystaliteData !== 'undefined' ? crystaliteData.find(p => p.id == selectedPowerPlayerId) : null) || 
               (typeof shadowData !== 'undefined' ? shadowData.find(p => p.id == selectedPowerPlayerId) : null);
               
    if (pp && typeof AudioManager !== 'undefined') {
        const fName = pp.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        AudioManager.announcer.playEventRandom([`${fName}-1`, `${fName}-2`]);
    }

    showAlert("Power Player aktiveret! Deres effekt vil blive implementeret i en fremtidig opdatering.", "Funktion Kommer Snart");
    battleState.ppUsed = true;
    renderBattleField();
}

function playNextRound(manualIndex = -1) {
    if(battleState.playerScore >= 4 || battleState.enemyScore >= 4 || battleState.round >= 7) return;
    if (battleState.phase === 'matchup') { resolveRound(); return; }

    let pIndex = manualIndex;
    if(pIndex === -1) { for(let i=0; i<7; i++) { if(!battleState.playerMoves.includes(i)) { pIndex = i; break; } } }
    if(pIndex === -1) return;

    battleState.playerMoves.push(pIndex);
    battleState.phase = 'matchup';
    
    if(autoBattleTimer) clearInterval(autoBattleTimer);
    
    // Afspil swush når figurerne flyver ind på brættet
    if (typeof AudioManager !== 'undefined') {
        AudioManager.sfx.playRandom('battle', 'swush', 6);
    }
    
    renderBattleField(); 

    setTimeout(() => {
        if(battleState.aborted) return;
        const pIndex = battleState.playerMoves[battleState.round];
        const pFigure = document.getElementById(`player-figure-${pIndex}`);
        const eFigure = document.getElementById('battle-enemy-active').firstElementChild;
        
        if(pFigure) { pFigure.classList.remove('anim-fly-in'); void pFigure.offsetWidth; pFigure.classList.add('anim-clash-p'); }
        if(eFigure) { eFigure.classList.remove('anim-fly-in-enemy'); void eFigure.offsetWidth; eFigure.classList.add('anim-clash-e'); }
        
        // Afspil hit-lyd præcis når de rammer hinanden i midten (150ms inde i den 400ms lange clash-animation)
        if (typeof AudioManager !== 'undefined') {
            setTimeout(() => { AudioManager.sfx.playRandom('battle', 'hit', 6); }, 150);
        }
    }, 500);

    setTimeout(() => {
        if(battleState.aborted) return;
        const currentAlien = arenaSquad[pIndex];
        const currentEnemy = enemySquad[battleState.round];
        const isPowerDuel = isPowerRelevant(currentAlien, currentEnemy);

        if (!isPowerDuel) {
            const winner = calculateWinner(currentAlien, currentEnemy);
            announceClash(winner, currentAlien, currentEnemy);

            const pFigure = document.getElementById(`player-figure-${pIndex}`);
            const eFigure = document.getElementById('battle-enemy-active').firstElementChild;
            if (winner === 1) {
                if(pFigure) { pFigure.classList.remove('anim-fly-in', 'anim-clash-p'); void pFigure.offsetWidth; pFigure.classList.add('anim-clash-winner-p'); }
                if(eFigure) { eFigure.classList.remove('anim-fly-in-enemy', 'anim-clash-e'); void eFigure.offsetWidth; eFigure.classList.add('anim-clash-loser'); }
            } else {
                if(pFigure) { pFigure.classList.remove('anim-fly-in', 'anim-clash-p'); void pFigure.offsetWidth; pFigure.classList.add('anim-clash-loser'); }
                if(eFigure) { eFigure.classList.remove('anim-fly-in-enemy', 'anim-clash-e'); void eFigure.offsetWidth; eFigure.classList.add('anim-clash-winner-e'); }
            }

            setTimeout(() => { if(!battleState.aborted) _finalizeRound(winner, currentAlien, currentEnemy); }, 1600);
        } else {
            if (typeof AudioManager !== 'undefined') {
                AudioManager.announcer.playEventRandom(['power-duel-1', 'power-duel-2', 'power-duel-3']); // Ret evt. filnavnene her
            }
            showAnnouncement("<span style='color:var(--gold); text-shadow: 0 0 20px var(--gold);'>POWER DUEL!</span>", null, 1500);
            
            const pFigure = document.getElementById(`player-figure-${pIndex}`);
            const eFigure = document.getElementById('battle-enemy-active').firstElementChild;
            if(pFigure) { pFigure.classList.remove('anim-fly-in'); void pFigure.offsetWidth; pFigure.classList.add('anim-shake'); }
            if(eFigure) { eFigure.classList.remove('anim-fly-in-enemy'); void eFigure.offsetWidth; eFigure.classList.add('anim-shake'); }
            
            // Tjek om våben kan bruges, så vi ikke auto-afgør, hvis spilleren kan interagere
            const currentAlien = arenaSquad[pIndex];
            let weaponUsable = false;
            if (selectedWeaponId && !battleState.weaponUsed) {
                const weaponItem = weaponData.find(w => w.id == selectedWeaponId);
                if (weaponItem && currentAlien) {
                     weaponUsable = (weaponItem.type === 'weapon') || 
                                    (currentAlien.type === 'metallic') || 
                                    (currentAlien.type === weaponItem.type) || 
                                    (currentAlien.type === 'hybrid' && (currentAlien.c1 === weaponItem.type || currentAlien.c2 === weaponItem.type));
                }
            }
            
            if (weaponUsable) { 
                setTimeout(() => { 
                    if(!battleState.aborted) {
                        updateBattleControls(); 
                        if (battleState.auto) {
                            autoWeaponTimer = setTimeout(() => { if(!battleState.aborted) activateWeapon(); }, 1500);
                        }
                    }
                }, 1600); 
            } 
            else { setTimeout(() => { if(!battleState.aborted) resolveRound(); }, 1600); }
        }
    }, 1000);
}

function resolveRound() {
    if(autoWeaponTimer) { clearTimeout(autoWeaponTimer); autoWeaponTimer = null; }
    battleState.phase = 'resolution';
    
    const centerOverlay = document.getElementById('battle-center-overlay');
    if(centerOverlay) {
        centerOverlay.style.display = 'none';
        centerOverlay.classList.remove('weapon-overlay-active');
    }
    const vsText = document.getElementById('battle-vs-text');
    if(vsText) vsText.style.opacity = 1;
    
    renderBattleField(battleState.round);

    // Fjern fly-in animationen med det samme, så den ikke genstarter
    const pIndexFix = battleState.playerMoves[battleState.round];
    const pFigFix = document.getElementById(`player-figure-${pIndexFix}`);
    if(pFigFix) pFigFix.classList.remove('anim-fly-in');
    const eFigFix = document.getElementById('battle-enemy-active').firstElementChild;
    if(eFigFix) eFigFix.classList.remove('anim-fly-in-enemy');

    const pIndex = battleState.playerMoves[battleState.round];
    const pFig = arenaSquad[pIndex];
    const eFig = enemySquad[battleState.round];
    const isPowerDuel = isPowerRelevant(pFig, eFig);

    if (isPowerDuel) {
        const eFigure = document.getElementById('battle-enemy-active').firstElementChild;
        if(eFigure) {
            const badge = eFigure.querySelector('.power-badge');
            if(badge) {
                badge.innerText = eFig.power + (eFig.type === 'hybrid' ? 3 : 0);
                badge.classList.remove('hidden-power');
                badge.classList.add('anim-power-reveal');
            }
        }
    }

    const delayBeforeResult = isPowerDuel ? 1000 : 100;

    setTimeout(() => {
        if(battleState.aborted) return;
        const winner = calculateWinner(pFig, eFig);
        const pIndex = battleState.playerMoves[battleState.round];
        const pFigure = document.getElementById(`player-figure-${pIndex}`);
        const eFigure = document.getElementById('battle-enemy-active').firstElementChild;

        if (winner === 1) {
            if (pFigure) { pFigure.classList.remove('anim-fly-in', 'anim-clash-p'); void pFigure.offsetWidth; pFigure.classList.add('anim-clash-winner-p'); }
            if (eFigure) { eFigure.classList.remove('anim-fly-in-enemy', 'anim-clash-e'); void eFigure.offsetWidth; eFigure.classList.add('anim-clash-loser'); }
        } else if (winner === 2) {
            if (pFigure) { pFigure.classList.remove('anim-fly-in', 'anim-clash-p'); void pFigure.offsetWidth; pFigure.classList.add('anim-clash-loser'); }
            if (eFigure) { eFigure.classList.remove('anim-fly-in-enemy', 'anim-clash-e'); void eFigure.offsetWidth; eFigure.classList.add('anim-clash-winner-e'); }
        } else {
            if (pFigure) { pFigure.classList.remove('anim-fly-in', 'anim-clash-p'); void pFigure.offsetWidth; pFigure.classList.add('anim-shake'); }
            if (eFigure) { eFigure.classList.remove('anim-fly-in-enemy', 'anim-clash-e'); void eFigure.offsetWidth; eFigure.classList.add('anim-shake'); }
            showAnnouncement("<span style='color:#aaa; text-shadow:0 0 20px #fff;'>UAFGJORT</span>", null, 2000);
            if (typeof AudioManager !== 'undefined') {
                AudioManager.announcer.playEventRandom(['draw-1', 'draw-2']);
            }
        }

        setTimeout(() => { if(!battleState.aborted) _finalizeRound(winner, pFig, eFig); }, 1200);
    }, delayBeforeResult);
}

function _finalizeRound(winner, pFig, eFig) {
    battleState.history.push(winner);

    let pPower = pFig.power + (pFig.type === 'hybrid' ? 3 : 0);
    if(battleState.activeWeaponMultiplier > 1) pPower *= battleState.activeWeaponMultiplier;
    let ePower = eFig.power + (eFig.type === 'hybrid' ? 3 : 0);

    let ePowerText = isPowerRelevant(pFig, eFig) ? ePower : "???";
    let logMsg = `<div><strong>Runde ${battleState.round + 1}:</strong> Din ${pFig.name} (P:${pPower}) mod ${eFig.name} (P:${ePowerText}).<br>`;
    
    if(winner === 1) { 
        battleState.playerScore += battleState.stake; 
        logMsg += `<span style="color:var(--green); font-weight:bold;">Du vandt ${battleState.stake > 1 ? battleState.stake + ' point!' : 'runden!'}</span></div>`; 
        battleState.stake = 1; 
    }
    else if(winner === 2) { 
        battleState.enemyScore += battleState.stake; 
        logMsg += `<span style="color:var(--red); font-weight:bold;">Fjenden vandt ${battleState.stake > 1 ? battleState.stake + ' point!' : 'runden!'}</span></div>`; 
        battleState.stake = 1; 
    }
    else { 
        battleState.stake++; 
        logMsg += `<span style="color:#aaa; font-style:italic;">Uafgjort! Næste runde gælder nu for ${battleState.stake} point!</span></div>`; 
    }

    const logEl = document.getElementById('battle-log');
    logEl.innerHTML = logMsg + "<div style='margin-top:8px; padding-top:8px; border-top:1px solid #333; opacity:0.6;'>" + logEl.innerHTML + "</div>";
    
    battleState.round++;
    document.getElementById('battle-round-text').innerText = Math.min(battleState.round + 1, 7);
    battleState.activeWeaponMultiplier = 1;
    battleState.activeWeaponBonus = 0;
    battleState.phase = 'ready';
    document.getElementById('battle-message').innerText = "";

    renderBattleField();

    if(battleState.playerScore >= 4 || battleState.enemyScore >= 4 || battleState.round >= 7) {
        if (battleState.enemyScore > battleState.playerScore) {
            if (typeof AudioManager !== 'undefined') AudioManager.bgm.play('defeat', false);
        }
        setTimeout(() => { if(!battleState.aborted) endMatch(); }, 1000); // Vent 1 sekund så announcer kan tale færdig
    } else {
        updateBattleControls();
        if(battleState.auto) startAutoBattleTimer();
    }
}

function endMatch() {
    const bottomControls = document.getElementById('battle-controls-area');
    let logMsg = `<div><strong>KAMPEN ER SLUT! Score: ${battleState.playerScore} - ${battleState.enemyScore}</strong><br>`;
    const isWin = battleState.playerScore > battleState.enemyScore;
    
    if(isWin) { 
        const modeText = isEndlessMode ? "ENDLESS KAMPEN" : `ARENA NIVEAU ${selectedLevel}`;
        logMsg += `<span style="color:var(--gold)">DU VANDT ${modeText}! Belønning: +500 Kr.</span></div>`;
        state.currency += 500; 
        state.stats.totalWins++; 
        
        if (isEndlessMode) {
            if (!state.currentEndlessStreaks) state.currentEndlessStreaks = {};
            if (!state.maxEndlessStreaks) state.maxEndlessStreaks = {};
            
            state.currentEndlessStreaks[selectedLevel] = (state.currentEndlessStreaks[selectedLevel] || 0) + 1;
            const currentStreak = state.currentEndlessStreaks[selectedLevel];
            
            if (!state.maxEndlessStreaks[selectedLevel] || currentStreak > state.maxEndlessStreaks[selectedLevel]) {
                state.maxEndlessStreaks[selectedLevel] = currentStreak;
            }
            logMsg += `<div style="color:var(--blue); font-weight:bold; font-size:0.95rem; margin-top:5px;">🔥 Endless Streak: ${currentStreak} vundet i træk!</div>`;
        }

        if (!isEndlessMode && selectedLevel === (state.maxLevel || 1)) {
            state.maxLevel = (state.maxLevel || 1) + 1;
            state.arenaLevel = state.maxLevel;
            logMsg += `<div style="color:var(--green); font-weight:bold; margin-top:5px;">NYT NIVEAU LÅST OP!</div>`;
            
            if (state.maxLevel === 6) {
                setTimeout(() => showAlert("Du har nået Skolegården! En ny pakke er nu tilgængelig i Shoppen.", "Ny Pakke Låst Op!"), 2000);
            }
            if (state.maxLevel === 11) {
                setTimeout(() => showAlert("Du har nået SFO Overnatning! Elite Collector Club er nu åben for dig i toppen af shoppen.", "Ny Funktion Låst Op!"), 2000);
            }
            if (state.maxLevel === 16) {
                setTimeout(() => showAlert("Du har nået Rivalerne! Generation 2 Aliens kan nu findes i pakker, og 'SciRoid BattleShip' er låst op i Shoppen.", "Generation 2 Låst Op!"), 2000);
            }
            if (state.maxLevel === 21) {
                setTimeout(() => showAlert("Benvenuto in Italia! Den Italienske Blister pakke er nu tilgængelig i Shoppen, og 'The Vault' har åbnet i Elite-klubben.", "Nye Pakker Låst Op!"), 2000);
            }
            if (state.maxLevel === 26) {
                setTimeout(() => showAlert("Velkommen til DK Mesterskabet! Den MEGA RARE pakke med Special Edition RAMMs er nu låst op i Elite Collector Club.", "Ny Elite Pakke!"), 2000);
            }
            if (state.maxLevel === 31) {
                setTimeout(() => showAlert("Konnichiwa! Den Japanske Blister pakke er nu tilgængelig i Shoppen, og Jangutz Khan kan købes i Elite-klubben!", "Nye Pakker Låst Op!"), 2000);
            }
        }
        showAnnouncement("<span style='color:var(--green); text-shadow:0 0 20px var(--green);'>DU VANDT!</span>", null, 3000);
    }
    else if (battleState.enemyScore > battleState.playerScore) { 
        logMsg += `<span style="color:var(--red)">Du tabte. Prøv igen med en anden taktik!</span></div>`;
        state.stats.totalLosses = (state.stats.totalLosses || 0) + 1; 
        
        if (isEndlessMode) {
            if (state.currentEndlessStreaks && state.currentEndlessStreaks[selectedLevel] > 0) {
                 logMsg += `<div style="color:#aaa; font-size:0.9rem; margin-top:5px;">Din streak på ${state.currentEndlessStreaks[selectedLevel]} blev brudt!</div>`;
            }
            if (!state.currentEndlessStreaks) state.currentEndlessStreaks = {};
            state.currentEndlessStreaks[selectedLevel] = 0;
        }
        showAnnouncement("<span style='color:var(--red); text-shadow:0 0 20px var(--red);'>DU TABTE</span>", null, 3000);
    } else {
        logMsg += `<span style="color:#aaa">Kampen endte Uafgjort! Ingen vinder.</span></div>`;
        showAnnouncement("<span style='color:#aaa; text-shadow:0 0 20px #fff;'>UAFGJORT</span>", null, 3000);
    }

    const logEl = document.getElementById('battle-log');
    if(autoBattleTimer) clearInterval(autoBattleTimer);
    document.getElementById('battle-progress-container').style.display = 'none';
    
    logEl.innerHTML = logMsg + "<div style='margin-top:8px; padding-top:8px; border-top:1px solid #333; opacity:0.6;'>" + logEl.innerHTML + "</div>";
    if (bottomControls) bottomControls.innerHTML = "";

    // Skjul "Giv Op" knappen når kampen er slut
    const surrenderBtn = document.querySelector('.btn-surrender');
    if (surrenderBtn) surrenderBtn.style.visibility = 'hidden';

    const outcome = isWin ? 'win' : (battleState.enemyScore > battleState.playerScore ? 'lose' : 'draw');

    showMatchResultOverlay(
        outcome,
        () => { isEndlessMode = false; currentArenaView = 'builder'; initArena(); save(); },
        () => { isEndlessMode = false; currentArenaView = 'levels'; initArena(); save(); },
        () => { startBattle(); },
        () => { 
            if (isEndlessMode) startBattle(); 
            else selectLevel(selectedLevel + 1); 
        }
    );
}

function surrenderBattle() {
    showConfirm(
        "Er du sikker på, at du vil give op? Dette vil tælle som et nederlag.", 
        "Giv Op?", 
        () => {
            battleState.aborted = true;
            if (isEndlessMode) {
                if (!state.currentEndlessStreaks) state.currentEndlessStreaks = {};
                state.currentEndlessStreaks[selectedLevel] = 0;
            }
            isEndlessMode = false;
            if(autoBattleTimer) clearInterval(autoBattleTimer);
            if(autoWeaponTimer) { clearTimeout(autoWeaponTimer); autoWeaponTimer = null; }
            currentArenaView = 'builder';
            state.stats.totalLosses = (state.stats.totalLosses || 0) + 1;
            save();
            initArena();
        });
}

function switchArenaView(view) { 
    currentArenaView = view; 
    initArena(); 
    
    // Luk sidemenuen på mobil, når der navigeres via sidemenuen
    const nav = document.querySelector('nav');
    if (nav && nav.classList.contains('open') && typeof toggleNav === 'function') {
        toggleNav();
    }
}

function selectLevel(lvl) {
    if (lvl > (state.maxLevel || 1)) return;
    isEndlessMode = false;
    selectedLevel = lvl;
    startBattle();
}

function startEndlessMode(lvl) {
    isEndlessMode = true;
    selectedLevel = lvl;
    startBattle();
}