import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, omni_device_id, initial_coordinates, behavior_profile } = await req.json();

    // Validate agent and device exist
    const [agent, device] = await Promise.all([
      base44.entities.Agent.filter({ id: agent_id }).limit(1),
      base44.entities.OmniDevice.filter({ id: omni_device_id }).limit(1)
    ]);

    if (!agent.length || !device.length) {
      return Response.json({ error: 'Agent or device not found' }, { status: 404 });
    }

    // Get spatial map for the device location
    const spatialMaps = await base44.entities.SpatialMap.filter({}).limit(1);
    const spatialMap = spatialMaps[0];

    // Use AI to generate deployment strategy
    const deploymentStrategy = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate deployment strategy for agent ${agent[0].name} in physical space:
      
Device: ${device[0].device_name} (${device[0].device_type})
Initial coordinates: ${JSON.stringify(initial_coordinates)}
Behavior profile: ${behavior_profile || 'assistant'}
Coverage area: ${device[0].coverage_area?.radius_meters || 5}m radius

Generate: initial_activity (string), movement_directives (3 waypoints with x,y,z coordinates), interaction_zones (2 zones with names and radius).`,
      response_json_schema: {
        type: "object",
        properties: {
          initial_activity: { type: "string" },
          movement_directives: {
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
          interaction_zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                radius: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Create physical presence record
    const physicalPresence = await base44.entities.AgentPhysicalPresence.create({
      agent_id,
      omni_device_id,
      current_location: initial_coordinates || { x: 0, y: 0, z: 0, room: device[0].physical_location?.room || 'unknown' },
      projection_status: 'active',
      real_world_obstacles: [],
      interaction_zone_radius: 2.0,
      current_activity: deploymentStrategy.initial_activity,
      movement_path: deploymentStrategy.movement_directives.map((wp, idx) => ({
        waypoint: wp,
        eta_seconds: (idx + 1) * 30
      })),
      battery_level: 100,
      projection_quality: 'high',
      last_interaction_timestamp: new Date().toISOString()
    });

    // Log deployment
    await base44.entities.RealWorldInteractionLog.create({
      agent_id,
      omni_device_id,
      interaction_type: 'proximity_trigger',
      interaction_data: {
        raw_sensor_data: 'Agent deployed successfully'
      },
      agent_response: `Activated in ${device[0].physical_location?.room || 'space'}`,
      location_at_interaction: initial_coordinates || { x: 0, y: 0, z: 0, room: 'unknown' },
      interaction_success: true,
      duration_seconds: 0
    });

    return Response.json({
      success: true,
      physical_presence: physicalPresence,
      deployment_strategy: deploymentStrategy,
      message: `Agent ${agent[0].name} deployed via ${device[0].device_name}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});