export default async function optimizeLiquidityProvision(data, context) {
  const { user_email, amount_usd } = data;
  
  const pools = await context.entities.LiquidityPool.filter({}).sort('-apy').limit(20);
  
  const userAssets = await context.entities.CryptoAsset.filter({ user_email });
  const totalPortfolioValue = userAssets.reduce((sum, a) => sum + (a.balance * (a.current_price || 0)), 0);
  
  const optimization = await context.integrations.Core.InvokeLLM({
    prompt: `Optimize liquidity provision across DeFi pools.

Available Amount: $${amount_usd}
Total Portfolio: $${totalPortfolioValue.toFixed(2)}

Top Pools:
${pools.map(p => `${p.pair}: APY ${p.apy}%, TVL $${p.tvl}, Volume $${p.volume_24h}`).join('\n')}

User Assets:
${userAssets.map(a => `${a.symbol}: ${a.balance}`).join('\n')}

Recommend optimal allocation across 2-4 pools considering:
1. Risk diversification
2. APY maximization
3. Impermanent loss risk
4. User's existing assets`,
    response_json_schema: {
      type: "object",
      properties: {
        allocations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pool_pair: { type: "string" },
              amount_usd: { type: "number" },
              percentage: { type: "number" },
              expected_apy: { type: "number" },
              risk_level: { type: "string" }
            }
          }
        },
        total_expected_return: { type: "number" },
        risk_score: { type: "number" },
        reasoning: { type: "string" }
      }
    }
  });
  
  return optimization;
}