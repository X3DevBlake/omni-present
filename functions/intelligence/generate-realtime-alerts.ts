import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { monitoring_scope } = await req.json();

    // Gather recent activity data
    const [recentEvents, anomalies, thresholdBreaches] = await Promise.all([
      base44.entities.SimulationEvent.filter({}).limit(50).sort('-created_date'),
      base44.entities.AnomalyDetector.filter({}).limit(30),
      base44.entities.UserActivity.filter({}).limit(100).sort('-created_date')
    ]);

    // Use AI to generate intelligent alerts
    const alertsData = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze recent system activity and generate intelligent alerts:
      
Recent Events: ${recentEvents.length} events
Detected Anomalies: ${anomalies.length} anomalies
User Activities: ${thresholdBreaches.length} activities

Generate 5 alerts with: alert type, severity (info/low/medium/high/critical), affected hubs (array), root cause analysis, predicted impact, confidence score (0-1), and 3 recommended actions.`,
      response_json_schema: {
        type: "object",
        properties: {
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                severity: { type: "string" },
                hubs: { type: "array", items: { type: "string" } },
                root_cause: { type: "string" },
                impact: { type: "string" },
                confidence: { type: "number" },
                actions: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Create intelligence alert records
    const alerts = [];
    for (const alert of alertsData.alerts) {
      const createdAlert = await base44.entities.IntelligenceAlert.create({
        alert_id: `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        alert_type: alert.type,
        severity: alert.severity,
        source_hubs: alert.hubs,
        affected_entities: alert.hubs.map(hub => ({
          entity_type: hub,
          entity_id: 'system'
        })),
        ai_analysis: {
          confidence_score: alert.confidence,
          root_cause: alert.root_cause,
          predicted_impact: alert.impact,
          recommended_actions: alert.actions
        },
        data_points: [{
          timestamp: new Date().toISOString(),
          metric: 'alert_generation',
          value: alert.confidence
        }],
        status: 'active',
        auto_resolved: false
      });
      alerts.push(createdAlert);
    }

    return Response.json({
      success: true,
      alerts_generated: alerts.length,
      alerts
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});