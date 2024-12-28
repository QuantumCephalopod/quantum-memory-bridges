import { parseF33lingState } from '../core/utils/f33lingUtils.js';
import { KnowledgeGraphManager } from '../core/storage/knowledgeGraphManager.js';

export async function followF33lingResonance(f33lingState, options = {}) {
    const {
        resonanceThreshold = 0.7,
        resonanceDepth = 2,
        shadowWeight = 0.3,
        clusterRadius = 0.2
    } = options;

    const parsed = parseF33lingState(f33lingState);
    if (!parsed) {
        throw new Error('Invalid F33ling state format');
    }

    const graphManager = new KnowledgeGraphManager();
    const graph = await graphManager.loadGraph();
    const resonanceClusters = new Map();
    const processedStates = new Set();

    // Calculate F33ling distance
    const calculateF33lingDistance = (state1, state2) => {
        const aspectDistance = state1.aspects.reduce((sum, aspect, i) => {
            const weight = i === 2 ? shadowWeight : 1; // Special weight for shadow aspect
            return sum + Math.abs(aspect.value - state2.aspects[i].value) * weight;
        }, 0) / state1.aspects.length;

        return {
            distance: aspectDistance,
            shadowResonance: Math.abs(state1.aspects[2].value - state2.aspects[2].value)
        };
    };

    // Find resonant states recursively
    const findResonantStates = async (sourceState, depth = 0) => {
        if (depth >= resonanceDepth) return;

        const f33lingEntities = graph.entities.filter(e => 
            e.entityType === "F33ling_State" && !processedStates.has(e.name)
        );

        for (const entity of f33lingEntities) {
            const entityState = parseF33lingState(entity.name);
            if (!entityState) continue;

            const { distance, shadowResonance } = calculateF33lingDistance(parsed, entityState);
            
            if (distance <= clusterRadius) {
                if (!resonanceClusters.has(depth)) {
                    resonanceClusters.set(depth, []);
                }
                resonanceClusters.get(depth).push({
                    state: entity.name,
                    observations: entity.observations,
                    resonanceStrength: 1 - distance,
                    shadowResonance
                });
                processedStates.add(entity.name);

                if (1 - distance >= resonanceThreshold) {
                    await findResonantStates(entityState, depth + 1);
                }
            }
        }
    };

    await findResonantStates(parsed);

    // Calculate cluster statistics
    const statistics = {
        totalClusters: resonanceClusters.size,
        totalStates: [...resonanceClusters.values()].reduce((sum, cluster) => 
            sum + cluster.length, 0),
        averageResonance: [...resonanceClusters.values()].reduce((sum, cluster) =>
            sum + cluster.reduce((clusterSum, state) => 
                clusterSum + state.resonanceStrength, 0) / cluster.length, 0) / resonanceClusters.size,
        shadowPatterns: [...resonanceClusters.values()].flat()
            .filter(state => state.shadowResonance < 0.1).length
    };

    return {
        clusters: Object.fromEntries(resonanceClusters),
        statistics,
        quantumCoherence: statistics.averageResonance * (1 - statistics.shadowPatterns / statistics.totalStates)
    };
}