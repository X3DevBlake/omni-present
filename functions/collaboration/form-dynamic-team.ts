export default async function formDynamicTeam(data, context) {
  const { task_description, required_skills, user_email } = data;
  
  // Get all available agents
  const agents = await context.entities.Agent.filter({ created_by: user_email });
  
  // Get agent skills
  const skillsData = await context.entities.AgentSkill.filter({
    agent_id: { $in: agents.map(a => a.id) }
  });
  
  // Get agent KPIs for performance data
  const kpis = await context.entities.AgentKPI.filter({ user_email }).sort('-created_date').limit(100);
  
  // Build agent profiles
  const agentProfiles = agents.map(agent => {
    const agentSkills = skillsData.filter(s => s.agent_id === agent.id);
    const agentKPI = kpis.find(k => k.agent_id === agent.id);
    
    return {
      id: agent.id,
      name: agent.name,
      skills: agentSkills.map(s => ({ skill: s.skill_name, level: s.proficiency })),
      success_rate: agentKPI?.success_rate || 0,
      efficiency: agentKPI?.efficiency || 0
    };
  });
  
  // Use AI to select best team
  const teamSelection = await context.integrations.Core.InvokeLLM({
    prompt: `Select the best team of agents for the following task:

Task: ${task_description}
Required skills: ${required_skills.join(', ')}

Available agents:
${JSON.stringify(agentProfiles, null, 2)}

Select 2-5 agents that best match the required skills and have good performance metrics.
Consider skill coverage, success rates, and team synergy.`,
    response_json_schema: {
      type: "object",
      properties: {
        selected_agents: {
          type: "array",
          items: { type: "string" }
        },
        reasoning: { type: "string" },
        team_strengths: { type: "array", items: { type: "string" } },
        potential_gaps: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  // Create orchestration record
  const team = await context.entities.TeamOrchestration.create({
    name: `Team for: ${task_description.substring(0, 50)}`,
    description: task_description,
    team_agents: teamSelection.selected_agents,
    status: 'draft',
    created_by: user_email
  });
  
  return {
    team,
    selection: teamSelection
  };
}