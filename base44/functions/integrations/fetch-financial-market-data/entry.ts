/**
 * Fetch Financial Market Data (Stocks, ETFs, etc.)
 * - Fetches real-time stock prices and data
 * - Pulls market news and sentiment
 * - Updates MarketAsset entities
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'], includeNews = true } = req.body;

    // Fetch market data via LLM with web search for real-time data
    const marketData = await base44.integrations.Core.InvokeLLM({
      prompt: `Get current market data for these stock symbols: ${symbols.join(', ')}. 
      For each, provide: current price, 24h change %, 7d change %, market cap, 24h volume, PE ratio, sector, dividend yield.
      ${includeNews ? 'Also get latest 3 news headlines and sentiment score (-1 to 1).' : ''}
      Return as JSON array with all fields.`,
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
                name: { type: 'string' },
                current_price: { type: 'number' },
                price_change_24h: { type: 'number' },
                price_change_7d: { type: 'number' },
                market_cap: { type: 'number' },
                volume_24h: { type: 'number' },
                pe_ratio: { type: 'number' },
                sector: { type: 'string' },
                dividend_yield: { type: 'number' },
                sentiment_score: { type: 'number' },
                news_count: { type: 'integer' },
                exchange: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Update or create MarketAsset entities
    for (const asset of marketData.assets) {
      const existing = await base44.entities.MarketAsset.filter({
        symbol: asset.symbol
      });

      if (existing.length > 0) {
        await base44.entities.MarketAsset.update(existing[0].id, {
          current_price: asset.current_price,
          price_change_24h: asset.price_change_24h,
          price_change_7d: asset.price_change_7d,
          market_cap: asset.market_cap,
          volume_24h: asset.volume_24h,
          pe_ratio: asset.pe_ratio,
          dividend_yield: asset.dividend_yield,
          sentiment_score: asset.sentiment_score,
          news_count: asset.news_count,
          last_updated: new Date().toISOString()
        });
      } else {
        await base44.entities.MarketAsset.create({
          symbol: asset.symbol,
          name: asset.name,
          asset_type: 'stock',
          exchange: asset.exchange || 'NASDAQ',
          current_price: asset.current_price,
          price_change_24h: asset.price_change_24h,
          price_change_7d: asset.price_change_7d,
          market_cap: asset.market_cap,
          volume_24h: asset.volume_24h,
          pe_ratio: asset.pe_ratio,
          sector: asset.sector,
          dividend_yield: asset.dividend_yield,
          sentiment_score: asset.sentiment_score,
          news_count: asset.news_count,
          last_updated: new Date().toISOString()
        });
      }
    }

    res.status(200).json({
      success: true,
      assets_updated: marketData.assets.length,
      data: marketData.assets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market data fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}