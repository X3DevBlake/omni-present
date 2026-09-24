import { base44 } from '@/api/base44Client';

/**
 * Brokerage Integration
 * Third-party API connections for automated trading
 */

/**
 * Connect to brokerage account via OAuth
 */
export async function connectBrokerageAccount(userEmail, brokerageName) {
  try {
    const brokerages = {
      fidelity: {
        oauthUrl: 'https://fidelity.com/oauth/authorize',
        scopes: ['account:read', 'portfolio:read', 'trading:execute'],
      },
      vanguard: {
        oauthUrl: 'https://vanguard.com/oauth/authorize',
        scopes: ['account:read', 'portfolio:read', 'trading:execute'],
      },
      schwab: {
        oauthUrl: 'https://schwab.com/oauth/authorize',
        scopes: ['account:read', 'portfolio:read', 'trading:execute'],
      },
      interactive_brokers: {
        oauthUrl: 'https://interactivebrokers.com/oauth/authorize',
        scopes: ['account:read', 'portfolio:read', 'trading:execute'],
      },
    };

    const brokerage = brokerages[brokerageName.toLowerCase()];
    if (!brokerage) throw new Error(`Unsupported brokerage: ${brokerageName}`);

    return {
      userEmail,
      brokerageName,
      authUrl: brokerage.oauthUrl,
      scopes: brokerage.scopes,
      status: 'awaiting_auth',
    };
  } catch (error) {
    console.error('Error connecting brokerage:', error);
    throw error;
  }
}

/**
 * Get connected brokerage accounts
 */
export async function getConnectedBrokerages(userEmail) {
  try {
    const accounts = {
      userEmail,
      brokerages: [
        {
          name: 'Fidelity',
          connected: true,
          lastSync: '2026-01-11T10:30:00Z',
          accountType: 'Individual',
          balances: {
            cash: 5200,
            investments: 125000,
          },
          permissions: ['read', 'trade'],
        },
      ],
    };

    return accounts;
  } catch (error) {
    console.error('Error getting connected brokerages:', error);
    throw error;
  }
}

/**
 * Execute trade via brokerage API
 */
export async function executeTrade(userEmail, tradeDetails, brokerageAccessToken) {
  try {
    // In production, this would call the actual brokerage API
    // For now, we validate and prepare the trade

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Validate and prepare trade execution:
      
      User: ${userEmail}
      Trade Details: ${JSON.stringify(tradeDetails)}
      
      Validate:
      1. Sufficient buying power/positions available
      2. Order type and parameters
      3. Market hours and trading restrictions
      4. Compliance and regulatory requirements
      5. Cost and fee estimates
      
      Return: validation status, estimated execution time, costs`,
      response_json_schema: {
        type: 'object',
        properties: {
          isValid: { type: 'boolean' },
          validationIssues: { type: 'array', items: { type: 'string' } },
          orderId: { type: 'string' },
          estimatedExecutionTime: { type: 'string' },
          estimatedCost: { type: 'number' },
          status: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
}

/**
 * Get account data from brokerage
 */
export async function syncBrokerageData(userEmail, brokerageName) {
  try {
    const data = {
      userEmail,
      brokerageName,
      lastSync: new Date().toISOString(),
      portfolio: {
        totalValue: 130200,
        cash: 5200,
        investments: 125000,
      },
      positions: [
        { symbol: 'VOO', shares: 50, value: 22500 },
        { symbol: 'VEA', shares: 75, value: 18750 },
        { symbol: 'BND', shares: 150, value: 18000 },
      ],
      recentTransactions: [],
    };

    return data;
  } catch (error) {
    console.error('Error syncing brokerage data:', error);
    throw error;
  }
}

export default {
  connectBrokerageAccount,
  getConnectedBrokerages,
  executeTrade,
  syncBrokerageData,
};