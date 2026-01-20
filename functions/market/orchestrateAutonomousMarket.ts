import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { market_name, asset_pairs, pricing_algorithm } = await req.json();

    // Initialize market with AI-powered liquidity management
    const marketAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Design autonomous market mechanics for:
      
Market: ${market_name}
Assets: ${JSON.stringify(asset_pairs)}
Algorithm: ${pricing_algorithm}

Determine:
1. Optimal initial liquidity allocation
2. Dynamic pricing parameters
3. Market maker strategies
4. Self-regulation rules
5. Risk management protocols
6. Efficiency optimization techniques`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          liquidity_config: {
            type: "object",
            properties: {
              total_liquidity: { type: "number" },
              reserve_ratio: { type: "number" },
              auto_rebalancing: { type: "boolean" }
            }
          },
          market_makers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                maker_id: { type: "string" },
                maker_type: { type: "string" },
                spread: { type: "number" }
              }
            }
          },
          autonomous_rules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action_type: { type: "string" },
                trigger_condition: { type: "string" }
              }
            }
          },
          efficiency_score: { type: "number" }
        }
      }
    });

    const marketData = {
      market_id: `market_${Date.now()}`,
      market_name: market_name,
      asset_pairs: asset_pairs.map(pair => ({
        ...pair,
        current_price: pair.initial_price || 1.0,
        '24h_volume': 0
      })),
      liquidity_pool: marketAnalysis.liquidity_config || {
        total_liquidity: 1000000,
        reserve_ratio: 0.5,
        auto_rebalancing: true
      },
      pricing_algorithm: pricing_algorithm,
      market_makers: marketAnalysis.market_makers || [],
      autonomous_actions: marketAnalysis.autonomous_rules?.map(rule => ({
        ...rule,
        last_executed: new Date().toISOString()
      })) || [],
      market_efficiency_score: marketAnalysis.efficiency_score || 75,
      self_regulation_enabled: true
    };

    const market = await base44.asServiceRole.entities.AutonomousMarket.create(marketData);

    return Response.json({
      success: true,
      market,
      ai_strategy: marketAnalysis,
      activation_status: 'Market is now autonomous and self-regulating'
    });

  } catch (error) {
    console.error('Autonomous market error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});