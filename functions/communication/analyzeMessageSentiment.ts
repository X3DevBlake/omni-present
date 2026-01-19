import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id, message_content } = await req.json();
    
    // AI sentiment and topic analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this message for sentiment, emotional tone, topics, and urgency:
      
      "${message_content}"
      
      Provide detailed analysis including sentiment score (-1 to 1), emotional tone, main topics discussed, and whether it contains urgent keywords.`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment_score: { type: "number" },
          emotional_tone: { type: "string" },
          detected_topics: { type: "array", items: { type: "string" } },
          contains_urgent_keywords: { type: "boolean" },
          priority: { type: "string" },
          suggested_responses: { type: "array", items: { type: "string" } },
          language: { type: "string" }
        }
      }
    });
    
    // Update message with analysis
    if (message_id) {
      await base44.entities.EnhancedAgentMessage.update(message_id, {
        sentiment_score: analysis.sentiment_score,
        emotional_tone: analysis.emotional_tone,
        detected_topics: analysis.detected_topics,
        contains_alert_keyword: analysis.contains_urgent_keywords,
        priority: analysis.priority,
        ai_suggested_responses: analysis.suggested_responses || [],
        language: analysis.language || 'en'
      });
    }
    
    // Check for communication breakdown indicators
    if (analysis.sentiment_score < -0.5 || analysis.contains_urgent_keywords) {
      // Create communication alert
      await base44.entities.CommunicationAlert.create({
        message_id,
        alert_type: analysis.sentiment_score < -0.5 ? 'negative_sentiment' : 'urgent_keyword',
        severity: analysis.priority === 'critical' ? 'high' : 'medium',
        description: `Detected ${analysis.emotional_tone} tone with sentiment ${analysis.sentiment_score.toFixed(2)}`,
        status: 'active'
      });
    }
    
    return Response.json({
      analysis,
      alert_triggered: analysis.sentiment_score < -0.5 || analysis.contains_urgent_keywords
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});