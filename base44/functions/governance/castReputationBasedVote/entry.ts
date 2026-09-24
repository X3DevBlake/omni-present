import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proposal_id, voter_id, voter_type, vote_choice } = await req.json();

    // Get proposal
    const proposal = await base44.asServiceRole.entities.GovernanceProposal.filter(
      { id: proposal_id },
      '',
      1
    );
    const proposalData = proposal[0];

    if (!proposalData) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Calculate voting power based on voter type
    let votingPower = 1;
    
    if (voter_type === 'agent') {
      const agentReputation = await base44.asServiceRole.entities.AgentReputation.filter(
        { agent_id: voter_id },
        '',
        1
      );
      const reputation = agentReputation[0];
      votingPower = Math.min(100, (reputation?.reputation_score || 50) / 10);
    } else if (voter_type === 'user') {
      // User voting power could be based on holdings, activity, etc.
      votingPower = user.role === 'admin' ? 50 : 10;
    }

    // Record vote
    const voteRecord = await base44.asServiceRole.entities.VotingRecord.create({
      proposal_id,
      voter_id,
      voter_type,
      vote_choice,
      voting_power: votingPower,
      vote_timestamp: new Date().toISOString()
    });

    // Update proposal vote counts
    const updatedVotesFor = vote_choice === 'for' 
      ? (proposalData.votes_for || 0) + 1 
      : proposalData.votes_for || 0;
    const updatedVotesAgainst = vote_choice === 'against' 
      ? (proposalData.votes_against || 0) + 1 
      : proposalData.votes_against || 0;
    const updatedPowerFor = vote_choice === 'for'
      ? (proposalData.total_voting_power_for || 0) + votingPower
      : proposalData.total_voting_power_for || 0;
    const updatedPowerAgainst = vote_choice === 'against'
      ? (proposalData.total_voting_power_against || 0) + votingPower
      : proposalData.total_voting_power_against || 0;

    await base44.asServiceRole.entities.GovernanceProposal.update(proposal_id, {
      votes_for: updatedVotesFor,
      votes_against: updatedVotesAgainst,
      total_voting_power_for: updatedPowerFor,
      total_voting_power_against: updatedPowerAgainst
    });

    return Response.json({
      success: true,
      vote_record: voteRecord,
      voting_power: votingPower,
      proposal_status: {
        votes_for: updatedVotesFor,
        votes_against: updatedVotesAgainst,
        power_for: updatedPowerFor,
        power_against: updatedPowerAgainst
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});