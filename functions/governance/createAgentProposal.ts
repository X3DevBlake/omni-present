import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, proposal_title, proposal_description, requested_treasury_amount } = await req.json();

    // Get agent reputation for voting power calculation
    const agentReputation = await base44.asServiceRole.entities.AgentReputation.filter(
      { agent_id },
      '',
      1
    );
    const reputation = agentReputation[0];

    // Calculate reputation-based voting power (0-100 scale)
    const votingPower = Math.min(100, (reputation?.reputation_score || 50) / 10);

    // Create governance proposal
    const proposal = await base44.asServiceRole.entities.GovernanceProposal.create({
      proposal_title,
      proposal_description,
      proposal_type: 'agent_initiated',
      proposer_type: 'agent',
      proposer_id: agent_id,
      voting_power: votingPower,
      requested_funds: requested_treasury_amount || 0,
      status: 'active',
      votes_for: 0,
      votes_against: 0,
      total_voting_power_for: 0,
      total_voting_power_against: 0,
      voting_start: new Date().toISOString(),
      voting_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      execution_status: 'pending',
      blockchain_verification: {
        verified_on_chain: false
      }
    });

    return Response.json({
      success: true,
      proposal,
      agent_voting_power: votingPower
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});