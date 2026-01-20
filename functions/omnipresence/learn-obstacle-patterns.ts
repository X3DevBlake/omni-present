import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spatial_map_id, learning_period_hours } = await req.json();

    const hoursAgo = learning_period_hours || 24;
    const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    // Get historical detections
    const allDetections = await base44.entities.DynamicObjectDetection.filter({
      spatial_map_id
    }).limit(500);

    const recentDetections = allDetections.filter(d => 
      new Date(d.created_date) > new Date(cutoffDate)
    );

    // Use AI to learn patterns
    const learningResults = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze dynamic object patterns for obstacle avoidance learning:
      
Spatial map: ${spatial_map_id}
Time period: ${hoursAgo} hours
Total detections: ${recentDetections.length}
Object types: ${[...new Set(recentDetections.map(d => d.detected_object?.object_type))].join(', ')}

Learn patterns:
1. recurring_objects (5 objects with {type, frequency_score, typical_locations array of {x,y,z}, activity_pattern})
2. high_traffic_zones (3 zones with {zone_name, coordinates, traffic_density, recommended_avoidance_radius})
3. temporal_patterns (3 patterns like {time_of_day, typical_objects, agent_strategy})
4. updated_avoidance_rules (5 rules with {object_type, base_radius_meters, priority, learned_behavior})`,
      response_json_schema: {
        type: "object",
        properties: {
          recurring_objects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                frequency: { type: "number" },
                locations: {
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
                pattern: { type: "string" }
              }
            }
          },
          traffic_zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                coordinates: { type: "object" },
                density: { type: "number" },
                radius: { type: "number" }
              }
            }
          },
          temporal: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string" },
                objects: { type: "array", items: { type: "string" } },
                strategy: { type: "string" }
              }
            }
          },
          rules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                object_type: { type: "string" },
                radius: { type: "number" },
                priority: { type: "string" },
                behavior: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Update detections with learned behaviors
    for (const recurring of learningResults.recurring_objects) {
      const matchingDetections = recentDetections.filter(
        d => d.detected_object?.object_type === recurring.type
      );
      
      for (const detection of matchingDetections.slice(0, 10)) {
        await base44.entities.DynamicObjectDetection.update(detection.id, {
          learned_behavior: {
            typical_locations: recurring.locations,
            activity_patterns: [recurring.pattern],
            interaction_preferences: recurring.pattern
          }
        });
      }
    }

    // Update spatial map with learned zones
    if (spatial_map_id) {
      const maps = await base44.entities.SpatialMap.filter({ id: spatial_map_id });
      if (maps.length) {
        const existingZones = maps[0].designated_zones || [];
        const learnedZones = learningResults.traffic_zones.map(z => ({
          zone_name: z.name,
          zone_type: 'interaction',
          boundaries: [z.coordinates]
        }));
        
        await base44.entities.SpatialMap.update(spatial_map_id, {
          designated_zones: [...existingZones, ...learnedZones]
        });
      }
    }

    return Response.json({
      success: true,
      learning_results: learningResults,
      patterns_identified: learningResults.recurring_objects.length,
      zones_updated: learningResults.traffic_zones.length,
      rules_generated: learningResults.rules.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});