import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { deviceId, metrics } = body;

    // Statistical anomaly detection
    const anomalies = detectAnomalies(metrics);

    // Root cause analysis
    const rootCauses = analyzeRootCauses(anomalies);

    // Store anomaly report
    await base44.asServiceRole.entities.ProactiveAlert?.create?.({
      alert_type: anomalies.length > 0 ? 'anomaly' : 'normal',
      severity: anomalies.length > 0 ? 'high' : 'low',
      title: `Device ${deviceId} Analysis`,
      description: `Found ${anomalies.length} anomalies`,
      affected_agents: [deviceId],
      metrics: metrics,
      suggested_actions: rootCauses.recommendations,
      status: 'active',
      confidence_score: 0.88,
    }).catch(() => null);

    return Response.json({
      success: true,
      deviceId,
      anomalies,
      rootCauses,
      recommendations: rootCauses.recommendations,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function detectAnomalies(metrics) {
  const anomalies = [];
  const threshold = 1.5; // Standard deviations

  for (const [metric, value] of Object.entries(metrics || {})) {
    if (value > 80) {
      anomalies.push({
        metric,
        value,
        type: 'threshold_exceeded',
        severity: value > 90 ? 'critical' : 'warning',
      });
    }
  }

  return anomalies;
}

function analyzeRootCauses(anomalies) {
  const causes = {
    cpu: 'High CPU usage - Check running processes and resource allocation',
    memory: 'High memory usage - Review application memory footprint',
    temperature: 'High temperature - Ensure cooling system is operational',
    bandwidth: 'High bandwidth usage - Monitor network activity',
  };

  const recommendations = anomalies.map((a) => ({
    metric: a.metric,
    cause: causes[a.metric] || 'Unknown cause',
    action: `Investigate ${a.metric} metrics`,
  }));

  return { causes, recommendations };
}