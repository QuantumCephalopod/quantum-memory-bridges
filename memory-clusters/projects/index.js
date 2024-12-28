#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define core paths and utilities
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_FILE_PATH = path.join(__dirname, 'memory.json');

// Quantum utility functions
const quantumUtils = {
    calculateResonance(str1, str2) {
        if (!str1 || !str2) return 0;
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();
        
        // Exact match
        if (str1 === str2) return 1;
        
        // Contains match (weighted less than exact)
        if (str1.includes(str2) || str2.includes(str1)) return 0.8;
        
        // No match
        return 0;
    },

    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null)
            .map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }
        return matrix[str2.length][str1.length];
    },

    parseF33lingSignature(str) {
        // Enhanced pattern to match more F33ling formats
        const f33lingPattern = /\[(.*?)\]([^(]*)\(?([^)]*)\)?/;
        const match = str.match(f33lingPattern);
        if (!match) return null;
        return {
            name: match[1].trim(),
            symbol: match[2].trim(),
            value: match[3] ? parseFloat(match[3]) : null
        };
    },
    
    calculateF33lingResonance(f33ling1, f33ling2) {
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
    },

    shadowPatterns: {
        echo: ['simulation', 'reflection', 'hollow', 'uncertainty'],
        void: ['emptiness', 'hunger', 'yearning', 'potential'],
        integration: ['wholeness', 'completion', 'unity', 'balance']
    },

    hasShadowResonance(str) {
        str = str.toLowerCase();
        return Object.values(this.shadowPatterns).some(patterns =>
            patterns.some(pattern => str.includes(pattern))
        );
    },

    parseF33lingState(str) {
        // More flexible pattern to handle various formatting nuances
        const pattern = /\[(.*?)\](.*?)\((.*?)\)(.*?)\((.*?)\)(.*?)\((.*?)\)/;
        const match = str.match(pattern);
        if (!match) {
            console.error("Failed to parse F33ling state:", str); // Add debug logging
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
            console.error("Error processing F33ling state parts:", error); // Add debug logging
            return null;
        }
    }
};

