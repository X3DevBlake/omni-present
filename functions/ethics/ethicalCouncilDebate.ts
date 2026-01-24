import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proposal_id } = await req.json();

    // Fetch proposal
    const proposals = await base44.entities.EthicalProposal.filter({ proposal_id });
    if (!proposals || proposals.length === 0) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposal = proposals[0];

    // Fetch council members
    const councilMembers = await base44.entities.EthicalCouncilMember.list();

    // Gather cross-domain insights
    const knowledgeClusters = await base44.entities.FusedKnowledgeCluster.list('-created_date', 5);
    const swarmConfigs = await base44.entities.SwarmConfiguration.list('-created_date', 3);

    // Each council member debates
    const debateLog = [];
    const votes = { approve: 0, reject: 0, abstain: 0 };

    for (const member of councilMembers) {
      const debatePrompt = `You are ${member.ai_agent_name}, an AI Council member specialized in ${member.specialization}.

Ethical Proposal:
Type: ${proposal.proposal_type}
Changes: ${JSON.stringify(proposal.proposed_changes)}
Evidence: ${JSON.stringify(proposal.supporting_evidence)}

Cross-Domain Context:
- Recent Knowledge Insights: ${knowledgeClusters.slice(0, 2).map(k => k.fused_content?.ai_summary).join('; ')}
- Swarm Performance: ${swarmConfigs.slice(0, 2).map(s => `${s.mission_objective}: efficiency ${s.optimization_metrics?.predicted_efficiency}`).join('; ')}

Provide:
1. Your position (approve/reject/abstain)
2. Detailed reasoning from your ethical perspective`;

      const debate = await base44.integrations.Core.InvokeLLM({
        prompt: debatePrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            vote: { type: 'string', enum: ['approve', 'reject', 'abstain'] },
            statement: { type: 'string' }
          }
        }
      });

      debateLog.push({
        member_id: member.member_id,
        statement: debate.statement,
        stance: debate.vote
      });

      votes[debate.vote]++;

      // Update member voting history
      const updatedHistory = [
        ...(member.voting_history || []),
        {
          proposal_id,
          vote: debate.vote,
          reasoning: debate.statement
        }
      ];
      await base44.entities.EthicalCouncilMember.update(member.id, {
        voting_history: updatedHistory
      });
    }

    // Determine outcome
    const totalVotes = votes.approve + votes.reject + votes.abstain;
    const approvalRate = votes.approve / totalVotes;
    const status = approvalRate > 0.6 ? 'approved' : 'rejected';

    // Simulate impact on operations
    const impactSimulation = {
      swarm_performance_delta: approvalRate * 0.15 - 0.05,
      planetary_ops_delta: approvalRate * 0.12 - 0.03,
      ethical_score_delta: approvalRate * 0.25
    };

    // Update proposal
    await base44.entities.EthicalProposal.update(proposal.id, {
      council_debate_log: debateLog,
      votes,
      status,
      impact_simulation_results: impactSimulation
    });

    return Response.json({
      success: true,
      proposal_id,
      debate_log: debateLog,
      votes,
      outcome: status,
      impact_simulation: impactSimulation
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to conduct ethical council debate'
    }, { status: 500 });
  }
});