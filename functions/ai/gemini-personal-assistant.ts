export default async function handler(req, res) {
  const { message, context, userEmail } = req.body;

  try {
    const assistantPrompt = `
    You are Gemini, a helpful AI assistant integrated into the AI Lab platform.
    
    User Message: ${message}
    Current Context: ${JSON.stringify(context)}
    
    Help the user with:
    - Navigating the platform
    - Understanding features
    - Optimizing their workflow
    - Troubleshooting issues
    - Suggesting best practices
    - Executing tasks when possible
    
    Be conversational, friendly, and proactive. Provide actionable advice.
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