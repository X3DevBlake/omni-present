export default async function autonomousSmsAgent(request, context) {
  const { agentId, phoneNumber, eventType = 'alert' } = request.body;

  const geminiKey = context.secrets.GEMINI_API_KEY;
  const mistralKey = context.secrets.MISTRAL_API_KEY;
  const elevenLabsKey = context.secrets.ELEVENLABS_API_KEY;

  if (!geminiKey || !context.secrets.TWILIO_ACCOUNT_SID) {
    return { statusCode: 400, body: { error: 'Required API keys not configured' } };
  }

  try {
    // Get agent and system context
    const agent = agentId ? await context.entities.Agent.get(agentId) : null;
    const [devices, interactions, proactiveEvents] = await Promise.all([
      context.entities.DeviceConnection.list('-last_activity', 5),
      context.entities.GeminiInteraction.list('-created_date', 5),
      context.entities.ProactiveEvent.list('-created_date', 5)
    ]);

    // Use Gemini to analyze and generate SMS message
    const analysisPrompt = `You are ${agent?.name || 'an AI assistant'} tasked with autonomous SMS communication.

Event Type: ${eventType}

System Context:
- Active Devices: ${devices.length}
- Recent Interactions: ${interactions.length}
- Recent Events: ${proactiveEvents.length}

Recent Activity Summary:
${interactions.slice(0, 2).map(i => `- ${i.interaction_type}: ${i.prompt?.substring(0, 40)}`).join('\n')}
${proactiveEvents.slice(0, 2).map(e => `- ${e.event_type} (${e.severity}): ${e.description?.substring(0, 40)}`).join('\n')}

Generate a concise, professional SMS message (max 160 characters) to notify the user about current system status or important events.`;

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
    let smsMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'System update available.';
    
    // Ensure message is under 160 chars
    smsMessage = smsMessage.substring(0, 160);

    // If Mistral available, refine the message
    if (mistralKey) {
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
            messages: [{ 
              role: 'user', 
              content: `Optimize this SMS for clarity and urgency (max 160 chars): "${smsMessage}"` 
            }]
          })
        }
      );

      if (mistralResponse.ok) {
        const mistralData = await mistralResponse.json();
        const refined = mistralData.choices?.[0]?.message?.content;
        if (refined && refined.length <= 160) {
          smsMessage = refined;
        }
      }
    }

    // Send SMS via Twilio
    const smsResponse = await fetch('/api/functions/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        message: smsMessage
      })
    });

    const smsResult = await smsResponse.json();

    // Generate voice notification with ElevenLabs
    let audioUrl = null;
    if (elevenLabsKey) {
      const voiceResponse = await fetch('/api/functions/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `SMS sent: ${smsMessage}` })
      });

      if (voiceResponse.ok) {
        const voiceData = await voiceResponse.json();
        audioUrl = voiceData.audio;
      }
    }

    // Update TwilioMessage record
    if (smsResult.status === 'success') {
      await context.entities.TwilioMessage.update(
        { twilio_sid: smsResult.twilio_sid },
        {
          agent_id: agentId,
          autonomous: true,
          triggered_by: eventType,
          ai_generated: true
        }
      );
    }

    // Log the autonomous action
    await context.entities.GeminiInteraction.create({
      user_email: context.user.email,
      interaction_type: 'autonomous_action',
      prompt: `Autonomous SMS to ${phoneNumber}`,
      response: smsMessage,
      context: { 
        smsResult, 
        eventType,
        mistralUsed: !!mistralKey,
        voiceGenerated: !!audioUrl
      },
      model_used: 'gemini-1.5-flash-latest',
      status: 'success',
      autonomous: true
    });

    // Send to Zapier
    if (context.secrets.ZAPIER_WEBHOOK_URL) {
      try {
        await fetch(`${context.baseUrl}/api/functions/zapier-relay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': context.request.headers.get('Authorization') || '' },
          body: JSON.stringify({
            event: 'autonomous_sms_sent',
            agent_id: agentId || 'sms_agent',
            agent_name: agent?.name || 'SMS Agent',
            user_email: context.user.email,
            data: {
              to_number: phoneNumber,
              message: smsMessage,
              event_type: eventType,
              ai_generated: true
            }
          })
        });
      } catch {}
    }

    return {
      statusCode: 200,
      body: {
        message: smsMessage,
        smsResult: smsResult,
        audio: audioUrl,
        orchestration: {
          gemini: 'message generation',
          mistral: mistralKey ? 'refinement' : 'not used',
          twilio: smsResult.status,
          elevenlabs: audioUrl ? 'voice confirmation' : 'not used'
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