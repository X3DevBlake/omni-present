import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, source_device_id, target_device_id, agent_state } = await req.json();

    // Get devices
    const [sourceDevice, targetDevice] = await Promise.all([
      base44.entities.OmniDevice.filter({ id: source_device_id }).limit(1),
      base44.entities.OmniDevice.filter({ id: target_device_id }).limit(1)
    ]);

    if (!sourceDevice.length || !targetDevice.length) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    // Use AI to plan seamless transition
    const transitionPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Plan seamless agent handoff between devices:
      
Source: ${sourceDevice[0].device_name} (${sourceDevice[0].device_type})
Target: ${targetDevice[0].device_name} (${targetDevice[0].device_type})
Agent state: ${JSON.stringify(agent_state).substring(0, 200)}

Generate transition plan:
1. pre_handoff_actions (3 actions to prepare, each with {action, device_id, timing_ms})
2. handoff_sequence (5 steps with {step_name, description, duration_ms})
3. post_handoff_validation (3 checks with {check_name, expected_result})
4. estimated_seamlessness_score (0-100)`,
      response_json_schema: {
        type: "object",
        properties: {
          pre_handoff_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                device_id: { type: "string" },
                timing_ms: { type: "number" }
              }
            }
          },
          handoff_sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_name: { type: "string" },
                description: { type: "string" },
                duration_ms: { type: "number" }
              }
            }
          },
          post_handoff_validation: {
            type: "array",
            items: {
              type: "object",
              properties: {
                check_name: { type: "string" },
                expected_result: { type: "string" }
              }
            }
          },
          seamlessness_score: { type: "number" }
        }
      }
    });

    // Create communication record
    const communication = await base44.entities.DeviceToDeviceCommunication.create({
      source_device_id,
      target_device_id,
      agent_id,
      communication_type: 'agent_handoff',
      transfer_data: {
        agent_state: agent_state || {},
        current_activity: 'transitioning',
        movement_context: {},
        sensor_readings: []
      },
      handoff_status: 'in_progress',
      transition_quality: {
        seamlessness_score: transitionPlan.seamlessness_score,
        projection_continuity: true,
        data_loss_percentage: 0
      },
      latency_ms: 50
    });

    // Update agent presence to new device
    if (presences.length) {
      await base44.entities.AgentPhysicalPresence.update(presences[0].id, {
        omni_device_id: target_device_id,
        projection_status: 'transitioning'
      });
    }

    return Response.json({
      success: true,
      communication,
      transition_plan: transitionPlan,
      estimated_duration_ms: transitionPlan.handoff_sequence.reduce((sum, s) => sum + s.duration_ms, 0)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});