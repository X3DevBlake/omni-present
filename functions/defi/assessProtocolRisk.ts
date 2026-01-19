import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { protocol_name, contract_address } = await req.json();

    // Use AI for comprehensive risk assessment
    const riskAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As a DeFi security expert, perform comprehensive risk assessment for:

Protocol: ${protocol_name}
Contract: ${contract_address || 'N/A'}

Analyze:
1. Smart contract security risks and anomalies
2. Liquidity pool vulnerabilities
3. Market manipulation risks
4. Oracle attack vectors
5. Governance vulnerabilities
6. Economic attack surfaces

Provide detailed risk score (0-100) and specific vulnerabilities.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          risk_score: { type: "number" },
          anomalies_detected: { type: "array", items: { type: "object" } },
          vulnerability_predictions: { type: "array", items: { type: "object" } },
          recommended_actions: { type: "array", items: { type: "string" } },
          confidence_level: { type: "number" }
        }
      }
    });

    // Store risk assessment
    const assessment = await base44.asServiceRole.entities.DeFiRiskAssessment.create({
      protocol_name,
      assessment_type: 'smart_contract',
      risk_score: riskAnalysis.risk_score,
      anomalies_detected: riskAnalysis.anomalies_detected.map(a => ({
        ...a,
        detected_at: new Date().toISOString()
      })),
      vulnerability_predictions: riskAnalysis.vulnerability_predictions,
      recommended_actions: riskAnalysis.recommended_actions,
      confidence_level: riskAnalysis.confidence_level,
    });

    // Generate hedging strategy if high risk
    let hedgingStrategy = null;
    if (riskAnalysis.risk_score > 60) {
      const hedgeAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Design optimal hedging strategy for high-risk DeFi protocol:

Risk Score: ${riskAnalysis.risk_score}
Vulnerabilities: ${JSON.stringify(riskAnalysis.vulnerability_predictions)}

Recommend:
1. Hedge instruments (options, futures, insurance)
2. Allocation percentages
3. Expected risk reduction
4. Cost-benefit analysis`,
        response_json_schema: {
          type: "object",
          properties: {
            hedge_instruments: { type: "array", items: { type: "object" } },
            risk_reduction: { type: "number" },
            estimated_cost: { type: "number" }
          }
        }
      });

      hedgingStrategy = await base44.asServiceRole.entities.HedgingStrategy.create({
        strategy_name: `${protocol_name} Risk Hedge`,
        protected_assets: [protocol_name],
        hedge_instruments: hedgeAnalysis.hedge_instruments,
        risk_reduction: hedgeAnalysis.risk_reduction,
        cost: hedgeAnalysis.estimated_cost,
        ai_optimization: { automated: true },
        is_active: false,
      });
    }

    return Response.json({
      success: true,
      assessment_id: assessment.id,
      risk_score: riskAnalysis.risk_score,
      confidence: riskAnalysis.confidence_level,
      anomalies: riskAnalysis.anomalies_detected.length,
      hedging_strategy: hedgingStrategy,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});