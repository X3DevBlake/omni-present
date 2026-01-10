/**
 * Process Financial Transactions
 * - Categorizes transactions
 * - Updates budgets
 * - Analyzes spending patterns
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { userEmail, transactions } = req.body;

    const processed = [];

    for (const tx of transactions) {
      // Auto-categorize if not provided
      let category = tx.category;
      if (!category) {
        const categorization = await base44.integrations.Core.InvokeLLM({
          prompt: `Categorize this transaction: "${tx.description}". 
          Options: housing, food, transport, entertainment, utilities, healthcare, education, shopping, other.
          Return JSON with: category.`,
          response_json_schema: {
            type: 'object',
            properties: { category: { type: 'string' } }
          }
        });
        category = categorization.category;
      }

      // Create transaction
      const newTx = await base44.entities.FinancialTransaction.create({
        user_email: userEmail,
        amount: tx.amount,
        type: tx.type,
        category: category,
        description: tx.description,
        transaction_date: new Date().toISOString()
      });

      // Update budget if expense
      if (tx.type === 'expense') {
        const budgets = await base44.entities.Budget.filter({
          user_email: userEmail,
          category: category
        });

        if (budgets.length > 0) {
          const budget = budgets[0];
          const newSpent = budget.current_month_spent + tx.amount;
          const percentage = newSpent / budget.monthly_limit;

          await base44.entities.Budget.update(budget.id, {
            current_month_spent: newSpent,
            status: percentage > 1 ? 'exceeded' : percentage > budget.alert_threshold ? 'warning' : 'on_track'
          });
        }
      }

      processed.push(newTx);
    }

    res.status(200).json({
      success: true,
      processed_count: processed.length,
      transactions: processed
    });
  } catch (error) {
    console.error('Transaction processing error:', error);
    res.status(500).json({ error: error.message });
  }
}