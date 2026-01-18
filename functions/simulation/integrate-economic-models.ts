export default async function integrateEconomicModels(data, context) {
  const { scenario_id, market_symbols = ['BTC', 'ETH'], economic_indicators = true } = data;
  
  const scenario = await context.entities.SimulationScenario.get(scenario_id);
  const marketData = await context.entities.MarketAsset.filter({
    symbol: { $in: market_symbols }
  }).sort('-created_date').limit(100);
  
  const economicData = await context.integrations.Core.InvokeLLM({
    prompt: `Generate realistic economic model parameters for simulation:

Market Context:
${market_symbols.map(symbol => {
  const data = marketData.filter(m => m.symbol === symbol).slice(0, 10);
  return `${symbol}: Current $${data[0]?.price}, Volatility ${Math.random() * 20}%`;
}).join('\n')}

Generate:
1. Supply/demand curves
2. Market maker behaviors
3. Price impact functions
4. Liquidity depth models
5. Volatility patterns
6. Market cycles (bull/bear)
7. External shock scenarios`,
    response_json_schema: {
      type: "object",
      properties: {
        supply_demand: {
          type: "object",
          properties: {
            equilibrium_price: { type: "number" },
            elasticity: { type: "number" },
            supply_curve: { type: "array", items: { type: "object" } },
            demand_curve: { type: "array", items: { type: "object" } }
          }
        },
        market_makers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              strategy: { type: "string" },
              liquidity_depth: { type: "number" },
              spread: { type: "number" }
            }
          }
        },
        volatility_model: {
          type: "object",
          properties: {
            base_volatility: { type: "number" },
            shock_probability: { type: "number" },
            mean_reversion_rate: { type: "number" }
          }
        },
        market_cycles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phase: { type: "string" },
              duration_days: { type: "number" },
              price_multiplier: { type: "number" }
            }
          }
        }
      }
    }
  });
  
  const integratedEnvironment = {
    ...scenario.environment_factors,
    economic_model: economicData,
    real_world_data: marketData.map(m => ({
      symbol: m.symbol,
      price: m.price,
      volume: m.volume_24h,
      timestamp: m.created_date
    })),
    simulation_parameters: {
      time_scale: 1,
      market_open: true,
      trading_enabled: true,
      external_events_enabled: true
    }
  };
  
  await context.entities.SimulationScenario.update(scenario_id, {
    environment_factors: integratedEnvironment
  });
  
  const simulationSteps = [];
  let currentPrices = {};
  market_symbols.forEach(symbol => {
    const latest = marketData.find(m => m.symbol === symbol);
    currentPrices[symbol] = latest?.price || 1000;
  });
  
  for (let step = 0; step < 100; step++) {
    market_symbols.forEach(symbol => {
      const volatility = economicData.volatility_model.base_volatility;
      const change = (Math.random() - 0.5) * 2 * volatility * currentPrices[symbol];
      currentPrices[symbol] += change;
      currentPrices[symbol] = Math.max(currentPrices[symbol], 1);
    });
    
    simulationSteps.push({
      step,
      prices: { ...currentPrices },
      market_phase: economicData.market_cycles[Math.floor(step / 25)]?.phase
    });
  }
  
  return {
    economic_model: economicData,
    simulation_preview: simulationSteps,
    market_symbols,
    integration_complete: true
  };
}