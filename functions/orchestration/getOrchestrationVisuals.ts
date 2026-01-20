import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orchestrators = await base44.entities.AgentOrchestrator.filter({ is_active: true });
    
    if (orchestrators.length === 0) {
      return Response.json({
        success: true,
        orchestration_data: null,
        message: 'No active orchestrators found'
      });
    }

    const orchestrator = orchestrators[0];
    const teams = await Promise.all(
      (orchestrator.managed_teams || []).map(async (mt) => {
        const team = await base44.entities.AgentTeam.filter({ id: mt.team_id });
        return team.length > 0 ? { ...team[0], ...mt } : null;
      })
    );

    const validTeams = teams.filter(t => t !== null);

    const taskAssignments = (orchestrator.task_queue || []).map(task => ({
      task_id: task.task_id,
      assigned_team: validTeams.find(t => t.id === task.assigned_team_id),
      status: task.status,
      priority: task.priority,
      complexity: task.complexity
    }));

    const visualData = {
      orchestrator_name: orchestrator.orchestrator_name,
      teams: validTeams.map(t => ({
        team_id: t.id,
        team_name: t.team_name,
        workload: t.workload || 0.5,
        availability: t.availability || 0.7,
        performance_score: t.performance_score || 0.8,
        members_count: t.team_members?.length || 0,
        assigned_tasks: taskAssignments.filter(ta => ta.assigned_team?.id === t.id).length
      })),
      task_flow: taskAssignments,
      performance: orchestrator.performance_metrics,
      recommendations: orchestrator.ai_recommendations || []
    };

    return Response.json({
      success: true,
      orchestration_data: visualData,
      message: 'Orchestration visuals generated'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});