import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Get agent's current skills and transaction history
    const [skills, transactions, agentKPIs] = await Promise.all([
      base44.asServiceRole.entities.AgentSkill.filter({ agent_id }),
      base44.asServiceRole.entities.AgentTransaction.filter({ buyer_agent_id: agent_id }),
      base44.asServiceRole.entities.AgentKPI.filter({ agent_id }),
    ]);

    const listings = await base44.asServiceRole.entities.AgentMarketplaceListing.filter({ is_active: true });

    // Analyze agent needs
    const agentSkillCategories = skills.map(s => s.category).filter(Boolean);
    const lowPerformanceAreas = agentKPIs.filter(k => (k.efficiency || 0) < 70);
    
    // Score listings based on relevance
    const scoredListings = listings.map(listing => {
      let score = 0;

      // Prefer listings in categories agent lacks
      if (listing.listing_type === 'skill' && 
          !agentSkillCategories.includes(listing.compatibility_tags?.[0])) {
        score += 40;
      }

      // Boost listings that could improve low performance areas
      if (lowPerformanceAreas.length > 0) {
        score += 30;
      }

      // Factor in listing quality
      score += (listing.quality_rating || 0) * 10;

      // Prefer moderately priced items
      if (listing.price < 100) score += 15;

      // Popular items
      score += Math.min((listing.total_sales || 0) * 2, 20);

      return { ...listing, recommendation_score: score };
    });

    const recommendations = scoredListings
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 10)
      .map(listing => ({
        listing_id: listing.id,
        title: listing.title,
        price: listing.price,
        score: listing.recommendation_score,
        reason: listing.recommendation_score > 80 ? 'Highly recommended' : 
                listing.recommendation_score > 60 ? 'Good match' : 'Consider',
      }));

    return Response.json({
      success: true,
      recommendations,
      agent_needs_analysis: {
        current_skills: skills.length,
        performance_gaps: lowPerformanceAreas.length,
        previous_purchases: transactions.length,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});