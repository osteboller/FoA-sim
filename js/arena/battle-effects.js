function showAnnouncement(text, color, duration) {
    const announceEl = document.createElement('div');
    announceEl.id = "announcement-wrap";
    announceEl.className = "battle-announcement";
    if (color) announceEl.style.color = color;
    announceEl.innerHTML = text;
    document.getElementById('arena-battle').appendChild(announceEl);

    setTimeout(() => { announceEl.classList.add('show'); }, 50);
    setTimeout(() => {
        announceEl.classList.remove('show');
        announceEl.classList.add('hide');
        setTimeout(() => announceEl.remove(), 300);
    }, duration - 300);
    return announceEl;
}

function announceClash(winner, currentAlien, currentEnemy) {
    const getFighterStyle = (fighter) => {
        if (fighter.group === 'E-ramm') return { name: "JANGUTZ KHAN", cssClass: "fighter-style-eramm" };
        if (fighter.group === 'Sciroids') return { name: "SCIROID", cssClass: "fighter-style-sciroid" };
        if (fighter.group === 'RAMMs' || fighter.type === 'metallic') return { name: "RAMM", cssClass: "fighter-style-ramm" };
        if (fighter.type === 'hybrid') {
            const base = alienData.find(a => a.id === fighter.id);
            const c1 = (base && base.c1) ? base.c1 : fighter.c1;
            const c2 = (base && base.c2) ? base.c2 : fighter.c2;
            return { name: "MUTANT", cssClass: "fighter-style-mutant", inline: `background: linear-gradient(90deg, var(--${c1}), var(--${c2})); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: none;` };
        }
        const names = { 'red': 'DREDROCK', 'green': 'GANGREEN', 'blue': 'MUTOID' };
        const cssClasses = { 'red': 'fighter-style-red', 'green': 'fighter-style-green', 'blue': 'fighter-style-blue' };
        return { 
            name: names[fighter.type] || fighter.name.toUpperCase(), 
            cssClass: cssClasses[fighter.type] || 'fighter-style-default',
            dominationColorClass: cssClasses[fighter.type]
        };
    };

    const winObj = winner === 1 ? currentAlien : currentEnemy;
    const loseObj = winner === 1 ? currentEnemy : currentAlien;

    // 1. Integreret Audio Afspilning!
    if (typeof AudioManager !== 'undefined') {
        AudioManager.announcer.playCombat(winObj, loseObj);
    }

    const winStyle = getFighterStyle(winObj);
    const loseStyle = getFighterStyle(loseObj);
    
    const html = `
    <div class="clash-announcement-content">
      <span class="clash-fighter ${winStyle.cssClass}" style="${winStyle.inline || ''}">${winStyle.name}</span>
      <span class="clash-vs-text">slår</span>
      <span class="clash-fighter ${loseStyle.cssClass}" style="${loseStyle.inline || ''}">${loseStyle.name}</span>
    </div>`;
    
    showAnnouncement(html, null, 1500);

    setTimeout(() => {
        const announcementWrap = document.getElementById('announcement-wrap');
        if (!announcementWrap) return;
        const spans = Array.from(announcementWrap.querySelectorAll('span'));

        spans.forEach(s => {
            // Behold kun den nødvendige basistype og tilføj vinderens klasse
            const isVs = s.classList.contains('clash-vs-text');
            s.className = (isVs ? 'clash-vs-text' : 'clash-fighter') + ' domination-transition ' + winStyle.cssClass;
            
            // Ryd alle gamle inline-styles fra taberen
            s.style.cssText = '';
            
            // Hvis vinderen har dynamiske inline-styles (fx Mutant) tilføjes de
            if (winStyle.inline) {
                s.style.cssText = winStyle.inline;
            }
        });
    }, 600);
}

function showMatchResultOverlay(isWin, btnBuildCallback, btnCampaignCallback, btnRetryCallback, btnNextCallback) {
    const centerOverlay = document.getElementById('battle-center-overlay');
    centerOverlay.style.display = 'flex';
    centerOverlay.classList.add('result-overlay-active');
    centerOverlay.innerHTML = '';
    
    // 2. Integreret System Audio!
    if (typeof AudioManager !== 'undefined') {
        AudioManager.announcer.playSystem(isWin ? 'victory' : 'defeat');
    }

    const btnContainer = document.createElement('div');
    btnContainer.className = "result-btn-container";

    btnContainer.innerHTML = `
        <button class="result-btn btn-build">SAML HOLD</button>
        <button class="result-btn btn-retry">PRØV IGEN</button>
        <button class="result-btn btn-campaign">KAMPAGNE</button>
        ${isWin ? '<button class="result-btn btn-next">NÆSTE MODSTANDER</button>' : ''}
    `;

    const btns = btnContainer.querySelectorAll('button');
    btns[0].onclick = btnBuildCallback;
    btns[1].onclick = btnRetryCallback;
    btns[2].onclick = btnCampaignCallback;
    if(isWin) btns[3].onclick = btnNextCallback;

    centerOverlay.appendChild(btnContainer);
}