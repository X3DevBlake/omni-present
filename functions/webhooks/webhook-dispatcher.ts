import { base44 } from '@base44/sdk';

/**
 * Webhook Dispatcher
 * Dispatches webhooks based on entity events and configurations
 */
export default async function webhookDispatcher(event) {
  const { eventType, entityName, entityId, data, userId } = event;

  try {
    // Fetch active webhook configurations for this event type
    const webhooks = await base44.asServiceRole.entities.WebhookConfiguration.filter({
      status: 'active',
      event_type: eventType,
      entity_name: entityName
    });

    if (!webhooks || webhooks.length === 0) {
      return { success: true, message: 'No active webhooks for this event' };
    }

    // Dispatch to all matching webhooks
    const results = await Promise.allSettled(
      webhooks.map(webhook => dispatchWebhook(webhook, {
        eventType,
        entityName,
        entityId,
        data,
        userId,
        timestamp: new Date().toISOString()
      }))
    );

    // Log results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      dispatched: webhooks.length,
      successful,
      failed,
      results
    };

  } catch (error) {
    console.error('Webhook dispatcher error:', error);
    
    // Log to ActivityLog
    await base44.asServiceRole.entities.ActivityLog.create({
      action_type: 'webhook_trigger',
      entity_type: entityName,
      entity_id: entityId,
      success: false,
      error_message: error.message,
      action_details: { eventType, error: error.stack }
    });

    return { success: false, error: error.message };
  }
}

async function dispatchWebhook(webhook, eventData) {
  try {
    // Build payload from template
    const payload = buildPayload(webhook.payload_template, eventData);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...webhook.headers
    };

    // Add signature if secret key exists
    if (webhook.secret_key) {
      const signature = await generateSignature(payload, webhook.secret_key);
      headers['X-Webhook-Signature'] = signature;
    }

    // Send webhook with retry logic
    const response = await sendWithRetry(
      webhook.target_url,
      webhook.http_method || 'POST',
      payload,
      headers,
      webhook.retry_policy
    );

    // Update webhook stats
    await base44.asServiceRole.entities.WebhookConfiguration.update(webhook.id, {
      success_count: (webhook.success_count || 0) + 1,
      last_triggered: new Date().toISOString()
    });

    return { success: true, webhook: webhook.webhook_name, response };

  } catch (error) {
    // Update failure count
    await base44.asServiceRole.entities.WebhookConfiguration.update(webhook.id, {
      failure_count: (webhook.failure_count || 0) + 1,
      last_triggered: new Date().toISOString()
    });

    throw error;
  }
}

function buildPayload(template, eventData) {
  if (!template) {
    return eventData;
  }

  // Simple template variable replacement
  const payload = JSON.parse(JSON.stringify(template));
  return replaceVariables(payload, eventData);
}

function replaceVariables(obj, data) {
  if (typeof obj === 'string') {
    return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => replaceVariables(item, data));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceVariables(value, data);
    }
    return result;
  }
  
  return obj;
}

async function generateSignature(payload, secret) {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

async function sendWithRetry(url, method, payload, headers, retryPolicy) {
  const maxRetries = retryPolicy?.max_retries || 3;
  const retryDelay = retryPolicy?.retry_delay_ms || 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return await response.json();
      }

      if (attempt === maxRetries) {
        throw new Error(`Webhook failed after ${maxRetries} retries: ${response.statusText}`);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));

    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
}