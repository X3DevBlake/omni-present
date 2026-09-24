import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { omni_device_id, sensor_data, spatial_map_id } = await req.json();

    // Use AI to detect and classify objects
    const detection = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze sensor data for dynamic object detection:
      
Device: ${omni_device_id}
Sensor type: ${sensor_data.type}
Data summary: ${JSON.stringify(sensor_data).substring(0, 300)}

Detect and identify dynamic objects:
1. objects (up to 5 detected objects with {type, label, confidence 0-1, x, y, z position, vx, vy, vz velocity, width, height, depth})
2. tracking_recommendations (for each object: new/tracking/lost/stationary)
3. predicted_paths (for moving objects, 3 future positions with timestamp and x,y,z)
4. avoidance_rules (suggested agent avoidance radius in meters and priority level)`,
      response_json_schema: {
        type: "object",
        properties: {
          objects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                label: { type: "string" },
                confidence: { type: "number" },
                x: { type: "number" },
                y: { type: "number" },
                z: { type: "number" },
                vx: { type: "number" },
                vy: { type: "number" },
                vz: { type: "number" },
                width: { type: "number" },
                height: { type: "number" },
                depth: { type: "number" }
              }
            }
          },
          tracking: { type: "array", items: { type: "string" } },
          paths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                object_idx: { type: "number" },
                positions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp: { type: "string" },
                      x: { type: "number" },
                      y: { type: "number" },
                      z: { type: "number" }
                    }
                  }
                }
              }
            }
          },
          avoidance: {
            type: "array",
            items: {
              type: "object",
              properties: {
                radius: { type: "number" },
                priority: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create detection records
    const detections = [];
    for (let i = 0; i < detection.objects.length; i++) {
      const obj = detection.objects[i];
      const created = await base44.entities.DynamicObjectDetection.create({
        detection_id: `DET_${Date.now()}_${i}`,
        omni_device_id,
        spatial_map_id,
        detected_object: {
          object_type: obj.type,
          object_label: obj.label,
          confidence: obj.confidence,
          position: { x: obj.x, y: obj.y, z: obj.z },
          velocity: { vx: obj.vx || 0, vy: obj.vy || 0, vz: obj.vz || 0 },
          bounding_box: { width: obj.width, height: obj.height, depth: obj.depth }
        },
        tracking_status: detection.tracking[i] || 'new',
        predicted_path: detection.paths.find(p => p.object_idx === i)?.positions || [],
        agent_avoidance_rules: [{
          agent_id: 'all',
          avoidance_radius_meters: detection.avoidance[i]?.radius || 1.0,
          priority: detection.avoidance[i]?.priority || 'medium'
        }],
        learned_behavior: {
          typical_locations: [],
          activity_patterns: [],
          interaction_preferences: 'neutral'
        }
      });
      detections.push(created);
    }

    // Update spatial map with dynamic tags
    if (spatial_map_id) {
      const maps = await base44.entities.SpatialMap.filter({ id: spatial_map_id });
      if (maps.length) {
        const existingTags = maps[0].dynamic_object_tags || [];
        const newTags = detection.objects.map(o => o.label);
        await base44.entities.SpatialMap.update(spatial_map_id, {
          dynamic_object_tags: [...new Set([...existingTags, ...newTags])]
        });
      }
    }

    return Response.json({
      success: true,
      detections,
      objects_detected: detection.objects.length,
      moving_objects: detection.objects.filter((_, i) => detection.tracking[i] === 'tracking').length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});