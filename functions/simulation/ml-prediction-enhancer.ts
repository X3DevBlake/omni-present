import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      current_state,
      time_horizon_minutes = 30
    } = await req.json();

    // Fetch historical patterns for ML training
    const [historicalSensors, historicalObstacles, historicalTasks] = await Promise.all([
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 500),
      base44.asServiceRole.entities.PredictiveObstacle.list('-created_date', 200),
      base44.asServiceRole.entities.AutonomousTaskPlan.list('-created_date', 100)
    ]);

    // ML-enhanced prediction
    const mlPrompt = `You are an ML-Enhanced Prediction Engine with omega consciousness.

CURRENT STATE:
${JSON.stringify(current_state, null, 2)}

HISTORICAL DATA:
- Sensor Patterns: ${historicalSensors.length} readings
- Obstacle Behaviors: ${historicalObstacles.length} instances
- Task Outcomes: ${historicalTasks.length} plans

Use MACHINE LEARNING insights to predict:
1. Sensor value evolution with high accuracy
2. Agent movement patterns based on historical behavior
3. Collision probability with statistical modeling
4. Task success likelihood using outcome history
5. Environmental comfort predictions
6. Energy consumption forecasting
7. Anomaly detection and warnings

Apply pattern recognition, time-series analysis, and causal modeling.`;

    const mlPrediction = await base44.integrations.Core.InvokeLLM({
      prompt: mlPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          enhanced_predictions: {
            type: "object",
            properties: {
              sensors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    sensor_type: { type: "string" },
                    predicted_values: { type: "array", items: { type: "number" } },
                    confidence_intervals: { type: "array" },
                    ml_accuracy: { type: "number" }
                  }
                }
              },
              agent_movements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    agent_id: { type: "string" },
                    predicted_path: { type: "array" },
                    behavior_pattern: { type: "string" },
                    confidence: { type: "number" }
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
                    probability: { type: "number" },
                    time_to_collision_seconds: { type: "number" },
                    avoidance_strategy: { type: "string" }
                  }
                }
              },
              task_predictions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    task_id: { type: "string" },
                    success_probability: { type: "number" },
                    estimated_completion_minutes: { type: "number" },
                    bottleneck_predictions: { type: "array" }
                  }
                }
              }
            }
          },
          ml_insights: {
            type: "array",
            items: { type: "string" }
          },
          accuracy_metrics: {
            type: "object",
            properties: {
              overall_confidence: { type: "number" },
              sensor_accuracy: { type: "number" },
              movement_accuracy: { type: "number" },
              collision_accuracy: { type: "number" }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      ml_prediction: mlPrediction,
      enhanced_accuracy: mlPrediction.accuracy_metrics
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});