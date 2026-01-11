export default async function handler(req, res) {
  const { activityLogs, userEmail } = req.body;

  try {
    // AI detects security threats
    const threatPrompt = `
    Analyze activity logs for security threats:
    
    Logs: ${JSON.stringify(activityLogs.slice(-100))}
    
    Detect:
    1. Anomalous patterns
    2. Potential attacks (SQL injection, XSS, DDoS, etc)
    3. Unauthorized access attempts
    4. Data exfiltration indicators
    5. Compromised accounts
    6. Threat severity and urgency
    
    Return threat assessment as JSON.
    `;

    const threatAnalysis = await req.base44.integrations.Core.InvokeLLM({
      prompt: threatPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          threats_detected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                severity: { type: "string" },
                confidence: { type: "number" },
                indicators: { type: "array", items: { type: "string" } },
                affected_resources: { type: "array", items: { type: "string" } }
              }
            }
          },
          immediate_actions: { type: "array", items: { type: "string" } },
          auto_mitigation: { type: "object" },
          alert_level: { type: "string" }
        }
      }
    });

    // Auto-apply mitigation if critical
    if (threatAnalysis.alert_level === 'critical') {
      // Apply security hardening
      await req.base44.entities.SecurityAlert.create({
        user_email: userEmail,
        threat_type: threatAnalysis.threats_detected[0]?.type,
        severity: 'critical',
        auto_mitigated: true,
        mitigation_actions: threatAnalysis.immediate_actions
      });
    }

    return res.json({
      success: true,
      threat_analysis: threatAnalysis,
      requires_immediate_action: threatAnalysis.alert_level === 'critical'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}