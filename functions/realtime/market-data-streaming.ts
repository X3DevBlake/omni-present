import { base44 } from '@/api/base44Client';

export async function initializeMarketDataStream(userEmail, symbols = []) {
  const defaultSymbols = ['BTC', 'ETH', 'AAPL', 'GOOGL', 'MSFT'];
  const assetsToStream = symbols.length > 0 ? symbols : defaultSymbols;

  const feeds = [];
  
  for (const symbol of assetsToStream) {
    const feed = {
      user_email: userEmail,
      source: symbol.length <= 4 ? 'binance' : 'alpha_vantage',
      data_type: 'price',
      asset_symbol: symbol,
      status: 'connected',
      last_update: new Date().toISOString(),
      current_value: Math.random() * 100000,
      previous_value: Math.random() * 100000,
      change_percent: (Math.random() - 0.5) * 10
    };

    const created = await base44.entities.LiveDataFeed.create(feed);
    feeds.push(created);
  }

  return feeds;
}

export async function updateLiveDataFeed(feedId, newValue) {
  const feed = await base44.entities.LiveDataFeed.filter({ id: feedId });
  if (feed.length === 0) return null;

  const oldValue = feed[0].current_value;
  const changePercent = ((newValue - oldValue) / oldValue) * 100;

  return await base44.entities.LiveDataFeed.update(feedId, {
    previous_value: oldValue,
    current_value: newValue,
    change_percent: changePercent,
    last_update: new Date().toISOString()
  });
}

export async function streamMultipleAssets(userEmail) {
  const feeds = await base44.entities.LiveDataFeed.filter({ user_email: userEmail });

  return feeds.map(feed => ({
    ...feed,
    // Simulate price fluctuation
    simulated_price: feed.current_value * (1 + (Math.random() - 0.5) * 0.02)
  }));
}

export async function getMarketSnapshot(userEmail) {
  const feeds = await base44.entities.LiveDataFeed.filter({ user_email: userEmail });
  
  const totalValue = feeds.reduce((sum, f) => sum + (f.current_value || 0), 0);
  const avgChange = feeds.reduce((sum, f) => sum + (f.change_percent || 0), 0) / feeds.length;

  return {
    total_market_value: totalValue,
    average_change: avgChange,
    assets: feeds,
    timestamp: new Date().toISOString()
  };
}

export async function fetchExternalMarketData(symbol) {
  // In production, this would call actual APIs like Binance, Alpha Vantage, etc.
  // For now, we'll use the LLM to get data
  const data = await base44.integrations.Core.InvokeLLM({
    prompt: `Get current market data for ${symbol}. Return JSON with: price, volume_24h, change_24h, market_cap`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        price: { type: 'number' },
        volume_24h: { type: 'number' },
        change_24h: { type: 'number' },
        market_cap: { type: 'number' }
      }
    }
  });

  return data;
}