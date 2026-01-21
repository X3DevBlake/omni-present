import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, device_id, command, parameters = {}, protocol } = await req.json();

    if (action === 'discover') {
      // Discover Matter/HomeKit devices
      const discoveredDevices = await base44.integrations.Core.InvokeLLM({
        prompt: `Simulate discovering smart home devices on Matter and HomeKit protocols.
        
Generate 5-8 realistic smart home devices with:
1. device_name (realistic product name)
2. protocol (matter or homekit)
3. device_category (lighting, climate, security, entertainment, appliance, sensor)
4. manufacturer (real brands like Philips, Nanoleaf, Eve, Aqara, etc.)
5. matter_device_type or homekit_accessory_type
6. capabilities array with value ranges
7. current_state with realistic values
8. spatial_location with room and coordinates`,
        response_json_schema: {
          type: "object",
          properties: {
            devices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  device_name: { type: "string" },
                  protocol: { type: "string" },
                  device_category: { type: "string" },
                  manufacturer: { type: "string" },
                  matter_device_type: { type: "string" },
                  capabilities: { type: "array" },
                  current_state: { type: "object" },
                  spatial_location: { type: "object" }
                }
              }
            }
          }
        }
      });

      // Save discovered devices
      for (const device of discoveredDevices.devices) {
        await base44.entities.CrossPlatformDevice.create({
          ...device,
          connection_status: 'online',
          agent_permissions: ['read', 'write', 'control'],
          last_interaction: new Date().toISOString()
        });
      }

      return Response.json({
        success: true,
        discovered: discoveredDevices.devices.length,
        devices: discoveredDevices.devices
      });
    }

    if (action === 'control') {
      // Execute device control command
      const devices = await base44.entities.CrossPlatformDevice.filter({ id: device_id }).limit(1);
      const device = devices[0];

      if (!device) {
        return Response.json({ error: 'Device not found' }, { status: 404 });
      }

      // Simulate protocol-specific command execution
      const executionResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Simulate executing a ${protocol || device.protocol} command on a smart home device:

Device: ${device.device_name}
Category: ${device.device_category}
Command: ${command}
Parameters: ${JSON.stringify(parameters)}
Current State: ${JSON.stringify(device.current_state)}

Generate:
1. new_state (updated device state after command)
2. execution_time_ms (realistic latency)
3. success (boolean)
4. feedback_message (what happened)`,
        response_json_schema: {
          type: "object",
          properties: {
            new_state: { type: "object" },
            execution_time_ms: { type: "number" },
            success: { type: "boolean" },
            feedback_message: { type: "string" }
          }
        }
      });

      // Update device state
      await base44.entities.CrossPlatformDevice.update(device.id, {
        current_state: executionResult.new_state,
        last_interaction: new Date().toISOString()
      });

      return Response.json({
        success: executionResult.success,
        device_id,
        command,
        new_state: executionResult.new_state,
        execution_time_ms: executionResult.execution_time_ms,
        message: executionResult.feedback_message
      });
    }

    if (action === 'scene') {
      // Execute multi-device scene
      const { scene_name, device_ids } = parameters;
      
      const devices = await base44.entities.CrossPlatformDevice.filter({}).limit(50);
      const targetDevices = device_ids ? devices.filter(d => device_ids.includes(d.id)) : devices;

      const sceneExecution = await base44.integrations.Core.InvokeLLM({
        prompt: `Create and execute a smart home scene called "${scene_name}" across these devices:

${targetDevices.map(d => `- ${d.device_name} (${d.device_category}, ${d.protocol})`).join('\n')}

Generate:
1. scene_description (what the scene does)
2. device_commands array (device_id, command, parameters for each)
3. total_execution_time_ms
4. atmosphere_created (description of resulting environment)`,
        response_json_schema: {
          type: "object",
          properties: {
            scene_description: { type: "string" },
            device_commands: {
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
            total_execution_time_ms: { type: "number" },
            atmosphere_created: { type: "string" }
          }
        }
      });

      return Response.json({
        success: true,
        scene_name,
        ...sceneExecution
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});