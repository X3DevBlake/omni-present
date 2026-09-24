import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { swarm_id, prediction_horizon_hours } = await req.json();

    const swarms = await base44.entities.AgentSwarmHierarchy.filter({ swarm_id });
    const swarm = swarms[0];

    if (!swarm) {
      return Response.json({ error: 'Swarm not found' }, { status: 404 });
    }

    // Historical performance simulation
    const historical_performance = [0.65, 0.68, 0.72, 0.75, 0.78, 0.80];
    const current_capability = swarm.recursive_capability_Cs || 0.78;

    // AI prediction
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict swarm performance for the next ${prediction_horizon_hours} hours based on:
      - Current capability: ${current_capability}
      - Historical trend: ${historical_performance.join(', ')}
      - Active agents: ${swarm.hierarchy_levels?.flatMap(l => l.agent_ids || []).length || 0}
      
      Identify potential bottlenecks and provide recommendations.`,
      response_json_schema: {
        type: 'object',
        properties: {
          predicted_performance: { type: 'array', items: { type: 'number' } },
          forecast_24h: { type: 'number' },
          bottlenecks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                time_offset: { type: 'number' },
                severity: { type: 'number' }
              }
            }
          },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({
      current_performance: current_capability,
      historical_performance,
      ...llmResponse,
      analysis_timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});