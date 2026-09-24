/**
 * Fetch Real-Time Market Data
 * - Pulls crypto prices and market data
 * - Updates CryptoAsset entities
 * - Triggers market sentiment analysis
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { assets = ['ETH', 'BTC', 'USDC', 'USDT'] } = req.body;

    // Fetch market data via LLM integration with web search
    const marketData = await base44.integrations.Core.InvokeLLM({
      prompt: `Get current market data for these crypto assets: ${assets.join(', ')}. 
      For each, provide: current price, 24h volume, market cap, price change 24h, price change 7d.
      Return as JSON array.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          assets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                current_price: { type: 'number' },
                volume_24h: { type: 'number' },
                market_cap: { type: 'number' },
                price_change_24h: { type: 'number' },
                price_change_7d: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Update CryptoAsset entities
    for (const asset of marketData.assets) {
      const existing = await base44.entities.CryptoAsset.filter({
        symbol: asset.symbol
      });

      if (existing.length > 0) {
        await base44.entities.CryptoAsset.update(existing[0].id, {
          current_price: asset.current_price,
          volume_24h: asset.volume_24h,
          market_cap: asset.market_cap,
          price_change_24h: asset.price_change_24h,
          price_change_7d: asset.price_change_7d,
          last_updated: new Date().toISOString()
        });
      } else {
        await base44.entities.CryptoAsset.create({
          symbol: asset.symbol,
          name: asset.symbol,
          current_price: asset.current_price,
          volume_24h: asset.volume_24h,
          market_cap: asset.market_cap,
          price_change_24h: asset.price_change_24h,
          price_change_7d: asset.price_change_7d,
          network: 'ethereum',
          last_updated: new Date().toISOString()
        });
      }
    }

    res.status(200).json({
      success: true,
      data: marketData.assets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market data fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}