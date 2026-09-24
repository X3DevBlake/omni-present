import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, swarm_id, mission_context } = await req.json();

    // Fetch agent's personalization profile
    const profiles = await base44.entities.AgentPersonalizationProfile.filter({ agent_id });
    let profile = profiles[0];

    if (!profile) {
      // Create initial profile
      profile = {
        profile_id: `profile_${Date.now()}`,
        agent_id,
        swarm_id,
        behavioral_parameters: {
          risk_tolerance: 0.5,
          cooperation_level: 0.7,
          exploration_vs_exploitation: 0.5,
          communication_frequency: 0.6,
          decision_speed_preference: 0.5
        },
        historical_performance: [],
        learned_preferences: {
          preferred_tasks: [],
          effective_teammates: [],
          optimal_environments: []
        },
        adaptation_history: [],
        specialization_score: 0.3
      };
      await base44.entities.AgentPersonalizationProfile.create(profile);
    }

    // Analyze historical performance
    const performance = profile.historical_performance || [];
    const taskSuccessRates = {};
    
    performance.forEach(task => {
      if (!taskSuccessRates[task.task_type]) {
        taskSuccessRates[task.task_type] = [];
      }
      taskSuccessRates[task.task_type].push(task.success_rate);
    });

    // Calculate optimal parameters based on performance
    const avgSuccessRate = performance.length > 0
      ? performance.reduce((sum, t) => sum + t.success_rate, 0) / performance.length
      : 0.5;

    const currentParams = profile.behavioral_parameters || {};
    const newParams = { ...currentParams };
    const adaptations = [];

    // Adjust risk tolerance based on mission context
    if (mission_context?.high_stakes) {
      const oldRisk = currentParams.risk_tolerance || 0.5;
      const newRisk = Math.max(0.2, oldRisk - 0.15);
      if (Math.abs(oldRisk - newRisk) > 0.01) {
        newParams.risk_tolerance = newRisk;
        adaptations.push({
          timestamp: new Date().toISOString(),
          parameter_changed: 'risk_tolerance',
          old_value: oldRisk,
          new_value: newRisk,
          trigger_reason: 'high_stakes_mission_detected',
          performance_delta: 0
        });
      }
    }

    // Adjust cooperation based on team dynamics
    if (mission_context?.team_oriented) {
      const oldCoop = currentParams.cooperation_level || 0.7;
      const newCoop = Math.min(0.95, oldCoop + 0.1);
      if (Math.abs(oldCoop - newCoop) > 0.01) {
        newParams.cooperation_level = newCoop;
        adaptations.push({
          timestamp: new Date().toISOString(),
          parameter_changed: 'cooperation_level',
          old_value: oldCoop,
          new_value: newCoop,
          trigger_reason: 'team_oriented_mission',
          performance_delta: 0
        });
      }
    }

    // Adjust exploration based on task familiarity
    const preferredTasks = profile.learned_preferences?.preferred_tasks || [];
    const isNovelTask = mission_context?.task_type && !preferredTasks.includes(mission_context.task_type);
    
    if (isNovelTask) {
      const oldExplore = currentParams.exploration_vs_exploitation || 0.5;
      const newExplore = Math.min(0.9, oldExplore + 0.2);
      if (Math.abs(oldExplore - newExplore) > 0.01) {
        newParams.exploration_vs_exploitation = newExplore;
        adaptations.push({
          timestamp: new Date().toISOString(),
          parameter_changed: 'exploration_vs_exploitation',
          old_value: oldExplore,
          new_value: newExplore,
          trigger_reason: 'novel_task_exploration',
          performance_delta: 0
        });
      }
    }

    // Adjust decision speed based on complexity
    if (mission_context?.complex_environment) {
      const oldSpeed = currentParams.decision_speed_preference || 0.5;
      const newSpeed = Math.max(0.3, oldSpeed - 0.15);
      if (Math.abs(oldSpeed - newSpeed) > 0.01) {
        newParams.decision_speed_preference = newSpeed;
        adaptations.push({
          timestamp: new Date().toISOString(),
          parameter_changed: 'decision_speed_preference',
          old_value: oldSpeed,
          new_value: newSpeed,
          trigger_reason: 'complex_environment_deliberation',
          performance_delta: 0
        });
      }
    }

    // Update specialization score
    const specializationScore = preferredTasks.length > 0 
      ? Math.min(0.9, 0.3 + (preferredTasks.length * 0.1))
      : 0.3;

    // Update profile
    const updatedProfile = {
      behavioral_parameters: newParams,
      adaptation_history: [...(profile.adaptation_history || []), ...adaptations],
      specialization_score: specializationScore,
      mission_context_adjustments: [
        ...(profile.mission_context_adjustments || []),
        {
          mission_type: mission_context?.task_type || 'general',
          environmental_factors: mission_context || {},
          parameter_overrides: newParams
        }
      ]
    };

    await base44.entities.AgentPersonalizationProfile.update(profile.id, updatedProfile);

    return Response.json({
      success: true,
      agent_id,
      adaptations: adaptations.length,
      optimized_parameters: newParams,
      specialization_score: specializationScore,
      summary: `Adapted ${adaptations.length} parameters for mission context`
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to adapt agent personalization'
    }, { status: 500 });
  }
});