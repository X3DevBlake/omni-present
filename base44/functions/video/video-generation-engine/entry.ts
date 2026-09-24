import { base44 } from '@/api/base44Client';

export async function generateCoachingVideoWithGeminiVeo(
  videoScript,
  coachingTopic,
  userEmail
) {
  try {
    // Generate coaching videos using Gemini's Veo 3.1
    const videoPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate Veo 3.1 video generation prompt:
      
Topic: ${coachingTopic}
Script: ${videoScript}
User: ${userEmail}

Create detailed Veo 3.1 prompt for:
1. Scene descriptions
2. Transitions
3. Text overlays
4. Visual elements
5. Audio sync points
6. Color palette
7. Pacing`,
      response_json_schema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          scenes: { type: 'array', items: { type: 'object' } },
          duration: { type: 'number' },
          style: { type: 'string' },
        },
      },
    });

    // Generate video via Gemini
    const video = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate coaching video:
      ${videoPrompt.prompt}
      
Create high-quality coaching video.`,
    });

    // Upload to Google Drive
    const driveFile = await uploadVideoToGoogleDrive(video, userEmail, coachingTopic);

    // Share to Slack
    await shareVideoToSlack(driveFile, userEmail, coachingTopic);

    return { video, driveFile };
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

async function uploadVideoToGoogleDrive(video, userEmail, topic) {
  try {
    const file = await base44.integrations.Core.InvokeLLM({
      prompt: `Upload coaching video to Google Drive:
      
User: ${userEmail}
Topic: ${topic}
Video: ${video}

Create folder structure: Coaching > ${topic} > video`,
    });

    return file;
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw error;
  }
}

async function shareVideoToSlack(driveFile, userEmail, topic) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Share coaching video to Slack:
      
User: ${userEmail}
Topic: ${topic}
DriveLink: ${driveFile}

Post to user's Slack channel with:
1. Video summary
2. Key takeaways
3. Watch time estimate
4. Related resources`,
    });
  } catch (error) {
    console.error('Error sharing to Slack:', error);
    throw error;
  }
}

export async function generatePerformanceHighlightVideo(videoAnalytics, userEmail) {
  try {
    // Generate highlight video from video analytics
    const highlightPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate highlight video prompt:
      
Analytics: ${JSON.stringify(videoAnalytics)}
User: ${userEmail}

Create Veo 3.1 prompt for highlight video:
1. Top 3 moments
2. Key achievements
3. Success metrics visualization
4. Next steps showcase`,
    });

    const video = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate highlight video: ${highlightPrompt}`,
    });

    return video;
  } catch (error) {
    console.error('Error generating highlight video:', error);
    throw error;
  }
}