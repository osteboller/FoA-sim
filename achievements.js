function getAchievementProgress(ach) {
    let progress = 0;
    const type = ach.type;

    if (type === 'clicks') progress = state.stats.totalClicks || 0;
    else if (type === 'dust') progress = state.stats.totalDust || 0;
    else if (type === 'wins') progress = state.stats.totalWins || 0;
    else if (type === 'losses') progress = state.stats.totalLosses || 0;
    else if (type === 'collection') {
        const uniqueIds = new Set([...state.ownedAliens, ...state.ownedCrystalites, ...state.ownedWeapons].map(i => i.id));
        progress = uniqueIds.size;
    }
    else if (type === 'level') progress = state.maxLevel || 1;
    else if (type.startsWith('rarity_')) {
        const rarity = type.split('_')[1];
        const uniqueOwnedOfRarity = new Set();
        state.ownedAliens.forEach(owned => {
            const base = alienData.find(a => a.id === owned.id);
            const isSecretRelease = base ? (base.releases ? base.releases.includes('secret') : base.release === 'secret') : false;
            if (base && (base.rarity === rarity || (rarity === 'secret' && isSecretRelease))) {
                uniqueOwnedOfRarity.add(owned.id);
            }
        });
        progress = uniqueOwnedOfRarity.size;
    }
    else if (type.startsWith('group_')) {
        const group = type.split('_')[1];
        const uniqueOwnedOfGroup = new Set();
        state.ownedAliens.forEach(owned => {
            const base = alienData.find(a => a.id === owned.id);
            if (base) {
                const isSecretRelease = base.releases ? base.releases.includes('secret') : base.release === 'secret';
                if (group === 'Monos' && isSecretRelease) {
                    uniqueOwnedOfGroup.add(owned.id);
                } else if (base.group === group) {
                    uniqueOwnedOfGroup.add(owned.id);
                }
            }
        });
        progress = uniqueOwnedOfGroup.size;
    }
    else if (type.startsWith('upgrades_')) {
        if (!state.tasks) return 0;
        const subType = type.split('_')[1]; // 'total', 'manual', 'passive'
        let totalLevels = 0;
        for (const taskId in state.tasks) {
            const taskInfo = taskData[taskId];
            if (!taskInfo) continue;

            if (subType === 'total') {
                totalLevels += state.tasks[taskId].level;
            } else if (subType === 'manual' && taskInfo.type === 'manual') {
                totalLevels += state.tasks[taskId].level;
            } else if (subType === 'passive' && taskInfo.type === 'passive') {
                totalLevels += state.tasks[taskId].level;
            }
        }
        progress = totalLevels;
    }
    else if (type === 'max_power') {
        let count = 0;
        state.ownedAliens.forEach(owned => {
            const base = alienData.find(a => a.id === owned.id);
            let maxBasePower = -1;
            if (base && base.powerRanges && base.powerRanges[owned.release]) maxBasePower = base.powerRanges[owned.release][1];
            else if (base && base.powerRange) maxBasePower = base.powerRange[1];
            
            if (maxBasePower !== -1 && owned.power === maxBasePower) count++;
        });
        progress = count;
    }
    else if (type.startsWith('endless_')) {
        const lvl = parseInt(type.split('_')[1]); // F.eks. henter '5' ud af 'endless_5'
        if (state.maxEndlessStreaks && state.maxEndlessStreaks[lvl]) {
            progress = state.maxEndlessStreaks[lvl];
        } else {
            progress = 0;
        }
    }
    return progress;
}

function checkAchievements() {
    if (!state.notifiedAchievements) state.notifiedAchievements = [];
    let hasUnclaimed = false;

    achievementsData.forEach(ach => {
        const progress = getAchievementProgress(ach);

        if (progress >= ach.target) {
            // Tjek for notifikation
            if (!state.notifiedAchievements.includes(ach.id)) {
                showNotification(ach);
                state.notifiedAchievements.push(ach.id);
                save();
            }
            // Tjek for rød prik
            if (!state.claimedAchievements.includes(ach.id)) {
                hasUnclaimed = true;
            }
        }
    });

    const badge = document.getElementById('ach-badge');
    if (badge) badge.style.display = hasUnclaimed ? 'block' : 'none';
}

