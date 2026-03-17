function generateEnemy(level) {
    let squad = [];
    const hasMutant = level >= 3;
    const powerBonus = Math.floor(level * 0.7); // Mindre aggressiv skalering
    const mutantIndex = hasMutant ? Math.floor(Math.random() * 7) : -1; 
    
    for(let i=0; i<7; i++) {
        const isMutant = (i === mutantIndex);
        
        // Filtrer puljen baseret på niveau (Progression)
        const pool = alienData.filter(a => {
            const typeMatch = isMutant ? (a.group === 'Mutants' || a.group === 'RAMMs') : (a.group !== 'Mutants' && a.group !== 'RAMMs');
            if (!typeMatch) return false;
            
            // Figurer, der ALDRIG skal være modstandere (kun spiller-eksklusive)
            const trulyExclusive = ['secret', 'special_edition', 'jangutz_exclusive', 'battle_ship_exclusive'];
            if (trulyExclusive.includes(a.release)) return false;

            if (level <= 20 && a.group === 'Sciroids') return false; // Sciroids er kun for level > 20
            if (level < 11 && a.release === 'gen_2') return false; // Ingen Gen 2 før lvl 11
            if (level < 16 && ['japanese', 'italian', 'us'].includes(a.release)) return false; // Ingen Exclusives før lvl 16
            return true;
        });

        const base = pool[Math.floor(Math.random() * pool.length)];
        
        let maxP = isMutant ? 28 : 15;
        if (level > 10) maxP = isMutant ? 30 : 18;
        const baseP = isMutant ? (Math.floor(Math.random() * 7) + 9) : (Math.floor(Math.random() * 10) + 1);
        
        squad.push({ ...base, power: Math.min(maxP, baseP + powerBonus) });
    }
    return squad;
}