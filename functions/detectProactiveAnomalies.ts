import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent agent KPIs
    const kpis = await base44.asServiceRole.entities.AgentKPI.list('-created_date', 100);

    const anomalies = [];

    // Statistical analysis for anomaly detection
    if (kpis.length > 10) {
      const efficiencyValues = kpis.map(k => k.efficiency || 0);
      const mean = efficiencyValues.reduce((sum, v) => sum + v, 0) / efficiencyValues.length;
      const stdDev = Math.sqrt(
        efficiencyValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / efficiencyValues.length
      );

      // Detect outliers (beyond 2 standard deviations)
      kpis.forEach((kpi, index) => {
        if (Math.abs((kpi.efficiency || 0) - mean) > stdDev * 2) {
          anomalies.push({
            type: 'efficiency_outlier',
            agent_id: kpi.agent_id,
            severity: 'high',
            current_value: kpi.efficiency,
            expected_range: `${(mean - stdDev * 2).toFixed(1)} - ${(mean + stdDev * 2).toFixed(1)}`,
            root_cause: 'Statistical deviation detected in efficiency metrics',
            recommendation: 'Review agent training data and consider retraining',
            impact: 'May affect overall system performance',
          });
        }
      });
    }

    // Pattern-based anomaly detection
    const responseTimeSpike = kpis.filter(k => (k.average_response_time || 0) > 500);
    if (responseTimeSpike.length > 5) {
      anomalies.push({
        type: 'response_time_spike',
        severity: 'critical',
        affected_agents: responseTimeSpike.length,
        root_cause: 'Network latency or resource contention',
        recommendation: 'Scale infrastructure or optimize agent workload distribution',
        impact: 'User experience degradation',
      });
    }

    // Store anomalies for future reference
    for (const anomaly of anomalies) {
      await base44.asServiceRole.entities.ProactiveAlert.create({
        alert_type: anomaly.type,
        severity: anomaly.severity,
        description: anomaly.root_cause,
        suggested_action: anomaly.recommendation,
        estimated_impact: anomaly.impact,
        status: 'active',
      });
    }

    return Response.json({
      success: true,
      anomalies,
      total_detected: anomalies.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});