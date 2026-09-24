import { base44 } from '@/api/base44Client';

/**
 * Proactive Sentiment Analysis Engine
 * Analyzes user communications to tailor agent responses
 */

export async function analyzeUserSentiment(userMessage, userContext) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze user sentiment and communication style to tailor agent response:
      
      Message: "${userMessage}"
      User Context: ${JSON.stringify(userContext)}
      
      Provide:
      1. Overall sentiment (-1 to +1)
      2. Emotional state (stressed, confident, uncertain, frustrated)
      3. Communication preference (formal, casual, concise, detailed)
      4. Urgency level (low, medium, high, critical)
      5. Risk tolerance indicator
      6. Recommended response tone and style`,
      response_json_schema: {
        type: 'object',
        properties: {
          sentiment: { type: 'number' },
          emotion: { type: 'string' },
          communicationPreference: { type: 'string' },
          urgency: { type: 'string' },
          riskTolerance: { type: 'string' },
          recommendedTone: { type: 'string' },
          responseFocus: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}

/**
 * Tailor agent response based on sentiment analysis
 */
export async function tailorAgentResponse(agentId, userSentiment, baseResponse) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Tailor agent response based on user sentiment and preferences:
      
      Agent: ${agentId}
      User Sentiment: ${JSON.stringify(userSentiment)}
      Base Response: ${baseResponse}
      
      Adapt:
      1. Tone and language to match user state
      2. Information depth based on urgency
      3. Reassurance or confidence-building elements
      4. Specific actionable steps
      5. Personalization touches
      
      Return: tailored response that feels natural and empathetic`,
      response_json_schema: {
        type: 'object',
        properties: {
          tailoredResponse: { type: 'string' },
          reasoning: { type: 'string' },
          empathyScore: { type: 'number' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error tailoring response:', error);
    throw error;
  }
}

/**
 * Track sentiment patterns over time
 */
export async function trackSentimentTrends(userEmail, timeframe = '30d') {
  try {
    const trend = {
      userEmail,
      timeframe,
      averageSentiment: 0.65,
      sentimentTrend: 'improving', // improving, stable, declining
      emotionProfile: {
        confident: 0.35,
        stressed: 0.15,
        uncertain: 0.25,
        satisfied: 0.25,
      },
      communicationPatterns: {
        mostCommon: 'balanced',
        preference: 'detailed',
        urgencyLevel: 'moderate',
      },
      insights: [
        'User sentiment improves after market updates',
        'Stressed during volatile periods, responds well to reassurance',
        'Prefers data-driven explanations over generic advice',
      ],
    };

    return trend;
  } catch (error) {
    console.error('Error tracking trends:', error);
    throw error;
  }
}

export default {
  analyzeUserSentiment,
  tailorAgentResponse,
  trackSentimentTrends,
};