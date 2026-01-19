import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id } = await req.json();

    const workflows = await base44.asServiceRole.entities.Workflow.filter({ id: workflow_id });
    const workflow = workflows[0];

    if (!workflow) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Create execution record
    const execution = await base44.asServiceRole.entities.WorkflowExecution.create({
      workflow_id,
      execution_status: 'running',
      completed_tasks: [],
      failed_tasks: [],
      execution_log: [],
      start_time: new Date().toISOString(),
    });

    // Execute tasks based on workflow type
    const tasks = workflow.tasks || [];
    const completedTasks = [];
    const executionLog = [];

    if (workflow.workflow_type === 'sequential') {
      // Execute tasks one by one
      for (const task of tasks) {
        executionLog.push({
          timestamp: new Date().toISOString(),
          task_id: task.task_id,
          event: 'started',
        });

        // Simulate task execution (in production, call actual agent)
        await new Promise(resolve => setTimeout(resolve, 100));

        task.status = 'completed';
        completedTasks.push(task.task_id);

        executionLog.push({
          timestamp: new Date().toISOString(),
          task_id: task.task_id,
          event: 'completed',
        });
      }
    } else if (workflow.workflow_type === 'parallel') {
      // Execute all tasks simultaneously
      await Promise.all(tasks.map(async (task) => {
        executionLog.push({
          timestamp: new Date().toISOString(),
          task_id: task.task_id,
          event: 'started',
        });

        await new Promise(resolve => setTimeout(resolve, 100));
        task.status = 'completed';
        completedTasks.push(task.task_id);

        executionLog.push({
          timestamp: new Date().toISOString(),
          task_id: task.task_id,
          event: 'completed',
        });
      }));
    }

    // Update workflow and execution
    await base44.asServiceRole.entities.Workflow.update(workflow_id, {
      status: 'completed',
      progress_percentage: 100,
      tasks,
    });

    await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
      execution_status: 'completed',
      completed_tasks: completedTasks,
      execution_log: executionLog,
      end_time: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      execution_id: execution.id,
      completed_tasks: completedTasks.length,
      total_tasks: tasks.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});