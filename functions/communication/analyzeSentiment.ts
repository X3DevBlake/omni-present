import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id } = await req.json();

    // Get recent messages from channel
    const messages = await base44.asServiceRole.entities.AgentMessage.filter({
      channel_id: channel_id
    }, '-created_date', 50);

    if (messages.length === 0) {
      return Response.json({ error: 'No messages found' }, { status: 404 });
    }

    // AI sentiment analysis
    const sentimentAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As an AI communication analyst, analyze the sentiment and collaboration effectiveness of these agent messages:

${messages.map((m, i) => `${i + 1}. Agent ${m.sender_agent_id}: ${m.content}`).join('\n')}

Provide:
1. Individual sentiment scores for each agent (-1 to 1)
2. Overall collaboration effectiveness (0-100)
3. Communication patterns (constructive, conflictual, neutral)
4. Potential breakdowns or misunderstandings
5. Summary of the conversation thread`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment_scores: { type: "array", items: { type: "object" } },
          collaboration_effectiveness: { type: "number" },
          communication_pattern: { type: "string" },
          potential_breakdowns: { type: "array", items: { type: "object" } },
          thread_summary: { type: "string" }
        }
      }
    });

    // Update channel with sentiment data
    await base44.asServiceRole.entities.AgentCommunicationChannel.update(channel_id, {
      sentiment_score: sentimentAnalysis.sentiment_scores.reduce((sum, s) => sum + s.sentiment, 0) / sentimentAnalysis.sentiment_scores.length,
      summary: sentimentAnalysis.thread_summary,
    });

    // Create breakdown records if detected
    if (sentimentAnalysis.potential_breakdowns && sentimentAnalysis.potential_breakdowns.length > 0) {
      for (const breakdown of sentimentAnalysis.potential_breakdowns) {
        await base44.asServiceRole.entities.CommunicationBreakdown.create({
          channel_id,
          breakdown_type: breakdown.type || 'misunderstanding',
          severity: breakdown.severity || 'medium',
          involved_agents: breakdown.agents || [],
          sentiment_scores: sentimentAnalysis.sentiment_scores,
          ai_summary: breakdown.description,
          recommended_actions: breakdown.actions || [],
          resolved: false,
        });
      }
    }

    return Response.json({
      success: true,
      sentiment_scores: sentimentAnalysis.sentiment_scores,
      collaboration_effectiveness: sentimentAnalysis.collaboration_effectiveness,
      pattern: sentimentAnalysis.communication_pattern,
      summary: sentimentAnalysis.thread_summary,
      breakdowns_detected: sentimentAnalysis.potential_breakdowns?.length || 0,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});