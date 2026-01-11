import { base44 } from '@/api/base44Client';

export async function executeHighFrequencyTrading(agentId, userEmail) {
  const agent = await base44.entities.AutonomousTradingAgent.filter({ id: agentId });
  if (agent.length === 0 || !agent[0].permissions_granted) {
    return { error: 'Not authorized' };
  }

  const agentData = agent[0];
  const availableFunds = agentData.account_balance;

  // Real-time market analysis
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze current crypto market for high-frequency trading opportunities. Available: $${availableFunds}. Identify micro-trends for 1-5 second hold positions. Return top 3 opportunities with entry/exit prices.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        opportunities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              symbol: { type: 'string' },
              entry_price: { type: 'number' },
              target_exit: { type: 'number' },
              quantity: { type: 'number' },
              hold_seconds: { type: 'number' },
              confidence: { type: 'number' }
            }
          }
        }
      }
    }
  });

  const trades = [];

  for (const opp of analysis.opportunities) {
    if (opp.quantity * opp.entry_price <= availableFunds) {
      // Execute trade
      const trade = await simulateHFTrade(userEmail, agentId, opp);
      trades.push(trade);
      
      // Record trade
      await base44.entities.HighFrequencyTrade.create({
        user_email: userEmail,
        agent_id: agentId,
        asset_symbol: opp.symbol,
        entry_price: opp.entry_price,
        exit_price: trade.exitPrice,
        quantity: opp.quantity,
        hold_duration_seconds: opp.hold_seconds,
        profit_loss: trade.profit,
        execution_time: new Date().toISOString(),
        strategy_used: 'hft_momentum',
        market_conditions: { volatility: 'high' }
      });
    }
  }

  return { trades, total_profit: trades.reduce((sum, t) => sum + t.profit, 0) };
}

async function simulateHFTrade(userEmail, agentId, opportunity) {
  // Simulate quick trade execution
  const slippage = (Math.random() - 0.5) * 0.001; // 0.1% slippage
  const exitPrice = opportunity.target_exit * (1 + slippage);
  const profit = (exitPrice - opportunity.entry_price) * opportunity.quantity;

  return {
    symbol: opportunity.symbol,
    entryPrice: opportunity.entry_price,
    exitPrice,
    profit,
    holdSeconds: opportunity.hold_seconds
  };
}

export async function depositHourlyProfits(agentId, userEmail) {
  // Get all HF trades from last hour
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const trades = await base44.entities.HighFrequencyTrade.filter({ 
    agent_id: agentId,
    user_email: userEmail
  });

  const recentTrades = trades.filter(t => t.execution_time >= oneHourAgo);
  const hourlyProfit = recentTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

  if (hourlyProfit > 0) {
    // Deposit to user account
    await base44.entities.AutomatedTransaction.create({
      user_email: userEmail,
      transaction_type: 'deposit',
      amount: hourlyProfit,
      recipient: 'user_bank_account',
      trigger_rule: 'hourly_hft_profit_deposit',
      payment_gateway: 'plaid',
      status: 'pending'
    });

    return { deposited: hourlyProfit, trades_count: recentTrades.length };
  }

  return { deposited: 0, trades_count: recentTrades.length };
}

export async function maintainLiquidity(agentId, userEmail, targetLiquidity) {
  // Ensure user always has access to their funds
  const agent = await base44.entities.AutonomousTradingAgent.filter({ id: agentId });
  if (agent.length === 0) return null;

  const accounts = await base44.entities.OmniBankAccount.filter({ user_email: userEmail }).catch(() => []);
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  if (totalBalance < targetLiquidity) {
    // Instantly liquidate HFT positions to restore liquidity
    console.log(`Restoring liquidity: Need $${targetLiquidity - totalBalance}`);
    return { action: 'liquidate_positions', amount_needed: targetLiquidity - totalBalance };
  }

  return { action: 'none', liquidity: 'sufficient' };
}