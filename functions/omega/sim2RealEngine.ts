import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      action,
      swarm_id,
      simulation_environment = 'isaac_sim',
      training_config
    } = await req.json();

    if (action === 'initialize_training') {
      // Create new training session with domain randomization
      const session = await base44.asServiceRole.entities.Sim2RealTrainingSession.create({
        session_id: `sim2real_${Date.now()}`,
        swarm_id,
        simulation_environment,
        domain_randomization_config: {
          physics_parameters: {
            mass_range: [0.8, 1.2],
            friction_range: [0.3, 0.7],
            laser_power_variation: 0.2,
            drag_coefficient_variance: 0.15
          },
          randomization_strength: training_config?.randomization_strength || 0.2
        },
        policy_training: {
          policy_type: training_config?.policy_type || 'PPO',
          training_iterations: 0,
          reward_function: 'trajectory_accuracy + stability_bonus',
          expected_reward: 0
        },
        adversarial_adaptation: {
          discriminator_enabled: true,
          discriminator_accuracy: 0.5,
          sim_vs_real_plausibility_score: 0
        },
        reality_gap_metrics: {
          transfer_success_rate: 0,
          sim_performance: 0,
          real_performance: 0,
          gap_size: 1.0
        },
        training_trajectory: [],
        deployment_readiness: 0,
        session_status: 'training'
      });

      return Response.json({
        success: true,
        session_id: session.session_id,
        message: 'Sim2Real training initialized with domain randomization'
      });
    }

    if (action === 'train_episode') {
      const { session_id, episode_count = 100 } = await req.json();
      
      const sessions = await base44.entities.Sim2RealTrainingSession.filter({ session_id });
      const session = sessions[0];
      
      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }
      
      // Simulate training episodes
      const trajectory = [];
      let cumulative_reward = 0;
      
      for (let episode = 0; episode < episode_count; episode++) {
        // Domain randomization - vary physics
        const mass_factor = 0.8 + Math.random() * 0.4;
        const friction_factor = 0.3 + Math.random() * 0.4;
        
        // Simulate reward (improves over time)
        const base_reward = 50 + episode * 0.5;
        const noise = (Math.random() - 0.5) * 10;
        const reward = base_reward + noise;
        cumulative_reward += reward;
        
        // Simulate loss (decreases over time)
        const loss = Math.max(0.1, 5 - episode * 0.04);
        
        trajectory.push({
          episode,
          reward,
          loss,
          sim_params: {
            mass_factor,
            friction_factor,
            laser_power: 45 + Math.random() * 10
          }
        });
      }
      
      // Calculate metrics
      const avg_reward = cumulative_reward / episode_count;
      const sim_performance = Math.min(1, avg_reward / 100);
      
      // Simulate real-world transfer
      const reality_gap_size = 0.3 - (episode_count / 1000); // Gap closes with more training
      const real_performance = Math.max(0, sim_performance - reality_gap_size);
      const transfer_success_rate = real_performance / sim_performance;
      
      // Adversarial discriminator accuracy (should approach 0.5 = can't distinguish)
      const discriminator_accuracy = 0.5 + (0.3 * Math.exp(-episode_count / 200));
      
      const deployment_readiness = transfer_success_rate * 100;
      
      await base44.asServiceRole.entities.Sim2RealTrainingSession.update(session.id, {
        training_trajectory: trajectory,
        'policy_training.training_iterations': episode_count,
        'policy_training.expected_reward': avg_reward,
        'reality_gap_metrics.transfer_success_rate': transfer_success_rate,
        'reality_gap_metrics.sim_performance': sim_performance,
        'reality_gap_metrics.real_performance': real_performance,
        'reality_gap_metrics.gap_size': reality_gap_size,
        'adversarial_adaptation.discriminator_accuracy': discriminator_accuracy,
        'adversarial_adaptation.sim_vs_real_plausibility_score': 1 - discriminator_accuracy,
        deployment_readiness,
        session_status: deployment_readiness > 90 ? 'deployed' : 'training'
      });

      return Response.json({
        success: true,
        training_complete: true,
        episodes_trained: episode_count,
        metrics: {
          avg_reward,
          sim_performance,
          real_performance,
          transfer_success_rate,
          reality_gap_size,
          discriminator_accuracy,
          deployment_readiness
        },
        trajectory: trajectory.slice(-10) // Last 10 episodes
      });
    }

    return Response.json({ 
      error: 'Invalid action. Use "initialize_training" or "train_episode"' 
    }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});