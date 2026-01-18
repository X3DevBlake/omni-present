export default async function automatedYieldFarming(data, context) {
  const { user_email, investment_amount, risk_tolerance = 'moderate', auto_compound = true } = data;
  
  const pools = await context.entities.LiquidityPool.filter({}).sort('-apy').limit(50);
  const userAssets = await context.entities.CryptoAsset.filter({ user_email });
  
  const strategy = await context.integrations.Core.InvokeLLM({
    prompt: `Design an automated yield farming strategy:

Investment Amount: $${investment_amount}
Risk Tolerance: ${risk_tolerance}
Auto-compound: ${auto_compound}

Available Pools (top 50 by APY):
${pools.slice(0, 20).map(p => `${p.pair}: APY ${p.apy}%, TVL $${p.tvl}, Risk: ${p.apy > 100 ? 'High' : p.apy > 50 ? 'Medium' : 'Low'}`).join('\n')}

User Assets:
${userAssets.map(a => `${a.symbol}: ${a.balance}`).join('\n')}

Create a strategy that:
1. Diversifies across 3-5 pools
2. Balances risk/reward based on tolerance
3. Maximizes APY within risk constraints
4. Considers impermanent loss
5. Plans rebalancing schedule
6. Sets up auto-compounding if enabled
7. Includes exit strategy`,
    response_json_schema: {
      type: "object",
      properties: {
        strategy_name: { type: "string" },
        positions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pool_pair: { type: "string" },
              allocation_usd: { type: "number" },
              allocation_percentage: { type: "number" },
              expected_apy: { type: "number" },
              risk_level: { type: "string" },
              assets_required: { type: "array", items: { type: "object" } }
            }
          }
        },
        rebalancing_schedule: {
          type: "object",
          properties: {
            frequency_days: { type: "number" },
            trigger_conditions: { type: "array", items: { type: "string" } },
            rebalancing_strategy: { type: "string" }
          }
        },
        compound_schedule: {
          type: "object",
          properties: {
            frequency_hours: { type: "number" },
            minimum_reward_threshold: { type: "number" }
          }
        },
        exit_strategy: {
          type: "object",
          properties: {
            stop_loss_percentage: { type: "number" },
            take_profit_percentage: { type: "number" },
            time_based_exit_days: { type: "number" }
          }
        },
        expected_annual_return: { type: "number" },
        risk_score: { type: "number" }
      }
    }
  });
  
  const farmingAgent = await context.entities.AutonomousTradingAgent.create({
    user_email,
    agent_name: `YieldFarmer_${Date.now()}`,
    strategy_type: 'yield_farming',
    investment_amount,
    risk_tolerance,
    status: 'active',
    config: {
      strategy,
      auto_compound,
      auto_rebalance: true
    }
  });
  
  for (const position of strategy.positions) {
    await context.entities.LiquidityPool.create({
      user_email,
      pair: position.pool_pair,
      amount_deposited: position.allocation_usd,
      apy: position.expected_apy,
      entry_price: 1,
      status: 'active',
      auto_compound,
      managed_by_agent: farmingAgent.id
    });
  }
  
  await context.entities.AutonomousSetting.create({
    setting_key: `yield_farming_${farmingAgent.id}`,
    setting_name: strategy.strategy_name,
    description: 'Automated yield farming strategy',
    category: 'trading',
    enabled: true,
    user_email,
    automation_level: 90
  });
  
  return {
    farming_agent: farmingAgent,
    strategy,
    positions_created: strategy.positions.length,
    expected_annual_return: strategy.expected_annual_return,
    next_rebalance: new Date(Date.now() + strategy.rebalancing_schedule.frequency_days * 24 * 60 * 60 * 1000).toISOString()
  };
}