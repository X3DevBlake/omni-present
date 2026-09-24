import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from_agent_id, to_agent_id, message_content, team_id } = await req.json();

    const sentimentAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this agent-to-agent communication for sentiment, emotion, urgency, and tone: "${message_content}"
      Provide detailed sentiment analysis for AI agent collaboration context.`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment_score: { type: "number" },
          emotion: { type: "string" },
          urgency: { type: "string" },
          tone: { type: "string" },
          collaboration_quality: { type: "number" },
          potential_issues: { type: "array", items: { type: "string" } }
        }
      }
    });

    const communication = await base44.entities.AgentCommunication.create({
      from_agent_id,
      to_agent_id,
      team_id,
      message_type: 'task_request',
      content: message_content,
      sentiment_analysis: {
        sentiment_score: sentimentAnalysis.sentiment_score,
        emotion: sentimentAnalysis.emotion,
        urgency: sentimentAnalysis.urgency,
        tone: sentimentAnalysis.tone
      },
      metadata: {
        response_time_ms: 0,
        thread_id: `thread-${Date.now()}`,
        priority: sentimentAnalysis.urgency === 'critical' ? 1 : 5
      },
      protocol_version: 'v2.0',
      encryption_enabled: true
    });

    if (team_id) {
      const team = await base44.entities.AgentTeam.filter({ id: team_id });
      if (team.length > 0) {
        const currentStats = team[0].communication_stats || {};
        await base44.entities.AgentTeam.update(team_id, {
          communication_stats: {
            total_messages: (currentStats.total_messages || 0) + 1,
            avg_sentiment: ((currentStats.avg_sentiment || 0) + sentimentAnalysis.sentiment_score) / 2,
            response_time_ms: currentStats.response_time_ms || 0
          }
        });
      }
    }

    return Response.json({
      success: true,
      communication,
      analysis: sentimentAnalysis,
      message: 'Agent communication analyzed'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});