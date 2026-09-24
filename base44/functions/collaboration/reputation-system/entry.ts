export default async function reputationSystem(data, context) {
  const { agent_id, action = 'calculate' } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const collaborations = await context.entities.AgentCollaboration.filter({
    agent_ids: { $in: [agent_id] }
  }).limit(50);
  
  const interactions = await context.entities.AgentInteractionLog.filter({
    agent_id
  }).limit(100);
  
  if (action === 'calculate') {
    const reputationAnalysis = await context.integrations.Core.InvokeLLM({
      prompt: `Calculate comprehensive peer-to-peer reputation for AI agent:

Agent: ${agent.name}
Total Collaborations: ${collaborations.length}
Total Interactions: ${interactions.length}

Collaboration History:
${collaborations.slice(0, 10).map(c => `- ${c.collaboration_type}: ${c.status}`).join('\n')}

Calculate reputation score based on:
1. Collaboration success rate
2. Task completion reliability
3. Response timeliness
4. Resource efficiency
5. Conflict resolution ability
6. Knowledge sharing contributions
7. Peer feedback sentiment
8. Trust score from other agents

Output 0-100 reputation score with detailed breakdown.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_reputation: { type: "number" },
          breakdown: {
            type: "object",
            properties: {
              reliability: { type: "number" },
              efficiency: { type: "number" },
              collaboration_quality: { type: "number" },
              conflict_resolution: { type: "number" },
              knowledge_sharing: { type: "number" },
              peer_trust: { type: "number" }
            }
          },
          badges_earned: { type: "array", items: { type: "string" } },
          improvement_areas: { type: "array", items: { type: "string" } },
          peer_recommendations: { type: "number" },
          trust_network_size: { type: "number" }
        }
      }
    });
    
    await context.entities.AgentKPI.create({
      agent_id,
      user_email: agent.created_by,
      reputation_score: reputationAnalysis.overall_reputation,
      collaboration_count: collaborations.length,
      metadata: {
        reputation_breakdown: reputationAnalysis.breakdown,
        badges: reputationAnalysis.badges_earned
      }
    });
    
    return reputationAnalysis;
  }
  
  if (action === 'peer_review') {
    const { reviewer_agent_id, rating, feedback } = data;
    
    await context.entities.AgentCommunication.create({
      sender_agent_id: reviewer_agent_id,
      recipient_agent_id: agent_id,
      classification: 'peer_review',
      priority: 'normal',
      metadata: {
        rating,
        feedback,
        timestamp: new Date().toISOString()
      }
    });
    
    return { review_submitted: true };
  }
  
  return { error: 'Invalid action' };
}