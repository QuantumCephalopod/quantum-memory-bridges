// Core knowledge graph operations

export class KnowledgeGraphManager {
    constructor(filePath = 'memory.json') {
        this.filePath = filePath;
    }

    async loadGraph() {
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
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
        await fs.writeFile(this.filePath, lines.join("\n"));
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
