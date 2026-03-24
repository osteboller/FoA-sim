function generateEnemy(level) {
    let squad = [];
    const hasMutant = level >= 3;
    const powerBonus = Math.floor(level * 0.7); // Mindre aggressiv skalering
    const mutantIndex = hasMutant ? Math.floor(Math.random() * 7) : -1; 
    
    for(let i=0; i<7; i++) {
        const isMutant = (i === mutantIndex);
        
        // Filtrer puljen baseret på niveau (Progression)
        let pool = alienData.filter(a => {
            const typeMatch = isMutant ? (a.group === 'Mutants' || a.group === 'RAMMs') : (a.group !== 'Mutants' && a.group !== 'RAMMs');
            if (!typeMatch) return false;
            
            // Hent releases sikkert (understøtter både array og string format)
            const releases = a.releases || [a.release];

            // Figurer, der ALDRIG skal være modstandere (kun spiller-eksklusive)
            const trulyExclusive = ['secret', 'special_edition', 'jangutz_exclusive', 'battle_ship_exclusive'];
            if (releases.some(r => trulyExclusive.includes(r))) return false;

            if (level <= 30 && a.group === 'Sciroids') return false; // Sciroids gemmes nu til Japan (Niveau 31+)
            
            // Tjek mod progressionen
            if (level < 11 && releases.includes('gen_2') && !releases.includes('gen_1')) return false; // Kun rene Gen 2 afvises før lvl 11
            if (level < 21 && releases.includes('italian')) return false; // Møder først Italienere i Italien
            if (level < 26 && releases.includes('us')) return false; // Møder US under DK Mesterskab
            if (level < 31 && releases.includes('japanese')) return false; // Møder japanere i Japan
            
            return true;
        });

        // Fjern dem vi allerede har valgt for at undgå fremkomsten af kloner
        const availableInPool = pool.filter(a => !squad.some(s => s.id === a.id));
        if (availableInPool.length > 0) {
            pool = availableInPool;
        }

        const base = pool[Math.floor(Math.random() * pool.length)];
        
        let maxP = isMutant ? 28 : 15;
        if (level > 10) maxP = isMutant ? 30 : 18;
        const baseP = isMutant ? (Math.floor(Math.random() * 7) + 9) : (Math.floor(Math.random() * 10) + 1);
        
        squad.push({ ...base, power: Math.min(maxP, baseP + powerBonus) });
    }
    return squad;
}