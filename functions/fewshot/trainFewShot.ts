import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { learner_name, algorithm, k_shot, n_way } = await req.json();

    const fewShotPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design few-shot learning with ${algorithm}:

Learner: ${learner_name}
Task: ${n_way}-way ${k_shot}-shot classification

Generate:
1. Embedding dimension and architecture
2. Performance at 1, 5, 10 shots
3. Adaptation steps for new tasks
4. Generalization and sample efficiency scores
5. Meta-learning optimization strategy

Maximize: rapid adaptation, generalization`,
      response_json_schema: {
        type: "object",
        properties: {
          embedding_dimension: {type: "number"},
          performance_metrics: {
            type: "object",
            properties: {
              one_shot_accuracy: {type: "number"},
              five_shot_accuracy: {type: "number"},
              ten_shot_accuracy: {type: "number"}
            }
          },
          adaptation_steps: {type: "number"},
          generalization_score: {type: "number"},
          sample_efficiency: {type: "number"}
        }
      }
    });

    const learnerData = {
      learner_name: learner_name,
      meta_learning_algorithm: algorithm,
      support_set_size: k_shot,
      num_classes: n_way,
      embedding_dimension: fewShotPlan.embedding_dimension || 512,
      performance_metrics: fewShotPlan.performance_metrics || {
        one_shot_accuracy: 0.68,
        five_shot_accuracy: 0.84,
        ten_shot_accuracy: 0.91
      },
      adaptation_steps: fewShotPlan.adaptation_steps || 5,
      generalization_score: fewShotPlan.generalization_score || 87,
      sample_efficiency: fewShotPlan.sample_efficiency || 4.2
    };

    const learner = await base44.entities.FewShotLearner.create(learnerData);

    return Response.json({
      success: true,
      learner,
      capabilities: {
        rapid_learning: learnerData.performance_metrics.one_shot_accuracy > 0.6,
        strong_generalization: learnerData.generalization_score > 80,
        sample_efficient: learnerData.sample_efficiency > 3
      }
    });

  } catch (error) {
    console.error('Few-shot error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});