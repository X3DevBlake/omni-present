/**
 * Automatic Performance Tier Assignment
 */

import { base44 } from '@base44/sdk';

export default async function autoTierAssignment(context) {
  const { agent_id } = context.params;

  try {
    const [agent, training, benchmarks, deployments] = await Promise.all([
      base44.asServiceRole.entities.HolographicAgent.get(agent_id),
      base44.asServiceRole.entities.AgentTrainingModule.list({ agent_id }),
      base44.asServiceRole.entities.AgentMarketplaceListing.list({ agent_id }),
      base44.asServiceRole.entities.AgentDeployment.list({ agent_id })
    ]);

    const metrics = {
      training_data_quality: training.length > 0 ? 85 : 50,
      skill_benchmark_avg: benchmarks[0]?.skill_benchmarks ? 
        Object.values(benchmarks[0].skill_benchmarks).reduce((a, b) => a + b, 0) / Object.keys(benchmarks[0].skill_benchmarks).length : 50,
      success_rate: deployments[0]?.performance_metrics?.success_rate || 50,
      efficiency: deployments[0]?.performance_metrics?.success_rate || 50
    };

    const tier_score = (metrics.training_data_quality + metrics.skill_benchmark_avg + metrics.success_rate + metrics.efficiency) / 4;

    let tier;
    if (tier_score >= 90) tier = 'diamond';
    else if (tier_score >= 80) tier = 'platinum';
    else if (tier_score >= 70) tier = 'gold';
    else if (tier_score >= 60) tier = 'silver';
    else tier = 'bronze';

    const tierRecord = await base44.asServiceRole.entities.AgentPerformanceTier.create({
      agent_id,
      tier,
      tier_score,
      metrics,
      auto_assigned: true
    });

    return { success: true, tier, tier_score };
  } catch (error) {
    return { success: false, error: error.message };
  }
}