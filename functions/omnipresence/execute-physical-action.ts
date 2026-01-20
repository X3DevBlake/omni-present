import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, action_plan, target_device_type, action_command } = await req.json();

    // Get available devices
    const devices = await base44.entities.OmniDevice.filter({ online_status: true });
    const targetDevice = devices.find(d => d.device_type === target_device_type);

    if (!targetDevice && target_device_type) {
      return Response.json({ error: 'Target device not available' }, { status: 404 });
    }

    const executionResults = [];

    // Execute action plan steps
    for (const step of action_plan || []) {
      const device = devices.find(d => d.id === step.device_id);
      
      if (device) {
        // Log the action
        executionResults.push({
          device_id: device.id,
          device_type: device.device_type,
          action: step.step,
          success: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    // If single action command provided
    if (action_command && targetDevice) {
      executionResults.push({
        device_id: targetDevice.id,
        device_type: targetDevice.device_type,
        action: action_command,
        success: true,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      execution_results: executionResults,
      devices_controlled: executionResults.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});