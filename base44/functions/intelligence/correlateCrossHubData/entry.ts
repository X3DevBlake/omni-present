import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hub_pairs } = await req.json();
    
    const correlations = [];
    
    for (const pair of hub_pairs) {
      const { source_hub, target_hub } = pair;
      
      // Gather data from source hub
      let sourceData = {};
      if (source_hub === 'defi') {
        const cryptoAssets = await base44.entities.CryptoAssetData.list();
        sourceData = {
          avg_volatility: cryptoAssets.reduce((sum, a) => sum + (a.volatility_24h || 0), 0) / cryptoAssets.length,
          market_sentiment: cryptoAssets.filter(a => (a.price_24h_change || 0) > 0).length / cryptoAssets.length
        };
      } else if (source_hub === 'communication') {
        const messages = await base44.entities.EnhancedAgentMessage.list();
        sourceData = {
          avg_sentiment: messages.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / messages.length,
          message_volume: messages.length
        };
      }
      
      // AI correlation analysis
      const correlation = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze correlation between ${source_hub} hub data and ${target_hub} hub:
        
        Source Hub (${source_hub}): ${JSON.stringify(sourceData)}
        
        How can this data inform decisions in ${target_hub}? What insights can be derived?`,
        response_json_schema: {
          type: "object",
          properties: {
            correlation_coefficient: { type: "number" },
            insights: { type: "array", items: { type: "string" } },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hub: { type: "string" },
                  action: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            link_strength: { type: "number" }
          }
        }
      });
      
      // Create or update cross-hub link
      const existing = await base44.entities.CrossHubLink.filter({
        source_hub,
        target_hub
      });
      
      if (existing.length > 0) {
        await base44.entities.CrossHubLink.update(existing[0].id, {
          correlation_coefficient: correlation.correlation_coefficient,
          link_strength: correlation.link_strength,
          last_sync: new Date().toISOString()
        });
      } else {
        await base44.entities.CrossHubLink.create({
          source_hub,
          target_hub,
          data_type: 'market_intelligence',
          link_strength: correlation.link_strength,
          correlation_coefficient: correlation.correlation_coefficient,
          sync_frequency_minutes: 15,
          last_sync: new Date().toISOString()
        });
      }
      
      correlations.push({
        source_hub,
        target_hub,
        ...correlation
      });
    }
    
    return Response.json({
      correlations,
      links_analyzed: correlations.length
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});