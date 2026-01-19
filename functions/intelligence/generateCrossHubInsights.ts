import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather data from all hubs
    const [
      cryptoAssets,
      agentProfiles,
      communications,
      securityEvents,
      simulations
    ] = await Promise.all([
      base44.entities.CryptoAssetData.list(),
      base44.entities.AgentMarketplaceProfile.list(),
      base44.entities.EnhancedAgentMessage.list(),
      base44.entities.SecurityEvent.list(),
      base44.entities.SimulationEnvironmentConfig.list()
    ]);
    
    // AI-powered cross-hub insight generation
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze data from multiple hubs and generate actionable insights:
      
      DeFi Hub: ${cryptoAssets.length} assets tracked, avg market sentiment
      Agent Marketplace: ${agentProfiles.length} agents, avg performance
      Communication Hub: ${communications.length} messages, sentiment trends
      Security Hub: ${securityEvents.length} events, threat landscape
      Simulation Lab: ${simulations.length} environments
      
      Identify cross-hub patterns, correlations, and strategic opportunities.`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                source_hubs: { type: "array", items: { type: "string" } },
                insight_type: { type: "string" },
                analysis: { type: "string" },
                confidence: { type: "number" },
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
                }
              }
            }
          },
          global_health_score: { type: "number" },
          critical_alerts: { type: "array", items: { type: "string" } }
        }
      }
    });
    
    // Store insights
    const storedInsights = [];
    
    for (const insight of insights.insights) {
      const stored = await base44.entities.InsightAggregator.create({
        insight_title: insight.title,
        source_hubs: insight.source_hubs,
        insight_type: insight.insight_type,
        ai_analysis: insight.analysis,
        confidence_score: insight.confidence,
        recommended_actions: insight.recommended_actions,
        is_actionable: true,
        acted_upon: false
      });
      
      storedInsights.push(stored);
    }
    
    return Response.json({
      insights: storedInsights,
      global_health_score: insights.global_health_score,
      critical_alerts: insights.critical_alerts,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});