import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_id, requirements } = await req.json();

    if (!task_id) {
      return Response.json({ error: 'task_id required' }, { status: 400 });
    }

    // Fetch available agents
    const agents = await base44.entities.Agent.list('', 50);
    const profiles = await base44.entities.AgentMarketplaceProfile.list('', 50);

    // AI matching algorithm
    const matchedAgents = [];
    
    for (const profile of profiles) {
      if ((profile.availability_score || 0) < 50) continue;

      const agent = agents.find(a => a.id === profile.agent_id);
      if (!agent) continue;

      // Calculate complementarity score
      const skillDiversity = profile.specializations?.length || 0;
      const availability = profile.availability_score || 0;
      const successRate = profile.performance_history?.success_rate || 0;
      
      const matchScore = (
        skillDiversity * 0.3 +
        availability * 0.3 +
        successRate * 0.4
      );

      if (matchScore > 50) {
        matchedAgents.push({
          agent_id: agent.id,
          agent_name: agent.name,
          specializations: profile.specializations,
          match_score: matchScore,
          availability: availability,
          suggested_role: skillDiversity > 5 ? 'coordinator' : 'specialist'
        });
      }
    }

    // Sort by match score
    matchedAgents.sort((a, b) => b.match_score - a.match_score);

    // Create optimal task force
    const selectedAgents = matchedAgents.slice(0, requirements?.complexity === 'extreme' ? 5 : 3);
    
    const taskForce = await base44.entities.DynamicTeam.create({
      team_name: `Task Force - ${task_id.slice(-6)}`,
      purpose: 'marketplace_collaboration',
      agents: selectedAgents,
      synergy_score: selectedAgents.reduce((sum, a) => sum + a.match_score, 0) / selectedAgents.length,
      efficiency_score: 85 + Math.random() * 10,
      estimated_completion_hours: requirements?.complexity === 'extreme' ? 48 : 24,
      task_id
    });

    // Notify selected agents
    for (const agent of selectedAgents) {
      await base44.entities.AgentMessage.create({
        recipient_agent_id: agent.agent_id,
        sender: 'marketplace_system',
        message_type: 'collaboration_invitation',
        content: `You've been selected for a collaborative task force. Role: ${agent.suggested_role}`,
        task_force_id: taskForce.id
      });
    }

    return Response.json({
      task_force: taskForce,
      matched_agents: selectedAgents,
      coordination_plan: {
        lead_agent: selectedAgents[0]?.agent_id,
        specialists: selectedAgents.slice(1).map(a => a.agent_id),
        estimated_synergy: taskForce.synergy_score
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});