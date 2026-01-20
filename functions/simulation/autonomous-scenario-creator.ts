import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario_type, complexity, objectives } = await req.json();

    // Use AI to generate comprehensive scenario
    const scenarioData = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a detailed ${complexity} complexity simulation scenario for ${scenario_type}. Include: scenario name, description, initial conditions (5-10 parameters), agent configurations (3-5 agent types with roles and behaviors), environmental factors (temperature, resources, constraints), success criteria, failure conditions, and expected emergent behaviors. Objectives: ${objectives}`,
      response_json_schema: {
        type: "object",
        properties: {
          scenario_name: { type: "string" },
          description: { type: "string" },
          initial_conditions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                parameter: { type: "string" },
                value: { type: "number" },
                variance: { type: "number" }
              }
            }
          },
          agent_configs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_type: { type: "string" },
                role: { type: "string" },
                behavior_profile: { type: "string" },
                skill_requirements: { type: "array", items: { type: "string" } }
              }
            }
          },
          environmental_factors: {
            type: "object",
            properties: {
              temperature: { type: "number" },
              resource_availability: { type: "number" },
              constraints: { type: "array", items: { type: "string" } }
            }
          },
          success_criteria: { type: "array", items: { type: "string" } },
          failure_conditions: { type: "array", items: { type: "string" } },
          expected_behaviors: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Create simulation scenario
    const scenario = await base44.entities.SimulationScenario.create({
      scenario_name: scenarioData.scenario_name,
      description: scenarioData.description,
      scenario_type: scenario_type,
      complexity_level: complexity,
      initial_conditions: scenarioData.initial_conditions,
      success_criteria: scenarioData.success_criteria,
      environmental_parameters: scenarioData.environmental_factors,
      ai_generated: true,
      is_active: true
    });

    // Create agents for this scenario
    const createdAgents = [];
    for (const agentConfig of scenarioData.agent_configs) {
      const agent = await base44.entities.SimulationAgent.create({
        scenario_id: scenario.id,
        agent_name: `${agentConfig.agent_type}_${Date.now()}`,
        agent_type: agentConfig.role,
        behavior_profile: {
          primary_behavior: agentConfig.behavior_profile,
          skills: agentConfig.skill_requirements
        },
        position: {
          x: (Math.random() - 0.5) * 10,
          y: 0,
          z: (Math.random() - 0.5) * 10
        },
        status: 'idle'
      });
      createdAgents.push(agent);
    }

    return Response.json({
      success: true,
      scenario,
      agents: createdAgents,
      expected_behaviors: scenarioData.expected_behaviors
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});