import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tasks } = await req.json();

    const teams = await base44.entities.AgentTeam.filter({ status: 'active' });
    
    if (teams.length === 0) {
      return Response.json({ error: 'No active teams available' }, { status: 400 });
    }

    const teamPerformance = await Promise.all(teams.map(async (team) => {
      const communications = await base44.entities.AgentCommunication.filter({ team_id: team.id });
      const recentComms = communications.filter(c => 
        new Date(c.created_date) > new Date(Date.now() - 60 * 60 * 1000)
      );

      return {
        team_id: team.id,
        team_name: team.team_name,
        workload: recentComms.length / 10,
        availability: 1 - (recentComms.length / 50),
        performance_score: team.performance_metrics?.success_rate || 0.75,
        skills: team.team_members?.flatMap(m => m.role) || [],
        current_tasks: (team.performance_metrics?.tasks_completed || 0)
      };
    }));

    const allocationPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Allocate ${tasks.length} tasks to ${teams.length} agent teams based on: ${JSON.stringify(teamPerformance)}.
      Optimize for workload balance, skill matching, and team availability. Return allocation plan.`,
      response_json_schema: {
        type: "object",
        properties: {
          allocations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: { type: "string" },
                assigned_team_id: { type: "string" },
                reasoning: { type: "string" },
                estimated_completion_time: { type: "integer" },
                confidence: { type: "number" }
              }
            }
          },
          optimization_score: { type: "number" }
        }
      }
    });

    let orchestrator = await base44.entities.AgentOrchestrator.filter({ is_active: true });
    
    if (orchestrator.length === 0) {
      orchestrator = await base44.entities.AgentOrchestrator.create({
        orchestrator_name: 'Primary Orchestrator',
        orchestration_strategy: 'ai_optimized',
        managed_teams: teamPerformance,
        task_queue: allocationPlan.allocations.map(a => ({
          task_id: a.task_id,
          priority: 1,
          complexity: 'medium',
          required_skills: [],
          assigned_team_id: a.assigned_team_id,
          status: 'assigned'
        })),
        allocation_rules: [
          { rule_name: 'load_balance', condition: 'workload > 0.8', action: 'redistribute', priority: 1 },
          { rule_name: 'skill_match', condition: 'skill_gap > 0.3', action: 'reassign', priority: 2 }
        ],
        performance_metrics: {
          total_tasks_allocated: allocationPlan.allocations.length,
          avg_allocation_time_ms: 150,
          success_rate: 0.85,
          optimization_score: allocationPlan.optimization_score
        },
        ai_recommendations: [],
        is_active: true
      });
    } else {
      const current = orchestrator[0];
      await base44.entities.AgentOrchestrator.update(current.id, {
        managed_teams: teamPerformance,
        task_queue: [
          ...(current.task_queue || []),
          ...allocationPlan.allocations.map(a => ({
            task_id: a.task_id,
            priority: 1,
            complexity: 'medium',
            required_skills: [],
            assigned_team_id: a.assigned_team_id,
            status: 'assigned'
          }))
        ],
        performance_metrics: {
          total_tasks_allocated: (current.performance_metrics?.total_tasks_allocated || 0) + allocationPlan.allocations.length,
          optimization_score: allocationPlan.optimization_score
        }
      });
    }

    return Response.json({
      success: true,
      allocations: allocationPlan.allocations,
      optimization_score: allocationPlan.optimization_score,
      message: `Allocated ${allocationPlan.allocations.length} tasks to teams`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});