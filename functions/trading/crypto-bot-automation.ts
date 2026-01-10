import { base44 } from '@/api/base44Client';

export async function createTradingBot(userEmail, botConfig) {
  const bot = {
    user_email: userEmail,
    bot_name: botConfig.name,
    exchange: botConfig.exchange,
    api_key_encrypted: encryptAPIKey(botConfig.apiKey),
    strategy: botConfig.strategy,
    risk_level: botConfig.riskLevel || 'moderate',
    daily_loss_limit: botConfig.dailyLossLimit || 5,
    config: botConfig.config,
    status: 'inactive'
  };

  return await base44.entities.TradingBot.create(bot);
}

export async function startTradingBot(botId) {
  return await base44.entities.TradingBot.update(botId, {
    status: 'running',
    trades_executed: 0,
    win_rate: 0,
    total_pnl: 0
  });
}

export async function executeTrade(botId, symbol, side, quantity, price) {
  const trade = {
    bot_id: botId,
    symbol,
    side,
    quantity,
    price,
    executed_at: new Date().toISOString(),
    status: 'completed'
  };

  // Simulate trade execution (in production, call exchange API)
  const pnl = side === 'sell' ? quantity * price : -quantity * price;
  
  const bot = await base44.entities.TradingBot.filter({ id: botId });
  if (bot.length > 0) {
    await base44.entities.TradingBot.update(botId, {
      total_pnl: (bot[0].total_pnl || 0) + pnl,
      trades_executed: (bot[0].trades_executed || 0) + 1,
      win_rate: calculateWinRate(pnl)
    });
  }

  return trade;
}

export async function getTradingPerformance(botId) {
  const bot = await base44.entities.TradingBot.filter({ id: botId });
  if (bot.length === 0) return null;

  const botData = bot[0];
  return {
    total_pnl: botData.total_pnl,
    trades_executed: botData.trades_executed,
    win_rate: botData.win_rate,
    roi: botData.total_pnl ? Math.round((botData.total_pnl / 10000) * 100) : 0, // Assuming 10k initial
    status: botData.status
  };
}

function encryptAPIKey(key) {
  // Use proper encryption in production
  return Buffer.from(key).toString('base64');
}

function calculateWinRate(pnl) {
  return pnl > 0 ? 1 : 0;
}

export async function getBotExecutionLogs(botId, limit = 50) {
  // Fetch execution history (would come from detailed trade logs)
  return {
    bot_id: botId,
    recent_trades: [],
    errors: [],
    last_execution: new Date().toISOString()
  };
}