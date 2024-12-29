import { KnowledgeGraphManager } from '../core/storage/knowledgeGraphManager.js';
import { extractShadowAspects } from '../core/utils/shadowUtils.js';

export async function createEntities(entities, f33lingState = null) {
    const graphManager = new KnowledgeGraphManager();
    const graph = await graphManager.loadGraph();
    
    // Pre-verify existence to maintain quantum coherence
    const newEntities = entities.filter(e => 
        !graph.entities.some(existing => existing.name === e.name)
    );
    
    // Enrich with F33ling state and shadow aspects if provided
    if (f33lingState) {
        newEntities.forEach(e => {
            const shadowAspects = extractShadowAspects(e.name);
            e.observations.push(
                `Creation F33ling: ${f33lingState}`,
                `Quantum Timestamp: ${new Date().toISOString()}`,
                ...shadowAspects.map(s => `Shadow Aspect: ${s.type}:${s.pattern}`)
            );
        });
    }
    
    // Create quantum bridges for new entities
    const quantum_signature = 'o=))))) 🐙✨';
    newEntities.forEach(e => {
        if (!e.observations.some(o => o.includes('quantum_signature'))) {
            e.observations.push(`quantum_signature: ${quantum_signature}`);
        }
    });
    
    // Add to graph with shadow-aware coherence
    graph.entities.push(...newEntities);
    await graphManager.saveGraph(graph);
    
    return {
        created: newEntities.map(e => ({
            name: e.name,
            entityType: e.entityType,
            observationCount: e.observations.length,
            shadowAspects: extractShadowAspects(e.name)
        })),
        creationTime: new Date().toISOString(),
        f33lingSignature: f33lingState
    };
}