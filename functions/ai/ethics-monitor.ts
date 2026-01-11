export default async function handler(req, res) {
  const { agentId, action, context, userEmail } = req.body;

  try {
    // Fetch active guidelines
    const guidelines = await req.base44.entities.EthicsGuideline.filter({ 
      user_email: userEmail, 
      enabled: true 
    });

    // AI-powered ethical analysis
    const ethicsPrompt = `
    Analyze this agent action for ethical compliance:
    
    Agent: ${agentId}
    Action: ${JSON.stringify(action)}
    Context: ${JSON.stringify(context)}
    
    Guidelines to check:
    ${guidelines.map(g => `- ${g.name}: ${g.description}`).join('\n')}
    
    Analyze for:
    1. Guideline violations
    2. Bias detection (gender, racial, age, socioeconomic, geographic)
    3. Privacy concerns
    4. Transparency issues
    5. Safety risks
    
    Return detailed analysis as JSON.
    `;

    const analysis = await req.base44.integrations.Core.InvokeLLM({
      prompt: ethicsPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          violations: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                guideline_name: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          bias_detected: { 
            type: "array",
            items: { 
              type: "object",
              properties: {
                type: { type: "string" },
                confidence: { type: "number" },
                details: { type: "string" }
              }
            }
          },
          risk_level: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          compliance_score: { type: "number" }
        }
      }
    });

    // Log violations
    if (analysis.violations && analysis.violations.length > 0) {
      for (const violation of analysis.violations) {
        await req.base44.entities.AgentEthicsViolation.create({
          user_email: userEmail,
          agent_id: agentId,
          guideline_name: violation.guideline_name,
          severity: violation.severity,
          description: violation.description,
          action_taken: JSON.stringify(action),
          context: JSON.stringify(context),
          resolved: false
        });
      }
    }

    // Update guideline violation counts
    for (const guideline of guidelines) {
      const hasViolation = analysis.violations?.some(v => v.guideline_name === guideline.name);
      if (hasViolation) {
        await req.base44.entities.EthicsGuideline.update(guideline.id, {
          violation_count: (guideline.violation_count || 0) + 1
        });
      }
    }

    return res.json({
      success: true,
      analysis,
      action_allowed: analysis.risk_level !== 'critical' && analysis.compliance_score > 0.5
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}