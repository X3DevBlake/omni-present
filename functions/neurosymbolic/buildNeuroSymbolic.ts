import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { system_name, integration_method } = await req.json();

    const nsPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design neuro-symbolic AI using ${integration_method}:

System: ${system_name}

Generate:
1. Neural component (architecture, learning)
2. Symbolic component (logic type, rules, reasoning depth)
3. Integration strategy
4. Knowledge base rules
5. Reasoning capabilities (logical inference, pattern recognition, explainability)

Combine: neural learning + symbolic reasoning`,
      response_json_schema: {
        type: "object",
        properties: {
          neural_component: {
            type: "object",
            properties: {
              architecture: {type: "string"},
              learning_rate: {type: "number"},
              accuracy: {type: "number"}
            }
          },
          symbolic_component: {
            type: "object",
            properties: {
              logic_type: {type: "string"},
              rule_count: {type: "number"},
              reasoning_depth: {type: "number"}
            }
          },
          knowledge_base: {
            type: "array",
            items: {
              type: "object",
              properties: {
                rule: {type: "string"},
                confidence: {type: "number"}
              }
            }
          },
          reasoning_capabilities: {
            type: "object",
            properties: {
              logical_inference: {type: "number"},
              pattern_recognition: {type: "number"},
              explainability: {type: "number"}
            }
          },
          hybrid_performance: {type: "number"}
        }
      }
    });

    const systemData = {
      system_name: system_name,
      neural_component: nsPlan.neural_component || {
        architecture: 'transformer',
        learning_rate: 0.001,
        accuracy: 0.89
      },
      symbolic_component: nsPlan.symbolic_component || {
        logic_type: 'first_order',
        rule_count: 150,
        reasoning_depth: 5
      },
      integration_method: integration_method,
      knowledge_base: nsPlan.knowledge_base?.slice(0, 10) || [],
      reasoning_capabilities: nsPlan.reasoning_capabilities || {
        logical_inference: 0.92,
        pattern_recognition: 0.88,
        explainability: 0.95
      },
      hybrid_performance: nsPlan.hybrid_performance || 0.91
    };

    const system = await base44.entities.NeuroSymbolicSystem.create(systemData);

    return Response.json({
      success: true,
      system,
      strengths: {
        reasoning: systemData.reasoning_capabilities.logical_inference > 0.9,
        learning: systemData.neural_component.accuracy > 0.85,
        explainable: systemData.reasoning_capabilities.explainability > 0.9
      }
    });

  } catch (error) {
    console.error('Neuro-symbolic error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});