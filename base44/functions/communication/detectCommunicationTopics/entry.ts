import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id } = await req.json();

    // Get channel messages
    const channel = await base44.entities.AgentCommunicationChannel.get(channel_id);
    const messages = await base44.entities.AgentMessage.filter({ channel_id }, '-created_date', 100);

    // Use AI to identify topics
    const topicsAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the following communication messages and identify key topics being discussed. 
      For each topic provide: topic_name, keywords (array), prevalence_score (0-100), trend_direction (rising/stable/declining), and a brief summary.
      
      Messages: ${JSON.stringify(messages.slice(0, 50).map(m => m.content))}
      
      Return as JSON array of topics.`,
      response_json_schema: {
        type: "object",
        properties: {
          topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic_name: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
                prevalence_score: { type: "number" },
                trend_direction: { type: "string" },
                ai_summary: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Save detected topics
    const savedTopics = [];
    for (const topic of topicsAnalysis.topics || []) {
      const saved = await base44.asServiceRole.entities.AgentCommunicationTopic.create({
        channel_id,
        topic_name: topic.topic_name,
        keywords: topic.keywords,
        prevalence_score: topic.prevalence_score,
        trend_direction: topic.trend_direction,
        ai_summary: topic.ai_summary,
        participating_agents: channel.participant_agent_ids,
        sentiment_trend: []
      });
      savedTopics.push(saved);
    }

    return Response.json({ 
      success: true,
      topics: savedTopics,
      channel_name: channel.channel_name
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});