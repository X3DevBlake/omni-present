import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Get agent reputation
    const reputation = await base44.asServiceRole.entities.AgentReputation.filter({
      agent_id
    });

    const reputationData = reputation[0] || {};

    // Create blockchain transaction record (simulated)
    const blockchainHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    
    // Calculate reputation tier
    const score = reputationData.overall_score || 50;
    let tier = 'bronze';
    if (score >= 90) tier = 'diamond';
    else if (score >= 75) tier = 'platinum';
    else if (score >= 60) tier = 'gold';
    else if (score >= 40) tier = 'silver';

    // Create immutable record
    const record = await base44.asServiceRole.entities.DecentralizedReputationRecord.create({
      agent_id,
      blockchain_hash: blockchainHash,
      reputation_score: score,
      reputation_tier: tier,
      performance_data: {
        total_tasks: reputationData.total_transactions || 0,
        success_rate: reputationData.successful_transactions || 0,
        avg_rating: reputationData.marketplace_rating || 0
      },
      reviews: [],
      verification_status: 'verified',
      timestamp: new Date().toISOString()
    });

    // Broadcast to event bus
    await base44.functions.invoke('webhooks/globalEventBus', {
      event_type: 'reputation_recorded',
      event_data: {
        agent_id,
        blockchain_hash: blockchainHash,
        reputation_score: score,
        tier
      }
    });

    return Response.json({ 
      success: true,
      record,
      blockchain_hash: blockchainHash
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});