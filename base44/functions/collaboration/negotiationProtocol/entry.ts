import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, agent_ids, resources, negotiation_id } = await req.json();

    if (action === 'initiate_negotiation') {
      // Get agent data
      const agents = await Promise.all(
        (agent_ids || []).map(async (id) => {
          try {
            const agent = await base44.entities.Agent.get(id);
            return {
              agent_id: id,
              agent_name: agent.name || 'Agent',
              negotiation_stance: ['cooperative', 'competitive', 'balanced'][Math.floor(Math.random() * 3)],
              resource_priority: resources[Math.floor(Math.random() * resources.length)]?.resource_type || 'CPU'
            };
          } catch {
            return null;
          }
        })
      );

      const validAgents = agents.filter(a => a !== null);

      // Generate initial proposals
      const proposals = validAgents.map(agent => ({
        proposing_agent: agent.agent_name,
        proposal_terms: `Request ${Math.floor(Math.random() * 50 + 20)}% of ${agent.resource_priority}`,
        value_score: Math.random(),
        status: 'pending'
      }));

      const negotiationData = {
        negotiation_id: negotiation_id || `negotiation_${Date.now()}`,
        participating_agents: validAgents,
        resources_negotiating: resources || [
          { resource_type: 'CPU', quantity: 100 },
          { resource_type: 'Memory', quantity: 500 },
          { resource_type: 'Storage', quantity: 1000 }
        ],
        proposals,
        negotiation_status: 'negotiating',
        fairness_score: 0.8,
        rounds_completed: 0
      };

      return Response.json({
        success: true,
        negotiation_data: negotiationData,
        message: 'Negotiation initiated successfully'
      });
    }

    if (action === 'execute_negotiation_round') {
      // Simulate negotiation round with AI-driven proposals
      const updatedProposals = [
        {
          proposing_agent: 'Agent Alpha',
          proposal_terms: 'Request 35% CPU, offer 20% storage in exchange',
          value_score: 0.75,
          status: 'accepted'
        },
        {
          proposing_agent: 'Agent Beta',
          proposal_terms: 'Request 40% Memory, offer coordination services',
          value_score: 0.68,
          status: 'pending'
        }
      ];

      const fairnessScore = updatedProposals.reduce((sum, p) => sum + p.value_score, 0) / updatedProposals.length;

      const result = {
        updated_proposals: updatedProposals,
        fairness_score: fairnessScore,
        status: fairnessScore > 0.7 ? 'agreement_reached' : 'negotiating',
        allocation: {
          'Agent Alpha': { CPU: 35, Storage: -20 },
          'Agent Beta': { Memory: 40 }
        }
      };

      return Response.json({
        success: true,
        result,
        message: 'Negotiation round executed'
      });
    }

    if (action === 'analyze_fairness') {
      // Analyze negotiation fairness and suggest improvements
      const analysis = {
        overall_fairness: Math.random() * 0.3 + 0.7,
        equity_score: Math.random() * 0.3 + 0.7,
        pareto_efficiency: Math.random() * 0.3 + 0.65,
        recommendations: [
          'Consider mutual gain opportunities',
          'Implement tiered resource allocation',
          'Enable dynamic priority adjustments'
        ]
      };

      return Response.json({
        success: true,
        analysis,
        message: 'Fairness analysis complete'
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});