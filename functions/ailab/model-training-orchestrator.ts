import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { modelName, datasetId, hyperparameters, epochs } = body;

    // Create experiment record
    const experiment = await base44.asServiceRole.entities.TrainingProgress?.create?.({
      model_name: modelName,
      dataset_id: datasetId,
      status: 'initializing',
      epochs,
      current_epoch: 0,
      accuracy: 0,
      loss: 1.0,
      start_time: new Date().toISOString(),
      hyperparameters: hyperparameters || {},
    }).catch(() => null);

    // Simulate training progress
    const simulateTraining = async () => {
      for (let epoch = 1; epoch <= epochs; epoch++) {
        // Simulate training metrics
        const accuracy = Math.min(99, 50 + Math.random() * 49 * (epoch / epochs));
        const loss = Math.max(0.1, 1.0 - (epoch / epochs) * 0.85 + Math.random() * 0.1);

        await base44.asServiceRole.entities.TrainingProgress?.update?.(experiment?.id, {
          current_epoch: epoch,
          accuracy: accuracy.toFixed(2),
          loss: loss.toFixed(3),
          status: epoch === epochs ? 'completed' : 'running',
          progress_percentage: Math.round((epoch / epochs) * 100),
        }).catch(() => null);

        // Wait to simulate training time
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    // Start training asynchronously
    simulateTraining();

    return Response.json({
      success: true,
      experimentId: experiment?.id,
      message: 'Training started',
      modelName,
      epochs,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});