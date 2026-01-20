import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather data from all major hubs
    const [forecasts, correlations, automations, collaborations, threats] = await Promise.all([
      base44.entities.PredictiveForecast.filter({}).limit(50),
      base44.entities.DataCorrelation.filter({}).limit(100),
      base44.entities.AutomationRule.filter({}).limit(100),
      base44.entities.CollaborationNetwork.filter({}).limit(50),
      base44.entities.ThreatDetection.filter({}).limit(100)
    ]);

    // Use AI to synthesize insights
    const intelligenceData = await base44.integrations.Core.InvokeLLM({
      prompt: `Synthesize cross-hub intelligence from all systems:
      
Active Forecasts: ${forecasts.length}
Data Correlations: ${correlations.length}
Automation Rules: ${automations.length}
Collaboration Networks: ${collaborations.length}
Security Threats: ${threats.length}

Generate 5 high-value insights with: category (pattern/anomaly/opportunity/risk/trend), insight text (detailed description), confidence (0-1), impact_score (0-100), potential_value estimate, 3 recommendations (each with action, priority, expected_outcome), and validation_status (pending/validated).`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                text: { type: "string" },
                confidence: { type: "number" },
                impact: { type: "number" },
                value: { type: "number" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string" },
                      outcome: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Create insight records
    const insights = [];
    for (const insight of intelligenceData.insights) {
      const created = await base44.entities.InsightEngine.create({
        insight_id: `INSIGHT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        insight_category: insight.category,
        data_sources: ['automations', 'collaborations', 'security', 'forecasts'],
        insight_text: insight.text,
        confidence_level: insight.confidence,
        business_impact: {
          impact_score: insight.impact,
          affected_areas: ['operations', 'security', 'efficiency'],
          potential_value: insight.value
        },
        recommendations: insight.recommendations.map(r => ({
          action: r.action,
          priority: r.priority,
          expected_outcome: r.outcome,
          implementation_complexity: 'medium'
        })),
        supporting_data: [],
        validation_status: 'pending'
      });
      insights.push(created);
    }

    return Response.json({
      success: true,
      insights,
      high_priority: insights.filter(i => 
        i.recommendations?.some(r => r.priority === 'high' || r.priority === 'urgent')
      ).length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});