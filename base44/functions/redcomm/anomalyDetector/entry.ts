import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all recent link health records
    const recentLinkHealth = await base44.entities.RedCommLinkHealth.list('-created_date', 50);
    
    // Analyze for anomalies using AI
    const anomalyAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these RedComm network link health records for anomalies, patterns, and potential security threats:
      
      ${JSON.stringify(recentLinkHealth.slice(0, 10).map(link => ({
        link_id: link.link_id,
        health_score: link.health_score,
        signal_quality: link.signal_quality,
        packet_loss_rate: link.packet_loss_rate,
        interference_detected: link.interference_detected,
        self_healing_status: link.self_healing_status
      })))}
      
      Identify:
      1. Anomalous patterns (unusual degradation, coordinated attacks)
      2. Critical links requiring immediate attention
      3. Network-wide trends
      4. Predicted cascading failures
      5. Recommended preventive actions`,
      response_json_schema: {
        type: "object",
        properties: {
          anomalies_detected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                link_id: { type: "string" },
                anomaly_type: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          critical_links: {
            type: "array",
            items: { type: "string" }
          },
          network_trend: { type: "string" },
          cascade_failure_risk: { type: "number" },
          preventive_actions: {
            type: "array",
            items: { type: "string" }
          },
          omega_threat_assessment: { type: "string" }
        }
      }
    });

    // Create anomaly detection records
    const anomalyRecords = [];
    for (const anomaly of anomalyAnalysis.anomalies_detected) {
      const record = await base44.asServiceRole.entities.AnomalyDetection.create({
        anomaly_id: `redcomm_${anomaly.link_id}_${Date.now()}`,
        component_type: "network_node",
        component_id: anomaly.link_id,
        anomaly_type: anomaly.anomaly_type,
        severity: anomaly.severity,
        description: anomaly.description,
        ai_confidence: 0.85,
        recommended_actions: anomalyAnalysis.preventive_actions,
        auto_remediation_triggered: anomaly.severity === "critical"
      });
      anomalyRecords.push(record);
    }

    // Send alerts for critical anomalies
    if (anomalyAnalysis.anomalies_detected.some(a => a.severity === "critical")) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "RedComm Network: Critical Anomalies Detected",
        body: `Critical anomalies detected in RedComm network:
        
        ${anomalyAnalysis.anomalies_detected
          .filter(a => a.severity === "critical")
          .map(a => `- ${a.link_id}: ${a.description}`)
          .join('\n')}
        
        Cascade Failure Risk: ${(anomalyAnalysis.cascade_failure_risk * 100).toFixed(1)}%
        
        Recommended Actions:
        ${anomalyAnalysis.preventive_actions.map((a, i) => `${i+1}. ${a}`).join('\n')}
        
        Omega Threat Assessment: ${anomalyAnalysis.omega_threat_assessment}`
      });
    }

    return Response.json({
      success: true,
      anomalies_detected: anomalyAnalysis.anomalies_detected.length,
      critical_links: anomalyAnalysis.critical_links,
      network_health: anomalyAnalysis.network_trend,
      cascade_failure_risk: anomalyAnalysis.cascade_failure_risk,
      anomaly_records: anomalyRecords,
      alert_sent: anomalyAnalysis.anomalies_detected.some(a => a.severity === "critical")
    });

  } catch (error) {
    console.error('RedComm Anomaly Detector Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});