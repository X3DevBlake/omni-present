export default async function advancedStressTesting(data, context) {
  const { user_email, economic_indicators = true, geopolitical_events = true } = data;
  
  const assets = await context.entities.CryptoAsset.filter({ user_email });
  const pools = await context.entities.LiquidityPool.filter({ user_email, status: 'active' });
  const stakes = await context.entities.OmniStake.filter({ user_email, status: 'active' });
  
  const totalValue = assets.reduce((sum, a) => sum + (a.balance * (a.current_price || 0)), 0) +
                     pools.reduce((sum, p) => sum + p.amount_deposited, 0) +
                     stakes.reduce((sum, s) => sum + s.amount_omni * 50, 0);
  
  const stressTest = await context.integrations.Core.InvokeLLM({
    prompt: `Conduct advanced DeFi stress testing with real-world parameters:

Portfolio Value: $${totalValue.toFixed(2)}

Assets: ${assets.map(a => `${a.symbol}: ${a.balance}`).join(', ')}
LP Positions: ${pools.length} pools
Staked: ${stakes.length} positions

Include real-world factors:
1. Economic Indicators: Interest rates, inflation, GDP, unemployment
2. Geopolitical Events: Conflicts, sanctions, regulatory changes
3. Market Correlations: Cross-asset contagion
4. Liquidity Cascades: DEX liquidity drains
5. Protocol Interdependencies: Domino effects
6. Black Swan Events: Extreme scenarios

For each scenario, calculate:
- Direct impact on each position
- Cascading effects across protocols
- Liquidity availability during crisis
- Recovery timeline
- Optimal response strategy`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        scenarios: {
          type: "array",
          items: {
            type: "object",
            properties: {
              scenario_name: { type: "string" },
              trigger_events: { type: "array", items: { type: "string" } },
              economic_factors: { type: "object" },
              geopolitical_factors: { type: "object" },
              direct_impact: {
                type: "object",
                properties: {
                  portfolio_loss_percentage: { type: "number" },
                  value_at_risk_usd: { type: "number" },
                  affected_positions: { type: "array", items: { type: "string" } }
                }
              },
              cascading_risks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    protocol: { type: "string" },
                    risk_type: { type: "string" },
                    probability: { type: "number" },
                    impact_multiplier: { type: "number" }
                  }
                }
              },
              liquidity_crisis: {
                type: "object",
                properties: {
                  exit_difficulty: { type: "string" },
                  slippage_percentage: { type: "number" },
                  time_to_exit_hours: { type: "number" }
                }
              },
              recovery_analysis: {
                type: "object",
                properties: {
                  estimated_days: { type: "number" },
                  recovery_probability: { type: "number" },
                  actions_required: { type: "array", items: { type: "string" } }
                }
              },
              optimal_response: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string" },
                    timing: { type: "string" },
                    priority: { type: "number" }
                  }
                }
              }
            }
          }
        },
        worst_case_scenario: { type: "string" },
        portfolio_resilience_score: { type: "number" },
        systemic_risk_exposure: { type: "number" }
      }
    }
  });
  
  for (const scenario of stressTest.scenarios) {
    await context.entities.GeopoliticalEvent.create({
      event_type: 'stress_test_scenario',
      event_name: scenario.scenario_name,
      trigger_conditions: scenario.trigger_events,
      impact_assessment: scenario.direct_impact,
      cascading_effects: scenario.cascading_risks,
      user_email
    });
  }
  
  if (stressTest.systemic_risk_exposure > 70) {
    await context.entities.ProactiveAlert.create({
      alert_type: 'risk_exposure',
      severity: 'critical',
      title: 'High Systemic Risk Exposure Detected',
      description: `Portfolio has ${stressTest.systemic_risk_exposure}% systemic risk exposure`,
      suggested_actions: stressTest.scenarios[0].optimal_response.map(r => r.action),
      status: 'active'
    });
  }
  
  return {
    stress_test: stressTest,
    total_scenarios: stressTest.scenarios.length,
    worst_case_loss: Math.max(...stressTest.scenarios.map(s => s.direct_impact.value_at_risk_usd))
  };
}