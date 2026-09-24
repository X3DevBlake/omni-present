import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { negotiation_type, agent_ids, protocol } = await req.json();

    const participating_agents = agent_ids?.map(id => ({
      agent_id: id,
      initial_position: { value: Math.random() * 100 },
      current_position: { value: Math.random() * 100 },
      concessions_made: 0
    })) || [];

    const negotiation = await base44.entities.AgentNegotiation.create({
      negotiation_id: `neg_${Date.now()}`,
      negotiation_type,
      participating_agents,
      negotiation_protocol: protocol || 'ai_mediated',
      rounds_completed: 0,
      max_rounds: 10,
      current_offers: [],
      negotiation_history: [],
      status: 'in_progress',
      final_agreement: null,
      pareto_efficient: false,
      fairness_score: 0,
      mediator_agent: protocol === 'ai_mediated' ? 'mediator_ai' : null
    });

    // Simulate negotiation rounds
    for (let round = 1; round <= 3; round++) {
      setTimeout(async () => {
        const agreement_reached = round === 3;
        
        await base44.asServiceRole.entities.AgentNegotiation.update(negotiation.id, {
          rounds_completed: round,
          status: agreement_reached ? 'agreement_reached' : 'in_progress',
          final_agreement: agreement_reached ? {
            terms: 'Mutually beneficial agreement',
            value: 75 + Math.random() * 20
          } : null,
          pareto_efficient: agreement_reached ? true : false,
          fairness_score: agreement_reached ? 0.85 + Math.random() * 0.12 : 0
        });
      }, round * 2000);
    }

    return Response.json({
      success: true,
      negotiation_id: negotiation.id,
      negotiation,
      message: `Negotiation started between ${agent_ids?.length} agents using ${protocol} protocol`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});