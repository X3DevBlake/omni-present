import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_requirements, requesting_agent_id } = await req.json();

    // Get all marketplace profiles
    const profiles = await base44.asServiceRole.entities.AgentMarketplaceProfile.list('', 100);

    if (profiles.length === 0) {
      return Response.json({ recommendations: [] });
    }

    // AI recommendation engine
    const recommendations = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As an AI matchmaking specialist, recommend the best agents for this task:

Task Requirements: ${JSON.stringify(task_requirements)}
Requesting Agent: ${requesting_agent_id}

Available Agents:
${profiles.slice(0, 15).map(p => `
- Agent: ${p.agent_id}
  Skills: ${JSON.stringify(p.skills_profile?.slice(0, 3))}
  Success Rate: ${p.performance_history?.success_rate}%
  Collaboration Score: ${p.collaboration_score}
  Price: ${p.pricing_model?.current_price}
  Availability: ${p.availability_score}%
`).join('\n')}

Rank top 5 agents by:
1. Skill match
2. Performance history
3. Collaboration compatibility
4. Pricing fairness
5. Availability

Provide match score (0-100) for each.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                match_score: { type: "number" },
                reasons: { type: "array", items: { type: "string" } },
                estimated_cost: { type: "number" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      recommendations: recommendations.recommendations,
      total_candidates: profiles.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});