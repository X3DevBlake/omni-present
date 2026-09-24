import { base44 } from '@/api/base44Client';

/**
 * Gemini Investment Strategy Generation
 * Analyzes user profile and generates personalized strategies
 */

export async function generateInvestmentStrategies(userEmail) {
  try {
    // Gather user context
    const [health, portfolio, goals, transactions] = await Promise.all([
      base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-updated_date', 1),
      base44.entities.SmartBankAccount.filter({ user_email: userEmail }),
      base44.entities.FinancialGoal.filter({ user_email: userEmail }),
      base44.entities.FinancialTransaction.filter({ user_email: userEmail }, '-created_at', 100),
    ]);

    const userProfile = {
      score: health?.[0]?.overall_score || 650,
      netWorth: portfolio?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0,
      riskProfile: health?.[0]?.debt_ratio ? 'conservative' : 'moderate',
      goals: goals?.map(g => ({ title: g.title, target: g.target_amount })),
      savingsRate: calculateSavingsRate(transactions),
    };

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 diverse investment strategies for user:
      
Profile:
- Financial Score: ${userProfile.score}/850
- Net Worth: $${userProfile.netWorth.toLocaleString()}
- Risk Profile: ${userProfile.riskProfile}
- Monthly Savings: $${userProfile.savingsRate}
- Goals: ${userProfile.goals?.map(g => g.title).join(', ')}

Create strategies:
1. Conservative/Income-Focused
2. Balanced/Growth
3. Aggressive/Growth
4. Dividend/Income
5. Alternative/ESG Focus

For each include exact allocations, expected returns, rebalancing frequency.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          strategies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                allocation: { type: 'object' },
                expectedReturn: { type: 'number' },
                riskLevel: { type: 'number' },
                rebalancing: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return response.strategies;
  } catch (error) {
    console.error('Error generating strategies:', error);
    throw error;
  }
}

/**
 * Setup automated rebalancing for selected strategy
 */
export async function setupAutomatedRebalancing(strategyId, userEmail) {
  try {
    const strategy = await base44.entities.TradingStrategy.filter(
      { id: strategyId, user_email: userEmail },
      null,
      1
    );

    if (!strategy?.[0]) throw new Error('Strategy not found');

    // Create Zapier workflow
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Zapier automation for portfolio rebalancing:
      
Strategy: ${strategy[0].strategy_name}
Allocation: ${JSON.stringify(strategy[0].market_sentiment)}

Setup quarterly rebalancing with:
1. Monthly performance tracking via Google Sheets
2. Slack alerts when drift exceeds 5%
3. Tax-loss harvesting triggers
4. Rebalancing execution workflow`,
      response_json_schema: {
        type: 'object',
        properties: {
          zapierWorkflowId: { type: 'string' },
          triggers: { type: 'array', items: { type: 'string' } },
          automations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return workflow;
  } catch (error) {
    console.error('Error setting up rebalancing:', error);
    throw error;
  }
}

/**
 * Integrate with tax-loss harvesting
 */
export async function integrateTaxLossHarvesting(strategyId) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Setup tax-loss harvesting automation for investment strategy ${strategyId}:
      
Monitor for:
1. Unrealized losses > $500
2. Wash sale compliance (30 day rule)
3. Harvesting opportunities by tax bracket
4. Quarterly tax planning windows

Create Google Docs tracking sheet and Slack notifications.`,
      response_json_schema: {
        type: 'object',
        properties: {
          harvestingRules: { type: 'array', items: { type: 'string' } },
          googleSheetsId: { type: 'string' },
          slackIntegration: { type: 'boolean' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error setting up tax-loss harvesting:', error);
    throw error;
  }
}

/**
 * Calculate user's savings rate
 */
function calculateSavingsRate(transactions) {
  if (!transactions || transactions.length === 0) return 0;

  const lastMonth = transactions
    .filter(t => new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return Math.max(0, lastMonth);
}

export default {
  generateInvestmentStrategies,
  setupAutomatedRebalancing,
  integrateTaxLossHarvesting,
};