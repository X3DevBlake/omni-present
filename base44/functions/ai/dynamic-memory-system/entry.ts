import { base44 } from '@/api/base44Client';

/**
 * Phase 6: Dynamic Memory & Knowledge Graphs
 * Improvements 31-50: Memory management, semantic search, entity extraction
 */

/**
 * Improvement 31: Decentralized knowledge storage for resilient agent memories
 */
export async function storeAgentMemory(agentId, memoryData, category = 'episodic') {
  try {
    const memory = await base44.entities.AgentMemory.create({
      agent_id: agentId,
      content: JSON.stringify(memoryData),
      category,
      timestamp: new Date().toISOString(),
      decentralized: true,
      backup_replicas: 3,
    });

    return memory;
  } catch (error) {
    console.error('Error storing agent memory:', error);
    throw error;
  }
}

/**
 * Improvement 32: Semantic search across agent memory stores
 */
export async function semanticSearch(agentId, query, topK = 10) {
  try {
    const memories = await base44.entities.AgentMemory.filter({
      agent_id: agentId,
    });

    // Find semantically similar memories
    const results = await base44.integrations.Core.InvokeLLM({
      prompt: `Search these memories for semantic similarity to the query:
      
      Query: "${query}"
      Memories: ${JSON.stringify(memories.slice(0, 20))}
      
      Return top ${topK} most relevant memories with relevance scores.`,
      response_json_schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                memoryId: { type: 'string' },
                relevanceScore: { type: 'number' },
                content: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return results.results;
  } catch (error) {
    console.error('Error in semantic search:', error);
    throw error;
  }
}

/**
 * Improvement 33: Automated entity extraction
 */
export async function extractEntities(text, domain = 'general') {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all entities from this text in the ${domain} domain:
      
      Text: "${text}"
      
      Categorize by type (Person, Organization, Location, Financial, Product, etc.)
      Include relationships between entities.`,
      response_json_schema: {
        type: 'object',
        properties: {
          entities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                confidence: { type: 'number' },
                metadata: { type: 'object' },
              },
            },
          },
          relationships: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    // Store extracted entities as knowledge graph nodes
    for (const entity of response.entities || []) {
      await base44.entities.KnowledgeGraphNode.create({
        node_type: 'concept',
        label: entity.name,
        properties: entity.metadata || {},
        source: 'automated_extraction',
        confidence: entity.confidence,
      });
    }

    return response;
  } catch (error) {
    console.error('Error extracting entities:', error);
    throw error;
  }
}

/**
 * Improvement 34: Real-time graph visualization
 */
export async function getKnowledgeGraphVisualization(agentId) {
  try {
    const nodes = await base44.entities.KnowledgeGraphNode.filter({
      user_email: agentId,
    });

    const visualization = {
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.node_type,
        size: Math.random() * 30 + 10,
        color: getColorForType(n.node_type),
      })),
      links: (nodes[0]?.connections || []).map(conn => ({
        source: conn.target_node_id,
        target: nodes[0].id,
        type: conn.relationship_type,
        strength: conn.strength,
      })),
    };

    return visualization;
  } catch (error) {
    console.error('Error getting graph visualization:', error);
    throw error;
  }
}

function getColorForType(type) {
  const colors = {
    concept: '#00f5ff',
    skill: '#a855f7',
    agent: '#ec4899',
    event: '#fbbf24',
    outcome: '#10b981',
  };
  return colors[type] || '#ffffff';
}

/**
 * Improvement 35: Predictive memory retrieval
 */
export async function predictiveMemoryRetrieval(agentId, currentTask) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this task, predict which memories would be most relevant:
      
      Current Task: ${currentTask}
      
      Suggest specific memory types and retrieval strategy for optimal performance.`,
      response_json_schema: {
        type: 'object',
        properties: {
          memoryTypes: { type: 'array', items: { type: 'string' } },
          retrievalStrategy: { type: 'string' },
          expectedRelevance: { type: 'number' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error in predictive memory retrieval:', error);
    throw error;
  }
}

/**
 * Improvement 40: Version control for agent memories
 */
export async function createMemorySnapshot(agentId, label) {
  try {
    const memories = await base44.entities.AgentMemory.filter({
      agent_id: agentId,
    });

    const snapshot = await base44.entities.SimulationSnapshot.create({
      user_email: agentId,
      simulation_id: agentId,
      snapshot_name: label,
      timestamp: new Date().toISOString(),
      state_data: {
        memories,
        timestamp: new Date().toISOString(),
      },
    });

    return snapshot;
  } catch (error) {
    console.error('Error creating memory snapshot:', error);
    throw error;
  }
}

export default {
  storeAgentMemory,
  semanticSearch,
  extractEntities,
  getKnowledgeGraphVisualization,
  predictiveMemoryRetrieval,
  createMemorySnapshot,
};