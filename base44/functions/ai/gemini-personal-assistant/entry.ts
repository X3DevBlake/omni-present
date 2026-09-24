export default async function handler(req, res) {
  const { message, context, userEmail } = req.body;

  try {
    // Gather comprehensive context
    const [agents, simulations, knowledgeNodes, skills, predictions] = await Promise.all([
      req.base44.entities.Agent.filter({ user_email: userEmail }).catch(() => []),
      req.base44.entities.Simulation.filter({ user_email: userEmail }).catch(() => []),
      req.base44.entities.KnowledgeGraphNode.filter({ user_email: userEmail }).catch(() => []),
      req.base44.entities.AutonomousSkillDiscovery.filter({ user_email: userEmail }).catch(() => []),
      req.base44.entities.PredictiveAnalytic.filter({ user_email: userEmail }).catch(() => [])
    ]);

    const assistantPrompt = `
    You are Gemini, a powerful AI assistant with full access to the AI Lab platform.
    
    User Message: ${message}
    Current Page: ${context.currentPage}
    
    USER'S CURRENT STATE:
    - Active Agents: ${agents.length} (${agents.slice(0, 3).map(a => a.name).join(', ')})
    - Running Simulations: ${simulations.filter(s => s.status === 'running').length}
    - Knowledge Nodes: ${knowledgeNodes.length}
    - Skills Learning: ${skills.filter(s => s.integration_status === 'learning').length}
    - Recent Predictions: ${predictions.length}
    
    Help the user with:
    - Navigating and using any platform feature
    - Managing their agents and simulations
    - Optimizing workflows and performance
    - Understanding complex AI concepts
    - Troubleshooting and debugging
    - Suggesting proactive improvements
    - Executing tasks directly when possible
    
    Be conversational, friendly, insightful, and proactive. Provide specific, actionable advice based on their actual data.
    `;

    const response = await req.base44.integrations.Core.InvokeLLM({
      prompt: assistantPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          suggested_actions: { 
            type: "array", 
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                action: { type: "string" },
                path: { type: "string" }
              }
            }
          },
          tips: { type: "array", items: { type: "string" } },
          can_execute: { type: "boolean" }
        }
      }
    });

    await req.base44.entities.GeminiInteraction.create({
      user_email: userEmail,
      interaction_type: 'personal_assistant',
      prompt: message,
      response: response.message,
      context
    });

    return res.json({
      success: true,
      response
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}