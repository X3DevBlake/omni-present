import { base44 } from '@/api/base44Client';

export async function executeAutomatedTrade(userEmail, agentId, tradeData) {
  const trade = {
    user_email: userEmail,
    agent_id: agentId,
    asset_symbol: tradeData.symbol,
    trade_type: tradeData.type,
    quantity: tradeData.quantity,
    price: tradeData.price || 0,
    total_value: (tradeData.price || 0) * tradeData.quantity,
    exchange: tradeData.exchange || 'binance',
    status: 'pending',
    trigger_rule: tradeData.rule,
    prediction_confidence: tradeData.confidence || 0,
    executed_at: new Date().toISOString()
  };

  const created = await base44.entities.TradeExecution.create(trade);

  // In production, would integrate with exchange APIs
  // For now, simulate execution
  if (Math.random() > 0.1) {
    await base44.entities.TradeExecution.update(created.id, {
      status: 'executed'
    });
  } else {
    await base44.entities.TradeExecution.update(created.id, {
      status: 'failed'
    });
  }

  return created;
}

export async function getUserTrades(userEmail, limit = 100) {
  return await base44.entities.TradeExecution.filter(
    { user_email: userEmail },
    '-executed_at',
    limit
  );
}

export async function calculateTradeMetrics(userEmail) {
  const trades = await getUserTrades(userEmail, 1000);
  
  const executed = trades.filter(t => t.status === 'executed');
  const successful = trades.filter(t => t.status === 'executed' && (t.profit_loss || 0) > 0);

  const totalVolume = trades.reduce((sum, t) => sum + (t.total_value || 0), 0);
  const totalPnL = trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const successRate = executed.length > 0 ? (successful.length / executed.length) * 100 : 0;

  return {
    total_trades: trades.length,
    executed_trades: executed.length,
    successful_trades: successful.length,
    success_rate: successRate,
    total_volume: totalVolume,
    total_pnl: totalPnL,
    average_confidence: trades.reduce((sum, t) => sum + (t.prediction_confidence || 0), 0) / trades.length
  };
}

export async function createTradeRule(userEmail, ruleData) {
  // Store trade rule for automation
  const rule = {
    user_email: userEmail,
    name: ruleData.name,
    condition: ruleData.condition,
    action: ruleData.action,
    enabled: true,
    created_at: new Date().toISOString()
  };

  // In production, store in dedicated TradeRule entity
  return rule;
}

export async function evaluateTradeRules(userEmail, marketData) {
  // Get active trades and check conditions
  const rules = [
    // Example rules
    {
      name: 'BTC Price Surge',
      condition: { symbol: 'BTC', changePercent: { $gt: 5 } },
      action: { type: 'buy', quantity: 0.1 }
    }
  ];

  const trades = [];

  for (const rule of rules) {
    if (evaluateCondition(rule.condition, marketData)) {
      const trade = await executeAutomatedTrade(userEmail, 'AUTO_TRADER', {
        ...rule.action,
        symbol: rule.condition.symbol,
        rule: rule.name
      });
      trades.push(trade);
    }
  }

  return trades;
}

function evaluateCondition(condition, data) {
  return Object.entries(condition).every(([key, value]) => {
    if (typeof value === 'object' && value.$gt) {
      return data[key] > value.$gt;
    }
    if (typeof value === 'object' && value.$lt) {
      return data[key] < value.$lt;
    }
    return data[key] === value;
  });
}