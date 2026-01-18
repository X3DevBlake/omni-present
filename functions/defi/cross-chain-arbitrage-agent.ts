export default async function crossChainArbitrageAgent(data, context) {
  const { agent_id, capital, target_chains, min_profit_percentage = 2 } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  
  const opportunities = await context.integrations.Core.InvokeLLM({
    prompt: `Identify cross-chain arbitrage opportunities:

Agent: ${agent.name}
Capital: $${capital}
Chains: ${target_chains.join(', ')}
Min Profit: ${min_profit_percentage}%

Scan for arbitrage across:
1. Price differences between DEXes
2. Cross-chain bridge inefficiencies
3. Liquidation opportunities
4. Flash loan arbitrage
5. Triangle arbitrage
6. Statistical arbitrage

Calculate:
- Net profit after gas/fees
- Execution time
- Capital requirements
- Risk factors`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              opportunity_id: { type: "string" },
              type: { type: "string" },
              token: { type: "string" },
              buy_chain: { type: "string" },
              buy_dex: { type: "string" },
              buy_price: { type: "number" },
              sell_chain: { type: "string" },
              sell_dex: { type: "string" },
              sell_price: { type: "number" },
              gross_profit_percentage: { type: "number" },
              net_profit_usd: { type: "number" },
              total_fees: { type: "number" },
              execution_time_seconds: { type: "number" },
              capital_required: { type: "number" },
              risk_score: { type: "number" }
            }
          }
        },
        best_opportunity: { type: "string" },
        total_opportunities: { type: "number" }
      }
    }
  });
  
  const bestOpportunity = opportunities.opportunities.find(
    o => o.opportunity_id === opportunities.best_opportunity
  );
  
  if (bestOpportunity && bestOpportunity.net_profit_usd > 0) {
    await context.entities.TradeExecution.create({
      from_token: bestOpportunity.token,
      to_token: 'USDC',
      input_amount: bestOpportunity.capital_required,
      expected_output: bestOpportunity.capital_required + bestOpportunity.net_profit_usd,
      route_strategy: 'cross_chain_arbitrage',
      status: 'pending',
      trade_type: 'arbitrage',
      metadata: {
        buy_chain: bestOpportunity.buy_chain,
        sell_chain: bestOpportunity.sell_chain,
        expected_profit: bestOpportunity.net_profit_usd
      }
    });
  }
  
  return {
    opportunities: opportunities.opportunities,
    best_opportunity: bestOpportunity,
    total_found: opportunities.total_opportunities
  };
}