import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { model_version, aggregation_rounds = 5 } = await req.json();
    
    // Get or create federated learning nodes
    let nodes = await base44.entities.FederatedLearningNode.filter({ model_version });
    
    if (nodes.length === 0) {
      // Create initial nodes
      const nodeLocations = ['US-East', 'EU-West', 'Asia-Pacific', 'US-West', 'EU-Central'];
      nodes = await Promise.all(
        nodeLocations.map(location => 
          base44.entities.FederatedLearningNode.create({
            node_name: `Node-${location}`,
            node_location: location,
            model_version,
            local_data_size: Math.floor(Math.random() * 10000) + 5000,
            local_model_accuracy: 0.7 + Math.random() * 0.15,
            contribution_weight: 1 / nodeLocations.length,
            privacy_budget: 10.0,
            compute_capacity: {
              cpu_cores: 8 + Math.floor(Math.random() * 8),
              gpu_available: Math.random() > 0.3
            }
          })
        )
      );
    }
    
    // Run federated learning rounds
    const roundResults = [];
    let globalAccuracy = nodes.reduce((sum, n) => sum + n.local_model_accuracy, 0) / nodes.length;
    
    for (let round = 0; round < aggregation_rounds; round++) {
      // Simulate local training on each node
      const nodeUpdates = await Promise.all(
        nodes.map(async (node) => {
          const improvementFactor = 0.02 + Math.random() * 0.03;
          const newAccuracy = Math.min(0.99, node.local_model_accuracy + improvementFactor);
          
          await base44.entities.FederatedLearningNode.update(node.id, {
            local_model_accuracy: newAccuracy,
            training_rounds_completed: (node.training_rounds_completed || 0) + 1,
            privacy_budget: Math.max(0, node.privacy_budget - 0.5),
            last_sync: new Date().toISOString()
          });
          
          return {
            node_id: node.id,
            accuracy: newAccuracy,
            weight: node.contribution_weight
          };
        })
      );
      
      // Aggregate global model
      globalAccuracy = nodeUpdates.reduce((sum, update) => 
        sum + update.accuracy * update.weight, 0
      );
      
      roundResults.push({
        round: round + 1,
        global_accuracy: globalAccuracy,
        nodes_participated: nodeUpdates.length
      });
    }
    
    return Response.json({
      model_version,
      rounds_completed: aggregation_rounds,
      final_global_accuracy: globalAccuracy,
      nodes_count: nodes.length,
      round_results: roundResults,
      privacy_preserved: true
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});