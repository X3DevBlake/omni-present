import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      action_type, // 'move_object', 'rotate_object', 'toggle_device', 'adjust_environment'
      target_id,
      target_type, // 'semantic_object', 'device', 'sensor'
      parameters,
      agent_id // optional - agent to execute the action
    } = await req.json();

    let result = {};

    switch (action_type) {
      case 'move_object': {
        // Get semantic graph and update object position
        const graphs = await base44.asServiceRole.entities.EnvironmentSemanticGraph.list('-created_date', 1);
        if (graphs.length > 0) {
          const graph = graphs[0];
          const nodeIndex = graph.nodes?.findIndex(n => n.node_id === target_id);
          
          if (nodeIndex >= 0) {
            const updatedNodes = [...graph.nodes];
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: {
                x: parameters.new_position?.x ?? updatedNodes[nodeIndex].position?.x,
                y: parameters.new_position?.y ?? updatedNodes[nodeIndex].position?.y,
                z: parameters.new_position?.z ?? updatedNodes[nodeIndex].position?.z
              }
            };

            await base44.asServiceRole.entities.EnvironmentSemanticGraph.update(graph.id, {
              nodes: updatedNodes,
              last_updated: new Date().toISOString()
            });

            result = { success: true, action: 'move_object', object_id: target_id, new_position: parameters.new_position };
          }
        }
        break;
      }

      case 'toggle_device': {
        const devices = await base44.asServiceRole.entities.CrossPlatformDevice.filter({ id: target_id });
        if (devices.length > 0) {
          const device = devices[0];
          const newPowerState = parameters.power !== undefined ? parameters.power : !device.current_state?.power;

          await base44.asServiceRole.entities.CrossPlatformDevice.update(device.id, {
            current_state: {
              ...device.current_state,
              power: newPowerState,
              brightness: parameters.brightness ?? device.current_state?.brightness,
              color_temperature: parameters.color_temperature ?? device.current_state?.color_temperature
            },
            last_interaction: new Date().toISOString()
          });

          result = { success: true, action: 'toggle_device', device_id: target_id, new_state: { power: newPowerState } };
        }
        break;
      }

      case 'adjust_environment': {
        // Create environmental adjustment command
        const adjustment = {
          adjustment_type: parameters.adjustment_type, // 'temperature', 'lighting', 'humidity'
          target_value: parameters.target_value,
          zone_id: parameters.zone_id,
          triggered_by: user.email,
          timestamp: new Date().toISOString()
        };

        // Find related devices and update them
        const relatedDevices = await base44.asServiceRole.entities.CrossPlatformDevice.filter({
          device_category: parameters.adjustment_type === 'temperature' ? 'climate' : 
                          parameters.adjustment_type === 'lighting' ? 'lighting' : 'sensor'
        });

        for (const device of relatedDevices.slice(0, 5)) {
          await base44.asServiceRole.entities.CrossPlatformDevice.update(device.id, {
            current_state: {
              ...device.current_state,
              temperature_target: parameters.adjustment_type === 'temperature' ? parameters.target_value : device.current_state?.temperature_target,
              brightness: parameters.adjustment_type === 'lighting' ? parameters.target_value : device.current_state?.brightness
            }
          });
        }

        // Create proactive assistance record
        await base44.asServiceRole.entities.ProactiveAssistance.create({
          assistance_id: `env_adjust_${Date.now()}`,
          agent_id: agent_id || 'system',
          assistance_type: 'environmental',
          assistance_content: {
            title: 'Environmental Adjustment',
            message: `${parameters.adjustment_type} adjusted to ${parameters.target_value}`,
            severity: 'info',
            recommended_actions: []
          },
          status: 'accepted',
          user_response: {
            accepted: true,
            action_taken: 'adjust_environment',
            responded_at: new Date().toISOString()
          }
        });

        result = { 
          success: true, 
          action: 'adjust_environment', 
          adjustment,
          devices_updated: relatedDevices.length
        };
        break;
      }

      case 'assign_agent_task': {
        // Create a new collaborative task assigned to specific agent
        const task = await base44.asServiceRole.entities.AgentCollaborativeTask.create({
          task_name: parameters.task_name,
          task_description: parameters.task_description,
          initiating_agent_id: agent_id,
          task_status: 'pending',
          priority: parameters.priority || 'medium',
          progress: 0,
          participating_agents: [{
            agent_id: agent_id,
            role: 'primary',
            assigned_subtasks: [parameters.task_name]
          }]
        });

        // Create thought process
        await base44.asServiceRole.entities.AgentThoughtProcess.create({
          thought_id: `thought_task_${Date.now()}`,
          agent_id: agent_id,
          thought_type: 'planning',
          thought_content: {
            main_thought: `Received new task: ${parameters.task_name}`,
            sub_thoughts: ['Analyzing task requirements', 'Planning execution steps'],
            conclusion: 'Ready to execute assigned task'
          },
          visualization_data: {
            display_duration_seconds: 5,
            bubble_style: 'plan',
            color_scheme: 'blue'
          },
          confidence_level: 0.85,
          timestamp: new Date().toISOString()
        });

        result = { success: true, action: 'assign_agent_task', task_id: task.id, agent_id };
        break;
      }

      default:
        return Response.json({ error: 'Unknown action type' }, { status: 400 });
    }

    return Response.json(result);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});