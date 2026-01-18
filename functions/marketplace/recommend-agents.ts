export default async function recommendAgents(data, context) {
  const { user_email, limit = 5 } = data;
  
  // Get user's current agents
  const userAgents = await context.entities.Agent.filter({ created_by: user_email });
  const userSkills = await context.entities.AgentSkill.filter({
    agent_id: { $in: userAgents.map(a => a.id) }
  });
  
  // Get marketplace listings
  const listings = await context.entities.AgentMarketplaceListing.filter({
    is_verified: true
  }).sort('-rating').limit(50);
  
  // Get user's recent activities to understand needs
  const recentKPIs = await context.entities.AgentKPI.filter({ user_email }).sort('-created_date').limit(10);
  
  const userSkillSet = [...new Set(userSkills.map(s => s.skill_name))];
  const avgSuccessRate = recentKPIs.reduce((sum, k) => sum + (k.success_rate || 0), 0) / (recentKPIs.length || 1);
  
  // Use AI to recommend
  const recommendations = await context.integrations.Core.InvokeLLM({
    prompt: `Recommend AI agents from a marketplace for a user.

User's current agents: ${userAgents.length}
User's skill coverage: ${userSkillSet.join(', ')}
Average success rate: ${avgSuccessRate.toFixed(1)}%

Available marketplace listings:
${listings.slice(0, 20).map(l => `
- ${l.name} (${l.category})
  Rating: ${l.rating}/5
  Downloads: ${l.downloads}
  Description: ${l.description}
`).join('\n')}

Recommend the top ${limit} agents that would:
1. Fill skill gaps
2. Complement existing agents
3. Improve overall performance
4. Match user's apparent needs

For each recommendation, explain why it's a good fit.`,
    response_json_schema: {
      type: "object",
      properties: {
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              agent_name: { type: "string" },
              match_score: { type: "number" },
              reasons: { type: "array", items: { type: "string" } },
              expected_benefits: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    }
  });
  
  // Match recommendations to actual listings
  const enrichedRecommendations = recommendations.recommendations.map(rec => {
    const listing = listings.find(l => l.name.toLowerCase().includes(rec.agent_name.toLowerCase()));
    return {
      ...rec,
      listing: listing || null
    };
  }).filter(r => r.listing !== null).slice(0, limit);
  
  return { recommendations: enrichedRecommendations };
}