import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { model_name, training_method } = await req.json();

    const energyPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design energy-based model using ${training_method}:

Model: ${model_name}

Generate:
1. Energy function definition
2. Energy landscape (modes, range, smoothness)
3. Sampling method
4. Convergence characteristics
5. Mode coverage and spurious modes

Enable: composable models, uncertainty estimation`,
      response_json_schema: {
        type: "object",
        properties: {
          energy_function: {type: "string"},
          energy_landscape: {
            type: "object",
            properties: {
              num_modes: {type: "number"},
              energy_range: {type: "array", items: {type: "number"}},
              smoothness: {type: "number"}
            }
          },
          sampling_method: {type: "string"},
          convergence_steps: {type: "number"},
          mode_coverage: {type: "number"},
          spurious_modes: {type: "number"}
        }
      }
    });

    const modelData = {
      model_name: model_name,
      energy_function: energyPlan.energy_function || 'E(x) = -log p(x)',
      training_method: training_method,
      energy_landscape: energyPlan.energy_landscape || {
        num_modes: 5,
        energy_range: [-10, 10],
        smoothness: 0.75
      },
      sampling_method: energyPlan.sampling_method || 'Langevin',
      convergence_steps: energyPlan.convergence_steps || 1000,
      mode_coverage: energyPlan.mode_coverage || 92,
      spurious_modes: energyPlan.spurious_modes || 2
    };

    const model = await base44.entities.EnergyBasedModel.create(modelData);

    return Response.json({
      success: true,
      model,
      quality: {
        good_coverage: modelData.mode_coverage > 85,
        few_spurious: modelData.spurious_modes < 5,
        fast_sampling: modelData.convergence_steps < 2000
      }
    });

  } catch (error) {
    console.error('Energy model error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});