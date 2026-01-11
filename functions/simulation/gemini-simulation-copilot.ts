export default async function handler(req, res) {
  const { message, simulationContext, userEmail } = req.body;

  try {
    // Gemini copilot assists with simulation
    const copilotPrompt = `
    You are a simulation copilot assistant. Help the user with:
    
    User Message: ${message}
    Simulation Context: ${JSON.stringify(simulationContext)}
    
    Provide:
    1. Direct answer to user's question
    2. Suggested simulation parameters
    3. Potential issues to watch
    4. Optimization recommendations
    5. Next steps
    
    Be conversational and helpful.
    `;

    const response = await req.base44.integrations.Core.InvokeLLM({
      prompt: copilotPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          suggested_parameters: { type: "object" },
          warnings: { type: "array", items: { type: "string" } },
          optimizations: { type: "array", items: { type: "string" } },
          next_steps: { type: "array", items: { type: "string" } },
          code_example: { type: "string" }
        }
      }
    });

    // Store conversation
    await req.base44.entities.GeminiInteraction.create({
      user_email: userEmail,
      interaction_type: 'simulation_copilot',
      prompt: message,
      response: response.answer,
      context: simulationContext
    });

    return res.json({
      success: true,
      response
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}