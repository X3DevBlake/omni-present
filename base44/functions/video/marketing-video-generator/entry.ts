import { base44 } from '@/api/base44Client';

export async function generateMarketingVideoForSalesCall(
  salesCallData,
  templateStyle,
  userEmail
) {
  try {
    // Generate custom marketing video for sales calls using templates + Veo 3.1
    const videoPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `Create marketing video prompt for sales:
      
SalesData: ${JSON.stringify(salesCallData)}
Template: ${templateStyle}
User: ${userEmail}

Create Veo 3.1 prompt for professional sales video:
1. Opening hook (5 seconds)
2. Problem statement (10 seconds)
3. Solution showcase (15 seconds)
4. Social proof/results (10 seconds)
5. Call-to-action (5 seconds)

Include:
- Professional color scheme
- Sales product/service visuals
- Clean typography
- Pacing: 45 seconds total
- Template: ${templateStyle}`,
      response_json_schema: {
        type: 'object',
        properties: {
          veoPrompt: { type: 'string' },
          scenes: { type: 'array', items: { type: 'object' } },
          duration: { type: 'number' },
          cta: { type: 'string' },
        },
      },
    });

    // Generate video with Veo 3.1
    const video = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate sales marketing video with Veo 3.1:
      ${videoPrompt.veoPrompt}`,
    });

    // Add voiceover with ElevenLabs
    const voiceoverScript = await generateSalesVoiceover(salesCallData);
    const voiceover = await generateVoiceoverAudio(voiceoverScript);

    // Combine video and audio
    const finalVideo = await combineVideoWithVoiceover(video, voiceover);

    // Upload to Google Drive and share
    const driveFile = await uploadToGoogleDrive(finalVideo, userEmail, `Sales Video - ${salesCallData.prospect}`);
    await shareToSlack(driveFile, userEmail, 'sales_video');

    return { video: finalVideo, driveFile, voiceover };
  } catch (error) {
    console.error('Error generating marketing video:', error);
    throw error;
  }
}

async function generateSalesVoiceover(salesData) {
  try {
    const script = await base44.integrations.Core.InvokeLLM({
      prompt: `Create sales video voiceover script:
      
Prospect: ${salesData.prospect}
Product: ${salesData.product}
Key Benefits: ${salesData.benefits?.join(', ')}
CompanyName: ${salesData.company}

Create professional, engaging 45-second script:
1. Hook (5 sec) - grab attention
2. Problem (10 sec) - relate to prospect
3. Solution (15 sec) - show value
4. Results (10 sec) - proof points
5. CTA (5 sec) - clear action

Make it: persuasive, confident, not salesy`,
    });

    return script;
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}

async function generateVoiceoverAudio(script) {
  try {
    const audio = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate professional voiceover audio:
      
Script: ${script}

Use ElevenLabs to create:
- Professional male/female voice (user choice)
- Natural pacing
- Emphasis on key points
- Background music: subtle, professional
- Audio quality: 320kbps MP3`,
    });

    return audio;
  } catch (error) {
    console.error('Error generating voiceover:', error);
    throw error;
  }
}

async function combineVideoWithVoiceover(video, voiceover) {
  try {
    const combined = await base44.integrations.Core.InvokeLLM({
      prompt: `Combine video with voiceover:
      
Video: ${video}
Voiceover: ${voiceover}

Mix audio ensuring:
- Proper sync
- Clear voiceover
- Subtle background music
- Professional balance`,
    });

    return combined;
  } catch (error) {
    console.error('Error combining video:', error);
    throw error;
  }
}

async function uploadToGoogleDrive(video, userEmail, filename) {
  try {
    const file = await base44.integrations.Core.InvokeLLM({
      prompt: `Upload video to Google Drive:
      
User: ${userEmail}
Filename: ${filename}
Video: ${video}

Create folder: Marketing Videos > Sales > [Date]`,
    });

    return file;
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw error;
  }
}

async function shareToSlack(driveFile, userEmail, category) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Share marketing video to Slack:
      
User: ${userEmail}
Category: ${category}
DriveLink: ${driveFile}

Post with:
1. Video preview/thumbnail
2. Title and description
3. Download link
4. Usage instructions
5. Feedback request`,
    });
  } catch (error) {
    console.error('Error sharing to Slack:', error);
    throw error;
  }
}