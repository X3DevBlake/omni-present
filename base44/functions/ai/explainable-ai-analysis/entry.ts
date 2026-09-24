export default async function handler(req, res) {
  const { agentId, decision, inputData, userEmail } = req.body;

  try {
    const agent = await req.base44.entities.Agent.findOne({ id: agentId });

    // AI explains its decision
    const explanationPrompt = `
    Explain this AI decision in detail:
    
    Agent: ${agent.name}
    Decision: ${JSON.stringify(decision)}
    Input: ${JSON.stringify(inputData)}
    
    Provide:
    1. Feature importance (what inputs mattered most)
    2. Decision path (step-by-step reasoning)
    3. Counterfactual explanations (what would change the decision)
    4. Confidence factors (why certain vs uncertain)
    5. Alternative decisions considered
    6. Human-readable summary
    
    Make it transparent and understandable. Return as JSON.
    `;

    const explanation = await req.base44.integrations.Core.InvokeLLM({
      prompt: explanationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          feature_importance: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feature: { type: "string" },
                importance: { type: "number" },
                impact: { type: "string" }
              }
            }
          },
          decision_path: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "number" },
                reasoning: { type: "string" },
                intermediate_result: { type: "string" }
              }
            }
          },
          counterfactuals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                change: { type: "string" },
                new_decision: { type: "string" },
                probability: { type: "number" }
              }
            }
          },
          confidence_factors: { type: "array", items: { type: "string" } },
          alternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                decision: { type: "string" },
                score: { type: "number" },
                why_not_chosen: { type: "string" }
              }
            }
          },
          summary: { type: "string" }
        }
      }
    });

    // Generate visualizations
    const visualizations = {
      feature_chart: {
        type: 'bar',
        data: explanation.feature_importance.map(f => ({
          label: f.feature,
          value: f.importance
        }))
      },
      decision_tree: {
        type: 'tree',
        nodes: explanation.decision_path.map((step, i) => ({
          id: i,
          label: step.reasoning
        }))
      }
    };

    return res.json({
      success: true,
      explanation,
      visualizations,
      human_readable: explanation.summary,
      explainability_score: 0.85
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}