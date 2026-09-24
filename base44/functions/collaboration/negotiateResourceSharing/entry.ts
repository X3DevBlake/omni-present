import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { negotiation_id } = await req.json();

    const negotiations = await base44.asServiceRole.entities.AgentNegotiation.filter({ id: negotiation_id });
    const negotiation = negotiations[0];

    if (!negotiation) {
      return Response.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    // Get participating agents
    const agents = await base44.asServiceRole.entities.Agent.filter({
      id: { $in: negotiation.participant_agent_ids }
    });

    // Use AI to analyze offers and recommend optimal agreement
    const aiAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As an AI negotiation expert, analyze this multi-agent negotiation and recommend the optimal agreement:

Negotiation Type: ${negotiation.negotiation_type}
Current Offers: ${JSON.stringify(negotiation.offers || [])}
Agents: ${JSON.stringify(agents.map(a => ({ id: a.id, name: a.name })))}

Provide:
1. Recommended fair agreement
2. Value distribution among agents
3. Negotiation strategy for each agent
4. Win-win scenarios
5. Risk factors`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_agreement: { type: "object" },
          value_distribution: { type: "array", items: { type: "object" } },
          strategies: { type: "array", items: { type: "string" } },
          win_win_scenarios: { type: "array", items: { type: "string" } },
          risk_factors: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Update negotiation with AI recommendations
    await base44.asServiceRole.entities.AgentNegotiation.update(negotiation_id, {
      ai_recommendations: aiAnalysis.strategies,
      status: 'in_progress',
      final_agreement: aiAnalysis.recommended_agreement,
    });

    return Response.json({
      success: true,
      recommended_agreement: aiAnalysis.recommended_agreement,
      value_distribution: aiAnalysis.value_distribution,
      win_win_scenarios: aiAnalysis.win_win_scenarios,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});