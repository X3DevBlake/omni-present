export default async function customScenarioBuilder(data, context) {
  const { scenario_name, description, user_preferences, agent_behaviors } = data;
  
  const scenarioDesign = await context.integrations.Core.InvokeLLM({
    prompt: `Design a custom simulation scenario based on user requirements:

Name: ${scenario_name}
Description: ${description}
User Preferences: ${JSON.stringify(user_preferences)}
Desired Agent Behaviors: ${JSON.stringify(agent_behaviors)}

Create a comprehensive scenario including:
1. Environment configuration (terrain, resources, obstacles)
2. Agent configurations (count, types, initial states)
3. Interaction rules
4. Success metrics
5. Dynamic events
6. Difficulty progression
7. Learning objectives`,
    response_json_schema: {
      type: "object",
      properties: {
        environment_config: {
          type: "object",
          properties: {
            terrain_type: { type: "string" },
            size: { type: "object" },
            resource_distribution: { type: "array", items: { type: "object" } },
            obstacles: { type: "array", items: { type: "object" } },
            weather_patterns: { type: "array", items: { type: "string" } }
          }
        },
        agent_configurations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              agent_type: { type: "string" },
              count: { type: "number" },
              initial_state: { type: "object" },
              behavior_profile: { type: "object" },
              capabilities: { type: "array", items: { type: "string" } }
            }
          }
        },
        interaction_rules: {
          type: "array",
          items: {
            type: "object",
            properties: {
              rule_name: { type: "string" },
              condition: { type: "string" },
              outcome: { type: "string" }
            }
          }
        },
        success_metrics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              metric_name: { type: "string" },
              target_value: { type: "number" },
              weight: { type: "number" }
            }
          }
        },
        dynamic_events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              event_name: { type: "string" },
              trigger_condition: { type: "string" },
              effect: { type: "string" },
              probability: { type: "number" }
            }
          }
        },
        difficulty_levels: {
          type: "array",
          items: {
            type: "object",
            properties: {
              level: { type: "number" },
              modifications: { type: "object" }
            }
          }
        }
      }
    }
  });
  
  const agentCount = scenarioDesign.agent_configurations.reduce((sum, config) => sum + config.count, 0);
  
  const scenario = await context.entities.SimulationScenario.create({
    scenario_name,
    description,
    agent_count: agentCount,
    agent_configurations: scenarioDesign.agent_configurations,
    environment_factors: scenarioDesign.environment_config,
    orchestration_config: {
      interaction_rules: scenarioDesign.interaction_rules,
      dynamic_events: scenarioDesign.dynamic_events
    },
    performance_metrics: scenarioDesign.success_metrics,
    duration_minutes: 60,
    status: 'draft',
    created_by: context.user.email,
    is_public: false,
    custom_config: {
      user_preferences,
      difficulty_levels: scenarioDesign.difficulty_levels
    }
  });
  
  await context.entities.Blueprint.create({
    name: `Scenario: ${scenario_name}`,
    description: `Custom simulation scenario blueprint`,
    blueprint_type: 'simulation_scenario',
    config: scenarioDesign,
    created_by: context.user.email,
    tags: ['simulation', 'custom', 'scenario'],
    is_public: false
  });
  
  return {
    scenario,
    design: scenarioDesign,
    sharable: true,
    blueprint_created: true
  };
}