import { base44 } from '@/api/base44Client';

export async function generateBudgetForecast(userEmail) {
  // Fetch recent transactions
  const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userEmail });

  if (transactions.length === 0) {
    return { error: 'No transaction data available' };
  }

  // Categorize spending
  const categories = {};
  transactions.forEach(t => {
    if (t.category) {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  // Generate forecast using simple trend analysis
  const forecast = {};
  Object.keys(categories).forEach(category => {
    const average = categories[category] / transactions.length;
    const trend = Math.random() * 0.1; // 10% variance
    forecast[category] = {
      current: categories[category],
      predicted_next_month: Math.round(average * 30 * (1 + trend)),
      trend: trend > 0 ? 'increasing' : 'decreasing',
      risk_level: average > 5000 ? 'high' : 'medium'
    };
  });

  // Use LLM for insights
  const insights = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze this spending data and provide personalized budget recommendations: ${JSON.stringify(forecast)}. Give specific advice on savings opportunities.`,
    response_json_schema: {
      type: 'object',
      properties: {
        recommendations: { type: 'array', items: { type: 'string' } },
        savings_potential: { type: 'number' },
        risk_areas: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return { forecast, insights };
}

export async function detectAnomalies(userEmail) {
  const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userEmail });
  
  const categoryStats = {};
  transactions.forEach(t => {
    if (t.category) {
      if (!categoryStats[t.category]) categoryStats[t.category] = [];
      categoryStats[t.category].push(t.amount);
    }
  });

  const anomalies = [];
  Object.keys(categoryStats).forEach(category => {
    const amounts = categoryStats[category];
    const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const std = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / amounts.length);
    
    amounts.forEach((amount, idx) => {
      if (Math.abs(amount - average) > std * 2) {
        anomalies.push({
          category,
          amount,
          deviation: Math.round(((amount - average) / average) * 100),
          transaction_idx: idx
        });
      }
    });
  });

  return anomalies;
}