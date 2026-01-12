import { base44 } from '@/api/base44Client';

/**
 * AI Trading Engine - Advanced DeFi Trading Strategies
 */

// Generate AI trading strategy
export async function generateTradingStrategy(userEmail, preferences) {
  try {
    const { risk_level = 'moderate', portfolio_size, target_assets } = preferences;

    // Fetch market data
    const assets = await base44.entities.CryptoAsset.list('', '', 100);
    const userTrades = await base44.entities.TradeExecution.list(
      { user_email: userEmail },
      '-created_date',
      50
    );

    const prompt = `Generate an advanced DeFi trading strategy:

Risk Level: ${risk_level}
Portfolio Size: $${portfolio_size}
Target Assets: ${target_assets?.join(', ') || 'Auto-select'}
Current Market Data: ${JSON.stringify(assets.slice(0, 20), null, 2)}
User's Trading History: ${JSON.stringify(userTrades.slice(0, 10), null, 2)}

Analyze:
1. Market sentiment (bullish/bearish/neutral)
2. News impact analysis
3. Recommended buy/sell actions with entry/exit points
4. Risk assessment
5. Expected ROI
6. Confidence score (0-100)
7. Time horizon (short/medium/long term)

Return as JSON.`;

    const strategy = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          strategy_name: { type: 'string' },
          market_sentiment: { type: 'object' },
          news_analysis: { type: 'array', items: { type: 'object' } },
          recommended_actions: { type: 'array', items: { type: 'object' } },
          risk_level: { type: 'string' },
          confidence_score: { type: 'number' },
          expected_roi: { type: 'number' },
          time_horizon: { type: 'string' }
        }
      }
    });

    // Save strategy
    const savedStrategy = await base44.entities.TradingStrategy.create({
      user_email: userEmail,
      agent_id: 'ai_trading_agent',
      ...strategy,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    });

    return savedStrategy;
  } catch (error) {
    console.error('Error generating strategy:', error);
    throw error;
  }
}

// Analyze market predictions
export async function analyzeMarketPredictions(symbols) {
  try {
    const prompt = `Analyze market predictions for these assets: ${symbols.join(', ')}

Use real-time data and provide:
1. Price predictions (24h, 7d, 30d)
2. Volatility forecast
3. Support/resistance levels
4. Trading volume trends
5. Whale activity detection
6. News sentiment impact
7. Technical indicators (RSI, MACD, Bollinger Bands)

Return as JSON.`;

    const predictions = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          predictions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                price_24h: { type: 'number' },
                price_7d: { type: 'number' },
                price_30d: { type: 'number' },
                volatility: { type: 'number' },
                support_level: { type: 'number' },
                resistance_level: { type: 'number' },
                sentiment: { type: 'string' },
                confidence: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Save predictions
    for (const pred of predictions.predictions || []) {
      await base44.entities.MarketPrediction.create({
        symbol: pred.symbol,
        ...pred,
        created_at: new Date().toISOString()
      });
    }

    return predictions.predictions;
  } catch (error) {
    console.error('Error analyzing predictions:', error);
    throw error;
  }
}

// Execute automated trade
export async function executeAutomatedTrade(userEmail, action) {
  try {
    const { symbol, action_type, amount, price_limit } = action;

    // Validate trade
    const validation = await validateTrade(userEmail, action);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Execute trade
    const trade = await base44.entities.TradeExecution.create({
      user_email: userEmail,
      symbol,
      action_type,
      amount,
      price_limit,
      status: 'pending',
      executed_at: new Date().toISOString()
    });

    // Simulate execution (in production, integrate with actual DEX)
    setTimeout(async () => {
      await base44.entities.TradeExecution.update(trade.id, {
        status: 'completed',
        execution_price: price_limit,
        fees: amount * 0.003 // 0.3% fee
      });
    }, 1000);

    return trade;
  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
}

// Validate trade before execution
async function validateTrade(userEmail, action) {
  try {
    const accounts = await base44.entities.SmartBankAccount.list({ user_email: userEmail });
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    if (action.action_type === 'buy' && action.amount > totalBalance) {
      return { valid: false, reason: 'Insufficient balance' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: error.message };
  }
}

// Portfolio optimization
export async function optimizePortfolio(userEmail) {
  try {
    const accounts = await base44.entities.SmartBankAccount.list({ user_email: userEmail });
    const trades = await base44.entities.TradeExecution.list(
      { user_email: userEmail },
      '-created_date',
      100
    );

    const prompt = `Optimize this DeFi portfolio:

Accounts: ${JSON.stringify(accounts, null, 2)}
Recent Trades: ${JSON.stringify(trades.slice(0, 20), null, 2)}

Provide:
1. Diversification score (0-100)
2. Risk-adjusted return
3. Rebalancing recommendations
4. Asset allocation strategy
5. Hedging opportunities
6. Yield farming suggestions

Return as JSON.`;

    const optimization = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          diversification_score: { type: 'number' },
          risk_adjusted_return: { type: 'number' },
          recommendations: { type: 'array', items: { type: 'object' } },
          allocation_strategy: { type: 'object' },
          hedging_opportunities: { type: 'array' }
        }
      }
    });

    return optimization;
  } catch (error) {
    console.error('Error optimizing portfolio:', error);
    throw error;
  }
}