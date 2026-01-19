import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id } = await req.json();

    // Get workflow details
    const workflow = await base44.asServiceRole.entities.Workflow.filter({ id: workflow_id });
    if (!workflow || workflow.length === 0) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const workflowData = workflow[0];
    const tasks = workflowData.tasks || [];

    // Create execution record
    const execution = await base44.asServiceRole.entities.WorkflowExecution.create({
      workflow_id,
      status: 'running',
      started_at: new Date().toISOString(),
      total_tasks: tasks.length,
      completed_tasks: 0,
    });

    // Execute tasks based on dependencies
    const executionResults = [];
    const completedTasks = new Set();

    for (const task of tasks) {
      // Check if dependencies are met
      const dependencies = task.dependencies || [];
      const canExecute = dependencies.every(dep => completedTasks.has(dep));

      if (canExecute) {
        // Simulate task execution
        const result = {
          task_id: task.id,
          task_name: task.name,
          agent_id: task.agent_id,
          status: 'completed',
          executed_at: new Date().toISOString(),
        };

        executionResults.push(result);
        completedTasks.add(task.id);

        // Update execution progress
        await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
          completed_tasks: completedTasks.size,
          status: completedTasks.size === tasks.length ? 'completed' : 'running',
        });
      }
    }

    return Response.json({
      success: true,
      execution_id: execution.id,
      results: executionResults,
      message: `Workflow executed: ${completedTasks.size}/${tasks.length} tasks completed`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});