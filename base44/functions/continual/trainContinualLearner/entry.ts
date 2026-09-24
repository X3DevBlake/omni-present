import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { learner_name, learning_strategy, num_tasks } = await req.json();

    const continualPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design continual learning system using ${learning_strategy}:

Learner: ${learner_name}
Tasks: ${num_tasks} sequential tasks

Generate:
1. Anti-forgetting mechanism configuration
2. Memory buffer strategy
3. Expected catastrophic forgetting rate
4. Forward/backward transfer metrics
5. Plasticity-stability balance

Minimize: forgetting old tasks
Maximize: learning new tasks efficiently`,
      response_json_schema: {
        type: "object",
        properties: {
          task_sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: {type: "string"},
                performance: {type: "number"}
              }
            }
          },
          catastrophic_forgetting_rate: {type: "number"},
          forward_transfer: {type: "number"},
          backward_transfer: {type: "number"},
          memory_buffer: {
            type: "object",
            properties: {
              size: {type: "number"},
              retention_strategy: {type: "string"}
            }
          },
          plasticity_stability: {type: "number"}
        }
      }
    });

    const learnerData = {
      learner_name: learner_name,
      learning_strategy: learning_strategy,
      task_sequence: continualPlan.task_sequence || [],
      catastrophic_forgetting_rate: continualPlan.catastrophic_forgetting_rate || 15,
      forward_transfer: continualPlan.forward_transfer || 0.23,
      backward_transfer: continualPlan.backward_transfer || -0.08,
      memory_buffer: continualPlan.memory_buffer || {
        size: 1000,
        retention_strategy: 'reservoir_sampling'
      },
      plasticity_stability_balance: continualPlan.plasticity_stability || 0.6
    };

    const learner = await base44.entities.ContinualLearner.create(learnerData);

    return Response.json({
      success: true,
      learner,
      metrics: {
        forgetting_mitigated: learnerData.catastrophic_forgetting_rate < 20,
        positive_transfer: learnerData.forward_transfer > 0,
        memory_efficient: learnerData.memory_buffer.size < 2000
      }
    });

  } catch (error) {
    console.error('Continual learning error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});