export default async function runScenarioSimulation(data, context) {
  const { scenario_id } = data;
  
  // Get scenario configuration
  const scenario = await context.entities.SimulationScenario.get(scenario_id);
  if (!scenario) throw new Error('Scenario not found');
  
  // Update status
  await context.entities.SimulationScenario.update(scenario_id, { status: 'running' });
  
  // Initialize simulation agents
  const simulationAgents = [];
  for (let i = 0; i < scenario.agent_count; i++) {
    const config = scenario.agent_configurations[i] || {
      type: 'generic',
      behavior: 'cooperative'
    };
    
    simulationAgents.push({
      id: `sim_agent_${i}`,
      config,
      state: {
        position: [Math.random() * 100, Math.random() * 100],
        resources: 100,
        energy: 100
      }
    });
  }
  
  // Run simulation steps
  const steps = Math.min(scenario.duration_minutes || 10, 100);
  const results = [];
  
  for (let step = 0; step < steps; step++) {
    // Simulate agent interactions
    for (const agent of simulationAgents) {
      // Update agent state based on environment
      agent.state.energy -= Math.random() * 2;
      agent.state.resources += Math.random() * 5 - 2;
      
      // Random movement
      agent.state.position = [
        agent.state.position[0] + (Math.random() - 0.5) * 10,
        agent.state.position[1] + (Math.random() - 0.5) * 10
      ];
    }
    
    // Record metrics
    results.push({
      step,
      avgEnergy: simulationAgents.reduce((sum, a) => sum + a.state.energy, 0) / simulationAgents.length,
      avgResources: simulationAgents.reduce((sum, a) => sum + a.state.resources, 0) / simulationAgents.length,
      interactions: Math.floor(Math.random() * scenario.agent_count * 0.3)
    });
  }
  
  // Analyze results with AI
  const analysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze simulation results for scenario: ${scenario.scenario_name}

Agents: ${scenario.agent_count}
Steps: ${steps}
Environment: ${JSON.stringify(scenario.environment_factors)}

Final metrics:
- Avg Energy: ${results[results.length - 1].avgEnergy.toFixed(2)}
- Avg Resources: ${results[results.length - 1].avgResources.toFixed(2)}
- Total Interactions: ${results.reduce((sum, r) => sum + r.interactions, 0)}

Provide:
1. Summary of agent behavior
2. Key patterns observed
3. Emergent behaviors
4. Performance assessment
5. Optimization recommendations`,
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        key_patterns: { type: "array", items: { type: "string" } },
        emergent_behaviors: { type: "array", items: { type: "string" } },
        performance_score: { type: "number" },
        recommendations: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  // Update scenario with results
  await context.entities.SimulationScenario.update(scenario_id, {
    status: 'completed',
    results: {
      steps_data: results,
      analysis,
      final_agents: simulationAgents
    }
  });
  
  return {
    scenario_id,
    analysis,
    performance_score: analysis.performance_score
  };
}