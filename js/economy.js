const workGifs = [
    'assets/click_gifs/samle_pant.gif',
    'assets/click_gifs/lufte_hunde.gif',
    'assets/click_gifs/slaa_graes.gif',
    'assets/click_gifs/vask_bilen.gif',
    'assets/click_gifs/gaa_ud_med_skraldespanden.gif',
    'assets/click_gifs/fej_indkoerslen.gif',
    'assets/click_gifs/tag_opvasken.gif'
];

let lastPassiveUpdate = 0;

setInterval(() => {
    if (!state.tasks) return;

    let autoPowerPerSec = 0;
    for (const taskId in state.tasks) {
        const taskInfo = taskData[taskId];
        if (!taskInfo) continue;

        const level = state.tasks[taskId].level;
        if (taskInfo.type === 'passive' && level > 0) {
            if (taskInfo.isUnlocked && !taskInfo.isUnlocked(state)) {
                continue;
            }
            // Cumulative power for passive tasks
            for (let i = 0; i < level; i++) {
                if (taskInfo.upgrades[i]) {
                    autoPowerPerSec += taskInfo.upgrades[i].power;
                }
            }
        }
    }

    if (autoPowerPerSec > 0) {
        const amount = (autoPowerPerSec / 10); // 100ms interval
        state.currency += amount; 
        state.stats.totalDust += amount;
        
        const now = Date.now();
        if (now - lastPassiveUpdate > 3000) {
            lastPassiveUpdate = now;
            const el = document.getElementById('ui-currency');
            if (el) {
                 const kr = Math.floor(state.currency);
                 const oreVal = Math.floor((state.currency - kr) * 4) * 25;
                 const ore = oreVal === 0 ? "00" : oreVal.toString();
                 el.innerHTML = `${kr} kr. ${ore} øre`;
            }
        }
    }
}, 100);

function manualWork(e) {
    let clickPower = 1; // Base click power
    if (state.tasks) {
        for (const taskId in taskData) {
            const taskInfo = taskData[taskId];
            if (!taskInfo || !state.tasks[taskId] || taskInfo.type !== 'manual') continue;

            const level = state.tasks[taskId].level;
            if (level > 0) {
                // Cumulative power for manual tasks
                for (let i = 0; i < level; i++) {
                    if (taskInfo.upgrades[i]) {
                        clickPower += taskInfo.upgrades[i].power;
                    }
                }
            }
        }
    }

    if (typeof AudioManager !== 'undefined') {
        AudioManager.sfx.play('ui', 'coin');
    }

    state.currency += clickPower;
    state.stats.totalClicks++;
    state.stats.totalDust += clickPower;
    save();

    // Opdater GIF (skifter hver 15. klik)
    const gifIndex = Math.floor(state.stats.totalClicks / 15) % workGifs.length;
    const gifEl = document.getElementById('work-gif');
    if(gifEl) {
        const nextGif = workGifs[gifIndex];
        if(!gifEl.src.endsWith(nextGif)) gifEl.src = nextGif;
    }

    if(e) {
        const btn = e.currentTarget;
        btn.style.transform = "scale(0.95)";
        setTimeout(() => btn.style.transform = "scale(1)", 100);
        const floatEl = document.createElement('div');
        floatEl.className = 'floating-text';
        floatEl.innerText = "+" + formatMoney(clickPower);
        floatEl.style.left = e.clientX + 'px';
        floatEl.style.top = e.clientY + 'px';
        document.body.appendChild(floatEl);
        setTimeout(() => floatEl.remove(), 600);
    }
}

function buyUpgrade(taskId) {
    if (!state.tasks) state.tasks = {};
    if (!state.tasks[taskId]) state.tasks[taskId] = { level: 0 };

    const task = taskData[taskId];
    if (!task) return;

    const currentLevel = state.tasks[taskId].level;
    const maxLevel = task.maxLevel || task.upgrades.length;

    if (currentLevel >= maxLevel) return;

    const upgrade = task.upgrades[currentLevel];
    if (state.currency >= upgrade.cost) {
        state.currency -= upgrade.cost;
        state.tasks[taskId].level++;
        save();

        if (typeof AudioManager !== 'undefined') {
            const rand = Math.random() < 0.5 ? '1' : '2';
            AudioManager.sfx.play('ui', `upgrade-bought${rand}`);
        }
    } else {
        showAlert('Du har ikke nok lommepenge til at købe denne opgradering.', 'Mangler Lommepenge');
    }
}