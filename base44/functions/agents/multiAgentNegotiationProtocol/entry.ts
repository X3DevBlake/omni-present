import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'initiate_negotiation') {
      const { agent_ids, subject, resource_contested } = await req.json();

      const agents = await base44.entities.Agent.filter({ 
        agent_id: { $in: agent_ids } 
      });

      // AI negotiation setup
      const negotiationSetup = await base44.integrations.Core.InvokeLLM({
        prompt: `${agents.length} AI agents need to negotiate over: ${resource_contested}. Generate initial positions for each agent, priority scores, and flexibility levels. Use game theory principles.`,
        response_json_schema: {
          type: 'object',
          properties: {
            positions: { type: 'array', items: { type: 'object' } },
            complexity: { type: 'number' }
          }
        }
      });

      const negotiation = await base44.entities.AgentNegotiationProtocol.create({
        participating_agents: agents.map((agent, idx) => ({
          agent_id: agent.agent_id,
          negotiation_position: negotiationSetup.positions[idx]?.position || 'moderate',
          priority_score: 0.5 + Math.random() * 0.5,
          flexibility_level: Math.random()
        })),
        negotiation_subject: {
          subject_type: subject,
          resource_contested: resource_contested,
          stakes: 'medium',
          complexity: negotiationSetup.complexity
        },
        negotiation_rounds: [],
        ai_mediation: {
          mediator_enabled: true,
          fairness_score: 0.8,
          suggested_compromises: [],
          bias_detection: {}
        },
        game_theory_analysis: {
          nash_equilibrium: {},
          pareto_efficiency: 0.75,
          cooperative_potential: 0.8
        },
        negotiation_outcome: 'stalemate'
      });

      return Response.json({
        success: true,
        negotiation: negotiation,
        message: `Negotiation initiated between ${agents.length} agents`
      });
    }

    if (action === 'execute_round') {
      const { negotiation_id } = await req.json();

      const negotiations = await base44.entities.AgentNegotiationProtocol.filter({ negotiation_id });
      const negotiation = negotiations[0];

      if (!negotiation) {
        return Response.json({ error: 'Negotiation not found' }, { status: 404 });
      }

      const roundNumber = (negotiation.negotiation_rounds?.length || 0) + 1;

      // AI negotiation round
      const roundResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Round ${roundNumber} of negotiation. Generate proposals, counteroffers, and consensus score (0-1) for ${negotiation.participating_agents.length} agents negotiating over ${negotiation.negotiation_subject.resource_contested}.`,
        response_json_schema: {
          type: 'object',
          properties: {
            proposals: { type: 'array', items: { type: 'string' } },
            counteroffers: { type: 'array', items: { type: 'string' } },
            consensus_score: { type: 'number' }
          }
        }
      });

      const newRound = {
        round_number: roundNumber,
        proposals: roundResult.proposals,
        counteroffers: roundResult.counteroffers,
        consensus_score: roundResult.consensus_score
      };

      const updatedRounds = [...(negotiation.negotiation_rounds || []), newRound];

      await base44.entities.AgentNegotiationProtocol.update(negotiation.id, {
        negotiation_rounds: updatedRounds,
        negotiation_outcome: roundResult.consensus_score > 0.8 ? 'agreement' :
                            roundResult.consensus_score > 0.6 ? 'partial_agreement' :
                            'stalemate'
      });

      return Response.json({
        success: true,
        round_result: newRound,
        consensus: roundResult.consensus_score
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});