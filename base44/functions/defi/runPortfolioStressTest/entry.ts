import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      test_name, 
      scenario_type, 
      market_drop_percentage = 30,
      liquidity_reduction = 50,
      affected_protocols = []
    } = await req.json();

    // Get current portfolio (mock - integrate with real portfolio)
    const portfolioSnapshot = {
      total_value: 100000,
      positions: [
        { protocol: 'Uniswap', value: 30000, type: 'liquidity' },
        { protocol: 'Aave', value: 40000, type: 'lending' },
        { protocol: 'Compound', value: 30000, type: 'lending' }
      ]
    };

    // AI-powered stress test simulation
    const stressTestResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Run a DeFi portfolio stress test simulation.
      
      Scenario: ${scenario_type}
      Parameters:
      - Market Drop: ${market_drop_percentage}%
      - Liquidity Reduction: ${liquidity_reduction}%
      - Affected Protocols: ${affected_protocols.join(', ')}
      
      Current Portfolio:
      ${JSON.stringify(portfolioSnapshot, null, 2)}
      
      Calculate:
      1. Total loss (in dollars)
      2. Affected positions with individual losses
      3. Liquidation risk (0-100)
      4. Recovery time (days)
      5. Risk score (0-100)
      6. Recommended hedges (array of strings)
      7. Cascading effects
      
      Return detailed JSON analysis.`,
      response_json_schema: {
        type: "object",
        properties: {
          total_loss: { type: "number" },
          affected_positions: { 
            type: "array",
            items: {
              type: "object",
              properties: {
                protocol: { type: "string" },
                loss: { type: "number" },
                liquidation_risk: { type: "number" }
              }
            }
          },
          liquidation_risk: { type: "number" },
          recovery_time_days: { type: "number" },
          risk_score: { type: "number" },
          recommended_hedges: { type: "array", items: { type: "string" } },
          cascading_effects: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Save stress test
    const stressTest = await base44.asServiceRole.entities.PortfolioStressTest.create({
      test_name,
      scenario_type,
      parameters: {
        market_drop_percentage,
        liquidity_reduction,
        affected_protocols,
        duration_hours: 24
      },
      portfolio_snapshot: portfolioSnapshot,
      predicted_outcomes: {
        total_loss: stressTestResult.total_loss,
        affected_positions: stressTestResult.affected_positions,
        liquidation_risk: stressTestResult.liquidation_risk,
        recovery_time_days: stressTestResult.recovery_time_days
      },
      risk_score: stressTestResult.risk_score,
      recommended_hedges: stressTestResult.recommended_hedges,
      visualization_data: {
        nodes: stressTestResult.affected_positions,
        cascading_effects: stressTestResult.cascading_effects
      }
    });

    return Response.json({ 
      success: true,
      stress_test: stressTest,
      analysis: stressTestResult
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});