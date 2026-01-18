export default async function dexAggregatorOptimizer(data, context) {
  const { from_token, to_token, amount, from_chain, max_slippage = 1 } = data;
  
  const routes = await context.integrations.Core.InvokeLLM({
    prompt: `DEX Aggregator optimal route finding:

Trade: ${amount} ${from_token} → ${to_token}
Chain: ${from_chain}
Max Slippage: ${max_slippage}%

Find optimal routes across:
1. Uniswap V2/V3
2. SushiSwap
3. Curve
4. Balancer
5. 1inch
6. PancakeSwap
7. Cross-chain bridges

Optimize for:
- Best price execution
- Minimal gas costs
- Lowest slippage
- Split orders if beneficial
- MEV protection`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        routes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              route_id: { type: "string" },
              dexes: { type: "array", items: { type: "string" } },
              path: { type: "array", items: { type: "string" } },
              expected_output: { type: "number" },
              gas_cost_usd: { type: "number" },
              slippage: { type: "number" },
              price_impact: { type: "number" },
              execution_time_seconds: { type: "number" },
              split_trades: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    dex: { type: "string" },
                    percentage: { type: "number" }
                  }
                }
              }
            }
          }
        },
        recommended_route: { type: "string" },
        total_savings_vs_direct: { type: "number" }
      }
    }
  });
  
  const optimalRoute = routes.routes.find(r => r.route_id === routes.recommended_route);
  
  await context.entities.TradeExecution.create({
    from_token,
    to_token,
    input_amount: amount,
    expected_output: optimalRoute.expected_output,
    route_strategy: 'dex_aggregator',
    status: 'pending',
    trade_type: 'swap',
    metadata: {
      dexes: optimalRoute.dexes,
      path: optimalRoute.path,
      gas_cost: optimalRoute.gas_cost_usd,
      slippage: optimalRoute.slippage
    }
  });
  
  return {
    routes: routes.routes,
    optimal_route: optimalRoute,
    savings: routes.total_savings_vs_direct
  };
}