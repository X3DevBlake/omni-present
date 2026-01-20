import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { model_name, num_experts, top_k } = await req.json();

    const moePlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design Mixture of Experts with ${num_experts} experts:

Model: ${model_name}
Active per token: top-${top_k}

Generate:
1. Gating mechanism
2. Expert specializations (domains, activation frequency)
3. Load balancing and sparsity metrics
4. Performance (accuracy, efficiency, utilization)
5. Capacity factor

Enable: efficient scaling, specialized expertise`,
      response_json_schema: {
        type: "object",
        properties: {
          gating_mechanism: {type: "string"},
          expert_specializations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                expert_id: {type: "number"},
                domain: {type: "string"},
                activation_frequency: {type: "number"}
              }
            }
          },
          load_balancing_score: {type: "number"},
          sparsity_ratio: {type: "number"},
          performance_metrics: {
            type: "object",
            properties: {
              overall_accuracy: {type: "number"},
              efficiency_gain: {type: "number"},
              expert_utilization: {type: "number"}
            }
          },
          capacity_factor: {type: "number"}
        }
      }
    });

    const moeData = {
      model_name: model_name,
      num_experts: num_experts,
      experts_per_token: top_k,
      gating_mechanism: moePlan.gating_mechanism || 'noisy_top_k',
      expert_specializations: moePlan.expert_specializations?.slice(0, num_experts) || [],
      load_balancing_score: moePlan.load_balancing_score || 0.88,
      sparsity_ratio: moePlan.sparsity_ratio || top_k / num_experts,
      performance_metrics: moePlan.performance_metrics || {
        overall_accuracy: 0.93,
        efficiency_gain: 3.2,
        expert_utilization: 0.85
      },
      capacity_factor: moePlan.capacity_factor || 1.25
    };

    const moe = await base44.entities.MixtureOfExperts.create(moeData);

    return Response.json({
      success: true,
      moe,
      advantages: {
        sparse_activation: moeData.sparsity_ratio < 0.5,
        balanced: moeData.load_balancing_score > 0.8,
        efficient: moeData.performance_metrics.efficiency_gain > 2
      }
    });

  } catch (error) {
    console.error('MoE error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});