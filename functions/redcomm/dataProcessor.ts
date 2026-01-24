import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId, rawData, telemetryData } = await req.json();

    // Process raw signal data
    const processedMetrics = {
      signal_strength: rawData.rssi || 0,
      noise_floor: rawData.noise || -100,
      snr: (rawData.rssi || 0) - (rawData.noise || -100),
      packet_loss: rawData.packet_loss || 0,
      latency: rawData.latency || 0,
      bandwidth_usage: rawData.bandwidth_usage || 0
    };

    // Use AI to analyze interference patterns
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this RedComm device telemetry and identify interference patterns, predict link health degradation, and suggest optimization strategies:
      
      Device ID: ${deviceId}
      Signal Strength: ${processedMetrics.signal_strength} dBm
      SNR: ${processedMetrics.snr} dB
      Packet Loss: ${processedMetrics.packet_loss}%
      Latency: ${processedMetrics.latency} ms
      
      Provide a detailed analysis with:
      1. Current health assessment (0-100 score)
      2. Detected interference sources
      3. Predicted degradation timeline
      4. Recommended adaptive parameters
      5. Self-healing actions`,
      response_json_schema: {
        type: "object",
        properties: {
          health_score: { type: "number" },
          interference_sources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source: { type: "string" },
                severity: { type: "number" }
              }
            }
          },
          predicted_degradation_hours: { type: "number" },
          recommended_modulation: { type: "string" },
          recommended_error_correction: { type: "string" },
          recommended_power_adjustment: { type: "number" },
          self_healing_actions: {
            type: "array",
            items: { type: "string" }
          },
          omega_analysis: { type: "string" }
        }
      }
    });

    // Create system metrics
    await base44.asServiceRole.entities.SystemMetric.create({
      metric_id: `redcomm_${deviceId}_${Date.now()}`,
      component_type: "network_node",
      component_id: deviceId,
      metric_name: "signal_strength",
      metric_value: processedMetrics.signal_strength,
      metric_unit: "dBm",
      anomaly_detected: processedMetrics.signal_strength < -80,
      deviation_from_baseline: processedMetrics.signal_strength + 70
    });

    // Update or create link health record
    const linkHealthData = {
      link_id: `link_${deviceId}`,
      device_a_id: deviceId,
      device_b_id: "central_hub",
      health_score: aiAnalysis.health_score,
      signal_quality: Math.max(0, Math.min(100, (processedMetrics.snr + 10) * 5)),
      packet_loss_rate: processedMetrics.packet_loss / 100,
      jitter_ms: telemetryData?.jitter || 0,
      bandwidth_utilization: processedMetrics.bandwidth_usage / 100,
      interference_detected: aiAnalysis.interference_sources.length > 0,
      interference_sources: aiAnalysis.interference_sources,
      ai_predictions: {
        predicted_downtime_probability: aiAnalysis.predicted_degradation_hours < 24 ? 0.7 : 0.2,
        predicted_degradation_hours: aiAnalysis.predicted_degradation_hours,
        recommended_actions: aiAnalysis.self_healing_actions
      },
      adaptive_parameters: {
        modulation_scheme: aiAnalysis.recommended_modulation,
        error_correction_level: aiAnalysis.recommended_error_correction,
        power_level_db: aiAnalysis.recommended_power_adjustment
      },
      self_healing_status: aiAnalysis.health_score < 50 ? "adjusting" : "stable",
      omega_sentient_analysis: aiAnalysis.omega_analysis
    };

    const linkHealth = await base44.asServiceRole.entities.RedCommLinkHealth.create(linkHealthData);

    return Response.json({
      success: true,
      processed_metrics: processedMetrics,
      ai_analysis: aiAnalysis,
      link_health: linkHealth
    });

  } catch (error) {
    console.error('RedComm Data Processor Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});