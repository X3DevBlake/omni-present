import { base44 } from '@/api/base44Client';

/**
 * Gemini-Powered Financial Coaching Module
 * Behavioral analysis, anomaly detection, adaptive coaching plans
 */

/**
 * Analyze user financial behavior and generate coaching insights
 */
export async function analyzeBehaviorAndGenerateCoaching(userEmail, financialData, goalProgress) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze financial behavior and generate coaching plan:
      
      User: ${userEmail}
      Financial Data: ${JSON.stringify(financialData)}
      Goal Progress: ${JSON.stringify(goalProgress)}
      
      Analyze:
      1. Spending patterns and trends
      2. Savings discipline and consistency
      3. Investment decision quality
      4. Risk management behavior
      5. Goal alignment of actions
      6. Emotional spending triggers
      7. Knowledge gaps and learning opportunities
      
      Generate:
      1. Personalized coaching objectives (30-day focus)
      2. Specific behavioral nudges (daily/weekly)
      3. Educational content recommendations
      4. Motivational insights
      5. Celebration milestones
      6. Key metrics to track`,
      response_json_schema: {
        type: 'object',
        properties: {
          behaviorAnalysis: { type: 'object' },
          coachingObjectives: { type: 'array', items: { type: 'string' } },
          nudges: { type: 'array', items: { type: 'object' } },
          educationalContent: { type: 'array', items: { type: 'object' } },
          motivationalInsights: { type: 'array', items: { type: 'string' } },
          trackingMetrics: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error analyzing behavior:', error);
    throw error;
  }
}

/**
 * Detect anomalies in financial behavior
 */
export async function detectFinancialAnomalies(userEmail, transactions, patterns, planData) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Detect financial behavior anomalies:
      
      User: ${userEmail}
      Recent Transactions: ${JSON.stringify(transactions.slice(-20))}
      Historical Patterns: ${JSON.stringify(patterns)}
      Financial Plan: ${JSON.stringify(planData)}
      
      Identify:
      1. Unusual spending spikes
      2. Category deviations
      3. Savings shortfalls
      4. Investment behavior changes
      5. Risk-taking increases
      6. Goal-misaligned spending
      7. Emotional or stress-driven decisions
      
      For each: severity, likely cause, recommended intervention`,
      response_json_schema: {
        type: 'object',
        properties: {
          anomalies: { type: 'array', items: { type: 'object' } },
          anomalyScore: { type: 'number' },
          behaviorChangeDetected: { type: 'boolean' },
          likelyCauses: { type: 'array', items: { type: 'string' } },
          recommendedInterventions: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    throw error;
  }
}

/**
 * Generate proactive nudges based on behavior and goals
 */
export async function generateProactiveNudges(userEmail, behaviorProfile, upcomingGoals) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate proactive financial nudges:
      
      User: ${userEmail}
      Behavior Profile: ${JSON.stringify(behaviorProfile)}
      Upcoming Goals/Deadlines: ${JSON.stringify(upcomingGoals)}
      
      Create nudges for:
      1. Today's spending triggers (if any)
      2. Weekly savings reminder
      3. Goal progress celebration/warning
      4. Opportunity alerts (market conditions, investment chances)
      5. Learning moment (relevant financial education)
      6. Motivational message (personalized to user style)
      
      Each nudge: timing, channel (email/in-app), tone, call-to-action`,
      response_json_schema: {
        type: 'object',
        properties: {
          nudges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                message: { type: 'string' },
                timing: { type: 'string' },
                channel: { type: 'string' },
                callToAction: { type: 'string' },
                priority: { type: 'string' },
              },
            },
          },
          nextNudgeTime: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating nudges:', error);
    throw error;
  }
}

/**
 * Create adaptive coaching plan based on progress
 */
export async function createAdaptiveCoachingPlan(userEmail, currentProgress, goalData, coachingHistory) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create adaptive coaching plan:
      
      User: ${userEmail}
      Current Progress: ${JSON.stringify(currentProgress)}
      Goals: ${JSON.stringify(goalData)}
      Previous Coaching: ${JSON.stringify(coachingHistory)}
      
      Design plan that:
      1. Adapts to user's learning pace
      2. Increases difficulty/complexity as skills improve
      3. Addresses repeated failure points
      4. Celebrates wins and builds momentum
      5. Introduces new concepts progressively
      6. Adjusts tone based on emotional state
      7. Personalizes examples to user context
      
      Return: daily actions, weekly reviews, monthly assessments`,
      response_json_schema: {
        type: 'object',
        properties: {
          coachingPlan: { type: 'object' },
          dailyActions: { type: 'array', items: { type: 'string' } },
          weeklyReviews: { type: 'array', items: { type: 'object' } },
          monthlyAssessments: { type: 'array', items: { type: 'object' } },
          adaptationTriggers: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error creating coaching plan:', error);
    throw error;
  }
}

/**
 * Generate motivational messages based on user profile
 */
export async function generateMotivationalContent(userEmail, userPersonality, progress, challenges) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate motivational financial coaching content:
      
      User: ${userEmail}
      Personality/Style: ${JSON.stringify(userPersonality)}
      Recent Progress: ${JSON.stringify(progress)}
      Current Challenges: ${JSON.stringify(challenges)}
      
      Create:
      1. Motivational message (tailored to personality)
      2. Progress celebration (specific wins)
      3. Challenge reframe (turn obstacles into opportunities)
      4. Success story (relatable example)
      5. Next milestone excitement
      6. Accountability reminder
      
      Tone should match user preferences (analytical, emotional, humorous, etc)`,
      response_json_schema: {
        type: 'object',
        properties: {
          motivationalMessage: { type: 'string' },
          progressCelebration: { type: 'string' },
          challengeReframe: { type: 'string' },
          successStory: { type: 'string' },
          nextMilestoneMessage: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating motivational content:', error);
    throw error;
  }
}

export default {
  analyzeBehaviorAndGenerateCoaching,
  detectFinancialAnomalies,
  generateProactiveNudges,
  createAdaptiveCoachingPlan,
  generateMotivationalContent,
};