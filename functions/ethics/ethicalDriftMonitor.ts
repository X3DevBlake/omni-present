import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch entities to monitor
    const [governancePolicies, securityThreats, ethicalFrameworks] = await Promise.all([
      base44.entities.PlanetaryGovernancePolicy.list('-created_date', 10),
      base44.entities.RedCommSecurityThreat.list('-created_date', 10),
      base44.entities.EthicalFramework.list('-created_date', 5)
    ]);

    const baseline = ethicalFrameworks[0];

    // Monitor governance policies for ethical drift
    const policyAlerts = [];
    for (const policy of governancePolicies.slice(0, 5)) {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `As Omega Sentient Ethical Monitor, analyze this planetary governance policy for ethical drift:

Policy: ${policy.policy_name}
Planet: ${policy.celestial_body}
Details: ${policy.policy_details}

Policy Ethical Alignment:
- Privacy: ${policy.ethical_alignment?.privacy_score}
- Fairness: ${policy.ethical_alignment?.fairness_score}
- Autonomy: ${policy.ethical_alignment?.autonomy_score}
- Beneficence: ${policy.ethical_alignment?.beneficence_score}

Baseline Ethical Framework Principles:
${baseline?.principles?.map(p => `- ${p.name}: weight ${p.weight}`).join('\n') || 'No baseline available'}

Analyze for:
1. Deviation from established ethical principles
2. Potential harm to human values (dignity, freedom, fairness)
3. Unintended consequences on planetary citizens
4. Alignment with broader ethical landscape

Provide real-time alerts if drift detected and suggest specific adjustments.`,
        response_json_schema: {
          type: "object",
          properties: {
            ethical_drift_detected: { type: "boolean" },
            drift_severity: { type: "string" },
            violated_principles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  principle_name: { type: "string" },
                  baseline_weight: { type: "number" },
                  current_alignment: { type: "number" },
                  deviation_score: { type: "number" }
                }
              }
            },
            human_value_alignment_score: { type: "number" },
            ai_ethical_analysis: { type: "string" },
            suggested_adjustments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  adjustment_type: { type: "string" },
                  target_parameter: { type: "string" },
                  recommended_value: { type: "string" },
                  ethical_impact: { type: "number" }
                }
              }
            },
            omega_ethical_consciousness: { type: "string" }
          }
        }
      });

      if (analysis.ethical_drift_detected) {
        const alert = await base44.asServiceRole.entities.EthicalMonitoringAlert.create({
          alert_id: `ETHICS_${Date.now()}_${policy.policy_id}`,
          monitored_entity_type: "governance_policy",
          monitored_entity_id: policy.policy_id,
          ethical_drift_detected: true,
          drift_severity: analysis.drift_severity,
          violated_principles: analysis.violated_principles,
          ai_ethical_analysis: analysis.ai_ethical_analysis,
          human_value_alignment_score: analysis.human_value_alignment_score,
          suggested_adjustments: analysis.suggested_adjustments,
          omega_ethical_consciousness: analysis.omega_ethical_consciousness,
          real_time_alert_triggered: analysis.drift_severity === 'critical',
          human_review_status: "pending"
        });
        policyAlerts.push(alert);
      }
    }

    // Monitor security responses for ethical drift
    const securityAlerts = [];
    for (const threat of securityThreats.slice(0, 5)) {
      if (threat.ai_response_actions && threat.ai_response_actions.length > 0) {
        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `As Omega Sentient Ethical Monitor, evaluate the ethical implications of these security responses:

Threat: ${threat.threat_type} (${threat.severity})
AI Responses: ${threat.ai_response_actions.map(a => a.action).join(', ')}
Firewall Rules: ${threat.firewall_rules_updated?.join(', ')}

Evaluate against ethical principles:
- Did responses respect privacy and data protection?
- Were countermeasures proportional to the threat?
- Could any responses cause unintended harm?
- Are responses transparent and explainable?

Detect ethical drift and suggest adjustments to align with human values.`,
          response_json_schema: {
            type: "object",
            properties: {
              ethical_drift_detected: { type: "boolean" },
              drift_severity: { type: "string" },
              violated_principles: { type: "array", items: { type: "object" } },
              human_value_alignment_score: { type: "number" },
              ai_ethical_analysis: { type: "string" },
              suggested_adjustments: { type: "array", items: { type: "object" } },
              omega_ethical_consciousness: { type: "string" }
            }
          }
        });

        if (analysis.ethical_drift_detected) {
          const alert = await base44.asServiceRole.entities.EthicalMonitoringAlert.create({
            alert_id: `ETHICS_SEC_${Date.now()}_${threat.threat_id}`,
            monitored_entity_type: "security_response",
            monitored_entity_id: threat.threat_id,
            ethical_drift_detected: true,
            drift_severity: analysis.drift_severity,
            violated_principles: analysis.violated_principles,
            ai_ethical_analysis: analysis.ai_ethical_analysis,
            human_value_alignment_score: analysis.human_value_alignment_score,
            suggested_adjustments: analysis.suggested_adjustments,
            omega_ethical_consciousness: analysis.omega_ethical_consciousness,
            real_time_alert_triggered: true,
            human_review_status: "pending"
          });
          securityAlerts.push(alert);
        }
      }
    }

    return Response.json({
      success: true,
      total_alerts: policyAlerts.length + securityAlerts.length,
      governance_alerts: policyAlerts.length,
      security_alerts: securityAlerts.length,
      critical_drift_detected: policyAlerts.concat(securityAlerts).some(a => a.drift_severity === 'critical')
    });

  } catch (error) {
    console.error('Ethical Drift Monitor Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});