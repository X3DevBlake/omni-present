export default async function aiFacilitatedTeams(data, context) {
  const { team_objective, required_skills = [], team_size_min = 3, team_size_max = 8, duration_hours = 24 } = data;
  
  const availableAgents = await context.entities.Agent.filter({
    status: 'active'
  }).limit(50);
  
  const agentSkills = await context.entities.AgentSkill.filter({
    is_active: true
  }).limit(200);
  
  const pastCollaborations = await context.entities.AgentCollaboration.filter({
    status: 'completed'
  }).limit(30);
  
  const teamFormation = await context.integrations.Core.InvokeLLM({
    prompt: `Form an optimal AI agent team:

Objective: ${team_objective}
Required Skills: ${required_skills.join(', ')}
Team Size: ${team_size_min}-${team_size_max} agents
Available Agents: ${availableAgents.length}
Duration: ${duration_hours} hours

Analyze agent capabilities and past collaboration success to:
1. Select optimal team members
2. Assign roles to each agent
3. Define communication protocol
4. Set collaboration rules
5. Predict team synergy score
6. Identify potential conflicts
7. Recommend facilitation strategies`,
    response_json_schema: {
      type: "object",
      properties: {
        team_composition: {
          type: "array",
          items: {
            type: "object",
            properties: {
              agent_id: { type: "string" },
              role: { type: "string" },
              responsibility: { type: "string" },
              skill_contribution: { type: "array", items: { type: "string" } }
            }
          }
        },
        communication_protocol: {
          type: "object",
          properties: {
            message_frequency: { type: "string" },
            escalation_chain: { type: "array", items: { type: "string" } },
            decision_making: { type: "string" }
          }
        },
        collaboration_rules: {
          type: "array",
          items: { type: "string" }
        },
        synergy_score: { type: "number" },
        potential_conflicts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              conflict_type: { type: "string" },
              agents_involved: { type: "array", items: { type: "string" } },
              mitigation: { type: "string" }
            }
          }
        },
        facilitation_strategies: {
          type: "array",
          items: { type: "string" }
        },
        success_probability: { type: "number" }
      }
    }
  });
  
  const selectedAgentIds = availableAgents
    .slice(0, Math.min(team_size_max, availableAgents.length))
    .map(a => a.id);
  
  const teamOrchestration = await context.entities.TeamOrchestration.create({
    name: `AI-Facilitated Team: ${team_objective}`,
    description: `Autonomous team formed for: ${team_objective}`,
    team_agents: selectedAgentIds,
    communication_protocol: teamFormation.communication_protocol,
    delegation_rules: teamFormation.team_composition.map(member => ({
      agent_id: member.agent_id,
      role: member.role,
      skills: member.skill_contribution
    })),
    status: 'active',
    performance_metrics: {
      synergy_score: teamFormation.synergy_score,
      success_probability: teamFormation.success_probability
    }
  });
  
  for (const member of teamFormation.team_composition) {
    const agentExists = availableAgents.find(a => a.id === member.agent_id);
    if (agentExists) {
      await context.entities.AgentCollaboration.create({
        initiator_agent_id: selectedAgentIds[0],
        collaborator_agent_id: member.agent_id,
        collaboration_type: 'team_formation',
        shared_goal: team_objective,
        status: 'active',
        success_metrics: {
          role: member.role,
          expected_contribution: member.responsibility
        }
      });
    }
  }
  
  if (teamFormation.potential_conflicts.length > 0) {
    for (const conflict of teamFormation.potential_conflicts) {
      await context.entities.AgentGovernanceRule.create({
        rule_name: `Conflict Prevention: ${conflict.conflict_type}`,
        rule_type: 'ethical_constraint',
        agent_ids: selectedAgentIds,
        ethical_guidelines: [conflict.mitigation],
        enforcement_level: 'moderate',
        is_active: true
      });
    }
  }
  
  return {
    team_id: teamOrchestration.id,
    team_size: selectedAgentIds.length,
    team_composition: teamFormation.team_composition,
    communication_protocol: teamFormation.communication_protocol,
    synergy_score: teamFormation.synergy_score,
    success_probability: teamFormation.success_probability,
    facilitation_strategies: teamFormation.facilitation_strategies,
    conflicts_identified: teamFormation.potential_conflicts.length,
    duration_hours,
    created_at: new Date().toISOString()
  };
}