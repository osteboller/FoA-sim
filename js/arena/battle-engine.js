function isPowerRelevant(f1, f2) {
    const isSciroid1 = f1.group === 'Sciroids' || f1.id === 63 || f1.id === 64;
    const isSciroid2 = f2.group === 'Sciroids' || f2.id === 63 || f2.id === 64;
    
    if (isSciroid1 || isSciroid2) {
        return isSciroid1 && isSciroid2; // Kun power duel hvis begge er Sciroids
    }

    if (f1.type === 'metallic' && f2.type !== 'metallic') return false;
    if (f2.type === 'metallic' && f1.type !== 'metallic') return false;
    
    if (f1.type === 'hybrid' && f2.type !== 'hybrid') {
        if (f1.c1 !== f2.type && f1.c2 !== f2.type) return false;
        return true;
    }
    if (f2.type === 'hybrid' && f1.type !== 'hybrid') {
        if (f2.c1 !== f1.type && f2.c2 !== f1.type) return false;
        return true;
    }
    
    if (f1.type === f2.type) return true;
    return false;
}

function calculateWinner(f1, f2) {
    // Apply weapon bonuses before calculation
    let p1 = (f1.power + (f1.type === 'hybrid' ? 3 : 0)) * battleState.activeWeaponMultiplier + battleState.activeWeaponBonus;
    
    if(battleState.activeWeaponMultiplier > 1) {
        document.getElementById('battle-message').innerText = `VÅBEN AKTIVERET: DOBBELT POWER!`;
    } else if (battleState.activeWeaponBonus > 0) {
        document.getElementById('battle-message').innerText = `NEUTRALIZER AKTIVERET: +15 POWER!`;
    }

    let p2 = f2.power + (f2.type === 'hybrid' ? 3 : 0);

    // E-ramm (Jangutz Khan) Logic
    const isSciroid = (f) => f.group === 'Sciroids' || f.id === 63 || f.id === 64;
    const isSciroid1 = isSciroid(f1);
    const isSciroid2 = isSciroid(f2);
    
    // SciRoids Logic (Slår alt undtagen Jangutz og sig selv)
    if (isSciroid1) {
        if (f2.group === 'E-ramm') return 0; // Draw vs Jangutz
        if (!isSciroid2) return 1; // Win vs others
    }
    if (isSciroid2) {
        if (f1.group === 'E-ramm') return 0; // Draw vs Jangutz
        if (!isSciroid1) return 2; // Win vs others
    }

    // Jangutz Logic (Wins against everything remaining)
    if (f1.group === 'E-ramm') return 1;
    if (f2.group === 'E-ramm') return 2;

    // Metallic (RAMMs) logic: Wins against everything except other Metallics
    if (f1.type === 'metallic' && f2.type !== 'metallic') return 1;
    if (f2.type === 'metallic' && f1.type !== 'metallic') return 2;

    if (f1.type === 'hybrid' && f2.type !== 'hybrid') { if (f1.c1 !== f2.type && f1.c2 !== f2.type) return 1; return p1 > p2 ? 1 : (p2 > p1 ? 2 : 0); }
    if (f2.type === 'hybrid' && f1.type !== 'hybrid') { if (f2.c1 !== f1.type && f2.c2 !== f1.type) return 2; return p1 > p2 ? 1 : (p2 > p1 ? 2 : 0); }
    if (f1.type === f2.type) { return p1 > p2 ? 1 : (p2 > p1 ? 2 : 0); }
    if (f1.type === 'red' && f2.type === 'green') return 1;
    if (f1.type === 'green' && f2.type === 'blue') return 1;
    if (f1.type === 'blue' && f2.type === 'red') return 1;
    return 2;
}