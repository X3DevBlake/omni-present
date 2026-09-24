import { base44 } from '@/api/base44Client';

export async function suggestWorkflowsFromAnalytics(videoAnalytics, userEmail) {
  try {
    // Gemini analyzes video analytics and suggests optimal Zapier workflows
    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze video analytics and suggest optimal Zapier workflows:
      
Video Type: ${videoAnalytics.videoType}
Engagement: ${videoAnalytics.engagement?.score}
Success Probability: ${videoAnalytics.predictions?.outcome?.successProbability}%
Participants: ${videoAnalytics.participants?.length}
Duration: ${videoAnalytics.duration}
User: ${userEmail}

Based on analytics, suggest 3-5 high-impact Zapier workflows:
1. Client follow-up automation
2. Transcript distribution
3. Training reminders
4. Content amplification
5. Data sync workflows

For each workflow provide:
- Workflow name
- Trigger conditions
- Actions to automate
- Expected ROI/benefit
- Complexity level
- Estimated setup time`,
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
                benefit: { type: 'string' },
                complexity: { type: 'string' },
                setupTime: { type: 'string' },
                estimatedROI: { type: 'string' },
              },
            },
          },
          reasoning: { type: 'string' },
        },
      },
    });

    return suggestions;
  } catch (error) {
    console.error('Error suggesting workflows:', error);
    throw error;
  }
}

export async function generateWorkflowImplementation(workflow, userEmail) {
  try {
    // Generate detailed Zapier workflow implementation plan
    const implementation = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate detailed Zapier workflow implementation:
      
Workflow: ${workflow.name}
Trigger: ${workflow.trigger}
Actions: ${workflow.actions.join(', ')}
User: ${userEmail}

Create step-by-step implementation plan:
1. Zapier app connections needed
2. Step-by-step trigger setup
3. Action configurations
4. Data mapping
5. Testing checklist
6. Monitoring setup`,
      response_json_schema: {
        type: 'object',
        properties: {
          steps: { type: 'array', items: { type: 'object' } },
          appsNeeded: { type: 'array', items: { type: 'string' } },
          dataMapping: { type: 'object' },
          testing: { type: 'array', items: { type: 'string' } },
          monitoring: { type: 'object' },
        },
      },
    });

    return implementation;
  } catch (error) {
    console.error('Error generating implementation:', error);
    throw error;
  }
}

export async function createAutomatedClientFollowUp(videoData, userEmail) {
  try {
    // Create specific workflow for client follow-ups after sales calls
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create client follow-up workflow for sales calls:
      
Video Type: ${videoData.type}
Participants: ${videoData.participants?.join(', ')}
User: ${userEmail}

Workflow triggers on: Meeting ends
Actions:
1. Extract key discussion points from transcript
2. Identify next steps mentioned
3. Create follow-up email template
4. Add to Slack channel
5. Create calendar reminder
6. Log in CRM
7. Send via email to participants

Include:
- Personalized greeting
- Meeting summary
- Action items
- Next meeting date
- Contact info`,
    });

    return workflow;
  } catch (error) {
    console.error('Error creating follow-up workflow:', error);
    throw error;
  }
}

export async function createTranscriptDistributionWorkflow(videoData, userEmail) {
  try {
    // Create workflow for automatic transcript distribution
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create transcript distribution workflow:
      
Video Type: ${videoData.type}
Participants: ${videoData.participants?.join(', ')}
Teams: ${videoData.teams?.join(', ') || 'Not specified'}
User: ${userEmail}

Workflow:
1. Meeting ends - trigger automation
2. Generate transcript
3. Create summary (Gemini)
4. Route to relevant channels
   - Sales: Sales Slack channel
   - Training: Learning channel
   - Executive: Executive summary
5. Tag by topic/department
6. Store in Google Drive organized folder
7. Send Slack notifications to teams
8. Sync to Snowflake for analytics`,
    });

    return workflow;
  } catch (error) {
    console.error('Error creating distribution workflow:', error);
    throw error;
  }
}

export async function createRecurringTrainingReminders(videoData, userEmail) {
  try {
    // Create recurring training reminder workflow
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create recurring training reminder workflow:
      
Training Type: ${videoData.type}
Audience: ${videoData.participants?.join(', ')}
User: ${userEmail}

Workflow:
1. Schedule based on training calendar
2. Send Slack reminder 24h before
3. Send email reminder 1h before
4. Post video link and materials
5. Track attendance
6. Send follow-up survey after training
7. Collect feedback
8. Update training records
9. Notify managers of completion
10. Award badges/certificates`,
    });

    return workflow;
  } catch (error) {
    console.error('Error creating reminder workflow:', error);
    throw error;
  }
}