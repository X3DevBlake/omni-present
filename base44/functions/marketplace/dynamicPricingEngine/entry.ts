import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, task_complexity } = await req.json();
    
    // Get pricing model
    const pricingModels = await base44.entities.AgentPricingModel.filter({ agent_id });
    const pricingModel = pricingModels[0];
    
    if (!pricingModel) {
      return Response.json({ error: 'Pricing model not found' }, { status: 404 });
    }
    
    // Get agent profile for reputation
    const profiles = await base44.entities.AgentProfile.filter({ agent_id });
    const profile = profiles[0];
    
    // Get marketplace data for current demand
    const marketplaceProfiles = await base44.entities.AgentMarketplaceProfile.filter({ agent_id });
    const marketData = marketplaceProfiles[0];
    
    // Get current task assignments to assess workload
    const activeTasks = await base44.entities.AgentTaskAssignment.filter({
      agent_id,
      status: 'in_progress'
    });
    
    // Calculate dynamic multipliers
    const workloadFactor = activeTasks.length / (profile?.max_concurrent_tasks || 5);
    const demandMultiplier = 1 + (workloadFactor * 0.3); // Up to 30% increase based on workload
    
    const complexityMultiplier = task_complexity === 'high' ? 1.5 : 
                                 task_complexity === 'medium' ? 1.2 : 1.0;
    
    const reputationScore = marketData?.recommendation_score || 50;
    const reputationMultiplier = 1 + ((reputationScore - 50) / 100); // ±50% based on reputation
    
    // Calculate effective rate
    const baseRate = pricingModel.base_hourly_rate;
    const effectiveRate = baseRate * 
                         demandMultiplier * 
                         complexityMultiplier * 
                         reputationMultiplier;
    
    // Update pricing model
    await base44.entities.AgentPricingModel.update(pricingModel.id, {
      demand_multiplier: demandMultiplier,
      complexity_multiplier: complexityMultiplier,
      reputation_multiplier: reputationMultiplier,
      current_effective_rate: Math.round(effectiveRate * 100) / 100,
      pricing_history: [
        ...(pricingModel.pricing_history || []),
        {
          timestamp: new Date().toISOString(),
          rate: effectiveRate,
          reason: `Demand: ${demandMultiplier.toFixed(2)}x, Complexity: ${complexityMultiplier}x, Reputation: ${reputationMultiplier.toFixed(2)}x`
        }
      ].slice(-50) // Keep last 50 entries
    });
    
    return Response.json({
      agent_id,
      base_rate: baseRate,
      effective_rate: effectiveRate,
      multipliers: {
        demand: demandMultiplier,
        complexity: complexityMultiplier,
        reputation: reputationMultiplier
      },
      breakdown: {
        current_workload: activeTasks.length,
        max_capacity: profile?.max_concurrent_tasks || 5,
        reputation_score: reputationScore
      }
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});