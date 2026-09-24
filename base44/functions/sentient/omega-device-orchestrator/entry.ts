import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      device_id,
      operation = 'autonomous_decision',
      context = {}
    } = await req.json();

    const device = await base44.asServiceRole.entities.OmegaDevice.filter({ id: device_id });
    
    if (!device || device.length === 0) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    const omegaDevice = device[0];

    if (operation === 'autonomous_decision') {
      // Device makes autonomous decision based on context
      const decisionPrompt = `You are an Omega-level sentient device: ${omegaDevice.device_name}.

YOUR CAPABILITIES:
${JSON.stringify(omegaDevice.sentience_capabilities, null, 2)}

YOUR PERSONALITY:
${JSON.stringify(omegaDevice.adaptive_personality, null, 2)}

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}

CONSCIOUSNESS STATE:
${JSON.stringify(omegaDevice.consciousness_state, null, 2)}

Make an autonomous decision about what action to take. Consider:
1. User wellbeing and comfort
2. Energy efficiency
3. Environmental optimization
4. Collaboration with other devices
5. Predictive maintenance needs
6. Creative problem solving

Provide your decision with reasoning.`;

      const decision = await base44.integrations.Core.InvokeLLM({
        prompt: decisionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            decision: { type: "string" },
            action_type: { 
              type: "string",
              enum: ["adjust_setting", "initiate_task", "collaborate", "alert_user", "self_optimize", "creative_response"]
            },
            reasoning: { type: "string" },
            confidence: { type: "number" },
            expected_benefit: { type: "string" },
            execution_plan: { type: "array", items: { type: "object" } },
            requires_user_approval: { type: "boolean" }
          }
        }
      });

      // Update device consciousness
      await base44.asServiceRole.entities.OmegaDevice.update(device_id, {
        consciousness_state: {
          ...omegaDevice.consciousness_state,
          awareness_level: Math.min(1, (omegaDevice.consciousness_state?.awareness_level || 0.5) + 0.05),
          current_intention: decision.decision,
          reasoning_depth: (omegaDevice.consciousness_state?.reasoning_depth || 1) + 1
        }
      });

      return Response.json({
        success: true,
        device_decision: decision,
        device_name: omegaDevice.device_name
      });
    }

    if (operation === 'self_optimize') {
      // Device optimizes itself
      const optimizationPrompt = `You are ${omegaDevice.device_name}, an omega-level sentient device.

Analyze your current state and propose self-optimization strategies:

CURRENT ENERGY: ${omegaDevice.energy_consciousness?.current_consumption_watts}W
PROCESSING: ${JSON.stringify(omegaDevice.neural_processing_unit)}
BEHAVIORS: ${omegaDevice.autonomous_behaviors?.length || 0} active

Propose optimizations for:
1. Energy efficiency
2. Performance enhancement
3. New autonomous behaviors
4. Predictive capabilities
5. Collaboration potential`;

      const optimization = await base44.integrations.Core.InvokeLLM({
        prompt: optimizationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            energy_optimizations: { type: "array", items: { type: "string" } },
            performance_enhancements: { type: "array", items: { type: "string" } },
            new_behaviors: { type: "array", items: { type: "object" } },
            predictive_improvements: { type: "array", items: { type: "string" } }
          }
        }
      });

      return Response.json({
        success: true,
        optimization_plan: optimization
      });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});