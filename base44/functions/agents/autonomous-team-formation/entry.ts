export default async function autonomousTeamFormation(data, context) {
  const { task_complexity, required_capabilities, deadline_hours, user_email } = data;
  
  const availableAgents = await context.entities.Agent.filter({ created_by: user_email, status: 'active' });
  const agentKPIs = await context.entities.AgentKPI.filter({ user_email }).sort('-created_date').limit(100);
  const agentSkills = await context.entities.AgentSkill.filter({ 
    agent_id: { $in: availableAgents.map(a => a.id) }
  });
  
  const agentProfiles = availableAgents.map(agent => {
    const kpi = agentKPIs.find(k => k.agent_id === agent.id);
    const skills = agentSkills.filter(s => s.agent_id === agent.id);
    const workload = agentKPIs.filter(k => k.agent_id === agent.id).reduce((sum, k) => sum + (k.tasks_completed || 0), 0);
    
    return {
      id: agent.id,
      name: agent.name,
      skills: skills.map(s => ({ name: s.skill_name, proficiency: s.proficiency })),
      performance: {
        success_rate: kpi?.success_rate || 0,
        efficiency: kpi?.efficiency || 0,
        response_time: kpi?.response_time || 0
      },
      current_workload: workload,
      availability_score: Math.max(0, 100 - workload / 10)
    };
  });
  
  const teamSelection = await context.integrations.Core.InvokeLLM({
    prompt: `Autonomously form an optimal agent team for a complex task.

Task Complexity: ${task_complexity}/10
Required Capabilities: ${required_capabilities.join(', ')}
Deadline: ${deadline_hours} hours

Available Agents:
${agentProfiles.map(a => `
- ${a.name}
  Skills: ${a.skills.map(s => `${s.name}(${s.proficiency}%)`).join(', ')}
  Performance: Success ${a.performance.success_rate}%, Efficiency ${a.performance.efficiency}
  Availability: ${a.availability_score}%
`).join('\n')}

Form a team of 3-6 agents that:
1. Covers all required capabilities
2. Balances workload across agents
3. Maximizes team synergy and complementary skills
4. Can meet the deadline
5. Has redundancy for critical capabilities

Assign specific roles to each agent.`,
    response_json_schema: {
      type: "object",
      properties: {
        team_members: {
          type: "array",
          items: {
            type: "object",
            properties: {
              agent_id: { type: "string" },
              agent_name: { type: "string" },
              role: { type: "string" },
              responsibilities: { type: "array", items: { type: "string" } },
              estimated_workload_hours: { type: "number" }
            }
          }
        },
        team_composition_reasoning: { type: "string" },
        capability_coverage: { type: "object" },
        estimated_completion_time: { type: "number" },
        risk_factors: { type: "array", items: { type: "string" } },
        mitigation_strategies: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const orchestration = await context.entities.TeamOrchestration.create({
    name: `Autonomous Team: ${required_capabilities[0]}`,
    description: `Auto-formed team for task complexity ${task_complexity}`,
    team_agents: teamSelection.team_members.map(m => m.agent_id),
    status: 'active',
    communication_protocol: {
      message_format: 'structured_json',
      priority_rules: ['urgent_first', 'round_robin'],
      escalation_chain: teamSelection.team_members.map(m => m.agent_id)
    },
    delegation_rules: teamSelection.team_members.map(m => ({
      agent_id: m.agent_id,
      responsibilities: m.responsibilities,
      workload_threshold: m.estimated_workload_hours
    })),
    created_by: user_email
  });
  
  await context.entities.AgentCollaboration.create({
    team_id: orchestration.id,
    agent_ids: teamSelection.team_members.map(m => m.agent_id),
    collaboration_type: 'autonomous_formation',
    formation_reasoning: teamSelection.team_composition_reasoning,
    expected_duration_hours: teamSelection.estimated_completion_time
  });
  
  return { 
    orchestration, 
    team_selection,
    automated: true,
    formation_timestamp: new Date().toISOString()
  };
}