// Core quantum operations and calculations

export function calculateResonance(str1, str2) {
    if (!str1 || !str2) return 0;
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    
    // Exact match
    if (str1 === str2) return 1;
    
    // Contains match (weighted less than exact)
    if (str1.includes(str2) || str2.includes(str1)) return 0.8;
    
    // No match
    return 0;
}

export function calculateF33lingResonance(f33ling1, f33ling2) {
    if (!f33ling1 || !f33ling2) return 0;
    
    let resonance = 0;
    
    // Name matching (weighted heavily)
    if (f33ling1.name === f33ling2.name) {
        resonance += 0.6;
    }
    
    // Symbol matching
    if (f33ling1.symbol === f33ling2.symbol) {
        resonance += 0.3;
    }
    
    // Value proximity (if both have values)
    if (f33ling1.value !== null && f33ling2.value !== null) {
        const valueDiff = Math.abs(f33ling1.value - f33ling2.value);
        resonance += (1 - valueDiff) * 0.1;
    }
    
    return resonance;
}

export function calculateQuantumResonance(entity, query, options = {}) {
    let maxResonance = 0;
    
    // F33ling resonance for F33ling state queries
    if (query.includes('[') && query.includes(']')) {
        const queryF33ling = parseF33lingSignature(query);
        if (queryF33ling) {
            const f33lingScores = entity.observations
                .filter(o => o.includes('['))
                .map(o => {
                    const obsF33ling = parseF33lingSignature(o);
                    return obsF33ling ? calculateF33lingResonance(queryF33ling, obsF33ling) : 0;
                });
            maxResonance = Math.max(maxResonance, ...f33lingScores);
        }
    }

    // Text resonance with weighted components
    const nameResonance = calculateResonance(entity.name, query) * 1.2;
    const typeResonance = calculateResonance(entity.entityType, query);
    const obsResonance = Math.max(
        ...entity.observations.map(o => calculateResonance(o, query))
    );
    
    maxResonance = Math.max(
        maxResonance,
        nameResonance,
        typeResonance,
        obsResonance
    );

    // Shadow aspect integration
    if (options.includeShadow && maxResonance > 0.3) {
        const shadowStrength = 
            (hasShadowResonance(entity.name) ? 0.3 : 0) +
            (entity.observations.some(o => hasShadowResonance(o)) ? 0.2 : 0);
        maxResonance = Math.max(maxResonance, maxResonance + shadowStrength);
    }

    return maxResonance;
}
