import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      channel_id, 
      communication_mode = 'text', // text, voice, gesture
      content,
      voice_file_url,
      gesture_data
    } = await req.json();

    let processedContent = content;

    // Process voice input
    if (communication_mode === 'voice' && voice_file_url) {
      const transcription = await base44.integrations.Core.InvokeLLM({
        prompt: 'Transcribe this voice message and extract key intent.',
        file_urls: [voice_file_url],
        response_json_schema: {
          type: "object",
          properties: {
            transcription: { type: "string" },
            intent: { type: "string" },
            sentiment: { type: "number" }
          }
        }
      });
      
      processedContent = transcription.transcription;
    }

    // Process gesture input
    if (communication_mode === 'gesture' && gesture_data) {
      const gestureInterpretation = await base44.integrations.Core.InvokeLLM({
        prompt: `Interpret this gesture data and convert to communication intent.
        
        Gesture Data: ${JSON.stringify(gesture_data)}
        
        Return interpreted message and intent.`,
        response_json_schema: {
          type: "object",
          properties: {
            interpreted_message: { type: "string" },
            intent: { type: "string" },
            confidence: { type: "number" }
          }
        }
      });
      
      processedContent = gestureInterpretation.interpreted_message;
    }

    // Analyze sentiment
    const sentiment = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze sentiment of this message: "${processedContent}"
      Return sentiment score from -1 to 1.`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment_score: { type: "number" }
        }
      }
    });

    // Save message
    const message = await base44.asServiceRole.entities.AgentMessage.create({
      channel_id,
      sender_agent_id: user.id,
      content: processedContent,
      message_type: communication_mode,
      sentiment_score: sentiment.sentiment_score,
      metadata: {
        voice_url: voice_file_url,
        gesture_data
      }
    });

    // Update channel
    const channel = await base44.entities.AgentCommunicationChannel.get(channel_id);
    await base44.asServiceRole.entities.AgentCommunicationChannel.update(channel_id, {
      message_count: (channel.message_count || 0) + 1,
      last_activity: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      message,
      processed_content: processedContent,
      sentiment: sentiment.sentiment_score
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});