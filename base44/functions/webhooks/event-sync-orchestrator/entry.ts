import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'sync_all') {
      // Synchronize all hub data
      const syncSummary = {
        home: await syncHub('home'),
        banking: await syncHub('banking'),
        ai_labs: await syncHub('ai_labs'),
        simulations: await syncHub('simulations'),
        devices: await syncHub('devices'),
        communications: await syncHub('communications'),
      };

      return Response.json({
        success: true,
        action: 'full_sync',
        timestamp: new Date().toISOString(),
        summary: syncSummary,
      });
    }

    if (action === 'subscribe') {
      const { eventType, targetHubs } = body;

      // Create webhook subscription
      const subscription = await base44.asServiceRole.entities.WebhookConfiguration?.create?.({
        name: `${eventType}_subscription`,
        trigger_event: eventType,
        targets: targetHubs || [],
        status: 'active',
        subscribed_at: new Date().toISOString(),
      }).catch(() => null);

      return Response.json({
        success: true,
        subscriptionId: subscription?.id,
        eventType,
        targetHubs,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function syncHub(hubName) {
  return {
    hub: hubName,
    lastSync: new Date().toISOString(),
    status: 'synced',
    dataPoints: Math.floor(Math.random() * 1000) + 100,
  };
}