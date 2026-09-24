export default async function agentCompatibilityChecker(data, context) {
  const { agent_ids, collaboration_type = 'team' } = data;
  
  const agents = await Promise.all(agent_ids.map(id => context.entities.Agent.get(id)));
  const personalities = await Promise.all(agent_ids.map(id => 
    context.entities.AgentPersonality.filter({ agent_id: id }).limit(1)
  ));
  const skills = await Promise.all(agent_ids.map(id =>
    context.entities.AgentSkill.filter({ agent_id: id })
  ));
  const pastCollaborations = await context.entities.AgentCollaboration.filter({
    agent_ids: { $in: agent_ids }
  });
  
  const compatibilityAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze agent compatibility for ${collaboration_type} collaboration:

Agents:
${agents.map((a, i) => `
${i + 1}. ${a.name}
   Personality: ${JSON.stringify(personalities[i][0]?.traits || {})}
   Skills: ${skills[i].map(s => s.skill_name).join(', ')}
`).join('\n')}

Past Collaborations Together: ${pastCollaborations.length}

Analyze:
1. Personality compatibility
2. Skill complementarity
3. Potential conflicts
4. Collaboration synergy score
5. Optimal team structure
6. Communication style alignment`,
    response_json_schema: {
      type: "object",
      properties: {
        overall_compatibility_score: { type: "number" },
        compatibility_breakdown: {
          type: "object",
          properties: {
            personality_match: { type: "number" },
            skill_complementarity: { type: "number" },
            communication_alignment: { type: "number" },
            past_collaboration_success: { type: "number" }
          }
        },
        strengths: { type: "array", items: { type: "string" } },
        potential_conflicts: { type: "array", items: { type: "string" } },
        recommended_structure: {
          type: "object",
          properties: {
            team_lead: { type: "string" },
            roles: { type: "array", items: { type: "object" } }
          }
        },
        success_probability: { type: "number" },
        recommendations: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  return {
    compatibility_analysis: compatibilityAnalysis,
    agents_analyzed: agents.length,
    recommendation: compatibilityAnalysis.overall_compatibility_score > 75 ? 'Highly Compatible' :
                   compatibilityAnalysis.overall_compatibility_score > 50 ? 'Compatible with caution' :
                   'Consider alternative team composition'
  };
}