import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get DeFi market data
    const cryptoAssets = await base44.asServiceRole.entities.CryptoAssetData.list();
    const liquidityPools = await base44.asServiceRole.entities.EnhancedLiquidityPool.list();
    
    // Calculate market volatility metrics
    const avgVolatility = cryptoAssets.reduce((sum, a) => sum + (a.volatility_24h || 0), 0) / cryptoAssets.length;
    const highVolatilityAssets = cryptoAssets.filter(a => (a.volatility_24h || 0) > avgVolatility * 1.5);
    const marketTrend = cryptoAssets.filter(a => (a.price_24h_change || 0) > 0).length / cryptoAssets.length;
    
    // AI-powered scenario generation based on market data
    const scenarioConfig = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate dynamic simulation scenario based on real DeFi market conditions:
      
      Market Volatility: ${avgVolatility.toFixed(2)}%
      High Volatility Assets: ${highVolatilityAssets.length}
      Market Trend: ${(marketTrend * 100).toFixed(0)}% bullish
      Total Liquidity: ${liquidityPools.reduce((sum, p) => sum + (p.tvl_usd || 0), 0)}
      
      Create challenging simulation parameters that reflect current market chaos and opportunities.`,
      response_json_schema: {
        type: "object",
        properties: {
          scenario_name: { type: "string" },
          difficulty_multiplier: { type: "number" },
          volatility_injection: { type: "number" },
          market_events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event_type: { type: "string" },
                timing: { type: "number" },
                impact_severity: { type: "number" }
              }
            }
          },
          resource_scarcity: { type: "number" },
          cooperation_incentive: { type: "number" }
        }
      }
    });
    
    // Create dynamic simulation scenario
    const scenario = await base44.asServiceRole.entities.DynamicSimulationScenario.create({
      scenario_name: scenarioConfig.scenario_name,
      environment_id: 'market_driven',
      ai_generated_parameters: {
        volatility_level: avgVolatility,
        market_trend: marketTrend,
        difficulty_multiplier: scenarioConfig.difficulty_multiplier,
        market_events: scenarioConfig.market_events
      },
      adaptive_rules: scenarioConfig.market_events.map(event => ({
        rule_name: `Market_${event.event_type}`,
        condition: `volatility > ${event.impact_severity}`,
        adaptation: `adjust_difficulty_${event.timing}`,
        triggered: false
      })),
      complexity_level: Math.min(10, 5 + avgVolatility / 10)
    });
    
    // Create cross-hub link
    const existingLink = await base44.asServiceRole.entities.CrossHubLink.filter({
      source_hub: 'defi',
      target_hub: 'simulation'
    });
    
    if (existingLink.length > 0) {
      await base44.asServiceRole.entities.CrossHubLink.update(existingLink[0].id, {
        last_sync: new Date().toISOString(),
        link_strength: scenarioConfig.difficulty_multiplier * 10,
        correlation_coefficient: 0.85
      });
    } else {
      await base44.asServiceRole.entities.CrossHubLink.create({
        source_hub: 'defi',
        target_hub: 'simulation',
        data_type: 'market_volatility',
        link_strength: scenarioConfig.difficulty_multiplier * 10,
        sync_frequency_minutes: 5,
        last_sync: new Date().toISOString(),
        correlation_coefficient: 0.85
      });
    }
    
    return Response.json({
      scenario,
      market_metrics: {
        volatility: avgVolatility,
        trend: marketTrend,
        high_vol_count: highVolatilityAssets.length
      },
      sync_status: 'success'
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});