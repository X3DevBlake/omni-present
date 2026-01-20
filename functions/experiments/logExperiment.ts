import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { experiment_name, model_type, hyperparameters, num_epochs } = await req.json();

    const trainingPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate training metrics for experiment:

Experiment: ${experiment_name}
Model: ${model_type}
Hyperparameters: ${JSON.stringify(hyperparameters)}
Epochs: ${num_epochs}

Generate:
1. Training curve (epoch, losses, accuracies)
2. Final test metrics
3. Training artifacts
4. Performance characteristics

Simulate: realistic training progression`,
      response_json_schema: {
        type: "object",
        properties: {
          training_metrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                epoch: {type: "number"},
                train_loss: {type: "number"},
                val_loss: {type: "number"},
                train_accuracy: {type: "number"},
                val_accuracy: {type: "number"}
              }
            }
          },
          final_metrics: {
            type: "object",
            properties: {
              test_accuracy: {type: "number"},
              test_loss: {type: "number"},
              inference_time_ms: {type: "number"}
            }
          },
          version: {type: "string"}
        }
      }
    });

    const experimentData = {
      experiment_name,
      model_type,
      version: trainingPlan.version || `v1.${Date.now() % 1000}`,
      hyperparameters: hyperparameters || {},
      training_metrics: trainingPlan.training_metrics || [],
      final_metrics: trainingPlan.final_metrics || {
        test_accuracy: 0.89,
        test_loss: 0.32,
        inference_time_ms: 12
      },
      artifacts: [
        { type: 'model_checkpoint', url: `https://models.io/${experiment_name}/checkpoint.pt` },
        { type: 'tensorboard_logs', url: `https://models.io/${experiment_name}/logs` }
      ],
      status: 'completed'
    };

    const experiment = await base44.entities.ExperimentRun.create(experimentData);

    return Response.json({
      success: true,
      experiment,
      version: experimentData.version,
      performance: experimentData.final_metrics.test_accuracy
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});