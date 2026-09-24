import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, target_area, optimization_strategy } = await req.json();

    // Get all available devices
    const allDevices = await base44.entities.OmniDevice.filter({ online_status: true });

    // Get agent's current presence
    const presences = await base44.entities.AgentPhysicalPresence.filter({ agent_id });
    const currentPresence = presences[0];

    // Use AI to calculate optimal multi-device projection
    const optimization = await base44.integrations.Core.InvokeLLM({
      prompt: `Optimize agent projection across multiple devices:
      
Agent: ${agent_id}
Available devices: ${allDevices.length}
Device types: ${allDevices.map(d => d.device_type).join(', ')}
Target area: ${JSON.stringify(target_area)}
Strategy: ${optimization_strategy || 'load_balanced'}
Current location: ${JSON.stringify(currentPresence?.current_location)}

Calculate optimal device allocation:
1. primary_devices (3 devices with {device_id, projection_portion (full/partial/shadow), quality_level, resource_allocation 0-100})
2. coverage_area_sqm (total coverage in square meters)
3. transition_plan (5 steps for seamless agent handoff between devices)
4. power_consumption_watts (estimated total)
5. quality_score (0-100, overall projection quality)`,
      response_json_schema: {
        type: "object",
        properties: {
          primary_devices: {
            type: "array",
            items: {
              type: "object",
              properties: {
                device_id: { type: "string" },
                projection_portion: { type: "string" },
                quality_level: { type: "string" },
                resource_allocation: { type: "number" }
              }
            }
          },
          coverage_area: { type: "number" },
          transition_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "string" },
                device_id: { type: "string" },
                timing_ms: { type: "number" }
              }
            }
          },
          power_consumption: { type: "number" },
          quality_score: { type: "number" }
        }
      }
    });

    // Create multi-device projection session
    const projection = await base44.entities.MultiDeviceProjection.create({
      projection_session_id: `MULTI_${Date.now()}`,
      agent_id,
      active_devices: optimization.primary_devices.map(d => ({
        device_id: d.device_id,
        projection_portion: d.projection_portion,
        quality_level: d.quality_level,
        resource_allocation: d.resource_allocation
      })),
      optimization_strategy: optimization_strategy || 'load_balanced',
      coverage_map: {
        total_coverage_area_sqm: optimization.coverage_area,
        overlap_zones: []
      },
      seamless_transition_enabled: true,
      ai_optimization_metrics: {
        device_utilization_balance: optimization.quality_score,
        total_power_consumption_watts: optimization.power_consumption,
        projection_consistency_score: 95
      }
    });

    return Response.json({
      success: true,
      projection,
      optimization,
      devices_allocated: optimization.primary_devices.length,
      coverage_area_sqm: optimization.coverage_area
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});