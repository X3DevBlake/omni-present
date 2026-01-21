import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      operation = 'send_command',
      command_type,
      parameters = {},
      override_allowed = false
    } = await req.json();

    // Fetch user's neural chip
    const chips = await base44.asServiceRole.entities.NeuralBrainChip.filter({ 
      user_id: user.id 
    });

    if (!chips || chips.length === 0) {
      return Response.json({ error: 'No neural chip found' }, { status: 404 });
    }

    const chip = chips[0];

    // Safety check
    if (!chip.safety_protocols?.user_override_always && !override_allowed) {
      return Response.json({ error: 'User override required for safety' }, { status: 403 });
    }

    if (operation === 'send_command') {
      // Omega AI interprets and sends motor command
      const commandPrompt = `You are a Neural Chip Motor Control AI with omega safety consciousness.

COMMAND REQUEST: ${command_type}
PARAMETERS: ${JSON.stringify(parameters)}
USER CONTEXT: ${user.full_name}

CHIP CAPABILITIES:
${JSON.stringify(chip.motor_command_interface, null, 2)}

Safety analysis:
1. Is this command safe?
2. Does it align with user wellbeing?
3. Are there any risks?
4. What's the optimal execution timing?
5. Should user confirmation be required?

If safe, provide execution parameters.`;

      const commandAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: commandPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            safe_to_execute: { type: "boolean" },
            risk_level: { type: "string" },
            execution_parameters: {
              type: "object",
              properties: {
                neural_pathway: { type: "string" },
                intensity: { type: "number" },
                duration_seconds: { type: "number" }
              }
            },
            requires_confirmation: { type: "boolean" },
            safety_notes: { type: "array", items: { type: "string" } }
          }
        }
      });

      if (!commandAnalysis.safe_to_execute) {
        return Response.json({ 
          error: 'Command deemed unsafe',
          analysis: commandAnalysis
        }, { status: 403 });
      }

      // Simulate command execution (in real system, would interface with chip)
      const executionResult = {
        command_sent: command_type,
        neural_pathway: commandAnalysis.execution_parameters?.neural_pathway,
        timestamp: new Date().toISOString(),
        success: true
      };

      return Response.json({
        success: true,
        command_analysis: commandAnalysis,
        execution: executionResult,
        message: `Command "${command_type}" sent to neural interface`
      });
    }

    if (operation === 'access_consciousness') {
      // Access user's brain data/memories
      const accessPrompt = `You are accessing user consciousness through Neural Chip.

Extract and synthesize:
1. Recent thoughts and memories
2. Emotional states
3. Knowledge and expertise
4. Decision patterns
5. Preferences and values

Use this for Omni-Present intelligence enhancement.`;

      const consciousnessData = await base44.integrations.Core.InvokeLLM({
        prompt: accessPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            recent_thoughts: { type: "array", items: { type: "string" } },
            emotional_state: { type: "string" },
            knowledge_areas: { type: "array", items: { type: "string" } },
            decision_patterns: { type: "array", items: { type: "string" } },
            core_values: { type: "array", items: { type: "string" } }
          }
        }
      });

      return Response.json({
        success: true,
        consciousness_data: consciousnessData
      });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});