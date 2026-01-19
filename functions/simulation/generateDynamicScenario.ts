import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { environment_id, complexity_level = 5 } = await req.json();

    const environments = await base44.asServiceRole.entities.SimulationEnvironment.filter({ id: environment_id });
    const environment = environments[0];

    if (!environment) {
      return Response.json({ error: 'Environment not found' }, { status: 404 });
    }

    // Use AI to generate dynamic scenario parameters
    const scenarioDesign = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As an AI simulation designer, create a dynamic, challenging scenario for:

Environment Type: ${environment.environment_type}
Base Parameters: ${JSON.stringify(environment.parameters)}
Complexity Level: ${complexity_level}/10

Generate:
1. Novel scenario parameters that adapt to agent behavior
2. Adaptive rules that change based on emergent patterns
3. Complex challenge objectives
4. Unexpected environmental factors
5. Multi-objective optimization problems

Make it engaging, challenging, and conducive to emergent behavior.`,
      response_json_schema: {
        type: "object",
        properties: {
          scenario_name: { type: "string" },
          generated_parameters: { type: "object" },
          adaptive_rules: { type: "array", items: { type: "object" } },
          challenge_objectives: { type: "array", items: { type: "string" } },
          complexity_score: { type: "number" }
        }
      }
    });

    // Create dynamic scenario
    const scenario = await base44.asServiceRole.entities.DynamicSimulationScenario.create({
      scenario_name: scenarioDesign.scenario_name,
      environment_id,
      ai_generated_parameters: scenarioDesign.generated_parameters,
      adaptive_rules: scenarioDesign.adaptive_rules.map(rule => ({
        ...rule,
        triggered: false
      })),
      complexity_level: scenarioDesign.complexity_score,
      challenge_objectives: scenarioDesign.challenge_objectives,
      emergent_patterns: [],
      performance_metrics: { generated_at: new Date().toISOString() },
    });

    return Response.json({
      success: true,
      scenario_id: scenario.id,
      scenario_name: scenarioDesign.scenario_name,
      complexity: scenarioDesign.complexity_score,
      objectives: scenarioDesign.challenge_objectives,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});