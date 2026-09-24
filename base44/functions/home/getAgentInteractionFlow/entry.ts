import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [agents, interactions, communications] = await Promise.all([
      base44.entities.Agent.filter({ created_by: user.email }),
      base44.entities.AgentInteractionLog.list('-created_date', 50),
      base44.entities.AgentCommunication.filter({ is_active: true })
    ]);

    const interactionMap = new Map();
    
    interactions.forEach(int => {
      const key = `${int.source_agent_id}-${int.target_agent_id}`;
      if (!interactionMap.has(key)) {
        interactionMap.set(key, {
          source_agent_id: int.source_agent_id,
          target_agent_id: int.target_agent_id,
          interaction_count: 0,
          interaction_types: [],
          is_active: false,
          last_interaction: int.created_date
        });
      }
      
      const entry = interactionMap.get(key);
      entry.interaction_count += 1;
      if (int.interaction_type && !entry.interaction_types.includes(int.interaction_type)) {
        entry.interaction_types.push(int.interaction_type);
      }
      
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (new Date(int.created_date) > hourAgo) {
        entry.is_active = true;
      }
    });

    const flowData = Array.from(interactionMap.values());

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze agent interaction patterns: ${agents.length} agents, ${flowData.length} interaction paths, ${flowData.filter(f => f.is_active).length} currently active. Provide brief insights about collaboration patterns and bottlenecks.`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: { type: "string" }
          },
          bottlenecks: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      agents: agents.map(a => ({
        id: a.id,
        name: a.name || `Agent-${a.id.slice(0, 6)}`,
        status: a.status || 'active',
        created_date: a.created_date
      })),
      interactions: flowData,
      insights: aiAnalysis.insights,
      bottlenecks: aiAnalysis.bottlenecks,
      message: 'Agent interaction flow generated'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});