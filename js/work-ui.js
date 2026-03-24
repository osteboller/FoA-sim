function switchWorkTab(tab) {
    state.activeWorkTab = tab;
    renderWorkPage();
}

function initWorkPage() {
    const page = document.getElementById('page-work');
    if (!page || page.dataset.initialized) return;

    page.innerHTML = `
        <div class="page-content">
            <h2 class="page-title" style="color:var(--gold); text-transform:uppercase; letter-spacing:2px;">Tjen Penge</h2>

            <div class="stats-container">
                <div class="stat-box">
                    <div class="stat-label">KR. / KLIK</div>
                    <div id="ui-click-power" class="stat-value" style="color:var(--blue);">1.00</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">KR. / SEK</div>
                    <div id="ui-auto-power" class="stat-value" style="color:var(--green);">0.00</div>
                </div>
            </div>

            <div class="work-grid">
                <div class="work-grid-left">
                        <div style="color:#aaa; font-weight:bold; margin-bottom:10px; font-size:0.9rem; letter-spacing:1px; text-transform:uppercase;">Klik her for at tjene penge</div>
                    <button id="work-btn" onclick="manualWork(event)">
                        <img id="work-gif" src="assets/click_gifs/samle_pant.gif">
                    </button>
                    <div style="margin-top:15px; text-align:center;">
                        <button onclick="devUnlockAll()" style="background:transparent; border:1px solid #333; color:#444; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.7rem;">DEV: UNLOCK ALL</button>
                    </div>
                </div>
                <div class="work-grid-right">
                    <div class="work-tabs">
                        <button id="tab-manual" class="work-tab-btn" onclick="switchWorkTab('manual')">MANUELT ARBEJDE</button>
                        <button id="tab-passive" class="work-tab-btn" onclick="switchWorkTab('passive')">PASSIV INDKOMST</button>
                    </div>
                    <div id="work-tasks-container" class="work-tasks-grid"></div>
                </div>
            </div>
        </div>
    `;
    page.dataset.initialized = 'true';
    renderWorkPage();
}

function renderWorkPage() {
    if (!state.activeWorkTab) state.activeWorkTab = 'manual';

    const tabMan = document.getElementById('tab-manual');
    const tabPas = document.getElementById('tab-passive');
    if(tabMan) tabMan.className = state.activeWorkTab === 'manual' ? 'work-tab-btn active' : 'work-tab-btn';
    if(tabPas) tabPas.className = state.activeWorkTab === 'passive' ? 'work-tab-btn active' : 'work-tab-btn';

    const container = document.getElementById('work-tasks-container');
    if (!container) return;
    container.innerHTML = '';

    for (const taskId in taskData) {
        const task = taskData[taskId];
        if (!state.tasks[taskId]) state.tasks[taskId] = { level: 0 };
        const currentLevel = state.tasks[taskId].level;
        const maxLevel = task.maxLevel || task.upgrades.length;

        if (task.isUnlocked && !task.isUnlocked(state)) {
            continue; 
        }

        if (state.activeWorkTab === 'manual' && task.type !== 'manual') continue;
        if (state.activeWorkTab === 'passive' && task.type !== 'passive') continue;
        
        const isMaxed = currentLevel >= maxLevel;
        const upgrade = isMaxed ? task.upgrades[maxLevel - 1] : task.upgrades[currentLevel];
        const canAfford = state.currency >= upgrade.cost;
        
        let btnStyle = '';
        let btnClass = 'btn-upg';
        
        if (!isMaxed) {
            if (canAfford) {
                btnClass += ' can-afford';
            } else {
                const progress = (state.currency / upgrade.cost) * 100;
                btnStyle = `background: linear-gradient(90deg, #666 ${progress}%, #222 ${progress}%); color: #fff; border: 1px solid #444;`;
            }
        }

        const bonusText = isMaxed ? 'MAX Niveau' : `+${formatMoney(upgrade.power)} Kr./${task.type === 'manual' ? 'klik' : 'sek'}`;
        const nextUpgradeName = isMaxed ? "Alt opgraderet!" : upgrade.name;

        const taskHtml = `
            <div class="upgrade-card">
                <div class="card-header">
                    <span class="card-icon">${task.icon}</span>
                    <span class="card-name">${task.name}</span>
                </div>
                <div class="card-body">
                    <div class="card-level">Niveau ${currentLevel}</div>
                    <div style="font-size:0.85rem; color:#aaa; margin-bottom:5px;">${isMaxed ? '' : 'Næste: '}<span style="color:var(--gold);">${nextUpgradeName}</span></div>
                    <div class="card-bonus">${bonusText}</div>
                </div>
                <button class="${btnClass}" style="${btnStyle}" onclick="buyUpgrade('${taskId}')" ${isMaxed ? 'disabled' : ''}>
                    ${isMaxed ? 'MAX' : `Køb: ${formatMoney(upgrade.cost)} Kr.`}
                </button>
            </div>
        `;
        container.innerHTML += taskHtml;
    }
}