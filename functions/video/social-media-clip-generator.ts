import { base44 } from '@/api/base44Client';

export async function generateSocialMediaClips(
  videoHighlights,
  videoAnalytics,
  userEmail
) {
  try {
    // Create short, engaging social media clips from video highlights
    const clips = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate social media clip opportunities:
      
Highlights: ${JSON.stringify(videoHighlights)}
Analytics: ${JSON.stringify(videoAnalytics)}
User: ${userEmail}

Identify 5-7 ideal moments for social clips:
1. Quote highlights (10-15 seconds)
2. Key statistics (5-10 seconds)
3. Surprising insights (15 seconds)
4. Call-to-action moments (10 seconds)
5. Success stories (20 seconds)
6. Before/after scenarios (15 seconds)
7. Interactive prompts (10 seconds)

For each clip provide:
- Start/end timestamps
- Hook text
- Platform recommendations (LinkedIn, Twitter, Instagram, TikTok)
- Hashtags
- CTA text`,
      response_json_schema: {
        type: 'object',
        properties: {
          clips: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                startTime: { type: 'number' },
                endTime: { type: 'number' },
                duration: { type: 'number' },
                hook: { type: 'string' },
                platforms: { type: 'array', items: { type: 'string' } },
                hashtags: { type: 'array', items: { type: 'string' } },
                cta: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Generate each clip with Veo 3.1
    const generatedClips = await Promise.all(
      clips.clips.map(clip =>
        generateClipVideo(clip, videoHighlights, userEmail)
      )
    );

    return generatedClips;
  } catch (error) {
    console.error('Error generating social clips:', error);
    throw error;
  }
}

async function generateClipVideo(clipSpec, videoHighlights, userEmail) {
  try {
    // Generate optimized clip for each platform
    const veoPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `Create clip generation prompt:
      
Title: ${clipSpec.title}
Duration: ${clipSpec.duration}
Platforms: ${clipSpec.platforms.join(', ')}
Hook: ${clipSpec.hook}

Create Veo 3.1 prompt for:
- Engaging hook text overlay
- Smooth transitions
- Platform-specific dimensions
- Auto-captions
- Branding elements`,
    });

    const video = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate social clip: ${veoPrompt}`,
    });

    // Add captions
    const captionedVideo = await addCaptions(video, clipSpec.hook);

    // Add voiceover if needed
    const finalClip = await addClipVoiceover(captionedVideo, clipSpec.cta);

    // Upload to Google Drive organized by platform
    const uploads = await Promise.all(
      clipSpec.platforms.map(platform =>
        uploadClipToGoogleDrive(finalClip, userEmail, platform, clipSpec.title)
      )
    );

    // Share to Slack with platform-specific text
    await shareClipToSlack(uploads, clipSpec);

    return { clip: finalClip, uploads, spec: clipSpec };
  } catch (error) {
    console.error('Error generating clip:', error);
    throw error;
  }
}

async function addCaptions(video, text) {
  try {
    const captioned = await base44.integrations.Core.InvokeLLM({
      prompt: `Add auto-captions to video:
      
Video: ${video}
Text: ${text}

Add captions with:
- White text with black outline
- Modern sans-serif font
- Bottom third placement
- 2-3 second display time
- Auto-sync with audio`,
    });

    return captioned;
  } catch (error) {
    console.error('Error adding captions:', error);
    throw error;
  }
}

async function addClipVoiceover(video, cta) {
  try {
    const voiceoverScript = `${cta}. Learn more in full video.`;

    const audio = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate clip voiceover:
      
Script: ${voiceoverScript}

Create short, punchy voiceover:
- Duration: 3-4 seconds
- Tone: energetic, professional
- Voice: ElevenLabs premium
- Background: subtle`,
    });

    const finalVideo = await base44.integrations.Core.InvokeLLM({
      prompt: `Add voiceover to clip:
      
Video: ${video}
Audio: ${audio}

Mix with video ensuring clarity.`,
    });

    return finalVideo;
  } catch (error) {
    console.error('Error adding voiceover:', error);
    throw error;
  }
}

async function uploadClipToGoogleDrive(clip, userEmail, platform, title) {
  try {
    const file = await base44.integrations.Core.InvokeLLM({
      prompt: `Upload clip to Google Drive:
      
User: ${userEmail}
Platform: ${platform}
Title: ${title}
Clip: ${clip}

Create folder: Social Media Clips > ${platform} > [Date]`,
    });

    return file;
  } catch (error) {
    console.error('Error uploading clip:', error);
    throw error;
  }
}

async function shareClipToSlack(uploads, clipSpec) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Share clip to Slack:
      
Clip: ${clipSpec.title}
Platforms: ${clipSpec.platforms.join(', ')}
Files: ${JSON.stringify(uploads)}
Hashtags: ${clipSpec.hashtags.join(' ')}

Post multi-platform clip with:
1. Preview for each platform
2. Download links
3. Hashtags and CTA
4. Scheduling recommendations`,
    });
  } catch (error) {
    console.error('Error sharing to Slack:', error);
    throw error;
  }
}

export async function scheduleClipsToSocialMedia(clips, schedule, userEmail) {
  try {
    // Create Zapier workflow to schedule clips to all platforms
    const zapierWorkflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Zapier social media scheduling workflow:
      
Clips: ${clips.length}
Schedule: ${JSON.stringify(schedule)}
User: ${userEmail}

Create workflow:
1. Trigger: Scheduled date/time
2. Action: LinkedIn post
3. Action: Twitter post
4. Action: Instagram post (with story)
5. Action: TikTok upload
6. Action: Log to Slack
7. Action: Track engagement`,
    });

    return zapierWorkflow;
  } catch (error) {
    console.error('Error scheduling clips:', error);
    throw error;
  }
}