export default async function handler(req, res) {
  const { agentIds, conflictDescription, context, userEmail } = req.body;

  try {
    // Fetch agents involved
    const agents = await Promise.all(
      agentIds.map(id => req.base44.entities.Agent.findOne({ id }))
    );

    // AI mediates conflict
    const mediationPrompt = `
    Mediate conflict between AI agents:
    
    Agents: ${agents.map(a => `${a.name} (${a.type})`).join(', ')}
    Conflict: ${conflictDescription}
    Context: ${JSON.stringify(context)}
    
    Provide:
    1. Root cause of conflict
    2. Each agent's perspective
    3. Common ground
    4. Resolution strategies (3 options)
    5. Negotiation protocol
    6. Success criteria
    
    Return mediation plan as JSON.
    `;

    const mediation = await req.base44.integrations.Core.InvokeLLM({
      prompt: mediationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          root_cause: { type: "string" },
          perspectives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                viewpoint: { type: "string" },
                concerns: { type: "array", items: { type: "string" } }
              }
            }
          },
          common_ground: { type: "array", items: { type: "string" } },
          resolution_strategies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy: { type: "string" },
                steps: { type: "array", items: { type: "string" } },
                likelihood_of_success: { type: "number" }
              }
            }
          },
          negotiation_protocol: { type: "string" },
          success_criteria: { type: "array", items: { type: "string" } }
        }
      }
    });

    return res.json({
      success: true,
      mediation,
      recommended_strategy: mediation.resolution_strategies[0]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}