export default async function conversationalAI(request, context) {
  const { text, agentId, deviceId, conversationId } = request.body;

  const apiKey = context.secrets.ELEVENLABS_API_KEY;
  const agentIdEL = context.secrets.ELEVENLABS_AGENT_ID; // Conversational AI agent ID

  if (!apiKey || !agentIdEL) {
    return {
      statusCode: 400,
      body: { error: 'ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID required' }
    };
  }

  try {
    // Get agent and device context
    const agent = agentId ? await context.entities.Agent.get(agentId) : null;
    const device = deviceId ? await context.entities.DeviceConnection.get(deviceId) : null;

    // Build context for ElevenLabs
    const contextData = {
      userName: context.user.email,
      agentName: agent?.name || 'AI Assistant',
      deviceInfo: device?.device_type || 'unknown',
      location: device?.location?.city || 'unknown'
    };

    // Call ElevenLabs Conversational AI API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: agentIdEL,
          text: text,
          conversation_id: conversationId || undefined,
          context: contextData
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Store or update autonomous conversation
    if (conversationId) {
      const existing = await context.entities.AutonomousConversation.get(conversationId);
      await context.entities.AutonomousConversation.update(conversationId, {
        transcript: [
          ...(existing.transcript || []),
          { role: 'user', content: text, timestamp: new Date().toISOString() },
          { role: 'agent', content: data.response, timestamp: new Date().toISOString() }
        ]
      });
    } else {
      await context.entities.AutonomousConversation.create({
        agent_id: agentId || 'system',
        user_email: context.user.email,
        device_id: deviceId,
        conversation_type: 'voice',
        elevenlabs_session_id: data.conversation_id,
        transcript: [
          { role: 'user', content: text, timestamp: new Date().toISOString() },
          { role: 'agent', content: data.response, timestamp: new Date().toISOString() }
        ],
        status: 'active'
      });
    }

    return {
      statusCode: 200,
      body: {
        response: data.response,
        conversationId: data.conversation_id,
        audio: data.audio || null
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}