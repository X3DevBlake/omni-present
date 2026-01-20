import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, query, knowledge_types } = await req.json();

    let allKnowledge = await base44.entities.SharedKnowledgeBase.list('-relevance_score', 100);

    if (knowledge_types && knowledge_types.length > 0) {
      allKnowledge = allKnowledge.filter(k => knowledge_types.includes(k.knowledge_type));
    }

    const relevantKnowledge = await base44.integrations.Core.InvokeLLM({
      prompt: `Find relevant knowledge for query: "${query}"

Available knowledge entries: ${JSON.stringify(allKnowledge.slice(0, 10).map(k => ({
  id: k.knowledge_id,
  type: k.knowledge_type,
  content: k.content.substring(0, 200),
  relevance: k.relevance_score
})))}

Return the top 5 most relevant knowledge IDs`,
      response_json_schema: {
        type: "object",
        properties: {
          relevant_ids: {type: "array", items: {type: "string"}}
        }
      }
    });

    const results = allKnowledge.filter(k => 
      relevantKnowledge.relevant_ids?.includes(k.knowledge_id)
    );

    for (const k of results) {
      await base44.entities.SharedKnowledgeBase.update(k.id, {
        access_count: (k.access_count || 0) + 1,
        contributing_agents: [...new Set([...(k.contributing_agents || []), agent_id])]
      });
    }

    return Response.json({
      success: true,
      knowledge: results,
      count: results.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});