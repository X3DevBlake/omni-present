import { base44 } from '@/api/base44Client';

export async function generateLongTermPrediction(userEmail, predictionType, timeframe) {
  // Gather comprehensive data
  const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userEmail });
  const trades = await base44.entities.TradeExecution.filter({ user_email: userEmail });
  const goals = await base44.entities.FinancialGoal.filter({ user_email: userEmail });

  const dataAnalysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate ${timeframe} ${predictionType} prediction for user with ${transactions.length} transactions, ${trades.length} trades, and ${goals.length} goals. Research latest market data and provide comprehensive forecast with risk factors and actionable insights.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        predictions: { type: 'object' },
        confidence_score: { type: 'number' },
        risk_factors: { type: 'array', items: { type: 'object' } },
        actionable_insights: { type: 'array', items: { type: 'string' } },
        data_sources: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  const prediction = {
    user_email: userEmail,
    prediction_type: predictionType,
    timeframe,
    model_used: 'advanced_ai_v1',
    predictions: dataAnalysis.predictions,
    confidence_score: dataAnalysis.confidence_score,
    data_sources: dataAnalysis.data_sources || ['historical_data', 'market_research'],
    risk_factors: dataAnalysis.risk_factors,
    actionable_insights: dataAnalysis.actionable_insights,
    created_at: new Date().toISOString()
  };

  return await base44.entities.LongTermPrediction.create(prediction);
}

export async function generateRiskAssessment(userEmail) {
  const portfolio = await base44.entities.CryptoAsset.filter({ user_email: userEmail }).catch(() => []);
  const loans = await base44.entities.LoanApplication.filter({ user_email: userEmail }).catch(() => []);
  const creditScore = await base44.entities.CreditScore.filter({ user_email: userEmail }).catch(() => []);

  const assessment = await base44.integrations.Core.InvokeLLM({
    prompt: `Conduct comprehensive risk assessment: Portfolio size: ${portfolio.length}, Active loans: ${loans.length}, Credit score: ${creditScore[0]?.overall_score}. Analyze market conditions and provide detailed risk analysis.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        overall_risk_level: { type: 'string' },
        risk_score: { type: 'number' },
        risk_factors: { type: 'array', items: { type: 'object' } },
        mitigation_strategies: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return assessment;
}

export async function forecastFinancialOutcome(userEmail, scenarioData) {
  const currentState = await getUserFinancialState(userEmail);

  const forecast = await base44.integrations.Core.InvokeLLM({
    prompt: `Forecast financial outcome for scenario: ${JSON.stringify(scenarioData)}. Current state: ${JSON.stringify(currentState)}. Research market trends and economic indicators.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        projected_value: { type: 'number' },
        probability: { type: 'number' },
        timeline: { type: 'string' },
        influencing_factors: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return forecast;
}

async function getUserFinancialState(userEmail) {
  const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userEmail });
  const accounts = await base44.entities.OmniBankAccount.filter({ user_email: userEmail }).catch(() => []);
  
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const recentSpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return {
    total_balance: totalBalance,
    recent_spending: recentSpending,
    account_count: accounts.length,
    transaction_count: transactions.length
  };
}