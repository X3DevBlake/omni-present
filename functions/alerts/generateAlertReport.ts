import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportType, includeRecommendations, includeTrends } = await req.json();

    // Get alert data
    const alerts = await base44.entities.AlertHistory?.list?.() || [];
    const rules = await base44.entities.AlertRule?.list?.() || [];

    // Filter by time range
    const now = new Date();
    const timeLimit = new Date();
    
    if (reportType === 'daily') timeLimit.setDate(timeLimit.getDate() - 1);
    else if (reportType === 'weekly') timeLimit.setDate(timeLimit.getDate() - 7);
    else if (reportType === 'monthly') timeLimit.setMonth(timeLimit.getMonth() - 1);

    const filteredAlerts = alerts.filter(a =>
      new Date(a.created_date) >= timeLimit
    );

    // Generate summary
    const summary = {
      totalAlerts: filteredAlerts.length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      warning: filteredAlerts.filter(a => a.severity === 'warning').length,
      info: filteredAlerts.filter(a => a.severity === 'info').length,
      resolvedAlerts: filteredAlerts.filter(a => a.status === 'resolved').length,
      topRules: [...filteredAlerts]
        .reduce((acc, a) => {
          acc[a.rule_name] = (acc[a.rule_name] || 0) + 1;
          return acc;
        }, {})
    };

    const report = {
      reportType,
      generatedAt: new Date().toISOString(),
      summary,
      recommendations: includeRecommendations ? [
        'Review and optimize alert thresholds',
        'Implement automated remediation for common alerts',
        'Schedule system maintenance based on alert patterns'
      ] : [],
      reportUrl: `data:text/json;base64,${btoa(JSON.stringify({ reportType, summary, alerts: filteredAlerts }))}`
    };

    return Response.json(report);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});