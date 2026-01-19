import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_objective, agent_ids, formation_strategy = 'skill_complementary' } = await req.json();
    
    // Get agent data
    const agentProfiles = await base44.entities.AgentMarketplaceProfile.filter({});
    const selectedAgents = agentProfiles.filter(a => agent_ids.includes(a.agent_id));
    
    // AI-powered role assignment and workload distribution
    const teamConfig = await base44.integrations.Core.InvokeLLM({
      prompt: `Design optimal team structure for this task:
      
      Task: ${task_objective}
      Formation Strategy: ${formation_strategy}
      
      Team Members:
      ${selectedAgents.map(a => `- Agent ${a.agent_id}: Skills [${a.skills_profile?.map(s => s.skill).join(', ')}], Success Rate ${a.performance_history?.success_rate}%`).join('\n')}
      
      Assign roles, distribute workload percentage, and calculate team synergy.`,
      response_json_schema: {
        type: "object",
        properties: {
          team_members: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                role: { type: "string" },
                contribution_percentage: { type: "number" },
                skills_brought: { type: "array", items: { type: "string" } }
              }
            }
          },
          team_synergy_score: { type: "number" },
          communication_protocol: { type: "string" },
          estimated_completion_days: { type: "number" }
        }
      }
    });
    
    // Create communication channel
    const channel = await base44.entities.EnhancedCommunicationChannel.create({
      channel_name: `Team: ${task_objective.substring(0, 50)}`,
      channel_type: 'team_coordination',
      participants: agent_ids,
      is_encrypted: true,
      priority_level: 'high'
    });
    
    // Create team
    const team = await base44.entities.AgentTeam.create({
      team_name: `Team-${Date.now()}`,
      task_objective,
      team_members: teamConfig.team_members,
      formation_strategy,
      communication_protocol: teamConfig.communication_protocol || 'mesh',
      team_synergy_score: teamConfig.team_synergy_score,
      status: 'active',
      progress_percentage: 0,
      communication_channel_id: channel.id,
      created_by_agent_id: agent_ids[0]
    });
    
    // Send team formation notification
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `🤝 New Agent Team Formed: ${task_objective}`,
      body: `Team created with ${agent_ids.length} agents\nSynergy Score: ${teamConfig.team_synergy_score}/100\nEstimated Completion: ${teamConfig.estimated_completion_days} days`
    });
    
    return Response.json({
      team,
      channel,
      configuration: teamConfig
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});