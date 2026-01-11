import { base44 } from '@/api/base44Client';

export async function intelligentlyRouteVideo(videoData, userPreferences) {
  try {
    // Route video to appropriate channels based on content and user preferences
    const [contentAnalysis, routingRules, destinations] = await Promise.all([
      analyzeVideoContent(videoData),
      determineRoutingRules(videoData, userPreferences),
      identifyDestinations(videoData, userPreferences),
    ]);

    // Execute routing
    const routing = await base44.integrations.Core.InvokeLLM({
      prompt: `Route video intelligently:
      
Content: ${JSON.stringify(contentAnalysis)}
Rules: ${JSON.stringify(routingRules)}
Destinations: ${JSON.stringify(destinations)}

Route to:
1. Slack channels
2. Google Drive folders
3. Team members
4. External stakeholders
5. Archive storage

Include:
- Summaries
- Highlights
- Transcripts
- Notifications`,
    });

    return routing;
  } catch (error) {
    console.error('Error routing video:', error);
    throw error;
  }
}

async function analyzeVideoContent(videoData) {
  try {
    return {
      type: videoData.type,
      duration: videoData.duration,
      participants: videoData.participants || [],
      topics: videoData.topics || [],
      confidential: videoData.confidential || false,
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

async function determineRoutingRules(videoData, preferences) {
  try {
    const rules = await base44.integrations.Core.InvokeLLM({
      prompt: `Determine routing rules:
      
VideoType: ${videoData.type}
UserPreferences: ${JSON.stringify(preferences)}

Rules for:
1. Slack channel selection
2. Drive folder organization
3. Access permissions
4. Retention policy
5. Sharing restrictions`,
      response_json_schema: {
        type: 'object',
        properties: {
          slackChannels: { type: 'array', items: { type: 'string' } },
          driveFolder: { type: 'string' },
          permissions: { type: 'object' },
          retention: { type: 'string' },
          sharing: { type: 'object' },
        },
      },
    });

    return rules;
  } catch (error) {
    console.error('Error determining rules:', error);
    throw error;
  }
}

async function identifyDestinations(videoData, preferences) {
  try {
    const destinations = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify video destinations:
      
VideoData: ${JSON.stringify(videoData)}
Preferences: ${JSON.stringify(preferences)}

Identify:
1. Primary recipients
2. Secondary stakeholders
3. Archive locations
4. Backup storage
5. Long-term retention`,
      response_json_schema: {
        type: 'object',
        properties: {
          primary: { type: 'array', items: { type: 'string' } },
          secondary: { type: 'array', items: { type: 'string' } },
          archive: { type: 'array', items: { type: 'string' } },
          backup: { type: 'string' },
        },
      },
    });

    return destinations;
  } catch (error) {
    console.error('Error identifying destinations:', error);
    throw error;
  }
}

export async function createVideoDistributionWorkflow(videoData, recipients) {
  try {
    // Create Zapier workflow for automatic video distribution
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create video distribution Zapier workflow:
      
VideoID: ${videoData.id}
Title: ${videoData.title}
Recipients: ${recipients.join(', ')}

Workflow:
1. Trigger: Video processing complete
2. Action: Generate transcript
3. Action: Create Slack summary
4. Action: Send to recipients
5. Action: Add to Google Drive
6. Action: Schedule follow-ups
7. Action: Log completion`,
      response_json_schema: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
          triggers: { type: 'array', items: { type: 'object' } },
          actions: { type: 'array', items: { type: 'object' } },
          status: { type: 'string' },
        },
      },
    });

    return workflow;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}