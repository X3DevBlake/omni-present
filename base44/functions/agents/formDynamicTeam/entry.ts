import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { missionId, requirements } = await req.json();

    // 1. Find suitable agents based on requirements
    const allAgents = await base44.entities.Agent.list({ limit: 100 });
    
    // Simple matching logic (in reality this would be complex AI)
    const candidates = allAgents.filter(a => a.status === 'idle').slice(0, 5);
    
    if (candidates.length < 2) {
       return Response.json({ success: false, message: "Insufficient agents available" });
    }

    // 2. Form Team
    const teamData = {
      name: `Task Force ${missionId ? missionId.slice(0,4) : 'Alpha'}`,
      mission_id: missionId || 'adhoc',
      member_ids: candidates.map(c => c.id),
      status: 'forming',
      consensus_score: 0.5,
      shared_resources: { bandwidth: 100, compute: 50 },
      current_strategy: 'Initial Consensus Seeking'
    };

    const team = await base44.entities.AgentTeam.create(teamData);

    // 3. Update Agents
    for (const agent of candidates) {
        await base44.entities.Agent.update(agent.id, {
            status: 'collaborating',
            current_team_id: team.id
        });
    }

    // 4. Create Initial Collaboration Log
    // (Assuming CollaborationChat exists or using generic messaging)

    return Response.json({ success: true, team, agents: candidates.map(c => c.name) });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});