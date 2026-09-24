import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { proposal_id } = await req.json();

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

    // Check if proposal passed
    const totalPower = (proposalData.total_voting_power_for || 0) + (proposalData.total_voting_power_against || 0);
    const approvalRate = totalPower > 0 ? (proposalData.total_voting_power_for / totalPower) : 0;

    if (approvalRate < 0.5) {
      return Response.json({
        success: false,
        message: 'Proposal did not pass (requires >50% voting power)',
        approval_rate: approvalRate
      });
    }

    // Get treasury
    const treasury = await base44.asServiceRole.entities.Treasury.list('', 1);
    const treasuryData = treasury[0];

    if (!treasuryData || treasuryData.balance < proposalData.requested_funds) {
      return Response.json({
        error: 'Insufficient treasury balance',
        available: treasuryData?.balance || 0,
        requested: proposalData.requested_funds
      }, { status: 400 });
    }

    // Execute allocation
    const allocation = {
      proposal_id,
      recipient_id: proposalData.proposer_id,
      recipient_type: proposalData.proposer_type,
      amount: proposalData.requested_funds,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    // Update treasury balance
    await base44.asServiceRole.entities.Treasury.update(treasuryData.id, {
      balance: treasuryData.balance - proposalData.requested_funds,
      allocated_funds: (treasuryData.allocated_funds || 0) + proposalData.requested_funds
    });

    // Simulate on-chain verification
    const blockchainTx = {
      transaction_hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      block_number: Math.floor(Math.random() * 1000000),
      verified_on_chain: true,
      verification_timestamp: new Date().toISOString()
    };

    // Update proposal
    await base44.asServiceRole.entities.GovernanceProposal.update(proposal_id, {
      execution_status: 'executed',
      execution_date: new Date().toISOString(),
      blockchain_verification: blockchainTx
    });

    // Create impact metric baseline
    const impactMetric = await base44.asServiceRole.entities.GovernanceImpactMetric.create({
      proposal_id,
      decision_date: new Date().toISOString(),
      decision_summary: proposalData.proposal_title,
      impact_metrics: {
        agent_performance_change: 0,
        simulation_efficiency_change: 0,
        defi_returns_change: 0,
        security_incidents_change: 0,
        user_satisfaction_change: 0,
        treasury_balance_change: -proposalData.requested_funds
      },
      before_metrics_snapshot: {
        treasury_balance: treasuryData.balance + proposalData.requested_funds
      },
      after_metrics_snapshot: {
        treasury_balance: treasuryData.balance
      },
      time_series_data: [],
      blockchain_verification: blockchainTx,
      ai_impact_assessment: 'Monitoring period initiated',
      sentiment_analysis: {
        user_sentiment: 0,
        agent_sentiment: 0
      }
    });

    return Response.json({
      success: true,
      allocation,
      blockchain_verification: blockchainTx,
      impact_metric: impactMetric,
      treasury_balance: treasuryData.balance
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});