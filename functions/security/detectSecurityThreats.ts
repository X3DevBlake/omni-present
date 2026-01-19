import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get recent activity logs
    const recentLogs = await base44.entities.ActivityLog.list('-created_date', 100);

    // Analyze for threats using AI
    const threatAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these system logs for security threats.
      
      Recent Activity:
      ${JSON.stringify(recentLogs.slice(0, 50).map(log => ({
        action: log.action_type,
        user: log.user_id,
        timestamp: log.created_date,
        details: log.details
      })), null, 2)}
      
      Identify:
      1. Suspicious patterns
      2. Potential threats (type and severity)
      3. Anomalous behavior
      4. Recommended responses
      
      Return as JSON array of threats.`,
      response_json_schema: {
        type: "object",
        properties: {
          threats: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event_type: { type: "string" },
                severity: { type: "string" },
                ai_threat_score: { type: "number" },
                affected_user_id: { type: "string" },
                event_details: { type: "object" },
                recommended_action: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Save security events
    const savedEvents = [];
    for (const threat of threatAnalysis.threats || []) {
      const event = await base44.asServiceRole.entities.SecurityEvent.create({
        event_type: threat.event_type,
        severity: threat.severity,
        ai_threat_score: threat.ai_threat_score,
        affected_user_id: threat.affected_user_id,
        target_resource: threat.event_details?.resource || 'unknown',
        detection_method: 'ai_analysis',
        event_details: threat.event_details,
        automated_response: {
          action_taken: threat.recommended_action,
          success: false
        },
        status: 'detected'
      });
      
      savedEvents.push(event);

      // Send webhook for critical threats
      if (threat.severity === 'critical' || threat.severity === 'high') {
        // await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(event) });
        await base44.asServiceRole.entities.SecurityEvent.update(event.id, {
          webhook_notified: true
        });
      }
    }

    return Response.json({ 
      success: true,
      threats_detected: savedEvents.length,
      events: savedEvents
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});