import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { simulationId, metrics } = body;

    // Fetch simulation
    const simulation = await base44.asServiceRole.entities.Simulation?.get?.(simulationId)
      .catch(() => null);

    if (!simulation) {
      return Response.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // Detect anomalies using statistical methods
    const anomalies = [];

    // Check for unusual metric patterns
    if (metrics) {
      if (metrics.agentFailureRate > 0.15) {
        anomalies.push({
          type: 'high_failure_rate',
          severity: 'critical',
          metric: metrics.agentFailureRate * 100,
          threshold: 15,
          recommendation: 'Review agent health and restart failed instances',
        });
      }

      if (metrics.latencySpike > 1000) {
        anomalies.push({
          type: 'latency_spike',
          severity: 'high',
          metric: metrics.latencySpike,
          threshold: 1000,
          recommendation: 'Check system resources and network connectivity',
        });
      }

      if (metrics.commBreakdown > 0.1) {
        anomalies.push({
          type: 'communication_breakdown',
          severity: 'medium',
          metric: metrics.commBreakdown * 100,
          threshold: 10,
          recommendation: 'Verify inter-agent messaging queue and handlers',
        });
      }
    }

    // Store detected anomalies
    for (const anomaly of anomalies) {
      await base44.asServiceRole.entities.SimulationAnomaly?.create?.({
        simulation_id: simulationId,
        anomaly_type: anomaly.type,
        severity: anomaly.severity,
        metric_value: anomaly.metric,
        threshold: anomaly.threshold,
        recommendation: anomaly.recommendation,
        detected_at: new Date().toISOString(),
      }).catch(() => null);
    }

    return Response.json({
      success: true,
      simulationId,
      anomalyCount: anomalies.length,
      anomalies,
      healthStatus: anomalies.length === 0 ? 'healthy' : 'degraded',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});