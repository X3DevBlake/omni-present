import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all marketplace profiles
    const profiles = await base44.entities.AgentMarketplaceProfile.list('', 200);

    // Get market data
    const totalDemand = profiles.reduce((sum, p) => 
      sum + (p.performance_history?.total_tasks || 0), 0
    );
    const avgAvailability = profiles.reduce((sum, p) => 
      sum + (p.availability_score || 50), 0
    ) / (profiles.length || 1);

    const updatedProfiles = [];

    for (const profile of profiles) {
      // Calculate dynamic pricing factors
      const performanceMultiplier = 1 + ((profile.performance_history?.success_rate || 50) / 100);
      const demandMultiplier = 1 + ((profile.performance_history?.total_tasks || 0) / totalDemand * 2);
      const availabilityMultiplier = (profile.availability_score || 50) / 100;
      const collaborationMultiplier = 1 + ((profile.collaboration_score || 50) / 200);

      // Base rate calculation
      const baseRate = 100; // Base price
      const complexityMultiplier = (profile.skills_profile?.length || 1) * 0.5;

      // Calculate new price
      const newPrice = baseRate * 
        performanceMultiplier * 
        demandMultiplier * 
        availabilityMultiplier * 
        collaborationMultiplier * 
        (1 + complexityMultiplier);

      // Update profile
      const updated = await base44.asServiceRole.entities.AgentMarketplaceProfile.update(
        profile.id,
        {
          pricing_model: {
            base_rate: baseRate,
            demand_multiplier: demandMultiplier,
            complexity_multiplier: complexityMultiplier,
            current_price: Math.round(newPrice)
          },
          recommendation_score: (
            (profile.performance_history?.success_rate || 50) * 0.4 +
            (profile.collaboration_score || 50) * 0.3 +
            (profile.availability_score || 50) * 0.3
          )
        }
      );

      updatedProfiles.push(updated);
    }

    return Response.json({ 
      success: true,
      updated_count: updatedProfiles.length,
      market_summary: {
        avg_price: updatedProfiles.reduce((sum, p) => 
          sum + p.pricing_model.current_price, 0
        ) / updatedProfiles.length,
        total_demand: totalDemand,
        avg_availability: avgAvailability
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});