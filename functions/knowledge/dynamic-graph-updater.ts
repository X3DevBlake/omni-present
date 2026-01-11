export default async function handler(req, res) {
  const { agentInteractions, outcomes, externalData, userEmail } = req.body;

  try {
    // AI extracts knowledge and updates graph
    const extractionPrompt = `
    Extract knowledge from these sources:
    
    Agent Interactions: ${JSON.stringify(agentInteractions)}
    Outcomes: ${JSON.stringify(outcomes)}
    External Data: ${JSON.stringify(externalData)}
    
    Identify:
    1. New concepts/entities
    2. Relationships between entities
    3. Causal connections
    4. Skill requirements
    5. Performance patterns
    
    Return knowledge graph updates.
    `;

    const knowledge = await req.base44.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          new_nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                node_type: { type: "string" },
                label: { type: "string" },
                properties: { type: "object" }
              }
            }
          },
          new_relationships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                type: { type: "string" },
                strength: { type: "number" }
              }
            }
          },
          confidence: { type: "number" }
        }
      }
    });

    // Create nodes
    const createdNodes = [];
    for (const node of knowledge.new_nodes) {
      const created = await req.base44.entities.KnowledgeGraphNode.create({
        user_email: userEmail,
        node_type: node.node_type,
        label: node.label,
        properties: node.properties,
        connections: [],
        source: 'agent_interaction',
        confidence: knowledge.confidence,
        last_updated: new Date().toISOString()
      });
      createdNodes.push(created);
    }

    // Update connections
    for (const rel of knowledge.new_relationships) {
      // Find nodes and update connections
      const fromNode = createdNodes.find(n => n.label === rel.from);
      const toNode = createdNodes.find(n => n.label === rel.to);
      
      if (fromNode && toNode) {
        const connections = fromNode.connections || [];
        connections.push({
          target_node_id: toNode.id,
          relationship_type: rel.type,
          strength: rel.strength
        });
        
        await req.base44.entities.KnowledgeGraphNode.update(fromNode.id, {
          connections
        });
      }
    }

    return res.json({
      success: true,
      nodes_created: createdNodes.length,
      relationships_added: knowledge.new_relationships.length,
      graph_updated: true
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}