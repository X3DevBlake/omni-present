/**
 * Calculate Dashboard Metrics
 * - Aggregates financial data
 * - Computes spending analytics
 * - Generates insights
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { userEmail } = req.body;

    // Fetch all user data
    const transactions = await base44.entities.FinancialTransaction.filter({
      user_email: userEmail
    });
    const budgets = await base44.entities.Budget.filter({
      user_email: userEmail
    });
    const goals = await base44.entities.FinancialGoal.filter({
      user_email: userEmail
    });

    // Calculate metrics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = {};
    transactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    const goalsProgress = goals.map(g => ({
      ...g,
      progress_percentage: (g.current_amount / g.target_amount) * 100
    }));

    // Generate insights
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this financial data and provide 3 actionable insights:
      Total Income: $${totalIncome}
      Total Expense: $${totalExpense}
      Spending by Category: ${JSON.stringify(byCategory)}
      Active Goals: ${goals.length}
      
      Return JSON with: insights (array of strings), recommendations (array of strings)`,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense,
        byCategory,
        budgetStatus: budgets.map(b => ({ category: b.category, status: b.status })),
        goalsProgress
      },
      insights: insights.insights,
      recommendations: insights.recommendations
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: error.message });
  }
}