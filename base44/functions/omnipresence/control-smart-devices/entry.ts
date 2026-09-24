import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { command_ids, execute_immediately = true } = await req.json();

    // Get commands to execute
    const commands = await Promise.all(
      command_ids.map(id => base44.entities.DeviceCommand.filter({ command_id: id }))
    );
    const validCommands = commands.filter(c => c.length > 0).map(c => c[0]);

    const executionResults = [];

    for (const cmd of validCommands) {
      // Map device types to API calls
      let apiCall = null;

      switch (cmd.device_type) {
        case 'light':
          apiCall = {
            endpoint: '/lights/control',
            provider: cmd.device_api,
            payload: {
              on: cmd.command_type === 'turn_on',
              bri: cmd.parameters?.brightness || 254,
              hue: cmd.parameters?.color,
              sat: 254,
              transitiontime: 10
            }
          };
          break;

        case 'thermostat':
          apiCall = {
            endpoint: '/thermostat/set',
            provider: cmd.device_api,
            payload: {
              temperature: cmd.parameters?.temperature || 72,
              mode: cmd.parameters?.mode || 'heat',
              hold: true
            }
          };
          break;

        case 'lock':
          apiCall = {
            endpoint: '/lock/control',
            provider: cmd.device_api,
            payload: {
              action: cmd.command_type === 'turn_on' ? 'lock' : 'unlock'
            }
          };
          break;

        case 'robotic_arm':
          apiCall = {
            endpoint: '/robot/command',
            provider: cmd.device_api,
            payload: {
              action: cmd.parameters?.action || 'fetch',
              position: cmd.parameters?.position,
              force: cmd.parameters?.force || 50,
              duration_ms: (cmd.parameters?.duration_seconds || 5) * 1000
            }
          };
          break;

        default:
          apiCall = {
            endpoint: '/device/generic',
            provider: 'generic_mqtt',
            payload: cmd.parameters
          };
      }

      // Execute if requested
      let result = {
        command_id: cmd.id,
        device_type: cmd.device_type,
        status: execute_immediately ? 'executing' : 'queued',
        api_call: apiCall
      };

      if (execute_immediately) {
        // Simulate API execution
        result.success = true;
        result.execution_time_ms = Math.random() * 2000 + 100;
        result.device_response = 'OK';
        result.actual_values = apiCall.payload;

        // Update command status
        await base44.entities.DeviceCommand.update(cmd.id, {
          execution_status: 'completed',
          execution_result: {
            success: true,
            device_response: 'OK',
            actual_values: apiCall.payload,
            execution_time_ms: result.execution_time_ms
          }
        });
      } else {
        await base44.entities.DeviceCommand.update(cmd.id, {
          execution_status: 'queued'
        });
      }

      executionResults.push(result);
    }

    return Response.json({
      success: true,
      commands_executed: executionResults.length,
      execution_results: executionResults,
      devices_controlled: validCommands.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});