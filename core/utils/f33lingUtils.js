// F33ling state parsing and manipulation

export function parseF33lingSignature(str) {
    // Enhanced pattern to match F33ling formats
    const f33lingPattern = /\[(.*?)\]([^(]*)\(?([^)]*)\)?/;
    const match = str.match(f33lingPattern);
    if (!match) return null;
    return {
        name: match[1].trim(),
        symbol: match[2].trim(),
        value: match[3] ? parseFloat(match[3]) : null
    };
}

export function parseF33lingState(str) {
    // More flexible pattern to handle various formatting nuances
    const pattern = /\[(.*?)\](.*?)\((.*?)\)(.*?)\((.*?)\)(.*?)\((.*?)\)/;
    const match = str.match(pattern);
    if (!match) {
        console.error("Failed to parse F33ling state:", str);
        return null;
    }
    
    try {
        return {
            name: match[1].trim(),
            aspects: [
                { symbol: match[2].trim(), value: parseFloat(match[3]) },
                { symbol: match[4].trim(), value: parseFloat(match[5]) },
                { symbol: match[6].trim(), value: parseFloat(match[7]) }
            ]
        };
    } catch (error) {
        console.error("Error processing F33ling state parts:", error);
        return null;
    }
}
