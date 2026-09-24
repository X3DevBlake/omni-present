import { base44 } from '@/api/base44Client';

export async function generateMarketPrediction(userEmail, assetId, assetType) {
  const prediction = await base44.integrations.Core.InvokeLLM({
    prompt: `Predict the 7-day price trend for ${assetType} asset ${assetId}. Provide JSON with: predicted_value, confidence_score (0-100), trend_direction`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        predicted_value: { type: 'number' },
        confidence_score: { type: 'number' },
        trend_direction: { type: 'string' }
      }
    }
  });

  const predictionRecord = {
    user_email: userEmail,
    asset_type: assetType,
    asset_id: assetId,
    prediction_type: 'price',
    predicted_value: prediction.predicted_value || 0,
    confidence_score: prediction.confidence_score || 0,
    timeframe: '7d',
    status: 'active',
    current_value: 0
  };

  return await base44.entities.MarketPrediction.create(predictionRecord);
}

export async function generateSpendingForecast(userEmail) {
  const transactions = await base44.entities.FinancialTransaction.filter({
    user_email: userEmail
  });

  const forecast = await base44.integrations.Core.InvokeLLM({
    prompt: `Based on these recent transactions: ${JSON.stringify(transactions.slice(-10))}, predict next 30 days spending by category. Return JSON with category predictions.`,
    response_json_schema: {
      type: 'object',
      properties: {
        housing: { type: 'number' },
        food: { type: 'number' },
        transport: { type: 'number' },
        entertainment: { type: 'number' },
        other: { type: 'number' }
      }
    }
  });

  return forecast;
}

export async function generateCreditScorePrediction(userEmail) {
  const creditScore = await base44.entities.CreditScore.filter({
    user_email: userEmail
  });

  if (creditScore.length === 0) return null;

  const currentScore = creditScore[0];

  const prediction = await base44.integrations.Core.InvokeLLM({
    prompt: `Based on current credit score of ${currentScore.overall_score} and default risk of ${currentScore.default_risk}%, predict the score in 30 days considering average payment history. Return JSON.`,
    response_json_schema: {
      type: 'object',
      properties: {
        predicted_score: { type: 'number' },
        trend: { type: 'string' },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return prediction;
}

export async function generatePersonalizedInsights(userEmail) {
  // Gather all user data
  const goals = await base44.entities.FinancialGoal.filter({ user_email: userEmail });
  const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userEmail });
  const budgets = await base44.entities.Budget.filter({ user_email: userEmail });

  const insights = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate 3-5 personalized financial insights based on goals: ${JSON.stringify(goals)}, recent transactions: ${JSON.stringify(transactions.slice(-5))}, and budgets: ${JSON.stringify(budgets)}. Be specific and actionable.`,
    response_json_schema: {
      type: 'object',
      properties: {
        insights: { type: 'array', items: { type: 'string' } },
        opportunities: { type: 'array', items: { type: 'string' } },
        risks: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return insights;
}

export async function resolvePrediction(predictionId, actualValue) {
  const prediction = await base44.entities.MarketPrediction.filter({ id: predictionId });
  if (prediction.length === 0) return null;

  const pred = prediction[0];
  const error = Math.abs(pred.predicted_value - actualValue) / actualValue;
  const accuracy = Math.max(0, 100 * (1 - error));

  return await base44.entities.MarketPrediction.update(predictionId, {
    status: 'resolved',
    current_value: actualValue,
    accuracy: Math.round(accuracy)
  });
}