import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_name, model_type, hyperparameters, total_epochs } = await req.json();

    // Create training session
    const session = await base44.entities.ModelTrainingSession.create({
      session_name,
      model_type,
      status: 'training',
      current_epoch: 0,
      total_epochs,
      hyperparameters,
      metrics: {
        loss: Math.random() * 0.5,
        accuracy: 0.5 + Math.random() * 0.3,
        validation_loss: Math.random() * 0.6,
        validation_accuracy: 0.4 + Math.random() * 0.3,
        learning_rate: hyperparameters.learning_rate || 0.001
      },
      gradient_flow: Array.from({ length: 10 }, (_, i) => ({
        layer: `layer_${i}`,
        gradient_norm: Math.random() * 2
      })),
      resource_usage: {
        gpu_utilization: 50 + Math.random() * 40,
        memory_usage_gb: 8 + Math.random() * 8,
        estimated_time_remaining: total_epochs * 120
      }
    });

    // Simulate training progress updates
    for (let epoch = 1; epoch <= Math.min(5, total_epochs); epoch++) {
      await base44.entities.ModelTrainingSession.update(session.id, {
        current_epoch: epoch,
        metrics: {
          loss: Math.max(0.1, session.metrics.loss - Math.random() * 0.05),
          accuracy: Math.min(0.95, session.metrics.accuracy + Math.random() * 0.05),
          validation_loss: Math.max(0.15, session.metrics.validation_loss - Math.random() * 0.04),
          validation_accuracy: Math.min(0.92, session.metrics.validation_accuracy + Math.random() * 0.04),
          learning_rate: hyperparameters.learning_rate * Math.pow(0.95, epoch)
        },
        resource_usage: {
          gpu_utilization: 60 + Math.random() * 35,
          memory_usage_gb: 10 + Math.random() * 6,
          estimated_time_remaining: (total_epochs - epoch) * 120
        }
      });
    }

    return Response.json({
      success: true,
      session_id: session.id,
      message: `Training session ${session_name} started for ${model_type}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});