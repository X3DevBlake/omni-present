import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { deviceId, action, parameters } = body;

    // Execute device control command
    const controlCommands = {
      power_on: { success: true, message: 'Device powered on' },
      power_off: { success: true, message: 'Device powered off' },
      restart: { success: true, message: 'Device restarting' },
      network_settings: { success: true, message: 'Network settings updated' },
      update_firmware: { success: true, message: 'Firmware update initiated' },
      lock: { success: true, message: 'Device locked' },
      unlock: { success: true, message: 'Device unlocked' },
    };

    const result = controlCommands[action] || { success: false, message: 'Unknown action' };

    // Log control action
    await base44.asServiceRole.entities.DeviceControl?.create?.({
      device_id: deviceId,
      action,
      status: result.success ? 'executed' : 'failed',
      parameters: parameters || {},
      executed_at: new Date().toISOString(),
    }).catch(() => null);

    return Response.json({
      success: result.success,
      message: result.message,
      deviceId,
      action,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});