import { base44 } from '@/api/base44Client';
import { 
  processVideoStream, 
  generateVideoHighlights, 
  batchProcessVideos 
} from './advanced-video-processor';
import { 
  initializeRealtimeStream, 
  endStreamAndProcess, 
  monitorRealtimeStream 
} from './realtime-streaming-orchestrator';
import { 
  intelligentlyRouteVideo, 
  createVideoDistributionWorkflow 
} from './intelligent-video-router';
import { 
  generateVideoAnalytics, 
  generateVideoInsights 
} from './video-analytics-engine';

export async function orchestrateCompleteVideoSession(sessionConfig, userEmail) {
  try {
    console.log('Starting complete video session orchestration...');

    // Phase 1: Initialize streaming
    console.log('Phase 1: Initializing real-time stream...');
    const streamSetup = await initializeRealtimeStream(sessionConfig);

    // Phase 2: Monitor stream (background process)
    console.log('Phase 2: Starting stream monitoring...');
    const monitoring = await monitorRealtimeStream(streamSetup.streamId, userEmail);

    // Phase 3: End stream and process
    console.log('Phase 3: Ending stream and processing...');
    const streamEnd = await endStreamAndProcess(
      streamSetup.streamId,
      sessionConfig,
      userEmail
    );

    // Phase 4: Process video content
    console.log('Phase 4: Processing video content...');
    const videoProcessing = await processVideoStream(sessionConfig, userEmail);

    // Phase 5: Generate highlights
    console.log('Phase 5: Generating video highlights...');
    const highlights = await generateVideoHighlights(sessionConfig);

    // Phase 6: Analytics
    console.log('Phase 6: Generating video analytics...');
    const analytics = await generateVideoAnalytics(streamSetup.streamId, sessionConfig);
    const insights = await generateVideoInsights(analytics);

    // Phase 7: Intelligent routing
    console.log('Phase 7: Routing video to destinations...');
    const userPreferences = await getUserPreferences(userEmail);
    const routing = await intelligentlyRouteVideo(sessionConfig, userPreferences);

    // Phase 8: Create distribution workflow
    console.log('Phase 8: Creating distribution workflow...');
    const recipients = await identifyRecipients(sessionConfig, userEmail);
    const workflow = await createVideoDistributionWorkflow(sessionConfig, recipients);

    // Phase 9: Final notifications
    console.log('Phase 9: Sending final notifications...');
    await sendComprehensiveNotifications(
      streamSetup.streamId,
      videoProcessing,
      highlights,
      analytics,
      insights,
      userEmail
    );

    return {
      streamId: streamSetup.streamId,
      status: 'completed',
      phases: {
        setup: streamSetup,
        processing: videoProcessing,
        highlights: highlights,
        analytics: analytics,
        insights: insights,
        routing: routing,
        workflow: workflow,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error orchestrating video session:', error);
    throw error;
  }
}

async function getUserPreferences(userEmail) {
  try {
    const prefs = await base44.integrations.Core.InvokeLLM({
      prompt: `Get user video preferences for ${userEmail}:
      
Retrieve:
1. Preferred Slack channels
2. Google Drive folder structure
3. Distribution preferences
4. Privacy settings
5. Notification preferences`,
      response_json_schema: {
        type: 'object',
        properties: {
          slackChannels: { type: 'array', items: { type: 'string' } },
          driveFolder: { type: 'string' },
          distribution: { type: 'object' },
          privacy: { type: 'object' },
          notifications: { type: 'object' },
        },
      },
    });

    return prefs;
  } catch (error) {
    console.error('Error getting preferences:', error);
    throw error;
  }
}

async function identifyRecipients(sessionConfig, userEmail) {
  try {
    const recipients = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify video recipients:
      
SessionType: ${sessionConfig.type}
Participants: ${sessionConfig.participants?.join(', ')}
User: ${userEmail}

Identify all recipients based on:
1. Meeting participants
2. Team members
3. Stakeholders
4. External parties`,
    });

    return recipients.split(',').map(r => r.trim());
  } catch (error) {
    console.error('Error identifying recipients:', error);
    throw error;
  }
}

async function sendComprehensiveNotifications(
  streamId,
  processing,
  highlights,
  analytics,
  insights,
  userEmail
) {
  try {
    // Send notifications across all channels
    const notifications = await base44.integrations.Core.InvokeLLM({
      prompt: `Send comprehensive video notifications:
      
StreamID: ${streamId}
User: ${userEmail}

Send via:
1. Slack - Summary and action items
2. Email - Full report
3. Google Calendar - Follow-ups
4. Teams - Meeting summary

Include:
- Highlights (${highlights?.topMoments?.length || 0} moments)
- Analytics (engagement: ${analytics?.engagement?.score || 0}%)
- Insights (${insights?.insights?.length || 0} insights)
- Action items
- Recording link`,
    });

    return notifications;
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
}

export async function createAutomatedVideoWorkflows(userEmail) {
  try {
    // Create all automated workflows for user
    const workflows = await base44.integrations.Core.InvokeLLM({
      prompt: `Create automated video workflows for ${userEmail}:
      
Setup:
1. Auto-record all meetings
2. Auto-transcribe videos
3. Auto-summarize content
4. Auto-distribute to Slack
5. Auto-archive to Google Drive
6. Auto-schedule follow-ups
7. Auto-notify stakeholders`,
      response_json_schema: {
        type: 'object',
        properties: {
          recording: { type: 'object' },
          transcription: { type: 'object' },
          summarization: { type: 'object' },
          distribution: { type: 'object' },
          archiving: { type: 'object' },
          followUp: { type: 'object' },
          notifications: { type: 'object' },
        },
      },
    });

    return workflows;
  } catch (error) {
    console.error('Error creating workflows:', error);
    throw error;
  }
}