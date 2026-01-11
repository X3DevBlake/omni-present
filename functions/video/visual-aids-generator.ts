import { base44 } from '@/api/base44Client';

export async function generateTrainingVisualAids(
  trainingTopic,
  audience,
  userEmail
) {
  try {
    // Generate personalized visual aids for training using Nano Banana
    const visualPrompts = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate visual aid prompts for training:
      
Topic: ${trainingTopic}
Audience: ${audience}
User: ${userEmail}

Create Nano Banana image generation prompts for:
1. Title slide visual
2. Key concept 1 (infographic style)
3. Key concept 2 (infographic style)
4. Process flow diagram
5. Summary/takeaway visual
6. Interactive element visual

Each visual should:
- Be professional and polished
- Match audience level (${audience})
- Use consistent color scheme
- Include relevant icons/illustrations
- Be easy to understand at a glance`,
      response_json_schema: {
        type: 'object',
        properties: {
          titleSlide: { type: 'string' },
          concept1: { type: 'string' },
          concept2: { type: 'string' },
          processFlow: { type: 'string' },
          summary: { type: 'string' },
          interactive: { type: 'string' },
          colorScheme: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Generate images with Nano Banana
    const images = await Promise.all([
      generateImage(visualPrompts.titleSlide),
      generateImage(visualPrompts.concept1),
      generateImage(visualPrompts.concept2),
      generateImage(visualPrompts.processFlow),
      generateImage(visualPrompts.summary),
      generateImage(visualPrompts.interactive),
    ]);

    // Create presentation with images
    const presentation = await createTrainingPresentation(images, trainingTopic, userEmail);

    return { images, presentation, visualPrompts };
  } catch (error) {
    console.error('Error generating visual aids:', error);
    throw error;
  }
}

async function generateImage(prompt) {
  try {
    const image = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate training visual with Nano Banana: ${prompt}`,
    });

    return image;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

async function createTrainingPresentation(images, topic, userEmail) {
  try {
    const presentation = await base44.integrations.Core.InvokeLLM({
      prompt: `Create training presentation in Google Slides:
      
User: ${userEmail}
Topic: ${topic}
Images: ${images.length} visuals

Create professional Google Slides presentation with:
1. Title slide (image 1)
2. Slide 1: Concept overview (image 2)
3. Slide 2: Deep dive (image 3)
4. Slide 3: Process/flow (image 4)
5. Slide 4: Key takeaways (image 5)
6. Slide 5: Interactive exercise (image 6)
7. Slide 6: Resources and next steps

Include speaker notes and transitions.`,
    });

    return presentation;
  } catch (error) {
    console.error('Error creating presentation:', error);
    throw error;
  }
}

export async function generateInteractiveTrainingModule(
  topic,
  objectives,
  userEmail
) {
  try {
    // Generate complete interactive training module with visuals
    const module = await base44.integrations.Core.InvokeLLM({
      prompt: `Create interactive training module:
      
Topic: ${topic}
Learning Objectives: ${objectives?.join(', ')}
User: ${userEmail}

Create module with:
1. Visual overview infographic
2. Interactive learning path diagrams
3. Quiz question visuals
4. Success criteria visuals
5. Certificate template
6. Resource guides with graphics

Generate using Nano Banana for all visuals.`,
    });

    return module;
  } catch (error) {
    console.error('Error creating training module:', error);
    throw error;
  }
}