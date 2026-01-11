export default async function handler(req, res) {
  const { currentState, goals, constraints, userEmail } = req.body;

  try {
    // AI prescribes optimal actions
    const prescriptionPrompt = `
    Prescribe optimal actions to achieve goals:
    
    Current State: ${JSON.stringify(currentState)}
    Goals: ${JSON.stringify(goals)}
    Constraints: ${JSON.stringify(constraints)}
    
    Prescribe:
    1. Prioritized action plan
    2. Expected outcomes for each action
    3. Resource requirements
    4. Risk mitigation steps
    5. Success metrics
    6. Alternative strategies
    
    Return actionable prescriptions as JSON.
    `;

    const prescriptions = await req.base44.integrations.Core.InvokeLLM({
      prompt: prescriptionPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          action_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "number" },
                expected_outcome: { type: "string" },
                impact_score: { type: "number" },
                effort_required: { type: "string" },
                timeline: { type: "string" }
              }
            }
          },
          resource_requirements: { type: "object" },
          risk_mitigation: { type: "array", items: { type: "string" } },
          success_metrics: { type: "array", items: { type: "object" } },
          alternatives: { type: "array", items: { type: "object" } },
          confidence: { type: "number" }
        }
      }
    });

    return res.json({
      success: true,
      prescriptions,
      top_action: prescriptions.action_plan[0]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}