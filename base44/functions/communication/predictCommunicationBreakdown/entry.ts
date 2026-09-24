import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id } = await req.json();

    // Get channel data
    const channel = await base44.entities.AgentCommunicationChannel.get(channel_id);
    const recentMessages = await base44.entities.AgentMessage.filter(
      { channel_id }, 
      '-created_date', 
      50
    );
    
    // Get sentiment trends
    const sentimentHistory = recentMessages.map(m => ({
      sentiment: m.sentiment_score || 0,
      timestamp: m.created_date
    }));

    // AI prediction
    const prediction = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this communication channel for potential breakdowns.
      
      Channel Info:
      - Type: ${channel.channel_type}
      - Participants: ${channel.participant_agent_ids?.length || 0}
      - Current Sentiment: ${channel.sentiment_score || 0}
      - Message Count: ${recentMessages.length}
      
      Recent Sentiment Trend: ${JSON.stringify(sentimentHistory.slice(-10))}
      
      Predict:
      1. Likelihood of communication breakdown (0-100)
      2. Type of breakdown (breakdown_prediction, sentiment_shift, engagement_drop, conflict_detected)
      3. Severity (low, medium, high, critical)
      4. Predicted impact
      5. Recommended actions (array)
      
      Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          breakdown_likelihood: { type: "number" },
          alert_type: { type: "string" },
          severity: { type: "string" },
          predicted_impact: { type: "string" },
          recommended_actions: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Create alert if likelihood is high
    let alert = null;
    if (prediction.breakdown_likelihood > 60) {
      alert = await base44.asServiceRole.entities.CommunicationAlert.create({
        channel_id,
        alert_type: prediction.alert_type,
        severity: prediction.severity,
        prediction_confidence: prediction.breakdown_likelihood,
        predicted_impact: prediction.predicted_impact,
        recommended_actions: prediction.recommended_actions,
        triggered_at: new Date().toISOString()
      });

      // Send webhook notification
      // In production, configure webhook URL in settings
      // await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(alert) });
    }

    return Response.json({ 
      success: true,
      prediction,
      alert
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});