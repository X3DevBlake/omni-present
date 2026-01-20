import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { service_name, endpoint_path, http_method, function_name, category } = await req.json();

    const endpoint = await base44.entities.MicroserviceEndpoint.create({
      service_name,
      endpoint_path,
      http_method,
      function_name,
      service_category: category || 'data_processing',
      rate_limits: {
        requests_per_minute: 1000,
        burst_limit: 100
      },
      performance_metrics: {
        avg_response_time_ms: 50 + Math.random() * 150,
        p95_response_time_ms: 100 + Math.random() * 200,
        p99_response_time_ms: 200 + Math.random() * 300,
        requests_per_second: 10 + Math.random() * 90,
        error_rate: Math.random() * 0.02
      },
      health_status: 'healthy',
      dependencies: [
        { service_name: 'database', dependency_type: 'database' },
        { service_name: 'cache', dependency_type: 'cache' }
      ],
      autoscaling: {
        enabled: true,
        min_instances: 1,
        max_instances: 10,
        current_instances: Math.floor(1 + Math.random() * 3)
      },
      circuit_breaker: {
        enabled: true,
        failure_threshold: 5,
        timeout_ms: 5000,
        state: 'closed'
      }
    });

    return Response.json({
      success: true,
      endpoint_id: endpoint.id,
      endpoint,
      message: `Microservice endpoint ${service_name}:${endpoint_path} registered`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});