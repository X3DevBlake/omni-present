import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { optimization_name, resource_type, algorithm, current_allocation } = await req.json();

    // AI-powered optimization simulation
    const currentCost = (
      (current_allocation?.cpu_cores || 4) * 0.05 +
      (current_allocation?.memory_gb || 16) * 0.01 +
      (current_allocation?.gpu_count || 0) * 2.5
    );

    const optimizedAllocation = {
      cpu_cores: Math.max(2, current_allocation?.cpu_cores - 1),
      memory_gb: current_allocation?.memory_gb * 0.85,
      gpu_count: current_allocation?.gpu_count,
      storage_gb: current_allocation?.storage_gb || 100
    };

    const optimizedCost = (
      optimizedAllocation.cpu_cores * 0.05 +
      optimizedAllocation.memory_gb * 0.01 +
      (optimizedAllocation.gpu_count || 0) * 2.5
    );

    const optimization = await base44.entities.ResourceOptimization.create({
      optimization_name,
      resource_type,
      optimization_algorithm: algorithm || 'reinforcement_learning',
      current_allocation: current_allocation || { cpu_cores: 4, memory_gb: 16, gpu_count: 0, storage_gb: 100 },
      optimized_allocation: optimizedAllocation,
      workload_prediction: {
        predicted_peak_time: new Date(Date.now() + 7200000).toISOString(),
        predicted_load: 0.7 + Math.random() * 0.25,
        confidence: 0.85 + Math.random() * 0.12
      },
      cost_analysis: {
        current_cost_per_hour: currentCost,
        optimized_cost_per_hour: optimizedCost,
        savings_percentage: ((currentCost - optimizedCost) / currentCost) * 100,
        estimated_monthly_savings: (currentCost - optimizedCost) * 730
      },
      performance_impact: {
        latency_change_ms: -5 + Math.random() * 10,
        throughput_change: -0.02 + Math.random() * 0.05,
        reliability_score: 0.95 + Math.random() * 0.04
      },
      auto_scaling_rules: [
        { metric: 'cpu_usage', threshold: 80, action: 'scale_up' },
        { metric: 'cpu_usage', threshold: 20, action: 'scale_down' },
        { metric: 'memory_usage', threshold: 85, action: 'scale_up' }
      ],
      applied: false
    });

    return Response.json({
      success: true,
      optimization_id: optimization.id,
      optimization,
      potential_savings: optimization.cost_analysis.savings_percentage.toFixed(2) + '%',
      message: `Resource optimization ${optimization_name} completed - ${optimization.cost_analysis.savings_percentage.toFixed(1)}% savings identified`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});