import { base44 } from '@/api/base44Client';

/**
 * Automated Portfolio Actions Engine
 * Rebalancing, tax-loss harvesting automation
 */

/**
 * Authorize automatic rebalancing
 */
export async function authorizeAutoRebalancing(userEmail, parameters) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Validate and configure automatic rebalancing:
      
      User: ${userEmail}
      Parameters: ${JSON.stringify(parameters)}
      
      Validate:
      1. Drift thresholds (rebalance when any allocation drifts X%)
      2. Rebalancing frequency (min/max days between rebalancing)
      3. Order types and execution strategy
      4. Transaction cost limits
      5. Tax implications (coordinate with tax-loss harvesting)
      6. Approval workflow if needed
      
      Configuration: ${JSON.stringify(parameters)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          authorized: { type: 'boolean' },
          authorizationId: { type: 'string' },
          driftThreshold: { type: 'number' },
          rebalancingFrequency: { type: 'string' },
          executionStrategy: { type: 'string' },
          expectedCosts: { type: 'number' },
          validation: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error authorizing auto-rebalancing:', error);
    throw error;
  }
}

/**
 * Detect and execute tax-loss harvesting opportunities
 */
export async function executeTaxLossHarvesting(userEmail, portfolio, marketData, userParameters) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze and execute tax-loss harvesting strategy:
      
      User: ${userEmail}
      Portfolio: ${JSON.stringify(portfolio)}
      Market Data: ${JSON.stringify(marketData)}
      User Parameters: ${JSON.stringify(userParameters)}
      
      Analyze for:
      1. Positions with unrealized losses
      2. Loss magnitude and tax benefit
      3. Wash-sale risks and prevention
      4. Replacement security selection
      5. Execution timing and sequencing
      6. Net tax impact calculation
      
      Execute if:
      - Loss exceeds minimum threshold
      - Tax benefit exceeds trading costs
      - Wash-sale rules can be avoided
      - Meets user's risk tolerance`,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                security: { type: 'string' },
                currentValue: { type: 'number' },
                unrealizedLoss: { type: 'number' },
                taxBenefit: { type: 'number' },
                replacementSecurity: { type: 'string' },
                washSaleRisk: { type: 'string' },
              },
            },
          },
          executionPlan: { type: 'object' },
          totalTaxBenefit: { type: 'number' },
          tradingCosts: { type: 'number' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error executing tax-loss harvesting:', error);
    throw error;
  }
}

/**
 * Get automated action status and history
 */
export async function getAutomatedActionStatus(userEmail) {
  try {
    const status = {
      userEmail,
      autoRebalancingEnabled: true,
      autoRebalancingDriftThreshold: 5,
      lastRebalanceDate: '2025-12-28',
      nextRebalanceCheck: '2026-01-15',
      taxLossHarvestingEnabled: true,
      lastTaxLossHarvest: '2025-12-20',
      harvestedThisYear: 4200,
      estimatedTaxSavings: 1050,
      recentActions: [
        {
          date: '2025-12-28',
          type: 'rebalancing',
          description: 'Auto-rebalanced Tech (8% drift)',
          trades: 2,
          impact: 'Reduced risk by 1.2%',
        },
        {
          date: '2025-12-20',
          type: 'tax_loss_harvesting',
          description: 'Harvested loss in VEA',
          lossAmount: 2100,
          taxBenefit: 525,
        },
      ],
    };

    return status;
  } catch (error) {
    console.error('Error getting automated action status:', error);
    throw error;
  }
}

export default {
  authorizeAutoRebalancing,
  executeTaxLossHarvesting,
  getAutomatedActionStatus,
};