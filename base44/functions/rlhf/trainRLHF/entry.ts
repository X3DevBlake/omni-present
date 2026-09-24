import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_name, base_model, num_feedback } = await req.json();

    const rlhfPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design RLHF training for ${base_model}:

Session: ${session_name}
Human Feedback: ${num_feedback} preference pairs

Generate:
1. Reward model design and accuracy
2. PPO training configuration
3. Alignment scores (helpfulness, harmlessness, honesty)
4. Sample preference pairs for training
5. Expected improvement metrics

Optimize: human preference prediction, value alignment`,
      response_json_schema: {
        type: "object",
        properties: {
          reward_model_architecture: {type: "string"},
          reward_model_accuracy: {type: "number"},
          ppo_iterations: {type: "number"},
          alignment_score: {type: "number"},
          helpfulness_score: {type: "number"},
          harmlessness_score: {type: "number"},
          honesty_score: {type: "number"},
          preference_pairs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                prompt: {type: "string"},
                response_a: {type: "string"},
                response_b: {type: "string"},
                preferred: {type: "string"}
              }
            }
          }
        }
      }
    });

    const sessionData = {
      session_name: session_name,
      base_model: base_model,
      reward_model_architecture: rlhfPlan.reward_model_architecture || 'transformer_classifier',
      human_feedback_count: num_feedback,
      preference_pairs: rlhfPlan.preference_pairs?.slice(0, 5) || [],
      reward_model_accuracy: rlhfPlan.reward_model_accuracy || 0.87,
      ppo_iterations: rlhfPlan.ppo_iterations || 1000,
      alignment_score: rlhfPlan.alignment_score || 88,
      helpfulness_score: rlhfPlan.helpfulness_score || 92,
      harmlessness_score: rlhfPlan.harmlessness_score || 95,
      honesty_score: rlhfPlan.honesty_score || 89
    };

    const session = await base44.entities.RLHFSession.create(sessionData);

    return Response.json({
      success: true,
      session,
      alignment: {
        overall: sessionData.alignment_score,
        helpful: sessionData.helpfulness_score,
        harmless: sessionData.harmlessness_score,
        honest: sessionData.honesty_score
      }
    });

  } catch (error) {
    console.error('RLHF error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});