import { base44 } from '@/api/base44Client';

/**
 * AI-Powered Financial Coaching
 * Personalized advice on budgeting, saving, debt, planning with interactive Q&A
 */

/**
 * Generate personalized financial coaching plan
 */
export async function generateCoachingPlan(userEmail, userData) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a personalized financial coaching plan:
      
      User: ${userEmail}
      Data: ${JSON.stringify(userData)}
      
      Develop:
      1. Budget optimization plan
      2. Saving strategy with targets
      3. Debt payoff roadmap (if applicable)
      4. Emergency fund recommendations
      5. Retirement planning milestones
      6. Investment readiness assessment
      7. 90-day quick wins
      8. 1-year goals
      9. 5-year vision
      10. Motivational framework`,
      response_json_schema: {
        type: 'object',
        properties: {
          budgetPlan: { type: 'object' },
          savingStrategy: { type: 'object' },
          debtPayoff: { type: 'object' },
          emergencyFund: { type: 'string' },
          retirementPlan: { type: 'object' },
          investmentReadiness: { type: 'string' },
          quickWins: { type: 'array', items: { type: 'string' } },
          oneYearGoals: { type: 'array', items: { type: 'string' } },
          fiveYearVision: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating coaching plan:', error);
    throw error;
  }
}

/**
 * Interactive financial Q&A
 */
export async function answerFinancialQuestion(userEmail, question, userContext) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Answer this financial question with personalized advice:
      
      User: ${userEmail}
      Question: "${question}"
      Context: ${JSON.stringify(userContext)}
      
      Provide:
      1. Direct answer
      2. Personalized explanation
      3. Action steps
      4. Common mistakes to avoid
      5. Follow-up resources
      
      Be empathetic and encouraging`,
      response_json_schema: {
        type: 'object',
        properties: {
          answer: { type: 'string' },
          explanation: { type: 'string' },
          actionSteps: { type: 'array', items: { type: 'string' } },
          mistakesToAvoid: { type: 'array', items: { type: 'string' } },
          resources: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
  }
}

/**
 * Track progress toward financial goals
 */
export async function trackFinancialProgress(userEmail, goal, currentData) {
  try {
    const progress = {
      goalId: goal.id,
      userId: userEmail,
      targetAmount: goal.target_amount,
      currentAmount: currentData.currentAmount,
      progressPercent: (currentData.currentAmount / goal.target_amount) * 100,
      deadline: goal.deadline,
      daysRemaining: Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)),
      monthlyRequirement: (goal.target_amount - currentData.currentAmount) / Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)),
      onTrack: true,
      lastUpdated: new Date().toISOString(),
    };

    return progress;
  } catch (error) {
    console.error('Error tracking progress:', error);
    throw error;
  }
}

/**
 * Generate motivational nudges
 */
export async function generateMotivationalNudge(userEmail, progress, goals) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a motivational financial nudge:
      
      User: ${userEmail}
      Progress: ${JSON.stringify(progress)}
      Goals: ${JSON.stringify(goals)}
      
      Create:
      1. Personalized encouragement
      2. Progress celebration
      3. Next milestone
      4. Small action to take today
      5. Why it matters
      
      Tone: supportive, positive, empowering`,
      response_json_schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          milestone: { type: 'string' },
          actionToday: { type: 'string' },
          whyItMatters: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating nudge:', error);
    throw error;
  }
}

/**
 * Get personalized advice on specific topic
 */
export async function getCoachingAdvice(userEmail, topic, userData) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide personalized coaching advice on ${topic}:
      
      User: ${userEmail}
      Data: ${JSON.stringify(userData)}
      
      Cover:
      1. Current situation assessment
      2. Key issues/opportunities
      3. Best practices
      4. Specific recommendations
      5. Implementation timeline
      6. Expected benefits
      7. Potential challenges
      8. Resources needed`,
      response_json_schema: {
        type: 'object',
        properties: {
          assessment: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
          timeline: { type: 'string' },
          benefits: { type: 'array', items: { type: 'string' } },
          challenges: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error getting advice:', error);
    throw error;
  }
}

export default {
  generateCoachingPlan,
  answerFinancialQuestion,
  trackFinancialProgress,
  generateMotivationalNudge,
  getCoachingAdvice,
};