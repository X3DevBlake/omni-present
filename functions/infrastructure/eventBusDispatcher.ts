import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, source_service, payload, target_services, priority } = await req.json();

    const event = await base44.entities.EventBusMessage.create({
      event_id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_type,
      source_service,
      payload,
      routing: {
        target_services: target_services || [],
        routing_key: `${event_type}.${source_service}`,
        priority: priority || 'normal'
      },
      delivery_status: {
        delivered_to: [],
        failed_deliveries: [],
        pending_deliveries: target_services || []
      },
      timestamp: new Date().toISOString(),
      ttl_seconds: 3600,
      retry_count: 0,
      correlation_id: `corr_${Date.now()}`
    });

    // Simulate event delivery to target services
    const deliveryPromises = (target_services || []).map(async (service) => {
      try {
        // Simulate successful delivery
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await base44.asServiceRole.entities.EventBusMessage.update(event.id, {
          delivery_status: {
            ...event.delivery_status,
            delivered_to: [...event.delivery_status.delivered_to, service],
            pending_deliveries: event.delivery_status.pending_deliveries.filter(s => s !== service)
          }
        });
        
        return { service, success: true };
      } catch (error) {
        await base44.asServiceRole.entities.EventBusMessage.update(event.id, {
          delivery_status: {
            ...event.delivery_status,
            failed_deliveries: [...event.delivery_status.failed_deliveries, service],
            pending_deliveries: event.delivery_status.pending_deliveries.filter(s => s !== service)
          }
        });
        
        return { service, success: false, error: error.message };
      }
    });

    const results = await Promise.all(deliveryPromises);

    return Response.json({
      success: true,
      event_id: event.id,
      event,
      delivery_results: results,
      message: `Event ${event_type} dispatched to ${target_services?.length || 0} services`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});