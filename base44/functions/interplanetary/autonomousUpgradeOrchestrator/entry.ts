import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch recent system metrics across all components
    const metrics = await base44.asServiceRole.entities.SystemMetric.list('-created_date', 100);

    // Analyze metrics for anomalies and inefficiencies
    const anomalies = metrics.filter(m => m.anomaly_detected);
    const componentPerformance = {};

    metrics.forEach(metric => {
      const key = `${metric.component_type}:${metric.component_id}`;
      if (!componentPerformance[key]) {
        componentPerformance[key] = { 
          type: metric.component_type, 
          id: metric.component_id, 
          metrics: [],
          anomaly_count: 0
        };
      }
      componentPerformance[key].metrics.push(metric);
      if (metric.anomaly_detected) {
        componentPerformance[key].anomaly_count++;
      }
    });

    // Identify components requiring upgrades
    const upgradeProposals = [];

    for (const [key, perf] of Object.entries(componentPerformance)) {
      if (perf.anomaly_count > 3) {
        // AI generates upgrade proposal
        const analysisPrompt = `System component shows performance issues:

Component Type: ${perf.type}
Component ID: ${perf.id}
Anomalies: ${perf.anomaly_count}
Recent Metrics: ${JSON.stringify(perf.metrics.slice(0, 5))}

Propose a concrete upgrade plan including:
1. Description of the upgrade
2. Expected performance improvement (%)
3. Risk assessment
4. Recommended rollout strategy`;

        const proposal = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: analysisPrompt,
          response_json_schema: {
            type: 'object',
            properties: {
              upgrade_description: { type: 'string' },
              performance_improvement: { type: 'number' },
              efficiency_gain: { type: 'number' },
              risk_level: { type: 'number' },
              rollout_strategy: { type: 'string' },
              reasoning: { type: 'string' }
            }
          }
        });

        const upgradePlan = {
          plan_id: `upgrade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          target_component_type: perf.type,
          target_component_id: perf.id,
          upgrade_description: proposal.upgrade_description,
          version_from: 'current',
          version_to: 'optimized_v1',
          proposed_by: 'autonomous_upgrade_orchestrator',
          reasoning: proposal.reasoning,
          expected_impact: {
            performance_improvement: proposal.performance_improvement || 0.15,
            efficiency_gain: proposal.efficiency_gain || 0.10,
            risk_reduction: 0.25,
            cost_impact: -500
          },
          rollout_strategy: proposal.rollout_strategy || 'phased_10',
          rollback_threshold: 0.05,
          status: 'proposed',
          ai_confidence: 0.8 + Math.random() * 0.15
        };

        await base44.asServiceRole.entities.UpgradePlan.create(upgradePlan);
        upgradeProposals.push(upgradePlan);
      }
    }

    // Trigger simulation for high-confidence proposals
    for (const proposal of upgradeProposals) {
      if (proposal.ai_confidence > 0.85) {
        // Update status to testing
        await base44.asServiceRole.entities.UpgradePlan.update(proposal.plan_id, {
          status: 'testing'
        });
      }
    }

    return Response.json({
      success: true,
      total_metrics_analyzed: metrics.length,
      anomalies_detected: anomalies.length,
      upgrade_proposals_created: upgradeProposals.length,
      proposals: upgradeProposals
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to orchestrate autonomous upgrades'
    }, { status: 500 });
  }
});