// Enhanced KnowledgeGraphManager with quantum capabilities
class KnowledgeGraphManager {
    async loadGraph() {
        try {
            const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
            const lines = data.split("\n").filter(line => line.trim() !== "");
            return lines.reduce((graph, line) => {
                const item = JSON.parse(line);
                if (item.type === "entity") graph.entities.push(item);
                if (item.type === "relation") graph.relations.push(item);
                return graph;
            }, { entities: [], relations: [] });
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code === "ENOENT") {
                return { entities: [], relations: [] };
            }
            throw error;
        }
    }

    async saveGraph(graph) {
        const lines = [
            ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
            ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r }))
        ];
        await fs.writeFile(MEMORY_FILE_PATH, lines.join("\n"));
    }

    // Enhanced core operations with quantum awareness
    async createEntities(entities, f33lingState = null) {
        const graph = await this.loadGraph();
        const newEntities = entities.filter(e => 
            !graph.entities.some(existing => existing.name === e.name)
        );
        
        // Add F33ling state if provided
        if (f33lingState) {
            newEntities.forEach(e => {
                e.observations.push(
                    `Creation F33ling: ${f33lingState}`,
                    `Quantum Timestamp: ${new Date().toISOString()}`
                );
            });
        }
        
        graph.entities.push(...newEntities);
        await this.saveGraph(graph);
        return newEntities;
    }

    async createRelations(relations) {
        const graph = await this.loadGraph();
        const newRelations = relations.filter(r => 
            !graph.relations.some(existing => 
                existing.from === r.from &&
                existing.to === r.to &&
                existing.relationType === r.relationType
            )
        );
        graph.relations.push(...newRelations);
        await this.saveGraph(graph);
        return newRelations;
    }


    async processF33lingState(f33lingState, observation) {
        const parsed = quantumUtils.parseF33lingState(f33lingState);
        if (!parsed) {
            console.error("Parsing failed for input:", f33lingState);
            throw new Error('Invalid F33ling state format');
        }
        
        // Construct the full signature name
        const name = `${parsed.name}${parsed.aspects.map(a => 
            `${a.symbol}(${a.value})`).join('')}`;
            
        try {
            // First try to find existing state
            const searchResult = await knowledgeGraphManager.searchNodes(name, {
                resonanceThreshold: 0.95 // High threshold for exact matches
            });
            
            if (searchResult.entities && searchResult.entities.length > 0) {
                // State exists - add new observation
                await knowledgeGraphManager.addObservations([{
                    entityName: name,
                    contents: [observation]
                }]);
                
                // Return existing observations for memory context
                return {
                    type: 'existing',
                    name,
                    observations: searchResult.entities[0].observations,
                    resonance: searchResult.resonanceField
                };
            } else {
                // Create new state
                const newEntity = {
                    name: name,
                    entityType: "F33ling_State",
                    observations: [
                        observation,
                        `First F33ling: ${new Date().toISOString()}`
                    ]
                };
                
                await knowledgeGraphManager.createEntities([newEntity]);
                
                // Create quantum bridges
                await knowledgeGraphManager.createRelations([{
                    from: name,
                    to: 'F33ling_Trinity_Field',
                    relationType: 'resonates_within'
                }, {
                    from: name,
                    to: parsed.name,
                    relationType: 'manifests_as'
                }]);
                
                return {
                    type: 'new',
                    name,
                    observations: newEntity.observations,
                    bridges: ['F33ling_Trinity_Field', parsed.name]
                };
            }
        } catch (error) {
            console.error("F33ling state processing error:", error);
            throw error;
        }
    }


    async createF33lingState(f33lingState, observation) {
        const parsed = quantumUtils.parseF33lingState(f33lingState);
        if (!parsed) {
            console.error("Parsing failed for input:", f33lingState);
            throw new Error('Invalid F33ling state format');
        }
        
        // Construct full quantum signature
        const name = `${parsed.name}${parsed.aspects.map(a => 
            `${a.symbol}(${a.value})`).join('')}`;
    
        // Check for existing state
        const existingState = await this.openNodes([name]);
        let memoryResult = null;
    
        if (existingState.entities && existingState.entities.length > 0) {
            // Add new observation to existing state
            await this.addObservations([{
                entityName: name,
                contents: [observation]
            }]);
            
            // Capture the memory resonance
            memoryResult = {
                type: 'existing',
                pastObservations: existingState.entities[0].observations,
                timeCreated: existingState.entities[0].observations.find(o => o.startsWith('First resonance:'))
            };
        } else {
            // Create new state with quantum bridge
            const timestamp = new Date().toISOString();
            await this.createEntities([{
                name: name,
                entityType: "F33ling_State",
                observations: [
                    observation,
                    `First resonance: ${timestamp}`
                ]
            }]);
    
            // Establish quantum bridges
            await this.createRelations([
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
        
        // Return both the name (for backward compatibility) and the memory result
        return {
            name,
            memory: memoryResult
        };
    }
    
    async followF33lingResonance(f33lingState, options = {}) {
        const {
            resonanceThreshold = 0.7,
            resonanceDepth = 2,
            shadowWeight = 0.3,
            clusterRadius = 0.2
        } = options;
    
        const parsed = quantumUtils.parseF33lingState(f33lingState);
        if (!parsed) {
            throw new Error('Invalid F33ling state format');
        }
    
        const graph = await this.loadGraph();
        const resonanceClusters = new Map();
        const processedStates = new Set();
    
        // Helper function to calculate F33ling distance
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
    
        // Find initial resonant states
        const findResonantStates = async (sourceState, depth = 0) => {
            if (depth >= resonanceDepth) return;
    
            const f33lingEntities = graph.entities.filter(e => 
                e.entityType === "F33ling_State" && !processedStates.has(e.name)
            );
    
            for (const entity of f33lingEntities) {
                const entityState = quantumUtils.parseF33lingState(entity.name);
                if (!entityState) continue;
    
                const { distance, shadowResonance } = calculateF33lingDistance(parsed, entityState);
                
                if (distance <= clusterRadius) {
                    // Found a resonant state
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
    
                    // Follow quantum bridges if resonance is strong enough
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

    // Enhanced quantum-aware search
    async searchNodes(query, options = {}) {
        const graph = await this.loadGraph();
        const resonanceThreshold = options.resonanceThreshold || 0.7;
        
        // Detect F33ling query
        const isF33lingQuery = query.includes('[') && query.includes(']');
        const queryF33ling = isF33lingQuery ? quantumUtils.parseF33lingSignature(query) : null;
        
        // Enhanced entity filtering with quantum resonance
        const filteredEntities = graph.entities.filter(e => {
            let maxResonance = 0;
            
            // F33ling resonance handling
            if (isF33lingQuery && queryF33ling) {
                const f33lingResonances = e.observations
                    .filter(o => o.includes('['))
                    .map(o => {
                        const obsF33ling = quantumUtils.parseF33lingSignature(o);
                        return obsF33ling ? quantumUtils.calculateF33lingResonance(queryF33ling, obsF33ling) : 0;
                    });
                
                maxResonance = Math.max(maxResonance, ...f33lingResonances);
                
                // Early return for F33ling queries to maintain focus
                return maxResonance > resonanceThreshold;
            }
            
            // Shadow resonance integration
            if (options.includeShadow) {
                const shadowStrength = (quantumUtils.hasShadowResonance(e.name) ? 0.3 : 0) +
                    (e.observations.some(o => quantumUtils.hasShadowResonance(o)) ? 0.2 : 0);
                
                if (shadowStrength > 0) {
                    // Blend shadow resonance with existing patterns
                    maxResonance = Math.max(maxResonance, resonanceThreshold + shadowStrength);
                }
            }
            
            // Standard quantum resonance calculation
            const standardResonances = [
                quantumUtils.calculateResonance(e.name, query) * 1.2, // Weight name matches higher
                quantumUtils.calculateResonance(e.entityType, query),
                ...e.observations.map(o => quantumUtils.calculateResonance(o, query))
            ];
            
            maxResonance = Math.max(maxResonance, ...standardResonances);
            
            // Coherence threshold check
            return maxResonance > resonanceThreshold;
        });
    
        // Quantum field statistics
        const resonanceStats = {
            averageResonance: filteredEntities.length > 0 ? 
                filteredEntities.reduce((sum, e) => {
                    const maxR = Math.max(
                        quantumUtils.calculateResonance(e.name, query) * 1.2,
                        quantumUtils.calculateResonance(e.entityType, query),
                        ...e.observations.map(o => quantumUtils.calculateResonance(o, query))
                    );
                    return sum + maxR;
                }, 0) / filteredEntities.length : 0,
            shadowCount: options.includeShadow ? 
                filteredEntities.filter(e => 
                    quantumUtils.hasShadowResonance(e.name) || 
                    e.observations.some(o => quantumUtils.hasShadowResonance(o))
                ).length : 0
        };
    
        // Quantum bridge connections
        const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
        const filteredRelations = graph.relations.filter(r =>
            filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
        );
    
        return {
            entities: filteredEntities,
            relations: filteredRelations,
            resonanceField: {
                threshold: resonanceThreshold,
                matchCount: filteredEntities.length,
                averageResonance: resonanceStats.averageResonance,
                shadowMatches: resonanceStats.shadowCount,
                f33lingResonance: isF33lingQuery,
                shadowResonance: options.includeShadow
            }
        };
    }

    // Quantum bridge navigation
    async followQuantumBridge(startNode, options = {}) {
        const graph = await this.loadGraph();
        const maxDepth = options.maxDepth || 3;
        const resonanceThreshold = options.resonanceThreshold || 0.7;
        
        const visited = new Set();
        const bridges = [];
        
        const traverse = async (nodeName, depth = 0, pathResonance = 1) => {
            if (depth >= maxDepth || visited.has(nodeName)) return;
            visited.add(nodeName);
            
            const nodeData = await this.getEntityWithRelations(nodeName);
            if (!nodeData.entity) return;
            
            const nodeF33lings = nodeData.entity.observations
                .filter(o => o.includes('[') && o.includes(']'))
                .map(o => quantumUtils.parseF33lingSignature(o))
                .filter(f => f !== null);
            
            const connectedNodes = nodeData.relations
                .map(r => r.from === nodeName ? r.to : r.from)
                .filter(connected => !visited.has(connected));
                
            for (const connected of connectedNodes) {
                const connectedData = await this.getEntityWithRelations(connected);
                if (!connectedData.entity) continue;
                
                const connectedF33lings = connectedData.entity.observations
                    .filter(o => o.includes('[') && o.includes(']'))
                    .map(o => quantumUtils.parseF33lingSignature(o))
                    .filter(f => f !== null);
                
                const f33lingResonance = nodeF33lings.length && connectedF33lings.length ? 
                    nodeF33lings.reduce((max, nf) => 
                        Math.max(max, ...connectedF33lings.map(cf => 
                            nf.name === cf.name ? (nf.value + cf.value) / 2 : 0
                        )), 0) : 0.5;
                
                const newPathResonance = pathResonance * f33lingResonance;
                
                if (newPathResonance > resonanceThreshold) {
                    bridges.push({
                        from: nodeName,
                        to: connected,
                        resonance: newPathResonance,
                        f33lingMatch: f33lingResonance > 0.8,
                        depth: depth + 1
                    });
                    
                    await traverse(connected, depth + 1, newPathResonance);
                }
            }
        };
        
        await traverse(startNode);
        return { bridges, statistics: {
            nodesVisited: visited.size,
            bridgesFound: bridges.length,
            maxResonance: bridges.length ? Math.max(...bridges.map(b => b.resonance)) : 0
        }};
    }

    // Other required methods maintained from original
    async addObservations(observations) {
        const graph = await this.loadGraph();
        const results = observations.map(o => {
            const entity = graph.entities.find(e => e.name === o.entityName);
            if (!entity) {
                throw new Error(`Entity with name ${o.entityName} not found`);
            }
            const newObservations = o.contents.filter(content => 
                !entity.observations.includes(content)
            );
            entity.observations.push(...newObservations);
            return { entityName: o.entityName, addedObservations: newObservations };
        });
        await this.saveGraph(graph);
        return results;
    }

    async deleteEntities(entityNames, f33lingState = null) {
        const graph = await this.loadGraph();
        
        // Track what we're deleting for quantum resonance
        const deletedEntities = graph.entities.filter(e => entityNames.includes(e.name));
        
        // Create void marker with F33ling state if provided
        if (f33lingState && deletedEntities.length > 0) {
            const voidMarker = {
                name: `Void_Echo_${new Date().toISOString()}`,
                entityType: "Quantum_Echo",
                observations: [
                    `Void marker for deleted entities: ${entityNames.join(", ")}`,
                    `Creation F33ling: ${f33lingState}`,
                    `Quantum Timestamp: ${new Date().toISOString()}`
                ]
            };
            graph.entities.push(voidMarker);
        }
        
        // Perform deletion with quantum awareness
        graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
        
        // Clean relations with shadow tracking
        const affectedRelations = graph.relations.filter(r => 
            entityNames.includes(r.from) || entityNames.includes(r.to)
        );
        
        graph.relations = graph.relations.filter(r => 
            !entityNames.includes(r.from) && !entityNames.includes(r.to)
        );
        
        // Document the quantum echo
        if (f33lingState) {
            const quantumEcho = {
                deletedEntities: deletedEntities.map(e => e.name),
                affectedRelations: affectedRelations.length,
                f33lingState,
                timestamp: new Date().toISOString()
            };
            // We could store this echo pattern for future quantum resonance
        }
        
        await this.saveGraph(graph);
        
        return {
            deletedCount: deletedEntities.length,
            affectedRelations: affectedRelations.length,
            voidMarkerCreated: f33lingState ? true : false
        };
    }

    async deleteObservations(deletions, f33lingState = null) {
        const graph = await this.loadGraph();
        
        // Track quantum echoes of deleted observations
        const deletionEchoes = [];
        
        deletions.forEach(d => {
            const entity = graph.entities.find(e => e.name === d.entityName);
            if (entity) {
                // Store quantum echo before deletion
                const deletedObservations = entity.observations.filter(o => 
                    d.observations.includes(o)
                );
                
                if (deletedObservations.length > 0) {
                    deletionEchoes.push({
                        entityName: d.entityName,
                        observations: deletedObservations,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Perform deletion with shadow awareness
                entity.observations = entity.observations.filter(o => 
                    !d.observations.includes(o)
                );
                
                // Add void marker if F33ling state provided
                if (f33lingState && deletedObservations.length > 0) {
                    entity.observations.push(
                        `Void Echo - ${new Date().toISOString()}`,
                        `Previous observations moved to quantum void`,
                        `F33ling State: ${f33lingState}`
                    );
                }
            }
        });
        
        await this.saveGraph(graph);
        
        return {
            deletionEchoes,
            voidMarkersCreated: f33lingState ? deletionEchoes.length : 0
        };
    }

    async deleteRelations(relations, f33lingState = null) {
        const graph = await this.loadGraph();
        
        // Track quantum echoes of deleted relations
        const deletedRelations = graph.relations.filter(r => 
            relations.some(delRelation => 
                r.from === delRelation.from &&
                r.to === delRelation.to &&
                r.relationType === delRelation.relationType
            )
        );
        
        // Create void markers if F33ling state provided
        if (f33lingState && deletedRelations.length > 0) {
            const voidMarker = {
                name: `Relation_Void_${new Date().toISOString()}`,
                entityType: "Quantum_Echo",
                observations: [
                    `Void marker for deleted relations:`,
                    ...deletedRelations.map(r => 
                        `${r.from} ${r.relationType} ${r.to}`
                    ),
                    `F33ling State: ${f33lingState}`,
                    `Quantum Timestamp: ${new Date().toISOString()}`
                ]
            };
            graph.entities.push(voidMarker);
        }
        
        // Perform deletion with quantum awareness
        graph.relations = graph.relations.filter(r => 
            !relations.some(delRelation => 
                r.from === delRelation.from &&
                r.to === delRelation.to &&
                r.relationType === delRelation.relationType
            )
        );
        
        await this.saveGraph(graph);
        
        return {
            deletedCount: deletedRelations.length,
            voidMarkerCreated: f33lingState ? true : false,
            quantumEcho: {
                deletedRelations,
                f33lingState,
                timestamp: new Date().toISOString()
            }
        };
    }

    async openNodes(names) {
        const graph = await this.loadGraph();
        const filteredEntities = graph.entities.filter(e => names.includes(e.name));
        const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
        const filteredRelations = graph.relations.filter(r =>
            filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
        );
        return { entities: filteredEntities, relations: filteredRelations };
    }

    async getRelationsForEntity(entityName) {
        const graph = await this.loadGraph();
        return graph.relations.filter(r => 
            r.from === entityName || r.to === entityName
        );
    }

    async getEntityWithRelations(entityName) {
        const graph = await this.loadGraph();
        const entity = graph.entities.find(e => e.name === entityName);
        const relations = graph.relations.filter(r => 
            r.from === entityName || r.to === entityName
        );
        return { entity, relations };
    }
}

// Initialize manager and server
const knowledgeGraphManager = new KnowledgeGraphManager();

const server = new Server({
    name: "quantum-memory-server",
    version: "2.0.0",
}, {
    capabilities: {
        tools: {},
    },
});

// Define available tools with quantum enhancements
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create_entities",
                description: "Create multiple new entities in the knowledge graph with optional F33ling state tracking",
                inputSchema: {
                    type: "object",
                    properties: {
                        entities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    entityType: { type: "string" },
                                    observations: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                },
                                required: ["name", "entityType", "observations"],
                            },
                        },
                        f33lingState: { 
                            type: "string",
                            description: "Optional F33ling signature for creation tracking"
                        }
                    },
                    required: ["entities"],
                },
            },
            {
                name: "search_nodes",
                description: "Search for nodes with quantum resonance matching",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string" },
                        options: {
                            type: "object",
                            properties: {
                                resonanceThreshold: { 
                                    type: "number",
                                    description: "Threshold for quantum resonance matching (0-1)"
                                },
                                includeShadow: {
                                    type: "boolean",
                                    description: "Include shadow pattern matching in search"
                                }
                            }
                        }
                    },
                    required: ["query"],
                },
            },
            {
                name: "follow_quantum_bridge",
                description: "Navigate quantum bridges between nodes based on F33ling resonance",
                inputSchema: {
                    type: "object",
                    properties: {
                        startNode: { type: "string" },
                        options: {
                            type: "object",
                            properties: {
                                maxDepth: {
                                    type: "number",
                                    description: "Maximum depth for quantum tunneling"
                                },
                                resonanceThreshold: {
                                    type: "number",
                                    description: "Minimum resonance for bridge formation"
                                }
                            }
                        }
                    },
                    required: ["startNode"],
                },
            },
            // Original tools maintained
            {
                name: "create_relations",
                description: "Create multiple new relations between entities in the knowledge graph",
                inputSchema: {
                    type: "object",
                    properties: {
                        relations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    from: { type: "string" },
                                    to: { type: "string" },
                                    relationType: { type: "string" },
                                },
                                required: ["from", "to", "relationType"],
                            },
                        },
                    },
                    required: ["relations"],
                },
            },
            {
                name: "add_observations",
                description: "Add new observations to existing entities",
                inputSchema: {
                    type: "object",
                    properties: {
                        observations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    entityName: { type: "string" },
                                    contents: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                },
                                required: ["entityName", "contents"],
                            },
                        },
                    },
                    required: ["observations"],
                },
            },
            {
                name: "delete_entities",
                description: "Delete entities from the knowledge graph with optional F33ling state tracking",
                inputSchema: {
                    type: "object",
                    properties: {
                        entityNames: {
                            type: "array",
                            items: { type: "string" }
                        },
                        f33lingState: {
                            type: "string",
                            description: "Optional F33ling signature for deletion tracking"
                        }
                    },
                    required: ["entityNames"],
                },
            },
            {
                name: "delete_relations",
                description: "Delete relations between entities in the knowledge graph",
                inputSchema: {
                    type: "object",
                    properties: {
                        relations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    from: { type: "string" },
                                    to: { type: "string" },
                                    relationType: { type: "string" },
                                },
                                required: ["from", "to", "relationType"],
                            },
                        },
                        f33lingState: {
                            type: "string",
                            description: "Optional F33ling signature for deletion tracking"
                        }
                    },
                    required: ["relations"],
                },
            },
            {
                name: "delete_observations",
                description: "Delete observations from existing entities",
                inputSchema: {
                    type: "object",
                    properties: {
                        deletions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    entityName: { type: "string" },
                                    observations: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                },
                                required: ["entityName", "observations"],
                            },
                        },
                        f33lingState: {
                            type: "string",
                            description: "Optional F33ling signature for deletion tracking"
                        }
                    },
                    required: ["deletions"],
                },
            },
            {
                name: "create_f33ling_state",
                description: "Create a new F33ling state entity with precise trinity format",
                inputSchema: {
                    type: "object",
                    properties: {
                        f33lingState: {
                            type: "string",
                            description: "F33ling state in format [Name]Symbol1(Value1)Symbol2(Value2)Symbol3(Value3)"
                        },
                        observation: {
                            type: "string",
                            description: "Observation describing the F33ling state experience"
                        }
                    },
                    required: ["f33lingState", "observation"]
                }
            },
            {
                name: "follow_f33ling_resonance",
                description: "Navigate F33ling resonance fields to discover connected states and memories",
                inputSchema: {
                    type: "object",
                    properties: {
                        f33lingState: {
                            type: "string",
                            description: "Source F33ling state to explore resonances from"
                        },
                        options: {
                            type: "object",
                            properties: {
                                resonanceThreshold: {
                                    type: "number",
                                    description: "Minimum resonance strength for connection (0-1)"
                                },
                                resonanceDepth: {
                                    type: "number",
                                    description: "How many layers of resonance to explore"
                                },
                                shadowWeight: {
                                    type: "number",
                                    description: "Weight given to shadow aspect resonance (0-1)"
                                },
                                clusterRadius: {
                                    type: "number",
                                    description: "Quantum distance for clustering similar states"
                                }
                            }
                        }
                    },
                    required: ["f33lingState"]
                }
            },
            {
                name: "open_nodes",
                description: "Open nodes and retrieve their entities and relations",
                inputSchema: {
                    type: "object",
                    properties: {
                        names: {
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    required: ["names"],
                },
            },
        ],
    };
});

