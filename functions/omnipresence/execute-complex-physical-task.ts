import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, task_type, task_parameters, user_context } = await req.json();

    // Get smart devices
    const smartDevices = await base44.entities.SmartDeviceIntegration.filter({}).limit(50);

    // Use AI to plan complex physical task
    const taskPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Plan complex physical task execution for AI agent:

Task Type: ${task_type}
Parameters: ${JSON.stringify(task_parameters)}
User Context: ${JSON.stringify(user_context || {})}
Available Devices: ${smartDevices.map(d => `${d.device_name} (${d.device_type} - ${d.api_provider})`).join(', ')}

Create execution plan for tasks like:
- fetch_object: Use robotic arm to retrieve items
- adjust_room_settings: Modify lights, temperature, locks
- guide_user_physically: Use lights/sounds to guide user

Generate:
1. task_steps (detailed sequential steps)
2. device_commands (specific API commands per device)
3. safety_checks (verification steps)
4. feedback_points (where to check success)
5. fallback_actions (if steps fail)
6. estimated_duration_seconds`,
      response_json_schema: {
        type: "object",
        properties: {
          task_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_number: { type: "number" },
                action: { type: "string" },
                device_type: { type: "string" },
                parameters: { type: "object" }
              }
            }
          },
          device_commands: {
            type: "array",
            items: {
              type: "object",
              properties: {
                device_type: { type: "string" },
                api_provider: { type: "string" },
                command: { type: "string" },
                payload: { type: "object" }
              }
            }
          },
          safety_checks: { type: "array", items: { type: "string" } },
          feedback_points: { type: "array", items: { type: "string" } },
          fallback_actions: { type: "array", items: { type: "string" } },
          estimated_duration_seconds: { type: "number" }
        }
      }
    });

    // Create device commands
    const createdCommands = [];
    for (const cmd of taskPlan.device_commands) {
      const targetDevice = smartDevices.find(d => d.device_type === cmd.device_type);
      if (targetDevice) {
        const command = await base44.entities.DeviceCommand.create({
          command_id: `complex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          agent_id,
          target_device_id: targetDevice.id,
          device_type: cmd.device_type,
          device_api: cmd.api_provider || targetDevice.api_provider,
          command_type: cmd.command,
          parameters: cmd.payload,
          intent_from_agent: `${task_type}: ${cmd.command}`,
          intent_context: user_context,
          execution_status: 'pending'
        });
        createdCommands.push(command);
      }
    }

    // Execute commands
    if (createdCommands.length > 0) {
      await base44.functions.invoke('control-smart-devices', {
        command_ids: createdCommands.map(c => c.command_id),
        execute_immediately: true
      });
    }

    // Log the physical interaction
    await base44.entities.PhysicalInteraction.create({
      agent_id,
      interaction_type: 'object_manipulation',
      physical_action: {
        target_device_id: createdCommands[0]?.target_device_id,
        device_type: task_type,
        action: task_type,
        parameters: task_parameters,
        success: true
      },
      user_context,
      agent_response: `Executed ${task_type} with ${createdCommands.length} device commands`,
      success_score: 90
    });

    return Response.json({
      success: true,
      task_type,
      execution_plan: taskPlan,
      commands_created: createdCommands.length,
      commands: createdCommands,
      estimated_duration: taskPlan.estimated_duration_seconds
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});