import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_name, pretext_task, data_size } = await req.json();

    const sslPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design self-supervised learning using ${pretext_task}:

Task: ${task_name}
Data: ${data_size} unlabeled samples

Generate:
1. Data augmentation strategy
2. Representation quality metrics
3. Downstream task performance predictions
4. Label efficiency (performance with few labels)
5. Optimal representation dimension

Learn: from unlabeled data, transfer to downstream tasks`,
      response_json_schema: {
        type: "object",
        properties: {
          augmentation_strategy: {
            type: "array",
            items: {type: "string"}
          },
          learned_representations: {
            type: "object",
            properties: {
              embedding_quality: {type: "number"},
              clustering_score: {type: "number"},
              linear_separability: {type: "number"}
            }
          },
          downstream_performance: {type: "object"},
          label_efficiency: {type: "number"},
          representation_dimension: {type: "number"}
        }
      }
    });

    const taskData = {
      task_name: task_name,
      pretext_task: pretext_task,
      data_augmentation_strategy: sslPlan.augmentation_strategy || ['crop', 'color_jitter', 'flip', 'blur'],
      learned_representations: sslPlan.learned_representations || {
        embedding_quality: 0.88,
        clustering_score: 0.82,
        linear_separability: 0.91
      },
      downstream_performance: sslPlan.downstream_performance || {
        classification: 0.87,
        detection: 0.83,
        segmentation: 0.85
      },
      label_efficiency: sslPlan.label_efficiency || 0.92,
      training_data_size: data_size,
      representation_dimension: sslPlan.representation_dimension || 256
    };

    const task = await base44.entities.SelfSupervisedTask.create(taskData);

    return Response.json({
      success: true,
      task,
      benefits: {
        high_quality_reps: taskData.learned_representations.embedding_quality > 0.85,
        label_efficient: taskData.label_efficiency > 0.9,
        versatile: Object.keys(taskData.downstream_performance).length > 2
      }
    });

  } catch (error) {
    console.error('Self-supervised error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});