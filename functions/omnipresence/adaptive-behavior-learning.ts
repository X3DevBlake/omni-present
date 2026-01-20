import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, learning_window_hours } = await req.json();

    const hoursAgo = learning_window_hours || 48;
    const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    // Get agent's interaction history
    const allInteractions = await base44.entities.RealWorldInteractionLog.filter({ agent_id }).limit(500);
    const recentInteractions = allInteractions.filter(i => new Date(i.created_date) > new Date(cutoffDate));

    // Get dynamic object detections
    const detections = await base44.entities.DynamicObjectDetection.filter({}).limit(300);

    // Use AI to learn behavioral patterns
    const learningResults = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze agent interactions to learn adaptive behaviors:
      
Agent: ${agent_id}
Total interactions: ${recentInteractions.length}
Successful: ${recentInteractions.filter(i => i.interaction_success).length}
Object detections: ${detections.length}

Learn patterns and generate updates:
1. interaction_patterns (5 patterns with {pattern_name, frequency, success_rate, optimal_response})
2. location_preferences (3 locations with {room, x, y, z, visit_count, typical_activity})
3. object_interaction_strategies (5 strategies with {object_type, approach_behavior, avoidance_radius, interaction_preference})
4. temporal_behavior (3 time-based behaviors like {time_range, preferred_activity, energy_level})
5. learned_avoidance_rules (5 rules with {object_type, dynamic_radius, priority, learned_reason})`,
      response_json_schema: {
        type: "object",
        properties: {
          patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                frequency: { type: "number" },
                success_rate: { type: "number" },
                response: { type: "string" }
              }
            }
          },
          locations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                room: { type: "string" },
                x: { type: "number" },
                y: { type: "number" },
                z: { type: "number" },
                visits: { type: "number" },
                activity: { type: "string" }
              }
            }
          },
          strategies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                object_type: { type: "string" },
                behavior: { type: "string" },
                radius: { type: "number" },
                preference: { type: "string" }
              }
            }
          },
          temporal: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time_range: { type: "string" },
                activity: { type: "string" },
                energy: { type: "number" }
              }
            }
          },
          avoidance_rules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                object_type: { type: "string" },
                radius: { type: "number" },
                priority: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Update dynamic object detections with learned behaviors
    for (const strategy of learningResults.strategies) {
      const matchingDetections = detections.filter(
        d => d.detected_object?.object_type === strategy.object_type
      );
      
      for (const detection of matchingDetections.slice(0, 20)) {
        await base44.entities.DynamicObjectDetection.update(detection.id, {
          learned_behavior: {
            typical_locations: learningResults.locations.map(l => ({ x: l.x, y: l.y, z: l.z })),
            activity_patterns: learningResults.patterns.map(p => p.name),
            interaction_preferences: strategy.preference
          },
          agent_avoidance_rules: [{
            agent_id,
            avoidance_radius_meters: strategy.radius,
            priority: learningResults.avoidance_rules.find(r => r.object_type === strategy.object_type)?.priority || 'medium'
          }]
        });
      }
    }

    // Update agent's physical presence with learned preferences
    const presences = await base44.entities.AgentPhysicalPresence.filter({ agent_id });
    if (presences.length) {
      await base44.entities.AgentPhysicalPresence.update(presences[0].id, {
        current_activity: `Learned: ${learningResults.patterns[0]?.name || 'adapting'}`,
        interaction_zone_radius: Math.max(...learningResults.strategies.map(s => s.radius))
      });
    }

    return Response.json({
      success: true,
      learning_results: learningResults,
      patterns_learned: learningResults.patterns.length,
      locations_identified: learningResults.locations.length,
      strategies_developed: learningResults.strategies.length,
      detections_updated: matchingDetections.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});