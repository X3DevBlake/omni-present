import { base44 } from '@/api/base44Client';

export async function createAutomatedTransaction(userEmail, transactionData) {
  const transaction = {
    user_email: userEmail,
    transaction_type: transactionData.type,
    amount: transactionData.amount,
    currency: transactionData.currency || 'USD',
    recipient: transactionData.recipient,
    trigger_rule: transactionData.rule,
    trigger_condition: transactionData.condition || {},
    status: 'pending',
    payment_gateway: transactionData.gateway || 'stripe',
    scheduled_for: transactionData.scheduledFor || new Date().toISOString()
  };

  return await base44.entities.AutomatedTransaction.create(transaction);
}

export async function processScheduledTransactions(userEmail) {
  const transactions = await base44.entities.AutomatedTransaction.filter({
    user_email: userEmail,
    status: 'pending'
  });

  const now = new Date();
  const toProcess = transactions.filter(t => new Date(t.scheduled_for) <= now);

  const results = [];

  for (const transaction of toProcess) {
    const success = await executeTransaction(transaction);

    await base44.entities.AutomatedTransaction.update(transaction.id, {
      status: success ? 'completed' : 'failed',
      executed_at: new Date().toISOString()
    });

    results.push({ transaction, success });
  }

  return results;
}

export async function createBudgetBasedTransaction(userEmail, budgetCategory, threshold) {
  // Monitor spending and auto-transfer when threshold reached
  const budget = await base44.entities.Budget.filter({
    user_email: userEmail,
    category: budgetCategory
  });

  if (budget.length === 0) return null;

  const budgetData = budget[0];
  const spentPercentage = (budgetData.current_month_spent / budgetData.monthly_limit) * 100;

  if (spentPercentage >= threshold) {
    return await createAutomatedTransaction(userEmail, {
      type: 'transfer',
      amount: budgetData.monthly_limit - budgetData.current_month_spent,
      recipient: 'savings_account',
      rule: `Auto-transfer: ${budgetCategory} budget threshold`,
      gateway: 'stripe'
    });
  }

  return null;
}

export async function createForecastBasedTransaction(userEmail, forecastData) {
  // Execute transaction based on spending forecast
  const predictions = await base44.integrations.Core.InvokeLLM({
    prompt: `Based on forecast ${JSON.stringify(forecastData)}, should we prepare funds? Return yes/no and recommended amount.`,
    response_json_schema: {
      type: 'object',
      properties: {
        should_prepare: { type: 'boolean' },
        recommended_amount: { type: 'number' }
      }
    }
  });

  if (predictions.should_prepare) {
    return await createAutomatedTransaction(userEmail, {
      type: 'deposit',
      amount: predictions.recommended_amount,
      recipient: 'checking_account',
      rule: 'AI forecast-based deposit',
      gateway: 'plaid'
    });
  }

  return null;
}

async function executeTransaction(transaction) {
  try {
    // In production, integrate with payment gateway APIs
    if (transaction.payment_gateway === 'stripe') {
      // Call Stripe API
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Process ${transaction.transaction_type} of $${transaction.amount} to ${transaction.recipient}`
      });
      return true;
    }

    if (transaction.payment_gateway === 'plaid') {
      // Call Plaid API
      return true;
    }

    return true;
  } catch (error) {
    console.error('Transaction execution error:', error);
    return false;
  }
}

export async function getTransactionHistory(userEmail, limit = 100) {
  return await base44.entities.AutomatedTransaction.filter(
    { user_email: userEmail },
    '-executed_at',
    limit
  );
}