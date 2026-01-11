import { base44 } from '@/api/base44Client';

export async function subscribeToMarketStream(userEmail, streamType, assets, agentId) {
  const stream = await base44.entities.MarketDataStream.create({
    user_email: userEmail,
    stream_type: streamType,
    asset_symbols: assets,
    subscribed_agents: [agentId],
    last_update: new Date().toISOString()
  });

  return stream;
}

export async function fetchRealtimeMarketData(streamId) {
  const stream = await base44.entities.MarketDataStream.filter({ id: streamId });
  if (stream.length === 0) return null;

  const liveData = await base44.integrations.Core.InvokeLLM({
    prompt: `Fetch real-time ${stream[0].stream_type} data for ${stream[0].asset_symbols.join(', ')}. Include prices, sentiment, trends.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        prices: { type: 'object' },
        sentiment: { type: 'object' },
        trends: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  await base44.entities.MarketDataStream.update(streamId, {
    live_data: liveData,
    last_update: new Date().toISOString()
  });

  return liveData;
}

export async function analyzeMultiModalNews(newsUrls) {
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Multi-modal news analysis: Analyze text, images, and videos from these sources. Extract sentiment, key events, market impact.`,
    file_urls: newsUrls,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        text_sentiment: { type: 'object' },
        visual_insights: { type: 'array', items: { type: 'string' } },
        market_impact: { type: 'string' },
        key_events: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return analysis;
}

export async function agentProcessLiveData(agentId, streamId) {
  const liveData = await fetchRealtimeMarketData(streamId);
  
  const decision = await base44.integrations.Core.InvokeLLM({
    prompt: `Agent ${agentId} decision: Process live data ${JSON.stringify(liveData)}. Make trading decision.`,
    response_json_schema: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        reasoning: { type: 'string' },
        confidence: { type: 'number' }
      }
    }
  });

  return decision;
}