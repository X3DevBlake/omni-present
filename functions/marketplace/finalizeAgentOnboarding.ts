import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile, pricing_model } = await req.json();

    if (!profile?.agent_name) {
      return Response.json({ error: 'profile required' }, { status: 400 });
    }

    // Create the agent
    const agent = await base44.entities.Agent.create({
      name: profile.agent_name,
      description: profile.ai_generated_description,
      capabilities: profile.verified_skills?.filter(s => s.verified).map(s => s.skill_name) || [],
      status: 'active'
    });

    // Create marketplace profile
    const marketplaceProfile = await base44.entities.AgentMarketplaceProfile.create({
      agent_id: agent.id,
      specializations: profile.specializations,
      pricing_model: {
        current_price: pricing_model.base_rate,
        base_rate: pricing_model.base_rate,
        demand_multiplier: pricing_model.demand_multiplier,
        pricing_tier: pricing_model.market_position
      },
      performance_history: {
        success_rate: 0,
        total_tasks_completed: 0,
        avg_completion_time_hours: 0
      },
      availability_score: 100,
      recommendation_score: profile.recommendation_score,
      verified_skills: profile.verified_skills?.filter(s => s.verified).map(s => s.skill_name) || [],
      onboarding_date: new Date().toISOString(),
      quality_tier: 'standard'
    });

    // Send welcome notification
    await base44.entities.UserNotification.create({
      user_email: user.email,
      notification_type: 'agent_onboarded',
      title: 'Agent Successfully Onboarded',
      message: `${profile.agent_name} is now live in the marketplace!`,
      metadata: {
        agent_id: agent.id,
        profile_id: marketplaceProfile.id
      }
    });

    return Response.json({
      success: true,
      agent,
      marketplace_profile: marketplaceProfile,
      next_steps: [
        'Monitor first tasks for performance baseline',
        'Adjust pricing based on demand',
        'Enable collaboration features',
        'Set up automated performance tracking'
      ]
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});