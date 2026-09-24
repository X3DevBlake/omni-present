import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token_symbol, timeframe = '24h' } = await req.json();

    // Use AI to predict market movement
    const prediction = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As a DeFi market prediction AI, analyze the ${token_symbol} token and provide:

1. Price prediction for next ${timeframe}
2. Confidence score (0-100)
3. Key factors influencing the prediction
4. Risk level (low, medium, high)
5. Recommended action (buy, sell, hold)
6. Optimal entry and exit points
7. Market sentiment analysis

Provide data-driven analysis based on typical DeFi market patterns.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          predicted_price_change: { type: "number" },
          confidence: { type: "number" },
          key_factors: { type: "array", items: { type: "string" } },
          risk_level: { type: "string" },
          recommended_action: { type: "string" },
          entry_point: { type: "number" },
          exit_point: { type: "number" },
          market_sentiment: { type: "string" }
        }
      }
    });

    // Store prediction
    await base44.asServiceRole.entities.MarketPrediction.create({
      token_symbol,
      prediction_type: 'price_movement',
      timeframe,
      predicted_value: prediction.predicted_price_change,
      confidence_score: prediction.confidence,
      factors: prediction.key_factors,
      model_used: 'ai_market_predictor_v1',
    });

    return Response.json({
      success: true,
      ...prediction,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});