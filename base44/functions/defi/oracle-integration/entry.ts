export default async function oracleIntegration(data, context) {
  const { asset_symbols, data_type = 'price' } = data;
  
  const oracleData = await context.integrations.Core.InvokeLLM({
    prompt: `Simulate oracle data for DeFi applications:

Assets: ${asset_symbols.join(', ')}
Data Type: ${data_type}

Provide real-time oracle data including:
1. Current prices with precision
2. Price confidence intervals
3. Data freshness timestamps
4. Multiple data source aggregation
5. Deviation detection
6. Historical comparison`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        oracle_feeds: {
          type: "array",
          items: {
            type: "object",
            properties: {
              asset: { type: "string" },
              price: { type: "number" },
              confidence: { type: "number" },
              sources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    source_name: { type: "string" },
                    price: { type: "number" },
                    weight: { type: "number" },
                    last_update: { type: "string" }
                  }
                }
              },
              aggregated_price: { type: "number" },
              deviation: { type: "number" },
              timestamp: { type: "string" }
            }
          }
        },
        data_quality: {
          type: "object",
          properties: {
            overall_confidence: { type: "number" },
            staleness_warning: { type: "boolean" },
            anomalies_detected: { type: "array", items: { type: "string" } }
          }
        }
      }
    }
  });
  
  const enrichedData = {
    ...oracleData,
    risk_assessment: {},
    price_bands: {}
  };
  
  for (const feed of oracleData.oracle_feeds) {
    await context.entities.MarketAsset.create({
      symbol: feed.asset,
      price: feed.aggregated_price,
      volume_24h: 0,
      market_cap: 0,
      oracle_sourced: true,
      oracle_confidence: feed.confidence,
      oracle_sources: feed.sources.length
    });
    
    const priceDeviation = Math.abs(feed.deviation);
    enrichedData.risk_assessment[feed.asset] = {
      volatility_risk: priceDeviation > 5 ? 'high' : priceDeviation > 2 ? 'medium' : 'low',
      data_reliability: feed.confidence > 95 ? 'excellent' : feed.confidence > 85 ? 'good' : 'fair',
      source_diversity: feed.sources.length >= 3 ? 'adequate' : 'limited'
    };
    
    enrichedData.price_bands[feed.asset] = {
      upper_band: feed.aggregated_price * (1 + priceDeviation / 100),
      lower_band: feed.aggregated_price * (1 - priceDeviation / 100),
      expected_price: feed.aggregated_price
    };
  }
  
  const portfolios = await context.entities.CryptoAsset.filter({
    symbol: { $in: asset_symbols }
  });
  
  for (const portfolio of portfolios) {
    const oracleFeed = oracleData.oracle_feeds.find(f => f.asset === portfolio.symbol);
    if (oracleFeed) {
      await context.entities.CryptoAsset.update(portfolio.id, {
        current_price: oracleFeed.aggregated_price,
        last_price_update: new Date().toISOString()
      });
    }
  }
  
  return {
    oracle_data: enrichedData,
    assets_updated: portfolios.length,
    data_quality: oracleData.data_quality,
    timestamp: new Date().toISOString()
  };
}