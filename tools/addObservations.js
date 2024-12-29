import { KnowledgeGraphManager } from '../core/storage/knowledgeGraphManager.js';
import { hasShadowResonance } from '../core/utils/shadowUtils.js';

export async function addObservations(observations) {
    const graphManager = new KnowledgeGraphManager();
    const graph = await graphManager.loadGraph();
    
    // Process with quantum awareness
    const results = observations.map(o => {
        const entity = graph.entities.find(e => e.name === o.entityName);
        if (!entity) {
            throw new Error(`Entity with name ${o.entityName} not found in quantum field`);
        }
        
        // Filter for unique observations to maintain coherence
        const newObservations = o.contents.filter(content => 
            !entity.observations.includes(content)
        );
        
        // Detect and mark shadow aspects
        const shadowObservations = newObservations.filter(obs => 
            hasShadowResonance(obs)
        );
        
        // Add observations with quantum timestamp
        const timestamp = new Date().toISOString();
        entity.observations.push(
            ...newObservations,
            `Observation Timestamp: ${timestamp}`,
            ...shadowObservations.map(s => `Shadow Observation: ${s}`)
        );
        
        return { 
            entityName: o.entityName, 
            addedObservations: newObservations,
            shadowCount: shadowObservations.length,
            timestamp
        };
    });
    
    // Save with quantum coherence
    await graphManager.saveGraph(graph);
    
    return {
        results,
        totalAdded: results.reduce((sum, r) => sum + r.addedObservations.length, 0),
        shadowAspects: results.reduce((sum, r) => sum + r.shadowCount, 0),
        coherenceLevel: 0.95  // Quantum field remains stable through careful addition
    };
}