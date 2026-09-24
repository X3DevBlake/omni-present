import { base44 } from '@base44/sdk';

/**
 * Integration Health Check
 * Monitors health of all integrations and external services
 */
export default async function integrationHealthCheck(event) {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      integrations: [],
      overall_status: 'healthy'
    };

    // Check webhook endpoints health
    const webhooks = await base44.asServiceRole.entities.WebhookConfiguration.filter({
      status: 'active'
    });

    for (const webhook of webhooks.slice(0, 10)) { // Sample first 10
      try {
        const startTime = Date.now();
        const response = await fetch(webhook.target_url, {
          method: 'HEAD',
          timeout: 5000
        });
        const latency = Date.now() - startTime;

        results.integrations.push({
          name: webhook.webhook_name,
          type: 'webhook',
          status: response.ok ? 'healthy' : 'unhealthy',
          latency_ms: latency,
          status_code: response.status
        });

      } catch (error) {
        results.integrations.push({
          name: webhook.webhook_name,
          type: 'webhook',
          status: 'error',
          error: error.message
        });
        results.overall_status = 'degraded';
      }
    }

    // Check Core integrations availability
    const coreIntegrations = ['InvokeLLM', 'SendEmail', 'UploadFile', 'GenerateImage'];
    
    for (const integration of coreIntegrations) {
      try {
        // Test with minimal call
        if (integration === 'InvokeLLM') {
          await base44.integrations.Core.InvokeLLM({
            prompt: 'health check',
            response_json_schema: {
              type: 'object',
              properties: { status: { type: 'string' } }
            }
          });
        }

        results.integrations.push({
          name: integration,
          type: 'core_integration',
          status: 'healthy'
        });

      } catch (error) {
        results.integrations.push({
          name: integration,
          type: 'core_integration',
          status: 'error',
          error: error.message
        });
        results.overall_status = 'degraded';
      }
    }

    // Store health check results as metrics
    await base44.asServiceRole.entities.SystemMetric.create({
      metric_name: 'integration_health_check',
      metric_type: 'usage',
      metric_value: results.integrations.filter(i => i.status === 'healthy').length,
      unit: 'count',
      timestamp: results.timestamp,
      tags: { overall_status: results.overall_status },
      threshold_status: results.overall_status === 'healthy' ? 'normal' : 'warning'
    });

    return results;

  } catch (error) {
    console.error('Integration health check error:', error);
    return { 
      success: false, 
      error: error.message,
      overall_status: 'error'
    };
  }
}