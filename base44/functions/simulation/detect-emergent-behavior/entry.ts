export default async function detectEmergentBehavior(data, context) {
  const { scenario_id } = data;
  
  const scenario = await context.entities.SimulationScenario.get(scenario_id);
  const interactions = await context.entities.AgentInteractionLog.filter({
    metadata: { scenario_id }
  }).limit(200);
  
  const agentIds = [...new Set(interactions.map(i => i.agent_id))];
  
  const interactionPatterns = {};
  interactions.forEach(i => {
    const key = `${i.agent_id}_${i.target_agent_id || 'none'}`;
    interactionPatterns[key] = (interactionPatterns[key] || 0) + 1;
  });
  
  const analysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze simulation for emergent behaviors:

Scenario: ${scenario.scenario_name}
Participating Agents: ${agentIds.length}
Total Interactions: ${interactions.length}

Interaction Patterns:
${Object.entries(interactionPatterns).slice(0, 10).map(([key, count]) => `${key}: ${count} interactions`).join('\n')}

Identify:
1. Emergent cooperation patterns
2. Specialization behaviors
3. Hierarchy formations
4. Unexpected alliances
5. Novel problem-solving approaches`,
    response_json_schema: {
      type: "object",
      properties: {
        behaviors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              behavior_type: { type: "string" },
              description: { type: "string" },
              participating_agents: { type: "array", items: { type: "string" } },
              frequency: { type: "number" },
              impact: { type: "string" }
            }
          }
        }
      }
    }
  });
  
  for (const behavior of analysis.behaviors) {
    await context.entities.EmergentBehavior.create({
      scenario_id,
      behavior_type: behavior.behavior_type,
      participating_agents: behavior.participating_agents,
      detection_timestamp: new Date().toISOString(),
      confidence_score: 75,
      impact_on_performance: 10,
      description: behavior.description
    });
  }
  
  return analysis;
}