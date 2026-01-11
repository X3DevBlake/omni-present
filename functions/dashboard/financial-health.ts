import { base44 } from '@/api/base44Client';

export async function calculateFinancialHealth(userEmail) {
  // Gather all financial data
  const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userEmail });
  const accounts = await base44.entities.OmniBankAccount.filter({ user_email: userEmail }).catch(() => []);
  const loans = await base44.entities.LoanApplication.filter({ user_email: userEmail }).catch(() => []);
  const goals = await base44.entities.FinancialGoal.filter({ user_email: userEmail });
  const investments = await base44.entities.CryptoAsset.filter({ user_email: userEmail }).catch(() => []);

  // Calculate components
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const monthlyIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) / 12;
  const monthlyExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) / 12;
  const totalDebt = loans.reduce((sum, l) => sum + (l.loan_amount || 0), 0);

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const debtRatio = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;
  const investmentDiversity = investments.length;
  const liquidity = totalBalance / (monthlyExpenses * 3); // 3-month emergency fund
  
  // AI analysis
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze financial health: Balance $${totalBalance}, Income $${monthlyIncome}/mo, Expenses $${monthlyExpenses}/mo, Debt $${totalDebt}, Savings ${savingsRate}%, ${goals.length} goals. Provide insights and recommendations.`,
    response_json_schema: {
      type: 'object',
      properties: {
        insights: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'object' } },
        trend: { type: 'string' }
      }
    }
  });

  const healthScore = {
    user_email: userEmail,
    overall_score: calculateOverallScore(savingsRate, debtRatio, investmentDiversity, liquidity),
    components: {
      savings_rate: Math.min(100, savingsRate),
      debt_ratio: Math.max(0, 100 - debtRatio),
      investment_diversity: Math.min(100, investmentDiversity * 10),
      liquidity: Math.min(100, liquidity * 33),
      risk_management: 75 // Placeholder
    },
    insights: analysis.insights,
    recommendations: analysis.recommendations,
    trend: analysis.trend,
    calculated_at: new Date().toISOString()
  };

  return await base44.entities.FinancialHealthScore.create(healthScore);
}

function calculateOverallScore(savingsRate, debtRatio, diversity, liquidity) {
  const savingsScore = Math.min(100, savingsRate);
  const debtScore = Math.max(0, 100 - debtRatio);
  const diversityScore = Math.min(100, diversity * 10);
  const liquidityScore = Math.min(100, liquidity * 33);
  
  return Math.round((savingsScore + debtScore + diversityScore + liquidityScore) / 4);
}