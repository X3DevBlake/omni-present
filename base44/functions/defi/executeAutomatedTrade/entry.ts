import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { strategy_id, amount, token_pair } = await req.json();
    
    // Get trading strategy
    const strategies = await base44.entities.TradingStrategy.filter({ id: strategy_id });
    const strategy = strategies[0];
    
    if (!strategy) {
      return Response.json({ error: 'Strategy not found' }, { status: 404 });
    }
    
    if (!strategy.is_active) {
      return Response.json({ error: 'Strategy is not active' }, { status: 400 });
    }
    
    // AI market analysis
    const marketAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze current market conditions for ${token_pair}. Should we execute this ${strategy.strategy_type} trade now?
      
      Strategy type: ${strategy.strategy_type}
      Amount: ${amount}
      Risk parameters: ${JSON.stringify(strategy.risk_parameters)}
      
      Consider: current volatility, trend direction, and optimal entry point.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          recommendation: { type: "string", enum: ["execute", "wait", "cancel"] },
          confidence: { type: "number" },
          entry_price: { type: "number" },
          stop_loss: { type: "number" },
          take_profit: { type: "number" },
          reasoning: { type: "string" }
        }
      }
    });
    
    if (marketAnalysis.recommendation !== 'execute') {
      return Response.json({
        executed: false,
        recommendation: marketAnalysis.recommendation,
        reasoning: marketAnalysis.reasoning
      });
    }
    
    // Execute trade (mock execution)
    const trade = {
      strategy_id,
      token_pair,
      amount,
      entry_price: marketAnalysis.entry_price,
      stop_loss: marketAnalysis.stop_loss,
      take_profit: marketAnalysis.take_profit,
      executed_at: new Date().toISOString(),
      status: 'open'
    };
    
    // Update strategy performance
    await base44.entities.TradingStrategy.update(strategy_id, {
      performance_metrics: {
        total_trades: (strategy.performance_metrics?.total_trades || 0) + 1,
        winning_trades: strategy.performance_metrics?.winning_trades || 0,
        total_profit_loss: strategy.performance_metrics?.total_profit_loss || 0
      }
    });
    
    return Response.json({
      executed: true,
      trade,
      analysis: marketAnalysis
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});