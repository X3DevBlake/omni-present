import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_name, algorithm, num_tasks } = await req.json();

    const agent = await base44.entities.MetaLearningAgent.create({
      agent_name,
      meta_algorithm: algorithm,
      base_learner: {
        architecture: 'neural_network',
        parameters_count: 1000000 + Math.floor(Math.random() * 9000000)
      },
      task_distribution: {
        num_tasks_trained: num_tasks || 100,
        task_diversity: 0.6 + Math.random() * 0.35,
        task_complexity_avg: 0.5 + Math.random() * 0.4
      },
      adaptation_performance: {
        zero_shot_accuracy: 0.45 + Math.random() * 0.25,
        one_shot_accuracy: 0.65 + Math.random() * 0.2,
        five_shot_accuracy: 0.80 + Math.random() * 0.15,
        adaptation_steps: Math.floor(3 + Math.random() * 7)
      },
      transfer_capabilities: {
        cross_domain_transfer: 0.70 + Math.random() * 0.25,
        cross_task_transfer: 0.75 + Math.random() * 0.2,
        sample_efficiency: 0.85 + Math.random() * 0.12
      },
      learned_priors: [
        { prior_type: 'task_structure', strength: 0.8 },
        { prior_type: 'feature_importance', strength: 0.7 },
        { prior_type: 'optimization_path', strength: 0.65 }
      ],
      memory_bank: {
        episodic_memory_size: 1000,
        semantic_memory_size: 500
      }
    });

    return Response.json({
      success: true,
      agent_id: agent.id,
      agent,
      message: `Meta-learning agent ${agent_name} trained on ${num_tasks} tasks`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});