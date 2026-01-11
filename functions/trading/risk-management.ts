import { base44 } from '@/api/base44Client';

export async function proactiveRiskManagement(userEmail, agentId) {
  // Analyze portfolio for risks
  const portfolio = await base44.entities.CryptoAsset.filter({ user_email: userEmail }).catch(() => []);
  const trades = await base44.entities.TradeExecution.filter({ user_email: userEmail });
  
  const riskAnalysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze portfolio risk: ${portfolio.length} assets, ${trades.length} trades. Research current market conditions, identify potential downturns, and recommend hedging strategies.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        risk_level: { type: 'string' },
        threats: { type: 'array', items: { type: 'object' } },
        hedge_recommendations: { type: 'array', items: { type: 'object' } }
      }
    }
  });

  if (riskAnalysis.risk_level === 'high' || riskAnalysis.risk_level === 'critical') {
    // Autonomous hedging
    for (const hedge of riskAnalysis.hedge_recommendations) {
      await executeHedge(userEmail, agentId, hedge, riskAnalysis.threats);
    }
  }

  return riskAnalysis;
}

async function executeHedge(userEmail, agentId, hedgeStrategy, threats) {
  const hedge = {
    user_email: userEmail,
    agent_id: agentId,
    risk_detected: { threats, severity: 'high' },
    hedge_strategy: hedgeStrategy.strategy,
    hedge_instruments: hedgeStrategy.instruments || [],
    protection_level: hedgeStrategy.protection || 80,
    cost: hedgeStrategy.cost || 0,
    status: 'active',
    created_at: new Date().toISOString()
  };

  return await base44.entities.RiskHedge.create(hedge);
}

export async function generatePersonalizedAdvice(userEmail, goals, riskTolerance) {
  const financialState = await getUserFinancialState(userEmail);
  
  const advice = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate personalized financial advice for user with: Goals: ${JSON.stringify(goals)}, Risk tolerance: ${riskTolerance}, Current state: ${JSON.stringify(financialState)}. Research market conditions and provide detailed, actionable advice.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        recommendations: { type: 'array', items: { type: 'object' } },
        action_plan: { type: 'string' },
        timeline: { type: 'string' }
      }
    }
  });

  return advice;
}

async function getUserFinancialState(userEmail) {
  const accounts = await base44.entities.OmniBankAccount.filter({ user_email: userEmail }).catch(() => []);
  const trades = await base44.entities.TradeExecution.filter({ user_email: userEmail });
  
  return {
    total_balance: accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
    active_trades: trades.filter(t => t.status === 'executed').length,
    risk_exposure: 'moderate'
  };
}