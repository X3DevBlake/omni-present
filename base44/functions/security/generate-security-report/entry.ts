import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_type, time_range_days } = await req.json();

    // Gather security data
    const [threats, incidents, audits, vulnerabilities] = await Promise.all([
      base44.entities.ThreatDetection.filter({}).limit(200),
      base44.entities.SecurityIncident.filter({}).limit(100),
      base44.entities.ComplianceAudit.filter({}).limit(50),
      base44.entities.VulnerabilityAssessment.filter({}).limit(100)
    ]);

    // Use AI to generate comprehensive security report
    const reportData = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive ${report_type} security report covering the last ${time_range_days} days:
      
Threats Detected: ${threats.length}
Security Incidents: ${incidents.length}
Compliance Audits: ${audits.length}
Vulnerabilities: ${vulnerabilities.length}

Critical Stats:
- Critical Threats: ${threats.filter(t => t.severity_level === 'critical').length}
- Resolved Incidents: ${incidents.filter(i => i.resolution?.resolved).length}
- Avg Compliance Score: ${audits.reduce((acc, a) => acc + a.compliance_score, 0) / Math.max(audits.length, 1)}

Provide: executive summary, key metrics (object with threat_count, incident_count, avg_response_time, compliance_avg), top 5 risks (each with risk_name, severity, and mitigation_plan), security posture score (0-100), and 5 strategic recommendations.`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_metrics: {
            type: "object",
            properties: {
              threat_count: { type: "number" },
              incident_count: { type: "number" },
              avg_response_time: { type: "number" },
              compliance_avg: { type: "number" }
            }
          },
          top_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk_name: { type: "string" },
                severity: { type: "string" },
                mitigation_plan: { type: "string" }
              }
            }
          },
          posture_score: { type: "number" },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      report: reportData,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});