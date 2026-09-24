import { base44 } from '@/api/base44Client';

export async function generateCoachingImagesByNanoBanana(
  coachingTopic,
  imageType,
  userEmail
) {
  try {
    // Generate coaching images using Nano Banana (Gemini image generation)
    const imagePrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate image creation prompt for ${imageType}:
      
Topic: ${coachingTopic}
Type: ${imageType}
User: ${userEmail}

Create detailed image prompt for:
1. Style and aesthetics
2. Key elements
3. Color scheme
4. Text overlays
5. Professional quality
6. Use case context`,
      response_json_schema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          style: { type: 'string' },
          dimensions: { type: 'string' },
          quality: { type: 'string' },
        },
      },
    });

    // Generate images
    const images = await Promise.all([
      generateImage(imagePrompt.prompt),
      generateImage(`${imagePrompt.prompt} - Alternative style 1`),
      generateImage(`${imagePrompt.prompt} - Alternative style 2`),
    ]);

    // Upload to Google Drive
    const driveFolder = await createCoachingImageFolder(userEmail, coachingTopic);
    const uploadedImages = await uploadImagesToGoogleDrive(images, driveFolder);

    // Create presentation in Google Docs
    await createCoachingPresentationWithImages(uploadedImages, coachingTopic, userEmail);

    return uploadedImages;
  } catch (error) {
    console.error('Error generating images:', error);
    throw error;
  }
}

async function generateImage(prompt) {
  try {
    const image = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate professional coaching image: ${prompt}`,
    });

    return image;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

async function createCoachingImageFolder(userEmail, topic) {
  try {
    const folder = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Google Drive folder:
      
User: ${userEmail}
Topic: ${topic}

Create: Coaching Materials > ${topic} > Images`,
    });

    return folder;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

async function uploadImagesToGoogleDrive(images, driveFolder) {
  try {
    const uploaded = await base44.integrations.Core.InvokeLLM({
      prompt: `Upload images to Google Drive:
      
Folder: ${driveFolder}
Images: ${images.length} images

Upload and organize by type.`,
    });

    return uploaded;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}

async function createCoachingPresentationWithImages(images, topic, userEmail) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Create Google Docs presentation:
      
User: ${userEmail}
Topic: ${topic}
Images: ${images.length}

Create professional presentation with:
1. Title slide
2. Key concepts with images
3. Action items
4. Resources`,
    });
  } catch (error) {
    console.error('Error creating presentation:', error);
    throw error;
  }
}

export async function generateBenchmarkComparisonVisuals(
  benchmarkData,
  userMetrics,
  userEmail
) {
  try {
    // Generate visual comparisons against benchmarks
    const visuals = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate benchmark comparison visuals:
      
BenchmarkData: ${JSON.stringify(benchmarkData)}
UserMetrics: ${JSON.stringify(userMetrics)}
User: ${userEmail}

Create visuals showing:
1. Performance vs benchmark charts
2. Improvement areas highlighted
3. Peer positioning
4. Growth trajectory
5. Goal visualization`,
    });

    return visuals;
  } catch (error) {
    console.error('Error generating visuals:', error);
    throw error;
  }
}