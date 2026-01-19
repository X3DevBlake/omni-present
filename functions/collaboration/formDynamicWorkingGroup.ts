import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_requirements } = await req.json();

    // Get agents and their skills
    const [agents, skills] = await Promise.all([
      base44.asServiceRole.entities.Agent.list(),
      base44.asServiceRole.entities.AgentSkill.list(),
    ]);

    // Use AI to select optimal team composition
    const teamAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `As an AI team formation specialist, analyze these agents and select the optimal team for the following task:

Task Requirements: ${JSON.stringify(task_requirements)}

Available Agents: ${JSON.stringify(agents.slice(0, 10).map(a => ({
  id: a.id,
  name: a.name,
  capabilities: a.capabilities
})))}

Skills Database: ${JSON.stringify(skills.slice(0, 20))}

Provide:
1. Selected agent IDs (3-5 agents)
2. Role assignment for each agent
3. Collaboration score prediction (0-100)
4. Communication protocol recommendation
5. Potential synergies and risks`,
      response_json_schema: {
        type: "object",
        properties: {
          selected_agents: { type: "array", items: { type: "object" } },
          collaboration_score: { type: "number" },
          communication_protocol: { type: "string" },
          synergies: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Create working group
    const group = await base44.asServiceRole.entities.WorkingGroup.create({
      group_name: `Team ${task_requirements.task_name || 'Dynamic'}`,
      formation_criteria: {
        required_skills: task_requirements.required_skills || [],
        max_members: 5,
        task_type: task_requirements.task_type || 'general'
      },
      member_agents: teamAnalysis.selected_agents.map(a => a.id),
      communication_protocol: teamAnalysis.communication_protocol,
      collaboration_score: teamAnalysis.collaboration_score,
      status: 'active',
    });

    // Create communication channel
    const channel = await base44.asServiceRole.entities.AgentCommunicationChannel.create({
      channel_name: `${group.group_name} Channel`,
      channel_type: 'collaboration',
      participant_agent_ids: teamAnalysis.selected_agents.map(a => a.id),
      is_active: true,
    });

    return Response.json({
      success: true,
      group_id: group.id,
      channel_id: channel.id,
      team_composition: teamAnalysis.selected_agents,
      collaboration_score: teamAnalysis.collaboration_score,
      synergies: teamAnalysis.synergies,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});