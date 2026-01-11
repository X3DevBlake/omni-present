import { base44 } from '@/api/base44Client';

export async function createAutonomousAgent(userEmail, agentName, plaidToken, permissions) {
  const agent = {
    user_email: userEmail,
    agent_name: agentName,
    plaid_access_token: plaidToken, // Should be encrypted in production
    authorized_actions: permissions.actions || ['view_balance', 'analyze_transactions'],
    trading_limits: {
      daily_limit: permissions.dailyLimit || 1000,
      monthly_limit: permissions.monthlyLimit || 10000,
      max_single_trade: permissions.maxTrade || 500
    },
    deposit_percentage: permissions.depositPercentage || 70,
    task_execution: {
      enabled: false,
      allowed_tasks: []
    },
    account_balance: 0,
    status: 'paused',
    permissions_granted: permissions.granted || false
  };

  return await base44.entities.AutonomousTradingAgent.create(agent);
}

export async function analyzeAccountAndTrade(agentId) {
  const agent = await base44.entities.AutonomousTradingAgent.filter({ id: agentId });
  if (agent.length === 0 || !agent[0].permissions_granted) {
    return { error: 'Agent not authorized' };
  }

  const agentData = agent[0];

  // Analyze Plaid account data
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze financial account for trading opportunities. Balance: ${agentData.account_balance}, Daily limit: ${agentData.trading_limits.daily_limit}. Research current market conditions and identify profitable trades within risk parameters.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        recommendations: { type: 'array', items: { type: 'object' } },
        risk_level: { type: 'string' },
        estimated_return: { type: 'number' }
      }
    }
  });

  // Execute recommended trades if within limits
  const trades = [];
  for (const rec of analysis.recommendations || []) {
    if (rec.amount <= agentData.trading_limits.max_single_trade) {
      const trade = await executeAutonomousTrade(agentData.user_email, agentId, rec);
      trades.push(trade);
    }
  }

  return { analysis, trades };
}

async function executeAutonomousTrade(userEmail, agentId, tradeData) {
  const trade = {
    user_email: userEmail,
    agent_id: agentId,
    asset_symbol: tradeData.symbol,
    trade_type: tradeData.type,
    quantity: tradeData.quantity,
    price: tradeData.price || 0,
    total_value: tradeData.amount,
    exchange: 'binance',
    status: 'pending',
    trigger_rule: 'autonomous_agent_decision',
    prediction_confidence: tradeData.confidence || 80
  };

  return await base44.entities.TradeExecution.create(trade);
}

export async function processAgentDeposit(agentId, profitAmount) {
  const agent = await base44.entities.AutonomousTradingAgent.filter({ id: agentId });
  if (agent.length === 0) return null;

  const agentData = agent[0];
  const depositAmount = profitAmount * (agentData.deposit_percentage / 100);
  const remainingForTasks = profitAmount - depositAmount;

  // Create deposit transaction
  await base44.entities.AutomatedTransaction.create({
    user_email: agentData.user_email,
    transaction_type: 'deposit',
    amount: depositAmount,
    recipient: 'user_account',
    trigger_rule: 'autonomous_agent_profit_share',
    payment_gateway: 'plaid',
    status: 'pending'
  });

  return {
    deposited: depositAmount,
    retained: remainingForTasks,
    percentage: agentData.deposit_percentage
  };
}

export async function executeRealWorldTask(agentId, taskDescription, budget) {
  const agent = await base44.entities.AutonomousTradingAgent.filter({ id: agentId });
  if (agent.length === 0) return null;

  // AI plans and executes task
  const taskPlan = await base44.integrations.Core.InvokeLLM({
    prompt: `Plan execution for real-world task: "${taskDescription}" with budget $${budget}. Provide step-by-step execution plan with cost breakdown.`,
    response_json_schema: {
      type: 'object',
      properties: {
        steps: { type: 'array', items: { type: 'object' } },
        estimated_cost: { type: 'number' },
        feasibility: { type: 'string' }
      }
    }
  });

  return taskPlan;
}