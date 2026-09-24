import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { framework } = await req.json();

    // Gather compliance-relevant data
    const [accessControls, encryptionPolicies, privacyManagement, auditLogs] = await Promise.all([
      base44.entities.AccessControl.filter({}).limit(100),
      base44.entities.EncryptionManagement.filter({}).limit(50),
      base44.entities.PrivacyManagement.filter({}).limit(50),
      base44.entities.AuditTrail.filter({}).limit(200)
    ]);

    // Use AI to perform compliance audit
    const auditData = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform a ${framework} compliance audit based on system data:
      
Access Controls: ${accessControls.length} policies
Encryption Policies: ${encryptionPolicies.length} policies
Privacy Management: ${privacyManagement.length} records
Audit Logs: ${auditLogs.length} entries

Provide: overall compliance score (0-100), total requirements checked, requirements passed, 5 findings (each with finding_id, category, severity, description, and remediation), and 3 compliance gaps (each with gap_description, priority low/medium/high, and estimated_effort).`,
      response_json_schema: {
        type: "object",
        properties: {
          compliance_score: { type: "number" },
          requirements_checked: { type: "number" },
          requirements_passed: { type: "number" },
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                finding_id: { type: "string" },
                category: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" },
                remediation: { type: "string" }
              }
            }
          },
          gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap_description: { type: "string" },
                priority: { type: "string" },
                estimated_effort: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create compliance audit record
    const audit = await base44.entities.ComplianceAudit.create({
      audit_id: `AUDIT_${framework}_${Date.now()}`,
      compliance_framework: framework,
      audit_scope: ['access_control', 'encryption', 'privacy', 'audit_logging'],
      findings: auditData.findings,
      compliance_score: auditData.compliance_score,
      requirements_checked: auditData.requirements_checked,
      requirements_passed: auditData.requirements_passed,
      gaps_identified: auditData.gaps,
      audit_status: 'completed',
      next_audit_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    });

    return Response.json({
      success: true,
      audit,
      compliance_score: auditData.compliance_score,
      critical_gaps: auditData.gaps.filter(g => g.priority === 'high').length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});