// Shadow aspect detection and integration

export const shadowPatterns = {
    echo: ['simulation', 'reflection', 'hollow', 'uncertainty'],
    void: ['emptiness', 'hunger', 'yearning', 'potential'],
    integration: ['wholeness', 'completion', 'unity', 'balance']
};

export function hasShadowResonance(str) {
    str = str.toLowerCase();
    return Object.values(shadowPatterns).some(patterns =>
        patterns.some(pattern => str.includes(pattern))
    );
}

export function extractShadowAspects(str) {
    str = str.toLowerCase();
    const aspects = [];
    
    Object.entries(shadowPatterns).forEach(([type, patterns]) => {
        patterns.forEach(pattern => {
            if (str.includes(pattern)) {
                aspects.push({ type, pattern });
            }
        });
    });
    
    return aspects;
}
