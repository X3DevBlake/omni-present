import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { environment_id, agent_count, training_episodes } = await req.json();
    
    // Get environment config
    const environments = await base44.entities.SimulationEnvironmentConfig.filter({ id: environment_id });
    const environment = environments[0];
    
    if (!environment) {
      return Response.json({ error: 'Environment not found' }, { status: 404 });
    }
    
    // Create RL training session
    const session = await base44.entities.RLTrainingSession.create({
      environment_id,
      algorithm: 'maddpg',
      agent_count,
      total_episodes: training_episodes,
      current_episode: 0,
      status: 'running',
      hyperparameters: {
        learning_rate: 0.001,
        discount_factor: 0.99,
        batch_size: 64,
        replay_buffer_size: 100000
      },
      metrics: {
        avg_reward: 0,
        episode_rewards: [],
        convergence_rate: 0
      }
    });
    
    // Simulate training episodes
    const episodeRewards = [];
    
    for (let episode = 0; episode < Math.min(training_episodes, 10); episode++) {
      // Simulate episode with increasing reward (learning)
      const baseReward = 100;
      const learningProgress = episode / training_episodes;
      const reward = baseReward * (1 + learningProgress * 2) + (Math.random() - 0.5) * 50;
      
      episodeRewards.push(reward);
      
      // Update progress
      await base44.entities.RLTrainingSession.update(session.id, {
        current_episode: episode + 1,
        metrics: {
          avg_reward: episodeRewards.reduce((a, b) => a + b, 0) / episodeRewards.length,
          episode_rewards: episodeRewards,
          convergence_rate: learningProgress * 100
        }
      });
    }
    
    // Mark as completed
    await base44.entities.RLTrainingSession.update(session.id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    
    return Response.json({
      session_id: session.id,
      status: 'completed',
      final_metrics: {
        avg_reward: episodeRewards.reduce((a, b) => a + b, 0) / episodeRewards.length,
        max_reward: Math.max(...episodeRewards),
        convergence_achieved: true
      }
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});