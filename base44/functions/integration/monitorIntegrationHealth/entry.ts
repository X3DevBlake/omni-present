import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { integration_name } = await req.json();
    
    // Get or create integration health record
    const existing = await base44.entities.IntegrationHealth.filter({ integration_name });
    const healthRecord = existing[0];
    
    // Perform health check
    const checkStartTime = Date.now();
    let checkSuccess = true;
    let responseTime = 0;
    
    try {
      // Simulate health check (in production, would ping actual integration)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
      responseTime = Date.now() - checkStartTime;
    } catch (error) {
      checkSuccess = false;
      responseTime = Date.now() - checkStartTime;
    }
    
    // Update or create health record
    const healthChecks = [
      ...(healthRecord?.health_checks || []),
      {
        timestamp: new Date().toISOString(),
        response_time_ms: responseTime,
        success: checkSuccess
      }
    ].slice(-100); // Keep last 100 checks
    
    const successfulChecks = healthChecks.filter(c => c.success).length;
    const successRate = (successfulChecks / healthChecks.length) * 100;
    
    const avgLatency = healthChecks.reduce((sum, c) => sum + c.response_time_ms, 0) / healthChecks.length;
    
    const status = successRate > 95 ? 'healthy' : successRate > 80 ? 'degraded' : 'down';
    
    const updatedHealth = {
      integration_name,
      integration_type: 'api_key',
      status,
      last_successful_sync: checkSuccess ? new Date().toISOString() : healthRecord?.last_successful_sync,
      last_failed_sync: !checkSuccess ? new Date().toISOString() : healthRecord?.last_failed_sync,
      success_rate_24h: successRate,
      avg_latency_ms: avgLatency,
      error_count_24h: healthChecks.filter(c => !c.success).length,
      total_requests_24h: healthChecks.length,
      uptime_percentage: successRate,
      health_checks: healthChecks
    };
    
    if (healthRecord) {
      await base44.entities.IntegrationHealth.update(healthRecord.id, updatedHealth);
    } else {
      await base44.entities.IntegrationHealth.create(updatedHealth);
    }
    
    return Response.json({
      health: updatedHealth,
      check_result: {
        success: checkSuccess,
        response_time_ms: responseTime
      }
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});