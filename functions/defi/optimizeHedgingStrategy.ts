import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { strategy_id, market_conditions } = await req.json();

    // Get existing hedging strategy
    const strategy = await base44.entities.HedgingStrategy.get(strategy_id);

    // AI-powered optimization
    const optimization = await base44.integrations.Core.InvokeLLM({
      prompt: `Optimize this DeFi hedging strategy based on current market conditions.
      
      Current Strategy:
      ${JSON.stringify(strategy, null, 2)}
      
      Market Conditions:
      ${JSON.stringify(market_conditions || { volatility: 'high', trend: 'bearish' })}
      
      Provide:
      1. Optimized hedge_instruments with updated allocations
      2. Expected risk reduction
      3. Estimated cost
      4. Recommended adjustments (array)
      5. Rationale for changes
      
      Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          optimized_instruments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                instrument_type: { type: "string" },
                allocation_percentage: { type: "number" },
                expected_protection: { type: "number" }
              }
            }
          },
          risk_reduction: { type: "number" },
          cost: { type: "number" },
          adjustments: { type: "array", items: { type: "string" } },
          rationale: { type: "string" }
        }
      }
    });

    // Update strategy
    const updated = await base44.asServiceRole.entities.HedgingStrategy.update(strategy_id, {
      hedge_instruments: optimization.optimized_instruments,
      risk_reduction: optimization.risk_reduction,
      cost: optimization.cost,
      ai_optimization: {
        optimized_at: new Date().toISOString(),
        market_conditions,
        adjustments: optimization.adjustments,
        rationale: optimization.rationale
      }
    });

    return Response.json({ 
      success: true,
      optimized_strategy: updated,
      optimization_details: optimization
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});