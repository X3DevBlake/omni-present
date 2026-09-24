export default async function autonomousMarketPrediction(data, context) {
  const { agent_id, target_tokens, timeframe_hours = 24 } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  
  const prediction = await context.integrations.Core.InvokeLLM({
    prompt: `AI Agent autonomous market trend prediction:

Agent: ${agent.name}
Target Tokens: ${target_tokens.join(', ')}
Timeframe: ${timeframe_hours} hours

Using real-time data, predict market movements:
1. Price trends (up/down/sideways)
2. Volatility levels
3. Volume patterns
4. Whale activity signals
5. Social sentiment
6. Technical indicators
7. On-chain metrics
8. Macro economic factors

Provide actionable trading signals with confidence levels.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        predictions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              token: { type: "string" },
              current_price: { type: "number" },
              predicted_price: { type: "number" },
              price_change_percentage: { type: "number" },
              trend: { type: "string" },
              confidence: { type: "number" },
              volatility: { type: "string" },
              signals: {
                type: "object",
                properties: {
                  technical: { type: "string" },
                  sentiment: { type: "string" },
                  on_chain: { type: "string" }
                }
              },
              recommended_action: { type: "string" }
            }
          }
        },
        overall_market_sentiment: { type: "string" },
        risk_level: { type: "string" }
      }
    }
  });
  
  for (const pred of prediction.predictions) {
    await context.entities.MarketPrediction.create({
      agent_id,
      asset_symbol: pred.token,
      prediction_type: 'price',
      predicted_value: pred.predicted_price,
      confidence_score: pred.confidence,
      timeframe_hours,
      reasoning: JSON.stringify(pred.signals),
      status: 'active'
    });
  }
  
  return {
    predictions: prediction.predictions,
    market_sentiment: prediction.overall_market_sentiment,
    actionable_signals: prediction.predictions.filter(p => p.confidence > 70).length
  };
}