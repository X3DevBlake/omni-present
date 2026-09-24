export default async function proactiveRiskIdentification(data, context) {
  const { user_email } = data;
  
  const assets = await context.entities.CryptoAsset.filter({ user_email });
  const positions = await context.entities.LiquidityPool.filter({ user_email });
  const transactions = await context.entities.WalletTransaction.filter({ 
    from_address: user_email 
  }).sort('-created_date').limit(50);
  
  const totalValue = assets.reduce((sum, a) => sum + (a.balance * (a.current_price || 0)), 0);
  const portfolioComposition = assets.map(a => ({
    symbol: a.symbol,
    value: a.balance * (a.current_price || 0),
    percentage: ((a.balance * (a.current_price || 0)) / totalValue) * 100
  }));
  
  const lpRisks = positions.map(p => ({
    pair: p.pair,
    apy: p.apy,
    tvl: p.tvl,
    impermanent_loss_risk: p.apy > 100 ? 'high' : p.apy > 50 ? 'medium' : 'low'
  }));
  
  const riskAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Proactively identify DeFi risks in this portfolio:

Portfolio Value: $${totalValue.toFixed(2)}
Asset Distribution:
${portfolioComposition.map(a => `${a.symbol}: ${a.percentage.toFixed(1)}%`).join('\n')}

Liquidity Positions:
${lpRisks.map(lp => `${lp.pair}: APY ${lp.apy}%, IL Risk: ${lp.impermanent_loss_risk}`).join('\n')}

Recent Activity: ${transactions.length} transactions in last 50

Identify:
1. Concentration risks (>30% in single asset)
2. Impermanent loss exposure
3. Smart contract risks
4. Market volatility risks
5. Liquidity risks
6. Protocol-specific risks

For each risk, provide:
- Severity (critical/high/medium/low)
- Potential impact ($)
- Recommended actions
- Time-sensitivity`,
    response_json_schema: {
      type: "object",
      properties: {
        risks_identified: {
          type: "array",
          items: {
            type: "object",
            properties: {
              risk_type: { type: "string" },
              severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
              description: { type: "string" },
              affected_assets: { type: "array", items: { type: "string" } },
              potential_loss_usd: { type: "number" },
              probability: { type: "number" },
              time_horizon: { type: "string" },
              recommended_actions: { type: "array", items: { type: "string" } },
              urgency: { type: "string", enum: ["immediate", "within_24h", "within_week", "monitor"] }
            }
          }
        },
        overall_risk_score: { type: "number" },
        portfolio_health: { type: "string" },
        immediate_actions_required: { type: "boolean" }
      }
    }
  });
  
  for (const risk of riskAnalysis.risks_identified) {
    await context.entities.ProactiveAlert.create({
      alert_type: 'security_threat',
      severity: risk.severity,
      title: `DeFi Risk: ${risk.risk_type}`,
      description: risk.description,
      affected_agents: [],
      metrics: {
        potential_loss: risk.potential_loss_usd,
        probability: risk.probability,
        affected_assets: risk.affected_assets
      },
      suggested_actions: risk.recommended_actions,
      status: 'active',
      confidence_score: 85
    });
  }
  
  if (riskAnalysis.immediate_actions_required) {
    await context.integrations.Core.SendEmail({
      to: user_email,
      subject: '🚨 Immediate DeFi Risk Detected',
      body: `Critical DeFi risks identified requiring immediate attention:\n\n${
        riskAnalysis.risks_identified
          .filter(r => r.urgency === 'immediate')
          .map(r => `- ${r.risk_type}: ${r.description}`)
          .join('\n')
      }`
    });
  }
  
  return riskAnalysis;
}