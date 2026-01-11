export default async function generateConversationVisuals(request, context) {
  const { conversationId, visualType = 'image' } = request.body;

  const geminiKey = context.secrets.GEMINI_API_KEY;
  
  if (!geminiKey) {
    return { statusCode: 400, body: { error: 'GEMINI_API_KEY required' } };
  }

  try {
    // Fetch conversation data
    const conversation = await context.entities.AIConversation.get(conversationId);
    
    if (!conversation) {
      return { statusCode: 404, body: { error: 'Conversation not found' } };
    }

    // Generate visual prompt using Gemini
    const promptGenerationResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a detailed visual description for this AI conversation:

Conversation: ${conversation.conversation_name}
Messages: ${conversation.messages?.length || 0}
Participants: ${conversation.participants?.join(', ') || 'N/A'}
AI Enhanced: ${conversation.ai_enhanced}
Sentiment: ${conversation.sentiment_analysis?.overall || 'neutral'}

Generate a creative, detailed prompt for ${visualType === 'image' ? 'an image' : 'a video'} that represents this conversation visually. Include colors, mood, abstract concepts.`
            }]
          }]
        })
      }
    );

    const promptData = await promptGenerationResponse.json();
    const visualPrompt = promptData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (visualType === 'image') {
      // Generate image using Core.GenerateImage
      const imageResponse = await context.integrations.Core.GenerateImage({
        prompt: visualPrompt
      });

      return {
        statusCode: 200,
        body: {
          type: 'image',
          url: imageResponse.url,
          prompt: visualPrompt,
          conversationId
        }
      };
    } else if (visualType === 'video') {
      // For video, create multiple frames
      const frames = [];
      const framePrompts = [
        `${visualPrompt} - opening scene`,
        `${visualPrompt} - mid conversation`,
        `${visualPrompt} - conclusion`
      ];

      for (const framePrompt of framePrompts) {
        const frameResponse = await context.integrations.Core.GenerateImage({
          prompt: framePrompt
        });
        frames.push(frameResponse.url);
      }

      return {
        statusCode: 200,
        body: {
          type: 'video_frames',
          frames,
          prompt: visualPrompt,
          conversationId,
          message: 'Video frames generated. Use video editing tool to combine.'
        }
      };
    }

    return { statusCode: 400, body: { error: 'Invalid visual type' } };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}