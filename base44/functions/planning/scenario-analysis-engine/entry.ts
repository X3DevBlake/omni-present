import { base44 } from '@/api/base44Client';

/**
 * Scenario Analysis Engine
 * What-if analysis and projections
 */

/**
 * Generate multiple financial scenarios
 */
export async function generateScenarios(userEmail, baseData, scenarioParameters) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate multiple financial scenarios for comparison:
      
      User: ${userEmail}
      Base Financial Data: ${JSON.stringify(baseData)}
      Scenario Parameters: ${JSON.stringify(scenarioParameters)}
      
      Create 4 scenarios:
      1. Base Case (current trajectory)
      2. Optimistic (best reasonable case)
      3. Pessimistic (challenging scenario)
      4. Custom (user-specified scenario)
      
      For each scenario, project:
      - 5-year outlook
      - 10-year outlook
      - Goal achievement probability
      - Retirement readiness
      - Asset growth
      - Risk metrics
      
      Include assumptions and key drivers`,
      response_json_schema: {
        type: 'object',
        properties: {
          scenarios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                assumptions: { type: 'array', items: { type: 'string' } },
                projections: { type: 'object' },
                outcomes: { type: 'object' },
                probability: { type: 'number' },
              },
            },
          },
          comparison: { type: 'object' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating scenarios:', error);
    throw error;
  }
}

/**
 * Analyze specific scenario impact
 */
export async function analyzeScenarioImpact(userEmail, scenario, goals) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze specific scenario impact on financial goals:
      
      User: ${userEmail}
      Scenario: ${JSON.stringify(scenario)}
      Goals: ${JSON.stringify(goals)}
      
      Analyze:
      1. Impact on each goal (achievable yes/no)
      2. Timeline changes
      3. Required adjustments to achieve goals
      4. Alternative paths if goal at risk
      5. Sensitivity to key variables
      6. Recommendations for optimal outcome
      
      Provide actionable insights for this scenario`,
      response_json_schema: {
        type: 'object',
        properties: {
          scenarioName: { type: 'string' },
          goalOutcomes: { type: 'array', items: { type: 'object' } },
          keyRisks: { type: 'array', items: { type: 'string' } },
          requiredAdjustments: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          optimalPath: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error analyzing scenario impact:', error);
    throw error;
  }
}

/**
 * Get sensitivity analysis for scenario
 */
export async function getSensitivityAnalysis(userEmail, scenario) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform sensitivity analysis for scenario:
      
      User: ${userEmail}
      Scenario: ${JSON.stringify(scenario)}
      
      Analyze sensitivity to:
      1. Market return rates (±1%, ±2%, ±3%)
      2. Inflation rates (±0.5%, ±1%)
      3. Contribution amounts (±10%, ±20%)
      4. Withdrawal rates
      5. Tax rate changes
      6. Life expectancy changes
      
      Show impact on outcomes and retirement date`,
      response_json_schema: {
        type: 'object',
        properties: {
          variables: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                variable: { type: 'string' },
                baseCase: { type: 'number' },
                variations: { type: 'array', items: { type: 'object' } },
                impact: { type: 'string' },
              },
            },
          },
          criticalVariables: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error getting sensitivity analysis:', error);
    throw error;
  }
}

export default {
  generateScenarios,
  analyzeScenarioImpact,
  getSensitivityAnalysis,
};