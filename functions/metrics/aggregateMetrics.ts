import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { aggregator_name, aggregation_strategy } = await req.json();

    const timeWindows = [
      { window_size: '1m', aggregated_value: 45.2, sample_count: 60 },
      { window_size: '5m', aggregated_value: 47.8, sample_count: 300 },
      { window_size: '15m', aggregated_value: 46.5, sample_count: 900 },
      { window_size: '1h', aggregated_value: 48.1, sample_count: 3600 }
    ];

    const categories = [
      {
        category: 'System Performance',
        metrics: [
          { name: 'CPU Usage', value: 52.3, unit: '%', trend: 'stable' },
          { name: 'Memory Usage', value: 68.7, unit: '%', trend: 'increasing' },
          { name: 'Disk I/O', value: 120.5, unit: 'MB/s', trend: 'stable' }
        ]
      },
      {
        category: 'Application Metrics',
        metrics: [
          { name: 'Requests/sec', value: 450, unit: 'req/s', trend: 'increasing' },
          { name: 'Avg Response Time', value: 145, unit: 'ms', trend: 'decreasing' },
          { name: 'Error Rate', value: 0.8, unit: '%', trend: 'stable' }
        ]
      },
      {
        category: 'AI Model Performance',
        metrics: [
          { name: 'Inference Time', value: 85, unit: 'ms', trend: 'stable' },
          { name: 'Model Accuracy', value: 94.2, unit: '%', trend: 'increasing' },
          { name: 'GPU Utilization', value: 78.5, unit: '%', trend: 'stable' }
        ]
      }
    ];

    const aggregator = await base44.entities.MetricsAggregator.create({
      aggregator_name,
      aggregation_strategy,
      time_windows: timeWindows,
      metric_categories: categories,
      rollup_config: {
        enabled: true,
        retention_days: 90,
        granularity: '1m'
      },
      visualization_config: {
        dashboard_id: 'main_dashboard',
        chart_types: ['line', 'gauge', 'heatmap']
      },
      export_targets: [
        { target_type: 'prometheus', endpoint: 'http://prometheus:9090' },
        { target_type: 'datadog', endpoint: 'https://api.datadoghq.com' }
      ]
    });

    return Response.json({
      success: true,
      aggregator_id: aggregator.id,
      aggregator,
      metrics_count: categories.reduce((sum, cat) => sum + cat.metrics.length, 0),
      message: `Metrics aggregator created with ${aggregation_strategy} strategy`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});