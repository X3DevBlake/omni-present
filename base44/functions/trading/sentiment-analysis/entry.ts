import { base44 } from '@/api/base44Client';

export async function generateRealtimeTradingStrategy(userEmail, agentId) {
  // Analyze market sentiment and news
  const sentimentAnalysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze current cryptocurrency and stock market sentiment. Research latest news, social media trends, and market indicators. Generate real-time trading strategy with specific entry/exit points.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        market_sentiment: {
          type: 'object',
          properties: {
            overall: { type: 'string' },
            bullish_assets: { type: 'array', items: { type: 'string' } },
            bearish_assets: { type: 'array', items: { type: 'string' } }
          }
        },
        news_analysis: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              headline: { type: 'string' },
              impact: { type: 'string' },
              affected_assets: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        recommended_actions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string' },
              asset: { type: 'string' },
              entry_price: { type: 'number' },
              target_price: { type: 'number' },
              confidence: { type: 'number' }
            }
          }
        }
      }
    }
  });

  const strategy = {
    user_email: userEmail,
    agent_id: agentId,
    strategy_name: `Sentiment_${Date.now()}`,
    market_sentiment: sentimentAnalysis.market_sentiment,
    news_analysis: sentimentAnalysis.news_analysis,
    recommended_actions: sentimentAnalysis.recommended_actions,
    risk_level: 'moderate',
    confidence_score: 85,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    status: 'active'
  };

  return await base44.entities.TradingStrategy.create(strategy);
}

export async function executeStrategyTrades(strategyId) {
  const strategy = await base44.entities.TradingStrategy.filter({ id: strategyId });
  if (strategy.length === 0) return null;

  const strategyData = strategy[0];
  const trades = [];

  for (const action of strategyData.recommended_actions) {
    const trade = await base44.entities.TradeExecution.create({
      user_email: strategyData.user_email,
      agent_id: strategyData.agent_id,
      asset_symbol: action.asset,
      trade_type: action.action === 'buy' ? 'buy' : 'sell',
      quantity: 1,
      price: action.entry_price,
      total_value: action.entry_price,
      exchange: 'binance',
      status: 'pending',
      trigger_rule: 'sentiment_strategy',
      prediction_confidence: action.confidence
    });

    trades.push(trade);
  }

  return trades;
}