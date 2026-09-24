import { base44 } from '@/api/base44Client';

export async function processVideoStream(streamData, userEmail) {
  try {
    // Simultaneously handle multiple video processing tasks
    const [transcription, analysis, metadata] = await Promise.all([
      transcribeVideoStream(streamData),
      analyzeVideoContent(streamData),
      extractVideoMetadata(streamData),
    ]);

    // Generate comprehensive video report
    const report = await base44.integrations.Core.InvokeLLM({
      prompt: `Create comprehensive video processing report:
      
Transcription: ${transcription}
Content Analysis: ${JSON.stringify(analysis)}
Metadata: ${JSON.stringify(metadata)}
User: ${userEmail}

Generate:
1. Sentiment analysis
2. Key topics extracted
3. Action items identified
4. Follow-up recommendations
5. AI-generated highlights`,
      response_json_schema: {
        type: 'object',
        properties: {
          sentiment: { type: 'string' },
          topics: { type: 'array', items: { type: 'string' } },
          actionItems: { type: 'array', items: { type: 'object' } },
          highlights: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' },
        },
      },
    });

    return { transcription, analysis, metadata, report };
  } catch (error) {
    console.error('Error processing video stream:', error);
    throw error;
  }
}

async function transcribeVideoStream(streamData) {
  try {
    const transcription = await base44.integrations.Core.InvokeLLM({
      prompt: `Transcribe video content:
      
Duration: ${streamData.duration}
Format: ${streamData.format}
Content Type: ${streamData.type}

Provide full transcript with timestamps.`,
      add_context_from_internet: true,
    });

    return transcription;
  } catch (error) {
    console.error('Error transcribing:', error);
    throw error;
  }
}

async function analyzeVideoContent(streamData) {
  try {
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze video content:
      
Type: ${streamData.type}
Duration: ${streamData.duration}
Participants: ${streamData.participants?.join(', ')}

Extract:
1. Main topics discussed
2. Decisions made
3. Questions raised
4. Emotional tone
5. Engagement level`,
      response_json_schema: {
        type: 'object',
        properties: {
          topics: { type: 'array', items: { type: 'string' } },
          decisions: { type: 'array', items: { type: 'string' } },
          questions: { type: 'array', items: { type: 'string' } },
          tone: { type: 'string' },
          engagement: { type: 'number' },
        },
      },
    });

    return analysis;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

async function extractVideoMetadata(streamData) {
  try {
    return {
      id: streamData.id,
      duration: streamData.duration,
      format: streamData.format,
      quality: streamData.quality || 'auto',
      participants: streamData.participants || [],
      startTime: new Date(),
      endTime: new Date(Date.now() + streamData.duration * 1000),
      fileSize: streamData.fileSize || 0,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw error;
  }
}

export async function batchProcessVideos(videoIds, userEmail) {
  try {
    const results = await Promise.all(
      videoIds.map(id => 
        base44.integrations.Core.InvokeLLM({
          prompt: `Process video ${id} for user ${userEmail}`,
        })
      )
    );

    return results;
  } catch (error) {
    console.error('Error batch processing videos:', error);
    throw error;
  }
}

export async function generateVideoHighlights(videoData) {
  try {
    const highlights = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate video highlights:
      
Video: ${videoData.title}
Duration: ${videoData.duration}
Transcript: ${videoData.transcript}

Create:
1. Top 3 moments (with timestamps)
2. Key quotes
3. Visual summary points
4. Recommended clips (30s each)`,
      response_json_schema: {
        type: 'object',
        properties: {
          topMoments: { type: 'array', items: { type: 'object' } },
          keyQuotes: { type: 'array', items: { type: 'string' } },
          summary: { type: 'array', items: { type: 'string' } },
          clips: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    return highlights;
  } catch (error) {
    console.error('Error generating highlights:', error);
    throw error;
  }
}