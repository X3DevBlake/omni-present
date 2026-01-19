import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, training_type, dataset_id, hyperparameters } = await req.json();

    // Create training session
    const session = await base44.asServiceRole.entities.AgentTrainingSession.create({
      agent_id,
      training_type,
      dataset_id,
      hyperparameters: hyperparameters || {
        learning_rate: 0.001,
        batch_size: 32,
        epochs: 100,
        optimizer: 'adam',
      },
      status: 'running',
      total_epochs: hyperparameters?.epochs || 100,
      current_epoch: 0,
      model_version: `v${Date.now()}`,
    });

    // Simulate training process with convergence data
    const convergenceData = [];
    const epochs = hyperparameters?.epochs || 100;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      const progress = epoch / epochs;
      const loss = 1.5 * Math.exp(-progress * 3) + 0.05 + (Math.random() - 0.5) * 0.05;
      const accuracy = 50 + (progress * 45) + (Math.random() - 0.5) * 2;
      
      convergenceData.push({
        epoch,
        loss: parseFloat(loss.toFixed(4)),
        accuracy: parseFloat(accuracy.toFixed(2)),
        learning_rate: hyperparameters?.learning_rate || 0.001,
      });
    }

    // Update session with results
    await base44.asServiceRole.entities.AgentTrainingSession.update(session.id, {
      status: 'completed',
      current_epoch: epochs,
      current_loss: convergenceData[epochs - 1].loss,
      current_accuracy: convergenceData[epochs - 1].accuracy,
      best_accuracy: Math.max(...convergenceData.map(d => d.accuracy)),
      convergence_data: convergenceData,
    });

    return Response.json({
      success: true,
      session_id: session.id,
      final_accuracy: convergenceData[epochs - 1].accuracy,
      final_loss: convergenceData[epochs - 1].loss,
      training_time: `${epochs * 0.5}s`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});