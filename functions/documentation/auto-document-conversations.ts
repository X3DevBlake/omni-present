export default async function autoDocumentConversations(request, context) {
  const { conversationIds, docTitle } = request.body;

  const googleDocsConnected = context.secrets.GOOGLE_DOCS_ACCESS_TOKEN;
  
  if (!googleDocsConnected) {
    return { 
      statusCode: 400, 
      body: { error: 'Google Docs not connected. Please connect in settings.' } 
    };
  }

  try {
    // Aggregate conversation data
    const conversations = await context.entities.AIConversation.list('-created_date', 100);
    const geminiInteractions = await context.entities.GeminiInteraction.list('-created_date', 100);
    const voiceMessages = await context.entities.VoiceMessage.list('-created_date', 50);
    const twilioMessages = await context.entities.TwilioMessage.list('-created_date', 50);

    // Build document content
    let docContent = `# AI Conversation Documentation\n\n`;
    docContent += `Generated: ${new Date().toISOString()}\n\n`;
    docContent += `## Summary Statistics\n\n`;
    docContent += `- Total Conversations: ${conversations.length}\n`;
    docContent += `- Gemini Interactions: ${geminiInteractions.length}\n`;
    docContent += `- Voice Messages: ${voiceMessages.length}\n`;
    docContent += `- SMS Messages: ${twilioMessages.length}\n\n`;
    
    docContent += `## Detailed Conversation Log\n\n`;

    // Gemini interactions
    docContent += `### Gemini AI Interactions\n\n`;
    for (const interaction of geminiInteractions.slice(0, 20)) {
      docContent += `**${new Date(interaction.created_date).toLocaleString()}** - ${interaction.interaction_type}\n\n`;
      docContent += `Prompt: ${interaction.prompt}\n\n`;
      docContent += `Response: ${interaction.response?.substring(0, 500)}...\n\n`;
      if (interaction.autonomous) {
        docContent += `*Autonomous action*\n\n`;
      }
      docContent += `---\n\n`;
    }

    // Voice messages
    docContent += `### Voice Communications\n\n`;
    for (const voice of voiceMessages.slice(0, 20)) {
      docContent += `**${new Date(voice.created_date).toLocaleString()}**\n\n`;
      docContent += `Content: ${voice.text_content}\n\n`;
      docContent += `Duration: ${voice.duration_seconds}s | Status: ${voice.status}\n\n`;
      docContent += `---\n\n`;
    }

    // SMS messages
    docContent += `### SMS Communications\n\n`;
    for (const sms of twilioMessages.slice(0, 20)) {
      docContent += `**${new Date(sms.created_date).toLocaleString()}** → ${sms.to_number}\n\n`;
      docContent += `Message: ${sms.message}\n\n`;
      if (sms.ai_generated) {
        docContent += `*AI Generated*\n\n`;
      }
      docContent += `---\n\n`;
    }

    // Create Google Doc using access token
    const createDocResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleDocsConnected}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: docTitle || `AI Conversations - ${new Date().toISOString().split('T')[0]}`
      })
    });

    if (!createDocResponse.ok) {
      throw new Error('Failed to create Google Doc');
    }

    const docData = await createDocResponse.json();
    const documentId = docData.documentId;

    // Insert content into the document
    const requests = [{
      insertText: {
        location: { index: 1 },
        text: docContent
      }
    }];

    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleDocsConnected}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    return {
      statusCode: 200,
      body: {
        documentId,
        documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
        conversationsDocumented: conversations.length + geminiInteractions.length + voiceMessages.length + twilioMessages.length
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}