import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parallel data fetching
    const [
      agents,
      collaborations,
      transactions,
      stakes,
      behaviors,
      interactions,
      alerts
    ] = await Promise.all([
      base44.entities.Agent.filter({}).limit(150),
      base44.entities.AgentCollaboration.filter({}).limit(100),
      base44.entities.FinancialTransaction.filter({}).limit(150),
      base44.entities.OmniStake.filter({}).limit(200),
      base44.entities.EmergentBehavior.filter({}).limit(75),
      base44.entities.AgentInteraction.filter({}).limit(100),
      base44.entities.AlertHistory.filter({}).limit(50)
    ]);

    // Calculate ecosystem metrics
    const activeAgents = agents.filter(a => a.is_active).length;
    const totalStaked = stakes.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    const totalTransactionVolume = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const collaborationCount = collaborations.length;
    const emergentBehaviorCount = behaviors.length;

    // Calculate growth metrics
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneHourTransactions = transactions.filter(t => new Date(t.created_date) > oneHourAgo).length;

    // Network health
    const avgInteractionLatency = interactions.length > 0
      ? interactions.reduce((sum, i) => sum + (i.latency || 0), 0) / interactions.length
      : 0;

    // Behavior distribution
    const behaviorDistribution = {
      cooperation: behaviors.filter(b => b.behavior_type === 'cooperation').length,
      competition: behaviors.filter(b => b.behavior_type === 'competition').length,
      specialization: behaviors.filter(b => b.behavior_type === 'specialization').length,
      hierarchy: behaviors.filter(b => b.behavior_type === 'hierarchy_formation').length,
      pattern: behaviors.filter(b => b.behavior_type === 'pattern_emergence').length,
      conflict: behaviors.filter(b => b.behavior_type === 'conflict').length
    };

    // Alert summary
    const alertSummary = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length
    };

    // Real-time ecosystem status
    const ecosystemStatus = {
      health: Math.min(100, 85 + (activeAgents / agents.length) * 15),
      efficiency: Math.min(100, 80 + (collaborationCount / 50) * 10),
      growth: ((oneHourTransactions / transactions.length) * 100).toFixed(2),
      networkLatency: avgInteractionLatency.toFixed(2)
    };

    return Response.json({
      timestamp: now.toISOString(),
      ecosystem: {
        agents: {
          total: agents.length,
          active: activeAgents,
          inActive: agents.length - activeAgents
        },
        collaborations: collaborationCount,
        transactions: {
          total: transactions.length,
          volume: totalTransactionVolume.toFixed(2),
          lastHour: oneHourTransactions
        },
        staking: {
          total: totalStaked.toFixed(2),
          participants: new Set(stakes.map(s => s.user_email)).size,
          avgStakeSize: (totalStaked / stakes.length).toFixed(2)
        },
        behaviors: {
          total: emergentBehaviorCount,
          distribution: behaviorDistribution,
          highConfidence: behaviors.filter(b => (b.confidence_score || 0) > 85).length
        },
        alerts: alertSummary,
        health: ecosystemStatus
      },
      recentEvents: {
        interactions: interactions.slice(0, 10),
        transactions: transactions.slice(0, 10),
        behaviors: behaviors.slice(0, 5),
        alerts: alerts.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error aggregating ecosystem data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});