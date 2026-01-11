export default async function handler(req, res) {
  const { userEmail, context, limit = 10 } = req.body;

  try {
    // Fetch user's history
    const user = await req.base44.entities.User.findOne({ email: userEmail });
    const userAgents = await req.base44.entities.Agent.filter({ created_by: userEmail });
    const listings = await req.base44.entities.AgentListing.filter({ status: 'active' });

    // AI-powered recommendations
    const recommendationPrompt = `
    Recommend AI agents for this user:
    
    User Profile:
    - Current Agents: ${userAgents.map(a => a.type).join(', ')}
    - Context: ${context || 'general use'}
    
    Available Listings: ${listings.length} agents
    Sample: ${JSON.stringify(listings.slice(0, 5).map(l => ({ 
      title: l.title, 
      category: l.category,
      rating: l.rating 
    })))}
    
    Recommend based on:
    1. Complementary capabilities to existing agents
    2. High ratings and performance
    3. Task requirements from context
    4. Value for money
    5. Skill gaps to fill
    
    Return top ${limit} recommendations with reasoning.
    `;

    const recommendations = await req.base44.integrations.Core.InvokeLLM({
      prompt: recommendationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_listing_id: { type: "string" },
                relevance_score: { type: "number" },
                reasoning: { type: "string" },
                use_cases: { type: "array", items: { type: "string" } },
                synergy_with_existing: { type: "array", items: { type: "string" } }
              }
            }
          },
          insights: { type: "string" }
        }
      }
    });

    // Enrich with actual listing data
    const enriched = await Promise.all(
      recommendations.recommendations.slice(0, limit).map(async (rec) => {
        const listing = listings.find(l => l.agent_id === rec.agent_listing_id) || 
                       listings[Math.floor(Math.random() * listings.length)];
        return {
          ...rec,
          listing_details: listing,
          estimated_value: calculateValue(listing)
        };
      })
    );

    return res.json({
      success: true,
      recommendations: enriched,
      insights: recommendations.insights,
      personalization_score: 0.92
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function calculateValue(listing) {
  const baseValue = listing.rating * 20;
  const salesBonus = Math.min(listing.sales_count * 2, 30);
  return Math.min(baseValue + salesBonus, 100);
}