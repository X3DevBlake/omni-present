export default async function dynamicSubteamFormation(data, context) {
  const { parent_team_id, subtask_description, required_capabilities, urgency = 'normal' } = data;
  
  const parentTeam = await context.entities.TeamOrchestration.get(parent_team_id);
  const parentAgents = await Promise.all(parentTeam.team_agents.map(id => context.entities.Agent.get(id)));
  const agentSkills = await context.entities.AgentSkill.filter({
    agent_id: { $in: parentTeam.team_agents }
  });
  const agentWorkloads = await context.entities.AgentKPI.filter({
    agent_id: { $in: parentTeam.team_agents }
  }).sort('-created_date');
  
  const agentProfiles = parentAgents.map(agent => {
    const skills = agentSkills.filter(s => s.agent_id === agent.id);
    const workload = agentWorkloads.find(w => w.agent_id === agent.id);
    
    return {
      id: agent.id,
      name: agent.name,
      skills: skills.map(s => ({ name: s.skill_name, proficiency: s.proficiency })),
      current_tasks: workload?.tasks_in_progress || 0,
      availability: workload?.tasks_in_progress < 3 ? 'available' : 'limited'
    };
  });
  
  const subteamSelection = await context.integrations.Core.InvokeLLM({
    prompt: `Form a dynamic sub-team from parent team for specific subtask:

Parent Team: ${parentTeam.name}
Total Agents: ${parentAgents.length}

Subtask: ${subtask_description}
Required Capabilities: ${required_capabilities.join(', ')}
Urgency: ${urgency}

Available Agents:
${agentProfiles.map(a => `
- ${a.name}
  Skills: ${a.skills.map(s => `${s.name}(${s.proficiency}%)`).join(', ')}
  Current Tasks: ${a.current_tasks}
  Availability: ${a.availability}
`).join('\n')}

Form optimal sub-team of 2-4 agents that:
1. Covers required capabilities
2. Balances with current workload
3. Maximizes collaboration synergy
4. Can handle urgency level
5. Maintains parent team coherence`,
    response_json_schema: {
      type: "object",
      properties: {
        subteam_members: {
          type: "array",
          items: {
            type: "object",
            properties: {
              agent_id: { type: "string" },
              role_in_subteam: { type: "string" },
              specific_responsibilities: { type: "array", items: { type: "string" } },
              contribution_percentage: { type: "number" }
            }
          }
        },
        subteam_strategy: { type: "string" },
        coordination_method: { type: "string" },
        estimated_completion_hours: { type: "number" },
        parallel_work_possible: { type: "boolean" },
        dependencies_on_parent_team: { type: "array", items: { type: "string" } },
        success_criteria: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const subteam = await context.entities.TeamOrchestration.create({
    name: `SubTeam: ${subtask_description.substring(0, 50)}`,
    description: subtask_description,
    team_agents: subteamSelection.subteam_members.map(m => m.agent_id),
    parent_orchestration_id: parent_team_id,
    status: 'active',
    communication_protocol: {
      ...parentTeam.communication_protocol,
      escalation_chain: [parent_team_id],
      reporting_frequency: urgency === 'high' ? 'real_time' : 'hourly'
    },
    delegation_rules: subteamSelection.subteam_members.map(m => ({
      agent_id: m.agent_id,
      responsibilities: m.specific_responsibilities,
      contribution_target: m.contribution_percentage
    }))
  });
  
  await context.entities.AgentCollaboration.create({
    team_id: subteam.id,
    parent_team_id: parent_team_id,
    agent_ids: subteamSelection.subteam_members.map(m => m.agent_id),
    collaboration_type: 'dynamic_subteam',
    task_description: subtask_description,
    formation_reasoning: subteamSelection.subteam_strategy,
    expected_duration_hours: subteamSelection.estimated_completion_hours
  });
  
  for (const member of subteamSelection.subteam_members) {
    await context.entities.AgentCommunication.create({
      sender_agent_id: 'system',
      recipient_agent_id: member.agent_id,
      encrypted_content: Buffer.from(JSON.stringify({
        type: 'subteam_assignment',
        subtask: subtask_description,
        role: member.role_in_subteam,
        responsibilities: member.specific_responsibilities,
        team_members: subteamSelection.subteam_members.filter(m => m.agent_id !== member.agent_id).map(m => m.agent_id)
      })).toString('base64'),
      priority: urgency === 'high' ? 'urgent' : 'high',
      requires_response: true
    });
  }
  
  return {
    subteam,
    selection: subteamSelection,
    members_count: subteamSelection.subteam_members.length,
    autonomous_formation: true,
    parent_team: parentTeam.name
  };
}