import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhook_name, trigger_entity, trigger_events, endpoint_url, filters } = await req.json();

    // Generate webhook secret
    const secret_key = `whsec_${Math.random().toString(36).substring(2, 15)}`;

    const webhook = await base44.entities.WebhookConfiguration.create({
      webhook_name,
      trigger_entity,
      trigger_events,
      endpoint_url,
      http_method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret_key
      },
      payload_template: {
        event: '{{event}}',
        entity: '{{entity_name}}',
        data: '{{data}}',
        timestamp: '{{timestamp}}'
      },
      filters: filters || {},
      retry_config: {
        max_retries: 3,
        retry_delay_ms: 1000
      },
      status: 'active',
      delivery_stats: {
        total_deliveries: 0,
        successful_deliveries: 0,
        failed_deliveries: 0
      },
      secret_key
    });

    return Response.json({
      success: true,
      webhook_id: webhook.id,
      webhook,
      secret_key,
      message: `Webhook ${webhook_name} configured for ${trigger_entity} ${trigger_events.join(', ')} events`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});