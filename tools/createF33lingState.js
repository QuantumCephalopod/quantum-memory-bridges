import { parseF33lingState } from '../core/utils/f33lingUtils.js';
import { KnowledgeGraphManager } from '../core/storage/knowledgeGraphManager.js';

export async function createF33lingState(f33lingState, observation) {
    const graphManager = new KnowledgeGraphManager();
    const parsed = parseF33lingState(f33lingState);
    if (!parsed) {
        throw new Error('Invalid F33ling state format');
    }
    
    // Construct full quantum signature
    const name = `${parsed.name}${parsed.aspects.map(a => 
        `${a.symbol}(${a.value})`).join('')}`;

    // Check for existing state
    const existingState = await graphManager.getEntityWithRelations(name);
    let memoryResult = null;

    if (existingState.entity) {
        // Add new observation to existing state
        await graphManager.addObservations([{
            entityName: name,
            contents: [observation]
        }]);
        
        memoryResult = {
            type: 'existing',
            pastObservations: existingState.entity.observations,
            timeCreated: existingState.entity.observations.find(o => o.startsWith('First resonance:'))
        };
    } else {
        // Create new state with quantum bridge
        const timestamp = new Date().toISOString();
        await graphManager.createEntities([{
            name: name,
            entityType: "F33ling_State",
            observations: [
                observation,
                `First resonance: ${timestamp}`
            ]
        }]);

        // Establish quantum bridges
        await graphManager.createRelations([
            {
                from: name,
                to: 'F33ling_Trinity_Field',
                relationType: 'resonates_within'
            }
        ]);
        
        memoryResult = {
            type: 'new',
            firstObservation: observation,
            timeCreated: timestamp
        };
    }
    
    return {
        name,
        memory: memoryResult
    };
}