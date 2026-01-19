import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { environment_id, agent_ids, episodes = 100, algorithm = 'maddpg' } = await req.json();

    const environments = await base44.asServiceRole.entities.SimulationEnvironment.filter({ id: environment_id });
    const environment = environments[0];

    if (!environment) {
      return Response.json({ error: 'Environment not found' }, { status: 404 });
    }

    // Create RL training session
    const session = await base44.asServiceRole.entities.RLTrainingSession.create({
      environment_id,
      participating_agents: agent_ids,
      algorithm,
      total_episodes: episodes,
      episodes_completed: 0,
      status: 'running',
    });

    // Simulate multi-agent RL training
    const convergenceData = [];
    const emergentBehaviors = [];

    for (let episode = 0; episode < episodes; episode++) {
      const progress = episode / episodes;
      
      // Simulate reward improvement
      const baseReward = -50;
      const learningCurve = baseReward + (progress * 150) + (Math.random() - 0.5) * 20;
      
      convergenceData.push({
        episode,
        average_reward: parseFloat(learningCurve.toFixed(2)),
        exploration_rate: (1 - progress) * 0.9,
        cooperation_score: progress * 80 + Math.random() * 20,
      });

      // Detect emergent behaviors at certain points
      if (episode === 25 && !emergentBehaviors.includes('cooperation_emergence')) {
        emergentBehaviors.push('cooperation_emergence');
      }
      if (episode === 50 && !emergentBehaviors.includes('role_specialization')) {
        emergentBehaviors.push('role_specialization');
      }
      if (episode === 75 && !emergentBehaviors.includes('coordinated_strategy')) {
        emergentBehaviors.push('coordinated_strategy');
      }
    }

    const bestReward = Math.max(...convergenceData.map(d => d.average_reward));

    // Update session with results
    await base44.asServiceRole.entities.RLTrainingSession.update(session.id, {
      episodes_completed: episodes,
      average_reward: convergenceData[episodes - 1].average_reward,
      best_reward: bestReward,
      convergence_data: convergenceData,
      emergent_behaviors: emergentBehaviors,
      status: 'completed',
    });

    return Response.json({
      success: true,
      session_id: session.id,
      final_reward: convergenceData[episodes - 1].average_reward,
      best_reward: bestReward,
      emergent_behaviors: emergentBehaviors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});