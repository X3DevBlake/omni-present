export default async function triggerWorkflowWebhook(data, context) {
  const { webhook_id, event_type, payload } = data;
  
  const webhook = await context.entities.WebhookConfiguration.get(webhook_id);
  if (!webhook || !webhook.is_active) return { sent: false };
  
  const template = webhook.template_id 
    ? await context.entities.WebhookTemplate.get(webhook.template_id)
    : null;
  
  let finalPayload = payload;
  if (template && template.template_code) {
    finalPayload = {
      ...payload,
      template_data: template.variables
    };
  }
  
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'signature_hash',
        ...webhook.headers
      },
      body: JSON.stringify(finalPayload)
    });
    
    await context.entities.WebhookConfiguration.update(webhook_id, {
      last_triggered: new Date().toISOString(),
      success_count: (webhook.success_count || 0) + 1
    });
    
    return { sent: true, status: response.status };
  } catch (error) {
    await context.entities.WebhookConfiguration.update(webhook_id, {
      failure_count: (webhook.failure_count || 0) + 1,
      last_error: error.message
    });
    
    return { sent: false, error: error.message };
  }
}