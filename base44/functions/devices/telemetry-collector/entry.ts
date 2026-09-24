import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { deviceId } = body;

    // Generate telemetry data
    const telemetryData = {
      cpu_usage: Math.floor(Math.random() * 100),
      memory_usage: Math.floor(Math.random() * 100),
      temperature: 35 + Math.floor(Math.random() * 20),
      battery_level: Math.floor(Math.random() * 100),
      network_bandwidth: Math.floor(Math.random() * 100),
      storage_used: 200 + Math.floor(Math.random() * 100),
      uptime_seconds: Math.floor(Math.random() * 86400),
      active_processes: Math.floor(Math.random() * 50),
    };

    // Store telemetry
    await base44.asServiceRole.entities.SensorData?.create?.({
      device_id: deviceId,
      metric_type: 'device_telemetry',
      metrics: telemetryData,
      collected_at: new Date().toISOString(),
    }).catch(() => null);

    return Response.json({
      success: true,
      deviceId,
      telemetry: telemetryData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});