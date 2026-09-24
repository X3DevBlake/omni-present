export default async function portfolioStressTesting(data, context) {
  const { user_email, stress_scenarios = ['market_crash', 'flash_crash', 'depegging', 'smart_contract_exploit'] } = data;
  
  const assets = await context.entities.CryptoAsset.filter({ user_email });
  const pools = await context.entities.LiquidityPool.filter({ user_email, status: 'active' });
  const stakes = await context.entities.OmniStake.filter({ user_email, status: 'active' });
  
  const portfolioValue = assets.reduce((sum, a) => sum + (a.balance * (a.current_price || 0)), 0);
  const poolValue = pools.reduce((sum, p) => sum + p.amount_deposited, 0);
  const stakeValue = stakes.reduce((sum, s) => sum + s.amount_omni * 50, 0);
  const totalValue = portfolioValue + poolValue + stakeValue;
  
  const stressTestResults = await context.integrations.Core.InvokeLLM({
    prompt: `Conduct comprehensive DeFi portfolio stress testing:

Total Portfolio Value: $${totalValue.toFixed(2)}
- Liquid Assets: $${portfolioValue.toFixed(2)}
- LP Positions: $${poolValue.toFixed(2)}
- Staked: $${stakeValue.toFixed(2)}

Assets:
${assets.map(a => `${a.symbol}: ${a.balance} ($${(a.balance * (a.current_price || 0)).toFixed(2)})`).join('\n')}

LP Positions:
${pools.map(p => `${p.pair}: $${p.amount_deposited} (APY: ${p.apy}%)`).join('\n')}

Stress Scenarios: ${stress_scenarios.join(', ')}

For each scenario, calculate:
1. Portfolio value impact (%)
2. Liquidity availability
3. Recovery time estimate
4. Cascade risks
5. Mitigation strategies`,
    response_json_schema: {
      type: "object",
      properties: {
        scenario_results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              scenario_name: { type: "string" },
              portfolio_impact_percentage: { type: "number" },
              value_loss_usd: { type: "number" },
              liquidity_impact: { type: "string" },
              recovery_days: { type: "number" },
              cascade_risks: { type: "array", items: { type: "string" } },
              mitigation_actions: { type: "array", items: { type: "string" } }
            }
          }
        },
        worst_case_scenario: { type: "string" },
        overall_resilience_score: { type: "number" },
        recommended_hedges: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const criticalScenarios = stressTestResults.scenario_results.filter(s => s.portfolio_impact_percentage > 30);
  
  if (criticalScenarios.length > 0) {
    await context.entities.ProactiveAlert.create({
      alert_type: 'risk_exposure',
      severity: 'high',
      title: 'Portfolio Stress Test: High Risk Exposure',
      description: `${criticalScenarios.length} scenarios could cause >30% portfolio loss`,
      metrics: {
        total_value: totalValue,
        worst_case_loss: Math.max(...stressTestResults.scenario_results.map(s => s.value_loss_usd))
      },
      suggested_actions: stressTestResults.recommended_hedges,
      status: 'active'
    });
  }
  
  return {
    stress_test_results: stressTestResults,
    portfolio_value: totalValue,
    scenarios_tested: stress_scenarios.length,
    resilience_rating: stressTestResults.overall_resilience_score > 70 ? 'Strong' :
                      stressTestResults.overall_resilience_score > 40 ? 'Moderate' : 'Weak'
  };
}