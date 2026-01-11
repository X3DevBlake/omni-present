import { base44 } from '@/api/base44Client';

export async function generateVideoAnalytics(videoId, videoData) {
  try {
    // Generate comprehensive video analytics and insights
    const [engagement, sentiment, performance] = await Promise.all([
      analyzeEngagement(videoData),
      analyzeSentiment(videoData),
      analyzePerformance(videoData),
    ]);

    const analytics = {
      videoId,
      engagement,
      sentiment,
      performance,
      timestamp: new Date(),
    };

    // Save analytics
    await base44.integrations.Core.InvokeLLM({
      prompt: `Save video analytics:
      
VideoID: ${videoId}
Analytics: ${JSON.stringify(analytics)}

Store in database and create visualizations.`,
    });

    return analytics;
  } catch (error) {
    console.error('Error generating analytics:', error);
    throw error;
  }
}

async function analyzeEngagement(videoData) {
  try {
    const engagement = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze video engagement:
      
Duration: ${videoData.duration}
Participants: ${videoData.participants?.length}
Transcript: ${videoData.transcript}

Calculate:
1. Speaker participation percentage
2. Conversation flow
3. Question frequency
4. Decision density
5. Engagement score`,
      response_json_schema: {
        type: 'object',
        properties: {
          participation: { type: 'object' },
          conversationFlow: { type: 'number' },
          questionFreq: { type: 'number' },
          decisionDensity: { type: 'number' },
          score: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
    });

    return engagement;
  } catch (error) {
    console.error('Error analyzing engagement:', error);
    throw error;
  }
}

async function analyzeSentiment(videoData) {
  try {
    const sentiment = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze video sentiment:
      
Transcript: ${videoData.transcript}
Duration: ${videoData.duration}

Analyze:
1. Overall sentiment (positive/neutral/negative)
2. Sentiment per participant
3. Tone evolution
4. Emotional highlights
5. Concern areas`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall: { type: 'string' },
          perParticipant: { type: 'object' },
          toneEvolution: { type: 'array', items: { type: 'object' } },
          highlights: { type: 'array', items: { type: 'string' } },
          concerns: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return sentiment;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}

async function analyzePerformance(videoData) {
  try {
    const performance = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze video performance:
      
Type: ${videoData.type}
Duration: ${videoData.duration}
Participants: ${videoData.participants?.length}

Metrics:
1. Efficiency (time vs outcomes)
2. Clarity (topic focus)
3. Action items generated
4. Decision quality
5. Follow-up potential`,
      response_json_schema: {
        type: 'object',
        properties: {
          efficiency: { type: 'number' },
          clarity: { type: 'number' },
          actionItems: { type: 'number' },
          decisionQuality: { type: 'number' },
          followUpPotential: { type: 'number' },
        },
      },
    });

    return performance;
  } catch (error) {
    console.error('Error analyzing performance:', error);
    throw error;
  }
}

export async function generateVideoInsights(videoAnalytics) {
  try {
    // Generate AI insights from analytics
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate video insights:
      
Analytics: ${JSON.stringify(videoAnalytics)}

Provide:
1. Key insights
2. Recommendations
3. Improvement areas
4. Best practices identified
5. Comparison to similar videos`,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } },
          bestPractices: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}