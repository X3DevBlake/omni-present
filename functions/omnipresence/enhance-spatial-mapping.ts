import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spatial_map_id, scan_type = 'comprehensive' } = await req.json();

    // Get existing map data
    const [spatialMaps, detections, presences] = await Promise.all([
      base44.entities.SpatialMap.filter({ id: spatial_map_id }).limit(1),
      base44.entities.DynamicObjectDetection.filter({}).limit(200),
      base44.entities.AgentPhysicalPresence.filter({}).limit(50)
    ]);

    const spatialMap = spatialMaps[0];

    // Analyze environment with AI
    const environmentAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze and enhance spatial mapping for AI agent navigation:

Current Map: ${spatialMap?.map_name || 'Unknown'}
Dimensions: ${JSON.stringify(spatialMap?.spatial_data?.dimensions || {})}
Existing Zones: ${spatialMap?.designated_zones?.length || 0}
Static Obstacles: ${spatialMap?.static_obstacles?.length || 0}
Dynamic Objects Detected: ${detections.length}
Active Agents: ${presences.length}

Generate enhanced spatial mapping:
1. recommended_zones (new zones to create)
2. obstacle_avoidance_rules (dynamic avoidance patterns)
3. optimal_navigation_paths (agent movement corridors)
4. interaction_hotspots (where agents should focus)
5. safety_boundaries (no-go areas)
6. collaboration_zones (multi-agent coordination areas)
7. environmental_hazards (detected risks)
8. real_time_updates (suggested sensor placements)`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                zone_name: { type: "string" },
                zone_type: { type: "string" },
                purpose: { type: "string" }
              }
            }
          },
          obstacle_avoidance_rules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                obstacle_type: { type: "string" },
                avoidance_radius: { type: "number" },
                priority: { type: "string" }
              }
            }
          },
          optimal_navigation_paths: { type: "array", items: { type: "string" } },
          interaction_hotspots: { type: "array", items: { type: "string" } },
          safety_boundaries: { type: "array", items: { type: "string" } },
          collaboration_zones: { type: "array", items: { type: "string" } },
          environmental_hazards: { type: "array", items: { type: "string" } },
          real_time_updates: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Update spatial map with new zones
    if (spatialMap) {
      const newZones = environmentAnalysis.recommended_zones.map((zone, idx) => ({
        zone_name: zone.zone_name,
        zone_type: zone.zone_type === 'safety' ? 'no_go' : zone.zone_type === 'interaction' ? 'interaction' : 'safe',
        boundaries: [
          { x: idx * 2, y: 0, z: idx * 2 },
          { x: idx * 2 + 2, y: 0, z: idx * 2 + 2 }
        ]
      }));

      await base44.entities.SpatialMap.update(spatialMap.id, {
        designated_zones: [...(spatialMap.designated_zones || []), ...newZones],
        dynamic_object_tags: [...new Set([
          ...(spatialMap.dynamic_object_tags || []),
          ...detections.map(d => d.detected_object?.object_type).filter(Boolean)
        ])],
        last_scan_date: new Date().toISOString()
      });
    }

    // Update detection avoidance rules
    for (const detection of detections.slice(0, 20)) {
      const matchingRule = environmentAnalysis.obstacle_avoidance_rules.find(
        r => r.obstacle_type === detection.detected_object?.object_type
      );
      if (matchingRule) {
        await base44.entities.DynamicObjectDetection.update(detection.id, {
          agent_avoidance_rules: [
            ...(detection.agent_avoidance_rules || []),
            {
              agent_id: presences[0]?.agent_id || 'all',
              avoidance_radius_meters: matchingRule.avoidance_radius,
              priority: matchingRule.priority
            }
          ]
        });
      }
    }

    return Response.json({
      success: true,
      spatial_map_id,
      environment_analysis: environmentAnalysis,
      updates: {
        zones_added: environmentAnalysis.recommended_zones.length,
        avoidance_rules_applied: environmentAnalysis.obstacle_avoidance_rules.length,
        detections_updated: Math.min(detections.length, 20)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});