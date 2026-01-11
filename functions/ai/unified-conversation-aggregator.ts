export default async function unifiedConversationAggregator(request, context) {
  const { timeRange = '24h' } = request.body;

  try {
    // Calculate time filter
    const hoursAgo = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    // Aggregate all conversation types
    const [
      geminiInteractions,
      aiConversations,
      voiceMessages,
      twilioMessages,
      autonomousConversations,
      deviceControls
    ] = await Promise.all([
      context.entities.GeminiInteraction.list('-created_date', 50),
      context.entities.AIConversation.list('-created_date', 50),
      context.entities.VoiceMessage.list('-created_date', 50),
      context.entities.TwilioMessage.list('-created_date', 50),
      context.entities.AutonomousConversation.list('-created_date', 50),
      context.entities.DeviceControl.list('-created_date', 50)
    ]);

    // Unify into timeline format
    const unifiedTimeline = [];

    // Gemini interactions
    geminiInteractions.forEach(interaction => {
      unifiedTimeline.push({
        id: interaction.id,
        type: 'gemini',
        timestamp: interaction.created_date,
        content: interaction.prompt,
        response: interaction.response,
        sentiment: 'neutral',
        autonomous: interaction.autonomous,
        metadata: {
          model: interaction.model_used,
          interactionType: interaction.interaction_type,
          tokens: interaction.tokens_used
        }
      });
    });

    // AI conversations
    aiConversations.forEach(conv => {
      conv.messages?.forEach(msg => {
        unifiedTimeline.push({
          id: `${conv.id}-${msg.id}`,
          type: 'chat',
          timestamp: msg.timestamp,
          content: msg.content,
          sender: msg.sender,
          sentiment: msg.sentiment || conv.sentiment_analysis?.overall,
          autonomous: false,
          metadata: {
            conversationId: conv.id,
            aiEnhanced: msg.aiEnhanced,
            hasAudio: !!msg.audioUrl
          }
        });
      });
    });

    // Voice messages
    voiceMessages.forEach(voice => {
      unifiedTimeline.push({
        id: voice.id,
        type: 'voice',
        timestamp: voice.created_date,
        content: voice.text_content,
        audioUrl: voice.audio_url,
        autonomous: !!voice.agent_id,
        metadata: {
          voiceId: voice.voice_id,
          duration: voice.duration_seconds,
          status: voice.status
        }
      });
    });

    // Twilio SMS
    twilioMessages.forEach(sms => {
      unifiedTimeline.push({
        id: sms.id,
        type: 'sms',
        timestamp: sms.created_date,
        content: sms.message,
        recipient: sms.to_number,
        autonomous: sms.autonomous,
        metadata: {
          twilioSid: sms.twilio_sid,
          aiGenerated: sms.ai_generated,
          status: sms.status
        }
      });
    });

    // Autonomous conversations
    autonomousConversations.forEach(conv => {
      conv.transcript?.forEach(turn => {
        unifiedTimeline.push({
          id: `${conv.id}-${turn.timestamp}`,
          type: 'autonomous',
          timestamp: turn.timestamp,
          content: turn.content,
          role: turn.role,
          audioUrl: turn.audio,
          autonomous: true,
          metadata: {
            conversationId: conv.id,
            deviceId: conv.device_id,
            sentiment: conv.sentiment
          }
        });
      });
    });

    // Device controls
    deviceControls.forEach(control => {
      unifiedTimeline.push({
        id: control.id,
        type: 'device_control',
        timestamp: control.created_date,
        content: control.command,
        autonomous: !control.voice_initiated,
        metadata: {
          commandType: control.command_type,
          deviceId: control.device_id,
          status: control.status
        }
      });
    });

    // Sort by timestamp
    unifiedTimeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate statistics
    const stats = {
      total: unifiedTimeline.length,
      byType: {
        gemini: unifiedTimeline.filter(i => i.type === 'gemini').length,
        chat: unifiedTimeline.filter(i => i.type === 'chat').length,
        voice: unifiedTimeline.filter(i => i.type === 'voice').length,
        sms: unifiedTimeline.filter(i => i.type === 'sms').length,
        autonomous: unifiedTimeline.filter(i => i.type === 'autonomous').length,
        deviceControl: unifiedTimeline.filter(i => i.type === 'device_control').length
      },
      autonomous: unifiedTimeline.filter(i => i.autonomous).length,
      sentiment: {
        positive: unifiedTimeline.filter(i => i.sentiment === 'positive').length,
        neutral: unifiedTimeline.filter(i => i.sentiment === 'neutral').length,
        negative: unifiedTimeline.filter(i => i.sentiment === 'negative').length
      }
    };

    return {
      statusCode: 200,
      body: {
        timeline: unifiedTimeline,
        stats: stats,
        timeRange: timeRange
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}