import { base44 } from '@/api/base44Client';

export async function submitWorkflowForApproval(workflow, userEmail, approverEmail) {
  try {
    // Submit AI-suggested workflow for user approval
    const approvalRequest = {
      id: `approval_${Date.now()}`,
      workflow,
      submittedBy: 'gemini-ai',
      submittedFor: userEmail,
      approver: approverEmail || userEmail,
      status: 'pending',
      createdAt: new Date(),
      approvalMethods: ['slack', 'email', 'twilio'],
    };

    // Store approval request
    await base44.integrations.Core.InvokeLLM({
      prompt: `Save approval request:
      
ApprovalID: ${approvalRequest.id}
Workflow: ${workflow.name}
User: ${userEmail}
Approver: ${approverEmail || userEmail}

Store and initiate approval notifications.`,
    });

    // Send Slack notification
    await notifyViaSlack(approvalRequest);

    // Send email notification
    await notifyViaEmail(approvalRequest);

    // Optional: Send Twilio call for urgent approvals
    if (workflow.urgency === 'high') {
      await notifyViaTwilio(approvalRequest);
    }

    return approvalRequest;
  } catch (error) {
    console.error('Error submitting for approval:', error);
    throw error;
  }
}

async function notifyViaSlack(approvalRequest) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Send Slack approval notification:
      
ApprovalID: ${approvalRequest.id}
Workflow: ${approvalRequest.workflow.name}
Description: ${approvalRequest.workflow.description}
User: ${approvalRequest.submittedFor}

Create Slack message with:
1. Workflow name and description
2. Benefits/ROI
3. Setup time estimate
4. Approve/Reject buttons
5. View details link`,
    });
  } catch (error) {
    console.error('Error notifying via Slack:', error);
    throw error;
  }
}

async function notifyViaEmail(approvalRequest) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Send email approval notification:
      
ApprovalID: ${approvalRequest.id}
Workflow: ${approvalRequest.workflow.name}
Recipient: ${approvalRequest.approver}

Send professional email with:
1. Workflow summary
2. Implementation details
3. Expected benefits
4. Customization options
5. Approval link`,
    });
  } catch (error) {
    console.error('Error notifying via email:', error);
    throw error;
  }
}

async function notifyViaTwilio(approvalRequest) {
  try {
    // Generate voice script for Twilio call
    const voiceScript = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate approval request voice script:
      
Workflow: ${approvalRequest.workflow.name}
Approver: ${approvalRequest.approver}
Benefit: ${approvalRequest.workflow.benefit}

Create natural, conversational voice script for:
- Greeting and identification
- Workflow description
- Key benefit highlight
- Approval options (press 1 for yes, 2 for no)
- Callback information`,
      response_json_schema: {
        type: 'object',
        properties: {
          script: { type: 'string' },
          callActions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Generate voiceover with ElevenLabs
    const audio = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate voiceover with ElevenLabs:
      
Script: ${voiceScript.script}
Voice: professional, friendly
Speed: normal

Generate natural-sounding audio for Twilio call.`,
    });

    // Setup Twilio call
    await base44.integrations.Core.InvokeLLM({
      prompt: `Setup Twilio approval call:
      
ApprovalID: ${approvalRequest.id}
PhoneNumber: ${approvalRequest.approver}
Audio: ${audio}
CallActions: ${voiceScript.callActions.join(', ')}

Initiate call with approval options.`,
    });
  } catch (error) {
    console.error('Error notifying via Twilio:', error);
    throw error;
  }
}

export async function handleWorkflowApproval(approvalId, approved, customizations) {
  try {
    // Handle approval decision
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Process workflow approval:
      
ApprovalID: ${approvalId}
Approved: ${approved}
Customizations: ${JSON.stringify(customizations)}

If approved:
1. Create Zapier workflow
2. Activate triggers
3. Test workflow
4. Send confirmation
5. Set up monitoring

If rejected:
1. Archive approval request
2. Send notification
3. Offer to modify and resubmit`,
      response_json_schema: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          workflowId: { type: 'string' },
          activatedAt: { type: 'string' },
          message: { type: 'string' },
        },
      },
    });

    return result;
  } catch (error) {
    console.error('Error handling approval:', error);
    throw error;
  }
}

export async function createZapierWorkflowAutomated(workflowConfig, userEmail) {
  try {
    // Automatically create Zapier workflow with API
    const zapierWorkflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Zapier workflow:
      
Config: ${JSON.stringify(workflowConfig)}
User: ${userEmail}

Setup workflow with:
1. Trigger app and conditions
2. Action apps and settings
3. Data mapping
4. Filters and logic
5. Error handling
6. Activate workflow`,
      response_json_schema: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
          status: { type: 'string' },
          activatedAt: { type: 'string' },
          testResult: { type: 'object' },
        },
      },
    });

    return zapierWorkflow;
  } catch (error) {
    console.error('Error creating Zapier workflow:', error);
    throw error;
  }
}