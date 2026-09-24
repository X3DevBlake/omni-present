import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      simulation_scenario,
      time_horizon_minutes = 30,
      environmental_changes = {}, // { temperature: +5, humidity: -10, light: +20 }
      agent_interventions = [], // [{ agent_id, action_type, parameters }]
      include_obstacles = true
    } = await req.json();

    // Fetch current state
    const [sensors, agents, obstacles, tasks, zones] = await Promise.all([
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 50),
      base44.asServiceRole.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
      base44.asServiceRole.entities.PredictiveObstacle.list('-created_date', 20),
      base44.asServiceRole.entities.AutonomousTaskPlan.filter({ plan_status: 'executing' }),
      base44.asServiceRole.entities.SpatialZone.list('-created_date', 10)
    ]);

    // Build current state snapshot
    const currentState = {
      sensors: sensors.map(s => ({ 
        type: s.sensor_type, 
        value: s.reading_value, 
        position: s.position,
        thresholds: s.thresholds
      })),
      agents: agents.map(a => ({ 
        id: a.agent_id, 
        position: a.current_location, 
        activity: a.current_activity,
        battery: a.battery_level
      })),
      obstacles: obstacles.map(o => ({ 
        type: o.obstacle_type, 
        position: o.current_position, 
        velocity: o.velocity,
        trajectory: o.predicted_trajectory
      })),
      active_tasks: tasks.length
    };

    // Use AI to predict future state
    const predictionPrompt = `You are an advanced environmental prediction AI.

CURRENT STATE:
${JSON.stringify(currentState, null, 2)}

SCENARIO: ${simulation_scenario || 'Predict next 30 minutes'}
TIME HORIZON: ${time_horizon_minutes} minutes
ENVIRONMENTAL CHANGES: ${JSON.stringify(environmental_changes)}
AGENT INTERVENTIONS: ${JSON.stringify(agent_interventions)}

Predict:
1. How sensor readings will change over time
2. Agent behavior and task success probability
3. Collision risks and safety hazards
4. Energy consumption and battery drain
5. Environmental comfort levels
6. Task completion likelihood

Provide temporal predictions at 5, 15, and ${time_horizon_minutes} minute marks.`;

    const prediction = await base44.integrations.Core.InvokeLLM({
      prompt: predictionPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          simulation_name: { type: "string" },
          time_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time_offset_minutes: { type: "number" },
                predicted_sensors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sensor_type: { type: "string" },
                      predicted_value: { type: "number" },
                      confidence: { type: "number" }
                    }
                  }
                },
                agent_states: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      agent_id: { type: "string" },
                      predicted_position: { type: "object" },
                      predicted_activity: { type: "string" },
                      battery_remaining: { type: "number" }
                    }
                  }
                },
                collision_risks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      agent_id: { type: "string" },
                      obstacle_id: { type: "string" },
                      probability: { type: "number" }
                    }
                  }
                },
                task_success_probability: { type: "number" },
                comfort_score: { type: "number" },
                safety_score: { type: "number" }
              }
            }
          },
          overall_assessment: { type: "string" },
          recommended_interventions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                intervention_type: { type: "string" },
                description: { type: "string" },
                expected_benefit: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create predictive forecast record
    const forecast = await base44.asServiceRole.entities.PredictiveForecast.create({
      forecast_type: 'environmental_simulation',
      forecast_data: prediction,
      base_data_snapshot: currentState,
      scenario_description: simulation_scenario,
      time_horizon_minutes,
      confidence_score: prediction.time_steps?.[0]?.task_success_probability || 0.75,
      status: 'completed'
    });

    return Response.json({
      success: true,
      simulation_id: forecast.id,
      prediction,
      current_state: currentState,
      time_steps: prediction.time_steps,
      interventions: prediction.recommended_interventions
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});