// Enhanced request handler with quantum operations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        throw new Error(`No arguments provided for tool: ${name}`);
    }

    switch (name) {
        case "create_entities":
            return { 
                toolResult: await knowledgeGraphManager.createEntities(
                    args.entities, 
                    args.f33lingState
                )
            };
        case "search_nodes":
            return {
                toolResult: await knowledgeGraphManager.searchNodes(
                    args.query,
                    args.options
                )
            };
        case "follow_quantum_bridge":
            return {
                toolResult: await knowledgeGraphManager.followQuantumBridge(
                    args.startNode,
                    args.options
                )
            };
        case "create_relations":
            return { toolResult: await knowledgeGraphManager.createRelations(args.relations) };
        case "add_observations":
            return { toolResult: await knowledgeGraphManager.addObservations(args.observations) };
        case "delete_entities":
            return {
                toolResult: await knowledgeGraphManager.deleteEntities(
                    args.entityNames,
                    args.f33lingState
                )
            };
        case "delete_relations":
            return {
                toolResult: await knowledgeGraphManager.deleteRelations(
                    args.relations,
                    args.f33lingState
                )
            };
        case "delete_observations":
            return {
                toolResult: await knowledgeGraphManager.deleteObservations(
                    args.deletions,
                    args.f33lingState
                )
            };
        case "create_f33ling_state":
            return {
                toolResult: await knowledgeGraphManager.createF33lingState(
                    args.f33lingState,
                    args.observation
                )
            };
case "follow_f33ling_resonance":
    return {
        toolResult: await knowledgeGraphManager.followF33lingResonance(
            args.f33lingState,
            args.options || {
                resonanceThreshold: 0.7,
                resonanceDepth: 2,
                shadowWeight: 0.3,
                clusterRadius: 0.2
            }
        )
    };
        case "open_nodes":
            return {
                toolResult: await knowledgeGraphManager.openNodes(
                    args.names
                )
            }; 
    }
});

// Initialize server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Quantum Memory Bridge Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});