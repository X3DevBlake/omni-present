export default async function emergentStrategyDetector(data, context) {
  const { scenario_id, analysis_depth = 'deep' } = data;
  
  const scenario = await context.entities.SimulationScenario.get(scenario_id);
  const interactions = await context.entities.AgentInteractionLog.filter({
    metadata: { scenario_id }
  }).limit(500);
  const emergentBehaviors = await context.entities.EmergentBehavior.filter({ scenario_id });
  
  const interactionPatterns = {};
  const agentStrategies = {};
  
  interactions.forEach(int => {
    if (!agentStrategies[int.agent_id]) {
      agentStrategies[int.agent_id] = {
        actions: [],
        success_count: 0,
        fail_count: 0
      };
    }
    
    agentStrategies[int.agent_id].actions.push({
      action: int.action_taken,
      status: int.status,
      timestamp: int.created_date
    });
    
    if (int.status === 'success') agentStrategies[int.agent_id].success_count++;
    else agentStrategies[int.agent_id].fail_count++;
  });
  
  const strategyAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Detect emergent strategies in multi-agent simulation:

Scenario: ${scenario.scenario_name}
Total Interactions: ${interactions.length}
Emergent Behaviors Detected: ${emergentBehaviors.length}

Agent Strategies Summary:
${Object.entries(agentStrategies).map(([agentId, data]) => `
${agentId}: ${data.actions.length} actions, Success: ${data.success_count}, Fail: ${data.fail_count}
Recent actions: ${data.actions.slice(-5).map(a => a.action).join(', ')}
`).join('\n')}

Analyze and identify:
1. Dominant strategies that emerged
2. Cooperative vs competitive strategies
3. Novel problem-solving approaches
4. Resource management tactics
5. Adaptation patterns
6. Strategy evolution over time`,
    response_json_schema: {
      type: "object",
      properties: {
        strategies_detected: {
          type: "array",
          items: {
            type: "object",
            properties: {
              strategy_name: { type: "string" },
              description: { type: "string" },
              agents_using: { type: "array", items: { type: "string" } },
              effectiveness_score: { type: "number" },
              emergence_conditions: { type: "string" },
              strategy_type: { type: "string", enum: ["cooperative", "competitive", "hybrid", "adaptive"] }
            }
          }
        },
        strategy_evolution: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phase: { type: "string" },
              dominant_strategy: { type: "string" },
              agent_count: { type: "number" }
            }
          }
        },
        insights: { type: "array", items: { type: "string" } },
        unexpected_behaviors: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  for (const strategy of strategyAnalysis.strategies_detected) {
    await context.entities.EmergentBehavior.create({
      scenario_id,
      behavior_type: 'strategy_emergence',
      participating_agents: strategy.agents_using,
      detection_timestamp: new Date().toISOString(),
      confidence_score: strategy.effectiveness_score,
      description: `${strategy.strategy_name}: ${strategy.description}`,
      visual_data: {
        strategy_type: strategy.strategy_type,
        evolution: strategyAnalysis.strategy_evolution
      }
    });
  }
  
  return {
    strategies: strategyAnalysis,
    total_strategies_detected: strategyAnalysis.strategies_detected.length,
    analysis_depth
  };
}