export default async function dexAggregator(data, context) {
  const { from_token, to_token, amount, user_email } = data;
  
  const dexes = [
    { name: 'Uniswap', liquidity: 5000000, fee: 0.003 },
    { name: 'SushiSwap', liquidity: 3000000, fee: 0.003 },
    { name: 'PancakeSwap', liquidity: 4000000, fee: 0.0025 },
    { name: 'Curve', liquidity: 6000000, fee: 0.0004 },
    { name: '1inch', liquidity: 2000000, fee: 0.002 }
  ];
  
  const marketData = await context.integrations.Core.InvokeLLM({
    prompt: `Get current market prices and liquidity for token swap:
From: ${from_token}
To: ${to_token}
Amount: ${amount}`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        from_token_price: { type: "number" },
        to_token_price: { type: "number" },
        market_rate: { type: "number" }
      }
    }
  });
  
  const routes = dexes.map(dex => {
    const priceImpact = (amount / dex.liquidity) * 100;
    const effectiveRate = marketData.market_rate * (1 - priceImpact / 100);
    const outputAmount = amount * effectiveRate * (1 - dex.fee);
    const totalCost = amount - outputAmount * marketData.to_token_price / marketData.from_token_price;
    
    return {
      dex: dex.name,
      output_amount: outputAmount,
      exchange_rate: effectiveRate,
      price_impact: priceImpact,
      fee: dex.fee * 100,
      total_cost: totalCost,
      estimated_gas: 150000 + Math.random() * 50000,
      execution_time_seconds: 10 + Math.random() * 20
    };
  });
  
  routes.sort((a, b) => b.output_amount - a.output_amount);
  
  const splitRouting = await context.integrations.Core.InvokeLLM({
    prompt: `Optimize token swap across multiple DEXes:

Swap: ${amount} ${from_token} → ${to_token}

Available Routes:
${routes.map(r => `${r.dex}: Output ${r.output_amount.toFixed(4)}, Impact ${r.price_impact.toFixed(2)}%, Fee ${r.fee}%`).join('\n')}

Design optimal split routing strategy to:
1. Maximize output amount
2. Minimize price impact
3. Balance gas costs
4. Consider execution time`,
    response_json_schema: {
      type: "object",
      properties: {
        optimal_route: {
          type: "object",
          properties: {
            strategy: { type: "string" },
            splits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dex: { type: "string" },
                  percentage: { type: "number" },
                  amount: { type: "number" },
                  expected_output: { type: "number" }
                }
              }
            },
            total_output: { type: "number" },
            total_gas_estimate: { type: "number" },
            price_impact: { type: "number" },
            execution_complexity: { type: "string" }
          }
        },
        alternative_routes: { type: "array", items: { type: "object" } }
      }
    }
  });
  
  const bestRoute = splitRouting.optimal_route;
  
  await context.entities.TradeExecution.create({
    user_email,
    from_token,
    to_token,
    input_amount: amount,
    expected_output: bestRoute.total_output,
    route_strategy: bestRoute.strategy,
    dexes_used: bestRoute.splits.map(s => s.dex),
    price_impact: bestRoute.price_impact,
    estimated_gas: bestRoute.total_gas_estimate,
    status: 'pending',
    aggregator_used: true
  });
  
  return {
    optimal_route: bestRoute,
    all_routes: routes,
    savings_vs_single_dex: routes[0].output_amount < bestRoute.total_output 
      ? ((bestRoute.total_output - routes[0].output_amount) / routes[0].output_amount * 100).toFixed(2)
      : 0,
    recommendation: 'Execute split route for optimal output',
    execution_ready: true
  };
}