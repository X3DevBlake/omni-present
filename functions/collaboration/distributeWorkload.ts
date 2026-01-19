import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, task_breakdown } = await req.json();
    
    // Get team
    const teams = await base44.entities.AgentTeam.filter({ id: team_id });
    const team = teams[0];
    
    if (!team) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }
    
    // AI-powered dynamic workload distribution
    const distribution = await base44.integrations.Core.InvokeLLM({
      prompt: `Optimize workload distribution for this agent team:
      
      Task: ${team.task_objective}
      Team Members: ${JSON.stringify(team.team_members)}
      Task Breakdown: ${JSON.stringify(task_breakdown)}
      Current Progress: ${team.progress_percentage}%
      
      Distribute subtasks based on agent skills, current workload, and team synergy. Create task dependencies where needed.`,
      response_json_schema: {
        type: "object",
        properties: {
          task_assignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                subtasks: { type: "array", items: { type: "string" } },
                estimated_hours: { type: "number" },
                priority: { type: "string" }
              }
            }
          },
          dependencies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                depends_on: { type: "string" },
                dependency_type: { type: "string" }
              }
            }
          },
          parallel_execution_possible: { type: "boolean" },
          bottleneck_risks: { type: "array", items: { type: "string" } }
        }
      }
    });
    
    // Create task dependencies
    for (const dep of distribution.dependencies) {
      await base44.entities.TaskDependency.create({
        task_id: dep.task,
        depends_on_task_id: dep.depends_on,
        dependency_type: dep.dependency_type || 'blocking',
        impact_score: 80
      });
    }
    
    // Update team with workload distribution
    await base44.entities.AgentTeam.update(team_id, {
      workload_distribution: {
        assignments: distribution.task_assignments,
        parallel_execution: distribution.parallel_execution_possible,
        bottlenecks: distribution.bottleneck_risks
      }
    });
    
    return Response.json({
      distribution,
      team_id,
      dependencies_created: distribution.dependencies.length
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});