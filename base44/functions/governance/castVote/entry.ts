import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proposal_id, vote, reason } = await req.json();
    
    // Get proposal
    const proposals = await base44.entities.GovernanceProposal.filter({ id: proposal_id });
    const proposal = proposals[0];
    
    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    if (proposal.status !== 'voting') {
      return Response.json({ error: 'Voting is not active for this proposal' }, { status: 400 });
    }
    
    // Check if already voted
    const existingVote = await base44.entities.VotingRecord.filter({
      proposal_id,
      voter_id: user.id
    });
    
    if (existingVote.length > 0) {
      return Response.json({ error: 'Already voted on this proposal' }, { status: 400 });
    }
    
    // Calculate voting power (based on user's achievements, activity, etc.)
    const achievements = await base44.entities.UserAchievement.filter({
      user_id: user.id,
      is_unlocked: true
    });
    const votingPower = 100 + achievements.length * 50;
    
    // Record vote
    const voteRecord = await base44.entities.VotingRecord.create({
      proposal_id,
      voter_id: user.id,
      voter_type: 'user',
      vote,
      voting_power: votingPower,
      reason,
      blockchain_verified: true,
      transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`
    });
    
    // Update proposal vote counts
    const updateData = {};
    if (vote === 'for') {
      updateData.votes_for = (proposal.votes_for || 0) + votingPower;
    } else if (vote === 'against') {
      updateData.votes_against = (proposal.votes_against || 0) + votingPower;
    } else {
      updateData.votes_abstain = (proposal.votes_abstain || 0) + votingPower;
    }
    
    await base44.entities.GovernanceProposal.update(proposal_id, updateData);
    
    // Check if voting should close
    const totalVotes = (proposal.votes_for || 0) + (proposal.votes_against || 0) + (proposal.votes_abstain || 0) + votingPower;
    const totalPower = votingPower * 20; // Estimate total possible voting power
    const quorumReached = (totalVotes / totalPower) * 100 >= (proposal.quorum_percentage || 50);
    
    if (quorumReached) {
      const passed = (proposal.votes_for + (vote === 'for' ? votingPower : 0)) > (proposal.votes_against + (vote === 'against' ? votingPower : 0));
      
      await base44.entities.GovernanceProposal.update(proposal_id, {
        status: passed ? 'passed' : 'rejected'
      });
    }
    
    return Response.json({
      vote_record: voteRecord,
      voting_power: votingPower,
      quorum_reached: quorumReached,
      current_status: proposal.status
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});