import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { monitor_name, target_system, target_id } = await req.json();

    const metrics = [
      { metric_name: 'CPU Usage', current_value: 45 + Math.random() * 30, historical_avg: 50, threshold: 80, status: 'normal' },
      { metric_name: 'Memory Usage', current_value: 60 + Math.random() * 20, historical_avg: 65, threshold: 85, status: 'normal' },
      { metric_name: 'Response Time', current_value: 120 + Math.random() * 80, historical_avg: 150, threshold: 300, status: 'normal' },
      { metric_name: 'Error Rate', current_value: Math.random() * 2, historical_avg: 0.5, threshold: 5, status: 'normal' }
    ];

    const bottlenecks = [
      {
        bottleneck_type: 'Database query optimization',
        severity: 'medium',
        impact: 'Slow response times on complex queries',
        recommendation: 'Add indexes on frequently queried fields'
      }
    ];

    const optimizations = [
      {
        suggestion: 'Implement caching for frequently accessed data',
        expected_improvement: 0.25,
        effort_required: 'medium'
      },
      {
        suggestion: 'Use connection pooling for database access',
        expected_improvement: 0.15,
        effort_required: 'low'
      }
    ];

    const monitor = await base44.entities.PerformanceMonitor.create({
      monitor_name,
      target_system,
      target_id,
      metrics_collected: metrics,
      performance_score: 75 + Math.random() * 20,
      bottlenecks_detected: bottlenecks,
      optimization_suggestions: optimizations,
      monitoring_interval_seconds: 60,
      alert_enabled: true
    });

    return Response.json({
      success: true,
      monitor_id: monitor.id,
      monitor,
      performance_score: monitor.performance_score,
      message: `Monitoring ${target_system} with ${metrics.length} metrics`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});