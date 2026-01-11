export default async function generatePredictions(request, context) {
  const { userEmail } = request.body;

  const geminiKey = context.secrets.GEMINI_API_KEY;
  
  if (!geminiKey) {
    return { statusCode: 400, body: { error: 'GEMINI_API_KEY required' } };
  }

  try {
    // Gather system data
    const [
      conversations, devices, agents, geminiInteractions
    ] = await Promise.all([
      context.entities.AIConversation.list('-created_date', 20),
      context.entities.DeviceConnection.list(),
      context.entities.Agent.list(),
      context.entities.GeminiInteraction.list('-created_date', 20)
    ]);

    // Use Gemini to generate predictions
    const analysisPrompt = `Analyze this system data and generate 4 predictions:

Conversations: ${conversations.length} (recent sentiment trends)
Connected Devices: ${devices.length}
Active Agents: ${agents.length}
Recent AI Interactions: ${geminiInteractions.length}

Generate predictions for:
1. System Issue: potential bottlenecks or failures
2. User Need: what the user might need next based on patterns
3. Agent Action: proactive actions agents should take
4. Resource Bottleneck: resource constraints

Format each as JSON: {
  "predictions": [
    {"type": "system_issue", "prediction": "...", "confidence": 85, "actions": ["action1", "action2"]},
    ...
  ]
}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }]
        })
      }
    );

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{"predictions":[]}';
    
    let predictionsData;
    try {
      predictionsData = JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      predictionsData = { predictions: [] };
    }

    // Store predictions
    const stored = [];
    for (const pred of predictionsData.predictions || []) {
      const prediction = await context.entities.PredictiveAnalytic.create({
        user_email: userEmail,
        prediction_type: pred.type,
        prediction: pred.prediction,
        confidence: pred.confidence || 70,
        data_analyzed: {
          conversations: conversations.length,
          devices: devices.length,
          agents: agents.length
        },
        suggested_actions: pred.actions || [],
        ai_generated: true
      });
      stored.push(prediction);
    }

    // Send high-confidence predictions to Zapier
    if (context.secrets.ZAPIER_WEBHOOK_URL) {
      for (const pred of stored.filter(p => p.confidence > 75)) {
        await fetch(`${context.baseUrl}/api/functions/zapier-relay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'prediction_generated',
            agent_id: 'predictive_analytics',
            agent_name: 'Predictive Analytics Agent',
            user_email: userEmail,
            data: {
              prediction_type: pred.prediction_type,
              prediction: pred.prediction,
              confidence: pred.confidence,
              suggested_actions: pred.suggested_actions
            }
          })
        }).catch(() => {});
      }
    }

    return {
      statusCode: 200,
      body: {
        predictions: stored,
        count: stored.length
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}