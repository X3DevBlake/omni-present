import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { device_type, custom_specs = {} } = await req.json();

    // Generate AI-powered device blueprint
    const blueprintDesign = await base44.integrations.Core.InvokeLLM({
      prompt: `Design a detailed 3D blueprint for an Omni-Present physical device:

Device Type: ${device_type}
Custom Specifications: ${JSON.stringify(custom_specs)}

Generate comprehensive blueprint with:
1. blueprint_name (creative product name)
2. dimensions (width_cm, height_cm, depth_cm)
3. components (array of 5-8 internal components with names, types, positions, functionalities)
4. connection_ports (power, data, sensor ports with positions)
5. sensors (types like depth, camera, lidar with range and angle)
6. projection_specs (lumens, resolution, field_of_view, hologram_capable)
7. power_requirements (voltage, wattage, battery_life_hours)
8. ai_capabilities (array of 4-6 AI features)
9. installation_zones (recommended room types)
10. interactive_hotspots (array of 4-6 clickable areas with names, positions, actions, tooltips)`,
      response_json_schema: {
        type: "object",
        properties: {
          blueprint_name: { type: "string" },
          dimensions: {
            type: "object",
            properties: {
              width_cm: { type: "number" },
              height_cm: { type: "number" },
              depth_cm: { type: "number" }
            }
          },
          components: {
            type: "array",
            items: {
              type: "object",
              properties: {
                component_name: { type: "string" },
                component_type: { type: "string" },
                position: { type: "object", properties: { x: { type: "number" }, y: { type: "number" }, z: { type: "number" } } },
                functionality: { type: "string" }
              }
            }
          },
          connection_ports: {
            type: "array",
            items: {
              type: "object",
              properties: {
                port_name: { type: "string" },
                port_type: { type: "string" },
                position: { type: "object" }
              }
            }
          },
          sensors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sensor_type: { type: "string" },
                range_meters: { type: "number" },
                angle_degrees: { type: "number" }
              }
            }
          },
          projection_specs: {
            type: "object",
            properties: {
              lumens: { type: "number" },
              resolution: { type: "string" },
              field_of_view: { type: "number" },
              hologram_capable: { type: "boolean" }
            }
          },
          power_requirements: {
            type: "object",
            properties: {
              voltage: { type: "number" },
              wattage: { type: "number" },
              battery_life_hours: { type: "number" }
            }
          },
          ai_capabilities: { type: "array", items: { type: "string" } },
          installation_zones: { type: "array", items: { type: "string" } },
          interactive_hotspots: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hotspot_name: { type: "string" },
                position: { type: "object" },
                action: { type: "string" },
                tooltip: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create blueprint entity
    const blueprint = await base44.entities.DeviceBlueprint.create({
      blueprint_name: blueprintDesign.blueprint_name,
      device_type,
      dimensions: blueprintDesign.dimensions,
      components: blueprintDesign.components,
      connection_ports: blueprintDesign.connection_ports,
      sensors: blueprintDesign.sensors,
      projection_specs: blueprintDesign.projection_specs,
      power_requirements: blueprintDesign.power_requirements,
      ai_capabilities: blueprintDesign.ai_capabilities,
      installation_zones: blueprintDesign.installation_zones,
      auto_rotation_enabled: true,
      interactive_hotspots: blueprintDesign.interactive_hotspots
    });

    return Response.json({
      success: true,
      blueprint,
      design: blueprintDesign
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});