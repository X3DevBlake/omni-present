import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id } = await req.json();

    // Fetch channel messages
    const messages = await base44.asServiceRole.entities.AgentMessage.filter({ channel_id });

    if (messages.length === 0) {
      return Response.json({ error: 'No messages found' }, { status: 404 });
    }

    // Analyze sentiment using AI
    const messageContents = messages.slice(-50).map(m => m.content).join('\n');
    
    const sentimentAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze the sentiment of these agent communication messages and provide:
1. Overall sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
2. Key themes discussed
3. Collaboration effectiveness (1-10)
4. Any concerns or conflicts detected

Messages:
${messageContents}`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment_score: { type: "number" },
          themes: { type: "array", items: { type: "string" } },
          collaboration_effectiveness: { type: "number" },
          concerns: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        }
      }
    });

    // Update channel with sentiment data
    await base44.asServiceRole.entities.AgentCommunicationChannel.update(channel_id, {
      sentiment_score: sentimentAnalysis.sentiment_score,
      summary: sentimentAnalysis.summary,
      last_activity: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      ...sentimentAnalysis,
      messages_analyzed: messages.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});