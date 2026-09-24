import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await base44.entities.ProactiveAlert.filter(
      { acknowledged: false },
      '-created_date',
      20
    );

    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const highCount = alerts.filter(a => a.severity === 'high').length;

    if (criticalCount > 0) {
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      
      for (const alert of criticalAlerts) {
        if (!alert.propagation_path || alert.propagation_path.length === 0) {
          const components = ['Security Layer', 'Data Pipeline', 'Agent Network', 'User Interface'];
          alert.propagation_path = components.map((comp, i) => ({
            component: comp,
            timestamp: new Date(Date.now() - (components.length - i) * 1000).toISOString(),
            impact_level: Math.max(0.3, 1 - (i * 0.2))
          }));
        }
      }
    }

    const systemHealth = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze alert severity distribution: ${criticalCount} critical, ${highCount} high, ${alerts.length} total. Provide 2-sentence system health assessment and top priority action.`,
      response_json_schema: {
        type: "object",
        properties: {
          health_status: { type: "string" },
          priority_action: { type: "string" },
          risk_level: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      alerts: alerts.map(a => ({
        ...a,
        propagation_path: a.propagation_path || []
      })),
      summary: {
        total: alerts.length,
        critical: criticalCount,
        high: highCount,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      },
      system_health: systemHealth,
      message: 'Alert flow data retrieved'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});