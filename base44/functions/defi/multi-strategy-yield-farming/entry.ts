export default async function multiStrategyYieldFarming(data, context) {
  const { agent_id, capital, risk_profile, chains } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const existingPools = await context.entities.LiquidityPool.filter({}).limit(50);
  
  const strategies = await context.integrations.Core.InvokeLLM({
    prompt: `Design multi-strategy yield farming portfolio:

Agent: ${agent.name}
Capital: $${capital}
Risk Profile: ${risk_profile}
Target Chains: ${chains.join(', ')}

Available Pools Sample:
${existingPools.slice(0, 5).map(p => `${p.pair}: ${p.apy}% APY`).join('\n')}

Create diversified yield farming strategy:
1. Stable coin farming (low risk)
2. Blue chip LP positions (medium risk)
3. Leveraged farming (high risk)
4. Auto-compounding strategies
5. Cross-chain opportunities
6. Impermanent loss hedging
7. Dynamic rebalancing rules

Optimize for risk-adjusted returns.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        strategies: {
          type: "array",
          items: {
            type: "object",
            properties: {
              strategy_name: { type: "string" },
              allocation_percentage: { type: "number" },
              allocation_amount: { type: "number" },
              protocol: { type: "string" },
              chain: { type: "string" },
              pairs: { type: "array", items: { type: "string" } },
              expected_apy: { type: "number" },
              risk_level: { type: "string" },
              auto_compound: { type: "boolean" },
              rebalance_trigger: { type: "string" }
            }
          }
        },
        overall_expected_apy: { type: "number" },
        risk_score: { type: "number" },
        diversification_score: { type: "number" }
      }
    }
  });
  
  const tradingAgent = await context.entities.AutonomousTradingAgent.create({
    user_email: agent.created_by,
    agent_name: `YieldFarmer_${agent.name}`,
    strategy_type: 'multi_strategy_yield',
    investment_amount: capital,
    risk_tolerance: risk_profile,
    status: 'active',
    config: {
      strategies: strategies.strategies,
      auto_rebalance: true,
      chains
    }
  });
  
  for (const strategy of strategies.strategies) {
    await context.entities.LiquidityPool.create({
      user_email: agent.created_by,
      pair: strategy.pairs[0] || 'ETH/USDC',
      protocol: strategy.protocol,
      amount_deposited: strategy.allocation_amount,
      apy: strategy.expected_apy,
      status: 'active',
      managed_by_agent: tradingAgent.id
    });
  }
  
  return {
    trading_agent: tradingAgent,
    strategies: strategies.strategies,
    expected_apy: strategies.overall_expected_apy,
    positions_opened: strategies.strategies.length
  };
}