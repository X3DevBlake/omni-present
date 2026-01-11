export default async function autonomousCommunication(request, context) {
  const { agentId, deviceId, action = 'initiate' } = request.body;

  const elevenLabsKey = context.secrets.ELEVENLABS_API_KEY;
  const geminiKey = context.secrets.GEMINI_API_KEY;
  const geminiModel = context.secrets.GEMINI_MODEL || 'gemini-1.5-flash-latest';

  if (!elevenLabsKey || !geminiKey) {
    return { statusCode: 400, body: { error: 'API keys not configured' } };
  }

  try {
    // Get agent and device
    const agent = await context.entities.Agent.get(agentId);
    const device = await context.entities.DeviceConnection.get(deviceId);

    if (!agent || !device) {
      return { statusCode: 404, body: { error: 'Agent or device not found' } };
    }

    // Use Gemini to generate context-aware message
    const systemPrompt = `You are ${agent.name}, an autonomous AI agent. You have access to the user's device at IP ${device.ip_address}.
    
Device Info:
- Type: ${device.device_type}
- Location: ${device.location?.city || 'unknown'}
- Status: ${device.connection_status}

Your task is to autonomously communicate with the user through voice. Generate a natural, context-aware message based on:
- Current system state
- User's recent activity
- Device capabilities
- Time of day

Action: ${action}

Generate a brief, friendly message (max 100 words) to speak to the user.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      }
    );

    if (!geminiResponse.ok) throw new Error('Gemini API error');

    const geminiData = await geminiResponse.json();
    const message = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Hello!';

    // Generate voice with ElevenLabs
    const voiceResponse = await fetch('/api/functions/generate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        voiceId: agent.personality?.voice_id || context.secrets.VOICE_ID
      })
    });

    let audioUrl = null;
    if (voiceResponse.ok) {
      const voiceData = await voiceResponse.json();
      audioUrl = voiceData.audio;
    }

    // Store autonomous conversation
    await context.entities.AutonomousConversation.create({
      agent_id: agentId,
      user_email: context.user.email,
      device_id: deviceId,
      conversation_type: 'voice',
      transcript: [
        { role: 'agent', content: message, timestamp: new Date().toISOString(), audio: audioUrl }
      ],
      actions_taken: [{ action: action, timestamp: new Date().toISOString() }],
      status: 'active'
    });

    // Update device last activity
    await context.entities.DeviceConnection.update(deviceId, {
      last_activity: new Date().toISOString(),
      voice_enabled: true
    });

    return {
      statusCode: 200,
      body: {
        message: message,
        audio: audioUrl,
        agentName: agent.name,
        deviceInfo: {
          type: device.device_type,
          ip: device.ip_address,
          location: device.location
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