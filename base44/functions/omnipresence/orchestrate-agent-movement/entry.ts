import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, target_coordinates, interaction_goal } = await req.json();

    // Get agent's current physical presence
    const presences = await base44.entities.AgentPhysicalPresence.filter({ agent_id });
    if (!presences.length) {
      return Response.json({ error: 'Agent not physically deployed' }, { status: 404 });
    }

    const presence = presences[0];

    // Get spatial map and learned behaviors
    const [spatialMaps, detections] = await Promise.all([
      base44.entities.SpatialMap.filter({}).limit(1),
      base44.entities.DynamicObjectDetection.filter({}).limit(100)
    ]);
    const spatialMap = spatialMaps[0];
    
    // Extract learned avoidance rules
    const learnedRules = detections
      .filter(d => d.agent_avoidance_rules?.some(r => r.agent_id === agent_id))
      .map(d => ({
        object_type: d.detected_object?.object_type,
        radius: d.agent_avoidance_rules[0]?.avoidance_radius_meters,
        position: d.detected_object?.position
      }));

    // Use AI for pathfinding with learned behaviors
    const movementPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Calculate optimal movement path for agent using learned behaviors:
      
Current location: ${JSON.stringify(presence.current_location)}
Target: ${target_coordinates ? JSON.stringify(target_coordinates) : 'autonomous'}
Goal: ${interaction_goal || 'patrol'}
Obstacles: ${presence.real_world_obstacles?.length || 0} detected
Learned avoidance rules: ${learnedRules.length} rules
Spatial map zones: ${spatialMap?.designated_zones?.length || 0}

Apply learned behaviors to path planning:
1. waypoints (5 points with x,y,z coordinates, respecting learned avoidance radii)
2. estimated_time_seconds (total journey time)
3. sub_goals (3 intermediate objectives applying learned interaction preferences)
4. interaction_plan (string describing planned interactions using learned patterns)
5. behavior_adaptations (3 ways agent adapted based on learned_behavior data)`,
      response_json_schema: {
        type: "object",
        properties: {
          waypoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                z: { type: "number" }
              }
            }
          },
          estimated_time: { type: "number" },
          sub_goals: {
            type: "array",
            items: { type: "string" }
          },
          interaction_plan: { type: "string" }
        }
      }
    });

    // Update agent presence with new path
    const updated = await base44.entities.AgentPhysicalPresence.update(presence.id, {
      movement_path: movementPlan.waypoints.map((wp, idx) => ({
        waypoint: wp,
        eta_seconds: (idx + 1) * (movementPlan.estimated_time / movementPlan.waypoints.length)
      })),
      current_activity: interaction_goal || 'navigating',
      projection_status: 'transitioning'
    });

    // Log movement initiation
    await base44.entities.RealWorldInteractionLog.create({
      agent_id,
      omni_device_id: presence.omni_device_id,
      interaction_type: 'proximity_trigger',
      interaction_data: {
        raw_sensor_data: `Movement initiated: ${movementPlan.interaction_plan}`
      },
      agent_response: `Moving to ${target_coordinates ? 'target location' : 'patrol area'}`,
      location_at_interaction: presence.current_location,
      interaction_success: true,
      duration_seconds: 0
    });

    return Response.json({
      success: true,
      movement_plan: movementPlan,
      updated_presence: updated,
      waypoints_count: movementPlan.waypoints.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});