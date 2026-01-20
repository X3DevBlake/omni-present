import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { architecture_name, agent_id } = await req.json();

    // AI-powered cognitive architecture design
    const cognitiveDesign = await base44.integrations.Core.InvokeLLM({
      prompt: `Design advanced cognitive architecture for AI agent:

Architecture: ${architecture_name}
Agent: ${agent_id}

Create comprehensive cognitive system with:
1. Working memory (capacity, decay)
2. Long-term memory (episodic, semantic, procedural)
3. Reasoning modules (deductive, inductive, abductive)
4. Attention mechanism
5. Metacognition capabilities

Optimize for: human-like reasoning, self-awareness, adaptive learning.`,
      response_json_schema: {
        type: "object",
        properties: {
          working_memory: {
            type: "object",
            properties: {
              capacity: {type: "number"},
              decay_rate: {type: "number"}
            }
          },
          reasoning_modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_name: {type: "string"},
                reasoning_type: {type: "string"},
                active: {type: "boolean"}
              }
            }
          },
          attention_weights: {
            type: "array",
            items: {type: "number"}
          },
          metacognition_level: {type: "number"}
        }
      }
    });

    const architectureData = {
      architecture_name: architecture_name,
      working_memory: {
        capacity: cognitiveDesign.working_memory?.capacity || 7,
        current_contents: [],
        decay_rate: cognitiveDesign.working_memory?.decay_rate || 0.1
      },
      long_term_memory: {
        episodic: [],
        semantic: {},
        procedural: []
      },
      reasoning_modules: cognitiveDesign.reasoning_modules || [
        { module_name: 'deductive', reasoning_type: 'logical', active: true },
        { module_name: 'inductive', reasoning_type: 'pattern', active: true },
        { module_name: 'abductive', reasoning_type: 'inference', active: true }
      ],
      attention_mechanism: {
        focus_targets: [],
        attention_weights: cognitiveDesign.attention_weights || [1.0, 0.5, 0.3]
      },
      metacognition: {
        self_awareness_level: cognitiveDesign.metacognition_level || 0.7,
        confidence_calibration: 0.85,
        strategy_selection: 'adaptive'
      },
      cognitive_load: 0.3
    };

    const architecture = await base44.asServiceRole.entities.CognitiveArchitecture.create(architectureData);

    return Response.json({
      success: true,
      architecture,
      capabilities: {
        reasoning_types: architectureData.reasoning_modules.length,
        memory_capacity: architectureData.working_memory.capacity,
        self_aware: architectureData.metacognition.self_awareness_level > 0.5
      }
    });

  } catch (error) {
    console.error('Cognitive architecture error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});