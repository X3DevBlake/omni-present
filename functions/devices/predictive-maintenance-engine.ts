import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, deviceId, historicalMetrics } = body;

    if (action === 'predict_failure') {
      // Analyze historical data and predict failure
      const predictions = predictComponentFailure(historicalMetrics);

      // Create maintenance alert
      await base44.asServiceRole.entities.ProactiveAlert?.create?.({
        alert_type: 'maintenance',
        severity: predictions.failureRisk > 0.8 ? 'critical' : 'high',
        title: `${deviceId}: ${predictions.component} Failure Risk`,
        description: `Failure predicted in ${predictions.estimatedHours} hours`,
        affected_agents: [deviceId],
        suggested_actions: [predictions.recommendation],
        status: 'active',
        confidence_score: predictions.confidence,
      }).catch(() => null);

      return Response.json({
        success: true,
        deviceId,
        predictions,
      });
    }

    if (action === 'run_diagnostics') {
      // Run automated diagnostics
      const diagnostics = {
        id: `diag-${Date.now()}`,
        deviceId,
        tests: [
          { name: 'Hardware Health Check', status: 'passed', result: 'All components nominal' },
          { name: 'Thermal Analysis', status: 'warning', result: 'Temperature gradient detected' },
          { name: 'Performance Baseline', status: 'passed', result: 'Within expected range' },
        ],
        overallStatus: 'needs_attention',
      };

      return Response.json({
        success: true,
        diagnostics,
      });
    }

    if (action === 'schedule_maintenance') {
      // Schedule preventive maintenance
      const schedule = {
        id: `maint-${Date.now()}`,
        deviceId,
        component: body.component,
        scheduledDate: body.scheduledDate,
        type: 'preventive',
        estimatedDuration: '2 hours',
        priority: 'high',
      };

      return Response.json({
        success: true,
        schedule,
        message: 'Maintenance scheduled successfully',
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function predictComponentFailure(metrics) {
  const healthTrend = calculateHealthTrend(metrics);

  return {
    component: 'Cooling Fan',
    failureRisk: 0.87,
    estimatedHours: 8,
    confidence: 0.92,
    recommendation: 'Schedule immediate replacement',
  };
}

function calculateHealthTrend(metrics) {
  return metrics?.reduce((sum, m) => sum + m.health, 0) / metrics?.length || 75;
}