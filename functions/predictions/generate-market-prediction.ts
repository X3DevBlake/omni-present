export default async function generateMarketPrediction(data, context) {
  const { asset_symbol, prediction_horizon_days = 7 } = data;
  
  const historicalData = await context.entities.MarketAsset.filter({
    symbol: asset_symbol
  }).sort('-created_date').limit(30);
  
  if (historicalData.length < 10) {
    return { error: 'Insufficient historical data' };
  }
  
  const prices = historicalData.map(d => d.price);
  const volumes = historicalData.map(d => d.volume_24h);
  
  const prediction = await context.integrations.Core.InvokeLLM({
    prompt: `Predict market movement for ${asset_symbol} over next ${prediction_horizon_days} days.

Recent prices (last 30 days): ${prices.slice(0, 10).join(', ')}
Recent volumes: ${volumes.slice(0, 10).join(', ')}
Current price: $${prices[0]}

Provide:
1. Price prediction for each day
2. Confidence level
3. Key factors influencing prediction
4. Risk assessment`,
    response_json_schema: {
      type: "object",
      properties: {
        predicted_prices: { type: "array", items: { type: "number" } },
        confidence: { type: "number" },
        direction: { type: "string", enum: ["bullish", "bearish", "neutral"] },
        key_factors: { type: "array", items: { type: "string" } },
        risk_level: { type: "string" },
        support_level: { type: "number" },
        resistance_level: { type: "number" }
      }
    }
  });
  
  await context.entities.MarketPrediction.create({
    asset_symbol,
    prediction_horizon_days,
    predicted_price: prediction.predicted_prices[prediction.predicted_prices.length - 1],
    confidence: prediction.confidence,
    direction: prediction.direction,
    factors: prediction.key_factors,
    user_email: context.user.email
  });
  
  return prediction;
}