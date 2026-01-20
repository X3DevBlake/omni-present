import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, knowledge_type, content, tags } = await req.json();

    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze knowledge contribution:

Type: ${knowledge_type}
Content: ${content}

Generate:
1. Relevance score (0-100)
2. Impact prediction
3. Suggested tags
4. Verification status

Evaluate: usefulness, accuracy, novelty`,
      response_json_schema: {
        type: "object",
        properties: {
          relevance_score: {type: "number"},
          impact_score: {type: "number"},
          suggested_tags: {type: "array", items: {type: "string"}},
          verified: {type: "boolean"}
        }
      }
    });

    const knowledgeData = {
      knowledge_id: `kb_${Date.now()}`,
      agent_id,
      knowledge_type,
      content,
      context: { posted_at: new Date().toISOString() },
      relevance_score: analysisResult.relevance_score || 75,
      access_count: 0,
      contributing_agents: [agent_id],
      tags: tags || analysisResult.suggested_tags || [],
      verified: analysisResult.verified || false,
      impact_score: analysisResult.impact_score || 0
    };

    const knowledge = await base44.entities.SharedKnowledgeBase.create(knowledgeData);

    return Response.json({
      success: true,
      knowledge,
      relevance: knowledgeData.relevance_score
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});