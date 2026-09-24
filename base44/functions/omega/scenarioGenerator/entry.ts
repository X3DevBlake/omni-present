import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_count, cooperation_factor, challenge_type } = await req.json();

    // AI-powered scenario generation
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a challenging multi-agent simulation scenario with ${agent_count} agents, cooperation factor of ${cooperation_factor}, and challenge type: ${challenge_type}. 
      
      The scenario should test collective intelligence, emergent behavior, and swarm coordination.
      
      Include:
      1. A clear challenge description
      2. Expected agent behaviors
      3. Predicted outcome
      4. Success criteria`,
      response_json_schema: {
        type: 'object',
        properties: {
          challenge_description: { type: 'string' },
          challenge_complexity: { type: 'number' },
          predicted_outcome: { type: 'string' },
          success_probability: { type: 'number' },
          emergent_goals_count: { type: 'integer' },
          collective_intelligence_score: { type: 'number' }
        }
      }
    });

    const agents = Array.from({ length: agent_count }, (_, idx) => ({
      agent_id: `sim_agent_${idx}`,
      behavior: {
        speed: 0.5 + Math.random() * 0.5,
        cooperation: cooperation_factor + (Math.random() - 0.5) * 0.2,
        risk_tolerance: Math.random()
      },
      state: idx % 3 === 0 ? 'exploring' : idx % 3 === 1 ? 'collaborating' : 'optimizing'
    }));

    return Response.json({
      ...llmResponse,
      agents,
      scenario_id: `scenario_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});