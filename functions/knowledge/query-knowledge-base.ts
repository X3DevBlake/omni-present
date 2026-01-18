export default async function queryKnowledgeBase(data, context) {
  const { agent_id, query, top_k = 5 } = data;
  
  const knowledge = await context.entities.AgentKnowledge.filter({
    agent_id
  }).sort('-relevance_score').limit(50);
  
  const sharedKnowledge = await context.entities.SharedKnowledge.filter({
    agent_ids: { $contains: agent_id }
  }).limit(20);
  
  const allKnowledge = [...knowledge, ...sharedKnowledge];
  
  const relevantKnowledge = await context.integrations.Core.InvokeLLM({
    prompt: `Find the most relevant knowledge for this query:
Query: ${query}

Available knowledge:
${allKnowledge.map((k, i) => `${i + 1}. ${k?.content || k?.knowledge_content || ''} (Source: ${k?.publisher_agent_id || 'unknown'})`).join('\n')}

Return the top ${top_k} most relevant pieces with relevance scores.`,
    response_json_schema: {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              knowledge_id: { type: "string" },
              content: { type: "string" },
              relevance_score: { type: "number" },
              reasoning: { type: "string" }
            }
          }
        }
      }
    }
  });
  
  return relevantKnowledge;
}