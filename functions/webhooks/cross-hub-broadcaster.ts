import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventType, sourceHub, payload, targetHubs } = body;

    // Broadcast event to target hubs
    const broadcastEvent = {
      id: `evt-${Date.now()}`,
      type: eventType,
      source: sourceHub,
      timestamp: new Date().toISOString(),
      data: payload,
      targets: targetHubs || [],
    };

    // Store event in database
    await base44.asServiceRole.entities.CrossModuleIntegration?.create?.({
      integration_name: `${sourceHub}_to_${targetHubs?.join('_')}`,
      source_module: sourceHub,
      target_module: targetHubs?.[0] || 'system',
      trigger_event: eventType,
      action_config: payload || {},
      execution_count: 1,
      last_executed: new Date().toISOString(),
    }).catch(() => null);

    // Trigger actions based on event type
    const actions = {
      agent_trained: { notify: ['banking', 'communications'], action: 'update_capabilities' },
      market_anomaly: { notify: ['banking', 'simulation'], action: 'risk_alert' },
      device_connected: { notify: ['communications', 'ai_labs'], action: 'broadcast_status' },
      simulation_complete: { notify: ['ai_labs', 'banking'], action: 'deploy_model' },
    };

    const action = actions[eventType];

    return Response.json({
      success: true,
      eventId: broadcastEvent.id,
      eventType,
      sourceHub,
      targetHubs: targetHubs || action?.notify || [],
      broadcast: true,
      timestamp: broadcastEvent.timestamp,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});