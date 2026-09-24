import { base44 } from '@base44/sdk';

/**
 * System Health Monitor
 * Continuously tracks system metrics and generates alerts
 */
export default async function systemHealthMonitor(event) {
  try {
    const metrics = await collectSystemMetrics();
    
    // Store metrics
    await Promise.all(
      metrics.map(metric => 
        base44.asServiceRole.entities.SystemMetric.create(metric)
      )
    );

    // Check for threshold violations and create alerts
    const alerts = await checkThresholds(metrics);
    
    if (alerts.length > 0) {
      await sendAlerts(alerts);
    }

    return {
      success: true,
      metrics_collected: metrics.length,
      alerts_generated: alerts.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('System health monitor error:', error);
    return { success: false, error: error.message };
  }
}

async function collectSystemMetrics() {
  const metrics = [];
  const timestamp = new Date().toISOString();

  // Collect various system metrics
  
  // 1. API Response Time (simulated - in real scenario, track actual API calls)
  metrics.push({
    metric_name: 'api_avg_response_time',
    metric_type: 'api_latency',
    metric_value: Math.random() * 500, // ms
    unit: 'ms',
    timestamp,
    threshold_status: 'normal'
  });

  // 2. Database Query Time
  metrics.push({
    metric_name: 'db_avg_query_time',
    metric_type: 'database_query_time',
    metric_value: Math.random() * 100,
    unit: 'ms',
    timestamp,
    threshold_status: 'normal'
  });

  // 3. Webhook Success Rate
  const webhooks = await base44.asServiceRole.entities.WebhookConfiguration.list();
  const totalSuccess = webhooks.reduce((sum, w) => sum + (w.success_count || 0), 0);
  const totalFailure = webhooks.reduce((sum, w) => sum + (w.failure_count || 0), 0);
  const successRate = totalSuccess + totalFailure > 0 
    ? (totalSuccess / (totalSuccess + totalFailure)) * 100 
    : 100;

  metrics.push({
    metric_name: 'webhook_success_rate',
    metric_type: 'webhook_success_rate',
    metric_value: successRate,
    unit: '%',
    timestamp,
    threshold_status: successRate < 80 ? 'warning' : 'normal'
  });

  // 4. Active User Count (last hour)
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const recentActivity = await base44.asServiceRole.entities.ActivityLog.filter({
    created_date: { $gte: oneHourAgo }
  });
  
  const uniqueUsers = new Set(recentActivity.map(a => a.user_email)).size;
  
  metrics.push({
    metric_name: 'active_users_last_hour',
    metric_type: 'user_engagement',
    metric_value: uniqueUsers,
    unit: 'count',
    timestamp,
    threshold_status: 'normal'
  });

  // 5. Error Rate
  const errorCount = recentActivity.filter(a => !a.success).length;
  const errorRate = recentActivity.length > 0 
    ? (errorCount / recentActivity.length) * 100 
    : 0;

  metrics.push({
    metric_name: 'error_rate_last_hour',
    metric_type: 'error_rate',
    metric_value: errorRate,
    unit: '%',
    timestamp,
    threshold_status: errorRate > 5 ? 'warning' : errorRate > 10 ? 'critical' : 'normal'
  });

  return metrics;
}

async function checkThresholds(metrics) {
  const alerts = [];

  const thresholds = {
    api_avg_response_time: { warning: 300, critical: 500 },
    db_avg_query_time: { warning: 50, critical: 100 },
    webhook_success_rate: { warning: 80, critical: 60 }, // inverse
    error_rate_last_hour: { warning: 5, critical: 10 }
  };

  for (const metric of metrics) {
    const threshold = thresholds[metric.metric_name];
    if (!threshold) continue;

    let status = 'normal';
    
    // For inverse metrics (like success rate), lower is worse
    if (metric.metric_name.includes('success_rate')) {
      if (metric.metric_value < threshold.critical) {
        status = 'critical';
      } else if (metric.metric_value < threshold.warning) {
        status = 'warning';
      }
    } else {
      // For normal metrics, higher is worse
      if (metric.metric_value > threshold.critical) {
        status = 'critical';
      } else if (metric.metric_value > threshold.warning) {
        status = 'warning';
      }
    }

    if (status !== 'normal') {
      alerts.push({
        metric_name: metric.metric_name,
        metric_value: metric.metric_value,
        unit: metric.unit,
        status,
        message: `${metric.metric_name} is ${status}: ${metric.metric_value}${metric.unit}`
      });
    }
  }

  return alerts;
}

async function sendAlerts(alerts) {
  // Get admin users who should receive alerts
  const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

  for (const alert of alerts) {
    for (const admin of admins) {
      // Send email alert
      await base44.integrations.Core.SendEmail({
        to: admin.email,
        subject: `System Alert: ${alert.status.toUpperCase()} - ${alert.metric_name}`,
        body: `
          <h2>System Alert</h2>
          <p><strong>Status:</strong> ${alert.status}</p>
          <p><strong>Metric:</strong> ${alert.metric_name}</p>
          <p><strong>Value:</strong> ${alert.metric_value}${alert.unit}</p>
          <p><strong>Message:</strong> ${alert.message}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `
      });

      // Log activity
      await base44.asServiceRole.entities.ActivityLog.create({
        action_type: 'system_event',
        entity_type: 'SystemMetric',
        success: true,
        action_details: {
          alert_sent: true,
          recipient: admin.email,
          alert_details: alert
        }
      });
    }
  }
}