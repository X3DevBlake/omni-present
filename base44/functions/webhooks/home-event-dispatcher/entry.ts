import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Event types: agent_task_completed, portfolio_update, network_alert, community_challenge
    const { eventType, data, userId } = body;

    const alertMessage = {
      agent_task_completed: `Agent "${data.agentName}" completed ${data.taskCount} tasks`,
      portfolio_update: `Portfolio changed by $${data.amount}`,
      network_alert: `Network anomaly detected: ${data.description}`,
      community_challenge: `New challenge available: ${data.challengeName}`,
    };

    // Trigger real-time notification (could be sent to frontend via WebSocket in production)
    console.log(`[${eventType}] ${alertMessage[eventType]}`);

    // Log event for analytics
    await base44.asServiceRole.entities.ProactiveAlert?.create?.({
      alert_type: eventType,
      severity: data.severity || 'medium',
      title: alertMessage[eventType],
      description: data.description || '',
      status: 'active',
    }).catch(() => null);

    return Response.json({ success: true, message: 'Event dispatched' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});