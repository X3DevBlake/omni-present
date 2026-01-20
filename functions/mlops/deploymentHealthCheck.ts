import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const deployments = await base44.asServiceRole.entities.ModelDeployment.filter({
      deployment_status: 'active'
    });

    const alerts = [];
    for (const deployment of deployments) {
      if (deployment.performance_metrics?.error_rate > 5) {
        alerts.push({
          deployment: deployment.deployment_name,
          issue: 'High error rate',
          value: deployment.performance_metrics.error_rate
        });
      }
      if (deployment.performance_metrics?.avg_latency_ms > 1000) {
        alerts.push({
          deployment: deployment.deployment_name,
          issue: 'High latency',
          value: deployment.performance_metrics.avg_latency_ms
        });
      }
    }

    if (alerts.length > 0) {
      await base44.integrations.Core.SendEmail({
        to: 'admin@base44.ai',
        subject: `⚠️ Deployment Health Issues (${alerts.length})`,
        body: JSON.stringify(alerts, null, 2)
      });
    }

    return Response.json({ success: true, deployments_checked: deployments.length, alerts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});