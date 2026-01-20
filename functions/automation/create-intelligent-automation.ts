import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { automation_goal, target_entities, expected_outcome } = await req.json();

    // Use AI to design optimal automation
    const automationData = await base44.integrations.Core.InvokeLLM({
      prompt: `Design an intelligent automation system for: ${automation_goal}. Target entities: ${target_entities.join(', ')}. Expected outcome: ${expected_outcome}.
      
Provide: automation name, trigger type, trigger conditions (as object), 5 sequential actions (each with action_type, target, and parameters), and 3 optimization suggestions.`,
      response_json_schema: {
        type: "object",
        properties: {
          automation_name: { type: "string" },
          trigger_type: { type: "string" },
          trigger_conditions: { type: "object" },
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action_type: { type: "string" },
                target: { type: "string" },
                parameters: { type: "object" },
                order: { type: "number" }
              }
            }
          },
          optimizations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Create automation rule
    const automation = await base44.entities.AutomationRule.create({
      rule_name: automationData.automation_name,
      trigger_type: automationData.trigger_type,
      trigger_config: automationData.trigger_conditions,
      actions: automationData.actions,
      execution_stats: {
        total_executions: 0,
        success_count: 0,
        failure_count: 0,
        avg_duration_ms: 0
      },
      ai_optimized: true,
      optimization_suggestions: automationData.optimizations,
      is_active: true
    });

    return Response.json({
      success: true,
      automation,
      suggested_optimizations: automationData.optimizations
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});