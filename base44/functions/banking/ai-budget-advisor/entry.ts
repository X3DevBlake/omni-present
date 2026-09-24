export default async function aiBudgetAdvisor(data, context) {
  const { user_email } = data;
  
  const transactions = await context.entities.PaymentTransaction.filter({ user_email }).sort('-created_date').limit(100);
  const budgets = await context.entities.Budget.filter({ user_email });
  
  const monthlySpending = {};
  transactions.forEach(t => {
    const category = t.category || 'other';
    monthlySpending[category] = (monthlySpending[category] || 0) + t.amount;
  });
  
  const advice = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze spending patterns and provide budget advice:

Monthly Spending by Category:
${Object.entries(monthlySpending).map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`).join('\n')}

Current Budgets:
${budgets.map(b => `${b.category}: $${b.allocated_amount} (Spent: $${b.spent_amount})`).join('\n')}

Provide:
1. Spending insights
2. Budget recommendations
3. Areas to optimize
4. Savings opportunities`,
    response_json_schema: {
      type: "object",
      properties: {
        insights: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "object", properties: { category: { type: "string" }, suggested_budget: { type: "number" }, reasoning: { type: "string" } } } },
        optimization_tips: { type: "array", items: { type: "string" } },
        potential_savings: { type: "number" }
      }
    }
  });
  
  return advice;
}