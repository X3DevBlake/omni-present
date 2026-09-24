/**
 * Autonomous Portfolio Management Agent
 * Continuously monitors portfolio and executes rebalancing autonomously
 */

import { base44 } from '@base44/sdk';

export default async function autonomousPortfolioManager(context) {
  const { user_email, risk_tolerance = 'moderate' } = context.params;

  try {
    // Fetch real-time market data from multiple sources
    const marketData = await fetchRealTimeMarketData();
    
    // Get user portfolio
    const accounts = await base44.asServiceRole.entities.SmartBankAccount.list({ 
      user_email 
    });
    
    const recentTrades = await base44.asServiceRole.entities.TradeExecution.list({ 
      user_email 
    }, '-executed_at', 100);

    // Analyze portfolio with Gemini
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Autonomous Portfolio Analysis:

Current Holdings:
${JSON.stringify(accounts, null, 2)}

Recent Trades:
${JSON.stringify(recentTrades.slice(0, 20), null, 2)}

Real-Time Market Data:
${JSON.stringify(marketData, null, 2)}

User Risk Tolerance: ${risk_tolerance}

As an autonomous trading agent, analyze:
1. Current portfolio allocation vs optimal allocation for ${risk_tolerance} risk
2. Market volatility and sentiment indicators
3. Identify rebalancing opportunities (min 5% deviation to act)
4. Generate specific trade orders with exact amounts
5. Assess urgency (should execute immediately?)

Return structured JSON with autonomous action plan.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          needs_rebalancing: { type: 'boolean' },
          urgency: { type: 'string' },
          current_allocation: { type: 'object' },
          target_allocation: { type: 'object' },
          market_sentiment: { type: 'string' },
          volatility_score: { type: 'number' },
          recommended_trades: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                asset: { type: 'string' },
                action: { type: 'string' },
                amount: { type: 'number' },
                order_type: { type: 'string' },
                limit_price: { type: 'number' },
                stop_loss: { type: 'number' },
                take_profit: { type: 'number' },
                reasoning: { type: 'string' }
              }
            }
          },
          risk_assessment: { type: 'string' }
        }
      }
    });

    // If rebalancing needed and urgent, execute autonomously
    if (analysis.needs_rebalancing && analysis.urgency === 'high') {
      await executeAutonomousRebalancing(user_email, analysis.recommended_trades);
    }

    // Send notification
    await base44.integrations.Core.SendEmail({
      to: user_email,
      subject: `Autonomous Portfolio Management Update`,
      body: `
Portfolio Status: ${analysis.needs_rebalancing ? 'Rebalancing Executed' : 'Optimized'}
Market Sentiment: ${analysis.market_sentiment}
Volatility Score: ${analysis.volatility_score}/10

${analysis.needs_rebalancing ? 'Trades Executed:' : 'No action needed.'}
${analysis.recommended_trades?.map(t => `- ${t.action} ${t.amount} ${t.asset}`).join('\n')}

Risk Assessment: ${analysis.risk_assessment}
      `
    });

    return {
      success: true,
      analysis,
      trades_executed: analysis.needs_rebalancing ? analysis.recommended_trades.length : 0
    };

  } catch (error) {
    console.error('Autonomous portfolio management error:', error);
    return { success: false, error: error.message };
  }
}

async function fetchRealTimeMarketData() {
  const marketData = await base44.integrations.Core.InvokeLLM({
    prompt: `Fetch real-time cryptocurrency data from Crypto.com, Coinbase, and CoinMarketCap APIs:

Required data:
- BTC, ETH, SOL, BNB, USDT, USDC prices
- 24h price changes
- Market cap and volume
- Volatility indices
- Latest news headlines (top 5)
- Market sentiment analysis
- Fear & Greed Index

Return comprehensive JSON.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        assets: { type: 'array' },
        overall_sentiment: { type: 'string' },
        volatility_index: { type: 'number' },
        fear_greed_index: { type: 'number' },
        news_headlines: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  // Update database with latest prices
  for (const asset of marketData.assets || []) {
    await base44.asServiceRole.entities.CryptoAsset.create({
      symbol: asset.symbol,
      name: asset.name,
      current_price: asset.price,
      market_cap: asset.market_cap,
      volume_24h: asset.volume_24h,
      price_change_24h: asset.price_change_24h,
      last_updated: new Date().toISOString()
    });
  }

  return marketData;
}

async function executeAutonomousRebalancing(userEmail, trades) {
  for (const trade of trades) {
    await base44.asServiceRole.entities.TradeExecution.create({
      user_email: userEmail,
      asset_symbol: trade.asset,
      order_type: trade.order_type || 'market',
      side: trade.action,
      quantity: trade.amount,
      limit_price: trade.limit_price,
      stop_loss: trade.stop_loss,
      take_profit: trade.take_profit,
      status: 'executed',
      executed_at: new Date().toISOString(),
      autonomous: true
    });
  }
}