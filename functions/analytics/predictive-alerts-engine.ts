import { base44 } from '@/api/base44Client';

/**
 * AI-Driven Predictive Alerts Engine
 * Forecasts issues, conflicts, market events, system problems before they occur
 */

/**
 * Predict agent conflicts before escalation
 */
export async function predictAgentConflicts(teamId, agents) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict potential conflicts in this agent team:
      
      Team: ${teamId}
      Agents: ${JSON.stringify(agents.map(a => ({ id: a.id, specialty: a.specialty, autonomyLevel: a.autonomyLevel })))}
      
      Analyze:
      1. Personality/style conflicts
      2. Priority misalignments
      3. Resource contention risks
      4. Philosophical disagreements
      5. Communication breakdowns
      
      For each: probability, severity, early warning signs, mitigation steps`,
      response_json_schema: {
        type: 'object',
        properties: {
          conflicts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agents: { type: 'array', items: { type: 'string' } },
                conflictType: { type: 'string' },
                probability: { type: 'number' },
                severity: { type: 'string' },
                earlyWarningSign: { type: 'string' },
                mitigation: { type: 'string' },
              },
            },
          },
          overallTeamRisk: { type: 'number' },
        },
      },
    });

    // Store predictions
    for (const conflict of response.conflicts) {
      await base44.entities.PredictiveAnalytic.create({
        user_email: 'system',
        prediction_type: 'agent_conflict',
        prediction: `${conflict.conflictType} between ${conflict.agents.join(' & ')}`,
        confidence: conflict.probability,
        data_analyzed: JSON.stringify(conflict),
        ai_generated: true,
      });
    }

    return response;
  } catch (error) {
    console.error('Error predicting conflicts:', error);
    throw error;
  }
}

/**
 * Forecast portfolio risk and volatility periods
 */
export async function forecastPortfolioRisk(portfolio, marketConditions) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Forecast portfolio risk and volatility:
      
      Portfolio: ${JSON.stringify(portfolio)}
      Market: ${JSON.stringify(marketConditions)}
      
      Predict:
      1. Next 30-day volatility forecast
      2. Drawdown probability and magnitude
      3. Stress scenarios (geopolitical, economic)
      4. Correlation breakdowns
      5. Sector rotation timing
      6. Market regime changes
      
      Timeline: 1 week, 1 month, 3 months`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          volatilityForecast: { type: 'object' },
          drawdownRisk: { type: 'object' },
          stressScenarios: { type: 'array', items: { type: 'object' } },
          alerts: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error forecasting risk:', error);
    throw error;
  }
}

/**
 * Identify optimal times for financial actions
 */
export async function identifyOptimalActionTimes(userEmail, goals) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify optimal times for financial actions:
      
      User: ${userEmail}
      Goals: ${JSON.stringify(goals)}
      
      Predict:
      1. Best times for tax-loss harvesting (next 3 months)
      2. Portfolio rebalancing windows
      3. Dollar-cost averaging schedule
      4. Optimal entry points for opportunities
      5. Deadline deadlines (tax deadlines, enrollment periods)
      6. Market timing opportunities
      
      Include: dates, market conditions, expected outcomes`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          taxLossHarvesting: { type: 'array', items: { type: 'object' } },
          rebalancingWindows: { type: 'array', items: { type: 'object' } },
          dcaSchedule: { type: 'array', items: { type: 'object' } },
          deadlines: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error identifying action times:', error);
    throw error;
  }
}

/**
 * Predict system performance degradation
 */
export async function predictSystemDegradation(systemMetrics) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict system performance issues:
      
      Metrics: ${JSON.stringify(systemMetrics)}
      
      Analyze:
      1. Memory usage trends (forecast 7 days)
      2. CPU bottlenecks
      3. Database query slowdowns
      4. API rate limit risks
      5. Cache efficiency
      6. Agent response time degradation
      
      For each: current state, predicted state, mitigation`,
      response_json_schema: {
        type: 'object',
        properties: {
          issues: { type: 'array', items: { type: 'object' } },
          criticalAlerts: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error predicting degradation:', error);
    throw error;
  }
}

/**
 * Create intelligent alert based on predictions
 */
export async function createPredictiveAlert(userEmail, alertType, prediction, confidence) {
  try {
    const alert = await base44.entities.ProactiveEvent.create({
      agent_id: 'predictive_system',
      user_email: userEmail,
      event_type: 'alert',
      severity: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low',
      description: prediction,
    });

    return alert;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
}

export default {
  predictAgentConflicts,
  forecastPortfolioRisk,
  identifyOptimalActionTimes,
  predictSystemDegradation,
  createPredictiveAlert,
};