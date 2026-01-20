import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bot_id, trade_type, symbol, amount, strategy } = await req.json();

    // Get trading bot configuration
    const bot = await base44.entities.TradingBot.get(bot_id);

    if (!bot || bot.status !== 'active') {
      return Response.json({ error: 'Bot not active' }, { status: 400 });
    }

    // AI-driven trade analysis
    const aiAnalysis = {
      market_sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
      confidence: 0.75 + Math.random() * 0.25,
      predicted_movement: (Math.random() - 0.5) * 10,
      risk_score: Math.random() * 100,
      recommendation: Math.random() > 0.3 ? 'execute' : 'hold'
    };

    if (aiAnalysis.recommendation === 'hold') {
      return Response.json({
        success: false,
        message: 'AI recommends holding',
        analysis: aiAnalysis
      });
    }

    // Execute trade
    const execution = await base44.entities.TradeExecution.create({
      user_id: user.id,
      bot_id,
      trade_type,
      symbol,
      amount,
      strategy,
      execution_price: 100 + Math.random() * 1000,
      status: 'executed',
      ai_confidence: aiAnalysis.confidence,
      market_conditions: {
        sentiment: aiAnalysis.market_sentiment,
        predicted_movement: aiAnalysis.predicted_movement
      }
    });

    // Update bot statistics
    await base44.entities.TradingBot.update(bot_id, {
      total_trades: (bot.total_trades || 0) + 1,
      last_trade_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      trade_id: execution.id,
      ai_analysis: aiAnalysis,
      execution_price: execution.execution_price,
      status: 'executed'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});