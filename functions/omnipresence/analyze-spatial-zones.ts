import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spatial_map_id } = await req.json();

    // Get existing data
    const [spatialMaps, detections, presences, devices, interactions] = await Promise.all([
      base44.entities.SpatialMap.filter({ id: spatial_map_id }).limit(1),
      base44.entities.DynamicObjectDetection.filter({}).limit(200),
      base44.entities.AgentPhysicalPresence.filter({}).limit(50),
      base44.entities.SmartDeviceIntegration.filter({}).limit(50),
      base44.entities.RealWorldInteractionLog.filter({}).limit(100)
    ]);

    const spatialMap = spatialMaps[0];

    // AI-powered zone analysis
    const zoneAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze spatial environment and generate intelligent zone recommendations:

Spatial Map: ${spatialMap?.map_name || 'Living Space'}
Dimensions: ${JSON.stringify(spatialMap?.spatial_data?.dimensions || { width: 10, length: 8, height: 3 })}
Detected Objects: ${detections.length}
Active Agents: ${presences.length}
Smart Devices: ${devices.length}
Recent Interactions: ${interactions.length}

Generate 6-8 spatial zones with:
1. zone_name (descriptive name)
2. zone_type (interaction, projection, navigation, restricted, charging, collaboration, sensor_coverage)
3. boundaries (min/max x,y,z coordinates within room dimensions)
4. purpose (why this zone exists)
5. environmental_settings (lighting_preset, temperature_target)
6. recommended_devices (array of device types)
7. activity_heat_score (0-100 based on likely usage)
8. obstacle_avoidance_rules (buffer distances for different obstacles)
9. color_code (hex color for visualization)`,
      response_json_schema: {
        type: "object",
        properties: {
          zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                zone_name: { type: "string" },
                zone_type: { type: "string" },
                boundaries: {
                  type: "object",
                  properties: {
                    min_x: { type: "number" },
                    max_x: { type: "number" },
                    min_y: { type: "number" },
                    max_y: { type: "number" },
                    min_z: { type: "number" },
                    max_z: { type: "number" }
                  }
                },
                purpose: { type: "string" },
                environmental_settings: {
                  type: "object",
                  properties: {
                    lighting_preset: { type: "string" },
                    temperature_target: { type: "number" }
                  }
                },
                recommended_devices: { type: "array", items: { type: "string" } },
                activity_heat_score: { type: "number" },
                obstacle_avoidance_rules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      obstacle_type: { type: "string" },
                      buffer_meters: { type: "number" }
                    }
                  }
                },
                color_code: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create zone entities
    const createdZones = [];
    for (const zone of zoneAnalysis.zones) {
      const created = await base44.entities.SpatialZone.create({
        zone_name: zone.zone_name,
        zone_type: zone.zone_type,
        spatial_map_id,
        boundaries: zone.boundaries,
        assigned_devices: [],
        assigned_agents: presences.map(p => p.agent_id),
        environmental_settings: zone.environmental_settings,
        activity_heat_score: zone.activity_heat_score,
        obstacle_avoidance_rules: zone.obstacle_avoidance_rules,
        real_time_occupancy: 0,
        color_code: zone.color_code
      });
      createdZones.push(created);
    }

    return Response.json({
      success: true,
      zones_created: createdZones.length,
      zones: createdZones,
      analysis: zoneAnalysis
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});