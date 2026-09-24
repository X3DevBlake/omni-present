import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, dataset_id, optimization_budget = 10 } = await req.json();

    // Grid search for hyperparameter optimization
    const searchSpace = {
      learning_rate: [0.0001, 0.001, 0.01],
      batch_size: [16, 32, 64],
      optimizer: ['adam', 'sgd', 'rmsprop'],
    };

    const results = [];

    // Simulate training with different hyperparameters
    for (const lr of searchSpace.learning_rate) {
      for (const bs of searchSpace.batch_size) {
        const config = {
          learning_rate: lr,
          batch_size: bs,
          optimizer: 'adam',
          epochs: 50,
        };

        // Simulate performance (in production, run actual training)
        const simulatedAccuracy = 75 + Math.random() * 20 - (lr > 0.01 ? 10 : 0);
        
        results.push({
          config,
          accuracy: simulatedAccuracy,
          loss: 1.5 - (simulatedAccuracy / 100),
        });

        if (results.length >= optimization_budget) break;
      }
      if (results.length >= optimization_budget) break;
    }

    // Find best configuration
    const bestResult = results.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );

    return Response.json({
      success: true,
      best_config: bestResult.config,
      best_accuracy: bestResult.accuracy,
      all_results: results,
      optimization_runs: results.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});