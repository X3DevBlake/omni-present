import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { agent_id } = await req.json();
    
    // Get agent's communication messages
    const messages = await base44.asServiceRole.entities.EnhancedAgentMessage.filter({
      sender_id: agent_id
    });
    
    if (messages.length === 0) {
      return Response.json({ 
        message: 'No communication data found for agent',
        reputation_change: 0 
      });
    }
    
    // Calculate sentiment metrics
    const avgSentiment = messages.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / messages.length;
    const positiveMessages = messages.filter(m => (m.sentiment_score || 0) > 0.3).length;
    const negativeMessages = messages.filter(m => (m.sentiment_score || 0) < -0.3).length;
    const sentimentConsistency = 1 - (Math.abs(positiveMessages - negativeMessages) / messages.length);
    
    // AI analysis of communication quality
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze agent communication patterns for reputation scoring:
      
      Total Messages: ${messages.length}
      Average Sentiment: ${avgSentiment.toFixed(2)}
      Positive: ${positiveMessages}, Negative: ${negativeMessages}
      Consistency: ${sentimentConsistency.toFixed(2)}
      
      Calculate reputation impact and provide reasoning.`,
      response_json_schema: {
        type: "object",
        properties: {
          reputation_adjustment: { type: "number" },
          quality_score: { type: "number" },
          collaboration_score: { type: "number" },
          reasoning: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          areas_for_improvement: { type: "array", items: { type: "string" } }
        }
      }
    });
    
    // Get agent reputation
    const reputations = await base44.asServiceRole.entities.AgentReputation.filter({ agent_id });
    let reputation = reputations[0];
    
    if (!reputation) {
      reputation = await base44.asServiceRole.entities.AgentReputation.create({
        agent_id,
        reputation_score: 50,
        trust_score: 50,
        reliability_score: 50
      });
    }
    
    // Update reputation based on sentiment
    const newScore = Math.max(0, Math.min(100, 
      (reputation.reputation_score || 50) + analysis.reputation_adjustment
    ));
    
    await base44.asServiceRole.entities.AgentReputation.update(reputation.id, {
      reputation_score: newScore,
      trust_score: analysis.collaboration_score,
      sentiment_based_adjustment: analysis.reputation_adjustment,
      last_updated: new Date().toISOString()
    });
    
    // Update marketplace profile
    const profiles = await base44.asServiceRole.entities.AgentMarketplaceProfile.filter({ agent_id });
    if (profiles.length > 0) {
      await base44.asServiceRole.entities.AgentMarketplaceProfile.update(profiles[0].id, {
        collaboration_score: analysis.collaboration_score,
        recommendation_score: (analysis.quality_score + newScore) / 2
      });
    }
    
    // Create cross-hub link
    const existingLink = await base44.asServiceRole.entities.CrossHubLink.filter({
      source_hub: 'communication',
      target_hub: 'marketplace'
    });
    
    if (existingLink.length === 0) {
      await base44.asServiceRole.entities.CrossHubLink.create({
        source_hub: 'communication',
        target_hub: 'marketplace',
        data_type: 'sentiment_reputation',
        link_strength: Math.abs(analysis.reputation_adjustment) * 10,
        sync_frequency_minutes: 10,
        last_sync: new Date().toISOString(),
        correlation_coefficient: 0.75
      });
    }
    
    return Response.json({
      agent_id,
      previous_score: reputation.reputation_score,
      new_score: newScore,
      change: analysis.reputation_adjustment,
      analysis,
      messages_analyzed: messages.length
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});