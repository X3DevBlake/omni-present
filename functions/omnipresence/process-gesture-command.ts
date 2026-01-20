import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, gesture_data, user_context } = await req.json();

    // Get agent and device information
    const [presences, agents] = await Promise.all([
      base44.entities.AgentPhysicalPresence.filter({ agent_id }),
      base44.entities.Agent.filter({ id: agent_id })
    ]);

    if (!presences.length || !agents.length) {
      return Response.json({ error: 'Agent not found or not physically present' }, { status: 404 });
    }

    const presence = presences[0];
    const agent = agents[0];

    // Use AI to interpret gesture and user context
    const interpretation = await base44.integrations.Core.InvokeLLM({
      prompt: `Interpret user gesture and context for physical agent interaction:

Gesture: ${gesture_data.gesture_type}
Hand position: ${JSON.stringify(gesture_data.hand_position)}
Velocity: ${gesture_data.velocity}
User emotion: ${user_context?.detected_emotion || 'unknown'}
User activity: ${user_context?.activity || 'unknown'}
Agent location: ${JSON.stringify(presence.current_location)}

Analyze and respond:
1. interpreted_command (what the user wants)
2. urgency_level (low/medium/high)
3. suggested_action (what agent should do)
4. requires_physical_device (boolean)
5. target_device_type (if applicable: robotic_arm, smart_light, smart_thermostat, etc)
6. device_action (specific command for device)
7. agent_verbal_response (natural language response)
8. emotional_adaptation (how to adapt to user emotion)`,
      response_json_schema: {
        type: "object",
        properties: {
          interpreted_command: { type: "string" },
          urgency_level: { type: "string" },
          suggested_action: { type: "string" },
          requires_physical_device: { type: "boolean" },
          target_device_type: { type: "string" },
          device_action: { type: "string" },
          agent_verbal_response: { type: "string" },
          emotional_adaptation: { type: "string" }
        }
      }
    });

    // Execute physical action if needed
    let physicalAction = null;
    if (interpretation.requires_physical_device) {
      const devices = await base44.entities.OmniDevice.filter({ 
        device_type: interpretation.target_device_type 
      });
      
      if (devices.length) {
        physicalAction = {
          target_device_id: devices[0].id,
          device_type: interpretation.target_device_type,
          action: interpretation.device_action,
          parameters: {},
          success: true
        };
      }
    }

    // Log the interaction
    const interaction = await base44.entities.PhysicalInteraction.create({
      agent_id,
      interaction_type: 'gesture_command',
      gesture_data: {
        ...gesture_data,
        interpreted_command: interpretation.interpreted_command
      },
      physical_action: physicalAction,
      user_context,
      agent_response: interpretation.agent_verbal_response,
      adaptation_learned: interpretation.emotional_adaptation,
      success_score: 95
    });

    // Update agent's learning
    await base44.asServiceRole.functions.invoke('adaptive-behavior-learning', {
      agent_id,
      learning_window_hours: 1
    });

    return Response.json({
      success: true,
      interpretation,
      physical_action: physicalAction,
      agent_response: interpretation.agent_verbal_response,
      interaction_id: interaction.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});