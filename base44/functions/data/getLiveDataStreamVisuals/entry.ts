import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [marketStreams, liveFeeds, agents, simulations] = await Promise.all([
      base44.entities.MarketDataStream.list('-last_updated', 10),
      base44.entities.LiveDataFeed.filter({ is_active: true }, '-created_date', 20),
      base44.entities.Agent.filter({ status: 'active' }),
      base44.entities.Simulation.filter({ status: 'running' })
    ]);

    const impactAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze how ${marketStreams.length} market data streams and ${liveFeeds.length} live feeds are impacting ${agents.length} active agents and ${simulations.length} running simulations. Identify key influences and decision impacts.`,
      response_json_schema: {
        type: "object",
        properties: {
          primary_influences: {
            type: "array",
            items: { type: "string" }
          },
          agent_decisions_affected: { type: "integer" },
          simulation_adjustments: { type: "integer" },
          overall_impact_score: { type: "number" }
        }
      }
    });

    const dataStreams = marketStreams.map(stream => ({
      id: stream.id,
      symbol: stream.symbol,
      type: 'market',
      value: stream.price_data?.current_price || 0,
      trend: stream.price_data?.change_percentage > 0 ? 'rising' : 'falling',
      impact_score: Math.abs(stream.price_data?.change_percentage || 0) / 100,
      affected_agents: agents.slice(0, 3).map(a => a.id)
    }));

    const newsStreams = liveFeeds.filter(f => f.feed_type === 'news').map(feed => ({
      id: feed.id,
      title: feed.feed_name,
      type: 'news',
      sentiment: feed.current_value?.sentiment || 'neutral',
      impact_score: feed.impact_analysis?.impact_score || 0.5,
      affected_simulations: simulations.slice(0, 2).map(s => s.id)
    }));

    return Response.json({
      success: true,
      data_streams: dataStreams,
      news_streams: newsStreams,
      impact_analysis: impactAnalysis,
      total_streams: dataStreams.length + newsStreams.length,
      message: 'Live data stream visuals generated'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});