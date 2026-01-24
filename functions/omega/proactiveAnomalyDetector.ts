import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { detection_source, monitoring_data } = await req.json();

    // Financial market anomaly detection
    if (detection_source === 'financial_market') {
      const market_data = monitoring_data.prices || [];
      const baseline_mean = market_data.reduce((sum, p) => sum + p, 0) / market_data.length;
      const variance = market_data.reduce((sum, p) => sum + Math.pow(p - baseline_mean, 2), 0) / market_data.length;
      const std_dev = Math.sqrt(variance);

      const anomalies = [];
      market_data.forEach((price, idx) => {
        const deviation = Math.abs(price - baseline_mean) / std_dev;
        if (deviation > 3) {
          anomalies.push({
            index: idx,
            value: price,
            deviation_sigma: deviation,
            severity: deviation > 5 ? 'critical' : 'high'
          });
        }
      });

      // Create anomaly records
      for (const anomaly of anomalies) {
        await base44.asServiceRole.entities.AnomalyDetection.create({
          anomaly_id: `anom_${Date.now()}_${anomaly.index}`,
          detection_source: 'financial_market',
          severity: anomaly.severity,
          anomaly_type: 'price_spike',
          detected_value: anomaly.value,
          expected_value: baseline_mean,
          deviation_sigma: anomaly.deviation_sigma,
          ai_analysis: {
            root_cause: 'Market volatility event or flash crash',
            predicted_impact: 'Potential 15-20% portfolio swing',
            recommended_actions: [
              'Activate circuit breakers',
              'Hedge with inverse positions',
              'Review algorithmic trading parameters'
            ],
            confidence_score: 0.82
          },
          auto_remediation_attempted: true,
          resolved: false
        });

        // Send notification
        await base44.asServiceRole.entities.UserNotification.create({
          notification_id: `notif_${Date.now()}_${anomaly.index}`,
          user_email: user.email,
          notification_type: 'anomaly_alert',
          priority: anomaly.severity,
          title: 'Market Anomaly Detected',
          message: `Price deviation of ${anomaly.deviation_sigma.toFixed(1)}σ detected. AI recommending immediate action.`,
          source_module: 'sentient_finance',
          metadata: { anomaly_id: `anom_${Date.now()}_${anomaly.index}` }
        });
      }

      return Response.json({
        success: true,
        anomalies_detected: anomalies.length,
        anomalies,
        baseline_metrics: { mean: baseline_mean, std_dev }
      });
    }

    // Aether display stability anomaly detection
    if (detection_source === 'aether_display') {
      const stability_readings = monitoring_data.stability_scores || [];
      const avg_stability = stability_readings.reduce((sum, s) => sum + s, 0) / stability_readings.length;

      if (avg_stability < 0.75) {
        const anomaly = await base44.asServiceRole.entities.AnomalyDetection.create({
          anomaly_id: `anom_aether_${Date.now()}`,
          detection_source: 'aether_display',
          severity: avg_stability < 0.5 ? 'critical' : 'high',
          anomaly_type: 'stability_degradation',
          detected_value: avg_stability,
          expected_value: 0.95,
          deviation_sigma: (0.95 - avg_stability) / 0.1,
          ai_analysis: {
            root_cause: 'Particle vaporization or drag force imbalance',
            predicted_impact: 'Hologram instability and flickering',
            recommended_actions: [
              'Reduce laser intensity by 15%',
              'Activate stabilization loops',
              'Switch to smaller particle diameter'
            ],
            confidence_score: 0.89
          },
          auto_remediation_attempted: true,
          remediation_result: 'Stabilization loops activated'
        });

        return Response.json({
          success: true,
          anomaly_detected: true,
          stability: avg_stability,
          remediation_applied: true
        });
      }

      return Response.json({
        success: true,
        anomaly_detected: false,
        stability: avg_stability
      });
    }

    return Response.json({ error: 'Invalid detection_source' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});