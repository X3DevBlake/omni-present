import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (data.relevance_score > 70) {
      const relatedAgents = await base44.asServiceRole.entities.AgentOrchestration.filter({});
      
      for (const orchestration of relatedAgents) {
        if (orchestration.participating_agents?.some(a => a.agent_id !== data.agent_id)) {
          await base44.functions.invoke('postKnowledge', {
            orchestration_id: orchestration.id,
            knowledge_entry: {
              type: data.knowledge_type,
              content: data.content,
              tags: data.tags
            }
          });
        }
      }
    }

    await base44.asServiceRole.entities.SharedKnowledgeBase.update(event.entity_id, {
      access_count: (data.access_count || 0) + 1
    });

    return Response.json({ success: true, synced: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});