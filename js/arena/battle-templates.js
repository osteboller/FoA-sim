function renderBattleContainerHTML() {
    return `
        <div id="arena-battle" class="arena-battle-container" style="display:none;">
            <!-- NYT TOP PANEL (Modstander Portræt / Zone Farve) -->
            <div id="battle-zone-header" style="min-height: 70px; background: #222; border-radius: 15px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: bold; color: #fff; text-transform: uppercase; letter-spacing: 2px; box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.5);">
                KAMP KLARGØRES...
            </div>

            <!-- Top Bar -->
            <div class="battle-top-bar">
                <button id="btn-surrender" onclick="surrenderBattle()" class="btn-surrender">🏳️ GIV OP</button>
                
                <div class="battle-round-indicator">
                    <div class="battle-round-text-box">
                        RUNDE <span id="battle-round-text">1</span>/7
                    </div>
                    <div id="battle-dots" class="battle-dots-container"></div>
                </div>

                <div class="battle-auto-toggle">
                    <div id="battle-weapon-indicator" class="battle-weapon-indicator"></div>
                    <label class="auto-battle-label">
                        <input type="checkbox" id="chk-auto-battle" onchange="toggleAutoBattle()">
                        <span>AUTO</span>
                    </label>
                </div>
            </div>

            <!-- Battle Field -->
            <div class="battle-field">
                <div id="battle-enemy-bench" class="battle-enemy-bench"></div>
                <div id="battle-enemy-active" class="battle-enemy-active"></div>
                <div id="battle-player-active" class="battle-player-active"></div>
                <div id="battle-player-bench" class="battle-player-bench"></div>
                <div id="battle-vs-text" class="battle-vs-text">VS</div>
                <div id="battle-center-overlay" class="battle-center-overlay"></div>
            </div>

            <!-- Bottom Controls -->
            <div class="battle-bottom-wrapper">
                <!-- Actions (Left) -->
                <div id="battle-actions" class="battle-actions">
                    <button id="btn-use-pp" onclick="activatePowerPlayer()" class="battle-action-btn" style="display:none;">⚡ POWER PLAYER</button>
                </div>

                <!-- Center Log & Button -->
                <div class="battle-log-wrapper">
                     <div id="battle-message" class="battle-message"></div>
                     
                     <div id="battle-progress-container" class="battle-progress-container">
                        <div id="battle-progress-bar" class="battle-progress-bar"></div>
                     </div>

                     <div id="battle-controls-area"></div>
                     
                     <div id="battle-log" class="battle-log">
                        Klar til kamp...
                     </div>
                </div>
            </div>
        </div>
    `;
}