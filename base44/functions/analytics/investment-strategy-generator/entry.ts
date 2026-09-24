import { base44 } from '@/api/base44Client';

/**
 * AI-Driven Investment Strategy Generation
 * Autonomous analysis of portfolio, goals, risk tolerance to generate personalized strategies
 */

/**
 * Generate personalized investment strategy
 */
export async function generateInvestmentStrategy(userEmail, userProfile) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive, personalized investment strategy:
      
      User: ${userEmail}
      Profile: ${JSON.stringify(userProfile)}
      
      Include:
      1. Strategy overview and thesis
      2. Optimal asset allocation (stocks, bonds, crypto, alternatives)
      3. Sector recommendations
      4. Geographic diversification
      5. Alternative assets suggestions
      6. Risk adjustments based on tolerance
      7. Time horizon alignment
      8. Expected returns and volatility
      9. Rebalancing schedule
      10. Implementation roadmap`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          strategyName: { type: 'string' },
          thesis: { type: 'string' },
          assetAllocation: { type: 'object' },
          sectorRecommendations: { type: 'array', items: { type: 'object' } },
          alternatives: { type: 'array', items: { type: 'string' } },
          expectedReturn: { type: 'number' },
          expectedVolatility: { type: 'number' },
          rebalancingSchedule: { type: 'string' },
          roadmap: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Store strategy
    const strategy = await base44.entities.TradingStrategy.create({
      user_email: userEmail,
      agent_id: 'investment_strategist',
      strategy_name: response.strategyName,
      market_sentiment: { thesis: response.thesis },
      recommended_actions: response.sectorRecommendations,
      confidence_score: 0.85,
    });

    return { strategy, details: response };
  } catch (error) {
    console.error('Error generating strategy:', error);
    throw error;
  }
}

/**
 * Identify investment opportunities aligned with strategy
 */
export async function identifyOpportunities(userEmail, strategy, currentMarketConditions) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify specific investment opportunities aligned with this strategy:
      
      User: ${userEmail}
      Strategy: ${JSON.stringify(strategy)}
      Market: ${JSON.stringify(currentMarketConditions)}
      
      Find:
      1. Individual stocks/ETFs to buy
      2. Entry prices and timing
      3. Position sizing
      4. Risk-reward ratio
      5. Catalysts for gains
      6. Exit criteria
      
      Rank by opportunity score (0-100)`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ticker: { type: 'string' },
                reason: { type: 'string' },
                targetPrice: { type: 'number' },
                entryPrice: { type: 'number' },
                positionSize: { type: 'number' },
                opportunityScore: { type: 'number' },
                catalyst: { type: 'string' },
                exitTarget: { type: 'number' },
              },
            },
          },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error identifying opportunities:', error);
    throw error;
  }
}

/**
 * Forecast portfolio performance
 */
export async function forecastPortfolioPerformance(userEmail, portfolio, strategy) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Forecast portfolio performance under this strategy:
      
      User: ${userEmail}
      Portfolio: ${JSON.stringify(portfolio)}
      Strategy: ${JSON.stringify(strategy)}
      
      Provide:
      1. 1-year return forecast (base, bull, bear cases)
      2. 5-year CAGR estimate
      3. Drawdown projections
      4. Recovery time estimates
      5. Win rate (% positive months)
      6. Sharpe ratio estimate
      7. Downside protection analysis
      8. Stress test results
      9. Monte Carlo simulation summary`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          oneYearForecast: {
            type: 'object',
            properties: {
              baseCase: { type: 'number' },
              bullCase: { type: 'number' },
              bearCase: { type: 'number' },
            },
          },
          fiveYearCAGR: { type: 'number' },
          maxDrawdown: { type: 'number' },
          recoveryTime: { type: 'string' },
          winRate: { type: 'number' },
          sharpeRatio: { type: 'number' },
          stressTestResults: { type: 'object' },
          monteCarlo: { type: 'object' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error forecasting performance:', error);
    throw error;
  }
}

/**
 * Compare multiple strategy options
 */
export async function compareStrategies(userEmail, strategyCandidates) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Compare these investment strategy candidates:
      
      User: ${userEmail}
      Strategies: ${JSON.stringify(strategyCandidates)}
      
      For each:
      1. Risk-adjusted return potential
      2. Complexity level
      3. Maintenance requirements
      4. Alignment with goals
      5. Tax efficiency
      6. Pros and cons
      
      Recommend best fit`,
      response_json_schema: {
        type: 'object',
        properties: {
          comparison: { type: 'array', items: { type: 'object' } },
          recommendation: { type: 'string' },
          reasoning: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error comparing strategies:', error);
    throw error;
  }
}

export default {
  generateInvestmentStrategy,
  identifyOpportunities,
  forecastPortfolioPerformance,
  compareStrategies,
};