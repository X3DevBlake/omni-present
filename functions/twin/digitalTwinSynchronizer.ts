import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      physical_device_id,
      sensor_readings,
      sync_type = "sensor_update"
    } = await req.json();

    // Find or create digital twin
    let digitalTwin = await base44.entities.PhysicalDevice.filter({ 
      physical_id: physical_device_id 
    });
    
    if (!digitalTwin || digitalTwin.length === 0) {
      digitalTwin = [await base44.asServiceRole.entities.PhysicalDevice.create({
        physical_id: physical_device_id,
        digital_twin_id: `twin_${physical_device_id}`,
        status: "active",
        sensor_data_stream_url: ""
      })];
    }

    const twin = digitalTwin[0];

    // AI-powered anomaly detection
    const anomalyPrompt = `Analyze sensor data from IoT device for anomalies:

Device ID: ${physical_device_id}
Current Readings: ${JSON.stringify(sensor_readings)}
Sync Type: ${sync_type}

Detect any anomalies, predict next state, and recommend actions.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: anomalyPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          anomalies: { type: "array" },
          predicted_next_state: { type: "object" },
          state_delta: { type: "object" }
        }
      }
    });

    // Create sync record
    const syncRecord = await base44.asServiceRole.entities.DigitalTwinSync.create({
      sync_id: `sync_${Date.now()}_${Math.random()}`,
      physical_device_id,
      digital_twin_id: twin.digital_twin_id,
      sync_type,
      sensor_readings,
      state_delta: analysis.state_delta || {},
      predicted_next_state: analysis.predicted_next_state || {},
      anomalies_detected: analysis.anomalies || [],
      latency_ms: Math.random() * 50 + 10, // Simulated latency
      timestamp: new Date().toISOString()
    });

    // If critical anomaly, trigger alert
    const criticalAnomalies = (analysis.anomalies || []).filter(a => a.severity > 0.8);
    if (criticalAnomalies.length > 0) {
      await base44.functions.invoke('globalEventBus', {
        event_type: "device_anomaly_critical",
        payload: {
          device_id: physical_device_id,
          anomalies: criticalAnomalies
        },
        priority: "critical",
        target_services: ["proactive_assistant", "maintenance_scheduler"]
      });
    }

    return Response.json({
      success: true,
      sync_record: syncRecord,
      anomalies_detected: analysis.anomalies?.length || 0,
      predicted_state: analysis.predicted_next_state
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});