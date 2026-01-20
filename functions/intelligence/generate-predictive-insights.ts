import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target_domains, time_horizon } = await req.json();

    // Gather data from multiple hubs
    const [agents, simulations, marketData, devices] = await Promise.all([
      base44.entities.Agent.filter({}).limit(100),
      base44.entities.Simulation.filter({}).limit(50),
      base44.entities.MarketDataStream.filter({}).limit(50),
      base44.entities.PhysicalDevice.filter({}).limit(100)
    ]);

    // Use AI to generate predictive insights
    const insightsData = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the following data and generate 5 predictive insights for the next ${time_horizon} hours across ${target_domains.join(', ')} domains. 
      
Data Summary:
- ${agents.length} AI agents with various statuses and behaviors
- ${simulations.length} active simulations
- ${marketData.length} market data points
- ${devices.length} connected devices

For each insight provide: insight title, prediction description, confidence level (0-1), time to impact (hours), affected entities (list), risk level (low/medium/high), opportunity score (0-100), and recommended actions (list).`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                prediction: { type: "string" },
                confidence: { type: "number" },
                time_to_impact: { type: "number" },
                affected_entities: { type: "array", items: { type: "string" } },
                risk_level: { type: "string" },
                opportunity_score: { type: "number" },
                actions: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Create predictive model records
    const models = [];
    for (const insight of insightsData.insights) {
      const model = await base44.entities.PredictiveModel.create({
        model_name: `Prediction_${insight.title.replace(/\s+/g, '_')}`,
        model_type: 'time_series',
        target_entity: insight.affected_entities[0] || 'general',
        features: [
          { feature_name: 'time_to_impact', importance: 0.9, data_type: 'numeric' },
          { feature_name: 'confidence', importance: insight.confidence, data_type: 'numeric' }
        ],
        performance_metrics: {
          accuracy: insight.confidence,
          f1_score: insight.confidence * 0.95
        },
        training_data: {
          samples_count: agents.length + simulations.length,
          time_range: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          }
        },
        predictions_made: 0,
        last_prediction: {
          timestamp: new Date().toISOString(),
          prediction_value: insight.opportunity_score,
          confidence: insight.confidence
        },
        is_active: true
      });
      models.push(model);
    }

    return Response.json({
      success: true,
      insights: insightsData.insights,
      models_created: models.length,
      models
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});