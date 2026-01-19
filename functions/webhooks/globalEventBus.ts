import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      event_type, 
      event_data, 
      target_webhooks = [],
      priority = 'normal'
    } = await req.json();

    // Log the event
    const eventLog = {
      event_type,
      timestamp: new Date().toISOString(),
      data: event_data,
      priority,
      webhooks_triggered: target_webhooks.length
    };

    // Get webhook configurations (if stored in database)
    const webhookConfigs = await base44.asServiceRole.entities.WebhookConfiguration.filter({
      is_active: true
    });

    const results = [];

    // Broadcast to configured webhooks
    for (const webhook of webhookConfigs) {
      if (webhook.event_types?.includes(event_type) || webhook.event_types?.includes('*')) {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Event-Type': event_type,
              'X-Priority': priority,
              ...(webhook.headers || {})
            },
            body: JSON.stringify({
              event_type,
              event_data,
              timestamp: eventLog.timestamp,
              webhook_id: webhook.id
            })
          });

          results.push({
            webhook_id: webhook.id,
            url: webhook.url,
            status: response.status,
            success: response.ok
          });
        } catch (error) {
          results.push({
            webhook_id: webhook.id,
            url: webhook.url,
            error: error.message,
            success: false
          });
        }
      }
    }

    // Broadcast to specified webhooks
    for (const webhookUrl of target_webhooks) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Event-Type': event_type,
            'X-Priority': priority
          },
          body: JSON.stringify({
            event_type,
            event_data,
            timestamp: eventLog.timestamp
          })
        });

        results.push({
          url: webhookUrl,
          status: response.status,
          success: response.ok
        });
      } catch (error) {
        results.push({
          url: webhookUrl,
          error: error.message,
          success: false
        });
      }
    }

    return Response.json({ 
      success: true,
      event: eventLog,
      webhooks_called: results.length,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});