function showNotification(ach) {
    if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'message');

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div style="font-size:2rem;">🏆</div>
        <div>
            <div style="font-weight:bold; color:var(--gold); text-transform:uppercase; font-size:0.8rem;">Trofæ Låst Op!</div>
            <div style="font-size:1.1rem; font-weight:bold;">${ach.name}</div>
        </div>
    `;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Fjern igen
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 4000);
}

// Kør achievement check jævnligt
setInterval(checkAchievements, 2000);

function renderAchievements() {
    const page = document.getElementById('page-achievements');
    if(!page) return;

    // Udvidet for at inkludere alle trofæ-typer
    const categories = {
        'economy': { title: 'Økonomi & Slid', icon: '💰', types: ['clicks', 'dust', 'upgrades_total', 'upgrades_manual', 'upgrades_passive'] },
        'collection': { title: 'Mester Samler', icon: '📖', types: ['collection', 'rarity_rare', 'rarity_legendary', 'rarity_mythic', 'group_Bluspews', 'group_Dredrocks', 'group_Gangreens', 'group_RAMMs', 'group_Mutants', 'max_power'] },
        'arena': { title: 'Gladiator', icon: '⚔️', types: ['wins', 'level', 'losses', 'endless_5', 'endless_10', 'endless_15', 'endless_20', 'endless_25', 'endless_30', 'endless_35'] },
        'secrets': { title: 'Hemmeligheder', icon: '👻', types: ['rarity_secret', 'group_Monos'] }
    };

    if (!currentAchievementCategory) {
        // --- GRID VIEW (KATEGORIER) ---
        let gridHtml = `
            <div style="text-align:center; max-width:800px; margin:0 auto;">
                <h2 style="color:var(--gold); text-transform:uppercase; letter-spacing:2px;">TROFÆER</h2>
                <p style="color:#aaa; margin-bottom:30px;">Vælg en kategori for at se dine fremskridt.</p>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px;">
        `;

        for (const [key, cat] of Object.entries(categories)) {
            const catAch = achievementsData.filter(a => cat.types.includes(a.type));
            const total = catAch.length;
            
            // Beregn fremskridt
            let completedCount = 0;
            let hasUnclaimed = false;
            catAch.forEach(ach => {
                const progress = getAchievementProgress(ach);
                if (progress >= ach.target) {
                    completedCount++;
                    if (!state.claimedAchievements.includes(ach.id)) hasUnclaimed = true;
                }
            });

            const pct = total > 0 ? Math.floor((completedCount / total) * 100) : 0;
            const isAllDone = completedCount === total && total > 0;

            const badgeHtml = hasUnclaimed ? `<div style="position:absolute; top:-10px; right:-10px; background:var(--red); color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; box-shadow:0 0 15px var(--red); animation: pulse 2s infinite; z-index:10;">!</div>` : '';

            gridHtml += `
                <div onclick="currentAchievementCategory='${key}'; renderAchievements(); if(typeof updateAchievementSubmenuUI === 'function') updateAchievementSubmenuUI();" style="position:relative; background:var(--panel); border:1px solid ${isAllDone ? 'var(--gold)' : (hasUnclaimed ? 'var(--red)' : '#333')}; border-radius:15px; padding:20px; cursor:pointer; transition:transform 0.2s; box-shadow: ${hasUnclaimed ? '0 0 15px rgba(255,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.3)'};" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                    ${badgeHtml}
                    <div style="font-size:3rem; margin-bottom:10px;">${cat.icon}</div>
                    <h3 style="color:${isAllDone ? 'var(--gold)' : '#fff'}; margin:0 0 5px 0;">${cat.title}</h3>
                    <div style="color:#aaa; font-size:0.9rem; margin-bottom:15px;">${completedCount} / ${total} Opnået</div>
                    <div style="width:100%; height:8px; background:#222; border-radius:4px; overflow:hidden;">
                        <div style="width:${pct}%; height:100%; background:${isAllDone ? 'var(--gold)' : 'var(--blue)'};"></div>
                    </div>
                </div>
            `;
        }
        gridHtml += `</div></div>`;
        page.innerHTML = gridHtml;

    } else {
        // --- LIST VIEW (DETALJER) ---
        const cat = categories[currentAchievementCategory];
        const catAch = achievementsData.filter(a => cat.types.includes(a.type));

        let listHtml = `
            <div style="text-align:center; max-width:800px; margin:0 auto;">
                <div style="display:flex; align-items:center; justify-content:center; gap:15px; margin-bottom:20px;">
                    <button onclick="currentAchievementCategory=null; renderAchievements(); if(typeof updateAchievementSubmenuUI === 'function') updateAchievementSubmenuUI();" style="background:#333; border:none; color:#fff; width:40px; height:40px; border-radius:50%; cursor:pointer; font-weight:bold; font-size:1.2rem;">⬅</button>
                    <h2 style="color:var(--gold); text-transform:uppercase; letter-spacing:2px; margin:0;">${cat.icon} ${cat.title}</h2>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
        `;

        catAch.forEach(ach => {
            const isClaimed = state.claimedAchievements.includes(ach.id);
            const progress = getAchievementProgress(ach);
            let isCompleted = false;
            
            if (progress >= ach.target) isCompleted = true;
            
            let pct = Math.min(100, Math.floor((progress / ach.target) * 100));
            
            let btnHtml = '';
            if (isClaimed) {
                btnHtml = `<button disabled style="background:#333; color:#aaa; border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">MODTAGET</button>`;
            } else if (isCompleted) {
                btnHtml = `<button onclick="claimAchievement(event, '${ach.id}')" style="background:var(--green); color:#000; border:none; padding:10px 20px; border-radius:5px; font-weight:bold; cursor:pointer; animation:pulse 2s infinite;">HENT ${ach.reward} KR.</button>`;
            } else {
                btnHtml = `<div style="text-align:right; color:#666; font-size:0.8rem;">${Math.floor(progress)} / ${ach.target}</div>`;
            }

            listHtml += `
                <div style="background:var(--panel); border:1px solid ${isCompleted ? 'var(--gold)' : '#333'}; padding:15px; border-radius:10px; display:flex; align-items:center; justify-content:space-between; opacity:${isClaimed ? 0.6 : 1};">
                    <div style="text-align:left; flex-grow:1;">
                        <div style="font-weight:bold; color:${isCompleted ? 'var(--gold)' : '#fff'}; font-size:1.1rem;">${ach.name}</div>
                        <div style="color:#aaa; font-size:0.9rem; margin-bottom:5px;">${ach.desc}</div>
                        <div style="width:100%; max-width:300px; height:6px; background:#222; border-radius:3px; overflow:hidden;">
                            <div style="width:${pct}%; height:100%; background:${isCompleted ? 'var(--gold)' : 'var(--blue)'};"></div>
                        </div>
                    </div>
                    <div style="margin-left:20px;">${btnHtml}</div>
                </div>
            `;
        });

        listHtml += `</div></div>`;
        page.innerHTML = listHtml;
    }
}

function claimAchievement(event, id) {
    if(state.claimedAchievements.includes(id)) return;
    const ach = achievementsData.find(a => a.id === id);
    if(ach) {
        state.claimedAchievements.push(id);
        state.currency += ach.reward;
        save();
        renderAchievements();
        
        // Svævende tekst i stedet for popup
        const floatEl = document.createElement('div');
        floatEl.className = 'floating-reward';
        floatEl.innerHTML = `<span style="color:var(--gold); font-size:0.8rem; text-transform:uppercase;">Låst op!</span><br>+${ach.reward} Kr.`;
        
        if (event && event.clientX) {
            floatEl.style.left = event.clientX + 'px';
            floatEl.style.top = event.clientY + 'px';
        } else {
            floatEl.style.left = '50%'; floatEl.style.top = '50%';
        }
        document.body.appendChild(floatEl);
        setTimeout(() => floatEl.remove(), 1500);
        if (typeof AudioManager !== 'undefined') AudioManager.sfx.play('ui', 'trophy-claim');
    }
}