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

    // Get nearby devices for shadow projection
    const allDevices = await base44.entities.OmniDevice.filter({ online_status: true });
    const nearbyDevices = allDevices.filter(d => 
      d.id !== source_device_id && d.id !== target_device_id
    ).slice(0, 3);

    // Use AI to plan seamless transition with shadow projections
    const transitionPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Plan seamless agent handoff with proactive shadow projections:
      
Source: ${sourceDevice[0].device_name} (${sourceDevice[0].device_type})
Target: ${targetDevice[0].device_name} (${targetDevice[0].device_type})
Nearby devices: ${nearbyDevices.map(d => d.device_name).join(', ')}
Agent state: ${JSON.stringify(agent_state).substring(0, 200)}

Generate advanced transition plan:
1. shadow_projection_plan ({target_device_id, shadow_start_time_ms (when to start shadow before full handoff), shadow_intensity (0-1), fade_in_duration_ms})
2. pre_handoff_actions (3 actions to prepare, each with {action, device_id, timing_ms})
3. handoff_sequence (7 steps including shadow activation with {step_name, description, duration_ms, devices_involved array})
4. post_handoff_validation (3 checks with {check_name, expected_result})
5. estimated_seamlessness_score (0-100)
6. multi_device_presence (array of {device_id, projection_type (full/partial/shadow), start_time_offset_ms})`,
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

    // Create shadow projection on target device
    if (transitionPlan.shadow_projection_plan) {
      await base44.entities.MultiDeviceProjection.create({
        projection_session_id: `SHADOW_${Date.now()}`,
        agent_id,
        active_devices: [
          {
            device_id: source_device_id,
            projection_portion: 'full',
            quality_level: 'high',
            resource_allocation: 80
          },
          {
            device_id: target_device_id,
            projection_portion: 'shadow',
            quality_level: 'medium',
            resource_allocation: 20
          }
        ],
        optimization_strategy: 'quality_priority',
        seamless_transition_enabled: true,
        ai_optimization_metrics: {
          device_utilization_balance: transitionPlan.estimated_seamlessness_score,
          total_power_consumption_watts: 150,
          projection_consistency_score: 98
        }
      });
    }

    // Update agent presence to new device
    const presences = await base44.entities.AgentPhysicalPresence.filter({ agent_id });
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
      shadow_projection: transitionPlan.shadow_projection_plan,
      estimated_duration_ms: transitionPlan.handoff_sequence.reduce((sum, s) => sum + s.duration_ms, 0),
      multi_device_active: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});