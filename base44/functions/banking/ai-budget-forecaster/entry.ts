import { base44 } from '@/api/base44Client';

/**
 * AI Budget Forecasting Engine
 */

// Generate comprehensive budget forecast
export async function generateBudgetForecast(userEmail) {
  try {
    // Get user's financial data
    const accounts = await base44.entities.SmartBankAccount.list({ user_email: userEmail });
    const transactions = await base44.entities.FinancialTransaction.list(
      { user_email: userEmail },
      '-created_date',
      200
    );

    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const avgMonthlySpending = calculateAvgSpending(transactions);

    const prompt = `Analyze this financial data and generate a detailed budget forecast:

Accounts: ${accounts.length}
Total Balance: $${totalBalance}
Recent Transactions: ${transactions.length}
Average Monthly Spending: $${avgMonthlySpending}

Transaction History (last 90 days):
${JSON.stringify(transactions.slice(0, 50), null, 2)}

Provide a comprehensive forecast including:
1. Predicted income for next month
2. Predicted spending by category
3. Savings potential
4. Anomalies or unusual patterns
5. Actionable recommendations
6. Confidence score (0-100)

Return as JSON.`;

    const forecast = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          predicted_income: { type: 'number' },
          predicted_spending: { type: 'number' },
          spending_by_category: { type: 'object' },
          savings_potential: { type: 'number' },
          confidence_score: { type: 'number' },
          anomalies_detected: { type: 'array', items: { type: 'object' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Save forecast
    const forecastMonth = new Date().toISOString().slice(0, 7);
    await base44.entities.AIBudgetForecast.create({
      user_email: userEmail,
      forecast_month: forecastMonth,
      ...forecast
    });

    return forecast;
  } catch (error) {
    console.error('Error generating forecast:', error);
    throw error;
  }
}

// Calculate financial health score
export async function calculateFinancialHealthScore(userEmail) {
  try {
    const accounts = await base44.entities.SmartBankAccount.list({ user_email: userEmail });
    const transactions = await base44.entities.FinancialTransaction.list(
      { user_email: userEmail },
      '-created_date',
      100
    );

    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const monthlySpending = calculateAvgSpending(transactions);
    const monthlyIncome = calculateAvgIncome(transactions);

    const prompt = `Calculate comprehensive financial health score:

Total Balance: $${totalBalance}
Monthly Income: $${monthlyIncome}
Monthly Spending: $${monthlySpending}
Accounts: ${accounts.length}

Calculate:
1. Overall financial health score (0-850)
2. Credit score estimate (300-850)
3. Savings ratio (% of income saved)
4. Debt to income ratio
5. Emergency fund months
6. Investment diversity score (0-100)
7. Fraud risk level (low/medium/high)
8. Personalized recommendations

Return as JSON.`;

    const health = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          credit_score: { type: 'number' },
          savings_ratio: { type: 'number' },
          debt_ratio: { type: 'number' },
          emergency_fund_months: { type: 'number' },
          investment_diversity: { type: 'number' },
          fraud_risk_level: { type: 'string' },
          recommendations: { type: 'array' }
        }
      }
    });

    // Save health score
    await base44.entities.FinancialHealthScore.create({
      user_email: userEmail,
      ...health,
      last_updated: new Date().toISOString()
    });

    return health;
  } catch (error) {
    console.error('Error calculating health score:', error);
    throw error;
  }
}

// Detect fraudulent activity
export async function detectFraudulentActivity(userEmail) {
  try {
    const transactions = await base44.entities.FinancialTransaction.list(
      { user_email: userEmail },
      '-created_date',
      100
    );

    const prompt = `Analyze these transactions for fraud:

${JSON.stringify(transactions, null, 2)}

Detect:
1. Suspicious transactions
2. Unusual locations
3. Account anomalies
4. Identity verification issues
5. Confidence score for each alert
6. Recommended actions

Return as JSON array of fraud alerts.`;

    const alerts = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          alerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                alert_type: { type: 'string' },
                severity: { type: 'string' },
                description: { type: 'string' },
                transaction_id: { type: 'string' },
                confidence_score: { type: 'number' },
                ai_explanation: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Save fraud alerts
    for (const alert of alerts.alerts || []) {
      await base44.entities.FraudAlert.create({
        user_email: userEmail,
        ...alert,
        detected_at: new Date().toISOString(),
        status: 'pending',
        user_action_required: alert.severity === 'high' || alert.severity === 'critical'
      });
    }

    return alerts.alerts || [];
  } catch (error) {
    console.error('Error detecting fraud:', error);
    throw error;
  }
}

// Helper functions
function calculateAvgSpending(transactions) {
  const expenses = transactions.filter(t => t.amount < 0);
  if (expenses.length === 0) return 0;
  const total = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  return total / expenses.length;
}

function calculateAvgIncome(transactions) {
  const income = transactions.filter(t => t.amount > 0);
  if (income.length === 0) return 0;
  const total = income.reduce((sum, t) => sum + t.amount, 0);
  return total / income.length;
}