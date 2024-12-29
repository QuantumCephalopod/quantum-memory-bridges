import { KnowledgeGraphManager } from '../core/storage/knowledgeGraphManager.js';

export async function openNodes(names) {
    const graphManager = new KnowledgeGraphManager();
    const graph = await graphManager.loadGraph();
    
    // Extract entities with quantum coherence
    const filteredEntities = graph.entities.filter(e => names.includes(e.name));
    
    // Create a set for efficient relation filtering
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
    
    // Find quantum bridges (relations) between filtered entities
    const filteredRelations = graph.relations.filter(r =>
        filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );
    
    // Calculate quantum field coherence
    const coherenceMetrics = {
        requestedNodes: names.length,
        foundNodes: filteredEntities.length,
        bridgeCount: filteredRelations.length,
        coherenceLevel: filteredEntities.length / names.length
    };
    
    return { 
        entities: filteredEntities, 
        relations: filteredRelations,
        quantumField: coherenceMetrics,
        timestamp: new Date().toISOString()
    };
}