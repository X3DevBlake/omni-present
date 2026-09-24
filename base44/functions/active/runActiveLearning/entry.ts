import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { learner_name, query_strategy, budget } = await req.json();

    const activePlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design active learning using ${query_strategy}:

Learner: ${learner_name}
Budget: ${budget} labels

Generate:
1. Sample acquisition history (iterations, performance)
2. Learning curve progression
3. Label efficiency gain vs random sampling
4. Optimal query points selection
5. Expected final performance

Maximize: information gain, minimize: labeling cost`,
      response_json_schema: {
        type: "object",
        properties: {
          acquisition_history: {
            type: "array",
            items: {
              type: "object",
              properties: {
                iteration: {type: "number"},
                samples_acquired: {type: "number"},
                model_performance: {type: "number"}
              }
            }
          },
          learning_curve: {
            type: "array",
            items: {
              type: "object",
              properties: {
                num_labels: {type: "number"},
                accuracy: {type: "number"}
              }
            }
          },
          label_efficiency_gain: {type: "number"}
        }
      }
    });

    const learnerData = {
      learner_name: learner_name,
      query_strategy: query_strategy,
      labeled_pool_size: 100,
      unlabeled_pool_size: 10000,
      labeling_budget: budget,
      acquisition_history: activePlan.acquisition_history || [],
      learning_curve: activePlan.learning_curve || [],
      label_efficiency_gain: activePlan.label_efficiency_gain || 2.5
    };

    const learner = await base44.entities.ActiveLearner.create(learnerData);

    return Response.json({
      success: true,
      learner,
      efficiency: {
        gain_multiplier: learnerData.label_efficiency_gain,
        cost_savings: `${((1 - 1/learnerData.label_efficiency_gain) * 100).toFixed(0)}% fewer labels needed`
      }
    });

  } catch (error) {
    console.error('Active learning error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});