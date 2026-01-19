import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, input_data } = await req.json();
    
    // Get workflow
    const workflows = await base44.entities.AutomatedWorkflow.filter({ id: workflow_id });
    const workflow = workflows[0];
    
    if (!workflow) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    if (!workflow.is_active) {
      return Response.json({ error: 'Workflow is not active' }, { status: 400 });
    }
    
    const startTime = Date.now();
    const stepResults = [];
    let currentData = input_data;
    
    // Execute each step
    for (const step of workflow.steps) {
      try {
        let stepResult;
        
        // Execute based on action type
        switch (step.action_type) {
          case 'call_function':
            const funcResponse = await base44.functions.invoke(step.config.function_name, currentData);
            stepResult = funcResponse.data;
            break;
            
          case 'send_email':
            await base44.integrations.Core.SendEmail({
              to: step.config.recipient,
              subject: step.config.subject,
              body: step.config.body
            });
            stepResult = { success: true };
            break;
            
          case 'create_entity':
            stepResult = await base44.entities[step.config.entity_name].create(currentData);
            break;
            
          default:
            stepResult = { skipped: true };
        }
        
        stepResults.push({
          step_name: step.step_name,
          success: true,
          result: stepResult
        });
        
        currentData = stepResult;
        
      } catch (error) {
        stepResults.push({
          step_name: step.step_name,
          success: false,
          error: error.message
        });
        
        // Handle failure
        if (step.on_failure === 'stop') {
          break;
        }
      }
    }
    
    const duration = (Date.now() - startTime) / 1000;
    const successfulSteps = stepResults.filter(r => r.success).length;
    const overallSuccess = successfulSteps === workflow.steps.length;
    
    // Update workflow stats
    await base44.entities.AutomatedWorkflow.update(workflow_id, {
      execution_count: (workflow.execution_count || 0) + 1,
      success_count: (workflow.success_count || 0) + (overallSuccess ? 1 : 0),
      failure_count: (workflow.failure_count || 0) + (overallSuccess ? 0 : 1),
      last_execution: new Date().toISOString(),
      avg_duration_seconds: duration
    });
    
    return Response.json({
      workflow_id,
      success: overallSuccess,
      steps_executed: stepResults.length,
      steps_successful: successfulSteps,
      duration_seconds: duration,
      step_results: stepResults
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});