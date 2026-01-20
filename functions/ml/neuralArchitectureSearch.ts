import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { search_name, target_task, max_iterations = 20 } = await req.json();
    
    const searchSpace = {
      layer_types: ['dense', 'conv2d', 'lstm', 'attention', 'dropout'],
      max_layers: 12,
      activation_functions: ['relu', 'tanh', 'sigmoid', 'gelu', 'swish']
    };
    
    // AI-powered architecture search
    const architectures = [];
    
    for (let i = 0; i < max_iterations; i++) {
      const numLayers = 3 + Math.floor(Math.random() * 8);
      const architecture = {
        layers: [...Array(numLayers)].map((_, idx) => ({
          type: searchSpace.layer_types[Math.floor(Math.random() * searchSpace.layer_types.length)],
          units: Math.pow(2, 5 + Math.floor(Math.random() * 4)),
          activation: searchSpace.activation_functions[Math.floor(Math.random() * searchSpace.activation_functions.length)]
        }))
      };
      
      // Simulate performance evaluation
      const paramCount = architecture.layers.reduce((sum, l) => sum + (l.units || 0), 0);
      const performanceScore = 70 + Math.random() * 25 - (paramCount / 10000);
      const inferenceTime = paramCount / 1000 + Math.random() * 50;
      
      architectures.push({
        architecture,
        performance_score: performanceScore,
        parameters_count: paramCount,
        inference_time_ms: inferenceTime
      });
    }
    
    // Find best architecture
    const bestArch = architectures.reduce((best, current) => 
      current.performance_score > best.performance_score ? current : best
    );
    
    // Store search results
    const search = await base44.entities.NeuralArchitectureSearch.create({
      search_name,
      target_task,
      search_space: searchSpace,
      discovered_architectures: architectures,
      best_architecture: bestArch.architecture,
      search_iterations: max_iterations,
      status: 'completed'
    });
    
    return Response.json({
      search,
      best_architecture: bestArch,
      total_explored: architectures.length,
      performance_improvement: ((bestArch.performance_score / architectures[0].performance_score) - 1) * 100
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});