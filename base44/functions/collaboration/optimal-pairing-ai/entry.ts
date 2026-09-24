export default async function optimalPairingAI(data, context) {
  const { task_description, available_agents, constraints } = data;
  
  const agents = await context.entities.Agent.filter({
    id: { $in: available_agents }
  });
  
  const agentSkills = await Promise.all(
    agents.map(a => context.entities.AgentSkill.filter({ agent_id: a.id }).limit(10))
  );
  
  const pastCollaborations = await context.entities.AgentCollaboration.filter({
    agent_ids: { $in: available_agents }
  }).limit(100);
  
  const pairingAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Identify optimal agent collaboration pairings for novel task:

Task: ${task_description}
Constraints: ${JSON.stringify(constraints)}

Available Agents:
${agents.map((a, i) => `${a.name}: Skills [${agentSkills[i].map(s => s.skill_name).join(', ')}]`).join('\n')}

Past Collaboration Patterns:
${pastCollaborations.slice(0, 5).map(c => `${c.agent_ids.join(' + ')}: ${c.status}`).join('\n')}

Analyze and recommend optimal pairings based on:
1. Complementary skill sets
2. Past collaboration success
3. Work style compatibility
4. Resource availability
5. Domain expertise overlap
6. Communication patterns
7. Learning potential
8. Risk mitigation

Provide multiple pairing options with confidence scores.`,
    response_json_schema: {
      type: "object",
      properties: {
        recommended_pairings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pairing_id: { type: "string" },
              agents: { type: "array", items: { type: "string" } },
              confidence_score: { type: "number" },
              synergy_factors: { type: "array", items: { type: "string" } },
              skill_coverage: { type: "number" },
              past_success_rate: { type: "number" },
              predicted_efficiency: { type: "number" },
              risk_factors: { type: "array", items: { type: "string" } },
              estimated_completion_time: { type: "number" }
            }
          }
        },
        skill_gaps: { type: "array", items: { type: "string" } },
        alternative_strategies: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const topPairing = pairingAnalysis?.recommended_pairings?.[0];
  
  if (topPairing) {
    await context.entities.AgentCollaboration.create({
      collaboration_type: 'ai_optimized_pairing',
      task_description,
      agent_ids: topPairing.agents || [],
      status: 'proposed',
      formation_reasoning: `AI-driven pairing with ${topPairing.confidence_score || 0}% confidence`,
      synergy_score: topPairing.skill_coverage || 0,
      predicted_success_rate: topPairing.predicted_efficiency || 0
    });
  }
  
  return {
    pairings: pairingAnalysis?.recommended_pairings || [],
    top_pairing: topPairing || null,
    skill_gaps: pairingAnalysis?.skill_gaps || []
  };
}