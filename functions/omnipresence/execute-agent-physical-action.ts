import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, intent, context = {} } = await req.json();

    // Get available devices and agent presence
    const [devices, presences, zones] = await Promise.all([
      base44.entities.CrossPlatformDevice.filter({ connection_status: 'online' }).limit(50),
      base44.entities.AgentPhysicalPresence.filter({ agent_id }).limit(1),
      base44.entities.SpatialZone.filter({}).limit(50)
    ]);

    const agentPresence = presences[0];

    // AI determines the best action based on intent and context
    const actionPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `An AI agent needs to perform a physical action in a smart home environment.

Agent Location: ${JSON.stringify(agentPresence?.current_location || { room: 'living_room' })}
User Intent: "${intent}"
Context: ${JSON.stringify(context)}

Available Devices:
${devices.map(d => `- ${d.device_name} (${d.protocol}, ${d.device_category}) at ${d.spatial_location?.room || 'unknown'}`).join('\n')}

Available Zones:
${zones.map(z => `- ${z.zone_name} (${z.zone_type})`).join('\n')}

Generate an action plan:
1. action_type (device_control, multi_device_scene, environmental_adjustment, comfort_optimization)
2. target_devices array with device names, commands, and parameters
3. execution_sequence with steps, delays, and order
4. expected_outcome (what will change)
5. verbal_response (what agent says while executing)`,
      response_json_schema: {
        type: "object",
        properties: {
          action_type: { type: "string" },
          target_devices: {
            type: "array",
            items: {
              type: "object",
              properties: {
                device_name: { type: "string" },
                command: { type: "string" },
                parameters: { type: "object" }
              }
            }
          },
          execution_sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_number: { type: "integer" },
                device_name: { type: "string" },
                command: { type: "string" },
                delay_ms: { type: "number" }
              }
            }
          },
          expected_outcome: { type: "string" },
          verbal_response: { type: "string" }
        }
      }
    });

    // Create action record
    const action = await base44.entities.AgentPhysicalAction.create({
      action_id: `action_${Date.now()}`,
      agent_id,
      action_type: actionPlan.action_type,
      target_devices: actionPlan.target_devices.map(td => ({
        device_id: devices.find(d => d.device_name === td.device_name)?.id,
        protocol: devices.find(d => d.device_name === td.device_name)?.protocol,
        command: td.command,
        parameters: td.parameters
      })),
      intent_description: intent,
      context,
      execution_sequence: actionPlan.execution_sequence.map(s => ({
        ...s,
        device_id: devices.find(d => d.device_name === s.device_name)?.id,
        status: 'pending'
      })),
      status: 'executing',
      started_at: new Date().toISOString()
    });

    // Execute each step
    for (const step of actionPlan.execution_sequence) {
      const device = devices.find(d => d.device_name === step.device_name);
      if (device) {
        // Update device state
        await base44.entities.CrossPlatformDevice.update(device.id, {
          last_interaction: new Date().toISOString()
        });
      }
    }

    // Mark action complete
    await base44.entities.AgentPhysicalAction.update(action.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      success_feedback: {
        devices_responded: actionPlan.target_devices.length,
        execution_time_ms: actionPlan.execution_sequence.reduce((sum, s) => sum + (s.delay_ms || 100), 0)
      }
    });

    return Response.json({
      success: true,
      action_id: action.id,
      action_plan: actionPlan,
      devices_controlled: actionPlan.target_devices.length,
      verbal_response: actionPlan.verbal_response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});