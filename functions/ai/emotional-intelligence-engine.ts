export default async function handler(req, res) {
  const { agentId, interactionText, context, userEmail } = req.body;

  try {
    // AI analyzes emotional content
    const emotionPrompt = `
    Analyze emotional intelligence in this interaction:
    
    Text: ${interactionText}
    Context: ${JSON.stringify(context)}
    
    Detect:
    1. User emotional state (primary and secondary emotions)
    2. Sentiment intensity
    3. Emotional triggers
    4. Appropriate response tone
    5. Empathy level needed
    6. Conflict indicators
    
    Return detailed emotional analysis as JSON.
    `;

    const emotionalAnalysis = await req.base44.integrations.Core.InvokeLLM({
      prompt: emotionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_emotion: { type: "string" },
          secondary_emotions: { type: "array", items: { type: "string" } },
          sentiment_score: { type: "number" },
          intensity: { type: "number" },
          triggers: { type: "array", items: { type: "string" } },
          recommended_tone: { type: "string" },
          empathy_level: { type: "number" },
          conflict_detected: { type: "boolean" },
          response_suggestions: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Update agent emotional state
    await req.base44.entities.AgentMood.update(agentId, {
      current_mood: emotionalAnalysis.recommended_tone,
      mood_factors: {
        user_emotion: emotionalAnalysis.primary_emotion,
        intensity: emotionalAnalysis.intensity
      }
    });

    return res.json({
      success: true,
      emotional_analysis: emotionalAnalysis,
      adjusted_response_tone: emotionalAnalysis.recommended_tone
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}