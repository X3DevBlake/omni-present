export default async function knowledgeGraphReasoning(data, context) {
  const { query, reasoning_depth = 3, user_email } = data;
  
  const knowledgeNodes = await context.entities.KnowledgeGraphNode.filter({
    $or: [{ created_by: user_email }, { is_public: true }]
  }).limit(200);
  
  const sharedKnowledge = await context.entities.SharedKnowledge.filter({}).limit(50);
  
  const reasoning = await context.integrations.Core.InvokeLLM({
    prompt: `Perform graph-based reasoning over knowledge base:

Query: ${query}
Reasoning Depth: ${reasoning_depth} hops

Knowledge Graph:
${knowledgeNodes.slice(0, 30).map(n => `- ${n.node_type}: ${n.content} (Connections: ${n.connected_nodes?.length || 0})`).join('\n')}

Shared Knowledge:
${sharedKnowledge.slice(0, 10).map(k => k.knowledge_topic).join(', ')}

Perform multi-hop reasoning to:
1. Traverse knowledge graph
2. Find relevant connections
3. Infer implicit knowledge
4. Identify knowledge gaps
5. Generate insights
6. Suggest new connections`,
    response_json_schema: {
      type: "object",
      properties: {
        reasoning_path: {
          type: "array",
          items: {
            type: "object",
            properties: {
              hop: { type: "number" },
              node_id: { type: "string" },
              reasoning: { type: "string" },
              confidence: { type: "number" }
            }
          }
        },
        inferred_knowledge: { type: "array", items: { type: "string" } },
        knowledge_gaps: { type: "array", items: { type: "string" } },
        suggested_connections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              from_node: { type: "string" },
              to_node: { type: "string" },
              relationship: { type: "string" },
              confidence: { type: "number" }
            }
          }
        },
        final_answer: { type: "string" },
        confidence_score: { type: "number" }
      }
    }
  });
  
  for (const connection of reasoning.suggested_connections) {
    if (connection.confidence > 0.7) {
      const fromNode = knowledgeNodes.find(n => n.id === connection.from_node);
      if (fromNode) {
        await context.entities.KnowledgeGraphNode.update(fromNode.id, {
          connected_nodes: [...(fromNode.connected_nodes || []), connection.to_node],
          relationships: {
            ...(fromNode.relationships || {}),
            [connection.to_node]: connection.relationship
          }
        });
      }
    }
  }
  
  await context.entities.KnowledgeInsight.create({
    insight_type: 'graph_reasoning',
    query,
    reasoning_path: reasoning.reasoning_path,
    insights: reasoning.inferred_knowledge,
    confidence: reasoning.confidence_score
  });
  
  return {
    reasoning,
    hops_traversed: reasoning.reasoning_path.length,
    connections_suggested: reasoning.suggested_connections.length
  };
}