import { base44 } from '@/api/base44Client';

// Define strategy with Gemini
export async function defineStrategyWithGemini(userEmail, strategyObjective, constraints) {
  try {
    const strategy = await base44.integrations.Core.InvokeLLM({
      prompt: `Define optimal DeFi trading strategy:
      
User: ${userEmail}
Objective: ${strategyObjective}
Constraints: ${JSON.stringify(constraints)}

Define:
1. Entry conditions
2. Exit conditions
3. Position sizing rules
4. Rebalancing triggers
5. Risk management parameters
6. Conditional orders
7. Expected behavior in different market conditions`,
      response_json_schema: {
        type: 'object',
        properties: {
          strategyName: { type: 'string' },
          description: { type: 'string' },
          rules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                condition: { type: 'string' },
                action: { type: 'string' },
                parameters: { type: 'object' },
              },
            },
          },
          riskProfile: { type: 'string' },
          expectedROI: { type: 'number' },
        },
      },
    });

    // Save strategy
    await base44.entities.TradingStrategy.create({
      user_email: userEmail,
      strategy_name: strategy.strategyName,
      market_sentiment: { definition: strategy },
      status: 'active',
    });

    return strategy;
  } catch (error) {
    console.error('Error defining strategy:', error);
    throw error;
  }
}

// Backtest strategy using historical data
export async function backtest(strategyId, historicalData, timeframes) {
  try {
    const backtestResults = await base44.integrations.Core.InvokeLLM({
      prompt: `Execute backtest on strategy:
      
StrategyID: ${strategyId}
HistoricalData: ${JSON.stringify(historicalData)}
Timeframes: ${JSON.stringify(timeframes)}

Simulate:
1. Execute trades based on strategy rules
2. Track P&L at each step
3. Calculate metrics:
   - Total return %
   - Sharpe ratio
   - Max drawdown
   - Win rate
   - Average trade duration
   - Slippage impact
4. Compare against benchmarks (BTC, ETH, SPY)
5. Identify periods of underperformance`,
      response_json_schema: {
        type: 'object',
        properties: {
          strategyId: { type: 'string' },
          totalReturn: { type: 'number' },
          sharpeRatio: { type: 'number' },
          maxDrawdown: { type: 'number' },
          winRate: { type: 'number' },
          trades: { type: 'array', items: { type: 'object' } },
          benchmarkComparison: { type: 'object' },
          metrics: { type: 'object' },
          equity_curve: { type: 'array', items: { type: 'object' } },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Save backtest results
    await base44.integrations.Core.InvokeLLM({
      prompt: `Save backtest results:
      
StrategyID: ${strategyId}
Results: ${JSON.stringify(backtestResults)}

Store for analysis and comparison.`,
    });

    return backtestResults;
  } catch (error) {
    console.error('Error backtesting:', error);
    throw error;
  }
}

// Query historical Snowflake data
export async function getHistoricalDataForBacktest(assets, startDate, endDate, granularity = 'daily') {
  try {
    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `Query Snowflake for historical DeFi data:
      
Assets: ${assets.join(', ')}
StartDate: ${startDate}
EndDate: ${endDate}
Granularity: ${granularity}

Retrieve:
1. Price history
2. Volume data
3. Liquidity metrics
4. Gas prices
5. Yield rates
6. TVL changes`,
      response_json_schema: {
        type: 'object',
        properties: {
          historicalData: { type: 'array', items: { type: 'object' } },
          availability: { type: 'object' },
          dataQuality: { type: 'string' },
        },
      },
    });

    return data.historicalData;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
}

// Get Gemini market forecasts for backtesting period
export async function getMarketForecasts(assets, backtestPeriod) {
  try {
    const forecasts = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate market forecasts for backtesting:
      
Assets: ${assets.join(', ')}
Period: ${backtestPeriod}

Provide:
1. Expected volatility
2. Trend predictions
3. Support/resistance levels
4. Liquidity outlook
5. Risk factors
6. Opportunity windows`,
      response_json_schema: {
        type: 'object',
        properties: {
          forecasts: { type: 'array', items: { type: 'object' } },
          confidence: { type: 'number' },
          risks: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return forecasts;
  } catch (error) {
    console.error('Error getting forecasts:', error);
    throw error;
  }
}

// Optimize strategy parameters
export async function optimizeStrategyParameters(strategyId, backtestResults, constraints) {
  try {
    const optimized = await base44.integrations.Core.InvokeLLM({
      prompt: `Optimize strategy parameters:
      
StrategyID: ${strategyId}
CurrentResults: ${JSON.stringify(backtestResults)}
Constraints: ${JSON.stringify(constraints)}

Suggest improvements:
1. Adjusted entry/exit conditions
2. Optimal position sizes
3. Rebalancing frequencies
4. Stop-loss levels
5. Risk management tweaks
6. Parameter ranges for robustness testing`,
      response_json_schema: {
        type: 'object',
        properties: {
          optimizedParameters: { type: 'object' },
          expectedImprovement: { type: 'number' },
          robustnessScores: { type: 'object' },
          suggestedTests: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return optimized;
  } catch (error) {
    console.error('Error optimizing:', error);
    throw error;
  }
}

// Compare multiple strategies
export async function compareStrategies(strategyIds, backtestResults) {
  try {
    const comparison = await base44.integrations.Core.InvokeLLM({
      prompt: `Compare DeFi trading strategies:
      
Strategies: ${strategyIds.join(', ')}
Results: ${JSON.stringify(backtestResults)}

Compare:
1. Return metrics
2. Risk-adjusted returns
3. Consistency
4. Maximum drawdown
5. Recovery time
6. Suitability for different market conditions`,
      response_json_schema: {
        type: 'object',
        properties: {
          comparison: { type: 'array', items: { type: 'object' } },
          ranking: { type: 'array', items: { type: 'object' } },
          recommendation: { type: 'string' },
          hybrids: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    return comparison;
  } catch (error) {
    console.error('Error comparing:', error);
    throw error;
  }
}

// Run sensitivity analysis
export async function runSensitivityAnalysis(strategyId, parameters, variations = 0.2) {
  try {
    const sensitivity = await base44.integrations.Core.InvokeLLM({
      prompt: `Run sensitivity analysis on strategy:
      
StrategyID: ${strategyId}
Parameters: ${JSON.stringify(parameters)}
VariationRange: ±${variations * 100}%

Test impact of:
1. Parameter variations
2. Market condition changes
3. Slippage increases
4. Gas price fluctuations
5. Liquidity constraints`,
      response_json_schema: {
        type: 'object',
        properties: {
          results: { type: 'array', items: { type: 'object' } },
          criticalParameters: { type: 'array', items: { type: 'string' } },
          robustness: { type: 'number' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return sensitivity;
  } catch (error) {
    console.error('Error running sensitivity:', error);
    throw error;
  }
}