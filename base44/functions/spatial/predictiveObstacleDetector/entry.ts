import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { environment_id, time_horizon_seconds = 10 } = await req.json();

    // Fetch current semantic graph for the environment
    const graphNodes = await base44.entities.EnvironmentSemanticGraph.filter({
      node_type: "dynamic_object"
    });

    const predictions = [];

    for (const node of graphNodes) {
      if (node.dynamic_state?.is_moving) {
        // Predict future trajectory using velocity
        const trajectory = [];
        const vel = node.dynamic_state.velocity_vector;
        const pos = node.spatial_coordinates;
        
        for (let t = 1; t <= time_horizon_seconds; t++) {
          trajectory.push({
            timestamp: new Date(Date.now() + t * 1000).toISOString(),
            position: {
              x: pos.x + vel.x * t,
              y: pos.y + vel.y * t,
              z: pos.z + vel.z * t
            },
            uncertainty_radius: t * 0.5 // Uncertainty grows with time
          });
        }

        // Use AI to assess impact
        const impactPrompt = `Assess the collision risk and impact severity:
        
Object type: ${node.node_type}
Current velocity: ${JSON.stringify(vel)}
Predicted path intersects with: [query other objects in scene]

Return impact_score (0-10) and affected_agents list.`;

        const impactAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: impactPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              impact_score: { type: "number" },
              affected_agents: { type: "array" }
            }
          }
        });

        // Generate avoidance strategies
        const avoidanceStrategies = [
          {
            strategy_name: "decelerate",
            alternative_path: [],
            cost_estimate: 2.0
          },
          {
            strategy_name: "route_around",
            alternative_path: trajectory.map(t => ({
              ...t.position,
              x: t.position.x + 2 // Simple lateral shift
            })),
            cost_estimate: 3.5
          }
        ];

        const obstacle = await base44.asServiceRole.entities.PredictiveObstacle.create({
          obstacle_id: `obstacle_${node.node_id}_${Date.now()}`,
          environment_id: environment_id || "default",
          current_position: pos,
          predicted_trajectory: trajectory,
          confidence: 0.85,
          impact_score: impactAnalysis.impact_score || 5,
          affected_agents: impactAnalysis.affected_agents || [],
          avoidance_strategies: avoidanceStrategies,
          prediction_model_used: "velocity_extrapolation_v1"
        });

        predictions.push(obstacle);
      }
    }

    return Response.json({
      success: true,
      predicted_obstacles: predictions,
      time_horizon_seconds,
      high_risk_count: predictions.filter(p => p.impact_score > 7).length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});