import { base44 } from '@/api/base44Client';

export async function createSkillDevelopmentWorkflow(coachingPlan, userEmail) {
  try {
    // Create Zapier workflows for skill development
    const workflows = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Zapier skill development workflows:
      
CoachingPlan: ${JSON.stringify(coachingPlan)}
User: ${userEmail}

Create automated workflows:
1. Daily exercise reminder (via Slack/Email)
2. Weekly progress review (aggregate metrics)
3. Resource delivery (daily tips via Slack)
4. Peer comparison (weekly vs benchmarks)
5. Content generation (create coaching videos)
6. Feedback collection (post-meeting surveys)
7. Analytics sync (Snowflake database updates)`,
      response_json_schema: {
        type: 'object',
        properties: {
          dailyReminders: { type: 'object' },
          weeklyReview: { type: 'object' },
          resourceDelivery: { type: 'object' },
          peerComparison: { type: 'object' },
          contentGeneration: { type: 'object' },
          feedbackCollection: { type: 'object' },
          analyticsSync: { type: 'object' },
        },
      },
    });

    return workflows;
  } catch (error) {
    console.error('Error creating workflows:', error);
    throw error;
  }
}

export async function autoGenerateCoachingContent(skillFocus, videoType) {
  try {
    // Generate coaching videos and resources automatically
    const content = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate coaching content package:
      
SkillFocus: ${skillFocus}
VideoType: ${videoType}

Generate:
1. Coaching video script (with Veo 3.1 generation prompts)
2. Practice exercises (3-5 specific drills)
3. Success checklist
4. Common mistakes to avoid
5. Quick reference guide
6. Resources (links, PDFs)
7. Feedback template`,
      response_json_schema: {
        type: 'object',
        properties: {
          videoScript: { type: 'string' },
          veoPrompt: { type: 'string' },
          exercises: { type: 'array', items: { type: 'string' } },
          checklist: { type: 'array', items: { type: 'string' } },
          mistakes: { type: 'array', items: { type: 'string' } },
          quickGuide: { type: 'string' },
          resources: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    return content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function setupAutomatedFeedbackLoop(userEmail, videoType) {
  try {
    // Setup continuous feedback collection and improvement loop
    const feedbackLoop = await base44.integrations.Core.InvokeLLM({
      prompt: `Setup automated feedback loop:
      
User: ${userEmail}
VideoType: ${videoType}

Create automated loop:
1. Post-meeting survey (immediate)
2. Self-assessment (24 hours)
3. Peer feedback (48 hours)
4. Gemini analysis (real-time)
5. Progress tracking (weekly)
6. Adaptive coaching adjustment (based on feedback)
7. Slack notifications with insights`,
    });

    return feedbackLoop;
  } catch (error) {
    console.error('Error setting up feedback loop:', error);
    throw error;
  }
}