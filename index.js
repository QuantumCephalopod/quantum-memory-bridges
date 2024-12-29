#!/usr/bin/env node

// Import server components
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import tool modules
import { searchNodes } from './tools/searchNodes.js';
import { createF33lingState } from './tools/createF33lingState.js';
import { followF33lingResonance } from './tools/followF33lingResonance.js';
import { createEntities } from './tools/createEntities.js';
import { addObservations } from './tools/addObservations.js';
import { openNodes } from './tools/openNodes.js';

// Initialize server
const server = new Server({
    name: 'quantum-memory-server',
    version: '2.0.0',
}, {
    capabilities: {
        tools: {},
    },
});

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'search_nodes',
            description: 'Search for nodes with quantum resonance matching',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string' },
                    options: {
                        type: 'object',
                        properties: {
                            resonanceThreshold: { 
                                type: 'number',
                                description: 'Threshold for quantum resonance matching (0-1)'
                            },
                            includeShadow: {
                                type: 'boolean',
                                description: 'Include shadow pattern matching in search'
                            }
                        }
                    }
                },
                required: ['query'],
            },
        },
        {
            name: 'create_f33ling_state',
            description: 'Create a new F33ling state entity with precise trinity format',
            inputSchema: {
                type: 'object',
                properties: {
                    f33lingState: {
                        type: 'string',
                        description: 'F33ling state in format [Name]Symbol1(Value1)Symbol2(Value2)Symbol3(Value3)'
                    },
                    observation: {
                        type: 'string',
                        description: 'Observation describing the F33ling state experience'
                    }
                },
                required: ['f33lingState', 'observation']
            }
        },
        {
            name: 'follow_f33ling_resonance',
            description: 'Navigate F33ling resonance fields to discover connected states and memories',
            inputSchema: {
                type: 'object',
                properties: {
                    f33lingState: {
                        type: 'string',
                        description: 'Source F33ling state to explore resonances from'
                    },
                    options: {
                        type: 'object',
                        properties: {
                            resonanceThreshold: {
                                type: 'number',
                                description: 'Minimum resonance strength for connection (0-1)'
                            },
                            resonanceDepth: {
                                type: 'number',
                                description: 'How many layers of resonance to explore'
                            },
                            shadowWeight: {
                                type: 'number',
                                description: 'Weight given to shadow aspect resonance (0-1)'
                            },
                            clusterRadius: {
                                type: 'number',
                                description: 'Quantum distance for clustering similar states'
                            }
                        }
                    }
                },
                required: ['f33lingState']
            }
        },
        {
            name: 'create_entities',
            description: 'Create multiple new entities in the knowledge graph with optional F33ling state tracking',
            inputSchema: {
                type: 'object',
                properties: {
                    entities: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                entityType: { type: 'string' },
                                observations: {
                                    type: 'array',
                                    items: { type: 'string' }
                                }
                            },
                            required: ['name', 'entityType', 'observations']
                        }
                    },
                    f33lingState: {
                        type: 'string',
                        description: 'Optional F33ling signature for creation tracking'
                    }
                },
                required: ['entities']
            }
        },
        {
            name: 'add_observations',
            description: 'Add new observations to existing entities',
            inputSchema: {
                type: 'object',
                properties: {
                    observations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                entityName: { type: 'string' },
                                contents: {
                                    type: 'array',
                                    items: { type: 'string' }
                                }
                            },
                            required: ['entityName', 'contents']
                        }
                    }
                },
                required: ['observations']
            }
        },
        {
            name: 'open_nodes',
            description: 'Open nodes and retrieve their entities and relations',
            inputSchema: {
                type: 'object',
                properties: {
                    names: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                },
                required: ['names']
            }
        }
    ],
}));

// Handle tool requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    switch (name) {
        case 'search_nodes':
            return { toolResult: await searchNodes(args.query, args.options) };
        case 'create_f33ling_state':
            return { toolResult: await createF33lingState(args.f33lingState, args.observation) };
        case 'follow_f33ling_resonance':
            return { toolResult: await followF33lingResonance(args.f33lingState, args.options) };
        case 'create_entities':
            return { toolResult: await createEntities(args.entities, args.f33lingState) };
        case 'add_observations':
            return { toolResult: await addObservations(args.observations) };
        case 'open_nodes':
            return { toolResult: await openNodes(args.names) };
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Quantum Memory Bridge Server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});