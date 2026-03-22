const levelZones = [
    { id: 1, name: "Hjemme", range: [1, 5], desc: "Spil mod lillesøster, lillebror og naboen", color: "#4CAF50", opponentImg: "assets/campaign/locations/home.gif" },
    { id: 2, name: "Skolegården", range: [6, 10], desc: "Spil mod klassekammerater og de store", color: "#2196F3", opponentImg: "assets/campaign/locations/school.gif" },
    { id: 3, name: "Rivalerne", range: [11, 15], desc: "Spil mod bøllerne fra den anden skole", color: "#FF9800", opponentImg: "assets/campaign/locations/rival_school.gif" },
    { id: 4, name: "Italien", range: [16, 20], desc: "Ferie! Spil mod de lokale mestre", color: "#F44336", opponentImg: "assets/campaign/locations/garda_italia.gif" }
];

function renderLevelSelector() {
    let html = `<div style="display:flex; flex-direction:column; gap:20px;">`;
    
    const currentMax = state.maxLevel || 1;

    levelZones.forEach(zone => {
        const start = zone.range[0];
        const end = zone.range[1];
        // Tjek om zonen er relevant (om vi er nået dertil, eller det er den næste)
        if (currentMax < start && currentMax < start - 1) return; 

        let btns = "";
        for(let i=start; i<=end; i++) {
            const locked = i > currentMax;
            const isBoss = (i === end);
            const bg = locked ? '#222' : (isBoss ? 'var(--red)' : '#333');
            const border = locked ? '#444' : (isBoss ? 'var(--gold)' : zone.color);
            const opacity = locked ? '0.5' : '1';
            const cursor = locked ? 'default' : 'pointer';
            
            btns += `
                <button onclick="selectLevel(${i})" style="
                    width:50px; height:50px; background:${bg}; border:2px solid ${border}; 
                    border-radius:10px; color:#fff; font-weight:bold; font-size:1.2rem; 
                    opacity:${opacity}; cursor:${cursor}; position:relative;
                ">
                    ${locked ? '🔒' : i}
                </button>
            `;
        }

        html += `
            <div style="background:var(--panel); border:1px solid #333; border-left:5px solid ${zone.color}; border-radius:10px; padding:20px; text-align:left; position: relative; overflow: hidden; min-height: 120px;">
                <!-- Background Image Layer -->
                <div style="position: absolute; top: 0; right: 0; bottom: 0; width: 50%; background-image: url('${zone.opponentImg}'); background-size: cover; background-position: center left; opacity: 0.6; -webkit-mask-image: linear-gradient(to right, transparent, black 40%); mask-image: linear-gradient(to right, transparent, black 40%); z-index: 1;"></div>
                
                <!-- Content Layer -->
                <div style="position: relative; z-index: 2; width: 60%;">
                    <h3 style="margin:0 0 5px 0; color:${zone.color}; text-transform:uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${zone.name} <span style="font-size:0.8rem; color:#ccc; margin-left:10px; text-shadow: none;">(Niveau ${start}-${end})</span></h3>
                    <p style="margin:0 0 15px 0; color:#ddd; font-size:0.9rem; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${zone.desc}</p>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap; position: relative; z-index: 2; margin-top: 10px;">
                    ${btns}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

function renderRules() {
    const showAdvanced = state.maxLevel >= 6 || (state.ownedWeapons && state.ownedWeapons.length > 0);
    
    const advancedRules = showAdvanced ? `
        <strong style="color:#fff;">🔫 Alien Våben:</strong>
        <ul style="color:#ccc; padding-left: 20px; margin-bottom: 15px;">
            <li style="margin-bottom:5px;">Våben kan aktiveres i kampen, hvis de deler farve med din valgte kæmper (RAMMs kan bruge alle våben).</li>
            <li>Almindelige farvede våben ganger din kæmpers Power med <strong>x2</strong>. <em>Neutralizeren</em> giver et massivt boost på <strong>+15 Power</strong>.</li>
        </ul>

        <strong style="color:#fff;">⚡ Crystalites (Power Players): Clear Power</strong>
        <ul style="color:#ccc; padding-left: 20px; margin-bottom: 15px;">
            <li>Hun træder ind i krigen efter et slag er kæmpet, og vasker al arts-dominans væk. Slaget kæmpes forfra udelukkende på Power!</li>
            <li style="font-style:italic; color:#aa5555; font-size:0.85rem;">* Bemærk: Reglerne for Power Players er endnu ikke implementeret i spillet.</li>
        </ul>

        <strong style="color:#fff;">🌑 Shadows (Power Players): Power Zap</strong>
        <ul style="color:#ccc; padding-left: 20px; margin-bottom: 0;">
            <li>Skyggen træder ind i krigen efter et tabt slag og fjerner al modstanderens Power. Arts-dominans tager over!</li>
            <li style="font-style:italic; color:#aa5555; font-size:0.85rem;">* Bemærk: Reglerne for Power Players er endnu ikke implementeret i spillet.</li>
        </ul>
    ` : `
        <div style="color:#666; font-style:italic; margin-top:10px;">
            🔒 Nå til Skolegården (Niveau 6) for at låse op for Alien Våben og Power Players!
        </div>
    `;

    return `
        <div style="background:var(--panel); padding:30px; border-radius:15px; border:1px solid #333; text-align:left; line-height:1.6; max-height: 550px; overflow-y: auto;">
            <h3 style="color:var(--blue); margin-top:0; text-align:center; letter-spacing:2px;">OFFICIELLE REGLER</h3>
            
            <h4 style="color:var(--gold); border-bottom: 1px solid #333; padding-bottom: 5px;">1. GRUNDLÆGGENDE SPIL</h4>
            <ul style="color:#ccc; padding-left: 20px;">
                <li style="margin-bottom:8px;">Vælg <strong>6 Aliens</strong> og <strong>1 Warlord</strong> (Mutant eller RAMM) til din hær.</li>
                <li style="margin-bottom:8px;">En kamp består af op til 7 runder – bedst af 4 vinder krigen!</li>
                <li style="margin-bottom:8px;">I hver runde vælger hver spiller hemmeligt en kæmper, som kastes i kamp samtidig.</li>
                <li style="margin-bottom:8px;">Kæmpernes <strong>Art (farve)</strong> afgør udfaldet. Hvis farverne matcher, kæmpes der på <strong>POWER</strong>.</li>
                <li style="margin-bottom:8px;">Ender en Power Duel uafgjort, går pointet videre til næste runde (Stake). Vinderen af næste slag tager begge point!</li>
                <li style="margin-bottom:8px;">Når en spiller når 4 point, kan modstanderen vælge at <strong>Give Op</strong> for at minimere sine tab.</li>
            </ul>

            <h4 style="color:var(--gold); border-bottom: 1px solid #333; padding-bottom: 5px; margin-top: 25px;">2. VEJEN TIL SEJR</h4>
            
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 25px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    <strong style="color:#fff;">Alien vs. Alien (Magtcirklen):</strong>
                    <ul style="color:#ccc; padding-left: 20px; list-style-type: none; margin-bottom: 0;">
                        <li>🔴 <strong>Dredrocks</strong> knuser 🟢 <strong>Gangreens</strong> med muskler.</li>
                        <li>🟢 <strong>Gangreens</strong> neutraliserer 🔵 <strong>Bluspews</strong> med slim.</li>
                        <li>🔵 <strong>Bluspews</strong> nedsmelter 🔴 <strong>Dredrocks</strong> med syre.</li>
                        <li style="margin-top:5px; font-style:italic;">* Kæmper to af samme farve mod hinanden, er det en Power Duel!</li>
                    </ul>
                </div>
                <div style="text-align:center; flex-shrink: 0;">
                    <img src="assets/img/3aliens.gif" alt="Magtcirklen" style="max-width: 180px; border-radius: 10px; filter: drop-shadow(0 0 15px rgba(255,255,255,0.1));">
                </div>
            </div>

            <strong style="color:#fff;">Mutant vs. Alien:</strong>
            <ul style="color:#ccc; padding-left: 20px;">
                <li style="margin-bottom:5px;">Mutanter slår alle Aliens, der <strong>ikke</strong> deler en af deres farver (f.eks. slår en Rød/Grøn Mutant altid en Blå Alien).</li>
                <li>Hvis Alienens farve matcher Mutantens, er det en <strong>Power Duel</strong>.</li>
            </ul>

            <strong style="color:#fff;">Mutant vs. Mutant:</strong>
            <ul style="color:#ccc; padding-left: 20px; margin-bottom: 15px;"><li>Mutanter kæmper altid på Power mod andre Mutanter.</li></ul>

            <strong style="color:#fff;">RAMMs vs. Aliens / Mutanter:</strong>
            <ul style="color:#ccc; padding-left: 20px; margin-bottom: 15px;"><li>RAMMs (Metallic) tilintetgør øjeblikkeligt alle normale Aliens og Mutanter uanset Power!</li></ul>

            <strong style="color:#fff;">RAMM vs. RAMM:</strong>
            <ul style="color:#ccc; padding-left: 20px; margin-bottom: 0;"><li>RAMMs kæmper på Power mod andre RAMMs. Højeste Power hersker!</li></ul>

            <h4 style="color:var(--gold); border-bottom: 1px solid #333; padding-bottom: 5px; margin-top: 25px;">3. EKSTRA UDSTYR (ADDED WARPLAY)</h4>
            ${advancedRules}
        </div>
    `;
}