export default async function intelligentTaskPrioritization(data, context) {
  const { user_email, tasks, context_factors } = data;
  
  const userGoals = await context.entities.FinancialGoal.filter({ user_email });
  const agentWorkloads = await context.entities.AgentKPI.filter({ 
    user_email 
  }).sort('-created_date').limit(20);
  const urgentAlerts = await context.entities.ProactiveAlert.filter({ 
    status: 'active',
    severity: { $in: ['critical', 'high'] }
  });
  
  const prioritization = await context.integrations.Core.InvokeLLM({
    prompt: `Intelligently prioritize tasks using multi-factor analysis:

Tasks to Prioritize:
${tasks.map((t, i) => `${i + 1}. ${t.title} - ${t.description} (Deadline: ${t.deadline || 'None'})`).join('\n')}

Context:
- User Goals: ${userGoals.map(g => g.goal_type).join(', ')}
- Agent Workload: ${agentWorkloads.length} recent tasks
- Urgent Alerts: ${urgentAlerts.length}
- Context Factors: ${JSON.stringify(context_factors)}

Prioritize based on:
1. Urgency vs Importance matrix
2. Goal alignment
3. Resource availability
4. Dependencies
5. Impact potential
6. Risk of delay`,
    response_json_schema: {
      type: "object",
      properties: {
        prioritized_tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task_index: { type: "number" },
              priority_score: { type: "number" },
              priority_level: { type: "string", enum: ["critical", "high", "medium", "low"] },
              reasoning: { type: "string" },
              recommended_start_time: { type: "string" },
              estimated_effort_hours: { type: "number" },
              assigned_to: { type: "string" }
            }
          }
        },
        execution_sequence: { type: "array", items: { type: "number" } },
        parallel_execution_groups: { type: "array", items: { type: "array", items: { type: "number" } } },
        bottlenecks_identified: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  for (const prioritizedTask of (prioritization?.prioritized_tasks || [])) {
    if (!prioritizedTask || prioritizedTask.task_index === undefined) continue;
    const originalTask = tasks[prioritizedTask.task_index];
    
    await context.entities.Workflow.create({
      workflow_name: originalTask.title,
      description: originalTask.description,
      priority: prioritizedTask.priority_level,
      status: 'pending',
      estimated_duration: prioritizedTask.estimated_effort_hours,
      user_email,
      metadata: {
        priority_score: prioritizedTask.priority_score,
        reasoning: prioritizedTask.reasoning,
        recommended_start: prioritizedTask.recommended_start_time
      }
    });
  }
  
  return {
    prioritization,
    tasks_prioritized: tasks.length,
    parallel_groups: prioritization?.parallel_execution_groups?.length || 0
  };
}