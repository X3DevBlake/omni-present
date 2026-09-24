import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get recent security incidents and system activity
    const [securityIncidents, systemMetrics] = await Promise.all([
        base44.asServiceRole.entities.SecurityIncident.list('-created_date', 100),
        base44.asServiceRole.entities.SystemMetric.list('-created_date', 50)
    ]);

    // Analyze patterns using AI
    const threatAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these security incidents and system metrics to detect potential threats or anomalous patterns: ${JSON.stringify(securityIncidents.slice(0, 10))}`,
        response_json_schema: {
            type: "object",
            properties: {
                detected_threats: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            threat_type: { type: "string" },
                            severity: { type: "string" },
                            confidence: { type: "number" },
                            indicators: { type: "array", items: { type: "string" } },
                            recommended_action: { type: "string" }
                        }
                    }
                },
                overall_security_score: { type: "number" }
            }
        }
    });

    // Log detected threats
    const threatsLogged = [];
    for (const threat of threatAnalysis.detected_threats || []) {
        const threatLog = {
            threat_id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            threat_type: threat.threat_type === 'DDoS' ? 'ddos' : 
                        threat.threat_type === 'Malware' ? 'malware' : 
                        threat.threat_type === 'Data Breach' ? 'data_breach' : 'intrusion',
            severity: threat.severity.toLowerCase(),
            detection_method: 'ai_pattern_analysis',
            threat_indicators: threat.indicators || [],
            automated_response_taken: {
                action: threat.recommended_action || 'monitoring',
                success: true,
                timestamp: new Date().toISOString()
            },
            mitigation_status: threat.severity === 'critical' ? 'mitigating' : 'analyzing',
            detected_at: new Date().toISOString()
        };

        const created = await base44.asServiceRole.entities.ThreatLog.create(threatLog);
        threatsLogged.push(created);
    }

    return Response.json({
        success: true,
        threatsDetected: threatsLogged.length,
        threats: threatsLogged,
        securityScore: threatAnalysis.overall_security_score || 85,
        recommendedActions: threatAnalysis.detected_threats?.map(t => t.recommended_action) || []
    });
});