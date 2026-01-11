import { base44 } from '@/api/base44Client';

export async function predictMeetingOutcome(videoAnalytics, sessionConfig) {
  try {
    // Use Gemini to predict meeting outcomes based on real-time sentiment and engagement
    const prediction = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict meeting outcome based on analytics:
      
Type: ${sessionConfig.type}
Duration: ${sessionConfig.duration}
Participants: ${sessionConfig.participants?.length}
Engagement Score: ${videoAnalytics.engagement?.score}
Overall Sentiment: ${videoAnalytics.sentiment?.overall}
Sentiment per Participant: ${JSON.stringify(videoAnalytics.sentiment?.perParticipant)}
Tone Evolution: ${JSON.stringify(videoAnalytics.sentiment?.toneEvolution)}
Decision Density: ${videoAnalytics.performance?.decisionDensity}
Action Items Generated: ${videoAnalytics.performance?.actionItems}

Predict:
1. Likelihood of successful outcome (0-100%)
2. Key success factors present
3. Potential risks or blockers
4. Probability of follow-up needed
5. Expected resolution timeline
6. Confidence in prediction`,
      response_json_schema: {
        type: 'object',
        properties: {
          successProbability: { type: 'number', minimum: 0, maximum: 100 },
          successFactors: { type: 'array', items: { type: 'string' } },
          risks: { type: 'array', items: { type: 'string' } },
          followUpProbability: { type: 'number', minimum: 0, maximum: 100 },
          resolutionTimeline: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 100 },
          reasoning: { type: 'string' },
        },
      },
    });

    return prediction;
  } catch (error) {
    console.error('Error predicting meeting outcome:', error);
    throw error;
  }
}

export async function predictParticipantEngagement(participantData, videoAnalytics) {
  try {
    // Predict individual participant engagement and satisfaction
    const predictions = await Promise.all(
      participantData.map(participant =>
        base44.integrations.Core.InvokeLLM({
          prompt: `Predict engagement for participant ${participant.name}:
          
Speaking Time: ${participant.speakingTime || 0}%
Question Count: ${participant.questionCount || 0}
Sentiment: ${participant.sentiment}
Tone Changes: ${JSON.stringify(participant.toneChanges)}
Participation Level: ${participant.participationLevel}

Predict:
1. Engagement level (0-100)
2. Satisfaction score
3. Likelihood to act on decisions
4. Interest in follow-ups
5. Confidence in next steps`,
          response_json_schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              engagement: { type: 'number' },
              satisfaction: { type: 'number' },
              actionLikelihood: { type: 'number' },
              followUpInterest: { type: 'number' },
              confidence: { type: 'number' },
            },
          },
        })
      )
    );

    return predictions;
  } catch (error) {
    console.error('Error predicting participant engagement:', error);
    throw error;
  }
}

export async function predictOutcomeTimeline(prediction, videoData) {
  try {
    // Predict detailed timeline for meeting outcomes
    const timeline = await base44.integrations.Core.InvokeLLM({
      prompt: `Create outcome timeline prediction:
      
Meeting Type: ${videoData.type}
Success Probability: ${prediction.successProbability}%
Risks: ${JSON.stringify(prediction.risks)}
Resolution Timeline: ${prediction.resolutionTimeline}

Predict:
1. Immediate next steps (within 24 hours)
2. Short-term outcomes (1-7 days)
3. Medium-term outcomes (1-4 weeks)
4. Long-term outcomes (1-3 months)
5. Critical decision points
6. Risk mitigation timeline`,
      response_json_schema: {
        type: 'object',
        properties: {
          immediate: { type: 'array', items: { type: 'string' } },
          shortTerm: { type: 'array', items: { type: 'string' } },
          mediumTerm: { type: 'array', items: { type: 'string' } },
          longTerm: { type: 'array', items: { type: 'string' } },
          criticalPoints: { type: 'array', items: { type: 'string' } },
          riskMitigation: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return timeline;
  } catch (error) {
    console.error('Error predicting timeline:', error);
    throw error;
  }
}