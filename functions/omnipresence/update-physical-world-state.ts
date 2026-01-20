import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { omni_device_id, sensor_data } = await req.json();

    // Get active agents on this device
    const activePresences = await base44.entities.AgentPhysicalPresence.filter({
      omni_device_id,
      projection_status: 'active'
    });

    // Use AI to analyze sensor data
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze sensor data from Omni device:
      
Sensor type: ${sensor_data.type}
Data summary: ${JSON.stringify(sensor_data).substring(0, 500)}
Active agents: ${activePresences.length}

Identify:
1. detected_objects (array of {type, position {x,y,z}, confidence})
2. environmental_changes (array of {change_type, description})
3. user_intent (string, if audio/gesture detected)
4. recommended_agent_actions (array of {agent_id, action, reason})`,
      response_json_schema: {
        type: "object",
        properties: {
          detected_objects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                position: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    z: { type: "number" }
                  }
                },
                confidence: { type: "number" }
              }
            }
          },
          environmental_changes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                change_type: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          user_intent: { type: "string" },
          recommended_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                action: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Update agent presences with new obstacles
    const updates = [];
    for (const presence of activePresences) {
      const updated = await base44.entities.AgentPhysicalPresence.update(presence.id, {
        real_world_obstacles: analysis.detected_objects.map(obj => ({
          obstacle_type: obj.type,
          position: obj.position
        })),
        last_interaction_timestamp: new Date().toISOString()
      });
      updates.push(updated);
    }

    // Log interaction if user intent detected
    if (analysis.user_intent) {
      await base44.entities.RealWorldInteractionLog.create({
        agent_id: activePresences[0]?.agent_id || 'system',
        omni_device_id,
        interaction_type: sensor_data.type === 'audio' ? 'voice_command' : 'gesture_detection',
        interaction_data: {
          transcribed_speech: sensor_data.type === 'audio' ? sensor_data.text : undefined,
          raw_sensor_data: JSON.stringify(sensor_data)
        },
        agent_response: analysis.user_intent,
        location_at_interaction: { x: 0, y: 0, z: 0, room: 'unknown' },
        sentiment_analysis: {
          sentiment: 'neutral',
          confidence: 0.7
        },
        interaction_success: true,
        duration_seconds: 2
      });
    }

    return Response.json({
      success: true,
      analysis,
      presences_updated: updates.length,
      detected_objects_count: analysis.detected_objects.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});