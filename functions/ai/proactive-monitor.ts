export default async function proactiveMonitor(request, context) {
  const { agentId } = request.body;

  const geminiKey = context.secrets.GEMINI_API_KEY;
  const elevenLabsKey = context.secrets.ELEVENLABS_API_KEY;

  if (!geminiKey || !elevenLabsKey) {
    return { statusCode: 400, body: { error: 'API keys not configured' } };
  }

  try {
    // Gather system state
    const [agents, devices, interactions, predictions] = await Promise.all([
      context.entities.Agent.list(),
      context.entities.DeviceConnection.list(),
      context.entities.GeminiInteraction.list('-created_date', 10),
      context.entities.MarketPrediction.list('-created_date', 5)
    ]);

    // Analyze for proactive opportunities with Gemini
    const analysisPrompt = `You are a proactive AI monitoring system. Analyze the current state and identify opportunities for proactive communication.

System State:
- Active Agents: ${agents.length}
- Connected Devices: ${devices.filter(d => d.connection_status === 'connected').length}
- Recent Interactions: ${interactions.length}
- Recent Predictions: ${predictions.length}

Recent Activity:
${interactions.slice(0, 3).map(i => `- ${i.interaction_type}: ${i.prompt?.substring(0, 50)}`).join('\n')}

Identify:
1. Any anomalies or issues
2. Optimization opportunities
3. Important reminders or alerts
4. Proactive suggestions

Format as JSON: {"events": [{"type": "", "severity": "", "description": "", "action": ""}]}`;

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
    const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{"events":[]}';
    
    let result;
    try {
      result = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      result = { events: [] };
    }

    const proactiveEvents = [];

    // Process each detected event
    for (const event of result.events || []) {
      // Generate voice message for high severity events
      let audioUrl = null;
      if (['high', 'critical'].includes(event.severity)) {
        const voicePrompt = `${event.description} ${event.action || ''}`;
        
        const voiceResponse = await fetch('/api/functions/generate-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: voicePrompt })
        });

        if (voiceResponse.ok) {
          const voiceData = await voiceResponse.json();
          audioUrl = voiceData.audio;
        }
      }

      // Store proactive event
      const proactiveEvent = await context.entities.ProactiveEvent.create({
        agent_id: agentId || 'system',
        user_email: context.user.email,
        event_type: event.type || 'suggestion',
        severity: event.severity || 'medium',
        description: event.description,
        voice_message_sent: !!audioUrl,
        audio_url: audioUrl,
        status: audioUrl ? 'notified' : 'detected'
      });

      proactiveEvents.push({
        ...proactiveEvent,
        audio: audioUrl
      });
    }

    return {
      statusCode: 200,
      body: {
        eventsDetected: proactiveEvents.length,
        events: proactiveEvents,
        systemState: {
          agents: agents.length,
          devices: devices.length,
          activeConnections: devices.filter(d => d.connection_status === 'connected').length
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