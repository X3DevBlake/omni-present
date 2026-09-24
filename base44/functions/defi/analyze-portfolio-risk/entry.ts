export default async function analyzePortfolioRisk(data, context) {
  const { user_email } = data;
  
  // Get user's crypto assets
  const assets = await context.entities.CryptoAsset.filter({ user_email });
  
  if (assets.length === 0) {
    return { risk_level: 'none', message: 'No assets in portfolio' };
  }
  
  // Calculate portfolio metrics
  const totalValue = assets.reduce((sum, asset) => sum + (asset.balance * asset.current_price || 0), 0);
  
  // Calculate concentration risk
  const assetsByValue = assets.map(asset => ({
    symbol: asset.symbol,
    value: asset.balance * asset.current_price || 0,
    percentage: ((asset.balance * asset.current_price || 0) / totalValue) * 100
  })).sort((a, b) => b.value - a.value);
  
  const topAssetConcentration = assetsByValue[0]?.percentage || 0;
  const top3Concentration = assetsByValue.slice(0, 3).reduce((sum, a) => sum + a.percentage, 0);
  
  // Analyze with AI
  const analysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze this crypto portfolio for risk:

Total Value: $${totalValue.toFixed(2)}
Number of Assets: ${assets.length}
Top Asset Concentration: ${topAssetConcentration.toFixed(1)}%
Top 3 Concentration: ${top3Concentration.toFixed(1)}%

Assets:
${assetsByValue.map(a => `${a.symbol}: $${a.value.toFixed(2)} (${a.percentage.toFixed(1)}%)`).join('\n')}

Provide:
1. Overall risk level (low/medium/high/critical)
2. Key risk factors
3. Specific recommendations for diversification
4. Suggested rebalancing actions`,
    response_json_schema: {
      type: "object",
      properties: {
        risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
        risk_score: { type: "number" },
        risk_factors: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
        rebalancing_suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action: { type: "string" },
              asset: { type: "string" },
              target_percentage: { type: "number" }
            }
          }
        }
      }
    }
  });
  
  return {
    ...analysis,
    portfolio_value: totalValue,
    asset_count: assets.length,
    concentration_metrics: {
      top_asset: topAssetConcentration,
      top_3: top3Concentration
    }
  };
}