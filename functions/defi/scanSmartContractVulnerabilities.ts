import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contract_address, blockchain = 'ethereum' } = await req.json();

    // AI-powered vulnerability analysis
    const vulnerabilityAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this smart contract for security vulnerabilities.
      
      Contract Address: ${contract_address}
      Blockchain: ${blockchain}
      
      Common vulnerability patterns to check:
      - Reentrancy attacks
      - Integer overflow/underflow
      - Access control issues
      - Front-running vulnerabilities
      - Flash loan exploits
      - Oracle manipulation
      - Unchecked external calls
      
      Provide comprehensive analysis with:
      1. List of detected vulnerabilities (type, severity, description, location)
      2. Overall risk score (0-100)
      3. Recommended fixes for each vulnerability
      4. Priority order for addressing issues
      
      Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          vulnerabilities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" },
                location: { type: "string" },
                recommended_fix: { type: "string" }
              }
            }
          },
          overall_risk_score: { type: "number" },
          priority_order: { type: "array", items: { type: "string" } },
          audit_summary: { type: "string" }
        }
      }
    });

    // Create risk assessment
    const assessment = await base44.asServiceRole.entities.DeFiRiskAssessment.create({
      protocol_name: contract_address,
      assessment_type: 'smart_contract',
      risk_score: vulnerabilityAnalysis.overall_risk_score,
      anomalies_detected: vulnerabilityAnalysis.vulnerabilities.map(v => ({
        anomaly_type: v.type,
        severity: v.severity,
        description: v.description,
        detected_at: new Date().toISOString()
      })),
      vulnerability_predictions: vulnerabilityAnalysis.vulnerabilities,
      recommended_actions: vulnerabilityAnalysis.priority_order,
      confidence_level: 85
    });

    return Response.json({ 
      success: true,
      assessment,
      vulnerabilities: vulnerabilityAnalysis.vulnerabilities,
      risk_score: vulnerabilityAnalysis.overall_risk_score,
      summary: vulnerabilityAnalysis.audit_summary
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});