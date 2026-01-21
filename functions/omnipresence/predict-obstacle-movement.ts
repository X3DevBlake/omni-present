import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { obstacle_id, historical_positions, agent_positions, prediction_horizon_ms = 5000 } = await req.json();

    // Analyze movement patterns using AI
    const predictionPrompt = `Analyze this obstacle's movement history and predict its future trajectory.

Historical Positions (last 10 readings):
${JSON.stringify(historical_positions || [])}

Current Agent Positions:
${JSON.stringify(agent_positions || [])}

Prediction Horizon: ${prediction_horizon_ms}ms

Analyze:
1. Movement pattern type (stationary, linear, circular, random, goal-directed)
2. Average speed and direction
3. Predicted positions at 500ms intervals
4. Collision risk with each agent
5. Recommended avoidance actions for agents

Consider typical behavior patterns for the obstacle type.`;

    const prediction = await base44.integrations.Core.InvokeLLM({
      prompt: predictionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          behavior_analysis: {
            type: "object",
            properties: {
              pattern_type: { type: "string" },
              predictability_score: { type: "number" },
              average_speed_ms: { type: "number" },
              primary_direction: { type: "string" }
            }
          },
          predicted_trajectory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                timestamp_offset_ms: { type: "number" },
                position: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    z: { type: "number" }
                  }
                },
                confidence: { type: "number" }
              }
            }
          },
          collision_predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                collision_probability: { type: "number" },
                estimated_time_ms: { type: "number" },
                collision_point: { type: "object" },
                recommended_action: { type: "string" },
                action_urgency: { type: "string" }
              }
            }
          },
          safe_zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                zone_center: { type: "object" },
                radius: { type: "number" },
                safety_duration_ms: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Store or update predictive obstacle
    const predictiveObstacle = await base44.asServiceRole.entities.PredictiveObstacle.create({
      obstacle_id: obstacle_id || `obs_${Date.now()}`,
      obstacle_type: 'unknown_dynamic',
      current_position: historical_positions?.[historical_positions.length - 1]?.position || { x: 0, y: 0, z: 0 },
      velocity: {
        vx: prediction.behavior_analysis?.average_speed_ms || 0,
        vy: 0,
        vz: 0,
        speed_ms: prediction.behavior_analysis?.average_speed_ms || 0
      },
      predicted_trajectory: prediction.predicted_trajectory || [],
      collision_predictions: prediction.collision_predictions || [],
      behavior_pattern: {
        pattern_type: prediction.behavior_analysis?.pattern_type || 'unknown',
        predictability_score: prediction.behavior_analysis?.predictability_score || 0.5
      },
      last_updated: new Date().toISOString()
    });

    // Generate agent navigation updates if collisions predicted
    const navigationUpdates = (prediction.collision_predictions || [])
      .filter(cp => cp.collision_probability > 0.3)
      .map(cp => ({
        agent_id: cp.agent_id,
        action: cp.recommended_action,
        urgency: cp.action_urgency,
        safe_zone: prediction.safe_zones?.find(sz => sz.safety_duration_ms > cp.estimated_time_ms)
      }));

    return Response.json({
      success: true,
      predictive_obstacle: predictiveObstacle,
      navigation_updates: navigationUpdates,
      high_risk_collisions: prediction.collision_predictions?.filter(cp => cp.collision_probability > 0.7) || [],
      safe_zones: prediction.safe_zones || []
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});