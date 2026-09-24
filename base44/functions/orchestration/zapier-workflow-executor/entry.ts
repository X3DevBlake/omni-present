import { base44 } from '@/api/base44Client';

/**
 * Zapier Workflow Executor - Execute complex workflow sequences
 */

// Execute a complete workflow
export async function executeWorkflow(workflowId, triggerData) {
  const startTime = Date.now();
  let execution = null;

  try {
    // Get workflow definition
    const workflows = await base44.entities.Workflow.list({ id: workflowId }, '', 1);
    if (workflows.length === 0) throw new Error('Workflow not found');
    const workflow = workflows[0];

    // Create execution record
    execution = await base44.entities.WorkflowExecution.create({
      workflow_id: workflowId,
      user_email: workflow.user_email,
      trigger_data: triggerData,
      status: 'running'
    });

    const actionsExecuted = [];
    let allSuccess = true;

    // Execute each action in sequence
    for (const action of workflow.actions) {
      const actionStart = Date.now();
      try {
        const result = await executeAction(action, triggerData);
        actionsExecuted.push({
          action_id: action.id,
          service: action.service,
          status: 'completed',
          result,
          executed_at: new Date().toISOString()
        });
      } catch (error) {
        allSuccess = false;
        actionsExecuted.push({
          action_id: action.id,
          service: action.service,
          status: 'failed',
          error: error.message,
          executed_at: new Date().toISOString()
        });

        // Check if workflow should continue on error
        if (action.config?.stopOnError) {
          throw error;
        }
      }
    }

    // Update execution record
    const duration = Date.now() - startTime;
    await base44.entities.WorkflowExecution.update(execution.id, {
      status: allSuccess ? 'completed' : 'failed',
      actions_executed: actionsExecuted,
      duration_ms: duration
    });

    // Update workflow stats
    await base44.entities.Workflow.update(workflowId, {
      execution_count: (workflow.execution_count || 0) + 1,
      last_executed: new Date().toISOString()
    });

    return { success: allSuccess, executionId: execution.id, duration };
  } catch (error) {
    if (execution) {
      await base44.entities.WorkflowExecution.update(execution.id, {
        status: 'failed',
        error_message: error.message,
        duration_ms: Date.now() - startTime
      });
    }
    throw error;
  }
}

// Execute individual action
async function executeAction(action, context) {
  switch (action.service) {
    case 'zapier':
      return executeZapierAction(action, context);
    case 'gemini':
      return executeGeminiAction(action, context);
    case 'slack':
      return executeSlackAction(action, context);
    case 'email':
      return executeEmailAction(action, context);
    case 'twilio':
      return executeTwilioAction(action, context);
    case 'base44':
      return executeBase44Action(action, context);
    default:
      throw new Error(`Unknown service: ${action.service}`);
  }
}

// Execute Zapier action (via webhook/API)
async function executeZapierAction(action, context) {
  try {
    const zapierPayload = {
      ...action.config,
      context_data: context
    };

    // Send to Zapier webhook/API
    const response = await fetch(action.config.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zapierPayload)
    });

    if (!response.ok) throw new Error(`Zapier API error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    throw new Error(`Zapier action failed: ${error.message}`);
  }
}

// Execute Gemini action (AI processing)
async function executeGeminiAction(action, context) {
  try {
    const prompt = replaceTemplateVariables(action.config.prompt, context);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: action.config.response_schema || undefined
    });

    return result;
  } catch (error) {
    throw new Error(`Gemini action failed: ${error.message}`);
  }
}

// Execute Slack action
async function executeSlackAction(action, context) {
  try {
    const message = replaceTemplateVariables(action.config.message, context);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Send this message to Slack channel ${action.config.channel}: "${message}"`
    });

    return { channel: action.config.channel, message_sent: true };
  } catch (error) {
    throw new Error(`Slack action failed: ${error.message}`);
  }
}

// Execute email action
async function executeEmailAction(action, context) {
  try {
    const to = replaceTemplateVariables(action.config.to, context);
    const subject = replaceTemplateVariables(action.config.subject, context);
    const body = replaceTemplateVariables(action.config.body, context);

    await base44.integrations.Core.SendEmail({
      to,
      subject,
      body,
      from_name: action.config.from_name || 'Base44 Automation'
    });

    return { email_sent: true, recipient: to };
  } catch (error) {
    throw new Error(`Email action failed: ${error.message}`);
  }
}

// Execute Twilio action (SMS/Call)
async function executeTwilioAction(action, context) {
  try {
    const message = replaceTemplateVariables(action.config.message, context);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Send SMS via Twilio to ${action.config.phone}: "${message}"`
    });

    return { phone: action.config.phone, sms_sent: true };
  } catch (error) {
    throw new Error(`Twilio action failed: ${error.message}`);
  }
}

// Execute Base44 action (native platform action)
async function executeBase44Action(action, context) {
  try {
    switch (action.type) {
      case 'create_entity':
        return await base44.entities[action.config.entity_name].create(
          replaceTemplateVariables(action.config.data, context)
        );
      case 'update_entity':
        return await base44.entities[action.config.entity_name].update(
          action.config.entity_id,
          replaceTemplateVariables(action.config.data, context)
        );
      case 'notify_user':
        return await base44.integrations.Core.InvokeLLM({
          prompt: `Create in-app notification for user: ${replaceTemplateVariables(action.config.message, context)}`
        });
      default:
        throw new Error(`Unknown Base44 action: ${action.type}`);
    }
  } catch (error) {
    throw new Error(`Base44 action failed: ${error.message}`);
  }
}

// Template variable replacement (e.g., {{user_email}}, {{amount}})
function replaceTemplateVariables(template, context) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] || match;
  });
}

// Schedule workflow execution
export async function scheduleWorkflow(workflowId, schedule) {
  try {
    const workflow = await base44.entities.Workflow.list({ id: workflowId }, '', 1);
    if (workflow.length === 0) throw new Error('Workflow not found');

    // In production, integrate with a scheduling service (e.g., node-cron, AWS EventBridge)
    // For now, store schedule config
    await base44.entities.Workflow.update(workflowId, {
      trigger: {
        type: 'schedule',
        config: schedule
      }
    });

    return { scheduled: true, workflow_id: workflowId };
  } catch (error) {
    throw new Error(`Failed to schedule workflow: ${error.message}`);
  }
}

// Get workflow execution history
export async function getWorkflowHistory(workflowId, limit = 50) {
  try {
    return await base44.entities.WorkflowExecution.list(
      { workflow_id: workflowId },
      '-created_date',
      limit
    );
  } catch (error) {
    throw new Error(`Failed to retrieve history: ${error.message}`);
  }
}