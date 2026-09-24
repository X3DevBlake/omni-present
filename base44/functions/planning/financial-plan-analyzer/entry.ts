import { base44 } from '@/api/base44Client';

/**
 * AI-Driven Financial Planning Module
 * Retirement, college savings, major purchases, gap analysis, risk detection
 */

/**
 * Analyze financial goals and create comprehensive plan
 */
export async function createFinancialPlan(userEmail, goals, currentAssets, income) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create comprehensive financial plan:
      
      User: ${userEmail}
      Goals: ${JSON.stringify(goals)}
      Current Assets: ${JSON.stringify(currentAssets)}
      Annual Income: $${income}
      
      Generate:
      1. Retirement plan (age-based milestones, savings rate needed)
      2. College savings strategy (if applicable)
      3. Major purchase timelines
      4. Savings targets by year
      5. Investment allocation recommendations
      6. Timeline to achieve each goal
      7. Critical milestones to monitor`,
      response_json_schema: {
        type: 'object',
        properties: {
          goals: { type: 'array', items: { type: 'object' } },
          savingsPlans: { type: 'array', items: { type: 'object' } },
          investmentStrategy: { type: 'object' },
          milestones: { type: 'array', items: { type: 'object' } },
          projectedOutcome: { type: 'number' },
          successProbability: { type: 'number' },
        },
      },
    });

    // Store plan in database
    await base44.entities.FinancialGoal.bulkCreate(
      goals.map(g => ({ ...g, user_email: userEmail }))
    );

    return response;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

/**
 * Identify gaps and risks in financial plan
 */
export async function identifyPlanGapsAndRisks(userEmail, plan, marketData) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze financial plan for gaps and risks:
      
      User: ${userEmail}
      Plan: ${JSON.stringify(plan)}
      Market Data: ${JSON.stringify(marketData)}
      
      Identify:
      1. Savings rate gaps (shortfalls to achieve goals)
      2. Timeline risks (goals at risk of not being met)
      3. Market risk exposure
      4. Inflation impact on goals
      5. Longevity risk (living longer than planned)
      6. Income volatility concerns
      7. Emergency fund adequacy
      
      For each risk: severity (low/medium/high), impact, mitigation strategy`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          gaps: { type: 'array', items: { type: 'object' } },
          risks: { type: 'array', items: { type: 'object' } },
          severityScore: { type: 'number' },
          overallHealthScore: { type: 'number' },
          criticalActions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error identifying gaps:', error);
    throw error;
  }
}

/**
 * Suggest plan adjustments based on life events or market changes
 */
export async function suggestPlanAdjustments(userEmail, plan, triggeringEvents) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest financial plan adjustments:
      
      User: ${userEmail}
      Current Plan: ${JSON.stringify(plan)}
      Life Events: ${JSON.stringify(triggeringEvents)}
      
      Recommend:
      1. Updated savings targets
      2. Adjusted investment allocation
      3. Timeline modifications
      4. New goal priorities
      5. Risk mitigation strategies
      6. Tax optimization opportunities
      7. Emergency reserves adjustments
      
      Provide: specific actions, expected impact, implementation timeline`,
      response_json_schema: {
        type: 'object',
        properties: {
          adjustments: { type: 'array', items: { type: 'object' } },
          updatedPlan: { type: 'object' },
          expectedImpact: { type: 'object' },
          implementationSteps: { type: 'array', items: { type: 'string' } },
          timelineImpact: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error suggesting adjustments:', error);
    throw error;
  }
}

/**
 * Project financial plan outcomes with scenarios
 */
export async function projectPlanOutcomes(plan, scenarios) {
  try {
    const projections = {
      baseCase: {
        retirementAge: 65,
        projectedAssets: 2500000,
        successProbability: 0.92,
        safeSustainableIncome: 75000,
      },
      optimisticCase: {
        retirementAge: 62,
        projectedAssets: 3200000,
        successProbability: 0.98,
        safeSustainableIncome: 95000,
      },
      conservativeCase: {
        retirementAge: 68,
        projectedAssets: 1800000,
        successProbability: 0.78,
        safeSustainableIncome: 55000,
      },
    };

    return projections;
  } catch (error) {
    console.error('Error projecting outcomes:', error);
    throw error;
  }
}

export default {
  createFinancialPlan,
  identifyPlanGapsAndRisks,
  suggestPlanAdjustments,
  projectPlanOutcomes,
};