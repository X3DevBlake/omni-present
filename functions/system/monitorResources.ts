import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const deployments = await base44.asServiceRole.entities.ModelDeployment.filter({
      deployment_status: 'active'
    });

    let totalCPU = 0, totalMemory = 0, totalCost = 0;
    const highUsage = [];

    for (const dep of deployments) {
      totalCPU += dep.resource_usage?.cpu_utilization || 0;
      totalMemory += dep.resource_usage?.memory_usage_gb || 0;
      totalCost += dep.cost_per_hour || 0;

      if ((dep.resource_usage?.cpu_utilization || 0) > 80) {
        highUsage.push({
          deployment: dep.deployment_name,
          cpu: dep.resource_usage.cpu_utilization,
          memory: dep.resource_usage.memory_usage_gb
        });
      }
    }

    await base44.asServiceRole.entities.SystemMetric.create({
      metric_type: 'resource_usage',
      total_cpu: totalCPU,
      total_memory: totalMemory,
      total_cost_per_hour: totalCost,
      active_deployments: deployments.length,
      high_usage_count: highUsage.length
    });

    if (highUsage.length > 0) {
      await base44.integrations.Core.SendEmail({
        to: 'ops@base44.ai',
        subject: '⚠️ High Resource Usage Alert',
        body: `${highUsage.length} deployments exceeding 80% CPU\n${JSON.stringify(highUsage, null, 2)}`
      });
    }

    return Response.json({ success: true, metrics: { totalCPU, totalMemory, totalCost, highUsage } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});