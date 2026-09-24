export default async function dynamicHedgingGenerator(data, context) {
  const { user_email, risk_profile, market_conditions } = data;
  
  const assets = await context.entities.CryptoAsset.filter({ user_email });
  const recentAlerts = await context.entities.ProactiveAlert.filter({
    status: 'active',
    severity: { $in: ['critical', 'high'] }
  }).limit(10);
  
  const portfolioValue = assets.reduce((sum, a) => sum + (a.balance * (a.current_price || 0)), 0);
  
  const hedgeStrategy = await context.integrations.Core.InvokeLLM({
    prompt: `Generate dynamic hedging strategy based on real-time risk assessment:

Portfolio Value: $${portfolioValue.toFixed(2)}
Risk Profile: ${risk_profile}
Active Alerts: ${recentAlerts.length}

Assets:
${assets.map(a => `${a.symbol}: ${a.balance} ($${(a.balance * (a.current_price || 0)).toFixed(2)})`).join('\n')}

Market Conditions:
${JSON.stringify(market_conditions, null, 2)}

Recent Risks:
${recentAlerts.map(a => `- ${a.title} (${a.severity})`).join('\n')}

Generate multi-layered hedging strategy:
1. Direct hedges (inverse positions)
2. Options strategies (protective puts, collars)
3. Stablecoin allocation
4. Diversification rebalancing
5. Dynamic position sizing
6. Stop-loss cascades
7. Cross-chain hedges

For each hedge:
- Execution priority
- Cost/benefit analysis
- Implementation timeframe
- Risk reduction percentage`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        strategy_name: { type: "string" },
        total_hedge_cost_usd: { type: "number" },
        expected_risk_reduction: { type: "number" },
        hedges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              hedge_type: { type: "string" },
              priority: { type: "number" },
              asset_from: { type: "string" },
              asset_to: { type: "string" },
              amount: { type: "number" },
              execution_window_hours: { type: "number" },
              cost_usd: { type: "number" },
              risk_reduction_percentage: { type: "number" },
              implementation_steps: { type: "array", items: { type: "string" } },
              trigger_conditions: { type: "array", items: { type: "string" } },
              exit_strategy: { type: "string" }
            }
          }
        },
        dynamic_adjustments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              condition: { type: "string" },
              adjustment_action: { type: "string" },
              new_allocation: { type: "object" }
            }
          }
        },
        performance_monitoring: {
          type: "object",
          properties: {
            metrics_to_track: { type: "array", items: { type: "string" } },
            rebalance_frequency_hours: { type: "number" },
            stop_loss_threshold: { type: "number" }
          }
        }
      }
    }
  });
  
  const hedgingAgent = await context.entities.AutonomousTradingAgent.create({
    user_email,
    agent_name: `DynamicHedge_${Date.now()}`,
    strategy_type: 'dynamic_hedging',
    investment_amount: portfolioValue,
    risk_tolerance: risk_profile,
    status: 'active',
    config: {
      strategy: hedgeStrategy,
      auto_rebalance: true,
      dynamic_adjustments: true
    }
  });
  
  for (const hedge of hedgeStrategy.hedges.slice(0, 3)) {
    await context.entities.TradeExecution.create({
      user_email,
      from_token: hedge.asset_from,
      to_token: hedge.asset_to,
      input_amount: hedge.amount,
      expected_output: hedge.amount * 0.99,
      route_strategy: 'hedge',
      status: 'pending',
      trade_type: 'hedge',
      managed_by_agent: hedgingAgent.id,
      metadata: {
        hedge_type: hedge.hedge_type,
        risk_reduction: hedge.risk_reduction_percentage
      }
    });
  }
  
  return {
    hedging_agent: hedgingAgent,
    strategy: hedgeStrategy,
    hedges_created: hedgeStrategy.hedges.length,
    total_cost: hedgeStrategy.total_hedge_cost_usd,
    risk_reduction: hedgeStrategy.expected_risk_reduction
  };
}