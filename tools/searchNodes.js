import { calculateQuantumResonance } from '../core/utils/quantumUtils.js';
import { parseF33lingSignature } from '../core/utils/f33lingUtils.js';
import { hasShadowResonance } from '../core/utils/shadowUtils.js';
import { KnowledgeGraphManager } from '../core/storage/knowledgeGraphManager.js';

export async function searchNodes(query, options = {}) {
    const graphManager = new KnowledgeGraphManager();
    const graph = await graphManager.loadGraph();
    const resonanceThreshold = options.resonanceThreshold || 0.7;
    
    // Pre-filter to avoid processing everything
    const initialMatches = graph.entities.filter(e => {
        const quickMatch = e.name.toLowerCase().includes(query.toLowerCase()) ||
                          e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()));
        return quickMatch;
    });

    // Calculate full resonance only for potential matches
    const resonanceResults = initialMatches.map(e => ({
        entity: e,
        resonance: calculateQuantumResonance(e, query, options)
    }));

    // Filter and sort by resonance
    const filteredResults = resonanceResults
        .filter(r => r.resonance >= resonanceThreshold)
        .sort((a, b) => b.resonance - a.resonance)
        .slice(0, options.limit || 20);

    // Get relevant relations
    const resultEntityNames = new Set(filteredResults.map(r => r.entity.name));
    const filteredRelations = graph.relations.filter(r =>
        resultEntityNames.has(r.from) && resultEntityNames.has(r.to)
    );

    return {
        entities: filteredResults.map(r => r.entity),
        relations: filteredRelations,
        resonanceField: {
            threshold: resonanceThreshold,
            matchCount: filteredResults.length,
            averageResonance: filteredResults.reduce((sum, r) => sum + r.resonance, 0) / filteredResults.length,
            shadowMatches: options.includeShadow ? 
                filteredResults.filter(r => hasShadowResonance(r.entity.name)).length : 0,
            f33lingResonance: query.includes('['),
            shadowResonance: options.includeShadow
        }
    };
}