import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mechanism_name, attention_type, num_heads } = await req.json();

    const attentionPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design attention mechanism ${attention_type}:

Mechanism: ${mechanism_name}
Heads: ${num_heads}

Generate:
1. Head dimension configuration
2. Attention weight patterns (top token interactions)
3. Sparsity strategy
4. Computational complexity
5. Context length and entropy

Enable: long-range dependencies, efficient computation`,
      response_json_schema: {
        type: "object",
        properties: {
          head_dimension: {type: "number"},
          attention_weights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                query_token: {type: "string"},
                key_token: {type: "string"},
                weight: {type: "number"}
              }
            }
          },
          sparsity_pattern: {type: "string"},
          computational_complexity: {type: "string"},
          context_length: {type: "number"},
          attention_entropy: {type: "number"}
        }
      }
    });

    const mechanismData = {
      mechanism_name: mechanism_name,
      attention_type: attention_type,
      num_heads: num_heads,
      head_dimension: attentionPlan.head_dimension || 64,
      attention_weights: attentionPlan.attention_weights?.slice(0, 10) || [],
      sparsity_pattern: attentionPlan.sparsity_pattern || 'dense',
      computational_complexity: attentionPlan.computational_complexity || 'O(n^2)',
      context_length: attentionPlan.context_length || 2048,
      attention_entropy: attentionPlan.attention_entropy || 0.68
    };

    const mechanism = await base44.entities.AttentionMechanism.create(mechanismData);

    return Response.json({
      success: true,
      mechanism,
      specs: {
        total_dim: mechanismData.num_heads * mechanismData.head_dimension,
        efficient: mechanismData.sparsity_pattern !== 'dense',
        long_context: mechanismData.context_length >= 2048
      }
    });

  } catch (error) {
    console.error('Attention error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});