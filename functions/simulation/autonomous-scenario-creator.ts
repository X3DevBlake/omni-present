export default async function autonomousScenarioCreator(data, context) {
  const { agent_id, learning_objective, scenario_type, parameters } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const existingScenarios = await context.entities.SimulationScenario.filter({}).limit(20);
  
  const scenarioDesign = await context.integrations.Core.InvokeLLM({
    prompt: `AI Agent autonomous scenario creation:

Agent: ${agent.name}
Learning Objective: ${learning_objective}
Scenario Type: ${scenario_type}

Existing Scenarios for Reference:
${existingScenarios.map(s => `- ${s.scenario_name}: ${s.agent_count} agents`).join('\n')}

Design comprehensive simulation scenario:
1. Environment parameters (terrain, resources, obstacles)
2. Agent configurations (roles, skills, initial states)
3. Economic model integration (supply/demand, inflation, trade)
4. Geopolitical events (conflicts, alliances, regulations)
5. Success metrics aligned with learning objective
6. Difficulty progression curve
7. Emergent behavior triggers
8. Real-world data integration points

Make it challenging, educational, and engaging.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        scenario_name: { type: "string" },
        description: { type: "string" },
        agent_configurations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              count: { type: "number" },
              initial_skills: { type: "array", items: { type: "string" } },
              starting_resources: { type: "object" }
            }
          }
        },
        environment_factors: {
          type: "object",
          properties: {
            terrain_type: { type: "string" },
            resource_abundance: { type: "number" },
            weather_patterns: { type: "array", items: { type: "string" } },
            obstacles: { type: "array", items: { type: "string" } }
          }
        },
        economic_model: {
          type: "object",
          properties: {
            currency_system: { type: "string" },
            inflation_rate: { type: "number" },
            trade_mechanisms: { type: "array", items: { type: "string" } },
            resource_scarcity: { type: "object" }
          }
        },
        geopolitical_events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              event_type: { type: "string" },
              trigger_time_minutes: { type: "number" },
              impact_description: { type: "string" },
              affected_agents: { type: "string" }
            }
          }
        },
        performance_metrics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              metric_name: { type: "string" },
              measurement_method: { type: "string" },
              target_value: { type: "number" }
            }
          }
        },
        duration_minutes: { type: "number" },
        difficulty_level: { type: "string" },
        emergent_behavior_targets: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const scenario = await context.entities.SimulationScenario.create({
    scenario_name: scenarioDesign.scenario_name,
    description: scenarioDesign.description,
    agent_count: scenarioDesign.agent_configurations.reduce((sum, c) => sum + c.count, 0),
    agent_configurations: scenarioDesign.agent_configurations,
    environment_factors: scenarioDesign.environment_factors,
    orchestration_config: {
      economic_model: scenarioDesign.economic_model,
      geopolitical_events: scenarioDesign.geopolitical_events
    },
    performance_metrics: scenarioDesign.performance_metrics,
    duration_minutes: scenarioDesign.duration_minutes,
    status: 'draft',
    created_by: agent.created_by,
    results: {
      creator_agent: agent_id,
      learning_objective,
      difficulty: scenarioDesign.difficulty_level
    }
  });
  
  await context.entities.SharedKnowledge.create({
    knowledge_topic: `Scenario: ${scenarioDesign.scenario_name}`,
    knowledge_type: 'simulation_scenario',
    content: scenarioDesign,
    agent_ids: [agent_id],
    quality_score: 75,
    version: 1,
    contribution_count: 1
  });
  
  return {
    scenario,
    design: scenarioDesign,
    agents_required: scenarioDesign.agent_configurations.reduce((sum, c) => sum + c.count, 0),
    events_scheduled: scenarioDesign.geopolitical_events.length
  };
}