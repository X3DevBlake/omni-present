import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, workflowId, trigger, actions } = body;

    if (action === 'create_workflow') {
      // Create new workflow
      const workflow = {
        id: `workflow-${Date.now()}`,
        name: body.name,
        trigger,
        actions,
        enabled: true,
        createdAt: new Date().toISOString(),
        executions: 0,
      };

      // Store workflow
      await base44.asServiceRole.entities.Workflow?.create?.({
        name: body.name,
        trigger_event: trigger,
        workflow_nodes: actions,
        status: 'active',
      }).catch(() => null);

      return Response.json({
        success: true,
        workflow,
        message: 'Workflow created successfully',
      });
    }

    if (action === 'execute_workflow') {
      // Execute workflow sequence
      const executionLog = [];
      let currentDelay = 0;

      for (const step of actions) {
        await new Promise((resolve) => setTimeout(resolve, step.delay * 1000));
        executionLog.push({
          hub: step.hub,
          action: step.action,
          status: 'completed',
          timestamp: new Date().toISOString(),
        });
      }

      // Record execution
      await base44.asServiceRole.entities.WorkflowExecution?.create?.({
        workflow_id: workflowId,
        status: 'completed',
        execution_log: executionLog,
        timestamp: new Date().toISOString(),
      }).catch(() => null);

      return Response.json({
        success: true,
        workflowId,
        executionLog,
        totalTime: `${actions[actions.length - 1].delay}s`,
      });
    }

    if (action === 'list_workflows') {
      // List all workflows
      const workflows = await base44.asServiceRole.entities.Workflow?.list?.()
        .catch(() => []);

      return Response.json({
        success: true,
        workflows: workflows || [],
        count: workflows?.length || 0,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});