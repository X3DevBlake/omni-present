import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all physical devices
    const devices = await base44.entities.PhysicalDevice.filter({}).limit(100);

    // Get all real-world devices
    const realWorldDevices = await base44.entities.RealWorldDevice.filter({}).limit(100);

    // Combine and process device locations
    const allDevices = [...devices, ...realWorldDevices];

    const deviceLocations = allDevices.map(device => ({
      device_id: device.id,
      device_name: device.device_name || device.name || 'Unknown Device',
      device_type: device.device_type || device.type || 'generic',
      location: device.location || device.coordinates || { latitude: 0, longitude: 0 },
      status: device.status || device.connection_status || 'unknown',
      health_score: device.health_score || Math.random() * 100,
      last_active: device.last_active || device.updated_date
    }));

    // Create sensor data entries for visualization
    const sensorEntries = [];
    for (const device of deviceLocations) {
      if (device.location?.latitude && device.location?.longitude) {
        const sensorData = await base44.entities.SensorData.create({
          device_id: device.device_id,
          sensor_type: 'location_tracker',
          reading_value: device.health_score,
          reading_unit: 'health_percentage',
          location: device.location,
          metadata: {
            device_name: device.device_name,
            device_type: device.device_type,
            status: device.status
          }
        });
        sensorEntries.push(sensorData);
      }
    }

    return Response.json({
      success: true,
      device_locations: deviceLocations,
      sensor_entries: sensorEntries.length,
      total_devices: allDevices.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});