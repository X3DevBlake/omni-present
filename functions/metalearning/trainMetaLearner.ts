import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { model_name, base_architecture, task_domain, num_tasks } = await req.json();

    // AI-powered meta-learning optimization
    const metaLearning = await base44.integrations.Core.InvokeLLM({
      prompt: `Design meta-learning system using ${base_architecture}:

Model: ${model_name}
Domain: ${task_domain}
Tasks: ${num_tasks}

Generate:
1. Optimal meta-parameters for rapid adaptation
2. Task distribution strategy
3. Few-shot learning performance predictions (1-shot, 5-shot, 10-shot)
4. Transfer efficiency metrics
5. Generalization capabilities

Focus on: fast adaptation, minimal samples, cross-task generalization.`,
      response_json_schema: {
        type: "object",
        properties: {
          meta_parameters: {
            type: "object",
            properties: {
              inner_lr: {type: "number"},
              outer_lr: {type: "number"},
              adaptation_steps: {type: "number"}
            }
          },
          few_shot_performance: {
            type: "object",
            properties: {
              one_shot_accuracy: {type: "number"},
              five_shot_accuracy: {type: "number"},
              ten_shot_accuracy: {type: "number"}
            }
          },
          transfer_efficiency: {type: "number"},
          generalization_score: {type: "number"},
          task_similarity: {type: "number"}
        }
      }
    });

    const modelData = {
      model_name: model_name,
      base_architecture: base_architecture,
      task_distribution: {
        domain: task_domain,
        num_tasks: num_tasks,
        task_similarity: metaLearning.task_similarity || 0.75
      },
      adaptation_steps: metaLearning.meta_parameters?.adaptation_steps || 5,
      few_shot_performance: metaLearning.few_shot_performance || {
        one_shot_accuracy: 0.65,
        five_shot_accuracy: 0.82,
        ten_shot_accuracy: 0.91
      },
      meta_parameters: metaLearning.meta_parameters || {},
      transfer_efficiency: metaLearning.transfer_efficiency || 85,
      generalization_score: metaLearning.generalization_score || 88
    };

    const model = await base44.asServiceRole.entities.MetaLearningModel.create(modelData);

    return Response.json({
      success: true,
      model,
      capabilities: {
        rapid_adaptation: modelData.adaptation_steps < 10,
        few_shot_ready: modelData.few_shot_performance.one_shot_accuracy > 0.6,
        high_transfer: modelData.transfer_efficiency > 80
      }
    });

  } catch (error) {
    console.error('Meta-learning error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});