import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dashboard_name, dashboard_type } = await req.json();

    const widgets = [
      {
        widget_id: 'widget_1',
        widget_type: 'kpi',
        data_source: 'performance_metrics',
        position: { x: 0, y: 0, width: 3, height: 2 },
        refresh_rate_seconds: 30
      },
      {
        widget_id: 'widget_2',
        widget_type: '3d_viz',
        data_source: 'agent_network',
        position: { x: 3, y: 0, width: 6, height: 4 },
        refresh_rate_seconds: 60
      },
      {
        widget_id: 'widget_3',
        widget_type: 'chart',
        data_source: 'time_series_data',
        position: { x: 0, y: 2, width: 3, height: 2 },
        refresh_rate_seconds: 15
      }
    ];

    const kpis = [
      { kpi_name: 'System Health', current_value: 92, target_value: 95, trend: 'up', status: 'on_track' },
      { kpi_name: 'Active Agents', current_value: 47, target_value: 50, trend: 'up', status: 'on_track' },
      { kpi_name: 'Model Accuracy', current_value: 88, target_value: 90, trend: 'stable', status: 'at_risk' },
      { kpi_name: 'API Performance', current_value: 150, target_value: 200, trend: 'down', status: 'critical' }
    ];

    const alerts = [
      {
        alert_id: 'alert_1',
        severity: 'warning',
        message: 'High memory usage detected in Agent-042',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: false
      },
      {
        alert_id: 'alert_2',
        severity: 'info',
        message: 'Scheduled maintenance in 2 hours',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        acknowledged: true
      }
    ];

    const recommendations = [
      {
        recommendation: 'Increase cache size to improve response times',
        priority: 'high',
        expected_impact: '20% reduction in latency'
      },
      {
        recommendation: 'Enable auto-scaling for peak load periods',
        priority: 'medium',
        expected_impact: 'Better resource utilization'
      }
    ];

    const dashboard = await base44.entities.IntelligenceDashboard.create({
      dashboard_name,
      dashboard_type,
      widgets,
      kpis,
      alerts,
      ai_recommendations: recommendations,
      collaboration: {
        shared_with: [],
        comments_enabled: true
      },
      auto_insights: true
    });

    return Response.json({
      success: true,
      dashboard_id: dashboard.id,
      dashboard,
      widgets_count: widgets.length,
      kpis_count: kpis.length,
      message: `Intelligence dashboard ${dashboard_name} created with ${widgets.length} widgets`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});