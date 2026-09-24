import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, force_evolution = false } = await req.json();

    // Fetch current cognitive model
    const models = await base44.entities.SelfEvolvingCognitiveModel.filter({ agent_id });
    let currentModel = models[0];

    if (!currentModel) {
      // Create initial model
      currentModel = await base44.asServiceRole.entities.SelfEvolvingCognitiveModel.create({
        model_id: `cognitive_${agent_id}_${Date.now()}`,
        agent_id,
        version: "1.0.0",
        architecture_json: {
          layers: [
            { type: "input", size: 128 },
            { type: "hidden", size: 256, activation: "relu" },
            { type: "hidden", size: 256, activation: "relu" },
            { type: "output", size: 64, activation: "softmax" }
          ]
        },
        learning_parameters: {
          learning_rate: 0.001,
          exploration_rate: 0.2,
          memory_retention: 0.95,
          adaptation_speed: 0.5
        },
        performance_metrics: {
          accuracy: 0.75,
          response_time_ms: 150,
          decision_quality_score: 0.7,
          generalization_capability: 0.6
        },
        evolution_log: [],
        cognitive_bottlenecks: [],
        reasoning_depth: 3
      });
    }

    // Analyze performance and identify bottlenecks
    const performanceAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this cognitive model's performance and identify bottlenecks:
      
Current metrics: ${JSON.stringify(currentModel.performance_metrics)}
Architecture: ${JSON.stringify(currentModel.architecture_json)}

Identify cognitive bottlenecks and suggest improvements.`,
      response_json_schema: {
        type: "object",
        properties: {
          bottlenecks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                bottleneck_type: { type: "string" },
                severity: { type: "number" },
                proposed_solution: { type: "string" }
              }
            }
          },
          recommended_changes: { type: "array" }
        }
      }
    });

    // Determine if evolution is needed
    const shouldEvolve = force_evolution || 
      (performanceAnalysis.bottlenecks || []).some(b => b.severity > 0.7);

    if (shouldEvolve) {
      // Evolve the architecture
      const newArchitecture = { ...currentModel.architecture_json };
      
      // Example: Add a layer if complexity is needed
      if (currentModel.performance_metrics.decision_quality_score < 0.8) {
        newArchitecture.layers.splice(2, 0, {
          type: "hidden",
          size: 512,
          activation: "relu"
        });
      }

      const newVersion = `${parseFloat(currentModel.version) + 0.1}.0`;

      const evolvedModel = await base44.asServiceRole.entities.SelfEvolvingCognitiveModel.update(
        currentModel.id,
        {
          version: newVersion,
          architecture_json: newArchitecture,
          cognitive_bottlenecks: performanceAnalysis.bottlenecks || [],
          evolution_log: [
            ...(currentModel.evolution_log || []),
            {
              timestamp: new Date().toISOString(),
              change_type: "architecture_modification",
              reason: "Performance optimization based on AI analysis",
              performance_delta: 0.05
            }
          ],
          reasoning_depth: currentModel.reasoning_depth + 1
        }
      );

      return Response.json({
        success: true,
        evolved: true,
        new_version: newVersion,
        model: evolvedModel,
        improvements: performanceAnalysis.recommended_changes
      });
    }

    return Response.json({
      success: true,
      evolved: false,
      message: "Model performing well, no evolution needed",
      current_model: currentModel
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});