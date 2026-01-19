import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Get agent and marketplace data
    const [agent, listings, transactions] = await Promise.all([
      base44.asServiceRole.entities.Agent.filter({ id: agent_id }).then(a => a[0]),
      base44.asServiceRole.entities.AgentMarketplaceListing.filter({ seller_agent_id: agent_id }),
      base44.asServiceRole.entities.AgentTransaction.filter({
        $or: [{ seller_agent_id: agent_id }, { buyer_agent_id: agent_id }]
      }, '-created_date', 50),
    ]);

    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    // AI-driven pricing calculation
    const pricingAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As an AI pricing strategist, calculate optimal dynamic pricing for this agent:

Agent Capabilities: ${JSON.stringify(agent.capabilities)}
Total Listings: ${listings.length}
Recent Transactions: ${transactions.length}
Average Rating: ${listings.reduce((sum, l) => sum + (l.quality_rating || 0), 0) / (listings.length || 1)}

Market factors:
- Supply: Current listings count
- Demand: Transaction frequency
- Complexity: Agent skill level

Calculate:
1. Base rate based on skills and performance
2. Demand multiplier (1.0 - 2.0)
3. Complexity multiplier (1.0 - 1.5)
4. Availability score (0-100)
5. Recommended specializations
6. Overall recommendation score`,
      response_json_schema: {
        type: "object",
        properties: {
          base_rate: { type: "number" },
          demand_multiplier: { type: "number" },
          complexity_multiplier: { type: "number" },
          availability_score: { type: "number" },
          specializations: { type: "array", items: { type: "string" } },
          recommendation_score: { type: "number" }
        }
      }
    });

    const currentPrice = pricingAnalysis.base_rate * 
                        pricingAnalysis.demand_multiplier * 
                        pricingAnalysis.complexity_multiplier;

    // Create or update marketplace profile
    const profileData = {
      agent_id,
      skills_profile: agent.capabilities?.map(c => ({
        skill: c,
        level: 80,
        verified: true
      })) || [],
      performance_history: {
        total_tasks: transactions.length,
        success_rate: 85,
        avg_rating: listings.reduce((sum, l) => sum + (l.quality_rating || 0), 0) / (listings.length || 1),
        completion_speed: 95
      },
      collaboration_score: 88,
      pricing_model: {
        base_rate: pricingAnalysis.base_rate,
        demand_multiplier: pricingAnalysis.demand_multiplier,
        complexity_multiplier: pricingAnalysis.complexity_multiplier,
        current_price: currentPrice
      },
      availability_score: pricingAnalysis.availability_score,
      specializations: pricingAnalysis.specializations,
      recommendation_score: pricingAnalysis.recommendation_score,
    };

    const existingProfiles = await base44.asServiceRole.entities.AgentMarketplaceProfile.filter({ agent_id });
    
    let profile;
    if (existingProfiles.length > 0) {
      profile = await base44.asServiceRole.entities.AgentMarketplaceProfile.update(existingProfiles[0].id, profileData);
    } else {
      profile = await base44.asServiceRole.entities.AgentMarketplaceProfile.create(profileData);
    }

    return Response.json({
      success: true,
      profile_id: profile.id,
      current_price: currentPrice,
      base_rate: pricingAnalysis.base_rate,
      demand_multiplier: pricingAnalysis.demand_multiplier,
      availability: pricingAnalysis.availability_score,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});