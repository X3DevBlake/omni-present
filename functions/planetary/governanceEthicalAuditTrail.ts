import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { policyId, actionType, actionDetails, decisionMaker } = await req.json();

    // Fetch policy and frameworks
    const policies = await base44.entities.PlanetaryGovernancePolicy.filter({ policy_id: policyId });
    if (!policies || policies.length === 0) {
      return Response.json({ error: 'Policy not found' }, { status: 404 });
    }
    const policy = policies[0];

    const frameworks = await base44.entities.EthicalFramework.list('-created_date', 1);
    const framework = frameworks[0];

    // AI generates ethical audit
    const auditAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `As Omega Ethical Audit AI, create a transparent and accountable audit record:

Policy: ${policy.policy_name}
Action: ${actionType}
Details: ${actionDetails}
Decision Maker: ${decisionMaker}

Ethical Framework:
${framework ? framework.core_principles?.map(p => `- ${p.name}: ${p.weight}`).join('\n') : 'Default framework'}

Create audit:
1. Ethical justification for this action
2. Stakeholder impact analysis
3. Transparency and accountability assessment
4. AI oversight notes
5. Omega validation of decision integrity`,
      response_json_schema: {
        type: "object",
        properties: {
          ethical_justification: { type: "string" },
          stakeholder_impact: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stakeholder_group: { type: "string" },
                impact_type: { type: "string" },
                severity: { type: "number" }
              }
            }
          },
          transparency_score: { type: "number" },
          accountability_chain: { type: "array", items: { type: "string" } },
          ai_oversight_notes: { type: "string" },
          omega_audit_validation: { type: "string" }
        }
      }
    });

    // Create audit record
    const audit = await base44.asServiceRole.entities.GovernanceEthicalAudit.create({
      audit_id: `AUDIT_${Date.now()}`,
      policy_id: policyId,
      action_type: actionType,
      action_details: actionDetails,
      decision_maker: decisionMaker,
      ethical_framework_used: framework?.framework_id || "default",
      ethical_justification: auditAnalysis.ethical_justification,
      stakeholder_impact: auditAnalysis.stakeholder_impact,
      transparency_score: auditAnalysis.transparency_score,
      accountability_chain: auditAnalysis.accountability_chain,
      ai_oversight_notes: auditAnalysis.ai_oversight_notes,
      omega_audit_validation: auditAnalysis.omega_audit_validation
    });

    return Response.json({
      success: true,
      audit,
      transparency_score: auditAnalysis.transparency_score
    });

  } catch (error) {
    console.error('Governance Ethical Audit Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});