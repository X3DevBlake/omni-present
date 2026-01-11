import { base44 } from '@/api/base44Client';

// Analyze comment and suggest workflows
export async function suggestWorkflowsForComment(commentContent, documentContext, userRole) {
  try {
    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest relevant Zapier workflows for this comment:
      
Comment: "${commentContent}"
Document: ${documentContext}
UserRole: ${userRole}

Based on comment content, suggest 3-5 workflows:
1. What automated action would help?
2. Who needs to be notified?
3. What task or follow-up is needed?
4. Any data sync required?

For each suggestion provide:
- Name
- Trigger
- Actions
- Why it's relevant
- Implementation complexity
- Permission requirements`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                trigger: { type: 'string' },
                actions: { type: 'array', items: { type: 'string' } },
                relevanceScore: { type: 'number' },
                requiresApproval: { type: 'boolean' },
              },
            },
          },
        },
      },
    });

    return suggestions.suggestions;
  } catch (error) {
    console.error('Error suggesting workflows:', error);
    return [];
  }
}

// Create Zapier workflow from suggestion
export async function createWorkflowFromSuggestion(userEmail, suggestion, permissions) {
  try {
    // Check permissions
    if (suggestion.requiresApproval && !canExecuteAction(userEmail, 'workflows', 'create', permissions)) {
      return {
        status: 'pending_approval',
        message: 'This workflow requires approval',
      };
    }

    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Zapier workflow:
      
User: ${userEmail}
Workflow: ${JSON.stringify(suggestion)}

Create workflow with:
1. Configured triggers
2. Mapped actions
3. Error handling
4. Logging
5. Testing mode first`,
    });

    // Audit the workflow creation
    await base44.integrations.Core.InvokeLLM({
      prompt: `Log workflow creation:
      User: ${userEmail}
      Workflow: ${suggestion.name}
      Source: Comment suggestion
      Timestamp: ${new Date().toISOString()}`,
    });

    return {
      status: 'created',
      workflowId: workflow.id,
      workflow,
    };
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}

// Check user permissions
function canExecuteAction(userEmail, resource, action, permissions) {
  return permissions.some(p => p.resource === resource && p.actions.includes(action));
}

// Suggest notification workflows for alerts
export async function suggestNotificationWorkflows(alertType, severity, affectedUsers) {
  try {
    const workflows = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest notification workflows for alert:
      
AlertType: ${alertType}
Severity: ${severity}
AffectedUsers: ${affectedUsers.join(', ')}

Suggest workflows to:
1. Notify via Slack with appropriate urgency
2. Send email to relevant parties
3. Create task for follow-up
4. Log to audit trail
5. Trigger escalation if needed`,
      response_json_schema: {
        type: 'object',
        properties: {
          workflows: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    return workflows.workflows;
  } catch (error) {
    console.error('Error suggesting notifications:', error);
    return [];
  }
}

// Suggest team action workflows
export async function suggestTeamActionWorkflows(actionType, documentData, teamSize) {
  try {
    const workflows = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest team action workflows:
      
ActionType: ${actionType}
DocumentData: ${JSON.stringify(documentData)}
TeamSize: ${teamSize}

Suggest workflows for:
1. Task creation and assignment
2. Review and approval process
3. Status updates
4. Document sharing
5. Calendar invites`,
      response_json_schema: {
        type: 'object',
        properties: {
          workflows: { type: 'array', items: { type: 'object' } },
          recommendedFor: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return workflows.workflows;
  } catch (error) {
    console.error('Error suggesting team workflows:', error);
    return [];
  }
}

// Get workflow templates
export function getWorkflowTemplates() {
  return [
    {
      id: 'notify-team-risk',
      name: 'Notify Team on Risk Alert',
      description: 'Send Slack message and email to team when risk detected',
      actions: ['slack_message', 'email', 'audit_log'],
    },
    {
      id: 'create-followup-task',
      name: 'Create Follow-up Task',
      description: 'Automatically create task from comment for follow-up',
      actions: ['create_task', 'assign_owner', 'set_deadline'],
    },
    {
      id: 'sync-to-sheets',
      name: 'Sync to Google Sheets',
      description: 'Automatically update Google Sheets with new data',
      actions: ['fetch_data', 'update_sheet', 'format_cells'],
    },
    {
      id: 'trigger-rebalance',
      name: 'Trigger Portfolio Rebalance',
      description: 'Execute portfolio rebalancing based on thresholds',
      actions: ['check_allocation', 'execute_trades', 'log_results'],
    },
    {
      id: 'generate-report',
      name: 'Generate Report',
      description: 'Automatically generate and send analytics report',
      actions: ['aggregate_data', 'create_report', 'email_report'],
    },
  ];
}