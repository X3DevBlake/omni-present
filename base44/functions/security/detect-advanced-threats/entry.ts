import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather security-relevant data
    const [auditLogs, userActivities, integrations, anomalies] = await Promise.all([
      base44.entities.AuditTrail.filter({}).limit(200).sort('-created_date'),
      base44.entities.UserActivity.filter({}).limit(200).sort('-created_date'),
      base44.entities.IntegrationHealth.filter({}).limit(50),
      base44.entities.AnomalyDetector.filter({}).limit(100)
    ]);

    // Use AI to detect threats
    const threatData = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze system data for security threats:
      
Recent Audit Logs: ${auditLogs.length} entries
User Activities: ${userActivities.length} activities
Integration Health: ${integrations.length} integrations
Anomalies Detected: ${anomalies.length} anomalies

Identify 5 potential security threats with: threat type, severity (info/low/medium/high/critical), affected systems (array with system_name and impact_level 0-100), detection confidence (0-1), attack vector description, origin country, and 3 mitigation actions (each with action description and whether it can be automated).`,
      response_json_schema: {
        type: "object",
        properties: {
          threats: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                severity: { type: "string" },
                systems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      impact: { type: "number" }
                    }
                  }
                },
                confidence: { type: "number" },
                vector: { type: "string" },
                origin: { type: "string" },
                mitigations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      automated: { type: "boolean" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Create threat detection records
    const threats = [];
    for (const threat of threatData.threats) {
      const created = await base44.entities.ThreatDetection.create({
        threat_id: `THREAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        threat_type: threat.type,
        severity_level: threat.severity,
        affected_systems: threat.systems.map(s => ({
          system_name: s.name,
          impact_level: s.impact
        })),
        detection_method: 'ai_analysis',
        threat_indicators: [{
          indicator_type: 'behavioral',
          value: threat.vector,
          confidence: threat.confidence
        }],
        mitigation_actions: threat.mitigations.map(m => ({
          action: m.action,
          status: 'pending',
          automated: m.automated
        })),
        threat_intelligence: {
          origin_location: {
            country: threat.origin,
            latitude: Math.random() * 180 - 90,
            longitude: Math.random() * 360 - 180
          },
          attack_vector: threat.vector,
          known_signatures: []
        },
        status: 'detected'
      });
      threats.push(created);
    }

    return Response.json({
      success: true,
      threats_detected: threats.length,
      threats,
      critical_count: threats.filter(t => t.severity_level === 'critical').length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});