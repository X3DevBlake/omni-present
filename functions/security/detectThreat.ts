import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { event_data } = await req.json();
    
    // AI-powered threat analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this security event and determine threat level:
      
      Event Type: ${event_data.event_type}
      Source IP: ${event_data.source_ip || 'unknown'}
      Target: ${event_data.target_resource || 'unknown'}
      Details: ${JSON.stringify(event_data.event_details || {})}
      
      Evaluate the threat severity, likelihood of being an actual attack vs false positive, and recommend automated response actions.`,
      response_json_schema: {
        type: "object",
        properties: {
          threat_score: { type: "number" },
          severity: { type: "string" },
          is_false_positive_likely: { type: "boolean" },
          recommended_action: { type: "string" },
          threat_indicators: { type: "array", items: { type: "string" } },
          immediate_response_needed: { type: "boolean" }
        }
      }
    });
    
    // Create security event
    const securityEvent = await base44.asServiceRole.entities.SecurityEvent.create({
      event_type: event_data.event_type,
      severity: analysis.severity || 'medium',
      source_ip: event_data.source_ip,
      target_resource: event_data.target_resource,
      affected_user_id: event_data.affected_user_id,
      detection_method: event_data.detection_method || 'ai_analysis',
      ai_threat_score: analysis.threat_score,
      event_details: {
        ...event_data.event_details,
        threat_indicators: analysis.threat_indicators
      },
      status: analysis.is_false_positive_likely ? 'false_positive' : 'detected'
    });
    
    // Automated response for critical threats
    if (analysis.immediate_response_needed && analysis.threat_score > 70) {
      const response_action = {
        action_taken: analysis.recommended_action,
        success: true,
        timestamp: new Date().toISOString()
      };
      
      await base44.asServiceRole.entities.SecurityEvent.update(securityEvent.id, {
        automated_response: response_action,
        status: 'mitigated'
      });
      
      // Send alert email
      await base44.integrations.Core.SendEmail({
        to: 'security@example.com',
        subject: `🚨 Critical Security Threat Detected`,
        body: `Threat Score: ${analysis.threat_score}/100\nSeverity: ${analysis.severity}\nAction Taken: ${analysis.recommended_action}\n\nEvent ID: ${securityEvent.id}`
      });
    }
    
    return Response.json({
      security_event_id: securityEvent.id,
      analysis,
      action_taken: analysis.immediate_response_needed
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});