import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario_count = 5 } = await req.json();

    // Fetch current environmental conditions
    const [sensors, obstacles, tasks, agents] = await Promise.all([
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 30),
      base44.asServiceRole.entities.PredictiveObstacle.list('-created_date', 20),
      base44.asServiceRole.entities.AutonomousTaskPlan.filter({ plan_status: 'executing' }),
      base44.asServiceRole.entities.AgentPhysicalPresence.filter({ projection_status: 'active' })
    ]);

    // Auto-generate what-if scenarios
    const scenarioPrompt = `You are an Auto Scenario Generator with omega predictive intelligence.

CURRENT ENVIRONMENT:
- Sensors: ${sensors.map(s => `${s.sensor_type}: ${s.reading_value}${s.unit}`).join(', ')}
- Moving Obstacles: ${obstacles.length}
- Active Tasks: ${tasks.length}
- Active Agents: ${agents.length}

IDENTIFIED RISKS:
- Sensor alerts: ${sensors.filter(s => s.alert_triggered).length}
- High-speed obstacles: ${obstacles.filter(o => (o.velocity?.speed_ms || 0) > 1).length}

Generate ${scenario_count} WHAT-IF SCENARIOS automatically:
1. Based on current risks and conditions
2. Explore edge cases and failure modes
3. Test environmental extremes
4. Simulate equipment failures
5. Model coordination breakdowns
6. Predict cascading effects
7. Identify optimal interventions

Each scenario should be realistic and actionable.`;

    const scenarios = await base44.integrations.Core.InvokeLLM({
      prompt: scenarioPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          scenarios: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario_name: { type: "string" },
                trigger_condition: { type: "string" },
                environmental_changes: {
                  type: "object",
                  properties: {
                    temperature_delta: { type: "number" },
                    humidity_delta: { type: "number" },
                    light_delta: { type: "number" }
                  }
                },
                predicted_consequences: { type: "array", items: { type: "string" } },
                risk_level: { type: "string" },
                mitigation_strategies: { type: "array", items: { type: "string" } },
                probability: { type: "number" },
                time_to_impact_minutes: { type: "number" }
              }
            }
          },
          priority_scenario: { type: "string" },
          recommended_preparations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Store scenarios as predictive forecasts
    for (const scenario of scenarios.scenarios || []) {
      await base44.asServiceRole.entities.PredictiveForecast.create({
        forecast_type: 'what_if_scenario',
        forecast_data: scenario,
        scenario_description: scenario.scenario_name,
        confidence_score: scenario.probability || 0.7,
        status: 'pending'
      });
    }

    return Response.json({
      success: true,
      scenarios: scenarios.scenarios,
      priority: scenarios.priority_scenario,
      scenarios_created: scenarios.scenarios?.length || 0
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});