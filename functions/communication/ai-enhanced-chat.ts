export default async function aiEnhancedChat(request, context) {
  const { conversationId, message, generateVoice = false, participants = [] } = request.body;

  const geminiKey = context.secrets.GEMINI_API_KEY;
  const geminiModel = context.secrets.GEMINI_MODEL || 'gemini-1.5-flash-latest';

  if (!geminiKey) {
    return { statusCode: 400, body: { error: 'GEMINI_API_KEY not configured' } };
  }

  try {
    let conversation;
    
    // Get or create conversation
    if (conversationId) {
      conversation = await context.entities.AIConversation.get(conversationId);
    } else {
      conversation = await context.entities.AIConversation.create({
        user_email: context.user.email,
        conversation_name: `Chat ${new Date().toISOString()}`,
        participants: [context.user.email, ...participants],
        messages: [],
        ai_enhanced: true,
        voice_enabled: generateVoice
      });
    }

    // Build context from conversation history
    const conversationContext = conversation.messages
      .slice(-10)
      .map(m => `${m.sender}: ${m.content}`)
      .join('\n');

    // Enhance message with Gemini
    const enhancementPrompt = `You are an AI communication assistant. Analyze and enhance this message for clarity, tone, and effectiveness.

Conversation context:
${conversationContext}

New message: "${message}"

Provide:
1. Enhanced version of the message
2. Sentiment analysis
3. Suggested improvements
4. Translation if needed

Format as JSON: {"enhanced": "", "sentiment": "", "suggestions": [], "translation": ""}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: enhancementPrompt }] }]
        })
      }
    );

    if (!geminiResponse.ok) throw new Error('Gemini API error');

    const geminiData = await geminiResponse.json();
    const enhancement = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let enhancedData;
    try {
      enhancedData = JSON.parse(enhancement);
    } catch {
      enhancedData = {
        enhanced: message,
        sentiment: 'neutral',
        suggestions: [],
        translation: ''
      };
    }

    // Generate voice if requested
    let audioUrl = null;
    if (generateVoice && context.secrets.ELEVENLABS_API_KEY) {
      const voiceResponse = await fetch('/api/functions/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: enhancedData.enhanced || message,
          stability: 0.5,
          similarityBoost: 0.7
        })
      });

      if (voiceResponse.ok) {
        const voiceData = await voiceResponse.json();
        audioUrl = voiceData.audio;
      }
    }

    // Update conversation
    const newMessage = {
      id: Date.now().toString(),
      sender: context.user.email,
      content: enhancedData.enhanced || message,
      original: message,
      timestamp: new Date().toISOString(),
      sentiment: enhancedData.sentiment,
      audioUrl: audioUrl,
      aiEnhanced: true
    };

    const updatedMessages = [...(conversation.messages || []), newMessage];

    await context.entities.AIConversation.update(conversation.id, {
      messages: updatedMessages,
      sentiment_analysis: {
        overall: enhancedData.sentiment,
        lastUpdated: new Date().toISOString()
      }
    });

    // Log Gemini interaction
    await context.entities.GeminiInteraction.create({
      user_email: context.user.email,
      interaction_type: 'chat',
      prompt: enhancementPrompt,
      response: enhancement,
      context: { conversationId: conversation.id },
      model_used: geminiModel,
      status: 'success',
      autonomous: false
    });

    return {
      statusCode: 200,
      body: {
        conversationId: conversation.id,
        message: newMessage,
        enhancement: enhancedData,
        audioUrl: audioUrl
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}