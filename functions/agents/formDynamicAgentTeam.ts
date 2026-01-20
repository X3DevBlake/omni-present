import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_requirement } = await req.json();

    const agents = await base44.entities.Agent.filter({ status: 'active' });

    const teamFormation = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze ${agents.length} available agents and form an optimal team for task: ${JSON.stringify(task_requirement)}.
      Consider agent skills, past performance, and collaboration history.
      Return team composition with roles and reasoning.`,
      response_json_schema: {
        type: "object",
        properties: {
          team_name: { type: "string" },
          selected_agents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                role: { type: "string" },
                reasoning: { type: "string" },
                contribution_score: { type: "number" }
              }
            }
          },
          formation_rationale: { type: "string" },
          expected_synergy: { type: "number" }
        }
      }
    });

    const team = await base44.entities.AgentTeam.create({
      team_name: teamFormation.team_name,
      formation_type: 'ai_suggested',
      task_requirement,
      team_members: teamFormation.selected_agents.map(a => ({
        agent_id: a.agent_id,
        role: a.role,
        contribution_score: a.contribution_score,
        joined_at: new Date().toISOString()
      })),
      team_dynamics: {
        cohesion_score: teamFormation.expected_synergy || 0.8,
        efficiency_rating: 0.85,
        conflict_count: 0,
        synergy_level: teamFormation.expected_synergy || 0.8
      },
      communication_stats: {
        total_messages: 0,
        avg_sentiment: 0.5,
        response_time_ms: 0
      },
      status: 'forming',
      performance_metrics: {
        tasks_completed: 0,
        success_rate: 0,
        avg_completion_time: 0
      }
    });

    await base44.entities.AgentTeam.update(team.id, { status: 'active' });

    return Response.json({
      success: true,
      team,
      formation_rationale: teamFormation.formation_rationale,
      message: `Team "${teamFormation.team_name}" formed with ${teamFormation.selected_agents.length} agents`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});