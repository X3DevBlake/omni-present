export default async function unifiedOrchestrator(request, context) {
  const { input, inputType = 'text', agentId, deviceId, action = 'process' } = request.body;

  const geminiKey = context.secrets.GEMINI_API_KEY;
  const mistralKey = context.secrets.MISTRAL_API_KEY;
  const elevenLabsKey = context.secrets.ELEVENLABS_API_KEY;

  if (!geminiKey || !elevenLabsKey) {
    return { statusCode: 400, body: { error: 'Required API keys not configured' } };
  }

  try {
    // 1. Process input with Gemini for intent detection and context
    const geminiPrompt = `Analyze this user input and extract:
1. Primary intent (command, question, request, conversation)
2. Entities mentioned (devices, agents, actions)
3. Sentiment
4. Urgency level
5. Suggested response strategy

Input: "${input}"
Input Type: ${inputType}

Respond in JSON format.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }]
        })
      }
    );

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      analysis = { intent: 'conversation', entities: [], sentiment: 'neutral', urgency: 'low' };
    }

    // 2. If Mistral available, use for advanced reasoning
    let mistralInsight = null;
    if (mistralKey && analysis.intent === 'command') {
      const mistralResponse = await fetch(
        'https://api.mistral.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mistralKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: `Plan execution steps for: ${input}` }]
          })
        }
      );

      if (mistralResponse.ok) {
        const mistralData = await mistralResponse.json();
        mistralInsight = mistralData.choices?.[0]?.message?.content;
      }
    }

    // 3. Generate response with Gemini
    const responsePrompt = `Generate a natural, helpful response to: "${input}"
    
Context:
- Intent: ${analysis.intent}
- Sentiment: ${analysis.sentiment}
- Urgency: ${analysis.urgency}
${mistralInsight ? `- Execution Plan: ${mistralInsight}` : ''}

Respond conversationally and helpfully. Max 100 words.`;

    const responseGen = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: responsePrompt }] }]
        })
      }
    );

    const responseData = await responseGen.json();
    const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand.';

    // 4. Generate voice with ElevenLabs
    const voiceResponse = await fetch('/api/functions/generate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: responseText })
    });

    let audioUrl = null;
    if (voiceResponse.ok) {
      const voiceData = await voiceResponse.json();
      audioUrl = voiceData.audio;
    }

    // 5. Execute device control if needed
    let deviceControl = null;
    if (analysis.intent === 'command' && deviceId) {
      deviceControl = await context.entities.DeviceControl.create({
        agent_id: agentId || 'system',
        device_id: deviceId,
        user_email: context.user.email,
        command: input,
        command_type: 'custom',
        parameters: analysis.entities,
        voice_initiated: inputType === 'voice',
        status: 'success'
      });
    }

    // 6. Log interaction across all systems
    await context.entities.GeminiInteraction.create({
      user_email: context.user.email,
      interaction_type: analysis.intent,
      prompt: input,
      response: responseText,
      context: { analysis, mistralInsight, deviceControl },
      model_used: 'gemini-1.5-flash-latest',
      status: 'success',
      autonomous: action === 'proactive'
    });

    return {
      statusCode: 200,
      body: {
        analysis: analysis,
        response: responseText,
        audio: audioUrl,
        mistralInsight: mistralInsight,
        deviceControl: deviceControl,
        orchestration: {
          gemini: 'intent + response',
          mistral: mistralInsight ? 'planning' : 'not used',
          elevenlabs: audioUrl ? 'voice generated' : 'not used'
        }
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}