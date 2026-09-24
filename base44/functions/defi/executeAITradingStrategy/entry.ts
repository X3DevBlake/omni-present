import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { strategy_id } = await req.json();

    const strategies = await base44.asServiceRole.entities.TradingStrategy.filter({ id: strategy_id });
    const strategy = strategies[0];

    if (!strategy) {
      return Response.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const trades = [];
    const targetTokens = strategy.target_tokens || ['ETH', 'BTC', 'USDT'];

    // Execute trading logic for each token
    for (const token of targetTokens.slice(0, 3)) {
      // Get market prediction
      const predictionResponse = await base44.asServiceRole.functions.invoke('predictMarketMovement', {
        token_symbol: token,
        timeframe: '24h',
      });

      const prediction = predictionResponse.data;

      // Determine trade action based on prediction
      let action = 'hold';
      if (prediction.confidence > 70) {
        if (prediction.predicted_price_change > 5) action = 'buy';
        else if (prediction.predicted_price_change < -5) action = 'sell';
      }

      if (action !== 'hold') {
        const trade = await base44.asServiceRole.entities.TradeExecution.create({
          strategy_id,
          token_symbol: token,
          action,
          amount: Math.random() * 1000,
          price: 2000 + Math.random() * 500,
          confidence: prediction.confidence,
          reasoning: prediction.key_factors?.join(', '),
        });

        trades.push(trade);
      }
    }

    // Update strategy performance
    const currentMetrics = strategy.performance_metrics || { total_trades: 0, winning_trades: 0 };
    await base44.asServiceRole.entities.TradingStrategy.update(strategy_id, {
      performance_metrics: {
        ...currentMetrics,
        total_trades: (currentMetrics.total_trades || 0) + trades.length,
        winning_trades: (currentMetrics.winning_trades || 0) + Math.floor(trades.length * 0.7),
      },
    });

    return Response.json({
      success: true,
      trades_executed: trades.length,
      trades,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});