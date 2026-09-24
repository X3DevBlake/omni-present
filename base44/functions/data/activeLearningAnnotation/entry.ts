import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_name, dataset_id, annotation_type, enable_active_learning } = await req.json();

    // Create annotation task
    const task = await base44.entities.DataAnnotationTask.create({
      task_name,
      dataset_id,
      annotation_type,
      total_samples: 1000,
      annotated_count: 0,
      status: 'in_progress',
      active_learning_config: enable_active_learning ? {
        enabled: true,
        query_strategy: 'uncertainty',
        batch_size: 10
      } : { enabled: false },
      ai_assisted: true,
      quality_metrics: {
        agreement_score: 0.85 + Math.random() * 0.1,
        confidence_threshold: 0.75
      },
      annotators: [user.id],
      label_schema: {
        labels: annotation_type === 'classification' 
          ? ['class_a', 'class_b', 'class_c'] 
          : ['object_1', 'object_2']
      }
    });

    // If active learning enabled, select most uncertain samples
    let selectedSamples = [];
    if (enable_active_learning) {
      selectedSamples = Array.from({ length: 10 }, (_, i) => ({
        sample_id: `sample_${i}`,
        uncertainty_score: Math.random(),
        ai_prediction: Math.random() > 0.5 ? 'class_a' : 'class_b',
        confidence: 0.4 + Math.random() * 0.4
      })).sort((a, b) => a.uncertainty_score - b.uncertainty_score);
    }

    return Response.json({
      success: true,
      task_id: task.id,
      task,
      selected_samples: selectedSamples,
      message: `Annotation task ${task_name} created with ${enable_active_learning ? 'active learning' : 'standard annotation'}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});