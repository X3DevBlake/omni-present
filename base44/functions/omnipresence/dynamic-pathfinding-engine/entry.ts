import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      agent_id, 
      destination, 
      priority = 'balanced',
      avoid_obstacles = true,
      real_time_adjustment = true 
    } = await req.json();

    // Get agent current state
    const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({ agent_id });
    const agent = agents[0];

    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    const startPos = agent.current_location || { x: 0, y: 0, z: 0 };

    // Get semantic graph for navigation mesh
    const semanticGraphs = await base44.asServiceRole.entities.EnvironmentSemanticGraph.list('-created_date', 1);
    const semanticGraph = semanticGraphs[0];

    // Get all predictive obstacles
    const predictiveObstacles = await base44.asServiceRole.entities.PredictiveObstacle.list('-last_updated', 30);

    // Get static obstacles from semantic graph
    const staticObstacles = (semanticGraph?.nodes || [])
      .filter(node => !node.properties?.movable)
      .map(node => ({
        position: node.position,
        dimensions: node.dimensions,
        type: 'static',
        buffer: 0.3
      }));

    // Combine all obstacles
    const allObstacles = [
      ...staticObstacles,
      ...predictiveObstacles.map(obs => ({
        position: obs.current_position,
        predicted_positions: obs.predicted_trajectory?.map(t => t.position) || [],
        velocity: obs.velocity,
        type: 'dynamic',
        buffer: obs.avoidance_buffer_meters || 0.5,
        predictability: obs.behavior_pattern?.predictability_score || 0.5
      }))
    ];

    // Use AI to calculate optimal path
    const pathfindingPrompt = `Calculate an optimal path for an AI agent with dynamic obstacle avoidance.

Start Position: ${JSON.stringify(startPos)}
Destination: ${JSON.stringify(destination)}
Priority: ${priority}

Static Obstacles:
${JSON.stringify(staticObstacles.map(o => ({ position: o.position, size: o.dimensions })))}

Dynamic Obstacles:
${JSON.stringify(predictiveObstacles.map(o => ({
  current: o.current_position,
  velocity: o.velocity,
  predicted_path: o.predicted_trajectory?.slice(0, 3),
  type: o.obstacle_type,
  buffer: o.avoidance_buffer_meters
})))}

Navigation Waypoints Available:
${JSON.stringify(semanticGraph?.navigation_mesh?.waypoints || [])}

Calculate:
1. Primary path (array of waypoints with timestamps)
2. Alternative routes (at least 2)
3. Predicted obstacle encounters with timing
4. Dynamic adjustment triggers (when to recalculate)
5. Speed recommendations for each segment
6. Safety margins around obstacles
7. Estimated total travel time

Priority modes:
- "fast": Minimize time, accept higher risk
- "safe": Maximum clearance from obstacles
- "balanced": Optimize time and safety
- "energy_efficient": Minimize movement distance`;

    const pathPlan = await base44.integrations.Core.InvokeLLM({
      prompt: pathfindingPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_path: {
            type: "array",
            items: {
              type: "object",
              properties: {
                waypoint: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    z: { type: "number" }
                  }
                },
                eta_seconds: { type: "number" },
                speed_recommendation: { type: "string" },
                safety_margin: { type: "number" },
                notes: { type: "string" }
              }
            }
          },
          alternative_routes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                route_name: { type: "string" },
                waypoints: { type: "array" },
                total_time_seconds: { type: "number" },
                safety_rating: { type: "number" },
                reason_to_use: { type: "string" }
              }
            }
          },
          obstacle_encounters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                obstacle_id: { type: "string" },
                encounter_time_seconds: { type: "number" },
                collision_probability: { type: "number" },
                recommended_action: { type: "string" },
                action_timing: { type: "number" }
              }
            }
          },
          recalculation_triggers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trigger_type: { type: "string" },
                condition: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          estimated_total_time_seconds: { type: "number" },
          path_efficiency_score: { type: "number" },
          safety_score: { type: "number" }
        }
      }
    });

    // Update agent's movement path
    await base44.asServiceRole.entities.AgentPhysicalPresence.update(agent.id, {
      movement_path: pathPlan.primary_path || [],
      current_activity: `Navigating to destination (${pathPlan.estimated_total_time_seconds?.toFixed(0)}s)`
    });

    // Store collision predictions as warnings
    const highRiskEncounters = pathPlan.obstacle_encounters?.filter(e => e.collision_probability > 0.5) || [];
    
    if (highRiskEncounters.length > 0) {
      // Create proactive alerts
      for (const encounter of highRiskEncounters.slice(0, 3)) {
        await base44.asServiceRole.entities.ProactiveAlert.create({
          alert_type: 'collision_risk',
          severity: encounter.collision_probability > 0.7 ? 'high' : 'medium',
          target_entity_type: 'agent',
          target_entity_id: agent_id,
          message: `Potential collision with ${encounter.obstacle_id} in ${encounter.encounter_time_seconds}s`,
          recommended_action: encounter.recommended_action,
          auto_resolve: true,
          trigger_time: new Date(Date.now() + encounter.encounter_time_seconds * 1000).toISOString()
        });
      }
    }

    return Response.json({
      success: true,
      agent_id,
      path_calculated: true,
      primary_path: pathPlan.primary_path,
      alternative_routes: pathPlan.alternative_routes,
      total_waypoints: pathPlan.primary_path?.length || 0,
      estimated_time_seconds: pathPlan.estimated_total_time_seconds,
      efficiency_score: pathPlan.path_efficiency_score,
      safety_score: pathPlan.safety_score,
      high_risk_encounters: highRiskEncounters.length,
      recalculation_triggers: pathPlan.recalculation_triggers,
      path_updated: true
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});