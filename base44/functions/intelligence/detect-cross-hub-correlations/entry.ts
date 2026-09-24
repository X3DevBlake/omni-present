import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather metrics from different hubs
    const [agentMetrics, simulationMetrics, financialMetrics, deviceMetrics] = await Promise.all([
      base44.entities.AgentKPI.filter({}).limit(50),
      base44.entities.SimulationMetrics.filter({}).limit(50),
      base44.entities.OmniTransaction.filter({}).limit(100),
      base44.entities.SensorData.filter({}).limit(100)
    ]);

    // Use AI to detect correlations
    const correlationsData = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these cross-hub metrics and identify 5 significant correlations or patterns:
      
Agent Metrics: ${agentMetrics.length} data points
Simulation Metrics: ${simulationMetrics.length} data points
Financial Transactions: ${financialMetrics.length} records
Device Sensor Data: ${deviceMetrics.length} readings

For each correlation provide: insight title, correlation type, connected hubs (array), correlation strength (0-1), pattern description, business impact score (0-100), lag time between patterns (seconds), and 3 actionable recommendations with priority levels.`,
      response_json_schema: {
        type: "object",
        properties: {
          correlations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                type: { type: "string" },
                hubs: { type: "array", items: { type: "string" } },
                strength: { type: "number" },
                pattern: { type: "string" },
                impact_score: { type: "number" },
                lag_time: { type: "number" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Create cross-hub insight records
    const insights = [];
    for (const corr of correlationsData.correlations) {
      const insight = await base44.entities.CrossHubInsight.create({
        insight_title: corr.title,
        insight_type: 'correlation',
        connected_hubs: corr.hubs,
        correlation_strength: corr.strength,
        pattern_data: {
          primary_pattern: corr.pattern,
          secondary_pattern: `Related to ${corr.hubs.join(' and ')}`,
          lag_time: corr.lag_time
        },
        business_impact: {
          impact_score: corr.impact_score,
          affected_metrics: corr.hubs,
          potential_value: corr.impact_score * 1000
        },
        ai_interpretation: corr.pattern,
        actionable_recommendations: corr.recommendations.map(r => ({
          action: r.action,
          priority: r.priority,
          expected_outcome: `Improve ${corr.title}`
        })),
        validation_status: 'pending'
      });
      insights.push(insight);
    }

    return Response.json({
      success: true,
      correlations: correlationsData.correlations,
      insights_created: insights.length,
      insights
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});