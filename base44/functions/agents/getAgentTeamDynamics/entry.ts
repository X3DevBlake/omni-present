import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teams = await base44.entities.AgentTeam.filter({ status: 'active' });
    const communications = await base44.entities.AgentCommunication.list('-created_date', 100);

    const teamDynamics = await Promise.all(teams.map(async (team) => {
      const teamComms = communications.filter(c => c.team_id === team.id);
      
      const agentDetails = await Promise.all(
        (team.team_members || []).map(async (member) => {
          const agent = await base44.entities.Agent.filter({ id: member.agent_id });
          return {
            ...member,
            agent_name: agent[0]?.name || `Agent-${member.agent_id.slice(0, 6)}`,
            agent_status: agent[0]?.status || 'unknown'
          };
        })
      );

      const sentiments = teamComms.map(c => c.sentiment_analysis?.sentiment_score || 0);
      const avgSentiment = sentiments.length > 0 
        ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length 
        : 0.5;

      return {
        team_id: team.id,
        team_name: team.team_name,
        members: agentDetails,
        dynamics: team.team_dynamics,
        communication_flow: teamComms.map(c => ({
          from: c.from_agent_id,
          to: c.to_agent_id,
          sentiment: c.sentiment_analysis?.sentiment_score || 0,
          emotion: c.sentiment_analysis?.emotion || 'neutral',
          timestamp: c.created_date
        })),
        performance: team.performance_metrics,
        health_score: (team.team_dynamics?.cohesion_score || 0.5) * 0.4 + avgSentiment * 0.3 + (team.team_dynamics?.efficiency_rating || 0.5) * 0.3
      };
    }));

    return Response.json({
      success: true,
      team_dynamics: teamDynamics,
      total_teams: teams.length,
      total_communications: communications.length,
      message: 'Agent team dynamics retrieved'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});